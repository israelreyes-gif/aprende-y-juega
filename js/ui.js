/* =============================================
   UI.JS — Actualización del interfaz con datos reales
   ============================================= */

/* ---- Helpers ---- */
function setEl(id, val)  { var e = document.getElementById(id); if (e) e.textContent = val; }
function setBar(id, pct) { var e = document.getElementById(id); if (e) e.style.width = pct + '%'; }

/* ---- Dificultad según racha ---- */
function diffLabel(streak) {
  if (streak >= 10) return { cls: 'diff-hard', txt: 'Difícil' };
  if (streak >= 5)  return { cls: 'diff-med',  txt: 'Medio' };
  return { cls: 'diff-easy', txt: 'Fácil' };
}

/* ---- Racha semanal ---- */
function updateStreakUI() {
  setEl('streak-num', ST.streak);
  setEl('home-streak-pill', '🔥 ' + ST.streak + ' días');

  var today = todayStr();
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

  // Mates
  var m = ST.mates;
  setEl('pm-pts', '⭐ ' + m.pts + ' pts');
  var mhPct = Math.min(100, Math.round(m.hoy / 20 * 100));
  setBar('pm-hoy-bar', mhPct);
  setEl('pm-hoy-val', m.hoy + ' ejerc.');
  var maPct = m.total > 0 ? Math.min(100, Math.round(m.totalOk / m.total * 100)) : 0;
  setBar('pm-acc-bar', maPct);
  setEl('pm-acc-val', pct(m.totalOk, m.total) + ' aciertos');

  // Lengua
  var l = ST.lengua;
  setEl('pl-pts', '⭐ ' + l.pts + ' pts');
  var lhPct = Math.min(100, Math.round(l.hoy / 10 * 100));
  setBar('pl-hoy-bar', lhPct);
  setEl('pl-hoy-val', l.hoy + ' ejerc.');
  var laPct = l.total > 0 ? Math.min(100, Math.round(l.totalOk / l.total * 100)) : 0;
  setBar('pl-acc-bar', laPct);
  setEl('pl-acc-val', pct(l.totalOk, l.total) + ' aciertos');

  updateErrorsPanel();
}

/* ---- Stats dentro de cada asignatura ---- */
function updateSubjectUI(subject) {
  if (subject === 'mates') {
    var m = ST.mates;
    setEl('ms-hoy',       m.hoy);
    setEl('ms-hoy-pct',   pct(m.hoyOk, m.hoy));
    setEl('ms-total',     m.total);
    setEl('ms-total-pct', pct(m.totalOk, m.total));
    var prog = Math.min(100, Math.round(m.hoy / 20 * 100));
    setBar('mates-hprog-fill', prog);
    setEl('mates-hprog-lbl', m.hoy + ' / 20');
  } else {
    var l = ST.lengua;
    setEl('ls-hoy',       l.hoy);
    setEl('ls-hoy-pct',   pct(l.hoyOk, l.hoy));
    setEl('ls-total',     l.total);
    setEl('ls-total-pct', pct(l.totalOk, l.total));
    var prog2 = Math.min(100, Math.round(l.hoy / 10 * 100));
    setBar('lengua-hprog-fill', prog2);
    setEl('lengua-hprog-lbl', l.hoy + ' / 10');
  }
}

/* ---- Panel de errores frecuentes ---- */
var ERROR_LABELS = {
  'suma':     'Sumas con llevadas',
  'resta':    'Restas con llevadas',
  'multi':    'Multiplicaciones',
  'prob':     'Problemas de texto',
  'mix':      'Ejercicio mezcla',
  'gram-bv':  'Gramática B / V',
  'gram-gj':  'Gramática G / J',
  'gram-czq': 'Gramática C / Z / Q',
  'gram-lly': 'Gramática LL / Y',
  'gram-rr':  'Gramática R / RR',
  'comp':     'Comprensión lectora'
};

function updateErrorsPanel() {
  var panel = document.getElementById('errors-panel');
  if (!panel) return;

  // Combinar fallos de todas las asignaturas (solo keys _fail)
  var allErrors = {};
  [ST.mates.errors, ST.lengua.errors].forEach(function(errors) {
    Object.keys(errors).forEach(function(k) {
      if (k.indexOf('_fail') !== -1) {
        var baseKey = k.replace('_fail', '');
        allErrors[baseKey] = (allErrors[baseKey] || 0) + errors[k];
      }
    });
  });

  var sorted = Object.entries(allErrors)
    .filter(function(e) { return e[1] > 0; })
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 5);

  if (sorted.length === 0) {
    panel.innerHTML = '<div style="font-size:13px;color:var(--gray-400);font-weight:600;text-align:center;padding:12px 16px">¡Sin errores acumulados! Sigue así 🌟</div>';
    return;
  }

  var html = '<div class="errors-card"><div class="errors-title">🔁 Hay que repasar...</div>';
  sorted.forEach(function(e) {
    var label = ERROR_LABELS[e[0]] || e[0];
    html += '<div class="error-item"><span>' + label + '</span><span class="error-count">' + e[1] + ' fallos</span></div>';
  });
  html += '</div>';
  panel.innerHTML = html;
}
