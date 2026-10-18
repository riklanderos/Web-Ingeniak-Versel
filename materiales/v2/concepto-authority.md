# Concepto v2 · FOLIO — Autoridad editorial

> Ángulo: **autoridad editorial**. Gravitas de consultoría, tipografía editorial enorme, prueba con datos en primera plana, casos como reportajes de revista, retratos cinematográficos fundidos en azul oscuro y movimiento sobrio pero contundente.
> Stack fijo: Astro SSG + GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG, MorphSVG, ScrambleText; todos gratuitos desde 3.13) + Lenis 1.3.11, en Vercel.
> Insumos: `A-sitio-actual.md`, `B-referencias.md`, `C-benchmark.md`, `D-arquitectura.md` (+ `D-sitemap.json`, `D-navegacion.json`) y la receta aprobada de Magnific `materiales/magnific/v2/RECETA.md`.

**Prueba construida (no solo descrita):**

| Archivo | Qué demuestra |
|---|---|
| [`concepto-authority-portada-1440.jpg`](concepto-authority-portada-1440.jpg) | La portada de Inicio terminada, a 1440×900, con el hero aprobado (`magnific/v2/hero-home-desk-2x.jpg`): titular gigante, sumario de cifras, pie de foto con dato y CTA, todo sobre **una sola imagen** |
| [`concepto-authority-storyboard.jpg`](concepto-authority-storyboard.jpg) | 4 cuadros de la animación firma "Registro", que termina en la portada real |
| [`concepto-authority-responsive.jpg`](concepto-authority-responsive.jpg) | Tablet vertical 1024×1366, celular 390×844 (plano vertical `hero-home-movil-d.png`) y escritorio bajo 1280×720 |
| [`concepto-authority-prototipo.html`](concepto-authority-prototipo.html) | El prototipo HTML/CSS. Se abre desde esta carpeta. Con `?f=1`, `?f=2` o `?f=3` muestra los cuadros de la intro |

---

## 0. Ficha del concepto

**Nombre:** **FOLIO**. En una revista, el folio es el número de página. En una empresa, es el número de expediente. El sitio de Ingeniak se trata como una **publicación de negocios permanente**: cada una de las 45 páginas es un folio numerado, cada portada es una plana compuesta como una revista y cada caso es un reportaje.

**La idea en una frase:** Ingeniak deja de verse como "agencia con robot" y se presenta como la **publicación de referencia sobre IA aplicada a negocios en LATAM**. Kain o una persona del sector posa como sujeto de portada dentro de una sola imagen a sangre, el titular se imprime sobre la misma luz, y cada cifra va en primera plana con su fuente.

**Por qué gana frente a ingeniak.mx y frente a la v1:**

1. **El requisito del cliente se vuelve el lenguaje del sitio, no un componente.** En una portada de revista el sujeto y el titular *siempre* son una sola pieza; nadie pone la foto en una caja y el texto en otra. FOLIO compone cada sección texto + imagen así. La prueba de 1440 lo muestra con el hero aprobado.
2. **Autoridad sin humo.** La v1 tenía las cifras correctas pero "sin teatro". El actual tiene teatro pero cifras sin confirmar. FOLIO pone en escena las cifras confirmadas: sumario de portada, cifras gigantes, notas al pie con fuente y "Nota del editor" cuando un sector aún no tiene caso propio.
3. **Estructura que se *ve*.** 45 páginas con folio, índice general (⌘K), colofón-mapa y reportajes enlazados entre sí. La amplitud se percibe como "empresa grande", que es lo que el cliente llamó "más estructura".

### 0.1 Vocabulario del sistema (revista → componente web)

| Término editorial | Qué es en el sitio | Componente Astro |
|---|---|---|
| **Portada** | Hero cinematográfico de cada página (imagen = sección) | `Scene` con `variant="portada"` |
| **Folio** | Número fijo de cada página (001, 102, 301…) y cabecera corrida con migas | `Folio` |
| **Sumario** | 3 líneas de portada con cifra confirmada y folio del caso | `CoverLines` |
| **Pie de foto (Fig.)** | Chip de cristal anclado al sujeto con un dato y una línea guía | `Caption` |
| **Entradilla** | Párrafo citable de 40–60 palabras (AEO) | `Standfirst` / `Definition` |
| **Reportaje** | Caso de estudio | plantilla `T-CASE` |
| **Perfil** | Kain contado como entrevista | `Profile` |
| **Directorio** | Equipo como "staff" de revista | `Masthead` |
| **Índice** | Mega menú y overlay ⌘K con las 45 páginas | `MegaIndex`, `IndexOverlay` |
| **Nota del editor** | Aviso de que una cifra viene de otro sector | `EditorNote` |
| **Fe de datos** | Nota al pie con fuente y fecha de cada cifra | `Fn` + `/casos/#como-medimos` |
| **Contraportada** | Cierre cinematográfico con Discovery | `Scene variant="contraportada"` |
| **Colofón** | Footer como índice general con folios | `Colophon` |

### 0.2 Numeración de folios (campo nuevo `folio` en `sitemap.json`)

| Bloque | Folios |
|---|---|
| Núcleo | **001** Inicio |
| Servicios | **100** Servicios · 101 Consultoría en IA · 102 Agentes de IA para WhatsApp · 103 CRM con IA · 104 Partner oficial de Kommo · 105 GoHighLevel · 106 Automatización con n8n · 107 Paid media · 108 Páginas web · 109 Software a la medida · 110 SEO y visibilidad en IA · 111 Branding y contenido |
| Industrias | **200** Industrias · 201 Salud · 202 Belleza y estética · 203 Nutrición · 204 Finanzas · 205 Inmobiliario · 206 Industrial y logística · 207 Retail y e-commerce · 208 HoReCa |
| Casos | **300** Casos · 301 Clínica dental en Monterrey · 302 Retail multimarca · 303 E-commerce en CDMX · 304 HoReCa · 305 Logística |
| Empresa | **400** Kain · 401 Metodología VKTOR™ · 402 Tecnologías · 403 Nosotros · **404 Página no encontrada** · 405 Agentes de IA en Guadalajara |
| Recursos | **500** Blog · 501–506 artículos · 510 Preguntas frecuentes |
| Conversión | **600** Discovery Session · 601 Contacto |
| Legal | **900** Aviso de privacidad |

La 404 tiene literalmente el folio 404 ("Folio 404 · Esta página no está en la edición"). Es un guiño, no un adorno: confirma que el sistema de numeración es real.

---

## 1. Principios (lo que no se negocia)

1. **La portada es la sección.** Toda sección texto + imagen es una plana: imagen a sangre como fondo, sujeto en un tercio, tipografía en el espacio negativo *de la misma imagen*. No hay columnas de imagen, cajas de texto ni bordes visibles. Las costuras entre secciones se funden al mismo `#03040B` (B·D1, D2; C·1.5).
2. **Prueba en primera plana.** Cada página abre con una cifra confirmada y su contexto (sector, ciudad, plazo) en el sumario o en el pie de foto. Toda cifra lleva nota al pie con su fuente. Si el sector no tiene caso, una "Nota del editor" lo dice. Nunca se usan contadores que arranquen en 0 en el HTML.
3. **La tipografía es la arquitectura.** Lexend en tres voces: **600** para titulares (densos y apretados), **300** para entradillas y "decks" y **200** para cifras gigantes. Inter para leer y JetBrains Mono para folios, etiquetas y notas. La jerarquía la dan el tamaño y el peso; el color es casi monocromo y el degradado de luz aparece **una sola vez por página**.
4. **La retícula se ve.** Filetes de 1 px (hairlines), cabeceras corridas, columnas de notas al margen, números de folio. Reemplazan casi todas las tarjetas: el sitio se lee como una edición, no como plantilla SaaS.
5. **Movimiento de imprenta.** Cuatro verbos y nada más: *registrar* (líneas que se dibujan y caen en su lugar), *revelar* (la luz se enciende sobre la imagen), *pasar plana* (transición entre capítulos y páginas) y *contar* (cifras). Sin orbes flotando, sin marquesinas infinitas, sin rebotes. Intensidad 3 como máximo 3 veces en Inicio y 1 o 2 en internas.

**Prohibido (clichés que FOLIO no usa):** título centrado + subtítulo gris + 2 botones sobre degradado genérico · 3 tarjetas idénticas con ícono · tarjeta de cristal grande detrás del texto del hero · muro de logos en marquesina infinita · degradado en todos los H2 · carrusel de testimonios · emojis como íconos · dos píldoras iguales lado a lado como CTA.

---

## 2. Animación firma: "Registro"

**Concepto:** en imprenta, el *registro* es la alineación exacta de cada placa de color sobre el papel. En FOLIO, el isotipo de Ingeniak se **registra** sobre el isotipo de cristal que Kain presenta en la imagen del hero, y al caer en su lugar "revela" la portada. La marca literalmente imprime la escena.

Por qué funciona con lo que ya existe: el hero aprobado (`hero-home-b` → `hero-home-desk-2x.jpg`, 2752×1536) **ya contiene** un isotipo de cristal entre el titular y Kain. La animación no inventa un objeto nuevo: dibuja la marca, la convierte en el cristal de la foto y termina exactamente en el hero real que sirve Astro.

### 2.1 Guion (2.4 s; desde 1.5 s ya se puede leer el H1)

Storyboard: [`concepto-authority-storyboard.jpg`](concepto-authority-storyboard.jpg).

| t | Qué pasa | Técnica |
|---|---|---|
| 0.00 | Pantalla `#03040B`. La cabecera corrida escribe `FOLIO 001 — INICIO` (scramble de 6 frames) y su filete se traza de izquierda a derecha | ScrambleText + `scaleX` |
| 0.05–0.50 | Cae una línea cian vertical: **el pilar del isotipo**. Cae exactamente en la x del pilar de cristal de la imagen (65.2 % del ancho de la imagen) | DrawSVG sobre `<line>` en coordenadas de imagen |
| 0.45 | Se enciende el **nodo cuadrado superior**, el punto de inteligencia (`back.out(3)`) | `scale 0→1` |
| 0.55–1.00 | Las 4 ramas se dibujan desde el pilar hacia afuera y forman el isotipo en trazo cian de 1.6 px. Sus prolongaciones se convierten en las **guías de la retícula editorial**: 13 verticales de columna y 3 horizontales (línea de cabecera, línea de ojos de Kain, línea base del H1) a 16 % de opacidad | DrawSVG `50% 50% → 0% 100%` + `scaleX/scaleY` |
| 1.00–1.45 | El isotipo de marca hace **morph** al contorno trazado del cristal de la foto (mismas coordenadas). La marca "encaja" en el render | MorphSVG hacia `.reg__trace` |
| 1.05–2.15 | **Revelado radial:** el velo negro se abre en círculo desde el centro del cristal (63 %, 40 % de la imagen) hasta cubrir el cuadro. Kain aparece iluminado por el cristal | `--r` del velo 0 → 160 % (`@property`) |
| 1.35–1.80 | Se encienden los ojos de Kain: dos brillos cian registrados sobre sus ojos (75.9 %/27.5 % y 79.8 %/27.5 % de la imagen) hacen un parpadeo `scaleY .1 → 1` y se desvanecen | SVG en coordenadas de imagen |
| 1.20–1.90 | El H1 sube línea por línea desde su máscara: "Agentizamos" y luego "empresas." | SplitText `mask:'lines'`, `yPercent 105→0`, stagger .09 |
| 1.55–2.10 | Deck, CTA azul y "Escríbele a Kain"; después las 3 líneas del sumario, una por una | `y 16→0`, `autoAlpha` |
| 1.90–2.40 | Pie de foto "Fig. 01" con su línea guía hacia la mano de Kain, el header y la línea de confianza. Las guías de retícula se apagan | `autoAlpha`, `y 10→0` |
| 2.40 | **Estado final = HTML de Astro.** No hay nada que "quede a medias" | `tl.progress(1)` |

