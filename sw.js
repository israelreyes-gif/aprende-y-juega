// Service Worker — limpia todas las cachés anteriores y se desinstala
var CACHE = 'aprendeyjuega-disabled-20260519160000';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        console.log('SW: borrando caché antigua:', k);
        return caches.delete(k);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Sin caché — siempre red directa
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request));
});
