"""The online version: what GitHub runs every 15 minutes (.github/workflows/cloud.yml), and its setup on the PC.

On GitHub:
    python tools/cloud.py prepare        writes .env / channels.json / settings.json from the secrets, fetches each
                                          channel's topic files (for categories)
    python tools/cloud.py sync           syncs from Zernio, Telegram alerts and weekly summary, prunes old curves
    python tools/cloud.py bundle <file>  the numbers the page needs (encrypted by tools/crypto.mjs right after)
    python tools/cloud.py site <dir>     the page, ready to publish

On the PC (once):
    python tools/cloud.py setup          writes cloud-setup/2-HUB_CONFIG.txt (channels + Telegram chat, no key)

Logs of a public repository can be read by anyone: nothing here prints a channel name, a handle or a number.
"""
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app import alerts, bundle, db, digest, sync, webapp  # noqa: E402

REPOS = ROOT / "repos"
CHANNEL_FILES = ("topics.json", "state.json", "posts_log.jsonl")
CURVES_KEEP_DAYS = 120  # growth curves of older posts are dropped from the saved database (their numbers stay)
WORKFLOW = "cloud.yml"


def prepare():
    """The secrets become the files the hub reads, exactly like on the PC."""
    if os.environ.get("GITHUB_ACTIONS") != "true":  # on the PC this would replace your real .env: never
        raise SystemExit("prepare only runs on GitHub (it rewrites .env, channels.json and settings.json)")
    env, config = os.environ.get("HUB_ENV", ""), os.environ.get("HUB_CONFIG", "")
    if not env.strip() or not config.strip():
        raise SystemExit("HUB_ENV or HUB_CONFIG secret is missing (see cloud-setup/GUIDE.txt)")
    config = json.loads(config)
    sync.ENV_FILE.write_text(env.strip() + "\n", encoding="utf-8")
    settings = {k: v for k, v in (config.get("settings") or {}).items() if k != "telegram_by_cloud"}
    alerts.SETTINGS_FILE.write_text(json.dumps(settings, indent=2), encoding="utf-8")
    channels, fetched = {}, 0
    with httpx.Client(timeout=30, follow_redirects=True) as http:
        for label, ch in (config.get("channels") or {}).items():
            entry = {"name": ch.get("name") or label}
            if ch.get("github"):  # public channel repositories: their topic files give each post its category
                folder = REPOS / label
                folder.mkdir(parents=True, exist_ok=True)
                for name in CHANNEL_FILES:
                    try:
                        r = http.get(f"https://raw.githubusercontent.com/{ch['github']}/HEAD/{name}")
                        if r.status_code == 200:
                            (folder / name).write_bytes(r.content)
                            fetched += 1
                    except httpx.HTTPError:
                        pass
                entry["repo"] = str(folder)
            channels[label] = entry
    sync.CHANNELS_FILE.write_text(json.dumps(channels, indent=2), encoding="utf-8")
    print(f"prepared {len(channels)} channels, {fetched} topic files")


def run_sync():
    summary = sync.run()
    sent = digest.tick()
    con = db.connect(db.HUB_DB)
    limit = (datetime.now(timezone.utc) - timedelta(days=CURVES_KEEP_DAYS)).isoformat(timespec="seconds")
    pruned = con.execute("DELETE FROM post_snapshots WHERE post_id IN (SELECT id FROM posts WHERE published_at < ?)",
                         (limit,)).rowcount
    con.commit()
    con.execute("VACUUM")
    con.close()
    print(f"synced {len(summary.get('channels', []))} channels, {len(summary.get('errors', []))} with a problem, "
          f"weekly summary {'sent' if sent else 'not due'}, {pruned} old curve points dropped")


def make_bundle(out):
    repo, token = os.environ.get("GITHUB_REPOSITORY"), os.environ.get("HUB_REFRESH_TOKEN", "").strip()
    refresh = {"repo": repo, "workflow": WORKFLOW, "ref": os.environ.get("GITHUB_REF_NAME") or "main", "token": token or None} if repo else None
    con = db.connect(db.HUB_DB)
    data = bundle.build(con, refresh)
    con.close()
    Path(out).write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    print(f"bundle ready ({len(data['accounts'])} accounts)")


def make_site(out):
    """The same page as on the PC, plus cloud-config.js which switches it to the online version."""
    out = Path(out)
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(ROOT / "static", out / "static")
    shutil.copy(ROOT / "static" / "index.html", out / "index.html")
    version = webapp.static_version()
    (out / "manifest.webmanifest").write_text(json.dumps(webapp.manifest()), encoding="utf-8")
    (out / "sw.js").write_text(webapp.service_worker(), encoding="utf-8")
    (out / "cloud-config.js").write_text(
        "window.HUB_CLOUD = " + json.dumps({"data": "data.enc", "version": version}) + ";\n", encoding="utf-8")
    print(f"site ready (version {version})")


def setup():
    """On the PC: HUB_CONFIG for GitHub, from channels.json, the channels' git remotes and settings.json."""
    channels = {}
    for label, ch in sync.load_channels().items():
        entry = {"name": ch.get("name") or label}
        if ch.get("repo"):
            try:
                url = subprocess.run(["git", "-C", ch["repo"], "remote", "get-url", "origin"],
                                     capture_output=True, text=True, timeout=20).stdout.strip()
            except (OSError, subprocess.TimeoutExpired):
                url = ""
            if "github.com" in url:
                entry["github"] = url.split("github.com", 1)[1].lstrip(":/").removesuffix(".git")
        channels[label] = entry
    settings = {k: v for k, v in alerts._settings().items() if k != "telegram_by_cloud"}
    folder = ROOT / "cloud-setup"
    folder.mkdir(exist_ok=True)
    (folder / "2-HUB_CONFIG.txt").write_text(json.dumps({"channels": channels, "settings": settings}, indent=2,
                                                         ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"cloud-setup/2-HUB_CONFIG.txt written: {len(channels)} channels, "
          f"{sum(1 for c in channels.values() if 'github' in c)} with their GitHub repository")


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else ""
    if command == "prepare":
        prepare()
    elif command == "sync":
        run_sync()
    elif command == "bundle" and len(sys.argv) == 3:
        make_bundle(sys.argv[2])
    elif command == "site" and len(sys.argv) == 3:
        make_site(sys.argv[2])
    elif command == "setup":
        setup()
    else:
        raise SystemExit(__doc__)
