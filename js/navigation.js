/* =============================================
   NAVIGATION.JS — Cambio de pantallas, cursos y toast
   ============================================= */

/* ---- Toast ---- */
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2800);
}

var _errorRetryFn  = null;
var _errorBackScreen = null;

function showError(context, e, retryFn, backScreen) {
  console.error('[' + context + ']', e);
  var msg = document.getElementById('error-msg');
  if (msg) msg.innerHTML = 'No pudimos cargar ' + context + '.<br>¿Tienes conexión a internet?';
  _errorRetryFn    = retryFn   || null;
  _errorBackScreen = backScreen || 's-perfiles';
  var el = document.getElementById('error-screen');
  if (el) el.style.display = 'flex';
  var btn = document.getElementById('error-retry-btn');
  if (btn) btn.textContent = '🔄 Intentar de nuevo';
}

function errorRetry() {
  var el = document.getElementById('error-screen');
  if (el) el.style.display = 'none';
  var btn = document.getElementById('error-retry-btn');
  if (btn) btn.textContent = '⏳ Cargando...';
  if (_errorRetryFn) _errorRetryFn();
}

function errorBack() {
  var el = document.getElementById('error-screen');
  if (el) el.style.display = 'none';
  go(_errorBackScreen || 's-perfiles');
}

/* ---- Guardar nombre y empezar ---- */
function guardarNombreYEmpezar() {
  var input = document.getElementById('input-nombre');
  if (!input || input.value.trim().length < 2) return;
  setNombre(input.value.trim());
  // Ir a crear avatar antes de los cursos
  initCrearAvatar();
  go('s-crear-avatar');
}

function initCrearAvatar() {
  // Inicializar editor de avatar de bienvenida
  if (typeof AV_TEMP !== 'undefined') {
    AV_TEMP = JSON.parse(JSON.stringify(AV));
  }
  if (typeof renderCrearAvatar === 'function') renderCrearAvatar();
}

function confirmarCrearAvatar() {
  // Guardar avatar temporal si existe
  if (typeof AV_TEMP !== 'undefined' && typeof saveAvatar === 'function') {
    AV = JSON.parse(JSON.stringify(AV_TEMP));
    saveAvatar(AV);
    if (typeof syncAvatarToCloud === 'function') syncAvatarToCloud();
  }
  go('s-cursos');
}

/* ---- Descripciones ---- */
function irADescripciones() {
  go('s-descripciones');
}

/* ---- Área para padres (con PIN) ---- */
var _pinBuffer   = '';
var _pinCallback = null;

function irAPadres() {
  _pinBuffer   = '';
  _pinCallback = function() {
    go('s-padres');
  };

  var modal    = document.getElementById('pin-modal');
  var err      = document.getElementById('pin-error');
  if (!modal) return;
  if (err) err.style.display = 'none';
  pinUpdateDots();
  modal.style.display = 'flex';
}

function pinKey(digit) {
  if (_pinBuffer.length >= 4) return;
  _pinBuffer += digit;
  pinUpdateDots();
  if (_pinBuffer.length === 4) setTimeout(pinSubmit, 150);
}

function pinDel() {
  _pinBuffer = _pinBuffer.slice(0, -1);
  pinUpdateDots();
  var err = document.getElementById('pin-error');
  if (err) err.style.display = 'none';
}

function pinUpdateDots() {
  for (var i = 0; i < 4; i++) {
    var dot = document.getElementById('pin-dot-' + i);
    if (dot) dot.style.background = i < _pinBuffer.length ? '#7C3AED' : '#E5E7EB';
  }
}

function pinSubmit() {
  fetch(API_URL + '/config/pin_padres')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var pinGuardado = d && d.valor ? d.valor : '';
      if (_pinBuffer === pinGuardado) {
        pinClose();
        if (_pinCallback) _pinCallback();
      } else {
        pinError('PIN incorrecto');
      }
    })
    .catch(function() {
      pinError('Error de conexión');
    });
}

