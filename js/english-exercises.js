/* =============================================
   ENGLISH-EXERCISES.JS — To Be, Modal Verbs, Mix
   ============================================= */

/* ---- EXERCISES ---- */
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
  var ex = EN.exQueue[EN.exIdx];
  if (!ex) return;
  var total = EN.exQueue.length;
  setEl('en-ex-badge', 'Question ' + (EN.exIdx + 1) + ' of ' + total);
  setBar('en-ex-prog', Math.round(EN.exIdx / total * 100));
  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var diffEl = document.getElementById('en-ex-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  // Mostrar pregunta — si tiene traducción, separar líneas
  var qEl = document.getElementById('en-ex-question');
  if (ex.hasTranslation && ex.question.indexOf('\n') > -1) {
    var parts = ex.question.split('\n');
    qEl.innerHTML = '<span>' + parts[0] + '</span><br><span style="font-size:12px;color:#6B7280;font-style:italic">' + parts[1] + '</span>';
  } else {
    qEl.textContent = ex.question;
  }

  document.getElementById('en-ex-fb').style.display = 'none';
  document.getElementById('en-ex-next').style.display = 'none';
  renderEnglishOpts('en-ex-opts', ex, 1, 'ex');
}

function renderEnglishOpts(containerId, ex, attempt, mode) {
  var opts = document.getElementById(containerId);
  opts.innerHTML = '';
  ex.options.slice().sort(function() { return Math.random() - .5; }).forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'wopt-btn';
    btn.textContent = opt;
    btn.addEventListener('click', function() { checkEnglishAnswer(opt, ex, attempt, mode); });
    opts.appendChild(btn);
  });
}

function checkEnglishAnswer(selected, ex, attempt, mode) {
  var correct   = ex.answer;
  var isCorrect = selected === correct;
  var fbEl      = document.getElementById('en-' + mode + '-fb');
  var opts      = document.getElementById('en-' + mode + '-opts');
  var nextBtn   = document.getElementById('en-' + mode + '-next');

  if (isCorrect) {
    Array.from(opts.children).forEach(function(btn) {
      btn.disabled = true;
      if (btn.textContent === correct) btn.className = 'wopt-btn wok';
    });
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct! +' + (attempt === 1 ? 10 : 5) + ' pts 🎉';
    nextBtn.style.display = 'block';
    recordEnglishResult(true, attempt === 1, EN.exArea);
  } else if (attempt === 1) {
    Array.from(opts.children).forEach(function(btn) {
      if (btn.textContent === selected) {
        btn.className = 'wopt-btn wbad';
        btn.disabled = true;
      } else {
        var newBtn = btn.cloneNode(true);
        newBtn.addEventListener('click', function() { checkEnglishAnswer(newBtn.textContent, ex, 2, mode); });
        btn.parentNode.replaceChild(newBtn, btn);
      }
    });
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Try again!';
  } else {
    var explanation = ex.explanation || '';
    Array.from(opts.children).forEach(function(btn) {
      btn.disabled = true;
      if (btn.textContent === correct) btn.className = 'wopt-btn wok';
      else if (btn.textContent === selected) btn.className = 'wopt-btn wbad';
    });
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ The answer is <strong>' + correct + '</strong>' +
      (explanation ? '<div style="margin-top:8px;font-size:12px;font-weight:600;opacity:.85;line-height:1.5">' + explanation + '</div>' : '');
    nextBtn.style.display = 'block';
    recordEnglishResult(false, false, EN.exArea);
  }
}

function nextEnglishEx() {
  EN.exIdx++;
  if (EN.exIdx >= EN.exQueue.length) { go('s-english-exercises'); updateSubjectUI('english'); return; }
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
  var ex = EN.mixQueue[EN.mixIdx];
  if (!ex) return;
  var total = EN.mixQueue.length;
  setEl('en-mix-badge', 'Question ' + (EN.mixIdx + 1) + ' of ' + total);
  setBar('en-mix-prog', Math.round(EN.mixIdx / total * 100));
  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var diffEl = document.getElementById('en-mix-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }
  var qElM = document.getElementById('en-mix-question');
  if (ex.hasTranslation && ex.question.indexOf('\n') > -1) {
    var partsM = ex.question.split('\n');
    qElM.innerHTML = '<span>' + partsM[0] + '</span><br><span style="font-size:12px;color:#6B7280;font-style:italic">' + partsM[1] + '</span>';
  } else {
    qElM.textContent = ex.question;
  }
  document.getElementById('en-mix-fb').style.display = 'none';
  document.getElementById('en-mix-next').style.display = 'none';
  renderEnglishOpts('en-mix-opts', ex, 1, 'mix');
}

function nextEnglishMix() {
  EN.mixIdx++;
  if (EN.mixIdx >= EN.mixQueue.length) { go('s-english-exercises'); updateSubjectUI('english'); return; }
  showEnglishMix();
}

/* ---- Registrar resultado ---- */
function recordEnglishResult(correct, firstAttempt, area) {
  if (!ST.english) ST.english = { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} };
  var e = ST.english;
  e.hoy++; e.total++;
  // Guardar estadística por área (tobe, modals, vocab)
  if (area) {
    if (!e.errors) e.errors = {};
    var key = correct ? area + '_ok' : area + '_fail';
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
  updateSubjectUI('english');
  if (typeof updateHomeUI === 'function') updateHomeUI();
  setEl('home-pts-pill', '⭐ ' + ST.totalPts + ' pts');
}
