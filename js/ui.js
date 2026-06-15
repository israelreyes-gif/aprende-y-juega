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

  // Sciences
  if (ST.sciences) {
    var sc = ST.sciences;
    setEl('psc-pts', '⭐ ' + sc.pts + ' pts');
    setBar('psc-hoy-bar', Math.min(100, Math.round(sc.hoy / 10 * 100)));
    setEl('psc-hoy-val', sc.hoy + ' exerc.');
    var scaPct = sc.total > 0 ? Math.min(100, Math.round(sc.totalOk / sc.total * 100)) : 0;
    setBar('psc-acc-bar', scaPct);
    setEl('psc-acc-val', pct(sc.totalOk, sc.total) + ' correct');
  }

  // English
  if (ST.sociales) {
    var soc = ST.sociales;
    setEl('psoc-pts', '⭐ ' + soc.pts + ' pts');
    setBar('psoc-hoy-bar', Math.min(100, Math.round(soc.hoy / 10 * 100)));
    setEl('psoc-hoy-val', soc.hoy + ' ejerc.');
    setBar('psoc-acc-bar', soc.total > 0 ? Math.min(100, Math.round(soc.totalOk / soc.total * 100)) : 0);
    setEl('psoc-acc-val', pct(soc.totalOk, soc.total) + ' aciertos');
  }
  if (ST.english) {
    var en = ST.english;
    setEl('pen-pts', '⭐ ' + en.pts + ' pts');
    setBar('pen-hoy-bar', Math.min(100, Math.round(en.hoy / 10 * 100)));
    setEl('pen-hoy-val', en.hoy + ' exerc.');
    setBar('pen-acc-bar', en.total > 0 ? Math.min(100, Math.round(en.totalOk / en.total * 100)) : 0);
    setEl('pen-acc-val', pct(en.totalOk, en.total) + ' correct');
  }

  updateErrorsPanel();
  if (typeof renderCalHome === 'function') renderCalHome();
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
  } else if (subject === 'english') {
    if (!ST.english) return;
    var en = ST.english;
    setEl('en-hoy',       en.hoy);
    setEl('en-hoy-pct',   pct(en.hoyOk, en.hoy));
    setEl('en-total',     en.total);
    setEl('en-total-pct', pct(en.totalOk, en.total));
    var progEn = Math.min(100, Math.round(en.hoy / 10 * 100));
    setBar('english-hprog-fill', progEn);
    setEl('english-hprog-lbl', en.hoy + ' / 10');
  } else if (subject === 'sciences') {
    if (!ST.sciences) return;
    var sc = ST.sciences;
    setEl('sc-hoy',       sc.hoy);
    setEl('sc-hoy-pct',   pct(sc.hoyOk, sc.hoy));
    setEl('sc-total',     sc.total);
    setEl('sc-total-pct', pct(sc.totalOk, sc.total));
    var progSc = Math.min(100, Math.round(sc.hoy / 10 * 100));
    setBar('sciences-hprog-fill', progSc);
    setEl('sciences-hprog-lbl', sc.hoy + ' / 10');
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
  'suma':          'Sumas y restas',
  'resta':         'Sumas y restas',
  'multi':         'Multiplicaciones',
  'prob':          'Problemas',
  'mix':           'Ejercicio mezcla',
  'gram-bv':       'Gramática B / V',
  'gram-gj':       'Gramática G / J',
  'gram-czq':      'Gramática C / Z / Q',
  'gram-lly':      'Gramática LL / Y',
  'gram-rr':       'Gramática R / RR',
  'comp':          'Comprensión lectora',
  'desc':          'Descripciones',
  'dict':          'Dictado',
  'tobe':          'To Be',
  'modals':        'Modal Verbs',
  'vocab':         'Vocabulary',
  'invertebrates': 'Invertebrates',
  'mix-sc':        'Mix',
  'vf':            'Verdadero/Falso',
  'relacionar':    'Relacionar',
  'completar':     'Completar frase'
};

