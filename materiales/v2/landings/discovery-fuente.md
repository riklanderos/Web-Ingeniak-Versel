# Discovery Session · fuente (agenda.ingeniak.tech/discovery)

Capturado el 2026-10-20 con Firecrawl (markdown + links + screenshot + rawHtml, `maxAge: 0`) y con Chrome sin ventana (CDP). Los textos de las preguntas frecuentes, del formulario y de la confirmación salen de los bundles JS públicos de la página, porque el HTML del servidor no los trae: el acordeón está cerrado y las pantallas son de cliente.

- Landing: `https://agenda.ingeniak.tech/discovery`
- Reserva: `https://agenda.ingeniak.tech/discovery/agendar` (acepta `?lm=<lead magnet>`)
- Confirmación: `https://agenda.ingeniak.tech/discovery/confirmado?id=<bookingId>`
- Capturas: `capturas/discovery-fuente-1440.jpg`, `capturas/discovery-fuente-390.jpg`, `capturas/discovery-fuente-agendar-1440.jpg`
- Versión anterior de esta fuente: `materiales/discovery/contenido.md` (18 oct). El contenido no cambió.
- Stack de la fuente: Lovable (TanStack Start con server functions y Supabase), Meta Pixel y GA4 por variables de entorno. No se copió ningún ID ni token.

Los textos van **tal cual** (mayúsculas literales del HTML, erratas incluidas). Las erratas están marcadas con ⚠ y se listan en §6. En pantalla, los kickers se ven en minúsculas por CSS.

---

## 1. Landing `/discovery`: secciones en orden

### 0. Encabezado de campaña (fijo, 68 px; al pasar de 80 px de scroll se vuelve de cristal)
- Logotipo ingeniak (blanco), que enlaza a `/discovery`.
- Botón primario: **AGENDAR MI DISCOVERY SESSION** → `/discovery/agendar`
- No hay menú ni más enlaces.

### 1. Hero (`section.cinematic-hero`)
- **Móvil** (solo `<md`): imagen `kain-mobile-hero.png` en banda superior y H1 propio:
  **DEJA DE SER EL HÉROE DE TU NEGOCIO Y CONVIÉRTETE EN EL ARQUITECTO DE TU SISTEMA** ("ARQUITECTO" en cian). En móvil no aparecen el kicker, el lede, la microcopia ni los chips: después del H1 sigue directo el video.
- **Escritorio** (`md+`): Kain de cuerpo completo (`kain-01-hero.png`) en el 67 % derecho.
  - Kicker: `LLAMADA 1:1 · 30 MINUTOS · SIN COSTO`
  - H1: **30 MINUTOS PARA VER TU OPERACIÓN / COMO ES, NO COMO / TÚ CREES QUE ES** (la última línea en cian)
  - Lede (con borde izquierdo cian): "Discovery Session: una llamada 1:1 y gratuita con INGENIAK. Mapeamos tus necesidades, detectamos las áreas de oportunidad de tu negocio y sal ⚠ con sugerencias concretas. No entregamos nada: diagnosticamos. Cotizar sin diagnóstico es adivinar con dinero ajeno."
  - Microcopia (mono): `Sin costo · Sin compromiso · 30 minutos por Google Meet`
  - Chips con check: `30 min 1:1` · `Cero costo` · `Sugerencias concretas`
  - El hero **no lleva botón** (el CTA vive en el encabezado y debajo del video).

### 2. Video (VSL)
- H2 (solo `md+`): **MIRA ESTO ANTES DE AGENDAR** ("ANTES DE AGENDAR" en cian)
- `<video controls playsinline preload="metadata">` en línea, sin modal. aria-label: "Video: la silla vacía de INGENIAK". Respaldo: "Tu navegador no puede reproducir este video."
  - MP4: `/__l5e/assets-v1/294d7bbc-…/discovery-session-vsl.mp4`, 29 820 676 bytes, 1920 × 1080, **180 s (3:00)**. Es **el mismo archivo** que `materiales/discovery/discovery-session-vsl.mp4` (mismo tamaño en bytes). En el sitio ya existe `public/video/discovery-vsl-720.mp4` (1280 × 720, 12,8 MB, 180 s).
  - Póster: `discovery-session-vsl-poster.jpg`, 74 774 bytes, igual a `materiales/discovery/vsl-poster.jpg`. Trae texto horneado: "HAZ ESTA PRUEBA · Si mañana no llegas… ¿qué se detiene?" (silla ejecutiva vacía).
  - Sin subtítulos (`<track>`) ni transcripción.
