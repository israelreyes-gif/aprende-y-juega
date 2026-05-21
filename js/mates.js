/* =============================================
   MATES.JS — Matemáticas con ejercicios dinámicos
   Sistema de 2 intentos en TODOS los ejercicios:
   1er fallo → reintento, 2º fallo → revela respuesta
   ============================================= */

var opType  = 'sum';
var probVal = '';
var mixVal  = '';

// Contadores de intentos por tipo de ejercicio
var sumaIntentos  = 0;
var multiIntentos = 0;
var probIntentos  = 0;
var mixIntentos   = 0;

var PROBLEMAS_DB = { facil: [], medio: [], avanzado: [] };
var probIdx      = { facil: 0, medio: 0, avanzado: 0 };
var currentProb  = null;
var currentSuma  = null;
var currentMulti = null;
var currentMix   = null;

fetch('data/curso' + cursoActual + '/ejercicios-mates.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    PROBLEMAS_DB = data;
    Object.keys(PROBLEMAS_DB).forEach(function(k) {
      PROBLEMAS_DB[k] = shuffle(PROBLEMAS_DB[k]);
    });
  })
  .catch(function(e) { console.warn('No se cargó ejercicios-mates.json:', e); });

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
function generarSuma(nivel) {
  var max = nivel === 'facil' ? 99 : nivel === 'medio' ? 499 : 999;
  var a = Math.floor(Math.random() * max) + 10;
  var b = Math.floor(Math.random() * (max / 2)) + 5;
  return { a: a, b: b, resultado: a + b };
}

