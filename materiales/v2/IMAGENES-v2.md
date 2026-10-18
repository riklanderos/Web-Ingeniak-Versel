# IMÁGENES v2 · Plan de producción de placas cinematográficas

> Plan de imágenes de ingeniak.mx v2. Datos completos en `IMAGENES-v2.json` (un objeto por placa, en orden de producción). Fecha: 18 de octubre de 2026.
> **Revisión crítica r1 (18-oct-2026):** 6 portadas suben a P1, respaldo de lanzamiento para cada placa P2, placa nueva `discovery-vsl-poster`, tope de `srcset` por uso, regreso al set con encuadre propio y sesión de fotos del equipo como requisito. Detalle y motivos en `ESPEC-v2.md` §12. Los datos ya están aplicados en `IMAGENES-v2.json` (campos `revision`, `launchFallback`, `uses[].srcsetMax`, `uses[].push`).
> Fuentes: `ESPEC-v2.md` (§3 `ImageSection`, §5 plantillas, §9 producción), `D-sitemap.json` (45 páginas), `concepto-cinematic.md` §8, `materiales/magnific/v2/RECETA.md` y la guía del personaje `Guia_Personaje_KAIN_IA.md`.

**El requisito del cliente que manda aquí:** en cada portada y cada sección de texto + imagen, la imagen ES el fondo de la sección: el sujeto (Kain o una persona) de un lado y el texto y los botones del otro, sobre una penumbra que la propia imagen trae generada. Nada de dos columnas ni de dos cajas. Por eso **cada placa se genera ya con su zona de texto vacía** y con los bordes cayendo a `#03040B`, el mismo color de la página.

## Resumen

| | |
|---|---|
| Placas del plan | **61** (P1: 52 · P2: 9) · r1: toda portada es P1 y cada placa P2 tiene respaldo de lanzamiento |
| Trabajo por placa | 55 generaciones nuevas · 3 ediciones de una placa base (2 gemelas + el póster limpio del VSL) · 2 composiciones con fotos reales del equipo · 1 aprobada (solo derivados) |
| Sujeto | 26 Kain · 17 Kain + persona del sector secundaria · 14 personas ilustrativas · 2 equipo real · 2 sin sujeto |
| Lado del sujeto | 35 derecha · 23 izquierda · 2 centro · 1 sin sujeto, y además el espejo por CSS (`mirror: true`) |
| Secciones cubiertas | **149 secciones de imagen** en 44 páginas: las 120 secciones cinematográficas de `D-sitemap.json` (incluidos los 43 cierres) + 28 que agrega ESPEC (estaciones, señales, cómo funciona, VKTOR, locaciones, montaje) + 1 de r1 (`/discovery/#video`). 148 llevan placa; 1 queda sin placa por decisión de ESPEC (`/servicios/agentes-ia-whatsapp/#si-no`). |
| Por qué 60 y no 86 | D pedía 86 escenas. Se consolidan con reglas fijas (ver §2.3): cierres compartidos, estaciones del inicio que son portadas de servicio, escenas de industria que son el "resultado" de su caso, placas de dolor por tipo de dolor y artículos que reutilizan la portada de su tema. Así se cubren las 148 secciones con 60 placas sin perder la escena propia en ninguna portada importante. |

## 1. Decisiones (y cómo se concilian con ESPEC)

| # | Tema | Decisión | Por qué |
|---|---|---|---|
| 1 | Proporción de escritorio | **16:9** (render ≈1376×768 → upscale 2× → **2752×1536**), igual que el hero aprobado. | La receta de Magnific aprobada se validó en 16:9 y la tarea la pide así. ESPEC F3 pedía 21:9 para placas nuevas para no cortar pies a 2560×1080, pero el tope de ultra ancho de ESPEC §3.5 ya se probó con la placa 16:9 aprobada a 2560×1080 sin cortar pies ni antenas. Todas las coordenadas van en fracciones: si el equipo de build prefiere 21:9, se usa el mismo prompt cambiando "16:9" por "21:9" y las fracciones no cambian. |
| 2 | Proporción móvil | **4:5** (master 1536×1920, export 1080×1350): 40 % superior vacío para el texto y el sujeto en el 60 % inferior. | Lo pide la tarea y coincide con ESPEC §3.6 (texto arriba, sujeto abajo). Única excepción: `home-hero` conserva su 9:16 aprobado. Comprobado por cálculo a 390×844: la placa mide 390×487 y la cabeza del sujeto queda en y≈571 px; eyebrow, H1 de 3 líneas, deck y CTA de 52 px caben arriba (≈420 px). |
| 3 | Móvil nunca es un recorte | La vertical se **genera** con el escritorio elegido como primera referencia ("camera pulled far back"). Nunca `images_expand`. | ESPEC §3.6 y RECETA (expand mete texto basura). |
| 4 | Casting | **Kain por defecto** (servicios, hubs, producto, cierres). **Industrias:** Kain en el ambiente del sector con una persona del sector **secundaria y desenfocada** a su lado del cuadro. **Casos:** persona ilustrativa **siempre a la derecha** (la cifra gigante va a la izquierda). **Dolor:** persona en luz ámbar. **Nosotros/equipo:** fotos reales compuestas, sin generar personas. | Tarea + ESPEC F11. Las personas generadas llevan siempre "IMAGEN ILUSTRATIVA DEL SECTOR" y nunca se presentan como clientes. |
| 5 | Antenas de Kain | "Two thin silver antennas", **sin** puntas brillantes. | La guía del personaje y los recortes oficiales no tienen puntas luminosas; ESPEC §9.3 las agregaba. Mandan las referencias. |
| 6 | Vestuario | Solo donde suma y sin tocar la cabeza ni tapar el asterisco: bata de doctor (validada), saco navy abierto (consultoría), chaleco de seguridad abierto **sin casco** (industrial), mandil negro (HoReCa). | Guía del personaje: "agrega la prenda sin cambiar la cabeza ni el asterisco". |
| 7 | Alternancia | Dentro de cada página, dos escenas de imagen seguidas nunca tienen al sujeto del mismo lado. Se resuelve con el lado de generación y con `mirror: true` (permitido: no hay texto ni logos en las placas y Kain es simétrico). Las fotos reales del equipo **no se espejan**. | Requisito de la tarea + ESPEC §3.2. El script de este plan revisó las 44 páginas: cero choques. Excepciones conscientes: el selector de industrias y el montaje no son `ImageSection`, y las fases de VKTOR son la misma toma que la portada. |
| 8 | Cierres | `cta-amanecer` (y su espejo) en casi todo el sitio; `cta-duena-tranquila` donde D la asigna; `cta-equipo` = fotos reales detrás del horizonte del amanecer; Discovery tiene su gemela propia. El espejo de cada cierre se decide por alternancia, no por la variante "saluda/señala" de D (anotado en el mapa). | ESPEC F14. |
| 9 | Equipo a la izquierda | `equipo-real` va a la izquierda (ESPEC lo ponía a la derecha). | En el inicio queda entre VKTOR (derecha) y el amanecer (derecha); como las fotos reales no se espejan, es la única forma de alternar. |
| 10 | /nosotros/ | Su cierre pasa de `cta-equipo` a `cta-amanecer` en espejo. | Evita mostrar al mismo equipo dos veces en la misma página. |
| 11 | /contacto/ | Usa `home-kain` (Kain saludando junto al teléfono = "Escríbele a Kain") en lugar de la asesora generada de D. | Una persona generada en Contacto sugiere una empleada que no existe. |
| 12 | Escenas intermedias de servicio | Las escenas de Kain de D (CRM vivo, agente en el chat, calendario, este sitio, cómo medimos, Kain ejemplo, tablero) se vuelven **regreso al set**: la misma placa de la portada con `push` hacia la superficie de cristal y otra UI encima. | ESPEC §9.2 ya re-compone esos briefs como portada; generar otra placa del mismo set duplicaría trabajo. Ampliación opcional: un primer plano propio por servicio en una fase 3. |
| 13 | VKTOR · fases | `VktorSequence` se filma sobre `metodologia-hero` (la cámara sube escalón por escalón). | Plano secuencia real, cero placas extra. Ampliación opcional P3: serie de 5 placas de fase. **r1:** ESPEC adopta esta decisión y baja el recorrido fijado a +250 %. |
| 14 | r1 · Portadas | **Toda portada es P1.** Suben `paginas-web-hero`, `seo-hero`, `branding-hero`, `tecnologias-hero`, `art-agente-chatbot-hero` y `404-hero`. | Una página no puede salir sin su portada; las P2 que quedan son escenas intermedias. |
| 15 | r1 · Respaldo de lanzamiento | `dolor-anuncios` → `dolor-operacion`; `ind-*-kain-sector` → `home-sistema-2-atender` en espejo (Kain con teléfono de cristal en blanco, a la izquierda). Campo `launchFallback`. | Si una P2 no está aprobada al lanzar, la sección sale con una placa P1 del mismo tono, nunca sin imagen ni en una caja. |
| 16 | r1 · Regreso al set | Las 8 escenas intermedias que repiten la placa de su portada (`crm-vivo`, `agente-chat`, `calendario`, `este-sitio`, `dashboard`, `como-medimos`, `kain-ejemplo`, `vktor-cine`) entran **ya** en `--cam 1.35` hacia la superficie y llegan a 1.6 (campo `uses[].push`). | Sin eso, la misma composición aparece dos veces en la página y se lee como imagen repetida, no como plano secuencia. |
| 17 | r1 · Peso | `uses[].srcsetMax`: 2752 solo en portadas, escenas con push (regreso al set, Conoce a Kain, ChatSim fijado de industrias) y VktorSequence; 1920 en el resto (cierres, señales, cómo funciona, gemelas y estaciones del inicio, resultados de caso). Móvil: hasta 1080 salvo portadas (1536). | Con densidad 2× a 1440 px el navegador pedía la de 2752 en todas las escenas: estimado ≈ 4.4 MB de imagen al recorrer el inicio completo (≈ 3.7 MB con el tope). |
| 18 | r1 · Póster del VSL | Placa nueva `discovery-vsl-poster` (edición de un cuadro del VSL sin texto). | `vsl-poster.jpg` trae el título horneado con una errata visual ("¿qué sedetiene?") y subtítulos quemados: no puede ser fondo de sección. |
| 19 | r1 · Equipo | La **sesión de fotos real** del equipo es requisito P1. La composición con los retratos actuales (900 px, placa de nombre, fondo con "X") queda solo como respaldo. | Seis recortes de 900 px compuestos sobre niebla tienden a verse como collage: justo lo contrario de "premium". |

## 2. Biblia de la serie (todas las placas se ven como una sola película)

### 2.1 Cámara, luz y gradado

| Parámetro | Kain (render 3D) | Personas (foto editorial) |
|---|---|---|
| Lente | 50 mm, f/2.8 (35 mm f/4 solo en planos de paisaje: metodología, amanecer, riel) | 50 mm, f/2.0 |
| Cámara | A la altura del pecho de Kain, contrapicado leve | A la altura de los ojos |
| Luz | **Una** luz: contraluz cian `#00E5FF` + azul `#0055FF` desde atrás del sujeto, niebla volumétrica; relleno índigo `#455DFF` suave **desde el lado del texto** (la luz "sale" del titular) | Borde frío cian/azul en pelo y hombros, relleno índigo desde el lado del texto |
| Gradado | Sombras navy `#0A1F4C` que caen a `#03040B`; altas en cian y azul; grano sutil; HDR | Azul monocromo, sombras navy profundas, altas cian, grano fino |
| Piso | Negro brillante con reflejo del sujeto (línea de piso en y≈0.86) | Piso o niebla que cae a negro |
| Ámbar `#FFB547` | Nunca | **Solo** en placas de dolor: una fuente práctica (celular, lámpara, pantalla) |
| Cálidos | Prohibidos (ni atardecer dorado, ni velas, ni guirnaldas cálidas): se cambian por hora azul o amanecer frío | Ídem |

### 2.2 Composición

```
ESCRITORIO 16:9 · subject-right (subject-left = espejo)        MÓVIL 4:5
┌──────────────────────────────────────────────┬────────────┐  ┌──────────────┐
│ PENUMBRA DE TEXTO  x 0–0.55                  │  SUJETO    │  │ VACÍO 0–40 % │
│ navy #0A1F4C → #03040B, niebla tenue,        │ x 0.60–0.95│  │ eyebrow · H1 │
│ sin objetos, sin luces, sin partículas       │ Kain centro│  │ deck · CTA   │
│                                              │ x≈0.72     ├┐ │──────────────│
│ eyebrow · H1 · deck · CTAs (sin caja)        │ antenas    ││ │  SUJETO      │
│                                    transición│ y≈0.12     ││ │  60 % abajo  │
│                                   x 0.55–0.60│ pies y≈0.86││ │  cabeza 0.45 │
│ ───────────── piso / línea base de CTAs y≈0.86 ───────────┘│ │  pies  0.87  │
└──────────────────────────────────────────────┴────────────┘  └──────────────┘
 los 4 bordes caen a #03040B en el último 7 %                    piso → #03040B
```

- **Superficie de cristal en blanco** (cuando la escena lleva UI registrada): plana, frontal y vacía, **entre el sujeto y la penumbra** (x≈0.56–0.70 si el sujeto va a la derecha), y Kain se corre a x≈0.78. Ahí se ancla la UI en HTML (chat, kanban, calendario, tablero) y siempre lleva `SIMULACIÓN`.
- **Persona secundaria** (industrias): desenfocada, más chica por profundidad, en x 0.82–0.92 del lado del sujeto. Nunca entra a la penumbra.
- **subject-center** (solo `/kain/`): Kain al centro; tercios laterales y el 28 % inferior limpios para H1 (abajo izquierda) y CTAs (abajo derecha).
- **Metodología:** la zona limpia es el cuadrante superior izquierdo (texto con `align: start`).
- Las coordenadas de cada placa están en `desktop.zones` y `desktop.anchorsPlanned` del JSON. Son **metas de composición**: después de aprobar, se miden sobre el render final en `/dev/registro/` y se guardan en `src/data/plates.json` (ESPEC §3.4).

### 2.3 Reglas de consolidación (cómo 60 placas cubren 148 secciones)

| Regla | Placas | Secciones que cubren |
|---|---|---|
| Las 5 estaciones del sistema del inicio **son** las portadas de sus servicios (corte por coincidencia entre páginas) | `home-sistema-1…5` | Inicio ESC 05 + portadas de paid media, agentes de WhatsApp, CRM con IA, n8n y software (+ sus escenas intermedias por push-in) + 3 artículos |
| Cierres compartidos | `cta-amanecer`, `cta-duena-tranquila`, `cta-equipo` | 42 cierres (el de /discovery/ tiene placa propia) |
| Dolor por tipo de dolor (los 4 del inicio) | `home-problema-a`, `dolor-crm`, `dolor-operacion`, `dolor-anuncios` | "Señales" de los 11 servicios |
| La escena "Así trabaja Kain" de cada industria es también el "Resultado" de su caso | `ind-*-kain-sector` | 8 industrias + 4 casos |
| Las portadas de caso ilustran el caso dentro de su servicio | `caso-logistica-hero`, `caso-horeca-hero` | n8n y paid media |
| Artículos con el tema de una portada existente | `home-sistema-2`, `home-sistema-4` (espejo), `servicios-no-se` (espejo), `kommo-hero`, `gohighlevel-hero` | 5 de 6 artículos |
| Una placa, dos páginas del mismo tono | `kain-si-no` (/kain/ + FAQ), `nosotros-manifiesto` (/nosotros/ + Guadalajara en espejo), `home-kain` (inicio + contacto), `metodologia-hero` (inicio, metodología, fases y consultoría) | 10 secciones |

## 3. Bloques de prompt (ya están expandidos dentro de cada prompt del JSON)

**Personaje `{KAIN}`** (sale de la guía del personaje; se pega completo, sin resumir):
```
KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor
```

**Sin texto (Kain / personas):**
```
Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank.
Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface.
```

**Cola de "evitar" (Nano Banana Pro no tiene campo negativo en Magnific, por eso va dentro del prompt):**
```
Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```

**Negativo completo** (campo `negative` del JSON, para modelos que sí lo aceptan): `text, letters, words, numbers, digits, watermark, signature, logo, brand mark, signage, icons, UI with readable text, holographic panels with text, charts with numbers or axes, labels on bottles or boxes, hard frame edges, border, vignette frame, split screen, collage, duplicate subject, lens flare on the text side, light sources on the text side, busy background on the text side` + Kain: `black robot, graphite robot, dark robot, red eyes, extra robots, second robot, missing antennas, extra antennas, glowing antenna balls, human teeth or mouth on the robot, cartoon, flat illustration, chibi anime, low-poly, toy plastic look, cropped feet, cropped antennas, cut-off body, chest screen hidden, warm light, orange sunset` + personas: `robot, extra people in focus, distorted hands, extra fingers, plastic skin, heavy beauty retouch, stock-photo smile, cropped head, celebrity likeness, warm light, orange sunset` + dolor: `robot, cyan light on the face, extra people in focus, distorted hands, extra fingers, plastic skin, melodramatic crying, cropped head, celebrity likeness`.

## 4. Biblioteca de referencias

| Clave | Archivo (ruta exacta) | ID Magnific | Para qué |
|---|---|---|---|
| `K_PRESENTA` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` | `s7TThool8e` | Identidad de Kain (pose presentar). Siempre primero en placas con Kain. |
| `K_SALUDA` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saluda.png` | — | Pose: saludar con la mano levantada. |
| `K_SALUDO_FIN` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saludo-final.png` | — | Pose: saludo amplio de cierre. |
| `K_SENALA` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-senala.png` | — | Pose: señalar hacia un lado. |
| `K_BRAZOS` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-brazos-cruzados.png` | — | Pose: brazos cruzados bajo la pantalla del pecho. |
| `K_DOCTOR` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-doctor-recorte.png` | — | Vestuario validado: bata blanca abierta + estetoscopio (pantalla del pecho visible). |
| `K_DOCTOR_2` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-doctor-brazos-cruzados.png` | — | Vestuario de doctor, segunda vista. |
| `K_BODY_PRES` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` | — | Cuerpo completo sobre negro (proporciones y juntas). |
| `K_BODY_BRAZ` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-brazos.jpg` | — | Cuerpo completo sobre negro, brazos cruzados. |
| `K_BODY_TOCA` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` | — | Cuerpo completo sobre negro, mano que toca/señala. |
| `K_BODEGA` | `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-en-bodega.jpg` | — | Kain en un ambiente industrial real (escala y luz de bodega). |
| `S_HERO` | `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` | `jUccthULD0` | Hero aprobado: lente, gradado, piso y penumbra de la serie. |
| `S_HERO_M` | `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` | — | Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo). |
| `S_SCENE` | `/Users/riklanderos/Web Ingeniak Versel/materiales/discovery/kain-01-hero.png` | `5jAAdVBKxe` | Escena de estilo Kain (contraluz, niebla, piso). |
| `S_STEPS` | `/Users/riklanderos/Web Ingeniak Versel/materiales/discovery/kain-03-cuatro-a.png` | — | Losas de cristal en escalera (solo metodología). |
| `ISOTIPO` | `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/isotipo-cristal-A.png` | `1lnnyc0r4r` | Isotipo de cristal (solo si la escena muestra el logo; aquí solo se usa en el hero aprobado). |
| `TEAM` | `/Users/riklanderos/Web Ingeniak Versel/materiales/equipo/{rik-landeros,alonso-vega,cesar-ovalle,richard-vela,andy-pizano,marcos-gonzalez}-*.webp` | — | Fotos reales del equipo (solo composición). |
| Render elegido | `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/<id>/<id>-desk.png` · `<id>-movil.png` | — | Se crea al aprobar cada placa; es la 1.ª referencia de su versión móvil, de su gemela o de su serie. |

**Orden de adjuntos en placas con Kain (máx. 4):** 1) recorte de pose (`K_PRESENTA` u otra pose), 2) vestuario o pose específica, 3) cuerpo completo `K_BODY_PRES`/`K_BODY_TOCA`, 4) `S_HERO` (serie). Móvil: 1) render de escritorio elegido, 2) pose, 3) `S_HERO_M`.
**Personas:** escritorio **sin** referencias de imagen (Nano Banana Pro conserva la identidad de la referencia y clonaría la misma cara en toda la serie); móvil con el escritorio elegido como única referencia (misma persona, que es lo que se quiere).

**No adjuntar nunca:**

- `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/Kain_04_Paginas_Web.png` — Tiene titular y UI con letras: contamina con texto.
- `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-login-portada-A-con-texto-1440x1800.png` — Tiene el logotipo kain y texto.
- `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/magnific_cinematic-3d-render-awwwa_5xMCHmCKxe (1).png` — Logotipo "ingeniak" horneado abajo.
- `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/magnific_cinematic-3d-render-awwwa_9RFUO0yNYZ (1).png` — Logotipo "ingeniak" horneado abajo.
- `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/magnific_cinematic-3d-render-awwwa_tf3pBv2mZJ (1).png` — Logotipo "ingeniak" horneado abajo.
- `/Users/riklanderos/Web Ingeniak Versel/materiales/equipo/team-hero-CyZMMz70.jpg` — No es el equipo real: 4 siluetas genéricas frente a una pantalla con letras.
- `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/06_Elementos_Graficos/hero-robot-ingeniak.webp` — Robot negro/grafito (variante descartada).
- `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/06_Elementos_Graficos/sistemas_ingeniak/*` — Heroes del sitio actual con robot negro y titulares horneados.
- `Cualquier foto de persona como referencia de una placa de OTRA persona` — Nano Banana Pro conserva la identidad de la referencia: clonaría el rostro en toda la serie.

## 5. Flujo en Magnific (proyecto "Ingeniak Web v2")

1. **Escritorio:** Nano Banana Pro (`imagen-nano-banana-2`), 16:9, 3 variantes en P1 y 2 en P2, prompt del JSON (`prompt.desktop`) tal cual y referencias en el orden de `references.desktop`.
2. **Elegir** con la lista de aceptación (§8) y guardar como `placas/<id>/<id>-desk.png`. Anotar semilla.
3. **Upscale escritorio:** `images_upscale` creativo 2× — Kain: optimized_for ThreeDRenders, preset subtle, creativity −2, resemblance 6; personas: soft portraits (o standard), creativity −3, resemblance 8. Master 2752×1536.
4. **Móvil:** Nano Banana Pro 4:5 con `prompt.mobile` y el escritorio elegido como primera referencia. Guardar `placas/<id>/<id>-movil.png`, upscale 2×.
5. **Ediciones** (gemelas y placas limpias): modo edición con la placa base como referencia 1; QA con `difference`.
6. **Derivados:** recortes con `remove_background` (mismas dimensiones), placas limpias, copias desenfocadas 320 px (automáticas en el build).
7. **Exportar** AVIF + WebP: escritorio 1280 / 1920 / 2560 / 2752 → `public/img/cine/<id>-<w>`; móvil 640 / 828 / 1080 / 1536 → `public/img/cine/<id>-m-<w>` (nombres de ESPEC §3.5). **r1:** se exportan todos los anchos, pero cada uso solo los publica hasta su `srcsetMax` (2752 o 1920; ESPEC §12 R9).
8. **Registrar** anclas, `safe` y `subject` en `/dev/registro/` → `src/data/plates.json`, y correr `check-contraste.mjs` con el texto real.

**Dependencias de orden:** `home-problema-a` → `-b` · `discovery-hero` → `discovery-cta-final` · `cta-amanecer` → `cta-amanecer-clean` → `cta-equipo` · `home-sistema-1` → estaciones 2–5 · `ind-*-hero` → `ind-*-kain-sector` · escritorio de cada placa → su móvil.

## 6. Orden de producción

### Lote A · P1 · Inicio y cierres compartidos

