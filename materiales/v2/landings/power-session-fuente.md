# Power Session · fuente (sitio vivo agenda.ingeniak.tech)

Levantado el 2026-10-20 con Firecrawl (markdown + links + captura de página completa, `maxAge: 0`) sobre:

- `https://agenda.ingeniak.tech/powersession` (landing, 200 OK)
- `https://agenda.ingeniak.tech/powersession/agendar` (flujo de reserva, 200 OK)

El sitio es una SPA hecha en Lovable (TanStack Start + React; assets en `/__l5e/assets-v1/…`). Las respuestas de las FAQ, los mensajes del diagnóstico, los pasos 2 a 4 del formulario, la pantalla de horarios, la de pago, la página `/powersession/confirmado` y `/terminos` no salen en el HTML: se leyeron como texto de sus módulos JS públicos (`assets/powersession.index-*.js`, `powersession.agendar-*.js`, `powersession.confirmado-*.js`, `booking-date-selector-*.js`, `booking.functions-*.js`, `site-*.js`, `terminos-*.js`). No se ejecutó nada ni se envió ningún formulario.

El copy de abajo es **exacto** (mayúsculas, signos y rayas como están). Las notas mías van en *cursiva* o en bloques "Nota".

---

## 0. Ficha de la oferta (resumen)

| Campo | Dato en la fuente |
|---|---|
| Nombre | Power Session (JSON-LD: "Power Session — Auditoría 1:1 de operación") |
| Formato | Sesión 1:1, 90 minutos, por Google Meet, queda grabada |
| Quién la da | Rik Landeros, fundador y director de ingeniak ("La sesión la doy yo, no un vendedor.") |
| Precio | **$297 USD**, pago único, sin suscripción. "$297 es precio introductorio." JSON-LD: `price: "297"`, `priceCurrency: "USD"` |
| Cobro | Stripe (Payment Link `https://buy.stripe.com/4gMeVcdGMh2p68g49r2880n`) |
| Cupo | "Tomo 4 sesiones por semana · por orden de pago" |
| Entregables | Auditoría 1:1 de tu operación completa · Diagnóstico de tus cuellos de botella reales · Plan de implementación a 90 días · Stack recomendado, con precios reales · ROI proyectado con TUS números · Grabación y mapa entregables al cerrar |
| Alcance | "La sesión ejecuta los pasos 1 y 2 del método" (Auditar y Agrupar de "Las 4 A del empresario libre") |
| Para quién | Negocio que ya factura y opera; el dueño aprueba/revisa/resuelve casi todo; 2 a 50 personas, cualquier giro; quiere un plan ejecutable |
| No es para | Quien aún no vende; quien busca que se implemente en los 90 min; quien quiere una herramienta que trabaje sola; quien no comparte números reales |
| Proceso | 1) Llenas el diagnóstico → 2) Eliges tu horario (calendario en vivo, CDMX; apartado 15 min mientras pagas) → 3) Pagas con Stripe y recibes la invitación de Google Meet |
| Garantía | "si en la sesión no identificamos al menos 3 fugas por más de $10,000 MXN al mes, te devolvemos los $297 USD completos". Se reclama por correo dentro de las 48 horas siguientes (FAQ y términos) |
| Reagendar | Sí, con al menos 24 horas de anticipación (WhatsApp o correo). Inasistencia sin aviso: no reembolsable (términos) |
| Zona horaria | America/Mexico_City (GMT-6); el visitante puede ver su propia zona |
| Área servida (JSON-LD) | MX, LATAM |

---

## 1. Metadatos

**Landing `/powersession`**

- `<title>`: Power Session · INGENIAK — Auditoría 1:1 de tu operación en 90 minutos
- description: Sesión 1:1 de 90 minutos para dueños de PyMES: auditoría de tu operación, cuellos de botella identificados y el orden exacto de qué automatizar primero.
- og:title / twitter:title: = title
- og:description: Deja de ser el héroe de tu negocio. 90 minutos, plan a 90 días, con tus números reales.
- og:image: `https://powersession.ingeniak.tech/__l5e/assets-v1/093f8195-340d-46b1-8409-76eff5fccfa0/ingeniak-og.jpg`
- og:locale es_MX · lang es-MX
- JSON-LD `Service`: name "Power Session — Auditoría 1:1 de operación"; provider Organization "ingeniak" (url `https://powersession.ingeniak.tech`); description = meta description; areaServed ["MX","LATAM"]; offers `{price "297", priceCurrency "USD", url "https://powersession.ingeniak.tech/powersession/agendar"}`.

> Nota: el JSON-LD y la og:image apuntan a `powersession.ingeniak.tech`, el sitio se sirve en `agenda.ingeniak.tech`. Dos dominios para lo mismo.

**`/powersession/agendar`**: title "Agendar mi Power Session · INGENIAK"; description "Reserva tu sesión 1:1 de 90 minutos con INGENIAK: cuéntanos de tu operación, elige horario y confirma tu lugar."; og:description "Tres pasos: calificación, horario y pago. 90 minutos sobre tu operación real."

**`/powersession/confirmado`**: title "Tu Power Session está confirmada · INGENIAK"; description "Tu sesión 1:1 de 90 minutos con INGENIAK quedó confirmada. Aquí están tu fecha, tu enlace de videollamada y qué llevar."; og:description "Fecha, enlace de videollamada y checklist para aprovechar tus 90 minutos."

---

