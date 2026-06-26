/* =============================================
   LENGUA.JS — Gramática con banco de palabras dinámico
   Las palabras se cargan desde data/ejercicios-gram.json
   ============================================= */

var L = ExerciseState.lengua; /* alias */
var GDATA = SubjectData.gram;
var GOPTS = { bv: ['B','V'], gj: ['G','J'], czq: ['C','Z','Q'], lly: ['LL','Y'], rr: ['R','RR'] };

// Cargar palabras desde JSON
fetch('data/curso' + cursoActual + '/ejercicios-gram.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    ['bv','gj','czq','lly','rr'].forEach(function(cat) {
      if (data[cat]) {
        SubjectData.gram[cat] = shuffle(data[cat].map(function(item) {
          return { w: item.p || item.palabra, c: item.l || item.letra, f: item.c || item.completa, definicion: item.definicion || null };
        }));
      }
    });
    if (document.getElementById('s-gramatica') &&
        document.getElementById('s-gramatica').classList.contains('active')) {
      renderGramQ();
    }
  })
  .catch(function(e) {
    showError('la Gramática', e, function(){ setGramTab('bv'); }, 's-lengua-exercises');
    GDATA = {
      bv:  [{w:'a_eja',c:'V',f:'abeja'},{w:'_arco',c:'B',f:'barco'},{w:'_aca',c:'V',f:'vaca'}],
      gj:  [{w:'_irafa',c:'J',f:'jirafa'},{w:'_ato',c:'G',f:'gato'}],
      czq: [{w:'_ebra',c:'C',f:'cebra'},{w:'_apato',c:'Z',f:'zapato'}],
      lly: [{w:'ga_ina',c:'LL',f:'gallina'},{w:'re_',c:'Y',f:'rey'}],
      rr:  [{w:'pe_o',c:'RR',f:'perro'},{w:'_atón',c:'R',f:'ratón'}]
    };
  });

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function gramDiff() { return diffLabel(ST.gramStreak); }

function toggleDefinicion() {
  L.defAbierta = !L.defAbierta;
  var box = document.getElementById('def-box');
  var btn = document.getElementById('def-toggle-btn');
  if (box) box.style.display = L.defAbierta ? 'block' : 'none';
  if (btn) btn.textContent = L.defAbierta
    ? '💡 Ocultar definición ▲'
    : '💡 ¿Qué significa esta palabra? ▼';
}

