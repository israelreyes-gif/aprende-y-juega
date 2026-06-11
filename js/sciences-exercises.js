/* =============================================
   SCIENCES-EXERCISES.JS — Ejercicios y Mix
   ============================================= */

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
  if (!ex) return;
  var total = SC.exQueue.length;

  setEl('sc-ex-badge', 'Question ' + (SC.exIdx + 1) + ' of ' + total);
  setBar('sc-ex-prog', Math.round(SC.exIdx / total * 100));

  var diff = diffLabel(ST.sciences ? ST.sciences.streak || 0 : 0);
  var diffEl = document.getElementById('sc-ex-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  document.getElementById('sc-ex-question').textContent = ex.question;
  document.getElementById('sc-ex-fb').style.display = 'none';
  document.getElementById('sc-ex-next').style.display = 'none';

  renderSciencesOpts('sc-ex-opts', ex, 1, 'ex');
}

function renderSciencesOpts(containerId, ex, attempt, mode) {
  var opts = document.getElementById(containerId);
  opts.innerHTML = '';
  ex.options.slice().sort(function() { return Math.random() - .5; }).forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'wopt-btn';
    btn.textContent = opt;
    btn.addEventListener('click', function() { checkSciencesAnswer(opt, ex, attempt, mode); });
    opts.appendChild(btn);
  });
}

function checkSciencesAnswer(selected, ex, attempt, mode) {
  var correct  = ex.answer;
  var isCorrect = selected === correct;
  var fbEl     = document.getElementById('sc-' + mode + '-fb');
  var opts     = document.getElementById('sc-' + mode + '-opts');
  var nextBtn  = document.getElementById('sc-' + mode + '-next');

  if (isCorrect) {
    // Correcto: marcar verde y mostrar siguiente
    Array.from(opts.children).forEach(function(btn) {
      btn.disabled = true;
      if (btn.textContent === correct) btn.className = 'wopt-btn wok';
    });
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct! +' + (attempt === 1 ? 10 : 5) + ' pts 🎉';
    nextBtn.style.display = 'block';
    recordSciencesResult(true, attempt === 1);

  } else if (attempt === 1) {
    // Primer fallo: marcar rojo, dejar intentar de nuevo
    Array.from(opts.children).forEach(function(btn) {
      if (btn.textContent === selected) btn.className = 'wopt-btn wbad';
    });
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Try again!';
    // Reactivar los otros botones para segundo intento
    Array.from(opts.children).forEach(function(btn) {
      if (btn.textContent !== selected) {
        btn.disabled = false;
        var newBtn = btn.cloneNode(true);
        newBtn.addEventListener('click', function() { checkSciencesAnswer(newBtn.textContent, ex, 2, mode); });
        btn.parentNode.replaceChild(newBtn, btn);
      } else {
        btn.disabled = true;
      }
    });

  } else {
    // Segundo fallo: marcar todo, mostrar respuesta correcta y explicación
    Array.from(opts.children).forEach(function(btn) {
      btn.disabled = true;
      if (btn.textContent === correct) btn.className = 'wopt-btn wok';
      else if (btn.textContent === selected) btn.className = 'wopt-btn wbad';
    });
    // Buscar la explicación del topic correcto
    var explanation = '';
    if (SubjectData.sciences) {
      SubjectData.sciences.units[0].topics.forEach(function(t) {
        if (t.name === correct) explanation = t.definition.replace(/<[^>]+>/g, '') + ' ' + t.extra.replace(/<[^>]+>/g, '');
      });
    }
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ The answer is <strong>' + correct + '</strong>' +
      (explanation ? '<div style="margin-top:8px;font-size:12px;font-weight:600;opacity:.85;line-height:1.5">' + explanation + '</div>' : '');
    nextBtn.style.display = 'block';
    recordSciencesResult(false, false);
  }
}

function nextSciencesEx() {
  SC.exIdx++;
  if (SC.exIdx >= SC.exQueue.length) {
    go('s-sciences');
    updateSubjectUI('sciences');
    return;
  }
  showSciencesEx();
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
  var ex = SC.mixQueue[SC.mixIdx];
  if (!ex) return;
  var total = SC.mixQueue.length;

  setEl('sc-mix-badge', 'Question ' + (SC.mixIdx + 1) + ' of ' + total);
  setBar('sc-mix-prog', Math.round(SC.mixIdx / total * 100));

  var diff = diffLabel(ST.sciences ? ST.sciences.streak || 0 : 0);
  var diffEl = document.getElementById('sc-mix-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  document.getElementById('sc-mix-question').textContent = ex.question;
  document.getElementById('sc-mix-fb').style.display = 'none';
  document.getElementById('sc-mix-next').style.display = 'none';

  renderSciencesOpts('sc-mix-opts', ex, 1, 'mix');
}

function nextSciencesMix() {
  SC.mixIdx++;
  if (SC.mixIdx >= SC.mixQueue.length) {
    go('s-sciences');
    updateSubjectUI('sciences');
    return;
  }
  showSciencesMix();
}

/* ---- Registrar resultado ---- */
function recordSciencesResult(correct, firstAttempt) {
  if (!ST.sciences) ST.sciences = { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} };
  var s = ST.sciences;
  s.hoy++; s.total++;
  if (correct) {
    s.hoyOk++; s.totalOk++;
    s.streak++;
    var pts = firstAttempt ? 10 : 5;
    awardPts(pts, 'sciences');
  } else {
    s.streak = Math.max(0, s.streak - 1);
    saveState();
  }
  updateSubjectUI('sciences');
  setEl('home-pts-pill', '⭐ ' + ST.totalPts + ' pts');
}
