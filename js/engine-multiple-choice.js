/* =============================================
   ENGINE-MULTIPLE-CHOICE.JS — Motor genérico
   para ejercicios de opción múltiple con 2 intentos.

   config = {
     queue:           array de ejercicios
     idx:             índice actual
     prefix:          prefijo de IDs en el HTML (ej. 'sc-ex')
     subjectKey:      clave en ST (ej. 'sciences')
     exerciseKey:     clave para errors (ej. 'sciences-invertebrates')
     ptsFirst:        puntos primer intento (def. 10)
     ptsSecond:       puntos segundo intento (def. 5)
     badgeLabel:      texto del badge (def. 'Question')
     getExplanation:  fn(ex) → string HTML para 2º fallo
     setIdx:          fn(newIdx) para actualizar el índice externo
     onFinish:        fn() al acabar la cola
     onAdvance:       fn() al avanzar al siguiente

     renderOpts:      fn(container, ex, attempt, onAnswer)
                      Opcional. Si se pasa, el motor delega el
                      rendering de opciones. onAnswer(selected)
                      debe llamarse cuando el usuario elige.
                      Si no se pasa, usa botones de texto por defecto.

     renderQuestion:  fn(qEl, ex)
                      Opcional. Renderizado personalizado de la pregunta.
                      Si no se pasa, usa ex.question o ex.pregunta.

     correctMsg:      fn(pts, attempt, ex) → string HTML
                      Opcional. Mensaje de acierto personalizado.

     tryAgainMsg:     string. Mensaje de primer fallo (def. '❌ No es correcto...')

     showDefinition:  fn(ex). Opcional. Se llama al mostrar la pregunta
                      para renderizar ayudas/definiciones adicionales.

     onCorrect:       fn(selected, ex, attempt). Hook post-acierto.
     onWrong:         fn(selected, ex, attempt). Hook post-fallo.
   }
   ============================================= */

function mcShowQuestion(config) {
  var ex = config.queue[config.idx];
  if (!ex) return;
  var total = config.queue.length;
  var p = config.prefix;

  engineUpdateBadge(p, config, config.idx, total);

  var qEl = document.getElementById(p + '-question');
  if (qEl) {
    if (config.renderQuestion) {
      config.renderQuestion(qEl, ex);
    } else {
      qEl.textContent = ex.question || ex.pregunta || '';
    }
  }

  var fbEl = document.getElementById(p + '-fb');
  var nextEl = document.getElementById(p + '-next');
  if (fbEl) fbEl.style.display = 'none';
  if (nextEl) nextEl.style.display = 'none';

  _mcRenderOpts(config, ex, 1);
}

function _mcRenderOpts(config, ex, attempt) {
  var p = config.prefix;
  var optsEl = document.getElementById(p + '-opts');

  if (config.renderOpts) {
    // Rendering personalizado — la asignatura dibuja sus botones
    // y llama a onAnswer(selected) cuando el usuario elige
    if (optsEl) optsEl.innerHTML = '';
    config.renderOpts(optsEl, ex, attempt, function(selected) {
      _mcHandleAnswer(config, selected, ex, attempt, optsEl);
    });
  } else {
    // Rendering por defecto — botones de texto
    if (!optsEl) return;
    optsEl.innerHTML = '';
    ex.options.slice().sort(function() { return Math.random() - .5; }).forEach(function(opt) {
      var btn = document.createElement('button');
      btn.className = 'wopt-btn';
      btn.textContent = opt;
      btn.addEventListener('click', function() {
        _mcHandleAnswer(config, opt, ex, attempt, optsEl);
      });
      optsEl.appendChild(btn);
    });
  }
}

