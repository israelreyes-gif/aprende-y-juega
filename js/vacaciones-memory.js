/* =============================================
   VACACIONES-MEMORY.JS — Minijuego "Memory"
   desbloqueable con CONFIG.vacaciones.umbralJuegos
   aciertos o mas (ver vacaciones-sudoku.js para el
   detalle del desbloqueo). Una unica partida por
   sesion: el boton de atras va directo a la home de
   Vacaciones, no permite reelegir juego/nivel.
   ============================================= */

var VAC_MEMORY_ICONS = ['🐶','🐱','🐰','🦊','🐼','🐸','🐵','🦁','🐷','🐨','🐯','🐮','🐔','🐧','🦄'];

var VacMemory = { cards:[], flipped:[], matched:{}, busy:false, cols:4 };

function vacMemoryStart(pairs) {
  var icons = VAC_MEMORY_ICONS.slice(0, pairs);
  var deck = icons.concat(icons);
  for (var i = deck.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = deck[i]; deck[i] = deck[j]; deck[j] = t;
  }
  VacMemory.cards = deck;
  VacMemory.flipped = [];
  VacMemory.matched = {};
  VacMemory.busy = false;
  VacMemory.cols = deck.length <= 12 ? 4 : (deck.length <= 20 ? 5 : 6);

  var win = document.getElementById('vac-memory-win');
  if (win) win.innerHTML = '';
  var status = document.getElementById('vac-memory-status');
  if (status) { status.style.display = 'block'; status.textContent = 'Encuentra las ' + pairs + ' parejas'; }

  go('s-vac-memory');
  requestAnimationFrame(function() { _vacMemoryRender(); });
}

function _vacMemoryRender() {
  var el = document.getElementById('vac-memory-grid');
  if (!el) return;
  el.style.gridTemplateColumns = 'repeat(' + VacMemory.cols + ', 1fr)';
  el.innerHTML = '';
  VacMemory.cards.forEach(function(icon, i) {
    var card = document.createElement('div');
    var isUp = VacMemory.flipped.indexOf(i) !== -1 || VacMemory.matched[i];
    card.style.cssText = 'aspect-ratio:1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;background:' + (isUp ? 'white' : 'var(--purple-light)') + ';box-shadow:0 1px 4px rgba(0,0,0,.08)';
    card.textContent = isUp ? icon : '❓';
    card.onclick = function() { _vacMemoryFlip(i); };
    el.appendChild(card);
  });
}

function _vacMemoryFlip(i) {
  if (VacMemory.busy || VacMemory.matched[i] || VacMemory.flipped.indexOf(i) !== -1 || VacMemory.flipped.length >= 2) return;
  VacMemory.flipped.push(i);
  _vacMemoryRender();
  if (VacMemory.flipped.length === 2) {
    VacMemory.busy = true;
    var a = VacMemory.flipped[0], b = VacMemory.flipped[1];
    setTimeout(function() {
      if (VacMemory.cards[a] === VacMemory.cards[b]) { VacMemory.matched[a] = true; VacMemory.matched[b] = true; }
      VacMemory.flipped = [];
      VacMemory.busy = false;
      _vacMemoryRender();
      if (Object.keys(VacMemory.matched).length === VacMemory.cards.length) {
        var status = document.getElementById('vac-memory-status');
        if (status) status.style.display = 'none';
        document.getElementById('vac-memory-win').innerHTML = '<div class="sudoku-win-banner">'
          + '<div style="font-size:40px">🏆</div>'
          + '<div style="font-family:var(--f);color:#166534;font-size:16px;margin:6px 0 2px">¡Las encontraste todas!</div>'
          + '<div style="font-size:12px;color:var(--green);font-weight:700">¡Enhorabuena!</div></div>'
          + '<button class="next-btn" style="background:var(--purple);color:white;border:none;margin-top:14px" onclick="go(\'s-vacaciones\')">Volver al inicio de Vacaciones</button>';
      }
    }, 700);
  }
}
