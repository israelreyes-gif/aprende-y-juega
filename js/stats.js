/* =============================================
   STATS.JS — Fuente única de verdad para estadísticas
   
   Todas las vistas (home, padres, asignaturas)
   usan estas funciones. Nunca calculan por su cuenta.
   ============================================= */

/* ---- Definición de ejercicios por asignatura, por curso ----
   Registro por curso, igual que CONFIG.curso: cada curso tiene su
   propia lista de asignaturas y ejercicios, sin compartir ninguna
   clave entre sí. Zona de padres siempre lee la entrada del curso
   seleccionado (ver statsGetAll más abajo), así que nunca se mezclan
   ni aparecen huecos de un curso mientras se ve otro. */
var STATS_BY_CURSO = {

  3: [
    {
      key:   'mates',
      name:  'Matemáticas',
      icon:  '🔢',
      color: '#534AB7',
      pill:  'background:#EDE9FE;color:#4C1D95',
      items: [
        { key: 'mates-suma',  name: 'Sumas y restas' },
        { key: 'mates-multi', name: 'Multiplicaciones' },
        { key: 'mates-prob',  name: 'Problemas' },
        { key: 'mates-mix',   name: 'Mezcla' }
      ]
    },
    {
      key:   'lengua',
      name:  'Lengua',
      icon:  '📚',
      color: '#D4537E',
      pill:  'background:#FDF2F8;color:#9D174D',
      items: [
        { key: 'lengua-gram-bv',  name: 'Gramática B / V' },
        { key: 'lengua-gram-gj',  name: 'Gramática G / J' },
        { key: 'lengua-gram-czq', name: 'Gramática C / Z / Q' },
        { key: 'lengua-gram-lly', name: 'Gramática LL / Y' },
        { key: 'lengua-gram-rr',  name: 'Gramática R / RR' },
        { key: 'lengua-comp',     name: 'Comprensión lectora' },
        { key: 'lengua-desc',     name: 'Descripciones' },
        { key: 'lengua-dict',     name: 'Dictado' }
      ]
    },
    {
      key:   'english',
      name:  'English',
      icon:  'flag',
      color: '#378ADD',
      pill:  'background:#EFF6FF;color:#1D4ED8',
      items: [
        { key: 'english-tobe',   name: 'To Be' },
        { key: 'english-modals', name: 'Modal Verbs' },
        { key: 'english-vocab',  name: 'Vocabulary' }
      ]
    },
    {
      key:   'sciences',
      name:  'Sciences',
      icon:  '🔬',
      color: '#0D9488',
      pill:  'background:#F0FDFA;color:#0F766E',
      items: [
        { key: 'sciences-invertebrates', name: 'Invertebrates' },
        { key: 'sciences-mix',           name: 'Mix' }
      ]
    },
    {
      key:   'sociales',
      name:  'Sociales',
      icon:  '🌍',
      color: 'var(--sociales)',
      pill:  'background:#E1F5EE;color:#085041',
      items: [
        { key: 'sociales-vf',         name: 'Verdadero/Falso' },
        { key: 'sociales-relacionar', name: 'Relacionar' },
        { key: 'sociales-completar',  name: 'Completar frase' }
      ]
    },
    {
      key:   'vacaciones',
      name:  'Vacaciones',
      icon:  '🏖️',
      color: '#D97706',
      pill:  'background:#FFFBEB;color:#92400E',
      items: [
        { key: 'vacaciones-mates-suma',             name: 'Sumas y restas' },
        { key: 'vacaciones-mates-multi',            name: 'Multiplicaciones' },
        { key: 'vacaciones-mates-prob',             name: 'Problemas' },
        { key: 'vacaciones-lengua-gram-bv',         name: 'Gramática B / V' },
        { key: 'vacaciones-lengua-gram-gj',         name: 'Gramática G / J' },
        { key: 'vacaciones-lengua-gram-czq',        name: 'Gramática C / Z / Q' },
        { key: 'vacaciones-lengua-gram-lly',        name: 'Gramática LL / Y' },
        { key: 'vacaciones-lengua-gram-rr',         name: 'Gramática R / RR' },
        { key: 'vacaciones-english-tobe',           name: 'English To Be' },
        { key: 'vacaciones-english-modals',         name: 'English Modal Verbs' },
        { key: 'vacaciones-english-vocab',          name: 'English Vocabulary' },
        { key: 'vacaciones-english-wo',             name: 'English Word Order' },
        { key: 'vacaciones-sciences-invertebrates', name: 'Sciences Invertebrates' },
        { key: 'vacaciones-sciences-mix',           name: 'Sciences Mix' },
        { key: 'vacaciones-sociales-vf',            name: 'Sociales V/F' },
        { key: 'vacaciones-sociales-relacionar',    name: 'Sociales Relacionar' },
        { key: 'vacaciones-sociales-completar',     name: 'Sociales Completar' }
      ]
    }
  ],

  4: [
    {
      key:   'english',
      name:  'English',
      icon:  'flag',
      color: '#378ADD',
      pill:  'background:#EFF6FF;color:#1D4ED8',
      items: [
        // Verb Tenses: hueco reservado para cada uno de los 7 tiempos
        // (hoy solo son tarjetas "Coming soon" en la pantalla de
        // Exercises) — cuando se construya cada ejercicio, ya tiene
        // su clave lista aquí, sin tocar este archivo otra vez.
        { key: 'english-tobe-c4',            name: 'To Be' },
        { key: 'english-tobe-past-c4',       name: 'To Be — Past' },
        { key: 'english-simple-present-c4',  name: 'Simple Present' },
        { key: 'english-simple-past-c4',     name: 'Simple Past' },
        { key: 'english-ing-present-c4',     name: 'Present Continuous' },
        { key: 'english-ing-past-c4',        name: 'Past Continuous' },
        { key: 'english-future-c4',          name: 'Future' },
        { key: 'english-vocab-c4',           name: 'Vocabulary' }
      ]
    }
    // Mates, Lengua, Sciences y Sociales de 4º se añaden aquí en
    // cuanto tengan sus propios ejercicios — no antes, para no
    // inventar categorías que todavía no existen.
  ]

};

