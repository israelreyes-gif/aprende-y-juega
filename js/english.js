/* =============================================
   ENGLISH.JS — Study, Exercises & Mix
   ============================================= */

var EN = ExerciseState.english; /* alias */

// Precargar voces del sintetizador al arrancar
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener('voiceschanged', function() {
    window.speechSynthesis.getVoices(); // fuerza la carga
  });
}

function loadEnglishData(callback) {
  if (SubjectData.english) { callback(); return; }
  fetch('data/curso' + cursoActual + '/english.json')
    .then(function(r) { return r.json(); })
    .then(function(d) { SubjectData.english = d; callback(); })
    .catch(function(e) { console.error('Error loading english.json', e); });
}

/* ---- Renderizar menús dinámicos ---- */
function renderEnglishStudyMenu() {
  loadEnglishData(function() {
    var grid = document.getElementById('english-study-topics');
    if (!grid) return;
    grid.innerHTML = '';
    SubjectData.english.units.forEach(function(unit) {
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
    var toBeUnit = SubjectData.english.units.find(function(u) { return u.id === 'to-be'; });
    var toBeCard = document.createElement('div');
    toBeCard.className = 'mode-card';
    toBeCard.innerHTML = '<div class="mode-emoji">🔵</div><div class="mode-name">To Be</div><div class="mode-sub">400 questions</div>';
    toBeCard.addEventListener('click', function() { go('s-english-ex-tobe'); renderExTypeMenu('to-be'); });
    grid.appendChild(toBeCard);

    // Modal Verbs
    var modalUnit = SubjectData.english.units.find(function(u) { return u.id === 'modal-verbs'; });
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
    var unit = SubjectData.english.units.find(function(u) { return u.id === unitId; });
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
  EN.exArea = unit.id === 'modal-verbs' ? 'modals' : 'tobe';
  loadEnglishData(function() {
    var sentences = extractSentences(unit);
    sentences = shuffleArr(sentences).slice(0, 15); // 15 frases por sesión
    EN.woQueue = sentences;
    EN.woIdx   = 0;
    setEl('en-wo-title', unit.title + ' — Word Order');
    go('s-english-wordorder');
    loadWordOrderQuestion();
  });
}

function loadWordOrderQuestion() {
  var sentence = EN.woQueue[EN.woIdx];
  var total    = EN.woQueue.length;
  EN.woAttempt    = 1;
  EN.woChecked    = false;

  setEl('en-wo-badge', 'Question ' + (EN.woIdx + 1) + ' of ' + total);
  setBar('en-wo-prog', Math.round(EN.woIdx / total * 100));

  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var diffEl = document.getElementById('en-wo-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  // Crear objetos palabra con IDs únicos — reset completo
  var words = sentence.replace(/[.!?]$/, '').split(' ');
  EN.woSlots = [];
  for (var wi = 0; wi < words.length; wi++) { EN.woSlots.push(null); }
  EN.woBank  = shuffleArr(words.map(function(w, i) { return { id: Date.now() + i, word: w }; }));

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
  EN.woSlots.forEach(function(slot, i) {
    var btn = document.createElement('button');
    btn.style.cssText = 'min-width:48px;padding:6px 12px;border-radius:10px;font-family:var(--f);font-weight:800;font-size:15px;cursor:' + (slot && !EN.woChecked ? 'pointer' : 'default') + ';transition:all .15s;' +
      'border:1.5px solid ' + (slot ? (EN.woChecked ? (document.getElementById('en-wo-slots').dataset.correct === '1' ? '#22C55E' : '#EF4444') : '#3B82F6') : '#CBD5E1') + ';' +
      'background:' + (slot ? (EN.woChecked ? (document.getElementById('en-wo-slots').dataset.correct === '1' ? '#F0FDF4' : '#FEF2F2') : 'white') : 'transparent') + ';' +
      'color:' + (slot ? (EN.woChecked ? (document.getElementById('en-wo-slots').dataset.correct === '1' ? '#15803D' : '#B91C1C') : '#1D4ED8') : 'transparent') + ';' +
      'box-shadow:' + (slot ? '0 1px 4px rgba(0,0,0,.08)' : 'none') + ';';
    btn.textContent = slot ? slot.word : '·';
    if (slot && !EN.woChecked) {
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
  EN.woBank.forEach(function(wordObj) {
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
  if (EN.woChecked) return;
  var idx = EN.woSlots.indexOf(null);
  if (idx === -1) return;
  EN.woSlots[idx] = wordObj;
  EN.woBank = EN.woBank.filter(function(w) { return w.id !== wordObj.id; });
  renderWoSlots();
  renderWoBank();
  updateCheckBtn();
}

function removeFromSlot(idx) {
  if (EN.woChecked) return;
  var word = EN.woSlots[idx];
  if (!word) return;
  EN.woSlots[idx] = null;
  EN.woBank.push(word);
  renderWoSlots();
  renderWoBank();
  updateCheckBtn();
}

function resetWordOrder() {
  var sentence = EN.woQueue[EN.woIdx];
  var words = sentence.replace(/[.!?]$/, '').split(' ');
  EN.woSlots = [];
  for (var ri = 0; ri < words.length; ri++) { EN.woSlots.push(null); }
  EN.woBank    = shuffleArr(words.map(function(w, i) { return { id: Date.now() + i, word: w }; }));
  EN.woAttempt = 1;
  EN.woChecked = false;
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
  var allFilled = EN.woSlots.every(function(s) { return s !== null; });
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
  if (!EN.woSlots.every(function(s) { return s !== null; })) return;
  var sentence = EN.woQueue[EN.woIdx];
  var cleanSentence = sentence.replace(/[.!?]$/, '');
  var answer = EN.woSlots.map(function(s) { return s.word; }).join(' ');
  var isCorrect = answer === cleanSentence;
  var slotsEl = document.getElementById('en-wo-slots');
  var fbEl    = document.getElementById('en-wo-fb');
  var nextBtn = document.getElementById('en-wo-next');
  var resetBtn = document.getElementById('en-wo-reset');

  if (isCorrect) {
    EN.woChecked = true;
    slotsEl.dataset.correct = '1';
    slotsEl.style.borderStyle = 'solid';
    slotsEl.style.borderColor = '#22C55E';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct! +' + (EN.woAttempt === 1 ? 10 : 5) + ' pts 🎉';
    nextBtn.style.display = 'block';
    resetBtn.style.display = 'none';
    document.getElementById('en-wo-check').style.display = 'none';
    recordEnglishResult(true, EN.woAttempt === 1, EN.exArea);

  } else if (EN.woAttempt === 1) {
    EN.woAttempt = 2;
    slotsEl.style.borderColor = '#EF4444';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Not quite — try again!';
    slotsEl.style.animation = 'shake .4s ease';
    setTimeout(function() { slotsEl.style.animation = ''; }, 500);

  } else {
    EN.woChecked = true;
    slotsEl.dataset.correct = '0';
    slotsEl.style.borderStyle = 'solid';
    slotsEl.style.borderColor = '#EF4444';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ The correct order is: <strong>' + sentence + '</strong>';
    nextBtn.style.display = 'block';
    resetBtn.style.display = 'none';
    document.getElementById('en-wo-check').style.display = 'none';
    recordEnglishResult(false, false, EN.exArea);
  }

  renderWoSlots();
}

function nextWordOrder() {
  EN.woIdx++;
  if (EN.woIdx >= EN.woQueue.length) {
    go('s-english-exercises');
    updateSubjectUI('english');
    return;
  }
  loadWordOrderQuestion();
}

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

/* =============================================
   VOCABULARY — Flashcards con flip
   ============================================= */


var VOCAB_COLORS = {
  orange: { color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  blue:   { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' }
};

function loadVocabData(callback) {
  if (SubjectData.vocab) { callback(); return; }
  fetch('data/curso' + cursoActual + '/english-vocab.json')
    .then(function(r) { return r.json(); })
    .then(function(d) { SubjectData.vocab = d; callback(); })
    .catch(function(e) { console.error('Error loading english-vocab.json', e); });
}

/* ---- Menú de temas ---- */
function renderVocabMenu() {
  loadVocabData(function() {
    var grid = document.getElementById('vocab-topics-grid');
    if (!grid) return;
    grid.innerHTML = '';
    SubjectData.vocab.units.forEach(function(unit) {
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
  EN.vocabUnit    = unit;
  EN.vocabFlipped = unit.words.map(function() { return false; });
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
  if (!grid || !EN.vocabUnit) return;
  grid.innerHTML = '';
  var c = VOCAB_COLORS[EN.vocabUnit.color] || VOCAB_COLORS.blue;

  EN.vocabUnit.words.forEach(function(w, i) {
    var flipped = EN.vocabFlipped[i];
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
  EN.vocabFlipped[i] = !EN.vocabFlipped[i];
  // Actualizar botón si todas están giradas
  updateVocabFlipBtn();
  renderVocabCards();
}

function vocabToggleAll() {
  var allFlipped = EN.vocabFlipped.every(function(v) { return v; });
  EN.vocabFlipped = EN.vocabFlipped.map(function() { return !allFlipped; });
  updateVocabFlipBtn();
  renderVocabCards();
}

function updateVocabFlipBtn() {
  var btn = document.getElementById('vocab-flip-all-btn');
  if (!btn) return;
  var allFlipped = EN.vocabFlipped.every(function(v) { return v; });
  btn.textContent = allFlipped ? 'Show words' : 'Show all hints';
}

/* =============================================
   VOCABULARY EXERCISES
   ============================================= */


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
    SubjectData.vocab.units.forEach(function(u) { allWords = allWords.concat(u.words); });
    EN.vocabExQueue   = shuffleArr2(allWords);
    EN.vocabExIdx     = 0;
    EN.vocabExType    = type;
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

function loadW2IQuestion() {
  var word  = EN.vocabExQueue[EN.vocabExIdx];
  var total = EN.vocabExQueue.length;
  EN.vocabExAttempt = 1;
  EN.vocabExDone    = false;
  EN.vocabExWrong   = null;

  setEl('w2i-badge', 'Question ' + (EN.vocabExIdx + 1) + ' of ' + total);
  setBar('w2i-prog', Math.round(EN.vocabExIdx / total * 100));
  var diff = diffLabel(ST.english ? ST.english.streak || 0 : 0);
  var de = document.getElementById('w2i-diff');
  if (de) { de.textContent = diff.txt; de.className = 'ex-badge ' + diff.cls; }

  setEl('w2i-word', word.word);
  document.getElementById('w2i-fb').style.display   = 'none';
  document.getElementById('w2i-next').style.display = 'none';

  // Generar opciones UNA SOLA VEZ y guardarlas
  var allWords = [];
  SubjectData.vocab.units.forEach(function(u) { allWords = allWords.concat(u.words); });
  var distractors = shuffleArr2(allWords.filter(function(w) { return w.word !== word.word; })).slice(0, 2);
  EN.vocabExCurrentOpts = shuffleArr2([word].concat(distractors));

  renderW2IOpts(word);
}

function renderW2IOpts(word) {
  var container = document.getElementById('w2i-opts');
  container.innerHTML = '';

  EN.vocabExCurrentOpts.forEach(function(opt) {
    var btn = document.createElement('button');
    var isWrong   = EN.vocabExWrong === opt.word;
    var isCorrect = opt.word === word.word;

    var border = '#E5E7EB';
    var bg     = 'white';
    var opacity = '1';

    if (EN.vocabExDone) {
      if (isCorrect)           { border = '#22C55E'; bg = '#F0FDF4'; }
      else if (isWrong)        { border = '#EF4444'; bg = '#FEF2F2'; }
    } else if (EN.vocabExWrong) {
      // Primer fallo mostrado: solo marcar el incorrecto, NO el correcto
      if (isWrong)  { border = '#EF4444'; bg = '#FEF2F2'; opacity = '0.5'; }
    }

    btn.style.cssText = 'padding:16px 8px;border-radius:14px;border:2px solid '+border+';background:'+bg+';cursor:'+(EN.vocabExDone || isWrong ? 'default' : 'pointer')+';display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .15s;opacity:'+opacity;
    btn.innerHTML = '<span style="font-size:44px">'+opt.emoji+'</span>';
    btn.disabled = EN.vocabExDone || isWrong;

    if (!btn.disabled) {
      (function(o) {
        btn.addEventListener('click', function() { pickW2I(o, word); });
      })(opt);
    }
    container.appendChild(btn);
  });
}

function pickW2I(opt, word) {
  if (EN.vocabExDone) return;
  var isCorrect = opt.word === word.word;
  var fbEl   = document.getElementById('w2i-fb');
  var nextBtn = document.getElementById('w2i-next');

  if (isCorrect) {
    EN.vocabExDone = true;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct! +' + (EN.vocabExAttempt === 1 ? 10 : 5) + ' pts 🎉';
    nextBtn.style.display = 'block';
    renderW2IOpts(word);
    recordEnglishResult(true, EN.vocabExAttempt === 1, 'vocab');
  } else if (EN.vocabExAttempt === 1) {
    EN.vocabExAttempt = 2;
    EN.vocabExWrong   = opt.word;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Not quite — try again!';
    renderW2IOpts(word);
  } else {
    EN.vocabExDone  = true;
    EN.vocabExWrong = opt.word;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ The answer is: ' + word.emoji + ' ' + word.word;
    nextBtn.style.display = 'block';
    renderW2IOpts(word);
    recordEnglishResult(false, false, 'vocab');
  }
}

/* ---- IMAGE TO WORD ---- */
function loadI2WQuestion() {
  var word  = EN.vocabExQueue[EN.vocabExIdx];
  var total = EN.vocabExQueue.length;
  EN.vocabExAttempt = 1;
  EN.vocabExDone    = false;

  setEl('i2w-badge', 'Question ' + (EN.vocabExIdx + 1) + ' of ' + total);
  setBar('i2w-prog', Math.round(EN.vocabExIdx / total * 100));
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
  var word  = EN.vocabExQueue[EN.vocabExIdx];
  var inp   = document.getElementById('i2w-input');
  var fbEl  = document.getElementById('i2w-fb');
  var nextBtn = document.getElementById('i2w-next');
  var checkBtn = document.getElementById('i2w-check');

  if (!inp.value.trim()) return;
  var isCorrect = inp.value.trim().toUpperCase() === word.word.toUpperCase();

  if (isCorrect) {
    EN.vocabExDone = true;
    inp.style.borderColor = '#22C55E';
    inp.style.background  = '#F0FDF4';
    inp.style.color       = '#15803D';
    inp.disabled = true;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct! +' + (EN.vocabExAttempt === 1 ? 10 : 5) + ' pts 🎉';
    nextBtn.style.display  = 'block';
    checkBtn.style.display = 'none';
    recordEnglishResult(true, EN.vocabExAttempt === 1, 'vocab');

  } else if (EN.vocabExAttempt === 1) {
    EN.vocabExAttempt = 2;
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
    EN.vocabExDone = true;
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
    recordEnglishResult(false, false, 'vocab');
  }
}

function nextVocabEx(mode) {
  EN.vocabExIdx++;
  if (EN.vocabExIdx >= EN.vocabExQueue.length) {
    go('s-english-vocab-ex');
    updateSubjectUI('english');
    return;
  }
  if (mode === 'w2i') loadW2IQuestion();
  else loadI2WQuestion();
}
