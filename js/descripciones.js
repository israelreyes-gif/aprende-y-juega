/* =============================================
   DESCRIPCIONES.JS — Ejercicio de descripción de imágenes
   - 30 imágenes con palabras clave
   - Mínimo 3 oraciones
   - Puntuación por palabras clave encontradas
   - Bonus +10 pts si menciona TODAS las palabras clave
   ============================================= */

var DESCRIPCIONES_DB = [];
var descIdx          = 0;
var descOrden        = [];
var currentDesc      = null;

fetch('data/curso' + cursoActual + '/descripciones.json')
  .then(function(r) { return r.json(); })
  .then(function(data) {
    DESCRIPCIONES_DB = data.descripciones || [];
    descOrden        = shuffleDescArr(DESCRIPCIONES_DB.map(function(_,i){ return i; }));
  })
  .catch(function(e) { console.warn('No se cargó descripciones.json:', e); });

function shuffleDescArr(arr) {
  var a = arr.slice();
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ---- Iniciar ejercicio de descripciones ---- */
function initDescripciones() {
  descIdx = 0;
  cargarDescripcion();
}

function cargarDescripcion() {
  if (DESCRIPCIONES_DB.length === 0) {
    showToast('⏳ Cargando imágenes...');
    setTimeout(cargarDescripcion, 800);
    return;
  }

  if (descIdx >= descOrden.length) {
    descIdx = 0;
    descOrden = shuffleDescArr(DESCRIPCIONES_DB.map(function(_,i){ return i; }));
  }

  currentDesc = DESCRIPCIONES_DB[descOrden[descIdx]];

  // Imagen
  var img = document.getElementById('desc-img');
  if (img) {
    img.src = currentDesc.imagen;
    img.onerror = function() {
      img.style.display = 'none';
      var wrap = img.parentElement;
      if (wrap) {
        var placeholder = document.createElement('div');
        placeholder.style.cssText = 'height:180px;background:var(--gray-100);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px';
        placeholder.innerHTML = '<span style="font-size:40px">🖼️</span><span style="font-size:12px;color:var(--gray-400);font-family:var(--f)">Imagen no disponible aún</span>';
        wrap.insertBefore(placeholder, img);
      }
    };
  }

  setEl('desc-img-titulo', currentDesc.titulo);
  setEl('desc-counter', 'Descripción ' + (descIdx+1) + ' de ' + descOrden.length);

  // Limpiar
  var ta = document.getElementById('desc-textarea');
  if (ta) ta.value = '';
  setEl('desc-char-count', '0 caracteres');

  var fb = document.getElementById('desc-feedback');
  if (fb) fb.style.display = 'none';

  var nw = document.getElementById('desc-next-wrap');
  if (nw) nw.style.display = 'none';

  var sendBtn = document.querySelector('#s-descripciones .next-btn.bg-pink');
  if (sendBtn) sendBtn.style.display = 'block';
}

function updateDescCharCount() {
  var ta = document.getElementById('desc-textarea');
  if (!ta) return;
  setEl('desc-char-count', ta.value.length + ' caracteres');
}

/* ---- Contar oraciones ---- */
function contarOraciones(texto) {
  if (!texto.trim()) return 0;
  var matches = texto.match(/[^.!?]+[.!?]+/g);
  if (!matches) {
    // Si no hay puntuación, contar por saltos de línea también
    var lineas = texto.split('\n').filter(function(l){ return l.trim().length > 5; });
    return lineas.length;
  }
  return matches.length;
}

/* ---- Evaluar descripción ---- */
function enviarDescripcion() {
  var ta = document.getElementById('desc-textarea');
  if (!ta || !currentDesc) return;

  var texto = ta.value.trim();

  // Verificar mínimo 3 oraciones
  var numOraciones = contarOraciones(texto);
  if (numOraciones < 3) {
    var fb = document.getElementById('desc-feedback');
    fb.style.display = 'block';
    fb.innerHTML =
      '<div style="background:#FEF3C7;border-radius:12px;padding:14px;border:1.5px solid #FCD34D">' +
        '<div style="font-size:13px;font-weight:800;color:#92400E;margin-bottom:4px;font-family:var(--f)">✏️ Escribe al menos 3 oraciones</div>' +
        '<div style="font-size:12px;color:#B45309;font-family:var(--f);line-height:1.5">Has escrito ' + numOraciones + ' oración' + (numOraciones===1?'':'es') + '. Añade más detalles sobre lo que ves, los colores y cómo te hace sentir.</div>' +
      '</div>';
    return;
  }

  var textoLower = texto.toLowerCase();

  // Buscar palabras clave
  var encontradas = currentDesc.keywords.filter(function(kw) {
    return textoLower.indexOf(kw.toLowerCase()) !== -1;
  });

  // Buscar palabras bonus
  var bonusEncontradas = currentDesc.keywords_bonus.filter(function(kw) {
    return textoLower.indexOf(kw.toLowerCase()) !== -1;
  });

  var total = currentDesc.total_keywords;
  var pts   = encontradas.length * 2; // 2 pts por palabra clave
  var bonus = (encontradas.length === total) ? 10 : 0; // +10 si todas
  var ptsTotales = pts + bonus;

  // Guardar puntos
  awardPts(ptsTotales, 'lengua');
  recordResult('lengua', 'desc', encontradas.length >= Math.round(total * 0.6));

  // Palabras NO encontradas
  var noEncontradas = currentDesc.keywords.filter(function(kw) {
    return textoLower.indexOf(kw.toLowerCase()) === -1;
  });

  // Construir feedback
  var fb = document.getElementById('desc-feedback');
  fb.style.display = 'block';

  var colorHeader = ptsTotales >= pts * 0.7 ? '#16A34A' : '#D97706';
  var bgHeader    = ptsTotales >= pts * 0.7 ? '#DCFCE7' : '#FEF3C7';
  var borderHeader= ptsTotales >= pts * 0.7 ? '#16A34A' : '#F59E0B';

  var html = '<div style="background:' + bgHeader + ';border-radius:12px;padding:14px;border:1.5px solid ' + borderHeader + ';margin-bottom:10px">';
  html += '<div style="font-size:14px;font-weight:800;color:' + colorHeader + ';font-family:var(--f);margin-bottom:4px">';
  html += (bonus > 0 ? '🌟 ¡Perfecto, ' : '👍 ¡Bien, ') + (getNombre()||'campeona') + '! +' + ptsTotales + ' pts';
  if (bonus > 0) html += ' (incluye +10 de bonus)';
  html += '</div>';
  html += '<div style="font-size:12px;color:' + colorHeader + ';font-family:var(--f)">Has mencionado ' + encontradas.length + ' de ' + total + ' elementos clave.</div>';
  html += '</div>';

  // Palabras encontradas
  if (encontradas.length > 0) {
    html += '<div style="margin-bottom:10px">';
    html += '<div style="font-size:11px;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;font-family:var(--f)">Has mencionado ✓</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
    encontradas.forEach(function(kw) {
      html += '<span style="background:#DCFCE7;color:#166534;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;font-family:var(--f)">' + kw + '</span>';
    });
    html += '</div></div>';
  }

  // Palabras bonus encontradas
  if (bonusEncontradas.length > 0) {
    html += '<div style="margin-bottom:10px">';
    html += '<div style="font-size:11px;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;font-family:var(--f)">Palabras extra usadas 🎯</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
    bonusEncontradas.forEach(function(kw) {
      html += '<span style="background:#EDE9FE;color:#4C1D95;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;font-family:var(--f)">' + kw + '</span>';
    });
    html += '</div></div>';
  }

  // Palabras no encontradas
  if (noEncontradas.length > 0) {
    html += '<div style="margin-bottom:10px">';
    html += '<div style="font-size:11px;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px;font-family:var(--f)">Podrías haber mencionado</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:5px">';
    noEncontradas.forEach(function(kw) {
      html += '<span style="background:#FEE2E2;color:#991B1B;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;font-family:var(--f)">' + kw + '</span>';
    });
    html += '</div></div>';
  }

  fb.innerHTML = html;

  // Ocultar botón enviar y mostrar siguiente
  var sendBtn = document.querySelector('#s-descripciones .next-btn.bg-pink');
  if (sendBtn) sendBtn.style.display = 'none';

  var nw = document.getElementById('desc-next-wrap');
  if (nw) nw.style.display = 'block';

  updateSubjectUI('lengua');
}

function siguienteDescripcion() {
  descIdx++;
  cargarDescripcion();
}
