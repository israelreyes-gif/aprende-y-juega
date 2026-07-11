/* =============================================
   VACACIONES-EXERCISES.JS — Sesion de repaso de verano
   Un "loader" por cada tipo de ejercicio: llama a los
   motores genericos (MC, Matching, Mates, Vocab, Word
   Order) cuando puede, y construye la UI a mano para los
   que no encajan (Sociales V/F y Completar, Gramatica,
   Mates Multi, Vocab I2W).

   Depende de las funciones de vacaciones-core.js
   (_vacConfig, _vacTrackSession, _vacRecord, vacNext).
   ============================================= */

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
function _vacLoadMC(item) {
  var config = _vacConfig(item);
  config.badgeLabel = 'Question';
  config.getExplanation = function(ex){ return ex.explanation || ''; };
  config.onCorrect = function(s,ex,att){ _vacTrackSession(item, true, att===1); };
  config.onWrong   = function(s,ex,att){ if(att===2) _vacTrackSession(item, false, false); };
  var qcard = document.getElementById('vac-ex-qcard');
  if (qcard) qcard.style.display = 'block';
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
  var qcard = document.getElementById('vac-ex-qcard');
  var qEl   = document.getElementById('vac-ex-question');
  if (qcard) {
    qcard.style.display = 'block';
    qcard.style.cssText = 'margin-bottom:20px;padding:20px;background:#EFF6FF;border-radius:16px;text-align:center;border:1.5px solid #BFDBFE';
  }
  if (qEl) qEl.innerHTML = '<div id="vac-ex-word" style="font-family:var(--f);font-weight:900;font-size:28px;color:var(--blue);letter-spacing:1px">' + item.ex.word + '</div><div style="font-size:12px;color:var(--gray-400);margin-top:6px">Which image matches this word?</div>';
  var optsEl = document.getElementById('vac-ex-opts');
  if (optsEl) optsEl.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px';

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
