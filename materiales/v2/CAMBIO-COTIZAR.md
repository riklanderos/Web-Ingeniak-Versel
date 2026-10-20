# Cambio 2026-10-20 · "Cotizar proyecto" en todo el sitio + landings ocultas con reserva directa

**Estado:** especificación aprobable para construir. **Autor:** arquitectura + UX (orquestación del cambio). **Fecha:** 2026-10-20.
**Origen:** pedido del cliente del 2026-10-20 ("Todos los CTA deberán ser para 'Cotizar proyecto' y tener un formulario que brinque como pop up… Discovery Session y Power Session quedan como páginas ocultas… Los datos del form se llevan a Kommo CRM") y su aclaración del mismo día ("Los CTA de las páginas de Power Session y Discovery Session sí tendrán el CTA directo a la agenda y llevará el mismo flujo que integramos en riklanderos.tech").

**Insumos (leerlos antes de construir la parte que te toca):**
- `materiales/v2/landings/flujo-agenda.md` → flujo de riklanderos.tech y plan de port (§1–§4). Es la referencia de paridad del área **agenda**.
- `materiales/v2/landings/kommo-vercel-tecnico.md` → Kommo API v4 y funciones de Vercel (§1–§3). Referencia del área **api**.
- `materiales/v2/landings/discovery-fuente.md` y `power-session-fuente.md` → copy fuente de las dos landings. Referencia del área **landings**.
- `materiales/v2/landings/inventario-cta.md` → dónde vive hoy cada CTA (archivo:línea). Referencia de **cta-codigo**, **copy-a**, **copy-b** y **orquestador**.
- `CONVENCIONES.md`, `materiales/v2/ESPEC-v2.md` (§2, §3, §12) → siguen vigentes salvo lo que esta especificación sustituye (§6.3).
- Código origen de la agenda (solo lectura, **nunca se modifica**): `/Users/riklanderos/Web Rik Versel/riklanderos-web`.

**Precedencia:** este documento manda sobre ESPEC §0.1-4, §2.1 (rol de `--blue`), §2.9 (fila del primario), §4.1, §4.5, §4.6, §5.11, §5.12 y §12.2 R10 donde los contradiga. La adenda normativa que entra a la ESPEC está en §6.3.

**Reglas de trabajo para todas las áreas (no negociables):**
1. Edita **solo** los archivos de tu área (§7). Si necesitas algo de otro archivo, anótalo en `materiales/v2/build/peticiones.md` (área, archivo, qué y por qué) y sigue con un respaldo local.
2. Servidor de desarrollo compartido: `http://127.0.0.1:4321`. Compruébalo con `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4321/`. Solo si nada escucha en 4321, arranca **uno**: `cd "/Users/riklanderos/Web Ingeniak Versel" && nohup npm run dev -- --host 127.0.0.1 > /tmp/ingeniak-dev.log 2>&1 &`. Nunca `astro build` fuera de Verificar. Sin escrituras de git.
3. Capturas: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --user-data-dir=/tmp/chrome-cz-$RANDOM --disable-gpu --hide-scrollbars --window-size=1440,900 --virtual-time-budget=9000 --screenshot=<f>.png <url>`; móvil con `http://127.0.0.1:4321/dev-movil.html?u=<ruta>&w=390&h=844` y `--window-size=400,860`. Para interactuar (abrir el modal, llenar campos) usa un script de Node con CDP (Node 24 trae `WebSocket` global; Chrome con `--remote-debugging-port`). Cierra (kill) todo Chrome que abras.
4. Secretos: ninguno. El token de Kommo, la llave de Stripe y los IDs de calendario solo los captura el cliente en Vercel. En local todo corre en **modo simulación** (§3.9, §5.7). Nunca escribas un valor real en código, docs ni pruebas.
5. Marca: Kain blanco, **siempre de cuerpo completo**; cifras solo con `<Metric>` / `{{metric:ID}}`; precio general solo `{{price}}` ("desde USD 997 al mes"); el precio de la Power Session solo con `{{offer:power-price}}` (§4.4); nada inventado (hechos, clientes, promesas); **ninguna promesa de tiempo de respuesta**; Kommo es el único partner; español de México con tuteo; ámbar solo para dolor y errores de formulario; un solo azul por pantalla; sistema de cristal de `tokens.css`. WhatsApp +52 33 2101 7799 (`SITE.waBase`), correo contacto@ingeniak.mx.

---

## 0. Decisiones (resumen)

| # | Tema | Decisión |
|---|---|---|
| D1 | Acción primaria del sitio | **"Cotizar proyecto"** en las 43 páginas públicas + 404: botón azul `.btn` que **abre el modal** (`data-cotizar`), nunca navega con JS. Sin JS lleva a `/contacto/#cotizar`. |
| D2 | Microcopia bajo el primario | **"Sin compromiso · Te contactamos por WhatsApp y correo"** (`_comun.cta.micro`). Sin cifras ni promesa de tiempo. Sustituye a "30 min · 1:1 · Google Meet · sin costo" fuera de `/discovery/`. |
| D3 | Secundario | Se queda **"Escríbele a Kain"** (`.btn--ghost`, WhatsApp con el `waMessage` propio de la página). KainPill sin cambios. |
| D4 | Modal | `<dialog id="cotizar">` montado **una vez** por BaseLayout en **todas** las páginas (incluidas 404 y landings). 3 pasos: **Qué necesitas · Tu negocio · Contacto**. Éxito con "qué sigue" y WhatsApp; falla con WhatsApp + correo. |
| D5 | Backend | Función de Vercel `api/cotizar.js` (sin adaptador de Astro) → Kommo `GET contacts?query` → `POST leads/complex` → `POST leads/notes`. Respuestas 200 / 422 / 503 / 502 (+400/403/405/413/415/429). Simulación sin variables fuera de producción. |
| D6 | Código de servidor | **JavaScript ESM plano (`.js`) con JSDoc**, sin TypeScript, en `api/` (entradas), `server/` (lógica compartida) y `shared/` (lógica isomorfa que también importa el navegador). Mismo patrón que `src/lib/indexacion.mjs`. Corre igual en Vercel, en Node 24 (pruebas) y en Vite (desarrollo). |
| D7 | Landings ocultas | `/discovery/` (reconstruida) y **nueva** `/power-session/`: `hidden: true` + `indexable: false` → **`noindex,follow`**, fuera de `sitemap.xml`, `llms.txt`, `llms-full.txt`, `/indice.json` (⌘K), menús, footer, "Sigue explorando" y de cualquier enlace desde páginas públicas. Encabezado reducido. |
| D8 | CTA de las landings | Primario = **reserva directa**: ancla `#agenda` con el componente de reserva portado dentro de la página (orden: portada → VSL → **"Reserva en 3 pasos"** → información → cierre). El modal de cotización queda como ruta **secundaria** (`.lnk[data-cotizar]`, nunca azul). |
| D9 | Reserva | Port 1:1 del flujo de riklanderos.tech (3 pasos, Google Calendar en vivo, Meet, Stripe solo para Power, `/agendar/confirmado/`, cron de limpieza). Recursos compartidos con riklanderos.tech (**opción A** de `flujo-agenda.md` §4.2) por defecto. Cada reserva **también** crea lead en Kommo con el mismo módulo de la cotización. Kommo nunca bloquea una reserva. |
| D10 | Stripe | Llamadas REST con `fetch` (`Stripe-Version: 2025-10-29.clover`, la misma API que fija `stripe@19.3.0` del original). Sin SDK. Única dependencia nueva: **`@vercel/connect@2.5.2`** (token de Google). |
| D11 | Precio de la Power Session | **USD 297, pago único**, solo dentro de las landings, con token `{{offer:power-price}}` y nodo `data-offer` (§4.4). Nunca escrito a mano ni con `{{price}}`. |
| D12 | Desarrollo local | Middleware de Vite **solo en `astro dev`** que sirve `api/**` en 127.0.0.1:4321; la cotización corre en simulación y la agenda con adaptadores simulados de Google/Stripe en memoria (§5.7). Pruebas con `node --test` y `fetch` simulado. |

---

## 1. (A) Sistema de CTA

### 1.1 Reglas

1. **Un primario en todo el sitio público:** `Cotizar proyecto`. Etiqueta corta (encabezado < 1100 px): `Cotizar`. Fuente única: `_comun.cta.cotizar` / `_comun.cta.cotizarCorto` (copy-a) y `SITE.quote` (orquestador). Ninguna plantilla escribe la etiqueta a mano.
2. **Nunca navega con JS:** el disparador es un `<a>` con `href` real (respaldo sin JS) que el JS intercepta (`preventDefault`) para abrir el modal.
3. **Respaldo sin JS:** `href="/contacto/#cotizar"`. En la propia `/contacto/`: `href="#cotizar"`. `/contacto/#cotizar` es una sección real (§1.4, fila "Contacto") con WhatsApp y correo como rutas directas. Con JS, cualquier página que se abra con `#cotizar` en la URL abre el modal al cargar.
4. **Un azul por pantalla** (F15, sin cambios): el encabezado pasa a contorno mientras un `[data-primary]` del contenido se ve; la barra móvil se oculta.
5. **El secundario se queda:** `Escríbele a Kain` (WhatsApp, `.btn--ghost`, `waMessage` propio). En secciones con un solo botón (p. ej. el `no-se` de `/servicios/`), solo el primario.
6. **Nada público enlaza a las landings ocultas** (`/discovery/`, `/power-session/`, `/agendar/…`) ni a `agenda.ingeniak.tech`. Lo vigila `check-cta.mjs` (§6.2).

### 1.2 Contrato del disparador (HTML exacto)

```html
<a class="btn" href="/contacto/#cotizar"
   data-primary data-magnetic data-cotizar data-section="hero"
   aria-haspopup="dialog" aria-controls="cotizar">
  <span class="btn__t">Cotizar proyecto</span>
  <span class="btn__node" aria-hidden="true"><svg viewBox="0 0 16 16"><rect class="n" x="5" y="5" width="6" height="6" rx="1"/><path class="r" d="M8 8h6M11 5l3 3-3 3"/></svg></span>
</a>
<p class="t-micro btn-micro">Sin compromiso · Te contactamos por WhatsApp y correo</p>
```

| Atributo | Quién lo pone | Para qué |
|---|---|---|
| `data-cotizar` | todo disparador (botón, enlace `.lnk`, opción del ⌘K, CTA del encabezado, barra móvil) | el binder del modal lo intercepta (clic delegado en `document`, fase de captura) |
| `data-section` | plantillas: `hero`, `cta-final`, `cta-medio`, `no-se`, `header`, `barra`, `menu`, `buscador`, `mega-planes`, `footer`, `ficha`, `rutas`, `cotizar`, `404` | atribución (`ingeniak-src`) y evento `cotizar_open` |
| `data-cotizar-servicio="<slug>"` | opcional, en el disparador o en un ancestro (BaseLayout lo pone en `<body>`) | preselecciona servicios (lista separada por espacios, slugs de `cotizar.json`) |
| `data-cotizar-industria="<slug>"` | opcional, igual | preselecciona industria |
| `aria-haspopup="dialog"` + `aria-controls="cotizar"` | todo disparador | semántica; el binder además pone `role="button"` y activa con Espacio |

Los enlaces de texto del copy que deben abrir el modal llevan en su objeto `"cotizar": true` (p. ej. `{"label":"Cotizar proyecto","href":"/contacto/#cotizar","cotizar":true}`); toda plantilla que pinte `links[]` traduce esa bandera a `data-cotizar` + `aria-haspopup`.

### 1.3 Prefill por página

BaseLayout lee `src/data/cotizar.json → prefill[page.id]` y escribe `data-cotizar-servicio` / `data-cotizar-industria` en `<body>`. El modal toma el valor del ancestro más cercano al disparador (el atributo en el disparador gana). Mapa (va dentro de `cotizar.json`, §2.3):

| page.id | servicio | industria |
|---|---|---|
| consultoria | consultoria-ia | — |
| agentes-whatsapp, kain, guadalajara, art-costo, art-agente-chatbot | agentes-ia | — |
| crm-ia, kommo, gohighlevel, art-kommo-ghl, art-partner-kommo, art-ghl-espanol | crm-ia | — |
| n8n, art-n8n | automatizacion | — |
| paid-media | paid-media | — |
| paginas-web | web-design | — |
| software | software | — |
| seo | seo | — |
| branding | branding | — |
| ind-salud · ind-belleza · ind-nutricion · ind-finanzas · ind-inmobiliario · ind-industrial · ind-retail · ind-horeca | — | salud · belleza · nutricion · finanzas · inmobiliario · industrial-logistica · retail-ecommerce · horeca |
| caso-dental | agentes-ia | salud |
| caso-retail | crm-ia | retail-ecommerce |
| caso-ecommerce | paid-media | retail-ecommerce |
| caso-horeca | paid-media | horeca |
| caso-logistica | automatizacion | industrial-logistica |
| servicios (solo la sección `no-se`, en el disparador) | no-seguro | — |

### 1.4 Superficies y qué cambia

