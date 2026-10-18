# Esquema del texto publicable · `src/content/paginas/*.json`

Dueño: área **copy** (CONVENCIONES.md). Regla: ESPEC-v2 §12.2 **R1** (copy final por página) y **R2** (puertas de contenido).
Los `spec` de `src/data/sitemap.json` son briefs; **el texto que se publica sale de aquí**. Se lee con `getCopy(page.id)` (`src/lib/site.ts`).

---

## 1. Archivos

| Archivo | Qué es |
|---|---|
| `<page.id>.json` | Texto de una página. `page.id` = campo `id` de su entrada en `sitemap.json` (`home`, `agentes-whatsapp`, `ind-salud`, `caso-dental`, `discovery`, …). |
| `_comun.json` | Microcopia compartida (etiquetas de CTA, `SIMULACIÓN`, "escribiendo…", "Saltar escena", pausa, nota de fuente, eslogan). Se lee con `getCopy('_comun')`. |
| `_ESQUEMA.md` | Este documento. |
| `src/data/faq.json` | Banco único de preguntas (§7). Las páginas solo citan ids. |
| `src/data/chats/<sector>.json` | Guiones de `ChatSim` (§8). |

## 2. Forma de cada página

```jsonc
{
  "pageId": "home",                       // = sitemap.json → id
  "url": "/",                             // = sitemap.json → url
  "estado": "borrador",                   // borrador | revisión | aprobado (solo "aprobado" se publica, R1)
  "autor": "Equipo de Ingeniak (redactado con IA)",
  "aprobadoPor": null,                    // nombre de la persona del cliente que aprueba
  "actualizado": "2026-10-18",            // fecha real del último cambio de texto (sirve para dateModified, R8)
  "pendientes": ["…"],                    // datos que faltan y que el texto rodea SIN inventar (nunca [POR CONFIRMAR] en el texto)
  "sections": {                           // UNA clave por id de sección, en el MISMO orden que sitemap.json → sections[]
    "hero": { … },
    "stack": { … }
  }
}
```

- Las secciones condicionales sin contenido aprobado (p. ej. `testimonio` de los casos) existen como clave con `"_omitir": true` y **no se renderizan**.
- Todo campo que empieza con `_` es **nota para quien construye** y nunca se imprime (`_componente`, `_nota`, `_omitir`).
- `pendientes` no se imprime; lo revisa el cliente. Nada de `[POR CONFIRMAR]`, `[VALIDAR]`, `TODO`, `XX` ni `lorem` en campos visibles (R2).

## 3. Campos comunes de una sección

Todos son opcionales; cada sección trae solo los que su componente usa (§6).