| # | Placa | Prior. | Tipo | Sujeto · lado | Usos | Primera página |
|---|---|---|---|---|---|---|
| 1 | `home-hero` | P1 | aprobada · kain | derecha | 1 | `/` #hero |
| 2 | `cta-amanecer` | P1 | nueva · kain | derecha | 28 | `/` #cta-final |
| 3 | `home-problema-a` | P1 | nueva · persona | izquierda | 2 | `/` #problema |
| 4 | `home-problema-b` | P1 | edición · kain | izquierda | 1 | `/` #problema |
| 5 | `home-sistema-1-atraer` | P1 | nueva · kain | derecha | 3 | `/` #sistema |
| 6 | `home-sistema-2-atender` | P1 | nueva · kain | derecha | 3 | `/` #sistema |
| 7 | `home-sistema-3-organizar` | P1 | nueva · kain | derecha | 3 | `/` #sistema |
| 8 | `home-sistema-4-automatizar` | P1 | nueva · kain | derecha | 3 | `/` #sistema |
| 9 | `home-sistema-5-medir` | P1 | nueva · kain | derecha | 3 | `/` #sistema |
| 10 | `home-kain` | P1 | nueva · kain | izquierda | 2 | `/` #kain |
| 11 | `metodologia-hero` | P1 | nueva · kain | derecha | 4 | `/` #vktor |
| 12 | `equipo-real` | P1 | foto real · equipo-real | izquierda | 2 | `/` #equipo |
| 13 | `cta-duena-tranquila` | P1 | nueva · persona | izquierda | 10 | `/servicios/consultoria-ia-empresas/` #cta-final |
| 14 | `cta-equipo` | P1 | foto real · equipo-real | derecha | 4 | `/servicios/branding/` #cta-final |

### Lote B · P1 · Servicios clave, producto, conversión y hubs

| # | Placa | Prior. | Tipo | Sujeto · lado | Usos | Primera página |
|---|---|---|---|---|---|---|
| 15 | `kommo-hero` | P1 | nueva · kain | izquierda | 3 | `/kommo/` #hero |
| 16 | `consultoria-hero` | P1 | nueva · kain | derecha | 1 | `/servicios/consultoria-ia-empresas/` #hero |
| 17 | `kain-hero` | P1 | nueva · kain | centro | 1 | `/kain/` #hero |
| 18 | `discovery-hero` | P1 | nueva · persona | derecha | 1 | `/discovery/` #hero |
| 19 | `discovery-cta-final` | P1 | edición · kain+persona | derecha | 1 | `/discovery/` #cta-final |
| 20 | `discovery-para-quien` | P1 | nueva · persona | izquierda | 1 | `/discovery/` #para-quien |
| 20b | `discovery-vsl-poster` (r1) | P1 | edición · sin sujeto | centro | 1 | `/discovery/` #video |
| 21 | `gohighlevel-hero` | P1 | nueva · kain | derecha | 3 | `/gohighlevel/` #hero |
| 22 | `dolor-crm` | P1 | nueva · persona | izquierda | 3 | `/servicios/crm-con-ia/` #senales |
| 23 | `dolor-operacion` | P1 | nueva · persona | izquierda | 3 | `/servicios/consultoria-ia-empresas/` #senales |
| 24 | `servicios-hero` | P1 | nueva · kain | derecha | 1 | `/servicios/` #hero |
| 25 | `servicios-no-se` | P1 | nueva · kain | izquierda | 2 | `/servicios/` #no-se |
| 26 | `riel-servicios` | P1 | nueva · sin-sujeto | — | 12 | `/servicios/` #conexion |
| 27 | `kain-si-no` | P1 | nueva · kain | izquierda | 2 | `/kain/` #si-no |
| 28 | `guadalajara-hero` | P1 | nueva · persona | derecha | 1 | `/agentes-ia-guadalajara/` #hero |
| 29 | `nosotros-manifiesto` | P1 | nueva · kain | derecha | 2 | `/nosotros/` #manifiesto |
| 30 | `blog-hero` | P1 | nueva · persona | derecha | 1 | `/blog/` #hero |

### Lote C · P1 · Portadas que el inicio reutiliza (industrias y casos) y sus hubs

| # | Placa | Prior. | Tipo | Sujeto · lado | Usos | Primera página |
|---|---|---|---|---|---|---|
| 31 | `industrias-hero` | P1 | nueva · kain | derecha | 1 | `/industrias/` #hero |
| 32 | `ind-salud-hero` | P1 | nueva · kain+persona | derecha | 3 | `/` #industrias |
| 33 | `ind-belleza-hero` | P1 | nueva · kain+persona | derecha | 3 | `/` #industrias |
| 34 | `ind-nutricion-hero` | P1 | nueva · kain+persona | derecha | 3 | `/` #industrias |
| 35 | `ind-finanzas-hero` | P1 | nueva · kain+persona | derecha | 3 | `/` #industrias |
| 36 | `ind-inmobiliario-hero` | P1 | nueva · kain+persona | derecha | 3 | `/` #industrias |
| 37 | `ind-industrial-hero` | P1 | nueva · kain+persona | derecha | 3 | `/` #industrias |
| 38 | `ind-retail-hero` | P1 | nueva · kain+persona | derecha | 3 | `/` #industrias |
| 39 | `ind-horeca-hero` | P1 | nueva · kain+persona | derecha | 3 | `/` #industrias |
| 40 | `casos-hero` | P1 | nueva · kain | izquierda | 1 | `/casos/` #hero |
| 41 | `caso-dental-hero` | P1 | nueva · persona | derecha | 2 | `/` #casos |
| 42 | `caso-retail-hero` | P1 | nueva · persona | derecha | 2 | `/` #casos |
| 43 | `caso-ecommerce-hero` | P1 | nueva · persona | derecha | 2 | `/` #casos |
| 44 | `caso-horeca-hero` | P1 | nueva · persona | derecha | 3 | `/` #casos |
| 45 | `caso-logistica-hero` | P1 | nueva · persona | derecha | 3 | `/` #casos |

### Lote D · P2 · Resto de servicios, escenas de industria/caso y páginas secundarias

| # | Placa | Prior. | Tipo | Sujeto · lado | Usos | Primera página |
|---|---|---|---|---|---|---|
| 46 | `dolor-anuncios` | P2 | nueva · persona | izquierda | 4 | `/servicios/paid-media/` #senales |
| 47 | `paginas-web-hero` | **P1 (r1)** | nueva · kain | izquierda | 2 | `/servicios/paginas-web/` #hero |
| 48 | `seo-hero` | **P1 (r1)** | nueva · kain | derecha | 2 | `/servicios/seo/` #hero |
| 49 | `branding-hero` | **P1 (r1)** | nueva · kain | izquierda | 2 | `/servicios/branding/` #hero |
| 50 | `ind-salud-kain-sector` | P2 | nueva · kain+persona | izquierda | 2 | `/industrias/salud/` #kain-sector |
| 51 | `ind-belleza-kain-sector` | P2 | nueva · kain+persona | izquierda | 1 | `/industrias/belleza-estetica/` #kain-sector |
| 52 | `ind-nutricion-kain-sector` | P2 | nueva · kain+persona | izquierda | 1 | `/industrias/nutricion/` #kain-sector |
| 53 | `ind-finanzas-kain-sector` | P2 | nueva · kain+persona | izquierda | 1 | `/industrias/finanzas/` #kain-sector |
| 54 | `ind-inmobiliario-kain-sector` | P2 | nueva · kain+persona | izquierda | 1 | `/industrias/inmobiliario/` #kain-sector |
| 55 | `ind-industrial-kain-sector` | P2 | nueva · kain+persona | izquierda | 2 | `/industrias/industrial-logistica/` #kain-sector |
| 56 | `ind-retail-kain-sector` | P2 | nueva · kain+persona | izquierda | 2 | `/industrias/retail-ecommerce/` #kain-sector |
| 57 | `ind-horeca-kain-sector` | P2 | nueva · kain+persona | izquierda | 2 | `/industrias/horeca/` #kain-sector |
| 58 | `tecnologias-hero` | **P1 (r1)** | nueva · kain | derecha | 1 | `/tecnologias/` #hero |
| 59 | `art-agente-chatbot-hero` | **P1 (r1)** | nueva · kain | derecha | 1 | `/blog/agente-ia-whatsapp-vs-chatbot/` #hero |
| 60 | `404-hero` | **P1 (r1)** | nueva · kain | derecha | 1 | `/404` #hero |

## 7. Mapa de cobertura (página → sección → placa)

Lado = lado del sujeto ya con espejo aplicado (`R` derecha, `L` izquierda, `C` centro). "Origen" indica si la sección viene de `D-sitemap.json` o la agrega ESPEC.

| Página | Sección | Placa | Lado | Espejo | Componente | Origen | Nota |
|---|---|---|---|---|---|---|---|
| `/` | Portada (`hero`) | `home-hero` | R |  | ColdOpen + ImageSection hero | D | Placa aprobada (no se regenera). |
| `/` | El problema (`problema`) | `home-problema-a` + `home-problema-b` | L |  | TwinScene | D | A ámbar → barrido de luz → B cian. |
| `/` | El sistema Ingeniak (`sistema`) | `home-sistema-1-atraer`, `home-sistema-2-atender`, `home-sistema-3-organizar`, `home-sistema-4-automatizar`, `home-sistema-5-medir` | R |  | SystemRuntime | ESPEC | 5 estaciones (fijada en escritorio; 5 ImageSection apiladas en móvil). |
| `/` | Conoce a Kain (`kain`) | `home-kain` | L |  | ImageSection mid + ChatSim | D | Push-in hacia el teléfono. |
| `/` | Casos de éxito (`casos`) | `caso-dental-hero`, `caso-retail-hero`, `caso-ecommerce-hero`, `caso-horeca-hero`, `caso-logistica-hero` | — |  | Montage | ESPEC | Portadas de caso dentro de las letras (sin lado). |
| `/` | Metodología VKTOR™ (`vktor`) | `metodologia-hero` | R |  | ImageSection mid + cutout + GhostWord | ESPEC | ESC 09. |
| `/` | Industrias (`industrias`) | `ind-salud-hero`, `ind-belleza-hero`, `ind-nutricion-hero`, `ind-finanzas-hero`, `ind-inmobiliario-hero`, `ind-industrial-hero`, `ind-retail-hero`, `ind-horeca-hero` | R |  | LocationSwitcher | ESPEC | Fondo a sangre del sector activo (todas las portadas de industria tienen a Kain a la derecha; no requieren espejo). No es ImageSection: no cuenta para la alternancia. |
| `/` | El equipo (`equipo`) | `equipo-real` | L |  | ImageSection mid + Credits | D | Equipo real a la izquierda (cambio frente a ESPEC: alterna con 09 y 13). |
| `/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/servicios/` | Portada (`hero`) | `servicios-hero` | R |  | ImageSection hero | D |  |
| `/servicios/` | Cómo se conectan (`conexion`) | `riel-servicios` | — |  | SystemFlow | ESPEC | Placa sin sujeto. |
| `/servicios/` | ¿No sabes por dónde empezar? (`no-se`) | `servicios-no-se` | L |  | ImageSection mid | D |  |
| `/servicios/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D | D/ESPEC pedían espejo; va sin espejo para alternar con "no-se" (izquierda). |
| `/servicios/consultoria-ia-empresas/` | Portada (`hero`) | `consultoria-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/servicios/consultoria-ia-empresas/` | Señales de que lo necesitas (`senales`) | `dolor-operacion` | L |  | ImageSection mid tone=dolor | ESPEC | Sección nueva de ESPEC. |
| `/servicios/consultoria-ia-empresas/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/consultoria-ia-empresas/` | Del diagnóstico a producción (`vktor-cine`) | `metodologia-hero` | R |  | ImageSection mid | D | Push hacia el escalón 1 (V · Verificamos tu operación). Sustituye a la placa de D con dos personas. |
| `/servicios/consultoria-ia-empresas/` | Cierre (`cta-final`) | `cta-duena-tranquila` | L |  | Dawn | D |  |
| `/servicios/agentes-ia-whatsapp/` | Portada (`hero`) | `home-sistema-2-atender` | R |  | SharedTake + ImageSection hero | D | Corte por coincidencia con la estación Atender del inicio. |
| `/servicios/agentes-ia-whatsapp/` | Señales de que lo necesitas (`senales`) | `home-problema-a` | L |  | ImageSection mid tone=dolor | ESPEC | Mensajes sin responder. |
| `/servicios/agentes-ia-whatsapp/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/agentes-ia-whatsapp/` | Lo que sí hace y lo que no (`si-no`) | — (sin placa) | — |  | TwoColumnScript | D | Sin placa en v2 (ESPEC §5.2 #06). El brief de Kain de D quedó absorbido por la portada. |
| `/servicios/agentes-ia-whatsapp/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/servicios/crm-con-ia/` | Portada (`hero`) | `home-sistema-3-organizar` | R |  | SharedTake + ImageSection hero | D | Corte por coincidencia con la estación Organizar. |
| `/servicios/crm-con-ia/` | Señales de que lo necesitas (`senales`) | `dolor-crm` | L |  | ImageSection mid tone=dolor | ESPEC | Un CRM que nadie usa. |
| `/servicios/crm-con-ia/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/crm-con-ia/` | Un CRM vivo (`crm-vivo`) | `home-sistema-3-organizar` | R |  | ImageSection mid + UI kanban | D | Regreso al set: misma placa de la portada con `push` hacia la superficie de cristal; la UI registrada cambia al contenido de esta sección (plano secuencia, sin placa nueva). |
| `/servicios/crm-con-ia/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D |  |
| `/kommo/` | Portada (`hero`) | `kommo-hero` | L |  | SharedTake + ImageSection hero + KommoBadge | D |  |
| `/kommo/` | Señales de que lo necesitas (`senales`) | `dolor-crm` | R | sí | ImageSection mid tone=dolor | ESPEC |  |
| `/kommo/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/kommo/` | Agente de IA dentro del chat (`agente-chat`) | `kommo-hero` | L |  | ImageSection mid + ChatSim | D | Regreso al set: misma placa de la portada con `push` hacia la superficie de cristal; la UI registrada cambia al contenido de esta sección (plano secuencia, sin placa nueva). |
| `/kommo/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/gohighlevel/` | Portada (`hero`) | `gohighlevel-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/gohighlevel/` | Señales de que lo necesitas (`senales`) | `dolor-crm` | L |  | ImageSection mid tone=dolor | ESPEC |  |
| `/gohighlevel/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/gohighlevel/` | Citas que se agendan y se confirman solas (`calendario`) | `gohighlevel-hero` | R |  | ImageSection mid + UI calendario | D | Regreso al set: misma placa de la portada con `push` hacia la superficie de cristal; la UI registrada cambia al contenido de esta sección (plano secuencia, sin placa nueva). |
| `/gohighlevel/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D |  |
| `/servicios/automatizacion-n8n/` | Portada (`hero`) | `home-sistema-4-automatizar` | R |  | SharedTake + ImageSection hero | D | Corte por coincidencia con la estación Automatizar. |
| `/servicios/automatizacion-n8n/` | Señales de que lo necesitas (`senales`) | `dolor-operacion` | L |  | ImageSection mid tone=dolor | ESPEC | Todo pasa por ti. |
| `/servicios/automatizacion-n8n/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/automatizacion-n8n/` | Caso: 27 procesos automatizados (`caso`) | `caso-logistica-hero` | R |  | ImageSection mid | D | El caso de los 27 procesos ES el caso de logística: se usa su portada. |
| `/servicios/automatizacion-n8n/` | Cierre (`cta-final`) | `cta-duena-tranquila` | L |  | Dawn | D |  |
| `/servicios/paid-media/` | Portada (`hero`) | `home-sistema-1-atraer` | R |  | SharedTake + ImageSection hero | D | Corte por coincidencia con la estación Atraer. |
| `/servicios/paid-media/` | Señales de que lo necesitas (`senales`) | `dolor-anuncios` | L |  | ImageSection mid tone=dolor | ESPEC | Anuncios que no se traducen en ventas. |
| `/servicios/paid-media/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/paid-media/` | Caso HoReCa: ROAS 4.8× sostenido (`caso`) | `caso-horeca-hero` | R |  | ImageSection mid | D | Caso HoReCa (ROAS 4.8×): se usa su portada. |
| `/servicios/paid-media/` | Cierre (`cta-final`) | `cta-duena-tranquila` | L |  | Dawn | D |  |
| `/servicios/paginas-web/` | Portada (`hero`) | `paginas-web-hero` | L |  | SharedTake + ImageSection hero | D |  |
| `/servicios/paginas-web/` | Señales de que lo necesitas (`senales`) | `dolor-anuncios` | R | sí | ImageSection mid tone=dolor | ESPEC |  |
| `/servicios/paginas-web/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/paginas-web/` | Este sitio es el ejemplo (`este-sitio`) | `paginas-web-hero` | L |  | ImageSection mid + wireframe | D | Regreso al set: misma placa de la portada con `push` hacia la superficie de cristal; la UI registrada cambia al contenido de esta sección (plano secuencia, sin placa nueva). |
| `/servicios/paginas-web/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D | D pedía la variante "señala" (espejo); va sin espejo por alternancia. |
| `/servicios/desarrollo-software/` | Portada (`hero`) | `home-sistema-5-medir` | R |  | SharedTake + ImageSection hero | D | Corte por coincidencia con la estación Medir. |
| `/servicios/desarrollo-software/` | Señales de que lo necesitas (`senales`) | `dolor-operacion` | L |  | ImageSection mid tone=dolor | ESPEC |  |
| `/servicios/desarrollo-software/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/desarrollo-software/` | 1 vista, 7 fuentes (`dashboard`) | `home-sistema-5-medir` | R |  | ImageSection mid + tablero 7 fuentes | D | Regreso al set: misma placa de la portada con `push` hacia la superficie de cristal; la UI registrada cambia al contenido de esta sección (plano secuencia, sin placa nueva). Si el cliente confirma que el e-commerce de CDMX es el del tablero, puede usarse caso-ecommerce-hero. |
| `/servicios/desarrollo-software/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D | D pedía "saluda" (sin espejo); va en espejo por alternancia. |
| `/servicios/seo/` | Portada (`hero`) | `seo-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/servicios/seo/` | Señales de que lo necesitas (`senales`) | `dolor-anuncios` | L |  | ImageSection mid tone=dolor | ESPEC |  |
| `/servicios/seo/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/seo/` | Cómo lo medimos (`como-medimos`) | `seo-hero` | R |  | ImageSection mid + tarjeta de respuesta | D | Regreso al set: misma placa de la portada con `push` hacia la superficie de cristal; la UI registrada cambia al contenido de esta sección (plano secuencia, sin placa nueva). |
| `/servicios/seo/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D |  |
| `/servicios/branding/` | Portada (`hero`) | `branding-hero` | L |  | SharedTake + ImageSection hero | D |  |
| `/servicios/branding/` | Señales de que lo necesitas (`senales`) | `dolor-anuncios` | R | sí | ImageSection mid tone=dolor | ESPEC |  |
| `/servicios/branding/` | Cómo funciona (`como-funciona`) | `riel-servicios` | — |  | SystemFlow | ESPEC |  |
| `/servicios/branding/` | Un personaje que trabaja (`kain-ejemplo`) | `branding-hero` | L |  | ImageSection mid + tablero de identidad | D | Regreso al set: misma placa de la portada con `push` hacia la superficie de cristal; la UI registrada cambia al contenido de esta sección (plano secuencia, sin placa nueva). |
| `/servicios/branding/` | Cierre (`cta-final`) | `cta-equipo` | R |  | Dawn | D |  |
| `/industrias/` | Portada (`hero`) | `industrias-hero` | R |  | ImageSection hero | D |  |
| `/industrias/` | Elige tu sector (`grid`) | `ind-salud-hero`, `ind-belleza-hero`, `ind-nutricion-hero`, `ind-finanzas-hero`, `ind-inmobiliario-hero`, `ind-industrial-hero`, `ind-retail-hero`, `ind-horeca-hero` | R |  | LocationSwitcher | ESPEC | No es ImageSection: no cuenta para la alternancia. |
| `/industrias/` | Cierre (`cta-final`) | `cta-duena-tranquila` | L |  | Dawn | D |  |
| `/industrias/salud/` | Portada (`hero`) | `ind-salud-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/industrias/salud/` | Así trabaja Kain en tu clínica (`kain-sector`) | `ind-salud-kain-sector` | L |  | ImageSection mid + ChatSim (fijada en escritorio) | D |  |
| `/industrias/salud/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/industrias/belleza-estetica/` | Portada (`hero`) | `ind-belleza-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/industrias/belleza-estetica/` | Así trabaja Kain en tu estética (`kain-sector`) | `ind-belleza-kain-sector` | L |  | ImageSection mid + ChatSim (fijada en escritorio) | D |  |
| `/industrias/belleza-estetica/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/industrias/nutricion/` | Portada (`hero`) | `ind-nutricion-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/industrias/nutricion/` | Así trabaja Kain en tu consulta de nutrición (`kain-sector`) | `ind-nutricion-kain-sector` | L |  | ImageSection mid + ChatSim (fijada en escritorio) | D |  |
| `/industrias/nutricion/` | Cierre (`cta-final`) | `cta-duena-tranquila` | R | sí | Dawn | D | cta-duena-tranquila en espejo por alternancia. |
| `/industrias/finanzas/` | Portada (`hero`) | `ind-finanzas-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/industrias/finanzas/` | Así trabaja Kain en tu despacho o financiera (`kain-sector`) | `ind-finanzas-kain-sector` | L |  | ImageSection mid + ChatSim (fijada en escritorio) | D |  |
| `/industrias/finanzas/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/industrias/inmobiliario/` | Portada (`hero`) | `ind-inmobiliario-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/industrias/inmobiliario/` | Así trabaja Kain en tu inmobiliaria (`kain-sector`) | `ind-inmobiliario-kain-sector` | L |  | ImageSection mid + ChatSim (fijada en escritorio) | D |  |
| `/industrias/inmobiliario/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/industrias/industrial-logistica/` | Portada (`hero`) | `ind-industrial-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/industrias/industrial-logistica/` | Así trabaja Kain en tu operación (`kain-sector`) | `ind-industrial-kain-sector` | L |  | ImageSection mid + ChatSim (fijada en escritorio) | D |  |
| `/industrias/industrial-logistica/` | Cierre (`cta-final`) | `cta-duena-tranquila` | R | sí | Dawn | D | cta-duena-tranquila en espejo por alternancia. |
| `/industrias/retail-ecommerce/` | Portada (`hero`) | `ind-retail-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/industrias/retail-ecommerce/` | Así trabaja Kain en tu tienda (`kain-sector`) | `ind-retail-kain-sector` | L |  | ImageSection mid + ChatSim (fijada en escritorio) | D |  |
| `/industrias/retail-ecommerce/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/industrias/horeca/` | Portada (`hero`) | `ind-horeca-hero` | R |  | SharedTake + ImageSection hero | D |  |
| `/industrias/horeca/` | Así trabaja Kain en tu restaurante u hotel (`kain-sector`) | `ind-horeca-kain-sector` | L |  | ImageSection mid + ChatSim (fijada en escritorio) | D |  |
| `/industrias/horeca/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/casos/` | Portada (`hero`) | `casos-hero` | L |  | ImageSection hero | D | Kain a la izquierda: el cierre cta-equipo (real, no espejable) va a la derecha. |
| `/casos/` | Cierre (`cta-final`) | `cta-equipo` | R |  | Dawn | D |  |
| `/casos/clinica-dental-monterrey/` | Portada (`hero`) | `caso-dental-hero` | R |  | ImageSection hero | D | Persona siempre a la derecha; cifra mega a la izquierda. |
| `/casos/clinica-dental-monterrey/` | Resultado (`resultado`) | `ind-salud-kain-sector` | L |  | ImageSection mid | D | Comparte placa con "Así trabaja Kain" de su industria. |
| `/casos/clinica-dental-monterrey/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/casos/retail-multimarca-kommo/` | Portada (`hero`) | `caso-retail-hero` | R |  | ImageSection hero | D | Persona siempre a la derecha; cifra mega a la izquierda. |
| `/casos/retail-multimarca-kommo/` | Resultado (`resultado`) | `ind-retail-kain-sector` | L |  | ImageSection mid | D | Comparte placa con "Así trabaja Kain" de su industria. |
| `/casos/retail-multimarca-kommo/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/casos/ecommerce-cdmx-costo-por-lead/` | Portada (`hero`) | `caso-ecommerce-hero` | R |  | ImageSection hero | D | Persona siempre a la derecha; cifra mega a la izquierda. |
| `/casos/ecommerce-cdmx-costo-por-lead/` | Resultado (`resultado`) | `home-sistema-1-atraer` | L | sí | ImageSection mid | D | Estación Atraer en espejo (el caso es de costo por lead). |
| `/casos/ecommerce-cdmx-costo-por-lead/` | Cierre (`cta-final`) | `cta-duena-tranquila` | R | sí | Dawn | D | cta-duena-tranquila en espejo por alternancia. |
| `/casos/horeca-roas/` | Portada (`hero`) | `caso-horeca-hero` | R |  | ImageSection hero | D | Persona siempre a la derecha; cifra mega a la izquierda. |
| `/casos/horeca-roas/` | Resultado (`resultado`) | `ind-horeca-kain-sector` | L |  | ImageSection mid | D | Comparte placa con "Así trabaja Kain" de su industria. |
| `/casos/horeca-roas/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/casos/logistica-n8n/` | Portada (`hero`) | `caso-logistica-hero` | R |  | ImageSection hero | D | Persona siempre a la derecha; cifra mega a la izquierda. |
| `/casos/logistica-n8n/` | Resultado (`resultado`) | `ind-industrial-kain-sector` | L |  | ImageSection mid | D | Comparte placa con "Así trabaja Kain" de su industria. |
| `/casos/logistica-n8n/` | Cierre (`cta-final`) | `cta-equipo` | R |  | Dawn | D |  |
| `/kain/` | Portada (`hero`) | `kain-hero` | C |  | ImageSection hero subject-center | D | Clip con alfa en P1 aparte (video). |
| `/kain/` | Lo que sí y lo que no (`si-no`) | `kain-si-no` | L |  | ImageSection mid + TwoColumnScript | D |  |
| `/kain/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/metodologia/` | Portada (`hero`) | `metodologia-hero` | R |  | ImageSection hero + cutout + GhostWord | D |  |
| `/metodologia/` | Las 5 fases (secuencia fijada al scroll) (`fases`) | `metodologia-hero` | R |  | VktorSequence | D | Sin placas nuevas: la cámara sube escalón por escalón sobre la misma placa (push a escalon-1…5). Excepción de alternancia: es la misma toma. Ampliación opcional P3: serie de 5 placas de fase. |
| `/metodologia/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D |  |
| `/tecnologias/` | Portada (`hero`) | `tecnologias-hero` | R |  | ImageSection hero | D |  |
| `/tecnologias/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D | D pedía "saluda"; va en espejo por alternancia. |
| `/nosotros/` | Portada (`hero`) | `equipo-real` | L |  | ImageSection hero | D | Fotos reales; ESPEC lo ponía a la derecha. |
| `/nosotros/` | Manifiesto (`manifiesto`) | `nosotros-manifiesto` | R |  | ImageSection mid | D | Revelado palabra por palabra. |
| `/nosotros/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D | D asignaba cta-equipo: se cambia para no repetir al equipo dos veces en la misma página. |
| `/agentes-ia-guadalajara/` | Portada (`hero`) | `guadalajara-hero` | R |  | ImageSection hero | D |  |
| `/agentes-ia-guadalajara/` | Local y con alcance (`local-alcance`) | `nosotros-manifiesto` | L | sí | ImageSection mid | D | Misma placa del manifiesto, en espejo. |
| `/agentes-ia-guadalajara/` | Cierre (`cta-final`) | `cta-duena-tranquila` | R | sí | Dawn | D | cta-duena-tranquila en espejo por alternancia. |
| `/preguntas-frecuentes/` | Portada (`hero`) | `kain-si-no` | L |  | ImageSection hero | D | Kain pensativo (placa compartida con /kain/). |
| `/preguntas-frecuentes/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D | D pedía "señala" (espejo); va sin espejo por alternancia. |
| `/blog/` | Portada (`hero`) | `blog-hero` | R |  | ImageSection hero | D |  |
| `/blog/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D | D pedía "saluda"; va en espejo por alternancia. |
| `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` | Portada (`hero`) | `home-sistema-2-atender` | R |  | ImageSection hero | D | Reutiliza la estación Atender (tema: agente de WhatsApp). |
| `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` | Cierre (`cta-final`) | `cta-duena-tranquila` | L |  | Dawn | D |  |
| `/blog/kommo-vs-gohighlevel/` | Portada (`hero`) | `servicios-no-se` | R | sí | ImageSection hero | D | Kain frente a opciones = elegir plataforma. |
| `/blog/kommo-vs-gohighlevel/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D |  |
| `/blog/agente-ia-whatsapp-vs-chatbot/` | Portada (`hero`) | `art-agente-chatbot-hero` | R |  | ImageSection hero | D |  |
| `/blog/agente-ia-whatsapp-vs-chatbot/` | Cierre (`cta-final`) | `cta-amanecer` | L | sí | Dawn | D | D pedía "saluda"; va en espejo por alternancia. |
| `/blog/como-verificar-partner-oficial-kommo/` | Portada (`hero`) | `kommo-hero` | L |  | ImageSection hero | D | Reutiliza la portada de /kommo/. |
| `/blog/como-verificar-partner-oficial-kommo/` | Cierre (`cta-final`) | `cta-equipo` | R |  | Dawn | D |  |
| `/blog/gohighlevel-en-espanol/` | Portada (`hero`) | `gohighlevel-hero` | R |  | ImageSection hero | D | Reutiliza la portada de /gohighlevel/. |
| `/blog/gohighlevel-en-espanol/` | Cierre (`cta-final`) | `cta-duena-tranquila` | L |  | Dawn | D |  |
| `/blog/n8n-vs-zapier-vs-make/` | Portada (`hero`) | `home-sistema-4-automatizar` | L | sí | ImageSection hero | D | Estación Automatizar en espejo. |
| `/blog/n8n-vs-zapier-vs-make/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D | D pedía "señala" (espejo); va sin espejo por alternancia. |
| `/discovery/` | Portada (`hero`) | `discovery-hero` | R |  | ImageSection hero | D | La silla vacía. |
| `/discovery/` | Mira esto antes de agendar (`video`) | `discovery-vsl-poster` | C |  | VideoScene (ImageSection subject-center + VideoPoster) | ESPEC r1 | Póster limpio a sangre; el video se abre a pantalla completa al hacer clic. |
| `/discovery/` | Para quién es esta llamada (`para-quien`) | `discovery-para-quien` | L |  | ImageSection mid (móvil below) | D |  |
| `/discovery/` | Cierre (`cta-final`) | `discovery-cta-final` | R |  | Dawn | D | Gemela de la portada: Kain en la silla. |
| `/contacto/` | Portada (`hero`) | `home-kain` | L |  | ImageSection hero | D | Kain saludando junto al teléfono = "Escríbele a Kain". Sustituye a la asesora generada de D (evita sugerir una empleada que no existe). |
| `/contacto/` | Cierre (`cta-final`) | `cta-amanecer` | R |  | Dawn | D |  |
| `/404` | Portada (`hero`) | `404-hero` | R |  | ImageSection hero | D |  |

## 8. Lista de aceptación de una placa (ESPEC §9.4 + serie)

- [ ] Kain idéntico a las referencias (antenas, ojos, orejas, asterisco); cuerpo completo con pies y antenas dentro del cuadro, en escritorio y en móvil. Se rechaza de inmediato cualquier Kain negro, con otra cara o sin antenas.
- [ ] Penumbra de texto limpia del lado correcto (≥55 % en escritorio; 40 % superior en móvil): sin objetos, luces ni partículas.
- [ ] Una sola luz cian/azul; ámbar solo en placas de dolor; cero tonos cálidos en el resto.
- [ ] Sin texto, números, logos ni UI legible. Superficies de cristal **vacías** donde va UI.
- [ ] Los cuatro bordes caen a `#03040B`; piso o niebla en el último 10–16 %. Al ponerla sobre una página `#03040B` no se ve ninguna arista.
- [ ] Pantalla del pecho de frente (≥3 % del ancho) en placas con firma o ancla `pecho`.
- [ ] Personas: ilustrativas, sin nombre, sin marcas en la ropa, manos correctas. Fotos del equipo sin alterar rostros.
- [ ] Gemelas: `difference` ≤4 px fuera de la zona editada.
- [ ] Se ve como parte de la serie junto al hero aprobado (mismo lente, gradado y grano).
- [ ] Registro completo en `plates.json` y contraste aprobado por `check-contraste.mjs`.

