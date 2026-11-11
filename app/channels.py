"""Add and remove channels from the dashboard: one Zernio key per channel, kept in .env (never shown again)."""
import json
import re
from pathlib import Path

from . import sync
from .messages import HubError
from .zernio import Zernio


class ChannelError(HubError):
    pass


def label_for(name):
    """'Space facts' -> 'SPACE_FACTS' (the end of ZERNIO_API_KEY_SPACE_FACTS)."""
    label = re.sub(r"[^A-Z0-9]+", "_", name.upper()).strip("_")
    if not label:
        raise ChannelError("name_empty")
    return label


def _var(label):
    return f"{sync.KEY_PREFIX}_{label}"


def _write_env(label, key=None):
    sync.write_env_var(_var(label), key)


def _write_channels(data):
    sync.CHANNELS_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def list_channels(con):
    keys, conf = sync.zernio_keys(), sync.load_channels()
    rows = []
    for label in sorted(set(keys) | set(conf)):
        accounts = [dict(r) for r in con.execute(
            "SELECT platform, handle FROM accounts WHERE channel = ? AND active = 1 ORDER BY platform", (label,))]
        rows.append({"label": label, "name": conf.get(label, {}).get("name") or label.replace("_", " ").title(),
                     "repo": conf.get(label, {}).get("repo"), "has_key": label in keys, "accounts": accounts})
    return rows


def add(name, key, repo=None):
    """Check the key with Zernio, then save it. Returns the label and the accounts Zernio sees."""
    name, key, repo = name.strip(), key.strip(), (repo or "").strip().strip('"') or None
    label = label_for(name)
    if not re.fullmatch(r"[A-Za-z0-9_\-.]{10,}", key):
        raise ChannelError("key_format")
    keys = sync.zernio_keys()
    if label in keys:
        raise ChannelError("name_exists", name=name)
    if key in keys.values():
        raise ChannelError("key_used")
    if repo and not Path(repo).is_dir():
        raise ChannelError("folder_missing", folder=repo)

    z = Zernio(key)
    try:
        found = [a for a in sync._list(z.get("/accounts"), "accounts")
                 if (a.get("platform") or "").lower() in sync.PLATFORMS]
    finally:
        z.close()  # a refused key raises ZernioError, shown as it is

    _write_env(label, key)
    conf = {k: v for k, v in sync.load_channels().items()}
    conf[label] = {"name": name, **({"repo": repo.replace("\\", "/")} if repo else {})}
    _write_channels(conf)
    return {"label": label, "name": name,
            "accounts": [{"platform": a["platform"].lower(), "handle": a.get("username") or a.get("displayName")}
                         for a in found]}


def remove(con, label):
    """Forget the channel's key. Its accounts are hidden; their history stays in the database."""
    label = label.upper()
    _write_env(label, None)
    conf = sync.load_channels()
    conf.pop(label, None)
    _write_channels(conf)
    con.execute("UPDATE accounts SET active = 0 WHERE channel = ?", (label,))
    con.commit()
