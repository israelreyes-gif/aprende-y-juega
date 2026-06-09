/* =============================================
   LENGUA.JS — Gramática con banco de palabras dinámico
   Las palabras se cargan desde data/ejercicios-gram.json
   ============================================= */

var gramTab = 'bv';
var gramIdx = 0;
var GDATA   = { bv: [], gj: [], czq: [], lly: [], rr: [] };
var GOPTS   = { bv: ['B','V'], gj: ['G','J'], czq: ['C','Z','Q'], lly: ['LL','Y'], rr: ['R','RR'] };

// Cargar palabras desde JSON
fetch('data/curso' + cursoActual + '/ejercicios-gram.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    // Mapear formato JSON -> formato interno
    ['bv','gj','czq','lly','rr'].forEach(function(cat) {
      if (data[cat]) {
        GDATA[cat] = shuffle(data[cat].map(function(item) {
          return { w: item.p || item.palabra, c: item.l || item.letra, f: item.c || item.completa, definicion: item.definicion || null };
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

/* ---- Toggle definición ---- */
var defAbierta = false;

function toggleDefinicion() {
  defAbierta = !defAbierta;
  var box = document.getElementById('def-box');
  var btn = document.getElementById('def-toggle-btn');
  if (box) box.style.display = defAbierta ? 'block' : 'none';
  if (btn) btn.textContent = defAbierta
    ? '💡 Ocultar definición ▲'
    : '💡 ¿Qué significa esta palabra? ▼';
}

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

  // Mostrar definición si existe
  defAbierta = false;
  var defBtn  = document.getElementById('def-toggle-btn');
  var defBox  = document.getElementById('def-box');
  var defNom  = document.getElementById('def-nombre');
  var defTipo = document.getElementById('def-tipo');
  var defTxt  = document.getElementById('def-texto');
  var defEj   = document.getElementById('def-ejemplo');

  if (q.definicion && defBtn) {
    // Mostrar botón
    defBtn.style.display = 'inline-flex';
    defBtn.textContent   = '💡 ¿Qué significa esta palabra? ▼';
    // Ocultar caja
    if (defBox) defBox.style.display = 'none';
    // Rellenar datos — nombre con la letra oculta igual que la palabra
    var nombreOculto = q.f.replace(new RegExp(q.c, 'i'), '_');
    if (defNom)  defNom.innerHTML  = nombreOculto.charAt(0) === '_'
      ? '<span style="color:#EC4899;border-bottom:2px solid #EC4899">_</span>' + nombreOculto.slice(1)
      : nombreOculto;
    if (defTipo) defTipo.textContent = q.definicion.tipo || '';
    if (defTxt)  defTxt.textContent  = q.definicion.texto || '';
    // Ejemplo: resaltar el guión
    if (defEj) {
      var ejTexto = q.definicion.ejemplo || '';
      defEj.innerHTML = '✏️ ' + ejTexto.replace(/_/g,
        '<span style="color:#EC4899;border-bottom:2px solid #EC4899;display:inline-block;min-width:10px">_</span>');
    }
  } else if (defBtn) {
    defBtn.style.display = 'none';
    if (defBox) defBox.style.display = 'none';
  }
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
    var gramPts = gramIntentos === 0 ? 10 : 5;
    gramIntentos = 0;
    ST.gramStreak++;
    saveState();
    awardPts(gramPts, 'lengua');
    recordResult('lengua', key, true);
    fb.className = 'feedback ok';
    fb.innerHTML = '<div class="fbt">¡Correcto, ' + (getNombre()||'campeona') + '! Con ' + correct + ': "' + full + '" 🎉 +' + gramPts + ' pts</div>';
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
  gramIntentos = 0;
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
