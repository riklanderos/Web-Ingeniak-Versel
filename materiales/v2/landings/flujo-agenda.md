# Flujo de agenda · Discovery Session y Power Session

**Qué es este documento:** el análisis del flujo de reserva que ya funciona en riklanderos.tech y el plan para portarlo a las dos landings ocultas de ingeniak.mx.

- **Proyecto origen:** el proyecto Next.js `/Users/riklanderos/Web Rik Versel/riklanderos-web`. Se leyó sin modificarlo.
- **Fecha:** 2026-10-20.
- **Origen del pedido:** la aclaración del cliente del 2026-10-20. En `/discovery/` y en la Power Session, el CTA primario reserva directo con el mismo flujo de riklanderos.tech. El resto del sitio usa el modal "Cotizar proyecto".

Archivos leídos (rutas relativas a `riklanderos-web/`):
- **Páginas:** `app/discovery/page.tsx`, `app/power-session/page.tsx`, `app/agendar/page.tsx`, `app/agendar/confirmado/page.tsx`, `app/admin/agenda/page.tsx`.
- **API de agenda:** `app/api/agenda/{disponibilidad,reservar,conectar,limpiar}/route.ts`, `app/api/lead/route.ts`.
- **Librerías:** `lib/agenda/{config,booking.server,google.server,connect.server,stripe.server,leads.server}.ts`, `lib/brief/server.ts` (solo el alta), `lib/{sessions,videos,site,supabase-server,analytics}.ts`, `content/leads.ts`.
- **Componentes:** `components/agenda/{BookingPage,BookingFlow,BookingHero}.tsx`, `components/power-session/*`, `components/VslPlayer.tsx`.
- **Base de datos:** `supabase/{schema,power_briefs}.sql`.
- **Configuración:** `vercel.json`, `next.config.ts`, `.env.example`, `README.md`, `package.json` y `package-lock.json`.

---

## 0. Resumen

1. **Los tres pasos son iguales en las dos sesiones.** (1) Tus datos → (2) Horario: próximos 5 días hábiles, leídos en vivo de Google Calendar → (3) Confirmar (Discovery) o Pagar (Power).
   - **Discovery:** se confirma al instante. Se crea el evento con Google Meet y Google le manda la invitación al visitante.
   - **Power:** el horario se aparta 31 min con un evento "pago pendiente" sin invitados. Después se abre Stripe Checkout (297 USD). Al pagar, `/agendar/confirmado` verifica el pago con Stripe y convierte el apartado en la cita real: invitado, Meet y brief.
2. **No hay base de datos de horarios.** Google Calendar es la fuente de verdad: los apartados, su estado y la sesión de Stripe viven en `extendedProperties.private` del evento. Supabase solo guarda el lead.
3. **Autenticación de Google: Vercel Connect (`@vercel/connect` 2.5.2).** Usa el conector OAuth `google/riklanderos-web` a nombre del sujeto fijo `{type:'user', id:'rik'}`. No hay cuenta de servicio ni refresh token en variables. Stripe usa `STRIPE_SECRET_KEY` con `stripe` 19.3.0 y precio en línea (`price_data`, 29 700 centavos USD); no hay Product ni Price en Stripe. **No hay webhook de Stripe.**
4. **Limpieza: un cron de Vercel cada 10 min (`/api/agenda/limpiar`).** Confirma los apartados pagados (cuando el cliente cerró la pestaña) y libera los vencidos. Con `CRON_SECRET`, Vercel manda `Authorization: Bearer …`.
5. **Leads de la agenda: solo Supabase** (`public.leads`, `source = 'discovery' | 'power'`). No pasan por n8n ni por Kommo. El correo a Rik lo dispara un Database Webhook de Supabase en INSERT/UPDATE, configurado fuera del repo. El webhook de n8n (`LEAD_WEBHOOK_URL`) solo lo usa `/api/lead` (otros formularios).
6. **Plan de port: funciones de Vercel en `api/` en la raíz del proyecto.** No se agrega el adaptador de Astro: el build estático de 45 páginas y sus checks no cambian.
   - El componente de reserva pasa a TypeScript sin framework: `BookingFlow.astro` + `src/scripts/agenda/booking.ts`.
   - `/agendar/confirmado/` pasa a ser una página estática que confirma por `fetch`.
   - Se agregan dos rutas nuevas: `confirmar` y `liberar`.
7. **Recursos compartidos (recomendado):** la misma cuenta de Google, los mismos calendarios y la misma cuenta de Stripe que riklanderos.tech, con las mismas propiedades privadas `rl_*`.
   - Así la disponibilidad y el cupo de 4 Power Sessions por semana son uno solo.
   - El cron de riklanderos.tech sirve de respaldo y no se rompe.
   - **Con otra cuenta de Stripe, el cron de riklanderos.tech se cae** (ver §4.2). Esa es la decisión principal que tiene que tomar el cliente.
8. **Leads de la agenda en Ingeniak:** a Kommo, con el mismo módulo del endpoint de cotización. Opcionalmente también a Supabase, para conservar el correo de Rik y el brief.

---

## 1. Flujo de usuario

### 1.1 Estructura de la página en riklanderos.tech

Componente `BookingPage`:
1. **`BookingHero`:** Rik a sangre, "AGENDA TU / {Nombre}", una palabra en brocha y los datos Duración, Inversión y Con. El botón **"Elegir mi horario" → `#agenda`**.
2. **`#video`:** el VSL. Portada con play; el video se descarga solo al hacer clic.
3. **`#agenda`:** retícula de 5/7 columnas.
   - **Columna izquierda, fija:** "Reserva en 3 pasos", "Aparta tu lugar en minutos.", los 3 pasos, "Sales con" y la nota al pie.
   - **Columna derecha:** `BookingFlow`.
4. **Solo en Power:** el resto de la información (ProofBar, Qué es, Entregables, Fit, Cómo funciona, Precio, aviso de Discovery, FAQ, CTA final, JSON-LD `Service`).

Los CTA internos de las dos sesiones apuntan a `/power-session?desde=<sección>` o `/discovery?desde=<sección>`. `?desde=` se guarda como "Origen" en la descripción del evento. Las rutas viejas `/agendar/discovery` y `/agendar/power-session` redirigen con 308 a la página única.

### 1.2 Paso 1 · Tus datos

Formulario con `noValidate`. Se valida con `validateForm(type, form)` de `config.ts`; el servidor repite la misma validación. Al primer error se enfoca el campo.

| Campo (`BookingForm`) | Etiqueta | Regla (cliente = servidor) | Recorte en servidor |
|---|---|---|---|
| `fullName` | Nombre completo | ≥ 3 caracteres | 120 |
| `email` | Correo · "Ahí te llega la invitación con el enlace de Meet." | `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`, ≤ 200 | 200, minúsculas |
| `whatsapp` | WhatsApp · "Con lada. Solo para avisos de tu sesión." | ≥ 10 dígitos | 30 |
| `businessName` | Nombre del negocio | ≥ 2 | 150 |
| `website` | Sitio web o redes (opcional) | ≤ 200 | 200 |
| `industry` | Giro | en `INDUSTRIES` (10 opciones, incluye "Otro") | 60 |
| `teamSize` | Personas en tu equipo | en `TEAM_SIZES`: Solo yo · 2–5 · 6–10 · 11–25 · 26–50 · Más de 50 | 30 |
| `revenue` | Facturación mensual aproximada | en `REVENUES` (6 rangos en MXN, incluye "Apenas voy a empezar") | 60 |
| `timeDrains` *(solo Power)* | ¿Dónde se te va más el tiempo? (hasta 3) | 1 a 3 de `TIME_DRAINS` (9 opciones). Se pintan como botones `aria-pressed`; al llegar a 3 se desactivan los demás | 5 × 60 |
| `tools` *(solo Power)* | ¿Qué herramientas usan hoy? | 2 a 300 | 300 |
| `goal` | Power: "¿Qué quieres resolver en la sesión?" · Discovery: "¿Qué te gustaría lograr con el sistema?" | Power: 20 a 1000 · Discovery: 10 a 600 | 1000 |

Detalles del paso:
- Los campos se agrupan en tres fieldsets: "Sobre ti", "Sobre tu negocio" y "Para preparar la sesión".
- Antispam: el campo trampa es `website_url`, oculto fuera de pantalla con `tabIndex -1`.
- Nota de privacidad junto al botón. El botón dice "Elegir horario".
- Lo escrito se guarda en `sessionStorage['rl_agenda_<tipo>']` en cada cambio y se borra al confirmar.

### 1.3 Paso 2 · Horario

La disponibilidad se pide al montar el componente, en paralelo con el formulario: `GET /api/agenda/disponibilidad?tipo=…`, sin caché.

Reglas de `config.ts`:

