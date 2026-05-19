// Service Worker — caché tolerante a fallos
var CACHE = 'aprendeyjuega-20260519154000';

var ASSETS = [
  '/aprende-y-juega/',
  '/aprende-y-juega/index.html',
  '/aprende-y-juega/css/base.css',
  '/aprende-y-juega/css/components.css',
  '/aprende-y-juega/css/screens.css',
  '/aprende-y-juega/js/storage.js',
  '/aprende-y-juega/js/medals.js',
  '/aprende-y-juega/js/navigation.js',
  '/aprende-y-juega/js/ui.js',
  '/aprende-y-juega/js/mates.js',
  '/aprende-y-juega/js/lengua.js',
  '/aprende-y-juega/js/comprension.js',
  '/aprende-y-juega/js/app.js',
  '/aprende-y-juega/data/ejercicios-mates.json',
  '/aprende-y-juega/data/ejercicios-gram.json',
  '/aprende-y-juega/data/historias.json',
  '/aprende-y-juega/screens/cursos.html',
  '/aprende-y-juega/screens/home.html',
  '/aprende-y-juega/screens/mates.html',
  '/aprende-y-juega/screens/lengua.html',
  '/aprende-y-juega/screens/wip.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Cachear uno a uno — si alguno falla no rompe todo
      return Promise.all(
        ASSETS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('SW: no se pudo cachear ' + url + ':', err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() {
        return caches.match('/aprende-y-juega/index.html');
      });
    })
  );
});
