/* =============================================
   PADRES.JS — Áwerea para padres
   ============================================= */

var padresView          = 'charts';
var padresSubjectIdx    = null;
var padresBarChart      = null;
var padresRadarChart    = null;
var padresPinBuf        = '';
var padresPerfilesCache = [];

var UK_FLAG = '<svg width="20" height="13" viewBox="0 0 60 40" style="border-radius:2px;vertical-align:middle"><rect width="60" height="40" fill="#012169"/><path d="M0,0L60,40M60,0L0,40" stroke="white" stroke-width="8"/><path d="M0,0L60,40M60,0L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0V40M0,20H60" stroke="white" stroke-width="13"/><path d="M30,0V40M0,20H60" stroke="#C8102E" stroke-width="7"/></svg>';

/* ---- Entrada principal ---- */
function renderPadres() {
  padresSubjectIdx = null;
  fetch(API_URL + '/perfiles')
    .then(function(r) { return r.json(); })
    .then(function(perfiles) {
      padresPerfilesCache = perfiles;
      _renderChips(perfiles);
      document.getElementById('p-main').style.display = 'none';
      // Auto-seleccionar perfil activo
      if (perfilActivoId && perfiles.some(function(p){ return p.id === perfilActivoId; })) {
        padresSelectPerfil(perfilActivoId);
      }
    });
}

/* ---- Renderizar chips (solo UI, sin side-effects) ---- */
function _renderChips(perfiles) {
  var el = document.getElementById('p-chips');
  if (!el) return;
  el.innerHTML = '';
  perfiles.forEach(function(p) {
    var isSel = p.id === perfilActivoId;
    var chip = document.createElement('div');
    chip.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;'
      + 'padding:8px 10px;border-radius:12px;min-width:68px;transition:all .15s;'
      + (isSel ? 'border:2px solid var(--purple);background:#EDE9FE' : 'border:1.5px solid var(--gray-200);background:white');
    chip.innerHTML =
      '<div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid ' + (isSel ? 'var(--purple)' : 'var(--gray-200)') + '">'
      + '<svg data-avatar width="44" height="44" viewBox="0 0 130 180" xmlns="http://www.w3.org/2000/svg"></svg>'
      + '</div>'
      + '<div style="font-size:11px;font-weight:700;font-family:var(--f);color:' + (isSel ? 'var(--purple)' : 'var(--gray-800)') + '">' + p.nombre + '</div>';
    chip.addEventListener('click', function(){ padresSelectPerfil(p.id); });
    el.appendChild(chip);
    var svg = chip.querySelector('[data-avatar]');
    if (svg) drawAvatarSVG(svg, { skin:parseInt(p.skin)||0, hairColor:parseInt(p.hair_color)||1, hair:parseInt(p.hair)||0, unlocked:[] }, 0);
  });
}

/* ---- Seleccionar perfil ---- */
function padresSelectPerfil(id) {
  setPerfilActivoId(id, function() {
    console.log('[Padres] Perfil cargado:', id, '| totalPts:', ST.totalPts, '| mates.errors:', JSON.stringify(ST.mates.errors));
    _renderChips(padresPerfilesCache);
    renderPadresData();
    document.getElementById('p-main').style.display = 'block';
    document.getElementById('p-confirm-name').textContent = getNombre() || 'este perfil';
  }, true);
}

/* ---- Renderizar datos del perfil ---- */
function renderPadresData() {
  var medals = [
    {icon:'🎖️',name:'Recién llegada',req:0},{icon:'🥉',name:'Soldado',req:50},
    {icon:'🥈',name:'Cabo',req:100},{icon:'🥇',name:'Sargento',req:200},
    {icon:'🏅',name:'Capitana',req:300},{icon:'👑',name:'Generala',req:400},
    {icon:'🌟',name:'Emperadora',req:450},{icon:'✨',name:'Reina',req:500}
  ];
  var curMedal = medals[0];
  medals.forEach(function(m){ if (ST.totalPts >= m.req) curMedal = m; });

  setEl('p-pts', ST.totalPts);
  setEl('p-medal', curMedal.icon + ' ' + curMedal.name);
  setEl('p-streak', ST.streak || 0);

  var hoy    = (ST.mates.hoy||0)+(ST.lengua.hoy||0)+((ST.sciences&&ST.sciences.hoy)||0)+((ST.english&&ST.english.hoy)||0)+((ST.sociales&&ST.sociales.hoy)||0);
  var hoyOk  = (ST.mates.hoyOk||0)+(ST.lengua.hoyOk||0)+((ST.sciences&&ST.sciences.hoyOk)||0)+((ST.english&&ST.english.hoyOk)||0)+((ST.sociales&&ST.sociales.hoyOk)||0);
  var total  = (ST.mates.total||0)+(ST.lengua.total||0)+((ST.sciences&&ST.sciences.total)||0)+((ST.english&&ST.english.total)||0)+((ST.sociales&&ST.sociales.total)||0);
  var totalOk= (ST.mates.totalOk||0)+(ST.lengua.totalOk||0)+((ST.sciences&&ST.sciences.totalOk)||0)+((ST.english&&ST.english.totalOk)||0)+((ST.sociales&&ST.sociales.totalOk)||0);

  setEl('p-hoy', hoy);
  setEl('p-hoy-ok', hoyOk + ' correctos');
  setEl('p-pct', total > 0 ? Math.round(totalOk/total*100) + '%' : '—');

  renderPadresWeekBars();
  setPadresView(padresView);
  renderRefuerzo();
}

