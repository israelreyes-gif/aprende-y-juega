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

    var typeInfo = {
      'A': { emoji: '✏️', label: 'Complete the sentence' },
      'B': { emoji: '🔄', label: 'Make it negative' },
      'C': { emoji: '🔍', label: 'Identify the tense' },
      'D': { emoji: '💬', label: 'Choose the right form' },
      'E': { emoji: '🔀', label: 'Word order' }
    };

    EN_DATA.units.forEach(function(unit) {
      if (!unit.exercises || unit.exercises.length === 0) return;

      // Bloque contenedor de la unidad
      var block = document.createElement('div');
      block.style.cssText = 'margin:0 16px 20px;border-radius:16px;border:1.5px solid #E5E7EB;overflow:hidden;background:white';

      // Cabecera de la unidad
      var unitHeader = document.createElement('div');
      unitHeader.style.cssText = 'padding:12px 16px;background:#EFF6FF;border-bottom:1px solid #BFDBFE;display:flex;align-items:center;gap:8px';
      unitHeader.innerHTML =
        '<span style="font-size:20px">' + unit.emoji + '</span>' +
        '<span style="font-family:var(--f);font-size:13px;font-weight:900;color:#1D4ED8;text-transform:uppercase;letter-spacing:.5px">' + unit.title + '</span>';
      block.appendChild(unitHeader);

      // Grid de tipos
      var typeGrid = document.createElement('div');
      typeGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;';

      // Agrupar por tipo
      var byType = {};
      unit.exercises.forEach(function(ex) {
        if (!byType[ex.type]) byType[ex.type] = [];
        byType[ex.type].push(ex);
      });

      var types = Object.keys(byType).sort();
      types.forEach(function(type, idx) {
        var info = typeInfo[type] || { emoji: '📝', label: 'Exercises' };
        var isLastRow = idx >= types.length - (types.length % 2 === 0 ? 2 : 1);
        var isRight = idx % 2 === 1;

        var cell = document.createElement('div');
        cell.style.cssText = 'padding:16px;cursor:pointer;transition:background .15s;' +
          'border-right:' + (isRight ? 'none' : '0.5px solid #E5E7EB') + ';' +
          'border-bottom:' + (isLastRow ? 'none' : '0.5px solid #E5E7EB') + ';';

        cell.innerHTML =
          '<div style="font-size:26px;margin-bottom:8px">' + info.emoji + '</div>' +
          '<div style="font-family:var(--f);font-weight:800;font-size:14px;color:#111827">' + info.label + '</div>' +
          '<div style="font-size:12px;color:#6B7280;margin-top:3px">' + byType[type].length + ' questions</div>';

        cell.addEventListener('mouseenter', function() { cell.style.background = '#F9FAFB'; });
        cell.addEventListener('mouseleave', function() { cell.style.background = ''; });
        cell.addEventListener('click', (function(u, t, exs) {
          return function() { startEnglishExercisesByType(u, t, exs); };
        })(unit, type, byType[type]));

        typeGrid.appendChild(cell);
      });

      // Word Order: izquierda + celda vacía con fondo gris a la derecha
      var woCell = document.createElement('div');
      woCell.style.cssText = 'padding:16px;cursor:pointer;transition:background .15s;border-top:0.5px solid #E5E7EB;border-right:0.5px solid #E5E7EB;';
      woCell.innerHTML =
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div style="font-size:26px">🔀</div>' +
          '<div>' +
            '<div style="font-family:var(--f);font-weight:800;font-size:14px;color:#111827">Word order</div>' +
            '<div style="font-size:12px;color:#6B7280;margin-top:2px">Put words in order</div>' +
          '</div>' +
        '</div>';
      woCell.addEventListener('mouseenter', function() { woCell.style.background = '#F9FAFB'; });
      woCell.addEventListener('mouseleave', function() { woCell.style.background = ''; });
      woCell.addEventListener('click', (function(u) {
        return function() { startWordOrder(u); };
      })(unit));
      typeGrid.appendChild(woCell);

      // Celda vacía del lado derecho con fondo gris
      var emptyCell = document.createElement('div');
      emptyCell.style.cssText = 'background:#F9FAFB;border-top:0.5px solid #E5E7EB;';
      typeGrid.appendChild(emptyCell);

      block.appendChild(typeGrid);
      grid.appendChild(block);
    });
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

/* ---- WORD ORDER ---- */
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
