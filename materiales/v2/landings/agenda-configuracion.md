# Agenda de Discovery Session y Power Session · configuración y pruebas

**Para quién es:** para el equipo de Ingeniak (y quien administre Vercel, Stripe, Google y Kommo).
**Qué cubre:** qué hay que decidir, qué hay que capturar en Vercel, cómo comprobar el primer Preview y cómo hacer la prueba de punta a punta.
**Fecha:** 20 de octubre de 2026 (actualizada con la estructura de 3 embudos de Kommo que aprobaste ese día). **Especificación:** `materiales/v2/CAMBIO-COTIZAR.md` §5 y `materiales/v2/landings/flujo-agenda.md`.

> Ningún valor real vive en el repositorio. Las llaves, los tokens y los IDs de calendario solo se capturan en Vercel (Settings → Environment Variables). En este documento todos los valores son de ejemplo.

---

## 1. Qué hace, en corto

- Las landings ocultas `/discovery/` y `/power-session/` tienen la reserva **dentro de la página** (sección "Reserva en 3 pasos"). Es el mismo flujo de riklanderos.tech: **Tus datos → Horario → Confirmar o Pagar**.
- **Discovery Session** (30 min, sin costo): al confirmar, se crea la cita en Google Calendar con su enlace de Google Meet, y **Google** le manda la invitación a la persona.
- **Power Session** (90 min, USD 297, pago único): el horario se **aparta 30 minutos** sin invitar a nadie; la persona paga en **Stripe Checkout**; al volver a `/agendar/confirmado/` se verifica el pago con Stripe y el apartado se convierte en la cita real (invitación + Meet). Si cancela en Stripe, el horario se libera al regresar.
- Los horarios salen **en vivo** de Google Calendar: los próximos 5 días hábiles desde mañana, en hora del centro de México, con 12 horas de anticipación mínima y 15 minutos de colchón entre citas. Discovery: 8 horarios al día. Power: 4 al día y **4 por semana** como máximo.
- Cada reserva **también crea un lead en Kommo**, en el embudo **«Agenda · Sesiones»**: la Discovery entra a «Discovery agendada»; la Power Session entra a «Power Session por pagar» y, cuando se paga, **ese mismo lead** pasa a «Power Session pagada» (sección 7). Si Kommo falla, la reserva sigue: Google Calendar manda.
- Un **cron cada 10 minutos** confirma los pagos de quien cerró la pestaña sin regresar y libera los apartados vencidos.

---

## 2. Decisiones que tienes que tomar

### Decisión 1 · ¿Qué cuenta cobra y qué calendarios se usan? (A o B)

| Opción | Qué significa, en simple | Ventajas | Lo que implica |
|---|---|---|---|
| **A · Todo compartido con riklanderos.tech** (recomendada, es la que está construida) | ingeniak.mx usa **la misma** cuenta de Google de Rik, **los mismos** calendarios de Power y Discovery y **la misma** cuenta de Stripe que riklanderos.tech. | Una sola agenda para los dos sitios: nadie puede reservar el mismo horario dos veces y el cupo de 4 Power por semana es uno solo. El cron de riklanderos.tech sirve de respaldo. No hay que crear productos en Stripe. | El pago de la Power Session desde ingeniak.mx entra a la cuenta de Stripe de Rik. El Checkout muestra el nombre y la marca de esa cuenta. |
| **B · Cuenta propia de Ingeniak** | ingeniak.mx cobra en una cuenta de Stripe distinta. | Los ingresos quedan separados. | Requiere trabajo extra de programación (propiedades y cron propios), el cupo de 4 por semana ya no sería compartido y el cron de Ingeniak se vuelve obligatorio. **No está construida.** |

### Decisión 2 · ¿Se comparte el Supabase de riklanderos.tech? (A1 o A2)

Solo aplica con la opción A.

| Opción | Qué significa | Resultado |
|---|---|---|
| **A1 · Sí, el mismo Supabase** (recomendada) | Se capturan `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` de riklanderos.tech en el proyecto de ingeniak.mx. | Cada reserva también se guarda en la tabla `leads` de riklanderos (con `details.site = "ingeniak"`), Rik recibe el mismo correo de aviso que ya tiene configurado, y al pagar la Power Session se crea el **brief** previo: la página de confirmación muestra "Llenar mi brief" y el enlace va en la invitación (`https://www.riklanderos.tech/brief/<token>`). |
| **A2 · No** | No se capturan esas dos variables. | Todo funciona igual, pero sin brief ni renglón en Supabase. Si el visitante no regresa de Stripe y quien confirma es el cron de riklanderos.tech, la invitación sí podría llevar el enlace del brief (lo crea el lado de riklanderos). |

