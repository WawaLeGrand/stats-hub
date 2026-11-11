"""What makes the page installable as an app: its manifest and its version. Used by the PC server and by the
online version's build (tools/cloud.py), so both serve the same thing."""
import hashlib

from . import db

STATIC = db.ROOT / "static"


def manifest():
    """Relative paths: the same app works at the PC's address and in a sub-folder online."""
    return {
        "name": "Stats Hub", "short_name": "Stats Hub", "description": "Your TikTok and Instagram accounts in one place.",
        "start_url": "./", "scope": "./", "display": "standalone", "orientation": "portrait",
        "background_color": "#eef0f4", "theme_color": "#4f46e5", "lang": "en",
        "icons": [
            {"src": "static/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "static/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "static/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }


def static_version():
    """Changes whenever a file of the page changes: the phone then refreshes its offline copy."""
    h = hashlib.sha1()
    for f in sorted(STATIC.rglob("*")):
        if f.is_file():
            h.update(f.name.encode())
            h.update(f.read_bytes())
    return h.hexdigest()[:10]


def service_worker():
    return (STATIC / "sw.js").read_text(encoding="utf-8").replace("__VERSION__", static_version())
