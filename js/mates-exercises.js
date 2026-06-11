/* =============================================
   MATES-EXERCISES.JS — Sumas, Multiplicaciones, Problemas, Mezcla
   ============================================= */

/* ============================================================
   SUMAS Y RESTAS — 2 intentos
   ============================================================ */
function setOpType(t) {
  M.opType = t;
  document.getElementById('btn-sum').className = 'op-type-btn' + (t === 'sum' ? ' as' : '');
  document.getElementById('btn-res').className = 'op-type-btn' + (t === 'res' ? ' ar' : '');
  cargarNuevaSuma();
}

function cargarNuevaSuma() {
  M.sumaIntentos = 0;
  M.currentSuma  = M.opType === 'sum' ? generarSuma(getNivel()) : generarResta(getNivel());
  M.currentSuma.respuestaUsuario = '';
  var sign = M.opType === 'sum' ? '+' : '−';
  var res  = M.currentSuma.resultado.toString();

  var opBox = document.querySelector('#s-sumas .op-box');
  if (!opBox) return;

  var row1 = '', row2 = '', rowRes = '';
  M.currentSuma.a.toString().split('').forEach(function(d) { row1 += '<span>' + d + '</span>'; });
  M.currentSuma.b.toString().split('').forEach(function(d) { row2 += '<span>' + d + '</span>'; });
  // Mostrar todos los dígitos como ? — el activo es el de más a la derecha primero
  res.split('').forEach(function(d, i) {
    rowRes += '<div class="dbox" id="res-box-' + i + '">?</div>';
  });
  // Empezar desde la derecha (último dígito)
  M.currentSuma.posActual = res.length - 1;

  opBox.innerHTML =
    '<div class="op-row">' + row1 + '</div>' +
    '<div class="op-row"><span class="op-sign" id="suma-sign">' + sign + '</span>' + row2 + '</div>' +
    '<div class="op-line"></div>' +
    '<div style="display:flex;justify-content:flex-end;gap:8px" id="res-row">' + rowRes + '</div>';

  // Activar el dígito más a la derecha primero
  var firstBox = document.getElementById('res-box-' + (res.length - 1));
  if (firstBox) firstBox.className = 'dbox active';

  document.getElementById('suma-qlbl').textContent = M.opType === 'sum' ? '¿Cuánto es esta suma?' : '¿Cuánto es esta resta?';
  document.getElementById('suma-fb').style.display   = 'none';
  document.getElementById('suma-next').style.display = 'none';
}

function pickDigit(d) {
  if (!M.currentSuma) return;
  var res = M.currentSuma.resultado.toString();
  var pos = M.currentSuma.posActual; // pos va de derecha (res.length-1) a izquierda (0)

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
      M.currentSuma.posActual = ultimoRelleno;
      M.currentSuma.respuestaUsuario = M.currentSuma.respuestaUsuario.slice(1); // quitar el primero (más a la derecha se añadió al principio)
    }
    return;
  }

  if (pos < 0) return; // ya completo

  var box = document.getElementById('res-box-' + pos);
  if (box) { box.textContent = d; box.className = 'dbox'; }

  // Guardar dígito — se añade al principio porque vamos de derecha a izquierda
  M.currentSuma.respuestaUsuario = d.toString() + M.currentSuma.respuestaUsuario;
  M.currentSuma.posActual--;

  // Activar siguiente dígito hacia la izquierda
  if (M.currentSuma.posActual >= 0) {
    var nextBox = document.getElementById('res-box-' + M.currentSuma.posActual);
    if (nextBox) nextBox.className = 'dbox active';
  }
}

