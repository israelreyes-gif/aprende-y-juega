/* =============================================
   PADRES.JS — Área para padres
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
  // Recargar desde D1 para asegurar datos del perfil activo
  loadStateFromCloud(function() {
    _renderPadresUI();
  });
}

function _renderPadresUI() {
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

  setEl('p-pts', ST.totalPts);
  setEl('p-medal', curMedal.icon + ' ' + curMedal.name);
  setEl('p-streak', ST.streak || 0);
  var hoy = (ST.mates.hoy||0) + (ST.lengua.hoy||0) + (ST.sciences&&ST.sciences.hoy||0) + (ST.english&&ST.english.hoy||0);
  var hoyOk = (ST.mates.hoyOk||0) + (ST.lengua.hoyOk||0) + (ST.sciences&&ST.sciences.hoyOk||0) + (ST.english&&ST.english.hoyOk||0);
  setEl('p-hoy', hoy);
  setEl('p-hoy-ok', hoyOk + ' correctos');
  var total = (ST.mates.total||0) + (ST.lengua.total||0) + (ST.sciences&&ST.sciences.total||0) + (ST.english&&ST.english.total||0);
  var totalOk = (ST.mates.totalOk||0) + (ST.lengua.totalOk||0) + (ST.sciences&&ST.sciences.totalOk||0) + (ST.english&&ST.english.totalOk||0);
  setEl('p-pct', total > 0 ? Math.round(totalOk/total*100) + '%' : '—');

  renderWeekBars();
  renderSubjects();
  renderRefuerzo();
}

function renderWeekBars() {
  var barsEl   = document.getElementById('p-week-bars');
  var labelsEl = document.getElementById('p-week-labels');
  if (!barsEl || !labelsEl) return;

  var days  = ['L','M','X','J','V','S','D'];
  var today = new Date().getDay();
  var todayIdx = today === 0 ? 6 : today - 1;

  barsEl.innerHTML = '';
  labelsEl.innerHTML = '';

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

  var mErr = ST.mates.errors || {};
  var lErr = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};

  function st(errors, key) {
    var ok = errors[key+'_ok']||0, f = errors[key+'_fail']||0;
    return { total:ok+f, ok:ok };
  }

  var sumaOk = (mErr['suma_ok']||0)+(mErr['resta_ok']||0);
  var sumaF  = (mErr['suma_fail']||0)+(mErr['resta_fail']||0);
  var sr = { total:sumaOk+sumaF, ok:sumaOk };

  var gramTotal=0, gramOk=0;
  ['gram-bv','gram-gj','gram-czq','gram-lly','gram-rr'].forEach(function(k){
    var s=st(lErr,k); gramTotal+=s.total; gramOk+=s.ok;
  });

  var grupos = [
    { nombre:'Matemáticas', icono:'🔢', color:'#7C3AED',
      items:[
        {nombre:'Sumas y restas',   s:sr},
        {nombre:'Multiplicaciones', s:st(mErr,'multi')},
        {nombre:'Problemas',        s:st(mErr,'prob')},
        {nombre:'Mezcla',           s:st(mErr,'mix')}
      ]
    },
    { nombre:'Lengua', icono:'📚', color:'#EC4899',
      items:[
        {nombre:'Gramática',     s:{total:gramTotal,ok:gramOk}},
        {nombre:'Comprensión',   s:st(lErr,'comp')},
        {nombre:'Descripciones', s:st(lErr,'desc')}
      ]
    },
    { nombre:'English', icono:'<svg width="20" height="13" viewBox="0 0 60 40" style="border-radius:2px;vertical-align:middle"><rect width="60" height="40" fill="#012169"/><path d="M0,0L60,40M60,0L0,40" stroke="white" stroke-width="8"/><path d="M0,0L60,40M60,0L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0V40M0,20H60" stroke="white" stroke-width="13"/><path d="M30,0V40M0,20H60" stroke="#C8102E" stroke-width="7"/></svg>', color:'#3B82F6',
      items:(function() {
        var eErr = (ST.english && ST.english.errors) ? ST.english.errors : {};
        function ste(errors, key) { var ok=errors[key+'_ok']||0, f=errors[key+'_fail']||0; return {total:ok+f,ok:ok}; }
        return [
          {nombre:'To Be',       s:ste(eErr,'tobe')},
          {nombre:'Modal Verbs', s:ste(eErr,'modals')},
          {nombre:'Vocabulary',  s:ste(eErr,'vocab')}
        ];
      })()
    },
    { nombre:'Sciences', icono:'🔬', color:'#14B8A6',
      items:(function() {
        var scErr = (ST.sciences && ST.sciences.errors) ? ST.sciences.errors : {};
        function st2(errors, key) {
          var ok = errors[key+'_ok']||0, f = errors[key+'_fail']||0;
          return { total:ok+f, ok:ok };
        }
        var invTotal=0, invOk=0;
        ['ex1','ex2','ex3','ex4','ex5','ex6','ex7','ex8','ex9','ex10'].forEach(function(k){
          var s=st2(scErr,k); invTotal+=s.total; invOk+=s.ok;
        });
        return [
          {nombre:'Invertebrates', s:{total:invTotal,ok:invOk}},
          {nombre:'Mix',           s:st2(scErr,'mix')}
        ];
      })()
    }
  ];

  el.innerHTML = '';

  grupos.forEach(function(g) {
    var gTotal=0, gOk=0;
    g.items.forEach(function(i){ gTotal+=i.s.total; gOk+=i.s.ok; });
    var gPct = gTotal>0 ? Math.round(gOk/gTotal*100) : -1;
    var pctColor = gPct<0 ? 'var(--color-text-secondary)' : gPct<75 ? '#F59E0B' : '#16A34A';

    var card = document.createElement('div');
    card.style.cssText = 'background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:12px;overflow:hidden;margin-bottom:8px';

    var html =
      '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--color-background-secondary);border-bottom:0.5px solid var(--color-border-tertiary)">' +
        '<span style="font-size:15px">' + g.icono + '</span>' +
        '<span style="font-size:13px;font-weight:700;color:var(--gray-800);font-family:var(--f);flex:1">' + g.nombre + '</span>' +
        '<span style="font-size:12px;font-weight:800;color:' + pctColor + ';font-family:var(--f)">' + (gPct>=0 ? gPct+'%' : 'Sin empezar') + '</span>' +
      '</div>' +
      '<div style="padding:4px 12px">';

    g.items.forEach(function(item, idx) {
      var pct = item.s.total>0 ? Math.round(item.s.ok/item.s.total*100) : -1;
      var pc  = pct<0 ? 'var(--color-text-secondary)' : pct<75 ? '#F59E0B' : g.color;
      var sep = idx<g.items.length-1 ? 'border-bottom:0.5px solid var(--color-border-tertiary)' : '';

      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0 6px 20px;' + sep + '">' +
        '<span style="font-size:11px;color:var(--color-text-secondary);font-family:var(--f);flex:1">' + item.nombre + '</span>';

      if (pct >= 0) {
        html += '<div style="width:55px;height:5px;background:var(--gray-100);border-radius:3px;overflow:hidden;flex-shrink:0">' +
          '<div style="height:100%;border-radius:3px;background:' + g.color + ';width:' + pct + '%"></div>' +
        '</div>';
      }

      html += '<span style="font-size:10px;font-weight:500;color:' + pc + ';font-family:var(--f);min-width:48px;text-align:right">' +
        (pct>=0 ? pct+'%' : 'Sin empezar') +
      '</span></div>';
    });

    html += '</div>';
    card.innerHTML = html;
    el.appendChild(card);
  });
}

function renderRefuerzo() {
  var el = document.getElementById('p-refuerzo');
  if (!el) return;

  var mErr = ST.mates.errors || {};
  var lErr = (ST.lengua && ST.lengua.errors) ? ST.lengua.errors : {};
  var eErr = (ST.english && ST.english.errors) ? ST.english.errors : {};
  var scErr = (ST.sciences && ST.sciences.errors) ? ST.sciences.errors : {};

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
  var srSt = (srOk+srF > 0 && Math.round(srOk/(srOk+srF)*100) < 75)
    ? {pct:Math.round(srOk/(srOk+srF)*100), total:srOk+srF, fallos:srF}
    : null;

  var grupos = [
    { nombre:'Matemáticas', icono:'🔢', pill:'background:#EDE9FE;color:#4C1D95',
      items:[
        {nombre:'Sumas y restas',   stats:srSt},
        {nombre:'Multiplicaciones', stats:getStats(mErr,'multi')},
        {nombre:'Problemas',        stats:getStats(mErr,'prob')},
        {nombre:'Mezcla',           stats:getStats(mErr,'mix')}
      ]
    },
    { nombre:'Lengua', icono:'📚', pill:'background:#FDF2F8;color:#9D174D',
      items:[
        {nombre:'Gramática B / V',  stats:getStats(lErr,'gram-bv')},
        {nombre:'Gramática G / J',  stats:getStats(lErr,'gram-gj')},
        {nombre:'Gramática C/Z/Q',  stats:getStats(lErr,'gram-czq')},
        {nombre:'Gramática LL / Y', stats:getStats(lErr,'gram-lly')},
        {nombre:'Gramática R / RR', stats:getStats(lErr,'gram-rr')},
        {nombre:'Comprensión',      stats:getStats(lErr,'comp')},
        {nombre:'Descripciones',    stats:getStats(lErr,'desc')}
      ]
    },
    { nombre:'English', icono:'<svg width="16" height="11" viewBox="0 0 60 40" style="border-radius:2px;vertical-align:middle"><rect width="60" height="40" fill="#012169"/><path d="M0,0L60,40M60,0L0,40" stroke="white" stroke-width="8"/><path d="M0,0L60,40M60,0L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0V40M0,20H60" stroke="white" stroke-width="13"/><path d="M30,0V40M0,20H60" stroke="#C8102E" stroke-width="7"/></svg>', pill:'background:#EFF6FF;color:#1D4ED8',
      items:[
        {nombre:'To Be',       stats:getStats(eErr,'tobe')},
        {nombre:'Modal Verbs', stats:getStats(eErr,'modals')},
        {nombre:'Vocabulary',  stats:getStats(eErr,'vocab')}
      ]
    },
    { nombre:'Sciences', icono:'🔬', pill:'background:#F0FDFA;color:#0F766E',
      items:[
        {nombre:'Invertebrates', stats:(function(){
          var ok=0,f=0;
          ['ex1','ex2','ex3','ex4','ex5','ex6','ex7','ex8','ex9','ex10'].forEach(function(k){
            ok+=scErr[k+'_ok']||0; f+=scErr[k+'_fail']||0;
          });
          var total=ok+f; if(!total) return null;
          var pct=Math.round(ok/total*100);
          return pct<75?{pct:pct,total:total,fallos:f}:null;
        })()},
        {nombre:'Mix', stats:getStats(scErr,'mix')}
      ]
    }
  ];

  grupos.forEach(function(g){ g.items = g.items.filter(function(i){ return i.stats; }); });
  var activos = grupos.filter(function(g){ return g.items.length > 0; });

  var maxLevel = 0;
  activos.forEach(function(g){
    g.items.forEach(function(i){ maxLevel = Math.max(maxLevel, urg(i.stats.pct).level); });
  });

  var banners = [
    {bg:'#DCFCE7',border:'#16A34A',icon:'🌟',tc:'#166534',sc:'#16A34A',
      title:'¡Todo por encima del 75%!',
      sub:'Está dominando todos los contenidos. Sigue practicando para mantener el nivel.'},
    {bg:'#EDE9FE',border:'#7C3AED',icon:'💪',tc:'#4C1D95',sc:'#6D28D9',
      title:'¡Casi lo tiene todo!',
      sub:'Está cerca del 75% en algunas áreas. Un poco más de práctica y lo conseguirá.'},
    {bg:'#FEF3C7',border:'#F59E0B',icon:'📖',tc:'#92400E',sc:'#B45309',
      title:'Hay cosas que reforzar',
      sub:'Algunas áreas necesitan más práctica. Mira los detalles abajo para saber por dónde empezar.'},
    {bg:'#FEE2E2',border:'#DC2626',icon:'⚠️',tc:'#991B1B',sc:'#B91C1C',
      title:'Hay áreas prioritarias',
      sub:'Hay contenidos con muchos fallos. Es importante practicarlos pronto para no quedarse atrás.'}
  ];

  var b = banners[maxLevel];
  el.innerHTML =
    '<div style="background:'+b.bg+';border:0.5px solid '+b.border+';border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
      '<div style="font-size:24px;flex-shrink:0">'+b.icon+'</div>' +
      '<div>' +
        '<div style="font-size:13px;font-weight:800;color:'+b.tc+';font-family:var(--f);margin-bottom:3px">'+b.title+'</div>' +
        '<div style="font-size:11px;color:'+b.sc+';font-family:var(--f);line-height:1.5">'+b.sub+'</div>' +
      '</div>' +
    '</div>';

  activos.forEach(function(g) {
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:12px;overflow:hidden;margin-bottom:8px';

    var html =
      '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--color-background-secondary);border-bottom:0.5px solid var(--color-border-tertiary)">' +
        '<span style="font-size:16px">'+g.icono+'</span>' +
        '<span style="font-size:13px;font-weight:800;color:var(--gray-800);font-family:var(--f);flex:1">'+g.nombre+'</span>' +
        '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;'+g.pill+'">'+g.items.length+' área'+(g.items.length>1?'s':'')+'</span>' +
      '</div>' +
      '<div style="padding:4px 12px">';

    g.items.sort(function(a,b){ return a.stats.pct-b.stats.pct; });
    g.items.forEach(function(item, idx) {
      var u = urg(item.stats.pct);
      var sep = idx<g.items.length-1 ? 'border-bottom:0.5px solid var(--color-border-tertiary)' : '';
      html +=
        '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;'+sep+'">' +
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
