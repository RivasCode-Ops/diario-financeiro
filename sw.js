const CACHE = 'diario-financeiro-v3';
const PRECACHE = [
  './',
  './index.html',
  './index-legado.html',
  './css/tokens.css',
  './css/app.css',
  './app-shell.js',
  './diario.css',
  './diario.js',
  './manifest.webmanifest',
  './icons/icon.svg'
];

const NETWORK_FIRST = /\.(html?|js|css|mjs)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const networkFirst = NETWORK_FIRST.test(url.pathname);

  event.respondWith(
    (networkFirst
      ? fetch(event.request)
          .then((res) => {
            if (res && res.status === 200 && res.type === 'basic') {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(event.request, copy));
            }
            return res;
          })
          .catch(() => caches.match(event.request))
      : caches.match(event.request).then(
          (cached) =>
            cached ||
            fetch(event.request).then((res) => {
              if (!res || res.status !== 200 || res.type !== 'basic') return res;
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(event.request, copy));
              return res;
            })
        ))
  );
});
