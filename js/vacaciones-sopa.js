/* =============================================
   VACACIONES-SOPA.JS — Minijuego "Sopa de letras"
   desbloqueable al terminar una sesion de Vacaciones
   con CONFIG.vacaciones.umbralJuegos aciertos o mas
   (mismo desbloqueo que Sudoku, ver vacaciones-sudoku.js).

   Una unica partida por sesion: la pantalla del juego
   tiene un boton de atras, pero va directo a la home
   de Vacaciones (s-vacaciones) — nunca a elegir otro
   juego o nivel, para no permitir repetir el intento.
   ============================================= */

var VAC_SOPA_WORDS = {
  facil:   ['GATO','PERRO','LUNA','FLOR','PEZ','ARBOL','LIBRO','CASA','SOL','NUBE'],
  medio:   ['ELEFANTE','JIRAFA','TORTUGA','DELFIN','COCODRILO','MARIPOSA','HORMIGA','CANGREJO','PINGUINO','CAMALEON','ESCORPION','ARDILLA','MEDUSA'],
  dificil: ['ELEFANTE','JIRAFA','TORTUGA','DELFIN','COCODRILO','MARIPOSA','HORMIGA','CANGREJO','PINGUINO','CAMALEON','ESCORPION','ARDILLA','MEDUSA','BALLENA','PULPO']
};
var VAC_SOPA_SIZES = { facil: 10, medio: 13, dificil: 15 };
var VAC_SOPA_DIRS = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
var VAC_SOPA_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/* Un color distinto por palabra (hasta 15): 7 tonos en version clara/oscura + 1 extra */
var VAC_SOPA_COLORS = [
  { bg:'#DBEAFE', text:'#1D4ED8' }, { bg:'#93C5FD', text:'#1E3A8A' },
  { bg:'#CCFBF1', text:'#0F766E' }, { bg:'#5EEAD4', text:'#134E4A' },
  { bg:'#DCFCE7', text:'#15803D' }, { bg:'#86EFAC', text:'#14532D' },
  { bg:'#FEF3C7', text:'#B45309' }, { bg:'#FCD34D', text:'#78350F' },
  { bg:'#FEE2E2', text:'#B91C1C' }, { bg:'#FCA5A5', text:'#7F1D1D' },
  { bg:'#FCE7F3', text:'#BE185D' }, { bg:'#F9A8D4', text:'#831843' },
  { bg:'#EDE9FE', text:'#6D28D9' }, { bg:'#C4B5FD', text:'#4C1D95' },
  { bg:'#FFEDD5', text:'#C2410C' }
];

var VacSopa = { size:0, grid:null, words:[], found:{}, foundColors:{}, foundWords:{}, wordColor:{}, selStart:null };

function _vacSopaGenGrid(size, words) {
  var grid = [];
  for (var i = 0; i < size; i++) grid.push(new Array(size).fill(null));

  words.forEach(function(word) {
    var placed = false, tries = 0;
    while (!placed && tries < 200) {
      tries++;
      var dir = VAC_SOPA_DIRS[Math.floor(Math.random() * VAC_SOPA_DIRS.length)];
      var row = Math.floor(Math.random() * size);
      var col = Math.floor(Math.random() * size);
      var endRow = row + dir[0] * (word.length - 1);
      var endCol = col + dir[1] * (word.length - 1);
      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
      var ok = true;
      for (var k = 0; k < word.length; k++) {
        var rr = row + dir[0] * k, cc = col + dir[1] * k;
        if (grid[rr][cc] !== null && grid[rr][cc] !== word[k]) { ok = false; break; }
      }
      if (!ok) continue;
      for (var k2 = 0; k2 < word.length; k2++) {
        var rr2 = row + dir[0] * k2, cc2 = col + dir[1] * k2;
        grid[rr2][cc2] = word[k2];
      }
      placed = true;
    }
  });

  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      if (grid[r][c] === null) grid[r][c] = VAC_SOPA_LETTERS[Math.floor(Math.random() * VAC_SOPA_LETTERS.length)];
    }
  }
  return grid;
}

