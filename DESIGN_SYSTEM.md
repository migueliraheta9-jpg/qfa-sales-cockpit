# Sistema visual — QFA Sales Cockpit

Este documento registra las reglas **estructurales** adoptadas del sistema de diseño
"Nocturne" (canvas de Claude Design, `QFA Sales Cockpit.dc.html`). Se adoptó la
estructura (escalas, reglas de contraste, criterio de elevación y botones);
**no se adoptó su paleta de colores**. La identidad visual de QFA
(`lib/constants.js`) manda.

## Paleta — roles, hex y significado semántico

| Rol | Hex | Cambió | Uso / significado |
|---|---|---|---|
| `bg` | `#0A0A0A` | No | Fondo base de toda la app |
| `bgLight` | `#141414` | No | Cards, superficies elevadas |
| `bgLighter` | `#1F1F1F` | No | Superficies internas (solo Cockpit) |
| `border` | `#2A2A2A` | No | Bordes 1px, divisores |
| `white` | `#F5F5F5` | No | Texto primario |
| `muted` | `#A0A0A0` | **Sí** (antes `#7A7A7A`) | Texto secundario. Gris neutro puro, sin tinte — se aclaró para cumplir contraste (ver más abajo) |
| `mutedDim` | `#555555` | No | **Reservado a elementos NO textuales**: bordes, separadores decorativos, iconografía atenuada. No usar como color de texto (no pasa ni 4.5:1 en ningún fondo del sitio) |
| `cyan` | `#4DC7F6` | No | Identidad de mercado (Miguel: Futuros/Forex/Acciones) y estado `in-progress` en `StatusBadge` |
| `lavanda` | `#C890D1` | No | Identidad de mercado (Jessen: Índices sintéticos) y estado "tibio" |
| `orange` | `#F78E0E` | No (uso acotado) | **Estado de advertencia/énfasis**: lead caliente, timer sobre tiempo, campos críticos, cuello de botella, bloque de oferta. Ya no se usa para error ni para acciones destructivas (ver Fase 1C) |
| `green` | `#61F1AC` | No | Éxito, confirmación, cerrado-ganado |
| `fail` | `#FF7878` | **Nuevo** | **Estado de error / acción destructiva**: fallos de conexión, borrar, descalificar. Derivado en HSL(0°,100%,73.5%) — mismo criterio de vibrancia que el resto de la paleta sobre `bg` negro, no es el `#E0736F` de Nocturne |

### Cuándo se usa cada color semántico

- **`orange` = advertencia / énfasis.** Algo necesita atención pero no es un error:
  lead caliente (`hot`), un timer corriendo (sobre tiempo, bono por vencer), un
  campo marcado crítico, el cuello de botella del diagnóstico, el bloque de oferta.
- **`fail` = error / acción destructiva.** Algo falló o la acción es irreversible:
  errores de conexión/login, borrar una sesión, el botón "Borrar" de un diálogo de
  confirmación.
- **`green` = éxito / confirmación.** Una acción se completó o un estado es positivo.
- **`cyan` / `lavanda`** son primero identidad de mercado/cofundador; su reuso como
  color de estado (`in-progress`, "tibio") es una colisión heredada, reportada más
  abajo, no resuelta en esta fase.

## Escala tipográfica

Adaptada de los 6 niveles de Nocturne a Manrope / Instrument Serif / JetBrains Mono
(no son los px de Nocturne copiados — se calibraron contra lo que ya usan los
componentes, para no crear un segundo sistema de tamaños en paralelo):

| Token (`tailwind.config.js`) | Tamaño | Line-height | Rol Nocturne equivalente | Ya usado como |
|---|---|---|---|---|
| `text-kicker` | 10px | 1 (tracking .14em, weight 600) | 10/600 kicker | `text-[10px]` (~30 usos) |
| `text-body` | 14px | 1.6 | 13/400 cuerpo interno | `text-sm` |
| `text-h3` | 18px | 1.3 | 17/500 cuerpo cliente | `text-lg` |
| `text-h2` | 24px | 1.2 | 24/500 h2 / mínimo en video | `text-2xl` |
| `text-h1` | 36px | 1.15 | 34/500 h1 pantalla compartida | `text-4xl`/`text-5xl` |
| `text-display` | `clamp(48px,6vw,80px)` | 1.05 | 56/500 display hero | el `clamp()` que ya usa `Diagnostico.jsx` |

