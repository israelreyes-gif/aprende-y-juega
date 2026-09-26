/* =============================================
   UI.JS — Renderizado de las pantallas home de cada curso
   (racha, calendario, stats por asignatura) y de widgets
   compartidos entre asignaturas (hub de English, hub de
   Matemáticas...).
   ============================================= */

var STATS_SUBJECT_FALLBACK = { pts: 0, hoy: 0, pct: null };

function updateHomeUI() {
  updateStreakUI();

  var subjects = statsGetAll();

  var m = statsGetSubject('mates') || STATS_SUBJECT_FALLBACK;
  setEl('home-mates-pts', m.pts);
  setEl('home-mates-pct', statsPctStr(m.pct));

  var l = statsGetSubject('lengua') || STATS_SUBJECT_FALLBACK;
  setEl('home-lengua-pts', l.pts);
  setEl('home-lengua-pct', statsPctStr(l.pct));

  var sc = statsGetSubject('sciences') || STATS_SUBJECT_FALLBACK;
  setEl('home-sciences-pts', sc.pts);
  setEl('home-sciences-pct', statsPctStr(sc.pct));

  var soc = statsGetSubject('sociales') || STATS_SUBJECT_FALLBACK;
  setEl('home-sociales-pts', soc.pts);
  setEl('home-sociales-pct', statsPctStr(soc.pct));

  var en = statsGetSubject('english') || STATS_SUBJECT_FALLBACK;
  setEl('home-english-pts', en.pts);
  setEl('home-english-pct', statsPctStr(en.pct));

  updateErrorsPanel();
}