### Decisión 3 · Contenido de la Power Session (ver `CAMBIO-COTIZAR.md` §9-3)

Reconfirmar precio USD 297, garantía, cupo de 4 por semana, grabación y mapa como entregables, "precio introductorio", "Las 4 A" y el cargo de Rik. El componente de reserva solo muestra el precio (`USD 297 · pago único`, botón "Pagar USD 297") y el apartado de 30 minutos.

---

## 3. Lista del cliente (en orden)

1. **Vercel.** El proyecto de ingeniak.mx en el equipo **ingeniak**, plan **Pro** (el cron cada 10 minutos lo necesita; en Hobby los crons corren una vez al día) y Node **24.x** (Settings → General → Node.js Version).
2. **Google.** En Vercel → **Connect**, vincula el conector **`google/riklanderos-web`** también al proyecto de ingeniak.mx. En el primer Preview abre `/api/agenda/estado/` (sección 5): si `google` no dice `"ok"`, avísanos y pasamos al plan B (autorización propia con `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REFRESH_TOKEN`). Google Meet tiene que estar activo en la cuenta de Rik.
3. **Variables de entorno** (Settings → Environment Variables). **Production** con los valores reales; **Preview con valores de prueba** (`sk_test_…` de Stripe y, de preferencia, calendarios de prueba de la misma cuenta). La lista completa está en la sección 4. Después de capturarlas, haz **Redeploy**.
4. **Stripe.** No hace falta crear producto ni precio: el cobro va "en línea" (29 700 centavos de dólar). Activa el recibo por correo (Settings → Customer emails → **Successful payments**) y revisa el nombre público y la marca de la cuenta, porque salen en el Checkout. De preferencia usa una **llave restringida** (`rk_live_…`) con permiso de escritura en Checkout Sessions.
5. **Kommo.** Integración privada con token de larga duración (las mismas `KOMMO_SUBDOMAIN` y `KOMMO_TOKEN` de la cotización) y **el script de configuración ya corrido** (paso 4 de `cotizar-configuracion.md`): crea el embudo «Agenda · Sesiones» con sus etapas y los campos de la sesión. El sitio los encuentra solo, por nombre: **no hace falta capturar números de embudo ni de etapa**. Las plantillas de WhatsApp (aprobadas por Meta), los bots, los recordatorios y las tareas se configuran a mano siguiendo **una sola guía: `kommo-setup.md` §8 y §9** (para la agenda: §8.2–8.4 y §9.3–9.5, con las etiquetas `discovery` y `power-session` como condición). No armes otras aparte: si hay dos, la persona recibe dos mensajes. Esa guía no pone mensajes en «Power Session por pagar» (ahí la persona todavía no paga): el WhatsApp de la Power Session sale al llegar a «Power Session pagada».
6. **Decisiones** de la sección 2 (A/B, A1/A2) y las de `CAMBIO-COTIZAR.md` §9.
7. **Prueba de punta a punta en Preview** (sección 6): una cotización, una Discovery, una Power pagada con la tarjeta de prueba `4242 4242 4242 4242`, una Power cancelada y una Power abandonada (esta se confirma llamando a mano a `/api/agenda/limpiar/` con el `CRON_SECRET`, porque **los crons solo corren en producción**). Revisa Kommo (etiqueta `entorno-preview`) y Google Calendar.

---

## 4. Variables de entorno de la agenda

Mismos nombres que riklanderos.tech. Las de Kommo son las mismas de la cotización (`CAMBIO-COTIZAR.md` §3.6). El archivo `.env.example` del repositorio las lista vacías.