function generarResta(nivel) {
  var max = nivel === 'facil' ? 99 : nivel === 'medio' ? 499 : 999;
  var res = Math.floor(Math.random() * (max / 2)) + 10;
  var b   = Math.floor(Math.random() * res) + 1;
  return { a: res + b, b: b, resultado: res };
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

/* ============================================================
   SUMAS Y RESTAS — 2 intentos
   ============================================================ */
function setOpType(t) {
  opType = t;
  document.getElementById('btn-sum').className = 'op-type-btn' + (t === 'sum' ? ' as' : '');
  document.getElementById('btn-res').className = 'op-type-btn' + (t === 'res' ? ' ar' : '');
  cargarNuevaSuma();
}

function cargarNuevaSuma() {
  sumaIntentos = 0;
  currentSuma  = opType === 'sum' ? generarSuma(getNivel()) : generarResta(getNivel());
  var sign = opType === 'sum' ? '+' : '−';
  var res  = currentSuma.resultado.toString();
  var pos  = Math.floor(Math.random() * res.length);
  currentSuma.posOculta    = pos;
  currentSuma.digitoOculto = parseInt(res[pos]);

  var opBox = document.querySelector('#s-sumas .op-box');
  if (!opBox) return;

  var row1 = '', row2 = '', rowRes = '';
  currentSuma.a.toString().split('').forEach(function(d) { row1 += '<span>' + d + '</span>'; });
  currentSuma.b.toString().split('').forEach(function(d) { row2 += '<span>' + d + '</span>'; });
  res.split('').forEach(function(d, i) {
    rowRes += i === pos
      ? '<div class="dbox active" id="mid-box">?</div>'
      : '<div class="dbox correct">' + d + '</div>';
  });

  opBox.innerHTML =
    '<div class="op-row">' + row1 + '</div>' +
    '<div class="op-row"><span class="op-sign" id="suma-sign">' + sign + '</span>' + row2 + '</div>' +
    '<div class="op-line"></div>' +
    '<div style="display:flex;justify-content:flex-end;gap:8px">' + rowRes + '</div>';

  document.getElementById('suma-qlbl').textContent = opType === 'sum' ? '¿Cuánto es esta suma?' : '¿Cuánto es esta resta?';
  document.getElementById('suma-fb').style.display   = 'none';
  document.getElementById('suma-next').style.display = 'none';
}

function pickDigit(d) {
  var box = document.getElementById('mid-box');
  if (!box) return;
  if (d === null) { box.textContent = '?'; box.className = 'dbox active'; return; }
  box.textContent = d;
}

function checkSuma() {
  var box     = document.getElementById('mid-box');
  if (!box || !currentSuma) return;
  var val     = parseInt(box.textContent);
  var fb      = document.getElementById('suma-fb');
  var correct = currentSuma.digitoOculto;
  var key     = opType === 'sum' ? 'suma' : 'resta';
  var eq      = currentSuma.a + (opType === 'sum' ? '+' : '−') + currentSuma.b + '=' + currentSuma.resultado;
  fb.style.display = 'block';

  if (val === correct) {
    // ── ACIERTO ──
    box.className = 'dbox correct';
    fb.className  = 'feedback ok';
    fb.innerHTML  = '<div class="fbt">¡Perfecto, ' + (getNombre()||'campeona') + '! +10 pts 🎉</div><div class="fbs">' + eq + ' ✓</div>';
    awardPts(10, 'mates');
    recordResult('mates', key, true);
    setTimeout(function() { cargarNuevaSuma(); }, 1200);
  } else {
    sumaIntentos++;
    box.className = 'dbox wrong';
    if (sumaIntentos < 2) {
      // ── PRIMER FALLO: reintento ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡inténtalo de nuevo! 💪</div><div class="fbs">Revisa columna a columna.</div>';
      setTimeout(function() {
        box.textContent = '?'; box.className = 'dbox active';
        fb.style.display = 'none';
      }, 1500);
    } else {
      // ── SEGUNDO FALLO: revelar y continuar ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">La cifra correcta era <strong>' + correct + '</strong> 📖</div><div class="fbs">' + eq + '</div>';
      recordResult('mates', key, false);
      setTimeout(function() { cargarNuevaSuma(); }, 2200);
    }
  }
}

/* ============================================================
   MULTIPLICACIONES — modo continuo + 2 intentos
   ============================================================ */
function cargarNuevaMulti() {
  multiIntentos = 0;
  currentMulti  = generarMulti(getNivel());

  // Sincronizar triángulo SVG
  var svg = document.querySelector('#s-multi svg');
  if (svg) {
    var texts = svg.querySelectorAll('text');
    if (texts.length >= 3) {
      texts[0].textContent = '?';
      texts[1].textContent = currentMulti.a;
      texts[2].textContent = currentMulti.b;
    }
  }

  // Actualizar ecuación
  var eqs = document.querySelectorAll('#s-multi p');
  eqs.forEach(function(p) {
    if (p.textContent.indexOf('×') !== -1) {
      p.innerHTML = currentMulti.a + ' × ' + currentMulti.b +
        ' = <span style="color:var(--purple-dark);font-weight:900;font-size:22px">?</span>';
    }
  });

  // Actualizar opciones
  var cont = document.querySelector('#s-multi .multi-opts');
  if (!cont) return;
  cont.innerHTML = '';
  currentMulti.opciones.forEach(function(v) {
    var d = document.createElement('div');
    d.className = 'mopt';
    d.textContent = v;
    d.onclick = function() { pickMult(d, v); };
    cont.appendChild(d);
  });

  document.getElementById('multi-fb').style.display = 'none';
  var nextBtn = document.getElementById('multi-next');
  if (nextBtn) nextBtn.style.display = 'none';
}

function pickMult(el, val) {
  var fb = document.getElementById('multi-fb');
  fb.style.display = 'block';

  if (val === currentMulti.resultado) {
    // ── ACIERTO: siguiente automático ──
    document.querySelectorAll('.mopt').forEach(function(m) { m.className = 'mopt'; });
    el.className = 'mopt mok';
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Genial, ' + (getNombre()||'campeona') + '! ' + currentMulti.a + '×' + currentMulti.b + '=' + currentMulti.resultado + ' 🌟 +10 pts</div>';
    awardPts(10, 'mates');
    recordResult('mates', 'multi', true);
    setTimeout(function() { cargarNuevaMulti(); }, 1200);
  } else {
    multiIntentos++;
    el.className = 'mopt mbad';
    if (multiIntentos < 2) {
      // ── PRIMER FALLO: reintento ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es ese... ¡prueba otra vez! 🤔</div>';
      setTimeout(function() {
        el.className = 'mopt';
        fb.style.display = 'none';
      }, 1200);
    } else {
      // ── SEGUNDO FALLO: revelar y continuar ──
      document.querySelectorAll('.mopt').forEach(function(m) {
        if (parseInt(m.textContent) === currentMulti.resultado) m.className = 'mopt mok';
      });
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">La respuesta era <strong>' + currentMulti.resultado +
        '</strong> (' + currentMulti.a + '×' + currentMulti.b + ') 📖</div>';
      recordResult('mates', 'multi', false);
      setTimeout(function() { cargarNuevaMulti(); }, 2200);
    }
  }
}

/* ============================================================
   PROBLEMAS — 2 intentos
   ============================================================ */
function cargarNuevoProblema() {
  probIntentos = 0;
  var nivel    = getNivel();
  var banco    = PROBLEMAS_DB[nivel];
  if (!banco || banco.length === 0) {
    currentProb = { enunciado: '🍎 María tiene 346 cromos. Le regala 128. ¿Cuántos le quedan?', resultado: 218 };
  } else {
    currentProb = banco[probIdx[nivel] % banco.length];
    probIdx[nivel]++;
  }
  var body = document.getElementById('prob-card-body');
  if (body) body.innerHTML = currentProb.enunciado;
  var unidad = document.getElementById('prob-unidad');
  if (unidad) unidad.textContent = currentProb.unidad || 'unidades';
  var ansBox = document.getElementById('prob-ans');
  if (ansBox) { ansBox.textContent = '?'; ansBox.style.cssText = ''; }
  probVal = '';
  var opDisplay = document.querySelector('.prob-op');
  if (opDisplay) opDisplay.style.display = 'none';
  document.getElementById('prob-fb').style.display   = 'none';
  document.getElementById('prob-next').style.display = 'none';
}

function typeProb(k) {
  var box = document.getElementById('prob-ans');
  if (k === 'del') { probVal = probVal.slice(0, -1); }
  else { if (probVal.length < 6) probVal += k; }
  box.textContent = probVal || '?';
}

function checkProb() {
  if (!currentProb) return;
  var fb  = document.getElementById('prob-fb');
  var box = document.getElementById('prob-ans');
  fb.style.display = 'block';

  if (parseInt(probVal) === currentProb.resultado) {
    // ── ACIERTO ──
    box.style.background  = 'var(--green-light)';
    box.style.borderColor = 'var(--green)';
    box.style.color       = 'var(--green)';
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Correcto, ' + (getNombre()||'campeona') + '! ' + currentProb.resultado + ' 🎉 +15 pts</div>';
    awardPts(15, 'mates');
    recordResult('mates', 'prob', true);
    document.getElementById('prob-next').style.display = 'block';
  } else {
    probIntentos++;
    box.style.background  = 'var(--red-light)';
    box.style.borderColor = 'var(--red)';
    box.style.color       = 'var(--red)';
    if (probIntentos < 2) {
      // ── PRIMER FALLO: reintento ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡léelo otra vez con calma! 💪</div>';
      setTimeout(function() {
        probVal = '';
        box.textContent = '?'; box.style.cssText = '';
        fb.style.display = 'none';
      }, 1500);
    } else {
      // ── SEGUNDO FALLO: revelar ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">La respuesta correcta era <strong>' +
        currentProb.resultado + '</strong> 📖</div><div class="fbs">Guárdatela para la próxima.</div>';
      recordResult('mates', 'prob', false);
      document.getElementById('prob-next').style.display = 'block';
    }
  }
}

/* ============================================================
   MEZCLA — 2 intentos
   ============================================================ */
function cargarNuevaMezcla() {
  mixIntentos  = 0;
  var nivel    = getNivel();
  var tipo     = ['suma','resta','multi'][Math.floor(Math.random() * 3)];
  if (tipo === 'suma')       currentMix = Object.assign({ tipo: 'suma'  }, generarSuma(nivel));
  else if (tipo === 'resta') currentMix = Object.assign({ tipo: 'resta' }, generarResta(nivel));
  else                       currentMix = Object.assign({ tipo: 'multi' }, generarMulti(nivel));

  var opBox = document.querySelector('#s-mix .op-box');
  if (!opBox) return;
  var html = '';
  if (currentMix.tipo === 'multi') {
    html = '<div class="op-row"><span>' + currentMix.a +
      '</span><span style="font-size:22px;color:var(--gray-400)">×</span><span>' +
      currentMix.b + '</span></div>';
  } else {
    var sign = currentMix.tipo === 'suma' ? '+' : '−';
    html = '<div class="op-row">';
    currentMix.a.toString().split('').forEach(function(d) { html += '<span>' + d + '</span>'; });
    html += '</div><div class="op-row"><span class="op-sign">' + sign + '</span>';
    currentMix.b.toString().split('').forEach(function(d) { html += '<span>' + d + '</span>'; });
    html += '</div>';
  }
  html += '<div class="op-line"></div><div style="display:flex;justify-content:flex-end">' +
    '<div class="dbox active" id="mix-box" style="width:90px">?</div></div>';
  opBox.innerHTML = html;
  mixVal = '';
  document.getElementById('mix-fb').style.display   = 'none';
  document.getElementById('mix-next').style.display = 'none';
}

function typeMix(k) {
  var box = document.getElementById('mix-box');
  if (k === 'del') { mixVal = mixVal.slice(0, -1); }
  else { if (mixVal.length < 5) mixVal += k; }
  if (box) box.textContent = mixVal || '?';
}

function checkMix() {
  if (!currentMix) return;
  var box  = document.getElementById('mix-box');
  var fb   = document.getElementById('mix-fb');
  var sign = currentMix.tipo === 'multi' ? '×' : currentMix.tipo === 'suma' ? '+' : '−';
  fb.style.display = 'block';

  if (parseInt(mixVal) === currentMix.resultado) {
    // ── ACIERTO ──
    box.className = 'dbox correct';
    fb.className  = 'feedback ok';
    fb.innerHTML  = '<div class="fbt">¡Increíble, ' + (getNombre()||'campeona') + '! ' + currentMix.a + sign + currentMix.b + '=' + currentMix.resultado + ' 🚀 +10 pts</div>';
    awardPts(10, 'mates');
    recordResult('mates', 'mix', true);
    setTimeout(function() { cargarNuevaMezcla(); }, 1200);
  } else {
    mixIntentos++;
    box.className = 'dbox wrong';
    if (mixIntentos < 2) {
      // ── PRIMER FALLO: reintento ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡prueba otra vez! 💪</div>';
      setTimeout(function() {
        mixVal = ''; box.textContent = '?'; box.className = 'dbox active';
        fb.style.display = 'none';
      }, 1500);
    } else {
      // ── SEGUNDO FALLO: revelar y continuar ──
      box.className = 'dbox wrong';
      fb.className  = 'feedback bad';
      fb.innerHTML  = '<div class="fbt">La respuesta era <strong>' + currentMix.resultado +
        '</strong> (' + currentMix.a + sign + currentMix.b + ') 📖</div>';
      recordResult('mates', 'mix', false);
      setTimeout(function() { cargarNuevaMezcla(); }, 2200);
    }
  }
}