## 2. Secciones de la landing, en orden (copy exacto)

Estética de la fuente: fondo navy casi negro, titulares en display condensado en mayúsculas (blanco con palabras clave en cian), kickers en mono pequeño con un isotipo, citas en serif itálica, tarjetas con borde fino, acentos cian; ámbar solo en el botón del diagnóstico 5/5. Una "VKTOR" gigante de marca de agua detrás del hero.

### 2.1 Barra superior
- Logo ingeniak (lockup blanco) → `https://agenda.ingeniak.tech/`
- Botón: **AGENDAR — $297 USD** → `/powersession/agendar`

### 2.2 Hero
- Marca de agua: VKTOR
- Kicker: SESIÓN 1:1 · 90 MINUTOS · 100% EJECUTABLE
- H1: **DEJA DE SER EL HÉROE DE TU NEGOCIO Y CONVIÉRTETE EN EL ARQUITECTO DE TU SISTEMA** ("ARQUITECTO DE TU SISTEMA" en cian)
- Bajada: 90 minutos. Una auditoría de tu operación completa, tus cuellos de botella identificados y el orden exacto de lo que se automatiza primero. Con tus números, no con teoría.
- Microcopy: Pago único · 90 minutos por Google Meet · Garantía de 3 fugas
- Imagen: KAIN (`kain-01-hero.png`; en móvil `kain-mobile-hero.png`), a la derecha, mano extendida. *No hay botón en el hero (el CTA está en la barra).*

### 2.3 Video (VSL)
- H2: MIRA ESTO ANTES DE AGENDAR ("ANTES DE AGENDAR" en cian)
- `<video controls playsinline preload="metadata">` con póster `powersession-vsl-poster.jpg` y fuente `powersession-vsl.mp4` (duración visible en la captura: **3:01**). aria-label "Video: Power Session de INGENIAK". El póster muestra una tarjeta "FACTURA INVISIBLE" con renglones "Mensajes sin respuesta (+5 min) $ ?", "Pauta sin atribución $ ?", "Seguimientos que nunca pasaron $ ?".
- Botón: **AGENDAR MI POWER SESSION — $297 USD** → `/powersession/agendar`
- Texto: Si reconociste tu operación en este video, esta sesión es tu siguiente paso.
- Microcopy: Pago único · 90 minutos por Google Meet · Garantía de 3 fugas

### 2.4 Cómo funciona
- Kicker: SIN LETRA CHICA
- H2: CÓMO FUNCIONA
- 01 **Llenas el diagnóstico** — Cuatro preguntas cortas sobre tu negocio y tu operación. Dos minutos, sin ensayo.
- 02 **Eliges tu horario** — Calendario en vivo, hora de Ciudad de México. Tu horario queda apartado 15 minutos mientras pagas.
- 03 **Pagas y recibes tu enlace** — Pago único y seguro con Stripe. Te llega la invitación de Google Meet y nos vemos 90 minutos.

> Nota: "Cuatro preguntas cortas… dos minutos" no coincide con el formulario real (4 pantallas, 11 campos, ver §3).

### 2.5 Diagnóstico rápido (interactivo, `#test`)
- Imagen: KAIN señalando un embudo saturado de tareas (`kain-02-cuello-botella.png`)
- Kicker: DIAGNÓSTICO RÁPIDO
- H2: ¿ERES CUELLO DE BOTELLA DE TU PROPIO NEGOCIO?
- Bajada (serif itálica): Responde con honestidad. El diagnóstico no mejora por cortesía.
- 5 casillas (título + aclaración):
  1. **Contestas WhatsApp del negocio después de las 10 pm** — Al menos tres veces por semana. Y lo justificas como "es rapidito".
  2. **Si te vas 3 días sin señal, la operación se traba** — O alguien termina llamándote de emergencia a media carretera.
  3. **Hay al menos 5 procesos que "solo tú sabes hacer bien"** — Y en el fondo te gusta un poco que así sea.
  4. **Tu equipo te pregunta cosas que ya les explicaste** — Porque no existe un manual ni un sistema donde puedan consultarlo sin preguntarte a ti.
  5. **Te preguntan "¿cómo va el negocio?" y contestas con emoción** — "Bien", "pesado", "ahí la llevamos" — antes que con un número.
- Contador: `N / 5`
- Mensajes según puntaje:
  - 0–2: Menos de tres señales. La sesión sirve para ordenar lo que ya funciona antes de escalarlo.
  - 3–4: Tres señales o más: tú eres el cuello de botella. La sesión existe exactamente para ese caso.
  - 5: Cinco de cinco. Tu operación no sobrevive un día sin ti. Esto no se arregla leyendo.
- Con 3 o más aparece el botón **Agendar mi Power Session** → `/powersession/agendar` (variante ámbar con 5/5, primaria con 3–4).

### 2.6 Para quién es (`ENCAJE`)
- Kicker: ENCAJE · H2: PARA QUIÉN ES ESTA SESIÓN
- **ES PARA TI SI…**
  - Tu negocio ya factura y ya opera — no estás empezando de cero.
  - Eres tú quien aprueba, revisa o resuelve casi todo.
  - Tienes entre 2 y 50 personas en el equipo, de cualquier giro.
  - Quieres un plan que puedas ejecutar, no una charla motivacional.
