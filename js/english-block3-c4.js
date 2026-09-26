/* =============================================
   ENGLISH-BLOCK3-C4.JS — Telling Time / Wh- Questions /
   -er-/-est / Adverbs / Prepositions, ejercicios (4º).
   Bloque 3 del plan de ejercicios de Grammar acordado
   con Israel.

   Mismo patrón que english-modals-c4.js: reutiliza los
   motores genéricos (engine-multiple-choice.js,
   engine-word-order.js) — ninguno nuevo. Las pantallas de
   tipo/pregunta/word order son GENÉRICAS y compartidas por
   los 5 temas — ver screens/curso4/english-grammar.html
   (bloque "GRAMMAR — EJERCICIOS (Bloque 3)").

   Cada tema es una entrada de BLOCK3_C4 con su dataFile,
   statsKey, título, color y si lleva Word Order o no.
   Sin Matching en este bloque.
   ============================================= */

var BLOCK3_C4 = {
  'time': {
    dataFile: 'data/curso4/english-time.json',
    statsKey: 'english-time-c4',
    title:    'Telling Time',
    color:    'var(--blue)',
    wordOrder: false
  },
  'whquestions': {
    dataFile: 'data/curso4/english-whquestions.json',
    statsKey: 'english-whquestions-c4',
    title:    'Wh- Questions',
    color:    'var(--purple)',
    wordOrder: true
  },
  'erest': {
    dataFile: 'data/curso4/english-erest.json',
    statsKey: 'english-erest-c4',
    title:    '-er / -est',
    color:    'var(--green)',
    wordOrder: true
  },
  'adverbs': {
    dataFile: 'data/curso4/english-adverbs.json',
    statsKey: 'english-adverbs-c4',
    title:    'Adverbs',
    color:    '#78350F',
    wordOrder: true
  },
  'prepositions': {
    dataFile: 'data/curso4/english-prepositions.json',
    statsKey: 'english-prepositions-c4',
    title:    'Prepositions',
    color:    'var(--blue)',
    wordOrder: true
  }
};

var TYPE_LABELS_BLOCK3_C4 = {
  'A': { emoji: '✏️', label: 'Complete' },
  'B': { emoji: '🔄', label: 'Choose the sentence' },
  'C': { emoji: '🇪🇸', label: 'Translate' }
};

var _b3c4 = {
  topicId: null,
  unit:    null,
  type:    null,
  queue:   [],
  idx:     0,
  woQueue: [],
  woIdx:   0
};

var _b3c4DataCache = {}; // { topicId: unit }

function loadBlock3C4Data(topicId, callback) {
  if (_b3c4DataCache[topicId]) { callback(_b3c4DataCache[topicId]); return; }
  var meta = BLOCK3_C4[topicId];
  fetch(meta.dataFile)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var unit = d.units[0];
      _b3c4DataCache[topicId] = unit;
      callback(unit);
    })
    .catch(function(e) {
      showError('los ejercicios de ' + meta.title, e, function(){ loadBlock3C4Data(topicId, callback); }, 's-english-grammar-ex-c4');
    });
}

