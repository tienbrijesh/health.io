const CACHE_NAME = 'titan-os-v1.1';
const STATIC_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com'
];

// Install Event - Caching App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Titan SW] Caching Static Assets');
      // Using cache.addAll with relative paths is safer for generic deployments
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[Titan SW] Pre-caching failed, continuing with dynamic cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  // Skip cross-origin (except tailwind) or non-GET requests
  const isTailwind = event.request.url.includes('tailwindcss.com');
  const isInternal = event.request.url.startsWith(self.location.origin);
  
  if (event.request.method !== 'GET' || (!isInternal && !isTailwind)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Only cache successful local requests
        if (networkResponse && networkResponse.status === 200 && (isInternal || isTailwind)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Silent catch for network failures
        return cachedResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});