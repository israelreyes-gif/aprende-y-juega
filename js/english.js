/* =============================================
   ENGLISH.JS — Study, Exercises & Mix
   ============================================= */

var EN_DATA    = null;
var enExQueue  = [];
var enExIdx    = 0;
var enMixQueue = [];
var enMixIdx   = 0;

// Precargar voces del sintetizador al arrancar
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', function() {
    window.speechSynthesis.getVoices(); // fuerza la carga
  });
}

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
    var container = document.getElementById('english-exercise-topics');
    if (!container) return;
    container.innerHTML = '';

    // Grid de 4 tarjetas principales
    var grid = document.createElement('div');
    grid.className = 'mode-grid';

    // To Be
    var toBeUnit = EN_DATA.units.find(function(u) { return u.id === 'to-be'; });
    var toBeCard = document.createElement('div');
    toBeCard.className = 'mode-card';
    toBeCard.innerHTML = '<div class="mode-emoji">🔵</div><div class="mode-name">To Be</div><div class="mode-sub">400 questions</div>';
    toBeCard.addEventListener('click', function() { go('s-english-ex-tobe'); renderExTypeMenu('to-be'); });
    grid.appendChild(toBeCard);

    // Modal Verbs
    var modalUnit = EN_DATA.units.find(function(u) { return u.id === 'modal-verbs'; });
    var modalCard = document.createElement('div');
    modalCard.className = 'mode-card';
    modalCard.innerHTML = '<div class="mode-emoji">💪</div><div class="mode-name">Modal Verbs</div><div class="mode-sub">200 questions</div>';
    modalCard.addEventListener('click', function() { go('s-english-ex-modals'); renderExTypeMenu('modal-verbs'); });
    grid.appendChild(modalCard);

    // Vocabulary
    var vocabCard = document.createElement('div');
    vocabCard.className = 'mode-card';
    vocabCard.innerHTML = '<div class="mode-emoji">🔤</div><div class="mode-name">Vocabulary</div><div class="mode-sub">Let\'s Cook &amp; Around Town</div>';
    vocabCard.addEventListener('click', function() { go('s-english-vocab-ex'); });
    grid.appendChild(vocabCard);

    // Mix
    var mixCard = document.createElement('div');
    mixCard.className = 'mode-card';
    mixCard.innerHTML = '<div class="mode-emoji">🔀</div><div class="mode-name">Mix</div><div class="mode-sub">All topics</div>';
    mixCard.addEventListener('click', function() { startEnglishMix(); });
    grid.appendChild(mixCard);

    container.appendChild(grid);
  });
}

/* ---- STUDY ---- */
function openEnglishStudyUnit(unit) {
  setEl('english-study-detail-title', unit.title);
  go('s-english-study-detail');
  // Renderizar después de que la pantalla esté activa
  setTimeout(function() { renderEnglishStudy(unit); }, 0);
}

