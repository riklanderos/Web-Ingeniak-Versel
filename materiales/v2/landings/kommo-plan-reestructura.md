# Plan de reestructura de Kommo — Ingeniak

**Fecha:** 20 de octubre de 2026
**Base:** Auditoría de la cuenta del 20-oct-2026 (525 leads, 7 pipelines, 57 campos de leads, 22 etiquetas).
**Para:** agente que ejecuta a nivel de API (Kommo API v4).
**Objetivo:** quedar con 4 pipelines — **11303859 P1 · Prospectos** (las Discovery Session caen aquí, en la etapa **97185916**), un pipeline de **Power Session recreado** (el original ya fue eliminado a mano), **13097803 Campaña de Recuperación** y **13317871 Licencias** — sin perder un solo lead, y reconstruir etapas, campos, secciones y etiquetas desde cero.

---

## 0. Reglas de seguridad (obligatorias, antes que todo)

1. **Nunca borres un pipeline ni una etapa que tenga leads.** Primero mueve los leads, vuelve a contar, y solo con conteo en 0 borra. En Kommo, borrar una etapa o un pipeline con leads **borra los leads**.
2. Los conteos incluyen **leads cerrados**: los Ganado (status 142) y Perdido (status 143) de un pipeline también viven en él. Al vaciar un pipeline, mueve también los cerrados (`PATCH` con `pipeline_id` destino y `status_id` 142 o 143 del destino).
3. Revisa la **bandeja de leads entrantes** (`GET /api/v4/leads/unsorted`) de cada pipeline a borrar: acepta o rechaza lo pendiente antes de borrar.
4. Al poner etiquetas con `PATCH /api/v4/leads`, el campo `_embedded.tags` **reemplaza** las etiquetas del lead. Lee las actuales y manda la unión, no solo la nueva.
5. **No se borra ningún lead ni contacto en este plan.** Las únicas eliminaciones son de estructura (pipelines vacíos, etapas vacías, campos, secciones, etiquetas) y siempre tras verificar que están en cero.
6. Haz **primero una corrida en seco**: imprime el plan de movimientos (lead_id → pipeline/etapa destino) y los conteos, sin ejecutar. Ejecuta solo si los totales cuadran con el respaldo.
7. Si aparece una etapa o un campo **que no está en este documento**, no lo toques: repórtalo y pregunta.
8. **Pausa el webhook de Supabase** (evento "cambio de etapa de lead") antes de mover leads: vas a mover ~430 y dispararía ~430 llamadas a Kain/dashboard. Guarda su URL, bórralo (`DELETE /api/v4/webhooks`), y vuelve a crearlo al final. La integración nativa de Google Calendar no se toca.

---

## 1. Respaldo previo (antes de cualquier cambio)

Guarda en JSON, con fecha:

- `GET /api/v4/leads/pipelines` (incluye etapas con id, nombre, color, sort).
- `GET /api/v4/leads/custom_fields` y `/api/v4/leads/custom_fields/groups`; lo mismo para `/api/v4/contacts/...` y `/api/v4/companies/...`.
- `GET /api/v4/leads/tags`, `/api/v4/contacts/tags`, `/api/v4/companies/tags`.
- `GET /api/v4/leads/loss_reasons`.
- `GET /api/v4/webhooks`.
- **Todos los leads** paginados (`GET /api/v4/leads?with=contacts,loss_reason&limit=250&page=N`): id, name, price, pipeline_id, status_id, responsible_user_id, tags, custom_fields_values, created_at. Este archivo es el seguro de vida de la migración.
- Recomendado además: exportación a CSV desde la interfaz de Kommo (Leads → exportar), por si acaso.

Anota los totales por pipeline y por etapa: son la referencia contra la que se verifica todo al final.

---

## 2. Estructura final

### 2.1 Pipelines (4)

| ID | Nombre actual | Nombre final | Papel |
|---|---|---|---|
| 11303859 | P1 · PROSPECTOS | **Ventas** | Proceso comercial: cotizaciones del sitio web, Discovery Session (etapa **97185916**), propuesta y cierre. |
| *(nuevo)* | — | **Power Session** | Se recrea: el pipeline original de Power Session ya fue eliminado a mano. Recibe las reservas de Power Session del sitio y su pago. |
| 13097803 | CAMPAÑA RECUPERACIÓN | **Campañas** | Lista fría → mensaje → respuesta → nutrición. Absorbe ⚡ MOTOR DE CAMPAÑA. |
| 13317871 | LICENCIAS | **Clientes** | Ciclo de vida del cliente activo + licencias. Absorbe P4 · CLIENTES. |