function pinError(msg) {
  _pinBuffer = '';
  pinUpdateDots();
  var err = document.getElementById('pin-error');
  if (err) { err.textContent = msg; err.style.display = 'block'; }
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

function pinClose() {
  var modal = document.getElementById('pin-modal');
  if (modal) modal.style.display = 'none';
  _pinBuffer = '';
}

function pinCancel() {
  pinClose();
}

/* ---- Selección de curso ---- */
function seleccionarCurso(num) {
  if (num === 4) {
    // 4º ya está abierto (aunque las asignaturas siguen en construcción).
    // Los puntos/racha/calendario sí son reales: se cargan desde D1 igual
    // que en 3º, solo que aun no hay asignaturas que jueguen con ellos.
    setCurso(4);
    loadStateFromCloud(function() {
      checkDayReset();
      updateCurso4UI();
      go('s-home-curso4');
    });
    return;
  }
  if (num !== CONFIG.curso.porDefecto) {
    // Cursos no disponibles → pantalla WIP con mensaje divertido
    go('s-wip-curso-' + num);
    return;
  }
  // Curso disponible → cargar su progreso y entrar
  setCurso(CONFIG.curso.porDefecto);
  loadStateFromCloud(function() {
    checkDayReset();
    updateMedalUI();
    updateStreakUI();
    updateHomeUI();
    updateSubjectUI('mates');
    updateSubjectUI('lengua');
    go('s-home');
  });
}

/* ---- Home de 4º: puntos, racha y calendario (reales, sin depender de
   que existan asignaturas). Usa IDs propios (prefijo c4-) para no
   pisarse con los de la home de 3º, que están cargados a la vez. ---- */
function updateCurso4UI() {
  setEl('c4-streak-pill', '🔥 ' + (ST.streak || 0) + ' días');
  setEl('c4-pts-pill', '⭐ ' + (ST.totalPts || 0) + ' pts');
  setEl('c4-streak-num', ST.streak || 0);

  var dow = new Date().getDay();
  var monday = new Date();
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);

  var days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  var dots = document.getElementById('c4-streak-dots');
  if (dots) {
    dots.innerHTML = '';
    for (var i = 0; i < 7; i++) {
      var d = new Date(monday);
      d.setDate(d.getDate() + i);
      var ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var done = (ST.weekDays || []).includes(ds);
      var dot = document.createElement('div');
      dot.className = 'streak-dot' + (done ? ' done' : '');
      dot.textContent = done ? '✓' : days[i];
      dots.appendChild(dot);
    }
  }

  var today = new Date();
  var year = today.getFullYear(), month = today.getMonth(), todayDay = today.getDate();
  var daysInMonth = calDaysInMonth(year, month);
  var firstDOW = calFirstDOW(year, month);
  var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  setEl('c4-cal-mes-lbl', meses[month] + ' ' + year);

  var activeDays = {};
  var _source = (ST.monthDays && ST.monthDays.length > 0) ? ST.monthDays : (ST.weekDays || []);
  _source.forEach(function(d) {
    var dayNum = parseInt(d.split('-')[2]);
    activeDays[dayNum] = 'done';
  });

  var grid = document.getElementById('c4-cal-mes-grid');
  if (grid) {
    grid.innerHTML = '';
    for (var g = 0; g < firstDOW; g++) grid.appendChild(document.createElement('div'));
    for (var d2 = 1; d2 <= daysInMonth; d2++) {
      var cell = document.createElement('div');
      var isToday  = d2 === todayDay;
      var isDone   = !isToday && activeDays[d2] && d2 < todayDay;
      var isFuture = d2 > todayDay;
      cell.style.cssText = 'border-radius:5px;display:flex;align-items:center;justify-content:center;height:28px;font-size:11px;font-weight:500;';
      if (isToday)       cell.style.cssText += 'background:#EEEDFE;color:#3C3489;outline:2px solid var(--calendario);font-weight:700';
      else if (isDone)   cell.style.cssText += 'background:#EAF3DE;color:#27500A';
      else if (isFuture) cell.style.cssText += 'color:var(--gray-300);opacity:.4';
      else               cell.style.cssText += 'color:var(--gray-400)';
      cell.textContent = d2;
      grid.appendChild(cell);
    }
  }

  var streak = ST.streak || 0;
  var daysStudied = (ST.monthDays && ST.monthDays.length > 0) ? ST.monthDays.length : (ST.weekDays || []).length;
  setEl('c4-cal-stat-dias', daysStudied);
  setEl('c4-cal-stat-racha', '🔥 ' + streak);
  setEl('c4-cal-stat-mejor', streak);
}