| Regla | Valor |
|---|---|
| Zona de operación | `America/Mexico_City`, fija en `-06:00` (México no tiene horario de verano desde 2022) |
| Días | Los próximos **5 días hábiles** (lunes a viernes) a partir de **mañana**. No se descuentan los días festivos: si el calendario los tiene bloqueados, salen ocupados |
| Anticipación mínima | **12 h** |
| Colchón | **15 min** antes y después: un horario se descarta si `[inicio − 15, fin + 15]` choca con algo ocupado |
| Discovery, 30 min | 10:00 · 10:45 · 11:30 · 12:15 · 13:00 · 15:00 · 15:45 · 16:30 (descanso de 13:45 a 15:00) |
| Power, 90 min | 10:00 · 11:45 · 13:30 · 15:15 |
| Cupo Power | **4 por semana** (de lunes a domingo en CDMX). Cuentan los eventos del calendario Power con `rl_tipo=power`, confirmados **y** apartados. Una semana llena devuelve `slots: []` en todos sus días |
| Ocupación | `freeBusy` sobre {calendario Power, calendario Discovery, `primary`} de la cuenta de Google autorizada. Rik atiende las dos sesiones, así que todo se cruza |

Cómo se pinta:
- **Días:** `role="tablist"` con 5 botones (día de la semana abreviado, número y mes). Un día sin horarios sale desactivado con "Lleno". Se elige solo el primer día con lugar.
- **Horarios:** botones `aria-pressed` con la hora CDMX ("10:00 AM"). Si `Intl…resolvedOptions().timeZone` del visitante ≠ CDMX, debajo va "{hora} tu hora".
- **Subtítulo:** "Próximos 5 días hábiles · {min} min · Horarios en hora del centro de México (CDMX)."

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 bloques con `aria-busy` |
| Error | El mensaje del servidor y el botón "Reintentar" |
| Sin horarios, Power | "Esta semana ya no quedan Power Sessions (abro solo 4 por semana). Escríbeme a {correo}…" |
| Sin horarios, Discovery | "No quedan horarios libres en los próximos días. Escríbeme a {correo}…" |

Botones del paso: "Atrás" y "Continuar" (desactivado hasta elegir horario).

### 1.4 Paso 3 · Revisar

Resumen en una lista `<dl>`:
- **Sesión:** "{label} · {min} min · Google Meet".
- **Cuándo:** "Martes 21 de octubre · 10:00 AM (CDMX)" y la hora local si cambia.
- **Para:** "nombre · negocio" y el correo.
- **Costo:** Power: "297 USD · pago único". Discovery: "Sin costo".

Nota para Power: "Te llevo a Stripe para pagar con tarjeta. Tu horario queda apartado 30 minutos mientras pagas (`HOLD_MINUTES − 1`); en cuanto se confirma el pago te llega la invitación con el enlace de Meet."

Botones:
- "Cambiar horario".
- El principal: "Pagar 297 USD" (Power) o "Confirmar mi sesión" (Discovery). Mientras trabaja muestra un spinner y "Abriendo pago…" o "Agendando…".

Se manda `POST /api/agenda/reservar` (contrato en §2.2). Respuestas:

| Respuesta | Qué hace el componente |
|---|---|
| `409 slotTaken` | Borra el horario, avisa "Ese horario se acaba de ocupar. Elige otro, por favor.", recarga la disponibilidad y regresa al paso 2 |
| `422` con `errors` | Pinta los errores y regresa al paso 1 |
| Otro error | Alerta con el mensaje |
| Red caída | "Se perdió la conexión. Inténtalo de nuevo." |

### 1.5 Discovery: confirmación inmediata

1. El servidor vuelve a calcular la disponibilidad y comprueba que el horario siga libre. Si no, responde 409.
2. Inserta el evento en el calendario Discovery:
   - Título: `Discovery Session · {negocio} ({nombre})`.
   - Descripción con todos los datos.
   - Invitado: el visitante.
   - `conferenceData.createRequest` (Meet), `sendUpdates=all` y recordatorios por defecto.
   - Propiedades privadas `rl_tipo=discovery`, `rl_estado=confirmada`, `rl_email`, `rl_nombre`.
3. **Google** le manda la invitación con el Meet. La app no envía ningún correo propio.
4. Después guarda el lead en Supabase. Si Supabase falla, la cita sigue en pie.
5. Responde `{kind:'confirmed', when, meetLink}`.
6. La tarjeta de éxito se pinta en el mismo lugar: palomita, "Listo, {nombre}. Tu Discovery Session quedó agendada.", la fecha (hora del centro de México), "Te envié la invitación… revisa promociones o spam", "Abrir enlace de Meet" (si `hangoutLink` llegó) y "Volver al inicio".

### 1.6 Power: apartado → Stripe → confirmado o cancelado

1. **Apartado:** se valida el horario, igual que en Discovery (incluye el cupo semanal). Se inserta en el calendario Power:
   - Título: `[Apartado · pago pendiente] Power Session · {negocio}`.
   - Sin invitados, `sendUpdates=none`.
   - Propiedades privadas `rl_tipo=power`, `rl_estado=pendiente`, `rl_email`, `rl_nombre`.
2. **Checkout** (`stripe.checkout.sessions.create`):
   - `mode:'payment'`, `customer_email`, `locale:'es-419'`.
   - Concepto en línea: USD 29 700 centavos, nombre "Power Session · 90 min 1:1 con Rik Landeros" y como descripción el horario "(hora del centro de México)".
   - `expires_at = ahora + 31 min`. Stripe exige un mínimo de 30 min; por eso **no se pueden prometer 15 min**, como dice hoy agenda.ingeniak.tech.
   - `metadata {rl_event, rl_tipo:'power', rl_inicio}` y `payment_intent_data.description = "Power Session · {negocio} · {horario}"`.
   - `success_url = {base}/agendar/confirmado?session_id={CHECKOUT_SESSION_ID}`.
   - `cancel_url = {base}/power-session?pago=cancelado&apartado={eventId}`.

   Después se hace PATCH del apartado para agregar `rl_stripe = cs_…`. Si Stripe falla, se borra el apartado y la reserva responde 503. El lead se guarda con `payment_status='pendiente'` y `stripe_session_id`. La respuesta es `{kind:'checkout', url}` y el navegador hace `location.assign(url)`.
3. **Pago exitoso** (`/agendar/confirmado?session_id=cs_…`, renderizada en servidor, `noindex`):
   - Valida el formato `^cs_(live|test)_[A-Za-z0-9]+$`.
   - `confirmFromCheckout`: `stripe.checkout.sessions.retrieve`, toma `metadata.rl_event` y revisa `payment_status === 'paid'`.
   - `markBookingPaid` en Supabase. Se escribe una sola vez (pendiente o expirado → pagado) para no disparar dos veces el webhook del correo.
   - `confirmPower(eventId)`, idempotente:
     1. `ensureBrief` crea o recupera el brief en `power_briefs` y arma la URL `https://www.riklanderos.tech/brief/<token>`.
     2. Si ya está `confirmada`, solo devuelve los datos.
     3. Si no, hace PATCH: título `Power Session · {negocio} ({nombre})`, descripción con la línea del brief al inicio e inserta "Pago confirmado en Stripe." antes de "\n\nAgendado desde", invitado = `rl_email`, Meet, `sendUpdates=all` y `rl_estado=confirmada`. **Google** manda la invitación.
   - Estados de la página:

     | Estado | Qué muestra |
     |---|---|
     | **ok** | "Pago recibido · Tu Power Session quedó confirmada.", la fecha (hora del centro de México), "Te envié la invitación… y Stripe te manda el recibo por separado", la tarjeta "Siguiente paso · 8–10 min · Llenar mi brief" y los botones Meet e Inicio |
     | **pending** (`payment_status ≠ paid`) | "Tu pago todavía se está procesando…" y el correo |
     | **error** | "No pude confirmar tu sesión desde aquí…" y el enlace "Volver a la agenda" (`/power-session#agenda`) |
4. **Pago cancelado** (`/power-session?pago=cancelado&apartado=<id>`, `force-dynamic`):
   - Con el id validado (`^[a-z0-9_-]{5,1024}$`i), el servidor llama a `releaseHold` **antes** de pintar la disponibilidad:
     - Lee el evento. Si da 404 o 410, solo marca el lead como expirado.
     - Si ya está `confirmada`, no lo toca.
     - Si está `pendiente`, consulta la sesión de Stripe: si sí pagó, la confirma. Si sigue `open`, la expira. Marca el lead como expirado y borra el evento.
   - En el cliente:
     - Aviso: "Cancelaste el pago y tu horario quedó libre. Puedes elegir el mismo u otro."
     - Si los datos guardados en `sessionStorage` son válidos, salta directo al paso 2.
     - Limpia la URL con `history.replaceState` y baja al formulario.
5. **Sin regreso:** si el cliente pagó y cerró la pestaña, el cron (§2.8) confirma la cita en ≤ 10 min. Si no pagó, el cron libera el horario cuando vence el Checkout, unos 31 a 41 min después.

### 1.7 Correos e invitaciones

| Destinatario | Correo | Quién lo envía |
|---|---|---|
| Visitante | Invitación de Google Calendar con el Meet. Discovery: al reservar. Power: al confirmar el pago. Más los recordatorios por defecto del calendario | Google, desde el calendario de Rik (`sendUpdates=all`) |
| Visitante (Power) | Recibo de pago | Stripe, si "Successful payments" está activo en la cuenta |
| Rik | Aviso de lead nuevo o pagado | Database Webhook de Supabase sobre `leads` (INSERT y UPDATE). Se configura en Supabase; no está en el código |
| Rik | El evento en su calendario y el brief | Google Calendar y Supabase |