- Debajo del video:
  - Botón primario **AGENDAR MI DISCOVERY SESSION** → `/discovery/agendar`
  - "Si reconociste tu negocio en este video, esta llamada es tu siguiente paso."
  - `Sin costo · Sin compromiso · 30 minutos por Google Meet`

### 3. Cómo funciona
- Kicker: `TRES PASOS, CERO LETRA CHICA` · H2: **CÓMO FUNCIONA**
- 01 **Llenas un formulario corto**: "Siete preguntas sobre tu negocio y tu operación. Dos minutos, sin ensayo."
- 02 **Eliges tu horario**: "Calendario en vivo, hora de Ciudad de México. Sesiones de 30 minutos, de lunes a viernes."
- 03 **Nos vemos en Google Meet**: "Al confirmar tu horario recibes el enlace de la videollamada. Solo conectarte."
- Tarjetas con número fantasma grande (01/02/03) de fondo.

### 4. `#que-es`: Qué es una Discovery Session
- Imagen: Kain de cuerpo completo caminando sobre plataformas de luz (`kain-03-cuatro-a.png`, alt "KAIN junto al mapa del método de INGENIAK"), a la derecha.
- Kicker: `SIN DISCURSO DE VENTA` · H2: **QUÉ ES UNA DISCOVERY SESSION**
- Subtítulo (serif itálica): "No es una demo. No es un pitch con otro nombre. Es la mitad de hora ⚠ que evita cotizar a ciegas."
- **LO QUE SÍ ES** (check cian):
  - Una revisión honesta de cómo opera tu negocio hoy.
  - Identificación de tus necesidades y áreas de oportunidad.
  - Sugerencias concretas de qué automatizar y en qué orden.
  - Claridad sobre si una implementación tiene sentido — y cuánto costaría.
- **LO QUE NO ES** (x ámbar):
  - No entregamos grabación, mapa de procesos ni documentos. ⚠ (choca con la propuesta de §6)
  - No hay presentación de ventas de 25 minutos disfrazada de diagnóstico.
  - No hay compromiso de compra posterior. Tú decides.
  - No es consultoría: es descubrimiento. El trabajo profundo va después. ⚠ (choca con el servicio de Consultoría en IA)

### 5. `#para-quien`: Para quién es esta llamada
- Kicker: `SIN FILTROS DISFRAZADOS` · H2: **PARA QUIÉN ES ESTA LLAMADA**
- Subtítulo: "Preferimos decirlo antes de que agendes: no es para todos, y está bien."
- **ES PARA TI SI…**
  - Eres dueño o dueña de una PyME de 3 a 40 empleados, de cualquier sector.
  - El negocio depende de ti para operar: ventas, cobros, supervisión, todo.
  - Sientes que hay procesos que se pueden sistematizar, pero no sabes por dónde empezar.
  - Consideras invertir en implementación y quieres una opinión seria antes.
- **NO ES PARA TI SI…**
  - Buscas una idea rápida gratis para hacerla tú mismo sin apoyo.
  - No tienes claro qué ⚠ opera tu negocio día a día — todavía.
  - Quieres que te cotiquen ⚠ sin que nadie vea la operación.
  - Tu operación ya está documentada y sistematizada. Felicidades; ve directo a escalar.

### 6. `#despues`: Después de la llamada
- Imagen: la misma `kain-03-cuatro-a.png`, ahora a la izquierda (decorativa).
- Kicker: `DESPUÉS DE LA LLAMADA` · H2: **SI HAY SENTIDO, TE COTIZAMOS LA IMPLEMENTACIÓN**
- "Con lo que veamos en los 30 minutos preparamos una propuesta de implementación: alcance, tiempos y costo. Sin presión y sin letra chica. Si tu caso no calza con lo que hacemos, te lo decimos en la misma llamada y te orientamos a dónde sí. Nadie te va a perseguir con llamadas después."
- Botón **AGENDAR MI DISCOVERY SESSION** → `/discovery/agendar`

