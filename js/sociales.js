/* =============================================
   SOCIALES.JS — Asignatura de Sociales
   ============================================= */

var SOC_DATA = null;
var socUnit = null;
var socSection = null;
var socOpenItem = null;
var socOpenSub = null;

function loadSocialesData(callback) {
  if (SOC_DATA) { callback(); return; }
  fetch('data/curso' + cursoActual + '/sociales.json')
    .then(function(r) { return r.json(); })
    .then(function(data) { SOC_DATA = data; callback(); })
    .catch(function(e) { console.warn('Error cargando sociales:', e); });
}

/* ---- Menú principal de sociales ---- */
function renderSocialesMenu() {
  loadSocialesData(function() {
    var grid = document.getElementById('sociales-units-grid');
    if (!grid) return;
    grid.innerHTML = '';
    SOC_DATA.units.forEach(function(unit) {
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.innerHTML =
        '<div class="mode-emoji">💼</div>' +
        '<div class="mode-name">' + unit.title + '</div>' +
        '<div class="mode-sub">' + unit.sections.length + ' apartados</div>';
      card.addEventListener('click', (function(u) {
        return function() {
          socUnit = u;
          socSection = u.sections[0].id;
          socOpenItem = null;
          socOpenSub = null;
          go('s-sociales-study-unit');
          renderSocialesUnit();
        };
      })(unit));
      grid.appendChild(card);
    });
  });
}

/* ---- Vista de unidad con acordeón ---- */
function renderSocialesUnit() {
  if (!socUnit) return;
  setEl('sociales-unit-title', socUnit.title);

  // Render tabs de secciones
  var tabsEl = document.getElementById('sociales-section-tabs');
  if (tabsEl) {
    tabsEl.innerHTML = '';
    socUnit.sections.forEach(function(sec) {
      var btn = document.createElement('button');
      btn.style.cssText = 'padding:5px 12px;border-radius:20px;border:0.5px solid var(--gray-200);font-family:var(--f);font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;' +
        (sec.id === socSection
          ? 'background:' + socUnit.color + ';color:white;border-color:' + socUnit.color
          : 'background:white;color:var(--gray-500)');
      btn.textContent = sec.label;
      btn.addEventListener('click', (function(sid) {
        return function() {
          socSection = sid;
          socOpenItem = null;
          socOpenSub = null;
          renderSocialesUnit();
        };
      })(sec.id));
      tabsEl.appendChild(btn);
    });
  }

  // Render contenido de la sección activa
  var sec = socUnit.sections.find(function(s) { return s.id === socSection; });
  if (!sec) return;

  var area = document.getElementById('sociales-unit-content');
  if (!area) return;
  area.innerHTML = '';

  // Descripción de la sección
  var intro = document.createElement('p');
  intro.style.cssText = 'font-family:var(--f);font-size:13px;color:var(--gray-500);margin:0 0 14px';
  intro.textContent = sec.desc;
  area.appendChild(intro);

  // Items acordeón
  sec.items.forEach(function(item) {
    var isOpen = socOpenItem === item.id;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'border:0.5px solid var(--gray-200);border-radius:12px;overflow:hidden;margin-bottom:10px;background:white';

    // Botón principal
    var btn = document.createElement('button');
    btn.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 14px;background:white;border:none;cursor:pointer;text-align:left;transition:background .15s';
    btn.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="width:40px;height:40px;border-radius:10px;background:' + socUnit.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px">' +
          item.icon +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-family:var(--f);font-size:14px;font-weight:800;color:var(--gray-800)">' + item.label + '</div>' +
          '<div style="font-family:var(--f);font-size:11px;color:var(--gray-500);margin-top:3px;line-height:1.4">' + item.desc + '</div>' +
        '</div>' +
      '</div>' +
      '<i class="ti ' + (isOpen ? 'ti-chevron-up' : 'ti-chevron-down') + '" style="font-size:18px;color:' + socUnit.color + ';flex-shrink:0;margin-left:8px"></i>';
    btn.addEventListener('click', (function(id) {
      return function() {
        socOpenItem = socOpenItem === id ? null : id;
        socOpenSub = null;
        renderSocialesUnit();
      };
    })(item.id));
    wrap.appendChild(btn);

    // Subtemas (si abierto)
    if (isOpen) {
      var inner = document.createElement('div');
      inner.style.cssText = 'padding:10px 12px;display:flex;flex-direction:column;gap:6px;border-top:0.5px solid var(--gray-100);background:var(--gray-50)';

      item.subs.forEach(function(sub) {
        var subId = item.id + '-' + sub.label;
        var isSubOpen = socOpenSub === subId;

        var subWrap = document.createElement('div');
        subWrap.style.cssText = 'border:0.5px solid var(--gray-100);border-radius:10px;overflow:hidden;background:white';

        var subBtn = document.createElement('button');
        subBtn.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;padding:9px 12px;background:' + (isSubOpen ? 'var(--gray-50)' : 'white') + ';border:none;cursor:pointer;text-align:left';
        subBtn.innerHTML =
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<div style="width:28px;height:28px;border-radius:8px;background:' + socUnit.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">' +
              sub.icon +
            '</div>' +
            '<span style="font-family:var(--f);font-size:13px;font-weight:700;color:var(--gray-700)">' + sub.label + '</span>' +
          '</div>' +
          '<i class="ti ' + (isSubOpen ? 'ti-chevron-up' : 'ti-chevron-down') + '" style="font-size:14px;color:var(--gray-400)"></i>';
        subBtn.addEventListener('click', (function(sid) {
          return function() {
            socOpenSub = socOpenSub === sid ? null : sid;
            renderSocialesUnit();
          };
        })(subId));
        subWrap.appendChild(subBtn);

        if (isSubOpen) {
          var subContent = document.createElement('div');
          subContent.style.cssText = 'padding:10px 12px 10px 48px;font-family:var(--f);font-size:13px;color:var(--gray-600);line-height:1.7;border-top:0.5px solid var(--gray-100);background:white';
          subContent.textContent = sub.text;
          subWrap.appendChild(subContent);
        }
        inner.appendChild(subWrap);
      });
      wrap.appendChild(inner);
    }
    area.appendChild(wrap);
  });
}

