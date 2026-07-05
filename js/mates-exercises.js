/* =============================================
   MATES-EXERCISES.JS — Matemáticas
   Generadores + Sumas, Restas, Multiplicaciones,
   Problemas y Mezcla usando engine-mates.js
   ============================================= */

var M = ExerciseState.mates; /* alias corto */

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function getNivel() {
  var dl = diffLabel(ST.matesStreak);
  return dl.txt === 'Fácil' ? 'facil' : dl.txt === 'Medio' ? 'medio' : 'avanzado';
}

/* ---- Generadores ---- */
function tieneCarry(a, b) {
  var aS = a.toString(), bS = b.toString();
  var maxLen = Math.max(aS.length, bS.length);
  while (aS.length < maxLen) aS = '0' + aS;
  while (bS.length < maxLen) bS = '0' + bS;
  var carry = 0;
  for (var i = maxLen - 1; i >= 0; i--) {
    var s = parseInt(aS[i]) + parseInt(bS[i]) + carry;
    if (s >= 10) return true;
    carry = 0;
  }
  return false;
}

function tienePrestamo(a, b) {
  var aS = a.toString(), bS = b.toString();
  var maxLen = Math.max(aS.length, bS.length);
  while (aS.length < maxLen) aS = '0' + aS;
  while (bS.length < maxLen) bS = '0' + bS;
  for (var i = maxLen - 1; i >= 0; i--) {
    if (parseInt(aS[i]) < parseInt(bS[i])) return true;
  }
  return false;
}

function generarSuma(nivel) {
  var conLlevada = Math.random() < 0.75;
  var a, b, intentos = 0;
  do {
    if (nivel === 'facil') {
      a = Math.floor(Math.random() * 900) + 100;
      b = Math.floor(Math.random() * 900) + 100;
    } else if (nivel === 'medio') {
      if (Math.random() < 0.5) {
        a = Math.floor(Math.random() * 900) + 100;
        b = Math.floor(Math.random() * 900) + 100;
      } else {
        a = Math.floor(Math.random() * 9000) + 1000;
        b = Math.floor(Math.random() * 4000) + 1000;
      }
    } else {
      a = Math.floor(Math.random() * 9000) + 1000;
      b = Math.floor(Math.random() * 4000) + 1000;
    }
    intentos++;
    if (intentos > 100) break;
  } while (tieneCarry(a, b) !== conLlevada);
  return { a: a, b: b, resultado: a + b };
}

function generarResta(nivel) {
  var conPrestamo = Math.random() < 0.75;
  var a, b, res, intentos = 0;
  do {
    if (nivel === 'facil') {
      b   = Math.floor(Math.random() * 800) + 100;
      res = Math.floor(Math.random() * (999 - b - 100)) + 100;
      a   = res + b;
    } else if (nivel === 'medio') {
      if (Math.random() < 0.5) {
        b   = Math.floor(Math.random() * 800) + 100;
        res = Math.floor(Math.random() * (999 - b)) + 1;
        a   = res + b;
      } else {
        b   = Math.floor(Math.random() * 3000) + 1000;
        res = Math.floor(Math.random() * 3000) + 500;
        a   = res + b;
      }
    } else {
      b   = Math.floor(Math.random() * 4000) + 1000;
      res = Math.floor(Math.random() * 4000) + 1000;
      a   = res + b;
    }
    intentos++;
    if (intentos > 100) break;
  } while (tienePrestamo(a, b) !== conPrestamo);
  return { a: a, b: b, resultado: res };
}

function generarMulti(nivel) {
  var maxA = nivel === 'facil' ? 9 : nivel === 'medio' ? 12 : 40;
  var maxB = nivel === 'facil' ? 9 : 12;
  var a = Math.floor(Math.random() * maxA) + 2;
  var b = Math.floor(Math.random() * maxB) + 2;
  var resultado = a * b;
  var opts = new Set([resultado]);
  while (opts.size < 6) {
    var w = resultado + (Math.floor(Math.random() * 20) - 10);
    if (w > 0 && w !== resultado) opts.add(w);
  }
  return { a: a, b: b, resultado: resultado, opciones: shuffle(Array.from(opts)) };
}