Estos tokens quedaron agregados en `tailwind.config.js` (`theme.extend.fontSize`).
**No se reemplazó ninguna clase existente en los componentes** — eso queda como
adopción gradual, fuera del alcance de esta fase.

## Espaciado

Se adopta la escala 4px nativa de Tailwind tal cual (no requirió cambios en config).
Convención de uso (regla, no código):
- Interno (Cockpit/Dashboard): paddings 2–3 (8–12px), filas de 32px.
- Cliente (reporte público, `/r/[id]`): paddings 6–16 (24–64px), separación entre
  secciones de 16(64px) o 24(96px).

## Radios

- `4px` — controles pequeños, inputs.
- `8px` (`rounded-lg`, ya existe en Tailwind default) — cards, botones.
- `14px` — superficies grandes tipo card destacada (Tailwind default `2xl` es 16px,
  no 14px; no se agregó un token custom porque ningún ítem pidió tocar `borderRadius`).

## Regla de elevación

Borde de 1px + **una** sombra ambiental, nunca sombras apiladas. **Auditoría: el
repo no usa `box-shadow`/`boxShadow` en ningún lado** (ni inline ni como clase
`shadow-*` de Tailwind) — la elevación hoy se logra solo por contraste de fondo
entre `bg`/`bgLight`/`bgLighter` y bordes de 1px. La regla se cumple trivialmente
porque no hay nada que "desapilar". Queda documentada para cuando se introduzcan
sombras en el futuro.

## Sistema de botones — criterio aplicado

Regla adoptada de Nocturne: **acción primaria o secundaria = contorno** (fondo
transparente, borde 1px del color del rol, texto del mismo color); **relleno
sólido se reserva exclusivamente para acciones destructivas** (`fail`). No se
tocaron los colores de cada botón, solo el tratamiento sólido→contorno.

No entran en esta regla los controles de selección (chips multi-select, tabs de
filtro, segmented controls) — Nocturne los trata como categoría aparte (`.seg`,
no `.btn`), y el repo ya los resuelve así (`Dashboard.jsx` filtro de estado,
`Cockpit.jsx` chips de opciones múltiples): opción activa = relleno, el resto
transparente. Tampoco los botones de solo-ícono con fondo tenue (`color + '15'`,
p. ej. abrir/borrar en `Dashboard.jsx`), que ya seguían el patrón atenuado propio
del repo.

Botones convertidos a contorno (color sin cambios, solo el tratamiento):
`app/page.jsx` (Cerrar sesión), `LoginScreen.jsx:47` (Google), `Dashboard.jsx`
(Nueva Sesión), `Diagnostico.jsx` (CTA WhatsApp), `Dialogs.jsx` (Confirmar),
`Cockpit.jsx` (Copiar script, Pantalla cliente, Cerrar, Copiar link).

Quedan sólidos (correcto, son destructivos): `Dialogs.jsx` (Borrar, ahora `fail`).

## Tabla WCAG — ratios medidos (final)

Metodología: relative luminance (WCAG 2.x) calculada con precisión (Node), no
estimada. Reglas adoptadas: **ningún par por debajo de 4.5:1** en todo el sitio;
**mínimo 7:1** en `ClientScreen.jsx` y en `/r/[id]` (se comparten por videollamada
comprimida). Confirmado por grep que esas dos pantallas solo usan `bg`/`bgLight`
como fondo — `bgLighter` no aparece ahí, solo en `Cockpit.jsx` (interno).

