# Aprende y Juega

PWA educativa para primaria (actualmente 3º), con gamificación (puntos, medallas,
rachas, avatar personalizable) en cinco asignaturas — Matemáticas, Lengua,
Sciences, English y Sociales — más un modo transversal de repaso, **Vacaciones**.

- **Demo:** https://israelreyes-gif.github.io/aprende-y-juega
- **Stack:** HTML/CSS/JS vanilla (sin build ni framework) + Cloudflare Workers/D1 como API

---

## 1. Estructura del proyecto

```
index.html          Carga de todos los <script>, en orden de dependencia
sw.js                Service Worker (cache offline)
config.js            Configuración central (ver sección 5)

css/
  base.css           Variables (colores, fuentes) y utilidades
  components.css     Componentes reutilizables (tarjetas, botones, numpad...)
  screens.css        Cabeceras y estructura de pantallas

screens/             Fragmentos HTML, uno por asignatura/zona.
                     Se cargan con fetch() al arrancar (críticos) o bajo
                     demanda (lazy) — ver SCREENS_CRITICAL/SCREENS_LAZY en app.js

js/
  storage.js         Persistencia (Cloudflare D1). ÚNICA fuente de verdad del progreso.
  stats.js           Cálculo de estadísticas — nadie más debe calcular % a mano.
  app.js             Arranque: carga de pantallas → carga de datos → init
  navigation.js       Navegación entre pantallas (go(), lazy loading)
  ui.js              Helpers de UI genéricos (setEl, setBar, diffLabel...)
  medals.js          Sistema de medallas
  avatar.js          Avatar personalizable

  engine-base.js             Utilidades compartidas por los 5 motores genéricos
  engine-multiple-choice.js  Motor: opción múltiple (Sciences, English To Be/Modals...)
  engine-matching.js         Motor: relacionar/emparejar columnas
  engine-mates.js            Motor: dígitos / opciones / teclado libre (Mates)
  engine-vocab.js            Motor: vocabulario imagen↔palabra (English)
  engine-word-order.js       Motor: ordenar palabras (English)

  <asignatura>-study.js      Pantallas de "estudiar" (si la asignatura las tiene)
  <asignatura>-exercises.js  Pantallas de ejercicios de esa asignatura

  vacaciones-core.js         Vacaciones: pool de ejercicios, muestreo equilibrado,
                              dispatcher, resultados
  vacaciones-exercises.js    Vacaciones: un "loader" por cada tipo de ejercicio

  padres.js          Zona de padres (estadísticas, gestión de perfiles)
  perfiles.js        Selección/creación de perfiles de niños

data/
  curso3/            Todo el contenido educativo de 3º, en JSON
    ejercicios-mates.json
    ejercicios-gram.json
    historias.json
    sciences.json
    english.json
    english-vocab.json
    sociales.json
    sociales-ejercicios.json
    descripciones.json
    imagenes/
```

El **Worker de Cloudflare** (la API, `aprende-y-juega-api.israel-reyes.workers.dev`)
vive en un proyecto/repo aparte — no está en este repositorio.

---

## 2. Motores genéricos vs. ejercicios manuales

Casi todas las asignaturas usan uno de los 5 motores genéricos (`engine-*.js`)
para no repetir la lógica de "mostrar pregunta → validar → 2º intento →
mostrar solución → guardar progreso" en cada asignatura.

Lo que **sí** comparten los 5 motores (vive en `engine-base.js`):
- `engineSaveProgress(config, correct, firstAttempt)` — registra el resultado
  y otorga los puntos.
- `engineUpdateBadge(prefix, config, idx, total)` — badge "Pregunta X de Y",
  barra de progreso y badge de dificultad.

Lo que **no** se comparte (cada motor lo implementa a su manera, porque la UI
es demasiado distinta): mostrar la pregunta, validar la respuesta, mostrar la
solución al fallar.

Cada motor espera un objeto `config` con, como mínimo:

```js
{
  queue:       [...],          // cola de ejercicios
  idx:         0,
  prefix:      'algo-ex',       // prefijo de los IDs en el HTML (ej. 'sciences-ex')
  subjectKey:  'sciences',      // clave en ST (storage.js)
  exerciseKey: 'sciences-mix',  // clave para las estadísticas (stats.js)
  ptsFirst:    10,
  ptsSecond:   5,
  onCorrect:   function(firstAttempt) { ... },  // opcional
  onWrong:     function() { ... }                // opcional
}
```

⚠️ **Importante:** si una pantalla nueva reutiliza un motor genérico pero con
sus propios IDs de HTML (como hace Vacaciones), asegúrate de que el `prefix`
que pasas coincide EXACTAMENTE con los IDs reales del HTML (`prefix + '-fb'`,
`prefix + '-next'`, `prefix + '-opts'`, etc.). La mayoría de bugs de
integración de Vacaciones con los motores han sido por este motivo.

---

## 3. Cómo añadir una asignatura nueva

1. Crea `data/curso{N}/<asignatura>.json` con el contenido.
2. Crea `js/<asignatura>-exercises.js` (y `-study.js` si aplica), reutilizando
   el motor genérico que mejor encaje (opción múltiple, relacionar, etc.).
   Solo escribe una pantalla desde cero si de verdad no encaja en ninguno.
3. Añade la pantalla en `screens/<asignatura>.html` y regístrala en
   `SCREENS_LAZY`/`loadScreenLazy` (`app.js`).
4. Añade la asignatura a `STATS_SUBJECTS` en `stats.js` (clave, nombre, icono,
   color e items con sus `exerciseKey`) — sin esto no aparecerá en
   estadísticas, zona de padres ni en el reparto de Vacaciones.
5. Añade la clave a `defaultState()` y a los arrays de asignaturas en
   `storage.js` (`mergeState`, `checkDayReset`, `saveState`) — y a la petición
   `POST /progreso` del Worker.
6. Si quieres que aparezca en Vacaciones, añade su pool de ejercicios en
   `_vacGetExerciseTypes()` (`vacaciones-core.js`) y su loader en
   `vacaciones-exercises.js`.

## 4. Cómo añadir un curso nuevo (ej. 4º)

1. Crea `data/curso4/` con el mismo conjunto de archivos que `data/curso3/`.
2. Todo el código ya carga desde `data/curso' + cursoActual + '/...'`, así que
   no hace falta tocar rutas.
3. Añade la opción en la pantalla de selección de curso (`screens/cursos.html`,
   donde hoy solo el curso 3 tiene `onclick="seleccionarCurso(3)"` activo; el
   resto muestran una pantalla "próximamente").
4. Decide cómo se asigna el curso a cada perfil (¿automático por fecha?,
   ¿manual desde la zona de padres?) — hoy `CONFIG.curso.porDefecto` siempre
   fuerza el curso 3 tras elegir perfil (`navigation.js`, `perfiles.js`).

## 5. Configuración central (`config.js`)

Valores ajustables sin tocar lógica: umbral de "a reforzar", umbrales de
dificultad por racha, curso por defecto. Se explica qué significa cada uno
en los comentarios del propio archivo.

## 6. Convenciones importantes

- **Claves de error:** siempre `asignatura-ejercicio` (ej. `sciences-invertebrates`,
  `english-tobe`). Debe coincidir entre `stats.js`, el motor/pantalla que
  registra el resultado, y `padres.js`.
- **Cache-busting:** todos los `<script>` y `<link>` en `index.html` llevan
  `?v=<timestamp>`. Al desplegar un cambio, actualiza ese número (todos a la
  vez) o el navegador puede servir versiones antiguas en caché.
- **Iconos:** siempre emoji, nunca librerías de iconos (dan problemas en esta
  app). Excepción: la bandera de Reino Unido, que **siempre** va como SVG
  inline (`UK_FLAG_SMALL` en `stats.js`), nunca como emoji 🇬🇧 (se renderiza
  como texto "GB" en algunos sistemas).