function renderEnglishStudy(unit) {
  var container = document.getElementById('english-study-container');
  if (!container) return;
  container.innerHTML = '';

  // Estilos por badgeColor
  var colorMap = {
    info:    { bg: 'var(--color-background-info,#EFF6FF)',    border: 'var(--color-border-info,#93C5FD)',    text: 'var(--color-text-info,#1D4ED8)',    cardBorder: '#BFDBFE' },
    success: { bg: 'var(--color-background-success,#F0FDF4)', border: 'var(--color-border-success,#86EFAC)', text: 'var(--color-text-success,#15803D)',  cardBorder: '#BBF7D0' },
    warning: { bg: 'var(--color-background-warning,#FFFBEB)', border: 'var(--color-border-warning,#FCD34D)', text: 'var(--color-text-warning,#B45309)',  cardBorder: '#FDE68A' },
    danger:  { bg: 'var(--color-background-danger,#FEF2F2)',  border: 'var(--color-border-danger,#FCA5A5)',  text: 'var(--color-text-danger,#B91C1C)',   cardBorder: '#FECACA' }
  };

  unit.topics.forEach(function(topic) {
    var c = colorMap[topic.badgeColor] || colorMap.info;

    var card = document.createElement('div');
    card.className = 'study-card';
    card.style.cssText = 'margin:0 16px 10px;border-radius:16px;border:1.5px solid '+c.cardBorder+';background:white;overflow:hidden;cursor:pointer;transition:box-shadow .2s';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px';
    header.innerHTML =
      '<div style="width:36px;height:36px;border-radius:10px;background:'+c.bg+';display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
        '<i class="ti '+topic.icon+'" style="font-size:18px;color:'+c.text+'" aria-hidden="true"></i>' +
      '</div>' +
      '<div style="flex:1">' +
        '<div style="font-family:var(--f);font-weight:900;font-size:15px;color:#1E3A5F">' + topic.name + '</div>' +
        '<div style="font-size:11px;margin-top:3px">' +
          topic.keyWords.map(function(k) {
            return '<span style="background:'+c.bg+';color:'+c.text+';padding:1px 7px;border-radius:6px;font-weight:800;font-size:10px;margin-right:4px">' + k + '</span>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;background:'+c.bg+';color:'+c.text+'">' + topic.badge + '</span>' +
      '<span style="font-size:14px;color:#9CA3AF;margin-left:6px;transition:transform .2s" class="study-arrow">▼</span>';

    // Body
    var body = document.createElement('div');
    body.className = 'study-body';
    body.style.cssText = 'display:none;border-top:1px solid '+c.cardBorder;

    // Cuándo se usa
    var useBox = '<div style="margin:12px 16px;padding:10px 14px;background:'+c.bg+';border-left:3px solid '+c.border+'">' +
      '<div style="font-size:13px;font-weight:700;color:'+c.text+'">When do we use it?</div>' +
      '<div style="font-size:13px;color:'+c.text+';margin-top:2px">' + topic.when_en + '</div>' +
      '<div style="font-size:12px;color:#6B7280;margin-top:4px;font-style:italic">' + topic.when_es + '</div>' +
    '</div>';

    // Tabla conjugación
    var tableRows = '';
    // Afirmativa
    tableRows += '<div style="grid-column:1/-1;padding:6px 12px;font-size:11px;font-weight:700;color:#6B7280;background:#F9FAFB;border-bottom:0.5px solid #E5E7EB;text-transform:uppercase;letter-spacing:.5px">Affirmative</div>';
    topic.affirmative.forEach(function(row) {
      tableRows += '<div style="padding:8px 12px;font-size:13px;color:#6B7280;font-weight:600;border-right:0.5px solid #E5E7EB;border-bottom:0.5px solid #E5E7EB;background:#F9FAFB">' + row.subject + '</div>' +
        '<div style="padding:8px 12px;font-size:13px;color:#111827;border-bottom:0.5px solid #E5E7EB"><span style="font-weight:700;color:#1D4ED8">' + row.verb + '</span> ' + row.example + '</div>';
    });
    // Negativa
    tableRows += '<div style="grid-column:1/-1;padding:6px 12px;font-size:11px;font-weight:700;color:#6B7280;background:#F9FAFB;border-bottom:0.5px solid #E5E7EB;border-top:0.5px solid #E5E7EB;text-transform:uppercase;letter-spacing:.5px">Negative</div>';
    topic.negative.forEach(function(row, i) {
      var isLast = i === topic.negative.length - 1;
      tableRows += '<div style="padding:8px 12px;font-size:13px;color:#6B7280;font-weight:600;border-right:0.5px solid #E5E7EB;' + (isLast?'':'border-bottom:0.5px solid #E5E7EB;') + 'background:#F9FAFB">' + row.subject + '</div>' +
        '<div style="padding:8px 12px;font-size:13px;color:#111827;' + (isLast?'':'border-bottom:0.5px solid #E5E7EB;') + '"><span style="font-weight:700;color:#B91C1C">' + row.verb + '</span> ' + row.example + '</div>';
    });

    var table = '<div style="display:grid;grid-template-columns:1fr 1fr;margin:0 16px 12px;border:0.5px solid #E5E7EB;border-radius:12px;overflow:hidden">' + tableRows + '</div>';

    // Extra
    var extra = topic.extra ? '<div style="margin:0 16px 16px;font-size:12px;color:#6B7280;line-height:1.6">' + topic.extra + '</div>' : '';

    body.innerHTML = useBox + table + extra;

    // Toggle accordion
    var open = false;
    header.addEventListener('click', function() {
      container.querySelectorAll('.study-body').forEach(function(b) { b.style.display = 'none'; });
      container.querySelectorAll('.study-arrow').forEach(function(a) { a.style.transform = ''; });
      container.querySelectorAll('.study-card').forEach(function(c2) { c2.style.boxShadow = ''; c2.style.borderColor = c.cardBorder; });
      open = !open;
      body.style.display = open ? 'block' : 'none';
      header.querySelector('.study-arrow').style.transform = open ? 'rotate(180deg)' : '';
      card.style.boxShadow = open ? '0 4px 16px rgba(59,130,246,.15)' : '';
      card.style.borderColor = open ? c.border : c.cardBorder;
    });

    card.appendChild(header);
    card.appendChild(body);
    container.appendChild(card);
  });
}

function renderExTypeMenu(unitId) {
  loadEnglishData(function() {
    var unit = EN_DATA.units.find(function(u) { return u.id === unitId; });
    if (!unit) return;
    var gridId = unitId === 'to-be' ? 'ex-type-grid-tobe' : 'ex-type-grid-modals';
    var grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';

    var typeInfo = {
      'A': { emoji: '✏️', label: 'Complete the sentence' },
      'B': { emoji: '🔄', label: 'Make it negative' },
      'C': { emoji: '🔍', label: 'Identify the tense' },
      'D': { emoji: '💬', label: 'Choose the right form' }
    };

    var byType = {};
    unit.exercises.forEach(function(ex) {
      if (!byType[ex.type]) byType[ex.type] = [];
      byType[ex.type].push(ex);
    });

    Object.keys(byType).sort().forEach(function(type) {
      var info = typeInfo[type] || { emoji: '📝', label: 'Exercises' };
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.innerHTML =
        '<div class="mode-emoji">' + info.emoji + '</div>' +
        '<div class="mode-name">' + info.label + '</div>' +
        '<div class="mode-sub">' + byType[type].length + ' questions</div>';
      card.addEventListener('click', (function(u, t, exs) {
        return function() { startEnglishExercisesByType(u, t, exs); };
      })(unit, type, byType[type]));
      grid.appendChild(card);
    });

    // Word Order al final
    var woCard = document.createElement('div');
    woCard.className = 'mode-card';
    woCard.innerHTML = '<div class="mode-emoji">🔀</div><div class="mode-name">Word order</div><div class="mode-sub">Put words in order</div>';
    woCard.addEventListener('click', (function(u) { return function() { startWordOrder(u); }; })(unit));
    grid.appendChild(woCard);
  });
}


var woQueue   = [];
var woIdx     = 0;
var woSlots   = [];
var woBank    = [];
var woAttempt = 1;
var woChecked = false;

function extractSentences(unit) {
  var seen = {};
  var result = [];
  unit.exercises.forEach(function(ex) {
    var ans = ex.answer;
    var words = ans.split(' ');
    // Excluir frases con comas, comillas, paréntesis o apóstrofes internos
    var hasSpecial = /[,;()"']/.test(ans);
    if (words.length >= 3 && words.length <= 10 && !hasSpecial) {
      if (!seen[ans]) { seen[ans] = true; result.push(ans); }
    }
  });
  return result;
}

function shuffleArr(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function startWordOrder(unit) {
  loadEnglishData(function() {
    var sentences = extractSentences(unit);
    sentences = shuffleArr(sentences).slice(0, 15); // 15 frases por sesión
    woQueue = sentences;
    woIdx   = 0;
    setEl('en-wo-title', unit.title + ' — Word Order');
    go('s-english-wordorder');
    loadWordOrderQuestion();
  });
}

function loadWordOrderQuestion() {
  var sentence = woQueue[woIdx];
  var total    = woQueue.length;
  woAttempt    = 1;
  woChecked    = false;

  setEl('en-wo-badge', 'Question ' + (woIdx + 1) + ' of ' + total);
  setBar('en-wo-prog', Math.round(woIdx / total * 100));

  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var diffEl = document.getElementById('en-wo-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  // Crear objetos palabra con IDs únicos — reset completo
  var words = sentence.replace(/[.!?]$/, '').split(' ');
  woSlots = [];
  for (var wi = 0; wi < words.length; wi++) { woSlots.push(null); }
  woBank  = shuffleArr(words.map(function(w, i) { return { id: Date.now() + i, word: w }; }));

  document.getElementById('en-wo-fb').style.display = 'none';
  document.getElementById('en-wo-next').style.display = 'none';
  document.getElementById('en-wo-reset').style.display = '';
  document.getElementById('en-wo-check').style.display = '';

  updateSlotsBorder('#BFDBFE', 'dashed');
  renderWoSlots();
  renderWoBank();
  updateCheckBtn();
}

function renderWoSlots() {
  var el = document.getElementById('en-wo-slots');
  if (!el) return;
  el.innerHTML = '';
  woSlots.forEach(function(slot, i) {
    var btn = document.createElement('button');
    btn.style.cssText = 'min-width:48px;padding:6px 12px;border-radius:10px;font-family:var(--f);font-weight:800;font-size:15px;cursor:' + (slot && !woChecked ? 'pointer' : 'default') + ';transition:all .15s;' +
      'border:1.5px solid ' + (slot ? (woChecked ? (document.getElementById('en-wo-slots').dataset.correct === '1' ? '#22C55E' : '#EF4444') : '#3B82F6') : '#CBD5E1') + ';' +
      'background:' + (slot ? (woChecked ? (document.getElementById('en-wo-slots').dataset.correct === '1' ? '#F0FDF4' : '#FEF2F2') : 'white') : 'transparent') + ';' +
      'color:' + (slot ? (woChecked ? (document.getElementById('en-wo-slots').dataset.correct === '1' ? '#15803D' : '#B91C1C') : '#1D4ED8') : 'transparent') + ';' +
      'box-shadow:' + (slot ? '0 1px 4px rgba(0,0,0,.08)' : 'none') + ';';
    btn.textContent = slot ? slot.word : '·';
    if (slot && !woChecked) {
      (function(idx) {
        btn.addEventListener('click', function() { removeFromSlot(idx); });
      })(i);
    }
    el.appendChild(btn);
  });
}

function renderWoBank() {
  var el = document.getElementById('en-wo-bank');
  if (!el) return;
  el.innerHTML = '';
  woBank.forEach(function(wordObj) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:8px 14px;border-radius:10px;border:1.5px solid #E2E8F0;background:white;color:#1E293B;font-family:var(--f);font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.08);transition:transform .1s';
    btn.textContent = wordObj.word;
    btn.addEventListener('mousedown', function() { btn.style.transform = 'scale(.95)'; });
    btn.addEventListener('mouseup',   function() { btn.style.transform = ''; });
    (function(wo) {
      btn.addEventListener('click', function() { placeWord(wo); });
    })(wordObj);
    el.appendChild(btn);
  });
}

function placeWord(wordObj) {
  if (woChecked) return;
  var idx = woSlots.indexOf(null);
  if (idx === -1) return;
  woSlots[idx] = wordObj;
  woBank = woBank.filter(function(w) { return w.id !== wordObj.id; });
  renderWoSlots();
  renderWoBank();
  updateCheckBtn();
}

function removeFromSlot(idx) {
  if (woChecked) return;
  var word = woSlots[idx];
  if (!word) return;
  woSlots[idx] = null;
  woBank.push(word);
  renderWoSlots();
  renderWoBank();
  updateCheckBtn();
}

function resetWordOrder() {
  var sentence = woQueue[woIdx];
  var words = sentence.replace(/[.!?]$/, '').split(' ');
  woSlots = [];
  for (var ri = 0; ri < words.length; ri++) { woSlots.push(null); }
  woBank    = shuffleArr(words.map(function(w, i) { return { id: Date.now() + i, word: w }; }));
  woAttempt = 1;
  woChecked = false;
  document.getElementById('en-wo-fb').style.display = 'none';
  document.getElementById('en-wo-next').style.display = 'none';
  document.getElementById('en-wo-reset').style.display = '';
  document.getElementById('en-wo-check').style.display = '';
  document.getElementById('en-wo-slots').dataset.correct = '';
  updateSlotsBorder('#BFDBFE', 'dashed');
  renderWoSlots();
  renderWoBank();
  updateCheckBtn();
}

function updateCheckBtn() {
  var allFilled = woSlots.every(function(s) { return s !== null; });
  var btn = document.getElementById('en-wo-check');
  if (!btn) return;
  btn.style.background    = allFilled ? 'var(--blue)' : 'var(--gray-200)';
  btn.style.color         = allFilled ? 'white' : 'var(--gray-400)';
  btn.style.cursor        = allFilled ? 'pointer' : 'default';
}

function updateSlotsBorder(color, style) {
  var el = document.getElementById('en-wo-slots');
  if (el) el.style.borderColor = color;
}

function checkWordOrder() {
  if (!woSlots.every(function(s) { return s !== null; })) return;
  var sentence = woQueue[woIdx];
  var cleanSentence = sentence.replace(/[.!?]$/, '');
  var answer = woSlots.map(function(s) { return s.word; }).join(' ');
  var isCorrect = answer === cleanSentence;
  var slotsEl = document.getElementById('en-wo-slots');
  var fbEl    = document.getElementById('en-wo-fb');
  var nextBtn = document.getElementById('en-wo-next');
  var resetBtn = document.getElementById('en-wo-reset');

  if (isCorrect) {
    woChecked = true;
    slotsEl.dataset.correct = '1';
    slotsEl.style.borderStyle = 'solid';
    slotsEl.style.borderColor = '#22C55E';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct!';
    nextBtn.style.display = 'block';
    resetBtn.style.display = 'none';
    document.getElementById('en-wo-check').style.display = 'none';
    recordEnglishResult(true, woAttempt === 1);

  } else if (woAttempt === 1) {
    woAttempt = 2;
    slotsEl.style.borderColor = '#EF4444';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Not quite — try again!';
    slotsEl.style.animation = 'shake .4s ease';
    setTimeout(function() { slotsEl.style.animation = ''; }, 500);

  } else {
    woChecked = true;
    slotsEl.dataset.correct = '0';
    slotsEl.style.borderStyle = 'solid';
    slotsEl.style.borderColor = '#EF4444';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ The correct order is: <strong>' + sentence + '</strong>';
    nextBtn.style.display = 'block';
    resetBtn.style.display = 'none';
    document.getElementById('en-wo-check').style.display = 'none';
    recordEnglishResult(false, false);
  }

  renderWoSlots();
}

function nextWordOrder() {
  woIdx++;
  if (woIdx >= woQueue.length) {
    go('s-english-exercises');
    updateSubjectUI('english');
    return;
  }
  loadWordOrderQuestion();
}

/* ---- EXERCISES ---- */
function startEnglishExercisesByType(unit, type, exercises) {
  if (type === 'E') { startWordOrder(unit); return; }
  var exs = exercises.slice();
  for (var i = exs.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = exs[i]; exs[i] = exs[j]; exs[j] = tmp;
  }
  enExQueue = exs;
  enExIdx   = 0;
  var typeLabels = { 'A': 'Complete the sentence', 'B': 'Make it negative', 'C': 'Identify the tense', 'D': 'Choose the right form' };
  setEl('english-ex-title', unit.title + ' — ' + (typeLabels[type] || type));
  go('s-english-ex');
  showEnglishEx();
}

function startEnglishExercises(unit) {
  startEnglishExercisesByType(unit, 'ALL', unit.exercises);
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
    EN_DATA.units.forEach(function(u) { all = all.concat(u.exercises || []); });
    if (all.length === 0) return;
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
    e.pts += pts; e.streak++;
    ST.totalPts += pts;
  } else {
    e.streak = Math.max(0, e.streak - 1);
  }
  saveState();
  updateSubjectUI('english');
  setEl('home-pts-pill', '⭐ ' + ST.totalPts + ' pts');
}

/* =============================================
   VOCABULARY — Flashcards con flip
   ============================================= */

var VOCAB_DATA    = null;
var vocabUnit     = null;   // unidad activa
var vocabFlipped  = [];     // estado flip por tarjeta

var VOCAB_COLORS = {
  orange: { color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  blue:   { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' }
};

function loadVocabData(callback) {
  if (VOCAB_DATA) { callback(); return; }
  fetch('data/curso3/english-vocab.json')
    .then(function(r) { return r.json(); })
    .then(function(d) { VOCAB_DATA = d; callback(); })
    .catch(function(e) { console.error('Error loading english-vocab.json', e); });
}

/* ---- Menú de temas ---- */
function renderVocabMenu() {
  loadVocabData(function() {
    var grid = document.getElementById('vocab-topics-grid');
    if (!grid) return;
    grid.innerHTML = '';
    VOCAB_DATA.units.forEach(function(unit) {
      var c = VOCAB_COLORS[unit.color] || VOCAB_COLORS.blue;
      var card = document.createElement('div');
      card.style.cssText = 'background:'+c.bg+';border:1.5px solid '+c.border+';border-radius:16px;padding:18px 16px;display:flex;align-items:center;gap:14px;cursor:pointer;margin:0 16px 12px;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:box-shadow .2s';
      card.innerHTML =
        '<div style="font-size:44px">'+unit.emoji+'</div>'+
        '<div style="flex:1">'+
          '<div style="font-family:var(--f);font-weight:900;font-size:16px;color:'+c.color+'">'+unit.title+'</div>'+
          '<div style="font-size:12px;color:var(--gray-400);margin-top:3px">'+unit.words.length+' words</div>'+
        '</div>'+
        '<div style="font-size:20px;color:'+c.border+'">›</div>';
      card.addEventListener('mouseenter', function() { card.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)'; });
      card.addEventListener('mouseleave', function() { card.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'; });
      card.addEventListener('click', function() { openVocabUnit(unit); });
      grid.appendChild(card);
    });
  });
}

/* ---- Abrir unidad ---- */
function openVocabUnit(unit) {
  vocabUnit    = unit;
  vocabFlipped = unit.words.map(function() { return false; });
  var c = VOCAB_COLORS[unit.color] || VOCAB_COLORS.blue;

  // Actualizar topbar color
  var topbar = document.getElementById('vocab-unit-topbar');
  if (topbar) topbar.style.background = c.color;

  setEl('vocab-unit-title', unit.title);

  // Botón flip all
  var btn = document.getElementById('vocab-flip-all-btn');
  if (btn) {
    btn.style.background = c.bg;
    btn.style.color      = c.color;
    btn.style.borderColor = c.border;
    btn.textContent = 'Show all hints';
  }

  go('s-english-vocab-unit');
  renderVocabCards();
}

/* ---- Renderizar tarjetas ---- */
function speakWord(word, e) {
  e.stopPropagation();
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var utter = new SpeechSynthesisUtterance(word);
  utter.lang  = 'en-GB';
  utter.rate  = 0.85;
  utter.pitch = 1;

  var voices = window.speechSynthesis.getVoices();
  var preferred = [
    'Microsoft Libby',
    'Google UK English Female',
    'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria'
  ];
  var voice = null;
  for (var p = 0; p < preferred.length; p++) {
    voice = voices.find(function(v) { return v.name.includes(preferred[p]); });
    if (voice) break;
  }
  if (!voice) {
    voice = voices.find(function(v) {
      return v.lang.startsWith('en') && (
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman')
      );
    });
  }
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

function renderVocabCards() {
  var grid = document.getElementById('vocab-cards-grid');
  if (!grid || !vocabUnit) return;
  grid.innerHTML = '';
  var c = VOCAB_COLORS[vocabUnit.color] || VOCAB_COLORS.blue;

  vocabUnit.words.forEach(function(w, i) {
    var flipped = vocabFlipped[i];
    var card = document.createElement('div');
    card.style.cssText = 'cursor:pointer;perspective:600px;height:130px;position:relative';

    var inner = document.createElement('div');
    inner.style.cssText = 'position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .4s ease;transform:'+( flipped ? 'rotateY(180deg)' : 'rotateY(0deg)');

    var front = document.createElement('div');
    front.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;background:'+c.bg+';border:1.5px solid '+c.border+';border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px';
    front.innerHTML =
      '<div style="font-size:40px;line-height:1">'+w.emoji+'</div>'+
      '<div style="font-family:var(--f);font-weight:900;font-size:10px;color:'+c.color+';text-align:center;letter-spacing:.3px">'+w.word+'</div>';

    var back = document.createElement('div');
    back.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);background:'+c.color+';border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;gap:3px';
    back.innerHTML =
      '<div style="font-size:22px">'+w.emoji+'</div>'+
      '<div style="font-family:var(--f);font-weight:900;font-size:10px;color:white;text-align:center">'+w.word+'</div>'+
      '<div style="font-family:var(--f);font-weight:600;font-size:9px;color:rgba(255,255,255,.95);text-align:center;line-height:1.3">'+w.hint+'</div>'+
      '<div style="font-family:var(--f);font-weight:600;font-size:9px;color:rgba(255,255,255,.7);text-align:center;line-height:1.3;font-style:italic">'+w.es+'</div>';

    var speakBtn = document.createElement('button');
    speakBtn.textContent = '\uD83D\uDD0A';
    speakBtn.title = 'Listen to pronunciation';
    speakBtn.style.cssText = 'position:absolute;top:4px;right:4px;z-index:10;width:22px;height:22px;border-radius:50%;border:none;background:'+c.color+';color:white;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:.85;transition:opacity .15s';
    speakBtn.addEventListener('mouseenter', function() { speakBtn.style.opacity = '1'; });
    speakBtn.addEventListener('mouseleave', function() { speakBtn.style.opacity = '.85'; });
    (function(word) {
      speakBtn.addEventListener('click', function(e) { speakWord(word, e); });
    })(w.word);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    card.appendChild(speakBtn);

    (function(idx) {
      card.addEventListener('click', function() { vocabFlipCard(idx); });
    })(i);

    grid.appendChild(card);
  });
}

function vocabFlipCard(i) {
  vocabFlipped[i] = !vocabFlipped[i];
  // Actualizar botón si todas están giradas
  updateVocabFlipBtn();
  renderVocabCards();
}

function vocabToggleAll() {
  var allFlipped = vocabFlipped.every(function(v) { return v; });
  vocabFlipped = vocabFlipped.map(function() { return !allFlipped; });
  updateVocabFlipBtn();
  renderVocabCards();
}

function updateVocabFlipBtn() {
  var btn = document.getElementById('vocab-flip-all-btn');
  if (!btn) return;
  var allFlipped = vocabFlipped.every(function(v) { return v; });
  btn.textContent = allFlipped ? 'Show words' : 'Show all hints';
}

/* =============================================
   VOCABULARY EXERCISES
   ============================================= */

var vocabExQueue   = [];
var vocabExIdx     = 0;
var vocabExType    = 'word-to-image';
var vocabExAttempt = 1;
var vocabExDone    = false;
var vocabExWrong   = null; // palabra del opción incorrecta elegida

function shuffleArr2(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function startVocabExercise(type) {
  loadVocabData(function() {
    // Mezclar todas las palabras de todas las unidades
    var allWords = [];
    VOCAB_DATA.units.forEach(function(u) { allWords = allWords.concat(u.words); });
    vocabExQueue   = shuffleArr2(allWords);
    vocabExIdx     = 0;
    vocabExType    = type;
    if (type === 'word-to-image') {
      go('s-vocab-ex-w2i');
      loadW2IQuestion();
    } else {
      go('s-vocab-ex-i2w');
      loadI2WQuestion();
    }
  });
}

/* ---- WORD TO IMAGE ---- */
var vocabExCurrentOpts = []; // opciones fijas para la pregunta actual

function loadW2IQuestion() {
  var word  = vocabExQueue[vocabExIdx];
  var total = vocabExQueue.length;
  vocabExAttempt = 1;
  vocabExDone    = false;
  vocabExWrong   = null;

  setEl('w2i-badge', 'Question ' + (vocabExIdx + 1) + ' of ' + total);
  setBar('w2i-prog', Math.round(vocabExIdx / total * 100));
  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var de = document.getElementById('w2i-diff');
  if (de) { de.textContent = diff.txt; de.className = 'ex-badge ' + diff.cls; }

  setEl('w2i-word', word.word);
  document.getElementById('w2i-fb').style.display   = 'none';
  document.getElementById('w2i-next').style.display = 'none';

  // Generar opciones UNA SOLA VEZ y guardarlas
  var allWords = [];
  VOCAB_DATA.units.forEach(function(u) { allWords = allWords.concat(u.words); });
  var distractors = shuffleArr2(allWords.filter(function(w) { return w.word !== word.word; })).slice(0, 2);
  vocabExCurrentOpts = shuffleArr2([word].concat(distractors));

  renderW2IOpts(word);
}

function renderW2IOpts(word) {
  var container = document.getElementById('w2i-opts');
  container.innerHTML = '';

  vocabExCurrentOpts.forEach(function(opt) {
    var btn = document.createElement('button');
    var isWrong   = vocabExWrong === opt.word;
    var isCorrect = opt.word === word.word;

    var border = '#E5E7EB';
    var bg     = 'white';
    var opacity = '1';

    if (vocabExDone) {
      if (isCorrect)           { border = '#22C55E'; bg = '#F0FDF4'; }
      else if (isWrong)        { border = '#EF4444'; bg = '#FEF2F2'; }
    } else if (vocabExWrong) {
      // Primer fallo mostrado: solo marcar el incorrecto, NO el correcto
      if (isWrong)  { border = '#EF4444'; bg = '#FEF2F2'; opacity = '0.5'; }
    }

    btn.style.cssText = 'padding:16px 8px;border-radius:14px;border:2px solid '+border+';background:'+bg+';cursor:'+(vocabExDone || isWrong ? 'default' : 'pointer')+';display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .15s;opacity:'+opacity;
    btn.innerHTML = '<span style="font-size:44px">'+opt.emoji+'</span>';
    btn.disabled = vocabExDone || isWrong;

    if (!btn.disabled) {
      (function(o) {
        btn.addEventListener('click', function() { pickW2I(o, word); });
      })(opt);
    }
    container.appendChild(btn);
  });
}

function pickW2I(opt, word) {
  if (vocabExDone) return;
  var isCorrect = opt.word === word.word;
  var fbEl   = document.getElementById('w2i-fb');
  var nextBtn = document.getElementById('w2i-next');

  if (isCorrect) {
    vocabExDone = true;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct!';
    nextBtn.style.display = 'block';
    renderW2IOpts(word);
    recordEnglishResult(true, vocabExAttempt === 1);
  } else if (vocabExAttempt === 1) {
    vocabExAttempt = 2;
    vocabExWrong   = opt.word;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Not quite — try again!';
    renderW2IOpts(word);
  } else {
    vocabExDone  = true;
    vocabExWrong = opt.word;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ The answer is: ' + word.emoji + ' ' + word.word;
    nextBtn.style.display = 'block';
    renderW2IOpts(word);
    recordEnglishResult(false, false);
  }
}

/* ---- IMAGE TO WORD ---- */
function loadI2WQuestion() {
  var word  = vocabExQueue[vocabExIdx];
  var total = vocabExQueue.length;
  vocabExAttempt = 1;
  vocabExDone    = false;

  setEl('i2w-badge', 'Question ' + (vocabExIdx + 1) + ' of ' + total);
  setBar('i2w-prog', Math.round(vocabExIdx / total * 100));
  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var de = document.getElementById('i2w-diff');
  if (de) { de.textContent = diff.txt; de.className = 'ex-badge ' + diff.cls; }

  setEl('i2w-emoji', word.emoji);
  document.getElementById('i2w-fb').style.display    = 'none';
  document.getElementById('i2w-next').style.display  = 'none';
  document.getElementById('i2w-check').style.display = '';

  var inp = document.getElementById('i2w-input');
  inp.value = '';
  inp.disabled = false;
  inp.style.borderColor = 'var(--gray-200)';
  inp.style.background  = 'white';
  inp.style.color       = 'var(--gray-800)';
  inp.oninput = function() {
    this.value = this.value.toUpperCase();
    updateI2WCheckBtn();
  };
  updateI2WCheckBtn();
}

function updateI2WCheckBtn() {
  var inp = document.getElementById('i2w-input');
  var btn = document.getElementById('i2w-check');
  if (!inp || !btn) return;
  var filled = inp.value.trim().length > 0;
  btn.style.background = filled ? 'var(--blue)' : 'var(--gray-200)';
  btn.style.color      = filled ? 'white' : 'var(--gray-400)';
  btn.style.cursor     = filled ? 'pointer' : 'default';
}

// Escuchar cambios en el input para activar el botón

function checkVocabI2W() {
  var word  = vocabExQueue[vocabExIdx];
  var inp   = document.getElementById('i2w-input');
  var fbEl  = document.getElementById('i2w-fb');
  var nextBtn = document.getElementById('i2w-next');
  var checkBtn = document.getElementById('i2w-check');

  if (!inp.value.trim()) return;
  var isCorrect = inp.value.trim().toUpperCase() === word.word.toUpperCase();

  if (isCorrect) {
    vocabExDone = true;
    inp.style.borderColor = '#22C55E';
    inp.style.background  = '#F0FDF4';
    inp.style.color       = '#15803D';
    inp.disabled = true;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct!';
    nextBtn.style.display  = 'block';
    checkBtn.style.display = 'none';
    recordEnglishResult(true, vocabExAttempt === 1);

  } else if (vocabExAttempt === 1) {
    vocabExAttempt = 2;
    inp.style.borderColor = '#EF4444';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Not quite — try again!';
    // Shake y borrar
    inp.style.animation = 'shake .4s ease';
    setTimeout(function() {
      inp.style.animation   = '';
      inp.style.borderColor = '#FED7AA';
      inp.value = '';
      updateI2WCheckBtn();
    }, 420);

  } else {
    vocabExDone = true;
    inp.value = word.word;
    inp.style.borderColor = '#EF4444';
    inp.style.background  = '#FEF2F2';
    inp.style.color       = '#B91C1C';
    inp.disabled = true;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ The correct word is: ' + word.word;
    nextBtn.style.display  = 'block';
    checkBtn.style.display = 'none';
    recordEnglishResult(false, false);
  }
}

function nextVocabEx(mode) {
  vocabExIdx++;
  if (vocabExIdx >= vocabExQueue.length) {
    go('s-english-vocab-ex');
    updateSubjectUI('english');
    return;
  }
  if (mode === 'w2i') loadW2IQuestion();
  else loadI2WQuestion();
}
