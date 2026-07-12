/* =============================================
   AVATAR.JS — Gestión del avatar personalizable
   Guardado en localStorage como 'aprendeyjuega_avatar'
   ============================================= */

var AVATAR_KEY = 'aprendeyjuega_avatar';

var AVATAR_SKINS = ['#FDDBB4','#F0C27F','#D4956A','#A0674A','#6B3F2A'];
// Colores de pelo, peinados y accesorios desbloqueables (con su umbral de
// puntos "req") viven en config.js — CONFIG.avatar.*
var AVATAR_HAIR_COLORS = CONFIG.avatar.hairColors;
var AVATAR_HAIRS       = CONFIG.avatar.hairstyles;
var AVATAR_ACCS        = CONFIG.avatar.accessories;

function defaultAvatar() {
  return { skin:1, hairColor:1, hair:0, acc:0 };
}

function loadAvatar() {
  try {
    var raw = localStorage.getItem(AVATAR_KEY);
    if (!raw) return defaultAvatar();
    return JSON.parse(raw);
  } catch(e) { return defaultAvatar(); }
}

function saveAvatar(av) {
  try { localStorage.setItem(AVATAR_KEY, JSON.stringify(av)); } catch(e) {}
}

/* ---- Subir el avatar personalizado a D1 (además de guardarlo en local) ----
   Sin esto, personalizar el avatar solo sobrevivía en el navegador actual:
   si el niño cambiaba de dispositivo o se borraba la caché, se perdía. */
function syncAvatarToCloud() {
  if (!perfilActivoId || !perfilActivoNombre) return;
  fetch(API_URL + '/perfiles/' + perfilActivoId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre:     perfilActivoNombre,
      skin:       AV.skin,
      hair_color: AV.hairColor,
      hair:       AV.hair,
      unlocked:   AV.unlocked || []
    })
  }).catch(function(e) { console.warn('[avatar] No se pudo sincronizar el avatar con D1:', e); });
}

var AV = loadAvatar();

