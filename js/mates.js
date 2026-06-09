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
function tieneCarry(a, b) {
  // Detecta si una suma tiene llevada en alguna columna
  var aS = a.toString(), bS = b.toString();
  var maxLen = Math.max(aS.length, bS.length);
  while (aS.length < maxLen) aS = '0' + aS;
  while (bS.length < maxLen) bS = '0' + bS;
  var carry = 0;
  for (var i = maxLen - 1; i >= 0; i--) {
    var s = parseInt(aS[i]) + parseInt(bS[i]) + carry;
    carry = s >= 10 ? 1 : 0;
  }
  // Tiene llevada si en alguna columna la suma supera 9
  carry = 0;
  for (var i = maxLen - 1; i >= 0; i--) {
    var s = parseInt(aS[i]) + parseInt(bS[i]) + carry;
    if (s >= 10) return true;
    carry = 0;
  }
  return false;
}

function tienePrestamo(a, b) {
  // Detecta si una resta tiene préstamo en alguna columna
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
  // Fácil: 3 dígitos, Medio: 3-4 dígitos, Difícil: 4 dígitos
  var conLlevada = Math.random() < 0.75; // 75% con llevada
  var a, b;
  var intentos = 0;
  do {
    if (nivel === 'facil') {
      a = Math.floor(Math.random() * 900) + 100;  // 100-999
      b = Math.floor(Math.random() * 900) + 100;
    } else if (nivel === 'medio') {
      // Mezcla 3 y 4 dígitos
      if (Math.random() < 0.5) {
        a = Math.floor(Math.random() * 900) + 100;
        b = Math.floor(Math.random() * 900) + 100;
      } else {
        a = Math.floor(Math.random() * 9000) + 1000;
        b = Math.floor(Math.random() * 4000) + 1000;
      }
    } else {
      a = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
      b = Math.floor(Math.random() * 4000) + 1000;
    }
    intentos++;
    if (intentos > 100) break;
  } while (tieneCarry(a, b) !== conLlevada);
  return { a: a, b: b, resultado: a + b };
}