### 7. `#faq`: Preguntas directas
- Kicker: `SIN LETRA CHICA` · H2: **PREGUNTAS DIRECTAS** (acordeón Radix con todo cerrado; las respuestas no están en el HTML del servidor)
1. **¿De verdad es gratuita?** Sí. Los 30 minutos no cuestan nada y no pedimos tarjeta. La llamada existe porque diagnosticar antes de cotizar es la única forma seria de trabajar.
2. **¿Me van a vender durante la llamada?** La llamada es de descubrimiento: mapeamos tu operación y te decimos qué vemos. Al final, si hay sentido, te compartimos una propuesta de implementación. Si no lo hay, también te lo decimos.
3. **¿Qué preparo para la llamada?** Nada especial. Con que sepas cómo opera tu negocio día a día es suficiente. Si tienes números a la mano, mejor: el diagnóstico se vuelve más preciso.
4. **¿Qué pasa después de la llamada?** Si tu proyecto tiene sentido para ambas partes, preparamos una propuesta de cotización de implementación con alcance y tiempos. Tú decides si avanzas.
5. **¿Puedo reagendar?** Sí, con al menos 24 horas de anticipación. Escríbenos por WhatsApp al 33 2101 7799 o a Contacto@ingeniak.mx y lo movemos.
6. **¿Y si mi negocio es muy pequeño o muy grande?** Trabajamos con PyMES de 3 a 40 empleados de cualquier sector. Si estás fuera de ese rango, la llamada lo aclara en los primeros minutos y te orientamos a la opción correcta.

(En el sitio ya están como D01–D06 en `src/data/faq.json`, ampliadas y aprobadas; ver los pendientes de `discovery.json`.)

### 8. Cierre
- Kicker: `EL PRIMER PASO NO CUESTA NADA`
- H2: **30 MINUTOS HOY VALEN MÁS QUE UNA COTIZACIÓN A CIEGAS MAÑANA**
- Cita (serif itálica, sin atribución): "“No cotizamos lo que no hemos visto. Vea ⚠ la operación con nosotros — es gratis, y aun así va a valer más que la mayoría de las juntas de su ⚠ semana.”" (en *usted*; el sitio ya la pasó a tuteo)
- Botón **AGENDAR MI DISCOVERY SESSION** → `/discovery/agendar`
- `Sin costo · Sin compromiso · 30 minutos por Google Meet`

### 9. Pie de página mínimo
- Logotipo + "Construimos empresarios libres, no héroes cansados."
- NAVEGACIÓN: Qué es la Discovery (`#que-es`) · Para quién es (`#para-quien`) · Qué pasa después (`#despues`) · Preguntas (`#faq`) · Agendar mi Discovery Session (`/discovery/agendar`)
- CONTACTO: ingeniak.mx · WhatsApp 33 2101 7799 (⚠ mensaje prellenado de **Power Session**: "Hola, vengo de la página de la Power Session y tengo una duda antes de agendar.") · Contacto@ingeniak.mx · @ingeniak_tech (instagram.com/ingeniak_tech) · Aviso de privacidad (`/privacidad`) · Términos y condiciones (`/terminos`)
- "© 2026 ingeniak. Todos los derechos reservados."

### 10. Barra CTA fija en móvil
- Solo `<md`. Aparece al pasar el 85 % del alto de la ventana: barra inferior de cristal con **AGENDAR MI DISCOVERY SESSION** a todo el ancho.

### Ambiente
Rejilla tipo plano, niebla y un `<canvas>` de partículas fijo (densidad 0.75). Las secciones aparecen con fade-up (IntersectionObserver). Tipografía: Bebas Neue (títulos), Barlow (texto), Playfair itálica (subtítulos), Sora y mono (kickers).

