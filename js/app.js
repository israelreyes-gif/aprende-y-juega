/* =============================================
   APP.JS — Inicialización y carga de pantallas
   Arranque: pantallas críticas → datos → init
   ============================================= */

/* Version para cache-busting de las pantallas HTML (fetch no lleva
   parametro de version salvo que se lo añadamos aqui). Subir este
   numero cada vez que cambie cualquier screens/*.html. */
var SCREENS_V = '1789587730';

/* Pantallas que se cargan al arranque (críticas) */
var SCREENS_CRITICAL = [
  'screens/perfiles.html',
  'screens/cursos.html',
  'screens/home.html',
  'screens/wip.html'
];

/* Resto de pantallas — se cargan bajo demanda */
var SCREENS_LAZY = [
  'screens/mates.html',
  'screens/lengua.html',
  'screens/english.html',
  'screens/sciences.html',
  'screens/sociales.html',
  'screens/padres.html',
  'screens/avatar.html',
  'screens/descripciones.html',
  'screens/vacaciones.html',
  'screens/curso4.html',
  'screens/curso4-english.html'
];

/* Registro de pantallas ya cargadas */
var _loadedScreens = {};

/* ---- Cargar pantallas críticas al arranque ---- */
function loadScreens(callback) {
  var loaded = 0;
  var container = document.getElementById('app');
  SCREENS_CRITICAL.forEach(function(file) {
    fetch(file + '?v=' + SCREENS_V)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        container.insertAdjacentHTML('beforeend', html);
        _loadedScreens[file] = true;
        loaded++;
        if (loaded === SCREENS_CRITICAL.length) callback();
      })
      .catch(function(e) {
        showError('carga de pantalla ' + file, e);
        loaded++;
        if (loaded === SCREENS_CRITICAL.length) callback();
      });
  });
}

/* ---- Cargar pantalla bajo demanda ---- */
function loadScreenLazy(screenId, callback) {
  /* Buscar qué archivo corresponde al screenId */
  var fileMap = {
    's-mates': 'screens/mates.html',
    's-mates-exercises': 'screens/mates.html',
    's-sumas': 'screens/mates.html',
    's-multi': 'screens/mates.html',
    's-prob': 'screens/mates.html',
    's-mix': 'screens/mates.html',
    's-lengua': 'screens/lengua.html',
    's-lengua-exercises': 'screens/lengua.html',
    's-gramatica': 'screens/lengua.html',
    's-comprension': 'screens/lengua.html',
    's-dictado': 'screens/lengua.html',
    's-descripciones': 'screens/descripciones.html',
    's-english': 'screens/english.html',
    's-english-study': 'screens/english.html',
    's-english-exercises': 'screens/english.html',
    's-english-vocab': 'screens/english.html',
    's-vocab-ex-w2i': 'screens/english.html',
    's-vocab-ex-i2w': 'screens/english.html',
    's-en-tobe': 'screens/english.html',
    's-en-modals': 'screens/english.html',
    's-en-mix': 'screens/english.html',
    's-en-wo': 'screens/english.html',
    's-sciences': 'screens/sciences.html',
    's-sciences-study-invertebrates': 'screens/sciences.html',
    's-sciences-ex': 'screens/sciences.html',
    's-sciences-mix': 'screens/sciences.html',
    's-sociales': 'screens/sociales.html',
    's-sociales-study': 'screens/sociales.html',
    's-sociales-study-unit': 'screens/sociales.html',
    's-sociales-ex-menu': 'screens/sociales.html',
    's-sociales-ex': 'screens/sociales.html',
    's-padres': 'screens/padres.html',
    's-avatar': 'screens/avatar.html',
    's-crear-avatar': 'screens/avatar.html',
    's-vacaciones':   'screens/vacaciones.html',
    's-vac-ex':       'screens/vacaciones.html',
    's-vac-fin':      'screens/vacaciones.html',
    's-vac-juegos':   'screens/vacaciones.html',
    's-vac-nivel':    'screens/vacaciones.html',
    's-vac-sudoku':   'screens/vacaciones.html',
    's-vac-nivel-sopa': 'screens/vacaciones.html',
    's-vac-sopa':       'screens/vacaciones.html',
    's-vac-nivel-mapa': 'screens/vacaciones.html',
    's-vac-mapa':       'screens/vacaciones.html',
    's-vac-nivel-memory':    'screens/vacaciones.html',
    's-vac-memory':          'screens/vacaciones.html',
    's-vac-nivel-snake':     'screens/vacaciones.html',
    's-vac-snake':           'screens/vacaciones.html',
    's-vac-nivel-puzzle':    'screens/vacaciones.html',
    's-vac-puzzle':          'screens/vacaciones.html',
    's-vac-nivel-laberinto': 'screens/vacaciones.html',
    's-vac-laberinto':       'screens/vacaciones.html',
    's-vac-nivel-ahorcado':  'screens/vacaciones.html',
    's-vac-ahorcado':        'screens/vacaciones.html',
    's-vac-2048':            'screens/vacaciones.html',
    's-vac-simon':           'screens/vacaciones.html',
    's-vac-nivel-hanoi':     'screens/vacaciones.html',
    's-vac-hanoi':           'screens/vacaciones.html',
    's-vac-arkanoid':        'screens/vacaciones.html',
    /* Curso 4 (ver PATRÓN PARA FUTUROS CURSOS en screens/curso4.html) */
    's-home-curso4':               'screens/curso4.html',
    's-english-c4':                'screens/curso4-english.html',
    's-english-study-c4':          'screens/curso4-english.html',
    's-english-exercises-c4':      'screens/curso4-english.html',
    's-english-tobe-c4':           'screens/curso4-english.html',
    's-english-tobe-present-c4':   'screens/curso4-english.html',
    's-english-tobe-past-c4':      'screens/curso4-english.html',
    's-english-have-c4':           'screens/curso4-english.html',
    's-english-have-present-c4':   'screens/curso4-english.html',
    's-english-have-past-c4':      'screens/curso4-english.html'
  };

  var file = fileMap[screenId];
  if (!file || _loadedScreens[file]) {
    /* Ya cargada o no necesita carga lazy */
    callback();
    return;
  }

  var container = document.
