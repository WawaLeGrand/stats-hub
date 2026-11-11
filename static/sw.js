// Stats Hub service worker: the app opens instantly on the phone, and still shows the last known numbers
// when the PC (or the online version) can't be reached. Network first, cache as a fallback.
// Paths are relative to where the app lives: the PC's address, or a sub-folder online.
const VERSION = "__VERSION__";
const SHELL = `shell-${VERSION}`;
const API = "api-v1";
const CDN = "cdn-v1";
const CDN_HOSTS = ["cdn.jsdelivr.net", "cdnjs.cloudflare.com"];
const HERE = new URL("./", self.location).href;  // the app's own folder
const PRECACHE = [
  "./", "static/app.js", "static/stats.js", "static/style.css", "manifest.webmanifest", "cloud-config.js",
  "static/icons/icon.svg", "static/icons/icon-192.png",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js",
  "https://cdn.jsdelivr.net/npm/simple-icons@16.33.0/icons/tiktok.svg",
  "https://cdn.jsdelivr.net/npm/simple-icons@16.33.0/icons/instagram.svg",
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const shell = await caches.open(SHELL), cdn = await caches.open(CDN);
    await Promise.all(PRECACHE.map(async path => {
      const url = new URL(path, HERE).href;
      try {
        const res = await fetch(url, { cache: "no-cache" });
        if (res.ok || res.type === "opaque") await (url.startsWith(HERE) ? shell : cdn).put(url, res);
      } catch {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const key of await caches.keys()) if (![SHELL, API, CDN].includes(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    if (CDN_HOSTS.includes(url.hostname)) e.respondWith(cacheFirst(CDN, req));
    return;
  }
  if (!url.href.startsWith(HERE)) return;  // another site on the same domain: not ours
  const path = url.href.slice(HERE.length).split(/[?#]/)[0];
  if (path === "sw.js") return;
  if (path.startsWith("api/")) {
    if (path.startsWith("api/export")) return;  // a download, never cached
    e.respondWith(networkFirst(API, req, 10000));
    return;
  }
  if (path === "data.enc") {  // the online version's encrypted numbers: one copy, whatever the query
    e.respondWith(networkFirst(API, req, 15000, null, new URL("data.enc", HERE).href));
    return;
  }
  e.respondWith(networkFirst(SHELL, req, 8000, req.mode === "navigate" ? HERE : null));
});

const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);

async function cacheFirst(name, req) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") cache.put(req, res.clone());
  return res;
}

// a cached copy, marked so the page can say "offline, numbers from <time>"
async function fromCache(name, key) {
  const hit = await caches.match(key, { cacheName: name });
  if (!hit) return null;
  const headers = new Headers(hit.headers);
  headers.set("X-Offline", "1");
  return new Response(await hit.blob(), { status: hit.status, statusText: hit.statusText, headers });
}

async function networkFirst(name, req, ms, fallbackPath, key) {
  const cache = await caches.open(name);
  try {
    const res = await withTimeout(fetch(req), ms);
    if (res.ok) cache.put(key || req, res.clone());
    return res;
  } catch {
    const cached = (await fromCache(name, key || req)) || (fallbackPath && (await fromCache(name, fallbackPath)));
    return cached || new Response(JSON.stringify({ detail: "offline" }),
      { status: 503, headers: { "Content-Type": "application/json", "X-Offline": "1" } });
  }
}
