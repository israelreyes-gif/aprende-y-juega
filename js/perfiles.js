/* =============================================
   PERFILES.JS — Selección y gestión de perfiles
   Usa Cloudflare D1 como fuente única de datos
   ============================================= */

var PERFILES_KEY  = 'aprendeyjuega_perfiles';
var PADRES_PIN_KEY = 'aprendeyjuega_padres_pin';
var perfilEditandoId = null;
var HAIR_NAMES = ['Liso corto','Liso largo','Rizado','Trenzas','Cola alta'];
var modalAV = { skin: 0, hairColor: 1, hair: 0 };

/* ---- Storage local de perfiles ---- */
function loadPerfilesLocal() { return []; }
function savePerfilesLocal(p) { }
function setPerfilActivo(p)   { }

function perfilToAV(p) {
  return { skin: p.skin, hairColor: p.hair_color !== undefined ? p.hair_color : p.hairColor, hair: p.hair, acc: 0, unlocked: p.unlocked || [] };
}

/* ---- Cargar perfiles desde la nube ---- */
function cargarPerfiles(callback) {
  fetch(API_URL + '/perfiles')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      // Normalizar campo hair_color → hairColor
      var perfiles = data.map(function(p) {
        return {
          id:        p.id,
          nombre:    p.nombre,
          skin:      p.skin,
          hairColor: p.hair_color,
          hair:      p.hair,
          unlocked:  typeof p.unlocked === 'string' ? JSON.parse(p.unlocked) : (p.unlocked || [])
        };
      });
      if (callback) callback(perfiles);
    })
    .catch(function(e) {
      showError('los perfiles', e, function(){ renderPerfiles(); }, 's-perfiles');
      if (callback) callback([]);
    });
}

/* ---- Renderizar pantalla ---- */
function renderPerfiles() {
  var starsEl = document.getElementById('perfiles-stars');
  if (starsEl && starsEl.children.length === 0) {
    for (var i = 0; i < 30; i++) {
      var star = document.createElement('div');
      star.style.cssText = 'position:absolute;border-radius:50%;background:white;width:'+(Math.random()*2+1)+'px;height:'+(Math.random()*2+1)+'px;opacity:'+(Math.random()*0.5+0.1)+';top:'+(Math.random()*100)+'%;left:'+(Math.random()*100)+'%;';
      starsEl.appendChild(star);
    }
  }
  cargarPerfiles(function(perfiles) { pintarPerfiles(perfiles); });
}

function pintarPerfiles(perfiles) {
  var grid = document.getElementById('perfiles-grid');
  if (!grid) return;
  grid.innerHTML = '';

  perfiles.forEach(function(p) {
    var card = document.createElement('div');
    card.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer;position:relative';
    card.innerHTML =
      '<div style="width:88px;height:88px;border-radius:50%;border:3px solid transparent;overflow:hidden;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;transition:all .2s" class="perfil-circle">' +
        '<svg data-perfil-avatar="'+p.id+'" width="80" height="80" viewBox="0 0 130 180" xmlns="http://www.w3.org/2000/svg"></svg>' +
      '</div>' +
      '<div style="font-family:var(--f);font-weight:700;font-size:14px;color:rgba(255,255,255,.7);transition:color .2s" class="perfil-name">'+escapeHtml(p.nombre)+'</div>';

    var circle = card.querySelector('.perfil-circle');
    var nameEl  = card.querySelector('.perfil-name');
    card.addEventListener('mouseenter', function() { circle.style.borderColor='#FF6B9D'; circle.style.boxShadow='0 0 20px rgba(255,107,157,.4)'; nameEl.style.color='#fff'; });
    card.addEventListener('mouseleave', function() { circle.style.borderColor='transparent'; circle.style.boxShadow='none'; nameEl.style.color='rgba(255,255,255,.7)'; });
    card.addEventListener('click', function() { seleccionarPerfil(p); });

    var editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.style.cssText = 'position:absolute;top:0;right:-4px;width:24px;height:24px;border-radius:50%;background:#7C3AED;border:2px solid white;font-size:10px;cursor:pointer;padding:0';
    editBtn.addEventListener('click', function(e) { e.stopPropagation(); abrirModalEditar(p); });
    card.appendChild(editBtn);
    grid.appendChild(card);

    var svgEl = card.querySelector('[data-perfil-avatar="'+p.id+'"]');
    if (svgEl) drawAvatarSVG(svgEl, perfilToAV(p), 0);
  });

  if (perfiles.length < 5) {
    var addCard = document.createElement('div');
    addCard.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer';
    addCard.innerHTML =
      '<div style="width:88px;height:88px;border-radius:50%;border:3px dashed rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;transition:all .2s;background:rgba(255,255,255,.03)" class="add-circle">' +
        '<span style="font-size:28px;color:rgba(255,255,255,.3);transition:color .2s" class="add-plus">+</span>' +
      '</div>' +
      '<div style="font-family:var(--f);font-weight:700;font-size:14px;color:rgba(255,255,255,.35);transition:color .2s" class="add-label">Añadir perfil</div>';
    var ac = addCard.querySelector('.add-circle'), ap = addCard.querySelector('.add-plus'), al = addCard.querySelector('.add-label');
    addCard.addEventListener('mouseenter', function() { ac.style.borderColor='rgba(255,255,255,.7)'; ac.style.background='rgba(255,255,255,.08)'; ap.style.color='#fff'; al.style.color='#fff'; });
    addCard.addEventListener('mouseleave', function() { ac.style.borderColor='rgba(255,255,255,.25)'; ac.style.background='rgba(255,255,255,.03)'; ap.style.color='rgba(255,255,255,.3)'; al.style.color='rgba(255,255,255,.35)'; });
    addCard.addEventListener('click', function() { abrirModalNuevo(); });
    grid.appendChild(addCard);
  }
}

