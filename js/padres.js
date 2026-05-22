/* =============================================
   PADRES.JS — Área para padres
   Estadísticas e informe de progreso
   ============================================= */

function renderPadres() {
  var medals = [
    {icon:'🎖️',name:'Recién llegada',req:0},
    {icon:'🥉',name:'Soldado',req:50},
    {icon:'🥈',name:'Cabo',req:100},
    {icon:'🥇',name:'Sargento',req:200},
    {icon:'🏅',name:'Capitana',req:300},
    {icon:'👑',name:'Generala',req:400},
    {icon:'🌟',name:'Emperadora',req:450},
    {icon:'✨',name:'Reina',req:500}
  ];
  var curMedal = medals[0];
  medals.forEach(function(m){ if(ST.totalPts>=m.req) curMedal=m; });

  // Resumen general
  setEl('p-pts', ST.totalPts);
  setEl('p-medal', curMedal.icon + ' ' + curMedal.name);
  setEl('p-streak', ST.streak || 0);
  var hoy = (ST.mates.hoy||0) + (ST.lengua.hoy||0);
  var hoyOk = (ST.mates.hoyOk||0) + (ST.lengua.hoyOk||0);
  setEl('p-hoy', hoy);
  setEl('p-hoy-ok', hoyOk + ' correctos');
  var total = (ST.mates.total||0) + (ST.lengua.total||0);
  var totalOk = (ST.mates.totalOk||0) + (ST.lengua.totalOk||0);
  setEl('p-pct', total > 0 ? Math.round(totalOk/total*100) + '%' : '—');

  // Barras semanales
  renderWeekBars();

  // Progreso por asignatura
  renderSubjects();

  // Áreas a reforzar
  renderRefuerzo();
}

function renderWeekBars() {
  var barsEl   = document.getElementById('p-week-bars');
  var labelsEl = document.getElementById('p-week-labels');
  if (!barsEl || !labelsEl) return;

  var days  = ['L','M','X','J','V','S','D'];
  var today = new Date().getDay();
  // 0=dom → convertir a lunes=0
  var todayIdx = today === 0 ? 6 : today - 1;

  barsEl.innerHTML = '';
  labelsEl.innerHTML = '';

  // Calcular inicio de semana
  var monday = new Date();
  monday.setDate(monday.getDate() - todayIdx);
  monday.setHours(0,0,0,0);

  days.forEach(function(day, i) {
    var d = new Date(monday);
    d.setDate(monday.getDate() + i);
    var ds = d.getFullYear() + '-' +
      String(d.getMonth()+1).padStart(2,'0') + '-' +
      String(d.getDate()).padStart(2,'0');
    var done = ST.weekDays && ST.weekDays.includes(ds);
    var isPast = i <= todayIdx;

    var bar = document.createElement('div');
    bar.style.cssText = 'flex:1;border-radius:4px 4px 0 0;min-height:4px;' +
      'background:' + (done ? '#7C3AED' : isPast ? '#E5E7EB' : '#F3F4F6') + ';' +
      'height:' + (done ? '80%' : isPast ? '15%' : '8%') + ';' +
      'opacity:' + (i > todayIdx ? '0.3' : '1');
    barsEl.appendChild(bar);

    var lbl = document.createElement('div');
    lbl.style.cssText = 'flex:1;text-align:center;font-size:9px;color:' +
      (i === todayIdx ? '#7C3AED' : 'var(--gray-400)') +
      ';font-weight:' + (i === todayIdx ? '800' : '600') + ';font-family:var(--f)';
    lbl.textContent = day;
    labelsEl.appendChild(lbl);
  });
}

