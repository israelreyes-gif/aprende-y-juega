/* =============================================
   COMPRENSION.JS — Historias dinámicas desde JSON
   - Botón "Siguiente" explícito (no automático)
   - Segundo fallo muestra respuestas correctas bajo cada pregunta fallida
   ============================================= */

var HISTORIAS_DB = { facil: [], medio: [], avanzado: [] };
var historiaIdx  = { facil: 0, medio: 0, avanzado: 0 };
var currentHistoria = null;

fetch('data/curso' + cursoActual + '/historias.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    HISTORIAS_DB = data;
    Object.keys(HISTORIAS_DB).forEach(function(k) {
      HISTORIAS_DB[k] = shuffleArr(HISTORIAS_DB[k]);
    });
  })
  .catch(function(e) { console.warn('No se cargó historias.json:', e); });

function shuffleArr(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function compDiff() { return diffLabel(ST.compStreak); }

/* ---- Cargar nueva historia ---- */
function cargarNuevaHistoria() {
  var dl    = compDiff();
  var nivel = dl.txt === 'Fácil' ? 'facil' : dl.txt === 'Medio' ? 'medio' : 'avanzado';
  var banco = HISTORIAS_DB[nivel];

  if (!banco || banco.length === 0) {
    currentHistoria = {
      titulo: 'La tortuga y las estrellas', emoji: '📖',
      texto: 'Había una vez una tortuga llamada Luna que vivía cerca de un lago azul. Soñaba con volar hasta las estrellas. Un día, una cigüeña llamada Viento la ayudó a llegar muy alto y Luna pudo tocar una estrella brillante. Desde ese día, nunca se sintió pequeña.',
      preguntas: [
        {pregunta:'¿Cómo se llama la tortuga?', keywords:['luna','tortuga'], ok:'✓ La tortuga se llama Luna.', bad:'✗ La tortuga se llama Luna.'},
        {pregunta:'¿Dónde vivía?', keywords:['lago','azul'], ok:'✓ Vivía cerca de un lago azul.', bad:'✗ Vivía cerca de un lago azul.'},
        {pregunta:'¿Cuál era su sueño?', keywords:['volar','estrellas'], ok:'✓ Soñaba con volar.', bad:'✗ Soñaba con volar hasta las estrellas.'},
        {pregunta:'¿Quién la ayudó?', keywords:['viento','cigüeña'], ok:'✓ La cigüeña Viento.', bad:'✗ La ayudó la cigüeña Viento.'},
        {pregunta:'¿Cómo se sintió al final?', keywords:['pequeña','feliz'], ok:'✓ Dejó de sentirse pequeña.', bad:'✗ Dejó de sentirse pequeña.'}
      ]
    };
  } else {
    if (historiaIdx[nivel] >= banco.length) {
      HISTORIAS_DB[nivel] = shuffleArr(banco);
      historiaIdx[nivel] = 0;
    }
    currentHistoria = banco[historiaIdx[nivel]];
    historiaIdx[nivel]++;
  }

  var storyCard = document.querySelector('.story-card');
  if (storyCard) {
    storyCard.querySelector('.story-title').textContent =
      (currentHistoria.emoji || '📖') + ' ' + currentHistoria.titulo;
    storyCard.querySelector('.story-body').textContent = currentHistoria.texto;
  }

  for (var i = 0; i < 5; i++) {
    var qblock = document.querySelectorAll('.q-block')[i];
    if (qblock && currentHistoria.preguntas[i]) {
      qblock.querySelector('.q-text').textContent = currentHistoria.preguntas[i].pregunta;
      // Limpiar respuesta correcta del intento anterior
      var correctBox = qblock.querySelector('.q-correct-box');
      if (correctBox) correctBox.style.display = 'none';
    }
    var ta = document.getElementById('q' + (i+1)); if (ta) ta.value = '';
    var qr = document.getElementById('qr' + (i+1));
    if (qr) { qr.className = 'q-res'; qr.style.display = 'none'; qr.textContent = ''; }
    // Limpiar cajas de respuesta correcta de historias anteriores
    document.querySelectorAll('.q-correct-box').forEach(function(b) { b.style.display = 'none'; });
  }

  var diffEl = document.getElementById('comp-diff');
  if (diffEl) { diffEl.className = 'ex-badge ' + dl.cls; diffEl.textContent = dl.txt; }

  var submitBtn = document.getElementById('comp-submit');
  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Enviar todas las respuestas ✓'; }

  var loading = document.getElementById('comp-loading'); if (loading) loading.style.display = 'none';
  var result  = document.getElementById('comp-result');  if (result)  result.style.display  = 'none';
  var ortho   = document.getElementById('comp-ortho');   if (ortho)   ortho.style.display   = 'none';
}

/* ---- Mostrar respuestas correctas bajo cada pregunta fallida ---- */
function mostrarRespuestasCorrectas() {
  for (var i = 0; i < 5; i++) {
    var qr = document.getElementById('qr' + (i+1));
    if (!qr || qr.className.indexOf('bad') === -1) continue; // solo las fallidas

    var q = currentHistoria.preguntas[i];
    var qblock = document.querySelectorAll('.q-block')[i];
    if (!qblock) continue;

    // Crear o actualizar caja de respuesta correcta
    var correctBox = qblock.querySelector('.q-correct-box');
    if (!correctBox) {
      correctBox = document.createElement('div');
      correctBox.className = 'q-correct-box';
      correctBox.style.cssText = 'margin-top:6px;background:#EDE9FE;border-radius:8px;padding:8px 10px;border-left:3px solid #7C3AED';
      qblock.appendChild(correctBox);
    }
    correctBox.innerHTML =
      '<div style="font-size:9px;font-weight:700;color:#7C3AED;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px">Respuesta correcta</div>' +
      '<div style="font-size:12px;color:#4C1D95;font-weight:600">' + q.bad.replace('✗ ','') + '</div>';
    correctBox.style.display = 'block';
  }
}

/* ---- Evaluar respuestas ---- */
function evaluateAnswers() {
  if (!currentHistoria) return;

  var filledCount = 0;
  for (var i = 1; i <= 5; i++) {
    var ta = document.getElementById('q' + i);
    if (ta && ta.value.trim().length > 2) filledCount++;
  }
  if (filledCount < 3) {
    showToast('✏️ Responde al menos 3 preguntas antes de enviar');
    return;
  }

  var btn     = document.getElementById('comp-submit');
  var loading = document.getElementById('comp-loading');
  btn.disabled = true; loading.style.display = 'block';

  var answers = [];
  for (var i = 1; i <= 5; i++) answers.push(document.getElementById('q' + i).value.trim());

  var dl    = compDiff();
  var level = dl.txt === 'Fácil' ? 0 : dl.txt === 'Medio' ? 1 : 2;

  var orthoTypes = {};
  answers.forEach(function(a) {
    checkOrtho(a, level).forEach(function(issue) { orthoTypes[issue.type] = issue.msg; });
  });
  var orthoMsgs = Object.values(orthoTypes);

  setTimeout(function() {
    loading.style.display = 'none';

    var orthoEl = document.getElementById('comp-ortho');
    if (orthoMsgs.length > 0) {
      orthoEl.textContent = (level === 0 ? '💡 Recuerda: ' : '⚠️ ') + orthoMsgs.join(' ');
      orthoEl.style.display = 'block';
    } else { orthoEl.style.display = 'none'; }

    var score = 0;
    for (var i = 0; i < 5; i++) {
      var res = document.getElementById('qr' + (i+1));
      var ans = answers[i].toLowerCase();
      var q   = currentHistoria.preguntas[i];
      var kw  = q.keywords || [];
      var hits = kw.filter(function(k) { return ans.includes(k.toLowerCase()); }).length;
      var ok  = hits >= 1 && ans.length > 3;
      if (ok) { score++; res.className = 'q-res ok'; res.textContent = q.ok; }
      else {
        res.className = 'q-res bad';
        // Primer intento: solo avisar que es incorrecto, sin revelar la respuesta
        var intentos = currentHistoria._intentos || 0;
        res.textContent = intentos >= 1 ? q.bad : '✗ No es correcto, vuelve a intentarlo.';
      }
      res.style.display = 'block';
    }

    var penalty    = level >= 1 ? orthoMsgs.length : 0;
    var finalScore = Math.max(0, score - penalty);
    var pts        = finalScore * 5;
    var orthoNote  = orthoMsgs.length > 0
      ? (level >= 1 ? ' (−' + penalty + ' pts ortografía)' : ' (la próxima vez penalizará)')
      : '';

    var re = document.getElementById('comp-result');
    re.style.display = 'block';

    if (!currentHistoria._intentos) currentHistoria._intentos = 0;

    if (score >= 4) {
      // ── BUENA PUNTUACIÓN: guardar y mostrar botón siguiente ──
      awardPts(pts, 'lengua');
      recordResult('lengua', 'comp', true);
      ST.compStreak++;
      saveState();
      re.className = 'comp-result ok';
      re.innerHTML = '<div class="comp-result-title">¡' + (getNombre()||'Lectora') + ', increíble! ' + score + '/5 🌟 +' + pts + ' pts' + orthoNote + '</div>' +
                     '<div class="comp-result-sub">¡Has entendido el cuento genial!</div>';
      addNextBtn(re, 'Siguiente historia →', true);

    } else {
      currentHistoria._intentos++;

      if (currentHistoria._intentos < 2) {
        // ── PRIMER FALLO: reintento, no puntuar aún ──
        re.className = 'comp-result bad';
        re.innerHTML = '<div class="comp-result-title">' + score + '/5 💪' + orthoNote + '</div>' +
                       '<div class="comp-result-sub">Lee el texto otra vez y fíjate en las respuestas en rojo.</div>';
        // Botón reintento: NO carga nueva historia, solo resetea los campos
        var nb = document.createElement('button');
        nb.className = 'next-btn bg-pink';
        nb.style.cssText = 'margin-top:12px;background:#F59E0B';
        nb.textContent = 'Volver a intentarlo';
        nb.onclick = function() {
          // Solo limpiar las respuestas INCORRECTAS — las correctas se quedan
          for (var j = 1; j <= 5; j++) {
            var qr2 = document.getElementById('qr' + j);
            if (qr2 && qr2.className.indexOf('bad') !== -1) {
              // Era incorrecta: limpiar textarea y resultado
              var ta2 = document.getElementById('q' + j);
              if (ta2) ta2.value = '';
              qr2.className = 'q-res';
              qr2.textContent = '';
              qr2.style.display = 'none';
            }
            // Si era correcta (ok): no tocar el textarea ni el resultado verde
          }
          // Ocultar cajas de respuesta correcta si las hubiera
          document.querySelectorAll('.q-correct-box').forEach(function(b) { b.style.display = 'none'; });
          re.style.display = 'none';
          var ortho2 = document.getElementById('comp-ortho');
          if (ortho2) ortho2.style.display = 'none';
          var submitBtn2 = document.getElementById('comp-submit');
          if (submitBtn2) { submitBtn2.disabled = false; }
        };
        re.appendChild(nb);
      } else {
        // ── SEGUNDO FALLO: mostrar respuestas correctas + botón siguiente ──
        mostrarRespuestasCorrectas();
        awardPts(pts, 'lengua');
        recordResult('lengua', 'comp', false);
        ST.compStreak = Math.max(0, ST.compStreak - 1);
        saveState();
        currentHistoria._intentos = 0;
        re.className = 'comp-result bad';
        re.innerHTML = '<div class="comp-result-title">' + score + '/5 📖 +' + pts + ' pts' + orthoNote + '</div>' +
                       '<div class="comp-result-sub">Mira las respuestas correctas en morado. ¡La próxima vez lo harás mejor!</div>';
        addNextBtn(re, 'Siguiente historia →', true);
      }
    }
    updateSubjectUI('lengua');
  }, 1400);
}

function addNextBtn(container, label, newStory) {
  var nb = document.createElement('button');
  nb.className = 'next-btn bg-pink';
  nb.style.marginTop = '12px';
  nb.textContent = label;
  nb.onclick = function() {
    if (newStory) cargarNuevaHistoria();
  };
  container.appendChild(nb);
}
