"""Pull followers and post stats from Zernio into the database. One Zernio key per channel.

Keys live in .env, one per channel: ZERNIO_API_KEY_MYCHANNEL=..., ZERNIO_API_KEY_SPACE=...
The part after ZERNIO_API_KEY_ is the channel label. channels.json (optional) gives each label a display
name and the channel's local repo, used to find each post's category.
"""
import json
import os
import re
import subprocess
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from . import db
from .messages import HubError
from .zernio import Zernio, ZernioError

TZ = ZoneInfo("Europe/Paris")
KEY_PREFIX = "ZERNIO_API_KEY"
CHANNELS_FILE = db.ROOT / "channels.json"
ENV_FILE = db.ROOT / ".env"
PLATFORMS = ("tiktok", "instagram")
SNAPSHOT_DAYS = 30  # how long after publishing each sync also records a post's numbers over time
SNAPSHOT_GAP_HOURS = 3  # at most one point every 3 hours per post (the online version syncs every 15 minutes)

_lock = threading.Lock()


def load_env():
    """Read KEY=value lines from .env into os.environ (without overwriting)."""
    if not ENV_FILE.exists():
        return
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def write_env_var(name, value):
    """Replace (or remove, when value is None) one line of .env, keeping every other line."""
    lines = ENV_FILE.read_text(encoding="utf-8").splitlines() if ENV_FILE.exists() else []
    lines = [l for l in lines if l.split("=", 1)[0].strip().upper() != name]
    if value:
        lines.append(f"{name}={value}")
        os.environ[name] = value
    else:
        os.environ.pop(name, None)
    ENV_FILE.write_text("\n".join(lines) + "\n", encoding="utf-8")


def zernio_keys():
    """{channel label: key}. ZERNIO_API_KEY_MYCHANNEL -> MYCHANNEL, a plain ZERNIO_API_KEY -> MAIN."""
    load_env()
    keys = {}
    for name, value in os.environ.items():
        if name.upper().startswith(KEY_PREFIX) and value and not value.startswith("paste"):
            keys[name.upper()[len(KEY_PREFIX):].lstrip("_") or "MAIN"] = value
    return keys


def load_channels():
    if not CHANNELS_FILE.exists():
        return {}
    return {k.upper(): v for k, v in json.loads(CHANNELS_FILE.read_text(encoding="utf-8")).items()}


def _json(path, default):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def _git(repo, *args, timeout):
    # never wait on a login prompt (terminal or Git Credential Manager window): fail and move on instead
    env = {**os.environ, "GIT_TERMINAL_PROMPT": "0", "GCM_INTERACTIVE": "never"}
    return subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True, timeout=timeout,
                          env=env, stdin=subprocess.DEVNULL, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))


def refresh_repo(repo):
    """Fast-forward the channel's local repo before reading it: its automation commits the post log on GitHub
    every day. Only a clean git folder is pulled; any problem prints one line and the sync goes on.
    Online (GitHub) the topic files were just downloaded, and the public logs must not show folder names: skipped."""
    if not repo or os.environ.get("GITHUB_ACTIONS") == "true":
        return
    if not Path(repo).is_dir():
        print(f"  repo {repo} not found, categories may be missing")
        return
    try:
        status = _git(repo, "status", "--porcelain", "--untracked-files=no", timeout=15)
        if status.returncode:
            print(f"  repo {repo} is not a git folder, not updated")
        elif status.stdout.strip():
            print(f"  repo {repo} has local changes, not updated")
        else:
            pull = _git(repo, "pull", "--ff-only", "--quiet", timeout=60)
            if pull.returncode:
                lines = pull.stderr.strip().splitlines() or ["unknown error"]
                reason = next((l for l in lines if l.startswith(("fatal:", "error:"))), lines[0])
                print(f"  could not update repo {repo}: {reason}")
    except (OSError, subprocess.SubprocessError) as e:  # git missing, timeout
        print(f"  could not update repo {repo}: {type(e).__name__}")


def _first(d, *names):
    for n in names:
        if isinstance(d, dict) and d.get(n) is not None:
            return d[n]
    return None


def _int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