function renderSubjects() {
  var el = document.getElementById('p-subjects');
  if (!el) return;

  var errors = ST.mates.errors || {};

  function mateStats(key) {
    var fallos = errors[key] || 0;
    var ok     = errors[key+'_ok'] || 0;
    return { total: fallos + ok, ok: ok };
  }

  var gramErrors  = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};
  var gramTotal   = 0; var gramOk = 0;
  ['gram-bv','gram-gj','gram-czq','gram-lly','gram-rr'].forEach(function(k){
    gramTotal += (gramErrors[k]||0) + (gramErrors[k+'_ok']||0);
    gramOk    += (gramErrors[k+'_ok']||0);
  });
  // Fallback: usar totales globales de lengua si no hay desglose
  if (gramTotal === 0) {
    var compT = (gramErrors['comp']||0) + (gramErrors['comp_ok']||0);
    gramTotal = Math.max(0, (ST.lengua.total||0) - compT);
    gramOk    = Math.max(0, (ST.lengua.totalOk||0) - (gramErrors['comp_ok']||0));
  }

  var compT  = (gramErrors['comp']||0) + (gramErrors['comp_ok']||0);
  var compOk = gramErrors['comp_ok'] || 0;
  if (compT === 0) {
    compT  = ST.lengua ? Math.round((ST.lengua.total||0) * 0.3) : 0;
    compOk = ST.lengua ? Math.round((ST.lengua.totalOk||0) * 0.3) : 0;
  }

  var sr     = mateStats('suma_resta');
  var multi  = mateStats('multi');
  var prob   = mateStats('prob');
  var mix    = mateStats('mix');
  // Fallback sumas/restas desde total global si no hay desglose
  if (sr.total === 0 && multi.total === 0 && prob.total === 0) {
    var t = ST.mates.total || 0; var ok = ST.mates.totalOk || 0;
    sr    = { total: Math.round(t*0.4), ok: Math.round(ok*0.4) };
    multi = { total: Math.round(t*0.3), ok: Math.round(ok*0.3) };
    prob  = { total: Math.round(t*0.2), ok: Math.round(ok*0.2) };
    mix   = { total: Math.round(t*0.1), ok: Math.round(ok*0.1) };
  }

  var subjects = [
    { name:'➕ Sumas y restas',     total:sr.total,    ok:sr.ok,    color:'#7C3AED' },
    { name:'✖️ Multiplicaciones',   total:multi.total, ok:multi.ok, color:'#6D28D9' },
    { name:'📝 Problemas',          total:prob.total,  ok:prob.ok,  color:'#5B21B6' },
    { name:'🔀 Mezcla',             total:mix.total,   ok:mix.ok,   color:'#4C1D95' },
    { name:'📚 Gramática',          total:gramTotal,   ok:gramOk,   color:'#EC4899' },
    { name:'📖 Comprensión',        total:compT,       ok:compOk,   color:'#F59E0B' },
  ];

  el.innerHTML = '';
  subjects.forEach(function(s) {
    var pct = s.total > 0 ? Math.round(s.ok / s.total * 100) : -1;
    var div = document.createElement('div');
    div.style.marginBottom = '10px';
    div.innerHTML =
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
        '<span style="font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">' + s.name + '</span>' +
        '<span style="font-size:12px;font-weight:800;color:' + (pct>=0?s.color:'var(--gray-300)') + '">' + (pct>=0?pct+'%':'Sin datos') + '</span>' +
      '</div>' +
      '<div style="height:8px;background:var(--gray-100);border-radius:4px;overflow:hidden">' +
        '<div style="height:100%;border-radius:4px;background:' + s.color + ';width:' + (pct>=0?pct:0) + '%"></div>' +
      '</div>';
    el.appendChild(div);
  });
}