/* =============================================
   EJERCICIOS DE SOCIALES
   Tipos: vf (verdadero/falso), relacionar, completar
   ============================================= */

var SOC_EX_DATA  = null;
var socExQueue   = [];
var socExIdx     = 0;
var socExUnit    = null;
var socExAttempt = 1;
var socExDone    = false;
var socRelPairs  = [];    // pares para relacionar
var socRelLeft   = null;  // ítem izquierdo seleccionado
var socRelMatched = [];   // pares ya emparejados

function loadSocialesEjData(callback) {
  if (SOC_EX_DATA) { callback(); return; }
  fetch('data/curso' + cursoActual + '/sociales-ejercicios.json')
    .then(function(r) { return r.json(); })
    .then(function(data) { SOC_EX_DATA = data; callback(); })
    .catch(function(e) { console.warn('Error cargando ejercicios sociales:', e); });
}

function shuffleSoc(arr) {
  var a = arr.slice();
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function initSocialesEjercicios() {
  loadSocialesEjData(function() {
    var unit = SOC_EX_DATA.units[0];
    socExUnit  = unit;
    socExQueue = shuffleSoc(unit.ejercicios);
    socExIdx   = 0;
    go('s-sociales-ex');
    loadSocEx();
  });
}

function loadSocEx() {
  var ex    = socExQueue[socExIdx];
  var total = socExQueue.length;
  socExAttempt = 1;
  socExDone    = false;
  socRelLeft   = null;
  socRelMatched = [];

  setEl('soc-ex-badge', 'Pregunta ' + (socExIdx+1) + ' de ' + total);
  setBar('soc-ex-prog', Math.round(socExIdx/total*100));

  var area = document.getElementById('soc-ex-area');
  if (!area) return;
  area.innerHTML = '';

  document.getElementById('soc-ex-fb').style.display   = 'none';
  document.getElementById('soc-ex-next').style.display = 'none';

  if (ex.tipo === 'vf')        renderSocVF(ex, area);
  else if (ex.tipo === 'relacionar') renderSocRelacionar(ex, area);
  else if (ex.tipo === 'completar')  renderSocCompletar(ex, area);
}

/* ---- VERDADERO / FALSO ---- */
function renderSocVF(ex, area) {
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
    btn.addEventListener('click', function() { checkSocVF(val, ex); });
    btns.appendChild(btn);
  });
  area.appendChild(btns);
}