/* ---- Menú de tipos ---- */
function openBlock3ExerciseMenu(topicId) {
  var meta = BLOCK3_C4[topicId];
  if (!meta) { showToast('🚧 Coming soon!'); return; }
  _b3c4.topicId = topicId;

  setEl('b3c4-extype-title', meta.title);
  var topbar = document.getElementById('b3c4-extype-topbar');
  if (topbar) topbar.style.background = meta.color;
  go('s-english-b3-extype-c4');

  loadBlock3C4Data(topicId, function(unit) {
    _b3c4.unit = unit;
    var grid = document.getElementById('b3c4-extype-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var byType = {};
    unit.exercises.forEach(function(ex) {
      if (!byType[ex.type]) byType[ex.type] = [];
      byType[ex.type].push(ex);
    });

    Object.keys(byType).sort().forEach(function(type) {
      var info = TYPE_LABELS_BLOCK3_C4[type] || { emoji: '📝', label: 'Exercises' };
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.innerHTML =
        '<div class="mode-emoji">' + info.emoji + '</div>' +
        '<div class="mode-name">' + info.label + '</div>' +
        '<div class="mode-sub">' + byType[type].length + ' questions</div>';
      card.addEventListener('click', (function(t, exs) {
        return function() { startBlock3Exercises(t, exs); };
      })(type, byType[type]));
      grid.appendChild(card);
    });

    // Word order — solo si el tema lo lleva, siempre al final
    if (meta.wordOrder) {
      var woCard = document.createElement('div');
      woCard.className = 'mode-card';
      woCard.innerHTML = '<div class="mode-emoji">🔀</div><div class="mode-name">Word order</div><div class="mode-sub">Put words in order</div>';
      woCard.addEventListener('click', function() { startBlock3WordOrder(); });
      grid.appendChild(woCard);
    }
  });
}

/* ---- Multiple choice (tipos A/B/C) ---- */
function startBlock3Exercises(type, exercises) {
  var exs = exercises.slice();
  for (var i = exs.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
  }
  _b3c4.type  = type;
  _b3c4.queue = exs;
  _b3c4.idx   = 0;

  var meta = BLOCK3_C4[_b3c4.topicId];
  var info = TYPE_LABELS_BLOCK3_C4[type] || { label: 'Exercises' };
  setEl('b3c4-ex-title', meta.title + ' — ' + info.label);
  var topbar = document.getElementById('b3c4-ex-topbar');
  if (topbar) topbar.style.background = meta.color;

  go('s-english-b3-ex-c4');
  showBlock3Question();
}

function showBlock3Question() {
  mcShowQuestion({
    queue:        _b3c4.queue,
    idx:          _b3c4.idx,
    prefix:       'b3c4-ex',
    subjectKey:   'english',
    exerciseKey:  BLOCK3_C4[_b3c4.topicId].statsKey,
    badgeLabel:   'Question',
    correctMsg:   function(pts, attempt) { return '✅ Correct! +' + pts + ' pts 🎉'; },
    tryAgainMsg:  '❌ Try again!',
    setIdx:       function(v){ _b3c4.idx = v; },
    onFinish:     function(){ go('s-english-b3-extype-c4'); },
    onAdvance:    function(){ showBlock3Question(); }
  });
}

function nextBlock3Question() {
  _b3c4.idx++;
  if (_b3c4.idx >= _b3c4.queue.length) { go('s-english-b3-extype-c4'); return; }
  showBlock3Question();
}

/* ---- Word order (misma extracción de frases que el resto de la
   app — extractSentences()/shuffleArr(), en english-study.js) ---- */
function startBlock3WordOrder() {
  var sentences = extractSentences(_b3c4.unit);
  sentences = shuffleArr(sentences).slice(0, 15);
  _b3c4.woQueue = sentences;
  _b3c4.woIdx   = 0;

  var meta = BLOCK3_C4[_b3c4.topicId];
  setEl('b3c4-wo-title', meta.title + ' — Word Order');
  var topbar = document.getElementById('b3c4-wo-topbar');
  if (topbar) topbar.style.background = meta.color;

  go('s-english-b3-wo-c4');
  _block3WoLoad();
}

function _block3WoLoad() {
  woStart({
    queue:       _b3c4.woQueue,
    idx:         _b3c4.woIdx,
    prefix:      'b3c4-wo',
    subjectKey:  'english',
    exerciseKey: BLOCK3_C4[_b3c4.topicId].statsKey,
    badgeLabel:  'Question',
    setIdx:      function(v){ _b3c4.woIdx = v; },
    onFinish:    function(){ go('s-english-b3-extype-c4'); },
    onAdvance:   function(){ _block3WoLoad(); }
  });
}
/* checkWordOrder()/resetWordOrder()/nextWordOrder() (definidas en
   english-study.js) son genéricas — los botones de
   s-english-b3-wo-c4 las reutilizan directamente. */
