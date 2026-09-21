/* =============================================
   ENGLISH-VERBS-EX-C4.JS — Ejercicios de la lista de
   Verbs (4º), Bloque 1 del plan de ejercicios pendientes
   (Verbs / Grammar) acordado con Israel.

   Reutiliza los mismos motores genéricos que el resto de
   la app (engine-multiple-choice.js, engine-matching.js)
   — ninguno nuevo. A diferencia de Verb Tenses, aquí NO
   hay Word Order: el contenido son verbos sueltos, no
   frases completas, así que extractSentences() no tendría
   nada útil que extraer.

   Los 48 verbos (con traducción y pasado) están en
   data/curso4/english-verbs-exercises.json — la misma
   lista que ya se ve en Study > Verbs
   (screens/curso4/english-verbs.html), para no duplicar
   datos por dos sitios distintos.
   ============================================= */

var VERBS_EX_C4_DATA_FILE = 'data/curso4/english-verbs-exercises.json';
var VERBS_EX_C4_STATS_KEY = 'english-verbs-c4';

var TYPE_LABELS_VERBS_C4 = {
  'A': { emoji: '🌍', label: 'Translate it' },
  'B': { emoji: '⏪', label: 'Past tense' },
  'C': { emoji: '🔀', label: 'Regular or irregular?' },
  'D': { emoji: '💬', label: 'How do you say it?' }
};

/* Estado local — igual que _tc4 en english-tenses-c4.js */
var _verbsEx = {
  unit:    null,
  type:    null,
  queue:   [],
  idx:     0
};

var _verbsExDataCache = null; // se cachea entera tras la primera carga

function loadVerbsExData(callback) {
  if (_verbsExDataCache) { callback(_verbsExDataCache); return; }
  fetch(VERBS_EX_C4_DATA_FILE)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var unit = d.units[0];
      _verbsExDataCache = unit;
      callback(unit);
    })
    .catch(function(e) {
      showError('los ejercicios de Verbs', e, function(){ loadVerbsExData(callback); }, 's-english-exercises-c4');
    });
}

/* ---- Menú de tipos ---- */
function openVerbsExerciseMenu() {
  go('s-english-verbs-extype-c4');

  loadVerbsExData(function(unit) {
    _verbsEx.unit = unit;
    var grid = document.getElementById('verbsex-extype-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var byType = {};
    unit.exercises.forEach(function(ex) {
      if (!byType[ex.type]) byType[ex.type] = [];
      byType[ex.type].push(ex);
    });

    Object.keys(byType).sort().forEach(function(type) {
      var info = TYPE_LABELS_VERBS_C4[type] || { emoji: '📝', label: 'Exercises' };
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.innerHTML =
        '<div class="mode-emoji">' + info.emoji + '</div>' +
        '<div class="mode-name">' + info.label + '</div>' +
        '<div class="mode-sub">' + byType[type].length + ' questions</div>';
      card.addEventListener('click', (function(t, exs) {
        return function() { startVerbsExercises(t, exs); };
      })(type, byType[type]));
      grid.appendChild(card);
    });

    // Matching — siempre al final, con un subconjunto al azar de
    // verbos (no todos: son 48, demasiados para una sola ronda de
    // relacionar) que cambia en cada partida.
    var matchCard = document.createElement('div');
    matchCard.className = 'mode-card';
    matchCard.innerHTML = '<div class="mode-emoji">🔗</div><div class="mode-name">Matching</div><div class="mode-sub">Verb ↔ meaning</div>';
    matchCard.addEventListener('click', function() { startVerbsMatching(); });
    grid.appendChild(matchCard);
  });
}

/* ---- Multiple choice (tipos A-D) ---- */
function startVerbsExercises(type, exercises) {
  var exs = exercises.slice();
  for (var i = exs.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
  }
  _verbsEx.type  = type;
  _verbsEx.queue = exs;
  _verbsEx.idx   = 0;

  var info = TYPE_LABELS_VERBS_C4[type] || { label: 'Exercises' };
  setEl('verbsex-ex-title', 'Verbs — ' + info.label);

  go('s-english-verbs-ex-c4');
  showVerbsQuestion();
}

function showVerbsQuestion() {
  mcShowQuestion({
    queue:        _verbsEx.queue,
    idx:          _verbsEx.idx,
    prefix:       'verbsex-ex',
    subjectKey:   'english',
    exerciseKey:  VERBS_EX_C4_STATS_KEY,
    badgeLabel:   'Question',
    correctMsg:   function(pts, attempt) { return '✅ Correct! +' + pts + ' pts 🎉'; },
    tryAgainMsg:  '❌ Try again!',
    setIdx:       function(v){ _verbsEx.idx = v; },
    onFinish:     function(){ go('s-english-verbs-extype-c4'); },
    onAdvance:    function(){ showVerbsQuestion(); }
  });
}

function nextVerbsQuestion() {
  _verbsEx.idx++;
  if (_verbsEx.idx >= _verbsEx.queue.length) { go('s-english-verbs-extype-c4'); return; }
  showVerbsQuestion();
}

/* ---- Matching (relacionar — subconjunto al azar de 8 verbos) ---- */
function startVerbsMatching() {
  go('s-english-verbs-match-c4');

  var area = document.getElementById('verbsex-match-area');
  if (area) area.innerHTML = '';
  var fbEl = document.getElementById('verbsex-match-fb');
  if (fbEl) fbEl.style.display = 'none';
  var nextEl = document.getElementById('verbsex-match-next');
  if (nextEl) nextEl.style.display = 'none';

  var pool = _verbsEx.unit.verbList.slice();
  for (var i = pool.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  var picked = pool.slice(0, 8);
  var pairs = picked.map(function(v) { return { left: v.en, right: v.es }; });
  _verbsEx.lastMatchPairs = pairs; // solo para depuración/tests

  mcMatchInit({
    pairs:       pairs,
    containerId: 'verbsex-match-area',
    prefix:      'verbsex-match',
    subjectKey:  'english',
    exerciseKey: VERBS_EX_C4_STATS_KEY
  });
}

function verbsMatchingNext() {
  go('s-english-verbs-extype-c4');
}
