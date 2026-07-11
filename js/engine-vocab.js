/* =============================================
   ENGINE-VOCAB.JS — Motor genérico para
   ejercicios de vocabulario imagen↔palabra.

   Soporta dos modos:
   - 'word-to-image' (W2I): muestra la palabra, elige la imagen
   - 'image-to-word' (I2W): muestra la imagen, escribe la palabra

   config = {
     queue:        array de palabras { word, emoji, hint, es }
     idx:          índice actual
     subjectKey:   clave en ST (ej. 'english')
     exerciseKey:  clave para errors (ej. 'english-vocab')
     ptsFirst:     puntos primer intento (def. 10)
     ptsSecond:    puntos segundo intento (def. 5)
     getAllWords:   fn() → array de todas las palabras (para distractores)
     setIdx:       fn(newIdx) para actualizar índice externo
     onFinish:     fn() al acabar la cola
     onAdvance:    fn(mode) al avanzar al siguiente
     onCorrect:    fn(firstAttempt) — hook post-acierto (opcional)
     onWrong:      fn() — hook post-fallo final, 2º intento (opcional)
   }
   ============================================= */

var _vocabState = {};

function vocabExInit(config, mode) {
  _vocabState = {
    config:    config,
    mode:      mode,
    attempt:   1,
    done:      false,
    wrong:     null,
    opts:      []
  };
  _vocabLoad();
}

function _vocabShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}


/* ---- Prefijo de IDs: usa config.prefix si se especifica (p.ej. Vacaciones),
   si no cae al valor por defecto según el modo (w2i/i2w) ---- */
function _vocabPrefix() {
  var config = _vocabState.config;
  return (config && config.prefix) || (_vocabState.mode === 'word-to-image' ? 'w2i' : 'i2w');
}

function _vocabLoad() {
  var config = _vocabState.config;
  var word   = config.queue[config.idx];
  var total  = config.queue.length;
  var mode   = _vocabState.mode;

  _vocabState.attempt = 1;
  _vocabState.done    = false;
  _vocabState.wrong   = null;

  var prefix = _vocabPrefix();

  engineUpdateBadge(prefix, config, config.idx, total);

  document.getElementById(prefix + '-fb').style.display   = 'none';
  document.getElementById(prefix + '-next').style.display = 'none';

  if (mode === 'word-to-image') {
    setEl(prefix + '-word', word.word);
    // Generar opciones una sola vez
    var allWords = config.getAllWords();
    var distractors = _vocabShuffle(allWords.filter(function(w){ return w.word !== word.word; })).slice(0, 2);
    _vocabState.opts = _vocabShuffle([word].concat(distractors));
    _vocabRenderW2I(word);
  } else {
    setEl(prefix + '-emoji', word.emoji);
    var checkBtnEl = document.getElementById(prefix + '-check'); if (checkBtnEl) checkBtnEl.style.display = '';
    var inp = document.getElementById(prefix + '-input');
    if (!inp) return;
    inp.value = ''; inp.disabled = false;
    inp.style.borderColor = 'var(--gray-200)';
    inp.style.background  = 'white';
    inp.style.color       = 'var(--gray-800)';
    inp.oninput = function() {
      this.value = this.value.toUpperCase();
      _vocabUpdateI2WBtn();
    };
    _vocabUpdateI2WBtn();
  }
}

/* ---- W2I: renderizar opciones de imagen ---- */
function _vocabRenderW2I(word) {
  var container = document.getElementById(_vocabPrefix() + '-opts');
  if (!container) return;
  container.innerHTML = '';
  var s = _vocabState;

  s.opts.forEach(function(opt) {
    var btn = document.createElement('button');
    var isWrong   = s.wrong === opt.word;
    var isCorrect = opt.word === word.word;
    var border = '#E5E7EB', bg = 'white', opacity = '1';

    if (s.done) {
      if (isCorrect)    { border = '#22C55E'; bg = '#F0FDF4'; }
      else if (isWrong) { border = '#EF4444'; bg = '#FEF2F2'; }
    } else if (s.wrong) {
      if (isWrong) { border = '#EF4444'; bg = '#FEF2F2'; opacity = '0.5'; }
    }

    btn.style.cssText = 'padding:16px 8px;border-radius:14px;border:2px solid '+border+';background:'+bg+';cursor:'+(s.done||isWrong?'default':'pointer')+';display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .15s;opacity:'+opacity;
    btn.innerHTML = '<span style="font-size:44px">'+opt.emoji+'</span>';
    btn.disabled = s.done || isWrong;
    if (!btn.disabled) {
      (function(o){ btn.addEventListener('click', function(){ vocabPickW2I(o); }); })(opt);
    }
    container.appendChild(btn);
  });
}

