/* =============================================
   ENGLISH-EXERCISES.JS — To Be, Modal Verbs, Mix
   Usa engine-multiple-choice.js
   ============================================= */

/* ---- Helper: renderizar pregunta con traducción opcional ---- */
function _enRenderQuestion(qEl, ex) {
  if (ex.hasTranslation && ex.question && ex.question.indexOf('\n') > -1) {
    var parts = ex.question.split('\n');
    qEl.innerHTML = '<span>' + parts[0] + '</span><br><span style="font-size:12px;color:#6B7280;font-style:italic">' + parts[1] + '</span>';
  } else {
    qEl.textContent = ex.question || '';
  }
}

/* ---- Helper: config base para English exercises ---- */
function _enBaseConfig(queue, idx, prefix, area, setIdx, onFinish, onAdvance) {
  return {
    queue:        queue,
    idx:          idx,
    prefix:       prefix,
    subjectKey:   'english',
    exerciseKey:  'english-' + area,
    ptsFirst:     10,
    ptsSecond:    5,
    badgeLabel:   'Question',
    renderQuestion: _enRenderQuestion,
    correctMsg:   function(pts, attempt) {
      return '✅ Correct! +' + pts + ' pts 🎉';
    },
    tryAgainMsg:  '❌ Try again!',
    getExplanation: function(ex) { return ex.explanation || ''; },
    setIdx:       setIdx,
    onFinish:     onFinish,
    onAdvance:    onAdvance
  };
}

/* ---- EXERCISES (To Be / Modal Verbs) ---- */
function startEnglishExercisesByType(unit, type, exercises) {
  EN.exArea = unit.id === 'modal-verbs' ? 'modals' : 'tobe';
  if (type === 'E') { startWordOrder(unit); return; }
  var exs = exercises.slice();
  for (var i = exs.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
  }
  EN.exQueue = exs;
  EN.exIdx   = 0;
  var typeLabels = { 'A': 'Complete the sentence', 'B': 'Make it negative', 'C': 'Identify the tense', 'D': 'Choose the right form' };
  setEl('english-ex-title', unit.title + ' — ' + (typeLabels[type] || type));
  go('s-english-ex');
  showEnglishEx();
}

function startEnglishExercises(unit) {
  startEnglishExercisesByType(unit, 'ALL', unit.exercises);
}

function showEnglishEx() {
  mcShowQuestion(_enBaseConfig(
    EN.exQueue, EN.exIdx, 'en-ex', EN.exArea,
    function(v){ EN.exIdx = v; },
    function(){ go('s-english-exercises'); },
    function(){ showEnglishEx(); }
  ));
}

function nextEnglishEx() {
  EN.exIdx++;
  if (EN.exIdx >= EN.exQueue.length) { go('s-english-exercises'); return; }
  showEnglishEx();
}

/* ---- MIX ---- */
function startEnglishMix() {
  loadEnglishData(function() {
    var all = [];
    SubjectData.english.units.forEach(function(u) { all = all.concat(u.exercises || []); });
    if (all.length === 0) return;
    for (var i = all.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
    }
    EN.mixQueue = all;
    EN.mixIdx   = 0;
    go('s-english-mix');
    showEnglishMix();
  });
}

function showEnglishMix() {
  mcShowQuestion(_enBaseConfig(
    EN.mixQueue, EN.mixIdx, 'en-mix', EN.exArea,
    function(v){ EN.mixIdx = v; },
    function(){ go('s-english-exercises'); },
    function(){ showEnglishMix(); }
  ));
}

function nextEnglishMix() {
  EN.mixIdx++;
  if (EN.mixIdx >= EN.mixQueue.length) { go('s-english-exercises'); return; }
  showEnglishMix();
}

/* ---- Registrar resultado (mantener para compatibilidad con Word Order y Vocab) ---- */
function recordEnglishResult(correct, firstAttempt, area) {
  if (!ST.english) ST.english = { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} };
  var e = ST.english;
  e.hoy++; e.total++;
  if (area) {
    if (!e.errors) e.errors = {};
    var areaKey = area.startsWith('english-') ? area : 'english-' + area;
    var key = correct ? areaKey + '_ok' : areaKey + '_fail';
    e.errors[key] = (e.errors[key] || 0) + 1;
  }
  if (correct) {
    e.hoyOk++; e.totalOk++;
    e.streak++;
    var pts = firstAttempt ? 10 : 5;
    awardPts(pts, 'english');
  } else {
    e.streak = Math.max(0, e.streak - 1);
    saveState();
  }
}
