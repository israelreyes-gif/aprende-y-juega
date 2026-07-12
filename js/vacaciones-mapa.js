/* =============================================
   VACACIONES-MAPA.JS — Minijuego "City Map"
   desbloqueable al terminar una sesion de Vacaciones
   con CONFIG.vacaciones.umbralJuegos aciertos o mas
   (mismo desbloqueo que Sudoku/Sopa de letras).

   Alex sigue instrucciones en ingles (Go ahead / Go
   back / Turn left / Turn right) para mover un
   personaje por una ciudad hasta un destino marcado.

   Cada partida genera una ciudad nueva, garantizando
   que existe un camino entre el inicio y el destino,
   y calcula cual es el numero minimo de instrucciones
   necesario (contando giros y avances) para llegar.

   Una unica partida por sesion: la pantalla del juego
   tiene un boton de atras, pero va directo a la home
   de Vacaciones (s-vacaciones) — nunca a elegir otro
   juego o nivel, para no permitir repetir el intento.
   ============================================= */

var VAC_MAPA_BUILDING_ICONS = ['🏫','🏥','🏪','🏛️','🌳','🏦','⛪','🏟️'];
/* direcciones: 0=arriba, 1=derecha, 2=abajo, 3=izquierda */
var VAC_MAPA_DIR_VECT = [[-1,0],[0,1],[1,0],[0,-1]];

var VacMapa = {
  size: 0, buildings: null, icons: null,
  pos: null, dir: 0, target: null,
  moves: 0, shortest: 0, won: false
};

/* ---- Generar una ciudad con edificios al azar ---- */
function _vacMapaGenBuildings(size) {
  var buildings = [], icons = {};
  for (var r = 0; r < size; r++) buildings.push(new Array(size).fill(0));

  var attempts = Math.round(size * size * 0.16);
  for (var i = 0; i < attempts; i++) {
    var w = Math.random() < 0.6 ? 1 : 2;
    var h = Math.random() < 0.6 ? 1 : 2;
    var r0 = Math.floor(Math.random() * (size - h + 1));
    var c0 = Math.floor(Math.random() * (size - w + 1));
    var icon = VAC_MAPA_BUILDING_ICONS[Math.floor(Math.random() * VAC_MAPA_BUILDING_ICONS.length)];
    for (var rr = r0; rr < r0 + h; rr++) {
      for (var cc = c0; cc < c0 + w; cc++) {
        buildings[rr][cc] = 1;
        icons[rr + '_' + cc] = icon;
      }
    }
  }
  return { buildings: buildings, icons: icons };
}

/* ---- BFS simple (solo posicion, sin direccion) para: encontrar la
   componente conexa mas grande y, dentro de ella, dos puntos alejados
   entre si (tecnica del "doble BFS" para aproximar el diametro). ---- */
function _vacMapaBFS(buildings, size, start) {
  var dist = {};
  var key0 = start[0] + '_' + start[1];
  dist[key0] = 0;
  var queue = [start];
  var farthest = start;
  while (queue.length) {
    var cur = queue.shift();
    var d = dist[cur[0] + '_' + cur[1]];
    if (d > dist[farthest[0] + '_' + farthest[1]]) farthest = cur;
    for (var k = 0; k < 4; k++) {
      var nr = cur[0] + VAC_MAPA_DIR_VECT[k][0], nc = cur[1] + VAC_MAPA_DIR_VECT[k][1];
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      if (buildings[nr][nc] === 1) continue;
      var nk = nr + '_' + nc;
      if (dist[nk] !== undefined) continue;
      dist[nk] = d + 1;
      queue.push([nr, nc]);
    }
  }
  return { dist: dist, farthest: farthest };
}

function _vacMapaAllWalkable(buildings, size) {
  var cells = [];
  for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) if (buildings[r][c] === 0) cells.push([r, c]);
  return cells;
}

