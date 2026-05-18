/* =============================================
   STORAGE.JS — Persistencia con localStorage
   ============================================= */

var STORE_KEY = 'aprendeyjuega_v1';

function defaultState() {
  return {
    totalPts: 0,
    lastDate: '',
    streak: 0,
    weekDays: [],
    mates:  { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, errors: {} },
    lengua: { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, errors: {} },
    gramStreak: 0,
    compStreak: 0
  };
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    var s = JSON.parse(raw);
    var def = defaultState();
    Object.keys(def).forEach(function(k) { if (s[k] === undefined) s[k] = def[k]; });
    // Asegurar sub-objetos
    ['mates','lengua'].forEach(function(sub) {
      Object.keys(def[sub]).forEach(function(k) { if (s[sub][k] === undefined) s[sub][k] = def[sub][k]; });
    });
    return s;
  } catch(e) { return defaultState(); }
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(ST)); } catch(e) { console.warn('No se pudo guardar:', e); }
}

/* Estado global de la app */
var ST = loadState();

/* ---- Reseteo diario ---- */
function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function checkDayReset() {
  var today = todayStr();
  if (ST.lastDate === today) return; // mismo día, nada que hacer

  // Resetear contadores "de hoy"
  ST.mates.hoy  = 0; ST.mates.hoyOk  = 0;
  ST.lengua.hoy = 0; ST.lengua.hoyOk = 0;

  // Racha
  if (ST.lastDate) {
    var prev = new Date(ST.lastDate), now = new Date(today);
    var diff = Math.round((now - prev) / 86400000);
    ST.streak = (diff === 1) ? ST.streak + 1 : 1;
  } else {
    ST.streak = 1;
  }

  // Semana actual (lunes a domingo)
  var dow = new Date().getDay();
  var monday = new Date();
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  ST.weekDays = ST.weekDays.filter(function(d) { return new Date(d) >= monday; });
  if (!ST.weekDays.includes(today)) ST.weekDays.push(today);

  ST.lastDate = today;
  saveState();
}

/* ---- Registrar resultado de ejercicio ---- */
function recordResult(subject, exerciseKey, correct) {
  var s = ST[subject];
  s.hoy++;
  s.total++;
  if (correct) {
    s.hoyOk++;
    s.totalOk++;
    // Reducir error count al acertar
    if (s.errors[exerciseKey] && s.errors[exerciseKey] > 0) {
      s.errors[exerciseKey]--;
      if (s.errors[exerciseKey] === 0) delete s.errors[exerciseKey];
    }
  } else {
    s.errors[exerciseKey] = (s.errors[exerciseKey] || 0) + 1;
  }
  saveState();
}

/* ---- Añadir puntos ---- */
function addPts(n, subject) {
  ST.totalPts += n;
  ST[subject].pts += n;
  saveState();
}

/* ---- Helpers ---- */
function pct(ok, total) {
  return total > 0 ? Math.round(ok / total * 100) + '%' : '—';
}
