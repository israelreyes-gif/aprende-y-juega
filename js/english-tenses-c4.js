/* =============================================
   ENGLISH-TENSES-C4.JS — Verb Tenses, ejercicios (4º)
   Reutiliza los mismos motores genéricos que el resto de
   la app (engine-multiple-choice.js, engine-word-order.js,
   engine-matching.js) — ninguno nuevo.

   Las pantallas (menú de tipos, pregunta, word order,
   time markers) son GENÉRICAS y compartidas por los 7
   tiempos verbales — ver screens/curso4/english-tenses.html.
   No hay una pantalla por tiempo, para no duplicar HTML
   7 veces; solo cambia el título/color y los datos que se
   cargan según TENSES_C4[tenseId].

   Cada tiempo se añade aquí (a TENSES_C4) según se va
   construyendo. Los que faltan siguen mostrando "Coming
   soon" en la pantalla de Verb Tenses.
   ============================================= */

/* dataFile:  fichero de datos propio de este tiempo
   statsKey:  clave única para ST/errors — coincide con la
              ya reservada en STATS_BY_CURSO[4] (stats.js).
              TODOS los ejercicios del tiempo (tipos A-D,
              Word Order y Time Markers) cuentan para esta
              misma clave, igual que "english-tobe" agrupa
              todo To Be en 3º. */
var TENSES_C4 = {
  'to-be': {
    dataFile: 'data/curso4/english-tenses-to-be.json',
    statsKey: 'english-tobe-c4',
    title:    'To Be — Present',
    color:    'var(--blue)'
  },
  'to-be-past': {
    dataFile: 'data/curso4/english-tenses-to-be-past.json',
    statsKey: 'english-tobe-past-c4',
    title:    'To Be — Past',
    color:    'var(--purple)'
  },
  'simple-present': {
    dataFile: 'data/curso4/english-tenses-simple-present.json',
    statsKey: 'english-simple-present-c4',
    title:    'Present Simple',
    color:    'var(--orange)'
  },
  'simple-past': {
    dataFile: 'data/curso4/english-tenses-simple-past.json',
    statsKey: 'english-simple-past-c4',
    title:    'Past Simple',
    color:    'var(--red)'
  },
  'present-continuous': {
    dataFile: 'data/curso4/english-tenses-present-continuous.json',
    statsKey: 'english-ing-present-c4',
    title:    'Present Continuous',
    color:    'var(--amber)'
  },
  'past-continuous': {
    dataFile: 'data/curso4/english-tenses-past-continuous.json',
    statsKey: 'english-ing-past-c4',
    title:    'Past Continuous',
    color:    '#78350F'
  },
  'future-simple': {
    dataFile: 'data/curso4/english-tenses-future-simple.json',
    statsKey: 'english-future-c4',
    title:    'Future Simple',
    color:    'var(--green)'
  }
};

var TYPE_LABELS_C4 = {
  'A': { emoji: '✏️', label: 'Complete the sentence' },
  'B': { emoji: '🔄', label: 'Make it negative' },
  'C': { emoji: '🔍', label: 'Identify the tense' },
  'D': { emoji: '💬', label: 'Choose the right form' }
};

/* Estado local — solo hace falta mientras se juega, no se
   guarda en ExerciseState (eso es para estado que debe
   sobrevivir a cambios de pantalla dentro de 3º). */
var _tc4 = {
  tenseId: null,
  unit:    null,
  type:    null,
  queue:   [],
  idx:     0,
  woQueue: [],
  woIdx:   0
};

var _tc4DataCache = {}; // { tenseId: unit } — evita recargar si ya está en memoria

function loadTensesC4Data(tenseId, callback) {
  if (_tc4DataCache[tenseId]) { callback(_tc4DataCache[tenseId]); return; }
  var meta = TENSES_C4[tenseId];
  fetch(meta.dataFile)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var unit = d.units[0];
      _tc4DataCache[tenseId] = unit;
      callback(unit);
    })
    .catch(function(e) {
      showError('los ejercicios de ' + meta.title, e, function(){ loadTensesC4Data(tenseId, callback); }, 's-english-exercises-tenses-c4');
    });
}

