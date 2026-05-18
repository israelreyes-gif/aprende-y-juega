// Service Worker — versión dinámica basada en fecha de build
// Cambia automáticamente con cada deploy en Netlify
var CACHE = 'aprendeyjuega-20260518221319';
var ASSETS = [
  '/', '/index.html',
  '/css/base.css', '/css/components.css', '/css/screens.css',
  '/js/storage.js', '/js/medals.js', '/js/navigation.js', '/js/ui.js',
  '/js/mates.js', '/js/lengua.js', '/js/comprension.js', '/js/app.js',
  '/data/ejercicios-mates.json', '/data/ejercicios-gram.json', '/data/historias.json',
  '/screens/cursos.html', '/screens/home.html', '/screens/mates.html', '/screens/lengua.html', '/screens/wip.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
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
        return caches.match('/index.html');
      });
    })
  );
});
