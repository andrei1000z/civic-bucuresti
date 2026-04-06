// Civia — Minimal Service Worker
// Strategy: network-first for HTML/API, cache-first for static assets.

const CACHE_VERSION = "v2";
const STATIC_CACHE = `civia-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `civia-runtime-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  // Ghiduri — precached for offline reading
  "/ghiduri",
  "/ghiduri/ghid-biciclist",
  "/ghiduri/ghid-cutremur",
  "/ghiduri/ghid-vara",
  "/ghiduri/ghid-transport",
  "/ghiduri/ghid-cetatean",
  "/ghiduri/ghid-sesizari",
  // Key pages
  "/sesizari",
  "/harti",
  "/bilete",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== "GET") return;

  // Skip cross-origin
  if (url.origin !== self.location.origin) return;

  // Skip Next.js internal routes (RSC, prefetches)
  if (url.pathname.startsWith("/_next/data")) return;

  // API routes: network-only (don't cache dynamic data)
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(woff2|woff|ttf|png|jpg|jpeg|svg|ico|webp|json)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML documents: network-first, fallback to cache, then offline page
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match("/offline.html"))
        )
    );
    return;
  }
});
