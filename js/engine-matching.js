/* =============================================
   ENGINE-MATCHING.JS — Motor genérico para
   ejercicios de relacionar/emparejar columnas.

   Cualquier asignatura puede usarlo pasando:

   config = {
     pairs:      [ { left: 'texto', right: 'texto' }, ... ]
     prefix:     prefijo de IDs en el HTML (ej. 'soc-ex')
     subjectKey: clave en ST (ej. 'sociales')
     exerciseKey: clave para errors (ej. 'sociales-relacionar')
     (los puntos por acierto se leen de CONFIG.puntos segun exerciseKey,
     ya no se especifican en el config del motor)
     colors:     array de colores [ {border, bg, text}, ... ]
     onFinish:   función al terminar todos los ejercicios
     onCorrect:  fn(firstAttempt) — hook post-acierto (opcional)
     onWrong:    fn() — hook post-fallo final, 2º intento (opcional)
   }
   ============================================= */

var MC_DEFAULT_COLORS = [
  { border: '#7C3AED', bg: '#EDE9FE', text: '#4C1D95' },
  { border: '#0369A1', bg: '#E0F2FE', text: '#0C4A6E' },
  { border: '#B45309', bg: '#FEF3C7', text: '#78350F' },
  { border: '#BE123C', bg: '#FFE4E6', text: '#881337' }
];

function mcMatchInit(config) {
  var state = {
    config:     config,
    attempt:    1,
    done:       false,
    left:       null,        // item izquierdo seleccionado
    selections: {},          // { leftVal: { rightVal, colorIdx } }
    colorIdx:   0,
    matched:    []           // pares correctos ya bloqueados
  };

  var pairs     = config.pairs;
  var colors    = config.colors || MC_DEFAULT_COLORS;
  var container = document.getElementById(config.containerId);
  if (!container) return state;

  var leftItems  = pairs.map(function(p){ return p.left; });
  var rightItems = _mcMatchShuffle(pairs.map(function(p){ return p.right; }));

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px';
  grid.id = config.prefix + '-match-grid';

  leftItems.forEach(function(txt, i) {
    var lBtn = _mcMatchBtn(txt, 'left', 'var(--gray-700)');
    lBtn.addEventListener('click', function(){ _mcMatchClick(state, grid, colors, 'left', txt); });

    var rBtn = _mcMatchBtn(rightItems[i], 'right', 'var(--gray-500)');
    rBtn.addEventListener('click', function(){ _mcMatchClick(state, grid, colors, 'right', rightItems[i]); });

    grid.appendChild(lBtn);
    grid.appendChild(rBtn);
  });

  container.appendChild(grid);

  var checkBtn = document.createElement('button');
  checkBtn.id = config.prefix + '-match-check';
  checkBtn.style.cssText = 'width:100%;margin-top:12px;padding:13px 16px;border-radius:14px;border:none;background:var(--gray-200);color:var(--gray-400);font-family:var(--f);font-weight:800;font-size:15px;cursor:default;transition:all .2s';
  checkBtn.textContent = 'Comprobar ✓';
  checkBtn.disabled = true;
  checkBtn.addEventListener('click', function(){ _mcMatchCheck(state, grid, colors, checkBtn); });
  container.appendChild(checkBtn);

  return state;
}

function _mcMatchBtn(txt, side, color) {
  var btn = document.createElement('button');
  btn.dataset.side = side;
  btn.dataset.val  = txt;
  btn.style.cssText = 'padding:10px 8px;border-radius:10px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:12px;font-weight:' + (side === 'left' ? '700' : '600') + ';cursor:pointer;transition:all .15s;text-align:center;color:' + color;
  btn.textContent = txt;
  return btn;
}

function _mcMatchShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function _mcMatchClick(state, grid, colors, side, val) {
  if (state.done) return;
  var checkBtn = document.getElementById(state.config.prefix + '-match-check');

  if (side === 'left') {
    state.left = val;
    grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
      if (!b.dataset.colorIdx && !b.dataset.correct) {
        b.style.borderColor = b.dataset.val === val ? '#0F6E56' : 'var(--gray-200)';
        b.style.background  = b.dataset.val === val ? '#E1F5EE' : 'white';
        b.style.color       = b.dataset.val === val ? '#085041' : 'var(--gray-700)';
      }
    });
  } else if (state.left !== null) {
    var c = colors[state.colorIdx % colors.length];
    var leftVal = state.left;

    // Liberar derecho anterior si ya estaba asignado
    for (var lv in state.selections) {
      if (state.selections[lv].rightVal === val) {
        var oldLeft = lv;
        delete state.selections[oldLeft];
        grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
          if (b.dataset.val === oldLeft && !b.dataset.correct) {
            delete b.dataset.colorIdx;
            b.style.borderColor = 'var(--gray-200)'; b.style.background = 'white'; b.style.color = 'var(--gray-700)';
          }
        });
      }
    }

    // Liberar derecho si el izquierdo ya tenía asignación
    if (state.selections[leftVal]) {
      var oldRight = state.selections[leftVal].rightVal;
      grid.querySelectorAll('[data-side="right"]').forEach(function(b) {
        if (b.dataset.val === oldRight && !b.dataset.correct) {
          delete b.dataset.colorIdx;
          b.style.borderColor = 'var(--gray-200)'; b.style.background = 'white'; b.style.color = 'var(--gray-500)';
        }
      });
    } else {
      state.colorIdx++;
    }

    state.selections[leftVal] = { rightVal: val, colorIdx: state.colorIdx % colors.length };
    c = colors[state.selections[leftVal].colorIdx];

    grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
      if (b.dataset.val === leftVal && !b.dataset.correct) {
        b.dataset.colorIdx = state.selections[leftVal].colorIdx;
        b.style.borderColor = c.border; b.style.background = c.bg; b.style.color = c.text;
      }
    });
    grid.querySelectorAll('[data-side="right"]').forEach(function(b) {
      if (b.dataset.val === val && !b.dataset.correct) {
        b.dataset.colorIdx = state.selections[leftVal].colorIdx;
        b.style.borderColor = c.border; b.style.background = c.bg; b.style.color = c.text;
      }
    });

    state.left = null;
    grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
      if (!b.dataset.colorIdx && !b.dataset.correct) {
        b.style.borderColor = 'var(--gray-200)'; b.style.background = 'white'; b.style.color = 'var(--gray-700)';
      }
    });

    if (checkBtn && Object.keys(state.selections).length === state.config.pairs.length) {
      checkBtn.disabled = false;
      checkBtn.style.background = '#0F6E56';
      checkBtn.style.color = 'white';
      checkBtn.style.cursor = 'pointer';
    }
  }
}

