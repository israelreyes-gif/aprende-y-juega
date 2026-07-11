/* =============================================
   ENGINE-WORD-ORDER.JS — Motor genérico para
   ejercicios de ordenar palabras.

   config = {
     queue:        array de frases (strings)
     idx:          índice actual
     prefix:       prefijo de IDs en el HTML (ej. 'en-wo')
     subjectKey:   clave en ST (ej. 'english')
     exerciseKey:  clave para errors (ej. 'english-tobe')
     ptsFirst:     puntos primer intento (def. 10)
     ptsSecond:    puntos segundo intento (def. 5)
     badgeLabel:   texto del badge (def. 'Question')
     setIdx:       fn(newIdx) para actualizar índice externo
     onFinish:     fn() al acabar la cola
     onAdvance:    fn() al avanzar al siguiente
     onCorrect:    fn(firstAttempt) — hook post-acierto (opcional)
     onWrong:      fn() — hook post-fallo final, 2º intento (opcional)

     cleanSentence: fn(sentence) → string sin puntuación
                    Opcional. Por defecto elimina .!? del final.
   }
   ============================================= */

/* ---- Estado interno del motor ---- */
var _woState = {};

function woStart(config) {
  _woState = {
    config:    config,
    attempt:   1,
    checked:   false,
    slots:     [],
    bank:      []
  };
  _woLoad();
}

function _woClean(sentence, config) {
  if (config.cleanSentence) return config.cleanSentence(sentence);
  return sentence.replace(/[.!?]$/, '');
}

function _woShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function _woLoad() {
  var config   = _woState.config;
  var sentence = config.queue[config.idx];
  var total    = config.queue.length;
  var p        = config.prefix;

  _woState.attempt = 1;
  _woState.checked = false;

  engineUpdateBadge(p, config, config.idx, total);

  var words = _woClean(sentence, config).split(' ');
  _woState.slots = words.map(function(){ return null; });
  _woState.bank  = _woShuffle(words.map(function(w, i){ return { id: Date.now() + i, word: w }; }));

  var fbEl   = document.getElementById(p + '-fb');
  var nextEl = document.getElementById(p + '-next');
  var resetEl = document.getElementById(p + '-reset');
  var checkEl = document.getElementById(p + '-check');
  var slotsEl = document.getElementById(p + '-slots');

  if (fbEl)   fbEl.style.display   = 'none';
  if (nextEl) nextEl.style.display = 'none';
  if (resetEl) resetEl.style.display = '';
  if (checkEl) checkEl.style.display = '';
  if (slotsEl) { slotsEl.dataset.correct = ''; slotsEl.style.borderColor = '#BFDBFE'; slotsEl.style.borderStyle = 'dashed'; }

  woRenderSlots();
  woRenderBank();
  _woUpdateCheckBtn();
}

function woRenderSlots() {
  var config  = _woState.config;
  var p       = config.prefix;
  var slotsEl = document.getElementById(p + '-slots');
  if (!slotsEl) return;
  var correct = slotsEl.dataset.correct;
  slotsEl.innerHTML = '';

  _woState.slots.forEach(function(slot, i) {
    var btn = document.createElement('button');
    var isCorrect = correct === '1';
    var isWrong   = correct === '0';
    btn.style.cssText =
      'min-width:48px;padding:6px 12px;border-radius:10px;font-family:var(--f);font-weight:800;font-size:15px;' +
      'cursor:' + (slot && !_woState.checked ? 'pointer' : 'default') + ';transition:all .15s;' +
      'border:1.5px solid ' + (slot ? (_woState.checked ? (isCorrect ? '#22C55E' : '#EF4444') : '#3B82F6') : '#CBD5E1') + ';' +
      'background:' + (slot ? (_woState.checked ? (isCorrect ? '#F0FDF4' : '#FEF2F2') : 'white') : 'transparent') + ';' +
      'color:' + (slot ? (_woState.checked ? (isCorrect ? '#15803D' : '#B91C1C') : '#1D4ED8') : 'transparent') + ';' +
      'box-shadow:' + (slot ? '0 1px 4px rgba(0,0,0,.08)' : 'none') + ';';
    btn.textContent = slot ? slot.word : '·';
    if (slot && !_woState.checked) {
      (function(idx) {
        btn.addEventListener('click', function() { woRemoveFromSlot(idx); });
      })(i);
    }
    slotsEl.appendChild(btn);
  });
}

function woRenderBank() {
  var el = document.getElementById(_woState.config.prefix + '-bank');
  if (!el) return;
  el.innerHTML = '';
  _woState.bank.forEach(function(wordObj) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:8px 14px;border-radius:10px;border:1.5px solid #E2E8F0;background:white;color:#1E293B;font-family:var(--f);font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.08);transition:transform .1s';
    btn.textContent = wordObj.word;
    btn.addEventListener('mousedown', function() { btn.style.transform = 'scale(.95)'; });
    btn.addEventListener('mouseup',   function() { btn.style.transform = ''; });
    (function(wo) {
      btn.addEventListener('click', function() { woPlaceWord(wo); });
    })(wordObj);
    el.appendChild(btn);
  });
}

