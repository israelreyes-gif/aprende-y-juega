/* =============================================
   VACACIONES-ARKANOID.JS — Arkanoid
   Sin dificultad (nivel fijo). Una sola vida, igual
   que Snake: si se cae la pelota, se acaba la partida
   directamente. Los ladrillos de arriba valen mas
   puntos (estilo clasico).
   ============================================= */

var VAC_ARK_ROWS = 5, VAC_ARK_COLS = 7;
var VAC_ARK_COLORS = ['#EF4444', '#F59E0B', '#EAB308', '#22C55E', '#3B82F6'];
var VAC_ARK_ROW_POINTS = [50, 40, 30, 20, 10]; // fila 0 = arriba = mas puntos

var VacArk = {};

function vacArkanoidStart() {
  var canvas = document.getElementById('vac-arkanoid-canvas');
  if (!canvas) return;
  VacArk.ctx = canvas.getContext('2d');
  VacArk.W = canvas.width; VacArk.H = canvas.height;
  VacArk.brickW = VacArk.W / VAC_ARK_COLS;
  VacArk.brickH = 20; VacArk.brickTop = 30;
  VacArk.paddleW = 70; VacArk.paddleH = 12;

  VacArk.bricks = [];
  for (var r = 0; r < VAC_ARK_ROWS; r++) {
    for (var c = 0; c < VAC_ARK_COLS; c++) {
      VacArk.bricks.push({ r: r, c: c, alive: true });
    }
  }
  VacArk.paddleX = VacArk.W / 2 - VacArk.paddleW / 2;
  VacArk.ball = { x: VacArk.W / 2, y: VacArk.H - 60, vx: 2.6, vy: -3.4, r: 6 };
  VacArk.score = 0;
  VacArk.over = false;
  VacArk.moveLeft = false;
  VacArk.moveRight = false;

  var win = document.getElementById('vac-arkanoid-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-arkanoid-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Puntos: 0'; }

  if (VacArk.timer) clearInterval(VacArk.timer);
  go('s-vac-arkanoid');
  requestAnimationFrame(function() {
    _vacArkDraw();
    VacArk.timer = setInterval(_vacArkTick, 1000 / 60);
    _vacArkBindHold();
  });
}

function _vacArkBindHold() {
  var left = document.getElementById('vac-arkanoid-left');
  var right = document.getElementById('vac-arkanoid-right');
  if (!left || left._bound) return; // evitar enlazar los eventos mas de una vez

  function bind(btn, onDown, onUp) {
    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('touchstart', function(e) { e.preventDefault(); onDown(); });
    btn.addEventListener('mouseup', onUp);
    btn.addEventListener('mouseleave', onUp);
    btn.addEventListener('touchend', onUp);
  }
  bind(left, function() { VacArk.moveLeft = true; }, function() { VacArk.moveLeft = false; });
  bind(right, function() { VacArk.moveRight = true; }, function() { VacArk.moveRight = false; });
  left._bound = true;
}

function _vacArkTick() {
  if (VacArk.over) return;

  if (VacArk.moveLeft) VacArk.paddleX -= 4.5;
  if (VacArk.moveRight) VacArk.paddleX += 4.5;
  VacArk.paddleX = Math.max(0, Math.min(VacArk.W - VacArk.paddleW, VacArk.paddleX));

  var b = VacArk.ball;
  b.x += b.vx; b.y += b.vy;

  if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
  if (b.x + b.r > VacArk.W) { b.x = VacArk.W - b.r; b.vx *= -1; }
  if (b.y - b.r < 0) { b.y = b.r; b.vy *= -1; }

  // colision con la pala
  if (b.y + b.r >= VacArk.H - VacArk.paddleH - 4 && b.y + b.r <= VacArk.H &&
      b.x >= VacArk.paddleX && b.x <= VacArk.paddleX + VacArk.paddleW && b.vy > 0) {
    b.vy *= -1;
    var hitPos = (b.x - (VacArk.paddleX + VacArk.paddleW / 2)) / (VacArk.paddleW / 2);
    b.vx = hitPos * 4;
  }

  // pelota caida: una sola vida, fin de partida directo
  if (b.y - b.r > VacArk.H) {
    _vacArkEnd(false);
    return;
  }

  // colision con ladrillos
  VacArk.bricks.forEach(function(brick) {
    if (!brick.alive) return;
    var bx = brick.c * VacArk.brickW, by = VacArk.brickTop + brick.r * (VacArk.brickH + 4);
    if (b.x + b.r > bx && b.x - b.r < bx + VacArk.brickW && b.y + b.r > by && b.y - b.r < by + VacArk.brickH) {
      brick.alive = false;
      b.vy *= -1;
      VacArk.score += VAC_ARK_ROW_POINTS[brick.r] || 10;
      var status = document.getElementById('vac-arkanoid-status');
      if (status) status.textContent = 'Puntos: ' + VacArk.score;
    }
  });

  var remaining = VacArk.bricks.filter(function(x) { return x.alive; }).length;
  if (remaining === 0) { _vacArkEnd(true); return; }

  _vacArkDraw();
}

function _vacArkDraw() {
  var ctx = VacArk.ctx;
  if (!ctx) return;
  ctx.clearRect(0, 0, VacArk.W, VacArk.H);
  ctx.fillStyle = '#1E1B2E';
  ctx.fillRect(0, 0, VacArk.W, VacArk.H);

  VacArk.bricks.forEach(function(brick) {
    if (!brick.alive) return;
    var bx = brick.c * VacArk.brickW, by = VacArk.brickTop + brick.r * (VacArk.brickH + 4);
    ctx.fillStyle = VAC_ARK_COLORS[brick.r % VAC_ARK_COLORS.length];
    ctx.fillRect(bx + 2, by, VacArk.brickW - 4, VacArk.brickH);
  });

  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(VacArk.paddleX, VacArk.H - VacArk.paddleH - 4, VacArk.paddleW, VacArk.paddleH);

  ctx.beginPath();
  ctx.arc(VacArk.ball.x, VacArk.ball.y, VacArk.ball.r, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
}

function _vacArkEnd(won) {
  VacArk.over = true;
  clearInterval(VacArk.timer);
  var status = document.getElementById('vac-arkanoid-status');
  if (status) status.style.display = 'none';
  var win = document.getElementById('vac-arkanoid-win');
  if (!win) return;

  if (won) {
    win.innerHTML = '<div class="sudoku-win-banner">'
      + '<div style="font-size:40px">🏆</div>'
      + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡Los rompiste todos!</div>'
      + '<div style="font-size:12px;color:var(--green);font-weight:700">Puntuación: ' + VacArk.score + '</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  } else {
    win.innerHTML = '<div class="sudoku-win-banner" style="background:var(--red-light);border-color:var(--red)">'
      + '<div style="font-size:40px">💥</div>'
      + '<div style="font-family:var(--f);color:var(--red);font-size:16px;margin:6px 0 2px">Game over</div>'
      + '<div style="font-size:12px;color:var(--red);font-weight:700">Puntuación: ' + VacArk.score + '</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  }
}
