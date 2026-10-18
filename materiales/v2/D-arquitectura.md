# D · Arquitectura de información de Ingeniak v2 (sitio multipágina)

Fecha: 18 de octubre de 2026. Fuentes: `materiales/seo/investigacion-seo.md`, `materiales/discovery/contenido.md`, `07_Web/Contenido_web.md` y `01_Guia_de_Marca.md` del kit de marca, las 6 páginas de v1 (de donde sale el copy reutilizado) y el sitio vivo ingeniak.mx revisado con Firecrawl (sitemap.xml, inicio, /servicios, /blog y `site:ingeniak.mx`).

Archivos de esta entrega, todos en `materiales/v2/`:

| Archivo | Qué es |
|---|---|
| `D-arquitectura.md` | Este documento: reglas, navegación, redirecciones y la ficha de cada página. |
| `D-sitemap.json` | Arreglo de 45 objetos, uno por página, con todos los campos de la ficha (URL, plantilla, keyword, title, meta, H1, secciones, imágenes cinematográficas, CTAs con su enlace de WhatsApp ya codificado, enlaces internos, JSON-LD, preguntas con respuesta, redirecciones de entrada). Sirve para generar las páginas en Astro. |
| `D-navegacion.json` | Mega menú, barra móvil, footer y esquema de breadcrumbs, listos para un componente. |
| `D-redirects.json` | Las redirecciones 301 en formato de `vercel.json`. |

## 0. Resumen

- **45 páginas** en 9 grupos: núcleo (1), servicios (12), industrias (9), casos (6), empresa (5: Kain, Metodología, Tecnologías, Nosotros, Guadalajara), recursos (8: blog, 6 artículos y preguntas frecuentes), conversión (2: Discovery y Contacto), legal (1) y 404.
- **Todas las páginas, menos el aviso de privacidad, abren con una sección cinematográfica**: la imagen es el fondo de toda la sección, la persona o KAIN va de un lado y el texto con los botones del otro, sobre la misma imagen. Hay **120 secciones cinematográficas** que piden **86 imágenes 21:9** (82 escenas propias de cada página, contando las 5 de la secuencia de VKTOR™, + 4 cierres compartidos), cada una con su versión vertical para celular. Las reglas están en la sección 4.
- **Se conservan las URLs que ya están indexadas** cuando hay una página equivalente (`/servicios/consultoria-ia-empresas`, `/servicios/paid-media`, `/servicios/paginas-web`, `/servicios/seo`, `/servicios/desarrollo-software`, `/servicios/branding`, `/metodologia`, `/nosotros`, `/contacto`, `/blog`, `/aviso-privacidad`). Las demás van con 301 a la página más cercana. El sitio vivo es una SPA que devuelve el mismo `<title>` genérico en todas sus URLs, así que los 301 arriesgan poco.
- **20 redirecciones 301** (sección 8), incluidos los 14 artículos del blog actual. Varios repiten cifras que no están confirmadas, como "312% ROI" o "40 horas/semana", o la expansión equivocada de VKTOR, así que no se migran: se redirigen a la página nueva que cubre el mismo tema.
- Un solo botón azul en todo el sitio: **Agenda tu Discovery Session** → `/discovery/`. Solo dentro de `/discovery/` el botón va directo a la agenda externa. La acción secundaria es WhatsApp, con un mensaje distinto en cada página para saber de dónde llegó cada conversación.
- Precio: solo **"desde USD 997 al mes"**. No hay página `/precios` ni tabla de paquetes.

## 1. Reglas que aplican a todas las páginas

1. **Solo cifras confirmadas**, siempre con sector, ciudad si se conoce, plazo y la nota "datos internos de Ingeniak, octubre de 2026". Las 11 cifras permitidas:
   - 3.2× más citas en 90 días (clínica dental, Monterrey)
   - Tiempo de respuesta de 8 min a 12 s (clínica dental, Monterrey)
   - −58% en costo por lead en 60 días (e-commerce, CDMX)
   - +340% en conversiones (retail multimarca, Kommo + IA)
   - ROAS de 4.8× sostenido (HoReCa)
   - 27 procesos automatizados (logística, n8n)
   - De 12 a 47 citas al mes en promedio (clientes del sector salud)
   - −60% de tiempo operativo (promedio, primeros 90 días)
   - 1 vista · 7 fuentes en un tablero unificado (e-commerce)
   - +73 sistemas en producción
   - 7 países: México (sede), Estados Unidos, Colombia, Argentina, España, Costa Rica y Ecuador
2. **Sectores sin caso publicado** (belleza, nutrición, finanzas, inmobiliario): se muestran cifras transversales indicando de dónde vienen. Nunca se inventa una cifra del sector.
3. **Nada de testimonios, clientes, premios ni precios inventados.** Los tres testimonios borrador de v1 no se publican. La sección de testimonio solo existe si el cliente aprueba por escrito.
4. **Personas en las imágenes:** son ilustrativas (generadas). Nunca llevan nombre, cargo ni cita, y en los casos se marcan con "Imagen ilustrativa del sector". Las únicas personas reales son las del equipo (`img/equipo/`, `team-hero`).
5. **KAIN** siempre de cuerpo completo y fiel a su diseño: robot blanco brillante, ojos ovalados cian, dos antenas delgadas, auriculares cromados y pantalla cuadrada oscura en el pecho con un asterisco cian. El logotipo es **kain**, siempre en minúsculas. Nunca usar "Tu negocio trabajando, aunque tú no". Kain no da consejo médico ni legal.
6. **Color:** ámbar #FFB547 solo para dolores. La solución va en cian #00E5FF o azul. El azul #0055FF se reserva para botones.
7. **Marcas de terceros:** solo Kommo es "partner oficial", con el sello enlazado a kommo.com. Las demás son "herramientas que usamos o integramos". GoHighLevel nunca aparece como partner.
8. **SEO/GEO:** Astro SSG con todo el texto en el HTML inicial. Una keyword principal por URL (sección 9), un bloque "¿Qué es…?" de 40 a 60 palabras al inicio de cada página de servicio, industria y artículo, y FAQPage idéntico al texto visible.
9. **Idioma:** español de México, tuteo, sin humo. `<html lang="es-MX">`. Sin versión en inglés por ahora (sección 8.3).

## 2. Árbol del sitio

```
/                                              Inicio
/servicios/                                    Servicios (hub)
  /servicios/consultoria-ia-empresas/          Consultoría en IA
  /servicios/agentes-ia-whatsapp/              Agentes de IA para WhatsApp
  /servicios/crm-con-ia/                       CRM con IA
    /kommo/                                    Partner oficial de Kommo (URL de primer nivel, breadcrumb bajo CRM)
    /gohighlevel/                              GoHighLevel en español (ídem)
  /servicios/automatizacion-n8n/               Automatización con n8n
  /servicios/paid-media/                       Paid media
  /servicios/paginas-web/                      Páginas web de alta conversión
  /servicios/desarrollo-software/              Software a la medida
  /servicios/seo/                              SEO y visibilidad en IA
  /servicios/branding/                         Branding y contenido
/industrias/                                   Industrias (hub)
  /industrias/salud/ · /belleza-estetica/ · /nutricion/ · /finanzas/
  /industrias/inmobiliario/ · /industrial-logistica/ · /retail-ecommerce/ · /horeca/
/casos/                                        Casos (hub)
  /casos/clinica-dental-monterrey/ · /retail-multimarca-kommo/ · /ecommerce-cdmx-costo-por-lead/
  /casos/horeca-roas/ · /logistica-n8n/
/kain/                                         kain (sub-marca, plataforma y personaje)
/metodologia/                                  Metodología VKTOR™
/tecnologias/                                  Tecnologías
/nosotros/                                     Nosotros
/agentes-ia-guadalajara/                       Landing local
/preguntas-frecuentes/                         Preguntas frecuentes
/blog/                                         Blog (hub)
  /blog/cuanto-cuesta-agente-ia-whatsapp-mexico/ · /kommo-vs-gohighlevel/ · /agente-ia-whatsapp-vs-chatbot/
  /blog/como-verificar-partner-oficial-kommo/ · /gohighlevel-en-espanol/ · /n8n-vs-zapier-vs-make/
/discovery/                                    Discovery Session (conversión, navegación reducida)
/contacto/                                     Contacto
/aviso-privacidad/                             Aviso de privacidad
/404                                           No encontrada (noindex)
```

Profundidad máxima: 3 clics desde el inicio para cualquier página (inicio → hub → página). Cada página de detalle se enlaza desde su hub, desde el mega menú o el footer y desde al menos 2 páginas hermanas.

## 3. Plantillas y biblioteca de secciones

### 3.1 Plantillas (layouts de Astro)

| Plantilla | Páginas | Estructura |
|---|---|---|
| T-HOME | 1 | Inicio. Portada cinematográfica, sistema fijado al scroll, grids de servicios, industrias y casos, FAQ y cierre. |
| T-HUB | 4 | Índice de un grupo (servicios, industrias, casos, blog): portada cinematográfica + definición + grid de hijos + FAQ + cierre. |
| T-SERVICE | 9 | Servicio: portada, "¿Qué es…?", dolores, qué hacemos, sección cinematográfica intermedia, caso, VKTOR™, FAQ, relacionados y cierre. |
| T-PLATFORM | 2 | Variante de servicio para Kommo y GoHighLevel: sello o aviso de marca en la portada y bloque "¿es para ti?". |
| T-INDUSTRY | 8 | Industria: portada con persona del sector, definición, dolores, usos, Kain en el sector (cinematográfica), cifras, servicios, FAQ y cierre. |
| T-CASE | 5 | Caso: portada con la cifra gigante, ficha, punto de partida, implementación, resultado (cinematográfica), VKTOR™, qué replicar y cierre. |
| T-PRODUCT | 1 | kain: portada con KAIN, qué es, qué hace con video, sí/no, sectores, plataforma (vista demo), FAQ y cierre. |
| T-METHOD | 1 | VKTOR™: portada + secuencia cinematográfica de 5 fases fijada al scroll + tabla + tiempos + FAQ. |
| T-STACK | 1 | Tecnologías por categoría con las reglas de logo de cada marca. |
| T-ABOUT | 1 | Nosotros: equipo real, ficha de la entidad, manifiesto, valores, presencia y alianzas. |
| T-LOCAL | 1 | Landing local con NAP, mapa estático y ProfessionalService. |
| T-FAQ | 1 | Preguntas por categoría con buscador sobre el HTML ya renderizado. |
| T-ARTICLE | 6 | Artículo: portada con autor y fecha, respuesta corta, índice, cuerpo, CTA intermedio, FAQ, autor, fuentes y relacionados. |
| T-CONVERSION | 1 | Discovery: navegación reducida (logo + botón), sin mega menú y sin enlaces de salida. |
| T-CONTACT | 1 | Contacto: 3 rutas, oficina y redes. |
| T-LEGAL | 1 | Texto legal sin imagen. |
| T-404 | 1 | Portada cinematográfica con KAIN y enlaces de rescate. |

### 3.2 Componentes reutilizables

| Componente | Uso |
|---|---|
| `CineSection` | La sección cinematográfica (sección 4). Props: `image`, `imageMobile`, `subjectSide`, `height` (`hero` 100svh, `mid` 85svh, `cta` 75svh), `tone` (`solucion` cian, `dolor` ámbar), `cutout` opcional para parallax en 2 capas. |
| `Breadcrumbs` | Visible dentro de la columna de texto de la portada (no es una barra aparte) y emite el BreadcrumbList. |
| `DefinitionBlock` | "¿Qué es…?" de 40 a 60 palabras, con la primera oración como definición. |
| `StatBand` / `StatPill` | Cifras con contexto y nota de fuente; las píldoras de cristal se usan sobre imágenes. |
| `PainGrid` | Dolores en ámbar con salida en cian. |
| `SystemFlow` | Las 5 etapas (Atraer, Atender, Organizar, Automatizar, Medir) con el video de Remotion. |
| `ServiceGrid`, `IndustryGrid`, `CaseCards` | Tarjetas de cristal con fuga de luz que sigue al mouse (estilo aprobado en v1). |
| `VktorTimeline` | 5 fases con trazo cian que se dibuja con el scroll; la versión `pinned` es la de /metodologia/. |
| `FitCheck` | "Es para ti si…" / "No es para ti si…". |
| `DoDont` | "Lo que sí hace" / "Lo que no hace". |
| `ChatDemo` | Video del chat de Kain (HyperFrames) o burbujas en HTML, marcado "ejemplo ilustrativo". |
| `LogoWall` | Logos en blanco (`currentColor`) según LOGOS.md; el sello de Kommo, enlazado. |
| `FAQAccordion` | Recibe ids del banco (sección 12) y escribe el FAQPage con el mismo texto. |
| `RelatedLinks` | "Sigue explorando": 3 tarjetas. |
| `EntityCard` | Ficha de la entidad (NAP, partner, cifras) para Nosotros, Guadalajara y el footer. |
| `AuthorCard` | Autor real con foto, cargo y enlace a /nosotros/. |

## 4. Sección cinematográfica (requisito obligatorio del cliente)

> Lo pidió el cliente: "Se creen imágenes premium donde la imagen sea el background y la persona o personaje de un lado y del otro los textos o botones, pero la imagen se siente como parte de la misma sección y no como 2 secciones separadas."

### 4.1 Composición

