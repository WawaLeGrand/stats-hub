"""Weekly Telegram summary: every Monday morning (Paris time), the numbers of the last 7 days.

If the hub was off on Monday morning, the summary goes out the next time it runs that week (once per week).
"""
from datetime import datetime, timedelta

from . import alerts, db, stats
from .messages import msg

TZ = stats.TZ
SEND_WEEKDAY, SEND_HOUR = 0, 9  # Monday, 09:00 Paris

MONTHS = {
    "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "fr": ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
}


def enabled():
    return bool(alerts._settings().get("digest", True))


def set_enabled(value):
    conf = alerts._settings()
    conf["digest"] = bool(value)
    alerts._save_settings(conf)


def compact(n, lang):
    """12 345 -> '12.3K' / '12,3 k'."""
    if n is None:
        return "–"
    a = abs(n)
    if a >= 1e6:
        value, unit = n / 1e6, "M"
    elif a >= 1e3:
        value, unit = n / 1e3, ("k" if lang == "fr" else "K")
    else:
        return f"{round(n):,}".replace(",", " " if lang == "fr" else ",")
    text = f"{value:.1f}".rstrip("0").rstrip(".")
    if lang == "fr":
        text = text.replace(".", ",")
    return f"{text} {unit}" if lang == "fr" else f"{text}{unit}"


def _signed(n, lang):
    return ("+" if n >= 0 else "−") + compact(abs(n), lang)


def _change(now, before, lang):
    if before in (None, 0) or now is None:
        return ""
    r = (now - before) / before
    arrow = "↑" if r >= 0 else "↓"
    pct = f"{abs(r) * 100:.0f}"
    return f" ({arrow} {pct} % {msg('digest.vs', lang)})" if lang == "fr" else f" ({arrow} {pct}% {msg('digest.vs', lang)})"


def week_key(now):
    year, week, _ = now.isocalendar()
    return f"{year}-W{week:02d}"


def due(now, last_sent_week, since=None):
    """True once per week, from Monday 09:00 on.

    since: when the summary was first switched on. A Monday morning that passed before that moment doesn't
    count, so the first summary arrives on the next Monday instead of right away in the middle of a week.
    """
    monday = (now - timedelta(days=now.weekday())).replace(hour=SEND_HOUR, minute=0, second=0, microsecond=0)
    if since is not None and monday <= since:
        return False
    return now >= monday and last_sent_week != week_key(now)


def _date_range(now, lang):
    end = (now - timedelta(days=1)).date()
    start = end - timedelta(days=6)
    m = MONTHS[lang]
    if lang == "fr":
        return f"du {start.day} {m[start.month - 1]} au {end.day} {m[end.month - 1]}" if start.month != end.month \
            else f"du {start.day} au {end.day} {m[end.month - 1]}"
    return f"{start.day} {m[start.month - 1]} – {end.day} {m[end.month - 1]}" if start.month != end.month \
        else f"{start.day}–{end.day} {m[end.month - 1]}"


def build(con, lang, now=None):
    """The summary text for the last 7 days, all accounts."""
    now = now or datetime.now(TZ)
    o = stats.overview(con, 7, "all", "all")
    k, prev = o["kpis"], o["kpis"].get("previous") or {}
    lines = [msg("digest.head", lang, range=_date_range(now, lang)),
             msg("digest.followers", lang, followers=compact(k["followers"], lang), growth=_signed(k["growth"], lang)),
             msg("digest.views", lang, views=compact(k["views"], lang) + _change(k["views"], prev.get("views"), lang)),
             msg("digest.engagement", lang, engagement=(f"{k['engagement'] * 100:.1f}".replace(".", "," if lang == "fr" else ".") + (" %" if lang == "fr" else "%"))
                 if k["engagement"] is not None else "–"),
             msg("digest.posts", lang, posts=k["posts"])]
    top = stats.top_posts(con, 7, "all", "all", "views", 1)["posts"]
    if top:
        p = top[0]
        lines.append(msg("digest.top", lang, title=p["title"] or "–", handle=p["handle"],
                         platform="TikTok" if p["platform"] == "tiktok" else "Instagram", views=compact(p["views"], lang)))
    accounts = [a for a in o["accounts"] if a["growth_7"] is not None]
    if accounts:
        best = max(accounts, key=lambda a: a["growth_7"])
        if best["growth_7"] > 0:
            lines.append(msg("digest.best", lang, handle=best["handle"],
                             platform="TikTok" if best["platform"] == "tiktok" else "Instagram",
                             growth=_signed(best["growth_7"], lang)))
    return "\n".join(lines)


def tick(path=None, now=None):
    """Called regularly by the hub: sends the summary when it's time. Returns True when sent."""
    if not enabled() or not alerts.status()["connected"] or alerts.handled_by_cloud():
        return False
    now = now or datetime.now(TZ)
    con = db.connect(path or db.HUB_DB)
    try:
        since = db.get_meta(con, "digest_since")
        if since is None:  # first time the summary is active: remember when
            since = now.isoformat(timespec="seconds")
            db.set_meta(con, "digest_since", since)
            con.commit()
        if not due(now, db.get_meta(con, "digest_week"), datetime.fromisoformat(since)):
            return False
        if not alerts._try_send(build(con, alerts.language(), now)):
            return False
        db.set_meta(con, "digest_week", week_key(now))
        con.commit()
        return True
    finally:
        con.close()


def send_now(path=None):
    """The Settings button: send this week's summary right away (doesn't change the Monday schedule)."""
    con = db.connect(path or db.HUB_DB)
    try:
        text = build(con, alerts.language())
    finally:
        con.close()
    if not alerts.send(text):
        raise alerts.AlertError("not_connected")
    return text
