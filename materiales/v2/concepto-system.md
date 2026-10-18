# Concepto v2 · SISTEMA VIVO (Ingeniak Runtime)

> Ángulo: **Living System / Product-grade.** El sitio se siente como un producto de IA premium (precisión tipo Linear o Vercel): bentos, demos de interfaz que funcionan (chat, pipeline, flujo, tablero), líneas de conexión que nacen del isotipo y paneles de cristal sobre fondos cinematográficos.
> Fecha: 18 oct 2026 · Stack fijo: Astro SSG + GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG, Flip; todos gratuitos desde 3.13) + Lenis 1.3.11 · Vercel.
> Insumos: `A-sitio-actual.md`, `B-referencias.md` (decisiones D1–D12), `C-benchmark.md` (patrones 1–35, plantillas T1–T13), `D-arquitectura.md` (45 páginas, keywords, FAQ, sitemap.json). Este documento **no repite** esas especificaciones: las usa y dice dónde las cambia.

---

## 0. Ficha del concepto

| | |
|---|---|
| **Nombre** | **SISTEMA VIVO** (nombre interno del motor visual: *Ingeniak Runtime*) |
| **La idea en una frase** | El sitio no *describe* el sistema de Ingeniak: **lo corre frente a ti**. En cada escena cinematográfica Kain (o la persona del sector) sostiene la interfaz del trabajo real (chat, pipeline, flujo, tablero), y una rama de luz del isotipo la conecta con tu botón de Discovery. |
| **Promesa visual** | Escena de cine + UI de producto + una sola línea de luz que une todo. |
| **Cómo cumple el requisito del cliente** | Cada hero y cada sección texto + imagen es **una sola imagen a sangre** con tres zonas: texto (T), bolsillo de interfaz (U) y sujeto (S). La interfaz HTML va **registrada encima de un objeto que existe dentro de la imagen** (una placa de cristal en blanco que Kain sostiene o presenta), así que imagen, interfaz y texto se leen como un solo plano. No hay columna de imagen ni caja detrás del texto. |
| **Qué lo hace disruptivo** | (1) La interfaz vive *dentro* de la foto, no encima en una tarjeta. (2) La geometría del isotipo es la estructura del sitio: el pilar es la columna de navegación ("Espina"), los brazos son las ramas que conectan secciones y demos, el nodo cuadrado es el estado activo. (3) Un lead simulado recorre las 5 piezas del sistema en una sola sección fijada al scroll. (4) Búsqueda tipo producto con ⌘K. En el benchmark (`C-benchmark.md` §3) ningún competidor de LATAM integra imagen e interfaz de esta forma. |
| **Qué NO es** | No es un SaaS frío ni un sitio "falso en vivo". **Vivo = animado y conectado, nunca "en tiempo real" inventado.** Nada dice "en vivo" ni "hace 2 h"; ningún contador sube solo. Toda demo lleva la etiqueta **Simulación**, y las cifras que aparecen son solo las confirmadas, con su fuente. |

### 0.1 Por qué este ángulo le gana al sitio actual y a la v1

| Problema | ingeniak.mx actual | v1 | Sistema Vivo |
|---|---|---|---|
| Relación imagen–texto | Robot a sangre, pero el texto en una tarjeta de cristal grande que en móvil tapa al robot | Imagen arriba y texto abajo, o en columnas | Una imagen, tres zonas; la interfaz es parte de la escena; en móvil la imagen 9:16 tiene a Kain arriba y el texto encima del fundido |
| Prueba | Cifras en píldoras, testimonios falsos, toasts falsos | Cifras correctas en tarjetas de texto planas | Las cifras confirmadas viven dentro de demos que muestran *cómo* se lograron |
| Densidad de "eventos" | 16+ momentos, mucho relleno | 13 secciones casi iguales y bandas negras de 300–500 px | 14 momentos distintos en el home y ninguna banda sin luz de más de 200 px |
| Personaje | Kain negro, otro robot en consultoría | Kain escondido en la sección 7 | Kain blanco opera en cada página de servicio (efecto franquicia) |
| Estructura | 18 URLs de plantilla | One-page | 45 páginas (D) con un motor visual común |

---

## 1. Lo que se ve en los primeros 5 segundos

**Desktop 1440×900.** Pantalla casi negra. En el centro se enciende un nodo cuadrado cian. De él baja un pilar y se abren cuatro brazos: es el isotipo, dibujándose. Los brazos se estiran hasta los bordes y se vuelven dos líneas horizontales. El isotipo se encoge y vuela hasta el asterisco del pecho de Kain. Desde ese punto **se enciende la escena**: Kain blanco de cuerpo completo en el tercio derecho, haz vertical detrás, una placa de cristal flotando sobre su mano abierta. En la placa aparece un chat de WhatsApp que se escribe solo (11:48 p. m.: "¿Tienen cita mañana?"; Kain responde y agenda). Una rama cian sale de la placa, cruza el hueco oscuro y termina en el botón azul **Agenda tu Discovery Session**, que recibe un destello en el borde. A la izquierda subieron las líneas del H1. Total: 2.2 s, y cualquier scroll o tecla lo acelera.

**Móvil 390×844.** Versión corta de 0.9 s, sin isotipo volador: la escena 9:16 se enciende desde el pecho de Kain (arriba), aparece una burbuja de chat a su izquierda y debajo, sobre el fundido, el H1, el texto y los dos botones.

```
DESKTOP · hero (21:9 recortado a 16:10)
┌──────────────────────────────────────────────────────────────────────────┐
│ [▣ ingeniak]  Servicios▾ Industrias▾ Casos▾ Kain▪ Empresa▾ Recursos▾   ⌘K   (Escríbele a Kain)  [Agenda tu Discovery Session] │
│ ┊                                                                        │
│ ┊ ▪ AGENTES DE IA · CRM · AUTOMATIZACIÓN        ╭──────────╮   ║  ╭─╮    │
│ ┊                                               │ chat     │   ║  │K│    │  S = sujeto
│ ▣─ Agentizamos                                  │ (placa   │◄──╫──┤*│    │  U = placa de cristal
│ ┊  empresas.                                    │ en la    │   ║  ╰┬╯    │      generada en la imagen
│ ┊  Agentes de IA, CRM y automatización          │ imagen)  │   ║  /│\    │      + HTML registrado
│ ┊  en un solo sistema.                          ╰────┬─────╯   ║  / \    │
│ ┊  Kain responde tu WhatsApp en segundos…            │         ▣═════▣   │  ▣ = nodo cuadrado (piso)
│ ┊  [Agenda tu Discovery Session]◄────────────────────╯  (8 min → 12 s)   │
│ ┊  (Escríbele a Kain)                                                    │
│ ┊  Partner oficial de Kommo en LATAM · +73 sistemas · 7 países           │
│ ┊          T = 0–46 %                │ U = 50–64 % │  S = 64–88 %        │
└┊──────────── los 4 bordes se funden con #03040B ─────────────────────────┘
 ┊ ← la Espina (pilar del isotipo): progreso y capítulos
```

---

## 2. Gramática visual: 5 primitivas + la Espina

Todo el sitio se construye con cinco piezas. Si una sección necesita algo que no sea una de ellas, la sección está mal diseñada.

| Primitiva | Qué es | Origen | Regla |
|---|---|---|---|
| **Escena** | Imagen generada a sangre, 21:9 en escritorio y 9:16 en móvil, con zonas T · U · S | Requisito del cliente; B-D1 | Única forma de mostrar una persona o a Kain. Nunca dentro de una tarjeta. |
| **Nodo** | Cuadrado de 6–8 px, cian, con glow | Nodo superior del isotipo | Marca estado: activo, paso, punto de anclaje, viñeta. Nunca círculos. |
| **Rama** | Línea de 1–1.25 px, cian al 35 % (base) o al 100 % (activa), con codos de radio 12 px y tramos a 45° | Brazos del isotipo | Conecta sujeto → interfaz → botón; conecta la Espina con cada capítulo. Nunca cruza un texto. |
| **Panel** | Ventana de cristal con barra de título en mono y UI real en HTML (chat, pipeline, flujo, tablero, ficha) | Linear (UI en HTML), B-D4 | Solo sobre imagen o atmósfera (algo borroso detrás). Sobre negro plano usa la versión sólida. |
| **Pulso** | Guion de luz que viaja por una rama | Boltshift (ref. 4) | Significa "pasó algo" (dato que viaja, paso completado). Nunca decorativo en bucle infinito, salvo 1 pulso cada 4–6 s en el hub del stack. |

**La Espina** (pilar del isotipo hecho navegación). En pantallas ≥1280 px, una línea vertical de 1 px fija en el margen izquierdo (x = 20 px) recorre toda la página. Cada capítulo tiene un nodo con su índice en mono ("03"). El tramo recorrido se llena de cian con el scroll. Cuando un capítulo entra, una rama corta sale del nodo hacia el eyebrow de la sección, solo si el texto está a la izquierda. Al hacer hover sobre un nodo aparece su nombre; al hacer clic, Lenis lleva a esa sección. Arriba, la Espina arranca en una rama corta que sale del isotipo del logo y baja al margen, así que el header es literalmente el "nodo superior" del sitio. En móvil y tablet no existe; la reemplaza el nodo del eyebrow.

### 2.1 Reglas de oro (no negociables)

1. **Una imagen, tres zonas.** T (texto) en 0–46 % del ancho, U (bolsillo de interfaz) en 50–64 %, S (sujeto) en 64–88 %, en espejo cuando el sujeto va a la izquierda. El copy ocupa 5 columnas: 1–5, o 8–12 en espejo. La imagen se genera así; el CSS solo lo remata.
2. **La interfaz vive en la escena.** En escenas con Kain, la imagen incluye una placa de cristal en blanco que él sostiene o presenta, y el HTML se monta encima, registrado con anclas en CSS (§4.3). En escenas con personas, U es un hueco oscuro y desenfocado del fondo, reservado para 1 panel o 2 chips.
3. **Una línea, un recorrido.** En cada escena la mirada sigue sujeto → panel → botón por una sola rama. Nunca dos ramas que compitan.
4. **Cifras con ID.** Ningún componente acepta un número libre: las cifras salen de `metrics.ts` por ID y llevan su fuente (§11.3).
5. **Simulación siempre etiquetada.** Toda demo lleva en su barra de título `SIMULACIÓN` en mono. En las simulaciones solo aparecen horas del día y cifras confirmadas; ningún otro número (ni IDs de lead, ni contadores de mensajes).
6. **Azul = acción, cian = señal, ámbar = dolor.** El índigo solo aparece como paso intermedio de un degradado.
7. **Cristal solo sobre algo.** Si detrás no hay imagen ni atmósfera, se usa panel sólido `#070B18`.
8. **Sin bandas muertas.** Ningún tramo de más de 200 px sin luz: escena, aura del isotipo, retícula con máscara o línea de bus.
9. **Todo el texto en HTML.** H1, CTA y textos de demo en el HTML inicial. Las demos llevan `data-nosnippet` para que su guion no salga en los resultados de Google.
10. **Reducir movimiento = estado final.** Con `prefers-reduced-motion`, cada pieza aparece ya terminada (chat completo, pipeline en su etapa final) con fundidos de 300 ms.

---

## 3. Animación firma: "Arranque"

El isotipo se dibuja, se convierte en el bus del sistema, vuela al pecho de Kain y enciende la escena. **Termina exactamente en el hero real** (HTML estático ya pintado debajo), así que no hay pantalla de carga ni una "intro" separada.

### 3.1 Guion (versión completa: primera visita al home, desktop)

| t (s) | Qué pasa | Técnica |
|---|---|---|
| 0.00 | La escena ya está pintada bajo un velo de tinta al 92 % (cuenta para el LCP). El H1 y los botones están en opacidad 0. | Clase `boot-full` puesta por un script en línea en `<head>` |
| 0.00–0.30 | Aparece el **nodo cuadrado** del isotipo en el centro de la pantalla (8 → 14 px) con un pulso de glow. | `scale` 0 → 1, `back.out(2)` |
| 0.15–0.50 | Baja el **pilar**. | DrawSVG 0 → 100 % |
| 0.35–0.75 | Se abren los **cuatro brazos** (dos arriba, dos abajo), con la curvatura del isotipo. | DrawSVG con stagger .06 |
| 0.60–1.10 | Los brazos superiores siguen hasta los bordes y se vuelven **dos líneas horizontales** (el bus). | DrawSVG `"50% 50%"` → `"0% 100%"`, `expo.out` |
| 0.85–1.35 | El isotipo se encoge al 8 % y **vuela al asterisco del pecho** de Kain (posición leída del ancla `chest`, §4.3). Las líneas del bus se apagan. | `x/y/scale`, `expo.inOut` |
| 1.10–1.90 | **La escena se enciende desde el pecho:** el velo se abre en un círculo que crece desde el ancla. Destello breve en ojos y pecho. | `--r` del `mask-image` radial 0 → 150vmax; brillo `screen` |
| 1.30–2.00 | Las líneas del H1 suben desde su máscara; luego el lede, los botones y la línea de confianza. | SplitText `mask:'lines'` |
| 1.40–1.80 | La **rama** sale del pecho hacia la placa de cristal. | DrawSVG |
| 1.60–2.20 | La **placa arranca**: barra de título, esqueleto de 200 ms y el chat escribiéndose (indicador "escribiendo…"). | Timeline del panel (§9.2) |
| 1.90–2.20 | La rama continúa de la placa al botón primario. Al llegar, **un destello recorre el borde del botón** una vez. | DrawSVG + `--ang` del borde cónico |
| 1.70–2.20 | Entran el header y la Espina; se enciende el nodo 01. | `yPercent` −100 → 0 |

**Versión corta (0.9 s):** visitas siguientes en la misma sesión, todas las páginas internas y móvil. No hay isotipo: el velo se abre desde el ancla del sujeto, sube el H1, se dibuja la rama y arranca el panel. En las páginas internas, la rama nace del isotipo del header y baja hasta el eyebrow (el sistema "conecta" la nueva página).

**Saltar:** cualquier `wheel`, `touchstart`, `keydown` o `pointerdown` acelera la línea de tiempo ×5. No se salta de golpe, para evitar un corte brusco. No se bloquea el scroll.

**Red de seguridad:** si el JS no carga en 3 s, una animación CSS lleva el velo a 0 y el texto a 1. La página siempre termina legible.

### 3.2 Código (esqueleto implementable)

