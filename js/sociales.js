/* =============================================
   SOCIALES.JS — Asignatura de Sociales
   ============================================= */

var SOC_DATA = null;
var socUnit = null;
var socSection = null;
var socOpenItem = null;
var socOpenSub = null;

function loadSocialesData(callback) {
  if (SOC_DATA) { callback(); return; }
  fetch('data/curso' + cursoActual + '/sociales.json')
    .then(function(r) { return r.json(); })
    .then(function(data) { SOC_DATA = data; callback(); })
    .catch(function(e) { console.warn('Error cargando sociales:', e); });
}

/* ---- Menú principal de sociales ---- */
function renderSocialesMenu() {
  loadSocialesData(function() {
    var grid = document.getElementById('sociales-units-grid');
    if (!grid) return;
    grid.innerHTML = '';
    SOC_DATA.units.forEach(function(unit) {
      var card = document.createElement('div');
      card.className = 'mode-card';
      card.innerHTML =
        '<div style="font-size:32px;margin-bottom:6px"><i class="ti ' + unit.icon + '" style="font-size:32px;color:' + unit.color + '"></i></div>' +
        '<div class="mode-name">' + unit.title + '</div>' +
        '<div class="mode-sub">' + unit.sections.length + ' apartados</div>';
      card.addEventListener('click', (function(u) {
        return function() {
          socUnit = u;
          socSection = u.sections[0].id;
          socOpenItem = null;
          socOpenSub = null;
          go('s-sociales-study-unit');
          renderSocialesUnit();
        };
      })(unit));
      grid.appendChild(card);
    });
  });
}

/* ---- Vista de unidad con acordeón ---- */
function renderSocialesUnit() {
  if (!socUnit) return;
  setEl('sociales-unit-title', socUnit.title);

  // Render tabs de secciones
  var tabsEl = document.getElementById('sociales-section-tabs');
  if (tabsEl) {
    tabsEl.innerHTML = '';
    socUnit.sections.forEach(function(sec) {
      var btn = document.createElement('button');
      btn.style.cssText = 'padding:5px 12px;border-radius:20px;border:0.5px solid var(--gray-200);font-family:var(--f);font-size:12px;cursor:pointer;transition:all .15s;white-space:nowrap;' +
        (sec.id === socSection
          ? 'background:' + socUnit.color + ';color:white;border-color:' + socUnit.color
          : 'background:white;color:var(--gray-500)');
      btn.textContent = sec.label;
      btn.addEventListener('click', (function(sid) {
        return function() {
          socSection = sid;
          socOpenItem = null;
          socOpenSub = null;
          renderSocialesUnit();
        };
      })(sec.id));
      tabsEl.appendChild(btn);
    });
  }

  // Render contenido de la sección activa
  var sec = socUnit.sections.find(function(s) { return s.id === socSection; });
  if (!sec) return;

  var area = document.getElementById('sociales-unit-content');
  if (!area) return;
  area.innerHTML = '';

  // Descripción de la sección
  var intro = document.createElement('p');
  intro.style.cssText = 'font-family:var(--f);font-size:13px;color:var(--gray-500);margin:0 0 8px';
  intro.textContent = sec.desc;
  area.appendChild(intro);

  // Items acordeón
  sec.items.forEach(function(item) {
    var isOpen = socOpenItem === item.id;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'border:0.5px solid var(--gray-100);border-radius:12px;overflow:hidden;margin-bottom:8px';

    // Botón principal
    var btn = document.createElement('button');
    btn.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 14px;background:white;border:none;cursor:pointer;text-align:left;transition:background .15s';
    btn.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="width:34px;height:34px;border-radius:8px;background:' + socUnit.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
          '<i class="ti ' + item.icon + '" style="font-size:17px;color:' + socUnit.color + '"></i>' +
        '</div>' +
        '<div>' +
          '<div style="font-family:var(--f);font-size:13px;font-weight:700;color:var(--gray-800)">' + item.label + '</div>' +
          '<div style="font-family:var(--f);font-size:11px;color:var(--gray-400);margin-top:2px;line-height:1.4">' + item.desc + '</div>' +
        '</div>' +
      '</div>' +
      '<i class="ti ' + (isOpen ? 'ti-chevron-up' : 'ti-chevron-down') + '" style="font-size:16px;color:var(--gray-400);flex-shrink:0"></i>';
    btn.addEventListener('click', (function(id) {
      return function() {
        socOpenItem = socOpenItem === id ? null : id;
        socOpenSub = null;
        renderSocialesUnit();
      };
    })(item.id));
    wrap.appendChild(btn);

    // Subtemas (si abierto)
    if (isOpen) {
      var inner = document.createElement('div');
      inner.style.cssText = 'padding:8px 10px;display:flex;flex-direction:column;gap:6px;border-top:0.5px solid var(--gray-100);background:var(--gray-50)';

      item.subs.forEach(function(sub) {
        var subId = item.id + '-' + sub.label;
        var isSubOpen = socOpenSub === subId;

        var subWrap = document.createElement('div');
        subWrap.style.cssText = 'border:0.5px solid var(--gray-100);border-radius:10px;overflow:hidden;background:white';

        var subBtn = document.createElement('button');
        subBtn.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:100%;padding:9px 12px;background:' + (isSubOpen ? 'var(--gray-50)' : 'white') + ';border:none;cursor:pointer;text-align:left';
        subBtn.innerHTML =
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<i class="ti ' + sub.icon + '" style="font-size:15px;color:' + socUnit.color + '"></i>' +
            '<span style="font-family:var(--f);font-size:12px;font-weight:700;color:var(--gray-700)">' + sub.label + '</span>' +
          '</div>' +
          '<i class="ti ' + (isSubOpen ? 'ti-chevron-up' : 'ti-chevron-down') + '" style="font-size:13px;color:var(--gray-400)"></i>';
        subBtn.addEventListener('click', (function(sid) {
          return function() {
            socOpenSub = socOpenSub === sid ? null : sid;
            renderSocialesUnit();
          };
        })(subId));
        subWrap.appendChild(subBtn);

        if (isSubOpen) {
          var subContent = document.createElement('div');
          subContent.style.cssText = 'padding:8px 12px;font-family:var(--f);font-size:12px;color:var(--gray-600);line-height:1.6;border-top:0.5px solid var(--gray-100)';
          subContent.textContent = sub.text;
          subWrap.appendChild(subContent);
        }
        inner.appendChild(subWrap);
      });
      wrap.appendChild(inner);
    }
    area.appendChild(wrap);
  });
}