function setGramTab(tab) {
  L.gramTab = tab;
  L.gramIdx = 0;
  document.querySelectorAll('.gram-tab').forEach(function(t) { t.className = 'gram-tab'; });
  var order = ['bv','gj','czq','lly','rr'];
  var tabs  = document.querySelectorAll('.gram-tab');
  if (tabs[order.indexOf(tab)]) tabs[order.indexOf(tab)].className = 'gram-tab active bg-pink';
  renderGramQ();
  ['gram-fb','gram-next','gram-ortho'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
}

function renderGramQ() {
  var data = SubjectData.gram[L.gramTab];
  if (!data || data.length === 0) return;
  if (L.gramIdx >= data.length) { SubjectData.gram[L.gramTab] = shuffle(data); L.gramIdx = 0; }

  var q     = data[L.gramIdx];
  var parts = q.w.split('_');
  document.getElementById('gram-word').innerHTML =
    parts[0] + '<span class="word-gap">_</span>' + (parts[1] || '');

  var opts = GOPTS[L.gramTab];
  var cont = document.getElementById('gram-opts');
  cont.innerHTML = '';
  cont.style.gridTemplateColumns = opts.length === 3 ? 'repeat(3,1fr)' : 'repeat(2,1fr)';
  opts.forEach(function(o) {
    var d = document.createElement('div');
    d.className = 'wopt-btn';
    d.textContent = o;
    d.onclick = function() { pickWord(o, q.c, q.f); };
    cont.appendChild(d);
  });

  var dl = gramDiff(), de = document.getElementById('gram-diff');
  if (de) { de.className = 'ex-badge ' + dl.cls; de.textContent = dl.txt; }

  var badge = document.getElementById('gram-badge');
  if (badge) badge.textContent = 'Pregunta ' + (L.gramIdx + 1) + ' de ' + data.length;

  var prog = document.getElementById('gram-prog');
  if (prog) prog.style.width = Math.round((L.gramIdx / data.length) * 100) + '%';

  L.defAbierta = false;
  var defBtn  = document.getElementById('def-toggle-btn');
  var defBox  = document.getElementById('def-box');
  var defNom  = document.getElementById('def-nombre');
  var defTipo = document.getElementById('def-tipo');
  var defTxt  = document.getElementById('def-texto');
  var defEj   = document.getElementById('def-ejemplo');

  if (q.definicion && defBtn) {
    defBtn.style.display = 'inline-flex';
    defBtn.textContent   = '💡 ¿Qué significa esta palabra? ▼';
    if (defBox) defBox.style.display = 'none';
    var nombreOculto = q.f.replace(new RegExp(q.c, 'i'), '_');
    if (defNom)  defNom.innerHTML  = nombreOculto.charAt(0) === '_'
      ? '<span style="color:#EC4899;border-bottom:2px solid #EC4899">_</span>' + nombreOculto.slice(1)
      : nombreOculto;
    if (defTipo) defTipo.textContent = q.definicion.tipo || '';
    if (defTxt)  defTxt.textContent  = q.definicion.texto || '';
    if (defEj) {
      defEj.innerHTML = '✏️ ' + (q.definicion.ejemplo || '').replace(/_/g,
        '<span style="color:#EC4899;border-bottom:2px solid #EC4899;display:inline-block;min-width:10px">_</span>');
    }
  } else if (defBtn) {
    defBtn.style.display = 'none';
    if (defBox) defBox.style.display = 'none';
  }
}

function pickWord(chosen, correct, full) {
  var fb  = document.getElementById('gram-fb');
  var key = 'gram-' + L.gramTab;
  fb.style.display = 'block';

  if (chosen === correct) {
    document.querySelectorAll('.wopt-btn').forEach(function(o) {
      o.onclick = null;
      o.className = 'wopt-btn ' + (o.textContent === correct ? 'wok' : '');
    });
    var gramPts = L.gramIntentos === 0 ? 10 : 5;
    L.gramIntentos = 0;
    ST.gramStreak++;
    saveState();
    awardPts(gramPts, 'lengua');
    recordResult('lengua', 'lengua-' + key, true);
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Correcto, ' + (getNombre()||'campeona') + '! Con ' + correct + ': "' + full + '" 🎉 +' + gramPts + ' pts</div>';
    document.getElementById('gram-next').style.display = 'block';
  } else {
    L.gramIntentos++;
    document.querySelectorAll('.wopt-btn').forEach(function(o) {
      if (o.textContent === chosen) o.className = 'wopt-btn wbad';
    });
    if (L.gramIntentos < 2) {
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es esa... ¡prueba otra vez! 💪</div>';
      setTimeout(function() {
        document.querySelectorAll('.wopt-btn').forEach(function(o) {
          if (o.textContent === chosen) o.className = 'wopt-btn';
        });
        fb.style.display = 'none';
      }, 1200);
    } else {
      document.querySelectorAll('.wopt-btn').forEach(function(o) {
        o.onclick = null;
        if (o.textContent === correct) o.className = 'wopt-btn wok';
      });
      L.gramIntentos = 0;
      ST.gramStreak = Math.max(0, ST.gramStreak - 1);
      saveState();
      recordResult('lengua', 'lengua-' + key, false);
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">Se escribe con <strong>' + correct + '</strong>: "' + full + '" 📖</div>' +
                     '<div class="fbs">Recuerda esta regla para la próxima.</div>';
      document.getElementById('gram-next').style.display = 'block';
    }
  }
}

function nextGram() {
  L.gramIdx++;
  L.gramIntentos = 0;
  renderGramQ();
  ['gram-fb','gram-next','gram-ortho'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
}

function checkOrtho(text, level) {
  var issues = [], t = text.trim();
  if (!t || t.length < 4) return issues;
  if (t[0] === t[0].toLowerCase() && /[a-záéíóúñ]/i.test(t[0]))
    issues.push({ type: 'may', msg: 'Las frases empiezan con mayúscula.' });
  if (level >= 1 && !/[.!?]$/.test(t))
    issues.push({ type: 'punto', msg: 'Las frases terminan con punto.' });
  if (level >= 2) {
    var low = t.toLowerCase();
    [['que ','qué'],['como ','cómo'],['quien ','quién'],['cuando ','cuándo'],['donde ','dónde']].forEach(function(p) {
      if ((low.startsWith('¿'+p[0]) || low.includes(' ¿'+p[0])) && !low.includes(p[1]))
        issues.push({ type: 'acento', msg: 'Tilde: "' + p[1] + '".' });
    });
  }
  return issues;
}