| Superficie | Hoy | Después | Dueño |
|---|---|---|---|
| CTA del encabezado (nav completa) | ATDS → `/discovery/` | `Cotizar proyecto` / corto `Cotizar`, `.btn--sm`, `data-cotizar data-section="header"`, `href="/contacto/#cotizar"` | cta-codigo |
| CTA del encabezado (nav reducida) | AMDS → agenda ext. | `page.primaryCta.label` / `.short` → `page.primaryCta.href` (`#agenda`). Sin CTA si `primaryCta` es `null` (confirmación) | cta-codigo |
| Barra móvil `MobileCTABar` | ATDS | `Cotizar proyecto` (2/3) + WhatsApp (1/3). En landings ocultas (no en la confirmación): `page.primaryCta` → `#agenda`, aparece pasado el 85 % del primer viewport | cta-codigo |
| Hoja del menú móvil | ATDS + micro | `Cotizar proyecto` + micro D2 + ghost EaK. Al pulsar: cierra la hoja y abre el modal | cta-codigo |
| ⌘K, acción fija | ATDS → `/discovery/` | `Cotizar proyecto` · subtítulo "Te contactamos por WhatsApp y correo", `data-cotizar data-section="buscador"` (en `SearchDialog.astro` y en `scripts/nav/search.ts`) | cta-codigo |
| Mega menú "Planes desde USD 997 al mes" | → `/discovery/` | → `/contacto/#cotizar` + `data-cotizar data-section="mega-planes"` (bandera `cotizar: true` en `navegacion.json`) | orquestador (dato) + cta-codigo (pintar) |
| KainPill | WhatsApp | sin cambios | — |
| Footer completo | mapa con "Discovery Session" | mapa sin landings (sale solo: filtra `indexable`); en la columna de contacto, enlace `.lnk[data-cotizar] data-section="footer"` "Cotizar proyecto" | cta-codigo |
| Footer de landings | footer completo | **variante `minimal`**: logo + firma, anclas de la página (`page.footerAnchors`), WhatsApp (mensaje de la página), correo, Aviso de privacidad, enlace a `/`, `.lnk[data-cotizar]` "¿Tienes un proyecto en mente? Cotizar proyecto", © | cta-codigo |
| Portadas (`HeroCtas`) de las 14 plantillas públicas | ATDS + micro Discovery | `Cotizar proyecto` + micro D2 + EaK | cta-codigo |
| Cierres `Dawn` de las plantillas | ATDS | `Cotizar proyecto` + micro D2 + EaK; respaldo de `Dawn.astro` (prop `copy`) → cotizar | cta-codigo |
| `cta-medio` de artículos | ATDS | `Cotizar proyecto` (prefill del artículo) | cta-codigo |
| `/servicios/#no-se` | ATDS | `Cotizar proyecto` con `data-cotizar-servicio="no-seguro"` | cta-codigo |
| `EntitySheet` "Primer paso" (`/`, `/nosotros/`, `/agentes-ia-guadalajara/`) | enlace "Discovery Session" + micro | valor del copy "Cotizar proyecto · te contactamos por WhatsApp y correo"; el componente enlaza "Cotizar proyecto" con `data-cotizar data-section="ficha"` | copy-a/copy-b (texto) + cta-codigo (enlace) |
| `EditorNote variant="cta"` | respaldo ATDS | respaldo cotizar | cta-codigo |
| 404 | buscar + WA | fila: `.btn` `Cotizar proyecto` (`data-section="404"`) + ghost EaK; "Buscar en el sitio ⌘K" sigue como botón contorno junto al rescate | cta-codigo |
| `/contacto/` portada | ATDS + WA + correo | `Cotizar proyecto` (`href="#cotizar"`) + WA + correo | cta-codigo + copy-b |
| `/contacto/#rutas` | ruta "Discovery Session · Agendar" | ruta **"Cotizar proyecto"** (`id: "cotizar"`, acción "Cotizar", `cotizar: true`) + WhatsApp + correo | copy-b + cta-codigo |
| `/contacto/#cotizar` (nueva, antes `formulario` condicional) | — | `Intertitle` split: eyebrow "Cotizar proyecto", H2, "qué sigue" en 3 pasos, `.btn[data-cotizar] href="#cotizar"`, y abajo las rutas directas (WhatsApp, correo) que sirven sin JS | orquestador (id en sitemap) + copy-b + cta-codigo |
| FAQ `/preguntas-frecuentes/#empezar` | enlace "Qué pasa en la Discovery Session" | enlace "Cotizar proyecto" (`cotizar: true`) | copy-b + cta-codigo |
| JSON-LD `Service` Offer 0 | solo `/discovery/` | se queda solo ahí; `/power-session/` emite Offer USD 297 (§4.4) | cta-codigo (`jsonld.ts`) |
| `llms.txt` "Primer paso" | Discovery | "Primer paso: Cotizar proyecto (formulario de 3 pasos en el sitio; te contactamos por WhatsApp y correo) → https://ingeniak.mx/contacto/#cotizar" | orquestador |
| Redirección `/cotiza` | → `/discovery/` | → `/contacto/#cotizar` | orquestador |

### 1.5 Atribución (reutiliza lo que ya guarda `ui.ts`)

Claves de `sessionStorage` (todas dentro de `try/catch`; nunca datos personales):

| Clave | Contenido | Quién la escribe |
|---|---|---|
| `ingeniak-utm` | JSON `{utm_source, utm_medium, utm_campaign, utm_term, utm_content}` (ya existe; primer toque de la sesión) | ui.ts |
| `ingeniak-clid` | **nueva** · JSON `{gclid, fbclid, gbraid, wbraid}` de la URL de llegada (≤ 200 caracteres c/u) | ui.ts |
| `ingeniak-landing` | **nueva** · JSON `{path, referrer, t}`: primera ruta de la sesión, `referrer` solo si es de otro origen, `t` ISO | ui.ts |
| `ingeniak-src` | `${folio}-${sección}` del **primer** clic en un `[data-cotizar]` o en un `a[data-primary][href="#agenda"]` (ya existe; cambia el selector) | ui.ts |
| `ingeniak-agenda-desde` | **nueva** · `data-section` del último clic en `a[href="#agenda"]` de una landing | ui.ts |

`ui.ts → initAttribution` deja de filtrar por `/discovery/` y emite: `cta_cotizar_click {section, folio, src}` (clic en `[data-cotizar]`) y `cta_agenda_click {section, folio}` (clic en `a[data-primary][href="#agenda"]`). `cta_discovery_click` y `agenda_click` se retiran.

---

## 2. (B) Modal "Cotizar proyecto"

### 2.1 Archivos (dueño **modal**)

| Archivo | Contenido |
|---|---|
| `src/components/cotizar/QuoteModal.astro` | Marcado completo del `<dialog>` renderizado en el build (props `waHref`, `page`). Importa `src/styles/forms.css` y `src/styles/cotizar.css`. Incluye un `<script>` **binder** mínimo (≤ 2 KB): delegación de clics `[data-cotizar]`, apertura por `#cotizar`, y `import()` dinámico de `src/scripts/cotizar/quote.ts` en el primer uso (o en `requestIdleCallback`). |
| `src/scripts/cotizar/quote.ts` | Máquina de estados: pasos, validación, borrador, envío, éxito, falla, medición. |
| `src/scripts/cotizar/validar.ts` | Reglas de validación del cliente (§2.4), puras, con los mensajes de `cotizar.json`. |
| `src/components/forms/PhoneField.astro` + `src/scripts/forms/phone.ts` | Control de teléfono con lada (contrato §2.9). Lo reutiliza la agenda. |
| `src/styles/forms.css` | Primitivas de formulario compartidas con la agenda (contrato §2.9). |
| `src/styles/cotizar.css` | Estilos propios del modal (`.qm*`). |
| `src/data/cotizar.json` | Catálogos, textos y mapa de prefill (§2.3). Lo leen el modal, BaseLayout, la función `api/cotizar.js` y `check-cifras`. |
| `src/pages/dev/cotizar.astro` | Demo (`noindex`): disparadores con y sin prefill, botones para forzar `?estado=exito|falla|simulacion|enviando`, el modal en 1440 y 390. |

### 2.2 Pasos y campos

Encabezado del diálogo (fijo arriba en móvil): kicker mono `Cotizar proyecto` · H2 `Cuéntanos qué necesitas` (`tabindex="-1"`, `id="qm-title"`) · `Tres pasos cortos. Te contactamos por WhatsApp y correo.` · progreso de 3 segmentos (`<ol aria-label="Progreso">`, `aria-current="step"` en el activo, etiquetas visibles en escritorio: `1 Qué necesitas · 2 Tu negocio · 3 Contacto`) · botón cerrar (`.btn-icon`, 44 px, `aria-label="Cerrar"`).

| Paso | Campo (`name`) | Control | Requerido | Notas |
|---|---|---|---|---|
| **1 · Qué necesitas** | `servicios` | chips multi (`<input type="checkbox">` dentro de `<label class="chip-opt">`) con glifo de etapa | sí (≥ 1) | "No estoy seguro" es exclusivo: al marcarlo desmarca los demás y viceversa |
| | `objetivo` | chips de opción única (`radio`) con glifo | sí | "¿Qué quieres lograr primero?" |
| | — | `.lnk` "¿Prefieres escribirnos? Escríbele a Kain" (WhatsApp de la página, `data-wa`) | — | atajo, sale del modal |
| **2 · Tu negocio** | `industria` | `<select>` nativo | sí | 8 industrias del sitio + "Otra" |
| | `tamano` | segmentado (`radio`) | sí | "Personas en tu equipo" |
| | `presupuesto` | lista de `radio` en `<fieldset data-form-options="presupuesto">` | sí | incluye "Aún no lo sé"; ayuda: "Monto aproximado del proyecto. Nos ayuda a proponerte el alcance correcto." |
| | `plazo` | `radio` | sí | "¿Para cuándo lo necesitas?" |
| | `canales` | chips multi | no | "¿Por dónde te escriben hoy tus clientes?" |
| | `crm` | chips de opción única | no | "¿Usan algún CRM?" |
| **3 · Contacto** | `nombre` | texto, `autocomplete="name"` | sí | |
| | `empresa` | texto, `autocomplete="organization"` | sí | |
| | `telefono` | `PhoneField` (lada + número), `autocomplete="tel-national"` | sí | etiqueta "WhatsApp"; ayuda "Con lada. Ahí te escribimos." |
| | `email` | `type="email"`, `autocomplete="email"`, `inputmode="email"` | sí | |
| | `canal_preferido` | segmentado: WhatsApp · Correo · Llamada | sí (por defecto WhatsApp) | "¿Cómo prefieres que te contactemos?" |
| | `sitio` | texto, `inputmode="url"` | no | "Sitio web o redes (opcional)" |
| | `vision` | `textarea`, contador `n / 1000` | no | "Cuéntanos tu proyecto (opcional)" · placeholder "Ej. Nos escriben 80 personas al día por WhatsApp y no alcanzamos a responder." — sin "XX" ni cifras comerciales |
| | `consentimiento` | `checkbox` | sí | "Acepto que Ingeniak me contacte por WhatsApp y correo sobre esta solicitud. Leí el [aviso de privacidad](/aviso-privacidad/)." (el enlace abre en pestaña nueva para no perder el formulario) |
| (oculto) | `website_url` | trampa fuera de pantalla, `tabindex="-1"`, `autocomplete="off"`, `aria-hidden` en su contenedor | — | se manda como `meta.hp` |

Botonera (pie fijo en móvil): `Atrás` (`.btn.btn--ghost`, oculto en el paso 1) · primario azul `.btn` (**sin** `data-primary`): `Continuar` en 1 y 2, **`Solicitar cotización`** en 3. Enter en un campo de texto = enviar el paso.

### 2.3 `src/data/cotizar.json` (contenido completo; el dueño **modal** lo escribe tal cual)