```html
<!-- BaseLayout.astro, dentro de <head>, antes del CSS -->
<script is:inline>
(function(){var d=document.documentElement;try{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  d.classList.add('js');
  var full=!sessionStorage.getItem('ing:boot')&&d.dataset.page==='home'&&innerWidth>=1024;
  d.classList.add(full?'boot-full':'boot-short');
}catch(e){d.classList.add('boot-short')}})();
</script>
```

```css
@property --r { syntax: "<length>"; inherits: false; initial-value: 0px; }
.boot-full .scene--hero .scene__veil, .boot-short .scene--hero .scene__veil {
  opacity: .92; animation: veil-failsafe 0s 3s forwards; }
.boot-full .scene--hero [data-reveal], .boot-short .scene--hero [data-reveal] {
  opacity: 0; animation: reveal-failsafe 0s 3s forwards; }
@keyframes veil-failsafe { to { opacity: 0; } }
@keyframes reveal-failsafe { to { opacity: 1; } }
/* El velo se abre en círculo desde el ancla del sujeto (--cx/--cy los calcula el CSS de anclas, §4.3) */
.scene__veil {
  -webkit-mask-image: radial-gradient(circle at var(--cx) var(--cy), transparent var(--r), #000 calc(var(--r) + 28vmax));
          mask-image: radial-gradient(circle at var(--cx) var(--cy), transparent var(--r), #000 calc(var(--r) + 28vmax));
}
```

```js
// src/scripts/boot.ts
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(DrawSVGPlugin, SplitText);

export function boot(scene: HTMLElement) {
  const html = document.documentElement;
  if (!html.classList.contains('js')) return;
  const full = html.classList.contains('boot-full');
  const q = (s: string) => scene.querySelector(s)!;
  const veil = q('.scene__veil'), chest = q('.anchor--chest') as HTMLElement;
  const wire = scene.querySelectorAll('.wire path.live'), panel = q('.scene__panel');
  const iso = document.querySelector('.boot__iso') as SVGSVGElement | null;
  [veil, ...scene.querySelectorAll('[data-reveal]')].forEach(el => (el as HTMLElement).style.animation = 'none');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' },
    onComplete: () => { try { sessionStorage.setItem('ing:boot', '1'); } catch {} } });

  if (full && iso) {
    const c = chest.getBoundingClientRect(), b = iso.getBoundingClientRect();
    const n = iso.querySelector('.iso-node')!.getBoundingClientRect();
    const nx = n.left + n.width / 2, ny = n.top + n.height / 2;           // centro del nodo en el viewport
    tl.set(iso, { autoAlpha: 1, transformOrigin: `${nx - b.left}px ${ny - b.top}px` })   // origen = el nodo
      .from('.iso-node', { scale: 0, transformOrigin: '50% 50%', duration: .3, ease: 'back.out(2)' }, 0)
      .from('.iso-pillar', { drawSVG: '0%', duration: .35 }, .15)
      .from('.iso-arm', { drawSVG: '0%', duration: .4, stagger: .06 }, .35)
      .fromTo('.bus-line', { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: .5, ease: 'expo.out' }, .6)
      .to(iso, { x: c.left - nx, y: c.top - ny, scale: .08, duration: .5, ease: 'expo.inOut' }, .85)  // el nodo cae en el pecho
      .to('.bus-line', { autoAlpha: 0, duration: .3 }, 1.0)
      .set(iso, { autoAlpha: 0 }, 1.35)
      .from('.site-header', { yPercent: -100, duration: .5 }, 1.7)
      .from('.spine', { autoAlpha: 0, duration: .5 }, 1.7);
  }
  const t0 = full ? 1.1 : 0;
  tl.set(veil, { opacity: 1 }, t0)
    .fromTo(veil, { '--r': '0vmax' }, { '--r': '150vmax', duration: full ? .8 : .7, ease: 'power2.inOut' }, t0)
    .fromTo(scene.querySelectorAll('.ignite'), { opacity: 0, scale: .5 }, { opacity: 1, scale: 1, duration: .25, yoyo: true, repeat: 1 }, t0 + .05)
    .from(q('.scene__plate'), { scale: 1.06, duration: 1.6, ease: 'expo.out' }, t0);

  // [data-reveal] arranca en opacidad 0 por CSS: se anima con fromTo (un from() iría de 0 a 0)
  const h1 = q('h1');
  const rest = [...scene.querySelectorAll('[data-reveal]')].filter(el => el !== h1);
  const split = SplitText.create(h1, { type: 'lines', mask: 'lines', autoSplit: true });
  tl.set(h1, { opacity: 1 }, t0 + .2)
    .from(split.lines, { yPercent: 110, duration: .9, stagger: .08, ease: 'expo.out' }, t0 + .2)
    .fromTo(rest, { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .6 }, t0 + .45)
    .from(wire[0], { drawSVG: '0%', duration: .4 }, t0 + .3)
    .add(() => panel.dispatchEvent(new CustomEvent('panel:boot')), t0 + .5)
    .from(wire[1] ?? [], { drawSVG: '0%', duration: .3 }, t0 + .8)
    .add(() => document.querySelector('.btn--primary')?.classList.add('is-traced'), t0 + 1.1);

  const skip = () => tl.timeScale(5);
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(e => addEventListener(e, skip, { once: true, passive: true }));
}
```

**Recurso del isotipo de trazo:** `public/fx/isotipo-trazo.svg`, una versión de líneas del isotipo (no el relleno del logo): `rect.iso-node`, `path.iso-pillar` y 4 `path.iso-arm` con la misma curvatura, más 2 `path.bus-line` horizontales de borde a borde. Se dibuja una vez a partir de `public/img/marca/isotipo.svg`.

### 3.3 Transición entre páginas (multipágina con continuidad)

- **View Transitions entre documentos** (nativas, sin router SPA): `@view-transition { navigation: auto; }`. El header lleva `view-transition-name: header` y la Espina `spine`, así que **no se mueven** al cambiar de página. La escena saliente se funde y baja a escala .98 en 280 ms, y la entrante hace su arranque corto. Chrome 126+ y Safari 18.2+; los demás navegadores navegan normal.
- **No** se usa el `ClientRouter` de Astro: obligaría a reiniciar GSAP, Lenis y los ScrollTriggers en cada navegación, y el sitio no lo necesita.

---

## 4. La Escena viva (implementación del requisito obligatorio)

Parte de B-D1 (máscaras, velo y lienzo continuo) y de C-§1.4, y le agrega dos capas: **anclas registradas** y **panel dentro de la imagen**.

### 4.1 Capas (de atrás hacia adelante)

```
<section class="scene" data-side="right" data-tone="solucion">       isolation: isolate; sin fondo propio
  .scene__plate        z −5 · envoltorio que se mueve como UNA sola pieza (parallax y escala del arranque)
    .scene__media      <picture> a sangre, máscaras en los 4 bordes + gradado de color (B-D12)
    .scene__scrim      velo direccional del lado del texto + viñeta en el sujeto
    .scene__stage      contenedor de anclas (container-type: size), mismo tamaño que la imagen
      .glow            brillo detrás del sujeto (ancla)
      .ignite ×2       destellos de ojos y pecho para el arranque (ancla)
      .wire--short     rama sujeto → placa (SVG fijo en el ancla)
      .scene__panel    panel HTML registrado sobre la placa de la imagen + chips anclados
      .scene__veil     tinta del arranque; último hijo, tapa todo lo anterior; termina en opacidad 0
  .scene__inner        z 1 · retícula de 12 columnas: eyebrow, migas, H1, lede, botones, confianza
  .wire--cta           z 2 · rama placa → botón (SVG medido por JS, fuera del layout)
body::after            grano global único
```

- **Regla de movimiento:** todo lo registrado a la imagen (anclas, brillo, panel, rama corta, velo) vive dentro de `.scene__plate` y se mueve con ella. El texto se mueve más rápido (parallax diferencial). Así el panel nunca se "despega" del objeto que lo sostiene, y el velo nunca oscurece el texto.
- **Clics:** `.scene__inner` cubre toda la escena, así que lleva `pointer-events: none` y sus hijos directos `auto`; el panel lleva `pointer-events: auto` (botón de pausa, pestañas).

### 4.2 Zonas y lienzos

| Formato | Lienzo | T (texto) | U (bolsillo de interfaz) | S (sujeto) | Otros |
|---|---|---|---|---|---|
| Escritorio (≥1280 px y proporción ≥ 3:2) | 21:9 · 3360×1440 | x 0–46 %, todo el alto, navy limpio | x 50–64 %, y 22–62 % (placa de cristal en blanco o fondo oscuro desenfocado) | x 64–88 %; con Kain: cabeza 10–14 %, **asterisco del pecho a 40–44 %** (altura del H1), pies a 80–84 % | Piso continuo a 82 %; ningún elemento importante fuera de x 6–90 % (por el recorte a 16:10) |
| Tablet horizontal (1024–1279 px o proporción < 3:2) | 4:3 · 2048×1536 (P1) | x 0–44 % | x 46–62 % | x 62–92 % | Mientras no exista: se usa la de escritorio con `--fx: .55`, el texto se reduce y **el panel registrado se oculta** (la placa en blanco queda visible y la cifra pasa a un chip) |
| Móvil | 9:16 · 1080×1920 | y 56–100 %, fundido a `#03040B` | x 6–50 %, y 22–42 % (placa o hueco) | x 52–94 %, y 6–54 % | El texto empieza en el 54 % de la imagen |
| Tablet vertical (768–1023) | Usa la de móvil con el texto limitado a 560 px | | | | |

**Por qué el copy va en 5 columnas y la placa empieza en el 50 %:** con el recorte de 21:9 a 16:10 (`object-position` x 0.62), el 50 % del archivo cae en el 44.5 % de la pantalla tanto a 1280 como a 1440 px, y la columna de texto (columnas 1–5) termina en el 41 %. Quedan 42–52 px libres entre texto y placa a 1280, 1440 y 1920 px, y 86 px a 2560 (con el límite de 2200 px descrito abajo). Con 6 columnas de texto la placa se encima. En espejo (sujeto a la izquierda, `--fx: .38`) el copy va en las columnas 8–12 y la placa termina en el 50 % del archivo. En monitores de más de 1800 px, el ancho de la placa de imagen se limita a 2200 px aplicando el `inset` a `.scene__plate` (no solo a la imagen), así las anclas siguen cuadrando.

### 4.3 Anclas en CSS puro (cero CLS, sin JS)

El problema: con `object-fit: cover`, un punto de la imagen (el pecho de Kain, la placa) cambia de posición en la pantalla con cada proporción de ventana. La solución: calcular su posición **en CSS** con unidades de contenedor.

```css
/* La escena recibe del componente: --iw, --ih (px del archivo), --fx, --fy (0–1, object-position)
   y por ancla: --chest-x, --chest-y, --slab-x, --slab-y, --slab-w, --slab-h (0–1 del archivo). */
.scene__plate { position: absolute; inset: 0; z-index: -5; }
.scene__media img {
  width: 100%; height: 100%; object-fit: cover;
  object-position: calc(var(--fx) * 100%) calc(var(--fy) * 100%);
}
.scene__stage {
  position: absolute; inset: 0; container-type: size; pointer-events: none;
  /* px de pantalla por px del archivo, igual que object-fit: cover */
  --s: max(100cqw / var(--iw), 100cqh / var(--ih));
}
.scene__stage > * {
  --dw: calc(var(--iw) * var(--s));
  --dh: calc(var(--ih) * var(--s));
  --ox: calc((100cqw - var(--dw)) * var(--fx));
  --oy: calc((100cqh - var(--dh)) * var(--fy));
  position: absolute;
}
.anchor--chest { left: calc(var(--ox) + var(--dw) * var(--chest-x)); top: calc(var(--oy) + var(--dh) * var(--chest-y)); }
.anchor--slab, .scene__panel--registered {
  left:   calc(var(--ox) + var(--dw) * var(--slab-x));
  top:    calc(var(--oy) + var(--dh) * var(--slab-y));
  width:  calc(var(--dw) * var(--slab-w));
  height: calc(var(--dh) * var(--slab-h));
  container-type: inline-size;            /* el contenido del panel escala con la placa */
}
.scene__panel--registered .ui { font-size: clamp(11px, 5.4cqi, 14px); }
.scene__veil { inset: 0; background: var(--ink); opacity: 0;          /* último hijo de .scene__stage */
  --cx: calc(var(--ox) + var(--dw) * var(--chest-x)); --cy: calc(var(--oy) + var(--dh) * var(--chest-y)); }
.scene__panel { pointer-events: auto; }
.scene__inner { pointer-events: none; } .scene__inner > * { pointer-events: auto; }
@media (min-width: 1800px) { .scene__plate { inset: 0 max(0px, (100vw - 2200px) / 2); } }

/* Móvil: la imagen deja de ser cover de la sección; es una caja 9:16 arriba y el texto corre debajo,
   así el encuadre de Kain no cambia con el largo del texto. */
@media (max-width: 1023px) {
  .scene__plate { inset: 0 0 auto; aspect-ratio: 9 / 16; }
  .scene { padding-top: calc(100vw * 16 / 9 * .54); }      /* el texto empieza en el 54 % de la imagen */
}
```

Las variables de cada imagen (tamaño, punto focal y anclas, en escritorio y móvil) salen de `src/data/scenes.json` (§10.10). El componente las escribe en un `<style>` con alcance por `id`, con su `@media` para móvil. Navegadores: las unidades `cqw/cqh/cqi` funcionan en Chrome 105+, Safari 16+ y Firefox 110+.

### 4.4 La rama sujeto → panel → botón

- **Tramo 1, sujeto → placa:** un SVG fijo de 160×120 colocado en el ancla del pecho. Como la placa está registrada a la misma imagen, la geometría relativa es constante y el trazo se dibuja en CSS/SVG sin medir nada.
- **Tramo 2, placa → botón:** lo dibuja JS después del layout (`ResizeObserver` sobre la escena), así que no puede causar CLS. Ruta: sale del borde de la placa del lado del texto, baja a 45° hasta la altura del botón primario y entra horizontal por la derecha del botón. **Nunca cruza el H1 ni el lede**: si la ruta los cruzaría (pantallas angostas), el tramo 2 no se dibuja.

```js
// Ruta con la geometría del isotipo: horizontal → diagonal a 45° → horizontal.
// a = punto de salida en el borde de la placa (lado del texto); b = borde derecho del botón. Coordenadas de la escena.
// Los codos se suavizan con stroke-linejoin: round (CSS de .wire).
function branchPath(a, b, lead = 40) {
  const dy = Math.abs(b.y - a.y);
  const x1 = Math.min(a.x, b.x + lead + dy);  // donde empieza la diagonal (a 45° si cabe)
  return `M${a.x},${a.y} H${x1} L${b.x + lead},${b.y} H${b.x}`;
}
```

