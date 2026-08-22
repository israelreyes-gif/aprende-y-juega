/* =============================================
   VACACIONES-PUZZLE.JS — Puzle deslizante (15-puzzle)
   Genera siempre un puzle resoluble (comprobado
   matematicamente antes de mostrarlo, no por prueba
   y error). Una unica partida por sesion.
   ============================================= */

var VacPuzzle = { tiles: [], size: 4 };

function vacPuzzleStart(size) {
  VacPuzzle.size = size;
  var n = size * size;
  var arr = [];
  for (var i = 1; i < n; i++) arr.push(i);
  arr.push(0);

  // Partir del tablero resuelto y aplicar movimientos validos al azar:
  // garantiza que el puzle es siempre resoluble (cualquier secuencia de
  // movimientos validos se puede deshacer), sin depender de una formula
  // de paridad que en tableros de lado par es facil de aplicar mal.
  var blank = n - 1;
  var lastMove = -1;
  var scrambleMoves = size * size * 25;
  for (var s = 0; s < scrambleMoves; s++) {
    var br = Math.floor(blank / size), bc = blank % size;
    var options = [];
    if (br > 0) options.push(blank - size);
    if (br < size - 1) options.push(blank + size);
    if (bc > 0) options.push(blank - 1);
    if (bc < size - 1) options.push(blank + 1);
    options = options.filter(function(o) { return o !== lastMove; });
    var pick = options[Math.floor(Math.random() * options.length)];
    arr[blank] = arr[pick]; arr[pick] = 0;
    lastMove = blank;
    blank = pick;
  }

  VacPuzzle.tiles = arr;

  var win = document.getElementById('vac-puzzle-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-puzzle-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Ordena del 1 al ' + (n - 1); }

  go('s-vac-puzzle');
  requestAnimationFrame(function() { _vacPuzzleRender(); });
}

function _vacPuzzleIsSolved(arr) {
  for (var i = 0; i < arr.length - 1; i++) if (arr[i] !== i + 1) return false;
  return true;
}

function _vacPuzzleRender() {
  var el = document.getElementById('vac-puzzle-grid');
  if (!el) return;
  var size = VacPuzzle.size;
  el.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
  el.innerHTML = '';
  var fontPx = size <= 3 ? 24 : (size === 4 ? 20 : 16);
  VacPuzzle.tiles.forEach(function(v, i) {
    var cell = document.createElement('div');
    cell.style.cssText = 'aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:var(--f);font-weight:900;font-size:' + fontPx + 'px;cursor:pointer;'
      + (v === 0 ? 'background:transparent' : 'background:white;color:var(--purple-dark);box-shadow:0 1px 4px rgba(0,0,0,.08)');
    cell.textContent = v === 0 ? '' : v;
    cell.onclick = function() { _vacPuzzleTryMove(i); };
    el.appendChild(cell);
  });
}

function _vacPuzzleTryMove(i) {
  var size = VacPuzzle.size;
  var blank = VacPuzzle.tiles.indexOf(0);
  var ir = Math.floor(i / size), ic = i % size, br = Math.floor(blank / size), bc = blank % size;
  var adjacent = (ir === br && Math.abs(ic - bc) === 1) || (ic === bc && Math.abs(ir - br) === 1);
  if (!adjacent) return;

  VacPuzzle.tiles[blank] = VacPuzzle.tiles[i];
  VacPuzzle.tiles[i] = 0;
  _vacPuzzleRender();

  if (_vacPuzzleIsSolved(VacPuzzle.tiles)) {
    var status = document.getElementById('vac-puzzle-status');
    if (status) status.style.display = 'none';
    document.getElementById('vac-puzzle-win').innerHTML = '<div class="sudoku-win-banner">'
      + '<div style="font-size:40px">🏆</div>'
      + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡Resuelto!</div>'
      + '<div style="font-size:12px;color:var(--green);font-weight:700">¡Enhorabuena, lo has conseguido!</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  }
}
