# Kommo + Vercel · formulario «Cotizar proyecto» y agenda de las landings (ficha técnica)

Consulta de documentación: **20 de octubre de 2026**. Solo fuentes oficiales (developers.kommo.com, support.kommo.com, vercel.com/docs, docs.astro.build, registro de npm). Las URL y su fecha de actualización están en **§4 Fuentes**.
Estado: investigación y diseño. Todavía no hay código. Nadie del equipo de desarrollo maneja el token de Kommo: solo vive en las variables de entorno de Vercel y lo captura el cliente (§3).

---

## Resumen y recomendación

| Tema | Decisión |
|---|---|
| Crear el lead en Kommo | **`POST /api/v4/leads/complex`** (lead + contacto + empresa en una sola llamada), y enseguida **`POST /api/v4/leads/notes`** con una nota `common` que lleva el formulario completo. Antes, **`GET /api/v4/contacts?query=<correo|teléfono>`** para reutilizar al contacto si ya existe. Entre 2 y 4 peticiones por envío, muy por debajo del límite de 7 por segundo. |
| ¿Y `leads/unsorted/forms`? | No como camino principal: deja el lead en «Incoming leads» hasta que alguien lo acepte, y mientras tanto el contacto no aparece en Listas. El cliente pidió contactar «cuanto antes» por WhatsApp y correo. Si algún día quieren una bandeja de revisión manual, `complex` acepta `_embedded.metadata` con `category: "forms"` y manda el lead a Incoming leads sin cambiar de endpoint (§1.3). |
| Autenticación | Integración privada + **token de larga duración** (de 1 día a 5 años), en el encabezado `Authorization: Bearer <token>`. URL base `https://{subdominio}.kommo.com`, nunca `www.kommo.com`. |
| Recibir el formulario en Vercel | **Función de Vercel en la carpeta raíz `api/`** (runtime Node.js con handler web `Request`/`Response`), **sin adaptador de Astro**. Las 45 páginas siguen igual de estáticas, `astro.config.mjs` no cambia para producción y no se agregan dependencias (Node 24 ya trae `fetch`). |
| Archivos | `api/cotizar.js` (entrada) y `server/kommo.js` y `server/lead.js` (lógica compartida, fuera de `api/`, como recomienda Vercel). Para la agenda, luego: `api/agenda/*.js`, que reutilizan `server/kommo.js` (§2.10). |
| Variables | `KOMMO_SUBDOMAIN`, `KOMMO_TOKEN` (tipo Secret), `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID`, `KOMMO_RESPONSIBLE_USER_ID` y, opcional, `NOTIFY_WEBHOOK_URL` (+ `NOTIFY_WEBHOOK_SECRET`). |
| Probar sin secretos | **Modo simulación (dry-run)**: si faltan `KOMMO_SUBDOMAIN` o `KOMMO_TOKEN` y `VERCEL_ENV` no es `production`, la función valida, arma los JSON exactos que mandaría a Kommo y los regresa con `dryRun: true`, sin llamar a nadie. En producción, sin variables, responde 503 y el modal ofrece WhatsApp y correo, así no se pierde el lead en silencio. |
| WhatsApp y correo automáticos | Se hacen dentro de Kommo, no en el sitio: Digital Pipeline → disparador **Salesbot** (plantilla de WhatsApp aprobada por Meta) y disparador **Send email**, los dos con la regla «inmediatamente al crearse en esta etapa» (§3, pasos 6 y 7). |

**Dos cosas que afectan al diseño del modal:**

- **Consentimiento:** Kommo exige que el cliente haya aceptado recibir WhatsApp del negocio. El modal debe llevar una casilla obligatoria («Acepto que Ingeniak me contacte por WhatsApp y correo sobre mi solicitud») con enlace a `/aviso-privacidad/`. La función registra ese consentimiento en la nota del lead.
- **Teléfono en formato internacional:** el control de duplicados de Kommo busca números en formato internacional (+, lada del país y número). El selector +52 del formulario se convierte a E.164 (`+52` y 10 dígitos) antes de mandarlo.

---

## 1. Kommo API v4: cómo crear el lead desde un formulario web

### 1.1 Autenticación y URL base

- La integración privada se crea en **Ajustes → Integraciones → Crear integración** y solo puede hacerlo un administrador. Si vamos a usar un token de larga duración, el campo Redirect URL se deja vacío.
- Para generar el **token de larga duración**: pestaña *Keys and scopes* → *Generate long-lived token* → elegir el vencimiento (de 1 día a 5 años). Kommo lo muestra **una sola vez**, no tiene `refresh_token`, actúa con los permisos del administrador que lo creó y se revoca desde la pestaña *Authorization* con *Revoke access*.
- Encabezados de cada llamada: `Authorization: Bearer <KOMMO_TOKEN>`, `Content-Type: application/json` y `Accept: application/json`.
- URL base: `https://{KOMMO_SUBDOMAIN}.kommo.com/api/v4/…`. Kommo pide usar el subdominio exacto de la cuenta y no el dominio común, y solo acepta HTTPS (TLS 1.2 recomendado).
- Las respuestas correctas llegan como `application/hal+json` y los errores como `application/problem+json`.

### 1.2 Comparativa