function renderPadresWeekBars() {
  var barsEl = document.getElementById('p-week-bars');
  var labelsEl = document.getElementById('p-week-labels');
  if (!barsEl) return;
  var days = ['L','M','X','J','V','S','D'];
  var today = new Date().getDay(), todayIdx = today === 0 ? 6 : today - 1;
  var monday = new Date();
  monday.setDate(monday.getDate() - todayIdx);
  monday.setHours(0,0,0,0);
  barsEl.innerHTML = ''; labelsEl.innerHTML = '';
  days.forEach(function(day, i) {
    var d = new Date(monday); d.setDate(monday.getDate() + i);
    var ds = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    var done = ST.weekDays && ST.weekDays.includes(ds), isPast = i <= todayIdx;
    var bar = document.createElement('div');
    bar.style.cssText = 'flex:1;border-radius:4px 4px 0 0;min-height:4px;background:' + (done?'#7C3AED':isPast?'#E5E7EB':'#F3F4F6') + ';height:' + (done?'80%':isPast?'15%':'8%') + ';opacity:' + (i>todayIdx?'0.3':'1');
    barsEl.appendChild(bar);
    var lbl = document.createElement('div');
    lbl.style.cssText = 'flex:1;text-align:center;font-size:9px;color:' + (i===todayIdx?'#7C3AED':'var(--gray-400)') + ';font-weight:' + (i===todayIdx?'800':'600') + ';font-family:var(--f)';
    lbl.textContent = day; labelsEl.appendChild(lbl);
  });
}

/* ---- Toggle vistas ---- */
function setPadresView(v) {
  padresView = v;
  var btnC = document.getElementById('pvb-charts'), btnR = document.getElementById('pvb-raw');
  var vC = document.getElementById('p-view-charts'), vR = document.getElementById('p-view-raw');
  if (!btnC) return;
  if (v === 'charts') {
    btnC.style.background = 'var(--purple)'; btnC.style.color = 'white';
    btnR.style.background = 'white'; btnR.style.color = 'var(--purple)';
    vC.style.display = 'block'; vR.style.display = 'none';
    padresSubjectIdx = null;
    renderPadresBarChart();
    renderPadresRadarChart();
  } else {
    btnR.style.background = 'var(--purple)'; btnR.style.color = 'white';
    btnC.style.background = 'white'; btnC.style.color = 'var(--purple)';
    vC.style.display = 'none'; vR.style.display = 'block';
    renderSubjects();
  }
}