/* ---- Navegar a una pantalla ---- */
function go(screenId) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  var target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  clearExerciseState();

  if (screenId === 's-home')             { updateHomeUI(); updateStreakUI(); updateMedalUI(); }
  if (screenId === 's-mates')                    { updateSubjectUI('mates'); renderMiniCalendario('cal-mates', 'mates', '#7C3AED'); }
  if (screenId === 's-mates-exercises')          { updateSubjectUI('mates'); }
  if (screenId === 's-lengua')                   { updateSubjectUI('lengua'); renderMiniCalendario('cal-lengua', 'lengua', '#EC4899'); }
  if (screenId === 's-lengua-exercises')         { updateSubjectUI('lengua'); }
  if (screenId === 's-english')               { updateSubjectUI('english'); renderMiniCalendario('cal-english', 'english', '#3B82F6'); }
  if (screenId === 's-english-study')         { renderEnglishStudyMenu(); }
  if (screenId === 's-english-exercises')     { renderEnglishExercisesMenu(); }
  if (screenId === 's-english-vocab')         { renderVocabMenu(); }
  if (screenId === 's-vocab-ex-w2i')          { loadW2IQuestion(); }
  if (screenId === 's-vocab-ex-i2w')          { loadI2WQuestion(); }
  if (screenId === 's-sciences')                    { updateSubjectUI('sciences'); renderMiniCalendario('cal-sciences', 'sciences', '#0D9488'); }
  if (screenId === 's-sciences-study-invertebrates') { renderSciencesStudy(); }
  if (screenId === 's-sociales')               { renderMiniCalendario('cal-sociales', 'sociales', 'var(--sociales)'); }
  if (screenId === 's-sociales-study')         { renderSocialesMenu(); }
  if (screenId === 's-sociales-study-unit')    { renderSocialesUnit(); }
  if (screenId === 's-sociales-ex-menu')       { /* menú estático */ }
  if (screenId === 's-sociales-ex')            { loadSocEx(); }
  if (screenId === 's-avatar')                      { if (typeof renderAvatarEditor === 'function') renderAvatarEditor(); }
  if (screenId === 's-vacaciones')                  { if (typeof renderVacacionesHome === 'function') renderVacacionesHome(); }
  if (screenId === 's-descripciones')               { if (typeof initDescripciones === 'function') initDescripciones(); }
  if (screenId === 's-padres')                      { renderPadres(); }
  if (screenId === 's-calendario')                  { renderCalendarioHome(); }
}

/* ---- Limpiar estado visual de ejercicios ---- */
function clearExerciseState() {
  if (ExerciseState.mates) { ExerciseState.mates.probVal = ''; ExerciseState.mates.mixVal = ''; }

  var mb = document.getElementById('mix-box');
  if (mb) { mb.textContent = '?'; mb.className = 'dbox active'; mb.style.width = '90px'; }
  var pb = document.getElementById('prob-ans');
  if (pb) { pb.textContent = '?'; pb.style.cssText = ''; }
  var mid = document.getElementById('mid-box');
  if (mid) { mid.textContent = '?'; mid.className = 'dbox active'; }

  ['suma-fb','multi-fb','prob-fb','mix-fb','gram-fb','comp-result'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
  ['suma-next','multi-next','prob-next','mix-next','gram-next'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });

  document.querySelectorAll('.mopt').forEach(function(m) { m.className = 'mopt'; });

  var loading   = document.getElementById('comp-loading');
  if (loading)  loading.style.display = 'none';
  var submitBtn = document.getElementById('comp-submit');
  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Enviar todas las respuestas ✓'; }
  for (var i = 1; i <= 5; i++) {
    var ta = document.getElementById('q' + i); if (ta) ta.value = '';
    var qr = document.getElementById('qr' + i);
    if (qr) { qr.className = 'q-res'; qr.style.display = 'none'; qr.textContent = ''; }
  }

  ['gram-ortho','comp-ortho'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
}
