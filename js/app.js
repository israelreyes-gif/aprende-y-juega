/* =============================================
   APP.JS — Inicialización y carga de pantallas
   Arranque: HTML → datos → init → s-cursos
   ============================================= */

function loadScreens(callback) {
  var files = [
    'screens/sciences.html',
    'screens/perfiles.html',
    'screens/cursos.html',
    'screens/avatar.html',
    'screens/padres.html',
    'screens/descripciones.html',
    'screens/home.html',
    'screens/mates.html',
    'screens/lengua.html',
    'screens/wip.html'
  ];
  var loaded = 0;
  var container = document.getElementById('app');
  files.forEach(function(file) {
    fetch(file)
      .then(function(r) { return r.text(); })
      .then(function(html) {
        container.insertAdjacentHTML('beforeend', html);
        loaded++;
        if (loaded === files.length) callback();
      })
      .catch(function(e) {
        console.warn('Error cargando ' + file + ':', e);
        loaded++;
        if (loaded === files.length) callback();
      });
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
      PROBLEMAS_DB = data;
      Object.keys(PROBLEMAS_DB).forEach(function(k) {
        PROBLEMAS_DB[k] = shuffle(PROBLEMAS_DB[k]);
      });
      done();
    })
    .catch(function(e) {
      console.warn('No se cargó ejercicios-mates.json:', e);
      done('mates');
    });

  fetch('data/curso' + cursoActual + '/historias.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      HISTORIAS_DB = data;
      Object.keys(HISTORIAS_DB).forEach(function(k) {
        HISTORIAS_DB[k] = shuffleArr(HISTORIAS_DB[k]);
      });
      done();
    })
    .catch(function(e) {
      console.warn('No se cargó historias.json:', e);
      done('historias');
    });
}

function initApp() {
  checkDayReset();
  updateMedalUI();
  updateStreakUI();
  updateHomeUI();
  updateSubjectUI('mates');
  updateSubjectUI('sciences');
  setGramTab('bv');

  // Precargar ejercicios DESPUÉS de que los datos estén listos
  cargarNuevaSuma();
  cargarNuevaMulti();
  cargarNuevoProblema();
  cargarNuevaMezcla();
  cargarNuevaHistoria();

  // Override de go() aquí dentro — garantiza que los datos ya están cargados
  var _goOriginal = go;
  go = function(screenId) {
    _goOriginal(screenId);
    if (screenId === 's-sumas')       cargarNuevaSuma();
    if (screenId === 's-multi')       cargarNuevaMulti();
    if (screenId === 's-prob')        cargarNuevoProblema();
    if (screenId === 's-mix')         cargarNuevaMezcla();
    if (screenId === 's-comprension') cargarNuevaHistoria();
  };

  // Dibujar avatar en todas las pantallas
  refreshAllAvatars();
  // Comprobar desbloqueos nuevos
  checkNewUnlocks();

  // Primera pantalla: siempre selección de perfiles
  renderPerfiles();
  go('s-perfiles');
}

// Arranque: HTML → datos → init
loadScreens(function() {
  loadData(initApp);
});