| | `POST /api/v4/leads/complex` | `POST /api/v4/leads/unsorted/forms` |
|---|---|---|
| Qué crea | Lead + 1 contacto + 1 empresa en una llamada. Si el contacto y la empresa son nuevos, Kommo los liga entre sí. | Un **lead entrante** (etapa de sistema «Incoming leads») con contacto y empresa. |
| Dónde aterriza | En la etapa que indiques con `pipeline_id` y `status_id`. Si no indicas nada, en la primera etapa del embudo principal. | En Incoming leads, hasta que alguien lo acepte o lo rechace (`/accept`, `/decline`). |
| Campos obligatorios | Ninguno formalmente; en la práctica, `name` del lead y los datos del contacto. | `source_uid`, `source_name` y `metadata` (`form_id`, `form_name`, `form_page`, `ip`, `form_sent_at`, `referer`). |
| Contacto visible en Listas | Sí, desde el primer momento. | No, hasta que se acepta. |
| Duplicados | Participa en el control de duplicados si la integración lo tiene activado. La respuesta trae `merged: true` cuando hubo fusión. No compara leads de la misma petición entre sí. | No puede haber 2 entidades iguales en Incoming leads: si llega un duplicado, Kommo **etiqueta a los dos** como duplicados en vez de fusionarlos. |
| Etiquetas | `_embedded.tags[]` (por `name` o `id`) o `tags_to_add`. | `_embedded.leads[0]._embedded.tags`. |
| Límites | Hasta 50 leads por petición y 40 valores de campo por entidad. | Límites generales de la API. |
| Disparadores automáticos | Corren los de la etapa elegida (Salesbot, Send email). | El lead tiene que salir de Incoming leads antes. |

### 1.3 Recomendación

Usar **`leads/complex` hacia una etapa activa del embudo** (por ejemplo «Nuevo · Sitio web»), con etiquetas y una nota completa. Es el método que usa el tutorial oficial de Kommo *Lead Capture* para formularios de sitio web, y es el único de los dos que deja el lead justo donde los disparadores de WhatsApp y correo pueden actuar de inmediato.

Variante prevista: si el cliente prefiere revisar cada solicitud a mano, se agrega `_embedded.metadata = { "category": "forms", "form_id": "cotizar", "form_name": "Cotizar proyecto", "form_page": "<url>", "ip": "<ip>", "form_sent_at": <unix>, "referer": "<referrer>" }`. Kommo lo trata entonces como lead entrante e ignora cualquier `status_id` que no sea Incoming leads.

### 1.4 Forma exacta de la petición

**Lead** (objeto dentro del arreglo raíz):

| Campo | Valor | Nota |
|---|---|---|
| `name` | `"Cotización · {empresa} · {nombre}"` | Texto libre. |
| `pipeline_id` | `KOMMO_PIPELINE_ID` (entero) | Opcional. |
| `status_id` | `KOMMO_STATUS_ID` (entero) | Opcional. Debe pertenecer a ese embudo. |
| `responsible_user_id` | `KOMMO_RESPONSIBLE_USER_ID` (entero) | Opcional. Si se omite, Kommo aplica su asignación por defecto. Conviene fijarlo. |
| `price` | **no se envía** | El presupuesto llega como rango, no como monto. No inventamos un valor. |
| `custom_fields_values` | Campos UTM (ver abajo) | Máximo 40. |
| `_embedded.tags` | `[{ "name": "web-cotizar" }, { "name": "servicio-crm-ia" }, …]` | Por nombre. Ver la lista de etiquetas abajo. |
| `_embedded.contacts[0]` | Contacto nuevo `{ name, custom_fields_values }` o existente `{ id }` | Uno solo. |
| `_embedded.companies[0]` | `{ "name": "<empresa>" }` | Solo cuando el contacto es nuevo, para no crear empresas repetidas. Si el contacto ya existía, la empresa va en la nota. |

**Teléfono y correo del contacto** (campos de sistema tipo *multitext*). Se usa `field_code` en lugar de `field_id`; Kommo acepta cualquiera de los dos.

```json
"custom_fields_values": [
  { "field_code": "PHONE", "values": [{ "value": "+523312345678", "enum_code": "MOB" }] },
  { "field_code": "EMAIL", "values": [{ "value": "ana@empresa.mx", "enum_code": "WORK" }] }
]
```

`enum_code` válidos según Kommo: teléfono `WORK`, `WORKDD`, `MOB`, `FAX`, `HOME`, `OTHER`; correo `WORK`, `PRIV`, `OTHER`. Para el WhatsApp del formulario va `MOB`; para el correo corporativo, `WORK`.

