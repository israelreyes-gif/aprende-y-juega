/* =============================================
   MATES-MULTIPLICACION-C4.JS — Matemáticas 4º, tema
   Multiplicación.

   Tres piezas, todas comparten MULT_FACTS_C4 (las tablas
   "difíciles" con sus trucos de derivación):

   1. Study (s-mates-mult-study-c4): rejilla filas×columnas
      interactiva + derivador de tablas — sin puntuar, solo
      para aprender.
   2. Ejercicios "con ayudas" (s-mates-mult-ayudas-c4): el
      niño elige rejilla o truco para trabajar la respuesta
      y la escribe él mismo — sí puntúa y cuenta para la
      regla del 75% (exerciseKey 'mates-mult-ayudas-c4').
   3. Ejercicios "sin ayudas" (s-mates-mult-c4): opción
      múltiple normal con el motor genérico de Mates
      (engine-mates.js), igual que sumas/restas/multiplicaciones
      de 3º (exerciseKey 'mates-mult-c4').
   ============================================= */

/* ---- Tablas difíciles con sus trucos de derivación ----
   Compartida por Study y por "con ayudas": cuando una pregunta
   coincide con una de estas, se puede ofrecer el modo Truco. */
var MULT_FACTS_C4 = [
  { a: 6, b: 9, resultado: 54, strategies: [
    { id: 'ten', label: 'Desde ×10', steps: ['6 × 10 = 60', '60 − 6 = 54'] },
    { id: 'dbl', label: 'Doblando',  steps: ['3 × 9 = 27', 'doble = 54'] }
  ]},
  { a: 7, b: 6, resultado: 42, strategies: [
    { id: 'dbl',  label: 'Doblando', steps: ['7 × 3 = 21', 'doble = 42'] },
    { id: 'five', label: 'Desde ×5', steps: ['5 × 6 = 30', '30 + 6 + 6 = 42'] }
  ]},
  { a: 8, b: 4, resultado: 32, strategies: [
    { id: 'dbl', label: 'Doblando',  steps: ['4 × 4 = 16', 'doble = 32'] },
    { id: 'ten', label: 'Desde ×10', steps: ['10 × 4 = 40', '40 − 8 = 32'] }
  ]},
  { a: 7, b: 8, resultado: 56, strategies: [
    { id: 'dbl',  label: 'Doblando', steps: ['7 × 4 = 28', 'doble = 56'] },
    { id: 'five', label: 'Desde ×5', steps: ['5 × 8 = 40', '40 + 8 + 8 = 56'] }
  ]},
  { a: 9, b: 7, resultado: 63, strategies: [
    { id: 'ten', label: 'Desde ×10', steps: ['10 × 7 = 70', '70 − 7 = 63'] }
  ]},
  { a: 6, b: 8, resultado: 48, strategies: [
    { id: 'dbl',  label: 'Doblando', steps: ['3 × 8 = 24', 'doble = 48'] },
    { id: 'five', label: 'Desde ×5', steps: ['5 × 8 = 40', '40 + 8 = 48'] }
  ]}
];

/* Tablas "fáciles" (×1, ×10, ×2, ×5, ×4) para mezclar en las
   preguntas de "con ayudas" — no todas tienen que ser difíciles. */
var MULT_EASY_PAIRS_C4 = [[1,7],[10,4],[2,8],[5,6],[4,9],[2,6],[10,7],[5,3],[1,9],[4,4],[10,2],[5,8]];

/* =============================================
   1. STUDY — rejilla + derivador (sin puntuar)
   ============================================= */
var _studyState = { rows: 4, cols: 3, factIndex: 0, strategyIndex: 0 };

