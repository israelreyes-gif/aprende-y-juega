/* =============================================
   LENGUA.JS — Gramática con banco de palabras dinámico
   Usa engine-multiple-choice.js
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

function gramDiff() { return diffLabel(ST.gramStreak || 0); }

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
  L.gramIntentos = 0;
  renderGramQ();
  ['gram-fb','gram-next','gram-ortho'].forEach(function(id) {
    var el = document.getElementById(id); if (el) el.style.display = 'none';
  });
}

/* ---- Config del motor para gramática ---- */
function _gramConfig() {
  var data = GDATA[L.gramTab];
  if (!data || data.length === 0) return null;
  if (L.gramIdx >= data.length) { GDATA[L.gramTab] = shuffle(data); L.gramIdx = 0; }

  // Convertir al formato del motor: queue con un elemento (la pregunta actual)
  // El motor gestiona intentos y feedback — nosotros gestionamos el avance manual
  var q = data[L.gramIdx];
  return {
    queue:       [q],
    idx:         0,
    prefix:      'gram',
    subjectKey:  'lengua',
    exerciseKey: 'lengua-gram-' + L.gramTab,
    ptsFirst:    10,
    ptsSecond:   5,

    // Renderizar la palabra con hueco en lugar de texto normal
    renderQuestion: function(qEl, ex) {
      var parts = ex.w.split('_');
      qEl.innerHTML = parts[0] + '<span class="word-gap">_</span>' + (parts[1] || '');
    },

    // Renderizar las opciones de letras
    renderOpts: function(container, ex, attempt, onAnswer) {
      var opts = GOPTS[L.gramTab];
      container.innerHTML = '';
      container.style.gridTemplateColumns = opts.length === 3 ? 'repeat(3,1fr)' : 'repeat(2,1fr)';
      opts.forEach(function(o) {
        var btn = document.createElement('div');
        btn.className = 'wopt-btn';
        btn.textContent = o;
        btn.onclick = function() { onAnswer(o); };
        container.appendChild(btn);
      });
    },

    // Mensaje de acierto con la palabra completa
    correctMsg: function(pts, attempt, ex) {
      return '<div class="fbt">¡Correcto, ' + (getNombre()||'campeona') + '! Con ' + ex.c + ': "' + ex.f + '" 🎉 +' + pts + ' pts</div>';
    },

    tryAgainMsg: '<div class="fbt">No es esa... ¡prueba otra vez! 💪</div>',

    // Explicación en segundo fallo
    getExplanation: function(ex) {
      return '<div class="fbs">Se escribe con <strong>' + ex.c + '</strong>: "' + ex.f + '" 📖</div>' +
             '<div class="fbs">Recuerda esta regla para la próxima.</div>';
    },

    // Mostrar/ocultar definición
    showDefinition: function(ex) {
      L.defAbierta = false;
      var defBtn = document.getElementById('def-toggle-btn');
      var defBox = document.getElementById('def-box');
      if (ex.definicion && defBtn) {
        defBtn.style.display = 'inline-flex';
        defBtn.textContent   = '💡 ¿Qué significa esta palabra? ▼';
        if (defBox) defBox.style.display = 'none';
        var nombreOculto = ex.f.replace(new RegExp(ex.c, 'i'), '_');
        var defNom = document.getElementById('def-nombre');
        var defTipo = document.getElementById('def-tipo');
        var defTxt  = document.getElementById('def-texto');
        var defEj   = document.getElementById('def-ejemplo');
        if (defNom) defNom.innerHTML = nombreOculto.charAt(0) === '_'
          ? '<span style="color:#EC4899;border-bottom:2px solid #EC4899">_</span>' + nombreOculto.slice(1)
          : nombreOculto;
        if (defTipo) defTipo.textContent = ex.definicion.tipo || '';
        if (defTxt)  defTxt.textContent  = ex.definicion.texto || '';
        if (defEj) {
          defEj.innerHTML = '✏️ ' + (ex.definicion.ejemplo || '').replace(/_/g,
            '<span style="color:#EC4899;border-bottom:2px solid #EC4899;display:inline-block;min-width:10px">_</span>');
        }
      } else if (defBtn) {
        defBtn.style.display = 'none';
        if (defBox) defBox.style.display = 'none';
      }
    },

    // Actualizar gramStreak manualmente
    onCorrect: function(selected, ex, attempt) {
      ST.gramStreak = (ST.gramStreak || 0) + 1;
      saveState();
    },
    onWrong: function(selected, ex, attempt) {
      if (attempt === 2) {
        ST.gramStreak = Math.max(0, (ST.gramStreak || 0) - 1);
        saveState();
      }
    },

    // No avanzar automáticamente — gramática avanza con nextGram()
    setIdx:    function() {},
    onFinish:  function() {},
    onAdvance: function() {}
  };
}

function renderGramQ() {
  var config = _gramConfig();
  if (!config) return;
  L.gramIntentos = 0;

  // Badge y progreso manualmente (el motor los actualizaría con indices 0)
  var data = GDATA[L.gramTab];
  var badge = document.getElementById('gram-badge');
  if (badge) badge.textContent = 'Pregunta ' + (L.gramIdx + 1) + ' de ' + data.length;
  var prog = document.getElementById('gram-prog');
  if (prog) prog.style.width = Math.round((L.gramIdx / data.length) * 100) + '%';
  var dl = gramDiff(), de = document.getElementById('gram-diff');
  if (de) { de.className = 'ex-badge ' + dl.cls; de.textContent = dl.txt; }

  mcShowQuestion(config);
}

/* Alias para compatibilidad con el HTML */
function pickWord(chosen, correct, full) {}  // ya no se usa — el motor gestiona esto

function nextGram() {
  L.gramIdx++;
  L.gramIntentos = 0;
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
