/* =============================================
   VACACIONES-CORE.JS — Sesion de repaso de verano
   Estado de sesion, construccion del pool de ejercicios,
   muestreo equilibrado por asignatura, dispatcher de
   ejercicios y pantalla de resultados.

   Los tipos de ejercicio en si (motores genericos y los
   construidos a mano) viven en vacaciones-exercises.js.
   ============================================= */

var VAC = {
  queue:   [],
  idx:     0,
  ok:      0,
  pts:     0,
  breakdown: {}
};

/* Modo activo del teclado numérico compartido: 'digits' (suma/resta) o 'free' (problemas) */
function _vacGetExerciseTypes() {
  var types = [];

  // Sciences — opción múltiple
  if (SubjectData.sciences && SubjectData.sciences.units) {
    SubjectData.sciences.units.forEach(function(unit) {
      if (unit.exercises && unit.exercises.length) {
        unit.exercises.forEach(function(ex) {
          types.push({ type: 'mc', subjectKey: 'vacaciones', exerciseKey: 'vacaciones-sciences-invertebrates',
            subjectName: 'Sciences', icon: '🔬', ex: ex });
        });
      }
    });
  }

  // Sociales — V/F, relacionar, completar
  if (SubjectData.socialesEx && SubjectData.socialesEx.units) {
    SubjectData.socialesEx.units.forEach(function(unit) {
      if (unit.ejercicios) {
        unit.ejercicios.forEach(function(ex) {
          var key = ex.tipo === 'vf' ? 'vacaciones-sociales-vf'
                  : ex.tipo === 'relacionar' ? 'vacaciones-sociales-relacionar'
                  : 'vacaciones-sociales-completar';
          types.push({ type: 'soc-' + ex.tipo, subjectKey: 'vacaciones', exerciseKey: key,
            subjectName: 'Sociales', icon: '🌍', ex: ex });
        });
      }
    });
  }

  // English — To Be / Modals
  if (SubjectData.english && SubjectData.english.units) {
    SubjectData.english.units.forEach(function(unit) {
      if (unit.exercises) {
        unit.exercises.forEach(function(ex) {
          var key = unit.id === 'modal-verbs' ? 'vacaciones-english-modals' : 'vacaciones-english-tobe';
          types.push({ type: 'en-mc', subjectKey: 'vacaciones', exerciseKey: key,
            subjectName: 'English', icon: UK_FLAG_SMALL, ex: ex, area: unit.id === 'modal-verbs' ? 'modals' : 'tobe' });
        });
      }
      // Word Order — las frases se extraen de las respuestas de los ejercicios,
      // igual que hace la pantalla normal de English (extractSentences)
      if (typeof extractSentences === 'function') {
        extractSentences(unit).forEach(function(s) {
          types.push({ type: 'en-wo', subjectKey: 'vacaciones', exerciseKey: 'vacaciones-english-wo',
            subjectName: 'English', icon: UK_FLAG_SMALL, ex: s, area: unit.id === 'modal-verbs' ? 'modals' : 'tobe' });
        });
      }
    });
  }

  // English — Vocabulario
  if (SubjectData.vocab && SubjectData.vocab.units) {
    SubjectData.vocab.units.forEach(function(unit) {
      unit.words.forEach(function(w) {
        types.push({ type: 'en-vocab-w2i', subjectKey: 'vacaciones', exerciseKey: 'vacaciones-english-vocab',
          subjectName: 'English', icon: UK_FLAG_SMALL, ex: w });
        types.push({ type: 'en-vocab-i2w', subjectKey: 'vacaciones', exerciseKey: 'vacaciones-english-vocab',
          subjectName: 'English', icon: UK_FLAG_SMALL, ex: w });
      });
    });
  }

  // Mates — generadores dinámicos
  ['suma','resta','multi','prob'].forEach(function(tipo) {
    for (var i = 0; i < 10; i++) {
      types.push({ type: 'mates-' + tipo, subjectKey: 'vacaciones',
        // 'resta' comparte estadísticas con 'suma' (stats.js las agrupa como "Sumas y restas")
        exerciseKey: 'vacaciones-mates-' + (tipo === 'resta' ? 'suma' : tipo),
        subjectName: 'Mates', icon: '🔢' });
    }
  });

  // Lengua — Gramática
  ['bv','gj','czq','lly','rr'].forEach(function(cat) {
    var data = SubjectData.gram[cat];
    if (data && data.length) {
      data.forEach(function(w) {
        types.push({ type: 'gram', subjectKey: 'vacaciones', exerciseKey: 'vacaciones-lengua-gram-' + cat,
          subjectName: 'Lengua', icon: '📚', ex: w, cat: cat });
      });
    }
  });

  return types;
}

