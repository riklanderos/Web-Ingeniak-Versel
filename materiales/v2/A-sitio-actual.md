# A · Auditoría del sitio actual — ingeniak.mx

> Fecha: 18 oct 2026 · Alcance: el sitio que el cliente considera **más premium** que nuestra v1. Objetivo: entender por qué se siente así, qué contiene página por página y qué le faltó a la v1. Capturas en [`actual/`](actual/) y comparativa v1 en [`actual/v1-referencia/`](actual/v1-referencia/).

---

## 0. Veredicto corto

1. **El sitio actual se siente premium por una sola decisión, repetida: cada hero es una escena cinematográfica a sangre completa con un personaje 3D de cuerpo entero como protagonista.** La imagen es la sección: el texto vive sobre la zona oscura de la misma imagen, no en una columna aparte. Es exactamente lo que el cliente pide como requisito.
2. Lo refuerzan cuatro cosas: **luz** (neón cian/azul, bloom, reflejos y fondo #000), **tipografía pesada con gradiente** (Space Grotesk 600–700), **densidad de “eventos”** al hacer scroll (16+ secciones distintas en la home) y **amplitud** (≈18 URLs públicas sin contar los 12 artículos: 9 servicios con página propia, blog, licencias, cotizador).
3. Detrás de esa fachada hay **mucho relleno y riesgos**: los heroes de servicio tienen el **texto horneado dentro de la imagen** (sin H1, ilegible en móvil, con erratas de IA), las páginas internas son una **plantilla con emojis y placeholders vacíos**, hay **testimonios con fotos de stock (randomuser.me)**, **cifras sin confirmar**, datos contradictorios (dos definiciones de VKTOR y dos listas de países), el **blog no abre** (error de React → pantalla negra) y todo es una SPA que Google indexa con el título en inglés.
4. **Nuestra v1 hizo bien lo invisible** (SSG, H1 reales, cifras confirmadas, un solo CTA, KAIN blanco, Lexend, paleta del manual) **pero falló en lo visible**: hero sin protagonista (isotipo de cristal + chips = diagrama), KAIN escondido a mitad de página en un layout de dos columnas, imágenes siempre encajonadas en tarjetas, bandas negras vacías de 300–500 px, títulos grandes pero planos (Lexend 500 sin luz) y un one-page cuando el actual tiene “cara de empresa grande” por su número de páginas.
5. **Para la v2:** tomar la receta visual del actual (escena a sangre + personaje + luz + densidad + multipágina) y ejecutarla con la disciplina de la v1 (texto en HTML, KAIN correcto, cifras reales, un CTA). Especificación concreta en la sección 8.

---

## 1. Cómo se hizo

| Herramienta | Uso |
|---|---|
| Chrome 155 headless vía CDP (script propio) | Desktop 1440×900 y móvil 390×844 (UA iPhone, táctil). Idioma forzado `es-MX`. Se espera 6.5 s de carga, se hace scroll completo en pasos de medio viewport para disparar animaciones de entrada y después se captura: primer pantallazo (`-fold.png`), un cuadro por cada viewport (`-fNN.jpg`) y página completa (`-full.jpg`). Del DOM ya renderizado se extrajeron títulos, tamaños de fuente, CTA, imágenes (tamaño natural vs. mostrado), fondos y texto completo. |
| Descarga del bundle JS/CSS | Rutas reales (`path:` del router), slugs de servicio, testimonios y tokens CSS (`--primary`, `.glass-card`, `.glow-btn`). |
| Firecrawl (3 llamadas) | Scrape de la home (salió en inglés por geolocalización EE. UU.), búsqueda `site:ingeniak.mx` para ver cómo indexa Google y un intento de scrape de un post del blog, que falló porque la página no renderiza. |
| Servidor local + mismo script | Capturas de nuestra v1 para comparar lado a lado. |

**Limitaciones honestas:** algunos contadores salieron a medio conteo (p. ej. “33” en vez de 47) y algunas tarjetas aún con desenfoque de entrada. Los valores finales se tomaron del texto del DOM. No se envió ningún formulario.

---

## 2. Mapa del sitio actual

**Tecnología:** SPA en React hecha en Lovable/gpt-engineer (el og:image está en `storage.googleapis.com/gpt-engineer-file-uploads/...`), con Tailwind/shadcn, framer-motion, i18n ES/EN y Supabase. **El mismo bundle público incluye el panel interno** (CRM, comando, contenido, cobranza…): la home precarga `admin-shell` (851 KB) y `charts` (392 KB). El HTML inicial pesa 8 KB y **no contiene ningún H1**. Todas las rutas sirven el mismo `<title>` y la misma descripción hasta que corre JavaScript.

**Navegación principal:** Inicio · Servicios ▾ (9) · Metodología · Nosotros · Blog · Contacto · selector 🇲🇽ES/🇺🇸EN · botón “Agenda una llamada →”. **Ese botón no agenda nada:** abre un modal “Cotiza tu proyecto” (nombre, email, teléfono, empresa, servicios, presupuesto, tamaño, visión → “Solicitar consultoría”), ver [captura](actual/home-cta-agenda-modal-desktop.png). “Quiero mi sistema” e “Iniciar protocolo” abren el mismo modal.
**Elementos persistentes:** header sticky con barra de progreso de scroll en gradiente, botón flotante “Cotizar” abajo a la derecha (en /metodologia cambia a “Conoce el proceso”) y menú hamburguesa en móvil.
**Footer:** logo + “Sistemas digitales que escalan tu negocio.”; íconos de Instagram, LinkedIn y correo (**apuntan a `instagram.com/` y `linkedin.com/` genéricos**); columnas Navegación (5 links), Servicios (solo 6 de 9), Contacto (correo, teléfono, Av. Punto Sur 312, Tlajomulco 45640, “Agenda tu llamada →” a /contacto) y Legal.

| URL | Propósito | Alto desktop | H1 real | Estado |
|---|---|---|---|---|
| `/` | Home / venta principal | 13,624 px (móvil 17,384) | “Convertimos tu negocio en un agente que vende 24/7.” | OK |
| `/servicios` | Hub de 9 pilares | 2,614 px | “Servicios que transforman empresas” (renderizado a 16 px; el titular grande está **dentro de la imagen**) | OK |
| `/servicios/{consultoria-ia-empresas, crm-inteligente, paginas-web, agentes-ia, paid-media, branding, contenido, desarrollo-software, seo}` | Página por servicio | 5,700–7,250 px | **Ninguno**: el titular solo existe dentro de la imagen | Plantilla |
| `/metodologia` | VKTOR | 2,564 px | “El Framework VKTOR™” (repetido como H2 justo debajo) | Delgada |
| `/nosotros` | Equipo | 3,028 px | “Estrategas de Soluciones Personalizadas” | OK, con Victor Ocampo todavía |
| `/blog` | Listado de 12 artículos | 2,137 px | “IA, automatización y crecimiento digital” | OK |
| `/blog/{slug}` | Artículo | — | — | **Roto:** React error #310 → pantalla negra ([captura](actual/blog-post-ERROR-pantalla-negra-desktop.png)). Falla también al entrar desde el listado. |
| `/contacto` | Datos de contacto | 1,505 px | “¿Listo para construir tu sistema de crecimiento?” | Sin formulario ni calendario |
| `/cotiza` | Formulario de precalificación por pasos | 900 px | “Formulario de Precalificación” | OK (sin nav ni footer) |
| `/licenciaskommo` | Venta de licencias Kommo | 4,060 px | “Licencias Kommo” | 2 enlaces internos rotos |
| `/aviso-privacidad` | Legal | 4,675 px | “Aviso de Privacidad” | Muestra nota de “modelo estándar” |

**Rutas que existen en el router pero no están enlazadas:** `/consultoria-ia/:slug`, `/comparativas/:slug` y `/glosario/:slug` (los índices redirigen a `/`), `/calculadoratokens`, `/briefclinica`, `/gracias`, `/thank-you`, `/visassos`, `/cotizacion/:slug`, `/blog/categoria|tag|autor|buscar`. No se auditaron.
**Indexación (Firecrawl `site:ingeniak.mx`):** la home aparece como **“AI Consulting for Companies | INGENIAK Mexico”** (inglés). Los posts aparecen con el título y la descripción genéricos de la home. En los mismos resultados se mezclan subdominios ajenos (`fashionbox.ingeniak.mx`, `login.ingeniak.mx`).

---

## 3. Inventario página por página

### 3.1 Home `/`
Capturas: [fold](actual/home-desktop-fold.png) · cuadros `home-desktop-f02…f16` · [completa](actual/home-desktop-full.jpg) · [móvil fold](actual/home-mobile-fold.png) · `home-mobile-f02…f22`

| # | Sección | Contenido clave | Medios y movimiento |
|---|---|---|---|
| 1 | **Hero** (0–900) | Chip “✦ AGENTIZAMOS EMPRESAS” · línea mono tachada “NO HACEMOS MARKETING.” · 3 chips “AGENTES IA · +PIPELINE · AUTOCIERRE” · **H1** “Convertimos tu negocio en un **agente** que ***vende 24/7.***” · sub “Agentes de IA, CRM inteligente y automatizaciones integrados en un solo sistema que prospecta, califica y cierra por ti.” · CTA “Quiero mi sistema →” (abre el modal) + “Ver nuestros servicios →” · indicador “Scroll” | `hero-robot.webp` **a sangre** (1440×900, object-fit cover; archivo de solo **1200×671**, estirado): robot negro brillante con ojos cian y el isotipo en el pecho, de cuerpo entero y brazos cruzados, delante de un anillo/portal de luz, sobre piso reflectante con retícula. Texto dentro de un **panel de cristal** de 576×635 en la zona oscura izquierda. |
| 2 | Franja de confianza | “+73 sistemas implementados · IA + CRM + Ads · Resultados medibles” + **toast rotativo falso** (“🚀 Pipeline automatizado para cadena de restaurantes”, “Nuevo sistema desplegado hace 2h”, “🤖 Agente de IA activado para empresa d…”) | Chips de cristal |
| 3 | Marquesina | TRANSFORMACIÓN DIGITAL ✦ AGENTES DE IA ✦ CRM AUTOMATION ✦ PAID MEDIA ✦ BRANDING ✦ WEB DESIGN ✦ CONTENT STRATEGY ✦ N8N AUTOMATION ✦ GHL ✦ KOMMO (mezcla ES/EN) | Tipo display 26 px en mayúsculas con estrellas cian; desplazamiento infinito |
| 4 | Manifiesto + KPI | “Eso ya no es marketing.” / **“Es un sistema de dominación comercial.”** · 3 tarjetas antes→después con tachado: “12 citas/mes → 47 citas/mes” (47, Citas mensuales promedio, sector salud) · “100% manual → 40% automatizado” (+60%, reducción de tiempo operativo, primeros 90 días) · “Datos dispersos → Dashboard unificado” (100%, conectado a data real) · 2 píldoras: “Clínica dental MTY 3.2X más citas en 90 días” y “E-commerce CDMX -58% costo por lead en 60 días” · “Creamos el tráfico, lo convertimos y lo operamos automáticamente.” | Contadores animados y barras de progreso con gradiente |
| 5 | Servicios | Eyebrow “NUESTROS SISTEMAS” · “Todo lo que necesitas para dominar tu mercado, en un solo lugar.” · **acordeón horizontal de 9 pilares**: el abierto (01 Consultoría en IA) muestra texto, 4 chips, imagen y “Explorar”; los demás son columnas angostas con número, ícono y nombre vertical · “Ver todos los servicios →” | Imagen de red neuronal 336×598; transición de expansión |
| 6 | Inversión | “¿Cuánto cuesta crecer con IA?” · “Tres paquetes transparentes. Setup + retainer mensual.” · **IGNITE $997/mes + $3,000 setup** · **SCALE $2,497 + $8,000** (badge “MÁS POPULAR”) · **DOMINATE $4,997 + $25,000** · “Precios USD · vigencia 30 días · MXN con factura DOF + IVA” · “Cotizar este plan →” (/cotiza) | Tarjetas de cristal con ícono |
| 7 | VKTOR | `>_ framework.init()` · “El Framework VKTOR™” (gradiente **verde**) · “Tu crecimiento tiene un protocolo — nosotros lo activamos.” · 5 fichas tipo terminal V/K/T/O/R · “Ver protocolo completo →” + “Iniciar protocolo →” | Estética de terminal en verde, fuera de la paleta |
| 8 | Equipo | “Estrategas de Soluciones Personalizadas” · 7 tarjetas (4+3) con avatar circular, iniciales, cargo en mono y bio · **incluye a Victor Ocampo** (silueta) · “Juntos, construimos el sistema que tu empresa necesita para crecer, escalar y liderar.” | Avatares 106 px con aro de gradiente |
| 9 | ¿Por qué Ingeniak? | TODO CONECTADO · VELOCIDAD + ESTRATEGIA · DATA FIRST · SOPORTE REAL | 4 tarjetas con ícono |
| 10 | Tecnologías | “Tecnologías que Dominamos” · 2 filas de logos en sentidos opuestos: GoHighLevel, Kommo, N8N, Meta Ads, Google Ads, TikTok Ads / WhatsApp Business, Make, Zapier, OpenAI, Stripe | Marquesinas con desvanecido en los bordes |
| 11 | Presencia | “PRESENCIA INTERNACIONAL” · “Presencia en +7 países y creciendo.” · carrusel con México (sede principal), USA, Colombia, Argentina, España, Costa Rica y Ecuador · “SECTORES ESTRATÉGICOS”: Salud, Belleza, Nutrición, Finanzas, Inmobiliario, Industrial | **Mapa mundial a sangre** como fondo |
| 12 | Casos | “CASOS DE ÉXITO” · “Sistemas reales operando hoy mismo.” · carrusel automático de 5 casos: +340% conversiones (Kommo, retail multimarca) · 8 min → 12 seg (clínica dental) · 1 vista · 7 fuentes (e-commerce) · ROAS 4.8x sostenido (HoReCa) · 27 procesos automatizados (n8n) | Renders isométricos 3D de cristal (1024²) |
| 13 | Testimonios | “Lo que dicen nuestros clientes” · **5 testimonios con fotos de randomuser.me** (María González/Grupo Vertex, Carlos Mendoza/TechLogistic, Ana Ruiz/Estudio Creativo AR, Roberto Sánchez/Constructora RS, Laura Torres/FinanzasPlus) | Carrusel con puntos |
| 14 | FAQ | “Preguntas frecuentes sobre consultoría en IA”: qué hace la consultora, costo, tiempo de resultados, tamaño de empresa, tecnologías, fuera de México | Acordeón |
| 15 | Ficha AEO | “FICHA TÉCNICA · DATOS VERIFICABLES / INGENIAK en datos”: “fundada en 2022”, “opera bajo la marca Radik Soluciones”, **“VKTOR (Verify, Know, Translate, Optimize, Reinforce)”**, cobertura con **Perú y Chile**, paquetes 2026, stack (GPT-5, Claude, Gemini, Kommo, GHL, Supabase, n8n, React) y 5 problemas que resuelve | Tarjetas de texto |
| 16 | CTA final | “¿Listo para transformar tu negocio?” · “Agenda una llamada estratégica sin costo…” · “Agenda una llamada →” | Gradiente de texto |
| 17 | Footer | (ver §2) | — |

**Móvil:** el robot del hero **desaparece detrás del panel de cristal**; solo se ven las antenas y los pies ([captura](actual/home-mobile-fold.png)). El resto apila tarjetas una sobre otra hasta llegar a 17,384 px.

### 3.2 Servicios `/servicios`
[fold](actual/servicios-desktop-fold.png) · [móvil](actual/servicios-mobile-fold.png)
1. **Hero en tarjeta redondeada** (1350×771 dentro del contenedor, no a sangre). Imagen de IA con el robot señalando un portal rodeado de cubos holográficos. **El texto está horneado en la imagen:** “• ECOSYSTEM ENGINEERING LAB • / Servicios sueltos no escalan. / Sistemas integrados sí. / ecosistema completo de IA, automatización y demanda — 9 pilares conectados que trabajan 24/7 por tu negocio.”
2. Eyebrow “NUESTROS SISTEMAS”, H1 pequeño “Servicios que transforman empresas” y “Cada servicio es un sistema completo diseñado para integrarse…”.
3. El mismo acordeón de 9 pilares de la home.
4. CTA “¿No sabes qué servicio necesitas?” → “Agenda una llamada →”.
5. Footer.
En móvil el hero queda como un banner de 390×220 con texto horneado de ~8 px, ilegible.

### 3.3 Páginas de servicio `/servicios/*` (plantilla única ×9)
Capturas: `srv-*-desktop-fold.png`, cuadros `-f02…f08` y completas; móvil de agentes-ia y crm-inteligente.

**Orden de secciones (idéntico en las 9):**
1. **Hero-póster** 1440×720 a sangre. La imagen de origen es 1600×914 (1536×1024 en consultoría), recortada a 2:1. El robot negro aparece en una escena temática y el **texto va horneado** (eyebrow en inglés, titular, subtítulo con gradiente y remate con guion largo). Debajo hay un único botón “Cotizar Servicio”. **No hay H1.**
2. Marquesina de capacidades (en desarrollo-software, en inglés: API DEVELOPMENT ✦ WEB APPS ✦ …).
3. Dolor: H2 grande con gradiente + 3 tarjetas con **emoji 🔴** + frase de transición (“Eso tiene solución. Se llama: …”).
4. “¿Qué incluye?”: 4–6 tarjetas con **emojis** como íconos (🧭🗺️⚙️📊🤖⚡).
5. “Nuestro proceso”: 4–5 pasos numerados.
6. (Solo paid media) “Cada canal con estrategia propia”: Google, Meta, TikTok, **Pinterest y LinkedIn** Ads.
7. “Resultados que generamos”: 4 cifras + **la misma cita en todas las páginas**: “Mientras tus competidores pagan por cada clic, tú recibes visitas orgánicas…” (es una frase de SEO pegada también en CRM, branding, etc.).
8. “¿Por qué no cualquier proveedor?”: 3 bloques en zigzag con **placeholders de imagen vacíos** (ícono gris + etiqueta).
9. “Resultados visuales”: **4 placeholders vacíos** ([ejemplo](actual/srv-crm-inteligente-desktop-f06.jpg)).
10. CTA final con frase de urgencia + “Cotizar Servicio”.

| Servicio | Titular horneado en el hero | Escena | Cifras de “Resultados” (ninguna está en la lista confirmada, salvo donde se indica) |
|---|---|---|---|
| Consultoría IA | AI STRATEGY · “No es moda. Es tu próxima ventaja competitiva.” | **Otro robot** (androide humanoide) + portal galáctico + dashboards | -40% costos, 5X procesos, 90 días al ROI, 100% end-to-end |
| CRM inteligente | GROWTH & AUTOMATION · “Tu equipo vende. Tu CRM cierra. Todo automático.” | Robot señala un pipeline Lead→Qualified→Won | 3X citas, -60% tiempo de respuesta, 24/7, 100% visibilidad |
| Páginas web | CONVERSION LAB · “Tu web no es un gasto. Es tu vendedor más efectivo.” | Robot + monitor + laptop; **texto basura de IA** (“Heds + Herro + Hero”) | 3.2X conversión, 95+ CWV, -40% rebote, 100% responsive |
| Agentes IA | AI SALES SYSTEMS · “Un vendedor que nunca duerme. Nunca se cansa.” | Robot saluda frente a un portal; burbuja con **“247”** | 200+ conversaciones/día, <5 s, 3X leads, 24/7 |
| Paid media | GROWTH ACQUISITION SYSTEMS · “No quemes presupuesto. Conviértelo en sistema de adquisición.” | Dashboard ROAS + embudo; “impresssion: convertions” | -47% CPL, 5+ plataformas, 3.8x ROAS, 24/7 |
| Branding | BRAND ARCHITECTURE · “Un logo no es una marca. Esto sí lo es.” | Robot con el isotipo en la mano; **el eyebrow queda cortado arriba** | 100%, 3X percepción de valor, 360°, 12+ entregables |
| Contenido | CONTENT LAB · “Contenido sin estrategia es ruido. Con estrategia, es sistema.” | Tira de película, cámara, micrófono | 3X engagement, +180% alcance, 100%, 30+ piezas/mes |
| Software | System LAB · “Tu software no debería limitarte. Debería escalar contigo.” | Robot con tablet de código | (sin cifras) |
| SEO | SEARCH DOMINATION LAB · “Tu competencia ya aparece en Google. ¿Y tú dónde estás?” | Lupa sobre SERP; **“Keybonk”**; el remate queda tapado por el botón | +312% tráfico, Top 3, 6 meses, 24/7 |

### 3.4 Metodología `/metodologia`
[fold](actual/metodologia-desktop-fold.png). (1) Hero centrado con badge `>_ framework.load("VKTOR")`, H1 “El Framework VKTOR™” en gradiente verde→cian y subtítulo en mono. (2) **El mismo título repetido** como bloque `FRAMEWORK.INIT()`. (3) Línea de tiempo vertical con 5 tarjetas tipo terminal (`vktor_v1.sh`, comando `verify --model=business --depth=full`, título y **una sola línea** de descripción, imagen tenue de fondo). Las fases: Verify (“Diagnóstico profundo: modelo de negocio, oferta y embudo actual.”) · Koncept (“Diseño de arquitectura: estrategia, funnel y CRM.”) · Transform (“Construcción e implementación: automatizaciones, IA, campañas.”) · Operate (“Activación y pruebas: flujo real de leads.”) · Rise (“Optimización y escalamiento de resultados.”). (4) CTA “¿Listo para activar tu protocolo de crecimiento?” → “Iniciar protocolo →” (abre el modal). Sin entregables, tiempos ni ejemplos: la página más delgada del sitio para el activo de marca más diferenciador.

### 3.5 Nosotros `/nosotros`
[fold](actual/nosotros-desktop-fold.png). (1) Hero de **dos columnas**: texto a la izquierda (chip “EL EQUIPO”, H1 “Estrategas de Soluciones Personalizadas”, “No somos una agencia tradicional…”) e imagen en tarjeta a la derecha (siluetas frente a un videowall, 652×300). Es justo el patrón de “dos bloques separados” que el cliente rechaza. (2) 7 tarjetas de equipo (4+3) con marco HUD (esquinas en L, etiqueta “ID/01…07”), foto con tinte de color, nombre, cargo en mono y bio. Victor Ocampo aparece como silueta. Algunas fotos traen el nombre impreso encima (Andy, Marcos). (3) Cita “Juntos, construimos…”. (4) CTA “¿Listo para conocernos?”. No hay historia, valores, oficina, cifras de la empresa ni el badge de Kommo.

### 3.6 Blog `/blog` y artículos
[fold](actual/blog-desktop-fold.png). Hero centrado (“BLOG INGENIAK”, H1 “IA, automatización y crecimiento digital”) · filtros Todas / IA & Automatización / Estrategia Digital / Casos de Éxito · buscador · **12 tarjetas solo de texto** (sin portada), fechadas entre el 1 y el 27 de mayo de 2026: Agentes de IA para WhatsApp Business (guía 2026) · Kommo vs GoHighLevel vs HubSpot · Cuánto cuesta implementar IA en México 2026 · Agentes conversacionales: 5 casos de uso · Cómo implementar IA (guía práctica) · Metodología VKTOR (con la definición alterna Verify-Know-Translate-Optimize-Reinforce) · Automatizar ventas B2B: caso con 312% ROI · 7 errores de implementación · Agente de IA vs chatbot · Cómo elegir consultora de IA (checklist) · n8n: 12 automatizaciones que ahorran 40 h/semana · ROI de la IA en PyMEs. **Al abrir cualquier artículo la pantalla queda negra** (React #310). Firecrawl tampoco pudo leerlo.

### 3.7 Contacto `/contacto`
[fold](actual/contacto-desktop-fold.png). H1 “¿Listo para construir tu sistema de crecimiento?” · “Agenda una llamada estratégica sin costo… blueprint exacto…” · 4 tarjetas (Email contacto@ingeniak.mx, Web, Teléfono +52 33 2101 7799, Oficina Av. Punto Sur 312, Tlajomulco 45640) · Horario lunes a viernes 9:00–18:00 (CST) · botón ancho “Cotiza tu proyecto →” · “Respondemos en menos de 24 horas. Sin compromisos.” **No tiene formulario, calendario, mapa ni WhatsApp.**

### 3.8 Cotiza `/cotiza`
[fold](actual/cotiza-desktop-fold.png). Página sin nav ni footer: logo grande, ícono, H1 “Formulario de **Precalificación**”, “Cuéntanos sobre tu proyecto. En 24-48 h te contactamos con una propuesta a medida.” y botón “Comenzar” con borde en gradiente (formulario por pasos; no se envió).

### 3.9 Licencias Kommo `/licenciaskommo`
[fold](actual/licenciaskommo-desktop-fold.png). Badge “Distribuidor Oficial Kommo en LATAM” · logo Kommo · H1 “Licencias Kommo” · **“+200 Empresas activas · 98% Satisfacción · 24h Soporte promedio”** (sin confirmar) · 3 tarjetas de valor (soporte en español, asesoría, integraciones con IA) · selector 6/9/12 meses (“Mejor precio”) · 3 planes por usuario con contador de licencias y “Comprar licencia”: Básico $90, Avanzado $150 (“Más popular”, Salesbot con IA) y Pro $270 USD (asistente de IA avanzado, sin marca Kommo), cada uno con límites (2.5k/5k/10k leads) y funciones · “Potencia tu CRM con INGENIAK”: 4 servicios, **2 con slug roto** (`/servicios/crm-automatizacion`, `/servicios/desarrollo-de-software`) · FAQ (5) · “¿Necesitas ayuda eligiendo?” → “Hablar con un asesor”.

### 3.10 Aviso de privacidad `/aviso-privacidad`
[fold](actual/aviso-privacidad-desktop-fold.png). Índice lateral con 11 secciones y texto largo. Responsable: **Ingeniak Technology, LLC** (131 Continental Drive, Newark, DE 19713), representada en México por Ricardo Alejandro Gutiérrez Landeros. Última actualización: 1 de agosto de 2026. **Muestra al público la nota “este documento es un modelo estándar… no sustituye la revisión de un abogado”.** La razón social no coincide con la de la ficha AEO de la home (“Radik Soluciones”), así que hay que confirmarla con el cliente.

---

## 4. Sistema visual observado (tokens reales del CSS en producción)

| Elemento | Valor en ingeniak.mx | Manual 2025 / brief | Nota |
|---|---|---|---|
| Fondo | `#000000` puro | `#03040B` | El negro puro hace que la luz “salte” más |
| Acción | `hsl(220 100% 50%)` = `#0055FF` | `#0055FF` | ✔ |
| Cian | `hsl(187 94% 53%)` ≈ `#16DEF8` | `#00E5FF` | Cercano |
| Índigo | “periwinkle” `hsl(239 84% 67%)` ≈ `#6467F2` | `#455DFF` | Más claro |
| Navy | `hsl(226 76% 17%)` ≈ `#0A1F4C` | `#0A1F4C` | ✔ |
| Texto apagado | `hsl(213 20% 69%)` ≈ `#A0AEC0` | `#9EB0C7` | ✔ |
| Extra | **Verde de terminal** en todo VKTOR; ámbar/rosa/esmeralda en avatares | Ámbar solo para dolor | Fuera de paleta |
| Títulos | **Space Grotesk** 600–700; H1 56 px; H2 48 px; H2 interiores 36 px; interlineado ~1.02 | **Lexend** | La fuente no es la de marca |
| Texto / etiquetas | Inter / **JetBrains Mono** en mayúsculas espaciadas (eyebrows, chips, cargos, terminal) | Inter / JetBrains Mono | ✔ |
| Texto con gradiente | `.gradient-text-multi`: 135° cian → azul → periwinkle; también blanco → azul y blanco → cian | — | Usado en casi todos los H2 |
| Cristal | `.glass-card`: blur 16 px, fondo `#ffffff08`, borde 1 px `#0057ff26`, radio 20 px | Cristal ✔ | Muy repetido |
| Botón principal | `.glow-btn`: gradiente primary→accent, sombra `0 0 20px #0057ff59, 0 0 60px #0057ff1a` + brillo que recorre el botón (*shimmer*), pill | — | Se siente “caro” |
| Botón secundario | `.glass-btn`: blur 12, fondo `#0057ff26`, borde `#0057ff4d`, pill | — | — |
| Divisores | Línea de gradiente con el isotipo al centro | — | Buen recurso de marca |
| Movimiento | Entradas con desenfoque, contadores, marquesinas (3), acordeón horizontal, 3 carruseles, barra de progreso de scroll, orbes de luz flotando (`glow-orb`, blur 80 px, 8 s), toasts “en vivo”, hover scale 1.03–1.05 | GSAP + Lenis en v2 | No hay scroll suave ni parallax del hero |

---

## 5. Por qué se siente premium (análisis crítico)

1. **El primer pantallazo es una escena, no un layout.** `hero-robot.webp` cubre los 1440×900. El personaje mide ~660 px (≈75 % del alto), está de cuerpo entero y anclado en el tercio derecho, con un anillo de luz detrás que funciona como halo y como diana visual. El piso reflectante con retícula le da profundidad. El texto no tiene columna propia: vive en la zona oscura de la misma imagen, dentro de un cristal casi invisible (negro 22 %→8 %, borde de 1 px). Por eso imagen y texto se leen como **una sola superficie**. Es el requisito del cliente, ya resuelto en su sitio.
2. **Hay un protagonista con actitud.** Brazos cruzados en la home (confianza); señala, saluda, presenta o sostiene objetos en cada servicio. Mismo personaje, misma luz y el mismo portal repetido en 10 escenas distintas: se percibe como **campaña o franquicia**, no como banco de imágenes. Cada página “cuenta” su servicio con una escena propia (pipeline, ROAS, lupa sobre Google, tablet de código).
3. **La luz es el material.** Neón cian y azul, bloom, neblina volumétrica, reflejos y partículas sobre `#000` puro, que maximiza el contraste. Los gradientes de los títulos usan los mismos colores que las luces de las imágenes, así que **el texto parece iluminado por la misma fuente que el robot**.
4. **Tipografía con peso y acento.** Space Grotesk 600–700 con interlineado apretado. Palabras clave en gradiente y una en itálica (“*vende 24/7.*”). Tres voces tipográficas bien separadas: display pesado, Inter para lectura y Mono para chips y terminal (credibilidad técnica). Ojo: **no es más grande que la v1** (H1 56 px contra 95 px en v1); es **más densa y más luminosa**.
5. **Mucho micro-detalle sin ruido.** En el primer pantallazo hay ~12 piezas de UI (chip, línea tachada, 3 chips, H1, sub, 2 CTA, scroll, pill de idioma, CTA con brillo), agrupadas en un solo bloque de cristal. Se percibe como trabajo elaborado.
6. **Algo pasa cada 700–900 px de scroll.** Marquesina → contadores → acordeón → precios → terminal → equipo → logos en dos sentidos → mapa a sangre → carrusel 3D → testimonios → FAQ → ficha → CTA. Son 16+ momentos en 13.6k px. Nunca hay una pantalla “muerta”, y los fondos oscuros siempre llevan un orbe o un gradiente radial de luz.
7. **Tamaño percibido de empresa.** 9 páginas de servicio, blog con 12 artículos, licencias con carrito, cotizador, precios publicados, mapa de 7 países y ficha técnica. La amplitud comunica “empresa establecida” aunque buena parte sea plantilla. El cliente lo resume como “más estructura”.
8. **Componentes con acabado y consistencia.** Cristal, botón con brillo, barra de progreso, divisor con isotipo, esquinas HUD “ID/0X”, botón flotante. Se repiten igual en todas las páginas y por eso se leen como **sistema**.
9. **Pruebas visibles todo el tiempo.** Cifras en chips, antes→después tachados, casos con métricas en píldora y renders isométricos. La prueba está “dentro” del diseño, no en un párrafo.
10. **Copy de alto voltaje.** “Es un sistema de dominación comercial.”, “No quemes presupuesto.”, “Un vendedor que nunca duerme.” Frases cortas en contraste que acompañan la estética.

---

## 6. Lo que le faltó a nuestra v1 (sin anestesia)

Comparativa: [v1 fold](actual/v1-referencia/v1-home-desktop-fold.png) contra [actual fold](actual/home-desktop-fold.png) · [v1 móvil](actual/v1-referencia/v1-home-mobile-fold.png) contra [actual móvil](actual/home-mobile-fold.png)

| Tema | ingeniak.mx (actual) | Nuestra v1 | Consecuencia |
|---|---|---|---|
| Protagonista del hero | Robot de cuerpo entero, ≈75 % del alto, en escena | **Isotipo de cristal flotando + 4 chips unidos por líneas** | Se lee como diagrama, no como escena. El ojo no tiene dónde aterrizar |
| Relación imagen–texto | Una sola superficie: texto sobre la zona oscura de la imagen | Arriba la “escena”, abajo el texto centrado | Dos bloques apilados, justo lo que el cliente rechaza |
| KAIN | Personaje en todos los heroes | Aparece hasta la sección 7, ~330 px de alto, junto a un mockup de teléfono en **dos columnas** | El mayor activo de la marca quedó como accesorio |
| Imágenes | Hero, mapa y pósters de servicio **a sangre** | **Todo encajonado** (casos, mapa, equipo y video en tarjetas con borde y radio); entre el hero y el cierre ninguna imagen toca los bordes | Se ve como plantilla de SaaS, no como campaña |
| Uso del espacio oscuro | Siempre hay luz (orbes, radiales, glows) | **Bandas negras vacías de 300–500 px** ([f03](actual/v1-referencia/v1-home-desktop-f03.jpg), [f06](actual/v1-referencia/v1-home-desktop-f06.jpg), [f08](actual/v1-referencia/v1-home-desktop-f08.jpg)) | En modo oscuro, un vacío sin luz parece “cargando”, no lujo. Eso es lo que el cliente llama “pobre” |
| Tipografía | Space Grotesk 600–700 con gradiente | Lexend 500 a 64–95 px, blanco y gris | Más grande pero **plana**: elegante de presentación, sin energía |
| Luz y contraste | Bloom, rim light y neón | Paleta correcta usada con timidez (cian solo en puntitos y eyebrows); fondo de ondas de baja energía | Menos “wow” en los primeros 3 segundos |
| Eventos de scroll | 16+ momentos distintos | 13 secciones casi todas del mismo tipo (titular + tarjetas) en 16.3k px | Monotonía: la página se siente más larga y más vacía |
| Estructura | ≈18 URLs + 12 artículos (9 servicios, blog, licencias, cotiza, nosotros, metodología, contacto) | One-page + 4 landings SEO + discovery | “Menos empresa”: el cliente pidió explícitamente multipágina |
| Prueba visual | Cifras en píldoras sobre renders, tachados antes→después | Las mismas cifras, en tarjetas de texto | Correcto, pero sin teatro |

**Lo que la v1 hizo mejor y no se negocia en la v2:** todo el texto en HTML con H1 real (SSG), cifras solo confirmadas, un único CTA (“Agenda tu Discovery Session”) + WhatsApp “Escríbele a Kain”, KAIN blanco correcto, Lexend del manual, fondo `#03040B`, sin Victor Ocampo, sin precios en tabla, sin testimonios inventados, landings SEO con contenido real y el link a app.kain.mx.

---

## 7. Lo que NO hay que heredar del sitio actual

**Contenido y veracidad (riesgo legal y de reputación)**
- **5 testimonios con fotos de randomuser.me** y empresas no verificables. Eliminarlos.
- **Toasts falsos “en vivo”** (“Nuevo sistema desplegado hace 2h”).
- **Cifras fuera de la lista confirmada:** -40% costos, 5X, 3X citas, 200+ conversaciones/día, <5 s, -47% CPL, 3.8x ROAS, 95+ CWV, +312% tráfico, 3X engagement, +180% alcance, 12+ entregables, “+200 empresas activas / 98% satisfacción / 24h” (licencias), “312% ROI” y “40 horas/semana” (blog).
- **Datos contradictorios:** VKTOR aparece como Verify-Koncept-Transform-Operate-Rise y también como Verify-Know-Translate-Optimize-Reinforce (ficha y blog). Los países aparecen con Costa Rica y Ecuador o con Perú y Chile. “Radik Soluciones” no coincide con “Ingeniak Technology, LLC”. Hay que confirmar “fundada en 2022”.
- **Tablas de precio IGNITE/SCALE/DOMINATE con setup.** El brief permite solo “desde USD 997 al mes”. Las tarifas de licencias Kommo ($90/150/270) son decisión aparte del cliente.
- Victor Ocampo en home y nosotros. Servicios fuera de alcance en las imágenes (Pinterest y LinkedIn Ads).
- La frase de SEO pegada en las 9 páginas de servicio. Eyebrows y marquesinas en inglés (“CONTENT STRATEGY”, “System LAB”).

**Marca**
- Robot **negro** y, en consultoría, **otro robot distinto**. El personaje oficial es **KAIN blanco** (ojos cian, dos antenas, orejas cromadas, pantalla cuadrada con asterisco).
- Space Grotesk en vez de Lexend, verde de terminal, `#000` puro en vez de `#03040B`.
- Texto horneado con erratas de IA (“247”, “Heds + Herro + Hero”, “Keybonk”, “impresssion”).

**Técnico, SEO y UX**
- **Texto dentro de imágenes:** sin H1, no indexable ni traducible, se recorta con `object-fit` (el eyebrow de branding queda cortado) y en móvil baja a ~8 px.
- SPA sin HTML inicial, mismo título en todas las rutas, home indexada en inglés y panel admin dentro del bundle público.
- **Blog roto** (pantalla negra), enlaces rotos en licencias, redes sociales a URLs genéricas, nota de “modelo estándar” en el aviso legal y hero de 1200×671 estirado.
- **Promesa del CTA incongruente:** “Agenda una llamada” abre “Cotiza tu proyecto”, que no tiene calendario. Hay 7+ CTA distintos (Quiero mi sistema, Cotizar, Cotiza tu proyecto, Cotizar Servicio, Iniciar protocolo, Comprar licencia, Hablar con un asesor) hacia 3 destinos distintos.
- **Móvil:** el hero esconde al robot detrás de la tarjeta, que es el error contrario al que pide el cliente.
- Contacto sin formulario, calendario, mapa ni WhatsApp. Blog sin portadas. Placeholders de imagen vacíos y emojis como íconos.

---

## 8. Implicaciones para la v2 (reglas derivadas de esta auditoría)

### 8.1 Receta “la imagen ES la sección” (requisito del cliente)
1. **Una escena por sección clave, no una foto en una tarjeta.** El `<section>` tiene la imagen como fondo a sangre (`position:absolute; inset:0; object-fit:cover`) y el contenido en HTML encima. Nunca en una columna con borde o radio propio.
2. **Composición fija para generar en Magnific/Nano Banana Pro:** KAIN (o la persona) de cuerpo entero, ocupando 70–85 % del alto, con los pies visibles y su reflejo en el piso, en el **tercio derecho** (o izquierdo, alternando por sección). El 50–55 % opuesto debe ser **espacio negativo oscuro y de bajo detalle** (`#03040B`→`#0A1F4C`) donde irá el texto. La fuente de luz (rim light cian) sale del lado del personaje y se derrama suave hacia la zona del texto. Usar como **referencia maestra** `materiales/discovery/kain-01-hero.png` (2048×1152): ya cumple exactamente esta composición.
3. **Sin texto dentro de la imagen.** Ni titulares, ni UI legible, ni números. Los hologramas deben ser abstractos (barras, nodos, burbujas sin letras) para evitar erratas tipo “247”.
4. **Costuras invisibles.** El 15–20 % inferior de la imagen se funde con el color de fondo de la sección (degradado de máscara o generado así), de modo que la sección siguiente “nace” del mismo piso o la misma neblina. Arriba, la imagen se oscurece bajo el header. En CSS: `linear-gradient(90deg, rgba(3,4,11,.88) 0%, rgba(3,4,11,.55) 38%, transparent 62%)` sobre la imagen + desvanecido inferior hacia `#03040B`. El texto puede ir en cristal (blur 16–20, borde 1 px) o directo sobre la zona oscura, siempre con contraste AA.
5. **Variante móvil propia, nunca el mismo recorte.** Generar 9:16 (p. ej. 1080×1920) con KAIN en el 55 % superior y piso o neblina abajo para que el texto empiece sobre la parte desvanecida. **Prohibido tapar al personaje con la tarjeta** (error del sitio actual en móvil).
6. **Resolución y peso:** escritorio 2560×1440 (o 3072 para 21:9) y móvil 1080×1920, en AVIF/WebP con `srcset`. LCP precargado solo para el hero. El actual estira 1200×671 y se nota.
7. **Mismo rig en todas las escenas:** KAIN blanco idéntico, misma luz (cian + azul, toque índigo), mismo piso reflectante y un **motivo recurrente** (portal o anillo de luz, como el halo del actual). Así se logra el efecto franquicia.
8. **Movimiento:** parallax leve del personaje respecto al fondo (GSAP ScrollTrigger, 4–8 %), entrada del texto con SplitText y loops de partículas o glow. Si hay clip transparente de Kain, puede sustituir la imagen fija en el hero de la home.

### 8.2 Escenas mínimas a producir (una por página o sección texto+imagen)
Home (KAIN con brazos cruzados o presentando frente al portal) · Hub de servicios · 9 servicios, cada uno con un gesto o prop distinto: consultoría (mapa o roadmap holográfico abstracto), CRM (columnas de pipeline sin texto), páginas web (pantallas flotantes), agentes IA (burbujas de chat + ícono de WhatsApp), paid media (embudo + barras), branding (isotipo en la mano), contenido (cámara o claqueta), software (paneles de código abstractos), SEO (lupa + nodos) · Metodología VKTOR (5 escenas o una larga con 5 estaciones) · Nosotros (foto real del equipo tratada con la misma luz: personas de un lado, texto del otro) · Casos · Discovery/Contacto (KAIN señalando un calendario o portal) · Kommo Partner (KAIN + sello Kommo) · Blog (portadas con el mismo rig).

### 8.3 Estructura y densidad
- **Conservar los slugs actuales** para no perder lo poco que Google ya tiene indexado (o redirigir con 301): `/servicios/{consultoria-ia-empresas, crm-inteligente, paginas-web, agentes-ia, paid-media, branding, contenido, desarrollo-software, seo}`, `/nosotros`, `/metodologia`, `/blog/{12 slugs}`, `/contacto`, `/cotiza`, `/licenciaskommo` y `/aviso-privacidad`. Además, nuestras landings `/kommo/`, `/gohighlevel/`, `/agentes-ia-whatsapp/`, `/agentes-ia-guadalajara/` y `/discovery/`.
- **Un “evento” cada viewport**, sin bandas vacías. Patrones del actual que vale la pena superar: marquesina, contadores antes→después con tachado, acordeón de pilares, terminal VKTOR (rehacerla en la paleta de marca), marquesinas de logos, mapa a sangre, carrusel de casos con renders y FAQ.
- Las páginas de servicio necesitan **contenido propio** (qué incluye, stack, entregables, proceso VKTOR aplicado, caso confirmado relacionado, FAQ, CTA Discovery), no una plantilla con emojis.
- Un solo CTA primario en todo el sitio: **“Agenda tu Discovery Session”** → `/discovery/` → `agenda.ingeniak.tech/discovery/agendar`. Secundario: WhatsApp “Escríbele a Kain”.

---

## 9. Índice de capturas (`materiales/v2/actual/`)

Convención: `{página}-{desktop|mobile}-fold.png` = primer pantallazo · `-fNN.jpg` = cuadro N al hacer scroll (cada 900 px en desktop, 844 px en móvil) · `-full.jpg` = página completa.

| Página | Desktop | Móvil |
|---|---|---|
| Home | fold, f02–f16, full | fold, f02–f22, full |
| Modal “Agenda una llamada” | `home-cta-agenda-modal-desktop.png` | — |
| Servicios (hub) | fold, f02–f04, full | fold, full |
| Consultoría IA · CRM · Páginas web · Agentes IA · Paid media · Branding · Contenido · Software · SEO | `srv-*-desktop`: fold, f02–f08 (paid media hasta f09, software hasta f07), full | `srv-agentes-ia` y `srv-crm-inteligente`: fold, full |
| Metodología | fold, f02–f04, full | fold, full |
| Nosotros | fold, f02–f04, full | fold, full |
| Blog | fold, f02–f03, full | fold, full |
| Artículo de blog (error) | `blog-post-ERROR-pantalla-negra-desktop.png` | — |
| Contacto | fold, f02–f03, full | fold, full |
| Cotiza | fold, f02, full | — |
| Licencias Kommo | fold, f02–f06, full | fold, full |
| Aviso de privacidad | fold, f02–f06, full | — |
| **Nuestra v1 (comparativa)** | `v1-referencia/v1-home-desktop`: fold, f02–f19, full | `v1-referencia/v1-home-mobile`: fold, full |

Total: 179 imágenes en `actual/` + 22 en `actual/v1-referencia/` (≈35 MB).