| Variable | ¿Cuándo? | ¿Secreta? | Qué es |
|---|---|---|---|
| `POWER_CALENDAR_ID` | siempre | no | ID del calendario de Google de la Power Session. Con la opción A, **el mismo** de riklanderos.tech. |
| `DISCOVERY_CALENDAR_ID` | siempre | no | ID del calendario de la Discovery Session. Con la opción A, el mismo de riklanderos.tech. |
| `STRIPE_SECRET_KEY` | siempre | **sí** | Llave de la cuenta que cobra. Production: `sk_live_…` o `rk_live_…`. Preview: **`sk_test_…`**. |
| `CRON_SECRET` | siempre | **sí** | Cadena aleatoria larga (por ejemplo, 32 caracteres). Vercel la manda sola al cron; sin ella, `/api/agenda/limpiar/` responde 401. |
| `KOMMO_SUBDOMAIN`, `KOMMO_TOKEN` | siempre | el token **sí** | Las de la cotización, y **las únicas de Kommo que hacen falta** una vez corrido el script de configuración. Sin ellas, en Preview las reservas funcionan pero no llegan a Kommo; en producción la cotización responde 503 (la reserva no se bloquea). |
| `KOMMO_RESPONSIBLE_USER_ID` | opcional | no | Responsable de los leads del sitio (sin ella, la asignación por defecto de Kommo). |
| `KOMMO_AGENDA_PIPELINE_ID` | opcional | no | Embudo de las reservas: manda sobre «Agenda · Sesiones». Dentro de él, cada etapa se busca por nombre («Discovery agendada», «Power Session por pagar» y, al confirmar el pago, «Power Session pagada»). Si la capturas, usa el número que imprime el script (`kommo-setup.md` §7). |
| `KOMMO_AGENDA_STATUS_ID` | opcional | no | **Solo un respaldo.** Cada reserva entra a su etapa por nombre: la Discovery a «Discovery agendada» y la Power Session a «Power Session por pagar», aunque esta variable diga otra cosa. La variable se usa únicamente si la etapa con ese nombre no existe en tu cuenta (por ejemplo, si la renombraste). El script imprime el número de «Discovery agendada»: capturarlo no cambia nada mientras las etapas existan. |
| `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID` | opcional | no | Son de la cotización. La agenda solo las usa como respaldo si en tu cuenta no existe el embudo «Agenda · Sesiones». |
| `NOTIFY_WEBHOOK_URL`, `NOTIFY_WEBHOOK_SECRET` | opcional | **sí** | Copia de cada reserva a un webhook (n8n u otro), con `source` `agenda-discovery` o `agenda-power`. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | solo A1 | la service role **sí** | Las de riklanderos.tech. |
| `AGENDA_GOOGLE_CONNECTOR`, `AGENDA_GOOGLE_SUBJECT` | solo si cambian | no | Por defecto `google/riklanderos-web` y `rik`. |
| `AGENDA_BASE_URL` | solo si hace falta | no | Fuerza el dominio al que Stripe regresa (por defecto: `https://ingeniak.mx` en producción y la URL del Preview en Preview). |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | solo plan B | **sí** | Autorización propia de Google si Vercel Connect no se comparte entre proyectos. Si existen las tres, tienen prioridad sobre Connect. |
| `AGENDA_MOCK`, `AGENDA_MOCK_LLENO` | **solo local** | no | Simulación en la computadora de desarrollo. **Nunca en Vercel** (ahí la simulación no se activa aunque existan). |

**Importante:** si Preview hereda las variables de Production, una prueba crea citas reales y cobra de verdad. Captura valores de prueba en Preview.

---

## 5. Verificación del primer Preview

Cambia `<preview>` por la URL del Preview (por ejemplo `ingeniak-git-main-ingeniak.vercel.app`). Si el Preview tiene Vercel Authentication, ábrelo antes en el navegador con tu sesión o usa un *bypass token* de Vercel.

### 5.1 La función responde (y con barra final)

```bash
curl -i "https://<preview>/api/agenda/disponibilidad/?tipo=discovery"
```

Esperado: `HTTP/2 200`, `content-type: application/json; charset=utf-8`, `cache-control: no-store`, `x-robots-tag: noindex` y un cuerpo así:

```json
{ "ok": true, "days": [ { "date": "2026-10-21", "slots": ["2026-10-21T16:00:00.000Z", "…"] }, "… 5 días …" ] }
```

- **404 o 308:** Vercel no está sirviendo `api/` con barra final. El orquestador agrega en `vercel.json` el rewrite `{ "source": "/api/:path*/", "destination": "/api/:path*" }` (`CAMBIO-COTIZAR.md` §3.1) y se vuelve a probar.
- **503 con "No pudimos leer la agenda…":** Google no responde o falta un ID de calendario. Ve a 5.2.
- **`"simulacion": true` en la respuesta:** imposible en Vercel; si aparece, avísanos.

### 5.2 Diagnóstico sin secretos

```bash
curl -s "https://<preview>/api/agenda/estado/"
```