```json
{
  "version": 1,
  "titulo": "Cotizar proyecto",
  "h": "Cuéntanos qué necesitas",
  "desc": "Tres pasos cortos. Te contactamos por WhatsApp y correo.",
  "pasos": [
    { "n": 1, "id": "necesidad", "titulo": "Qué necesitas", "h": "¿Qué quieres resolver?" },
    { "n": 2, "id": "negocio", "titulo": "Tu negocio", "h": "Cuéntanos de tu negocio" },
    { "n": 3, "id": "contacto", "titulo": "Contacto", "h": "¿Cómo te contactamos?" }
  ],
  "servicios": [
    { "slug": "agentes-ia", "label": "Agentes de IA para WhatsApp", "glyph": "atender" },
    { "slug": "crm-ia", "label": "CRM con IA (Kommo o GoHighLevel)", "glyph": "organizar" },
    { "slug": "automatizacion", "label": "Automatización de procesos", "glyph": "automatizar" },
    { "slug": "consultoria-ia", "label": "Consultoría en IA", "glyph": "medir" },
    { "slug": "paid-media", "label": "Paid media (anuncios)", "glyph": "atraer" },
    { "slug": "web-design", "label": "Página web", "glyph": "atraer" },
    { "slug": "seo", "label": "SEO y visibilidad en buscadores de IA", "glyph": "atraer" },
    { "slug": "branding", "label": "Branding y contenido", "glyph": "atraer" },
    { "slug": "software", "label": "Software a la medida", "glyph": "automatizar" },
    { "slug": "no-seguro", "label": "No estoy seguro", "glyph": null, "exclusive": true }
  ],
  "objetivos": [
    { "slug": "prospectos", "label": "Conseguir más prospectos", "glyph": "atraer" },
    { "slug": "respuesta", "label": "Responder rápido a cada cliente", "glyph": "atender" },
    { "slug": "orden", "label": "Ordenar ventas y seguimiento", "glyph": "organizar" },
    { "slug": "tiempo", "label": "Quitarle trabajo repetitivo al equipo", "glyph": "automatizar" },
    { "slug": "medir", "label": "Saber qué funciona y qué no", "glyph": "medir" },
    { "slug": "marca", "label": "Lanzar o renovar mi marca o mi sitio", "glyph": "atraer" },
    { "slug": "otro", "label": "Otro", "glyph": null }
  ],
  "industrias": [
    { "slug": "salud", "label": "Salud" },
    { "slug": "belleza", "label": "Belleza y estética" },
    { "slug": "nutricion", "label": "Nutrición" },
    { "slug": "finanzas", "label": "Finanzas" },
    { "slug": "inmobiliario", "label": "Inmobiliario" },
    { "slug": "industrial-logistica", "label": "Industrial y logística" },
    { "slug": "retail-ecommerce", "label": "Retail y e-commerce" },
    { "slug": "horeca", "label": "Restaurantes y hoteles" },
    { "slug": "otra", "label": "Otra" }
  ],
  "tamanos": [
    { "slug": "1-10", "label": "1–10" },
    { "slug": "11-50", "label": "11–50" },
    { "slug": "51-200", "label": "51–200" },
    { "slug": "200+", "label": "Más de 200" }
  ],
  "presupuestos": [
    { "slug": "lt-1k", "label": "Menos de USD 1,000" },
    { "slug": "1k-3k", "label": "USD 1,000 a 3,000" },
    { "slug": "3k-5k", "label": "USD 3,000 a 5,000" },
    { "slug": "5k-10k", "label": "USD 5,000 a 10,000" },
    { "slug": "10k-20k", "label": "USD 10,000 a 20,000" },
    { "slug": "20k-50k", "label": "USD 20,000 a 50,000" },
    { "slug": "gt-50k", "label": "Más de USD 50,000" },
    { "slug": "no-se", "label": "Aún no lo sé" }
  ],
  "plazos": [
    { "slug": "asap", "label": "Lo antes posible" },
    { "slug": "1-3m", "label": "En 1 a 3 meses" },
    { "slug": "3-6m", "label": "En 3 a 6 meses" },
    { "slug": "explorando", "label": "Solo estoy explorando" }
  ],
  "canales": [
    { "slug": "whatsapp", "label": "WhatsApp" },
    { "slug": "instagram", "label": "Instagram" },
    { "slug": "facebook", "label": "Facebook" },
    { "slug": "web", "label": "Sitio web" },
    { "slug": "correo", "label": "Correo" },
    { "slug": "telefono", "label": "Teléfono" },
    { "slug": "mostrador", "label": "Tienda o mostrador" }
  ],
  "crms": [
    { "slug": "kommo", "label": "Kommo" },
    { "slug": "gohighlevel", "label": "GoHighLevel" },
    { "slug": "hubspot", "label": "HubSpot" },
    { "slug": "otro", "label": "Otro CRM" },
    { "slug": "ninguno", "label": "Ninguno (Excel, libreta o solo WhatsApp)" }
  ],
  "canalesPreferidos": [
    { "slug": "whatsapp", "label": "WhatsApp" },
    { "slug": "correo", "label": "Correo" },
    { "slug": "llamada", "label": "Llamada" }
  ],
  "paises": [
    { "iso": "mx", "lada": "+52", "label": "México", "digitos": [10] },
    { "iso": "us", "lada": "+1", "label": "Estados Unidos", "digitos": [10] },
    { "iso": "co", "lada": "+57", "label": "Colombia", "digitos": [10] },
    { "iso": "ar", "lada": "+54", "label": "Argentina", "digitos": [10, 11] },
    { "iso": "es", "lada": "+34", "label": "España", "digitos": [9] },
    { "iso": "cr", "lada": "+506", "label": "Costa Rica", "digitos": [8] },
    { "iso": "ec", "lada": "+593", "label": "Ecuador", "digitos": [9] },
    { "iso": "cl", "lada": "+56", "label": "Chile", "digitos": [9] },
    { "iso": "pe", "lada": "+51", "label": "Perú", "digitos": [9] },
    { "iso": "gt", "lada": "+502", "label": "Guatemala", "digitos": [8] },
    { "iso": "otro", "lada": null, "label": "Otro país", "digitos": [6, 14] }
  ],
  "limites": { "nombre": [3, 120], "empresa": [2, 160], "email": 200, "sitio": 200, "vision": 1000 },
  "textos": {
    "kicker": "Cotizar proyecto",
    "continuar": "Continuar",
    "atras": "Atrás",
    "enviar": "Solicitar cotización",
    "enviando": "Enviando…",
    "cerrar": "Cerrar",
    "pasoDe": "Paso {n} de 3",
    "atajoWa": "¿Prefieres escribirnos? Escríbele a Kain",
    "consentimiento": "Acepto que Ingeniak me contacte por WhatsApp y correo sobre esta solicitud. Leí el {aviso}.",
    "aviso": "aviso de privacidad",
    "resumenErrores": "Revisa {n} campo(s) antes de continuar:",
    "borrador": "Guardamos tus respuestas mientras sigas en esta página.",
    "exito": {
      "h": "Recibimos tu solicitud",
      "hola": "Gracias, {nombre}.",
      "folio": "Folio {folio}",
      "queSigue": "Qué sigue",
      "pasos": [
        "Revisamos tu solicitud con el equipo de Ingeniak.",
        "{canal} para conocer los detalles de tu proyecto.",
        "Si tiene sentido para los dos, preparamos tu cotización con alcance, tiempos y costo."
      ],
      "canal": {
        "whatsapp": "Te contactamos por WhatsApp y por correo",
        "correo": "Te contactamos por correo",
        "llamada": "Te llamamos al número que registraste y te escribimos por correo"
      },
      "wa": "Escríbele a Kain ahora",
      "listo": "Listo",
      "simulacion": "Modo de prueba · no se envió a Kommo"
    },
    "falla": {
      "h": "No pudimos enviar tu solicitud",
      "p": "Tus respuestas siguen aquí. Inténtalo de nuevo o mándanoslas directo:",
      "reintentar": "Reintentar",
      "wa": "Escríbele a Kain",
      "correo": "Enviar por correo",
      "muchos": "Recibimos varios envíos seguidos. Espera unos minutos o escríbenos por WhatsApp."
    },
    "waExito": "Hola Kain, acabo de pedir una cotización en ingeniak.mx (folio {folio}). Me interesa: {servicios}. ¿Seguimos por aquí?",
    "waFalla": "Hola Kain, quise pedir una cotización en ingeniak.mx y no se envió. Empresa: {empresa}. Me interesa: {servicios}. Presupuesto: {presupuesto}. Plazo: {plazo}.",
    "mailAsunto": "Cotización web · {empresa}"
  },
  "errores": {
    "servicios": "Elige al menos un servicio.",
    "objetivo": "Elige qué quieres lograr primero.",
    "industria": "Elige tu industria.",
    "tamano": "Elige el tamaño de tu equipo.",
    "presupuesto": "Elige un rango, aunque sea aproximado.",
    "plazo": "Elige para cuándo lo necesitas.",
    "nombre": "Escribe tu nombre completo.",
    "empresa": "Escribe el nombre de tu empresa.",
    "telefono": "Revisa tu WhatsApp: escribe el número completo, sin la lada.",
    "telefonoLada": "Escribe la lada de tu país (por ejemplo, +52).",
    "email": "Revisa tu correo.",
    "canal_preferido": "Elige cómo prefieres que te contactemos.",
    "sitio": "El sitio o la red social es demasiado largo.",
    "vision": "El texto es demasiado largo (máximo 1000 caracteres).",
    "consentimiento": "Necesitamos tu autorización para contactarte."
  },
  "prefill": {
    "consultoria": { "servicio": "consultoria-ia" },
    "agentes-whatsapp": { "servicio": "agentes-ia" },
    "kain": { "servicio": "agentes-ia" },
    "guadalajara": { "servicio": "agentes-ia" },
    "art-costo": { "servicio": "agentes-ia" },
    "art-agente-chatbot": { "servicio": "agentes-ia" },
    "crm-ia": { "servicio": "crm-ia" },
    "kommo": { "servicio": "crm-ia" },
    "gohighlevel": { "servicio": "crm-ia" },
    "art-kommo-ghl": { "servicio": "crm-ia" },
    "art-partner-kommo": { "servicio": "crm-ia" },
    "art-ghl-espanol": { "servicio": "crm-ia" },
    "n8n": { "servicio": "automatizacion" },
    "art-n8n": { "servicio": "automatizacion" },
    "paid-media": { "servicio": "paid-media" },
    "paginas-web": { "servicio": "web-design" },
    "software": { "servicio": "software" },
    "seo": { "servicio": "seo" },
    "branding": { "servicio": "branding" },
    "ind-salud": { "industria": "salud" },
    "ind-belleza": { "industria": "belleza" },
    "ind-nutricion": { "industria": "nutricion" },
    "ind-finanzas": { "industria": "finanzas" },
    "ind-inmobiliario": { "industria": "inmobiliario" },
    "ind-industrial": { "industria": "industrial-logistica" },
    "ind-retail": { "industria": "retail-ecommerce" },
    "ind-horeca": { "industria": "horeca" },
    "caso-dental": { "servicio": "agentes-ia", "industria": "salud" },
    "caso-retail": { "servicio": "crm-ia", "industria": "retail-ecommerce" },
    "caso-ecommerce": { "servicio": "paid-media", "industria": "retail-ecommerce" },
    "caso-horeca": { "servicio": "paid-media", "industria": "horeca" },
    "caso-logistica": { "servicio": "automatizacion", "industria": "industrial-logistica" }
  }
}
```

`glyph` = id de símbolo de `src/icons/sprite.svg` (`atraer`, `atender`, `organizar`, `automatizar`, `medir`) pintado con `<Icon>` a 20 px: es el **glifo funcional de la etapa** (ESPEC §2.13), no un icono decorativo. Sin emojis ni banderas.

### 2.4 Validación (cliente = servidor; mismas reglas en `validar.ts` y en `server/cotizar.js`)

| Campo | Regla | Saneo |
|---|---|---|
| `servicios` | arreglo de 1 a 10 slugs del catálogo; si contiene `no-seguro`, solo ese | únicos |
| `objetivo`, `industria`, `tamano`, `presupuesto`, `plazo`, `canal_preferido` | un slug del catálogo | — |
| `canales` | 0 a 7 slugs del catálogo | únicos |
| `crm` | vacío o un slug del catálogo | — |
| `nombre` | 3 a 120 caracteres, al menos 2 letras | `trim`, espacios colapsados, sin caracteres de control |
| `empresa` | 2 a 160 | igual |
| `telefono` | `{pais, lada, numero}`: `pais` en el catálogo; `lada` = la del país (o, con `pais: "otro"`, `^\+[1-9]\d{0,3}$`); `numero` = solo dígitos tras quitar espacios, guiones, puntos y paréntesis; longitud dentro de `digitos` del país; si `numero` empieza con la lada sin `+` (p. ej. `52…` con 12 dígitos en México), se quita; E.164 total ≤ 15 dígitos | se manda y guarda como E.164 `+523312345678` |
| `email` | `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`, ≤ 200 | minúsculas, `trim` |
| `sitio` | ≤ 200 | `trim` |
| `vision` | ≤ 1000 | `trim`, sin caracteres de control salvo `\n` |
| `consentimiento` | `true` | — |

Errores en línea (`<p id="qm-<campo>-error" class="fld__error">`, ámbar), `aria-invalid="true"` y `aria-describedby` en tiempo de ejecución; al intentar avanzar con errores, **resumen** arriba del paso (`role="alert"`, `data-qm-summary`) con enlaces a cada campo, y el foco va al primer campo con error. El error de un campo se borra al corregirlo (`input`/`change`).

### 2.5 Estados y comportamiento

| Estado | Qué pasa |
|---|---|
| **Apertura** | Clic en `[data-cotizar]` (o `#cotizar` en la URL al cargar / `hashchange`, o `window.ingeniakCotizar.open({servicio, industria, section})`). Antes de `showModal()`: `document.dispatchEvent(new CustomEvent('ingeniak:overlays-close'))` (la nav cierra hoja, ⌘K y mega menú) y `lock('cotizar', true)` de `src/scripts/nav/overlay.ts` (pausa Lenis, `html.is-locked`, `html[data-overlay]` oculta barra y píldora). Restaura el borrador; aplica prefill solo a campos vacíos; foco al H2 del paso. Evento `cotizar_open {section, origen: 'cta'|'hash'|'api', servicio?, industria?}` (slugs, nunca texto). |
| **Pasos** | Cambio de paso: valida el actual; oculta/muestra `section[data-qm-step]` (`hidden`); mueve el foco al `h3` del paso (`tabindex="-1"`); anuncia en `aria-live="polite"` "Paso 2 de 3: Tu negocio"; evento `cotizar_step {step}`. Transición CSS de opacidad + 12 px (0.35 s, `--ease-cine`), quieta con movimiento reducido. |
| **Borrador** | Cada `input`/`change` guarda los campos (salvo `consentimiento` y la trampa) en `sessionStorage['ingeniak-cotizar']` con `try/catch`. Se borra al tener éxito. |
| **Cierre** | Esc (`cancel`), botón cerrar o clic en el backdrop. `unlock('cotizar')`, foco de vuelta al disparador, `history.replaceState` quita `#cotizar` si lo había. Evento `cotizar_close {step, done}`. |
| **Enviando** | Botón con `aria-busy="true"`, spinner y "Enviando…", deshabilitado; el `<form>` queda `inert`. `submission_id` = `crypto.randomUUID()` creado al primer intento y **reutilizado** en reintentos hasta el éxito. Evento `cotizar_submit`. |
| **Éxito (200)** | Vista `data-qm-done`: nodo de check cian, H "Recibimos tu solicitud", "Gracias, {primer nombre}.", folio mono, "Qué sigue" (3 pasos de `textos.exito`; el paso 2 según `canal_preferido`), botón `.btn--ghost` con icono WhatsApp **"Escríbele a Kain ahora"** → `wa.me` con `textos.waExito` (folio + nombres de servicios; **sin** nombre, correo ni teléfono), y "Listo" (cierra). Si la respuesta trae `dryRun: true`, chip mono "Modo de prueba · no se envió a Kommo". Borra el borrador. Evento `cotizar_success {dryRun}`. Sin promesas de tiempo. |
| **Inválido (422)** | Pinta `errors`, salta al paso del primer error, resumen. Evento `cotizar_error {status: 422}`. |
| **Demasiados (429)** | Vista de falla con `textos.falla.muchos`. |
| **Falla (502, 503, red)** | Vista `data-qm-fail`: "No pudimos enviar tu solicitud", `Reintentar` (azul), "Escríbele a Kain" (ghost, `wa.me` con `textos.waFalla`: empresa, servicios, presupuesto y plazo; sin datos de contacto) y "Enviar por correo" (`.lnk`, `mailto:contacto@ingeniak.mx?subject=…&body=…` con el resumen completo de lo que llenó; el correo lo manda la persona desde su cliente). Evento `cotizar_error {status}`. |

El `waHref` del éxito y de la falla se **genera en JS** (no está en el HTML estático). El único enlace de WhatsApp del HTML del modal es el atajo del paso 1 con el `waMessage` de la página.

### 2.6 Diseño (premium, mejor que la referencia)

- **Diálogo:** `.glass-panel` (cristal nivel 2) sobre `::backdrop { background: rgb(3 4 11 / .72); backdrop-filter: blur(8px) }`; aura del isotipo desenfocada **dentro** del panel, arriba a la derecha (decorativa, `aria-hidden`), para que el cristal siempre tenga luz detrás. Radio `--r-panel`. Sombra `--e-3`. Filo superior cian de `.glass-panel`.
- **Escritorio (≥ 768 px):** centrado, `width: min(720px, 100vw - 48px)`, `max-height: min(860px, 92dvh)`; encabezado y pie fijos dentro del panel, cuerpo con scroll interno (`overscroll-behavior: contain`). Chips de servicio en 2 columnas; objetivos en 2; presupuesto en 2 columnas de radios.
- **Móvil (< 768 px):** hoja a pantalla completa (`inset: 0; width: 100%; height: 100dvh; border-radius: 0`), entra con `y: 4% → 0` y opacidad (0.35 s). Encabezado fijo (kicker, progreso, cerrar) y pie fijo con `padding-bottom: env(safe-area-inset-bottom)`; chips en 1 columna; al enfocar un campo, `scrollIntoView({block:'center'})` respetando el teclado (`visualViewport`).
- **Tipos:** H2 Lexend 600 `--fs-h3`; labels `.t-label`; inputs Inter 16 px (evita zoom en iOS); errores `--amber`; selección de chip con borde y relleno **cian** (`.is-active-glass`-like), nunca azul. El único azul es el botón principal del paso.
- **Chips (`.chip-opt`):** alto ≥ 44 px, borde `--hair-2`, glifo de etapa a 20 px en `--muted` (cian al marcar), check del sprite a la derecha cuando está marcado.
- **Contraste:** todo texto AA sobre el panel (`--text` y `--text-2`; `--muted` solo para ayudas sobre el panel, que es oscuro sólido en su área de texto).
- **`forced-colors`:** bordes `ButtonText`, selección con `Highlight`.

### 2.7 Accesibilidad (criterios)

`<dialog>` nativo con `showModal()` (el resto queda inerte: trampa de foco), `aria-labelledby="qm-title"`, `aria-describedby="qm-desc"`; Esc cierra; foco devuelto al disparador; cada control con `<label>` visible; grupos en `<fieldset>` + `<legend>`; errores enlazados; `aria-live` para el paso y para "Enviando…"; objetivos ≥ 44 × 44 px; orden de tabulación = orden visual; funciona con teclado de principio a fin; `prefers-reduced-motion` y `html[data-motion="reduced"]` sin transiciones; zoom al 200 % sin pérdida.

### 2.8 Medición

`document.dispatchEvent(new CustomEvent('ingeniak:track', {detail:{name, page: location.pathname, …}}))` con: `cotizar_open`, `cotizar_step`, `cotizar_submit`, `cotizar_success`, `cotizar_error`, `cotizar_close`, `whatsapp_click {section: 'cotizar-atajo'|'cotizar-exito'|'cotizar-falla'}`. **Nunca** texto escrito por la persona ni datos de contacto.

### 2.9 Primitivas compartidas (contrato para la agenda)