## 9. Fichas por placa

### 1. `home-hero` · P1 · lote A

| | |
|---|---|
| Estado | aprobada · kain · tono sol |
| Sujeto | Kain presentando con la palma abierta el isotipo de cristal de Ingeniak, entre ramas de luz cian. |
| Lado del sujeto | derecha |
| Idea | Portada del inicio y plano de la firma "Del nodo al pecho". YA APROBADA: no se regenera; solo se producen derivados. |
| Usos | `/` #hero |
| Escritorio | Aprobada: hero-home-desk-2x.jpg (2752×1536, 16:9). Kain a la derecha (x≈0.72), isotipo de cristal en x≈0.45–0.70, penumbra izquierda. |
| Móvil | Aprobada: hero-home-movil-d.png (768×1376) → upscale 2× → 1536×2752. Mitad superior vacía, Kain abajo. |
| Luz | Aprobada (serie madre: todas las demás placas copian este contraluz, piso y gradado). |
| Alt | Kain, el agente de IA de Ingeniak, presenta con la mano abierta el isotipo de cristal de la marca |
| Notas | Es la referencia de serie (S_HERO) de todas las placas con Kain. No se toca. |

**home-hero-cut (recorte)** — remove_background sobre hero-home-desk-2x.jpg:
```
Sin prompt. Salida PNG con alfa de 2752×1536 exactos (mismas dimensiones que la placa) para las capas cutout/ghost.
```
**home-hero-clean (placa limpia para parallax de 2 capas)** — Nano Banana Pro en modo edición (referencia 1 = hero-home-desk-2x.jpg):
```
Edit this exact image. Remove the white robot completely and reconstruct what was behind him: the same dark glossy floor and its reflections, the same haze, the same cyan light branches and the same crystal logo exactly as they are. Keep the camera, framing, lighting, colors and every other pixel identical. Do not add any new object. Absolutely no text, letters, numbers or logos added.
```
**home-hero-m (móvil)** — images_upscale 2× sobre hero-home-movil-d.png:
```
Sin prompt. Mismos ajustes de upscale que la serie.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Recorte con alfa 2752×1536 (firma, GhostWord) · Placa limpia (inpainting) para parallax de dos capas · Móvil 9:16 con upscale 2× · Copia desenfocada 320 px (automática)

### 2. `cta-amanecer` · P1 · lote A

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain saludando de pie sobre un horizonte curvo con filo de amanecer frío cian-blanco ("06:00 · Rise"). |
| Lado del sujeto | derecha |
| Idea | Cierre compartido (Dawn) de casi todo el sitio. Sustituye a cta-kain-saluda y cta-kain-senala (esta = espejo). Su placa limpia es el fondo de cta-equipo. |
| Usos | `/` #cta-final · `/servicios/` #cta-final · `/servicios/agentes-ia-whatsapp/` #cta-final · `/servicios/crm-con-ia/` #cta-final (espejo) · `/kommo/` #cta-final · `/gohighlevel/` #cta-final (espejo) · `/servicios/paginas-web/` #cta-final · `/servicios/desarrollo-software/` #cta-final (espejo) · `/servicios/seo/` #cta-final (espejo) · `/industrias/salud/` #cta-final · `/industrias/belleza-estetica/` #cta-final · `/industrias/finanzas/` #cta-final · `/industrias/inmobiliario/` #cta-final · `/industrias/retail-ecommerce/` #cta-final · `/industrias/horeca/` #cta-final · `/casos/clinica-dental-monterrey/` #cta-final · `/casos/retail-multimarca-kommo/` #cta-final · `/casos/horeca-roas/` #cta-final · `/kain/` #cta-final · `/metodologia/` #cta-final (espejo) · `/tecnologias/` #cta-final (espejo) · `/nosotros/` #cta-final (espejo) · `/preguntas-frecuentes/` #cta-final · `/blog/` #cta-final (espejo) · `/blog/kommo-vs-gohighlevel/` #cta-final (espejo) · `/blog/agente-ia-whatsapp-vs-chatbot/` #cta-final (espejo) · `/blog/n8n-vs-zapier-vs-make/` #cta-final · `/contacto/` #cta-final |
| Escritorio | 16:9. Horizonte curvo enorme (borde de un planeta oscuro) con cresta en y≈0.72 y filo de amanecer cian-blanco. Kain sobre la cresta centrado en x≈0.70 (antenas y≈0.26, pies y≈0.72), saludando hacia la izquierda. Haz vertical que baja un poco a la derecha del centro. 55 % izquierdo de cielo limpio navy → índigo cerca del horizonte. |
| Móvil | Cielo vacío en el 40 % superior; cresta del horizonte en y≈0.86; Kain sobre ella centrado en x≈0.58 (antenas y≈0.46). |
| Luz | Amanecer FRÍO: filo cian-blanco en el horizonte y resplandor que sube; cielo navy #0A1F4C → índigo #455DFF cerca del horizonte; contraluz en Kain desde el horizonte. Sin naranjas ni dorados. |
| Alt | Kain, el agente de IA de Ingeniak, saluda sobre un horizonte que amanece en luz fría |
| Notas | Segunda en el orden de producción (después de los derivados del hero): fija la luz de todos los cierres. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, cold dawn, part of one consistent cinematic series. A vast curved dark horizon like the edge of a planet crosses the lower part of the frame with its crest at 72% of the frame height, outlined by a thin bright cyan-white rim of dawn light and a cold glow rising from it. A soft vertical beam of light descends from above, slightly right of center. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands on the crest of the horizon in the right part of the frame, body centered at 70% of the width, the tips of his antennas at about 26% of the frame height, in a three-quarter view toward the empty left side, raising one hand in a friendly greeting toward the left, his square chest screen facing the camera, rim-lit by the dawn behind him. Sky gradient from deep navy (#0A1F4C) to indigo (#455DFF) near the horizon. The left 55% of the frame is clean dark sky: no stars, no objects, no light sources. All four edges fade to near-black (#03040B) in the last 7%. Cold light only, no warm sunrise colors. 35mm lens, HDR, subtle film grain. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 58% of the width, the tips of his antennas at about 46% of the frame height and his feet at about 86%, chest screen facing the camera. He stands on the crest of the same curved dark horizon, which crosses the frame at 86% of the height with its thin cyan-white dawn rim; the cold glow rises behind him. Cold light only, no warm colors. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saludo-final.png` — Pose: saludo amplio de cierre.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/cta-amanecer/cta-amanecer-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saludo-final.png` — Pose: saludo amplio de cierre.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Espejo por CSS (mirror: true) = antiguo cta-kain-senala · cta-amanecer-clean: edición "Edit this exact image. Remove the robot completely and reconstruct the horizon crest, the dawn rim and the sky exactly as they are behind him. Keep everything else identical. No text." (fondo de cta-equipo)

### 3. `home-problema-a` · P1 · lote A

| | |
|---|---|
| Estado | nueva · persona · tono dolor |
| Sujeto | Dueño de pyme (45) solo en su local después del cierre, con el rostro iluminado en ámbar por el celular. |
| Lado del sujeto | izquierda |
| Idea | Plano A de los gemelos "23:48": el problema. También es la placa de "Señales" de /servicios/agentes-ia-whatsapp/. |
| Usos | `/` #problema · `/servicios/agentes-ia-whatsapp/` #senales |
| Escritorio | 16:9. Persona en plano medio/americano del lado izquierdo (x 0.12–0.38), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % derecho; el lado en sombra de la persona se disuelve en el fondo, sin bordes duros. Bordes a #03040B. Plano medio-largo que muestra el piso bajo el banco (necesario para que en B Kain quepa de cuerpo completo). Persona x 0.18–0.38 sentada al mostrador; anaqueles en sombra detrás. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío para texto; persona en el 60 % inferior (coronilla y≈0.44), centrada x≈0.55, el torso se disuelve en sombra hacia el borde inferior. subjTop ≈ 0.44. Sentado en el banco, mostrador a un lado, pies cerca de y≈0.90. Se usa en modo below (solo la parte inferior asoma arriba de la lista de dolores). Modo móvil: `below`. |
| Luz | Tono DOLOR: una sola luz práctica ámbar #FFB547 (celular, lámpara o pantalla) sobre rostro y manos; cero cian salvo un filo frío casi imperceptible; todo lo demás cae a navy. Es la única excepción al "sin luz cálida". |
| Alt | Dueño de un pequeño negocio, solo en su local de noche, mirando su celular bajo luz ámbar (imagen ilustrativa) |
| Notas | Guardar semilla. Se genera ANTES que B. Sin referencias de imagen (persona). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican small-business owner (45, man, short dark hair with some grey, casual dark button-up shirt), medium-long shot that shows him from head to the floor, the stool legs and the floor clearly visible, positioned in the left part of the frame (18–38% of the frame width), sitting alone on a tall stool at the counter of his small shop after closing time, shoulders slumped, looking down at the smartphone in his hands, its screen a warm amber glow (no interface) lighting his face from below. A small neighborhood shop after closing: a simple counter beside him, shelves of products behind him dissolving into deep navy shadow, background softly out of focus, the environment existing only on the left side of the frame. Lighting: a single motivated warm amber (#FFB547) practical light from the smartphone screen on the face and hands, quiet and tired; no cyan light except a very faint cold edge on one shoulder; everything else falls into deep navy shadow. The shadow side of the person dissolves into the dark background with no hard edges. The right 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, dark navy grade where the amber practical is the only warm accent, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 42% of the width, the top of the head at about 44% of the frame height, sitting on the stool at the counter, his feet and the stool legs visible near 90% of the frame height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-problema-a/home-problema-a-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Base de la edición home-problema-b (escritorio y móvil) · Copia desenfocada 320 px

### 4. `home-problema-b` · P1 · lote A

| | |
|---|---|
| Estado | edición (edición de `home-problema-a`) · kain · tono sol |
| Sujeto | El mismo encuadre de A: el banco vacío, el celular en el mostrador ahora cian y Kain de pie donde estaba el dueño. |
| Lado del sujeto | izquierda |
| Idea | Plano B de los gemelos: la solución. Se revela con un barrido de luz sobre A (TwinScene). Debe coincidir píxel a píxel fuera de la zona editada. |
| Usos | `/` #problema |
| Escritorio | Edición de A (mismas dimensiones y cámara). Kain de cuerpo completo frente al mostrador, cuerpo centrado en x≈0.30, pies visibles, nada tapa sus piernas. Lado derecho idéntico a A (casi negro). |
| Móvil | Edición del móvil de A con la misma instrucción; Kain centrado en x≈0.42, pies en y≈0.88. |
| Luz | Igual a A pero todo el ámbar se vuelve cian/azul; contraluz cian detrás de Kain. |
| Alt | Kain, el agente de IA de Ingeniak, de pie junto al mostrador donde el celular ya brilla en cian |
| Notas | Referencia 1 = render ELEGIDO de A (escritorio para escritorio, móvil para móvil). |

**Prompt escritorio (16:9):**
```
Edit this exact image (the first reference). Keep the camera, the framing, the shop, the counter, the shelves, the stool and every shadow identical. Remove the man completely; the stool stays empty. The smartphone now lies on the counter and its screen glows cyan (#00E5FF) with no interface. Add KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints), standing in front of the counter where the man was, body centered at 30% of the frame width, FULL BODY from the tips of the antennas to his feet on the floor, nothing hiding his legs, three-quarter view toward the empty right side, chest screen facing the camera, one open hand gesturing toward the glowing phone, lit by a cyan and electric-blue rim light from behind. Replace all warm amber light with cool cyan and blue light. The right 55% of the frame stays near-black navy with no objects. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Edit this exact image (the first reference). Keep the camera, the framing, the counter, the stool and every shadow identical. Remove the man; the stool stays empty. The smartphone lies on the counter glowing cyan (#00E5FF), no interface. Add KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) standing in front of the counter, centered at 42% of the width, FULL BODY with his feet on the floor near 88% of the frame height, chest screen facing the camera, one hand toward the phone, cyan rim light from behind. Replace all amber light with cool cyan and blue. The top 40% stays an empty near-black void. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-problema-a/home-problema-a-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-problema-a/home-problema-a-movil.png` — Render móvil ELEGIDO de esta misma placa.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).

**Derivados:** Prueba de difference A/B: nada fuera de la zona editada se mueve más de 4 px (si falla, se regenera B)

### 5. `home-sistema-1-atraer` · P1 · lote A

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain en la estación 1 · Atraer. |
| Lado del sujeto | derecha |
| Idea | Kain "dirige" una pila de 4 paneles de cristal flotantes (anuncios en el aire, solo color abstracto). El panel frontal, plano y en blanco, recibe la UI de anuncios + curva. Serie de 5 con cámara, horizonte (66 %) y riel de luz idénticos: SystemRuntime del inicio y, a la vez, portada del servicio de esa etapa (corte por coincidencia entre páginas). |
| Usos | `/` #sistema · `/servicios/paid-media/` #hero · `/casos/ecommerce-cdmx-costo-por-lead/` #resultado (espejo) |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Horizonte del piso en y≈0.66 y riel cian a ras de piso en y≈0.90 que cruza todo el ancho (tenue del lado del texto, más brillante junto a Kain), IDÉNTICOS en las 5. Panel frontal x 0.57–0.70, y 0.26–0.66 (≥14 % de ancho). |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Mismo objeto de estación junto a Kain dentro del 60 % inferior; riel a ras de piso en y≈0.93. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. El riel de piso es la única luz que cruza al lado del texto y queda por debajo de la línea base de los CTA. |
| Alt | Kain, el agente de IA de Ingeniak, ordena paneles de cristal flotantes que representan anuncios |
| Notas | Generar primero; su render elegido es la 4.ª referencia de las estaciones 2–5 (misma cámara, horizonte y riel). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 78% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. One hand raised lightly toward the panels as if arranging them in the air, the other arm relaxed, looking toward the empty side. Beside him, between the robot and the empty side (about 57–70% of the frame width, 26–66% of the height), a vertical stack of four floating rectangular glass panels at slightly different depths, like advertisements hanging in the air, each showing only soft out-of-focus abstract color fields in navy, blue and cyan; the front panel is perfectly flat, frontal to the camera and blank. This is station 1 of a series of five images with an identical camera: a dark glossy reflective floor whose horizon line sits at 66% of the frame height, and a thin dim cyan light rail at floor level crossing the full width at 90% of the frame height, very faint on the empty side and brighter near the robot. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 58% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The station object from the reference stays beside him inside the lower 60% of the frame; the thin cyan floor rail crosses the frame at 93% of the height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-1-atraer/home-sistema-1-atraer-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake en la portada del servicio) · Still 1920 px para el mega menú

