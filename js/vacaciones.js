/* =============================================
   VACACIONES.JS — Sesión de repaso de verano
   20 ejercicios aleatorios mezclando todas las
   asignaturas de 3º usando los motores genéricos
   ============================================= */

var VAC = {
  queue:   [],
  idx:     0,
  ok:      0,
  pts:     0,
  breakdown: {}
};

/* Modo activo del teclado numérico compartido: 'digits' (suma/resta) o 'free' (problemas) */
var _vacNumMode = 'digits';

function vacNumKey(k) {
  if (_vacNumMode === 'free') {
    vacTypeProb(k === 'del' ? 'del' : String(k));
  } else {
    vacPickDigit(k === 'del' ? null : k);
  }
}

function vacNumCheck() {
  if (_vacNumMode === 'free') vacCheckProb();
  else vacCheckMates();
}

/* ---- Tipos de ejercicio disponibles ---- */
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
        exerciseKey: 'vacaciones-mates-' + (tipo === 'suma' || tipo === 'resta' ? tipo : tipo),
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
    VAC.queue = _vacBalancedSample(all, 20);
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
  if (optsEl) optsEl.innerHTML = '';
  var qcard = document.getElementById(p + '-qcard');
  if (qcard) qcard.style.display = 'none';
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
    ptsFirst:    10,
    ptsSecond:   5,
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
    var pts = firstAttempt ? 10 : 5;
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
  if (correct) awardPts(firstAttempt ? 10 : 5, item.subjectKey);
  _vacTrackSession(item, correct, firstAttempt);
}

/* ---- Sciences / English MC ---- */
function _vacLoadMC(item) {
  var config = _vacConfig(item);
  config.badgeLabel = 'Question';
  config.getExplanation = function(ex){ return ex.explanation || ''; };
  config.onCorrect = function(s,ex,att){ _vacTrackSession(item, true, att===1); };
  config.onWrong   = function(s,ex,att){ if(att===2) _vacTrackSession(item, false, false); };
  var qcard = document.getElementById('vac-ex-qcard');
  if (qcard) qcard.style.display = 'block';
  // Render question in area
  var area = document.getElementById('vac-ex-area');
  if (area) {
    var opts = document.createElement('div');
    opts.id = 'vac-ex-opts';
    area.appendChild(opts);
  }
  mcShowQuestion(config);
}

function _vacLoadEnMC(item) {
  var config = _vacConfig(item);
  config.badgeLabel = 'Question';
  var qcard = document.getElementById('vac-ex-qcard');
  if (qcard) qcard.style.display = 'block';
  config.renderQuestion = function(qEl, ex) {
    if (ex.hasTranslation && ex.question && ex.question.indexOf('\n') > -1) {
      var parts = ex.question.split('\n');
      qEl.innerHTML = '<span>' + parts[0] + '</span><br><span style="font-size:12px;color:#6B7280;font-style:italic">' + parts[1] + '</span>';
    } else {
      qEl.textContent = ex.question || '';
    }
  };
  config.correctMsg = function(pts){ return '✅ Correct! +' + pts + ' pts 🎉'; };
  config.tryAgainMsg = '❌ Try again!';
  config.onCorrect = function(s,ex,att){ _vacTrackSession(item, true, att===1); };
  config.onWrong   = function(s,ex,att){ if(att===2) _vacTrackSession(item, false, false); };
  var area = document.getElementById('vac-ex-area');
  if (area) { var opts = document.createElement('div'); opts.id = 'vac-ex-opts'; area.appendChild(opts); }
  mcShowQuestion(config);
}