### SEO y meta de la fuente
- title: "Discovery Session · INGENIAK — Llamada de descubrimiento de 30 minutos, gratuita"
- description: "Llamada 1:1 gratuita de 30 minutos para dueños de PyMES: mapeamos tu operación, identificamos áreas de oportunidad y sales con sugerencias concretas y la ruta de implementación."
- og:title "Discovery Session · INGENIAK — 30 minutos para ver tu operación como es" · og:description "Llamada gratuita de 30 minutos: diagnóstico de tu operación, áreas de oportunidad y sugerencias concretas. Sin costo y sin compromiso."
- canonical ⚠ `https://powersession.ingeniak.tech/discovery` (otro dominio)
- JSON-LD `Service` "Discovery Session — Llamada de descubrimiento de 30 minutos", areaServed MX y LATAM, `Offer price 0 USD`.

---

## 2. Reserva `/discovery/agendar` (flujo actual de la fuente, 3 pasos)

Encabezado de la pantalla: kicker `PASO n DE 3`, H1 **CUÉNTANOS DE TU NEGOCIO** (pasos 1 y 2) o **ELIGE TU HORARIO** (paso 3), y debajo "Llamada de descubrimiento · 30 minutos · sin costo · Google Meet". Barra de progreso de 3 segmentos. Abajo, botón fantasma **Volver a la página** y el mismo pie de página. Meta: title "Agendar mi Discovery Session · INGENIAK"; og:description "Dos pasos: cuéntanos de tu negocio y elige horario. 30 minutos, sin costo."

**Paso 1 · Tus datos** ("Tus respuestas se conservan al regresar.")
| Campo | Etiqueta | Placeholder | Validación |
|---|---|---|---|
| fullName | Nombre completo * | Tu nombre y apellido | 3 a 120 caracteres · "Escribe tu nombre completo" |
| email | Correo electrónico * | tu@negocio.com | email · "Correo no válido" |
| whatsapp | WhatsApp con lada * | (valor inicial `+52 `) | 8 a 30 caracteres · "Incluye tu WhatsApp con lada" |

Botones: `Salir` (regresa a /discovery) · `Continuar →`

**Paso 2 · Tu negocio**
| Campo | Etiqueta | Opciones / ayuda | Validación |
|---|---|---|---|
| businessName | Nombre del negocio * | (sin placeholder) | 2 a 150 caracteres · "Escribe el nombre de tu negocio" |
| website | Sitio web o red social | Ayuda: "Opcional. Puede ser tu página o tu @ de Instagram/Facebook." Placeholder: tunegocio.com o @tunegocio | máx. 200 caracteres |
| industry | ¿A qué se dedica tu negocio? * | Servicios profesionales · Salud y bienestar · Retail o tienda física · E-commerce · Restaurantes y alimentos · Construcción e inmobiliaria · Manufactura o industria · Educación · Agencia o marketing · Otro (botones de opción única) | "Elige un giro" |
| teamSize | ¿Cuántas personas son en el equipo? * | Solo yo · 2–5 · 6–10 · 11–25 · 26–50 · Más de 50 | "Elige el tamaño del equipo" |
| revenue | ¿Cuánto factura el negocio al mes? * | Menos de $100K MXN · $100K–$300K · $300K–$800K · $800K–$2M · Más de $2M MXN · Apenas iniciaré | "Elige un rango" |
| goal | ¿Qué quieres revisar en la llamada? * | Ayuda: "En pocas palabras. Nosotros hacemos las preguntas difíciles." Placeholder: "Ej. Las cotizaciones tardan días y todo pasa por mí." Contador `n / 600` | 10 a 600 caracteres · "Cuéntanos con al menos 10 caracteres" |
| leadMagnet | (oculto) | toma `?lm=` de la URL | máx. 100 caracteres |

Botones: `Atrás` · `Ver horarios →` (con spinner). Al enviar, una server function guarda el lead o la reserva y devuelve `bookingId`. Dispara el evento `Lead` (Meta: `track Lead`, `content_name: "Discovery Session formulario"`; GA4: `event Lead`). Error: "No fue posible guardar tus datos. Reintenta o escríbenos por WhatsApp."

