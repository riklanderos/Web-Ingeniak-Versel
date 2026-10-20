# Formulario «Cotizar proyecto» → Kommo · guía de configuración

**Para:** el equipo de Ingeniak (quien administra Kommo y el proyecto de Vercel).
**Fecha:** 20 de octubre de 2026. **Base técnica:** `CAMBIO-COTIZAR.md` §3 y `kommo-vercel-tecnico.md`.

> Necesitas acceso de **administrador** en Kommo y en el proyecto de Vercel.
> **El token de Kommo nunca se manda por correo, WhatsApp ni chat:** se copia de Kommo y se pega directo en Vercel. Nadie del equipo de desarrollo lo necesita ni lo ve.

---

## 1. Cómo funciona

1. La persona llena el formulario de 3 pasos (Qué necesitas · Tu negocio · Contacto) en cualquier página del sitio.
2. El sitio lo manda a su propia función (`/api/cotizar/`), que revisa los datos y crea en Kommo, de una sola vez:
   - un **lead** llamado `Cotización web · {empresa}` en el embudo y la etapa que elijas;
   - el **contacto** (nombre, WhatsApp en formato internacional y correo) y la **empresa**. Si el correo o el WhatsApp ya existen en Kommo, el lead nuevo se liga a ese contacto y no se duplica;
   - **etiquetas** para tus automatizaciones (sección 4);
   - una **nota** con todo lo que llenó la persona, la página desde la que escribió, de dónde llegó (UTM, Google, Meta) y la fecha y hora del centro de México.
3. Los mensajes automáticos de **WhatsApp y correo** los manda Kommo, no el sitio: se configuran en el Digital Pipeline con la etiqueta `web-cotizar` (pasos 6 y 7).
4. Si Kommo falla, la solicitud no se pierde en silencio (sección 8).

---

## 2. Variables de entorno

Se capturan en **Vercel → tu proyecto → Settings → Environment Variables**, en los entornos **Production** y **Preview**. El archivo `.env.example` del repositorio solo lista los nombres, **sin valores**.

| Variable | ¿Obligatoria? | ¿Secreta? | Qué es | De dónde sale |
|---|---|---|---|---|
| `KOMMO_SUBDOMAIN` | Sí (producción) | No | Tu subdominio de Kommo, por ejemplo `ingeniak` | Paso 3 |
| `KOMMO_TOKEN` | Sí (producción) | **Sí** (márcala como *Secret*) | Token de larga duración de la integración privada | Paso 2 |
| `KOMMO_PIPELINE_ID` | No | No | Número del embudo de las cotizaciones. Sin él: el embudo principal | Paso 4 |
| `KOMMO_STATUS_ID` | No | No | Número de la etapa, p. ej. «Nuevo · Sitio web». Sin él: la primera etapa del embudo | Paso 4 |
| `KOMMO_RESPONSIBLE_USER_ID` | No | No | Número del usuario responsable. Sin él: la asignación por defecto de Kommo | Paso 4 |
| `KOMMO_AGENDA_PIPELINE_ID`, `KOMMO_AGENDA_STATUS_ID` | No | No | Embudo y etapa de las reservas de Discovery y Power Session. Sin ellos: los de la cotización | Paso 4 (detalle en `agenda-configuracion.md`) |
| `NOTIFY_WEBHOOK_URL` | No | Sí | URL que recibe una copia de cada solicitud y las alertas de Kommo (n8n, Make, Slack…) | Tu herramienta de automatización |
| `NOTIFY_WEBHOOK_SECRET` | No | **Sí** | Clave que viaja en la cabecera `x-webhook-secret` para que tu herramienta compruebe que el aviso viene del sitio | La inventas tú (cadena larga al azar) |
| `KOMMO_BASE_URL` | No | No | Solo para pruebas locales con un simulador. **No la pongas en Vercel** | — |

`VERCEL_ENV` la pone Vercel sola; no la definas.

