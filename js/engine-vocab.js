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
   VOCABULARY EXERCISES — usa engine-vocab.js
   ============================================= */

function _vocabGetAllWords() {
  var all = [];
  SubjectData.vocab.units.forEach(function(u){ all = all.concat(u.words); });
  return all;
}

function _vocabBaseConfig() {
  return {
    queue:       EN.vocabExQueue,
    idx:         EN.vocabExIdx,
    subjectKey:  'english',
    exerciseKey: 'english-vocab',
    ptsFirst:    10,
    ptsSecond:   5,
    getAllWords:  _vocabGetAllWords,
    setIdx:      function(v){ EN.vocabExIdx = v; },
    onFinish:    function(){ go('s-english-vocab-ex'); },
    onAdvance:   function(mode){
      if (mode === 'word-to-image' || mode === 'w2i') loadW2IQuestion();
      else loadI2WQuestion();
    }
  };
}

function startVocabExercise(type) {
  loadVocabData(function() {
    var allWords = _vocabGetAllWords();
    EN.vocabExQueue = (function(a){ var b=a.slice(); for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;} return b; })(allWords);
    EN.vocabExIdx  = 0;
    EN.vocabExType = type;
    if (type === 'word-to-image') { go('s-vocab-ex-w2i'); loadW2IQuestion(); }
    else { go('s-vocab-ex-i2w'); loadI2WQuestion(); }
  });
}

function loadW2IQuestion() {
  vocabExInit(_vocabBaseConfig(), 'word-to-image');
}

function loadI2WQuestion() {
  vocabExInit(_vocabBaseConfig(), 'image-to-word');
}

function pickW2I(opt) { vocabPickW2I(opt); }
function checkVocabI2W() { vocabCheckI2W(); }
function nextVocabEx(mode) { vocabExNext(mode); }
