"""Start the stats hub and open the dashboard in your browser.

Usage:
    python hub.py           # your real data (data/hub.db), synced from Zernio now and every 6 hours
    python hub.py --demo    # example data (data/demo.db), rebuilt at each start
    python hub.py --sync    # sync once and quit
"""
import argparse
import socket
import threading
import webbrowser
from datetime import datetime

import uvicorn
from apscheduler.schedulers.background import BackgroundScheduler

from app import db, demo, digest, remote, server, sync

SYNC_EVERY_HOURS = 6
DIGEST_CHECK_MINUTES = 30


def sync_and_report():
    summary = sync.run()
    for c in summary.get("channels", []):
        print(f"  synced {c['channel']}: {c['accounts']} accounts, {c['posts']} posts")
    for e in summary.get("errors", []):
        print(f"  problem with {e['channel']}: {e['error']}")
    return summary


def port_in_use(port):
    """True when something (usually the hub, started earlier) already answers on that port."""
    with socket.socket() as s:
        s.settimeout(1)
        return s.connect_ex(("127.0.0.1", port)) == 0


def main():
    parser = argparse.ArgumentParser(description="Stats hub for your TikTok and Instagram accounts")
    parser.add_argument("--demo", action="store_true", help="show example data instead of your accounts")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--no-browser", action="store_true", help="don't open the browser")
    parser.add_argument("--sync", action="store_true", help="sync from Zernio once and quit")
    args = parser.parse_args()

    url = f"http://127.0.0.1:{args.port}"
    if not args.sync and port_in_use(args.port):
        print(f"The stats hub is already running: opening {url}")
        if not args.no_browser:
            webbrowser.open(url)
        return

    if args.sync:
        if not sync.zernio_keys():
            raise SystemExit("No Zernio key found. Add ZERNIO_API_KEY_<CHANNEL>=... to the .env file.")
        print("Syncing...")
        sync_and_report()
        return

    if args.demo:
        demo.build(db.DEMO_DB)
        server.configure(db.DEMO_DB, demo=True, port=args.port)
    else:
        server.configure(db.HUB_DB, demo=False, port=args.port)
        # runs even with no key yet: channels added from the dashboard are picked up by the next sync
        scheduler = BackgroundScheduler()
        scheduler.add_job(sync_and_report, "interval", hours=SYNC_EVERY_HOURS, next_run_time=datetime.now())
        scheduler.add_job(digest.tick, "interval", minutes=DIGEST_CHECK_MINUTES)  # Monday-morning summary
        scheduler.start()

    remote.start_refresher(args.port)  # keeps the phone address (Tailscale) known to the server
    phone = remote.status(args.port, fresh=True)
    print(f"Stats hub is running at {url}  (close this window to stop it)")
    if phone.get("url"):
        print(f"On your phone (Tailscale): {phone['url']}")
    if not args.no_browser:
        threading.Timer(1.5, webbrowser.open, [url]).start()
    uvicorn.run(server.app, host="127.0.0.1", port=args.port, log_level="warning")


if __name__ == "__main__":
    main()
