/* =============================================
   VACACIONES-AHORCADO.JS — Ahorcado
   Reutiliza el mismo listado de 100 palabras que la
   Sopa de Letras (SubjectData.sopaPalabras, cargado
   en vacaciones-core.js). La dificultad ajusta cuantos
   fallos se permiten antes de perder.
   ============================================= */

var VAC_AHORCADO_FAILS = { facil: 8, medio: 6, dificil: 4 };
var VAC_AHORCADO_FACES = ['🙂','😐','😟','😯','😰','😱','😵','💀','💀','💀'];

var VacAhorcado = { word:'', guessed:[], fails:0, maxFails:6, won:false };

function vacAhorcadoStart(nivel) {
  var pool = SubjectData.sopaPalabras || ['GATO','PERRO','LIBRO','CASA','SOL'];
  VacAhorcado.word = pool[Math.floor(Math.random() * pool.length)];
  VacAhorcado.guessed = [];
  VacAhorcado.fails = 0;
  VacAhorcado.maxFails = VAC_AHORCADO_FAILS[nivel] || 6;
  VacAhorcado.won = false;

  var win = document.getElementById('vac-ahorcado-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-ahorcado-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Adivina la palabra'; }

  go('s-vac-ahorcado');
  requestAnimationFrame(function() {
    _vacAhorcadoRenderKeys();
    _vacAhorcadoRender();
  });
}

function _vacAhorcadoRenderKeys() {
  var el = document.getElementById('vac-ahorcado-keys');
  if (!el) return;
  el.innerHTML = '';
  'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('').forEach(function(letter) {
    var btn = document.createElement('button');
    btn.textContent = letter;
    btn.style.cssText = 'padding:9px 2px;border-radius:8px;border:none;font-family:var(--f);font-weight:800;font-size:12px;background:white;box-shadow:0 1px 3px rgba(0,0,0,.08);cursor:pointer';
    btn.onclick = function() { _vacAhorcadoGuess(letter, btn); };
    el.appendChild(btn);
  });
}

function _vacAhorcadoGuess(letter, btn) {
  if (VacAhorcado.guessed.indexOf(letter) !== -1 || VacAhorcado.won || VacAhorcado.fails >= VacAhorcado.maxFails) return;
  VacAhorcado.guessed.push(letter);
  btn.disabled = true;
  btn.style.opacity = '.3';
  if (VacAhorcado.word.indexOf(letter) === -1) VacAhorcado.fails++;
  _vacAhorcadoRender();
}

function _vacAhorcadoRender() {
  var display = VacAhorcado.word.split('').map(function(l) {
    return VacAhorcado.guessed.indexOf(l) !== -1 ? l : '_';
  }).join(' ');
  var wordEl = document.getElementById('vac-ahorcado-word');
  if (wordEl) wordEl.textContent = display;

  var faceIdx = Math.min(VAC_AHORCADO_FACES.length - 1, Math.round(VacAhorcado.fails / VacAhorcado.maxFails * (VAC_AHORCADO_FACES.length - 1)));
  var faceEl = document.getElementById('vac-ahorcado-figure');
  if (faceEl) faceEl.textContent = VAC_AHORCADO_FACES[faceIdx];

  var win = document.getElementById('vac-ahorcado-win');
  var status = document.getElementById('vac-ahorcado-status');

  if (display.indexOf('_') === -1) {
    VacAhorcado.won = true;
    if (status) status.style.display = 'none';
    win.innerHTML = '<div class="sudoku-win-banner">'
      + '<div style="font-size:40px">🏆</div>'
      + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡La adivinaste!</div>'
      + '<div style="font-size:12px;color:var(--green);font-weight:700">' + VacAhorcado.word + '</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  } else if (VacAhorcado.fails >= VacAhorcado.maxFails) {
    if (status) status.style.display = 'none';
    win.innerHTML = '<div class="sudoku-win-banner" style="background:var(--red-light);border-color:var(--red)">'
      + '<div style="font-size:40px">💀</div>'
      + '<div style="font-family:var(--f);color:var(--red);font-size:16px;margin:6px 0 2px">Game over</div>'
      + '<div style="font-size:12px;color:var(--red);font-weight:700">Era: ' + VacAhorcado.word + '</div></div>'
      + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
  }
}