- **No hay** correos transaccionales propios: ni Resend, ni SMTP, ni plantillas.
- Si el visitante rechaza o cancela desde su calendario, la app no se entera: el evento sigue ocupando el horario hasta que alguien lo borra a mano.

### 1.8 Persistencia, atribución, antispam y medición

- **Atribución:**
  - Los `utm_*` de la URL se guardan en `sessionStorage['rl_utm']`; si la URL no trae, se leen de ahí. También se envían `referrer` (solo si es externo), `page_path` y `zona` (zona horaria del navegador).
  - `origen` = "Sección: {desde} · utm_source · utm_campaign · utm_content". Va en la descripción del evento como "Origen: …" y en `details.origin` del lead.
- **Antispam:** campo trampa `website_url` y `elapsed_ms < 2500` → 400 "No pudimos procesar la solicitud." No hay límite de envíos en `reservar`; `/api/lead` sí tiene uno en memoria.
- **Medición** (`track()` → gtag, fbq y dataLayer):

  | Evento | Cuándo |
  |---|---|
  | `booking_view {tipo, desde}` | Al cargar el componente |
  | `booking_step {tipo, step}` | Al cambiar de paso |
  | `booking_submit` | Discovery: al confirmar |
  | `booking_checkout_start` | Power: al ir a pagar |
  | `booking_confirmed` | Al quedar confirmada |

  El VSL emite `video_play`, `video_progress` (25/50/75) y `video_complete`.

---

## 2. Backend

### 2.1 Módulos

| Módulo | Qué hace |
|---|---|
| `lib/agenda/config.ts` | Reglas, opciones, `validateForm` y fechas (`cdmxToIso`, `cdmxDateKey`, `bookableDates`, `formatDayEs`, `formatTimeEs`, `formatSlotEs`). Lo usan **el navegador y el servidor** |
| `lib/agenda/booking.server.ts` | `availability`, `reserve`, `confirmPower`, `confirmFromCheckout`, `releaseHold`, `sweepHolds` y `calendarFor` |
| `lib/agenda/google.server.ts` | REST de Calendar v3 con `fetch`, sin SDK: `listCalendars`, `freeBusy`, `listEvents`, `getEvent`, `insertEvent`, `patchEvent` y `deleteEvent` |
| `lib/agenda/connect.server.ts` | Token de Google con Vercel Connect, URL de autorización e `isAdminHost` |
| `lib/agenda/stripe.server.ts` | `new Stripe(STRIPE_SECRET_KEY)` y `stripeLive()` |
| `lib/agenda/leads.server.ts` | Supabase `leads`: `recordBookingLead`, `markBookingPaid`, `markBookingExpired` y `markBookingExpiredByEvent`. Tiempo límite de 5 s; **nunca lanza** y los logs no llevan datos personales |
| `lib/brief/server.ts` | `ensureBrief` y `briefUrl`: el brief posterior al pago, en la tabla `power_briefs` y el bucket `power-briefs` |

### 2.2 Contratos de API

Todas las rutas usan `runtime='nodejs'` y `dynamic='force-dynamic'`.

**`GET /api/agenda/disponibilidad?tipo=power|discovery`**

| Código | Cuerpo |
|---|---|
| 200 | `{ ok:true, days:[{ date:'YYYY-MM-DD', slots:['2026-10-21T16:00:00.000Z', …] }] }` (5 días), `cache-control: no-store` |
| 400 | `{ ok:false, error:'Tipo inválido' }` |
| 503 | `{ ok:false, error:'No pude leer la agenda en este momento. Inténtalo en unos minutos o escríbeme a hola@riklanderos.com.' }`. Pasa con un conector sin autorizar, un calendario sin configurar o Google caído |

**`POST /api/agenda/reservar`** con `application/json`:

```json
{
  "tipo": "discovery|power",
  "form": { "fullName":"", "email":"", "whatsapp":"", "businessName":"", "website":"", "industry":"",
            "teamSize":"", "revenue":"", "timeDrains":[], "tools":"", "goal":"" },
  "start": "ISO UTC de un horario devuelto por disponibilidad",
  "origen": "Sección: hero · google · campaña · anuncio | null",
  "atribucion": { "utm_source":"", "utm_medium":"", "utm_campaign":"", "utm_content":"", "utm_term":"",
                  "referrer":"", "page_path":"/discovery", "zona":"America/Bogota" },
  "website_url": "",
  "elapsed_ms": 48231
}
```

| Código | Cuerpo |
|---|---|
| 200, Discovery | `{ ok:true, kind:'confirmed', when:'Martes 21 de octubre · 10:00 AM', meetLink:'https://meet.google.com/…'│null }` |
| 200, Power | `{ ok:true, kind:'checkout', url:'https://checkout.stripe.com/c/pay/cs_…' }` |
| 400 | JSON inválido, bot o tipo inválido |
| 422 | `{ ok:false, error:'Revisa los campos marcados.', errors:{campo:mensaje} }` o `{ ok:false, error:'Elige un horario.' }` |
| 409 | `{ ok:false, error:'Ese horario se acaba de ocupar. Elige otro, por favor.', slotTaken:true }` |
| 503 | `{ ok:false, error:'No pude completar la reserva. Inténtalo de nuevo o escríbeme a hola@riklanderos.com y te agendo yo.' }` |

Notas:
- El texto del servidor se limpia: caracteres de control fuera y recorte por campo.
- `baseUrl` = `https://{host}` cuando el host es interno de Vercel (`isAdminHost`); en los demás casos, `SITE.url` (`https://www.riklanderos.tech`).

**`GET /api/agenda/limpiar`** (Vercel Cron)
- Si existe `CRON_SECRET`, exige `Authorization: Bearer <CRON_SECRET>`; sin él responde 401.
- 200: `{ ok:true, revisados, confirmados, liberados }`. 500: `{ ok:false }`.

**`GET /api/agenda/conectar?servicio=google|stripe`** (administración)
- Solo responde en hosts internos de Vercel o en localhost; en los demás, 404.
- Hace 302 a la URL de autorización de Vercel Connect (`prompt:'consent'` en Google) y regresa a `/admin/agenda?conectado=…`.

**Lógica de servidor dentro de páginas**
- `/agendar/confirmado?session_id=` llama a `confirmFromCheckout`.
- `/power-session?pago=cancelado&apartado=` llama a `releaseHold`.

En el sitio estático de Astro estas dos llamadas pasan a ser rutas de API (§4.5).

### 2.3 Google Calendar

- **Autenticación:** `getToken('google/riklanderos-web', { subject:{type:'user', id:'rik'}, scopes:['https://www.googleapis.com/auth/calendar'] })` de `@vercel/connect`.
  - El SDK autentica **al proyecto de Vercel que llama** con `@vercel/oidc` (`VERCEL_OIDC_TOKEN`, que Vercel inyecta en ejecución) y cambia ese token por el de Google que Connect tiene guardado. Connect hace el refresh solo.
  - El permiso se otorgó **una vez** desde `/admin/agenda` → `/api/agenda/conectar?servicio=google`.
  - Por defecto, `@vercel/connect` **solo usa conectores vinculados al proyecto** (README del paquete).
  - El conector `stripe/riklanderos-web` existe, pero no sirve para cobrar (solo da acceso al MCP). Por eso Stripe usa la llave secreta.
- **Endpoints usados** (`https://www.googleapis.com/calendar/v3`):

  | Endpoint | Para qué |
  |---|---|
  | `GET /users/me/calendarList` | Solo administración |
  | `POST /freeBusy` | `timeZone: America/Mexico_City` e `items` de los 3 calendarios |
  | `GET /calendars/{id}/events` | Con `singleEvents=true`, `maxResults=250`, `privateExtendedProperty=k=v` repetible y sin los cancelados |
  | `GET /calendars/{id}/events/{eventId}` | Leer un evento |
  | `POST /calendars/{id}/events` | Insertar, con `conferenceDataVersion=1` y `sendUpdates=all` (si hay invitado) o `none` |
  | `PATCH /calendars/{id}/events/{eventId}` | Manda el cuerpo completo, con los mismos parámetros |
  | `DELETE /calendars/{id}/events/{eventId}` | Con `sendUpdates=none`; 404 y 410 cuentan como éxito |

- **Cuerpo del evento:** `summary`, `description`, `start/end {dateTime, timeZone:CDMX}`, `attendees` ([] o el visitante), `extendedProperties.private`, `reminders.useDefault` y, con Meet, `conferenceData.createRequest {requestId:'rl-<uuid>', conferenceSolutionKey:{type:'hangoutsMeet'}}`. El enlace sale en `hangoutLink`.
- **Propiedades privadas** (el contrato entre reservar, confirmar, liberar y el cron):

  | Clave | Valores |
  |---|---|
  | `rl_tipo` | `power` o `discovery` |
  | `rl_estado` | `pendiente` (solo apartados de Power) o `confirmada` |
  | `rl_stripe` | `cs_…` |
  | `rl_email` | Correo del visitante |
  | `rl_nombre` | Nombre del visitante |

