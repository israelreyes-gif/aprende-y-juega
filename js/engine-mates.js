/* =============================================
   ENGINE-MATES.JS — Motor genérico para
   ejercicios de matemáticas.

   Soporta tres tipos de input:
   - 'digits'  : sumas, restas, divisiones (dígito a dígito)
   - 'options' : multiplicaciones (botones de opciones)
   - 'free'    : problemas (teclado numérico libre)

   config = {
     generate:    fn() → ejercicio { a, b, resultado, ... }
     inputType:   'digits' | 'options' | 'free'
     prefix:      prefijo de IDs en el HTML (ej. 'suma')
     subjectKey:  clave en ST (ej. 'mates')
     exerciseKey: clave para errors (ej. 'mates-suma')
     ptsFirst:    puntos primer intento (def. 10)
     ptsSecond:   puntos segundo intento (def. 5)
     renderOp:    fn(ex, container) — dibuja la operación
     correctMsg:  fn(pts, ex) → string HTML
     wrongMsg:    fn(ex) → string HTML (segundo fallo)
     onLoad:      fn(ex) — hook al cargar ejercicio
     onFinish:    fn() — hook opcional al completar
     onCorrect:   fn(firstAttempt) — hook post-acierto (opcional)
     onWrong:     fn() — hook post-fallo final, 2º intento (opcional)
   }
   ============================================= */

var _matesState = {};

/* ---- Arrancar un ejercicio ---- */
function matesStart(config) {
  var ex = config.generate();
  _matesState = {
    config:   config,
    ex:       ex,
    intentos: 0,
    val:      '',         // para 'free'
    posActual: ex.resultado !== undefined
      ? ex.resultado.toString().length - 1 : 0  // para 'digits'
  };
  ex.respuestaUsuario = '';

  var p = config.prefix;
  document.getElementById(p + '-fb').style.display   = 'none';
  document.getElementById(p + '-next').style.display = 'none';

  // Renderizar — setTimeout(0) para asegurar que el DOM está listo
  var screenId = config.screenId || ('s-' + p);
  setTimeout(function() {
    var opBox = document.querySelector('#' + screenId + ' .op-box') ||
                document.getElementById(p + '-op');
    if (config.renderOp) config.renderOp(ex, opBox);

    var res = ex.resultado.toString();
    if (config.inputType === 'digits') {
      _matesRenderDigits(p, res);
      _matesState.posActual = res.length - 1;
      ex.respuestaUsuario = '';
    } else if (config.inputType === 'options') {
      _matesRenderOptions(config, ex);
    } else if (config.inputType === 'free') {
      var ansBox = document.getElementById(p + '-ans');
      if (ansBox) { ansBox.textContent = '?'; ansBox.style.cssText = ''; }
      _matesState.val = '';
    }

    if (config.onLoad) config.onLoad(ex);
  }, 0);
}

/* ---- Input: dígito a dígito ---- */
function _matesRenderDigits(p, res) {
  var rowRes = '';
  res.split('').forEach(function(d, i) {
    rowRes += '<div class="dbox" id="' + p + '-box-' + i + '">?</div>';
  });
  // Try the res-row container first, then the op-box
  var resRow = document.getElementById(p + '-res-row');
  if (resRow) {
    resRow.innerHTML = rowRes;
  }
  // Activar el dígito más a la derecha
  var firstBox = document.getElementById(p + '-box-' + (res.length - 1));
  if (firstBox) firstBox.className = 'dbox active';
}

function matesPickDigit(d) {
  var s   = _matesState;
  var ex  = s.ex;
  var p   = s.config.prefix;
  var res = ex.resultado.toString();
  var pos = s.posActual;

  if (d === null) {
    // Borrar
    var ultimoRelleno = pos + 1;
    if (ultimoRelleno <= res.length - 1) {
      var borrar = document.getElementById(p + '-box-' + ultimoRelleno);
      if (borrar) { borrar.textContent = '?'; borrar.className = 'dbox active'; }
      var activo = document.getElementById(p + '-box-' + pos);
      if (activo) activo.className = 'dbox';
      s.posActual = ultimoRelleno;
      ex.respuestaUsuario = ex.respuestaUsuario.slice(1);
    }
    return;
  }

  if (pos < 0) return;
  var box = document.getElementById(p + '-box-' + pos);
  if (box) { box.textContent = d; box.className = 'dbox'; }
  ex.respuestaUsuario = d.toString() + ex.respuestaUsuario;
  s.posActual--;
  if (s.posActual >= 0) {
    var nextBox = document.getElementById(p + '-box-' + s.posActual);
    if (nextBox) nextBox.className = 'dbox active';
  }
}

