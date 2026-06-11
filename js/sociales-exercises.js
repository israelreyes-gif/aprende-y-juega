/* =============================================
   SOCIALES-EXERCISES.JS — V/F, Relacionar, Completar
   ============================================= */


function loadSocialesEjData(callback) {
  if (SubjectData.socialesEx) { callback(); return; }
  fetch('data/curso' + cursoActual + '/sociales-ejercicios.json')
    .then(function(r) { return r.json(); })
    .then(function(data) { SubjectData.socialesEx = data; callback(); })
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
  SO.relLeft   = null;
  SO.relMatched = [];

  setEl('soc-ex-badge', 'Pregunta ' + (SO.idx+1) + ' de ' + total);
  setBar('soc-ex-prog', Math.round(SO.idx/total*100));

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
    SO.done = true;
    fbEl.className = 'feedback fb-ok';
    var socVfPts = SO.attempt === 1 ? 10 : 5;
    fbEl.innerHTML = '✅ ' + (SO.attempt === 1 ? '¡Correcto! +' + socVfPts + ' pts 🎉' : '¡Bien, en el segundo intento! +' + socVfPts + ' pts') + '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'vf', true);
    awardPts(socVfPts, 'sociales');
    updateSubjectUI('sociales');
  } else if (SO.attempt === 1) {
    SO.attempt = 2;
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ No es correcto — inténtalo de nuevo';
  } else {
    SO.done = true;
    fbEl.className = 'feedback fb-err';
    fbEl.innerHTML = '❌ La respuesta es ' + (ex.respuesta ? 'Verdadero' : 'Falso') + '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'vf', false);
    updateSubjectUI('sociales');
  }
}

/* ---- RELACIONAR ---- */
var REL_COLORS = [
  { border: '#7C3AED', bg: '#EDE9FE', text: '#4C1D95' },  // morado
  { border: '#0369A1', bg: '#E0F2FE', text: '#0C4A6E' },  // azul
  { border: '#B45309', bg: '#FEF3C7', text: '#78350F' },  // naranja/ámbar
  { border: '#BE123C', bg: '#FFE4E6', text: '#881337' }   // rojo rosa
];

function renderSocRelacionar(ex, area) {
  SO.relSelections = {};
  SO.relColorIdx = 0;

  var instr = document.createElement('p');
  instr.style.cssText = 'font-family:var(--f);font-size:13px;color:var(--gray-500);margin:0 0 12px;text-align:center';
  instr.textContent = ex.pregunta;
  area.appendChild(instr);

  SO.relPairs   = shuffleSoc(ex.pares);
  var leftItems = SO.relPairs.map(function(p) { return p.izq; });
  var rightItems = shuffleSoc(SO.relPairs.map(function(p) { return p.der; }));

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px';
  grid.id = 'soc-rel-grid';

  leftItems.forEach(function(txt, i) {
    var lBtn = document.createElement('button');
    lBtn.dataset.side = 'left';
    lBtn.dataset.val  = txt;
    lBtn.style.cssText = 'padding:10px 8px;border-radius:10px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;text-align:center;color:var(--gray-700)';
    lBtn.textContent = txt;
    lBtn.addEventListener('click', function() { socRelClickNew('left', txt); });

    var rBtn = document.createElement('button');
    rBtn.dataset.side = 'right';
    rBtn.dataset.val  = rightItems[i];
    rBtn.style.cssText = 'padding:10px 8px;border-radius:10px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;text-align:center;color:var(--gray-500)';
    rBtn.textContent = rightItems[i];
    rBtn.addEventListener('click', function() { socRelClickNew('right', rightItems[i]); });

    grid.appendChild(lBtn);
    grid.appendChild(rBtn);
  });
  area.appendChild(grid);

  // Botón comprobar
  var checkBtn = document.createElement('button');
  checkBtn.id = 'soc-rel-check';
  checkBtn.style.cssText = 'width:100%;margin-top:12px;padding:13px 16px;border-radius:14px;border:none;background:var(--gray-200);color:var(--gray-400);font-family:var(--f);font-weight:800;font-size:15px;cursor:default;transition:all .2s';
  checkBtn.textContent = 'Comprobar ✓';
  checkBtn.disabled = true;
  checkBtn.addEventListener('click', checkSocRelacionar);
  area.appendChild(checkBtn);
}