| Texto | Fondo | Ratio | ¿Pasa 4.5:1? | ¿Pasa 7:1? |
|---|---|---|---|---|
| `white` | `bg` | 18.16:1 | Sí | Sí |
| `white` | `bgLight` | 16.90:1 | Sí | Sí |
| `white` | `bgLighter` | 15.12:1 | Sí | Sí |
| `muted` (nuevo `#A0A0A0`) | `bg` | 7.57:1 | Sí | Sí |
| `muted` | `bgLight` | 7.04:1 | Sí | Sí |
| `muted` | `bgLighter` | 6.30:1 | Sí | No (no aplica, `bgLighter` no se usa en pantallas de regla estricta) |
| `mutedDim` (sin cambios — uso restringido a no-texto) | `bg` | 2.66:1 | No aplica (no es texto) | No aplica |
| `mutedDim` | `bgLight` | 2.47:1 | No aplica | No aplica |
| `mutedDim` | `bgLighter` | 2.21:1 | No aplica | No aplica |
| `cyan` | `bg` | 10.20:1 | Sí | Sí |
| `cyan` | `bgLight` | 9.49:1 | Sí | Sí |
| `cyan` | `bgLighter` | 8.49:1 | Sí | Sí |
| `lavanda` | `bg` | 7.89:1 | Sí | Sí |
| `lavanda` | `bgLight` | 7.34:1 | Sí | Sí |
| `lavanda` | `bgLighter` | 6.57:1 | Sí | No (no aplica, ídem) |
| `orange` | `bg` | 8.33:1 | Sí | Sí |
| `orange` | `bgLight` | 7.75:1 | Sí | Sí |
| `orange` | `bgLighter` | 6.93:1 | Sí | No (no aplica, ídem) |
| `green` | `bg` | 13.85:1 | Sí | Sí |
| `green` | `bgLight` | 12.88:1 | Sí | Sí |
| `green` | `bgLighter` | 11.53:1 | Sí | Sí |
| `fail` | `bg` | 7.74:1 | Sí | Sí |
| `fail` | `bgLight` | 7.20:1 | Sí | Sí |
| `fail` | `bgLighter` | 6.44:1 | Sí | No (no aplica, ídem) |

**Pares invertidos** (texto `bg` sobre botón sólido de color — mismo ratio que el
par directo por simetría): `bg`/`white` 18.16:1, `bg`/`cyan` 10.20:1, `bg`/`lavanda`
7.89:1, `bg`/`orange` 8.33:1, `bg`/`green` 13.85:1, `bg`/`fail` 7.74:1 — todos
pasan ambas reglas. (Nota: ya casi no quedan botones con fill sólido de color —
ver sistema de botones — así que estos pares invertidos hoy solo aplican al
botón "Borrar".)

**Las 12 combinaciones fondo/texto ya no tienen violaciones activas.** Las dos
que existían (`muted` y `mutedDim`) se resolvieron en Fase 1B: `muted` se aclaró,
`mutedDim` se reclasificó como no-textual y su único uso de texto real
(`LoginScreen.jsx:64`) pasó a `muted`.

## Colisiones de color reportadas (sin resolver por decisión propia)

1. **Mercado vs. estado, general.** Cada acento de identidad de mercado duplica
   como color de estado semántico:
   - `cyan` (Miguel: Futuros/Cripto/Forex/Acciones) = también estado `in-progress` en
     `StatusBadge` (`Shared.jsx`).
   - `lavanda` (Jessen: Índices sintéticos) = también estado "tibio"/`warm`.
2. **`MERCADO_COFOUNDER.Cripto` pasó a Miguel y usa `COLORS.cyan`** (decisión de
   Miguel, 13 nov 2026). Cripto ya no usa `orange` como color de mercado, así
   que desaparece esa colisión con "caliente"/advertencia; le aplica la misma
   colisión general de `cyan` descrita en el punto 1.
3. **`Dialogs.jsx` (línea de aviso del timer de bono de 48h, dentro de
   `CloseDialog`)** no se migró a `fail` aunque estaba en la lista — no es un
   error ni una acción destructiva, es un aviso informativo/de énfasis sobre un
   plazo que empieza a correr (misma naturaleza que el indicador de bono por
   vencer en `Dashboard.jsx`, que tampoco se tocó). Quedó en `orange`. Se lista
   en vez de decidirse.