function _mcHandleAnswer(config, selected, ex, attempt, optsEl) {
  var p        = config.prefix;
  var correct  = ex.answer !== undefined ? ex.answer : ex.respuesta;
  var isCorrect = selected === correct;
  var fbEl     = document.getElementById(p + '-fb');
  var nextEl   = document.getElementById(p + '-next');
  var ptsFirst  = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond = config.ptsSecond !== undefined ? config.ptsSecond : 5;

  if (isCorrect) {
    // Marcar opciones (solo en rendering por defecto)
    if (!config.renderOpts && optsEl) {
      Array.from(optsEl.children).forEach(function(btn) {
        btn.disabled = true;
        if (btn.textContent === correct) btn.className = 'wopt-btn wok';
      });
    }
    // Marcar correcto con renderizado personalizado si lo implementa
    if (config.onCorrect) config.onCorrect(selected, ex, attempt);

    if (fbEl) {
      fbEl.style.display = 'block';
      fbEl.className = 'feedback fb-ok';
      var pts = attempt === 1 ? ptsFirst : ptsSecond;
      var explanation = config.getExplanation ? config.getExplanation(ex) : '';
      var msg = config.correctMsg ? config.correctMsg(pts, attempt, ex)
        : '✅ ' + (attempt === 1 ? '¡Correcto! +' + pts + ' pts 🎉' : '¡Bien, en el segundo intento! +' + pts + ' pts');
      fbEl.innerHTML = msg + (explanation ? '<div style="font-size:12px;margin-top:6px;opacity:.8">' + explanation + '</div>' : '');
    }
    if (nextEl) nextEl.style.display = 'block';
    mcRecordResult(config, true, attempt === 1);

  } else if (attempt === 1) {
    // Marcar incorrecto y preparar segundo intento
    if (!config.renderOpts && optsEl) {
      Array.from(optsEl.children).forEach(function(btn) {
        if (btn.textContent === selected) btn.className = 'wopt-btn wbad';
      });
      Array.from(optsEl.children).forEach(function(btn) {
        if (btn.textContent !== selected) {
          btn.disabled = false;
          var newBtn = btn.cloneNode(true);
          newBtn.addEventListener('click', function() {
            _mcHandleAnswer(config, newBtn.textContent, ex, 2, optsEl);
          });
          btn.parentNode.replaceChild(newBtn, btn);
        } else {
          btn.disabled = true;
        }
      });
    }
    if (config.onWrong) config.onWrong(selected, ex, 1);

    if (fbEl) {
      fbEl.style.display = 'block';
      fbEl.className = 'feedback fb-err';
      fbEl.textContent = config.tryAgainMsg || '❌ No es correcto — inténtalo de nuevo';
    }
    // Re-renderizar opciones para segundo intento si hay renderOpts personalizado
    if (config.renderOpts && optsEl) {
      setTimeout(function() {
        _mcRenderOpts(config, ex, 2);
      }, 100);
    }

  } else {
    // Segundo fallo
    if (!config.renderOpts && optsEl) {
      Array.from(optsEl.children).forEach(function(btn) {
        btn.disabled = true;
        if (btn.textContent === correct) btn.className = 'wopt-btn wok';
        else if (btn.textContent === selected) btn.className = 'wopt-btn wbad';
      });
    }
    if (config.onWrong) config.onWrong(selected, ex, 2);

    var explanation = config.getExplanation ? config.getExplanation(ex) : '';
    if (fbEl) {
      fbEl.style.display = 'block';
      fbEl.className = 'feedback fb-err';
      fbEl.innerHTML = '❌ La respuesta correcta es: <strong>' + correct + '</strong>' +
        (explanation ? '<div style="margin-top:8px;font-size:12px;font-weight:600;opacity:.85;line-height:1.5">' + explanation + '</div>' : '');
    }
    if (nextEl) nextEl.style.display = 'block';
    mcRecordResult(config, false, false);
  }
}

function mcRecordResult(config, correct, firstAttempt) {
  engineSaveProgress(config, correct, firstAttempt);
}

function mcNext(config) {
  var newIdx = config.idx + 1;
  if (config.setIdx) config.setIdx(newIdx);
  if (newIdx >= config.queue.length) {
    if (config.onFinish) config.onFinish();
    return;
  }
  if (config.onAdvance) config.onAdvance(newIdx);
}

/* ---- Compatibilidad con llamadas antiguas (Sciences) ---- */
function mcCheckAnswer(config, selected, ex, attempt) {
  var optsEl = document.getElementById(config.prefix + '-opts');
  _mcHandleAnswer(config, selected, ex, attempt, optsEl);
}
