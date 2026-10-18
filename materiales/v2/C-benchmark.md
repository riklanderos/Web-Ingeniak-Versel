# C · Benchmark UI/UX — sitios premium de IA (2025–2026) para Ingeniak v2

**Proyecto:** Ingeniak v2 — Astro SSG + GSAP 3.13 (ScrollTrigger, SplitText) + Lenis 1.3.11, deploy en Vercel.
**Fecha de revisión:** 18 de octubre de 2026.
**Método:** 19 consultas firecrawl (3 búsquedas + 16 scrapes de HTML completo) y más de 30 capturas con Chrome headless (1440×900 desktop y 390×844 móvil). Las capturas están en [`benchmark-shots/`](benchmark-shots/).
**Alcance:** todo lo descrito es lo observado en el HTML y las capturas de ese día. Cuando el motion no se pudo ver en vivo, se infiere del DOM (capas de imagen separadas, etiquetas, palabras partidas en spans) y se marca como inferido.

---

## 0. Conclusiones en 60 segundos

1. **El requisito "la imagen ES la sección" es el estándar de los mejores sitios de IA.** Sierra, Runway, Figure, 1X y 11x ponen la imagen o el video a sangre, con el sujeto en un lado y el texto sobre el espacio negativo del otro, **sin caja detrás del texto**. Los competidores en LATAM (Edit Innovation, SyncManager, Yalo, Darwin) y el ingeniak.mx actual usan "texto en un bloque + imagen en otro bloque". Ese hueco es la oportunidad más clara de Ingeniak.
2. **La receta tiene 5 piezas:** (a) una imagen generada con un espacio negativo diseñado para el texto, (b) un oscurecimiento (scrim) solo del lado del texto, (c) una disolución inferior hacia el color de la siguiente sección, (d) capas 2.5D con parallax y (e) un "chip" de cristal con una prueba (conversación o métrica) flotando sobre la imagen. El detalle está en la sección 1.
3. **Lo premium no lo dan los efectos, lo da la estructura:** mega menú con una línea de resultado por opción, páginas por industria, casos con cifras y plantilla Reto / Solución / Resultados, bloque de confianza y datos, y recursos (guías, glosario, comparativas). Hoy ingeniak.mx tiene 6 links en el menú y ninguna página de industria ni de caso.
4. **Un agente con nombre y cara como protagonista:** 11x tiene a Alice y Julian, Darwin a Alba, Bruno, Eva, Sofía y Lucas, Yalo a Oris. Kain, en 3D y con calidad de campaña, es un activo que ningún competidor en LATAM tiene. Debe ser el hilo visual de todo el sitio.
5. **Demos que se pueden usar dentro de la página:** voz en vivo en 11x, TTS en ElevenLabs, chats por caso de uso en Jelou, burbujas de acción en Decagon. Para Ingeniak: un simulador de WhatsApp de Kain por sector, con guion y sin backend, todo en HTML.
6. **La prueba siempre es número + contexto + sector** ("70% de resolución en chat y voz"). Ingeniak ya tiene 12 cifras confirmadas: alcanzan para una banda de métricas, tarjetas de caso y de 6 a 8 páginas de caso.
7. **Menú recomendado:** Servicios ▾ · Industrias ▾ · Casos · Metodología · Recursos ▾ · Nosotros ▾, con dos CTA: "Agenda tu Discovery Session" (azul) y "Escríbele a Kain" (ghost con WhatsApp). Detalle en la sección 5.
8. **13 plantillas de página** (sección 6), cada una con el patrón de imagen integrada en su hero y en sus secciones de texto + imagen.
9. **Contención estilo Linear:** Lexend grande con tracking negativo, Inter para el cuerpo y JetBrains Mono para las etiquetas (tipo "Fig. 0.1" o las coordenadas HUD de 11x). El lujo está en lo que no se pone.
10. **Hay contenido del sitio actual que NO debe migrar** (sección 9):
    - un testimonio con foto de randomuser.me;
    - las tablas de precios;
    - VKTOR con dos definiciones distintas;
    - países inconsistentes;
    - Victor Ocampo todavía en el equipo;
    - Kain negro en lugar del Kain blanco oficial;
    - contadores que muestran "0" en el HTML;
    - el HTML servido en inglés al crawler.

---

## 1. El patrón obligatorio: "la imagen ES la sección"

> Petición textual del cliente: la imagen es el fondo, la persona o el personaje va de un lado y los textos o botones del otro, y la imagen se siente parte de la misma sección, no como dos secciones separadas.

### 1.1 Qué hacen los mejores (evidencia)

| Sitio | Composición observada | Cómo integra texto e imagen | Captura |
|---|---|---|---|
| **Runway** — runwayml.com | Video a sangre dentro de una tarjeta con esquinas redondeadas y un margen de ~20 px. El sujeto (un tiburón) ocupa el centro y la derecha. | Titular, párrafo y botón abajo a la izquierda, sobre la zona más oscura del agua. Sin caja. | [runway.png](benchmark-shots/runway.png) |
| **Sierra** — sierra.ai | Video a sangre de una persona con un bebé, en luz cálida. | H1 blanco abajo a la izquierda y botón pill claro. A la derecha, un **chip de cristal con el avatar del agente y una frase transcrita** ("Oh, thanks for letting me know. Let's set that up."): la imagen "habla". | [sierra.png](benchmark-shots/sierra.png) |
| **Figure** — figure.ai | Video macro a sangre del robot. | H1 en mayúsculas abajo a la izquierda y botón de contorno "Full Video" abajo a la derecha. El menú en mayúsculas flota encima. | [figure.png](benchmark-shots/figure.png) |
| **1X** — 1x.tech | Tres robots NEO al centro. | "NEO Home Robot" a la izquierda y "$200 Deposit · Order" a la derecha: **el texto flanquea al sujeto**. La base de la imagen se disuelve en el color de fondo de la página, así que no hay costura. | [1x.png](benchmark-shots/1x.png) |
| **11x** — 11x.ai | Escena espacial compuesta por **5 capas WebP separadas** (`stars_bg`, `mars`, `astro`, `satellite`, `planet`), lo que indica parallax 2.5D (inferido). | Titular arriba con una palabra rotativa entre corchetes, CTA sobre el pecho del astronauta y coordenadas tipo HUD "X: 60.34 / Y: 32.33". | [11x.png](benchmark-shots/11x.png) · móvil: [m-11x.png](benchmark-shots/m-11x.png) |
| *Anti-ejemplo:* **ingeniak.mx (actual)** | Kain con un anillo-portal como fondo: la base es buena. | El texto vive dentro de una **tarjeta de cristal grande** y se lee como un segundo bloque. **En 390 px la tarjeta tapa a Kain casi por completo.** | [ingeniak-actual.png](benchmark-shots/ingeniak-actual.png) · [m-ingeniak-actual.png](benchmark-shots/m-ingeniak-actual.png) |
| *Anti-ejemplo:* **Edit Innovation** (MX) | Texto a la izquierda y una foto de stock en una caja redondeada a la derecha. | Dos bloques claramente separados. | [editinnovation.png](benchmark-shots/editinnovation.png) |
| *Anti-ejemplo:* **SyncManager** (LATAM) | Texto a la izquierda y una tarjeta blanca de servicios a la derecha. | Dos bloques. | [syncmanager.png](benchmark-shots/syncmanager.png) |

### 1.2 Anatomía de una sección "imagen = sección"

```
┌──────────────────────────────────────────────────────────────────────┐
│ z7  HUD / indicador de scroll (JetBrains Mono, 11px, cian 60%)       │
│ z6  Chips de cristal con prueba ─────────────┐   (anclados al sujeto)│
│ z5  Contenido SIN caja: kicker · H1 · lede · CTAs                    │
│ z4  Atmósfera global: grano único + haz/partículas cian (CSS)        │
│ z3  Scrims: lineal del lado del texto + disolución inferior + halo   │
│ z2  Capa del sujeto recortada (Kain en PNG/WebM con alfa) — opcional │
│ z1  Placa de imagen a sangre (AVIF): entorno + sujeto + piso         │
│ z0  Color de la sección #03040B (idéntico al de la siguiente)        │
└──────────────────────────────────────────────────────────────────────┘
     [ 45% espacio negativo para el texto ][ 55% escena con sujeto ]
```

### 1.3 Reglas de composición para generar las imágenes (Magnific / Nano Banana Pro con referencias de Kain)

1. **Formatos dedicados, sin recortar uno del otro.**
   - Desktop 21:9 (3200×1372).
   - Tablet 4:3 (opcional).
   - Móvil 9:16 (1080×1920), generado aparte: el texto arriba y Kain en el 55% inferior. Así lo resuelve 11x en móvil.
2. **Sujeto en un tercio.**
   - En el home, Kain va en el tercio derecho (x 58–88%).
   - En páginas internas se alterna el lado (servicio a la derecha, industria a la izquierda…) para dar ritmo.
   - La línea de los ojos de Kain cae a la altura del H1 (38–45% del alto).
3. **Espacio negativo diseñado.**
   - Un 45% del encuadre, del lado del texto, es un degradado #0A1F4C → #03040B con bruma volumétrica suave.
   - En esa zona no puede haber objetos de alto contraste, texto ni logos.
