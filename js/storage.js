/* =============================================
   STORAGE.JS — Persistencia exclusiva con Cloudflare D1
   Sin localStorage. D1 es la única fuente de verdad.
   Estructura limpia: cada asignatura tiene su JSON completo.
   ============================================= */

var API_URL = 'https://aprende-y-juega-api.israel-reyes.workers.dev';
var cursoActual = CONFIG.curso.porDefecto;
var perfilActivoId = null;
/* =============================================
   NAMESPACES — Estado centralizado
   ============================================= */

/* Datos cargados desde JSON */
var SubjectData = {
  problemas:    { facil: [], medio: [], avanzado: [] },
  historias:    { facil: [], medio: [], avanzado: [] },
  english:      null,
  vocab:        null,
  sciences:     null,
  sociales:     null,
  socialesEx:   null,
  dict:         null,
  descripciones: [],
  gram:         { bv: [], gj: [], czq: [], lly: [], rr: [] }
};

/* Estado del ejercicio activo por asignatura */
var ExerciseState = {
  mates: {
    opType:        'sum',
    probVal:       '',
    mixVal:        '',
    sumaIntentos:  0,
    multiIntentos: 0,
    probIntentos:  0,
    mixIntentos:   0,
    probIdx:       { facil: 0, medio: 0, avanzado: 0 },
    currentProb:   null,
    currentSuma:   null,
    currentMulti:  null,
    currentMix:    null
  },
  lengua: {
    gramTab:      'bv',
    gramIdx:      0,
    gramIntentos: 0,
    defAbierta:   false,
    historiaIdx:  { facil: 0, medio: 0, avanzado: 0 },
    currentHistoria: null
  },
  english: {
    exArea:    'tobe',
    exIdx:     0,
    exQueue:   [],
    mixIdx:    0,
    mixQueue:  [],
    woAttempt: 1,
    woBank:    [],
    woChecked: false,
    woIdx:     0,
    woQueue:   [],
    woSlots:   [],
    vocabExAttempt:     1,
    vocabExCurrentOpts: [],
    vocabExDone:        false,
    vocabExIdx:         0,
    vocabExQueue:       [],
    vocabExType:        'word-to-image',
    vocabExWrong:       null,
    vocabFlipped:       [],
    vocabUnit:          null
  },
  sciences: {
    exIdx:    0,
    exQueue:  [],
    mixIdx:   0,
    mixQueue: []
  },
  sociales: {
    attempt:      1,
    done:         false,
    idx:          0,
    queue:        [],
    unit:         null,
    openItem:     null,
    openSub:      null,
    section:      null,
    relColorIdx:  0,
    relLeft:      null,
    relMatched:   [],
    relPairs:     [],
    relSelections:{}
  },
  dict: {
    attempt:  1,
    done:     false,
    extra:    0,
    idx:      0,
    listens:  0,
    queue:    [],
    speaking: false
  },
  desc: {
    idx:    0,
    orden:  [],
    current: null
  }
};

/* ---- Estado global en memoria ---- */
var ST = defaultState();

function defaultState() {
  return {
    totalPts:  0,
    lastDate:  '',
    streak:    0,
    weekDays:  [],
    monthDays: [],
    mates:     { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} },
    lengua:    { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} },
    sciences:  { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} },
    english:   { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} },
    sociales:   { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} },
    vacaciones: { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} }
  };
}

function mergeState(s) {
  var def = defaultState();
  Object.keys(def).forEach(function(k) { if (s[k] === undefined) s[k] = def[k]; });
  ['mates','lengua','sciences','english','sociales','vacaciones'].forEach(function(sub) {
    if (!s[sub]) s[sub] = def[sub];
    if (def[sub]) {
      Object.keys(def[sub]).forEach(function(k) {
        if (s[sub][k] === undefined) s[sub][k] = def[sub][k];
      });
    }
  });
  return s;
}

