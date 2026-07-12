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

  setEl('soc-ex-badge', 'Pregunta ' + (SO.idx+1) + ' de ' + total);
  setBar('soc-ex-prog', Math.round(SO.idx/total*100));

  var area = document.getElementById('soc-ex-area');
  if (!area) return;
  area.innerHTML = '';

  document.getElementById('soc-ex-fb').style.display   = 'none';
  document.getElementById('soc-ex-next').style.display = 'none';

  if (ex.tipo === 'vf')              _socStartVF(ex, area);
  else if (ex.tipo === 'relacionar') _socStartRelacionar(ex, area);
  else if (ex.tipo === 'completar')  _socStartCompletar(ex, area);
}

/* ---- Config base compartida ---- */
function _socBaseConfig(ex) {
  return {
    queue:       SO.queue,
    idx:         SO.idx,
    prefix:      'soc-ex',
    subjectKey:  'sociales',
    setIdx:      function(v){ SO.idx = v; },
    onFinish:    function(){ go('s-sociales'); },
    onAdvance:   function(){ loadSocEx(); }
  };
}

/* ---- VERDADERO / FALSO ---- */
function _socStartVF(ex, area) {
  // Tarjeta con la afirmación
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:20px 16px;margin-bottom:16px;text-align:center';
  card.innerHTML = '<div style="font-family:var(--f);font-size:15px;font-weight:700;color:var(--gray-800);line-height:1.5">"' + ex.pregunta + '"</div>';
  area.appendChild(card);

  // Contenedor de opciones (requerido por el motor)
  var optsEl = document.createElement('div');
  optsEl.id = 'soc-ex-opts';
  area.appendChild(optsEl);

  var config = _socBaseConfig(ex);
  config.exerciseKey  = 'sociales-vf';
  config.tryAgainMsg  = '❌ No es correcto — inténtalo de nuevo';
  config.getExplanation = function(e){ return e.explicacion || ''; };

  // Rendering personalizado: botones grandes V/F
  config.renderOpts = function(container, e, attempt, onAnswer) {
    container.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px';
    [true, false].forEach(function(val) {
      var btn = document.createElement('button');
      btn.style.cssText = 'padding:16px;border-radius:14px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:18px;font-weight:800;cursor:pointer;transition:all .15s';
      btn.innerHTML = val ? '✅ Verdadero' : '❌ Falso';
      btn.addEventListener('click', function() {
        // Deshabilitar todos los botones inmediatamente
        Array.from(container.children).forEach(function(b){ b.disabled = true; });
        if (attempt === 2) {
          // En segundo intento deshabilitar solo el incorrecto
        }
        onAnswer(val);
      });
      container.appendChild(btn);
    });
  };

  // Cuando falla en primer intento, deshabilitar el botón pulsado
  config.onWrong = function(selected, e, attempt) {
    if (attempt === 1) {
      var container = document.getElementById('soc-ex-opts');
      if (!container) return;
      // Re-habilitar el contrario, deshabilitar el pulsado
      Array.from(container.children).forEach(function(btn) {
        var isVerdadero = btn.innerHTML.includes('Verdadero');
        var btnVal = isVerdadero ? true : false;
        if (btnVal === selected) {
          btn.disabled = true;
          btn.style.opacity = '0.4';
        } else {
          btn.disabled = false;
        }
      });
    }
  };

  // Mostrar la pregunta con el motor
  ex.question  = ex.pregunta;  // normalizar campo
  ex.answer    = ex.respuesta; // normalizar campo
  ex.options   = [true, false];
  mcShowQuestion(config);
}

/* ---- RELACIONAR — usa engine-matching ---- */
function _socStartRelacionar(ex, area) {
  var instr = document.createElement('p');
  instr.style.cssText = 'font-family:var(--f);font-size:13px;color:var(--gray-500);margin:0 0 12px;text-align:center';
  instr.textContent = ex.pregunta;
  area.appendChild(instr);

  // Contenedor específico para el motor de matching
  var matchContainer = document.createElement('div');
  matchContainer.id = 'soc-rel-container';
  area.appendChild(matchContainer);

  var pairs = shuffleSoc(ex.pares.map(function(p){ return { left: p.izq, right: p.der }; }));

  SO.matchState = mcMatchInit({
    pairs:       pairs,
    containerId: 'soc-rel-container',
    prefix:      'soc-ex',
    subjectKey:  'sociales',
    exerciseKey: 'sociales-relacionar',
  });
}

/* ---- COMPLETAR LA FRASE ---- */
function _socStartCompletar(ex, area) {
  // Tarjeta con la frase
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:20px 16px;margin-bottom:16px;text-align:center';
  var html = ex.pregunta.replace('_____', '<span style="display:inline-block;min-width:80px;border-bottom:2px solid #0F6E56;margin:0 4px;color:#0F6E56;font-weight:800">?</span>');
  card.innerHTML = '<div style="font-family:var(--f);font-size:15px;font-weight:700;color:var(--gray-800);line-height:1.7">' + html + '</div>';
  area.appendChild(card);

  var optsEl = document.createElement('div');
  optsEl.id = 'soc-ex-opts';
  area.appendChild(optsEl);

  var config = _socBaseConfig(ex);
  config.exerciseKey    = 'sociales-completar';
  config.tryAgainMsg    = '❌ No es correcto — inténtalo de nuevo';
  config.getExplanation = function(e){ return e.explicacion || ''; };

  // Rendering personalizado: botones de texto apilados
  config.renderOpts = function(container, e, attempt, onAnswer) {
    container.style.cssText = 'display:flex;flex-direction:column;gap:8px';
    shuffleSoc(e.opciones.map(function(o, i){ return {text:o, idx:i}; })).forEach(function(opt) {
      var btn = document.createElement('button');
      btn.style.cssText = 'padding:14px 16px;border-radius:12px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;text-align:left;color:var(--gray-700)';
      btn.textContent = opt.text;
      btn.dataset.idx = opt.idx;
      btn.addEventListener('click', function() {
        btn.style.borderColor = '#7C3AED';
        btn.style.background  = '#EDE9FE';
        onAnswer(opt.idx);
      });
      container.appendChild(btn);
    });
  };

  config.onCorrect = function(selected, e, attempt) {
    var container = document.getElementById('soc-ex-opts');
    if (!container) return;
    Array.from(container.children).forEach(function(btn) {
      btn.disabled = true;
      if (parseInt(btn.dataset.idx) === e.respuesta) {
        btn.style.borderColor = '#22C55E'; btn.style.background = '#F0FDF4';
      }
    });
  };

  config.onWrong = function(selected, e, attempt) {
    var container = document.getElementById('soc-ex-opts');
    if (!container) return;
    if (attempt === 1) {
      Array.from(container.children).forEach(function(btn) {
        if (parseInt(btn.dataset.idx) === selected) {
          btn.disabled = true;
          btn.style.borderColor = '#EF4444';
          btn.style.background  = '#FEF2F2';
          btn.style.opacity = '0.5';
        } else {
          btn.disabled = false;
          btn.style.borderColor = 'var(--gray-200)';
          btn.style.background  = 'white';
        }
      });
    }
  };

  ex.question = ex.pregunta;
  ex.answer   = ex.respuesta;
  ex.options  = ex.opciones;
  mcShowQuestion(config);
}

function socExNext() {
  SO.idx++;
  if (SO.idx >= SO.queue.length) {
    go('s-sociales');
    return;
  }
  loadSocEx();
}