/* ---- Sociales V/F ---- */
function _vacLoadSocVF(item) {
  var ex = item.ex;
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:20px 16px;margin-bottom:16px;text-align:center';
  card.innerHTML = '<div style="font-family:var(--f);font-size:15px;font-weight:700;color:var(--gray-800);line-height:1.5">"' + ex.pregunta + '"</div>';
  area.appendChild(card);
  var btns = document.createElement('div');
  btns.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px';
  var attempt = 1;
  [true, false].forEach(function(val) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:16px;border-radius:14px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:18px;font-weight:800;cursor:pointer';
    btn.innerHTML = val ? '✅ Verdadero' : '❌ Falso';
    btn.addEventListener('click', function() {
      var isOk = val === ex.respuesta;
      var fb = document.getElementById('vac-ex-fb');
      Array.from(btns.children).forEach(function(b){ b.disabled = true; });
      fb.style.display = 'block';
      if (isOk) {
        fb.className = 'feedback fb-ok'; fb.innerHTML = '✅ Correcto! +'+(attempt===1?10:5)+' pts 🎉';
        document.getElementById('vac-ex-next').style.display = 'block';
        _vacRecord(item, true, attempt===1);
      } else if (attempt === 1) {
        attempt = 2; fb.className = 'feedback fb-err'; fb.textContent = '❌ No es correcto — inténtalo de nuevo';
        Array.from(btns.children).forEach(function(b){
          var isV = b.innerHTML.includes('Verdadero');
          b.disabled = (val === true ? isV : !isV); if(b.disabled) b.style.opacity='0.4'; else b.disabled=false;
        });
      } else {
        fb.className = 'feedback fb-err'; fb.innerHTML = '❌ ' + (ex.respuesta ? 'Verdadero' : 'Falso') + '<div style="font-size:11px;margin-top:4px">' + (ex.explicacion||'') + '</div>';
        document.getElementById('vac-ex-next').style.display = 'block';
        _vacRecord(item, false, false);
      }
    });
    btns.appendChild(btn);
  });
  area.appendChild(btns);
}

/* ---- Sociales Relacionar ---- */
function _vacLoadSocRel(item) {
  var ex = item.ex;
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  var instr = document.createElement('p');
  instr.style.cssText = 'font-family:var(--f);font-size:13px;color:var(--gray-500);margin:0 0 12px;text-align:center';
  instr.textContent = ex.pregunta;
  area.appendChild(instr);
  var matchDiv = document.createElement('div'); matchDiv.id = 'vac-rel-container';
  area.appendChild(matchDiv);
  var pairs = ex.pares.map(function(p){ return { left: p.izq, right: p.der }; });
  mcMatchInit({
    pairs: pairs, containerId: 'vac-rel-container', prefix: 'vac-ex',
    subjectKey: item.subjectKey, exerciseKey: item.exerciseKey, ptsFirst: 10, ptsSecond: 5,
    onCorrect: function(firstAttempt){ _vacTrackSession(item, true, firstAttempt); },
    onWrong:   function(){ _vacTrackSession(item, false, false); }
  });
}