function checkSuma() {
  if (!M.currentSuma) return;
  var res = M.currentSuma.resultado.toString();
  if (M.currentSuma.respuestaUsuario.length < res.length) {
    showToast('✏️ Escribe todos los dígitos del resultado');
    return;
  }
  var fb      = document.getElementById('suma-fb');
  var correct = M.currentSuma.resultado.toString();
  var usuario = M.currentSuma.respuestaUsuario;
  var key     = M.opType === 'sum' ? 'suma' : 'resta';
  var eq      = M.currentSuma.a + (M.opType === 'sum' ? '+' : '−') + M.currentSuma.b + '=' + M.currentSuma.resultado;
  fb.style.display = 'block';

  if (usuario === correct) {
    // ── ACIERTO: marcar todos en verde ──
    correct.split('').forEach(function(d, i) {
      var b = document.getElementById('res-box-' + i);
      if (b) b.className = 'dbox correct';
    });
    var sumaPts = M.sumaIntentos === 0 ? 10 : 5;
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Perfecto, ' + (getNombre()||'campeona') + '! +' + sumaPts + ' pts 🎉</div><div class="fbs">' + eq + ' ✓</div>';
    awardPts(sumaPts, 'mates');
    recordResult('mates', key, true);
    document.getElementById('suma-next').style.display = 'block';
  } else {
    M.sumaIntentos++;
    // Marcar dígitos correctos e incorrectos
    var todosCorrectos = true;
    usuario.split('').forEach(function(d, i) {
      var b = document.getElementById('res-box-' + i);
      if (b) b.className = d === correct[i] ? 'dbox correct' : 'dbox wrong';
    });

    if (M.sumaIntentos < 2) {
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡inténtalo de nuevo! 💪</div><div class="fbs">Fíjate en los dígitos en rojo.</div>';
      setTimeout(function() {
        // Resetear para reintento — activar dígito más a la derecha
        M.currentSuma.respuestaUsuario = '';
        M.currentSuma.posActual = correct.length - 1;
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
  M.multiIntentos = 0;
  M.currentMulti  = generarMulti(getNivel());

  // Sincronizar triángulo SVG
  var svg = document.querySelector('#s-multi svg');
  if (svg) {
    var texts = svg.querySelectorAll('text');
    if (texts.length >= 3) {
      texts[0].textContent = '?';
      texts[1].textContent = M.currentMulti.a;
      texts[2].textContent = M.currentMulti.b;
    }
  }

  // Actualizar ecuación
  var eqs = document.querySelectorAll('#s-multi p');
  eqs.forEach(function(p) {
    if (p.textContent.indexOf('×') !== -1) {
      p.innerHTML = M.currentMulti.a + ' × ' + M.currentMulti.b +
        ' = <span style="color:var(--purple-dark);font-weight:900;font-size:22px">?</span>';
    }
  });

  // Actualizar opciones
  var cont = document.querySelector('#s-multi .multi-opts');
  if (!cont) return;
  cont.innerHTML = '';
  M.currentMulti.opciones.forEach(function(v) {
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

  if (val === M.currentMulti.resultado) {
    // ── ACIERTO: siguiente automático ──
    document.querySelectorAll('.mopt').forEach(function(m) { m.className = 'mopt'; });
    el.className = 'mopt mok';
    var multiPts = M.multiIntentos === 0 ? 10 : 5;
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Genial, ' + (getNombre()||'campeona') + '! ' + M.currentMulti.a + '×' + M.currentMulti.b + '=' + M.currentMulti.resultado + ' 🌟 +' + multiPts + ' pts</div>';
    awardPts(multiPts, 'mates');
    recordResult('mates', 'multi', true);
    document.getElementById('multi-next').style.display = 'block';
  } else {
    M.multiIntentos++;
    el.className = 'mopt mbad';
    if (M.multiIntentos < 2) {
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
        if (parseInt(m.textContent) === M.currentMulti.resultado) m.className = 'mopt mok';
      });
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">La respuesta era <strong>' + M.currentMulti.resultado +
        '</strong> (' + M.currentMulti.a + '×' + M.currentMulti.b + ') 📖</div>';
      recordResult('mates', 'multi', false);
      document.getElementById('multi-next').style.display = 'block';
    }
  }
}

/* ============================================================
   PROBLEMAS — 2 intentos
   ============================================================ */
function cargarNuevoProblema() {
  M.probIntentos = 0;
  var nivel    = getNivel();
  var banco    = SubjectData.problemas[nivel];
  if (!banco || banco.length === 0) {
    M.currentProb = { enunciado: '🍎 María tiene 346 cromos. Le regala 128. ¿Cuántos le quedan?', resultado: 218 };
  } else {
    M.currentProb = banco[M.probIdx[nivel] % banco.length];
    M.probIdx[nivel]++;
  }
  var body = document.getElementById('prob-card-body');
  if (body) body.innerHTML = M.currentProb.enunciado;
  var unidad = document.getElementById('prob-unidad');
  if (unidad) unidad.textContent = M.currentProb.unidad || 'unidades';
  var ansBox = document.getElementById('prob-ans');
  if (ansBox) { ansBox.textContent = '?'; ansBox.style.cssText = ''; }
  M.probVal = '';
  var opDisplay = document.querySelector('.prob-op');
  if (opDisplay) opDisplay.style.display = 'none';
  document.getElementById('prob-fb').style.display   = 'none';
  document.getElementById('prob-next').style.display = 'none';
}

function typeProb(k) {
  var box = document.getElementById('prob-ans');
  if (k === 'del') { M.probVal = M.probVal.slice(0, -1); }
  else { if (M.probVal.length < 6) M.probVal += k; }
  box.textContent = M.probVal || '?';
}

function checkProb() {
  if (!M.currentProb) return;
  var fb  = document.getElementById('prob-fb');
  var box = document.getElementById('prob-ans');
  fb.style.display = 'block';

  if (parseInt(M.probVal) === M.currentProb.resultado) {
    // ── ACIERTO ──
    box.style.background  = 'var(--green-light)';
    box.style.borderColor = 'var(--green)';
    box.style.color       = 'var(--green)';
    var probPts = M.probIntentos === 0 ? 15 : 7;
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Correcto, ' + (getNombre()||'campeona') + '! ' + M.currentProb.resultado + ' 🎉 +' + probPts + ' pts</div>';
    awardPts(probPts, 'mates');
    recordResult('mates', 'prob', true);
    document.getElementById('prob-next').style.display = 'block';
  } else {
    M.probIntentos++;
    box.style.background  = 'var(--red-light)';
    box.style.borderColor = 'var(--red)';
    box.style.color       = 'var(--red)';
    if (M.probIntentos < 2) {
      // ── PRIMER FALLO: reintento ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡léelo otra vez con calma! 💪</div>';
      setTimeout(function() {
        M.probVal = '';
        box.textContent = '?'; box.style.cssText = '';
        fb.style.display = 'none';
      }, 1500);
    } else {
      // ── SEGUNDO FALLO: revelar ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">La respuesta correcta era <strong>' +
        M.currentProb.resultado + '</strong> 📖</div><div class="fbs">Guárdatela para la próxima.</div>';
      recordResult('mates', 'prob', false);
      document.getElementById('prob-next').style.display = 'block';
    }
  }
}

/* ============================================================
   MEZCLA — 2 intentos
   ============================================================ */
function cargarNuevaMezcla() {
  M.mixIntentos = 0;
  var nivel   = getNivel();
  var tipo    = ['suma','resta','multi'][Math.floor(Math.random() * 3)];
  if (tipo === 'suma')       M.currentMix = Object.assign({ tipo:'suma'  }, generarSuma(nivel));
  else if (tipo === 'resta') M.currentMix = Object.assign({ tipo:'resta' }, generarResta(nivel));
  else                       M.currentMix = Object.assign({ tipo:'multi' }, generarMulti(nivel));

  M.currentMix.respuestaUsuario = '';
  var res = M.currentMix.resultado.toString();

  var opBox = document.querySelector('#s-mix .op-box');
  if (!opBox) return;

  var html = '';
  if (M.currentMix.tipo === 'multi') {
    html = '<div class="op-row"><span>' + M.currentMix.a +
      '</span><span style="font-size:22px;color:var(--gray-400)">×</span><span>' +
      M.currentMix.b + '</span></div>';
  } else {
    var sign = M.currentMix.tipo === 'suma' ? '+' : '−';
    html = '<div class="op-row">';
    M.currentMix.a.toString().split('').forEach(function(d) { html += '<span>' + d + '</span>'; });
    html += '</div><div class="op-row"><span class="op-sign">' + sign + '</span>';
    M.currentMix.b.toString().split('').forEach(function(d) { html += '<span>' + d + '</span>'; });
    html += '</div>';
  }

  // Dígitos del resultado como ?
  var rowRes = '';
  res.split('').forEach(function(d, i) {
    rowRes += '<div class="dbox" id="mix-box-' + i + '">?</div>';
  });
  M.currentMix.posActual = res.length - 1; // empezar por la derecha

  html += '<div class="op-line"></div><div style="display:flex;justify-content:flex-end;gap:8px">' + rowRes + '</div>';
  opBox.innerHTML = html;

  // Activar primer dígito (más a la derecha)
  var firstBox = document.getElementById('mix-box-' + (res.length - 1));
  if (firstBox) firstBox.className = 'dbox active';

  document.getElementById('mix-fb').style.display   = 'none';
  document.getElementById('mix-next').style.display = 'none';
}

function typeMix(k) {
  if (!M.currentMix) return;
  var res = M.currentMix.resultado.toString();
  var pos = M.currentMix.posActual;

  if (k === 'del') {
    var ultimoRelleno = pos + 1;
    if (ultimoRelleno <= res.length - 1) {
      var borrar = document.getElementById('mix-box-' + ultimoRelleno);
      if (borrar) { borrar.textContent = '?'; borrar.className = 'dbox active'; }
      var activo = document.getElementById('mix-box-' + pos);
      if (activo) activo.className = 'dbox';
      M.currentMix.posActual = ultimoRelleno;
      M.currentMix.respuestaUsuario = M.currentMix.respuestaUsuario.slice(1);
    }
    return;
  }

  if (pos < 0) return;
  var box = document.getElementById('mix-box-' + pos);
  if (box) { box.textContent = k; box.className = 'dbox'; }
  M.currentMix.respuestaUsuario = k.toString() + M.currentMix.respuestaUsuario;
  M.currentMix.posActual--;
  if (M.currentMix.posActual >= 0) {
    var nextBox = document.getElementById('mix-box-' + M.currentMix.posActual);
    if (nextBox) nextBox.className = 'dbox active';
  }
}

function checkMix() {
  if (!M.currentMix) return;
  var res  = M.currentMix.resultado.toString();
  if (M.currentMix.respuestaUsuario.length < res.length) {
    showToast('✏️ Escribe todos los dígitos del resultado');
    return;
  }
  var fb   = document.getElementById('mix-fb');
  var sign = M.currentMix.tipo === 'multi' ? '×' : M.currentMix.tipo === 'suma' ? '+' : '−';
  var eq   = M.currentMix.a + sign + M.currentMix.b + '=' + M.currentMix.resultado;
  fb.style.display = 'block';

  if (M.currentMix.respuestaUsuario === res) {
    // ── ACIERTO: marcar todos en verde ──
    res.split('').forEach(function(d, i) {
      var b = document.getElementById('mix-box-' + i);
      if (b) b.className = 'dbox correct';
    });
    var mixPts = M.mixIntentos === 0 ? 10 : 5;
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Increíble, ' + (getNombre()||'campeona') + '! ' + eq + ' 🚀 +' + mixPts + ' pts</div>';
    awardPts(mixPts, 'mates');
    recordResult('mates', 'mix', true);
    document.getElementById('mix-next').style.display = 'block';
  } else {
    M.mixIntentos++;
    M.currentMix.respuestaUsuario.split('').forEach(function(d, i) {
      var b = document.getElementById('mix-box-' + i);
      if (b) b.className = d === res[i] ? 'dbox correct' : 'dbox wrong';
    });
    if (M.mixIntentos < 2) {
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡prueba otra vez! 💪</div><div class="fbs">Fíjate en los dígitos en rojo.</div>';
      setTimeout(function() {
        M.currentMix.respuestaUsuario = '';
        M.currentMix.posActual = res.length - 1;
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