/* ---- Cargar progreso desde D1 ---- */
function loadStateFromCloud(callback, skipDayReset) {
  if (!perfilActivoId) { ST = defaultState(); if (callback) callback(); return; }
  fetch(API_URL + '/progreso/' + perfilActivoId + '/' + cursoActual)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data) {
        if (data.total_pts !== undefined && data.totalPts === undefined) data.totalPts = data.total_pts;
        if (data.last_date !== undefined && data.lastDate === undefined) data.lastDate = data.last_date;
        if (data.week_days !== undefined && data.weekDays === undefined) data.weekDays = data.week_days;
        if (data.month_days !== undefined && data.monthDays === undefined) data.monthDays = data.month_days;
        // Blindaje: si la API devuelve algún campo de asignatura como texto JSON
        // sin convertir (en vez de objeto), lo parseamos aquí antes de fusionar.
        ['mates','lengua','sciences','english','sociales','vacaciones'].forEach(function(sub) {
          if (typeof data[sub] === 'string') {
            try { data[sub] = JSON.parse(data[sub]); }
            catch (e) { console.warn('[storage] No se pudo parsear ' + sub + ', se usará el valor por defecto', e); data[sub] = undefined; }
          }
        });
      }
      ST = data ? mergeState(data) : defaultState();
      if (!skipDayReset) checkDayReset();
      if (callback) callback();
    })
    .catch(function(e) {
      showError('tu progreso', e, null, 's-perfiles');
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
      totalPts:  ST.totalPts,
      lastDate:  ST.lastDate,
      streak:    ST.streak,
      weekDays:  ST.weekDays,
      monthDays: ST.monthDays,
      mates:     ST.mates,
      lengua:    ST.lengua,
      sciences:  ST.sciences,
      english:   ST.english,
      sociales:   ST.sociales,
      vacaciones: ST.vacaciones
    })
  }).catch(function(e) { console.warn('[storage] No se pudo guardar progreso:', e); });
}

/* ---- Cambiar de perfil: cargar desde D1 ---- */
function setPerfilActivoId(id, callback, skipDayReset) {
  perfilActivoId = id;
  ST = defaultState();
  loadStateFromCloud(callback, skipDayReset);
}

/* ---- Cambiar de curso ---- */
function setCurso(num) {
  cursoActual = num;
  // No cargamos aquí — setPerfilActivoId lo hará con el perfil correcto
  SubjectData.english  = null;
  SubjectData.vocab    = null;
  SubjectData.sciences = null;
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

  // Registrar el día de hoy siempre (independientemente de si ya entró hoy)
  var thisMonth = today.substring(0, 7);
  ST.monthDays = (ST.monthDays || []).filter(function(d) { return d.startsWith(thisMonth); });
  if (!ST.monthDays.includes(today)) ST.monthDays.push(today);

  var dow = new Date().getDay();
  var monday = new Date();
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);
  ST.weekDays = (ST.weekDays || []).filter(function(d) { return new Date(d) >= monday; });
  if (!ST.weekDays.includes(today)) ST.weekDays.push(today);

  // Si ya entró hoy, solo actualizar días y salir
  if (ST.lastDate === today) { saveState(); return; }

  // Día nuevo — resetear contadores diarios
  ['mates','lengua','sciences','english','sociales','vacaciones'].forEach(function(sub) {
    if (ST[sub]) { ST[sub].hoy = 0; ST[sub].hoyOk = 0; }
  });

  // Calcular racha
  if (ST.lastDate) {
    var prev = new Date(ST.lastDate), now = new Date(today);
    var diff = Math.round((now - prev) / 86400000);
    ST.streak = (diff === 1) ? ST.streak + 1 : 1;
  } else {
    ST.streak = 1;
  }

  ST.lastDate = today;
  saveState();
}

/* ---- Registrar resultado ---- */
function recordResult(subject, exerciseKey, correct) {
  var s = ST[subject];
  if (!s) return;
  if (!s.errors) s.errors = {};
  s.hoy++; s.total++;
  if (correct) {
    s.hoyOk++; s.totalOk++;
    s.errors[exerciseKey + '_ok'] = (s.errors[exerciseKey + '_ok'] || 0) + 1;
    s.streak = (s.streak || 0) + 1;
  } else {
    s.errors[exerciseKey + '_fail'] = (s.errors[exerciseKey + '_fail'] || 0) + 1;
    s.streak = Math.max(0, (s.streak || 0) - 1);
  }
  saveState();
}

/* ---- Añadir puntos ---- */
function addPts(n, subject) {
  ST.totalPts += n;
  if (ST[subject]) ST[subject].pts += n;
  saveState();
}

// Compatibilidad
function getNombre() { return ''; }
function setNombre(n) {}
function tieneNombre() { return false; }