/* ---- Datos por asignatura ---- */
function getPadresSubjectData() {
  var mErr  = (ST.mates  && ST.mates.errors)    || {};
  var lErr  = (ST.lengua && ST.lengua.errors)   || {};
  var eErr  = (ST.english && ST.english.errors) || {};
  var scErr = (ST.sciences && ST.sciences.errors) || {};
  var soErr = (ST.sociales && ST.sociales.errors) || {};

  var srOk = (mErr['suma_ok']||0)+(mErr['resta_ok']||0);
  var srF  = (mErr['suma_fail']||0)+(mErr['resta_fail']||0);

  var gramOk=0, gramTotal=0;
  ['gram-bv','gram-gj','gram-czq','gram-lly','gram-rr'].forEach(function(k){
    gramOk+=(lErr[k+'_ok']||0); gramTotal+=(lErr[k+'_ok']||0)+(lErr[k+'_fail']||0);
  });

  var invOk=0, invTotal=0;
  ['ex1','ex2','ex3','ex4','ex5','ex6','ex7','ex8','ex9','ex10'].forEach(function(k){
    invOk+=(scErr[k+'_ok']||0); invTotal+=(scErr[k+'_ok']||0)+(scErr[k+'_fail']||0);
  });

  return [
    { name:'Mates', icon:'🔢', color:'#534AB7',
      total_ok: srOk+(mErr['multi_ok']||0)+(mErr['prob_ok']||0)+(mErr['mix_ok']||0),
      total_ex: srOk+srF+(mErr['multi_ok']||0)+(mErr['multi_fail']||0)+(mErr['prob_ok']||0)+(mErr['prob_fail']||0)+(mErr['mix_ok']||0)+(mErr['mix_fail']||0),
      items:[
        {name:'Sumas y restas', ok:srOk, total:srOk+srF},
        {name:'Multiplicaciones', ok:mErr['multi_ok']||0, total:(mErr['multi_ok']||0)+(mErr['multi_fail']||0)},
        {name:'Problemas', ok:mErr['prob_ok']||0, total:(mErr['prob_ok']||0)+(mErr['prob_fail']||0)},
        {name:'Mezcla', ok:mErr['mix_ok']||0, total:(mErr['mix_ok']||0)+(mErr['mix_fail']||0)}
      ]},
    { name:'Lengua', icon:'📚', color:'#D4537E',
      total_ok: gramOk+(lErr['comp_ok']||0)+(lErr['desc_ok']||0)+(lErr['dict_ok']||0),
      total_ex: gramTotal+(lErr['comp_ok']||0)+(lErr['comp_fail']||0)+(lErr['desc_ok']||0)+(lErr['desc_fail']||0)+(lErr['dict_ok']||0)+(lErr['dict_fail']||0),
      items:[
        {name:'Gramática', ok:gramOk, total:gramTotal},
        {name:'Comprensión', ok:lErr['comp_ok']||0, total:(lErr['comp_ok']||0)+(lErr['comp_fail']||0)},
        {name:'Descripciones', ok:lErr['desc_ok']||0, total:(lErr['desc_ok']||0)+(lErr['desc_fail']||0)},
        {name:'Dictado', ok:lErr['dict_ok']||0, total:(lErr['dict_ok']||0)+(lErr['dict_fail']||0)}
      ]},
    { name:'English', icon:'flag', color:'#378ADD',
      total_ok: (eErr['tobe_ok']||0)+(eErr['modals_ok']||0)+(eErr['vocab_ok']||0),
      total_ex: (eErr['tobe_ok']||0)+(eErr['tobe_fail']||0)+(eErr['modals_ok']||0)+(eErr['modals_fail']||0)+(eErr['vocab_ok']||0)+(eErr['vocab_fail']||0),
      items:[
        {name:'To Be', ok:eErr['tobe_ok']||0, total:(eErr['tobe_ok']||0)+(eErr['tobe_fail']||0)},
        {name:'Modal Verbs', ok:eErr['modals_ok']||0, total:(eErr['modals_ok']||0)+(eErr['modals_fail']||0)},
        {name:'Vocabulary', ok:eErr['vocab_ok']||0, total:(eErr['vocab_ok']||0)+(eErr['vocab_fail']||0)}
      ]},
    { name:'Sciences', icon:'🔬', color:'#1D9E75',
      total_ok: invOk+(scErr['mix_ok']||0),
      total_ex: invTotal+(scErr['mix_ok']||0)+(scErr['mix_fail']||0),
      items:[
        {name:'Invertebrates', ok:invOk, total:invTotal},
        {name:'Mix', ok:scErr['mix_ok']||0, total:(scErr['mix_ok']||0)+(scErr['mix_fail']||0)}
      ]},
    { name:'Sociales', icon:'🌍', color:'#0F6E56',
      total_ok: (soErr['vf_ok']||0)+(soErr['relacionar_ok']||0)+(soErr['completar_ok']||0),
      total_ex: (soErr['vf_ok']||0)+(soErr['vf_fail']||0)+(soErr['relacionar_ok']||0)+(soErr['relacionar_fail']||0)+(soErr['completar_ok']||0)+(soErr['completar_fail']||0),
      items:[
        {name:'Verdadero/Falso', ok:soErr['vf_ok']||0, total:(soErr['vf_ok']||0)+(soErr['vf_fail']||0)},
        {name:'Relacionar', ok:soErr['relacionar_ok']||0, total:(soErr['relacionar_ok']||0)+(soErr['relacionar_fail']||0)},
        {name:'Completar', ok:soErr['completar_ok']||0, total:(soErr['completar_ok']||0)+(soErr['completar_fail']||0)}
      ]}
  ];
}