function matesCheckDigits() {
  var s      = _matesState;
  var config = s.config;
  var ex     = s.ex;
  var p      = config.prefix;
  var res    = ex.resultado.toString();
  var fb     = document.getElementById(p + '-fb');
  var ptsFirst  = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond = config.ptsSecond !== undefined ? config.ptsSecond : 5;

  if (ex.respuestaUsuario.length < res.length) {
    showToast('✏️ Escribe todos los dígitos del resultado');
    return;
  }

  fb.style.display = 'block';

  if (ex.respuestaUsuario === res) {
    // Acierto
    res.split('').forEach(function(d, i) {
      var b = document.getElementById(p + '-box-' + i);
      if (b) b.className = 'dbox correct';
    });
    var pts = s.intentos === 0 ? ptsFirst : ptsSecond;
    fb.className = 'feedback ok';
    fb.innerHTML = config.correctMsg ? config.correctMsg(pts, ex)
      : '<div class="fbt">¡Correcto! +' + pts + ' pts 🎉</div>';
    engineSaveProgress(config, true, s.intentos === 0);
    if (config.onCorrect) config.onCorrect(s.intentos === 0);
    document.getElementById(p + '-next').style.display = 'block';

  } else if (s.intentos < 1) {
    // Primer fallo
    s.intentos++;
    ex.respuestaUsuario.split('').forEach(function(d, i) {
      var b = document.getElementById(p + '-box-' + i);
      if (b) b.className = d === res[i] ? 'dbox correct' : 'dbox wrong';
    });
    fb.className = 'feedback bad';
    fb.innerHTML = '<div class="fbt">No es correcto... ¡inténtalo de nuevo! 💪</div><div class="fbs">Fíjate en los dígitos en rojo.</div>';
    setTimeout(function() {
      ex.respuestaUsuario = '';
      s.posActual = res.length - 1;
      res.split('').forEach(function(d, i) {
        var b = document.getElementById(p + '-box-' + i);
        if (b) { b.textContent = '?'; b.className = i === res.length - 1 ? 'dbox active' : 'dbox'; }
      });
      fb.style.display = 'none';
    }, 1500);

  } else {
    // Segundo fallo
    res.split('').forEach(function(d, i) {
      var b = document.getElementById(p + '-box-' + i);
      if (b) { b.textContent = d; b.className = 'dbox correct'; }
    });
    fb.className = 'feedback bad';
    fb.innerHTML = config.wrongMsg ? config.wrongMsg(ex)
      : '<div class="fbt">La respuesta correcta era <strong>' + res + '</strong> 📖</div>';
    engineSaveProgress(config, false, false);
    if (config.onWrong) config.onWrong();
    document.getElementById(p + '-next').style.display = 'block';
  }
}

/* ---- Input: opciones múltiples ---- */
function _matesRenderOptions(config, ex) {
  var p      = config.prefix;
  var screen = config.screenId || ('s-' + p);
  var cont   = document.querySelector('#' + screen + ' .multi-opts') ||
               document.getElementById(p + '-opts');
  if (!cont) return;
  cont.innerHTML = '';
  ex.opciones.forEach(function(v) {
    var d = document.createElement('div');
    d.className = config.optClass || 'mopt';
    d.textContent = v;
    d.onclick = function() { matesPickOption(d, v); };
    cont.appendChild(d);
  });
}