/* ---- Sociales Completar ---- */
function _vacLoadSocComp(item) {
  var ex = item.ex;
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:20px 16px;margin-bottom:16px;text-align:center';
  var html = ex.pregunta.replace('_____', '<span style="display:inline-block;min-width:80px;border-bottom:2px solid #0F6E56;margin:0 4px;color:#0F6E56;font-weight:800">?</span>');
  card.innerHTML = '<div style="font-family:var(--f);font-size:15px;font-weight:700;color:var(--gray-800);line-height:1.7">' + html + '</div>';
  area.appendChild(card);
  var opts = document.createElement('div'); opts.style.cssText = 'display:flex;flex-direction:column;gap:8px';
  var attempt = 1;
  ex.opciones.forEach(function(o, i) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:14px 16px;border-radius:12px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:14px;font-weight:700;cursor:pointer;text-align:left;color:var(--gray-700)';
    btn.textContent = o;
    btn.addEventListener('click', function() {
      var isOk = i === ex.respuesta;
      var fb = document.getElementById('vac-ex-fb'); fb.style.display = 'block';
      if (isOk) {
        btn.style.borderColor = '#22C55E'; btn.style.background = '#F0FDF4';
        Array.from(opts.children).forEach(function(b){ b.disabled = true; });
        fb.className = 'feedback fb-ok'; fb.innerHTML = '✅ Correcto! +'+(attempt===1?10:5)+' pts 🎉';
        document.getElementById('vac-ex-next').style.display = 'block';
        _vacRecord(item, true, attempt===1);
      } else if (attempt === 1) {
        attempt = 2; btn.disabled = true; btn.style.opacity = '0.5';
        btn.style.borderColor = '#EF4444'; btn.style.background = '#FEF2F2';
        fb.className = 'feedback fb-err'; fb.textContent = '❌ No es correcto — inténtalo de nuevo';
      } else {
        Array.from(opts.children).forEach(function(b,j){ b.disabled = true; if(j===ex.respuesta){b.style.borderColor='#22C55E';b.style.background='#F0FDF4';} });
        fb.className = 'feedback fb-err'; fb.innerHTML = '❌ La respuesta es: <strong>' + ex.opciones[ex.respuesta] + '</strong>';
        document.getElementById('vac-ex-next').style.display = 'block';
        _vacRecord(item, false, false);
      }
    });
    opts.appendChild(btn);
  });
  area.appendChild(opts);
}

/* ---- English Word Order ---- */
function _vacLoadEnWO(item) {
  var area = document.getElementById('vac-ex-area');
  if (!area) return;

  // Crear estructura de slots, bank, botones
  var slotsDiv = document.createElement('div');
  slotsDiv.id = 'vac-ex-slots';
  slotsDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;min-height:50px;border:1.5px dashed #BFDBFE;border-radius:12px;padding:10px;margin-bottom:12px;justify-content:center;align-items:center';

  var bankDiv = document.createElement('div');
  bankDiv.id = 'vac-ex-bank';
  bankDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:40px;margin-bottom:12px';

  var checkBtn = document.createElement('button');
  checkBtn.id = 'vac-ex-check';
  checkBtn.style.cssText = 'width:100%;padding:13px;border-radius:14px;border:none;background:var(--gray-200);color:var(--gray-400);font-family:var(--f);font-weight:800;font-size:15px;cursor:default';
  checkBtn.textContent = 'Comprobar ✓';
  checkBtn.onclick = function() { woCheck(); };

  var resetBtn = document.createElement('button');
  resetBtn.id = 'vac-ex-reset';
  resetBtn.style.cssText = 'width:100%;padding:11px;border-radius:14px;border:0.5px solid var(--gray-200);background:white;color:var(--gray-500);font-family:var(--f);font-weight:700;font-size:13px;cursor:pointer;margin-top:6px';
  resetBtn.textContent = '↺ Reintentar';
  resetBtn.onclick = function() { woReset(); };

  area.appendChild(slotsDiv);
  area.appendChild(bankDiv);
  area.appendChild(checkBtn);
  area.appendChild(resetBtn);

  var sentence = typeof item.ex === 'string' ? item.ex : item.ex.sentence || item.ex;

  woStart({
    queue: [sentence], idx: 0,
    prefix: 'vac-ex', subjectKey: item.subjectKey, exerciseKey: item.exerciseKey,
    badgeLabel: 'Question', setIdx: function(){}, onFinish: function(){},
    onAdvance: function(){},
    onCorrect: function(firstAttempt){ _vacTrackSession(item, true, firstAttempt); },
    onWrong:   function(){ _vacTrackSession(item, false, false); }
  });
}

