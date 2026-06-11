/* =============================================
   SCIENCES-STUDY.JS — Estudio de contenidos
   ============================================= */

/* =============================================
   SCIENCES.JS — Study, Exercises & Mix
   ============================================= */

var SC = ExerciseState.sciences; /* alias */

function loadSciencesData(callback) {
  if (SubjectData.sciences) { callback(); return; }
  fetch('data/curso' + cursoActual + '/sciences.json')
    .then(function(r) { return r.json(); })
    .then(function(d) { SubjectData.sciences = d; callback(); })
    .catch(function(e) { showError('Sciences', e, function(){ loadSciencesData(function(){}); }, 's-sciences'); });
}

/* ---- STUDY ---- */
function renderSciencesStudy() {
  loadSciencesData(function() {
    var unit = SubjectData.sciences.units[0];
    var container = document.getElementById('sciences-study-container');
    if (!container) return;
    container.innerHTML = '';

    unit.topics.forEach(function(topic) {
      var card = document.createElement('div');
      card.style.cssText = 'margin:0 16px 10px;border-radius:16px;border:1.5px solid #99F6E4;background:white;overflow:hidden;cursor:pointer;transition:box-shadow .2s';

      var header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;';
      header.innerHTML =
        '<span style="font-size:26px">' + topic.emoji + '</span>' +
        '<div style="flex:1">' +
          '<div style="font-family:var(--f);font-weight:900;font-size:15px;color:#134E4A">' + topic.name + '</div>' +
          '<div style="font-size:11px;color:var(--gray-400);font-weight:600;margin-top:2px">' +
            topic.keyWords.map(function(k) {
              return '<span style="background:#F0FDFA;color:var(--teal);padding:1px 6px;border-radius:6px;font-weight:800;font-size:10px">' + k + '</span>';
            }).join(' ') +
          '</div>' +
        '</div>' +
        '<span style="font-size:16px;color:var(--gray-300);transition:transform .2s" class="study-arrow">▼</span>';

      var body = document.createElement('div');
      body.className = 'study-body';
      body.style.cssText = 'display:none;padding:0 16px 16px;border-top:1px solid #F0FDFA';
      body.innerHTML =
        '<div style="font-size:14px;color:#134E4A;line-height:1.7;font-weight:600;margin-top:12px">' + topic.definition + '</div>' +
        '<div style="font-size:13px;color:var(--gray-400);line-height:1.6;margin-top:8px">' + topic.extra + '</div>';

      var open = false;
      header.addEventListener('click', function() {
        // Cerrar todos los demás
        container.querySelectorAll('.study-body').forEach(function(b) { b.style.display = 'none'; });
        container.querySelectorAll('.study-arrow').forEach(function(a) { a.style.transform = ''; });
        container.querySelectorAll('.study-card').forEach(function(c) { c.style.boxShadow = ''; c.style.borderColor = '#99F6E4'; });

        open = !open;
        // Si el pulsado ya estaba abierto, queda cerrado; si no, se abre
        body.style.display = open ? 'block' : 'none';
        header.querySelector('.study-arrow').style.transform = open ? 'rotate(180deg)' : '';
        card.style.boxShadow = open ? '0 4px 16px rgba(20,184,166,.15)' : '';
        card.style.borderColor = open ? 'var(--teal)' : '#99F6E4';

        // Resetear el estado de los demás
        container.querySelectorAll('.study-open').forEach(function(el) {
          if (el !== card) el._open = false;
        });
      });
      card.classList.add('study-card');

      card.appendChild(header);
      card.appendChild(body);
      container.appendChild(card);
    });
  });
}