Se borran (después de vaciarlos): **P0 · OUTBOUND B2B** (0 leads), **P4 · CLIENTES**, **⚡ MOTOR DE CAMPAÑA**. *(P5 POWER SESSION ya no existe: fue eliminado a mano; ver 3.2.)*

> Renombrar un pipeline es seguro (no toca leads). Si prefieren conservar los nombres actuales, lo único obligatorio es reportar los nombres finales exactos (ver sección 9): el sitio web busca los embudos por nombre.

### 2.2 Etapas finales (colores de la paleta oficial de Kommo)

La primera etapa de cada pipeline no se puede borrar: **renómbrala** para que sea la etapa de entrada indicada. Ganado/Perdido los pone Kommo; unifica sus nombres a **«Ganado» / «Perdido»** en los 4 pipelines.

**Ventas (11303859):**

| # | Etapa | Color | Nota |
|---|---|---|---|
| 1 | Nueva cotización *(entrada)* | `#98cbff` | |
| 2 | Contactado | `#ffeab2` | |
| 3 | Calificado | `#ffdc7f` | |
| 4 | Discovery agendada | `#c1e0ff` | **Es la etapa existente ID 97185916: NO se borra ni se recrea** (perdería su ID y sus leads). Solo renombrarla a «Discovery agendada» y reordenarla a esta posición. |
| 5 | Sesión realizada | `#ffce5a` | |
| 6 | Propuesta enviada | `#f3beff` | |
| 7 | Negociación | `#ff8f92` | |

**Power Session (pipeline NUEVO — `POST /api/v4/leads/pipelines`):**

| # | Etapa | Color |
|---|---|---|
| 1 | Power Session por pagar *(entrada)* | `#fffd7f` |
| 2 | Power Session pagada | `#87f2c0` |
| 3 | Sesión realizada | `#ffce5a` |
| 4 | Propuesta enviada | `#f3beff` |

El sitio web crea aquí el lead al reservar (por pagar), y el pago de Stripe lo mueve a «Power Session pagada» automáticamente.

**Campañas (13097803):**

| # | Etapa | Color |
|---|---|---|
| 1 | Por enviar *(entrada)* | `#f2f3f4` |
| 2 | Mensaje enviado | `#ffeab2` |
| 3 | Respondió | `#98cbff` |
| 4 | Interesado | `#87f2c0` |
| 5 | Nutrición | `#deff81` |

Las tandas (Prioridad, A, B, C) dejan de ser etapas: pasan al campo **«Tanda de campaña»** (sección 5). «⛔ CLIENTES · NO ENVIAR» deja de ser etapa: esos leads son clientes y se van al pipeline Clientes con etiqueta `cliente-actual`.

**Clientes (13317871):**

| # | Etapa | Color |
|---|---|---|
| 1 | Arranque *(entrada)* | `#ccc8f9` |
| 2 | Implementación (7–30 días) | `#f3beff` |
| 3 | En operación | `#87f2c0` |
| 4 | Licencia por vencer | `#fffd7f` |
| 5 | Renovación | `#deff81` |
| 6 | En riesgo | `#ffc8c8` |

«Licencia por vencer» sustituye a las etapas de avisos −15/−12/−7 (nunca usadas); el aviso se hace con una automatización sobre el campo «Fecha de Vencimiento Licencia», no con tres columnas.

**Orden de ejecución:** primero crea/renombra etapas (`POST`/`PATCH /api/v4/leads/pipelines/{id}/statuses`), luego mueve leads (sección 3), y al final borra las etapas viejas ya vacías.

---

## 3. Movimiento de leads (antes de borrar nada)

Lote de hasta 50 leads por `PATCH /api/v4/leads`. Reglas de mapeo:

### 3.1 Dentro de Ventas (P1, se queda)

| Etapa actual | Leads (aprox.) | Destino | Extra |
|---|---|---|---|
| En Contacto · Intentos | 27 | Contactado | — |
| Calificando | 12 | Calificado | — |
| Etapa 97185916 (Discovery) | — | **se queda donde está** (solo se renombra a «Discovery agendada») | — |
| Otras etapas de «DISCOVERY Session» (si existen, distintas de 97185916) | — | mover sus leads a la 97185916 y borrarlas vacías | etiqueta `discovery` |
| ⏳ Propuesta (histórico) | 7 | Propuesta enviada | etiqueta `reactivación` |
| ⚠️ Cliente con Error | 5 | **Clientes → En riesgo** | etiqueta `cliente-actual` |
| Ganado / Perdido | 1 / 18 | se quedan donde están | — |