function _vacShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ---- Repartir "slots" de forma equilibrada entre grupos ---- */
function _vacDistribute(totalSlots, numGroups) {
  var base = Math.floor(totalSlots / numGroups);
  var extra = totalSlots % numGroups;
  var slots = [];
  for (var i = 0; i < numGroups; i++) slots.push(base + (i < extra ? 1 : 0));
  return _vacShuffle(slots);
}

/* ---- Coger `slots` elementos de `pool`, repartiendo también entre sus subtipos
   (item.type) para que dentro de una asignatura no domine el subtipo más numeroso
   (p.ej. English: que no sean todo "multiple choice" y casi nada de vocabulario) ---- */
function _vacSampleFromPool(pool, slots) {
  if (slots <= 0 || !pool.length) return [];
  var byType = {};
  pool.forEach(function(item) { (byType[item.type] = byType[item.type] || []).push(item); });
  var types = Object.keys(byType);
  if (types.length <= 1) return _vacShuffle(pool).slice(0, slots);

  var typeSlots = _vacDistribute(slots, types.length);
  var picked = [];
  _vacShuffle(types).forEach(function(t, idx) {
    picked = picked.concat(_vacShuffle(byType[t]).slice(0, typeSlots[idx]));
  });
  if (picked.length < slots) {
    var leftover = pool.filter(function(item) { return picked.indexOf(item) === -1; });
    picked = picked.concat(_vacShuffle(leftover).slice(0, slots - picked.length));
  }
  return picked;
}

/* ---- Muestra equilibrada: reparte los `totalSlots` a partes iguales entre
   asignaturas (Mates, Lengua, English, Sciences, Sociales), en vez de un shuffle
   uniforme sobre todo el pool (que favorecía a las asignaturas con más contenido
   atómico, como Lengua-gramática o English-multiple-choice) ---- */
function _vacBalancedSample(all, totalSlots) {
  var bySubject = {};
  all.forEach(function(item) { (bySubject[item.subjectName] = bySubject[item.subjectName] || []).push(item); });
  var subjects = Object.keys(bySubject);
  if (!subjects.length) return [];

  var subjectSlots = _vacDistribute(totalSlots, subjects.length);
  var result = [];
  _vacShuffle(subjects).forEach(function(subj, idx) {
    result = result.concat(_vacSampleFromPool(bySubject[subj], subjectSlots[idx]));
  });

  if (result.length < totalSlots) {
    var leftover = all.filter(function(item) { return result.indexOf(item) === -1; });
    result = result.concat(_vacShuffle(leftover).slice(0, totalSlots - result.length));
  }
  return _vacShuffle(result).slice(0, totalSlots);
}

/* ---- Iniciar sesión ---- */
function vacStart() {
  loadAllVacData(function() {
    var all = _vacGetExerciseTypes();
    VAC.queue = _vacBalancedSample(all, CONFIG.vacaciones.ejerciciosPorSesion);
    VAC.idx   = 0;
    VAC.ok    = 0;
    VAC.pts   = 0;
    VAC.breakdown = {};
    setEl('vac-ex-pts', '⭐ 0 pts');
    go('s-vac-ex');
    _vacLoadEx();
  });
}