**Paso 3 · Elige tu horario**
- Imagen: Kain eligiendo horario en un calendario holográfico (`kain-06-agenda.png`, con máscara degradada). ⚠ **No está** en `materiales/discovery/`.
- "Horario de Ciudad de México (GMT-6)". Si el navegador está en otra zona aparece un select: "Ciudad de México (GMT-6)" / "Mi zona horaria (<tz>)".
- Cargando: "Cargando disponibilidad…"
- Agenda caída (`degraded` o error): "La agenda no responde en este momento. Escríbenos por WhatsApp y apartamos tu llamada de forma manual." + botón "Escribir por WhatsApp" (⚠ con el mensaje de Power Session).
- Escasez real, calculada con los datos: "Queda 1 horario disponible en estos días" / "Quedan N horarios disponibles en estos días".
- Selector: kicker `PRÓXIMOS 5 DÍAS HÁBILES` y 5 botones de día (día corto · número · mes corto, es-MX). Luego `HORARIOS DISPONIBLES` con botones de hora ("10:00 AM"). Sin día elegido: "Elige un día resaltado para ver los horarios."
- `← Regresar a mis datos`
- Reservar: `{bookingId, startISO}`. Si `ok:false`, muestra `reason` y vuelve a cargar la disponibilidad. Si falla: "Ese horario ya no está disponible. Elige otro." Con éxito dispara `HorarioElegido` (Meta `track Schedule`, `{slot, content_name:"Discovery Session"}`) y navega a `/discovery/confirmado?id=<bookingId>`.
- Disponibilidad: `GET` con `sessionType: "discovery"`, se considera vigente 60 s.

---

## 3. Confirmación `/discovery/confirmado?id=…`

Meta: title "Tu Discovery Session está confirmada · INGENIAK". Description: "Tu llamada de descubrimiento de 30 minutos con INGENIAK quedó confirmada. Aquí están tu fecha, tu enlace de videollamada y qué esperar."

- Kicker `LLAMADA CONFIRMADA` · H1 **TU LUGAR ESTÁ CONFIRMADO** ("CONFIRMADO" en cian) · imagen `kain-06-agenda.png` (alt "KAIN cruzando puertas de luz")
- Consulta el estado cada 4 s hasta que sea `confirmed`. Mientras tanto: "Confirmando tu llamada…"
- Tarjeta `TU LLAMADA`: fecha con formato "Lunes 20 de octubre · 10:00 AM" · "Hora de Ciudad de México (GMT-6) · 30 minutos · <businessName>"
  - **Agregar a Google Calendar** (plantilla: text "Discovery Session · INGENIAK", details "Llamada de descubrimiento 1:1 con INGENIAK (30 minutos, gratuita).")
  - **Descargar .ics** (`discovery-session-ingeniak.ics`, PRODID `-//INGENIAK//Discovery Session//ES`)
  - **Enlace de Google Meet** si existe `meetLink`. Si no: "El enlace de Meet está en camino. Si no te llega, escríbenos por WhatsApp."
- Sin fecha todavía: "Estamos confirmando tu llamada. Si en unos minutos no aparece, escríbenos por WhatsApp y lo revisamos."
- Sin id: "No encontramos tu confirmación. Si ya agendaste, escríbenos por WhatsApp y te pasamos los datos de tu llamada."
- `PARA APROVECHAR LOS 30 MINUTOS`:
  - · Conectate ⚠ cinco minutos antes desde una computadora, si puedes.
  - · Ten claro qué parte de tu operación se siente más trabada.
  - · Si tienes números a la mano (ventas, leads, tiempos), mejor todavía.
  - · No necesitas preparar presentación: nosotros hacemos las preguntas.
- Botones: **Escribirnos por WhatsApp** (⚠ mensaje de Power Session) · **Reagendar mi llamada** (`mailto:Contacto@ingeniak.mx?subject=Reagendar mi Discovery Session`)
- "¿Dudas sobre tu llamada? Escríbenos a Contacto@ingeniak.mx."

---

## 4. Datos duros