### 4.5 Alturas y variantes

| Variante | Alto | Uso |
|---|---|---|
| `hero` | `min(100svh, 1000px)`, mínimo 720 px | Portada de cada página |
| `mid` | `88svh` | Escenas intermedias (dolor, Kain en el sector, resultado) |
| `switch` | `100svh` | Escena que cambia de imagen según el elemento activo (Casos en el home) |
| `close` | `80svh` | Cierre "Nodo Discovery" |
| `tone="dolor"` | | Velo y brillo en ámbar al 60 %; ramas y nodos en ámbar; la salida en cian aparece con el scroll |

### 4.6 Lista de verificación (además de B §7)

- [ ] En 1024, 1280, 1440, 1920 y 2560 px el panel registrado cae sobre la placa de la imagen, con ±4 px de error (revisar con una capa de depuración `?anchors=1` que dibuja los nodos de las anclas).
- [ ] La placa y el panel no se cruzan con la columna de texto en ningún ancho ≥1024 px.
- [ ] Ningún panel o chip tapa la cara ni el cuerpo del sujeto. Kain siempre se ve de cuerpo completo.
- [ ] La rama del tramo 2 no cruza texto. Si lo haría, no se dibuja.
- [ ] La barra del panel dice `SIMULACIÓN` y el panel tiene `data-nosnippet`.
- [ ] Con movimiento reducido, el panel muestra su estado final y la rama está dibujada completa.

---

## 5. Home: plano sección por sección

Intensidad: **1** = calma (texto o datos, entrada simple) · **2** = media (demo animada, trazos SVG, scrub corto) · **3** = alta (escena cinematográfica, pin o parallax por capas). Se alternan para que nunca haya dos 3 seguidos sin un respiro, ni dos 1 seguidos sin un evento.

| # | Sección | Tipo | Alto aprox. | Intensidad |
|---|---|---|---|---|
| 0 | Arranque | Animación firma | — | 3 |
| 1 | Portada "La consola" | Escena E1 | 100svh | 3 |
| 2 | Barra de estado + stack | Franja | 140 px | 1 |
| 3 | El problema "11:48 p. m." | Escena E2 (dolor) | 88svh | 2 |
| 4 | Manifiesto sin humo | Texto sobre aura | 70svh | 1 |
| 5 | Runtime: un lead, cinco piezas | Fijada al scroll | 100svh + 400 % de recorrido | 3 |
| 6 | Registro de resultados | Datos | ~100svh | 2 |
| 7 | Conoce a Kain | Escena E3 + simulador | 100svh | 3 |
| 8 | VKTOR™ como pipeline de despliegue | Escena (escalones) + panel | 160svh con sticky | 2 |
| 9 | Sistemas en producción (casos) | Escena que cambia | 100svh | 3 |
| 10 | Elige tu operación (industrias) | Selector + panel | 90svh | 2 |
| 11 | Stack conectado | Hub del isotipo | 100svh | 2 |
| 12 | El equipo | Escena con foto real | 88svh | 2 |
| 13 | Ingeniak en datos + FAQ | Ficha técnica + acordeón | ~120svh | 1 |
| 14 | Cierre "Nodo Discovery" | Escena E8 | 80svh | 3 |
| — | Footer-mapa | Mapa | — | 1 |

```
Sección      01 02 03 04 05 06 07 08 09 10 11 12 13 14
Intensidad    3  1  2  1  3  2  3  2  3  2  2  2  1  3
              ▇  ▂  ▅  ▂  ▇  ▅  ▇  ▅  ▇  ▅  ▅  ▅  ▂  ▇
```

### 5.1 Portada "La consola" · Escena E1 · Intensidad 3

- **Layout:** escena `hero`, sujeto a la derecha. Copy en columnas 1–5 (máx. 560 px), centrado en vertical con un ligero sesgo hacia abajo (el H1 a la altura del pecho de Kain). Placa registrada en U. 1 chip de cifra anclado al piso, junto a los pies de Kain (no sobre el cuerpo).
- **Imagen:** E1 (§10.1). Mientras se genera, se usa `materiales/discovery/kain-01-hero.png`, con las anclas medidas: pecho (0.683, 0.462), palma (0.530, 0.498), plataforma (0.712, 0.90); el panel flota sobre la palma en lugar de una placa.
- **Copy (dirección):**
  - Eyebrow con nodo: `AGENTES DE IA · CRM · AUTOMATIZACIÓN`.
  - H1 en dos niveles **dentro del mismo `<h1>`** (SEO de D §13.1): "**Agentizamos empresas.**" en tamaño héroe, y en el mismo H1, en un `span` de menor tamaño y tono apagado: "Agentes de IA, CRM y automatización en un solo sistema."
  - Lede: "Kain responde tu WhatsApp en segundos, califica, agenda y deja todo en tu CRM. Nosotros lo diseñamos, lo implementamos y lo operamos contigo."
  - Botones: "Agenda tu Discovery Session" (azul) + "Escríbele a Kain" (cristal, WhatsApp con el mensaje de la página).
  - Línea de confianza en mono: "Partner oficial de Kommo en LATAM · +73 sistemas en producción · 7 países".
- **UI viva (placa):** panel de chat de WhatsApp (estética propia, no la de WhatsApp). Barra: `KAIN · WHATSAPP · SIMULACIÓN`. Guion: cliente a las 11:48 p. m., "¿Tienen cita mañana?" → Kain: "Sí, tengo 10:00 o 12:30. ¿Cuál te acomoda?" → "10:00" → "Listo, quedó agendada. Te mando recordatorio un día antes." → evento de sistema en mono: `▣ Cita creada · CRM actualizado`. Chip de piso: `Metric id="dental-respuesta"` → "8 min → 12 s · clínica dental, Monterrey".
- **Motion:** Arranque (§3). Al hacer scroll: placa y panel `yPercent` +6, copy −14 con opacidad hasta .25; la siguiente sección sube con `--seam`.
- **Móvil:** imagen 9:16; Kain arriba a la derecha y placa a su izquierda con **2 burbujas como máximo** (texto de 12 px); copy debajo sobre el fundido. Sin chip de piso; la cifra pasa a la línea de confianza.

### 5.2 Barra de estado + stack · Intensidad 1

- **Layout:** franja de ancho completo con una línea fina arriba y abajo. A la izquierda, el sello Kommo Partner (versión blanca, enlazada a kommo.com) en un chip de cristal. Al centro, la marquesina de logos del stack en blanco `currentColor` con bordes desvanecidos. A la derecha, en mono: `▣ +73 sistemas en producción` (texto fijo, no contador).
- **Copy:** solo la etiqueta "Herramientas que integramos" (B-D, LOGOS.md). GoHighLevel aparece como herramienta, nunca como partner.
- **Motion:** marquesina CSS; se pausa en hover y con movimiento reducido. El chip Kommo hace un pulso de borde una vez al entrar.

### 5.3 El problema "11:48 p. m." · Escena E2 (dolor) · Intensidad 2

- **Layout:** escena `mid`, `tone="dolor"`, persona a la izquierda y copy a la derecha (columnas 8–12). En U, junto al teléfono de la persona (sin tapar cara ni cuerpo), una pila de notificaciones en panel de cristal **ámbar**.
- **Imagen:** E2 (§10.2). Opcional (P1): una segunda placa del mismo encuadre con la luz del teléfono en cian y el gesto relajado, para un cross-fade con scrub.
- **Copy:** eyebrow ámbar `EL PROBLEMA` · H2: "Tus clientes escriben a las 11:48 p. m. Tu equipo contesta a las 9:00 a. m." · 4 dolores (D §13.1) como **salida de diagnóstico**, no como tarjetas: `⚠ Mensajes sin responder → Kain responde en segundos`, `⚠ Un CRM que nadie usa → cada conversación queda registrada`, `⚠ Anuncios que no se traducen en ventas → atribución por campaña`, `⚠ Todo pasa por ti → procesos que se mueven solos`. Remate: "No te falta esfuerzo. Te falta un sistema."
- **UI viva:** la pila muestra notificaciones sin números (puntos y horas: 9:12 p. m., 10:37 p. m., 11:48 p. m.). Con el scroll (scrub de 0 a 1 en el tramo final), **la misma pila se transforma**: el ámbar pasa a cian, cada notificación cambia a "Respondido por Kain" y aparece `Metric id="dental-respuesta"`. Es el giro del capítulo.
- **Motion:** cada línea del diagnóstico entra con su `⚠` ámbar y luego dibuja su flecha cian (DrawSVG corto). Cross-fade opcional de la placa al estado cian.
- **Móvil:** imagen 4:5 con la persona arriba; la pila de notificaciones queda chica en U; diagnóstico abajo.

### 5.4 Manifiesto sin humo · Intensidad 1

- **Layout:** columnas 2–11 y una sola frase grande (Lexend 400, 40–56 px), sobre el **aura**: isotipo de cristal desenfocado a escala gigante (B-D10, exportado ya desenfocado). Debajo, una fila de 3 principios en mono, separados por nodos.
- **Copy (dirección, validar con el cliente):** "No instalamos herramientas sueltas. Instalamos un sistema que atiende, registra y mide, y lo operamos contigo. Si no mueve una cifra tuya, no va." Principios: `DATOS SOBRE ADJETIVOS ▪ UN SOLO SISTEMA ▪ OPERAMOS CONTIGO`.
- **Motion:** SplitText por palabras, opacidad .15 → 1 con scrub (C patrón 22). El aura gira 0 → 8° muy lento.

### 5.5 Runtime: un lead, cinco piezas · Intensidad 3 (sección firma del concepto)

- **Layout (desktop):** sección fijada (`pin`) con recorrido de +400 % y 5 estados discretos con `snap`.
  - Columnas 1–4: lista de pasos `01 ATRAE · 02 ATIENDE · 03 ORGANIZA · 04 AUTOMATIZA · 05 MIDE`, cada uno con H3, una línea y enlace a su servicio. El paso activo enciende su nodo, y un riel vertical se llena con el progreso.
  - Columnas 5–12: **ventana de producto** grande (panel de cristal, radio 20 px, barra con `ingeniak · sistema · SIMULACIÓN`) sobre el aura de ondas sedosas + isotipo desenfocado. Marco de líneas finas con marcas "+" en las esquinas (precisión tipo Vercel) y la etiqueta `Fig. 02 — Un lead recorriendo el sistema`.
- **El hilo vivo:** una **tarjeta de lead** ("Lead nuevo · WhatsApp") es el mismo elemento del DOM en las 5 vistas y se mueve entre ellas con GSAP Flip.
  1. **Atrae:** anuncio (Meta / Google / TikTok como íconos) → clic (pulso) → landing en wireframe; la tarjeta nace del formulario. Cifra: `ecom-cpl` "−58% costo por lead en 60 días · e-commerce, CDMX".
  2. **Atiende:** chat; la tarjeta se acopla al encabezado del chat; Kain responde. Cifra: `dental-respuesta`.
  3. **Organiza:** pipeline genérico (Nuevo → Calificado → Cita agendada → Ganado; **no** es una copia de la UI de Kommo); la tarjeta vuela del chat a "Cita agendada". Cifra: `retail-conversiones` "+340% conversiones · retail multimarca, Kommo + IA".
  4. **Automatiza:** flujo de nodos (disparador → CRM → calendario → recordatorio → aviso al equipo) con pulsos por las ramas. Cifras: `logistica-procesos` "27 procesos automatizados · logística, n8n" y `tiempo-operativo` "−60% tiempo operativo · promedio, primeros 90 días".
  5. **Mide:** tablero "1 vista": **7 nodos de fuente sin nombre** (`01`…`07`) cuyas ramas convergen en una sola gráfica, porque no está confirmado cuáles son las 7 fuentes del caso. Cifra: `ecom-tablero` "1 vista · 7 fuentes · e-commerce".
- **Nota de honestidad, visible bajo la ventana:** "Simulación de un lead. Las cifras vienen de casos reales distintos; cada una indica su fuente."
- **Motion:** los cambios de estado no se hacen con scrub (Flip y scrub se llevan mal): ScrollTrigger detecta el paso y lanza una transición de 0.8 s, reversible (§9.4). El riel de progreso sí va con scrub.
- **Móvil:** sin pin. 5 bloques apilados, cada uno con su mini-demo, que se reproduce al entrar al viewport. Arriba queda fija una píldora `Lead nuevo · etapa 3/5` que avanza con el scroll.
- **Por qué es la firma:** demuestra el posicionamiento ("Creamos el tráfico, lo convertimos y lo operamos automáticamente") en lugar de decirlo, y concentra los "eventos" que en el sitio actual eran relleno.

### 5.6 Registro de resultados · Intensidad 2

- **Layout:** no son tarjetas, es una **tabla-registro** a lo ancho del contenedor, con líneas finas entre filas. Columnas: Resultado (`.t-data`, 72–120 px) · Qué cambió · Sector y ciudad · Ventana · Servicio · →. Filas: 3.2× · 8 min → 12 s · −58% · +340% · ROAS 4.8× · 27 procesos. Pie del registro, en mono: "12 → 47 citas/mes promedio (salud) · −60% tiempo operativo (primeros 90 días) · +73 sistemas · 7 países · Fuente: datos internos de Ingeniak, octubre de 2026".
- **Copy:** eyebrow `REGISTRO` · H2 "Resultados con sector, ciudad y plazo."
- **UI:** al pasar el mouse o enfocar una fila, un degradado cian barre la fila de izquierda a derecha y aparece "Ver caso →". Las filas son enlaces a `/casos/*`.
- **Motion:** las filas entran con stagger .06. Conteo animado **solo visual**: el valor final ya está en el HTML (`<span data-from="12">47</span>`).
- **Móvil:** cada fila es un bloque de 2 líneas (cifra grande + contexto) con una línea fina entre bloques.

### 5.7 Conoce a Kain · Escena E3 + simulador · Intensidad 3

