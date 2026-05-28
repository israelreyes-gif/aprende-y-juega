/* =============================================
   STORAGE.JS — Persistencia con localStorage + Cloudflare D1
   El progreso se guarda localmente Y en la nube por perfil.
   ============================================= */

var API_URL = 'https://aprende-y-juega-api.israel-reyes.workers.dev';
var STORE_KEY_PREFIX = 'aprendeyjuega_curso';
var cursoActual = 3;
var perfilActivoId = null; // se establece al seleccionar perfil

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
  var pid = perfilActivoId || 'default';
  return STORE_KEY_PREFIX + (curso || cursoActual) + '_' + pid;
}

function mergeState(s) {
  var def = defaultState();
  Object.keys(def).forEach(function(k) { if (s[k] === undefined) s[k] = def[k]; });
  ['mates','lengua'].forEach(function(sub) {
    if (!s[sub]) s[sub] = def[sub];
    Object.keys(def[sub]).forEach(function(k) { if (s[sub][k] === undefined) s[sub][k] = def[sub][k]; });
  });
  return s;
}

function loadState(curso) {
  try {
    var raw = localStorage.getItem(getStoreKey(curso));
    if (!raw) return defaultState();
    return mergeState(JSON.parse(raw));
  } catch(e) { return defaultState(); }
}

function saveState() {
  try {
    localStorage.setItem(getStoreKey(), JSON.stringify(ST));
    // Guardar en la nube de forma asíncrona (sin bloquear)
    if (perfilActivoId) syncProgresoToCloud();
  } catch(e) { console.warn('No se pudo guardar el progreso:', e); }
}

/* ---- Sincronización con la nube ---- */
function syncProgresoToCloud() {
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
      matesStreak: ST.matesStreak,
      gramStreak:  ST.gramStreak,
      compStreak:  ST.compStreak
    })
  }).catch(function(e) { console.warn('No se pudo sincronizar progreso:', e); });
}

function loadProgresoFromCloud(perfilId, curso, callback) {
  fetch(API_URL + '/progreso/' + perfilId + '/' + (curso || 3))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data) {
        var s = mergeState({
          totalPts:    data.total_pts,
          lastDate:    data.last_date,
          streak:      data.streak,
          weekDays:    data.week_days || [],
          mates:       data.mates || defaultState().mates,
          lengua:      data.lengua || defaultState().lengua,
          matesStreak: data.mates_streak,
          gramStreak:  data.gram_streak,
          compStreak:  data.comp_streak
        });
        // Guardar en local también
        localStorage.setItem(getStoreKey(curso), JSON.stringify(s));
        ST = s;
      }
      if (callback) callback();
    })
    .catch(function() {
      // Sin conexión — usar localStorage
      if (callback) callback();
    });
}

/* Estado global */
var ST = loadState(3);

/* ---- Nombre ---- */
function getNombre() { return localStorage.getItem('aprendeyjuega_nombre') || ''; }
function setNombre(n) { localStorage.setItem('aprendeyjuega_nombre', n.trim()); }
function tieneNombre() { return getNombre().length > 0; }

/* ---- Cambiar de curso ---- */
function setCurso(num) {
  cursoActual = num;
  ST = loadState(num);
}

/* ---- Cambiar de perfil ---- */
function setPerfilActivoId(id) {
  perfilActivoId = id;
  ST = loadState(cursoActual);
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
    s.errors[exerciseKey + '_ok'] = (s.errors[exerciseKey + '_ok'] || 0) + 1;
    if (subject === 'mates')  ST.matesStreak++;
    if (subject === 'lengua') ST.gramStreak++;
  } else {
    s.errors[exerciseKey + '_fail'] = (s.errors[exerciseKey + '_fail'] || 0) + 1;
    if (subject === 'mates')  ST.matesStreak = Math.max(0, ST.matesStreak - 1);
    if (subject === 'lengua') ST.gramStreak  = Math.max(0, ST.gramStreak  - 1);
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