- **NO ES PARA TI SI…**
  - Todavía no vendes nada y buscas validar una idea.
  - Buscas que alguien implemente por ti en esos 90 minutos.
  - Quieres una herramienta que trabaje sola sin mover un solo proceso.
  - No estás dispuesto a compartir tus números reales.
- Remate (serif itálica): Si estás del lado izquierdo, los $297 son lo más barato que vas a pagar este año.

### 2.7 La verdad incómoda
- Kicker: LA VERDAD INCÓMODA
- Frase (serif itálica grande): El poder que crees tener es exactamente lo que te está atando.
- Tres renglones "si → entonces":
  - Si tú te enfermas → el negocio se enferma
  - Si te vas de vacaciones → las ventas bajan
  - Si te distraes una semana → 3 cosas explotan
- Bloque con filete cian: Eso no es un negocio. Es un empleo con más horas, más riesgo y sin aguinaldo.
- Cita de KAIN (avatar `kain-01-hero.png`): "Ninguno de los dos trabaja menos. Uno trabaja en el negocio; el otro, sobre el negocio."

### 2.8 El método (`#metodo`)
- Kicker: EL MÉTODO · H2: LAS 4 A DEL EMPRESARIO LIBRE
- Bajada: Cuatro pasos, noventa días, un negocio que ya no depende de ti.
- Imagen: KAIN frente a un tablero con los cuatro pasos del método (`kain-03-cuatro-a.png`; en la captura KAIN sube por losas de luz). Pie de imagen: VKTOR / SECUENCIA 01—04 · 90 DÍAS
- Línea de tiempo:
  - **01 AUDITAR** · SEMANA 1–2 — Documentar los procesos que sostienen el negocio y hoy viven en tu cabeza. El promedio de una PyME sin sistema: 27 procesos activos en la memoria del dueño.
  - **02 AGRUPAR** · SEMANA 1–2 — Clasificar esos procesos en tres cajas: repetitivos, decisiones y relacionales. Sin esta separación, automatizas lo que no debías y sigues atado a lo mismo.
  - **03 AGENTIZAR** · SEMANA 3–6 — Entregar los repetitivos a agentes de IA que reciben, deciden, ejecutan y reportan. No es software: es capacidad operativa que trabaja 24/7.
  - **04 AUTOMATIZAR** · SEMANA 7–12 — Lo que no se agentiza se sistematiza: procedimientos claros que cualquiera de tu equipo puede seguir sin preguntarte a ti.
- Cifras: **+5 a 15 HRS** por semana, por paso · **90 DÍAS** para ejecutar los cuatro · **27 PROCESOS** promedio a liberar
- Cita de KAIN: "El error más caro es empezar por el paso 3. Comprar herramientas antes de auditar es caos más rápido."

### 2.9 Qué incluye (`#incluye`)
- Imagen: KAIN trabajando sobre un mapa de procesos junto a un reloj (`kain-04-sesion-60min.png`; *el nombre del archivo dice 60 min, la oferta es de 90*)
- Kicker: QUÉ INCLUYE · H2: QUÉ PASA EN LOS 90 MINUTOS
- Bajada: Nada de teoría. Trabajo sobre tu operación, en vivo.
- 6 tarjetas con ícono: Auditoría 1:1 de tu operación completa · Diagnóstico de tus cuellos de botella reales · Plan de implementación a 90 días · Stack recomendado, con precios reales · ROI proyectado con TUS números · Grabación y mapa entregables al cerrar
- Cierre: La sesión ejecuta los pasos 1 y 2 del método. En 90 minutos.

### 2.10 Caso real (`#caso`)
- Kicker: CASO REAL · 90 DÍAS · H2: DE 13 HORAS AL DÍA A UN SISTEMA
- Chips: SERVICIOS PROFESIONALES · MONTERREY · 6 EMPLEADOS · 8 AÑOS OPERANDO
- Imagen: `kain-06-agenda.png` con rótulo "MES 0 → MES 3 · Transformación documentada"
- Tabla MES 0 · ANTES → MES 3 · DESPUÉS:

| Concepto | Antes | Después |
|---|---|---|
| Jornada del dueño | 13 hrs/día | 8 hrs/día |
| Facturación mensual | $180K MXN | $340K MXN |
| Procesos que solo él aprueba | 4 | 0 |
| Cotizaciones manuales | 30–40 al mes | Tiempo de cotización < 5 minutos |
| Seguimiento de cotizaciones | 60% se enfriaban en ≥3 días | 85% cerradas en <48 hrs |
| Hora de dormir | 12:30 am | 10:30 pm |

- Cifras: **$65K** inversión en implementación · **$480K** ingreso adicional a 90 días · **7.4x** retorno en 3 meses
- Aviso: Caso real de un cliente de INGENIAK, cifras compartidas con su autorización. No prometemos estos números: prometemos el proceso que los hizo posibles. Tu resultado depende de tu punto de partida y de tu ejecución.

### 2.11 Franja de clientes
- Kicker: EMPRESAS QUE YA OPERAN CON SISTEMAS DE INGENIAK
- Nombres en texto (no logos): ARGI · NUTRIBALANCE · VISAS SOS · DEPORT DEV · KROMA ODONTOLOGÍA