/* ---- Menú de tipos (se llama al pulsar un tiempo ya construido) ---- */
function openTensesExerciseMenu(tenseId) {
  var meta = TENSES_C4[tenseId];
  if (!meta) { showToast('🚧 Coming soon!'); return; }
  _tc4.tenseId = tenseId;

  setEl('tenc4-extype-title', meta.title);
  var topbar = document.getElementById('tenc4-extype-topbar');
  if (topbar) topbar.style.background = meta.color;
  go('s-english-tenses-extype-c4');

  loadTensesC4Data(tenseId, function(unit) {
    _tc4.unit = unit;
    var grid = document.getElementById('tenc4-extype-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var byType = {};
    unit.exercises.forEach(function(ex) {
      if (!byType[ex.type]) byType[ex.type] = [];
      byType[ex.type].push(ex);
    });

    Object.keys(byType).sort().forEach(function(type) {
      var info = TYPE_LABELS_C4[type] || { emoji: '📝', label: 'Exercises' };
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.innerHTML =
        '<div class="mode-emoji">' + info.emoji + '</div>' +
        '<div class="mode-name">' + info.label + '</div>' +
        '<div class="mode-sub">' + byType[type].length + ' questions</div>';
      card.addEventListener('click', (function(t, exs) {
        return function() { startTensesExercises(t, exs); };
      })(type, byType[type]));
      grid.appendChild(card);
    });

    // Word order — siempre al final, igual que en 3º
    var woCard = document.createElement('div');
    woCard.className = 'mode-card';
    woCard.innerHTML = '<div class="mode-emoji">🔀</div><div class="mode-name">Word order</div><div class="mode-sub">Put words in order</div>';
    woCard.addEventListener('click', function() { startTensesWordOrder(); });
    grid.appendChild(woCard);

    // Time markers — solo si la unidad trae pares
    if (unit.timeMarkers && unit.timeMarkers.length) {
      var tmCard = document.createElement('div');
      tmCard.className = 'mode-card';
      tmCard.innerHTML = '<div class="mode-emoji">⏰</div><div class="mode-name">Time markers</div><div class="mode-sub">Match the clues</div>';
      tmCard.addEventListener('click', function() { startTensesTimeMarkers(); });
      grid.appendChild(tmCard);
    }
  });
}

/* ---- Multiple choice (tipos A-D) ---- */
function startTensesExercises(type, exercises) {
  var exs = exercises.slice();
  for (var i = exs.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
  }
  _tc4.type  = type;
  _tc4.queue = exs;
  _tc4.idx   = 0;

  var meta = TENSES_C4[_tc4.tenseId];
  var info = TYPE_LABELS_C4[type] || { label: 'Exercises' };
  setEl('tenc4-ex-title', meta.title + ' — ' + info.label);
  var topbar = document.getElementById('tenc4-ex-topbar');
  if (topbar) topbar.style.background = meta.color;

  go('s-english-tenses-ex-c4');
  showTensesQuestion();
}

function showTensesQuestion() {
  mcShowQuestion({
    queue:        _tc4.queue,
    idx:          _tc4.idx,
    prefix:       'tenc4-ex',
    subjectKey:   'english',
    exerciseKey:  TENSES_C4[_tc4.tenseId].statsKey,
    badgeLabel:   'Question',
    correctMsg:   function(pts, attempt) { return '✅ Correct! +' + pts + ' pts 🎉'; },
    tryAgainMsg:  '❌ Try again!',
    setIdx:       function(v){ _tc4.idx = v; },
    onFinish:     function(){ go('s-english-tenses-extype-c4'); },
    onAdvance:    function(){ showTensesQuestion(); }
  });
}

function nextTensesQuestion() {
  _tc4.idx++;
  if (_tc4.idx >= _tc4.queue.length) { go('s-english-tenses-extype-c4'); return; }
  showTensesQuestion();
}

/* ---- Word order (misma extracción de frases que ya usa el resto
   de la app — extractSentences()/shuffleArr(), en english-study.js) ---- */
function startTensesWordOrder() {
  var sentences = extractSentences(_tc4.unit);
  sentences = shuffleArr(sentences).slice(0, 15);
  _tc4.woQueue = sentences;
  _tc4.woIdx   = 0;

  var meta = TENSES_C4[_tc4.tenseId];
  setEl('tenc4-wo-title', meta.title + ' — Word Order');
  var topbar = document.getElementById('tenc4-wo-topbar');
  if (topbar) topbar.style.background = meta.color;

  go('s-english-tenses-wo-c4');
  _tensesWoLoad();
}

function _tensesWoLoad() {
  woStart({
    queue:       _tc4.woQueue,
    idx:         _tc4.woIdx,
    prefix:      'tenc4-wo',
    subjectKey:  'english',
    exerciseKey: TENSES_C4[_tc4.tenseId].statsKey,
    badgeLabel:  'Question',
    setIdx:      function(v){ _tc4.woIdx = v; },
    onFinish:    function(){ go('s-english-tenses-extype-c4'); },
    onAdvance:   function(){ _tensesWoLoad(); }
  });
}
/* checkWordOrder()/resetWordOrder()/nextWordOrder() (definidas en
   english-study.js) son genéricas — llaman a woCheck()/woReset()/
   woNext() sobre el estado interno del motor, así que no hace
   falta redefinirlas aquí; los botones de s-english-tenses-wo-c4
   las reutilizan directamente. */

/* ---- Time markers (relacionar — una sola ronda con todos los pares) ---- */
function startTensesTimeMarkers() {
  var meta = TENSES_C4[_tc4.tenseId];
  setEl('tenc4-match-title', meta.title + ' — Time Markers');
  var topbar = document.getElementById('tenc4-match-topbar');
  if (topbar) topbar.style.background = meta.color;

  go('s-english-tenses-match-c4');

  var area = document.getElementById('tenc4-match-area');
  if (area) area.innerHTML = '';
  var fbEl = document.getElementById('tenc4-match-fb');
  if (fbEl) fbEl.style.display = 'none';
  var nextEl = document.getElementById('tenc4-match-next');
  if (nextEl) nextEl.style.display = 'none';

  mcMatchInit({
    pairs:       _tc4.unit.timeMarkers,
    containerId: 'tenc4-match-area',
    prefix:      'tenc4-match',
    subjectKey:  'english',
    exerciseKey: meta.statsKey
  });
}

function tensesTimeMarkersNext() {
  go('s-english-tenses-extype-c4');
}