| Campo | Tipo | Se pinta como |
|---|---|---|
| `_componente` | string | (oculto) componente(s) de ESPEC §5 que la pintan. |
| `rail` | string | Etiqueta del `SceneRail` (ticks) / Quick Jump en casos. |
| `eyebrow` | string | Eyebrow mono (`.t-label`, el CSS lo pasa a mayúsculas; aquí va en caja normal). Ámbar si `tone="dolor"`. |
| `hud` | `{pos:'tr'\|'bl'\|'br', text}[]` | HUD `aria-hidden` (solo inicio, F13). |
| `h1` / `h2` | objeto titular (§4) | `<h1>`/`<h2>` con dos voces. |
| `lede` | string | `.t-lede` (máx. 44ch de medida). ≤ 40 palabras. |
| `deck` | string | `.t-deck` o `.t-standfirst` (Lexend 300). |
| `remate` | string | Línea final en Lexend 300 ("No te falta esfuerzo. Te falta un sistema."). |
| `body` | string[] | Párrafos (`.t-body`), uno por elemento. |
| `items` | objeto[] | Filas de la lista del componente (forma en §6). |
| `ctaPrimary` | `{label, href}` | `.btn` con `data-primary` + microcopia `_comun.cta.micro`. |
| `ctaSecondary` | `{label, waMessage}` | `.btn--ghost` a `waHref(waMessage)`. **`waMessage` = `sitemap.secondaryCta.waMessage` de la página**, sin variar (atribución, R10). |
| `micro` | string | Microcopia bajo los CTA de un cierre ("Sin costo · Sin compromiso · 30 minutos por Google Meet"). |
| `links` | `{label, href, external?}[]` | Enlaces `.lnk` / `.lnk--mono`. `external: true` → ↗ y `rel="noopener"`. |
| `metricIds` | MetricId[] | Cifras que la sección imprime con `<Metric>`. |
| `sourceNote` | boolean | Imprime `SOURCE_NOTE` ("Datos internos de Ingeniak, octubre de 2026"). |
| `faqIds` | string[] | Preguntas del banco (`src/data/faq.json`) en este orden. |
| `fig` | `{label, text}` | `FigCaption` ("Fig. 01 · Kain" + una oración). |
| `chat` | `{script \| scripts, tabs?, mode}` | `ChatSim` (§8). |
| `ui` | objeto | Textos de la UI registrada sobre la placa (burbujas, tarjeta de lead, agenda). Siempre con `SIMULACIÓN` y `data-nosnippet`. |
| `note` | string | Nota visible pequeña (`.t-small` / `EditorNote`). |
| `ghost` | string | Palabra fantasma (`aria-hidden`). |

## 4. Titulares (`h1`, `h2`)

```jsonc
{ "text": "Tu negocio no necesita más esfuerzo.",   // primera voz (Lexend 600)
  "soft": "Necesita dejar de depender de ti.",       // segunda voz (.soft Lexend 300; en la portada del inicio .t-deck)
  "lit":  "empresas." }                               // opcional: subcadena de `text` que lleva .lit (UNA por página)
```

- El `<h1>` se arma como `text + " " + soft` (o `kicker + cifra + text` en casos) y su texto normalizado **debe ser igual a `sitemap.json → h1`** (check-seo).
- Caso (3 voces, ESPEC §5.4): `{ "kicker": "Clínica dental en Monterrey:", "metricId": "dental-citas", "text": "más citas en 90 días con un agente de IA" }` → `<span class="t-h4">kicker</span> <Metric id variant="mega"/> <span class="t-display-2">text</span>`.
- Un titular sin segunda voz lleva solo `text`.

## 5. Tokens dentro del texto (cifras, precio, fuente)

Ningún texto lleva cifras comerciales escritas a mano (`3.2×`, `−58%`, `27 procesos`, `USD 997`…). Se escriben como token:

| Token | HTML (página) | Texto plano (JSON-LD, ⌘K, meta) |
|---|---|---|
| `{{metric:ID}}` | `<Metric id="ID" variant="inline" />` → **solo el valor** dentro de `data-metric` ("3.2×", "8 min → 12 s", "+73") | `METRICS[ID].value` |
| `{{metric:ID\|full}}` | valor **y** etiqueta dentro del mismo nodo `data-metric` ("27 procesos automatizados", "+73 sistemas en producción") | `value + ' ' + label` |
| `{{price}}` | `<span data-allow-number>` + `PRICE_FROM` ("desde USD 997 al mes") | `PRICE_FROM` |
| `{{Price}}` | igual, con `PRICE_FROM_CAP` ("Desde USD 997 al mes") | `PRICE_FROM_CAP` |
| `{{source}}` | `SOURCE_NOTE` | `SOURCE_NOTE` |

Las palabras que rodean al token completan la frase: `"logró {{metric:dental-citas}} más citas en 90 días"` → "logró 3.2× más citas en 90 días".
No son cifras comerciales (se escriben normal): horas ilustrativas (`23:48`, `11:48 p. m.`), "30 minutos", "1:1", "24/7", "de 3 a 40 empleados", "60 a 90 días", teléfono y dirección. Donde se pueda, los números sueltos van con letra ("siete preguntas", "dos minutos", "ocho minutos").