/* ---- Dibuja el avatar en un elemento SVG dado ---- */
function drawAvatarSVG(svgEl, av, pts) {
  if (!svgEl) return;
  av = av || AV;
  pts = pts !== undefined ? pts : ST.totalPts;

  var skin = AVATAR_SKINS[av.skin] || AVATAR_SKINS[1];
  var hairObj = AVATAR_HAIR_COLORS[av.hairColor] || AVATAR_HAIR_COLORS[1];
  var hair = hairObj.color;
  var hairStyle = av.hair || 0;
  var accIdx = av.acc || 0;
  var acc = AVATAR_ACCS[accIdx] || AVATAR_ACCS[0];

  var hd = hair;
  var hs = hairDark(hair);

  // Tono de sombra para la piel
  var skinDark = hairDark(skin);

  // Cada peinado: [pelo_trasero, pelo_delantero]
  // Orden de dibujo: pelo_trasero → cara+orejas → pelo_delantero → ojos+boca
  var hairParts = [
    // 0: Liso corto
    [
      '<path d="M39 70 Q38 44 52 32 Q65 20 78 32 Q92 44 91 70 Q88 58 65 56 Q42 58 39 70Z" fill="'+hd+'"/>',
      '<path d="M39 70 Q38 48 52 36 Q65 26 78 36 Q92 48 91 70 Q88 58 65 56 Q42 58 39 70Z" fill="'+hd+'"/>'
    ],
    // 1: Liso largo
    [
      '<path d="M39 70 Q37 44 52 32 Q65 20 78 32 Q93 44 91 70 Q93 100 90 130 Q88 148 86 155 Q78 162 65 162 Q52 162 44 155 Q42 148 40 130 Q37 100 39 70Z" fill="'+hd+'"/><path d="M39 70 Q36 82 37 100 Q38 116 41 128" stroke="'+hd+'" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M91 70 Q94 82 93 100 Q92 116 89 128" stroke="'+hd+'" stroke-width="11" fill="none" stroke-linecap="round"/>',
      '<path d="M39 70 Q38 48 52 36 Q65 26 78 36 Q92 48 91 70 Q88 58 65 56 Q42 58 39 70Z" fill="'+hd+'"/>'
    ],
    // 2: Rizado largo
    [
      '<path d="M36 70 Q34 46 50 32 Q65 20 80 32 Q96 46 94 70 Q98 96 94 124 Q90 150 86 164 Q76 174 65 174 Q54 174 44 164 Q40 150 36 124 Q32 96 36 70Z" fill="'+hd+'"/><path d="M35 80 Q22 93 26 109 Q30 125 20 141 Q14 153 24 163" stroke="'+hd+'" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M35 80 Q48 93 44 109 Q40 125 50 141 Q56 153 46 163" stroke="'+hs+'" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".45"/><path d="M95 80 Q108 93 104 109 Q100 125 110 141 Q116 153 106 163" stroke="'+hd+'" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M95 80 Q82 93 86 109 Q90 125 80 141 Q74 153 84 163" stroke="'+hs+'" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".45"/>',
      '<path d="M36 70 Q34 50 50 38 Q65 27 80 38 Q96 50 94 70 Q90 58 65 56 Q40 58 36 70Z" fill="'+hd+'"/><path d="M44 44 Q40 36 46 32 Q52 30 54 38" fill="none" stroke="'+hs+'" stroke-width="2.5" stroke-linecap="round" opacity=".55"/><path d="M76 44 Q80 36 74 32 Q68 30 66 38" fill="none" stroke="'+hs+'" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>'
    ],
    // 3: Trenzas
    [
      '<path d="M39 70 Q38 44 52 32 Q65 20 78 32 Q92 44 91 70 Q88 58 65 56 Q42 58 39 70Z" fill="'+hd+'"/><path d="M39 80 Q32 92 38 104 Q44 116 38 128 Q32 140 38 152" stroke="'+hd+'" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 80 Q46 92 40 104 Q34 116 40 128 Q46 140 40 152" stroke="'+hs+'" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/><circle cx="39" cy="153" r="5" fill="'+hs+'"/><path d="M91 80 Q98 92 92 104 Q86 116 92 128 Q98 140 92 152" stroke="'+hd+'" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M91 80 Q84 92 90 104 Q96 116 90 128 Q84 140 90 152" stroke="'+hs+'" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/><circle cx="91" cy="153" r="5" fill="'+hs+'"/>',
      '<path d="M39 70 Q38 48 52 36 Q65 26 78 36 Q92 48 91 70 Q88 58 65 56 Q42 58 39 70Z" fill="'+hd+'"/>'
    ],
    // 4: Cola alta
    [
      '<path d="M39 70 Q38 44 52 32 Q65 20 78 32 Q92 44 91 70 Q88 58 65 56 Q42 58 39 70Z" fill="'+hd+'"/><path d="M65 28 Q72 20 76 16 Q80 12 81 18 Q82 26 78 38 Q74 52 72 66 Q70 80 70 94 Q70 106 68 116" stroke="'+hd+'" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M65 28 Q68 22 72 22 Q74 26 72 36 Q69 50 67 64 Q65 78 65 94 Q65 106 64 116" stroke="'+hs+'" stroke-width="3" fill="none" stroke-linecap="round" opacity=".4"/><circle cx="68" cy="27" r="6" fill="'+hs+'"/>',
      '<path d="M39 70 Q38 48 52 36 Q65 26 78 36 Q92 48 91 70 Q88 58 65 56 Q42 58 39 70Z" fill="'+hd+'"/>'
    ],
  ];

  var accSvg = '';
  if (acc.label==='Diadema')       accSvg='<path d="M40 62 Q52 48 65 45 Q78 48 90 62" fill="none" stroke="#A855F7" stroke-width="4" stroke-linecap="round"/><circle cx="65" cy="44" r="6" fill="#EC4899"/><circle cx="65" cy="44" r="3" fill="white" opacity=".5"/>';
  if (acc.label==='Corona')        accSvg='<polygon points="41,32 50,12 65,24 80,12 89,32" fill="var(--vacaciones)"/><circle cx="50" cy="14" r="3.5" fill="#EF4444"/><circle cx="65" cy="26" r="3.5" fill="#3B82F6"/><circle cx="80" cy="14" r="3.5" fill="#10B981"/><rect x="41" y="30" width="48" height="7" rx="2" fill="#D97706"/>';
  if (acc.label==='Sombrero')      accSvg='<rect x="30" y="36" width="70" height="6" rx="3" fill="#1F2937"/><rect x="44" y="10" width="42" height="28" rx="6" fill="#374151"/>';
  if (acc.label==='Orejas gatito') accSvg='<polygon points="38,42 44,20 54,36" fill="'+hair+'"/><polygon points="76,42 86,20 92,36" fill="'+hair+'"/><polygon points="41,40 45,24 52,36" fill="#F9A8D4"/><polygon points="78,40 85,24 89,36" fill="#F9A8D4"/>';
  if (acc.label==='Arco iris')     accSvg='<path d="M30 45 Q65 5 100 45" fill="none" stroke="#EF4444" stroke-width="4" opacity=".8"/><path d="M34 48 Q65 12 96 48" fill="none" stroke="var(--vacaciones)" stroke-width="3" opacity=".8"/><path d="M38 51 Q65 18 92 51" fill="none" stroke="#10B981" stroke-width="3" opacity=".8"/><path d="M42 54 Q65 24 88 54" fill="none" stroke="#3B82F6" stroke-width="3" opacity=".8"/>';

  var parts = hairParts[hairStyle] || hairParts[0];
  svgEl.innerHTML =
    // capa 1: pelo trasero
    parts[0] +
    // capa 2: orejas + cara
    '<ellipse cx="39" cy="85" rx="5" ry="6" fill="'+skin+'"/>'+
    '<ellipse cx="91" cy="85" rx="5" ry="6" fill="'+skin+'"/>'+
    '<ellipse cx="65" cy="85" rx="26" ry="30" fill="'+skin+'"/>'+
    // capa 3: pelo delantero
    parts[1] +
    // accesorios (van encima del pelo delantero)
    accSvg +
    // capa 4: cejas, ojos con brillo, nariz, boca, mejillas
    // Cejas
    '<path d="M48 73 Q53 70 58 72" stroke="'+hs+'" stroke-width="2" fill="none" stroke-linecap="round"/>'+
    '<path d="M72 73 Q77 70 82 72" stroke="'+hs+'" stroke-width="2" fill="none" stroke-linecap="round"/>'+
    // Ojos blancos
    '<ellipse cx="53" cy="80" rx="6" ry="6.5" fill="white"/>'+
    '<ellipse cx="77" cy="80" rx="6" ry="6.5" fill="white"/>'+
    // Iris
    '<circle cx="54" cy="81" r="4" fill="#3D2B1F"/>'+
    '<circle cx="78" cy="81" r="4" fill="#3D2B1F"/>'+
    // Brillo ojos
    '<circle cx="56" cy="79" r="1.5" fill="white"/>'+
    '<circle cx="80" cy="79" r="1.5" fill="white"/>'+
    '<circle cx="53" cy="83" r="0.8" fill="white" opacity=".6"/>'+
    '<circle cx="77" cy="83" r="0.8" fill="white" opacity=".6"/>'+
    // Nariz
    '<ellipse cx="65" cy="92" rx="3" ry="2" fill="'+skinDark+'" opacity=".4"/>'+
    // Boca
    '<path d="M57 99 Q65 107 73 99" fill="none" stroke="#C4737A" stroke-width="2.5" stroke-linecap="round"/>'+
    '<ellipse cx="65" cy="100" rx="5" ry="2" fill="#E8967A" opacity=".25"/>'+
    // Mejillas
    '<ellipse cx="46" cy="89" rx="7" ry="4" fill="#FFB3B3" opacity=".45"/>'+
    '<ellipse cx="84" cy="89" rx="7" ry="4" fill="#FFB3B3" opacity=".45"/>';
}

