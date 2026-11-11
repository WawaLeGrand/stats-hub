"""SQLite storage: accounts, daily account snapshots, posts and post snapshots."""
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
HUB_DB = DATA / "hub.db"    # your real data
DEMO_DB = DATA / "demo.db"  # example data, rebuilt by `python hub.py --demo`

SCHEMA = """
CREATE TABLE IF NOT EXISTS accounts (
    id           TEXT PRIMARY KEY,   -- Zernio account id, or platform id for direct connections
    platform     TEXT NOT NULL,      -- tiktok | instagram
    handle       TEXT NOT NULL,
    display_name TEXT,
    account_type TEXT,               -- personal | creator | business
    source       TEXT NOT NULL,      -- zernio | tiktok | instagram | manual | demo
    group_name   TEXT,               -- your own grouping: niche, language...
    active       INTEGER NOT NULL DEFAULT 1,
    added_at     TEXT NOT NULL,
    channel      TEXT                -- which Zernio key it comes from (MYCHANNEL for ZERNIO_API_KEY_MYCHANNEL)
);

-- one row per account per day (Paris date): the history behind growth curves
CREATE TABLE IF NOT EXISTS account_snapshots (
    account_id  TEXT NOT NULL REFERENCES accounts(id),
    day         TEXT NOT NULL,       -- YYYY-MM-DD
    followers   INTEGER,
    following   INTEGER,
    likes_total INTEGER,
    video_count INTEGER,
    PRIMARY KEY (account_id, day)
);

-- latest known numbers for each post
CREATE TABLE IF NOT EXISTS posts (
    id            TEXT PRIMARY KEY,
    account_id    TEXT NOT NULL REFERENCES accounts(id),
    published_at  TEXT NOT NULL,     -- UTC, ISO 8601
    title         TEXT,
    caption       TEXT,
    category      TEXT,
    url           TEXT,
    views         INTEGER,
    likes         INTEGER,
    comments      INTEGER,
    shares        INTEGER,
    saves         INTEGER,
    reach         INTEGER,           -- Instagram only
    avg_watch_sec REAL,              -- Instagram Reels only
    updated_at    TEXT,
    thumbnail     TEXT               -- cover image link given by Zernio
);
CREATE INDEX IF NOT EXISTS posts_by_account ON posts(account_id, published_at);

-- every sync also stores the numbers it saw, so post growth can be drawn later
CREATE TABLE IF NOT EXISTS post_snapshots (
    post_id  TEXT NOT NULL REFERENCES posts(id),
    taken_at TEXT NOT NULL,
    views    INTEGER,
    likes    INTEGER,
    comments INTEGER,
    shares   INTEGER,
    saves    INTEGER,
    PRIMARY KEY (post_id, taken_at)
);

CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
"""


def connect(path):
    path.parent.mkdir(exist_ok=True)
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    # databases created before a column existed get it added (your data is kept)
    if "thumbnail" not in {r[1] for r in con.execute("PRAGMA table_info(posts)")}:
        con.execute("ALTER TABLE posts ADD COLUMN thumbnail TEXT")
        con.commit()
    return con


def get_meta(con, key, default=None):
    row = con.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
    return row[0] if row else default


def set_meta(con, key, value):
    con.execute("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)", (key, value))
