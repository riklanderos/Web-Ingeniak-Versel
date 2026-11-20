# Puente Kommo → Google Analytics · configuración

Cambio del 2026-11-19. Con esto, Google Analytics sabe qué leads se calificaron y cuáles se vendieron, y por qué canal llegó cada uno (ChatGPT, Google, Meta, directo…).

## Cómo funciona

1. **El sitio guarda el ID de Analytics del lead.** Cuando alguien envía el cotizador o agenda una cita, el sitio manda a Kommo el número con el que Analytics reconoce a esa persona.
   - Queda en el campo de rastreo `GCLIENTID` del lead.
   - También aparece en la nota del lead, en la línea "ID de Analytics: …".
2. **Kommo avisa al sitio.** Cada vez que un lead cambia de etapa, Kommo llama a `https://ingeniak.mx/api/kommo/etapa/`.
3. **El sitio avisa a Analytics:**
   - **Lead que entra a la etapa «Calificado»** (o una que empiece así, como «Calificado · Agenda propuesta»): manda el evento `qualify_lead`.
   - **Lead ganado** (etapa «Logrado con éxito» de Kommo), según el embudo: en CALIFICACIÓN (cita realizada) manda `qualify_lead` si aún no se había mandado; en DISCOVERY SESSION (cotizado) manda `working_lead`; en PRESUPUESTOS (contrató) manda `close_convert_lead` con el monto del lead y la moneda de la cuenta. En otros embudos no manda nada. Si el lead no trae ID de Analytics, se toma del «Lead de origen».
   - **Etiqueta de control:** al enviar, el lead recibe la etiqueta `ga-calificado` o `ga-venta`, para no mandar dos veces el mismo evento. **No borres esas etiquetas.**
4. **Los leads que no traen ID de Analytics no se mandan.** Pasa con los que llegan por WhatsApp o los que el equipo captura a mano. Esos se miden en Kommo, por ejemplo con la etiqueta "ChatGPT" de los mensajes que dicen "Te encontré en ChatGPT".

Los eventos `qualify_lead` y `close_convert_lead` ya están marcados como eventos clave en GA4 desde el 14 de noviembre de 2026.

## Lo que configura Rik (una sola vez)

Ninguna clave se escribe en el código ni en el chat.

### 1. Clave de Analytics

1. En GA4 entra a Administrar.
2. Ve a Flujos de datos y abre **Ingeniak Web**.
3. Abre **Claves secretas de la API de Measurement Protocol** y elige Crear.
4. Ponle de nombre `kommo-puente` y copia el valor.

### 2. Clave del webhook

Genérala en la Terminal:

```bash
openssl rand -hex 32
```

### 3. Variables en Vercel

1. En el proyecto, ve a Settings → Environment Variables.
2. Agrega estas dos variables, solo en **Production** y marcadas como **Sensitive**:
   - `GA4_API_SECRET` = la clave del paso 1.
   - `KOMMO_WEBHOOK_SECRET` = la clave del paso 2.
3. Haz Redeploy.

### 4. Webhook en Kommo

1. En Kommo, ve a Configuración → Integraciones y busca **Webhooks**.
2. Pega esta URL, cambiando `<clave>` por la del paso 2. Lleva la barra antes del `?`:

   ```
   https://ingeniak.mx/api/kommo/etapa/?clave=<clave>
   ```

3. Marca solo el evento **"Etapa del lead cambiada"** (en inglés, "Lead status changed").

### 5. Prueba

1. Envía una cotización de prueba desde el sitio, en un navegador sin bloqueador de anuncios.
2. En el lead de Kommo, revisa que la nota diga "ID de Analytics: …".
3. Mueve el lead a «Calificado». En unos segundos debe aparecer la etiqueta `ga-calificado`.
4. En Vercel, en los Logs de la función `api/kommo/etapa`, revisa el resultado:
   - `enviado:qualify_lead` = funcionó.
   - `sin-id-analytics` = el lead no traía ID de Analytics. Puede que la cuenta de Kommo no tenga el campo de rastreo GCLIENTID; avísame.
5. GA4 tarda de 24 a 48 horas en mostrar los eventos en los informes. En **Tiempo real** aparecen en minutos.
6. Borra el lead de prueba o márcalo como perdido.

### 6. Dimensiones en Analytics (opcional, recomendado)

1. En GA4 ve a Administrar → Definiciones personalizadas.
2. Crea dos dimensiones de **ámbito evento**:
   - `lead_source`: la fuente del lead según Kommo (por ejemplo `chatgpt.com`).
   - `kommo_embudo`: el embudo de Kommo.
3. Con eso puedes ver ventas y montos por fuente aunque la venta se cierre semanas después de la visita.

## Respuestas de la función

| Estado | Significado |
|---|---|
| 200 | Procesado. Por cada lead devuelve uno de estos resultados: `enviado:…`, `sin-cambio`, `sin-id-analytics`, `simulacion:…` (fuera de producción, sin clave de GA4) o `kommo-…` / `ga4-…` (error). |
| 403 | La clave de la URL no coincide con `KOMMO_WEBHOOK_SECRET`. |
| 503 | Falta `KOMMO_WEBHOOK_SECRET` o las variables de Kommo. |

## Archivos

- **Navegador:** `src/scripts/ga-cliente.ts` lee la cookie `_ga`. La usan `src/scripts/cotizar/quote.ts` y `src/scripts/agenda/booking.ts`.
- **Servidor:**
  - `server/cotizar.js` y `server/agenda/leads.js` mandan el campo `GCLIENTID` y la línea de la nota.
  - `server/kommo.js` (`leadParaAnalytics`) lee el lead.
  - `server/analytics.js` hace el envío a GA4.
  - `api/kommo/etapa.js` es el webhook.
- **Pruebas:** `tests/analytics/`.