/* ---- Seleccionar perfil ---- */
function seleccionarPerfil(perfil) {
  setPerfilActivo(perfil);
  AV = perfilToAV(perfil);
  saveAvatar(AV);
  setCurso(CONFIG.curso.porDefecto);

  // Cargar progreso desde D1 y luego entrar
  setPerfilActivoId(perfil.id, function() {
    updateHomeUI(); updateStreakUI(); updateMedalUI();
    updateSubjectUI('mates'); updateSubjectUI('lengua');
    updateSubjectUI('sciences'); updateSubjectUI('english');
    refreshAllAvatars();
    go('s-cursos');
  });
}

/* ---- Modal nuevo/editar ---- */
function abrirModalNuevo() {
  perfilEditandoId = null;
  modalAV = { skin: 0, hairColor: 1, hair: 0 };
  document.getElementById('modal-perfil-titulo').textContent = 'Nuevo perfil ✨';
  document.getElementById('modal-nombre').value = '';
  abrirModal();
}

function abrirModalEditar(perfil) {
  perfilEditandoId = perfil.id;
  modalAV = { skin: perfil.skin, hairColor: perfil.hairColor, hair: perfil.hair };
  document.getElementById('modal-perfil-titulo').textContent = 'Editar perfil ✏️';
  document.getElementById('modal-nombre').value = perfil.nombre;
  abrirModal();
}

function abrirModal() {
  renderModalOpciones();
  renderModalPreview();
  document.getElementById('modal-perfil').style.display = 'flex';
}

function cerrarModalPerfil() {
  document.getElementById('modal-perfil').style.display = 'none';
}

function renderModalOpciones() {
  var skinRow = document.getElementById('modal-skin-row');
  skinRow.innerHTML = '';
  AVATAR_SKINS.forEach(function(c, i) {
    var btn = document.createElement('button');
    btn.style.cssText = 'width:28px;height:28px;border-radius:50%;background:'+c+';border:none;cursor:pointer;outline:'+(modalAV.skin===i?'2.5px solid #FF6B9D':'2px solid transparent')+';outline-offset:2px;transition:outline .1s';
    btn.addEventListener('click', function() { modalAV.skin = i; renderModalOpciones(); renderModalPreview(); });
    skinRow.appendChild(btn);
  });

  var hairRow = document.getElementById('modal-hair-row');
  hairRow.innerHTML = '';
  AVATAR_HAIR_COLORS.slice(0, 3).forEach(function(h, i) {
    var btn = document.createElement('button');
    btn.style.cssText = 'width:28px;height:28px;border-radius:50%;background:'+h.color+';border:none;cursor:pointer;outline:'+(modalAV.hairColor===i?'2.5px solid #FF6B9D':'2px solid transparent')+';outline-offset:2px;transition:outline .1s';
    btn.addEventListener('click', function() { modalAV.hairColor = i; renderModalOpciones(); renderModalPreview(); });
    hairRow.appendChild(btn);
  });

  var styleRow = document.getElementById('modal-style-row');
  styleRow.innerHTML = '';
  HAIR_NAMES.forEach(function(n, i) {
    var btn = document.createElement('button');
    btn.textContent = n;
    btn.style.cssText = 'padding:5px 11px;border-radius:20px;border:none;cursor:pointer;font-family:var(--f);font-weight:700;font-size:11px;transition:all .15s;background:'+(modalAV.hair===i?'#FF6B9D':'rgba(255,255,255,.1)')+';color:'+(modalAV.hair===i?'#fff':'rgba(255,255,255,.55)');
    btn.addEventListener('click', function() { modalAV.hair = i; renderModalOpciones(); renderModalPreview(); });
    styleRow.appendChild(btn);
  });
}

function renderModalPreview() {
  var svgEl = document.getElementById('modal-avatar-svg');
  if (svgEl) drawAvatarSVG(svgEl, { skin: modalAV.skin, hairColor: modalAV.hairColor, hair: modalAV.hair, acc: 0, unlocked: [] }, 0);
}

function guardarPerfil() {
  var nombre = document.getElementById('modal-nombre').value.trim();
  if (nombre.length < 2) { document.getElementById('modal-nombre').style.borderColor = '#FF6B9D'; return; }

  var datos = {
    nombre:     nombre,
    skin:       modalAV.skin,
    hair_color: modalAV.hairColor,
    hair:       modalAV.hair,
    unlocked:   []
  };

  if (perfilEditandoId) {
    // Editar en la nube
    fetch(API_URL + '/perfiles/' + perfilEditandoId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    }).then(function() {
      cerrarModalPerfil();
      renderPerfiles();
    }).catch(function() {
      cerrarModalPerfil();
      renderPerfiles();
    });
  } else {
    // Crear en la nube
    datos.id = Date.now().toString();
    fetch(API_URL + '/perfiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    }).then(function() {
      cerrarModalPerfil();
      cargarPerfiles(function(perfiles) { pintarPerfiles(perfiles); });
    }).catch(function() {
      cerrarModalPerfil();
    });
  }
}

/* ---- Zona de padres ---- */
function abrirZonaPadresDesdePerfiles() {
  irAPadres();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
