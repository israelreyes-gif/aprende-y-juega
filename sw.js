// Service Worker con caché offline
var CACHE = 'aprende-v20';

// Ficheros a cachear al instalar
var PRECACHE = [
  // El SW cachea automáticamente al navegar (network first)
  // No precacheamos para evitar errores de instalación
];

// Instalar — cachear ficheros principales (tolerante a errores)
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Cachear uno a uno para que un fallo no bloquee toda la instalación
      return Promise.all(
        PRECACHE.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('SW: no se pudo cachear ' + url, err);
          });
        })
      );
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

  // APIs externas de terceros (traducción, etc.) — nunca interceptar ni
  // cachear, dejar pasar tal cual. Envolver estas peticiones con
  // cache:'no-cache' o meterlas en la Cache API puede romper la respuesta
  // CORS de servicios externos.
  if (url.indexOf('mymemory.translated.net') !== -1) {
    e.respondWith(fetch(e.request));
    return;
  }

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

  // API del Worker — nunca cachear
  if (url.indexOf('workers.dev') !== -1) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Resto — network first con fallback a caché.
  // cache:'no-cache' hace una petición condicional: el navegador
  // le pregunta al servidor "¿ha cambiado esto desde la última
  // vez?" (usando Last-Modified/ETag). Si no ha cambiado, el
  // servidor responde con un 304 minúsculo y se usa la copia
  // local — rápido. Si SÍ ha cambiado, descarga el archivo
  // completo. Así nunca sirve algo caducado sin tener que
  // descargar todo de cero cada vez.
  e.respondWith(
    fetch(new Request(e.request, { cache: 'no-cache' })).then(function(response) {
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
