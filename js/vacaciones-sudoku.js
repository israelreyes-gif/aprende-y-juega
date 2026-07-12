/* =============================================
   VACACIONES-SUDOKU.JS — Minijuego desbloqueable
   al terminar una sesion de Vacaciones con
   CONFIG.vacaciones.umbralJuegos aciertos o mas.

   Una unica partida por sesion: al empezar un
   nivel no hay boton de volver atras (a proposito,
   ver s-vac-sudoku en vacaciones.html).
   ============================================= */

var VAC_SUDOKU_PUZZLES = {
  4: {
    blockR: 2, blockC: 2,
    solution: [
      [1,2,3,4],
      [3,4,1,2],
      [2,1,4,3],
      [4,3,2,1]
    ],
    fixed: [
      [1,0,0,1],
      [0,1,1,0],
      [0,1,1,0],
      [1,0,0,1]
    ]
  },
  6: {
    blockR: 2, blockC: 3,
    solution: [
      [1,2,3,4,5,6],
      [4,5,6,1,2,3],
      [2,3,1,6,4,5],
      [5,6,4,3,1,2],
      [3,1,2,5,6,4],
      [6,4,5,2,3,1]
    ],
    fixed: [
      [1,0,0,1,0,0],
      [0,1,0,0,1,0],
      [0,0,1,0,0,1],
      [1,0,0,1,0,0],
      [0,1,0,0,1,0],
      [0,0,1,0,0,1]
    ]
  },
  9: {
    blockR: 3, blockC: 3,
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ],
    fixed: [
      [1,0,0,0,1,0,0,0,1],
      [0,1,0,1,0,1,0,1,0],
      [0,0,1,0,0,0,1,0,0],
      [1,0,0,1,0,1,0,0,1],
      [0,1,0,0,1,0,0,1,0],
      [1,0,0,1,0,1,0,0,1],
      [0,0,1,0,0,0,1,0,0],
      [0,1,0,1,0,1,0,1,0],
      [1,0,0,0,1,0,0,0,1]
    ]
  }
};

var VacSudoku = { size: 0, blockR: 0, blockC: 0, solution: null, fixed: null, board: null, selected: null };

/* ---- Empezar una partida (llamado desde s-vac-nivel) ---- */
function vacSudokuStart(n) {
  var p = VAC_SUDOKU_PUZZLES[n];
  if (!p) return;
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

  _vacSudokuBuildNumpad();
  _vacSudokuRenderBoard();
  go('s-vac-sudoku');
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
        + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vac-fin\')">Volver a resultados</button>';
    }
  } else if (status) {
    status.textContent = '❌ Algo no cuadra todavía, sigue intentando';
  }
}
