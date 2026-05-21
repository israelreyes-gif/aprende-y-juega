/* =============================================
   STORAGE.JS — Persistencia con localStorage
   El progreso se guarda POR CURSO de forma independiente.
   Clave: 'aprendeyjuega_curso3', 'aprendeyjuega_curso4', etc.
   ============================================= */

var STORE_KEY_PREFIX = 'aprendeyjuega_curso';
var cursoActual = 3; // se actualiza al seleccionar curso

function defaultState() {
  return {
    totalPts:    0,
    lastDate:    '',
    streak:      0,
    weekDays:    [],
    mates:       { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, errors: {} },
    lengua:      { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, errors: {} },
    matesStreak: 0,
    gramStreak:  0,
    compStreak:  0
  };
}

function getStoreKey(curso) {
  return STORE_KEY_PREFIX + (curso || cursoActual);
}

function loadState(curso) {
  try {
    var raw = localStorage.getItem(getStoreKey(curso));
    if (!raw) return defaultState();
    var s   = JSON.parse(raw);
    var def = defaultState();
    // Merge: añade claves nuevas sin borrar las existentes
    Object.keys(def).forEach(function(k) { if (s[k] === undefined) s[k] = def[k]; });
    ['mates','lengua'].forEach(function(sub) {
      Object.keys(def[sub]).forEach(function(k) { if (s[sub][k] === undefined) s[sub][k] = def[sub][k]; });
    });
    return s;
  } catch(e) { return defaultState(); }
}

function saveState() {
  try {
    localStorage.setItem(getStoreKey(), JSON.stringify(ST));
  } catch(e) { console.warn('No se pudo guardar el progreso:', e); }
}

/* Estado global — se recarga al cambiar de curso */
var ST = loadState(3);

/* ---- Nombre de la usuaria ---- */
function getNombre() {
  return localStorage.getItem('aprendeyjuega_nombre') || '';
}

function setNombre(nombre) {
  localStorage.setItem('aprendeyjuega_nombre', nombre.trim());
}

function tieneNombre() {
  return getNombre().length > 0;
}

/* ---- Cambiar de curso ---- */
function setCurso(num) {
  cursoActual = num;
  ST = loadState(num);
}

/* ---- Reseteo diario ---- */
function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function checkDayReset() {
  var today = todayStr();
  if (ST.lastDate === today) return;

  ST.mates.hoy  = 0; ST.mates.hoyOk  = 0;
  ST.lengua.hoy = 0; ST.lengua.hoyOk = 0;

  if (ST.lastDate) {
    var prev = new Date(ST.lastDate), now = new Date(today);
    var diff = Math.round((now - prev) / 86400000);
    ST.streak = (diff === 1) ? ST.streak + 1 : 1;
  } else {
    ST.streak = 1;
  }

  var dow = new Date().getDay();
  var monday = new Date();
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  ST.weekDays = ST.weekDays.filter(function(d) { return new Date(d) >= monday; });
  if (!ST.weekDays.includes(today)) ST.weekDays.push(today);

  ST.lastDate = today;
  saveState();
}

/* ---- Registrar resultado ---- */
function recordResult(subject, exerciseKey, correct) {
  var s = ST[subject];
  s.hoy++; s.total++;
  if (correct) {
    s.hoyOk++; s.totalOk++;
    if (s.errors[exerciseKey] && s.errors[exerciseKey] > 0) {
      s.errors[exerciseKey]--;
      if (s.errors[exerciseKey] === 0) delete s.errors[exerciseKey];
    }
    if (subject === 'mates') ST.matesStreak++;
  } else {
    s.errors[exerciseKey] = (s.errors[exerciseKey] || 0) + 1;
    if (subject === 'mates') ST.matesStreak = Math.max(0, ST.matesStreak - 1);
  }
  saveState();
}

/* ---- Añadir puntos ---- */
function addPts(n, subject) {
  ST.totalPts += n;
  ST[subject].pts += n;
  saveState();
}

/* ---- Helper porcentaje ---- */
function pct(ok, total) {
  return total > 0 ? Math.round(ok / total * 100) + '%' : '—';
}
