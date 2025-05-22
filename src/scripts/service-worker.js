/**
 * @fileoverview Service Worker
 * @description Service worker for caching and offline support.
 */

const DYNAMIC_CACHE = 'dynamic';
const STATIC_CACHE = 'static';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/login',
  '/logout',
  '/register',
  '/password-reset',
  '/user',
  '/user/edit',
  '/user/account',
  '/user/settings',
  '/user/security',
  '/more',
  '/404',
  '/403',

  '/favicon.ico',
  '/css/style.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/user.js',
  '/img/default-avatar.svg',

  '/img/backgrounds/tridecco.jpg',
  '/img/backgrounds/wooden-board.jpg',
  '/img/backgrounds/broken-glass.jpg',
  '/img/backgrounds/composite-board.jpg',
  '/img/backgrounds/frosted-glass.jpg',
  '/img/backgrounds/galaxy.jpg',
  '/img/backgrounds/gold-leaf.jpg',
  '/img/backgrounds/leather.jpg',
  '/img/backgrounds/log.jpg',
  '/img/backgrounds/marble.jpg',
  '/img/backgrounds/metal-plate.jpg',
  '/img/backgrounds/sand.jpg',
  '/img/ranks/bg/iron.png',
  '/img/ranks/bg/bronze.png',
  '/img/ranks/bg/silver.png',
  '/img/ranks/bg/gold.png',
  '/img/ranks/bg/platinum.png',
  '/img/ranks/bg/diamond.png',
  '/img/ranks/bg/tridecco.png',
  '/img/ranks/nobg/iron.png',
  '/img/ranks/nobg/bronze.png',
  '/img/ranks/nobg/silver.png',
  '/img/ranks/nobg/gold.png',
  '/img/ranks/nobg/platinum.png',
  '/img/ranks/nobg/diamond.png',
  '/img/ranks/nobg/tridecco.png',
];

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