**UTM y rastreo.** Los campos de tipo `tracking_data` se crean solos con cada cuenta y aparecen en la sección Estadísticas de la tarjeta del lead. La receta oficial los empata por `code` (en mayúsculas en la API; el ejemplo de webhook muestra `REFERRER`) con los parámetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_referrer`, `referrer`, `gclientid`, `gclid` y `fbclid`. Se llenan como texto:

```json
{ "field_code": "UTM_SOURCE", "values": [{ "value": "google" }] }
```

Precaución: si mandamos un `field_code` que no existe en la cuenta, la petición falla con 400 y se perdería el lead. Por eso:

1. En el primer arranque de la función se consulta una vez `GET /api/v4/leads/custom_fields?limit=250` (paginado), se guarda en memoria el mapa `code → id` de los campos `tracking_data` y solo se mandan los que existen.
2. Si aun así `complex` responde 400 con errores en `custom_fields_values`, se reintenta **una vez** sin campos UTM.
3. Los UTM **siempre** quedan también en la nota.

**Etiquetas propuestas** (sirven de condición en Salesbot y Send email):

- `web-cotizar` en todo envío del modal.
- `servicio-<slug>`, una por cada servicio marcado: `consultoria-ia`, `crm-ia`, `web-design`, `agentes-ia`, `paid-media`, `branding`, `contenido`, `software`, `seo`, `no-seguro`.
- `presupuesto-<código>`: `lt-1k`, `1k-3k`, `3k-5k`, `5k-10k`, `10k-20k`, `20k-50k`, `gt-50k`.
- `entorno-preview` cuando `VERCEL_ENV === "preview"`, para separar las pruebas.
- Agenda: `agenda-discovery` y `agenda-power` (§2.10).

### 1.5 Nota con todo el formulario

`POST /api/v4/leads/notes`. El tipo de entidad va en la ruta (`leads`, `contacts` o `companies`).

```json
[
  {
    "entity_id": 9774766,
    "note_type": "common",
    "params": {
      "text": "Solicitud de cotización · sitio web\nNombre: Ana Pérez\nEmpresa: Empresa Ejemplo (11-50 personas)\nCorreo: ana@empresa.mx · WhatsApp: +523312345678\nServicios: CRM + IA, Agentes IA\nPresupuesto estimado: USD 3,000–5,000\nVisión: …\n—\nPágina: /servicios/crm-ia/ · CTA: hero\nUTM: source=google · medium=cpc · campaign=…\nReferrer: …\nEnviado: 2026-10-20 12:34 (America/Mexico_City)\nConsentimiento WhatsApp y correo: sí"
    }
  }
]
```

- `note_type: "common"` es la nota de texto normal y solo necesita `params.text`.
- `is_need_to_trigger_digital_pipeline` es opcional: si no se manda o vale `true`, la nota puede activar disparadores del Digital Pipeline.
- La documentación no publica un tope de longitud para `text`. Por eso la visión se recorta en el validador (2 000 caracteres) y la nota se mantiene compacta.
- La nota se crea **después** de `complex`, usando el `id` del lead de la respuesta. Si la nota falla, el lead ya existe: se registra el error y se responde OK al visitante.

### 1.6 Duplicados (tres capas)

1. **Nuestra búsqueda previa**, que es la receta oficial *Create a Lead with a Contact with Duplicate Control*: `GET /api/v4/contacts?query=<correo>` (el parámetro `query` busca en los valores de campos personalizados). Un `204 No Content` significa que no existe; entonces se repite con el teléfono E.164. Si aparece, se manda `_embedded.contacts: [{ "id": <id> }]` y **se crea un lead nuevo ligado al contacto existente**: cada solicitud de cotización es una oportunidad nueva y el historial del contacto se conserva. Si hay varios resultados, se usa el primero cuyo valor coincida exactamente.
2. **Control de duplicados de Kommo**: la casilla *Duplicate control* de la integración privada más las reglas de cada embudo (*Automate → Duplicate control → Set up rules*): coincidencia por correo, por teléfono o Big Data; qué hacer si hay datos en conflicto; actualizar, crear nuevo, etc. Con `complex`, los datos «participan en el control de duplicados si la opción está activada para la integración», y la respuesta trae `merged`. **Recomendación inicial:** dejar la casilla de la integración **apagada**. Con la capa 1 basta y así no se funden en silencio dos solicitudes distintas de la misma persona. Si el cliente prefiere fusionar, se activa sin tocar código.
3. **Doble clic**: el modal desactiva el botón al enviar y manda un `submission_id` (UUID). La función recuerda en memoria los últimos IDs de cada instancia y no repite el envío; es un esfuerzo razonable, no una garantía.

### 1.7 Límites y errores

| Código | Cuándo pasa (según Kommo) | Qué hace la función |
|---|---|---|
| 200 / 201 | OK | Sigue con la nota. |
| 204 | La búsqueda de contactos no encontró nada | Crea contacto nuevo. |
| 400 | Validación (`validation-errors[].errors[].path/detail`) | Reintenta una vez sin UTM; si vuelve a fallar → respaldo. |
| 401 | Token inválido, vencido o revocado | Respaldo + alerta a `NOTIFY_WEBHOOK_URL` («renovar token»). |
| 402 | La cuenta de Kommo no está pagada o terminó la prueba | Respaldo + alerta. |
| 403 | Sin permisos para el método, o **IP bloqueada** por violar los límites repetidamente | Respaldo + alerta. |
| 422 | Entidad no procesable (por ejemplo, más de 250 por página) | No debería ocurrir con 1 lead. |
| 429 | Más de **7 peticiones por segundo**; trae `retry_after` (el ejemplo muestra 300 s) | No se espera: respaldo inmediato. |
| 500 / 504 | Error de Kommo | Respaldo. |

Otros límites: hasta 50 leads por `complex` y 40 valores de campo por entidad; hasta 250 entidades por petición (Kommo recomienda 50); 100 webhooks y 50 embudos por cuenta.

«Respaldo» significa: (a) mandar el JSON del lead a `NOTIFY_WEBHOOK_URL` si existe, y (b) responder al navegador `{ ok: false, fallback }` para que el modal ofrezca abrir WhatsApp (`SITE.waBase`, con un texto armado con el resumen) o escribir a contacto@ingeniak.mx. Si el webhook de respaldo sí recibió el lead, al visitante se le responde `ok: true`: el lead no se perdió.

### 1.8 Ejemplo mínimo funcional

```http
POST https://{KOMMO_SUBDOMAIN}.kommo.com/api/v4/leads/complex
Authorization: Bearer {KOMMO_TOKEN}
Content-Type: application/json
Accept: application/json