Responde solo estados, nunca IDs ni llaves (en producción responde 404):

```json
{ "ok": true, "entorno": "preview", "simulacion": false,
  "google": "ok", "googleAuth": "connect", "stripe": "ok", "live": false,
  "calendarios": { "power": true, "discovery": true },
  "kommo": "configurado", "kommoEstructura": "completa", "supabase": "ok", "cron": true }
```

| Campo | Si no sale bien |
|---|---|
| `google: "error"` | El conector `google/riklanderos-web` no está vinculado al proyecto de ingeniak.mx, o el permiso del sujeto `rik` no se lee desde este proyecto. Vincúlalo en Vercel → Connect y haz Redeploy. Si sigue igual: plan B (`GOOGLE_*`). |
| `calendarios.power` o `.discovery` en `false` | Falta la variable o el ID no es un calendario que la cuenta pueda ver. Copia el ID desde riklanderos.tech (`/admin/agenda`). |
| `stripe: "sin-configurar"` o `"error"` | Falta `STRIPE_SECRET_KEY` o la llave no tiene permiso para Checkout Sessions. |
| `live: true` en Preview | Estás usando una llave real en Preview. Cámbiala por `sk_test_…`. |
| `kommo: "sin-configurar"` | Faltan `KOMMO_SUBDOMAIN` / `KOMMO_TOKEN` (la reserva funciona igual, pero el lead no llega). |
| `kommoEstructura: "sin-estructura"` | El script de configuración de Kommo aún no se corre: los leads llegan al embudo principal (o al de `KOMMO_PIPELINE_ID`), con nota completa y sin campos. |
| `kommoEstructura: "incompleta"` | Falta algo de lo que usa el sitio (los embudos «Sitio web · Cotizaciones» y «Agenda · Sesiones» con sus etapas, y los 15 campos con sus opciones); la lista `kommoFaltan` dice qué nombre no encontró (por ejemplo `Etapa «Power Session pagada» (Agenda · Sesiones)`). Vuelve a correr el script o corrige el nombre en Kommo; los cambios se notan en máximo 10 minutos (o al instante con Redeploy). |
| `kommoEstructura: "error"` | Kommo no respondió a la consulta; vuelve a intentar en un minuto. |
| aparece `kommoOpcional` | Solo informativo, no es un error: falta algo de «Clientes · Implementación», el embudo que usa tu equipo y no el sitio (pasa si corriste el script con `--sin-clientes`). `kommoEstructura` puede decir `"completa"` igual. |
| `supabase: "error"` | URL o service role incorrectas (solo con A1). |
| `cron: false` | Falta `CRON_SECRET`. |

### 5.3 El cron

```bash
curl -s -H "Authorization: Bearer $CRON_SECRET" "https://<preview>/api/agenda/limpiar/"
# → { "ok": true, "revisados": 0, "confirmados": 0, "liberados": 0, "errores": 0, "kommo": 0 }
curl -s -o /dev/null -w "%{http_code}\n" "https://<preview>/api/agenda/limpiar/"   # → 401 sin la cabecera
```

En producción el cron corre solo a los minutos 5, 15, 25… de cada hora (`vercel.json`), cinco minutos después del de riklanderos.tech, para que los dos barridos no procesen el mismo apartado al mismo tiempo. El de ingeniak.mx solo toca los apartados creados desde ingeniak.mx.

---

## 6. Prueba de punta a punta (en Preview, con valores de prueba)

Antes: Preview con `sk_test_…`, calendarios de prueba (o los reales en un horario que luego borras) y Kommo configurado.

