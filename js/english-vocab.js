/* =============================================
   ENGLISH-VOCAB.JS — Flashcards + Ejercicios W2I/I2W
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
    .catch(function(e) { showError('el Vocabulario', e, function(){ loadVocabData(function(){}); }, 's-english'); });
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
