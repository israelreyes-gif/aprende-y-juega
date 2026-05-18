/* =============================================
   APP.JS — Inicialización y carga de pantallas
   ============================================= */

function loadScreens(callback) {
  var files = ['screens/home.html','screens/mates.html','screens/lengua.html','screens/wip.html'];
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
      .catch(function() { loaded++; if (loaded === files.length) callback(); });
  });
}

function initApp() {
  checkDayReset();
  updateMedalUI();
  updateStreakUI();
  updateHomeUI();
  updateSubjectUI('mates');
  updateSubjectUI('lengua');
  setGramTab('bv');

  // Precargar primer ejercicio de cada modo
  setTimeout(function() {
    cargarNuevaSuma();
    cargarNuevaMulti();
    cargarNuevoProblema();
    cargarNuevaMezcla();
    cargarNuevaHistoria();
  }, 300);

  go('s-home');
}

// Interceptar navegación para precargar ejercicios al entrar
var _goOriginal = go;
go = function(screenId) {
  _goOriginal(screenId);
  setTimeout(function() {
    if (screenId === 's-sumas')       cargarNuevaSuma();
    if (screenId === 's-multi')       cargarNuevaMulti();
    if (screenId === 's-prob')        cargarNuevoProblema();
    if (screenId === 's-mix')         cargarNuevaMezcla();
    if (screenId === 's-comprension') cargarNuevaHistoria();
  }, 50);
};

loadScreens(initApp);
