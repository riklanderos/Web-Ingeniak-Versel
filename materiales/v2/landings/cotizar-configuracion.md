# Formulario «Cotizar proyecto» → Kommo · guía de configuración

**Para:** el equipo de Ingeniak (quien administra Kommo y el proyecto de Vercel).
**Fecha:** 20 de octubre de 2026 (actualizada con la estructura de 3 embudos que aprobaste ese día). **Base técnica:** `CAMBIO-COTIZAR.md` §3 y `kommo-vercel-tecnico.md` §1–§2.
**Plantillas y automatizaciones de Kommo** (WhatsApp, correo, bots y tareas): la única guía es `kommo-setup.md` §8 y §9. Esta guía solo te remite a ella.

> **No sigas la sección 3 de `kommo-vercel-tecnico.md`** («Guía para el cliente»): es de antes de la estructura aprobada (habla de otra etapa y de otras etiquetas) y su paso 4 escribe el token dentro de un comando, que queda guardado en el historial de la Terminal. Para todo lo que hagas tú, usa esta guía y `kommo-setup.md`.

> Necesitas acceso de **administrador** en Kommo y en el proyecto de Vercel.
> **El token de Kommo nunca se manda por correo, WhatsApp ni chat:** se copia de Kommo y se pega directo en Vercel (y, una sola vez, en tu propia Terminal para correr el script de configuración). Nadie del equipo de desarrollo lo necesita ni lo ve.

---

## 1. Cómo funciona

1. La persona llena el formulario de 3 pasos (Qué necesitas · Tu negocio · Contacto) en cualquier página del sitio.
2. El sitio lo manda a su propia función (`/api/cotizar/`), que revisa los datos y crea en Kommo, de una sola vez:
   - un **lead** llamado `Cotización web · {empresa}` en el embudo **«Sitio web · Cotizaciones»**, etapa **«Nueva cotización»**;
   - sus **campos** llenos con lo que contestó (servicios, objetivo, industria, tamaño, presupuesto, plazo, CRM, canales, cómo prefiere que lo contacten y la página desde la que escribió; sección 4);
   - el **contacto** (nombre, WhatsApp en formato internacional y correo) y la **empresa**. Si el correo o el WhatsApp ya existen en Kommo, el lead nuevo se liga a ese contacto y no se duplica;
   - **etiquetas** para tus automatizaciones (sección 4);
   - una **nota** con todo lo que llenó la persona, la página desde la que escribió, de dónde llegó (UTM, Google, Meta) y la fecha y hora del centro de México.
3. Los mensajes automáticos de **WhatsApp y correo** los manda Kommo, no el sitio: se configuran a mano en el Digital Pipeline, en la etapa «Nueva cotización», siguiendo `kommo-setup.md` §8 y §9 (pasos 6 y 7).
4. Si Kommo falla, la solicitud no se pierde en silencio (sección 8).

**El sitio encuentra la estructura por nombre.** No hace falta copiar números de embudos, etapas ni campos: el sitio busca en tu cuenta los nombres exactos que creó el script de configuración (paso 4) y los recuerda 10 minutos. Por eso:
- **No cambies esos nombres en Kommo** (embudos, etapas, campos ni opciones de las listas). Si cambias uno, ese dato deja de llenarse (el lead sigue llegando y el dato sigue en la nota). Si necesitas cambiar un nombre, avísanos para cambiarlo también en el sitio.
- Si todavía no corres el script, el sitio funciona igual que antes: el lead entra al embudo principal con su nota completa y sus etiquetas.
- Un cambio en Kommo (por ejemplo, después de correr el script) se nota en el sitio en máximo 10 minutos; si lo quieres al instante, haz **Redeploy** (paso 5).

---

## 2. Variables de entorno

Se capturan en **Vercel → tu proyecto → Settings → Environment Variables**, en los entornos **Production** y **Preview**. El archivo `.env.example` del repositorio solo lista los nombres, **sin valores**.