### 3.2 P5 POWER SESSION (ya eliminado a mano) — verificación

El pipeline P5 fue borrado en la interfaz **después** de la auditoría. En la auditoría tenía 9 leads abiertos ("Contacto inicial"), 2 perdidos y una bandeja por la que entraban formularios.

1. Busca esos leads en la cuenta (por los IDs del respaldo de la auditoría si existen, o por nombre/contacto): si Kommo los movió a otro pipeline al borrar, déjalos donde el mapeo de este plan los ponga (prospectos de Power Session → pipeline **Power Session → Power Session por pagar**, con etiqueta `power-session`; o a su etapa real si ya se trabajaron).
2. Si ya no existen, repórtalo con la lista de los que faltan (nombre y contacto del respaldo de la auditoría) para decidir si se recapturan a mano.
3. Revisa que la bandeja general no tenga pendientes huérfanos de P5 (`GET /api/v4/leads/unsorted`).

### 3.3 P4 · CLIENTES → Clientes (luego se borra P4)

| Etapa actual | Leads | Destino | Extra |
|---|---|---|---|
| 1 · Bienvenida | 63 | En operación | etiqueta `cliente-actual` |
| Otras 5 etapas | 0 | — | verificar |
| Ganados / Perdidos (si hay) | — | Ganado / Perdido de Clientes | — |

> Son clientes actuales, no leads nuevos: por eso van a «En operación» y no a «Arranque». Si el equipo sabe de alguno todavía en onboarding, lo mueve a mano después.

### 3.4 ⚡ MOTOR DE CAMPAÑA → Campañas (luego se borra MOTOR)

| Etapa actual | Leads | Destino |
|---|---|---|
| Menú Enviado | 7 | Mensaje enviado |
| Las 9 etapas de respuesta | 0 | verificar |

### 3.5 Dentro de Campañas (se queda)

| Etapa actual | Leads | Destino | Campo «Tanda de campaña» |
|---|---|---|---|
| Por enviar · Prioridad | 21 | Por enviar | `Prioridad` |
| Por enviar · Tanda A | 223 | Por enviar | `Tanda A` |
| Por enviar · Tanda B | 81 | Por enviar | `Tanda B` |
| Por enviar · Tanda C | 18 | Por enviar | `Tanda C` |
| ⛔ CLIENTES · NO ENVIAR | 19 | **Clientes → En operación** | — (etiqueta `cliente-actual`) |

### 3.6 P0 · OUTBOUND B2B

0 leads. Verificar (abiertos + cerrados + bandeja) y borrar directo.

---

## 4. Borrado de pipelines y etapas

Solo después de la sección 3 y con verificación en el momento:

1. Para cada pipeline a borrar (P0, P4, MOTOR): `GET /api/v4/leads?filter[pipeline_id]={id}&limit=1` debe devolver **vacío** (la respuesta sin filtro de status incluye cerrados; confirma también la bandeja). Si no está vacío, detente.
2. `DELETE /api/v4/leads/pipelines/{id}` de los 3.
3. En Ventas y Campañas: borra las etapas viejas ya vacías (`DELETE .../statuses/{id}`), una por una, verificando el conteo de cada una antes.
4. En Clientes: borra las etapas de avisos −15/−12/−7 y cualquier otra vieja ya vacía.

---

## 5. Campos personalizados de LEADS

Hoy: 57 campos (44 manuales + 13 de tracking). Final: **25**. El sitio web (ingeniak.mx) escribe por **nombre exacto de campo y de opción**, así que los nombres y opciones marcados como «del sitio» deben quedar tal cual (la comparación del sitio ignora mayúsculas/minúsculas y trata igual `–` y `-`, pero no adivina nombres distintos).

### 5.1 Renombrar (conservan sus valores)

| Campo actual | Valores | Nombre final |
|---|---|---|
| Fecha Power Session | 9 | **Fecha de la sesión** |
| Link de Meet | 6 | **Enlace de Meet** |

### 5.2 Conservar tal cual (tienen datos u objetivo claro)

