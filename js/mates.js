/* =============================================
   MATES.JS — Matemáticas con ejercicios dinámicos
   Los problemas se cargan desde data/ejercicios-mates.json
   Las sumas, restas y multiplicaciones se generan en local
   ============================================= */

var opType  = 'sum';
var probVal = '';
var mixVal  = '';

// Banco de problemas cargado desde JSON
var PROBLEMAS_DB = { facil: [], medio: [], avanzado: [] };
var probIdx = { facil: 0, medio: 0, avanzado: 0 };
var currentProb = null;

// Cargar problemas al iniciar
fetch('data/ejercicios-mates.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    PROBLEMAS_DB = data;
    // Mezclar para que no salgan siempre en el mismo orden
    Object.keys(PROBLEMAS_DB).forEach(function(k) {
      PROBLEMAS_DB[k] = shuffle(PROBLEMAS_DB[k]);
    });
  })
  .catch(function(e) { console.warn('No se pudo cargar ejercicios-mates.json:', e); });

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

/* ---- GENERADOR LOCAL: Sumas y restas ----
   Genera operaciones adaptadas al nivel de dificultad */
function generarSuma(dificultad) {
  var max = dificultad === 'facil' ? 99 : dificultad === 'medio' ? 499 : 999;
  var a = Math.floor(Math.random() * max) + 10;
  var b = Math.floor(Math.random() * (max / 2)) + 5;
  return { a: a, b: b, resultado: a + b };
}

function generarResta(dificultad) {
  var max = dificultad === 'facil' ? 99 : dificultad === 'medio' ? 499 : 999;
  var resultado = Math.floor(Math.random() * (max / 2)) + 10;
  var b = Math.floor(Math.random() * resultado) + 1;
  var a = resultado + b;
  return { a: a, b: b, resultado: resultado };
}

/* ---- GENERADOR LOCAL: Multiplicaciones ---- */
function generarMulti(dificultad) {
  var maxA, maxB;
  if (dificultad === 'facil')    { maxA = 9;  maxB = 9;  }
  else if (dificultad === 'medio') { maxA = 12; maxB = 12; }
  else                           { maxA = 40; maxB = 12; }
  
  var a = Math.floor(Math.random() * maxA) + 2;
  var b = Math.floor(Math.random() * maxB) + 2;
  var resultado = a * b;
  
  // Generar 5 opciones incorrectas cercanas
  var opciones = new Set([resultado]);
  while (opciones.size < 6) {
    var wrong = resultado + (Math.floor(Math.random() * 20) - 10);
    if (wrong > 0 && wrong !== resultado) opciones.add(wrong);
  }
  var opcionesArr = shuffle(Array.from(opciones));
  
  return { a: a, b: b, resultado: resultado, opciones: opcionesArr };
}

/* ---- SUMAS Y RESTAS ---- */
var currentSuma = null;

function setOpType(t) {
  opType = t;
  document.getElementById('btn-sum').className = 'op-type-btn' + (t === 'sum' ? ' as' : '');
  document.getElementById('btn-res').className = 'op-type-btn' + (t === 'res' ? ' ar' : '');
  cargarNuevaSuma();
}

function cargarNuevaSuma() {
  var dl = diffLabel(ST.gramStreak); // reutilizar nivel
  var nivel = dl.txt === 'Fácil' ? 'facil' : dl.txt === 'Medio' ? 'medio' : 'avanzado';
  
  currentSuma = opType === 'sum' ? generarSuma(nivel) : generarResta(nivel);
  
  var sign = opType === 'sum' ? '+' : '−';
  var a = currentSuma.a.toString();
  var b = currentSuma.b.toString();
  
  // Renderizar la operación vertical
  var opBox = document.querySelector('#s-sumas .op-box');
  if (!opBox) return;
  
  // Elegir posición aleatoria del dígito que falta (unidades, decenas o centenas)
  var res = currentSuma.resultado.toString();
  var posOculta = Math.floor(Math.random() * res.length);
  currentSuma.posOculta = posOculta;
  currentSuma.digitoOculto = parseInt(res[posOculta]);
  
  // Construir filas
  var row1 = '', row2 = '';
  a.split('').forEach(function(d) { row1 += '<span>' + d + '</span>'; });
  b.split('').forEach(function(d) { row2 += '<span>' + d + '</span>'; });
  
  var rowRes = '';
  res.split('').forEach(function(d, i) {
    if (i === posOculta) {
      rowRes += '<div class="dbox active" id="mid-box">?</div>';
    } else {
      rowRes += '<div class="dbox correct">' + d + '</div>';
    }
  });
  
  opBox.innerHTML =
    '<div class="op-row">' + row1 + '</div>' +
    '<div class="op-row"><span class="op-sign" id="suma-sign">' + sign + '</span>' + row2 + '</div>' +
    '<div class="op-line"></div>' +
    '<div style="display:flex;justify-content:flex-end;gap:8px">' + rowRes + '</div>';
  
  document.getElementById('suma-sign').textContent = sign;
  document.getElementById('suma-qlbl').textContent = opType === 'sum' ? '¿Cuánto es esta suma?' : '¿Cuánto es esta resta?';
  document.getElementById('suma-fb').style.display = 'none';
  document.getElementById('suma-next').style.display = 'none';
}