/* ---- Helpers de renderizado ---- */
function _renderSumaOp(ex, container) {
  var sign = M.opType === 'sum' ? '+' : '−';
  var res  = ex.resultado.toString();
  var row1 = '', row2 = '', rowRes = '';
  ex.a.toString().split('').forEach(function(d) { row1 += '<span>' + d + '</span>'; });
  ex.b.toString().split('').forEach(function(d) { row2 += '<span>' + d + '</span>'; });
  res.split('').forEach(function(d, i) {
    rowRes += '<div class="dbox" id="suma-box-' + i + '">?</div>';
  });
  container.innerHTML =
    '<div class="op-row">' + row1 + '</div>' +
    '<div class="op-row"><span class="op-sign" id="suma-sign">' + sign + '</span>' + row2 + '</div>' +
    '<div class="op-line"></div>' +
    '<div style="display:flex;justify-content:flex-end;gap:8px" id="suma-res-row">' + rowRes + '</div>';
}

function _renderMultiOp(ex, container) {
  var svg = document.querySelector('#s-multi svg');
  if (svg) {
    var texts = svg.querySelectorAll('text');
    if (texts.length >= 3) { texts[0].textContent = '?'; texts[1].textContent = ex.a; texts[2].textContent = ex.b; }
  }
  var eqs = document.querySelectorAll('#s-multi p');
  eqs.forEach(function(p) {
    if (p.textContent.indexOf('×') !== -1) {
      p.innerHTML = ex.a + ' × ' + ex.b + ' = <span style="color:var(--purple-dark);font-weight:900;font-size:22px">?</span>';
    }
  });
}

function _renderMixOp(ex, container) {
  var res = ex.resultado.toString();
  var html = '';
  if (ex.tipo === 'multi') {
    html = '<div class="op-row"><span>' + ex.a + '</span><span style="font-size:22px;color:var(--gray-400)">×</span><span>' + ex.b + '</span></div>';
  } else {
    var sign = ex.tipo === 'suma' ? '+' : '−';
    html = '<div class="op-row">';
    ex.a.toString().split('').forEach(function(d) { html += '<span>' + d + '</span>'; });
    html += '</div><div class="op-row"><span class="op-sign">' + sign + '</span>';
    ex.b.toString().split('').forEach(function(d) { html += '<span>' + d + '</span>'; });
    html += '</div>';
  }
  var rowRes = '';
  res.split('').forEach(function(d, i) {
    rowRes += '<div class="dbox" id="mix-box-' + i + '">?</div>';
  });
  html += '<div class="op-line"></div><div style="display:flex;justify-content:flex-end;gap:8px" id="mix-res-row">' + rowRes + '</div>';
  container.innerHTML = html;
}

/* ============================================================
   SUMAS Y RESTAS
   ============================================================ */
function setOpType(t) {
  M.opType = t;
  document.getElementById('btn-sum').className = 'op-type-btn' + (t === 'sum' ? ' as' : '');
  document.getElementById('btn-res').className = 'op-type-btn' + (t === 'res' ? ' ar' : '');
  cargarNuevaSuma();
}

function cargarNuevaSuma() {
  var key = M.opType === 'sum' ? 'suma' : 'resta';
  var sign = M.opType === 'sum' ? '+' : '−';
  matesStart({
    generate:    function() { return M.opType === 'sum' ? generarSuma(getNivel()) : generarResta(getNivel()); },
    inputType:   'digits',
    prefix:      'suma',
    subjectKey:  'mates',
    exerciseKey: 'mates-' + key,
    ptsFirst:    10,
    ptsSecond:   5,
    renderOp:    _renderSumaOp,
    correctMsg:  function(pts, ex) {
      var eq = ex.a + sign + ex.b + '=' + ex.resultado;
      return '<div class="fbt">¡Perfecto, ' + (getNombre()||'campeona') + '! +' + pts + ' pts 🎉</div><div class="fbs">' + eq + ' ✓</div>';
    },
    wrongMsg: function(ex) {
      var eq = ex.a + sign + ex.b + '=' + ex.resultado;
      return '<div class="fbt">El resultado correcto era <strong>' + ex.resultado + '</strong> 📖</div><div class="fbs">' + eq + '</div>';
    },
    onLoad: function() {
      document.getElementById('suma-qlbl').textContent = M.opType === 'sum' ? '¿Cuánto es esta suma?' : '¿Cuánto es esta resta?';
    }
  });
}

function pickDigit(d)  { matesPickDigit(d); }
function checkSuma()   { matesCheckDigits(); }

