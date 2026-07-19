// Salaf Platform Service Worker
// Strategy: network-first for the app shell/navigation and hashed build
// assets (so users always get the latest deploy), cache-first only for
// small static shell assets (icons/manifest). Cross-origin requests
// (Firebase Auth/Firestore/Storage etc.) are never intercepted.

const CACHE_VERSION = 'v2';
const CACHE_NAME = `salaf-${CACHE_VERSION}`;

// Small, stable, same-origin assets safe to cache-first.
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  // Activate this SW as soon as it finishes installing, don't wait for
  // old tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return STATIC_ASSETS.some((path) => url.pathname === path);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept cross-origin requests (Firebase Auth/Firestore/
  // Storage, Google APIs, analytics, etc.) — let the browser handle them
  // natively so real-time/streaming calls aren't touched by the cache.
  if (url.origin !== self.location.origin) return;

  // Cache-first for known static shell assets (icons/manifest) — these
  // rarely change and are cheap to keep around.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Network-first for everything else same-origin: navigation requests
  // and hashed build assets (JS/CSS emitted by Vite). This guarantees the
  // latest deployed build is used, and only falls back to a cached copy
  // when the network is unavailable (offline support) instead of ever
  // serving a stale shell pointing at deleted hashed chunk files.
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful, basic (same-origin) responses.
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return Response.error();
        })
      )
  );
});
