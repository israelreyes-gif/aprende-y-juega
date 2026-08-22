/* =============================================
   VACACIONES-SIMON.JS — Simón dice
   Sin dificultad (la dificultad crece sola con cada
   ronda). Se entra directamente desde "Elige un juego".
   ============================================= */

var VacSimon = { seq: [], playerIdx: 0, playing: false };

function vacSimonStart() {
  VacSimon.seq = [];
  VacSimon.playerIdx = 0;
  VacSimon.playing = false;

  var win = document.getElementById('vac-simon-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-simon-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Pulsa "Empezar ronda"'; }
  var startBtn = document.getElementById('vac-simon-start-btn');
  if (startBtn) startBtn.style.display = 'block';

  go('s-vac-simon');
}

function vacSimonNextRound() {
  VacSimon.seq.push(Math.floor(Math.random() * 4));
  VacSimon.playerIdx = 0;
  VacSimon.playing = false;
  document.getElementById('vac-simon-win').innerHTML = '';

  var status = document.getElementById('vac-simon-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Ronda ' + VacSimon.seq.length + ' — mira bien...'; }

  var i = 0;
  var timer = setInterval(function() {
    if (i > 0) document.getElementById('vac-simon-' + VacSimon.seq[i - 1]).classList.remove('lit');
    if (i >= VacSimon.seq.length) {
      clearInterval(timer);
      VacSimon.playing = true;
      if (status) status.textContent = 'Ronda ' + VacSimon.seq.length + ' — ¡tu turno!';
      return;
    }
    document.getElementById('vac-simon-' + VacSimon.seq[i]).classList.add('lit');
    i++;
  }, 600);
}

function vacSimonPress(idx) {
  if (!VacSimon.playing) return;
  var btn = document.getElementById('vac-simon-' + idx);
  btn.classList.add('lit');
  setTimeout(function() { btn.classList.remove('lit'); }, 200);

  if (VacSimon.seq[VacSimon.playerIdx] !== idx) {
    VacSimon.playing = false;
    var status = document.getElementById('vac-simon-status');
    if (status) status.style.display = 'none';
    var startBtn = document.getElementById('vac-simon-start-btn');
    if (startBtn) startBtn.style.display = 'none';
    document.getElementById('vac-simon-win').innerHTML = '<div class="sudoku-win-banner" style="background:var(--red-light);border-color:var(--red)">'
      + '<div style="font-size:40px">😅</div>'
      + '<div style="font-family:var(--f);color:var(--red);font-size:16px;margin:6px 0 2px">¡Fallaste!</div>'
      + '<div style="font-size:12px;color:var(--red);font-weight:700">Llegaste a la ronda ' + VacSimon.seq.length + '</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
    return;
  }

  VacSimon.playerIdx++;
  if (VacSimon.playerIdx === VacSimon.seq.length) {
    VacSimon.playing = false;
    setTimeout(vacSimonNextRound, 700);
  }
}
