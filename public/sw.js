/* BandQuest IELTS service worker — offline-safe learning content */
const CACHE = "bandquest-v1";
const CORE = ["/", "/manifest.json", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Never cache API or AI calls — always go to network
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        Response.json({ error: "You're offline. Cached lessons are available; AI and submissions need connection." }, { status: 503 })
      )
    );
    return;
  }

  // Cache-first for static assets, network-first for pages
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match("/offline.html")))
  );
});
