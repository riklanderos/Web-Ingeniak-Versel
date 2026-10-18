# Concepto v2 · "PLANO SECUENCIA" — el turno de noche de Kain

> Ángulo: **cinematic storytelling.** El sitio se recorre como una película: cada sección importante es un plano a sangre con Kain (o una persona del sector) de un lado y el texto del otro, el scroll es la cámara, hay capítulos, luz y profundidad, y la interfaz se reduce a lo mínimo.
>
> Fecha: 18 oct 2026 · Stack fijo: Astro SSG + GSAP 3.13 (ScrollTrigger, SplitText) + Lenis 1.3.11 · Vercel · imágenes en Magnific (Nano Banana Pro con referencias de Kain).
> Insumos: `A-sitio-actual.md`, `B-referencias.md`, `C-benchmark.md`, `D-arquitectura.md` (la arquitectura de 45 páginas, los H1, las keywords y el banco de FAQ de D **no cambian**; este documento define cómo se ven, se mueven y se cuentan).
>
> Entregables junto a este archivo:
> - `concepto-cinematic-prototipo.html`: prototipo funcional de la firma animada y del "escenario registrado" (GSAP 3.13 local, imagen provisional `kain-01-hero.png`). Ábrelo con `?replay` para repetir la intro.
> - `concepto-cinematic-storyboard.jpg`: 6 cuadros de la firma, capturados en tiempo real de ese prototipo, más la portada final.
> - `concepto-cinematic-portada-1440.jpg`: la portada a 1440 × 900 al terminar la intro.

---

## 0. Resumen en 12 líneas

1. **Nombre:** *Plano secuencia*. En cine es una toma larga **sin cortes**. Llevamos el requisito del cliente ("que la imagen y el texto se sientan una sola sección") a principio de todo el sitio: **ninguna sección corta a otra, todas son la misma toma.**
2. **La idea en una frase:** ingeniak.mx se recorre como una sola toma: cada sección es un plano a sangre donde Kain o una persona del sector actúa de un lado y el texto vive en la penumbra del otro. El scroll es la cámara y va de las 11:48 p. m., cuando tu negocio pierde al cliente, al amanecer en que ya opera solo.
3. **Historia del inicio:** *el turno de noche*. 23:47 Kain listo → 23:48 un cliente escribe y nadie contesta (dolor en ámbar) → la luz cambia y Kain ocupa ese lugar (cian) → el sistema trabaja toda la noche → **06:00, amanecer = "Rise"**, la última fase de VKTOR™ y el cierre con la Discovery Session. Las 11:48 p. m. y la respuesta en 12 s salen del caso real (clínica dental, Monterrey).
4. **Firma animada "Del nodo al pecho"** (2.8 s, una vez por sesión, se salta con cualquier gesto): el nodo cuadrado del isotipo late, se dibujan el pilar y las ramas, el isotipo se colapsa en su nodo, **ese nodo es la pantalla del pecho de Kain**, y la cámara se aleja del asterisco hasta la portada real. Está prototipada y probada (§2).
5. **Gramática de planos:** 9 tipos de escena reutilizables como componentes de Astro (plano general, planos gemelos, travelling, push-in, intertítulo, montaje, locaciones, créditos, amanecer). Todo el sitio se arma con ellos (§3).
6. **Técnica clave nueva, validada:** el **escenario registrado**. La placa no usa `object-fit`: se dibuja con una caja "cover" calculada en CSS con unidades de contenedor. Así cualquier HTML (un chip, un video de chat, la etiqueta de un escalón de VKTOR) queda clavado a un punto exacto de la imagen en cualquier pantalla. Lo probé a 1024×1366, 1440×900, 1920×1080 y 2560×1080 (§7.4).
7. **Inicio:** 13 escenas en 3 actos (La noche · El sistema · El amanecer), con intensidad del 1 al 3 alternada, solo 2 secuencias fijadas (pinned) y cero bandas vacías (§4).
8. **Plantillas internas:** servicio = *cortometraje*, industria = *locación* (con "la jornada" del sector), caso = *documental* (con la "cifra visual" que convierte el número confirmado en una escena) (§5).
9. **Navegación:** encabezado mínimo de 6 entradas (las de D) y mega menú "sala de proyección" con una **pantalla de previsualización** de la escena destino. Al hacer clic, esa pantalla se convierte en la portada de la página siguiente con un **corte por coincidencia** (View Transitions entre documentos). Riel de escenas en el borde derecho y footer en forma de "créditos finales" (§6).
10. **Diseño frente a v1:** Lexend 600 en la portada (más densa y con luz), retícula "title-safe" de 12 columnas, cristal solo sobre imagen o luz, botón con el **nodo del isotipo**, tarjetas "fotograma" sin íconos y cifras gigantes con textura de escena (§7).
11. **Imágenes:** 8 escenas descritas con composición en coordenadas, anclas de registro, versión móvil propia y prompt en inglés (§8). Frente a la lista de D se suman **4 placas grandes + 5 recortes de Kain**; el resto se reutiliza.
12. **Lo que no se hace:** texto horneado en imágenes, caja de cristal detrás del bloque de texto, más de un botón azul por pantalla, más de 2 secuencias fijadas por página, cifras fuera de la lista confirmada, horas narrativas que parezcan datos, y "centrado + subtítulo gris + 2 botones sobre degradado".

---

## 1. La premisa y las reglas de rodaje

### 1.1 Por qué este ángulo gana

| Lo que pidió el cliente | Cómo lo resuelve *Plano secuencia* |
|---|---|
| "La imagen es el background, la persona o el personaje de un lado, los textos y botones del otro, y se siente una sola sección" | Es la unidad mínima del sitio (plano general). Además, **ninguna sección tiene fondo propio** y todas se solapan sobre el mismo lienzo: no solo el hero, toda la página es una toma. |
| "Disruptivo, el mejor UI/UX de una agencia de IA" | Ninguna agencia LATAM del benchmark (C §1.1) cuenta una historia con su agente. Sierra, 11x, Figure y 1X tienen la escena, pero no la narrativa. Kain, con su pecho-isotipo, es una firma que nadie más puede copiar. |
| "Mucha más estructura, multipágina" | 45 páginas (D), cada una con su "guion de planos", un riel de escenas y un mega menú con previsualización. La estructura **se ve**. |
| "Más premium, más profesional" | Luz como material, retícula de cine, metadatos tipo claqueta, cifras reales tratadas como títulos de crédito. Lo premium sale de la contención: mucha luz y poca interfaz. |
| Le gustó: cristal, secciones animadas al hacer scroll, motion graphics | El cristal vive en chips, burbujas y paneles sobre la escena. Cada escena tiene su movimiento de cámara. El motion de Remotion se conserva como respaldo y como contenido de pantallas. |

### 1.2 La historia (solo en el inicio; las internas heredan el lenguaje)

| Acto | Hora en el HUD | Qué pasa | Escenas |
|---|---|---|---|
| **I · La noche** | 23:47 → 23:48 | Kain está listo. Un cliente escribe a las 11:48 p. m. y nadie contesta. La luz es ámbar. Corte de luz: el mismo lugar, ahora con Kain en cian. | 01–03 |
| **II · El sistema** | 00:00 → 04:30 | Qué es Ingeniak, el sistema en 5 estaciones, Kain en primera persona, los servicios, las pruebas, el protocolo VKTOR™. | 04–09 |
| **III · El amanecer** | 05:00 → 06:00 | Dónde trabaja (industrias), quién lo construye (el equipo), la ficha y, al final, el horizonte que amanece: *Rise* → Discovery Session. | 10–13 |

> Las horas son **narrativas**: van en el HUD en mono, son decorativas (`aria-hidden="true"`) y nunca van solas junto a una cifra. La única hora "real" es 11:48 p. m. ligada al caso confirmado (de 8 min a 12 s), y siempre lleva su contexto.

### 1.3 Doce reglas de rodaje (aplican a las 45 páginas)