class TopicIndex:
    """Finds a post's category and title from the channel repo (topics.json, posts_log.jsonl, state.json)."""

    def __init__(self, repo):
        self.topics, self.by_post, self.titles = {}, {}, {}
        if not repo:
            return
        repo = Path(repo)
        for t in _json(repo / "topics.json", []):
            titles = t.get("title") or {}
            titles = titles if isinstance(titles, dict) else {"": titles}
            self.topics[t["id"]] = (t.get("category"), next(iter(titles.values()), t["id"]))
            for title in titles.values():
                self.titles[title.lower()] = t["id"]
        for p in _json(repo / "state.json", {}).get("posts", []):
            self.by_post[p["id"]] = p.get("topic")
        log = repo / "posts_log.jsonl"
        if log.exists():
            for line in log.read_text(encoding="utf-8").splitlines():
                try:
                    rec = json.loads(line)
                except ValueError:
                    continue
                self.by_post[rec.get("zernio_post_id")] = rec.get("topic")
                if rec.get("topic") not in self.topics and rec.get("category"):
                    self.topics[rec["topic"]] = (rec["category"], rec.get("title") or rec["topic"])

    def find(self, post_id, tags, text):
        """(category, title): topic tag, then the channel's post log, then the title inside the caption."""
        tags = [t for t in tags or [] if isinstance(t, str)]
        topic = next((t[6:] for t in tags if t.startswith("topic:")), None) or self.by_post.get(post_id)
        if topic in self.topics:
            return self.topics[topic]
        category = next((t[4:].replace("-", " ").capitalize() for t in tags if t.startswith("cat:")), None)
        head = (text or "")[:120].lower()
        matches = [t for t in self.titles if re.search(r"(^|\W)" + re.escape(t) + r"(\W|$)", head)]
        if matches:
            cat, title = self.topics[self.titles[max(matches, key=len)]]
            return category or cat, title
        return category, None


def _snapshot(con, account_id, day, followers=None, following=None, likes_total=None, video_count=None):
    con.execute(
        """INSERT INTO account_snapshots VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(account_id, day) DO UPDATE SET
             followers = COALESCE(excluded.followers, followers),
             following = COALESCE(excluded.following, following),
             likes_total = COALESCE(excluded.likes_total, likes_total),
             video_count = COALESCE(excluded.video_count, video_count)""",
        (account_id, day, followers, following, likes_total, video_count))


def _list(data, key):
    if isinstance(data, list):
        return data
    return (data.get(key) or []) if isinstance(data, dict) else []


def _sync_accounts(con, z, label, group, now):
    today = now.astimezone(TZ).date().isoformat()
    accounts = {}
    for a in _list(z.get("/accounts"), "accounts"):
        acc_id, platform = _first(a, "_id", "id"), (a.get("platform") or "").lower()
        if not acc_id or platform not in PLATFORMS:
            continue
        handle = (_first(a, "username", "handle", "displayName", "name") or acc_id).lstrip("@")
        con.execute(
            """INSERT INTO accounts (id, platform, handle, display_name, source, group_name, active, added_at, channel)
               VALUES (?, ?, ?, ?, 'zernio', ?, 1, ?, ?)
               ON CONFLICT(id) DO UPDATE SET platform = excluded.platform, handle = excluded.handle,
                 display_name = excluded.display_name, channel = excluded.channel,
                 group_name = excluded.group_name, active = 1""",
            (acc_id, platform, handle, _first(a, "displayName", "name"), group, today, label))
        accounts[acc_id] = platform
    marks = ",".join("?" * len(accounts))
    con.execute(f"UPDATE accounts SET active = 0 WHERE source = 'zernio' AND channel = ? AND id NOT IN ({marks})",
                [label, *accounts])

    # today's numbers, plus the daily follower history Zernio keeps for every account
    data = z.get("/accounts/follower-stats")
    for acc_id, points in ((data.get("stats") or {}) if isinstance(data, dict) else {}).items():
        if acc_id in accounts:
            for point in points or []:
                if point.get("date") and str(point["date"])[:10] != today:
                    _snapshot(con, acc_id, str(point["date"])[:10], _int(point.get("followers")))
    for s in _list(data, "accounts"):
        acc_id = _first(s, "accountId", "_id", "id")
        if acc_id not in accounts:
            continue
        stats = s.get("accountStats") or {}
        _snapshot(con, acc_id, today, _int(_first(s, "currentFollowers", "followersCount", "followerCount")),
                  _int(_first(stats, "followingCount", "followsCount")), _int(stats.get("likesCount")),
                  _int(_first(stats, "videoCount", "mediaCount")))
        if isinstance(stats.get("isBusinessAccount"), bool):
            kind = "business" if stats["isBusinessAccount"] else "personal"
        else:
            kind = {"MEDIA_CREATOR": "creator", "BUSINESS": "business", "PERSONAL": "personal"}.get(stats.get("accountType"))
        if kind:
            con.execute("UPDATE accounts SET account_type = ? WHERE id = ?", (kind, acc_id))

    # TikTok daily likes/videos history kept by Zernio (optional: followers already came from follower-stats)
    for acc_id, platform in accounts.items():
        if platform != "tiktok":
            continue
        try:
            metrics = z.get("/analytics/tiktok/account-insights", accountId=acc_id,
                            metricType="time_series").get("metrics") or {}
        except ZernioError:
            continue
        days = {}
        for name, column in (("follower_count", "followers"), ("likes_count", "likes_total"), ("video_count", "video_count")):
            for v in (metrics.get(name) or {}).get("values") or []:
                if v.get("date"):
                    days.setdefault(str(v["date"])[:10], {})[column] = _int(v.get("value"))
        for day, values in days.items():
            if day != today:
                _snapshot(con, acc_id, day, **values)
    return accounts