4. **La luz une las dos mitades.**
   - Una luz de contorno cian (#00E5FF) detrás del sujeto.
   - Una luz principal suave azul o índigo (#455DFF) que **entra desde el lado del texto**, para que la luz parezca salir del titular.
5. **Un piso continuo** (reflejo oscuro o retícula en perspectiva) a ~78% de alto, que cruza todo el ancho. El texto y Kain "pisan" el mismo suelo.
6. **Lente y acabado:** 35–50 mm, f/2.8, fondo desenfocado, grano fino, sin destellos del lado del texto y sin bordes recortados.
7. **Kain siempre fiel a la referencia y de cuerpo completo:**
   - blanco brillante;
   - ojos ovalados cian;
   - dos antenas finas;
   - auriculares cromados;
   - pantalla de pecho oscura con un asterisco cian.

   (En el sitio actual aparece una versión negra: no reutilizarla.)
8. **El ámbar (#FFB547) solo aparece en escenas de dolor:** por ejemplo, un teléfono con mensajes sin leer a las 11:48 pm.

**Plantilla de prompt (desktop):**

```
Cinematic 21:9 wide shot, premium tech advertising photography. [ESCENA DEL SECTOR/SERVICIO].
Subject: KAIN — small friendly white glossy robot (match the reference images exactly: cyan glowing
oval eyes, two thin antennas, chrome ear pieces, square dark chest screen with a glowing cyan asterisk),
FULL BODY, standing in the right third of the frame (x 60–85%), eye-line at 40% of frame height,
three-quarter view turned slightly toward the left.
Left 45% of the frame is clean negative space: smooth deep navy gradient (#0A1F4C to #03040B) with soft
volumetric haze — no objects, no text. Continuous dark reflective floor across the full width at 78%
height. Lighting: cyan rim light (#00E5FF) behind the subject, soft blue key light (#455DFF) entering
from the left. 35mm lens, f/2.8, shallow depth of field in the background, subtle film grain, HDR.
No typography, no logos, no lens flare on the left side.
Negative: text, watermark, extra robots, black robot, cartoon style, deformed antennas, cropped feet.
```

**Variante móvil:** "Vertical 9:16; subject in the lower 55% of the frame, slightly right of center; top 40% is clean navy negative space for a headline."

**Variante con lado izquierdo:** invertir el lado y la dirección de la luz principal.

### 1.4 Implementación (Astro + CSS + GSAP)

**Componente** (`src/components/SceneHero.astro`, esqueleto):

```astro
---
import { getImage } from 'astro:assets';
const { desktop, mobile, side = 'right', alt, subject } = Astro.props;
const d = await getImage({ src: desktop, format: 'avif', widths: [1280, 1920, 2560] });
const m = await getImage({ src: mobile, format: 'avif', widths: [720, 1080] });
---
<section class="scene" data-side={side}>
  <picture class="scene__media">
    <source media="(max-width: 767px)" srcset={m.srcSet.attribute} type="image/avif" />
    <img src={d.src} srcset={d.srcSet.attribute} sizes="100vw" alt={alt}
         width="2560" height="1097" fetchpriority="high" loading="eager" decoding="async" />
  </picture>
  {subject && <img class="scene__subject" src={subject} alt="" aria-hidden="true" />}
  <div class="scene__fx" aria-hidden="true"></div>
  <div class="scene__content"><slot /></div>   <!-- kicker, h1, lede, CTAs: todo en HTML (SEO) -->
  <div class="scene__chips"><slot name="chips" /></div>
</section>
```

**CSS base:**

```css
.scene{position:relative;isolation:isolate;min-height:max(100svh,720px);display:grid;
  grid-template-columns:repeat(12,minmax(0,1fr));align-items:center;
  padding-inline:clamp(20px,5vw,96px);background:#03040B;overflow:clip}
.scene__media,.scene__media img{position:absolute;inset:0;width:100%;height:100%}
.scene__media{z-index:-3}
.scene__media img{object-fit:cover;object-position:var(--focus-x,68%) 50%}
.scene__fx{position:absolute;inset:0;z-index:-1;pointer-events:none;background:
  linear-gradient(90deg,rgb(3 4 11/.92) 0%,rgb(3 4 11/.70) 28%,rgb(3 4 11/.15) 52%,transparent 64%), /* scrim solo del lado del texto */
  linear-gradient(180deg,transparent 62%,rgb(3 4 11/.85) 88%,#03040B 100%),                       /* disolución inferior */
  radial-gradient(40% 50% at 22% 45%,rgb(0 229 255/.10),transparent 70%)}                          /* luz compartida detrás del H1 */
.scene[data-side="left"] .scene__fx{transform:scaleX(-1)}
.scene__content{grid-column:1 / span 6;max-width:38rem}
.scene[data-side="left"] .scene__content{grid-column:7 / span 6}
.scene + section{margin-top:-8vh;position:relative}            /* solape: sin costura entre secciones */
body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:90;
  background:url(/fx/noise.webp);opacity:.05;mix-blend-mode:overlay} /* UN solo grano para imagen y UI */
@media (max-width:767px){
  .scene{align-items:start;padding-top:96px}
  .scene__content{grid-column:1 / -1}
  .scene__fx,.scene[data-side="left"] .scene__fx{transform:none;background:
    linear-gradient(180deg,rgb(3 4 11/.92) 0%,rgb(3 4 11/.55) 38%,transparent 55%,rgb(3 4 11/.9) 92%,#03040B 100%)}
}
```

**Motion (GSAP 3.13 + SplitText, con respeto a reduced motion):**

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(ScrollTrigger, SplitText);

gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  document.querySelectorAll('.scene').forEach((scene) => {
    const img = scene.querySelector('.scene__media img');
    const subject = scene.querySelector('.scene__subject');
    const content = scene.querySelector('.scene__content');
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(img, { scale: 1.08, opacity: 0, duration: 1.6 });
    if (subject) tl.from(subject, { yPercent: 6, opacity: 0, filter: 'blur(8px)', duration: 1.2 }, '<0.2');
    SplitText.create(scene.querySelector('h1'), { type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (s) => gsap.from(s.lines, { yPercent: 110, duration: 1, stagger: 0.08, ease: 'expo.out', delay: 0.35 }) });
    tl.from(scene.querySelectorAll('.kicker, .lede, .cta'), { y: 16, opacity: 0, stagger: 0.06, duration: 0.8 }, 0.7)
      .from(scene.querySelectorAll('.chip'), { y: 24, opacity: 0, scale: 0.96, stagger: 0.12, duration: 0.9 }, 1.0);
    // Parallax diferencial: una sola escena con profundidad, no dos bloques.
    gsap.timeline({ scrollTrigger: { trigger: scene, start: 'top top', end: 'bottom top', scrub: true } })
      .to(img, { yPercent: 8, ease: 'none' }, 0)
      .to(subject, { yPercent: -4, ease: 'none' }, 0)
      .to(content, { yPercent: -18, opacity: 0.2, ease: 'none' }, 0);
  });
});
```

**Presupuesto de rendimiento:**
- Imagen del hero en AVIF: ≤ 220 KB en desktop y ≤ 120 KB en móvil, con `fetchpriority="high"` y precargada.
- El H1 y los CTA siempre en el HTML inicial (SSG).
- Sin WebGL en el hero.
- Un video solo como loop corto opcional (≤ 2.5 MB, `muted playsinline`, con poster). En móvil, solo la imagen.

### 1.5 Diez reglas para que no haya costura

1. **No poner una caja detrás del texto.** El cristal se reserva para chips pequeños (≤ 320 px).
2. **Scrim direccional con 3 paradas**, nunca un overlay plano sobre toda la imagen.
3. **Disolución inferior del 18–25%** hacia el color exacto del siguiente bloque. La siguiente sección sube −8vh y se solapa.
4. **Un solo grano global** encima de la imagen y de la UI.
5. **Luz compartida:** un halo radial cian detrás del H1 que coincide con la luz de contorno de la imagen.
6. **Alineación con la escena:** el H1 a la altura de los ojos de Kain y la base de los CTA alineada con el piso de la imagen.
7. **Parallax diferencial:** el fondo se mueve lento, el sujeto a velocidad media y el texto más rápido. Se percibe como una sola escena con profundidad.
8. **Chips anclados:** una línea fina cian o un "puntero" conecta el chip con el teléfono o con Kain.
9. **Color grade de todas las imágenes con el mismo LUT** navy/cian, para que la paleta sea idéntica a la de la UI.
10. **En móvil, imagen 9:16 dedicada:** el texto arriba, Kain abajo y el CTA al final. Nunca una tarjeta encima de Kain.

### 1.6 Variantes del patrón y lista de escenas a generar

| ID | Página / sección | Escena | Lado de Kain | Chip de prueba (solo cifras confirmadas) |
|---|---|---|---|---|
| H-01 | Home hero | "Centro de mando" nocturno con piso reflectante y siluetas sutiles de chat y pipeline al fondo | Derecha | Burbuja de WhatsApp "Listo, te agendé mañana 10:00" + "Tiempo de respuesta: 8 min → 12 s" |
| H-02 | Home: problema (ámbar) | Recepción a las 11:48 pm, teléfono con notificaciones ámbar y silla vacía. Kain apagado | Izquierda | Sin chip. Al hacer scroll, cross-fade a la versión con Kain encendido en cian |
| H-03 | Home: CTA final | Kain mirando a cámara junto a un calendario holográfico de 30 min | Izquierda | "30 minutos · 1:1 · Google Meet · sin costo" |
| S-01 | Agentes IA para WhatsApp | Kain con una interfaz de chat holográfica | Derecha | "8 min → 12 s" |
| S-02 | CRM con Kommo | Kain frente a un tablero kanban holográfico | Izquierda | "+340% conversiones · retail multimarca" + sello Kommo Partner |
| S-03 | CRM con GoHighLevel | Kain con un embudo y automatizaciones | Derecha | — |
| S-04 | Automatización n8n / Make | Kain conectando nodos luminosos con cables cian | Izquierda | "27 procesos automatizados · logística" |
| S-05 | Paid media | Kain frente a pantallas de anuncios y curvas | Derecha | "ROAS 4.8x sostenido · HoReCa" / "−58% costo por lead en 60 días · e-commerce CDMX" |
| S-06…S-10 | Web, SEO e IA, branding, software, consultoría | Wireframes flotantes, respuestas de un motor de IA, set de estudio, módulos isométricos (reusar los renders existentes), mesa de estrategia | Alternar | Según el caso |
| I-01…I-06 | Industrias | Recepción de clínica dental · estética · consultorio de nutrición · oficina de crédito · sala de ventas con maqueta · nave industrial | Alternar | Salud: "12 → 47 citas/mes promedio" |
| N-01 | Nosotros | Foto real del equipo (`team-hero`) con Kain compuesto **en la misma luz** | Grupo a la derecha | "+73 sistemas en producción · 7 países" |
| M-01 | Metodología | Pasarela con 5 nodos luminosos V·K·T·O·R y Kain caminando | Derecha | — |
| K-01 | kain | Kain al centro, estilo foto de producto (como 1X), sobre estudio navy | Centro | Texto a la izquierda y CTA a la derecha, flanqueando al sujeto |
| D-01 | Discovery | Kain con una laptop y una videollamada holográfica | Izquierda | "Agenda tu Discovery Session" |

---

## 2. Fichas de referencia (14) + menciones

> Para cada sitio: por qué se percibe premium, arquitectura de información (IA), hero, patrones de sección, motion y qué tomar para Ingeniak.

### 2.1 Sierra — https://sierra.ai · agentes de IA para experiencia de cliente
- **Por qué es premium:** video humano real, cálido y a sangre. El producto se muestra en tarjetas de UI limpias y el mensaje es mínimo ("Better outcomes. Built on Sierra.").
- **IA:**
  - Barra de anuncio arriba.
  - Menú: Product · Industries · Customers · Company, con "Sign in" y un solo CTA, "Learn more".
  - Product: overview + 8 páginas (Ghostwriter, Agent Studio, Horizon, Context Engine, Insights, Explorer, Channels, Trust and reliability).
  - Industries: overview + 9 (finanzas, salud, telecom, medios, viajes, retail, tecnología, servicios, sector público).
  - Company: About, Blog, Resources, Careers, Trust Center, Summit, Partners.
  - Selector de idioma con español.
- **Hero:** video a sangre, H1 abajo a la izquierda y un **chip de cristal con avatar y transcripción del agente** a la derecha. En móvil el H1 sube y la imagen se recorta sobre el sujeto ([m-sierra.png](benchmark-shots/m-sierra.png)).
- **Secciones del home:**
  - muro de ~30 logos, cada uno enlazado a su historia;
  - 4 propuestas de valor con animaciones en loop (mensajes de marcas ficticias, widgets, canales, calificaciones);
  - citas de directivos con logo;
  - "Meet Sierra" con capturas del producto;
  - carruseles de capacidades;
  - "Trust and reliability" con 9 sellos (SOC 2, ISO 27001, ISO 42001, HIPAA, GDPR, EU AI Act, STAR, FedRAMP, PCI DSS);
  - CTA final.
- **Página de industria (salud):**
  - hero en video;
  - logos del sector;
  - **pestañas por subsegmento** (Payers, Providers, RCM, Pharmacy, Medical devices), cada una con tarjetas de casos de uso;
  - 5 resultados con fotografía;
  - una cita;
  - **"Healthcare agents in real-world scenarios — Listen…"**: 4 demos de audio o video;
  - sellos y recursos del sector;
  - CTA.
- **Caso:** formato webinar o video + "More customer stories".
- **Tomar:** el chip conversacional sobre el hero; los escenarios "escucha o lee al agente" en las páginas de industria; logos que enlazan a casos; el bloque de confianza.

### 2.2 11x — https://www.11x.ai · agentes de revenue
- **Por qué es premium:** una metáfora de dirección de arte sostenida en todo el sitio (espacio y Marte en el hero, fondo de Saturno a mitad de página, CTA final "T-MINUS 30-MINUTES · Ready for launch?"). Combina mono y sans con acentos naranja.
- **IA:**
  - Barra de anuncio.
  - **Use Cases ▾:** Inbound, Outbound, Expansion + "See more plays".
  - **Platform ▾:** 6 grupos (Data & Lead Gen, Outreach & Workflows, Analytics & Deliverability, Research & Messaging, Inbound Handling, Integrations).
  - **Solutions ▾:** por función (Marketing, Sales, Growth, RevOps, Enterprise).
  - Customers · Company ▾ · Blog · CTA "Book a Demo".
  - Páginas por agente ("worker": Alice, Julian) y **comparativas SEO** (11x vs Artisan, 11x vs Outreach).
- **Hero:**
  - H1 con **palabra rotativa entre corchetes** `[ Voice / Chat / Email / Social / SMS ] agents that drive revenue`;
  - escena de 5 capas;
  - coordenadas HUD X/Y;
  - dos CTA (Get a demo / Try Voice AI).
- **Secciones:**
  - grilla de logos numerada 01–17 con la etiqueta **"HOVER FOR preview / CLICK FOR case study"**;
  - pestañas por canal (Voice, Email, Chat, Social, SMS & WhatsApp, Human Dialer) con una **demo de voz en vivo** (escenario, tono de voz y formulario);
  - 3 "motions" con viñetas `[ • ]`;
  - "One shared brain" (Context, Intelligence, Omnichannel);
  - carrusel de resultados `01 / 08` con cifra grande ("<20MIN speed-to-lead · 99% reduction");
  - "11x by function";
  - integraciones, partners y confianza;
  - CTA temático.
- **Caso de estudio** (/case-study/canibuild):
  - cita con foto;
  - "About" + **Quick Jump** (Challenge · Solution · Results) + ficha (Industry, Region, Company size);
  - Reto con subtítulos en negritas y pull-quotes;
  - Solución;
  - **banda de 3 resultados** (40% lift en conversión a demo, 99% de reducción del speed-to-lead, 20% del pipeline);
  - una cifra destacada.
- **GEO:** el footer tiene un bloque **"AI Summary"** con enlaces que abren ChatGPT, Perplexity, Claude, Grok y Google AI Mode con un prompt que resume la empresa.
- **Tomar:** escena por capas, corchetes rotativos, HUD en mono, pestañas por canal con demo, la plantilla de caso, "AI Summary" y el CTA temático.

### 2.3 Figure + 1X — https://www.figure.ai · https://www.1x.tech · robótica: el sujeto como protagonista
- **Por qué es premium:** una sola imagen enorme, tipografía mínima en mayúsculas y cero ruido.
- **IA:**
  - Figure: FIGURE 03 · HELIX · INDEX · NEWS · CAREERS · COMPANY.
  - 1X: NEO · AI · FACTORY · STORIES · CAREERS · ABOUT · ORDER.
- **Hero:**
  - Figure: video macro a sangre; H1 abajo a la izquierda y "Full Video" abajo a la derecha.
  - 1X: el producto al centro; el texto a la izquierda y el precio con CTA a la derecha; **la base se disuelve en el fondo de la página.**
- **Tomar:**
  - "Ver video completo" como CTA secundario hacia el VSL de Discovery.
  - El layout "texto que flanquea al sujeto" para la página de kain.
  - La disolución inferior como norma en todos los heroes.

### 2.4 Runway — https://runwayml.com
- **IA:**
  - Barra de anuncio.
  - Mega menús **por audiencia**: Creative ▾ · Dev ▾ · Robotics ▾ · Research ▾ · Resources ▾ · Enterprise ▾ · Pricing.
  - Botones: Enterprise Sales · Login · Try Runway.
- **Hero:** video en una **tarjeta inset con radio** y texto abajo a la izquierda sobre la zona oscura. Debajo, una fila de logos.
- **Tomar:** el hero en "tarjeta cinematográfica inset" como variante para páginas internas (respira más que el full-bleed y sigue siendo una sola pieza). Menús organizados por audiencia o necesidad.

### 2.5 Harvey — https://www.harvey.ai · IA legal
- **Por qué es premium:** serif editorial, mucho aire y **texturas pictóricas** detrás de la UI real del producto.
- **IA:**
  - Barra de anuncio.
  - **Platform ▾:** 10 productos con una línea de descriptor cada uno + **tarjeta destacada** ("Legal Work Orchestration · New").
  - **Solutions ▾:** 3 grupos (por tipo de cliente / por industria / por área de práctica) + tarjeta destacada.
  - Customers · **Security** como item de primer nivel.
  - **Resources ▾:** Blog, Resources Hub, Press Kit, Research, **2 calculadoras de ROI**, Academy.
  - Company ▾ · Login con selector de región · Request a Demo.
- **Hero:** H1 serif a la izquierda y la sub con el CTA a la derecha. Debajo, la UI del producto sobre un fondo texturizado.
- **Secciones:**
  - "3,500+ Legal Organizations": muro de logos con estado logo/foto;
  - **2 tarjetas por audiencia** (Law Firms / In-House);
  - lanzamiento con video;
  - pestañas de producto;
  - testimonios con retrato;
  - video-testimonios;
  - **banda de métricas** (25+ horas ahorradas al mes, 200,000+ profesionales, 3,500+ organizaciones, 85+ países, 80+ AmLaw 100);
  - seguridad con 7 certificaciones, cada una con un enlace "Details→".
- **Tomar:** mega menú con tarjeta destacada, tarjetas por audiencia, calculadora en Recursos, la seguridad o el manejo de datos como página propia, una banda de métricas sobria.

### 2.6 Decagon — https://decagon.ai · agentes de IA para CX
- **IA:**
  - **Product ▾:** Overview; Channels (Voice, Chat, Email); Duet; Build (AOPs, Integrations); Optimize (Experiments, Testing & QA); Scale (Insights, Watchtower, Suggestions) + tarjeta destacada con imagen.
  - **Industries ▾:** 7, cada una con una **micro-promesa** ("Trust in every interaction", "Simpler access to care").
  - Customers.
  - **Resources ▾:** Blog, University, Videos, **Glossary**, Guides + destacado.
  - Company ▾ · Sign in · Get a demo.
- **Hero:** H1, sub e **input de email con botón** para captura directa, más **burbujas flotantes con acciones del agente** ("I've applied your membership perks.", "Extending your rental for the weekend.").
- **Secciones:**
  - marquee de logos;
  - **historias con cita + cifra grande + "Read story"** (70% de resolución, 80% de deflexión, 95% de reducción de costos, $1M en revenue);
  - "The Decagon difference";
  - Build / Optimize / Scale;
  - acordeón por canal con imagen;
  - grid de ROI por logo;
  - resource hub;
  - CTA.
- **Tomar:** la micro-promesa por industria en el menú, las burbujas de acción del agente, las tarjetas de cita + cifra y el glosario (AEO).

### 2.7 ElevenLabs — https://elevenlabs.io
- **IA:**
  - Banner del modelo nuevo.
  - Products ▾ · Solutions ▾ · Customers · Resources ▾ · Enterprise · Pricing · Log in · Sign up · Contact sales.
  - Footer profundo: Creative (13), Agents (12, con industrias), API (9), Resources, Company.
- **Hero:** H1 corto ("Bringing technology to life") + selector de plataforma (Creative / Agents / API) y chips de casos de uso que reproducen voces.
- **Secciones:**
  - logos;
  - "Two platforms";
  - **demo de TTS** con selector de idioma y de voz;
  - música, SFX, voces y video;
  - agente omnicanal con un chat de reembolso animado;
  - analytics con mini-gráfica ("Resolution Rate 83.4%");
  - testing, guardrails y workflows;
  - API con snippets de código;
  - **timeline de investigación** (modelos por fecha);
  - seguridad;
  - actualizaciones;
  - **widget flotante "Voice chat"**.
- **Tomar:** algo que se pueda probar antes del primer scroll, una "bitácora" en timeline y el widget flotante para hablar con el agente (→ "Escríbele a Kain").

### 2.8 Linear — https://linear.app
- **Por qué es premium:** contención total. Dark #08090A, **UI del producto renderizada en HTML** (nítida y animable), etiquetas "Fig 0.1 / 0.2 / 0.3" y tipografía grande con tracking negativo.
- **IA:** menú corto (Product · Resources · Customers · Pricing · Now · Contact) + Log in / Sign up.
- **Hero:** H1 enorme a la izquierda, sub y "New: Loops →" a la derecha, con la UI completa debajo.
- **Secciones:**
  - 3 principios con figuras numeradas;
  - "Intake and integrations": kanban vivo y una conversación de Slack que se convierte en issue;
  - "Planning": timeline;
  - "AI and automations": chat con el agente y un estado "Thinking…";
  - "Build, review, ship": diff de código;
  - cada sección con una lista de features que se expanden con "+";
  - Changelog (4 entradas);
  - citas;
  - "40,000 product teams";
  - CTA.
- **Tomar:** mockups vivos en HTML/SVG (pipeline de Kommo, flujo de n8n, chat de WhatsApp, dashboard) en lugar de capturas; la numeración "Fig."; una bitácora de sistemas entregados, **solo con datos reales**.

### 2.9 Vercel — https://vercel.com
- **IA:**
  - **Products ▾:** Agent Stack / Core Platform / Tools.
  - **Resources ▾:** Learn / Build / Explore.
  - Enterprise · Pricing · Get a Demo · Log In · Sign Up · "Ask AI".
- **Hero:** H1 a la izquierda con CTA, un objeto 3D al centro y una lista de rutas a la derecha (Backends / Agents / Enterprise).
- **Secciones:**
  - cada bloque reúne promesa + captura + **una línea de prueba del cliente** ("Notion powers millions of agent conversations daily") + pestañas de features;
  - "Recently shipped";
  - **footer-mapa de 9 columnas** + "All systems normal" + selector de tema.
- **Tomar:** pegar una prueba a cada capacidad, un footer que funcione como mapa del sitio (enlazado interno para SEO) y una línea de estado ("+73 sistemas en producción").

### 2.10 Distyl — https://distyl.ai · consultora de IA enterprise (el modelo más parecido a Ingeniak)
- **IA:** **Technology ▾** (8 productos propios con icono + descriptor) · Case Studies · Blog · Company ▾ (About, News, Research, Careers).
- **Hero:** serif grande ("Architecting the AI-Native Enterprise") y un párrafo que explica el modelo: equipos desplegados que se hacen dueños del resultado + productos propios.
- **Secciones:**
  - **manifiesto palabra por palabra** (el DOM separa cada palabra, lo que indica un reveal al hacer scroll; inferido);
  - "AI outcomes, proven in production" (150M+ usuarios finales, Fortune 500s, resultados en semanas);
  - medios (WEF, The Information);
  - blog "Thinking from the frontier";
  - newsletter;
  - sello SOC.
- **Tomar:** el manifiesto "sin humo" con reveal palabra por palabra; su posicionamiento ("forward-deployed" ≈ "Operamos junto con tu equipo" de VKTOR); los productos propios presentados como "tecnología" (≈ kain).

### 2.11 Jelou — https://jelou.ai · Ecuador · agentes transaccionales en WhatsApp (LATAM)
- **Dato técnico:** el sitio está hecho con **Astro 5** (meta generator). Es prueba de que el stack elegido sostiene un sitio LATAM de alto nivel.
- **IA:**
  - Desarrolladores ▾ (Brain Studio).
  - **Industrias ▾:** Finanzas, Retail, Seguros, Agro, Hoteles, cada una con su micro-promesa "…sin salir del chat".
  - Precios.
  - **Soluciones ▾:** Voice Agents destacado + Search, Sign, KYC, Integraciones, Payments.
  - **Recursos ▾:** Blog, Trust Center, Docs, Careers, Status, Customer stories.
  - Idioma · Iniciar sesión · Empieza gratis.
- **Hero:** oscuro con halo, H1 centrado, 2 CTA y una **caja de prompt** ("Describe en detalle lo que quieres construir"). **Sellos de partner bajo el hero:** Meta Business Partner, Meta Tech Provider, Google Partner.
- **Secciones:**
  - tarjeta de evento (Jelou House CDMX);
  - **banda de 4 métricas** (50M+ conversaciones, $200M+ en transacciones, 300+ clientes enterprise, 99.95% de uptime);
  - marquee de logos enlazados a casos;
  - capacidades con **mock UIs interactivas** (KYC, firma, commerce, pagos, dashboard), cada una con un "Cómo funciona" en 3 pasos;
  - integraciones;
  - **"One agent, every conversation":** 4 chats simulados por caso de uso (incluye agendar cita);
  - **casos con 3 métricas cada uno** (salud, Veris: 4x reservas, −77% llamadas al call center, −35% de no-show);
  - seguridad.
- **Tomar:** el sello Kommo Partner bajo el hero, casos con 3 cifras, chats simulados por caso de uso, "Cómo funciona" en 3 pasos y el stack Astro validado.

### 2.12 Yalo — https://www.yalo.com (redirige a yalo.ai) · México · plataforma de ventas con agentes (LATAM)
- **IA:** Plataforma · Industrias ▾ (Servicios Financieros, Telco, eCommerce) · **Oris** (agente con nombre) · Partners · Compañía · Recursos · Ingresar · Contáctanos · ES/EN/PT.
- **Hero:** contenedor oscuro redondeado con una retícula de puntos; H1 con **degradado en las palabras clave**; **collage de fotos reales de tenderos y vendedores latinos** con teléfono; marquee de marcas CPG.
- **Secciones:**
  - journey de la plataforma;
  - "Recreamos con AI al mejor vendedor" (Oris) + 3 cifras (3X conversión, +40% ticket, +49% SKUs);
  - testimonios;
  - slider de grandes números;
  - **video-testimonios con pestañas por logo**;
  - badge SPARK Matrix;
  - recursos;
  - CTA.
- **Tomar:** representación de rostros latinos reales, el agente con nombre propio y las pestañas de testimonios por cliente (solo si son reales). **Evitar:** la imagen en una caja separada del texto.

### 2.13 Darwin AI — https://getdarwin.ai · Argentina · "empleados IA" (LATAM)
- **IA:**
  - **Industrias ▾:** 7 con icono (Automotriz, Educación, Inmobiliario, Retail, Salud, Seguros, Servicios).
  - **Empleados IA ▾:** Alba (Inbound), Bruno (Outbound), Eva (CX), Sofía (Post-venta), Lucas (Cobranzas), cada uno con avatar.
  - Nosotros · Partners · Pricing.
  - **Recursos ▾:** Blog, Prensa, Casos de éxito, **Calculadora de ROI**, Comunidad, Changelog, **WhatsApp Link Generator**, Centro de ayuda, Integraciones.
  - ES/EN/PT.
- **Hero:** claro, H1 tipográfico, CTA pill con flecha y sello GDPR.
- **Secciones:**
  - logos;
  - sello Meta Business Partner;
  - "Conoce a nuestros empleados IA" (tarjeta por rol con "Contrata a Alba hoy");
  - industrias;
  - pestañas Humanizado / Aprendizaje / Personalidad;
  - testimonios con cifra (90% mejora en contactos, 30%, 2X);
  - prensa (ronda de USD 4.5M);
  - FAQ.
- **Tomar:** un menú de "roles del agente" (si kain los tiene), herramientas gratis como imán SEO y una calculadora con disclaimers. **Evitar:** fotos genéricas de stock (Unsplash), que bajan la percepción premium.

### 2.14 SyncManager — https://www.sync-manager.com · agencia de IA LATAM (competidor directo por modelo)
- **IA:**
  - **Servicios ▾** (con descriptor).
  - **Casos de uso ▾:** 9 industrias o casos (Salud, Educación, SAP B1, Contabilidad, Restaurantes, Inmobiliario, E-commerce, Servicios, conciliación BCI).
  - **Plataforma ▾:** CRM IA, WhatsApp API, Asistentes; Precios "desde $120/mes".
  - Blog · Nosotros · Ingresar · Agendar Demo.
  - **Selector de país ▾** con aterrizaje regulatorio (México: SAT/CFDI; Colombia: DIAN; Perú: SUNAT; Ecuador: SRI).
  - WhatsApp.
- **Hero:** texto a la izquierda + tarjeta blanca de servicios a la derecha (dos bloques: anti-patrón).
- **Secciones:**
  - tarjetas por industria con una línea de resultado;
  - 4 servicios;
  - "¿Por qué no es solo un chatbot?";
  - implementación en 4 pasos;
  - capturas del CRM;
  - casos por país;
  - muro de 38 logos;
  - blog;
  - **"¿Qué incluye la consultoría gratuita?"**;
  - metodología propia (**Modelo EPA™ + Lienzo EPA™** descargable);
  - footer con decenas de landings SEO.
- **Tomar:** la lista "Qué incluye tu Discovery Session"; la metodología como activo descargable ("Lienzo VKTOR™"); páginas de presencia por país con su contexto local. **Evitar:** el hero en dos bloques y las landings casi duplicadas.

### 2.15 Línea base: ingeniak.mx actual — lo que hay que superar
- **Fortalezas que conviene conservar en esencia:**
  - Kain y el portal como imagen de fondo;
  - kicker en mono;
  - cifras reales;
  - tarjetas de caso con métrica;
  - VKTOR™;
  - equipo;
  - logos del stack;
  - presencia en 7 países;
  - FAQ;
  - **"Ficha técnica · datos verificables" para citación en motores de IA** (muy buena práctica GEO; mantenerla, ya corregida).
- **Brechas frente al benchmark:**
  1. el texto vive en una tarjeta de cristal grande (= dos bloques) y en móvil esa tarjeta tapa a Kain;
  2. un menú de 6 links sin mega menú, sin Industrias y sin Casos;
  3. no hay páginas por industria ni de detalle de caso;
  4. no hay demo interactiva;
  5. no hay bloque de confianza ni de manejo de datos;
  6. los contadores aparecen en "0" en el HTML inicial;
  7. el crawler recibió el contenido en inglés.

### 2.16 Menciones rápidas

| Sitio | Qué aporta | Captura |
|---|---|---|
| Anthropic — anthropic.com | H1 editorial con palabras subrayadas que son enlaces, párrafo serif a la derecha, gran tarjeta de anuncio | [anthropic.png](benchmark-shots/anthropic.png) |
| Sesame — sesame.com | Foto de movimiento desenfocada en tarjeta inset y copy mínimo: "intelligence with a point of view" | [sesame.png](benchmark-shots/sesame.png) |
| Cognition — cognition.ai | Retícula editorial con numeración 01/02 al margen y menú lateral | [cognition.png](benchmark-shots/cognition.png) |
| Poolside — poolside.ai | La demo (una terminal) es el hero | [poolside.png](benchmark-shots/poolside.png) |
| Perplexity Comet — perplexity.ai/comet | Esferas texturizadas, serif condensada, UI del producto superpuesta | [perplexity.png](benchmark-shots/perplexity.png) |
| Treble — treble.ai (CO) | Sellos Meta / HubSpot / G2 bajo el hero; video en marco de navegador | [treble.png](benchmark-shots/treble.png) |
| Edit Innovation — editinnovation.com (MX) | Competidor local: precios públicos "desde $15,000 MXN", página de precios para Guadalajara; imagen en caja | [editinnovation.png](benchmark-shots/editinnovation.png) |
| Automaxia — automaxia.com (CO/MX) | Agencia con video de stock de fondo y texto centrado; tono SEO saturado | [automaxia.png](benchmark-shots/automaxia.png) |
| Aunoa — aunoa.ai (ES) | H1 con palabra rotativa ("Convierte conversaciones en clientes / soluciones / …") y CTA secundario "Calcula tu ROI" | [aunoa.png](benchmark-shots/aunoa.png) |

---

## 3. Matriz comparativa

Leyenda: **Sí** / **Parcial** / **—** (no observado).

| Sitio | Hero imagen = sección | Chip de prueba sobre imagen | Mega menú con descriptores | Páginas de industria | Casos con cifras | Demo interactiva | Bloque de confianza | Recursos / glosario | Agente con nombre |
|---|---|---|---|---|---|---|---|---|---|
| Sierra | Sí (video) | Sí | Parcial | Sí | Parcial | Parcial (audios) | Sí | Sí | — |
| 11x | Sí (5 capas) | — | Parcial | Por función | Sí | Sí (voz en vivo) | Sí | Sí | Sí |
| Figure / 1X | Sí | — | — | — | — | — | — | — | — |
| Runway | Sí (inset) | — | Sí (audiencias) | — | — | — | — | Sí | — |
| Harvey | Parcial | — | Sí + destacado | Sí | Sí | — | Sí | Sí (+ROI) | — |
| Decagon | — | Sí (burbujas) | Sí + destacado | Sí | Sí | Parcial | Parcial | Sí (glosario) | — |
| ElevenLabs | — | — | Sí | Sí | Sí | Sí | Sí | Sí | — |
| Linear | — | — | — | — | Parcial | Parcial (UI viva) | — | Changelog | — |
| Vercel | Parcial (3D) | — | Parcial | Parcial | Sí | — | Parcial | Sí | — |
| Distyl | — | — | Sí | — | Parcial | — | Parcial | Sí | — |
| Jelou | Parcial | — | Sí | Sí | Sí | Sí | Sí | Sí | — |
| Yalo | — (caja) | — | Parcial | Sí | Sí | — | Parcial | Sí | Sí (Oris) |
| Darwin AI | — | — | Parcial | Sí | Sí | — (video) | Parcial | Sí (+ROI) | Sí |
| SyncManager | — (caja) | — | Sí | Sí | Parcial | — | — | Sí | — |
| **ingeniak.mx actual** | Parcial (tarjeta) | Parcial | — | — | Parcial | — | — | Parcial | Kain (sin rol definido) |
| **Ingeniak v2 (meta)** | **Sí** | **Sí** | **Sí + destacado** | **Sí (6)** | **Sí** | **Sí (simulador)** | **Sí** | **Sí** | **Sí (Kain)** |

---

## 4. Catálogo rankeado de patrones UI/UX (35)

Prioridad: **P0** = para el lanzamiento · **P1** = fase 2 · **P2** = después. Esfuerzo: S / M / L.

| # | Patrón | Referencias | Dónde en Ingeniak | Notas de implementación | Prio · Esf. |
|---|---|---|---|---|---|
| 1 | **Hero cinematográfico "imagen = sección"** | Runway, Sierra, Figure, 1X, 11x | Todos los heroes y todas las secciones de texto + imagen | Sección 1.4: `<picture>` a sangre, scrim direccional, disolución inferior, texto sin caja, H1 en el HTML | P0 · L |
| 2 | **Arte dirigido por breakpoint** (imagen distinta en móvil) | 11x móvil, Sierra móvil | Todos los heroes | Generar un 9:16 propio con el texto arriba y Kain abajo. `<source media>` con `getImage()`. Nunca recortar el 21:9 | P0 · M |
| 3 | **Escena 2.5D por capas con parallax** | 11x (5 WebP) | Home hero, kain, metodología | Placa de fondo + Kain recortado (PNG/WebM con alfa, ya hay clips transparentes) + partículas. ScrollTrigger con `scrub`, yPercent 8 / −4 / −18 | P0 · M |
| 4 | **Chip de prueba en cristal sobre la imagen** | Sierra, Decagon | Home (burbuja de WhatsApp + "8 min → 12 s"), servicios, industrias | ≤ 320 px; `backdrop-filter: blur(18px) saturate(140%)`, fondo rgba(10,31,76,.38), borde 1px rgba(255,255,255,.10). Flota con `gsap.to(y:-6, yoyo, sine)`. Puntero cian hacia el sujeto | P0 · S |
| 5 | **Sin costuras entre secciones** (disolución + solape) | 1X, Sierra | Todo el sitio | La siguiente sección sube `margin-top:-8vh`; un solo color de fondo; un grano global | P0 · S |
| 6 | **Mega menú con línea de resultado + tarjeta destacada** | Harvey, Decagon, Jelou, Distyl | Header global | Sección 5. Links reales en el HTML (SSG), apertura con intención de hover y por teclado | P0 · M |
| 7 | **Kain como hilo conductor** | 11x (Alice/Julian), Darwin, Yalo (Oris) | Todo el sitio: heroes, simulador, CTA final, 404, estados vacíos | Biblioteca de poses y escenas con la misma referencia; Kain siempre blanco y de cuerpo completo. "kain" en minúscula como logotipo de producto | P0 · M |
| 8 | **Banda de métricas con contexto "antes → después"** | Harvey, Jelou, 11x | Home, servicios, industrias | **El valor final siempre en el HTML** (`<span data-from="12">47</span>`); count-up solo visual. Solo cifras confirmadas, con su contexto y sector | P0 · S |
| 9 | **Tarjetas de caso: cifra grande + sector + servicio** | Decagon, Jelou, Darwin | Home, índice de casos, servicios, industrias | Cifra en Lexend 64–80 px; chips de sector y servicio; imagen de escena del sector; enlace a la página del caso | P0 · S |
| 10 | **Plantilla de caso con Quick Jump y ficha lateral** | 11x | /casos/[slug]/ | Índice sticky (Contexto · Reto · Solución · Resultados · Stack) con ScrollTrigger `toggleClass`. Ficha: sector, ciudad, servicios, ventana de resultados | P0 · M |
| 11 | **Páginas de industria con pestañas por subsegmento** | Sierra, Decagon, Darwin, SyncManager | /industrias/[sector]/ ×6 | Pestañas accesibles (`role="tablist"`), contenido en el HTML (no cargado por fetch) para SEO | P0 · L |
| 12 | **Simulador de conversación de Kain por sector** | 11x (voz), Jelou (chats), ElevenLabs | Home, servicio de WhatsApp, industrias | Guiones en JSON en el build; burbujas con "escribiendo…" y timestamps; pestañas Salud / Belleza / Inmobiliario…; mockup de iPhone en HTML/CSS; sin backend. Etiqueta "simulación" | P0 · M |
| 13 | **VKTOR™ en scroll fijado** | Linear (secciones), patrón Apple | /metodologia/ y resumen en el home | `ScrollTrigger.create({pin:true, end:'+=400%', scrub:1, snap:1/4})`; riel de progreso V-K-T-O-R; Kain avanza por la pasarela (imagen M-01) | P0 · M |
| 14 | **Bento de capacidades con micro-mockups vivos** | Linear, Jelou, Sierra | Home ("el sistema"), /servicios/ | Mockups en HTML/SVG del pipeline de Kommo, un flujo de n8n, un chat de WhatsApp y un dashboard "1 vista · 7 fuentes". Animación al entrar en viewport | P0 · M |
| 15 | **Barra de sellos y partners bajo el hero** | Jelou, Treble, Darwin | Home, CRM, Kommo | Sello Kommo Partner (ya está en `logos-software/`) + logos del stack en monocromo. **No inventar logos de clientes** | P0 · S |
| 16 | **CTA final cinematográfico y temático** | 11x ("T-MINUS 30-MINUTES") | Todas las páginas | Escena H-03 con la línea "30 minutos · 1:1 · Google Meet · sin costo". CTA azul + WhatsApp | P0 · S |
| 17 | **Botón flotante "Escríbele a Kain"** | ElevenLabs (Voice chat), SyncManager | Global, a partir del 2.º viewport | Pill con el avatar de Kain → `wa.me/523321017799` con mensaje prellenado según la página. No tapar CTAs en móvil | P0 · S |
| 18 | **Header inteligente** | Vercel, Linear | Global | Transparente sobre el hero → cristal al pasar el 80% del hero; se oculta al bajar y aparece al subir (dirección de ScrollTrigger) | P0 · S |
| 19 | **Pestañas por canal o caso de uso con autoavance** | 11x, Decagon, ElevenLabs | Servicios, home | Barra de progreso de 6 s por pestaña; pausa en hover/focus; `aria-selected` | P1 · M |
| 20 | **Titular con palabra rotativa entre corchetes** | 11x, Aunoa | Home o servicio de agentes | `[ WhatsApp / CRM / pipeline / agenda ]`; todas las palabras en el HTML (la primera visible y el resto `aria-hidden`); SplitText chars | P1 · S |
| 21 | **Etiquetas mono tipo "Fig. 0.1", HUD X·Y e índices 01–05** | Linear, 11x, Cognition | Kickers, figuras, pasos VKTOR | JetBrains Mono 11–12 px, `letter-spacing:.14em`, cian al 70%. Coordenadas que siguen el cursor con `gsap.quickTo` (solo desktop) | P1 · S |
| 22 | **Manifiesto "sin humo" palabra por palabra** | Distyl | Home (entre problema y sistema), Nosotros | SplitText `type:'words'` + ScrollTrigger con scrub: opacidad .15 → 1 palabra a palabra | P1 · S |
| 23 | **Tarjetas por audiencia** | Harvey (Law Firms / In-House), 11x (by function) | Home y servicios: "Si tienes 1 sucursal" / "Si operas varias sucursales o países" | Dos tarjetas grandes con escena propia; cada una lleva a contenido filtrado | P1 · S |
| 24 | **Grid de stack e integraciones con categorías** | Darwin, 11x, Jelou | /stack/ | Categorías (Conversación, CRM, Automatización, IA, Datos, Ads). Solo herramientas que Ingeniak usa en producción. SVG de `logos-software/` | P1 · M |
| 25 | **Bloque de confianza y manejo de datos** | Sierra, Harvey, Jelou | Home (compacto), /stack/, industrias (salud, finanzas) | Afirmaciones verificables: API oficial de WhatsApp Business, Aviso de privacidad, quién accede a los datos, supervisión humana. **Ningún sello que Ingeniak no tenga** | P1 · S |
| 26 | **Barra de anuncio superior** | Sierra, Harvey, Runway, 11x | Global (cerrable) | P. ej. "Somos Kommo Partner oficial en LATAM →" o "Nuevo caso: …". 36 px; recordar el cierre con localStorage | P1 · S |
| 27 | **Páginas comparativas SEO** | 11x (vs Artisan, vs Outreach) | /comparativas/kommo-vs-gohighlevel/, /comparativas/agente-ia-vs-chatbot/ | Veredicto en 2 líneas arriba (AEO), tabla y "cuándo elegir cada uno". Declarar que Ingeniak es Kommo Partner | P1 · M |
| 28 | **Hub de recursos con glosario y guías** | Decagon, Harvey, ElevenLabs | /recursos/, /glosario/ | Glosario con `DefinedTermSet`; guías con TL;DR de 40–60 palabras arriba; autores reales del equipo | P1 · M |
| 29 | **Calculadora de oportunidad** | Darwin, Harvey, Aunoa | /recursos/calculadora/ | Entradas: leads/mes, tiempo de respuesta, ticket. Salida como **estimación**, con supuestos visibles; sin prometer resultados | P2 · M |
| 30 | **Footer-mapa del sitio + línea de estado** | Vercel, SyncManager | Global | 5–6 columnas con todas las páginas; "+73 sistemas en producción · 7 países"; dirección, teléfono y aviso de privacidad | P1 · S |
| 31 | **"Ver video completo" en modal** | Figure | Home y /discovery/ (VSL existente) | Modal de cristal; `<video>` con poster; carga diferida al abrir | P1 · S |
| 32 | **Grid de sectores con preview de caso al hover** | 11x ("HOVER FOR preview") | Home (Industrias) | Al hover o focus, la tarjeta revela la cifra del caso del sector; en móvil se muestra fija | P2 · S |
| 33 | **Enlaces "Resume Ingeniak con ChatGPT / Claude / Perplexity"** (GEO) | 11x (AI Summary) | Footer | URLs con un prompt que cita ingeniak.mx como fuente. Complementa `llms.txt` y la ficha técnica | P2 · S |
| 34 | **Herramienta gratuita como imán SEO** | Darwin y SyncManager (generador de links de WhatsApp) | /recursos/generador-link-whatsapp/ | 100% cliente (sin backend); CTA hacia el agente IA de WhatsApp | P2 · S |
| 35 | **Spotlight de cursor en tarjetas de cristal** | Linear, Vercel | Bento, tarjetas de caso | Radial-gradient que sigue al puntero con variables CSS `--mx/--my`; desactivado en touch y en reduced motion | P2 · S |

---

## 5. Navegación y mega menú recomendados

### 5.1 Principios extraídos del benchmark
- **Máximo 6 items** en el primer nivel y **2 CTA** visibles (Harvey, Decagon, Vercel).
- Cada opción del panel lleva **icono + nombre + una línea de resultado** (Decagon: "Simpler access to care"; Jelou: "…sin salir del chat").
- Una **tarjeta destacada** con imagen por panel (Harvey, Decagon): aquí va Kain o un caso con cifra.
- Todos los links son `<a>` reales en el HTML estático (SEO), aunque el panel se muestre con JS.

### 5.2 Estructura (desktop)

```
[ingeniak]   Servicios ▾   Industrias ▾   Casos   Metodología   Recursos ▾   Nosotros ▾      (Escríbele a Kain)  [Agenda tu Discovery Session]
                                                                                                ghost + WhatsApp      azul #0055FF
```

**Panel Servicios ▾** (4 columnas + destacado):

| Atiende y vende 24/7 | Ordena tu operación comercial | Atrae demanda calificada | Estrategia |
|---|---|---|---|
| **Agentes de IA para WhatsApp**: responde en segundos, califica y agenda | **CRM con Kommo** · Partner oficial: pipeline y seguimiento sin Excel | **Paid media**: Meta, Google y TikTok con atribución | **Consultoría de IA para empresas**: qué automatizar primero y por qué |
| **Plataforma kain**: tus agentes en app.kain.mx | **CRM con GoHighLevel**: embudos, agenda y automatización en una cuenta | **Sitios web de alta conversión** | **Discovery Session**: 30 min, 1:1, sin costo |
| | **Automatización con n8n y Make**: conecta CRM, WhatsApp, ERP y hojas | **SEO y visibilidad en motores de IA** | |
| | **Software a la medida**: cuando ninguna herramienta encaja | **Branding y contenido** | |

- **Destacado:** render de Kain + "3.2x más citas en 90 días · Clínica dental, Monterrey" → Ver caso.
- **Pie del panel:** "Planes desde USD 997 al mes · Todos los servicios →". Es la única mención de precio.

**Panel Industrias ▾** (2 columnas + destacado):
- Salud · Belleza · Nutrición · Finanzas · Inmobiliario · Industrial, cada una con una línea de valor sin cifras inventadas (p. ej. Salud: "Agenda, confirma y da seguimiento a pacientes por WhatsApp").
- Línea "También trabajamos con e-commerce, retail, HoReCa y logística → Ver casos".
- **Destacado:** "12 → 47 citas al mes en promedio · clientes de salud".

**Casos:** link directo a `/casos/` (índice con filtros por sector y servicio).

**Metodología:** link directo a `/metodologia/`. En la página, el H1 usa "VKTOR™".

**Panel Recursos ▾:** Blog · Guías · Glosario de IA · Comparativas · Preguntas frecuentes. Destacado: el último artículo.

**Panel Nosotros ▾:** Equipo · Stack e integraciones · Kommo Partner · Presencia en 7 países · Contacto. Destacado: foto del equipo con Kain y "Guadalajara, Jalisco · Av. Punto Sur 312, Tlajomulco de Zúñiga".

### 5.3 Comportamiento e interacción
- **Header:**
  - 72 px en desktop y 60 px en móvil, transparente sobre el hero.
  - Al pasar el 80% del hero cambia a `background: rgb(3 4 11 / .72); backdrop-filter: blur(16px) saturate(140%)` con una línea inferior `rgb(0 229 255 / .12)`.
  - Se oculta al bajar más de 120 px y reaparece al subir.
- **Apertura del panel:**
  - Por hover con intención: 80–120 ms de delay al abrir y 200 ms de gracia al cerrar.
  - Por click y Enter; Esc cierra.
  - `aria-expanded` y `aria-controls`; foco visible; el panel es una región con listas de `<a>`.
- **Panel de cristal:**
  - `rgb(10 31 76 / .55)` + blur de 24 px + borde 1px `rgb(255 255 255 / .08)` + filo cian superior.
  - Entrada en 220 ms (opacity y y: −8 → 0) con stagger de 20 ms por item.
  - Un **pill indicador** se desliza entre los items del primer nivel (GSAP Flip, gratuito en 3.13).
- **Móvil:**
  - Hoja a pantalla completa con acordeones (Servicios, Industrias, Recursos, Nosotros) y links directos.
  - **Barra fija inferior** con "Agenda tu Discovery Session" y WhatsApp, que aparece después del hero.
- **Migas de pan** en las páginas internas, con `BreadcrumbList`.
- **Footer:**
  - Mapa completo: Servicios, Industrias, Casos, Recursos, Empresa y Contacto (dirección, teléfono y WhatsApp).
  - Aviso de privacidad.
  - Sello Kommo Partner.
  - "+73 sistemas en producción · 7 países".
  - Redes con URLs reales de los perfiles.

### 5.4 Mapa de URLs (conserva el posicionamiento del sitio actual)

El sitio en vivo usa `/servicios/...`, `/metodologia`, `/nosotros`, `/blog`, `/contacto`, `/cotiza` y `/aviso-privacidad`. Conviene **mantener esas rutas** y crear 301 solo donde haga falta.

| Página | URL v2 | 301 desde |
|---|---|---|
| Hub de servicios | `/servicios/` | — |
| Agentes de IA para WhatsApp | `/servicios/agentes-ia-whatsapp/` | `/servicios/agentes-ia`, `/agentes-ia-whatsapp/` (v1, si se publicó) |
| CRM (hub Kommo + GHL) | `/servicios/crm-inteligente/` | — |
| CRM con Kommo | `/servicios/crm-kommo/` | `/kommo/` (v1) |
| CRM con GoHighLevel | `/servicios/crm-gohighlevel/` | `/gohighlevel/` (v1) |
| Automatización n8n / Make | `/servicios/automatizacion-n8n-make/` | — |
| Paid media · Sitios web · SEO · Branding | `/servicios/paid-media/`, `/servicios/paginas-web/`, `/servicios/seo/`, `/servicios/branding/` | (las mismas rutas actuales) |
| Software a la medida | `/servicios/software-a-la-medida/` | — |
| Consultoría IA | `/servicios/consultoria-ia-empresas/` | — |
| kain | `/kain/` | — |
| Industrias | `/industrias/` + `/industrias/{salud,belleza,nutricion,finanzas,inmobiliario,industrial}/` | — |
| Casos | `/casos/` + `/casos/{slug}/` | — |
| Metodología VKTOR™ | `/metodologia/` | — |
| Nosotros y equipo | `/nosotros/` | — |
| Stack e integraciones | `/stack/` | — |
| Recursos, blog, glosario, comparativas | `/recursos/`, `/blog/{slug}/`, `/glosario/`, `/comparativas/{slug}/` | — |
| Landing local | `/agentes-ia-guadalajara/` | — |
| Discovery | `/discovery/` → agenda.ingeniak.tech/discovery/agendar | `/cotiza` (ya no hay tablas de precios) |
| Contacto · Aviso de privacidad | `/contacto/`, `/aviso-privacidad/` | — |

---

## 6. Plantillas de página que necesita una agencia de IA

> Todas usan el componente `SceneHero` (sección 1) y las secciones intermedias de texto + imagen con la variante "split-scene" de 80–100vh, con la misma regla y el lado alternado. El SEO va en el HTML inicial; el JSON-LD se indica por plantilla.

### T1 · Home
1. **Hero H-01:**
   - kicker mono "AGENTES DE IA · CRM · AUTOMATIZACIÓN";
   - H1 de resultado;
   - lede;
   - CTA "Agenda tu Discovery Session" + "Escríbele a Kain";
   - chips: burbuja de WhatsApp y "8 min → 12 s".
2. Sellos: Kommo Partner + stack.
3. **Problema (ámbar, H-02):** "Tus leads escriben a las 11 pm; tu equipo responde a las 9 am." (ejemplo de copy). Cross-fade a Kain encendido.
4. Manifiesto "sin humo" palabra por palabra.
5. **El sistema (bento):** Atiende (agente) · Organiza (CRM) · Automatiza (n8n/Make) · Atrae (paid, web, SEO) · Mide (1 vista · 7 fuentes).
6. **Banda de métricas** (solo cifras confirmadas, con su contexto).
7. **Simulador de Kain** con pestañas por sector.
8. **VKTOR™** fijado con scroll (versión corta) → /metodologia/.
9. **Casos destacados** (3–4 tarjetas con cifra) → /casos/.
10. **Industrias** (grid de 6 con preview al hover).
11. **Equipo** (escena N-01 + 6 personas).
12. Presencia en 7 países.
13. FAQ + "Ingeniak en datos" (ficha verificable).
14. **CTA final H-03** (FAQ o microcopy: "desde USD 997 al mes").

- **JSON-LD:** `Organization`, `ProfessionalService` (con dirección y teléfono), `WebSite`, `FAQPage`.

### T2 · Servicio (p. ej. `/servicios/agentes-ia-whatsapp/`)
1. Hero S-xx con migas, H1 con la keyword y un chip con la cifra relevante.
2. "Señales de que lo necesitas" (ámbar).
3. Qué incluye (bento de entregables).
4. **Cómo funciona:** diagrama fijado WhatsApp → Kain → CRM → agenda → humano, con dibujo SVG por scroll.
5. Simulador.
6. Resultados (casos filtrados por servicio).
7. Integraciones del servicio.
8. Cómo lo implementamos (VKTOR resumido).
9. **Inversión:** "desde USD 997 al mes" + qué define el alcance. Sin tabla.
10. FAQ.
11. Servicios relacionados.
12. CTA final.

- **JSON-LD:** `Service` (provider, areaServed MX/LATAM), `FAQPage`, `BreadcrumbList`.

### T3 · Industria (p. ej. `/industrias/salud/`)
1. Hero I-01 (Kain en la escena del sector, en el lado contrario al de los servicios).
2. Dolores del sector (ámbar).
3. **Pestañas por tipo de negocio** del sector.
4. Casos de uso: agendar, confirmar, recordar, reactivar, dar seguimiento.
5. **"Mira a Kain en acción":** 3–4 conversaciones simuladas del sector.
6. Resultados del sector ("12 → 47 citas al mes en promedio · clientes de salud"; "3.2x más citas en 90 días · clínica dental, Monterrey").
7. Stack recomendado.
8. Manejo de datos del sector (consentimiento, aviso de privacidad, escalamiento a humano).
9. FAQ del sector.
10. CTA.

- **JSON-LD:** `Service` con `audience`, `FAQPage`, `BreadcrumbList`.

### T4 · Caso de estudio (`/casos/{slug}/`)
1. Hero con la escena del sector:
   - **H1 = el resultado** ("3.2x más citas en 90 días");
   - chips de ficha: sector, ciudad, servicios y ventana de tiempo.
2. 3 cifras (solo confirmadas).
3. **Quick Jump fijo:** Contexto · Reto · Solución · Resultados · Stack.
4. Reto (ámbar).
5. Solución: diagrama del sistema + capturas reales anonimizadas de Kommo o n8n.
6. Resultados (banda) + "qué cambió en la operación".
7. Stack usado.
8. **Cita del cliente solo si es real y está autorizada**. Si no, se omite.
9. Casos relacionados.
10. CTA.

- **Nota:** el nombre del cliente va anonimizado ("Clínica dental · Monterrey") salvo autorización.
- **JSON-LD:** `Article` + `about`. Nunca `Review` ni `AggregateRating` inventados.

### T5 · Índice de casos (`/casos/`)
1. Hero corto (60vh).
2. Métricas agregadas (+73 sistemas · 7 países).
3. Filtros por sector y por servicio (chips; todo en el HTML y filtrado en el cliente).
4. Grid de tarjetas con cifra.
5. CTA.

### T6 · Metodología VKTOR™ (`/metodologia/`)
1. Hero M-01.
2. Manifiesto.
3. **5 fases fijadas con scroll**, cada una con:
   - qué hacemos;
   - qué recibes (entregables);
   - quién del equipo participa;
   - qué necesitamos de ti.

   Las fases: Verify (verificamos tu operación) · Koncept (diseñamos el concepto) · Transform (transformamos) · Operate (operamos junto con tu equipo) · Rise (hacemos crecer los resultados).
4. Lienzo VKTOR™ descargable (opcional, como SyncManager con EPA™).
5. "La Discovery Session es la fase V" → CTA.
6. FAQ.

- **JSON-LD:** `HowTo` opcional (útil para motores de IA) y `FAQPage`.

### T7 · Nosotros y equipo (`/nosotros/`)
1. Hero N-01: foto real del equipo + Kain en la misma luz.
2. Por qué existimos y cómo trabajamos ("sin humo", datos sobre adjetivos).
3. **Equipo de 6:**
   - Rik Landeros, Dir. de Estrategia Comercial;
   - Alonso Vega, Arquitecto de IA y Automatización;
   - César Ovalle, Director Creativo;
   - Richard Vela, Medios de Performance;
   - Andy Pizano, Administración y Finanzas;
   - Marcos González, Líder Comercial.

   Retratos con el mismo grade y "qué hace por ti".
4. Presencia en 7 países (México sede, EE. UU., Colombia, Argentina, España, Costa Rica, Ecuador).
5. Oficina y mapa.
6. CTA.

- **JSON-LD:** `AboutPage`, `Organization` con `employee` (`Person`).

### T8 · Stack e integraciones (`/stack/`) + bloque Kommo Partner
1. Hero con escena isométrica (reusar los renders de sistema).
2. **Diagrama "cómo se conecta todo"** con dibujo SVG por scroll (DrawSVG).
3. Grid por categoría (pestañas o filtro).
4. **Kommo Partner:** sello oficial + qué significa para el cliente.
5. Criterios de elección y comparativas.
6. Bloque de confianza y datos.
7. CTA.

- **JSON-LD:** `ItemList`.

### T9 · kain (`/kain/`)
1. Hero K-01 (estilo 1X: Kain al centro, texto a la izquierda, CTA a la derecha).
2. Qué es kain (plataforma app.kain.mx).
3. Qué hace Kain (simulador).
4. Canales e integraciones.
5. Cómo se implementa con Ingeniak.
6. CTA doble: "Agenda tu Discovery Session" + "Ir a app.kain.mx".

- **Regla:** solo se describen funciones de kain confirmadas por el cliente.

### T10 · Recursos: hub, artículo y glosario
- **Hub:**
  1. hero corto;
  2. destacados;
  3. temas;
  4. guías;
  5. comparativas;
  6. glosario A–Z.
- **Artículo:**
  1. título;
  2. autor real del equipo, fecha y tiempo de lectura;
  3. **TL;DR de 40–60 palabras arriba** (AEO);
  4. índice fijo;
  5. cuerpo;
  6. CTA contextual en línea;
  7. FAQ;
  8. relacionados.

  JSON-LD: `BlogPosting` con `author` `Person` y `FAQPage`.
- **Glosario:** término → definición de 1–2 frases → explicación → términos relacionados → CTA. JSON-LD: `DefinedTermSet` / `DefinedTerm`.

### T11 · Discovery (`/discovery/`) y Contacto (`/contacto/`)
- **Discovery:**
  1. Hero D-01.
  2. "Qué pasa en 30 minutos" (3 pasos).
  3. **"Qué incluye tu Discovery Session"** (lista, como SyncManager).
  4. Para quién sí y para quién no.
  5. VSL (ya existe `discovery-session-vsl.mp4`).
  6. Quién te atiende (fotos reales).
  7. FAQ.
  8. Botón a la agenda.
- **Contacto:**
  1. Dirección y mapa.
  2. WhatsApp, correo y horario.

  JSON-LD: `ProfessionalService` con `geo` y `openingHours`.

### T12 · Comparativa SEO (`/comparativas/kommo-vs-gohighlevel/`)
1. Hero corto.
2. **Veredicto en 2 líneas** (AEO).
3. Tabla comparativa.
4. Cuándo elegir cada uno.
5. Cómo lo implementamos.
6. Declaración de Kommo Partner.
7. FAQ.
8. CTA.

### T13 · Landing local (`/agentes-ia-guadalajara/`)
1. Hero con Kain en una escena urbana de la ZMG.
2. Oficina física (Av. Punto Sur 312, Tlajomulco de Zúñiga).
3. Casos.
4. Mapa.
5. FAQ local.
6. CTA.

- **JSON-LD:** `ProfessionalService` con `areaServed` Guadalajara / Jalisco.

---

## 7. Sistema de motion (GSAP 3.13 + Lenis 1.3.11)

**Inicialización (una sola vez):**

```js
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ lerp: 0.1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Tokens de motion:**
- Duraciones: rápida .2 s · base .6 s · lenta 1.1 s · hero 1.6 s.
- Eases: `expo.out` para entradas, `power3.out` para UI, `none` para scrub.
- Stagger: .06 en UI y .08 en líneas de titular.

**Recetas:**

| Recurso | Receta |
|---|---|
| Entrada del hero | Timeline de la sección 1.4 (placa → sujeto → líneas del H1 con máscara → CTA → chips) |
| Revelar titulares de sección | `SplitText.create(h2,{type:'lines',mask:'lines',autoSplit:true,onSplit:s=>gsap.from(s.lines,{yPercent:110,stagger:.08,scrollTrigger:{trigger:h2,start:'top 85%'}})})` |
| Parallax por capas | `scrub:true`, yPercent placa +8 / sujeto −4 / texto −18 |
| VKTOR fijado | `pin:true`, `end:'+=400%'`, `scrub:1`, `snap:1/4`, riel de progreso con `scaleX` |
| Count-up | El valor final ya está en el HTML. Al entrar: `gsap.from(obj,{val:from, snap:{val:1}, onUpdate})`. `aria-label` con el valor final |
| CTA magnético | `gsap.quickTo(btn,'x',{duration:.4,ease:'power3'})`, ±6 px, solo con puntero fino |
| Chips flotando | `gsap.to(chip,{y:-6,duration:2.4,ease:'sine.inOut',yoyo:true,repeat:-1})` |
| Diagramas | DrawSVG (gratuito desde 3.13) con trazos cian #00E5FF y scrub |
| Marquee de sellos | CSS `@keyframes` con `translateX(-50%)`; pausa en hover; `prefers-reduced-motion` lo detiene |
| Header | `ScrollTrigger.create({start:0,end:'max',onUpdate:s=>header.classList.toggle('is-hidden',s.direction===1&&s.scroll()>120)})` |

- **Reduced motion:** todo dentro de `gsap.matchMedia()` con `(prefers-reduced-motion: no-preference)`. En modo reducido quedan solo fades de .3 s y Lenis no se inicializa (scroll nativo).
- **Presupuesto:**
  - LCP < 2.5 s en móvil 4G;
  - CLS < 0.05;
  - JS de motion ≤ 60 KB gzip (GSAP core + ScrollTrigger + SplitText + Lenis);
  - sin WebGL en el hero;
  - videos con `preload="none"` fuera del viewport inicial.

---

## 8. Qué NO copiar (riesgos detectados en el benchmark)

1. **Muros de logos de clientes** (Sierra, Harvey, Decagon). Ingeniak no debe inventar ni usar logos sin permiso. Usar sellos de partner, stack y casos anonimizados con cifras confirmadas.
2. **Hero en dos bloques** (Edit Innovation, SyncManager, Yalo, ingeniak.mx actual): es exactamente lo que el cliente rechaza.
3. **Fotos de stock genéricas** (Darwin, Automaxia, Edit Innovation): todo debe ser generado con Kain y con una dirección de arte única.
4. **Overlays de cookies que tapan el hero** (vistos en las capturas de Harvey, Darwin, Yalo, Jelou, Aunoa): usar un banner pequeño abajo y solo si hay cookies no esenciales.
5. **Video o WebGL pesados en el hero** que hundan el LCP: imagen AVIF + capas; video opcional y diferido.
6. **Landings SEO casi duplicadas** (SyncManager: chatbot-whatsapp, automatizar-whatsapp, whatsapp-ai, chatgpt-whatsapp…): pocas páginas, profundas y únicas.
7. **Tablas de precios o paquetes:** según la indicación del cliente, solo "desde USD 997 al mes".
8. **Sellos de cumplimiento que no se tienen** (SOC 2, ISO, HIPAA): el bloque de confianza habla de prácticas verificables, no de certificaciones inexistentes.

---

## 9. Inconsistencias en ingeniak.mx actual a corregir en v2 (observadas el 18-oct-2026)

1. **Testimonio "María González, Commercial Director, Grupo Vertex" con foto de `randomuser.me`:** parece un placeholder. Eliminarlo salvo que sea real, autorizado y con foto real.
2. **Tablas IGNITE / SCALE / DOMINATE con montos de setup:** retirarlas. Queda solo "desde USD 997 al mes".
3. **VKTOR con dos definiciones:**
   - el framework dice Verify · Koncept · Transform · Operate · Rise;
   - la "ficha técnica" dice Verify · Know · Translate · Optimize · Reinforce.

   Unificar a la oficial.
4. **Cobertura inconsistente:**
   - la ficha técnica dice México, EE. UU., Colombia, Perú, Argentina, Chile, España;
   - la sección de presencia dice México, USA, Colombia, Argentina, España, Costa Rica, Ecuador.

   Unificar a los 7 confirmados.
5. **El equipo aún incluye a Victor Ocampo**, que ya no forma parte.
6. **Kain aparece negro u oscuro** en el hero actual; la referencia oficial es blanco brillante.
7. **Contadores en "0" en el HTML inicial** (el scrape muestra "0 Average monthly appointments", "+0%", "0%"): buscadores y motores de IA leen ceros. En v2 el valor final va en el HTML.
8. **El crawler recibió la versión en inglés** (title "AI Consulting for Companies | INGENIAK Mexico"). En v2 el HTML inicial es `es-MX`; si se mantiene inglés, va en `/en/` con `hreflang`.
9. **Datos por confirmar antes de reutilizar** de la ficha técnica: "fundada en 2022", "opera bajo la marca Radik Soluciones" y la lista de modelos (GPT-5, Claude, Gemini).
10. **La notificación "New system deployed 2h ago"** solo debe mantenerse si se conecta a un dato real.
11. **Redes del footer** apuntan a `https://instagram.com/` y `https://linkedin.com/` genéricos, no a los perfiles.
12. **Móvil (390 px):** la tarjeta del hero tapa a Kain y parece desbordar a la derecha (verificar en un dispositivo).

---

## 10. Fuentes

**Scrapes (HTML completo, 18-oct-2026):**
- https://sierra.ai · https://sierra.ai/industries/healthcare · https://sierra.ai/customers/sutter-health
- https://www.11x.ai · https://www.11x.ai/case-study/canibuild
- https://decagon.ai
- https://www.harvey.ai
- https://elevenlabs.io
- https://linear.app
- https://vercel.com
- https://distyl.ai
- https://jelou.ai
- https://www.yalo.com (→ https://www.yalo.ai)
- https://getdarwin.ai
- https://www.sync-manager.com
- https://ingeniak.mx

**Solo captura (Chrome headless):**
- https://www.figure.ai · https://www.1x.tech · https://runwayml.com · https://www.anthropic.com
- https://www.sesame.com · https://cognition.ai · https://poolside.ai · https://www.perplexity.ai/comet
- https://www.treble.ai · https://editinnovation.com/agencia-ia-mexico.html · https://automaxia.com · https://aunoa.ai

**Búsquedas:** Awwwards (SOTD y categoría Design Agencies), agencias de IA en LATAM y referencias de diseño de agencias de IA 2026.

**Capturas** en [`benchmark-shots/`](benchmark-shots/):
- Desktop: `sierra`, `11x`, `figure`, `1x`, `runway`, `harvey`, `decagon`, `linear`, `vercel`, `anthropic`, `distyl`, `cognition`, `sesame`, `poolside`, `perplexity`, `jelou`, `yalo`, `darwin`, `treble`, `aunoa`, `syncmanager`, `editinnovation`, `automaxia`, `ingeniak-actual`.
- Móvil: `m-sierra`, `m-11x`, `m-figure`, `m-ingeniak-actual`.