| Campo | Valores | Nota |
|---|---|---|
| Origen de Prospecto | 19 | select de 9 opciones, se queda |
| Capturado por | 13 | — |
| Resultado última llamada | 12 | — |
| Fecha último intento de llamada | 11 | — |
| Intentos de llamada | 6 | debería ser numérico, pero tiene datos y el tipo no se puede cambiar: se queda |
| Fecha de Vencimiento Licencia | 5 | la usa la etapa «Licencia por vencer» |
| Tanda de campaña | 0 | **se reutiliza**: asegurar opciones `Prioridad`, `Tanda A`, `Tanda B`, `Tanda C` (PATCH de enums) y llenarlo en el movimiento 3.5 |

### 5.3 Caso especial

- **Preferencia de canal declarada** (3 valores): el sitio usa «Contacto preferido» con opciones `WhatsApp`, `Correo`, `Llamada`. Si las opciones actuales se pueden mapear a esas tres, renómbralo a «Contacto preferido» y ajusta los enums; si no, crea el campo nuevo (5.4), copia a mano los 3 valores y borra el viejo.

### 5.4 Crear (campos del sitio web — nombres y opciones EXACTOS, en este orden)

Todos en leads. `POST /api/v4/leads/custom_fields`.

1. **Servicios de interés** — multiselect: `Agentes de IA para WhatsApp`, `CRM con IA (Kommo o GoHighLevel)`, `Automatización de procesos`, `Consultoría en IA`, `Paid media (anuncios)`, `Página web`, `SEO y visibilidad en buscadores de IA`, `Branding y contenido`, `Software a la medida`, `No estoy seguro`
2. **Objetivo principal** — select: `Conseguir más prospectos`, `Responder rápido a cada cliente`, `Ordenar ventas y seguimiento`, `Quitarle trabajo repetitivo al equipo`, `Saber qué funciona y qué no`, `Lanzar o renovar mi marca o mi sitio`, `Otro`
3. **Industria** — select: `Salud`, `Belleza y estética`, `Nutrición`, `Finanzas`, `Inmobiliario`, `Industrial y logística`, `Retail y e-commerce`, `Restaurantes y hoteles`, `Servicios profesionales`, `Salud y bienestar`, `Retail o tienda física`, `E-commerce`, `Restaurantes y alimentos`, `Construcción e inmobiliaria`, `Manufactura o industria`, `Educación`, `Agencia o marketing`, `Otra`
4. **Tamaño de empresa** — select: `1–10`, `11–50`, `51–200`, `Más de 200`, `Solo yo`, `2–5`, `6–10`, `11–25`, `26–50`, `Más de 50`
5. **Presupuesto estimado** — select: `Menos de USD 1,000`, `USD 1,000 a 3,000`, `USD 3,000 a 5,000`, `USD 5,000 a 10,000`, `USD 10,000 a 20,000`, `USD 20,000 a 50,000`, `Más de USD 50,000`, `Aún no lo sé`
6. **Plazo** — select: `Lo antes posible`, `En 1 a 3 meses`, `En 3 a 6 meses`, `Solo estoy explorando`
7. **CRM actual** — select: `Kommo`, `GoHighLevel`, `HubSpot`, `Otro CRM`, `Ninguno (Excel, libreta o solo WhatsApp)`
8. **Canales que usa hoy** — multiselect: `WhatsApp`, `Instagram`, `Facebook`, `Sitio web`, `Correo`, `Teléfono`, `Tienda o mostrador`
9. **Contacto preferido** — select: `WhatsApp`, `Correo`, `Llamada` *(si no salió del renombrado en 5.3)*
10. **Facturación mensual** — select: `Menos de $100K MXN al mes`, `$100K–$300K MXN`, `$300K–$800K MXN`, `$800K–$2M MXN`, `Más de $2M MXN`, `Apenas voy a empezar`
11. **Tipo de sesión** — select: `Discovery Session`, `Power Session`
12. **Pago Power Session** — select: `Pendiente`, `Pagado`, `Reembolsado`
13. **Página de origen** — url

> Ojo: en Kommo ya existen campos con nombres parecidos («Servicios de interés», «Presupuesto Estimado», «Tamaño de Empresa», «CRM actual», «Canales que usan») pero con tipo u opciones distintas y **cero valores**. Bórralos primero (5.5) y crea los de arriba limpios; si alguno coincide en nombre Y tipo, puedes conservarlo y dejar sus opciones exactamente como la lista de arriba vía PATCH de enums.

### 5.5 Borrar (solo campos con CERO valores — verifícalo antes de borrar cada uno)