function pickDigit(d) {
  var box = document.getElementById('mid-box');
  if (!box) return;
  if (d === null) { box.textContent = '?'; box.className = 'dbox active'; return; }
  box.textContent = d;
}

function checkSuma() {
  var box = document.getElementById('mid-box');
  if (!box || !currentSuma) return;
  var val = parseInt(box.textContent);
  var fb  = document.getElementById('suma-fb');
  var correct = currentSuma.digitoOculto;
  var key = opType === 'sum' ? 'suma' : 'resta';
  
  fb.style.display = 'block';
  if (val === correct) {
    box.className = 'dbox correct';
    fb.className  = 'feedback ok';
    fb.innerHTML  = '<div class="fbt">¡Perfecto! +10 pts 🎉</div><div class="fbs">' + currentSuma.a + (opType==='sum'?'+':'-') + currentSuma.b + '=' + currentSuma.resultado + ' ✓</div>';
    awardPts(10, 'mates');
    recordResult('mates', key, true);
    document.getElementById('suma-next').style.display = 'block';
  } else {
    box.className = 'dbox wrong';
    fb.className  = 'feedback bad';
    fb.innerHTML  = '<div class="fbt">¡Casi! La cifra era ' + correct + ' 💪</div><div class="fbs">Revisa columna a columna.</div>';
    recordResult('mates', key, false);
  }
}

/* ---- MULTIPLICACIONES ---- */
var currentMulti = null;

function cargarNuevaMulti() {
  var dl = diffLabel(ST.gramStreak);
  var nivel = dl.txt === 'Fácil' ? 'facil' : dl.txt === 'Medio' ? 'medio' : 'avanzado';
  currentMulti = generarMulti(nivel);
  
  var triSvg = document.querySelector('#s-multi svg');
  if (triSvg) {
    // Actualizar números del triángulo
    var texts = triSvg.querySelectorAll('text');
    if (texts.length >= 3) {
      texts[1].textContent = currentMulti.a;
      texts[2].textContent = currentMulti.b;
    }
  }
  
  var eqEl = document.querySelector('#s-multi p + p + p');
  if (eqEl) eqEl.innerHTML = currentMulti.a + ' × ' + currentMulti.b + ' = <span style="color:var(--purple-dark);font-weight:900;font-size:22px">?</span>';
  
  // Actualizar opciones
  var optsContainer = document.querySelector('.multi-opts');
  if (!optsContainer) return;
  optsContainer.innerHTML = '';
  currentMulti.opciones.forEach(function(v) {
    var d = document.createElement('div');
    d.className = 'mopt';
    d.textContent = v;
    d.onclick = function() { pickMult(d, v); };
    optsContainer.appendChild(d);
  });
  
  document.getElementById('multi-fb').style.display = 'none';
  document.getElementById('multi-next').style.display = 'none';
}

function pickMult(el, val) {
  document.querySelectorAll('.mopt').forEach(function(m) { m.className = 'mopt'; });
  var fb = document.getElementById('multi-fb');
  fb.style.display = 'block';
  if (val === currentMulti.resultado) {
    el.className = 'mopt mok';
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Genial! ' + currentMulti.a + '×' + currentMulti.b + '=' + currentMulti.resultado + ' 🌟 +10 pts</div>';
    awardPts(10, 'mates');
    recordResult('mates', 'multi', true);
    document.getElementById('multi-next').style.display = 'block';
  } else {
    el.className = 'mopt mbad';
    fb.className = 'feedback bad';
    fb.innerHTML = '<div class="fbt">No es ese... la respuesta era ' + currentMulti.resultado + ' 🤔</div><div class="fbs">Intenta contar de ' + currentMulti.a + ' en ' + currentMulti.a + '.</div>';
    recordResult('mates', 'multi', false);
  }
}