- **Descripción** (Rik la lee antes de la llamada), en este orden:
  1. "{label} · {min} min" y una línea en blanco.
  2. Nombre, Correo, WhatsApp, Negocio, Sitio / redes (si hay), Giro, Equipo y Facturación mensual.
  3. Solo Power: "Dónde se le va el tiempo" y "Herramientas que usan hoy".
  4. "Qué quiere resolver:" y el texto.
  5. "Origen: …" (si hay).
  6. **"\n\nAgendado desde {SITE.url}"**. `confirmPower` busca exactamente ese marcador.
- **Calendarios:** `POWER_CALENDAR_ID` y `DISCOVERY_CALENDAR_ID` vienen de variables de entorno; los IDs se copian de `/admin/agenda`. La ocupación se calcula con esos dos y `primary`.

### 2.4 Stripe

- SDK `stripe` **19.3.0**, que fija la API `2025-10-29.clover`. Llave `STRIPE_SECRET_KEY` (`sk_live_`, `sk_test_` o `rk_` restringida); `stripeLive()` dice si es real.
- Llamadas:

  | Llamada | Dónde |
  |---|---|
  | `checkout.sessions.create` | Parámetros en §1.6 |
  | `checkout.sessions.retrieve` | Confirmado, liberar y cron |
  | `checkout.sessions.expire` | Liberar y cron, si sigue `open` |
  | `checkout.sessions.list({limit:1})` y `accounts.retrieve()` | Prueba de la llave en `/admin/agenda` |

- **No hay** Product, Price, Payment Link, webhook ni cupones. El precio vive en `POWER_PRICE_CENTS = 29700` y `POWER_CURRENCY = 'usd'`.

### 2.5 Supabase

**`public.leads`** (`supabase/schema.sql`):
- RLS activado y sin políticas; se escribe solo con la service role.
- Columnas que usa la agenda:

  | Columna | Contenido |
  |---|---|
  | `name`, `email`, `phone` | El WhatsApp va en `phone` |
  | `business` | Nombre del negocio |
  | `revenue_range` | Solo se mapean 3 rangos: `lt-100k`, `100k-300k`, `300k-1m`. Los demás quedan en null y el texto exacto va en `details.revenue` |
  | `source` | `'discovery'` o `'power'` |
  | `message` | `goal` |
  | `session_start` | Inicio de la sesión |
  | `details` | jsonb con el formulario completo, `slot`, `origin`, `timezone`, `eventId` y `visitorTimezone` |
  | `referrer`, `page_path`, `utm_*` | Atribución |
  | `payment_status` | Solo Power: `pendiente` → `pagado` o `expirado` |
  | `stripe_session_id` | Sesión de Checkout |

- Índices por `created_at`, `source` y `lower(email)`.

**`public.power_briefs`** (`supabase/power_briefs.sql`):
- Un renglón por Power Session pagada, único por `event_id`.
- `token` secreto de 32 a 128 caracteres, `answers` y `transcripts` en jsonb.
- Bucket privado `power-briefs` de 50 MB.
- El formulario del brief vive en `riklanderos.tech/brief/<token>`. Las transcripciones usan el AI SDK con `openai/gpt-4o-mini-transcribe` por AI Gateway.

### 2.6 A dónde van los leads

- **Agenda:** Supabase `leads`, y nada más. El aviso a Rik lo dispara un webhook de base de datos de Supabase.
- **Otros formularios** (`/api/lead`: radikales, recursos, contacto): Supabase y luego n8n (`LEAD_WEBHOOK_URL`, con `x-webhook-secret` opcional).
  - Payload `{event:'lead.created', site:'riklanderos.tech', tag, tags:[tag,'origen:…','web:riklanderos'], …}`.
  - n8n lo manda a Kommo o GHL.
  - En desarrollo, sin destinos, responde ok. En producción, sin destinos, responde 503.

### 2.7 Cron y limpieza

`vercel.json`: `{"crons":[{"path":"/api/agenda/limpiar","schedule":"*/10 * * * *"}]}`. Un cron cada 10 min requiere plan Pro: en Hobby, los crons corren como máximo una vez al día.

`sweepHolds`:
1. Lista los eventos del calendario Power con `rl_estado=pendiente`, de **ahora − 1 día** a **ahora + 21 días**.
2. Procesa cada uno:

   | Caso | Qué hace |
   |---|---|
   | Sin `rl_stripe` | Lo marca como expirado y lo borra |
   | Pagado | `confirmPower` |
   | `expired`, o `open` con `expires_at` ya vencido | Expira el Checkout, marca el lead como expirado y borra el evento |

> **Riesgo de diseño:** el ciclo no tiene try/catch por evento. Un `retrieve` que falle (por ejemplo, una sesión de otra cuenta de Stripe) aborta todo el barrido. Esto pesa en §4.2.

### 2.8 Administración

`/admin/agenda` solo existe en `riklanderos-<hash>-ingeniak.vercel.app`, `riklanderos-web(-git-main)-ingeniak.vercel.app` y localhost; esas URLs las protege Vercel Authentication del equipo **ingeniak**. La página:
- Muestra el estado de Google (cuántos calendarios ve) y de Stripe (cuenta y modo real o de prueba).
- Tiene el botón "Conectar Google Calendar".
- Lista los calendarios con permiso de escritura y su ID.
- **Los IDs se pegan a mano** en las variables de entorno.

---

## 3. Variables de entorno, servicios y versiones

### 3.1 Variables que lee la agenda (riklanderos-web)

| Variable | Dónde se usa | Notas |
|---|---|---|
| `POWER_CALENDAR_ID` | `calendarFor('power')` | ID del calendario de Google. Sin ella → `AgendaConfigError` y 503 |
| `DISCOVERY_CALENDAR_ID` | `calendarFor('discovery')` | Igual |
| `STRIPE_SECRET_KEY` | `stripe.server.ts` | **Secreta** |
| `SUPABASE_URL` | `supabase-server.ts` | Sin ella, los leads no se guardan; la reserva sigue funcionando |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase-server.ts` | **Secreta**; se salta RLS |
| `CRON_SECRET` | `limpiar` | Opcional, pero recomendada. Vercel la manda sola en el header del cron |
| `NODE_ENV` | `isAdminHost` | — |
| `VERCEL_OIDC_TOKEN` *(implícita)* | `@vercel/oidc`, `@vercel/connect` | La inyecta Vercel. En local sale de `vercel env pull` |
| `VERCEL_REGION` *(implícita)* | `@vercel/connect` | Región de Connect |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | Solo `/api/lead` | No los usa la agenda |
| *(AI Gateway, implícita por OIDC)* | Solo el brief (transcripción) | — |

Constantes en el código que el port tiene que respetar o decidir:
- Los UID de conector `google/riklanderos-web` y `stripe/riklanderos-web`.
- El sujeto `rik`.
- `SITE.url = https://www.riklanderos.tech` y `SITE.email = hola@riklanderos.com`.
- `SITE.powerSessionPrice = "297 USD"`.

### 3.2 Servicios externos

| Servicio | Uso |
|---|---|
| Google Calendar API v3 + Google Meet | Cuenta de Rik |
| Vercel Connect | Bóveda OAuth de Google, ligada al proyecto riklanderos-web del equipo ingeniak |
| Vercel Cron | Plan Pro |
| Stripe Checkout | Cuenta de Rik |
| Supabase | Postgres + Storage + Database Webhook → correo |
| Vercel AI Gateway | Solo el brief |

### 3.3 Paquetes (versión instalada en `node_modules`)

| Paquete | Versión | Notas |
|---|---|---|
| `@vercel/connect` | **2.5.2** | Depende de `@vercel/oidc` 4.0.1, que pide Node ≥ 20. Sus peers (`ai`, `@auth/core`, MCP SDK, `better-auth`, `eve`, `@chat-adapter/slack`) son **opcionales** |
| `stripe` | **19.3.0** | API `2025-10-29.clover` |
| `@supabase/supabase-js` | **2.118.0** | — |
| `ai` | 6.0.309 | Solo el brief; no hace falta en el port |
| `next` | 15.5.28 | — |
| `react` | 19.1.0 | — |
| `motion` | 14.3.0 | — |
| `clsx` | — | Solo la UI de React; no se porta |

### 3.4 Archivos de video

| Archivo | Ubicación | Datos | Uso en el port |
|---|---|---|---|
| `vsl-power-session.mp4` | `public/video/` de riklanderos | 33.6 MB, 2:17, "La factura invisible", faststart | No se recomienda; ver la nota debajo |
| `vsl-discovery-session.mp4` | `public/video/` de riklanderos | 52.2 MB, 3:27, "La silla vacía", faststart | No se recomienda; ver la nota debajo |
| `vsl-power-session-poster.webp`, `vsl-discovery-session-poster.webp` | `public/img/` de riklanderos | 1600 × 900 | No se recomienda |
| `discovery-vsl-720.mp4` | Ingeniak (ya existe) | 12.8 MB, 3:00 | Ya es la versión R14 de `discovery-session-vsl.mp4` de agenda.ingeniak.tech (29.8 MB). Se usa para Discovery |
| `powersession-vsl.mp4` | agenda.ingeniak.tech | 29.3 MB, unos 3:01, portada "FACTURA INVISIBLE" | Para Power hay que aplicarle R14: 720p H.264 con faststart, ≤ 12 MB, `.vtt` y póster propio. **Descargarlo requiere el visto bueno del usuario.** En esta Mac no hay ffmpeg; sí hay `/usr/bin/avconvert` |