- **Layout:** escena `hero`, Kain a la izquierda y copy en columnas 8–12. La placa de E3 tiene forma de teléfono, y el **simulador HTML registrado encima** es la interfaz que Kain sostiene.
- **Copy (D §13.1):** H2 en primera persona: "Soy Kain, el agente de IA de tu empresa." · "Respondo, agendo y confirmo por ti en WhatsApp, Instagram y tu web, y registro cada conversación en tu CRM." · 4 viñetas con nodo · enlaces `/kain/` y `app.kain.mx ↗` (logotipo **kain** en minúsculas) · "Escríbele a Kain".
- **UI viva:** pestañas de sector **debajo del copy** (Salud · Belleza · Inmobiliario · Retail). Al cambiar de pestaña, el teléfono registrado en la escena reproduce el guion de ese sector (JSON). Indicador "escribiendo…" y horas del día. Botón de pausa (WCAG 2.2.2).
- **Motion:** la escena se enciende desde el pecho (arranque corto). El cambio de pestaña limpia el chat con un barrido de 200 ms. Kain no se mueve; la vida está en la placa.
- **Móvil:** imagen 9:16 con Kain y la placa arriba. En móvil el simulador **no** va dentro de la placa (quedaría chico): va debajo del copy, en un panel de cristal sobre el fundido, y la placa muestra solo el ícono de chat encendido.

### 5.8 VKTOR™ como pipeline de despliegue · Intensidad 2

- **Layout:** escena con la imagen de Kain subiendo **5 escalones de cristal** (regenerar `kain-03-cuatro-a.png` con 5 escalones; sujeto a la izquierda, escalones que suben hacia la derecha). Sección de 160svh con el interior `sticky` de 100svh. En el lado del texto, un panel tipo **ejecución de CI** con 5 trabajos: `V Verify · K Koncept · T Transform · O Operate · R Rise`.
- **Copy:** eyebrow `METODOLOGÍA VKTOR™` · H2 "Cada proyecto pasa por cinco fases. Ninguna se salta." · Cada trabajo con su verbo de marca: "Verificamos tu operación" · "Diseñamos el concepto" · "Transformamos" · "Operamos junto con tu equipo" · "Hacemos crecer los resultados" · enlace "Ver la metodología completa →".
- **UI + imagen:** al avanzar el scroll, cada trabajo pasa de `□ en espera` a `◧ en curso` y a `■ listo` (nodo cian). **A la vez se enciende el escalón correspondiente de la imagen**: un brillo anclado a cada escalón (anclas `step1…step5` en `scenes.json`). La UI y la foto avanzan juntas.
- **Motion:** scrub con 5 estados; sin duraciones inventadas (solo estados).
- **Móvil:** imagen 9:16 (Kain abajo a la izquierda y escalones subiendo); los trabajos en lista vertical con nodos que se encienden al pasar.

### 5.9 Sistemas en producción (casos) · Escena que cambia · Intensidad 3

- **Layout:** escena `switch`. A la izquierda, la lista de los 5 casos como filas grandes: cifra (`.t-data` 64 px) + nombre ("Clínica dental · Monterrey"). La imagen a sangre de la sección **es la portada del caso activo**: persona del sector a la derecha. Al pasar el mouse, enfocar o tras 6 s (barra de progreso en la fila activa; pausa en hover), la escena hace un cross-fade de 700 ms a la del siguiente caso.
- **Regla que lo hace posible:** **todas las portadas de caso tienen al sujeto a la derecha** (§6.3). La imagen de la sección sirve sin cambios.
- **Copy:** eyebrow `CASOS` · H2 "Sistemas reales, operando hoy." · etiqueta en la esquina "Imagen ilustrativa del sector" · botón "Ver todos los casos →".
- **Motion:** cross-fade de la placa + la cifra de la fila activa sube 4 px y se ilumina. Las imágenes que no están activas cargan en diferido después de que la sección entra al viewport.
- **Móvil:** carrusel horizontal con scroll-snap. Cada caso es una mini escena (imagen 4:5 propia) con la cifra encima del fundido.

### 5.10 Elige tu operación (industrias) · Intensidad 2

- **Layout:** a la izquierda (columnas 1–5), una lista tipo **selector de comandos** de 8 sectores con índice mono (`01 Salud`, `02 Belleza y estética`…) y una línea de valor por sector (D §5). A la derecha (columnas 7–12), un panel de cristal sobre el aura que muestra la vista previa del sector activo: 3 líneas de chat de ejemplo + la cifra **solo si existe** (Salud: 3.2× · Industrial: 27 procesos · Retail: +340% · HoReCa: ROAS 4.8×; los demás: "Cifras transversales de otros sectores", con su fuente) + "Ver la página del sector →".
- **Por qué no una cuadrícula de 8 tarjetas:** se evitan las tarjetas iguales y en cambio cada sector se puede ver en acción.
- **Motion:** las flechas ↑↓ del teclado mueven la selección (como un menú de producto). El panel cambia con un barrido de 180 ms.
- **Móvil:** acordeón; cada sector abierto muestra su vista previa en línea.

### 5.11 Stack conectado · Intensidad 2

- **Layout:** el **hub** de B-D6: isotipo de cristal al centro (`public/img/marca/isotipo-cristal-1100.webp`) y sus ramas hacia 2 columnas de tarjetas de herramientas agrupadas por categoría (Conversación · CRM · Automatización · IA · Anuncios · Datos). La tarjeta Kommo lleva el sello Partner y un borde cian activo.
- **Copy:** H2 "Conectamos lo que ya usas. Lo que falta, lo construimos." · "Partner oficial de Kommo en LATAM" · enlace a `/tecnologias/`.
- **Motion:** las ramas se dibujan desde el centro con scrub; cada tarjeta se enciende cuando su rama llega. Después, 1 pulso cada 4–6 s por una rama al azar (`repeatDelay` aleatorio).
- **Móvil:** el isotipo arriba y ramas verticales que bajan a una lista.

### 5.12 El equipo · Escena con foto real · Intensidad 2

- **Layout:** escena `mid` con la foto real `team-hero` (1280×720) escalada, con el lienzo extendido a 21:9 por outpainting hacia la izquierda en navy con ondas, y el grupo desplazado a la derecha. Duotono de B-D5 + contraluz cian. Kain se puede componer en la misma luz (opcional), **sin tocar ningún rostro**.
- **Copy:** H2 "Seis personas que construyen, operan y miden." + lista tipo **roster** en mono: Rik Landeros, Director de Estrategia Comercial · Alonso Vega, Arquitecto de IA y Automatización · César Ovalle, Director Creativo · Richard Vela, Medios de Performance · Andy Pizano, Administración y Finanzas · Marcos González, Líder Comercial · enlace `/nosotros/`.
- **Motion:** la máscara radial del duotono se abre (`--r` de 30 % a 75 %); los nombres entran con stagger.
- **Móvil:** foto 4:5 con el grupo arriba y el roster debajo.

### 5.13 Ingeniak en datos + FAQ · Intensidad 1

- **Layout:** columnas 1–5: **ficha técnica tipo README** en panel sólido con líneas `clave: valor` en mono (es para citación por motores de IA, GEO/AEO): Nombre · Sede (Guadalajara, Jalisco; oficina Av. Punto Sur 312, Tlajomulco de Zúñiga) · Alianza (Partner oficial de Kommo en LATAM) · Metodología (VKTOR™ = Verify · Koncept · Transform · Operate · Rise) · Servicios · Países (México sede, Estados Unidos, Colombia, Argentina, España, Costa Rica, Ecuador) · Sistemas en producción (+73) · Inversión (desde USD 997 al mes) · Contacto. Columnas 7–12: FAQ de 6 preguntas (D §13.1), con texto idéntico al FAQPage.
- **Motion:** casi ninguno. Las líneas de la ficha se "imprimen" una vez (opacidad, stagger .03).

### 5.14 Cierre "Nodo Discovery" · Escena E8 · Intensidad 3

- **Layout:** escena `close`. Kain a la izquierda, de pie sobre un nodo cuadrado de luz en el piso; desde la profundidad llega una traza de luz al nodo. Copy en columnas 8–12. **La Espina termina aquí:** su línea baja, se une a la traza del piso de la imagen y continúa como rama HTML hasta el botón.
- **Copy (D):** "30 minutos para ver tu operación como es, no como crees que es." · botón Discovery + WhatsApp · microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet" · "Planes desde USD 997 al mes".
- **Motion:** haz volumétrico (B-D11) que se abre al 60 % del viewport; la rama llega al botón y el borde de luz da una vuelta. El nodo de la Espina "07/07" se ilumina.
- **Móvil:** imagen 9:16 con Kain arriba; la traza baja hacia el botón.

### 5.15 Footer-mapa

Mapa completo de D §6 en 5 columnas + ficha de la entidad + línea de estado en mono "▣ +73 sistemas en producción · 7 países · Partner oficial de Kommo en LATAM" (texto fijo). El isotipo se redibuja con trazo cian al entrar (la firma de la v1). Enlaces "Resume Ingeniak con ChatGPT · Claude · Perplexity" (C patrón 33), opcionales.

---

## 6. Plantillas internas

**Quién aparece dice qué página es** (decisión del concepto; **cambia** la asignación de D §14 para servicios y casos):
- **Servicios = Kain trabajando.** Mismo personaje en 11 escenas distintas: efecto franquicia (A §5.2). Cada escena tiene una placa con la UI de ese servicio.
- **Industrias = personas del sector** en el hero (el mundo del cliente) y Kain en la escena intermedia.
- **Casos = persona del sector a la derecha + cifra gigante a la izquierda**, siempre en ese lado.

### 6.1 T-SERVICE · ejemplo `/servicios/agentes-ia-whatsapp/`

