/* =============================================
   MEDALS.JS — Sistema de medallas y ranking
   Para añadir un nuevo rango: añadir un objeto
   al array MEDALS con {pts, icon, name, next, nn}
   ============================================= */

var MEDALS = [
  { pts: 0,    icon: '🎖️', name: 'Recién llegada',       next: 50,   nn: 'Soldado valiente' },
  { pts: 50,   icon: '🥉', name: 'Soldado valiente',     next: 300,  nn: 'Cabo heroico' },
  { pts: 300,  icon: '🥈', name: 'Cabo heroico',         next: 700,  nn: 'Sargento brillante' },
  { pts: 700,  icon: '🥇', name: 'Sargento brillante',   next: 1200, nn: 'Capitana estelar' },
  { pts: 1200, icon: '🏅', name: 'Capitana estelar',     next: 2000, nn: 'Generala suprema' },
  { pts: 2000, icon: '👑', name: 'Generala suprema',     next: 3500, nn: 'Emperadora galáctica' },
  { pts: 3500, icon: '🌟', name: 'Emperadora galáctica', next: 6000, nn: 'Reina del universo' },
  { pts: 6000, icon: '✨', name: 'Reina del universo',   next: null, nn: null }
];

function getMedal(pts) {
  var m = MEDALS[0];
  for (var i = 0; i < MEDALS.length; i++) {
    if (pts >= MEDALS[i].pts) m = MEDALS[i];
  }
  return m;
}

function awardPts(n, subject) {
  var before = getMedal(ST.totalPts);
  addPts(n, subject);
  var after = getMedal(ST.totalPts);
  updateMedalUI();
  if (after.pts > before.pts) {
    setTimeout(function() {
      showToast('🎉 ¡Nueva medalla! ' + after.icon + ' ' + after.name);
    }, 400);
  }
}

function updateMedalUI() {
  if (typeof refreshAllAvatars === "function") refreshAllAvatars();
  if (typeof checkNewUnlocks === "function") checkNewUnlocks();
  var m = getMedal(ST.totalPts);
  var el;
  if ((el = document.getElementById('home-pts-pill')))  el.textContent = '⭐ ' + ST.totalPts + ' pts';
  if ((el = document.getElementById('medal-emoji')))    el.textContent = m.icon;
  if ((el = document.getElementById('medal-rank')))     el.textContent = m.icon + ' ' + m.name;
  if ((el = document.getElementById('medal-next'))) {
    el.textContent = m.next
      ? (ST.totalPts + ' / ' + m.next + ' pts → ' + m.nn)
      : '¡Rango máximo! 🌟 Campeona del universo';
  }
  if ((el = document.getElementById('medal-fill'))) {
    var fillPct = m.next
      ? Math.min(100, Math.round((ST.totalPts - m.pts) / (m.next - m.pts) * 100))
      : 100;
    el.style.width = fillPct + '%';
  }
  // Badge en las cabeceras de asignaturas
  var short = m.icon + ' ' + m.name.split(' ')[0];
  ['mates-medal', 'lengua-medal'].forEach(function(id) {
    var e = document.getElementById(id); if (e) e.textContent = short;
  });
}