function renderMultStudy() {
  var s = _studyState;

  setEl('mstudy-rows-val', s.rows);
  setEl('mstudy-cols-val', s.cols);

  var grid = document.getElementById('mstudy-grid');
  if (grid) {
    grid.style.gridTemplateColumns = 'repeat(' + s.cols + ', 13px)';
    grid.style.gridAutoRows = '13px';
    grid.innerHTML = '';
    for (var i = 0; i < s.rows * s.cols; i++) {
      var dot = document.createElement('div');
      dot.style.cssText = 'width:13px;height:13px;border-radius:4px;background:var(--purple)';
      grid.appendChild(dot);
    }
  }
  var product = s.rows * s.cols;
  setEl('mstudy-eq', ''); // texto compuesto abajo (necesita HTML, no solo texto)
  var eq = document.getElementById('mstudy-eq');
  if (eq) eq.innerHTML = s.rows + ' × ' + s.cols + ' = <span style="color:var(--purple)">' + product + '</span>';

  var factsBox = document.getElementById('mstudy-facts');
  if (factsBox) {
    factsBox.innerHTML = '';
    MULT_FACTS_C4.forEach(function(f, i) {
      var btn = document.createElement('button');
      var selected = i === s.factIndex;
      btn.textContent = f.a + '×' + f.b;
      btn.style.cssText = 'border:none;font-family:var(--f);font-weight:800;font-size:14px;border-radius:12px;padding:9px 4px;text-align:center;background:' + (selected ? 'var(--purple)' : '#F7F5FC') + ';color:' + (selected ? 'white' : 'var(--gray-800)');
      btn.onclick = function() { s.factIndex = i; s.strategyIndex = 0; renderMultStudy(); };
      factsBox.appendChild(btn);
    });
  }

  _renderFactDerivation(s.factIndex, s.strategyIndex,
    'mstudy-fact-eq', 'mstudy-strategies', 'mstudy-steps',
    function(newStrategyIndex) { s.strategyIndex = newStrategyIndex; renderMultStudy(); });
}

function studyIncRows() { _studyState.rows = Math.min(10, _studyState.rows + 1); renderMultStudy(); }
function studyDecRows() { _studyState.rows = Math.max(1, _studyState.rows - 1); renderMultStudy(); }
function studyIncCols() { _studyState.cols = Math.min(10, _studyState.cols + 1); renderMultStudy(); }
function studyDecCols() { _studyState.cols = Math.max(1, _studyState.cols - 1); renderMultStudy(); }

/* ---- Helper compartido: pinta la ecuación + botones de
   estrategia + pasos de una tabla de MULT_FACTS_C4 ----
   onPickStrategy(i): callback al tocar un botón de estrategia. */
function _renderFactDerivation(factIndex, strategyIndex, eqId, stratBoxId, stepsId, onPickStrategy) {
  var fact = MULT_FACTS_C4[factIndex];
  setEl(eqId, fact.a + ' × ' + fact.b + ' = ' + fact.resultado);

  var stratBox = document.getElementById(stratBoxId);
  if (stratBox) {
    stratBox.innerHTML = '';
    if (fact.strategies.length > 1) {
      fact.strategies.forEach(function(strat, i) {
        var selected = i === strategyIndex;
        var btn = document.createElement('button');
        btn.textContent = strat.label;
        btn.style.cssText = 'border:none;font-family:var(--f);font-weight:800;font-size:11.5px;border-radius:10px;padding:8px 4px;text-align:center;background:' + (selected ? '#1E3A8A' : 'white') + ';color:' + (selected ? 'white' : '#1E3A8A');
        btn.onclick = function() { onPickStrategy(i); };
        stratBox.appendChild(btn);
      });
    }
  }

  var stepsBox = document.getElementById(stepsId);
  if (stepsBox) {
    stepsBox.innerHTML = '';
    var strategy = fact.strategies[strategyIndex] || fact.strategies[0];
    strategy.steps.forEach(function(step) {
      var line = document.createElement('div');
      line.style.cssText = 'font-size:13.5px;font-weight:700;color:#1E3A8A;background:white;border-radius:8px;padding:7px 10px;font-family:var(--f)';
      line.textContent = step;
      stepsBox.appendChild(line);
    });
  }
}

/* =============================================
   2. EJERCICIOS CON AYUDAS — rejilla progresiva o truco,
   el niño escribe la respuesta y se comprueba.
   ============================================= */
var _ayudasState = {
  quiz: { a: 6, b: 8, trickIndex: 5 },
  method: 'grid',
  builtRows: 0,
  trickStrategyIndex: 0,
  answer: '',
  checked: false,
  intentos: 0
};

function startMultAyudas() {
  _ayudasPickNewQuiz();
}

