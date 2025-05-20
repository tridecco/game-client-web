/**
 * @fileoverview Service Worker
 * @description Service worker for caching and offline support.
 */

const DYNAMIC_CACHE = 'dynamic';
const STATIC_CACHE = 'static';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') {
    return;
  }

  const url = new URL(req.url);
  const cdnUrl = CDN_URL === '' ? '' : new URL(CDN_URL);

  if (url.hostname === cdnUrl.hostname) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) {
          return cachedRes;
        }
        return fetch(req).then((networkRes) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        });
      }),
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          if (req.url.startsWith('http')) {
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        });
      })
      .catch(() => caches.match(req)),
  );
});
