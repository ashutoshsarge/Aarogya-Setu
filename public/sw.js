// AarogyaSetu Pune Service Worker - Rural Offline Resilient Cache & Sync
const CACHE_NAME = 'aarogya-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching assets encountered an error (continuing):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version or fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // If valid response, update cache in background
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }
          // If request is navigation, return cached /index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// Background sync and message listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_LOCAL_DATA') {
    // Acknowledge sync request from main thread
    event.ports[0]?.postMessage({ status: 'SYNC_ACKNOWLEDGED', timestamp: Date.now() });
  }
});