`src/styles/forms.css` define, con tokens de `tokens.css`, estas clases (la agenda las usa y **no** las redefine; si necesita ajustes, los escribe con alcance `.bk …` en `agenda.css`):

| Clase | Qué es |
|---|---|
| `.fld` | contenedor de campo (grid: label, control, ayuda, error) |
| `.fld__label`, `.fld__opt` ("Opcional"), `.fld__help`, `.fld__error` (ámbar, `role` lo pone el JS), `.fld__count` (contador mono) | partes |
| `.fld__input`, `.fld__select`, `.fld__textarea` | controles (alto 48 px, radio `--r-input`, fondo `rgb(255 255 255 / .04)`, borde `--hair-2`, foco cian global) |
| `.fld[data-invalid]` | estado de error (borde ámbar) |
| `.chips` + `.chip-opt` (con `input` real dentro) | grupo de chips multi o único |
| `.seg` + `.seg__opt` | control segmentado |
| `.check` | casilla con texto |
| `.fld-phone`, `.fld-phone__cc`, `.fld-phone__num` | teléfono con lada |
| `.form-summary` | resumen de errores |
| `.hp` | contenedor de la trampa (fuera de pantalla) |

`PhoneField.astro` — props: `id` (obligatorio), `name = "telefono"`, `label = "WhatsApp"`, `help = "Con lada. Ahí te escribimos."`, `required = true`, `pais = "mx"`. Pinta `<select name="{name}_pais">` (opciones de `cotizar.json → paises`, texto `MX +52`, nombre completo en `aria-label`/`title`), `<input name="{name}_lada">` visible solo con "Otro país", `<input type="tel" name="{name}_numero" inputmode="tel" autocomplete="tel-national" placeholder="33 1234 5678">`.
`src/scripts/forms/phone.ts` exporta `readPhone(root: HTMLElement): { pais, lada, numero, e164, ok, error: 'telefono'|'telefonoLada'|null }` y `normalizePhone({pais, lada, numero}, paises)` (la misma lógica del servidor, §2.4).

---

## 3. (C) Backend de cotización

### 3.1 Arquitectura y reglas de Vercel

```
api/                          ← cada archivo = una función de Vercel (Node 24, ESM)
  cotizar.js                  (api)          POST /api/cotizar/
  agenda/…                    (agenda)       §5
server/                       ← lógica de servidor compartida (NO se publica como función)
  http.js                     (api)          respuestas, lectura segura, origen, IP, límite
  kommo.js                    (api)          cliente Kommo + webhook de aviso (lo usa también la agenda)
  cotizar.js                  (api)          validación, normalización, armado de lead/nota/etiquetas
  agenda/…                    (agenda)       §5
shared/
  agenda.js                   (agenda)       reglas isomorfas de la reserva (§5)
tests/
  cotizar/*.test.mjs          (api)
  agenda/*.test.mjs           (agenda)
```

- **Firma:** `export default { async fetch(request) { … } }` (handler web de Vercel para Node). Las pruebas y el middleware de desarrollo llaman `handler.fetch(new Request(…))`.
- **ESM:** `package.json` ya tiene `"type": "module"`; imports relativos **con extensión `.js`**. Catálogo: `import catalogo from '../src/data/cotizar.json' with { type: 'json' }` (importación estática para que Vercel lo empaquete). Nunca importar `src/lib/site.ts` ni nada de Astro desde `api/` o `server/`.
- **Duración:** `vercel.json → functions` (`api/cotizar.js`: 15 s; `api/agenda/*.js`: 30 s).
- **Barra final:** el cliente llama **`/api/cotizar/`** (con barra, como todo el sitio). Riesgo abierto a verificar en el primer Preview (§8): `curl -i -X POST https://<preview>/api/cotizar/ -H 'origin: https://<preview>' -H 'content-type: application/json' -d '{}'` debe dar **422 JSON** de la función. Si da 404, el orquestador agrega el rewrite `{ "source": "/api/:path*/", "destination": "/api/:path*" }` (o rutas explícitas) en `vercel.json`.

### 3.2 Contrato `POST /api/cotizar/`

Petición: `Content-Type: application/json`, ≤ 16 KB.

```json
{
  "submission_id": "6f1c2d3e-…",
  "servicios": ["agentes-ia", "crm-ia"],
  "objetivo": "respuesta",
  "industria": "salud",
  "tamano": "11-50",
  "presupuesto": "3k-5k",
  "plazo": "1-3m",
  "canales": ["whatsapp", "instagram"],
  "crm": "ninguno",
  "nombre": "Ana Pérez",
  "empresa": "Clínica Ejemplo",
  "telefono": { "pais": "mx", "lada": "+52", "numero": "3312345678" },
  "email": "ana@empresa.mx",
  "canal_preferido": "whatsapp",
  "sitio": "clinicaejemplo.mx",
  "vision": "…",
  "consentimiento": true,
  "meta": {
    "pagina": "/servicios/agentes-ia-whatsapp/", "folio": "102", "cta": "hero", "src": "102-hero",
    "landing": "/blog/kommo-vs-gohighlevel/", "referrer": "https://www.google.com/",
    "utm_source": "", "utm_medium": "", "utm_campaign": "", "utm_term": "", "utm_content": "",
    "gclid": "", "fbclid": "", "zona": "America/Mexico_City", "t_llenado_ms": 41250, "hp": ""
  }
}
```

| Caso | Código | Cuerpo |
|---|---|---|
| Creado en Kommo | 200 | `{ ok: true, folio: "IK-6F1C2D", delivered: "kommo" }` |
| Kommo falló pero el webhook de aviso sí lo recibió | 200 | `{ ok: true, folio, delivered: "webhook" }` |
| Simulación (sin `KOMMO_SUBDOMAIN`/`KOMMO_TOKEN` y `VERCEL_ENV !== 'production'`) | 200 | `{ ok: true, folio, dryRun: true, preview: { contactSearch: [...], complex: [...], note: [...], tags: [...] } }` |
| Bot (trampa llena o `t_llenado_ms < 3000`) | 200 | `{ ok: true, folio }` y **no** se llama a nadie |
| Envío repetido (mismo `submission_id` en 10 min) | la misma respuesta guardada | sin segunda llamada a Kommo |
| JSON roto | 400 | `{ ok: false, error: "No pudimos leer la solicitud." }` |
| Otro origen o sin `Origin` | 403 | `{ ok: false, error: "Origen no permitido." }` |
| Método ≠ POST | 405 | `Allow: POST` |
| > 16 KB | 413 | `{ ok: false, error: "La solicitud es demasiado grande." }` |
| `Content-Type` ≠ JSON | 415 | — |
| Datos inválidos | **422** | `{ ok: false, error: "Revisa los campos marcados.", errors: { email: "Revisa tu correo.", … } }` (mensajes de `cotizar.json → errores`) |
| Límite por IP | 429 | `{ ok: false, error: "…", retryAfter: 600 }` + `Retry-After` |
| Kommo falló y no hubo webhook | **502** | `{ ok: false, error: "No pudimos registrar tu solicitud.", fallback: { whatsapp: "https://wa.me/523321017799", email: "contacto@ingeniak.mx" } }` |
| Producción sin variables de Kommo | **503** | igual que 502 con `error: "El formulario no está disponible en este momento."` |

Todas las respuestas: `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store`, `X-Robots-Tag: noindex`. Sin cabeceras CORS (solo mismo origen). `folio` = `"IK-" + primeros 6 hex del submission_id en mayúsculas`.

### 3.3 Reglas del handler (`api/cotizar.js` + `server/http.js` + `server/cotizar.js`)

1. Método → origen (`new URL(request.headers.get('origin')).host` debe ser igual a `x-forwarded-host` ?? `host`) → `Content-Type` → tamaño (`content-length` y lectura con tope) → JSON.
2. Trampa/tiempo (respuesta 200 silenciosa).
3. Límite: **6 envíos por IP cada 10 min** (`x-forwarded-for` primer valor ?? `x-real-ip`), `Map` en memoria con limpieza; esfuerzo razonable por instancia, no garantía.
4. Validación §2.4 con listas blancas de `cotizar.json` → 422.
5. Normalización (E.164, minúsculas, recortes) y armado (§3.4).
6. Kommo (§3.4) → respuesta. Webhook de aviso siempre que exista (§3.5).
7. Logs **sin datos personales ni token**: `{evento:'cotizar', folio, kommo: status, leadId, delivered, ms}`.

### 3.4 Kommo (recomendación de `kommo-vercel-tecnico.md` §1)

Base `https://{KOMMO_SUBDOMAIN}.kommo.com/api/v4` (o `KOMMO_BASE_URL` solo en pruebas), `Authorization: Bearer {KOMMO_TOKEN}`, `AbortSignal.timeout(8000)` por llamada, máximo 4 llamadas en orden:

1. `GET /contacts?query=<email>`; si 204, `GET /contacts?query=<+E164>`. Si hay coincidencia exacta en `EMAIL` o `PHONE` → contacto existente `{ id }`.
2. `GET /leads/custom_fields?limit=250` **una vez por instancia** (caché en memoria) para el mapa `code → id` de los campos `tracking_data` (`UTM_SOURCE`, `UTM_MEDIUM`, `UTM_CAMPAIGN`, `UTM_TERM`, `UTM_CONTENT`, `REFERRER`, `GCLID`, `FBCLID`); solo se mandan los que existen.
3. `POST /leads/complex` con un lead:
   - `name`: **`Cotización web · {empresa}`**
   - `pipeline_id` / `status_id` / `responsible_user_id`: enteros de `KOMMO_PIPELINE_ID` / `KOMMO_STATUS_ID` / `KOMMO_RESPONSIBLE_USER_ID` si existen.
   - `price`: no se manda (el presupuesto es un rango).
   - `custom_fields_values`: tracking que exista.
   - `_embedded.tags`: `web-cotizar` · `servicio-<slug>` por cada servicio · `presupuesto-<slug>` · `plazo-<slug>` · `industria-<slug>` · `prefiere-<whatsapp|correo|llamada>` · `pagina-<page.id>` (de `meta.pagina` → id; si no se reconoce, `pagina-otra`) · `entorno-preview` si `VERCEL_ENV === 'preview'`.
   - `_embedded.contacts[0]`: nuevo `{ name, custom_fields_values: [ {field_code:'PHONE', values:[{value:'+52…', enum_code:'MOB'}]}, {field_code:'EMAIL', values:[{value, enum_code:'WORK'}]} ] }` o existente `{ id }`.
   - `_embedded.companies[0]`: `{ name: empresa }` **solo** con contacto nuevo.
   - Si responde 400 con errores en `custom_fields_values` → **un** reintento sin tracking.
4. `POST /leads/notes` → `[{ entity_id: leadId, note_type: 'common', params: { text } }]`. Si falla, el lead ya existe: log y 200.