- Los **34 campos manuales sin uso** del inventario: Servicios de interés, Presupuesto Estimado, Tamaño de Empresa, CRM actual, No. de asesores, Canales que usan, Dolor principal, Score de calificación, Filtro bot aprobado, Lead magnet entregado, Estatus confirmación PS, Fecha Game Plan, Estatus confirmación GP, Fecha compromiso presupuesto, Monto cotizado, No. de no-shows, Motivo de no cierre, **Motivo de pérdida** (duplica el catálogo nativo), Respuesta campaña, Permiso de seguimiento futuro, Motivo de entrada a Nutrición, Vertical outbound, Score outbound, Buzón emisor, Hilo email (Message-ID), Respuesta textual, Clasificación respuesta, LinkedIn contacto, Sitio web, Stack detectado, Plataforma licencia, Plan licencia, Usuarios licencia — **excepto «Tanda de campaña»**, que se reutiliza (5.2).
- **10 de los 13 campos de tracking**: borra todos menos `utm_source`, `utm_medium`, `utm_campaign` (los va a usar la atribución de campañas; gclid/fbclid/TikTok se recrean cuando haya pauta activa).
- El monto cotizado va en el campo **nativo de precio del lead** (`price`), no en un campo aparte.

### 5.6 Secciones (grupos) de campos de leads

Borra los grupos actuales que queden vacíos y crea estos (`POST /api/v4/leads/custom_fields/groups`), asignando cada campo a su grupo:

1. **Cotización web** — Servicios de interés, Objetivo principal, Industria, Tamaño de empresa, Presupuesto estimado, Plazo, CRM actual, Canales que usa hoy, Contacto preferido, Facturación mensual, Página de origen
2. **Sesiones** — Tipo de sesión, Fecha de la sesión, Enlace de Meet, Pago Power Session
3. **Operación comercial** — Origen de Prospecto, Capturado por, Resultado última llamada, Fecha último intento de llamada, Intentos de llamada
4. **Campañas** — Tanda de campaña, utm_source, utm_medium, utm_campaign
5. **Licencias** — Fecha de Vencimiento Licencia

---

## 6. Campos de CONTACTOS y EMPRESAS

**Contactos (15 → 6):**
- Conservar: Phone, Email, Position, Perfil de Linkedin, País, Nombre de usuario (8 valores).
- **Apellido** (22 valores): migrar cada valor al apellido nativo del contacto (`last_name`) y borrar el campo.
- Borrar (cero valores, verificar): Tomador de Decisión, Primer Contacto, Usuario de Instagram, Mejor horario para llamar, Zona horaria, Marketing subscription, MailChimp, Términos y condiciones.

**Empresas (9 → 3):**
- Conservar: URL Linkedin Compañía, Web, Industria.
- Phone y Email (1 valor cada uno): migrar ese valor al campo nativo de la empresa y borrar.
- Borrar (cero valores): Address, Antigüedad de la Empresa, Ciudad, Estado.
- *(Opcional, segunda fase)*: convertir «Industria» de texto a select — exportar los 444 valores, armar la lista de verticales reales y migrar. No bloquea nada de este plan.

---

## 7. Etiquetas

Las etiquetas quedan para atributos transversales (lo que es estado va en etapa; lo que es dato de calificación va en campo).

**Etiquetas finales de LEADS (11):**
`web-cotizar`, `web-agenda`, `discovery`, `power-session`, `campaña`, `orgánico`, `referido`, `hot-lead`, `reactivación`, `entorno-preview`, `cliente-actual`

- Créalas primero (`POST /api/v4/leads/tags`) — algunas se aplican durante los movimientos de la sección 3.
- Borra **todas las demás** etiquetas de leads (las 10 en cero y las heredadas del formulario viejo: `Formulario sin pago`, `Power Session`, `Discovery Session`, `Sesión agendada`, `servicio-crm-ia`, `presupuesto-no-se`, etc.). Borrar una etiqueta no borra leads; solo les quita la marca. Antes de borrar `Formulario sin pago` (10 leads) y `Power Session` (10), aplica a esos leads la etiqueta `power-session` o muévelos a la etapa que corresponda, para no perder la seña.
- **Contactos:** borra las 5 de campaña (en cero) e `import_21072025_1744` si no se usa para nada. **NO borres `Boda Andy y Rik` (211) ni `Escaladores` (251)**: son el único marcador de los contactos personales; se quedan hasta que Rik decida exportarlos/sacarlos (fase de limpieza de la auditoría, fuera de este plan).
- **Empresas:** borra las que están en cero; conserva `import_21072025_1744` (10) si marca un lote identificable.