/* ---- Empezar una partida (llamado desde s-vac-nivel-sopa) ---- */
function vacSopaStart(nivel) {
  var size = VAC_SOPA_SIZES[nivel];
  var words = VAC_SOPA_WORDS[nivel];
  if (!size || !words) return;

  VacSopa.size = size;
  VacSopa.words = words;
  VacSopa.grid = _vacSopaGenGrid(size, words);
  VacSopa.found = {};
  VacSopa.foundColors = {};
  VacSopa.foundWords = {};
  VacSopa.wordColor = {};
  words.forEach(function(w, i) { VacSopa.wordColor[w] = VAC_SOPA_COLORS[i % VAC_SOPA_COLORS.length]; });
  VacSopa.selStart = null;

  var win = document.getElementById('vac-sopa-win');
  if (win) win.style.display = 'none';
  var status = document.getElementById('vac-sopa-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Toca la primera letra y luego la última de cada palabra'; }

  _vacSopaRenderGrid();
  _vacSopaRenderWords();
  go('s-vac-sopa');
}

function _vacSopaRenderGrid() {
  var el = document.getElementById('vac-sopa-grid');
  if (!el) return;
  var size = VacSopa.size;
  el.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';

  var wrapWidth = el.parentElement.clientWidth - 16;
  var cellPx = Math.floor(wrapWidth / size);
  var fontPx = Math.max(7, Math.min(16, Math.floor(cellPx * 0.55)));

  el.innerHTML = '';
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      var cell = document.createElement('div');
      var key = r + '_' + c;
      var isSel = VacSopa.selStart && VacSopa.selStart[0] === r && VacSopa.selStart[1] === c;
      cell.className = 'ws-cell' + (isSel ? ' sel' : '');
      cell.style.fontSize = fontPx + 'px';
      if (VacSopa.found[key]) {
        var fc = VacSopa.foundColors[key];
        cell.style.background = fc.bg;
        cell.style.color = fc.text;
      }
      cell.textContent = VacSopa.grid[r][c];
      cell.onclick = (function(rr, cc) { return function() { _vacSopaCellClick(rr, cc); }; })(r, c);
      el.appendChild(cell);
    }
  }
}

function _vacSopaRenderWords() {
  var el = document.getElementById('vac-sopa-words');
  if (!el) return;
  el.innerHTML = '';
  VacSopa.words.forEach(function(w) {
    var chip = document.createElement('span');
    var color = VacSopa.wordColor[w];
    var isFound = VacSopa.foundWords[w];
    chip.className = 'ws-word-chip' + (isFound ? ' found' : '');
    chip.style.background = color.bg;
    chip.style.color = color.text;
    chip.textContent = (isFound ? '✓ ' : '') + w;
    el.appendChild(chip);
  });
}

function _vacSopaCellClick(r, c) {
  if (!VacSopa.selStart) { VacSopa.selStart = [r, c]; _vacSopaRenderGrid(); return; }

  var r0 = VacSopa.selStart[0], c0 = VacSopa.selStart[1];
  var dr = r - r0, dc = c - c0;
  var steps = Math.max(Math.abs(dr), Math.abs(dc));
  var sdr = steps ? dr / steps : 0, sdc = steps ? dc / steps : 0;
  var isLine = (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc));

  if (isLine && steps > 0) {
    var path = [], letters = '';
    for (var i = 0; i <= steps; i++) {
      var rr = r0 + sdr * i, cc = c0 + sdc * i;
      path.push([rr, cc]);
      letters += VacSopa.grid[rr][cc];
    }
    var rev = letters.split('').reverse().join('');
    var match = VacSopa.words.find(function(w) { return (w === letters || w === rev) && !VacSopa.foundWords[w]; });
    if (match) {
      var color = VacSopa.wordColor[match];
      path.forEach(function(p) {
        var key = p[0] + '_' + p[1];
        VacSopa.found[key] = true;
        VacSopa.foundColors[key] = color;
      });
      VacSopa.foundWords[match] = true;
      _vacSopaRenderWords();
      _vacSopaCheckWin();
    }
  }
  VacSopa.selStart = null;
  _vacSopaRenderGrid();
}

function _vacSopaCheckWin() {
  var allFound = VacSopa.words.every(function(w) { return VacSopa.foundWords[w]; });
  if (!allFound) return;

  var status = document.getElementById('vac-sopa-status');
  if (status) status.style.display = 'none';
  var win = document.getElementById('vac-sopa-win');
  if (win) {
    win.style.display = 'block';
    win.innerHTML = '<div class="sudoku-win-banner">'
      + '<div style="font-size:40px">🏆</div>'
      + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡Sopa de letras resuelta!</div>'
      + '<div style="font-size:12px;color:var(--green);font-weight:700">¡Enhorabuena, las encontraste todas!</div>'
      + '</div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  }
}