| Dato | Valor en la fuente | Comprobable |
|---|---|---|
| Precio | Sin costo. JSON-LD `Offer price 0 USD`. No se menciona el precio de implementación. | ✔ el flujo no tiene paso de pago ni pide tarjeta |
| Duración | 30 minutos | ✔ (confirmación y .ics) |
| Formato | 1:1 por videollamada en Google Meet | ✔ `meetLink` en la confirmación |
| Días y zona | Lunes a viernes, hora de CDMX (GMT-6); ventana de los próximos 5 días hábiles | ✔ selector "PRÓXIMOS 5 DÍAS HÁBILES", tz `America/Mexico_City` |
| VSL | "la silla vacía", 3:00, 1080p, 29,8 MB | ✔ |
| Contacto | WhatsApp 33 2101 7799 (`wa.me/523321017799`), Contacto@ingeniak.mx, IG @ingeniak_tech | ⚠ el sitio usa `ingeniakmx` en redes; confirmar |

## 5. Promesas, garantías y prueba social

No hay testimonios, logotipos de clientes, cifras, calificaciones, premios ni socios. La cita del cierre es voz de marca sin atribución, no un testimonio. Lo que sí hay son **afirmaciones y promesas**:

| Afirmación | Estado |
|---|---|
| "no pedimos tarjeta" / "Sin costo · Sin compromiso" | ✔ el flujo lo respalda |
| "Calendario en vivo… de lunes a viernes" | ✔ el flujo lo respalda |
| "Siete preguntas… Dos minutos" | ✖ **inexacto**: el formulario tiene 9 campos (8 obligatorios; 6 sobre el negocio). "Dos minutos" es una estimación sin comprobar |
| "Al confirmar tu horario recibes el enlace de la videollamada" | ◐ la confirmación muestra el Meet si ya existe; si no, dice "está en camino". No se ve desde el cliente si se manda invitación por correo |
| "PyME de 3 a 40 empleados" | ◐ posicionamiento del cliente. Las opciones del formulario ("Solo yo"… "Más de 50") no coinciden con ese rango |
| "Sí, con al menos 24 horas de anticipación" (reagendar) | ◐ política dicha por el cliente, sin comprobar. Ya está en D05 |
| "te lo decimos en la misma llamada y te orientamos a dónde sí" / "Nadie te va a perseguir con llamadas después" | ◐ promesas del cliente, textuales. Ya están en D04 y #despues con nota pendiente |
| "preparamos una propuesta de implementación: alcance, tiempos y costo" | ◐ proceso dicho por el cliente |
| "Quedan N horarios disponibles" | ✔ solo si se calcula con la disponibilidad real (nunca fija) |
| Promesa de tiempo de respuesta | No existe en la fuente. **No agregarla** (sin confirmar) |

## 6. Erratas e inconsistencias de la fuente (no portar)

- "sal con sugerencias" → "sales con". "mitad de hora" → "media hora". "cotiquen" → "coticen". "qué opera tu negocio" → "cómo opera". "Conectate" → "Conéctate". "Solo conectarte." → "Solo te conectas."
- El cierre está en *usted* ("Vea… su semana"); la marca usa tuteo.
- "No entregamos… ni documentos" choca con la propuesta posterior. "No es consultoría" choca con el servicio de Consultoría en IA. Las dos ya se corrigieron en `discovery.json`.
- "Presentación de ventas de 25 minutos": cifra arbitraria, ya se quitó en el sitio.
- El WhatsApp del pie, de la agenda caída y de la confirmación lleva el mensaje de **Power Session** en las páginas de Discovery.
- Canonical apuntando a `powersession.ingeniak.tech`.
- Correo con mayúscula ("Contacto@"). El sitio usa `contacto@ingeniak.mx`.
- Las respuestas del FAQ solo se pintan en el cliente: no hay SEO ni FAQPage.
- En el bundle compartido, el encabezado de Power Session dice "AGENDAR — $297 USD" y hay un enlace de pago de Stripe. Esa landing hermana no entra en este documento, pero ese precio choca con la regla "solo {{price}}": hay que confirmarlo con el cliente antes de portar Power Session.

---

## 7. Brechas: `/discovery/` actual (Astro) frente a la fuente y la aclaración del cliente