/* ---- Vocabulario W2I ---- */
function _vacLoadVocabW2I(item) {
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  var wordDiv = document.createElement('div');
  wordDiv.style.cssText = 'background:#EFF6FF;border:0.5px solid #BFDBFE;border-radius:14px;padding:20px;text-align:center;margin-bottom:14px';
  wordDiv.innerHTML = '<div id="vac-ex-word" style="font-size:24px;font-weight:800;color:#1D4ED8;font-family:var(--f)">' + item.ex.word + '</div><div style="font-size:13px;color:#3B82F6;margin-top:4px">Which image matches this word?</div>';
  var optsDiv = document.createElement('div');
  optsDiv.id = 'vac-ex-opts';
  optsDiv.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px';
  area.appendChild(wordDiv);
  area.appendChild(optsDiv);

  var config = _vacConfig(item);
  config.getAllWords = _vocabGetAllWords;
  config.onCorrect = function(firstAttempt){ _vacTrackSession(item, true, firstAttempt); };
  config.onWrong   = function(){ _vacTrackSession(item, false, false); };
  vocabExInit(config, 'word-to-image');
}

/* ---- Vocabulario I2W ---- */
function _vacLoadVocabI2W(item) {
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  var emojiDiv = document.createElement('div');
  emojiDiv.id = 'i2w-emoji-vac';
  emojiDiv.style.cssText = 'background:#FFF7ED;border:0.5px solid #FED7AA;border-radius:14px;padding:24px;text-align:center;margin-bottom:14px';
  emojiDiv.innerHTML = '<div style="font-size:52px">' + item.ex.emoji + '</div><div style="font-size:13px;color:#9A3412;font-weight:700;margin-top:8px">What is this called in English?</div>';
  var inp = document.createElement('input');
  inp.id = 'i2w-input'; inp.type = 'text'; inp.placeholder = 'Type the word...';
  inp.style.cssText = 'width:100%;padding:14px 16px;border:1.5px solid var(--gray-200);border-radius:12px;font-family:var(--f);font-size:16px;font-weight:700;text-align:center;text-transform:uppercase;margin-bottom:10px';
  inp.oninput = function(){ this.value = this.value.toUpperCase(); };
  var checkBtn = document.createElement('button');
  checkBtn.id = 'i2w-check'; checkBtn.style.cssText = 'width:100%;padding:13px;border-radius:14px;border:none;background:var(--gray-200);color:var(--gray-400);font-family:var(--f);font-weight:800;font-size:15px;cursor:default';
  checkBtn.textContent = 'Check ✓';
  var attempt = 1;
  checkBtn.onclick = function(){ vacCheckI2W(item, inp, attempt, function(nextAttempt){ attempt = nextAttempt; }); };
  area.appendChild(emojiDiv);
  area.appendChild(inp);
  area.appendChild(checkBtn);
}

function vacCheckI2W(item, inp, attempt, setAttempt) {
  var fb  = document.getElementById('vac-ex-fb');
  var nxt = document.getElementById('vac-ex-next');
  if (!inp || !inp.value.trim()) return;
  var isOk = inp.value.trim().toUpperCase() === item.ex.word.toUpperCase();
  fb.style.display = 'block';
  if (isOk) {
    inp.style.borderColor = '#22C55E'; inp.style.background = '#F0FDF4'; inp.disabled = true;
    fb.className = 'feedback fb-ok'; fb.textContent = '✅ Correct! +' + (attempt === 1 ? 10 : 5) + ' pts 🎉';
    nxt.style.display = 'block';
    _vacRecord(item, true, attempt === 1);
  } else if (attempt === 1) {
    setAttempt(2);
    fb.className = 'feedback fb-err'; fb.textContent = '❌ Not quite — try again!';
    inp.style.borderColor = '#EF4444';
    setTimeout(function(){ inp.style.borderColor=''; inp.value=''; fb.style.display='none'; }, 1200);
  } else {
    inp.disabled = true; inp.style.borderColor = '#EF4444'; inp.style.background = '#FEF2F2';
    fb.className = 'feedback fb-err'; fb.innerHTML = '❌ The word was: <strong>' + item.ex.word.toUpperCase() + '</strong>';
    nxt.style.display = 'block';
    _vacRecord(item, false, false);
  }
}