function _ayudasPickNewQuiz() {
  var s = _ayudasState;
  var useHard = Math.random() < 0.5;
  if (useHard) {
    var idx = Math.floor(Math.random() * MULT_FACTS_C4.length);
    var f = MULT_FACTS_C4[idx];
    s.quiz = { a: f.a, b: f.b, trickIndex: idx };
  } else {
    var p = MULT_EASY_PAIRS_C4[Math.floor(Math.random() * MULT_EASY_PAIRS_C4.length)];
    s.quiz = { a: p[0], b: p[1], trickIndex: null };
  }
  s.method = 'grid';
  s.builtRows = 0;
  s.trickStrategyIndex = 0;
  s.answer = '';
  s.checked = false;
  s.intentos = 0;
  renderMultAyudas();
}

function ayudasNewQuiz() { _ayudasPickNewQuiz(); }

function renderMultAyudas() {
  var s = _ayudasState;
  var quiz = s.quiz;
  var hasTrick = quiz.trickIndex !== null && quiz.trickIndex !== undefined;

  setEl('mayu-question', quiz.a + ' × ' + quiz.b + ' = ?');

  var tabGrid  = document.getElementById('mayu-tab-grid');
  var tabTrick = document.getElementById('mayu-tab-trick');
  if (tabGrid)  tabGrid.style.cssText  = 'flex:1;border:none;border-radius:10px;padding:9px;font-weight:800;font-size:12.5px;font-family:var(--f);background:' + (s.method === 'grid' ? 'var(--purple)' : '#F7F5FC') + ';color:' + (s.method === 'grid' ? 'white' : 'var(--gray-800)');
  if (tabTrick) {
    tabTrick.style.display = hasTrick ? 'block' : 'none';
    tabTrick.style.cssText = (hasTrick ? '' : 'display:none;') + 'flex:1;border:none;border-radius:10px;padding:9px;font-weight:800;font-size:12.5px;font-family:var(--f);background:' + (s.method === 'trick' ? '#1E3A8A' : '#F7F5FC') + ';color:' + (s.method === 'trick' ? 'white' : 'var(--gray-800)');
  }

  var gridPanel  = document.getElementById('mayu-grid-panel');
  var trickPanel = document.getElementById('mayu-trick-panel');
  var isGridMode  = s.method === 'grid';
  var isTrickMode = s.method === 'trick' && hasTrick;
  if (gridPanel)  gridPanel.style.display  = isGridMode  ? 'flex' : 'none';
  if (trickPanel) trickPanel.style.display = isTrickMode ? 'block' : 'none';

  if (isGridMode) {
    var built = Math.min(quiz.a, s.builtRows);
    var grid = document.getElementById('mayu-grid');
    if (grid) {
      grid.style.gridTemplateColumns = 'repeat(' + quiz.b + ', 13px)';
      grid.style.gridAutoRows = '13px';
      grid.innerHTML = '';
      for (var i = 0; i < built * quiz.b; i++) {
        var dot = document.createElement('div');
        dot.style.cssText = 'width:13px;height:13px;border-radius:4px;background:var(--purple)';
        grid.appendChild(dot);
      }
    }
    var total = built * quiz.b;
    setEl('mayu-row-text', built === 0
      ? 'Toca "+ fila" para ir sumando de ' + quiz.b + ' en ' + quiz.b
      : built + (built === 1 ? ' fila de ' : ' filas de ') + quiz.b + ' = ' + total);
    var addBtn = document.getElementById('mayu-add-row-btn');
    if (addBtn) addBtn.textContent = '+ fila de ' + quiz.b;
  }

  if (isTrickMode) {
    _renderFactDerivation(quiz.trickIndex, s.trickStrategyIndex,
      null, 'mayu-trick-strategies', 'mayu-trick-steps',
      function(newIdx) { s.trickStrategyIndex = newIdx; renderMultAyudas(); });
  }

  var input = document.getElementById('mayu-input');
  if (input && input.value !== s.answer) input.value = s.answer;

  _renderAyudasFeedback();
}

function ayudasUseGrid()  { _ayudasState.method = 'grid';  renderMultAyudas(); }
function ayudasUseTrick() {
  if (_ayudasState.quiz.trickIndex === null || _ayudasState.quiz.trickIndex === undefined) return;
  _ayudasState.method = 'trick';
  renderMultAyudas();
}