Implementación de referencia (para `src/lib/copy.ts`, del orquestador; pedido en `peticiones.md`):

```ts
import { METRICS, PRICE_FROM, PRICE_FROM_CAP, SOURCE_NOTE } from './metrics';
const RX = /\{\{(metric:([a-z-]+)(\|full)?|price|Price|source)\}\}/g;
/** Texto plano: JSON-LD, ⌘K, meta. */
export function copyText(s: string): string {
  return s.replace(RX, (_, k, id, full) => {
    if (k === 'price') return PRICE_FROM; if (k === 'Price') return PRICE_FROM_CAP; if (k === 'source') return SOURCE_NOTE;
    const m = (METRICS as any)[id]; if (!m) throw new Error(`[copy] cifra desconocida: ${id}`);
    return full ? `${m.value} ${m.label}` : m.value;
  });
}
/** Partes para pintar en Astro: [{t:'text', v}] | [{t:'metric', id, full}] | [{t:'price', cap}] | [{t:'source'}]. */
export function copyParts(s: string) { /* mismo RX con split; el componente pinta <Metric> o <span data-allow-number> */ }
```

## 6. Campos por componente (ESPEC §5 y §6)

Los tokens de §5 valen en **cualquier** campo visible, también en titulares (`"h2": {"text": "{{Price}}."}` → "Desde USD 997 al mes.").