/* ---- Devuelve un tono más oscuro del color de pelo para sombras ---- */
function hairDark(hex) {
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  r = Math.max(0, Math.floor(r*0.65));
  g = Math.max(0, Math.floor(g*0.65));
  b = Math.max(0, Math.floor(b*0.65));
  return '#'+r.toString(16).padStart(2,'0')+g.toString(16).padStart(2,'0')+b.toString(16).padStart(2,'0');
}

/* ---- Refrescar todos los avatares en pantalla ---- */
function refreshAllAvatars() {
  document.querySelectorAll('[data-avatar]').forEach(function(el) {
    drawAvatarSVG(el, AV, ST.totalPts);
  });
}

/* ---- Comprobar si hay desbloqueos nuevos ---- */
var LAST_UNLOCK_KEY = 'aprendeyjuega_last_unlock_pts';
// Se carga una vez al iniciar — referencia de puntos de la sesión anterior
var _lastUnlockPts = parseInt(localStorage.getItem(LAST_UNLOCK_KEY) || '0');

function checkNewUnlocks() {
  var currentPts = ST.totalPts;
  if (currentPts <= _lastUnlockPts) return;

  var newItems = [];
  AVATAR_HAIR_COLORS.forEach(function(h) {
    if (h.req > 0 && _lastUnlockPts < h.req && currentPts >= h.req) {
      newItems.push('¡Nuevo color de pelo desbloqueado! ✨');
    }
  });
  AVATAR_HAIRS.forEach(function(h) {
    if (h.req > 0 && _lastUnlockPts < h.req && currentPts >= h.req) {
      newItems.push('¡Nuevo peinado desbloqueado: ' + h.label + '! ✨');
    }
  });
  AVATAR_ACCS.forEach(function(a) {
    if (a.req > 0 && _lastUnlockPts < a.req && currentPts >= a.req) {
      newItems.push('¡Nuevo accesorio: ' + a.icon + ' ' + a.label + '! ✨');
    }
  });

  // Actualizar referencia en memoria y localStorage
  _lastUnlockPts = currentPts;
  localStorage.setItem(LAST_UNLOCK_KEY, currentPts);

  if (newItems.length > 0) {
    showUnlockToast(newItems[0]);
  }
}