### 6. `home-sistema-2-atender` · P1 · lote A

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain en la estación 2 · Atender. |
| Lado del sujeto | derecha |
| Idea | Kain junto a un teléfono de cristal gigante (más alto que él) de pie en el piso; la pantalla plana, frontal y vacía recibe el chat (ChatSim / burbujas). Serie de 5 con cámara, horizonte (66 %) y riel de luz idénticos: SystemRuntime del inicio y, a la vez, portada del servicio de esa etapa (corte por coincidencia entre páginas). |
| Usos | `/` #sistema · `/servicios/agentes-ia-whatsapp/` #hero · `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Horizonte del piso en y≈0.66 y riel cian a ras de piso en y≈0.90 que cruza todo el ancho (tenue del lado del texto, más brillante junto a Kain), IDÉNTICOS en las 5. Pantalla x 0.56–0.70, y 0.16–0.86 (≈14 % de ancho). |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Mismo objeto de estación junto a Kain dentro del 60 % inferior; riel a ras de piso en y≈0.93. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. El riel de piso es la única luz que cruza al lado del texto y queda por debajo de la línea base de los CTA. |
| Alt | Kain, el agente de IA de Ingeniak, junto a un teléfono de cristal gigante con la pantalla en blanco |
| Notas | Adjuntar la estación 1 elegida como 4.ª referencia para mantener cámara, horizonte y riel. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 79% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. One hand resting on the edge of the giant phone, presenting it toward the empty side with a friendly tilt of the head. Standing upright on the floor right next to him, between the robot and the empty side (about 56–70% of the frame width, from 16% to 86% of the height), a giant glass smartphone taller than the robot, its screen flat, frontal to the camera and perfectly blank with a faint cyan inner glow. This is station 2 of a series of five images with an identical camera: a dark glossy reflective floor whose horizon line sits at 66% of the frame height, and a thin dim cyan light rail at floor level crossing the full width at 90% of the frame height, very faint on the empty side and brighter near the robot. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 58% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The station object from the reference stays beside him inside the lower 60% of the frame; the thin cyan floor rail crosses the frame at 93% of the height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-1-atraer/home-sistema-1-atraer-desk.png` — Estación 1 ELEGIDA: misma cámara, horizonte y riel (serie de 5).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-2-atender/home-sistema-2-atender-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake en la portada del servicio) · Still 1920 px para el mega menú

### 7. `home-sistema-3-organizar` · P1 · lote A

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain en la estación 3 · Organizar. |
| Lado del sujeto | derecha |
| Idea | Kain sostiene una tarjeta de cristal en blanco (la tarjeta de lead del Flip) frente a 5 carriles verticales de luz tipo kanban con tarjetas vacías. Serie de 5 con cámara, horizonte (66 %) y riel de luz idénticos: SystemRuntime del inicio y, a la vez, portada del servicio de esa etapa (corte por coincidencia entre páginas). |
| Usos | `/` #sistema · `/servicios/crm-con-ia/` #hero · `/servicios/crm-con-ia/` #crm-vivo |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Horizonte del piso en y≈0.66 y riel cian a ras de piso en y≈0.90 que cruza todo el ancho (tenue del lado del texto, más brillante junto a Kain), IDÉNTICOS en las 5. Tarjeta en las manos x≈0.66, y≈0.47 (ancla de la LeadCard); carriles x 0.60–0.95. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Mismo objeto de estación junto a Kain dentro del 60 % inferior; riel a ras de piso en y≈0.93. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. El riel de piso es la única luz que cruza al lado del texto y queda por debajo de la línea base de los CTA. |
| Alt | Kain, el agente de IA de Ingeniak, coloca una tarjeta de cristal en carriles de luz que ordenan los prospectos |
| Notas | Adjuntar la estación 1 elegida como 4.ª referencia para mantener cámara, horizonte y riel. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 72% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Holding a small blank glowing glass card with both hands at chest height, as if about to place it into one of the lanes, looking toward the empty side. Behind him, on his side of the frame (about 60–95% of the width), five tall vertical lanes of soft light stand side by side like the columns of a kanban board, receding slightly in perspective toward the right edge, each holding a few blank glowing glass cards. This is station 3 of a series of five images with an identical camera: a dark glossy reflective floor whose horizon line sits at 66% of the frame height, and a thin dim cyan light rail at floor level crossing the full width at 90% of the frame height, very faint on the empty side and brighter near the robot. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 58% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The station object from the reference stays beside him inside the lower 60% of the frame; the thin cyan floor rail crosses the frame at 93% of the height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-1-atraer/home-sistema-1-atraer-desk.png` — Estación 1 ELEGIDA: misma cámara, horizonte y riel (serie de 5).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-3-organizar/home-sistema-3-organizar-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake en la portada del servicio) · Still 1920 px para el mega menú

### 8. `home-sistema-4-automatizar` · P1 · lote A

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain en la estación 4 · Automatizar. |
| Lado del sujeto | derecha |
| Idea | Kain toca un nodo cuadrado de luz; a su alrededor, una constelación de nodos cuadrados unidos por ramas a 45° (geometría del isotipo). Sobre los nodos se anclan pulsos HTML (lienzo n8n). Serie de 5 con cámara, horizonte (66 %) y riel de luz idénticos: SystemRuntime del inicio y, a la vez, portada del servicio de esa etapa (corte por coincidencia entre páginas). |
| Usos | `/` #sistema · `/servicios/automatizacion-n8n/` #hero · `/blog/n8n-vs-zapier-vs-make/` #hero (espejo) |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Horizonte del piso en y≈0.66 y riel cian a ras de piso en y≈0.90 que cruza todo el ancho (tenue del lado del texto, más brillante junto a Kain), IDÉNTICOS en las 5. Nodos x 0.58–0.95; nodo tocado x≈0.64, y≈0.46. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Mismo objeto de estación junto a Kain dentro del 60 % inferior; riel a ras de piso en y≈0.93. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. El riel de piso es la única luz que cruza al lado del texto y queda por debajo de la línea base de los CTA. |
| Alt | Kain, el agente de IA de Ingeniak, toca un nodo de una red de luz que representa procesos automatizados |
| Notas | Adjuntar la estación 1 elegida como 4.ª referencia para mantener cámara, horizonte y riel. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 72% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Reaching out with one finger to touch a small square node of light at chest height on the side facing the empty space, calm and precise. Around and behind him, on his side of the frame (about 58–95% of the width), a three-dimensional constellation of small square nodes of light connected by thin glowing branches with 45-degree elbows, like a circuit or the arms of a logo made of light, floating at different depths and fading out before the empty side. This is station 4 of a series of five images with an identical camera: a dark glossy reflective floor whose horizon line sits at 66% of the frame height, and a thin dim cyan light rail at floor level crossing the full width at 90% of the frame height, very faint on the empty side and brighter near the robot. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 58% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The station object from the reference stays beside him inside the lower 60% of the frame; the thin cyan floor rail crosses the frame at 93% of the height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-1-atraer/home-sistema-1-atraer-desk.png` — Estación 1 ELEGIDA: misma cámara, horizonte y riel (serie de 5).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-4-automatizar/home-sistema-4-automatizar-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake en la portada del servicio) · Still 1920 px para el mega menú

### 9. `home-sistema-5-medir` · P1 · lote A

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain en la estación 5 · Medir. |
| Lado del sujeto | derecha |
| Idea | Kain frente a una pantalla curva y ancha, en blanco, a la que llegan 7 hilos de luz (7 fuentes sin nombre) que convergen en un punto. Ahí va el tablero "1 vista · 7 fuentes". Serie de 5 con cámara, horizonte (66 %) y riel de luz idénticos: SystemRuntime del inicio y, a la vez, portada del servicio de esa etapa (corte por coincidencia entre páginas). |
| Usos | `/` #sistema · `/servicios/desarrollo-software/` #hero · `/servicios/desarrollo-software/` #dashboard |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Horizonte del piso en y≈0.66 y riel cian a ras de piso en y≈0.90 que cruza todo el ancho (tenue del lado del texto, más brillante junto a Kain), IDÉNTICOS en las 5. Pantalla x 0.56–0.94, y 0.18–0.62. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Mismo objeto de estación junto a Kain dentro del 60 % inferior; riel a ras de piso en y≈0.93. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. El riel de piso es la única luz que cruza al lado del texto y queda por debajo de la línea base de los CTA. |
| Alt | Kain, el agente de IA de Ingeniak, frente a una pantalla curva donde convergen siete hilos de luz |
| Notas | Adjuntar la estación 1 elegida como 4.ª referencia para mantener cámara, horizonte y riel. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 77% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Standing calmly, one open hand presenting the screen behind him, looking toward the empty side. Behind him and slightly toward the empty side (about 56–94% of the frame width, 18–62% of the height), a wide curved glass screen like a horizon, its surface blank and softly glowing; seven thin threads of light arrive into it from the darkness and converge into one bright point at its center. This is station 5 of a series of five images with an identical camera: a dark glossy reflective floor whose horizon line sits at 66% of the frame height, and a thin dim cyan light rail at floor level crossing the full width at 90% of the frame height, very faint on the empty side and brighter near the robot. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 58% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The station object from the reference stays beside him inside the lower 60% of the frame; the thin cyan floor rail crosses the frame at 93% of the height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-1-atraer/home-sistema-1-atraer-desk.png` — Estación 1 ELEGIDA: misma cámara, horizonte y riel (serie de 5).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-sistema-5-medir/home-sistema-5-medir-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake en la portada del servicio) · Still 1920 px para el mega menú

