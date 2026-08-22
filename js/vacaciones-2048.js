/* =============================================
   VACACIONES-2048.JS — 2048
   Sin dificultad (tablero 4x4 fijo). Se entra
   directamente desde "Elige un juego".
   ============================================= */

var VAC_2048_COLORS = {
  0:'#CDC1B4', 2:'#EEE4DA', 4:'#EDE0C8', 8:'#F2B179', 16:'#F59563',
  32:'#F67C5F', 64:'#F65E3B', 128:'#EDCF72', 256:'#EDCC61', 512:'#EDC850',
  1024:'#EDC53F', 2048:'#EDC22E'
};

var Vac2048 = { grid: null, score: 0, over: false, won: false };

function vac2048Start() {
  Vac2048.grid = [];
  for (var r = 0; r < 4; r++) Vac2048.grid.push(new Array(4).fill(0));
  Vac2048.score = 0;
  Vac2048.over = false;
  Vac2048.won = false;
  _vac2048Spawn();
  _vac2048Spawn();

  var win = document.getElementById('vac-2048-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-2048-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Puntos: 0'; }

  go('s-vac-2048');
  requestAnimationFrame(function() { _vac2048Render(); });
}

function _vac2048Spawn() {
  var empty = [];
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) if (Vac2048.grid[r][c] === 0) empty.push([r, c]);
  if (!empty.length) return;
  var p = empty[Math.floor(Math.random() * empty.length)];
  Vac2048.grid[p[0]][p[1]] = Math.random() < 0.9 ? 2 : 4;
}

function _vac2048Render() {
  var el = document.getElementById('vac-2048-grid');
  if (!el) return;
  el.innerHTML = '';
  for (var r = 0; r < 4; r++) {
    for (var c = 0; c < 4; c++) {
      var v = Vac2048.grid[r][c];
      var cell = document.createElement('div');
      cell.style.cssText = 'aspect-ratio:1;border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:var(--f);font-weight:900;font-size:' + (v > 512 ? 16 : 20) + 'px;color:' + (v <= 4 ? '#776E65' : 'white') + ';background:' + (VAC_2048_COLORS[v] || '#3C3A32');
      cell.textContent = v || '';
      el.appendChild(cell);
    }
  }
}

function vac2048Move(dc, dr) {
  if (Vac2048.over) return;
  var moved = false;

  function collapseLine(line) {
    var vals = line.filter(function(v) { return v !== 0; });
    for (var i = 0; i < vals.length - 1; i++) {
      if (vals[i] === vals[i + 1]) {
        vals[i] *= 2;
        Vac2048.score += vals[i];
        if (vals[i] === 2048) Vac2048.won = true;
        vals.splice(i + 1, 1);
      }
    }
    while (vals.length < 4) vals.push(0);
    return vals;
  }

  for (var i = 0; i < 4; i++) {
    var line;
    if (dr !== 0) {
      line = [Vac2048.grid[0][i], Vac2048.grid[1][i], Vac2048.grid[2][i], Vac2048.grid[3][i]];
      if (dr > 0) line.reverse();
    } else {
      line = Vac2048.grid[i].slice();
      if (dc > 0) line.reverse();
    }
    var newLine = collapseLine(line);
    if (dr !== 0) {
      if (dr > 0) newLine.reverse();
      for (var r = 0; r < 4; r++) {
        if (Vac2048.grid[r][i] !== newLine[r]) moved = true;
        Vac2048.grid[r][i] = newLine[r];
      }
    } else {
      if (dc > 0) newLine.reverse();
      if (JSON.stringify(Vac2048.grid[i]) !== JSON.stringify(newLine)) moved = true;
      Vac2048.grid[i] = newLine;
    }
  }

  if (moved) {
    _vac2048Spawn();
    var status = document.getElementById('vac-2048-status');
    if (status) status.textContent = 'Puntos: ' + Vac2048.score;
  }
  _vac2048Render();
  _vac2048CheckEnd();
}

function _vac2048CheckEnd() {
  var win = document.getElementById('vac-2048-win');
  var status = document.getElementById('vac-2048-status');

  if (Vac2048.won) {
    Vac2048.over = true;
    if (status) status.style.display = 'none';
    win.innerHTML = '<div class="sudoku-win-banner">'
      + '<div style="font-size:40px">🏆</div>'
      + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡Llegaste a 2048!</div>'
      + '<div style="font-size:12px;color:var(--green);font-weight:700">Puntuación: ' + Vac2048.score + '</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
    return;
  }

  var full = Vac2048.grid.every(function(row) { return row.every(function(v) { return v !== 0; }); });
  if (!full) return;
  var canMove = false;
  for (var r = 0; r < 4; r++) {
    for (var c = 0; c < 4; c++) {
      if (r < 3 && Vac2048.grid[r][c] === Vac2048.grid[r + 1][c]) canMove = true;
      if (c < 3 && Vac2048.grid[r][c] === Vac2048.grid[r][c + 1]) canMove = true;
    }
  }
  if (!canMove) {
    Vac2048.over = true;
    if (status) status.style.display = 'none';
    win.innerHTML = '<div class="sudoku-win-banner" style="background:var(--red-light);border-color:var(--red)">'
      + '<div style="font-size:40px">😅</div>'
      + '<div style="font-family:var(--f);color:var(--red);font-size:16px;margin:6px 0 2px">Sin más movimientos</div>'
      + '<div style="font-size:12px;color:var(--red);font-weight:700">Puntuación: ' + Vac2048.score + '</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  }
}
