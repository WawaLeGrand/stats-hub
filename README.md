# Stats Hub

Your private dashboard for all your TikTok and Instagram accounts. It runs on your PC and opens in your browser.
Nobody else can see it.

## Start it

- **Your real accounts:** double-click `Start dashboard.bat`. It syncs from Zernio right away, then every 6 hours
  while it stays open. The "Sync now" link at the top right syncs on demand.
- **Demo (example data):** double-click `Start dashboard (demo).bat`.
- **Sync once without opening the dashboard:** `.venv\Scripts\python hub.py --sync`

The dashboard opens at http://127.0.0.1:8000. Close the black window to stop it.

## Connect a channel (Zernio)

Easiest: open the **Settings** tab, type the channel's name, paste its Zernio API key (and optionally the
channel's project folder), then click **Check and add**. The key is checked with Zernio, saved in `.env`, and the
channel syncs right away. **Remove** deletes the key from this computer; the stats already saved stay hidden.

By hand, if you prefer:

1. In the `.env` file of this folder, add one line per channel (one Zernio account per channel):
   ```
   ZERNIO_API_KEY_MYCHANNEL=your key
   ZERNIO_API_KEY_SPACE=another key
   ```
   The word after `ZERNIO_API_KEY_` is the channel's label. Never share this file.
2. Optional, in `channels.json`: the channel's display name and its local repo folder. The repo lets the hub
   find each post's category (from `posts_log.jsonl`, `state.json` or the title in the caption). Before each
   sync the hub runs `git pull --ff-only` in that folder (only when it is a git repo with no local changes), so
   the posts the channel's automation logged on GitHub are known; if the pull fails it prints one line and syncs anyway.
3. Restart the hub. Every TikTok and Instagram account connected in that Zernio account shows up on its own.

Good to know: TikTok follower history starts the day the account was connected to Zernio; Instagram history
starts with the hub's first sync. Zernio can take a while to include brand-new posts.

## Pages

- **Overview:** total followers, views, median views per post, engagement rate, posts per week, follower and
  views charts, and a table of every account (click a column to sort, click an account to open it).
- **Top posts:** your best posts across all accounts, by views or by shares.
- **Insights:** best days and times to post (Paris time), and performance by category.
- Filters at the top: period (7 / 30 / 90 days), platform, and group (niche, language...).
- **Settings:** light mode on/off, language (English / Français, also used for the Telegram alerts),
  Telegram alerts, and your channels (add or remove a Zernio key).
- The language can also be switched at any time with **EN / FR** at the top right.

## On your phone (the dashboard as an app)

The dashboard installs on a phone like an app (icon on the home screen, full screen, bottom tabs, pull down to
refresh, works offline with the last saved numbers). It reaches this PC through **Tailscale**, a private link
between your own devices: nothing is put on the internet.

1. Once: allow "Serve" on your Tailscale account (Settings -> On your phone shows the link), then click
   **Turn on phone access**.
2. On the phone: install the Tailscale app, log in with the same account, scan the QR code shown in Settings.
3. iPhone: Share -> Add to Home Screen. Android: menu -> Install app.

The PC must be on with the dashboard running. Also new: change vs the period before on every headline number,
Creator Rewards progress per TikTok account, a details sheet with a growth curve for every post, CSV export,
and a weekly Telegram summary on Monday morning (switch in Settings).

## Online version (no PC needed)

GitHub updates the numbers every 15 minutes (`.github/workflows/cloud.yml`): it syncs from Zernio, encrypts
everything with your password (AES-256) and publishes the app on GitHub Pages. The page computes the numbers
itself (`static/stats.js`, checked against `app/stats.py`). Only your password opens them.

- Secrets on GitHub: `HUB_ENV` (the .env content), `HUB_CONFIG` (channels + Telegram chat, `python tools/cloud.py setup`),
  `HUB_PASSWORD`, `HUB_REFRESH_TOKEN` (fine-grained token, Actions read/write on this repository only, for the Update button).
- The encrypted database lives on the `state` branch (one commit, replaced at each run).
- Telegram alerts and the weekly summary are sent by GitHub; the PC stays quiet (`telegram_by_cloud` in settings.json).
- To add a channel online: add its line to `HUB_ENV`, and the channel to `HUB_CONFIG`.
- Phone (Android): open the address in Chrome, type the password once, menu -> Install app.

## Your keys

All keys stay in the `.env` file of this folder (one line per channel + the Telegram bot token). Updates of the
dashboard never touch it, and the audit checks that it is left exactly as it was. Keep a copy of `.env` somewhere
safe and private (not online): it's the only place the keys are stored.

## Telegram alerts

Settings → Telegram alerts. The dashboard uses **its own bot**, separate from the posting alerts of your channels:
create it with @BotFather (/newbot), paste its token, press Start in the bot, then "I pressed Start".
You get one message when a channel can't be synced, and one when it works again (nothing in between).
Alerts are sent while the dashboard is open: it only syncs then. Connection problems with Zernio are already
reported every morning by each channel's posting system, even with this PC off.

## How the numbers are counted

- **Median views:** the typical post. One viral video doesn't change it, unlike the average.
- **Engagement rate:** (likes + comments + shares) ÷ views.
- **Growth:** followers today minus followers N days ago, from the daily snapshots the hub saves.

## Files

```
hub.py          starts the hub
app/db.py       database (data/hub.db: your data, data/demo.db: example data)
app/stats.py    all the calculations
app/sync.py     Zernio sync (all keys in .env), app/zernio.py the API client
app/demo.py     example data generator
app/messages.py every server message, in English and French
app/server.py   the local web server
static/         the dashboard page
tools/audit.py  full audit (61 checks, works on copies): .venv\Scripts\python tools\audit.py <empty temp folder>
```

## Next steps

Done: Zernio sync (several channels), automatic sync every 6 hours, Telegram alerts, light/dark mode.

Possible later:
1. `.exe` version.
2. Phone access: a small server + Tailscale. The server only answers to `127.0.0.1`/`localhost` (protection
   against DNS rebinding): add the Tailscale name to `LOCAL_HOSTS` in `app/server.py` at that point.
3. More Instagram Reels details (skip rate, completion, retention).
4. Direct TikTok and Instagram connections for accounts outside Zernio (only if needed).