**Nota:** los dos videos de riklanderos son de la marca personal de Rik. Como las landings toman su contenido de agenda.ingeniak.tech, se recomiendan los VSL de ese sitio: `discovery-vsl-720.mp4` para Discovery y `powersession-vsl.mp4` para Power.

---

## 4. Plan de port a Astro (ingeniak.mx, estático en Vercel)

### 4.1 Arquitectura: funciones de Vercel en `api/` en la raíz, sin adaptador

| Opción | A favor | En contra |
|---|---|---|
| **`api/**/*.ts` en la raíz (recomendada)** | No toca `astro.config.mjs`, `dist/`, `sinDemos`, `postbuild`/`check.mjs` ni las redirecciones y headers de `vercel.json`. Las funciones usan la firma Web (`export async function GET(req: Request)` / `POST`) en Node. Las crons apuntan a `/api/...` | `astro dev` no sirve `/api`: en local se usa el modo demo (§4.12). Hay que verificar en el primer Preview que Vercel detecte `api/` con el preset de Astro. Ver los detalles debajo |
| `@astrojs/vercel` con `prerender=false` | Endpoints "a la Astro" | Cambia **todo** el build a Build Output API (salida en `.vercel/output`). Eso rompe los checks que leen `dist/` y obliga a revisar cómo conviven `vercel.json` y las rutas del adaptador. Demasiado riesgo para un sitio ya aprobado |

Detalles de la opción recomendada:
- **Verificación en el primer Preview:** `curl -i https://<preview>/api/agenda/disponibilidad/?tipo=discovery` debe responder JSON y no 404. Si Vercel no levanta las funciones con el preset de Astro, el plan B es el adaptador; las funciones se mueven tal cual a `src/pages/api/*`.
- **Endpoint de cotización:** debe ir en el mismo lugar (`api/cotizar.ts`) y compartir `api/_lib/kommo.ts`.
- **Detalles de Vercel que hay que respetar:**
  - Las carpetas y archivos con `_` dentro de `api/` **no** se publican como funciones; ahí va el código compartido (`api/_lib/…`).
  - `package.json` tiene `"type":"module"`, así que las funciones son ESM. Los imports relativos dentro de `api/` van **con extensión `.js`** (`import { reserve } from '../_lib/agenda/booking.js'`), aunque el fuente sea `.ts`. Comprobarlo con el Preview.
  - `vercel.json` tiene `trailingSlash: true`, así que todas las llamadas usan barra final: `/api/agenda/disponibilidad/?tipo=…`, `/api/agenda/reservar/`, el cron `/api/agenda/limpiar/` y `success_url` `/agendar/confirmado/?session_id=…`. Así se evita el 308. Comprobar en el Preview que la función responde con barra final.
  - Duración: `export const maxDuration = 30` en `reservar`, `confirmar` y `limpiar` (hacen varias llamadas a Google y a Stripe). Node 24.x en el proyecto.

### 4.2 Recursos compartidos con riklanderos.tech

**Opción A, recomendada: todo compartido.** Encaja con "el mismo flujo que integramos en riklanderos.tech" y con la misma Power Session de Rik.
- **Google:** el mismo conector `google/riklanderos-web`, **vinculado también** al proyecto de Vercel de Ingeniak, y el mismo sujeto `rik`.
  - Mismos `POWER_CALENDAR_ID` y `DISCOVERY_CALENDAR_ID`, y `primary` en la ocupación.
  - Resultado: una sola disponibilidad para los dos sitios y **un solo cupo de 4 Power por semana**. Los dos cuentan `rl_tipo=power` en el mismo calendario.
- **Stripe:** la misma cuenta (`STRIPE_SECRET_KEY` de Rik, idealmente una llave restringida `rk_live_` con escritura en Checkout Sessions) y el mismo concepto en línea (29 700 centavos USD). **No hay Product ni Price que compartir.** Nombre del concepto: "Power Session · 90 min 1:1 con Rik Landeros". El Checkout muestra el nombre y la marca de esa cuenta.
- **El cron de riklanderos.tech** barre también los apartados de Ingeniak y los confirma o libera bien, porque la llave sirve para sus sesiones. Funciona como respaldo.
- **Contrato de compatibilidad.** El port **debe** respetar estos puntos para que el código de riklanderos procese bien los eventos de Ingeniak:
  1. **Propiedades privadas:** `rl_tipo`, `rl_estado` (`pendiente` o `confirmada`), `rl_stripe`, `rl_email` y `rl_nombre`, con los mismos valores. Se agregan `rl_sitio=ingeniak` e `ik_kommo=<id del lead>`; riklanderos las conserva porque copia `...props` al hacer PATCH.
  2. **Títulos:**
     - Apartado: exactamente `[Apartado · pago pendiente] Power Session · {negocio}`. riklanderos obtiene el negocio con `split('Power Session · ')[1]` y quita el `(…)` final.
     - Confirmada: `Power Session · {negocio} ({nombre})`.
     - Discovery: `Discovery Session · {negocio} ({nombre})`.
  3. **Descripción:** debe terminar en **`\n\nAgendado desde https://ingeniak.mx`**. El confirmador inserta "Pago confirmado en Stripe." antes de ese marcador.
  4. **Stripe:** `metadata.rl_event = <eventId>` (y `rl_tipo`, `rl_inicio`). Se agrega `rl_sitio`. `expires_at` ≥ 30 min: usar 31.
- **Brief:** si riklanderos confirma un apartado de Ingeniak, crea el brief en **su** Supabase y pone en la invitación `https://www.riklanderos.tech/brief/<token>`. Para que la experiencia no dependa de quién confirme:
  - **(A1, recomendada):** Ingeniak usa el mismo Supabase (`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`) y porta solo `ensureBrief` y `briefUrl`. La página del brief se queda en riklanderos.tech. `/agendar/confirmado/` muestra "Llenar mi brief" igual que el original.
  - **(A2):** sin brief en Ingeniak. Se acepta que, cuando confirme el cron de riklanderos (el visitante no regresó de Stripe), sí aparezca el link del brief.
- **Supabase `leads` (opcional, con A1):** insertar también las reservas de Ingeniak (`source` `discovery` o `power`, `details.site='ingeniak'`, `page_path` de la landing). Así Rik recibe el mismo correo del webhook y `markBookingPaid` y `markBookingExpired` funcionan desde cualquiera de los dos sitios.

**Opción B, si Ingeniak debe cobrar en su propia cuenta de Stripe.** Hoy agenda.ingeniak.tech cobra con un Payment Link de una cuenta que no está identificada.
- Las sesiones de Stripe de Ingeniak **no deben** quedar en el calendario Power de riklanderos con `rl_estado=pendiente`. El cron de riklanderos haría `retrieve` con su llave, Stripe respondería "No such checkout.session" y **todo su barrido se caería** (no hay try/catch por evento).
- Se usan propiedades propias `ik_tipo`, `ik_estado`, `ik_stripe`, …, y los eventos se crean en un calendario que riklanderos ya incluye en su ocupación (Power, Discovery o `primary`). riklanderos ve el horario ocupado pero ignora el evento.
- El cupo de 4 por semana solo se puede aplicar del lado de Ingeniak, sumando `rl_tipo=power` y `ik_tipo=power`. riklanderos seguiría contando solo los suyos, así que entre los dos sitios podrían venderse más de 4 por semana.
- Ingeniak necesita su cron obligatorio, su `STRIPE_SECRET_KEY` y su conector o permiso de Google (que puede ser el mismo).

**Decisión del cliente:** qué cuenta de Stripe recibe los pagos de la Power Session desde ingeniak.mx (A o B), y si se comparte Supabase (A1 o A2).

### 4.3 Archivos a crear

Los dueños de área son los de CONVENCIONES.md. Las rutas son relativas a la raíz del proyecto Ingeniak.