function checkSocVF(val, ex) {
  var isCorrect = val === ex.respuesta;
  var fbEl = document.getElementById('soc-ex-fb');
  fbEl.style.display = 'block';

  if (isCorrect) {
    socExDone = true;
    fbEl.className = 'feedback fb-ok';
    fbEl.innerHTML = '✅ ' + (socExAttempt === 1 ? '¡Correcto!' : '¡Bien, en el segundo intento!') + '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'vf', true);
    awardPts(socExAttempt === 1 ? 10 : 5, 'sociales');
    updateSubjectUI('sociales');
  } else if (socExAttempt === 1) {
    socExAttempt = 2;
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ No es correcto — inténtalo de nuevo';
  } else {
    socExDone = true;
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ La respuesta es ' + (ex.respuesta ? 'Verdadero' : 'Falso') + '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'vf', false);
    updateSubjectUI('sociales');
  }
}

/* ---- RELACIONAR ---- */
function renderSocRelacionar(ex, area) {
  var instr = document.createElement('p');
  instr.style.cssText = 'font-family:var(--f);font-size:13px;color:var(--gray-500);margin:0 0 12px;text-align:center';
  instr.textContent = ex.pregunta;
  area.appendChild(instr);

  socRelPairs   = shuffleSoc(ex.pares);
  var leftItems = socRelPairs.map(function(p) { return p.izq; });
  var rightItems = shuffleSoc(socRelPairs.map(function(p) { return p.der; }));

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px';
  grid.id = 'soc-rel-grid';

  leftItems.forEach(function(txt, i) {
    var lBtn = document.createElement('button');
    lBtn.dataset.side = 'left';
    lBtn.dataset.val  = txt;
    lBtn.style.cssText = 'padding:10px 8px;border-radius:10px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;text-align:center;color:var(--gray-700)';
    lBtn.textContent = txt;
    lBtn.addEventListener('click', function() { socRelClick('left', txt, lBtn); });

    var rBtn = document.createElement('button');
    rBtn.dataset.side = 'right';
    rBtn.dataset.val  = rightItems[i];
    rBtn.style.cssText = 'padding:10px 8px;border-radius:10px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-align:center;color:var(--gray-500)';
    rBtn.textContent = rightItems[i];
    rBtn.addEventListener('click', function() { socRelClick('right', rightItems[i], rBtn); });

    grid.appendChild(lBtn);
    grid.appendChild(rBtn);
  });
  area.appendChild(grid);
}

function socRelClick(side, val, btn) {
  if (socExDone) return;
  var grid = document.getElementById('soc-rel-grid');

  if (side === 'left') {
    // Deseleccionar anterior izquierdo
    grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
      if (!b.dataset.matched) { b.style.borderColor = 'var(--gray-200)'; b.style.background = 'white'; }
    });
    socRelLeft = val;
    btn.style.borderColor = '#0F6E56';
    btn.style.background  = '#E1F5EE';
  } else if (side === 'right' && socRelLeft) {
    // Comprobar si el par es correcto
    var correct = socRelPairs.find(function(p) { return p.izq === socRelLeft; });
    var leftBtn = null;
    grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
      if (b.dataset.val === socRelLeft) leftBtn = b;
    });

    if (correct && correct.der === val) {
      // Par correcto
      btn.style.borderColor    = '#22C55E'; btn.style.background = '#F0FDF4'; btn.disabled = true; btn.dataset.matched = '1';
      if (leftBtn) { leftBtn.style.borderColor = '#22C55E'; leftBtn.style.background = '#F0FDF4'; leftBtn.disabled = true; leftBtn.dataset.matched = '1'; }
      socRelMatched.push(socRelLeft);
      socRelLeft = null;

      // ¿Completado?
      if (socRelMatched.length === socRelPairs.length) {
        socExDone = true;
        var fbEl = document.getElementById('soc-ex-fb');
        fbEl.style.display = 'block';
        fbEl.className = 'feedback fb-ok';
        fbEl.textContent = '✅ ¡Todos los pares correctos!';
        document.getElementById('soc-ex-next').style.display = 'block';
        recordResult('sociales', 'relacionar', true);
        awardPts(10, 'sociales');
        updateSubjectUI('sociales');
      }
    } else {
      // Par incorrecto — flash rojo y resetear
      btn.style.borderColor = '#EF4444'; btn.style.background = '#FEF2F2';
      if (leftBtn) { leftBtn.style.borderColor = '#EF4444'; leftBtn.style.background = '#FEF2F2'; }
      setTimeout(function() {
        btn.style.borderColor = 'var(--gray-200)'; btn.style.background = 'white';
        if (leftBtn) { leftBtn.style.borderColor = 'var(--gray-200)'; leftBtn.style.background = 'white'; }
      }, 600);
      socRelLeft = null;
    }
  }
}