### 2.12 El costo de seguir igual
- Fondo: `brand-bg-bloom.jpg`
- Kicker: EL COSTO DE SEGUIR IGUAL · H2: LO QUE CUESTA NO TENER EL SISTEMA
- **~40 HRS** al mes que no recuperas — Es una semana laboral completa, cada mes, en cosas que no requieren tu talento.
- **27** procesos en tu cabeza — El promedio de una PyME sin sistema. Cada uno es un punto de falla que depende de ti.
- **$297** una sola vez — El costo de seguir decidiendo sin mapa, frente a una inversión única que te lo entrega completo. *(tarjeta destacada con brillo cian)*
- Recuadro: GARANTÍA: si en la sesión no identificamos al menos 3 fugas por más de $10,000 MXN al mes, te devolvemos los $297 USD completos.

### 2.13 Oferta (`#oferta`)
- Fondo: `brand-bg-silk.jpg`
- Kicker: 90 MINUTOS, UNO A UNO, CONTIGO · H2: AGENDA TU POWER SESSION
- Precio: **$297 USD**
- Tomo 4 sesiones por semana · por orden de pago
- Pago único · sin suscripción
- Checklist (2 columnas): Auditoría operativa · Cuellos de botella · Plan a 90 días · Stack recomendado · ROI con tus números · Grabación y mapa
- Botón: **AGENDAR AHORA →** → `/powersession/agendar`
- Microcopy: Pago seguro con Stripe · Grabación y mapa incluidos · Garantía de 3 fugas · Sin suscripción

### 2.14 Garantía + Por qué ahora (dos tarjetas)
- Imagen: KAIN con el sello de garantía (`kain-05-garantia.png`)
- **GARANTÍA** — Si en la sesión no encontramos al menos 3 fugas por más de $10,000 MXN al mes en tu operación, te devolvemos los $297 USD completos. El riesgo lo asumimos nosotros.
- **POR QUÉ AHORA** · H3: EL COSTO DE ESPERAR TAMBIÉN SE ACUMULA — Cada mes sin sistema son ~40 horas que no recuperas. Cada semana sin agentes, leads que se enfrían — y tu competencia los recibe. **$297 es precio introductorio.**

### 2.15 Quién te va a atender
- Foto: `rik-landeros-ingeniak.png` (alt "Rik Landeros, fundador y director de ingeniak"), con el isotipo azul detrás
- Kicker: QUIÉN TE VA A ATENDER · H2: RIK LANDEROS · Fundador y director de ingeniak
- Texto: La sesión la doy yo, no un vendedor. Aplico la metodología VKTOR en empresas de México, Estados Unidos y LATAM: CRM, agentes de IA, automatización y publicidad de performance. En 90 minutos verás tu operación como yo la veo.
- Tres datos: Partner oficial de Kommo en LATAM · Equipo propio de 8 especialistas · Metodología VKTOR: Verify · Koncept · Transform · Operate · Rise

### 2.16 Preguntas (`#faq`, acordeón)
- Kicker: PREGUNTAS · H2: LO QUE TODOS NOS PREGUNTAN

1. **¿Esto es una llamada de ventas disfrazada?** — No. Es una sesión de trabajo pagada: sales con tu mapa y tu plan, los implementes con nosotros o por tu cuenta.
2. **¿Sirve si mi negocio no es de tecnología?** — Sí. Hemos hecho esto en clínicas, despachos, retail, e-commerce, restaurantes, constructoras y servicios profesionales. El cuello de botella del dueño es el mismo en todos.
3. **¿Qué necesito traer?** — Tus números reales: facturación mensual, tamaño de equipo y una idea de en qué se te van las horas. Nada presentable: los datos, tal cual.
4. **¿Es por videollamada?** — Sí, por Google Meet. Recibes el enlace al confirmar el pago y queda grabada.
5. **¿Y si tengo menos de 3 empleados?** — Funciona igual, y muchas veces mejor: es el momento de construir el sistema antes de contratar.
6. **¿Puedo reagendar?** — Sí, con al menos 24 horas de anticipación. Escríbenos por WhatsApp al {WhatsApp} o a {correo} y lo movemos.
7. **¿Cómo aplica la garantía?** — Si al terminar la sesión no identificamos al menos 3 fugas por más de $10,000 MXN mensuales, te devolvemos los $297 USD completos. Nos escribes a {correo} dentro de las 48 horas siguientes.

### 2.17 Cierre (`#cierre`)
- Imagen: KAIN eligiendo un horario en un calendario holográfico (`kain-06-agenda.png`)
- Frase (serif itálica): Un gran sistema es la máxima responsabilidad.
- Texto: Hacerlo todo tú te hace héroe por un rato. Construir un sistema te libera para siempre.
- Cita de KAIN: "Nos vemos del otro lado. Trae tus números — los de verdad, no los que le dices a tu compadre."
- Botón: **AGENDAR MI POWER SESSION — $297 USD** → `/powersession/agendar`

### 2.18 Pie
- Lockup ingeniak + lema: Construimos empresarios libres, no héroes cansados.
- NAVEGACIÓN: Método (`#metodo`) · Qué incluye (`#incluye`) · Preguntas (`#faq`) · Agendar (`/powersession/agendar`)
- CONTACTO: ingeniak.mx → `https://ingeniak.mx/` · WhatsApp 33 2101 7799 → `https://wa.me/523321017799?text=Hola%2C%20vengo%20de%20la%20p%C3%A1gina%20de%20la%20Power%20Session%20y%20tengo%20una%20duda%20antes%20de%20agendar.` · Contacto@ingeniak.mx → `mailto:Contacto@ingeniak.mx` · @ingeniak_tech → `https://instagram.com/ingeniak_tech` · Aviso de privacidad → `/privacidad` · Términos y condiciones → `/terminos`
- © 2026 ingeniak. Todos los derechos reservados.

