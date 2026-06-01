/* =============================================
   SCIENCES.JS — Study, Exercises & Mix
   ============================================= */

var SC_DATA   = null;
var scExQueue = [];
var scExIdx   = 0;
var scMixQueue = [];
var scMixIdx   = 0;

function loadSciencesData(callback) {
  if (SC_DATA) { callback(); return; }
  fetch('data/sciences.json')
    .then(function(r) { return r.json(); })
    .then(function(d) { SC_DATA = d; callback(); })
    .catch(function(e) { console.error('Error loading sciences.json', e); });
}

/* ---- STUDY ---- */
function renderSciencesStudy() {
  loadSciencesData(function() {
    var unit = SC_DATA.units[0];
    var container = document.getElementById('sciences-study-container');
    if (!container) return;
    container.innerHTML = '';

    unit.topics.forEach(function(topic) {
      var card = document.createElement('div');
      card.style.cssText = 'margin:0 16px 10px;border-radius:16px;border:1.5px solid #99F6E4;background:white;overflow:hidden;cursor:pointer;transition:box-shadow .2s';

      var header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;';
      header.innerHTML =
        '<span style="font-size:26px">' + topic.emoji + '</span>' +
        '<div style="flex:1">' +
          '<div style="font-family:var(--f);font-weight:900;font-size:15px;color:#134E4A">' + topic.name + '</div>' +
          '<div style="font-size:11px;color:var(--gray-400);font-weight:600;margin-top:2px">' +
            topic.keyWords.map(function(k) {
              return '<span style="background:#F0FDFA;color:var(--teal);padding:1px 6px;border-radius:6px;font-weight:800;font-size:10px">' + k + '</span>';
            }).join(' ') +
          '</div>' +
        '</div>' +
        '<span style="font-size:16px;color:var(--gray-300);transition:transform .2s" class="study-arrow">▼</span>';

      var body = document.createElement('div');
      body.style.cssText = 'display:none;padding:0 16px 16px;border-top:1px solid #F0FDFA';
      body.innerHTML =
        '<div style="font-size:14px;color:#134E4A;line-height:1.7;font-weight:600;margin-top:12px">' + topic.definition + '</div>' +
        '<div style="font-size:13px;color:var(--gray-400);line-height:1.6;margin-top:8px">' + topic.extra + '</div>';

      var open = false;
      header.addEventListener('click', function() {
        open = !open;
        body.style.display = open ? 'block' : 'none';
        header.querySelector('.study-arrow').style.transform = open ? 'rotate(180deg)' : '';
        card.style.boxShadow = open ? '0 4px 16px rgba(20,184,166,.15)' : '';
        card.style.borderColor = open ? 'var(--teal)' : '#99F6E4';
      });

      card.appendChild(header);
      card.appendChild(body);
      container.appendChild(card);
    });
  });
}

/* ---- EXERCISES ---- */
function startSciencesExercises() {
  loadSciencesData(function() {
    var exs = SC_DATA.units[0].exercises.slice();
    for (var i = exs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
    }
    scExQueue = exs;
    scExIdx   = 0;
    go('s-sciences-ex');
    showSciencesEx();
  });
}

function showSciencesEx() {
  var ex = scExQueue[scExIdx];
  if (!ex) return;
  var total = scExQueue.length;

  setEl('sc-ex-badge', 'Question ' + (scExIdx + 1) + ' of ' + total);
  setBar('sc-ex-prog', Math.round(scExIdx / total * 100));

  var diff = diffLabel(ST.sciences ? ST.sciences.streak || 0 : 0);
  var diffEl = document.getElementById('sc-ex-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  document.getElementById('sc-ex-question').textContent = ex.question;
  document.getElementById('sc-ex-fb').style.display = 'none';
  document.getElementById('sc-ex-next').style.display = 'none';

  var opts = document.getElementById('sc-ex-opts');
  opts.innerHTML = '';
  ex.options.slice().sort(function() { return Math.random() - .5; }).forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.textContent = opt;
    btn.addEventListener('click', function() { checkSciencesAnswer(opt, ex.answer, 'ex'); });
    opts.appendChild(btn);
  });
}

function checkSciencesAnswer(selected, correct, mode) {
  var isCorrect = selected === correct;
  recordSciencesResult(isCorrect, mode);

  var fbEl    = document.getElementById('sc-' + mode + '-fb');
  var opts    = document.getElementById('sc-' + mode + '-opts');
  var nextBtn = document.getElementById('sc-' + mode + '-next');

  Array.from(opts.children).forEach(function(btn) {
    btn.disabled = true;
    if (btn.textContent === correct) btn.classList.add('opt-correct');
    else if (btn.textContent === selected && !isCorrect) btn.classList.add('opt-wrong');
  });

  fbEl.style.display = 'block';
  fbEl.className = 'feedback ' + (isCorrect ? 'fb-ok' : 'fb-err');
  fbEl.textContent = isCorrect ? '✅ Correct!' : '❌ The answer is: ' + correct;
  nextBtn.style.display = 'block';
}

function nextSciencesEx() {
  scExIdx++;
  if (scExIdx >= scExQueue.length) {
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
    SC_DATA.units.forEach(function(u) { all = all.concat(u.exercises); });
    for (var i = all.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
    }
    scMixQueue = all;
    scMixIdx   = 0;
    go('s-sciences-mix');
    showSciencesMix();
  });
}

function showSciencesMix() {
  var ex = scMixQueue[scMixIdx];
  if (!ex) return;
  var total = scMixQueue.length;

  setEl('sc-mix-badge', 'Question ' + (scMixIdx + 1) + ' of ' + total);
  setBar('sc-mix-prog', Math.round(scMixIdx / total * 100));

  var diff = diffLabel(ST.sciences ? ST.sciences.streak || 0 : 0);
  var diffEl = document.getElementById('sc-mix-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  document.getElementById('sc-mix-question').textContent = ex.question;
  document.getElementById('sc-mix-fb').style.display = 'none';
  document.getElementById('sc-mix-next').style.display = 'none';

  var opts = document.getElementById('sc-mix-opts');
  opts.innerHTML = '';
  ex.options.slice().sort(function() { return Math.random() - .5; }).forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.textContent = opt;
    btn.addEventListener('click', function() { checkSciencesAnswer(opt, ex.answer, 'mix'); });
    opts.appendChild(btn);
  });
}

function nextSciencesMix() {
  scMixIdx++;
  if (scMixIdx >= scMixQueue.length) {
    go('s-sciences');
    updateSubjectUI('sciences');
    return;
  }
  showSciencesMix();
}

/* ---- Registrar resultado ---- */
function recordSciencesResult(correct, mode) {
  if (!ST.sciences) ST.sciences = { hoy: 0, hoyOk: 0, total: 0, totalOk: 0, pts: 0, streak: 0, errors: {} };
  var s = ST.sciences;
  s.hoy++; s.total++;
  if (correct) {
    s.hoyOk++; s.totalOk++;
    s.pts += 10;
    s.streak++;
    ST.totalPts += 10;
  } else {
    s.streak = Math.max(0, s.streak - 1);
  }
  saveState();
  updateSubjectUI('sciences');
  setEl('home-pts-pill', '⭐ ' + ST.totalPts + ' pts');
}
