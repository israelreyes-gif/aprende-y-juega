/* =============================================
   SCIENCES-EXERCISES.JS — Ejercicios y Mix
   Usa el motor genérico de opción múltiple
   (engine-multiple-choice.js)
   ============================================= */

function _sciencesExplanation(ex) {
  if (!SubjectData.sciences) return '';
  var explanation = '';
  SubjectData.sciences.units[0].topics.forEach(function(t) {
    if (t.name === ex.answer) {
      explanation = t.definition.replace(/<[^>]+>/g, '') + ' ' + t.extra.replace(/<[^>]+>/g, '');
    }
  });
  return explanation;
}

/* ---- EXERCISES ---- */
function startSciencesExercises() {
  loadSciencesData(function() {
    var exs = SubjectData.sciences.units[0].exercises.slice();
    for (var i = exs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
    }
    SC.exQueue = exs;
    SC.exIdx   = 0;
    go('s-sciences-ex');
    showSciencesEx();
  });
}

function showSciencesEx() {
  var ex = SC.exQueue[SC.exIdx];
  var exKey = 'ex' + (SC.exIdx + 1); // ex1, ex2, ... ex10
  mcShowQuestion({
    queue: SC.exQueue,
    idx: SC.exIdx,
    prefix: 'sc-ex',
    subjectKey: 'sciences',
    exerciseKey: exKey,
    badgeLabel: 'Question',
    getExplanation: _sciencesExplanation
  });
}

function nextSciencesEx() {
  mcNext({
    queue: SC.exQueue,
    idx: SC.exIdx,
    setIdx: function(v) { SC.exIdx = v; },
    onFinish: function() {
      go('s-sciences');
      updateSubjectUI('sciences');
    },
    onAdvance: function() { showSciencesEx(); }
  });
}

/* ---- MIX ---- */
function startSciencesMix() {
  loadSciencesData(function() {
    var all = [];
    SubjectData.sciences.units.forEach(function(u) { all = all.concat(u.exercises); });
    for (var i = all.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
    }
    SC.mixQueue = all;
    SC.mixIdx   = 0;
    go('s-sciences-mix');
    showSciencesMix();
  });
}

function showSciencesMix() {
  mcShowQuestion({
    queue: SC.mixQueue,
    idx: SC.mixIdx,
    prefix: 'sc-mix',
    subjectKey: 'sciences',
    exerciseKey: 'mix',
    badgeLabel: 'Question',
    getExplanation: _sciencesExplanation
  });
}

function nextSciencesMix() {
  mcNext({
    queue: SC.mixQueue,
    idx: SC.mixIdx,
    setIdx: function(v) { SC.mixIdx = v; },
    onFinish: function() {
      go('s-sciences');
      updateSubjectUI('sciences');
    },
    onAdvance: function() { showSciencesMix(); }
  });
}