| # | Sección | Layout y contenido | Escena / UI | Motion | Int. |
|---|---|---|---|---|---|
| 1 | **Portada** | Escena `hero`, Kain a la derecha. Migas dentro del copy (`Inicio ▪ Servicios ▪ Agentes de IA para WhatsApp`), H1 "Agentes de IA para WhatsApp Business", lede de D, 2 botones, chip `dental-respuesta` | E4 "Turno de noche" (§10.4). Placa = chat con el guion de la 11:48 p. m. | Arranque corto + panel | 3 |
| 2 | **Definición** | Bloque README: etiqueta mono `DEFINICIÓN` a la izquierda (columnas 1–3) y párrafo citable de 40–60 palabras en Lexend 400 de 28–32 px (columnas 4–11) | Aura tenue | Entrada de líneas | 1 |
| 3 | **Señales de que lo necesitas** | Salida de **diagnóstico** (como un linter): 4 líneas `⚠` ámbar → corrección en cian | Panel sólido | Cada línea: ámbar y luego la flecha cian se dibuja | 1 |
| 4 | **Cómo funciona** | Flujo fijado (+200 %): WhatsApp → Kain → CRM → Agenda → Humano. Cada nodo se expande con 2 líneas de detalle | Marco de líneas finas + ramas del isotipo; el pulso viaja de nodo en nodo | DrawSVG con scrub; sin pin en móvil | 2 |
| 5 | **Qué hace tu agente** | **Bento** de 6 piezas en 3 tamaños: grande (7×3) con demo de calificación, mediana (5×3) con agenda, 4 chicas con micro-UI (registro en CRM, seguimiento, horario 24/7, escalamiento a humano). Nunca 3 iguales | Paneles con micro-UI viva | Cada pieza arranca al entrar | 2 |
| 6 | **Lo que sí hace y lo que no** | Escena `mid`, Kain a la izquierda; dos listas (cian / tachado neutro) en columnas 8–12 + "No da consejo médico ni legal" | E-mid (recepción vacía de noche de D #13, en espejo) | Las listas entran; la placa muestra un mensaje "fuera de guion" → "Te comunico con una persona" | 3 |
| 7 | **Agente vs chatbot** | Tabla comparativa de 6 filas (D), estilo registro, con enlace al artículo | — | Filas en stagger | 1 |
| 8 | **Resultados** | Filas del registro (§5.6) filtradas por servicio: 3.2×, 8 min → 12 s, +340% | — | Conteo visual | 2 |
| 9 | **Con qué se conecta** | Mini hub: isotipo + WhatsApp, Instagram, web, Kommo, GoHighLevel, n8n | Aura | Ramas con scrub | 2 |
| 10 | **VKTOR™ aplicado** | Pipeline compacto horizontal de 5 trabajos con una línea por fase específica del servicio | — | Los nodos se encienden en secuencia | 1 |
| 11 | **Inversión** | Una línea de especificación: "Desde USD 997 al mes" + "Qué define el alcance: canales, volumen de conversaciones, integraciones". Sin tabla | Panel sólido | — | 1 |
| 12 | **FAQ** | 6 preguntas (D), idénticas al FAQPage | — | Acordeón | 1 |
| 13 | **Sigue explorando** | 3 **filas** de enlace (no tarjetas): nombre + una línea + → | — | Hover con barrido | 1 |
| 14 | **Cierre** | Escena `close` E8 (compartida) con la frase de D | E8 | Haz + rama al botón | 3 |

Variantes T-PLATFORM (`/kommo/`, `/gohighlevel/`): en la portada de Kommo, el sello Partner va en el copy, arriba del H1, y la placa de la escena es una tarjeta de lead (E5). En GoHighLevel, un aviso de marca en mono ("GoHighLevel es una marca de su titular; Ingeniak implementa la plataforma", texto legal a validar) y **nunca** la palabra partner.

### 6.2 T-INDUSTRY · ejemplo `/industrias/salud/`

| # | Sección | Layout y contenido | Escena / UI | Motion | Int. |
|---|---|---|---|---|---|
| 1 | **Portada** | Escena `hero`, persona a la derecha (odontóloga). H1 "Agentes de IA para clínicas y consultorios", lede de D, botones, etiqueta "Imagen ilustrativa" en la esquina | E6 "Fin del turno" (§10.6). En U: **lo que ve el paciente**, 2 burbujas ("¿Tienen espacio mañana?" → "Sí, 10:00 o 12:30") | Arranque corto | 3 |
| 2 | **Definición** | Bloque README (D: "un agente de IA responde a pacientes en segundos… no da consejo médico") | Aura | Entrada | 1 |
| 3 | **Un día sin sistema / con sistema** | **Línea de 24 h** horizontal (00:00–23:59) con dos pistas: arriba eventos ámbar (mensajes que entran fuera de horario y quedan sin respuesta hasta las 9:00); abajo los mismos eventos en cian, respondidos al momento. Sin conteos inventados: solo horas | Panel sólido con marco de líneas finas | Scrub: un cursor recorre el día; la pista cian "alcanza" a la ámbar | 2 |
| 4 | **Tipos de negocio** | Pestañas accesibles (Clínica dental · Consultorio médico · Especialidades) con el contenido en el HTML | — | Cambio con barrido | 1 |
| 5 | **Así trabaja Kain en tu clínica** | Escena `mid`, Kain a la izquierda en recepción de clínica; simulador del sector registrado en la placa; "ejemplo ilustrativo"; "Kain no da diagnósticos ni consejo médico" | Escena D #35 con placa | Guion del sector, con pausa | 3 |
| 6 | **Resultados del sector** | Registro filtrado: 3.2× · 8 min → 12 s · 12 → 47 citas/mes promedio. En sectores sin caso: bloque "Cifras transversales" con la fuente de cada una | — | Conteo visual | 2 |
| 7 | **Stack recomendado** | 2 filas: "Si vendes por chat → Kommo" / "Si vendes con embudos y calendarios → GoHighLevel" | — | — | 1 |
| 8 | **Datos y confianza** | 4 afirmaciones verificables: API oficial de WhatsApp Business, aviso de privacidad, escalamiento a una persona, quién accede a los datos. **Ningún sello que no se tenga** | Panel sólido | — | 1 |
| 9 | **FAQ** | 5 preguntas (D) | — | — | 1 |
| 10 | **Cierre** | Escena compartida | E8 | — | 3 |

### 6.3 T-CASE · ejemplo `/casos/clinica-dental-monterrey/`

```
┌───────────────────────────────────────────────────────────────────────┐
│ Inicio ▪ Casos ▪ Clínica dental en Monterrey             IMAGEN ILUSTRATIVA │
│                                                                       │
│  3.2×  ← .t-data 160–200 px, unidad en cian          ░░ persona ░░    │
│  más citas en 90 días                                ░░  (dentista) ░░ │
│  <h1>Clínica dental en Monterrey: 3.2× más citas      ░░ ventanal,   ░░ │
│       en 90 días con un agente de IA</h1>             ░░ hora azul   ░░ │
│  [Salud] [Monterrey, N.L.] [Agente IA en WhatsApp] [90 días]           │
│  [Quiero un sistema así: agenda tu Discovery]  (Escríbele a Kain)      │
└───────────────────────────────────────────────────────────────────────┘
```

| # | Sección | Layout y contenido | Escena / UI | Motion | Int. |
|---|---|---|---|---|---|
| 1 | **Portada** | Escena `hero`, persona **siempre a la derecha**. Cifra gigante en HTML como pieza visual (`aria-hidden` porque el H1 la repite), H1 con el resultado, chips de ficha (sector, ciudad, servicio, ventana). Etiqueta "Imagen ilustrativa del sector" | E7 "Hora azul" (§10.7). Sin placa: la cifra es la "interfaz" | La cifra cuenta desde 1.0 (visual; el HTML ya dice 3.2) y la unidad × se enciende en cian | 3 |
| 2 | **Navegación del caso** | Barra fija bajo el header: `Contexto · Reto · Solución · Resultado · Stack`, con nodo activo y progreso por sección (C patrón 10) | Barra de cristal | `toggleClass` con ScrollTrigger | 1 |
| 3 | **Ficha técnica** | Tabla README solo con los campos confirmados (D §13.4); lo no confirmado **se omite**, no se rellena | Panel sólido | — | 1 |
| 4 | **Antes / después** | **Carrera de respuesta**: dos pistas, "Antes: 8 min" y "Después: 12 s", a escala real (las dos barras usan la misma unidad de tiempo; no se agrega ninguna cifra derivada). La pista de "después" termina casi de inmediato y la otra sigue corriendo | Marco de líneas finas | Scrub; con movimiento reducido, ambas barras aparecen completas a escala | 2 |
| 5 | **Qué implementamos** | Diagrama del sistema con las primitivas Nodo y Rama, **solo con piezas confirmadas** (el CRM aparece como "CRM" hasta que se valide cuál fue) | Aura | DrawSVG | 2 |
| 6 | **Resultado** | Escena `mid`, Kain a la izquierda en recepción dental con la frase citable de D + nota "datos internos de Ingeniak, octubre de 2026" | E-mid (D #52); placa = agenda de cristal con casillas que se encienden | Las casillas se encienden en secuencia (sin números) | 3 |
| 7 | **Cómo lo hicimos con VKTOR™** | Pipeline de 5 trabajos con los hitos confirmados; si no hay, los genéricos con enlace a `/metodologia/` | — | Nodos en secuencia | 1 |
| 8 | **Qué puedes replicar** | 3 filas con enlace al sector y al servicio | — | — | 1 |
| 9 | **Testimonio** | **Solo si existe aprobación por escrito.** Si no, la sección no se renderiza (el componente la omite si falta el dato) | — | — | — |
| 10 | **Relacionados + cierre** | 3 filas + escena E8 | E8 | — | 3 |

---

## 7. Navegación y mega menú

### 7.1 Header (barra de producto)

```
[▣ ingeniak]   Servicios▾  Industrias▾  Casos▾  Kain▪  Empresa▾  Recursos▾      [⌘K Buscar]  (▣ Escríbele a Kain)  [Agenda tu Discovery Session →]
```

- 64 px de alto. Transparente sobre el hero; al pasar el 80 % del hero se vuelve `.glass-bar`. **En desktop no se oculta al bajar** (comportamiento de herramienta, como Linear); en móvil sí se oculta al bajar y aparece al subir.
- Los items siguen a D §5 (D-navegacion.json). "Kain" lleva un nodo cian a su lado.
- **Indicador deslizante:** un subrayado de 1 px cian con un nodo de 4 px se mueve entre items con GSAP Flip (C patrón 6).
- Anchos: a ≥1280 px se ven los tres botones completos. Entre 1024 y 1279, "Escríbele a Kain" queda solo como ícono con `aria-label` y ⌘K solo como ícono de lupa. El botón azul **siempre** dice "Agenda tu Discovery Session".
- En `/discovery/`: solo logo + botón (D).

### 7.2 Paneles del mega menú

Cristal `rgb(10 31 76 / .55)` con blur de 24 px, filo cian superior de 1 px, ancho del contenedor y entrada de 220 ms (y −8 → 0, stagger 20 ms). Hover con intención (120 ms al abrir y 200 ms de gracia al cerrar); clic, Enter y Esc; `aria-expanded` y `aria-controls`; **todos los enlaces son `<a>` en el HTML estático**.

**Servicios ▾: el menú enseña el sistema.**

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ESTRATEGIA ─ Consultoría en IA: qué automatizar primero y por qué ────────────────────────────── │
│   ▣──────────────▣──────────────▣──────────────▣──────────────▣        ╭───────────────╮        │
│   ATRAER         ATENDER        ORGANIZAR      AUTOMATIZAR    MEDIR    │ mini escena   │        │
│   Paid media     Agentes IA     CRM con IA     Automatización Software │ Kain (menu-   │        │
│   Páginas web    para WhatsApp  Partner Kommo  con n8n        a la     │ kain)         │        │
│   SEO y vis. IA  kain ↗         GoHighLevel                   medida   │ Conoce a Kain │        │
│   Branding y                                                  (1 vista)│ → /kain/      │        │
│   contenido                                                            ╰───────────────╯        │
│ Planes desde USD 997 al mes · Metodología VKTOR™ · Tecnologías · Todos los servicios →          │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Arriba, **la línea del sistema**: 5 nodos unidos por una rama. Al pasar sobre un servicio, se enciende el nodo de su etapa y un pulso viaja hasta él. La consultoría es una barra que cruza las 5 etapas (es la estrategia de todo el sistema).
- Cada enlace: nombre + una línea de resultado (D §5). El sello Partner va como micro-badge junto a "Partner oficial de Kommo".
- Las URLs y textos son los de D; solo cambia la agrupación visual (las 5 etapas del Runtime en lugar de las 3 columnas de D). Si se prefiere la agrupación de D, la línea de 5 nodos se mantiene arriba como ilustración.

**Industrias ▾:** a la izquierda, la lista de 8 sectores en 2 columnas con una línea de valor. A la derecha, una **vista previa que cambia con el hover**: la primera línea del chat del sector (simulación) + la cifra solo si está confirmada (Salud 3.2× · Industrial 27 procesos · Retail +340% · HoReCa ROAS 4.8×). Pie: "Todas las industrias →".

**Casos ▾:** formato **tabla de posiciones**: cifra en Lexend 300 de 28 px con números tabulares, alineada a la derecha, + nombre del caso. Pie: "Todos los casos →".

**Empresa ▾ y Recursos ▾:** listas simples con una línea; en Recursos, el último artículo como destacado con su mini escena.

### 7.3 Búsqueda ⌘K: "Busca o pregúntale a Kain"

- Se abre con ⌘K / Ctrl+K o "/", o con el botón del header. Es un `<dialog>` de cristal centrado (640 px), con foco atrapado y Esc para cerrar.
- **Índice estático** generado en el build desde `D-sitemap.json`: las 45 páginas (título, H1, keyword, URL) + las preguntas del banco de FAQ con su respuesta corta. Archivo `/indice.json` (~40 KB), que se descarga solo al primer uso. Buscador propio de ~1 KB (coincidencia por prefijo y por palabras, sin dependencias).
- **Grupos de resultados:** Páginas · Servicios · Casos · Preguntas (la respuesta aparece ahí mismo, con enlace a la página) · **Acciones**: "Agenda tu Discovery Session" y "Pregúntale a Kain por WhatsApp: «<lo que escribiste>»" (arma el enlace `wa.me` con el texto del usuario).
- Teclado completo: ↑↓ para moverse, Enter para abrir, Tab para cambiar de grupo. Pie con atajos en `<kbd>`.
- Vacío: sugerencias ("¿Cuánto cuesta un agente de IA?", "Kommo vs GoHighLevel", "Casos de salud").

### 7.4 Móvil

- Header de 60 px: logo · lupa (abre ⌘K como hoja completa) · menú.
- Menú: hoja de cristal a pantalla completa con el buscador arriba, acordeones (Servicios por etapa, Industrias, Casos, Empresa, Recursos) y la Discovery fija al pie.
- **Barra inferior fija** a partir del segundo viewport: [Agenda tu Discovery] (azul, 2/3 del ancho) + [WhatsApp] (cristal, 1/3). No aparece en `/discovery/`.
- Migas dentro del copy de la portada (D §7), con el nodo cuadrado como separador.

### 7.5 Widget "Escríbele a Kain" (desktop)

Una píldora abajo a la derecha, desde el segundo viewport: avatar de Kain de 24 px + "Escríbele a Kain" + nodo cian con la etiqueta "responde 24/7". Abre `wa.me/523321017799` con el mensaje propio de la página (D-sitemap.json → `secondaryCta.href`). Se oculta cuando el cierre de la página está visible, para no duplicar.

---

## 8. Sistema de diseño: cambios contra la v1

### 8.1 Tabla de cambios

| Elemento | v1 (`css/styles.css`) | v2 Sistema Vivo | Por qué |
|---|---|---|---|
| H1 | Lexend 500, 64–95 px, blanco plano | Lexend **600**, 44–104 px, tracking −0.045em, en dos niveles (frase corta enorme + resto del H1 a 0.42em en tono apagado) | Peso y contraste sin cambiar de fuente (el actual usa Space Grotesk 700) |
| H2 | Lexend 500, 32–64 px | Lexend 500, 36–72 px, −0.04em, con una palabra en `.tone` como máximo | Más presencia y más disciplina |
| Cifras | Sin estilo propio | **`.t-data`:** Lexend **300**, 72–176 px, −0.06em, números tabulares, unidad en cian a 0.42em | El dato es protagonista; el contraste ligero/pesado se ve "de producto" |
| Texto | Inter 16/1.6 | Inter 17/1.65 en desktop y 16 en móvil; lede de 17–20 px | Lectura |
| Texto de UI | — | Inter 500, 13/1.4; meta de 12 px | Las demos deben verse como software real |
| Etiquetas | JetBrains Mono 12, .14em, cian | JetBrains Mono 11–12, .14em, `--faint` por defecto y cian solo si están activas; prefijo de nodo; índices "03 —" y "Fig. 02" | Cian = señal, no decoración |
| Contenedor | 1240 px | 1320 px de contenido; marcos de líneas finas a 1440 | Más aire para el bento y el Runtime |
| Retícula | Sin definir | 12 columnas con gap de 24 (móvil: 4 columnas, gap 16), base de 4 px | Precisión |
| Espaciado | `--section-y` 88–160 con bandas negras | Escenas de borde a borde con solape `--seam`; secciones de datos con 96–144 px **siempre con atmósfera**; nunca más de 200 px sin luz | Fin de lo "pobre" |
| Radios | 28 / 20 / 14 / 8; botones pill | Paneles 16 · ventanas 20 · piezas de bento 24 · **botones 12** · chips pill | Botón rectangular redondeado = producto; la pill queda para chips |
| Cristal | Un solo `.cristal` en todo | 3 niveles (`panel`, `chip`, `bar`) + versión sólida; solo sobre imagen o atmósfera | B-D4 |
| Botón primario | Pill con círculo de flecha | Rectángulo de 52 px, radio 12, Inter 600, flecha →, **borde de señal** (cónico) en hover y al llegar la rama | Se conecta con la narrativa del sistema |
| Tarjetas | `.cristal` con luz que sigue al mouse, todas iguales | **Pieza de bento** (al menos 2 tamaños, siempre con UI o dato), **Fila** (registro o enlace), **Panel** (demo); se prohíben las tarjetas de ícono + título + texto | Fin del cliché de 3 tarjetas iguales |
| Imágenes | En tarjetas con borde y radio | Escena a sangre o persona con máscara; gradado + grano en todo | Requisito del cliente |
| Íconos | Logos + nodos | Lucide con trazo de 1.5 y `stroke-linecap: square` + nodo cuadrado; sin emojis | Geometría del isotipo |
| Movimiento | SplitText .95 s / 22 px | + arranque, ramas, pulsos, Flip en el Runtime, pin, anclas | Sistema "vivo" |

### 8.2 Tokens

```css
:root {
  /* Color (manual 2025) */
  --ink: #03040B;  --ink-2: #060914;  --panel: #070B18;  --navy: #0A1F4C;
  --blue: #0055FF; --blue-hi: #1A66FF;                  /* solo acciones */
  --indigo: #455DFF;                                    /* solo dentro de degradados */
  --cyan: #00E5FF; --cyan-soft: #BFF8FF;                /* señal, IA, activo */
  --amber: #FFB547;                                     /* solo dolor */
  --text: #FFFFFF; --muted: #9EB0C7;                    /* 9.3:1 sobre --ink */
  --faint: #7A8AA0;                                     /* 5.8:1 sobre --ink: etiquetas de 11–12 px */
  --hair: rgb(255 255 255 / .08); --hair-2: rgb(255 255 255 / .14); --hair-cyan: rgb(0 229 255 / .28);
  /* Tipografía (variables locales en /fonts: Lexend 300–700, Inter 400–600, JetBrains Mono 400–500) */
  --f-display: "Lexend", system-ui, sans-serif;
  --f-body: "Inter", system-ui, sans-serif;
  --f-mono: "JetBrains Mono", ui-monospace, monospace;
  /* Retícula y espacio */
  --container: 1320px; --gutter: clamp(16px, 4vw, 48px); --col-gap: 24px;
  --nav-h: 64px; --seam: clamp(80px, 12vh, 160px);
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-5: 24px; --sp-6: 32px;
  --sp-7: 48px; --sp-8: 64px; --sp-9: 96px; --sp-10: 128px; --sp-11: 192px;
  /* Forma */
  --r-btn: 12px; --r-panel: 16px; --r-window: 20px; --r-tile: 24px; --r-chip: 999px;
  /* Movimiento */
  --ease-out: cubic-bezier(.16, 1, .3, 1); --ease-ui: cubic-bezier(.2, .8, .2, 1);
  --t-fast: .16s; --t-base: .6s; --t-slow: 1.1s;
}
html, body { background: var(--ink); color: var(--text); }
```

> El `@font-face` de Inter en la v1 declara el rango 400–600, que alcanza para el botón (600). El Lexend variable cubre 300–700, así que `.t-data` (300) y `.t-hero` (600) no necesitan archivos nuevos.

### 8.3 Tipografía

```css
.t-hero { font: 600 clamp(2.75rem, 1.2rem + 5vw, 6.5rem)/.96 var(--f-display); letter-spacing: -.045em; text-wrap: balance; }
.t-hero__sub { display: block; margin-top: .45em; max-width: 26ch; font-size: .42em; font-weight: 400;
  line-height: 1.18; letter-spacing: -.02em; color: var(--muted); }
.t-h2 { font: 500 clamp(2.25rem, 1.2rem + 3vw, 4.5rem)/1 var(--f-display); letter-spacing: -.04em; text-wrap: balance; }
.t-h3 { font: 500 clamp(1.375rem, 1.1rem + .8vw, 1.875rem)/1.15 var(--f-display); letter-spacing: -.02em; }
.t-statement { font: 400 clamp(1.75rem, 1.1rem + 2vw, 3.25rem)/1.12 var(--f-display); letter-spacing: -.03em; }
.t-data { font: 300 clamp(4.5rem, 2rem + 8vw, 11rem)/.85 var(--f-display); letter-spacing: -.06em;
  font-variant-numeric: tabular-nums lining-nums; }
.t-data .u { font-size: .42em; font-weight: 400; letter-spacing: -.02em; color: var(--cyan); margin-left: .06em; }
.t-lede { font: 400 clamp(1.0625rem, .98rem + .35vw, 1.25rem)/1.6 var(--f-body); color: var(--muted); max-width: 54ch; text-wrap: pretty; }
.t-body { font: 400 1.0625rem/1.65 var(--f-body); }
.t-ui { font: 500 .8125rem/1.4 var(--f-body); letter-spacing: -.005em; }
.t-label { display: inline-flex; align-items: center; gap: 10px; font: 500 .75rem/1 var(--f-mono);
  letter-spacing: .14em; text-transform: uppercase; color: var(--faint); }
.t-label::before { content: ""; width: 6px; height: 6px; background: currentColor; }   /* el nodo */
.t-label--signal { color: var(--cyan); } .t-label--pain { color: var(--amber); }
.tone { background: linear-gradient(92deg, #fff 0%, var(--cyan-soft) 35%, var(--cyan) 70%, var(--indigo) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
@media (max-width: 767px) { .t-body { font-size: 1rem; } }
```

### 8.4 Retícula, contenedor y marcos

```css
.container { width: min(var(--container), 100% - 2 * var(--gutter)); margin-inline: auto; }
.grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--col-gap); }
@media (max-width: 767px) { .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); column-gap: 16px; } }

/* Marco de líneas finas con marcas "+" en las esquinas (Runtime, registro, flujos) */
.frame { position: relative; border-block: 1px solid var(--hair); }
.frame::before, .frame::after { content: ""; position: absolute; inset: -6px 0 auto; height: 11px; pointer-events: none;
  background:
    linear-gradient(var(--hair-2), var(--hair-2)) 0 50% / 11px 1px no-repeat,
    linear-gradient(var(--hair-2), var(--hair-2)) 5px 0 / 1px 11px no-repeat,
    linear-gradient(var(--hair-2), var(--hair-2)) 100% 50% / 11px 1px no-repeat,
    linear-gradient(var(--hair-2), var(--hair-2)) calc(100% - 5px) 0 / 1px 11px no-repeat; }
.frame::after { inset: auto 0 -6px; }

/* Retícula de fondo que solo se ve donde hay luz (B-D6, ref. 4) */
.gridlight { position: absolute; inset: -10%; z-index: -2; pointer-events: none;
  background-image: linear-gradient(var(--hair) 1px, transparent 1px), linear-gradient(90deg, var(--hair) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(45% 50% at var(--gx, 50%) var(--gy, 50%), #000, transparent);
          mask-image: radial-gradient(45% 50% at var(--gx, 50%) var(--gy, 50%), #000, transparent); }
```

### 8.5 Cristal (3 niveles + versión sólida)

```css
.glass-panel {                        /* ventanas de demo */
  position: relative; border-radius: var(--r-window); overflow: clip;
  background: linear-gradient(180deg, rgb(16 24 52 / .62), rgb(6 9 20 / .58));
  -webkit-backdrop-filter: blur(20px) saturate(150%); backdrop-filter: blur(20px) saturate(150%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .14), inset 0 0 0 1px var(--hair-2),
              0 40px 100px -20px rgb(0 0 0 / .7);
}
.glass-panel__bar { display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px;
  border-bottom: 1px solid var(--hair); font: 500 11px/1 var(--f-mono); letter-spacing: .08em;
  text-transform: uppercase; color: var(--faint); }
.glass-panel__bar .sim { margin-left: auto; color: var(--cyan); }      /* "SIMULACIÓN" */
.glass-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--r-chip);
  background: rgb(10 31 76 / .38); -webkit-backdrop-filter: blur(14px) saturate(140%); backdrop-filter: blur(14px) saturate(140%);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .12), inset 0 1px 0 rgb(255 255 255 / .18);
  font: 500 13px/1.2 var(--f-body); }
.glass-bar { background: rgb(3 4 11 / .62); -webkit-backdrop-filter: blur(16px) saturate(140%); backdrop-filter: blur(16px) saturate(140%);
  box-shadow: inset 0 -1px 0 rgb(0 229 255 / .12); }
.solid-panel { border-radius: var(--r-panel); background: var(--panel); box-shadow: inset 0 0 0 1px var(--hair); }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .glass-panel, .glass-chip { background: rgb(9 14 34 / .94); } }
/* Trampa de B-D4: ningún ancestro de un .glass-* con opacity < 1, filter, mask o clip-path animados. */
```

### 8.6 Tratamiento de imagen (recetas)

```css
/* 1 · Bordes fundidos con el lienzo (escritorio) */
.scene__media img {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 9%, #000 80%, transparent 100%),
                      linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%);
  -webkit-mask-composite: source-in;
          mask-image: linear-gradient(to bottom, transparent 0, #000 9%, #000 80%, transparent 100%),
                      linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%);
          mask-composite: intersect;
}
@media (max-width: 1023px) {
  .scene__media img { -webkit-mask-image: linear-gradient(to bottom, #000 0 52%, transparent 92%);
                              mask-image: linear-gradient(to bottom, #000 0 52%, transparent 92%); } }

/* 2 · Velo direccional (3 paradas) + viñeta en el sujeto */
.scene { --side: 90deg; } .scene[data-side="left"] { --side: 270deg; }
.scene__scrim { position: absolute; inset: 0; z-index: -4; pointer-events: none; background:
  linear-gradient(var(--side), rgb(3 4 11 / .94) 0%, rgb(3 4 11 / .76) 30%, rgb(3 4 11 / .22) 47%, rgb(3 4 11 / 0) 58%),
  radial-gradient(110% 85% at calc(var(--fx) * 100%) 45%, transparent 45%, rgb(3 4 11 / .5) 100%); }
.scene[data-tone="dolor"] .scene__scrim { background:
  linear-gradient(var(--side), rgb(3 4 11 / .95) 0%, rgb(3 4 11 / .8) 32%, rgb(3 4 11 / 0) 58%),
  radial-gradient(60% 50% at calc(var(--fx) * 100%) 60%, rgb(255 181 71 / .08), transparent 70%); }

/* 3 · Gradado único (red de seguridad de B-D12): lleva los medios tonos al navy y respeta el blanco de Kain */
.scene__media::after { content: ""; position: absolute; inset: 0; pointer-events: none;
  mix-blend-mode: color; opacity: .28; background: linear-gradient(160deg, var(--navy), #02040E 70%); }

/* 4 · Brillo anclado detrás del sujeto y destellos del arranque */
.glow { width: 44cqw; aspect-ratio: 1; translate: -50% -50%;
  background: radial-gradient(closest-side, rgb(0 229 255 / .30), rgb(69 93 255 / .12) 55%, transparent);
  filter: blur(30px); mix-blend-mode: screen; }
.ignite { width: 28px; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(closest-side, #fff, var(--cyan) 40%, transparent); mix-blend-mode: screen; opacity: 0; }

/* 5 · Duotono para personas reales (equipo), B-D5 */
.duo img { filter: url(#duo-ingeniak) contrast(1.08); }

/* 6 · Aura del isotipo (secciones sin persona); exportar YA desenfocado, sin filter en vivo */
.aura { position: absolute; inset: -10% -20%; z-index: -2; pointer-events: none; }
.aura img { width: 100%; height: 100%; object-fit: contain; opacity: .55; mix-blend-mode: screen; }

/* 7 · Grano global único */
body::after { content: ""; position: fixed; inset: -50%; z-index: 100; pointer-events: none; opacity: .055;
  mix-blend-mode: overlay; background: url(/fx/noise-256.webp); }
```

### 8.7 Botones y teclas

```css
@property --ang { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.btn { display: inline-flex; align-items: center; gap: 12px; height: 52px; padding: 0 18px 0 20px;
  border-radius: var(--r-btn); position: relative; isolation: isolate; text-decoration: none;
  font: 600 .9375rem/1 var(--f-body); letter-spacing: -.005em;
  transition: background var(--t-fast) var(--ease-ui), box-shadow var(--t-fast) var(--ease-ui), translate var(--t-fast); }
.btn:active { translate: 0 1px; }
.btn__arrow { width: 16px; height: 16px; transition: translate .3s var(--ease-out); }
.btn:hover .btn__arrow { translate: 3px 0; }

.btn--primary { background: var(--blue); color: #fff;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / .25), inset 0 0 0 1px rgb(255 255 255 / .1),
              0 8px 24px -6px rgb(0 85 255 / .6), 0 0 48px -8px rgb(0 85 255 / .55); }
.btn--primary:hover { background: var(--blue-hi); }
.btn--primary::after {                               /* borde de señal: la rama "llega" al botón */
  content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; pointer-events: none;
  background: conic-gradient(from var(--ang), transparent 0 72%, var(--cyan) 86%, #fff 90%, transparent 95%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  opacity: 0; transition: opacity .3s; }
.btn--primary:hover::after, .btn--primary.is-traced::after { opacity: 1; animation: trace 1.6s linear; }
.btn--primary:hover::after { animation-iteration-count: infinite; }
@keyframes trace { to { --ang: 360deg; } }

.btn--glass { background: rgb(255 255 255 / .06); color: #fff; box-shadow: inset 0 0 0 1px var(--hair-2);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.btn--glass:hover { box-shadow: inset 0 0 0 1px rgb(0 229 255 / .5), 0 0 32px rgb(0 229 255 / .16); }
.btn--link { height: auto; padding: 8px 0; font: 500 .75rem/1 var(--f-mono); letter-spacing: .14em;
  text-transform: uppercase; color: var(--muted); }
.btn--link:hover { color: var(--text); }
kbd, .kbd { font: 500 11px/1 var(--f-mono); padding: 4px 6px; border-radius: 6px; color: var(--muted);
  box-shadow: inset 0 0 0 1px var(--hair-2), inset 0 -1px 0 rgb(255 255 255 / .08); }
@media (max-width: 767px) { .ctas .btn { width: 100%; justify-content: space-between; } }
```

### 8.8 Piezas de bento, filas y paneles (sin tarjetas de cliché)

```css
.bento { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); grid-auto-rows: 96px; gap: 12px; }
.tile { --mx: 50%; --my: 0%; position: relative; overflow: clip; border-radius: var(--r-tile); padding: 24px;
  display: grid; grid-template-rows: auto 1fr auto; gap: 16px;
  background: linear-gradient(180deg, rgb(255 255 255 / .04), rgb(255 255 255 / .012));
  box-shadow: inset 0 0 0 1px var(--hair); }
.tile::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .3s;
  background: radial-gradient(420px circle at var(--mx) var(--my), rgb(0 229 255 / .08), transparent 60%); }
.tile:hover::before { opacity: 1; }                                  /* foco de luz que sigue al cursor (C #35) */
.tile--xl { grid-column: span 7; grid-row: span 4; } .tile--l { grid-column: span 5; grid-row: span 4; }
.tile--m { grid-column: span 4; grid-row: span 3; }  .tile--s { grid-column: span 3; grid-row: span 3; }
.tile__fig { font: 500 11px/1 var(--f-mono); letter-spacing: .1em; color: var(--faint); }   /* "Fig. 03" */
@media (max-width: 767px) { .bento { grid-template-columns: 1fr; grid-auto-rows: auto; }
  .tile--xl, .tile--l, .tile--m, .tile--s { grid-column: auto; grid-row: auto; min-height: 220px; } }

.row { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 4fr) minmax(0, 2fr) minmax(0, 1fr) 24px;
  align-items: baseline; gap: 24px; padding: 28px 0; border-top: 1px solid var(--hair);
  text-decoration: none; position: relative; }
.row::before { content: ""; position: absolute; inset: 0; z-index: -1; transform-origin: left; scale: 0 1;
  background: linear-gradient(90deg, rgb(0 229 255 / .07), transparent 70%); transition: scale .5s var(--ease-out); }
.row:hover::before, .row:focus-visible::before { scale: 1 1; }
@media (max-width: 767px) { .row { grid-template-columns: 1fr auto; gap: 8px; } }

/* Primitivas */
.node { width: 8px; height: 8px; background: var(--cyan); box-shadow: 0 0 12px var(--cyan), inset 0 0 2px #fff; }
.node--pain { background: var(--amber); box-shadow: 0 0 12px rgb(255 181 71 / .8); }
.node--idle { background: transparent; box-shadow: inset 0 0 0 1px var(--hair-cyan); }
.wire { position: absolute; overflow: visible; pointer-events: none; }
.wire path { fill: none; stroke-width: 1.25; stroke-linecap: square; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.wire .base { stroke: rgb(0 229 255 / .35); }
.wire .live { stroke: var(--cyan); filter: drop-shadow(0 0 4px rgb(0 229 255 / .8)); }
.wire .pulse { stroke: #fff; stroke-width: 2; stroke-dasharray: 14 600; filter: drop-shadow(0 0 6px var(--cyan)); }
```

### 8.9 Kit de UI para las demos (estética propia, nunca copia de otra marca)

| Pieza | Especificación |
|---|---|
| **Burbuja de chat** | Cliente: `rgb(255 255 255 / .08)`, radio 14/14/14/4, Inter 14. Kain: `linear-gradient(135deg, rgb(69 93 255 / .55), rgb(0 85 255 / .45))`, radio 14/14/4/14, con nodo "K" de 16 px. Hora en mono de 10 px `--faint`. "Escribiendo…": 3 nodos cuadrados que laten. |
| **Evento del sistema** | Línea en mono de 11 px con nodo cian: `▣ Cita creada · CRM actualizado`. Así se ve que "pasó algo" en otro sistema. |
| **Columna de pipeline** | Encabezado en mono con contador **sin número** (solo nodo); tarjeta de lead de radio 10, con nombre genérico, canal y etiqueta de etapa. |
| **Nodo de flujo** | Cuadro de 44 px de radio 10 con ícono Lucide de 1.5; las ramas entre nodos con la geometría del isotipo; el pulso recorre la rama al ejecutarse. |
| **Tablero** | 7 nodos de fuente (`01`–`07`) → una gráfica de área cian al 30 % con la línea al 100 %; ejes con líneas finas; sin valores en el eje (no hay datos confirmados). |
| **Ficha técnica** | `clave` en `--faint` y `valor` en blanco, mono 13, separadas por líneas finas. |
| **Estado** | `□ en espera` (`.node--idle`) · `◧ en curso` (nodo que late) · `■ listo` (`.node`). Nunca verde: el "listo" es cian. Los glifos son cuadrados, como el nodo del isotipo. |
| **Pausa** | Botón de 28 px con ícono de pausa/reproducir en la barra de cada demo que se reproduce sola (WCAG 2.2.2). |

---

## 9. Sistema de movimiento

### 9.1 Base

```js
// src/scripts/motion.ts (una sola vez por página)
import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const lenis = new Lenis({ autoRaf: false, lerp: .1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  return () => lenis.destroy();
});
```

| Token | Valor |
|---|---|
| Duraciones | rápida .16 s (hover) · UI .3 s · base .6 s · lenta 1.1 s · escena 1.6 s |
| Eases | `expo.out` entradas · `power3.out` UI · `power3.inOut` Flip y vuelos · `none` scrub · `back.out(2)` solo el nodo del arranque |
| Stagger | .06 UI · .08 líneas de titular · .03 líneas de ficha |
| Distancias | 14 px UI · 22 px texto · `yPercent` 110 en máscaras de línea |

### 9.2 Recetas propias del concepto

| Receta | Cómo |
|---|---|
| **Escena se enciende** | `scene__veil` con apertura radial desde el ancla (`--r`), placa de escala 1.06 → 1 y `.ignite` en ojos o pecho (§3). |
| **Rama** | `gsap.from(path, { drawSVG: 0, duration: .5 })`; en scrub: `drawSVG: '0% 0%'` → `'0% 100%'`. Al terminar, `.live` se queda y `.pulse` hace un viaje (`strokeDashoffset`). |
| **Panel arranca** | La barra de título hace `scaleX` 0 → 1 (.25 s) → esqueleto de 2–3 barras con brillo (.2 s) → el contenido real entra por elementos. En el chat, cada burbuja va precedida de "escribiendo…" de 500–900 ms según su largo. |
| **Chat en guion** | JSON `[{ from, at, text, typing }]`; un timeline por guion; `IntersectionObserver` lo pausa fuera de la vista; botón de pausa; con movimiento reducido se muestra completo. |
| **Runtime con pasos** | Ver §9.4. |
| **Conteo visual** | El valor final está en el HTML; al entrar: `gsap.from(obj, { v: from, snap: { v: dec }, onUpdate: () => el.textContent = fmt(obj.v) })` y `aria-label` con el valor final. |
| **Progreso de la Espina** | Un `ScrollTrigger` global con `scrub` sobre `--p` (0–1) del relleno; `onToggle` por sección enciende el nodo y dibuja la rama del capítulo. |
| **Cambio de escena (casos)** | Dos `<img>` apiladas, la nueva entra en opacidad 0 → 1 (.7 s) mientras la vieja escala a 1.03; la siguiente se precarga con `decode()` antes de cambiar. |
| **Chip flotante** | `gsap.to(chip, { y: -6, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })`, desfasados. |
| **Botón magnético** | `gsap.quickTo(btn, 'x', { duration: .4, ease: 'power3' })` ±6 px, solo con `(pointer: fine)`. |

### 9.3 Parallax de escena (una sola pieza)

```js
gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom top', scrub: true } })
  .to(scene.querySelector('.scene__plate'), { yPercent: 6, ease: 'none' }, 0)      // imagen + anclas + panel juntos
  .to(scene.querySelector('.scene__inner'), { yPercent: -14, autoAlpha: .25, ease: 'none' }, 0);
```

### 9.4 Runtime (pin con 5 pasos, Flip fuera del scrub)

```js
import { Flip } from 'gsap/Flip'; gsap.registerPlugin(Flip);
const steps = 5, views = [...rt.querySelectorAll('.rt-view')], slots = [...rt.querySelectorAll('[data-lead-slot]')];
const lead = rt.querySelector('.lead-card'); let cur = -1;
function goTo(i: number) {
  if (i === cur) return;
  const state = Flip.getState(lead);
  slots[i].append(lead);
  views.forEach((v, k) => v.toggleAttribute('data-active', k === i));
  Flip.from(state, { duration: .8, ease: 'power3.inOut', absolute: true });
  rt.dispatchEvent(new CustomEvent('rt:step', { detail: i }));          // arranca la micro-demo de la vista
  cur = i;
}
ScrollTrigger.create({
  trigger: rt, pin: true, start: 'top top', end: `+=${(steps - 1) * 100}%`,
  snap: { snapTo: 1 / (steps - 1), duration: .4, ease: 'power2.inOut' },
  onUpdate: s => { rt.style.setProperty('--p', String(s.progress)); goTo(Math.round(s.progress * (steps - 1))); },
});
goTo(0);
```

### 9.5 Presupuesto y reglas

- **JS:** home ≤ 85 KB gzip (GSAP + ScrollTrigger + SplitText + DrawSVG + Flip + Lenis + código del sitio). Páginas internas ≤ 60 KB: Flip y el Runtime se cargan solo donde se usan, con `import()` dinámico.
- **LCP** < 2.5 s en 4G: imagen del hero en AVIF ≤ 220 KB (escritorio) y ≤ 120 KB (móvil), precargada con `fetchpriority="high"`. El velo del arranque no bloquea el LCP porque la imagen ya está pintada. **CLS** < 0.05: las anclas están en CSS y la rama del tramo 2 es una capa absoluta.
- Como máximo **6 `backdrop-filter` visibles** a la vez; ninguno sobre video.
- Las demos y pulsos se detienen fuera del viewport (`IntersectionObserver`) y con `document.hidden`.
- Sin WebGL. Video solo opcional: clip de Kain con alfa (`kain-presenta.webm`) sobre una placa limpia del hero, P1, solo desktop, después del arranque.
- **Movimiento reducido:** sin Lenis, sin pin (el Runtime se vuelve 5 bloques), sin parallax ni pulsos; cada demo en su estado final; fundidos de 300 ms.

---

## 10. Escenas héroe y de firma (8)

Reglas comunes (además de B §6 y C §1.3): una sola luz fría (contraluz cian #00E5FF / azul #0055FF) y, si acaso, un relleno índigo tenue desde el lado del texto · fondo #0A1F4C → #03040B con los 4 bordes cayendo a #03040B · **sin texto, letras, números, logos ni UI legible** · placas de cristal **en blanco, frontales (sin inclinación) y con brillo uniforme** para registrar el HTML encima · piso continuo a ~82 % · Kain idéntico a `kain-body-*.jpg` (blanco, ojos ovalados cian, dos antenas, auriculares cromados, pantalla cuadrada oscura con asterisco cian) y de cuerpo completo · plataformas **cuadradas** (nodo del isotipo), nunca redondas · versión móvil 9:16 generada aparte, no recortada.

**Esqueleto de prompt (inglés, Nano Banana Pro con las referencias de Kain adjuntas):**

```
Cinematic 21:9 wide shot (3360x1440), premium tech campaign, single cold light source.
SUBJECT: [S]. COMPOSITION: subject occupies x [S-RANGE] of the frame; [U-ELEMENT] at x [U-RANGE], y [U-Y];
the LEFT/RIGHT [T-RANGE] of the frame is clean negative space: smooth deep navy (#0A1F4C) fading to near-black
(#03040B) with faint volumetric haze, no objects, no particles, no light sources.
Continuous dark glossy floor at 82% height. All four frame edges fade to #03040B.
LIGHT: cyan (#00E5FF) and electric blue (#0055FF) rim light from behind/below the subject; very soft indigo
(#455DFF) fill entering from the text side. 35mm, f/2.8, shallow depth of field, fine film grain, HDR.
NEGATIVE: text, letters, numbers, logos, UI with readable content, watermark, extra robots, black robot,
round platform, warm light, lens flare on the empty side, cropped feet, tilted glass panels.
```

### 10.1 E1 · "La consola" · Home, portada

- **Sujeto:** Kain de pie en x 66–86 %, en vista de tres cuartos girado hacia la izquierda; **asterisco del pecho a y 42 %**; el brazo del lado del texto extendido, con la palma abierta hacia arriba en x 63 %, y 47 %, presentando.
- **U:** una **placa de cristal en blanco** flotando justo delante de la palma, hacia el lado del texto, frontal, en x 50–62 %, y 22–56 %, con brillo cian uniforme y bordes con un filo de luz.
- **Entorno:** estudio navy; detrás de Kain, un **pilar de luz vertical** (el pilar del isotipo) que sube desde una **plataforma cuadrada** de luz bajo sus pies; desde la plataforma salen dos trazas de luz finas por el piso en diagonal hacia atrás a izquierda y derecha (los brazos del isotipo) que se pierden en la niebla antes del 48 %.
- **T:** x 0–46 % limpio.
- **Anclas:** `chest` (0.75, 0.42) · `palm` (0.63, 0.47) · `slab` (0.50, 0.22, 0.12, 0.34) · `platform` (0.76, 0.84) · `eyes` (0.76, 0.24). Son valores de diseño: se miden sobre el render final.
- **Móvil 9:16:** Kain en x 52–92 %, y 6–52 %; placa en x 6–48 %, y 20–40 %; plataforma a y 54 %; debajo, fundido con las trazas del piso bajando hacia el texto.
- **Base:** `materiales/discovery/kain-01-hero.png` (ya tiene el haz y la mano abierta). Regenerar con la placa y la plataforma cuadrada y con Kain movido un poco a la derecha. Hacer también **recorte** (`remove_background`) y **placa limpia**, para el clip de video P1.
- **Panel encima:** chat de WhatsApp (§5.1).

### 10.2 E2 · "11:48 p. m." · Home, el problema (tono dolor)

- **Sujeto:** dueño de pyme mexicano (~45 años, camisa con mangas arremangadas) sentado solo en el mostrador de su local cerrado, de noche, mirando su teléfono; **la luz ámbar de la pantalla (#FFB547) ilumina su rostro desde abajo** (única fuente de luz); x 14–36 %, el hombro del lado de la sombra disuelto en el fondo.
- **U:** hueco oscuro y desenfocado en x 36–50 %, y 28–58 % (anaqueles fuera de foco) para la pila de notificaciones.
- **T:** x 54–100 % en sombra profunda casi negra.
- **Anclas:** `phone` (0.30, 0.60) · `face` (0.25, 0.38) (zona prohibida para UI).
- **Variante P1 (misma semilla):** la luz del teléfono en cian y el gesto relajado, para el cross-fade de la salida.
- **Móvil 4:5 / 9:16:** persona arriba al centro y a la izquierda, teléfono a y 40 %, hueco a la derecha del teléfono, sombra abajo.
- **Prompt (SUBJECT):** "a Mexican small-business owner in his mid-40s, sleeves rolled up, sitting alone at the counter of his closed shop at night, looking down at his phone; the phone screen casts a warm amber (#FFB547) glow on his face from below — the ONLY light in the scene; his shadow side dissolves into darkness". **En esta escena se omite el contraluz cian** de la regla común.

### 10.3 E3 · "El operador" · Home "Conoce a Kain" + portada de `/kain/` (en espejo)

- **Sujeto:** Kain de cuerpo completo en x 16–36 %, de pie y tranquilo, mirando hacia la placa que sostiene a su izquierda con una mano.
- **U:** **placa de cristal con forma de teléfono** (proporción 9:19.5), frontal, en blanco, con un brillo cian suave que ilumina el costado de Kain; x 37–49 %, y 20–70 %.
- **Entorno:** estudio navy con un halo cian detrás de Kain y la plataforma cuadrada.
- **T:** x 54–100 % limpio.
- **Anclas:** `chest` (0.26, 0.43) · `slab` (0.37, 0.20, 0.12, 0.50).
- **Móvil:** Kain en x 8–52 % y placa en x 54–90 %, ambos en y 6–50 %; el simulador real va debajo del copy (§5.7).
- **Para `/kain/`:** versión en espejo (Kain a la derecha) o el centrado "foto de producto" de C K-01. Decidir según el resultado del render.

### 10.4 E4 · "Turno de noche" · Portada de `/servicios/agentes-ia-whatsapp/`

- **Sujeto:** Kain en x 66–86 % en una recepción moderna y vacía de noche, de pie detrás de un mostrador oscuro y bajo (que no tapa sus piernas: el mostrador queda a un lado), con una mano levantada como si enviara un mensaje; luces de la ciudad desenfocadas (bokeh azul) por un ventanal detrás.
- **U:** placa de cristal en blanco (frontal) en x 50–62 %, y 24–58 %; **burbujas de cristal pequeñas sin texto** que suben de la placa como partículas.
- **T:** x 0–46 % limpio.
- **Anclas:** `hand` (0.64, 0.40) · `slab` (0.50, 0.24, 0.12, 0.34) · `chest` (0.76, 0.44).
- **Panel encima:** chat de las 11:48 p. m. con el evento `▣ Cita creada` y el chip `dental-respuesta`.

### 10.5 E5 · "Pipeline de luz" · Portada de `/servicios/crm-con-ia/` y `/kommo/`

- **Sujeto:** Kain en x 18–36 %, avanzando hacia la derecha y sosteniendo con las dos manos una **tarjeta de cristal en blanco** (formato tarjeta, horizontal, frontal) a la altura del pecho.
- **Entorno:** detrás de él, del lado izquierdo, **4 columnas de luz verticales** que se alejan en profundidad (las etapas del pipeline), sin texto; la última columna, más cercana a Kain, es la más brillante.
- **U:** la tarjeta misma, en x 36–50 %, y 38–56 %.
- **T:** x 54–100 % limpio.
- **Anclas:** `card` (0.36, 0.38, 0.14, 0.18) · `chest` (0.27, 0.44).
- **Panel encima:** tarjeta de lead HTML registrada sobre la tarjeta de cristal (nombre genérico · canal WhatsApp · etapa "Cita agendada" con nodo cian). En `/kommo/` va el sello Partner en el copy (nunca dentro de la imagen).

### 10.6 E6 · "Fin del turno" · Portada de `/industrias/salud/`

- **Sujeto:** odontóloga (~40 años, bata blanca, cabello recogido) de pie en x 68–88 %, en un consultorio dental moderno y vacío al final del día; sostiene su teléfono a la altura de la cintura y mira hacia la izquierda con calma. Sillón dental desenfocado detrás; contraluz blanco-cian desde una ventana; el lado de la sombra se funde con el fondo. Duotono frío.
- **U:** hueco oscuro desenfocado en x 50–66 %, y 30–60 % (pared del consultorio fuera de foco).
- **T:** x 0–46 % limpio.
- **Anclas:** `phone` (0.70, 0.62) · `face` (0.76, 0.28) (prohibida para UI).
- **Panel encima:** 2 burbujas del lado del paciente + "Imagen ilustrativa" en la esquina.
- **Prompt (SUBJECT, extra):** "blue monochrome duotone grading, no identifiable real person, natural expression, the shadow side dissolves into the dark background, no hard edges".

### 10.7 E7 · "Hora azul" · Portada de `/casos/clinica-dental-monterrey/` (y fuente de la escena de casos del home)

- **Sujeto:** odontólogo (~45 años) de pie en x 66–86 % junto a un ventanal de piso a techo; mira hacia la izquierda, hacia la cifra. Afuera, **hora azul** (no atardecer cálido, por la regla de una sola luz fría) con la silueta de las montañas de Monterrey desenfocada.
- **U:** no hay panel; la cifra gigante del HTML ocupa T. Chips de ficha en el borde inferior de T.
- **T:** x 0–50 % limpio (la cifra mide 160–200 px).
- **Anclas:** `face` (0.74, 0.30) (prohibida para UI).
- **Regla de casos:** las 5 portadas de caso se generan **con el sujeto a la derecha** para que la escena del home (§5.9) las reutilice.

### 10.8 E8 · "Nodo Discovery" · Cierre compartido (sustituye las dos variantes con Kain de D §4.5, `kain-saluda` y `kain-senala`; las variantes "dueña tranquila" y "equipo" se mantienen donde D las asigna)

- **Sujeto:** Kain de cuerpo completo en x 20–38 %, de pie sobre un **nodo cuadrado de luz** en el piso; con una mano señala hacia la derecha a la altura de la cadera (hacia el botón); un haz volumétrico estrecho cae sobre él desde arriba.
- **Entorno:** una **traza de luz en el piso** llega desde la profundidad, al fondo a la izquierda, hasta el nodo y continúa un poco hacia la derecha, desvaneciéndose antes del 52 %.
- **T:** x 54–100 % limpio.
- **Anclas:** `node` (0.29, 0.84) · `trace-end` (0.50, 0.86) · `hand` (0.40, 0.55).
- **Móvil:** Kain arriba al centro y la traza baja en diagonal hacia el 60 % (donde empieza el botón).
- **HTML:** la rama continúa desde `trace-end` hasta el botón primario; la Espina "aterriza" en `node`.

### 10.9 Producción

| Paso | Herramienta | Salida |
|---|---|---|
| 1. Generar escritorio | Magnific · Nano Banana Pro + `kain-body-*.jpg` | 21:9, mínimo 3360×1440 (si sale menor, upscale ×2) |
| 2. Generar móvil | Ídem, prompt vertical propio | 9:16, 1080×1920 |
| 3. Recorte y placa limpia (solo E1 y E3) | `remove_background` + inpainting | PNG/WebP con alfa del mismo tamaño |
| 4. Medir anclas | Figma o Photoshop: coordenadas normalizadas (0–1) | `scenes.json` |
| 5. Exportar | `astro:assets` → AVIF + WebP en 828/1280/1920/2560 (móvil 720/1080) | `/img/cine/{id}-{ancho}.avif` (convención de D §4.4) |
| 6. Verificar | Capa `?anchors=1` + lista de §4.6 en 5 anchos | Captura por ancho |

**Orden de producción:** E1 → E8 → E3 → E4 → E5 → E2 → E6 → E7, y después el resto de D §14.
**Mientras llegan:** escena compuesta en CSS con `fondo-ondas` + el recorte PNG de Kain que corresponda (`recortes_png/kain-presenta.png`, `kain-senala.png`, `kain-saluda.png`, `kain-brazos-cruzados.png`, `kain-doctor-brazos-cruzados.png`) en el lado del sujeto. Sigue siendo una escena a sangre y permite construir y probar todo antes de tener las imágenes finales.

### 10.10 Manifiesto de escenas (`src/data/scenes.json`)

```json
{
  "home-hero": {
    "alt": "Kain, el agente de IA de Ingeniak, presenta una pantalla de cristal con la mano abierta",
    "desktop": { "src": "/img/cine/home-hero", "w": 3360, "h": 1440, "fx": 0.62, "fy": 0.5,
      "anchors": { "chest": [0.75, 0.42], "palm": [0.63, 0.47], "platform": [0.76, 0.84],
                   "slab": [0.50, 0.22, 0.12, 0.34] } },
    "mobile":  { "src": "/img/cine/home-hero-movil", "w": 1080, "h": 1920, "fx": 0.5, "fy": 0,
      "anchors": { "chest": [0.72, 0.30], "slab": [0.06, 0.20, 0.42, 0.20] } },
    "side": "right", "tone": "solucion", "panel": "chat:home-hero"
  }
}
```

---

## 11. Astro: componentes y datos

### 11.1 Árbol

```
src/
  data/  sitemap.json (D) · navegacion.json (D) · scenes.json · sims/*.json (guiones) · indice (generado)
  lib/   metrics.ts · anchors.ts (estilos de anclas por escena) · wa.ts (enlaces de WhatsApp)
  components/
    scene/   Scene.astro · ScenePanel.astro · Wire.astro · Veil.astro · BootIntro.astro
    system/  Spine.astro · Node.astro · Frame.astro · Aura.astro
    ui/      ChatPanel.astro · PipelinePanel.astro · FlowPanel.astro · DashPanel.astro · SpecSheet.astro · DiagLog.astro
    data/    Metric.astro · Ledger.astro · Row.astro · Bento.astro · Tile.astro
    nav/     Header.astro · MegaMenu.astro · CommandPalette.astro · MobileSheet.astro · BottomBar.astro · KainWidget.astro
    blocks/  Runtime.astro · VktorPipeline.astro · CaseSwitcher.astro · SectorSelector.astro · StackHub.astro · Day24h.astro · ResponseRace.astro · FAQ.astro · Breadcrumbs.astro
  scripts/  motion.ts · boot.ts · scene.ts · wire.ts · runtime.ts · sims.ts · palette.ts · spine.ts
  pages/    (árbol de D §16)
```

Sin React ni otro framework de islas: componentes Astro + módulos TS que Astro empaqueta. La búsqueda ⌘K es un web component `<cmd-palette>` que se carga con `import()` al primer uso.

### 11.2 API del componente de escena

```astro
<Scene id="home-hero" height="hero" priority>
  <Fragment slot="copy">
    <p class="t-label t-label--signal" data-reveal>Agentes de IA · CRM · Automatización</p>
    <h1 class="t-hero" data-reveal>Agentizamos empresas.<span class="t-hero__sub">Agentes de IA, CRM y automatización en un solo sistema.</span></h1>
    <p class="t-lede" data-reveal>…</p>
    <div class="ctas" data-reveal><a class="btn btn--primary" href="/discovery/">Agenda tu Discovery Session</a> …</div>
  </Fragment>
  <ChatPanel slot="panel" anchor="slab" script="home-hero" />
  <Metric slot="chips" id="dental-respuesta" variant="chip" anchor="platform" />
</Scene>
```

`Scene` lee `scenes.json[id]`. Emite `<picture>` (fuentes de móvil y escritorio, `fetchpriority` solo con `priority`), escribe las variables de anclas en un `<style>` con alcance por `id` y con su `@media` para móvil, coloca los slots en sus capas y añade `data-side` y `data-tone`.

### 11.3 Guarda de cifras (que ninguna cifra inventada llegue a producción)

```ts
// src/lib/metrics.ts: única fuente de cifras del sitio
export const METRICS = {
  'dental-citas':        { value: '3.2×', label: 'más citas en 90 días', ctx: 'Clínica dental · Monterrey', href: '/casos/clinica-dental-monterrey/' },
  'dental-respuesta':    { value: '8 min → 12 s', label: 'tiempo de respuesta', ctx: 'Clínica dental · Monterrey', href: '/casos/clinica-dental-monterrey/' },
  'ecom-cpl':            { value: '−58%', label: 'costo por lead en 60 días', ctx: 'E-commerce · CDMX', href: '/casos/ecommerce-cdmx-costo-por-lead/' },
  'retail-conversiones': { value: '+340%', label: 'conversiones', ctx: 'Retail multimarca · Kommo + IA', href: '/casos/retail-multimarca-kommo/' },
  'horeca-roas':         { value: 'ROAS 4.8×', label: 'sostenido', ctx: 'HoReCa', href: '/casos/horeca-roas/' },
  'logistica-procesos':  { value: '27', label: 'procesos automatizados', ctx: 'Logística · n8n', href: '/casos/logistica-n8n/' },
  'salud-citas-mes':     { value: '12 → 47', label: 'citas al mes en promedio', ctx: 'Clientes del sector salud' },
  'tiempo-operativo':    { value: '−60%', label: 'tiempo operativo', ctx: 'Promedio, primeros 90 días' },
  'ecom-tablero':        { value: '1 vista · 7 fuentes', label: 'tablero unificado', ctx: 'E-commerce' },
  'sistemas':            { value: '+73', label: 'sistemas en producción', ctx: 'Ingeniak' },
  'paises':              { value: '7', label: 'países', ctx: 'México (sede), Estados Unidos, Colombia, Argentina, España, Costa Rica y Ecuador' },
} as const;
export const SOURCE_NOTE = 'Datos internos de Ingeniak, octubre de 2026';
```

- `<Metric>` solo acepta `id: keyof typeof METRICS`, así que TypeScript no deja escribir una cifra libre en un componente.
- `scripts/check-cifras.mjs` corre después de `astro build`: recorre `dist/**/*.html` y **falla el build** si encuentra en el texto visible un patrón de cifra comercial (`\d+(\.\d+)?\s?(%|×|x\b)`, "N citas", "N procesos", "N min", "USD N") fuera de un elemento con `data-metric` o `data-allow-number` (este último solo para precio, fechas, horas, dirección y teléfono).
- Precio: solo la constante `PRICE_FROM = 'desde USD 997 al mes'`.

---

## 12. Anticlichés y riesgos

| Cliché o riesgo | Cómo se evita |
|---|---|
| Título centrado + subtítulo gris + 2 botones sobre degradado genérico | Ningún hero centrado: siempre escena con zonas T · U · S. Incluso el cierre (E8) es lateral. |
| 3 tarjetas iguales con ícono | Prohibidas por sistema: bento con al menos 2 tamaños y contenido vivo, filas de registro, salida de diagnóstico, selector de comandos. |
| "Falso en vivo" (toasts, contadores que suben solos, "hace 2 h") | Regla 5: etiqueta `SIMULACIÓN`, solo horas del día y cifras con ID. La línea de estado del footer es texto fijo. |
| Se siente SaaS frío, no agencia | Cada demo está dentro de una escena con Kain o con personas; copy con tuteo y primera persona de Kain; equipo real con duotono. |
| Copiar la interfaz de Kommo, WhatsApp o n8n | Kit de UI propio (§8.9); los logos de terceros solo en el stack, en blanco, según LOGOS.md. |
| Cristal plano sobre negro | Regla 7 + versión sólida. |
| La placa no coincide con el panel en algún ancho | Anclas en CSS con la misma matemática que `object-fit`; capa de depuración; tolerancia ±4 px; en el peor caso, el panel se vuelve chip. |
| Arranque largo o molesto | 2.2 s solo la primera vez en el home; versión corta de 0.9 s; se acelera ×5 con cualquier gesto; red de seguridad de 3 s. |
| Peso del JS | Presupuesto de §9.5 con `import()` dinámico; sin WebGL. |
| Imágenes de IA con errores (letras, robot negro, pies cortados) | Prompts negativos + lista de §4.6 + Kain siempre con las referencias; ninguna imagen se publica sin pasar la lista. |

---

## 13. Pendientes que este concepto agrega (además de D §15)

1. **Aprobar el cambio de casting:** servicios con Kain (en lugar de las personas que asigna D §14) y casos siempre con el sujeto a la derecha.
2. **CRM del caso dental** (Kommo o GoHighLevel): define si el diagrama del caso muestra el nombre o solo "CRM".
3. **Copy del manifiesto** (§5.4): "Si no mueve una cifra tuya, no va" es una promesa de posicionamiento y necesita el visto bueno del cliente.
4. **Agrupación del mega menú por etapas** (§7.2) en lugar de las 3 columnas de D §5: las URLs no cambian.
5. **Kain dentro de la foto del equipo** (§5.12): solo si el equipo está de acuerdo.
