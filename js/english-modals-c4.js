/* =============================================
   ENGLISH-MODALS-C4.JS — Could / Must / Have To,
   ejercicios (4º). Bloque 2 del plan de ejercicios de
   Grammar acordado con Israel.

   Mismo patrón que english-tenses-c4.js: reutiliza los
   motores genéricos (engine-multiple-choice.js,
   engine-word-order.js, engine-matching.js) — ninguno
   nuevo. Las pantallas de tipo/pregunta/word order son
   GENÉRICAS y compartidas por los 3 modales — ver
   screens/curso4/english-grammar.html.

   El Matching ("Which one?") es distinto al de Verb
   Tenses: aquí NO es por modal — es una sola ronda
   compartida entre los 3 (situación → frase correcta),
   con acceso directo desde el menú de Grammar Exercises,
   no desde dentro del menú de tipos de cada modal.
   ============================================= */

var MODALS_C4 = {
  'could': {
    dataFile: 'data/curso4/english-modals-could.json',
    statsKey: 'english-could-c4',
    title:    'Could',
    color:    'var(--orange)'
  },
  'must': {
    dataFile: 'data/curso4/english-modals-must.json',
    statsKey: 'english-must-c4',
    title:    'Must',
    color:    'var(--red)'
  },
  'haveto': {
    dataFile: 'data/curso4/english-modals-haveto.json',
    statsKey: 'english-haveto-c4',
    title:    'Have To',
    color:    'var(--amber)'
  }
};

var TYPE_LABELS_MODALS_C4 = {
  'A': { emoji: '✏️', label: 'Complete the sentence' },
  'B': { emoji: '🔄', label: 'Make it negative' },
  'C': { emoji: '❓', label: 'Ask a question' },
  'D': { emoji: '💬', label: 'Choose the right form' }
};

var _mdc4 = {
  modalId: null,
  unit:    null,
  type:    null,
  queue:   [],
  idx:     0,
  woQueue: [],
  woIdx:   0
};

var _mdc4DataCache = {}; // { modalId: unit }

function loadModalsC4Data(modalId, callback) {
  if (_mdc4DataCache[modalId]) { callback(_mdc4DataCache[modalId]); return; }
  var meta = MODALS_C4[modalId];
  fetch(meta.dataFile)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var unit = d.units[0];
      _mdc4DataCache[modalId] = unit;
      callback(unit);
    })
    .catch(function(e) {
      showError('los ejercicios de ' + meta.title, e, function(){ loadModalsC4Data(modalId, callback); }, 's-english-grammar-ex-c4');
    });
}