| # | Camino | Pasos | Qué revisar |
|---|---|---|---|
| 1 | **Cotización** | Abre el modal "Cotizar proyecto" en cualquier página y envíalo. | Lead `Cotización web · …` en «Sitio web · Cotizaciones» → «Nueva cotización», con sus campos, `web-cotizar` y `entorno-preview` (`cotizar-configuracion.md`). |
| 2 | **Discovery** | `/discovery/` → "Agendar mi Discovery Session" → llena tus datos → elige horario → "Confirmar mi sesión". | Vista final "Listo, …" con fecha y botón de Meet. En Google Calendar: `Discovery Session · {negocio} ({nombre})`, con invitado y Meet. Correo de invitación de Google. En Kommo: lead `Discovery Session · {negocio}` en «Agenda · Sesiones» → «Discovery agendada», con Tipo de sesión, Fecha de la sesión, Enlace de Meet, Industria, Tamaño de empresa, Facturación mensual y Página de origen llenos; etiquetas `web-agenda`, `discovery`, `orgánico` (o `campaña`) y `entorno-preview`, y la nota completa. |
| 3 | **Power pagada** | `/power-session/` → reserva → "Pagar USD 297" → en Stripe, tarjeta `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC. | Regresas a `/agendar/confirmado/` con "Pago recibido · Tu Power Session quedó confirmada.", fecha y botón de Meet (y "Llenar mi brief" con A1). En Calendar el título pasa de `[Apartado · pago pendiente] Power Session · {negocio}` a `Power Session · {negocio} ({nombre})`, con invitado, Meet y "Pago confirmado en Stripe." en la descripción. En Kommo: **el mismo lead** (no uno nuevo) pasa de «Power Session por pagar» a «Power Session pagada», con Pago Power Session = Pagado, Fecha de la sesión y Enlace de Meet, y una nota "Pago confirmado en Stripe · …". Recibo de Stripe por correo (solo si está activo y con llave real; en modo de prueba Stripe no manda recibos a clientes). |
| 4 | **Power cancelada** | Igual que la 3, pero en Stripe pulsa la flecha de regreso ("←"). | Regresas a `/power-session/` con el aviso "Cancelaste el pago y tu horario quedó libre…", directo en el paso 2 si tus datos seguían guardados, y el mismo horario disponible otra vez. En Calendar el apartado desaparece. En Kommo: el lead se queda en «Power Session por pagar» con la nota "No completó el pago…". |
| 5 | **Power abandonada** | Reserva, llega a Stripe y **cierra la pestaña** sin pagar ni cancelar. Espera más de 31 minutos y llama al cron a mano (sección 5.3). | `liberados: 1`; el apartado desaparece del calendario y el lead de Kommo recibe la nota "No completó el pago…". Variante: paga y cierra la pestaña antes de volver → el cron responde `confirmados: 1`, la cita queda confirmada con invitación y el lead pasa a «Power Session pagada». |

Al terminar: borra en Google Calendar las citas de prueba que hayan quedado y, si quieres, los leads de prueba en Kommo (llevan `entorno-preview`).

---

## 7. Qué llega a Kommo y a Google Calendar

| Momento | Kommo (embudo «Agenda · Sesiones») | Google Calendar (propiedades privadas del evento) |
|---|---|---|
| Discovery confirmada | Lead `Discovery Session · {negocio}` en la etapa **«Discovery agendada»** · campos: Tipo de sesión = Discovery Session, Fecha de la sesión, Enlace de Meet, Industria, Tamaño de empresa, Facturación mensual, Página de origen · etiquetas `web-agenda`, `discovery`, `campaña` u `orgánico` (+ `entorno-preview` fuera del sitio publicado) · contacto con WhatsApp E.164 y correo · empresa · campos de rastreo (UTM, gclid, fbclid, referrer) si existen en la cuenta · nota con todos los datos, horario (CDMX e ISO), Meet, origen y atribución | `rl_tipo=discovery`, `rl_estado=confirmada`, `rl_email`, `rl_nombre`, `rl_sitio=ingeniak`, `ik_kommo=<id del lead>` |
| Power apartada | Lead `Power Session · {negocio}` en **«Power Session por pagar»** · Tipo de sesión = Power Session, **Pago Power Session = Pendiente**, Fecha de la sesión y los mismos datos del negocio · etiquetas `web-agenda`, `power-session`, `campaña` u `orgánico` (+ `entorno-preview`) | `rl_tipo=power`, `rl_estado=pendiente`, `rl_stripe=cs_…`, `rl_email`, `rl_nombre`, `rl_sitio=ingeniak`, `ik_kommo=<id del lead>` |
| Power pagada (al regresar o por el cron) | **El mismo lead** (el de `ik_kommo`) pasa a **«Power Session pagada»** con **Pago Power Session = Pagado**, Fecha de la sesión y Enlace de Meet, + nota "Pago confirmado en Stripe · {horario} · Meet · Brief". Si Kommo no responde en ese momento, el cron lo vuelve a intentar cada 10 minutos (hasta 2 días después de la sesión). | `rl_estado=confirmada`, `ik_kommo_pago=1` |
| Power pagada, pero su lead ya no existe en Kommo (se borró o se fusionó) | Se crea un **lead nuevo** `Power Session · {negocio}` directo en **«Power Session pagada»** (ligado al mismo contacto por su correo) con Pago = Pagado, fecha, Meet, etiquetas `web-agenda` y `power-session`, y una nota que dice que reemplaza al original. Si tienes webhook, llega la alerta `lead de la reserva no encontrado`. Si Kommo rechaza también el lead nuevo, el sitio deja de intentarlo y manda la alerta `pago sin registrar en Kommo`: regístralo a mano (el pago está en Stripe y los datos en la cita). | `ik_kommo=<id del lead nuevo>`, `ik_kommo_pago=1` (o `ik_kommo_pago=error` si Kommo rechazó todo) |
| Power cancelada o vencida | El lead **se queda** en «Power Session por pagar» (no se mueve ni se borra) y recibe la nota "No completó el pago de la Power Session: el horario apartado (…) se liberó." | el evento se borra |
| Confirmada por el cron de riklanderos.tech | el cron de ingeniak.mx la detecta (eventos `rl_sitio=ingeniak` confirmados sin `ik_kommo_pago`) y mueve el lead a «Power Session pagada» igual que arriba | `ik_kommo_pago=1` |

**Si la estructura no existe todavía** (el script no se ha corrido), todo funciona como antes: el lead entra al embudo de `KOMMO_PIPELINE_ID` (si existe) o al principal, con su nota completa y sus etiquetas, y al pagarse recibe la nota de pago. Los campos se llenan solo cuando existen en la cuenta con el nombre exacto; uno que falte se omite (nunca se pierde el lead por eso). Las etiquetas `agenda-discovery`, `agenda-power`, `pago-pendiente`, `pagado` y `expirado` de la versión anterior ya no se usan: ahora lo dicen la etapa y el campo «Pago Power Session».

La descripción de cada evento termina en `Agendado desde https://ingeniak.mx`: así el código de riklanderos.tech reconoce y procesa igual los eventos de ingeniak.mx (contrato de compatibilidad, `flujo-agenda.md` §4.2).