/* ---- COMPLETAR LA FRASE ---- */
function renderSocCompletar(ex, area) {
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:20px 16px;margin-bottom:16px;text-align:center';
  var html = ex.pregunta.replace('_____', '<span style="display:inline-block;min-width:80px;border-bottom:2px solid #0F6E56;margin:0 4px;color:#0F6E56;font-weight:800">?</span>');
  card.innerHTML = '<div style="font-family:var(--f);font-size:15px;font-weight:700;color:var(--gray-800);line-height:1.7">' + html + '</div>';
  area.appendChild(card);

  var opts = document.createElement('div');
  opts.style.cssText = 'display:flex;flex-direction:column;gap:8px';

  var shuffledOpts = shuffleSoc(ex.opciones.map(function(o, i) { return {text:o, idx:i}; }));
  shuffledOpts.forEach(function(opt) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:14px 16px;border-radius:12px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;text-align:left;color:var(--gray-700)';
    btn.textContent = opt.text;
    btn.addEventListener('click', function() { checkSocCompletar(opt.idx, ex, btn, opts); });
    opts.appendChild(btn);
  });
  area.appendChild(opts);
}

function checkSocCompletar(idx, ex, btn, opts) {
  if (socExDone) return;
  var isCorrect = idx === ex.respuesta;
  var fbEl = document.getElementById('soc-ex-fb');
  fbEl.style.display = 'block';

  // Marcar botón pulsado
  btn.style.borderColor = isCorrect ? '#22C55E' : '#EF4444';
  btn.style.background  = isCorrect ? '#F0FDF4' : '#FEF2F2';

  if (isCorrect) {
    socExDone = true;
    fbEl.className = 'feedback fb-ok';
    fbEl.innerHTML = '✅ ' + (socExAttempt === 1 ? '¡Correcto!' : '¡Bien, en el segundo intento!') + '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'completar', true);
    awardPts(socExAttempt === 1 ? 10 : 5, 'sociales');
    updateSubjectUI('sociales');
  } else if (socExAttempt === 1) {
    socExAttempt = 2;
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ No es correcto — inténtalo de nuevo';
    // Deshabilitar opción incorrecta
    btn.disabled = true; btn.style.opacity = '0.5';
  } else {
    socExDone = true;
    // Mostrar correcta en verde
    opts.querySelectorAll('button').forEach(function(b, i) {
      if (!b.disabled) {
        var optIdx = parseInt(b.dataset.idx);
      }
    });
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ La respuesta correcta es: <strong>' + ex.opciones[ex.respuesta] + '</strong><div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    // Marcar la correcta en verde
    opts.querySelectorAll('button').forEach(function(b) {
      if (b.textContent === ex.opciones[ex.respuesta]) {
        b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4';
      }
    });
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'completar', false);
    updateSubjectUI('sociales');
  }
}

function socExNext() {
  socExIdx++;
  if (socExIdx >= socExQueue.length) {
    go('s-sociales');
    updateSubjectUI('sociales');
    return;
  }
  loadSocEx();
}