function _pct(ok,total){ return total>0 ? Math.round(ok/total*100) : 0; }
function _pctStr(ok,total){ return total===0 ? 'Sin empezar' : _pct(ok,total)+'%'; }
function _barColor(v,total,color){ return total===0?'#D3D1C7':v<75?'#EF9F27':color; }

/* ---- Gráfica barras ---- */
function renderPadresBarChart() {
  if (padresBarChart){ padresBarChart.destroy(); padresBarChart=null; }
  if (typeof Chart==='undefined'){ setTimeout(renderPadresBarChart,300); return; }
  var subs = getPadresSubjectData();
  var labels,values,totals,colors,mainColor,clickable;
  if (padresSubjectIdx!==null){
    var s=subs[padresSubjectIdx];
    labels=s.items.map(function(i){return i.name;});
    values=s.items.map(function(i){return _pct(i.ok,i.total);});
    totals=s.items.map(function(i){return i.total;});
    colors=s.items.map(function(i){return _barColor(_pct(i.ok,i.total),i.total,s.color);});
    mainColor=s.color; clickable=false;
  } else {
    labels=subs.map(function(s){return s.name;});
    values=subs.map(function(s){return _pct(s.total_ok,s.total_ex);});
    totals=subs.map(function(s){return s.total_ex;});
    colors=subs.map(function(s){return _barColor(_pct(s.total_ok,s.total_ex),s.total_ex,s.color);});
    mainColor='#7C3AED'; clickable=true;
  }
  var ctx=document.getElementById('p-chart-bar');
  if (!ctx) return;
  padresBarChart=new Chart(ctx.getContext('2d'),{
    type:'bar',
    data:{labels:labels,datasets:[{data:values,backgroundColor:colors,borderRadius:6,borderSkipped:false}]},
    options:{
      responsive:true,
      onClick:function(e,els){
        if(!clickable||!els.length) return;
        padresSubjectIdx=els[0].index;
        var back=document.getElementById('p-bar-back'), title=document.getElementById('p-bar-title');
        if(back) back.style.cssText='display:flex;font-size:12px;font-weight:700;color:var(--purple);cursor:pointer;margin-bottom:10px;align-items:center;gap:4px';
        if(title) title.textContent=subs[padresSubjectIdx].name;
        renderPadresBarChart();
      },
      plugins:{legend:{display:false},tooltip:{enabled:false}},
      layout:{padding:{top:22}},
      scales:{
        y:{min:0,max:100,display:false,grid:{display:false}},
        x:{ticks:{font:{size:10}},grid:{display:false},border:{display:false}}
      },
      animation:{duration:250}
    },
    plugins:[{
      id:'barLbls',
      afterDatasetsDraw:function(chart){
        var ctx2=chart.ctx;
        chart.data.datasets.forEach(function(ds,i){
          chart.getDatasetMeta(i).data.forEach(function(bar,idx){
            var v=ds.data[idx],tot=totals[idx];
            ctx2.save();
            ctx2.fillStyle=colors[idx]==='#D3D1C7'?'#888':colors[idx]==='#EF9F27'?'#854F0B':mainColor;
            ctx2.font='700 11px system-ui';
            ctx2.textAlign='center'; ctx2.textBaseline='bottom';
            ctx2.fillText(tot===0?'—':v+'%',bar.x,bar.y-4);
            ctx2.restore();
          });
        });
      }
    }]
  });
}

function padresBackToMain() {
  padresSubjectIdx=null;
  var back=document.getElementById('p-bar-back'), title=document.getElementById('p-bar-title');
  if(back) back.style.display='none';
  if(title) title.textContent='Todas las asignaturas';
  renderPadresBarChart();
}