**Sin `KOMMO_SUBDOMAIN` y `KOMMO_TOKEN`:**
- en **Preview** (y en la computadora de desarrollo) el formulario funciona en **modo de prueba**: arma lo que mandaría a Kommo, no llama a nadie y el visitante ve «Modo de prueba · no se envió a Kommo»;
- en **Production** el formulario responde «El formulario no está disponible en este momento» y ofrece WhatsApp y correo. Por eso hay que capturar las variables **antes** de publicar.

---

## 3. Pasos en Kommo y Vercel

Los menús van en español y, entre paréntesis, el texto en inglés.

### Paso 1 · Crea la integración privada
1. Entra a Kommo como administrador.
2. Ve a **Ajustes (Settings) → Integraciones (Integrations)** y pulsa **Crear integración (Create integration)**.
3. Nombre: «Sitio web Ingeniak», con una descripción corta. **Deja vacío** el campo *Redirect URL*.
4. En permisos (*Allow access*) deja todo marcado.
5. Deja **sin marcar** *Control de duplicados (Duplicate control)*: el sitio ya busca al contacto por correo y por WhatsApp antes de crear el lead. Si después prefieres que Kommo fusione solicitudes repetidas, lo activas aquí sin tocar el sitio.
6. Guarda.

### Paso 2 · Genera el token de larga duración
1. Abre la integración → pestaña **Llaves y permisos (Keys and scopes)**.
2. Pulsa **Generar token de larga duración (Generate long-lived token)** y elige el vencimiento (de 1 día a 5 años). Sugerencia: 1 año, con un recordatorio en tu calendario una semana antes.
3. **Cópialo en ese momento**: Kommo no lo vuelve a mostrar. Pégalo directo en Vercel (paso 5); no lo guardes en notas, correos ni chats.

### Paso 3 · Ubica tu subdominio
Es lo que va antes de `.kommo.com` en la barra del navegador. En `https://ingeniak.kommo.com/leads/` el subdominio es `ingeniak`.