**Después de correr el script de configuración (paso 4) solo necesitas dos variables de Kommo: `KOMMO_SUBDOMAIN` y `KOMMO_TOKEN`.** Las demás `KOMMO_*` son opcionales: el sitio encuentra solo, por nombre, cada embudo y cada etapa. Si capturas las que el script imprime en su bloque «Variables para Vercel» (`kommo-setup.md` §7), tampoco pasa nada: apuntan a los mismos embudos y etapas, y cada reserva sigue entrando a su propia etapa.

| Variable | ¿Obligatoria? | ¿Secreta? | Qué es | De dónde sale |
|---|---|---|---|---|
| `KOMMO_SUBDOMAIN` | Sí (producción) | No | Tu subdominio de Kommo, por ejemplo `ingeniak` | Paso 3 |
| `KOMMO_TOKEN` | Sí (producción) | **Sí** (márcala como *Secret*) | Token de larga duración de la integración privada | Paso 2 |
| `KOMMO_RESPONSIBLE_USER_ID` | No | No | Número del usuario responsable de los leads del sitio. Sin él: la asignación por defecto de Kommo | Opcional (ver nota abajo) |
| `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID` | No | No | Embudo y etapa de las cotizaciones: mandan sobre «Sitio web · Cotizaciones» / «Nueva cotización» (sirven para forzar otros). También son el respaldo de la agenda si no existiera «Agenda · Sesiones» | Bloque del script (`kommo-setup.md` §7) |
| `KOMMO_AGENDA_PIPELINE_ID`, `KOMMO_AGENDA_STATUS_ID` | No | No | Para las reservas: el embudo manda sobre «Agenda · Sesiones». La etapa es **solo un respaldo**: cada reserva entra a su etapa por nombre («Discovery agendada» o «Power Session por pagar») y esta variable se usa únicamente si esa etapa no existe en tu cuenta (detalle en `agenda-configuracion.md`) | Bloque del script (`kommo-setup.md` §7) |
| `NOTIFY_WEBHOOK_URL` | No | Sí | URL que recibe una copia de cada solicitud y las alertas de Kommo (n8n, Make, Slack…) | Tu herramienta de automatización |
| `NOTIFY_WEBHOOK_SECRET` | No | **Sí** | Clave que viaja en la cabecera `x-webhook-secret` para que tu herramienta compruebe que el aviso viene del sitio | La inventas tú (cadena larga al azar) |
| `KOMMO_BASE_URL` | No | No | Solo para pruebas locales con un simulador. **No la pongas en Vercel** | — |

`VERCEL_ENV` la pone Vercel sola; no la definas.

**Si ya habías capturado `KOMMO_PIPELINE_ID` o `KOMMO_STATUS_ID`** con los números de una configuración anterior (otro embudo u otra etapa): bórralas en Vercel, o reemplázalas por los números que imprime el script, y haz Redeploy. Si se quedan con los números viejos, siguen mandando y las cotizaciones no llegarían a «Sitio web · Cotizaciones».

**Responsable (opcional):** sin `KOMMO_RESPONSIBLE_USER_ID`, Kommo aplica su asignación por defecto. Si quieres fijar quién recibe los leads del sitio, avísanos y te ayudamos a ubicar el número de ese usuario (sin que nadie más vea tu token).

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

### Paso 4 · Crea la estructura en Kommo con el script (una sola vez)
El script de configuración (`scripts/kommo-configurar.mjs`) crea en tu cuenta lo que aprobaste: los 3 embudos («Sitio web · Cotizaciones», «Agenda · Sesiones», «Clientes · Implementación») con sus etapas, los 15 campos del lead con sus opciones, las 10 etiquetas y las respuestas rápidas del equipo. Los nombres salen de un solo archivo (`shared/kommo-esquema.js`), el mismo que usa el sitio para encontrarlos.
1. Lo corres **tú, en tu propia computadora**, desde la Terminal, dentro de la carpeta del proyecto (las instrucciones completas vienen con el script).
2. El script te pide el token **oculto** (no se ve mientras lo pegas) o lo toma de la variable `KOMMO_TOKEN` de esa misma Terminal. Solo vive en la memoria mientras corre: **no se guarda en ningún archivo ni aparece en pantalla**.
3. Las **plantillas de WhatsApp** las manda a aprobación Meta desde Kommo, y las **automatizaciones** del Digital Pipeline se configuran a mano (pasos 6 y 7, con `kommo-setup.md` §8 y §9).
4. Para comprobar que el sitio ya ve la estructura, en el Preview abre `/api/agenda/estado/`: debe decir `"kommoEstructura": "completa"`. Si dice `"incompleta"`, la lista `kommoFaltan` te dice qué nombre no encontró (sección 5.2 de `agenda-configuracion.md`). Si corriste el script con `--sin-clientes`, también debe decir `"completa"`: el sitio no usa el embudo «Clientes · Implementación» y lo menciona aparte, en `kommoOpcional`.

