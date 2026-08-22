/* =============================================
   VACACIONES-SNAKE.JS — Minijuego "Snake"
   Movimiento con botones direccionales (no arrastre),
   consistente con el estilo tactil del resto de la app.
   Una unica partida por sesion, boton de atras a home.
   ============================================= */

var VAC_SNAKE_SPEEDS = { facil: 220, medio: 150, dificil: 95 };
var VacSnake = {};

function vacSnakeStart(nivel) {
  var canvas = document.getElementById('vac-snake-canvas');
  if (!canvas) return;
  VacSnake.ctx = canvas.getContext('2d');
  VacSnake.cell = 15; VacSnake.cols = 20; VacSnake.rows = 20;
  VacSnake.snake = [[10,10],[9,10],[8,10]];
  VacSnake.dir = [1,0]; VacSnake.nextDir = [1,0];
  VacSnake.food = _vacSnakeRandFood();
  VacSnake.over = false; VacSnake.score = 0;
  VacSnake.speed = VAC_SNAKE_SPEEDS[nivel] || VAC_SNAKE_SPEEDS.medio;

  var win = document.getElementById('vac-snake-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-snake-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Puntos: 0'; }

  if (VacSnake.timer) clearInterval(VacSnake.timer);
  go('s-vac-snake');
  requestAnimationFrame(function() {
    _vacSnakeDraw();
    VacSnake.timer = setInterval(_vacSnakeTick, VacSnake.speed);
  });
}

function _vacSnakeRandFood() {
  return [Math.floor(Math.random() * VacSnake.cols), Math.floor(Math.random() * VacSnake.rows)];
}

function vacSnakeDir(dx, dy) {
  if (VacSnake.dir[0] === -dx && VacSnake.dir[1] === -dy) return; // no ir hacia atras
  VacSnake.nextDir = [dx, dy];
}

function _vacSnakeTick() {
  if (VacSnake.over) return;
  VacSnake.dir = VacSnake.nextDir;
  var head = VacSnake.snake[0];
  var nh = [head[0] + VacSnake.dir[0], head[1] + VacSnake.dir[1]];
  var hitSelf = VacSnake.snake.some(function(s) { return s[0] === nh[0] && s[1] === nh[1]; });

  if (nh[0] < 0 || nh[0] >= VacSnake.cols || nh[1] < 0 || nh[1] >= VacSnake.rows || hitSelf) {
    VacSnake.over = true;
    clearInterval(VacSnake.timer);
    var status = document.getElementById('vac-snake-status');
    if (status) status.style.display = 'none';
    document.getElementById('vac-snake-win').innerHTML = '<div class="sudoku-win-banner" style="background:var(--red-light);border-color:var(--red)">'
      + '<div style="font-size:40px">💥</div>'
      + '<div style="font-family:var(--f);color:var(--red);font-size:16px;margin:6px 0 2px">Game over</div>'
      + '<div style="font-size:12px;color:var(--red);font-weight:700">Puntuación: ' + VacSnake.score + '</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
    return;
  }

  VacSnake.snake.unshift(nh);
  if (nh[0] === VacSnake.food[0] && nh[1] === VacSnake.food[1]) {
    VacSnake.score++;
    var status2 = document.getElementById('vac-snake-status');
    if (status2) status2.textContent = 'Puntos: ' + VacSnake.score;
    VacSnake.food = _vacSnakeRandFood();
  } else {
    VacSnake.snake.pop();
  }
  _vacSnakeDraw();
}

function _vacSnakeDraw() {
  var ctx = VacSnake.ctx, cs = VacSnake.cell;
  if (!ctx) return;
  ctx.clearRect(0, 0, 300, 300);
  ctx.fillStyle = '#E63946';
  ctx.fillRect(VacSnake.food[0] * cs, VacSnake.food[1] * cs, cs, cs);
  VacSnake.snake.forEach(function(s, i) {
    ctx.fillStyle = i === 0 ? '#166534' : '#22C55E';
    ctx.fillRect(s[0] * cs + 1, s[1] * cs + 1, cs - 2, cs - 2);
  });
}