**Nota (formato exacto, una línea por renglón):**

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
UTM: source=google · medium=cpc · campaign=… · term=… · content=…
gclid=… · fbclid=…
Zona horaria: America/Mexico_City · Enviado: 20/10/2026 12:34 (hora del centro de México)
Consentimiento de contacto por WhatsApp y correo: sí (2026-10-20T18:34:00.000Z)
Entorno: production
```

Renglones vacíos (sin dato) se omiten. Etiquetas legibles salen de `cotizar.json`.

**Errores de Kommo → acción:** 401/402/403/429/5xx/red → respaldo (§3.5) y, si el webhook no lo recibió, 502. 401/402/403/429 además mandan alerta `kommo.alerta` al webhook ("renovar token", "cuenta sin pago", "permisos o IP bloqueada", "límite de peticiones").

### 3.5 Webhook de aviso (opcional)

Si existe `NOTIFY_WEBHOOK_URL`: `POST` JSON con `x-webhook-secret: NOTIFY_WEBHOOK_SECRET` (si existe), tiempo límite 5 s, **siempre** después de intentar Kommo:
`{ event: 'lead.created' | 'kommo.alerta', site: 'ingeniak.mx', source: 'cotizar' | 'agenda-discovery' | 'agenda-power', env, folio, kommo: { ok, status, leadId }, data: { …payload normalizado… } }`. Si Kommo falló y el webhook respondió 2xx → `delivered: 'webhook'` y 200 al visitante.

### 3.6 Variables de entorno (las captura el cliente en Vercel; nunca en el repositorio)

| Variable | Obligatoria | Secreta | Uso |
|---|---|---|---|
| `KOMMO_SUBDOMAIN` | sí (producción) | no | `ingeniak` de `ingeniak.kommo.com` |
| `KOMMO_TOKEN` | sí (producción) | **sí** (tipo Secret) | token de larga duración de la integración privada |
| `KOMMO_PIPELINE_ID`, `KOMMO_STATUS_ID`, `KOMMO_RESPONSIBLE_USER_ID` | no | no | embudo, etapa ("Nuevo · Sitio web") y responsable de las cotizaciones |
| `KOMMO_AGENDA_PIPELINE_ID`, `KOMMO_AGENDA_STATUS_ID` | no | no | embudo/etapa de las reservas (por defecto, los de la cotización) |
| `NOTIFY_WEBHOOK_URL`, `NOTIFY_WEBHOOK_SECRET` | no | sí | copia de cada lead y alertas |
| `KOMMO_BASE_URL` | no (solo pruebas) | no | simulador local; **nunca** en Vercel |

`.env.example` (dueño **api**) lista **todas** las variables de §3.6 y §5.8 con valores vacíos y una línea de comentario cada una.

### 3.7 API compartida para la agenda

`server/http.js` exporta: `json(body, status = 200, headers = {})` · `readJson(request, { limit = 16384 })` → `{ ok: true, data } | { ok: false, status: 400|413|415 }` · `sameOrigin(request)` → boolean · `clientIp(request)` · `throttle(key, { max, windowMs })` → `{ ok, retryAfter }` · `clean(s, max)` · `envName()` → `'production'|'preview'|'development'|'local'`.

`server/kommo.js` exporta:
- `kommoConfigured()` → boolean
- `createLeadWithNote({ name, contact: { name, phoneE164, email }, company, tags, note, tracking, pipelineId, statusId, responsibleUserId })` → `{ ok: true, leadId, contactId, dryRun?: true, preview? } | { ok: false, status, reason: 'not-configured'|'auth'|'payment'|'forbidden'|'rate'|'validation'|'server'|'network' }`. **Nunca lanza.**
- `updateLeadTags(leadId, { add = [], remove = [] })` → `PATCH /leads/{id}` con `tags_to_add` / `tags_to_delete` → `{ ok }` (verificar el formato contra la referencia de Kommo "Leads · edit" al implementar; si no aplica, `PATCH /leads` con `_embedded.tags` completo).
- `addLeadNote(leadId, text)` → `{ ok }`
- `notify(event, payload)` → `Promise<boolean>`

### 3.8 Desarrollo local (middleware de Vite, dueño **orquestador**)

`astro.config.mjs` agrega un plugin **solo de `astro dev`** (`apply: 'serve'`; el build no cambia):

```js
function apiLocal() {
  return {
    name: 'ingeniak:api-local',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url ?? '/', 'http://x');
        if (!pathname.startsWith('/api/')) return next();
        const rel = pathname.replace(/\/+$/, '');                                  // /api/agenda/reservar
        if (rel.split('/').some((s) => s.startsWith('_'))) return next();
        const file = fileURLToPath(new URL(`.${rel}.js`, import.meta.url));        // ./api/agenda/reservar.js
        if (!existsSync(file)) return next();
        try {
          const mod = await server.ssrLoadModule(file);
          const h = mod.default?.fetch ? mod.default : null;
          if (!h) return next();
          const chunks = []; for await (const c of req) chunks.push(c);
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method, headers: req.headers,
            body: ['GET', 'HEAD'].includes(req.method ?? 'GET') ? undefined : Buffer.concat(chunks),
          });
          const r = await h.fetch(request);
          res.statusCode = r.status; r.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await r.arrayBuffer()));
        } catch (e) { server.config.logger.error(`[api-local] ${rel}: ${e?.message}`); res.statusCode = 500; res.end('{"ok":false}'); }
      });
    },
  };
}
// defineConfig({ …, vite: { plugins: [apiLocal()] } })
```

En `astro dev` no existe `VERCEL_ENV`: la cotización responde en **simulación** y la agenda usa sus adaptadores simulados (§5.7). Así las pruebas con CDP abren el modal, lo llenan y ven el éxito real del flujo.

### 3.9 Pruebas locales (dueño **api**, `node --test tests/cotizar/`)

`fetch` global simulado con `t.mock.method(globalThis, 'fetch', …)`; variables de entorno puestas y restauradas por prueba. Casos obligatorios:

1. Válido sin variables → 200 `dryRun` con `preview.complex[0]` igual a una instantánea (nombre `Cotización web · Clínica Ejemplo`, etiquetas exactas, PHONE `MOB` E.164, EMAIL `WORK`).
2. Con variables: contacto nuevo (204, 204) → `complex` → `notes`; orden y cuerpos exactos.
3. Contacto existente por correo → `contacts: [{ id }]` y **sin** `companies`.
4. `complex` 400 por tracking → reintento sin tracking → 200.
5. 401 de Kommo + webhook 200 → 200 `delivered: 'webhook'` + alerta enviada; 401 sin webhook → 502 con `fallback`.
6. 429 de Kommo → 502 sin reintentos.
7. `VERCEL_ENV=production` sin variables → 503.
8. Inválidos → 422 con las claves exactas (`servicios`, `telefono`, `email`, `consentimiento`…); `no-seguro` + otro servicio → 422.
9. Trampa llena y `t_llenado_ms: 900` → 200 sin ninguna llamada a `fetch`.
10. Origen distinto → 403; GET → 405; 20 KB → 413; `text/plain` → 415; 7.º envío de la misma IP → 429; mismo `submission_id` dos veces → una sola llamada a Kommo.
11. Teléfonos: `{mx, "+52", "(33) 1234-5678"}` → `+523312345678`; `{mx, "+52", "523312345678"}` → `+523312345678`; `{mx, "+52", "331234"}` → error `telefono`; `{otro, "+380", "501234567"}` → `+380501234567`.
12. La nota no contiene `undefined`, `null` ni renglones vacíos; logs sin correo, teléfono ni token (espiar `console.log`/`console.error`).

---

## 4. (D) Landings ocultas `/discovery/` y `/power-session/`

### 4.1 Reglas comunes

| Regla | Cómo |
|---|---|
| Oculta | `sitemap.json`: `"indexable": false`, `"hidden": true`. `indexacion.mjs → isNoindex` ya da `noindex,follow`; `isHidden()` nuevo las saca de `/indice.json`, del FAQ de `/preguntas-frecuentes/`, de "Sigue explorando" (`heroKit.builtRelated`) y de cualquier lista. |
| Robots | `<meta name="robots" content="noindex,follow">` (decisión: **follow**, para que el rastreador que llegue por una campaña siga a `/` y a `/aviso-privacidad/`). `/agendar/` además con `X-Robots-Tag: noindex` en `vercel.json`. |
| Fuera de | `sitemap.xml`, `llms.txt`, `llms-full.txt`, ⌘K, encabezado, mega menú, hoja móvil, footer completo, `internalLinks` de otras páginas y todo enlace desde una página pública (guarda §6.2). |
| Navegación | `nav="reduced"`: logo + CTA de la landing (`page.primaryCta` → `#agenda`); sin riel, sin KainPill, sin mega menú. **Barra móvil propia** con el mismo CTA (aparece pasado el 85 % del primer viewport; se oculta mientras el componente de reserva o un `[data-primary]` está a la vista). Footer `minimal`. |
| Orden | portada → VSL → **`#agenda` "Reserva en 3 pasos"** → información → cierre (como riklanderos.tech). |
| Primario | todo `a[data-primary]` fuera del componente es `href="#agenda"` + `data-section`; al hacer clic: scroll suave con `window.__lenis?.scrollTo('#agenda', { offset: -96 })` (o `scrollIntoView` si no hay Lenis o con movimiento reducido) y luego `document.querySelector('[data-agenda]')?.dispatchEvent(new CustomEvent('agenda:focus'))`. |
| Secundario | "Escríbele a Kain" con el `waMessage` de la landing. **Ruta de cotización** como `.lnk[data-cotizar]` en el cierre y en el footer mínimo, nunca azul. |
| Cristal del formulario | la sección `#agenda` es un `Intertitle` split con aura (el panel de cristal siempre tiene luz detrás); sin fondo de sección (§3.11). |
| Kain | solo placas aprobadas del sitio (cuerpo completo). Sin generar imágenes nuevas. |

### 4.2 `/discovery/` (reconstruida; `sitemap.json → sections` en este orden)

| # | id | Componente y placa | Contenido |
|---|---|---|---|
| 1 | `hero` | `ImageSection` hero · `discovery-hero` (subject-right, móvil split) | Igual que hoy (chip-spec "Llamada 1:1 · 30 minutos · sin costo", H1, lede, remate). Primario **"Agendar mi Discovery Session"** → `#agenda` (`data-section="hero"`), micro `30 min · 1:1 · Google Meet · sin costo` (permitida por `MICRO_29`), EaK. |
| 2 | `video` | `VideoScene` · `discovery-vsl-poster` · VSL `discovery-vsl-720.mp4` | Igual que hoy + **primario bajo el video** (como la fuente): "Agendar mi Discovery Session" → `#agenda` (`data-section="video"`) después de "Si reconociste tu negocio en este video, esta llamada es tu siguiente paso." |
| 3 | `agenda` | `Intertitle` split + `BookingFlow tipo="discovery"` | Columna izquierda (fija en escritorio): eyebrow "Reserva en 3 pasos", H2 "Aparta tu lugar" / soft "en minutos.", pasos 01 **Tus datos** ("Unas preguntas sobre ti y tu negocio. Sin ensayo.") · 02 **Horario** ("Próximos 5 días hábiles, en hora del centro de México.") · 03 **Confirmas** ("Te llega la invitación de Google Calendar con el enlace de Meet."), "Sales con" (2 renglones de `que-es.left`: sugerencias concretas de qué automatizar y en qué orden; claridad sobre si una implementación tiene sentido, y cuánto costaría), nota "Sin costo y sin tarjeta. Si necesitas mover la llamada, escríbenos por WhatsApp o a contacto@ingeniak.mx." Columna derecha: el componente. |
| — | ~~`pasos`~~ | — | **Se elimina** (lo absorbe `#agenda`; su línea "Siete preguntas · dos minutos" era inexacta). |
| 4 | `que-es` | `Intertitle` + `TwoColumnScript dodont` | Igual que hoy. |
| 5 | `para-quien` | `ImageSection` mid · `discovery-para-quien` (subject-left, móvil split) | Igual que hoy. |
| 6 | `despues` | `Intertitle` split + primario | Igual; primario → `#agenda` (`data-section="despues"`). |
| 7 | `faq` | `Intertitle` split + `FAQAccordion` D01–D06 | Igual. |
| 8 | `cta-final` | `Dawn` · `discovery-cta-final` | Igual; primario → `#agenda`, EaK y debajo `.lnk[data-cotizar]` "¿Ya sabes lo que necesitas? Cotizar proyecto". |

### 4.3 `/power-session/` (nueva; `sitemap.json → sections` en este orden)

Lados alternados (D/I = sujeto a la derecha/izquierda). Copy fuente: `power-session-fuente.md` §2, con las correcciones de §4.5.

| # | id | Componente y placa | Contenido (copy en `power-session.json`) |
|---|---|---|---|
| 1 | `hero` | `ImageSection` hero · **`consultoria-hero`** (Kain apoya la mano en el cristal y presenta una ruta; D; móvil split; `priority`) | chip-spec "Sesión 1:1 · 90 minutos · Google Meet"; H1 **"Deja de ser el héroe de tu negocio"** + soft **"y conviértete en el arquitecto de tu sistema"** (`.lit` = "arquitecto", en la segunda voz: `h1.litSoft`); lede "90 minutos para auditar tu operación completa, ubicar tus cuellos de botella y definir el orden exacto de lo que se automatiza primero. Con tus números, no con teoría."; primario **"Agendar mi Power Session"** → `#agenda`; micro `{{offer:power-price}} · pago único · 90 min por Google Meet`; EaK. |
| 2 | `video` | `VideoScene` · **`home-sistema-5-medir`** (D) · VSL `/video/powersession-vsl-720.mp4` | **Condicional**: `status: "conditional"` en `sitemap.json` y `_omitir` en el copy hasta que exista el VSL recodificado (§9, decisión del cliente). H2 "Mira esto" / "antes de agendar."; after "Si reconociste tu operación en este video, esta sesión es tu siguiente paso." + primario → `#agenda`. |
| 3 | `agenda` | `Intertitle` split + `BookingFlow tipo="power"` | Izquierda: eyebrow "Reserva en 3 pasos", H2 "Aparta tu lugar" / "en minutos."; pasos 01 **Tu diagnóstico** ("Preguntas sobre tu negocio y tu operación. Sin ensayo.") · 02 **Horario** ("Próximos 5 días hábiles, en hora del centro de México. Tu horario queda apartado 30 minutos mientras pagas.") · 03 **Pago** ("Pagas {{offer:power-price}} con tarjeta en Stripe y te llega la invitación con el enlace de Google Meet."); "Sales con": tu mapa de operación y tus cuellos de botella · un plan de implementación a 90 días · el stack recomendado, con precios reales; nota "Abrimos 4 sesiones por semana, por orden de pago." |
| 4 | `diagnostico` | `ImageSection` mid · **`dolor-operacion`** (I; `tone="dolor"`; móvil split) + cuestionario | eyebrow "Diagnóstico rápido" (ámbar); H2 "¿Eres el cuello de botella" / "de tu propio negocio?"; lede "Responde con honestidad: el diagnóstico no mejora por cortesía."; 5 casillas (título + aclaración, textos de la fuente §2.5), contador `N de 5` (`aria-live`), mensajes por puntaje (0–2 / 3–4 / 5, textos de la fuente) en cian; con ≥ 3 aparece el primario "Agendar mi Power Session" → `#agenda` (`data-section="diagnostico"`, `hidden` hasta entonces). Sin datos guardados; evento `ps_diagnostico {puntaje}`. |
| 5 | `para-quien` | `ImageSection` mid · **`kain-si-no`** con `mirror: true` (D; móvil split) + `TwoColumnScript fit` | "Encaje" / "Para quién es" / "esta sesión."; Es para ti si… (4) / No es para ti si… (4) de la fuente; remate "Si te reconociste en la primera columna, esta sesión es para ti." |
| 6 | `verdad` | **`TwinScene`** · `home-problema-a` / `home-problema-b` (I) | eyebrow "La verdad incómoda"; frase "El poder que crees tener es exactamente lo que te está atando."; 3 filas `[data-pain]` → `[data-fix]`: "Si tú te enfermas, el negocio se enferma." → "Con un sistema, la operación sigue aunque no estés." · "Si te vas de vacaciones, las ventas bajan." → "Las ventas siguen su proceso, contigo o sin ti." · "Si te distraes una semana, tres cosas explotan." → "Cada pendiente tiene dueño, registro y seguimiento."; remate "Eso no es un negocio: es un empleo con más horas, más riesgo y sin aguinaldo." + línea de kain "Uno trabaja en el negocio; el otro, sobre el negocio." |
| 7 | `metodo` | `ImageSection` mid · **`metodologia-hero`** (D; móvil split) + `ScriptList variant="steps"` | "El método" / "Las 4 A del empresario libre."; lede "Cuatro pasos y noventa días para un negocio que ya no depende de ti."; 01 Auditar · semanas 1–2 · 02 Agrupar · semanas 1–2 · 03 Agentizar · semanas 3–6 · 04 Automatizar · semanas 7–12 (líneas de la fuente **sin** "27 procesos" ni horas); remate "La Power Session ejecuta los pasos 1 y 2, en 90 minutos."; cita de kain "El error más caro es empezar por el paso 3: comprar herramientas antes de auditar es caos más rápido." |
| 8 | `incluye` | `ImageSection` mid · **`home-sistema-3-organizar`** con `mirror: true` (I; móvil split) + `ScriptList` | "Qué incluye" / "Qué pasa en los 90 minutos."; lede "Nada de teoría: trabajo sobre tu operación, en vivo."; 6 filas: Auditoría 1:1 de tu operación completa · Diagnóstico de tus cuellos de botella reales · Plan de implementación a 90 días · Stack recomendado, con precios reales · ROI proyectado con tus números · Grabación y mapa al cerrar. |
| 9 | `oferta` | `Intertitle` (aura isotipo) | eyebrow "90 minutos, uno a uno"; H2 "Agenda tu Power Session."; precio grande `<span data-offer="power-price">USD 297</span>` + "pago único · sin suscripción"; "Abrimos 4 sesiones por semana, por orden de pago."; lista de 6 entregables en 2 columnas; primario "Agendar mi Power Session" → `#agenda`; micro "Pago seguro con Stripe · Sin suscripción". |
| 10 | `garantia` | `Intertitle` split (aura ondas) | Bloque **Garantía**: "Garantía: {{offer:power-guarantee}}. El riesgo lo asumimos nosotros." · Bloque **Por qué ahora**: "El costo de esperar también se acumula: cada semana sin sistema son leads que se enfrían y horas que no recuperas. {{offer:power-price}} es precio introductorio." |
| 11 | `quien` | `Intertitle` split | eyebrow "Quién te atiende"; H2 "Rik Landeros" / soft = cargo de `TEAM['rik-landeros'].role`; avatar en duotono 72 px (`AuthorCard` o su marcado, nunca foto rectangular); texto "La sesión la da Rik, no un vendedor. Aplica la metodología VKTOR™ con el equipo de Ingeniak en empresas de {{metric:paises\|full}}."; datos: `KommoBadge` "Partner oficial de Kommo en LATAM" · "Metodología VKTOR™: Verify · Koncept · Transform · Operate · Rise". |
| 12 | `faq` | `Intertitle` split + `FAQAccordion` **P01–P07** | eyebrow "Preguntas"; H2 "Lo que todos nos preguntan." (FAQPage con las mismas ids). |
| 13 | `cta-final` | `Dawn` · **`cta-duena-tranquila`** (I) | H2 "Un gran sistema" / "es la máxima responsabilidad."; lede "Hacerlo todo tú te hace héroe por un rato. Construir un sistema te libera para siempre."; cita de kain "Nos vemos del otro lado. Trae tus números: los de verdad."; primario → `#agenda`, EaK; enlaces `.lnk`: "¿Prefieres empezar con una llamada de 30 minutos sin costo? Conoce la Discovery Session" → `/discovery/` · "¿Ya sabes lo que necesitas? Cotizar proyecto" (`cotizar: true`). |