### Paso 4 · Elige embudo, etapa y responsable (opcional, recomendado)
1. Decide en qué embudo y etapa deben caer las cotizaciones. Sugerencia: una etapa nueva «Nuevo · Sitio web». Así las automatizaciones de los pasos 6 y 7 solo corren para estas solicitudes.
2. Decide quién será el responsable.
3. Kommo no siempre muestra esos números. Quien tenga el token puede listarlos **en su propia computadora** (con Node 18 o más reciente). El token se escribe solo en esa terminal y no se guarda en ningún archivo:
   ```bash
   KOMMO_SUBDOMAIN=ingeniak KOMMO_TOKEN='pega-aquí-el-token' node -e '(async () => {
     const b = `https://${process.env.KOMMO_SUBDOMAIN}.kommo.com/api/v4`, h = { authorization: `Bearer ${process.env.KOMMO_TOKEN}` };
     const p = await (await fetch(b + "/leads/pipelines", { headers: h })).json();
     for (const x of p._embedded.pipelines) { console.log("EMBUDO", x.id, x.name); for (const s of x._embedded.statuses) console.log("   ETAPA", s.id, s.name); }
     const u = await (await fetch(b + "/users", { headers: h })).json();
     for (const x of u._embedded.users) console.log("USUARIO", x.id, x.name);
   })()'
   ```
   Si prefieres no hacerlo, los tres valores son opcionales.

### Paso 5 · Captura las variables en Vercel y haz Redeploy
1. Vercel → proyecto del sitio → **Settings → Environment Variables**.
2. Agrega una por una (nombre exacto, valor, entornos **Production** y **Preview**): `KOMMO_SUBDOMAIN`, `KOMMO_TOKEN` (márcala **Secret**) y, si los tienes, `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID`, `KOMMO_RESPONSIBLE_USER_ID`. Opcional: `NOTIFY_WEBHOOK_URL` y `NOTIFY_WEBHOOK_SECRET`.
3. Pulsa **Save**.
4. **Redeploy:** ve a **Deployments**, abre el último despliegue y pulsa **Redeploy**. Las variables nuevas o cambiadas **solo aplican a despliegues nuevos**; sin este paso el sitio sigue sin verlas.

### Paso 6 · Correo automático
1. Conecta tu buzón en Kommo (**Correo / Mail**) si aún no lo está.
2. Crea la plantilla en **Correo → Ajustes → Plantillas de correo (Mail → Settings → Email template) → Agregar plantilla**. Texto sugerido: «Hola [nombre], recibimos tu solicitud de cotización. La revisamos y te escribimos por este medio o por WhatsApp para darle seguimiento.» Usa el marcador de nombre que ofrece el editor. **No prometas tiempos de respuesta.**
3. Ve a **Leads → Automatizar (Automate)**. Bajo la etapa del paso 4 pulsa **+** → **Enviar correo (Send email)**.
4. **Condición:** etiqueta `web-cotizar`.
5. **Regla de ejecución:** «Inmediatamente, al crearse en esta etapa» (*when created in this stage*).
6. Elige la plantilla y el remitente, marca «solo al contacto principal» y guarda.

### Paso 7 · WhatsApp automático
1. Requisitos de Kommo: WhatsApp Business conectado; método de pago en tu cuenta de WhatsApp Business en Meta; plan **Advanced, Pro o Enterprise** (o prueba); y el permiso de la persona para recibir WhatsApp (el formulario lo pide con una casilla obligatoria y lo deja anotado en la nota del lead).
2. Crea una **plantilla de WhatsApp** de categoría *Utilidad*. Texto sugerido: «Hola {{1}}, gracias por escribirle a Ingeniak. Recibimos tu solicitud de cotización y te escribimos por aquí para darle seguimiento. Si quieres agregar algo, responde a este mensaje.» Mándala a aprobación: **solo se envían plantillas «Aprobadas»** y Meta puede cobrar cada envío. **No prometas tiempos de respuesta.**
3. Crea el bot: **Automatizaciones → Bots → + Crear bot** → canal **WhatsApp** → «Empezar desde cero» → paso **Mensaje** → tu plantilla → guarda.
4. En **Leads → Automatizar**, bajo la misma etapa, pulsa **+** → **Salesbot**.
5. **Condición:** etiqueta `web-cotizar`. **Regla de ejecución:** «Inmediatamente, al crearse en esta etapa».
6. Elige el bot y guarda.

### Paso 8 · Prueba de punta a punta
1. Abre la URL de **Preview** que te compartimos y envía una cotización con **tus propios datos**.
2. Revisa en Kommo que el lead esté en la etapa elegida, con las etiquetas `web-cotizar`, `servicio-…` y **`entorno-preview`** (así separas las pruebas: puedes filtrarlas y borrarlas), que la nota traiga todo el formulario y que te hayan llegado el correo y el WhatsApp.
3. Repite la prueba en el sitio publicado.
4. Si algo falla, revisa primero el **Redeploy** del paso 5.

---

## 4. Qué llega a Kommo

**Nombre del lead:** `Cotización web · {empresa}`. Sin monto (`price`): el presupuesto es un rango y va en etiqueta y nota.

**Etiquetas** (sirven como condición en Salesbot y Send email):

| Etiqueta | Cuándo |
|---|---|
| `web-cotizar` | Siempre |
| `servicio-<servicio>` | Una por servicio marcado: `agentes-ia`, `crm-ia`, `automatizacion`, `consultoria-ia`, `paid-media`, `web-design`, `seo`, `branding`, `software`, `no-seguro` |
| `presupuesto-<rango>` | `lt-1k`, `1k-3k`, `3k-5k`, `5k-10k`, `10k-20k`, `20k-50k`, `gt-50k`, `no-se` |
| `plazo-<plazo>` | `asap`, `1-3m`, `3-6m`, `explorando` |
| `industria-<industria>` | `salud`, `belleza`, `nutricion`, `finanzas`, `inmobiliario`, `industrial-logistica`, `retail-ecommerce`, `horeca`, `otra` |
| `prefiere-<canal>` | `whatsapp`, `correo` o `llamada` (cómo prefiere que lo contacten) |
| `pagina-<página>` | La página desde la que escribió, p. ej. `pagina-agentes-whatsapp`, `pagina-ind-salud`, `pagina-home`; `pagina-otra` si no se reconoce |
| `entorno-preview` | Solo en envíos desde una URL de Preview |

Idea: un Salesbot distinto para `prefiere-llamada` (aviso interno para llamar) y el de WhatsApp para el resto.

**Nota del lead** (ejemplo; los renglones sin dato no aparecen):

```
Solicitud de cotización · sitio web · Folio IK-6F1C2D
Servicios: Agentes de IA para WhatsApp, CRM con IA (Kommo o GoHighLevel)
Qué quiere lograr primero: Responder rápido a cada cliente
Industria: Salud · Equipo: 11–50 personas
Presupuesto estimado: USD 3,000 a 5,000 · Plazo: En 1 a 3 meses
Canales que usan hoy: WhatsApp, Instagram · CRM actual: Ninguno (Excel, libreta o solo WhatsApp)
—
Nombre: Ana Pérez · Empresa: Clínica Ejemplo
WhatsApp: +523312345678 · Correo: ana@empresa.mx
Prefiere que lo contactemos por: WhatsApp
Sitio o redes: clinicaejemplo.mx
Su proyecto: …
—
Página: /servicios/agentes-ia-whatsapp/ (folio 102) · Botón: hero · Primer clic de la sesión: 102-hero
Llegó por: /blog/kommo-vs-gohighlevel/ · Referrer: https://www.google.com/
UTM: source=google · medium=cpc · campaign=…
Zona horaria: America/Mexico_City · Enviado: 20/10/2026 12:34 (hora del centro de México)
Consentimiento de contacto por WhatsApp y correo: sí (2026-10-20T18:34:00.000Z)
Entorno: production
```

(Los datos del ejemplo son ficticios.) El **folio** (`IK-…`) es el mismo que ve la persona al enviar: si te escribe por WhatsApp con su folio, lo encuentras en la nota.

**Campos de estadísticas:** si tu cuenta tiene los campos de rastreo de Kommo (UTM_SOURCE, UTM_MEDIUM, UTM_CAMPAIGN, UTM_TERM, UTM_CONTENT, REFERRER, GCLID, FBCLID), el sitio los llena también; si no existen, todo queda igual en la nota.

---

## 5. Verificación en el primer Preview (equipo de desarrollo, con el cliente)

Con las variables ya capturadas en Preview y después del Redeploy:

```bash
curl -i -X POST https://<url-del-preview>/api/cotizar/ \
  -H 'origin: https://<url-del-preview>' \
  -H 'content-type: application/json' \
  -d '{}'