function woPlaceWord(wordObj) {
  if (_woState.checked) return;
  var idx = _woState.slots.indexOf(null);
  if (idx === -1) return;
  _woState.slots[idx] = wordObj;
  _woState.bank = _woState.bank.filter(function(w) { return w.id !== wordObj.id; });
  woRenderSlots();
  woRenderBank();
  _woUpdateCheckBtn();
}

function woRemoveFromSlot(idx) {
  if (_woState.checked) return;
  var word = _woState.slots[idx];
  if (!word) return;
  _woState.slots[idx] = null;
  _woState.bank.push(word);
  woRenderSlots();
  woRenderBank();
  _woUpdateCheckBtn();
}

function woReset() {
  var config   = _woState.config;
  var sentence = config.queue[config.idx];
  var words    = _woClean(sentence, config).split(' ');
  _woState.slots   = words.map(function(){ return null; });
  _woState.bank    = _woShuffle(words.map(function(w, i){ return { id: Date.now() + i, word: w }; }));
  _woState.attempt = 1;
  _woState.checked = false;

  var p = config.prefix;
  var fbEl   = document.getElementById(p + '-fb');
  var nextEl = document.getElementById(p + '-next');
  var resetEl = document.getElementById(p + '-reset');
  var checkEl = document.getElementById(p + '-check');
  var slotsEl = document.getElementById(p + '-slots');

  if (fbEl)   fbEl.style.display   = 'none';
  if (nextEl) nextEl.style.display = 'none';
  if (resetEl) resetEl.style.display = '';
  if (checkEl) checkEl.style.display = '';
  if (slotsEl) { slotsEl.dataset.correct = ''; slotsEl.style.borderColor = '#BFDBFE'; slotsEl.style.borderStyle = 'dashed'; }

  woRenderSlots();
  woRenderBank();
  _woUpdateCheckBtn();
}

function woCheck() {
  var config   = _woState.config;
  if (!_woState.slots.every(function(s){ return s !== null; })) return;

  var sentence      = config.queue[config.idx];
  var cleanSentence = _woClean(sentence, config);
  var answer        = _woState.slots.map(function(s){ return s.word; }).join(' ');
  var isCorrect     = answer === cleanSentence;
  var p             = config.prefix;
  var slotsEl       = document.getElementById(p + '-slots');
  var fbEl          = document.getElementById(p + '-fb');
  var nextEl        = document.getElementById(p + '-next');
  var resetEl       = document.getElementById(p + '-reset');
  var checkEl       = document.getElementById(p + '-check');
  var ptsFirst      = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond     = config.ptsSecond !== undefined ? config.ptsSecond : 5;

  if (isCorrect) {
    _woState.checked = true;
    if (slotsEl) { slotsEl.dataset.correct = '1'; slotsEl.style.borderStyle = 'solid'; slotsEl.style.borderColor = '#22C55E'; }
    if (fbEl)    { fbEl.style.display = 'block'; fbEl.className = 'feedback fb-ok'; fbEl.textContent = '✅ Correct! +' + (_woState.attempt === 1 ? ptsFirst : ptsSecond) + ' pts 🎉'; }
    if (nextEl)  nextEl.style.display = 'block';
    if (resetEl) resetEl.style.display = 'none';
    if (checkEl) checkEl.style.display = 'none';
    engineSaveProgress(config, true, _woState.attempt === 1);
    if (config.onCorrect) config.onCorrect(_woState.attempt === 1);

  } else if (_woState.attempt === 1) {
    _woState.attempt = 2;
    if (slotsEl) { slotsEl.style.borderColor = '#EF4444'; slotsEl.style.animation = 'shake .4s ease'; setTimeout(function(){ slotsEl.style.animation = ''; }, 500); }
    if (fbEl)    { fbEl.style.display = 'block'; fbEl.className = 'feedback fb-err'; fbEl.textContent = '❌ Not quite — try again!'; }

  } else {
    _woState.checked = true;
    if (slotsEl) { slotsEl.dataset.correct = '0'; slotsEl.style.borderStyle = 'solid'; slotsEl.style.borderColor = '#EF4444'; }
    if (fbEl)    { fbEl.style.display = 'block'; fbEl.className = 'feedback fb-err'; fbEl.innerHTML = '❌ The correct order is: <strong>' + sentence + '</strong>'; }
    if (nextEl)  nextEl.style.display = 'block';
    if (resetEl) resetEl.style.display = 'none';
    if (checkEl) checkEl.style.display = 'none';
    engineSaveProgress(config, false, false);
    if (config.onWrong) config.onWrong();
  }

  woRenderSlots();
}

function woNext() {
  var config = _woState.config;
  var newIdx = config.idx + 1;
  if (config.setIdx) config.setIdx(newIdx);
  if (newIdx >= config.queue.length) {
    if (config.onFinish) config.onFinish();
    return;
  }
  if (config.onAdvance) config.onAdvance();
}

function _woUpdateCheckBtn() {
  var btn = document.getElementById(_woState.config.prefix + '-check');
  if (!btn) return;
  var allFilled = _woState.slots.every(function(s){ return s !== null; });
  btn.style.background = allFilled ? 'var(--blue)' : 'var(--gray-200)';
  btn.style.color      = allFilled ? 'white' : 'var(--gray-400)';
  btn.style.cursor     = allFilled ? 'pointer' : 'default';
}
