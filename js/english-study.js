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
