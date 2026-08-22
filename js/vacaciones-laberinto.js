/* =============================================
   VACACIONES-LABERINTO.JS — Laberinto simple
   (mover directo con flechas, sin direccion/giros,
   a diferencia de City Map). Reutiliza la misma idea
   de camino garantizado + puntos alejados mediante
   doble BFS con varias semillas.
   ============================================= */

var VacLaberinto = { size: 0, grid: null, pos: null, target: null, won: false };

function _vacLabGenGrid(size) {
  var grid = [];
  for (var r = 0; r < size; r++) grid.push(new Array(size).fill(0));
  var attempts = Math.round(size * size * 0.22);
  for (var i = 0; i < attempts; i++) {
    grid[Math.floor(Math.random() * size)][Math.floor(Math.random() * size)] = 1;
  }
  return grid;
}

function _vacLabBFS(grid, size, start) {
  var dist = {};
  dist[start[0] + '_' + start[1]] = 0;
  var queue = [start], farthest = start;
  while (queue.length) {
    var cur = queue.shift();
    var d = dist[cur[0] + '_' + cur[1]];
    if (d > dist[farthest[0] + '_' + farthest[1]]) farthest = cur;
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(v) {
      var nr = cur[0] + v[0], nc = cur[1] + v[1];
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || grid[nr][nc] === 1) return;
      var k = nr + '_' + nc;
      if (dist[k] === undefined) { dist[k] = d + 1; queue.push([nr, nc]); }
    });
  }
  return { dist: dist, farthest: farthest };
}

function _vacLabPickEndpoints(grid, size) {
  var walkable = [];
  for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) if (grid[r][c] === 0) walkable.push([r, c]);
  var best = null;
  for (var t = 0; t < 8; t++) {
    var seed = walkable[Math.floor(Math.random() * walkable.length)];
    var pass1 = _vacLabBFS(grid, size, seed);
    var pass2 = _vacLabBFS(grid, size, pass1.farthest);
    var d = pass2.dist[pass2.farthest[0] + '_' + pass2.farthest[1]];
    if (!best || d > best.d) best = { a: pass1.farthest, b: pass2.farthest, d: d };
  }
  return best;
}

function vacLaberintoStart(size) {
  var grid = _vacLabGenGrid(size);
  var endpoints = _vacLabPickEndpoints(grid, size);
  VacLaberinto.size = size;
  VacLaberinto.grid = grid;
  VacLaberinto.pos = endpoints.a;
  VacLaberinto.target = endpoints.b;
  VacLaberinto.won = false;

  var win = document.getElementById('vac-laberinto-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-laberinto-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Llega hasta ⭐'; }

  go('s-vac-laberinto');
  requestAnimationFrame(function() { _vacLaberintoRender(); });
}

function _vacLaberintoRender() {
  var el = document.getElementById('vac-laberinto-grid');
  if (!el) return;
  var size = VacLaberinto.size;
  el.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';

  var wrapWidth = el.parentElement.clientWidth - 16;
  var fontPx = Math.max(8, Math.min(20, Math.floor((wrapWidth / size) * 0.6)));

  el.innerHTML = '';
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      var cell = document.createElement('div');
      var isBuilding = VacLaberinto.grid[r][c] === 1;
      cell.className = 'mapa-cell' + (isBuilding ? ' building' : '');
      cell.style.fontSize = fontPx + 'px';
      if (isBuilding) cell.textContent = '🧱';
      else if (r === VacLaberinto.pos[0] && c === VacLaberinto.pos[1]) cell.textContent = '🧑';
      else if (r === VacLaberinto.target[0] && c === VacLaberinto.target[1]) cell.textContent = '⭐';
      el.appendChild(cell);
    }
  }
}

function vacLaberintoMove(dr, dc) {
  if (VacLaberinto.won) return;
  var nr = VacLaberinto.pos[0] + dr, nc = VacLaberinto.pos[1] + dc;
  var size = VacLaberinto.size;
  if (nr < 0 || nr >= size || nc < 0 || nc >= size || VacLaberinto.grid[nr][nc] === 1) return;
  VacLaberinto.pos = [nr, nc];
  _vacLaberintoRender();
  if (nr === VacLaberinto.target[0] && nc === VacLaberinto.target[1]) {
    VacLaberinto.won = true;
    var status = document.getElementById('vac-laberinto-status');
    if (status) status.style.display = 'none';
    document.getElementById('vac-laberinto-win').innerHTML = '<div class="sudoku-win-banner">'
      + '<div style="font-size:40px">🏆</div>'
      + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡Llegaste!</div>'
      + '<div style="font-size:12px;color:var(--green);font-weight:700">¡Enhorabuena, encontraste la salida!</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  }
}
