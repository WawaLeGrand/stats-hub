"""Numbers for the dashboard: follower growth, median views, engagement, top posts, best times, goals."""
from bisect import bisect_right
from collections import defaultdict
from datetime import datetime, time, timedelta, timezone
from statistics import median
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Europe/Paris")
WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
PLATFORM_ORDER = ["tiktok", "instagram"]
# what TikTok asks before paying (Creator Rewards): followers, and video views over the last 30 days
CREATOR_REWARDS = {"followers": 10_000, "views_30": 100_000}
EXPORT_COLUMNS = ["date", "channel", "platform", "account", "title", "category", "views", "likes", "comments",
                  "shares", "saves", "reach", "avg_watch_sec", "engagement_pct", "url"]


def groups(con):
    return [r[0] for r in con.execute(
        "SELECT DISTINCT group_name FROM accounts WHERE active = 1 AND group_name IS NOT NULL ORDER BY group_name")]


def _accounts(con, platform="all", group="all", account_id=None):
    sql, args = "SELECT * FROM accounts WHERE active = 1", []
    if account_id:
        sql += " AND id = ?"
        args.append(account_id)
    if platform != "all":
        sql += " AND platform = ?"
        args.append(platform)
    if group != "all":
        sql += " AND group_name = ?"
        args.append(group)
    return [dict(r) for r in con.execute(sql + " ORDER BY group_name, platform, handle", args)]


def _history(con, ids):
    """{account id: ([days], [followers])}, sorted by day."""
    hist = {i: ([], []) for i in ids}
    if ids:
        marks = ",".join("?" * len(ids))
        for r in con.execute(
                f"SELECT account_id, day, followers FROM account_snapshots "
                f"WHERE account_id IN ({marks}) AND followers IS NOT NULL ORDER BY day", ids):
            hist[r[0]][0].append(r[1])
            hist[r[0]][1].append(r[2])
    return hist


def _value_on(h, day):
    """Followers on that day: the last snapshot taken on or before it."""
    i = bisect_right(h[0], day.isoformat())
    return h[1][i - 1] if i else None


def _growth(h, today, days):
    now = _value_on(h, today)
    if now is None:
        return None
    then = _value_on(h, today - timedelta(days=days))
    return now - (h[1][0] if then is None else then)  # account newer than the range: since its first day


def _posts(con, ids, since):
    if not ids:
        return []
    marks = ",".join("?" * len(ids))
    rows = con.execute(
        f"SELECT * FROM posts WHERE account_id IN ({marks}) AND published_at >= ? ORDER BY published_at, id",
        [*ids, since.astimezone(timezone.utc).isoformat(timespec="seconds")])
    posts = []
    for r in rows:
        p = dict(r)
        p["local"] = datetime.fromisoformat(p["published_at"]).astimezone(TZ)
        posts.append(p)
    return posts


def _median(values):
    values = [v for v in values if v is not None]
    return median(values) if values else None


def _engagement(posts):
    """(likes + comments + shares) / views."""
    views = sum(p["views"] or 0 for p in posts)
    if not views:
        return None
    return sum((p["likes"] or 0) + (p["comments"] or 0) + (p["shares"] or 0) for p in posts) / views


def _scope(con, days, platform, group, account_id=None):
    """Everything a page needs: the period's posts, and the previous period's posts for comparison."""
    today = datetime.now(TZ).date()
    accounts = _accounts(con, platform, group, account_id)
    ids = [a["id"] for a in accounts]
    first_day = today - timedelta(days=days - 1)
    previous_first = first_day - timedelta(days=days)
    all_posts = _posts(con, ids, datetime.combine(previous_first, time(0), TZ))
    posts = [p for p in all_posts if p["local"].date() >= first_day]
    previous = [p for p in all_posts if p["local"].date() < first_day]
    return today, first_day, accounts, _history(con, ids), posts, previous


def _kpis(accounts, hist, posts, today, days, previous_posts=None):
    growth = [_growth(hist[a["id"]], today, days) for a in accounts]
    k = {
        "followers": sum(_value_on(hist[a["id"]], today) or 0 for a in accounts),
        "growth": sum(g for g in growth if g is not None),
        "views": sum(p["views"] or 0 for p in posts),
        "median_views": _median(p["views"] for p in posts),
        "engagement": _engagement(posts),
        "posts": len(posts),
        "posts_per_week": round(len(posts) / days * 7, 1),
    }
    if previous_posts is not None:  # the same numbers over the period just before, to show the change
        k["previous"] = {
            "views": sum(p["views"] or 0 for p in previous_posts),
            "median_views": _median(p["views"] for p in previous_posts),
            "engagement": _engagement(previous_posts),
            "posts": len(previous_posts),
            "posts_per_week": round(len(previous_posts) / days * 7, 1),
        }
    return k


