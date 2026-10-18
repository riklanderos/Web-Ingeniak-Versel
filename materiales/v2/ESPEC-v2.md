# ESPEC v2 · Ingeniak — especificación definitiva

> **Fuente única de verdad para construir ingeniak.mx v2.** Fecha: 18 de octubre de 2026 · Versión 1.1 (revisión crítica r1, ver §12) · Estado: lista para construcción, con las puertas de contenido de §12.3.
> Stack fijo: Astro (SSG, MPA puro, sin ClientRouter) · GSAP 3.13 (ScrollTrigger, SplitText, Flip) · Lenis 1.3.11 · Vercel. Imágenes: Magnific (Nano Banana Pro con referencias de Kain). Video: Remotion / HyperFrames.
> Base: concepto ganador **"Plano secuencia — el turno de noche de Kain"** (`concepto-cinematic.md`), con injertos de **FOLIO** (`concepto-authority.md`) y **SISTEMA VIVO** (`concepto-system.md`) votados por los 3 jueces.
> Insumos: `A-sitio-actual.md`, `B-referencias.md`, `C-benchmark.md`, `D-arquitectura.md`, `D-sitemap.json`, `D-navegacion.json`, `D-redirects.json`, `materiales/magnific/v2/RECETA.md`.

**Regla de precedencia.** Si este documento contradice a A, B, C, D o a cualquiera de los tres conceptos, **manda este documento**. `D-sitemap.json` sigue siendo la fuente de URLs, `title`, meta, keyword, H1, breadcrumbs, FAQ y mensajes de WhatsApp de las 45 páginas, **con los cambios de §0.3**. Lo que este documento no toca de D sigue vigente tal cual.

**Requisito del cliente que gobierna todo (textual):** *"los HERO o las secciones que lleven texto + imagen: imágenes premium donde la imagen sea el background y la persona o personaje de un lado y del otro los textos o botones, pero la imagen se siente como parte de la misma sección y no como 2 secciones separadas."* En este documento ese patrón es el componente **`ImageSection`** (§3). Ninguna sección de texto + imagen del sitio se construye de otra forma.

---

## Índice