[
  {
    "name": "Cotización · Empresa Ejemplo · Ana Pérez",
    "pipeline_id": 1111111,
    "status_id": 2222222,
    "responsible_user_id": 3333333,
    "custom_fields_values": [
      { "field_code": "UTM_SOURCE", "values": [{ "value": "google" }] },
      { "field_code": "UTM_MEDIUM", "values": [{ "value": "cpc" }] }
    ],
    "_embedded": {
      "tags": [
        { "name": "web-cotizar" },
        { "name": "servicio-crm-ia" },
        { "name": "presupuesto-3k-5k" }
      ],
      "contacts": [
        {
          "name": "Ana Pérez",
          "custom_fields_values": [
            { "field_code": "PHONE", "values": [{ "value": "+523312345678", "enum_code": "MOB" }] },
            { "field_code": "EMAIL", "values": [{ "value": "ana@empresa.mx", "enum_code": "WORK" }] }
          ]
        }
      ],
      "companies": [{ "name": "Empresa Ejemplo" }]
    }
  }
]
```

Respuesta 200 según la documentación:

```json
[{ "id": 9774766, "contact_id": 12117258, "company_id": 12117260, "request_id": ["0"], "merged": false }]
```

Después va la nota de §1.5 con `entity_id` igual a `9774766`. Los IDs 1111111, 2222222 y 3333333 son ilustrativos: Kommo advierte que los IDs de embudo, etapa y campo son distintos en cada cuenta.

Núcleo en JavaScript (para `server/kommo.js`, sin dependencias):

```js
const base = process.env.KOMMO_BASE_URL || `https://${process.env.KOMMO_SUBDOMAIN}.kommo.com`;
async function kommo(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${base}/api/v4${path}`, {
    method,
    headers: {
      authorization: `Bearer ${process.env.KOMMO_TOKEN}`,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 204) return { status: 204, data: null };
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}
// 1) const c = await kommo(`/contacts?query=${encodeURIComponent(email)}`)
// 2) const r = await kommo('/leads/complex', { method: 'POST', body: [lead] })      → r.data[0].id
// 3) await kommo('/leads/notes', { method: 'POST', body: [{ entity_id: r.data[0].id, note_type: 'common', params: { text } }] })
```

`KOMMO_BASE_URL` no es secreto y es opcional: solo sirve para apuntar a un simulador local de Kommo en pruebas. En producción no se define.

### 1.9 Lo que no hacemos

- **Formularios web propios de Kommo** (*Webforms*): se insertan como iframe (`amo_forms_params`), así que no permiten el diseño de cristal del sitio.
- **Campos personalizados del lead** para servicios, presupuesto y tamaño: necesitarían que el cliente los cree y nos pase sus IDs. Por ahora van como etiquetas y en la nota. Si después los quiere como columnas filtrables, se agregan como variables opcionales.

---

## 2. Recibir el formulario en Vercel (sitio Astro estático)

### 2.1 Opción A · función en la carpeta raíz `api/`

Lo que dicen las fuentes oficiales:

- *Functions API Reference*, pestaña «Other frameworks»: se puede crear una función en otros frameworks, o sin framework, definiéndola en un archivo dentro de `/api` del proyecto; **Vercel despliega como función cualquier archivo del directorio `/api`**.
- *Node.js runtime*: Vercel crea una función por cada archivo fuente compatible en la carpeta raíz `api/`. Firma web: `export default { fetch(request) { … } }` o exportar un método por verbo (`export function GET(request)`). Con `"type": "module"` en `package.json` (este proyecto lo tiene), los `.js` se ejecutan como ES modules. Vercel recomienda dejar las utilidades compartidas **fuera de `api/`** e importarlas desde la función.
- *Astro on Vercel*: «Puedes desplegar una app Astro estática en Vercel sin configuración». El adaptador solo hace falta para SSR, ISR, Image Optimization o Web Analytics.
- *Node.js versions*: 24.x es la versión por defecto en Vercel; también hay 22.x. Localmente se usa Node v24.14.0.

### 2.2 Opción B · adaptador `@astrojs/vercel` con endpoint bajo demanda

- **Versión compatible con astro 5.18.2: `@astrojs/vercel@9.0.5`.** Es la última de la serie 9, con `peerDependencies.astro: ^5.0.0`, publicada el 2026-03-10. La serie 10.x pide `astro ^6`, la 11.x pide `astro ^7` y `latest` es 11.0.16 (2026-10-19). Datos de `npm view`, 2026-10-20.
- Uso: `import vercel from '@astrojs/vercel'; adapter: vercel()` con `output: 'static'`, más `src/pages/api/cotizar.ts` con `export const prerender = false` y `export const POST: APIRoute`.
- Ventaja: `astro dev` sirve el endpoint de forma nativa.
- Costo y riesgo:
  - Cambia la salida del build al formato de Vercel (`.vercel/output`). El gancho `sinDemos` y `npm run check` (que revisa `dist/**/*.html` en el `postbuild`) suponen `dist/` y habría que revalidarlos.
  - Agrega dependencias (`@vercel/nft`, `esbuild`, `@vercel/functions`…).
  - Toca `astro.config.mjs`, que es del orquestador.
  - Al subir a Astro 6 obliga a pasar a la serie 10.

### 2.3 Recomendación: opción A

Tiene menos piezas: un archivo en `api/`, cero dependencias y ningún cambio en el build de Astro ni en la configuración de producción. Las páginas estáticas no corren ningún riesgo, porque Vercel construye Astro igual que hoy y aparte empaqueta `api/`. Es también el patrón que servirá para el port de la agenda (§2.10).

### 2.4 Archivos

```
api/
  cotizar.js          # entrada: export default { fetch } → valida, llama a server/lead.js, responde JSON
server/
  kommo.js            # cliente Kommo: kommo(), buscarContacto(), crearLead(), agregarNota(), camposTracking() (cache)
  lead.js             # normaliza y valida el payload, arma el lead, la nota y las etiquetas; respaldo NOTIFY_WEBHOOK_URL
  catalogos.js        # servicios, presupuestos y tamaños (slug ↔ etiqueta), WhatsApp y correo de contacto
scripts/
  probar-cotizar.mjs  # prueba local sin secretos (modo simulación), ver §2.8
```

- **No importes `src/lib/site.ts` desde `api/` ni desde `server/`**: arrastra `sitemap.json`, `plates.json` y `node:fs`, que no tienen nada que hacer en la función. Los datos de contacto (`https://wa.me/523321017799`, `contacto@ingeniak.mx`) se repiten en `server/catalogos.js`, o el modal los manda.
- Los catálogos de servicios, presupuestos y tamaños los usan el modal (front) y la función (back). Lo más simple es un `src/data/cotizar.json` que el modal importa y que `server/catalogos.js` lee con `import … with { type: 'json' }`. Para que Vercel incluya el JSON en el paquete de la función, la importación debe ser estática.

### 2.5 Contrato del endpoint

`POST /api/cotizar/` con `Content-Type: application/json`, máximo 16 KB. Se llama **con barra final**, igual que el resto del sitio (ver §2.9).

```json
{
  "submission_id": "uuid-v4",
  "nombre": "Ana Pérez",
  "email": "ana@empresa.mx",
  "telefono": { "lada": "+52", "numero": "3312345678" },
  "empresa": "Empresa Ejemplo",
  "servicios": ["crm-ia", "agentes-ia"],
  "presupuesto": "3k-5k",
  "tamano": "11-50",
  "vision": "…",
  "consentimiento": true,
  "extra": { "cargo": "…", "sitio_web": "https://…", "canal_preferido": "whatsapp" },
  "meta": {
    "pagina": "/servicios/crm-ia/", "cta": "hero", "referrer": "https://…",
    "utm_source": "…", "utm_medium": "…", "utm_campaign": "…", "utm_term": "…", "utm_content": "…",
    "gclid": "…", "fbclid": "…", "zona": "America/Mexico_City", "t_llenado_ms": 41250, "hp": ""
  }
}
```

- `extra` es libre y opcional: lo que el diseño del modal agregue (cargo, sitio web, canal preferido, fecha ideal de inicio…) se valida con longitudes máximas y se copia a la nota.
- Campos obligatorios, como en el formulario actual: nombre, correo, empresa, al menos un servicio, presupuesto, visión y, nuevo, el consentimiento.

Respuestas:

| Caso | Respuesta |
|---|---|
| Creado | `200 { ok: true }` |
| Modo simulación | `200 { ok: true, dryRun: true, preview: { complex: [...], note: [...] } }` |
| Datos inválidos | `400 { ok: false, errors: { email: "Revisa tu correo…" } }` (mensajes en español, con tuteo) |
| Método no permitido | `405` |
| Demasiados envíos | `429` |
| Kommo falló y no hubo respaldo | `502 { ok: false, fallback: { whatsapp: "<url wa.me con texto>", email: "contacto@ingeniak.mx" } }` |
| Producción sin variables | `503` con el mismo `fallback` |

Los bots (honeypot `meta.hp` lleno o `t_llenado_ms` < 1 500) reciben `200 { ok: true }` y no se manda nada a Kommo.

### 2.6 Reglas del handler

- Solo `POST`, y el host del encabezado `Origin` debe ser igual a `new URL(request.url).host` (o a `x-forwarded-host`). Así funciona tanto en ingeniak.mx como en las URL de Preview y en local.
- Saneo: quitar caracteres de control y `trim`; longitudes máximas (nombre 120, empresa 160, visión 2 000, `extra` 300 por campo); correo validado con regex; teléfono con 8 a 15 dígitos, convertido a `+<lada><número>`; servicios, presupuesto y tamaño **solo de la lista blanca** del catálogo.
- Límite de envíos en memoria por IP (por ejemplo 6 cada 10 min), como en `riklanderos-web/app/api/lead/route.ts`.
- Tiempo máximo de 8 s por llamada a Kommo (`AbortSignal.timeout`), con 4 llamadas como máximo y en orden.
- Logs **sin datos personales ni token**: solo `leadId`, estado HTTP de Kommo y si se usó el respaldo.
- `NOTIFY_WEBHOOK_URL` (opcional): recibe **siempre** una copia del lead (n8n, Make, Slack…) con el encabezado `x-webhook-secret: NOTIFY_WEBHOOK_SECRET` si existe, y una alerta cuando Kommo responde 401, 402, 403 o 429. Es el mismo patrón `LEAD_WEBHOOK_URL`/`LEAD_WEBHOOK_SECRET` del sitio riklanderos.

### 2.7 Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Obligatoria | Secreta | Ejemplo / nota |
|---|---|---|---|
| `KOMMO_SUBDOMAIN` | sí | no | `ingeniak` (lo que va antes de `.kommo.com`) |
| `KOMMO_TOKEN` | sí | **sí** (tipo *Secret*: solo escritura una vez guardada) | Token de larga duración. Nunca en el repositorio, nunca en `PUBLIC_*`. |
| `KOMMO_PIPELINE_ID` | no | no | Si falta, se usa el embudo principal. |
| `KOMMO_STATUS_ID` | no | no | Si falta, se usa la primera etapa del embudo. |
| `KOMMO_RESPONSIBLE_USER_ID` | no | no | Usuario responsable. |
| `NOTIFY_WEBHOOK_URL` | no | sí | Copia y alertas. |
| `NOTIFY_WEBHOOK_SECRET` | no | sí | Encabezado `x-webhook-secret`. |
| `KOMMO_BASE_URL` | no (solo pruebas) | no | Simulador local. No se define en Vercel. |

`VERCEL_ENV` lo pone Vercel solo (`production`, `preview` o `development`) y está disponible en tiempo de ejecución. Los cambios en variables **solo aplican a despliegues nuevos**: después de guardarlas hay que hacer *Redeploy*. El límite total es de 64 KB de variables por despliegue.

### 2.8 Probar en local sin secretos

1. **Modo simulación (siempre disponible).** Sin `KOMMO_TOKEN` ni `KOMMO_SUBDOMAIN`, y con `VERCEL_ENV` distinto de `production` (en local no existe), la función responde con `dryRun: true` y el JSON exacto de `complex` y `notes`. Es el mismo criterio de `riklanderos-web/app/api/lead/route.ts`: en desarrollo responde OK con un aviso, y en producción, si no hay destino, responde 503.
2. **Script sin servidor** (`node scripts/probar-cotizar.mjs`). Importa el handler y le pasa `Request` reales: casos válidos, sin consentimiento, con honeypot, con teléfono mal escrito o con método GET. Comprobado en esta Mac con Node v24.14.0: un `.mjs` puede importar el handler y recibir su `Response` sin servidor de por medio.
   ```js
   import handler from '../api/cotizar.js';
   const req = new Request('http://127.0.0.1:4321/api/cotizar/', {
     method: 'POST',
     headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:4321', host: '127.0.0.1:4321' },
     body: JSON.stringify(ejemplo),
   });
   const res = await handler.fetch(req);
   console.log(res.status, await res.json());
   ```
3. **El modal dentro de `astro dev` (127.0.0.1:4321).** `astro dev` no sirve la carpeta raíz `api/`, así que sin ayuda el modal recibiría 404. Un plugin de Vite **solo para desarrollo** (`apply: 'serve'`, no toca el build) reenvía `/api/*` al mismo handler. Va en `astro.config.mjs`, que es del orquestador, así que se pide en `materiales/v2/build/peticiones.md`:
   ```js
   function apiLocal() {
     return {
       name: 'ingeniak:api-local',
       apply: 'serve',
       configureServer(server) {
         server.middlewares.use(async (req, res, next) => {
           const { pathname } = new URL(req.url ?? '/', 'http://x');
           const archivo = { '/api/cotizar': '/api/cotizar.js' }[pathname.replace(/\/+$/, '')];
           if (!archivo) return next();
           const { default: h } = await server.ssrLoadModule(archivo);
           const chunks = []; for await (const c of req) chunks.push(c);
           const request = new Request(`http://${req.headers.host}${req.url}`, {
             method: req.method, headers: req.headers,
             body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
           });
           const r = await h.fetch(request);
           res.statusCode = r.status; r.headers.forEach((v, k) => res.setHeader(k, v));
           res.end(Buffer.from(await r.arrayBuffer()));
         });
       },
     };
   }
   // defineConfig({ …, vite: { plugins: [apiLocal()] } })
   ```
   Las capturas con CDP pueden entonces abrir el modal, llenarlo y verificar el estado de éxito en modo simulación.
4. **`vercel dev`** (opcional): es la forma oficial de reproducir las funciones en local, pero exige iniciar sesión en la CLI y vincular el proyecto. No hace falta para lo anterior.
5. **Prueba real en Preview.** El cliente pone las variables también en el entorno *Preview*. Cada envío desde una URL de Preview llega a Kommo con la etiqueta `entorno-preview` y se puede filtrar o borrar. Después se repite en Production.

### 2.9 Riesgos que hay que verificar en el primer Preview

- **`vercel.json` tiene `"trailingSlash": true`.** Según Vercel, una ruta sin barra final responde **308** y redirige a la versión con barra; los archivos con extensión no se redirigen. La documentación no dice explícitamente cómo se comporta con las funciones de `api/`. Prueba: `curl -i -X POST https://<preview>/api/cotizar/ -H 'content-type: application/json' -d '{}'` debe responder **400 JSON de nuestra función**, no 404 ni 308. Si da 404, se agrega en `vercel.json` el rewrite `{ "source": "/api/cotizar/", "destination": "/api/cotizar" }`, que no afecta rutas de Astro. La guía de Astro en Vercel desaconseja rewrites en `vercel.json` para rutas de Astro, y esta no lo es.
- Las cabeceras de `vercel.json` aplican `Cache-Control: public, max-age=0, must-revalidate` a todo lo que no sea un recurso estático, `/api/` incluido. No estorba, pero la función debe responder `Cache-Control: no-store` de todos modos.
- Hay que confirmar que el proyecto de Vercel corre con Node 24.x (*Settings → Build and Deployment*); es el valor por defecto.

