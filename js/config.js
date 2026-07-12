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
  },

  /* ---- Medallas ----
     Rangos por puntos totales. Para añadir uno nuevo, añade un objeto
     con {pts, icon, name, next, nn} — next/nn son el umbral y el nombre
     del SIGUIENTE rango (para mostrar el progreso hacia él). */
  medallas: [
    { pts: 0,    icon: '🎖️', name: 'Recién llegada',       next: 50,   nn: 'Soldado valiente' },
    { pts: 50,   icon: '🥉', name: 'Soldado valiente',     next: 300,  nn: 'Cabo heroico' },
    { pts: 300,  icon: '🥈', name: 'Cabo heroico',         next: 700,  nn: 'Sargento brillante' },
    { pts: 700,  icon: '🥇', name: 'Sargento brillante',   next: 1200, nn: 'Capitana estelar' },
    { pts: 1200, icon: '🏅', name: 'Capitana estelar',     next: 2000, nn: 'Generala suprema' },
    { pts: 2000, icon: '👑', name: 'Generala suprema',     next: 3500, nn: 'Emperadora galáctica' },
    { pts: 3500, icon: '🌟', name: 'Emperadora galáctica', next: 6000, nn: 'Reina del universo' },
    { pts: 6000, icon: '✨', name: 'Reina del universo',   next: null, nn: null }
  ],

  /* ---- Avatar: elementos desbloqueables por puntos totales ---- */
  avatar: {
    // Colores de pelo
    hairColors: [
      {color:'#2C1A0E', req:0},
      {color:'#8B4513', req:0},
      {color:'#D4A017', req:0},
      {color:'#FF6B6B', req:100},
      {color:'#FF8C00', req:150},
      {color:'#7C3AED', req:200},
      {color:'#4A90E2', req:300},
      {color:'#34D399', req:400},
      {color:'#EC4899', req:450}
    ],
    // Peinados
    hairstyles: [
      {label:'Liso corto',  req:0},
      {label:'Liso largo',  req:0},
      {label:'Rizado',      req:0},
      {label:'Trenzas',     req:50},
      {label:'Cola alta',   req:100}
    ],
    // Accesorios
    accessories: [
      {label:'Ninguno',        req:0,   icon:''},
      {label:'Diadema',        req:0,   icon:'💎'},
      {label:'Corona',         req:150, icon:'👑'},
      {label:'Sombrero',       req:250, icon:'🎩'},
      {label:'Orejas gatito',  req:350, icon:'🐱'},
      {label:'Arco iris',      req:500, icon:'🌈'}
    ]
  }

};