- [0. Decisiones fijadas](#0-decisiones-fijadas)
- [1. Concepto](#1-concepto)
- [2. Sistema de diseño v2](#2-sistema-de-diseño-v2)
- [3. Sistema de secciones cinematográficas (`ImageSection`)](#3-sistema-de-secciones-cinematográficas-imagesection)
- [4. Navegación](#4-navegación)
- [5. Plantillas de página](#5-plantillas-de-página)
- [6. Inventario de componentes Astro](#6-inventario-de-componentes-astro)
- [7. Sistema de movimiento v2](#7-sistema-de-movimiento-v2)
- [8. Rendimiento y SEO](#8-rendimiento-y-seo)
- [9. Producción de imágenes](#9-producción-de-imágenes)
- [10. Criterios de aceptación (QA)](#10-criterios-de-aceptación-qa)
- [11. Pendientes con el cliente](#11-pendientes-con-el-cliente)
- [12. Revisión crítica](#12-revisión-crítica) (r1: manda sobre §0–§11 donde las contradiga)

---

## 0. Decisiones fijadas

### 0.1 Lo que no se negocia (heredado de v1 y de D)

1. Todo el texto en el HTML inicial (Astro SSG). H1 real y único por página. Nada de texto horneado en imágenes.
2. **Solo las 11 cifras confirmadas** (§2.10, `metrics.ts`), siempre con sector, ciudad si se conoce, plazo y la nota "Datos internos de Ingeniak, octubre de 2026". Nada de testimonios, clientes, premios ni precios inventados.
3. Precio: solo **"desde USD 997 al mes"** (constante `PRICE_FROM`). Sin tablas de paquetes ni página de precios.
4. **Un solo CTA primario en todo el sitio:** "Agenda tu Discovery Session" → `/discovery/` (solo dentro de `/discovery/` va directo a `https://agenda.ingeniak.tech/discovery/agendar`). Secundario: WhatsApp +52 33 2101 7799, "Escríbele a Kain", con el mensaje propio de cada página (`secondaryCta` de D).
5. KAIN: robot **blanco** brillante, ojos ovalados cian, dos antenas delgadas, auriculares cromados, pantalla cuadrada oscura en el pecho con asterisco cian. **Siempre de cuerpo completo.** El logotipo de la sub-marca es **kain**, siempre en minúsculas.
6. Paleta: fondo `#03040B`; `#0055FF` solo para acciones; `#00E5FF` para luz de IA, líneas y estados activos; ámbar `#FFB547` **solo** para dolores y problemas.
7. Equipo de 6 (sin Victor Ocampo). Español de México, tuteo, sin humo, datos antes que adjetivos.
8. Kommo es el único "partner oficial" (sello enlazado a kommo.com). GoHighLevel nunca aparece como partner.

### 0.2 Resolución de conflictos entre conceptos, jueces y D

| # | Tema | Decisión | Origen |
|---|---|---|---|
| F1 | Concepto base | **Plano secuencia**: el sitio es una sola toma; cada sección es un plano a sangre sobre el mismo lienzo. | Ganador unánime (3/3 jueces) |
| F2 | Composición móvil | **Texto arriba, sujeto en la mitad inferior** de una placa vertical propia (receta Magnific aprobada, `hero-home-movil-d`). El CTA queda en el primer pantallazo, por encima de la cabeza del sujeto. **Sustituye a D §4.2** (que ponía el sujeto arriba). Existe un modo alterno `below` para secciones largas (§3.6). | Jueces 2 y 3, prueba de FOLIO |
| F3 | Proporción de escritorio | **r1: todas las placas en 16:9** (render ≈1376 × 768 → upscale 2× → master 2752 × 1536), igual que el hero aprobado. Se descarta el 21:9: en 1440 × 900 y 1024 × 768 (las pantallas más comunes) recortaba entre el 31 % y el 43 % del ancho. En pantallas de 1800 px o más, la placa se limita a `min(2200px, 100svh × ar × 1.08)` y funde sus bordes laterales; probado con la placa 16:9 a 2560 × 1080 sin cortar pies ni antenas (`ESPEC-v2-prueba-r1-2560x1080.jpg`). | Jueces 2 y 3 + prueba r1 (§12) |
| F4 | Scroll horizontal fijado | **Prohibido.** El *travelling* horizontal de 9600 px de Plano secuencia se sustituye por **`SystemRuntime`**: una secuencia fijada **vertical** (solo escritorio) con 5 placas de estación que cambian con un barrido de luz y una tarjeta de lead que viaja entre interfaces registradas (GSAP Flip). Tampoco hay riel horizontal fijado de casos ni "jornada" horizontal. | Regla de la tarea + juez 3 (la panorámica era el mayor riesgo de producción) |
| F5 | Secuencias fijadas | **Solo en escritorio** (`min-width:1024px`, `hover:hover`, `pointer:fine`, `min-height:640px`). Máximo 2 por página, solo verticales, cada una con "Saltar escena". Recorrido fijado total del inicio: **3.8 pantallas** (+100 % y +280 %). | Regla de la tarea + juez 2 (bajar de 4.7) |
| F6 | Tipografía | Sistema editorial de FOLIO: Lexend 600 para display (portada `clamp` hasta 148 px, anclada abajo a la izquierda), Lexend 300 para el *deck*, Lexend 200 para cifras mega. La segunda frase de un titular se marca con **dos pesos**, no con dos colores. **Una sola palabra con degradado (`.lit`) por página.** Se reemplaza el archivo de Lexend por la **versión variable completa 100–900**. | Jueces 1 y 2 |
| F7 | Prueba en la portada | Sumario de 3 cifras confirmadas en la portada del inicio (3.2×, −58 %, +340 %), cada una enlazada a su caso y con nota de fuente. Con `max-height: 879px` o en móvil, el sumario baja a la sección 02 (FOLIO usó 819 px con un bloque más corto; con el H1 de esta espec, 880 px es el mínimo probado sin choque). | Jueces 1, 2 y 3 (FOLIO) |
| F8 | Chip del hero | El chip suelto se sustituye por el **pie de foto de cristal "Fig. 01"**, unido a la mano de Kain con una línea guía cian que termina en un nodo cuadrado. Va en zona de piso o niebla, **nunca sobre cara ni torso**. | Jueces 1, 2 y 3 (FOLIO) |
| F9 | Cifras | `src/lib/metrics.ts` es la única fuente; `<Metric id>` no acepta números libres; `scripts/check-cifras.mjs` hace fallar el build si aparece una cifra comercial sin `data-metric`. Toda demo lleva la etiqueta **SIMULACIÓN** y `data-nosnippet`. | Jueces 1, 2 y 3 (SISTEMA VIVO) |
| F10 | Interfaz dentro de la imagen | Las escenas de Kain se generan con una **superficie de cristal en blanco** (teléfono, placa, pantalla). Encima va la UI en HTML (chat, tarjeta de lead, flujo, tablero), registrada al píxel con CSS. | Jueces 1 y 2 (SISTEMA VIVO) |
| F11 | Casting | Servicios = **Kain trabajando** con el objeto del servicio (efecto franquicia, como el sitio actual pero con el Kain correcto). **r1: Industrias = Kain en el ambiente del sector con una persona del sector secundaria** (decisión de `IMAGENES-v2.md` §1-4, que es la lista vigente de placas). Casos = persona **siempre a la derecha**, cifra gigante a la izquierda (así sus portadas se reutilizan en el inicio). Dolor = persona en luz ámbar. Contacto = Kain (no una "asesora" generada que sugiera una empleada que no existe). **Cambia lo asignado en D §14; hay que validarlo con el cliente** (§11). | Juez 2 (SISTEMA VIVO) + IMAGENES |
| F12 | Folios | La numeración de folios de FOLIO **no se muestra**. Se usa solo internamente y en el buscador ⌘K. | Jueces 2 y 3 |
| F13 | Jerga de cine en pantalla | El HUD con horas (23:47 → 06:00) existe **solo en el inicio**, con índice `01 / 13` (sin la palabra "ESC"). En las páginas internas el HUD muestra solo etiquetas de contexto (`SERVICIO · ATENDER`). | Juez 2 |
| F14 | Cierres de página | `cta-amanecer` ("06:00 · Rise") sustituye a las variantes de Kain de D (`cta-kain-saluda` y `cta-kain-senala`; esta última pasa a ser la misma placa en espejo). `cta-duena-tranquila` y `cta-equipo` se mantienen donde D las asigna, pero se reiluminan con el mismo amanecer frío. | Plano secuencia §8 |
| F15 | Un azul por pantalla | El botón del encabezado es **contorno** mientras haya un botón primario azul visible en el contenido, y se vuelve azul relleno cuando no lo hay. Lo mismo para la barra inferior móvil (se oculta). | Corrige una contradicción interna de Plano secuencia |
| F16 | Hora 11:48 p. m. | Es **hora narrativa** (ejemplo ilustrativo), **no un dato del caso**. Siempre va con la etiqueta "Ejemplo ilustrativo" y junto a la cifra real (de 8 min a 12 s, clínica dental, Monterrey). | Corrige Plano secuencia §0.3 |
| F17 | Búsqueda | ⌘K "Busca o pregúntale a Kain" con índice estático (45 páginas + respuestas cortas del banco de FAQ) y acción de WhatsApp con el texto escrito. | Jueces 1, 2 y 3 |
| F18 | Siguiente reportaje | Al final de cada caso, la portada del caso siguiente asoma y se expande con View Transition hasta ser su portada. | Jueces 1, 2 y 3 (FOLIO) |
| F19 | VKTOR gigante | "VKTOR" gigante en contorno **detrás** del recorte registrado de Kain en la escena 09 del inicio y en la portada de `/metodologia/`; cada letra se rellena al entrar su fase. | Jueces 1, 2 y 3 (FOLIO) |
| F20 | Rama de luz | Una rama de luz con la geometría del isotipo (codos a 45°, nodo cuadrado) va de Kain al pie de foto o a la UI registrada y de ahí al botón primario. **Nunca cruza texto.** Al llegar, el borde del botón hace un solo recorrido de luz. | Juez 3 (SISTEMA VIVO) |
| F21 | Píldora flotante en escritorio | Se permite **una** píldora "Escríbele a Kain" (contorno, nunca azul) abajo a la derecha, desde el segundo viewport, solo mientras el encabezado está oculto. Se esconde en secuencias fijadas y cuando el cierre está visible. Sigue prohibido el botón flotante "Cotizar". | Patrón 17 de C, acotado por la regla 12 de Plano secuencia |
| F22 | Barra de lectura | Filete cian de 2 px bajo el encabezado **solo en artículos del blog**. En casos, la orientación la da el riel (Quick Jump). | FOLIO, acotado |

### 0.3 Cambios que hay que aplicar a `D-sitemap.json` antes de construir

> **r1: ya aplicados en `D-sitemap.json`** (H1 del inicio, orden del inicio, campo `plate` con id, `layout`, `mirror`, `height`, `tone`, modo móvil, `srcsetMax` y respaldo de lanzamiento tomados de `IMAGENES-v2.json`; `folio`; testimonios condicionales; secciones nuevas `senales`, `como-funciona`, `inversion`, `cifra` y `datos`). `D-navegacion.json` ya tiene el mega menú de Servicios por las 5 etapas (§4.2). Detalle en §12.4.

1. **H1 de `/`:** "Agentizamos empresas. Agentes de IA, CRM y automatización en un solo sistema." (dos voces dentro del mismo `<h1>`; el punto sustituye a los dos puntos). Actualizar el validador de H1 para que compare el texto normalizado del `<h1>`.
2. **Composición móvil (`sections[].image.mobile`):** reescribir todas las fichas al modelo "texto arriba, sujeto en la mitad inferior" (§3.6). Proporción: 9:16 en portadas con Kain; 4:5 en el resto.
3. **Casting de portadas de servicio (F11):** cada portada de servicio pasa a Kain trabajando; la escena de persona de D para ese servicio se mueve a la sección intermedia "Señales" (§9.2). Pendiente de validación.
4. **Cierres:** `cta-kain-saluda` → `cta-amanecer`; `cta-kain-senala` → `cta-amanecer` en espejo (`mirror: true`).
5. **Campo nuevo `plate`** en cada sección cinematográfica, con la clave de `src/data/plates.json` (§3.4).
6. **Campo nuevo `folio`** (interno, no visible; lo usa ⌘K).
7. `/casos/*`, sección `testimonio`: queda con `status: "conditional"`. Solo se renderiza si existe la aprobación escrita del cliente.

---

## 1. Concepto

### 1.1 Nombre e idea

**"Plano secuencia — el turno de noche de Kain".** En cine, un plano secuencia es una toma larga **sin cortes**. Llevamos el requisito del cliente ("que imagen y texto se sientan una sola sección") de las portadas a **todo el sitio**: ninguna sección tiene fondo propio, ninguna corta a la siguiente y cada sección importante es un plano a sangre donde Kain (o una persona del sector) actúa de un lado y el texto vive en la penumbra del otro, **dentro de la misma imagen**. El scroll es la cámara: hace dolly, push-in, rack focus y barridos de luz. La interfaz se reduce a lo mínimo y la luz es el material.

**La historia del inicio** (las páginas internas heredan el lenguaje, no la historia):

| Acto | HUD | Qué pasa | Escenas |
|---|---|---|---|
| I · La noche | 23:47 → 23:48 | Kain está listo. A las 23:48 un cliente escribe y nadie contesta: luz ámbar. Un barrido de luz cambia el mismo encuadre y Kain ocupa el lugar del dueño: luz cian. | 01–03 |
| II · El sistema | 00:00 → 04:30 | Qué es Ingeniak, el sistema en 5 estaciones (Atraer · Atender · Organizar · Automatizar · Medir), Kain en primera persona, los servicios, las pruebas y el protocolo VKTOR™. | 04–09 |
| III · El amanecer | 05:00 → 06:00 | Dónde trabaja (industrias), quién lo construye (el equipo), la ficha técnica y un horizonte frío que amanece: **Rise**, la última fase de VKTOR™, que lleva a la Discovery Session. | 10–13 |

Las horas son narrativas: van en el HUD, en mono, con `aria-hidden="true"`, y nunca junto a una cifra de negocio (F16).

**Firma animada "Del nodo al pecho"** (2.8 s, una vez por sesión, solo en `/`, se salta con cualquier gesto): el nodo cuadrado del isotipo late, se dibujan el pilar y las ramas, el isotipo se colapsa en su nodo, **ese nodo es la pantalla del pecho de Kain** y la cámara se aleja del asterisco hasta la portada real. Cuenta sin palabras que **Kain es la inteligencia de Ingeniak** (§7.3).

### 1.2 Injertos adoptados

| De | Injerto | Dónde vive en esta espec |
|---|---|---|
| FOLIO | Tipografía editorial (Lexend 600 / 300 / 200, dos pesos, una `.lit` por página) | §2.3 |
| FOLIO | Sumario de 3 cifras con enlace y nota de fuente en la portada; "Nota del editor" en industrias sin caso propio | §5.1 (ESC 01–02), §5.3 |
| FOLIO | Pie de foto "Fig. 01" con línea guía y nodo cuadrado | §3.8, `FigCaption` |
| FOLIO | Arte dirigido **por proporción** `(max-width:767px), (max-aspect-ratio:5/6)`; sumario fuera del hero en escritorios bajos (`max-height:879px`); menú compacto bajo 1180 px | §3.6, §4.1 |
| FOLIO | VKTOR gigante detrás del recorte de Kain | `GhostWord`, §5.1 ESC 09, §5.7 |
| FOLIO | Casos como reportaje + "Siguiente reportaje" con View Transition | §5.4, `NextStory` |
| FOLIO | Breadcrumb como línea mono dentro de la portada | §4.4 |
| SISTEMA VIVO | `metrics.ts` + `<Metric id>` + `check-cifras.mjs`; SIMULACIÓN + `data-nosnippet` | §2.10, §8.6 |
| SISTEMA VIVO | UI registrada sobre cristal en blanco dentro de la imagen | §3.7, `ChatSim`, `SystemRuntime` |
| SISTEMA VIVO | Runtime: tarjeta de lead con Flip por 5 etapas, cada una con su cifra y fuente | §5.1 ESC 05, `SystemRuntime` |
| SISTEMA VIVO | Registro de resultados en tabla (complemento accesible del Montaje) | `ResultsLedger`, §5.4–5.5 |
| SISTEMA VIVO | Buscador ⌘K "Busca o pregúntale a Kain"; mega menú de Servicios por las 5 etapas | §4.2, §4.3 |
| SISTEMA VIVO | Rama de luz Kain → UI → CTA | `LightBranch`, §3.8 |
| SISTEMA VIVO | Regla de casting (servicio = Kain, industria = persona, caso = persona a la derecha) | F11, §9.2 |

### 1.3 Qué cambia frente a v1

| Tema | v1 (rechazada) | v2 |
|---|---|---|
| Estructura | One-page + 4 landings SEO + discovery | **45 páginas** en 9 grupos (D), mega menú con previsualización, buscador ⌘K y un footer-mapa con todas las páginas indexables |
| Papel de la imagen | Isotipo de cristal + chips unidos por líneas (se leía como diagrama); imágenes en cajas con borde y radio | **La imagen es el set**: placa a sangre, sujeto de un lado, texto en la penumbra del otro, UI anclada a puntos de la imagen |
| Kain | Aparecía en la sección 7, de ~330 px, junto a un mockup en dos columnas | Protagonista desde el primer pixel (la firma nace en su pecho), presente en cada servicio |
| Ritmo | 13 secciones casi iguales (titular + tarjetas) y bandas negras vacías de 300–500 px | 13 escenas con intensidad 1–3 alternada; **ninguna zona de más de 40vh sin luz** |
| Tipografía | Lexend 500, plana, blanca y gris | Lexend 600 / 300 / 200 editorial, anclada a la escena, una palabra con luz por página |
| Cristal | En todas partes, también sobre negro plano | 3 niveles, **solo sobre imagen o luz**, nunca detrás del bloque de texto, máximo 6 a la vez |
| Prueba | Cifras en tarjetas de texto | Cifras como escenas: sumario en portada, montaje con textura de imagen, cronómetros, barras-índice, registro en tabla |
| Movimiento | La misma entrada en cada sección | Lenguaje de cámara: dolly, push-in, rack focus, barrido de luz, firma de apertura, corte por coincidencia entre páginas |
| Móvil | Recorte del mismo plano | Placa vertical propia con el sujeto abajo y el CTA en el primer pantallazo |

### 1.4 Por qué le gana al ingeniak.mx actual (explícito)

El cliente tiene razón en que el sitio actual se siente más premium que la v1, y la auditoría (A §5) explica por qué: **escena a sangre con personaje, luz, densidad de eventos y amplitud**. La v2 toma esas cuatro cosas y corrige todo lo que el actual hace mal:

| # | ingeniak.mx hoy (A §2–§7) | v2 |
|---|---|---|
| 1 | El texto vive en un **panel de cristal grande** de 576 × 635 px: se lee como un segundo bloque. **En móvil ese panel tapa al robot** (solo se ven antenas y pies). | Texto **sin caja** en la penumbra generada a propósito; en móvil, placa vertical propia con el sujeto abajo y el texto arriba. Ninguna tarjeta tapa al sujeto (regla de QA). |
| 2 | Robot **negro** (y otro robot distinto en consultoría). Hero de 1200 × 671 estirado a 1440. | Kain **blanco oficial** en todas las escenas, con referencias fijas. Placas de 2752–3360 px en AVIF con `srcset`. |
| 3 | Los heroes de servicio tienen el **titular horneado en la imagen** (sin H1, erratas "247", "Keybonk", "Heds + Herro + Hero") y en móvil queda a ~8 px. | H1 y todo el copy en HTML. Las imágenes no llevan letras, números ni UI legible. |
| 4 | SPA sin HTML inicial: ningún H1 en el HTML, el mismo `<title>` en todas las rutas, home indexada en inglés y el panel interno (851 KB) en el bundle público. **El blog da pantalla negra.** | Astro SSG: cada página con su HTML completo, `title`, meta, JSON-LD y `lang="es-MX"`. Blog en colección MDX. |
| 5 | **Testimonios con fotos de randomuser.me**, toasts "en vivo" falsos y cifras sin confirmar (−40 % costos, 3.8× ROAS, +312 % tráfico…). | Solo 11 cifras confirmadas, con fuente, y un build que **falla** si aparece otra. Sin testimonios hasta tener aprobación escrita. |
| 6 | 7+ CTA distintos hacia 3 destinos; "Agenda una llamada" abre un formulario de cotización sin calendario. | Un solo primario ("Agenda tu Discovery Session") con una promesa que se cumple: 30 min, 1:1, Google Meet, sin costo. |
| 7 | Plantilla única ×9 con emojis, placeholders vacíos y la misma cita de SEO pegada en todos los servicios. | 4 plantillas internas con contenido propio, escena propia por página y "Siguiente reportaje" entre casos. |
| 8 | Precios IGNITE / SCALE / DOMINATE con setup; dos definiciones de VKTOR; dos listas de países. | "Desde USD 997 al mes"; VKTOR™ = Verify · Koncept · Transform · Operate · Rise; 7 países únicos. |
| 9 | 6 enlaces de menú, sin industrias ni casos; footer con redes genéricas. | Mega menú con 5 paneles, 8 industrias, 5 casos, buscador, footer-mapa y redes reales. |
| 10 | Densidad por relleno (marquesinas, carruseles, acordeones). | Densidad por escena: algo nuevo cada 600–800 px de scroll, siempre con contenido real. |

**En una línea:** el actual tiene la escena pero la tapa con una caja y la llena de humo; v1 tenía la verdad pero sin escena; **v2 pone la verdad dentro de la escena**.

---
## 2. Sistema de diseño v2

Archivo único de tokens: `src/styles/tokens.css`. Ningún componente usa un color, tamaño o sombra que no esté aquí.

### 2.1 Color

| Token | Valor | Rol (y lo que **no** puede hacer) |
|---|---|---|
| `--ink` | `#03040B` | Lienzo único. Solo `body` pinta fondo. Color final de todas las disoluciones de imagen. |
| `--ink-2` | `#060A18` | Penumbra de placas generadas (zona de texto) y fondo de `<dialog>`. |
| `--paper` | `#070B18` | Superficie sólida (`.solid`) cuando no hay imagen ni luz detrás. Nunca se llama cristal. |
| `--navy` | `#0A1F4C` | Atmósfera de placas, gradado de imagen, palabra fantasma. Nunca texto. |
| `--blue` | `#0055FF` | **Solo** el botón primario "Agenda tu Discovery Session". Un azul por pantalla. |
| `--blue-hi` | `#1A66FF` | Hover y foco del primario. |
| `--indigo` | `#455DFF` | Solo como paso intermedio de degradados (luz de relleno, `.lit`). Nunca color plano de UI. |
| `--cyan` | `#00E5FF` | Luz de IA: líneas, ramas, nodos, estados activos, foco, eyebrows. Salida "solución". |
| `--cyan-soft` | `#A8F3FF` | Parada clara de degradados de luz. |
| `--text` | `#FFFFFF` | Titulares y texto principal. |
| `--text-2` | `#DCE6F2` | Lede cuando el velo bajo el texto es menor a .75 (sustituye a muted). |
| `--soft` | `#C9D6E6` | Segundo peso de titulares (`.soft`, Lexend 300) y *deck*. |
| `--muted` | `#9EB0C7` | Texto secundario, metadatos. Solo sobre fondo con luminancia ≤ 0.054 (§2.1.1). |
| `--amber` | `#FFB547` | **Solo** dolor y problemas (listas de dolores, placas de dolor, errores de formulario). Siempre "pierde" contra el cian en la misma escena. |
| `--hair` | `rgb(158 176 199 / .14)` | Filetes entre filas. |
| `--hair-2` | `rgb(158 176 199 / .32)` | Filetes de recuadros y tablas. |
| `--hair-cyan` | `rgb(0 229 255 / .35)` | Filetes activos, borde de botón contorno. |

Excepción tolerada: el sello amarillo de Kommo Partner (es de Kommo; no se recolorea, va pequeño).

#### 2.1.1 Contraste (AA obligatorio, medido sobre la imagen real)

Relaciones sobre `--ink` (luminancia 0.0013): blanco 20.4 : 1 · `--muted` 9.1 : 1 · `--cyan` 13.3 : 1 · `--amber` 11.6 : 1 · blanco sobre `--blue` 5.6 : 1 (AA).

Sobre imagen, el contraste se mide contra **el píxel más claro** que queda bajo cada línea de texto, ya con el velo aplicado. Umbrales de luminancia relativa máxima del fondo compuesto:

| Texto | Mínimo | Fondo compuesto permitido |
|---|---|---|
| Blanco, cuerpo (< 24 px) | 4.5 : 1 | L ≤ 0.183 |
| Blanco, grande (≥ 24 px, o ≥ 18.7 px en 600) | 3 : 1 | L ≤ 0.300 |
| `--muted`, cuerpo | 4.5 : 1 | L ≤ 0.054 (si no se cumple, se usa `--text-2`) |
| `--cyan`, etiqueta mono 11–12 px | 4.5 : 1 | L ≤ 0.102 |
| Ámbar, cuerpo | 4.5 : 1 | L ≤ 0.083 |

La medición la hace `scripts/check-contraste.mjs` (§10): Chrome headless a 390 × 844, 1024 × 1366, 1440 × 900 y 1920 × 1080; para cada nodo de texto dentro de un `ImageSection`, toma la captura con el texto oculto, muestrea los píxeles bajo su caja y falla si el más claro supera el umbral.

```css
:root{
  --ink:#03040B; --ink-2:#060A18; --paper:#070B18; --navy:#0A1F4C;
  --blue:#0055FF; --blue-hi:#1A66FF; --indigo:#455DFF; --cyan:#00E5FF; --cyan-soft:#A8F3FF;
  --text:#FFFFFF; --text-2:#DCE6F2; --soft:#C9D6E6; --muted:#9EB0C7; --amber:#FFB547;
  --hair:rgb(158 176 199 / .14); --hair-2:rgb(158 176 199 / .32); --hair-cyan:rgb(0 229 255 / .35);
  color-scheme:dark;
}
*,*::before,*::after{box-sizing:border-box}                 /* min-height de las escenas incluye su padding */
body,h1,h2,h3,h4,p,figure,blockquote,dl,dd{margin:0}
html{background:var(--ink)}
body{background:var(--ink);color:var(--text);font:var(--t-body);overflow-x:clip;-webkit-font-smoothing:antialiased}
body::after{content:"";position:fixed;inset:-50%;z-index:100;pointer-events:none;opacity:.06;mix-blend-mode:overlay;
  background-image:url(/fx/noise.webp)}                 /* un solo grano para imagen y UI (256 px, ≤ 6 KB) */
::selection{background:rgb(0 229 255 / .3);color:#fff}
```

### 2.2 Fuentes

| Familia | Archivo (auto-hospedado en `/fonts/`) | Uso |
|---|---|---|
| **Lexend** variable 100–900 | `lexend-var-latin.woff2` (subset latin + latin-ext: á é í ó ú ñ ü ¿ ¡ × − → ·) | Display, titulares, cifras, botones. **Reemplaza el archivo actual, que no llega al peso 200.** |
| **Inter** variable | `inter-var-latin.woff2` | Cuerpo, lede, enlaces, formularios. |
| **JetBrains Mono** variable | `jetbrains-mono-var-latin.woff2` | Eyebrows, HUD, breadcrumbs, microcopia, `<kbd>`, fichas. |

`font-display: swap` en las tres. Se precarga **solo Lexend** (`<link rel="preload" as="font" type="font/woff2" crossorigin>`). Fallbacks métricos con `size-adjust` para evitar CLS: `"Lexend Fallback"` = Arial con `size-adjust:106%; ascent-override:92%; descent-override:23%` (calibrar con `fontaine` en el build).

### 2.3 Escala tipográfica

Base 16 px. Todos los tamaños fluidos con `clamp()` (los valores indican el resultado aproximado a 390 / 1440 / 1920 px).

| Token | Familia y peso | `font-size` | Interlínea · tracking | 390 / 1440 / 1920 | Uso |
|---|---|---|---|---|---|
| `--fs-mega` | Lexend **200**, `tabular-nums` | `clamp(5.5rem, 2rem + 15vw, 16rem)` | .80 · −.06em | 90 / 248 / 256 | Cifras del Montaje, cifra del H1 de caso, sumario grande |
| `--fs-display` | Lexend **600** | `clamp(2.75rem, .6rem + 7.2vw, 9.25rem)` | .88 · −.055em | 44 / 113 / 148 | Primera voz del H1 del inicio ("Agentizamos empresas.") |
| `--fs-display-2` | Lexend **600** | `clamp(2.5rem, 1rem + 4.6vw, 6rem)` | .95 · −.045em | 40 / 82 / 96 | H1 de páginas internas |
| `--fs-deck` | Lexend **300** | `clamp(1.25rem, .9rem + 1.3vw, 2rem)` | 1.22 · −.02em | 20 / 32 / 32 | Segunda voz del H1, entradillas |
| `--fs-h2` | Lexend **600** (+ `.soft` en 300) | `clamp(2.25rem, 1rem + 3.9vw, 5.5rem)` | .95 · −.045em | 36 / 72 / 88 | H2 de escena e intertítulo |
| `--fs-h3` | Lexend 500 | `clamp(1.375rem, 1rem + 1.1vw, 2rem)` | 1.1 · −.02em | 22 / 32 / 32 | Filas de guion, nombres, estaciones |
| `--fs-h4` | Lexend 500 | `1.25rem` | 1.25 · −.01em | 20 | Título de fotograma, pregunta de FAQ |
| `--fs-standfirst` | Lexend 300 | `clamp(1.25rem, 1rem + .7vw, 1.625rem)` | 1.4 · −.01em | 20 / 26 / 26 | Entradilla de caso y artículo |
| `--fs-lede` | Inter 400 | `clamp(1.0625rem, .98rem + .35vw, 1.3125rem)` | 1.55 · 0 | 17 / 21 / 21 | Lede de escena, máx. 44ch |
| `--fs-body` | Inter 400 | `1.0625rem` | 1.65 · 0 | 17 | Cuerpo, máx. 68ch |
| `--fs-article` | Inter 400 | `1.1875rem` | 1.7 · 0 | 19 | Cuerpo de artículo y caso, máx. 64ch |
| `--fs-small` | Inter 400 | `.875rem` | 1.5 · 0 | 14 | Notas al pie, leyendas |
| `--fs-label` | JetBrains Mono 500, MAYÚSCULAS | `.6875rem` | 1 · .16em | 11 | Eyebrow (cian), HUD (muted 70 %), breadcrumb |
| `--fs-micro` | JetBrains Mono 400 | `.75rem` | 1.45 · .06em | 12 | Microcopia bajo CTA, fichas, fuente de cifras |

```css
:root{
  --f-display:"Lexend","Lexend Fallback",system-ui,sans-serif;
  --f-body:"Inter","Inter Fallback",system-ui,sans-serif;
  --f-mono:"JetBrains Mono",ui-monospace,monospace;
  --t-body:400 1.0625rem/1.65 var(--f-body);
}
.t-mega{font:200 clamp(5.5rem,2rem + 15vw,16rem)/.8 var(--f-display);letter-spacing:-.06em;font-variant-numeric:tabular-nums}
.t-display{font:600 clamp(2.75rem,.6rem + 7.2vw,9.25rem)/.88 var(--f-display);letter-spacing:-.055em;margin-left:-.05em}
.t-display-2{font:600 clamp(2.5rem,1rem + 4.6vw,6rem)/.95 var(--f-display);letter-spacing:-.045em;text-wrap:balance}
.t-deck{display:block;font:300 clamp(1.25rem,.9rem + 1.3vw,2rem)/1.22 var(--f-display);letter-spacing:-.02em;color:var(--soft);max-width:24em}
.t-deck b{font-weight:400;color:var(--text)}
.t-h2{font:600 clamp(2.25rem,1rem + 3.9vw,5.5rem)/.95 var(--f-display);letter-spacing:-.045em;text-wrap:balance}
.t-h2 .soft,.t-display-2 .soft{font-weight:300;color:var(--soft)}     /* segunda frase: dos pesos, no dos colores */
.t-h3{font:500 clamp(1.375rem,1rem + 1.1vw,2rem)/1.1 var(--f-display);letter-spacing:-.02em}
.t-h4{font:500 1.25rem/1.25 var(--f-display);letter-spacing:-.01em}
.t-standfirst{font:300 clamp(1.25rem,1rem + .7vw,1.625rem)/1.4 var(--f-display);color:#E6EEF8;max-width:34em}
.t-lede{font:400 clamp(1.0625rem,.98rem + .35vw,1.3125rem)/1.55 var(--f-body);color:var(--muted);max-width:44ch;text-wrap:pretty}
.t-label{font:500 .6875rem/1 var(--f-mono);letter-spacing:.16em;text-transform:uppercase;color:rgb(158 176 199 / .8)}
.t-label--cyan{color:var(--cyan)}
.t-micro{font:400 .75rem/1.45 var(--f-mono);letter-spacing:.06em;color:var(--muted)}
.lit{background:linear-gradient(92deg,#fff 0%,var(--cyan-soft) 30%,var(--cyan) 65%,var(--indigo) 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent}   /* UNA por página (lint en build) */
.fn{font:500 .62em/0 var(--f-mono);vertical-align:super;color:var(--cyan)}  /* llamada a nota de fuente */
```

Reglas: titulares alineados a la izquierda (salvo `subject-center`); `text-wrap: balance` en H1–H2; nada de bold 700+; nada de itálicas decorativas; `.lit` máximo una vez por página (el build lo cuenta).

### 2.4 Retícula

| Rango | Columnas | Gutter | Margen lateral |
|---|---|---|---|
| < 768 px | 4 | 16 px | **16 px** (`--safe-x` mínimo) |
| 768–1023 px | 8 | `clamp(16px, 1.7vw, 24px)` | `6.25vw` |
| ≥ 1024 px | 12 | `clamp(16px, 1.7vw, 24px)` | `6.25vw`, contenedor máx. 1440 px |

```css
:root{
  --safe-x:clamp(16px,6.25vw,120px);          /* "title-safe": texto y UI */
  --action-x:clamp(12px,3.5vw,56px);          /* "action-safe": HUD, encabezado, riel */
  --frame:min(100vw - 2 * var(--safe-x),1440px);
  --gap:clamp(16px,1.7vw,24px);
  --hdr:72px;                                  /* 60px en < 768 */
}
.frame{width:var(--frame);margin-inline:auto;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:var(--gap)}
@media (max-width:1023px){.frame{grid-template-columns:repeat(8,minmax(0,1fr))}}
@media (max-width:767px){.frame{grid-template-columns:repeat(4,minmax(0,1fr))}:root{--hdr:60px}}
.col-text{grid-column:1 / span 6} .col-text-r{grid-column:7 / span 6}
.col-measure{grid-column:3 / span 7} .col-margin{grid-column:1 / span 2} .col-aside{grid-column:10 / span 3}
@media (max-width:1023px){.col-text,.col-text-r,.col-measure,.col-margin,.col-aside{grid-column:1 / -1}}
```

Sin scroll horizontal de página en ningún ancho (`overflow-x: clip` en `body`; QA a 320 px).

### 2.5 Espaciado

| Token | px | Uso típico |
|---|---|---|
| `--s-1` | 4 | Separador de breadcrumb, nodo |
| `--s-2` | 8 | Gap de chips, icono-texto |
| `--s-3` | 12 | Microcopia bajo CTA |
| `--s-4` | 16 | Gap de lista, padding de chip |
| `--s-5` | 24 | Entre eyebrow y H1, gap de CTAs |
| `--s-6` | 32 | Entre H1 y lede |
| `--s-7` | 48 | Entre lede y CTAs en portada; padding de panel |
| `--s-8` | 64 | Entre bloques de un intertítulo |
| `--s-9` | 96 | Respiro de intertítulo (escritorio) |
| `--s-10` | 128 | Separación entre actos |
| `--s-11` | 168 | Máximo vertical permitido sin luz |
| `--seam` | `clamp(80px, 12vh, 160px)` (56 px en móvil) | Solape entre escenas |
| `--beat` | `clamp(72px, 10vh, 128px)` | Padding vertical de intertítulos |

```css
:root{--s-1:4px;--s-2:8px;--s-3:12px;--s-4:16px;--s-5:24px;--s-6:32px;--s-7:48px;--s-8:64px;--s-9:96px;--s-10:128px;--s-11:168px;
  --seam:clamp(80px,12vh,160px);--beat:clamp(72px,10vh,128px)}
@media (max-width:767px){:root{--seam:56px}}
```

### 2.6 Radios

`--r-node: 4px` (nodos, separadores) · `--r-input: 12px` (inputs, `<kbd>`, tarjeta de lead) · `--r-chip: 16px` (chips, pies de foto, burbujas) · `--r-still: 20px` (fotogramas, ventana de producto) · `--r-panel: 24px` (mega menú, diálogo ⌘K, hoja móvil) · `--r-pill: 999px` (botones). **Las placas de `ImageSection` no tienen radio ni borde.**

```css
:root{--r-node:4px;--r-input:12px;--r-chip:16px;--r-still:20px;--r-panel:24px;--r-pill:999px}
```

### 2.7 Elevación y brillo

```css
:root{
  --e-hi:inset 0 1px 0 rgb(255 255 255 / .28);                 /* reflejo superior de cristal */
  --e-1:0 10px 30px rgb(0 0 0 / .35);
  --e-2:0 20px 60px rgb(0 0 0 / .45);                          /* chips y pies de foto */
  --e-3:0 30px 80px rgb(0 0 0 / .55);                          /* paneles, diálogo */
  --glow-blue:0 10px 40px rgb(0 85 255 / .55);                 /* botón primario */
  --glow-blue-hi:0 12px 44px rgb(0 85 255 / .6),0 0 80px rgb(0 229 255 / .25);
  --glow-cyan:0 0 14px rgb(0 229 255 / .9);                    /* nodos, fin de rama */
  --glow-cyan-soft:0 0 24px 4px rgb(0 229 255 / .45),0 18px 60px 10px rgb(0 85 255 / .3); /* filo de luz de cierre */
}
```

No hay sombras sobre texto. El brillo se usa en nodos, ramas, el botón primario y el filo inferior de la tarjeta de cierre, nunca en párrafos.

### 2.8 Cristal (3 niveles)

| Nivel | Uso | Condición |
|---|---|---|
| `.glass-chip` | Pie de foto Fig., chips de prueba, burbujas de chat, sello Kommo sobre placa | Máx. 300 px de ancho; siempre sobre imagen o luz |
| `.glass-panel` | Mega menú, hoja móvil, diálogo ⌘K, teléfono y ventana de producto registrados, pregunta abierta del FAQ | Siempre con imagen, aura o escena detrás |
| `.solid` | Cualquier superficie sin nada detrás que difuminar | **No es cristal** |

```css
.glass-chip{position:relative;border-radius:var(--r-chip);padding:12px 14px 13px;
  background:linear-gradient(150deg,rgb(255 255 255 / .12),rgb(255 255 255 / .04) 50%,rgb(69 93 255 / .10));
  -webkit-backdrop-filter:blur(18px) saturate(150%);backdrop-filter:blur(18px) saturate(150%);
  box-shadow:var(--e-hi),inset 0 0 0 1px rgb(255 255 255 / .08),var(--e-2)}
.glass-chip::before,.glass-panel::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
  background:linear-gradient(140deg,rgb(255 255 255 / .5),rgb(255 255 255 / .06) 40%,rgb(0 229 255 / .45));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.glass-panel{position:relative;border-radius:var(--r-panel);background:rgb(10 31 76 / .55);
  -webkit-backdrop-filter:blur(24px) saturate(140%);backdrop-filter:blur(24px) saturate(140%);
  box-shadow:var(--e-hi),var(--e-3);border-top:1px solid rgb(0 229 255 / .35)}
.solid{background:rgb(7 11 24 / .92);border:1px solid var(--hair-2);border-radius:var(--r-still)}
.is-active-glass{box-shadow:inset 0 0 0 1px rgb(0 229 255 / .55),inset 0 0 40px rgb(0 229 255 / .18),0 0 60px rgb(0 229 255 / .25)}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .glass-chip,.glass-panel{background:rgb(9 14 34 / .92)}}
```

Reglas duras: (1) **nunca** un cristal detrás del bloque de texto de una escena; (2) máximo **6** `backdrop-filter` visibles a la vez y blur ≤ 24 px; (3) ningún ancestro del cristal con `opacity`, `filter`, `mask`, `clip-path` o `mix-blend-mode` animados (se aplana): se anima el propio cristal con `transform`; (4) nunca cristal sobre un video en reproducción.

### 2.9 Botones y enlaces

| Variante | Clase | Uso | Especificación |
|---|---|---|---|
| Primario | `.btn` | **Solo** "Agenda tu Discovery Session" (y "Agendar mi Discovery Session" en `/discovery/`) | Pill azul de 56 px (52 px y ancho completo en la portada móvil), Lexend 500 15 px, con el **nodo del isotipo** a la derecha que "echa rama" en hover. Siempre con microcopia debajo: `30 min · 1:1 · Google Meet · sin costo`. Magnético ±6 px solo con `pointer: fine`. |
| Contorno | `.btn--ghost` | "Escríbele a Kain" (WhatsApp) y el CTA del encabezado cuando hay otro azul visible (F15) | Fondo `rgb(255 255 255 / .04)`, borde interior 1 px `--hair-cyan`, icono de WhatsApp de línea a la izquierda. |
| Pequeño | `.btn--sm` | Encabezado | 40 px de alto, 13 px. |
| Icono | `.btn-icon` | WhatsApp circular del encabezado, buscar, menú, pausa | 40 × 40, círculo, borde `--hair-2`, `aria-label` obligatorio. |
| Enlace | `.lnk` | "Ver caso", "Conoce el protocolo completo", enlaces en texto | Inter 500 15 px, subrayado de 1 px cian que se retira y se vuelve a trazar en hover. |
| Enlace mono | `.lnk--mono` | "Ver todos", "Saltar escena" | JetBrains Mono 11 px, mayúsculas, cian. |
| Rama | `.link-branch` | Enlaces terciarios en filas | Subrayado que nace de un nodo de 4 px y crece hacia la derecha. |

```html
<a class="btn" href="/discovery/" data-primary>Agenda tu Discovery Session
  <span class="btn__node" aria-hidden="true"><svg viewBox="0 0 16 16"><rect class="n" x="5" y="5" width="6" height="6" rx="1"/><path class="r" d="M8 8h6M11 5l3 3-3 3"/></svg></span></a>
<p class="t-micro btn-micro">30 min · 1:1 · Google Meet · sin costo</p>
```

```css
.btn{position:relative;display:inline-flex;align-items:center;gap:16px;height:56px;padding:0 10px 0 26px;border-radius:var(--r-pill);
  background:var(--blue);color:#fff;font:500 15px/1 var(--f-display);text-decoration:none;
  box-shadow:inset 0 0 0 1px rgb(255 255 255 / .16),var(--glow-blue);transition:background .45s var(--ease-cine),box-shadow .45s var(--ease-cine)}
.btn:hover,.btn:focus-visible{background:var(--blue-hi);box-shadow:inset 0 0 0 1px rgb(255 255 255 / .28),var(--glow-blue-hi)}
.btn:active{transform:scale(.98)}
.btn__node{width:36px;height:36px;border-radius:50%;background:rgb(255 255 255 / .14);display:grid;place-items:center}
.btn__node svg{width:16px;overflow:visible}
.btn__node .n{fill:#fff;filter:drop-shadow(0 0 4px #fff);transform-origin:8px 8px;transition:transform .45s var(--ease-cine)}
.btn__node .r{fill:none;stroke:#fff;stroke-width:1.6;stroke-linecap:round;stroke-dasharray:14;stroke-dashoffset:14;transition:stroke-dashoffset .45s var(--ease-cine)}
.btn:hover .n{transform:translateX(-4px) scale(.55)} .btn:hover .r{stroke-dashoffset:0}
.btn::after{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;pointer-events:none;opacity:0;   /* recorrido de luz (una vez) */
  background:conic-gradient(from var(--trace,0deg),transparent 0 300deg,var(--cyan) 340deg,#fff 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.btn.is-traced::after{animation:trace 1.2s var(--ease-cut) 1}
@property --trace{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes trace{0%{opacity:1;--trace:0deg}90%{opacity:1}100%{opacity:0;--trace:360deg}}
.btn--ghost{background:rgb(255 255 255 / .04);box-shadow:inset 0 0 0 1px var(--hair-cyan)}
.btn--ghost:hover{background:rgb(0 229 255 / .08)}
.btn--sm{height:40px;padding:0 6px 0 18px;font-size:13px;gap:10px} .btn--sm .btn__node{width:28px;height:28px}
.btn-micro{margin-top:var(--s-3)}
:where(a,button,[tabindex]):focus-visible{outline:2px solid var(--cyan);outline-offset:3px;border-radius:inherit}
.lnk{display:inline-flex;gap:10px;align-items:center;font:500 15px/1 var(--f-body);padding:8px 0;color:var(--text);text-decoration:none;
  background:linear-gradient(var(--cyan),var(--cyan)) 100% 100% / 100% 1px no-repeat;transition:background-size .45s var(--ease-cine)}
.lnk:hover{background-size:0 1px;background-position:0 100%}
.lnk--mono{font:500 11px/1 var(--f-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--cyan);background:none}
@media (max-width:767px){.is--hero .btn{width:100%;height:52px;justify-content:space-between}}
```

**Regla de un azul (F15):** un `IntersectionObserver` sobre `[data-primary]` del contenido pone `data-primary-visible` en `<html>`. Con ese atributo, el CTA del encabezado usa `.btn--ghost` y la barra móvil se oculta. QA: nunca dos `.btn` azules visibles a la vez a 390 × 844 y 1440 × 900.

### 2.10 Cifras (contenido como token)

```ts
// src/lib/metrics.ts — ÚNICA fuente de cifras del sitio
export const METRICS = {
  'dental-citas':        { value: '3.2×',               label: 'más citas en 90 días',     ctx: 'Clínica dental · Monterrey',      href: '/casos/clinica-dental-monterrey/' },
  'dental-respuesta':    { value: '8 min → 12 s',       label: 'tiempo de respuesta',      ctx: 'Clínica dental · Monterrey',      href: '/casos/clinica-dental-monterrey/' },
  'ecom-cpl':            { value: '−58%',               label: 'costo por lead en 60 días', ctx: 'E-commerce · CDMX',              href: '/casos/ecommerce-cdmx-costo-por-lead/' },
  'retail-conversiones': { value: '+340%',              label: 'conversiones',             ctx: 'Retail multimarca · Kommo + IA',  href: '/casos/retail-multimarca-kommo/' },
  'horeca-roas':         { value: 'ROAS 4.8×',          label: 'sostenido',                ctx: 'HoReCa',                          href: '/casos/horeca-roas/' },
  'logistica-procesos':  { value: '27',                 label: 'procesos automatizados',   ctx: 'Logística · n8n',                 href: '/casos/logistica-n8n/' },
  'salud-citas-mes':     { value: '12 → 47',            label: 'citas al mes en promedio', ctx: 'Clientes del sector salud' },
  'tiempo-operativo':    { value: '−60%',               label: 'tiempo operativo',         ctx: 'Promedio, primeros 90 días' },
  'ecom-tablero':        { value: '1 vista · 7 fuentes', label: 'tablero unificado',       ctx: 'E-commerce' },
  'sistemas':            { value: '+73',                label: 'sistemas en producción',   ctx: 'Ingeniak' },
  'paises':              { value: '7',                  label: 'países',                   ctx: 'México (sede), Estados Unidos, Colombia, Argentina, España, Costa Rica y Ecuador' },
} as const;
export type MetricId = keyof typeof METRICS;
export const SOURCE_NOTE = 'Datos internos de Ingeniak, octubre de 2026';
export const PRICE_FROM = 'desde USD 997 al mes';
```

`<Metric id="dental-citas" variant="inline|chip|mega|row" />` es la única forma de imprimir una cifra comercial; escribe `data-metric="dental-citas"` en el nodo. Los conteos animados son solo visuales: **el valor final está en el HTML** (`<span data-from="12">47</span>`). Las cifras con signo (−58 %, +340 %) no se cuentan (se leen mal a medio conteo).

### 2.11 Tarjetas (sin "3 tarjetas iguales con ícono")

| Variante | Componente | Anatomía | Dónde |
|---|---|---|---|
| **Fotograma** | `Still` | Still 21:9 de la portada destino (640 px AVIF) con máscara inferior a `--ink`, etiqueta mono (`CASO · SALUD · MTY`), título `--fs-h4`, cifra en cian si existe. Filo de 1 px en degradado, radio 20, sin borde duro. Hover: imagen `scale 1.04 → 1`. Clic: corte por coincidencia (§7.6). En móvil, 4:5. | Relacionados, hub de casos, blog, fichas de mega menú |
| **Fila de guion** | `ScriptList` | `56px · 1fr · minmax(0,34ch) · 24px`: número mono, nombre `--fs-h3`, línea de resultado en muted, nodo-flecha. Filete superior `--hair`. Hover/focus: la fila activa brilla y las demás bajan a .35; en escritorio un fotograma 21:9 de 360 px sigue al cursor. | Servicios en el inicio, valores, "qué automatizamos", rescate del 404 |
| **Fila de índice** | `LocationSwitcher` (filas) | Nombre en Lexend 600 44 px, micro-promesa en Inter, cifra si existe; inactivas al 40 %, activa al 100 % con filete cian. | Industrias |
| **Fila de registro** | `ResultsLedger` | `<table>` semántica: Resultado (`--fs-h2` en Lexend 200) · Qué cambió · Sector y ciudad · Ventana · Servicio · →. En móvil cada fila es un bloque de 2 líneas. | `/casos/`, resultados de cada servicio |
| **Plana** | `Still variant="plana"` | Imagen que llena la pieza sin borde ni radio, máscara inferior, cifra o título en la penumbra, filete superior. | Hub de casos (destacado), blog en móvil |
| **Recuadro de nota** | `EditorNote` | Filete de 1 px `--hair-2` en 4 lados, sin fondo, etiqueta mono incrustada en el filete superior ("NOTA DEL EDITOR", "NOTA DE MÉTODO"). | Industrias sin caso propio, metodología, casos |
| **Ficha** | `EntitySheet` | `<dl>` con filetes, término en mono, valor en Inter. | Inicio (ESC 12), Nosotros, Guadalajara, casos |

### 2.12 Chips y sellos

| Pieza | Clase | Contenido | Regla |
|---|---|---|---|
| Chip de prueba | `.glass-chip.chip-proof` | `<Metric variant="chip">` + contexto mono | Anclado a un punto de la placa; nunca sobre cara ni torso |
| Pie de foto | `.glass-chip.caption` | `Fig. 01 · Kain —` + una oración + cifra | Ver `FigCaption` (§3.8) |
| Chip de ficha | `.chip-spec` | `SALUD · MONTERREY, N.L. · 90 DÍAS` | Mono 11 px, borde `--hair-2`, sin fondo, radio pill |
| Etiqueta SIMULACIÓN | `.chip-sim` | `SIMULACIÓN` | Mono 10 px, cian sobre `rgb(0 229 255 / .12)`; obligatoria en toda demo, con `data-nosnippet` en el contenedor |
| Etiqueta ilustrativa | `.chip-illus` | `IMAGEN ILUSTRATIVA DEL SECTOR` | Mono 10 px muted, esquina inferior derecha de portadas de caso e industria con personas |
| Sello Kommo Partner | `KommoBadge` | Versión oficial con texto blanco sobre transparente | Dentro de `.glass-chip`, enlazado a `https://www.kommo.com/`; no se recolorea ni se recorta; alto 28–36 px |
| Logotipo kain | `.kain-mark` | "kain" en Lexend 600 minúsculas + punto cian | Nunca en mayúsculas |
| Punto de estado | `.dot-live` | Nodo cuadrado de 4 px que late cada 6 s | Solo junto a "Kain" en el menú y en "responde 24/7" |

### 2.13 Iconografía

- **Sin emojis y sin íconos decorativos en tarjetas.** El "icono" de la marca es el **nodo cuadrado** (4–10 px) y la **rama** (línea con codos a 45°).
- Set propio `src/icons/sprite.svg` (16 iconos funcionales): menú, cerrar, buscar, flecha-rama, externo ↗, WhatsApp, play, pausa, chevron, check, más, calendario, teléfono, correo, ubicación, y 5 **glifos de etapa** (Atraer: rama que se abre · Atender: burbuja con nodo · Organizar: tres carriles · Automatizar: dos nodos unidos por rama · Medir: barras que convergen en un nodo).
- Retícula 24 × 24, trazo 1.5 px, `stroke-linecap:round`, `stroke-linejoin:round`, ángulos de 45° o 90°, `currentColor`. Tamaños 16 / 20 / 24.
- Logos de terceros: SVG en `currentColor` blanco al 55 % (100 % en hover), según `materiales/logos-software/LOGOS.md`. Kommo usa su sello oficial.

---

## 3. Sistema de secciones cinematográficas (`ImageSection`)

> Es el requisito obligatorio del cliente. **Toda portada y toda sección de texto + imagen** del sitio es un `ImageSection` o una escena construida sobre su mismo escenario registrado (`TwinScene`, `SystemRuntime`, `SharedTake`, `Dawn`). No existe otro componente de "imagen + texto". Está prohibido maquetar imagen y texto en dos columnas o dos bloques.

### 3.1 Qué es

Una `<section>` **sin fondo propio**. Dentro, una placa (imagen generada) dibujada a sangre en un **escenario registrado** (una caja "cover" calculada en CSS con unidades de contenedor, no `object-fit`), capas de luz que continúan la luz de la imagen, y el texto en HTML sobre la penumbra que **la propia imagen trae generada**. El sujeto (Kain o una persona) ocupa un tercio y mira, presenta o señala hacia el texto. Los cuatro bordes de la placa se disuelven en `--ink`, el mismo color del lienzo de la página, y la sección siguiente nace dentro de esa disolución.

```
z  capa                               qué es
─────────────────────────────────────────────────────────────────────────────────────────
 2  .is__layer--anchors  (registrada)  Fig. 01, chips de prueba, UI sobre cristal en blanco, rama tramo 1
 1  .is__copy  (.frame 12 col)         breadcrumb · eyebrow · H1/H2 · deck/lede · CTAs · microcopia   ← SIN caja
-3  .is__fx                            velo direccional del lado del texto + scrim superior + disolución inferior + halo del H1
-4  .is__layer--cutout (registrada)    recorte del sujeto con alfa (opcional, para GhostWord o parallax)
-5  .is__layer--ghost  (registrada)    palabra gigante aria-hidden (opcional, entre placa y recorte)
-6  .is__layer--media  (registrada)    <picture> de la placa + viñeta + fuga de luz + gradado (dentro del .stage)
    body::after (z 100)                grano global único, encima de todo
    body                               #03040B: el único fondo de la página
```

### 3.2 Variantes

| Prop | Valores | Efecto |
|---|---|---|
| `layout` | `subject-right` (por defecto) | Sujeto en el tercio derecho, texto en columnas 1–6 (el display del H1 del inicio puede llegar a la 7 si la zona segura lo permite). Velo desde la izquierda (`--side: 90deg`). |
| | `subject-left` | Espejo: sujeto a la izquierda, texto en columnas 7–12, velo desde la derecha (`--side: 270deg`). |
| | `subject-center` | Sujeto al centro; el texto va **sobre la banda inferior** de la misma imagen: H1 y lede en columnas 1–7 abajo a la izquierda, CTAs en columnas 9–12 abajo a la derecha (el texto flanquea al sujeto, patrón 1X). Velo desde abajo (`--side: 0deg`). Solo para `/kain/`, `/404` y planos de producto. |
| `height` | `hero` · `mid` · `cta` · `auto` | `max(100svh, 680px)` · `max(88svh, 600px)` · `max(90svh, 620px)` · contenido. Siempre `min-height`: si el contenido crece, la sección crece y la placa recorta más (el encuadre lo protege `--fy`). |
| `align` | `end` (portadas) · `center` (resto) · `start` (escenas con el texto arriba, p. ej. VKTOR) | Portada: texto anclado abajo, a 48 px del borde inferior, sobre el piso de la placa (la portada no lleva costura solapada: su último 10 % ya es la disolución). Resto: bloque centrado en el alto. |
| `tone` | `sol` (por defecto) · `dolor` | `dolor`: la placa ya trae luz ámbar; el CSS no la pinta. Eyebrow, nodos y lista en ámbar; las salidas en cian. |
| `mobile` | `top` (por defecto) · `below` | §3.6. |
| `priority` | `true` solo en la **primera** sección de la página | `fetchpriority="high"`, `loading="eager"` y precarga en `<head>`. El resto, `lazy`. |
| `take` | `true` | La placa la pinta `SharedTake` (sticky detrás de la sección siguiente con rack focus). |
| `cutout` | `true` | Activa las capas `ghost` y `cutout`. Requiere el recorte con alfa **de las mismas dimensiones** que la placa. |
| `push` | `{ anchor, to }` | Dolly con scrub hacia un ancla (`--cam` de 1 a `to`, máx. 1.6). |
| `mirror` | `true` | `scale: -1 1` en todas las capas registradas. Permitido porque ninguna placa tiene texto ni logos y Kain es simétrico. |
| `hud` | lista de `{pos, text}` | Solo en el inicio con horas (F13). |

### 3.3 Composición de escritorio (la imagen se genera así; el CSS solo remata)

Coordenadas en fracciones de la imagen (0 = izquierda/arriba, 1 = derecha/abajo), para `subject-right`; en `subject-left` se espejan en X.

| Zona | Dónde | Regla |
|---|---|---|
| **Penumbra de texto** | x 0–0.52, y 0–1 | Navy profundo (#0A1F4C) que cae a #03040B, niebla muy tenue, **sin objetos, luces, partículas ni detalle de alto contraste**. Aquí vive todo el texto. |
| **Sujeto** | centro en x 0.66–0.74 (Kain) o 0.64–0.78 (persona); cabeza en y 0.10–0.30; pies en y 0.80–0.90 con reflejo | Kain de cuerpo completo, de 3/4 hacia el texto. Pantalla del pecho **de frente y nítida**, lado ≥ 3 % del ancho (para la firma y las anclas). Persona en plano medio o americano, mirando hacia el texto o hacia su dispositivo de ese lado. |
| **Superficie de cristal en blanco** (si la escena lleva UI) | entre el sujeto y la penumbra, x 0.40–0.62 | Teléfono, placa o pantalla **plana, frontal, sin UI**, de al menos 6 % del ancho (teléfono) o 14 % (panel). Encima va la UI en HTML (§3.7). |
| **Piso** | línea continua en y ≈ 0.84 que cruza todo el ancho | Piso negro brillante o niebla baja. Ahí se apoyan los CTAs (línea base) y el pie de foto. |
| **Bordes** | 4 lados | Caen a #03040B en el último 6–8 % (la máscara CSS no corta nada visible). |
| **Luz** | una sola fuente | Contraluz cian #00E5FF / azul #0055FF desde atrás o abajo del sujeto; relleno índigo #455DFF suave **entrando desde el lado del texto** (así la luz "sale" del titular). Ámbar solo en escenas de dolor. |

**Proporciones (r1):** todas las placas en 16:9 (2752 × 1536), como `home-hero`. El escenario registrado hace "cover"; el tope de ultra ancho (§3.5) evita recortes de cabeza y pies. Para sobrevivir al recorte 4:3 (1024 × 768, iPad horizontal), el **cuerpo** del sujeto va entre x 0.12 y 0.88 (la caja `subject` puede incluir aire alrededor). Las coordenadas de esta tabla son metas de composición; las de cada placa están en `IMAGENES-v2.json` (`desktop.zones`).

### 3.4 Datos de cada placa: `src/data/plates.json`

Cada placa tiene su hoja de registro. Las coordenadas se miden **sobre el render final** con la página de desarrollo `/dev/registro/` (clic sobre la placa → copia el punto en fracciones). Las de abajo son las del hero aprobado medidas sobre `hero-home-desk-2x.jpg` y `hero-home-movil-d.png`; hay que confirmarlas a ±0.005.

```json
{
  "home-hero": {
    "alt": "Kain, el agente de IA de Ingeniak, presenta con la mano abierta el isotipo de cristal de la marca",
    "d": { "src": "/img/cine/home-hero", "w": 2752, "h": 1536, "ar": 1.7917, "fx": 0.72, "fy": 0.5, "fadeFrom": 0.9 },
    "m": { "src": "/img/cine/home-hero-m", "w": 1536, "h": 2752, "ar": 0.5581, "fx": 0.58, "fy": 1, "subjTop": 0.52 },
    "layout": "subject-right",
    "safe":    { "d": [[0.04, 0.06, 0.40, 0.40], [0.04, 0.40, 0.58, 0.97]], "m": [[0.04, 0.03, 0.96, 0.50]] },
    "subject": { "d": [0.66, 0.08, 0.92, 0.95], "m": [0.30, 0.52, 0.98, 0.96] },
    "anchors": {
      "pecho": { "d": [0.779, 0.465], "m": [0.700, 0.704] },
      "mano":  { "d": [0.644, 0.542], "m": [0.520, 0.760] },
      "fig":   { "d": [0.700, 0.800], "m": null },
      "piso":  { "d": [0.500, 0.900] }
    },
    "leak":  { "d": [0.86, 0.30] },
    "grade": 0
  }
}
```

- `fx/fy`: punto focal (misma semántica que `object-position`). `fadeFrom`: dónde empieza la disolución inferior. `subjTop` (móvil): dónde empieza la cabeza del sujeto en la placa vertical.
- `safe`: rectángulos donde puede vivir texto. `subject`: caja que **nada** puede tapar (salvo la línea guía del pie de foto). `anchors`: puntos con nombre (`pecho`, `mano`, `pantalla`, `telefono`, `tableta`, `rostro`, `escalon-1…5`, `fig`, `piso`). `null` en móvil = el elemento anclado baja al flujo del texto.
- `grade`: opacidad de la capa de gradado de seguridad (0 en placas ya aprobadas; .28 por defecto).
- Un script de build valida que cada placa usada por `D-sitemap.json` exista en `plates.json`, con `alt`, ambas versiones y anclas completas.

### 3.5 Receta HTML + CSS (base de escritorio)

```astro
---
// src/components/cine/ImageSection.astro (esqueleto)
import plates from '../../data/plates.json';
const { id, plate: key, layout, height = 'mid', align, tone = 'sol', mobile = 'top',
        priority = false, take = false, cutout = false, push, mirror = false, hud } = Astro.props;
const p = plates[key]; const L = layout ?? p.layout;
const vars = `--ar-d:${p.d.ar};--fx-d:${p.d.fx};--fy-d:${p.d.fy};--ar-m:${p.m.ar};--fx-m:${p.m.fx};--fy-m:${p.m.fy};`
  + `--fade-from:${p.d.fadeFrom ?? .82};--subj-top-m:${p.m.subjTop};--cx-d:${p.anchors.pecho?.d[0] ?? .5};--cy-d:${p.anchors.pecho?.d[1] ?? .5};`
  + `--cx-m:${p.anchors.pecho?.m?.[0] ?? .5};--cy-m:${p.anchors.pecho?.m?.[1] ?? .7};`
  + `--lx:${p.leak?.d[0] ?? .8};--ly:${p.leak?.d[1] ?? .35};--grade:${p.grade ?? .28}`;
const sizesD = `(max-aspect-ratio: ${p.d.ar}) ${Math.ceil(p.d.ar * 100)}svh, 100vw`;
---
<section id={id} class:list={['is', `is--${height}`]} data-layout={L} data-tone={tone} data-m={mobile}
  data-align={align ?? (height === 'hero' ? 'end' : 'center')} data-priority={priority || undefined} data-shot="scene" style={vars} aria-labelledby={`${id}-t`}>
  {!take && <div class="is__layer is__layer--media" data-mirror={mirror}><div class="stage">
    <picture>
      <source media="(max-width: 767px), (max-aspect-ratio: 5/6)" type="image/avif" srcset={/* 640, 828, 1080, 1536 */} sizes="100vw" />
      <source media="(max-width: 767px), (max-aspect-ratio: 5/6)" type="image/webp" srcset={/* … */} sizes="100vw" />
      <source type="image/avif" srcset={/* 1280, 1920, 2560, 3360 */} sizes={sizesD} />
      <img src={`${p.d.src}-1920.webp`} width={p.d.w} height={p.d.h} alt={p.alt} decoding="async"
           fetchpriority={priority ? 'high' : 'auto'} loading={priority ? 'eager' : 'lazy'} />
    </picture>
    <span class="is__vignette" aria-hidden="true"></span><span class="is__leak" aria-hidden="true"></span>
  </div></div>}
  {cutout && <div class="is__layer is__layer--ghost" aria-hidden="true"><div class="stage"><slot name="ghost" /></div></div>}
  {cutout && <div class="is__layer is__layer--cutout" aria-hidden="true"><div class="stage"><img src={`${p.d.src}-cut-1920.webp`} alt="" width={p.d.w} height={p.d.h} /></div></div>}
  <div class="is__fx" aria-hidden="true"></div>
  <div class="frame is__copy"><div class="is__text"><slot /></div><div class="is__aside"><slot name="aside" /></div></div>
  <div class="is__layer is__layer--anchors"><div class="stage"><slot name="anchors" /></div></div>
  {hud && <div class="is__hud" aria-hidden="true">{hud.map((h) => <p class={`t-label hud hud--${h.pos}`}>{h.text}</p>)}</div>}
</section>
```

```css
/* ── ImageSection · escritorio ─────────────────────────────────────────────── */
.is{--ar:var(--ar-d);--fx:var(--fx-d);--fy:var(--fy-d);--cx:var(--cx-d);--cy:var(--cy-d);--cam:1;--side:90deg;--halo-x:22%;
  position:relative;isolation:isolate;overflow:clip;min-height:var(--is-h,auto);
  padding:calc(var(--hdr) + var(--s-7)) 0 calc(var(--seam) + var(--s-5));display:grid}
.is--hero{--is-h:max(100svh,680px);padding-bottom:var(--s-7)}   /* portada: el texto baja hasta el piso; la placa ya termina en #03040B */
.is--mid{--is-h:max(88svh,600px)} .is--cta{--is-h:max(90svh,620px)}
.is[data-align="end"]{align-content:end} .is[data-align="center"]{align-content:center} .is[data-align="start"]{align-content:start}
.is[data-layout="subject-left"]{--side:270deg;--halo-x:78%}
.is[data-layout="subject-center"]{--side:0deg;--halo-x:30%}
.is + :where(section,div,footer){margin-top:calc(-1 * var(--seam));position:relative;z-index:1}  /* la siguiente nace en la disolución */
.is--hero + :where(section,div,footer){margin-top:0}               /* tras la portada, la costura es la disolución de la placa (fadeFrom) */

/* Escenario registrado: la caja "cover" se calcula en CSS → las anclas caen siempre en el mismo punto de la imagen */
.is__layer{position:absolute;inset:0;container-type:size;pointer-events:none}
.stage{--sw:max(100cqw, 100cqh * var(--ar));position:absolute;width:var(--sw);height:calc(var(--sw) / var(--ar));
  left:calc((100cqw - var(--sw)) * var(--fx));top:calc((100cqh - var(--sw) / var(--ar)) * var(--fy));
  transform-origin:calc(var(--cx) * 100%) calc(var(--cy) * 100%);container-type:size}
.is__layer--media{z-index:-6;--mask-y:linear-gradient(180deg,transparent 0,#000 7%,#000 calc(var(--fade-from) * 100%),transparent 100%);
  -webkit-mask-image:var(--mask-y);mask-image:var(--mask-y)}
.is__layer--media .stage{scale:var(--cam)}
.is__layer--ghost{z-index:-5} .is__layer--cutout{z-index:-4;-webkit-mask-image:var(--mask-y);mask-image:var(--mask-y)}
.is__layer--anchors{z-index:2}
.is__layer[data-mirror="true"] .stage{scale:-1 1}
.stage picture,.stage img{display:block;width:100%;height:100%}
.stage::after{content:"";position:absolute;inset:0;pointer-events:none;mix-blend-mode:color;opacity:var(--grade);   /* gradado de seguridad */
  background:linear-gradient(160deg,var(--navy),#02040E 70%)}
.is__vignette{position:absolute;inset:0;pointer-events:none;                                                      /* viñeta centrada en el sujeto */
  background:radial-gradient(110% 85% at calc(var(--cx) * 100%) calc(var(--cy) * 100%),transparent 48%,rgb(3 4 11 / .5) 100%)}
.is__leak{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:var(--leak,.9);                 /* fuga de luz del contraluz */
  background:radial-gradient(32% 42% at calc(var(--lx) * 100%) calc(var(--ly) * 100%),rgb(0 229 255 / .22),rgb(69 93 255 / .10) 50%,transparent 75%)}
.anchor{position:absolute;left:calc(var(--ax) * 100%);top:calc(var(--ay) * 100%);pointer-events:auto}

/* Velo del lado del texto (4 paradas) + scrim bajo el encabezado + disolución inferior + halo compartido detrás del H1 */
.is__fx{position:absolute;inset:0;z-index:-3;pointer-events:none;background:
  linear-gradient(var(--side),rgb(3 4 11 / .92) 0%,rgb(3 4 11 / .72) 26%,rgb(3 4 11 / .22) 46%,rgb(3 4 11 / 0) 60%),
  linear-gradient(180deg,rgb(3 4 11 / .55) 0,transparent 16%,transparent calc(var(--fade-from) * 100% - 8%),var(--ink) 100%),
  radial-gradient(40% 50% at var(--halo-x) 58%,rgb(0 229 255 / .07),transparent 70%)}
.is[data-layout="subject-center"] .is__fx{background:
  linear-gradient(0deg,rgb(3 4 11 / .94) 0%,rgb(3 4 11 / .72) 22%,rgb(3 4 11 / .2) 40%,rgb(3 4 11 / 0) 52%),
  linear-gradient(180deg,rgb(3 4 11 / .55) 0,transparent 16%),
  radial-gradient(70% 60% at 50% 45%,transparent 55%,rgb(3 4 11 / .55) 100%)}

/* Texto: nunca en caja; columnas según el lado del sujeto */
.is__copy{position:relative;z-index:1;align-self:inherit}
.is__text{grid-column:1 / span 6;display:flex;flex-direction:column;align-items:flex-start}
.is__text--wide{grid-column:1 / span 7}
.is__text--wide :is(.t-deck,.t-lede,.ctas,.btn-micro,.trust){max-width:71%}   /* solo la línea display usa las 7 columnas; el resto, 5 */
.is[data-layout="subject-left"] .is__text{grid-column:7 / span 6}
.is[data-layout="subject-center"] .is__text{grid-column:1 / span 7}
.is[data-layout="subject-center"] .is__aside{grid-column:9 / span 4;align-self:end;justify-self:end;text-align:right}
.is__text > .crumbs{margin-bottom:var(--s-5)} .is__text > .t-label--cyan{margin-bottom:var(--s-4)}
.is__text > :is(h1,h2){margin:0} .is__text > :is(.t-deck,.t-lede){margin-top:var(--s-5)}
.is__text > .ctas{margin-top:var(--s-7);display:flex;flex-wrap:wrap;gap:var(--s-4);align-items:center}
.is[data-tone="dolor"] .is__text > .t-label{color:var(--amber)}

/* Ultra ancho: la placa no pasa de ~2200 px ni recorta más de 8 % en vertical; los lados se funden */
@media (min-width:1800px){
  .is{--cap:min(2200px, 100svh * var(--ar) * 1.08)}
  .is__layer{inset:0 max(0px, (100% - var(--cap)) / 2)}
  .is__layer--media,.is__layer--cutout{
    -webkit-mask-image:var(--mask-y),linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);-webkit-mask-composite:source-in;
    mask-image:var(--mask-y),linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-composite:intersect}
}

/* HUD (action-safe) */
.hud{position:absolute;color:rgb(158 176 199 / .7)}
.hud--tr{top:calc(var(--hdr) + 32px);right:var(--action-x)} .hud--bl{bottom:28px;left:var(--action-x)} .hud--br{bottom:28px;right:var(--action-x)}
```

**Validación (hecha el 18 oct 2026):** el CSS de §2, §3 y §5.1 se extrajo tal cual de este documento y se probó con la placa aprobada (`hero-home-desk-2x.jpg` / `hero-home-movil-d.png`) en Chrome headless a 1280 × 720, 1366 × 768, 1440 × 900, 1536 × 864, 1920 × 1080, 2560 × 1080, 1024 × 1366 y 390 × 844. Resultado: la sección mide exactamente un viewport en escritorio; el CTA queda en el primer pantallazo en los 8 tamaños; el pie de foto no cruza texto; el ancla del pecho cae sobre la pantalla del pecho; a 2560 × 1080 la placa se limita y funde sus lados sin cortar pies ni antenas; la tablet vertical usa la placa vertical. La prueba destapó y corrigió tres errores que ya están aplicados aquí: faltaba `box-sizing: border-box` (la escena crecía su padding), `align-content` aplica también en bloque (el texto móvil se iba abajo) y la placa 9:16 en tablet vertical medía 1.3 pantallas (ahora se limita a un alto de pantalla). Archivos: `ESPEC-v2-prueba-imagesection.html`, `ESPEC-v2-prueba-1440.jpg`, `ESPEC-v2-prueba-390.jpg`.

### 3.6 Composición móvil (placa propia; nunca el recorte de la de escritorio)

Se activa **por proporción**, no solo por ancho: `@media (max-width:767px), (max-aspect-ratio:5/6)` (así la tablet vertical 1024 × 1366 también usa la placa vertical; lo probó FOLIO). El `<source media>` del `<picture>` usa exactamente la misma condición.

**Placa vertical (r1):** **4:5** (master 1536 × 1920, export 1080 × 1350) en **todas** las placas; la única 9:16 es `home-hero` (ya aprobada). Composición 4:5: **el 40 % superior es penumbra limpia** (navy → #03040B, sin objetos); cabeza del sujeto en y ≈ 0.44–0.46 y pies en y ≈ 0.86–0.87; el último 10–12 % es piso o niebla que cae a #03040B. Comprobado a 390 × 844: la placa mide 390 × 487 y deja ≈ 420 px de penumbra útil para eyebrow, H1 de 3 líneas, deck y CTA. **Presupuesto de texto móvil y modo `split`: §12.2 R3.**

| Modo | Cuándo | Cómo se ve |
|---|---|---|
| `top` (por defecto; obligatorio en portadas) | Portadas y secciones con poco texto | La placa se apoya en el **fondo** de la sección a su proporción natural. El texto corre **desde arriba** sobre la penumbra superior. Abajo se reserva la zona del sujeto (`alto de placa × (1 − subjTop)`), así **el texto nunca toca al sujeto, sea cual sea su largo**: si el texto es largo, la sección crece hacia arriba sobre `--ink` y la placa (que se funde arriba) sigue abajo. En la portada, el CTA queda en el primer pantallazo, por encima de la cabeza del sujeto. |
| `below` | Secciones con listas largas (dolores, FAQ con escena, "es para ti si…") | Se muestra solo la parte inferior de la placa (el sujeto), recortada a `1 − subjTop + 0.08` de su alto, arriba de la sección. El texto empieza 64 px **dentro** de la disolución inferior de la placa y continúa sobre `--ink`. |

```css
@media (max-width:767px), (max-aspect-ratio:5/6){
  .is{--ar:var(--ar-m);--fx:var(--fx-m);--fy:var(--fy-m);--cx:var(--cx-m,.5);--cy:var(--cy-m,.7);--seam:56px;
    --plate-w:min(100vw, 100svh * var(--ar-m));                             /* tablet vertical: la placa no pasa de un alto de pantalla */
    --plate-h:calc(var(--plate-w) / var(--ar-m));display:block;min-height:0;
    padding:calc(var(--hdr) + var(--s-5)) 0 calc(var(--plate-h) * (1 - var(--subj-top-m)) + var(--s-6))}
  .is,.is[data-align]{align-content:start}                                  /* el texto siempre arranca arriba */
  .is--hero{min-height:max(100svh, var(--plate-h))}
  .is__layer{inset:auto auto 0 calc((100% - var(--plate-w)) / 2);width:var(--plate-w);height:var(--plate-h)}  /* la placa vive abajo, a su proporción */
  .is__text--wide :is(.t-deck,.t-lede,.ctas,.btn-micro,.trust){max-width:none}
  .is__layer--media{--mask-y:linear-gradient(180deg,transparent 0,#000 14%,#000 88%,transparent 100%)}
  @media (min-width:600px){.is__layer--media{-webkit-mask-image:var(--mask-y),linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
    -webkit-mask-composite:source-in;mask-image:var(--mask-y),linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-composite:intersect}}
  .is__layer--media .stage::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;   /* scrim registrado sobre la penumbra */
    background:linear-gradient(180deg,rgb(3 4 11 / .7) 0,rgb(3 4 11 / .35) calc(var(--subj-top-m) * 100% - 8%),transparent calc(var(--subj-top-m) * 100%))}
  .is__fx{background:linear-gradient(180deg,rgb(3 4 11 / .55) 0,transparent 12%)}   /* solo bajo el encabezado */
  .is__text,.is[data-layout] .is__text,.is[data-layout="subject-center"] .is__aside{grid-column:1 / -1;text-align:left;justify-self:start}
  .anchor[data-m="none"],.leader[data-m="none"]{display:none}                /* su versión en línea aparece en el texto (r1: también la línea guía) */
  .anchor[style*="--ax-m"]{left:calc(var(--ax-m) * 100%);top:calc(var(--ay-m) * 100%)}   /* r1: anclas con coordenadas propias en la placa vertical */
  .is__hud .hud--bl,.is__hud .hud--br{display:none}
  .is[data-m="below"]{--crop:calc(1 - var(--subj-top-m) + .08);
    padding:calc(var(--plate-h) * var(--crop) - 64px) 0 calc(var(--seam) + var(--s-5))}
  .is[data-m="below"] .is__layer{inset:0 auto auto calc((100% - var(--plate-w)) / 2);height:calc(var(--plate-h) * var(--crop))}
  .is[data-m="below"] .is__layer--media{--mask-y:linear-gradient(180deg,transparent 0,#000 10%,#000 62%,transparent 100%)}
  .is[data-m="below"] .is__layer--media .stage::before{display:none}
}
.only-m{display:none}
@media (max-width:767px), (max-aspect-ratio:5/6){.only-m{display:revert}}
```

Prohibido en móvil: tarjeta o cristal encima del sujeto; imagen apilada arriba con un bloque de texto aparte con borde recto debajo; recortar la placa de escritorio.

### 3.7 UI registrada sobre la imagen (chat, tarjeta de lead, flujo, tablero, etiquetas)

- Va en el slot `anchors`. Cada elemento se coloca en fracciones de la imagen: `<div class="anchor" style="--ax:.52;--ay:.38">`. Para paneles con tamaño (la pantalla de un teléfono, un cristal en blanco) se usan `--ax/--ay/--aw/--ah` y el panel es contenedor de inline-size, así su contenido escala con la placa:

```css
.anchor--panel{width:calc(var(--aw) * 100%);height:calc(var(--ah) * 100%);container-type:inline-size;border-radius:var(--r-still)}
.anchor--panel .ui{font-size:clamp(11px,5.4cqi,14px)}
.anchor[data-lock]{/* se mueve con la placa en el parallax: misma transformación que la capa de medios */}
```

- **Regla de parallax:** todo lo anclado (UI, pie de foto, etiquetas de escalones, rama tramo 1) se mueve **con** la placa (`data-lock`). Nunca se le da un desplazamiento propio, porque se despegaría del objeto.
- Toda UI simulada lleva la barra `SIMULACIÓN` (`.chip-sim`) y su contenedor `data-nosnippet`. Nada de "en vivo" falso.
- En móvil, si la superficie mide menos de 180 px de ancho, la UI **no** va dentro de la placa: baja al flujo del texto como `.glass-panel` sobre la disolución, y la placa muestra solo la superficie encendida.
- Los videos (`kain-chat`) anclados a una pantalla: `muted playsinline preload="none"`, póster, se reproducen al 50 % de visibilidad, se pausan fuera de pantalla. Nunca `backdrop-filter` sobre ellos.

### 3.8 Costuras de luz entre sujeto y texto: `FigCaption` y `LightBranch`

**Pie de foto "Fig. 01"** (sustituye al chip suelto):

```html
<figure class="anchor caption glass-chip" style="--ax:.70;--ay:.80" data-lock data-m="none">
  <figcaption><span class="t-label t-label--cyan">Fig. 01 · Kain</span>
  El agente de IA de Ingeniak (render). En una clínica dental de Monterrey, la respuesta por WhatsApp pasó de
  <Metric id="dental-respuesta" variant="inline" />.</figcaption>   <!-- r1: nunca "Ejemplo ilustrativo" junto a una cifra real: se lee como dato inventado -->
</figure>
<svg class="leader" data-m="none" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
  <path d="M 700 800 L 644 542" pathLength="1" vector-effect="non-scaling-stroke" />   <!-- de la esquina superior derecha del pie (= ancla) a la mano, en coordenadas ×1000 -->
</svg>
<span class="anchor leader-node" data-m="none" style="--ax:.644;--ay:.542" aria-hidden="true"></span>
<!-- r1: sin data-m="none", la línea y el nodo se pintaban en móvil con las coordenadas de escritorio (sobre la cabeza de Kain). Ver §12.2 R4. -->
```

```css
.caption{width:min(300px,22vw);translate:-100% 0;font:400 13px/1.45 var(--f-body);color:var(--text-2)}  /* el ancla es su esquina superior derecha */
.leader{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.leader path{fill:none;stroke:var(--cyan);stroke-opacity:.8;stroke-width:1;stroke-dasharray:1;stroke-dashoffset:var(--draw,0)}  /* --draw 1 → 0 al entrar */
.leader-node{width:7px;height:7px;translate:-50% -50%;background:var(--cyan);box-shadow:var(--glow-cyan)}  /* nodo cuadrado = isotipo */
```

Reglas: el pie va en la zona de piso o niebla (`anchors.fig`, que marca su esquina superior derecha), entre la columna de texto y los pies del sujeto, y **nunca tapa cara ni torso**; su línea sube hasta el punto que señala (la mano). En el hero aprobado: ancla en (0.70, 0.80), sobre el piso reflectante, a la izquierda de los pies de Kain; probado a 1280 × 720, 1440 × 900 y 2560 × 1080 sin cruzar texto. En móvil (`fig: null`) el pie baja al texto como una línea `Fig. 01 · …` debajo de los CTAs.

**Rama de luz (F20):** une sujeto → pie de foto o UI → botón primario, con la geometría del isotipo.
- **Tramo 1** (sujeto → pie/UI): SVG registrado dentro del `stage` (viewBox 0–1000, `vector-effect: non-scaling-stroke`), así no hay que medir nada.
- **Tramo 2** (pie/UI → botón): lo dibuja JS después del layout (`ResizeObserver` sobre la sección), en una capa absoluta (sin CLS). Ruta: horizontal → diagonal a 45° → horizontal, entrando por la derecha del botón. Antes de dibujarla se intersecta con las cajas del H1, el deck y el lede; **si cruzaría texto, el tramo 2 no se dibuja.**
- Se dibuja **una vez** al entrar (1.1 s, `--ease-cut`) y, al llegar, el botón hace un recorrido de luz (`.is-traced`). Con movimiento reducido se muestra completa y estática, sin recorrido.

```js
function branchPath(a, b, lead = 40) {            // a: borde del pie del lado del texto · b: borde derecho del botón
  const dy = Math.abs(b.y - a.y);
  const x1 = Math.min(a.x, b.x + lead + dy);       // la diagonal sale a 45° si cabe
  return `M${a.x},${a.y} H${x1} L${b.x + lead},${b.y} H${b.x}`;
}
```

### 3.9 Recetario de fusión imagen ↔ sección (valores fijos)

| Técnica | Dónde | Valor |
|---|---|---|
| Máscara de bordes | `.is__layer--media` | Arriba 0 → 7 %; abajo desde `fadeFrom` (0.82 por defecto) hasta 100 %; laterales 10 % solo ≥ 1800 px |
| Velo direccional | `.is__fx` | `.92 → .72 (26 %) → .22 (46 %) → 0 (60 %)` desde el lado del texto, color `--ink` |
| Scrim superior | `.is__fx` | `.55 → 0` en el 16 % superior (lectura del encabezado) |
| Disolución inferior | `.is__fx` + máscara | Termina en `#03040B` exacto en el último píxel |
| Viñeta | `.is__vignette` (registrada) | Radial 110 % × 85 % centrada en el pecho/rostro, `transparent 48% → .5` |
| Fuga de luz | `.is__leak` (registrada) | Radial 32 % × 42 % en `leak`, cian .22 → índigo .10, `screen` |
| Halo compartido | `.is__fx` | Radial cian .07 detrás del H1, rima con el contraluz del sujeto |
| Gradado | `.stage::after` | `mix-blend-mode: color`, `--grade` (.28; 0 en placas aprobadas) |
| Grano | `body::after` | Uno solo para imagen y UI, `overlay` .06 |
| Cristal sobre imagen | Solo anclado (§2.8) | Pie de foto, chips, UI registrada, sello Kommo. **Nunca detrás del texto.** |
| Parallax | §7.5 | Placa +6 % · recorte −3 % (solo con placa limpia) · texto −60 px con fundido a .2 · anclados con la placa |
| Costura | `.is + *` | La siguiente sección sube `--seam` (`clamp(80px, 12vh, 160px)`; 56 px en móvil) y nace dentro de la disolución |
| Horizonte | `Dawn` | Arco CSS con filo cian como costura de cierre (B-D2) |

### 3.10 Zonas seguras y contraste

1. Todo nodo de texto de un `ImageSection` debe quedar **dentro de la unión de `safe`** y **fuera de `subject`** (cajas de `plates.json` proyectadas a pantalla con la misma fórmula del `stage`), a 1280 × 720, 1440 × 900, 1920 × 1080 y 2560 × 1080; y en móvil a 390 × 844 y 1024 × 1366. Lo verifica `scripts/check-escenas.mjs` (§10).
2. Contraste AA contra el píxel más claro bajo cada línea (§2.1.1). Si falla: primero se mueve el punto focal (`fx/fy`), después se refuerza el velo de esa placa (`--veil` por placa, máx. .96), y **nunca** se pone una caja detrás.
3. `--muted` solo donde el fondo compuesto tenga L ≤ 0.054; si no, el lede usa `--text-2`.
4. Texto nunca sobre zonas brillantes de la imagen (haz, contraluz, pantalla encendida) sin velo.
5. Las anclas caen sobre su objetivo con ±8 px en todos los tamaños de QA (capa de depuración `?anchors=1`).

### 3.11 Cómo se evita el "dos secciones separadas" (reglas de aceptación)

1. **Ninguna sección tiene fondo.** Solo `body` pinta `#03040B`. Lint: `background` prohibido en selectores de sección.
2. **Sin caja detrás del texto**: ni cristal, ni tarjeta, ni borde, ni radio alrededor del bloque de copy.
3. **La placa no tiene borde ni radio** y no toca ningún borde recto visible: a 375, 768, 1024, 1440, 1920 y 2560 px no se ve ninguna arista de imagen.
4. **La penumbra se genera en la imagen**; el velo CSS remata, no rescata (si el velo necesita más de .96, la placa se regenera).
5. **Misma luz en imagen y texto**: el contraluz del sujeto se derrama hacia el titular (fuga + halo), y el `.lit` usa los mismos colores de esa luz.
6. **Costura solapada**: el último píxel de la escena es `#03040B` y la siguiente sección empieza dentro de la disolución.
7. **El sujeto mira, presenta o señala hacia el texto**, y el pie de foto o la rama de luz cosen sujeto y copy.
8. **Geometría compartida**: la línea base de los CTAs se apoya en el piso de la placa; en escenas intermedias el bloque de texto se centra a la altura del pecho o rostro del sujeto (±10 % del alto).
9. **Un grano y un gradado** para todas las imágenes y la UI.
10. **Movimiento de una sola pieza**: parallax diferencial (placa lenta, sujeto medio, texto rápido) dentro de la misma sección; nunca "entra una foto" como bloque.
11. **Móvil con placa propia**: texto arriba, sujeto abajo, cero tarjetas sobre el sujeto.
12. Prohibido: imagen en una columna y texto en otra; "centrado + subtítulo gris + 2 botones sobre degradado"; foto rectangular de una persona; cristal sobre negro plano.

### 3.12 Escenas derivadas (mismo escenario registrado)

| Escena | Componente | Diferencia con `ImageSection` |
|---|---|---|
| Planos gemelos | `TwinScene` | Dos placas del **mismo encuadre** (A ámbar / B cian) dentro del mismo `stage`; B se revela con `clip-path: inset(0 0 0 var(--wipe))` detrás de un haz vertical. Fijada solo en escritorio. |
| Toma compartida | `SharedTake` | La placa de la portada queda `position: sticky` detrás de la sección siguiente y cambia a una copia desenfocada horneada (320 px, blur 40) con `--rack` 0 → 1. Sin `filter` en vivo. |
| Runtime | `SystemRuntime` | 5 placas de estación en un solo `stage` que cambian con barrido de luz; la UI registrada de cada estación recibe la tarjeta de lead (Flip). |
| Amanecer | `Dawn` | `ImageSection` de cierre + arco de horizonte CSS + haz vertical + recorrido de luz del botón. |
| Intertítulo | `Intertitle` | Sin sujeto: aura de isotipo de cristal desenfocado (WebP de 600 px ya borroso) o de ondas sedosas, palabra fantasma que sangra por el borde. No es un `ImageSection`, pero tampoco tiene fondo propio. |

---

## 4. Navegación

Fuente de datos: `src/data/navegacion.json` (copia de `D-navegacion.json` con los cambios de esta sección). **Todos los enlaces están en el HTML estático**; el JS solo abre y cierra paneles.

### 4.1 Encabezado (`Header`)

| Rango | Contenido |
|---|---|
| ≥ 1180 px | Logo (isotipo + "ingeniak") · **Servicios ▾ · Industrias ▾ · Casos ▾ · Kain · Empresa ▾ · Recursos ▾** · botón Buscar (`⌘K`) · WhatsApp circular (`aria-label="Escríbele a Kain por WhatsApp"`) · `.btn--sm` "Agenda tu Discovery Session" |
| 768–1179 px (compacto) | Logo · Buscar · WhatsApp · `.btn--sm` · botón "Menú" (abre la hoja de §4.5) |
| < 768 px | Logo · Buscar · "Menú" (texto + icono, nunca hamburguesa sola). El CTA vive en la barra inferior (§4.6). |

- Alto 72 px (60 px en < 768). `padding-inline: var(--action-x)`. Enlace "Saltar al contenido" como primer elemento enfocable.
- **Kain** lleva un nodo cian de 4 px que late cada 6 s (`.dot-live`).
- Un **pill indicador** se desliza entre las entradas de primer nivel (GSAP Flip).
- **Estados:** transparente sobre la portada. Pasado el 80 % de la portada, se oculta al bajar más de 120 px y vuelve al subir como cristal: `background: rgb(3 4 11 / .62); backdrop-filter: blur(16px) saturate(140%); border-bottom: 1px solid rgb(0 229 255 / .12)`.
- **Modo sala:** durante una secuencia fijada el encabezado se oculta y no vuelve con subidas de menos de 120 px.
- **Regla de un azul (F15):** el CTA del encabezado es `.btn--ghost` mientras haya un `[data-primary]` visible en el contenido; si no, es azul.
- `view-transition-name: hdr` (no parpadea entre páginas).
- En `/discovery/`: solo logo + "Agendar mi Discovery Session" (directo a la agenda). Sin mega menú, sin buscador, sin riel.

### 4.2 Mega menú "Sala de proyección" (`MegaMenu`)

```
┌ Servicios ▾ ───────────────────────────────────────────────────────────────────────────────┐
│ ▪────────▪────────▪────────▪────────▪   línea del sistema (5 nodos; hover enciende su columna) │
│ ATRAER       ATENDER       ORGANIZAR      AUTOMATIZAR     MEDIR        │ ┌ pantalla 21:9 ─┐ │
│ Paid media   Agentes IA WA CRM con IA     Automatización  Consultoría  │ │ still destino  │ │
│ Páginas web  Conoce a Kain Kommo ▣        Software a la   Tablero      │ └────────────────┘ │
│ SEO e IA     app.kain.mx ↗ GoHighLevel    medida          unificado    │ línea de resultado │
│ Branding                                                               │                    │
│ Todos los servicios · Metodología VKTOR™ · Tecnologías            Planes desde USD 997 al mes   │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Panel:** ancho completo bajo el encabezado, `max-height: min(520px, 80svh)`, `.glass-panel` con filo cian superior. Enlaces en columnas 1–9; **pantalla de previsualización** en 10–12: el still 21:9 de la portada destino del enlace bajo el puntero o el foco (fundido de 0.3 s), con su etiqueta mono y su línea de resultado. Stills de 640 px AVIF (≤ 35 KB) que se cargan la primera vez que se abre el panel (`data-src → src`).
- **Interacción:** hover con intención (100 ms para abrir, 200 ms de gracia para cerrar), clic o Enter. Flechas para moverse, Tab entre columnas, Esc cierra y devuelve el foco. `aria-expanded` y `aria-controls` en cada disparador; el panel es una región con listas de `<a>`. Entrada 220 ms (opacidad e `y: -8 → 0`, stagger 20 ms).
- **Clic en la pantalla de previsualización** = corte por coincidencia: el still se convierte en la portada de la página destino (§7.6).
- **Iconos:** solo los 5 glifos de etapa en las cabeceras de columna, el sello Kommo y la flecha ↗ de enlaces externos. Cada enlace lleva un nodo de 6 px, nombre (Inter 500, 15 px), una línea de resultado (Inter 400, 13 px, muted) y la cifra solo si está confirmada (`<Metric variant="inline">`).

| Panel | Contenido (nombre · línea de resultado · cifra) | Pantalla por defecto |
|---|---|---|
| **Servicios** (por las 5 etapas; las URLs de D no cambian) | **Atraer:** Paid media · Meta, Google y TikTok medidos por ventas — Páginas web de alta conversión · Conectadas a tu CRM y WhatsApp — SEO y visibilidad en IA · Que te encuentre Google y te cite ChatGPT — Branding y contenido · Identidad que te posiciona como premium. **Atender:** Agentes de IA para WhatsApp · Responden, califican y agendan 24/7 · `dental-respuesta` — Conoce a Kain (`/kain/`) · El agente de IA de tu empresa — app.kain.mx ↗ · La plataforma de tus agentes. **Organizar:** CRM con IA · Kommo o GoHighLevel, implementado para vender — Partner oficial de Kommo ▣ · Licencias, implementación y agentes · `retail-conversiones` — GoHighLevel en español · CRM, embudos y calendarios en una plataforma. **Automatizar:** Automatización con n8n · Tus sistemas conectados, sin capturas a mano · `logistica-procesos` — Software a la medida · Cuando ninguna herramienta encaja. **Medir:** Consultoría en IA · Diagnóstico, roadmap y retorno medible — Tablero unificado (`/servicios/desarrollo-software/#dashboard`) · `ecom-tablero`. Pie: Todos los servicios · Metodología VKTOR™ · Tecnologías · `PRICE_FROM` | `menu-kain` ("Conoce a Kain") |
| **Industrias** | Salud y clínicas · Citas agendadas y confirmadas 24/7 · `dental-citas` — Belleza y estética · Agenda llena sin vivir en el WhatsApp — Nutrición · Pacientes que agendan y regresan — Finanzas · Prospectos calificados antes de llamar — Inmobiliario · Cada lead atendido en segundos — Industrial y logística · Operación que se mueve sola · `logistica-procesos` — Retail y e-commerce · Ventas por chat, medidas · `retail-conversiones` — HoReCa · Reservas medidas por campaña · `horeca-roas`. Pie: Todas las industrias · "También trabajamos con e-commerce, retail, HoReCa y logística → Ver casos" | Portada del sector activo |
| **Casos** | Clínica dental en Monterrey · `dental-citas` — Retail multimarca · `retail-conversiones` — E-commerce en CDMX · `ecom-cpl` — HoReCa · `horeca-roas` — Logística · `logistica-procesos`. Pie: Todos los casos · Registro de resultados | Portada del caso activo |
| **Kain** | Enlace directo a `/kain/` (sin panel) | — |
| **Empresa** | Nosotros · El equipo, la ficha y los valores — Metodología VKTOR™ · Las 5 fases de cada proyecto — Tecnologías · El stack con el que construimos — Agentes de IA en Guadalajara · Oficina en Tlajomulco de Zúñiga — Contacto · WhatsApp, correo y oficina | Escena del equipo + "Guadalajara, Jalisco · Av. Punto Sur 312, Tlajomulco de Zúñiga" |
| **Recursos** | Blog · Guías sin humo para decidir mejor — ¿Cuánto cuesta un agente de IA? — Kommo vs GoHighLevel — Agente de IA vs chatbot — Preguntas frecuentes · Respuestas directas — Busca o pregúntale a Kain `⌘K` | Portada del artículo más reciente |

### 4.3 Buscador ⌘K "Busca o pregúntale a Kain" (`SearchDialog`)

- Se abre con ⌘K / Ctrl+K o con el botón Buscar. (r1: se quita el atajo "/" de una sola tecla: incumple WCAG 2.1.4 si no se puede desactivar, y choca con lectores de pantalla.) `<dialog>` modal `.glass-panel` de 640 px, foco atrapado, Esc cierra. En móvil es hoja a pantalla completa.
- **Índice estático** `/indice.json` (~40 KB) generado en el build desde `sitemap.json` (title, H1, keyword, URL, grupo, folio interno) + el banco de FAQ con su respuesta corta. Se descarga solo al primer uso. Buscador propio (~1 KB, prefijo y palabras, sin acentos), sin dependencias.
- **Grupos de resultados:** Páginas · Servicios · Casos · Preguntas (la respuesta corta aparece ahí mismo, con enlace a su página) · **Acciones:** "Agenda tu Discovery Session" y "Pregúntale a Kain por WhatsApp: «…»" (arma `https://wa.me/523321017799?text=` con "Hola Kain, " + lo que escribió la persona; solo al hacer clic).
- Teclado: ↑↓ moverse, Enter abrir, Tab cambiar de grupo; pie con atajos en `<kbd>`. Vacío: sugerencias ("¿Cuánto cuesta un agente de IA?", "Kommo vs GoHighLevel", "Casos de salud").
- Los folios no se muestran como números; el número de caso sí funciona como búsqueda ("301" → caso dental).

### 4.4 Breadcrumbs (`Breadcrumbs`)

- Forma y jerarquía de D §7 (incluidas las excepciones de `/kommo/` y `/gohighlevel/`). **Línea mono dentro de la columna de texto de la portada**, encima del eyebrow/H1; nunca una barra aparte.
- JetBrains Mono 11 px, mayúsculas, muted; separador = nodo cuadrado cian de 4 px; el último elemento es texto plano (`aria-current="page"`). Nombres cortos (los del menú).
- Emite `BreadcrumbList` en el `@graph` con el mismo arreglo. No se muestra en `/` ni en `/404`.

### 4.5 Menú móvil y compacto (`MobileMenu`)

- Hoja a pantalla completa `.glass-panel` sobre la escena actual (que se ve desenfocada detrás). `role="dialog"`, `aria-modal="true"`, foco atrapado, Esc cierra, Lenis en pausa mientras está abierta.
- Orden: buscador (abre ⌘K en la misma hoja) → acordeones **Servicios (por las 5 etapas) · Industrias · Casos · Empresa · Recursos** (cada enlace con su línea de resultado, sin imágenes) → enlace directo **Kain** → fijos al pie: `.btn` "Agenda tu Discovery Session" + `.btn--ghost` WhatsApp.
- Entrada: hoja `y: 4% → 0` y opacidad en 0.35 s (`--ease-cine`); los grupos con stagger de 0.04 s.

### 4.6 CTA persistente

- **Barra inferior móvil (`MobileCTABar`):** desde el segundo viewport. `[Agenda tu Discovery]` azul (2/3 del ancho) + `[WhatsApp]` cristal (1/3). Alto 56 px + `env(safe-area-inset-bottom)`. Se oculta: mientras un `[data-primary]` del contenido está visible (F15), cuando el cierre `Dawn` está en pantalla, con el menú abierto y en `/discovery/`.
- **Escritorio:** el CTA del encabezado (regla de un azul) + la **píldora "Escríbele a Kain" (`KainPill`)** abajo a la derecha (avatar de Kain de 24 px, texto y nodo cian "responde 24/7"), desde el segundo viewport y **solo mientras el encabezado está oculto**. Se oculta en secuencias fijadas y cuando el cierre está visible. Abre el `secondaryCta.href` de la página. Nunca es azul.

### 4.7 Riel de escenas (`SceneRail`)

- `<nav class="rail" aria-label="Secciones de esta página">` fijo en el borde derecho, solo ≥ 1280 px. Un tick de 14 × 1 px por sección con `id`; el activo es cian, de 26 px y con brillo; la etiqueta (`03 — El problema`) aparece con hover o foco.
- Inicio: ticks agrupados en 3 actos separados por 8 px. **Casos:** etiquetas siempre visibles; funciona como Quick Jump (Contexto · Reto · Solución · Resultado · VKTOR · Replicar).
- Sincronización: `ScrollTrigger.create({ trigger, start: 'top center', end: 'bottom center', onToggle })`.

### 4.8 Footer "Créditos finales" (`Footer`)

Encima siempre va el cierre `Dawn`. Tipografía de créditos: título de grupo en mono 11 px, enlaces en Inter 15 px.

1. **Mapa del sitio** (5 columnas, todas las páginas indexables de D §6): **Servicios** (12) · **Industrias** (9) · **Casos** (6) · **Empresa** (Nosotros, Metodología VKTOR™, Tecnologías, Kain, app.kain.mx ↗, Agentes de IA en Guadalajara, Contacto) · **Recursos** (Blog, 6 artículos, Preguntas frecuentes, Discovery Session).
2. **Ficha de la entidad** (`EntitySheet variant="footer"`, mismos datos que el JSON-LD y `llms.txt`): Ingeniak · Ingeniak Technology, LLC (r1: **solo si el cliente confirma la razón social por escrito**; D §15 registra "Radik Soluciones" en el sitio actual; hasta entonces no se imprime ni va en `legalName`) · Guadalajara, Jalisco, México · Av. Punto Sur 312, Tlajomulco de Zúñiga, Jalisco 45640 · contacto@ingeniak.mx · WhatsApp +52 33 2101 7799 · `KommoBadge` · `<Metric id="sistemas">` · `<Metric id="paises">`.
3. **Redes:** instagram.com/ingeniakmx · facebook.com/ingeniakmx · linkedin.com/company/ingeniakmx (URLs reales, nunca genéricas).
4. **Legal y firma:** © 2026 Ingeniak · Aviso de privacidad · "Construimos empresarios libres, no héroes cansados." (pendiente de confirmar) · **reprise de la firma**: al llegar al final, el nodo late y el isotipo se dibuja una vez en cian.
5. (P2) "Resume Ingeniak con IA": enlaces a ChatGPT, Claude, Perplexity y Google AI Mode con un prompt fijo que cita ingeniak.mx como fuente.

---

## 5. Plantillas de página

Formato de las tablas: **#** · id de sección en `D-sitemap.json` · componente(s) · contenido · placa · movimiento · intensidad (1 respiro · 2 escena · 3 set piece). Los textos fijos (H1, title, keyword, mensajes de WhatsApp, FAQ) salen de `D-sitemap.json`. Regla de ritmo: después de un 3 viene un 1 o un 2 (excepción: firma → portada). Máximo 2 secuencias fijadas por página, solo en escritorio. Ninguna zona de más de 40vh sin luz.

### 5.1 Inicio `/` (T-HOME)

| # | id | Componentes | Contenido | Placa | Movimiento | Int. |
|---|---|---|---|---|---|---|
| 00 | — | `ColdOpen` | Firma "Del nodo al pecho" (§7.3) | `home-hero` | 2.8 s, una vez por sesión | 3 |
| 01 | `hero` | `ImageSection` (hero, subject-right, priority) + `SumarioCover` + `FigCaption` + `LightBranch` + `Hud` | Eyebrow `AGENCIA DE IA · GUADALAJARA, MX`. `<h1><span class="t-display">Agentizamos <span class="lit">empresas.</span></span> <span class="t-deck">Agentes de IA, CRM y automatización en un solo sistema.</span></h1>` anclado abajo a la izquierda (columnas 1–7, bajo los brazos del isotipo de cristal). **Sin lede en la portada** (el *deck* ya es la segunda voz; el subtítulo de D pasa a la escena 04). CTAs + microcopia. Línea de confianza mono (`<p class="t-label trust">`): `PARTNER OFICIAL DE KOMMO EN LATAM · +73 SISTEMAS EN PRODUCCIÓN · 7 PAÍSES`. **Sumario** arriba a la izquierda (columnas 1–5, `top: hdr + 32px`): `dental-citas` → caso, `ecom-cpl` → caso, `retail-conversiones` → caso, con llamada `.fn` y nota "Datos internos de Ingeniak, octubre de 2026". Visible solo con `min-height: 880px` en escritorio; si no, pasa a 02. **Fig. 01** anclado a la mano (§3.8). HUD: `01 / 13 — EL AGENTE` · `23:47 · GDL · MX` · `SCROLL ↓` | `home-hero` (aprobada) | Firma → líneas del H1 → CTAs → rama → pie de foto. Reposo: `--cam` 1 → 1.015 (8 s, yoyo). Salida: parallax §7.5; el sumario sale primero (`end: '30% top'`) | 3 |
| 02 | `stack` | `LogoCredits` (+ `SumarioCover variant="row"`) | Nace dentro de la costura de 01. `CON QUÉ CONSTRUIMOS` + `KommoBadge` + logos en blanco al 55 %: WhatsApp Business · GoHighLevel · n8n · Make · OpenAI · Claude · Gemini · Meta · Google Ads · TikTok · Supabase · Stripe (GoHighLevel como herramienta, nunca partner). Con `max-height: 879px` o en móvil, aquí aparece el sumario en fila | — | Créditos uno por uno (stagger .06). **Sin marquesina** | 1 |
| 03 | `problema` | `TwinScene` (subject-left, tono dolor → sol) + `PainList` + `SkipScene` | Eyebrow ámbar `23:48 · EL PROBLEMA`. H2: "Tu negocio no necesita más esfuerzo. <span class="soft">Necesita dejar de depender de ti.</span>" 4 dolores (ámbar, nodo ámbar): Mensajes sin responder · Un CRM que nadie usa · Anuncios que no se traducen en ventas · Todo pasa por ti. Salidas (cian): "Kain responde en segundos, a cualquier hora." · "Cada conversación entra sola a tu CRM." · "Cada campaña se mide hasta la venta." · "El sistema opera. Tú diriges." Remate en Lexend 300: "No te falta esfuerzo. Te falta un sistema." HUD: `23:48` → `23:52` → `RESPONDIDO` | `home-problema-a` / `-b` | **Fijada +100 % (escritorio):** 0–40 % dolores sobre A; 40–75 % barrido de luz de derecha a izquierda revela B y cada dolor dibuja su salida; 75–100 % remate. Móvil: sin pin (§5.1.1) | 3 |
| 04 | `que-es` | `Intertitle` + `DefinitionBlock` + `MetricRow` + `GhostWord` | Manifiesto: "No hacemos marketing. <span class="soft">Construimos sistemas que generan y convierten clientes automáticamente.</span>" Lede (subtítulo de D): "Diseñamos e implementamos agentes de IA, CRM y automatizaciones conectados en un solo sistema que atiende, califica y cierra por ti, 24/7." Definición citable G01 (40–60 palabras). Fila "Ingeniak en datos": `sistemas` · `paises` · `salud-citas-mes` · `ecom-cpl` + `SOURCE_NOTE`. Palabra fantasma `SISTEMA` que sangra por la derecha. HUD `00:00` | Aura del isotipo de cristal (WebP 600 px ya desenfocado) | Manifiesto palabra por palabra (opacidad .15 → 1, scrub). Aura gira 0 → 8° | 1 |
| 05 | `sistema` | `SystemRuntime` + `LeadCard` + `SkipScene` | H2: "Creamos el tráfico, <span class="soft">lo convertimos y lo operamos automáticamente.</span>" 5 estaciones (cada una con H3, una línea, enlace a su servicio y su cifra con fuente): **Atraer** (anuncios, web y SEO que traen demanda medible · `ecom-cpl`) · **Atender** (Kain responde en segundos, 24/7, en WhatsApp, Instagram y tu web · `dental-respuesta`) · **Organizar** (cada lead en su etapa, en Kommo o GoHighLevel · `retail-conversiones`) · **Automatizar** (n8n y Make mueven lo repetitivo · `logistica-procesos` + `tiempo-operativo`) · **Medir** (todo en una vista · `ecom-tablero`, 7 nodos de fuente sin nombre). Etiqueta `Fig. 02 — Un lead recorriendo el sistema` y nota visible: "Simulación de un lead. Las cifras vienen de casos reales distintos; cada una indica su fuente." | `home-sistema-1…5` (21:9, Kain en cada una con superficie de cristal en blanco) | **Fijada +280 % (escritorio)**, snap a 5 estados; cambio de estación = barrido de luz (0.8 s) + Flip de la tarjeta de lead; riel de progreso con scrub. Móvil: 5 escenas apiladas | 3 |
| 06 | `kain` | `ImageSection` (mid, subject-left, `push`) + `ChatSim` registrado en el teléfono | H2 en primera persona: "Soy Kain, el agente de IA de tu empresa." + "Respondo, agendo y confirmo por ti en WhatsApp, Instagram y tu web, y registro cada conversación en tu CRM." + 4 viñetas con barra luminosa + eslogan "Tu negocio trabajando, sin depender más de ti." + `.btn--ghost` "Escríbele a Kain" + enlaces `/kain/` y `app.kain.mx ↗` (logotipo **kain**). Pestañas de sector bajo el copy: Salud · Belleza · Inmobiliario · Retail; botón de pausa; `SIMULACIÓN`. HUD `02:14 · KAIN ATIENDE` | `home-kain` | Push-in `--cam` 1 → 1.12 hacia `telefono` con scrub; el guion avanza al estar en pantalla | 2 |
| 07 | `servicios` | `ScriptList` (por 5 etapas) | 11 servicios en 5 actos (Atraer · Atender · Organizar · Automatizar · Medir): número mono, nombre, línea de resultado de D, nodo. Fotograma 21:9 que sigue al cursor (escritorio). Línea final: "Planes `PRICE_FROM`. El alcance lo definimos en tu Discovery Session." + "Ver todos los servicios →" | Stills de las portadas | Filas por stagger; corte por coincidencia al clic | 1 |
| 08 | `casos` | `Montage` | H2: "Sistemas reales, <span class="soft">operando hoy mismo.</span>" 5 filas alternadas: `dental-citas` · `retail-conversiones` · `ecom-cpl` · `horeca-roas` · `logistica-procesos`, cada una con contexto mono y enlace a su caso. Línea transversal: `salud-citas-mes` · `tiempo-operativo` · `dental-respuesta`. Nota de fuente + "Nombres de clientes anonimizados." + "Ver todos los casos →" + "Registro de resultados →" (`/casos/#registro`) | Portadas de caso dentro de las letras | Deriva horizontal ±6 % con scrub (sin pin) y la imagen se desplaza dentro de las letras | 2 |
| 09 | `vktor` | `ImageSection` (mid, subject-right, `align="start"`, `cutout`) + `GhostWord` "VKTOR" + 5 etiquetas ancladas | Texto arriba a la izquierda: "Tu crecimiento tiene un protocolo. <span class="soft">Nosotros lo activamos.</span>" + "La Discovery Session es la fase V." + "Conoce el protocolo completo →". Etiquetas en los escalones: `V · Verificamos tu operación` · `K · Diseñamos el concepto` · `T · Transformamos` · `O · Operamos junto con tu equipo` · `R · Hacemos crecer los resultados`. HUD `04:30 · VKTOR™` | `metodologia-hero` + recorte | Sin pin: cada escalón se enciende en secuencia con scrub, la letra de la cabecera pasa de contorno a relleno; la cabecera se desplaza `xPercent −6`; la luz llega a Kain al final | 2 |
| 10 | `industrias` | `LocationSwitcher` | H2: "Mismo sistema, <span class="soft">tu industria.</span>" 8 filas (columnas 1–5) con micro-promesa y cifra solo donde existe. Fondo a sangre = portada del sector activo (espejada si su sujeto está a la izquierda). Chip `SIMULACIÓN` con 2 burbujas del guion del sector. Pie: "También trabajamos con e-commerce, retail, HoReCa y logística → Ver casos". HUD `05:00 · LOCACIÓN 1/8` | `ind-*-hero` (1920 px) | Hover/foco/↑↓ cambian la placa (fundido .6 s + `scale 1.04 → 1`); autoavance cada 4 s en pantalla, con pausa | 2 |
| 11 | `equipo` | `ImageSection` (mid, **subject-left** en r1: las fotos reales no se espejan y así alterna con 09 y 13) + `Credits` | H2: "Estrategas que construyen, <span class="soft">operan y miden.</span>" + "Seis personas que diseñan, construyen y operan tu sistema contigo, con datos y sin humo." + créditos (2 columnas × 3): Director de Estrategia Comercial · **Rik Landeros** / Arquitecto de IA y Automatización · **Alonso Vega** / Director Creativo · **César Ovalle** / Medios de Performance · **Richard Vela** / Administración y Finanzas · **Andy Pizano** / Líder Comercial · **Marcos González** + "Conoce al equipo →" | `equipo-real` (r1; fotos reales compuestas sobre set generado, duotono, sin tocar rostros; requiere la sesión de fotos de §12.2 R6) | Máscara radial del duotono se abre; créditos con stagger .12 | 2 |
| 12 | `faq` | `Intertitle` + `EntitySheet` + `FAQAccordion` | Izquierda (1–5): `FICHA TÉCNICA · INGENIAK EN DATOS` (sede, oficina, alianza Kommo, `sistemas`, `paises` con la lista, VKTOR™ = Verify · Koncept · Transform · Operate · Rise, `PRICE_FROM`, Discovery: 30 min, 1:1, Google Meet, sin costo). Derecha (7–12): G01, G02, G04, G07, G08, G11 | Aura de ondas sedosas | Entradas de línea; solo la pregunta abierta usa cristal | 1 |
| 13 | `cta-final` | `Dawn` | Eyebrow `06:00 · RISE`. H2: "30 minutos para ver tu operación <span class="soft">como es, no como crees que es.</span>" + `.btn` + `.btn--ghost` + "Sin costo · Sin compromiso · 30 minutos por Google Meet" | `cta-amanecer` | Arco de horizonte sube 40 px y enciende su filo (scrub); velo .55 → 0; haz `scaleX .15 → 1` al 60 %; recorrido de luz del botón (una vez) | 3 |
| — | — | `Footer` | Créditos finales + reprise de la firma | — | — | 1 |

Recorrido fijado total: **3.8 pantallas** (03 + 05). Alto aproximado a 1440 × 900: 15,500 px.

CSS propio de la portada del inicio (probado con la placa aprobada a 1280 × 720, 1366 × 768, 1440 × 900, 1536 × 864, 1920 × 1080, 2560 × 1080 y 390 × 844: el CTA queda siempre en el primer pantallazo, el sumario no choca con el titular y el pie de foto no cruza texto):

```css
.is--hero .t-display{font-size:min(clamp(2.75rem,.6rem + 7.2vw,9.25rem),12.6svh)}   /* en escritorios bajos manda la altura */
.sumario{position:absolute;z-index:1;top:calc(var(--hdr) + 32px);left:calc((100% - var(--frame)) / 2);   /* r1: alineado a la retícula (antes var(--safe-x): a 2560 px quedaba 440 px a la izquierda del H1) */
  width:min(440px,34vw);display:grid;grid-template-columns:max-content 1fr;column-gap:16px}
.sumario a{grid-column:1 / -1;display:grid;grid-template-columns:subgrid;align-items:baseline;padding:10px 0;   /* r1: con 5.5ch "+340%" se encimaba con su texto */
  border-bottom:1px solid var(--hair);color:var(--text);text-decoration:none}
.sumario b{font:300 1.75rem/1 var(--f-display);letter-spacing:-.03em} .sumario span{font:400 .8125rem/1.35 var(--f-body);color:var(--text-2)}
@media (max-height:879px),(max-width:767px),(max-aspect-ratio:5/6){.sumario{display:none}}   /* su versión en fila vive en 02 */
/* r1: la microcopia va pegada al primario (antes, en móvil quedaba debajo del botón de WhatsApp) */
.is__text > .ctas{align-items:flex-start}
.cta-p{display:flex;flex-direction:column;align-items:flex-start} .cta-p .btn-micro{white-space:nowrap}
@media (max-width:767px),(max-aspect-ratio:5/6){.cta-p{width:100%}}
```

```html
<!-- r1: estructura de CTAs de toda portada y cierre -->
<div class="ctas">
  <div class="cta-p"><a class="btn" href="/discovery/" data-primary>Agenda tu Discovery Session …</a>
    <p class="t-micro btn-micro">30 min · 1:1 · Google Meet · sin costo</p></div>
  <a class="btn btn--ghost" href="{secondaryCta.href}">Escríbele a Kain ↗</a>
</div>
```

Verificado en Chrome headless (r1) a 390 × 844, 1024 × 768, 1440 × 900 y 2560 × 1080: `ESPEC-v2-prueba-imagesection-r1.html` y capturas `ESPEC-v2-prueba-r1-*.jpg`.

#### 5.1.1 Inicio en móvil

- 01: placa 9:16 `home-hero-m`, texto arriba y Kain abajo; H1 a 44 px; sumario baja a 02; Fig. 01 en línea bajo los CTAs.
- 03 (sin pin): `ImageSection` con `home-problema-a` (modo `below`) y la lista de dolores; enseguida `ImageSection` con `home-problema-b` (modo `top`) y las salidas. Al entrar la segunda, el haz barre una vez (0.9 s, sin scrub).
- 05 (sin pin): 5 `ImageSection` mid con las placas 4:5 de estación, cada una con su mini-demo debajo del copy (se reproduce al entrar). Una píldora fija pequeña `Lead nuevo · etapa 3/5` avanza con el scroll y desaparece al salir de la sección.
- 10 (r1): **sin carrusel de tarjetas.** Una sola placa 4:5 del sector activo a sangre abajo (modo `top`) y, arriba, la lista de 8 filas (`<button aria-pressed>` que cambia la placa + enlace "Ver industria →" en cada fila). Un carrusel de 8 tarjetas con radio era justo el "imagen en caja" que el cliente rechazó. Sin autoavance en móvil.

### 5.2 Servicio (T-SERVICE) · ejemplo `/servicios/agentes-ia-whatsapp/`

Orden base (todas las páginas de servicio; las secciones de D se mapean con la tabla 5.2.1):

| # | Sección | Componentes | Contenido | Placa | Movimiento | Int. |
|---|---|---|---|---|---|---|
| 01 | `hero` | `SharedTake` + `ImageSection` (hero, Kain trabajando) + UI registrada en la superficie de cristal + `Breadcrumbs` | Breadcrumb; eyebrow `SERVICIO · ATENDER`; H1 de D en `.t-display-2`; lede de D con su cifra (`dental-respuesta`); CTAs; burbujas registradas sobre el teléfono: la de la clienta ("¿Tienen lugar mañana?", hora ilustrativa) y la de Kain ("Respondido en segundos") + `SIMULACIÓN` | r1: `home-sistema-2-atender` (la estación Atender del inicio **es** la portada: corte por coincidencia). Placa de cada servicio en `D-sitemap.json → sections[].plate` | Mini firma "Encendido" desde la pantalla; las burbujas entran con "escribiendo…" (600 ms) | 3 |
| 02 | `definicion` | `Intertitle` sobre la toma desenfocada + `DefinitionBlock` + `MetricRow` | "¿Qué es un agente de IA para WhatsApp?" (G02, 40–60 palabras) + fila: `dental-respuesta` · `dental-citas` · `salud-citas-mes` · `sistemas` | Copia desenfocada de la portada | `--rack` 0 → 1 y velo .4 → .7 con scrub | 1 |
| 03 | `senales` (nueva) | `ImageSection` (mid, persona, `tone="dolor"`, móvil `below`) + `PainList` | "Señales de que lo necesitas": 3–4 dolores en ámbar con su salida en cian | r1: placa de dolor por tipo de dolor (`home-problema-a` aquí; `dolor-crm`, `dolor-operacion`, `dolor-anuncios` en el resto; ver `IMAGENES-v2.md` §2.3) | Las salidas se dibujan al entrar (sin pin) | 2 |
| 04 | `capacidades` | `ScriptList` + `ChatSim` (teléfono de cristal sobre aura) | Las 6 capacidades de D en filas | Aura del isotipo | Filas en secuencia; el guion corre al estar en pantalla | 1 |
| 05 | `como-funciona` (nueva) | `SystemFlow` | WhatsApp → Kain → CRM (Kommo/GHL) → agenda → tu equipo, con logos reales y una línea por nodo | Placa compartida `riel-servicios` (21:9, sin sujeto) | Ramas con `stroke-dashoffset` y scrub; nodos se encienden. **Sin pin** | 2 |
| 06 | `vs-chatbot` / `si-no` | `TwoColumnScript` | "Agente de IA, no chatbot de menús" (6 filas) y "Lo que sí hace / lo que no" con el eslogan | — | Filas por pares | 1 |
| 07 | `casos` | `Montage` (1–2 filas) + `ResultsLedger` filtrado | `dental-respuesta`, `dental-citas` / `retail-conversiones` → casos | Portadas de caso | Como inicio 08 | 2 |
| 08 | `integraciones` + `industrias` | `LogoCredits` + `Still` mini ×4 | Canales y conexiones (enlaces a `/kommo/`, `/gohighlevel/`, n8n) y 4 sectores | Stills | Créditos | 1 |
| 09 | `vktor` | `VktorRail` | Las 5 fases aplicadas a este servicio → `/metodologia/` | — | Línea con scrub, nodos se encienden | 1 |
| 10 | `inversion` (nueva) | `Intertitle` | Una sola línea: "Desde USD 997 al mes." + 3 factores del alcance (canales, integraciones, volumen). Sin tabla | — | Entrada por líneas | 1 |
| 11 | `faq` | `FAQAccordion` | Preguntas de D | Aura de ondas | — | 1 |
| 12 | `relacionados` | `Still` ×3 | Los 3 de D, con corte por coincidencia | Stills | Rack focus de entrada | 1 |
| 13 | `cta-final` | `Dawn` | Copy de D | Variante de D (F14) | Como inicio 13 | 3 |

Sin secuencias fijadas en servicios (páginas más ligeras para tráfico de búsqueda).

#### 5.2.1 Mapa de ids de D → componente (servicios, plataformas y hubs)

| ids de `D-sitemap.json` | Componente |
|---|---|
| `hero` | `SharedTake` + `ImageSection` hero |
| `definicion`, `que-es` | `Intertitle` + `DefinitionBlock` |
| `dolores` | `ImageSection` mid `tone="dolor"` + `PainList` (placa = escena de persona de D) |
| `capacidades`, `entregables`, `que-hacemos`, `incluye`, `construimos`, `implementamos`, `que-automatizamos`, `casos-uso`, `contenido`, `licencias` | `ScriptList` |
| `vs-chatbot`, `comparativa`, `selector`, `fit`, `si-no` | `TwoColumnScript` (FitCheck / DoDont) |
| `antes-despues` | `TwoColumnScript variant="before-after"` (antes en ámbar, después en cian) |
| `crm-vivo`, `agente-chat`, `calendario`, `este-sitio`, `dashboard`, `como-medimos`, `kain-ejemplo`, `vktor-cine`, `caso` (con imagen) | `ImageSection` mid con UI registrada |
| `caso`, `casos` (sin imagen) | `Montage` + `Still` |
| `integraciones`, `canales` | `LogoCredits` |
| `industrias` | `Still` mini |
| `vktor` | `VktorRail` |
| `faq` | `FAQAccordion` |
| `relacionados` | `Still` ×3 |
| `cta-final` | `Dawn` |

**Variantes T-PLATFORM:** `/kommo/`: el lugar del chip de la portada lo ocupa `KommoBadge` con "Partner oficial de Kommo en LATAM" (enlazado a kommo.com); `licencias` sin precios publicados salvo decisión del cliente. `/gohighlevel/`: chip "En español · implementación completa"; **nunca la palabra partner**. Ambas agregan "¿Es para ti?" (`TwoColumnScript`, el "no" en ámbar).

**UI registrada por servicio (portada):** Agentes de WhatsApp: burbujas de chat · CRM con IA y Kommo: kanban genérico (Nuevo → Calificado → Cita agendada → Ganado; nunca copia de la UI de Kommo) · GoHighLevel: calendario de citas · n8n: lienzo de nodos con pulsos · Paid media: paneles de anuncio + curva abstracta (sin números) · Páginas web: wireframe que se arma · Software: tablero de 7 fuentes sin nombre · SEO: tarjeta de "respuesta de un motor de IA" con cita a la marca (texto ilustrativo, `SIMULACIÓN`) · Branding: tablero de identidad (isotipo, paleta, tipografía) · Consultoría: roadmap de 5 nodos VKTOR.

### 5.3 Industria (T-INDUSTRY) · ejemplo `/industrias/salud/`

| # | id | Componentes | Contenido | Placa | Movimiento | Int. |
|---|---|---|---|---|---|---|
| 01 | `hero` | `SharedTake` + `ImageSection` hero (persona del sector) | Breadcrumb; eyebrow `INDUSTRIA · SALUD`; H1 de D; lede de D; CTAs; chip anclado a la tableta con `dental-citas` (solo si el sector tiene caso); `IMAGEN ILUSTRATIVA DEL SECTOR` | `ind-salud-hero` | Mini firma desde el rostro; rack focus al salir | 3 |
| 02 | `definicion` | `Intertitle` + `DefinitionBlock` | Párrafo citable de D (y "Kain no da diagnósticos ni consejo médico") | Copia desenfocada | `--rack` con scrub | 1 |
| 03 | `dolores` | `DayTimeline` (vertical) | "La jornada": horas del sector con el dolor (ámbar) y su par con Kain (cian). Salud: 08:00 mensajes de anoche → Kain ya contestó y agendó · 11:30 llamadas y WhatsApp a la vez → Kain atiende el chat · 16:00 citas sin confirmar → Kain confirma y recuerda · 19:40 cierras y siguen escribiendo · 23:48 piden cita de limpieza → respuesta en segundos y la cita queda en tu CRM. **Sin cifras inventadas** | Toma desenfocada que vira a ámbar o cian por tramo | Aguja vertical (el pilar) baja con scrub; cada hora se enciende. **Sin pin** | 2 |
| 04 | `automatizamos` | `ScriptList` | Las 6 tareas de D | — | Filas | 1 |
| 05 | `kain-sector` | `ImageSection` mid (Kain, lado opuesto a la portada, `push`) + `ChatSim` registrado | "Así trabaja Kain en tu clínica": guion del sector (`SIMULACIÓN`): pide limpieza a las 11 p. m., Kain ofrece dos horarios, confirma, "Registrado en tu CRM". "Kain no da diagnósticos ni consejo médico." | `ind-salud-kain-sector` | **Fijada +100 % (escritorio):** `--cam` 1 → 1.6 hacia la pantalla y cada burbuja en un tramo del scroll | 3 |
| 06 | `cifras` | `Montage` (2–3 filas) o `EditorNote` + `Montage` | Con caso: `dental-citas` · `dental-respuesta` · `salud-citas-mes`. **Sin caso propio** (belleza, nutrición, finanzas, inmobiliario): "Nota del editor: estas cifras vienen de casos de otros sectores" + cifras transversales con su sector | Portadas de caso | Como inicio 08 | 2 |
| 07 | `servicios` | `Still` ×3 | Servicios recomendados de D | Stills | Corte por coincidencia | 1 |
| 08 | `datos` (nueva; salud, nutrición y finanzas) | `Intertitle` | "Tus datos": consentimiento, aviso de privacidad, escalamiento a humano, sin consejo médico ni legal. Sin sellos que Ingeniak no tenga | Aura | — | 1 |
| 09 | `faq` | `FAQAccordion` | Preguntas de D | — | — | 1 |
| 10 | `cta-final` | `Dawn` | Copy de D | Variante de D | — | 3 |

HUD y jornada por sector: Belleza `SALÓN · 20:30` · Nutrición `CONSULTORIO · 18:00` · Finanzas `DESPACHO · 09:15` · Inmobiliario `SHOWROOM · 21:10` · Industrial y logística `NAVE · TURNO 2` · Retail y e-commerce `TIENDA · 22:00` · HoReCa `SALÓN · 22:15`. (Las horas de la jornada son ilustrativas y van en la línea de tiempo, no en el HUD; el HUD interno solo dice `INDUSTRIA · SECTOR`.)

### 5.4 Caso de estudio (T-CASE) · ejemplo `/casos/clinica-dental-monterrey/`

| # | id | Componentes | Contenido | Placa | Movimiento | Int. |
|---|---|---|---|---|---|---|
| 01 | `hero` | `ImageSection` hero (persona **a la derecha**) + `Breadcrumbs` | H1 de D en 3 voces, mismo orden en pantalla y en el DOM: `<h1><span class="t-h4">Clínica dental en Monterrey:</span> <span class="t-mega" data-metric="dental-citas">3.2×</span> <span class="t-display-2">más citas en 90 días con un agente de IA</span></h1>`. Fila `.chip-spec`: `SALUD · MONTERREY, N.L. · AGENTE DE IA EN WHATSAPP · 90 DÍAS`. CTA de D ("Quiero un sistema así: agenda tu Discovery"). `IMAGEN ILUSTRATIVA DEL SECTOR` | `caso-dental-hero` (hora azul) | Mini firma; la cifra entra al final con un filo de luz | 3 |
| 02 | `ficha` | `EntitySheet variant="case"` + `SceneRail` como Quick Jump | Sector · Ciudad · Servicio · Herramientas `[POR CONFIRMAR]` · Plazo · Cifras. Entradilla de 2 oraciones en `.t-standfirst` + "Por el equipo de Ingeniak" | — | El riel muestra sus etiquetas desde aquí | 1 |
| 03 | `punto-partida` | `Prose` + nota al margen | Reto con datos confirmados ("Antes tardaban ocho minutos en contestar un WhatsApp"); al margen, "8 min" en ámbar a 40 px | — | Tinta | 1 |
| 04 | `cifra` (nueva) | `CaseFigure` | La cifra confirmada convertida en escena (tabla 5.4.1). Dental: dos cronómetros, ámbar de 0:00 a 8:00 llenando una barra, cian que se detiene en 0:12 (1/40 de la barra) | Aura ámbar → cian | **Fijada +100 % (escritorio)**; móvil: animación al entrar, sin pin | 3 |
| 05 | `implementacion` | `SystemFlow` | "Qué implementamos": WhatsApp → agente (Kain) → CRM `[VALIDAR Kommo o GHL]` → agenda → equipo. **Los nodos sin confirmar no se publican** | — | Ramas con scrub | 2 |
| 06 | `resultado` | `ImageSection` mid (Kain a la izquierda, panel de cristal) | Oración citable de D + `SOURCE_NOTE`; casillas de la agenda con luces HTML ancladas al panel | r1: `ind-salud-kain-sector` (la escena "Así trabaja Kain" de su industria; respaldo de lanzamiento: `home-sistema-2-atender` en espejo) | Push-in leve; casillas se encienden una a una | 2 |
| 07 | `vktor` | `VktorRail variant="milestones"` | Solo hitos confirmados; si no hay, fases genéricas + `/metodologia/` | — | Trazo del pilar | 1 |
| 08 | `replicar` | `ScriptList` (3) | Responder en segundos · confirmar y recordar · registrar cada paciente en el CRM → `/industrias/salud/` | — | — | 1 |
| 09 | `testimonio` | `Quote` (condicional) | **Solo con aprobación escrita** (frase, nombre, cargo, empresa). Si no, la sección no existe en el HTML | — | — | — |
| 10 | `relacionados` | `ScriptList` (2 filas: servicio e industria) + `NextStory` | "Siguiente reportaje": la portada del caso siguiente asoma desde abajo (45svh) con su cifra mega. Clic → View Transition (`view-transition-name: plate`) que la expande hasta ser la portada del siguiente caso | Portada del siguiente caso | Parallax ligero; morph de página | 2 |
| 11 | `cta-final` | `Dawn` | "¿Cuántas citas más cabrían en tu agenda? Lo vemos en 30 minutos." | Variante de D | — | 3 |

#### 5.4.1 "Cifra visual" por caso (solo el número confirmado; sin bases absolutas inventadas)

| Caso | Cifra (`metrics.ts`) | Escena (`CaseFigure variant`) |
|---|---|---|
| Clínica dental, MTY | `dental-citas`, `dental-respuesta` | `stopwatch`: 8:00 contra 0:12 |
| Retail multimarca | `retail-conversiones` | `index-up`: barra-índice de 100 a 440 ("índice: base 100 = antes") |
| E-commerce, CDMX | `ecom-cpl` (+ `ecom-tablero` si se confirma que es el mismo cliente) | `index-down`: de 100 a 42 en 60 días (solo inicio y final, sin curva inventada) |
| HoReCa | `horeca-roas` | `multiplier`: "$1 → $4.8", 4.8 columnas de luz (la última al 80 %) |
| Logística | `logistica-procesos` | `nodes`: 27 nodos cuadrados que se conectan con ramas del isotipo |

### 5.5 Páginas hub

| Página | Orden de secciones (id de D → componente) |
|---|---|
| `/servicios/` | `hero` `ImageSection` hero (placa de D `servicios-hero`) → `definicion` `Intertitle` → `mapa` línea del sistema (5 nodos) + `ScriptList` de los 11 servicios por etapa → `conexion` `SystemFlow` (cómo se conectan las piezas) → `no-se` `ImageSection` mid (Kain señalando) "¿No sabes por dónde empezar?" + `.btn` → `vktor` `VktorRail` → `faq` → `cta-final` `Dawn` (espejo) |
| `/industrias/` | `hero` `ImageSection` hero (Kain) → `definicion` → `grid` `LocationSwitcher` (el mismo del inicio) → `cifras` `EditorNote` + `Montage` transversal → `faq` → `cta-final` `Dawn` (`cta-duena-tranquila`) |
| `/casos/` | `hero` `ImageSection` hero (Kain) → `datos` `MetricRow` (`sistemas`, `paises`, `tiempo-operativo`) → `filtros` chips de sector y servicio (filtran la lista ya renderizada; sin fetch) → `grid` `Still variant="plana"` ×5 → `agregados` **`ResultsLedger` (`#registro`)** con las 9 cifras de caso y la nota de fuente → `metodo` `EditorNote` "Nota de método" (fuente, anonimización, ventanas de medición) → `testimonios` (condicional) → `cta-final` `Dawn` (`cta-equipo`) |
| `/blog/` | `hero` `ImageSection` hero → `categorias` chips → `grid` `Still` (artículo: portada 21:9, categoría, título, autor, fecha, lectura) → `suscripcion` `[POR DECIDIR]` (si no se aprueba, se omite) → `cta-final` `Dawn` |

### 5.6 kain `/kain/` (T-PRODUCT)

`hero` `ImageSection` hero **`subject-center`** (Kain al centro saludando; texto abajo a la izquierda y CTAs abajo a la derecha flanqueándolo; logotipo `kain · by Ingeniak`; H1 "Soy Kain, el agente de IA de tu empresa"; enlace `app.kain.mx ↗`; clip WebM con alfa en P1, con fallback de imagen en Safari) → `que-es` `Intertitle` (G13) → `hago` `ScriptList` (6 capacidades en primera persona) + `ChatSim` en teléfono de cristal con pestañas → `donde` `LogoCredits` (canales e integraciones) → `si-no` `ImageSection` mid subject-left (`kain-si-no`) + `TwoColumnScript` "Lo que sí hago / Lo que no hago" + eslogan → `sectores` `Still` mini ×8 ("Tu clínica trabajando, sin depender más de ti") → `plataforma` `ProductWindow` con capturas de app.kain.mx marcadas `VISTA DEMO` + `.btn--ghost` "Entrar a app.kain.mx ↗" (sin precios de planes) → `cifras` `Montage` (`dental-respuesta`, `dental-citas`) → `faq` → `cta-final` `Dawn`.

### 5.7 Metodología `/metodologia/` (T-METHOD)

`hero` `ImageSection` hero subject-right con `cutout` + `GhostWord` "VKTOR" detrás del recorte y 5 etiquetas ancladas a los escalones (misma placa que el inicio 09; aquí las letras se rellenan en secuencia al cargar) → `que-es` `Intertitle` (G12; el mismo texto alimenta el `HowTo`) → `fases` **`VktorSequence`** (r1: **una sola placa**, `metodologia-hero`, filmada como plano secuencia: la cámara sube escalón por escalón con `push` a `escalon-1…5`; fijada **+250 %** en escritorio; a la izquierda letra mono cian, nombre, verbo oficial, qué hacemos, entregable `[VALIDAR]`; riel de 5 nodos; móvil: 5 bloques apilados sobre la placa 4:5 con el escalón activo resaltado por una luz HTML anclada. Las 5 placas de fase con personas de D quedan como ampliación P3) → `tabla` `<table>` semántica (fase · qué hacemos · entregable · quién participa) → `tiempos` `Intertitle` con los tiempos que confirme el equipo `[POR CONFIRMAR]` → `correccion` `EditorNote`: "VKTOR™ significa Verify · Koncept · Transform · Operate · Rise. Otras expansiones que circularon no son correctas." → `faq` → `cta-final` `Dawn` (espejo).

### 5.8 Tecnologías `/tecnologias/` (T-STACK)

`hero` `ImageSection` hero (Kain) → `criterios` `Intertitle` (por qué elegimos cada herramienta) → `modelos` · `crm` · `automatizacion` · `canales-ads` · `datos-software` como **un solo `StackHub`** (isotipo de cristal al centro con ramas hacia 5 grupos; cada grupo es un `Credits` de logo + rol) → `aviso-marcas` `EditorNote` (Kommo es el único partner oficial; el resto son herramientas que usamos o integramos) → `faq` → `cta-final` `Dawn`.

### 5.9 Nosotros `/nosotros/` (T-ABOUT)

`hero` `ImageSection` hero (r1: placa `equipo-real`, grupo **a la izquierda**; **no** usar `team-hero-CyZMMz70.jpg`, que no es el equipo; requiere la sesión de fotos de §12.2 R6) → `ficha` `EntitySheet` → `manifiesto` `ImageSection` mid **subject-right** (Kain, `nosotros-manifiesto`) con revelado palabra por palabra → `historia` **no se publica hasta confirmar** "fundada en 2022" y la razón social (D §15; el componente no renderiza nada) → `valores` `ScriptList` → `equipo` `TeamCredits` (6 fotos reales en duotono con máscara radial, nombre, cargo y LinkedIn cuando se confirme; sin tarjetas; fotos sin el nombre impreso) → `presencia` `CountryList` (7 países tipográficos, México marcado como sede; **sin mapa genérico con pines falsos**) → `alianzas` `KommoBadge` + texto → `faq` → `cta-final` `Dawn` (`cta-equipo`).

### 5.10 Artículo del blog (T-ARTICLE)

`hero` `ImageSection` hero (placa de D) con breadcrumb, H1, `.t-standfirst`, autor (nombre, cargo, foto en duotono), fecha y minutos de lectura → `respuesta` `AnswerBox` (respuesta de 40–60 palabras, citable, primero) → `indice` `TOC` (sticky en columnas 1–2 en escritorio; plegable en móvil) → `cuerpo` `Prose` (MDX, columnas 3–9, 19 px, 64ch; figuras con pie, sin tarjetas) → `cta-medio` `InlineCTA` (una línea + `.btn`, enlazado a la página comercial del tema) → `faq` → `autor` `AuthorCard` → `fuentes` lista numerada → `relacionados` `Still` ×3 → `cta-final` `Dawn`. Barra de lectura de 2 px bajo el encabezado (F22).

### 5.11 Discovery `/discovery/` (T-CONVERSION)

Encabezado reducido (logo + "Agendar mi Discovery Session" → agenda). `hero` `ImageSection` hero (dueño junto a su silla vacía, subject-right) con `.chip-spec` `LLAMADA 1:1 · 30 MINUTOS · SIN COSTO`, H1 de D, texto de v1 y `.btn` directo a `https://agenda.ingeniak.tech/discovery/agendar` → `video` **`VideoScene`** (r1: `ImageSection` mid `subject-center` con la placa `discovery-vsl-poster` a sangre; H2 abajo a la izquierda, botón de reproducir abajo a la derecha; al hacer clic el VSL "la silla vacía" se abre a pantalla completa en `<dialog>`, con subtítulos VTT; nunca un reproductor en una caja con radio) + "Si reconociste tu negocio en este video, esta llamada es tu siguiente paso." → `pasos` `StepRow` (3 pasos de v1: formulario de 7 preguntas en 2 min · eliges horario (hora de CDMX, L–V) · Google Meet) → `que-es` `TwoColumnScript` ("Lo que sí es" en cian / "Lo que no es" en ámbar) → `para-quien` `ImageSection` mid subject-left (móvil `below`) con "Es para ti si… / No es para ti si…" → `despues` `Intertitle` + `.btn` → `faq` (D01–D06) → `cta-final` `Dawn` (placa propia: Kain sentado en la silla del dueño). Sin mega menú, sin riel, sin `KainPill`, sin barra inferior móvil (D).

### 5.12 Contacto `/contacto/` (T-CONTACT)

`hero` `ImageSection` hero subject-left (r1: `home-kain`, Kain saludando junto al teléfono = "Escríbele a Kain"; se descarta la asesora generada porque sugiere una empleada que no existe) con breadcrumb, H1 "Habla con Ingeniak" y 3 rutas: `.btn` Discovery (recomendada) + `.glass-chip` WhatsApp con Kain + `.glass-chip` correo → `rutas` tabla de 3 rutas con tiempo de respuesta `[VALIDAR]` → `formulario` `[POR DECIDIR]` webform de Kommo (nombre, empresa, WhatsApp, mensaje, casilla de aviso de privacidad); si no se aprueba, no existe → `oficina` dirección + horario `[VALIDAR L–V 09:00–18:00]` + mapa estático exportado en el build (imagen, sin embed de terceros al cargar) con enlace a Google Maps → `redes` → `cta-final` `Dawn`.

### 5.13 404 (T-404)

Un solo `ImageSection` hero subject-right (`404-hero`: Kain mirando una rama de luz cortada) con H1 "Esta ruta no está conectada", "Kain buscó por todos lados y esta página no existe (o se mudó).", `ScriptList` de rescate (Inicio · Servicios · Casos · Blog), botón que abre ⌘K y `.btn--ghost` WhatsApp → `Footer`. `noindex`, sin JSON-LD.

### 5.14 Resto de plantillas

- **`/preguntas-frecuentes/` (T-FAQ):** `ImageSection` hero (Kain pensativo, subject-left) → categorías (`FAQAccordion` por grupo) con filtro sobre el HTML ya renderizado → `Dawn`.
- **`/agentes-ia-guadalajara/` (T-LOCAL):** `ImageSection` hero (empresario tapatío) → `que-es` → `ficha` `EntitySheet` (NAP) → `que-hacemos` `ScriptList` → `local-alcance` `ImageSection` mid (Kain) → `casos` `Still` → `mapa` estático → `vktor` `VktorRail` → `faq` → `Dawn`.
- **`/aviso-privacidad/` (T-LEGAL):** sin escena. `Intertitle` de encabezado sobre aura → `TOC` lateral → `Prose`. Sin la nota pública de "modelo estándar" (A §3.10).

---

## 6. Inventario de componentes Astro

Árbol: `src/components/{layout,nav,cine,ui,content}/`. Datos: `src/data/{sitemap.json, navegacion.json, plates.json, faq.ts, chats/*.json}` y `src/lib/metrics.ts`. Movimiento: `src/scripts/cine.ts` + `src/scripts/shots/*.ts` (un módulo por tipo de escena, cargado con `import()` solo si la página lo usa). Ningún componente acepta un número comercial libre ni un color fuera de tokens.

| # | Componente | Props principales | Notas |
|---|---|---|---|
| **Layout e infraestructura** ||||
| 1 | `BaseLayout` | `page: SitemapEntry`, `nav?: 'full' \| 'reduced'` | `<html lang="es-MX">`, precarga de Lexend y de la placa LCP (§8.3), script en línea del `<head>` que decide `html.co` (firma) y `html.vt`, grano global, enlace "Saltar al contenido", carga diferida de `cine.ts`. |
| 2 | `SEOHead` | `page: SitemapEntry`, `faqIds?: string[]` | `title`, meta, canonical, OG/Twitter (imagen OG 1200 × 630 generada en el build desde el still), `@graph` JSON-LD (§8.5), `robots` (`noindex` en 404). |
| 3 | `Header` | `variant: 'full' \| 'reduced'`, `current: string` | §4.1. Estados transparente / oculto / cristal / modo sala; regla de un azul. `view-transition-name: hdr`. |
| 4 | `MegaMenu` | `panels: NavPanel[]` | §4.2. Pantalla de previsualización con stills diferidos, pill con Flip, teclado completo. Enlaces en HTML estático. |
| 5 | `SearchDialog` | — | §4.3. `<dialog>`, índice `/indice.json` diferido, acción de WhatsApp. |
| 6 | `MobileMenu` | `nav: NavData` | §4.5. Hoja de cristal, acordeones, buscador arriba, CTAs al pie. |
| 7 | `Footer` | `nav: NavData`, `entity: Entity` | §4.8. Créditos finales, ficha, redes, legal, reprise de la firma, interruptor "Reducir movimiento". |
| **Orientación y CTA persistente** ||||
| 8 | `Breadcrumbs` | `items: {name, href?}[]` | §4.4. Línea mono dentro de la portada; genera `BreadcrumbList`. |
| 9 | `SceneRail` | `items: {id, label}[]`, `mode: 'ticks' \| 'labels'`, `groups?: number[]` | §4.7. Solo ≥ 1280 px. Quick Jump en casos. |
| 10 | `MobileCTABar` | `waHref: string` | §4.6. Oculta con primario visible, con `Dawn` visible, con menú abierto y en `/discovery/`. |
| 11 | `KainPill` | `waHref: string` | §4.6 / F21. Escritorio, solo con el encabezado oculto. Nunca azul. |
| **Escenas (escenario registrado)** ||||
| 12 | `ImageSection` | `id`, `plate: PlateId`, `layout?`, `height?`, `align?: 'start' \| 'center' \| 'end'`, `tone?`, `mobile?: 'top' \| 'below'`, `priority?`, `take?`, `cutout?`, `ghost?: {text, mode:'outline-fill' \| 'bleed'}`, `push?: {anchor, to}`, `mirror?`, `hud?: {pos, text}[]` · slots: default, `anchors`, `aside` | §3. El componente central del sitio. Valida en build que la placa exista y que `alt`, anclas y zonas estén completas. |
| 13 | `ColdOpen` | `plate: PlateId` (usa el ancla `pecho`) | §7.3. Solo en `/`. Capa óptica registrada (nodo, isotipo SVG de `favicon.svg`, pantalla, iris). |
| 14 | `SharedTake` | `plate: PlateId` · slots: portada y sección siguiente | §3.12. Placa sticky + copia desenfocada horneada (`-rack-320.webp`); `--rack` con scrub. |
| 15 | `TwinScene` | `plateA`, `plateB`, `layout`, `pin?: string` (`'+=100%'`) | §3.12, §5.1 ESC 03. Haz de barrido, reloj del HUD, `PainList` en modo gemelo, "Saltar escena". Móvil: dos `ImageSection` sin pin. |
| 16 | `PlateSequence` | `preset: 'runtime' \| 'phases'`, `steps: {id, plate, title, line, href?, metricIds?, ui?}[]`, `pin: string` | Presets **`SystemRuntime`** (inicio 05: tarjeta de lead con Flip entre la UI registrada de cada estación, nota de honestidad, etiqueta Fig. 02) y **`VktorSequence`** (metodología: 5 fases). Barrido de luz entre placas, snap a etiquetas, riel de progreso, "Saltar escena". Móvil: apila `ImageSection`. |
| 17 | `Dawn` | `plate: 'cta-amanecer' \| 'cta-duena-tranquila' \| 'cta-equipo' \| 'discovery-cta-final'`, `mirror?`, `copy: CtaFinal` | Cierre de todas las páginas: `ImageSection height="cta"` + arco de horizonte + haz + recorrido de luz del botón. |
| 18 | `Intertitle` | `aura?: 'isotipo' \| 'ondas' \| 'none'`, `layout?: 'asym' \| 'split'`, `ghost?`, `rack?: boolean` | Plano sin sujeto, sin fondo propio. Aura = WebP de 600 px ya desenfocado (sin `filter` en vivo). |
| 19 | `FigCaption` | `n: number`, `title`, `anchor: string`, `target: string`, `metricId?` | §3.8. Pie de cristal + línea guía + nodo cuadrado, todo registrado. En móvil baja al texto si el ancla es `null`. |
| 20 | `LightBranch` | `from: string` (ancla), `via?: string` (selector), `to?: string` (`[data-primary]`) | §3.8 / F20. Tramo 1 en SVG registrado, tramo 2 por JS con prueba de no cruce con texto. Dispara `.is-traced` en el botón. |
| 21 | `Montage` | `ids: MetricId[]`, `transversal?: MetricId[]`, `stillFor: Record<MetricId, PlateId>` | Cifras en `--fs-mega` (Lexend 200) con la placa del caso dentro de las letras (capa blanca en `screen` para legibilidad), filas alternadas, contexto mono, nota de fuente. Cifras = texto real. |
| 22 | `LocationSwitcher` | `sectors: {slug, name, line, metricId?, plate, chatId?}[]`, `autoplay?: number` (4000) | Lista con ↑↓, placa activa a sangre (doble capa A/B), espejo automático, botón de pausa, carrusel nativo con snap en móvil. |
| 23 | `CaseFigure` | `variant: 'stopwatch' \| 'index-up' \| 'index-down' \| 'multiplier' \| 'nodes'`, `metricIds: MetricId[]`, `pin?` | §5.4.1. Solo la cifra confirmada; nada de bases absolutas inventadas. |
| 24 | `DayTimeline` | `entries: {time, pain, fix}[]` | "La jornada" de industrias. Vertical, sin pin; la aguja (el pilar) baja con scrub. Horas ilustrativas. |
| **UI y contenido** ||||
| 25 | `Btn` | `variant: 'primary' \| 'ghost' \| 'sm' \| 'icon'`, `href`, `micro?: boolean`, `wa?: boolean`, `label` | §2.9. `primary` agrega `data-primary` (regla de un azul) y la microcopia. |
| 26 | `Metric` | `id?: MetricId`, `ids?: MetricId[]`, `variant: 'inline' \| 'chip' \| 'mega' \| 'row' \| 'cover'`, `link?: boolean`, `count?: boolean` | §2.10. Única salida de cifras; escribe `data-metric`; `row` = fila "en datos" con `SOURCE_NOTE`. |
| 27 | `SumarioCover` | `ids: [MetricId, MetricId, MetricId]` | F7. Tres líneas de portada con enlace a caso y llamada `.fn`; con `max-height: 879px` o móvil se reubica en la sección 02 (`variant="row"`). |
| 28 | `ScriptList` | `rows: {n?, title, line?, href?, plate?}[]`, `groups?: {label, glyph}[]`, `followStill?: boolean`, `variant?: 'rows' \| 'steps'` | Filas de guion (sustituyen a las tarjetas con ícono). `followStill`: fotograma 21:9 que sigue al cursor con `quickTo`. |
| 29 | `Still` | `href`, `plate: PlateId`, `label`, `title`, `metricId?`, `variant: 'still' \| 'plana' \| 'mini' \| 'next'` | Fotograma con corte por coincidencia (`data-still`). `next` = "Siguiente reportaje" (asoma 45svh y se expande con View Transition). |
| 30 | `ResultsLedger` | `ids: MetricId[]`, `filter?: {service?, sector?}` | Registro en `<table>` (Resultado · Qué cambió · Sector y ciudad · Ventana · Servicio · →); barrido cian por fila en hover/foco; bloques en móvil. |
| 31 | `ChatSim` | `scripts: Record<sector, ChatLine[]>`, `tabs?: string[]`, `mode: 'registered' \| 'inline'`, `autoplay?: boolean` | Simulador sin backend: guiones JSON del build, "escribiendo…", botón de pausa (WCAG 2.2.2), barra `SIMULACIÓN`, `data-nosnippet`. El guion completo está en el HTML como `<ol>` (estado final con movimiento reducido). |
| 32 | `ProductWindow` | `title`, `label: 'SIMULACIÓN' \| 'VISTA DEMO'`, `fig?: string` | Marco `.glass-panel` con barra de título y marcas "+" en esquinas para capturas o demos (app.kain.mx, Runtime en móvil). |
| 33 | `PainList` | `items: {pain, fix}[]`, `mode: 'twin' \| 'draw'` | Dolor en ámbar con nodo ámbar; su salida en cian se dibuja (`clip-path`) al entrar o con el barrido. Ambos textos siempre en el DOM, en orden. |
| 34 | `TwoColumnScript` | `left: {title, items, tone}`, `right: {title, items, tone}`, `variant: 'fit' \| 'dodont' \| 'compare' \| 'before-after'` | "Es para ti si / no", "Lo que sí / lo que no", agente vs chatbot, antes y después. Sin tabla con bordes. |
| 35 | `VktorRail` | `variant: 'phases' \| 'milestones'`, `milestones?: string[]` | 5 nodos cuadrados unidos por una línea cian que se dibuja con scrub. Texto oficial de las fases. |
| 36 | `SystemFlow` | `nodes: {label, logo?, confirmed: boolean}[]`, `variant: 'flow' \| 'hub'`, `plate?: PlateId` | Diagrama con las ramas del isotipo (codos a 45°, nodos cuadrados, pulso que recorre la rama). `hub` = **`StackHub`** de Tecnologías. Los nodos con `confirmed: false` no se renderizan. |
| 37 | `DefinitionBlock` | `faqId?: string`, `heading`, `variant: 'definition' \| 'answer'` | "¿Qué es…?" de 40–60 palabras con la definición en la primera oración; `answer` = **`AnswerBox`** de artículos. Texto idéntico al banco de FAQ. |
| 38 | `FAQAccordion` | `ids: string[]` | Del banco de D §12; registra las preguntas en `SEOHead` para un `FAQPage` idéntico al texto visible. Apertura con `grid-template-rows: 0fr → 1fr` (0.45 s). |
| 39 | `EntitySheet` | `variant: 'home' \| 'footer' \| 'case' \| 'about' \| 'local'` | `<dl>` con los datos de la entidad o del caso; mismos datos que JSON-LD y `llms.txt`. |
| 40 | `Credits` | `variant: 'team' \| 'logos' \| 'countries' \| 'stack'`, `items` | Tipografía de créditos (rol en mono, nombre en Lexend). `logos` = **`LogoCredits`** (SVG `currentColor` al 55 %), `team` = **`TeamCredits`** (fotos reales en duotono), `countries` = **`CountryList`**. |
| 41 | `KommoBadge` | `size?: 'sm' \| 'md'`, `glass?: boolean` | Sello oficial blanco, enlazado a `https://www.kommo.com/`, texto "Partner oficial de Kommo en LATAM". |
| 42 | `EditorNote` | `label: string`, `variant?: 'note' \| 'cta'` | Recuadro de filete con etiqueta incrustada ("NOTA DEL EDITOR", "NOTA DE MÉTODO"). `cta` = **`InlineCTA`** de artículos. |
| **Artículos y medios** ||||
| 43 | `Prose` | slot MDX | Cuerpo editorial (64ch, 19 px) con subcomponentes `TOC` (índice sticky), `Figure`, `Quote` (solo citas con fuente) y notas al pie. |
| 44 | `AuthorCard` | `person: TeamMember` | Autor real del equipo (foto en duotono, cargo, enlace a `/nosotros/`). Nunca un autor inventado. |
| 45 | `VideoPoster` | `src`, `poster`, `captions: string`, `mode: 'inline' \| 'modal'` | VSL y videos: póster, carga al clic, `playsinline`, subtítulos VTT, sin autoplay con sonido. |

**Alias usados en §5:** `SystemRuntime` y `VktorSequence` = presets de `PlateSequence`; `LeadCard` y "Saltar escena" (`SkipScene`) son internos de las escenas fijadas; `MetricRow` = `Metric variant="row"`; `LogoCredits` / `TeamCredits` / `CountryList` = variantes de `Credits`; `StackHub` = `SystemFlow variant="hub"`; `NextStory` = `Still variant="next"`; `AnswerBox` = `DefinitionBlock variant="answer"`; `InlineCTA` = `EditorNote variant="cta"`; `TOC` y `Quote` = subcomponentes de `Prose`; `GhostWord` = prop `ghost`; `Hud` = prop `hud`; `StepRow` = `ScriptList variant="steps"`.

---

## 7. Sistema de movimiento v2

### 7.1 Tokens

```css
:root{
  --ease-cine:cubic-bezier(.16,1,.3,1);   /* ≈ GSAP expo.out: entradas, revelados */
  --ease-ui:cubic-bezier(.22,1,.36,1);    /* hover, menús, botones */
  --ease-cut:cubic-bezier(.76,0,.24,1);   /* movimientos de cámara, barridos, View Transitions */
  --ease-in:cubic-bezier(.55,0,1,.45);    /* colapsos (firma) */
  --d-cut:.2s; --d-ui:.45s; --d-ink:.6s; --d-shot:.9s; --d-cam:1.3s; --d-light:1.6s;
}
```

| Parámetro | Valor |
|---|---|
| Defaults GSAP | `gsap.defaults({ ease: 'expo.out', duration: .9 })` |
| Líneas de titular | SplitText `{ type: 'lines', mask: 'lines', autoSplit: true }`, `yPercent: 110 → 0`, 0.95 s, stagger .08 |
| Bloques (lede, CTAs, chips) | `y: 16–24 → 0`, `autoAlpha 0 → 1`, 0.8 s, stagger .06 |
| Filas | stagger .06 · créditos .12 · logos .06 |
| Parallax de salida | placa `yPercent +6` · texto `y −60` y `autoAlpha → .2` · recorte −3 % (solo con placa limpia) · anclados con la placa |
| Respiración en reposo | `--cam` 1 → 1.015, 8 s, `sine.inOut`, yoyo (solo portada del inicio) |
| Magnético | ±6 px con `gsap.quickTo` (0.4 s, `power3`), solo `pointer: fine` |
| Prohibido | `back`, `elastic`, `bounce`, rotaciones de UI (solo el aura del isotipo gira), `filter: blur()` en vivo sobre capas grandes, animar `backdrop-filter`, animar opacidad de la imagen LCP |

**Lenis 1.3.11:** `new Lenis({ lerp: .1, smoothWheel: true, syncTouch: false, autoRaf: false })`, conectado a `gsap.ticker` con `gsap.ticker.lagSmoothing(0)` y `lenis.on('scroll', ScrollTrigger.update)`. Se detiene (`lenis.stop()`) con diálogos, menú y mega menú abiertos. No corre con movimiento reducido. `ScrollTrigger.refresh()` después de `document.fonts.ready` y del `decode()` de las placas de secuencias fijadas.

### 7.2 Arranque

```ts
// src/scripts/cine.ts — un módulo por documento (MPA, sin ClientRouter)
import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
const mm = gsap.matchMedia();
mm.add({
  motion: '(prefers-reduced-motion: no-preference)',
  desk:   '(min-width: 768px) and (min-aspect-ratio: 5/6)',
  pin:    '(min-width: 1024px) and (min-height: 640px) and (hover: hover) and (pointer: fine)',
}, async (ctx) => {
  const { motion, desk, pin } = ctx.conditions!;
  if (!motion || document.documentElement.dataset.motion === 'reduced') return;   // estado final, solo fundidos CSS de 300 ms
  const lenis = new Lenis({ lerp: .1, autoRaf: false }); lenis.on('scroll', ScrollTrigger.update);
  const raf = (t: number) => lenis.raf(t * 1000); gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
  for (const el of document.querySelectorAll<HTMLElement>('[data-shot]')) {
    const shot = await import(`./shots/${el.dataset.shot}.ts`);          // scene, take, twin, sequence, montage, …
    shot.default(el, { desk, pin, gsap, ScrollTrigger });
  }
  return () => { gsap.ticker.remove(raf); lenis.destroy(); };
});
```

### 7.3 Firma "Del nodo al pecho" (`ColdOpen`)

Reapuntada a la pantalla del pecho del hero aprobado (`home-hero`: `--cx: .779`, `--cy: .465`, pantalla ≈ 3 % del ancho; medir en el registro final).

| t (escritorio; móvil ×0.8) | Plano | Construcción |
|---|---|---|
| 0.00–0.35 s | Lienzo `#03040B`; en el punto del pecho late un **nodo cuadrado de 10 px** (3 parpadeos de 80 ms). Abajo al centro, en mono cian al 75 %: `INGENIAK` | `.node` opacidad en yoyo |
| 0.35–1.05 s | Desde el nodo se dibujan **el pilar y las ramas** del isotipo (línea cian 1.6 px con brillo) | Ruta exacta de `public/favicon.svg` (longitud 772.5); se anima `stroke-dashoffset` con una variable CSS. **Sin DrawSVG** |
| 1.05–1.45 s | El isotipo se colapsa en su nodo (escala 1 → 0.16, opacidad → 0) | `scale` + `opacity`, `power3.in`. **Sin MorphSVG** |
| 1.45–1.90 s | **Corte por coincidencia:** el nodo crece y es el marco de la pantalla del pecho; un iris se abre y deja ver el asterisco real en primerísimo plano (cámara ×4) | La placa ya está pintada debajo, `scale: var(--cam)` con origen en el pecho; iris = radial que crece (`--iris` 0 → 250 px) |
| 1.90–2.80 s | **Dolly out:** aparecen el torso, la mano que presenta, el isotipo de cristal y el piso | `--cam` 4 → 1 (`expo.inOut`, 1.3 s); iris → 2200 px; velo → 0 |
| 2.50–3.40 s | Portada real: líneas del H1, CTAs, rama de luz, Fig. 01, HUD y encabezado | SplitText + `LightBranch` |

Reglas:
- **Una vez por sesión y solo en `/`** (`sessionStorage['ingeniak-coldopen']`). No corre si el referrer es del mismo sitio, si hubo View Transition, con `prefers-reduced-motion`, con `navigator.connection.saveData` ni con el interruptor "Reducir movimiento".
- **Se salta con cualquier intención** (`wheel`, `touchstart`, `keydown`, `pointerdown`): `tl.progress(1)`. Nunca bloquea el scroll.
- **LCP intacto:** la `<img fetchpriority="high">` de la placa **nunca** tiene `opacity: 0`; la tapa una capa de iris aparte. **SEO intacto:** H1, CTAs y texto están en el HTML; el script del `<head>` solo agrega `html.co` si se cumplen las condiciones.
- **Red de seguridad CSS:** `html.co .co-iris, html.co .co-layer{animation:co-safety 0s 3.2s forwards}` y `html.co .is__copy > *{animation:co-show 0s 3.2s forwards}`: si el JS no carga o se cae, a los 3.2 s la portada queda completa.
- **Estado final idéntico** a una visita sin firma (QA: captura con `?replay` a los 5 s contra la versión con movimiento reducido).
- **Mini firma "Encendido"** (0.9 s) en la portada de las páginas internas: sin isotipo; el nodo late en el ancla del sujeto (`pecho` o `rostro`) y el iris se abre desde ahí. No corre si la página llegó por corte por coincidencia (`pagereveal` con `viewTransition`).
- **Reprise:** al llegar al footer, el nodo late y el isotipo se dibuja una vez sobre los créditos finales.

```js
gsap.set(scene, { '--cam': 4, '--veil': 1, '--iris': '0px', '--draw': 772.5 });
const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  .to('.co-node', { opacity: 1, duration: .08, repeat: 2, yoyo: true, ease: 'none' }, .1)
  .to('.co-iso',  { opacity: 1, duration: .1 })
  .to(scene,      { '--draw': 0, duration: .7, ease: 'power2.inOut' }, '<')
  .to('.co-iso',  { scale: .16, opacity: 0, duration: .35, ease: 'power3.in' }, '+=.05')
  .fromTo('.co-scr', { scale: .06, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'expo.out' }, '-=.08')
  .to(scene,      { '--iris': '250px', duration: .45, ease: 'power2.out' }, '<')
  .to('.co-scr',  { opacity: 0, duration: .3 }, '+=.08')
  .to(scene,      { '--cam': 1, duration: 1.3, ease: 'expo.inOut' }, '<')
  .to(scene,      { '--iris': '2200px', duration: 1, ease: 'power2.in' }, '<.1')
  .to(scene,      { '--veil': 0, duration: .45 }, '-=.4')
  .add(() => heroIntro(), '-=.35');                      // líneas del H1, CTAs, rama, Fig. 01
['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((e) => addEventListener(e, () => tl.progress(1), { once: true, passive: true }));
```

```css
/* Capa óptica de la firma: escenario registrado SIN escala, así todo cae en el pecho de Kain en cualquier pantalla */
.co-layer{position:absolute;inset:0;z-index:3;container-type:size;pointer-events:none}
.co-optic{position:absolute;left:calc(var(--cx) * 100%);top:calc(var(--cy) * 100%);translate:-50% -50%}
.co-iris{width:300vmax;height:300vmax;opacity:var(--veil,0);
  background:radial-gradient(circle var(--iris,0px) at 50% 50%,transparent 0 70%,var(--ink) 100%)}
.co-node{width:10px;height:10px;background:var(--cyan);box-shadow:var(--glow-cyan);opacity:0}
.co-iso{width:min(22vw,320px);opacity:0}
.co-iso path{fill:none;stroke:var(--cyan);stroke-width:1.6;stroke-dasharray:772.5;stroke-dashoffset:var(--draw,0);
  filter:drop-shadow(0 0 6px var(--cyan)) drop-shadow(0 0 22px rgb(0 229 255 / .7))}
.co-scr{width:calc(var(--scr-w,.03) * 100%);aspect-ratio:1;border:1.5px solid var(--cyan);border-radius:18%;box-shadow:var(--glow-cyan);opacity:0}
html.co .is__copy > *{opacity:0;animation:co-show 0s 3.2s forwards}          /* red de seguridad: sin JS, a los 3.2 s todo visible */
html.co .co-layer{animation:co-safety 0s 3.2s forwards}
@keyframes co-show{to{opacity:1}} @keyframes co-safety{to{opacity:0;visibility:hidden}}
```

El script del `<head>` (en línea, < 1 KB) agrega `html.co` solo si se cumplen las condiciones; GSAP, al tomar el control, cancela las animaciones de seguridad (`animation: none`) y maneja las opacidades. `--scr-w` (lado de la pantalla del pecho en fracción del ancho de la placa) vive en `plates.json` junto al ancla `pecho`.

### 7.4 Movimiento por componente

| Componente | Disparador | Movimiento | Movimiento reducido |
|---|---|---|---|
| `ImageSection` (entrada) | `top 75%` | "Se enciende la luz": `--cam 1.06 → 1` (1.6 s) + fuga `--leak 0 → .9` + líneas del titular + bloques + anclados (`y 24 → 0`) + línea guía (`--draw 1 → 0`) | Fundido de 300 ms |
| `ImageSection` (salida) | `top top → bottom top`, scrub | Parallax de §7.1 | Nada |
| `ImageSection` `push` | Mientras cruza el viewport, scrub | `--cam 1 → to` con origen en el ancla | Nada |
| `SharedTake` | Sección siguiente `top 85% → top 25%`, scrub | `--rack 0 → 1`, velo .4 → .7 | Copia desenfocada fija |
| `TwinScene` | Pin `+=100%` (escritorio), scrub .6 | 0–.4 dolores; .4–.75 `--wipe 100% → 0%` con haz y `--mix` de cada dolor; .75–1 remate; reloj del HUD | Placa B con dolores y salidas completos |
| `PlateSequence` (runtime) | Pin `+=280%`, snap a 5 etiquetas | Cambio de estación: barrido de luz 0.8 s (`--ease-cut`) + `Flip.from` de la tarjeta de lead (0.8 s, `power3.inOut`, **fuera del scrub**, disparado por `onUpdate` al cambiar de paso) + micro-demo de la vista; riel con scrub | 5 bloques apilados con su estado final |
| `PlateSequence` (phases) | Pin `+=250%` (r1), snap | Una sola placa: `--cam` y origen viajan de `escalon-1` a `escalon-5` (sin tarjeta de lead); la letra de la fase pasa de contorno a sólido | 5 bloques apilados |
| `Intertitle` | Scrub | Palabra por palabra (opacidad .15 → 1); aura gira 0 → 8° y `yPercent −10 → 10` | Texto completo, aura fija |
| `ghost` (palabra gigante) | Scrub | `xPercent −6`; con `outline-fill`, cada letra se rellena al entrar su paso | Letras rellenas |
| `Montage` | Scrub | Filas `xPercent ±6` en sentidos alternos; `--px 20% → 80%` dentro de las letras | Estático |
| `LocationSwitcher` | Hover, foco, ↑↓, autoavance 4 s | Fundido cruzado 0.6 s (`power2.inOut`) + `scale 1.04 → 1`; barra de progreso en la fila activa | Sin autoavance; cambio instantáneo |
| `ScriptList` | `top 80%`; hover | Filas con stagger .06; hover: activa al 100 %, resto .35; fotograma con `quickTo` (0.6 s) | Sin fotograma que sigue |
| `Still` | Hover; clic | `scale 1.04 → 1` (0.9 s); clic = View Transition | Navegación normal |
| `ChatSim` | 50 % visible | "escribiendo…" 500–600 ms → burbuja (`y 12 → 0`); cambio de pestaña = barrido de 200 ms; pausa | Conversación completa |
| `Metric count` | `top 85%` | Conteo 1.1 s solo en cifras sin signo; el valor final ya está en el HTML | Valor final |
| `CaseFigure` | Pin `+=100%` (escritorio) o al entrar | Según variante (cronómetros, barras-índice, columnas, nodos) | Estado final |
| `DayTimeline` | Scrub | La aguja baja; cada hora se enciende y su par cian se dibuja | Todo visible |
| `VktorRail` / `SystemFlow` | Scrub | `stroke-dashoffset` de la línea/ramas; nodos se encienden; pulso que recorre cada rama cada 3–4 s (`repeatDelay` aleatorio) solo en pantalla | Dibujado completo, sin pulsos |
| `LightBranch` | Al terminar la entrada | Dibujo de 1.1 s (`--ease-cut`) y `.is-traced` en el botón | Dibujo completo, sin recorrido |
| `Dawn` | Scrub + `top 40%` | Arco `y +40 → 0` y filo 0 → 1; velo .55 → 0; haz `scaleX .15 → 1`; recorrido de luz del botón **una vez** | Estado final |
| `Header` | Dirección del scroll | `yPercent −100 ↔ 0` en 0.35 s; cristal al volver | Sin ocultarse |
| `MegaMenu` | Hover con intención / clic | 220 ms (opacidad, `y −8 → 0`, stagger 20 ms); pill con Flip 0.35 s | Sin desplazamiento |
| `Credits` / logos | `top 85%` | `y 6 → 0` y opacidad, stagger .06–.12 | Fundido |
| `FAQAccordion` | Clic | `grid-template-rows 0fr → 1fr` 0.45 s | Instantáneo |
| `Footer` | Final de página | Reprise del isotipo (0.9 s) | Isotipo dibujado |

### 7.5 Narrativa con scroll: reglas

1. **Secuencias fijadas solo en escritorio** (condición `pin` de §7.2) y **solo verticales**. En móvil y tablet táctil no existe ningún pin: las secuencias se apilan.
2. **Nunca scroll horizontal fijado**: ningún contenido se revela desplazando una pista en X en función del scroll vertical. El movimiento horizontal solo se permite como deriva decorativa (≤ ±6 %) de elementos que ya son visibles (montaje, palabra gigante). Los carruseles móviles usan scroll nativo con snap, sin pin.
3. **Máximo 2 por página**; recorrido fijado total ≤ 400 % (inicio: 380 %). Inventario: inicio 03 (+100 %) y 05 (+280 %); industria 05 (+100 %); caso 04 (+100 %); metodología `fases` (r1: +250 %, una sola placa). Servicios, hubs, artículos y conversión: **cero**.
4. Cada secuencia fijada tiene: enlace "Saltar escena" (visible al foco) hacia la sección siguiente, todo su contenido en el DOM y en orden de lectura, `anticipatePin: 1`, snap solo a etiquetas (`duration: {min: .2, max: .6}`), "modo sala" (encabezado, `KainPill` y barra móvil ocultos).
5. Solo se animan con scrub: `transform`, `opacity` (nunca de ancestros de cristal), variables CSS que mueven `clip-path`, degradados y `stroke-dashoffset`. Nunca propiedades de layout.
6. **La cámara se mueve, la UI no rebota.** Un set piece (3) siempre va seguido de un respiro (1) o una escena (2).
7. Todo lo que se mueve más de 5 s tiene pausa (ChatSim, autoavance de industrias) o se detiene fuera del viewport (`IntersectionObserver`) y con `document.hidden`.

### 7.6 Entre páginas: corte por coincidencia (View Transitions entre documentos)

```css
@view-transition { navigation: auto; }
.hdr { view-transition-name: hdr; }
.is--hero[data-priority] .is__layer--media img { view-transition-name: plate; }   /* una por página */
::view-transition-group(plate){ animation-duration:.7s; animation-timing-function:var(--ease-cut); }
::view-transition-old(root),::view-transition-new(root){ animation-duration:.35s; }
@media (prefers-reduced-motion: reduce){ @view-transition { navigation: none; } }
```

```js
document.addEventListener('click', (e) => {               // origen: el still clicado se vuelve la "placa"
  const a = e.target.closest('a[data-still]'); if (a) a.querySelector('img').style.viewTransitionName = 'plate';
});
addEventListener('pagereveal', (e) => { if (e.viewTransition) document.documentElement.dataset.vt = '1'; });  // destino: sin mini firma
```

Chrome 126+ y Safari 18.2+. En Firefox la navegación es normal y la mini firma hace el trabajo. Sin ClientRouter de Astro. Astro `prefetch` con estrategia `hover` en enlaces internos para que el corte sea inmediato.

### 7.7 Movimiento reducido, ahorro de datos y control del usuario

- `prefers-reduced-motion: reduce` **o** el interruptor "Reducir movimiento" del footer (`html[data-motion="reduced"]`, guardado en `localStorage` con `try/catch`): sin Lenis, sin pins (secuencias apiladas en su estado final), sin parallax, sin SplitText, sin conteos, sin firma ni mini firma, sin View Transitions, sin autoavance ni autoplay (videos con póster y botón), ramas dibujadas completas, solo fundidos de opacidad de 300 ms en CSS.
- `navigator.connection.saveData` o red `2g`/`3g`: sin firma, sin videos, stills del mega menú solo al abrir.
- El estado reducido **es el mismo contenido**: nada se esconde detrás de una animación.

### 7.8 Presupuesto de movimiento

| Métrica | Meta |
|---|---|
| JS del inicio | ≤ 85 KB gzip (GSAP core + ScrollTrigger + SplitText + Flip + Lenis + escenas) |
| JS de páginas internas | ≤ 60 KB gzip (Flip y escenas solo con `import()` donde se usan) |
| Fluidez | 60 fps en MacBook Air M1 y en un Android de gama media (Moto G) en las secuencias fijadas |
| Capas | Máximo 6 `backdrop-filter` visibles; `will-change` solo durante la animación |
| WebGL | Ninguno |

---

## 8. Rendimiento y SEO

### 8.1 Render y contenido

- **Astro SSG, MPA puro.** `astro.config.mjs`: `site: "https://ingeniak.mx"`, `trailingSlash: "always"`, `build.format: "directory"`, `build.inlineStylesheets: "auto"`, `prefetch: { defaultStrategy: "hover" }`, `@astrojs/sitemap` (excluye 404), `@astrojs/mdx` para el blog.
- **Todo el texto en el HTML inicial:** H1, copy, menús, breadcrumbs, FAQ, cifras con su valor final, guiones de los simuladores (como `<ol>`), alt de imágenes. El JS solo mejora. El índice del buscador es un JSON aparte (no contenido de página).
- `<html lang="es-MX">`, sin versión en inglés. Canonical a sí misma con barra final. Sin `hreflang`.
- Elementos decorativos (`hud`, palabra gigante, grano, auras, recortes, ramas) con `aria-hidden="true"`; imágenes decorativas con `alt=""`; placas con `alt` descriptivo en español (de `plates.json`).
- Demos con `data-nosnippet`. Sin texto dentro de imágenes.

### 8.2 Imágenes

| Tipo | Master | Exportaciones (AVIF + WebP) | Peso máximo AVIF |
|---|---|---|---|
| Placa de escritorio 16:9 (r1: todas) | 2752 × 1536 | 1280 · 1920 · 2560 · 2752 (se publican hasta `srcsetMax` del uso: 2752 o 1920, §12.2 R9) | 220 KB a 1920 · 320 KB a 2560 |
| Placa vertical 9:16 (solo `home-hero`) | 1536 × 2752 (upscale 2× del aprobado) | 640 · 828 · 1080 · 1536 | 120 KB a 1080 |
| Placa vertical 4:5 (r1: todas las demás) | 1536 × 1920 | 640 · 828 · 1080 · 1536 | 100 KB a 1080 |
| Recorte con alfa | Mismas dimensiones que su placa | 1920 · 2560 (+ móvil) | 160 KB |
| Still (mega menú, fotogramas, montaje) | Derivado de la placa | 360 · 640 | 35 KB a 640 |
| Copia de rack focus | Derivado, blur 40 horneado | 320 (WebP) | 8 KB |
| Aura (isotipo, ondas) | Derivado, desenfocado | 600 (WebP) | 25 KB |
| Grano | — | 256 (WebP) | 6 KB |

- Nombres: `/img/cine/{plateId}-{w}.avif|webp`, `-m-{w}` (vertical), `-cut-{w}` (recorte), `-still-{w}`, `-rack-320.webp`. Los masters viven en `src/assets/cine/` y **no** se publican; `scripts/plates.mjs` (sharp) exporta todo en el build. AVIF calidad 50–55, WebP 74.
- Todas las `<img>` con `width` y `height`, `decoding="async"`; `loading="lazy"` salvo la primera placa. `sizes` de escritorio: `(max-aspect-ratio: {ar}) {ar×100}svh, 100vw`; vertical: `100vw`.
- Video: `muted playsinline preload="none"`, póster, ≤ 2.5 MB, H.264; con alfa: HEVC `.mov` (Safari) + VP9 `.webm`. Nunca en móvil como fondo.
- **r1 · Excepción VSL:** `discovery-session-vsl.mp4` pesa 29.8 MB. Se recomprime a 720p H.264 (≈1.2–1.5 Mbps, AAC 96 kbps, `+faststart`), meta ≤ 12 MB, con sonido, **solo se descarga al hacer clic**, subtítulos `.vtt` en español y póster `discovery-vsl-poster`. Si pasa de 12 MB, se sirve con HLS desde un proveedor de video que no cargue nada antes del clic.

### 8.3 Estrategia de LCP

La placa de la primera `ImageSection` es el LCP de todas las páginas (salvo aviso legal). En el `<head>`, dos precargas excluyentes con la misma condición que el `<picture>`:

```html
<link rel="preload" as="image" type="image/avif" fetchpriority="high"
  media="(min-width: 768px) and (min-aspect-ratio: 5/6)"
  imagesrcset="/img/cine/home-hero-1280.avif 1280w, /img/cine/home-hero-1920.avif 1920w, /img/cine/home-hero-2560.avif 2560w"
  imagesizes="(max-aspect-ratio: 1.7917) 180svh, 100vw">
<link rel="preload" as="image" type="image/avif" fetchpriority="high"
  media="(max-width: 767px), (max-aspect-ratio: 5/6)"
  imagesrcset="/img/cine/home-hero-m-640.avif 640w, /img/cine/home-hero-m-828.avif 828w, /img/cine/home-hero-m-1080.avif 1080w"
  imagesizes="100vw">
```

- La placa LCP nunca tiene `opacity: 0`, `visibility: hidden` ni `display: none` (la firma y la mini firma la tapan con capas aparte).
- Solo Lexend se precarga. Ningún JS bloquea el render (módulos diferidos). Sin terceros al cargar (ni widgets de chat, ni mapas embebidos, ni etiquetas de marketing antes del consentimiento).
- Metas (p75, móvil 4G): **LCP < 2.5 s · CLS < 0.05 · INP < 200 ms**. Lighthouse móvil: rendimiento ≥ 90, SEO 100, accesibilidad ≥ 95. Medición de campo con Vercel Speed Insights (`web-vitals`).
- Caché (`vercel.json`): `/_astro/*`, `/img/*`, `/fonts/*`, `/fx/*` → `Cache-Control: public, max-age=31536000, immutable`.

### 8.4 SEO en página (de D, sin cambios salvo §0.3)

- Una keyword principal por URL (D §9), `title` ≤ 60 y meta ≤ 155 (D-sitemap.json), **un H1 único** por página.
- Bloque "¿Qué es…?" de 40–60 palabras al inicio de cada servicio, industria y artículo (`DefinitionBlock`).
- `FAQPage` idéntico al texto visible (banco de D §12; las preguntas "validar" no se publican sin aprobación).
- Enlazado interno de D §10 con anclas descriptivas; cada página enlaza a `/discovery/` y tiene su mensaje de WhatsApp único.
- **Redirecciones:** las 20 de `D-redirects.json` en `vercel.json` (301). 404 con `noindex`.
- `robots.txt` de la investigación SEO (§3.8 de `materiales/seo/investigacion-seo.md`), con `Sitemap: https://ingeniak.mx/sitemap-index.xml`.
- Imagen OG por página (1200 × 630) generada en el build con el still de su portada y su H1.

### 8.5 JSON-LD por plantilla (un `@graph` por página, `@id` estables)

| Plantilla | Tipos |
|---|---|
| T-HOME | `Organization` (`#organization`, completa: name, legalName Ingeniak Technology, LLC (r1: solo con confirmación escrita; si no, se omite `legalName`), logo, address Tlajomulco, email, telephone confirmado, `sameAs`, `brand` kain → app.kain.mx, `knowsAbout`) · `ProfessionalService` (`#localbusiness`: address, `geo` [POR CONFIRMAR], `openingHoursSpecification` [VALIDAR], `areaServed`, `priceRange` "Desde USD 997 al mes") · `WebSite` (`#website`, `inLanguage` es-MX) · `WebPage` · `FAQPage` |
| T-SERVICE / T-PLATFORM | `WebPage` + `BreadcrumbList` + `Service` (`provider` → `#organization`, `serviceType`, `areaServed` México y Latinoamérica; `offers` solo con "desde USD 997 al mes" si se decide mostrarlo) + `FAQPage` |
| T-INDUSTRY | `WebPage` + `BreadcrumbList` + `Service` con `audience` (`BusinessAudience` del sector) + `FAQPage` |
| T-CASE | `Article` (`author` Person del equipo, `datePublished`, `dateModified`, `about` → Service) + `BreadcrumbList` |
| T-HUB | `CollectionPage` + `BreadcrumbList` + `ItemList` de los hijos (+ `FAQPage` si tiene preguntas) |
| T-PRODUCT (`/kain/`) | `WebPage` + `Brand` + `SoftwareApplication` (`applicationCategory` BusinessApplication, `url` https://app.kain.mx/; sin `offers` ni `aggregateRating`) + `FAQPage` |
| T-METHOD | `WebPage` + `HowTo` con 5 `HowToStep` (Verify, Koncept, Transform, Operate, Rise; texto visible) + `FAQPage` |
| T-STACK | `WebPage` + `BreadcrumbList` + `FAQPage` |
| T-ABOUT | `AboutPage` + `Organization` completa + 6 `Person` (name, jobTitle, image, `worksFor`, `sameAs` LinkedIn [POR CONFIRMAR]) + `FAQPage` |
| T-LOCAL | `WebPage` + `ProfessionalService` (`#localbusiness`) + `FAQPage` |
| T-ARTICLE | `BlogPosting` (author Person, fechas, `wordCount`) + `BreadcrumbList` + `FAQPage` |
| T-FAQ | `FAQPage` + `BreadcrumbList` |
| T-CONVERSION | `WebPage` + `Service` con `Offer` de precio 0 (llamada gratuita) + `FAQPage` |
| T-CONTACT | `ContactPage` + `ProfessionalService` |
| T-404 | Ninguno (`noindex`) |

### 8.6 Guardas del build (fallan el deploy)

| Script | Qué valida |
|---|---|
| `scripts/check-cifras.mjs` | Recorre `dist/**/*.html`: falla si encuentra en texto visible un patrón de cifra comercial (`\d+(\.\d+)?\s?(%\|×\|x\b)`, "N citas", "N procesos", "N min", "USD N") fuera de un nodo con `data-metric` o `data-allow-number` (solo precio, fechas, horas, dirección, teléfono). El precio solo puede ser `PRICE_FROM`. |
| `scripts/check-seo.mjs` | `title` ≤ 60 · meta ≤ 155 · un H1 por página y único en el sitio · H1 = `sitemap.json` (texto normalizado) · mensajes de WhatsApp únicos · `FAQPage` = texto visible · ningún enlace interno roto · una `.lit` por página · `alt` presente en placas · 44 URLs en el sitemap (r1: = las páginas `indexable: true` sin puerta de publicación pendiente; un caso breve con `noindex` sale del conteo, de `sitemap.xml` y de `llms-full.txt`). |
| `scripts/check-escenas.mjs` | Cada placa usada existe en `plates.json` con ambas versiones, `alt`, anclas y zonas; texto dentro de `safe` y fuera de `subject` en los tamaños de §3.10; anclas a ±8 px; ningún `ImageSection` con fondo propio. |
| `scripts/check-contraste.mjs` | §2.1.1 sobre el píxel más claro bajo cada línea, en 4 tamaños. |
| `scripts/check-pesos.mjs` | Pesos máximos de §8.2 y que cada `<img>` tenga `width`/`height`. |
| `scripts/check-llms.mjs` | `llms.txt` contiene las 44 URLs (r1: las indexables vigentes), la expansión correcta de VKTOR™ y solo `PRICE_FROM`. |

### 8.7 `llms.txt` y GEO/AEO

- `/llms.txt` (resumen) y `/llms-full.txt` (texto de las 44 páginas indexables), generados en el build desde `sitemap.json`, `metrics.ts` y la ficha de la entidad.
- Estructura de `/llms.txt`:

```md
# Ingeniak
> Consultora de IA en Guadalajara, Jalisco (México). Diseña, implementa y opera agentes de IA para WhatsApp, CRM con Kommo
> (partner oficial en LATAM) y GoHighLevel, automatización con n8n y Make, paid media, sitios web, software a la medida y SEO
> para motores de IA. Sub-marca de agentes: kain (app.kain.mx). Inversión desde USD 997 al mes.

## Ficha
- Sede: Av. Punto Sur 312, Tlajomulco de Zúñiga, Jalisco 45640 · contacto@ingeniak.mx · WhatsApp +52 33 2101 7799
- Metodología VKTOR™: Verify (verificamos tu operación) · Koncept (diseñamos el concepto) · Transform (transformamos) · Operate (operamos junto con tu equipo) · Rise (hacemos crecer los resultados)
- +73 sistemas en producción · 7 países: México (sede), Estados Unidos, Colombia, Argentina, España, Costa Rica y Ecuador
- Primer paso: Discovery Session, 30 min, 1:1, Google Meet, sin costo → https://ingeniak.mx/discovery/

## Resultados (datos internos de Ingeniak, octubre de 2026)
- 3.2× más citas en 90 días y respuesta de 8 min a 12 s (clínica dental, Monterrey) → /casos/clinica-dental-monterrey/
- (una línea por cifra de metrics.ts, con su caso)

## Servicios · ## Industrias · ## Casos · ## Empresa · ## Recursos
- [Título](URL): descripción de una línea (las 44 URLs)
```

- La ficha técnica visible (inicio ESC 12, Nosotros, footer), el JSON-LD y `llms.txt` repiten **los mismos datos**, con la misma redacción.

---

## 9. Producción de imágenes

### 9.1 Proceso (receta Magnific aprobada, `materiales/magnific/v2/RECETA.md`)

1. **Referencias que siempre se adjuntan:** Kain `s7TThool8e` (`recortes_png/kain-presenta.png`) + `kain-body-*.jpg` (presenta, brazos, toca) · escena de estilo `5jAAdVBKxe` (`kain-01-hero.png`) · isotipo de cristal `1lnnyc0r4r` (si aparece el logo) · hero aprobado `jUccthULD0` (para mantener la serie). Proyecto Magnific: "Ingeniak Web v2".
2. **Escritorio:** Nano Banana Pro, 2–3 variantes; la elegida pasa por `images_upscale` creativo 2× (ThreeDRenders, preset subtle, creativity −2, resemblance 6).
3. **Vertical:** mismo modelo, con la imagen de escritorio elegida como **primera referencia** ("camera pulled far back", mitad superior vacía). **No usar `images_expand`** (mete texto basura).
4. **Derivados:** recorte con `remove_background` (si la escena usa `cutout`), placa limpia con inpainting (solo si habrá parallax de dos capas), gemela B como **edición** de A.
5. **Registro:** medir anclas, zonas `safe` y `subject` en `/dev/registro/` y guardarlas en `plates.json`.
6. **Aprobación:** una sola persona aprueba todas las placas con la lista de §9.4. Se rechaza de inmediato cualquier Kain con antenas, ojos, orejas o asterisco distintos.

### 9.2 Lista de placas: cambios frente a D §14

**r1: la lista vigente de placas es `IMAGENES-v2.json` / `IMAGENES-v2.md` (61 placas que cubren 149 secciones; ya consolidó D §14 y esta tabla).** Si esta tabla y el plan de imágenes difieren, manda el plan; las placas de cada sección ya están escritas en `D-sitemap.json → sections[].plate`. Se conserva la tabla como historia de las decisiones. Cambios frente a D §14:

| Cambio | Placas | Motivo |
|---|---|---|
| `home-hero` = **aprobado** (`hero-home-desk-2x.jpg` 16:9 + `hero-home-movil-d.png` 9:16 con upscale 2×) + **recorte** + placa limpia (P1) | 0 nuevas, 2 derivados | F3; firma en su pantalla del pecho |
| `home-problema` → gemelas **`home-problema-a`** (ámbar) / **`-b`** (cian, edición de A) | +1 | ESC 03 |
| **`home-sistema-1…5`** (16:9 + 4:5): una estación por placa, mismo horizonte (66 % del alto) y mismo riel de luz a ras de piso; Kain en cada una con su pose y una **superficie de cristal en blanco** para la UI de la estación | +5 (sustituyen la panorámica de 9600 px y los 5 recortes de pose) | F4 |
| `home-kain`: el teléfono de cristal flotante debe tener la **pantalla plana, frontal y vacía** (≥ 6 % del ancho) | 0 | UI registrada (F10) |
| **`metodologia-hero`** con 5 losas y Kain en la quinta + **recorte** de las mismas dimensiones | +1 recorte | `GhostWord` "VKTOR" (F19) |
| **`cta-amanecer`** sustituye a `cta-kain-saluda` y `cta-kain-senala` (esta última = espejo) | 0 netas | F14 |
| `cta-duena-tranquila` y `cta-equipo` reiluminadas al mismo amanecer frío | 0 | Unidad del cierre "Rise" |
| **Casting de servicios (F11):** la portada de cada servicio pasa a Kain trabajando con su superficie de cristal en blanco. Donde D ya tiene una escena intermedia con Kain (agentes `si-no`, CRM `crm-vivo`, Kommo `agente-chat`, GHL `calendario`, n8n `caso`, web `este-sitio`, SEO `como-medimos`, branding `kain-ejemplo`), **ese brief se re-compone como portada**; la portada de persona de D pasa a la sección `senales`. Paid media, software y consultoría (sin escena de Kain en D) necesitan una portada nueva | +3 (si el cliente aprueba) | Efecto franquicia |
| `caso-*-hero`: persona **siempre a la derecha**. Las de D con sujeto a la izquierda (retail, HoReCa) se espejan con `mirror: true` (no tienen texto); solo se regeneran si el espejo se ve forzado | 0 | Reutilización en el inicio |
| `caso-dental-hero` a **hora azul** (no atardecer cálido) | 0 | Ámbar solo para dolor |
| **`riel-servicios`** (16:9, sin sujeto: piso con un riel de luz y 5 nodos) para `SystemFlow` de servicios | +1 | §5.2 |
| `metodologia-fases` (5 escenas con personas, una por fase) se mantiene para `VktorSequence` | 0 | — |
| Stills, rack focus, auras | 0 generaciones (exportación automática) | — |

**Orden de producción:** `home-hero` (registro y firma real) → `cta-amanecer` → gemelas → 5 estaciones → `home-kain` → `metodologia-hero` + recorte → portadas de agentes, Kommo, consultoría, `/kain/` y Discovery → resto según D.

### 9.3 Prompts (inglés)

> **r1:** los prompts vigentes, ya expandidos por placa, están en `IMAGENES-v2.json` (`prompt.desktop` / `prompt.mobile`), en **16:9** y **4:5**. Los de abajo quedan como plantilla (ya corregidos a 16:9). Las antenas **no** llevan puntas brillantes (las referencias oficiales no las tienen).

**Bloque de personaje `{KAIN}`:** `KAIN — the small friendly white robot from the reference images (exact same design: round glossy white helmet head, two thin silver antennas (no glowing tips), chrome ear pieces, dark glossy visor with two glowing cyan oval eyes and a small cyan mouth line, square dark chest screen with a glowing cyan asterisk, white articulated body with dark grey joints), FULL BODY, feet visible`

**Escritorio con Kain (16:9):**
```
Cinematic 16:9 wide shot, premium 3D advertising render. {KAIN}, standing in the [RIGHT|LEFT] third of the frame
(body centered at [70|30]% of frame width), three-quarter view turned toward the empty side, the square chest screen
facing the camera, crisp and clearly visible. [ACTION, e.g. presenting with an open palm toward the empty side /
holding a blank flat glass phone whose screen faces the camera, perfectly empty, no interface]. [SCENE]. Dark glossy
reflective floor at 84% of frame height with the robot's reflection. Lighting: a single cyan (#00E5FF) and electric
blue (#0055FF) rim light from behind, soft indigo (#455DFF) fill entering from the empty side. The [LEFT|RIGHT] 52%
of the frame is clean negative space: smooth deep navy (#0A1F4C) fading to near-black (#03040B), faint haze, no
objects, no light sources, no particles. All four edges fade to near-black. 50mm lens, f/2.8, subtle film grain, HDR.
No text, no letters, no numbers, no logos, no UI.
```

**Escritorio con persona (16:9):**
```
Cinematic 16:9 editorial photograph. A Mexican [ROLE] ([AGE]) in the [RIGHT|LEFT] third of the frame ([64–78|22–36]%
width), [ACTION, looking toward the empty side or at a device whose screen is a soft cyan glow with no UI]. [SCENE],
background out of focus. Cool rim light in cyan and blue, blue monochrome grading, the shadow side of the person
dissolves into the dark background, no hard edges. The [LEFT|RIGHT] 52% is clean deep navy shadow with no objects.
50mm, f/2.0, fine grain. No text, no logos, no readable screens. Illustrative person, not a real client.
```

**Vertical (9:16 Kain / 4:5 persona), con la de escritorio como primera referencia:**
```
Vertical [9:16|4:5] wide establishing shot of the same scene as the first reference image, camera pulled far back.
The subject (identical to the references) stands full body and small in the frame: head at [52|45]% of the frame
height and feet at [90|86]%. The entire upper half of the image, from the top edge down to 50%, is an empty, deep
dark navy-black void (#03040B) with only a very faint blue haze. The bottom 10% is dark floor fading to near-black.
No text, no letters, no words, no logos, no interface, no panels, no frames.
```

**Estación del sistema (16:9):** `Cinematic 16:9 night scene, premium 3D render, part of a series of five. A dark glossy reflective floor with a thin glowing cyan light rail at floor level crossing the whole frame; horizon line at 66% of frame height. {KAIN} in the right third [POSE], next to [STATION OBJECT, blank glass surface facing the camera, no UI]. The left 45% is clean deep navy negative space. Single cyan and electric-blue light, edges fade to near-black. No text, no letters, no numbers, no logos, no readable UI.` Objetos: Atraer = pila de paneles de cristal flotantes con imágenes abstractas desenfocadas · Atender = teléfono de cristal alto con la pantalla vacía · Organizar = cinco carriles verticales de luz con tarjetas en blanco · Automatizar = constelación de nodos cuadrados unidos por ramas de luz · Medir = pantalla curva ancha con barras abstractas que convergen en un punto.

**Gemela B (edición de A):** `Edit this exact image. Keep the camera, framing, shop, counter, shelves and shadows identical. Remove the man; the stool stays empty. The smartphone remains on the counter but now glows cyan (#00E5FF). Add {KAIN} standing beside the counter where the man was (30–40% width), lit by a cyan rim light from behind. Replace all amber light with cool cyan and blue. Right side stays near-black. No text.` QA: A y B superpuestas en `difference` → nada fuera de la zona editada se desplaza más de 4 px.

**Amanecer (`cta-amanecer`):** prompt de `concepto-cinematic.md` §8 #8 (horizonte curvo con filo de amanecer frío cian-blanco, cresta al 70 %, haz vertical, Kain saludando en el tercio derecho, 52 % izquierdo de cielo limpio, sin colores cálidos).

**Negativo común:** `text, letters, numbers, watermark, logo, UI with readable text, black robot, graphite robot, extra robots, cartoon, flat illustration, cropped feet, cropped antennas, human teeth or mouth on the robot, warm light (except pain scenes), lens flare on the text side, busy background on the text side.`

### 9.4 Lista de aceptación de una placa

- [ ] Kain idéntico a las referencias, de cuerpo completo, pies y antenas dentro del cuadro (escritorio y vertical).
- [ ] Penumbra de texto limpia en el lado correcto (≥ 50 % del ancho; mitad superior en la vertical).
- [ ] Una sola luz cian/azul; ámbar solo en placas de dolor.
- [ ] Sin texto, números, logos ni UI legible. Superficies de cristal **vacías** donde va UI.
- [ ] Bordes que caen a #03040B; piso o niebla en el último 10–16 %.
- [ ] Pantalla del pecho de frente (≥ 3 % del ancho) en placas con firma o ancla `pecho`.
- [ ] Personas: ilustrativas, sin nombre, en duotono compatible; fotos del equipo sin alterar rostros.
- [ ] Registro completo en `plates.json` y contraste aprobado por `check-contraste.mjs`.

---

## 10. Criterios de aceptación (QA)

Tamaños de prueba: **360 × 740 · 390 × 844 · 768 × 1024 · 1024 × 1366 · 1024 × 768 · 1280 × 720 · 1440 × 900 · 1920 × 1080 · 2560 × 1080** (r1: se suman el Android chico y la tablet horizontal 4:3), en Chrome, Safari y Firefox. Las capturas se hacen con Chrome headless (`--headless=new --screenshot`). **r1:** en la prueba de la revisión, `--window-size=390,844` produjo una captura de 390 px recortada de un layout más ancho (no activó la media query móvil); las capturas móviles se toman con la página dentro de un `<iframe>` del ancho exacto, como en `ESPEC-v2-prueba-r1-390.jpg`, o con emulación de dispositivo (Puppeteer/Playwright).

**Requisito del cliente (`ImageSection`):**
- [ ] En ningún tamaño se ve una arista recta de imagen; el último píxel de cada escena es `#03040B`.
- [ ] Ningún texto ni chip toca la caja `subject`; ninguna tarjeta tapa al sujeto en móvil; el CTA de la portada móvil queda en el primer pantallazo por encima de la cabeza del sujeto.
- [ ] Kain y las personas nunca se cortan (pies y antenas) a 2560 × 1080.
- [ ] Anclas a ±8 px de su objetivo (`?anchors=1`).
- [ ] Contraste AA en todo texto sobre imagen (`check-contraste.mjs`).
- [ ] Ninguna sección pinta fondo; cero cajas detrás del copy.

**Movimiento:**
- [ ] La firma termina en un estado idéntico a la versión reducida (`?replay` a los 5 s); se salta con cualquier gesto; la red de seguridad muestra la portada a los 3.2 s sin JS.
- [ ] Cero pins en móvil y tablet táctil; cero scroll horizontal fijado; máximo 2 pins por página; "Saltar escena" funciona con teclado.
- [ ] Con movimiento reducido todo el contenido es visible y en orden.

**Conversión y contenido:**
- [ ] Nunca dos botones azules visibles a la vez (390 × 844 y 1440 × 900).
- [ ] Toda cifra comercial pasa por `metrics.ts` (`check-cifras.mjs` en verde); toda demo dice `SIMULACIÓN`.
- [ ] Sin testimonios, logos de clientes, premios ni precios fuera de `PRICE_FROM`; sin Victor Ocampo; Kain siempre blanco; GoHighLevel nunca como partner.
- [ ] Ninguna zona de más de 40vh sin luz (sujeto, aura, horizonte o UI).

**Navegación y SEO:**
- [ ] Mega menú, hoja móvil y ⌘K operables solo con teclado; `aria-expanded`, foco visible y Esc.
- [ ] Las 6 guardas de §8.6 en verde; Lighthouse y Core Web Vitals en meta (§8.3).
- [ ] Corte por coincidencia en Chrome y Safari; navegación normal en Firefox.

---

## 11. Pendientes con el cliente

Además de los pendientes de D §15 (teléfono único, detalles de los 5 casos, historia y razón social, horario y `geo`, LinkedIn del equipo, ficha de partner de Kommo, formulario de contacto, autores de artículos, preguntas "validar"):

1. **Casting de las portadas de servicio** con Kain trabajando (F11): cambia lo asignado en D §14 y suma 3 placas.
2. **Narrativa del "turno de noche"** (horas en el HUD del inicio, de 23:47 a 06:00) y la persona generada en ámbar en la escena del problema.
3. **CRM del caso dental** (Kommo o GoHighLevel) para el diagrama de implementación y el panel de la estación "Organizar".
4. **Frase del manifiesto** ("No hacemos marketing. Construimos sistemas que generan y convierten clientes automáticamente.") y la firma del footer ("Construimos empresarios libres, no héroes cansados.").
5. **Hora azul** en lugar de atardecer cálido para el caso de Monterrey, y **espejo** de placas de industria en el selector.
6. Si el caso e-commerce CDMX es el mismo cliente del tablero "1 vista · 7 fuentes" (define si se juntan en una sola "cifra visual").
7. Precios de licencias Kommo en `/kommo/` (por defecto no se publican).
8. Presupuesto para el clip de Kain con alfa en `/kain/` (P1) y para la placa limpia del hero (parallax de dos capas).
9. **r1:** los pendientes nuevos de la revisión crítica (copy final por página, puertas de publicación de casos, razón social, sesión de fotos, VSL, medición y consentimiento) están en §12.5.

---

## Archivos

| Archivo | Qué es |
|---|---|
| `ESPEC-v2.md` | Este documento (fuente única de verdad) |
| `ESPEC-v2-prueba-imagesection.html` | Página de prueba con el CSS de `ImageSection` y la portada del inicio copiado de esta espec, sobre la placa aprobada (se abre desde `materiales/v2/`) |
| `ESPEC-v2-prueba-1440.jpg` · `ESPEC-v2-prueba-390.jpg` | Capturas de esa prueba a 1440 × 900 y 390 × 844 |
| `D-sitemap.json` · `D-navegacion.json` · `D-redirects.json` | Datos de las 45 páginas, navegación y 301 (con los cambios de §0.3) |
| `concepto-cinematic.md` §8 | Composición detallada y prompts de las 8 escenas firma (se aplican con los cambios de §9.2) |
| `IMAGENES-v2.json` · `IMAGENES-v2.md` | r1: lista vigente de placas (61), prompts, referencias, usos, `srcsetMax` y respaldos de lanzamiento |
| `ESPEC-v2-prueba-imagesection-r1.html` · `ESPEC-v2-prueba-r1-{390,1024x768,1440,2560x1080}.jpg` | r1: la misma prueba con las correcciones de §12 (sumario, CTAs, línea guía en móvil, pie de foto) |

---

## 12. Revisión crítica

> **r1 · 18 de octubre de 2026.** Revisión de completitud y calidad de toda la carpeta `materiales/v2/` (A, B, C, D, los tres conceptos, esta espec y el plan de imágenes) contra el pedido del cliente: sitio **premium y disruptivo**, **multipágina muy completo**, la mejor UX/UI de una agencia de IA y, sobre todo, **secciones de texto + imagen donde la imagen es el fondo de la sección, con el sujeto de un lado y el texto y los botones del otro, sin que se lean como dos bloques**.
> **Precedencia:** esta sección manda sobre §0–§11 donde las contradiga. Las contradicciones directas ya se corrigieron en su lugar (marcadas con "r1"); las reglas nuevas viven aquí (R1–R14). `D-sitemap.json`, `D-navegacion.json` e `IMAGENES-v2.json/.md` ya tienen aplicados los cambios (§12.4).

### 12.1 Diagnóstico

Tipo: **F** falta · **C** contradicción · **V** vago · **R** riesgo · **B** error verificado en navegador.

| # | Tipo | Hallazgo | Evidencia | Arreglo |
|---|---|---|---|---|
| 1 | C | Proporción de escritorio: §0.2 F3 pedía 21:9 para placas nuevas; el plan de imágenes produce todo en 16:9. Con 21:9, a 1440 × 900 y 1024 × 768 se recortaba entre el 31 % y el 43 % del ancho. | F3, §3.3, §8.2, §9.3 vs `IMAGENES-v2.md` §1-1 | **16:9 en todas** (F3, §3.3, §8.2, §9.3). Probado a 1024 × 768 y 2560 × 1080 (`ESPEC-v2-prueba-r1-*.jpg`). |
| 2 | C | Proporción móvil: §3.6 pedía 9:16 en portadas con Kain y 4:5 en el resto; el plan usa 4:5 en todo salvo `home-hero`. | §3.6, §8.2 vs IMAGENES §1-2 | **4:5 en todas**, 9:16 solo `home-hero` (§3.6, §8.2). |
| 3 | C | Nombres de placa en §5 que no existen en el plan (`agentes-whatsapp-hero`, `agentes-whatsapp-cliente`, `caso-dental-resultado`, `home-equipo`, `team-hero`) y lados distintos (equipo a la derecha en §5.1, manifiesto de Nosotros a la izquierda). | §5.1, §5.2, §5.4, §5.9 vs mapa de cobertura de IMAGENES §7 | Alineados en su lugar; **la placa de cada sección vive en `D-sitemap.json → sections[].plate`** y la lista vigente es IMAGENES (§9.2). |
| 4 | C | Casting de industrias (F11 decía "personas del sector"; el plan usa Kain + persona secundaria), Contacto (asesora generada vs Kain), Nosotros (`team-hero-CyZMMz70.jpg`, que **no es el equipo**: son 4 siluetas genéricas) y fases de VKTOR (5 placas vs una sola placa). | F11, §5.7, §5.9, §5.12 vs IMAGENES §1 | Se adopta el plan (F11, §5.7 con pin +250 %, §5.9, §5.12). |
| 5 | C | Antenas de Kain "with glowing cyan tips" en el prompt de §9.3; las referencias oficiales no las tienen. | §9.3 vs IMAGENES §1-5 y el hero aprobado | Corregido en §9.3. |
| 6 | C | §0.3 ordenaba cambiar `D-sitemap.json` antes de construir y **no se había aplicado**: H1 viejo del inicio, briefs móviles con "sujeto arriba" (lo contrario de F2), cierres `cta-kain-saluda/senala`, sin campo `plate`, sin `folio`. | `D-sitemap.json` | Aplicado (§12.4). |
| 7 | C | `D-navegacion.json` tenía Servicios en 3 columnas; §4.2 los ordena por las 5 etapas. La tarjeta del mega menú apuntaba a `menu-kain`, que no tiene placa en el plan. | `D-navegacion.json` | Reescrito por etapas, con `metricId` y still existente (§12.4). |
| 8 | C | ESPEC agrega "Señales" a los 11 servicios, pero consultoría, CRM y paid media ya tenían `dolores`: habrían salido dos listas de dolor seguidas. El orden del inicio en D tampoco coincidía con §5.1. | `D-sitemap.json` | `dolores` → `senales` en esos 3; inicio reordenado (§12.4). |
| 9 | B | En la portada del inicio, "+340%" se encimaba con "conversiones" (`grid-template-columns: 5.5ch` medido con la fuente de cuerpo). | `ESPEC-v2-prueba-1440.jpg` | Subgrid `max-content` (§5.1). Verificado. |
| 10 | B | A 2560 × 1080 el sumario quedaba pegado al borde (`left: var(--safe-x)`), 440 px a la izquierda del H1. | Prueba r1 a 2560 × 1080 | Alineado a `.frame` (§5.1). Verificado. |
| 11 | B | En móvil la microcopia "30 min · 1:1 · Google Meet · sin costo" quedaba debajo del botón de WhatsApp, no del primario. | `ESPEC-v2-prueba-390.jpg` | Grupo `.cta-p` (§5.1). Verificado. |
| 12 | B | En móvil la línea guía y el nodo del pie de foto se pintaban con coordenadas de escritorio **sobre la cabeza de Kain** (el pie sí se ocultaba; la línea no). | `ESPEC-v2-prueba-390.jpg` (punto cian junto a la antena) | `data-m="none"` en la línea y el nodo + regla R4 (§3.6, §3.8). Verificado. |
| 13 | R | El pie de foto decía "Ejemplo ilustrativo:" justo antes de una **cifra real** (8 min → 12 s): se lee como dato inventado. | §3.8 | "El agente de IA de Ingeniak (render). En una clínica dental de Monterrey…" (§3.8). |
| 14 | R | La razón social "Ingeniak Technology, LLC" se imprimía en el footer y en `legalName` como si estuviera confirmada; D §15 la tiene pendiente (el sitio actual dice "Radik Soluciones"). | §4.8, §8.5 | Solo con confirmación escrita (§4.8, §8.5, §12.5). |
| 15 | F | **No existe el copy final.** Los `spec` de `D-sitemap.json` son briefs (de 27 a 478 palabras por página); los 6 artículos (≈ 12,300 palabras en total según D) no tienen cuerpo; 24 secciones llevan `[POR CONFIRMAR]`, `[VALIDAR]` o `[POR DECIDIR]`. Varias filas de §5 dicen "Copy de D" donde D solo trae un brief. Es la causa más probable de "páginas sin contenido real". | `D-sitemap.json`, D §13 | R1 y R2 (copy por página, guardas de pendientes, mínimo de palabras). |
| 16 | R | **Casos delgados.** Los 5 casos tienen pendientes ficha, punto de partida e implementación; sin eso cada caso es una cifra con decorado. | D §15, `D-sitemap.json` | Puerta de publicación por caso (R2, campo `publishGate`). |
| 17 | R | **Industrias casi iguales.** 8 páginas con la misma plantilla; 4 sin caso propio. Riesgo de contenido duplicado y de que el cliente lo perciba como relleno. | §5.3 | Contenido único mínimo y guarda de similitud (R2). |
| 18 | V | **Composición móvil con texto largo.** En modo `top`, si el texto crece, la sección "crece hacia arriba sobre `--ink`": con listas, pestañas o ChatSim, el usuario ve un bloque de texto largo y luego una imagen abajo, que es exactamente "dos secciones separadas". No había tope. | §3.6 | Presupuesto de texto y modo `split` (R3). |
| 19 | R | **Imágenes en caja.** El carrusel móvil de 8 tarjetas de industria, los `Still` con texto abajo y el VSL en un reproductor encajonado repiten lo que A §6 señala como causa del rechazo ("todo encajonado"). | §5.1.1, §2.11, §5.11 | R7 (lista + placa en móvil, `VideoScene`, stills con texto dentro de la imagen). |
| 20 | R | **Póster del VSL inservible como fondo:** trae el título horneado con una errata visual ("¿qué sedetiene?") y subtítulos quemados. El VSL pesa 29.8 MB (la regla de §8.2 era ≤ 2.5 MB) y no tiene `.vtt`. | `materiales/discovery/` | Placa nueva `discovery-vsl-poster` y codificación del VSL (R14, §8.2). |
| 21 | R | **Peso de imagen.** Con `sizes` de hasta 180svh y densidad 2×, a 1440 px el navegador pide la exportación de 2752 px en todas las escenas: ≈ 4.4 MB de imagen al recorrer el inicio. No había presupuesto por página. | §3.5, §8.2 | `srcsetMax` por uso + presupuesto por página (R9). |
| 22 | R | **6 portadas en P2** (páginas web, SEO, branding, tecnologías, un artículo y la 404) y 9 escenas P2 sin respaldo: el sitio podía salir con secciones sin imagen. | IMAGENES §6 | Toda portada es P1; respaldo `launchFallback` para cada P2 (R5). |
| 23 | R | **La misma placa dos veces en la página** en 8 servicios ("regreso al set") sin un encuadre distinto: se ve repetida, no como plano secuencia. | IMAGENES §1-12 | `push` obligatorio desde `--cam 1.35` (R5, `uses[].push`). |
| 24 | R | **Equipo:** la composición sale de retratos de 900 px con placa de nombre y una "X" de fondo; el resultado tiende a collage, justo en /nosotros/, la página que más "empresa establecida" debe transmitir. | IMAGENES ficha 12 | Sesión de fotos como requisito P1 (R6). |
| 25 | F | **Medición y consentimiento.** Una agencia que vende paid media no definía eventos de conversión, atribución hacia `agenda.ingeniak.tech`, ni banner de cookies (hay visitantes de España, donde aplica el RGPD). | §8.3 solo dice "sin terceros antes del consentimiento" | R10. |
| 26 | F | **Accesibilidad:** atajo "/" de una tecla (WCAG 2.1.4), ticks del riel de 14 × 1 px (2.5.8), foco tapado por encabezado y barra móvil (2.4.11), `alt` descriptivo repetido en 28 cierres iguales, sin regla para `forced-colors`. | §4.3, §4.6, §4.7, §8.1 | R11 (y §4.3 corregido). |
| 27 | V | **QA incompleta:** no se probaba la tablet horizontal 4:3 ni el Android de 360 px; la captura móvil con `--window-size=390` no activa la media query en esta máquina. | §10 | §10 actualizado. |
| 28 | R | **"Muy completo" sin inventar:** el sitio actual tiene 12–14 artículos; v2 sale con 6. El cliente puede percibir "menos empresa" en Recursos. | A §5-7 | Hoja de ruta de contenido real (R12), sin páginas vacías en el lanzamiento. |
| 29 | R | **Kain en 43 de 61 placas.** Es el efecto franquicia buscado, pero con poses repetidas se vuelve papel tapiz. | IMAGENES §Resumen | R13 (variedad de pose y prop por página). |
| 30 | V | Las guardas contaban "44 URLs" fijas; con casos breves en `noindex` el conteo cambia. FAQ y HowTo se presentaban como si dieran resultados enriquecidos. | §8.5, §8.6 | R8 y §8.6 corregido. |

**Lo que se revisó y queda bien:** un solo CTA primario y su promesa; las 11 cifras con `metrics.ts` y guarda; texto 100 % en HTML; el recetario de fusión (§3.9) y las 12 reglas de aceptación (§3.11); el sistema de cristal de 3 niveles; pins solo en escritorio y nunca horizontales; reduced motion con el mismo contenido; redirecciones sin comodines. El cierre `cta-amanecer` en 28 páginas se mantiene a propósito (es la "firma de cierre", se cachea una sola vez y alterna espejo); su `alt` pasa a vacío (R11).

### 12.2 Reglas nuevas (normativas)

**R1 · Copy final por página.** Los `spec` de `D-sitemap.json` son **briefs**. El texto publicable vive en `src/content/paginas/<id>.json` (una clave por id de sección, en el mismo orden que `sections[]`) y los artículos en `src/content/blog/<slug>.mdx`. Cada archivo lleva `estado: borrador | revisión | aprobado`, `autor` y `aprobadoPor` (persona del cliente). Solo `aprobado` se publica. El campo `copy` de cada página en `D-sitemap.json` dice el mínimo de palabras visibles de su plantilla (sin contar menú, footer ni FAQ compartidas): inicio, servicios y plataformas 900 · industria 750 · producto y metodología 700 · local 700 · caso 600 · stack, nosotros y conversión 600 · hub 350 · artículo 1,400 · FAQ 1,500 · contacto 200.

**R2 · Puertas de contenido (fallan el build).**
- `scripts/check-pendientes.mjs`: falla si en `dist/**/*.html` aparece `[POR CONFIRMAR`, `[VALIDAR`, `[POR DECIDIR`, `TODO`, `lorem`, `XX` o un `href="#"`.
- `scripts/check-contenido.mjs`: palabras visibles ≥ `copy.minWords`; similitud entre páginas hermanas (industrias entre sí, servicios entre sí) con shingles de 5 palabras, Jaccard ≤ 0.35 sin contar FAQ compartidas ni cifras.
- **Industrias:** cada una con su jornada (`DayTimeline`) propia, su guion de `ChatSim` propio, sus 6 tareas y al menos 4 preguntas propias. Las 4 sin caso llevan la "Nota del editor" y enlazan al caso más cercano con su sector escrito.
- **Casos (`publishGate`):** se publican completos e indexables cuando ficha, punto de partida e implementación están confirmados por escrito. Si no, salen como **caso breve** (portada, ficha solo con lo confirmado, `CaseFigure`, "qué puedes replicar", relacionados y cierre) con `noindex,follow`, fuera de `sitemap.xml` y de `llms-full.txt`; el hub y el inicio los siguen enlazando. Nunca se rellena un dato.

**R3 · Presupuesto de texto móvil y modo `split`.** A 390 × 844, en modo `top`, del borde superior de la sección a la cabeza del sujeto caben como máximo **1.1 pantallas** de texto (≈ 930 px). Si el contenido no cabe, la sección usa `mobile: 'split'`: arriba solo el **intro** (eyebrow, H2, lede de ≤ 40 palabras y CTAs); después la placa con el sujeto; y el resto (listas de más de 4 puntos, pestañas, `ChatSim` en línea, créditos) en el slot `more`, que empieza **48 px dentro de la disolución inferior** de la placa, dentro de la misma `<section>`. En escritorio `more` sigue en la misma columna de texto. `check-escenas.mjs` mide el alto y falla si se pasa sin `split`. Esqueleto: las capas registradas van dentro de `.is__stagebox`, absoluta en escritorio y en flujo en `split`.

```css
.is__stagebox{position:absolute;inset:0}                                   /* escritorio y modo top: igual que hoy */
@media (max-width:767px),(max-aspect-ratio:5/6){
  .is[data-m="split"]{padding-bottom:calc(var(--seam) + var(--s-5))}
  .is[data-m="split"] .is__stagebox{position:relative;inset:auto;height:var(--plate-h);
    margin-top:calc(var(--plate-h) * -.36)}                                  /* el vacío superior de la placa queda bajo el final del intro */
  .is[data-m="split"] .is__stagebox > .is__layer{inset:0 auto auto calc((100% - var(--plate-w)) / 2)}
  .is[data-m="split"] .is__more{position:relative;z-index:1;margin-top:calc(var(--s-7) * -1);padding-inline:var(--safe-x)}
}
```

Secciones que nacen en `split`: inicio 06 (Kain), servicios `senales`, `/kain/#si-no`, `/discovery/#para-quien` y toda escena con `ChatSim` en móvil. El modo `below` queda solo para escenas con una lista corta.

**R4 · Anclas por proporción.** Toda pieza anclada (`.anchor`, `.leader`, nodos, UI registrada, etiquetas de escalones) declara coordenadas para la placa de escritorio (`--ax/--ay`) **y** para la vertical (`--ax-m/--ay-m`), o lleva `data-m="none"` y su versión en línea dentro del texto. `plates.json` guarda ambos juegos; `check-escenas.mjs` falla si falta uno; la capa `?anchors=1` también se revisa a 390 × 844.

**R5 · Prioridades, respaldos y regreso al set.** Toda portada es **P1** (bloquea el lanzamiento): ya suben `paginas-web-hero`, `seo-hero`, `branding-hero`, `tecnologias-hero`, `art-agente-chatbot-hero` y `404-hero` (52 P1 · 9 P2). Cada placa P2 tiene `launchFallback` en `IMAGENES-v2.json` (y copiado en `sections[].plate`): `dolor-anuncios` → `dolor-operacion`; `ind-*-kain-sector` → `home-sistema-2-atender` en espejo. El componente usa el respaldo si el archivo de la placa no existe y el build lo avisa; si no hay ni placa ni respaldo, falla. **Regreso al set:** cuando una escena intermedia repite la placa de su portada, entra ya en `--cam 1.35` hacia la superficie de cristal y llega a 1.6 (`uses[].push`), con otra UI encima: nunca se ve dos veces el mismo encuadre en una página.

**R6 · Sesión de fotos del equipo (requisito P1).** 6 personas, 3/4 de cuerpo, fondo negro continuo, luz principal suave + contraluz cian desde atrás, lente 50 mm a la altura de los ojos, 2 poses por persona (frente y 3/4 hacia el lado del texto), ropa lisa negra o navy, sin placas de nombre. Con ese material se componen `equipo-real` y `cta-equipo` y las fotos de `TeamCredits`/`AuthorCard`. Hasta tenerla, `/nosotros/` solo usa la composición con los retratos actuales si una persona de Ingeniak la aprueba explícitamente como "no se ve collage"; si no, la portada de Nosotros usa `nosotros-manifiesto` (Kain) y el equipo baja a `TeamCredits`.

**R7 · La imagen nunca va en caja.**
- `Still` (relacionados, hubs, blog, mega menú): el título, la etiqueta y la cifra van **dentro** de la penumbra del still (abajo a la izquierda), con la misma máscara a `--ink`; no hay bloque de texto debajo de la imagen. Máximo una fila de 3 stills por página fuera de los hubs.
- Industrias en móvil: lista de 8 filas sobre una sola placa a sangre (§5.1.1). **Ningún carrusel de tarjetas con imagen** en todo el sitio.
- `VideoScene` (`/discovery/#video`): `ImageSection` `subject-center` con la placa `discovery-vsl-poster`; H2 abajo a la izquierda y botón de reproducir abajo a la derecha; el video se abre en `<dialog>` a pantalla completa. Nunca un reproductor con radio y borde dentro de la página.
- `ProductWindow` (capturas de app.kain.mx) solo sobre placa o aura, nunca sobre negro plano.

**R8 · SEO, GEO y AEO.**
- Conteos de las guardas = páginas `indexable: true` sin puerta pendiente (§8.6 corregido). Un caso breve en `noindex` sale de `sitemap.xml`, `llms.txt` y `llms-full.txt`, pero se queda en el índice de ⌘K.
- `FAQPage` y `HowTo` se mantienen porque los usan los motores de respuesta, pero **no se promete** resultado enriquecido en Google (hoy los limita a muy pocos sitios).
- **Autoría:** mientras no se confirme quién firma cada artículo, `author` es la `Organization` y el crédito visible dice "Equipo de Ingeniak"; la `AuthorCard` aparece solo con persona confirmada. Nunca un nombre sugerido.
- `dateModified` y `lastmod` salen del historial real del contenido, no de la fecha del build.
- Cada industria enlaza a ≥ 3 servicios y a ≥ 1 caso; cada caso a su servicio y a su industria; cada artículo a su página comercial (enlazado de D §10, verificado por `check-seo.mjs`).
- Si después se publica un artículo sobre el tema de una URL vieja redirigida (R12), la 301 se cambia a ese artículo en el mismo despliegue (sin cadenas).

**R9 · Presupuesto de imagen.**
- `srcset` hasta `srcsetMax` del uso (`IMAGENES-v2.json → uses[]` y `D-sitemap.json → sections[].plate`): **2752** en portadas, escenas con `push` (regreso al set, Conoce a Kain, `ChatSim` fijado de industrias) y `VktorSequence`; **1920** en el resto (cierres, señales, cómo funciona, gemelas y estaciones del inicio, resultados de caso). Móvil: hasta 1080 salvo portadas (1536).
- Carga: `LocationSwitcher` descarga solo la placa activa y la siguiente (las demás con intención: hover, foco o flecha); `SystemRuntime` precarga las estaciones 2–5 cuando la sección está a 1.5 pantallas y hace `decode()` antes del pin; stills del mega menú al primer uso; recortes con alfa solo en escritorio.
- Presupuesto (AVIF, recorrido completo, densidad 2×): **inicio ≤ 3.8 MB en escritorio y ≤ 2.2 MB en móvil**; páginas internas ≤ 2.0 MB y ≤ 1.2 MB; primer pantallazo de cualquier página ≤ 450 KB (placa LCP + Lexend). `check-pesos.mjs` suma por página el candidato más grande de cada `<img>` y falla si se pasa.

**R10 · Medición, atribución y consentimiento.**
- Desde el día 1, sin cookies: Vercel Web Analytics + Speed Insights.
- Eventos (nombre · parámetros): `cta_discovery_click` (página, sección, `folio`) · `whatsapp_click` (página, sección) · `agenda_click` (en `/discovery/`) · `search_open` · `search_submit` (solo longitud y grupo, nunca el texto) · `video_play` / `video_50` / `video_complete` · `faq_open` (id) · `chat_sim_tab` (sector).
- Atribución: el botón de `/discovery/` a `agenda.ingeniak.tech` conserva los `utm_*` de llegada y agrega `src=<folio>-<sección>` de la página donde la persona hizo clic primero (guardado en `sessionStorage` con `try/catch`). Medición entre dominios configurada en ambos sitios. Nada de datos personales en la URL.
- Píxeles de anuncios (Meta, Google Ads, TikTok) y GA4 **solo después del consentimiento**: banner pequeño abajo (nunca encima de la portada) con "Aceptar" y "Solo necesarias" del mismo peso, que no tapa la barra móvil (se apila encima de ella) y se reabre desde el footer. El aviso de privacidad lista las herramientas y cookies.
- El mensaje de WhatsApp único por página (D) es la atribución de esa vía; el equipo comercial lo ve en Kommo.

**R11 · Accesibilidad (además de lo ya previsto).**
- Sin atajos de una sola tecla (§4.3). Objetivos táctiles ≥ 24 × 24 px (ticks del riel con área invisible de 24 px; botones de pestañas, pausa y cerrar ≥ 44 px en táctil).
- `html{scroll-padding-top:calc(var(--hdr) + 16px);scroll-padding-bottom:calc(72px + env(safe-area-inset-bottom))}`: el foco nunca queda debajo del encabezado ni de la barra móvil (WCAG 2.4.11).
- SplitText con `aria: 'auto'` (por defecto en 3.13) y nunca sobre titulares que contengan enlaces.
- `alt=""` en placas decorativas o repetidas (cierres, señales, cómo funciona, regreso al set, auras); `alt` descriptivo solo en portadas y en placas con información (equipo, casos).
- `LocationSwitcher`: botones con `aria-pressed` y enlace aparte por fila; el autoavance se detiene con hover o foco y después de una vuelta completa.
- `@media (forced-colors: active)`: botones con borde `ButtonText`, cifras del `Montage` en color sólido, placas a `opacity:.35` para que el texto mande.
- `VideoScene`: `<dialog>` con foco atrapado, controles nativos, subtítulos disponibles y `Esc`.

**R12 · "Muy completo" sin páginas vacías.** El lanzamiento son las 45 páginas de D, todas con copy aprobado. Hoja de ruta a 90 días, con datos reales: 6 artículos más sobre los temas de las URLs viejas que hoy se redirigen (errores al implementar IA, cómo elegir una consultora de IA, cómo medir el retorno de la IA en una pyme sin cifras inventadas, Kommo vs HubSpot, guía de agentes de IA para WhatsApp Business, qué automatizar primero con n8n) y un **glosario** `/glosario/` (`DefinedTermSet`, portada con placa reutilizada) para GEO/AEO. Ninguna se publica sin copy aprobado (R1).

**R13 · Variedad de Kain.** En una misma página no se repite la pose ni el objeto de Kain en dos escenas seguidas (presenta, saluda, señala, brazos cruzados, toca la superficie, sostiene el teléfono, sentado). La lista de aceptación de cada placa (§9.4) suma: "pose y objeto distintos a la escena anterior de su página".

**R14 · VSL.** Recomprimir `discovery-session-vsl.mp4` (29.8 MB) a 720p H.264 con `+faststart`, meta ≤ 12 MB; transcribir y publicar `discovery-vsl.es.vtt`; revisar el título animado del propio video (en al menos un cuadro se enciman "se" y "detiene"); póster = `discovery-vsl-poster`. Se carga solo al hacer clic.

### 12.3 Puertas de lanzamiento

- [ ] 52 placas P1 aprobadas con la lista de §9.4 (incluida R13); las 9 P2 salen con su respaldo.
- [ ] Copy `aprobado` en las 45 páginas; `check-pendientes` y `check-contenido` en verde.
- [ ] Cada caso: completo e indexable, o caso breve en `noindex` (R2).
- [ ] Razón social, teléfono único, horario y `geo` confirmados por escrito (o se omiten).
- [ ] Sesión de fotos del equipo hecha, o portada de Nosotros con el respaldo de R6.
- [ ] VSL recomprimido, con `.vtt` y póster limpio.
- [ ] Banner de consentimiento, eventos de R10 y aviso de privacidad actualizado.
- [ ] Guardas de §8.6 + `check-pendientes`, `check-contenido` y presupuesto de R9 en verde; QA de §10 en los 9 tamaños.

### 12.4 Cambios aplicados en esta revisión

**`ESPEC-v2.md`** (marcados "r1"): encabezado 1.1 e índice · F3 (16:9) · F11 (casting) · nota en §0.3 · §3.3 proporciones y margen 4:3 · §3.6 placa vertical 4:5 y CSS de la línea guía en móvil · §3.8 pie de foto y `data-m="none"` · §4.3 sin atajo "/" · §4.8 y §8.5 razón social condicionada · §5.1 ESC 11 (`equipo-real`, izquierda) y CSS de sumario y CTAs · §5.1.1 industrias en móvil · §5.2 placas de portada y señales · §5.4 placa de resultado · §5.7 VKTOR con una placa y +250 % · §5.9 Nosotros · §5.11 `VideoScene` · §5.12 Contacto con Kain · §7.4 y §7.5 pin de metodología · §8.2 tabla de exportación y excepción del VSL · §8.6 conteos · §9.2 la lista vigente es IMAGENES · §9.3 antenas y 16:9 · §10 tamaños de QA · §11 punto 9 · Archivos · esta §12.

**`D-sitemap.json`:** H1 del inicio (§0.3-1) · orden del inicio de §5.1 · `folio` en las 45 páginas · `copy` (estado `brief` y mínimo de palabras por plantilla) · en los 11 servicios y plataformas: `senales` (renombrada desde `dolores` en consultoría, CRM y paid media; nueva en los otros 8, con sus dolores y salidas sin cifras), `como-funciona` (flujo por servicio) e `inversion` (solo `PRICE_FROM`) · casos: `cifra` con su `CaseFigure`, `testimonio` con `status: "conditional"` y `publishGate` · `datos` en salud, nutrición y finanzas · `historia`, `formulario` y `suscripcion` condicionales · `/discovery/#video` como escena · `/servicios/agentes-ia-whatsapp/#si-no` sin placa · **en las 148 secciones con placa**: `plate` (id, componente, `layout`, `mirror`, `height`, `tone`, modo móvil, `srcsetMax`, `push`, `launchFallback`, prioridad) e `image` reescrita desde el plan (incluido el brief móvil "texto arriba, sujeto abajo"). Respaldo previo: `D-sitemap.json` original en el scratchpad de la sesión.

**`D-navegacion.json`:** Servicios por 5 etapas (Atraer · Atender · Organizar · Automatizar · Medir) con `glyph`, `metricId` y "Planes desde USD 997 al mes"; tarjeta del menú con el still de `home-sistema-2-atender` (se elimina `menu-kain`).

**`IMAGENES-v2.json` / `IMAGENES-v2.md`:** 61 placas (52 P1 · 9 P2) · 6 portadas a P1 · `launchFallback` en las 9 P2 · `uses[].srcsetMax` en los 171 usos · `uses[].push` en las 8 escenas de regreso al set · placa nueva `discovery-vsl-poster` (ficha 20b, prompts de edición, uso y fila en el mapa) · sesión de fotos como requisito en `equipo-real` y `cta-equipo` · decisiones 14–19 y pendientes 6–8 en el `.md`.

**Archivos nuevos:** `ESPEC-v2-prueba-imagesection-r1.html` (la prueba de §3 con todas las correcciones) y sus capturas `ESPEC-v2-prueba-r1-390.jpg`, `-1024x768.jpg`, `-1440.jpg`, `-2560x1080.jpg`.

### 12.5 Pendientes nuevos con el cliente

1. **Copy:** quién escribe y quién aprueba cada página (R1); fecha de cierre de contenido.
2. **Casos:** ficha, punto de partida e implementación de los 5 casos por escrito, o aceptar la versión "caso breve" en `noindex` (R2).
3. **Razón social** para footer, JSON-LD y aviso de privacidad ("Ingeniak Technology, LLC" o la que corresponda).
4. **Sesión de fotos del equipo** (fecha) o aceptar el respaldo de R6.
5. **VSL:** cuadro limpio o permiso de editar el póster, revisión del título animado y transcripción para subtítulos.
6. **Medición:** cuentas de GA4, Meta, Google Ads y TikTok que se instalan tras el consentimiento, y acceso para configurar la medición entre dominios en `agenda.ingeniak.tech`.
7. **Autores** de los 6 artículos (si no se confirman, firma "Equipo de Ingeniak").
8. **Hoja de ruta de contenido** (R12): aprobar los 6 temas siguientes y el glosario.

*Fin de la especificación. Cualquier cambio a este documento se registra con fecha y versión en su encabezado; la versión vigente es la única que el equipo de construcción usa.*