/* ---- Mates Suma/Resta ---- */
function _vacLoadMates(item) {
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  _vacNumMode = 'digits';
  var numKbd = document.getElementById('vac-num-kbd');
  if (numKbd) numKbd.style.display = '';
  var tipo = item.type === 'mates-suma' ? 'sum' : 'res';
  var opBox = document.createElement('div'); opBox.id = 'vac-op-box';
  opBox.style.cssText = 'background:white;border:0.5px solid var(--gray-200);border-radius:14px;padding:16px';
  area.appendChild(opBox);

  matesStart({
    generate: function(){ return tipo === 'sum' ? generarSuma(getNivel()) : generarResta(getNivel()); },
    inputType: 'digits', prefix: 'vac-ex', screenId: 's-vac-ex',
    subjectKey: item.subjectKey, exerciseKey: item.exerciseKey, ptsFirst:10, ptsSecond:5,
    renderOp: function(ex, container) {
      var sign = tipo === 'sum' ? '+' : '−';
      var res = ex.resultado.toString();
      var row1='',row2='',rowRes='';
      ex.a.toString().split('').forEach(function(d){row1+='<span style="font-size:22px;font-weight:800;color:#1F2937">'+d+'</span>';});
      ex.b.toString().split('').forEach(function(d){row2+='<span style="font-size:22px;font-weight:800;color:#1F2937">'+d+'</span>';});
      res.split('').forEach(function(d,i){rowRes+='<div class="dbox'+(i===res.length-1?' active':'')+'" id="vac-ex-box-'+i+'">?</div>';});
      var c = document.getElementById('vac-op-box') || container;
      if(c) c.innerHTML='<div style="display:flex;justify-content:flex-end;gap:6px;margin-bottom:4px">'+row1+'</div>'
        +'<div style="display:flex;justify-content:flex-end;gap:6px;margin-bottom:4px"><span style="font-size:22px;font-weight:800;color:#7C3AED">'+sign+'</span>'+row2+'</div>'
        +'<div style="height:2px;background:#E5E7EB;margin-bottom:8px"></div>'
        +'<div style="display:flex;justify-content:flex-end;gap:8px" id="vac-ex-res-row">'+rowRes+'</div>';
    },
    correctMsg: function(pts,ex){ return '<div style="font-weight:800">¡Correcto! +'+pts+' pts 🎉</div>'; },
    onLoad: function(){},
    onCorrect: function(firstAttempt){ _vacTrackSession(item, true, firstAttempt); },
    onWrong:   function(){ _vacTrackSession(item, false, false); }
  });
}

function vacPickDigit(d) { matesPickDigit(d); }
function vacCheckMates() { matesCheckDigits(); }

/* ---- Mates Multi ---- */
function _vacLoadMatesMulti(item) {
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  var ex = generarMulti(getNivel());
  var qDiv = document.createElement('div');
  qDiv.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:16px;text-align:center;margin-bottom:14px';
  qDiv.innerHTML = '<div style="font-size:22px;font-weight:800;color:#1F2937;font-family:var(--f)">' + ex.a + ' × ' + ex.b + ' = <span style="color:#7C3AED">?</span></div>';
  var opts = document.createElement('div'); opts.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px';
  var attempt = 1;
  ex.opciones.forEach(function(v) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:16px 8px;border-radius:12px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:18px;font-weight:800;cursor:pointer';
    btn.textContent = v;
    btn.addEventListener('click', function() {
      var isOk = v === ex.resultado;
      var fb = document.getElementById('vac-ex-fb'); fb.style.display='block';
      if (isOk) {
        btn.style.borderColor='#22C55E'; btn.style.background='#F0FDF4';
        Array.from(opts.children).forEach(function(b){b.disabled=true;});
        fb.className='feedback fb-ok'; fb.innerHTML='✅ Correcto! +'+(attempt===1?10:5)+' pts 🎉';
        document.getElementById('vac-ex-next').style.display='block';
        _vacRecord(item, true, attempt===1);
      } else if(attempt===1){
        attempt=2; btn.disabled=true; btn.style.borderColor='#EF4444'; btn.style.background='#FEF2F2'; btn.style.opacity='0.5';
        fb.className='feedback fb-err'; fb.textContent='❌ No es ese — inténtalo de nuevo';
      } else {
        Array.from(opts.children).forEach(function(b){b.disabled=true;if(parseInt(b.textContent)===ex.resultado){b.style.borderColor='#22C55E';b.style.background='#F0FDF4';}});
        fb.className='feedback fb-err'; fb.innerHTML='❌ La respuesta era <strong>'+ex.resultado+'</strong>';
        document.getElementById('vac-ex-next').style.display='block';
        _vacRecord(item, false, false);
      }
    });
    opts.appendChild(btn);
  });
  area.appendChild(qDiv);
  area.appendChild(opts);
}