def _series(accounts, hist, posts, today, first_day):
    """Total followers per day, and views of the posts published each day."""
    day_list = [first_day + timedelta(days=i) for i in range((today - first_day).days + 1)]
    views = defaultdict(int)
    for p in posts:
        views[p["local"].date()] += p["views"] or 0
    return {
        "labels": [d.isoformat() for d in day_list],
        "followers": [sum(_value_on(hist[a["id"]], d) or 0 for a in accounts) for d in day_list],
        "views": [views[d] for d in day_list],
    }


def _public(p, by_id):
    acc = by_id[p["account_id"]]
    return {
        "id": p["id"], "account_id": acc["id"], "handle": acc["handle"], "platform": acc["platform"],
        "title": p["title"][:1].upper() + p["title"][1:] if p["title"] else None,
        "category": p["category"], "url": p["url"], "thumbnail": p["thumbnail"],
        "date": p["local"].strftime("%Y-%m-%d %H:%M"),
        "views": p["views"], "likes": p["likes"], "comments": p["comments"], "shares": p["shares"],
        "saves": p["saves"], "reach": p["reach"], "avg_watch_sec": p["avg_watch_sec"],
        "engagement": _engagement([p]),
    }


def _categories(posts):
    by_cat = defaultdict(list)
    for p in posts:
        by_cat[p["category"] or "No category"].append(p)
    rows = [{"category": c, "posts": len(ps), "median_views": _median(p["views"] for p in ps),
             "engagement": _engagement(ps), "shares": sum(p["shares"] or 0 for p in ps)}
            for c, ps in by_cat.items()]
    return sorted(rows, key=lambda r: r["median_views"] or 0, reverse=True)


def _goals(con, accounts, hist, today):
    """Creator Rewards progress for each TikTok account: followers, and views of the last 30 days' posts."""
    tiktoks = [a for a in accounts if a["platform"] == "tiktok"]
    if not tiktoks:
        return []
    ids = [a["id"] for a in tiktoks]
    since = datetime.combine(today - timedelta(days=29), time(0), TZ).astimezone(timezone.utc)
    marks = ",".join("?" * len(ids))
    views = dict(con.execute(
        f"SELECT account_id, COALESCE(SUM(views), 0) FROM posts WHERE account_id IN ({marks}) "
        f"AND published_at >= ? GROUP BY account_id", [*ids, since.isoformat(timespec="seconds")]).fetchall())
    return [{"id": a["id"], "handle": a["handle"], "group": a["group_name"],
             "followers": _value_on(hist[a["id"]], today) or 0, "views_30": int(views.get(a["id"], 0))}
            for a in tiktoks]


def overview(con, days, platform, group):
    today, first_day, accounts, hist, posts, previous = _scope(con, days, platform, group)
    by_account = defaultdict(list)
    for p in posts:
        by_account[p["account_id"]].append(p)
    prev_by_account = defaultdict(list)
    for p in previous:
        prev_by_account[p["account_id"]].append(p)
    rows = []
    for a in accounts:
        h, ps = hist[a["id"]], by_account[a["id"]]
        rows.append({
            "id": a["id"], "platform": a["platform"], "handle": a["handle"], "name": a["display_name"],
            "group": a["group_name"], "source": a["source"],
            "followers": _value_on(h, today),
            "growth_7": _growth(h, today, 7), "growth_30": _growth(h, today, 30),
            "spark": [_value_on(h, first_day + timedelta(days=i)) for i in range(days)],
            "posts_per_week": round(len(ps) / days * 7, 1),
            "views": sum(p["views"] or 0 for p in ps),
            "median_views": _median(p["views"] for p in ps),
            "engagement": _engagement(ps),
        })
    platforms = {}  # one panel per platform: its own numbers and curves
    for name in sorted({a["platform"] for a in accounts}, key=PLATFORM_ORDER.index):
        accs = [a for a in accounts if a["platform"] == name]
        ps = [p for a in accs for p in by_account[a["id"]]]
        prev = [p for a in accs for p in prev_by_account[a["id"]]]
        platforms[name] = {"accounts": len(accs), "kpis": _kpis(accs, hist, ps, today, days, prev),
                           "series": _series(accs, hist, ps, today, first_day)}
    return {"kpis": _kpis(accounts, hist, posts, today, days, previous),
            "series": _series(accounts, hist, posts, today, first_day),
            "platforms": platforms, "accounts": rows,
            "goals": {"targets": CREATOR_REWARDS, "accounts": _goals(con, accounts, hist, today)}}