| Archivo | Área | Contenido |
|---|---|---|
| `src/lib/agenda/config.ts` | orquestador | Port de `config.ts` sin cambios de reglas, más:<br>• `LANDING = { discovery:'/discovery/', power:'/power-session/' }` (o la ruta que se elija)<br>• `CONFIRM_PATH = '/agendar/confirmado/'`<br>• `SITE_URL = 'https://ingeniak.mx'`<br>• `CONTACT = { email:'contacto@ingeniak.mx', wa: SITE.waBase }`<br>• el precio de Power como dato confirmado; ver §4.15<br>Debe ser **TS puro**, sin Node, para que lo importen Vite (navegador) y las funciones. Por los imports ESM con `.js` desde `api/`, conviene que se pueda importar con extensión: comprobarlo en el Preview; si falla, se mueve a `api/_lib/agenda/config.ts` y el navegador lo importa desde ahí |
| `api/_lib/agenda/connect.ts` | agenda (nueva) | `getToken` de `@vercel/connect`.<br>• UID: `process.env.AGENDA_GOOGLE_CONNECTOR ?? 'google/riklanderos-web'`<br>• sujeto `{type:'user', id: process.env.AGENDA_GOOGLE_SUBJECT ?? 'rik'}`<br>• permiso `calendar` y `AgendaConfigError` |
| `api/_lib/agenda/google.ts` | agenda | Copia de `google.server.ts`; usa el `fetch` de Node y `crypto.randomUUID()` globales. Se agrega `patchPrivate(cal, id, props)`: un PATCH mínimo `{extendedProperties:{private:{…mapa completo}}}` con `sendUpdates=none` |
| `api/_lib/agenda/stripe.ts` | agenda | Copia de `stripe.server.ts` |
| `api/_lib/agenda/booking.ts` | agenda | Port de `booking.server.ts`:<br>• `baseUrl()` según `VERCEL_ENV` (§4.9)<br>• `rl_sitio`; descripción con "Agendado desde https://ingeniak.mx"<br>• rutas de Ingeniak y textos con la voz de Ingeniak ("Te enviamos…", contacto@ingeniak.mx)<br>• con A1, `ensureBrief`<br>• `sweepHolds` con **try/catch por evento** (mejora sobre el original) y la sincronización de Kommo (§4.10) |
| `api/_lib/agenda/leads.ts` | agenda | Kommo (§4.10), más Supabase `leads` con A1 (port de `leads.server.ts`; mismo mapeo `REVENUE_CODE`). Nunca lanza; tiempo límite de 5 s; logs sin datos personales |
| `api/_lib/agenda/brief.ts` *(solo A1)* | agenda | `ensureBrief` y `briefUrl` (`https://www.riklanderos.tech/brief/<token>`) copiados de `lib/brief/server.ts`: solo el alta, sin transcripción |
| `api/_lib/http.ts` | agenda/cotización | `json(body, status)` con `cache-control: no-store`, saneo `str()` y `text()`, lectura segura de JSON con tope de bytes y límite de envíos (opcional, como `/api/lead`) |
| `api/_lib/kommo.ts` | **cotización** (otra tarea) | Cliente de Kommo compartido. La agenda solo lo importa |
| `api/agenda/disponibilidad.ts` | agenda | `GET`, mismo contrato que §2.2 |
| `api/agenda/reservar.ts` | agenda | `POST`, mismo contrato que §2.2 |
| `api/agenda/confirmar.ts` | agenda (**nueva**) | `POST {session_id}` → `confirmFromCheckout` (§4.5) |
| `api/agenda/liberar.ts` | agenda (**nueva**) | `POST {apartado}` → `releaseHold` (§4.5) |
| `api/agenda/limpiar.ts` | agenda | `GET` del cron, con `CRON_SECRET` |
| `api/agenda/estado.ts` *(opcional)* | agenda | Solo si `VERCEL_ENV !== 'production'`: `{google:'ok'│'error', stripe:'ok'│'error', live:boolean, calendarios:{power:boolean, discovery:boolean}, kommo:'ok'│'error'}`. Sin secretos ni IDs. Para que el cliente compruebe su configuración en el Preview |
| `src/components/agenda/BookingFlow.astro` | páginas/ui | Marcado del componente (§4.6) con `data-agenda="discovery│power"`. Las opciones salen de `config.ts` en el build |
| `src/components/agenda/BookingSection.astro` | páginas | Sección `#agenda`: columna izquierda fija (el texto viene del JSON de copy de la página) y `BookingFlow` |
| `src/scripts/agenda/booking.ts` | páginas/ui | La máquina de estados en TypeScript sin framework (§4.6). Se carga con `import()` solo si existe `[data-agenda]` |
| `src/scripts/agenda/demo.ts` | páginas/ui | Modo demo, solo en desarrollo (§4.12) |
| `src/pages/agendar/confirmado/index.astro` + `src/scripts/agenda/confirmado.ts` | páginas | Página oculta de confirmación (§4.8) |
| Estilos | ui y páginas | **ui** (`ui.css`): las primitivas de formulario (`.fld`, input, select, textarea, chips de selección, error, contador), **compartidas con el modal de cotización** para que se vean iguales. **Páginas** (`pages.css`, bloque `/* ===== agenda ===== */`): pasos, días, horarios, resumen y confirmación |
| `vercel.json` | orquestador | Crons y headers (§4.11) |
| `package.json` | orquestador | Dependencias (§4.4) |
| `src/data/sitemap.json` | orquestador | `/power-session/` y `/agendar/confirmado/` con `indexable:false`, fuera de `navegacion.json`, del índice ⌘K y de `llms.txt`. `/discovery/` pasa a ser oculta según el pedido |

No se portan:
- `/admin/agenda` y `/api/agenda/conectar`. Las conexiones se administran desde riklanderos.tech; solo se portan si en el Preview resulta que el permiso de Connect no se comparte entre proyectos (§4.14).
- `ProofBar`: trae logos de Coca-Cola, Nike, BMW y Cemex, y cifras escritas a mano. Las reglas de marca lo prohíben.
- El resto de los componentes de React y `motion`.

### 4.4 Dependencias a agregar (versiones exactas)

```json
"dependencies": {
  "@vercel/connect": "2.5.2",
  "stripe": "19.3.0",
  "@supabase/supabase-js": "2.118.0"
}
```

- `@supabase/supabase-js` solo hace falta con A1 o si se guardan los leads en Supabase.
- `@vercel/connect` trae `@vercel/oidc` 4.0.1. Sus peers son opcionales, así que npm no instala nada más.
- No hacen falta `@vercel/node`: las funciones usan los tipos globales `Request` y `Response`.
- El cliente de Kommo usa `fetch` y no agrega dependencias.
- Nada de esto llega al navegador: solo lo importa `api/`.

### 4.5 Contratos en Ingeniak (diferencias con el original)

- **`disponibilidad`, `reservar`, `limpiar`:** el mismo JSON que §2.2. Cambian dos cosas:
  - El correo de los errores: "contacto@ingeniak.mx o por WhatsApp".
  - La voz: plural de Ingeniak. Por ejemplo, "No pudimos completar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp y te agendamos nosotros."
- **`reservar`:** el campo `atribucion` agrega `src` (el `sessionStorage['ingeniak-src']` de ui.ts).
- **`POST /api/agenda/confirmar/`** con `{session_id}`. Reemplaza el render de servidor de `/agendar/confirmado`.
  - Valida `^cs_(live|test)_[A-Za-z0-9]+$`; si no cumple → `400 {ok:false, state:'error'}`.
  - Llama a `confirmFromCheckout`; luego, `markKommoPaid`.
  - Respuestas: `200 {ok:true, state:'ok', when, meetLink, email, brief}` · `200 {ok:true, state:'pending'}` · `500 {ok:false, state:'error'}`.
  - Es POST, no GET, porque tiene efectos (idempotentes) y así no lo disparan prefetchers ni rastreadores.
- **`POST /api/agenda/liberar/`** con `{apartado}`. Reemplaza el `releaseHold` que hacía la página de Power al regresar cancelado.
  - Valida `^[a-z0-9_-]{5,1024}$`i; si no cumple → 400.
  - Responde siempre `200 {ok:true}`. Los errores solo se registran; el cron lo reintenta.
  - Seguridad: igual que el original. Solo libera eventos `pendiente` cuyo Checkout no se pagó, y el id solo aparece en el `cancel_url`.

### 4.6 Componente de reserva en TypeScript sin framework (reemplaza a `BookingFlow.tsx`)

**Marcado** (`BookingFlow.astro`, renderizado en el build):
- `<div class="bk glass-panel" data-agenda="power" data-hold="30" data-price-label="…">`, que contiene:
  - Encabezado de pasos `<ol aria-label="Pasos">` con 3 `<li>`: "Tus datos", "Horario", "Pago" o "Confirmar".
  - Aviso `role="status"` vacío.
  - Las 3 vistas `<section data-step="1|2|3" hidden>`, cada una con su `<h2 tabindex="-1">`.
  - La vista final `data-step="done"`.
- **Paso 1:** un `<form novalidate>` con los mismos campos, etiquetas, ayudas, "Opcional" y errores (`<p id="…-error">`).
  - `aria-invalid` y `aria-describedby` se ponen en ejecución.
  - Selects nativos con la opción vacía desactivada.
  - `timeDrains` como botones `aria-pressed`, máximo 3.
  - Campo trampa `website_url` fuera de pantalla con `tabindex=-1` y `autocomplete=off`.
  - Nota y enlace al **aviso de privacidad** (`/aviso-privacidad/`).
  - **WhatsApp:** se reutiliza el control de teléfono con lada del modal de cotización (+52 por defecto) y se envía junto (`+52 33…`). La regla de ≥ 10 dígitos sigue igual.
- **Paso 2:** contenedor de días `role="tablist"` con 5 botones `role="tab"` (con flechas izquierda y derecha y `tabindex` rotativo, una mejora sobre el original). Panel de horarios `role="tabpanel"` y plantillas `<template>` para el día y el horario. Esqueleto, error con "Reintentar" y vacío con WhatsApp y correo.
- **Paso 3:** `<dl>` de resumen, nota (apartado de 30 min o invitación inmediata), alerta `role="alert"`, "Cambiar horario" y el botón primario.
- **Sin JS** (`html.no-js`): se oculta el flujo y se muestra "Para agendar necesitas JavaScript activo, o escríbenos por WhatsApp / contacto@ingeniak.mx".