function matesPickOption(el, val) {
  var s      = _matesState;
  var config = s.config;
  var ex     = s.ex;
  var p      = config.prefix;
  var fb     = document.getElementById(p + '-fb');
  var ptsFirst  = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond = config.ptsSecond !== undefined ? config.ptsSecond : 5;
  fb.style.display = 'block';

  var screen = config.screenId || ('s-' + p);
  if (val === ex.resultado) {
    document.querySelectorAll('#' + screen + ' .' + (config.optClass || 'mopt')).forEach(function(m) { m.className = config.optClass || 'mopt'; });
    el.className = (config.optClass || 'mopt') + ' mok';
    var pts = s.intentos === 0 ? ptsFirst : ptsSecond;
    fb.className = 'feedback ok';
    fb.innerHTML = config.correctMsg ? config.correctMsg(pts, ex)
      : '<div class="fbt">¡Correcto! +' + pts + ' pts 🎉</div>';
    engineSaveProgress(config, true, s.intentos === 0);
    if (config.onCorrect) config.onCorrect(s.intentos === 0);
    document.getElementById(p + '-next').style.display = 'block';
  } else {
    s.intentos++;
    el.className = (config.optClass || 'mopt') + ' mbad';
    if (s.intentos < 2) {
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es ese... ¡prueba otra vez! 🤔</div>';
      setTimeout(function() { el.className = config.optClass || 'mopt'; fb.style.display = 'none'; }, 1200);
    } else {
      document.querySelectorAll('#' + screen + ' .' + (config.optClass || 'mopt')).forEach(function(m) {
        if (parseInt(m.textContent) === ex.resultado) m.className = (config.optClass || 'mopt') + ' mok';
      });
      fb.className = 'feedback bad';
      fb.innerHTML = config.wrongMsg ? config.wrongMsg(ex)
        : '<div class="fbt">La respuesta era <strong>' + ex.resultado + '</strong> 📖</div>';
      engineSaveProgress(config, false, false);
      if (config.onWrong) config.onWrong();
      document.getElementById(p + '-next').style.display = 'block';
    }
  }
}

/* ---- Input: libre (teclado numérico) ---- */
function matesTypeKey(k) {
  var s   = _matesState;
  var p   = s.config.prefix;
  var box = document.getElementById(p + '-ans');
  if (k === 'del') { s.val = s.val.slice(0, -1); }
  else { if (s.val.length < 6) s.val += k; }
  if (box) box.textContent = s.val || '?';
}

function matesCheckFree() {
  var s      = _matesState;
  var config = s.config;
  var ex     = s.ex;
  var p      = config.prefix;
  var fb     = document.getElementById(p + '-fb');
  var box    = document.getElementById(p + '-ans');
  var ptsFirst  = config.ptsFirst  !== undefined ? config.ptsFirst  : 10;
  var ptsSecond = config.ptsSecond !== undefined ? config.ptsSecond : 5;
  fb.style.display = 'block';

  if (parseInt(s.val) === ex.resultado) {
    if (box) { box.style.background = 'var(--green-light)'; box.style.borderColor = 'var(--green)'; box.style.color = 'var(--green)'; }
    var pts = s.intentos === 0 ? ptsFirst : ptsSecond;
    fb.className = 'feedback ok';
    fb.innerHTML = config.correctMsg ? config.correctMsg(pts, ex)
      : '<div class="fbt">¡Correcto! +' + pts + ' pts 🎉</div>';
    engineSaveProgress(config, true, s.intentos === 0);
    if (config.onCorrect) config.onCorrect(s.intentos === 0);
    document.getElementById(p + '-next').style.display = 'block';
  } else {
    s.intentos++;
    if (box) { box.style.background = 'var(--red-light)'; box.style.borderColor = 'var(--red)'; box.style.color = 'var(--red)'; }
    if (s.intentos < 2) {
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es correcto... ¡léelo otra vez con calma! 💪</div>';
      setTimeout(function() {
        s.val = '';
        if (box) { box.textContent = '?'; box.style.cssText = ''; }
        fb.style.display = 'none';
      }, 1500);
    } else {
      fb.className = 'feedback bad';
      fb.innerHTML = config.wrongMsg ? config.wrongMsg(ex)
        : '<div class="fbt">La respuesta correcta era <strong>' + ex.resultado + '</strong> 📖</div>';
      engineSaveProgress(config, false, false);
      if (config.onWrong) config.onWrong();
      document.getElementById(p + '-next').style.display = 'block';
    }
  }
}
