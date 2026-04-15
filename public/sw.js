const CACHE_NAME = 'dissignas-labyrint-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/css/game.css',
  '/manifest.json',
  '/icons/icon-192.svg',
];

const EXTERNAL_ASSETS = [
  'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS).then(() =>
        Promise.allSettled(
          EXTERNAL_ASSETS.map((url) =>
            fetch(url, { mode: 'cors' }).then((resp) => {
              if (resp.ok) cache.put(url, resp);
            })
          )
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response && response.status === 200 &&
            (response.type === 'basic' || response.type === 'cors')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
