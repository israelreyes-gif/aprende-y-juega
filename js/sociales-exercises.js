/* =============================================
   SOCIALES-EXERCISES.JS — V/F, Relacionar, Completar
   Usa engine-multiple-choice.js y engine-matching.js
   ============================================= */

function loadSocialesEjData(callback) {
  if (SubjectData.socialesEx) { callback(); return; }
  fetch('data/curso' + cursoActual + '/sociales-ejercicios.json')
    .then(function(r) { return r.json(); })
    .then(function(data) { SubjectData.socialesEx = data; callback(); })
    .catch(function(e) { showError('los ejercicios de Sociales', e, function(){ loadSocialesEjData(function(){}); }, 's-sociales'); });
}

function shuffleSoc(arr) {
  var a = arr.slice();
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function initSocialesEjercicios(tipo) {
  loadSocialesEjData(function() {
    var unit = SubjectData.socialesEx.units[0];
    SO.unit  = unit;
    var todos = tipo ? unit.ejercicios.filter(function(e) { return e.tipo === tipo; }) : unit.ejercicios;
    SO.queue = shuffleSoc(todos);
    SO.idx   = 0;
    go('s-sociales-ex');
    loadSocEx();
  });
}

function loadSocEx() {
  var ex    = SO.queue[SO.idx];
  var total = SO.queue.length;
  SO.attempt = 1;
  SO.done    = false;
  SO.relLeft    = null;
  SO.relMatched = [];

  setEl('soc-ex-badge', 'Pregunta ' + (SO.idx+1) + ' de ' + total);
  setBar('soc-ex-prog', Math.round(SO.idx/total*100));

  var area = document.getElementById('soc-ex-area');
  if (!area) return;
  area.innerHTML = '';

  document.getElementById('soc-ex-fb').style.display   = 'none';
  document.getElementById('soc-ex-next').style.display = 'none';

  if (ex.tipo === 'vf')               renderSocVF(ex, area);
  else if (ex.tipo === 'relacionar')  renderSocRelacionar(ex, area);
  else if (ex.tipo === 'completar')   renderSocCompletar(ex, area);
}

/* ---- VERDADERO / FALSO — usa engine-multiple-choice ---- */
function renderSocVF(ex, area) {
  // Renderizado específico de V/F (botones grandes especiales)
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:20px 16px;margin-bottom:16px;text-align:center';
  card.innerHTML = '<div style="font-family:var(--f);font-size:15px;font-weight:700;color:var(--gray-800);line-height:1.5">"' + ex.pregunta + '"</div>';
  area.appendChild(card);

  var btns = document.createElement('div');
  btns.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px';

  [true, false].forEach(function(val) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:16px;border-radius:14px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:18px;font-weight:800;cursor:pointer;transition:all .15s';
    btn.innerHTML = val ? '✅ Verdadero' : '❌ Falso';
    btn.addEventListener('click', function() {
      _socVFCheck(val, ex, btns);
    });
    btns.appendChild(btn);
  });
  area.appendChild(btns);
}

function _socVFCheck(val, ex, btns) {
  if (SO.done) return;
  var isCorrect = val === ex.respuesta;
  var fbEl  = document.getElementById('soc-ex-fb');
  var nextEl = document.getElementById('soc-ex-next');
  fbEl.style.display = 'block';

  // Deshabilitar botones
  btns.querySelectorAll('button').forEach(function(b) { b.disabled = true; });

  if (isCorrect) {
    SO.done = true;
    fbEl.className = 'feedback fb-ok';
    var pts = SO.attempt === 1 ? 10 : 5;
    fbEl.innerHTML = '✅ ' + (SO.attempt === 1 ? '¡Correcto! +' + pts + ' pts 🎉' : '¡Bien, en el segundo intento! +' + pts + ' pts') +
      '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    nextEl.style.display = 'block';
    recordResult('sociales', 'sociales-vf', true);
    awardPts(pts, 'sociales');
  } else if (SO.attempt === 1) {
    SO.attempt = 2;
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ No es correcto — inténtalo de nuevo';
    // Re-habilitar botones para segundo intento
    btns.querySelectorAll('button').forEach(function(b) {
      if ((val === true && b.innerHTML.includes('Verdadero')) || (val === false && b.innerHTML.includes('Falso'))) {
        b.disabled = true; b.style.opacity = '0.4';
      } else {
        b.disabled = false;
      }
    });
  } else {
    SO.done = true;
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ La respuesta es ' + (ex.respuesta ? 'Verdadero' : 'Falso') +
      '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    nextEl.style.display = 'block';
    recordResult('sociales', 'sociales-vf', false);
  }
}