El sitio ya tiene y conviene conservar: hero ImageSection con la silla vacía, VSL en `<dialog>` (720p, `preload="none"`, "VSL · 3:00"), pasos, do/don't con la lista "En la llamada revisamos" y la línea de VKTOR, para-quién, #despues con el remate de `{{price}}`, FAQ D01–D06 ampliada con JSON-LD FAQPage, cierre Dawn con Kain en la silla, secundario "Escríbele a Kain" con el mensaje de WhatsApp correcto de Discovery, encabezado `data-variant="reduced"` con CTA, y copy ya corregido (§6).

Lo que le falta:

1. **Reserva dentro de la página (lo principal).** Los 4 primarios (encabezado, hero, #despues y cierre; `data-agenda-section`) salen a `https://agenda.ingeniak.tech/discovery/agendar`. Hay que portar el flujo de riklanderos.tech (`BookingPage`: hero → VSL → `#agenda` "Reserva en 3 pasos" con `BookingFlow`, disponibilidad en vivo de Google Calendar, reserva y Meet). Los CTA pasan a ser anclas a `#agenda`. Campos de partida: la paridad con §2 (fullName, email, WhatsApp +52, businessName, website, industry, teamSize, revenue, goal, lm), alineados con los del `BookingFlow` de Rik.
2. **Página de confirmación**: no existe. Falta la ruta propia (p. ej. `/discovery/confirmado/` o `/agendar/confirmado/` como en Rik) con resumen, Google Calendar, .ics, enlace de Meet, la lista "Para aprovechar los 30 minutos", WhatsApp y reagendar. También el estado "confirmando…" y los mensajes de respaldo.
3. **Estados del flujo**: selector de zona horaria, "Quedan N horarios" (dinámico), aviso de agenda caída con respaldo a WhatsApp (con el mensaje correcto de Discovery), horario ya tomado y vuelta a cargar, y respuestas conservadas al regresar.
4. **CTA debajo del VSL**: la fuente pone el primario justo bajo el video. En el sitio la escena del video solo tiene la línea "Si reconociste tu negocio…", sin botón.
5. **Barra CTA fija en móvil**: la fuente la muestra pasado el 85 % de la ventana. En `/discovery/` no se pinta `.mbar` (MobileCTABar).
6. **Página oculta**: hoy es indexable (`robots index,follow`, canonical, sitemap) y la enlazan el pie con el mapa completo y los CTA de casi todas las páginas (`sitemap.json`). Para la landing de campaña: `noindex`, fuera de sitemap.xml, `indice.json`, llms y del menú; pie mínimo como el de la fuente (logo y firma, anclas de la página, contacto y avisos legales). Los CTA del resto del sitio pasan al modal "Cotizar proyecto" (otra tarea).
7. **Medición de campaña**: la fuente lanza Meta Pixel y GA4 (`Lead` al guardar el formulario, `Schedule`/`HorarioElegido` al reservar). El sitio no tiene píxel ni GA. Hacen falta los IDs del cliente (como variables de entorno públicas) y su consentimiento.
8. **Atribución**: la fuente solo guarda `?lm=`. Para Kommo conviene capturar `utm_*`, `fbclid`, `gclid`, `lm` y la página de origen junto con el lead.
9. **Legales en el formulario**: la fuente enlaza Aviso de privacidad y Términos. El sitio tiene `/aviso-privacidad/` y no tiene Términos. El formulario necesita microcopia de privacidad con enlace.
10. **Gancho móvil**: el H1 móvil de la fuente ("Deja de ser el héroe de tu negocio y conviértete en el arquitecto de tu sistema") no se usa en el sitio. Es copy del cliente que podría servir como gancho de campaña (decisión de copy).
11. **Chips del hero** ("30 min 1:1 · Cero costo · Sugerencias concretas"): se omitieron a propósito (`_omitir`). Revisar si la campaña los quiere para escaneo rápido.
12. **Subtítulos del VSL (.vtt)**: faltan en los dos lados (pendiente R14).
13. **Kain en reserva y confirmación**: la fuente usa `kain-06-agenda.png`, que no está en `materiales/discovery/`. Si se quiere, hay que pedirlo o producirlo, siempre de cuerpo completo.
14. **Redes**: la fuente usa @ingeniak_tech y el sitio `ingeniakmx`. Confirmar cuál vale.