def top_posts(con, days, platform, group, sort="views", limit=25, category=None):
    _, _, accounts, _, posts, _ = _scope(con, days, platform, group)
    by_id = {a["id"]: a for a in accounts}
    categories = sorted({p["category"] or "No category" for p in posts})
    if category:
        posts = [p for p in posts if (p["category"] or "No category") == category]
    key = "shares" if sort == "shares" else "views"
    posts.sort(key=lambda p: p[key] or 0, reverse=True)
    return {"posts": [_public(p, by_id) for p in posts[:limit]], "categories": categories, "total": len(posts)}


def insights(con, days, platform, group):
    _, _, _, _, posts, _ = _scope(con, days, platform, group)
    cells = defaultdict(list)
    for p in posts:
        cells[(p["local"].weekday(), p["local"].hour)].append(p["views"])
    hours = sorted({h for _, h in cells})
    grid = [[{"median_views": _median(cells.get((d, h), [])), "posts": len(cells.get((d, h), []))}
             for h in hours] for d in range(7)]
    return {"hours": hours, "weekdays": WEEKDAYS, "grid": grid, "categories": _categories(posts), "posts": len(posts)}


def account(con, account_id, days):
    today, first_day, accounts, hist, posts, previous = _scope(con, days, "all", "all", account_id)
    if not accounts:
        return None
    a = accounts[0]
    by_id = {a["id"]: a}
    return {
        "account": {"id": a["id"], "platform": a["platform"], "handle": a["handle"], "name": a["display_name"],
                    "group": a["group_name"], "type": a["account_type"], "source": a["source"],
                    "growth_7": _growth(hist[a["id"]], today, 7), "growth_30": _growth(hist[a["id"]], today, 30)},
        "kpis": _kpis(accounts, hist, posts, today, days, previous),
        "series": _series(accounts, hist, posts, today, first_day),
        "categories": _categories(posts),
        "posts": [_public(p, by_id) for p in reversed(posts)],
    }


def post_detail(con, post_id):
    """One post with its numbers over time (one point per sync during its first weeks)."""
    r = con.execute("SELECT p.*, a.handle, a.platform, a.group_name FROM posts p JOIN accounts a ON a.id = p.account_id "
                    "WHERE p.id = ? AND a.active = 1", (post_id,)).fetchone()
    if not r:
        return None
    p = dict(r)
    p["local"] = datetime.fromisoformat(p["published_at"]).astimezone(TZ)
    post = _public(p, {p["account_id"]: {"id": p["account_id"], "handle": p["handle"], "platform": p["platform"]}})
    post["group"] = p["group_name"]
    post["caption"] = p["caption"]
    post["published_at"] = p["published_at"]  # exact moment (UTC), where the growth curve starts
    snapshots = [{"t": s["taken_at"], "views": s["views"], "likes": s["likes"], "comments": s["comments"],
                  "shares": s["shares"], "saves": s["saves"]}
                 for s in con.execute("SELECT * FROM post_snapshots WHERE post_id = ? ORDER BY taken_at", (post_id,))]
    return {"post": post, "snapshots": snapshots}


def export_rows(con, days, platform, group):
    """Every post of the period as plain rows (for the CSV export), newest first."""
    _, _, accounts, _, posts, _ = _scope(con, days, platform, group)
    by_id = {a["id"]: a for a in accounts}
    rows = []
    for p in sorted(posts, key=lambda p: p["published_at"], reverse=True):
        a = by_id[p["account_id"]]
        eng = _engagement([p])
        rows.append([p["local"].strftime("%Y-%m-%d %H:%M"), a["group_name"], a["platform"], "@" + a["handle"],
                     p["title"], p["category"], p["views"], p["likes"], p["comments"], p["shares"], p["saves"],
                     p["reach"], p["avg_watch_sec"], round(eng * 100, 2) if eng is not None else None, p["url"]])
    return EXPORT_COLUMNS, rows