**Estado** (igual que el original):

```ts
type Step = 1 | 2 | 3;
interface S {
  step: Step;
  form: BookingForm;
  errors: FormErrors;
  days: DayAvailability[] | null;
  daysError: string | null;
  date: string | null;
  slot: string | null;
  busy: boolean;
  serverError: string | null;
  notice: string | null;
  done: { when: string; meetLink: string | null } | null;
  honey: string;
  localTz: string | null;
  startedAt: number;
  origin: string | null;
  attribution: Record<string, string>;
}
```

Las funciones `render()` por parte (`renderSteps`, `renderErrors`, `renderDays`, `renderSlots`, `renderReview`, `renderDone`) no reconstruyen el formulario: solo cambian atributos y texto, así no se pierde el foco ni lo escrito.

**Comportamiento** (paridad 1:1):
1. **Al iniciar:**
   - `startedAt = Date.now()` y `loadDays()` en paralelo.
   - Restaura `sessionStorage['ingeniak-agenda-<tipo>']`.
   - Zona horaria con `Intl…timeZone`.
   - Origen: `ingeniak-src` + `utm_source`, `utm_campaign` y `utm_content` de `sessionStorage['ingeniak-utm']` (ui.ts ya los guarda) o de la URL.
   - Evento `booking_view`.
2. **Regreso de Stripe cancelado** (`?pago=cancelado&apartado=…`):
   - Primero `POST /api/agenda/liberar/` y **después** `loadDays()`.
   - Aviso "Cancelaste el pago y tu horario quedó libre. Puedes elegir el mismo u otro."
   - Paso 2 si el formulario guardado es válido.
   - `history.replaceState(null, '', location.pathname)`.
   - Bajar a `#agenda` con `window.__lenis?.scrollTo(el, {offset:-96})`; si no hay Lenis, `scrollIntoView`.
3. **`input` y `change`:** actualizan `form`, lo guardan en `sessionStorage` dentro de try/catch y borran el error del campo.
4. **Envío del paso 1:**
   - Con errores: `validateForm`, pintar y enfocar el primer campo con error.
   - Sin errores: `goTo(2)`.
5. **`goTo(n)`:**
   - Muestra la vista y mueve el foco a su `h2`. Es una mejora de accesibilidad: el original solo hacía scroll.
   - Hace scroll suave, o directo si `reduced()`.
   - Emite `booking_step`.
6. **Al confirmar:**
   - Hace el `fetch` con el payload de §2.2, más `atribucion.src`.
   - Manejo de 409, 422 y error, igual que §1.4.
   - Con `checkout`: `location.assign(url)`.
   - Con `confirmed`: vista `done`, `booking_confirmed` y borra el `sessionStorage`.
7. **Medición:** `document.dispatchEvent(new CustomEvent('ingeniak:track', {detail:{name, page: location.pathname, tipo, step?}}))`. Es el mismo canal R10 de ui.ts.
   - Eventos: `booking_view`, `booking_step`, `booking_submit` (Discovery), `booking_checkout_start` (Power), `booking_confirmed`, `booking_slot_taken` y `booking_error`.
   - **Nunca** llevan datos que escribió la persona.

**Diseño:**
- Panel `.glass-panel`; inputs con `--r-input` (12 px); foco cian (`:focus-visible` global); etiquetas `.t-label`.
- **Errores en ámbar.** ESPEC §2 permite ámbar en "errores de formulario".
- **Día y horario seleccionados con borde y relleno cian.** **Nunca en azul**: el único azul de la pantalla es el botón primario ("Continuar", "Confirmar mi sesión" o "Pagar …"). Ese botón lleva `.btn` y `data-primary`; el resto lleva `.btn--ghost`.
- Transiciones entre pasos con CSS (opacidad y 12 px en Y, 0.45 s, `--ease-cine`); quietas con `prefers-reduced-motion` o `html[data-motion="reduced"]`.
- Los 5 días caben en 390 px: unos 64 px cada uno, con `gap` de 6.
- Horarios en 2 columnas en móvil y 4 en escritorio.
- Sin fondo propio de sección (ESPEC §3.11): el panel es cristal sobre el `body`.

### 4.7 Integración en las landings

- **Orden de la página**, como en el sitio vivo y en riklanderos: hero → VSL → **`#agenda`** (BookingSection) → el resto del contenido (Power: qué incluye, fit, método, garantía, FAQ…) → cierre.
- **Todo CTA primario de la landing** (hero, después del video, el cierre, el encabezado reducido) es `<a href="#agenda" data-primary data-section="…">`. Hace scroll al componente y **no** abre el modal de cotización. El secundario sigue siendo WhatsApp (`waHref` con el mensaje propio de la landing).
- **Atribución:** `ui.ts → initAttribution` solo registra `ingeniak-src` cuando el destino es `/discovery/`. Hay que pedirle a **ui** que reconozca también `/power-session/` (y `#agenda` dentro de ellas). Sin eso, la sección de origen de Power no se registra.
- **ConversionTemplate** (dueño: páginas): cambiar `agenda = page.primaryCta?.href ?? SITE.agenda` por `#agenda` y montar `BookingSection` después de la escena `video`. Al orquestador:
  - `SITE.agenda = '/discovery/#agenda'`.
  - Los `primaryCta.href` de `sitemap.json` de las dos landings → `#agenda`.
  - El atributo R10 hacia agenda.ingeniak.tech deja de aplicar.
- **Encabezado reducido** (`nav="reduced"`): el CTA del encabezado apunta a `#agenda` y dice "Agendar mi Discovery Session" o "Agendar mi Power Session", **no** "Cotizar proyecto".

### 4.8 `/agendar/confirmado/` (estática y oculta)

- `noindex,nofollow`, encabezado reducido, fuera del sitemap y del índice. Header `X-Robots-Tag: noindex` en §4.11.
- **Al cargar:**
  1. Lee `session_id` de `location.search`.
  2. Si no cumple el formato → estado de error.
  3. Si cumple, muestra "Confirmando tu pago…" con `aria-busy` y llama a `POST /api/agenda/confirmar/`.
- **Los tres estados**, con el copy del original pasado a la voz de Ingeniak:

  | Estado | Qué muestra |
  |---|---|
  | **ok** | Palomita en cian; "Pago recibido"; "Tu Power Session quedó confirmada."; `when` (hora del centro de México); "Te enviamos la invitación de Google Calendar a **{email}** con el enlace de Google Meet; Stripe te manda el recibo por separado."; tarjeta del brief (con A1); botones "Abrir enlace de Meet" e "Ir al inicio" |
  | **pending** | "Tu pago todavía se está procesando…" y WhatsApp o correo |
  | **error** | "No pudimos confirmar tu sesión desde aquí…" y "Volver a la agenda" (`/power-session/#agenda`) |

- Se puede recargar sin problema (la confirmación es idempotente). Kain no aparece; si aparece, tiene que ser de cuerpo completo.

### 4.9 URLs de Stripe en Ingeniak

`base` se define así:

| Entorno | `base` |
|---|---|
| `VERCEL_ENV === 'production'` | `https://ingeniak.mx` |
| Preview | `https://${VERCEL_BRANCH_URL ?? VERCEL_URL}` (Vercel Authentication la protege; el equipo entra con su sesión) |
| `vercel dev` | `http://localhost:3000` |

Se puede forzar con `AGENDA_BASE_URL`.

- `success_url`: `${base}/agendar/confirmado/?session_id={CHECKOUT_SESSION_ID}` (el marcador literal de Stripe, sin codificar).
- `cancel_url`: `${base}${LANDING.power}?pago=cancelado&apartado=${encodeURIComponent(eventId)}`, por ejemplo `https://ingeniak.mx/power-session/?pago=cancelado&apartado=…`.

### 4.10 Leads de la agenda → Kommo

Kommo recibe las reservas a través del cliente compartido `api/_lib/kommo.ts`, con las mismas variables `KOMMO_*` que defina el endpoint de cotización.

- **Al reservar:**
  - Lead "Discovery Session · {negocio}" o "Power Session · {negocio}", con su contacto (nombre, correo, WhatsApp) y su empresa.
  - Etiquetas `agenda`, `discovery-session` o `power-session`, `web:ingeniak` y, en Power, `pago-pendiente`.
  - Nota con todos los campos, el horario (CDMX e ISO), el Meet (Discovery), el origen, los UTM, `referrer` y la página.
  - El id del lead se guarda en el evento como `ik_kommo`.
