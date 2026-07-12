# Design — Aprende y Juega

Guía rápida de qué colores, tipografía y componentes usar al tocar o añadir
pantallas. Todo vive en `css/base.css` (variables) y `css/components.css`
(componentes reutilizables).

---

## 1. Colores

### Paleta general (`css/base.css`)

| Variable | Valor | Uso |
|---|---|---|
| `--purple` | `#7C3AED` | Mates, Home, Padres, selección de curso |
| `--pink` | `#EC4899` | Lengua |
| `--teal` | `#0D9488` | Sciences |
| `--blue` | `#1D4ED8` | English |
| `--orange` | `#EA580C` | Utilitario general |
| `--green` / `--green-light` | `#16A34A` / `#DCFCE7` | Estados de acierto/éxito |
| `--red` / `--red-light` | `#DC2626` / `#FEE2E2` | Estados de fallo/error |
| `--amber` / `--amber-light` | `#D97706` / `#FEF3C7` | Avisos, "a mejorar" |
| `--gray-50` … `--gray-800` | escala de grises | Fondos, texto secundario, bordes |
| `--card-bg` | `#FFFFFF` | Fondo blanco estándar de tarjeta (usado en Vacaciones) |

Cada color de asignatura tiene su clase utilitaria: `.bg-purple`, `.bg-pink`,
`.bg-teal`, `.bg-blue`, `.bg-orange`, `.bg-amber`. Se usan en la cabecera
(`topbar`) de cada pantalla: `<div class="topbar bg-teal">...`.

### Colores propios de pantalla (no genéricos)

Sociales, Vacaciones y el Calendario usan un tono que no encaja con la
paleta general de arriba — están documentados aparte para no repetir el
mismo hex sin nombre en varios archivos:

| Variable | Valor | Uso | Clase |
|---|---|---|---|
| `--sociales` | `#0F6E56` | Sociales (topbar, progreso, calendario) | `.bg-sociales` |
| `--vacaciones` | `#F59E0B` | Vacaciones (topbar, botones, calendario) | `.bg-vacaciones` |
| `--calendario` | `#7F77DD` | Acento del Calendario dentro de la home | `.bg-calendario` |

⚠️ Antes de este documento, estos 3 colores estaban escritos como hex suelto
(`#0F6E56`, etc.) repetidos en más de 20 sitios entre HTML y JS, sin ninguna
variable que los uniera. Si tocas el color de una de estas tres pantallas,
cambia la variable en `base.css` — no busques y sustituyas el hex a mano.

### Al añadir una asignatura o pantalla nueva

1. Si el color que quieres ya existe en la paleta general → usa esa clase
   (`.bg-purple`, etc.), no escribas el hex a mano.
2. Si necesitas un color nuevo que no encaja en la paleta general → dale
   una variable propia en `base.css` (como `--sociales`, `--vacaciones`),
   no lo dejes como hex suelto en el HTML/JS.

---

## 2. Tipografía

Dos variables, ambas en `base.css`:

| Variable | Fuente | Uso |
|---|---|---|
| `--f` | Nunito | Títulos, números, badges, botones — todo lo que necesita peso/impacto |
| `--fb` | Nunito Sans | Texto de cuerpo, párrafos largos |

No hay una escala de tamaños formalizada (cada elemento define su
`font-size`/`font-weight` en línea). Los tamaños más habituales que verás
repetidos: `22-28px` / peso `900` para números grandes (puntos, %), `15-17px`
/ `800` para títulos de pantalla, `12-13px` / `600-700` para texto
secundario, `9-11px` / `700-800` para badges/pills.

---

## 3. Componentes reutilizables (`css/components.css`)

| Clase | Para qué sirve |
|---|---|
| `.card` | Tarjeta blanca básica con sombra |
| `.next-btn` | Botón de acción principal ("Siguiente", "Comprobar"...). El color de fondo se pasa por `style=""` con la variable de la asignatura (`style="background:var(--teal)"`) |
| `.numpad` / `.nk` / `.nk-del` / `.nk-ok` | Teclado numérico (Mates) |
| `.feedback` (`fb-ok` / `fb-err`) | Mensaje de acierto/fallo tras responder |
| `.slbl` | Etiqueta de sección en mayúsculas (ej. "PROGRESO POR ASIGNATURA") |
| `.medal-banner` | Banner de medalla/rango en la home |

### Botones: `.btn-primary` / `.btn-secondary`

| Clase | Para qué | Ejemplo |
|---|---|---|
| `.next-btn` / `.btn-primary` | Botón de acción principal (mismo componente, dos nombres — `.btn-primary` es el nombre a usar en código nuevo). El color de fondo se sigue pasando en línea según la asignatura | `<button class="btn-primary" style="background:var(--teal)">Comprobar</button>` |
| `.btn-secondary` | Botón secundario sobre fondo claro (Reintentar, Volver...) | `<button class="btn-secondary">← Volver</button>` |
| `.btn-secondary-dark` | Botón secundario sobre fondo oscuro/de color (ej. modales sobre `perfiles.html`) | `<button class="btn-secondary-dark">Cancelar</button>` |

⚠️ **No se ha hecho un repaso de todas las pantallas existentes** para
sustituir sus botones secundarios por estas clases nuevas — varios (en
`padres.html`, `perfiles.html`) tienen su propio estilo ligeramente distinto
(padding, radio de borde, color de fondo) y forzarlos a la clase compartida
habría cambiado su aspecto visual sin que lo pidieras explícitamente. Se
dejaron tal cual. Las clases nuevas están listas para:
- Cualquier botón nuevo que crees a partir de ahora.
- Ir migrando pantallas existentes una a una, cuando quieras, comprobando
  visualmente cada una (igual que hicimos con los colores).

No se migró ningún botón existente todavía: se probó con el "← Volver al
inicio" de los resultados de Vacaciones, pero la clase nueva tenía un
padding y un margen ligeramente distintos al original, así que se revirtió.
Antes de migrar un botón real, comprueba que `.btn-secondary` coincide
exactamente (padding, márgenes, radio) con el estilo que ya tenía.

---

## 4. Radios y sombras

| Variable | Valor |
|---|---|
| `--r-sm` / `--r-md` / `--r-lg` / `--r-xl` | `10px` / `14px` / `20px` / `28px` |
| `--sh-sm` / `--sh-md` | sombra suave / sombra media |