Se **omiten** de la fuente (no hay dato confirmado en `metrics.ts` ni autorización): caso "De 13 horas al día a un sistema", franja de clientes (ARGI…), "El costo de seguir igual" (~40 HRS, 27 procesos), "+5 a 15 HRS", "Equipo propio de 8 especialistas", la lista de giros de la FAQ 2 y "ProofBar" de riklanderos. Cada omisión queda como `DATO PENDIENTE` en `pendientes`.

**Esquemas de copy de las secciones nuevas** (`power-session.json` / `discovery.json`; `_kind` es nota de construcción y no se imprime):

```jsonc
"agenda":      { "_kind": "agenda", "rail": "Reservar", "eyebrow": "", "h2": {"text":"","soft":""},
                 "steps": [{"n":"01","title":"","line":""}], "salesCon": {"title":"Sales con","items":[""]}, "nota": "" },
"diagnostico": { "_kind": "quiz", "rail": "Diagnóstico", "eyebrow": "", "h2": {}, "lede": "",
                 "items": [{"title":"","line":""}], "contador": "{n} de 5", "umbral": 3,
                 "resultados": [{"min":0,"max":2,"text":""},{"min":3,"max":4,"text":""},{"min":5,"max":5,"text":""}],
                 "ctaPrimary": {"label":"Agendar mi Power Session","href":"#agenda"} },
"verdad":      { "_kind": "twin", "rail": "La verdad incómoda", "eyebrow": "", "frase": "",
                 "rows": [{"pain":"","fix":""}], "remate": "", "kain": "" },
"oferta":      { "_kind": "offer", "rail": "Oferta", "eyebrow": "", "h2": {}, "precioNota": "pago único · sin suscripción",
                 "cupo": "", "items": [""], "ctaPrimary": {"label":"","href":"#agenda"}, "micro": "" },
"garantia":    { "_kind": "guarantee", "rail": "Garantía", "blocks": [{"title":"","text":""}] },
"quien":       { "_kind": "host", "rail": "Quién te atiende", "eyebrow": "", "member": "rik-landeros", "body": [""], "facts": [""] },
"cta-final":   { …campos de Dawn…, "links": [{"label":"","href":"/discovery/"},{"label":"","href":"/contacto/#cotizar","cotizar":true}] }
```

### 4.4 Ofertas y cifras de las landings (`OFFERS`, dueño **orquestador** en `src/lib/metrics.ts`)

```ts
/** Ofertas de las landings ocultas (cambio 2026-10-20). Solo se imprimen en OFFER_ROUTES, siempre dentro de [data-offer];
 *  check-cifras las acepta solo ahí. Nunca con {{price}} (esa es la inversión mensual "desde USD 997 al mes"). */
export const OFFERS = {
  'power-price': 'USD 297',
  'power-guarantee': 'si en la sesión no identificamos al menos 3 fugas por más de $10,000 MXN al mes, te devolvemos los USD 297 completos',
} as const;
export type OfferId = keyof typeof OFFERS;
export const OFFER_ROUTES = ['/discovery/', '/power-session/', '/agendar/confirmado/'] as const;
```

- Token de copy: `{{offer:ID}}`. `ui-data.ts` (cta-codigo): `tokensToText` → texto; `annotateFigures`/HTML → `<span data-offer="ID">texto</span>`; id desconocido → error de build. `site.ts → resolveTokens` (orquestador) también lo resuelve.
- Montos para Stripe: `shared/agenda.js` (agenda) `POWER_PRICE_CENTS = 29700`, `POWER_CURRENCY = 'usd'`. Una prueba de la agenda compara `OFFERS['power-price']` (leído como texto de `metrics.ts`) con `USD ${POWER_PRICE_CENTS / 100}`.
- JSON-LD de `/power-session/`: `Service` + `Offer { price: "297", priceCurrency: "USD", description: "Power Session · sesión 1:1 de 90 minutos, pago único", url }` (sitemap `jsonLd: ["WebPage","Service (Offer power)","BreadcrumbList","FAQPage"]`; `jsonld.ts` lo emite, cta-codigo).

### 4.5 Copy: qué se porta, qué se corrige y qué queda para el cliente

| Tema | Decisión |
|---|---|
| Voz | Plural de Ingeniak, tuteo ("te enviamos", "escríbenos"). La fuente de Power está en primera persona de Rik: se pasa a tercera ("La sesión la da Rik"). |
| Precio | `{{offer:power-price}}` en todo texto y botón ("Pagar USD 297" en el componente con `data-offer`). Formato "USD 297", como el resto del sitio. |
| Apartado | **30 minutos** (Stripe exige ≥ 30; la fuente decía 15). |
| Cupo | "Abrimos 4 sesiones por semana, por orden de pago." (el código lo aplica). |
| Garantía, grabación, "precio introductorio", "Las 4 A" | Se portan porque el cliente ya los publica en agenda.ingeniak.tech, y quedan como `PREGUNTA AL CLIENTE` en `pendientes` para reconfirmar antes del lanzamiento (el copy queda en `borrador`; `check --release` lo vuelve fatal hasta que se apruebe). |
| Pasos del formulario | Describen el formulario real, sin conteos inexactos ("Siete preguntas · dos minutos" y "Cuatro preguntas cortas" salen). |
| Tiempos de respuesta | Ninguna promesa ("en unos minutos", "24-48 h", etc.). La invitación de Google llega al confirmar (lo hace el sistema; se dice sin plazo). |
| Rik | Cargo de `TEAM` ("Director de Estrategia Comercial"); "fundador y director" queda como `PREGUNTA AL CLIENTE`. Sin "8 especialistas". |
| Erratas de la fuente | Todas corregidas (`discovery-fuente.md` §6). Correo siempre `contacto@ingeniak.mx`. |
| WhatsApp | Discovery: el `waMessage` actual. Power: "Hola, vengo de la página de la Power Session y tengo una duda antes de reservar." Confirmación: "Hola, acabo de pagar mi Power Session y quiero confirmar algo." |

**FAQ de la Power Session** (copy-b las agrega a `src/data/faq.json`, `categoria: "Power Session"`, `pages: ["/power-session/"]`, `validar: false`):

| id | q | a | short |
|---|---|---|---|
| P01 | ¿Esto es una llamada de ventas disfrazada? | No. Es una sesión de trabajo pagada: sales con tu mapa de operación y tu plan, los implementes con nosotros o por tu cuenta. | No. Es una sesión de trabajo pagada: sales con tu mapa y tu plan. |
| P02 | ¿Sirve si mi negocio no es de tecnología? | Sí. La sesión no revisa qué tecnología usas, sino cómo vendes, atiendes y operas. El cuello de botella del dueño aparece en cualquier giro. | Sí: revisamos cómo vendes, atiendes y operas. |
| P03 | ¿Qué necesito traer? | Tus números reales: facturación mensual, tamaño del equipo y una idea de en qué se te van las horas. Nada presentable: los datos, tal cual. | Tus números reales, tal cual. |
| P04 | ¿Es por videollamada? | Sí, por Google Meet. La invitación con el enlace te llega al correo que registraste cuando se confirma tu pago, y la sesión queda grabada. | Sí, por Google Meet, y queda grabada. |
| P05 | ¿Y si tengo menos de 3 empleados? | Funciona igual, y muchas veces mejor: es el momento de construir el sistema antes de contratar. | Funciona igual, y muchas veces mejor. |
| P06 | ¿Puedo reagendar? | Sí, con al menos 24 horas de anticipación. Escríbenos por WhatsApp al 33 2101 7799 o a contacto@ingeniak.mx y la movemos. | Sí, con al menos 24 horas de anticipación. |
| P07 | ¿Cómo aplica la garantía? | Garantía: {{offer:power-guarantee}}. Para pedirla, escríbenos a contacto@ingeniak.mx dentro de las 48 horas siguientes a tu sesión. | Te devolvemos tu pago si no encontramos al menos 3 fugas relevantes. |

---

## 5. (F) Port del flujo de reserva (dueño **agenda**)

### 5.1 Alcance y paridad

Paridad 1:1 con riklanderos.tech (`flujo-agenda.md` §1–§2): mismos 3 pasos, campos, reglas (`validateForm` en cliente y servidor), reglas de agenda (5 días hábiles desde mañana, CDMX fija −06:00, 12 h de anticipación, 15 min de colchón, Discovery 8 × 30 min, Power 4 × 90 min, cupo 4 Power por semana contando confirmadas y apartadas, ocupación `freeBusy` sobre Power + Discovery + `primary`), estados (cargando, error con "Reintentar", vacío, 409 horario tomado, 422, red caída), Discovery con Meet al instante, Power con apartado de 31 min → Stripe Checkout → `/agendar/confirmado/` → cita real, cancelación que libera el apartado, cron que confirma pagos abandonados y libera vencidos, antispam (`website_url` + `elapsed_ms < 2500` → 400), `sessionStorage` del formulario, eventos `booking_*`. **Adaptaciones:** voz de Ingeniak, sistema de diseño del sitio, Kommo, `try/catch` por evento en el barrido, foco al cambiar de paso, días con flechas (`role="tablist"`), teléfono con `PhoneField`, propiedades `rl_sitio=ingeniak` e `ik_kommo`.

**Recursos (opción A por defecto, `flujo-agenda.md` §4.2):** misma cuenta de Google (conector `google/riklanderos-web`, sujeto `rik`), mismos calendarios, misma cuenta de Stripe, mismas propiedades privadas `rl_*`, títulos y marcador de descripción **"\n\nAgendado desde https://ingeniak.mx"**. Supabase (A1) es opcional: si existen `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se guardan los leads (`source` `discovery|power`, `details.site='ingeniak'`) y se crea el brief (`ensureBrief`, URL `https://www.riklanderos.tech/brief/<token>`); si no, se omiten sin error.

### 5.2 Archivos

| Archivo | Contenido |
|---|---|
| `shared/agenda.js` | Port de `lib/agenda/config.ts` (reglas, `INDUSTRIES`, `TEAM_SIZES`, `REVENUES`, `TIME_DRAINS`, `validateForm`, `cdmxToIso`, `cdmxDateKey`, `bookableDates`, `formatDayEs`, `formatTimeEs`, `formatSlotEs`) + `LANDING = { discovery: '/discovery/', power: '/power-session/' }`, `CONFIRM_PATH = '/agendar/confirmado/'`, `SITE_URL = 'https://ingeniak.mx'`, `CONTACT = { email: 'contacto@ingeniak.mx', wa: 'https://wa.me/523321017799' }`, `HOLD_MINUTES = 31`, `POWER_PRICE_CENTS = 29700`, `POWER_CURRENCY = 'usd'`, `MARKER = '\n\nAgendado desde https://ingeniak.mx'`. Puro (sin Node ni DOM), JSDoc. |
| `server/agenda/google-auth.js` | Token de Google: si existen `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REFRESH_TOKEN` → refresh OAuth con `fetch` a `https://oauth2.googleapis.com/token`; si no, `await import('@vercel/connect')` → `getToken(process.env.AGENDA_GOOGLE_CONNECTOR ?? 'google/riklanderos-web', { subject: { type: 'user', id: process.env.AGENDA_GOOGLE_SUBJECT ?? 'rik' }, scopes: ['https://www.googleapis.com/auth/calendar'] })`. `AgendaConfigError` si nada funciona. Importación dinámica (las pruebas no cargan OIDC). |
| `server/agenda/google.js` | REST de Calendar v3 con `fetch` (copia de `google.server.ts`) + `patchPrivate(cal, id, props)`. |
| `server/agenda/stripe.js` | REST de Stripe con `fetch`: `createCheckout(params)` → `POST https://api.stripe.com/v1/checkout/sessions` (`application/x-www-form-urlencoded`, `Stripe-Version: 2025-10-29.clover`, `Idempotency-Key: ik-hold-<eventId>`), `retrieveCheckout(id)`, `expireCheckout(id)` (`POST …/{id}/expire`), `stripeLive()`. Parámetros de §1.6 de `flujo-agenda.md` (incluye `metadata[rl_sitio]=ingeniak`). |
| `server/agenda/booking.js` | Port de `booking.server.ts`: `availability`, `reserve`, `confirmPower`, `confirmFromCheckout`, `releaseHold`, `sweepHolds` (con `try/catch` por evento), `syncKommoPaid`, `calendarFor`, `baseUrl()` (§4.9 de `flujo-agenda.md`; `AGENDA_BASE_URL` lo fuerza; en local, el host de la petición). Recibe adaptadores inyectados (`{ google, stripe, leads, now }`) para pruebas y simulación. |
| `server/agenda/leads.js` | Kommo con `server/kommo.js` (§5.4) + Supabase REST opcional (`POST {SUPABASE_URL}/rest/v1/leads`, `PATCH …?stripe_session_id=eq.…`, cabeceras `apikey` y `Authorization: Bearer` con la service role). Nunca lanza; 5 s de tiempo límite; logs sin datos personales. |
| `server/agenda/brief.js` | `ensureBrief`/`briefUrl` portados de `lib/brief/server.ts` (solo el alta) por PostgREST; solo con Supabase configurado. |
| `server/agenda/mock.js` | Adaptadores simulados en memoria (§5.7). |
| `api/agenda/disponibilidad.js` | `GET ?tipo=` (contrato de `flujo-agenda.md` §2.2, textos de Ingeniak) |
| `api/agenda/reservar.js` | `POST` (mismo contrato + `atribucion.src`, `atribucion.clid`, `atribucion.landing`) |
| `api/agenda/confirmar.js` | `POST { session_id }` (§4.5 de `flujo-agenda.md`) |
| `api/agenda/liberar.js` | `POST { apartado }` |
| `api/agenda/limpiar.js` | `GET` del cron (`Authorization: Bearer ${CRON_SECRET}`; sin él → 401) |
| `api/agenda/estado.js` | `GET`, solo si `VERCEL_ENV !== 'production'`: `{ google, stripe, live, calendarios: { power, discovery }, kommo, supabase }` sin IDs ni secretos |
| `src/components/agenda/BookingFlow.astro` | Marcado del componente (§5.5). Importa `src/styles/forms.css` y `src/styles/agenda.css`; su `<script>` hace `import()` de `booking.ts`. |
| `src/components/agenda/textos.ts` | Textos del componente (voz de Ingeniak). |
| `src/scripts/agenda/booking.ts` | Máquina de estados vanilla TS (`flujo-agenda.md` §4.6). |
| `src/scripts/agenda/confirmado.ts` | Lógica de `/agendar/confirmado/`. |
| `src/styles/agenda.css` | `.bk*` (pasos, días, horarios, resumen, vista final) y `.cf*` (confirmación). |
| `src/pages/agendar/confirmado/index.astro` + `src/content/paginas/agendar-confirmado.json` | Página oculta (§5.6). |
| `src/pages/dev/agenda.astro`, `src/pages/dev/agenda-checkout.astro` | Demo de los dos flujos y "Stripe simulado" (§5.7). |
| `package.json` (**solo** `dependencies`) + `package-lock.json` | `"@vercel/connect": "2.5.2"` exacto (`npm install --save-exact @vercel/connect@2.5.2`). Nada más. |
| `tests/agenda/*.test.mjs` | Pruebas (§5.7). |
| `materiales/v2/landings/agenda-configuracion.md` | Guía del cliente en español (§5.9) + verificación del Preview. |