function socRelClickNew(side, val) {
  if (SO.done) return;
  var grid = document.getElementById('soc-rel-grid');

  if (side === 'left') {
    SO.relLeft = val;
    // Resaltar el seleccionado, quitar resaltado de otros no emparejados (proteger correctos)
    grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
      if (!b.dataset.colorIdx && !b.dataset.correct) {
        b.style.borderColor = b.dataset.val === val ? '#0F6E56' : 'var(--gray-200)';
        b.style.background  = b.dataset.val === val ? '#E1F5EE' : 'white';
        b.style.color       = b.dataset.val === val ? '#085041' : 'var(--gray-700)';
      }
    });
  } else if (side === 'right' && SO.relLeft !== null) {
    // Asignar color al par
    var c = REL_COLORS[SO.relColorIdx % REL_COLORS.length];
    var leftVal = SO.relLeft;

    // Si el derecho ya tenía un par asignado, liberar el izquierdo anterior (proteger correctos)
    for (var lv in SO.relSelections) {
      if (SO.relSelections[lv].rightVal === val) {
        var oldLeft = lv;
        delete SO.relSelections[oldLeft];
        grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
          if (b.dataset.val === oldLeft && !b.dataset.correct) {
            delete b.dataset.colorIdx;
            b.style.borderColor = 'var(--gray-200)'; b.style.background = 'white'; b.style.color = 'var(--gray-700)';
          }
        });
      }
    }
    // Si el izquierdo ya tenía un derecho, liberar el derecho anterior (proteger correctos)
    if (SO.relSelections[leftVal]) {
      var oldRight = SO.relSelections[leftVal].rightVal;
      grid.querySelectorAll('[data-side="right"]').forEach(function(b) {
        if (b.dataset.val === oldRight && !b.dataset.correct) {
          delete b.dataset.colorIdx;
          b.style.borderColor = 'var(--gray-200)'; b.style.background = 'white'; b.style.color = 'var(--gray-500)';
        }
      });
    } else {
      SO.relColorIdx++;
    }

    SO.relSelections[leftVal] = { rightVal: val, colorIdx: SO.relColorIdx % REL_COLORS.length };
    c = REL_COLORS[SO.relSelections[leftVal].colorIdx];

    // Pintar par con el color (proteger correctos)
    grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
      if (b.dataset.val === leftVal && !b.dataset.correct) {
        b.dataset.colorIdx = SO.relSelections[leftVal].colorIdx;
        b.style.borderColor = c.border; b.style.background = c.bg; b.style.color = c.text;
      }
    });
    grid.querySelectorAll('[data-side="right"]').forEach(function(b) {
      if (b.dataset.val === val && !b.dataset.correct) {
        b.dataset.colorIdx = SO.relSelections[leftVal].colorIdx;
        b.style.borderColor = c.border; b.style.background = c.bg; b.style.color = c.text;
      }
    });

    SO.relLeft = null;
    // Quitar resaltado de izquierdos no emparejados (proteger los correctos bloqueados)
    grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
      if (!b.dataset.colorIdx && !b.dataset.correct) { b.style.borderColor = 'var(--gray-200)'; b.style.background = 'white'; b.style.color = 'var(--gray-700)'; }
    });

    // Activar botón comprobar si todos emparejados
    var checkBtn = document.getElementById('soc-rel-check');
    if (Object.keys(SO.relSelections).length === SO.relPairs.length) {
      checkBtn.disabled = false;
      checkBtn.style.background = '#0F6E56';
      checkBtn.style.color = 'white';
      checkBtn.style.cursor = 'pointer';
    }
  }
}

