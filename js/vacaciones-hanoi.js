/* =============================================
   VACACIONES-HANOI.JS — Torres de Hanoi
   La dificultad ajusta el numero de discos.
   ============================================= */

var VAC_HANOI_COLORS = ['#EF4444','#F59E0B','#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899'];

var VacHanoi = { n: 3, towers: null, selected: null, moves: 0, won: false };

function vacHanoiStart(n) {
  VacHanoi.n = n;
  VacHanoi.towers = [[], [], []];
  for (var i = n; i >= 1; i--) VacHanoi.towers[0].push(i);
  VacHanoi.selected = null;
  VacHanoi.moves = 0;
  VacHanoi.won = false;

  var win = document.getElementById('vac-hanoi-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-hanoi-status');
  var minMoves = Math.pow(2, n) - 1;
  if (status) { status.style.display = 'block'; status.textContent = 'Mueve todos los discos a la torre de la derecha (mínimo ' + minMoves + ' movimientos)'; }

  go('s-vac-hanoi');
  requestAnimationFrame(function() { _vacHanoiRender(); });
}

function _vacHanoiRender() {
  var el = document.getElementById('vac-hanoi-towers');
  if (!el) return;
  el.innerHTML = '';
  VacHanoi.towers.forEach(function(tower, ti) {
    var col = document.createElement('div');
    col.style.cssText = 'flex:1;display:flex;flex-direction:column-reverse;align-items:center;height:100%;cursor:pointer;position:relative;border-bottom:4px solid var(--gray-400);border-radius:2px;'
      + (ti === VacHanoi.selected ? 'background:rgba(124,58,237,.1)' : '');
    col.onclick = function() { _vacHanoiClick(ti); };
    tower.forEach(function(disk) {
      var d = document.createElement('div');
      var widthPct = 28 + disk * (65 / VacHanoi.n);
      d.style.cssText = 'height:16px;border-radius:4px;margin-bottom:2px;width:' + widthPct + '%;background:' + VAC_HANOI_COLORS[(disk - 1) % VAC_HANOI_COLORS.length];
      col.appendChild(d);
    });
    el.appendChild(col);
  });
}

function _vacHanoiClick(ti) {
  if (VacHanoi.won) return;
  if (VacHanoi.selected === null) {
    if (VacHanoi.towers[ti].length) VacHanoi.selected = ti;
  } else {
    var from = VacHanoi.selected;
    var disk = VacHanoi.towers[from][VacHanoi.towers[from].length - 1];
    var target = VacHanoi.towers[ti];

    if (from === ti) {
      VacHanoi.selected = null;
    } else if (!target.length || target[target.length - 1] > disk) {
      VacHanoi.towers[from].pop();
      VacHanoi.towers[ti].push(disk);
      VacHanoi.moves++;
      VacHanoi.selected = null;

      if (VacHanoi.towers[2].length === VacHanoi.n) {
        VacHanoi.won = true;
        var status = document.getElementById('vac-hanoi-status');
        if (status) status.style.display = 'none';
        var perfect = VacHanoi.moves === Math.pow(2, VacHanoi.n) - 1;
        document.getElementById('vac-hanoi-win').innerHTML = '<div class="sudoku-win-banner">'
          + '<div style="font-size:40px">' + (perfect ? '🌟' : '🏆') + '</div>'
          + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡Lo lograste!</div>'
          + '<div style="font-size:12px;color:var(--green);font-weight:700">' + VacHanoi.moves + ' movimientos' + (perfect ? ' — ¡el mínimo posible!' : '') + '</div></div>'
          + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
      }
    } else {
      VacHanoi.selected = null;
    }
  }
  _vacHanoiRender();
}
