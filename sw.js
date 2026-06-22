/* Service worker: cache the app shell so the PWA opens offline.
   Digest JSON is NOT cached here — the page handles offline data via
   localStorage (so it can reliably tell "fresh" from "last fetched"). */
const SHELL = "nd-shell-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.map((k) => (k === SHELL ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.endsWith(".json")) return;          // data: always go to network
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));   // shell: cache-first
});
