/* =============================================
   MEDALS.JS — Sistema de medallas y ranking
   Los rangos en si viven en config.js (CONFIG.medallas),
   para añadir uno nuevo hay que editar alli, no aqui.
   ============================================= */

var MEDALS = CONFIG.medallas;

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
  ['mates-medal', 'lengua-medal', 'english-medal', 'sciences-medal', 'sociales-medal'].forEach(function(id) {
    var e = document.getElementById(id); if (e) e.textContent = short;
  });
}
