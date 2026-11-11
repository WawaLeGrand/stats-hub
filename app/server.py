"""The local web server: serves the dashboard page (also installable on a phone) and the JSON it reads."""
import csv
import io
import json
import threading
import time
from contextlib import closing
from datetime import datetime
from urllib.parse import urlparse

from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import alerts, channels, db, digest, remote, stats, sync, webapp
from .messages import HubError, lang_of, msg

STATIC = db.ROOT / "static"

app = FastAPI(title="Stats Hub", docs_url=None, redoc_url=None, openapi_url=None)
app.mount("/static", StaticFiles(directory=STATIC), name="static")

settings = {"db": db.HUB_DB, "demo": False, "port": 8000}


@app.middleware("http")
async def same_origin_only(request: Request, call_next):
    """Only requests addressed to this computer by name (or to its Tailscale name) are answered, so a website
    can't reach the hub by pointing its own domain at 127.0.0.1. Changes (add a key, remove a channel, sync)
    may only come from the dashboard page itself, never from another website open in the same browser."""
    allowed = remote.cached_hosts()
    host = (urlparse("//" + request.headers.get("host", "")).hostname or "").lower()
    if host not in allowed:
        return JSONResponse({"detail": "Forbidden"}, status_code=403)
    if request.method not in ("GET", "HEAD"):
        origin = request.headers.get("origin")
        if origin and (urlparse(origin).hostname or "").lower() not in allowed:
            return JSONResponse({"detail": "Forbidden"}, status_code=403)
    response = await call_next(request)
    if request.url.path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-cache"  # always check for a newer page after an update
    return response


Days = Query(30, ge=1, le=366)
Lang = Header("en", alias="x-lang")  # the language chosen on the page


@app.exception_handler(HubError)
async def hub_error(request: Request, e: HubError):
    """Every coded error goes back to the page in its language."""
    return JSONResponse({"detail": e.text(lang_of(request.headers.get("x-lang")))}, status_code=400)


def configure(path, demo, port=8000):
    settings.update(db=path, demo=demo, port=port)


def _con():
    return closing(db.connect(settings["db"]))


static_version = webapp.static_version


# ---------- the page, installable as an app ----------
@app.get("/")
def index():
    return FileResponse(STATIC / "index.html", headers={"Cache-Control": "no-store"})


@app.get("/manifest.webmanifest")
def manifest():
    return Response(json.dumps(webapp.manifest()), media_type="application/manifest+json", headers={"Cache-Control": "no-cache"})


@app.get("/sw.js")
def service_worker():
    return Response(webapp.service_worker(), media_type="application/javascript", headers={"Cache-Control": "no-cache"})


@app.get("/cloud-config.js")
def cloud_config():
    """On this PC the page talks to this server. The online version replaces this file with its own settings."""
    return Response("window.HUB_CLOUD = null;\n", media_type="application/javascript", headers={"Cache-Control": "no-cache"})


# ---------- status & sync ----------
@app.get("/api/meta")
def meta(lang: str = Lang):
    with _con() as con:
        count = con.execute("SELECT COUNT(*) FROM accounts WHERE active = 1").fetchone()[0]
        errors = json.loads(db.get_meta(con, "sync_errors", "[]"))
        return {"demo": settings["demo"], "accounts": count, "groups": stats.groups(con),
                "last_sync": db.get_meta(con, "last_sync"),
                "sync_errors": [{"channel": e["channel"], "error": alerts.error_text(e, lang_of(lang))} for e in errors],
                "syncing": sync.running(), "can_sync": not settings["demo"] and bool(sync.zernio_keys()),
                "lang": None if settings["demo"] else alerts.saved_language(), "version": static_version()}


class LanguageChoice(BaseModel):
    lang: str


@app.post("/api/language")
def set_language(body: LanguageChoice):
    """Saved on this computer: the Telegram alerts use it too. The demo never changes your settings."""
    if settings["demo"]:
        return {"lang": lang_of(body.lang)}
    alerts.set_language(body.lang)
    return {"lang": alerts.language()}


@app.post("/api/sync")
def start_sync():
    if settings["demo"]:
        raise HubError("demo_sync")
    _sync_in_background()
    return {"started": True}


def _sync_in_background():
    def after_current():  # a sync already running may have started before a channel was just added
        while sync.running():
            time.sleep(2)
        sync.run()
    threading.Thread(target=after_current, daemon=True).start()


# ---------- channels ----------
class NewChannel(BaseModel):
    name: str
    key: str
    repo: str | None = None


