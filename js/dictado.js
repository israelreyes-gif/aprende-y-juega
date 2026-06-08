/* =============================================
   DICTADO.JS — Dictado gramatical
   Frases del campo "ejemplo" de ejercicios-gram.json
   2 escuchas gratuitas por intento, +1 pt por escucha extra
   10 pts (1er intento) / 5 pts (2º intento)
   ============================================= */

var DICT_DATA    = null;
var dictQueue    = [];
var dictIdx      = 0;
var dictAttempt  = 1;    // 1 o 2
var dictListens  = 0;    // escuchas en este intento
var dictExtra    = 0;    // escuchas extra acumuladas (penalización)
var dictDone     = false;
var dictSpeaking = false;

function loadDictData(callback) {
  if (DICT_DATA) { callback(); return; }
  fetch('data/curso' + cursoActual + '/ejercicios-gram.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      // Extraer todas las frases de todos los grupos (campo "ejemplo")
      var frases = [];
      Object.keys(data).forEach(function(regla) {
        data[regla].forEach(function(item) {
          if (item.definicion && item.definicion.ejemplo) {
            // Limpiar comillas y el hueco (_) para obtener la frase completa con la palabra correcta
            var ejemplo = item.definicion.ejemplo
              .replace(/^"|"$/g, '')   // quitar comillas externas
              .replace(/\\"/g, '')      // quitar comillas escapadas
              .replace(/^'|'$/g, '');  // quitar comillas simples
            frases.push({ frase: ejemplo, regla: reglaLabel(regla) });
          }
        });
      });
      DICT_DATA = frases;
      callback();
    })
    .catch(function(e) { console.warn('Error cargando dictado:', e); });
}

function reglaLabel(key) {
  var labels = { bv:'B/V', gj:'G/J', czq:'C/Z/Q', lly:'LL/Y', rr:'R/RR' };
  return labels[key] || key.toUpperCase();
}

