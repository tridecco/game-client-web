/**
 * @fileoverview Service Worker
 * @description Service worker for caching and offline support.
 */

const DYNAMIC_CACHE = 'dynamic';
const STATIC_CACHE = 'static';

const PRECACHE_ASSETS = [
  '/',
  '/404',
  '/403',
  '/offline',
  '/single',
  '/single/game',
  '/single/game?difficulty=beginner',
  '/single/game?difficulty=easy',
  '/single/game?difficulty=normal',
  '/single/game?difficulty=hard',
  '/single/game?difficulty=insane',
  '/single/statistics',
  '/single/settings',

  '/favicon.ico',

  '/audio/bgm/dance.mp3',
  '/audio/bgm/nocturne.mp3',
  '/audio/bgm/waltz.mp3',
  '/audio/sfx/click.wav',
  '/audio/sfx/defeat.wav',
  '/audio/sfx/double.wav',
  '/audio/sfx/pop.wav',
  '/audio/sfx/single.wav',
  '/audio/sfx/tridecco.wav',
  '/audio/sfx/victory.wav',

  '/css/styles.css',

  '/font/tridecco.ttf',

  '/img/default-avatar.svg',
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
  '/img/backgrounds/tridecco.jpg',
  '/img/backgrounds/wooden-board.jpg',

  '/js/app.js',
  '/js/single/game.js',
  '/js/single/history.js',

  '/libs/canvas-confetti/1.9.3/confetti.browser.js',

  '/libs/tridecco-board/0.7.0/tridecco-board.min.js',

  '/libs/tridecco-board/0.7.0/assets/backgrounds/broken-glass.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/composite-board.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/frosted-glass.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/galaxy.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/gold-leaf.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/leather.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/log.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/marble.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/metal-plate.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/sand.jpg',
  '/libs/tridecco-board/0.7.0/assets/backgrounds/wooden-board.jpg',

  '/libs/tridecco-board/0.7.0/assets/grids/black.png',
  '/libs/tridecco-board/0.7.0/assets/grids/blue.png',
  '/libs/tridecco-board/0.7.0/assets/grids/cyan.png',
  '/libs/tridecco-board/0.7.0/assets/grids/green.png',
  '/libs/tridecco-board/0.7.0/assets/grids/magenta.png',
  '/libs/tridecco-board/0.7.0/assets/grids/red.png',
  '/libs/tridecco-board/0.7.0/assets/grids/white.png',
  '/libs/tridecco-board/0.7.0/assets/grids/yellow.png',

  '/libs/tridecco-board/0.7.0/assets/textures-bundle/classic/monochrome/atlas.webp',
  '/libs/tridecco-board/0.7.0/assets/textures-bundle/classic/monochrome/index.json',

  '/libs/tridecco-board/0.7.0/assets/textures-bundle/classic/normal/atlas.webp',
  '/libs/tridecco-board/0.7.0/assets/textures-bundle/classic/normal/index.json',

  '/libs/tridecco-board/0.7.0/assets/textures-bundle/classic/rgbblind/atlas.webp',
  '/libs/tridecco-board/0.7.0/assets/textures-bundle/classic/rgbblind/index.json',
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