function showUnlockToast(msg) {
  var t = document.getElementById('unlock-toast');
  if (!t) return;
  document.getElementById('unlock-toast-msg').textContent = msg;
  t.style.display = 'flex';
  setTimeout(function() { t.style.display = 'none'; }, 6000);
}

/* ---- Renderizar editor de avatar ---- */
var AV_TEMP = {}; // copia temporal mientras edita

function abrirEditorAvatar(backScreen) {
  AV_TEMP = JSON.parse(JSON.stringify(AV));
  var pts = ST.totalPts;
  var _backScreen = backScreen || 's-home';
  go('s-avatar');
  // El back button y el render se hacen después de que go() cargue la pantalla
  // navigation.js llama a renderAvatarEditor() al navegar a s-avatar
  var backBtn = document.getElementById('avatar-back-btn');
  if (backBtn) backBtn.onclick = function() { go(_backScreen); };
  var pBadge = document.getElementById('avatar-pts-badge');
  if (pBadge) pBadge.textContent = '⭐ ' + pts + ' pts';
}

function renderAvatarEditor() {
  var pts = ST.totalPts;
  drawAvatarSVG(document.getElementById('avatar-editor-svg'), AV_TEMP, pts);

  // Medalla actual
  var medals = [{icon:'🎖️',req:0},{icon:'🥉',req:50},{icon:'🥈',req:100},{icon:'🥇',req:200},{icon:'🏅',req:300},{icon:'👑',req:400},{icon:'🌟',req:450},{icon:'✨',req:500}];
  var curMedal = medals[0];
  medals.forEach(function(m){ if(pts>=m.req) curMedal=m; });
  var mb = document.getElementById('avatar-medal-badge');
  if (mb) mb.textContent = curMedal.icon;

  // Tono de piel
  var skinRow = document.getElementById('av-skin-row');
  if (skinRow) {
    skinRow.innerHTML = '';
    AVATAR_SKINS.forEach(function(c,i){
      var d = document.createElement('div');
      d.style.cssText = 'width:32px;height:32px;border-radius:50%;background:'+c+';cursor:pointer;border:'+(i===AV_TEMP.skin?'3px solid #1F2937':'2px solid transparent');
      d.onclick = function(){ AV_TEMP.skin=i; renderAvatarEditor(); };
      skinRow.appendChild(d);
    });
  }

  // Color pelo natural
  var natRow = document.getElementById('av-hair-natural-row');
  if (natRow) {
    natRow.innerHTML = '';
    AVATAR_HAIR_COLORS.slice(0,3).forEach(function(h,i){
      var d = document.createElement('div');
      d.style.cssText = 'width:32px;height:32px;border-radius:50%;background:'+h.color+';cursor:pointer;border:'+(i===AV_TEMP.hairColor?'3px solid #1F2937':'2px solid transparent');
      d.onclick = function(){ AV_TEMP.hairColor=i; renderAvatarEditor(); };
      natRow.appendChild(d);
    });
  }

  // Color pelo fantástico
  var fancyRow = document.getElementById('av-hair-fancy-row');
  if (fancyRow) {
    fancyRow.innerHTML = '';
    AVATAR_HAIR_COLORS.slice(3).forEach(function(h,i){
      var globalIdx = 3+i;
      var locked = pts < h.req;
      var d = document.createElement('div');
      d.style.cssText = 'width:32px;height:32px;border-radius:50%;background:'+h.color+';cursor:'+(locked?'not-allowed':'pointer')+';border:'+(globalIdx===AV_TEMP.hairColor?'3px solid #1F2937':'2px solid transparent')+';opacity:'+(locked?'0.3':'1')+';filter:'+(locked?'grayscale(1)':'none');
      if (!locked) {
        d.onclick = function(){ AV_TEMP.hairColor=globalIdx; renderAvatarEditor(); };
      } else {
        d.onclick = function(){ showToast('🔒 Se desbloquea con '+h.req+' pts'); };
      }
      fancyRow.appendChild(d);
    });
  }

  // Peinados
  var hairRow = document.getElementById('av-hair-style-row');
  if (hairRow) {
    hairRow.innerHTML = '';
    AVATAR_HAIRS.forEach(function(h,i){
      var locked = pts < h.req;
      var btn = document.createElement('button');
      btn.textContent = locked ? '🔒 '+h.label : h.label;
      btn.style.cssText = 'padding:6px 12px;border-radius:20px;border:'+(i===AV_TEMP.hair?'2px solid #7C3AED':'1.5px solid #E5E7EB')+';background:'+(i===AV_TEMP.hair?'#EDE9FE':'white')+';color:'+(i===AV_TEMP.hair?'#4C1D95':'#374151')+';font-size:12px;font-weight:700;cursor:'+(locked?'not-allowed':'pointer')+';opacity:'+(locked?'0.35':'1');
      if (!locked) {
        btn.onclick = function(){ AV_TEMP.hair=i; renderAvatarEditor(); };
      } else {
        btn.onclick = function(){ showToast('🔒 Se desbloquea con '+h.req+' pts'); };
      }
      hairRow.appendChild(btn);
    });
  }

  // Accesorios
  var accRow = document.getElementById('av-acc-row');
  if (accRow) {
    accRow.innerHTML = '';
    AVATAR_ACCS.forEach(function(a,i){
      var locked = pts < a.req;
      var btn = document.createElement('button');
      btn.textContent = locked ? '🔒 '+a.label : (a.icon?a.icon+' ':'')+a.label;
      btn.style.cssText = 'padding:6px 12px;border-radius:20px;border:'+(i===AV_TEMP.acc?'2px solid #7C3AED':'1.5px solid #E5E7EB')+';background:'+(i===AV_TEMP.acc?'#EDE9FE':'white')+';color:'+(i===AV_TEMP.acc?'#4C1D95':'#374151')+';font-size:12px;font-weight:700;cursor:'+(locked?'not-allowed':'pointer')+';opacity:'+(locked?'0.35':'1');
      if (!locked) {
        btn.onclick = function(){ AV_TEMP.acc=i; renderAvatarEditor(); };
      } else {
        btn.onclick = function(){ showToast('🔒 Se desbloquea con '+a.req+' pts'); };
      }
      accRow.appendChild(btn);
    });
  }
}

