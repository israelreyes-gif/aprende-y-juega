/* =============================================
   APP.JS — Inicialización y carga de pantallas
   Arranque: pantallas críticas → datos → init
   ============================================= */

/* Version para cache-busting de las pantallas HTML. Se genera
   sola en cada carga de la app (con la hora actual), así que
   YA NO HACE FALTA subir este número a mano cuando cambias
   contenido de screens/*.html — cada visita pide siempre la
   versión más reciente. */
var SCREENS_V = String(Date.now());

/* Pantallas que se cargan al arranque (críticas).
   Solo perfiles.html: es la única pantalla que se ve sí o sí nada
   más abrir la app. Todo lo demás —incluida la pantalla de elegir
   curso y la home de cada curso— se carga bajo demanda, igual para
   3º que para 4º (ver SCREENS_LAZY y el fileMap de loadScreenLazy). */
var SCREENS_CRITICAL = [
  'screens/perfiles.html'
];

/* Resto de pantallas — se cargan bajo demanda */
var SCREENS_LAZY = [
  'screens/cursos.html',
  'screens/curso3/home.html',
  'screens/curso3/mates.html',
  'screens/curso3/lengua.html',
  'screens/curso3/english.html',
  'screens/curso3/sciences.html',
  'screens/curso3/sociales.html',
  'screens/padres.html',
  'screens/avatar.html',
  'screens/curso3/descripciones.html',
  'screens/vacaciones.html',
  'screens/curso4/home.html',
  'screens/curso4/english.html',
  'screens/curso4/english-tenses.html',
  'screens/curso4/english-verbs.html',
  'screens/curso4/english-vocab.html',
  'screens/curso4/english-grammar.html'
];

/* Registro de pantallas ya cargadas */
var _loadedScreens = {};

/* ---- Cargar pantallas críticas al arranque ----
   Si falla una, se reintenta SOLO esa (no todas) al pulsar
   "Intentar de nuevo" — antes el botón no hacía nada porque no
   se le pasaba una función de reintento a showError(). */
function loadScreens(callback) {
  var loaded = 0;
  var container = document.getElementById('app');

  function loadOne(file) {
    fetch(file + '?v=' + SCREENS_V)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        container.insertAdjacentHTML('beforeend', html);
        _loadedScreens[file] = true;
        loaded++;
        if (loaded === SCREENS_CRITICAL.length) callback();
      })
      .catch(function(e) {
        showError('carga de pantalla ' + file, e, function(){ loadOne(file); });
      });
  }

  SCREENS_CRITICAL.forEach(loadOne);
}