---

## 3. Flujo de reserva `/powersession/agendar` (copy exacto)

Un solo componente con tres fases. Encabezado: `PASO n DE 6` (4 pantallas de calificación + horario + pago) y un título por fase.

### Fase 1 · CUÉNTANOS DE TU OPERACIÓN (4 pantallas; "Tus respuestas se conservan al regresar.")

| Pantalla | Campo | Etiqueta | Tipo / opciones | Validación (mensaje) |
|---|---|---|---|---|
| Tus datos | fullName | Nombre completo * | texto, placeholder "Tu nombre y apellido" | 3–120 car. ("Escribe tu nombre completo") |
| | email | Correo electrónico * | email, placeholder "tu@negocio.com" | email ("Correo no válido") |
| | whatsapp | WhatsApp con lada * | tel, valor inicial "+52 " | 8–30 car. ("Incluye tu WhatsApp con lada") |
| Tu negocio | businessName | Nombre del negocio * | texto | 2–150 ("Escribe el nombre de tu negocio") |
| | website | Sitio web o Instagram (opcional) | texto, placeholder "ingeniak.mx / @ingeniak_tech" | ≤200 |
| | industry | ¿A qué se dedica tu negocio? * | botones (2 col.): Servicios profesionales · Salud y bienestar · Retail o tienda física · E-commerce · Restaurantes y alimentos · Construcción e inmobiliaria · Manufactura o industria · Educación · Agencia o marketing · Otro | "Elige un giro" |
| Tu operación | teamSize | ¿Cuántas personas son en el equipo? * | Solo yo · 2–5 · 6–10 · 11–25 · 26–50 · Más de 50 | "Elige el tamaño del equipo" |
| | revenue | ¿Cuánto factura el negocio al mes? * | Menos de $100K MXN · $100K–$300K · $300K–$800K · $800K–$2M · Más de $2M MXN · Apenas iniciaré | "Elige un rango" |
| | timeDrains | ¿Qué te está quitando más horas hoy? * (pista "N de 3 seleccionadas") | multi, máx. 3: Atender WhatsApp y leads · Cotizar · Cobrar y dar seguimiento a pagos · Supervisar al equipo · Atención a clientes y quejas · Administración y facturación · Compras y proveedores · Marketing y contenido · Otro | "Elige al menos una" / "Máximo 3 opciones" |
| Tu objetivo | tools | ¿Qué CRM o herramientas usan hoy? * | texto, placeholder "Kommo, HubSpot, Excel, WhatsApp y nada más..." | 2–300 ("Cuéntanos qué usan hoy") |
| | goal | ¿Qué quieres tener resuelto al salir de la sesión? * | textarea máx. 1000, contador, placeholder "En pocas palabras, ¿qué necesitas destrabar?" | ≥20 car. ("Cuéntanos con al menos 20 caracteres") |
| (oculto) | leadMagnet | — | viene de `?lm=` en la URL | ≤100 |

Botones: Salir (en la 1.ª pantalla, vuelve a `/powersession`) / Atrás · Continuar → · en la última: **Ver horarios →**. Al enviar se guarda el lead (función de servidor POST → devuelve `bookingId`) y se dispara el evento `Lead` (`content_name: "Power Session formulario"`). Error: "No fue posible guardar tus datos. Reintenta o escríbenos por WhatsApp."

> Nota: el mismo módulo trae un segundo esquema más corto (sin `timeDrains` ni `tools`, `goal` ≥10 car. y ≤600) que usa la Discovery Session.

### Fase 2 · ELIGE TU HORARIO
- Imagen: KAIN eligiendo un horario en un calendario holográfico
- Selector de zona: "Horario de Ciudad de México (GMT-6)" / "Ciudad de México (GMT-6)" o "Mi zona horaria (…)" si el navegador está en otra zona (aria-label "Zona horaria").
- Disponibilidad (GET a función de servidor, `queryKey ['availability']`, `staleTime 60 s`): kicker **PRÓXIMOS 5 DÍAS HÁBILES**, cinco botones de día (día corto, número, mes); días sin horarios deshabilitados.
- Cargando: "Cargando disponibilidad…"
- Escasez: "Queda 1 horario disponible en estos días" / "Quedan N horarios disponibles en estos días"
- Kicker **HORARIOS DISPONIBLES** + "Elige un día resaltado para ver los horarios." + botones de hora (formato "10:00 AM").
- Si la agenda falla (`degraded` o error): "La agenda no responde en este momento. Escríbenos por WhatsApp y apartamos tu lugar de forma manual." + botón **Escribir por WhatsApp**.
- Al elegir: función POST `{bookingId, startISO}` → `{ok, reason?, holdExpiresAt}`; evento `Schedule` (custom `HorarioElegido`, `{slot}`). Si se ocupó: "Ese horario ya no está disponible. Elige otro." y se recarga la disponibilidad.
- Volver: "← Regresar a mis datos"