**Reglas:**

- **Una vez por sesión** (`sessionStorage['folio:registro']`), solo al entrar a Inicio. No se reproduce si la entrada llega con un `#hash`, si hay `prefers-reduced-motion` o si `navigator.connection.saveData` está activo.
- **Saltable al instante:** cualquier `wheel`, `touchstart` o `keydown` hace `tl.progress(1)`. No hay botón "Saltar intro" porque no hace falta.
- **No afecta LCP:** la `<img>` del hero nunca pasa por `opacity: 0`. Lo que la tapa es un **velo hermano** encima, y Chrome registra el LCP cuando la imagen se pinta, aunque esté tapada. Ese es el motivo por el que el revelado se hace sobre el velo y no sobre la imagen (B·D1 lo advertía para `filter`).
- **Sin JS** (o si GSAP no carga): el HTML ya es la portada final. Las clases de estado inicial solo se aplican desde JS, nunca en CSS.

### 2.2 Versión corta en internas: "Paso de plana" (0.7 s)

1. El folio hace scramble del número anterior al nuevo (`001 → 102`), gracias a una View Transition entre documentos que conserva la cabecera (ver 5.6).
2. Una línea cian vertical barre de arriba hacia abajo **del lado del sujeto** (el pilar), en 0.35 s.
3. El velo pasa de 0.8 a 0, el H1 sube por líneas y el pie de foto aparece al final.

Intensidad 2. Es lo que da continuidad de "misma publicación" entre 45 páginas.

### 2.3 Código (núcleo)

```html
<!-- Dentro de Scene.astro, solo en Inicio: capa de registro en COORDENADAS DE IMAGEN -->
<div class="stage stage--over" aria-hidden="true">
  <div class="frame" style="--r:1.7917; --fx:.72; --fy:.5">
    <div class="veil"></div>                         <!-- máscara radial animable -->
    <svg class="reg" viewBox="0 0 2752 1536" preserveAspectRatio="none">
      <line class="reg__pillar" x1="1794" y1="0" x2="1794" y2="968"/>
      <rect class="reg__node" x="1776" y="330" width="36" height="36"/>
      <path class="reg__iso" d="…isotipo de marca con la transformación YA APLICADA a las coordenadas (sin atributo transform, para que MorphSVG no se desfase)…"/>
      <path class="reg__trace" d="…contorno del cristal trazado sobre la imagen…" style="visibility:hidden"/>
      <circle class="reg__eye" cx="2089" cy="422" r="58"/><circle class="reg__eye" cx="2196" cy="422" r="58"/>
    </svg>
  </div>
</div>
```

```css
@property --vr { syntax: "<percentage>"; inherits: false; initial-value: 160%; }
.veil {
  position: absolute; inset: 0; background: var(--ink); visibility: hidden;
  -webkit-mask: radial-gradient(circle at 63% 40%, transparent var(--vr), #000 calc(var(--vr) + 18%));
          mask: radial-gradient(circle at 63% 40%, transparent var(--vr), #000 calc(var(--vr) + 18%));
}
.reg { visibility: hidden; }
.reg__pillar, .reg__iso { fill: none; stroke: var(--cyan); stroke-width: 1.6; vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 6px rgb(0 229 255 / .9)); }
.reg__node { fill: var(--cyan); filter: drop-shadow(0 0 10px var(--cyan)); }
.reg__eye { fill: url(#eyeGlow); opacity: 0; }
```

```js
// src/motion/registro.js
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
gsap.registerPlugin(SplitText, DrawSVGPlugin, MorphSVGPlugin, ScrambleTextPlugin);

export function registro(hero) {
  const skip = matchMedia('(prefers-reduced-motion: reduce)').matches
    || navigator.connection?.saveData || location.hash
    || sessionStorage.getItem('folio:registro');
  if (skip) return;                                  // el HTML ya es el estado final
  sessionStorage.setItem('folio:registro', '1');
  const q = gsap.utils.selector(hero);
  const lines = SplitText.create(q('.h1__display'), { type: 'lines', mask: 'lines' }).lines;

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    .set([q('.veil'), q('.reg')], { visibility: 'visible' })
    .set(q('.veil'), { '--vr': '0%' })
    .from(q('.folio b'), { duration: .4, scrambleText: { text: '000', chars: '0123456789' } }, 0)
    .from(q('.folio .rule'), { scaleX: 0, transformOrigin: 'left', duration: .8 }, 0)
    .fromTo(q('.reg__pillar'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: .45, ease: 'power3.in' }, .05)
    .from(q('.reg__node'), { scale: 0, transformOrigin: '50% 50%', duration: .35, ease: 'back.out(3)' }, .45)
    .fromTo(q('.reg__iso'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: .5 }, .55)
    .from(q('.guides > *'), { scale: 0, duration: .6, stagger: .015 }, .7)
    .to(q('.reg__iso'), { morphSVG: q('.reg__trace')[0], duration: .45, ease: 'power2.inOut' }, 1.0)
    .to(q('.veil'), { '--vr': '160%', duration: 1.1, ease: 'power2.inOut' }, 1.05)
    .fromTo(q('.reg__eye'), { opacity: 0, scaleY: .1, transformOrigin: '50% 50%' },
                            { opacity: 1, scaleY: 1, duration: .25, ease: 'power2.out' }, 1.35)
    .to(q('.reg__eye'), { opacity: 0, duration: .6 }, 1.8)
    .to(q('.reg__pillar, .reg__iso, .reg__node, .guides'), { autoAlpha: 0, duration: .5 }, 1.45)
    .from(lines, { yPercent: 105, duration: 1, stagger: .09 }, 1.2)
    .from(q('.h1__deck, .ctas > *'), { y: 16, autoAlpha: 0, duration: .7, stagger: .07 }, 1.55)
    .from(q('.cl'), { y: 12, autoAlpha: 0, duration: .6, stagger: .08 }, 1.75)
    .from(q('.caption, .leader, .trust'), { y: 10, autoAlpha: 0, duration: .6, stagger: .05 }, 1.95)
    .from('.hdr', { y: -8, autoAlpha: 0, duration: .5 }, 1.9)
    .set([q('.veil'), q('.reg')], { visibility: 'hidden' });

  const finish = () => tl.progress(1);
  ['wheel', 'touchstart', 'keydown'].forEach((e) => addEventListener(e, finish, { once: true, passive: true }));
}
```

**Producción del trazo (`.reg__trace`):** se abre `hero-home-desk-2x.jpg` a 2752×1536 en Figma o Illustrator, se traza el contorno del isotipo de cristal con la pluma (la parte que tapa Kain se completa por simetría), se exporta el `path` con `viewBox="0 0 2752 1536"` y se guarda junto a la imagen (`/img/escenas/inicio-portada.trace.svg`). Para el plano vertical (`hero-home-movil-d.png`, 768×1376) se hace otro trazo. Las coordenadas de esta sección se midieron sobre el archivo actual con una retícula de 2.5 %. Si Magnific regenera la imagen, **se vuelven a medir**.

---

## 3. Inicio, sección por sección (Folio 001)

Intensidad: **1** = tinta (filetes que se trazan, textos que suben 12 px) · **2** = revelado (velo, SplitText, conteo, parallax de 4–6 %) · **3** = plana completa (pin, scrub o secuencia).

Ritmo de la página (una "sorpresa" cada 700–900 px, sin dos 3 seguidos):

```
00 01  02  03  04  05  06  07  08  09  10  11  12  13  pie
 3──3   1   2   2   3   2   2   3   2   2   1   1   2   1
```

`[CINE]` = sección cinematográfica (imagen a sangre como fondo de la sección; sujeto de un lado y texto del otro).

### 01 · Portada `[CINE]` · intensidad 3 (con "Registro")