/* ---- Elegir inicio y destino garantizando que hay camino entre ellos
   y que estan lo mas alejados posible. El "doble BFS" (ir al punto mas
   lejano y luego al mas lejano de ese) es una tecnica habitual para
   aproximar el diametro de un grafo, pero en mapas muy abiertos (con
   pocos edificios) puede fallar y dar puntos casi pegados — por eso se
   repite con varias semillas al azar y se queda con la mejor. ---- */
function _vacMapaPickEndpoints(buildings, size) {
  var walkable = _vacMapaAllWalkable(buildings, size);
  var best = null;

  var tries = 8;
  for (var t = 0; t < tries; t++) {
    var seed = walkable[Math.floor(Math.random() * walkable.length)];
    var pass1 = _vacMapaBFS(buildings, size, seed);
    var pass2 = _vacMapaBFS(buildings, size, pass1.farthest);
    var d = pass2.dist[pass2.farthest[0] + '_' + pass2.farthest[1]];
    if (!best || d > best.d) {
      best = { start: pass1.farthest, target: pass2.farthest, dist: pass2.dist, d: d };
    }
  }
  return best;
}

/* ---- BFS por estados (fila, columna, direccion) para calcular el
   numero minimo de instrucciones (giros + avances) hasta el destino ---- */
function _vacMapaShortestInstructions(buildings, size, start, startDir, target) {
  var startKey = start[0] + '_' + start[1] + '_' + startDir;
  var dist = {};
  dist[startKey] = 0;
  var queue = [[start[0], start[1], startDir]];
  while (queue.length) {
    var cur = queue.shift();
    var r = cur[0], c = cur[1], dir = cur[2];
    var d = dist[r + '_' + c + '_' + dir];
    if (r === target[0] && c === target[1]) return d;

    // Turn left / turn right (misma posicion, cambia direccion)
    var left = (dir + 3) % 4, right = (dir + 1) % 4;
    [left, right].forEach(function(nd) {
      var nk = r + '_' + c + '_' + nd;
      if (dist[nk] === undefined) { dist[nk] = d + 1; queue.push([r, c, nd]); }
    });

    // Go ahead / go back (misma direccion, cambia posicion)
    [1, -1].forEach(function(sign) {
      var nr = r + VAC_MAPA_DIR_VECT[dir][0] * sign;
      var nc = c + VAC_MAPA_DIR_VECT[dir][1] * sign;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) return;
      if (buildings[nr][nc] === 1) return;
      var nk2 = nr + '_' + nc + '_' + dir;
      if (dist[nk2] === undefined) { dist[nk2] = d + 1; queue.push([nr, nc, dir]); }
    });
  }
  return null; // no debería pasar: start y target siempre estan conectados
}

/* ---- Empezar una partida (llamado desde s-vac-nivel-mapa) ---- */
function vacMapaStart(size) {
  var gen = _vacMapaGenBuildings(size);
  var endpoints = _vacMapaPickEndpoints(gen.buildings, size);
  var startDir = Math.floor(Math.random() * 4);

  VacMapa.size = size;
  VacMapa.buildings = gen.buildings;
  VacMapa.icons = gen.icons;
  VacMapa.pos = endpoints.start;
  VacMapa.target = endpoints.target;
  VacMapa.dir = startDir;
  VacMapa.moves = 0;
  VacMapa.won = false;
  VacMapa.shortest = _vacMapaShortestInstructions(gen.buildings, size, endpoints.start, startDir, endpoints.target);

  var win = document.getElementById('vac-mapa-win');
  if (win) win.style.display = 'none';
  var blocked = document.getElementById('vac-mapa-blocked');
  if (blocked) blocked.style.display = 'none';
  var status = document.getElementById('vac-mapa-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Sigue las instrucciones en inglés para llegar hasta ⭐ — intenta hacerlo por el camino más corto'; }

  go('s-vac-mapa');
  requestAnimationFrame(function() { _vacMapaRender(); });
}