### 5.3 Contratos (diferencias con `flujo-agenda.md` §2.2)

- Rutas con barra final: `/api/agenda/disponibilidad/?tipo=…`, `/api/agenda/reservar/`, `/api/agenda/confirmar/`, `/api/agenda/liberar/`, `/api/agenda/limpiar/`.
- `success_url = ${base}/agendar/confirmado/?session_id={CHECKOUT_SESSION_ID}` · `cancel_url = ${base}/power-session/?pago=cancelado&apartado=${encodeURIComponent(eventId)}`.
- Errores en voz de Ingeniak: 503 "No pudimos leer la agenda en este momento. Inténtalo en unos minutos o escríbenos por WhatsApp." · reserva 503 "No pudimos completar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp y te agendamos nosotros."
- POST con `sameOrigin()` (403 si no) y `throttle` de 10 reservas por IP cada 10 min (429).
- Todas las respuestas con `json()` de `server/http.js` (`no-store`, `noindex`).

### 5.4 Leads de la reserva → Kommo (y Supabase opcional)

| Momento | Kommo (`server/kommo.js`) |
|---|---|
| Reserva Discovery confirmada / apartado Power creado | `createLeadWithNote`: nombre `Discovery Session · {negocio}` o `Power Session · {negocio}`; contacto (nombre, `+E164`, correo); empresa = negocio; etiquetas `web-agenda`, `agenda-discovery` \| `agenda-power`, `pago-pendiente` (Power), `entorno-preview` (Preview); tracking UTM/gclid/fbclid; nota con todos los campos, horario (CDMX e ISO), Meet (Discovery), origen (`Sección: {desde} · utm…`), referrer, landing y página; ruta `KOMMO_AGENDA_PIPELINE_ID`/`KOMMO_AGENDA_STATUS_ID` (o los de la cotización). El id se guarda en el evento como `ik_kommo` (`patchPrivate`). |
| Pago confirmado (desde `confirmar` o el cron) | `updateLeadTags(id, { add: ['pagado'], remove: ['pago-pendiente'] })` + `addLeadNote` ("Pago confirmado en Stripe · {horario} · Meet: … · Brief: …"); `patchPrivate` `ik_kommo_pago=1`. |
| Apartado vencido o cancelado | `updateLeadTags(id, { add: ['expirado'], remove: ['pago-pendiente'] })`. |
| Cron de Ingeniak | además de `sweepHolds`, sincroniza Kommo de los eventos `rl_sitio=ingeniak` + `rl_estado=confirmada` de los últimos 2 días sin `ik_kommo_pago` (caso en que confirmó el cron de riklanderos). |
| Kommo falla o no está configurado | log sin datos personales y **la reserva sigue** (Calendar es la fuente de verdad). `notify('lead.created', …)` siempre que exista el webhook. |

### 5.5 API de inserción del componente (lo usa **landings**)

```astro
---
import BookingFlow from '../agenda/BookingFlow.astro';
---
<section id="agenda" aria-labelledby="agenda-t"> <!-- la landing pinta la sección, su H2 (id="agenda-t") y la columna izquierda -->
  …
  <BookingFlow tipo="power" waHref={waHref(page.secondaryCta.waMessage)} headingLevel={3} />
</section>
```

| Prop | Tipo | Notas |
|---|---|---|
| `tipo` | `'discovery' \| 'power'` | obligatorio |
| `waHref` | string | WhatsApp de la landing (estados de error/vacío) |
| `headingLevel` | `2 \| 3` | nivel de los títulos de paso (por defecto 3) |
| `id` | string | por defecto `bk-<tipo>` |
| `class` | string | — |

- Raíz: `<div class="bk glass-panel" id="bk-power" data-agenda="power" data-hold="30">`; ancho fluido, `max-width: 640px`. Sin JS (`html.no-js`): mensaje "Para reservar necesitas JavaScript activo, o escríbenos por WhatsApp o a contacto@ingeniak.mx" con los dos enlaces.
- Evento de entrada: `agenda:focus` sobre la raíz → enfoca el primer campo vacío del paso 1 (o el título del paso actual).
- Lee `sessionStorage['ingeniak-agenda-desde']`, `ingeniak-utm`, `ingeniak-clid`, `ingeniak-landing`, `ingeniak-src`; guarda el formulario en `sessionStorage['ingeniak-agenda-<tipo>']`.
- En `/power-session/?pago=cancelado&apartado=…`: `POST /api/agenda/liberar/` **antes** de cargar horarios, aviso, paso 2 si el formulario guardado es válido, `history.replaceState`, scroll a `#agenda`.
- Diseño: errores ámbar; día y horario seleccionados con borde y relleno **cian**; el único azul es el botón del paso (`.btn` + `data-primary`); "Atrás"/"Cambiar horario" en `.btn--ghost`; horarios en 2 columnas (móvil) y 4 (escritorio); los 5 días caben en 390 px. Todo texto estático con números ("30 min", "90 min", "Próximos 5 días hábiles") va con `data-allow-number`; precio con `data-offer="power-price"`; opciones de facturación dentro de `[data-form-options="facturacion"]`.
- Medición: `booking_view`, `booking_step`, `booking_submit` (Discovery), `booking_checkout_start` (Power), `booking_confirmed`, `booking_slot_taken`, `booking_error` por `ingeniak:track`, nunca con datos escritos.

### 5.6 `/agendar/confirmado/` (oculta)

- Plantilla propia en la ruta (BaseLayout `nav="reduced"`, sin CTA en el encabezado, footer `minimal`), `noindex,follow` + `X-Robots-Tag: noindex`.
- Una sola sección `estado`: `ImageSection` hero · **`gohighlevel-hero`** (Kain toca una casilla del calendario; D; móvil split). H1 **"Confirmación de tu Power Session"** (`.lit` "Confirmación"). Debajo, región `aria-live` con los estados de `flujo-agenda.md` §4.8 (cargando con `aria-busy`, **ok**, **pending**, **error**) en voz de Ingeniak; en **ok**: fecha y hora (CDMX y hora local si cambia), "Te enviamos la invitación de Google Calendar a **{email}** con el enlace de Google Meet; Stripe te manda el recibo por separado.", tarjeta del brief (solo si hay), botón azul "Abrir enlace de Meet" (sin `data-primary`), EaK, `.lnk` "Ir al inicio" → `/`; lista "Para aprovechar los 90 minutos, ten a la mano" (facturación de los últimos 3 meses · número aproximado de leads al mes · quién hace qué en tu equipo).
- `src/content/paginas/agendar-confirmado.json` con esos textos (estado `borrador`, `pendientes` de aprobación). Raíz con `data-confirmado`.

### 5.7 Simulación local y pruebas

**Adaptadores simulados (`server/agenda/mock.js`)** — activos solo si `!process.env.VERCEL_ENV` y (`AGENDA_MOCK === '1'` o falta `POWER_CALENDAR_ID`). En Vercel **nunca**. Implementan la misma interfaz que `google.js`/`stripe.js`: eventos en memoria del proceso (`Map`), ocupación determinista (el 2.º horario de cada día ocupado; `AGENDA_MOCK_LLENO=1` llena la semana de Power), Checkout simulado con `url = ${base}/dev/agenda-checkout/?session_id=cs_test_MOCK_<eventId>&apartado=<eventId>`. La página `src/pages/dev/agenda-checkout.astro` muestra "Simular pago" (→ `/agendar/confirmado/?session_id=…`; el mock marca la sesión como pagada) y "Cancelar" (→ `/power-session/?pago=cancelado&apartado=…`). Con esto los dos flujos completos corren en 127.0.0.1:4321 vía el middleware (§3.8).

**Pruebas (`node --test tests/agenda/`)** con los adaptadores reales y `fetch` simulado (Google, Stripe, Kommo, Supabase); reloj inyectado:
1. Disponibilidad: 5 días hábiles desde mañana, 12 h, colchón 15 min, horarios exactos de cada tipo, ocupación cruzada de 3 calendarios, cupo 4 Power (pendiente + confirmada) → semana con `slots: []`.
2. Reserva Discovery: validación (paridad con `validateForm` original en una tabla de casos), 409 si se ocupó, evento con Meet, `sendUpdates=all`, propiedades `rl_*` + `rl_sitio`, descripción que termina en el marcador; Kommo llamado con las etiquetas exactas; Kommo caído → la reserva responde 200 igual.
3. Reserva Power: apartado sin invitados (`sendUpdates=none`), título exacto `[Apartado · pago pendiente] Power Session · {negocio}`, Checkout con `unit_amount=29700`, `currency=usd`, `expires_at ≥ ahora + 30 min`, metadata, URLs; `patchPrivate` con `rl_stripe`; Stripe caído → borra el apartado y 503.
4. Confirmar: id inválido 400; `unpaid` → `pending`; `paid` → PATCH a cita real (invitado, Meet, `sendUpdates=all`, "Pago confirmado en Stripe." antes del marcador) + Kommo `pagado`; segunda llamada idempotente.
5. Liberar: inválido 400; pendiente + `open` → expira y borra; pagado → confirma; confirmada → no la toca; siempre 200.
6. Limpiar: sin `CRON_SECRET` correcto → 401; un `retrieve` que falla no detiene el barrido; sincronización Kommo de confirmadas sin `ik_kommo_pago`.
7. Antispam: `website_url` lleno o `elapsed_ms < 2500` → 400 sin llamadas.
8. `OFFERS['power-price']` = `USD ${POWER_PRICE_CENTS / 100}`.

### 5.8 Variables de entorno de la agenda (mismos nombres que riklanderos.tech)

| Variable | Cuándo | Notas |
|---|---|---|
| `POWER_CALENDAR_ID`, `DISCOVERY_CALENDAR_ID` | siempre | los mismos IDs que riklanderos.tech (opción A) |
| `STRIPE_SECRET_KEY` | siempre | **secreta**; la de la cuenta que cobra (A: la misma). Preview con `sk_test_…` |
| `CRON_SECRET` | siempre | cadena aleatoria; Vercel la manda en el cron |
| `KOMMO_*` | siempre | las de §3.6 |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | solo A1 | **secreta** la service role |
| `AGENDA_GOOGLE_CONNECTOR`, `AGENDA_GOOGLE_SUBJECT`, `AGENDA_BASE_URL` | solo si cambian los valores por defecto | — |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | solo si Vercel Connect no se comparte entre proyectos | **secretas**; plan B |
| `AGENDA_MOCK`, `AGENDA_MOCK_LLENO` | solo local | nunca en Vercel |

### 5.9 Lista del cliente (español; va completa en `agenda-configuracion.md` y resumida en `lanzamiento.md`)

1. **Vercel:** proyecto de ingeniak.mx en el equipo **ingeniak**, plan **Pro** (cron cada 10 min), Node **24.x**.
2. **Google:** en Vercel → Connect, **vincula el conector `google/riklanderos-web` al proyecto de ingeniak.mx**. En el primer Preview abre `/api/agenda/estado/`: si Google no responde "ok", avísanos (plan B: autorización propia).
3. **Variables** (Settings → Environment Variables; Production con valores reales, **Preview con valores de prueba**): §3.6 y §5.8. Después, **Redeploy**.
4. **Stripe:** no hace falta crear producto. Activa el recibo por correo ("Successful payments") y revisa el nombre público y la marca de la cuenta (salen en el Checkout).
5. **Kommo:** integración privada + token de larga duración, embudo y etapa ("Nuevo · Sitio web" y, si quieres, "Reservas"), y los disparadores de WhatsApp (Salesbot con plantilla aprobada por Meta) y correo con la condición `web-cotizar` o `web-agenda` (`kommo-vercel-tecnico.md` §3). **Sin prometer tiempos de respuesta** en las plantillas.
6. **Decisiones** (§9).
7. **Prueba de punta a punta en Preview:** una cotización; una Discovery; una Power con la tarjeta de prueba `4242 4242 4242 4242`; una Power cancelada; una Power abandonada (se confirma llamando a mano a `/api/agenda/limpiar/` con el `CRON_SECRET`, porque los crons solo corren en producción). Revisa Kommo (etiquetas `entorno-preview`) y Google Calendar.

---

## 6. (E) Guardas y especificación

### 6.1 Cambios a guardas existentes (dueño **orquestador**)

| Guarda | Cambio |
|---|---|
| `check-cifras.mjs` | (a) Permiso `data-offer="<id>"`: una coincidencia de `FIG_RX`/`PRICE_RX` cuyos dígitos caen todos bajo `data-offer` **pasa** si la ruta está en `OFFER_ROUTES` y el texto del nodo es exactamente `OFFERS[id]`; en otra ruta → FALLA "oferta fuera de su landing". (b) Permiso `data-form-options`: importes bajo `[data-form-options]` pasan si la etiqueta de la opción está en `cotizar.json → presupuestos[].label` o en `REVENUES` de `shared/agenda.js`. (c) En `OFFER_ROUTES`, atributos, `<head>` y JSON-LD aceptan cadenas que contengan un valor de `OFFERS`. (d) `MICRO_29` se queda (solo la usa `/discovery/`). (e) Sin otros cambios: cualquier USD o `$` en páginas públicas sigue fallando. |
| `check-seo.mjs` | (a) Ninguna página **pública** enlaza (en cualquier parte del HTML) a una ruta `hidden` → FALLA. (b) `/indice.json` no contiene rutas `hidden` ni preguntas cuyas `pages` sean solo ocultas → FALLA. (c) Redirecciones: el destino se compara sin `#…` (`/contacto/#cotizar` → `/contacto/`). (d) Lo demás igual (las ocultas ya salen de `sitemap.xml`/llms por `isNoindex`). |
| `check-contenido.mjs` | `mainText` excluye `dialog` (ya) **y** `[data-agenda]` (el formulario idéntico subiría la similitud entre las dos landings). `minWords`: T-CONVERSION 600 (Discovery) y 900 (Power, por `copy.minWords`), T-CONFIRM 80. |
| `check-pendientes.mjs` | Sin cambio de reglas; cubre placeholders del modal (`placeholder` sin "XX"). |
| `check-pesos.mjs` | Presupuestos de página interna (R9) también para `/power-session/` y `/agendar/confirmado/`. |
| `check-escenas.mjs`, `check-contraste.mjs` | Añadir `/power-session/`, `/agendar/confirmado/` y la captura con el modal abierto (`/#cotizar`, `/servicios/agentes-ia-whatsapp/#cotizar`) a 1440 × 900 y 390 × 844. |
| `check.mjs` | Registrar `check-cta.mjs`. |

