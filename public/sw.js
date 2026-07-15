const CACHE_NAME = 'salaf-pwa-v1';
const STATIC_CACHE = 'salaf-static-v1';
const DYNAMIC_CACHE = 'salaf-dynamic-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[PWA] Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[PWA] Caching static assets');
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('[PWA] Cache addAll error:', err);
        });
      }),
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[PWA] Cache opened:', CACHE_NAME);
        return cache;
      })
    ])
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[PWA] Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[PWA] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim clients to activate immediately
  self.clients.claim();
});

// Fetch event - Network first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Network first for API calls
  if (url.pathname.includes('/api/') || url.pathname.includes('firestore')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).catch(() => {
            return new Response('Offline', { status: 503 });
          });
        })
    );
  } else {
    // Cache first strategy for static assets
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request).then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
            
            return response;
          });
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
  }
});
