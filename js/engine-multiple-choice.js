/* =============================================
   ENGINE-MULTIPLE-CHOICE.JS — Motor genérico
   para ejercicios de opción múltiple con 2 intentos.

   Cualquier asignatura puede usar este motor
   pasando una configuración (config) con:

   - queue:        array de ejercicios { question, options, answer, ... }
   - idx:          índice actual (number)
   - prefix:       prefijo de los IDs en el HTML (ej. 'sc-ex')
   - subjectKey:   clave en ST (ej. 'sciences')
   - ptsFirst:     puntos en primer intento (def. 10)
   - ptsSecond:    puntos en segundo intento (def. 5)
   - onFinish:     función a llamar cuando se acaba la cola
   - getExplanation(ex): función opcional que devuelve
                    una explicación HTML para el 2º fallo
   - badgeLabel:   texto del badge de progreso (ej. 'Question')
   ============================================= */

function mcShowQuestion(config) {
  var ex = config.queue[config.idx];
  if (!ex) return;
  var total = config.queue.length;
  var p = config.prefix;

  setEl(p + '-badge', (config.badgeLabel || 'Question') + ' ' + (config.idx + 1) + ' of ' + total);
  setBar(p + '-prog', Math.round(config.idx / total * 100));

  var streak = (ST[config.subjectKey] && ST[config.subjectKey].streak) || 0;
  var diff = diffLabel(streak);
  var diffEl = document.getElementById(p + '-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }

  document.getElementById(p + '-question').textContent = ex.question;
  document.getElementById(p + '-fb').style.display = 'none';
  document.getElementById(p + '-next').style.display = 'none';

  mcRenderOpts(config, ex, 1);
}

function mcRenderOpts(config, ex, attempt) {
  var p = config.prefix;
  var opts = document.getElementById(p + '-opts');
  opts.innerHTML = '';
  ex.options.slice().sort(function() { return Math.random() - .5; }).forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'wopt-btn';
    btn.textContent = opt;
    btn.addEventListener('click', function() { mcCheckAnswer(config, opt, ex, attempt); });
    opts.appendChild(btn);
  });
}

function mcCheckAnswer(config, selected, ex, attempt) {
  var p = config.prefix;
  var correct   = ex.answer;
  var isCorrect = selected === correct;
  var fbEl      = document.getElementById(p + '-fb');
  var opts      = document.getElementById(p + '-opts');
  var nextBtn   = document.getElementById(p + '-next');
  var ptsFirst  = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond = config.ptsSecond !== undefined ? config.ptsSecond : 5;

  if (isCorrect) {
    Array.from(opts.children).forEach(function(btn) {
      btn.disabled = true;
      if (btn.textContent === correct) btn.className = 'wopt-btn wok';
    });
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ Correct! +' + (attempt === 1 ? ptsFirst : ptsSecond) + ' pts 🎉';
    nextBtn.style.display = 'block';
    mcRecordResult(config, true, attempt === 1);

  } else if (attempt === 1) {
    Array.from(opts.children).forEach(function(btn) {
      if (btn.textContent === selected) btn.className = 'wopt-btn wbad';
    });
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Try again!';
    Array.from(opts.children).forEach(function(btn) {
      if (btn.textContent !== selected) {
        btn.disabled = false;
        var newBtn = btn.cloneNode(true);
        newBtn.addEventListener('click', function() { mcCheckAnswer(config, newBtn.textContent, ex, 2); });
        btn.parentNode.replaceChild(newBtn, btn);
      } else {
        btn.disabled = true;
      }
    });

  } else {
    Array.from(opts.children).forEach(function(btn) {
      btn.disabled = true;
      if (btn.textContent === correct) btn.className = 'wopt-btn wok';
      else if (btn.textContent === selected) btn.className = 'wopt-btn wbad';
    });
    var explanation = config.getExplanation ? config.getExplanation(ex) : '';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ The answer is <strong>' + correct + '</strong>' +
      (explanation ? '<div style="margin-top:8px;font-size:12px;font-weight:600;opacity:.85;line-height:1.5">' + explanation + '</div>' : '');
    nextBtn.style.display = 'block';
    mcRecordResult(config, false, false);
  }
}

function mcRecordResult(config, correct, firstAttempt) {
  var key       = config.subjectKey;
  var exKey     = config.exerciseKey || key;
  var ptsFirst  = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond = config.ptsSecond !== undefined ? config.ptsSecond : 5;

  recordResult(key, exKey, correct);
  if (correct) {
    awardPts(firstAttempt ? ptsFirst : ptsSecond, key);
  }
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