var UK_FLAG_SMALL = '<svg width="16" height="11" viewBox="0 0 60 40" style="border-radius:2px;vertical-align:middle"><rect width="60" height="40" fill="#012169"/><path d="M0,0L60,40M60,0L0,40" stroke="white" stroke-width="8"/><path d="M0,0L60,40M60,0L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0V40M0,20H60" stroke="white" stroke-width="13"/><path d="M30,0V40M0,20H60" stroke="#C8102E" stroke-width="7"/></svg>';

/* ---- Helper: % de acierto por clave de error ---- */
function statsGetItemPct(errors, key) {
  var ok    = errors[key + '_ok']    || 0;
  var fail  = errors[key + '_fail']  || 0;
  var total = ok + fail;
  if (!total) return null; // sin datos
  return {
    ok:    ok,
    fail:  fail,
    total: total,
    pct:   Math.round(ok / total * 100)
  };
}

/* ---- Lista de asignaturas del curso actualmente cargado (cursoActual) ---- */
function statsSubjectsCurso() {
  return STATS_BY_CURSO[cursoActual] || [];
}

/* ---- Stats completas de una asignatura ---- */
function statsGetSubject(subjectKey) {
  var def = statsSubjectsCurso().find(function(s){ return s.key === subjectKey; });
  if (!def) return null;

  var stData = ST[subjectKey] || {};
  var errors = stData.errors || {};

  var items = def.items.map(function(item) {
    var r = statsGetItemPct(errors, item.key);
    return {
      key:   item.key,
      name:  item.name,
      ok:    r ? r.ok    : 0,
      fail:  r ? r.fail  : 0,
      total: r ? r.total : 0,
      pct:   r ? r.pct   : null  // null = sin datos
    };
  });

  // Total de la asignatura = suma de todos sus items
  var totalOk  = items.reduce(function(s, i){ return s + i.ok;    }, 0);
  var totalEx  = items.reduce(function(s, i){ return s + i.total; }, 0);

  return {
    key:      def.key,
    name:     def.name,
    icon:     def.icon,
    color:    def.color,
    pill:     def.pill,
    ok:       totalOk,
    total:    totalEx,
    pct:      totalEx > 0 ? Math.round(totalOk / totalEx * 100) : null,
    pts:      stData.pts   || 0,
    streak:   stData.streak || 0,
    hoy:      stData.hoy   || 0,
    hoyOk:    stData.hoyOk || 0,
    items:    items
  };
}

/* ---- Stats de todas las asignaturas del curso actual ---- */
function statsGetAll() {
  return statsSubjectsCurso().map(function(s){ return statsGetSubject(s.key); });
}