### Fase 3 · CONFIRMA Y PAGA
- Kicker **TU RESERVA** + fecha larga (formato de ejemplo: "Martes 21 de octubre · 10:00 AM") + "Hora de Ciudad de México (GMT-6)" o "Zona horaria: …" + " · duración 90 minutos"
- **$297 USD** · pago único
- Cuenta regresiva: "Tu horario está apartado por mm:ss" → al expirar: "Tu apartado expiró. Elige otro horario."
- Botón: **PAGAR $297 USD Y CONFIRMAR**
- Microcopy: Pago único y seguro con Stripe · Si no identificamos al menos 3 fugas por más de $10,000 MXN al mes, te devolvemos los $297 USD completos.
- Volver: "← Cambiar horario"
- Al pagar: evento `InitiateCheckout` (`value 297, currency USD, content_name "Power Session"`) y redirección a `https://buy.stripe.com/4gMeVcdGMh2p68g49r2880n?client_reference_id={bookingId}&prefilled_email={email}`. Error: "No fue posible iniciar el pago. Escríbenos por WhatsApp y lo resolvemos."
- Regreso por cancelación: `/powersession/agendar?cancelado=1` → aviso "El pago no se completó. Tu horario sigue apartado por unos minutos."
- Pie: "Volver a la página" → `/powersession`

### Página `/powersession/confirmado?session_id=…`
- Consulta la reserva por `sessionId` (id de la sesión de Stripe) y reintenta cada 4 s hasta `status === 'confirmed'`. Mientras: "Confirmando tu reserva…"
- Kicker **PAGO CONFIRMADO** · H1: **TU LUGAR ESTÁ APARTADO** ("APARTADO" en cian) · imagen "KAIN cruzando puertas de luz"
- **TU SESIÓN**: fecha + "Hora de Ciudad de México (GMT-6) · 90 minutos · …"
- Botones: Agregar a Google Calendar · Descargar .ics (`power-session-ingeniak.ics`, SUMMARY "Power Session · INGENIAK", DESCRIPTION "Auditoría 1:1 de tu operación con INGENIAK.") · Enlace de Google Meet
- "Te enviamos el enlace de Meet por correo en unos minutos."
- Si no se confirma: "Estamos confirmando tu pago. Si en unos minutos no aparece tu reserva, escríbenos por WhatsApp y lo revisamos."
- **PARA APROVECHAR LOS 90 MINUTOS, TEN A LA MANO** · Tu facturación de los últimos 3 meses. · Tu número aproximado de leads al mes. · Quién hace qué en tu equipo.
- Escribirnos por WhatsApp (mensaje "Hola, acabo de agendar mi Power Session y quiero confirmar algo.") · Reagendar mi sesión → `mailto:Contacto@ingeniak.mx?subject=Reagendar%20mi%20Power%20Session` · "¿Dudas sobre tu sesión? Escríbenos a" + correo

### Seguimiento
Un helper llama `fbq('track'|'trackCustom', …)` y `gtag('event', …)` si existen (Meta Pixel y GA4 se inyectan por configuración). Eventos: `Lead`, `Schedule`/`HorarioElegido`, `InitiateCheckout`.

### Funciones de servidor (no visibles; solo sus contratos desde el cliente)
- guardar lead → `bookingId` (POST; acepta `bookingId` para actualizar)
- disponibilidad → `{days:[{date, slots:[ISO]}], degraded?}` (GET)
- apartar horario → `{ok, reason?, holdExpiresAt}` (POST, apartado de 15 min)
- confirmación por `sessionId` → `{status, …}` (GET)
- *Las credenciales (Google Calendar, Stripe webhook, CRM) no son visibles y no se buscaron.*

---

## 4. Términos y condiciones (`/terminos`, fragmento de la Power Session)

- **Servicio.** La Power Session es una sesión de trabajo 1:1 de 90 minutos por videollamada, con un costo único de $297 USD. No es una suscripción y no genera cargos recurrentes.
- **Agenda.** El horario queda apartado 15 minutos mientras completas el pago. Al confirmarse el pago recibes el enlace de Google Meet y la invitación de calendario.
- **Reagendado.** Puedes reagendar con al menos 24 horas de anticipación desde el enlace de tu confirmación. Las inasistencias sin aviso no son reembolsables.
- **Garantía.** Si al terminar la sesión no identificamos al menos 3 fugas por más de $10,000 MXN mensuales en tu operación, nos escribes dentro de las 48 horas siguientes y te devolvemos los $297 USD completos.
- **Resultados.** Los casos y cifras mostrados son reales y se comparten con autorización del cliente. No constituyen una promesa de resultado: cada negocio depende de su punto de partida y de su ejecución.
- **Contacto.** correo + WhatsApp.

---

## 5. Todos los CTA y URLs

| Dónde | Texto | Destino |
|---|---|---|
| Barra superior | AGENDAR — $297 USD | `https://agenda.ingeniak.tech/powersession/agendar` |
| Bajo el video | AGENDAR MI POWER SESSION — $297 USD | `/powersession/agendar` |
| Diagnóstico (≥3/5) | Agendar mi Power Session | `/powersession/agendar` |
| Oferta | AGENDAR AHORA → | `/powersession/agendar` |
| Cierre | AGENDAR MI POWER SESSION — $297 USD | `/powersession/agendar` |
| Pie | Agendar | `/powersession/agendar` |
| Pie | WhatsApp 33 2101 7799 | `https://wa.me/523321017799?text=Hola%2C%20vengo%20de%20la%20p%C3%A1gina%20de%20la%20Power%20Session%20y%20tengo%20una%20duda%20antes%20de%20agendar.` |
| Pie | Contacto@ingeniak.mx | `mailto:Contacto@ingeniak.mx` |
| Pie | ingeniak.mx / @ingeniak_tech / Aviso de privacidad / Términos | `https://ingeniak.mx/`, `https://instagram.com/ingeniak_tech`, `/privacidad`, `/terminos` |
| Pago (fase 3) | PAGAR $297 USD Y CONFIRMAR | `https://buy.stripe.com/4gMeVcdGMh2p68g49r2880n?client_reference_id=…&prefilled_email=…` |
| Cancelación Stripe | — | `/powersession/agendar?cancelado=1` |
| Éxito Stripe | — | `/powersession/confirmado?session_id=…` (inferido de la ruta; la URL de éxito se configura en el Payment Link) |
| Confirmación | Reagendar mi sesión | `mailto:Contacto@ingeniak.mx?subject=Reagendar%20mi%20Power%20Session` |
| Confirmación | Escribirnos por WhatsApp | wa.me con "Hola, acabo de agendar mi Power Session y quiero confirmar algo." |

