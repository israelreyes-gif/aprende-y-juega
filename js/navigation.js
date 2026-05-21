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

/* ---- Guardar nombre y empezar ---- */
function guardarNombreYEmpezar() {
  var input = document.getElementById('input-nombre');
  if (!input || input.value.trim().length < 2) return;
  setNombre(input.value.trim());
  go('s-cursos');
}

/* ---- Selección de curso ---- */
function seleccionarCurso(num) {
  if (num !== 3) {
    // Cursos no disponibles → pantalla WIP con mensaje divertido
    go('s-wip-curso-' + num);
    return;
  }
  // Curso 3 disponible → cargar su progreso y entrar
  setCurso(3);
  checkDayReset();
  updateMedalUI();
  updateStreakUI();
  updateHomeUI();
  updateSubjectUI('mates');
  updateSubjectUI('lengua');
  go('s-home');
}

/* ---- Navegar a una pantalla ---- */
function go(screenId) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  var target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  clearExerciseState();

  if (screenId === 's-home')   { updateHomeUI(); updateStreakUI(); updateMedalUI(); }
  if (screenId === 's-mates')  { updateSubjectUI('mates'); }
  if (screenId === 's-lengua') { updateSubjectUI('lengua'); }
}

/* ---- Limpiar estado visual de ejercicios ---- */
function clearExerciseState() {
  if (typeof probVal !== 'undefined') probVal = '';
  if (typeof mixVal  !== 'undefined') mixVal  = '';

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
