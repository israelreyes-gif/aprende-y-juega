/* =============================================
   CALENDARIO.JS — Calendario de estudio
   Mini calendario por asignatura + vista completa en home
   ============================================= */

/* ---- Helpers ---- */
function calTodayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function calDaysInMonth(year, month) {
  return new Date(year, month+1, 0).getDate();
}

function calFirstDOW(year, month) {
  var d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // lunes=0
}

function calGetDayData(subject) {
  // Retorna un objeto {YYYY-MM-DD: 'done'|'partial'} con los días que tiene datos el sujeto
  var errors = ST[subject] && ST[subject].errors ? ST[subject].errors : {};
  // weekDays solo tiene los días de esta semana, usamos los errors para detectar actividad
  // Como no tenemos histórico de días por asignatura, usamos ST.weekDays para los días generales
  var days = {};
  (ST.weekDays || []).forEach(function(d) { days[d] = 'done'; });
  return days;
}

/* ---- Render mini calendario (en menú de asignatura) ---- */
function renderMiniCalendario(containerId, subject, color) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  var today = new Date();
  var year  = today.getFullYear();
  var month = today.getMonth();
  var todayDay = today.getDate();
  var daysInMonth = calDaysInMonth(year, month);
  var firstDOW    = calFirstDOW(year, month);

  // Días de la semana
  var headers = ['L','M','X','J','V','S','D'];
  headers.forEach(function(h) {
    var div = document.createElement('div');
    div.style.cssText = 'text-align:center;font-size:9px;font-weight:500;color:var(--gray-400);padding-bottom:2px';
    div.textContent = h;
    el.appendChild(div);
  });

  // Celdas vacías iniciales
  for (var i = 0; i < firstDOW; i++) {
    el.appendChild(document.createElement('div'));
  }

  var s = ST[subject] || {};
  var streak = s.streak || 0;
  var totalOk = s.totalOk || 0;
  var total   = s.total   || 0;
  var pts     = s.pts     || 0;

  // Días con actividad — usamos weekDays como proxy
  var activeDays = {};
  (ST.weekDays || []).forEach(function(d) {
    var dayNum = parseInt(d.split('-')[2]);
    activeDays[dayNum] = 'done';
  });

  for (var d = 1; d <= daysInMonth; d++) {
    var cell = document.createElement('div');
    var isToday  = d === todayDay;
    var isDone   = !isToday && activeDays[d] === 'done' && d <= todayDay;
    var isFuture = d > todayDay;

    cell.style.cssText = 'border-radius:5px;display:flex;align-items:center;justify-content:center;height:28px;font-size:11px;font-weight:500;transition:all .1s;';

    if (isToday) {
      cell.style.cssText += 'background:' + color + '22;color:' + color + ';outline:1.5px solid ' + color + ';font-weight:700';
    } else if (isDone) {
      cell.style.cssText += 'background:#EAF3DE;color:#27500A';
    } else if (isFuture) {
      cell.style.cssText += 'color:var(--gray-300);opacity:.5';
    } else {
      cell.style.cssText += 'color:var(--gray-400)';
    }
    cell.textContent = d;
    el.appendChild(cell);
  }

  // Actualizar stats compactas
  setEl(containerId + '-streak', streak > 0 ? '🔥 ' + streak : '—');
  setEl(containerId + '-dias', (Object.keys(activeDays).length || 0).toString());
  setEl(containerId + '-pct', total > 0 ? Math.round(totalOk/total*100) + '%' : '—');
  setEl(containerId + '-pts', '⭐ ' + pts);
}

/* ---- Render calendario completo (home) ---- */
function renderCalendarioHome() {
  calSetTab('mes');
  renderCalMes();
  renderCalObjetivos();
  renderCalEventos();
}

function calSetTab(t) {
  ['mes','objetivos','eventos'].forEach(function(tab) {
    var el = document.getElementById('cal-tab-' + tab);
    if (el) el.style.display = tab === t ? 'block' : 'none';
  });
  document.querySelectorAll('.cal-tab-btn').forEach(function(b) {
    b.classList.toggle('cal-tab-active', b.dataset.tab === t);
  });
}