@app.get("/api/channels")
def list_channels():
    if settings["demo"]:
        return {"channels": [], "demo": True}
    with _con() as con:
        return {"channels": channels.list_channels(con), "demo": False}


@app.post("/api/channels")
def add_channel(body: NewChannel):
    if settings["demo"]:
        raise HubError("demo_channels")
    added = channels.add(body.name, body.key, body.repo)
    _sync_in_background()
    return added


@app.delete("/api/channels/{label}")
def remove_channel(label: str):
    if settings["demo"]:
        raise HubError("demo_channels")
    with _con() as con:
        channels.remove(con, label)
    return {"removed": label.upper()}


# ---------- Telegram alerts & weekly summary ----------
class AlertSetup(BaseModel):
    token: str | None = None


def _no_demo():
    if settings["demo"]:
        raise HubError("demo_alerts")


@app.get("/api/alerts")
def alerts_status():
    if settings["demo"]:  # the demo never shows your real bot or chat
        return {"configured": False, "bot": None, "chat": None, "connected": False, "digest": True, "demo": True}
    return {**alerts.status(), "digest": digest.enabled(), "demo": False}


@app.post("/api/alerts")
def alerts_connect(body: AlertSetup):
    _no_demo()
    return {**alerts.connect(body.token), "digest": digest.enabled()}


@app.post("/api/alerts/test")
def alerts_test():
    _no_demo()
    if not alerts.send(msg("alert_test", alerts.language())):
        raise HubError("not_connected")
    return {"sent": True}


@app.delete("/api/alerts")
def alerts_off():
    _no_demo()
    alerts.disconnect()
    return {**alerts.status(), "digest": digest.enabled()}


class DigestChoice(BaseModel):
    enabled: bool


@app.post("/api/digest")
def digest_toggle(body: DigestChoice):
    _no_demo()
    digest.set_enabled(body.enabled)
    return {"digest": digest.enabled()}


@app.post("/api/digest/send")
def digest_send():
    _no_demo()
    return {"sent": True, "text": digest.send_now(settings["db"])}


# ---------- phone access (Tailscale) ----------
@app.get("/api/phone")
def phone_status(fresh: bool = False):
    return {**remote.status(settings["port"], fresh=fresh), "demo": settings["demo"]}


@app.post("/api/phone/enable")
def phone_enable():
    if settings["demo"]:
        raise HubError("demo_phone")
    ok, detail = remote.enable(settings["port"])
    if not remote.binary():
        raise HubError("tailscale_missing")
    if not ok:
        raise HubError("tailscale_failed", detail=detail[-400:] or "?")
    return remote.status(settings["port"], fresh=True)


# ---------- numbers ----------
@app.get("/api/overview")
def overview(days: int = Days, platform: str = "all", group: str = "all"):
    with _con() as con:
        return stats.overview(con, days, platform, group)


@app.get("/api/posts")
def posts(days: int = Days, platform: str = "all", group: str = "all", sort: str = "views", category: str = ""):
    with _con() as con:
        return stats.top_posts(con, days, platform, group, sort, category=category or None)


@app.get("/api/post/{post_id}")
def post(post_id: str):
    with _con() as con:
        data = stats.post_detail(con, post_id)
    if data is None:
        raise HTTPException(404, "Post not found")
    return data


@app.get("/api/insights")
def insights(days: int = Days, platform: str = "all", group: str = "all"):
    with _con() as con:
        return stats.insights(con, days, platform, group)


@app.get("/api/account/{account_id}")
def account(account_id: str, days: int = Days, lang: str = Lang):
    with _con() as con:
        data = stats.account(con, account_id, days)
    if data is None:
        raise HTTPException(404, msg("account_missing", lang_of(lang)))
    return data


def _csv_safe(value):
    """Spreadsheets run cells that start with = + - @ as formulas: a post title must stay text."""
    if isinstance(value, str) and value[:1] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + value
    return "" if value is None else value


@app.get("/api/export.csv")
def export_csv(days: int = Days, platform: str = "all", group: str = "all", lang: str = "en"):
    with _con() as con:
        columns, rows = stats.export_rows(con, days, platform, group)
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";" if lang_of(lang) == "fr" else ",", lineterminator="\r\n")
    writer.writerow(columns)
    for row in rows:
        writer.writerow([_csv_safe(v) for v in row])
    name = f"stats-hub-posts-{datetime.now().date().isoformat()}.csv"
    return PlainTextResponse("﻿" + out.getvalue(), media_type="text/csv; charset=utf-8",
                             headers={"Content-Disposition": f'attachment; filename="{name}"'})
