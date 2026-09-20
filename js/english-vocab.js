/* =============================================
   ENGLISH-VOCAB.JS — Flashcards + Ejercicios W2I/I2W
   ============================================= */


var VOCAB_COLORS = {
  orange: { color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  blue:   { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
  pink:   { color: '#EC4899', bg: '#FDF2F8', border: '#FBCFE8' },
  purple: { color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  amber:  { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  green:  { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  red:    { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  teal:   { color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
  indigo: { color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
  yellow: { color: '#CA8A04', bg: '#FEFCE8', border: '#FEF08A' }
};

function loadVocabData(callback) {
  if (SubjectData.vocab) { callback(); return; }
  fetch('data/curso' + cursoActual + '/english-vocab.json')
    .then(function(r) { return r.json(); })
    .then(function(d) { SubjectData.vocab = d; callback(); })
    .catch(function(e) { showError('el Vocabulario', e, function(){ loadVocabData(function(){}); }, 's-english'); });
}

/* ---- Menú de temas ----
   ns: sufijo opcional para reutilizar este mismo sistema en
   otros cursos (ej. '-c4' para 4º) sin chocar con los IDs de
   elementos/pantallas de 3º. Vacío ('') = comportamiento de
   siempre para 3º. */
function renderVocabMenu(ns) {
  ns = ns || '';
  loadVocabData(function() {
    var grid = document.getElementById('vocab-topics-grid' + ns);
    if (!grid) return;
    grid.innerHTML = '';
    SubjectData.vocab.units.forEach(function(unit) {
      var c = VOCAB_COLORS[unit.color] || VOCAB_COLORS.blue;
      var card = document.createElement('div');
      card.style.cssText = 'background:'+c.bg+';border:1.5px solid '+c.border+';border-radius:16px;padding:18px 16px;display:flex;align-items:center;gap:14px;cursor:pointer;margin:0 16px 12px;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:box-shadow .2s';
      card.innerHTML =
        '<div style="font-size:44px">'+unit.emoji+'</div>'+
        '<div style="flex:1">'+
          '<div style="font-family:var(--f);font-weight:900;font-size:16px;color:'+c.color+'">'+unit.title+'</div>'+
          '<div style="font-size:12px;color:var(--gray-400);margin-top:3px">'+unit.words.length+' words</div>'+
        '</div>'+
        '<div style="font-size:20px;color:'+c.border+'">›</div>';
      card.addEventListener('mouseenter', function() { card.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)'; });
      card.addEventListener('mouseleave', function() { card.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'; });
      card.addEventListener('click', function() { openVocabUnit(unit, ns); });
      grid.appendChild(card);
    });
  });
}

/* ---- Abrir unidad ---- */
function openVocabUnit(unit, ns) {
  ns = ns || '';
  EN.vocabUnit    = unit;
  EN.vocabFlipped = unit.words.map(function() { return false; });
  EN.vocabNs      = ns;
  var c = VOCAB_COLORS[unit.color] || VOCAB_COLORS.blue;

  // Actualizar topbar color
  var topbar = document.getElementById('vocab-unit-topbar' + ns);
  if (topbar) topbar.style.background = c.color;

  setEl('vocab-unit-title' + ns, unit.title);

  // Botón flip all
  var btn = document.getElementById('vocab-flip-all-btn' + ns);
  if (btn) {
    btn.style.background = c.bg;
    btn.style.color      = c.color;
    btn.style.borderColor = c.border;
    btn.textContent = 'Show all hints';
  }

  go('s-english-vocab-unit' + ns);
  renderVocabCards();
}

/* ---- Renderizar tarjetas ---- */
function speakWord(word, e) {
  e.stopPropagation();
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  var utter = new SpeechSynthesisUtterance(word);
  utter.lang  = 'en-GB';
  utter.rate  = 0.85;
  utter.pitch = 1;

  var voices = window.speechSynthesis.getVoices();
  var preferred = [
    'Microsoft Libby',
    'Google UK English Female',
    'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria'
  ];
  var voice = null;
  for (var p = 0; p < preferred.length; p++) {
    voice = voices.find(function(v) { return v.name.includes(preferred[p]); });
    if (voice) break;
  }
  if (!voice) {
    voice = voices.find(function(v) {
      return v.lang.startsWith('en') && (
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman')
      );
    });
  }
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

function renderVocabCards() {
  var ns = EN.vocabNs || '';
  var grid = document.getElementById('vocab-cards-grid' + ns);
  if (!grid || !EN.vocabUnit) return;
  grid.innerHTML = '';
  var c = VOCAB_COLORS[EN.vocabUnit.color] || VOCAB_COLORS.blue;

  EN.vocabUnit.words.forEach(function(w, i) {
    var flipped = EN.vocabFlipped[i];
    var card = document.createElement('div');
    card.style.cssText = 'cursor:pointer;perspective:600px;height:130px;position:relative';

    var inner = document.createElement('div');
    inner.style.cssText = 'position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .4s ease;transform:'+( flipped ? 'rotateY(180deg)' : 'rotateY(0deg)');

    var front = document.createElement('div');
    front.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;background:'+c.bg+';border:1.5px solid '+c.border+';border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px';
    front.innerHTML =
      '<div style="font-size:40px;line-height:1">'+w.emoji+'</div>'+
      '<div style="font-family:var(--f);font-weight:900;font-size:10px;color:'+c.color+';text-align:center;letter-spacing:.3px">'+w.word+'</div>';

    var back = document.createElement('div');
    back.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);background:'+c.color+';border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;gap:3px';
    back.innerHTML =
      '<div style="font-size:22px">'+w.emoji+'</div>'+
      '<div style="font-family:var(--f);font-weight:900;font-size:10px;color:white;text-align:center">'+w.word+'</div>'+
      '<div style="font-family:var(--f);font-weight:600;font-size:9px;color:rgba(255,255,255,.95);text-align:center;line-height:1.3">'+w.hint+'</div>'+
      '<div style="font-family:var(--f);font-weight:600;font-size:9px;color:rgba(255,255,255,.7);text-align:center;line-height:1.3;font-style:italic">'+w.es+'</div>';

    var speakBtn = document.createElement('button');
    speakBtn.textContent = '\uD83D\uDD0A';
    speakBtn.title = 'Listen to pronunciation';
    speakBtn.style.cssText = 'position:absolute;top:4px;right:4px;z-index:10;width:22px;height:22px;border-radius:50%;border:none;background:'+c.color+';color:white;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;opacity:.85;transition:opacity .15s';
    speakBtn.addEventListener('mouseenter', function() { speakBtn.style.opacity = '1'; });
    speakBtn.addEventListener('mouseleave', function() { speakBtn.style.opacity = '.85'; });
    (function(word) {
      speakBtn.addEventListener('click', function(e) { speakWord(word, e); });
    })(w.word);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    card.appendChild(speakBtn);

    (function(idx) {
      card.addEventListener('click', function() { vocabFlipCard(idx); });
    })(i);

    grid.appendChild(card);
  });
}

function vocabFlipCard(i) {
  EN.vocabFlipped[i] = !EN.vocabFlipped[i];
  // Actualizar botón si todas están giradas
  updateVocabFlipBtn();
  renderVocabCards();
}

function vocabToggleAll() {
  var allFlipped = EN.vocabFlipped.every(function(v) { return v; });
  EN.vocabFlipped = EN.vocabFlipped.map(function() { return !allFlipped; });
  updateVocabFlipBtn();
  renderVocabCards();
}

function updateVocabFlipBtn() {
  var ns = EN.vocabNs || '';
  var btn = document.getElementById('vocab-flip-all-btn' + ns);
  if (!btn) return;
  var allFlipped = EN.vocabFlipped.every(function(v) { return v; });
  btn.textContent = allFlipped ? 'Show words' : 'Show all hints';
}

/* =============================================
   VOCABULARY EXERCISES — usa engine-vocab.js
   ============================================= */

function _vocabGetAllWords() {
  var all = [];
  SubjectData.vocab.units.forEach(function(u){ all = all.concat(u.words); });
  return all;
}

function _vocabBaseConfig() {
  return {
    queue:       EN.vocabExQueue,
    idx:         EN.vocabExIdx,
    subjectKey:  'english',
    exerciseKey: 'english-vocab',
    getAllWords:  _vocabGetAllWords,
    setIdx:      function(v){ EN.vocabExIdx = v; },
    onFinish:    function(){ go('s-english-vocab-ex'); },
    onAdvance:   function(mode){
      if (mode === 'word-to-image' || mode === 'w2i') loadW2IQuestion();
      else loadI2WQuestion();
    }
  };
}

function startVocabExercise(type) {
  loadVocabData(function() {
    var allWords = _vocabGetAllWords();
    EN.vocabExQueue = (function(a){ var b=a.slice(); for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;} return b; })(allWords);
    EN.vocabExIdx  = 0;
    EN.vocabExType = type;
    if (type === 'word-to-image') { go('s-vocab-ex-w2i'); loadW2IQuestion(); }
    else { go('s-vocab-ex-i2w'); loadI2WQuestion(); }
  });
}

function loadW2IQuestion() {
  vocabExInit(_vocabBaseConfig(), 'word-to-image');
}

function loadI2WQuestion() {
  vocabExInit(_vocabBaseConfig(), 'image-to-word');
}

function pickW2I(opt) { vocabPickW2I(opt); }
function checkVocabI2W() { vocabCheckI2W(); }
function nextVocabEx(mode) { vocabExNext(mode); }

/* =============================================
   BUSCADOR DE VERBOS — traducción (MyMemory API,
   gratis y sin key) + presente/pasado calculado
   localmente (tabla de irregulares + reglas de
   ortografía para regulares). Usado en la pantalla
   Verbs de 4º (screens/curso4/english-verbs.html).
   ============================================= */

/* Tabla de verbos irregulares comunes (base -> pasado). "be" es especial:
   was/were según el sujeto, se trata aparte en getPastTense(). */
var IRREGULAR_VERBS = {
  "be": "was/were",
  "become": "became",
  "begin": "began",
  "bend": "bent",
  "bet": "bet",
  "bind": "bound",
  "bite": "bit",
  "bleed": "bled",
  "blow": "blew",
  "break": "broke",
  "breed": "bred",
  "bring": "brought",
  "build": "built",
  "burn": "burnt",
  "burst": "burst",
  "buy": "bought",
  "catch": "caught",
  "choose": "chose",
  "come": "came",
  "cost": "cost",
  "creep": "crept",
  "cut": "cut",
  "deal": "dealt",
  "dig": "dug",
  "do": "did",
  "draw": "drew",
  "dream": "dreamt",
  "drink": "drank",
  "drive": "drove",
  "eat": "ate",
  "fall": "fell",
  "feed": "fed",
  "feel": "felt",
  "fight": "fought",
  "find": "found",
  "fit": "fit",
  "flee": "fled",
  "fly": "flew",
  "forbid": "forbade",
  "forget": "forgot",
  "forgive": "forgave",
  "freeze": "froze",
  "get": "got",
  "give": "gave",
  "go": "went",
  "grind": "ground",
  "grow": "grew",
  "hang": "hung",
  "have": "had",
  "hear": "heard",
  "hide": "hid",
  "hit": "hit",
  "hold": "held",
  "hurt": "hurt",
  "keep": "kept",
  "kneel": "knelt",
  "know": "knew",
  "lay": "laid",
  "lead": "led",
  "lean": "leant",
  "leap": "leapt",
  "learn": "learnt",
  "leave": "left",
  "lend": "lent",
  "let": "let",
  "lie": "lay",
  "light": "lit",
  "lose": "lost",
  "make": "made",
  "mean": "meant",
  "meet": "met",
  "mow": "mowed",
  "pay": "paid",
  "put": "put",
  "quit": "quit",
  "read": "read",
  "ride": "rode",
  "ring": "rang",
  "rise": "rose",
  "run": "ran",
  "say": "said",
  "see": "saw",
  "seek": "sought",
  "sell": "sold",
  "send": "sent",
  "set": "set",
  "sew": "sewed",
  "shake": "shook",
  "shine": "shone",
  "shoot": "shot",
  "show": "showed",
  "shrink": "shrank",
  "shut": "shut",
  "sing": "sang",
  "sink": "sank",
  "sit": "sat",
  "sleep": "slept",
  "slide": "slid",
  "smell": "smelt",
  "sow": "sowed",
  "speak": "spoke",
  "speed": "sped",
  "spell": "spelt",
  "spend": "spent",
  "spill": "spilt",
  "spin": "spun",
  "spit": "spat",
  "split": "split",
  "spoil": "spoilt",
  "spread": "spread",
  "spring": "sprang",
  "stand": "stood",
  "steal": "stole",
  "stick": "stuck",
  "sting": "stung",
  "stink": "stank",
  "strike": "struck",
  "swear": "swore",
  "sweep": "swept",
  "swell": "swelled",
  "swim": "swam",
  "swing": "swung",
  "take": "took",
  "teach": "taught",
  "tear": "tore",
  "tell": "told",
  "think": "thought",
  "throw": "threw",
  "understand": "understood",
  "wake": "woke",
  "wear": "wore",
  "weave": "wove",
  "weep": "wept",
  "win": "won",
  "wind": "wound",
  "write": "wrote"
};

/* Reglas de ortografía para el pasado de verbos regulares (+ -ed) */
function _regularPast(verb) {
  var v = verb.toLowerCase();
  if (v.length === 0) return v;
  // Termina en "e" -> solo añadir "d" (like -> liked)
  if (v.endsWith('e')) return v + 'd';
  // Termina en consonante + "y" -> "y" se convierte en "ied" (study -> studied)
  if (v.endsWith('y') && v.length > 1 && !'aeiou'.includes(v[v.length - 2])) {
    return v.slice(0, -1) + 'ied';
  }
  // CVC de una sílaba -> se dobla la última consonante (stop -> stopped).
  // No es 100% fiable en verbos de 2+ sílabas (visit -> visited NO dobla,
  // prefer -> preferred SÍ dobla, depende del acento), pero cubre bien
  // los verbos monosílabos típicos de este nivel.
  var noDouble = ['w', 'x', 'y'];
  if (v.length >= 3) {
    var last = v[v.length - 1], mid = v[v.length - 2], first = v[v.length - 3];
    var isVowel = function(c) { return 'aeiou'.includes(c); };
    if (!isVowel(last) && isVowel(mid) && !isVowel(first) && noDouble.indexOf(last) === -1 && v.length <= 5) {
      return v + last + 'ed';
    }
  }
  return v + 'ed';
}

/* Devuelve el pasado simple de un verbo en inglés (minúsculas) */
function getPastTense(verb) {
  var v = verb.toLowerCase().trim();
  if (v === 'be') return 'was / were';
  if (IRREGULAR_VERBS[v]) return IRREGULAR_VERBS[v];
  return _regularPast(v);
}

/* Llama a la MyMemory API (gratis, sin key, CORS habilitado) */
function translateWord(text, langpair, callback) {
  var url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + langpair;
  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.responseData && data.responseData.translatedText) {
        callback(data.responseData.translatedText, null);
      } else {
        callback(null, 'sin resultado');
      }
    })
    .catch(function(e) {
      callback(null, e.message || 'error de red');
    });
}

/* Estado del buscador: 'en' o 'es' según la dirección elegida */
var _verbSearchDir = 'en';

function setVerbSearchDir(dir) {
  _verbSearchDir = dir;
  var btnEn = document.getElementById('verb-search-dir-en');
  var btnEs = document.getElementById('verb-search-dir-es');
  if (btnEn && btnEs) {
    btnEn.style.background = dir === 'en' ? 'var(--blue)' : '#EFF6FF';
    btnEn.style.color = dir === 'en' ? 'white' : 'var(--blue)';
    btnEs.style.background = dir === 'es' ? 'var(--blue)' : '#EFF6FF';
    btnEs.style.color = dir === 'es' ? 'white' : 'var(--blue)';
  }
  var input = document.getElementById('verb-search-input');
  if (input) input.placeholder = dir === 'en' ? "Escribe un verbo en inglés..." : "Escribe un verbo en español...";
}

function searchVerb() {
  var input = document.getElementById('verb-search-input');
  var resultBox = document.getElementById('verb-search-result');
  if (!input || !resultBox) return;
  var text = input.value.trim();
  if (!text) return;

  resultBox.style.display = 'block';
  resultBox.innerHTML = '<div style="padding:14px;text-align:center;font-size:12px;color:var(--gray-400);font-weight:600">Buscando...</div>';

  if (_verbSearchDir === 'en') {
    // Búsqueda en inglés: traducir a español y calcular presente/pasado localmente
    translateWord(text, 'en|es', function(translated, err) {
      if (err) {
        _renderVerbSearchError(resultBox);
        return;
      }
      _renderVerbSearchResult(resultBox, text.toLowerCase(), translated);
    });
  } else {
    // Búsqueda en español: primero traducir a inglés para obtener el verbo base
    translateWord(text, 'es|en', function(englishWord, err) {
      if (err) {
        _renderVerbSearchError(resultBox);
        return;
      }
      _renderVerbSearchResult(resultBox, englishWord.toLowerCase(), text);
    });
  }
}

function _renderVerbSearchError(resultBox) {
  resultBox.innerHTML = '<div style="padding:14px;text-align:center;font-size:12px;color:var(--red);font-weight:600">⚠️ No se pudo traducir. Revisa tu conexión e inténtalo de nuevo.</div>';
}

function _renderVerbSearchResult(resultBox, englishWord, spanishWord) {
  var past = getPastTense(englishWord);
  var speakSafe = englishWord.replace(/'/g, '');
  resultBox.innerHTML =
    '<div style="display:grid;grid-template-columns:1.7fr 1fr 1fr;background:#EFF6FF;padding:8px 12px;font-family:var(--f);font-size:10px;font-weight:800;color:var(--blue)"><div>Verb</div><div>Present</div><div>Past</div></div>' +
    '<div style="display:grid;grid-template-columns:1.7fr 1fr 1fr;padding:9px 12px;font-size:12px;color:var(--gray-800);align-items:center">' +
      '<div style="display:flex;align-items:center;gap:6px"><div><span style="font-size:14px;color:var(--gray-800);font-weight:800">' + englishWord + '</span><br><span style="font-size:11px;color:var(--gray-400);font-weight:600">' + spanishWord + '</span></div>' +
      '<button onclick="speakWord(\'' + speakSafe + '\', event)" title="Listen" style="flex-shrink:0;width:22px;height:22px;border-radius:50%;border:none;background:var(--blue);color:white;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">🔊</button></div>' +
      '<div>' + englishWord + '</div><div>' + past + '</div>' +
    '</div>';
}