/* ---- PROBLEMAS ---- */
function cargarNuevoProblema() {
  var dl    = diffLabel(ST.gramStreak);
  var nivel = dl.txt === 'Fácil' ? 'facil' : dl.txt === 'Medio' ? 'medio' : 'avanzado';
  var banco = PROBLEMAS_DB[nivel];
  
  if (!banco || banco.length === 0) {
    // Fallback si el JSON no cargó
    currentProb = { enunciado: '🍎 María tiene 346 cromos. Le regala 128. ¿Cuántos le quedan?', resultado: 218 };
  } else {
    var idx = probIdx[nivel] % banco.length;
    currentProb = banco[idx];
    probIdx[nivel]++;
  }
  
  // Actualizar UI
  var body = document.getElementById('prob-card-body');
  if (body) body.innerHTML = currentProb.enunciado;
  var ansBox = document.getElementById('prob-ans');
  if (ansBox) { ansBox.textContent = '?'; ansBox.style.cssText = ''; }
  probVal = '';
  
  // Ocultar la operación preescrita (ahora la descubre la niña)
  var opDisplay = document.querySelector('.prob-op');
  if (opDisplay) opDisplay.style.display = 'none';
  
  document.getElementById('prob-fb').style.display = 'none';
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
  
  var correcto = parseInt(probVal) === currentProb.resultado;
  if (correcto) {
    box.style.background  = 'var(--green-light)';
    box.style.borderColor = 'var(--green)';
    box.style.color       = 'var(--green)';
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Correcto! La respuesta es ' + currentProb.resultado + ' 🎉 +15 pts</div>';
    awardPts(15, 'mates');
    recordResult('mates', 'prob', true);
    document.getElementById('prob-next').style.display = 'block';
  } else {
    box.style.background  = 'var(--red-light)';
    box.style.borderColor = 'var(--red)';
    box.style.color       = 'var(--red)';
    fb.className = 'feedback bad';
    fb.innerHTML = '<div class="fbt">Hmm, no es eso... 💪</div><div class="fbs">Lee el problema otra vez con calma. La respuesta no es ' + (probVal||'?') + '.</div>';
    recordResult('mates', 'prob', false);
  }
}

/* ---- MEZCLA ---- */
var mixVal = '';
var currentMix = null;

function cargarNuevaMezcla() {
  var tipo = random.choice ? random.choice(['suma','resta','multi']) :
    ['suma','resta','multi'][Math.floor(Math.random()*3)];
  var dl = diffLabel(ST.gramStreak);
  var nivel = dl.txt === 'Fácil' ? 'facil' : dl.txt === 'Medio' ? 'medio' : 'avanzado';
  
  tipo = ['suma','resta','multi'][Math.floor(Math.random()*3)];
  if (tipo === 'suma')  currentMix = Object.assign({tipo:'suma'},  generarSuma(nivel));
  else if (tipo === 'resta') currentMix = Object.assign({tipo:'resta'}, generarResta(nivel));
  else currentMix = Object.assign({tipo:'multi'}, generarMulti(nivel));
  
  var opBox = document.querySelector('#s-mix .op-box');
  if (!opBox) return;
  
  var html = '';
  if (currentMix.tipo === 'multi') {
    html = '<div class="op-row"><span>' + currentMix.a + '</span><span style="font-size:22px;color:var(--gray-400)">×</span><span>' + currentMix.b + '</span></div>';
  } else {
    var sign = currentMix.tipo === 'suma' ? '+' : '−';
    html  = '<div class="op-row">';
    currentMix.a.toString().split('').forEach(function(d){ html += '<span>'+d+'</span>'; });
    html += '</div><div class="op-row"><span class="op-sign">'+sign+'</span>';
    currentMix.b.toString().split('').forEach(function(d){ html += '<span>'+d+'</span>'; });
    html += '</div>';
  }
  html += '<div class="op-line"></div><div style="display:flex;justify-content:flex-end"><div class="dbox active" id="mix-box" style="width:90px">?</div></div>';
  opBox.innerHTML = html;
  
  mixVal = '';
  document.getElementById('mix-fb').style.display = 'none';
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
  var box = document.getElementById('mix-box');
  var fb  = document.getElementById('mix-fb');
  fb.style.display = 'block';
  
  if (parseInt(mixVal) === currentMix.resultado) {
    box.className = 'dbox correct';
    fb.className  = 'feedback ok';
    fb.innerHTML  = '<div class="fbt">¡Increíble! ' + currentMix.a + (currentMix.tipo==='multi'?'×':currentMix.tipo==='suma'?'+':'-') + currentMix.b + '=' + currentMix.resultado + ' 🚀 +10 pts</div>';
    awardPts(10, 'mates');
    recordResult('mates', 'mix', true);
    document.getElementById('mix-next').style.display = 'block';
  } else {
    box.className = 'dbox wrong';
    fb.className  = 'feedback bad';
    fb.innerHTML  = '<div class="fbt">Casi... la respuesta era ' + currentMix.resultado + ' 💪</div>';
    recordResult('mates', 'mix', false);
  }
}
