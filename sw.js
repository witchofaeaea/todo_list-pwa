// Dosyaları değiştirdiğinde sürümü artır, böylece telefonlardaki eski önbellek yenilenir.
const CACHE_NAME = 'todo-pwa-v2';

// Yeni bir js/ ya da css/ dosyası eklersen buraya da ekle (çevrimdışı açılış için).
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './css/base.css',
  './css/controls.css',
  './css/todos.css',
  './css/toast.css',
  './js/main.js',
  './js/store.js',
  './js/storage.js',
  './js/todo-model.js',
  './js/selectors.js',
  './js/dates.js',
  './js/dom.js',
  './js/view.js',
  './js/todo-item.js',
  './js/list-controller.js',
  './js/drag.js',
  './js/toast.js',
  './js/actions.js',
  './js/pwa.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Önce ağ, olmazsa önbellek: online iken her zaman güncel sürüm, offline iken önbellek.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request, { ignoreSearch: true }).then(
          cached => cached || caches.match('./index.html')
        )
      )
  );
});
