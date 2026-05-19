/* =============================================
   LENGUA.JS — Gramática con banco de palabras dinámico
   Las palabras se cargan desde data/ejercicios-gram.json
   ============================================= */

var gramTab = 'bv';
var gramIdx = 0;
var GDATA   = { bv: [], gj: [], czq: [], lly: [], rr: [] };
var GOPTS   = { bv: ['B','V'], gj: ['G','J'], czq: ['C','Z','Q'], lly: ['LL','Y'], rr: ['R','RR'] };

// Cargar palabras desde JSON
fetch('data/ejercicios-gram.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    // Mapear formato JSON -> formato interno
    ['bv','gj','czq','lly','rr'].forEach(function(cat) {
      if (data[cat]) {
        GDATA[cat] = shuffle(data[cat].map(function(item) {
          return { w: item.p || item.palabra, c: item.l || item.letra, f: item.c || item.completa };
        }));
      }
    });
    // Re-renderizar si ya está en pantalla
    if (document.getElementById('s-gramatica') &&
        document.getElementById('s-gramatica').classList.contains('active')) {
      renderGramQ();
    }
  })
  .catch(function(e) {
    console.warn('No se cargó ejercicios-gram.json, usando banco local mínimo');
    // Banco mínimo de respaldo
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

/* ---- Dificultad ---- */
function gramDiff() { return diffLabel(ST.gramStreak); }

/* ---- Cambiar pestaña ---- */
function setGramTab(tab) {
  gramTab = tab;
  gramIdx = 0;
  document.querySelectorAll('.gram-tab').forEach(function(t) { t.className = 'gram-tab'; });
  var order = ['bv','gj','czq','lly','rr'];
  var tabs  = document.querySelectorAll('.gram-tab');
  if (tabs[order.indexOf(tab)]) tabs[order.indexOf(tab)].className = 'gram-tab active bg-pink';
  renderGramQ();
  ['gram-fb','gram-next','gram-ortho'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
}

/* ---- Renderizar pregunta ---- */
function renderGramQ() {
  var data = GDATA[gramTab];
  if (!data || data.length === 0) return;
  
  // Si ha llegado al final, mezclar de nuevo
  if (gramIdx >= data.length) {
    GDATA[gramTab] = shuffle(data);
    gramIdx = 0;
  }
  
  var q     = data[gramIdx];
  var parts = q.w.split('_');
  document.getElementById('gram-word').innerHTML =
    parts[0] + '<span class="word-gap">_</span>' + (parts[1] || '');

  var opts = GOPTS[gramTab];
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
  if (badge) badge.textContent = 'Pregunta ' + (gramIdx + 1) + ' de ' + data.length;
  
  var prog = document.getElementById('gram-prog');
  if (prog) prog.style.width = Math.round((gramIdx / data.length) * 100) + '%';
}

/* ---- Intentos por palabra ---- */
var gramIntentos = 0;

/* ---- Elegir respuesta ---- */
function pickWord(chosen, correct, full) {
  var fb  = document.getElementById('gram-fb');
  var key = 'gram-' + gramTab;
  fb.style.display = 'block';

  if (chosen === correct) {
    // ── ACIERTO ──
    document.querySelectorAll('.wopt-btn').forEach(function(o) {
      o.onclick = null;
      o.className = 'wopt-btn ' + (o.textContent === correct ? 'wok' : '');
    });
    gramIntentos = 0;
    ST.gramStreak++;
    saveState();
    awardPts(10, 'lengua');
    recordResult('lengua', key, true);
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Correcto! Con ' + correct + ': "' + full + '" 🎉 +10 pts</div>';
    document.getElementById('gram-next').style.display = 'block';
  } else {
    gramIntentos++;
    // Marcar la opción elegida como incorrecta
    document.querySelectorAll('.wopt-btn').forEach(function(o) {
      if (o.textContent === chosen) o.className = 'wopt-btn wbad';
    });

    if (gramIntentos < 2) {
      // ── PRIMER FALLO: reintento ──
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">No es esa... ¡prueba otra vez! 💪</div>';
      // Restaurar botón equivocado tras 1s para que pueda reintentar
      setTimeout(function() {
        document.querySelectorAll('.wopt-btn').forEach(function(o) {
          if (o.textContent === chosen) o.className = 'wopt-btn';
        });
        fb.style.display = 'none';
      }, 1200);
    } else {
      // ── SEGUNDO FALLO: revelar respuesta ──
      document.querySelectorAll('.wopt-btn').forEach(function(o) {
        o.onclick = null;
        if (o.textContent === correct) o.className = 'wopt-btn wok';
      });
      gramIntentos = 0;
      ST.gramStreak = Math.max(0, ST.gramStreak - 1);
      saveState();
      recordResult('lengua', key, false);
      fb.className = 'feedback bad';
      fb.innerHTML = '<div class="fbt">Se escribe con <strong>' + correct + '</strong>: "' + full + '" 📖</div>' +
                     '<div class="fbs">Recuerda esta regla para la próxima.</div>';
      document.getElementById('gram-next').style.display = 'block';
    }
  }
}

/* ---- Siguiente palabra ---- */
function nextGram() {
  gramIdx++;
  renderGramQ();
  ['gram-fb','gram-next','gram-ortho'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
}

/* ---- Comprobación de ortografía progresiva ---- */
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
