/* =============================================
   APP.JS — Inicialización y carga de pantallas
   Arranque: pantallas críticas → datos → init
   ============================================= */

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
  'screens/descripciones.html'
];

/* Registro de pantallas ya cargadas */
var _loadedScreens = {};

/* ---- Cargar pantallas críticas al arranque ---- */
function loadScreens(callback) {
  var loaded = 0;
  var container = document.getElementById('app');
  SCREENS_CRITICAL.forEach(function(file) {
    fetch(file)
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
    's-crear-avatar': 'screens/avatar.html'
  };

  var file = fileMap[screenId];
  if (!file || _loadedScreens[file]) {
    /* Ya cargada o no necesita carga lazy */
    callback();
    return;
  }

  var container = document.getElementById('app');
  fetch(file)
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