function _mcMatchCheck(state, grid, colors, checkBtn) {
  if (state.done) return;
  var config   = state.config;
  var fbEl     = document.getElementById(config.prefix + '-fb');
  var nextBtn  = document.getElementById(config.prefix + '-next');
  var allCorrect = true;
  var wrongLefts = [];

  config.pairs.forEach(function(par) {
    var sel = state.selections[par.left];
    if (!sel || sel.rightVal !== par.right) {
      allCorrect = false;
      wrongLefts.push(par.left);
    }
  });

  var _p = configGetPts(config.exerciseKey);
  var ptsFirst  = _p.primero;
  var ptsSecond = _p.segundo;

  if (allCorrect) {
    state.done = true;
    grid.querySelectorAll('button').forEach(function(b) {
      b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4'; b.style.color = '#15803D'; b.disabled = true;
    });
    if (checkBtn) checkBtn.style.display = 'none';
    var pts = state.attempt === 1 ? ptsFirst : ptsSecond;
    if (fbEl) {
      fbEl.style.display = 'block';
      fbEl.className = 'feedback fb-ok';
      fbEl.textContent = '✅ ' + (state.attempt === 1 ? '¡Todos los pares correctos! +' + pts + ' pts 🎉' : '¡Bien, en el segundo intento! +' + pts + ' pts');
    }
    if (nextBtn) nextBtn.style.display = 'block';
    engineSaveProgress(config, true, state.attempt === 1);
    if (config.onCorrect) config.onCorrect(state.attempt === 1);

  } else if (state.attempt === 1) {
    state.attempt = 2;
    config.pairs.forEach(function(par) {
      var sel = state.selections[par.left];
      var isCorrect = sel && sel.rightVal === par.right;
      grid.querySelectorAll('button').forEach(function(b) {
        if (b.dataset.val === par.left || (sel && b.dataset.val === sel.rightVal && b.dataset.side === 'right')) {
          if (isCorrect) {
            b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4'; b.style.color = '#15803D'; b.disabled = true;
            b.dataset.correct = '1'; delete b.dataset.colorIdx;
          } else if (wrongLefts.indexOf(par.left) >= 0) {
            b.style.borderColor = '#EF4444'; b.style.background = '#FEF2F2'; b.style.color = '#B91C1C';
            delete b.dataset.colorIdx;
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
    wrongLefts.forEach(function(lv) {
      var sel = state.selections[lv];
      grid.querySelectorAll('button').forEach(function(b) {
        if (b.dataset.val === lv || (sel && b.dataset.val === sel.rightVal && b.dataset.side === 'right')) {
          delete b.dataset.colorIdx;
        }
      });
      delete state.selections[lv];
    });
    state.colorIdx = Object.keys(state.selections).length;
    state.left = null;
    if (fbEl) { fbEl.style.display = 'block'; fbEl.className = 'feedback fb-err'; fbEl.textContent = '❌ Algunos pares no son correctos — inténtalo de nuevo'; }
    if (checkBtn) { checkBtn.disabled = true; checkBtn.style.background = 'var(--gray-200)'; checkBtn.style.color = 'var(--gray-400)'; checkBtn.style.cursor = 'default'; }

  } else {
    state.done = true;
    grid.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
    config.pairs.forEach(function(par) {
      grid.querySelectorAll('[data-side="left"]').forEach(function(b) {
        if (b.dataset.val === par.left) { b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4'; b.style.color = '#15803D'; }
      });
      grid.querySelectorAll('[data-side="right"]').forEach(function(b) {
        if (b.dataset.val === par.right) { b.style.borderColor = '#22C55E'; b.style.background = '#F0FDF4'; b.style.color = '#15803D'; }
      });
    });
    if (checkBtn) checkBtn.style.display = 'none';
    if (fbEl) { fbEl.style.display = 'block'; fbEl.className = 'feedback fb-err'; fbEl.textContent = '❌ Aquí están los pares correctos'; }
    if (nextBtn) nextBtn.style.display = 'block';
    engineSaveProgress(config, false, false);
    if (config.onWrong) config.onWrong();
  }
}