### 6.2 Guarda nueva `scripts/check-cta.mjs`

Con `loadPages` (rutas de `sitemap.json`):
1. **Todas las páginas** (incluidas 404 y ocultas): exactamente un `dialog#cotizar[data-cotizar-dialog]`.
2. **Públicas** (`hidden !== true`):
   - todo `a[data-primary]` dentro de `<main>` tiene clase `btn`, `data-cotizar`, `href` = `/contacto/#cotizar` (o `#cotizar` solo en `/contacto/`) y texto normalizado **"Cotizar proyecto"**;
   - `[data-hdr-cta]` tiene `data-cotizar`; `.mbar__cta` tiene `data-cotizar`;
   - ningún `href` en el documento apunta a `/discovery/`, `/power-session/`, `/agendar/`, `#agenda` ni `agenda.ingeniak.tech`;
   - ningún `.btn-micro` contiene "Google Meet" ni "30 min".
3. **Landings** (`/discovery/`, `/power-session/`):
   - todo `a[data-primary]` fuera de `[data-agenda]` tiene `href="#agenda"` y `data-section`;
   - exactamente un `[data-agenda="discovery"|"power"]` (el de la página) dentro de `section#agenda`;
   - ningún `.btn[data-cotizar]`; al menos un `[data-cotizar]` (`.lnk`);
   - ningún enlace a `agenda.ingeniak.tech`; `robots` con `noindex`.
4. **`/agendar/confirmado/`:** `[data-confirmado]` presente, ningún `[data-primary]`, `robots` con `noindex`.
5. Todo `data-cotizar-servicio` / `data-cotizar-industria` usa slugs de `cotizar.json`.

### 6.3 Adenda a la ESPEC (texto exacto que el orquestador agrega como **§12.6**, y marca "r2" en las secciones sustituidas)

> ### 12.6 Cambio del 20 de octubre de 2026 · "Cotizar proyecto" y landings ocultas (r2)
>
> **Precedencia:** esta sección sustituye §0.1-4, el rol de `--blue` en §2.1, la fila del primario en §2.9, las etiquetas de CTA de §4.1, §4.5 y §4.6, §5.11, §5.12 y la atribución de R10. Detalle de construcción: `materiales/v2/CAMBIO-COTIZAR.md`.
>
> **R15 · Un primario: "Cotizar proyecto".** En todas las páginas públicas el único CTA primario es el botón azul `.btn` "Cotizar proyecto" (`data-cotizar`), que abre el modal de cotización sin navegar; sin JS lleva a `/contacto/#cotizar`. Microcopia: "Sin compromiso · Te contactamos por WhatsApp y correo" (sin cifras ni promesa de tiempo). El secundario sigue siendo "Escríbele a Kain" (WhatsApp, `.btn--ghost`, mensaje propio de la página). `--blue` = solo el primario y el botón de avance de un formulario. Un azul por pantalla (F15) sin cambios.
>
> **R16 · Modal de cotización.** `<dialog id="cotizar">` montado una vez por página; 3 pasos (Qué necesitas · Tu negocio · Contacto); consentimiento obligatorio de contacto por WhatsApp y correo con enlace al aviso de privacidad; los datos van a Kommo por `POST /api/cotizar/`. Éxito con "qué sigue" y WhatsApp; falla con WhatsApp y correo. Nunca promete tiempos de respuesta. Ningún dato personal en URLs de atribución; el mensaje de WhatsApp prellenado lleva el folio y el resumen del pedido, no datos de contacto.
>
> **R17 · Landings ocultas.** `/discovery/` y `/power-session/` (y `/agendar/confirmado/`) llevan `hidden: true` e `indexable: false`: `noindex,follow`, fuera de `sitemap.xml`, `llms.txt`, `llms-full.txt`, ⌘K, menús, footer, "Sigue explorando" y de todo enlace desde páginas públicas. Encabezado reducido con el CTA de la landing, barra móvil propia y footer mínimo. Su primario reserva directo en la propia página (`#agenda`, flujo portado de riklanderos.tech); la cotización es ruta secundaria (`.lnk`).
>
> **R18 · Ofertas de landing.** Los precios y garantías de las landings viven en `OFFERS` de `metrics.ts` y solo se imprimen con `{{offer:ID}}` dentro de `[data-offer]` en `OFFER_ROUTES`. "Desde USD 997 al mes" (`{{price}}`) sigue siendo el único precio del sitio público. Los rangos de presupuesto del formulario y de facturación de la reserva solo se pintan bajo `[data-form-options]`.
>
> **R19 · Reserva.** La reserva de Discovery y Power replica el flujo de riklanderos.tech (Google Calendar en vivo, Meet, Stripe solo para Power, `/agendar/confirmado/`, cron de limpieza) y además registra cada reserva en Kommo. Kommo nunca bloquea una reserva; Google Calendar es la fuente de verdad.
>
> **R20 · Medición (sustituye la lista de R10).** `cta_cotizar_click`, `cotizar_open`, `cotizar_step`, `cotizar_submit`, `cotizar_success`, `cotizar_error`, `cotizar_close`, `cta_agenda_click`, `booking_view`, `booking_step`, `booking_submit`, `booking_checkout_start`, `booking_confirmed`, `booking_slot_taken`, `booking_error`, `ps_diagnostico`, `whatsapp_click`, `search_open`, `search_submit`, `video_play`/`video_50`/`video_complete`, `faq_open`, `chat_sim_tab`. Atribución en `sessionStorage`: `ingeniak-utm`, `ingeniak-clid`, `ingeniak-landing`, `ingeniak-src`, `ingeniak-agenda-desde`. Nunca texto escrito por la persona.

### 6.4 `CONVENCIONES.md` (orquestador)

- Línea de reglas de marca: "Un solo CTA primario azul: **"Cotizar proyecto"** (abre el modal `#cotizar`; sin JS → `/contacto/#cotizar`). En las landings ocultas `/discovery/` y `/power-session/` el primario reserva en `#agenda`. Secundario: "Escríbele a Kain"…"
- Tabla de dueños: agregar las áreas **modal**, **api**, **agenda**, **landings** con sus archivos (§7) y las carpetas `api/`, `server/`, `shared/`, `tests/`.

---

## 7. Reparto por dueño (ningún archivo tiene dos dueños)

| Área | Archivos (exclusivos) |
|---|---|
| **modal** | `src/components/cotizar/QuoteModal.astro`, `src/scripts/cotizar/quote.ts`, `src/scripts/cotizar/validar.ts`, `src/components/forms/PhoneField.astro`, `src/scripts/forms/phone.ts`, `src/styles/forms.css`, `src/styles/cotizar.css`, `src/data/cotizar.json`, `src/pages/dev/cotizar.astro` |
| **api** | `api/cotizar.js`, `server/http.js`, `server/kommo.js`, `server/cotizar.js`, `tests/cotizar/**`, `.env.example`, `materiales/v2/landings/cotizar-configuracion.md` |
| **agenda** | `api/agenda/**`, `server/agenda/**`, `shared/agenda.js`, `src/components/agenda/**`, `src/scripts/agenda/**`, `src/styles/agenda.css`, `src/pages/agendar/confirmado/index.astro`, `src/content/paginas/agendar-confirmado.json`, `src/pages/dev/agenda.astro`, `src/pages/dev/agenda-checkout.astro`, `package.json` (solo `dependencies`), `package-lock.json`, `tests/agenda/**`, `materiales/v2/landings/agenda-configuracion.md` |
| **cta-codigo** | `src/components/templates/*` **salvo** `ConversionTemplate.astro` (incluye `HeroCtas.astro`, `heroKit.ts`, `hub/*`, `case/*`), `src/styles/tpl/*` **salvo** `ConversionTemplate.css`, `src/styles/pages.css`, `src/styles/nav.css`, `src/styles/ui.css`, `src/components/ui/{Btn,EntitySheet,EditorNote,FAQAccordion,Copy}.astro`, `src/components/ui/ui-data.ts`, `src/components/cine/Dawn.astro` (solo el respaldo del CTA), `src/components/nav/*`, `src/components/layout/*`, `src/layouts/BaseLayout.astro`, `src/scripts/ui.ts`, `src/scripts/nav/*`, `src/pages/404.astro`, `src/pages/dev/nav.astro`, `src/pages/dev/ui.astro` |
| **copy-a** | `src/content/paginas/{home,_comun,404,consultoria,agentes-whatsapp,crm-ia,n8n,paid-media,paginas-web,software,seo,branding,kommo,gohighlevel}.json` |
| **copy-b** | `src/content/paginas/{ind-salud,ind-belleza,ind-nutricion,ind-finanzas,ind-inmobiliario,ind-industrial,ind-retail,ind-horeca,caso-dental,caso-retail,caso-ecommerce,caso-horeca,caso-logistica,servicios,industrias,casos,blog,kain,metodologia,tecnologias,nosotros,guadalajara,faq,contacto,aviso,art-costo,art-kommo-ghl,art-agente-chatbot,art-partner-kommo,art-ghl-espanol,art-n8n}.json`, `src/data/faq.json` |
| **landings** | `src/components/templates/ConversionTemplate.astro`, `src/styles/tpl/ConversionTemplate.css` (nuevo), `src/pages/discovery/index.astro`, `src/pages/power-session/index.astro` (nuevo), `src/content/paginas/discovery.json`, `src/content/paginas/power-session.json` (nuevo), `src/scripts/landing/*.ts` (nuevos) |
| **orquestador** | `src/data/sitemap.json`, `src/data/navegacion.json`, `src/data/redirects.json`, `src/lib/*` (`site.ts`, `metrics.ts`, `indexacion.mjs`, `llms.ts`), `src/pages/indice.json.ts`, `src/pages/llms.txt.ts`, `src/pages/llms-full.txt.ts`, `scripts/*`, `vercel.json`, `astro.config.mjs`, `materiales/v2/ESPEC-v2.md`, `CONVENCIONES.md`, `materiales/v2/build/lanzamiento.md`, `materiales/v2/build/peticiones.md` |

**Fases y dependencias**

| Fase | Áreas (en paralelo) | Dependen de |
|---|---|---|
| 1 | orquestador (datos, lib, config, guardas, ESPEC) · modal · api · agenda · copy-a · copy-b | §0–§6 de este documento (contratos fijos) |
| 2 | cta-codigo · landings | modal (`QuoteModal`, `cotizar.json`), orquestador (`SITE.quote`, `OFFERS`, `isHidden`, entradas de `sitemap.json`), agenda (`BookingFlow`), copy-b (P01–P07). **cta-codigo** entrega primero el token `{{offer:…}}` en `ui-data.ts` (landings lo usa). |
| 3 | orquestador · **Verificar** | todas |

Contratos entre áreas (no se cambian sin actualizar este documento): disparador §1.2, claves de atribución §1.5, `cotizar.json` §2.3, primitivas §2.9, API de `server/http.js` y `server/kommo.js` §3.7, `BookingFlow` §5.5, `OFFERS` §4.4, `hidden`/`footerAnchors`/`primaryCta.short` de `sitemap.json` §4.1, evento `ingeniak:overlays-close` y `lock/unlock` de `overlay.ts` §2.5.

---

## 8. Verificar (orquestador, al final)

1. `curl` a 127.0.0.1:4321 de las 45 rutas + `/power-session/` + `/agendar/confirmado/` → 200.
2. `node --test tests/cotizar/ tests/agenda/` → todo verde.
3. `npm run check -- --url http://127.0.0.1:4321` y `npm run check:escenas` / `check:contraste` con las rutas nuevas → sin fallos.
4. CDP en dev (simulación): abrir el modal desde el encabezado de `/`, desde la portada de `/servicios/agentes-ia-whatsapp/` (prefill `agentes-ia`) y desde `/industrias/salud/` (prefill `salud`); recorrer los 3 pasos con errores y sin ellos; enviar → éxito con folio y chip de simulación; forzar 502 (`?estado=falla` en `/dev/cotizar/`) → WhatsApp + correo; Esc devuelve el foco; teclado completo.
5. CDP en dev (mock): `/discovery/` → reservar → vista final; `/power-session/` → reservar → "Stripe simulado" → pagar → `/agendar/confirmado/` ok; cancelar → regreso con aviso y paso 2.
6. Capturas 1440 × 900 y 390 × 844: `/`, `/contacto/`, `/discovery/`, `/power-session/` (portada, `#agenda`, `#diagnostico`, `#oferta`), `/agendar/confirmado/`, modal abierto en sus 3 pasos, éxito y falla. Revisar un azul por pantalla, Kain de cuerpo completo, sin cajas detrás del texto, sin bordes de imagen.
7. `astro build` (solo aquí) + `npm run check` sobre `dist/`: las ocultas fuera de `sitemap-index.xml`, `llms*.txt` e `indice.json`; `dist/dev/` eliminado.
8. **Primer Preview de Vercel** (con el cliente): `curl -i` a `/api/cotizar/` y `/api/agenda/disponibilidad/?tipo=discovery` (JSON, no 404/308), `/api/agenda/estado/`, cabeceras `no-store`/`noindex`, prueba de punta a punta de §5.9-7. Si `/api/…/` da 404, aplicar el rewrite de §3.1.

---

## 9. Decisiones pendientes del cliente (bloquean producción, no la construcción)

1. **Stripe y recursos:** opción **A** (misma cuenta de Stripe, Google y calendarios que riklanderos.tech; cupo de 4 Power compartido) o **B** (cuenta propia de Ingeniak; requiere trabajo extra y cron obligatorio). Por defecto se construye A.
2. **Supabase:** A1 (mismo Supabase: leads + brief de riklanderos) o A2 (sin brief en Ingeniak).
3. **Power Session:** reconfirmar precio USD 297, garantía de 3 fugas (> $10,000 MXN/mes, reclamo en 48 h), cupo de 4 por semana, grabación y mapa como entregables, "precio introductorio", "Las 4 A del empresario libre" junto a VKTOR™ y el cargo de Rik.
4. **VSL de Power:** autorizar la descarga de `powersession-vsl.mp4` (agenda.ingeniak.tech, 29.3 MB) para recodificarlo (720p, faststart, ≤ 12 MB, `.vtt`); hasta entonces la escena `video` de Power no se pinta.
5. **Kommo:** embudo, etapa(s), responsable, plantillas de WhatsApp/correo y si se activa el control de duplicados de la integración.
6. **Vercel:** plan Pro, vincular el conector de Google al proyecto, variables de Production y Preview (de prueba).
7. **Campañas:** redirigir los anuncios de agenda.ingeniak.tech a `https://ingeniak.mx/discovery/` y `https://ingeniak.mx/power-session/` (con sus `utm_*`).
