/* =============================================
   AVATAR.JS — Gestión del avatar personalizable
   Guardado en localStorage como 'aprendeyjuega_avatar'
   ============================================= */

var AVATAR_KEY = 'aprendeyjuega_avatar';

var AVATAR_SKINS = ['#FDDBB4','#F0C27F','#D4956A','#A0674A','#6B3F2A'];
var AVATAR_HAIR_COLORS = [
  {color:'#2C1A0E', req:0},
  {color:'#8B4513', req:0},
  {color:'#D4A017', req:0},
  {color:'#FF6B6B', req:100},
  {color:'#FF8C00', req:150},
  {color:'#7C3AED', req:200},
  {color:'#4A90E2', req:300},
  {color:'#34D399', req:400},
  {color:'#EC4899', req:450},
];
var AVATAR_HAIRS = [
  {label:'Liso corto',  req:0},
  {label:'Liso largo',  req:0},
  {label:'Rizado',      req:0},
  {label:'Trenzas',     req:50},
  {label:'Cola alta',   req:100},
];
var AVATAR_ACCS = [
  {label:'Ninguno',        req:0,   icon:''},
  {label:'Diadema',        req:0,   icon:'💎'},
  {label:'Corona',         req:150, icon:'👑'},
  {label:'Sombrero',       req:250, icon:'🎩'},
  {label:'Orejas gatito',  req:350, icon:'🐱'},
  {label:'Arco iris',      req:500, icon:'🌈'},
];

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

  var hairPaths = [
    '<ellipse cx="65" cy="42" rx="28" ry="20" fill="'+hair+'"/>',
    '<ellipse cx="65" cy="42" rx="28" ry="22" fill="'+hair+'"/><path d="M37 55 Q30 90 35 110" stroke="'+hair+'" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M93 55 Q100 90 95 110" stroke="'+hair+'" stroke-width="8" fill="none" stroke-linecap="round"/>',
    '<path d="M37 50 Q40 20 65 22 Q90 20 93 50" fill="'+hair+'"/><circle cx="50" cy="52" r="8" fill="'+hair+'"/><circle cx="65" cy="50" r="8" fill="'+hair+'"/><circle cx="80" cy="52" r="8" fill="'+hair+'"/>',
    '<path d="M37 50 Q40 22 65 22 Q90 22 93 50" fill="'+hair+'"/><path d="M40 52 Q42 80 38 105" stroke="'+hair+'" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M90 52 Q88 80 92 105" stroke="'+hair+'" stroke-width="7" fill="none" stroke-linecap="round"/>',
    '<ellipse cx="65" cy="40" rx="28" ry="20" fill="'+hair+'"/><ellipse cx="65" cy="28" rx="12" ry="16" fill="'+hair+'"/>',
  ];

  var accSvg = '';
  if (acc.label==='Diadema')       accSvg='<ellipse cx="65" cy="34" rx="24" ry="5" fill="none" stroke="#A855F7" stroke-width="4"/><circle cx="65" cy="30" r="5" fill="#EC4899"/>';
  if (acc.label==='Corona')        accSvg='<polygon points="41,38 50,20 65,32 80,20 89,38" fill="#F59E0B"/><circle cx="50" cy="22" r="3" fill="#EF4444"/><circle cx="65" cy="34" r="3" fill="#3B82F6"/><circle cx="80" cy="22" r="3" fill="#10B981"/>';
  if (acc.label==='Sombrero')      accSvg='<rect x="30" y="36" width="70" height="6" rx="3" fill="#1F2937"/><rect x="44" y="10" width="42" height="28" rx="6" fill="#374151"/>';
  if (acc.label==='Orejas gatito') accSvg='<polygon points="38,42 44,20 54,36" fill="'+hair+'"/><polygon points="76,42 86,20 92,36" fill="'+hair+'"/><polygon points="41,40 45,24 52,36" fill="#F9A8D4"/><polygon points="78,40 85,24 89,36" fill="#F9A8D4"/>';
  if (acc.label==='Arco iris')     accSvg='<path d="M30 45 Q65 5 100 45" fill="none" stroke="#EF4444" stroke-width="4" opacity=".8"/><path d="M34 48 Q65 12 96 48" fill="none" stroke="#F59E0B" stroke-width="3" opacity=".8"/><path d="M38 51 Q65 18 92 51" fill="none" stroke="#10B981" stroke-width="3" opacity=".8"/><path d="M42 54 Q65 24 88 54" fill="none" stroke="#3B82F6" stroke-width="3" opacity=".8"/>';

  svgEl.innerHTML =
    (hairPaths[hairStyle] || hairPaths[0]) +
    '<ellipse cx="65" cy="72" rx="26" ry="30" fill="'+skin+'"/>'+
    '<ellipse cx="55" cy="68" rx="5" ry="6" fill="white"/><ellipse cx="75" cy="68" rx="5" ry="6" fill="white"/>'+
    '<circle cx="55" cy="69" r="3" fill="#1F2937"/><circle cx="75" cy="69" r="3" fill="#1F2937"/>'+
    '<circle cx="56" cy="68" r="1" fill="white"/><circle cx="76" cy="68" r="1" fill="white"/>'+
    '<ellipse cx="65" cy="82" rx="4" ry="2.5" fill="#C4737A" opacity=".6"/>'+
    '<path d="M57 88 Q65 94 73 88" fill="none" stroke="#C4737A" stroke-width="2" stroke-linecap="round"/>'+
    '<ellipse cx="51" cy="76" rx="4" ry="3" fill="'+skin+'" opacity=".6"/><ellipse cx="79" cy="76" rx="4" ry="3" fill="'+skin+'" opacity=".6"/>'+
    accSvg;
}

