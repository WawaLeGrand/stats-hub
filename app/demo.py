"""Fake but realistic data, so the dashboard can be seen before any account is connected."""
import math
import random
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

from . import db

DAYS = 120
SNAPSHOT_DAYS = 30  # like the real sync: a post's growth is recorded during its first 30 days
TZ = ZoneInfo("Europe/Paris")

# id, platform, handle, name, group, followers at the start
ACCOUNTS = [
    ("demo-tt-1", "tiktok", "daily_trivia_bites", "Daily Trivia Bites", "Trivia EN", 1500),
    ("demo-ig-1", "instagram", "daily_trivia_bites", "Daily Trivia Bites", "Trivia EN", 600),
    ("demo-tt-2", "tiktok", "le_saviez_tu_express", "Le Saviez-Tu Express", "Trivia FR", 250),
    ("demo-ig-2", "instagram", "le_saviez_tu_express", "Le Saviez-Tu Express", "Trivia FR", 90),
    ("demo-tt-3", "tiktok", "space_in_a_minute", "Space In A Minute", "Space", 4200),
    ("demo-ig-3", "instagram", "space_in_a_minute", "Space In A Minute", "Space", 1300),
]

GROUP_CATEGORIES = {
    "Trivia EN": None,  # all categories
    "Trivia FR": None,
    "Space": ["Space", "Science", "Inventions"],
}

CATEGORY_BOOST = {
    "Animals": 1.4, "Space": 1.25, "Human body": 1.2, "Psychology": 1.15, "Ocean": 1.1,
    "History": 1.0, "Food": 1.0, "Records": 0.95, "Science": 0.9, "Places": 0.9,
    "Inventions": 0.85, "Plants": 0.7, "Words": 0.65,
}

TITLES = {
    "Animals": ["octopuses", "crows", "sloths", "axolotls", "honeybees"],
    "Space": ["the Moon", "black holes", "Saturn", "the Sun", "Mars"],
    "Human body": ["your bones", "sleep", "the heart", "your eyes"],
    "Psychology": ["déjà vu", "habits", "dreams", "memory"],
    "Ocean": ["the deep sea", "blue whales", "coral reefs", "tides"],
    "History": ["the pyramids", "Vikings", "ancient Rome", "the Titanic"],
    "Food": ["chocolate", "honey", "coffee", "bananas"],
    "Records": ["the tallest trees", "the fastest animals", "the oldest things"],
    "Science": ["lightning", "glass", "magnets", "rainbows"],
    "Places": ["Iceland", "the Sahara", "Antarctica", "Venice"],
    "Inventions": ["the printing press", "the bicycle", "the telephone"],
    "Plants": ["bamboo", "sunflowers", "cacti"],
    "Words": ["weird English words", "the alphabet", "slang"],
}

HOUR_BOOST = {7: 0.8, 8: 1.0, 12: 1.15, 13: 1.05, 18: 1.25, 19: 1.35, 20: 1.3, 21: 1.2, 22: 0.95}
WEEKDAY_BOOST = [0.95, 0.9, 0.95, 1.0, 1.1, 1.25, 1.2]
PLATFORM_REACH = {"tiktok": 1.0, "instagram": 0.45}


def build(path):
    """(Re)create the demo database with ~4 months of history ending now."""
    if path.exists():
        path.unlink()
    rnd = random.Random(42)
    con = db.connect(path)
    now = datetime.now(timezone.utc)
    today = now.astimezone(TZ).date()
    first = today - timedelta(days=DAYS)

    for acc_id, platform, handle, name, group, followers in ACCOUNTS:
        con.execute(
            "INSERT INTO accounts VALUES (?, ?, ?, ?, ?, 'demo', ?, 1, ?, NULL)",
            (acc_id, platform, handle, name, "personal" if platform == "tiktok" else "creator",
             group, first.isoformat()),
        )
        categories = GROUP_CATEGORIES[group] or list(CATEGORY_BOOST)
        likes_total = videos = 0
        for i in range(DAYS + 1):
            day = first + timedelta(days=i)
            views_today = 0
            for hour in sorted(rnd.sample(list(HOUR_BOOST), 2)):
                local = datetime.combine(day, time(hour, rnd.randrange(60)), TZ)
                published = local.astimezone(timezone.utc)
                if published > now:
                    continue
                category = rnd.choice(categories)
                views = ((300 + followers * 0.9) * PLATFORM_REACH[platform] * CATEGORY_BOOST[category]
                         * HOUR_BOOST[hour] * WEEKDAY_BOOST[day.weekday()] * rnd.lognormvariate(0, 0.6))
                if rnd.random() < 0.03:  # the occasional viral video
                    views *= rnd.uniform(8, 25)
                age_hours = (now - published).total_seconds() / 3600
                full_views = views
                views = int(views * (1 - math.exp(-age_hours / 20)))  # recent posts are still growing
                likes = int(views * rnd.uniform(0.04, 0.09))
                instagram = platform == "instagram"
                post_id = f"{acc_id}-{i}-{hour}"
                con.execute(
                    "INSERT INTO posts VALUES (?, ?, ?, ?, NULL, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, NULL)",
                    (post_id, acc_id, published.isoformat(timespec="seconds"),
                     rnd.choice(TITLES[category]).capitalize(), category,
                     views, likes, int(views * rnd.uniform(0.002, 0.008)),
                     int(views * rnd.uniform(0.003, 0.015) * CATEGORY_BOOST[category]),
                     int(views * rnd.uniform(0.004, 0.02)),
                     int(views * rnd.uniform(0.7, 0.9)) if instagram else None,
                     round(rnd.uniform(9, 34), 1) if instagram else None,
                     now.isoformat(timespec="seconds")),
                )
                if views and 1 <= age_hours <= SNAPSHOT_DAYS * 24:
                    for step in range(1, 11):  # how it grew: what the real hub records at each sync
                        at = age_hours * step / 10
                        seen = int(full_views * (1 - math.exp(-at / 20)))
                        con.execute("INSERT INTO post_snapshots VALUES (?, ?, ?, ?, NULL, NULL, NULL)",
                                    (post_id, (published + timedelta(hours=at)).isoformat(timespec="seconds"),
                                     seen, int(likes * seen / views)))
                views_today += views
                likes_total += likes
                videos += 1
            followers += int(views_today * rnd.uniform(0.003, 0.006)) - rnd.randint(0, 4)
            con.execute(
                "INSERT INTO account_snapshots VALUES (?, ?, ?, ?, ?, ?)",
                (acc_id, day.isoformat(), followers, rnd.randint(20, 60), likes_total, videos),
            )

    db.set_meta(con, "last_sync", now.isoformat(timespec="seconds"))
    con.commit()
    con.close()