function shuffleDict(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function normalizeFrase(str) {
  return str.trim().toLowerCase()
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[.,;:!?¡¿"'()]/g, '').replace(/\s+/g, ' ').trim();
}

function initDictado() {
  loadDictData(function() {
    dictQueue   = shuffleDict(DICT_DATA);
    dictIdx     = 0;
    go('s-dictado');
    loadDictQuestion();
  });
}

function loadDictQuestion() {
  var item  = dictQueue[dictIdx];
  var total = dictQueue.length;
  dictAttempt = 1;
  dictListens = 0;
  dictExtra   = 0;
  dictDone    = false;

  setEl('dict-badge', 'Dictado ' + (dictIdx + 1) + ' de ' + total);
  setEl('dict-regla', item.regla);
  setBar('dict-prog', Math.round(dictIdx / total * 100));

  // Reset UI
  var inp = document.getElementById('dict-input');
  if (inp) { inp.value = ''; inp.disabled = false; inp.style.borderColor = 'var(--gray-200)'; inp.style.background = 'white'; }
  document.getElementById('dict-fb').style.display = 'none';
  document.getElementById('dict-frase-correcta').style.display = 'none';
  document.getElementById('dict-warning').style.display = 'none';
  document.getElementById('dict-next').style.display = 'none';
  document.getElementById('dict-check-btn').style.display = '';
  dictUpdateCheck();
  dictUpdateDots();
  dictUpdatePtsPreview();

  // Resetear botón escuchar
  var btn = document.getElementById('dict-speak-btn');
  if (btn) { btn.innerHTML = '🔊'; btn.style.background = 'white'; btn.style.borderColor = '#FBCFE8'; }
  setEl('dict-speak-lbl', 'Pulsa para escuchar');
}

function dictSpeak() {
  if (!window.speechSynthesis || dictDone) return;
  window.speechSynthesis.cancel();

  dictListens++;
  // A partir de la 3ª escucha: penalización
  if (dictListens > 2) {
    dictExtra++;
    var w = document.getElementById('dict-warning');
    if (w) { w.style.display = 'block'; setTimeout(function() { w.style.display = 'none'; }, 2500); }
  }
  dictUpdateDots();
  dictUpdatePtsPreview();

  var item = dictQueue[dictIdx];
  var u = new SpeechSynthesisUtterance(item.frase);
  u.lang  = 'es-ES';
  u.rate  = 0.82;
  u.pitch = 1;

  var btn = document.getElementById('dict-speak-btn');
  dictSpeaking = true;
  if (btn) { btn.innerHTML = '⏸'; btn.style.background = '#EC4899'; btn.style.borderColor = '#DB2777'; }
  setEl('dict-speak-lbl', 'Escuchando...');

  u.onend = function() {
    dictSpeaking = false;
    if (btn) { btn.innerHTML = '🔊'; btn.style.background = 'white'; btn.style.borderColor = '#FBCFE8'; }
    setEl('dict-speak-lbl', 'Pulsa para escuchar de nuevo');
  };
  u.onerror = function() {
    dictSpeaking = false;
    if (btn) { btn.innerHTML = '🔊'; btn.style.background = 'white'; }
  };
  window.speechSynthesis.speak(u);
}

function dictUpdateDots() {
  var d1 = document.getElementById('dict-dot-1');
  var d2 = document.getElementById('dict-dot-2');
  var el = document.getElementById('dict-extra-lbl');
  if (d1) d1.style.background = dictListens >= 1 ? '#EC4899' : '#FBCFE8';
  if (d2) d2.style.background = dictListens >= 2 ? '#EC4899' : '#FBCFE8';
  if (el) {
    if (dictExtra > 0) {
      el.style.display = 'inline';
      el.textContent = '−' + dictExtra + ' pt' + (dictExtra > 1 ? 's' : '');
    } else {
      el.style.display = 'none';
    }
  }
}

function dictUpdatePtsPreview() {
  var base = dictAttempt === 1 ? 10 : 5;
  var current = Math.max(0, base - dictExtra);
  var el = document.getElementById('dict-pts-preview');
  if (!el || dictDone) return;
  el.style.color = current >= base ? '#16A34A' : '#EF4444';
  el.textContent = 'Si aciertas ahora: +' + current + ' pts' +
    (current < base ? ' (−' + (base - current) + ' por escuchas extra)' : '');
}

function dictUpdateCheck() {
  var inp = document.getElementById('dict-input');
  var btn = document.getElementById('dict-check-btn');
  if (!inp || !btn) return;
  var filled = inp.value.trim().length > 0;
  btn.disabled = !filled;
  btn.style.background = filled ? 'var(--pink)' : 'var(--gray-200)';
  btn.style.color = filled ? 'white' : 'var(--gray-400)';
  btn.style.cursor = filled ? 'pointer' : 'default';
}

function dictCheck() {
  if (dictDone) return;
  var inp = document.getElementById('dict-input');
  if (!inp || !inp.value.trim()) return;

  var item = dictQueue[dictIdx];
  var isCorrect = normalizeFrase(inp.value) === normalizeFrase(item.frase);
  var base = dictAttempt === 1 ? 10 : 5;
  var earned = Math.max(0, base - dictExtra);

  var fbEl = document.getElementById('dict-fb');

  if (isCorrect) {
    dictDone = true;
    inp.disabled = true;
    inp.style.borderColor = '#22C55E';
    inp.style.background = '#F0FDF4';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    fbEl.textContent = '✅ ¡Correcto! +' + earned + ' pts' +
      (earned < base ? ' (−' + (base - earned) + ' por escuchas extra)' : ' 🎉');
    document.getElementById('dict-pts-preview').style.display = 'none';
    document.getElementById('dict-check-btn').style.display = 'none';
    document.getElementById('dict-next').style.display = 'block';

    // Registrar resultado
    recordResult('lengua', 'dict', true);
    awardPts(earned, 'lengua');
    updateSubjectUI('lengua');

  } else if (dictAttempt === 1) {
    // Pasar a 2º intento — NO borrar el input
    dictAttempt = 2;
    dictListens = 0;
    dictExtra   = 0;
    dictUpdateDots();
    dictUpdatePtsPreview();
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Hay algún error — revísalo y corrígelo tú misma';
    inp.style.borderColor = '#F97316';

  } else {
    // 2º fallo
    dictDone = true;
    inp.disabled = true;
    inp.style.borderColor = '#EF4444';
    inp.style.background = '#FEF2F2';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ No es correcto';
    setEl('dict-frase-txt', item.frase);
    document.getElementById('dict-frase-correcta').style.display = 'block';
    document.getElementById('dict-pts-preview').style.display = 'none';
    document.getElementById('dict-check-btn').style.display = 'none';
    document.getElementById('dict-next').style.display = 'block';

    recordResult('lengua', 'dict', false);
    updateSubjectUI('lengua');
  }
}

function dictNext() {
  dictIdx++;
  if (dictIdx >= dictQueue.length) {
    go('s-lengua');
    updateSubjectUI('lengua');
    return;
  }
  loadDictQuestion();
}