Si todavía no corres el script, todo funciona igual que antes (embudo principal + nota completa); solo no se llenan los campos ni se usa el embudo «Sitio web · Cotizaciones».

### Paso 5 · Captura las variables en Vercel y haz Redeploy
1. Vercel → proyecto del sitio → **Settings → Environment Variables**.
2. Agrega una por una (nombre exacto, valor, entornos **Production** y **Preview**): `KOMMO_SUBDOMAIN` y `KOMMO_TOKEN` (márcala **Secret**). Opcional: `KOMMO_RESPONSIBLE_USER_ID`, `NOTIFY_WEBHOOK_URL` y `NOTIFY_WEBHOOK_SECRET`. `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID`, `KOMMO_AGENDA_PIPELINE_ID` y `KOMMO_AGENDA_STATUS_ID` no hacen falta; si las capturas (como sugiere `kommo-setup.md` §7), usa exactamente los números del bloque «Variables para Vercel» del script y borra las que vinieran de una configuración anterior.
3. Pulsa **Save**.
4. **Redeploy:** ve a **Deployments**, abre el último despliegue y pulsa **Redeploy**. Las variables nuevas o cambiadas **solo aplican a despliegues nuevos**; sin este paso el sitio sigue sin verlas.

### Paso 6 · Correo automático
Sigue **`kommo-setup.md`**: §8.7 (la plantilla de correo «Recibimos tu solicitud de cotización») y §9.1–9.2, fila 2 (el disparador *Enviar correo* en «Sitio web · Cotizaciones» → «Nueva cotización», con la etiqueta `web-cotizar` como condición). Ahí también está la tarea automática «Contactar» (fila 3).

**No crees otra plantilla ni otro disparador aparte de los de esa guía:** si hay dos, a la persona le llegan dos correos.

### Paso 7 · WhatsApp automático
Sigue **`kommo-setup.md`**: §1 (requisitos: WhatsApp Business conectado, método de pago en tu cuenta de WhatsApp Business de Meta y plan Advanced, Pro o Enterprise), §8.1 (la plantilla `ik_primer_contacto_cotizacion`, que mandas a aprobación de Meta) y §9.1–9.2, fila 1 (su bot y el Salesbot en «Nueva cotización», con la etiqueta `web-cotizar` como condición). Solo se envían plantillas **aprobadas** y Meta puede cobrar cada envío.

El permiso de la persona para recibir WhatsApp lo pide el formulario con una casilla obligatoria y queda anotado en la nota del lead.

**No crees otra plantilla ni otro bot aparte de los de esa guía:** si hay dos, la persona recibe dos WhatsApp. Si después quieres más automatizaciones (por ejemplo, un aviso interno cuando «Contacto preferido» = Llamada), agrégalas sobre las de `kommo-setup.md` §9, no en lugar de ellas.