1. **Una toma, cero cortes.** Solo `body` tiene color (#03040B + grano). Las secciones son transparentes, se solapan con `--seam` y terminan en penumbra o en luz, nunca en una línea recta.
2. **Cada plano tiene un sujeto y una penumbra.** El texto vive solo en la penumbra, que **se genera en la imagen** (50–55 % del cuadro en navy limpio). El velo CSS remata, no rescata.
3. **El sujeto mira o señala hacia el texto.** Kain presenta, señala o saluda hacia el lado del titular; la persona mira hacia el titular o hacia su teléfono en ese lado.
4. **La cámara se mueve, la UI no rebota.** Se anima la placa (dolly, travelling, desenfoque, barrido de luz). El texto entra por líneas con máscara. Nada de `back`, `elastic` ni rotaciones, salvo el isotipo.
5. **Una sola luz por escena:** contraluz cian/azul desde atrás o desde abajo. El ámbar #FFB547 solo aparece en el dolor y siempre "pierde" contra el cian.
6. **Todo el texto es HTML** (H1 y H2 reales en el HTML inicial). Las imágenes no llevan letras, números, logos ni UI legible.
7. **Kain es blanco, de cuerpo completo y fiel a `kain-body-*.jpg`.** Nunca solo la cabeza ni la variante grafito.
8. **Solo cifras confirmadas**, siempre con sector, ciudad y plazo, y con la nota "Datos internos de Ingeniak, octubre de 2026".
9. **Un solo botón azul por pantalla:** *Agenda tu Discovery Session*. El secundario es *Escríbele a Kain* (contorno, WhatsApp).
10. **Máximo 2 secuencias fijadas por página,** cada una con un enlace "Saltar escena" para teclado y lectores de pantalla.
11. **El móvil tiene su propio plano** (9:16 para Kain, 4:5 para personas). El sujeto queda arriba, el texto sobre su penumbra inferior, y **ninguna tarjeta tapa al sujeto.**
12. **Interfaz mínima:** nada de botón flotante "Cotizar", toasts "en vivo", marquesinas de palabras de moda, carruseles con puntos, barra de progreso superior, íconos decorativos en tarjetas ni banner de cookies encima del hero.

---

## 2. Firma animada · "Del nodo al pecho"

### 2.1 Storyboard (validado en `concepto-cinematic-prototipo.html`)

Ver `concepto-cinematic-storyboard.jpg`. Tiempos de escritorio (en móvil todo se comprime a ×0.8):

| t | Plano | Qué se ve | Cómo se construye |
|---|---|---|---|
| 0.00–0.35 s | Negro + claqueta | Lienzo #03040B. Abajo al centro, en mono cian al 75 %: `INGENIAK · ESC 00`. En el punto donde estará el pecho de Kain late un **nodo cuadrado de 10 px** (el cuadro superior del isotipo, el mismo del breadcrumb y del botón). | `.node` con `opacity` en yoyo (3 parpadeos de 80 ms, como un LED que arranca). |
| 0.35–1.05 s | El isotipo se dibuja | Desde el nodo se trazan **el pilar y las ramas** del isotipo en línea cian de 1.6 px con brillo. | Ruta exacta de `public/favicon.svg` (longitud 772.5). Se anima `stroke-dashoffset` con una variable CSS: **no hace falta DrawSVG.** |
| 1.05–1.45 s | Colapso | El isotipo se contrae hacia su nodo (escala 1 → 0.16, opacidad 1 → 0). | `scale` + `opacity` con `power3.in`. **No hace falta MorphSVG.** |
| 1.45–1.90 s | **Corte por coincidencia** | El nodo crece y **es la pantalla cuadrada del pecho de Kain**: un marco cian de esquinas redondeadas que coincide con el bisel de la pantalla. Un iris se abre y deja ver el asterisco real de la imagen en primerísimo plano (cámara ×4). | La placa ya está pintada debajo a escala 4 con `transform-origin` en el pecho. El iris es un degradado radial que crece (`--iris` 0 → 250 px). |
| 1.90–3.10 s | Dolly out | La cámara se aleja del asterisco: aparecen el torso, la mano que presenta, el haz de luz y la plataforma. | `--cam` 4 → 1 con `expo.inOut` (1.3 s); el iris crece a 2200 px y el velo se apaga. |
| 2.70–3.50 s | Portada real | Entran el eyebrow, el H1 por líneas, el lede, los CTA, el chip anclado a la mano, el HUD y el header. | En producción, SplitText (`mask:'lines'`). En el prototipo, un `autoAlpha` escalonado. |

**Por qué funciona:** el isotipo dice "conexión" (pilar y ramas), el cuadro superior dice "punto de inteligencia" (manual 2025), y la pantalla del pecho de Kain **es** ese cuadro con un asterisco. La animación cuenta en 3 segundos que **Kain es la inteligencia de Ingeniak**, sin una sola palabra, y termina exactamente en la portada que se queda en pantalla.

### 2.2 Reglas de la firma

- **Una vez por sesión, solo en `/`**: `sessionStorage['ingeniak-coldopen']`. No corre si se llega por View Transition desde otra página, si el referrer es del mismo sitio, con `prefers-reduced-motion: reduce` ni con `navigator.connection.saveData`.
- **Se salta con cualquier intención** (`wheel`, `touchstart`, `keydown`, `pointerdown`): `tl.progress(1)`. Nunca bloquea el scroll.
- **LCP intacto:** la placa del hero es el `<img fetchpriority="high">` y **nunca tiene `opacity: 0`**. La tapa un iris aparte (otra capa), así que su primer pintado cuenta como LCP. Hay que confirmarlo en campo con `web-vitals` después del lanzamiento.
- **SEO intacto:** el H1, los CTA y todo el texto están en el HTML inicial. GSAP solo los oculta si el script carga. Si GSAP falla, la portada se ve completa y estática.
- **Estado final idéntico** al de una visita sin intro. QA: comparar capturas de `?replay` a los 5 s contra la versión con reduced motion.
- **Mini firma en páginas internas** ("Encendido", 0.9 s): sin isotipo; el nodo late en el punto de registro del sujeto (pecho de Kain o rostro de la persona) y el iris se abre desde ahí. Solo cuando no hubo corte por coincidencia (§6.3).
- **Reprise en el footer:** al llegar al final de cualquier página, el nodo late y el isotipo se dibuja una vez en cian sobre los créditos finales. La película abre y cierra con el mismo gesto.

### 2.3 Implementación (resumen; el código completo está en el prototipo)

```html
<!-- Capa óptica: es un escenario registrado SIN escala; todo queda en el pecho de Kain en cualquier pantalla -->
<div class="layer layer--optics" aria-hidden="true"><div class="stage">
  <span class="optic iris"></span>
  <span class="optic node"></span>
  <svg class="optic iso" viewBox="0 0 188.5 95.4"><path d="(ruta de public/favicon.svg)"/></svg>
  <span class="optic scr"></span>
</div></div>
```

```css
.optic{position:absolute;left:var(--cx);top:var(--cy);translate:-50% -50%}   /* --cx/--cy = pecho, en % de la placa */
.iris{width:300vmax;height:300vmax;opacity:var(--veil);
  background:radial-gradient(circle var(--iris) at 50% 50%,transparent 0 70%,var(--ink) 100%)}
.iso path{fill:none;stroke:var(--cyan);stroke-width:1.6;stroke-dasharray:772.5;stroke-dashoffset:var(--draw);
  filter:drop-shadow(0 0 6px var(--cyan)) drop-shadow(0 0 22px rgb(0 229 255/.7))}
.layer--media .stage{transform-origin:var(--cx) var(--cy);scale:var(--cam)}  /* la "cámara" */
```

```js
gsap.set(scene, { '--cam': 4, '--veil': 1, '--iris': '0px', '--draw': 772.5 });
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  .to('.node', { opacity: 1, duration: .08, repeat: 2, yoyo: true, ease: 'none' }, .1)
  .to('.iso',  { opacity: 1, duration: .1 })
  .to(scene,   { '--draw': 0, duration: .7, ease: 'power2.inOut' }, '<')
  .to('.iso',  { scale: .16, opacity: 0, duration: .35, ease: 'power3.in' }, '+=.05')
  .fromTo('.scr', { scale: .06, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'expo.out' }, '-=.08')
  .to(scene,   { '--iris': '250px', duration: .5, ease: 'power2.out' }, '<')
  .to('.scr',  { opacity: 0, duration: .35 }, '+=.1')
  .to(scene,   { '--cam': 1, duration: 1.3, ease: 'expo.inOut' }, '<')
  .to(scene,   { '--iris': '2200px', duration: 1.1, ease: 'power2.in' }, '<.1')
  .to(scene,   { '--veil': 0, duration: .5 }, '-=.45');
// + entrada de la portada (SplitText). Con Lenis: gsap.ticker.lagSmoothing(0).
```

**Dato que necesita la imagen final:** la pantalla del pecho debe quedar **de frente y nítida**, con un lado de al menos el 3 % del ancho del cuadro. Después de generar la imagen se miden `--cx/--cy` (centro del asterisco) y el tamaño de `.scr` en la hoja de registro (§7.4). En `kain-01-hero.png` son `--cx: 68.25 %` y `--cy: 46.1 %`, y la pantalla mide unos 75 px a 1440 × 900 (300 px a ×4).

---

## 3. Gramática de planos (los componentes de Astro)

Todo el sitio se construye con 9 tipos de escena. Cada uno es un componente con nombre de cine, para que diseño, copy y desarrollo hablen igual.

| Plano | Componente | Qué es | Cuándo se usa | Intensidad |
|---|---|---|---|---|
| **Plano general** | `Scene.astro` | La "escena integrada" de B-D1: placa a sangre en un escenario registrado, velo del lado del texto, disolución inferior, chips anclados y HUD. | Todas las portadas y todas las secciones de texto + imagen. | 2–3 |
| **Planos gemelos** | `TwinScene.astro` | Dos placas del **mismo encuadre** (antes en ámbar, después en cian). Un haz de luz barre de derecha a izquierda y cambia una por otra. Fijada (pin). | Dolor → solución (inicio; Kommo y agentes de WhatsApp si hay presupuesto). | 3 |
| **Travelling** | `Travelling.astro` | Panorámica ultra ancha que la cámara recorre en horizontal mientras haces scroll, con estaciones, subtítulos y Kain recortado que acompaña. | "El sistema" (inicio) y "Cómo funciona" (servicios). | 3 |
| **Push-in** | parte de `Scene` (`push`) | Dolly suave hacia un objeto de la placa (teléfono, mostrador, agenda) donde vive una UI HTML registrada (chat, video). | Demos de Kain en industrias y servicios. | 2–3 |
| **Toma compartida** | `Take.astro` | La placa de la portada se queda fija (sticky) detrás de la sección siguiente y **se desenfoca** (rack focus) cambiando a una copia ya desenfocada. | Portada + "¿Qué es…?" en servicios, industrias y casos. | 1 |
| **Intertítulo** | `Intertitle.astro` | Plano sin sujeto: texto asimétrico sobre aura de isotipo o de ondas, con palabra fantasma que sangra por el borde. | Definiciones AEO, manifiesto, ficha, manejo de datos. | 1 |
| **Montaje** | `Montage.astro` | Cifras gigantes con textura de la escena del caso dentro de las letras, en filas alternadas, con contexto en mono. | Resultados en inicio, servicios, industrias y casos. | 2 |
| **Locaciones** | `Locations.astro` | Lista de sectores sobre una placa que cambia según el sector activo. | Industrias en el inicio y en el hub. | 2 |
| **Créditos** | `Credits.astro` | Listas con tipografía de créditos de cine (rol en mono, nombre en Lexend). | Equipo, reparto técnico (stack) y footer. | 1–2 |
| **Amanecer** | `Dawn.astro` | Cierre: arco de horizonte que sube, haz de luz, Kain o persona sobre el horizonte frío, CTA. | Última escena de todas las páginas. | 3 |

Componentes de interfaz: `ColdOpen`, `SceneRail` (riel de escenas), `Hud`, `Still` (tarjeta fotograma), `ScriptList` (filas de guion), `ChatSim` (simulador de chat), `MegaMenu`, `MobileBar`.

---

## 4. Inicio · blueprint escena por escena

### 4.1 Ritmo

| ESC | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Plano | Firma | General | Créditos | Gemelos | Intertítulo | Travelling | General + push | Guion | Montaje | General | Locaciones | General + créditos | Intertítulo | Amanecer |
| Int. | 3 | 3 | 1 | **3 pin** | 1 | **3 pin** | 2 | 1 | 2 | 2 | 2 | 2 | 1 | 3 |

- **1 = respiro:** entradas de línea y fundidos, sin pin, como mucho una propiedad animada con el scroll.
- **2 = escena:** parallax por capas, luz que cambia con el scroll, quizá un push-in. Sin pin, o un pin de 60 % como máximo.
- **3 = set piece:** pin, varias capas, momento de firma.
- **Regla:** después de un 3 viene un 1 o un 2. La única excepción es 00 → 01, que son el mismo momento.
- **Recorrido fijado total:** ESC 03 (+150 %) + ESC 05 (+320 %) = 4.7 pantallas. Alto total aproximado: 17,000 px a 1440 × 900, con algo nuevo cada 600–800 px.

### 4.2 Las escenas

---

**ESC 00 · Firma "Del nodo al pecho"** · Intensidad 3
Ver §2. Desemboca en ESC 01 sin corte.

---

**ESC 01 · "El agente"** (portada) · Plano general, Kain a la derecha · HUD `23:47 · GDL · MX` · Intensidad 3

```
┌ logo   Servicios▾ Industrias▾ Casos▾ Kain Empresa▾ Recursos▾      (WA) [Agenda tu Discovery] ┐
│                                                        ESC 01 / 13 — EL AGENTE   │
│ ▪ AGENCIA DE IA · GUADALAJARA, MX                ║ haz        ◯                  │
│ Agentizamos                                    ──╫── ramas  [KAIN]               ▏│ ← riel
│ empresas.  (tono cian→índigo)                    ║        ✋ ← mano  ▣*            ▏│
│ Agentes de IA, CRM y automatización…        ┌chip WhatsApp┐   /│\               │
│ lede (muted, 44ch)                          └─────────────┘   / \               │
│ [Agenda tu Discovery Session ▪] (Escríbele a Kain)           ~reflejo~           │
│ 30 min · 1:1 · Google Meet · sin costo                                           │
│ ─ Partner oficial de Kommo en LATAM · +73 sistemas en producción · 7 países      │
│ 23:47 · GDL · MX                                                     SCROLL ↓    │
└──────────────────────── disolución a #03040B (la siguiente escena nace aquí) ───┘
```

- **Layout:** texto en las columnas 1–6 de la retícula title-safe, centro óptico al 46 % del alto. Kain ocupa el 66–76 % del ancho. Un solo chip, anclado a la **mano** de Kain y colgado 64 px debajo, con un hilo cian de 1 px hacia la yema. HUD en las esquinas "action-safe". Riel de escenas a la derecha.
- **Imagen:** `home-hero` (escena #1, §8). Kain presenta con la mano abierta hacia el titular. Detrás, un pilar de luz con **ramas que se bifurcan a la altura del pecho**: el isotipo hecho luz, que rima con la firma.
- **Copy:** H1 de D (keyword) partido en dos voces: `<h1><span class="d1">Agentizamos <span class="tone">empresas.</span></span><span class="h1sub">Agentes de IA, CRM y automatización en un solo sistema.</span></h1>`. *(Se cambian los dos puntos de D por punto; hay que actualizar el validador de H1.)* Lede: "Diseñamos e implementamos el sistema que atiende, califica y agenda por ti, 24/7, y lo operamos junto con tu equipo." Chip: `WHATSAPP · 11:48 P. M.` / "¿Tienen cita mañana temprano?" / "Ejemplo ilustrativo · caso real: de 8 min a 12 s, clínica dental, Monterrey".
- **Motion:** firma → SplitText por líneas (`expo.out`, stagger .08) → CTA → chip (aparecen tres puntos de "escribiendo…" 500 ms y luego la burbuja; el hilo se dibuja). En reposo, la placa "respira" (`--cam` 1 → 1.015, 8 s en yoyo). Al salir, parallax: placa +6 % · chip −40 % · texto −60 px con fundido. Si existe la placa limpia, el recorte de Kain va a −3 %.
- **Móvil:** placa 9:16 con Kain arriba (6–58 % del alto) y las ramas de luz bajando. H1 a 44 px, chip debajo de la mano y por encima del lede, nunca sobre el cuerpo.

---

**ESC 02 · "Reparto técnico"** · Créditos (vive dentro de la costura de ESC 01, no es una banda aparte) · Intensidad 1
- **Layout:** una línea en las columnas 1–12. Primero va `REPARTO TÉCNICO` en mono y después el **sello Kommo Partner** (versión blanca, enlazado a kommo.com, con el texto "Partner oficial"). Siguen los logos en blanco al 55 % (`currentColor`, LOGOS.md): WhatsApp Business · GoHighLevel · n8n · Make · OpenAI · Claude · Gemini · Meta · Google Ads · TikTok · Supabase · Stripe. GoHighLevel entra como herramienta, **nunca como partner.**
- **Motion:** aparecen uno por uno como créditos (opacidad y 6 px, stagger .06). **Sin marquesina.** Al pasar el puntero, cada logo sube al 100 %.
- **Móvil:** dos filas con scroll horizontal y snap, con desvanecido en los bordes.

---

**ESC 03 · "23:48"** (el problema) · Planos gemelos, **fijada +150 %** (móvil +120 %) · Intensidad 3

```
 Placa A (ámbar)                                   Placa B (cian), mismo encuadre
┌─────────────────────────────────────────────┐    ┌─────────────────────────────────────────────┐
│ [dueño en banco,      │ ESC 03 · 23:48 ◂reloj│    │ [Kain junto al        │ … 23:48 + 12 s     │
│  rostro con luz del   │ Tu negocio no necesita│ ←  │  mostrador, celular   │ ▪ Mensajes sin resp.│
│  celular, ámbar]      │ más esfuerzo…         │haz │  en cian, banco vacío]│   └ Kain responde…  │
│                       │ ▪ Mensajes sin resp.  │    │                       │ ▪ Un CRM que nadie… │
└─────────────────────────────────────────────┘    └─────────────────────────────────────────────┘
```

- **Layout:** sujeto a la izquierda y texto a la derecha (columnas 7–12). La placa B se genera **como edición de A** (escena #2): la cámara y el encuadre no cambian. Solo cambian la luz y quién está en el lugar del dueño.
- **Tramo 0–35 %:** placa A. Eyebrow ámbar `ESC 03 · 23:48 · EL PROBLEMA`. H2 de D: "Tu negocio no necesita más esfuerzo. *Necesita dejar de depender de ti.*" Los 4 dolores de D entran uno por uno, con nodo ámbar: Mensajes sin responder · Un CRM que nadie usa · Anuncios que no se traducen en ventas · Todo pasa por ti. El reloj del HUD avanza de 23:48 a 23:52: el cliente sigue esperando.
- **Tramo 35–70 %:** **el corte de luz.** Un haz vertical cian-blanco barre de derecha a izquierda y revela la placa B (`clip-path: inset(0 0 0 var(--wipe))`). A cada dolor le baja el ámbar y debajo se dibuja su salida en cian: "Kain responde en segundos, a cualquier hora." · "Cada conversación entra sola a tu CRM." · "Cada campaña se mide hasta la venta." · "El sistema opera. Tú diriges." El HUD cambia a `23:48 + 12 s`.
- **Tramo 70–100 %:** remate de D en Lexend 500: "No te falta esfuerzo. Te falta un sistema."
- **Accesibilidad:** dolores y salidas están siempre en el DOM y en orden. Hay un enlace "Saltar escena" al inicio de la sección. Con reduced motion se muestra la placa B con las dos listas completas.
- **Móvil:** gemelas 4:5 con la persona arriba. Se ven 2 dolores a la vez y el reloj va en la esquina superior.

---

**ESC 04 · Intertítulo "Medianoche"** (¿qué es Ingeniak?) · HUD `00:00` · Intensidad 1
- **Layout asimétrico:** el manifiesto empieza en la columna 3 y ocupa 9; debajo, la definición citable G01 (40–60 palabras) en las columnas 3–8; después la fila "Ingeniak en datos" en mono, en las columnas 3–12. La palabra fantasma `SISTEMA` en Lexend 600 a 18vw, navy al 30 %, sangra por el borde derecho (`aria-hidden`).
- **Copy:** manifiesto con el tagline de marca: "No hacemos marketing. *Construimos sistemas que generan y convierten clientes automáticamente.*" Datos: +73 sistemas en producción · 7 países · de 12 a 47 citas al mes en promedio (salud) · −58 % de costo por lead en 60 días (e-commerce, CDMX). Nota: "Datos internos de Ingeniak, octubre de 2026".
- **Fondo:** aura del isotipo de cristal ya desenfocado (WebP de 600 px exportado borroso, sin `filter` en vivo), que gira de 0 a 8° con el scroll.
- **Motion:** el manifiesto se revela palabra por palabra (SplitText `words`, opacidad .15 → 1 con scrub). Los datos aparecen con un contador **cuyo valor final ya está en el HTML.**
- **Lo que reemplaza:** la sección 5 de D ("¿Qué es Ingeniak?") sube aquí para que el bloque citable quede arriba (AEO).

---

**ESC 05 · "El sistema"** · Travelling, **fijada +320 %** (móvil +260 %) con snap a 5 estaciones · Intensidad 3

```
viewport ┌──────────────────────────┐
         │ SUBTÍTULO (fijo)  [Kain]  │ ← la cámara se detiene con el objeto al 68 % (móvil 50 %)
panorama ├────────┬────────┬────────┬────────┬────────┤ 9600×1800 · piso continuo con un riel de luz
         │1 Atraer│2 Atender│3 Organizar│4 Automatizar│5 Medir│
progreso ▪────────▪────────▪────────▪────────▪  (nodos cuadrados que se encienden)
```

- **Layout:** la panorámica (escena #3) se mueve detrás. Los textos de cada estación viven en una capa fija de **subtítulos**: abajo a la izquierda en escritorio (columnas 1–5) y abajo a lo ancho en móvil. Se cruzan con un fundido en cada estación. Kain, recortado, se queda fijo cerca del 52 % en escritorio y **cambia de pose** en cada estación (5 poses generadas con la misma luz). En móvil no hay Kain recortado: manda la placa.
- **Las 5 estaciones** (nombres de D; cada una enlaza a su servicio):
  1. **Atraer** · "Anuncios, web y SEO que traen demanda que se puede medir." → paid media, páginas web, SEO, branding.
  2. **Atender** · "Kain responde en segundos, 24/7, en WhatsApp, Instagram y tu web." Prueba: *de 8 min a 12 s (clínica dental, MTY)*. El video `kain-chat` corre dentro del teléfono de cristal de la panorámica, anclado a su pantalla.
  3. **Organizar** · "Cada lead en su etapa, en Kommo o GoHighLevel." Prueba: *+340 % en conversiones (retail multimarca, Kommo + IA)*.
  4. **Automatizar** · "n8n y Make mueven lo repetitivo entre tu CRM, WhatsApp y tus hojas." Prueba: *27 procesos automatizados (logística)*.
  5. **Medir** · "Todo en una vista." Prueba: *1 vista · 7 fuentes (e-commerce)*.
- **Motion:** `x` de la pista con scrub `.8` y snap a etiquetas. Los subtítulos cambian con un fundido de 0.2. Los nodos del progreso se encienden. Kain cambia de pose con un fundido cruzado de 0.25 y tiene un reflejo en el piso hecho en CSS (copia volteada, máscara, opacidad .22).
- **Respaldo:** el motion de Remotion `sistema-1920` / `sistema-movil` (D) queda como versión con reduced motion (video estático con su poster) y como plan B si la panorámica no está a tiempo.

---

**ESC 06 · "Soy Kain"** · Plano general con Kain a la izquierda y push-in hacia el teléfono · HUD `02:14 · Kain atiende` · Intensidad 2
- **Layout:** Kain de cuerpo completo a la izquierda saluda junto a un **teléfono de cristal flotante** (placa `home-kain` de D). El texto va a la derecha, en las columnas 7–12. El video `kain-chat` va anclado a la pantalla del teléfono, con radio igual al de la placa.
- **Copy (D):** "Soy Kain, el agente de IA de tu empresa. Respondo, agendo y confirmo por ti en WhatsApp, Instagram y tu web, y registro cada conversación en tu CRM." + 4 viñetas con barra luminosa (B-D11) + eslogan "Tu negocio trabajando, sin depender más de ti." + *Escríbele a Kain* + enlaces a `/kain/` y a app.kain.mx con el logotipo **kain** en minúsculas.
- **Motion:** dolly con scrub de `--cam` 1 → 1.12 con el origen en el teléfono durante el recorrido. El video arranca al 50 % de visibilidad, `muted playsinline`, y se pausa fuera de pantalla. Las viñetas se encienden en secuencia.
- **Móvil:** 9:16 con Kain y el teléfono arriba. El video del chat se ve dentro del teléfono a ≥ 180 px de ancho y el texto va debajo.

---

**ESC 07 · "Guion de servicios"** · Guion · Intensidad 1 (reemplaza la cuadrícula de 11 tarjetas)

```
ACTO I · ATRAER
01  Paid media ............................. Meta, Google y TikTok medidos por ventas      ▪→
02  Páginas web de alta conversión ......... Conectadas a tu CRM y WhatsApp               ▪→
…
ACTO II · ATENDER Y VENDER                                    ┌ fotograma 21:9 ┐ ← sigue al cursor
05  Agentes de IA para WhatsApp ............ Responden, califican y agendan 24/7          ▪→ ╱
…                                                             └────────────────┘
ACTO III · OPERAR Y ESCALAR
…
Planes desde USD 997 al mes. El alcance lo definimos en tu Discovery Session.   Ver todos los servicios →
```

- **Layout:** 11 filas en 3 actos con los grupos de D. Cada fila es un `<a>` con número mono, nombre en Lexend 500 (26–44 px), la línea de resultado de D en muted y un nodo. Sin íconos y sin tarjetas.
- **Interacción (solo `pointer: fine`):** la fila activa brilla y las demás bajan al 35 %. Un **fotograma 21:9** (el still de la portada destino, 360 px) sigue al cursor con `quickTo`, y una rama cian une el nodo de la fila con el fotograma. Al hacer clic, ese fotograma se convierte en la portada destino (§6.3).
- **Móvil:** cada fila lleva una miniatura 4:5 de 56 px a la derecha; los actos se pueden plegar.
- **Precio:** única mención en el inicio, "Planes desde USD 997 al mes", sin tabla.

---

**ESC 08 · "Montaje: sistemas reales, operando hoy"** · Montaje · Intensidad 2

| Fila | Cifra (texto real, Lexend 600, 96–256 px) | Contexto en mono | Enlace |
|---|---|---|---|
| 1 (izq.) | **3.2×** | más citas en 90 días · clínica dental · Monterrey · agente de IA en WhatsApp | `/casos/clinica-dental-monterrey/` |
| 2 (der.) | **+340%** | conversiones · retail multimarca · Kommo + IA | `/casos/retail-multimarca-kommo/` |
| 3 (izq.) | **−58%** | costo por lead en 60 días · e-commerce · CDMX | `/casos/ecommerce-cdmx-costo-por-lead/` |
| 4 (der.) | **4.8×** | ROAS sostenido · HoReCa | `/casos/horeca-roas/` |
| 5 (izq.) | **27** | procesos automatizados · logística · n8n | `/casos/logistica-n8n/` |

- **Tratamiento:** dentro de las letras se ve la placa de la portada de cada caso, aclarada con una capa blanca en `screen` para que la cifra siempre sea clara y legible (§7.5-C), con un filo cian de 1 px. Debajo, una línea de cifras transversales: *de 12 a 47 citas al mes en promedio (salud) · −60 % de tiempo operativo en los primeros 90 días · de 8 min a 12 s*. Nota de fuente y "nombres de clientes anonimizados".
- **Motion:** cada fila deriva en horizontal en sentidos alternos (±6 % con scrub) y la imagen se desplaza **dentro** de las letras (`--px` 20 % → 80 %). Sin contador en las cifras con signo (se leen mal a medio conteo).
- **Copy:** H2 de D: "Sistemas reales, *operando hoy mismo.*" + "Ver todos los casos →".

---

**ESC 09 · "El protocolo"** · Plano general con Kain arriba a la derecha y etiquetas registradas en los escalones · HUD `04:30 · VKTOR™` · Intensidad 2
- **Layout:** placa `metodologia-hero` (escena #7), que se reutiliza en `/metodologia/`. Cinco escalones de cristal suben de la esquina inferior izquierda (V) a la derecha (R), y Kain está de pie en el quinto, mirando hacia atrás, al texto. El texto va arriba a la izquierda (columnas 1–6, entre el 12 % y el 48 % del alto). Cada escalón lleva una etiqueta HTML **anclada** a su borde: `V · Verificamos tu operación` · `K · Diseñamos el concepto` · `T · Transformamos` · `O · Operamos junto con tu equipo` · `R · Hacemos crecer los resultados`.
- **Copy:** "Tu crecimiento tiene un protocolo. *Nosotros lo activamos.*" + "La Discovery Session es la fase V." + "Conoce el protocolo completo →" (`/metodologia/`).
- **Motion (scrub, sin pin):** los escalones se encienden en secuencia: un brillo elíptico en `screen` anclado a cada escalón y la letra pasa de contorno a sólido (B-D7). La luz llega a Kain al final.
- **Móvil:** 9:16 con los escalones en zigzag de abajo hacia arriba, Kain arriba, las etiquetas a la derecha de cada escalón y el titular en la franja superior.

---

**ESC 10 · "Locaciones"** (industrias) · Locaciones · HUD `05:00 · LOCACIÓN 1/8` · Intensidad 2
- **Layout de escritorio:** a la izquierda (columnas 1–5), la lista de los 8 sectores de D en Lexend 500 (24–40 px), con su línea de valor y su cifra solo donde existe (Salud 3.2× · Industrial 27 procesos · Retail +340 % · HoReCa ROAS 4.8×). Detrás, a sangre, **la placa de la portada del sector activo** (reutiliza `ind-*-hero` a 1920 px). Cuando el sujeto de una placa está a la izquierda, se voltea con `scale: -1 1`: no hay texto en las imágenes y el asterisco de Kain es simétrico.
- **Interacción:** el hover o el foco cambia la placa (fundido cruzado de 0.6 s y un push-in de 1.04 → 1). Si nadie interactúa, avanza solo cada 4 s mientras está en pantalla (se pausa con el hover), con una barra de progreso en la fila activa, como un reel.
- **Móvil:** carrusel con snap de 8 **mini planos** de 4:5 y 86vw de ancho, con la placa móvil del sector y el nombre sobre su penumbra inferior. Se pasa con el dedo y cada uno es un enlace.
- **Copy:** "Mismo sistema, *tu industria.*" + pie de D: "También trabajamos con e-commerce, retail, HoReCa y logística → Ver casos".

---

**ESC 11 · "Créditos: el equipo"** · Plano general con el equipo a la derecha y créditos · Intensidad 2
- **Layout:** foto real `team-hero` ampliada a 21:9 con outpainting **solo del lienzo** (sin tocar rostros), en duotono de marca (B-D5), con el grupo a la derecha. A la izquierda, el H2 y la lista de créditos en 2 columnas de 3:

  | Rol (mono 11 px, muted) | Nombre (Lexend 500, 22 px) |
  |---|---|
  | Director de Estrategia Comercial | Rik Landeros |
  | Arquitecto de IA y Automatización | Alonso Vega |
  | Director Creativo | César Ovalle |
  | Medios de Performance | Richard Vela |
  | Administración y Finanzas | Andy Pizano |
  | Líder Comercial | Marcos González |

- **Copy:** "Estrategas que construyen, operan y miden." + "Seis personas que diseñan, construyen y operan tu sistema contigo, con datos y sin humo." (evitar "no somos una agencia tradicional") + "Conoce al equipo →" (`/nosotros/`).
- **Motion:** la máscara radial del duotono se abre (la luz "enciende" al equipo) y los créditos aparecen uno por uno como una secuencia de títulos (stagger .12).
- **Móvil:** 4:5 con el equipo arriba y los créditos en una columna.

---

**ESC 12 · Intertítulo "Ficha técnica"** + preguntas · Intensidad 1
- **Izquierda (columnas 1–5):** `FICHA TÉCNICA · INGENIAK EN DATOS` como `<dl>` con los mismos datos que el JSON-LD y `llms.txt`: Sede Guadalajara, Jalisco · Oficina Av. Punto Sur 312, Tlajomulco de Zúñiga · Alianza: Partner oficial de Kommo en LATAM · +73 sistemas en producción · 7 países (México sede, Estados Unidos, Colombia, Argentina, España, Costa Rica, Ecuador) · Metodología VKTOR™ = Verify · Koncept · Transform · Operate · Rise · Inversión desde USD 997 al mes · Discovery Session: 30 min, 1:1, Google Meet, sin costo.
- **Derecha (columnas 7–12):** las 6 FAQ de D en acordeón (el texto es idéntico al de FAQPage).
- **Fondo:** aura de ondas sedosas (`fondo-ondas`) a baja opacidad. El cristal solo aparece en la pregunta abierta, que es la única con algo detrás.

---

**ESC 13 · "Amanecer"** (cierre) · HUD `06:00 · RISE` · Intensidad 3
- **Layout:** placa `cta-amanecer` (escena #8) con Kain a la derecha sobre un horizonte frío. Texto a la izquierda: eyebrow `ESC 13 · 06:00 · RISE`, H2 de D "30 minutos para ver tu operación *como es, no como crees que es.*", botón *Agenda tu Discovery Session*, *Escríbele a Kain* y la microcopia "Sin costo · Sin compromiso · 30 minutos por Google Meet".
- **Motion:** el **arco de horizonte** CSS (B-D2) sube 40 px y su filo pasa de 0 a 1 con scrub: es el amanecer. El velo de la placa baja de .55 a 0. Al 60 % de visibilidad el haz se abre (`scaleX` .15 → 1) y el borde del botón primario hace **un** recorrido de luz.
- **Móvil:** 9:16 invertido, la única excepción: cielo y texto arriba, Kain de cuerpo completo sobre el horizonte en el 45 % inferior, CTA por encima de él.

---

**Footer · "Créditos finales"** · Intensidad 1
- El mapa del sitio de D se maqueta como bloques de créditos (título de grupo en mono, enlaces en Inter 15 px). Debajo van la ficha de la entidad, el sello Kommo, las redes con URLs reales y la parte legal.
- Al llegar al final, el nodo late y el **isotipo se dibuja una vez** (la firma en reprise). Debajo va la línea "Construimos empresarios libres, no héroes cansados." (de v1; hay que confirmarla con el cliente).

---

## 5. Plantillas internas

> Formato: `#` · plano · contenido y copy · imagen · motion · intensidad. Los textos fijos (H1, title, keyword, mensajes de WhatsApp) salen de `D-sitemap.json`. Cada plantilla tiene **como máximo 2 secuencias fijadas**.

### 5.1 T-SERVICE · "Cortometraje" (ejemplo: `/servicios/agentes-ia-whatsapp/`)

| # | Plano | Contenido | Imagen | Motion | Int. |
|---|---|---|---|---|---|
| 01 | **Plano general** dentro de una **toma compartida** (persona a la izquierda, texto a la derecha) | Breadcrumb dentro de la columna de texto (con el nodo de 4 px como separador). H1 "Agentes de IA para WhatsApp Business". Lede de D con la prueba (de 8 min a 12 s). CTA + microcopia. **Dos burbujas ancladas a la pantalla del teléfono** de la clienta: la de ella ("11:48 p. m. · ¿Tienen lugar mañana?") y la de Kain ("Respondido en 12 s"), con la etiqueta "ejemplo ilustrativo · caso real MTY". HUD: `SERVICIO 05 / 11 · ATENDER Y VENDER`. | `agentes-whatsapp-hero` (escena #4) | Mini firma desde la pantalla del teléfono → líneas del H1 → la burbuja de ella → tres puntos de "escribiendo" 600 ms → la de Kain. Al salir, rack focus. | 3 |
| 02 | **Intertítulo sobre la toma desenfocada** | "¿Qué es un agente de IA para WhatsApp?" (G02, de 40 a 60 palabras) + cifras en fila mono: de 8 min a 12 s · 3.2× más citas en 90 días · de 12 a 47 citas al mes (salud) · +73 sistemas. | Copia desenfocada de la portada | `--rack` 0 → 1 y velo .4 → .7 con scrub. | 1 |
| 03 | **Escena en ámbar** (todavía sobre la toma) | "Señales de que lo necesitas": 3–4 dolores con nodo ámbar y su salida en cian, que se dibuja al entrar. | Fuga de luz ámbar del 12 % desde el lado de los dolores | Las salidas se dibujan con `clip-path` (como en ESC 03, pero sin pin). | 1–2 |
| 04 | **Guion** + teléfono de cristal | "Qué hace tu agente": las 6 capacidades de D en filas de guion. A la derecha, el teléfono de cristal con `kain-chat`, sobre un aura (para que el cristal tenga algo detrás). | Aura del isotipo | El video arranca al estar en pantalla y las filas se encienden en secuencia. | 1 |
| 05 | **Travelling corto** (fijado +240 %) | "Cómo funciona": WhatsApp → Kain → CRM (Kommo/GHL) → agenda → tu equipo. Estaciones en HTML con los logos reales y subtítulos de una línea. | **`riel` compartido** (una panorámica para todos los servicios, §8.3) | Igual que ESC 05 del inicio, con 5 paradas. | 3 |
| 06 | **Dos columnas de guion** | "Agente de IA, no chatbot de menús": comparación de 6 filas. La columna de Kain va en blanco y cian; la del chatbot, en muted. Sin tabla con bordes. → artículo del blog. | — | Las filas entran por pares. | 1 |
| 07 | **Plano general + push-in** (Kain a la derecha) | "Lo que sí hace y lo que no" (D): las dos listas y el eslogan. | `agentes-whatsapp-si-no` (D #13) | Dolly 1 → 1.1 hacia el celular del mostrador. | 2 |
| 08 | **Montaje** (2 filas) | De 8 min a 12 s · 3.2× (clínica dental) / +340 % (retail multimarca) → páginas de caso. | Placas de los casos | Como ESC 08. | 2 |
| 09 | **Reparto + locaciones mini** | Canales y conexiones en logos blancos (enlaces a `/kommo/`, `/gohighlevel/`, n8n) y 4 sectores en "fotogramas" pequeños. | Stills de las industrias | Aparecen como créditos. | 1 |
| 10 | **Riel VKTOR™** | Las 5 fases con una línea cada una, aplicadas a poner tu agente en producción. Una línea cian de 1 px une 5 nodos cuadrados. → `/metodologia/`. | — | La línea se dibuja con scrub y los nodos se encienden. | 1 |
| 11 | **Intertítulo "Inversión"** | Una sola línea grande: "Desde USD 997 al mes." Debajo, los 3 factores que definen el alcance (canales, integraciones, volumen). Sin tabla. | — | Entrada por líneas. | 1 |
| 12 | FAQ | 6 preguntas de D (acordeón con FAQPage idéntico). | Aura de ondas | — | 1 |
| 13 | **Sigue explorando** | 3 tarjetas fotograma (`/kain/`, `/kommo/`, el artículo de costo), con corte por coincidencia. | Stills de los destinos | Rack focus al entrar. | 1 |
| 14 | **Amanecer** | Cierre de D ("¿Qué respondería un agente de IA en tu WhatsApp?") con la variante de amanecer compartida. | `cta-amanecer` / variantes | Como ESC 13. | 3 |

**Variaciones por servicio:**
- **Consultoría, CRM, n8n, paid media, web, software, SEO y branding:** usan las portadas y las escenas intermedias de D (#9–#31). Los paneles holográficos de cada escena son la pantalla donde se ancla la UI HTML de esa página: el kanban en CRM, el lienzo de nodos en n8n, las curvas en paid media.
- **T-PLATFORM (`/kommo/`, `/gohighlevel/`):** en Kommo, el lugar del chip lo ocupa el **sello Kommo Partner** con "Partner oficial de Kommo en LATAM", enlazado a kommo.com. En GoHighLevel va un chip "En español · implementación completa" y **nunca** la palabra "partner". En las dos se agrega "¿Es para ti?" en dos columnas de guion (sí / no, con el "no" en ámbar). Kommo puede tener **planos gemelos** (vendedor saturado de chats → Kain en el chat) si hay presupuesto para la placa extra.

### 5.2 T-INDUSTRY · "Locación" (ejemplo: `/industrias/salud/`)

| # | Plano | Contenido | Imagen | Motion | Int. |
|---|---|---|---|---|---|
| 01 | **Plano general** en toma compartida (persona a la derecha) | Breadcrumb, H1 "Agentes de IA para clínicas y consultorios", lede de D ("Tu agenda llena sin que tu recepción viva pegada al WhatsApp."), CTA. Chip anclado a la tableta de la doctora: "3.2× más citas en 90 días · clínica dental, MTY". HUD: `LOCACIÓN · CLÍNICA · 19:40`. | `ind-salud-hero` (escena #5) | Mini firma desde el rostro. Rack focus al salir. | 3 |
| 02 | Intertítulo sobre la toma desenfocada | "¿Cómo ayuda la IA en clínicas y consultorios?" (párrafo citable de D, aclarando que no da consejo médico). | Copia desenfocada | `--rack` con scrub. | 1 |
| 03 | **"La jornada"** (fijada +120 % en escritorio; lista vertical en móvil) | Una línea de tiempo horizontal del día del sector. Arriba, en ámbar, lo que pasa hoy; debajo, en cian, lo que pasa con Kain. **08:00** "Abres con mensajes de anoche sin contestar." → "Kain ya contestó y agendó." · **11:30** "Llamadas y WhatsApp al mismo tiempo; alguien espera." → "Kain atiende el chat mientras tu equipo atiende la sala." · **16:00** "Citas de mañana sin confirmar." → "Kain confirma y recuerda." · **19:40** "Cierras; los pacientes siguen escribiendo." · **23:48** "Un paciente pide cita para limpieza." → "Respuesta en segundos y la cita queda en tu CRM." **Sin cifras inventadas.** | La toma desenfocada se oscurece a ámbar o cian según el tramo | Una aguja vertical (el pilar) recorre las horas. Cada hora se enciende y su par cian se dibuja. | 2 |
| 04 | Guion | "Qué automatizamos": las 6 tareas de D en filas. | — | Entrada por filas. | 1 |
| 05 | **Plano general + push-in** (Kain a la izquierda) — **fijada +100 %** | "Así trabaja Kain en tu clínica": la cámara se acerca al mostrador. En la pantalla registrada corre el **simulador de chat** HTML ("ejemplo ilustrativo"): el paciente pide limpieza a las 11 p. m., Kain ofrece dos horarios, el paciente confirma y aparece "Registrado en tu CRM". Al lado, "Kain no da diagnósticos ni consejo médico." | `ind-salud-kain-sector` (D #35) | `--cam` 1 → 1.6 hacia la pantalla; luego la conversación avanza con scrub (cada burbuja en un tramo). | 3 |
| 06 | Montaje (3 filas) | 3.2× (MTY) · de 8 min a 12 s (MTY) · de 12 a 47 citas al mes (salud). | Placas de caso | Como ESC 08. | 2 |
| 07 | Fotogramas | Servicios recomendados: agentes de WhatsApp, Kommo, GoHighLevel. | Stills | Corte por coincidencia. | 1 |
| 08 | Intertítulo "Tus datos" | Consentimiento, aviso de privacidad, escalamiento a humano, sin consejo médico. **Sin sellos de certificaciones que no existan.** | Aura | — | 1 |
| 09 | FAQ | 5 preguntas de D. | — | — | 1 |
| 10 | Amanecer | Cierre de D ("¿Cuántas citas se te escapan por no contestar a tiempo?"). | Variante compartida | — | 3 |

**Variaciones por sector** (HUD y "jornada"): Belleza, `SALÓN · 20:30` (agenda de servicios y precios) · Nutrición, `CONSULTORIO · 18:00` (seguimiento de pacientes) · Finanzas, `DESPACHO · 09:15` (precalificación antes de llamar) · Inmobiliario, `SHOWROOM · 21:10` (lead de portal a medianoche) · Industrial y logística, `NAVE · TURNO 2` (procesos entre sistemas) · Retail y e-commerce, `TIENDA · 22:00` (ventas por chat) · HoReCa, `SALÓN · 22:15` (reservas por campaña).
**Sectores sin caso** (belleza, nutrición, finanzas, inmobiliario): el montaje muestra cifras transversales con la etiqueta "Dato de otro sector: …" (regla 2 de D).

### 5.3 T-CASE · "Documental" (ejemplo: `/casos/clinica-dental-monterrey/`)

| # | Plano | Contenido | Imagen | Motion | Int. |
|---|---|---|---|---|---|
| 01 | **Plano general** (persona a la derecha); la cifra forma parte del H1 | El H1 de D se maqueta en 3 voces, en el mismo orden en pantalla y en el DOM: `Clínica dental en Monterrey:` (Lexend 500, 22 px) · **`3.2×`** (`--t-mega`, con textura de escena) · `más citas en 90 días con un agente de IA` (Lexend 500, 32 px). Chips de ficha: Salud · Monterrey, N.L. · Agente de IA en WhatsApp · 90 días. En la esquina inferior derecha, en mono: `IMAGEN ILUSTRATIVA DEL SECTOR`. | `caso-dental-hero` (escena #6) | Mini firma. La cifra entra la última, con un filo de luz que la recorre. | 3 |
| 02 | **Ficha técnica** (intertítulo) | `<dl>` como ficha de película: Sector · Ciudad · Servicio · Herramientas `[POR CONFIRMAR]` · Plazo · Cifras. El **riel de escenas se vuelve Quick Jump** con etiquetas visibles: Contexto · Reto · Solución · Resultado · VKTOR · Replicar. | — | El riel se fija al llegar aquí. | 1 |
| 03 | **"Cifra visual": el cronómetro** (fijada +100 %) | "Antes, un paciente esperaba 8 minutos una respuesta por WhatsApp. Hoy espera 12 segundos." Dos cronómetros: el ámbar cuenta de 0:00 a 8:00 y llena una barra a todo lo ancho; el cian se detiene en 0:12 casi de inmediato (1/40 de la barra). La desproporción es el mensaje. | Aura ámbar → cian | El scrub mueve el ámbar. El cian se congela con un destello. | 3 |
| 04 | **Diagrama del sistema** | "Qué implementamos" (D): ramas del isotipo en SVG, WhatsApp → agente (Kain) → CRM `[validar: Kommo o GHL]` → agenda → equipo. **Los nodos sin confirmar no se publican.** | — | Las ramas se dibujan con `stroke-dashoffset` y scrub, y los nodos se encienden. | 2 |
| 05 | **Plano general** (Kain a la izquierda, agenda de cristal) | "Resultado": la oración citable de D con su nota de fuente. Las casillas de la agenda de la placa tienen **luces HTML ancladas** que se encienden una por una. | `caso-dental-resultado` (D #52) | Push-in leve y encendido de casillas. | 2 |
| 06 | Riel VKTOR™ | Solo hitos confirmados. Si no los hay, las fases genéricas y el enlace a `/metodologia/`. | — | — | 1 |
| 07 | Guion | "Qué puedes replicar en tu negocio": 3 filas. → `/industrias/salud/` | — | — | 1 |
| 08 | (Condicional) Testimonio | **Solo con aprobación escrita** (frase, nombre, cargo). Si no hay, la sección no existe. | — | — | — |
| 09 | Fotogramas | Casos relacionados (3). | Stills | Corte por coincidencia. | 1 |
| 10 | Amanecer | "¿Cuántas citas más cabrían en tu agenda?" + CTA de D ("Quiero un sistema así: agenda tu Discovery"). | Variante | — | 3 |

**"Cifra visual" de cada caso** (convierte **solo** el número confirmado; sin bases absolutas inventadas; "índice" cuando es relativo):

| Caso | Cifra confirmada | Escena de la cifra |
|---|---|---|
| Clínica dental (MTY) | 3.2× citas en 90 días · de 8 min a 12 s | Cronómetro 8:00 contra 0:12 (arriba) |
| Retail multimarca | +340 % en conversiones | Una barra-índice crece de 100 a 440 con scrub. El texto dice "índice: base 100 = antes". |
| E-commerce (CDMX) | −58 % de costo por lead en 60 días | La barra-índice baja de 100 a 42 en una línea de tiempo de 60 días (solo el inicio y el final, sin curva inventada). |
| HoReCa | ROAS de 4.8× sostenido | "$1 → $4.8": una moneda de luz que se multiplica en 4.8 columnas (la última al 80 %). |
| Logística | 27 procesos automatizados | 27 nodos cuadrados que se conectan con ramas del isotipo, uno por paso de scroll. |
| Tablero (e-commerce) | 1 vista · 7 fuentes | 7 ramas que convergen en un solo nodo: **el isotipo como prueba**. |

---

## 6. Navegación y mega menú

### 6.1 Encabezado (interfaz mínima, pero con estructura)

- **Alto:** 72 px en escritorio y 60 px en móvil. Transparente sobre la portada.
- **Contenido:** logo (isotipo + wordmark) · las 6 entradas de D: **Servicios ▾ · Industrias ▾ · Casos ▾ · Kain · Empresa ▾ · Recursos ▾** · botón circular de WhatsApp (`aria-label="Escríbele a Kain por WhatsApp"`) · botón azul pequeño **Agenda tu Discovery Session** (40 px).
- **Kain** lleva el acento de D: un punto cian de 4 px que late cada 6 s.
- **Estados:** al pasar el 80 % de la portada se oculta al bajar. Al subir vuelve como cristal (`rgb(3 4 11/.62)`, blur 16 px, filo inferior `rgb(0 229 255/.12)`).
- **"Modo sala":** durante una secuencia fijada, el encabezado **no vuelve** con subidas de menos de 120 px y la barra inferior móvil se oculta. El cuadro queda limpio.

### 6.2 Mega menú · "Sala de proyección"

```
┌ Servicios ▾ ───────────────────────────────────────────────────────────────────────────┐
│ ATRAER                 ATENDER Y VENDER            OPERAR Y ESCALAR  │ ┌── pantalla 21:9 ──┐ │
│ Paid media             Agentes de IA para WhatsApp Consultoría en IA │ │ still de la       │ │
│  Meta, Google y TikTok  Responden, califican…      Automatización…   │ │ portada destino   │ │
│ Páginas web            CRM con IA                  Software…         │ └───────────────────┘ │
│ SEO y visibilidad en IA Partner oficial Kommo ▣     …                │ ESC · /servicios/…    │
│ Branding y contenido   GoHighLevel en español                        │ "Responden… 24/7"     │
│ Todos los servicios · Metodología VKTOR™ · Tecnologías  ·  Planes desde USD 997 al mes        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Panel:** ancho completo bajo el encabezado, máximo 520 px de alto, cristal `rgb(10 31 76/.55)` con blur 24 y filo cian superior.
- **Columnas:** enlaces en las columnas 1–8, con nombre, una línea de resultado (D) y la cifra solo donde está confirmada (Salud 3.2×, Industrial 27, Retail +340 %, HoReCa 4.8×, más los 5 casos). En las columnas 9–12, la **pantalla**: el still 21:9 de la portada del enlace bajo el puntero o el foco (fundido cruzado de 0.3 s), con su HUD en mono y su línea de resultado. La imagen por defecto es la tarjeta destacada de D ("Conoce a Kain").
- **Rendimiento:** cada still pesa 640 px en AVIF (≤ 35 KB). Se cargan la primera vez que se abre el panel (`data-src` → `src`). Los enlaces viven siempre en el HTML estático (SEO); el JS solo abre y cierra.
- **Interacción:** se abre con hover con intención (100 ms de entrada y 200 ms de gracia), con clic o con Enter. Las flechas mueven el foco dentro del panel y Esc cierra. `aria-expanded` y `aria-controls` en cada disparador. Un pill indicador se desliza entre las entradas de primer nivel (GSAP Flip, gratuito en 3.13).
- **Paneles:** Servicios (3 grupos de D + destacado Kain) · Industrias (8 + "Todas") · Casos (5 con su cifra) · Empresa (Nosotros, Metodología, Tecnologías, Guadalajara, Contacto; la pantalla muestra la escena del equipo) · Recursos (Blog, 3 artículos, FAQ; la pantalla muestra la portada del último artículo).

### 6.3 Corte por coincidencia entre páginas (View Transitions entre documentos)

Cuando el clic sale de un **fotograma** (tarjeta, fila del guion o pantalla del mega menú), ese still se convierte en la placa de la portada de la página destino: la película no corta.

```css
@view-transition { navigation: auto; }
.hdr { view-transition-name: hdr; }                          /* el encabezado no parpadea */
.is-hero .layer--media img { view-transition-name: plate; }  /* una sola por página */
::view-transition-group(plate) { animation-duration: .7s; animation-timing-function: cubic-bezier(.76,0,.24,1); }
@media (prefers-reduced-motion: reduce) { @view-transition { navigation: none; } }
```

```js
// En la página de origen: el still clicado recibe el nombre "plate" justo antes de navegar
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-still]'); if (!a) return;
  a.querySelector('img').style.viewTransitionName = 'plate';
});
// En la página destino: si hubo transición, no se corre la mini firma
addEventListener('pagereveal', (e) => { if (e.viewTransition) document.documentElement.dataset.vt = '1'; });
```

- Funciona en Chrome 126+ y Safari 18.2+. En Firefox la navegación es normal y la mini firma hace el trabajo.
- **Sin ClientRouter de Astro:** el sitio sigue siendo MPA puro y GSAP/Lenis se inicializan una vez por documento, sin ciclo de vida extra.

### 6.4 Riel de escenas (orientación en un sitio de 45 páginas)

- `<nav class="rail" aria-label="Escenas de esta página">` fijo en el borde derecho, solo a partir de 1280 px.
- Un tick de 14 × 1 px por escena (`<a href="#esc-03">`); el activo es cian, de 26 px y con brillo. La etiqueta (`03 — El problema`) aparece con hover o foco.
- En el inicio, los ticks se agrupan en 3 bloques (actos I, II y III) separados por 8 px.
- **En las páginas de caso, el riel muestra las etiquetas siempre** y funciona como Quick Jump (C, patrón 10).
- Se sincroniza con `ScrollTrigger.create({ trigger: scene, start: 'top center', end: 'bottom center', onToggle })`.

### 6.5 Móvil

- "Menú" (texto, no hamburguesa sola) abre una **hoja a pantalla completa** de cristal sobre la escena actual desenfocada. Tiene acordeones por grupo (enlaces con su línea de resultado, sin imágenes), enlaces directos a Kain y Casos, y fijos al pie la Discovery y WhatsApp.
- **Barra inferior fija** (D) con *Agenda tu Discovery* y *Escríbele a Kain*: aparece después de la portada y se oculta durante las secuencias fijadas.
- Los breadcrumbs van dentro de la columna de texto de cada portada (D §7).

### 6.6 Casos especiales

- **`/discovery/`:** solo el logo y "Agendar mi Discovery Session" (D). Sin mega menú y sin riel. Mantiene la mini firma y el amanecer.
- **`/aviso-privacidad/`:** sin escena (D). Lienzo + intertítulo + índice lateral.
- **`/404`:** plano general con Kain mirando una rama de luz cortada (D #82) y enlaces de rescate como filas de guion.

---

## 7. Sistema de diseño · cambios frente a v1

### 7.1 Tabla de cambios

| Tema | v1 | v2 *Plano secuencia* |
|---|---|---|
| Papel de la imagen | Isotipo de cristal + chips; imágenes en cajas | **La imagen es el set.** Escenario registrado, texto en la penumbra, UI anclada a puntos de la imagen |
| H1 | Lexend 500, 46–96 px, centrado | Lexend **600**, 44–96 px, alineado a la izquierda en la penumbra, dos tonos + sub-línea en Lexend 500 de 18–24 px |
| H2 | Lexend 500, 32–64 px | Lexend 500, 36–68 px (`--t-d2`), la segunda mitad en tono |
| Cifras | En tarjetas de texto | `--t-mega` 96–256 px con textura de escena (montaje) |
| Etiquetas | Mono 12 px cian | Tres voces mono: eyebrow (cian), HUD (muted 70 %) y microcopia (muted) |
| Retícula | `.wrap` de 1240 px centrado | **Title-safe** de 12 columnas, márgenes de 6.25vw, máximo 1440. HUD en **action-safe** (3.5vw) |
| Ritmo vertical | `--section-y` uniforme → bandas negras de 300–500 px | Alturas por tipo de plano (100 / 88 / 64 svh) + costura solapada. **Ninguna zona de más de 40vh sin luz** |
| Cristal | `.cristal` en todos lados, también sobre negro | 3 niveles, solo sobre imagen o luz, **nunca detrás del bloque de texto**, como máximo 6 visibles |
| Botón primario | Pill azul con círculo-flecha | Pill azul de 56 px con el **nodo del isotipo** que "echa rama" en hover. Microcopia mono siempre debajo |
| Tarjetas | Cristal con fuga de luz | **Fotograma** (still de la escena destino + corte por coincidencia) y **filas de guion**. Sin íconos |
| Radios | 28 / 20 / 14 / 8 | 20 (fotogramas) · 16 (chips) · 999 (botones) · 4 (nodos). Menos burbuja, más encuadre |
| Fondo | Ondas de baja energía en todas partes | Un solo lienzo #03040B + grano global. Auras solo en planos sin sujeto |
| Motion | La misma entrada en cada sección | Lenguaje de cámara (dolly, travelling, rack focus, barrido de luz, push-in), 3 intensidades, 2 pins por página como máximo |
| Entre páginas | Corte duro | Corte por coincidencia (View Transitions) o mini firma |
| Orientación | 6 enlaces + botón | Mega menú con pantalla de previsualización + riel de escenas + footer de créditos |

### 7.2 Tokens

```css
:root{
  /* Color (marca sin cambios) */
  --ink:#03040B; --ink-2:#060A18; --navy:#0A1F4C; --blue:#0055FF; --blue-hi:#1A66FF;
  --indigo:#455DFF; --cyan:#00E5FF; --cyan-soft:#A8F3FF; --text:#FFFFFF; --text-2:#DCE6F2;
  --muted:#9EB0C7; --amber:#FFB547; --line:rgb(158 176 199/.14);

  /* Tipografía (fuentes locales: fonts/lexend-var, inter-var, jetbrains-mono-var) */
  --f-display:"Lexend",system-ui,sans-serif; --f-body:"Inter",system-ui,sans-serif; --f-mono:"JetBrains Mono",ui-monospace,monospace;
  --t-mega:600 clamp(6rem, 17vw, 16rem)/.82 var(--f-display);             /* cifras del montaje y H1 de caso; ls -.06em */
  --t-d1:600 clamp(2.75rem, 1.2rem + 5.2vw, 6rem)/.94 var(--f-display);    /* línea display del H1; ls -.05em */
  --t-h1sub:500 clamp(1.125rem, .9rem + .7vw, 1.5rem)/1.3 var(--f-display);/* resto del H1; ls -.02em */
  --t-d2:500 clamp(2.25rem, 1.1rem + 3.4vw, 4.25rem)/1 var(--f-display);   /* H2 de escena; ls -.035em */
  --t-h3:500 clamp(1.5rem, 1rem + 1.3vw, 2.25rem)/1.1 var(--f-display);    /* filas del guion, nombres */
  --t-h4:500 1.25rem/1.25 var(--f-display);
  --t-lede:400 clamp(1.0625rem, .98rem + .35vw, 1.3125rem)/1.55 var(--f-body);   /* máx. 44ch */
  --t-body:400 1.0625rem/1.65 var(--f-body);                                     /* máx. 68ch */
  --t-small:400 .875rem/1.5 var(--f-body);
  --t-meta:500 .6875rem/1 var(--f-mono);   /* eyebrow y HUD: ls .18em, mayúsculas */
  --t-label:400 .75rem/1.45 var(--f-mono); /* microcopia y fichas: ls .06em */

  /* Retícula y espacio */
  --safe-x:clamp(16px, 6.25vw, 120px);     /* title-safe (en móvil, 16 px de margen lateral) */
  --action-x:clamp(12px, 3.5vw, 56px);     /* HUD, encabezado, riel */
  --frame:min(100vw - 2 * var(--safe-x), 1440px);
  --gap:clamp(16px, 1.7vw, 24px);
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px; --s-7:48px; --s-8:64px; --s-9:96px; --s-10:128px;
  --seam:clamp(80px, 12vh, 160px);         /* solape entre escenas */
  --beat:clamp(72px, 10vh, 128px);         /* respiro arriba y abajo de los intertítulos */
  --h-hero:100svh; --h-mid:88svh; --h-cta:90svh; --h-title:64svh;

  /* Forma y movimiento */
  --r-still:20px; --r-chip:16px; --r-node:4px;
  --ease-cine:cubic-bezier(.22,1,.36,1);   /* = expo.out */
  --ease-cut:cubic-bezier(.76,0,.24,1);    /* = expo.inOut, movimientos de cámara */
  --d-cut:.2s; --d-ui:.45s; --d-shot:.9s; --d-light:1.6s;
}
.frame{width:var(--frame);margin-inline:auto;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap)}
@media (max-width:767px){.frame{grid-template-columns:repeat(4,minmax(0,1fr))}}
body{background:var(--ink);color:var(--text);font:var(--t-body);overflow-x:clip}
body::after{content:"";position:fixed;inset:-50%;z-index:100;pointer-events:none;opacity:.06;mix-blend-mode:overlay;
  background-image:url(/fx/noise.webp)}    /* un solo grano para imagen y UI (B-D12) */
```

Contraste: el titular y el lede deben pasar AA medidos sobre **el píxel más claro bajo el texto**. Donde el velo esté por debajo de .75, el lede pasa de muted a `--text-2`.

### 7.3 Escena base (plano general)

```astro
---
// src/components/Scene.astro (esqueleto)
const { plate, side = 'right', tone = 'sol', height = 'hero', anchors = [], hud, take = false, id } = Astro.props;
// plate = registro de la hoja: { d:{src,w,h,ar,fx,fy}, m:{src,w,h,ar,fx,fy}, alt, cx, cy, cxM, cyM }
---
<section id={id} class:list={['scene', `scene--${height}`, height === 'hero' && 'is-hero']} data-shot="scene"
  data-side={side} data-tone={tone}
  style={`--ar-d:${plate.d.ar};--fx-d:${plate.d.fx};--fy-d:${plate.d.fy};--ar-m:${plate.m.ar};--fx-m:${plate.m.fx};--fy-m:${plate.m.fy};--cx-d:${plate.cx};--cy-d:${plate.cy};--cx-m:${plate.cxM};--cy-m:${plate.cyM}`}>
  {!take && <div class="layer layer--media"><div class="stage">
    <picture>
      <source media="(max-width: 767px)" type="image/avif" srcset={plate.m.srcset} sizes="(max-aspect-ratio: 9/16) 100vw, 56svh" />
      <source type="image/avif" srcset={plate.d.srcset} sizes="(max-aspect-ratio: 21/9) 233svh, 100vw" />
      <img src={plate.d.webp} width={plate.d.w} height={plate.d.h} alt={plate.alt}
        fetchpriority={height === 'hero' ? 'high' : 'auto'} loading={height === 'hero' ? 'eager' : 'lazy'} decoding="async" />
    </picture>
  </div></div>}
  <div class="scene__fx" aria-hidden="true"></div>
  <div class="layer layer--anchors"><div class="stage">
    {anchors.map((a) => <div class="anchor" style={`--ax-d:${a.x};--ay-d:${a.y};--ax-m:${a.xm};--ay-m:${a.ym}`}><Fragment set:html={a.html} /></div>)}
  </div></div>
  <div class="frame scene__copy"><slot /></div>
  {hud && <div class="scene__hud" aria-hidden="true">{hud.map((h) => <p class={`meta hud--${h.pos}`}>{h.text}</p>)}</div>}
</section>
```

```css
.scene{--ar:var(--ar-d);--fx:var(--fx-d);--fy:var(--fy-d);--cx:var(--cx-d);--cy:var(--cy-d);--cam:1;
  --side:90deg;position:relative;isolation:isolate;overflow:clip;min-height:640px;padding-bottom:var(--seam)}
.scene--hero{height:var(--h-hero)} .scene--mid{height:var(--h-mid)} .scene--cta{height:var(--h-cta)}
.scene + *{margin-top:calc(-1 * var(--seam));position:relative;z-index:1}  /* la siguiente nace dentro del fundido */
.scene[data-side="left"]{--side:270deg}
.scene__copy{position:relative;z-index:1;height:100%;align-content:center}
.scene__copy > *{grid-column:1 / span 6}
.scene[data-side="left"] .scene__copy > *{grid-column:7 / span 6}
.scene__fx{position:absolute;inset:0;z-index:-4;pointer-events:none;background:
  linear-gradient(var(--side), rgb(3 4 11/.94) 0%, rgb(3 4 11/.78) 30%, rgb(3 4 11/.3) 48%, rgb(3 4 11/0) 60%), /* velo del lado del texto */
  linear-gradient(180deg, rgb(3 4 11/.5) 0, transparent 14%, transparent 70%, var(--ink) 100%),             /* encabezado arriba, disolución abajo */
  radial-gradient(40% 50% at 22% 45%, rgb(0 229 255/.07), transparent 70%)}                                   /* luz compartida detrás del H1 */
.scene[data-tone="dolor"] .scene__fx{background-blend-mode:normal}  /* el ámbar viene de la placa, no del CSS */
@media (max-width:767px){
  .scene{--ar:var(--ar-m);--fx:var(--fx-m);--fy:var(--fy-m);--cx:var(--cx-m);--cy:var(--cy-m);height:auto;min-height:100svh;
    display:grid;align-items:end;padding-top:58svh}
  .scene__copy > *, .scene[data-side="left"] .scene__copy > *{grid-column:1 / -1}
  .scene__fx{background:linear-gradient(to top, var(--ink) 0 30%, rgb(3 4 11/.72) 46%, rgb(3 4 11/0) 64%)}
}
```

### 7.4 Escenario registrado (validado)

El problema de `object-fit: cover`: el HTML no sabe dónde quedó la mano de Kain después del recorte. La solución: **dibujar la caja "cover" a mano** dentro de una capa absoluta con `container-type: size`. Como la capa toma su tamaño de la sección y no de su contenido, la contención de tamaño es segura.

```css
.layer{position:absolute;inset:0;container-type:size;pointer-events:none}
.layer--media{z-index:-5} .layer--optics{z-index:2} .layer--anchors{z-index:3}
.stage{
  --sw:max(100cqw, calc(100cqh * var(--ar)));                   /* ancho de la caja cover */
  position:absolute;width:var(--sw);height:calc(var(--sw) / var(--ar));
  left:calc((100cqw - var(--sw)) * var(--fx));                  /* misma semántica que object-position */
  top:calc((100cqh - var(--sw) / var(--ar)) * var(--fy));
  transform-origin:var(--cx) var(--cy)}
.layer--media .stage{scale:var(--cam)}
.stage img{display:block;width:100%;height:100%}
.anchor{--ax:var(--ax-d);--ay:var(--ay-d);position:absolute;left:var(--ax);top:var(--ay);pointer-events:auto}
@media (max-width:767px){.anchor{--ax:var(--ax-m);--ay:var(--ay-m)}}
```

- **Prueba:** con `kain-01-hero.png` y anclas en la yema del dedo (54.2 %, 44.5 %) y en el pecho, las anclas quedaron sobre el mismo punto a 1024 × 1366, 1440 × 900, 1920 × 1080 y 2560 × 1080.
- **Lección de la misma prueba:** a 2560 × 1080 una placa 16:9 **corta los pies de Kain**. Las placas de escritorio deben generarse a 21:9.
- **Hoja de registro:** en `src/data/plates.json`, por placa: archivos, `ar`, `fx/fy` de escritorio y móvil, y las anclas con nombre (`pecho`, `mano`, `pantalla`, `escalon-1…5`). Se miden con una página solo de desarrollo, `/dev/registro/`, donde haces clic sobre la placa y te copia el punto en %.
- **Regla de parallax:** lo que debe quedar clavado (video en una pantalla, etiquetas de escalones) se mueve **con** la placa (`[data-lock]`, misma `yPercent`). Los chips libres pueden adelantarse hasta −40 %.

### 7.5 Recetas de tratamiento de imagen

**A · Planos gemelos (barrido de luz)**

```css
.plate{position:absolute;inset:0;width:100%;height:100%}
.plate--b{clip-path:inset(0 0 0 var(--wipe,100%))}          /* B se revela de derecha a izquierda */
.wipe-beam{position:absolute;inset:0 auto 0 var(--wipe,100%);width:2px;translate:-1px 0;mix-blend-mode:screen;
  background:linear-gradient(transparent, var(--cyan) 20%, #fff 50%, var(--cyan) 80%, transparent);
  box-shadow:0 0 24px 6px rgb(0 229 255/.55), 0 0 120px 30px rgb(0 85 255/.35)}
.pain{--mix:0;color:color-mix(in oklab, var(--amber), var(--text) calc(var(--mix) * 100%))}
.pain__fix{color:var(--cyan);clip-path:inset(0 calc((1 - var(--mix)) * 100%) 0 0)}  /* la salida se "dibuja" */
```

```js
shots.twin = (el, { desk }) => {
  const clock = el.querySelector('[data-clock]');
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: desk ? '+=150%' : '+=120%',
      pin: true, scrub: .6, onUpdate: (st) => { clock.textContent = st.progress < .7 ? `23:${48 + Math.min(4, Math.floor(st.progress / .35 * 4))}` : '23:48 + 12 s'; } } })
    .from(el.querySelectorAll('.pain'), { autoAlpha: 0, y: 16, stagger: .08, duration: .08 }, 0)
    .to(el, { '--wipe': '0%', duration: .35 }, .35)
    .to(el.querySelectorAll('.pain'), { '--mix': 1, stagger: .05, duration: .12 }, .45)
    .from(el.querySelector('.twin__remate'), { autoAlpha: 0, y: 20, duration: .2 }, .75);
};
```

**B · Toma compartida (rack focus sin `filter` en vivo)**

```html
<div class="take" data-shot="take">
  <div class="take__bg" aria-hidden="true">
    <div class="layer layer--media"><div class="stage"><picture>…placa nítida (LCP)…</picture>
      <img class="rack" src="/img/cine/x-rack-320.webp" alt=""></div></div>   <!-- copia de 320 px con blur 40 px ya horneado -->
  </div>
  <section class="scene is-hero" …>…</section>   <!-- con take=true no pinta su propia placa -->
  <section class="intertitle">…</section>
</div>
```

```css
.take{position:relative;isolation:isolate}
.take__bg{position:sticky;top:0;height:100svh;margin-bottom:-100svh;z-index:-6}
.rack{position:absolute;inset:0;width:100%;height:100%;opacity:var(--rack,0)}
```

```js
shots.take = (el) => gsap.timeline({ scrollTrigger: { trigger: el.children[2], start: 'top 85%', end: 'top 25%', scrub: true } })
  .to(el, { '--rack': 1, ease: 'none' }).to(el.querySelector('.take__bg'), { '--veil': .7, ease: 'none' }, 0);
```

**C · Montaje (cifra con textura de escena, siempre legible)**

```css
.cut{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap);align-items:end;min-height:40vh}
.cut__fig{grid-column:1 / span 8;margin:0;font:var(--t-mega);letter-spacing:-.06em;color:transparent;
  background-image:linear-gradient(rgb(255 255 255/.62), rgb(255 255 255/.62)), var(--still);
  background-blend-mode:screen;background-size:cover;background-position:var(--px,50%) 50%;
  -webkit-background-clip:text;background-clip:text;-webkit-text-stroke:1px rgb(0 229 255/.35)}
.cut:nth-child(even) .cut__fig{grid-column:5 / span 8;text-align:right}
.cut__meta{grid-column:span 4;font:var(--t-label);letter-spacing:.06em;color:var(--muted)}
```
`--still: url(/img/cine/caso-…-640.avif)` va en línea. La capa blanca en `screen` aclara la placa oscura dentro de las letras: la cifra se lee blanca con textura y no navy sobre navy.

**D · Travelling**

```js
shots.travel = (el, { desk }) => {
  const vp = el.querySelector('.travel__viewport'), track = el.querySelector('.travel__track');
  const stops = [...el.querySelectorAll('[data-stop]')].map((s) => +s.dataset.stop / 100); // centro del objeto, en % de la pista
  const subs = el.querySelectorAll('.travel__sub'), poses = el.querySelectorAll('.travel__kain img');
  const focal = desk ? .68 : .5;
  const clampX = (x) => gsap.utils.clamp(-(track.offsetWidth - vp.offsetWidth), 0, x);
  const xAt = (p) => () => clampX(-(p * track.offsetWidth - vp.offsetWidth * focal));
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top',
    end: () => '+=' + vp.offsetHeight * (desk ? 3.2 : 2.6), pin: true, scrub: .8, invalidateOnRefresh: true,
    snap: { snapTo: 'labels', duration: { min: .2, max: .6 }, ease: 'power2.inOut' } } });
  tl.set(track, { x: xAt(stops[0]) }).addLabel('s0');
  stops.slice(1).forEach((p, i) => {
    tl.to(track, { x: xAt(p), duration: 1 })
      .to(subs[i], { autoAlpha: 0, duration: .2 }, '<.3').to(subs[i + 1], { autoAlpha: 1, duration: .2 }, '<.1')
      .to(poses[i] ?? {}, { autoAlpha: 0, duration: .25 }, '<').to(poses[i + 1] ?? {}, { autoAlpha: 1, duration: .25 }, '<')
      .addLabel('s' + (i + 1));
  });
};
```

```css
.travel__viewport{position:relative;height:100svh;overflow:clip}
.travel__track{--ar:5.3333;position:absolute;top:50%;left:0;translate:0 -50%;
  width:max(500vw, calc(100svh * var(--ar)));aspect-ratio:var(--ar)}  /* cada estación mide al menos un viewport */
.travel__track img{width:100%;height:100%;display:block}
```

**E · Amanecer (horizonte + haz):** se reutiliza `.horizon` y `.beam` de B-D2/D11. El arco anima `--glow` (opacidad del filo), el haz `scaleX`, y la placa trae su propio horizonte generado, que el arco CSS remata.

### 7.6 Cristal: 3 niveles (y cuándo NO)

| Nivel | Uso | Receta |
|---|---|---|
| `glass-chip` | Chips de prueba, burbujas de chat, sello Kommo sobre la placa | Blur 18 + saturate 140, fondo `linear-gradient(150deg, #ffffff1f, #ffffff08 50%, #455dff1a)`, filo de 1 px en degradado (B-D4), radio 16, **máximo 260 px de ancho** |
| `glass-panel` | Mega menú, hoja móvil, teléfono de Kain, pregunta abierta | Blur 24, fondo `rgb(10 31 76/.55)`, filo cian superior |
| `solid` | Cuando no hay nada detrás que se vea difuso | `#070B18` al 92 % + filo de 1 px. **No se llama cristal** |

Reglas: nunca un cristal detrás del bloque de texto de una escena. Como máximo 6 `backdrop-filter` visibles a la vez. Nunca un ancestro con máscara, filtro u opacidad animada (se aplana).

### 7.7 Botones

```html
<a class="btn" href="/discovery/">Agenda tu Discovery Session
  <span class="btn__node" aria-hidden="true"><svg viewBox="0 0 16 16"><rect class="n" x="5" y="5" width="6" height="6" rx="1"/><path class="r" d="M8 8h6M11 5l3 3-3 3"/></svg></span></a>
<p class="micro">30 min · 1:1 · Google Meet · sin costo</p>
```

```css
.btn{display:inline-flex;align-items:center;gap:16px;height:56px;padding:0 10px 0 26px;border-radius:999px;background:var(--blue);
  color:#fff;font:500 15px/1 var(--f-display);text-decoration:none;
  box-shadow:inset 0 0 0 1px rgb(255 255 255/.16), 0 10px 40px rgb(0 85 255/.55);transition:background var(--d-ui) var(--ease-cine)}
.btn:hover{background:var(--blue-hi);box-shadow:inset 0 0 0 1px rgb(255 255 255/.28), 0 12px 44px rgb(0 85 255/.6), 0 0 80px rgb(0 229 255/.25)}
.btn__node{width:36px;height:36px;border-radius:50%;background:rgb(255 255 255/.14);display:grid;place-items:center}
.btn__node svg{width:16px;overflow:visible}
.btn__node .n{fill:#fff;filter:drop-shadow(0 0 4px #fff);transition:transform var(--d-ui) var(--ease-cine);transform-origin:8px 8px}
.btn__node .r{fill:none;stroke:#fff;stroke-width:1.6;stroke-linecap:round;stroke-dasharray:14;stroke-dashoffset:14;transition:stroke-dashoffset var(--d-ui) var(--ease-cine)}
.btn:hover .n{transform:translateX(-4px) scale(.55)}   /* el nodo se retrae… */
.btn:hover .r{stroke-dashoffset:0}                     /* …y echa una rama-flecha */
.btn--ghost{background:rgb(255 255 255/.04);box-shadow:inset 0 0 0 1px rgb(0 229 255/.35)}  /* Escríbele a Kain */
.btn--sm{height:40px;padding:0 18px;font-size:13px}  /* encabezado */
.micro{margin-top:12px;font:var(--t-label);letter-spacing:.08em;color:var(--muted)}
```

- Un solo `.btn` azul por pantalla. En móvil mide 52 px y ocupa todo el ancho en la portada.
- Efecto magnético de ±6 px solo con `pointer: fine` (`gsap.quickTo`).
- El borde de luz (conic) del primario corre **una vez** en el amanecer, no en bucle.
- Enlace terciario `.link-branch`: subrayado que nace de un nodo de 4 px y crece hacia la derecha en hover.

### 7.8 Tarjetas: fotograma y fila de guion (sin "3 tarjetas iguales con ícono")

```html
<a class="still" href="/casos/clinica-dental-monterrey/" data-still>
  <span class="still__img"><img src="/img/cine/caso-dental-hero-640.avif" alt="" width="640" height="274" loading="lazy"></span>
  <span class="still__meta meta">CASO · SALUD · MTY</span>
  <span class="still__title">Clínica dental en Monterrey</span>
  <span class="still__fig">3.2× más citas en 90 días</span>
</a>
```

```css
.still{position:relative;isolation:isolate;display:grid;gap:8px;padding:0 20px 20px;border-radius:var(--r-still);overflow:clip;
  text-decoration:none;color:inherit;background:linear-gradient(180deg, transparent 0 45%, rgb(6 10 24/.92) 75%)}
.still::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
  background:linear-gradient(140deg, rgb(255 255 255/.4), rgb(255 255 255/.05) 40%, rgb(0 229 255/.35));
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.still__img{margin:0 -20px;aspect-ratio:21/9;overflow:clip;-webkit-mask-image:linear-gradient(#000 55%, transparent);mask-image:linear-gradient(#000 55%, transparent)}
.still__img img{width:100%;height:100%;object-fit:cover;scale:1.04;transition:scale .9s var(--ease-cine)}
.still:hover .still__img img{scale:1}
.still__title{font:var(--t-h4)} .still__fig{font:var(--t-label);color:var(--cyan)}
.script__row{display:grid;grid-template-columns:56px 1fr minmax(0,34ch) 24px;align-items:baseline;gap:var(--gap);
  padding:20px 0;border-top:1px solid var(--line);text-decoration:none;color:inherit;transition:opacity var(--d-ui)}
.script:has(.script__row:hover, .script__row:focus-visible) .script__row:not(:hover, :focus-visible){opacity:.35}
```

Proporciones del fotograma: 21:9 en casos y servicios, 4:5 en industrias en móvil. El rack focus (blur 6 → 0) se aplica solo **a la entrada** con scroll, nunca en reposo.

### 7.9 HUD y metadatos

```css
.scene__hud .meta{position:absolute;font:var(--t-meta);letter-spacing:.18em;text-transform:uppercase;color:rgb(158 176 199/.7)}
.hud--tr{top:calc(72px + 32px);right:var(--action-x)} .hud--bl{bottom:28px;left:var(--safe-x)} .hud--br{bottom:28px;right:var(--action-x)}
@media (max-width:767px){.hud--bl,.hud--br{display:none}}   /* en móvil solo queda el índice de escena */
```

El índice (`ESC 03 / 13`) hace un "scramble" de 6 cuadros al entrar (B-D9). En modo reducido aparece sin efecto.

### 7.10 Motion: arranque y presupuesto

```ts
// src/scripts/cine.ts (un módulo por documento; MPA sin ClientRouter)
import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import { SplitText } from 'gsap/SplitText'; import Lenis from 'lenis';
import { shots } from './shots';           // scene, take, twin, travel, montage, script, locations, credits, dawn, coldOpen
gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.matchMedia().add({ motion: '(prefers-reduced-motion: no-preference)', desk: '(min-width: 768px)' }, (ctx) => {
  const { motion, desk } = ctx.conditions!;
  if (!motion) return;                     // reducido: sin Lenis, sin pins ni parallax; solo fundidos de .3 s (CSS)
  const lenis = new Lenis({ lerp: .1, autoRaf: false });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (t: number) => lenis.raf(t * 1000);
  gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLElement>('[data-shot]').forEach((el) => shots[el.dataset.shot!]?.(el, { desk }));
  return () => { gsap.ticker.remove(raf); lenis.destroy(); };
});
```

| Presupuesto | Meta |
|---|---|
| LCP (móvil 4G) | < 2.5 s. Placa de portada AVIF ≤ 220 KB a 1920 y ≤ 120 KB a 1080 × 1920, precargada con `imagesrcset` |
| CLS | < 0.05 (todas las placas con `width`/`height`; el escenario no depende del contenido) |
| JS de motion | ≤ 65 KB gzip (GSAP core + ScrollTrigger + SplitText + Lenis + escenas). **Sin DrawSVG ni MorphSVG** (la firma usa `dashoffset`, `scale` y opacidad) |
| Panorámica | 9600 × 1800 AVIF ≤ 600 KB. Se precarga con `requestIdleCallback` cuando ESC 03 entra en pantalla |
| Secuencias fijadas | ≤ 2 por página, cada una con "Saltar escena" |
| Videos | `muted playsinline preload="none"`, poster, pausa fuera de pantalla. Nunca `backdrop-filter` sobre un video |
| WebGL | Ninguno |

---

## 8. Escenas de imagen (8)

> Reglas comunes (B §6, C §1.3, D §4.5):
> - **Escritorio a 21:9 (3360 × 1440)** y **versión vertical generada aparte**: 9:16 (1080 × 1920) para Kain y 4:5 (1242 × 1552) para personas.
> - **Siempre adjuntar** `kain-body-presenta.jpg`, `kain-body-brazos.jpg` y `kain-body-toca.jpg` como referencia de personaje.
> - Una sola luz cian/azul desde atrás. Los bordes caen a #03040B.
> - Sin texto, letras, números, logos ni UI legible.
> - Después de generar: upscale, recorte del sujeto (`remove_background`), *placa limpia* si habrá parallax, y medición de anclas en la hoja de registro.

**Negativo común:** `text, letters, numbers, watermark, logo, UI with readable text, black robot, graphite robot, extra robots, cartoon, flat illustration, cropped feet, cropped antennas, human teeth or mouth on the robot, warm light (except where specified), lens flare on the text side, busy background on the text side.`

**Bloque de personaje** (se pega donde dice `{KAIN}`): `KAIN — the small friendly white robot from the reference images (exact same design: round glossy white helmet head, two thin silver antennas with glowing cyan tips, chrome ear pieces, dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints), FULL BODY, feet visible`

### #1 · `home-hero` — "El agente" (inicio, ESC 01; es también el plano de la firma)

- **Composición (21:9):** Kain de pie en el tercio derecho (cuerpo centrado en el **70 %** del ancho), en tres cuartos hacia la izquierda, con la **pantalla del pecho de frente** (centro en 70 %, 47 %; lado ≥ 3 % del ancho). La mano izquierda abierta presenta hacia la izquierda a la altura del pecho (centro de la palma cerca del 57 %, 47 %). Los pies quedan al 84 % del alto sobre un piso negro brillante con un anillo concéntrico tenue y reflejo. Detrás, un **pilar de luz** vertical cian-blanco y, a la altura del pecho, **dos pares de ramas de luz** que se bifurcan en diagonal (arriba y abajo, a cada lado) y se pierden en la niebla. El 52 % izquierdo es navy limpio.
- **Anclas:** `pecho` (firma, iris), `mano` (chip), `piso` (línea base de los CTA).
- **Móvil (9:16):** Kain centrado (50 %), del 6 al 58 % del alto, con el pecho en 50 % / 30 %. Las ramas bajan hacia la parte inferior y el 42 % de abajo es piso oscuro para el texto.
- **Prompt:**
  ```
  Cinematic 21:9 wide shot, premium 3D advertising render. {KAIN}, standing in the right third of the frame
  (body centered at 70% of frame width), three-quarter view turned slightly to the left, the square chest screen
  facing the camera, crisp and clearly visible. His left arm extends toward the empty left side, presenting with an
  open palm at chest height. Behind him a narrow vertical pillar of cyan-white light rises from the floor; at chest
  height two thin pairs of light branches fork diagonally from the pillar (up-left, down-left, up-right, down-right)
  and dissolve into soft haze, like the arms of a logo made of light. Dark glossy reflective floor with a faint
  concentric ring under his feet at 84% of frame height, robot reflection visible. Lighting: single cyan (#00E5FF)
  and electric blue (#0055FF) rim light from behind, soft indigo (#455DFF) fill entering from the left. The LEFT 52%
  is clean negative space: smooth deep navy (#0A1F4C) fading to near-black (#03040B), faint haze, no objects, no
  light sources, no particles. All edges fade to near-black. 50mm lens, f/2.8, subtle film grain, HDR.
  No text, no letters, no numbers, no logos, no UI.
  ```
- **Movimiento en el sitio:** firma (escala ×4 desde el pecho), respiración en reposo y parallax al salir. **Entregar también** el recorte de Kain y una placa limpia para el parallax de dos capas.

### #2 · `home-problema-a` / `home-problema-b` — "23:48" (planos gemelos, ESC 03)

- **A (ámbar):** dueño de pyme mexicano (45 años, camisa casual) solo en su **local vacío después del cierre** (una tienda pequeña con mostrador). Está sentado en un banco en el **tercio izquierdo** (22–38 %), encorvado, con el rostro iluminado desde abajo por la luz **ámbar cálida** del celular. Detrás, anaqueles en sombra navy desenfocados. El **55 % derecho** es penumbra casi negra.
- **B (cian), mismo encuadre:** **se genera como edición de A** (A como imagen base + referencias de Kain): el dueño ya no está y el banco queda vacío. El celular sigue sobre el mostrador, ahora con brillo **cian**. Kain, de cuerpo completo, está junto al mostrador (30–40 %) con contraluz cian. Las sombras y la cámara no cambian.
- **Verificación:** se superponen A y B en `difference`. Si algo se desplaza más de 4 px fuera de la zona editada, se regenera B.
- **Anclas:** `telefono` (luz que coincide con el barrido), `rostro`/`kain`.
- **Móvil (4:5, ambas):** persona o Kain en el 55 % superior y mostrador abajo, en sombra para la lista.
- **Prompt A:**
  ```
  Cinematic 21:9 night interior, editorial photography. A Mexican small-business owner (45, casual shirt) sits alone
  on a stool at the counter of his small shop after closing time, in the left third of the frame (22–38% width),
  shoulders slumped, face lit from below only by the warm amber glow (#FFB547) of the smartphone in his hands.
  Shelves behind him dissolve into deep navy shadow, out of focus. The RIGHT 55% of the frame is near-black navy
  shadow with no objects and no light. 35mm, f/2.0, fine grain, quiet and tired mood. No readable screens, no text.
  ```
- **Prompt B (edición sobre A):**
  ```
  Edit this exact image. Keep the camera, framing, shop, counter, shelves and shadows identical. Remove the man;
  the stool stays empty. The smartphone remains on the counter but now glows cyan (#00E5FF). Add {KAIN} standing
  beside the counter where the man was (30–40% width), small robot scale, lit by a cyan rim light from behind.
  Replace all amber light with cool cyan and blue. Right side stays near-black. No text.
  ```

### #3 · `home-sistema-panorama` — "El sistema" (travelling, ESC 05) + 5 poses de Kain

- **Formato:** 9600 × 1800 (16:3). Es una noche continua: un **piso reflectante con un riel de luz cian a ras de suelo** (el pilar del isotipo acostado) que une 5 estaciones, una cada 1920 px. El horizonte queda fijo al 66 % del alto. El objeto de cada estación ocupa el **55 % derecho de su tramo** y el 45 % izquierdo es penumbra (subtítulos en escritorio). El tercio inferior es piso limpio (subtítulos en móvil).
  1. **Atraer:** una pila vertical de paneles de cristal flotantes con imágenes abstractas desenfocadas (sin texto), como anuncios en el aire.
  2. **Atender:** un teléfono de cristal enorme (2 m) de pie, con burbujas de chat de luz en blanco. La pantalla es plana y frontal porque ahí se ancla `kain-chat`.
  3. **Organizar:** cinco columnas verticales de luz, como carriles de un kanban, con tarjetas luminosas en blanco.
  4. **Automatizar:** una constelación de nodos cuadrados unidos por ramas de luz (los brazos del isotipo), como un circuito.
  5. **Medir:** una pantalla curva y ancha, como un horizonte, con barras y curvas abstractas que convergen en un solo punto de luz.
- **Producción:** se generan **5 estaciones 16:9 por separado** con el mismo horizonte y el mismo riel (prompt común con "horizon line at 66% height, cyan floor rail entering left and exiting right at the same height") y se unen en Photoshop con fundidos de 300 px. Es más fiable que hacer outpainting de una sola imagen.
- **Poses de Kain para el recorte (5, 1248 × 1872, fondo negro liso, misma luz cian desde atrás a la derecha):** caminando · presentando con la mano abierta · señalando · sosteniendo una tarjeta de luz en blanco · brazos cruzados. Después se quita el fondo.
- **Prompt de estación (plantilla):**
  ```
  Cinematic wide 16:9 night scene, premium 3D render, part of a continuous panorama. A dark glossy reflective floor
  with a thin glowing cyan light rail at floor level entering from the left edge and exiting the right edge at the
  same height; horizon line at 66% of frame height. In the right 55% of the frame: [STATION OBJECT]. The left 45%
  is clean deep navy negative space with faint haze. Single cyan and electric-blue light, edges fade to near-black.
  No people, no robots, no text, no letters, no numbers, no logos, no readable UI.
  ```

### #4 · `agentes-whatsapp-hero` — clienta escribiendo de noche (T-SERVICE, D #12)

- **Composición (21:9):** mujer de 30 años en el sofá de su sala de noche, en el **tercio izquierdo** (18–36 %), escribiendo en el celular. La **pantalla del celular ilumina su rostro en cian**. Detrás, un ventanal con luces de ciudad desenfocadas (bokeh azul frío, al estilo del skyline de Guadalajara). El **55 % derecho** es la sala en penumbra navy. El celular queda inclinado hacia la cámara, con la pantalla visible como una superficie luminosa sin UI.
- **Anclas:** `pantalla` (para las burbujas HTML "11:48 p. m." y "Respondido en 12 s") y `rostro` (mini firma).
- **Móvil (9:16):** ella en el 55 % superior con el teléfono cerca del centro; burbujas y texto en la penumbra inferior.
- **Prompt:**
  ```
  Cinematic 21:9 editorial night photograph. A Mexican woman (30) sits on a sofa in her living room at night, in the
  left third of the frame (18–36% width), typing on her smartphone; the phone screen is a soft cyan glow (no visible
  UI) that lights her face. Behind her a large window with out-of-focus cold blue city lights. The RIGHT 55% of the
  frame is a deep navy shadowed living room with no objects in focus and no light sources. Single cool light, blue
  monochrome grading, the shadow side of the person dissolves into the background. 50mm, f/1.8, fine grain.
  No text, no logos, no readable screen.
  ```

### #5 · `ind-salud-hero` — odontóloga al final del día (T-INDUSTRY, D #34)

- **Composición (21:9):** odontóloga de 40 años con bata blanca, de pie, en tres cuartos, en el **tercio derecho** (64–78 %). Sostiene una tableta con la pantalla en brillo cian sin interfaz y mira hacia la izquierda, al titular. Detrás, el sillón dental de un consultorio moderno y vacío, desenfocado. La luz fría de una ventana a su espalda le da un borde cian. El **52 % izquierdo** es penumbra navy.
- **Anclas:** `tableta` (chip 3.2×) y `rostro`.
- **Móvil (4:5):** ella en el 58 % superior y el piso del consultorio en sombra abajo.
- **Prompt:**
  ```
  Cinematic 21:9 editorial photograph. A Mexican female dentist (40) in a white coat stands three-quarter in the
  right third of the frame (64–78% width), holding a tablet whose screen is a soft cyan glow (no UI), looking toward
  the empty left side. Modern, empty dental office at the end of the day, dental chair out of focus behind her, cool
  window light creating a cyan rim on her shoulders and hair. The LEFT 52% is clean deep navy shadow with no objects.
  Blue monochrome duotone-friendly grading, shadow side dissolves into the background. 50mm, f/2.0, fine grain.
  No text, no logos. Illustrative person, not a real client.
  ```

### #6 · `caso-dental-hero` — dentista en Monterrey a la hora azul (T-CASE, D #51)

- **Ajuste frente a D:** D pide "atardecer con luz cálida". Lo cambio a **hora azul**, porque el ámbar queda reservado para el dolor y aquí se celebra un resultado.
- **Composición (21:9):** dentista de 45 años de pie junto al ventanal de su consultorio, en el **tercio derecho**, mirando hacia afuera y hacia la izquierda. Por la ventana se ve la silueta desenfocada de las montañas de Monterrey (Cerro de la Silla) contra un cielo azul profundo con un filo de luz fría en el horizonte. El **50 % izquierdo** queda oscuro y vacío, porque ahí vive la cifra gigante **3.2×** del H1.
- **Etiqueta obligatoria en la página:** `IMAGEN ILUSTRATIVA DEL SECTOR`.
- **Móvil (4:5):** él arriba y la cifra sobre la penumbra inferior.
- **Prompt:**
  ```
  Cinematic 21:9 editorial photograph at blue hour. A Mexican male dentist (45) stands by the large window of his
  practice in the right third of the frame, three-quarter view, calm and confident, looking out toward the left.
  Through the window, the out-of-focus silhouette of the Monterrey mountains (Cerro de la Silla) against a deep blue
  sky with a thin cold cyan-white glow on the horizon. Interior in deep navy shadow. The LEFT 50% is clean, dark and
  empty for typography. Cool light only, no warm tones. 50mm, f/2.0, fine grain. No text. Illustrative person.
  ```

### #7 · `metodologia-hero` — Kain sobre los cinco escalones (ESC 09 del inicio y portada de `/metodologia/`)

- **Composición (21:9):** **cinco losas de cristal luminoso** suben en diagonal desde la esquina inferior izquierda (V: centro en 14 %, 90 %) hasta el tercio derecho (R: centro en 72 %, 62 %), unidas por una línea cian a ras de las losas. Kain, de cuerpo completo, está de pie sobre la quinta, mirando hacia atrás, hacia la izquierda, con una mano abierta. Detrás de él, un haz vertical (Rise). La **mitad superior izquierda** (0–55 % de ancho, 0–50 % de alto) es cielo navy limpio para el texto.
- **Anclas:** `escalon-1…5` (etiquetas V·K·T·O·R y brillos) y `pecho`.
- **Móvil (9:16):** losas en zigzag de abajo hacia arriba, Kain en la losa superior (al 22 % del alto) y el titular en la franja superior.
- **Prompt:**
  ```
  Cinematic 21:9 wide shot, premium 3D render. Five floating glowing glass slabs rise diagonally like stairs from the
  bottom-left corner (first slab centered at 14% width, 90% height) to the right third (fifth slab centered at 72%
  width, 62% height), connected by a thin cyan light line along their edges. {KAIN} stands on the fifth slab, turned
  back toward the left, one open hand gesturing to the steps; a vertical beam of cyan-white light rises behind him.
  The upper-left area (0–55% width, 0–50% height) is clean deep navy sky with faint haze, no objects. Single cyan and
  blue light, reflective dark fog below, edges fade to near-black. 35mm, HDR. No text, no letters, no numbers.
  ```
- **Base:** `kain-03-cuatro-a.png` (4 escalones, Kain caminando a la izquierda) como referencia de estilo; se regenera con 5 losas y Kain arriba.

### #8 · `cta-amanecer` — "06:00 · Rise" (cierre compartido; reemplaza a `cta-kain-saluda`)

- **Composición (21:9):** un **horizonte curvo enorme**, como el borde de un planeta oscuro, cruza el tercio inferior (cresta al 70 % del alto) con un **filo fino de luz de amanecer cian-blanco** y un resplandor frío que sube. Desde arriba, un poco a la derecha, baja un haz de luz vertical. Kain, de cuerpo completo, está de pie sobre el horizonte en el **tercio derecho** (66–74 %), saludando con una mano levantada hacia la izquierda. El cielo va de navy a índigo cerca del horizonte. El **52 % izquierdo** es cielo oscuro para el texto.
- **Variantes con la misma luz** (los cierres compartidos de D): `cta-kain-senala` (Kain a la izquierda señalando el botón, texto a la derecha) · `cta-duena-tranquila` (dueña en su oficina con el amanecer frío en la ventana) · `cta-equipo` (equipo real con el horizonte compuesto detrás, sin tocar rostros).
- **Móvil (9:16, invertido):** cielo y texto en el 55 % superior, Kain sobre el horizonte en el 45 % inferior.
- **Prompt:**
  ```
  Cinematic 21:9 wide shot, premium 3D render, cold dawn. A vast curved dark horizon like the edge of a planet crosses
  the lower third (crest at 70% of frame height) with a thin bright cyan-white rim of dawn light and a cold glow
  rising from it. A vertical beam of light descends from above, slightly right of center. {KAIN} stands on the horizon
  in the right third (66–74% width), raising one hand in a friendly greeting toward the left. Sky gradient from deep
  navy (#0A1F4C) to indigo (#455DFF) near the horizon. The LEFT 52% is clean dark sky, no stars, no objects.
  Cold light only, no warm sunrise colors. 35mm, HDR, fine grain. No text, no letters, no logos.
  ```

---

## 9. Producción, cambios frente a D y riesgos

### 9.1 Imágenes: qué cambia frente a la lista de D (§14 de D)

| Cambio | Archivos | Motivo |
|---|---|---|
| `home-problema` pasa a ser **gemelas A + B** | +1 placa | Corte de luz en ESC 03 |
| **Panorámica del sistema** (5 estaciones unidas) | +1 placa grande (5 generaciones) | Travelling de ESC 05 |
| **5 poses de Kain** con la misma luz, recortadas | +5 recortes pequeños | Kain acompaña el travelling |
| **`riel` compartido** de servicios | +1 placa grande | "Cómo funciona" en las 11 páginas de servicio |
| **Placa limpia + recorte** de `home-hero` | +1 placa (inpainting) | Parallax de 2 capas en la portada |
| 4 cierres compartidos **reiluminados como amanecer** | 0 (se regeneran los mismos 4) | Unidad del final "Rise" |
| `caso-dental-hero` a hora azul | 0 | Regla del ámbar |
| Mega menú, Locaciones, Montaje, fotogramas | 0 (se reutilizan las portadas a 640 / 1920 px) | — |
| Copias desenfocadas para el rack focus | 0 generaciones (exportación automática de 320 px con blur) | Toma compartida |

**Total:** +4 placas grandes y +5 recortes sobre las 86 de D.
**Orden de producción:** `home-hero` (y la firma real) → `cta-amanecer` → gemelas → panorámica → portadas de agentes, Kommo, consultoría, Kain y Discovery → el resto según D.

### 9.2 Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Kain distinto entre más de 90 imágenes | Siempre las 3 referencias `kain-body-*`, semilla fija por serie, rechazo inmediato de antenas, ojos o asterisco incorrectos (checklist B §7). Una sola persona aprueba todas las placas. |
| Las gemelas A/B no coinciden | B se genera **como edición** de A y se verifica con `difference`. Plan B: el haz de luz es más ancho (80 px) y disimula hasta 10 px de desfase. |
| Uniones visibles en la panorámica | Estaciones por separado con el mismo horizonte y el mismo riel, fundidos de 300 px en Photoshop, grano global encima. Plan B: el motion de Remotion de D. |
| Cansancio por las secuencias fijadas | Máximo 2 por página, recorrido total ≤ 4.7 pantallas en el inicio, snap en el travelling, "Saltar escena" y "modo sala" sin interfaz. |
| La firma se vuelve molesta | Una vez por sesión, ≤ 2.8 s, se salta con cualquier gesto, solo en `/`. |
| Webm con alfa en Safari | Las poses de Kain son PNG/AVIF con fundido cruzado. Si se usa video con alfa, HEVC `.mov` para Safari y VP9 `.webm` para los demás. |
| View Transitions sin soporte (Firefox) | Navegación normal + mini firma. No se rompe nada. |
| Horas narrativas leídas como datos | `aria-hidden`, en mono y muted, sin cifras de negocio al lado. La única hora ligada a un dato (11:48 p. m. → 12 s) lleva su fuente. |
| LCP con el iris encima | La placa nunca va en opacidad 0. Se mide en campo con `web-vitals`. Si el LCP se reporta tarde, el iris pasa a pintarse dentro de un `<canvas>` vacío (sin afectar la placa). |
| "Imágenes en cajas" dentro de las tarjetas | Los fotogramas no tienen borde duro (filo en degradado y máscara inferior) y siempre llevan corte por coincidencia: se leen como "pasar a la siguiente escena", no como una foto pegada. |

### 9.3 Lista de verificación adicional (suma a B §7)

- [ ] Las anclas caen sobre su objetivo (±8 px) a 375, 768, 1024, 1440, 1920 y 2560 px.
- [ ] El estado final de la firma es idéntico a la portada sin intro (captura con `?replay` a los 5 s contra reduced motion).
- [ ] Cada secuencia fijada tiene "Saltar escena", su contenido completo en el DOM y una versión estática con reduced motion.
- [ ] No hay más de un `.btn` azul visible por pantalla (revisar a 390 × 844 y 1440 × 900).
- [ ] No hay ninguna zona de más de 40vh sin luz (sin sujeto, aura ni horizonte).
- [ ] Las cifras del montaje son texto real y pasan contraste con la capa en `screen`.
- [ ] El encabezado y la barra móvil se esconden durante las secuencias fijadas y vuelven al salir.
- [ ] Los fotogramas con `data-still` hacen el corte por coincidencia en Chrome y Safari, y navegan normal en Firefox.

### 9.4 Preguntas para el cliente

1. ¿Aprueba la narrativa del "turno de noche" (horas en el HUD, de 23:47 a 06:00) en el inicio?
2. ¿Está bien mostrar a un dueño de negocio (persona generada) en la escena de dolor en ámbar?
3. ¿Hay presupuesto para el ciclo de caminata de Kain en video (fase 2 del travelling), o bastan las 5 poses?
4. ¿Confirma la línea "Construimos empresarios libres, no héroes cansados." para el cierre del footer?
5. ¿Acepta la hora azul en lugar del atardecer cálido para el caso de Monterrey?
6. ¿Acepta voltear horizontalmente algunas placas de industria en "Locaciones" (sin texto en ellas)?
7. Más las pendientes de D §15 (teléfono único, detalles de los casos, historia de la empresa, etc.).

---

## 10. Archivos de este concepto

| Archivo | Qué es |
|---|---|
| `concepto-cinematic.md` | Este documento |
| `concepto-cinematic-prototipo.html` | Prototipo funcional: escenario registrado + firma "Del nodo al pecho" + portada con chip anclado. Usa `../../vendor/gsap.min.js` (3.13), las fuentes locales y `../discovery/kain-01-hero.png` como placa provisional. Ábrelo con `?replay` para repetir la intro. Es para escritorio; en móvil necesita la placa 9:16. |
| `concepto-cinematic-storyboard.jpg` | 6 cuadros de la firma (0.35 / 0.95 / 1.4 / 1.8 / 2.35 / 2.8 s) capturados en tiempo real con Chrome headless, más la portada final |
| `concepto-cinematic-portada-1440.jpg` | La portada final a 1440 × 900 (con imagen provisional) |