| Componente | Campos de la sección (nombres exactos) |
|---|---|
| `ImageSection` (portada) | `eyebrow`, `h1`, `lede`, `remate?`, `ctaPrimary`, `ctaSecondary`, `micro?`, `trust?` (línea mono de confianza), `chips?: string[]` (`.chip-spec`), `chip?: {metricId, context}` (chip de prueba anclado), `fig?`, `ui?`, `illus?` ("Imagen ilustrativa del sector"), `sumario?`, `hud?` |
| `ImageSection` (mid) | `eyebrow`, `h2`, `lede`, `items?: string[]` (viñetas), `slogan?`, `limite?` (línea "Kain no da…"), `links?`, `ctaSecondary?`, `chat?`, `ui?`, `note?`, `quote?` (oración citable del resultado de un caso) |
| UI registrada (`ui`) | burbujas: `ui.bubbles: {who, text, time?}[]`, `ui.status`, `ui.timeLabel`; agenda de caso: `ui.title`, `ui.days: string[]`, `ui.slot` |
| `SumarioCover` | `sumario: {metricIds:[3], sourceNote}` (vive en `hero`; su versión en fila se repite en `stack`) |
| `TwinScene` + `PainList` | `eyebrow`, `h2`, `lede`, `items: {pain, painLine, fix}[]`, `remate`, `hudClock: string[]` |
| `PainList` (`senales`) | `items: {pain, painLine, fix}[]` (dolor en ámbar, salida en cian; ambos siempre en el DOM) |
| `Intertitle` + `DefinitionBlock` | `eyebrow`, `h2` (manifiesto), `lede`, `definition: {heading, faqId}` (el texto sale del banco: idéntico al FAQ), `body?`, `ghost?`, `countries?` |
| `Intertitle` (lista corta: `datos`, `inversion`) | `eyebrow`, `h2`, `lede`, `items: {title, line}[]`, `remate?`, `note?` |
| `MetricRow` | `metricRow: {title, metricIds, sourceNote}` |
| `PlateSequence` runtime (`SystemRuntime`) | `eyebrow`, `h2`, `lede`, `steps: {id, stage, title, line, link:{label,href}, metricIds, leadCard}[]`, `fig`, `note`, `progressLabel` (`{n}` = número de estación) |
| `ChatSim` | `chat: {scripts: string[], tabs: {id,label}[], mode:'registered'}` o `chat: {script, mode:'inline'\|'registered'}`; textos de control en `_comun.sim` |
| `ScriptList` | `groups?: {label, glyph, items:{title,line,href}[]}[]` o `items: {n?, title, line, href?}[]`, `closing?`, `links?` |
| `Montage` | `rows: {metricId, context, href?, linkLabel?}[]`, `transversal?: MetricId[]`, `sourceNote`, `note?`, `links?` |
| `ResultsLedger` | `ledger: {metricIds, caption}` |
| `ImageSection` VKTOR (`cutout`+`ghost`) / `VktorRail` | `phases: {letter, name, verb, line}[]` (`verb` = texto oficial de la fase; `line` = cómo se aplica en esta página) |
| `LocationSwitcher` | `sectors: {slug, name, line, href, metricId?, bubbles:[{who,text},{who,text}]}[]`, `rowLink`, `footer` |
| `Credits` (equipo) | `credits: {role, name, line}[]` |
| `EntitySheet` | `entity: {term, value, href?}[]` (mismos datos que JSON-LD y `llms.txt`); en casos además `deck` (`.t-standfirst`), `byline`, `note` |
| `Prose` + nota al margen | `body: string[]`, `margin: {text, tone:'ambar'}` |
| `FAQAccordion` | `eyebrow`, `h2`, `faqIds`, `footer?` |
| `Dawn` | `eyebrow`, `h2`, `lede?`, `quote?`, `ctaPrimary`, `ctaSecondary?`, `micro`, `firma?` |
| `DayTimeline` | `entries: {time, pain, fix}[]` (horas ilustrativas; sin cifras) |
| `SystemFlow` | `nodes: {label, line, logos?: string[], confirmed: boolean}[]` (`confirmed:false` no se pinta), `note?`, `body?` |
| `TwoColumnScript` (`dodont`, `fit`) | `left: {title, tone, items: string[]}`, `right: {…}`, `slogan?`; extra en `/discovery/#que-es`: `revisamos: {title, items, line}` |
| `TwoColumnScript` (`compare`) | `left: {title, tone}`, `right: {title, tone}`, `rows: {criterio, chatbot, agente}[]` |
| `LogoCredits` | `logos: {slug, label, href?}[]` o `groups: {label, logos, line}[]` (slug = archivo de `public/img/logos/`), `kommo?` (texto del sello), `note?` |
| `Still` (mini / ×3) | `items: {href, label, title, line}[]` |
| `ScriptList` + `Still variant="next"` (casos) | `items: {title, line, href}[]`, `next: {label, title, metricId, href}` |
| `CaseFigure` | `figure: {variant, before, after, caption, aria}`, `metricIds`, `line`, `sourceNote` |
| `VideoScene` | `eyebrow`, `h2`, `lede`, `play`, `close`, `after` |
| `StepRow` (`ScriptList variant="steps"`) | `items: {n, title, line}[]`, `remate?` |

## 7. Banco de preguntas · `src/data/faq.json`

```jsonc
[{ "id": "G02",
   "q": "¿Qué es un agente de IA para WhatsApp?",          // = sitemap.json (no se cambia la pregunta)
   "a": "Un agente de IA para WhatsApp es…",               // 40–80 palabras, citable, con tokens §5
   "short": "…",                                          // ≤ 25 palabras: respuesta corta del buscador ⌘K
   "pages": ["/", "/servicios/agentes-ia-whatsapp/"],     // dónde aparece
   "categoria": "Agentes de IA",                          // grupos de /preguntas-frecuentes/
   "validar": false,                                      // true = redacción nueva o "validar" en D §12: no se publica sin aprobación
   "editada": true }]                                     // true = se amplió la respuesta aprobada de D; el cliente la revisa
```