/* ---- Gráfica radar ---- */
function renderPadresRadarChart() {
  if (padresRadarChart){ padresRadarChart.destroy(); padresRadarChart=null; }
  if (typeof Chart==='undefined'){ setTimeout(renderPadresRadarChart,300); return; }
  var subs=getPadresSubjectData();
  var labels=subs.map(function(s){return s.name;});
  var values=subs.map(function(s){return _pct(s.total_ok,s.total_ex);});
  var totals=subs.map(function(s){return s.total_ex;});
  var ptColors=subs.map(function(s){return _barColor(_pct(s.total_ok,s.total_ex),s.total_ex,s.color);});
  var ctx=document.getElementById('p-chart-radar');
  if (!ctx) return;
  padresRadarChart=new Chart(ctx.getContext('2d'),{
    type:'radar',
    data:{labels:labels,datasets:[{data:values,backgroundColor:'rgba(124,58,237,.1)',borderColor:'#7C3AED',borderWidth:2,pointBackgroundColor:ptColors,pointRadius:4}]},
    options:{
      responsive:true,
      plugins:{legend:{display:false},tooltip:{enabled:false}},
      scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{size:9},backdropColor:'transparent'},pointLabels:{font:{size:10}},grid:{color:'rgba(0,0,0,.07)'},angleLines:{color:'rgba(0,0,0,.07)'}}},
      animation:{duration:250}
    },
    plugins:[{
      id:'radarLbls',
      afterDatasetsDraw:function(chart){
        var ctx2=chart.ctx,meta=chart.getDatasetMeta(0);
        if(!meta.data) return;
        meta.data.forEach(function(pt,idx){
          ctx2.save();
          ctx2.fillStyle=ptColors[idx]==='#D3D1C7'?'#888':ptColors[idx]==='#EF9F27'?'#854F0B':'#3C3489';
          ctx2.font='700 10px system-ui';
          ctx2.textAlign='center'; ctx2.textBaseline='middle';
          var angle=pt.angle-(Math.PI/2),offset=16;
          ctx2.fillText(totals[idx]===0?'—':values[idx]+'%',pt.x+Math.cos(angle)*offset,pt.y+Math.sin(angle)*offset);
          ctx2.restore();
        });
      }
    }]
  });
}

/* ---- Vista datos en crudo ---- */
function renderSubjects() {
  var el=document.getElementById('p-subjects'); if (!el) return;
  var subs=getPadresSubjectData(); el.innerHTML='';
  subs.forEach(function(s){
    var gPct=_pct(s.total_ok,s.total_ex), gStr=_pctStr(s.total_ok,s.total_ex);
    var gColor=s.total_ex===0?'var(--gray-400)':gPct<75?'#F59E0B':'#16A34A';
    var iconHtml=s.icon==='flag'?UK_FLAG:'<span style="font-size:15px">'+s.icon+'</span>';
    var card=document.createElement('div');
    card.style.cssText='background:white;border:0.5px solid var(--gray-200);border-radius:12px;overflow:hidden;margin-bottom:6px';
    var html='<div style="display:flex;align-items:center;gap:8px;padding:9px 12px;background:var(--gray-100);border-bottom:0.5px solid var(--gray-200)">'
      +'<span style="display:flex;align-items:center">'+iconHtml+'</span>'
      +'<span style="font-size:13px;font-weight:700;color:var(--gray-800);font-family:var(--f);flex:1">'+s.name+'</span>'
      +'<span style="font-size:12px;font-weight:700;color:'+gColor+';font-family:var(--f)">'+gStr+'</span></div>';
    s.items.forEach(function(item){
      var p2=_pct(item.ok,item.total), pc=item.total===0?'var(--gray-400)':p2<75?'#F59E0B':'#16A34A';
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 12px 7px 28px;border-bottom:0.5px solid var(--gray-100)">'
        +'<span style="font-size:12px;color:var(--gray-400);font-family:var(--f);flex:1">'+item.name+'</span>'
        +'<span style="font-size:12px;font-weight:700;color:'+pc+';font-family:var(--f)">'+_pctStr(item.ok,item.total)+'</span></div>';
    });
    card.innerHTML=html; el.appendChild(card);
  });
}

