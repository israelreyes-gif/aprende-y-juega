/* =============================================
   ENGINE-BASE.JS — Utilidades compartidas por los
   5 motores genericos (MC, Matching, Mates, Vocab,
   Word Order).

   IMPORTANTE: esto NO es un motor en si mismo. Cada
   motor sigue teniendo su propia forma de:
     - mostrar la pregunta
     - validar la respuesta
     - mostrar la solucion al fallar
   porque la UI de cada uno es muy distinta (botones
   de texto, pares para relacionar, teclado numerico,
   imagenes, palabras para ordenar...) y forzar una
   unica implementacion ahi haria el codigo mas dificil
   de leer, no mas simple.

   Lo que SI es identico en los 5 motores, y por eso
   vive aqui:
     - guardar el resultado (recordResult/awardPts)
     - actualizar el badge de "Pregunta X de Y", la
       barra de progreso y el badge de dificultad
   ============================================= */

/* ---- Puntos segun el intento (1er intento vs 2o) ---- */
function engineCalcPts(config, firstAttempt) {
  var p = configGetPts(config.exerciseKey || config.subjectKey);
  return firstAttempt ? p.primero : p.segundo;
}

/* ---- Guardar el resultado de un intento ----
   Registra el acierto/fallo y, si es acierto, otorga los puntos.
   Devuelve los puntos otorgados (0 si ha fallado).

   NO llama a config.onCorrect/onWrong: cada motor decide cuándo
   invocar esos hooks (algunos necesitan pasar datos extra, como
   qué opción se seleccionó), así que eso se queda en cada motor. */
function engineSaveProgress(config, correct, firstAttempt) {
  recordResult(config.subjectKey, config.exerciseKey || config.subjectKey, correct);
  if (!correct) return 0;
  var pts = engineCalcPts(config, firstAttempt);
  awardPts(pts, config.subjectKey);
  return pts;
}

/* ---- Actualizar badge "Pregunta X de Y", barra de progreso y
   badge de dificultad (segun la racha actual). Usado por los
   motores que tienen este tipo de cabecera: MC, Vocab, Word Order. ---- */
function engineUpdateBadge(prefix, config, idx, total) {
  setEl(prefix + '-badge', (config.badgeLabel || 'Question') + ' ' + (idx + 1) + ' of ' + total);
  setBar(prefix + '-prog', Math.round(idx / total * 100));

  var streak = (ST[config.subjectKey] && ST[config.subjectKey].streak) || 0;
  var diff = diffLabel(streak);
  var diffEl = document.getElementById(prefix + '-diff');
  if (diffEl) { diffEl.textContent = diff.txt; diffEl.className = 'ex-badge ' + diff.cls; }
}