/* ---- RELACIONAR — usa engine-matching ---- */
function renderSocRelacionar(ex, area) {
  area.id = 'soc-rel-container';

  var instr = document.createElement('p');
  instr.style.cssText = 'font-family:var(--f);font-size:13px;color:var(--gray-500);margin:0 0 12px;text-align:center';
  instr.textContent = ex.pregunta;
  area.appendChild(instr);

  // Convertir pares del JSON al formato del motor
  var pairs = ex.pares.map(function(p) { return { left: p.izq, right: p.der }; });

  SO.matchState = mcMatchInit({
    pairs:       shuffleSoc(pairs),
    containerId: 'soc-rel-container',
    prefix:      'soc-ex',
    subjectKey:  'sociales',
    exerciseKey: 'sociales-relacionar',
    ptsFirst:    10,
    ptsSecond:   5
  });
}

/* ---- COMPLETAR LA FRASE — usa engine-multiple-choice ---- */
function renderSocCompletar(ex, area) {
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:20px 16px;margin-bottom:16px;text-align:center';
  var html = ex.pregunta.replace('_____', '<span style="display:inline-block;min-width:80px;border-bottom:2px solid #0F6E56;margin:0 4px;color:#0F6E56;font-weight:800">?</span>');
  card.innerHTML = '<div style="font-family:var(--f);font-size:15px;font-weight:700;color:var(--gray-800);line-height:1.7">' + html + '</div>';
  area.appendChild(card);

  var optsEl = document.createElement('div');
  optsEl.style.cssText = 'display:flex;flex-direction:column;gap:8px';
  optsEl.id = 'soc-comp-opts';

  shuffleSoc(ex.opciones.map(function(o, i){ return {text:o, idx:i}; })).forEach(function(opt) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:14px 16px;border-radius:12px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;text-align:left;color:var(--gray-700)';
    btn.textContent = opt.text;
    btn.addEventListener('click', function() { _socCompCheck(opt.idx, ex, btn, optsEl); });
    optsEl.appendChild(btn);
  });
  area.appendChild(optsEl);
}

function _socCompCheck(idx, ex, btn, optsEl) {
  if (SO.done) return;
  var isCorrect = idx === ex.respuesta;
  var fbEl  = document.getElementById('soc-ex-fb');
  var nextEl = document.getElementById('soc-ex-next');
  fbEl.style.display = 'block';

  btn.style.borderColor = isCorrect ? '#22C55E' : '#EF4444';
  btn.style.background  = isCorrect ? '#F0FDF4' : '#FEF2F2';

  if (isCorrect) {
    SO.done = true;
    fbEl.className = 'feedback fb-ok';
    var pts = SO.attempt === 1 ? 10 : 5;
    fbEl.innerHTML = '✅ ' + (SO.attempt === 1 ? '¡Correcto! +' + pts + ' pts 🎉' : '¡Bien, en el segundo intento! +' + pts + ' pts') +
      '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    nextEl.style.display = 'block';
    recordResult('sociales', 'sociales-completar', true);
    awardPts(pts, 'sociales');
  } else if (SO.attempt === 1) {
    SO.attempt = 2;
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ No es correcto — inténtalo de nuevo';
    btn.disabled = true; btn.style.opacity = '0.5';
  } else {
    SO.done = true;
    optsEl.querySelectorAll('button').forEach(function(b) {
      if (b.textContent === ex.opciones[ex.respuesta]) {
        b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4';
      }
    });
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ La respuesta correcta es: <strong>' + ex.opciones[ex.respuesta] + '</strong>' +
      '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    nextEl.style.display = 'block';
    recordResult('sociales', 'sociales-completar', false);
  }
}

function socExNext() {
  SO.idx++;
  if (SO.idx >= SO.queue.length) {
    go('s-sociales');
    return;
  }
  loadSocEx();
}