/* ---- Cargar todos los datos necesarios ---- */
function loadAllVacData(callback) {
  var pending = 0;
  function done() { pending--; if (pending === 0) callback(); }

  if (!SubjectData.sciences) { pending++;
    fetch('data/curso' + cursoActual + '/sciences.json')
      .then(function(r){ return r.json(); })
      .then(function(d){ SubjectData.sciences = d; done(); })
      .catch(function(){ done(); });
  }

  if (!SubjectData.socialesEx) { pending++;
    fetch('data/curso' + cursoActual + '/sociales-ejercicios.json')
      .then(function(r){ return r.json(); })
      .then(function(d){ SubjectData.socialesEx = d; done(); })
      .catch(function(){ done(); });
  }

  if (!SubjectData.english) { pending++;
    fetch('data/curso' + cursoActual + '/english.json')
      .then(function(r){ return r.json(); })
      .then(function(d){ SubjectData.english = d; done(); })
      .catch(function(){ done(); });
  }

  if (!SubjectData.vocab) { pending++;
    fetch('data/curso' + cursoActual + '/english-vocab.json')
      .then(function(r){ return r.json(); })
      .then(function(d){ SubjectData.vocab = d; done(); })
      .catch(function(){ done(); });
  }

  // Gram siempre intenta cargar
  if (!SubjectData.gram || !SubjectData.gram.bv || !SubjectData.gram.bv.length) { pending++;
    fetch('data/curso' + cursoActual + '/ejercicios-gram.json')
      .then(function(r){ return r.json(); })
      .then(function(data){
        ['bv','gj','czq','lly','rr'].forEach(function(cat) {
          if (data[cat]) SubjectData.gram[cat] = data[cat].map(function(item) {
            return { w: item.p||item.palabra, c: item.l||item.letra, f: item.c||item.completa, definicion: item.definicion||null };
          });
        });
        done();
      })
      .catch(function(){ done(); });
  }

  if (pending === 0) callback();
}

