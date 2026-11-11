"""Telegram alerts for the dashboard itself, through its own bot (not the posting bot of a channel).

The bot token lives in .env (STATS_HUB_TELEGRAM_TOKEN); the chat to write to is found automatically
once you press Start in the bot, and kept in settings.json with the language of the messages.
"""
import json
import os

import httpx

from . import db, sync
from .messages import HubError, lang_of, msg

TOKEN_VAR = "STATS_HUB_TELEGRAM_TOKEN"
SETTINGS_FILE = db.ROOT / "settings.json"


class AlertError(HubError):
    pass


def _settings():
    try:
        return json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _save_settings(data):
    SETTINGS_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def language():
    return lang_of(_settings().get("lang"))


def handled_by_cloud():
    """True once the online version (GitHub) sends the automatic Telegram messages: the PC then stays quiet,
    so nothing arrives twice. Test messages from the Settings page still work."""
    return bool(_settings().get("telegram_by_cloud"))


def saved_language():
    """The language picked on the page, or None if never picked."""
    lang = _settings().get("lang")
    return lang_of(lang) if lang else None


def set_language(lang):
    conf = _settings()
    conf["lang"] = lang_of(lang)
    _save_settings(conf)


def _token():
    sync.load_env()
    return os.environ.get(TOKEN_VAR) or None


def _call(token, method, **params):
    """Telegram Bot API call. Errors never include the URL, which contains the token."""
    try:
        r = httpx.post(f"https://api.telegram.org/bot{token}/{method}", json=params, timeout=20)
    except httpx.HTTPError as e:
        raise AlertError("tg_unreachable", kind=type(e).__name__)
    try:
        data = r.json()
    except ValueError:
        data = {}  # not JSON (proxy or outage page)
    if r.status_code == 401 or r.status_code == 404:
        raise AlertError("token_refused")
    if not data.get("ok"):
        raise AlertError("tg_error", detail=data.get("description") or r.status_code)
    return data["result"]


def status():
    token, conf = _token(), _settings()
    return {"configured": bool(token), "bot": conf.get("telegram_bot"), "chat": conf.get("telegram_chat_name"),
            "connected": bool(token and conf.get("telegram_chat_id"))}


def connect(token=None):
    """Save the token (if given), then find the chat of the person who pressed Start in the bot."""
    if token:
        token = token.strip()
        if ":" not in token or len(token) < 30:
            raise AlertError("token_format")
        bot = _call(token, "getMe")
        _write_token(token)
        conf = _settings()
        conf["telegram_bot"] = bot.get("username")
        _save_settings(conf)
    token = _token()
    if not token:
        raise AlertError("no_token")
    chats = [u["message"]["chat"] for u in _call(token, "getUpdates")
             if u.get("message", {}).get("chat", {}).get("type") == "private"]
    if not chats:
        return status()  # not started yet: the page explains to press Start in the bot
    chat = chats[-1]
    conf = _settings()
    conf.update(telegram_chat_id=chat["id"], telegram_chat_name=chat.get("first_name") or chat.get("username"))
    _save_settings(conf)
    send(msg("alert_on", language()))
    return status()


def disconnect():
    _write_token(None)
    conf = _settings()
    for k in ("telegram_bot", "telegram_chat_id", "telegram_chat_name"):
        conf.pop(k, None)
    _save_settings(conf)


def _write_token(token):
    sync.write_env_var(TOKEN_VAR, token)


def send(text):
    """Send a message if alerts are set up. Returns True when sent."""
    token, chat = _token(), _settings().get("telegram_chat_id")
    if not token or not chat:
        return False
    _call(token, "sendMessage", chat_id=chat, text=text, disable_web_page_preview=True)
    return True


def _try_send(text):
    try:
        return send(text)
    except AlertError:
        return False  # no internet or Telegram down: tried again at the next sync


def error_text(e, lang):
    """A stored sync error ({code, params, error}) in the given language."""
    return msg(e["code"], lang, **e.get("params", {})) if e.get("code") else e.get("error", "")


def after_sync(alerted, errors, synced):
    """One message when a channel starts failing, one when it works again; nothing while it stays the same.

    alerted: channels already warned about (a warning that couldn't be delivered is retried next sync).
    synced: channels that synced fine this time. Returns (channels still warned about, messages sent).
    """
    lang = language()
    still, sent = [], []
    for e in errors:
        if e["channel"] in alerted:
            still.append(e["channel"])
            continue
        text = msg("alert_fail", lang, channel=e["channel"], error=error_text(e, lang))
        if _try_send(text):
            sent.append(text)
            still.append(e["channel"])
    for channel in alerted:
        if channel in synced:
            text = msg("alert_ok", lang, channel=channel)
            if _try_send(text):
                sent.append(text)
            elif _settings().get("telegram_chat_id"):
                still.append(channel)  # alerts on but Telegram down: say it next time
    return still, sent