Prueba: [`concepto-authority-portada-1440.jpg`](concepto-authority-portada-1440.jpg).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [ingeniak]  Servicios▾ Industrias▾ Casos▾ Kain Empresa▾ Recursos▾   Escríbele a Kain [Agenda…→]│
│ FOLIO 001 — INICIO ───────────────────────────── (filete se desvanece)  GUADALAJARA · MX │
│ 3.2×   más citas en 90 días        ← SUMARIO          ╱╲  cristal  ┌─Kain──┐ │
│        CLÍNICA DENTAL · MTY → 301                     ╲╱  isotipo   │  👁 👁 │ │
│ −58%   en costo por lead en 60 días                    ┃           └──┬───┘ │
│ +340%  en conversiones con Kommo + IA                  ┃   mano ●─────┘     │
│ ■ CONSULTORÍA DE IA · GUADALAJARA                                  │        │
│ Agentizamos                      (Lexend 600, 7.6vw)  ┌ Fig. 01 · Kain ┐   │
│ empresas.                                             │ 8 min → 12 s … │   │
│ Agentes de IA, CRM y automatización en un…  (Lexend 300) └──────────────┘   │
│ [Agenda tu Discovery Session →]   Escríbele a Kain ↗                        │
│ PARTNER OFICIAL DE KOMMO EN LATAM · +73 SISTEMAS · 7 PAÍSES      ↓ 13 SECCIONES │
└──────────────── fundido a #03040B: la sección 02 nace aquí ───────────────────┘
```

- **Layout:** una portada de revista. Arriba a la izquierda va el **sumario** (cover lines), abajo a la izquierda el **titular gigante anclado a la base** y a la derecha el sujeto. El H1 vive en la penumbra *bajo* los brazos del cristal (la mitad inferior izquierda de la imagen está limpia), así que la tipografía puede ser enorme sin tocar la luz. El pie de foto de cristal se ancla a la mano de Kain con una línea guía cian: imagen y texto quedan **cosidos**.
- **Imagen:** escena 1 de la sección 7 (ya existe y está aprobada).
- **Copy:**
  - H1 de D en dos voces dentro del mismo `<h1>`: `<span class="h1__display">Agentizamos empresas.</span> <span class="h1__deck">Agentes de IA, CRM y automatización en un solo sistema que atiende, califica y cierra por ti.</span>`.
  - Sumario: 3.2× (→ 301), −58 % (→ 303), +340 % (→ 302).
  - Pie de foto: "Fig. 01 · Kain — El agente de IA de Ingeniak. En una clínica dental de Monterrey, el tiempo de respuesta en WhatsApp pasó de 8 min a 12 s."
  - Línea de confianza en mono.
- **Motion:** "Registro" (sección 2). Al hacer scroll: los dos `.frame` (imagen y capa registrada) van `yPercent 0 → 5` con scrub, el bloque de texto `y 0 → −60` con `autoAlpha → .2`, y el sumario sale antes (`start: 'top top', end: '30% top'`).
- **Responsive (probado):**
  - Celular y tablet vertical usan el plano vertical por **proporción**, no por ancho: `(max-width: 767px), (max-aspect-ratio: 5/6)`. Texto arriba y Kain abajo; el CTA queda sobre la cabeza de Kain, sin taparlo.
  - En escritorio bajo (`max-height: 819px`) el sumario se oculta en el hero y pasa a la sección 02. Así el CTA siempre queda visible sin scroll.

### 02 · Créditos + sumario · intensidad 1

- **Layout:** una franja de 120–160 px que **nace dentro del fundido** del hero (`margin-top: calc(-1 * var(--seam))`). Izquierda: sello Kommo Partner (versión blanca, chip de cristal pequeño, enlazado a kommo.com). Después, una fila *estática* de logos en blanco (`currentColor`) separados por filetes verticales: WhatsApp Business · Kommo · GoHighLevel · n8n · Make · OpenAI · Claude · Gemini · Meta · Google Ads · TikTok. Encabezado mono: `CON QUÉ CONSTRUIMOS — FOLIO 402 →`.
- En escritorio bajo y en celular, aquí aparecen las 3 líneas del sumario en fila horizontal (scroll horizontal con snap en celular).
- **Motion:** los filetes se trazan (`scaleX 0 → 1`, `transform-origin: left`) y los logos suben con stagger de .03. **Sin marquesina.**

### 03 · Reportaje nocturno: "El problema" `[CINE]` (par de planos registrados) · intensidad 2

- **Layout:** sujeto a la izquierda y texto a la derecha (columnas 7–12). Kicker `EL PROBLEMA · 23:48`. H2 de D: "Tu negocio no necesita más esfuerzo. **Necesita dejar de depender de ti.**" (600 / 300). Debajo, una **lista numerada 01–04 con filetes** (no tarjetas): Mensajes sin responder · Un CRM que nadie usa · Anuncios que no se traducen en ventas · Todo pasa por ti. Cada línea en ámbar.
- **Imagen (2 planos con la misma cámara):**
  - **A** = el dueño de pyme (45 años) de noche en su local vacío, iluminado en ámbar por el celular lleno de notificaciones (D, imagen 2).
  - **B** = el *mismo cuadro* editado con Nano Banana: el dueño ya no está, Kain de cuerpo completo atiende el mismo celular sobre el mostrador y la luz pasa a cian.
  - La historia sin palabras: "tú te vas a casa, Kain se queda".
- **Motion:** pin corto (`end: '+=100%'`, scrub .6).
  - 0 → .5: aparecen los 4 dolores en ámbar sobre el plano A.
  - .5 → 1: el plano B entra en *cross-fade* (opacidad, nunca desplazamiento, para que el registro no se rompa). Cada dolor recibe un tachado de filete cian que se dibuja, y su salida en cian sube debajo ("Kain contesta en segundos", "Cada lead queda en su etapa", "Cada peso se mide por venta", "El sistema opera; tú diriges").
  - Remate al final, en Lexend 300 a 40 px: "No te falta esfuerzo. Te falta un sistema."
- **QA:** superponer A y B en modo *difference*: todo lo que no es el sujeto debe salir negro.

### 04 · Tesis (manifiesto) · intensidad 2

- **Layout:** pantalla tipográfica de 70svh, sin imagen de persona. Atmósfera D10: el isotipo de cristal desenfocado (WebP pre-desenfocado de 600 px, sin `filter` en vivo) a 30 % detrás.
- Texto a 6.4vw en Lexend 600, alineado a la izquierda, ancho de 10 columnas: "Creamos el tráfico, lo convertimos y lo operamos automáticamente. **Con método, con datos y sin humo.**"
- **Motion:** SplitText por palabras; cada palabra pasa de 15 % a 100 % de opacidad con scrub (Distyl). Es el "paso de plana" hacia el capítulo del sistema.

### 05 · Fig. 2 — "El isotipo es el sistema" · intensidad 3

- **Idea:** el isotipo de Ingeniak (pilar + ramas + nodo) **es** el diagrama del sistema de 5 etapas de D. Cada parte de la marca se ilumina con su etapa:

| Etapa | Parte del isotipo | Prueba confirmada que se enciende | Enlaces |
|---|---|---|---|
| 01 Atraer | Rama inferior izquierda (lo que entra) | −58 % costo por lead en 60 días · e-commerce, CDMX · ROAS 4.8× sostenido · HoReCa | 107, 108, 110, 111 |
| 02 Atender | Rama superior izquierda | 8 min → 12 s · clínica dental, Monterrey | 102, 400 |
| 03 Organizar | **El pilar** (el CRM es la columna) | +340 % conversiones · retail multimarca, Kommo + IA | 103, 104, 105 |
| 04 Automatizar | Ramas derechas | 27 procesos automatizados · logística, n8n · −60 % tiempo operativo (primeros 90 días) | 106, 109 |
| 05 Medir | **Nodo cuadrado superior** (punto de inteligencia) | 1 vista · 7 fuentes · e-commerce | 101 |

- **Layout escritorio (pin, `end: '+=400%'`, `snap: 1/4`):**
  - Columnas 1–5: contador mono `ETAPA 02 / 05`, nombre de la etapa en Lexend 600 a 88 px, una oración, enlaces mono a los folios y la cifra con su nota al pie.
  - Columnas 6–12: el isotipo a 70vh de alto en trazo cian sobre la retícula visible (que aparece solo cerca del centro, con máscara radial; B·D6).
  - En la punta de cada rama, los logos de las herramientas de esa etapa en blanco.
- **Motion:** DrawSVG por scrub en la parte activa; las demás quedan a 18 %. Un pulso de luz recorre la rama activa cada 3 s. El texto de la etapa cambia con SplitText (líneas que salen hacia arriba y entran desde abajo). Un riel de progreso de 5 segmentos acompaña el pin.
- **Celular:** sin pin; 5 bloques apilados, cada uno con un isotipo pequeño (40 px) con su parte resaltada. Es el mismo SVG con `data-part`.
- **Nota:** reemplaza el video de Remotion de v1 como pieza principal. El video `motion-sistema` queda para redes y para `/servicios/`.

### 06 · Ingeniak en cifras (doble página de datos) · intensidad 2

- **Layout:**
  - Columnas 1–8: **"+73"** a `--fs-mega` (Lexend 200, ≈ 24vw) con la etiqueta mono `SISTEMAS EN PRODUCCIÓN¹`.
  - Columnas 9–12: tres filas separadas por filetes: "7 países" (con la lista en mono: México (sede) · Estados Unidos · Colombia · Argentina · España · Costa Rica · Ecuador), "12 → 47 citas al mes en promedio · clientes del sector salud²" y "−60 % de tiempo operativo · promedio, primeros 90 días³".
  - Debajo: **entradilla "¿Qué es Ingeniak?"** (G01, 50 palabras, citable tal cual) con capitular "I" en Lexend 600 cian a 3 líneas.
  - Al pie, las notas: "¹ ² ³ Datos internos de Ingeniak, octubre de 2026 · Cómo medimos → 300".
- **Imagen:** ninguna persona. Detrás del "+73", el isotipo de cristal desenfocado a 40 %. Es la única sección de datos "pura" y por eso puede ir sin imagen.
- **Motion:** el número gigante hace *count-up* visual de 40 a 73 en .9 s. El valor final ya está en el HTML (`<data value="73">+73</data>`) y en el `aria-label`. Al terminar, un brillo recorre el número (`background-position` de un degradado al 200 %). La flecha de "12 → 47" se dibuja antes de que cuente el 47.

### 07 · Perfil: Kain `[CINE]` · intensidad 2

- **Layout:** Kain a la izquierda y texto a la derecha. Kicker `PERFIL · FOLIO 400`. H2: "Soy Kain. **Trabajo en tu WhatsApp.**" Debajo, **formato entrevista** (pregunta en mono cian, respuesta en Lexend 300 a 22 px):
  - "¿Qué haces?" → "Respondo, agendo y confirmo por ti en WhatsApp, Instagram y tu web, y registro cada conversación en tu CRM."
  - "¿Qué no haces?" → "No doy consejo médico ni legal. Cuando algo se sale de lo que sé, la conversación pasa a una persona de tu equipo."
  - "¿Dónde te encuentro?" → "En app.kain.mx."
  - Firma con el slogan de D: "Tu negocio trabajando, sin depender más de ti."
- **Imagen:** Kain de cuerpo completo saludando junto a un **celular de cristal flotante con la pantalla vacía** (D, imagen 3). El video del chat (`kain-chat`, HyperFrames) se monta **registrado sobre la pantalla del celular generado**, en coordenadas de imagen (sección 6.5). Así el chat vive *dentro* de la foto, no en un mockup aparte.
- **CTA:** aquí el principal es `Escríbele a Kain ↗` en estilo enlace grande (Lexend 500, 22 px, subrayado cian) más `Conoce a kain → 400`. El botón azul de Discovery no se repite en esta sección.
- **Motion:** el chat arranca al entrar al viewport (`IntersectionObserver`; `preload="none"` y póster). Las preguntas y respuestas se revelan en pares. El halo de Kain respira (opacidad .7 ↔ 1, 4 s), **solo mientras está en pantalla**.

### 08 · Reportajes (riel horizontal de casos) · intensidad 3

- **Layout escritorio:** pin con desplazamiento horizontal de 5 planas de 100vw × 100svh. Cada plana es una **escena integrada**: la portada del caso (`caso-*-hero`, persona ilustrativa del sector) a sangre, con la cifra a `--fs-mega` en el lado del texto, el título del reportaje en Lexend 600 a 40 px, una línea de contexto, la etiqueta mono `IMAGEN ILUSTRATIVA DEL SECTOR` en la esquina y el enlace `Leer reportaje → 301`.
  - Entre planas, un **filete vertical cian** (el pilar) actúa de corte.
  - Arriba a la derecha, el contador `REPORTAJE 2 / 5` con 5 marcas.
- **Contenido (solo cifras confirmadas):** 3.2× · Clínica dental en Monterrey (301) · +340 % · Retail multimarca, Kommo + IA (302) · −58 % costo por lead en 60 días · E-commerce, CDMX (303) · ROAS 4.8× sostenido · HoReCa (304) · 27 procesos automatizados · Logística, n8n (305).
- **Motion:** `xPercent` del riel con scrub 1 y `snap: 1/4`. Dentro de cada plana, con `containerAnimation`, la cifra cuenta y el sujeto hace parallax horizontal de 3 %. Al salir del riel, el último filete se convierte en la regla superior de la sección 09.
- **Celular:** sin pin; 5 escenas apiladas de 86svh con sus planos verticales. Entre ellas solo hay filetes.
- **Reutilización:** no pide imágenes nuevas (son las portadas de los 5 casos de D).

### 09 · Método VKTOR™ (portada con cabecera) `[CINE]` · intensidad 2

- **Idea:** el truco clásico de las portadas de revista, donde **el sujeto tapa la cabecera**. "VKTOR" a 26vw en Lexend 600, contorneado (`-webkit-text-stroke: 1px`), cruza todo el ancho **detrás de Kain**. Se usa el recorte registrado (B·D3), así que su cabeza tapa parte de la "K" y la "T".
- **Layout:** debajo de la cabecera, 5 columnas con filete superior; cada una lleva la letra en mono cian, el nombre y la frase oficial: **V**erify · verificamos tu operación — **K**oncept · diseñamos el concepto — **T**ransform · transformamos — **O**perate · operamos junto con tu equipo — **R**ise · hacemos crecer los resultados. Enlace `La metodología completa → 401`.
- **Imagen:** escena 5 de la sección 7 (portada de `/metodologia/`, reutilizada) + recorte PNG con alfa de las mismas dimensiones.
- **Motion:** cada letra de la cabecera pasa de contorno a relleno blanco cuando su columna entra (`start: 'top 75%'`, stagger por letra). La cabecera se desplaza `xPercent −6` con scrub mientras la imagen y el recorte quedan fijos entre sí. En Inicio no hay pin; la versión fijada vive en `/metodologia/`.

### 10 · Índice por industria (índice vivo) `[CINE dinámica]` · intensidad 2

- **Layout:** columnas 1–7 con 8 filas de índice. Cada fila lleva folio mono (201…208), nombre en Lexend 600 a 44 px, la micropromesa de D en Inter y la cifra cuando existe (Salud · 3.2× · Industrial · 27 procesos · Retail · +340 % · HoReCa · ROAS 4.8×). **El fondo completo de la sección es la portada de la industria activa** (sujeto a la derecha), y cambia con *cross-fade* de dos capas A/B.
- Las filas inactivas quedan al 40 %; la activa al 100 % con un filete cian que se dibuja debajo.
- **Interacción:** se activa con hover o foco en escritorio, y con la posición de scroll (la fila que cruza el centro del viewport) en todos los tamaños. Las imágenes cargan diferidas; con *hover intent* se precarga la siguiente.
- **Regla de espejo:** las portadas de industria con sujeto a la izquierda se espejan aquí con `scale: -1 1` para que el sujeto quede siempre a la derecha. Es válido porque **ninguna imagen tiene texto ni logos** (regla de generación). Kain también se puede espejar: su diseño es simétrico.
- **Motion:** *cross-fade* de .6 s con `power2.inOut`, y la imagen entrante va de `scale 1.04 → 1`.

### 11 · Directorio (equipo) `[CINE]` · intensidad 1

- **Layout:** el equipo real a la derecha y el texto a la izquierda. Kicker `DIRECTORIO · FOLIO 403`. H2 de D: "Estrategas que construyen, **operan y miden.**"
- Debajo, el **staff de revista**: 6 filas con nombre en Lexend 500 a 20 px y cargo en mono a 11 px:
  - Rik Landeros — Director de Estrategia Comercial
  - Alonso Vega — Arquitecto de IA y Automatización
  - César Ovalle — Director Creativo
  - Richard Vela — Medios de Performance
  - Andy Pizano — Administración y Finanzas
  - Marcos González — Líder Comercial
- *Dateline:* "Av. Punto Sur 312, Tlajomulco de Zúñiga, Jalisco · México (sede) · Estados Unidos · Colombia · Argentina · España · Costa Rica · Ecuador".
- **Imagen:** escena 6 de la sección 7 (foto real extendida con outpainting y duotono D5; las caras no se alteran).
- **Motion:** la máscara radial del retrato se abre (`--r` 30 % → 75 %) y los nombres entran fila por fila con su filete.

### 12 · Preguntas + ficha técnica · intensidad 1

- **Layout:**
  - Columnas 1–4, fija con `position: sticky`: H2 "Lo que nos preguntan antes de agendar" y debajo la **ficha técnica** (para GEO): Nombre · Sede · Oficina · Alianza (Partner oficial de Kommo en LATAM) · Metodología (VKTOR™ con su expansión oficial) · Cifras · Inversión ("desde USD 997 al mes").
  - Columnas 6–12: 6 preguntas en acordeón con filetes (G01, G02, G04, G07, G08, G11 de D), con texto idéntico al `FAQPage`.
- **Atmósfera:** las ondas sedosas (`fondo-ondas`) muy tenues a la derecha, para que el cristal de la ficha tenga algo que desenfocar.
- **Motion:** solo el acordeón (altura con `gsap.to(height:'auto')`, .45 s) y un `+` que gira 45°.

### 13 · Contraportada `[CINE]` · intensidad 2

- **Layout:** Kain saludando en el tercio derecho (variante compartida `cta-kain-saluda`) y el texto a la izquierda. H2 de D en dos voces: "30 minutos para ver tu operación **como es, no como crees que es.**"
- CTA azul + `Escríbele a Kain ↗` + microcopy mono "SIN COSTO · SIN COMPROMISO · 30 MIN · GOOGLE MEET".
- A la derecha del CTA, tres pasos mono numerados: "01 Revisamos tu operación · 02 Detectamos qué automatizar primero · 03 Te vas con un plan".
- **Motion:** el haz volumétrico de B·D11 se abre (`scaleX .2 → 1`) cuando la sección llega al 60 %. La línea de luz bajo el CTA respira (3 s). El H2 sube por líneas.

### Pie · Colofón · intensidad 1

- El índice general **con folios** en 5 columnas (Servicios, Industrias, Casos, Empresa, Recursos), con todas las URLs de D-navegacion.
- Debajo, la ficha de la entidad (los mismos datos que el schema), las redes reales, el aviso de privacidad y "Construimos empresarios libres, no héroes cansados."
- Firma: el isotipo se redibuja con trazo cian (heredado de v1) y debajo `FOLIO 001 · EDICIÓN PERMANENTE`.
- **Motion:** solo el redibujo del isotipo al entrar.

---

## 4. Plantillas internas

Todas comparten la cabecera corrida (folio + migas dentro de la portada; D·7 pide las migas dentro de la portada y no como barra aparte), la contraportada y el colofón. La portada interna usa `--fs-display-2` (el titular lleva la keyword y es más largo que el de Inicio) y "Paso de plana" en lugar de "Registro".

### 4.1 Servicio · "Ficha de servicio" (ejemplo: Folio 102, `/servicios/agentes-ia-whatsapp/`)

| # | Sección | Layout | Imagen | Dirección de copy | Motion | Int. |
|---|---|---|---|---|---|---|
| S1 | **Portada** `[CINE]` | Sujeto a la izquierda y texto en las columnas 6–12. Cabecera: `FOLIO 102 — INICIO › SERVICIOS › AGENTES DE IA PARA WHATSAPP`. H1 de D ("Agentes de IA para WhatsApp Business") + deck en 300. CTA. **Pie de foto registrado al celular de la persona:** burbujas HTML "23:48 · ¿Tienen cita mañana?" → "Kain · 12 s después: Sí, tengo 10:00 o 12:30. ¿Cuál te aparto?", marcadas `EJEMPLO ILUSTRATIVO` | Escena 2 (sección 7) | La cifra va en el deck con contexto: "En una clínica dental de Monterrey, el tiempo de respuesta bajó de 8 minutos a 12 segundos." | Paso de plana; las burbujas aparecen con "escribiendo…" (3 puntos, .8 s) | 2 |
| S2 | **Definición** (entrada de diccionario) | Columnas 3–9. El término como lema: **agente de IA para WhatsApp** *s.*, con separación silábica en mono. Definición G02 de 40–60 palabras. Al margen (columnas 10–12), las cifras con nota al pie: 8 min → 12 s · 3.2× en 90 días · 12 → 47 citas/mes (salud) | — (página) | Primera oración = definición citable (AEO) | Filete y lema con scramble breve | 1 |
| S3 | **Señales** | Lista numerada a ancho de 10 columnas: cada dolor en ámbar a 32 px que, al hacer scroll, recibe un tachado cian y su salida | — | "Contestas cuando puedes, no cuando escriben" → "Responde en segundos, 24/7" | Tachado DrawSVG con scrub por fila | 2 |
| S4 | **Pliego de entregables** (no tarjetas) | Tabla editorial de 6 filas: Entregable · Qué recibes · Con qué (logos) · Fase VKTOR (letra en mono). Hover: la fila se ilumina y el nombre se desplaza 8 px | — | Las 6 capacidades de D (responde, califica, agenda, registra en CRM, da seguimiento, con el modelo correcto) | Filetes que se trazan con stagger | 1 |
| S5 | **Fig. 3 · Cómo funciona** | Pin `+=300%`. Diagrama sobre las ramas del isotipo: WhatsApp → Kain → CRM → Agenda → Persona del equipo. A la izquierda, el paso activo; a la derecha, el diagrama | — (SVG) | Un verbo por paso; el último es "Cuando hace falta, entra una persona" | DrawSVG por scrub; pulso en la rama activa | 3 |
| S6 | **Lo que sí hace / lo que no** `[CINE]` | Kain a la derecha. Dos columnas tipográficas a la izquierda: "Sí" con filete cian y "No" con filete ámbar | `agentes-whatsapp-si-no` (D) | Listas de v1; "No es chatbot de menús", "No da consejo médico ni legal" | Revelado + líneas alternas | 2 |
| S7 | **Reportaje relacionado** `[CINE]` | Plana de 80svh con la portada del caso 301 a sangre, "3.2×" en mega y `Leer reportaje → 301` | Reutiliza `caso-dental-hero` | Una oración citable del resultado | Cifra con conteo | 2 |
| S8 | **VKTOR™ aplicado** | Tira de 5 columnas con letra, verbo y "en este servicio:" | — | Una línea por fase (D) | Las letras se rellenan en secuencia | 1 |
| S9 | **Inversión** | Columnas 3–9: "Desde **USD 997** al mes" en Lexend 300 a 56 px + "Qué define el alcance" en 4 filas | — | Solo esa cifra de precio. Las 4 filas (canales, volumen, integraciones, CRM) se validan con el cliente | Tinta | 1 |
| S10 | **Preguntas** | Columnas 1–4 fijas + acordeón | — | Las 6 de D (G02, G03, W01, W02, G09, W03) | Acordeón | 1 |
| S11 | **En esta edición también** | 3 filas de índice con folio (400, 104, 503); al hacer hover, la portada de cada una aparece de fondo (como la sección 10 de Inicio) | Reutiliza portadas | Título corto + una línea | Cross-fade | 1 |
| S12 | **Contraportada** `[CINE]` | Variante compartida de D (A: Kain saluda) | Compartida | El cierre de D para la página | Haz + H2 | 2 |

Densidad: 12 secciones, 3 escenas a sangre, un solo momento de intensidad 3.

### 4.2 Industria · "Sección" (ejemplo: Folio 201, `/industrias/salud/`)

| # | Sección | Layout | Imagen | Dirección de copy | Motion | Int. |
|---|---|---|---|---|---|---|
| I1 | **Portada** `[CINE]` | Sujeto a la derecha y texto en las columnas 1–6 (el lado contrario al de servicios, para que el ritmo cambie). Cabecera `SECCIÓN · SALUD — FOLIO 201`. H1 de D + deck. Pie de foto con la cifra del sector: "12 → 47 citas al mes en promedio · clientes del sector salud¹" | Escena 3 (sección 7) | Deck = la promesa de D ("Tu agenda llena sin que tu recepción viva pegada al WhatsApp") | Paso de plana | 2 |
| I2 | **Entradilla del sector** | Columnas 3–9, Lexend 300 a 26 px con capitular | — | El párrafo citable de D; incluye "no da consejo médico" | Tinta | 1 |
| I3 | **Un día en tu recepción** | Línea de tiempo horizontal 08:00 → 23:48 a todo el ancho, con marcas ámbar donde se pierde un paciente y marcas cian donde responde Kain. Etiqueta `ESCENARIO ILUSTRATIVO` | — | Situaciones, no estadísticas: "13:10 · la recepción está cobrando y entran 3 WhatsApp" | Pin corto `+=120%`; la línea avanza con scrub y las marcas se encienden | 3 |
| I4 | **Por tipo de negocio** | Pestañas como títulos de sección (Clínicas dentales · Consultorios · Especialidades), con todo el contenido en el HTML | — | 3 usos por pestaña | Cross-fade del contenido | 1 |
| I5 | **Qué automatizamos** | Pliego de 6 filas (D) | — | Respuesta 24/7, agenda, confirmación y recordatorios, reagendado, seguimiento de presupuestos, registro en Kommo o GoHighLevel | Filetes | 1 |
| I6 | **Así trabaja Kain en tu clínica** `[CINE]` | Kain a la izquierda. A la derecha, la **transcripción**: hora en mono + texto en Inter, mensaje por mensaje, marcada `EJEMPLO ILUSTRATIVO`. Cierra con "Lo que Kain no hace: diagnósticos ni consejo médico" | `ind-salud-kain-sector` (D) | El guion de D (limpieza a las 11 p. m.; Kain ofrece dos horarios y confirma) | Los mensajes aparecen uno por uno al entrar (sin scrub) | 2 |
| I7 | **Resultados del sector** | Doble página de datos: una cifra mega (3.2×) y dos en columna (8 min → 12 s; 12 → 47), cada una con nota al pie | — | **Sectores sin caso** (belleza, nutrición, finanzas, inmobiliario): una "Nota del editor" en un recuadro de filete: "Todavía no publicamos un caso de [sector]. Estas cifras vienen de otros sectores donde aplicamos el mismo sistema:" y cada cifra lleva su sector | Conteo | 2 |
| I8 | **Stack y servicios** | Filas con logos (Kommo, GoHighLevel, WhatsApp) y enlaces a 102, 104, 105 | — | Por qué cada herramienta en este sector | Tinta | 1 |
| I9 | **Nota de método: datos de pacientes** | Columnas 3–9 en un recuadro de filete: consentimiento, aviso de privacidad, escalamiento a una persona | — | Prácticas verificables, sin sellos que no se tienen | Tinta | 1 |
| I10 | **Preguntas** | Igual que en servicio | — | Las 5 de D | Acordeón | 1 |
| I11 | **Contraportada** `[CINE]` | Compartida A | Compartida | "¿Cuántas citas se te escapan por no contestar a tiempo? Lo vemos en 30 minutos." | Haz | 2 |

### 4.3 Caso · "Reportaje" (ejemplo: Folio 301, `/casos/clinica-dental-monterrey/`)

| # | Sección | Layout | Imagen | Dirección de copy | Motion | Int. |
|---|---|---|---|---|---|---|
| C1 | **Portada de reportaje** `[CINE]` | Sujeto a la derecha. A la izquierda, la cifra **"3.2×" a `--fs-mega`** (Lexend 200) y debajo el H1 completo de D en Lexend 600 a 44 px ("Clínica dental en Monterrey: 3.2× más citas en 90 días con un agente de IA"). Ficha en una fila mono con filetes: `SECTOR SALUD · MONTERREY, N.L. · AGENTE DE IA EN WHATSAPP · 90 DÍAS`. `IMAGEN ILUSTRATIVA DEL SECTOR` en la esquina inferior derecha | Escena 4 (sección 7) | Sin adjetivos: la cifra es el titular | La cifra cuenta de 1.0 a 3.2 en 1.1 s (valor final en el HTML); revelado de la escena | 3 |
| C2 | **Entradilla + firma** | Columnas 3–9: 2 oraciones en Lexend 300 a 26 px + "Por el equipo de Ingeniak · lectura de 4 min" (autor con nombre solo si el cliente lo confirma) | — | Qué se logró, en qué plazo y con qué | Tinta | 1 |
| C3 | **Salto rápido** | Riel fijo a la izquierda (columnas 1–2): Contexto · Reto · Solución · Resultados · Stack, con número mono y barra de avance; el cuerpo va en las columnas 3–9 a 64ch | — | — | `toggleClass` por sección + filete de progreso | 1 |
| C4 | **Reto** | Cuerpo editorial; al margen, la nota "8 min" en ámbar a 40 px como cifra de margen | — | Solo datos confirmados; lo demás se marca [POR CONFIRMAR] o se omite (D) | Tinta | 1 |
| C5 | **Solución · Fig. 4** | Diagrama del sistema implementado sobre las ramas del isotipo. Si el cliente entrega capturas anonimizadas de Kommo o n8n, van como **figuras con pie** (filete de 1 px, sin tarjeta) | — | "Agente conversacional que califica, agenda y da seguimiento, conectado al CRM [VALIDAR CRM]" | DrawSVG | 2 |
| C6 | **Resultado** `[CINE]` | Kain a la izquierda. A la derecha: "~~8 min~~ → 12 s" gigante (8 min tachado en ámbar y 12 s en blanco) + la oración citable de D + nota al pie | `caso-dental-resultado` (D) | "Una clínica dental en Monterrey logró 3.2 veces más citas en 90 días y bajó su tiempo de respuesta en WhatsApp de 8 minutos a 12 segundos." | El tachado se dibuja; "12 s" entra con scramble | 2 |
| C7 | **Cómo lo hicimos con VKTOR™** | Línea vertical (el pilar) con 5 hitos | — | Solo los hitos que confirme el equipo; si no hay, las fases genéricas con enlace a 401 | Trazo del pilar con scrub | 1 |
| C8 | **Qué puedes replicar** | 3 ideas numeradas a 28 px con filetes | — | Responder en segundos · confirmar y recordar · registrar cada paciente en el CRM | Tinta | 1 |
| C9 | **Testimonio** | Solo si el cliente lo aprueba por escrito (nombre, cargo y empresa). Si no, **la sección no existe** | — | — | — | — |
| C10 | **Contraportada** `[CINE]` | Compartida A | Compartida | "¿Cuántas citas más cabrían en tu agenda? Lo vemos en 30 minutos." | Haz | 2 |
| C11 | **Siguiente reportaje** | Plana de 45svh con la portada del caso siguiente (302) asomando desde abajo, su cifra mega y `Siguiente reportaje → 302`. Al hacer clic, la imagen se expande hasta ser la portada del 302 (View Transition, `view-transition-name: plate-302`) | Reutiliza `caso-retail-hero` | Una línea | Parallax ligero; morph de página | 2 |

Barra de lectura: filete cian de 2 px bajo el header (solo en reportajes y artículos).

---

## 5. Navegación y mega menú: el Índice

La estructura es la de `D-navegacion.json`: **Servicios ▾ · Industrias ▾ · Casos ▾ · Kain · Empresa ▾ · Recursos ▾** + "Escríbele a Kain" + [Agenda tu Discovery Session]. Se sigue D (la arquitectura oficial) y no la variante de C. Todos los enlaces están en el HTML estático.

### 5.1 Cabecera

- 72 px, transparente sobre la portada.
  - **Izquierda:** el imagotipo.
  - **Centro:** las opciones en Inter 500 a 14 px con una flecha de 9 px.
  - **Derecha:** `Escríbele a Kain` como enlace de texto con el glifo de WhatsApp y el botón azul pequeño (44 px).
- Al pasar el 80 % de la portada: cristal `rgb(3 4 11 / .72)` con blur de 16 px, saturate 140 % y filete inferior `rgb(0 229 255 / .12)`. Se oculta al bajar más de 120 px y vuelve al subir.
- **Indicador:** un filete cian de 2 px bajo la opción activa o abierta, que se desliza entre opciones con GSAP Flip.
- **Por debajo de 1180 px**, el menú pasa a hamburguesa + botón; por debajo de 768 px, logo + hamburguesa (el botón se va a la barra inferior). Está probado en el prototipo: a 1024 px el menú completo no cabe.

### 5.2 Paneles "Índice" (Servicios, Industrias, Casos)

Los paneles son de cristal a todo el ancho y caen **sobre la portada** (por eso el cristal sí tiene algo detrás que desenfocar). Tienen 480–540 px de alto y un filete cian superior.

- **Servicios** (3 columnas + portada destacada):
  - Columnas de D: *Atraer* · *Atender y vender* · *Operar y escalar*, con su subtítulo en mono.
  - Cada opción lleva folio mono (101…111), nombre en Lexend 500 a 18 px y la línea de resultado de D en Inter 13 px muted. "Partner oficial de Kommo" lleva el sello mini.
  - Tercio derecho: **portada en miniatura** (`menu-kain`), una imagen a sangre dentro del panel con bordes fundidos, Kain y "Conoce a Kain → 400".
  - Pie del panel: `Todos los servicios · Metodología VKTOR™ · Tecnologías` y la nota mono `PLANES DESDE USD 997 AL MES`, la única mención de precio en la navegación.
- **Industrias:** 8 filas en 2 columnas con folio, nombre, micropromesa y cifra cuando existe. Al pasar el cursor o el foco por una fila, la portada miniatura de la derecha cambia a esa industria (WebP de 640 px precargado cuando se abre el panel).
- **Casos:** 5 líneas de sumario (cifra en Lexend 300 a 32 px + nombre + folio) y `Todos los casos → 300`.
- **Empresa y Recursos:** listas desplegables simples con folio (no son mega menús).
- **Comportamiento:**
  - Abre con hover intencional (120 ms) y cierra con 200 ms de gracia. Clic, `Enter` y `Espacio` abren; `Esc` cierra y devuelve el foco; las flechas recorren las opciones.
  - `aria-expanded` + `aria-controls`; el panel es un `<div role="region" aria-label="Índice de servicios">` con listas de `<a>`.
  - Animación: `clip-path: inset(0 0 100% 0) → inset(0)` en 280 ms con `expo.out`; opciones con stagger de 18 ms.
  - **Cambiar de panel sin cerrar** (de Servicios a Industrias) hace *cross-fade* del contenido y anima la altura, como Stripe.

### 5.3 Índice general (⌘K o "/")

- En la cabecera, un botón mono `⌘K ÍNDICE` (solo en escritorio) abre una capa a pantalla completa con las 45 páginas agrupadas por bloque y ordenadas por folio, con un buscador que filtra en el cliente por nombre y keyword (el JSON de 45 objetos se genera en el build: `/indice.json`, ~6 KB).
- Si el usuario escribe un número de folio ("301"), salta directo a esa página.
- Con un sitio de 45 páginas, esta capa es la que hace que el tamaño se perciba como **orden** y no como laberinto.

### 5.4 Celular

- La hamburguesa abre una hoja a pantalla completa (cristal oscuro):
  - arriba, el buscador del Índice;
  - en medio, acordeones Servicios / Industrias / Casos / Empresa / Recursos con folios;
  - al pie, fijo, el botón Discovery + WhatsApp.
- **Barra inferior fija** con "Agenda tu Discovery" y "Escríbele a Kain", que aparece cuando el hero sale del viewport. No aparece en `/discovery/`.

### 5.5 Folio y migas

La cabecera corrida de cada portada (`FOLIO 102 — INICIO › SERVICIOS › AGENTES DE IA PARA WHATSAPP`) **es** el breadcrumb visible, en JetBrains Mono a 11 px, y emite el `BreadcrumbList`. Vive dentro de la portada, no como barra aparte, como pide D·7.

### 5.6 Transiciones entre páginas

- **View Transitions entre documentos con CSS** (`@view-transition { navigation: auto; }`), sin ClientRouter de Astro. El sitio sigue siendo MPA puro y no hay que reinicializar GSAP, ScrollTrigger ni Lenis. En navegadores sin soporte la navegación es normal.
- `view-transition-name: hdr` en la cabecera (persiste), `folio` en el número (morph + scramble al cargar) y `plate-{folio}` en las imágenes de las tarjetas o filas de caso → portada del caso.
- Duración de 350 ms; con `prefers-reduced-motion`, ninguna.

### 5.7 `/discovery/`

Navegación reducida: logo + "Agendar mi Discovery Session". Sin mega menú, sin Índice y sin barra inferior (D·5).

---

## 6. Sistema de diseño: cambios respecto a v1

### 6.1 Tabla de cambios

| Tema | v1 (`css/styles.css`) | FOLIO |
|---|---|---|
| Lexend | 500 en todo (plano) · archivo con eje 300–700 | **600** titulares · **300** deck y entradillas · **200** cifras mega. Hay que **reemplazar `lexend-var.woff2` por el variable completo 100–900** (Google Fonts, subconjunto latin + latin-ext) |
| H1 portada | `clamp(46px, 6.6vw, 96px)/.98`, −.045em, centrado | `--fs-display: clamp(56px, 7.6vw, 148px)/.86`, −.058em, **anclado abajo a la izquierda**, 2 líneas como máximo |
| H1 internas | `clamp(40px, 4.3vw, 62px)` | `--fs-display-2: clamp(44px, 5.6vw, 104px)/.92`, −.05em |
| H2 | `clamp(32px, 4.8vw, 64px)` | `clamp(40px, 4.8vw, 88px)/.95`, 600 + segunda frase en 300 (dos pesos, no dos colores) |
| Cifras | `clamp(34px, 4vw, 48px)` | `--fs-mega: clamp(120px, 24vw, 400px)/.8`, Lexend 200, −.06em · cifras de sumario 34 px/300 |
| Texto | 16 px/1.6 | 17 px/1.65 · artículos 19 px/1.7 a 64ch |
| Etiquetas | Mono 12 px | Mono 11 px, `letter-spacing: .16em`, MAYÚSCULAS; folios en cian y el resto en `rgb(158 176 199 / .8)` |
| Degradado de texto | Varios | **Uno por página** (la "palabra iluminada"), nunca en H2 en serie |
| Retícula | `--maxw: 1240px`, contenido centrado | 12 columnas a **1440 px** como máximo; margen `max(clamp(16px, 4vw, 64px), (100vw − 1440px)/2)`; zonas: notas al margen (1–2), medida (3–9), aparte (10–12) |
| Espaciado | `--section-y: clamp(88px, 11vw, 160px)` + bandas negras de 300–500 px | Escala 8 · 16 · 24 · 40 · 64 · 104 · 168. Las secciones **se solapan** con `--seam: clamp(80px, 12vh, 160px)`; ninguna banda negra de más de 160 px sin luz o contenido |
| Separadores | Bordes de tarjeta | **Filetes de 1 px** (`--hair`) que se trazan al entrar |
| Cristal | `.cristal` en casi todo, con spotlight | Solo en 6 piezas: header con scroll, panel del Índice, pie de foto, celular del chat, ficha técnica y barra inferior. Siempre sobre imagen o luz |
| Imagen | En tarjeta con radio | A sangre, registrada (6.5), con velo direccional y fundido |
| Tarjetas | `.caso`, `.serv`, `.persona` en grid | **Filas** de índice y **planas** (imagen a sangre dentro de la pieza, sin borde ni radio) |
| Botón secundario | Píldora fantasma | **Enlace subrayado** con glifo; nunca dos píldoras juntas |

### 6.2 Tokens

```css
:root {
  /* Color: sin cambios de marca */
  --ink:#03040B; --navy:#0A1F4C; --blue:#0055FF; --indigo:#455DFF; --cyan:#00E5FF;
  --text:#FFFFFF; --muted:#9EB0C7; --amber:#FFB547;
  --paper:#070B18;                                 /* superficie sólida cuando no hay imagen detrás */
  --hair: rgb(158 176 199 / .18); --hair-2: rgb(158 176 199 / .32); --hair-cyan: rgb(0 229 255 / .35);

  /* Tipo */
  --f-display:"Lexend",system-ui,sans-serif; --f-text:"Inter",system-ui,sans-serif; --f-mono:"JetBrains Mono",ui-monospace,monospace;
  --fs-mega:clamp(120px,24vw,400px);   --fs-display:clamp(56px,7.6vw,148px); --fs-display-2:clamp(44px,5.6vw,104px);
  --fs-h2:clamp(40px,4.8vw,88px);      --fs-h3:clamp(22px,1.9vw,30px);       --fs-deck:clamp(20px,1.9vw,32px);
  --fs-standfirst:clamp(20px,1.6vw,26px); --fs-body:17px; --fs-article:19px; --fs-caption:13px; --fs-label:11px;

  /* Retícula y espacio */
  --gutter:24px; --margin:max(clamp(16px,4vw,64px),(100vw - 1440px)/2);
  --s1:8px; --s2:16px; --s3:24px; --s4:40px; --s5:64px; --s6:104px; --s7:168px;
  --seam:clamp(80px,12vh,160px);

  /* Movimiento */
  --ease-print:cubic-bezier(.16,1,.3,1);   /* = expo.out: revelar, registrar */
  --ease-ui:cubic-bezier(.22,1,.36,1);     /* hover, menús */
  --t-ink:.6s; --t-reveal:1s; --t-hover:.35s;
}
```

### 6.3 Tipografía (clases)

```css
.h-display  { font:600 var(--fs-display)/.86 var(--f-display); letter-spacing:-.058em; margin-left:-.06em; } /* compensa el lado izquierdo de la "A" */
.h-display-2{ font:600 var(--fs-display-2)/.92 var(--f-display); letter-spacing:-.05em; text-wrap:balance; }
.deck       { display:block; font:300 var(--fs-deck)/1.22 var(--f-display); letter-spacing:-.02em; color:#C9D6E6; max-width:22em; }
.deck b     { font-weight:400; color:var(--text); }
.h2         { font:600 var(--fs-h2)/.95 var(--f-display); letter-spacing:-.045em; text-wrap:balance; }
.h2 .soft   { font-weight:300; color:#C9D6E6; }           /* segunda frase: dos pesos */
.mega       { font:200 var(--fs-mega)/.8 var(--f-display); letter-spacing:-.06em; font-variant-numeric:tabular-nums; }
.standfirst { font:300 var(--fs-standfirst)/1.4 var(--f-display); letter-spacing:-.01em; color:#E6EEF8; max-width:34em; }
.standfirst::first-letter { float:left; font:600 3.2em/.82 var(--f-display); color:var(--cyan); margin:.06em .08em 0 0; }
.label      { font:500 var(--fs-label)/1 var(--f-mono); letter-spacing:.16em; text-transform:uppercase; color:rgb(158 176 199 / .8); }
.label--cyan{ color:var(--cyan); }
.lit        { background:linear-gradient(92deg,#fff 0%,#A8F3FF 30%,var(--cyan) 65%,var(--indigo) 100%);
              -webkit-background-clip:text; background-clip:text; color:transparent; } /* una vez por página */
.fn         { font:500 .62em/0 var(--f-mono); vertical-align:super; color:var(--cyan); } /* ¹ nota al pie */
```

### 6.4 Retícula y filetes

```css
.wrap   { width:calc(100% - 2 * var(--margin)); margin-inline:auto; display:grid;
          grid-template-columns:repeat(12,minmax(0,1fr)); column-gap:var(--gutter); }
.margin { grid-column:1 / span 2; }   /* notas al margen, folios, número de paso */
.measure{ grid-column:3 / span 7; }   /* cuerpo a 64ch */
.aside  { grid-column:10 / span 3; }  /* cifras, figuras, notas */
.rule   { height:1px; background:var(--hair); transform-origin:left; }          /* se anima scaleX 0→1 */
.running-head { display:flex; justify-content:space-between; padding-bottom:14px;
  border-bottom:1px solid; border-image:linear-gradient(90deg,var(--hair) 55%,transparent 80%) 1; } /* se apaga antes del sujeto */
.cover-lines { display:grid; grid-template-columns:auto 1fr; }                   /* cifras alineadas */
.cover-lines > a { grid-column:1 / -1; display:grid; grid-template-columns:subgrid; column-gap:16px;
  padding:14px 0; border-bottom:1px solid var(--hair); }
@media (max-width:767px){ .wrap{ grid-template-columns:1fr; } .margin,.measure,.aside{ grid-column:1; } }
```

### 6.5 Tratamiento de imagen: las recetas

**R1 · Escenario registrado (`.stage` / `.frame`): la base de todo.** Reemplaza `object-fit: cover` por una caja que **reproduce el recorte de `cover` en CSS** con unidades de contenedor. Así cualquier capa (pie de foto, línea guía, chat sobre el celular, ojos de Kain, trazo del isotipo, recorte del sujeto) se coloca **en porcentaje o píxeles de la imagen** y queda pegada al sujeto en cualquier viewport y durante el parallax. Está probada en el prototipo.

```css
.scene  { position:relative; isolation:isolate; height:max(100svh,720px); overflow:clip; }
.stage  { position:absolute; inset:0; container-type:size; z-index:-5; }
.stage--over { z-index:-2; pointer-events:none; }       /* capas registradas por encima del velo */
.frame  { position:absolute; --r:1.7917; --fx:.72; --fy:.5;   /* --r = ancho/alto de la imagen; --fx/--fy = punto focal 0–1 */
  width:max(100cqw, 100cqh * var(--r));  height:max(100cqh, 100cqw / var(--r));
  left:calc((100cqw - max(100cqw, 100cqh * var(--r))) * var(--fx));
  top: calc((100cqh - max(100cqh, 100cqw / var(--r))) * var(--fy)); }
.frame > img, .frame > picture > img, .frame > svg { position:absolute; inset:0; width:100%; height:100%; }
.frame > svg { overflow:visible; }                                   /* viewBox = píxeles de la imagen, preserveAspectRatio="none" */
.anchor { position:absolute; left:calc(var(--ax) * 100%); top:calc(var(--ay) * 100%); } /* --ax/--ay en 0–1 de la imagen */

/* Arte dirigido por PROPORCIÓN: tablet vertical y celular usan el plano vertical */
@media (max-width:767px), (max-aspect-ratio:5/6) { .frame { --r:var(--r-v); --fx:var(--fx-v); --fy:var(--fy-v); } }
```

`Scene.astro` escribe `--r`, `--fx`, `--fy`, `--r-v`, `--fx-v` y `--fy-v` desde los metadatos de la imagen en el build. El `<picture>` usa el mismo `media` en su `<source>`.

**R2 · Velo direccional + fundido inferior** (B·D1, C·1.5; ajustado a la portada anclada abajo):

```css
.fx { position:absolute; inset:0; z-index:-4; pointer-events:none; background:
  linear-gradient(var(--side,90deg), rgb(3 4 11/.92) 0%, rgb(3 4 11/.70) 26%, rgb(3 4 11/.18) 46%, transparent 58%),
  linear-gradient(180deg, rgb(3 4 11/.55) 0%, transparent 18%, transparent 72%, var(--ink) 100%); }
.scene[data-side="left"] { --side:270deg; }
@media (max-width:767px), (max-aspect-ratio:5/6) {
  .fx { background:linear-gradient(180deg, rgb(3 4 11/.6) 0%, transparent 30%, transparent 82%, var(--ink) 100%); } }
```

**R3 · Bordes fundidos en pantallas ultra anchas:** por encima de 1800 px, la máscara de 4 lados de B·D1 se aplica al `.frame` (no a la `img`) para que las capas registradas se fundan con ella.

**R4 · Gradado + grano (unificación):** una capa `mix-blend-mode: color` al 28 % sobre la imagen (B·D12) y **un solo grano global** en `body::after` (opacidad .06–.07, `overlay`). La corrección principal se pide en la generación.

**R5 · Retrato editorial en duotono (personas reales):** el filtro `#duo-ingeniak` de B·D5 + contraluz lateral `screen`. Solo para fotos reales del equipo; las caras no se tocan.

**R6 · Cabecera detrás del sujeto:** palabra gigante `aria-hidden` entre el plano y el recorte con alfa, **ambos dentro del mismo `.frame`** (así el registro es exacto incluso con parallax). La palabra se mueve; plano y recorte no se mueven entre sí. Si se quiere parallax entre fondo y sujeto, hace falta un *clean plate* (B·D3).

**R7 · Par de planos registrados (antes → después):** dos `<img>` en el mismo `.frame`; el segundo entra solo por opacidad. Se usa en "El problema" de Inicio y, si el cliente lo aprueba, en las portadas de caso (plano A = el reto, plano B = el resultado).

**R8 · Espejo:** `.frame.is-mirrored { scale:-1 1 }` solo para planos sin texto ni logos (todos, por regla de generación). Las capas registradas se espejan con ellos.

**R9 · Pie de foto anclado:**

```css
.caption { position:absolute; left:calc(var(--ax)*100%); top:calc(var(--ay)*100%); width:min(300px,22vw);
  padding:12px 14px 13px; border-radius:14px;
  background:linear-gradient(150deg,rgb(255 255 255/.10),rgb(255 255 255/.03) 50%,rgb(69 93 255/.10));
  -webkit-backdrop-filter:blur(18px) saturate(150%); backdrop-filter:blur(18px) saturate(150%);
  box-shadow:inset 0 1px 0 rgb(255 255 255/.25), inset 0 0 0 1px rgb(255 255 255/.08), 0 20px 60px rgb(0 0 0/.45); }
.leader { position:absolute; width:1px; background:linear-gradient(var(--cyan), rgb(0 229 255/.15)); }
.leader::before { content:""; position:absolute; left:-3px; top:-3px; width:7px; height:7px; background:var(--cyan); box-shadow:0 0 14px var(--cyan); } /* nodo cuadrado = isotipo */
```

Reglas:

- El pie de foto nunca tapa cara ni torso: va en la zona de piso o niebla y su línea guía apunta al sujeto.
- Cada plano define sus propias coordenadas de ancla. Si el plano vertical no tiene ancla, el pie baja al flujo de texto como una línea `Fig. 01 · …`.
- Trampa de B·D4: ningún ancestro del pie de foto puede tener `opacity`, `filter` o `mask` animados. Por eso se anima el `.frame` con `transform` y no con `opacity`.

### 6.6 Botones y enlaces

```css
.btn { display:inline-flex; align-items:center; gap:14px; height:56px; padding:0 8px 0 24px; border-radius:999px;
  background:var(--blue); color:#fff; font:600 15px/1 var(--f-text);
  box-shadow:inset 0 0 0 1px rgb(255 255 255/.14), 0 12px 44px rgb(0 85 255/.55);
  transition:transform var(--t-hover) var(--ease-ui), box-shadow var(--t-hover) var(--ease-ui); }
.btn i { width:40px; height:40px; border-radius:50%; background:rgb(255 255 255/.16); display:grid; place-items:center;
  transition:transform var(--t-hover) var(--ease-ui); }
.btn:hover i { transform:translateX(4px); } .btn:active { transform:scale(.98); }
.btn:focus-visible, .lnk:focus-visible { outline:2px solid var(--cyan); outline-offset:3px; }
.lnk { display:inline-flex; gap:10px; align-items:center; font:500 15px/1 var(--f-text); padding:8px 0;
  background:linear-gradient(var(--cyan),var(--cyan)) 100% 100% / 100% 1px no-repeat;
  transition:background-size .45s var(--ease-ui); }
.lnk:hover { background-size:0 1px; background-position:0 100%; }   /* el subrayado se retira y vuelve a trazarse */
.lnk--mono { font:500 11px/1 var(--f-mono); letter-spacing:.16em; text-transform:uppercase; color:var(--cyan); background:none; }
```

- **`.btn` (azul):** solo para "Agenda tu Discovery Session", en todo el sitio. Es magnético (±6 px con `gsap.quickTo`, solo con `pointer: fine`).
- **`.lnk`:** "Escríbele a Kain ↗", "Leer reportaje".
- **`.lnk--mono`:** "→ 301", "Ver todos".

### 6.7 Filas y planas (lo que reemplaza a las tarjetas)

- **Fila de índice** (servicios, industrias, casos, relacionados): `grid-template-columns: 6ch 1fr auto auto` → folio · nombre (Lexend 600/500) + línea · cifra · flecha. Filete superior. Al pasar el cursor: un barrido de luz (`linear-gradient` que se desplaza), el nombre avanza 8 px y, si la sección lo soporta, cambia la imagen de fondo.
- **Plana** (hub de casos, blog, relacionados en móvil): la imagen llena la pieza, sin borde ni radio, con máscara inferior hacia `--ink`, cifra o título en la zona oscura y filete superior con folio. Al pasar el cursor, la imagen va de `scale 1 → 1.04` en .8 s y un brillo cruza el filete.
- **Pliego (spec sheet):** tabla semántica (`<table>`) con filetes; en celular cada fila se vuelve un bloque con etiquetas mono.
- **Recuadro de nota** ("Nota del editor", "Nota de método"): filete de 1 px `--hair-2` en los 4 lados, sin fondo, con la etiqueta mono incrustada en el filete superior.

---

## 7. Escenas de portada (8)

Reglas comunes, además de B·6 y C·1.3 que siguen vigentes:

- **Escritorio 16:9** (como la receta aprobada: Nano Banana Pro, count 2–3, upscale creativo 2×). El lado del texto queda limpio en el 50–55 %, y **la mitad inferior del lado del texto debe ser la más oscura**, porque ahí se ancla el titular.
- **Vertical 9:16:** el texto arriba (los primeros 45–50 % vacíos) y el sujeto abajo, como en el `hero-home-movil-d` aprobado. ⚠️ Esto contradice D·4.2 ("sujeto en el 55 % superior"). FOLIO adopta la receta aprobada: el CTA queda sobre el sujeto sin taparlo y la portada se lee de arriba abajo como una revista. Hay que actualizar D.
- **Retratos de personas:** son "retrato editorial de revista de negocios": lente de 85 mm, plano americano (de la rodilla a la cabeza), mirada fuera de cámara hacia el lado del texto, luz principal fría y suave desde el lado del texto, contraluz cian desde atrás y el lado de sombra fundido en navy. Son personas **ilustrativas**, sin nombre ni cita.
- **Kain:** siempre de cuerpo completo, fiel a `kain-presenta.png` + `kain-01-hero.png` (referencias de la receta).
- Se entrega con el **mapa de anclas** (coordenadas 0–1 de la imagen) que medimos al recibir cada archivo: ojos, mano o celular, centro de luz y pie de foto.

| # | Página (folio) | Archivo (D) | Sujeto y lado | Composición escritorio | Vertical | Anclas y pie de foto |
|---|---|---|---|---|---|---|
| 1 | Inicio (001) | `home-hero` = **`hero-home-desk-2x.jpg` aprobado** | Kain a la derecha (x 72–91 %) presentando el isotipo de cristal (x 45–74 %, y 19–63 %) | Ya cumple: el cuadrante inferior izquierdo está limpio para el titular | `hero-home-movil-d.png` (aprobado) | Mano (.65, .53) · ojos (.759, .275) y (.798, .275) · centro del cristal (.63, .40) · pie "Fig. 01 · Kain" |
| 2 | Agentes de IA para WhatsApp (102) | `agentes-whatsapp-hero` | Mujer de 30 años a la izquierda, sentada en el brazo de un sofá, tres cuartos, escribiendo | Sala de noche; **la pantalla del celular es su luz principal** (cian sobre el rostro); detrás, una ventana con ciudad en bokeh azul; el 55 % derecho limpio | Ella en el 50–95 % inferior, con el celular a 62 % de alto | Celular → burbujas HTML registradas |
| 3 | Salud (201) | `ind-salud-hero` | Odontóloga de 40 años a la derecha, con bata, brazos relajados, mirando a la izquierda | Consultorio dental al cierre del día; sillón desenfocado detrás; luz blanca fría y contraluz cian en hombros y cabello; el 55 % izquierdo en penumbra | Ella en la mitad inferior; el sillón como silueta | Pie: "12 → 47 citas al mes en promedio · salud" junto a la bata |
| 4 | Clínica dental en Monterrey (301) | `caso-dental-hero` | Odontólogo de 45 años a la derecha, junto a un ventanal, de pie | **Hora azul** (no atardecer cálido: una sola luz fría); siluetas de montaña desenfocadas sin rasgos reconocibles; reflejo del vidrio. **El 55 % izquierdo debe ser el más limpio del sitio**: ahí va "3.2×" a 24vw | Él abajo a la derecha; arriba, cielo de hora azul vacío para la cifra | Esquina inferior derecha: `IMAGEN ILUSTRATIVA DEL SECTOR` |
| 5 | Metodología VKTOR™ (401) | `metodologia-hero` + **recorte con alfa** | Kain al centro-derecha (x 55–70 %) de pie sobre el cuarto de 5 escalones de cristal que suben hacia la derecha | **La cabeza de Kain cae dentro de la franja 18–42 % de alto**, donde vive la cabecera "VKTOR". Fondo navy con niebla al nivel de los escalones; el cuadrante inferior izquierdo limpio para el H1 | Kain abajo; la cabecera "VKTOR" a 30vw en la franja 40–55 % | Escalones 1–5 = anclas para los números de fase |
| 6 | Nosotros (403) | `nosotros-hero` (foto **real**) | Equipo a la derecha | `team-hero` extendido a 16:9 hacia la izquierda con outpainting navy + ondas sedosas; duotono R5; las caras no se alteran. **Recomendación:** una sesión real de los 6 integrantes con contraluz cian sería la mejor imagen del sitio | Recorte 4:5 del grupo + extensión superior | Pie: "+73 sistemas en producción · 7 países" |
| 7 | Discovery Session (600) | `discovery-hero` | Dueño de pyme de 45 años a la derecha, **de pie junto a su silla vacía**, con una mano en el respaldo | Oficina de noche; en el escritorio, una laptop abierta con una videollamada **sin caras ni texto** (solo el brillo); la luz de la pantalla lo ilumina de lado | Él y la silla abajo | Pie: "30 min · 1:1 · Google Meet · sin costo" junto a la laptop |
| 8 | Kain (400) | `kain-hero` + recorte | Kain **al centro** (la única portada centrada además de los cierres), retrato de producto, de pie y saludando | Estudio navy con piso reflectante y un anillo de luz detrás. La palabra "kain" en minúsculas como cabecera gigante detrás (R6). El texto flanquea: H1 a la izquierda y CTA + "Ir a app.kain.mx" a la derecha (patrón 1X) | Kain abajo al centro; "kain" en la franja media | Ojos para el parpadeo en la entrada |

**Prompts** (inglés; se adjuntan las referencias de la receta):

1. *(existe; no se regenera)*
2. `Editorial portrait for a premium business magazine, cinematic 16:9 wide shot. A Mexican woman in her early 30s sits on the arm of a sofa on the LEFT third of the frame (center x ≈ 28%), three-quarter view, typing on her smartphone held at chest height; the phone screen is her key light, casting soft cyan (#00E5FF) light on her face; behind her a large window with a blurred night city in deep blue bokeh. The RIGHT 55% of the frame is deep navy-black negative space (#03040B) with a faint blue haze, clean and empty. Rim light cyan on hair and shoulder, the shadow side dissolves into the background. 85mm lens, f/2, subtle film grain, color grade deep navy, electric blue and cyan. No text, no letters, no logos, no readable UI on the phone screen.`
3. `Editorial portrait for a premium business magazine, cinematic 16:9. A Mexican female dentist in her 40s wearing a white clinical coat stands on the RIGHT third (center x ≈ 72%), cowboy shot, arms relaxed, looking toward the left of the frame. Behind her, a modern dental office at closing time, dental chair softly out of focus, cool white light. Cyan (#00E5FF) rim light on shoulders and hair. The LEFT 55% is clean deep navy-black (#03040B) negative space, darkest in the lower half. 85mm, f/2, fine grain, navy/blue/cyan grade. No text, no logos, no readable screens.`
4. `… a Mexican male dentist in his mid 40s standing next to a floor-to-ceiling window on the RIGHT third (center x ≈ 74%), blue hour after sunset, distant mountain silhouettes completely out of focus with no recognizable landmark, reflections on the glass. A single cool light source. The LEFT 55% of the frame must be the cleanest, darkest navy area (#03040B to #0A1F4C) with no objects, no window frames and no reflections, reserved for a giant number. …`
5. `Cinematic 16:9. The white robot character from the first reference image (exact same design…) stands full body on the fourth of five ascending glass steps that rise toward the right, positioned at center-right (x ≈ 62%); his head sits between 20% and 38% of the frame height. Each glass step has a faint cyan edge glow. Deep navy fog at step level. The LOWER-LEFT quadrant is clean dark negative space. No text, no letters, no logos.` → y luego `images_remove_background` sobre el resultado para el recorte con las mismas dimensiones.
6. *(foto real; outpainting a la izquierda: `extend the dark navy background with soft silky blue waves, no people, no objects, no text`)*
7. `Editorial portrait, cinematic 16:9. A Mexican small-business owner in his mid 40s stands on the RIGHT third beside his empty office chair, one hand resting on the backrest, calm expression, looking at an open laptop on the desk whose screen glows blue (a video call layout with no faces and no text, only light). Night office, deep navy, cyan rim light from behind. LEFT 55% clean navy-black negative space. 85mm, f/2.2, grain. No text, no logos.`
8. `Product-style studio portrait, cinematic 16:9. The white robot character from the reference (exact design) stands full body at the exact CENTER of the frame waving with the right hand, on a glossy dark reflective floor, a thin circular ring of cyan light behind him at chest height. Both left and right thirds are dark navy negative space. No text, no letters, no logos.`

Vertical de cada una: la plantilla vertical de la receta ("camera pulled far back… head at 58% … feet at 92% … upper half empty navy void"), usando la imagen de escritorio elegida como primera referencia. **Nunca** `images_expand` (mete texto basura, según la receta).

---

## 8. Sistema de movimiento

### 8.1 Niveles

| Nivel | Nombre | Qué se mueve | Duración / ease | Dónde |
|---|---|---|---|---|
| 1 | Tinta | Filetes `scaleX 0→1`; textos `y 12→0` + `autoAlpha`; stagger .04 | .6 s · `expo.out` | Todo lo que no es escena |
| 2 | Revelado | Velo `.7→0`; SplitText por líneas (`mask: 'lines'`); conteo de cifras; parallax 4–6 % del `.frame`; *cross-fades* | 1–1.2 s · `expo.out`; *cross-fade* `power2.inOut` | Escenas `[CINE]`, datos |
| 3 | Plana completa | Pin + scrub: Registro, Fig. 2, riel de reportajes, VKTOR fijado, "Un día en tu recepción" | Scrub .6–1; `snap` por paso | Máximo 3 en Inicio, 1 en internas |

**Límites de sobriedad:**

- Nada se repite en bucle salvo: el halo de Kain en Perfil (solo en pantalla), el pulso de la rama activa (cada 3 s) y la línea del CTA de contraportada.
- Sin marquesinas, sin orbes, sin `hover: scale(1.05)` en tarjetas.
- Kain parpadea **una sola vez**, en la entrada.

### 8.2 Recetas reutilizables

```js
// src/motion/index.js — un solo punto de entrada, todo dentro de matchMedia
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const lenis = new Lenis({ lerp: .1 });
  const raf = (t) => lenis.raf(t * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);

  // Tinta: filetes
  gsap.utils.toArray('.rule, .running-head').forEach((el) =>
    gsap.from(el, { scaleX: 0, transformOrigin: 'left', duration: .9, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' } }));

  // Revelado de escenas (internas): velo + líneas del titular + parallax registrado
  gsap.utils.toArray('.scene:not(.scene--home)').forEach((s) => {
    const q = gsap.utils.selector(s);
    SplitText.create(q('.h-display-2, .h2'), { type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (sp) => gsap.from(sp.lines, { yPercent: 105, stagger: .09, duration: 1, ease: 'expo.out',   // se devuelve: autoSplit la revierte al re-dividir
        scrollTrigger: { trigger: s, start: 'top 70%' } }) });
    gsap.fromTo(q('.veil'), { autoAlpha: .8 }, { autoAlpha: 0, duration: 1.2,
      scrollTrigger: { trigger: s, start: 'top 75%' } });
    gsap.to(q('.frame'), { yPercent: 5, ease: 'none',                 // ambos frames: las capas siguen registradas
      scrollTrigger: { trigger: s, start: 'top top', end: 'bottom top', scrub: true } });
  });

  // Contar: el valor final vive en el HTML
  gsap.utils.toArray('[data-count-from]').forEach((el) => {
    const to = parseFloat(el.dataset.value), from = parseFloat(el.dataset.countFrom), dec = (el.dataset.value.split('.')[1] || '').length;
    const fmt = (v) => (el.dataset.prefix || '') + v.toFixed(dec) + (el.dataset.suffix || '');
    const o = { v: from };
    gsap.to(o, { v: to, duration: 1.1, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)),
      scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
  });

  return () => { gsap.ticker.remove(raf); lenis.destroy(); };   // limpieza al cambiar la preferencia
});

// Riel de reportajes (escritorio): matchMedia propio, no anidado
mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
  const rail = document.querySelector('.rail'); if (!rail) return;
  const panels = gsap.utils.toArray('.rail__panel');
  const tween = gsap.to(panels, { xPercent: -100 * (panels.length - 1), ease: 'none',
    scrollTrigger: { trigger: rail, pin: true, scrub: 1, snap: 1 / (panels.length - 1),
      end: () => '+=' + rail.offsetWidth * (panels.length - 1), invalidateOnRefresh: true } });
  panels.forEach((p) => gsap.from(p.querySelector('.mega'), { yPercent: 30, autoAlpha: 0, duration: .8,
    scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 60%' } }));
});
mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.utils.toArray('.scene .veil').forEach((v) => gsap.set(v, { autoAlpha: 0 }));   // todo visible, sin pin
});
```

### 8.3 Presupuesto y accesibilidad

- JS de movimiento ≤ 75 KB gzip (core + ScrollTrigger + SplitText + DrawSVG + MorphSVG + ScrambleText + Lenis). MorphSVG y ScrambleText **solo se cargan en Inicio** con `import()` dinámico.
- LCP < 2.5 s en 4G (la portada se precarga con AVIF; el velo no cuenta). CLS < .05 (alturas en `svh` fijas y `width`/`height` en todas las `img`).
- Sin WebGL. Video solo el chat de Kain, con `preload="none"` y fuera del primer viewport.
- Máximo ~6 `backdrop-filter` visibles a la vez.
- Contraste AA medido sobre el punto más claro bajo el texto. Los textos `muted` solo donde el velo es ≥ .75.
- Con `prefers-reduced-motion`: sin Lenis, sin pin, sin SplitText; quedan fundidos de .3 s.

---

## 9. Implementación en Astro

```
src/
  data/sitemap.json            ← D-sitemap.json + campos nuevos: folio, plates{desktop,vertical,anchors}, intensity
  data/navegacion.json         ← D-navegacion.json (+ folio por opción)
  components/
    Scene.astro                ← R1–R9: stage registrado, fx, velo, capas, slots (copy, caption, overlay)
    Folio.astro                ← cabecera corrida + BreadcrumbList
    CoverLines.astro  Caption.astro  Standfirst.astro  Definition.astro
    IndexRow.astro  Plate.astro  SpecSheet.astro  DataSpread.astro  EditorNote.astro  Fn.astro
    SystemFig.astro            ← isotipo-sistema (5 partes, data-part)
    Rail.astro  LiveIndex.astro  Masthead.astro (VKTOR / kain)  Profile.astro  Transcript.astro
    MegaIndex.astro  IndexOverlay.astro  BottomBar.astro  Colophon.astro
  layouts/  T-HOME  T-SERVICE  T-PLATFORM  T-INDUSTRY  T-CASE  T-HUB  T-METHOD  T-ARTICLE  …
  motion/   index.js  registro.js (solo Inicio)  paso-de-plana.js  rail.js  live-index.js  system-fig.js
  styles/   tokens.css  type.css  grid.css  scene.css  components.css
public/img/escenas/<pagina>-<seccion>-{2400,1440}.avif|webp · -v-768.avif · .trace.svg · -recorte.webp
```

- `Scene.astro` recibe `plate`, `plateVertical`, `side`, `focal`, `focalVertical` y `anchors` (en coordenadas 0–1 de cada plano), además de `cutout`, `relit`, `variant` (portada | media | contraportada) e `intensity`. Con `getImage()` genera AVIF/WebP y escribe `--r` desde las dimensiones reales.
- **Validaciones del build** (se suman a las de D·16):
  1. cada página tiene `folio` único;
  2. cada `[CINE]` tiene plano vertical;
  3. cada cifra visible coincide con la lista confirmada (un diccionario en `data/cifras.ts`; si no coincide, el build falla);
  4. ningún `<h1>` está dentro de la imagen;
  5. una sola clase `.lit` por página;
  6. el botón azul solo enlaza a `/discovery/` (o a la agenda dentro de `/discovery/`).

---

## 10. Cómo cumple el requisito obligatorio (verificación)

- [x] **Imagen como fondo de toda la sección**, sujeto de un lado y textos y botones del otro: portada, problema, perfil, reportajes, VKTOR, índice vivo, directorio y contraportada en Inicio; 3–4 escenas por plantilla interna.
- [x] **Se siente una sola sección:** sin columna de imagen, sin caja de texto, velo del mismo color que el lienzo, fundido inferior, solape `--seam`, pie de foto **cosido** al sujeto con línea guía y titular apoyado en el piso de la misma escena. Probado en [`concepto-authority-portada-1440.jpg`](concepto-authority-portada-1440.jpg).
- [x] **Celular sin tapar al personaje** (el error del sitio actual): plano vertical dedicado, texto arriba y Kain abajo. Probado en [`concepto-authority-responsive.jpg`](concepto-authority-responsive.jpg).
- [x] **Tablet vertical:** arte dirigido por proporción, no por ancho (con el plano de escritorio a 1024×1366, Kain llenaba la pantalla y el sumario tapaba el cristal; corregido).
- [x] **Escritorio bajo (1280×720):** el sumario sale del hero para que el CTA siempre quede visible.
- [x] **Cristal** solo sobre imagen o luz; **secciones animadas con scroll** y **motion graphics** en los 4 verbos del sistema.

## 11. Riesgos y decisiones abiertas

1. **Trazo del isotipo de cristal:** la animación firma depende de un trazo vectorial hecho a mano sobre la imagen aprobada (≈ 1 h). Si la imagen cambia, se rehace.
2. **Lexend 200:** el `woff2` de v1 declara 300–700. Sin el eje completo, las cifras mega se ven en 300 (más pesadas, pero aceptables).
3. **Par de planos del "problema":** si Nano Banana no conserva el encuadre al editar, se cambia el *cross-fade* por un corte con filete (sin registro).
4. **Contradicción con D·4.2** (composición vertical): FOLIO usa la receta aprobada (texto arriba). Hay que actualizar D y el brief de las 86 imágenes.
5. **Pendientes del cliente que afectan a FOLIO:** detalles de los 5 casos (sin ellos, los reportajes C4–C7 quedan cortos y se apoyan en las secciones de imagen); autores reales para las firmas; aprobación de usar la palabra "Folio" y la numeración visible; una sesión de fotos real del equipo (recomendada).
6. **Riesgo de tono:** "revista" puede leerse como "blog". Se evita porque la tipografía es de portada (600, apretada, enorme) y no de lectura, y porque la conversión (Discovery) está en cada portada y contraportada.
