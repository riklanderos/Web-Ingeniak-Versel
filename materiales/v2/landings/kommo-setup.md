# Kommo · dejar lista la cuenta de Ingeniak (guía paso a paso)

> **Actualización · 20 de octubre de 2026 (noche):** la estructura de 3 embudos quedó sustituida por el **plan de reestructura** (`kommo-plan-reestructura.md`), que un agente ejecutará por API sobre la cuenta real. Equivalencias donde esta guía diga lo contrario:
> «Sitio web · Cotizaciones» → **«Ventas»** (el P1 11303859); «Agenda · Sesiones» → se divide: las **Discovery** caen en «Ventas» → etapa **«Discovery agendada» (97185916)** y las **Power Session** en su propio embudo **«Power Session»**; «Clientes · Implementación» ya no lo crea el sitio (lo administra el equipo en el embudo Clientes/Licencias).
> Variables: `KOMMO_AGENDA_PIPELINE_ID`/`KOMMO_AGENDA_STATUS_ID` siguen funcionando como alias de `KOMMO_POWER_PIPELINE_ID`/`KOMMO_POWER_STATUS_ID`; nueva `KOMMO_DISCOVERY_STATUS_ID` (respaldo = 97185916, opcional). El script `kommo-configurar.mjs` ya crea/verifica la estructura nueva (2 embudos del sitio); córrelo DESPUÉS de la reestructura.

**Para:** quien administra la cuenta de Kommo de Ingeniak.
**Fecha:** 20 de octubre de 2026. **Estructura aprobada ese día:** 3 embudos, 15 campos del lead, 10 etiquetas, 6 plantillas de respuesta, 6 plantillas de WhatsApp y las automatizaciones del Digital Pipeline.
**Fuente única de los nombres:** `shared/kommo-esquema.js` (el script y el sitio usan exactamente los mismos nombres).

> **Tu token es tuyo.** Nadie del equipo de desarrollo lo necesita ni lo ve. Lo pegas tú, en tu Terminal y en Vercel. El script lo guarda solo en la memoria mientras corre: no lo muestra, no lo escribe en ningún archivo y lo tapa si Kommo llegara a repetirlo en un error. Nunca lo mandes por correo, WhatsApp ni chat.

---

## 0. En corto

| Parte | Quién la hace | Cómo | Tiempo aproximado |
|---|---|---|---|
| Embudos, etapas, campos, etiquetas y plantillas de respuesta | El script, en tu computadora | Pasos 1 a 5 | 10 minutos |
| Variables en Vercel | Tú | Paso 6 | 5 minutos |
| Plantillas de WhatsApp (aprobación de Meta) | Tú, en Kommo | Sección 8 | 20 minutos + lo que tarde Meta (de minutos a 48 h) |
| Correo automático, bots y tareas automáticas | Tú, en Kommo | Sección 9 | 30 minutos |

El script **nunca borra ni renombra nada**. Si algo ya existe con el mismo nombre, lo deja como está. Lo puedes correr las veces que quieras: no duplica.

---

## 1. Antes de empezar