function renderCalMes() {
  var el = document.getElementById('cal-mes-grid');
  if (!el) return;
  el.innerHTML = '';

  var today = new Date();
  var year  = today.getFullYear();
  var month = today.getMonth();
  var todayDay = today.getDate();
  var daysInMonth = calDaysInMonth(year, month);
  var firstDOW    = calFirstDOW(year, month);

  var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  setEl('cal-mes-lbl', meses[month] + ' ' + year);

  var activeDays = {};
  (ST.weekDays || []).forEach(function(d) {
    var dayNum = parseInt(d.split('-')[2]);
    activeDays[dayNum] = 'done';
  });

  for (var i = 0; i < firstDOW; i++) {
    el.appendChild(document.createElement('div'));
  }

  for (var d = 1; d <= daysInMonth; d++) {
    var cell = document.createElement('div');
    var isToday  = d === todayDay;
    var isDone   = !isToday && activeDays[d] && d < todayDay;
    var isFuture = d > todayDay;

    cell.style.cssText = 'border-radius:6px;display:flex;align-items:center;justify-content:center;height:34px;font-size:12px;font-weight:500;';
    if (isToday)       cell.style.cssText += 'background:#EEEDFE;color:#3C3489;outline:2px solid #7F77DD;font-weight:700';
    else if (isDone)   cell.style.cssText += 'background:#EAF3DE;color:#27500A';
    else if (isFuture) cell.style.cssText += 'color:var(--gray-300);opacity:.4';
    else               cell.style.cssText += 'color:var(--gray-400)';
    cell.textContent = d;
    el.appendChild(cell);
  }

  // Stats generales
  var streak = ST.streak || 0;
  var daysStudied = (ST.weekDays || []).length;
  setEl('cal-stat-dias', daysStudied);
  setEl('cal-stat-racha', '🔥 ' + streak);
  setEl('cal-stat-mejor', streak); // simplificado
}

function renderCalObjetivos() {
  var el = document.getElementById('cal-obj-list');
  if (!el) return;
  el.innerHTML = '';

  var subjects = [
    { key:'lengua',    emoji:'📚', name:'Lengua',        color:'#993556', bg:'#FBEAF0', meta:4 },
    { key:'english',   emoji:'🇬🇧', name:'English',       color:'#185FA5', bg:'#E6F1FB', meta:3 },
    { key:'mates',     emoji:'🔢', name:'Matemáticas',   color:'#7F77DD', bg:'#EEEDFE', meta:3 },
    { key:'sciences',  emoji:'🔬', name:'Sciences',      color:'#0F6E56', bg:'#E1F5EE', meta:2 },
  ];

  var weekDays = (ST.weekDays || []).length;

  subjects.forEach(function(s) {
    var sub = ST[s.key] || {};
    var done = sub.hoy > 0 ? Math.min(weekDays, s.meta) : 0;
    var pct = Math.round(done / s.meta * 100);
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:0.5px solid var(--gray-100)';
    row.innerHTML =
      '<div style="width:32px;height:32px;border-radius:50%;background:'+s.bg+';display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">'+s.emoji+'</div>'+
      '<div style="flex:1">'+
        '<div style="font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">'+s.name+'</div>'+
        '<div style="height:5px;border-radius:3px;background:var(--gray-100);overflow:hidden;margin-top:5px">'+
          '<div style="height:100%;border-radius:3px;background:'+s.color+';width:'+pct+'%;transition:width .4s ease"></div>'+
        '</div>'+
        '<div style="font-size:10px;color:var(--gray-400);margin-top:3px;font-family:var(--f)">'+done+' / '+s.meta+' días</div>'+
      '</div>'+
      '<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:'+s.bg+';color:'+s.color+';font-family:var(--f);font-weight:700">'+(pct >= 100 ? '✓' : done+'/'+s.meta)+'</span>';
    el.appendChild(row);
  });
}

function renderCalEventos() {
  // Los eventos son fijos por ahora — en el futuro vendrán de un JSON
  // Ya están en el HTML estático
}
