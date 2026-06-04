/* =============================================
   ENGLISH.JS — Study, Exercises & Mix
   ============================================= */

var EN_DATA    = null;
var enExQueue  = [];
var enExIdx    = 0;
var enMixQueue = [];
var enMixIdx   = 0;

function loadEnglishData(callback) {
  if (EN_DATA) { callback(); return; }
  fetch('data/curso3/english.json')
    .then(function(r) { return r.json(); })
    .then(function(d) { EN_DATA = d; callback(); })
    .catch(function(e) { console.error('Error loading english.json', e); });
}

/* ---- Renderizar menús dinámicos ---- */
function renderEnglishStudyMenu() {
  loadEnglishData(function() {
    var grid = document.getElementById('english-study-topics');
    if (!grid) return;
    grid.innerHTML = '';
    EN_DATA.units.forEach(function(unit) {
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.style.cssText = 'border-color:var(--blue);background:#EFF6FF';
      card.innerHTML =
        '<div class="mode-emoji">' + unit.emoji + '</div>' +
        '<div class="mode-name" style="color:var(--blue)">' + unit.title + '</div>' +
        '<div class="mode-sub">' + unit.topics.length + ' topics</div>';
      card.addEventListener('click', function() { openEnglishStudyUnit(unit); });
      grid.appendChild(card);
    });
  });
}

function renderEnglishExercisesMenu() {
  loadEnglishData(function() {
    var grid = document.getElementById('english-exercise-topics');
    if (!grid) return;
    grid.innerHTML = '';
    EN_DATA.units.forEach(function(unit) {
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.innerHTML =
        '<div class="mode-emoji">' + unit.emoji + '</div>' +
        '<div class="mode-name">' + unit.title + '</div>' +
        '<div class="mode-sub">' + unit.exercises.length + ' questions</div>';
      card.addEventListener('click', function() { startEnglishExercises(unit); });
      grid.appendChild(card);
    });
  });
}

/* ---- STUDY ---- */
function openEnglishStudyUnit(unit) {
  setEl('english-study-detail-title', unit.title);
  renderEnglishStudy(unit);
  go('s-english-study-detail');
}

function renderEnglishStudy(unit) {
  var container = document.getElementById('english-study-container');
  if (!container) return;
  container.innerHTML = '';

  unit.topics.forEach(function(topic) {
    var card = document.createElement('div');
    card.className = 'study-card';
    card.style.cssText = 'margin:0 16px 10px;border-radius:16px;border:1.5px solid #BFDBFE;background:white;overflow:hidden;cursor:pointer;transition:box-shadow .2s';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px';
    header.innerHTML =
      '<span style="font-size:26px">' + (topic.emoji || '📝') + '</span>' +
      '<div style="flex:1">' +
        '<div style="font-family:var(--f);font-weight:900;font-size:15px;color:#1E3A5F">' + topic.name + '</div>' +
        (topic.keyWords && topic.keyWords.length ?
          '<div style="font-size:11px;color:var(--gray-400);font-weight:600;margin-top:2px">' +
            topic.keyWords.map(function(k) {
              return '<span style="background:#EFF6FF;color:var(--blue);padding:1px 6px;border-radius:6px;font-weight:800;font-size:10px">' + k + '</span>';
            }).join(' ') +
          '</div>' : '') +
      '</div>' +
      '<span style="font-size:16px;color:var(--gray-300);transition:transform .2s" class="study-arrow">▼</span>';

    var body = document.createElement('div');
    body.className = 'study-body';
    body.style.cssText = 'display:none;padding:0 16px 16px;border-top:1px solid #EFF6FF';
    body.innerHTML =
      '<div style="font-size:14px;color:#1E3A5F;line-height:1.7;font-weight:600;margin-top:12px">' + topic.definition + '</div>' +
      (topic.extra ? '<div style="font-size:13px;color:var(--gray-400);line-height:1.6;margin-top:8px">' + topic.extra + '</div>' : '');

    var open = false;
    header.addEventListener('click', function() {
      container.querySelectorAll('.study-body').forEach(function(b) { b.style.display = 'none'; });
      container.querySelectorAll('.study-arrow').forEach(function(a) { a.style.transform = ''; });
      container.querySelectorAll('.study-card').forEach(function(c) { c.style.boxShadow = ''; c.style.borderColor = '#BFDBFE'; });
      open = !open;
      body.style.display = open ? 'block' : 'none';
      header.querySelector('.study-arrow').style.transform = open ? 'rotate(180deg)' : '';
      card.style.boxShadow = open ? '0 4px 16px rgba(59,130,246,.15)' : '';
      card.style.borderColor = open ? 'var(--blue)' : '#BFDBFE';
    });

    card.appendChild(header);
    card.appendChild(body);
    container.appendChild(card);
  });
}