/* ---- Áreas a reforzar ---- */
function renderRefuerzo() {
  var el=document.getElementById('p-refuerzo'); if (!el) return;
  var subs=getPadresSubjectData(), weak=[];
  subs.forEach(function(s){
    s.items.forEach(function(item){
      if(item.total===0) return;
      var p2=_pct(item.ok,item.total);
      if(p2<75) weak.push({name:item.name,subject:s.name,pct:p2});
    });
  });
  weak.sort(function(a,b){return a.pct-b.pct;});
  if(weak.length===0){
    el.innerHTML='<div style="background:#DCFCE7;border:0.5px solid #16A34A;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px">'
      +'<div style="font-size:24px;flex-shrink:0">🌟</div>'
      +'<div><div style="font-size:13px;font-weight:800;color:#166534;font-family:var(--f);margin-bottom:3px">¡Todo por encima del 75%!</div>'
      +'<div style="font-size:11px;color:#16A34A;font-family:var(--f);line-height:1.5">Está dominando todos los contenidos.</div></div></div>';
    return;
  }
  function urg(p2){
    if(p2<50) return {bg:'#FCA5A5',tc:'#991B1B',bb:'#FEE2E2',bc:'#DC2626',badge:'Prioritario'};
    if(p2<65) return {bg:'#FDE68A',tc:'#92400E',bb:'#FEF3C7',bc:'#D97706',badge:'A mejorar'};
    return {bg:'#C4B5FD',tc:'#4C1D95',bb:'#EDE9FE',bc:'#6D28D9',badge:'Cerca del 75%'};
  }
  var html='<div style="background:white;border:0.5px solid var(--gray-200);border-radius:12px;overflow:hidden">';
  weak.forEach(function(w,idx){
    var u=urg(w.pct), sep=idx<weak.length-1?'border-bottom:0.5px solid var(--gray-100)':'';
    html+='<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;'+sep+'">'
      +'<div style="width:38px;height:38px;border-radius:50%;background:'+u.bg+';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
      +'<span style="font-size:10px;font-weight:800;color:'+u.tc+';font-family:var(--f)">'+w.pct+'%</span></div>'
      +'<div style="flex:1"><div style="font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">'+w.name+'</div>'
      +'<div style="font-size:10px;color:var(--gray-400);margin-top:1px">'+w.subject+'</div></div>'
      +'<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;background:'+u.bb+';color:'+u.bc+'">'+u.badge+'</span></div>';
  });
  html+='</div>'; el.innerHTML=html;
}

/* ---- Resetear ---- */
function resetearEstadisticas() {
  if (!confirm('¿Seguro que quieres borrar todas las estadísticas? Se mantendrán los puntos y el avatar.')) return;
  ST.mates.hoy=0; ST.mates.hoyOk=0; ST.mates.total=0; ST.mates.totalOk=0; ST.mates.errors={};
  ST.lengua.hoy=0; ST.lengua.hoyOk=0; ST.lengua.total=0; ST.lengua.totalOk=0; ST.lengua.errors={};
  ST.matesStreak=0; ST.gramStreak=0; ST.compStreak=0;
  saveState(); renderPadresData(); showToast('✅ Estadísticas reseteadas');
}

/* ---- Eliminar perfil ---- */
function padresEliminarPerfil() {
  var m=document.getElementById('p-modal-confirm'); if(m) m.style.display='flex';
}
function padresHideConfirm() {
  var m=document.getElementById('p-modal-confirm'); if(m) m.style.display='none';
}
function padresGoToPin() {
  padresHideConfirm();
  padresPinBuf=''; padresUpdateDots();
  var err=document.getElementById('p-pin-err'); if(err) err.style.display='none';
  var m=document.getElementById('p-modal-pin'); if(m) m.style.display='flex';
}
function padresCancelPin() {
  var m=document.getElementById('p-modal-pin'); if(m) m.style.display='none';
  padresPinBuf='';
}
function padresPk(d) {
  if(padresPinBuf.length>=4) return;
  padresPinBuf+=d; padresUpdateDots();
  if(padresPinBuf.length===4) setTimeout(padresCheckPin,150);
}
function padresPdel() {
  padresPinBuf=padresPinBuf.slice(0,-1); padresUpdateDots();
  var err=document.getElementById('p-pin-err'); if(err) err.style.display='none';
}
function padresUpdateDots() {
  for(var i=0;i<4;i++){
    var d=document.getElementById('p-pd'+i);
    if(d) d.style.background=i<padresPinBuf.length?'#7C3AED':'#E5E7EB';
  }
}
function padresCheckPin() {
  fetch(API_URL+'/config/pin_padres')
    .then(function(r){return r.json();})
    .then(function(data){
      if(padresPinBuf===(data&&data.valor?data.valor:'')){
        fetch(API_URL+'/perfiles/'+idAEliminar,{method:'DELETE'})
          .then(function(){
            padresCancelPin();
            setPerfilActivoId(null);
            document.getElementById('p-main').style.display='none';
            renderPadres();
            showToast('✅ Perfil eliminado');
          });
      } else {
        padresPinBuf=''; padresUpdateDots();
        var err=document.getElementById('p-pin-err'); if(err) err.style.display='block';
        if(navigator.vibrate) navigator.vibrate([100,50,100]);
      }
    })
    .catch(function(){
      padresPinBuf=''; padresUpdateDots();
      var err=document.getElementById('p-pin-err');
      if(err){err.textContent='Error de conexión';err.style.display='block';}
    });
}