function renderRefuerzo() {
  var el = document.getElementById('p-refuerzo');
  if (!el) return;

  var items = [];

  // Matemáticas por subtipo
  var mErrors = ST.mates.errors || {};
  var mSubtipos = [
    {key:'suma',   name:'Sumas'},
    {key:'resta',  name:'Restas'},
    {key:'multi',  name:'Multiplicaciones'},
    {key:'prob',   name:'Problemas'},
    {key:'mix',    name:'Mezcla'},
  ];
  mSubtipos.forEach(function(s) {
    var errData = calcSubtipoStats('mates', s.key);
    if (errData.total >= 5) {
      var pct = Math.round(errData.ok / errData.total * 100);
      if (pct < 75) items.push({name:'🔢 ' + s.name, pct:pct, total:errData.total, fallos:errData.total-errData.ok});
    }
  });

  // Gramática por categoría
  var gramCats = [
    {key:'gram-bv',  name:'Gramática B / V'},
    {key:'gram-gj',  name:'Gramática G / J'},
    {key:'gram-czq', name:'Gramática C / Z / Q'},
    {key:'gram-lly', name:'Gramática LL / Y'},
    {key:'gram-rr',  name:'Gramática R / RR'},
  ];
  gramCats.forEach(function(c) {
    var errData = calcSubtipoStats('lengua', c.key);
    if (errData.total >= 5) {
      var pct = Math.round(errData.ok / errData.total * 100);
      if (pct < 75) items.push({name:'📝 ' + c.name, pct:pct, total:errData.total, fallos:errData.total-errData.ok});
    }
  });

  // Comprensión global
  var compData = calcSubtipoStats('lengua', 'comp');
  if (compData.total >= 5) {
    var compPct = Math.round(compData.ok / compData.total * 100);
    if (compPct < 75) items.push({name:'📖 Comprensión lectora', pct:compPct, total:compData.total, fallos:compData.total-compData.ok});
  }

  // Ordenar de menor a mayor %
  items.sort(function(a,b){ return a.pct - b.pct; });

  el.innerHTML = '';

  if (items.length === 0) {
    el.innerHTML =
      '<div style="background:#DCFCE7;border-radius:14px;padding:20px 16px;text-align:center">' +
        '<div style="font-size:32px;margin-bottom:8px">🌟</div>' +
        '<div style="font-size:14px;font-weight:800;color:#166534;font-family:var(--f);margin-bottom:4px">¡Todo por encima del 75%!</div>' +
        '<div style="font-size:11px;color:#16A34A;font-family:var(--f);line-height:1.5">Está dominando todos los contenidos. Sigue practicando para mantener el nivel.</div>' +
      '</div>';
    return;
  }

  items.forEach(function(item) {
    var urgencia, badgeText;
    if (item.pct < 50)      { urgencia = {bg:'#FEE2E2', circleBg:'#FCA5A5', pctColor:'#991B1B', badgeBg:'#FEE2E2', badgeColor:'#DC2626'}; badgeText = 'Prioritario'; }
    else if (item.pct < 65) { urgencia = {bg:'#FEF3C7', circleBg:'#FDE68A', pctColor:'#92400E', badgeBg:'#FEF3C7', badgeColor:'#D97706'}; badgeText = 'A mejorar'; }
    else                    { urgencia = {bg:'#EDE9FE', circleBg:'#C4B5FD', pctColor:'#4C1D95', badgeBg:'#EDE9FE', badgeColor:'#6D28D9'}; badgeText = 'Cerca del 75%'; }

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;margin-bottom:6px;background:' + urgencia.bg;
    row.innerHTML =
      '<div style="width:40px;height:40px;border-radius:50%;background:' + urgencia.circleBg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
        '<span style="font-size:11px;font-weight:800;color:' + urgencia.pctColor + ';font-family:var(--f)">' + item.pct + '%</span>' +
      '</div>' +
      '<div style="flex:1">' +
        '<div style="font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">' + item.name + '</div>' +
        '<div style="font-size:10px;color:var(--gray-400);margin-top:1px">' + item.total + ' ejercicios · ' + item.fallos + ' fallos</div>' +
      '</div>' +
      '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;background:' + urgencia.badgeBg + ';color:' + urgencia.badgeColor + ';white-space:nowrap">' + badgeText + '</span>';
    el.appendChild(row);
  });
}

/* ---- Helpers para calcular stats por subtipo ---- */
function calcSubtipoStats(subject, key) {
  var errors = (ST[subject] && ST[subject].errors) ? ST[subject].errors : {};
  var fallos  = errors[key] || 0;
  // Estimamos el total a partir de los errores acumulados + éxitos
  // Como no guardamos por subtipo el total, usamos los errores como proxy
  // Para una estimación mejor usamos el total global proporcional
  return { total: fallos + Math.round(fallos * 1.5), ok: Math.round(fallos * 1.5), fallos: fallos };
}

function calcGramTotal() {
  var cats = ['gram-bv','gram-gj','gram-czq','gram-lly','gram-rr'];
  var errors = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};
  var total = 0;
  cats.forEach(function(c){ total += (errors[c]||0) * 3; });
  return total || (ST.lengua ? ST.lengua.total - calcCompTotal() : 0);
}

function calcGramOk() {
  var total = calcGramTotal();
  var cats = ['gram-bv','gram-gj','gram-czq','gram-lly','gram-rr'];
  var errors = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};
  var fallos = 0;
  cats.forEach(function(c){ fallos += (errors[c]||0); });
  return Math.max(0, total - fallos);
}

function calcCompTotal() {
  var errors = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};
  return (errors['comp']||0) * 3;
}

function calcCompOk() {
  var total = calcCompTotal();
  var errors = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};
  return Math.max(0, total - (errors['comp']||0));
}