function guardarAvatar() {
  AV = JSON.parse(JSON.stringify(AV_TEMP));
  saveAvatar(AV);
  syncAvatarToCloud();
  refreshAllAvatars();
  showToast('¡Avatar guardado! 🎉');
  go('s-home');
}

/* ---- Editor simplificado para la pantalla de creación inicial ---- */
function renderCrearAvatar() {
  drawAvatarSVG(document.getElementById('crear-avatar-svg'), AV_TEMP, 0);

  var skinRow = document.getElementById('ca-skin-row');
  if (skinRow) {
    skinRow.innerHTML = '';
    AVATAR_SKINS.forEach(function(c,i){
      var d = document.createElement('div');
      d.style.cssText = 'width:32px;height:32px;border-radius:50%;background:'+c+';cursor:pointer;border:'+(i===AV_TEMP.skin?'3px solid #1F2937':'2px solid transparent');
      d.onclick = function(){ AV_TEMP.skin=i; renderCrearAvatar(); };
      skinRow.appendChild(d);
    });
  }

  var hairRow = document.getElementById('ca-hair-row');
  if (hairRow) {
    hairRow.innerHTML = '';
    AVATAR_HAIR_COLORS.slice(0,3).forEach(function(h,i){
      var d = document.createElement('div');
      d.style.cssText = 'width:32px;height:32px;border-radius:50%;background:'+h.color+';cursor:pointer;border:'+(i===AV_TEMP.hairColor?'3px solid #1F2937':'2px solid transparent');
      d.onclick = function(){ AV_TEMP.hairColor=i; renderCrearAvatar(); };
      hairRow.appendChild(d);
    });
    // Colores bloqueados solo decorativos
    AVATAR_HAIR_COLORS.slice(3,6).forEach(function(h){
      var d = document.createElement('div');
      d.style.cssText = 'width:32px;height:32px;border-radius:50%;background:'+h.color+';opacity:.25;filter:grayscale(1);border:2px solid transparent';
      d.onclick = function(){ showToast('🔒 Se desbloquea con '+h.req+' pts jugando'); };
      hairRow.appendChild(d);
    });
  }

  var styleRow = document.getElementById('ca-style-row');
  if (styleRow) {
    styleRow.innerHTML = '';
    AVATAR_HAIRS.slice(0,3).forEach(function(h,i){
      var btn = document.createElement('button');
      btn.textContent = h.label;
      btn.style.cssText = 'padding:6px 12px;border-radius:20px;border:'+(i===AV_TEMP.hair?'2px solid #7C3AED':'1.5px solid #E5E7EB')+';background:'+(i===AV_TEMP.hair?'#EDE9FE':'white')+';color:'+(i===AV_TEMP.hair?'#4C1D95':'#374151')+';font-size:12px;font-weight:700;cursor:pointer';
      btn.onclick = function(){ AV_TEMP.hair=i; renderCrearAvatar(); };
      styleRow.appendChild(btn);
    });
    AVATAR_HAIRS.slice(3).forEach(function(h){
      var btn = document.createElement('button');
      btn.textContent = '🔒 '+h.label;
      btn.style.cssText = 'padding:6px 12px;border-radius:20px;border:1.5px solid #E5E7EB;background:white;color:#9CA3AF;font-size:12px;font-weight:700;cursor:pointer;opacity:.4';
      btn.onclick = (function(hh){ return function(){ showToast('🔒 Se desbloquea con '+hh.req+' pts'); }; })(h);
      styleRow.appendChild(btn);
    });
  }
}