### 2.10 Notas para el port de la agenda (Discovery y Power Session)

Esto viene de leer el código de referencia en `/Users/riklanderos/Web Rik Versel/riklanderos-web`; no es documentación externa.

- Rutas de referencia: `app/api/agenda/{disponibilidad,reservar,conectar,limpiar}/route.ts`, la página `/agendar/confirmado` y el cron de `vercel.json` `*/10 * * * *` hacia `/api/agenda/limpiar`.
- Variables que usa: `DISCOVERY_CALENDAR_ID`, `POWER_CALENDAR_ID`, `STRIPE_SECRET_KEY`, `CRON_SECRET`, `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET`, `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. **Mantener esos nombres.**
- Google Calendar se autoriza con **Vercel Connect** (`@vercel/connect`), con conectores ligados a *ese* proyecto: `google/riklanderos-web` y `stripe/riklanderos-web`, sujeto `{type:'user', id:'rik'}`, autorizados desde `/admin/agenda` solo en hosts internos `*.vercel.app` (expresión regular fija en `isAdminHost`). En el proyecto de Ingeniak hay que **crear y autorizar conectores propios** y ajustar esa regex.
- Stripe usa la llave secreta directa: el conector de Vercel para Stripe solo da acceso a MCP.
- Encaja con la opción A: `api/agenda/disponibilidad.js`, `api/agenda/reservar.js`, `api/agenda/limpiar.js` y `api/agenda/conectar.js`, con la lógica en `server/agenda/*.js`. Vercel recomienda agrupar rutas en una sola función, pero agruparlas exigiría rewrites. Archivos separados no necesitan nada más.
- El cron de limpieza se agrega a `vercel.json` (`"crons"`) junto a lo que ya existe.
- Cada reserva también va a Kommo con `server/kommo.js`: etiqueta `agenda-discovery` o `agenda-power`, nota con fecha y hora de la sesión y zona horaria. En Power Session se agrega `pago-pendiente`, y una nota «Pago confirmado» más la etiqueta `pagado` cuando Stripe confirma. Así el WhatsApp y el correo automáticos de §3 también cubren las reservas, con plantillas propias si el cliente quiere.

---

## 3. Guía para el cliente (paso a paso, sin tecnicismos)

> Necesitas acceso de **administrador** en Kommo y en el proyecto de Vercel. Los nombres de los menús van en español y entre paréntesis el texto en inglés, por si tu Kommo está en inglés. **El token nunca se manda por correo ni por WhatsApp:** se copia de Kommo y se pega directo en Vercel.

**Paso 1 · Crea la integración privada en Kommo**
1. Entra a Kommo como administrador.
2. Ve a **Ajustes (Settings) → Integraciones (Integrations)** y pulsa **Crear integración (Create integration)**, arriba a la derecha.
3. Ponle de nombre «Sitio web Ingeniak» y una descripción corta. **Deja vacío** el campo *Redirect URL*.
4. En permisos (*Allow access*) deja todo marcado.
5. Deja **sin marcar** la casilla *Control de duplicados (Duplicate control)*. El sitio ya busca si el contacto existe antes de crear el lead; si después quieres que Kommo fusione solicitudes repetidas, la activas aquí.
6. Guarda.

**Paso 2 · Genera el token de larga duración**
1. Abre la integración y entra a la pestaña **Llaves y permisos (Keys and scopes)**.
2. Pulsa **Generar token de larga duración (Generate long-lived token)** y elige la fecha de vencimiento (puede ir de 1 día a 5 años). Sugerencia: 1 año, con un recordatorio en tu calendario una semana antes.
3. **Cópialo en ese momento**: Kommo no lo vuelve a mostrar. Pásalo al paso 5 sin guardarlo en otro lado.
4. Si algún día lo necesitas, en la pestaña **Autorización (Authorization)** está **Revocar acceso (Revoke access)**.

**Paso 3 · Ubica tu subdominio**
- Es la parte antes de `.kommo.com` en la barra del navegador. Por ejemplo, en `https://ingeniak.kommo.com/leads/` el subdominio es `ingeniak`.

**Paso 4 · Elige embudo, etapa y responsable**
1. Decide en qué embudo y en qué etapa deben aparecer las solicitudes del sitio. Sugerencia: una etapa nueva llamada «Nuevo · Sitio web».
2. Decide qué persona será responsable de esos leads.
3. Kommo no siempre muestra estos números en pantalla. Quien tenga el token puede obtenerlos **en su propia computadora** con este comando: el token se escribe solo en esa terminal y no se guarda en ningún archivo.
   ```bash
   KOMMO_SUBDOMAIN=ingeniak KOMMO_TOKEN='pega-aquí' node -e '
   const b=`https://${process.env.KOMMO_SUBDOMAIN}.kommo.com/api/v4`, h={authorization:`Bearer ${process.env.KOMMO_TOKEN}`};
   const p=await (await fetch(b+"/leads/pipelines",{headers:h})).json();
   for(const x of p._embedded.pipelines){console.log("EMBUDO",x.id,x.name);for(const s of x._embedded.statuses)console.log("   ETAPA",s.id,s.name)}
   const u=await (await fetch(b+"/users",{headers:h})).json();
   for(const x of u._embedded.users)console.log("USUARIO",x.id,x.name)'
   ```
   Si prefieres no hacerlo, los tres valores son opcionales: sin ellos, el lead entra en la primera etapa del embudo principal y Kommo asigna el responsable por defecto.

**Paso 5 · Pon las variables en Vercel**
1. En Vercel abre el proyecto del sitio → **Settings → Environment Variables**.
2. Agrega una por una (nombre exacto, valor, entornos **Production** y **Preview**):
   - `KOMMO_SUBDOMAIN` → tu subdominio (paso 3).
   - `KOMMO_TOKEN` → el token (paso 2). Márcalo como **Secret**, así nadie puede volver a leerlo.
   - `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID` y `KOMMO_RESPONSIBLE_USER_ID` → los números del paso 4, si los tienes.
   - Opcional: `NOTIFY_WEBHOOK_URL` (y `NOTIFY_WEBHOOK_SECRET`), si quieres una copia de cada solicitud en otra herramienta.
3. Pulsa **Save**.
4. Ve a **Deployments**, abre el último despliegue y pulsa **Redeploy**. Las variables solo aplican a despliegues nuevos.

**Paso 6 · Correo automático al instante**
1. Conecta tu buzón en Kommo (sección **Correo / Mail**) si aún no lo está.
2. Crea la plantilla en **Correo → Ajustes → Plantillas de correo (Mail → Settings → Email template) → Agregar plantilla (Add template)**. Ejemplo de texto: «Hola [nombre], recibimos tu solicitud de cotización. Vamos a revisarla y te escribimos por este medio o por WhatsApp para darle seguimiento». Usa el marcador de nombre del contacto que ofrece el editor. **No prometas tiempos de respuesta.**
3. Ve a **Leads → Automatizar (Automate)**. Bajo la etapa del paso 4 pulsa **+** → **Enviar correo (Send email)**.
4. En **Condición**, pon la etiqueta `web-cotizar`.
5. En **Regla de ejecución**, elige «Inmediatamente, al crearse en esta etapa» (*when created in this stage*).
6. Elige la plantilla y el remitente (el responsable o el buzón corporativo), marca «solo al contacto principal» y guarda.

**Paso 7 · WhatsApp automático al instante**
1. Requisitos (los pide Kommo):
   - WhatsApp Business conectado a Kommo.
   - Un método de pago dado de alta en tu cuenta de WhatsApp Business en Meta.
   - Plan **Advanced, Pro o Enterprise** (o prueba de 14 días), porque las plantillas vía Salesbot lo exigen.
   - Que el cliente haya aceptado recibir WhatsApp. El formulario del sitio pide esa casilla.
2. Crea una **plantilla de WhatsApp** (categoría *Utilidad*, porque responde a una solicitud del cliente) con un texto como: «Hola {{1}}, gracias por escribirle a Ingeniak. Recibimos tu solicitud de cotización y te escribimos por aquí para darle seguimiento. Si quieres agregar algo, responde a este mensaje». Envíala a aprobación. **Solo se pueden enviar plantillas con estado «Aprobada»**, y Meta puede cobrar por cada envío.
3. Crea el bot: **Automatizaciones → Bots (Automations → Bots) → + Crear bot** → canal **WhatsApp** → «Empezar desde cero» → paso **Mensaje** → elige tu plantilla → guarda.
4. En **Leads → Automatizar**, bajo la misma etapa, pulsa **+** → **Salesbot**.
5. En **Condición**, pon la etiqueta `web-cotizar`.
6. En **Regla de ejecución**, elige «Inmediatamente, al crearse en esta etapa».
7. Elige el bot y guarda.

**Paso 8 · Prueba de punta a punta**
1. Desde la URL de Preview que te pasemos, envía una cotización con **tus propios datos**.
2. Revisa en Kommo que:
   - el lead aparece en la etapa elegida, con las etiquetas `web-cotizar`, `servicio-…` y `entorno-preview`;
   - la nota trae todo el formulario;
   - te llegaron el correo y el WhatsApp.
3. Repite la prueba en el sitio publicado. Si falla, revisa primero que hiciste el **Redeploy** del paso 5.

**Mantenimiento**
- Antes de que venza el token, genera uno nuevo (paso 2), reemplázalo en Vercel (paso 5) y haz **Redeploy**.
- Si Kommo rechaza el token, la cuenta queda sin pago o se pasan los límites, el sitio ofrece WhatsApp y correo al visitante. Si configuraste `NOTIFY_WEBHOOK_URL`, además te llega una alerta.

---

## 4. Fuentes (todas consultadas el 2026-10-20)

**Kommo · documentación para desarrolladores**
- Complex addition of leads with contact and company: https://developers.kommo.com/reference/complex-leads (actualizada 2026-05-08)
- Add incoming leads from the type form: https://developers.kommo.com/reference/incoming-leads-form (2025-07-11)
- Incoming leads (comportamiento): https://developers.kommo.com/reference/incoming-leads (2025-06-08)
- Metadata objects description: https://developers.kommo.com/reference/metadata (2026-04-22)
- Long-lived Token: https://developers.kommo.com/docs/long-lived-token (2026-03-13)
- Private integration: https://developers.kommo.com/docs/private-integration (2025-06-08)
- Limitations (7 req/s, 429/403, 50/250, 40 campos): https://developers.kommo.com/docs/limitations (2026-03-25)
- HTTP status codes: https://developers.kommo.com/docs/http-codes (2025-06-08)
- Custom fields (field_code, enum_code de PHONE/EMAIL, tracking_data): https://developers.kommo.com/reference/custom-fields (2025-07-11)
- Custom fields list (`code`): https://developers.kommo.com/reference/custom-field-by-entity (2026-09-10)
- Add notes: https://developers.kommo.com/reference/add-notes (2026-07-27)
- Notes types (`common` → `params.text`): https://developers.kommo.com/reference/notes-types (2026-02-03)
- Get pipelines (con etapas): https://developers.kommo.com/reference/pipelines-list (2026-06-30)
- Users list: https://developers.kommo.com/reference/users-list (2025-07-07)
- Contacts list (`query`): https://developers.kommo.com/reference/contacts-list
- Tutorial Lead Capture (formulario web, duplicados, UTM): https://developers.kommo.com/docs/lead-capture (2025-06-08)
- Recipe · Add a lead with UTMs: https://developers.kommo.com/recipes/add-a-lead-with-utms (2025-10-20)
- Recipe · Creating a contact with a phone number and email: https://developers.kommo.com/recipes/creating-a-contact-with-a-phone-number-and-email (2025-06-24)
- Recipe · Create a Lead with a Contact with Duplicate Control: https://developers.kommo.com/recipes/create-a-lead-with-a-contact-with-duplicate-control-1 (2025-06-08)
- Recipe · Lead with Tag: https://developers.kommo.com/recipes/lead-with-tag (2025-06-08)
- Webhooks (ejemplo con `code: "REFERRER"`): https://developers.kommo.com/docs/webhooks-general
- Webforms API (formularios iframe de Kommo): https://developers.kommo.com/docs/webforms-api (2026-01-26)

**Kommo · centro de ayuda**
- Set up digital pipeline triggers (Salesbot, Send email): https://support.kommo.com/docs/set-up-digital-pipeline-triggers (publicada 2026-03-16)
- Salesbot triggers overview (reglas de ejecución y retrasos): https://support.kommo.com/docs/salesbot-triggers-overview
- WhatsApp templates overview (aprobación de Meta, ventana de 24 h, consentimiento, planes): https://support.kommo.com/docs/whatsapp-templates-overview (actualizada 2026-10-16)
- Send templates with WhatsApp Business (Salesbot → paso Message): https://support.kommo.com/docs/send-templates-with-whatsapp-business
- Set up Duplicate control: https://support.kommo.com/docs/set-up-duplicate-control (actualizada 2026-07-07)

**Vercel**
- Functions API Reference (Other frameworks, `/api`): https://vercel.com/docs/functions/functions-api-reference?framework=other&language=ts (2026-08-11)
- Node.js runtime (`api/`, firmas, ESM, utilidades fuera de `api/`): https://vercel.com/docs/functions/runtimes/node-js (2026-08-11)
- Supported Node.js versions (24.x por defecto): https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Astro on Vercel: https://vercel.com/docs/frameworks/frontend/astro (2026-08-26)
- vercel.json (`trailingSlash`): https://vercel.com/docs/project-configuration/vercel-json
- vercel dev: https://vercel.com/docs/cli/dev (2026-08-11)
- Environment variables (aplican a despliegues nuevos, Secret, 64 KB): https://vercel.com/docs/environment-variables
- Managing environment variables (pasos en el dashboard, Redeploy): https://vercel.com/docs/environment-variables/managing-environment-variables
- System environment variables (`VERCEL_ENV`): https://vercel.com/docs/environment-variables/system-environment-variables

**Astro y npm**
- @astrojs/vercel (la página muestra v11.0.16): https://docs.astro.build/en/guides/integrations-guide/vercel/
- Registro de npm (`npm view @astrojs/vercel`, 2026-10-20): 9.0.5 → `astro ^5.0.0` (2026-03-10); 10.0.8 → `astro ^6`; 11.0.16 → `astro ^7` (`latest`).
