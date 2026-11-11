"""Everything the online version of the dashboard needs, in one compact JSON (encrypted before it leaves).

The page computes the numbers itself from this (static/stats.js does what app/stats.py does), so it works
without this PC. Only what the pages can show is included: posts of the last 200 days (90-day view + the
90 days before it for the comparison), and growth curves of the last 100 days' posts.
"""
import json
from datetime import datetime, timedelta, timezone

from . import alerts, db, digest, stats
from .messages import LANGS

POSTS_DAYS = 200
CURVES_DAYS = 100


def build(con, refresh=None):
    now = datetime.now(timezone.utc)
    accounts = [dict(r) for r in con.execute(
        "SELECT id, platform, handle, display_name, account_type, group_name, source FROM accounts WHERE active = 1")]
    ids = [a["id"] for a in accounts]
    marks = ",".join("?" * len(ids))
    snapshots = {i: [] for i in ids}
    posts, curves = [], {}
    if ids:
        for r in con.execute(f"SELECT account_id, day, followers FROM account_snapshots WHERE account_id IN ({marks}) "
                             f"AND followers IS NOT NULL ORDER BY day", ids):
            snapshots[r[0]].append([r[1], r[2]])
        since = (now - timedelta(days=POSTS_DAYS)).isoformat(timespec="seconds")
        for r in con.execute(f"SELECT id, account_id, published_at, title, category, url, thumbnail, views, likes, comments, "
                             f"shares, saves, reach, avg_watch_sec FROM posts WHERE account_id IN ({marks}) "
                             f"AND published_at >= ? ORDER BY published_at, id", [*ids, since]):
            posts.append(list(r))
        curve_since = (now - timedelta(days=CURVES_DAYS)).isoformat(timespec="seconds")
        for r in con.execute(f"SELECT s.post_id, s.taken_at, s.views, s.likes, s.comments, s.shares, s.saves "
                             f"FROM post_snapshots s JOIN posts p ON p.id = s.post_id WHERE p.account_id IN ({marks}) "
                             f"AND p.published_at >= ? ORDER BY s.post_id, s.taken_at", [*ids, curve_since]):
            curves.setdefault(r[0], []).append(list(r[1:]))
    errors = json.loads(db.get_meta(con, "sync_errors", "[]"))
    st = alerts.status()
    return {
        "v": 1,
        "generated": now.isoformat(timespec="seconds"),
        "last_sync": db.get_meta(con, "last_sync"),
        "sync_errors": [{"channel": e["channel"], **{lang: alerts.error_text(e, lang) for lang in LANGS}} for e in errors],
        "lang": alerts.saved_language(),
        "alerts": {"connected": st["connected"], "bot": st["bot"], "chat": st["chat"], "digest": digest.enabled()},
        "targets": stats.CREATOR_REWARDS,
        "accounts": accounts,
        "snapshots": snapshots,
        "posts": posts,
        "curves": curves,
        "refresh": refresh,  # where the Refresh button asks GitHub for a new run (and with which key)
    }