- `FAQAccordion`, `DefinitionBlock` y el `FAQPage` de `SEOHead` leen **este** archivo (no `sitemap.json → faq[].a`) y aplican el mismo filtro de `validar`, así el JSON-LD es idéntico al texto visible.
- Las respuestas que también son `DefinitionBlock` (G01, G02, G12, G13, S01) miden 40–60 palabras.

## 8. Guiones de `ChatSim` · `src/data/chats/<sector>.json`

Archivos: `salud`, `belleza`, `inmobiliario`, `retail`, `default`. Cada uno es un arreglo `ChatLine[]`:

```jsonc
[{ "who": "cliente", "text": "Hola, buenas noches…", "delay": 900, "time": "11:02 p. m." },
 { "who": "kain", "text": "¡Hola! Soy Kain…", "delay": 1100 },
 { "who": "kain", "text": "Listo, Laura…", "delay": 1000, "event": "Cita registrada en tu CRM" }]
```

- `delay` (ms): pausa antes de que aparezca la línea. En las líneas de Kain, durante esa pausa se ve "escribiendo…". Son tiempos de animación, **no datos**.
- `time` (opcional): hora ilustrativa del primer mensaje (va con la etiqueta "Hora ilustrativa").
- `event` (opcional): chip mono bajo la burbuja (lo que pasa en el sistema: "Cita registrada en tu CRM").
- Reglas: todo guion va con `SIMULACIÓN` y `data-nosnippet`; Kain **nunca** da consejo médico, legal ni financiero (lo dice y pasa a una persona); sin precios ni cifras comerciales; nombres de pila genéricos.

## 9. Reglas de redacción

1. Español de México, tuteo, sin humo: dato antes que adjetivo. Nada de "increíble", "revolucionario", "potenciar", "soluciones integrales".
2. Kain: primera persona cuando habla él; logotipo **kain** en minúsculas cuando se nombra la sub-marca o `app.kain.mx`; Kain no da consejo médico ni legal.
3. Solo Kommo es "partner oficial". GoHighLevel y el resto: "herramientas que usamos e integramos".
4. Nunca: testimonios, nombres de clientes, logos de clientes, premios, precios distintos de `PRICE_FROM`, herramientas de un caso sin confirmar. Si un dato de caso falta, el texto lo rodea y el faltante va a `pendientes`.
5. "Ejemplo ilustrativo" / "Hora ilustrativa" nunca junto a una cifra real (r1).
6. Una sola `.lit` por página (campo `lit`, solo en la portada).

## 10. Mínimo de palabras (R1) y cómo se cuentan

Palabras visibles de la página, **sin** menú, footer ni la sección `faq` (FAQ compartidas). Sí cuentan: todos los campos visibles de §3–§6, los `DefinitionBlock` (texto del banco), las cifras impresas y los guiones de `ChatSim`. No cuentan: campos `_…`, `href`, ids, `waMessage`, `hud`, `pendientes`.

| Plantilla | Mínimo |
|---|---|
| T-HOME, T-SERVICE, T-PLATFORM | 900 |
| T-INDUSTRY | 750 |
| T-PRODUCT, T-METHOD, T-LOCAL | 700 |
| T-CASE, T-STACK, T-ABOUT, T-CONVERSION | 600 |
| T-HUB | 350 |

## 11. Validación

Antes de entregar: `node -e "JSON.parse(require('fs').readFileSync(f,'utf8'))"` en cada archivo, y las comprobaciones de copy: claves en el orden de `sitemap.json`, `h1` normalizado = `sitemap.h1`, `waMessage` = `sitemap.secondaryCta.waMessage`, ids de `{{metric:…}}` existentes en `metrics.ts`, `faqIds` existentes en `faq.json`, cero patrones de cifra comercial fuera de tokens (`\d+(\.\d+)?\s?(%|×|x\b)`, "N citas", "N procesos", "N min", "USD N"), cero `[POR`/`[VALIDAR`/`TODO`/`XX`, palabras ≥ mínimo de §10, respuestas del banco entre 40 y 80 palabras.