> El precio aparece en el texto de cuatro botones. En el sitio nuevo el precio no puede ir a mano (ver §8).

---

## 6. Imágenes y video

Base: `https://agenda.ingeniak.tech/__l5e/assets-v1/<id>/<archivo>`

| Archivo | id | Uso / alt | Observación |
|---|---|---|---|
| `ingeniak-lockup-white.png` | b7400981-db15-4cad-b230-13df2126a41d | logo barra y pie | el sitio nuevo ya tiene su logo |
| `kain-01-hero.png` | b353864a-7bf3-4dfa-9a0a-16b866fced33 | hero; avatar de las citas de KAIN | en la captura el robot se ve cortado abajo (no cuerpo completo) |
| `kain-mobile-hero.png` | 63d54557-fd6c-49ac-9ab7-5e3ffe2ae755 | hero móvil | |
| `kain-02-cuello-botella.png` | 30c2c710-2290-493c-b738-5522831bf5a0 | "KAIN señalando un embudo saturado de tareas" | KAIN de medio cuerpo |
| `kain-03-cuatro-a.png` | a5ee79d1-9fe6-4a34-90ee-c662a064a178 | "KAIN frente a un tablero con los cuatro pasos del método" | KAIN de cuerpo completo subiendo losas de luz |
| `kain-04-sesion-60min.png` | 62b18f56-2bb5-4f93-864c-415e457d45af | "KAIN trabajando sobre un mapa de procesos junto a un reloj" | KAIN sentado frente a una laptop (no cuerpo completo); el nombre dice 60 min |
| `kain-05-garantia.png` | a29eed4f-edf7-41a9-947d-93095e6c832e | "KAIN con el sello de garantía" | |
| `kain-06-agenda.png` | cda23cdc-3ada-4fa7-9372-61defc5923f7 | "KAIN eligiendo un horario en un calendario holográfico" (caso, cierre, agenda) | KAIN de medio cuerpo |
| `rik-landeros-ingeniak.png` | 76818d61-24e0-4e6a-974c-f0f11450101e | foto de Rik con el isotipo azul | |
| `ingeniak-isotipo-white.png` | 9266f88e-e830-4b03-878a-861e70d2a5ee | decorativo | |
| `brand-bg-bloom.jpg` | e735629d-4c69-4551-b72d-0854f74b8103 | fondo "costo de seguir igual" | el sitio nuevo prohíbe fondos por sección (§3.11) |
| `brand-bg-silk.jpg` | 4f7f6b22-d936-48f5-8c42-564fb81f4023 | fondo de la oferta | ídem |
| `powersession-vsl.mp4` | 2b58b6c9-12c3-4778-b869-e273c1ff439b | VSL, 3:01 | hay que descargarlo y subirlo al sitio nuevo (no se descargó) |
| `powersession-vsl-poster.jpg` | 50e4ba03-a94f-492e-b444-ab3ce8f417e6 | póster del VSL ("FACTURA INVISIBLE") | |
| `ingeniak-og.jpg` | 093f8195-340d-46b1-8409-76eff5fccfa0 (en powersession.ingeniak.tech) | og:image | |
| (confirmado) | — | "KAIN cruzando puertas de luz" | |

> Regla de marca del sitio nuevo: KAIN blanco y siempre de cuerpo completo. De la fuente, solo `kain-03-cuatro-a` cumple a simple vista; hero, embudo, laptop y agenda salen recortados. Usar placas del sitio nuevo (cuerpo completo) o generar nuevas.

---

## 7. Afirmaciones a verificar antes de publicarlas (no están en `src/lib/metrics.ts`)

Regla del sitio nuevo: ninguna cifra a mano, sin clientes ni promesas inventadas. Todo lo siguiente es afirmación de la fuente que **no está respaldada** en los datos del proyecto:

1. **Caso real "De 13 horas al día a un sistema"** (servicios profesionales, Monterrey, 6 empleados, 8 años): 13→8 hrs/día, $180K→$340K MXN, 4→0 procesos, cotización <5 min, 60%→85% cerradas <48 h, dormir 12:30→10:30, **$65K inversión, $480K ingreso adicional, 7.4x**. No existe en `metrics.ts` ni entre los 6 casos del sitio. Requiere confirmación del cliente, autorización y alta como métricas; si no, se omite.
2. **Franja de clientes**: ARGI, NUTRIBALANCE, VISAS SOS, DEPORT DEV, KROMA ODONTOLOGÍA. El sitio nuevo no publica nombres de clientes; requiere autorización de cada uno.
3. **"27 procesos" promedio en la memoria del dueño de una PyME** (método, tarjeta de costo): estadística sin fuente. Ojo: `metrics.ts` ya tiene un `27` distinto (`logistica-procesos`: 27 procesos automatizados del caso logística); no confundirlos.
4. **"~40 HRS al mes"** y **"+5 a 15 HRS por semana, por paso"**: sin fuente.
5. **"Equipo propio de 8 especialistas"**: contradice RESPUESTAS-CLIENTE 2026-10-19 #7 ("no mencionar el número de personas").
6. **"Hemos hecho esto en clínicas, despachos, retail, e-commerce, restaurantes, constructoras y servicios profesionales"** (FAQ 2): lista de giros más amplia que la confirmada en el sitio (salud, retail, e-commerce, HoReCa, logística…); despachos y constructoras sin respaldo.
7. **"empresas de México, Estados Unidos y LATAM"**: compatible con la métrica `paises` (7 países); conviene usar `<Metric id="paises">` en vez de texto libre.
8. **Garantía de 3 fugas > $10,000 MXN al mes con reembolso total** y **reembolso a 48 h**: es una promesa comercial; publicar solo si el cliente la confirma para la nueva página.
9. **"Tomo 4 sesiones por semana · por orden de pago"** y **"$297 es precio introductorio"**: escasez y precio temporal; confirmar vigencia.
10. **"Te enviamos el enlace de Meet por correo en unos minutos"** y **"Recibes el enlace al confirmar el pago"**: promesa de tiempo; depende de la automatización portada. La regla del sitio prohíbe promesas de tiempo de respuesta no confirmadas.
11. **"queda grabada" / "Grabación y mapa entregables al cerrar"**: entregable a confirmar.
12. **"Partner oficial de Kommo en LATAM"**: coincide con la regla (Kommo es el único partner); usar el sello/`KommoBadge` del sitio.
13. **"Metodología VKTOR: Verify · Koncept · Transform · Operate · Rise"**: coincide con `/metodologia/`. Pero "Las 4 A del empresario libre" (Auditar, Agrupar, Agentizar, Automatizar; 90 días, semanas 1–12) es un método distinto que el sitio nuevo no menciona; decidir si conviven o si la sesión se explica con VKTOR (Verify).
14. Tono de la cita "los que le dices a tu compadre": coloquial; revisar contra la voz del sitio.
15. Correo en la fuente: "Contacto@ingeniak.mx" (C mayúscula); en el sitio nuevo va contacto@ingeniak.mx.

---

## 8. Qué dicen los documentos del proyecto sobre la Power Session

- **`materiales/v2/D-arquitectura.md` §15 (pendientes), línea 2132:** "**Power Session (USD 297):** aparece en la guía de marca pero no en este brief. Queda fuera. Si se activa, se agrega `/power-session/` con plantilla T-CONVERSION." Es la única mención en ese documento. T-CONVERSION (línea 104) = navegación reducida (logo + botón), sin mega menú y sin enlaces de salida; hoy solo la usa `/discovery/`.
- **`materiales/v2/build/lanzamiento.md` #8 (decisión abierta, "no se construye"):** Discovery = 30 min sin costo; Power Session = 90 min, USD 297. Si se activa: `/power-session/` con T-CONVERSION, entrada nueva en `src/data/sitemap.json` (y en `navegacion.json` solo si va en el menú), **su precio como constante propia en `src/lib/metrics.ts` (nunca a mano ni con `{{price}}`, que es la inversión mensual "desde USD 997 al mes")** y copy aprobado en `src/content/paginas/`. Hasta entonces no se menciona en ninguna página, `llms*.txt` ni JSON-LD.
- **`materiales/v2/RESPUESTAS-CLIENTE-2026-10-19.md` #8:** Discovery Session = 30 min; Power Session = 90 min; las propuestas deben ser distintas (y distintas del cierre del inicio).
- **`src/data/sitemap.json` (cierre del inicio):** "La Power Session (90 min) es otra oferta con su propia propuesta… no se menciona en el sitio."
- **Cambio del cliente 2026-10-20:** la activa como página **oculta** (landing de campañas, sin menú, `noindex`), con CTA directo a la agenda y el flujo de reserva portado de riklanderos.tech (formulario → horario en vivo de Google Calendar → pago con Stripe → `/agendar/confirmado`). Esto resuelve el punto (a) de lanzamiento.md #8; quedan (b) la propuesta y el copy aprobado y (c) la confirmación de que el cobro sigue siendo USD 297 con Stripe.

### Para el port
- La fuente (Lovable) califica con 4 pantallas y 11 campos; el flujo de riklanderos.tech, según el encargo, es "Reserva en 3 pasos". Hay que decidir qué campos de calificación se conservan (los de §3 son los que hoy alimentan la reserva y van bien para Kommo: giro, tamaño, facturación, horas perdidas, herramientas, objetivo).
- Comportamientos que vale la pena conservar: apartado de 15 min con cuenta regresiva, aviso de `?cancelado=1`, alternativa por WhatsApp cuando la agenda falla, escasez "Quedan N horarios", zona horaria del visitante, `.ics` + Google Calendar en la confirmación, eventos `Lead`/`Schedule`/`InitiateCheckout`, `client_reference_id` + `prefilled_email` en Stripe, `?lm=` para el lead magnet.