- Entra a Kommo con una cuenta de **administrador** (crear embudos, campos y plantillas por la API es solo para administradores).
- Una **Mac con Node** (el programa que corre el script). Para saber si lo tienes, en Terminal escribe `node --version`: debe decir `v18` o más (el proyecto usa `v24`). Si no lo tienes, descarga la versión **LTS** de [nodejs.org](https://nodejs.org) e instálala como cualquier programa.
- La carpeta del proyecto en tu Mac: `/Users/riklanderos/Web Ingeniak Versel`.
- Para mandar WhatsApp automáticos (sección 9): WhatsApp Business conectado a Kommo, un método de pago en tu cuenta de WhatsApp Business de Meta y plan **Advanced, Pro o Enterprise** (o la prueba de 14 días). Las plantillas por Salesbot lo exigen.
- **Zona horaria de Kommo = Ciudad de México.** En Kommo: **Ajustes (Settings) → Configuración general (General settings) → Zona horaria (Time zone)** → elige la de **Ciudad de México** (puede aparecer como «(GMT-06:00) Ciudad de México» o «America/Mexico_City») y guarda. Importa porque el sitio guarda la «Fecha de la sesión» de cada reserva y Kommo la muestra **con la zona horaria de la cuenta**: si la cuenta tiene otra, los WhatsApp de confirmación y de recordatorio (sección 8) dirían una hora equivocada aunque el texto diga «hora del centro de México». El script revisa esta zona y, si no es la de Ciudad de México, te lo marca con `⚠ Revisa`.

---

## 2. Paso 1 · Crea la integración privada y tu token

**¿El sitio ya manda cotizaciones a Kommo?** (es decir, ya hay un token en Vercel, en `KOMMO_TOKEN`)
- **Si todavía tienes ese mismo token a la mano:** úsalo también para el script (lo pegas en la pregunta oculta del paso 3). **No generes otro.** La documentación de Kommo no dice si un token nuevo desactiva el anterior; si lo hiciera, el token de Vercel dejaría de servir y **todas las cotizaciones fallarían** sin que lo notes.
- **Si ya no lo tienes** (Vercel no deja volver a ver una variable marcada como *Sensitive*, y está bien que no lo hayas guardado): genera uno nuevo de **1 año** (punto 6), úsalo en el script **y reemplaza con ese mismo** `KOMMO_TOKEN` en Vercel, con Redeploy (paso 6). Así el sitio nunca se queda con un token que pudo desactivarse.
- En los dos casos, al terminar haz la comprobación del paso 6 (`/api/agenda/estado/` y una cotización de prueba).

Si ya creaste la integración «Sitio web Ingeniak» siguiendo `cotizar-configuracion.md`, usa esa misma y salta al punto 6.

1. En Kommo: **Ajustes (Settings) → Integraciones (Integrations)** → botón **Crear integración (Create integration)**, arriba a la derecha.
2. Nombre: «Sitio web Ingeniak». Descripción: «Formulario del sitio, agenda y configuración».
3. **Deja vacío** el campo *Redirect URL* (con token de larga duración no se usa).
4. **Permitir acceso (Allow access):** deja **todo marcado**, como viene. El script usa el acceso a los datos de la cuenta (embudos, campos, etiquetas, plantillas) y el de usuarios (para listar a tu equipo).
5. Deja **sin marcar** *Control de duplicados (Duplicate control)*: el sitio ya busca al contacto por correo y WhatsApp antes de crear el lead.
6. **Guardar**. Abre la integración → pestaña **Llaves y permisos (Keys and scopes)** → **Generar token de larga duración (Generate long-lived token)** → elige **1 año** y ponle un recordatorio en tu calendario una semana antes de que venza.
   - Usa **un solo token** para el script y para Vercel. No generes uno aparte «solo para el script»: si Kommo desactivara el anterior al crear otro, el sitio se quedaría sin conexión.
7. **Copia el token en ese momento:** Kommo no lo vuelve a mostrar. Pégalo cuando el script te lo pida y en Vercel (paso 6). No lo pegues en notas, correos ni chats.

> **Usa siempre la misma integración.** Kommo solo le muestra a una integración las plantillas de respuesta que esa misma integración creó. Si corres el script con el token de otra integración, no las vería y las crearía otra vez.

---

## 3. Paso 2 · Abre Terminal en la carpeta del proyecto

1. Pulsa **⌘ + espacio**, escribe **Terminal** y pulsa Enter.
2. Copia y pega esta línea (con las comillas) y pulsa Enter:
   ```bash
   cd "/Users/riklanderos/Web Ingeniak Versel"
   ```
3. Comprueba que Node está: `node --version`.

---

## 4. Paso 3 · Prueba (no cambia nada)

1. Pega y pulsa Enter:
   ```bash
   node scripts/kommo-configurar.mjs --prueba
   ```
2. **Subdominio:** escribe lo que va antes de `.kommo.com` en tu navegador (en `https://ingeniak.kommo.com/leads/` es `ingeniak`). También acepta `ingeniak.kommo.com` o la dirección completa.
3. **Token:** pégalo con **⌘ + V** cuando te lo pida y pulsa Enter. **No vas a ver nada mientras lo pegas, ni asteriscos: es normal.** Verás «✓ Token recibido». Pégalo **solo ahí**: no lo escribas dentro del comando ni lo pongas en una variable de la Terminal, porque lo que escribes en la Terminal queda guardado en su historial.
4. El script revisa tu cuenta y te muestra **el plan**: lo que crearía, lo que ya existe y si algo choca. Al final te dice «No se cambió nada en Kommo».

Qué significa cada marca en el plan:

| Marca | Significa |
|---|---|
| `+ Se crearía` | No existe; con `--aplicar` se crea. |
| `↺ Ya existe` | Ya está; no se toca. Si al lado dice «existe escrito «…»», está escrito un poco distinto (mayúsculas o un guion corto en vez de largo, por ejemplo «1-10» en vez de «1–10»). El sitio lo reconoce igual y lo usa, así que el script **no crea otro casi igual**. |
| `~ Se agregarían opciones` | El campo existe, pero le faltan opciones de la lista; con `--aplicar` se agregan **sin quitar** las que ya tiene (tampoco las que agregaste tú). Las que ya están escritas casi igual no se repiten. |
| `⚠ Revisa` | No bloquea nada, pero conviene arreglarlo en Kommo. Por ahora solo se usa para la zona horaria (sección 1). |
| `❌ Problema` | Algo choca (por ejemplo, un campo con el mismo nombre pero de otro tipo, o un embudo archivado). El script no lo arregla solo: te dice qué hacer. |

---

## 5. Paso 4 · Aplica

1. Si el plan se ve bien:
   ```bash
   node scripts/kommo-configurar.mjs --aplicar
   ```
2. Te vuelve a pedir subdominio y token (el token no se guardó en ningún lado). Tarda unos 15 segundos: va despacio a propósito (máximo 5 peticiones por segundo; Kommo admite 7).
3. Opciones, si las necesitas (se pueden combinar):
   - `--sin-clientes` → no crea el embudo «Clientes · Implementación».
   - `--sin-plantillas` → no crea las 6 plantillas de respuesta.
   - `--ayuda` → muestra todas las opciones.
4. Al terminar verás el **Reporte final**:

| Marca | Significa |
|---|---|
| `✅ Creado` | Se creó ahora. Al lado va su ID. |
| `↺ Ya existía` | Ya estaba; no se tocó. Al lado va su ID (y, si está escrito un poco distinto, cómo está escrito). |
| `➕ Opciones agregadas` | Al campo le faltaban opciones y se agregaron. |
| `⚠ Revisa` | No bloquea nada; arréglalo en Kommo cuando puedas (por ejemplo, la zona horaria). |
| `❌ Falló` | No se pudo; al lado va el motivo y qué hacer. El resto sí se hizo. |

Si algo falla, corrige lo que dice y **vuelve a correr el mismo comando**: crea solo lo que falta.

Lo que el script crea (nombres exactos de `shared/kommo-esquema.js`):

| Embudo | Etapas (en orden) |
|---|---|
| Sitio web · Cotizaciones | Nueva cotización · Contactado · Calificado · Propuesta enviada · Negociación |
| Agenda · Sesiones | Discovery agendada · Power Session por pagar · Power Session pagada · Sesión realizada · Propuesta enviada |
| Clientes · Implementación | Arranque · Implementación (7–30 días) · En operación · Renovación |

Las etapas finales **Ganado** y **Perdido** las crea Kommo solo en cada embudo (con el nombre que use tu cuenta según su idioma). Los embudos nuevos no cambian cuál es tu embudo principal y entran sin la columna «Leads entrantes»: las solicitudes del sitio caen directo en la primera etapa. Si quieres esa columna, se activa en Kommo en la configuración del embudo.

- **15 campos del lead:** Servicios de interés, Objetivo principal, Industria, Tamaño de empresa, Presupuesto estimado, Plazo, CRM actual, Canales que usa hoy, Contacto preferido, Facturación mensual, Tipo de sesión, Fecha de la sesión (fecha y hora), Enlace de Meet, Pago Power Session y Página de origen.
- **10 etiquetas:** `web-cotizar`, `web-agenda`, `discovery`, `power-session`, `campaña`, `orgánico`, `referido`, `hot-lead`, `reactivación`, `entorno-preview`.
- **6 plantillas de respuesta** (respuestas de un clic para tu equipo en el chat; editables en Kommo): Precio de referencia, Enlace a Discovery Session, Enlace a Power Session, Qué es Kain, Siguiente paso tras cotizar, Reagendar sesión. Si Kommo no deja crearlas, el script imprime los textos para que las captures en **Automatizaciones → Plantillas → Plantillas de chat**.

### Si aparece un error

| Mensaje | Qué hacer |
|---|---|
| «El token no es válido o ya venció (401)» | Genera otro token (paso 1, punto 6) y vuelve a correr el comando. |
| «Tu cuenta de Kommo no tiene un plan activo… (402)» | Revisa el pago o la prueba de Kommo. |
| «Kommo negó el permiso (403)» | El token debe generarlo un administrador y la integración debe tener todos los permisos marcados. Si corriste el script muchas veces seguidas, espera unos minutos. |
| «No encontré la cuenta…» / «no encontró esa cuenta (404)» / «redirección» | El subdominio está mal escrito. |
| «Kommo pidió esperar unos N min (429)» | Espera ese tiempo y vuelve a correr el comando. Lo que ya se creó no se duplica. |
| «Kommo tuvo un error de su lado (500)» | Vuelve a correr el comando en unos minutos. |
| «Ya existe con otro tipo» | Hay un campo con ese nombre pero de otro tipo (por ejemplo, texto en vez de lista). El script no lo cambia: en Kommo renómbralo (o bórralo si no tiene datos) y vuelve a correr `--aplicar`. |
| «Está archivado en Kommo» | Hay un embudo con ese nombre, pero archivado. El sitio no usa embudos archivados y el script no crea otro con el mismo nombre: desarchívalo en Kommo y vuelve a correr el comando. |
| `⚠ Revisa · Zona horaria` | Tu cuenta no tiene la hora del centro de México. Cámbiala como dice la sección 1 (no hace falta volver a correr el script). |

---

## 6. Paso 5 · Dónde quedan los IDs

Con `--aplicar`, el script guarda **`materiales/v2/landings/kommo-ids.json`**: solo los números (IDs) y nombres de la cuenta, embudos, etapas, campos con sus opciones, etiquetas, plantillas y usuarios, más tu subdominio. **No contiene el token ni ningún secreto**, así que se puede compartir con el equipo de desarrollo. Se reescribe cada vez que corres `--aplicar`.

Los IDs de embudos y etapas de ese archivo son **solo referencia; no los captures en Vercel** (paso 6). Un embudo archivado no aparece con ID: el sitio no lo usa.

---

## 7. Paso 6 · Variables en Vercel

**Solo necesitas dos variables de Kommo: `KOMMO_SUBDOMAIN` y `KOMMO_TOKEN`.** El sitio encuentra los embudos, las etapas y los campos **por su nombre** (lo mismo dicen `cotizar-configuracion.md` §2 y `agenda-configuracion.md` §4). Al final del reporte, el script imprime el bloque **«Variables para Vercel»** con tu subdominio y la lista de **usuarios** con su ID.

1. Vercel → proyecto del sitio → **Settings → Environment Variables**.
2. Agrega cada una con su nombre exacto, en **Production** y en **Preview**:

| Variable | Valor | De dónde sale |
|---|---|---|
| `KOMMO_SUBDOMAIN` | tu subdominio | el bloque del script |
| `KOMMO_TOKEN` | el mismo token que usaste en el script (paso 1) | Kommo. Márcala como **Sensitive** (en algunas pantallas dice *Secret*): después nadie puede volver a leerla. Si ya existía y generaste uno nuevo, **reemplázala** con el nuevo. |
| `KOMMO_RESPONSIBLE_USER_ID` | *(opcional)* ID de quien atiende los leads del sitio | la lista de usuarios del script (si solo hay un usuario activo, el script lo sugiere). Sin ella, Kommo asigna los leads como lo tengas configurado. |

3. **No captures** `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID`, `KOMMO_AGENDA_PIPELINE_ID` ni `KOMMO_AGENDA_STATUS_ID`, **y bórralas si ya existían**. Esas variables mandan sobre los nombres: por ejemplo, con `KOMMO_AGENDA_STATUS_ID` todas las reservas, también las Power Session sin pagar, caerían en «Discovery agendada» en vez de «Power Session por pagar». Los IDs que guarda `kommo-ids.json` son solo referencia.
4. **Save** → **Deployments** → último despliegue → **Redeploy**. Las variables solo aplican a despliegues nuevos.

**Comprueba que el sitio ve tu cuenta** (sobre todo si generaste un token nuevo):
1. En el **Preview**, abre `https://<tu-preview>/api/agenda/estado/`. Debe decir `"kommo": "configurado"` y `"kommoEstructura": "completa"`.
   - `"error"`: el token que está en Vercel no funciona (venció, se copió incompleto o se desactivó). Genera uno nuevo (paso 1, punto 6), reemplaza `KOMMO_TOKEN` en Vercel y haz Redeploy.
   - `"incompleta"`: la lista `kommoFaltan` dice qué nombre no encontró. Vuelve a correr `--aplicar` o corrige ese nombre en Kommo.
2. Manda **una cotización de prueba** desde el Preview, con tus datos, y revisa que llegue a **«Sitio web · Cotizaciones» → «Nueva cotización»** con la etiqueta `entorno-preview`.

**No renombres en Kommo** los embudos, etapas, campos ni opciones: si cambias un nombre, el sitio deja de encontrarlo (el lead sigue entrando, pero sin ese dato en su columna). Mayúsculas y guiones (por ejemplo «1-10» o «1–10») no importan: el sitio los reconoce igual.

---

## 8. Plantillas de WhatsApp (las aprueba Meta)

Se crean a mano en Kommo porque Meta revisa cada una. Solo se pueden enviar las que tengan estado **Aprobada**, y Meta puede cobrar cada envío.

**Dónde:** **Automatizaciones → Plantillas → Plantillas de chat → + Nueva plantilla → Plantilla de WhatsApp** → elige la **categoría** (abajo) → tipo **Personalizada (Custom)** → **Siguiente** → nombre → tu cuenta de WhatsApp Business (WABA ID) → idioma **Español (México)** → escribe el cuerpo → inserta los marcadores → escribe un **ejemplo** para cada marcador → **Enviar para aprobación (Send for approval)**.

Reglas para que Meta las apruebe (todas las de abajo ya las cumplen):
- **Utilidad** = responde a algo que la persona pidió (cotización, reserva, pago). **Marketing** = invitar o retomar. Si eliges mal, Meta la rechaza o la cambia de categoría.
- Inserta los marcadores con el menú de marcadores del editor (no los escribas a mano) y pon un ejemplo en cada uno.
- Nunca empieces ni termines el texto con un marcador, ni pongas dos seguidos.
- **No prometas tiempos de respuesta** («en minutos», «hoy mismo», «en 24 h»).
- Solo a personas que aceptaron recibir WhatsApp (el formulario del sitio y la agenda lo piden).

**La hora de la sesión depende de la zona horaria de tu cuenta.** El marcador [Fecha de la sesión] lo llena Kommo con la fecha y hora que guardó el sitio, mostrada en la zona horaria de la cuenta. Antes de mandar las plantillas 8.2, 8.3 y 8.4 a aprobación, confirma que la cuenta está en **Ciudad de México** (sección 1); si no, el mensaje diría «(hora del centro de México)» con una hora equivocada. En la prueba de punta a punta, compara la hora del WhatsApp con la que elegiste al reservar.

En los textos, lo que va entre corchetes es un marcador de Kommo:

### 8.1 `ik_primer_contacto_cotizacion` · Utilidad
Se usa en: **Sitio web · Cotizaciones → Nueva cotización** (sección 9.2).
> Hola [Nombre del contacto], gracias por escribirle a Ingeniak. Recibimos tu solicitud de cotización y ya la estamos revisando. Te escribimos por aquí para darle seguimiento. Si quieres agregar algo, responde a este mensaje.

Marcadores y ejemplos: Nombre del contacto → «Ana».
Pie (opcional): «Ingeniak · ingeniak.mx».

### 8.2 `ik_confirmacion_discovery` · Utilidad
Se usa en: **Agenda · Sesiones → Discovery agendada**.
> Hola [Nombre del contacto], tu Discovery Session con Ingeniak quedó agendada para el [Fecha de la sesión] (hora del centro de México). Este es tu enlace de Google Meet: [Enlace de Meet]. Si necesitas cambiar el horario, responde a este mensaje.

Ejemplos: Nombre del contacto → «Ana» · Fecha de la sesión (campo del lead) → «21/10/2026 10:00» · Enlace de Meet (campo del lead) → «https://meet.google.com/abc-defg-hij».

### 8.3 `ik_pago_power_session` · Utilidad
Se usa en: **Agenda · Sesiones → Power Session pagada**.
> Hola [Nombre del contacto], confirmamos el pago de tu Power Session. Tu sesión quedó agendada para el [Fecha de la sesión] (hora del centro de México) y este es tu enlace de Google Meet: [Enlace de Meet]. Si quieres compartirnos algo antes de la sesión, responde a este mensaje.

Ejemplos: «Ana» · «23/10/2026 17:00» · «https://meet.google.com/abc-defg-hij».

### 8.4 `ik_recordatorio_24h` · Utilidad
Se usa en: **Discovery agendada** y **Power Session pagada**, 24 horas antes de la sesión.
> Hola [Nombre del contacto], te recordamos tu sesión con Ingeniak mañana, [Fecha de la sesión] (hora del centro de México). Puedes entrar desde este enlace: [Enlace de Meet]. Si ya no puedes asistir, responde a este mensaje y buscamos otro horario.

Ejemplos: «Ana» · «22/10/2026 10:00» · «https://meet.google.com/abc-defg-hij».

### 8.5 `ik_seguimiento_48h` · Utilidad
Se usa en: **Propuesta enviada** (de cualquiera de los dos embudos), 48 horas después (opcional, sección 9.6).
> Hola [Nombre del contacto], te escribimos para dar seguimiento a la propuesta que te enviamos. ¿Pudiste revisarla? Si tienes dudas o quieres ajustar algo, responde a este mensaje y lo vemos contigo.

Ejemplos: «Ana». Si Meta la reclasifica como Marketing, acéptalo: sigue funcionando igual.

### 8.6 `ik_reactivacion_15d` · Marketing
Se usa en: leads marcados con la etiqueta `reactivación`, 15 días después (opcional, sección 9.6).
> Hola [Nombre del contacto], hace unos días platicamos sobre cómo ordenar la atención y las ventas de tu negocio con Ingeniak. Si sigue en tus planes, podemos retomarlo cuando te acomode. ¿Te gustaría que te compartamos los siguientes pasos?

Ejemplos: «Ana».
Botones de respuesta rápida: «Sí, retomemos» · «Ahora no».
Pie: «Si prefieres no recibir estos mensajes, responde Baja».

### 8.7 Correo de primer contacto (no lo revisa Meta)
**Correo → Ajustes → Plantillas de correo (Mail → Settings → Email templates) → Agregar plantilla.** Antes conecta tu buzón en **Correo** si aún no lo está.
- Asunto: «Recibimos tu solicitud de cotización · Ingeniak»
- Texto:
  > Hola [Nombre del contacto]:
  >
  > Gracias por escribirle a Ingeniak. Recibimos tu solicitud de cotización y ya la estamos revisando. Te escribimos por este medio o por WhatsApp para darle seguimiento.
  >
  > Si quieres agregar algo, responde a este correo.
  >
  > Equipo Ingeniak · ingeniak.mx

Usa el marcador de nombre que ofrece el editor.

---

## 9. Automatizaciones del Digital Pipeline (a mano en Kommo)

### 9.1 Cómo se agrega una automatización
1. **Leads** → arriba, elige el embudo → **Automatizar (Automate)**.
2. Debajo de la etapa, pulsa **+** y elige el tipo: **Salesbot**, **Enviar correo (Send email)** o **Agregar tarea (Add task)**.
3. **Condición:** la etiqueta que se indica abajo (así solo corre para los leads correctos). En «Agenda · Sesiones» usa `discovery` o `power-session`, como dicen las tablas, **no** `web-agenda`: esa la llevan todas las reservas, también las Power Session sin pagar, que así recibirían mensajes de la Discovery.
4. **Regla de ejecución:** la que se indica abajo.
5. Deja **sin marcar** «Aplicar a todos los leads que ya están en esta etapa».
6. **Listo** y, al terminar con el embudo, **Guardar** arriba a la derecha.

Antes de los Salesbot, crea **un bot por plantilla de WhatsApp aprobada:** **Automatizaciones → Bots → + Crear bot** → canal **WhatsApp** → «Empezar desde cero» → paso **Mensaje** → elige la plantilla → **Guardar**. Ponle al bot el mismo nombre que a su plantilla.

### 9.2 Sitio web · Cotizaciones → **Nueva cotización**

| # | Tipo | Condición | Regla de ejecución | Qué hace |
|---|---|---|---|---|
| 1 | Salesbot | etiqueta `web-cotizar` | Inmediatamente **al crearse en esta etapa** (*when created in this stage*) | Bot `ik_primer_contacto_cotizacion` (WhatsApp). |
| 2 | Enviar correo | etiqueta `web-cotizar` | Inmediatamente al crearse en esta etapa | Plantilla «Recibimos tu solicitud de cotización». Remitente: el responsable del lead o el buzón corporativo. Marca «solo al contacto principal». |
| 3 | Agregar tarea | etiqueta `web-cotizar` | Inmediatamente al crearse en esta etapa | Tarea **«Contactar»** · plazo: **fin del día** · responsable: el responsable actual · tipo: Seguimiento · comentario: «Revisar la nota del lead (folio, servicios, presupuesto) y escribirle por el medio que prefirió». |

### 9.3 Agenda · Sesiones → **Discovery agendada**

| # | Tipo | Condición | Regla de ejecución | Qué hace |
|---|---|---|---|---|
| 1 | Salesbot | etiqueta `discovery` | Inmediatamente **al crearse o moverse a esta etapa** (*moved or created*) | Bot `ik_confirmacion_discovery`. |
| 2 | Salesbot | etiqueta `discovery` | **24 horas antes** del campo **«Fecha de la sesión»** (regla programada: *X hours before field*) | Bot `ik_recordatorio_24h`. |

Google ya manda la invitación con el Meet; el WhatsApp es un segundo aviso.

### 9.4 Agenda · Sesiones → **Power Session pagada**

| # | Tipo | Condición | Regla de ejecución | Qué hace |
|---|---|---|---|---|
| 1 | Salesbot | etiqueta `power-session` | Inmediatamente al **moverse o crearse** en esta etapa | Bot `ik_pago_power_session`. |
| 2 | Agregar tarea | etiqueta `power-session` | Inmediatamente al moverse o crearse en esta etapa | Tarea **«Preparar sesión»** · plazo: **en 1 día** · responsable: el responsable actual · comentario: «Revisar la nota del lead (respuestas y brief) antes de la Power Session». |
| 3 | Salesbot | etiqueta `power-session` | 24 horas antes del campo «Fecha de la sesión» | Bot `ik_recordatorio_24h`. |

(Las reservas de Power Session entran en «Power Session por pagar» y el sitio las mueve solo a «Power Session pagada» cuando Stripe confirma el pago.)

### 9.5 Agenda · Sesiones → **Sesión realizada**

| # | Tipo | Condición | Regla de ejecución | Qué hace |
|---|---|---|---|---|
| 1 | Agregar tarea | (ninguna) | Inmediatamente **al moverse a esta etapa** | Tarea **«Enviar propuesta»** · plazo: **en 1 día** · responsable: el responsable actual · comentario: «Mandar la propuesta y mover el lead a Propuesta enviada». |

Esta etapa la mueve tu equipo a mano al terminar la sesión.

### 9.6 Opcionales
- **Seguimiento 48 h** · en **Propuesta enviada** (de los dos embudos): Salesbot con el bot `ik_seguimiento_48h`, regla «al moverse a esta etapa» con intervalo **48:00** (*select interval*). Si la persona ya contestó, saca el lead de la etapa antes de las 48 h.
- **Reactivación 15 días** · en **Perdido**: Salesbot con el bot `ik_reactivacion_15d`, condición etiqueta `reactivación`, regla «al moverse a esta etapa» con intervalo de **15 días**. Tu equipo pone la etiqueta solo a quien sí quiere retomar. Otra forma: una **Difusión (Broadcasting)** a los leads con esa etiqueta.

### 9.7 Si una opción no aparece
- La regla **«24 horas antes de un campo»** está en los disparadores de Salesbot (*Scheduled triggers*). Si no la ves dentro de **Automatizar**, ábrela desde el bot: **Automatizaciones → Bots → tu bot → disparadores**. Necesita que el lead tenga «Fecha de la sesión»: el sitio la llena en cada reserva.
- Los disparadores que se activan **al agregar una etiqueta** solo existen en el plan Enterprise; por eso esta guía usa la etiqueta como **condición**, que sí está en todos los planes.

---

## 10. Para el equipo de desarrollo · cómo lo hace el script por dentro

Archivo: `scripts/kommo-configurar.mjs` (ESM, Node 18+, sin dependencias). Pruebas: `node --test tests/kommo-configurar/` (simulador local en `tests/kommo-configurar/_mock-kommo.mjs`; nunca llama a Kommo real).

- **Orden:** `GET /api/v4/account?with=datetime_settings` (la zona horaria viene en `_embedded.datetime_settings.timezone`; si no da la misma hora que `America/Mexico_City` en enero y en julio, el reporte la marca `⚠ Revisa`, sin contar como falla) → `GET /leads/pipelines` (+ `POST /leads/pipelines` por embudo faltante, con sus etapas en `_embedded.statuses`; `POST /leads/pipelines/{id}/statuses` por etapa faltante) → `GET /leads/custom_fields?limit=250&page=N` (+ `POST /leads/custom_fields` por campo; `GET` + `PATCH /leads/custom_fields/{id}` para agregar opciones) → `GET /leads/tags` (+ `POST /leads/tags`) → `GET /chats/templates?limit=50` (+ `POST /chats/templates`) → `GET /users`.
- **Un elemento por petición:** si uno falla, los demás siguen. `--prueba` no puede mandar POST/PATCH (el cliente HTTP lo bloquea).
- **Nombres como el sitio:** embudos, etapas, campos, opciones, etiquetas y plantillas se comparan con `normalizar()` / `mismoNombre()` de `shared/kommo-esquema.js` (NFC, espacios simples, guiones ‐ ‑ ‒ – — ― − = `-`, minúsculas), idéntica a `normalizar()` de `server/kommo.js` (una prueba compara las dos). Gana el primero que coincide, en el orden en que responde Kommo, igual que en el sitio. Si lo encontrado no está escrito exacto, el reporte dice «existe escrito «…»» y no se crea un casi-duplicado. `validarEsquema()` también rechaza dos nombres del esquema que el sitio confundiría.
- **Embudo archivado** (`is_archive: true`) con el nombre aprobado: el sitio lo ignora, así que el script lo reporta como `❌` («desarchívalo en Kommo y vuelve a correr»), sale con código 1, no le agrega etapas, no crea otro con el mismo nombre y deja sus IDs en `null` en `kommo-ids.json`. Si además hay uno activo con ese nombre, usa el activo.
- **Variables de Vercel:** el bloque impreso y `kommo-ids.json` → `vercel` solo traen `KOMMO_SUBDOMAIN` (más el recordatorio de `KOMMO_TOKEN` y el opcional `KOMMO_RESPONSIBLE_USER_ID`). Nunca sugieren `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID` ni `KOMMO_AGENDA_*`: mandan sobre los nombres (con `KOMMO_AGENDA_STATUS_ID` cada Power Session apartada entraría a «Discovery agendada»).
- **Embudo nuevo:** `[{ name, sort, is_main: false, is_unsorted_on: false, _embedded: { statuses: [{ name, sort, color }] } }]` (`name`, `sort`, `is_main`, `is_unsorted_on` son obligatorios). Kommo agrega solo las etapas 142 (ganado) y 143 (perdido). Máximo 50 embudos por cuenta y 100 etapas por embudo.
- **Colores:** solo los 21 de la paleta oficial; `validarEsquema()` y `COLORES_ETAPA` en `shared/kommo-esquema.js` los revisan antes de mandar nada (los colores de las 14 etapas del esquema ya estaban en la paleta; no se cambió ninguno).
- **Campo nuevo:** `[{ name, type: 'select'|'multiselect'|'date_time'|'url', enums: [{ value, sort }] }]`. La respuesta trae `_embedded.custom_fields[0]` con los IDs de las opciones.
- **Agregar opciones a un campo existente:** `PATCH /leads/custom_fields/{id}` con `{ enums: [...todas las existentes con su id, ...las nuevas sin id] }`. Según la documentación, **la opción que no se manda con su id se borra**; por eso el script relee el campo justo antes, manda todas y después comprueba que no se perdió ninguna. Un campo con el mismo nombre y otro tipo no se toca: se reporta.
- **Etiquetas:** `POST /leads/tags` con `[{ name }]`; si el nombre ya existe, Kommo devuelve el id existente. El script además compara con `normalizar()` para no crear «HOT–LEAD» y «hot-lead».
- **Plantillas de respuesta:** `POST /chats/templates` con `[{ name, content, is_editable: true, external_id: 'ingeniak-<nombre>' }]` (`is_editable` es `false` por defecto; en `true` el cliente las puede afinar en Kommo). `GET /chats/templates` admite máximo 50 por página y **solo devuelve las que creó la misma integración**. Si la lista no se puede leer, el script no crea ninguna (para no duplicar) e imprime los textos.
- **Plantillas de WhatsApp:** la API también permite crearlas (`type: 'waba'`, `waba_category`, `waba_language`, `waba_examples`) y mandarlas a moderación, pero por decisión del cliente se crean y aprueban en la interfaz de Kommo (sección 8).
- **Ritmo y errores:** una petición cada 200 ms como mínimo (≤ 5 por segundo; el límite de Kommo es 7 y, si se rebasa varias veces, bloquea la IP con 403). En 429 espera lo que pida `Retry-After` / `retry_after` con espera creciente (hasta 4 reintentos); si Kommo pide más de 60 s (su ejemplo trae 300), se detiene y explica. Las consultas (GET) se reintentan 2 veces ante 5xx o fallas de red; un POST nunca se repite solo (la siguiente corrida es la que completa). 401 y 402 detienen todo; 403, 404, 422 y 5xx se reportan por elemento. Las redirecciones no se siguen (`redirect: 'manual'`).
- **Token:** de una pregunta oculta (modo raw, sin eco; probada en una terminal real con `/usr/bin/expect`). `KOMMO_TOKEN` existe solo para las pruebas automáticas y no se documenta al cliente: escrita en una Terminal (`export KOMMO_TOKEN=…` o `KOMMO_TOKEN=… node …`) queda en texto plano en `~/.zsh_history`; si se usa con una Terminal interactiva, el script avisa. Toda salida pasa por `tapar()`, que reemplaza el token completo, **cualquier pedazo suyo de 12 o más caracteres**, cualquier JWT (`eyJ…`) y cualquier `Bearer …`. En las respuestas de error se tapa el texto **completo antes de recortarlo** (un token de cientos de caracteres cortado a la mitad ya no se reconocería). `kommo-ids.json` se revisa antes de escribirse. `KOMMO_BASE_URL` (solo pruebas) se acepta únicamente en 127.0.0.1, localhost o ::1, y solo ahí se puede acelerar el ritmo.

### Dudas abiertas sobre la API (no verificables sin la cuenta real)
1. **Subdominio inexistente:** la documentación no dice si Kommo responde 404, redirige a www.kommo.com o falla el DNS. El script trata los tres casos como «subdominio mal escrito».
2. **Respuesta de `POST /leads/custom_fields`:** la referencia muestra `_embedded.custom_fields` y la página de códigos HTTP muestra el objeto suelto con 201. El script acepta las dos formas y, si faltan IDs de opciones, relee el campo.
3. **Dos tokens de larga duración en la misma integración:** la documentación no dice si generar uno nuevo invalida el anterior. Por eso la guía (paso 1) pide usar un solo token: reutilizar el de Vercel si se tiene a la mano o, si se genera otro, reemplazarlo también en Vercel; y después comprobar `/api/agenda/estado/` (`"kommoEstructura": "completa"`; con un token inválido dice `"error"`) y mandar una cotización de prueba.
4. **Permisos exactos para `/chats/templates`:** la documentación pide «derechos de administrador» y no nombra un permiso de la integración; por eso la guía pide dejar todos marcados.
5. **Regla «X horas antes de un campo» dentro de Automatizar:** está documentada en los disparadores de Salesbot; no confirmamos que aparezca igual en el Digital Pipeline de todos los planes (sección 9.7).
6. **Orden de una etapa agregada a un embudo existente:** se manda `sort` = etapa anterior + 1; Kommo renumera los `sort` (su ejemplo responde 60 a un `sort` de 100), así que conviene revisar el orden visualmente.

### Fuentes (consultadas el 2026-10-20; entre paréntesis, la fecha de actualización de cada página)
**developers.kommo.com**
- Add pipelines (2025-07-11): https://developers.kommo.com/reference/add-pipelines
- Get pipelines (2026-06-30): https://developers.kommo.com/reference/pipelines-list
- Leads pipelines and stages · 142/143, 50 embudos, 100 etapas (2025-06-08): https://developers.kommo.com/reference/leads-pipelines-and-stages
- Add stages to pipeline (2026-06-29): https://developers.kommo.com/reference/add-stages
- Available stage colors (2025-06-08): https://developers.kommo.com/reference/stage-colors
- Custom fields · tipos y formatos de valor (2025-07-11): https://developers.kommo.com/reference/custom-fields
- Custom fields list · `limit` 250, paginación (2026-09-10): https://developers.kommo.com/reference/custom-field-by-entity
- Add custom fields (2026-06-25): https://developers.kommo.com/reference/add-custom-fields
- Update custom field · «si no pasas el id, las opciones existentes se borran» (2026-06-29): https://developers.kommo.com/reference/update-custom-field
- List of entity tags · 204 sin datos (2025-06-08): https://developers.kommo.com/reference/list-of-entity-tags
- Create tags · nombre existente devuelve su id (2025-07-11): https://developers.kommo.com/reference/add-tags
- Templates · solo las de la integración (2025-06-08): https://developers.kommo.com/reference/templates
- Get list of templates · máximo 50 (2026-06-29): https://developers.kommo.com/reference/get-templates
- Add templates · `is_editable`, `external_id`, `waba_*` (2026-03-03): https://developers.kommo.com/reference/add-templates
- Account parameters (2026-07-22): https://developers.kommo.com/reference/account-parameters
- Users list · solo administradores (2025-07-07): https://developers.kommo.com/reference/users-list
- Limitations · 7 peticiones por segundo, 429 y bloqueo 403 (2026-03-25): https://developers.kommo.com/docs/limitations
- HTTP status codes · 401, 402, 403, 404, 422, 429 con `retry_after` (2025-06-08): https://developers.kommo.com/docs/http-codes
- Long-lived token (2026-03-13): https://developers.kommo.com/docs/long-lived-token
- Private integration (2025-06-08): https://developers.kommo.com/docs/private-integration
- Permissions (2026-07-08): https://developers.kommo.com/docs/permissions

**support.kommo.com**
- Set up digital pipeline triggers · Salesbot, Add task, Send email (2026-03-16): https://support.kommo.com/docs/set-up-digital-pipeline-triggers
- Salesbot triggers overview · reglas inmediatas, con intervalo y «X horas antes de un campo» (2026-03-26): https://support.kommo.com/docs/salesbot-triggers-overview
- WhatsApp templates overview · categorías, requisitos y planes (2026-10-16): https://support.kommo.com/docs/whatsapp-templates-overview
- Create and manage WhatsApp Business message templates · ruta en Kommo, marcadores y reglas de Meta (2026-09-09): https://support.kommo.com/docs/manage-whatsapp-business-message-templates
