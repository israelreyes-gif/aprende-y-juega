/* =============================================
   PERFILES.JS — Selección y gestión de perfiles
   ============================================= */

var PERFILES_KEY = 'aprendeyjuega_perfiles';
var PADRES_PIN_KEY = 'aprendeyjuega_padres_pin';
var perfilEditandoId = null;

var SKIN_OPTIONS = ['#F0C27F','#FDDBB4','#D4956A','#C68642','#8D5524'];
var HAIR_OPTIONS = ['#8B4513','#F4C430','#1a1a1a','#E8272B','#7B3F9E','#1E90FF'];
var HAIR_NAMES   = ['Liso corto','Liso largo','Rizado','Trenzas','Cola alta'];

// Estado temporal del modal
var modalAV = { skin: SKIN_OPTIONS[0], hair: HAIR_OPTIONS[0], style: 0 };

/* ---- Storage de perfiles ---- */
function loadPerfiles() {
  try {
    var raw = localStorage.getItem(PERFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function savePerfiles(perfiles) {
  localStorage.setItem(PERFILES_KEY, JSON.stringify(perfiles));
}

function getPerfilActual() {
  try {
    var raw = localStorage.getItem('aprendeyjuega_perfil_activo');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function setPerfilActivo(perfil) {
  localStorage.setItem('aprendeyjuega_perfil_activo', JSON.stringify(perfil));
}

/* ---- Renderizar pantalla de perfiles ---- */
function renderPerfiles() {
  // Estrellas de fondo (solo primera vez)
  var starsEl = document.getElementById('perfiles-stars');
  if (starsEl && starsEl.children.length === 0) {
    for (var i = 0; i < 30; i++) {
      var star = document.createElement('div');
      star.style.cssText = 'position:absolute;border-radius:50%;background:white;' +
        'width:' + (Math.random()*2+1) + 'px;height:' + (Math.random()*2+1) + 'px;' +
        'opacity:' + (Math.random()*0.5+0.1) + ';' +
        'top:' + (Math.random()*100) + '%;left:' + (Math.random()*100) + '%;';
      starsEl.appendChild(star);
    }
  }

  var perfiles = loadPerfiles();
  var grid = document.getElementById('perfiles-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Tarjetas de perfiles existentes
  perfiles.forEach(function(p) {
    var card = document.createElement('div');
    card.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;position:relative';
    card.innerHTML =
      '<div style="width:88px;height:88px;border-radius:50%;border:3px solid transparent;overflow:hidden;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;transition:all .2s" class="perfil-circle" data-id="'+p.id+'">' +
        '<svg data-perfil-avatar="'+p.id+'" width="80" height="80" viewBox="0 0 130 180" xmlns="http://www.w3.org/2000/svg"></svg>' +
      '</div>' +
      '<div style="font-family:var(--f);font-weight:700;font-size:14px;color:rgba(255,255,255,.7);transition:color .2s" class="perfil-name">'+escapeHtml(p.nombre)+'</div>';

    // Hover
    var circle = card.querySelector('.perfil-circle');
    var nameEl  = card.querySelector('.perfil-name');
    card.addEventListener('mouseenter', function() {
      circle.style.borderColor = '#FF6B9D';
      circle.style.boxShadow   = '0 0 20px rgba(255,107,157,.4)';
      nameEl.style.color = '#fff';
    });
    card.addEventListener('mouseleave', function() {
      circle.style.borderColor = 'transparent';
      circle.style.boxShadow   = 'none';
      nameEl.style.color = 'rgba(255,255,255,.7)';
    });

    // Click → seleccionar perfil
    card.addEventListener('click', function() { seleccionarPerfil(p); });

    // Botón editar (puntito)
    var editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.style.cssText = 'position:absolute;top:0;right:-4px;width:24px;height:24px;border-radius:50%;background:#7C3AED;border:2px solid white;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0';
    editBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      abrirModalEditar(p);
    });
    card.appendChild(editBtn);
    grid.appendChild(card);

    // Dibujar avatar
    var svgEl = card.querySelector('[data-perfil-avatar="'+p.id+'"]');
    if (svgEl) drawAvatarSVG(svgEl, p.skin, p.hair, p.hairStyle, null, []);
  });

  // Tarjeta "Añadir perfil" (máx 5)
  if (perfiles.length < 5) {
    var addCard = document.createElement('div');
    addCard.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer';
    addCard.innerHTML =
      '<div style="width:88px;height:88px;border-radius:50%;border:3px dashed rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;transition:all .2s;background:rgba(255,255,255,.03)" class="add-circle">'+
        '<span style="font-size:28px;color:rgba(255,255,255,.3);transition:color .2s" class="add-plus">+</span>'+
      '</div>'+
      '<div style="font-family:var(--f);font-weight:700;font-size:14px;color:rgba(255,255,255,.35);transition:color .2s" class="add-label">Añadir perfil</div>';
    var addCircle = addCard.querySelector('.add-circle');
    var addPlus   = addCard.querySelector('.add-plus');
    var addLabel  = addCard.querySelector('.add-label');
    addCard.addEventListener('mouseenter', function() {
      addCircle.style.borderColor = 'rgba(255,255,255,.7)';
      addCircle.style.background  = 'rgba(255,255,255,.08)';
      addPlus.style.color  = '#fff';
      addLabel.style.color = '#fff';
    });
    addCard.addEventListener('mouseleave', function() {
      addCircle.style.borderColor = 'rgba(255,255,255,.25)';
      addCircle.style.background  = 'rgba(255,255,255,.03)';
      addPlus.style.color  = 'rgba(255,255,255,.3)';
      addLabel.style.color = 'rgba(255,255,255,.35)';
    });
    addCard.addEventListener('click', function() { abrirModalNuevo(); });
    grid.appendChild(addCard);
  }
}

/* ---- Seleccionar perfil ---- */
function seleccionarPerfil(perfil) {
  setPerfilActivo(perfil);
  // Cargar avatar del perfil seleccionado
  AV = { skin: perfil.skin, hair: perfil.hair, hairStyle: perfil.hairStyle, acc: 0, unlocked: perfil.unlocked || [] };
  saveAvatar(AV);
  // Cargar nombre
  setNombre(perfil.nombre);
  // Ir a cursos
  setCurso(3);
  checkDayReset();
  updateHomeUI();
  updateStreakUI();
  updateMedalUI();
  updateSubjectUI('mates');
  updateSubjectUI('lengua');
  refreshAllAvatars();
  go('s-cursos');
}

/* ---- Modal nuevo perfil ---- */
function abrirModalNuevo() {
  perfilEditandoId = null;
  modalAV = { skin: SKIN_OPTIONS[0], hair: HAIR_OPTIONS[0], style: 0 };
  document.getElementById('modal-perfil-titulo').textContent = 'Nuevo perfil ✨';
  document.getElementById('modal-nombre').value = '';
  abrirModal();
}

function abrirModalEditar(perfil) {
  perfilEditandoId = perfil.id;
  modalAV = { skin: perfil.skin, hair: perfil.hair, style: perfil.hairStyle };
  document.getElementById('modal-perfil-titulo').textContent = 'Editar perfil ✏️';
  document.getElementById('modal-nombre').value = perfil.nombre;
  abrirModal();
}

function abrirModal() {
  renderModalOpciones();
  renderModalPreview();
  var modal = document.getElementById('modal-perfil');
  modal.style.display = 'flex';
}

function cerrarModalPerfil() {
  document.getElementById('modal-perfil').style.display = 'none';
}

function renderModalOpciones() {
  // Piel
  var skinRow = document.getElementById('modal-skin-row');
  skinRow.innerHTML = '';
  SKIN_OPTIONS.forEach(function(c) {
    var btn = document.createElement('button');
    btn.style.cssText = 'width:28px;height:28px;border-radius:50%;background:'+c+';border:none;cursor:pointer;outline:'+(modalAV.skin===c?'2.5px solid #FF6B9D':'2px solid transparent')+';outline-offset:2px;transition:outline .1s';
    btn.addEventListener('click', function() { modalAV.skin = c; renderModalOpciones(); renderModalPreview(); });
    skinRow.appendChild(btn);
  });

  // Pelo
  var hairRow = document.getElementById('modal-hair-row');
  hairRow.innerHTML = '';
  HAIR_OPTIONS.forEach(function(c) {
    var btn = document.createElement('button');
    btn.style.cssText = 'width:28px;height:28px;border-radius:50%;background:'+c+';border:none;cursor:pointer;outline:'+(modalAV.hair===c?'2.5px solid #FF6B9D':'2px solid transparent')+';outline-offset:2px;transition:outline .1s';
    btn.addEventListener('click', function() { modalAV.hair = c; renderModalOpciones(); renderModalPreview(); });
    hairRow.appendChild(btn);
  });

  // Peinado
  var styleRow = document.getElementById('modal-style-row');
  styleRow.innerHTML = '';
  HAIR_NAMES.forEach(function(n, i) {
    var btn = document.createElement('button');
    btn.textContent = n;
    btn.style.cssText = 'padding:5px 11px;border-radius:20px;border:none;cursor:pointer;font-family:var(--f);font-weight:700;font-size:11px;transition:all .15s;background:'+(modalAV.style===i?'#FF6B9D':'rgba(255,255,255,.1)')+';color:'+(modalAV.style===i?'#fff':'rgba(255,255,255,.55)')+'';
    btn.addEventListener('click', function() { modalAV.style = i; renderModalOpciones(); renderModalPreview(); });
    styleRow.appendChild(btn);
  });
}

function renderModalPreview() {
  var svgEl = document.getElementById('modal-avatar-svg');
  if (svgEl) drawAvatarSVG(svgEl, modalAV.skin, modalAV.hair, modalAV.style, null, []);
}

function guardarPerfil() {
  var nombre = document.getElementById('modal-nombre').value.trim();
  if (nombre.length < 2) {
    document.getElementById('modal-nombre').style.borderColor = '#FF6B9D';
    return;
  }
  var perfiles = loadPerfiles();
  if (perfilEditandoId) {
    // Editar existente
    perfiles = perfiles.map(function(p) {
      if (p.id === perfilEditandoId) {
        return { id: p.id, nombre: nombre, skin: modalAV.skin, hair: modalAV.hair, hairStyle: modalAV.style, unlocked: p.unlocked || [] };
      }
      return p;
    });
  } else {
    // Crear nuevo
    perfiles.push({ id: Date.now(), nombre: nombre, skin: modalAV.skin, hair: modalAV.hair, hairStyle: modalAV.style, unlocked: [] });
  }
  savePerfiles(perfiles);
  cerrarModalPerfil();
  renderPerfiles();
}

/* ---- Zona de padres desde perfiles ---- */
function abrirZonaPadresDesdePerfiles() {
  var pin = localStorage.getItem(PADRES_PIN_KEY);
  if (!pin) {
    // Sin PIN configurado → entrar directamente y dejar configurarlo
    irAPadres();
    return;
  }
  document.getElementById('padres-pin-input').value = '';
  document.getElementById('padres-pin-error').style.display = 'none';
  document.getElementById('modal-padres-pin').style.display = 'flex';
}

function cerrarModalPin() {
  document.getElementById('modal-padres-pin').style.display = 'none';
}

function verificarPinPadres() {
  var pin = localStorage.getItem(PADRES_PIN_KEY);
  var input = document.getElementById('padres-pin-input').value;
  if (!pin || input === pin) {
    cerrarModalPin();
    irAPadres();
  } else {
    document.getElementById('padres-pin-error').style.display = 'block';
    document.getElementById('padres-pin-input').value = '';
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