### Paso 8 · Prueba de punta a punta
1. Abre la URL de **Preview** que te compartimos y envía una cotización con **tus propios datos**.
2. Revisa en Kommo que el lead esté en **«Sitio web · Cotizaciones» → «Nueva cotización»**, con sus campos llenos (servicios, industria, presupuesto…), con las etiquetas `web-cotizar`, `orgánico` (o `campaña` si llegaste desde un anuncio) y **`entorno-preview`** (así separas las pruebas: puedes filtrarlas y borrarlas), que la nota traiga todo el formulario y que te hayan llegado el correo y el WhatsApp.
3. Repite la prueba en el sitio publicado (ahí ya no lleva `entorno-preview`).
4. Si algo falla, revisa primero el **Redeploy** del paso 5 y luego `/api/agenda/estado/` en el Preview (paso 4, punto 4).

---

## 4. Qué llega a Kommo

**Nombre del lead:** `Cotización web · {empresa}`. Sin monto (`price`): el presupuesto es un rango y va en su campo y en la nota.

**Embudo y etapa:** «Sitio web · Cotizaciones» → «Nueva cotización» (o lo que digan `KOMMO_PIPELINE_ID` / `KOMMO_STATUS_ID`, si las capturaste). Sin la estructura: el embudo principal.

**Campos del lead** (cada respuesta se guarda con la opción exacta de la lista; si una opción no existe en Kommo, ese campo se queda vacío y el dato sigue en la nota):

| Dato del formulario | Campo en Kommo |
|---|---|
| Servicios que marcó (puede marcar varios) | Servicios de interés |
| Qué quiere lograr primero | Objetivo principal |
| Industria | Industria |
| Tamaño del equipo | Tamaño de empresa |
| Presupuesto estimado | Presupuesto estimado |
| Plazo | Plazo |
| CRM que usa hoy (opcional) | CRM actual |
| Canales que usa hoy (opcional, varios) | Canales que usa hoy |
| Cómo prefiere que lo contacten | Contacto preferido |
| Página desde la que escribió (automático) | Página de origen (por ejemplo `https://ingeniak.mx/servicios/agentes-ia-whatsapp/`) |

**Etiquetas** (las 10 aprobadas; sirven como condición en Salesbot y Send email). Las de servicio, presupuesto, plazo, industria, contacto y página que usaba la versión anterior **ya no se mandan**: ahora esos datos viven en sus campos.

| Etiqueta | Cuándo |
|---|---|
| `web-cotizar` | Siempre |
| `campaña` | Si llegó desde un anuncio: trae `gclid`, `fbclid`, `gbraid` o `wbraid`, o un `utm_medium` de pago (`cpc`, `ppc`, `paid…`, `display`, `ads`…) |
| `orgánico` | En cualquier otro caso |
| `entorno-preview` | En todo envío que **no** venga del sitio publicado (Preview o pruebas locales) |

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

Luego, que el sitio vea la estructura de Kommo (embudos, etapas, campos y opciones):

```bash
curl -s https://<url-del-preview>/api/agenda/estado/
```

| `kommoEstructura` | Qué significa |
|---|---|
| `"completa"` | Correcto: el script ya corrió y el sitio encuentra todo lo que usa (los embudos «Sitio web · Cotizaciones» y «Agenda · Sesiones» con sus etapas, y los 15 campos con sus opciones). |
| `"incompleta"` | Falta algo; `kommoFaltan` dice qué (por ejemplo `Campo «Plazo»` u `Opción «Otra» (Industria)`). Vuelve a correr el script o corrige el nombre en Kommo. Mientras tanto los leads llegan igual, sin ese dato en su campo. |
| `"sin-estructura"` | El script aún no se corre: los leads entran al embudo principal, con nota completa. |
| `"error"` / `"sin-configurar"` | Kommo no respondió, o faltan `KOMMO_SUBDOMAIN` / `KOMMO_TOKEN` en Preview. |

Si además aparece `kommoOpcional` (por ejemplo `Embudo «Clientes · Implementación»`), es solo informativo: ese embudo lo usa tu equipo, no el sitio (falta si corriste el script con `--sin-clientes`). No cambia el resultado; si lo quieres, vuelve a correr el script sin esa opción.

Después, la prueba real del paso 8 (formulario desde el Preview → lead en «Sitio web · Cotizaciones» con `entorno-preview`). Las respuestas de la función nunca se guardan en caché y nunca se indexan.

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
