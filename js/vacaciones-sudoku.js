/* =============================================
   VACACIONES-SUDOKU.JS — Minijuego desbloqueable
   al terminar una sesion de Vacaciones con
   CONFIG.vacaciones.umbralJuegos aciertos o mas.

   Cada partida genera un sudoku nuevo (solucion
   completa valida + solucion UNICA al quitar
   casillas), no son tableros fijos.

   Una unica partida por sesion: la pantalla del juego
   tiene un boton de atras, pero va directo a la home
   de Vacaciones (s-vacaciones) — nunca a elegir otro
   juego o nivel, para no permitir repetir el intento.
   ============================================= */

var VAC_SUDOKU_CONFIG = {
  4: { blockR: 2, blockC: 2, givens: 8  },  // 16 casillas, 50% visibles
  6: { blockR: 2, blockC: 3, givens: 14 },  // 36 casillas, ~39% visibles
  9: { blockR: 3, blockC: 3, givens: 30 }   // 81 casillas, ~37% visibles
};

function _vacSudokuShuffleArr(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function _vacSudokuIsValid(grid, size, blockR, blockC, row, col, val) {
  for (var c = 0; c < size; c++) if (grid[row][c] === val) return false;
  for (var r = 0; r < size; r++) if (grid[r][col] === val) return false;
  var br = Math.floor(row / blockR) * blockR, bc = Math.floor(col / blockC) * blockC;
  for (var r2 = br; r2 < br + blockR; r2++) {
    for (var c2 = bc; c2 < bc + blockC; c2++) {
      if (grid[r2][c2] === val) return false;
    }
  }
  return true;
}

/* ---- Rellenar el tablero entero con una solucion valida (backtracking,
   candidatos en orden aleatorio para que cada partida salga distinta) ---- */
function _vacSudokuFill(grid, size, blockR, blockC, pos) {
  if (pos === size * size) return true;
  var row = Math.floor(pos / size), col = pos % size;
  if (grid[row][col] !== 0) return _vacSudokuFill(grid, size, blockR, blockC, pos + 1);

  var nums = [];
  for (var n = 1; n <= size; n++) nums.push(n);
  _vacSudokuShuffleArr(nums);

  for (var i = 0; i < nums.length; i++) {
    var val = nums[i];
    if (_vacSudokuIsValid(grid, size, blockR, blockC, row, col, val)) {
      grid[row][col] = val;
      if (_vacSudokuFill(grid, size, blockR, blockC, pos + 1)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

/* ---- Contar soluciones posibles (hasta `limit`), para comprobar que al
   quitar una casilla el puzzle sigue teniendo una unica solucion ---- */
function _vacSudokuCountSolutions(grid, size, blockR, blockC, limit) {
  var count = 0;
  function solve(pos) {
    if (count >= limit) return;
    if (pos === size * size) { count++; return; }
    var row = Math.floor(pos / size), col = pos % size;
    if (grid[row][col] !== 0) { solve(pos + 1); return; }
    for (var val = 1; val <= size && count < limit; val++) {
      if (_vacSudokuIsValid(grid, size, blockR, blockC, row, col, val)) {
        grid[row][col] = val;
        solve(pos + 1);
        grid[row][col] = 0;
      }
    }
  }
  solve(0);
  return count;
}

/* ---- Quitar casillas de la solucion completa hasta llegar a `givens`
   visibles, comprobando en cada paso que la solucion siga siendo unica ---- */
function _vacSudokuCarve(solution, size, blockR, blockC, givens) {
  var puzzle = solution.map(function(row) { return row.slice(); });
  var cells = [];
  for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) cells.push([r, c]);
  _vacSudokuShuffleArr(cells);

  var maxRemovable = size * size - givens;
  var removed = 0;

  for (var i = 0; i < cells.length && removed < maxRemovable; i++) {
    var r = cells[i][0], c = cells[i][1];
    var backup = puzzle[r][c];
    puzzle[r][c] = 0;
    var copy = puzzle.map(function(row) { return row.slice(); });
    var solCount = _vacSudokuCountSolutions(copy, size, blockR, blockC, 2);
    if (solCount === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup; // no era unica: se deja la casilla visible
    }
  }
  return puzzle;
}

function _vacSudokuGenerate(size) {
  var cfg = VAC_SUDOKU_CONFIG[size];
  var solution = [];
  for (var i = 0; i < size; i++) solution.push(new Array(size).fill(0));
  _vacSudokuFill(solution, size, cfg.blockR, cfg.blockC, 0);

  var puzzle = _vacSudokuCarve(solution, size, cfg.blockR, cfg.blockC, cfg.givens);
  var fixed = puzzle.map(function(row) { return row.map(function(v) { return v !== 0 ? 1 : 0; }); });

  return { blockR: cfg.blockR, blockC: cfg.blockC, solution: solution, fixed: fixed };
}

var VacSudoku = { size: 0, blockR: 0, blockC: 0, solution: null, fixed: null, board: null, selected: null };

/* ---- Empezar una partida (llamado desde s-vac-nivel) ---- */
function vacSudokuStart(n) {
  var p = _vacSudokuGenerate(n);
  VacSudoku.size = n;
  VacSudoku.blockR = p.blockR;
  VacSudoku.blockC = p.blockC;
  VacSudoku.solution = p.solution;
  VacSudoku.fixed = p.fixed;
  VacSudoku.board = p.solution.map(function(row, r) {
    return row.map(function(val, c) { return p.fixed[r][c] ? val : 0; });
  });
  VacSudoku.selected = null;

  var win = document.getElementById('vac-sudoku-win');
  if (win) win.style.display = 'none';
  var status = document.getElementById('vac-sudoku-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Rellena para que no se repita ningún número en cada fila, columna o cuadrante'; }

  go('s-vac-sudoku');
  requestAnimationFrame(function() {
    _vacSudokuBuildNumpad();
    _vacSudokuRenderBoard();
  });
}

function _vacSudokuBuildNumpad() {
  var el = document.getElementById('vac-sudoku-numpad');
  if (!el) return;
  el.innerHTML = '';
  var size = VacSudoku.size;
  var cols = size === 4 ? 5 : (size === 6 ? 4 : 5);
  el.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

  for (var n = 1; n <= size; n++) {
    var btn = document.createElement('button');
    btn.className = 'sudoku-key';
    btn.textContent = n;
    btn.onclick = (function(nn) { return function() { _vacSudokuPlace(nn); }; })(n);
    el.appendChild(btn);
  }
  var del = document.createElement('button');
  del.className = 'sudoku-key erase';
  del.textContent = '🗑️';
  del.onclick = function() { _vacSudokuPlace(0); };
  el.appendChild(del);
}

function _vacSudokuRenderBoard() {
  var el = document.getElementById('vac-sudoku-board');
  if (!el) return;
  var size = VacSudoku.size, blockR = VacSudoku.blockR, blockC = VacSudoku.blockC;
  el.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
  el.style.gap = '2px';
  el.innerHTML = '';

  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      var cell = document.createElement('div');
      var isFixed = VacSudoku.fixed[r][c] === 1;
      var cls = 'sudoku-cell' + (isFixed ? ' fixed' : '');
      if ((c + 1) % blockC === 0 && c !== size - 1) cls += ' block-r';
      if ((r + 1) % blockR === 0 && r !== size - 1) cls += ' block-b';
      if (VacSudoku.selected && VacSudoku.selected[0] === r && VacSudoku.selected[1] === c) cls += ' selected';
      cell.className = cls;
      cell.style.fontSize = size === 9 ? '16px' : (size === 6 ? '19px' : '22px');
      cell.textContent = VacSudoku.board[r][c] || '';
      if (!isFixed) {
        cell.onclick = (function(rr, cc) { return function() { VacSudoku.selected = [rr, cc]; _vacSudokuRenderBoard(); }; })(r, c);
      }
      el.appendChild(cell);
    }
  }
}

function _vacSudokuPlace(n) {
  if (!VacSudoku.selected) return;
  var r = VacSudoku.selected[0], c = VacSudoku.selected[1];
  VacSudoku.board[r][c] = n === 0 ? 0 : n;
  _vacSudokuRenderBoard();
  _vacSudokuCheckWin();
}

function _vacSudokuCheckWin() {
  var size = VacSudoku.size, board = VacSudoku.board, solution = VacSudoku.solution;
  var full = board.every(function(row) { return row.every(function(v) { return v !== 0; }); });
  if (!full) return;

  var correct = true;
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      if (board[r][c] !== solution[r][c]) correct = false;
    }
  }

  var status = document.getElementById('vac-sudoku-status');
  if (correct) {
    if (status) status.style.display = 'none';
    var win = document.getElementById('vac-sudoku-win');
    if (win) {
      win.style.display = 'block';
      win.innerHTML = '<div class="sudoku-win-banner">'
        + '<div style="font-size:40px">🏆</div>'
        + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡Sudoku resuelto!</div>'
        + '<div style="font-size:12px;color:var(--green);font-weight:700">¡Enhorabuena, lo has conseguido!</div>'
        + '</div>'
        + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
    }
  } else if (status) {
    status.textContent = '❌ Algo no cuadra todavía, sigue intentando';
  }
}