### 10. `home-kain` · P1 · lote A

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain saludando junto a un teléfono de cristal flotante con la pantalla vacía (ahí corre el chat en HTML/video). |
| Lado del sujeto | izquierda |
| Idea | Escena "Conoce a Kain" (ESC 06): push-in hacia el teléfono. También portada de /contacto/ ("Escríbele a Kain"). |
| Usos | `/` #kain · `/contacto/` #hero |
| Escritorio | 16:9 espejo del estándar: Kain de cuerpo completo en el lado izquierdo (cuerpo centrado en x≈0.28; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; transición x 0.40–0.45; penumbra limpia x 0.45–1. Bordes a #03040B en el último 7 %. Kain centrado en x≈0.22; teléfono de cristal flotante a la altura del pecho entre Kain y el texto (x 0.32–0.42, y 0.26–0.70, ≥9 % de ancho), vertical, frontal, pantalla plana y vacía; halo cian detrás de Kain. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Kain en x≈0.40 y el teléfono flotante a su derecha (x≈0.62) dentro del 60 % inferior. Si la pantalla mide <180 px a 390 de ancho, el chat baja al flujo del texto (ESPEC §3.7). |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. Halo cian suave detrás de Kain. |
| Alt | Kain, el agente de IA de Ingeniak, saluda junto a un teléfono de cristal flotante |
| Notas | La pantalla del teléfono debe salir frontal (sin perspectiva fuerte) para registrar el video kain-chat al píxel. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. Waving hello toward the camera with one hand raised, friendly, eyes slightly narrowed in a smile. Floating at chest height beside him, between the robot and the empty side (about 32–42% of the frame width, 26–70% of the height), a large glass smartphone hovering in the air, upright and frontal to the camera, its screen perfectly flat and blank with a faint cyan glow. A soft circular cyan halo glows behind the robot; far behind, silky dark-navy light waves barely visible. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 40% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The floating glass smartphone from the reference hovers at his chest height to his right (around 62% of the width), upright, frontal, its screen blank. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saluda.png` — Pose: saludar con la mano levantada.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/home-kain/home-kain-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saluda.png` — Pose: saludar con la mano levantada.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 11. `metodologia-hero` · P1 · lote A

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain de pie sobre la quinta de cinco losas de cristal que suben en diagonal (V·K·T·O·R), con un haz de luz vertical detrás (Rise). |
| Lado del sujeto | derecha |
| Idea | ESC 09 del inicio (con "VKTOR" gigante detrás del recorte) y portada de /metodologia/. La VktorSequence de fases se filma sobre esta misma placa (push-in escalón por escalón). |
| Usos | `/` #vktor · `/servicios/consultoria-ia-empresas/` #vktor-cine · `/metodologia/` #hero · `/metodologia/` #fases |
| Escritorio | 16:9. Cinco losas suben desde abajo a la izquierda (losa 1 centrada en x 0.14, y 0.90) hasta el tercio derecho (losa 5 en x 0.72, y 0.64), unidas por una línea cian. Kain sobre la losa 5 (antenas y≈0.18, pies y≈0.62), 3/4 mirando atrás, mano abierta hacia los escalones. Zona limpia para texto: cuadrante superior izquierdo x 0–0.55, y 0–0.55 (align start). |
| Móvil | Losas en zigzag de abajo hacia arriba dentro del 60 % inferior (losa 1 en y≈0.95, losa 5 en y≈0.66); Kain sobre la losa 5 (antenas y≈0.45); 40 % superior vacío. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. Haz vertical cian-blanco detrás de Kain; niebla reflectante bajo las losas. |
| Alt | Kain, el agente de IA de Ingeniak, de pie sobre la última de cinco losas de cristal que suben como escalones |
| Notas | Las letras V·K·T·O·R van en HTML anclado a cada losa, nunca en la imagen. Las losas deben quedar separadas y legibles a 1280 px para las 5 anclas. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. Five floating glowing glass slabs rise diagonally like stairs from the lower-left area (the first slab centered at 14% of the width and 90% of the height) to the right third (the fifth slab centered at 72% of the width and 64% of the height), evenly spaced, each glowing softly from inside, connected by one thin cyan light line along their edges. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands on the fifth slab, body centered at 72% of the width, the tips of his antennas at about 18% of the frame height, in a three-quarter view turned back toward the steps, one open hand gesturing to them, his square chest screen facing the camera. A vertical beam of cyan-white light rises behind him. Reflective dark fog below the slabs. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) light, soft indigo (#455DFF) fill from the left. The upper-left area of the frame (0–55% of the width, 0–55% of the height) is clean deep navy (#0A1F4C) sky falling off to near-black (#03040B), faint haze only, no objects, no particles, no light sources. All four edges fade to near-black in the last 7%. 35mm lens, f/4, subtle film grain, HDR. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 58% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 64%, chest screen facing the camera. The five glowing glass slabs from the reference zigzag upward inside the lower 60% of the frame: the first slab near 95% of the height, the fifth slab (where he stands) at about 66% of the height. The vertical cyan-white beam rises behind him. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Web Ingeniak Versel/materiales/discovery/kain-03-cuatro-a.png` — Losas de cristal en escalera (solo metodología).
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/metodologia-hero/metodologia-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Recorte con alfa de las MISMAS dimensiones (capa cutout para GhostWord "VKTOR") · Copia desenfocada 320 px

### 12. `equipo-real` · P1 · lote A

| | |
|---|---|
| Estado | foto real · equipo-real · tono sol |
| Sujeto | Las 6 personas reales del equipo (Rik Landeros, Alonso Vega, César Ovalle, Richard Vela, Andy Pizano, Marcos González) en duotono, emergiendo de la niebla a la izquierda. |
| Lado del sujeto | izquierda |
| Idea | NO se genera gente: se componen las fotos reales sobre un set vacío generado con la misma luz de la serie. Sirve para el inicio (ESC 11) y la portada de /nosotros/. |
| Usos | `/` #equipo · `/nosotros/` #hero |
| Escritorio | 16:9. Set vacío generado + composición. Seis bustos reales en dos filas escalonadas (atrás 3 al 86 % de escala y un punto más oscuros; adelante 3) dentro de x 0.05–0.45; cabezas en y 0.20–0.44; los torsos se disuelven en un banco de niebla a la altura y≈0.70. Penumbra limpia x 0.45–1 para H2 + créditos. |
| Móvil | Misma composición reacomodada: 6 bustos en 2 filas dentro del 60 % inferior (cabezas de la fila trasera en y≈0.46), 40 % superior vacío. |
| Luz | El set trae el contraluz cian/azul y la niebla; a cada recorte se le añade en composición un filo cian (alfa → desenfoque → pantalla cian 35 %) desde atrás y un duotono navy/cian. No se reilumina el rostro con IA. |
| Alt | El equipo de Ingeniak: Rik Landeros, Alonso Vega, César Ovalle, Richard Vela, Andy Pizano y Marcos González |
| Notas | Las fotos actuales traen placa de nombre, cargos viejos y la "X" detrás; la pose de Rik (dedo arriba) rompe la serie. RECOMENDADO: sesión de fotos nueva (3/4 de cuerpo, fondo negro, contraluz cian) y repetir esta misma composición. Equipo a la IZQUIERDA para alternar con metodologia-hero (derecha) y el cierre (derecha). No usar team-hero-CyZMMz70.jpg (no es el equipo). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 empty studio set at night, premium photographic look, part of one consistent cinematic series. No people, no characters. In the left 45% of the frame, a soft low bank of fog sits at 60–80% of the frame height, back-lit by a cyan (#00E5FF) and electric-blue (#0055FF) rim light that rises behind it like a glow where a group of people will be composited later; far behind, faint silky dark-navy light waves. Keep that area evenly lit, empty and uncluttered. The right 55% of the frame is clean deep navy (#0A1F4C) negative space falling off to near-black (#03040B), no objects, no light sources, no particles. A dark glossy floor barely visible under the fog. All four edges fade to near-black in the last 7%. 50mm lens, f/2.8, subtle film grain, same color grade as the reference image. Absolutely no text, letters, numbers, logos, people or robots.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 version of the same empty set as the first reference image: same fog bank, same back light and color grade, camera pulled back. The fog bank and its cyan back-glow sit in the lower 60% of the frame (from 55% to 90% of the height), centered. The top 40% is an empty near-black void (#03040B) with a very faint haze. Edges fade to near-black. Absolutely no text, letters, numbers, logos, people or robots.
```
**Paso 1 · recorte sin tocar rostros** — recorte manual + remove_background:
```
Recortar cada foto justo ARRIBA de la placa de nombre (≈64–66 % del alto): queda cabeza, hombros y parte alta del pecho; así no hay que inpaintar nada. Quitar fondo (sale la "X" y el azul). Cuidar el pelo de César y de Andy.
```
**Paso 2 · composición** — Photoshop/Figma o sharp en el build:
```
Fila trasera: Richard, Andy, Marcos (escala 0.86, −10 % de exposición). Fila delantera: Rik, Alonso, César. Hombros solapados 8–12 %. Los cortes inferiores se esconden en el banco de niebla del set (máscara degradada 18 % alto).
```
**Paso 3 · luz y gradado** — composición:
```
Filo cian desde atrás (alfa → blur 12 px → color #00E5FF en modo pantalla 35 %), duotono navy #0A1F4C → blanco frío con 70 % de mezcla, grano igual al global. Ningún filtro generativo sobre las caras.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/equipo-real/equipo-real-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Fotos para componer:** 6 retratos reales en `materiales/equipo/`.

**Derivados:** Composición escritorio 2752×1536 y móvil 1536×1920 · Base de cta-equipo (mismos recortes)

### 13. `cta-duena-tranquila` · P1 · lote A

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | Dueña de negocio (42) tranquila junto a la ventana de su oficina al amanecer frío, café en mano; su celular brilla en cian sobre el escritorio. |
| Lado del sujeto | izquierda |
| Idea | Cierre compartido "el sistema trabajó toda la noche". Reiluminado con el mismo amanecer frío de cta-amanecer (unidad del final "Rise"). |
| Usos | `/servicios/consultoria-ia-empresas/` #cta-final · `/servicios/automatizacion-n8n/` #cta-final · `/servicios/paid-media/` #cta-final · `/industrias/` #cta-final · `/industrias/nutricion/` #cta-final (espejo) · `/industrias/industrial-logistica/` #cta-final (espejo) · `/casos/ecommerce-cdmx-costo-por-lead/` #cta-final (espejo) · `/agentes-ia-guadalajara/` #cta-final (espejo) · `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` #cta-final · `/blog/gohighlevel-en-espanol/` #cta-final |
| Escritorio | 16:9. Persona en plano medio/americano del lado izquierdo (x 0.12–0.38), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % derecho; el lado en sombra de la persona se disuelve en el fondo, sin bordes duros. Bordes a #03040B. Plano medio desde la cadera (x 0.14–0.36), de pie junto al ventanal; el celular sobre el escritorio a su lado (x≈0.40, y≈0.70), pantalla con brillo cian sin UI. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío para texto; persona en el 60 % inferior (coronilla y≈0.44), centrada x≈0.55, el torso se disuelve en sombra hacia el borde inferior. subjTop ≈ 0.44. Ella centrada en x≈0.50, el filo del amanecer visible por la ventana a la altura de sus hombros. |
| Luz | Amanecer frío por la ventana: filo cian-blanco en el horizonte que dibuja un borde en pelo y hombros; relleno índigo suave; ningún tono cálido. |
| Alt | Dueña de un negocio, tranquila junto a la ventana de su oficina al amanecer, con su celular atendido sobre el escritorio (imagen ilustrativa) |
| Notas | Persona: sin referencias de imagen en escritorio. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican woman business owner (42, dark hair tied back, elegant dark blouse), medium shot from the hips up, positioned in the left part of the frame (14–36% of the frame width), standing relaxed by the large window of her small office, holding a cup of coffee with both hands, a calm half smile, looking out toward the empty right side; on the desk beside her, her smartphone lies face-up with a soft cyan screen glow (no interface). Her small, tidy office at first light; through the window behind her, a cold dawn: a deep navy sky with a thin cyan-white glow on the horizon, background softly out of focus, the environment existing only on the left side of the frame. Lighting: the cold cyan-white dawn glow from the window behind her draws a rim on her hair and shoulders, a soft indigo (#455DFF) fill comes from the empty right side, faint haze; no warm colors at all. The shadow side of the person dissolves into the dark background with no hard edges. The right 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 50% of the width, the top of the head at about 44% of the frame height, standing by the window with the coffee cup, her shoulders and waist visible, the cold dawn rim of the horizon visible through the window behind her shoulders. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/cta-duena-tranquila/cta-duena-tranquila-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Espejo por CSS donde la alternancia lo pide

### 14. `cta-equipo` · P1 · lote A

| | |
|---|---|
| Estado | foto real · equipo-real · tono sol |
| Sujeto | El equipo real (mismos 6 recortes) asomando detrás de la cresta del horizonte al amanecer frío, a la derecha. |
| Lado del sujeto | derecha |
| Idea | Cierre compartido con el equipo. Fondo = placa limpia de cta-amanecer (sin Kain); los torsos se esconden detrás de la cresta: el equipo "amanece". |
| Usos | `/servicios/branding/` #cta-final · `/casos/` #cta-final · `/casos/logistica-n8n/` #cta-final · `/blog/como-verificar-partner-oficial-kommo/` #cta-final |
| Escritorio | 16:9. cta-amanecer-clean de fondo. Seis bustos en una fila ligeramente escalonada dentro de x 0.58–0.95, con la línea de hombros justo en la cresta (y≈0.72) para que el horizonte tape los cortes. Penumbra/cielo limpio x 0–0.55. |
| Móvil | Fondo = móvil de cta-amanecer limpio; bustos en dos filas tras la cresta (y≈0.86), cabezas en y≈0.62–0.78; 40 % superior vacío. |
| Luz | Contraluz del amanecer: filo cian-blanco detrás de las cabezas (compuesto), duotono navy/cian igual a equipo-real. |
| Alt | El equipo de Ingeniak frente a un horizonte que amanece |
| Notas | No se espeja nunca (personas reales). Por eso las páginas que lo usan llevan la escena anterior con el sujeto a la izquierda. |

**Fondo** — Nano Banana Pro en edición sobre el render elegido de cta-amanecer (escritorio y móvil):
```
Edit this exact image. Remove the robot completely and reconstruct the horizon crest, the cyan-white dawn rim and the sky exactly as they are behind him. Keep the camera, framing, light and every other pixel identical. No new objects. Absolutely no text, letters, numbers or logos.
```
**Composición** — composición (mismos recortes de equipo-real):
```
Bustos con los cortes escondidos detrás de la cresta; filo cian desde atrás (pantalla 45 %, más intenso que en equipo-real porque la luz viene del horizonte); duotono y grano iguales. Sin filtros generativos sobre caras.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/cta-amanecer/cta-amanecer-desk.png` — Render elegido de cta-amanecer (se le quita Kain).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/cta-amanecer/cta-amanecer-movil.png` — Móvil elegido de cta-amanecer (se le quita Kain).

**Fotos para componer:** 6 retratos reales en `materiales/equipo/`.

**Derivados:** Usa cta-amanecer-clean

### 15. `kommo-hero` · P1 · lote B

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain presentando un panel de cristal en blanco del que suben burbujas de chat de cristal vacías. |
| Lado del sujeto | izquierda |
| Idea | Portada de /kommo/ (y regreso al set en "Agente de IA dentro del chat"). En la página, el sello Kommo Partner va en HTML anclado; nunca dentro de la imagen. |
| Usos | `/kommo/` #hero · `/kommo/` #agente-chat · `/blog/como-verificar-partner-oficial-kommo/` #hero |
| Escritorio | 16:9 espejo del estándar: Kain de cuerpo completo en el lado izquierdo (cuerpo centrado en x≈0.28; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; transición x 0.40–0.45; penumbra limpia x 0.45–1. Bordes a #03040B en el último 7 %. Kain en x≈0.20; panel vertical frontal en x 0.30–0.43, y 0.20–0.70; columna de burbujas de chat vacías que suben detrás del panel. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Kain en x≈0.36; panel a su derecha (x≈0.64). |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, presenta un panel de cristal del que suben burbujas de conversación |
| Notas | También portada de /blog/como-verificar-partner-oficial-kommo/. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 20% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. Presenting the panel with an open palm, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–43% of the frame width, 20–70% of the height), a tall flat blank glass panel, frontal to the camera, perfectly empty with a faint cyan inner glow; from behind the panel a column of small blank glass chat bubbles rises softly into the dark, glowing cyan, nothing written in them. Silky dark-navy light waves far behind him on his side. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel with the rising blank chat bubbles floats to his right, around 64% of the width, inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/kommo-hero/kommo-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 16. `consultoria-hero` · P1 · lote B

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain consultor (saco navy abierto) junto a un panel de cristal en blanco con una ruta de 5 nodos (VKTOR sin letras). |
| Lado del sujeto | derecha |
| Idea | Portada de /servicios/consultoria-ia-empresas/. Encima del panel va el roadmap VKTOR en HTML. |
| Usos | `/servicios/consultoria-ia-empresas/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Kain en x≈0.79; panel vertical frontal entre Kain y el texto (x 0.56–0.70, y 0.24–0.66) con 5 nodos de luz unidos por una línea a media altura. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Kain en x≈0.66 y el panel a su izquierda (x≈0.38). |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, con saco de consultor junto a una ruta de cinco pasos en cristal |
| Notas | Vestuario nuevo: rechazar si el saco tapa la pantalla del pecho o cambia la cabeza. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He wears a slim, open, dark navy tailored blazer over his white body, with no logos; the open blazer leaves the square chest screen fully visible. He stands in the right part of the frame with his body centered at 79% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. One hand resting on the edge of the panel, the other open palm toward the empty side, like a consultant presenting a plan. Floating upright beside him, between the robot and the empty side (about 56–70% of the frame width, 24–66% of the height), a tall flat blank glass panel, frontal to the camera; across its middle, five small square nodes of light connected by one thin cyan line, like a route with five stops, nothing written. A dark, quiet strategy room implied only by a faint glass wall far behind him on his side, dissolving into navy haze. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 66% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The blank glass panel with its five connected light nodes floats to his left, around 36% of the width, inside the lower 60% of the frame. He keeps the open dark navy blazer. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/consultoria-hero/consultoria-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 17. `kain-hero` · P1 · lote B

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain al centro, saludando de frente, con un halo circular cian y ondas sedosas detrás. |
| Lado del sujeto | centro |
| Idea | Portada de /kain/ (subject-center): H1 abajo a la izquierda y CTAs abajo a la derecha flanquean a Kain sobre la banda inferior oscura de la misma imagen. |
| Usos | `/kain/` #hero |
| Escritorio | 16:9 centrado. Kain en x≈0.50 (antenas y≈0.10, pies y≈0.70), halo circular detrás. Tercios izquierdo y derecho limpios; el 28 % inferior es piso oscuro con reflejo que cae a #03040B (ahí va el texto). |
| Móvil | Kain centrado (x≈0.50), antenas en y≈0.42, pies en y≈0.86; halo detrás; 40 % superior vacío para logotipo kain + H1. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Halo circular cian detrás de la cabeza y el torso. |
| Alt | Kain, el agente de IA de Ingeniak, saluda de frente con un halo de luz cian detrás |
| Notas | El logotipo kain (minúsculas) va en HTML, nunca en la imagen. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the exact center of the frame (body centered at 50% of the width), facing the camera in a gentle three-quarter turn, the tips of his antennas at about 10% and his feet at about 70% of the frame height, waving hello with one raised hand, friendly, his square chest screen crisp and facing the camera. Behind him a large soft circular halo of cyan light and silky dark-navy light waves. A dark glossy reflective floor from 70% of the height down carries his reflection and fades to near-black. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind, soft indigo (#455DFF) fill from both sides. The left third and the right third of the frame are clean deep navy negative space, and the bottom 28% below his feet is dark floor fading to near-black (#03040B), all clean for typography: no objects, no light sources, no particles. All four edges fade to near-black in the last 7%. 50mm lens, f/2.8, subtle film grain, HDR. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 50% of the width, the tips of his antennas at about 42% of the frame height and his feet at about 86%, chest screen facing the camera. He waves hello at the center of the frame; the soft circular cyan halo glows behind him. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saluda.png` — Pose: saludar con la mano levantada.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/kain-hero/kain-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saluda.png` — Pose: saludar con la mano levantada.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Recorte con alfa (opcional) para el clip WebM/HEVC con alfa de P1 (video aparte, clips_fondo_transparente) · Copia desenfocada 320 px

### 18. `discovery-hero` · P1 · lote B

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | Dueño de pyme (45) tranquilo junto al ventanal de su oficina al anochecer; en primer término, su silla ejecutiva VACÍA ("la silla vacía"). |
| Lado del sujeto | derecha |
| Idea | Portada de /discovery/. Su gemela (discovery-cta-final) pone a Kain en esa silla al amanecer. |
| Usos | `/discovery/` #hero |
| Escritorio | 16:9. Persona en plano medio del lado derecho (x 0.62–0.86), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % izquierdo; el lado en sombra se disuelve en el fondo. Silla ejecutiva vacía y nítida en x 0.58–0.70 frente a un escritorio ordenado (base y asiento completos, para que en la gemela Kain se siente con los pies visibles); el dueño de pie junto al ventanal en x 0.76–0.90. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Silla vacía en x≈0.40 y el dueño en x≈0.70, ambos en el 60 % inferior. |
| Luz | Último azul del anochecer por la ventana con filo cian-blanco en el horizonte; borde frío en el dueño; sin tonos cálidos. |
| Alt | Dueño de negocio tranquilo junto a la ventana de su oficina, con su silla vacía en primer plano (imagen ilustrativa) |
| Notas | La silla vacía es el concepto del VSL. Guardar semilla. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican small-business owner (45, man, short hair, light-blue shirt with rolled-up sleeves, no tie), medium-long shot from the knees up, positioned in the right part of the frame (58–90% of the frame width), standing calm by the large window of his office at dusk, one hand in his pocket, looking toward the empty left side, at peace; in the foreground beside him, between him and the empty side (about 58–70% of the frame width), his empty black executive chair turned slightly toward the camera, sharp and clearly empty, its seat and base fully visible, in front of a tidy desk. Behind him the window shows the city at the last light of dusk, a deep blue sky with a thin cold cyan-white glow on the horizon; the office dissolves into navy shadow, background softly out of focus, the environment existing only on the right side of the frame. Lighting: the cold dusk light from the window draws a cyan rim on his hair, shoulders and on the edges of the empty chair, soft indigo (#455DFF) fill from the empty left side; no warm tones. The shadow side of the person dissolves into the dark background with no hard edges. The left 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 60% of the width, the top of the head at about 44% of the frame height, the empty executive chair sharp in front of him at about 40% of the width, its seat and base visible, the man standing by the window at about 70% of the width. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/discovery-hero/discovery-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Base de la edición discovery-cta-final (escritorio y móvil) · Póster alterno del VSL (opcional)

### 19. `discovery-cta-final` · P1 · lote B

| | |
|---|---|
| Estado | edición (edición de `discovery-hero`) · kain+persona · tono sol |
| Sujeto | El mismo encuadre de la portada de Discovery, ahora al amanecer frío, con Kain sentado en la silla del dueño saludando. |
| Lado del sujeto | derecha |
| Idea | Cierre propio de /discovery/: la silla ya no está vacía; el sistema ocupa el lugar y el dueño recupera su tiempo. |
| Usos | `/discovery/` #cta-final |
| Escritorio | Edición de discovery-hero (mismas dimensiones y cámara). Kain sentado en la silla (x≈0.64), de cuerpo completo, pies visibles sobre la base o el piso, saludando hacia el texto; el dueño igual que en A. |
| Móvil | Edición del móvil de discovery-hero con la misma instrucción. |
| Luz | Amanecer frío por la ventana (misma luz que cta-amanecer). |
| Alt | Kain, el agente de IA de Ingeniak, sentado en la silla del dueño al amanecer mientras él descansa junto a la ventana |
| Notas | Referencia 1 = render ELEGIDO de discovery-hero. |

**Prompt escritorio (16:9):**
```
Edit this exact image (the first reference). Keep the camera, the framing, the office, the desk, the window and the man with his pose exactly identical. Change the light outside the window from dusk to a cold dawn: a deep navy sky with a thin cyan-white glow on the horizon. Add KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints), sitting in the empty executive chair, FULL BODY from the tips of the antennas to his feet, feet visible resting on the base of the chair, turned toward the empty left side, raising one hand in a friendly greeting, chest screen visible, lit by a cyan and electric-blue rim light. The left 55% stays clean dark navy with no objects. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Edit this exact image (the first reference). Keep the camera, framing, office, chair and the man identical. Change the window light to a cold dawn with a thin cyan-white horizon glow. Add KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints), sitting in the executive chair, FULL BODY with his feet visible on the chair base, one hand raised in greeting, chest screen visible, cyan rim light. The top 40% stays an empty near-black void. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/discovery-hero/discovery-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saluda.png` — Pose: saludar con la mano levantada.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/discovery-hero/discovery-hero-movil.png` — Render móvil ELEGIDO de esta misma placa.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-saluda.png` — Pose: saludar con la mano levantada.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).

**Derivados:** —

### 20. `discovery-para-quien` · P1 · lote B

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | Dueña de pyme (38) en su oficina pequeña y ordenada, en videollamada con la laptop, postura abierta y segura. |
| Lado del sujeto | izquierda |
| Idea | "Es para ti si… / No es para ti si…" en /discovery/. |
| Usos | `/discovery/` #para-quien |
| Escritorio | 16:9. Persona en plano medio del lado izquierdo (x 0.14–0.38), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % derecho; el lado en sombra se disuelve en el fondo. Sentada al escritorio (x 0.14–0.38), laptop en ángulo sin UI visible. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Modo below: la lista larga corre debajo. Modo móvil: `below`. |
| Luz | Luz de borde fría cian/azul desde atrás (pelo y hombros), relleno índigo suave desde el lado del texto, niebla volumétrica tenue; gradado azul monocromo. |
| Alt | Dueña de negocio en una videollamada desde su oficina (imagen ilustrativa) |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican business owner (38, woman, dark hair in a low ponytail, white shirt and dark blazer), medium shot from the waist up, positioned in the left part of the frame (14–38% of the frame width), sitting at her desk in a small, tidy office, on a video call on her open laptop (the screen is a soft glow with no interface, angled away from the camera), leaning slightly forward, open and confident, mid-sentence, a gentle smile. Cool window light from behind her and a bookshelf with no readable spines out of focus, background softly out of focus, the environment existing only on the left side of the frame. Lighting: a cool cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind on hair and shoulders, a soft indigo (#455DFF) fill from the empty right side, faint volumetric haze. The shadow side of the person dissolves into the dark background with no hard edges. The right 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 46% of the width, the top of the head at about 44% of the frame height, seated at the desk facing the laptop, her hands visible. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/discovery-para-quien/discovery-para-quien-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** —

### 20b. `discovery-vsl-poster` · P1 · lote B (r1)

| | |
|---|---|
| Estado | edición · sin sujeto · tono sol |
| Sujeto | La silla vacía del VSL al centro, frente al escritorio con pantallas de cristal apagadas. Sin persona. |
| Lado del sujeto | centro |
| Idea | Fondo de la escena del VSL (`VideoScene`): la imagen es la sección, H2 abajo a la izquierda y botón de reproducir abajo a la derecha, flanqueando la silla. Al hacer clic, el video se abre a pantalla completa. |
| Usos | `/discovery/` #video |
| Escritorio | 16:9. Silla al centro (x 0.40–0.62, y 0.25–0.92); 28 % inferior y tercios laterales en penumbra para el texto y el botón; bordes a #03040B en el último 7 %. |
| Móvil | 4:5. 40 % superior vacío; silla en el 60 % inferior, centrada; el botón de reproducir va en el flujo del texto. |
| Luz | La del VSL: azul profundo con pantallas cian tenues; sin cálidos. |
| Alt | "" (decorativa; el contenido es el video, que lleva su título y subtítulos VTT) |
| Notas | `vsl-poster.jpg` NO sirve como fondo: trae el título horneado con una errata visual ("¿qué sedetiene?") y subtítulos quemados. Preferible exportar del MP4 un cuadro sin títulos (`ffmpeg -ss <t> -frames:v 1`) y limpiarlo. |

**Prompt escritorio (edición, referencia 1 = cuadro del VSL):**
```
Edit this exact image. Remove every piece of text, title, subtitle and caption completely, and reconstruct the background behind them (the dark office, the floating glass screens and the haze) exactly as it is. Keep the empty black office chair, the desk, the camera, the framing, the lighting and the colors identical. Make all the floating glass screens blank: soft cyan glow only, no interface, no charts, no numbers. Let all four edges fade to near-black (#03040B) in the last 7% of the frame. Absolutely no text, letters, numbers or logos.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 version of the same scene as the first reference image: the same empty black office chair and desk, the same blank glowing glass screens, the same light and grade, camera pulled back. The chair sits in the lower 60% of the frame, centered. The top 40% is an empty deep navy-to-near-black void (#03040B) with a faint haze. Edges fade to near-black. Absolutely no text, letters, numbers or logos.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/discovery/vsl-poster.jpg` — o, mejor, un cuadro limpio exportado de `discovery-session-vsl.mp4`.

**Derivados:** Póster del `<video>` (mismo archivo) · AVIF/WebP 1280 / 1920 y móvil 640 / 828 / 1080

### 21. `gohighlevel-hero` · P1 · lote B

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain tocando una casilla de un calendario de cristal flotante; algunas casillas se encienden en cian (sin números). |
| Lado del sujeto | derecha |
| Idea | Portada de /gohighlevel/ (y regreso al set en "Citas que se agendan y se confirman solas"). Nunca la palabra partner. |
| Usos | `/gohighlevel/` #hero · `/gohighlevel/` #calendario · `/blog/gohighlevel-en-espanol/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Kain en x≈0.79; calendario de cristal frontal entre Kain y el texto (x 0.56–0.70, y 0.26–0.62), cuadrícula de casillas vacías, algunas encendidas. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Kain en x≈0.66; calendario a su izquierda (x≈0.36). |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, confirma una cita en un calendario de cristal |
| Notas | También portada de /blog/gohighlevel-en-espanol/. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 79% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Touching one cell of the calendar with a fingertip, which lights up cyan, looking at it with quiet satisfaction. Floating upright beside him, between the robot and the empty side (about 56–70% of the frame width, 26–62% of the height), a flat frontal glass calendar panel: a clean grid of empty square cells, a few of them glowing cyan, no numbers, no letters, no names of days. A faint glass desk edge and haze behind him on his side, dissolving into navy. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 66% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The glass calendar grid with a few glowing cells floats to his left, around 36% of the width, inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/gohighlevel-hero/gohighlevel-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 22. `dolor-crm` · P1 · lote B

| | |
|---|---|
| Estado | nueva · persona · tono dolor |
| Sujeto | Gerente comercial (40) de noche en una oficina oscura, con la mano en la frente frente a la laptop; detrás, un muro de notas adhesivas en blanco. |
| Lado del sujeto | izquierda |
| Idea | Dolor "Un CRM que nadie usa". Placa de "Señales" de /servicios/crm-con-ia/, /kommo/ (espejo) y /gohighlevel/. |
| Usos | `/servicios/crm-con-ia/` #senales · `/kommo/` #senales (espejo) · `/gohighlevel/` #senales |
| Escritorio | 16:9. Persona en plano medio/americano del lado izquierdo (x 0.12–0.38), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % derecho; el lado en sombra de la persona se disuelve en el fondo, sin bordes duros. Bordes a #03040B. Plano medio desde la cintura, sentada al escritorio (x 0.14–0.38); muro de cristal con decenas de notas adhesivas EN BLANCO detrás de ella. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío para texto; persona en el 60 % inferior (coronilla y≈0.44), centrada x≈0.55, el torso se disuelve en sombra hacia el borde inferior. subjTop ≈ 0.44. Modo below: la parte inferior asoma arriba de la lista de dolores. Modo móvil: `below`. |
| Luz | Tono DOLOR: una sola luz práctica ámbar #FFB547 (celular, lámpara o pantalla) sobre rostro y manos; cero cian salvo un filo frío casi imperceptible; todo lo demás cae a navy. Es la única excepción al "sin luz cálida". |
| Alt | Gerente comercial agotada de noche frente a su laptop, rodeada de notas sin seguimiento (imagen ilustrativa) |
| Notas | Rechazar si alguna nota adhesiva trae garabatos o letras. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican sales manager (40, woman, shoulder-length dark hair, dark blazer), medium shot from the waist up, positioned in the left part of the frame (14–38% of the frame width), sitting at a desk in a dark office at night, one hand on her forehead, looking at an open laptop whose screen is a dim amber glow (no interface), overwhelmed. Behind her, a glass wall covered with dozens of blank paper sticky notes with nothing written on them, and a pile of unopened folders on the desk; the office dissolves into navy shadow, background softly out of focus, the environment existing only on the left side of the frame. Lighting: a single motivated warm amber (#FFB547) practical light from the laptop screen and a small desk lamp on the face and hands, quiet and tired; no cyan light except a very faint cold edge on one shoulder; everything else falls into deep navy shadow. The shadow side of the person dissolves into the dark background with no hard edges. The right 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, dark navy grade where the amber practical is the only warm accent, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 48% of the width, the top of the head at about 44% of the frame height, seated at the desk, the laptop glow on her face, the wall of blank sticky notes behind her shoulders. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/dolor-crm/dolor-crm-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Espejo por CSS en /kommo/

### 23. `dolor-operacion` · P1 · lote B

| | |
|---|---|
| Estado | nueva · persona · tono dolor |
| Sujeto | Dueño (46) de pie en su escritorio de noche, celular al oído, otro celular encendido sobre la mesa y papeles en la mano. |
| Lado del sujeto | izquierda |
| Idea | Dolor "Todo pasa por ti". Placa de "Señales" de /servicios/consultoria-ia-empresas/, /servicios/automatizacion-n8n/ y /servicios/desarrollo-software/. |
| Usos | `/servicios/consultoria-ia-empresas/` #senales · `/servicios/automatizacion-n8n/` #senales · `/servicios/desarrollo-software/` #senales |
| Escritorio | 16:9. Persona en plano medio/americano del lado izquierdo (x 0.12–0.38), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % derecho; el lado en sombra de la persona se disuelve en el fondo, sin bordes duros. Bordes a #03040B. Plano medio desde la cintura (x 0.14–0.38) en una trastienda con carpetas apiladas y un monitor ámbar sin UI. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío para texto; persona en el 60 % inferior (coronilla y≈0.44), centrada x≈0.55, el torso se disuelve en sombra hacia el borde inferior. subjTop ≈ 0.44. Modo below. Modo móvil: `below`. |
| Luz | Tono DOLOR: una sola luz práctica ámbar #FFB547 (celular, lámpara o pantalla) sobre rostro y manos; cero cian salvo un filo frío casi imperceptible; todo lo demás cae a navy. Es la única excepción al "sin luz cálida". |
| Alt | Dueño de negocio de noche, con el teléfono en el oído y papeles en la mano: todo pasa por él (imagen ilustrativa) |
| Notas | Rechazar si los papeles muestran texto legible. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican business owner (46, man, rolled-up shirt sleeves, tired eyes), medium shot from the waist up, positioned in the left part of the frame (14–38% of the frame width), standing at a cluttered desk late at night with a phone pressed to his ear while a second phone lights up on the desk and his other hand holds a stack of paper forms, stretched thin. A back office with stacks of paper folders, a calculator and a monitor glowing dim amber with no interface, shelves dissolving into navy shadow, background softly out of focus, the environment existing only on the left side of the frame. Lighting: a single motivated warm amber (#FFB547) practical light from a desk lamp and the glow of the monitor on the face and hands, quiet and tired; no cyan light except a very faint cold edge on one shoulder; everything else falls into deep navy shadow. The shadow side of the person dissolves into the dark background with no hard edges. The right 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, dark navy grade where the amber practical is the only warm accent, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 48% of the width, the top of the head at about 44% of the frame height, standing at the desk with the phone to his ear, the papers in his hand, the second phone glowing on the desk. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/dolor-operacion/dolor-operacion-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** —

### 24. `servicios-hero` · P1 · lote B

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain como arquitecto del sistema: al pie de un árbol de luz con la geometría del isotipo del que cuelgan 11 placas de cristal en blanco (los 11 servicios en 3 grupos). |
| Lado del sujeto | derecha |
| Idea | Portada del hub /servicios/. El árbol es el sistema completo; las placas no llevan nada escrito. |
| Usos | `/servicios/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Kain en x≈0.70; detrás, un pilar de luz con ramas a 45° y nodos cuadrados que sube hasta y≈0.10, con 11 placas pequeñas de cristal vacías en 3 alturas, todo dentro de x 0.60–0.95. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. El árbol de luz detrás de Kain, recortado en y≈0.42 para no invadir el vacío superior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, al pie de una estructura de luz que conecta todos los servicios |
| Notas | D asignaba una arquitecta (persona); se cambia a Kain por la regla de casting (servicios = Kain trabajando). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 70% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Standing at the base of the structure, one open palm presenting toward the empty side, looking toward it with confidence. Rising behind him on his side of the frame, a tall branching structure of light: a vertical luminous pillar with thin branches that split at 45-degree angles and end in small square nodes, like a living circuit tree; from some of the nodes hang small floating blank glass tiles at three different heights and depths, eleven tiles in total, glowing faintly. The structure stays within the right 40% of the frame and fades into haze before the empty side; silky dark-navy light waves far behind. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 56% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The branching tree of light with its small blank glass tiles rises behind him but stays below 42% of the frame height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/servicios-hero/servicios-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 25. `servicios-no-se` · P1 · lote B

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain señalando hacia el texto, con tres paneles de cristal vacíos flotando detrás de él (las opciones). |
| Lado del sujeto | izquierda |
| Idea | "¿No sabes por dónde empezar?" en /servicios/. En espejo es la portada de /blog/kommo-vs-gohighlevel/ (elegir camino). |
| Usos | `/servicios/` #no-se · `/blog/kommo-vs-gohighlevel/` #hero (espejo) |
| Escritorio | 16:9 espejo del estándar: Kain de cuerpo completo en el lado izquierdo (cuerpo centrado en x≈0.28; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; transición x 0.40–0.45; penumbra limpia x 0.45–1. Bordes a #03040B en el último 7 %. Kain en x≈0.28 señalando con el brazo extendido hacia el texto; tres paneles de cristal vacíos desenfocados detrás de él (x 0.06–0.38) y tres caminos tenues de luz en el piso que se abren hacia el fondo, nunca hacia el texto. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Kain en x≈0.44 señalando hacia arriba a la derecha (hacia el CTA). |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, señala el camino frente a tres opciones de cristal |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 28% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. Pointing clearly with one arm extended toward the empty right side, as if showing the way, friendly head tilt. Behind him, on his side of the frame, three tall blank glass panels float at different depths, softly out of focus, each glowing faintly cyan; three faint paths of light on the floor fork from his feet into the depth behind him, never toward the empty side. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 44% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. He points up and to the right, toward the empty space above; the three blank glass panels float softly out of focus behind him. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-senala.png` — Pose: señalar hacia un lado.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/servicios-no-se/servicios-no-se-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-senala.png` — Pose: señalar hacia un lado.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Espejo por CSS para /blog/kommo-vs-gohighlevel/

### 26. `riel-servicios` · P1 · lote B

| | |
|---|---|
| Estado | nueva · sin-sujeto · tono sol |
| Sujeto | Sin sujeto: piso oscuro con un riel de luz cian y 5 nodos cuadrados (el pilar del isotipo acostado). |
| Lado del sujeto | — |
| Idea | Fondo compartido de SystemFlow ("Cómo funciona") en las 11 páginas de servicio y del bloque "conexión" de /servicios/. Los logos y nombres van en HTML sobre los nodos. |
| Usos | `/servicios/` #conexion · `/servicios/consultoria-ia-empresas/` #como-funciona · `/servicios/agentes-ia-whatsapp/` #como-funciona · `/servicios/crm-con-ia/` #como-funciona · `/kommo/` #como-funciona · `/gohighlevel/` #como-funciona · `/servicios/automatizacion-n8n/` #como-funciona · `/servicios/paid-media/` #como-funciona · `/servicios/paginas-web/` #como-funciona · `/servicios/desarrollo-software/` #como-funciona · `/servicios/seo/` #como-funciona · `/servicios/branding/` #como-funciona |
| Escritorio | 16:9. Horizonte del piso en y≈0.62; riel recto que cruza todo el ancho en y≈0.80 con 5 nodos en x 0.14 / 0.32 / 0.50 / 0.68 / 0.86. Todo lo de arriba (70 %) es vacío navy limpio. |
| Móvil | Versión vertical: un pilar de luz vertical en x≈0.12 desde y 0.20 hasta 0.95 con 5 nodos cuadrados en y 0.30 / 0.45 / 0.60 / 0.75 / 0.90; el resto es vacío (el flujo baja en vertical en móvil). |
| Luz | La única luz es el riel y sus nodos (cian/azul), con reflejo en el piso. |
| Alt | (decorativa, alt vacío) |
| Notas | Imagen decorativa: alt vacío (el contenido del flujo está en HTML). ESPEC la pedía 21:9; se genera 16:9 como el resto de la serie. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 night scene, premium 3D render, part of one consistent cinematic series, no characters. A vast dark glossy reflective floor whose horizon sits at 62% of the frame height. Along the floor, at 80% of the frame height, a thin glowing cyan (#00E5FF) light rail crosses the full width from the left edge to the right edge, perfectly straight and level, with five small square glowing nodes evenly spaced along it at 14%, 32%, 50%, 68% and 86% of the width, each node casting a soft reflection on the floor. Above the horizon everything is clean deep navy (#0A1F4C) falling off to near-black (#03040B) with only a very faint haze: no objects, no light sources, no particles. The rail and its nodes are the only light, cyan with an electric-blue (#0055FF) halo. All four edges fade to near-black in the last 7%. 35mm lens, f/4, subtle film grain, HDR. Absolutely no text, letters, numbers, logos, icons, people or robots.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 image in the same style and color grade as the first reference, no characters. A thin glowing cyan (#00E5FF) light pillar runs vertically at 12% of the width, from 20% down to 95% of the frame height, with five small square glowing nodes along it at 30%, 45%, 60%, 75% and 90% of the height, each with a soft electric-blue halo. Everything else is clean deep navy fading to near-black (#03040B), faint haze only, no objects, no light sources. Edges fade to near-black. Absolutely no text, letters, numbers, logos, icons, people or robots.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/riel-servicios/riel-servicios-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** —

### 27. `kain-si-no` · P1 · lote B

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain pensativo: un brazo cruzado bajo la pantalla del pecho y la otra mano en la barbilla, sobre una plataforma de cristal, con esferas de luz desenfocadas alrededor. |
| Lado del sujeto | izquierda |
| Idea | "Lo que sí hago y lo que no" en /kain/ y portada de /preguntas-frecuentes/ (pensativo = preguntas). |
| Usos | `/kain/` #si-no · `/preguntas-frecuentes/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.26; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Plataforma redonda de cristal bajo sus pies; 5–7 esferas pequeñas de luz cian desenfocadas a distintas profundidades de su lado. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.46; esferas alrededor, todas bajo y≈0.42. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, pensativo con una mano en la barbilla |
| Notas | Rechazar si el brazo tapa el asterisco del pecho. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 26% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. Thoughtful pose: one arm folded across his body below the chest screen, so the glowing asterisk stays fully visible, the other hand raised to his chin, head slightly tilted, eyes narrowed in concentration. He stands on a low round glass platform that glows faintly at its edge; around him on his side, five to seven small out-of-focus spheres of cyan light float at different depths like open questions. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 46% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. Same thoughtful pose on the low round glass platform; the small out-of-focus spheres of light float around him, all below 42% of the frame height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-brazos-cruzados.png` — Pose: brazos cruzados bajo la pantalla del pecho.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/kain-si-no/kain-si-no-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-brazos-cruzados.png` — Pose: brazos cruzados bajo la pantalla del pecho.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 28. `guadalajara-hero` · P1 · lote B

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | Empresario tapatío (45) en la terraza de su oficina a la hora azul, con Guadalajara desenfocada detrás. |
| Lado del sujeto | derecha |
| Idea | Portada de /agentes-ia-guadalajara/ (landing local que ya posiciona). |
| Usos | `/agentes-ia-guadalajara/` #hero |
| Escritorio | 16:9. Persona en plano medio del lado derecho (x 0.62–0.86), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % izquierdo; el lado en sombra se disuelve en el fondo. Manos en los bolsillos, mirando hacia el texto; ciudad en bokeh frío solo del lado derecho. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Ciudad en bokeh detrás de sus hombros. |
| Luz | Hora azul fría (D pedía atardecer dorado: se cambia, el cálido es solo para dolor). |
| Alt | Empresario de Guadalajara en la terraza de su oficina a la hora azul (imagen ilustrativa) |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican businessman from Guadalajara (45, short dark hair, light beard, dark open-collar shirt and dark jacket), medium shot from the waist up, positioned in the right part of the frame (62–86% of the frame width), standing on an office terrace at blue hour, relaxed and confident, hands in his pockets, looking toward the empty left side. Behind him on his side, a large Mexican metropolitan area out of focus at blue hour, cool city lights as bokeh, no recognizable monuments, deep blue sky, background softly out of focus, the environment existing only on the right side of the frame. Lighting: a cool cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind on hair and shoulders, a soft indigo (#455DFF) fill from the empty left side, faint volumetric haze. The shadow side of the person dissolves into the dark background with no hard edges. The left 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 56% of the width, the top of the head at about 44% of the frame height, his hands in his pockets, the blurred city lights behind his shoulders. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/guadalajara-hero/guadalajara-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Copia desenfocada 320 px

### 29. `nosotros-manifiesto` · P1 · lote B

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain en una terraza alta de noche mirando la zona metropolitana de Guadalajara; de sus pies salen ramas de luz hacia la ciudad, como una red. |
| Lado del sujeto | derecha |
| Idea | Manifiesto de /nosotros/ y, en espejo, "Local y con alcance" de /agentes-ia-guadalajara/ (Guadalajara como sede, la red hacia 7 países). |
| Usos | `/nosotros/` #manifiesto · `/agentes-ia-guadalajara/` #local-alcance (espejo) |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.7; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Kain junto al barandal de cristal en 3/4 hacia la ciudad (perfil), pantalla del pecho visible en ángulo; la ciudad desenfocada solo del lado derecho (abajo-derecha); el lado izquierdo es cielo nocturno navy limpio. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.56 en el barandal; la ciudad desenfocada en el 30 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La ciudad aporta solo bokeh azul y cian frío. |
| Alt | Kain, el agente de IA de Ingeniak, mira de noche la zona metropolitana de Guadalajara desde una terraza |
| Notas | Sin monumentos reconocibles (evita afirmar una ubicación exacta). Sustituye a dos placas de D (nosotros-manifiesto y guadalajara-local-alcance). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 70% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Standing at the glass railing of a high terrace at night, in a three-quarter view turned toward the city on his side, face in profile looking out over it, his chest screen still visible at an angle. Below and behind him on his side, the vast night view of a large Mexican metropolitan area (Guadalajara), out of focus in cool blue and cyan bokeh, no recognizable landmarks; from the terrace floor, thin branches of light with 45-degree elbows run out from under his feet over the edge toward the city like a network. The city lights exist only on the right side; toward the left the view falls into deep darkness and clean night sky. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 56% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. He stands at the glass railing; the out-of-focus city lights fill only the bottom 30% of the frame, with the thin branches of light running toward them. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/nosotros-manifiesto/nosotros-manifiesto-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Espejo por CSS para /agentes-ia-guadalajara/ (local-alcance) · Copia desenfocada 320 px

### 30. `blog-hero` · P1 · lote B

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | Lectora (35) en un sillón junto a un ventanal nocturno, leyendo en una tableta que le ilumina el rostro en cian. |
| Lado del sujeto | derecha |
| Idea | Portada del hub /blog/. |
| Usos | `/blog/` #hero |
| Escritorio | 16:9. Persona en plano medio del lado derecho (x 0.62–0.86), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % izquierdo; el lado en sombra se disuelve en el fondo. Sentada en un sillón (x 0.62–0.88); ventanal con ciudad en bokeh frío detrás. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Sentada, tableta a la altura del pecho. |
| Luz | Luz de borde fría cian/azul desde atrás (pelo y hombros), relleno índigo suave desde el lado del texto, niebla volumétrica tenue; gradado azul monocromo. |
| Alt | Mujer leyendo en una tableta de noche junto a un ventanal (imagen ilustrativa) |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican woman (35, wavy dark hair, dark knit sweater), medium shot, positioned in the right part of the frame (62–88% of the frame width), sitting in a lounge armchair by a large window at night, reading on a tablet whose screen glows soft cyan (no interface) on her face, focused, a cup of tea on a side table. Behind her, the window shows a softly blurred city at night in cool blue bokeh, background softly out of focus, the environment existing only on the right side of the frame. Lighting: a cool cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind on hair and shoulders, a soft indigo (#455DFF) fill from the empty left side, faint volumetric haze. The shadow side of the person dissolves into the dark background with no hard edges. The left 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 56% of the width, the top of the head at about 44% of the frame height, sitting in the armchair with the tablet at chest height, its cyan glow on her face. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/blog-hero/blog-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Copia desenfocada 320 px

### 31. `industrias-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain al inicio de una galería de 8 puertas de cristal en arco, cada una con un interior distinto apenas sugerido (clínica, salón, nave, tienda…). |
| Lado del sujeto | derecha |
| Idea | Portada del hub /industrias/: el mismo sistema, ocho locaciones. |
| Usos | `/industrias/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo en el lado derecho (cuerpo centrado en x≈0.72; antenas en y≈0.12, pies en y≈0.86 sobre piso negro brillante con reflejo), 3/4 hacia el texto, pantalla del pecho de frente (≥3 % del ancho). Zona del sujeto x 0.60–0.95 (≈40 %); transición de luz x 0.55–0.60; penumbra limpia x 0–0.55 (navy #0A1F4C → #03040B, sin objetos ni luces). Bordes caen a #03040B en el último 7 %. Kain en x≈0.68; la galería de 8 arcos retrocede en perspectiva hacia el borde derecho (x 0.62–0.95) y se apaga antes del texto. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Los arcos detrás de Kain en profundidad, todos bajo y≈0.42. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. Cada arco brilla por dentro con luz fría. |
| Alt | Kain, el agente de IA de Ingeniak, frente a una galería de puertas de luz que llevan a distintas industrias |
| Notas | No adjuntar magnific_cinematic-…tf3pBv2mZJ (tiene arcos pero trae el logotipo). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 68% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Standing at the start of the gallery, one open hand presenting toward the empty side, looking toward it. Behind him, on his side of the frame, a gallery of eight tall arched glass doorways recedes in perspective toward the right edge, each doorway glowing softly from within with cool cyan-white light and a faint blurred hint of a different interior (a clinic, a salon, a warehouse, a shop, an office, a restaurant), nothing readable, no icons; the doorways fade into haze before the empty side. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 56% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The gallery of glowing arched glass doorways recedes behind him, staying below 42% of the frame height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/industrias-hero/industrias-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 32. `ind-salud-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain en el ambiente de Salud (bata blanca abierta + estetoscopio (vestuario validado)); una persona del sector, secundaria y desenfocada, al fondo de su lado. |
| Lado del sujeto | derecha |
| Idea | Portada de la industria Salud. Kain es el protagonista nítido; la persona del sector da contexto, desenfocada y detrás. También es fondo del LocationSwitcher del inicio (ESC 10) y de /industrias/. |
| Usos | `/` #industrias · `/industrias/` #grid · `/industrias/salud/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.66; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Persona secundaria desenfocada en x 0.82–0.92, más chica que Kain por profundidad, nunca en el lado del texto. El ambiente existe solo del lado derecho y se apaga hacia la izquierda. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.52; la persona desenfocada al fondo en x≈0.80; ambiente solo en el 60 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La luz del ambiente es fría (sin tonos cálidos). |
| Alt | Kain, el agente de IA de Ingeniak, con bata en un consultorio dental; al fondo, una odontóloga (imagen ilustrativa) |
| Notas | Vestuario: bata blanca abierta + estetoscopio (vestuario validado). Rechazar si tapa la pantalla del pecho o las antenas. Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He wears an open white doctor coat with a stethoscope around his neck, exactly like the costume reference; the open coat leaves the square chest screen fully visible. He stands in the right part of the frame with his body centered at 66% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Holding a small blank glass tablet against his side with one hand and gesturing toward the empty side with the other, attentive. A modern, minimal dental clinic at the end of the day: a dental chair and a soft overhead lamp out of focus behind him, white surfaces turned blue-grey by the grade, cool clinical light. Behind him in the midground, around 82–92% of the frame width, a female dentist (40) in a white coat preparing instruments at the back, softly out of focus, smaller and clearly secondary, never entering the empty side. The environment exists only on the right side of the frame and falls into darkness toward the left. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 52% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same environment and the same secondary person (softly out of focus, behind him at about 80% of the width) stay inside the lower 60% of the frame. He keeps the same costume, with the chest screen visible. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-doctor-recorte.png` — Vestuario validado: bata blanca abierta + estetoscopio (pantalla del pecho visible).
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-doctor-brazos-cruzados.png` — Vestuario de doctor, segunda vista.
4. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
5. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-salud-hero/ind-salud-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-doctor-recorte.png` — Vestuario validado: bata blanca abierta + estetoscopio (pantalla del pecho visible).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake y DayTimeline) · Still 1920 px para el LocationSwitcher del inicio y de /industrias/ · Mini plano 4:5 para el carrusel móvil del inicio

### 33. `ind-belleza-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain en el ambiente de Belleza y estética; una persona del sector, secundaria y desenfocada, al fondo de su lado. |
| Lado del sujeto | derecha |
| Idea | Portada de la industria Belleza y estética. Kain es el protagonista nítido; la persona del sector da contexto, desenfocada y detrás. También es fondo del LocationSwitcher del inicio (ESC 10) y de /industrias/. |
| Usos | `/` #industrias · `/industrias/` #grid · `/industrias/belleza-estetica/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.66; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Persona secundaria desenfocada en x 0.82–0.92, más chica que Kain por profundidad, nunca en el lado del texto. El ambiente existe solo del lado derecho y se apaga hacia la izquierda. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.52; la persona desenfocada al fondo en x≈0.80; ambiente solo en el 60 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La luz del ambiente es fría (sin tonos cálidos). |
| Alt | Kain, el agente de IA de Ingeniak, en un spa minimalista; al fondo, una especialista de belleza (imagen ilustrativa) |
| Notas | Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 66% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Presenting the space with an open palm, welcoming. A minimalist aesthetic clinic and spa at night: a treatment bed with folded towels, smooth stone walls and a few green plants out of focus, soft cool light. Behind him in the midground, around 82–92% of the frame width, a beauty professional (35, woman, dark uniform) arranging towels in the background, softly out of focus, smaller and clearly secondary, never entering the empty side. The environment exists only on the right side of the frame and falls into darkness toward the left. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 52% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same environment and the same secondary person (softly out of focus, behind him at about 80% of the width) stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-belleza-hero/ind-belleza-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake y DayTimeline) · Still 1920 px para el LocationSwitcher del inicio y de /industrias/ · Mini plano 4:5 para el carrusel móvil del inicio

### 34. `ind-nutricion-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain en el ambiente de Nutrición; una persona del sector, secundaria y desenfocada, al fondo de su lado. |
| Lado del sujeto | derecha |
| Idea | Portada de la industria Nutrición. Kain es el protagonista nítido; la persona del sector da contexto, desenfocada y detrás. También es fondo del LocationSwitcher del inicio (ESC 10) y de /industrias/. |
| Usos | `/` #industrias · `/industrias/` #grid · `/industrias/nutricion/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.66; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Persona secundaria desenfocada en x 0.82–0.92, más chica que Kain por profundidad, nunca en el lado del texto. El ambiente existe solo del lado derecho y se apaga hacia la izquierda. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.52; la persona desenfocada al fondo en x≈0.80; ambiente solo en el 60 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La luz del ambiente es fría (sin tonos cálidos). |
| Alt | Kain, el agente de IA de Ingeniak, en un consultorio de nutrición; al fondo, una nutrióloga (imagen ilustrativa) |
| Notas | Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 66% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Holding a blank glass tablet in both hands at waist height, below the chest screen, looking toward the empty side with a friendly expression. A bright, minimal nutrition consultancy at dusk: a light wooden counter with a bowl of fruit and a glass of water, a body-composition scale in the corner, all out of focus and desaturated by the cool grade. Behind him in the midground, around 82–92% of the frame width, a nutritionist (32, woman, light coat) writing on a clipboard with nothing readable, softly out of focus, smaller and clearly secondary, never entering the empty side. The environment exists only on the right side of the frame and falls into darkness toward the left. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 52% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same environment and the same secondary person (softly out of focus, behind him at about 80% of the width) stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-nutricion-hero/ind-nutricion-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake y DayTimeline) · Still 1920 px para el LocationSwitcher del inicio y de /industrias/ · Mini plano 4:5 para el carrusel móvil del inicio

### 35. `ind-finanzas-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain en el ambiente de Finanzas; una persona del sector, secundaria y desenfocada, al fondo de su lado. |
| Lado del sujeto | derecha |
| Idea | Portada de la industria Finanzas. Kain es el protagonista nítido; la persona del sector da contexto, desenfocada y detrás. También es fondo del LocationSwitcher del inicio (ESC 10) y de /industrias/. |
| Usos | `/` #industrias · `/industrias/` #grid · `/industrias/finanzas/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.66; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Persona secundaria desenfocada en x 0.82–0.92, más chica que Kain por profundidad, nunca en el lado del texto. El ambiente existe solo del lado derecho y se apaga hacia la izquierda. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.52; la persona desenfocada al fondo en x≈0.80; ambiente solo en el 60 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La luz del ambiente es fría (sin tonos cálidos). |
| Alt | Kain, el agente de IA de Ingeniak, en una oficina financiera de noche; al fondo, un asesor (imagen ilustrativa) |
| Notas | Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 66% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. One hand resting on the blank glass folder on the desk, the other open toward the empty side. A corporate office at night: floor-to-ceiling windows with out-of-focus city lights in cool blue bokeh, a dark desk with a translucent blank glass folder. Behind him in the midground, around 82–92% of the frame width, a financial advisor (45, man, suit without tie) talking on the phone by the window, softly out of focus, smaller and clearly secondary, never entering the empty side. The environment exists only on the right side of the frame and falls into darkness toward the left. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 52% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same environment and the same secondary person (softly out of focus, behind him at about 80% of the width) stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-finanzas-hero/ind-finanzas-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake y DayTimeline) · Still 1920 px para el LocationSwitcher del inicio y de /industrias/ · Mini plano 4:5 para el carrusel móvil del inicio

### 36. `ind-inmobiliario-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain en el ambiente de Inmobiliario; una persona del sector, secundaria y desenfocada, al fondo de su lado. |
| Lado del sujeto | derecha |
| Idea | Portada de la industria Inmobiliario. Kain es el protagonista nítido; la persona del sector da contexto, desenfocada y detrás. También es fondo del LocationSwitcher del inicio (ESC 10) y de /industrias/. |
| Usos | `/` #industrias · `/industrias/` #grid · `/industrias/inmobiliario/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.66; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Persona secundaria desenfocada en x 0.82–0.92, más chica que Kain por profundidad, nunca en el lado del texto. El ambiente existe solo del lado derecho y se apaga hacia la izquierda. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.52; la persona desenfocada al fondo en x≈0.80; ambiente solo en el 60 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La luz del ambiente es fría (sin tonos cálidos). |
| Alt | Kain, el agente de IA de Ingeniak, en un departamento muestra; al fondo, una asesora inmobiliaria (imagen ilustrativa) |
| Notas | Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 66% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Presenting the space with an open palm, proud. A luxury model apartment at blue hour: large windows with a softly blurred city skyline, a designer sofa and a pendant lamp out of focus, dark polished floor. Behind him in the midground, around 82–92% of the frame width, a real-estate agent (38, woman, dark suit) by the window holding a set of keys, softly out of focus, smaller and clearly secondary, never entering the empty side. The environment exists only on the right side of the frame and falls into darkness toward the left. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 52% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same environment and the same secondary person (softly out of focus, behind him at about 80% of the width) stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-inmobiliario-hero/ind-inmobiliario-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake y DayTimeline) · Still 1920 px para el LocationSwitcher del inicio y de /industrias/ · Mini plano 4:5 para el carrusel móvil del inicio

### 37. `ind-industrial-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain en el ambiente de Industrial y logística (chaleco de seguridad abierto, sin casco (las antenas deben verse)); una persona del sector, secundaria y desenfocada, al fondo de su lado. |
| Lado del sujeto | derecha |
| Idea | Portada de la industria Industrial y logística. Kain es el protagonista nítido; la persona del sector da contexto, desenfocada y detrás. También es fondo del LocationSwitcher del inicio (ESC 10) y de /industrias/. |
| Usos | `/` #industrias · `/industrias/` #grid · `/industrias/industrial-logistica/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.66; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Persona secundaria desenfocada en x 0.82–0.92, más chica que Kain por profundidad, nunca en el lado del texto. El ambiente existe solo del lado derecho y se apaga hacia la izquierda. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.52; la persona desenfocada al fondo en x≈0.80; ambiente solo en el 60 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La luz del ambiente es fría (sin tonos cálidos). |
| Alt | Kain, el agente de IA de Ingeniak, con chaleco de seguridad en una nave industrial; al fondo, un gerente de planta (imagen ilustrativa) |
| Notas | Vestuario: chaleco de seguridad abierto, sin casco (las antenas deben verse). Rechazar si tapa la pantalla del pecho o las antenas. Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He wears a high-visibility safety vest worn open over his white body, without any text, logo or number, leaving the square chest screen fully visible; no helmet, so both antennas stay visible. He stands in the right part of the frame with his body centered at 66% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Standing firm, one hand pointing toward the empty side as if showing a flow. A logistics and manufacturing hall at night: tall pallet racks, a forklift and machinery out of focus, cool work lights, thin cyan light lines running along the floor like flows. Behind him in the midground, around 82–92% of the frame width, a plant manager (50, man) holding a hard hat in one hand, softly out of focus, smaller and clearly secondary, never entering the empty side. The environment exists only on the right side of the frame and falls into darkness toward the left. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 52% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same environment and the same secondary person (softly out of focus, behind him at about 80% of the width) stay inside the lower 60% of the frame. He keeps the same costume, with the chest screen visible. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-en-bodega.jpg` — Kain en un ambiente industrial real (escala y luz de bodega).
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-industrial-hero/ind-industrial-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-en-bodega.jpg` — Kain en un ambiente industrial real (escala y luz de bodega).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake y DayTimeline) · Still 1920 px para el LocationSwitcher del inicio y de /industrias/ · Mini plano 4:5 para el carrusel móvil del inicio

### 38. `ind-retail-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain en el ambiente de Retail y e-commerce; una persona del sector, secundaria y desenfocada, al fondo de su lado. |
| Lado del sujeto | derecha |
| Idea | Portada de la industria Retail y e-commerce. Kain es el protagonista nítido; la persona del sector da contexto, desenfocada y detrás. También es fondo del LocationSwitcher del inicio (ESC 10) y de /industrias/. |
| Usos | `/` #industrias · `/industrias/` #grid · `/industrias/retail-ecommerce/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.66; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Persona secundaria desenfocada en x 0.82–0.92, más chica que Kain por profundidad, nunca en el lado del texto. El ambiente existe solo del lado derecho y se apaga hacia la izquierda. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.52; la persona desenfocada al fondo en x≈0.80; ambiente solo en el 60 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La luz del ambiente es fría (sin tonos cálidos). |
| Alt | Kain, el agente de IA de Ingeniak, en una boutique cerrada; al fondo, el dueño de la tienda (imagen ilustrativa) |
| Notas | Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 66% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Holding a small blank glass smartphone at waist height, its screen glowing cyan, looking toward the empty side. A closed fashion boutique at night: clothing racks, a mirror and folded garments on a table out of focus, cool display lighting. Behind him in the midground, around 82–92% of the frame width, the shop owner (35, man) folding clothes behind the counter, softly out of focus, smaller and clearly secondary, never entering the empty side. The environment exists only on the right side of the frame and falls into darkness toward the left. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 52% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same environment and the same secondary person (softly out of focus, behind him at about 80% of the width) stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-retail-hero/ind-retail-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake y DayTimeline) · Still 1920 px para el LocationSwitcher del inicio y de /industrias/ · Mini plano 4:5 para el carrusel móvil del inicio

### 39. `ind-horeca-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain en el ambiente de HoReCa (mandil negro corto de mesero, bajo la pantalla del pecho); una persona del sector, secundaria y desenfocada, al fondo de su lado. |
| Lado del sujeto | derecha |
| Idea | Portada de la industria HoReCa. Kain es el protagonista nítido; la persona del sector da contexto, desenfocada y detrás. También es fondo del LocationSwitcher del inicio (ESC 10) y de /industrias/. |
| Usos | `/` #industrias · `/industrias/` #grid · `/industrias/horeca/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.66; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Persona secundaria desenfocada en x 0.82–0.92, más chica que Kain por profundidad, nunca en el lado del texto. El ambiente existe solo del lado derecho y se apaga hacia la izquierda. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.52; la persona desenfocada al fondo en x≈0.80; ambiente solo en el 60 % inferior. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La luz del ambiente es fría (sin tonos cálidos). |
| Alt | Kain, el agente de IA de Ingeniak, en el lobby de un hotel boutique; al fondo, la gerente (imagen ilustrativa) |
| Notas | Vestuario: mandil negro corto de mesero, bajo la pantalla del pecho. Rechazar si tapa la pantalla del pecho o las antenas. Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He wears a short black waiter apron tied at the waist, below the chest screen, without text or logos. He stands in the right part of the frame with his body centered at 66% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Welcoming with an open palm and a slight bow. An elegant restaurant and boutique-hotel lobby at night: a host podium, glassware and low pendant lamps out of focus, cool light with deep navy shadows, no warm tones. Behind him in the midground, around 82–92% of the frame width, a hotel manager (42, woman, dark elegant uniform) by the bar, softly out of focus, smaller and clearly secondary, never entering the empty side. The environment exists only on the right side of the frame and falls into darkness toward the left. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 52% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same environment and the same secondary person (softly out of focus, behind him at about 80% of the width) stay inside the lower 60% of the frame. He keeps the same costume, with the chest screen visible. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-horeca-hero/ind-horeca-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px (SharedTake y DayTimeline) · Still 1920 px para el LocationSwitcher del inicio y de /industrias/ · Mini plano 4:5 para el carrusel móvil del inicio

### 40. `casos-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain presentando tres columnas de luz cian que suben del piso a distintas alturas (resultados que crecen, sin números). |
| Lado del sujeto | izquierda |
| Idea | Portada del hub /casos/. Va a la IZQUIERDA para alternar con su cierre cta-equipo (derecha, no espejable). |
| Usos | `/casos/` #hero |
| Escritorio | 16:9 espejo del estándar: Kain de cuerpo completo en el lado izquierdo (cuerpo centrado en x≈0.28; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; transición x 0.40–0.45; penumbra limpia x 0.45–1. Bordes a #03040B en el último 7 %. Kain en x≈0.24; tres columnas de luz (corta, media, alta) detrás de él en x 0.06–0.40. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío (navy → #03040B) para H1/CTA; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87), centrado x≈0.56; último 10 % piso que cae a #03040B. subjTop ≈ 0.44. Columnas detrás de Kain, la más alta termina en y≈0.44. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto (la luz "sale" del titular); piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, junto a tres columnas de luz que crecen |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 24% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. Standing with one open palm presenting toward the empty right side, looking at it, proud and calm. On his side of the frame, three columns of cyan light rise from the dark glass floor behind him at three different heights (short, medium and tall), like results growing, with no numbers, no axes and no labels; silky dark-navy light waves far behind. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 44% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The three columns of light rise behind him; the tallest ends at about 44% of the frame height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/casos-hero/casos-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 41. `caso-dental-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | Clínica dental en Monterrey: persona ilustrativa del sector, siempre a la derecha. |
| Lado del sujeto | derecha |
| Idea | Portada de caso tipo reportaje: la cifra mega del H1 vive en la penumbra izquierda. Se reutiliza en el Montaje del inicio (dentro de las letras), en "Siguiente reportaje" y en los fotogramas. |
| Usos | `/` #casos · `/casos/clinica-dental-monterrey/` #hero |
| Escritorio | 16:9. Persona en plano medio del lado derecho (x 0.62–0.86), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % izquierdo; el lado en sombra se disuelve en el fondo. El 55 % izquierdo debe ser el más oscuro de la serie: ahí va la cifra en Lexend 200 de hasta 256 px. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Persona centrada en x≈0.58; la cifra va arriba en el vacío. |
| Luz | Hora azul fría con filo cian; sin tonos cálidos. |
| Alt | Odontólogo junto al ventanal de su consultorio en Monterrey a la hora azul (imagen ilustrativa) |
| Notas | Hora azul (no atardecer cálido): el ámbar es solo para dolor. Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. Nunca se presenta como el cliente real. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican male dentist (45, short grey-flecked hair, white coat over a dark shirt), medium shot from the waist up, three-quarter view, positioned in the right part of the frame (62–86% of the frame width), standing by the large window of his practice, calm and confident, looking out toward the empty left side. Through the window behind him, at blue hour, the out-of-focus silhouette of the Monterrey mountains (Cerro de la Silla) against a deep blue sky with a thin cold cyan-white glow on the horizon; the interior of the practice in deep navy shadow, background softly out of focus, the environment existing only on the right side of the frame. The empty left side must be very dark and even, because a giant number will be typeset there. Lighting: cool blue-hour light from the window draws a cyan rim on his hair and shoulders, soft indigo (#455DFF) fill from the empty left side, faint haze; no warm tones at all. The shadow side of the person dissolves into the dark background with no hard edges. The left 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 58% of the width, the top of the head at about 44% of the frame height, the waist and hands visible, the environment behind the person softly out of focus. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/caso-dental-hero/caso-dental-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Still 1920 px y 640 px (Montaje, NextStory, mega menú) · Copia desenfocada 320 px

### 42. `caso-retail-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | Retail multimarca: persona ilustrativa del sector, siempre a la derecha. |
| Lado del sujeto | derecha |
| Idea | Portada de caso tipo reportaje: la cifra mega del H1 vive en la penumbra izquierda. Se reutiliza en el Montaje del inicio (dentro de las letras), en "Siguiente reportaje" y en los fotogramas. |
| Usos | `/` #casos · `/casos/retail-multimarca-kommo/` #hero |
| Escritorio | 16:9. Persona en plano medio del lado derecho (x 0.62–0.86), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % izquierdo; el lado en sombra se disuelve en el fondo. El 55 % izquierdo debe ser el más oscuro de la serie: ahí va la cifra en Lexend 200 de hasta 256 px. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Persona centrada en x≈0.58; la cifra va arriba en el vacío. |
| Luz | Luz de borde fría cian/azul desde atrás (pelo y hombros), relleno índigo suave desde el lado del texto, niebla volumétrica tenue; gradado azul monocromo. |
| Alt | Directora comercial de una tienda multimarca en el piso de ventas de noche (imagen ilustrativa) |
| Notas | D la tenía a la izquierda; ahora a la derecha (regla de casos). Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. Nunca se presenta como el cliente real. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican retail commercial director (40, woman, dark tailored suit), medium shot from the waist up, positioned in the right part of the frame (62–86% of the frame width), standing on the sales floor of a closed multi-brand store, arms relaxed, looking toward the empty left side with quiet confidence. Mannequins, clothing racks and display tables out of focus behind her, cool display lighting, background softly out of focus, the environment existing only on the right side of the frame. The empty left side must be very dark and even, because a giant number will be typeset there. Lighting: a cool cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind on hair and shoulders, a soft indigo (#455DFF) fill from the empty left side, faint volumetric haze. The shadow side of the person dissolves into the dark background with no hard edges. The left 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 58% of the width, the top of the head at about 44% of the frame height, the waist and hands visible, the environment behind the person softly out of focus. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/caso-retail-hero/caso-retail-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Still 1920 px y 640 px (Montaje, NextStory, mega menú) · Copia desenfocada 320 px

### 43. `caso-ecommerce-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | E-commerce en CDMX: persona ilustrativa del sector, siempre a la derecha. |
| Lado del sujeto | derecha |
| Idea | Portada de caso tipo reportaje: la cifra mega del H1 vive en la penumbra izquierda. Se reutiliza en el Montaje del inicio (dentro de las letras), en "Siguiente reportaje" y en los fotogramas. |
| Usos | `/` #casos · `/casos/ecommerce-cdmx-costo-por-lead/` #hero |
| Escritorio | 16:9. Persona en plano medio del lado derecho (x 0.62–0.86), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % izquierdo; el lado en sombra se disuelve en el fondo. El 55 % izquierdo debe ser el más oscuro de la serie: ahí va la cifra en Lexend 200 de hasta 256 px. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Persona centrada en x≈0.58; la cifra va arriba en el vacío. |
| Luz | Luz de borde fría cian/azul desde atrás (pelo y hombros), relleno índigo suave desde el lado del texto, niebla volumétrica tenue; gradado azul monocromo. |
| Alt | Fundador de un e-commerce en su pequeña bodega de noche, junto a su laptop (imagen ilustrativa) |
| Notas | Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. Nunca se presenta como el cliente real. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican e-commerce founder (33, man, dark t-shirt and open overshirt), medium shot from the waist up, positioned in the right part of the frame (62–86% of the frame width), leaning on a packing table in a small, tidy e-commerce warehouse at night, an open laptop beside him with a soft cyan screen glow (no interface) lighting his face, looking toward the empty left side. Shelves of plain shipping boxes without labels and a roll of packing tape out of focus behind him, background softly out of focus, the environment existing only on the right side of the frame. The empty left side must be very dark and even, because a giant number will be typeset there. Lighting: a cool cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind on hair and shoulders, a soft indigo (#455DFF) fill from the empty left side, faint volumetric haze. The shadow side of the person dissolves into the dark background with no hard edges. The left 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 58% of the width, the top of the head at about 44% of the frame height, the waist and hands visible, the environment behind the person softly out of focus. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/caso-ecommerce-hero/caso-ecommerce-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Still 1920 px y 640 px (Montaje, NextStory, mega menú) · Copia desenfocada 320 px

### 44. `caso-horeca-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | HoReCa: persona ilustrativa del sector, siempre a la derecha. |
| Lado del sujeto | derecha |
| Idea | Portada de caso tipo reportaje: la cifra mega del H1 vive en la penumbra izquierda. Se reutiliza en el Montaje del inicio (dentro de las letras), en "Siguiente reportaje" y en los fotogramas. |
| Usos | `/` #casos · `/servicios/paid-media/` #caso · `/casos/horeca-roas/` #hero |
| Escritorio | 16:9. Persona en plano medio del lado derecho (x 0.62–0.86), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % izquierdo; el lado en sombra se disuelve en el fondo. El 55 % izquierdo debe ser el más oscuro de la serie: ahí va la cifra en Lexend 200 de hasta 256 px. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Persona centrada en x≈0.58; la cifra va arriba en el vacío. |
| Luz | Hora azul fría con filo cian; sin tonos cálidos. |
| Alt | Propietario de un restaurante en su terraza llena a la hora azul (imagen ilustrativa) |
| Notas | D la tenía a la izquierda; ahora a la derecha. Sin luces cálidas (las guirnaldas van en blanco frío). Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. Nunca se presenta como el cliente real. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican restaurant owner (50, man, dark shirt with rolled sleeves), medium shot from the waist up, positioned in the right part of the frame (62–86% of the frame width), standing on the terrace of his busy restaurant at blue hour, calm and proud, looking toward the empty left side. Behind him the restaurant full of diners out of focus, cool white string lights as bokeh, deep blue sky, background softly out of focus, the environment existing only on the right side of the frame. The empty left side must be very dark and even, because a giant number will be typeset there. Lighting: cool blue-hour light and cool white bokeh behind him, a cyan (#00E5FF) rim on his hair and shoulders, soft indigo fill from the empty left side; no warm or orange tones. The shadow side of the person dissolves into the dark background with no hard edges. The left 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 58% of the width, the top of the head at about 44% of the frame height, the waist and hands visible, the environment behind the person softly out of focus. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/caso-horeca-hero/caso-horeca-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Still 1920 px y 640 px (Montaje, NextStory, mega menú) · Copia desenfocada 320 px

### 45. `caso-logistica-hero` · P1 · lote C

| | |
|---|---|
| Estado | nueva · persona · tono sol |
| Sujeto | Logística: persona ilustrativa del sector, siempre a la derecha. |
| Lado del sujeto | derecha |
| Idea | Portada de caso tipo reportaje: la cifra mega del H1 vive en la penumbra izquierda. Se reutiliza en el Montaje del inicio (dentro de las letras), en "Siguiente reportaje" y en los fotogramas. |
| Usos | `/` #casos · `/servicios/automatizacion-n8n/` #caso · `/casos/logistica-n8n/` #hero |
| Escritorio | 16:9. Persona en plano medio del lado derecho (x 0.62–0.86), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % izquierdo; el lado en sombra se disuelve en el fondo. El 55 % izquierdo debe ser el más oscuro de la serie: ahí va la cifra en Lexend 200 de hasta 256 px. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Persona centrada en x≈0.58; la cifra va arriba en el vacío. |
| Luz | Luz de borde fría cian/azul desde atrás (pelo y hombros), relleno índigo suave desde el lado del texto, niebla volumétrica tenue; gradado azul monocromo. |
| Alt | Coordinadora de logística con tableta en un centro de distribución de noche (imagen ilustrativa) |
| Notas | También ilustra "Caso: 27 procesos automatizados" en /servicios/automatizacion-n8n/. Etiqueta en página: IMAGEN ILUSTRATIVA DEL SECTOR. Nunca se presenta como el cliente real. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican logistics coordinator (36, woman, reflective safety vest without any text over a dark shirt), medium shot from the waist up, positioned in the right part of the frame (62–86% of the frame width), holding a tablet whose screen is a soft cyan glow (no interface), standing in a distribution center at night, looking toward the empty left side. Tall racks, a forklift and pallets out of focus behind her, thin cyan light lines along the floor, background softly out of focus, the environment existing only on the right side of the frame. The empty left side must be very dark and even, because a giant number will be typeset there. Lighting: a cool cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind on hair and shoulders, a soft indigo (#455DFF) fill from the empty left side, faint volumetric haze. The shadow side of the person dissolves into the dark background with no hard edges. The left 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, blue monochrome grade with deep navy shadows and cyan highlights, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 58% of the width, the top of the head at about 44% of the frame height, the waist and hands visible, the environment behind the person softly out of focus. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, extra people in focus, distorted hands, plastic skin, stock-photo smile, cropped head, any object or light source on the empty side, hard frame edges, borders, collage.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/caso-logistica-hero/caso-logistica-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Still 1920 px y 640 px (Montaje, NextStory, mega menú) · Copia desenfocada 320 px

### 46. `dolor-anuncios` · P2 · lote D

| | |
|---|---|
| Estado | nueva · persona · tono dolor |
| Sujeto | Emprendedora (34) de noche mirando su celular con frustración; junto a ella, cajas de envío planas sin usar (no hubo pedidos). |
| Lado del sujeto | izquierda |
| Idea | Dolor "Anuncios que no se traducen en ventas". Placa de "Señales" de paid media, páginas web, SEO y branding (con espejo donde toca). |
| Usos | `/servicios/paid-media/` #senales · `/servicios/paginas-web/` #senales (espejo) · `/servicios/seo/` #senales · `/servicios/branding/` #senales (espejo) |
| Escritorio | 16:9. Persona en plano medio del lado izquierdo (x 0.14–0.38), cabeza en y≈0.12–0.30, mirando hacia el texto o hacia su dispositivo. Penumbra limpia en el 55 % derecho; el lado en sombra se disuelve en el fondo. Sentada al borde de un sillón (x 0.14–0.38); laptop ámbar y una pila de cajas planas sin armar a su lado. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; persona en el 60 % inferior (coronilla y≈0.44), el torso se disuelve en sombra abajo. subjTop ≈ 0.44. Modo below. Modo móvil: `below`. |
| Luz | Tono DOLOR: una sola luz práctica ámbar #FFB547 sobre rostro y manos; cero cian salvo un filo frío casi imperceptible; todo lo demás cae a navy. |
| Alt | Emprendedora frustrada de noche mirando su celular junto a cajas de envío sin usar (imagen ilustrativa) |
| Notas | Rechazar si las cajas o pantallas muestran marcas o texto. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 editorial photograph, part of one consistent cinematic series. A Mexican entrepreneur (34, woman, casual dark sweater), medium shot, positioned in the left part of the frame (14–38% of the frame width), sitting on the edge of a sofa late at night, staring at her smartphone with a frustrated expression, its screen a warm amber glow (no interface); beside her an open laptop also glowing dim amber and a stack of flat, unused shipping boxes. A small home studio used as a business office, product samples on a shelf behind her out of focus, background softly out of focus, the environment existing only on the left side of the frame. Lighting: a single motivated warm amber (#FFB547) practical light from the smartphone and laptop screens on the face and hands, quiet and tired; no cyan light except a very faint cold edge on one shoulder; everything else falls into deep navy shadow. The shadow side of the person dissolves into the dark background with no hard edges. The right 55% of the frame is clean deep navy (#0A1F4C) shadow falling off to near-black (#03040B): no objects, no furniture, no windows, no light sources, no particles. All four edges fade to near-black (#03040B) in the last 7% of the frame. 50mm lens, f/2.0, eye-level camera, natural skin texture, dark navy grade where the amber practical is the only warm accent, fine film grain. Illustrative person, not a real client or a celebrity. Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: the same person (identical face, hair, age and clothing), the same set, the same lighting and color grade, camera pulled back. The person is in the lower part of the frame, centered at 48% of the width, the top of the head at about 44% of the frame height, sitting with the phone in her hands, the flat unused boxes beside her. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint haze: no objects, no windows, no light sources. The bottom edge fades to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, brand marks on clothing, signage or readable interface; any screen is only a soft glow with no interface. Avoid: robots, cyan or blue light on the face, extra people in focus, distorted hands, plastic skin, melodrama, cropped head, any object or light source on the empty side, hard frame edges, borders.
```

**Referencias escritorio:**
_Sin referencias de imagen (solo texto)._

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/dolor-anuncios/dolor-anuncios-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).

**Derivados:** Espejo por CSS en /servicios/paginas-web/ y /servicios/branding/

### 47. `paginas-web-hero` · P1 (r1: portada) · lote D

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain armando una ventana de navegador de cristal hecha de bloques modulares vacíos; coloca el último bloque. |
| Lado del sujeto | izquierda |
| Idea | Portada de /servicios/paginas-web/ (y regreso al set en "Este sitio es el ejemplo"): encima se arma el wireframe en HTML. |
| Usos | `/servicios/paginas-web/` #hero · `/servicios/paginas-web/` #este-sitio |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.2; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Ventana de cristal frontal entre Kain y el texto (x 0.29–0.44, y 0.20–0.64) hecha de bloques vacíos con filo cian. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.34 y la ventana a su derecha (x 0.50–0.80). |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, arma una página web de bloques de cristal |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 20% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. Placing the last block into the window with one hand, the other hand relaxed, focused and proud. Floating beside him, between the robot and the empty side (about 29–44% of the frame width, 20–64% of the height), a large frontal glass browser window built from blank modular glass blocks (a thin top bar, a wide hero block and three smaller blocks), all empty and softly glowing, outlined by a thin cyan edge; no text, no icons, no buttons with labels. Silky dark-navy light waves far behind him on his side. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 34% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The glass browser window of blank modular blocks floats to his right (about 50–80% of the width) inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/paginas-web-hero/paginas-web-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 48. `seo-hero` · P1 (r1: portada) · lote D

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain bajo un haz de luz que lo "encuentra", junto a una tarjeta de cristal en blanco (la respuesta de un motor de IA que cita la marca). |
| Lado del sujeto | derecha |
| Idea | Portada de /servicios/seo/ (y regreso al set en "Cómo lo medimos"). La tarjeta recibe la UI "respuesta de un motor de IA" (SIMULACIÓN). |
| Usos | `/servicios/seo/` #hero · `/servicios/seo/` #como-medimos |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.78; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Haz vertical que cae sobre Kain; tarjeta frontal flotante a la altura del pecho en x 0.57–0.69, y 0.32–0.56; constelación de nodos tenue arriba, de su lado. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.64 con el haz; tarjeta a su izquierda. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Más un haz vertical cian-blanco desde arriba. |
| Alt | Kain, el agente de IA de Ingeniak, iluminado por un haz de luz junto a una tarjeta de respuesta de cristal |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 78% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Looking up into a vertical beam of light that falls on him from above, as if he has just been found, one hand lifted toward the floating card. Floating at chest height in front of his raised hand, between the robot and the empty side (about 57–69% of the frame width, 32–56% of the height), a blank rectangular glass card, frontal and flat, glowing faintly. A narrow vertical beam of cyan-white light descends from above onto the robot; high in the dark background on his side, a faint constellation of tiny connected nodes, like linked search results, fades into haze. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 64% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The vertical beam of light falls on him; the blank glass card floats to his left at chest height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/seo-hero/seo-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 49. `branding-hero` · P1 (r1: portada) · lote D

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain posando en un set fotográfico oscuro (ciclorama navy, dos softboxes fríos) junto a un tablero de identidad de cristal en blanco. |
| Lado del sujeto | izquierda |
| Idea | Portada de /servicios/branding/ y "Un personaje que trabaja": Kain es el ejemplo de marca. Encima del tablero va la identidad en HTML (isotipo, paleta, tipografía). |
| Usos | `/servicios/branding/` #hero · `/servicios/branding/` #kain-ejemplo |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.2; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Ciclorama navy, dos softboxes de su lado, cámara en trípode desenfocada en el borde izquierdo; tablero de cristal frontal en x 0.30–0.42, y 0.26–0.66. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el tablero a su derecha. |
| Luz | Softboxes fríos cian-blanco + contraluz cian/azul de la serie; sin luz cálida. |
| Alt | Kain, el agente de IA de Ingeniak, posa en un set fotográfico junto a un tablero de identidad |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 20% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. Posing confidently for a photo shoot, one hand on his hip, chin slightly up, eyes narrowed in a smile. Beside him, between the robot and the empty side (about 30–42% of the frame width, 26–66% of the height), a blank frontal glass board on a slim stand, empty and glowing faintly, like an identity board without content. A dark professional photo studio on his side: a seamless deep navy backdrop sweep behind him, two large softboxes on stands throwing cool cyan-white light, a camera on a tripod softly out of focus at the left edge. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The same photo set: navy backdrop sweep and softboxes behind him, the blank glass board to his right. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/branding-hero/branding-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 50. `ind-salud-kain-sector` · P2 · lote D

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain trabajando en Salud (bata blanca abierta + estetoscopio (vestuario validado)) junto a un panel de cristal alto en blanco (pantalla de chat/agenda); un cliente desenfocado al fondo. |
| Lado del sujeto | izquierda |
| Idea | "Así trabaja Kain en tu…" (escena fijada con push-in 1 → 1.6 hacia el panel y ChatSim encima). Es también la escena "Resultado" de /casos/ (caso-dental). |
| Usos | `/industrias/salud/` #kain-sector · `/casos/clinica-dental-monterrey/` #resultado |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.22; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Panel de cristal alto (proporción de pantalla de teléfono) flotando entre Kain y el texto: x 0.30–0.42, y 0.22–0.66, frontal y vacío. Cliente desenfocado al fondo en x 0.08–0.16. Ambiente solo del lado izquierdo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el panel a su derecha (x 0.52–0.72); el chat baja al texto si el panel mide <180 px. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Ambiente frío del sector. |
| Alt | Kain, el agente de IA de Ingeniak, en la recepción de una clínica junto a un panel de cristal donde agenda citas |
| Notas | Mismo mundo que la portada de la industria, otro ángulo y otro lado. El panel debe ser frontal: ahí se registra el chat (SIMULACIÓN). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He wears an open white doctor coat with a stethoscope around his neck, exactly like the costume reference; the open coat leaves the square chest screen fully visible. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. One hand raised toward the panel as if replying to a message, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–42% of the frame width, 22–66% of the height), a tall blank glass panel shaped like a large phone screen, frontal to the camera, perfectly flat and empty with a faint cyan glow. A dental clinic reception at night: a reception counter with a soft cyan glow and waiting chairs out of focus. In the background, around 8–16% of the frame width, a patient (woman, 30s) sitting in the waiting area checking her phone, softly out of focus and clearly secondary. The environment exists only on the left side of the frame and falls into darkness toward the right. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel floats to his right (about 52–72% of the width); the same environment and the out-of-focus person stay inside the lower 60% of the frame. He keeps the same costume, chest screen visible. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-doctor-recorte.png` — Vestuario validado: bata blanca abierta + estetoscopio (pantalla del pecho visible).
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-salud-hero/ind-salud-hero-desk.png` — Portada ELEGIDA de la misma industria: mismo mundo y misma luz (no copiar su encuadre ni su persona).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-salud-kain-sector/ind-salud-kain-sector-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-doctor-recorte.png` — Vestuario validado: bata blanca abierta + estetoscopio (pantalla del pecho visible).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 51. `ind-belleza-kain-sector` · P2 · lote D

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain trabajando en Belleza y estética junto a un panel de cristal alto en blanco (pantalla de chat/agenda); un cliente desenfocado al fondo. |
| Lado del sujeto | izquierda |
| Idea | "Así trabaja Kain en tu…" (escena fijada con push-in 1 → 1.6 hacia el panel y ChatSim encima). |
| Usos | `/industrias/belleza-estetica/` #kain-sector |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.22; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Panel de cristal alto (proporción de pantalla de teléfono) flotando entre Kain y el texto: x 0.30–0.42, y 0.22–0.66, frontal y vacío. Cliente desenfocado al fondo en x 0.08–0.16. Ambiente solo del lado izquierdo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el panel a su derecha (x 0.52–0.72); el chat baja al texto si el panel mide <180 px. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Ambiente frío del sector. |
| Alt | Kain, el agente de IA de Ingeniak, en la recepción de un spa junto a un panel de cristal donde responde mensajes |
| Notas | Mismo mundo que la portada de la industria, otro ángulo y otro lado. El panel debe ser frontal: ahí se registra el chat (SIMULACIÓN). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. One hand raised toward the panel as if replying to a message, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–42% of the frame width, 22–66% of the height), a tall blank glass panel shaped like a large phone screen, frontal to the camera, perfectly flat and empty with a faint cyan glow. The reception of a minimalist spa at night: a stone counter, plants and soft cool light. In the background, around 8–16% of the frame width, a client in a white robe waiting on a bench, softly out of focus and clearly secondary. The environment exists only on the left side of the frame and falls into darkness toward the right. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel floats to his right (about 52–72% of the width); the same environment and the out-of-focus person stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-belleza-hero/ind-belleza-hero-desk.png` — Portada ELEGIDA de la misma industria: mismo mundo y misma luz (no copiar su encuadre ni su persona).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-belleza-kain-sector/ind-belleza-kain-sector-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 52. `ind-nutricion-kain-sector` · P2 · lote D

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain trabajando en Nutrición junto a un panel de cristal alto en blanco (pantalla de chat/agenda); un cliente desenfocado al fondo. |
| Lado del sujeto | izquierda |
| Idea | "Así trabaja Kain en tu…" (escena fijada con push-in 1 → 1.6 hacia el panel y ChatSim encima). |
| Usos | `/industrias/nutricion/` #kain-sector |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.22; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Panel de cristal alto (proporción de pantalla de teléfono) flotando entre Kain y el texto: x 0.30–0.42, y 0.22–0.66, frontal y vacío. Cliente desenfocado al fondo en x 0.08–0.16. Ambiente solo del lado izquierdo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el panel a su derecha (x 0.52–0.72); el chat baja al texto si el panel mide <180 px. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Ambiente frío del sector. |
| Alt | Kain, el agente de IA de Ingeniak, en una sala de espera junto a un panel de cristal donde confirma consultas |
| Notas | Mismo mundo que la portada de la industria, otro ángulo y otro lado. El panel debe ser frontal: ahí se registra el chat (SIMULACIÓN). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. One hand raised toward the panel as if replying to a message, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–42% of the frame width, 22–66% of the height), a tall blank glass panel shaped like a large phone screen, frontal to the camera, perfectly flat and empty with a faint cyan glow. A calm, minimal waiting room at dusk: a light wooden bench and plants. In the background, around 8–16% of the frame width, a patient (man, 40s) waiting on the bench, softly out of focus and clearly secondary. The environment exists only on the left side of the frame and falls into darkness toward the right. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel floats to his right (about 52–72% of the width); the same environment and the out-of-focus person stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-nutricion-hero/ind-nutricion-hero-desk.png` — Portada ELEGIDA de la misma industria: mismo mundo y misma luz (no copiar su encuadre ni su persona).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-nutricion-kain-sector/ind-nutricion-kain-sector-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 53. `ind-finanzas-kain-sector` · P2 · lote D

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain trabajando en Finanzas junto a un panel de cristal alto en blanco (pantalla de chat/agenda); un cliente desenfocado al fondo. |
| Lado del sujeto | izquierda |
| Idea | "Así trabaja Kain en tu…" (escena fijada con push-in 1 → 1.6 hacia el panel y ChatSim encima). |
| Usos | `/industrias/finanzas/` #kain-sector |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.22; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Panel de cristal alto (proporción de pantalla de teléfono) flotando entre Kain y el texto: x 0.30–0.42, y 0.22–0.66, frontal y vacío. Cliente desenfocado al fondo en x 0.08–0.16. Ambiente solo del lado izquierdo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el panel a su derecha (x 0.52–0.72); el chat baja al texto si el panel mide <180 px. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Ambiente frío del sector. |
| Alt | Kain, el agente de IA de Ingeniak, en un despacho financiero junto a un panel de cristal donde atiende a un cliente |
| Notas | Mismo mundo que la portada de la industria, otro ángulo y otro lado. El panel debe ser frontal: ahí se registra el chat (SIMULACIÓN). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. One hand raised toward the panel as if replying to a message, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–42% of the frame width, 22–66% of the height), a tall blank glass panel shaped like a large phone screen, frontal to the camera, perfectly flat and empty with a faint cyan glow. A private office of a financial firm at night: a dark desk and city bokeh in the window. In the background, around 8–16% of the frame width, a client (man, 50s) seated, reviewing papers with nothing readable, softly out of focus and clearly secondary. The environment exists only on the left side of the frame and falls into darkness toward the right. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel floats to his right (about 52–72% of the width); the same environment and the out-of-focus person stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-finanzas-hero/ind-finanzas-hero-desk.png` — Portada ELEGIDA de la misma industria: mismo mundo y misma luz (no copiar su encuadre ni su persona).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-finanzas-kain-sector/ind-finanzas-kain-sector-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 54. `ind-inmobiliario-kain-sector` · P2 · lote D

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain trabajando en Inmobiliario junto a un panel de cristal alto en blanco (pantalla de chat/agenda); un cliente desenfocado al fondo. |
| Lado del sujeto | izquierda |
| Idea | "Así trabaja Kain en tu…" (escena fijada con push-in 1 → 1.6 hacia el panel y ChatSim encima). |
| Usos | `/industrias/inmobiliario/` #kain-sector |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.22; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Panel de cristal alto (proporción de pantalla de teléfono) flotando entre Kain y el texto: x 0.30–0.42, y 0.22–0.66, frontal y vacío. Cliente desenfocado al fondo en x 0.08–0.16. Ambiente solo del lado izquierdo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el panel a su derecha (x 0.52–0.72); el chat baja al texto si el panel mide <180 px. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Ambiente frío del sector. |
| Alt | Kain, el agente de IA de Ingeniak, en el lobby de una torre residencial junto a un panel de cristal donde agenda visitas |
| Notas | Mismo mundo que la portada de la industria, otro ángulo y otro lado. El panel debe ser frontal: ahí se registra el chat (SIMULACIÓN). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. One hand raised toward the panel as if replying to a message, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–42% of the frame width, 22–66% of the height), a tall blank glass panel shaped like a large phone screen, frontal to the camera, perfectly flat and empty with a faint cyan glow. The lobby of a residential tower at night: a dark marble floor with reflections, elevator doors and a concierge desk out of focus. In the background, around 8–16% of the frame width, a young couple waiting by the elevators, softly out of focus and clearly secondary. The environment exists only on the left side of the frame and falls into darkness toward the right. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel floats to his right (about 52–72% of the width); the same environment and the out-of-focus person stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-inmobiliario-hero/ind-inmobiliario-hero-desk.png` — Portada ELEGIDA de la misma industria: mismo mundo y misma luz (no copiar su encuadre ni su persona).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-inmobiliario-kain-sector/ind-inmobiliario-kain-sector-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 55. `ind-industrial-kain-sector` · P2 · lote D

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain trabajando en Industrial y logística (chaleco de seguridad abierto, sin casco (las antenas deben verse)) junto a un panel de cristal alto en blanco (pantalla de chat/agenda); un cliente desenfocado al fondo. |
| Lado del sujeto | izquierda |
| Idea | "Así trabaja Kain en tu…" (escena fijada con push-in 1 → 1.6 hacia el panel y ChatSim encima). Es también la escena "Resultado" de /casos/ (caso-logistica). |
| Usos | `/industrias/industrial-logistica/` #kain-sector · `/casos/logistica-n8n/` #resultado |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.22; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Panel de cristal alto (proporción de pantalla de teléfono) flotando entre Kain y el texto: x 0.30–0.42, y 0.22–0.66, frontal y vacío. Cliente desenfocado al fondo en x 0.08–0.16. Ambiente solo del lado izquierdo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el panel a su derecha (x 0.52–0.72); el chat baja al texto si el panel mide <180 px. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Ambiente frío del sector. |
| Alt | Kain, el agente de IA de Ingeniak, en un andén de carga del que salen flujos de luz hacia la bodega |
| Notas | Mismo mundo que la portada de la industria, otro ángulo y otro lado. El panel debe ser frontal: ahí se registra el chat (SIMULACIÓN). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He wears a high-visibility safety vest worn open over his white body, without any text, logo or number, leaving the square chest screen fully visible; no helmet, so both antennas stay visible. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. One hand raised toward the panel as if replying to a message, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–42% of the frame width, 22–66% of the height), a tall blank glass panel shaped like a large phone screen, frontal to the camera, perfectly flat and empty with a faint cyan glow. A loading dock at night: stacked boxes and pallets without labels out of focus, an open truck bay with cool light, thin cyan light lines running from the robot along the floor into the warehouse like data flows. In the background, around 8–16% of the frame width, a warehouse worker in a safety vest carrying a box, softly out of focus and clearly secondary. The environment exists only on the left side of the frame and falls into darkness toward the right. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel floats to his right (about 52–72% of the width); the same environment and the out-of-focus person stay inside the lower 60% of the frame. He keeps the same costume, chest screen visible. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-en-bodega.jpg` — Kain en un ambiente industrial real (escala y luz de bodega).
3. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
4. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-industrial-hero/ind-industrial-hero-desk.png` — Portada ELEGIDA de la misma industria: mismo mundo y misma luz (no copiar su encuadre ni su persona).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-industrial-kain-sector/ind-industrial-kain-sector-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-en-bodega.jpg` — Kain en un ambiente industrial real (escala y luz de bodega).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 56. `ind-retail-kain-sector` · P2 · lote D

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain trabajando en Retail y e-commerce junto a un panel de cristal alto en blanco (pantalla de chat/agenda); un cliente desenfocado al fondo. |
| Lado del sujeto | izquierda |
| Idea | "Así trabaja Kain en tu…" (escena fijada con push-in 1 → 1.6 hacia el panel y ChatSim encima). Es también la escena "Resultado" de /casos/ (caso-retail). |
| Usos | `/industrias/retail-ecommerce/` #kain-sector · `/casos/retail-multimarca-kommo/` #resultado |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.22; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Panel de cristal alto (proporción de pantalla de teléfono) flotando entre Kain y el texto: x 0.30–0.42, y 0.22–0.66, frontal y vacío. Cliente desenfocado al fondo en x 0.08–0.16. Ambiente solo del lado izquierdo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el panel a su derecha (x 0.52–0.72); el chat baja al texto si el panel mide <180 px. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Ambiente frío del sector. |
| Alt | Kain, el agente de IA de Ingeniak, en el aparador de una tienda junto a un panel de cristal donde atiende pedidos |
| Notas | Mismo mundo que la portada de la industria, otro ángulo y otro lado. El panel debe ser frontal: ahí se registra el chat (SIMULACIÓN). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. One hand raised toward the panel as if replying to a message, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–42% of the frame width, 22–66% of the height), a tall blank glass panel shaped like a large phone screen, frontal to the camera, perfectly flat and empty with a faint cyan glow. A shop window display at night, lit from below with cyan light, reflections on the glass, mannequins out of focus. In the background, around 8–16% of the frame width, a customer outside the window looking in, softly out of focus and clearly secondary. The environment exists only on the left side of the frame and falls into darkness toward the right. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel floats to his right (about 52–72% of the width); the same environment and the out-of-focus person stay inside the lower 60% of the frame. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-retail-hero/ind-retail-hero-desk.png` — Portada ELEGIDA de la misma industria: mismo mundo y misma luz (no copiar su encuadre ni su persona).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-retail-kain-sector/ind-retail-kain-sector-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 57. `ind-horeca-kain-sector` · P2 · lote D

| | |
|---|---|
| Estado | nueva · kain+persona · tono sol |
| Sujeto | Kain trabajando en HoReCa (mandil negro corto de mesero, bajo la pantalla del pecho) junto a un panel de cristal alto en blanco (pantalla de chat/agenda); un cliente desenfocado al fondo. |
| Lado del sujeto | izquierda |
| Idea | "Así trabaja Kain en tu…" (escena fijada con push-in 1 → 1.6 hacia el panel y ChatSim encima). Es también la escena "Resultado" de /casos/ (caso-horeca). |
| Usos | `/industrias/horeca/` #kain-sector · `/casos/horeca-roas/` #resultado |
| Escritorio | 16:9. Kain de cuerpo completo del lado izquierdo (cuerpo centrado en x≈0.22; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.05–0.40; penumbra limpia x 0.45–1; bordes a #03040B en el último 7 %. Panel de cristal alto (proporción de pantalla de teléfono) flotando entre Kain y el texto: x 0.30–0.42, y 0.22–0.66, frontal y vacío. Cliente desenfocado al fondo en x 0.08–0.16. Ambiente solo del lado izquierdo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.36 y el panel a su derecha (x 0.52–0.72); el chat baja al texto si el panel mide <180 px. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. Ambiente frío del sector. |
| Alt | Kain, el agente de IA de Ingeniak, en la barra de un restaurante junto a un panel de cristal donde confirma reservaciones |
| Notas | Mismo mundo que la portada de la industria, otro ángulo y otro lado. El panel debe ser frontal: ahí se registra el chat (SIMULACIÓN). |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He wears a short black waiter apron tied at the waist, below the chest screen, without text or logos. He stands in the left part of the frame with his body centered at 22% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty right side, his square chest screen facing the camera, crisp and clearly visible. One hand raised toward the panel as if replying to a message, looking toward the empty right side. Floating upright beside him, between the robot and the empty side (about 30–42% of the frame width, 22–66% of the height), a tall blank glass panel shaped like a large phone screen, frontal to the camera, perfectly flat and empty with a faint cyan glow. The bar of an elegant restaurant after closing: glassware and bottles without labels out of focus, low pendant lights in cool tones. In the background, around 8–16% of the frame width, a bartender polishing a glass, softly out of focus and clearly secondary. The environment exists only on the left side of the frame and falls into darkness toward the right. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty right side. The subject and everything in the scene live inside the left 40% of the frame; the right 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 36% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The tall blank glass panel floats to his right (about 52–72% of the width); the same environment and the out-of-focus person stay inside the lower 60% of the frame. He keeps the same costume, chest screen visible. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-toca.jpg` — Cuerpo completo sobre negro, mano que toca/señala.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-horeca-hero/ind-horeca-hero-desk.png` — Portada ELEGIDA de la misma industria: mismo mundo y misma luz (no copiar su encuadre ni su persona).

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/ind-horeca-kain-sector/ind-horeca-kain-sector-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 58. `tecnologias-hero` · P1 (r1: portada) · lote D

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain sentado en un cubo de cristal; de él suben ramas de luz con codos a 45° hacia seis placas de cristal vacías (las herramientas conectadas). |
| Lado del sujeto | derecha |
| Idea | Portada de /tecnologias/. Los logos van en HTML en el StackHub, no aquí. |
| Usos | `/tecnologias/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.72; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Sentado: antenas y≈0.24, pies y≈0.80, colgando visibles. Ramas y 6 placas vacías detrás de él dentro de x 0.60–0.95. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Sentado en el cubo; ramas y placas bajo y≈0.42. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, sentado en un cubo de cristal del que salen conexiones de luz |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 72% of the frame width, the tips of his antennas at about 24% and his feet at about 80% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Sitting relaxed on the edge of a large glass cube, legs hanging with both feet visible, one hand resting on the cube, looking toward the empty side. From the glass cube, thin branches of light with 45-degree elbows and small square nodes climb behind him on his side to six small floating blank glass plates at different heights, empty and glowing faintly, like a stack of connected tools. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 56% of the width, the tips of his antennas at about 50% of the frame height and his feet at about 84%, chest screen facing the camera. He sits on the edge of the glass cube with his feet visible; the branches of light and the six blank glass plates rise behind him, all below 42% of the frame height. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/tecnologias-hero/tecnologias-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** Copia desenfocada 320 px

### 59. `art-agente-chatbot-hero` · P1 (r1: portada) · lote D

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain iluminado en cian junto a una vieja terminal de menús de botones, apagada y polvosa (el chatbot de antes). |
| Lado del sujeto | derecha |
| Idea | Portada de /blog/agente-ia-whatsapp-vs-chatbot/. |
| Usos | `/blog/agente-ia-whatsapp-vs-chatbot/` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.76; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. La terminal vieja, apagada y desaturada, entre Kain y el texto (x 0.56–0.64), en sombra; nunca un segundo robot. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.64; la terminal a su izquierda en sombra. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. La terminal recibe solo luz de rebote, sin brillo propio. |
| Alt | Kain, el agente de IA de Ingeniak, junto a una vieja terminal de menús apagada |
| Notas | Rechazar si la terminal parece otro robot o lleva letras en los botones. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 76% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Standing confidently, lit in cyan, glancing at the old machine beside him with a gentle look. Just beside him toward the empty side (about 56–64% of the frame width), an old boxy beige-grey self-service kiosk terminal from the early 2000s, dusty and powered off, with a small dark dead screen and rows of chunky physical buttons without any labels, desaturated and half in shadow; it is a machine, not a robot. A dark empty space with faint silky navy waves far behind him. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 64% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The old dusty kiosk terminal stands in shadow to his left. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/art-agente-chatbot-hero/art-agente-chatbot-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** —

### 60. `404-hero` · P1 (r1: portada) · lote D

| | |
|---|---|
| Estado | nueva · kain · tono sol |
| Sujeto | Kain con la cabeza ladeada mirando una rama de luz (codos a 45°) que se corta en el aire. |
| Lado del sujeto | derecha |
| Idea | Portada de la 404 "Esta ruta no está conectada". |
| Usos | `/404` #hero |
| Escritorio | 16:9. Kain de cuerpo completo del lado derecho (cuerpo centrado en x≈0.76; antenas y≈0.12, pies y≈0.86 con reflejo), 3/4 hacia el texto, pantalla del pecho de frente. Zona del sujeto x 0.60–0.95; penumbra limpia x 0–0.55; bordes a #03040B en el último 7 %. Rama de luz que sube del piso entre Kain y el texto (x 0.56–0.66) y se corta en seco a media altura; unas chispas tenues en el extremo. |
| Móvil | 4:5 (master 1536×1920 → 1080×1350). 40 % superior vacío; Kain de cuerpo completo en el 60 % inferior (antenas y≈0.45, pies y≈0.87). subjTop ≈ 0.44. Kain en x≈0.66; la rama cortada a su izquierda. |
| Luz | Contraluz único cian #00E5FF / azul #0055FF desde atrás del sujeto, volumétrico con niebla; relleno índigo #455DFF suave entrando desde el lado del texto; piso negro brillante con reflejo. |
| Alt | Kain, el agente de IA de Ingeniak, mira desconcertado una conexión de luz cortada |
| Notas | noindex: prioridad baja, pero barata y con mucho personaje. |

**Prompt escritorio (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render, part of one consistent cinematic series. KAIN, the small friendly white robot from the reference images, with exactly the same design: a round glossy white helmet head with two thin silver antennas, chrome ear pieces on both sides, a dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, a square dark chest screen with a glowing cyan asterisk, and a slim white articulated body with dark grey joints and articulated robot hands. He is shown FULL BODY, from the tips of the antennas to the soles of his feet, both feet clearly visible on the floor. He stands in the right part of the frame with his body centered at 76% of the frame width, the tips of his antennas at about 12% and his feet at about 86% of the frame height, in a three-quarter view turned toward the empty left side, his square chest screen facing the camera, crisp and clearly visible. Head tilted to one side, curious and a little puzzled, one hand scratching the side of his helmet, looking at the broken branch. Between the robot and the empty side (about 56–66% of the frame width), a thin branch of cyan light rises from the floor with 45-degree elbows and stops abruptly in mid-air with a clean break at about 40% of the frame height; a few faint sparks drift from the broken end. Faint silky navy waves far behind him. A dark glossy reflective floor carries his soft reflection. Lighting: one single cyan (#00E5FF) and electric-blue (#0055FF) rim light from behind the robot, volumetric haze catching the light around him, and a soft indigo (#455DFF) fill entering from the empty left side. The subject and everything in the scene live inside the right 40% of the frame; the left 55% of the frame is clean negative space for typography: smooth deep navy (#0A1F4C) falling off to near-black (#03040B), only a faint blue haze with a gentle light falloff from the subject, no objects, no light sources, no particles, no hard edges. All four edges fade to near-black (#03040B) in the last 7% of the frame so the image melts into a #03040B web page. 50mm lens, f/2.8, camera at the robot's chest height, shallow depth of field, subtle film grain, HDR, same color grade as the reference scene: deep navy shadows, cyan and electric-blue highlights. Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```
**Prompt móvil (4:5):**
```
Vertical 4:5 establishing shot of the same scene as the first reference image: same set, same props, same lighting and same color grade, camera pulled far back. KAIN, the small white robot identical to the reference images (round glossy white helmet head, two thin silver antennas, chrome ear pieces, dark visor with glowing cyan oval eyes, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints) stands FULL BODY and small in the frame, centered at 66% of the width, the tips of his antennas at about 45% of the frame height and his feet at about 87%, chest screen facing the camera. The broken branch of cyan light rises to his left and stops in mid-air. The entire top 40% of the image, from the top edge down, is an empty deep navy-to-near-black void (#03040B) with only a very faint blue haze: no objects, no light sources, no particles, no ceiling details. Everything in the scene sits in the lower 60%. The bottom 10% is dark glossy floor fading to near-black. All edges fade to near-black (#03040B). Absolutely no text, letters, numbers, logos, watermarks, signage, icons or readable interface anywhere in the image; every glass surface and screen is perfectly blank. No panels with content, no frames, no borders. Avoid: a black or graphite robot, a second robot, missing or extra antennas, changed eyes, a human mouth or teeth on the robot, cropped feet or antennas, a cartoon or flat style, warm or orange light, any object or light source on the empty side, hard frame edges or borders.
```

**Referencias escritorio:**
1. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/referencias/kain-body-presenta.jpg` — Cuerpo completo sobre negro (proporciones y juntas).
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-desk-2x.jpg` (Magnific `jUccthULD0`) — Hero aprobado: lente, gradado, piso y penumbra de la serie.

**Referencias móvil:**
1. `/Users/riklanderos/Web Ingeniak Versel/materiales/v2/placas/404-hero/404-hero-desk.png` — Render de escritorio ELEGIDO de esta misma placa (existe después de aprobar el escritorio).
2. `/Users/riklanderos/Downloads/Ingeniak_Kain_Brand_Kit/05_Kain_Personaje/recortes_png/kain-presenta.png` (Magnific `s7TThool8e`) — Identidad de Kain (pose presentar). Siempre primero en placas con Kain.
3. `/Users/riklanderos/Web Ingeniak Versel/materiales/magnific/v2/hero-home-movil-d.png` — Hero móvil aprobado: composición vertical de la serie (vacío arriba, sujeto abajo).

**Derivados:** —


## 10. Pendientes para validar con el cliente

> r1: los puntos 6–8 se agregaron en la revisión crítica (ESPEC §12).

1. **Casting de servicios con Kain trabajando** (ESPEC F11) y de industrias con Kain + persona secundaria.
2. **Sesión de fotos del equipo** (3/4 de cuerpo, fondo negro, contraluz cian): las fotos actuales traen placa de nombre, cargos viejos y la "X" detrás. El plan funciona con ellas (recorte arriba de la placa), pero una sesión nueva sube mucho el nivel de `equipo-real` y `cta-equipo`.
3. **Vestuarios nuevos** de Kain (saco de consultor, chaleco industrial, mandil): solo la bata de doctor está validada.
4. Si el e-commerce de CDMX es el mismo cliente del tablero "1 vista · 7 fuentes" (cambia la placa de `/servicios/desarrollo-software/#dashboard`).
5. Presupuesto para la ampliación opcional P3: 5 placas de fase de VKTOR y un primer plano propio por servicio para las escenas intermedias.
6. **Fecha de la sesión de fotos del equipo** (requisito P1 de `equipo-real` y `cta-equipo`; sin ella, /nosotros/ sale con la composición de respaldo solo si pasa la revisión de "no collage").
7. **Cuadro limpio del VSL** (o autorización para editar `vsl-poster.jpg`) y revisión del propio video: el título animado se encima ("¿qué sedetiene?") en al menos un cuadro.
8. **Orden de aprobación:** las 52 placas P1 se aprueban antes de construir las plantillas que las usan; las 9 P2 pueden salir después con su respaldo (`launchFallback`).