- **Al pagar:** desde `confirmar` y desde el cron, la etiqueta pasa a `pagado` y se agrega una nota con el Meet y el brief. Al terminar se marca `ik_kommo_pago=1` en el evento con `patchPrivate`.
- **Al expirar:** etiqueta `expirado`.
- **Cron de Ingeniak:** además de `sweepHolds`, busca los eventos con `rl_sitio=ingeniak` y `rl_estado=confirmada` de los últimos 2 días que no tengan `ik_kommo_pago`, y sincroniza Kommo. Así se cubre el caso en que confirmó el cron de riklanderos, que no conoce Kommo.
- **Si Kommo falla o falta:** se registra un aviso sin datos personales y **la reserva sigue**. La cita en Calendar es la fuente de verdad, como en el diseño original con Supabase. Es lo contrario de la cotización, donde un fallo de Kommo sí se le avisa al visitante.

### 4.11 `vercel.json` (orquestador)

```json
"crons": [{ "path": "/api/agenda/limpiar/", "schedule": "5-59/10 * * * *" }],
"headers": [
  { "source": "/api/(.*)", "headers": [
      { "key": "Cache-Control", "value": "no-store" },
      { "key": "X-Robots-Tag", "value": "noindex" } ] },
  { "source": "/agendar/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex" }] }
]
```

- **Cron desfasado 5 minutos** respecto al de riklanderos (`*/10`): así los dos barridos no procesan el mismo apartado al mismo tiempo.
- La regla general `/((?!_astro/|img/|fonts/|fx/|video/).*)` hoy también alcanza `/api/` con `public, max-age=0, must-revalidate`. Hay que excluir `api/` de ese patrón o confirmar que gana el header de la función.
- La redirección `/cotiza → /discovery/` se revisa aparte: "Cotizar" ahora es un modal y `/discovery/` pasa a ser oculta.

### 4.12 Desarrollo local y QA sin secretos

`astro dev` (127.0.0.1:4321) no sirve `api/`, y los agentes no manejan secretos. Por eso existe el **modo demo** (`src/scripts/agenda/demo.ts`):
- **Se activa** solo si `import.meta.env.DEV` y además (`?agenda=demo`, o `fetch('/api/agenda/disponibilidad/')` responde 404).
- **Horarios:** salen de las reglas reales (`bookableDates` y `SESSION_RULES`), con algunos ocupados al azar y una semana llena para Power si se usa `?agenda=demo&lleno=1`.
- **Reservar:**
  - Discovery: después de 800 ms responde `confirmed`, con `meetLink: null`.
  - Power: lleva a `/agendar/confirmado/?session_id=cs_test_DEMO`.
- **`/agendar/confirmado/`:** en desarrollo, con `cs_test_DEMO`, pinta el estado ok con datos de ejemplo. `?estado=pending|error` fuerza los otros estados.
- Vite lo elimina del build de producción.

Así se toman capturas a 1440 y 390 y se prueba con CDP: llenar campos, errores, días, horarios, accesibilidad.

Prueba de punta a punta, que le toca al cliente o al orquestador con credenciales:
1. `vercel link` + `vercel env pull` + `vercel dev`, o un Preview con variables de **prueba**: `sk_test_…` y un calendario de prueba de la misma cuenta.
2. Tarjeta de prueba de Stripe `4242 4242 4242 4242`.
3. Probar los cuatro caminos: Discovery, Power pagada, Power cancelada y Power abandonada. Esta última se confirma en Preview llamando a `limpiar` a mano, porque **los crons solo corren en producción**.

### 4.13 Lo que el cliente tiene que configurar

1. **Vercel:**
   - El proyecto de Ingeniak va en el equipo **ingeniak**, con plan Pro (cron cada 10 min) y Node 24.x.
   - Vincular el conector **`google/riklanderos-web`** al proyecto de Ingeniak (Vercel → Connect).
   - Comprobar en el Preview con `/api/agenda/estado/` que el permiso del sujeto `rik` funciona desde este proyecto. Si no, autorizarlo otra vez (ver §4.14).
2. **Variables de entorno.** Production lleva los valores reales; **Preview, valores de prueba**:

   | Variable | Valor | Cuándo |
   |---|---|---|
   | `POWER_CALENDAR_ID`, `DISCOVERY_CALENDAR_ID` | Los mismos IDs que riklanderos.tech | Siempre |
   | `STRIPE_SECRET_KEY` | Misma cuenta con A; la de Ingeniak con B. Mejor una llave restringida | Siempre |
   | `CRON_SECRET` | Una cadena aleatoria | Siempre |
   | `KOMMO_*` | Las mismas de la cotización | Siempre |
   | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Las de riklanderos | Solo con A1 o con leads en Supabase |
   | `AGENDA_GOOGLE_CONNECTOR`, `AGENDA_GOOGLE_SUBJECT`, `AGENDA_BASE_URL` | — | Solo si cambian los valores por defecto |

   El token de Kommo y las llaves solo viven en Vercel; ningún agente los toca.
3. **Stripe:**
   - No hace falta crear producto.
   - Activar el recibo por correo ("Successful payments").
   - Revisar el nombre público y la marca de la cuenta, que salen en el Checkout.
4. **Google:** nada nuevo, mientras se use la misma cuenta y los mismos calendarios. Meet tiene que estar activo en la cuenta.
5. **Kommo:** embudo y etapa de entrada para las reservas (o las mismas de la cotización), y las etiquetas de §4.10.
6. **Decisiones:** A o B (Stripe), A1 o A2 (Supabase y brief) y la ruta de la landing de Power (`/power-session/` o `/powersession/`, con redirección de la otra).
7. **Videos:** autorizar la descarga de `powersession-vsl.mp4` (29.3 MB, agenda.ingeniak.tech) para codificarlo según R14.

### 4.14 Riesgos y preguntas abiertas

- **Vercel Connect entre proyectos.** Vincular el conector al segundo proyecto es documentado. Que **el mismo permiso** (sujeto `rik`) se lea desde otro proyecto es muy probable, pero no está verificado.
  - Si falla: portar `conectar.ts` restringido a los hosts del Preview de Ingeniak, y autorizar una vez con la cuenta de Google de Rik (`prompt: 'consent'`).
  - Último recurso: OAuth propio con refresh token en variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`). Lo configura el cliente.
- **Funciones en `api/` con el preset de Astro, ESM con `.js` y `trailingSlash`:** verificarlo en el primer Preview (§4.1).
- **Carrera de doble reserva:** el original no la resuelve. "Comprobar y luego insertar" no es atómico, y ahora hay dos sitios escribiendo en el mismo calendario.
  - Mejora opcional: después de insertar, volver a listar los eventos `rl_tipo` del mismo rango. Si hay más de uno, el más nuevo se borra y responde 409.
- **Sin webhook de Stripe:** si el visitante paga y no regresa, la confirmación tarda hasta 10 min (cron), o 5 si los dos crons están activos. Mejora opcional: webhook `checkout.session.completed` → `confirmar`. Agrega `STRIPE_WEBHOOK_SECRET`.
- **Cancelaciones desde Google Calendar:** la app no las detecta y el horario sigue ocupado. Pasa igual en el original.
- **Días festivos:** no se descuentan solos. Rik debe bloquearlos en su calendario `primary`.
- **Previews con datos reales:** si Preview hereda las variables de Production, una prueba crea citas reales y cobra. Las variables de Preview deben ser de prueba.

### 4.15 Avisos de marca y de copy para las landings

Estos puntos los decide copy o el orquestador; no son técnicos.

- **Precio de la Power Session.** La regla de marca dice "precio solo *desde USD 997 al mes*", pero la landing de Power y el componente **tienen** que mostrar el cobro real de **297 USD**, pago único, en el botón "Pagar 297 USD" y en el resumen. El dato está confirmado: lo publica agenda.ingeniak.tech y lo cobra Stripe. Hace falta que el orquestador lo agregue como dato con token (por ejemplo, `POWER_PRICE` en `metrics.ts`, o permitido con `data-allow-number`) para que `check-cifras` lo acepte. No debe escribirse a mano.
- **Apartado:** agenda.ingeniak.tech dice "apartado 15 minutos". Con Stripe Checkout el mínimo es 30, así que el texto debe decir **30 minutos**.
- **Garantía:** riklanderos dice "Garantía del 100 %" y agenda.ingeniak.tech dice "al menos 3 fugas por más de $10,000 MXN al mes, o te devolvemos los $297 USD". Se usa la versión de Ingeniak, con sus cifras confirmadas como dato o con token.
- **Pasos:** agenda.ingeniak.tech promete "Cuatro preguntas cortas" (Power) y "Siete preguntas · dos minutos" (Discovery). El formulario portado tiene:
  - Discovery: 8 obligatorias y 1 opcional.
  - Power: 10 obligatorias y 1 opcional.

  El copy de los pasos debe describir el formulario real.
- **Cupo:** "Solo 4 sesiones por semana · por orden de pago" está confirmado, y el código lo aplica de verdad (con A, entre los dos sitios).
- **Voz:** el componente original habla en primera persona de Rik ("Te envié", "Escríbeme a hola@riklanderos.com"). En Ingeniak va en plural, con tuteo y en español de México: "Te enviamos", "escríbenos a contacto@ingeniak.mx o por WhatsApp".
- **Prueba social:** no se portan `ProofBar` (logos de marcas y cifras) ni las secciones de "Caso real" o "Empresas que ya operan" de agenda.ingeniak.tech sin el dato confirmado y su token. Esto sigue la regla "sin clientes ni cifras inventadas".
