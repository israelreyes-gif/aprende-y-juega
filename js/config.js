/* =============================================
   CONFIG.JS — Configuracion central de la app
   Valores ajustables sin tener que tocar la logica
   del resto del codigo.

   IMPORTANTE: este archivo debe cargarse ANTES que
   cualquier otro script en index.html, porque el
   resto del codigo lee estos valores en tiempo de
   ejecucion (CONFIG.progreso.umbralRefuerzo, etc.)
   ============================================= */

var CONFIG = {

  /* ---- Progreso / estadisticas ---- */
  progreso: {
    // Porcentaje de acierto por debajo del cual un ejercicio se
    // considera "a reforzar" y se colorea en naranja/rojo en vez
    // de en verde (zona de padres, home, Vacaciones).
    umbralRefuerzo: 75
  },

  /* ---- Dificultad mostrada segun la racha de aciertos seguidos ---- */
  dificultad: {
    rachaParaMedio:   5,   // a partir de esta racha se muestra "Medio"
    rachaParaDificil: 10   // a partir de esta racha se muestra "Dificil"
  },

  /* ---- Curso ---- */
  curso: {
    // Curso que se carga por defecto al elegir un perfil.
    // Cuando se prepare 4o de Primaria, aqui es donde se decidira
    // cual es el curso activo de cada perfil (por ahora siempre 3).
    porDefecto: 3
  },

  /* ---- Vacaciones ---- */
  vacaciones: {
    // Numero de ejercicios que componen cada sesion de repaso de Vacaciones.
    ejerciciosPorSesion: 20
  }

};