function _vacMapaRender() {
  var el = document.getElementById('vac-mapa-grid');
  if (!el) return;
  var size = VacMapa.size;
  el.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';

  var wrapWidth = el.parentElement.clientWidth - 16;
  var cellPx = Math.floor(wrapWidth / size);
  var fontPx = Math.max(8, Math.min(22, Math.floor(cellPx * 0.65)));

  el.innerHTML = '';
  for (var r = 0; r < size; r++) {
    for (var c = 0; c < size; c++) {
      var cell = document.createElement('div');
      var isBuilding = VacMapa.buildings[r][c] === 1;
      cell.className = 'mapa-cell' + (isBuilding ? ' building' : '');
      cell.style.fontSize = fontPx + 'px';

      if (isBuilding) {
        cell.textContent = VacMapa.icons[r + '_' + c] || '🏢';
      } else if (r === VacMapa.target[0] && c === VacMapa.target[1] && !(r === VacMapa.pos[0] && c === VacMapa.pos[1])) {
        cell.textContent = '⭐';
      }
      if (r === VacMapa.pos[0] && c === VacMapa.pos[1]) {
        var deg = VacMapa.dir * 90;
        cell.innerHTML = '<span class="mapa-char" style="transform:rotate(' + deg + 'deg)">🧑</span>'
          + (r === VacMapa.target[0] && c === VacMapa.target[1]
              ? '<span style="position:absolute;top:0;right:0;font-size:' + Math.max(7, fontPx - 4) + 'px">⭐</span>'
              : '');
      }
      el.appendChild(cell);
    }
  }
}

function _vacMapaShowBlocked() {
  var m = document.getElementById('vac-mapa-blocked');
  if (!m) return;
  m.style.display = 'block';
  setTimeout(function() { m.style.display = 'none'; }, 1200);
}

function vacMapaMove(kind) {
  if (VacMapa.won) return;
  var sign = kind === 'ahead' ? 1 : -1;
  var v = VAC_MAPA_DIR_VECT[VacMapa.dir];
  var nr = VacMapa.pos[0] + v[0] * sign, nc = VacMapa.pos[1] + v[1] * sign;
  var size = VacMapa.size;
  if (nr < 0 || nr >= size || nc < 0 || nc >= size || VacMapa.buildings[nr][nc] === 1) {
    _vacMapaShowBlocked();
    return;
  }
  VacMapa.pos = [nr, nc];
  VacMapa.moves++;
  _vacMapaRender();
  _vacMapaCheckWin();
}

function vacMapaTurn(side) {
  if (VacMapa.won) return;
  VacMapa.dir = (VacMapa.dir + (side === 'right' ? 1 : 3)) % 4;
  VacMapa.moves++;
  _vacMapaRender();
}

function _vacMapaCheckWin() {
  if (VacMapa.pos[0] !== VacMapa.target[0] || VacMapa.pos[1] !== VacMapa.target[1]) return;
  VacMapa.won = true;

  var status = document.getElementById('vac-mapa-status');
  if (status) status.style.display = 'none';
  var win = document.getElementById('vac-mapa-win');
  if (!win) return;

  var perfect = VacMapa.moves === VacMapa.shortest;
  win.style.display = 'block';
  if (perfect) {
    win.innerHTML = '<div class="sudoku-win-banner">'
      + '<div style="font-size:40px">🌟</div>'
      + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">You made it — the shortest way!</div>'
      + '<div style="font-size:12px;color:var(--green);font-weight:700">¡Llegaste en ' + VacMapa.moves + ' instrucciones, el camino más corto posible!</div>'
      + '</div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  } else {
    win.innerHTML = '<div class="sudoku-win-banner">'
      + '<div style="font-size:40px">🏆</div>'
      + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">You made it!</div>'
      + '<div style="font-size:12px;color:var(--green);font-weight:700">¡Enhorabuena, llegaste al destino! Lo hiciste en ' + VacMapa.moves + ' instrucciones (el camino más corto era ' + VacMapa.shortest + ').</div>'
      + '</div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  }
}
