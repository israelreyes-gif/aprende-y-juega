/* =============================================
   UI.JS — Actualización del interfaz con datos reales
   Usa stats.js como fuente única de estadísticas
   ============================================= */

/* ---- Helpers ---- */
function setEl(id, val)  { var e = document.getElementById(id); if (e) e.textContent = val; }
function setBar(id, pct) { var e = document.getElementById(id); if (e) e.style.width = pct + '%'; }

/* ---- Dificultad según racha ---- */
function diffLabel(streak) {
  if (streak >= CONFIG.dificultad.rachaParaDificil) return { cls: 'diff-hard', txt: 'Difícil' };
  if (streak >= CONFIG.dificultad.rachaParaMedio)   return { cls: 'diff-med',  txt: 'Medio' };
  return { cls: 'diff-easy', txt: 'Fácil' };
}

/* ---- Racha semanal ---- */
function updateStreakUI() {
  setEl('streak-num', ST.streak);
  setEl('home-streak-pill', '🔥 ' + ST.streak + ' días');

  var dow = new Date().getDay();
  var monday = new Date();
  monday.setDate(monday.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0, 0, 0, 0);

  var days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  var dots = document.getElementById('streak-dots');
  if (!dots) return;
  dots.innerHTML = '';
  for (var i = 0; i < 7; i++) {
    var d = new Date(monday);
    d.setDate(d.getDate() + i);
    var ds = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    var done = ST.weekDays.includes(ds);
    var dot = document.createElement('div');
    dot.className = 'streak-dot' + (done ? ' done' : '');
    dot.textContent = done ? '✓' : days[i];
    dots.appendChild(dot);
  }
}

/* ---- Home: barras de progreso por asignatura ---- */
function updateHomeUI() {
  var h = new Date().getHours();
  var nombre = getNombre() ? getNombre() + '!' : 'campeona!';
  var greet = h < 13 ? '¡Buenos días, ' + nombre : h < 20 ? '¡Buenas tardes, ' + nombre : '¡Buenas noches, ' + nombre;
  setEl('home-greeting', greet);

  var m = statsGetSubject('mates');
  setEl('pm-pts', '⭐ ' + m.pts + ' pts');
  setBar('pm-hoy-bar', Math.min(100, Math.round(m.hoy / 20 * 100)));
  setEl('pm-hoy-val', m.hoy + ' ejerc.');
  setBar('pm-acc-bar', m.pct !== null ? m.pct : 0);
  setEl('pm-acc-val', statsPctStr(m.pct) + ' aciertos');

  var l = statsGetSubject('lengua');
  setEl('pl-pts', '⭐ ' + l.pts + ' pts');
  setBar('pl-hoy-bar', Math.min(100, Math.round(l.hoy / 10 * 100)));
  setEl('pl-hoy-val', l.hoy + ' ejerc.');
  setBar('pl-acc-bar', l.pct !== null ? l.pct : 0);
  setEl('pl-acc-val', statsPctStr(l.pct) + ' aciertos');

  var sc = statsGetSubject('sciences');
  setEl('psc-pts', '⭐ ' + sc.pts + ' pts');
  setBar('psc-hoy-bar', Math.min(100, Math.round(sc.hoy / 10 * 100)));
  setEl('psc-hoy-val', sc.hoy + ' exerc.');
  setBar('psc-acc-bar', sc.pct !== null ? sc.pct : 0);
  setEl('psc-acc-val', statsPctStr(sc.pct) + ' correct');

  var soc = statsGetSubject('sociales');
  setEl('psoc-pts', '⭐ ' + soc.pts + ' pts');
  setBar('psoc-hoy-bar', Math.min(100, Math.round(soc.hoy / 10 * 100)));
  setEl('psoc-hoy-val', soc.hoy + ' ejerc.');
  setBar('psoc-acc-bar', soc.pct !== null ? soc.pct : 0);
  setEl('psoc-acc-val', statsPctStr(soc.pct) + ' aciertos');

  var en = statsGetSubject('english');
  setEl('pen-pts', '⭐ ' + en.pts + ' pts');
  setBar('pen-hoy-bar', Math.min(100, Math.round(en.hoy / 10 * 100)));
  setEl('pen-hoy-val', en.hoy + ' exerc.');
  setBar('pen-acc-bar', en.pct !== null ? en.pct : 0);
  setEl('pen-acc-val', statsPctStr(en.pct) + ' correct');

  updateErrorsPanel();
  if (typeof renderCalHome === 'function') renderCalHome();
}

