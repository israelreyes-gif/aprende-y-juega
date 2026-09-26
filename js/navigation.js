/* =============================================
   NAVIGATION.JS — Navegación entre pantallas, selección
   de curso, teclado numérico (PIN), y limpieza de estado
   visual de ejercicios al cambiar de pantalla.
   ============================================= */

/* ---- Teclado numérico (PIN) ---- */
var _pinBuffer = '';
var _pinTarget = null;
var _pinOnSuccess = null;

function pinOpen(target, onSuccess) {
  _pinTarget = target;
  _pinOnSuccess = onSuccess;
  _pinBuffer = '';
  updatePinDots();
  var modal = document.getElementById('pin-modal');
  if (modal) modal.style.display = 'flex';
}

function pinDigit(d) {
  if (_pinBuffer.length >= 4) return;
  _pinBuffer += d;
  updatePinDots();
  if (_pinBuffer.length === 4) {
    setTimeout(checkPin, 200);
  }
}

function pinBackspace() {
  _pinBuffer = _pinBuffer.slice(0, -1);
  updatePinDots();
}

function updatePinDots() {
  var dots = document.querySelectorAll('.pin-dot');
  dots.forEach(function(dot, i) {
    dot.classList.toggle('filled', i < _pinBuffer.length);
  });
  var err = document.getElementById('pin-error');
  if (err) err.style.display = 'none';
}

function checkPin() {
  if (_pinBuffer === CONFIG.pinPadres) {
    pinClose();
    if (_pinOnSuccess) _pinOnSuccess();
  } else {
    var err = document.getElementById('pin-error');
    if (err) err.style.display = 'block';
    _pinBuffer = '';
    setTimeout(updatePinDots, 300);
  }
}

function pinClose() {
  var modal = document.getElementById('pin-modal');
  if (modal) modal.style.display = 'none';
  _pinBuffer = '';
}

function pinCancel() {
  pinClose();
}

/* ---- Selección de curso ----
   Cursos disponibles y su pantalla de inicio viven en el registro
   CONFIG.curso (config.js). Aquí solo se define QUÉ hay que
   actualizar en pantalla al entrar en cada curso — un curso nuevo se
   añade con una entrada en CURSO_ON_ENTER + su fila en
   CONFIG.curso.info, sin tocar seleccionarCurso(). */
var CURSO_ON_ENTER = {
  3: function() {
    updateMedalUI();
    updateStreakUI();
    updateHomeUI();
    updateSubjectUI('mates');
    updateSubjectUI('lengua');
  },
  4: function() {
    // Puntos/racha/calendario son reales: se cargan desde D1 igual
    // que en 3º, en su propia fila de progreso (separada de la de
    // 3º). El resto de asignaturas de 4º siguen en construcción.
    updateCurso4UI();
  }
};

function seleccionarCurso(num) {
  var info = CONFIG.curso.info[num];
  if (CONFIG.curso.disponibles.indexOf(num) === -1 || !info) {
    // Cursos no disponibles → pantalla WIP con mensaje divertido
    go('s-wip-curso-' + num);
    return;
  }
  setCurso(num);
  loadStateFromCloud(function() {
    checkDayReset();
    var onEnter = CURSO_ON_ENTER[num];
    if (onEnter) onEnter();
    go(info.home);
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
  var mejor = Math.max(streak, calLongestStreak(_source));
  setEl('c4-cal-stat-dias', daysStudied);
  setEl('c4-cal-stat-racha', '🔥 ' + streak);
  setEl('c4-cal-stat-mejor', mejor);
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
  if (screenId === 's-home-curso4')      { updateCurso4UI(); }
  if (screenId === 's-mates')                    { updateSubjectUI('mates'); renderMiniCalendario('cal-mates', 'mates', '#7C3AED'); }
  if (screenId === 's-mates-exercises')          { updateSubjectUI('mates'); }
  if (screenId === 's-lengua')                   { updateSubjectUI('lengua'); renderMiniCalendario('cal-lengua', 'lengua', '#EC4899'); }
  if (screenId === 's-lengua-exercises')         { updateSubjectUI('lengua'); }
  if (screenId === 's-english')               { updateSubjectUI('english'); renderMiniCalendario('cal-english', 'english', '#3B82F6'); }
  if (screenId === 's-english-study')         { renderEnglishStudyMenu(); }
  if (screenId === 's-english-exercises')     { renderEnglishExercisesMenu(); }
  if (screenId === 's-english-vocab')         { renderVocabMenu(); }
  if (screenId === 's-english-vocab-c4')      { renderVocabMenu('-c4'); }
  if (screenId === 's-vocab-ex-w2i')          { loadW2IQuestion(); }
  if (screenId === 's-vocab-ex-i2w')          { loadI2WQuestion(); }
  if (screenId === 's-english-vocab-ex-c4')   { renderVocabExGridC4(); }
  if (screenId === 's-vocab-ex-w2i-c4')       { loadW2IQuestionC4(); }
  if (screenId === 's-vocab-ex-i2w-c4')       { loadI2WQuestionC4(); }
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