---

## 8. Motivos de pérdida y usuarios

- **Motivos de pérdida:** el catálogo nativo de 14 motivos se queda tal cual. El campo personalizado «Motivo de pérdida» se borra (5.5).
- **Usuarios** *(requiere admin, puede hacerse en la interfaz)*: desactivar/eliminar a Victor Ocampo y Jose Gerardo (inactivos). Opcional pero recomendado por la auditoría.

---

## 9. Verificación final y entrega

Al terminar, el agente reporta:

1. **Conteo total de leads = conteo del respaldo** (525, más los que hayan entrado durante la migración). Ni uno menos.
2. Suma por pipeline: todos los leads viven en Ventas, Power Session, Campañas o Clientes (abiertos + cerrados).
3. 0 pipelines extra; etapas exactamente las de la sección 2.2 (más Ganado/Perdido). La etapa **97185916** sigue existiendo con ese mismo ID.
4. Lista final con **IDs**: pipeline_id y status_id de cada etapa, field_id y enum_id de cada campo/opción, tag_id de cada etiqueta. En JSON.
5. Webhook de Supabase recreado y funcionando. **Recomendado:** al recrearlo, cambiar el token `1234` de la URL por uno aleatorio largo, y revocar el token de API usado en la auditoría y en esta migración.

**Después de ejecutar:** pasar ese JSON de IDs y los nombres finales al proyecto del sitio web. El sitio busca embudos, etapas, campos y opciones **por nombre** (y acepta IDs por variables de entorno); con los nombres finales se actualiza `shared/kommo-esquema.js` para que:

- las cotizaciones caigan en **Ventas → Nueva cotización**;
- las **Discovery Session** caigan en **Ventas → etapa 97185916** («Discovery agendada»);
- las **Power Session** caigan en el pipeline **Power Session → Power Session por pagar**, y el pago de Stripe las mueva a «Power Session pagada».

Mientras la estructura esté a medias, el sitio no falla: crea el lead con nota y sin campos (fallback ya programado).

---

## Apéndice — API de Kommo v4 (referencia rápida)

| Recurso | Endpoints |
|---|---|
| Pipelines | `GET/POST /api/v4/leads/pipelines` · `PATCH/DELETE /api/v4/leads/pipelines/{id}` |
| Etapas | `POST /api/v4/leads/pipelines/{id}/statuses` · `PATCH/DELETE .../statuses/{status_id}` |
| Leads | `GET /api/v4/leads?filter[pipeline_id]=&filter[statuses][0][pipeline_id]=&filter[statuses][0][status_id]=&limit=250&page=N` · `PATCH /api/v4/leads` (lote de hasta 50: `[{id, pipeline_id, status_id, _embedded:{tags}}]`) |
| Bandeja | `GET /api/v4/leads/unsorted` · `POST /api/v4/leads/unsorted/{uid}/accept` (o `/decline`) |
| Campos | `GET/POST /api/v4/leads/custom_fields` · `PATCH/DELETE /api/v4/leads/custom_fields/{id}` (los enums se editan por PATCH del campo); igual bajo `/contacts` y `/companies` |
| Grupos de campos | `GET/POST/PATCH/DELETE /api/v4/leads/custom_fields/groups` |
| Etiquetas | `GET/POST /api/v4/leads/tags` · `DELETE /api/v4/leads/tags` (por id); igual en `/contacts` y `/companies` |
| Motivos de pérdida | `GET /api/v4/leads/loss_reasons` |
| Webhooks | `GET/POST/DELETE /api/v4/webhooks` |

**Límites:** ~7 solicitudes/segundo (respeta `429` con espera); máximo 50 entidades por `PATCH` en lote; 250 por página en `GET`. Won = `status_id` **142**, Lost = **143** (por pipeline). Colores de etapa: solo la paleta oficial de 21 colores de Kommo (los de la sección 2.2 ya están en ella); un color fuera de la paleta rechaza el embudo completo.

**Estados especiales:** la primera etapa de un pipeline no se puede borrar (se renombra); 142/143 tampoco (se renombran a Ganado/Perdido).

**Orden maestro:** Respaldo → pausar webhook → crear etiquetas → crear pipeline Power Session → crear/renombrar etapas (sin tocar la 97185916 más que su nombre) → mover leads (en seco, luego real) → borrar pipelines vacíos (P0, P4, MOTOR) → borrar etapas vacías → campos y grupos → limpiar etiquetas → recrear webhook → reporte de IDs.