/* ---- Cargar pantalla bajo demanda ---- */
function loadScreenLazy(screenId, callback) {
  /* Buscar qué archivo corresponde al screenId */
  var fileMap = {
    's-cursos': 'screens/cursos.html',
    's-wip-curso-5': 'screens/cursos.html',
    's-wip-curso-6': 'screens/cursos.html',
    's-home': 'screens/curso3/home.html',
    's-mates': 'screens/curso3/mates.html',
    's-mates-exercises': 'screens/curso3/mates.html',
    's-sumas': 'screens/curso3/mates.html',
    's-multi': 'screens/curso3/mates.html',
    's-prob': 'screens/curso3/mates.html',
    's-mix': 'screens/curso3/mates.html',
    's-lengua': 'screens/curso3/lengua.html',
    's-lengua-exercises': 'screens/curso3/lengua.html',
    's-gramatica': 'screens/curso3/lengua.html',
    's-comprension': 'screens/curso3/lengua.html',
    's-dictado': 'screens/curso3/lengua.html',
    's-descripciones': 'screens/curso3/descripciones.html',
    's-english': 'screens/curso3/english.html',
    's-english-study': 'screens/curso3/english.html',
    's-english-exercises': 'screens/curso3/english.html',
    's-english-vocab': 'screens/curso3/english.html',
    's-vocab-ex-w2i': 'screens/curso3/english.html',
    's-vocab-ex-i2w': 'screens/curso3/english.html',
    's-en-tobe': 'screens/curso3/english.html',
    's-en-modals': 'screens/curso3/english.html',
    's-en-mix': 'screens/curso3/english.html',
    's-en-wo': 'screens/curso3/english.html',
    's-sciences': 'screens/curso3/sciences.html',
    's-sciences-study-invertebrates': 'screens/curso3/sciences.html',
    's-sciences-ex': 'screens/curso3/sciences.html',
    's-sciences-mix': 'screens/curso3/sciences.html',
    's-sociales': 'screens/curso3/sociales.html',
    's-sociales-study': 'screens/curso3/sociales.html',
    's-sociales-study-unit': 'screens/curso3/sociales.html',
    's-sociales-ex-menu': 'screens/curso3/sociales.html',
    's-sociales-ex': 'screens/curso3/sociales.html',
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
    /* Curso 4 (ver PATRÓN PARA FUTUROS CURSOS en screens/curso4/home.html) */
    's-home-curso4':               'screens/curso4/home.html',
    's-english-c4':                'screens/curso4/english.html',
    's-english-study-c4':          'screens/curso4/english.html',
    's-english-exercises-c4':      'screens/curso4/english.html',
    's-english-verbs-extype-c4':   'screens/curso4/english.html',
    's-english-verbs-ex-c4':       'screens/curso4/english.html',
    's-english-verbs-match-c4':    'screens/curso4/english.html',
    's-english-verbtenses-c4':     'screens/curso4/english-tenses.html',
    's-english-exercises-tenses-c4': 'screens/curso4/english-tenses.html',
    's-english-tobe-c4':           'screens/curso4/english-tenses.html',
    's-english-tobe-past-c4':      'screens/curso4/english-tenses.html',
    's-english-simple-present-c4': 'screens/curso4/english-tenses.html',
    's-english-simple-past-c4':    'screens/curso4/english-tenses.html',
    's-english-ing-present-c4':    'screens/curso4/english-tenses.html',
    's-english-ing-past-c4':       'screens/curso4/english-tenses.html',
    's-english-future-c4':         'screens/curso4/english-tenses.html',
    's-english-verbs-c4':          'screens/curso4/english-verbs.html',
    's-english-vocab-c4':          'screens/curso4/english-vocab.html',
    's-english-vocab-unit-c4':     'screens/curso4/english-vocab.html',
    's-english-vocab-ex-c4':       'screens/curso4/english-vocab.html',
    's-english-vocab-ex-type-c4':  'screens/curso4/english-vocab.html',
    's-vocab-ex-w2i-c4':           'screens/curso4/english-vocab.html',
    's-vocab-ex-i2w-c4':           'screens/curso4/english-vocab.html',
    's-english-grammar-c4':        'screens/curso4/english-grammar.html',
    's-english-clock-c4':          'screens/curso4/english-grammar.html',
    's-english-whquestions-c4':    'screens/curso4/english-grammar.html',
    's-english-could-c4':          'screens/curso4/english-grammar.html',
    's-english-must-c4':           'screens/curso4/english-grammar.html',
    's-english-haveto-c4':         'screens/curso4/english-grammar.html',
    's-english-erest-c4':          'screens/curso4/english-grammar.html',
    's-english-adverbs-c4':        'screens/curso4/english-grammar.html',
    's-english-prepositions-c4':   'screens/curso4/english-grammar.html',
    /* Verb Tenses — pantallas genéricas de ejercicios, compartidas
       por los 7 tiempos (ver js/english-tenses-c4.js) */
    's-english-tenses-extype-c4':  'screens/curso4/english-tenses.html',
    's-english-tenses-ex-c4':      'screens/curso4/english-tenses.html',
    's-english-tenses-wo-c4':      'screens/curso4/english-tenses.html',
    's-english-tenses-match-c4':   'screens/curso4/english-tenses.html'
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
      showError('carga lazy ' + file, e, function(){ loadScreenLazy(screenId, callback); });
    });
}

/* ---- Carga perezosa de datos de ejercicios de Mates y Lengua ----
   Mismo patrón que el resto de asignaturas (p.ej. loadVocabData()
   para el vocabulario de English): nada se carga hasta que el
   usuario entra en la pantalla que lo necesita. Antes esto se cargaba
   entero al arrancar la app entera, usando cursoActual — lo que
   rompía el arranque en cuanto cursoActual no era un curso con estos
   archivos (p.ej. 4º, que todavía no tiene Mates/Lengua propios). */
var _matesDataCurso    = null; // curso para el que SubjectData.problemas está cargado
var _historiasDataCurso = null; // curso para el que SubjectData.historias está cargado

function ensureMatesData(callback) {
  if (_matesDataCurso === cursoActual) { callback(); return; }
  fetch('data/curso' + cursoActual + '/ejercicios-mates.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      SubjectData.problemas = data;
      Object.keys(SubjectData.problemas).forEach(function(k) {
        SubjectData.problemas[k] = shuffle(SubjectData.problemas[k]);
      });
      _matesDataCurso = cursoActual;
      callback();
    })
    .catch(function(e) {
      showError('los ejercicios de Matemáticas', e, function(){ ensureMatesData(callback); }, 's-mates');
    });
}

function ensureHistoriasData(callback) {
  if (_historiasDataCurso === cursoActual) { callback(); return; }
  fetch('data/curso' + cursoActual + '/historias.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      SubjectData.historias = data;
      Object.keys(SubjectData.historias).forEach(function(k) {
        SubjectData.historias[k] = shuffleArr(SubjectData.historias[k]);
      });
      _historiasDataCurso = cursoActual;
      callback();
    })
    .catch(function(e) {
      showError('las historias de Comprensión', e, function(){ ensureHistoriasData(callback); }, 's-comprension');
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
      if (screenId === 's-sumas')       ensureMatesData(cargarNuevaSuma);
      if (screenId === 's-multi')       ensureMatesData(cargarNuevaMulti);
      if (screenId === 's-prob')        ensureMatesData(cargarNuevoProblema);
      if (screenId === 's-mix')         ensureMatesData(cargarNuevaMezcla);
      if (screenId === 's-comprension') ensureHistoriasData(cargarNuevaHistoria);
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

/* Arranque: pantallas críticas → init (los datos de cada asignatura
   se cargan perezosamente al entrar en su pantalla — ver
   ensureMatesData/ensureHistoriasData arriba y el resto de
   asignaturas, que ya seguían este patrón). */
loadScreens(initApp);