/* ---- Ejercicios a reforzar (por debajo de CONFIG.progreso.umbralRefuerzo) ----
   excludeKeys: array opcional de claves de asignatura a excluir (ej. ['vacaciones']) */
function statsGetToReforzar(excludeKeys) {
  excludeKeys = excludeKeys || [];
  var weak = [];
  statsGetAll().forEach(function(subject) {
    if (excludeKeys.indexOf(subject.key) !== -1) return;
    subject.items.forEach(function(item) {
      if (item.total > 0 && item.pct < CONFIG.progreso.umbralRefuerzo) {
        weak.push({
          key:         item.key,
          name:        item.name,
          subjectName: subject.name,
          subjectPill: subject.pill,
          pct:         item.pct,
          fail:        item.fail
        });
      }
    });
  });
  // Ordenar por más fallos primero
  return weak.sort(function(a, b){ return b.fail - a.fail; });
}

/* ---- Urgencia visual según el % (círculo de color + badge) ---- */
function statsRefuerzoUrgencia(pct) {
  if (pct < 50) return { bg:'#FCA5A5', tc:'#991B1B', bb:'#FEE2E2', bc:'#DC2626', badge:'Prioritario' };
  if (pct < 65) return { bg:'#FDE68A', tc:'#92400E', bb:'#FEF3C7', bc:'#D97706', badge:'A mejorar' };
  return { bg:'#C4B5FD', tc:'#4C1D95', bb:'#EDE9FE', bc:'#6D28D9', badge:'Cerca del ' + CONFIG.progreso.umbralRefuerzo + '%' };
}

/* ---- HTML de la tarjeta "a reforzar" (círculo % + nombre + urgencia).
   Mismo diseño en zona de padres y en Vacaciones. ----
   weak: resultado de statsGetToReforzar()
   emptyMsg: texto de la segunda línea cuando no hay nada que reforzar */
function statsRefuerzoHtml(weak, emptyMsg) {
  if (weak.length === 0) {
    return '<div style="background:#DCFCE7;border:0.5px solid #16A34A;border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px">'
      + '<div style="font-size:24px;flex-shrink:0">🌟</div><div>'
      + '<div style="font-size:13px;font-weight:800;color:#166534;font-family:var(--f);margin-bottom:3px">¡Todo por encima del ' + CONFIG.progreso.umbralRefuerzo + '%!</div>'
      + '<div style="font-size:11px;color:#16A34A;font-family:var(--f);line-height:1.5">' + (emptyMsg || 'Está dominando todos los contenidos.') + '</div>'
      + '</div></div>';
  }
  var html = '<div style="background:white;border:0.5px solid var(--gray-200);border-radius:12px;overflow:hidden">';
  weak.forEach(function(w, idx) {
    var u = statsRefuerzoUrgencia(w.pct);
    var sep = idx < weak.length - 1 ? 'border-bottom:0.5px solid var(--gray-100)' : '';
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;' + sep + '">'
      + '<div style="width:38px;height:38px;border-radius:50%;background:' + u.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
      + '<span style="font-size:10px;font-weight:800;color:' + u.tc + ';font-family:var(--f)">' + w.pct + '%</span></div>'
      + '<div style="flex:1"><div style="font-size:12px;font-weight:700;color:var(--gray-800);font-family:var(--f)">' + w.name + '</div>'
      + '<div style="font-size:10px;color:var(--gray-400);margin-top:1px">' + w.subjectName + '</div></div>'
      + '<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;background:' + u.bb + ';color:' + u.bc + '">' + u.badge + '</span></div>';
  });
  html += '</div>';
  return html;
}

/* ---- Icono de asignatura (con UK flag para English) ---- */
function statsIconHtml(icon, size) {
  size = size || 15;
  if (icon === 'flag') return UK_FLAG_SMALL;
  return '<span style="font-size:' + size + 'px">' + icon + '</span>';
}

/* ---- Formato de porcentaje ---- */
function statsPctStr(pct) {
  return pct === null ? 'Sin empezar' : pct + '%';
}

/* ---- Color según umbral 75% ---- */
function statsColor(pct, color, nullColor) {
  if (pct === null) return nullColor || 'var(--gray-400)';
  if (pct < CONFIG.progreso.umbralRefuerzo) return 'var(--vacaciones)';
  return color || '#16A34A';
}