/* ---- W2I: elegir imagen ---- */
function vocabPickW2I(opt) {
  var s      = _vocabState;
  if (s.done) return;
  var config = s.config;
  var word   = config.queue[config.idx];
  var isCorrect = opt.word === word.word;
  var vp = _vocabPrefix();
  var fbEl  = document.getElementById(vp + '-fb');
  var nextEl = document.getElementById(vp + '-next');
  var ptsFirst  = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond = config.ptsSecond !== undefined ? config.ptsSecond : 5;

  if (isCorrect) {
    s.done = true;
    fbEl.style.display = 'block'; fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct! +' + (s.attempt === 1 ? ptsFirst : ptsSecond) + ' pts 🎉';
    nextEl.style.display = 'block';
    _vocabRenderW2I(word);
    engineSaveProgress(config, true, s.attempt === 1);
    if (config.onCorrect) config.onCorrect(s.attempt === 1);
  } else if (s.attempt === 1) {
    s.attempt = 2; s.wrong = opt.word;
    fbEl.style.display = 'block'; fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Not quite — try again!';
    _vocabRenderW2I(word);
  } else {
    s.done = true; s.wrong = opt.word;
    fbEl.style.display = 'block'; fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ The answer is: ' + word.emoji + ' ' + word.word;
    nextEl.style.display = 'block';
    _vocabRenderW2I(word);
    engineSaveProgress(config, false, false);
    if (config.onWrong) config.onWrong();
  }
}

/* ---- I2W: botón comprobar ---- */
function _vocabUpdateI2WBtn() {
  var vp = _vocabPrefix();
  var inp = document.getElementById(vp + '-input');
  var btn = document.getElementById(vp + '-check');
  if (!inp || !btn) return;
  var filled = inp.value.trim().length > 0;
  btn.style.background = filled ? 'var(--blue)' : 'var(--gray-200)';
  btn.style.color      = filled ? 'white' : 'var(--gray-400)';
  btn.style.cursor     = filled ? 'pointer' : 'default';
}

/* ---- I2W: comprobar respuesta ---- */
function vocabCheckI2W() {
  var s    = _vocabState;
  if (s.done) return;
  var config = s.config;
  var word   = config.queue[config.idx];
  var vp = _vocabPrefix();
  var inp    = document.getElementById(vp + '-input');
  var fbEl   = document.getElementById(vp + '-fb');
  var nextEl = document.getElementById(vp + '-next');
  var checkEl = document.getElementById(vp + '-check');
  var ptsFirst  = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond = config.ptsSecond !== undefined ? config.ptsSecond : 5;

  if (!inp.value.trim()) return;
  var isCorrect = inp.value.trim().toUpperCase() === word.word.toUpperCase();

  if (isCorrect) {
    s.done = true;
    inp.style.borderColor = '#22C55E'; inp.style.background = '#F0FDF4'; inp.style.color = '#15803D'; inp.disabled = true;
    fbEl.style.display = 'block'; fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct! +' + (s.attempt === 1 ? ptsFirst : ptsSecond) + ' pts 🎉';
    nextEl.style.display = 'block'; checkEl.style.display = 'none';
    engineSaveProgress(config, true, s.attempt === 1);
    if (config.onCorrect) config.onCorrect(s.attempt === 1);
  } else if (s.attempt === 1) {
    s.attempt = 2;
    inp.style.borderColor = '#EF4444';
    fbEl.style.display = 'block'; fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Not quite — try again!';
    inp.style.animation = 'shake .4s ease';
    setTimeout(function() {
      inp.style.animation = ''; inp.style.borderColor = '#FED7AA'; inp.value = ''; _vocabUpdateI2WBtn();
    }, 420);
  } else {
    s.done = true;
    inp.value = word.word; inp.style.borderColor = '#EF4444'; inp.style.background = '#FEF2F2'; inp.style.color = '#B91C1C'; inp.disabled = true;
    fbEl.style.display = 'block'; fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ The correct word is: ' + word.word;
    nextEl.style.display = 'block'; checkEl.style.display = 'none';
    engineSaveProgress(config, false, false);
    if (config.onWrong) config.onWrong();
  }
}

/* ---- Siguiente ejercicio ---- */
function vocabExNext(mode) {
  var config = _vocabState.config;
  var newIdx = config.idx + 1;
  if (config.setIdx) config.setIdx(newIdx);
  if (newIdx >= config.queue.length) {
    if (config.onFinish) config.onFinish();
    return;
  }
  if (config.onAdvance) config.onAdvance(mode);
}