function updateErrorsPanel() {
  var panel = document.getElementById('errors-panel');
  if (!panel) return;

  // Calcular % por subtipo y filtrar los que estén por debajo del 75%
  var mErr = ST.mates.errors || {};
  var lErr = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};
  var eErr = (ST.english && ST.english.errors) ? ST.english.errors : {};
  var scErr = (ST.sciences && ST.sciences.errors) ? ST.sciences.errors : {};
  var socErr = (ST.sociales && ST.sociales.errors) ? ST.sociales.errors : {};

  function getPct(errors, key) {
    var ok = errors[key+'_ok']||0, fail = errors[key+'_fail']||0;
    var total = ok + fail;
    if (!total) return null;
    return { pct: Math.round(ok/total*100), fail: fail };
  }

  // Sumas y restas juntas
  var srOk = (mErr['mates-suma_ok']||0)+(mErr['mates-resta_ok']||0);
  var srFail = (mErr['mates-suma_fail']||0)+(mErr['mates-resta_fail']||0);
  var srTotal = srOk + srFail;

  var allErrors = [];
  if (srTotal > 0 && Math.round(srOk/srTotal*100) < 75) {
    allErrors.push(['suma', srFail]);
  }
  [
    {k:'mates-multi', e:mErr}, {k:'mates-prob', e:mErr}, {k:'mates-mix', e:mErr},
    {k:'lengua-gram-bv', e:lErr}, {k:'lengua-gram-gj', e:lErr}, {k:'lengua-gram-czq', e:lErr},
    {k:'lengua-gram-lly', e:lErr}, {k:'lengua-gram-rr', e:lErr}, {k:'lengua-comp', e:lErr}, {k:'lengua-desc', e:lErr}, {k:'lengua-dict', e:lErr},
    {k:'english-tobe', e:eErr}, {k:'english-modals', e:eErr}, {k:'english-vocab', e:eErr},
    {k:'sciences-invertebrates', e:scErr}, {k:'sciences-mix', e:scErr},
    {k:'sociales-vf', e:socErr}, {k:'sociales-relacionar', e:socErr}, {k:'sociales-completar', e:socErr}
  ].forEach(function(item) {
    var r = getPct(item.e, item.k);
    if (r && r.pct < 75) allErrors.push([item.k, r.fail]);
  });

  var sorted = allErrors.sort(function(a,b){ return b[1]-a[1]; }).slice(0,6);

  if (sorted.length === 0) {
    panel.innerHTML = '<div style="font-size:13px;color:var(--gray-400);font-weight:600;text-align:center;padding:12px 16px">¡Sin errores acumulados! Sigue así 🌟</div>';
    return;
  }

  // Agrupar por asignatura con sangría
  var grupos = [
    { nombre:'Matemáticas', icono:'🔢', pill:'background:#EDE9FE;color:#4C1D95',
      keys:['suma','resta','multi','prob','mix'] },
    { nombre:'Lengua', icono:'📚', pill:'background:#FDF2F8;color:#9D174D',
      keys:['gram-bv','gram-gj','gram-czq','gram-lly','gram-rr','comp','desc','dict'] },
    { nombre:'English', icono:'<svg width="16" height="11" viewBox="0 0 60 40" style="border-radius:2px;vertical-align:middle"><rect width="60" height="40" fill="#012169"/><path d="M0,0L60,40M60,0L0,40" stroke="white" stroke-width="8"/><path d="M0,0L60,40M60,0L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0V40M0,20H60" stroke="white" stroke-width="13"/><path d="M30,0V40M0,20H60" stroke="#C8102E" stroke-width="7"/></svg>', pill:'background:#EFF6FF;color:#1D4ED8',
      keys:['tobe','modals','vocab'] },
    { nombre:'Sciences', icono:'🔬', pill:'background:#F0FDFA;color:#0F766E',
      keys:['invertebrates','mix-sc'] },
    { nombre:'Sociales', icono:'🌍', pill:'background:#E1F5EE;color:#085041',
      keys:['vf','relacionar','completar'] }
  ];

  var html = '<div class="errors-card">';
  grupos.forEach(function(g) {
    var items = sorted.filter(function(e){ return g.keys.indexOf(e[0]) !== -1; });
    if (!items.length) return;
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">';
    html += '<div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">';
    html += '<span style="font-size:14px">'+g.icono+'</span>'+g.nombre+'</div>';
    html += '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;'+g.pill+'">'+items.length+' área'+(items.length>1?'s':'')+'</span>';
    html += '</div>';
    items.forEach(function(e, idx) {
      var label = ERROR_LABELS[e[0]] || e[0];
      var isLast = idx === items.length-1;
      html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:3px 0 3px 22px;border-bottom:'+(isLast?'none':'0.5px solid var(--color-border-tertiary)')+';'+(isLast?'margin-bottom:6px':'')+'">';
      html += '<span style="font-size:11px;color:var(--gray-500);font-family:var(--f)">'+label+'</span>';
      html += '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;background:#FEE2E2;color:#DC2626">'+e[1]+' fallos</span>';
      html += '</div>';
    });
  });
  html += '</div>';
  panel.innerHTML = html;
}
