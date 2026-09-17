/* =============================================
   APP.JS — Inicialización y carga de pantallas
   Arranque: pantallas críticas → datos → init
   ============================================= */

/* Version para cache-busting de las pantallas HTML (fetch no lleva
   parametro de version salvo que se lo añadamos aqui). Subir este
   numero cada vez que cambie cualquier screens/*.html. */
var SCREENS_V = '1789655319';

/* Pantallas que se cargan al arranque (críticas) */
var SCREENS_CRITICAL = [
  'screens/perfiles.html',
  'screens/cursos.html',
  'screens/curso3.html',
  'screens/wip.html'
];

/* Resto de pantallas — se cargan bajo demanda */
var SCREENS_LAZY = [
  'screens/curso3-mates.html',
  'screens/curso3-lengua.html',
  'screens/curso3-english.html',
  'screens/curso3-sciences.html',
  'screens/curso3-sociales.html',
  'screens/padres.html',
  'screens/avatar.html',
  'screens/curso3-descripciones.html',
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
    's-mates': 'screens/curso3-mates.html',
    's-mates-exercises': 'screens/curso3-mates.html',
    's-sumas': 'screens/curso3-mates.html',
    's-multi': 'screens/curso3-mates.html',
    's-prob': 'screens/curso3-mates.html',
    's-mix': 'screens/curso3-mates.html',
    's-lengua': 'screens/curso3-lengua.html',
    's-lengua-exercises': 'screens/curso3-lengua.html',
    's-gramatica': 'screens/curso3-lengua.html',
    's-comprension': 'screens/curso3-lengua.html',
    's-dictado': 'screens/curso3-lengua.html',
    's-descripciones': 'screens/curso3-descripciones.html',
    's-english': 'screens/curso3-english.html',
    's-english-study': 'screens/curso3-english.html',
    's-english-exercises': 'screens/curso3-english.html',
    's-english-vocab': 'screens/curso3-english.html',
    's-vocab-ex-w2i': 'screens/curso3-english.html',
    's-vocab-ex-i2w': 'screens/curso3-english.html',
    's-en-tobe': 'screens/curso3-english.html',
    's-en-modals': 'screens/curso3-english.html',
    's-en-mix': 'screens/curso3-english.html',
    's-en-wo': 'screens/curso3-english.html',
    's-sciences': 'screens/curso3-sciences.html',
    's-sciences-study-invertebrates': 'screens/curso3-sciences.html',
    's-sciences-ex': 'screens/curso3-sciences.html',
    's-sciences-mix': 'screens/curso3-sciences.html',
    's-sociales': 'screens/curso3-sociales.html',
    's-sociales-study': 'screens/curso3-sociales.html',
    's-sociales-study-unit': 'screens/curso3-sociales.html',
    's-sociales-ex-menu': 'screens/curso3-sociales.html',
    's-sociales-ex': 'screens/curso3-sociales.html',
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
    's-english-have-past-c4':      'screens/curso4-english.html',
    's-english-ing-c4':            'screens/curso4-english.html',
    's-english-ing-present-c4':    'screens/curso4-english.html',
    's-english-ing-past-c4':       'screens/curso4-english.html'
  };

  var file = fileMap[screenId];
  if (!file || _loadedScreens[file]) {
    /* Ya cargada o no necesita carga lazy */
    callback();
    return;
  }

  var container = document.getElementById('app');
  fetch(file + '?v=' + SCREENS_V)
    .then(function(r) { return r.text(); })
    .then(function(html) {
      container.insertAdjacentHTML('beforeend', html);
      _loadedScreens[file] = true;
      callback();
    })
    .catch(function(e) {
      showError('carga lazy ' + file, e);
      callback();
    });
}

function loadData(callback) {
  var pending = 2;
  var errors  = [];

  function done(errorMsg) {
    if (errorMsg) errors.push(errorMsg);
    pending--;
    if (pending === 0) {
      if (errors.length > 0) {
        showToast('⚠️ Algunos ejercicios usan datos de respaldo');
      }
      callback();
    }
  }

  fetch('data/curso' + cursoActual + '/ejercicios-mates.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      SubjectData.problemas = data;
      Object.keys(SubjectData.problemas).forEach(function(k) {
        SubjectData.problemas[k] = shuffle(SubjectData.problemas[k]);
      });
      done();
    })
    .catch(function(e) {
      showError('los ejercicios de Matemáticas', e, function(){ loadData(initApp); }, 's-mates');
      done('mates');
    });

  fetch('data/curso' + cursoActual + '/historias.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      SubjectData.historias = data;
      Object.keys(SubjectData.historias).forEach(function(k) {
        SubjectData.historias[k] = shuffleArr(SubjectData.historias[k]);
      });
      done();
    })
    .catch(function(e) {
      showError('las historias de Comprensión', e, function(){ loadData(initApp); }, 's-comprension');
      done('historias');
    });
}

function initApp() {
  updateMedalUI();
  updateStreakUI();
  updateHomeUI();

  /* Override de go() para lazy loading */
  var _goOriginal = go;
  go = function(screenId) {
    loadScreenLazy(screenId, function() {
      _goOriginal(screenId);
      /* Cargar datos de ejercicio cuando se entra */
      if (screenId === 's-sumas')       cargarNuevaSuma();
      if (screenId === 's-multi')       cargarNuevaMulti();
      if (screenId === 's-prob')        cargarNuevoProblema();
      if (screenId === 's-mix')         cargarNuevaMezcla();
      if (screenId === 's-comprension') cargarNuevaHistoria();
    });
  };

  /* Dibujar avatar en todas las pantallas cargadas */
  refreshAllAvatars();
  /* Comprobar desbloqueos nuevos */
  checkNewUnlocks();

  /* Primera pantalla: selección de perfiles */
  renderPerfiles();
  _goOriginal('s-perfiles');
}

/* Arranque: pantallas críticas → datos → init */
loadScreens(function() {
  loadData(initApp);
});