/* ---- Stats dentro de cada asignatura ---- */
function updateSubjectUI(subject) {
  var s = statsGetSubject(subject);
  if (!s) return;

  var stData = ST[subject] || {};

  if (subject === 'mates') {
    var sm = statsGetSubject('mates');
    var stM = ST.mates || {};
    setEl('ms-hoy',       stM.hoy || 0);
    setEl('ms-hoy-pct',   statsPctStr(sm.pct));
    setEl('ms-total',     stM.total || 0);
    setEl('ms-total-pct', statsPctStr(sm.pct));
    setBar('mates-hprog-fill', Math.min(100, Math.round((stM.hoy || 0) / 20 * 100)));
    setEl('mates-hprog-lbl', (stM.hoy || 0) + ' / 20');
  } else if (subject === 'english') {
    var se = statsGetSubject('english');
    var stE = ST.english || {};
    setEl('en-hoy',       stE.hoy || 0);
    setEl('en-hoy-pct',   statsPctStr(se.pct));
    setEl('en-total',     stE.total || 0);
    setEl('en-total-pct', statsPctStr(se.pct));
    setBar('english-hprog-fill', Math.min(100, Math.round((stE.hoy || 0) / 10 * 100)));
    setEl('english-hprog-lbl', (stE.hoy || 0) + ' / 10');
  } else if (subject === 'sciences') {
    var sc = statsGetSubject('sciences');
    var stSc = ST.sciences || {};
    setEl('sc-hoy',       stSc.hoy || 0);
    setEl('sc-hoy-pct',   statsPctStr(sc.pct));
    setEl('sc-total',     stSc.total || 0);
    setEl('sc-total-pct', statsPctStr(sc.pct));
    setBar('sciences-hprog-fill', Math.min(100, Math.round((stSc.hoy || 0) / 10 * 100)));
    setEl('sciences-hprog-lbl', (stSc.hoy || 0) + ' / 10');
  } else {
    var sl = statsGetSubject('lengua');
    var stL = ST.lengua || {};
    setEl('ls-hoy',       stL.hoy || 0);
    setEl('ls-hoy-pct',   statsPctStr(sl.pct));
    setEl('ls-total',     stL.total || 0);
    setEl('ls-total-pct', statsPctStr(sl.pct));
    setBar('lengua-hprog-fill', Math.min(100, Math.round((stL.hoy || 0) / 10 * 100)));
    setEl('lengua-hprog-lbl', (stL.hoy || 0) + ' / 10');
  }
}

/* ---- Panel de ejercicios a reforzar ---- */
function updateErrorsPanel() {
  var panel = document.getElementById('errors-panel');
  if (!panel) return;

  var weak = statsGetToReforzar(['vacaciones']).slice(0, 6);

  if (weak.length === 0) {
    panel.innerHTML = '<div style="font-size:13px;color:var(--gray-400);font-weight:600;text-align:center;padding:12px 16px">¡Sin errores acumulados! Sigue así 🌟</div>';
    return;
  }

  // Agrupar por asignatura
  var subjects = statsGetAll();
  var html = '<div class="errors-card">';

  subjects.forEach(function(subj) {
    var items = weak.filter(function(w){ return w.subjectName === subj.name; });
    if (!items.length) return;
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">';
    html += '<div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">';
    html += '<span style="font-size:14px">' + statsIconHtml(subj.icon) + '</span>' + subj.name + '</div>';
    html += '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;' + subj.pill + '">' + items.length + ' área' + (items.length > 1 ? 's' : '') + '</span>';
    html += '</div>';
    items.forEach(function(item, idx) {
      var isLast = idx === items.length - 1;
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:3px 0 3px 22px;border-bottom:' + (isLast ? 'none' : '0.5px solid var(--color-border-tertiary)') + ';' + (isLast ? 'margin-bottom:6px' : '') + '">';
      html += '<span style="font-size:11px;color:var(--gray-500);font-family:var(--f)">' + item.name + '</span>';
      html += '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;background:#FEE2E2;color:#DC2626">' + item.fail + ' fallos</span>';
      html += '</div>';
    });
  });

  html += '</div>';
  panel.innerHTML = html;
}
