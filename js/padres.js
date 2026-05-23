/* =============================================
   PADRES.JS — Área para padres
   Estadísticas e informe de progreso
   ============================================= */

function resetearEstadisticas() {
  if (!confirm('¿Seguro que quieres borrar todas las estadísticas? Se mantendrán los puntos y el avatar.')) return;
  ST.mates.hoy=0; ST.mates.hoyOk=0; ST.mates.total=0; ST.mates.totalOk=0; ST.mates.errors={};
  ST.lengua.hoy=0; ST.lengua.hoyOk=0; ST.lengua.total=0; ST.lengua.totalOk=0; ST.lengua.errors={};
  ST.matesStreak=0; ST.gramStreak=0; ST.compStreak=0;
  saveState();
  renderPadres();
  showToast('✅ Estadísticas reseteadas');
}

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

  var mErrors = ST.mates.errors || {};
  var lErrors = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};

  function stats(errors, key) {
    var ok     = errors[key + '_ok']   || 0;
    var fallos = errors[key + '_fail'] || 0;
    return { total: ok + fallos, ok: ok };
  }

  // Sumas y restas juntas
  var sumaS  = stats(mErrors, 'suma');
  var restaS = stats(mErrors, 'resta');
  var sr     = { total: sumaS.total + restaS.total, ok: sumaS.ok + restaS.ok };
  var multi  = stats(mErrors, 'multi');
  var prob   = stats(mErrors, 'prob');
  var mix    = stats(mErrors, 'mix');

  // Gramática — suma de todas las categorías
  var gramTotal = 0, gramOk = 0;
  ['gram-bv','gram-gj','gram-czq','gram-lly','gram-rr'].forEach(function(k) {
    var s = stats(lErrors, k);
    gramTotal += s.total;
    gramOk    += s.ok;
  });
  // Fallback si no hay desglose aún
  if (gramTotal === 0) {
    var compFallback = stats(lErrors, 'comp');
    gramTotal = Math.max(0, (ST.lengua.total||0) - compFallback.total);
    gramOk    = Math.max(0, (ST.lengua.totalOk||0) - compFallback.ok);
  }

  var comp = stats(lErrors, 'comp');
  // Fallback comprensión
  if (comp.total === 0 && ST.lengua && ST.lengua.total > 0) {
    comp.total = Math.round((ST.lengua.total||0) * 0.3);
    comp.ok    = Math.round((ST.lengua.totalOk||0) * 0.3);
  }

  var desc = stats(lErrors, 'desc');

  var subjects = [
    { name:'➕ Sumas y restas',   total:sr.total,    ok:sr.ok,    color:'#7C3AED' },
    { name:'✖️ Multiplicaciones', total:multi.total, ok:multi.ok, color:'#6D28D9' },
    { name:'📝 Problemas',        total:prob.total,  ok:prob.ok,  color:'#5B21B6' },
    { name:'🔀 Mezcla',           total:mix.total,   ok:mix.ok,   color:'#4C1D95' },
    { name:'📚 Gramática',        total:gramTotal,   ok:gramOk,   color:'#EC4899' },
    { name:'📖 Comprensión',      total:comp.total,  ok:comp.ok,  color:'#F59E0B' },
    { name:'✍️ Descripciones',    total:desc.total,  ok:desc.ok,  color:'#0EA5E9' },
  ];

  el.innerHTML = '';
  subjects.forEach(function(s) {
    var pct = s.total > 0 ? Math.round(s.ok / s.total * 100) : -1;
    var div = document.createElement('div');
    div.style.marginBottom = '10px';
    div.innerHTML =
      '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
        '<span style="font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">' + s.name + '</span>' +
        '<span style="font-size:12px;font-weight:800;color:' + (pct>=0?s.color:'var(--color-text-secondary)') + '">' + (pct>=0?pct+'%':'Sin empezar') + '</span>' +
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

  var mErr = ST.mates.errors || {};
  var lErr = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};

  function getStats(errors, key) {
    var ok = errors[key+'_ok']||0, fallos = errors[key+'_fail']||0, total = ok+fallos;
    if (!total) return null;
    var pct = Math.round(ok/total*100);
    return pct < 75 ? {pct:pct, total:total, fallos:fallos} : null;
  }

  function urg(pct) {
    if (pct < 50) return {circleBg:'#FCA5A5',pctColor:'#991B1B',badgeBg:'#FEE2E2',badgeColor:'#DC2626',badge:'Prioritario',level:3};
    if (pct < 65) return {circleBg:'#FDE68A',pctColor:'#92400E',badgeBg:'#FEF3C7',badgeColor:'#D97706',badge:'A mejorar',level:2};
    return {circleBg:'#C4B5FD',pctColor:'#4C1D95',badgeBg:'#EDE9FE',badgeColor:'#6D28D9',badge:'Cerca del 75%',level:1};
  }

  var srOk = (mErr['suma_ok']||0)+(mErr['resta_ok']||0);
  var srF  = (mErr['suma_fail']||0)+(mErr['resta_fail']||0);
  var srSt = srOk+srF > 0 ? (Math.round(srOk/(srOk+srF)*100) < 75 ? {pct:Math.round(srOk/(srOk+srF)*100),total:srOk+srF,fallos:srF} : null) : null;

  var grupos = [
    { nombre:'Matemáticas', icono:'🔢', pill:'mates',
      items: [
        {nombre:'Sumas y restas',   stats:srSt},
        {nombre:'Multiplicaciones', stats:getStats(mErr,'multi')},
        {nombre:'Problemas',        stats:getStats(mErr,'prob')},
        {nombre:'Mezcla',           stats:getStats(mErr,'mix')},
      ]
    },
    { nombre:'Lengua', icono:'📚', pill:'lengua',
      items: [
        {nombre:'Gramática B / V',  stats:getStats(lErr,'gram-bv')},
        {nombre:'Gramática G / J',  stats:getStats(lErr,'gram-gj')},
        {nombre:'Gramática C/Z/Q',  stats:getStats(lErr,'gram-czq')},
        {nombre:'Gramática LL / Y', stats:getStats(lErr,'gram-lly')},
        {nombre:'Gramática R / RR', stats:getStats(lErr,'gram-rr')},
        {nombre:'Comprensión',      stats:getStats(lErr,'comp')},
        {nombre:'Descripciones',    stats:getStats(lErr,'desc')},
      ]
    }
  ];

  grupos.forEach(function(g){ g.items = g.items.filter(function(i){ return i.stats; }); });
  var activos = grupos.filter(function(g){ return g.items.length > 0; });

  var maxLevel = 0;
  activos.forEach(function(g){ g.items.forEach(function(i){ maxLevel = Math.max(maxLevel, urg(i.stats.pct).level); }); });

  var banners = [
    {bg:'#DCFCE7',border:'#16A34A',icon:'🌟',tc:'#166534',sc:'#16A34A',title:'¡Todo por encima del 75%!',sub:'Está dominando todos los contenidos. Sigue practicando para mantener el nivel.'},
    {bg:'#EDE9FE',border:'#7C3AED',icon:'💪',tc:'#4C1D95',sc:'#6D28D9',title:'¡Casi lo tiene todo!',sub:'Está cerca del 75% en algunas áreas. Un poco más de práctica y lo conseguirá.'},
    {bg:'#FEF3C7',border:'#F59E0B',icon:'📖',tc:'#92400E',sc:'#B45309',title:'Hay cosas que reforzar',sub:'Algunas áreas necesitan más práctica. Mira los detalles abajo para saber por dónde empezar.'},
    {bg:'#FEE2E2',border:'#DC2626',icon:'⚠️',tc:'#991B1B',sc:'#B91C1C',title:'Hay áreas prioritarias',sub:'Hay contenidos con muchos fallos. Es importante practicarlos pronto para no quedarse atrás.'}
  ];

  var b = banners[maxLevel];
  el.innerHTML =
    '<div style="background:'+b.bg+';border:0.5px solid '+b.border+';border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
      '<div style="font-size:24px;flex-shrink:0">'+b.icon+'</div>' +
      '<div><div style="font-size:13px;font-weight:800;color:'+b.tc+';font-family:var(--f);margin-bottom:3px">'+b.title+'</div>' +
      '<div style="font-size:11px;color:'+b.sc+';font-family:var(--f);line-height:1.5">'+b.sub+'</div></div>' +
    '</div>';

  activos.forEach(function(g) {
    var pillStyle = g.pill==='mates' ? 'background:#EDE9FE;color:#4C1D95' : 'background:#FDF2F8;color:#9D174D';
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:12px;overflow:hidden;margin-bottom:8px';
    var html = '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--color-background-secondary);border-bottom:0.5px solid var(--color-border-tertiary)">' +
      '<span style="font-size:16px">'+g.icono+'</span>' +
      '<span style="font-size:13px;font-weight:800;color:var(--gray-800);font-family:var(--f);flex:1">'+g.nombre+'</span>' +
      '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;'+pillStyle+'">'+g.items.length+' área'+(g.items.length>1?'s':'')+'</span>' +
    '</div><div style="padding:4px 12px">';
    g.items.sort(function(a,b){ return a.stats.pct-b.stats.pct; });
    g.items.forEach(function(item,idx) {
      var u = urg(item.stats.pct);
      var sep = idx<g.items.length-1 ? 'border-bottom:0.5px solid var(--color-border-tertiary)' : '';
      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;'+sep+'">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:'+u.circleBg+';display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
          '<span style="font-size:10px;font-weight:800;color:'+u.pctColor+';font-family:var(--f)">'+item.stats.pct+'%</span>' +
        '</div>' +
        '<div style="flex:1">' +
          '<div style="font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">'+item.nombre+'</div>' +
          '<div style="font-size:10px;color:var(--gray-400);margin-top:1px">'+item.stats.total+' ejercicios · '+item.stats.fallos+' fallos</div>' +
        '</div>' +
        '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;background:'+u.badgeBg+';color:'+u.badgeColor+';white-space:nowrap">'+u.badge+'</span>' +
      '</div>';
    });
    html += '</div>';
    card.innerHTML = html;
    el.appendChild(card);
  });
}