function ayudasAddRow()    { var s = _ayudasState; s.builtRows = Math.min(s.quiz.a, s.builtRows + 1); renderMultAyudas(); }
function ayudasRemoveRow() { var s = _ayudasState; s.builtRows = Math.max(0, s.builtRows - 1); renderMultAyudas(); }

function ayudasSetAnswer(val) {
  _ayudasState.answer = val;
  _ayudasState.checked = false;
  _renderAyudasFeedback();
}

function ayudasCheckAnswer() {
  var s = _ayudasState;
  s.checked = true;
  var correct = parseInt(s.answer, 10) === s.quiz.a * s.quiz.b;
  var _p = configGetPts('mates-mult-ayudas-c4');
  if (correct) {
    var pts = s.intentos === 0 ? _p.primero : _p.segundo;
    recordResult('mates', 'mates-mult-ayudas-c4', true);
    awardPts(pts, 'mates');
    s._lastPts = pts;
  } else {
    s.intentos++;
    if (s.intentos >= 2) recordResult('mates', 'mates-mult-ayudas-c4', false);
  }
  renderMultAyudas();
}

function ayudasRevealAnswer() {
  var s = _ayudasState;
  s.answer = String(s.quiz.a * s.quiz.b);
  s.checked = true;
  var input = document.getElementById('mayu-input');
  if (input) input.value = s.answer;
  renderMultAyudas();
}

function _renderAyudasFeedback() {
  var s = _ayudasState;
  var box = document.getElementById('mayu-feedback');
  if (!box) return;
  if (!s.checked) { box.innerHTML = ''; return; }

  var numAnswer = parseInt(s.answer, 10);
  var correct = !isNaN(numAnswer) && numAnswer === s.quiz.a * s.quiz.b;

  if (correct) {
    box.innerHTML = '<div style="background:#DCFCE7;color:#166534;font-weight:800;font-size:13px;font-family:var(--f);border-radius:10px;padding:10px 12px">✅ ¡Muy bien! ' + s.quiz.a + ' × ' + s.quiz.b + ' = ' + (s.quiz.a * s.quiz.b) + ' — +' + (s._lastPts || 0) + ' pts</div>';
  } else {
    box.innerHTML =
      '<div style="background:#FEE2E2;color:#991B1B;font-weight:800;font-size:13px;font-family:var(--f);border-radius:10px;padding:10px 12px;margin-bottom:6px">Todavía no — añade otra fila o mira el truco 👆</div>' +
      '<button onclick="ayudasRevealAnswer()" style="background:none;border:none;color:var(--gray-400);font-weight:700;font-size:11.5px;font-family:var(--f);text-decoration:underline;padding:0">Ver la respuesta</button>';
  }
}

/* =============================================
   3. EJERCICIOS SIN AYUDAS — opción múltiple normal con
   el motor genérico de Mates (engine-mates.js).
   ============================================= */
function generarMultC4() {
  var a = Math.floor(Math.random() * 9) + 2; // 2-10
  var b = Math.floor(Math.random() * 9) + 2; // 2-10
  var resultado = a * b;
  var opts = new Set([resultado]);
  while (opts.size < 6) {
    var w = resultado + (Math.floor(Math.random() * 20) - 10);
    if (w > 0 && w !== resultado) opts.add(w);
  }
  return { a: a, b: b, resultado: resultado, opciones: shuffle(Array.from(opts)) };
}

function _renderMultC4Op(ex) {
  var eq = document.getElementById('multc4-eq');
  if (eq) eq.innerHTML = ex.a + ' × ' + ex.b + ' = <span style="color:var(--purple)">?</span>';
}

function cargarNuevaMultC4() {
  matesStart({
    generate:    generarMultC4,
    inputType:   'options',
    prefix:      'multc4',
    screenId:    's-mates-mult-c4',
    subjectKey:  'mates',
    exerciseKey: 'mates-mult-c4',
    renderOp:    _renderMultC4Op,
    optClass:    'mopt',
    correctMsg: function(pts, ex) {
      return '<div class="fbt">¡Genial! ' + ex.a + '×' + ex.b + '=' + ex.resultado + ' 🌟 +' + pts + ' pts</div>';
    },
    wrongMsg: function(ex) {
      return '<div class="fbt">La respuesta era <strong>' + ex.resultado + '</strong> (' + ex.a + '×' + ex.b + ') 📖</div>';
    }
  });
}