function generarResta(nivel) {
  // Fácil: 3 dígitos, Medio: 3-4 dígitos, Difícil: 4 dígitos
  var conPrestamo = Math.random() < 0.75; // 75% con préstamo
  var a, b, res;
  var intentos = 0;
  do {
    if (nivel === 'facil') {
      b   = Math.floor(Math.random() * 800) + 100; // 100-899
      res = Math.floor(Math.random() * (999 - b - 100)) + 100; // resultado mínimo 100
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
  currentSuma.respuestaUsuario = '';
  var sign = opType === 'sum' ? '+' : '−';
  var res  = currentSuma.resultado.toString();

  var opBox = document.querySelector('#s-sumas .op-box');
  if (!opBox) return;

  var row1 = '', row2 = '', rowRes = '';
  currentSuma.a.toString().split('').forEach(function(d) { row1 += '<span>' + d + '</span>'; });
  currentSuma.b.toString().split('').forEach(function(d) { row2 += '<span>' + d + '</span>'; });
  // Mostrar todos los dígitos como ? — el activo es el de más a la derecha primero
  res.split('').forEach(function(d, i) {
    rowRes += '<div class="dbox" id="res-box-' + i + '">?</div>';
  });
  // Empezar desde la derecha (último dígito)
  currentSuma.posActual = res.length - 1;

  opBox.innerHTML =
    '<div class="op-row">' + row1 + '</div>' +
    '<div class="op-row"><span class="op-sign" id="suma-sign">' + sign + '</span>' + row2 + '</div>' +
    '<div class="op-line"></div>' +
    '<div style="display:flex;justify-content:flex-end;gap:8px" id="res-row">' + rowRes + '</div>';

  // Activar el dígito más a la derecha primero
  var firstBox = document.getElementById('res-box-' + (res.length - 1));
  if (firstBox) firstBox.className = 'dbox active';

  document.getElementById('suma-qlbl').textContent = opType === 'sum' ? '¿Cuánto es esta suma?' : '¿Cuánto es esta resta?';
  document.getElementById('suma-fb').style.display   = 'none';
  document.getElementById('suma-next').style.display = 'none';
}

function pickDigit(d) {
  if (!currentSuma) return;
  var res = currentSuma.resultado.toString();
  var pos = currentSuma.posActual; // pos va de derecha (res.length-1) a izquierda (0)

  if (d === null) {
    // Borrar último dígito introducido — el más a la derecha ya rellenado
    var ultimoRelleno = pos + 1; // pos apunta al siguiente a rellenar (izquierda), el último rellenado es pos+1
    if (ultimoRelleno <= res.length - 1) {
      // Quitar el dígito relleno más a la derecha
      var borrar = document.getElementById('res-box-' + ultimoRelleno);
      if (borrar) { borrar.textContent = '?'; borrar.className = 'dbox active'; }
      // Desactivar el que estaba activo
      var activo = document.getElementById('res-box-' + pos);
      if (activo) activo.className = 'dbox';
      currentSuma.posActual = ultimoRelleno;
      currentSuma.respuestaUsuario = currentSuma.respuestaUsuario.slice(1); // quitar el primero (más a la derecha se añadió al principio)
    }
    return;
  }

  if (pos < 0) return; // ya completo

  var box = document.getElementById('res-box-' + pos);
  if (box) { box.textContent = d; box.className = 'dbox'; }

  // Guardar dígito — se añade al principio porque vamos de derecha a izquierda
  currentSuma.respuestaUsuario = d.toString() + currentSuma.respuestaUsuario;
  currentSuma.posActual--;

  // Activar siguiente dígito hacia la izquierda
  if (currentSuma.posActual >= 0) {
    var nextBox = document.getElementById('res-box-' + currentSuma.posActual);
    if (nextBox) nextBox.className = 'dbox active';
  }
}

function checkSuma() {
  if (!currentSuma) return;
  var res = currentSuma.resultado.toString();
  if (currentSuma.respuestaUsuario.length < res.length) {
    showToast('✏️ Escribe todos los dígitos del resultado');
    return;
  }
  var fb      = document.getElementById('suma-fb');
  var correct = currentSuma.resultado.toString();
  var usuario = currentSuma.respuestaUsuario;
  var key     = opType === 'sum' ? 'suma' : 'resta';
  var eq      = currentSuma.a + (opType === 'sum' ? '+' : '−') + currentSuma.b + '=' + currentSuma.resultado;
  fb.style.display = 'block';

  if (usuario === correct) {
    // ── ACIERTO: marcar todos en verde ──
    correct.split('').forEach(function(d, i) {
      var b = document.getElementById('res-box-' + i);
      if (b) b.className = 'dbox correct';
    });
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Perfecto, ' + (getNombre()||'campeona') + '! +10 pts 🎉</div><div class="fbs">' + eq + ' ✓</div>';
    awardPts(10, 'mates');
    recordResult('mates', key, true);
    document.getElementById('suma-next').style.display = 'block';
  } else {
    sumaIntentos++;
    // Marcar dígitos correctos e incorrectos
    var todosCorrectos = true;
    usuario.split('').forEach(function(d, i) {
      var b = document.getElementById('res-box-' + i);
      if (b) b.className = d === correct[i] ? 'dbox correct' : 'dbox wrong';
    });

    if (sumaIntentos < 2) {
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡inténtalo de nuevo! 💪</div><div class="fbs">Fíjate en los dígitos en rojo.</div>';
      setTimeout(function() {
        // Resetear para reintento — activar dígito más a la derecha
        currentSuma.respuestaUsuario = '';
        currentSuma.posActual = correct.length - 1;
        correct.split('').forEach(function(d, i) {
          var b = document.getElementById('res-box-' + i);
          if (b) { b.textContent = '?'; b.className = i === correct.length - 1 ? 'dbox active' : 'dbox'; }
        });
        fb.style.display = 'none';
      }, 1500);
    } else {
      // ── SEGUNDO FALLO: revelar resultado ──
      correct.split('').forEach(function(d, i) {
        var b = document.getElementById('res-box-' + i);
        if (b) { b.textContent = d; b.className = 'dbox correct'; }
      });
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">El resultado correcto era <strong>' + correct + '</strong> 📖</div><div class="fbs">' + eq + '</div>';
      recordResult('mates', key, false);
      document.getElementById('suma-next').style.display = 'block';
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
    document.getElementById('multi-next').style.display = 'block';
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
      document.getElementById('multi-next').style.display = 'block';
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
  mixIntentos = 0;
  var nivel   = getNivel();
  var tipo    = ['suma','resta','multi'][Math.floor(Math.random() * 3)];
  if (tipo === 'suma')       currentMix = Object.assign({ tipo:'suma'  }, generarSuma(nivel));
  else if (tipo === 'resta') currentMix = Object.assign({ tipo:'resta' }, generarResta(nivel));
  else                       currentMix = Object.assign({ tipo:'multi' }, generarMulti(nivel));

  currentMix.respuestaUsuario = '';
  var res = currentMix.resultado.toString();

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

  // Dígitos del resultado como ?
  var rowRes = '';
  res.split('').forEach(function(d, i) {
    rowRes += '<div class="dbox" id="mix-box-' + i + '">?</div>';
  });
  currentMix.posActual = res.length - 1; // empezar por la derecha

  html += '<div class="op-line"></div><div style="display:flex;justify-content:flex-end;gap:8px">' + rowRes + '</div>';
  opBox.innerHTML = html;

  // Activar primer dígito (más a la derecha)
  var firstBox = document.getElementById('mix-box-' + (res.length - 1));
  if (firstBox) firstBox.className = 'dbox active';

  document.getElementById('mix-fb').style.display   = 'none';
  document.getElementById('mix-next').style.display = 'none';
}

function typeMix(k) {
  if (!currentMix) return;
  var res = currentMix.resultado.toString();
  var pos = currentMix.posActual;

  if (k === 'del') {
    var ultimoRelleno = pos + 1;
    if (ultimoRelleno <= res.length - 1) {
      var borrar = document.getElementById('mix-box-' + ultimoRelleno);
      if (borrar) { borrar.textContent = '?'; borrar.className = 'dbox active'; }
      var activo = document.getElementById('mix-box-' + pos);
      if (activo) activo.className = 'dbox';
      currentMix.posActual = ultimoRelleno;
      currentMix.respuestaUsuario = currentMix.respuestaUsuario.slice(1);
    }
    return;
  }

  if (pos < 0) return;
  var box = document.getElementById('mix-box-' + pos);
  if (box) { box.textContent = k; box.className = 'dbox'; }
  currentMix.respuestaUsuario = k.toString() + currentMix.respuestaUsuario;
  currentMix.posActual--;
  if (currentMix.posActual >= 0) {
    var nextBox = document.getElementById('mix-box-' + currentMix.posActual);
    if (nextBox) nextBox.className = 'dbox active';
  }
}

function checkMix() {
  if (!currentMix) return;
  var res  = currentMix.resultado.toString();
  if (currentMix.respuestaUsuario.length < res.length) {
    showToast('✏️ Escribe todos los dígitos del resultado');
    return;
  }
  var fb   = document.getElementById('mix-fb');
  var sign = currentMix.tipo === 'multi' ? '×' : currentMix.tipo === 'suma' ? '+' : '−';
  var eq   = currentMix.a + sign + currentMix.b + '=' + currentMix.resultado;
  fb.style.display = 'block';

  if (currentMix.respuestaUsuario === res) {
    // ── ACIERTO: marcar todos en verde ──
    res.split('').forEach(function(d, i) {
      var b = document.getElementById('mix-box-' + i);
      if (b) b.className = 'dbox correct';
    });
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Increíble, ' + (getNombre()||'campeona') + '! ' + eq + ' 🚀 +10 pts</div>';
    awardPts(10, 'mates');
    recordResult('mates', 'mix', true);
    document.getElementById('mix-next').style.display = 'block';
  } else {
    mixIntentos++;
    currentMix.respuestaUsuario.split('').forEach(function(d, i) {
      var b = document.getElementById('mix-box-' + i);
      if (b) b.className = d === res[i] ? 'dbox correct' : 'dbox wrong';
    });
    if (mixIntentos < 2) {
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡prueba otra vez! 💪</div><div class="fbs">Fíjate en los dígitos en rojo.</div>';
      setTimeout(function() {
        currentMix.respuestaUsuario = '';
        currentMix.posActual = res.length - 1;
        res.split('').forEach(function(d, i) {
          var b = document.getElementById('mix-box-' + i);
          if (b) { b.textContent = '?'; b.className = i === res.length-1 ? 'dbox active' : 'dbox'; }
        });
        fb.style.display = 'none';
      }, 1500);
    } else {
      res.split('').forEach(function(d, i) {
        var b = document.getElementById('mix-box-' + i);
        if (b) { b.textContent = d; b.className = 'dbox correct'; }
      });
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">La respuesta era <strong>' + res + '</strong> (' + eq + ') 📖</div>';
      recordResult('mates', 'mix', false);
      document.getElementById('mix-next').style.display = 'block';
    }
  }
}
