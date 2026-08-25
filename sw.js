const CACHE_NAME = 'vibecheck-cache-v1';

// Daftar semua file yang sudah kita pecah tadi untuk disimpan offline
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/db.js',
  './js/ui.js',
  './js/tasks.js',
  './js/journal.js',
  './js/calendar-events.js',
  './js/alarm-media.js',
  './js/stats-export.js',
  './js/main.js',
  './manifest.json'
];

// Proses Install: Menyimpan file ke dalam Cache browser
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Proses Fetch: Saat aplikasi dibuka, cek cache dulu. 
// Kalau offline, ambil dari cache. Kalau online, ambil dari internet.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Proses Activate: Menghapus cache versi lama jika ada update file
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});