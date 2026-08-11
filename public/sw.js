const CACHE_NAME = "lukestyle-v2";
const OFFLINE_URL = "/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))),
    ])
  );
});

// Network-first, and only for full page navigations — not client-side RSC
// data fetches or static assets. Caching every GET response (the old
// behavior) meant a flaky connection could silently fall back to a stale
// cached copy of a dynamic page, including outdated app code, with no way
// for the user to tell. Static assets are already content-hashed and
// immutably cached by the browser's own HTTP cache, so they don't need
// help here, and RSC/action requests should always hit the network fresh
// since this app's data changes constantly.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_URL)))
  );
});