---

## 8. Desarrollo local (sin credenciales)

- En `astro dev` (`http://127.0.0.1:4321`) la API corre en **simulación** cuando no hay `POWER_CALENDAR_ID` (o con `AGENDA_MOCK=1`): todo vive en memoria y **nada sale a Google, Stripe, Kommo ni Supabase**. El componente muestra la etiqueta "Simulación local".
- El 2.º horario de cada día aparece ocupado (para ver la ocupación). Con `AGENDA_MOCK_LLENO=1` la semana de Power aparece llena.
- Demo: `/dev/agenda/` (los dos componentes) y `/dev/agenda-checkout/` ("Stripe simulado" con **Simular pago** y **Cancelar**). La Power real en `/power-session/` también lleva a ese Checkout simulado.
- Para empezar de cero: `curl -X POST http://127.0.0.1:4321/api/agenda/estado/ -H 'content-type: application/json' -H 'origin: http://127.0.0.1:4321' -d '{"simular":"reiniciar"}'`.
- Pruebas automáticas: `node --test tests/cotizar/ tests/agenda/` (con `fetch` simulado para Google, Stripe y Supabase, y un simulador de Kommo que corre solo en la propia computadora, en `127.0.0.1`, con la estructura de `shared/kommo-esquema.js`; nunca llaman al Kommo real ni usan un token real).

---

## 9. Riesgos y notas

- **Vercel Connect entre proyectos:** vincular el conector a un segundo proyecto está documentado; que el permiso del sujeto `rik` se lea desde ese proyecto es muy probable, pero se confirma en el primer Preview (sección 5.2). Plan B: `GOOGLE_*`.
- **Doble reserva simultánea:** como en riklanderos.tech, "revisar y luego crear" no es atómico. Si dos personas confirman el mismo horario en el mismo segundo podrían quedar dos citas; es muy poco probable y se resuelve moviendo una a mano.
- **Días festivos:** no se descuentan solos. Bloquéalos en el calendario principal de Rik.
- **Cancelaciones desde Google Calendar:** si la persona rechaza la invitación, el horario sigue ocupado hasta que alguien borre el evento.
- **Pago sin regreso:** si la persona paga y cierra la pestaña, la confirmación llega con el cron (hasta 10 minutos; 5 con los dos crons activos).
- **Kommo nunca bloquea una reserva:** si Kommo está caído, la cita queda en Calendar y el error se registra en los logs de Vercel (sin datos personales).