/* ---- EXERCISES ---- */
function startEnglishExercises(unit) {
  loadEnglishData(function() {
    var exs = unit.exercises.slice();
    for (var i = exs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
    }
    enExQueue = exs;
    enExIdx   = 0;
    setEl('english-ex-title', unit.title);
    go('s-english-ex');
    showEnglishEx();
  });
}

function showEnglishEx() {
  var ex = enExQueue[enExIdx];
  if (!ex) return;
  var total = enExQueue.length;

  setEl('en-ex-badge', 'Question ' + (enExIdx + 1) + ' of ' + total);
  setBar('en-ex-prog', Math.round(enExIdx / total * 100));

  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var diffEl = document.getElementById('en-ex-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  document.getElementById('en-ex-question').textContent = ex.question;
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
    fbEl.textContent = '✅ Correct!';
    nextBtn.style.display = 'block';
    recordEnglishResult(true, attempt === 1);

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
    recordEnglishResult(false, false);
  }
}

function nextEnglishEx() {
  enExIdx++;
  if (enExIdx >= enExQueue.length) { go('s-english-exercises'); updateSubjectUI('english'); return; }
  showEnglishEx();
}

/* ---- MIX ---- */
function startEnglishMix() {
  loadEnglishData(function() {
    var all = [];
    EN_DATA.units.forEach(function(u) { all = all.concat(u.exercises); });
    for (var i = all.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
    }
    enMixQueue = all;
    enMixIdx   = 0;
    go('s-english-mix');
    showEnglishMix();
  });
}

function showEnglishMix() {
  var ex = enMixQueue[enMixIdx];
  if (!ex) return;
  var total = enMixQueue.length;

  setEl('en-mix-badge', 'Question ' + (enMixIdx + 1) + ' of ' + total);
  setBar('en-mix-prog', Math.round(enMixIdx / total * 100));

  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var diffEl = document.getElementById('en-mix-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  document.getElementById('en-mix-question').textContent = ex.question;
  document.getElementById('en-mix-fb').style.display = 'none';
  document.getElementById('en-mix-next').style.display = 'none';
  renderEnglishOpts('en-mix-opts', ex, 1, 'mix');
}

function nextEnglishMix() {
  enMixIdx++;
  if (enMixIdx >= enMixQueue.length) { go('s-english-exercises'); updateSubjectUI('english'); return; }
  showEnglishMix();
}

/* ---- Registrar resultado ---- */
function recordEnglishResult(correct, firstAttempt) {
  if (!ST.english) ST.english = { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} };
  var e = ST.english;
  e.hoy++; e.total++;
  if (correct) {
    e.hoyOk++; e.totalOk++;
    var pts = firstAttempt ? 10 : 5;
    e.pts += pts;
    e.streak++;
    ST.totalPts += pts;
  } else {
    e.streak = Math.max(0, e.streak - 1);
  }
  saveState();
  updateSubjectUI('english');
  setEl('home-pts-pill', '⭐ ' + ST.totalPts + ' pts');
}