/* ---- Mates Prob ---- */
function _vacLoadMatesProb(item) {
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  _vacNumMode = 'free';
  var numKbd = document.getElementById('vac-num-kbd');
  if (numKbd) numKbd.style.display = '';
  var nivel = getNivel();
  var banco = SubjectData.problemas[nivel];
  var prob = banco && banco.length ? banco[Math.floor(Math.random()*banco.length)] : { enunciado:'María tiene 346 cromos. Le da 128. ¿Cuántos le quedan?', resultado:218 };
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:16px;margin-bottom:14px';
  card.innerHTML = '<div style="font-size:14px;font-weight:700;color:#1F2937;line-height:1.6;font-family:var(--f)">'+prob.enunciado+'</div>';
  var ansBox = document.createElement('div');
  ansBox.id = 'vac-ex-ans';
  ansBox.style.cssText = 'width:100%;padding:14px;border:1.5px solid var(--gray-200);border-radius:12px;font-family:var(--f);font-size:20px;font-weight:800;text-align:center;margin-bottom:10px;color:#1F2937';
  ansBox.textContent = '?';
  area.appendChild(card);
  area.appendChild(ansBox);
  _matesState = { config: { prefix:'vac-ex', subjectKey:item.subjectKey, exerciseKey:item.exerciseKey, ptsFirst:15, ptsSecond:7,
    correctMsg:function(pts){ return '¡Correcto! +'+pts+' pts 🎉'; },
    onCorrect: function(firstAttempt){ _vacTrackSession(item, true, firstAttempt); },
    onWrong:   function(){ _vacTrackSession(item, false, false); }
  }, ex:prob, intentos:0, val:'' };
}

function vacTypeProb(k) {
  var s = _matesState; if(!s) return;
  var box = document.getElementById('vac-ex-ans');
  if(k==='del') s.val=s.val.slice(0,-1);
  else if(s.val.length<6) s.val+=k;
  if(box) box.textContent=s.val||'?';
}
function vacCheckProb() { matesCheckFree(); }