/* ---- Cargar ejercicio actual ---- */
function _vacLoadEx() {
  var item = VAC.queue[VAC.idx];
  var total = VAC.queue.length;
  var p = 'vac-ex';

  var titleEl = document.getElementById(p + '-title');
  if (titleEl) titleEl.innerHTML = item.icon + ' ' + item.subjectName;
  setEl(p + '-counter', (VAC.idx + 1) + ' / ' + total);
  setBar(p + '-prog', Math.round((VAC.idx / total) * 100));

  var area = document.getElementById(p + '-area');
  if (area) area.innerHTML = '';
  var optsEl = document.getElementById(p + '-opts');
  if (optsEl) { optsEl.innerHTML = ''; optsEl.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:8px'; }
  var qcard = document.getElementById(p + '-qcard');
  if (qcard) { qcard.style.display = 'none'; qcard.style.cssText = 'background:var(--card-bg);border:0.5px solid var(--gray-100);border-radius:14px;padding:16px;text-align:center;margin-bottom:14px;display:none'; }
  var numKbd = document.getElementById('vac-num-kbd');
  if (numKbd) numKbd.style.display = 'none';
  document.getElementById(p + '-fb').style.display   = 'none';
  document.getElementById(p + '-next').style.display = 'none';

  var type = item.type;

  if (type === 'mc') {
    _vacLoadMC(item);
  } else if (type === 'soc-vf') {
    _vacLoadSocVF(item);
  } else if (type === 'soc-relacionar') {
    _vacLoadSocRel(item);
  } else if (type === 'soc-completar') {
    _vacLoadSocComp(item);
  } else if (type === 'en-mc') {
    _vacLoadEnMC(item);
  } else if (type === 'en-wo') {
    _vacLoadEnWO(item);
  } else if (type === 'en-vocab-w2i') {
    _vacLoadVocabW2I(item);
  } else if (type === 'en-vocab-i2w') {
    _vacLoadVocabI2W(item);
  } else if (type === 'mates-suma' || type === 'mates-resta') {
    _vacLoadMates(item);
  } else if (type === 'mates-multi') {
    _vacLoadMatesMulti(item);
  } else if (type === 'mates-prob') {
    _vacLoadMatesProb(item);
  } else if (type === 'gram') {
    _vacLoadGram(item);
  } else {
    vacNext(); // tipo no soportado, saltar
  }
}

/* ---- Helpers comunes ---- */
function _vacConfig(item) {
  return {
    queue:       [item.ex],
    idx:         0,
    prefix:      'vac-ex',
    subjectKey:  item.subjectKey,
    exerciseKey: item.exerciseKey,
    setIdx:      function(){},
    onFinish:    function(){},
    onAdvance:   function(){}
  };
}

/* Solo actualiza el resumen de la sesión de Vacaciones (breakdown, aciertos, puntos
   de la pastilla superior). NO llama a recordResult/awardPts — se usa cuando el motor
   genérico (mc, matching, mates, vocab, word-order) ya se ha encargado de eso mediante
   sus hooks onCorrect/onWrong. */
function _vacTrackSession(item, correct, firstAttempt) {
  if (correct) {
    var p = configGetPts(item.exerciseKey);
    var pts = firstAttempt ? p.primero : p.segundo;
    VAC.pts += pts;
    setEl('vac-ex-pts', '⭐ ' + VAC.pts + ' pts');
  }
  if (!VAC.breakdown[item.subjectName]) VAC.breakdown[item.subjectName] = { ok:0, total:0, icon:item.icon };
  if (correct && firstAttempt) { VAC.breakdown[item.subjectName].ok++; VAC.ok++; }
  VAC.breakdown[item.subjectName].total++;
}

/* Registro completo: usar solo en ejercicios construidos a mano que NO pasan por
   ninguno de los motores genéricos (Sociales V/F, Sociales Completar, Gramática,
   Vocab I2W manual), ya que en esos casos nadie más llama a recordResult/awardPts. */
function _vacRecord(item, correct, firstAttempt) {
  recordResult(item.subjectKey, item.exerciseKey, correct);
  if (correct) {
    var p = configGetPts(item.exerciseKey);
    awardPts(firstAttempt ? p.primero : p.segundo, item.subjectKey);
  }
  _vacTrackSession(item, correct, firstAttempt);
}

/* ---- Sciences / English MC ---- */
function vacNext() {
  VAC.idx++;
  if (VAC.idx >= VAC.queue.length) {
    _vacShowResults();
    return;
  }
  _vacLoadEx();
}

/* ---- Pantalla de resultados ---- */
function _vacShowResults() {
  var total = CONFIG.vacaciones.ejerciciosPorSesion;
  var pct = VAC.ok > 0 ? Math.round(VAC.ok / total * 100) : 0;
  setEl('vac-fin-emoji', pct >= 80 ? '🏆' : pct >= 60 ? '🌟' : '💪');
  setEl('vac-fin-title', pct >= 80 ? '¡Excelente!' : pct >= 60 ? '¡Muy bien!' : '¡Sigue practicando!');
  setEl('vac-fin-ok',   VAC.ok);
  setEl('vac-fin-fail', total - VAC.ok);
  setEl('vac-fin-pts',  '⭐ +' + VAC.pts + ' pts');
  setEl('vac-fin-desc', 'Has completado los ' + total + ' ejercicios de repaso');

  var rows = document.getElementById('vac-fin-breakdown');
  if (rows) {
    rows.innerHTML = '';
    Object.keys(VAC.breakdown).forEach(function(subj) {
      var d = VAC.breakdown[subj];
      var p = d.total > 0 ? Math.round(d.ok / d.total * 100) : 0;
      var color = p >= CONFIG.progreso.umbralRefuerzo ? '#16A34A' : p >= 50 ? '#D97706' : '#EF4444';
      rows.innerHTML += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        + '<span style="font-size:14px;width:20px">' + d.icon + '</span>'
        + '<span style="font-size:12px;font-weight:700;color:var(--gray-800);width:70px">' + subj + '</span>'
        + '<div style="flex:1;height:7px;background:var(--gray-100);border-radius:4px;overflow:hidden"><div style="height:100%;width:' + p + '%;background:' + color + ';border-radius:4px"></div></div>'
        + '<span style="font-size:12px;font-weight:800;color:' + color + ';width:32px;text-align:right">' + p + '%</span>'
        + '</div>';
    });
  }

  go('s-vac-fin');
}

/* ---- Renderizar home de Vacaciones con estadísticas ---- */
function renderVacacionesHome() {
  var s = statsGetSubject('vacaciones');
  if (!s) return;

  setEl('vac-home-desc', CONFIG.vacaciones.ejerciciosPorSesion + ' ejercicios mezclando todas las asignaturas de 3º. ¿Cuántos aciertas?');
  setEl('vac-stat-total', s.total || 0);
  setEl('vac-stat-pct',   s.pct !== null ? s.pct + '%' : '—');
  setEl('vac-stat-pts',   (s.pts || 0) + ' pts');
  setEl('vac-pts-pill',   '⭐ ' + (s.pts || 0) + ' pts');

  var subjects = [
    { name:'Mates',    icon:'🔢', keys:['vacaciones-mates-suma','vacaciones-mates-multi','vacaciones-mates-prob'] },
    { name:'Lengua',   icon:'📚', keys:['vacaciones-lengua-gram-bv','vacaciones-lengua-gram-gj','vacaciones-lengua-gram-czq','vacaciones-lengua-gram-lly','vacaciones-lengua-gram-rr'] },
    { name:'English',  icon: UK_FLAG_SMALL, keys:['vacaciones-english-tobe','vacaciones-english-modals','vacaciones-english-vocab','vacaciones-english-wo'] },
    { name:'Sciences', icon:'🔬', keys:['vacaciones-sciences-invertebrates','vacaciones-sciences-mix'] },
    { name:'Sociales', icon:'🌍', keys:['vacaciones-sociales-vf','vacaciones-sociales-relacionar','vacaciones-sociales-completar'] }
  ];

  var errors = (ST.vacaciones && ST.vacaciones.errors) || {};
  var html = '';
  subjects.forEach(function(subj) {
    var ok=0, total=0;
    subj.keys.forEach(function(k) {
      ok    += errors[k+'_ok']   || 0;
      total += (errors[k+'_ok']||0) + (errors[k+'_fail']||0);
    });
    var pct  = total > 0 ? Math.round(ok/total*100) : null;
    var color = pct === null ? '#9CA3AF' : pct >= CONFIG.progreso.umbralRefuerzo ? '#16A34A' : pct >= 50 ? '#D97706' : '#EF4444';
    var width = pct !== null ? pct : 0;
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
      + '<span style="font-size:14px;width:20px">' + subj.icon + '</span>'
      + '<span style="font-size:12px;font-weight:700;color:var(--gray-800);width:65px;font-family:var(--f)">' + subj.name + '</span>'
      + '<div style="flex:1;height:7px;background:var(--gray-100);border-radius:4px;overflow:hidden"><div style="height:100%;width:' + width + '%;background:' + color + ';border-radius:4px;transition:width .3s"></div></div>'
      + '<span style="font-size:12px;font-weight:800;color:' + color + ';width:36px;text-align:right;font-family:var(--f)">' + (pct !== null ? pct+'%' : 'Sin empezar') + '</span>'
      + '</div>';
  });

  var bd = document.getElementById('vac-breakdown-home');
  if (bd) bd.innerHTML = html;

  _vacRenderRefuerzo();
}

/* ---- Ejercicios a reforzar, solo dentro de Vacaciones ---- */
function _vacRenderRefuerzo() {
  var el = document.getElementById('vac-refuerzo-home');
  if (!el) return;

  var weak = statsGetToReforzar().filter(function(w){ return w.subjectName === 'Vacaciones'; });

  if (weak.length === 0) { el.innerHTML = ''; return; }

  var html = '<div class="slbl" style="padding:0 0 8px">Áreas a reforzar — menos del ' + CONFIG.progreso.umbralRefuerzo + '%</div>';
  html += statsRefuerzoHtml(weak, 'Está dominando todos los contenidos de Vacaciones.');
  el.innerHTML = html;
}