- La imagen cubre **toda la sección** de borde a borde (`position:absolute; inset:0; object-fit:cover`). No hay columna de imagen ni caja de texto: el texto va directo sobre la zona de la imagen que se generó a propósito en penumbra.
- La persona o KAIN ocupa el **tercio derecho o izquierdo**. El texto ocupa las columnas 1 a 6 (o 7 a 12) de una rejilla de 12. La posición del sujeto se fija por breakpoint con `object-position` para que nunca quede debajo del texto.
- **Legibilidad sin cajas:** (1) la imagen se genera con el 50 a 60% del cuadro en navy limpio (#03040B → #0A1F4C), sin objetos; (2) una capa CSS de degradado desde el lado del texto: `linear-gradient(90deg, rgba(3,4,11,.88) 0%, rgba(3,4,11,.6) 38%, rgba(3,4,11,0) 62%)`, en espejo según el lado; (3) el texto blanco y el muted #9EB0C7 deben dar contraste AA medido sobre la imagen real.
- **Fusión con lo que sigue:** degradado de 160 a 200 px a #03040B arriba y abajo, para que la sección se funda con las vecinas y no se lea como un bloque pegado.
- El cristal (glassmorphism) se usa solo en piezas chicas encima de la imagen: chips, píldoras de cifras, burbujas de chat y sellos. Nunca como caja alrededor del bloque de texto.
- Una **rama de luz cian** en SVG (del isotipo) puede salir del sujeto y llegar al botón, para que imagen y texto se lean como una sola escena.

### 4.2 Celular (menos de 768 px)

- Recorte vertical dirigido (`<picture>` con `media`): 9:16 para KAIN y 4:5 para personas. El sujeto queda en el 55% superior y el 45% inferior queda en penumbra para el texto.
- El texto se monta sobre la parte baja de la misma imagen. Nunca va una imagen apilada arriba y el texto en un bloque aparte debajo.
- Las alturas usan `svh` para evitar saltos con la barra del navegador.

### 4.3 Movimiento (GSAP 3.13 + ScrollTrigger + SplitText + Lenis 1.3.11)

- Fondo: escala de 1.12 a 1.0 y `yPercent` de 0 a −6 con `scrub`.
- Opción de 2 capas: placa de fondo + recorte del sujeto con alfa (Magnific, quitar fondo) con un desplazamiento distinto, para dar profundidad.
- Texto: SplitText por líneas, `power3.out`, 0.95 s, desplazamiento de 22 px, escalonado de 0.06 s (los valores de v1).
- Secuencias fijadas (pinned) solo en `/metodologia/` (5 fases) y en el sistema del inicio.
- Con `prefers-reduced-motion` o ahorro de datos, todo queda estático y los videos no se reproducen solos.

### 4.4 Rendimiento y SEO

- AVIF + WebP en anchos de 828, 1280, 1920 y 2560. La portada se precarga con `fetchpriority="high"` y las demás secciones se cargan diferidas. Meta: LCP menor a 2.5 s y menos de 220 KB por imagen AVIF de 1920.
- Todo el texto va en HTML, nunca dentro de la imagen. Las imágenes de portada llevan `alt` descriptivo en español.
- Nombre del archivo: `/img/cine/{id-de-página}-{id-de-sección}-{1920|movil}.avif` (campo `image.file` del JSON).

### 4.5 Generación de imágenes (Magnific · Nano Banana Pro)

Plantilla de prompt para personas:

```
Fotografía editorial cinematográfica, formato 21:9, [SUJETO] ubicado en el tercio [derecho|izquierdo] del cuadro,
plano medio a americano, [ESCENA] con fondo desenfocado, iluminación de borde cian (#00E5FF) y relleno azul profundo,
el [lado opuesto] del cuadro en penumbra navy limpia (#03040B a #0A1F4C), sin objetos, para colocar texto encima;
acabado premium, grano fino, contraste suave, sin texto, sin logotipos, sin marcas de agua, sin interfaz legible en pantallas.
```

Plantilla para KAIN (adjuntar como referencia las imágenes de `05_Kain_Personaje/` y `img/kain/`):

```
KAIN, robot pequeño y amigable, cuerpo completo visible de las antenas a los pies, blanco brillante, ojos ovalados
cian luminosos, dos antenas delgadas, auriculares cromados, pantalla cuadrada oscura en el pecho con un asterisco cian
brillante; [POSE] en el tercio [derecho|izquierdo]; [ESCENA]; el resto del cuadro en penumbra navy limpia para texto;
render 3D premium, reflejos suaves, sin texto, sin logotipos.
```

Cada imagen se genera en 21:9 (3360 × 1440) y se saca su versión vertical aparte (no se recorta la de escritorio). Los cierres de página usan 4 imágenes compartidas:

| Variante | Imagen | Páginas que la usan |
|---|---|---|
| kain-saluda | KAIN saludando a la derecha, texto a la izquierda | 14: `/`, `/servicios/agentes-ia-whatsapp/`, `/kommo/`, `/servicios/desarrollo-software/`, `/industrias/salud/`, `/industrias/finanzas/`, `/industrias/retail-ecommerce/`, `/casos/clinica-dental-monterrey/`, `/casos/horeca-roas/`, `/kain/`, `/tecnologias/`, `/blog/`, `/blog/agente-ia-whatsapp-vs-chatbot/`, `/contacto/` |
| kain-senala | KAIN a la izquierda señalando el botón, texto a la derecha | 13: `/servicios/`, `/servicios/crm-con-ia/`, `/gohighlevel/`, `/servicios/paginas-web/`, `/servicios/seo/`, `/industrias/belleza-estetica/`, `/industrias/inmobiliario/`, `/industrias/horeca/`, `/casos/retail-multimarca-kommo/`, `/metodologia/`, `/preguntas-frecuentes/`, `/blog/kommo-vs-gohighlevel/`, `/blog/n8n-vs-zapier-vs-make/` |
| duena-tranquila | Dueña de negocio tranquila al atardecer a la derecha | 10: `/servicios/consultoria-ia-empresas/`, `/servicios/automatizacion-n8n/`, `/servicios/paid-media/`, `/industrias/`, `/industrias/nutricion/`, `/industrias/industrial-logistica/`, `/casos/ecommerce-cdmx-costo-por-lead/`, `/agentes-ia-guadalajara/`, `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/`, `/blog/gohighlevel-en-espanol/` |
| equipo | Foto real del equipo extendida con outpainting | 5: `/servicios/branding/`, `/casos/`, `/casos/logistica-n8n/`, `/nosotros/`, `/blog/como-verificar-partner-oficial-kommo/` |

El listado completo de imágenes, con su brief, está en la sección 14 y en el campo `sections[].image` de `D-sitemap.json`.

## 5. Navegación: mega menú

Barra superior (cristal oscuro, fija, se compacta al bajar): **logo** · Servicios ▾ · Industrias ▾ · Casos ▾ · Kain · Empresa ▾ · Recursos ▾ · **[Agenda tu Discovery Session]** · ícono de WhatsApp.

Todos los enlaces del menú están en el HTML generado: el JS solo abre y cierra los paneles, no inyecta enlaces. Se abre con hover (y un retardo de 120 ms) o con clic y teclado (`aria-expanded`), y se cierra con `Esc`.

### Servicios (mega menú) → `/servicios/`

- **Atraer** · _Tráfico y marca que traen clientes medibles_
  - [Paid media](/servicios/paid-media/): Meta, Google y TikTok medidos por ventas
  - [Páginas web de alta conversión](/servicios/paginas-web/): Conectadas a tu CRM y WhatsApp
  - [SEO y visibilidad en IA](/servicios/seo/): Que te encuentre Google y te cite ChatGPT
  - [Branding y contenido](/servicios/branding/): Identidad que te posiciona como premium
- **Atender y vender** · _Cada conversación atendida y registrada_
  - [Agentes de IA para WhatsApp](/servicios/agentes-ia-whatsapp/): Responden, califican y agendan 24/7
  - [CRM con IA](/servicios/crm-con-ia/): Kommo o GoHighLevel, implementado para vender
  - [Partner oficial de Kommo](/kommo/): Licencias, implementación y agentes · sello "Partner"
  - [GoHighLevel en español](/gohighlevel/): CRM, embudos y calendarios en una plataforma
- **Operar y escalar** · _Procesos que se mueven solos_
  - [Consultoría en IA](/servicios/consultoria-ia-empresas/): Diagnóstico, roadmap y retorno medible
  - [Automatización con n8n](/servicios/automatizacion-n8n/): Tus sistemas conectados, sin capturas a mano
  - [Software a la medida](/servicios/desarrollo-software/): Cuando ninguna herramienta encaja
- **Tarjeta destacada (cinematográfica, mini):** Conoce a Kain → `/kain/`: El agente de IA de tu empresa.
- Pie del panel: [Todos los servicios](/servicios/) · [Metodología VKTOR™](/metodologia/) · [Tecnologías](/tecnologias/)

### Industrias (mega menú) → `/industrias/`

- [Salud y clínicas](/industrias/salud/): Citas agendadas y confirmadas 24/7 · cifra: **3.2× más citas**
- [Belleza y estética](/industrias/belleza-estetica/): Agenda llena sin vivir en el WhatsApp
- [Nutrición](/industrias/nutricion/): Pacientes que agendan y regresan
- [Finanzas](/industrias/finanzas/): Prospectos calificados antes de llamar
- [Inmobiliario](/industrias/inmobiliario/): Cada lead atendido en segundos
- [Industrial y logística](/industrias/industrial-logistica/): Operación que se mueve sola · cifra: **27 procesos**
- [Retail y e-commerce](/industrias/retail-ecommerce/): Ventas por chat, medidas · cifra: **+340%**
- [HoReCa](/industrias/horeca/): Reservas medidas por campaña · cifra: **ROAS 4.8×**
- Pie del panel: [Todas las industrias](/industrias/)

### Casos (desplegable) → `/casos/`

- [Clínica dental en Monterrey](/casos/clinica-dental-monterrey/) · cifra: **3.2× citas en 90 días**
- [Retail multimarca](/casos/retail-multimarca-kommo/) · cifra: **+340% conversiones**
- [E-commerce en CDMX](/casos/ecommerce-cdmx-costo-por-lead/) · cifra: **−58% costo por lead**
- [HoReCa](/casos/horeca-roas/) · cifra: **ROAS 4.8× sostenido**
- [Logística](/casos/logistica-n8n/) · cifra: **27 procesos automatizados**
- Pie del panel: [Todos los casos](/casos/)

### Kain (enlace directo) → `/kain/`

- Acento visual: punto cian 'IA'.

### Empresa (desplegable) → `/nosotros/`

- [Nosotros](/nosotros/): El equipo, la ficha y los valores
- [Metodología VKTOR™](/metodologia/): Las 5 fases de cada proyecto
- [Tecnologías](/tecnologias/): El stack con el que construimos
- [Agentes de IA en Guadalajara](/agentes-ia-guadalajara/): Oficina en Tlajomulco de Zúñiga
- [Contacto](/contacto/): WhatsApp, correo y oficina

### Recursos (desplegable) → `/blog/`

- [Blog](/blog/): Guías sin humo para decidir mejor
- [¿Cuánto cuesta un agente de IA?](/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/)
- [Kommo vs GoHighLevel](/blog/kommo-vs-gohighlevel/)
- [Agente de IA vs chatbot](/blog/agente-ia-whatsapp-vs-chatbot/)
- [Preguntas frecuentes](/preguntas-frecuentes/): Respuestas directas

**Celular:** botón de menú → capa de pantalla completa en cristal oscuro, con un acordeón por grupo y la Discovery fija al pie. En todas las páginas (excepto `/discovery/`) hay una barra inferior fija con dos botones: "Agenda tu Discovery" y "Escríbele a Kain".

**En `/discovery/`:** solo el logo y el botón "Agendar mi Discovery Session" (sin mega menú) para no sacar a nadie del embudo.

## 6. Footer (mapa del sitio)

Encima del footer siempre va el cierre cinematográfico de la página. El footer tiene 4 bandas:

1. **Columnas de enlaces:**
   - **Servicios:** Todos los servicios · Consultoría en IA · Agentes de IA para WhatsApp · CRM con IA · Partner oficial de Kommo · GoHighLevel · Automatización con n8n · Paid media · Páginas web · Software a la medida · SEO y visibilidad en IA · Branding y contenido
   - **Industrias:** Salud · Belleza y estética · Nutrición · Finanzas · Inmobiliario · Industrial y logística · Retail y e-commerce · HoReCa · Todas las industrias
   - **Casos:** Clínica dental en Monterrey · Retail multimarca · E-commerce en CDMX · HoReCa · Logística · Todos los casos
   - **Empresa:** Nosotros · Metodología VKTOR™ · Tecnologías · Kain · app.kain.mx ↗ · Agentes de IA en Guadalajara · Contacto
   - **Recursos:** Blog · Cuánto cuesta un agente de IA · Kommo vs GoHighLevel · Agente de IA vs chatbot · Cómo verificar un partner de Kommo · GoHighLevel en español · n8n vs Zapier vs Make · Preguntas frecuentes · Discovery Session
2. **Ficha de la entidad** (los mismos datos que el schema, llms.txt y Google Business Profile):
   - Nombre: Ingeniak
   - Razón social: Ingeniak Technology, LLC
   - Sede: Guadalajara, Jalisco, México
   - Oficina: Av. Punto Sur 312, Tlajomulco de Zúñiga, Jalisco 45640
   - Correo: contacto@ingeniak.mx
   - WhatsApp: +52 33 2101 7799
   - Alianza: Partner oficial de Kommo en LATAM (sello enlazado a https://www.kommo.com/)
   - Cifras: +73 sistemas en producción · 7 países: México, Estados Unidos, Colombia, Argentina, España, Costa Rica y Ecuador
3. **Redes:** https://www.instagram.com/ingeniakmx/ · https://www.facebook.com/ingeniakmx · https://www.linkedin.com/company/ingeniakmx.
4. **Legal y firma:** © 2026 Ingeniak. Todos los derechos reservados. · Aviso de privacidad · "Construimos empresarios libres, no héroes cansados." · el isotipo se vuelve a dibujar con trazo cian (firma de v1).

## 7. Breadcrumbs

- Forma: `Inicio › Hub › Página`. El separador es el nodo cuadrado cian de 4 px y la letra es JetBrains Mono de 12 px en muted.
- Va dentro de la columna de texto de la portada cinematográfica, encima del H1. No es una barra aparte.
- El último elemento es texto plano. Los nombres son cortos (los del menú, no el H1).
- No se muestra en `/` ni en `/404`. El mismo arreglo genera el `BreadcrumbList` (campo `breadcrumbs` del JSON).
- Excepciones de jerarquía: `/kommo/` y `/gohighlevel/` → `Inicio › Servicios › CRM con IA › …` aunque su URL sea de primer nivel. `/agentes-ia-guadalajara/`, `/kain/`, `/metodologia/`, `/tecnologias/` y `/nosotros/` cuelgan directo de Inicio.

| Página | Breadcrumb |
|---|---|
| `/servicios/` | Inicio › Servicios |
| `/servicios/consultoria-ia-empresas/` | Inicio › Servicios › Consultoría en IA |
| `/servicios/agentes-ia-whatsapp/` | Inicio › Servicios › Agentes de IA para WhatsApp |
| `/servicios/crm-con-ia/` | Inicio › Servicios › CRM con IA |
| `/kommo/` | Inicio › Servicios › CRM con IA › Partner oficial de Kommo |
| `/gohighlevel/` | Inicio › Servicios › CRM con IA › GoHighLevel |
| `/servicios/automatizacion-n8n/` | Inicio › Servicios › Automatización con n8n |
| `/servicios/paid-media/` | Inicio › Servicios › Paid media |
| `/servicios/paginas-web/` | Inicio › Servicios › Páginas web |
| `/servicios/desarrollo-software/` | Inicio › Servicios › Software a la medida |
| `/servicios/seo/` | Inicio › Servicios › SEO y visibilidad en IA |
| `/servicios/branding/` | Inicio › Servicios › Branding y contenido |
| `/industrias/` | Inicio › Industrias |
| `/industrias/salud/` | Inicio › Industrias › Salud |
| `/industrias/belleza-estetica/` | Inicio › Industrias › Belleza y estética |
| `/industrias/nutricion/` | Inicio › Industrias › Nutrición |
| `/industrias/finanzas/` | Inicio › Industrias › Finanzas |
| `/industrias/inmobiliario/` | Inicio › Industrias › Inmobiliario |
| `/industrias/industrial-logistica/` | Inicio › Industrias › Industrial y logística |
| `/industrias/retail-ecommerce/` | Inicio › Industrias › Retail y e-commerce |
| `/industrias/horeca/` | Inicio › Industrias › HoReCa |
| `/casos/` | Inicio › Casos |
| `/casos/clinica-dental-monterrey/` | Inicio › Casos › Clínica dental en Monterrey |
| `/casos/retail-multimarca-kommo/` | Inicio › Casos › Retail multimarca |
| `/casos/ecommerce-cdmx-costo-por-lead/` | Inicio › Casos › E-commerce en CDMX |
| `/casos/horeca-roas/` | Inicio › Casos › HoReCa |
| `/casos/logistica-n8n/` | Inicio › Casos › Logística |
| `/kain/` | Inicio › Kain |
| `/metodologia/` | Inicio › Metodología VKTOR™ |
| `/tecnologias/` | Inicio › Tecnologías |
| `/nosotros/` | Inicio › Nosotros |
| `/agentes-ia-guadalajara/` | Inicio › Agentes de IA en Guadalajara |
| `/preguntas-frecuentes/` | Inicio › Preguntas frecuentes |
| `/blog/` | Inicio › Blog |
| `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` | Inicio › Blog › Cuánto cuesta un agente de IA |
| `/blog/kommo-vs-gohighlevel/` | Inicio › Blog › Kommo vs GoHighLevel |
| `/blog/agente-ia-whatsapp-vs-chatbot/` | Inicio › Blog › Agente de IA vs chatbot |
| `/blog/como-verificar-partner-oficial-kommo/` | Inicio › Blog › Cómo verificar un partner de Kommo |
| `/blog/gohighlevel-en-espanol/` | Inicio › Blog › GoHighLevel en español |
| `/blog/n8n-vs-zapier-vs-make/` | Inicio › Blog › n8n vs Zapier vs Make |
| `/discovery/` | Inicio › Discovery Session |
| `/contacto/` | Inicio › Contacto |
| `/aviso-privacidad/` | Inicio › Aviso de privacidad |

## 8. Redirecciones desde el sitio actual

### 8.1 URLs indexadas hoy y su destino

Fuentes: el `sitemap.xml` vivo (28 URLs), una búsqueda `site:ingeniak.mx` (encontró 2 artículos que no están en el sitemap: `/blog/aplicaciones-ia-empresas-2026` y `/blog/kommo-vs-hubspot-cual-elegir`) y las URLs `/cotiza` y `/licenciaskommo` que menciona la investigación SEO. `/agentes-ia-whatsapp/` es una URL de v1 que nunca llegó a producción; se redirige por si alguien la compartió.

| URL actual | Acción | Destino |
|---|---|---|
| `/` | Se conserva | `/` |
| `/servicios` | Se conserva (Vercel agrega la barra final con un 308) | `/servicios/` |
| `/servicios/consultoria-ia-empresas` | Se conserva (Vercel agrega la barra final con un 308) | `/servicios/consultoria-ia-empresas/` |
| `/servicios/paid-media` | Se conserva (Vercel agrega la barra final con un 308) | `/servicios/paid-media/` |
| `/servicios/paginas-web` | Se conserva (Vercel agrega la barra final con un 308) | `/servicios/paginas-web/` |
| `/servicios/desarrollo-software` | Se conserva (Vercel agrega la barra final con un 308) | `/servicios/desarrollo-software/` |
| `/servicios/seo` | Se conserva (Vercel agrega la barra final con un 308) | `/servicios/seo/` |
| `/servicios/branding` | Se conserva (Vercel agrega la barra final con un 308) | `/servicios/branding/` |
| `/metodologia` | Se conserva (Vercel agrega la barra final con un 308) | `/metodologia/` |
| `/nosotros` | Se conserva (Vercel agrega la barra final con un 308) | `/nosotros/` |
| `/blog` | Se conserva (Vercel agrega la barra final con un 308) | `/blog/` |
| `/contacto` | Se conserva (Vercel agrega la barra final con un 308) | `/contacto/` |
| `/aviso-privacidad` | Se conserva (Vercel agrega la barra final con un 308) | `/aviso-privacidad/` |
| `/blog/7-errores-implementacion-ia-empresa-evitar` | **301** | `/servicios/consultoria-ia-empresas/` |
| `/blog/como-elegir-consultora-ia-mexico-checklist` | **301** | `/servicios/consultoria-ia-empresas/` |
| `/blog/aplicaciones-ia-empresas-2026` | **301** | `/servicios/consultoria-ia-empresas/` |
| `/servicios/agentes-ia` | **301** | `/servicios/agentes-ia-whatsapp/` |
| `/agentes-ia-whatsapp` | **301** | `/servicios/agentes-ia-whatsapp/` |
| `/servicios/crm-inteligente` | **301** | `/servicios/crm-con-ia/` |
| `/licenciaskommo` | **301** | `/kommo/` |
| `/blog/n8n-empresas-automatizaciones-ahorrar-tiempo` | **301** | `/servicios/automatizacion-n8n/` |
| `/servicios/contenido` | **301** | `/servicios/branding/` |
| `/blog/agentes-ia-conversacional-casos-roi` | **301** | `/casos/` |
| `/blog/automatizar-ventas-b2b-ia-crm-caso-roi` | **301** | `/casos/` |
| `/blog/metodologia-vktor-implementar-ia-roi-90-dias` | **301** | `/metodologia/` |
| `/blog/como-implementar-ia-empresa-guia-practica-2026` | **301** | `/metodologia/` |
| `/blog/roi-inteligencia-artificial-pyme-metricas-medir` | **301** | `/metodologia/` |
| `/blog/cuanto-cuesta-implementar-ia-empresa-mexico-2026` | **301** | `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` |
| `/blog/kommo-vs-gohighlevel-vs-hubspot-comparativo-2026` | **301** | `/blog/kommo-vs-gohighlevel/` |
| `/blog/kommo-vs-hubspot-cual-elegir` | **301** | `/blog/kommo-vs-gohighlevel/` |
| `/blog/agente-ia-vs-chatbot-tradicional-diferencias` | **301** | `/blog/agente-ia-whatsapp-vs-chatbot/` |
| `/blog/agentes-ia-whatsapp-business-guia-2026` | **301** | `/blog/agente-ia-whatsapp-vs-chatbot/` |
| `/cotiza` | **301** | `/discovery/` |

### 8.2 Bloque para `vercel.json`

Va completo en `D-redirects.json`, con cada origen en dos versiones, con y sin barra final. Configuración base:

```json
{
  "cleanUrls": true,
  "trailingSlash": true,
  "redirects": [
    {
      "source": "/blog/7-errores-implementacion-ia-empresa-evitar",
      "destination": "/servicios/consultoria-ia-empresas/",
      "permanent": true
    },
    {
      "source": "/blog/como-elegir-consultora-ia-mexico-checklist",
      "destination": "/servicios/consultoria-ia-empresas/",
      "permanent": true
    },
    {
      "source": "/blog/aplicaciones-ia-empresas-2026",
      "destination": "/servicios/consultoria-ia-empresas/",
      "permanent": true
    },
    {
      "…": "37 más en D-redirects.json"
    }
  ]
}
```

Notas importantes:

- **No uses comodines** como `/servicios/:path*` o `/blog/:path*` (v1 los tenía). En Vercel, las redirecciones se evalúan antes que los archivos, así que esos comodines secuestrarían las páginas nuevas `/servicios/paid-media/`, `/blog/kommo-vs-gohighlevel/`, etc. Cualquier URL vieja que no esté en la lista cae en el 404, que tiene enlaces de rescate.
- Las redirecciones de v1 a anclas (`/nosotros` → `/#equipo`, `/contacto` → `/discovery/`, `/blog` → `/`) **se eliminan**: ahora esas páginas existen.
- Tras publicar, revisa cada origen con `curl -sI https://ingeniak.mx/servicios/agentes-ia` y su versión con `/` final. Debe responder **un solo salto** 301 o 308 a la URL final con 200.
- Si en el build se usa `@astrojs/vercel`, las redirecciones pueden declararse en `astro.config.mjs` (leyendo `D-redirects.json`), y el adaptador las emite como redirecciones reales de Vercel. Usa una sola fuente: `vercel.json` o `astro.config`, no las dos.

### 8.3 Otras rutas del dominio

- **`?lang=en`**: el sitemap actual declara versiones en inglés como `?lang=en`. El sitio nuevo es solo es-MX: esas URLs sirven la misma página en español con `rel=canonical` sin parámetros, y el sitemap nuevo no lleva `hreflang`. No hace falta una redirección (y así se evita cualquier bucle). Si más adelante hay inglés, que viva en `/en/`.
- **Subdominios `fashionbox.ingeniak.mx` y `login.ingeniak.mx`** aparecen indexados. Al apuntar el dominio a Vercel, cambia solo los registros de `ingeniak.mx` y `www`, y deja intactos los de los subdominios.
- Imágenes viejas indexadas (`/hero-robot.webp`, `/assets/*`): dejarán de existir. No vale la pena redirigirlas.

## 9. Mapa de keywords (una por URL, sin canibalización)

Volumen sin datos: la prioridad viene de la investigación SEO. Valida los volúmenes en Keyword Planner o Ahrefs antes de cerrar el contenido.

| URL | Keyword principal | Secundarias |
|---|---|---|
| `/` | agencia de IA para empresas en México | Ingeniak; agentes de IA para empresas; consultora de inteligencia artificial México; agentizamos empresas |
| `/servicios/` | servicios de inteligencia artificial para empresas | servicios de IA; automatización con IA para empresas; implementación de IA |
| `/servicios/consultoria-ia-empresas/` | consultoría en inteligencia artificial para empresas | consultoría de IA México; consultor de IA para empresas; asesoría en inteligencia artificial; cómo implementar IA en una empresa |
| `/servicios/agentes-ia-whatsapp/` | agentes de IA para WhatsApp | agente de IA WhatsApp Business; chatbot WhatsApp con IA para negocios; bot de WhatsApp con IA para ventas; atención automática WhatsApp |
| `/servicios/crm-con-ia/` | CRM con inteligencia artificial | CRM con IA; CRM para WhatsApp; mejor CRM para WhatsApp México; CRM inteligente |
| `/kommo/` | partner Kommo México | implementación Kommo; Kommo CRM México; licencias Kommo; Kommo en español; Kommo + WhatsApp |
| `/gohighlevel/` | implementación GoHighLevel en español | GoHighLevel México; GoHighLevel en español; agencia GoHighLevel; qué es GoHighLevel |
| `/servicios/automatizacion-n8n/` | automatización con n8n | agencia n8n México; expertos n8n; automatización de procesos con IA; n8n para empresas |
| `/servicios/paid-media/` | agencia de paid media Meta Ads y Google Ads | publicidad en Meta Ads; Google Ads para empresas; TikTok Ads México; campañas conectadas a CRM |
| `/servicios/paginas-web/` | páginas web de alta conversión | diseño web para empresas; landing page de alta conversión; página web conectada a CRM |
| `/servicios/desarrollo-software/` | desarrollo de software a la medida con IA | software a la medida México; desarrollo de sistemas para empresas; dashboard unificado |
| `/servicios/seo/` | SEO y visibilidad en ChatGPT | posicionamiento en buscadores e IA; GEO generative engine optimization; aparecer en ChatGPT; SEO México |
| `/servicios/branding/` | branding y contenido para empresas | agencia de branding Guadalajara; estrategia de contenido; identidad de marca premium |
| `/industrias/` | inteligencia artificial por industria | IA para clínicas; IA para inmobiliarias; IA para restaurantes; IA para e-commerce |
| `/industrias/salud/` | agente de IA para clínicas | IA para clínicas dentales; agendar citas por WhatsApp; software para agendar citas clínica |
| `/industrias/belleza-estetica/` | agente de IA para estéticas y spas | IA para salones de belleza; agenda por WhatsApp para spa; chatbot para clínica estética |
| `/industrias/nutricion/` | agente de IA para nutriólogos | agenda para nutriólogos por WhatsApp; IA para clínicas de nutrición; seguimiento de pacientes nutrición |
| `/industrias/finanzas/` | IA para empresas financieras | CRM para financieras; calificación de prospectos de crédito; automatización para despachos contables; IA para aseguradoras |
| `/industrias/inmobiliario/` | agente de IA para inmobiliarias | CRM para inmobiliarias; chatbot WhatsApp inmobiliaria; IA para desarrolladoras |
| `/industrias/industrial-logistica/` | automatización con IA para logística | automatización de procesos industriales; n8n para logística; integración ERP CRM WhatsApp |
| `/industrias/retail-ecommerce/` | IA para e-commerce | CRM para retail; Kommo para tiendas; vender por WhatsApp e-commerce; dashboard e-commerce |
| `/industrias/horeca/` | marketing con IA para restaurantes y hoteles | IA para restaurantes; reservas por WhatsApp; publicidad para hoteles; HoReCa |
| `/casos/` | casos de éxito inteligencia artificial | casos de éxito agentes de IA; resultados automatización empresas; casos Kommo |
| `/casos/clinica-dental-monterrey/` | agente de IA para clínica dental | caso de éxito clínica dental IA; agendar citas WhatsApp dentista |
| `/casos/retail-multimarca-kommo/` | caso de éxito Kommo | Kommo retail; calificación de leads con IA; CRM para tiendas multimarca |
| `/casos/ecommerce-cdmx-costo-por-lead/` | reducir costo por lead e-commerce | caso de éxito e-commerce México; costo por lead Meta Ads |
| `/casos/horeca-roas/` | caso de éxito publicidad restaurantes | ROAS restaurantes; Meta Ads hoteles; paid media HoReCa |
| `/casos/logistica-n8n/` | caso de éxito automatización n8n | automatización logística; n8n caso real; integración ERP WhatsApp |
| `/kain/` | kain agente de IA | plataforma de agentes de IA; app.kain.mx; agente de IA para WhatsApp |
| `/metodologia/` | metodología VKTOR | metodología para implementar IA; cómo implementar IA en una pyme en 90 días; VKTOR Ingeniak |
| `/tecnologias/` | herramientas de IA y automatización para empresas | stack de IA; Kommo n8n OpenAI; integraciones CRM WhatsApp |
| `/nosotros/` | Ingeniak equipo | quiénes somos Ingeniak; consultoría de IA en Guadalajara; Ingeniak opiniones |
| `/agentes-ia-guadalajara/` | agentes de IA Guadalajara | agencia de IA Guadalajara; agencia de inteligencia artificial Jalisco; IA para empresas Zapopan; consultoría IA Tlajomulco |
| `/preguntas-frecuentes/` | preguntas frecuentes agentes de IA | cuánto cuesta un agente de IA; qué es un agente de IA para WhatsApp; Kommo o GoHighLevel |
| `/blog/` | blog inteligencia artificial para empresas | guías de IA para pymes; agentes de IA guía; Kommo guía |
| `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` | cuánto cuesta un agente de IA para WhatsApp | precio chatbot WhatsApp México; cuánto cuesta implementar IA en una empresa; costo agente de IA |
| `/blog/kommo-vs-gohighlevel/` | Kommo vs GoHighLevel | mejor CRM para WhatsApp; Kommo o GoHighLevel; Kommo vs HubSpot |
| `/blog/agente-ia-whatsapp-vs-chatbot/` | agente de IA para WhatsApp vs chatbot | qué es un agente de IA; agente de IA vs chatbot; Meta Business AI vs agente a la medida |
| `/blog/como-verificar-partner-oficial-kommo/` | partner oficial Kommo | cómo elegir partner Kommo; directorio partners Kommo; partner Kommo México |
| `/blog/gohighlevel-en-espanol/` | GoHighLevel en español | qué es GoHighLevel; GoHighLevel México; cómo implementar GoHighLevel |
| `/blog/n8n-vs-zapier-vs-make/` | n8n vs Zapier vs Make | qué es n8n; alternativa a Zapier; automatización para empresas |
| `/discovery/` | Discovery Session Ingeniak | diagnóstico gratuito de IA; llamada de diagnóstico gratis; asesoría gratuita automatización |
| `/contacto/` | contacto Ingeniak | Ingeniak teléfono; Ingeniak dirección; agencia de IA Tlajomulco |
| `/aviso-privacidad/` | aviso de privacidad Ingeniak |  |

Decisiones para evitar canibalización:

- **Inicio vs Consultoría:** el inicio apunta a "agencia de IA / agentes de IA para empresas" y a la marca; "consultoría en IA para empresas" es de `/servicios/consultoria-ia-empresas/`, que ya era la página pilar (prioridad 0.95 en el sitemap actual).
- **CRM con IA vs Kommo vs GoHighLevel:** el término genérico va al hub `/servicios/crm-con-ia/`; los términos de marca, a su propia página.
- **Agentes de IA para WhatsApp (servicio) vs artículo agente vs chatbot:** el servicio apunta a la intención comercial; el artículo, a la informativa ("qué es", "diferencias").
- **Agentes de IA en Guadalajara:** solo la intención local. El resto de las páginas no menciona la ciudad en el title.

## 10. Enlazado interno

- Cada página enlaza a `/discovery/` (botón principal) y, con un WhatsApp único, a Kain.
- Servicio ↔ industria ↔ caso: cada servicio enlaza a 1 o 2 casos y a las industrias donde más rinde; cada caso enlaza a su servicio y a su industria; cada industria, a sus servicios recomendados.
- Los artículos enlazan a su página comercial en la respuesta corta, en el CTA intermedio y en "Sigue explorando".
- Los enlaces dentro del texto usan anclas descriptivas ("implementación de Kommo", nunca "aquí").
- Los hubs enlazan a todos sus hijos. El footer, con el logo que lleva al inicio, enlaza a las 44 páginas indexables.

Matriz de enlaces entrantes (cuántas páginas enlazan a cada URL desde el cuerpo; el menú y el footer no se cuentan):

| URL | Entrantes |
|---|---|
| `/discovery/` | 39 |
| `/servicios/agentes-ia-whatsapp/` | 18 |
| `/kommo/` | 18 |
| `/servicios/crm-con-ia/` | 16 |
| `/gohighlevel/` | 13 |
| `/servicios/automatizacion-n8n/` | 13 |
| `/casos/` | 12 |
| `/servicios/paid-media/` | 10 |
| `/casos/clinica-dental-monterrey/` | 9 |
| `/kain/` | 8 |
| `/servicios/desarrollo-software/` | 7 |
| `/casos/retail-multimarca-kommo/` | 6 |
| `/metodologia/` | 6 |
| `/blog/kommo-vs-gohighlevel/` | 6 |
| `/servicios/paginas-web/` | 5 |
| `/industrias/salud/` | 5 |
| `/casos/logistica-n8n/` | 5 |
| `/servicios/` | 4 |
| `/servicios/consultoria-ia-empresas/` | 4 |
| `/industrias/` | 4 |
| `/industrias/retail-ecommerce/` | 4 |
| `/nosotros/` | 4 |
| `/agentes-ia-guadalajara/` | 4 |
| `/servicios/seo/` | 3 |
| `/servicios/branding/` | 3 |
| `/industrias/industrial-logistica/` | 3 |
| `/industrias/horeca/` | 3 |
| `/casos/ecommerce-cdmx-costo-por-lead/` | 3 |
| `/casos/horeca-roas/` | 3 |
| `/tecnologias/` | 3 |
| `/blog/` | 3 |
| `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` | 3 |
| `/blog/agente-ia-whatsapp-vs-chatbot/` | 3 |
| `/blog/n8n-vs-zapier-vs-make/` | 3 |
| `/contacto/` | 3 |
| `/` | 2 |
| `/industrias/belleza-estetica/` | 2 |
| `/industrias/nutricion/` | 2 |
| `/preguntas-frecuentes/` | 2 |
| `/blog/como-verificar-partner-oficial-kommo/` | 2 |
| `/blog/gohighlevel-en-espanol/` | 2 |
| `/aviso-privacidad/` | 2 |
| `/industrias/finanzas/` | 1 |
| `/industrias/inmobiliario/` | 1 |

## 11. Datos estructurados (JSON-LD)

Un solo `@graph` por página con `@id` estables, para que todo apunte a la misma entidad:

- `https://ingeniak.mx/#organization`: **Organization** (name Ingeniak, legalName Ingeniak Technology, LLC, logo, address de Tlajomulco, email, telephone confirmado, `sameAs` de Instagram, Facebook y LinkedIn, `brand` kain → https://app.kain.mx/, `knowsAbout`). Va en todas las páginas, completa en el inicio y en Nosotros y como referencia `@id` en las demás.
- `https://ingeniak.mx/#localbusiness`: **ProfessionalService** (address, `geo` [POR CONFIRMAR lat/long], `openingHoursSpecification` [VALIDAR L–V 09:00–18:00], `areaServed`, `priceRange` "Desde USD 997 al mes"). Va en el inicio, Guadalajara y Contacto.
- `https://ingeniak.mx/#website`: **WebSite** (inLanguage es-MX, publisher → #organization). Va en el inicio.
- Por página: **WebPage** (o CollectionPage, AboutPage o ContactPage) con `isPartOf` #website, `breadcrumb` y `about`.
- Servicios e industrias: **Service** con `provider` #organization, `serviceType`, `areaServed` (México y Latinoamérica), `audience` (BusinessAudience con el sector) en las industrias, y `offers` solo con "desde USD 997 al mes" si se decide mostrarlo.
- Casos: **Article** con `author` Person (del equipo), `datePublished`, `dateModified` y `about` → Service. Artículos: **BlogPosting** con los mismos campos y `wordCount`.
- Metodología: **HowTo** con 5 `HowToStep` (Verify, Koncept, Transform, Operate, Rise) con el texto visible.
- Nosotros: 6 **Person** (name, jobTitle, image, `worksFor` #organization, `sameAs` a LinkedIn [POR CONFIRMAR]).
- kain: **Brand** + **SoftwareApplication** (applicationCategory BusinessApplication, url https://app.kain.mx/), sin `offers` ni `aggregateRating` hasta tener datos reales.
- **FAQPage** solo con las preguntas visibles de esa página (texto idéntico, del banco de la sección 12).
- Discovery: **Service** con **Offer** de precio 0 (llamada gratuita), como en v1.
- 404: sin schema y con `noindex`.

## 12. Banco de preguntas frecuentes

Cada página toma sus preguntas de este banco por id, así el texto visible y el FAQPage son siempre idénticos en todo el sitio. Las marcadas como **validar** son redacciones nuevas que el cliente debe aprobar antes de publicarlas.

| Id | Pregunta | Estado | Fuente | Páginas |
|---|---|---|---|---|
| G01 | ¿Qué es Ingeniak? | aprobada | v1 inicio | `/`, `/nosotros/`, `/preguntas-frecuentes/` |
| G02 | ¿Qué es un agente de IA para WhatsApp? | aprobada | v1 inicio | `/`, `/servicios/agentes-ia-whatsapp/`, `/industrias/salud/`, `/industrias/belleza-estetica/`, `/industrias/nutricion/`, `/industrias/inmobiliario/`, `/industrias/horeca/`, `/preguntas-frecuentes/`, `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/`, `/blog/agente-ia-whatsapp-vs-chatbot/` |
| G03 | ¿En qué se diferencia un agente de IA de un chatbot tradicional? | aprobada | v1 inicio | `/servicios/agentes-ia-whatsapp/`, `/preguntas-frecuentes/`, `/blog/agente-ia-whatsapp-vs-chatbot/` |
| G04 | ¿Ingeniak es partner oficial de Kommo? | aprobada | v1 inicio | `/`, `/servicios/crm-con-ia/`, `/kommo/`, `/nosotros/`, `/agentes-ia-guadalajara/`, `/preguntas-frecuentes/`, `/blog/kommo-vs-gohighlevel/`, `/blog/como-verificar-partner-oficial-kommo/` |
| G05 | ¿Me conviene Kommo o GoHighLevel? | aprobada | v1 inicio | `/servicios/`, `/servicios/crm-con-ia/`, `/kommo/`, `/gohighlevel/`, `/industrias/inmobiliario/`, `/industrias/retail-ecommerce/`, `/preguntas-frecuentes/`, `/blog/kommo-vs-gohighlevel/` |
| G06 | ¿Qué puedo automatizar con n8n? | aprobada | v1 inicio | `/servicios/automatizacion-n8n/`, `/industrias/industrial-logistica/`, `/preguntas-frecuentes/`, `/blog/n8n-vs-zapier-vs-make/` |
| G07 | ¿Cuánto cuesta trabajar con Ingeniak? | aprobada | v1 inicio | `/`, `/servicios/`, `/servicios/consultoria-ia-empresas/`, `/servicios/crm-con-ia/`, `/gohighlevel/`, `/servicios/automatizacion-n8n/`, `/servicios/paid-media/`, `/servicios/paginas-web/`, `/servicios/desarrollo-software/`, `/servicios/seo/`, `/servicios/branding/`, `/industrias/salud/`, `/industrias/belleza-estetica/`, `/industrias/nutricion/`, `/industrias/finanzas/`, `/industrias/inmobiliario/`, `/industrias/industrial-logistica/`, `/industrias/retail-ecommerce/`, `/industrias/horeca/`, `/agentes-ia-guadalajara/`, `/preguntas-frecuentes/`, `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` |
| G08 | ¿En cuánto tiempo veo resultados? | aprobada | v1 inicio | `/`, `/servicios/`, `/servicios/consultoria-ia-empresas/`, `/servicios/automatizacion-n8n/`, `/servicios/paid-media/`, `/servicios/paginas-web/`, `/servicios/desarrollo-software/`, `/servicios/seo/`, `/industrias/`, `/industrias/industrial-logistica/`, `/industrias/retail-ecommerce/`, `/metodologia/`, `/preguntas-frecuentes/`, `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` |
| G09 | ¿Qué modelos de IA usan? | aprobada | v1 inicio | `/servicios/`, `/servicios/consultoria-ia-empresas/`, `/servicios/agentes-ia-whatsapp/`, `/servicios/desarrollo-software/`, `/tecnologias/`, `/blog/n8n-vs-zapier-vs-make/` |
| G10 | ¿Solo trabajan con empresas de Guadalajara? | aprobada | v1 inicio | `/industrias/`, `/nosotros/`, `/agentes-ia-guadalajara/`, `/preguntas-frecuentes/` |
| G11 | ¿Cómo empiezo a trabajar con Ingeniak? | aprobada | v1 inicio | `/`, `/industrias/`, `/metodologia/`, `/agentes-ia-guadalajara/`, `/preguntas-frecuentes/` |
| G12 | ¿Qué es la metodología VKTOR™? | aprobada | investigación SEO §5, verbos del brief | `/metodologia/`, `/preguntas-frecuentes/` |
| G13 | ¿Qué es kain? | aprobada | guía de marca + llms.txt v1 | `/kain/`, `/preguntas-frecuentes/` |
| G14 | ¿Además de IA, hacen publicidad y sitios web? | aprobada | investigación SEO §5 | `/servicios/paid-media/`, `/servicios/paginas-web/`, `/servicios/seo/`, `/servicios/branding/`, `/industrias/horeca/`, `/preguntas-frecuentes/` |
| G15 | ¿Qué resultados han logrado sus clientes? | aprobada | investigación SEO §5 | `/preguntas-frecuentes/` |
| K01 | ¿Me venden las licencias de Kommo o solo la implementación? | aprobada | v1 /kommo/ | `/kommo/`, `/preguntas-frecuentes/`, `/blog/kommo-vs-gohighlevel/`, `/blog/como-verificar-partner-oficial-kommo/` |
| K02 | ¿Se puede conectar WhatsApp a Kommo? | aprobada | v1 /kommo/ | `/kommo/`, `/preguntas-frecuentes/` |
| K03 | ¿Qué resultados han logrado con Kommo? | aprobada | v1 /kommo/ | `/kommo/`, `/industrias/retail-ecommerce/` |
| K04 | ¿Cuánto cuesta implementar Kommo con Ingeniak? | aprobada | v1 /kommo/ | `/kommo/`, `/blog/como-verificar-partner-oficial-kommo/` |
| H01 | ¿Qué es GoHighLevel? | aprobada | v1 /gohighlevel/ | `/gohighlevel/`, `/preguntas-frecuentes/`, `/blog/gohighlevel-en-espanol/` |
| H02 | ¿Implementan GoHighLevel en español? | aprobada | v1 /gohighlevel/ | `/gohighlevel/`, `/preguntas-frecuentes/`, `/blog/gohighlevel-en-espanol/` |
| H03 | ¿Se puede conectar un agente de IA a GoHighLevel? | aprobada | v1 /gohighlevel/ | `/servicios/crm-con-ia/`, `/gohighlevel/` |
| H04 | ¿Ingeniak es partner de GoHighLevel? | validar | reglas de LOGOS.md | `/gohighlevel/`, `/tecnologias/`, `/preguntas-frecuentes/`, `/blog/kommo-vs-gohighlevel/`, `/blog/gohighlevel-en-espanol/` |
| W01 | ¿Qué resultados ha dado un agente de IA en WhatsApp? | aprobada | v1 /agentes-ia-whatsapp/ | `/servicios/agentes-ia-whatsapp/`, `/industrias/salud/`, `/preguntas-frecuentes/`, `/blog/agente-ia-whatsapp-vs-chatbot/` |
| W02 | ¿El agente se conecta a mi CRM? | aprobada | v1 /agentes-ia-whatsapp/ | `/servicios/agentes-ia-whatsapp/`, `/industrias/salud/`, `/industrias/finanzas/`, `/kain/`, `/tecnologias/`, `/preguntas-frecuentes/` |
| W03 | ¿Cuánto cuesta un agente de IA para WhatsApp? | aprobada | v1 /agentes-ia-whatsapp/ | `/servicios/agentes-ia-whatsapp/`, `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` |
| L01 | ¿Dónde está la oficina de Ingeniak? | aprobada | v1 /agentes-ia-guadalajara/ | `/nosotros/`, `/agentes-ia-guadalajara/`, `/preguntas-frecuentes/` |
| L02 | ¿Qué servicios de IA ofrecen en Guadalajara? | aprobada | v1 /agentes-ia-guadalajara/ | `/agentes-ia-guadalajara/` |
| D01 | ¿De verdad es gratuita? | aprobada | agenda.ingeniak.tech/discovery | `/preguntas-frecuentes/`, `/discovery/` |
| D02 | ¿Me van a vender durante la llamada? | aprobada | agenda.ingeniak.tech/discovery | `/preguntas-frecuentes/`, `/discovery/` |
| D03 | ¿Qué preparo para la llamada? | aprobada | agenda.ingeniak.tech/discovery | `/discovery/` |
| D04 | ¿Qué pasa después de la llamada? | aprobada | agenda.ingeniak.tech/discovery | `/discovery/` |
| D05 | ¿Puedo reagendar? | aprobada | agenda.ingeniak.tech/discovery | `/discovery/` |
| D06 | ¿Y si mi negocio es muy pequeño o muy grande? | aprobada | agenda.ingeniak.tech/discovery | `/preguntas-frecuentes/`, `/discovery/` |
| N01 | ¿Kain da consejo médico o legal? | aprobada | guía de marca, regla 5 | `/industrias/salud/`, `/industrias/nutricion/`, `/kain/`, `/preguntas-frecuentes/`, `/blog/agente-ia-whatsapp-vs-chatbot/` |
| N02 | ¿La inversión en pauta está incluida? | validar | sitio actual: 'inversión en pauta siempre por separado' | `/servicios/paid-media/`, `/industrias/horeca/`, `/preguntas-frecuentes/` |
| N03 | ¿Qué es un CRM con IA? | validar | definición nueva | `/servicios/crm-con-ia/` |
| N04 | ¿Qué es la visibilidad en IA o GEO? | validar | investigación SEO §3 | `/servicios/seo/`, `/preguntas-frecuentes/` |
| N05 | ¿Qué es n8n? | validar | investigación SEO §5 (pregunta 6) | `/servicios/automatizacion-n8n/`, `/industrias/industrial-logistica/`, `/preguntas-frecuentes/`, `/blog/n8n-vs-zapier-vs-make/` |
| N06 | ¿Qué hace una consultoría de inteligencia artificial? | validar | tarjeta de servicio v1 | `/servicios/consultoria-ia-empresas/` |
| N07 | ¿Trabajan con pymes? | aprobada | agenda.ingeniak.tech/discovery | `/servicios/`, `/servicios/consultoria-ia-empresas/`, `/preguntas-frecuentes/` |
| N08 | ¿Cuándo conviene el software a la medida? | validar | caso 1 vista · 7 fuentes | `/servicios/desarrollo-software/` |
| N09 | ¿La página web se conecta a mi CRM y a WhatsApp? | validar | tarjeta de servicio v1 | `/servicios/paginas-web/`, `/preguntas-frecuentes/` |
| N10 | ¿Hacen branding y contenido además de la parte técnica? | validar | tarjeta de servicio v1 | `/servicios/branding/` |
| N11 | ¿Pueden ayudarme aunque no tengan un caso publicado de mi sector? | validar | sectores del sitio actual | `/industrias/`, `/industrias/belleza-estetica/`, `/industrias/nutricion/`, `/industrias/finanzas/`, `/industrias/inmobiliario/` |
| N12 | ¿Dónde trabaja Kain? | aprobada | v1 sección Kain | `/industrias/belleza-estetica/`, `/kain/`, `/preguntas-frecuentes/` |
| N13 | ¿Qué es app.kain.mx? | aprobada | guía de marca §1 | `/kain/` |
| N14 | ¿El agente da asesoría financiera? | validar | nueva (extensión de la regla 5 de marca) | `/industrias/finanzas/` |
| N15 | ¿Qué es GoHighLevel en español? | validar | v1 /gohighlevel/ | `/blog/gohighlevel-en-espanol/` |

Las respuestas completas están en `D-sitemap.json` (`faq[].a`) y, para las nuevas, aquí:

- **H04 · ¿Ingeniak es partner de GoHighLevel?** No usamos esa etiqueta. GoHighLevel es una herramienta que implementamos en español para nuestros clientes; nuestra alianza oficial es con Kommo, como partner en Latinoamérica.
- **N02 · ¿La inversión en pauta está incluida?** No. La inversión publicitaria se paga aparte, directo a Meta, Google o TikTok. Nuestro trabajo es la estrategia, los creativos, la medición y la conexión de tus campañas con tu CRM.
- **N03 · ¿Qué es un CRM con IA?** Es un CRM que, además de guardar contactos y oportunidades, usa inteligencia artificial para atender, calificar y dar seguimiento: un agente responde en el chat, registra al prospecto en su etapa y dispara recordatorios y tareas sin que nadie capture datos a mano.
- **N04 · ¿Qué es la visibilidad en IA o GEO?** Es lograr que los motores de respuesta, como ChatGPT, Gemini, Perplexity, Claude y los AI Overviews de Google, encuentren, entiendan y citen a tu empresa. Se trabaja con contenido en HTML que se pueda citar, datos estructurados que coincidan con el texto visible, perfiles externos consistentes y permisos para sus rastreadores.
- **N05 · ¿Qué es n8n?** n8n es una herramienta para conectar aplicaciones y crear flujos automáticos, incluidos flujos con agentes de IA. La usamos para que tu CRM, WhatsApp, formularios y sistemas internos intercambien información sin capturas a mano.
- **N06 · ¿Qué hace una consultoría de inteligencia artificial?** Detecta en qué procesos de tu empresa la IA ahorra tiempo o trae ventas, diseña cómo implementarla y la pone en producción con métricas. En Ingeniak incluye diagnóstico, roadmap, casos de uso y retorno medible en 90 días, con la metodología VKTOR™.
- **N08 · ¿Cuándo conviene el software a la medida?** Cuando ninguna herramienta del mercado encaja con tu operación o necesitas unir varias fuentes en un solo lugar. Para un e-commerce, por ejemplo, unificamos 7 fuentes de datos en un solo tablero.
- **N09 · ¿La página web se conecta a mi CRM y a WhatsApp?** Sí. La conectamos a tu CRM y a WhatsApp desde el primer día, para que cada formulario o mensaje entre como lead en su etapa y se pueda medir hasta la venta.
- **N10 · ¿Hacen branding y contenido además de la parte técnica?** Sí. Creamos identidad y contenido con estrategia para que tu marca se vea como la opción premium y alimente tus campañas, tu web y tus agentes de IA.
- **N11 · ¿Pueden ayudarme aunque no tengan un caso publicado de mi sector?** Sí. Trabajamos con empresas de salud, belleza, nutrición, finanzas, inmobiliario e industria, entre otros sectores. En la Discovery Session revisamos tu operación y te decimos qué conviene automatizar primero.
- **N14 · ¿El agente da asesoría financiera?** No. El agente responde con la información que tu empresa aprueba, califica al prospecto y agenda la llamada con tu asesor. Las recomendaciones las da tu equipo.
- **N15 · ¿Qué es GoHighLevel en español?** Es la misma plataforma GoHighLevel, configurada para operar en español: cuenta, embudos, mensajes, automatizaciones y capacitación del equipo. En Ingeniak hacemos esa implementación completa en español.

## 13. Ficha de cada página

Leyenda: **[CINE]** = sección cinematográfica (imagen a sangre como fondo de la sección, sujeto de un lado y texto del otro). Los enlaces de WhatsApp completos, ya codificados, están en `D-sitemap.json` → `secondaryCta.href`.

### 13.1 Núcleo

#### `/` · Inicio

| Campo | Valor |
|---|---|
| Plantilla · estado | T-HOME · conserva URL |
| Propósito | Explicar en 10 segundos qué es Ingeniak, probarlo con cifras y llevar a la Discovery Session; repartir autoridad a servicios, industrias y casos. |
| Keyword principal | agencia de IA para empresas en México |
| Title (55) | Agencia de IA: agentes, CRM y automatización \| Ingeniak |
| Meta description (155) | Agentes de IA para WhatsApp, CRM con Kommo y GoHighLevel y automatización con n8n en un solo sistema. Partner oficial de Kommo. Resultados en 60 a 90 días. |
| H1 | Agentizamos empresas: agentes de IA, CRM y automatización en un solo sistema |
| Breadcrumb | — |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de inicio de ingeniak.mx y quiero ver cómo un agente de IA atendería mi negocio." |
| JSON-LD | Organization, ProfessionalService, WebSite, WebPage, FAQPage |
| Enlaces internos | `/servicios/`, `/servicios/agentes-ia-whatsapp/`, `/servicios/crm-con-ia/`, `/kommo/`, `/gohighlevel/`, `/servicios/automatizacion-n8n/`, `/industrias/`, `/casos/`, `/kain/`, `/metodologia/`, `/nosotros/`, `/preguntas-frecuentes/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: H1 + subtítulo 'Diseñamos e implementamos agentes de IA, CRM y automatizaciones conectados en un solo sistema que atiende, califica y cierra por ti, 24/7.' + Discovery + 'Escríbele a Kain' + línea de confianza 'Partner oficial de Kommo en LATAM · +73 sistemas en producción · 7 países'. Chips de cristal (Agente IA, CRM, Automatización, Datos) conectados por las ramas del isotipo.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN de pie en el tercio derecho sobre piso negro brillante con reflejo; detrás, ramas de luz cian que se bifurcan hacia la izquierda y se pierden en la penumbra; ondas sedosas azul marino al fondo; mitad izquierda limpia en navy profundo. Celular: 9:16: KAIN arriba al centro (55% superior), ramas de luz bajando; 45% inferior en penumbra para el texto.
2. **Herramientas**: Franja de logos en blanco (n8n, OpenAI, Claude, Gemini, WhatsApp Business, Meta Ads, Google Ads, TikTok Ads, Make, Zapier, Supabase, Stripe) + sello Kommo Partner enlazado a kommo.com.
3. **El problema** **[CINE]**: Eyebrow 'El problema' + 'Tu negocio no necesita más esfuerzo. Necesita dejar de depender de ti.' + 4 dolores en ámbar (Mensajes sin responder, Un CRM que nadie usa, Anuncios que no se traducen en ventas, Todo pasa por ti), cada uno con su salida en cian. Remate: 'No te falta esfuerzo. Te falta un sistema.'
   - Imagen: dueño de pyme (45 años), sujeto a la izquierda, texto a la derecha. Dueño de negocio de noche en su local vacío, rostro iluminado por el celular lleno de notificaciones; luz ámbar cálida y cansada sobre él; mitad derecha en sombra profunda casi negra. Celular: 4:5: persona arriba, sombra abajo para la lista de dolores.
4. **El sistema Ingeniak**: 'Creamos el tráfico, lo convertimos y lo operamos automáticamente.' 5 etapas fijadas al scroll (Atraer, Atender, Organizar, Automatizar, Medir) con el motion graphic de Remotion (video/sistema-1920) sincronizado; cada etapa enlaza a su servicio.
5. **¿Qué es Ingeniak?**: Bloque definicional de 50 palabras citable tal cual (G01) + 'Ingeniak en datos': +73 sistemas, 7 países, 12 → 47 citas/mes (salud), −58% CPL en 60 días (e-commerce CDMX) + lista de los 7 países. Nota 'datos internos, octubre de 2026'.
6. **Servicios**: 11 tarjetas de cristal en 3 grupos (Atraer · Atender y vender · Operar y escalar), cada una con una línea y enlace a su página; botón 'Ver todos los servicios' → /servicios/.
7. **Conoce a Kain** **[CINE]**: 'Soy Kain, el agente de IA de tu empresa. Respondo, agendo y confirmo por ti en WhatsApp, Instagram y tu web, y registro cada conversación en tu CRM.' + 4 viñetas + slogan 'Tu negocio trabajando, sin depender más de ti.' + video del chat (kain-chat) en un celular de cristal junto a KAIN + 'Escríbele a Kain' + enlace /kain/ y app.kain.mx.
   - Imagen: KAIN de cuerpo completo saludando, sujeto a la izquierda, texto a la derecha. KAIN saludando en el tercio izquierdo, de pie junto a un celular de cristal flotante con la pantalla vacía (el chat va en video HTML encima); halo cian; derecha en navy limpio. Celular: 9:16: KAIN y el celular arriba, texto abajo sobre degradado.
8. **Industrias**: 8 tarjetas con imagen (Salud, Belleza, Nutrición, Finanzas, Inmobiliario, Industrial y logística, Retail y e-commerce, HoReCa) → /industrias/*.
9. **Casos de éxito**: 'Sistemas reales, operando hoy mismo.' 5 tarjetas con la cifra como titular (3.2×, +340%, −58%, ROAS 4.8×, 27 procesos) → /casos/*; botón 'Ver todos los casos'.
10. **Metodología VKTOR™**: 'Tu crecimiento tiene un protocolo. Nosotros lo activamos.' 5 fases en línea de tiempo con trazo cian que se dibuja al hacer scroll → /metodologia/.
11. **El equipo** **[CINE]**: 'Estrategas que construyen, operan y miden.' + 'No somos una agencia tradicional…' + 6 nombres y cargos en línea + enlace /nosotros/.
   - Imagen: equipo real de Ingeniak (foto team-hero), sujeto a la derecha, texto a la izquierda. Foto real del equipo sin alterar rostros; extender el lienzo hacia la izquierda con outpainting en navy con ondas sedosas; luz de borde cian sutil. Celular: 4:5: equipo arriba, texto abajo.
12. **Preguntas frecuentes**: Acordeón de 6 preguntas sobre Ingeniak (G01, G02, G04, G07, G08, G11); texto idéntico al FAQPage del <head>.
13. **Cierre** **[CINE]**: Cierre cinematográfico: "30 minutos para ver tu operación como es, no como crees que es." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

### 13.2 Servicios

#### `/servicios/` · Servicios

| Campo | Valor |
|---|---|
| Plantilla · estado | T-HUB · conserva URL |
| Propósito | Presentar los 11 servicios como un solo sistema y enrutar a cada página; capturar búsquedas genéricas de servicios de IA. |
| Keyword principal | servicios de inteligencia artificial para empresas |
| Title (48) | Servicios de IA, CRM y automatización \| Ingeniak |
| Meta description (139) | Consultoría en IA, agentes para WhatsApp, CRM con Kommo y GoHighLevel, n8n, paid media, web, software y SEO, conectados en un solo sistema. |
| H1 | Servicios de inteligencia artificial para empresas, conectados en un solo sistema |
| Breadcrumb | Inicio › Servicios |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de servicios de Ingeniak y quiero saber qué servicio me conviene primero." |
| JSON-LD | CollectionPage, ItemList (Service), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/consultoria-ia-empresas/`, `/servicios/agentes-ia-whatsapp/`, `/servicios/crm-con-ia/`, `/kommo/`, `/gohighlevel/`, `/servicios/automatizacion-n8n/`, `/servicios/paid-media/`, `/servicios/paginas-web/`, `/servicios/desarrollo-software/`, `/servicios/seo/`, `/servicios/branding/`, `/metodologia/`, `/casos/` |
| Redirecciones entrantes | `/servicios` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'No vendemos servicios sueltos: conectamos atracción, atención, CRM, automatización y datos para que cada lead llegue, se atienda y se mida.' + Discovery + WhatsApp.
   - Imagen: arquitecta de sistemas (35 años), sujeto a la derecha, texto a la izquierda. Mujer profesional de pie frente a una pared de cristal donde brilla, desenfocado, un diagrama de nodos cian conectados; luz de borde cian, ambiente nocturno navy; mitad izquierda limpia. Celular: 4:5: persona arriba, diagrama de luz baja hacia el texto.
2. **Un sistema, no servicios sueltos**: Párrafo citable de 40–60 palabras sobre cómo se conectan los servicios + 3 cifras transversales (+73 sistemas, 7 países, −60% tiempo operativo en 90 días).
3. **Mapa de servicios**: 3 columnas con las 11 tarjetas: Atraer (Paid media, Páginas web, SEO y visibilidad en IA, Branding y contenido) · Atender y vender (Agentes de IA para WhatsApp, CRM con IA, Kommo, GoHighLevel) · Operar y escalar (Consultoría en IA, Automatización con n8n, Software a la medida).
4. **Cómo se conectan**: Diagrama animado con las ramas del isotipo: anuncio → web → agente de IA → CRM → automatización → tablero; al pasar el cursor se ilumina el servicio de cada tramo.
5. **¿No sabes por dónde empezar?** **[CINE]**: 'Para eso existe la Discovery Session: 30 minutos para ver qué conviene automatizar primero.' + lista de 3 señales + Discovery.
   - Imagen: KAIN de cuerpo completo señalando, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda señalando hacia la derecha, donde flotan, desenfocados, tres paneles de cristal vacíos; derecha en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a cualquier servicio; enlace a /metodologia/.
7. **Preguntas frecuentes**: Acordeón de 5 preguntas sobre servicios (G05, G07, G08, G09, N07); texto idéntico al FAQPage del <head>.
8. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Qué pieza del sistema te falta? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/servicios/consultoria-ia-empresas/` · Consultoría en IA

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · conserva URL |
| Propósito | Página pilar de la consultoría: posicionar 'consultoría en IA para empresas' y vender el diagnóstico + roadmap + implementación con VKTOR™. |
| Keyword principal | consultoría en inteligencia artificial para empresas |
| Title (52) | Consultoría en IA para empresas en México \| Ingeniak |
| Meta description (139) | Detectamos dónde la IA te ahorra tiempo o te trae ventas y la implementamos con la metodología VKTOR™. Resultados medibles en 60 a 90 días. |
| H1 | Consultoría en inteligencia artificial para empresas |
| Breadcrumb | Inicio › Servicios › Consultoría en IA |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de consultoría en IA y quiero saber por dónde empezar con la IA en mi empresa." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/metodologia/`, `/servicios/automatizacion-n8n/`, `/servicios/agentes-ia-whatsapp/`, `/servicios/crm-con-ia/`, `/casos/logistica-n8n/`, `/industrias/`, `/discovery/` |
| Redirecciones entrantes | `/servicios/consultoria-ia-empresas`, `/blog/7-errores-implementacion-ia-empresa-evitar`, `/blog/como-elegir-consultora-ia-mexico-checklist`, `/blog/aplicaciones-ia-empresas-2026` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Diagnóstico, roadmap, casos de uso y retorno medible en 90 días.' + Discovery + WhatsApp + chips '+73 sistemas · 7 países'.
   - Imagen: consultor senior (45 años, saco oscuro), sujeto a la izquierda, texto a la derecha. Hombre de pie, sereno, frente a un muro de cristal con un mapa de procesos de luz cian desenfocado; oficina nocturna navy; derecha limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Qué hace una consultoría en IA?**: Definición de 40–60 palabras (N06) + cifras: −60% tiempo operativo (primeros 90 días), resultados en 60–90 días, +73 sistemas.
3. **Lo que vemos antes de empezar**: 3 dolores en ámbar con salida en cian: 'No sabes por dónde empezar' → diagnóstico con números; 'Probaste herramientas sueltas' → un solo sistema; 'Nadie mide el retorno' → tablero desde el día 1.
4. **Qué incluye**: 6 tarjetas: diagnóstico de la operación con números, casos de uso priorizados, roadmap (qué, con qué herramientas, en qué orden), implementación, operación con tu equipo, métricas mensuales.
5. **Casos de uso por área**: Pestañas Ventas · Atención · Operación · Marketing · Datos con 3 ejemplos cada una y enlace al servicio que lo resuelve.
6. **Del diagnóstico a producción** **[CINE]**: VKTOR™ en versión consultoría: 5 fases con lo que pasa en cada una y el resultado de la fase; enlace /metodologia/.
   - Imagen: consultora y dueño de pyme revisando números, sujeto a la derecha, texto a la izquierda. Dos personas (consultora 35 años, dueño 50 años) frente a una tableta con gráficas luminosas en una sala de juntas oscura; luz cian sobre los rostros; izquierda limpia en navy. Celular: 4:5: personas arriba, fases abajo.
7. **¿Es para ti?**: Dos columnas: 'Es para ti si…' (PyME de 3 a 40 empleados, el negocio depende de ti, procesos que se pueden sistematizar, quieres opinión seria antes de invertir) / 'No es para ti si…' (en ámbar), tomadas de la Discovery.
8. **Caso destacado**: Tarjeta del caso de logística (27 procesos con n8n) + cifra −60% de tiempo operativo → /casos/logistica-n8n/.
9. **Preguntas frecuentes**: Acordeón de 5 preguntas sobre consultoría en IA (N06, G07, G08, N07, G09); texto idéntico al FAQPage del <head>.
10. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /metodologia/ · /servicios/automatizacion-n8n/ · /servicios/agentes-ia-whatsapp/.
11. **Cierre** **[CINE]**: Cierre cinematográfico: "Antes de invertir en IA, mira tu operación con números." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/servicios/agentes-ia-whatsapp/` · Agentes de IA para WhatsApp

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · nueva URL (301 desde /servicios/agentes-ia y v1) |
| Propósito | Vender el agente de IA para WhatsApp (Kain) conectado al CRM; keyword comercial de mayor prioridad. |
| Keyword principal | agentes de IA para WhatsApp |
| Title (47) | Agentes de IA para WhatsApp Business \| Ingeniak |
| Meta description (135) | Tu WhatsApp responde, califica y agenda 24/7 con un agente de IA conectado a tu CRM. Caso real: de 8 min a 12 s en tiempo de respuesta. |
| H1 | Agentes de IA para WhatsApp Business |
| Breadcrumb | Inicio › Servicios › Agentes de IA para WhatsApp |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de agentes de IA para WhatsApp y quiero ver cómo atenderías a mis clientes." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/kain/`, `/kommo/`, `/gohighlevel/`, `/servicios/crm-con-ia/`, `/servicios/automatizacion-n8n/`, `/casos/clinica-dental-monterrey/`, `/casos/retail-multimarca-kommo/`, `/industrias/salud/`, `/blog/agente-ia-whatsapp-vs-chatbot/`, `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/`, `/discovery/` |
| Redirecciones entrantes | `/servicios/agentes-ia`, `/agentes-ia-whatsapp/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Tu WhatsApp responde, califica y agenda 24/7 con un agente de IA conectado a tu CRM. En una clínica dental de Monterrey, el tiempo de respuesta bajó de 8 minutos a 12 segundos.' + Discovery + 'Escríbele a Kain'. Burbujas de chat en HTML animadas junto al celular de la persona ('11:48 p. m. · respuesta en 12 s').
   - Imagen: clienta (30 años) escribiendo de noche, sujeto a la izquierda, texto a la derecha. Mujer en su sala de noche, sentada, escribiendo en el celular; la pantalla ilumina su rostro en cian; ventana con ciudad desenfocada; derecha en penumbra navy limpia. Celular: 9:16: persona arriba, burbujas y texto abajo.
2. **¿Qué es un agente de IA para WhatsApp?**: Definición citable (G02, versión larga de v1) + cifras: 8 min → 12 s, 3.2× más citas en 90 días, 12 → 47 citas/mes (salud), +73 sistemas.
3. **Qué hace tu agente**: 6 capacidades (responde en segundos, califica, agenda en tu calendario, registra en el CRM, da seguimiento, con el modelo correcto) + video del chat de Kain (kain-chat) en celular de cristal.
4. **Agente de IA, no chatbot de menús**: Tabla comparativa de 6 filas (lenguaje natural, acciones, CRM, agenda, horario, cuando la pregunta se sale del guion) → enlace al artículo /blog/agente-ia-whatsapp-vs-chatbot/.
5. **Lo que sí hace y lo que no** **[CINE]**: Dos listas de v1: 'Lo que sí hace' (cian) / 'Lo que no hace' (no es chatbot de menús, no obliga a opciones fijas, no da consejo médico ni legal). Slogan 'Tu negocio trabajando, sin depender más de ti.'
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN de pie en una recepción moderna vacía de noche, mostrador con brillo cian de un celular; luz cálida mínima; izquierda en penumbra navy limpia. Celular: 9:16: KAIN arriba, listas abajo.
6. **Dónde trabaja y con qué se conecta**: Canales (WhatsApp, Instagram, web) + CRM (Kommo, GoHighLevel) + calendarios + n8n; logos en blanco y enlaces a /kommo/, /gohighlevel/, /servicios/automatizacion-n8n/.
7. **Agentes reales, operando hoy**: 2 tarjetas de caso: clínica dental (8 min → 12 s, 3.2×) y retail multimarca (+340%) → páginas de caso.
8. **Dónde más rinde**: Chips a /industrias/salud/, /industrias/belleza-estetica/, /industrias/inmobiliario/, /industrias/retail-ecommerce/ con una línea de uso por sector.
9. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a poner tu agente en producción; enlace a /metodologia/.
10. **Preguntas frecuentes**: Acordeón de 6 preguntas sobre agentes de IA para WhatsApp (G02, G03, W01, W02, G09, W03); texto idéntico al FAQPage del <head>.
11. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /kain/ · /kommo/ · /blog/cuanto-cuesta-agente-ia-whatsapp-mexico/.
12. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Qué respondería un agente de IA en tu WhatsApp?" + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/servicios/crm-con-ia/` · CRM con IA

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · nueva URL (301 desde /servicios/crm-inteligente) |
| Propósito | Captar la búsqueda genérica de CRM con IA, ayudar a elegir entre Kommo y GoHighLevel y repartir a ambas páginas de plataforma. |
| Keyword principal | CRM con inteligencia artificial |
| Title (52) | CRM con inteligencia artificial: Kommo y GoHighLevel |
| Meta description (132) | ¿Kommo o GoHighLevel? Te ayudamos a elegir e implementamos un CRM con IA que registra, califica y da seguimiento a cada lead por ti. |
| H1 | CRM con inteligencia artificial, implementado para vender |
| Breadcrumb | Inicio › Servicios › CRM con IA |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de CRM con IA y quiero saber si me conviene Kommo o GoHighLevel." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/kommo/`, `/gohighlevel/`, `/blog/kommo-vs-gohighlevel/`, `/servicios/agentes-ia-whatsapp/`, `/servicios/automatizacion-n8n/`, `/casos/retail-multimarca-kommo/`, `/discovery/` |
| Redirecciones entrantes | `/servicios/crm-inteligente` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Kommo o GoHighLevel con pipelines, automatizaciones y seguimiento sin capturas a mano.' + Discovery + WhatsApp + sello Kommo Partner.
   - Imagen: gerente comercial (40 años), sujeto a la derecha, texto a la izquierda. Mujer de pie frente a una pantalla grande con un tablero kanban desenfocado en cian y azul; oficina oscura; brazos cruzados, segura; izquierda limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Qué es un CRM con IA?**: Definición de 40–60 palabras (N03) + cifras: +340% conversiones (retail, Kommo + IA), 8 min → 12 s.
3. **Un CRM que nadie usa**: Dolores en ámbar: leads en libretas, chats y hojas; nadie sabe en qué etapa va cada venta; seguimiento que depende de la memoria. Salida en cian.
4. **¿Kommo o GoHighLevel?**: Dos tarjetas grandes lado a lado: 'Elige Kommo si vendes por chat' / 'Elige GoHighLevel si vendes con embudos, páginas y calendarios', con 3 señales cada una y enlace a /kommo/ y /gohighlevel/ + enlace al artículo comparativo.
5. **Qué implementamos**: 6 bloques: pipelines y etapas, campos y usuarios, canales en una bandeja, agente de IA en el chat, seguimiento automático, tablero de métricas.
6. **Un CRM vivo** **[CINE]**: 'Cada lead en su etapa, sin capturas a mano.' + mini animación de una tarjeta de lead avanzando por etapas (HTML) + cifra +340%.
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda sosteniendo con ambas manos una tarjeta de cristal vacía que brilla en cian, frente a columnas de luz verticales desenfocadas (etapas); derecha en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
7. **Caso destacado**: Caso retail multimarca (+340% en conversiones con Kommo + IA) → /casos/retail-multimarca-kommo/.
8. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a la implementación de tu CRM; enlace a /metodologia/.
9. **Preguntas frecuentes**: Acordeón de 5 preguntas sobre CRM con IA (N03, G05, G04, H03, G07); texto idéntico al FAQPage del <head>.
10. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /kommo/ · /gohighlevel/ · /blog/kommo-vs-gohighlevel/.
11. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Qué CRM encaja con cómo vendes? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/kommo/` · Partner oficial de Kommo

| Campo | Valor |
|---|---|
| Plantilla · estado | T-PLATFORM · conserva URL de v1 (301 desde /licenciaskommo) |
| Propósito | Posicionar a Ingeniak como partner oficial de Kommo en México y LATAM; vender licencias + implementación + agentes de IA. |
| Keyword principal | partner Kommo México |
| Title (53) | Partner oficial de Kommo en México y LATAM \| Ingeniak |
| Meta description (146) | Licencias, implementación y automatización de Kommo con agentes de IA en WhatsApp. Somos partner oficial de Kommo en LATAM. Agenda tu diagnóstico. |
| H1 | Partner oficial de Kommo en México y LATAM |
| Breadcrumb | Inicio › Servicios › CRM con IA › Partner oficial de Kommo |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbenos por WhatsApp → WhatsApp: "Hola, vengo de la página de Kommo de Ingeniak y quiero información sobre licencias e implementación de Kommo." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/crm-con-ia/`, `/gohighlevel/`, `/servicios/agentes-ia-whatsapp/`, `/casos/retail-multimarca-kommo/`, `/casos/clinica-dental-monterrey/`, `/blog/como-verificar-partner-oficial-kommo/`, `/blog/kommo-vs-gohighlevel/`, `/agentes-ia-guadalajara/`, `/discovery/` |
| Redirecciones entrantes | `/licenciaskommo` |
| Nota | El sello Partner debe enlazar a https://www.kommo.com/ (requisito del programa de partners). |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + sello Kommo Partner (enlazado a kommo.com) + H1 + 'Licencias, implementación y automatización de Kommo con agentes de IA en WhatsApp. Conectamos tus chats, tu embudo y tu seguimiento en un solo CRM que vende 24/7.' + Discovery + WhatsApp.
   - Imagen: vendedor de tienda (30 años) con celular, sujeto a la izquierda, texto a la derecha. Hombre en un showroom de retail premium cerrado de noche, mirando su celular con varios chats; luces de exhibición tenues; reflejos cian; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Qué es Kommo?**: Definición de v1 ('Kommo es un CRM pensado para vender por mensajería…') + cifras +340% (retail), 8 min → 12 s, +73 sistemas, 7 países.
3. **Qué hacemos con Kommo**: 6 bloques de v1: licencias, implementación del CRM, canales en una bandeja, agente de IA en el chat, seguimiento automático, métricas claras.
4. **Licencias con un partner oficial**: Cómo funciona contratar licencias con Ingeniak: te ayudamos a elegir y contratar las que tu equipo necesita; sin precios publicados (remite a Discovery). Enlace al artículo /blog/como-verificar-partner-oficial-kommo/ y al directorio de partners de Kommo [VALIDAR URL de la ficha de Ingeniak].
5. **Agente de IA dentro del chat** **[CINE]**: 'Kommo organiza. Kain atiende.' Explica cómo el agente responde, califica y registra en Kommo + video del chat.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha frente a una columna de burbujas de chat de cristal vacías que suben en cian; fondo navy con ondas sedosas; izquierda limpia. Celular: 9:16: KAIN arriba, texto abajo.
6. **Kommo con IA, operando hoy**: Casos retail (+340%) y clínica dental (8 min → 12 s) → páginas de caso.
7. **¿Kommo es el CRM correcto para ti?**: Lista de v1 'Kommo es para ti si…' / 'Quizá no es para ti si…' (enlace a /gohighlevel/).
8. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a implementar Kommo; enlace a /metodologia/.
9. **Preguntas frecuentes**: Acordeón de 6 preguntas sobre Kommo (G04, K01, K02, G05, K03, K04); texto idéntico al FAQPage del <head>.
10. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /gohighlevel/ · /servicios/agentes-ia-whatsapp/ · /agentes-ia-guadalajara/.
11. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Kommo es para tu operación? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/gohighlevel/` · GoHighLevel

| Campo | Valor |
|---|---|
| Plantilla · estado | T-PLATFORM · conserva URL de v1 |
| Propósito | Ocupar el hueco de 'GoHighLevel en español' con una página de implementación; nunca presentarse como partner de GHL. |
| Keyword principal | implementación GoHighLevel en español |
| Title (51) | Implementación de GoHighLevel en español \| Ingeniak |
| Meta description (138) | Configuramos GoHighLevel en español: CRM, embudos, calendarios y automatizaciones con IA para que tu equipo venda más sin perseguir leads. |
| H1 | Implementación de GoHighLevel en español |
| Breadcrumb | Inicio › Servicios › CRM con IA › GoHighLevel |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbenos por WhatsApp → WhatsApp: "Hola, vengo de la página de GoHighLevel de Ingeniak y quiero implementar GoHighLevel en mi empresa." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/crm-con-ia/`, `/kommo/`, `/blog/gohighlevel-en-espanol/`, `/blog/kommo-vs-gohighlevel/`, `/servicios/agentes-ia-whatsapp/`, `/servicios/paginas-web/`, `/discovery/` |
| Nota | Nunca escribir 'partner', 'certificado' ni 'oficial' junto a GoHighLevel. |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + texto de v1 + Discovery + WhatsApp + nota legal 'GoHighLevel es una marca de su dueño; en Ingeniak la implementamos.'
   - Imagen: directora de clínica / coach (38 años) en su escritorio, sujeto a la derecha, texto a la izquierda. Mujer en un escritorio elegante con monitor que muestra un calendario y un embudo desenfocados en azul; lámpara cálida tenue y luz de pantalla cian; izquierda en navy limpio. Celular: 4:5: persona arriba, texto abajo.
2. **¿Qué es GoHighLevel?**: Definición de v1 + 'Lo que junta en un solo lugar' (CRM, embudos y páginas, calendarios, campañas, automatizaciones) + cifras transversales con su origen.
3. **GoHighLevel listo para tu equipo, no solo instalado**: 6 bloques de v1: cuenta en español, embudos y páginas, calendarios y citas, WhatsApp y campañas, agente de IA conectado, capacitación y ajuste.
4. **Citas que se agendan y se confirman solas** **[CINE]**: Flujo en 4 pasos (lead entra → agente califica → agenda en calendario → recordatorio) con animación de nodos; cifra 3.2× más citas (dental, con otra herramienta: indicar origen).
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda junto a un calendario de cristal flotante con casillas vacías que se iluminan en cian; derecha en navy limpio. Celular: 9:16: KAIN arriba, pasos abajo.
5. **¿GoHighLevel es la plataforma correcta para ti?**: Listas de v1 'Es para ti si…' / 'Quizá no es para ti si…' (enlace a /kommo/).
6. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a implementar GoHighLevel; enlace a /metodologia/.
7. **Preguntas frecuentes**: Acordeón de 6 preguntas sobre GoHighLevel (H01, H02, G05, H03, H04, G07); texto idéntico al FAQPage del <head>.
8. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /kommo/ · /blog/gohighlevel-en-espanol/ · /servicios/agentes-ia-whatsapp/.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿GoHighLevel es para tu operación? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/servicios/automatizacion-n8n/` · Automatización con n8n

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · nueva |
| Propósito | Posicionar la automatización de procesos con n8n (y Make/Zapier) con el caso de 27 procesos. |
| Keyword principal | automatización con n8n |
| Title (47) | Automatización con n8n para empresas \| Ingeniak |
| Meta description (141) | Conectamos tu CRM, WhatsApp, hojas de cálculo y sistemas con flujos en n8n. Caso real: 27 procesos automatizados en una empresa de logística. |
| H1 | Automatización de procesos con n8n para empresas |
| Breadcrumb | Inicio › Servicios › Automatización con n8n |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de automatización con n8n y quiero automatizar procesos de mi empresa." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/casos/logistica-n8n/`, `/industrias/industrial-logistica/`, `/servicios/desarrollo-software/`, `/servicios/crm-con-ia/`, `/blog/n8n-vs-zapier-vs-make/`, `/tecnologias/`, `/discovery/` |
| Redirecciones entrantes | `/blog/n8n-empresas-automatizaciones-ahorrar-tiempo` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Flujos con n8n y Make que conectan tus sistemas y eliminan el trabajo repetitivo.' + Discovery + WhatsApp + chip '27 procesos automatizados'.
   - Imagen: jefe de operaciones (40 años) con tableta, sujeto a la izquierda, texto a la derecha. Hombre en un centro de distribución al anochecer, tableta en mano, estantes altos desenfocados; líneas de luz cian que recorren el espacio como flujos; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Qué es n8n?**: Definición (N05) + cuándo usamos Make o Zapier en su lugar (una línea cada uno) + logo oficial de n8n según su guía (wordmark, mín. 100 px).
3. **Qué automatizamos**: 8 tarjetas: CRM ↔ WhatsApp, formularios → CRM, recordatorios, cobros, reportes automáticos, sincronización con ERP, alertas, agentes de IA orquestados.
4. **Antes y después**: Comparador deslizable: '100% manual → 40% automatizado' y '−60% de tiempo operativo (promedio, primeros 90 días)'; nota de fuente.
5. **Caso: 27 procesos automatizados** **[CINE]**: Resumen del caso de logística (integraciones entre CRM, WhatsApp, ERP y modelos de IA con disparadores en tiempo real) + cifra grande + enlace /casos/logistica-n8n/.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha de pie sobre una plataforma de un almacén nocturno, del que salen ramas de luz cian hacia la izquierda conectando cajas desenfocadas; izquierda limpia. Celular: 9:16: KAIN arriba, texto abajo.
6. **n8n, Make o Zapier**: Tabla breve de 4 criterios (sin precios) + enlace al artículo /blog/n8n-vs-zapier-vs-make/.
7. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a automatizar tus procesos; enlace a /metodologia/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre automatización con n8n (N05, G06, G08, G07); texto idéntico al FAQPage del <head>.
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /industrias/industrial-logistica/ · /servicios/desarrollo-software/ · /blog/n8n-vs-zapier-vs-make/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Qué proceso te come más horas? Empecemos por ese." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/servicios/paid-media/` · Paid media

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · conserva URL |
| Propósito | Vender paid media medido por ventas (no clics) y conectado al CRM. |
| Keyword principal | agencia de paid media Meta Ads y Google Ads |
| Title (55) | Paid media con IA: Meta, Google y TikTok Ads \| Ingeniak |
| Meta description (127) | Campañas en Meta, Google y TikTok conectadas a tu CRM para medir ventas, no clics. Caso real: ROAS de 4.8× sostenido en HoReCa. |
| H1 | Paid media conectado a tu CRM: Meta, Google y TikTok Ads |
| Breadcrumb | Inicio › Servicios › Paid media |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de paid media y quiero campañas medidas por ventas, no por clics." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/casos/horeca-roas/`, `/casos/ecommerce-cdmx-costo-por-lead/`, `/industrias/horeca/`, `/servicios/paginas-web/`, `/servicios/crm-con-ia/`, `/discovery/` |
| Redirecciones entrantes | `/servicios/paid-media` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Meta, Google y TikTok Ads medidos por ventas, no por clics.' + Discovery + WhatsApp + chips 'ROAS 4.8× · −58% CPL'.
   - Imagen: especialista de performance (32 años), sujeto a la derecha, texto a la izquierda. Hombre en una sala oscura frente a tres monitores con gráficas desenfocadas en azul y cian; luz de pantalla en el rostro; izquierda en navy limpio. Celular: 4:5: persona arriba, texto abajo.
2. **Paid media medido por ventas**: Párrafo citable de 40–60 palabras + cifras: ROAS 4.8× (HoReCa), −58% CPL en 60 días (e-commerce CDMX).
3. **Pagas clics, no ventas**: Dolor en ámbar: 'Pagas clics y mensajes, pero no sabes cuáles terminan en dinero' → salida: campañas conectadas al CRM.
4. **Qué hacemos**: 6 bloques: estrategia por canal, creativos dinámicos, audiencias predictivas, atribución multicanal, conexión con CRM y agente de IA, reporte de ventas.
5. **Caso HoReCa: ROAS 4.8× sostenido** **[CINE]**: Resumen del caso (creativos dinámicos, audiencias predictivas, atribución multicanal) + enlace /casos/horeca-roas/.
   - Imagen: chef-propietaria (45 años) en su restaurante, sujeto a la izquierda, texto a la derecha. Mujer chef con filipina oscura de pie en su restaurante lleno, ambiente cálido desenfocado, luz de borde cian; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
6. **Canales**: 3 tarjetas: Meta Ads, Google Ads, TikTok Ads (logos en blanco, 'herramientas que usamos').
7. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a tus campañas; enlace a /metodologia/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre paid media (G14, N02, G08, G07); texto idéntico al FAQPage del <head>.
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/paginas-web/ · /industrias/horeca/ · /casos/ecommerce-cdmx-costo-por-lead/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuánto de tu inversión termina en ventas? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/servicios/paginas-web/` · Páginas web

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · conserva URL |
| Propósito | Vender sitios rápidos, conectados al CRM y WhatsApp, pensados para convertir; este mismo sitio como prueba. |
| Keyword principal | páginas web de alta conversión |
| Title (48) | Páginas web de alta conversión con IA \| Ingeniak |
| Meta description (131) | Sitios rápidos, claros y conectados a tu CRM y WhatsApp, pensados para convertir visitas en citas y ventas. Desarrollo a la medida. |
| H1 | Páginas web de alta conversión, conectadas a tu CRM y WhatsApp |
| Breadcrumb | Inicio › Servicios › Páginas web |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de páginas web y quiero una web que convierta visitas en clientes." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/seo/`, `/servicios/paid-media/`, `/servicios/branding/`, `/servicios/crm-con-ia/`, `/discovery/` |
| Redirecciones entrantes | `/servicios/paginas-web` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Sitios rápidos y claros, conectados a tu CRM y a WhatsApp desde el primer día.' + Discovery + WhatsApp.
   - Imagen: director creativo (35 años) frente a una pantalla, sujeto a la izquierda, texto a la derecha. Hombre en un estudio oscuro frente a un monitor grande con un sitio web desenfocado en tonos navy y cian; luz de pantalla en el rostro; derecha limpia. Celular: 4:5: persona arriba, texto abajo.
2. **Una web que convierte, no que adorna**: Párrafo citable + 3 principios: claridad en 5 segundos, velocidad, cada botón conectado a CRM o WhatsApp.
3. **Qué incluye**: 6 bloques: estrategia de conversión, textos, diseño, desarrollo estático rápido, conexión CRM/WhatsApp, analítica y SEO técnico base.
4. **Este sitio es el ejemplo** **[CINE]**: Mostrar cómo está hecho ingeniak.mx: HTML estático (Astro), imágenes cinematográficas, movimiento con GSAP, datos estructurados; enlace /servicios/seo/. Sin métricas de rendimiento inventadas: publicar las de Lighthouse solo cuando se midan.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha junto a una ventana de navegador de cristal flotante, vacía, con borde cian; fondo de ondas sedosas; izquierda limpia. Celular: 9:16: KAIN arriba, texto abajo.
5. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a tu sitio web; enlace a /metodologia/.
6. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre páginas web (N09, G14, G08, G07); texto idéntico al FAQPage del <head>.
7. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/seo/ · /servicios/paid-media/ · /servicios/branding/.
8. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Tu web trae citas o solo visitas? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/servicios/desarrollo-software/` · Software a la medida

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · conserva URL |
| Propósito | Vender desarrollo a la medida cuando ninguna herramienta encaja (portales, tableros, integraciones, agentes propios). |
| Keyword principal | desarrollo de software a la medida con IA |
| Title (52) | Desarrollo de software a la medida con IA \| Ingeniak |
| Meta description (136) | Cuando ninguna herramienta encaja, construimos el sistema que tu operación necesita, con IA integrada. Más de 73 sistemas en producción. |
| H1 | Desarrollo de software a la medida, con IA integrada |
| Breadcrumb | Inicio › Servicios › Software a la medida |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de software a la medida y necesito un sistema para mi operación." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/automatizacion-n8n/`, `/tecnologias/`, `/industrias/retail-ecommerce/`, `/servicios/consultoria-ia-empresas/`, `/discovery/` |
| Redirecciones entrantes | `/servicios/desarrollo-software` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Cuando ninguna herramienta encaja, construimos el sistema que tu operación necesita.' + Discovery + WhatsApp + chip '+73 sistemas en producción'.
   - Imagen: ingeniera de software (30 años), sujeto a la derecha, texto a la izquierda. Mujer frente a una pared de cristal con código y diagramas desenfocados en cian, de perfil a tres cuartos, concentrada; izquierda en navy limpio. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cuándo conviene software a la medida?**: Respuesta citable (N08) + 3 señales (procesos únicos, demasiadas herramientas sueltas, datos dispersos).
3. **Qué construimos**: 5 tarjetas: tableros unificados, portales para clientes, integraciones con ERP, apps internas, agentes de IA propios. Stack en una línea (Supabase, Stripe y modelos de IA) [VALIDAR stack de front].
4. **1 vista, 7 fuentes** **[CINE]**: Caso del tablero unificado para e-commerce (tráfico, conversión y ROAS en un solo tablero con alertas por IA) + maqueta marcada 'vista demo'.
   - Imagen: directora de e-commerce (40 años), sujeto a la izquierda, texto a la derecha. Mujer de pie frente a una pantalla panorámica con un tablero de datos desenfocado en cian; sala oscura; derecha limpia. Celular: 4:5: persona arriba, texto abajo.
5. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a construir tu sistema; enlace a /metodologia/.
6. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre software a la medida (N08, G09, G08, G07); texto idéntico al FAQPage del <head>.
7. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/automatizacion-n8n/ · /tecnologias/ · /casos/ecommerce-cdmx-costo-por-lead/.
8. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Ninguna herramienta encaja? Diseñemos la tuya." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/servicios/seo/` · SEO y visibilidad en IA

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · conserva URL |
| Propósito | Vender SEO + visibilidad en motores de respuesta (GEO/AEO); el propio sitio como caso. |
| Keyword principal | SEO y visibilidad en ChatGPT |
| Title (48) | SEO y visibilidad en ChatGPT y Google \| Ingeniak |
| Meta description (129) | SEO técnico, contenido y datos estructurados para aparecer en Google y en las respuestas de ChatGPT, Gemini, Perplexity y Claude. |
| H1 | SEO y visibilidad en IA: que te encuentre Google y te citen los asistentes |
| Breadcrumb | Inicio › Servicios › SEO y visibilidad en IA |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de SEO y quiero que mi empresa aparezca en Google y en ChatGPT." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/paginas-web/`, `/servicios/branding/`, `/blog/`, `/agentes-ia-guadalajara/`, `/discovery/` |
| Redirecciones entrantes | `/servicios/seo` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Que te encuentren en Google y te citen ChatGPT, Gemini, Perplexity y Claude.' + Discovery + WhatsApp.
   - Imagen: mujer (35 años) consultando en su laptop, sujeto a la izquierda, texto a la derecha. Mujer en un café nocturno con laptop, la pantalla proyecta un halo cian en su rostro; fondo desenfocado cálido mínimo; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Qué es la visibilidad en IA?**: Definición (N04) + por qué un sitio que solo carga con JavaScript es invisible para varios rastreadores de IA (fuente: Vercel).
3. **Qué hacemos**: 6 bloques: SEO técnico y HTML estático, arquitectura e enlazado, contenido con respuestas citables, datos estructurados, llms.txt y robots para bots de IA, ficha de Google Business Profile y perfiles consistentes.
4. **Cómo lo medimos** **[CINE]**: Indicadores: páginas indexadas, posiciones por keyword, clics de Search Console, menciones en respuestas de IA (muestreo manual mensual). Sin cifras de resultados hasta tener caso confirmado.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha mirando hacia una constelación de nodos de luz cian que forman una red sobre la izquierda (como resultados conectados); fondo navy. Celular: 9:16: KAIN arriba, texto abajo.
5. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a tu visibilidad; enlace a /metodologia/.
6. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre SEO y visibilidad en IA (N04, G14, G08, G07); texto idéntico al FAQPage del <head>.
7. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/paginas-web/ · /servicios/branding/ · /blog/.
8. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Qué responde ChatGPT cuando preguntan por tu sector? Lo revisamos juntos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/servicios/branding/` · Branding y contenido

| Campo | Valor |
|---|---|
| Plantilla · estado | T-SERVICE · conserva URL (absorbe /servicios/contenido) |
| Propósito | Vender identidad + contenido con estrategia que alimenta campañas, web y agentes. |
| Keyword principal | branding y contenido para empresas |
| Title (46) | Branding y contenido con estrategia \| Ingeniak |
| Meta description (138) | Identidad, sistema visual y contenido que posicionan tu marca como la opción premium y alimentan tus campañas, tu web y tus agentes de IA. |
| H1 | Branding y contenido con estrategia |
| Breadcrumb | Inicio › Servicios › Branding y contenido |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de branding y contenido y quiero posicionar mi marca como premium." |
| JSON-LD | WebPage, Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/paginas-web/`, `/servicios/paid-media/`, `/servicios/seo/`, `/kain/`, `/blog/`, `/discovery/` |
| Redirecciones entrantes | `/servicios/branding`, `/servicios/contenido` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Identidad y contenido que posicionan tu marca como la opción premium.' + Discovery + WhatsApp.
   - Imagen: directora de arte (33 años) en estudio, sujeto a la derecha, texto a la izquierda. Mujer en un estudio creativo oscuro revisando láminas de marca en una mesa de luz; luz cenital suave y borde cian; izquierda en navy limpio. Celular: 4:5: persona arriba, texto abajo.
2. **Branding sistémico**: Párrafo citable: la marca como sistema que se usa en campañas, web, contenido y en la voz del agente de IA.
3. **Qué hacemos**: 6 bloques: estrategia de marca, identidad visual, personaje o mascota de marca, contenido para redes, video y motion graphics, creativos para pauta.
4. **Un personaje que trabaja** **[CINE]**: KAIN como ejemplo de personaje de marca que aparece en web, video y WhatsApp [VALIDAR que el personaje lo creó el equipo de Ingeniak antes de presentarlo como portafolio].
   - Imagen: KAIN de cuerpo completo posando, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda posando sobre un set fotográfico oscuro con luces de estudio y un fondo infinito navy; derecha limpia. Celular: 9:16: KAIN arriba, texto abajo.
5. **Contenido con estrategia**: Cómo planeamos el contenido (pilares, formatos, calendario) y cómo se conecta con pauta y SEO; enlace al blog.
6. **Preguntas frecuentes**: Acordeón de 3 preguntas sobre branding y contenido (N10, G14, G07); texto idéntico al FAQPage del <head>.
7. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/paginas-web/ · /servicios/paid-media/ · /kain/.
8. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Tu marca se ve como la opción premium? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida D: foto real del equipo (team-hero) extendida con outpainting; texto a la izquierda.

### 13.3 Industrias

#### `/industrias/` · Industrias

| Campo | Valor |
|---|---|
| Plantilla · estado | T-HUB · nueva |
| Propósito | Hub de verticales: que cada dueño encuentre su sector y llegue a una página con su lenguaje. |
| Keyword principal | inteligencia artificial por industria |
| Title (55) | Agentes de IA y automatización por industria \| Ingeniak |
| Meta description (138) | Salud, belleza, nutrición, finanzas, inmobiliario, industria, retail y HoReCa: cómo un sistema de IA atiende, agenda y vende en tu sector. |
| H1 | Agentes de IA y automatización para tu industria |
| Breadcrumb | Inicio › Industrias |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de industrias de Ingeniak y quiero saber cómo aplicaría la IA en mi sector." |
| JSON-LD | CollectionPage, ItemList, BreadcrumbList, FAQPage |
| Enlaces internos | `/industrias/salud/`, `/industrias/belleza-estetica/`, `/industrias/nutricion/`, `/industrias/finanzas/`, `/industrias/inmobiliario/`, `/industrias/industrial-logistica/`, `/industrias/retail-ecommerce/`, `/industrias/horeca/`, `/casos/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Cada sector vende distinto. El sistema se adapta a tu operación, no al revés.' + Discovery + WhatsApp.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha al final de un pasillo de cristal con ocho puertas iluminadas suavemente (sin texto ni íconos), perspectiva profunda hacia la izquierda en navy. Celular: 9:16: KAIN arriba, texto abajo.
2. **Lo que todas comparten**: Párrafo citable: atención 24/7, agenda, CRM y seguimiento son comunes; cambian el lenguaje, los horarios y los datos.
3. **Elige tu sector**: 8 tarjetas grandes con imagen del sector, una línea y la cifra confirmada si existe (Salud 3.2×, Retail +340%, HoReCa ROAS 4.8×, Logística 27 procesos).
4. **Resultados por sector**: Tabla de cifras confirmadas con sector, ciudad y plazo; sectores sin caso publicado aparecen sin cifra (no se inventa).
5. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre industrias (N11, G10, G08, G11); texto idéntico al FAQPage del <head>.
6. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Tu sector no está en la lista? Igual lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/industrias/salud/` · Salud

| Campo | Valor |
|---|---|
| Plantilla · estado | T-INDUSTRY · nueva |
| Propósito | Captar clínicas (dentales, médicas, especialidades) con el caso más fuerte: 3.2× citas y respuesta en 12 s. |
| Keyword principal | agente de IA para clínicas |
| Title (59) | IA para clínicas: agentes que agendan citas 24/7 \| Ingeniak |
| Meta description (144) | Agentes de IA que responden, agendan y confirman citas por WhatsApp. Clínica dental en Monterrey: 3.2× más citas en 90 días y respuesta en 12 s. |
| H1 | Agentes de IA para clínicas y consultorios |
| Breadcrumb | Inicio › Industrias › Salud |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, tengo una clínica y quiero ver cómo agendarías citas por WhatsApp." |
| JSON-LD | WebPage, Service (audience: sector), BreadcrumbList, FAQPage |
| Enlaces internos | `/casos/clinica-dental-monterrey/`, `/servicios/agentes-ia-whatsapp/`, `/kommo/`, `/gohighlevel/`, `/industrias/belleza-estetica/`, `/industrias/nutricion/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Tu agenda llena sin que tu recepción viva pegada al WhatsApp.' + Discovery + WhatsApp.
   - Imagen: odontóloga (40 años) con bata, sujeto a la derecha, texto a la izquierda. Doctora de pie en un consultorio dental moderno y vacío al final del día, luz fría con borde cian, sillón dental desenfocado; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cómo ayuda la IA en clínicas y consultorios?**: Párrafo citable: un agente de IA responde a pacientes en segundos, ofrece horarios, agenda, confirma y manda recordatorios, y deja todo en el CRM; no da consejo médico.
3. **Lo que pasa hoy**: Dolores en ámbar con salida en cian: pacientes que escriben de noche y nadie contesta, recepción saturada, citas que no se confirman y faltas.
4. **Qué automatizamos**: 6 tarjetas: respuesta inmediata 24/7, agenda en tu calendario, confirmación y recordatorios, reagendado, seguimiento a presupuestos de tratamiento, registro en Kommo o GoHighLevel.
5. **Así trabaja Kain en tu clínica** **[CINE]**: Conversación de ejemplo en HTML marcada 'ejemplo ilustrativo' (paciente pide cita para limpieza a las 11 p. m.; Kain ofrece dos horarios y confirma) + lo que Kain no hace (no da diagnósticos ni consejo médico).
   - Imagen: KAIN de cuerpo completo en recepción de clínica, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda junto al mostrador de una recepción de clínica de noche, luz blanca suave y brillo cian; derecha en navy limpio. Celular: 9:16: KAIN arriba, chat y texto abajo.
6. **Resultados**: 3 cifras confirmadas: 3.2× más citas en 90 días (clínica dental, Monterrey); Tiempo de respuesta de 8 min a 12 s (clínica dental, Monterrey); De 12 a 47 citas al mes en promedio (clientes del sector salud). Enlace /casos/clinica-dental-monterrey/.
7. **Servicios recomendados**: Tarjetas a /servicios/agentes-ia-whatsapp/, /kommo/, /gohighlevel/.
8. **Preguntas frecuentes**: Acordeón de 5 preguntas sobre clínicas y consultorios (G02, W01, N01, W02, G07); texto idéntico al FAQPage del <head>.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuántas citas se te escapan por no contestar a tiempo? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/industrias/belleza-estetica/` · Belleza y estética

| Campo | Valor |
|---|---|
| Plantilla · estado | T-INDUSTRY · nueva |
| Propósito | Captar negocios de belleza que venden por WhatsApp e Instagram y viven de la agenda. |
| Keyword principal | agente de IA para estéticas y spas |
| Title (55) | IA para estéticas, spas y salones de belleza \| Ingeniak |
| Meta description (142) | Tu agenda llena sin vivir pegada al WhatsApp: un agente de IA responde con tus precios y servicios, agenda y manda recordatorios desde tu CRM. |
| H1 | Agentes de IA para estéticas, spas y salones de belleza |
| Breadcrumb | Inicio › Industrias › Belleza y estética |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, tengo una estética o spa y quiero que me ayudes a llenar la agenda por WhatsApp." |
| JSON-LD | WebPage, Service (audience: sector), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/kommo/`, `/servicios/paid-media/`, `/industrias/salud/`, `/casos/clinica-dental-monterrey/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Responde, agenda y confirma en WhatsApp e Instagram mientras tú atiendes a tus clientas.' + Discovery + WhatsApp.
   - Imagen: dueña de estética (35 años), sujeto a la izquierda, texto a la derecha. Mujer elegante en su spa minimalista con luz cálida tenue y velas desenfocadas, mirando a cámara con calma; borde cian sutil; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cómo ayuda la IA en estéticas, spas y salones?**: Párrafo citable: el agente responde con tu lista de servicios y precios aprobados, agenda, confirma, reagenda y da seguimiento a quien preguntó y no reservó.
3. **Lo que pasa hoy**: Dolores en ámbar con salida en cian: mensajes de Instagram y WhatsApp que se acumulan, clientas que preguntan precio y desaparecen, huecos en la agenda por faltas.
4. **Qué automatizamos**: 6 tarjetas: respuestas con precios y servicios aprobados, agenda por profesional o cabina, recordatorios, reagendado, seguimiento a quien no reservó, campañas a clientas registradas en el CRM.
5. **Así trabaja Kain en tu estética** **[CINE]**: Conversación de ejemplo en HTML marcada 'ejemplo ilustrativo' (clienta pregunta por un facial en Instagram; Kain responde con el servicio, el precio aprobado y dos horarios) + lo que Kain no hace (no recomienda tratamientos médicos).
   - Imagen: KAIN de cuerpo completo en spa, sujeto a la derecha, texto a la izquierda. KAIN a la derecha sobre la recepción de un spa con plantas y luz cálida suave, brillo cian en sus ojos; izquierda en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Resultados**: Sin caso publicado del sector. Mostrar cifras transversales con su origen: Tiempo de respuesta de 8 min a 12 s (clínica dental, Monterrey); De 12 a 47 citas al mes en promedio (clientes del sector salud) (negocios de agenda, sector salud). Reemplazar cuando haya caso de belleza confirmado.
7. **Servicios recomendados**: Tarjetas a /servicios/agentes-ia-whatsapp/, /kommo/, /servicios/paid-media/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre estéticas, spas y salones (N11, G02, N12, G07); texto idéntico al FAQPage del <head>.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuántas clientas preguntan y no reservan? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/industrias/nutricion/` · Nutrición

| Campo | Valor |
|---|---|
| Plantilla · estado | T-INDUSTRY · nueva |
| Propósito | Captar nutriólogos y clínicas de nutrición que dependen de agenda y seguimiento. |
| Keyword principal | agente de IA para nutriólogos |
| Title (54) | IA para nutriólogos y clínicas de nutrición \| Ingeniak |
| Meta description (146) | Un agente de IA que responde, agenda consultas y manda recordatorios de seguimiento por WhatsApp, conectado a tu CRM. Sin dar consejo nutricional. |
| H1 | Agentes de IA para nutriólogos y clínicas de nutrición |
| Breadcrumb | Inicio › Industrias › Nutrición |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, soy nutriólogo y quiero que mis pacientes agenden y confirmen por WhatsApp." |
| JSON-LD | WebPage, Service (audience: sector), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/gohighlevel/`, `/industrias/salud/`, `/casos/clinica-dental-monterrey/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Tus pacientes agendan y confirman solos; tú te concentras en la consulta.' + Discovery + WhatsApp.
   - Imagen: nutrióloga (32 años), sujeto a la derecha, texto a la izquierda. Mujer con bata clara en un consultorio luminoso y minimalista al atardecer, frutas desenfocadas en una barra; borde cian; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cómo ayuda la IA en nutriólogos y clínicas de nutrición?**: Párrafo citable: el agente atiende dudas de agenda, precios y ubicación, agenda consultas de primera vez y de seguimiento, y recuerda citas; nunca da recomendaciones de alimentación.
3. **Lo que pasa hoy**: Dolores en ámbar con salida en cian: pacientes que abandonan el seguimiento, consultas no confirmadas, horas perdidas respondiendo lo mismo.
4. **Qué automatizamos**: 5 tarjetas: respuesta 24/7 a dudas frecuentes, agenda de primera vez y seguimiento, recordatorios, reactivación de pacientes inactivos desde el CRM, registro de cada paciente en su etapa.
5. **Así trabaja Kain en tu consulta de nutrición** **[CINE]**: Conversación de ejemplo en HTML marcada 'ejemplo ilustrativo' (paciente pide reagendar su consulta de seguimiento; Kain ofrece horarios y confirma) + lo que Kain no hace (no da planes de alimentación ni consejo médico).
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda en una sala de espera luminosa y minimalista al anochecer, sentado en una banca, celular de cristal flotando; derecha en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Resultados**: Sin caso publicado del sector. Cifras transversales con origen: De 12 a 47 citas al mes en promedio (clientes del sector salud); Tiempo de respuesta de 8 min a 12 s (clínica dental, Monterrey). Reemplazar cuando haya caso de nutrición confirmado.
7. **Servicios recomendados**: Tarjetas a /servicios/agentes-ia-whatsapp/, /gohighlevel/, /servicios/automatizacion-n8n/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre nutriólogos y clínicas de nutrición (N11, N01, G02, G07); texto idéntico al FAQPage del <head>.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuántos pacientes dejan su seguimiento? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/industrias/finanzas/` · Finanzas

| Campo | Valor |
|---|---|
| Plantilla · estado | T-INDUSTRY · nueva |
| Propósito | Captar empresas financieras (créditos, seguros, despachos) que necesitan calificar prospectos rápido y con orden [VALIDAR subsectores que atiende Ingeniak]. |
| Keyword principal | IA para empresas financieras |
| Title (51) | IA para financieras, seguros y despachos \| Ingeniak |
| Meta description (142) | Agentes de IA y CRM que califican prospectos, piden documentos y agendan con tu asesor, con cada paso registrado. Sin dar asesoría financiera. |
| H1 | Agentes de IA y automatización para el sector financiero |
| Breadcrumb | Inicio › Industrias › Finanzas |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, trabajo en el sector financiero y quiero calificar prospectos automáticamente." |
| JSON-LD | WebPage, Service (audience: sector), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/crm-con-ia/`, `/servicios/agentes-ia-whatsapp/`, `/servicios/automatizacion-n8n/`, `/kommo/`, `/discovery/` |
| Nota | Revisar con el cliente obligaciones de protección de datos del sector antes de publicar ejemplos. |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Cada prospecto calificado y en su etapa antes de que tu asesor tome el teléfono.' + Discovery + WhatsApp.
   - Imagen: asesor financiero (45 años), sujeto a la izquierda, texto a la derecha. Hombre de traje sin corbata en una oficina corporativa de noche, ventanal con ciudad desenfocada, luz azul fría con borde cian; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cómo ayuda la IA en el sector financiero?**: Párrafo citable: el agente responde con información aprobada, hace las preguntas de calificación, pide documentos y agenda con el asesor; el CRM guarda el historial.
3. **Lo que pasa hoy**: Dolores en ámbar con salida en cian: prospectos de anuncios que nadie califica a tiempo, documentos que llegan incompletos por WhatsApp, asesores perdiendo horas en curiosos.
4. **Qué automatizamos**: 5 tarjetas: calificación inicial con preguntas aprobadas, solicitud y recepción ordenada de documentos, agenda con asesor, seguimiento por etapa en el CRM, reportes automáticos para dirección.
5. **Así trabaja Kain en tu despacho o financiera** **[CINE]**: Conversación de ejemplo en HTML marcada 'ejemplo ilustrativo' (prospecto pregunta por un crédito; Kain hace 3 preguntas de calificación y agenda con un asesor) + lo que Kain no hace (no da asesoría financiera ni promete aprobaciones).
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha sobre un escritorio de oficina corporativa nocturna, junto a una carpeta de cristal translúcida; izquierda en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Resultados**: Sin caso publicado del sector. Cifras transversales con origen: Tiempo de respuesta de 8 min a 12 s (clínica dental, Monterrey); −60% de tiempo operativo (promedio, primeros 90 días). Reemplazar cuando haya caso financiero confirmado.
7. **Servicios recomendados**: Tarjetas a /servicios/crm-con-ia/, /servicios/agentes-ia-whatsapp/, /servicios/automatizacion-n8n/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre el sector financiero (N11, N14, W02, G07); texto idéntico al FAQPage del <head>.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuántos prospectos llegan sin calificar a tu asesor? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/industrias/inmobiliario/` · Inmobiliario

| Campo | Valor |
|---|---|
| Plantilla · estado | T-INDUSTRY · nueva |
| Propósito | Captar inmobiliarias y desarrolladoras que pierden leads de portales y anuncios por respuesta lenta. |
| Keyword principal | agente de IA para inmobiliarias |
| Title (50) | IA para inmobiliarias y desarrolladoras \| Ingeniak |
| Meta description (152) | Cada lead de tus anuncios y portales recibe respuesta en segundos, se califica por zona y presupuesto y agenda su visita, con todo registrado en tu CRM. |
| H1 | Agentes de IA para inmobiliarias y desarrolladoras |
| Breadcrumb | Inicio › Industrias › Inmobiliario |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, tengo una inmobiliaria y quiero responder y calificar leads al instante." |
| JSON-LD | WebPage, Service (audience: sector), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/kommo/`, `/servicios/paid-media/`, `/servicios/crm-con-ia/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'El lead que contestas primero es el que visita. Que nunca más se enfríe uno.' + Discovery + WhatsApp.
   - Imagen: asesora inmobiliaria (38 años), sujeto a la derecha, texto a la izquierda. Mujer en el interior de un departamento muestra de lujo al atardecer, ventanales con ciudad, llaves en mano; luz dorada mínima con borde cian; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cómo ayuda la IA en inmobiliarias y desarrolladoras?**: Párrafo citable: el agente responde a cada lead en segundos, pregunta zona, presupuesto y forma de pago, comparte información aprobada del desarrollo y agenda la visita.
3. **Lo que pasa hoy**: Dolores en ámbar con salida en cian: leads de portales que esperan horas, asesores con decenas de chats, visitas que no se confirman.
4. **Qué automatizamos**: 6 tarjetas: respuesta inmediata a leads de anuncios y portales, calificación por zona y presupuesto, envío de fichas aprobadas, agenda de visitas, recordatorios, pipeline por desarrollo en el CRM.
5. **Así trabaja Kain en tu inmobiliaria** **[CINE]**: Conversación de ejemplo en HTML marcada 'ejemplo ilustrativo' (lead pregunta por un departamento de 2 recámaras; Kain califica presupuesto y agenda visita para el sábado) + lo que Kain no hace (no promete precios ni condiciones que la inmobiliaria no haya aprobado).
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda en un lobby de edificio residencial nocturno, piso de mármol oscuro con reflejo; derecha en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Resultados**: Sin caso publicado del sector. Cifras transversales con origen: Tiempo de respuesta de 8 min a 12 s (clínica dental, Monterrey); +340% en conversiones (retail multimarca, Kommo + IA). Reemplazar cuando haya caso inmobiliario confirmado.
7. **Servicios recomendados**: Tarjetas a /servicios/agentes-ia-whatsapp/, /kommo/, /servicios/paid-media/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre inmobiliarias y desarrolladoras (N11, G02, G05, G07); texto idéntico al FAQPage del <head>.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuánto tarda tu equipo en contestar un lead? Lo medimos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/industrias/industrial-logistica/` · Industrial y logística

| Campo | Valor |
|---|---|
| Plantilla · estado | T-INDUSTRY · nueva |
| Propósito | Captar empresas industriales y de logística con el caso de 27 procesos automatizados. |
| Keyword principal | automatización con IA para logística |
| Title (59) | Automatización con IA para industria y logística \| Ingeniak |
| Meta description (130) | Integramos CRM, WhatsApp, ERP y modelos de IA con flujos en n8n. Caso real: 27 procesos automatizados en una empresa de logística. |
| H1 | Automatización con IA para empresas industriales y de logística |
| Breadcrumb | Inicio › Industrias › Industrial y logística |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, tengo una empresa industrial o de logística y quiero automatizar procesos." |
| JSON-LD | WebPage, Service (audience: sector), BreadcrumbList, FAQPage |
| Enlaces internos | `/casos/logistica-n8n/`, `/servicios/automatizacion-n8n/`, `/servicios/desarrollo-software/`, `/servicios/consultoria-ia-empresas/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Menos captura manual, más operación que se mueve sola.' + Discovery + WhatsApp.
   - Imagen: gerente de planta (50 años) con casco en mano, sujeto a la izquierda, texto a la derecha. Hombre en una nave industrial nocturna con maquinaria desenfocada, luz de trabajo fría y destellos cian; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cómo ayuda la IA en industria y logística?**: Párrafo citable: conectamos los sistemas que ya tienes (ERP, CRM, WhatsApp, hojas de cálculo) para que la información fluya sola y la IA resuelva tareas repetitivas.
3. **Lo que pasa hoy**: Dolores en ámbar con salida en cian: datos capturados dos o tres veces, pedidos y estatus por WhatsApp sin registro, reportes armados a mano.
4. **Qué automatizamos**: 6 tarjetas: sincronización ERP ↔ CRM, estatus de pedidos por WhatsApp, alertas en tiempo real, reportes automáticos, cotizaciones asistidas, agentes de IA orquestados con n8n.
5. **Así trabaja Kain en tu operación** **[CINE]**: Conversación de ejemplo en HTML marcada 'ejemplo ilustrativo' (cliente pregunta el estatus de su pedido; Kain consulta el sistema y responde con la fecha estimada) + lo que Kain no hace (solo comparte datos que el sistema autoriza).
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha en un muelle de carga nocturno con cajas apiladas desenfocadas y líneas de luz cian que salen de él; izquierda en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Resultados**: Cifras confirmadas: 27 procesos automatizados (logística, n8n); −60% de tiempo operativo (promedio, primeros 90 días). Enlace /casos/logistica-n8n/.
7. **Servicios recomendados**: Tarjetas a /servicios/automatizacion-n8n/, /servicios/desarrollo-software/, /servicios/consultoria-ia-empresas/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre industria y logística (G06, N05, G08, G07); texto idéntico al FAQPage del <head>.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuántas horas se van en capturar datos a mano? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/industrias/retail-ecommerce/` · Retail y e-commerce

| Campo | Valor |
|---|---|
| Plantilla · estado | T-INDUSTRY · nueva |
| Propósito | Captar retail y e-commerce con tres cifras confirmadas (+340%, −58% CPL, 1 vista · 7 fuentes). |
| Keyword principal | IA para e-commerce |
| Title (58) | IA para retail y e-commerce: vende más por chat \| Ingeniak |
| Meta description (145) | Kommo + agentes de IA, campañas conectadas y un tablero único: +340% en conversiones en retail y −58% en costo por lead en un e-commerce de CDMX. |
| H1 | IA y CRM para retail y e-commerce |
| Breadcrumb | Inicio › Industrias › Retail y e-commerce |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, tengo un retail o e-commerce y quiero vender más por chat." |
| JSON-LD | WebPage, Service (audience: sector), BreadcrumbList, FAQPage |
| Enlaces internos | `/casos/retail-multimarca-kommo/`, `/casos/ecommerce-cdmx-costo-por-lead/`, `/kommo/`, `/servicios/paid-media/`, `/servicios/desarrollo-software/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Que cada chat de Instagram y WhatsApp termine en una venta registrada.' + Discovery + WhatsApp.
   - Imagen: dueño de tienda de moda (35 años), sujeto a la derecha, texto a la izquierda. Hombre en una boutique de moda cerrada de noche, percheros desenfocados y luz de exhibición tenue, celular en mano; borde cian; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cómo ayuda la IA en retail y e-commerce?**: Párrafo citable: el sistema une chats, CRM, campañas y datos de venta para que cada conversación tenga seguimiento y cada peso de pauta se mida en ventas.
3. **Lo que pasa hoy**: Dolores en ámbar con salida en cian: chats sin seguimiento, carritos y cotizaciones olvidadas, datos de venta en 7 lugares distintos.
4. **Qué automatizamos**: 6 tarjetas: agente de IA en Instagram y WhatsApp, Kommo con calificación por IA, seguimiento a cotizaciones, campañas medidas por venta, tablero único de tráfico, conversión y ROAS, alertas automáticas.
5. **Así trabaja Kain en tu tienda** **[CINE]**: Conversación de ejemplo en HTML marcada 'ejemplo ilustrativo' (clienta pregunta si hay talla en una prenda; Kain confirma disponibilidad con el catálogo y comparte el enlace de compra) + lo que Kain no hace (no inventa existencias ni precios fuera del catálogo).
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda en un aparador de tienda de noche, iluminado desde abajo con luz cian, reflejos en el vidrio; derecha en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Resultados**: Cifras confirmadas: +340% en conversiones (retail multimarca, Kommo + IA); −58% en costo por lead en 60 días (e-commerce, CDMX); 1 vista · 7 fuentes en un tablero unificado (e-commerce). Enlaces a /casos/retail-multimarca-kommo/ y /casos/ecommerce-cdmx-costo-por-lead/.
7. **Servicios recomendados**: Tarjetas a /kommo/, /servicios/paid-media/, /servicios/desarrollo-software/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre retail y e-commerce (K03, G08, G05, G07); texto idéntico al FAQPage del <head>.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuántas ventas se quedan en el chat? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/industrias/horeca/` · HoReCa

| Campo | Valor |
|---|---|
| Plantilla · estado | T-INDUSTRY · nueva |
| Propósito | Captar restaurantes, hoteles y cafeterías con el caso de ROAS 4.8× sostenido. |
| Keyword principal | marketing con IA para restaurantes y hoteles |
| Title (53) | IA y marketing para restaurantes y hoteles \| Ingeniak |
| Meta description (149) | Campañas medidas por reservas, agentes de IA que responden y reservan por WhatsApp y un CRM de clientes. Caso real: ROAS de 4.8× sostenido en HoReCa. |
| H1 | IA, paid media y automatización para restaurantes y hoteles |
| Breadcrumb | Inicio › Industrias › HoReCa |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, tengo un restaurante u hotel y quiero más reservas medidas por campaña." |
| JSON-LD | WebPage, Service (audience: sector), BreadcrumbList, FAQPage |
| Enlaces internos | `/casos/horeca-roas/`, `/servicios/paid-media/`, `/servicios/agentes-ia-whatsapp/`, `/servicios/crm-con-ia/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Mesas y habitaciones llenas con campañas que se miden en reservas.' + Discovery + WhatsApp.
   - Imagen: gerente de hotel boutique (42 años), sujeto a la izquierda, texto a la derecha. Mujer en el lobby de un hotel boutique de noche, lámparas cálidas desenfocadas, uniforme elegante oscuro, borde cian; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, texto abajo.
2. **¿Cómo ayuda la IA en restaurantes y hoteles?**: Párrafo citable: conectamos campañas, reservas y conversaciones para saber qué anuncio llenó qué mesa o habitación, y para que nadie espere respuesta.
3. **Lo que pasa hoy**: Dolores en ámbar con salida en cian: reservas por WhatsApp que nadie contesta en hora pico, campañas sin saber cuántas reservas trajeron, clientes que no regresan.
4. **Qué automatizamos**: 5 tarjetas: campañas con creativos dinámicos y audiencias predictivas, atribución multicanal, agente que responde y reserva, recordatorios, base de clientes en el CRM para reactivar.
5. **Así trabaja Kain en tu restaurante u hotel** **[CINE]**: Conversación de ejemplo en HTML marcada 'ejemplo ilustrativo' (cliente pide mesa para 4 el viernes a las 9 p. m.; Kain confirma disponibilidad y la reserva) + lo que Kain no hace (solo confirma reservas que el sistema de reservas permite).
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha sobre la barra de un restaurante elegante cerrado, copas desenfocadas y luz cálida mínima con brillo cian; izquierda en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Resultados**: Cifra confirmada: ROAS de 4.8× sostenido (HoReCa). Enlace /casos/horeca-roas/.
7. **Servicios recomendados**: Tarjetas a /servicios/paid-media/, /servicios/agentes-ia-whatsapp/, /servicios/crm-con-ia/.
8. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre restaurantes y hoteles (G14, N02, G02, G07); texto idéntico al FAQPage del <head>.
9. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuántas reservas trae cada peso de tu pauta? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

### 13.4 Casos

#### `/casos/` · Casos

| Campo | Valor |
|---|---|
| Plantilla · estado | T-HUB · nueva |
| Propósito | Concentrar la prueba: todas las cifras confirmadas con contexto citable y acceso a cada caso. |
| Keyword principal | casos de éxito inteligencia artificial |
| Title (49) | Casos de éxito con IA y automatización \| Ingeniak |
| Meta description (140) | Resultados reales: 3.2× más citas en 90 días, −58% en costo por lead, +340% en conversiones con Kommo + IA y ROAS de 4.8×. Conoce cada caso. |
| H1 | Casos de éxito con IA y automatización |
| Breadcrumb | Inicio › Casos |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vi los casos de éxito de Ingeniak y quiero resultados así en mi empresa." |
| JSON-LD | CollectionPage, ItemList, BreadcrumbList |
| Enlaces internos | `/casos/clinica-dental-monterrey/`, `/casos/retail-multimarca-kommo/`, `/casos/ecommerce-cdmx-costo-por-lead/`, `/casos/horeca-roas/`, `/casos/logistica-n8n/`, `/industrias/`, `/servicios/` |
| Redirecciones entrantes | `/blog/agentes-ia-conversacional-casos-roi`, `/blog/automatizar-ventas-b2b-ia-crm-caso-roi` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Sistemas reales, operando hoy mismo.' + Discovery + WhatsApp. Las cifras (3.2×, +340%, ROAS 4.8×) aparecen en HTML como pastillas de cristal flotando sobre la imagen.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha de pie sobre un piso de cristal oscuro, del que suben tres columnas de luz cian a distintas alturas hacia la izquierda (sin números en la imagen); fondo navy con ondas. Celular: 9:16: KAIN arriba, cifras y texto abajo.
2. **Ingeniak en datos**: Las 10 cifras confirmadas, cada una en una oración citable con sector, ciudad y plazo; nota 'datos internos de Ingeniak, octubre de 2026'.
3. **Filtrar**: Chips por servicio (Agentes de IA, CRM, Automatización, Paid media, Datos) y por industria; filtrado en el cliente sobre HTML ya renderizado.
4. **Casos**: 5 tarjetas cinematográficas (imagen del sector + cifra + una línea) → páginas de caso.
5. **Resultados agregados**: 3 bloques: 12 → 47 citas/mes (promedio, salud), −60% tiempo operativo (primeros 90 días), 1 vista · 7 fuentes (e-commerce).
6. **Cómo medimos**: Qué significa cada métrica, de dónde sale y desde cuándo; por qué no publicamos nombres de clientes sin su autorización.
7. **Testimonios**: Solo testimonios aprobados por escrito con nombre, cargo y empresa; si no hay, la sección no se publica.
8. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Quieres un sistema así? Empecemos por ver tu operación." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida D: foto real del equipo (team-hero) extendida con outpainting; texto a la izquierda.

#### `/casos/clinica-dental-monterrey/` · Clínica dental en Monterrey

| Campo | Valor |
|---|---|
| Plantilla · estado | T-CASE · nueva |
| Propósito | Caso estrella de agentes de IA en WhatsApp para salud. |
| Keyword principal | agente de IA para clínica dental |
| Title (50) | Clínica dental en Monterrey: 3.2× más citas con IA |
| Meta description (140) | Cómo una clínica dental de Monterrey logró 3.2× más citas en 90 días con un agente de IA en WhatsApp que responde en 12 s en lugar de 8 min. |
| H1 | Clínica dental en Monterrey: 3.2× más citas en 90 días con un agente de IA |
| Breadcrumb | Inicio › Casos › Clínica dental en Monterrey |
| CTA principal | Quiero un sistema así: agenda tu Discovery → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí el caso de la clínica dental de Monterrey y quiero algo así para mi negocio." |
| JSON-LD | Article, BreadcrumbList, Person (autor) |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/industrias/salud/`, `/kain/`, `/casos/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + cifra gigante en HTML (3.2× · 8 min → 12 s) + una línea de contexto + Discovery + WhatsApp. Etiqueta 'Imagen ilustrativa del sector' en la esquina.
   - Imagen: odontólogo (45 años), sujeto a la derecha, texto a la izquierda. Dentista de pie junto al ventanal de su consultorio en Monterrey al atardecer (silueta de montañas desenfocada), luz cálida y borde cian; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, cifra y texto abajo.
2. **Ficha del caso**: Tabla: sector, ciudad, servicio, herramientas, plazo, cifra. Confirmado: sector salud (clínica dental), Monterrey, N.L.; agente de IA en WhatsApp; 3.2× citas en 90 días; respuesta de 8 min a 12 s. Lo demás: [POR CONFIRMAR CON CLIENTE] o se omite.
3. **Punto de partida**: Situación inicial con números del cliente [POR CONFIRMAR]. Borrador permitido: 'Antes tardaban ocho minutos en contestar un WhatsApp' (dato confirmado: 8 min de respuesta).
4. **Qué implementamos**: Agente conversacional que califica, agenda citas y da seguimiento sin intervención humana, conectado al CRM [VALIDAR CRM usado: Kommo o GoHighLevel].
5. **Resultado** **[CINE]**: Cifra con contexto citable en una oración: 'Una clínica dental en Monterrey logró 3.2 veces más citas en 90 días y bajó su tiempo de respuesta en WhatsApp de 8 minutos a 12 segundos.' + nota 'datos internos de Ingeniak, octubre de 2026'.
   - Imagen: KAIN de cuerpo completo en recepción dental, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda junto a una agenda de cristal con casillas iluminadas en cian, recepción dental nocturna; derecha en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Cómo lo hicimos con VKTOR™**: Las 5 fases con lo que pasó en cada una; solo hitos confirmados por el equipo, si no hay, mostrar las fases genéricas con enlace /metodologia/.
7. **Qué puedes replicar en tu negocio**: 3 ideas para negocios de agenda: responder en segundos, confirmar y recordar automáticamente, registrar cada paciente en el CRM; enlace /industrias/salud/.
8. **Testimonio**: Solo si el cliente aprueba por escrito la frase, su nombre, cargo y empresa; si no, la sección no existe (no usar borradores).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/agentes-ia-whatsapp/ · /industrias/salud/ · /casos/retail-multimarca-kommo/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuántas citas más cabrían en tu agenda? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/casos/retail-multimarca-kommo/` · Retail multimarca

| Campo | Valor |
|---|---|
| Plantilla · estado | T-CASE · nueva |
| Propósito | Caso de CRM Kommo + IA; prueba del partnership con Kommo. |
| Keyword principal | caso de éxito Kommo |
| Title (55) | Retail multimarca: +340% en conversiones con Kommo + IA |
| Meta description (144) | Kommo automatizado con calificación de leads por IA y embudo de conversión en tiempo real: así un retail multimarca logró +340% en conversiones. |
| H1 | Retail multimarca: +340% en conversiones con Kommo e IA |
| Breadcrumb | Inicio › Casos › Retail multimarca |
| CTA principal | Quiero un sistema así: agenda tu Discovery → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí el caso del retail multimarca con Kommo y quiero mejorar mis conversiones." |
| JSON-LD | Article, BreadcrumbList, Person (autor) |
| Enlaces internos | `/kommo/`, `/servicios/crm-con-ia/`, `/industrias/retail-ecommerce/`, `/casos/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + cifra gigante en HTML (+340%) + una línea de contexto + Discovery + WhatsApp. Etiqueta 'Imagen ilustrativa del sector' en la esquina.
   - Imagen: directora comercial de retail (40 años), sujeto a la izquierda, texto a la derecha. Mujer de pie en el piso de ventas de una tienda multimarca cerrada, maniquíes y estantes desenfocados, luz de exhibición tenue con borde cian; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, cifra y texto abajo.
2. **Ficha del caso**: Tabla: sector, ciudad, servicio, herramientas, plazo, cifra. Confirmado: retail multimarca; Kommo + IA; +340% en conversiones. Lo demás: [POR CONFIRMAR CON CLIENTE] o se omite.
3. **Punto de partida**: Situación inicial con números del cliente [POR CONFIRMAR]. Borrador permitido: 'Tenían Kommo, pero nadie le daba seguimiento' [VALIDAR con cliente; viene del borrador de testimonio de v1].
4. **Qué implementamos**: Pipeline en Kommo con calificación de leads por IA y embudo de conversión en tiempo real (descripción confirmada del sitio actual).
5. **Resultado** **[CINE]**: Cifra con contexto citable en una oración: 'Un retail multimarca logró +340% en conversiones con Kommo automatizado y calificación de leads por IA.' + nota 'datos internos de Ingeniak, octubre de 2026'.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha frente a columnas de luz que representan etapas de un embudo, la última más brillante; fondo navy; izquierda limpia. Celular: 9:16: KAIN arriba, texto abajo.
6. **Cómo lo hicimos con VKTOR™**: Las 5 fases con lo que pasó en cada una; solo hitos confirmados por el equipo, si no hay, mostrar las fases genéricas con enlace /metodologia/.
7. **Qué puedes replicar en tu negocio**: 3 ideas: calificar cada lead al entrar, mover etapas sin captura manual, ver el embudo en tiempo real; enlace /kommo/.
8. **Testimonio**: Solo si el cliente aprueba por escrito la frase, su nombre, cargo y empresa; si no, la sección no existe (no usar borradores).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /kommo/ · /industrias/retail-ecommerce/ · /casos/ecommerce-cdmx-costo-por-lead/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Tu Kommo vende o solo guarda contactos? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/casos/ecommerce-cdmx-costo-por-lead/` · E-commerce en CDMX

| Campo | Valor |
|---|---|
| Plantilla · estado | T-CASE · nueva |
| Propósito | Caso de eficiencia de adquisición (CPL) para e-commerce. |
| Keyword principal | reducir costo por lead e-commerce |
| Title (53) | E-commerce en CDMX: −58% en costo por lead en 60 días |
| Meta description (140) | Cómo un e-commerce de la Ciudad de México redujo 58% su costo por lead en 60 días: el punto de partida, lo que implementamos y el resultado. |
| H1 | E-commerce en la Ciudad de México: −58% en costo por lead en 60 días |
| Breadcrumb | Inicio › Casos › E-commerce en CDMX |
| CTA principal | Quiero un sistema así: agenda tu Discovery → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí el caso del e-commerce de CDMX y quiero bajar mi costo por lead." |
| JSON-LD | Article, BreadcrumbList, Person (autor) |
| Enlaces internos | `/servicios/paid-media/`, `/servicios/desarrollo-software/`, `/industrias/retail-ecommerce/`, `/casos/`, `/discovery/` |
| Nota | Página bloqueada hasta confirmar con el cliente qué se implementó. Sin eso, solo puede publicarse la ficha y la cifra. |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + cifra gigante en HTML (−58% CPL) + una línea de contexto + Discovery + WhatsApp. Etiqueta 'Imagen ilustrativa del sector' en la esquina.
   - Imagen: fundador de e-commerce (33 años), sujeto a la derecha, texto a la izquierda. Hombre en una bodega pequeña y ordenada de e-commerce de noche, cajas de envío desenfocadas, laptop abierta iluminando su rostro en cian; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, cifra y texto abajo.
2. **Ficha del caso**: Tabla: sector, ciudad, servicio, herramientas, plazo, cifra. Confirmado: e-commerce, Ciudad de México; −58% en costo por lead en 60 días. Lo demás: [POR CONFIRMAR CON CLIENTE] o se omite.
3. **Punto de partida**: Situación inicial con números del cliente [POR CONFIRMAR]. Borrador permitido: [POR CONFIRMAR CON CLIENTE: costo por lead inicial, canales y presupuesto]. No hay borrador publicable.
4. **Qué implementamos**: [POR CONFIRMAR CON CLIENTE: servicios implementados]. Si es el mismo cliente del tablero unificado, añadir '1 vista · 7 fuentes' (tráfico, conversión y ROAS en un solo tablero con alertas por IA); si no, mover esa cifra a /servicios/desarrollo-software/ solamente.
5. **Resultado** **[CINE]**: Cifra con contexto citable en una oración: 'Un e-commerce en la Ciudad de México redujo 58% su costo por lead en 60 días.' + nota 'datos internos de Ingeniak, octubre de 2026'.
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda junto a una curva de luz cian descendente que cruza el cuadro (sin ejes ni números); fondo navy; derecha limpia. Celular: 9:16: KAIN arriba, texto abajo.
6. **Cómo lo hicimos con VKTOR™**: Las 5 fases con lo que pasó en cada una; solo hitos confirmados por el equipo, si no hay, mostrar las fases genéricas con enlace /metodologia/.
7. **Qué puedes replicar en tu negocio**: 3 ideas: medir el costo por lead real desde el CRM, cortar lo que no convierte, decidir con un solo tablero; enlace /servicios/paid-media/.
8. **Testimonio**: Solo si el cliente aprueba por escrito la frase, su nombre, cargo y empresa; si no, la sección no existe (no usar borradores).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/paid-media/ · /industrias/retail-ecommerce/ · /casos/horeca-roas/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuánto te cuesta hoy cada lead? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/casos/horeca-roas/` · HoReCa

| Campo | Valor |
|---|---|
| Plantilla · estado | T-CASE · nueva |
| Propósito | Caso de paid media medido por retorno para hoteles y restaurantes. |
| Keyword principal | caso de éxito publicidad restaurantes |
| Title (56) | HoReCa: ROAS de 4.8× sostenido con paid media \| Ingeniak |
| Meta description (134) | Creativos dinámicos, audiencias predictivas y atribución multicanal: así un cliente de hoteles y restaurantes sostuvo un ROAS de 4.8×. |
| H1 | HoReCa: ROAS de 4.8× sostenido con paid media |
| Breadcrumb | Inicio › Casos › HoReCa |
| CTA principal | Quiero un sistema así: agenda tu Discovery → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí el caso HoReCa con ROAS 4.8× y quiero campañas así para mi negocio." |
| JSON-LD | Article, BreadcrumbList, Person (autor) |
| Enlaces internos | `/servicios/paid-media/`, `/industrias/horeca/`, `/casos/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + cifra gigante en HTML (ROAS 4.8×) + una línea de contexto + Discovery + WhatsApp. Etiqueta 'Imagen ilustrativa del sector' en la esquina.
   - Imagen: propietario de restaurante (50 años), sujeto a la izquierda, texto a la derecha. Hombre de pie en la terraza de su restaurante lleno al anochecer, luces cálidas colgantes desenfocadas, borde cian; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, cifra y texto abajo.
2. **Ficha del caso**: Tabla: sector, ciudad, servicio, herramientas, plazo, cifra. Confirmado: HoReCa (hoteles y restaurantes); paid media en Meta Ads; ROAS 4.8× sostenido. Lo demás: [POR CONFIRMAR CON CLIENTE] o se omite.
3. **Punto de partida**: Situación inicial con números del cliente [POR CONFIRMAR]. Borrador permitido: [POR CONFIRMAR CON CLIENTE: inversión, canales y ROAS inicial].
4. **Qué implementamos**: Creativos dinámicos, audiencias predictivas y atribución multicanal (descripción confirmada del sitio actual).
5. **Resultado** **[CINE]**: Cifra con contexto citable en una oración: 'Un cliente de hoteles y restaurantes sostuvo un ROAS de 4.8× con campañas de paid media.' + nota 'datos internos de Ingeniak, octubre de 2026'.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha en la barra de un bar elegante cerrado, copas desenfocadas, luz cálida mínima y brillo cian; izquierda en navy limpio. Celular: 9:16: KAIN arriba, texto abajo.
6. **Cómo lo hicimos con VKTOR™**: Las 5 fases con lo que pasó en cada una; solo hitos confirmados por el equipo, si no hay, mostrar las fases genéricas con enlace /metodologia/.
7. **Qué puedes replicar en tu negocio**: 3 ideas: medir reservas y ventas, no clics; renovar creativos con datos; atribuir cada venta a su canal; enlace /industrias/horeca/.
8. **Testimonio**: Solo si el cliente aprueba por escrito la frase, su nombre, cargo y empresa; si no, la sección no existe (no usar borradores).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/paid-media/ · /industrias/horeca/ · /casos/ecommerce-cdmx-costo-por-lead/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Tus campañas se miden en ventas? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/casos/logistica-n8n/` · Logística

| Campo | Valor |
|---|---|
| Plantilla · estado | T-CASE · nueva |
| Propósito | Caso de automatización de procesos con n8n. |
| Keyword principal | caso de éxito automatización n8n |
| Title (55) | Logística: 27 procesos automatizados con n8n \| Ingeniak |
| Meta description (146) | Integraciones entre CRM, WhatsApp, ERP y modelos de IA con disparadores en tiempo real: así automatizamos 27 procesos de una empresa de logística. |
| H1 | Logística: 27 procesos automatizados con n8n y agentes de IA |
| Breadcrumb | Inicio › Casos › Logística |
| CTA principal | Quiero un sistema así: agenda tu Discovery → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí el caso de logística con 27 procesos automatizados y quiero automatizar mi operación." |
| JSON-LD | Article, BreadcrumbList, Person (autor) |
| Enlaces internos | `/servicios/automatizacion-n8n/`, `/industrias/industrial-logistica/`, `/servicios/desarrollo-software/`, `/casos/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + cifra gigante en HTML (27 procesos) + una línea de contexto + Discovery + WhatsApp. Etiqueta 'Imagen ilustrativa del sector' en la esquina.
   - Imagen: coordinadora de logística (36 años), sujeto a la derecha, texto a la izquierda. Mujer con chaleco en un centro de distribución de noche, montacargas y estantes desenfocados, tableta en mano, líneas de luz cian; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, cifra y texto abajo.
2. **Ficha del caso**: Tabla: sector, ciudad, servicio, herramientas, plazo, cifra. Confirmado: logística; n8n + agentes de IA; 27 procesos automatizados. Lo demás: [POR CONFIRMAR CON CLIENTE] o se omite.
3. **Punto de partida**: Situación inicial con números del cliente [POR CONFIRMAR]. Borrador permitido: [POR CONFIRMAR CON CLIENTE: procesos manuales, horas y sistemas previos].
4. **Qué implementamos**: Integraciones entre CRM, WhatsApp, ERP y modelos de IA con disparadores en tiempo real (descripción confirmada del sitio actual).
5. **Resultado** **[CINE]**: Cifra con contexto citable en una oración: 'En una empresa de logística automatizamos 27 procesos con n8n, conectando CRM, WhatsApp, ERP y modelos de IA.' + nota 'datos internos de Ingeniak, octubre de 2026'.
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda en el centro de una red de 27 nodos de luz cian conectados que se extiende hacia la derecha (sin números en la imagen); fondo navy. Celular: 9:16: KAIN arriba, texto abajo.
6. **Cómo lo hicimos con VKTOR™**: Las 5 fases con lo que pasó en cada una; solo hitos confirmados por el equipo, si no hay, mostrar las fases genéricas con enlace /metodologia/.
7. **Qué puedes replicar en tu negocio**: 3 ideas: empezar por el proceso que más se repite, conectar antes de reemplazar sistemas, poner alertas en tiempo real; enlace /servicios/automatizacion-n8n/.
8. **Testimonio**: Solo si el cliente aprueba por escrito la frase, su nombre, cargo y empresa; si no, la sección no existe (no usar borradores).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/automatizacion-n8n/ · /industrias/industrial-logistica/ · /casos/clinica-dental-monterrey/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Qué procesos de tu operación podrían moverse solos? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida D: foto real del equipo (team-hero) extendida con outpainting; texto a la izquierda.

### 13.5 Empresa

#### `/kain/` · Kain

| Campo | Valor |
|---|---|
| Plantilla · estado | T-PRODUCT · nueva |
| Propósito | Presentar a kain (sub-marca, plataforma app.kain.mx y personaje) y convertir con demo por WhatsApp. |
| Keyword principal | kain agente de IA |
| Title (45) | kain: plataforma de agentes de IA de Ingeniak |
| Meta description (138) | Soy Kain, el agente de IA de tu empresa: respondo, agendo y confirmo en WhatsApp, Instagram y tu web, y registro todo en tu CRM. Conóceme. |
| H1 | Soy Kain, el agente de IA de tu empresa |
| Breadcrumb | Inicio › Kain |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de tu página en ingeniak.mx y quiero ver una demo de cómo atiendes a mis clientes." |
| JSON-LD | WebPage, Brand, SoftwareApplication (sin offers ni rating), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/industrias/`, `/casos/clinica-dental-monterrey/`, `/kommo/`, `/gohighlevel/`, https://app.kain.mx/, `/discovery/` |
| Nota | Reglas: logotipo 'kain' en minúsculas; KAIN siempre de cuerpo completo; nunca 'Tu negocio trabajando, aunque tú no'. |

Secciones:

1. **Portada** **[CINE]**: Logotipo 'kain · by Ingeniak' (siempre en minúsculas) + H1 en primera persona + 'Respondo, agendo y confirmo por ti en WhatsApp, Instagram y tu web, y registro cada conversación en tu CRM.' + Discovery + 'Escríbele a Kain' + enlace app.kain.mx. Clip WebM con alfa de Kain saludando (fallback imagen en Safari).
   - Imagen: KAIN de cuerpo completo saludando, sujeto a la derecha, texto a la izquierda. KAIN grande a la derecha saludando, sobre piso negro con reflejo, halo cian detrás y ondas sedosas azules; mitad izquierda en navy limpio. Celular: 9:16: KAIN arriba a cuerpo completo, texto abajo.
2. **¿Qué es kain?**: Definición citable (G13): sub-marca de agentes de IA de Ingeniak, plataforma app.kain.mx y el personaje que le da cara.
3. **Lo que hago**: 6 capacidades en primera persona + video del chat (kain-chat) en celular de cristal: respondo en segundos, califico, agendo, confirmo, doy seguimiento, registro en Kommo o GoHighLevel.
4. **Dónde trabajo**: Canales (WhatsApp, Instagram, web) e integraciones (Kommo, GoHighLevel, calendarios, n8n).
5. **Lo que sí y lo que no** **[CINE]**: 'Lo que sí hago' / 'Lo que no hago' (no doy consejo médico ni legal; no soy un chatbot de menús). Slogan 'Tu negocio trabajando, sin depender más de ti.'
   - Imagen: KAIN de cuerpo completo con brazos cruzados, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda con brazos cruzados, seguro, sobre plataforma de cristal; luz de borde cian; derecha en navy limpio. Celular: 9:16: KAIN arriba, listas abajo.
6. **Kain en tu sector**: 8 mini tarjetas con una frase adaptada del slogan ('Tu clínica trabajando, sin depender más de ti') → /industrias/*.
7. **La plataforma**: Capturas de app.kain.mx marcadas 'vista demo' + botón 'Entrar a app.kain.mx'. Sin precios de planes [VALIDAR si se publican; regla: terminan en 47 o 97 y nunca menos de USD 97].
8. **Resultados**: Tiempo de respuesta de 8 min a 12 s (clínica dental, Monterrey); 3.2× más citas en 90 días (clínica dental, Monterrey).
9. **Preguntas frecuentes**: Acordeón de 5 preguntas sobre Kain (G13, N12, N13, N01, W02); texto idéntico al FAQPage del <head>.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "Escríbeme y te muestro cómo atendería a tus clientes." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/metodologia/` · Metodología VKTOR™

| Campo | Valor |
|---|---|
| Plantilla · estado | T-METHOD · conserva URL |
| Propósito | Explicar VKTOR™ con la expansión correcta y dar estructura HowTo; corregir la versión errónea que circula (Know/Translate/Optimize/Reinforce). |
| Keyword principal | metodología VKTOR |
| Title (52) | Metodología VKTOR™: cómo implementamos IA \| Ingeniak |
| Meta description (149) | Verify, Koncept, Transform, Operate y Rise: las 5 fases con las que llevamos la IA de tu operación real a producción, con resultados en 60 a 90 días. |
| H1 | Metodología VKTOR™: tu crecimiento tiene un protocolo |
| Breadcrumb | Inicio › Metodología VKTOR™ |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de la metodología VKTOR y quiero empezar el protocolo en mi empresa." |
| JSON-LD | WebPage, HowTo (5 HowToStep), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/consultoria-ia-empresas/`, `/casos/`, `/servicios/`, `/nosotros/`, `/discovery/` |
| Redirecciones entrantes | `/metodologia`, `/blog/metodologia-vktor-implementar-ia-roi-90-dias`, `/blog/como-implementar-ia-empresa-guia-practica-2026`, `/blog/roi-inteligencia-artificial-pyme-metricas-medir` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Nosotros lo activamos.' + las 5 letras V K T O R en HTML grande con trazo cian + Discovery + WhatsApp.
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda frente a cinco monolitos de cristal de distinta altura alineados hacia la derecha, iluminados por dentro en cian (sin letras en la imagen); fondo navy. Celular: 9:16: KAIN arriba, monolitos detrás, texto abajo.
2. **¿Qué es VKTOR™?**: Definición citable (G12) + 'resultados medibles en 60 a 90 días'.
3. **Las 5 fases (secuencia fijada al scroll)** **[CINE]**: Secuencia pinned de 5 pantallas, cada una con su imagen a sangre y texto al lado: V Verify 'Verificamos tu operación' · K Koncept 'Diseñamos el concepto' · T Transform 'Transformamos' · O Operate 'Operamos junto con tu equipo' · R Rise 'Hacemos crecer los resultados'. Cada fase: qué hacemos, con quién, qué sale de la fase.
   - Imagen: 5 escenas con personas (una por fase), sujeto a la alterna. V: consultora revisando números con un dueño · K: pizarra de cristal con diagrama de luz · T: ingeniero implementando frente a pantallas · O: equipo del cliente en capacitación · R: dirección mirando un tablero que crece. Mismo encuadre 21:9, sujeto alternando derecha/izquierda, lado opuesto en navy. Celular: 5 recortes 9:16 con sujeto arriba.
4. **Qué pasa en cada fase**: Tabla fase / qué hacemos / resultado de la fase, con las líneas confirmadas de v1 (ej. Verify: 'Revisamos con números cómo vendes, atiendes y operas hoy').
5. **Tiempos**: Línea 'proyectos planteados para dar resultados medibles en 60 a 90 días' + ejemplos 3.2× en 90 días y −58% CPL en 60 días.
6. **Nota de consistencia**: No publicar la expansión antigua 'Verify, Know, Translate, Optimize, Reinforce'; esta página es la fuente única para llms.txt y schema.
7. **Preguntas frecuentes**: Acordeón de 3 preguntas sobre VKTOR™ (G12, G08, G11); texto idéntico al FAQPage del <head>.
8. **Cierre** **[CINE]**: Cierre cinematográfico: "El protocolo empieza con 30 minutos de diagnóstico." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/tecnologias/` · Tecnologías

| Campo | Valor |
|---|---|
| Plantilla · estado | T-STACK · nueva |
| Propósito | Mostrar el stack por categoría con las reglas de marca de cada herramienta y enlazar al servicio donde se usa. |
| Keyword principal | herramientas de IA y automatización para empresas |
| Title (56) | Tecnologías: Kommo, n8n, OpenAI, Claude y más \| Ingeniak |
| Meta description (151) | Las plataformas con las que construimos tu sistema: modelos de OpenAI, Claude y Gemini, Kommo, GoHighLevel, n8n, Make, Meta, Google, Supabase y Stripe. |
| H1 | Tecnologías con las que construimos tu sistema |
| Breadcrumb | Inicio › Tecnologías |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de tecnologías y quiero conectar las herramientas que ya uso." |
| JSON-LD | WebPage, ItemList, BreadcrumbList, FAQPage |
| Enlaces internos | `/kommo/`, `/gohighlevel/`, `/servicios/automatizacion-n8n/`, `/servicios/paid-media/`, `/servicios/desarrollo-software/`, `/blog/n8n-vs-zapier-vs-make/`, `/discovery/` |
| Nota | Seguir las reglas de uso de cada logo de materiales/logos-software/LOGOS.md. |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Elegimos la herramienta según el proceso, no al revés.' + Discovery + WhatsApp.
   - Imagen: KAIN de cuerpo completo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha sentado sobre un bloque de cristal del que salen ramas de luz cian hacia la izquierda, donde flotan placas de cristal vacías (ahí van los logos en HTML); fondo navy. Celular: 9:16: KAIN arriba, logos y texto abajo.
2. **Cómo elegimos**: 4 criterios: qué resuelve el proceso, con qué ya trabaja tu equipo, costo total, quién la opera después.
3. **Modelos de IA**: OpenAI, Anthropic (Claude), Google (Gemini): para qué usamos cada uno; logos en blanco.
4. **CRM**: Kommo (sello Partner oficial, enlazado a kommo.com) → /kommo/; GoHighLevel ('herramienta que implementamos') → /gohighlevel/; HubSpot ('integramos').
5. **Automatización**: n8n (wordmark oficial, mín. 100 px), Make, Zapier → /servicios/automatizacion-n8n/.
6. **Canales y publicidad**: WhatsApp Business, Meta Ads, Google Ads, TikTok Ads, Google Analytics → /servicios/agentes-ia-whatsapp/ y /servicios/paid-media/.
7. **Datos, pagos y contenido**: Supabase, Stripe, Notion, ElevenLabs, HeyGen → /servicios/desarrollo-software/ y /servicios/branding/.
8. **Aviso de marcas**: Línea legal: 'Las marcas mostradas son de sus dueños. Solo Kommo es alianza oficial; las demás son herramientas que usamos o integramos.'
9. **Preguntas frecuentes**: Acordeón de 3 preguntas sobre tecnologías (G09, W02, H04); texto idéntico al FAQPage del <head>.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Ya usas alguna de estas herramientas? Conectémoslas." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/nosotros/` · Nosotros

| Campo | Valor |
|---|---|
| Plantilla · estado | T-ABOUT · conserva URL |
| Propósito | Dar confianza con personas reales, ficha de la entidad (GEO), valores y presencia en 7 países. |
| Keyword principal | Ingeniak equipo |
| Title (38) | Nosotros: el equipo detrás de Ingeniak |
| Meta description (143) | Consultoría de IA con sede en Guadalajara, Jalisco: 6 especialistas, más de 73 sistemas en producción y clientes en 7 países. Conoce al equipo. |
| H1 | Estrategas que construyen, operan y miden |
| Breadcrumb | Inicio › Nosotros |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página Nosotros de Ingeniak y quiero platicar con el equipo." |
| JSON-LD | AboutPage, Organization, Person ×6 (worksFor #organization), BreadcrumbList, FAQPage |
| Enlaces internos | `/metodologia/`, `/kain/`, `/kommo/`, `/casos/`, `/agentes-ia-guadalajara/`, `/contacto/`, `/discovery/` |
| Redirecciones entrantes | `/nosotros` |
| Nota | Victor Ocampo ya no aparece. Fotos: img/equipo/*.webp (las del sitio actual). |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'No somos una agencia tradicional. Somos especialistas que construimos sistemas de crecimiento para tu empresa.' + Discovery + WhatsApp.
   - Imagen: equipo real de Ingeniak (foto team-hero), sujeto a la derecha, texto a la izquierda. Foto real del equipo sin alterar personas; outpainting a la izquierda en navy con ondas sedosas; gradación de color a la paleta de marca. Celular: 4:5: equipo arriba, texto abajo.
2. **Ingeniak en datos (ficha de la entidad)**: Nombre comercial Ingeniak; razón social Ingeniak Technology, LLC; sede Guadalajara, Jalisco; oficina Av. Punto Sur 312, Tlajomulco de Zúñiga, Jal. 45640; partner oficial de Kommo en LATAM; +73 sistemas en producción; 7 países; contacto. Mismos datos que schema, llms.txt y Google Business Profile.
3. **Manifiesto** **[CINE]**: 'Eso ya no es marketing. Es un sistema de dominación comercial. Creamos el tráfico, lo convertimos y lo operamos automáticamente.' + 'Construimos empresarios libres, no héroes cansados.'
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda de espaldas a tres cuartos, mirando una vista nocturna de la zona metropolitana de Guadalajara desde una terraza alta; ciudad desenfocada en azules; derecha en cielo navy limpio. Celular: 9:16: KAIN y ciudad arriba, texto abajo.
4. **Cómo empezamos**: [POR CONFIRMAR CON CLIENTE: año de fundación, origen y hitos]. El sitio actual dice 'fundada en 2022' y 'Radik Soluciones': no publicar hasta confirmar.
5. **Por qué Ingeniak**: 4 valores: Todo conectado (no trabajamos en silos: tu CRM habla con tus anuncios y tus agentes cierran ventas) · Velocidad + estrategia (ejecutamos rápido porque pensamos antes) · Data first (todo se conecta a tableros en tiempo real) · Soporte real (estratega asignado y acceso directo al equipo después del lanzamiento).
6. **El equipo**: 6 tarjetas con foto real, nombre, cargo y una línea: Rik Landeros (Director de Estrategia Comercial), Alonso Vega (Arquitecto de IA y Automatización), César Ovalle (Director Creativo), Richard Vela (Medios de Performance), Andy Pizano (Administración y Finanzas), Marcos González (Líder Comercial). LinkedIn de cada uno [POR CONFIRMAR].
7. **Presencia**: Mapa global (mapa-global.webp) con los 7 países: México (sede), Estados Unidos, Colombia, Argentina, España, Costa Rica y Ecuador + sectores (Salud, Belleza, Nutrición, Finanzas, Inmobiliario, Industrial).
8. **Alianzas y marcas**: Sello Kommo Partner (enlace a kommo.com) + kain como sub-marca (enlace /kain/).
9. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre Ingeniak (G01, G10, L01, G04); texto idéntico al FAQPage del <head>.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "Conócenos en 30 minutos, con tu operación sobre la mesa." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida D: foto real del equipo (team-hero) extendida con outpainting; texto a la izquierda.

#### `/agentes-ia-guadalajara/` · Agentes de IA en Guadalajara

| Campo | Valor |
|---|---|
| Plantilla · estado | T-LOCAL · conserva URL de v1 |
| Propósito | Landing local para Guadalajara, Zapopan y Tlajomulco; señal de entidad local para Google Business Profile. |
| Keyword principal | agentes de IA Guadalajara |
| Title (49) | Agencia de IA en Guadalajara y Jalisco \| Ingeniak |
| Meta description (134) | Agentes de IA para WhatsApp, CRM y automatización para empresas de Guadalajara, Zapopan y Tlajomulco. Oficina en Tlajomulco de Zúñiga. |
| H1 | Agentes de IA para empresas de Guadalajara |
| Breadcrumb | Inicio › Agentes de IA en Guadalajara |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbenos por WhatsApp → WhatsApp: "Hola, vengo de la página de Ingeniak en Guadalajara y quiero información sobre agentes de IA para mi empresa." |
| JSON-LD | WebPage, ProfessionalService (address, geo, areaServed: Guadalajara, Zapopan, Tlajomulco de Zúñiga, Jalisco), Service, BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/kommo/`, `/gohighlevel/`, `/servicios/automatizacion-n8n/`, `/nosotros/`, `/contacto/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + texto de v1 ('…Oficina en Tlajomulco de Zúñiga y clientes en 7 países.') + Discovery + WhatsApp.
   - Imagen: empresario tapatío (45 años), sujeto a la derecha, texto a la izquierda. Hombre en una terraza de oficina al atardecer con la zona metropolitana de Guadalajara desenfocada al fondo (sin monumentos reconocibles en primer plano), luz dorada mínima y borde cian; izquierda en cielo navy limpio. Celular: 4:5: persona arriba, texto abajo.
2. **¿Qué hace Ingeniak en Guadalajara?**: Párrafo citable de v1 + cifras (+73 sistemas, 7 países, 3.2×, −58%).
3. **Ficha local (NAP)**: Sede, dirección completa, teléfono, email, horario [VALIDAR: v1 usaba L–V 09:00–18:00], partner Kommo; idéntico a Google Business Profile.
4. **Qué hacemos en Guadalajara**: 6 tarjetas de v1 con enlaces a sus páginas.
5. **Local y con alcance** **[CINE]**: Dos columnas de v1: 'En Guadalajara y Jalisco' / 'Fuera de Jalisco' (Monterrey, CDMX, 7 países).
   - Imagen: KAIN de cuerpo completo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda sobre una maqueta de cristal de una ciudad iluminada por líneas cian que se extienden hacia la derecha y salen del cuadro; fondo navy. Celular: 9:16: KAIN arriba, texto abajo.
6. **Casos**: Clínica dental (Monterrey) y logística (27 procesos) → páginas de caso.
7. **Cómo llegar**: Mapa estático (imagen) con enlace a Google Maps; sin iframe en la carga inicial.
8. **Metodología VKTOR™**: Las 5 fases (Verify, Koncept, Transform, Operate, Rise) con una línea por fase aplicada a empresas de Jalisco; enlace a /metodologia/.
9. **Preguntas frecuentes**: Acordeón de 6 preguntas sobre empresas de Guadalajara (L01, G10, L02, G04, G11, G07); texto idéntico al FAQPage del <head>.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "30 minutos para ver tu operación como es, estés en Guadalajara o fuera de Jalisco." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

### 13.6 Recursos

#### `/preguntas-frecuentes/` · Preguntas frecuentes

| Campo | Valor |
|---|---|
| Plantilla · estado | T-FAQ · nueva |
| Propósito | Fuente única de respuestas citables (AEO) agrupadas por tema; mismas respuestas que en cada página. |
| Keyword principal | preguntas frecuentes agentes de IA |
| Title (57) | Preguntas frecuentes sobre IA, Kommo y precios \| Ingeniak |
| Meta description (128) | Respuestas directas sobre agentes de IA para WhatsApp, Kommo, GoHighLevel, n8n, tiempos de implementación y precios de Ingeniak. |
| H1 | Preguntas frecuentes |
| Breadcrumb | Inicio › Preguntas frecuentes |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, revisé las preguntas frecuentes de Ingeniak y tengo una duda." |
| JSON-LD | FAQPage, BreadcrumbList |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/kommo/`, `/gohighlevel/`, `/servicios/automatizacion-n8n/`, `/metodologia/`, `/kain/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Respuestas directas, sin humo.' + buscador de preguntas (filtra el HTML ya renderizado) + WhatsApp.
   - Imagen: KAIN de cuerpo completo pensativo, sujeto a la izquierda, texto a la derecha. KAIN a la izquierda con una mano en la barbilla, pensativo, rodeado de pequeñas esferas de luz cian desenfocadas; derecha en navy limpio. Celular: 9:16: KAIN arriba, buscador abajo.
2. **Sobre Ingeniak**: G01, G10, L01, G15, N07.
3. **Agentes de IA y Kain**: G02, G03, W01, W02, G13, N12, N01.
4. **CRM: Kommo y GoHighLevel**: G04, K01, K02, G05, H01, H02, H04.
5. **Automatización, web, SEO y paid media**: N05, G06, N09, N04, G14, N02.
6. **Precio y tiempos**: G07, G08.
7. **Cómo empezar**: G11, G12, D01, D02, D06.
8. **Cierre** **[CINE]**: Cierre cinematográfico: "¿No encontraste tu pregunta? Hazla en la Discovery Session." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/blog/` · Blog

| Campo | Valor |
|---|---|
| Plantilla · estado | T-HUB · conserva URL |
| Propósito | Hub de guías que alimentan las páginas comerciales con tráfico informativo y enlaces internos. |
| Keyword principal | blog inteligencia artificial para empresas |
| Title (51) | Blog de IA aplicada a ventas y operación \| Ingeniak |
| Meta description (120) | Guías prácticas sobre agentes de IA, WhatsApp, Kommo, GoHighLevel, n8n y automatización para empresas en México y LATAM. |
| H1 | Blog: IA aplicada a ventas y operación |
| Breadcrumb | Inicio › Blog |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, estoy leyendo el blog de Ingeniak y quiero aplicar esto en mi empresa." |
| JSON-LD | Blog, ItemList (BlogPosting), BreadcrumbList |
| Enlaces internos | `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/`, `/blog/kommo-vs-gohighlevel/`, `/blog/agente-ia-whatsapp-vs-chatbot/`, `/blog/como-verificar-partner-oficial-kommo/`, `/blog/gohighlevel-en-espanol/`, `/blog/n8n-vs-zapier-vs-make/`, `/preguntas-frecuentes/` |
| Redirecciones entrantes | `/blog` |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 'Guías sin humo para decidir mejor.' + artículo destacado (título, autor, fecha) sobre la imagen + WhatsApp.
   - Imagen: lectora (35 años) con tableta, sujeto a la derecha, texto a la izquierda. Mujer leyendo en una tableta en un sillón junto a un ventanal nocturno, la pantalla ilumina su rostro en cian; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, destacado abajo.
2. **Categorías**: Chips: Agentes de IA · CRM · Automatización · Precios y decisiones.
3. **Artículos**: 6 tarjetas (imagen 16:9, categoría, título, autor, fecha 'Actualizado: …', tiempo de lectura).
4. **Recibe las guías nuevas**: [POR DECIDIR] formulario de correo conectado a Kommo; si no se aprueba, omitir.
5. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Prefieres que lo veamos con tu caso? 30 minutos, gratis." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` · Cuánto cuesta un agente de IA

| Campo | Valor |
|---|---|
| Plantilla · estado | T-ARTICLE · nueva |
| Propósito | Capturar la intención de precio (la más comercial del cluster) sin publicar tabla de paquetes. |
| Keyword principal | cuánto cuesta un agente de IA para WhatsApp |
| Title (55) | ¿Cuánto cuesta un agente de IA para WhatsApp en México? |
| Meta description (141) | Qué mueve el precio de un agente de IA para WhatsApp, qué costos no se ven y cómo calcular si te conviene. En Ingeniak, desde USD 997 al mes. |
| H1 | ¿Cuánto cuesta un agente de IA para WhatsApp en México? |
| Breadcrumb | Inicio › Blog › Cuánto cuesta un agente de IA |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí cuánto cuesta un agente de IA para WhatsApp y quiero saber cuánto costaría en mi caso." |
| JSON-LD | BlogPosting (author Person, datePublished, dateModified), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/kain/`, `/blog/agente-ia-whatsapp-vs-chatbot/`, `/casos/clinica-dental-monterrey/`, `/discovery/` |
| Redirecciones entrantes | `/blog/cuanto-cuesta-implementar-ia-empresa-mexico-2026` |
| Autor · extensión | Rik Landeros (sugerido) · ~2200 palabras |
| Nota | Prohibido publicar tabla de paquetes, setup o precios de competidores sin fuente. |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + categoría + H1 + autor con foto real (Rik Landeros (sugerido)), fecha de publicación y 'Actualizado: …' + tiempo de lectura (~2,200 palabras).
   - Imagen: dueña de negocio (40 años) con calculadora y celular, sujeto a la izquierda, texto a la derecha. Mujer en su escritorio de noche, celular y libreta, expresión analítica, lámpara cálida tenue y luz cian del celular; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, título abajo.
2. **Respuesta corta**: Bloque de 40–60 palabras que responde la pregunta del título en la primera oración (citable por motores de respuesta). Respuesta: depende de canales, volumen, integraciones y procesos; en Ingeniak los proyectos empiezan desde USD 997 al mes y el alcance se define tras la Discovery.
3. **Índice**: Tabla de contenidos fija en escritorio, plegable en celular.
4. **Cuerpo (H2)**: 1) La respuesta corta · 2) Qué determina el precio: canales, volumen de conversaciones, integraciones con CRM y agenda, número de procesos, modelo de IA · 3) Costos de terceros que debes considerar: licencias de CRM y cobros de la plataforma de WhatsApp Business (con enlace a la página oficial de precios de Meta, sin copiar cifras) · 4) Agente SaaS genérico vs agente a la medida conectado a tu CRM (tabla cualitativa) · 5) El costo que no se ve: leads perdidos por responder tarde (8 min vs 12 s) · 6) Cómo calcular si te conviene con tus números (fórmula: leads al mes × tasa de cierre × ticket) · 7) ¿Y si quiero más que un agente? Qué cambia al implementar IA en toda la operación · 8) Cuánto cuesta con Ingeniak: desde USD 997 al mes
5. **CTA intermedio**: Tarjeta a /servicios/agentes-ia-whatsapp/ + WhatsApp.
6. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre Cuánto cuesta un agente de IA (W03, G07, G02, G08); texto idéntico al FAQPage del <head>.
7. **Sobre el autor**: Tarjeta de Rik Landeros (sugerido) (foto real, cargo, enlace a /nosotros/).
8. **Fuentes**: Página oficial de precios de WhatsApp Business Platform (Meta) y de cada CRM citado, con fecha de consulta; cifras de Ingeniak con nota 'datos internos'.
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/agentes-ia-whatsapp/ · /blog/agente-ia-whatsapp-vs-chatbot/ · /kain/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Cuánto costaría en tu caso? Lo calculamos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/blog/kommo-vs-gohighlevel/` · Kommo vs GoHighLevel

| Campo | Valor |
|---|---|
| Plantilla · estado | T-ARTICLE · nueva |
| Propósito | Comparativa comercial que alimenta /kommo/ y /gohighlevel/; absorbe las comparativas viejas. |
| Keyword principal | Kommo vs GoHighLevel |
| Title (50) | Kommo vs GoHighLevel: ¿cuál conviene a tu empresa? |
| Meta description (143) | Kommo brilla si vendes por chat; GoHighLevel si vendes con embudos, páginas y calendarios. Comparativa por criterio y 5 preguntas para decidir. |
| H1 | Kommo vs GoHighLevel: cuál conviene a tu empresa |
| Breadcrumb | Inicio › Blog › Kommo vs GoHighLevel |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí la comparativa Kommo vs GoHighLevel y quiero ayuda para elegir." |
| JSON-LD | BlogPosting (author Person, datePublished, dateModified), BreadcrumbList, FAQPage |
| Enlaces internos | `/kommo/`, `/gohighlevel/`, `/servicios/crm-con-ia/`, `/casos/retail-multimarca-kommo/`, `/discovery/` |
| Redirecciones entrantes | `/blog/kommo-vs-gohighlevel-vs-hubspot-comparativo-2026`, `/blog/kommo-vs-hubspot-cual-elegir` |
| Autor · extensión | Rik Landeros (sugerido) · ~2400 palabras |
| Nota | GoHighLevel siempre como herramienta que implementamos; nunca 'partner'. |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + categoría + H1 + autor con foto real (Rik Landeros (sugerido)), fecha de publicación y 'Actualizado: …' + tiempo de lectura (~2,400 palabras).
   - Imagen: dos socios (35 y 45 años) comparando en pantallas, sujeto a la derecha, texto a la izquierda. Dos personas de pie frente a dos pantallas grandes con interfaces desenfocadas, una más azul y otra más cian, discutiendo; oficina oscura; izquierda en navy limpio. Celular: 4:5: personas arriba, título abajo.
2. **Respuesta corta**: Bloque de 40–60 palabras que responde la pregunta del título en la primera oración (citable por motores de respuesta). Respuesta: Kommo si tu venta pasa por WhatsApp, Instagram o TikTok; GoHighLevel si necesitas embudos, páginas, calendarios y campañas en una sola plataforma.
3. **Índice**: Tabla de contenidos fija en escritorio, plegable en celular.
4. **Cuerpo (H2)**: 1) La respuesta corta · 2) Qué es Kommo y qué es GoHighLevel · 3) Comparativa por criterio: canal de venta, embudos y páginas, calendarios, automatización, IA, idioma y acompañamiento, precio (enlace a precios oficiales vigentes) · 4) Qué conviene según tu industria · 5) ¿Y HubSpot? Cuándo entra en la conversación · 6) 5 preguntas para decidir · 7) Cómo te ayudamos: partner oficial de Kommo e implementación de GoHighLevel en español
5. **CTA intermedio**: Tarjeta a /servicios/crm-con-ia/ + WhatsApp.
6. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre Kommo vs GoHighLevel (G05, G04, H04, K01); texto idéntico al FAQPage del <head>.
7. **Sobre el autor**: Tarjeta de Rik Landeros (sugerido) (foto real, cargo, enlace a /nosotros/).
8. **Fuentes**: Sitios oficiales de Kommo y HighLevel (funciones y precios con fecha de consulta).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /kommo/ · /gohighlevel/ · /servicios/crm-con-ia/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Kommo o GoHighLevel en tu caso? Lo decidimos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

#### `/blog/agente-ia-whatsapp-vs-chatbot/` · Agente de IA vs chatbot

| Campo | Valor |
|---|---|
| Plantilla · estado | T-ARTICLE · nueva |
| Propósito | Ganar la intención informativa '¿qué es un agente de IA para WhatsApp?' y la diferencia con chatbots y con el agente de Meta. |
| Keyword principal | agente de IA para WhatsApp vs chatbot |
| Title (50) | Agente de IA para WhatsApp vs chatbot: diferencias |
| Meta description (145) | Un chatbot sigue un menú; un agente de IA entiende, consulta tu CRM y agenda. Diferencias, cuándo basta un chatbot y qué no debe hacer un agente. |
| H1 | Agente de IA para WhatsApp vs chatbot: qué cambia y cuándo conviene cada uno |
| Breadcrumb | Inicio › Blog › Agente de IA vs chatbot |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí la diferencia entre un agente de IA y un chatbot y quiero ver cómo funcionas." |
| JSON-LD | BlogPosting (author Person, datePublished, dateModified), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/agentes-ia-whatsapp/`, `/kain/`, `/casos/clinica-dental-monterrey/`, `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/`, `/discovery/` |
| Redirecciones entrantes | `/blog/agente-ia-vs-chatbot-tradicional-diferencias`, `/blog/agentes-ia-whatsapp-business-guia-2026` |
| Autor · extensión | Alonso Vega (sugerido) · ~2000 palabras |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + categoría + H1 + autor con foto real (Alonso Vega (sugerido)), fecha de publicación y 'Actualizado: …' + tiempo de lectura (~2,000 palabras).
   - Imagen: KAIN de cuerpo completo frente a un robot de menús antiguo, sujeto a la derecha, texto a la izquierda. KAIN a la derecha frente a una vieja terminal de botones apagada y polvosa a la izquierda, en penumbra; KAIN iluminado en cian; espacio navy arriba a la izquierda para el título. Celular: 9:16: KAIN arriba, título abajo.
2. **Respuesta corta**: Bloque de 40–60 palabras que responde la pregunta del título en la primera oración (citable por motores de respuesta). Respuesta: definición de G02 + diferencia de G03 en una sola oración cada una.
3. **Índice**: Tabla de contenidos fija en escritorio, plegable en celular.
4. **Cuerpo (H2)**: 1) Qué es un agente de IA para WhatsApp · 2) Tabla: agente de IA vs chatbot de menús · 3) Qué puede hacer un agente: responder, calificar, agendar, registrar en el CRM, dar seguimiento · 4) Qué no debe hacer: consejo médico o legal, inventar precios o existencias · 5) El agente de Meta vs un agente a la medida conectado a tu CRM · 6) Cuándo basta un chatbot · 7) Caso: de 8 minutos a 12 segundos
5. **CTA intermedio**: Tarjeta a /kain/ + WhatsApp.
6. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre Agente de IA vs chatbot (G02, G03, N01, W01); texto idéntico al FAQPage del <head>.
7. **Sobre el autor**: Tarjeta de Alonso Vega (sugerido) (foto real, cargo, enlace a /nosotros/).
8. **Fuentes**: Centro de ayuda de WhatsApp sobre el agente de Meta (fecha de consulta) y caso propio con nota 'datos internos'.
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/agentes-ia-whatsapp/ · /kain/ · /blog/cuanto-cuesta-agente-ia-whatsapp-mexico/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Qué respondería un agente en tu WhatsApp? Te lo mostramos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

#### `/blog/como-verificar-partner-oficial-kommo/` · Cómo verificar un partner de Kommo

| Campo | Valor |
|---|---|
| Plantilla · estado | T-ARTICLE · nueva |
| Propósito | Contenido de decisión que respalda la keyword 'partner Kommo México' y diferencia a Ingeniak. |
| Keyword principal | partner oficial Kommo |
| Title (58) | Cómo verificar que una agencia es partner oficial de Kommo |
| Meta description (143) | 4 pasos para confirmar que tu proveedor es partner oficial de Kommo antes de comprar licencias o pagar una implementación, y señales de alerta. |
| H1 | Cómo verificar que una agencia es partner oficial de Kommo |
| Breadcrumb | Inicio › Blog › Cómo verificar un partner de Kommo |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbenos por WhatsApp → WhatsApp: "Hola, leí cómo verificar un partner oficial de Kommo y quiero cotizar licencias con Ingeniak." |
| JSON-LD | BlogPosting (author Person, datePublished, dateModified), BreadcrumbList, FAQPage |
| Enlaces internos | `/kommo/`, `/servicios/crm-con-ia/`, `/blog/kommo-vs-gohighlevel/`, `/discovery/` |
| Autor · extensión | Marcos González (sugerido) · ~1500 palabras |
| Nota | Antes de publicar, enlazar la ficha real de Ingeniak en el directorio de Kommo. |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + categoría + H1 + autor con foto real (Marcos González (sugerido)), fecha de publicación y 'Actualizado: …' + tiempo de lectura (~1,500 palabras).
   - Imagen: gerente (40 años) revisando una lupa sobre un sello de cristal, sujeto a la izquierda, texto a la derecha. Hombre en su oficina nocturna examinando con atención una insignia de cristal sin texto que brilla en cian sobre su escritorio; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, título abajo.
2. **Respuesta corta**: Bloque de 40–60 palabras que responde la pregunta del título en la primera oración (citable por motores de respuesta). Respuesta: búscala en el directorio oficial de partners de Kommo y confirma que su sello enlaza a kommo.com [VALIDAR el proceso vigente en la documentación de Kommo].
3. **Índice**: Tabla de contenidos fija en escritorio, plegable en celular.
4. **Cuerpo (H2)**: 1) Por qué importa comprar con un partner oficial · 2) Paso 1: búscala en el directorio de partners de Kommo · 3) Paso 2: revisa el sello de partner y a dónde enlaza · 4) Paso 3: pregunta qué incluye (licencias, implementación, soporte, agentes de IA) · 5) Paso 4: pide casos con cifras · 6) Señales de alerta · 7) Ingeniak en el directorio de Kommo
5. **CTA intermedio**: Tarjeta a /kommo/ + WhatsApp.
6. **Preguntas frecuentes**: Acordeón de 3 preguntas sobre Cómo verificar un partner de Kommo (G04, K01, K04); texto idéntico al FAQPage del <head>.
7. **Sobre el autor**: Tarjeta de Marcos González (sugerido) (foto real, cargo, enlace a /nosotros/).
8. **Fuentes**: Documentación oficial 'Become a Kommo partner' y directorio https://www.kommo.com/partners/ (fecha de consulta).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /kommo/ · /blog/kommo-vs-gohighlevel/ · /servicios/crm-con-ia/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "Verifícanos y luego platiquemos: 30 minutos, gratis." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida D: foto real del equipo (team-hero) extendida con outpainting; texto a la izquierda.

#### `/blog/gohighlevel-en-espanol/` · GoHighLevel en español

| Campo | Valor |
|---|---|
| Plantilla · estado | T-ARTICLE · nueva |
| Propósito | Ocupar el hueco de SERP 'GoHighLevel en español' (casi sin agencias mexicanas) y alimentar /gohighlevel/. |
| Keyword principal | GoHighLevel en español |
| Title (51) | GoHighLevel en español: qué es y cómo se implementa |
| Meta description (141) | Qué es GoHighLevel (HighLevel), qué junta en una sola plataforma, para quién sí y para quién no, y cómo se implementa en español paso a paso. |
| H1 | GoHighLevel en español: qué es, para quién es y cómo se implementa |
| Breadcrumb | Inicio › Blog › GoHighLevel en español |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí la guía de GoHighLevel en español y quiero implementarlo en mi empresa." |
| JSON-LD | BlogPosting (author Person, datePublished, dateModified), BreadcrumbList, FAQPage |
| Enlaces internos | `/gohighlevel/`, `/servicios/crm-con-ia/`, `/blog/kommo-vs-gohighlevel/`, `/discovery/` |
| Autor · extensión | Marcos González (sugerido) · ~2000 palabras |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + categoría + H1 + autor con foto real (Marcos González (sugerido)), fecha de publicación y 'Actualizado: …' + tiempo de lectura (~2,000 palabras).
   - Imagen: coach de negocios (38 años) en videollamada, sujeto a la derecha, texto a la izquierda. Mujer en un estudio en casa elegante de noche, laptop abierta con calendario desenfocado, aro de luz suave y borde cian; izquierda en penumbra navy limpia. Celular: 4:5: persona arriba, título abajo.
2. **Respuesta corta**: Bloque de 40–60 palabras que responde la pregunta del título en la primera oración (citable por motores de respuesta). Respuesta: definición de H01 + qué significa implementarlo en español (N15).
3. **Índice**: Tabla de contenidos fija en escritorio, plegable en celular.
4. **Cuerpo (H2)**: 1) Qué es GoHighLevel (HighLevel o GHL) · 2) Qué junta en una sola plataforma: CRM, embudos, páginas, calendarios, campañas y automatizaciones · 3) ¿Se puede usar en español? (verificar idioma de interfaz vigente en la documentación oficial) · 4) Para quién sí y para quién no · 5) Cómo se implementa en 6 pasos: cuenta, pipelines, embudos y páginas, calendarios, WhatsApp y campañas, agente de IA y capacitación · 6) Errores comunes al implementarlo · 7) Precio: dónde consultarlo (enlace oficial)
5. **CTA intermedio**: Tarjeta a /gohighlevel/ + WhatsApp.
6. **Preguntas frecuentes**: Acordeón de 4 preguntas sobre GoHighLevel en español (H01, N15, H02, H04); texto idéntico al FAQPage del <head>.
7. **Sobre el autor**: Tarjeta de Marcos González (sugerido) (foto real, cargo, enlace a /nosotros/).
8. **Fuentes**: Sitio y centro de ayuda oficiales de HighLevel (fecha de consulta).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /gohighlevel/ · /blog/kommo-vs-gohighlevel/ · /servicios/crm-con-ia/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Quieres GoHighLevel en español, listo para tu equipo? Lo vemos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida C: dueña de negocio (40 años) tranquila al atardecer en su oficina, a la derecha; texto a la izquierda.

#### `/blog/n8n-vs-zapier-vs-make/` · n8n vs Zapier vs Make

| Campo | Valor |
|---|---|
| Plantilla · estado | T-ARTICLE · nueva |
| Propósito | Comparativa comercial que alimenta /servicios/automatizacion-n8n/ con el caso de 27 procesos. |
| Keyword principal | n8n vs Zapier vs Make |
| Title (50) | n8n vs Zapier vs Make: cuál elegir para tu empresa |
| Meta description (139) | Diferencias entre n8n, Zapier y Make en modelo de cobro, autoalojamiento, agentes de IA y curva de aprendizaje, y cuándo conviene cada uno. |
| H1 | n8n vs Zapier vs Make: cuál elegir para automatizar tu empresa |
| Breadcrumb | Inicio › Blog › n8n vs Zapier vs Make |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, leí la comparativa n8n vs Zapier vs Make y quiero automatizar mi empresa." |
| JSON-LD | BlogPosting (author Person, datePublished, dateModified), BreadcrumbList, FAQPage |
| Enlaces internos | `/servicios/automatizacion-n8n/`, `/casos/logistica-n8n/`, `/tecnologias/`, `/discovery/` |
| Autor · extensión | Alonso Vega (sugerido) · ~2200 palabras |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + categoría + H1 + autor con foto real (Alonso Vega (sugerido)), fecha de publicación y 'Actualizado: …' + tiempo de lectura (~2,200 palabras).
   - Imagen: ingeniero de automatización (30 años), sujeto a la izquierda, texto a la derecha. Hombre frente a tres monitores con flujos de nodos desenfocados en cian, sala oscura, audífonos al cuello; derecha en penumbra navy limpia. Celular: 4:5: persona arriba, título abajo.
2. **Respuesta corta**: Bloque de 40–60 palabras que responde la pregunta del título en la primera oración (citable por motores de respuesta). Respuesta: criterio en una oración por herramienta + cuándo elegimos n8n.
3. **Índice**: Tabla de contenidos fija en escritorio, plegable en celular.
4. **Cuerpo (H2)**: 1) La respuesta corta · 2) Qué es cada una · 3) Comparativa: modelo de cobro (según documentación oficial vigente), autoalojamiento, conectores, agentes de IA, curva de aprendizaje · 4) Cuándo elegimos n8n y cuándo Make o Zapier · 5) Caso: 27 procesos automatizados en logística · 6) Qué automatizar primero: 5 ideas
5. **CTA intermedio**: Tarjeta a /servicios/automatizacion-n8n/ + WhatsApp.
6. **Preguntas frecuentes**: Acordeón de 3 preguntas sobre n8n vs Zapier vs Make (N05, G06, G09); texto idéntico al FAQPage del <head>.
7. **Sobre el autor**: Tarjeta de Alonso Vega (sugerido) (foto real, cargo, enlace a /nosotros/).
8. **Fuentes**: Documentación y páginas de precios oficiales de n8n, Zapier y Make (fecha de consulta).
9. **Sigue explorando**: 3 tarjetas a páginas relacionadas: /servicios/automatizacion-n8n/ · /casos/logistica-n8n/ · /tecnologias/.
10. **Cierre** **[CINE]**: Cierre cinematográfico: "¿Qué automatizarías primero? Lo priorizamos en 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida B: KAIN de cuerpo completo a la izquierda señalando hacia el botón, texto a la derecha.

### 13.7 Conversión

#### `/discovery/` · Discovery Session

| Campo | Valor |
|---|---|
| Plantilla · estado | T-CONVERSION · conserva URL de v1 (301 desde /cotiza) |
| Propósito | Convertir: explicar la llamada 1:1 gratuita y mandar a agendar en agenda.ingeniak.tech. |
| Keyword principal | Discovery Session Ingeniak |
| Title (51) | Discovery Session gratuita de 30 minutos \| Ingeniak |
| Meta description (146) | Llamada 1:1 gratuita de 30 minutos para dueños de PyMES: mapeamos tu operación, detectamos áreas de oportunidad y sales con sugerencias concretas. |
| H1 | 30 minutos para ver tu operación como es, no como crees que es |
| Breadcrumb | Inicio › Discovery Session |
| CTA principal | Agendar mi Discovery Session → https://agenda.ingeniak.tech/discovery/agendar |
| CTA secundario | Escríbenos por WhatsApp → WhatsApp: "Hola, vengo de la página de la Discovery Session y tengo una duda antes de agendar." |
| JSON-LD | WebPage, Service (Offer price 0), BreadcrumbList, FAQPage |
| Enlaces internos | https://agenda.ingeniak.tech/discovery/agendar, `/casos/`, `/metodologia/`, `/aviso-privacidad/` |
| Redirecciones entrantes | `/cotiza` |
| Nota | Página de conversión: navegación reducida (logo + botón), sin mega menú, sin enlaces de salida en el cuerpo salvo agenda y WhatsApp. |

Secciones:

1. **Portada** **[CINE]**: Etiqueta 'Llamada 1:1 · 30 minutos · sin costo' + H1 + texto de v1 ('…Cotizar sin diagnóstico es adivinar con dinero ajeno.') + 3 chips + botón 'Agendar mi Discovery Session'.
   - Imagen: dueño de pyme (45 años) de pie junto a su silla vacía, sujeto a la derecha, texto a la izquierda. Hombre tranquilo de pie junto a la ventana de su oficina al atardecer, su silla de escritorio vacía en primer plano desenfocada (concepto 'la silla vacía'), luz cálida y borde cian; izquierda en penumbra navy limpia. Celular: 4:5: persona y silla arriba, texto abajo.
2. **Mira esto antes de agendar**: VSL 'la silla vacía' (discovery-vsl-720.mp4, póster) + botón + 'Si reconociste tu negocio en este video, esta llamada es tu siguiente paso.'
3. **Cómo funciona**: 3 pasos de v1: formulario corto (7 preguntas, 2 min), eliges horario (hora de CDMX, L–V), Google Meet.
4. **Qué es una Discovery Session**: 'Lo que sí es' (cian) / 'Lo que no es' (ámbar) de v1.
5. **Para quién es esta llamada** **[CINE]**: 'Es para ti si…' / 'No es para ti si…' de v1 sobre la imagen.
   - Imagen: dueña de pyme (38 años) en videollamada, sujeto a la izquierda, texto a la derecha. Mujer en su oficina pequeña y ordenada, laptop abierta en videollamada (pantalla sin interfaz reconocible), postura abierta y segura, luz de ventana suave con borde cian; derecha en navy limpio. Celular: 4:5: persona arriba, listas abajo.
6. **Después de la llamada**: Texto de v1 'Si hay sentido, te cotizamos la implementación…' + botón.
7. **Preguntas frecuentes**: Acordeón de 6 preguntas sobre la Discovery Session (D01, D02, D03, D04, D05, D06); texto idéntico al FAQPage del <head>.
8. **Cierre** **[CINE]**: Cierre cinematográfico: '30 minutos hoy valen más que una cotización a ciegas mañana.' + cita 'No cotizamos lo que no hemos visto…' + botón 'Agendar mi Discovery Session' (agenda.ingeniak.tech) + 'Construimos empresarios libres, no héroes cansados.' Imagen propia: KAIN de cuerpo completo sentado en la silla vacía del dueño, a la derecha.
   - Imagen: KAIN de cuerpo completo en la silla del dueño, sujeto a la derecha, texto a la izquierda. KAIN sentado en una silla de oficina ejecutiva a la derecha, escritorio ordenado, ventana con atardecer desenfocado; izquierda en penumbra navy limpia. Celular: 9:16: KAIN y silla arriba, texto abajo.

#### `/contacto/` · Contacto

| Campo | Valor |
|---|---|
| Plantilla · estado | T-CONTACT · conserva URL (deja de redirigir a /discovery/) |
| Propósito | Dar todas las rutas de contacto con la Discovery como la recomendada; datos NAP idénticos a la ficha. |
| Keyword principal | contacto Ingeniak |
| Title (47) | Contacto: WhatsApp, correo y oficina \| Ingeniak |
| Meta description (154) | Agenda tu Discovery Session, escríbele a Kain por WhatsApp al +52 33 2101 7799 o al correo contacto@ingeniak.mx. Oficina en Tlajomulco de Zúñiga, Jalisco. |
| H1 | Habla con Ingeniak |
| Breadcrumb | Inicio › Contacto |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, vengo de la página de contacto de Ingeniak y quiero hablar con el equipo." |
| JSON-LD | ContactPage, Organization (contactPoint), BreadcrumbList |
| Enlaces internos | `/discovery/`, `/agentes-ia-guadalajara/`, `/nosotros/`, `/aviso-privacidad/` |
| Redirecciones entrantes | `/contacto` |
| Nota | Teléfono: el sitio usa +52 33 2101 7799 y el Sales Brief +52 33 2101 2962; publicar solo el confirmado. |

Secciones:

1. **Portada** **[CINE]**: Breadcrumb + H1 + 3 rutas como tarjetas de cristal pequeñas sobre la imagen: Discovery (recomendada), WhatsApp con Kain, correo.
   - Imagen: asesora comercial (30 años) con audífonos, sujeto a la izquierda, texto a la derecha. Mujer sonriente con diadema de audífonos en una oficina moderna de noche, mirando a cámara, luz cálida suave y borde cian; derecha en navy limpio. Celular: 4:5: persona arriba, rutas abajo.
2. **Elige cómo hablar con nosotros**: Tabla de 3 rutas con tiempo esperado de respuesta [VALIDAR tiempos]: Discovery Session, WhatsApp +52 33 2101 7799 (atiende Kain), contacto@ingeniak.mx.
3. **Formulario corto (opcional)**: [POR DECIDIR] webform de Kommo con nombre, empresa, WhatsApp y mensaje, con casilla de aviso de privacidad; si no se aprueba, omitir.
4. **Oficina**: Av. Punto Sur 312, Tlajomulco de Zúñiga, Jalisco 45640 (zona metropolitana de Guadalajara) + horario [VALIDAR L–V 09:00–18:00] + mapa estático con enlace a Google Maps.
5. **Redes**: Instagram, Facebook y LinkedIn (ingeniakmx).
6. **Cierre** **[CINE]**: Cierre cinematográfico: "La forma más rápida de saber si podemos ayudarte: 30 minutos." + botón Discovery + WhatsApp + microcopy "Sin costo · Sin compromiso · 30 minutos por Google Meet". Imagen de la variante compartida A: KAIN de cuerpo completo saludando en el tercio derecho, texto a la izquierda.

### 13.8 Legal

#### `/aviso-privacidad/` · Aviso de privacidad

| Campo | Valor |
|---|---|
| Plantilla · estado | T-LEGAL · conserva URL |
| Propósito | Cumplir la LFPDPPP; texto sin cambios (versión del 1 de agosto de 2026). |
| Keyword principal | aviso de privacidad Ingeniak |
| Title (30) | Aviso de privacidad \| Ingeniak |
| Meta description (124) | Aviso de privacidad de Ingeniak conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. |
| H1 | Aviso de privacidad |
| Breadcrumb | Inicio › Aviso de privacidad |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbenos por WhatsApp → WhatsApp: "Hola, tengo una pregunta sobre el aviso de privacidad de Ingeniak." |
| JSON-LD | WebPage, BreadcrumbList |
| Enlaces internos | `/contacto/`, `/` |
| Redirecciones entrantes | `/aviso-privacidad` |

Secciones:

1. **Encabezado**: Encabezado sobrio sin imagen (excepción a la regla cinematográfica: página legal sin imagen): breadcrumb + H1 + 'Última actualización: 1 de agosto de 2026'.
2. **Índice**: 11 anclas (Responsable … Consentimiento).
3. **Texto legal**: Texto íntegro sin cambios; ancho de lectura 68 caracteres.

### 13.9 Sistema

#### `/404` · 404

| Campo | Valor |
|---|---|
| Plantilla · estado | T-404 · nueva (noindex) |
| Propósito | Recuperar al visitante que llegó a una URL rota (incluidas URLs viejas sin redirección) y llevarlo a una página útil. |
| Keyword principal | — |
| Title (31) | Página no encontrada \| Ingeniak |
| Meta description (105) | Esta ruta no está conectada. Vuelve al inicio, revisa nuestros servicios o escríbele a Kain por WhatsApp. |
| H1 | Esta ruta no está conectada |
| Breadcrumb | — |
| CTA principal | Agenda tu Discovery Session → `/discovery/` |
| CTA secundario | Escríbele a Kain → WhatsApp: "Hola Kain, llegué a una página que no existe en ingeniak.mx y busco información." |
| JSON-LD | ninguno (noindex) |
| Enlaces internos | `/`, `/servicios/`, `/casos/`, `/blog/`, `/discovery/` |

Secciones:

1. **Portada** **[CINE]**: H1 + 'Kain buscó por todos lados y esta página no existe (o se mudó).' + 4 enlaces (Inicio, Servicios, Casos, Blog) + buscador simple + WhatsApp.
   - Imagen: KAIN de cuerpo completo mirando una rama de luz cortada, sujeto a la derecha, texto a la izquierda. KAIN a la derecha, cabeza ladeada, mirando una rama de luz cian que se interrumpe en el aire a la izquierda; fondo navy con ondas tenues. Celular: 9:16: KAIN arriba, enlaces abajo.

## 14. Producción de imágenes

Total: **86 imágenes 21:9** en 82 archivos (78 propios de cada página + 4 cierres compartidos; el archivo de VKTOR™ son 5 escenas), cada una con su versión vertical. También falta 1 miniatura para la tarjeta del mega menú (`/img/cine/menu-kain`).

Orden sugerido de producción (por impacto):

1. Portadas de inicio, servicios, agentes de IA para WhatsApp, Kommo, consultoría, Kain y Discovery.
2. Los 4 cierres compartidos.
3. Portadas de industrias y casos.
4. Secciones intermedias.
5. Blog y 404.

| # | Archivo | Página | Sección | Sujeto | Lado |
|---|---|---|---|---|---|
| 1 | `/img/cine/home-hero` | `/` | Portada | KAIN de cuerpo completo | derecha |
| 2 | `/img/cine/home-problema` | `/` | El problema | dueño de pyme (45 años) | izquierda |
| 3 | `/img/cine/home-kain` | `/` | Conoce a Kain | KAIN de cuerpo completo saludando | izquierda |
| 4 | `/img/cine/home-equipo` | `/` | El equipo | equipo real de Ingeniak (foto team-hero) | derecha |
| 5 | `/img/cine/cta-kain-saluda` | compartida | Cierre | KAIN saludando a la derecha, texto a la izquierda | según variante |
| 6 | `/img/cine/servicios-hero` | `/servicios/` | Portada | arquitecta de sistemas (35 años) | derecha |
| 7 | `/img/cine/servicios-no-se` | `/servicios/` | ¿No sabes por dónde empezar? | KAIN de cuerpo completo señalando | izquierda |
| 8 | `/img/cine/cta-kain-senala` | compartida | Cierre | KAIN a la izquierda señalando el botón, texto a la derecha | según variante |
| 9 | `/img/cine/consultoria-hero` | `/servicios/consultoria-ia-empresas/` | Portada | consultor senior (45 años, saco oscuro) | izquierda |
| 10 | `/img/cine/consultoria-vktor-cine` | `/servicios/consultoria-ia-empresas/` | Del diagnóstico a producción | consultora y dueño de pyme revisando números | derecha |
| 11 | `/img/cine/cta-duena-tranquila` | compartida | Cierre | Dueña de negocio tranquila al atardecer a la derecha | según variante |
| 12 | `/img/cine/agentes-whatsapp-hero` | `/servicios/agentes-ia-whatsapp/` | Portada | clienta (30 años) escribiendo de noche | izquierda |
| 13 | `/img/cine/agentes-whatsapp-si-no` | `/servicios/agentes-ia-whatsapp/` | Lo que sí hace y lo que no | KAIN de cuerpo completo | derecha |
| 14 | `/img/cine/crm-ia-hero` | `/servicios/crm-con-ia/` | Portada | gerente comercial (40 años) | derecha |
| 15 | `/img/cine/crm-ia-crm-vivo` | `/servicios/crm-con-ia/` | Un CRM vivo | KAIN de cuerpo completo | izquierda |
| 16 | `/img/cine/kommo-hero` | `/kommo/` | Portada | vendedor de tienda (30 años) con celular | izquierda |
| 17 | `/img/cine/kommo-agente-chat` | `/kommo/` | Agente de IA dentro del chat | KAIN de cuerpo completo | derecha |
| 18 | `/img/cine/gohighlevel-hero` | `/gohighlevel/` | Portada | directora de clínica / coach (38 años) en su escritorio | derecha |
| 19 | `/img/cine/gohighlevel-calendario` | `/gohighlevel/` | Citas que se agendan y se confirman solas | KAIN de cuerpo completo | izquierda |
| 20 | `/img/cine/n8n-hero` | `/servicios/automatizacion-n8n/` | Portada | jefe de operaciones (40 años) con tableta | izquierda |
| 21 | `/img/cine/n8n-caso` | `/servicios/automatizacion-n8n/` | Caso: 27 procesos automatizados | KAIN de cuerpo completo | derecha |
| 22 | `/img/cine/paid-media-hero` | `/servicios/paid-media/` | Portada | especialista de performance (32 años) | derecha |
| 23 | `/img/cine/paid-media-caso` | `/servicios/paid-media/` | Caso HoReCa: ROAS 4.8× sostenido | chef-propietaria (45 años) en su restaurante | izquierda |
| 24 | `/img/cine/paginas-web-hero` | `/servicios/paginas-web/` | Portada | director creativo (35 años) frente a una pantalla | izquierda |
| 25 | `/img/cine/paginas-web-este-sitio` | `/servicios/paginas-web/` | Este sitio es el ejemplo | KAIN de cuerpo completo | derecha |
| 26 | `/img/cine/software-hero` | `/servicios/desarrollo-software/` | Portada | ingeniera de software (30 años) | derecha |
| 27 | `/img/cine/software-dashboard` | `/servicios/desarrollo-software/` | 1 vista, 7 fuentes | directora de e-commerce (40 años) | izquierda |
| 28 | `/img/cine/seo-hero` | `/servicios/seo/` | Portada | mujer (35 años) consultando en su laptop | izquierda |
| 29 | `/img/cine/seo-como-medimos` | `/servicios/seo/` | Cómo lo medimos | KAIN de cuerpo completo | derecha |
| 30 | `/img/cine/branding-hero` | `/servicios/branding/` | Portada | directora de arte (33 años) en estudio | derecha |
| 31 | `/img/cine/branding-kain-ejemplo` | `/servicios/branding/` | Un personaje que trabaja | KAIN de cuerpo completo posando | izquierda |
| 32 | `/img/cine/cta-equipo` | compartida | Cierre | Foto real del equipo extendida con outpainting | según variante |
| 33 | `/img/cine/industrias-hero` | `/industrias/` | Portada | KAIN de cuerpo completo | derecha |
| 34 | `/img/cine/ind-salud-hero` | `/industrias/salud/` | Portada | odontóloga (40 años) con bata | derecha |
| 35 | `/img/cine/ind-salud-kain-sector` | `/industrias/salud/` | Así trabaja Kain en tu clínica | KAIN de cuerpo completo en recepción de clínica | izquierda |
| 36 | `/img/cine/ind-belleza-hero` | `/industrias/belleza-estetica/` | Portada | dueña de estética (35 años) | izquierda |
| 37 | `/img/cine/ind-belleza-kain-sector` | `/industrias/belleza-estetica/` | Así trabaja Kain en tu estética | KAIN de cuerpo completo en spa | derecha |
| 38 | `/img/cine/ind-nutricion-hero` | `/industrias/nutricion/` | Portada | nutrióloga (32 años) | derecha |
| 39 | `/img/cine/ind-nutricion-kain-sector` | `/industrias/nutricion/` | Así trabaja Kain en tu consulta de nutrición | KAIN de cuerpo completo | izquierda |
| 40 | `/img/cine/ind-finanzas-hero` | `/industrias/finanzas/` | Portada | asesor financiero (45 años) | izquierda |
| 41 | `/img/cine/ind-finanzas-kain-sector` | `/industrias/finanzas/` | Así trabaja Kain en tu despacho o financiera | KAIN de cuerpo completo | derecha |
| 42 | `/img/cine/ind-inmobiliario-hero` | `/industrias/inmobiliario/` | Portada | asesora inmobiliaria (38 años) | derecha |
| 43 | `/img/cine/ind-inmobiliario-kain-sector` | `/industrias/inmobiliario/` | Así trabaja Kain en tu inmobiliaria | KAIN de cuerpo completo | izquierda |
| 44 | `/img/cine/ind-industrial-hero` | `/industrias/industrial-logistica/` | Portada | gerente de planta (50 años) con casco en mano | izquierda |
| 45 | `/img/cine/ind-industrial-kain-sector` | `/industrias/industrial-logistica/` | Así trabaja Kain en tu operación | KAIN de cuerpo completo | derecha |
| 46 | `/img/cine/ind-retail-hero` | `/industrias/retail-ecommerce/` | Portada | dueño de tienda de moda (35 años) | derecha |
| 47 | `/img/cine/ind-retail-kain-sector` | `/industrias/retail-ecommerce/` | Así trabaja Kain en tu tienda | KAIN de cuerpo completo | izquierda |
| 48 | `/img/cine/ind-horeca-hero` | `/industrias/horeca/` | Portada | gerente de hotel boutique (42 años) | izquierda |
| 49 | `/img/cine/ind-horeca-kain-sector` | `/industrias/horeca/` | Así trabaja Kain en tu restaurante u hotel | KAIN de cuerpo completo | derecha |
| 50 | `/img/cine/casos-hero` | `/casos/` | Portada | KAIN de cuerpo completo | derecha |
| 51 | `/img/cine/caso-dental-hero` | `/casos/clinica-dental-monterrey/` | Portada | odontólogo (45 años) | derecha |
| 52 | `/img/cine/caso-dental-resultado` | `/casos/clinica-dental-monterrey/` | Resultado | KAIN de cuerpo completo en recepción dental | izquierda |
| 53 | `/img/cine/caso-retail-hero` | `/casos/retail-multimarca-kommo/` | Portada | directora comercial de retail (40 años) | izquierda |
| 54 | `/img/cine/caso-retail-resultado` | `/casos/retail-multimarca-kommo/` | Resultado | KAIN de cuerpo completo | derecha |
| 55 | `/img/cine/caso-ecommerce-hero` | `/casos/ecommerce-cdmx-costo-por-lead/` | Portada | fundador de e-commerce (33 años) | derecha |
| 56 | `/img/cine/caso-ecommerce-resultado` | `/casos/ecommerce-cdmx-costo-por-lead/` | Resultado | KAIN de cuerpo completo | izquierda |
| 57 | `/img/cine/caso-horeca-hero` | `/casos/horeca-roas/` | Portada | propietario de restaurante (50 años) | izquierda |
| 58 | `/img/cine/caso-horeca-resultado` | `/casos/horeca-roas/` | Resultado | KAIN de cuerpo completo | derecha |
| 59 | `/img/cine/caso-logistica-hero` | `/casos/logistica-n8n/` | Portada | coordinadora de logística (36 años) | derecha |
| 60 | `/img/cine/caso-logistica-resultado` | `/casos/logistica-n8n/` | Resultado | KAIN de cuerpo completo | izquierda |
| 61 | `/img/cine/kain-hero` | `/kain/` | Portada | KAIN de cuerpo completo saludando | derecha |
| 62 | `/img/cine/kain-si-no` | `/kain/` | Lo que sí y lo que no | KAIN de cuerpo completo con brazos cruzados | izquierda |
| 63 | `/img/cine/metodologia-hero` | `/metodologia/` | Portada | KAIN de cuerpo completo | izquierda |
| 64 | `/img/cine/metodologia-fases` | `/metodologia/` | Las 5 fases (secuencia fijada al scroll) | 5 escenas con personas (una por fase) | alterna |
| 65 | `/img/cine/tecnologias-hero` | `/tecnologias/` | Portada | KAIN de cuerpo completo | derecha |
| 66 | `/img/cine/nosotros-hero` | `/nosotros/` | Portada | equipo real de Ingeniak (foto team-hero) | derecha |
| 67 | `/img/cine/nosotros-manifiesto` | `/nosotros/` | Manifiesto | KAIN de cuerpo completo | izquierda |
| 68 | `/img/cine/guadalajara-hero` | `/agentes-ia-guadalajara/` | Portada | empresario tapatío (45 años) | derecha |
| 69 | `/img/cine/guadalajara-local-alcance` | `/agentes-ia-guadalajara/` | Local y con alcance | KAIN de cuerpo completo | izquierda |
| 70 | `/img/cine/faq-hero` | `/preguntas-frecuentes/` | Portada | KAIN de cuerpo completo pensativo | izquierda |
| 71 | `/img/cine/blog-hero` | `/blog/` | Portada | lectora (35 años) con tableta | derecha |
| 72 | `/img/cine/art-costo-hero` | `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/` | Portada | dueña de negocio (40 años) con calculadora y celular | izquierda |
| 73 | `/img/cine/art-kommo-ghl-hero` | `/blog/kommo-vs-gohighlevel/` | Portada | dos socios (35 y 45 años) comparando en pantallas | derecha |
| 74 | `/img/cine/art-agente-chatbot-hero` | `/blog/agente-ia-whatsapp-vs-chatbot/` | Portada | KAIN de cuerpo completo frente a un robot de menús antiguo | derecha |
| 75 | `/img/cine/art-partner-kommo-hero` | `/blog/como-verificar-partner-oficial-kommo/` | Portada | gerente (40 años) revisando una lupa sobre un sello de cristal | izquierda |
| 76 | `/img/cine/art-ghl-espanol-hero` | `/blog/gohighlevel-en-espanol/` | Portada | coach de negocios (38 años) en videollamada | derecha |
| 77 | `/img/cine/art-n8n-hero` | `/blog/n8n-vs-zapier-vs-make/` | Portada | ingeniero de automatización (30 años) | izquierda |
| 78 | `/img/cine/discovery-hero` | `/discovery/` | Portada | dueño de pyme (45 años) de pie junto a su silla vacía | derecha |
| 79 | `/img/cine/discovery-para-quien` | `/discovery/` | Para quién es esta llamada | dueña de pyme (38 años) en videollamada | izquierda |
| 80 | `/img/cine/discovery-cta-final` | `/discovery/` | Cierre | KAIN de cuerpo completo en la silla del dueño | derecha |
| 81 | `/img/cine/contacto-hero` | `/contacto/` | Portada | asesora comercial (30 años) con audífonos | izquierda |
| 82 | `/img/cine/404-hero` | `/404` | Portada | KAIN de cuerpo completo mirando una rama de luz cortada | derecha |

## 15. Pendientes y validaciones con el cliente

- [ ] **Teléfono único:** el sitio usa +52 33 2101 7799 y el Sales Brief +52 33 2101 2962. Hay que confirmar uno solo para el schema, el footer y Google Business Profile.
- [ ] **Caso e-commerce CDMX:** qué se implementó y si es el mismo cliente del tablero "1 vista · 7 fuentes". Sin eso, la página del caso solo puede publicar la ficha y la cifra.
- [ ] **Detalles de los 5 casos:** punto de partida, plazo, herramientas y si el cliente autoriza nombre o logo. Las secciones sin dato se omiten.
- [ ] **Historia de Ingeniak:** el sitio actual dice "fundada en 2022" y "opera bajo la marca Radik Soluciones". No se publica hasta confirmarlo.
- [ ] **Subsectores de Finanzas** (créditos, seguros, despachos) y si hay clientes en belleza, nutrición, finanzas e inmobiliario para sumar cifras propias.
- [ ] **Horario de oficina** (v1 usaba L–V 09:00–18:00), coordenadas para `geo` y ficha de Google Business Profile.
- [ ] **LinkedIn de cada integrante** para el `sameAs` de Person, y fotos sin el nombre impreso.
- [ ] **Ficha de Ingeniak en el directorio de partners de Kommo** (URL) y sello vigente del Partner Portal.
- [ ] **Power Session (USD 297):** aparece en la guía de marca pero no en este brief. Queda fuera. Si se activa, se agrega `/power-session/` con plantilla T-CONVERSION.
- [ ] **Precios de planes de kain:** no se publican. Si se publican, deben terminar en 47 o 97 y nunca bajar de USD 97 al mes.
- [ ] **Formulario de contacto y suscripción al blog:** decidir si se usa un webform de Kommo o se omiten.
- [ ] **Preguntas marcadas "validar"** del banco (sección 12), en especial N02 (pauta pagada aparte) y H04 (GoHighLevel no es partner).
- [ ] **KAIN como portafolio de branding:** confirmar que el personaje lo creó el equipo de Ingeniak antes de presentarlo así en `/servicios/branding/`.
- [ ] **Autores de los artículos:** confirmar quién firma cada uno (los nombres son sugerencias).

## 16. Cómo usar esto en Astro

```
src/
  data/sitemap.json        ← copia de D-sitemap.json (fuente de title, meta, H1, breadcrumbs, CTAs y FAQ)
  data/navegacion.json     ← copia de D-navegacion.json
  data/faq.ts              ← banco de la sección 12 (o se lee de sitemap.json → faq)
  layouts/                 ← una por plantilla T-*
  components/              ← CineSection, Breadcrumbs, FAQAccordion, … (sección 3.2)
  pages/
    index.astro
    servicios/index.astro, servicios/[slug].astro
    kommo/index.astro, gohighlevel/index.astro
    industrias/index.astro, industrias/[slug].astro
    casos/index.astro, casos/[slug].astro
    blog/index.astro, blog/[slug].astro (colección de contenido MDX)
    kain/, metodologia/, tecnologias/, nosotros/, agentes-ia-guadalajara/, preguntas-frecuentes/, discovery/, contacto/, aviso-privacidad/, 404.astro
```

- `astro.config.mjs`: `site: "https://ingeniak.mx"`, `trailingSlash: "always"`, `build.format: "directory"`, `@astrojs/sitemap` filtrando la 404.
- Un `<SEO>` por página lee el objeto de `sitemap.json` por `url` y escribe title, meta, canonical, OG y el `@graph` de JSON-LD.
- Al terminar el build, valida: title ≤ 60, meta ≤ 155, cada H1 único, cada mensaje de WhatsApp único, ningún enlace interno roto y FAQPage idéntico al texto visible. Este documento ya pasó esas validaciones con el script de generación.
- Actualiza `llms.txt` con las 44 URLs indexables, la expansión correcta de VKTOR™ y solo "desde USD 997 al mes".
- Usa el `robots.txt` de la investigación SEO §3.8.