def _post_metrics(p, acc_id):
    """Zernio post entry -> flat dict of metrics, whatever the nesting."""
    flat = dict(p)
    for nested in ("analytics", "metrics"):
        if isinstance(p.get(nested), dict):
            flat.update(p[nested])
    for entry in p.get("platforms") or []:
        if not isinstance(entry, dict):
            continue
        owner = _first(entry, "accountId", "account")
        if (owner.get("_id") if isinstance(owner, dict) else owner) == acc_id:
            flat.update({k: v for k, v in entry.items() if v is not None})
            if isinstance(entry.get("analytics"), dict):
                flat.update(entry["analytics"])
    return flat


def _sync_posts(con, z, accounts, index, now):
    taken = now.isoformat(timespec="seconds")
    since = (now - timedelta(days=365)).astimezone(TZ).date().isoformat()
    count = 0
    for acc_id in accounts:
        page = 1
        while True:
            data = z.get("/analytics", accountId=acc_id, fromDate=since, limit=50, page=page, source="all")
            posts = _list(data, "posts")
            for p in posts:
                m = _post_metrics(p, acc_id)
                zernio_id = _first(p, "_id", "postId", "id")  # this platform's copy of the post
                late_id = _first(p, "latePostId") or zernio_id  # the post the publishing system created
                published = _first(m, "publishedAt", "platformPublishedAt", "scheduledFor", "createdAt")
                if not zernio_id or not published:
                    continue
                published = datetime.fromisoformat(str(published).replace("Z", "+00:00")).astimezone(timezone.utc)
                text = _first(m, "content", "caption", "text") or ""
                category, title = index.find(late_id, m.get("tags"), text)
                watch = _first(m, "igReelsAvgWatchTime", "avgWatchTime", "averageWatchTime")
                watch = round(watch / 1000, 1) if isinstance(watch, (int, float)) and watch else None  # ms -> s
                row = {
                    "views": _int(_first(m, "views", "plays", "videoViews")), "likes": _int(m.get("likes")),
                    "comments": _int(m.get("comments")), "shares": _int(m.get("shares")), "saves": _int(m.get("saves")),
                }
                if not row["views"]:
                    watch = None  # TikTok reports a watch time even before any view is counted
                post_id = f"{zernio_id}:{acc_id}"
                con.execute(
                    """INSERT INTO posts VALUES (:id, :acc, :published, :title, :caption, :category, :url,
                         :views, :likes, :comments, :shares, :saves, :reach, :watch, :taken, :thumb)
                       ON CONFLICT(id) DO UPDATE SET published_at = excluded.published_at,
                         title = excluded.title, caption = excluded.caption,
                         category = COALESCE(excluded.category, category), url = COALESCE(excluded.url, url),
                         views = excluded.views, likes = excluded.likes, comments = excluded.comments,
                         shares = excluded.shares, saves = excluded.saves, reach = excluded.reach,
                         avg_watch_sec = excluded.avg_watch_sec, updated_at = excluded.updated_at,
                         thumbnail = COALESCE(excluded.thumbnail, thumbnail)""",
                    {"id": post_id, "acc": acc_id, "published": published.isoformat(timespec="seconds"),
                     "title": title or text.split("\n")[0][:80] or None, "caption": text or None,
                     "category": category, "url": _first(m, "platformPostUrl", "postUrl", "url", "permalink"),
                     "reach": _int(m.get("reach")), "watch": watch, "taken": taken,
                     "thumb": _first(p, "thumbnailUrl", "thumbnail"), **row})
                last = con.execute("SELECT MAX(taken_at) FROM post_snapshots WHERE post_id = ?", (post_id,)).fetchone()[0]
                spaced = last is None or now - datetime.fromisoformat(last) >= timedelta(hours=SNAPSHOT_GAP_HOURS)
                if now - published <= timedelta(days=SNAPSHOT_DAYS) and spaced:  # posts grow early; keeps the file small
                    con.execute("INSERT OR REPLACE INTO post_snapshots VALUES (?, ?, ?, ?, ?, ?, ?)",
                                (post_id, taken, row["views"], row["likes"], row["comments"], row["shares"], row["saves"]))
                count += 1
            pagination = (data.get("pagination") or {}) if isinstance(data, dict) else {}
            pages = _int(_first(pagination, "totalPages", "pages"))
            if len(posts) < 50 or (pages and page >= pages) or pagination.get("hasMore") is False:
                break
            page += 1
    return count


