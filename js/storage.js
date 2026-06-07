/* =============================================
   STORAGE.JS — Persistencia exclusiva con Cloudflare D1
   Sin localStorage. D1 es la única fuente de verdad.
   ============================================= */

var API_URL = 'https://aprende-y-juega-api.israel-reyes.workers.dev';
var cursoActual = 3;
var perfilActivoId = null;

/* ---- Estado global en memoria ---- */
var ST = defaultState();

function defaultState() {
  return {
    totalPts:    0,
    lastDate:    '',
    streak:      0,
    weekDays:    [],
    mates:       { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, errors: {} },
    lengua:      { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, errors: {} },
    sciences:    { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} },
    english:     { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} },
    gramStreak:  0,
    compStreak:  0
  };
}

function mergeState(s) {
  var def = defaultState();
  Object.keys(def).forEach(function(k) { if (s[k] === undefined) s[k] = def[k]; });
  ['mates','lengua','sciences','english'].forEach(function(sub) {
    if (!s[sub]) s[sub] = def[sub];
    if (def[sub]) { Object.keys(def[sub]).forEach(function(k) { if (s[sub][k] === undefined) s[sub][k] = def[sub][k]; }); }
  });
  return s;
}

/* ---- Cargar progreso desde D1 ---- */
function loadStateFromCloud(callback) {
  if (!perfilActivoId) { ST = defaultState(); if (callback) callback(); return; }
  fetch(API_URL + '/progreso/' + perfilActivoId + '/' + cursoActual)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.totalPts !== undefined) {
        ST = mergeState(data);
      } else {
        ST = defaultState();
      }
      checkDayReset();
      if (callback) callback();
    })
    .catch(function(e) {
      console.warn('No se pudo cargar progreso desde D1:', e);
      ST = defaultState();
      if (callback) callback();
    });
}

/* ---- Guardar progreso en D1 (en segundo plano) ---- */
function saveState() {
  if (!perfilActivoId) return;
  fetch(API_URL + '/progreso/' + perfilActivoId + '/' + cursoActual, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      totalPts:    ST.totalPts,
      lastDate:    ST.lastDate,
      streak:      ST.streak,
      weekDays:    ST.weekDays,
      mates:       ST.mates,
      lengua:      ST.lengua,
      sciences:    ST.sciences,
      english:     ST.english,
      matesStreak: ST.matesStreak || 0,
      gramStreak:  ST.gramStreak  || 0,
      compStreak:  ST.compStreak  || 0
    })
  }).catch(function(e) { console.warn('No se pudo guardar progreso:', e); });
}

/* ---- Cambiar de perfil: cargar desde D1 ---- */
function setPerfilActivoId(id, callback) {
  perfilActivoId = id;
  ST = defaultState();
  loadStateFromCloud(callback);
}

/* ---- Cambiar de curso ---- */
function setCurso(num) {
  cursoActual = num;
  ST = defaultState();
  loadStateFromCloud();
  if (typeof EN_DATA    !== 'undefined') EN_DATA    = null;
  if (typeof VOCAB_DATA !== 'undefined') VOCAB_DATA = null;
  if (typeof SC_DATA    !== 'undefined') SC_DATA    = null;
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

  ST.mates.hoy   = 0; ST.mates.hoyOk   = 0;
  ST.lengua.hoy  = 0; ST.lengua.hoyOk  = 0;
  if (ST.sciences) { ST.sciences.hoy = 0; ST.sciences.hoyOk = 0; }
  if (ST.english)  { ST.english.hoy  = 0; ST.english.hoyOk  = 0; }

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
  ST.weekDays = (ST.weekDays || []).filter(function(d) { return new Date(d) >= monday; });
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
    s.errors[exerciseKey + '_ok'] = (s.errors[exerciseKey + '_ok'] || 0) + 1;
    if (subject === 'mates')  ST.matesStreak = (ST.matesStreak || 0) + 1;
    if (subject === 'lengua') ST.gramStreak  = (ST.gramStreak  || 0) + 1;
  } else {
    s.errors[exerciseKey + '_fail'] = (s.errors[exerciseKey + '_fail'] || 0) + 1;
    if (subject === 'mates')  ST.matesStreak = Math.max(0, (ST.matesStreak || 0) - 1);
    if (subject === 'lengua') ST.gramStreak  = Math.max(0, (ST.gramStreak  || 0) - 1);
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

// Compatibilidad: estas funciones ya no usan localStorage
function getNombre() { return ''; }
function setNombre(n) {}
function tieneNombre() { return false; }