/* ============================================================
   MULTIPLICACIONES
   ============================================================ */
function cargarNuevaMulti() {
  matesStart({
    generate:   function() { return generarMulti(getNivel()); },
    inputType:  'options',
    prefix:     'multi',
    subjectKey: 'mates',
    exerciseKey:'mates-multi',
    ptsFirst:   10,
    ptsSecond:  5,
    renderOp:   _renderMultiOp,
    correctMsg: function(pts, ex) {
      return '<div class="fbt">¡Genial, ' + (getNombre()||'campeona') + '! ' + ex.a + '×' + ex.b + '=' + ex.resultado + ' 🌟 +' + pts + ' pts</div>';
    },
    wrongMsg: function(ex) {
      return '<div class="fbt">La respuesta era <strong>' + ex.resultado + '</strong> (' + ex.a + '×' + ex.b + ') 📖</div>';
    }
  });
}

function pickMult(el, val) { matesPickOption(el, val); }

/* ============================================================
   PROBLEMAS
   ============================================================ */
function cargarNuevoProblema() {
  matesStart({
    generate: function() {
      var nivel = getNivel();
      var banco = SubjectData.problemas[nivel];
      var prob;
      if (!banco || banco.length === 0) {
        prob = { enunciado: '🍎 María tiene 346 cromos. Le regala 128. ¿Cuántos le quedan?', resultado: 218 };
      } else {
        prob = banco[M.probIdx[nivel] % banco.length];
        M.probIdx[nivel]++;
      }
      return prob;
    },
    inputType:  'free',
    prefix:     'prob',
    subjectKey: 'mates',
    exerciseKey:'mates-prob',
    ptsFirst:   15,
    ptsSecond:  7,
    renderOp:   function(ex) {
      var body = document.getElementById('prob-card-body');
      if (body) body.innerHTML = ex.enunciado;
      var unidad = document.getElementById('prob-unidad');
      if (unidad) unidad.textContent = ex.unidad || 'unidades';
      var opDisplay = document.querySelector('.prob-op');
      if (opDisplay) opDisplay.style.display = 'none';
    },
    correctMsg: function(pts, ex) {
      return '<div class="fbt">¡Correcto, ' + (getNombre()||'campeona') + '! ' + ex.resultado + ' 🎉 +' + pts + ' pts</div>';
    },
    wrongMsg: function(ex) {
      return '<div class="fbt">La respuesta correcta era <strong>' + ex.resultado + '</strong> 📖</div><div class="fbs">Guárdatela para la próxima.</div>';
    }
  });
}

function typeProb(k)  { matesTypeKey(k); }
function checkProb()  { matesCheckFree(); }

/* ============================================================
   MEZCLA
   ============================================================ */
function cargarNuevaMezcla() {
  matesStart({
    generate: function() {
      var nivel = getNivel();
      var tipo  = ['suma','resta','multi'][Math.floor(Math.random() * 3)];
      var ex;
      if (tipo === 'suma')       ex = Object.assign({ tipo:'suma'  }, generarSuma(nivel));
      else if (tipo === 'resta') ex = Object.assign({ tipo:'resta' }, generarResta(nivel));
      else                       ex = Object.assign({ tipo:'multi' }, generarMulti(nivel));
      return ex;
    },
    inputType:  'digits',
    prefix:     'mix',
    subjectKey: 'mates',
    exerciseKey:'mates-mix',
    ptsFirst:   10,
    ptsSecond:  5,
    renderOp:   _renderMixOp,
    correctMsg: function(pts, ex) {
      var sign = ex.tipo === 'multi' ? '×' : ex.tipo === 'suma' ? '+' : '−';
      var eq = ex.a + sign + ex.b + '=' + ex.resultado;
      return '<div class="fbt">¡Increíble, ' + (getNombre()||'campeona') + '! ' + eq + ' 🚀 +' + pts + ' pts</div>';
    },
    wrongMsg: function(ex) {
      var sign = ex.tipo === 'multi' ? '×' : ex.tipo === 'suma' ? '+' : '−';
      var eq = ex.a + sign + ex.b + '=' + ex.resultado;
      return '<div class="fbt">La respuesta era <strong>' + ex.resultado + '</strong> (' + eq + ') 📖</div>';
    }
  });
}

function typeMix(k)   { matesTypeKey(k); }
function checkMix()   { matesCheckDigits(); }