/* ---- Refrescar todos los avatares en pantalla ---- */
function refreshAllAvatars() {
  document.querySelectorAll('[data-avatar]').forEach(function(el) {
    drawAvatarSVG(el, AV, ST.totalPts);
  });
}

/* ---- Comprobar si hay desbloqueos nuevos ---- */
var LAST_UNLOCK_KEY = 'aprendeyjuega_last_unlock_pts';

function checkNewUnlocks() {
  var lastPts = parseInt(localStorage.getItem(LAST_UNLOCK_KEY) || '0');
  var currentPts = ST.totalPts;
  if (currentPts <= lastPts) return;

  var newItems = [];
  AVATAR_HAIR_COLORS.forEach(function(h) {
    if (h.req > 0 && lastPts < h.req && currentPts >= h.req) {
      newItems.push('¡Nuevo color de pelo desbloqueado!');
    }
  });
  AVATAR_HAIRS.forEach(function(h) {
    if (h.req > 0 && lastPts < h.req && currentPts >= h.req) {
      newItems.push('¡Nuevo peinado desbloqueado: ' + h.label + '!');
    }
  });
  AVATAR_ACCS.forEach(function(a) {
    if (a.req > 0 && lastPts < a.req && currentPts >= a.req) {
      newItems.push('¡Nuevo accesorio desbloqueado: ' + a.icon + ' ' + a.label + '!');
    }
  });

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
  var backBtn = document.getElementById('avatar-back-btn');
  if (backBtn) backBtn.onclick = function() { go(backScreen || 's-home'); };
  var pts = ST.totalPts;
  var pBadge = document.getElementById('avatar-pts-badge');
  if (pBadge) pBadge.textContent = '⭐ ' + pts + ' pts';
  renderAvatarEditor();
  go('s-avatar');
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
      d.title = locked ? 'Se desbloquea con '+h.req+' pts' : '';
      if (!locked) d.onclick = function(){ AV_TEMP.hairColor=globalIdx; renderAvatarEditor(); };
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
      if (!locked) btn.onclick = function(){ AV_TEMP.hair=i; renderAvatarEditor(); };
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
      if (!locked) btn.onclick = function(){ AV_TEMP.acc=i; renderAvatarEditor(); };
      accRow.appendChild(btn);
    });
  }
}

function guardarAvatar() {
  AV = JSON.parse(JSON.stringify(AV_TEMP));
  saveAvatar(AV);
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
      d.title = 'Se desbloquea con '+h.req+' pts';
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
      btn.style.cssText = 'padding:6px 12px;border-radius:20px;border:1.5px solid #E5E7EB;background:white;color:#9CA3AF;font-size:12px;font-weight:700;cursor:not-allowed;opacity:.4';
      styleRow.appendChild(btn);
    });
  }
}
