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

  '/libs/tridecco-board/0.4.2/tridecco-board.min.js',
  '/libs/tridecco-board/0.4.2//assets/grids/black.png',
  '/libs/tridecco-board/0.4.2//assets/grids/blue.png',
  '/libs/tridecco-board/0.4.2//assets/grids/cyan.png',
  '/libs/tridecco-board/0.4.2//assets/grids/green.png',
  '/libs/tridecco-board/0.4.2//assets/grids/magenta.png',
  '/libs/tridecco-board/0.4.2//assets/grids/red.png',
  '/libs/tridecco-board/0.4.2//assets/grids/white.png',
  '/libs/tridecco-board/0.4.2//assets/grids/yellow.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/index.json',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/hexagons/blue.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/hexagons/red.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/hexagons/white.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/hexagons/yellow.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/empty-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/empty.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/blue-white-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/blue-white.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/red-blue-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/red-blue.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/red-yellow-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/red-yellow.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/white-red-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/white-red.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/yellow-blue-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/normal/tiles/yellow-blue.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/normal/index.json',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/hexagons/blue.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/hexagons/red.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/hexagons/white.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/hexagons/yellow.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/empty-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/empty.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/blue-white-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/blue-white.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/red-blue-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/red-blue.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/red-yellow-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/red-yellow.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/white-red-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/white-red.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/yellow-blue-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/rgbblind/tiles/yellow-blue.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/normal/index.json',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/hexagons/blue.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/hexagons/red.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/hexagons/white.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/hexagons/yellow.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/empty-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/empty.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/blue-white-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/blue-white.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/red-blue-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/red-blue.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/red-yellow-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/red-yellow.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/white-red-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/white-red.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/yellow-blue-flipped.png',
  '/libs/tridecco-board/0.4.2//assets/textures/classic/monochrome/tiles/yellow-blue.png',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/wooden-board.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/broken-glass.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/composite-board.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/frosted-glass.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/galaxy.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/gold-leaf.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/leather.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/log.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/marble.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/metal-plate.jpg',
  '/libs/tridecco-board/0.4.2//assets/backgrounds/sand.jpg',
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
