"""Reach the dashboard from your phone, through Tailscale (a private network between your own devices).

`tailscale serve` gives the hub an HTTPS address that only your Tailscale devices can open. Nothing is put on
the open internet, and the hub itself keeps listening on 127.0.0.1 only.
"""
import json
import shutil
import subprocess
import threading
import time
from pathlib import Path

LOCAL_HOSTS = {"127.0.0.1", "localhost"}
CANDIDATES = [r"C:\Program Files\Tailscale\tailscale.exe", "/usr/bin/tailscale", "/Applications/Tailscale.app/Contents/MacOS/Tailscale"]
REFRESH_SECONDS = 60
ENABLE_SECONDS = 20

_cache = {"at": 0.0, "status": None}
_lock = threading.Lock()


def binary():
    found = shutil.which("tailscale")
    if found:
        return found
    for c in CANDIDATES:
        if Path(c).exists():
            return c
    return None


def _run(*args, timeout=15):
    exe = binary()
    if not exe:
        return None
    try:
        return subprocess.run([exe, *args], capture_output=True, text=True, timeout=timeout,
                              creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    except (OSError, subprocess.TimeoutExpired):
        return None


def status(port, fresh=False):
    """What the phone needs: is Tailscale installed, logged in, and is the hub served on it?"""
    with _lock:
        cached = _cache["status"]
        if not fresh and cached and cached.get("port") == port and time.time() - _cache["at"] < REFRESH_SECONDS:
            return cached
    st = {"installed": binary() is not None, "logged_in": False, "running": False, "dns_name": None,
          "serving": False, "url": None, "login_url": None, "port": port}
    if st["installed"]:
        r = _run("status", "--json")
        data = {}
        if r is not None and r.stdout.strip().startswith("{"):
            try:
                data = json.loads(r.stdout)
            except ValueError:
                data = {}
        backend = data.get("BackendState")
        st["running"] = backend == "Running"
        st["logged_in"] = backend not in (None, "NeedsLogin", "NoState")
        st["login_url"] = data.get("AuthURL") or None
        st["dns_name"] = ((data.get("Self") or {}).get("DNSName") or "").rstrip(".").lower() or None
        if st["running"] and st["dns_name"]:
            s = _run("serve", "status")
            text = (s.stdout + s.stderr) if s else ""
            st["serving"] = f"127.0.0.1:{port}" in text
            st["url"] = f"https://{st['dns_name']}" if st["serving"] else None
    with _lock:
        _cache.update(at=time.time(), status=st)
    return st


def enable(port):
    """Serve the hub (HTTPS) to your other Tailscale devices. Returns (ok, Tailscale's own message)."""
    exe = binary()
    if not exe:
        return False, ""
    try:
        r = subprocess.run([exe, "serve", "--bg", str(port)], capture_output=True, text=True, timeout=ENABLE_SECONDS,
                           creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        ok, text = r.returncode == 0, r.stdout + "\n" + r.stderr
    except subprocess.TimeoutExpired as e:
        # Tailscale waits when Serve must first be allowed on the account: it prints the link to do it
        parts = [p.decode("utf-8", "replace") if isinstance(p, bytes) else (p or "") for p in (e.stdout, e.stderr)]
        ok, text = False, "\n".join(parts)
    except OSError:
        return False, ""
    with _lock:
        _cache["at"] = 0.0
    return ok, " ".join(text.split())


def cached_hosts():
    """Host names the hub answers to. Only the cache is read here: this runs on every request."""
    hosts = set(LOCAL_HOSTS)
    st = _cache["status"]
    if st and st.get("dns_name"):
        hosts.add(st["dns_name"])
    return hosts


def start_refresher(port):
    """Keeps the Tailscale status fresh in the background (so requests never wait for it)."""
    def loop():
        while True:
            status(port, fresh=True)
            time.sleep(REFRESH_SECONDS)
    threading.Thread(target=loop, daemon=True, name="tailscale-status").start()