/* ---- Gramática ---- */
function _vacLoadGram(item) {
  var area = document.getElementById('vac-ex-area');
  if (!area) return;
  var q = item.ex;
  var parts = q.w.split('_');
  var qCard = document.createElement('div');
  qCard.style.cssText = 'background:var(--gray-50);border:0.5px solid var(--gray-100);border-radius:14px;padding:20px;text-align:center;margin-bottom:14px';
  qCard.innerHTML = '<div style="font-size:13px;color:var(--gray-500);margin-bottom:8px;font-family:var(--f)">¿Con qué letra se escribe?</div>'
    + '<div style="font-size:28px;font-weight:900;color:#1F2937;font-family:var(--f)">'
    + parts[0] + '<span style="color:#EC4899;border-bottom:3px solid #EC4899;padding:0 2px">_</span>' + (parts[1]||'')
    + '</div>';
  var opts = document.createElement('div');
  var GOPTS2 = { bv:['B','V'], gj:['G','J'], czq:['C','Z','Q'], lly:['LL','Y'], rr:['R','RR'] };
  var letters = GOPTS2[item.cat] || ['B','V'];
  opts.style.cssText = 'display:grid;grid-template-columns:repeat('+letters.length+',1fr);gap:10px';
  var attempt = 1;
  letters.forEach(function(o) {
    var btn = document.createElement('button');
    btn.style.cssText = 'padding:18px 8px;border-radius:12px;border:2px solid var(--gray-200);background:white;font-family:var(--f);font-size:22px;font-weight:900;cursor:pointer;color:#1F2937';
    btn.textContent = o;
    btn.addEventListener('click', function() {
      var isOk = o === q.c;
      var fb = document.getElementById('vac-ex-fb'); fb.style.display='block';
      if (isOk) {
        btn.style.borderColor='#22C55E'; btn.style.background='#F0FDF4';
        Array.from(opts.children).forEach(function(b){b.disabled=true;});
        fb.className='feedback fb-ok'; fb.innerHTML='✅ Con '+q.c+': "'+q.f+'" 🎉 +'+(attempt===1?10:5)+' pts';
        document.getElementById('vac-ex-next').style.display='block';
        _vacRecord(item, true, attempt===1);
      } else if(attempt===1) {
        attempt=2; btn.disabled=true; btn.style.opacity='0.4';
        fb.className='feedback fb-err'; fb.textContent='❌ No es esa — prueba otra vez';
        setTimeout(function(){fb.style.display='none';},1000);
      } else {
        Array.from(opts.children).forEach(function(b){b.disabled=true;if(b.textContent===q.c){b.style.borderColor='#22C55E';b.style.background='#F0FDF4';}});
        fb.className='feedback fb-err'; fb.innerHTML='❌ Se escribe con <strong>'+q.c+'</strong>: "'+q.f+'"';
        document.getElementById('vac-ex-next').style.display='block';
        _vacRecord(item, false, false);
      }
    });
    opts.appendChild(btn);
  });
  area.appendChild(qCard);
  area.appendChild(opts);
}

/* ---- Siguiente ejercicio ---- */
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
  var pct = VAC.ok > 0 ? Math.round(VAC.ok / 20 * 100) : 0;
  setEl('vac-fin-emoji', pct >= 80 ? '🏆' : pct >= 60 ? '🌟' : '💪');
  setEl('vac-fin-title', pct >= 80 ? '¡Excelente!' : pct >= 60 ? '¡Muy bien!' : '¡Sigue practicando!');
  setEl('vac-fin-ok',   VAC.ok);
  setEl('vac-fin-fail', 20 - VAC.ok);
  setEl('vac-fin-pts',  '⭐ +' + (VAC.ok * 10) + ' pts');

  var rows = document.getElementById('vac-fin-breakdown');
  if (rows) {
    rows.innerHTML = '';
    Object.keys(VAC.breakdown).forEach(function(subj) {
      var d = VAC.breakdown[subj];
      var p = d.total > 0 ? Math.round(d.ok / d.total * 100) : 0;
      var color = p >= 75 ? '#16A34A' : p >= 50 ? '#D97706' : '#EF4444';
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

  setEl('vac-stat-total', s.total || 0);
  setEl('vac-stat-pct',   s.pct !== null ? s.pct + '%' : '—');
  setEl('vac-stat-pts',   (s.pts || 0) + ' pts');
  setEl('vac-pts-pill',   '⭐ ' + (s.pts || 0) + ' pts');

  var subjects = [
    { name:'Mates',    icon:'🔢', keys:['vacaciones-mates-suma','vacaciones-mates-multi','vacaciones-mates-prob','vacaciones-mates-mix'] },
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
    var color = pct === null ? '#9CA3AF' : pct >= 75 ? '#16A34A' : pct >= 50 ? '#D97706' : '#EF4444';
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
}