```

| Resultado | Qué significa |
|---|---|
| **`HTTP/2 422`** con `content-type: application/json`, `cache-control: no-store`, `x-robots-tag: noindex` y un JSON `{"ok":false,"error":"Revisa los campos marcados.","errors":{…}}` | Correcto: la función está viva y valida. |
| `404` (o una página HTML) | La ruta con barra final no llega a la función. **Avisar al orquestador:** agrega en `vercel.json` el rewrite `{ "source": "/api/:path*/", "destination": "/api/:path*" }` (CAMBIO-COTIZAR §3.1). |
| `308` | Redirección por la barra final: mismo aviso que el 404. |
| `403` `Origen no permitido.` | El `origin` no coincide con el host del Preview: revisa que las dos URL del comando sean iguales. |

Después, la prueba real del paso 8 (formulario desde el Preview → lead con `entorno-preview`). Las respuestas de la función nunca se guardan en caché y nunca se indexan.

---

## 6. Webhook de aviso (opcional)

Si capturas `NOTIFY_WEBHOOK_URL`, el sitio manda un `POST` JSON (con `x-webhook-secret` si capturaste `NOTIFY_WEBHOOK_SECRET`; tiempo límite 5 s):

- **`lead.created`**, después de cada solicitud, haya funcionado Kommo o no: `{ event, site: "ingeniak.mx", source: "cotizar", env, folio, kommo: { ok, status, leadId }, data: { …la solicitud completa… } }`. Las reservas de la agenda usan el mismo aviso con `source: "agenda-discovery"` o `"agenda-power"`.
- **`kommo.alerta`**, cuando Kommo responde con un problema que hay que atender (como mucho una alerta del mismo tipo cada 5 minutos):

| Kommo responde | `alerta` | Qué hacer |
|---|---|---|
| 401 | `renovar token` | Genera un token nuevo (paso 2), reemplázalo en Vercel y haz Redeploy (paso 5). |
| 402 | `cuenta sin pago` | Revisa el pago o la prueba de la cuenta de Kommo. |
| 403 | `permisos o IP bloqueada` | Revisa los permisos de la integración; si Kommo bloqueó la IP por exceso de llamadas, espera o contacta a soporte de Kommo. |
| 429 | `límite de peticiones` | Kommo admite hasta 7 llamadas por segundo: revisa si otra integración está saturando la cuenta. |

El webhook es tu **red de seguridad**: si Kommo falla pero tu webhook recibió la solicitud, la persona ve el mensaje de éxito y tú tienes sus datos completos en tu herramienta.

---

## 7. Mantenimiento del token

- El token de larga duración **vence** en la fecha que elegiste y **no se renueva solo**. Una semana antes: genera uno nuevo (paso 2), reemplaza `KOMMO_TOKEN` en Vercel (Production y Preview) y haz **Redeploy** (paso 5). Después revoca el anterior en la pestaña **Autorización (Authorization) → Revocar acceso (Revoke access)**.
- El token actúa con los permisos del administrador que lo creó: si esa persona deja de ser administradora, genera uno nuevo con otra cuenta de administrador.
- Si crees que el token se filtró: revócalo de inmediato en Kommo y repite el paso 2 y el paso 5.
- Nunca lo pegues en el repositorio, en `.env.example`, en variables `PUBLIC_*`, en correos ni en chats.

---

## 8. Qué ve el visitante en cada caso

| Situación | Lo que ve la persona | Dónde queda la solicitud |
|---|---|---|
| Todo bien | «Recibimos tu solicitud», su folio, los pasos que siguen y el botón «Escríbele a Kain ahora» (WhatsApp) | Lead en Kommo (y copia en el webhook, si existe) |
| Kommo falla, pero el webhook la recibió | Lo mismo que «todo bien» | En tu webhook; además te llega la alerta si fue 401/402/403/429 |
| Kommo falla y no hay webhook (o también falló) | «No pudimos enviar tu solicitud», con **Reintentar**, **Escríbele a Kain** (WhatsApp con el resumen de lo que pidió) y **Enviar por correo** a contacto@ingeniak.mx con todo lo que llenó. Sus respuestas siguen en el formulario. | En el WhatsApp o el correo que la persona decida mandar |
| Producción sin variables de Kommo | «El formulario no está disponible en este momento» con WhatsApp y correo | Igual que la fila anterior |
| Muchos envíos seguidos desde la misma conexión (más de 6 en 10 minutos) | «Recibimos varios envíos seguidos. Espera unos minutos o escríbenos por WhatsApp.» | — |
| Datos incompletos o con error | Los campos marcados con su mensaje, en el paso donde están | — |

Si la persona pulsa dos veces el botón, o reintenta justo después de un éxito, el sitio reconoce el mismo envío y no crea un segundo lead (es una protección razonable, no una garantía absoluta: dos envíos separados de la misma persona sí crean dos leads ligados al mismo contacto).
