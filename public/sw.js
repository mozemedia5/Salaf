// Salaf Platform Service Worker v3
// Strategy:
//   - Static shell assets (icons, manifest): cache-first
//   - Navigation requests (HTML): network-first, fallback to cached /index.html
//   - Hashed build assets (JS/CSS): network-first, cache on success
//   - Cross-origin requests (Firebase, Google, CDNs): never intercepted

const CACHE_VERSION = 'v3';
const CACHE_NAME = `salaf-${CACHE_VERSION}`;

// Small, stable same-origin assets safe to keep in cache-first.
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        // Use individual fetches so one bad asset doesn't abort the whole install.
        Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
      )
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ───────────────────────────────────────────────────────────────
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

// ─── Helpers ────────────────────────────────────────────────────────────────
function isStaticAsset(url) {
  return STATIC_ASSETS.some((path) => url.pathname === path);
}

function isCrossOrigin(url) {
  return url.origin !== self.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Store a fresh copy of index.html in the cache whenever we successfully
// fetch it so offline/fallback always has the latest version.
async function cacheResponse(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

// ─── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 1. Never touch cross-origin requests (Firebase, Google APIs, etc.).
  if (isCrossOrigin(url)) return;

  // 2. Cache-first for the small, long-lived static shell assets.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches
        .match(request)
        .then((cached) => cached || fetch(request).then((res) => cacheResponse(request, res)))
    );
    return;
  }

  // 3. Network-first for everything else (navigation + hashed JS/CSS).
  //    On failure, fall back to cache; for navigation fall back to index.html.
  event.respondWith(
    fetch(request)
      .then((response) => cacheResponse(request, response))
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // For navigation requests (page loads) serve cached index.html so
        // the app can at least boot offline and show content from Firestore cache.
        if (isNavigationRequest(request)) {
          const indexFallback = await caches.match('/index.html');
          if (indexFallback) return indexFallback;
        }

        // Last resort — return a minimal offline page rather than a crash.
        if (isNavigationRequest(request)) {
          return new Response(
            `<!doctype html><html lang="en"><head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
              <title>Salaf — Offline</title>
              <style>
                body{margin:0;display:flex;align-items:center;justify-content:center;
                     min-height:100vh;font-family:sans-serif;background:#f0fdf4;color:#064e3b}
                .card{text-align:center;padding:2rem;max-width:320px}
                h1{font-size:1.5rem;font-weight:700;margin-bottom:.5rem}
                p{font-size:.9rem;color:#065f46;margin-bottom:1.5rem}
                button{padding:.75rem 1.5rem;background:#059669;color:#fff;border:none;
                       border-radius:.75rem;font-size:1rem;cursor:pointer}
              </style>
            </head><body>
              <div class="card">
                <h1>You're Offline</h1>
                <p>Please check your internet connection and try again.</p>
                <button onclick="location.reload()">Retry</button>
              </div>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        }

        return Response.error();
      })
  );
});
