// Service Worker con caché offline
var CACHE = 'aprende-v5';

// Ficheros a cachear al instalar
var PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/base.css',
  '/css/components.css',
  '/css/screens.css',
  '/js/storage.js',
  '/js/ui.js',
  '/js/navigation.js',
  '/js/medals.js',
  '/js/avatar.js',
  '/js/perfiles.js',
  '/js/sciences.js',
  '/js/english.js',
  '/js/padres.js',
  '/js/descripciones.js',
  '/js/mates.js',
  '/js/lengua.js',
  '/js/comprension.js',
  '/js/app.js',
  '/screens/english.html',
  '/screens/sciences.html',
  '/screens/perfiles.html',
  '/screens/cursos.html',
  '/screens/home.html',
  '/screens/mates.html',
  '/screens/lengua.html',
  '/screens/avatar.html',
  '/screens/padres.html',
  '/screens/descripciones.html',
  '/screens/wip.html',
  '/data/curso3/config.json',
  '/data/curso3/ejercicios-gram.json',
  '/data/curso3/ejercicios-mates.json',
  '/data/curso3/historias.json',
  '/data/curso3/descripciones.json',
  '/data/curso3/sciences.json',
  '/data/curso3/english.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Instalar — cachear todos los ficheros principales
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activar — borrar cachés antiguas
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch — cache first para assets, network first para datos dinámicos
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Imágenes de descripciones — cache first
  if (url.indexOf('/data/imagenes/') !== -1) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(response) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
          return response;
        }).catch(function() { return new Response('', {status: 404}); });
      })
    );
    return;
  }

  // Resto — network first con fallback a caché
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Cachear respuestas válidas
      if (response && response.status === 200 && e.request.method === 'GET') {
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
      }
      return response;
    }).catch(function() {
      // Sin red — devolver desde caché
      return caches.match(e.request).then(function(cached) {
        return cached || new Response('Sin conexión', {status: 503});
      });
    })
  );
});
