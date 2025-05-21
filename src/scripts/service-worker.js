/**
 * @fileoverview Service Worker
 * @description Service worker for caching and offline support.
 */

const DYNAMIC_CACHE = 'dynamic';
const STATIC_CACHE = 'static';

const PRECACHE_ASSETS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
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

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        })
        .catch(() =>
          caches
            .match(req)
            .then((cachedRes) => cachedRes || caches.match('/offline')),
        ),
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