def run(path=None):
    """Sync every channel. Returns a summary; errors of one channel don't stop the others."""
    if not _lock.acquire(blocking=False):
        return {"skipped": "a sync is already running"}
    try:
        keys, channels = zernio_keys(), load_channels()
        now = datetime.now(timezone.utc)
        summary = {"channels": [], "errors": []}
        if not keys:
            return summary
        con = db.connect(path or db.HUB_DB)
        try:
            alerted = json.loads(db.get_meta(con, "alerted", "[]"))
            for label, key in sorted(keys.items()):
                conf = channels.get(label, {})
                group = conf.get("name") or label.replace("_", " ").title()
                z = Zernio(key)
                refresh_repo(conf.get("repo"))
                try:
                    accounts = _sync_accounts(con, z, label, group, now)
                    posts = _sync_posts(con, z, accounts, TopicIndex(conf.get("repo")), now)
                    con.commit()
                    summary["channels"].append({"channel": group, "accounts": len(accounts), "posts": posts})
                except ZernioError as e:
                    con.rollback()
                    summary["errors"].append({"channel": group, **e.as_dict()})
                except Exception as e:  # noqa: BLE001 - a bug must show up as an alert, not stop the hub silently
                    con.rollback()
                    summary["errors"].append({"channel": group, **HubError("unexpected", kind=type(e).__name__,
                                                                           text=str(e)).as_dict()})
                finally:
                    z.close()
            # a channel removed while this sync was running must not come back
            current = list(zernio_keys())
            con.execute(f"UPDATE accounts SET active = 0 WHERE source = 'zernio' "
                        f"AND (channel IS NULL OR channel NOT IN ({','.join('?' * len(current))}))", current)
            from . import alerts  # here, not at the top: alerts itself uses this module
            if alerts.handled_by_cloud():  # the online version sends them: nothing twice
                summary["alerts"] = []
            else:
                alerted, summary["alerts"] = alerts.after_sync(alerted, summary["errors"],
                                                               [c["channel"] for c in summary["channels"]])
            db.set_meta(con, "last_sync", now.isoformat(timespec="seconds"))
            db.set_meta(con, "sync_errors", json.dumps(summary["errors"]))
            db.set_meta(con, "alerted", json.dumps(alerted))
            con.commit()
        finally:
            con.close()
        return summary
    finally:
        _lock.release()


def running():
    return _lock.locked()