function checkSocRelacionar() {
  if (SO.done) return;
  var grid = document.getElementById('soc-rel-grid');
  var allCorrect = true;
  var wrongLefts = [];

  SO.relPairs.forEach(function(par) {
    var sel = SO.relSelections[par.izq];
    if (!sel || sel.rightVal !== par.der) {
      allCorrect = false;
      wrongLefts.push(par.izq);
    }
  });

  var fbEl = document.getElementById('soc-ex-fb');

  if (allCorrect) {
    SO.done = true;
    // Marcar todos en verde
    grid.querySelectorAll('button').forEach(function(b) {
      b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4'; b.style.color = '#15803D'; b.disabled = true;
    });
    document.getElementById('soc-rel-check').style.display = 'none';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-ok';
    var socRelPts = SO.attempt === 1 ? 10 : 5;
    fbEl.textContent = '✅ ' + (SO.attempt === 1 ? '¡Todos los pares correctos! +' + socRelPts + ' pts 🎉' : '¡Bien, en el segundo intento! +' + socRelPts + ' pts');
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'relacionar', true);
    awardPts(socRelPts, 'sociales');
    updateSubjectUI('sociales');
  } else if (SO.attempt === 1) {
    SO.attempt = 2;
    // Marcar incorrectos en rojo y bloquearlos, correctos en verde y bloquearlos
    SO.relPairs.forEach(function(par) {
      var sel = SO.relSelections[par.izq];
      var isCorrect = sel && sel.rightVal === par.der;
      grid.querySelectorAll('button').forEach(function(b) {
        if (b.dataset.val === par.izq || (sel && b.dataset.val === sel.rightVal && b.dataset.side === 'right')) {
          if (isCorrect) {
            b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4'; b.style.color = '#15803D'; b.disabled = true;
            b.dataset.correct = '1';
            delete b.dataset.colorIdx;
          } else if (wrongLefts.indexOf(par.izq) >= 0) {
            b.style.borderColor = '#EF4444'; b.style.background = '#FEF2F2'; b.style.color = '#B91C1C';
            delete b.dataset.colorIdx;
            // Liberar para segundo intento (solo si no fue reasignado y no es correcto)
            setTimeout(function(btn) { return function() {
              if (!btn.dataset.colorIdx && !btn.dataset.correct) {
                btn.style.borderColor = 'var(--gray-200)'; btn.style.background = 'white';
                btn.style.color = btn.dataset.side === 'left' ? 'var(--gray-700)' : 'var(--gray-500)';
              }
            }; }(b), 800);
          }
        }
      });
    });
    // Limpiar selecciones incorrectas y sus dataset.colorIdx
    wrongLefts.forEach(function(lv) {
      var sel = SO.relSelections[lv];
      grid.querySelectorAll('button').forEach(function(b) {
        if (b.dataset.val === lv || (sel && b.dataset.val === sel.rightVal && b.dataset.side === 'right')) {
          delete b.dataset.colorIdx;
        }
      });
      delete SO.relSelections[lv];
    });
    SO.relColorIdx = Object.keys(SO.relSelections).length;
    SO.relLeft = null;
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Algunos pares no son correctos — inténtalo de nuevo con los que quedan';
    // Desactivar botón comprobar hasta completar de nuevo
    var checkBtn = document.getElementById('soc-rel-check');
    checkBtn.disabled = true; checkBtn.style.background = 'var(--gray-200)'; checkBtn.style.color = 'var(--gray-400)'; checkBtn.style.cursor = 'default';
  } else {
    // 2º fallo: mostrar correctos
    SO.done = true;
    grid.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
    SO.relPairs.forEach(function(par) {
      grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
        if (b.dataset.val === par.izq) { b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4'; b.style.color = '#15803D'; }
      });
      grid.querySelectorAll('[data-side="right"]').forEach(function(b) {
        if (b.dataset.val === par.der) { b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4'; b.style.color = '#15803D'; }
      });
    });
    document.getElementById('soc-rel-check').style.display = 'none';
    fbEl.style.display = 'block';
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ Aquí están los pares correctos';
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'relacionar', false);
    updateSubjectUI('sociales');
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
  if (SO.done) return;
  var isCorrect = idx === ex.respuesta;
  var fbEl = document.getElementById('soc-ex-fb');
  fbEl.style.display = 'block';

  // Marcar botón pulsado
  btn.style.borderColor = isCorrect ? '#22C55E' : '#EF4444';
  btn.style.background  = isCorrect ? '#F0FDF4' : '#FEF2F2';

  if (isCorrect) {
    SO.done = true;
    fbEl.className = 'feedback fb-ok';
    var socCompPts = SO.attempt === 1 ? 10 : 5;
    fbEl.innerHTML = '✅ ' + (SO.attempt === 1 ? '¡Correcto! +' + socCompPts + ' pts 🎉' : '¡Bien, en el segundo intento! +' + socCompPts + ' pts') + '<div style="font-size:12px;margin-top:6px;opacity:.8">' + ex.explicacion + '</div>';
    document.getElementById('soc-ex-next').style.display = 'block';
    recordResult('sociales', 'completar', true);
    awardPts(socCompPts, 'sociales');
    updateSubjectUI('sociales');
  } else if (SO.attempt === 1) {
    SO.attempt = 2;
    fbEl.className = 'feedback fb-err';
    fbEl.textContent = '❌ No es correcto — inténtalo de nuevo';
    // Deshabilitar opción incorrecta
    btn.disabled = true; btn.style.opacity = '0.5';
  } else {
    SO.done = true;
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
  SO.idx++;
  if (SO.idx >= SO.queue.length) {
    go('s-sociales');
    updateSubjectUI('sociales');
    return;
  }
  loadSocEx();
}