/* ---- Menú de tipos ---- */
function openModalsExerciseMenu(modalId) {
  var meta = MODALS_C4[modalId];
  if (!meta) { showToast('🚧 Coming soon!'); return; }
  _mdc4.modalId = modalId;

  setEl('mdc4-extype-title', meta.title);
  var topbar = document.getElementById('mdc4-extype-topbar');
  if (topbar) topbar.style.background = meta.color;
  go('s-english-modals-extype-c4');

  loadModalsC4Data(modalId, function(unit) {
    _mdc4.unit = unit;
    var grid = document.getElementById('mdc4-extype-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var byType = {};
    unit.exercises.forEach(function(ex) {
      if (!byType[ex.type]) byType[ex.type] = [];
      byType[ex.type].push(ex);
    });

    Object.keys(byType).sort().forEach(function(type) {
      var info = TYPE_LABELS_MODALS_C4[type] || { emoji: '📝', label: 'Exercises' };
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.innerHTML =
        '<div class="mode-emoji">' + info.emoji + '</div>' +
        '<div class="mode-name">' + info.label + '</div>' +
        '<div class="mode-sub">' + byType[type].length + ' questions</div>';
      card.addEventListener('click', (function(t, exs) {
        return function() { startModalsExercises(t, exs); };
      })(type, byType[type]));
      grid.appendChild(card);
    });

    // Word order — siempre al final
    var woCard = document.createElement('div');
    woCard.className = 'mode-card';
    woCard.innerHTML = '<div class="mode-emoji">🔀</div><div class="mode-name">Word order</div><div class="mode-sub">Put words in order</div>';
    woCard.addEventListener('click', function() { startModalsWordOrder(); });
    grid.appendChild(woCard);
  });
}

/* ---- Multiple choice (tipos A-D) ---- */
function startModalsExercises(type, exercises) {
  var exs = exercises.slice();
  for (var i = exs.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
  }
  _mdc4.type  = type;
  _mdc4.queue = exs;
  _mdc4.idx   = 0;

  var meta = MODALS_C4[_mdc4.modalId];
  var info = TYPE_LABELS_MODALS_C4[type] || { label: 'Exercises' };
  setEl('mdc4-ex-title', meta.title + ' — ' + info.label);
  var topbar = document.getElementById('mdc4-ex-topbar');
  if (topbar) topbar.style.background = meta.color;

  go('s-english-modals-ex-c4');
  showModalsQuestion();
}

function showModalsQuestion() {
  mcShowQuestion({
    queue:        _mdc4.queue,
    idx:          _mdc4.idx,
    prefix:       'mdc4-ex',
    subjectKey:   'english',
    exerciseKey:  MODALS_C4[_mdc4.modalId].statsKey,
    badgeLabel:   'Question',
    correctMsg:   function(pts, attempt) { return '✅ Correct! +' + pts + ' pts 🎉'; },
    tryAgainMsg:  '❌ Try again!',
    setIdx:       function(v){ _mdc4.idx = v; },
    onFinish:     function(){ go('s-english-modals-extype-c4'); },
    onAdvance:    function(){ showModalsQuestion(); }
  });
}

function nextModalsQuestion() {
  _mdc4.idx++;
  if (_mdc4.idx >= _mdc4.queue.length) { go('s-english-modals-extype-c4'); return; }
  showModalsQuestion();
}

/* ---- Word order (misma extracción de frases que el resto de la
   app — extractSentences()/shuffleArr(), en english-study.js) ---- */
function startModalsWordOrder() {
  var sentences = extractSentences(_mdc4.unit);
  sentences = shuffleArr(sentences).slice(0, 15);
  _mdc4.woQueue = sentences;
  _mdc4.woIdx   = 0;

  var meta = MODALS_C4[_mdc4.modalId];
  setEl('mdc4-wo-title', meta.title + ' — Word Order');
  var topbar = document.getElementById('mdc4-wo-topbar');
  if (topbar) topbar.style.background = meta.color;

  go('s-english-modals-wo-c4');
  _modalsWoLoad();
}

function _modalsWoLoad() {
  woStart({
    queue:       _mdc4.woQueue,
    idx:         _mdc4.woIdx,
    prefix:      'mdc4-wo',
    subjectKey:  'english',
    exerciseKey: MODALS_C4[_mdc4.modalId].statsKey,
    badgeLabel:  'Question',
    setIdx:      function(v){ _mdc4.woIdx = v; },
    onFinish:    function(){ go('s-english-modals-extype-c4'); },
    onAdvance:   function(){ _modalsWoLoad(); }
  });
}
/* checkWordOrder()/resetWordOrder()/nextWordOrder() (definidas en
   english-study.js) son genéricas — los botones de
   s-english-modals-wo-c4 las reutilizan directamente. */

/* ---- "Which one?" — Matching compartido entre los 3 modales.
   Una sola ronda con los 9 pares (situación → frase correcta),
   fijos — no es un subconjunto al azar como en Verbs. Se cuenta
   contra las 3 claves de stats a la vez (ver mcMatchInit no
   soporta varias exerciseKey, así que se registra bajo una clave
   propia para no falsear el % de ninguno de los 3 modales). ---- */
var MODALS_MATCH_STATS_KEY = 'english-modals-match-c4';
var _modalsMatchDataCache = null;

function loadModalsMatchData(callback) {
  if (_modalsMatchDataCache) { callback(_modalsMatchDataCache); return; }
  fetch('data/curso4/english-modals-match.json')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      _modalsMatchDataCache = d.pairs;
      callback(d.pairs);
    })
    .catch(function(e) {
      showError('el ejercicio "Which one?"', e, function(){ loadModalsMatchData(callback); }, 's-english-grammar-ex-c4');
    });
}

function startModalsMatching() {
  go('s-english-modals-match-c4');

  var area = document.getElementById('mdc4-match-area');
  if (area) area.innerHTML = '';
  var fbEl = document.getElementById('mdc4-match-fb');
  if (fbEl) fbEl.style.display = 'none';
  var nextEl = document.getElementById('mdc4-match-next');
  if (nextEl) nextEl.style.display = 'none';

  loadModalsMatchData(function(pairs) {
    mcMatchInit({
      pairs:       pairs,
      containerId: 'mdc4-match-area',
      prefix:      'mdc4-match',
      subjectKey:  'english',
      exerciseKey: MODALS_MATCH_STATS_KEY
    });
  });
}

function modalsMatchingNext() {
  go('s-english-grammar-ex-c4');
}
