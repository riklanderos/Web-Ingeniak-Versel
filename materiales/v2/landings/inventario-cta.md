# Inventario de CTA y de "Discovery" · Ingeniak v2

**Fecha:** 2026-10-20 · **Para:** el cambio "Cotizar proyecto" (modal de cotización → Kommo) y las landings ocultas `/discovery/` y `/power-session/` con reserva directa.
**Método:** grep de `src/` (componentes, plantillas, layout, nav, scripts, copy JSON, data, lib), `scripts/`, `vercel.json`, `src/data/redirects.json`, endpoints `llms*.txt` e `indice.json`; rastreo del dev server (`http://127.0.0.1:4321`) de las 44 URL de `/indice.json` + `/404/` con el parser del propio proyecto (`scripts/_html.mjs`). No se editó ningún archivo del proyecto.

Abreviaturas: **ATDS** = "Agenda tu Discovery Session" · **AMDS** = "Agendar mi Discovery Session" · **EaK** = "Escríbele a Kain" (WhatsApp) · **agenda ext.** = `https://agenda.ingeniak.tech/discovery/agendar` (`SITE.agenda`).

---

## 0. Resumen en cifras

| Qué | Cuánto |
|---|---|
| Páginas rastreadas | 45 (44 de `indice.json` + 404). Nav completa: 44. Nav reducida: 1 (`/discovery/`). |
| Primarios azules (`a[data-primary]`) dentro de `<main>` | **87**: 84 ATDS → `/discovery/` y 3 AMDS → agenda ext. (solo en `/discovery/`). Por sección: `hero` 36 · `cta-final` 43 · `cta-medio` 6 (artículos) · `no-se` 1 (`/servicios/`) · `despues` 1 (`/discovery/`). |
| Cromo con CTA a `/discovery/` en cada página de nav completa (44) | 5: CTA del encabezado (ATDS; corto "Agenda tu Discovery") · barra móvil (ATDS) · hoja del menú móvil (ATDS + micro) · acción fija del ⌘K (ATDS) · "Planes desde USD 997 al mes" del mega menú Servicios. Más el mapa del footer ("Discovery Session") en las 45. |
| WhatsApp | 124 enlaces `wa.me` en `<main>` (118 botones EaK `.btn--ghost`); además ícono del encabezado, KainPill, barra móvil, hoja móvil, ⌘K y footer en las 44 de nav completa. |
| Enlaces de texto (no botón) a `/discovery/` en `<main>` | 5: `/` (#faq, ficha), `/nosotros/` (#ficha), `/agentes-ia-guadalajara/` (#ficha) → `EntitySheet` "Primer paso"; `/preguntas-frecuentes/#empezar` (enlace "Qué pasa en la Discovery Session"); `/contacto/#rutas` (ruta "Discovery Session · Agendar"). |
| Enlaces a `/discovery/` en todo el HTML | 354 (8 por página típica). |
| "Discovery" como texto | 219 en `<main>`, 485 en `<body>`, 76 en JSON-LD, 2 en title/meta (`/discovery/`, `/contacto/`); 59 FAQ visibles lo mencionan. `llms.txt` 5 · `llms-full.txt` 206 · `indice.json` 7. |
| Copy (`src/content/paginas/`) | 87 claves `ctaPrimary.label` (43 JSON) · 77 claves de texto con "Discovery" · 19 microcopias de cierre "Sin costo · Sin compromiso · 30 minutos por Google Meet" · 40 frases "en 30 minutos" que aluden a la Discovery sin nombrarla. |
| Formularios hoy | 1 (`form.art-calc__form`, calculadora de `/blog/cuanto-cuesta-agente-ia-whatsapp-mexico/`). No hay formulario de contacto ni de cotización. No existe `/power-session/` ni `/agendar/confirmado/`. |
| Guardas que fijan el texto del CTA | **Ninguna** compara la etiqueta literal. Chocan con el cambio: `check-cifras` (microcopia y montos del presupuesto), `check-seo` (WhatsApp y enlaces), `check-pendientes` (`href="#"`, placeholders). Ver §3. |

---

## 1. Componentes y props que pintan CTA (de dónde salen etiqueta y destino)

### 1.1 Fuentes de datos

| Fuente | Archivo:línea | Qué da | ¿Se usa? |
|---|---|---|---|
| `SITE.discovery` = `'/discovery/'` | `src/lib/site.ts:26` | destino del primario en todo el sitio | Sí: Header, MobileCTABar, MobileMenu, SearchDialog, EntitySheet, EditorNote, plantillas (respaldo), llms.ts |
| `SITE.agenda` = agenda ext. | `src/lib/site.ts:27` | destino en `/discovery/` | Header reducido, ConversionTemplate, ContactTemplate (respaldo) |
| `SITE.waBase`, `waHref()` | `src/lib/site.ts:18`, `:83-85` | WhatsApp `+52 33 2101 7799` con mensaje | Todo |
| `DISCOVERY_MICRO` = "30 min · 1:1 · Google Meet · sin costo" | `src/components/ui/ui-data.ts:9` | microcopia bajo el primario | Btn (`micro`), HeroCtas, EntitySheet |
| `_comun.json → cta.*` | `src/content/paginas/_comun.json` (`cta.discovery`, `cta.discoveryCorto`, `cta.agenda`, `cta.kain`, `cta.kainAria`, `cta.micro`, `cta.microCierre`, `cta.kainPill`, `cta.kainPillEstado`) | textos de CTA compartidos | Solo `cta.discovery` se lee (`CaseTemplate.astro:75`); el resto está duplicado a mano en los componentes |
| `sitemap.json → primaryCta` | `src/data/sitemap.json` (45 entradas: 39 ATDS, 5 "Quiero un sistema así: agenda tu Discovery" en casos, 1 AMDS; 44 → `/discovery/`, 1 → agenda ext.) | etiqueta/destino por página | `HomeTemplate.astro:54`, `CaseTemplate.astro:276,524,528` (href), `ConversionTemplate.astro:58-60`. El resto de plantillas usa el copy |
| `sitemap.json → secondaryCta` | 45 × EaK + `waMessage` único | WhatsApp de la página | `navData.ts:173-179` (`waOf`) → `BaseLayout.astro:69` → encabezado, KainPill, barra, hoja, ⌘K, footer; y `check-seo` |
| `navegacion.json → actions[0]` (ATDS → `/discovery/`) | `src/data/navegacion.json` | CTA del menú | **No se lee** (Header lo escribe a mano) |
| `navegacion.json → actions[1]` (WA "vengo del menú") | ídem | WA genérico | Sí, respaldo de `waOf()` |
| `navegacion.json → mobileStickyBar` ("Agenda tu Discovery" + WA) | ídem | barra móvil | **No se lee** (MobileCTABar lo escribe a mano) |
| `navegacion.json → megaMenu[Servicios].footerLinks[3]` `{label:"Planes desde USD 997 al mes", href:"/discovery/", priceFrom:true}` | ídem | enlace de precio | `MegaMenu.astro:198-200` |
| `navegacion.json → footer.columns[4].links[8]` = `/discovery/` | ídem | mapa del footer (Recursos) | `Footer.astro:22-27` + `navData.ts:30` (`shortName` → "Discovery Session") |

### 1.2 Componentes compartidos (áreas ui y cine)

| Componente | Archivo:línea | Comportamiento |
|---|---|---|
| `Btn` | `src/components/ui/Btn.astro:11-52` | `variant="primary"` → `.btn` + `data-primary` (regla de un azul F15) + `data-magnetic` + nodo; `micro` → `.cta-p` con `DISCOVERY_MICRO` (`:51`). Sin `href` renderiza `<button type="button">` (`:43`): sirve para un disparador de modal. Comentario de regla en `:2`. |
| `HeroCtas` | `src/components/templates/HeroCtas.astro:9-29` | props `href`, `label`, `waHref`, `waLabel` (= EaK), `micro` (= `DISCOVERY_MICRO`), `primaryAttrs`. Fila de portada de todas las plantillas. |
| `Dawn` (cierre) | `src/components/cine/Dawn.astro:76-85` | con prop `copy`: primario por defecto `'/discovery/'` + ATDS (`:82`); las plantillas usan el slot y pasan su propio `Btn`. |
| `EditorNote variant="cta"` | `src/components/ui/EditorNote.astro:14-16` | respaldo `SITE.discovery` + ATDS. Solo se usa en `/dev/ui/` (los artículos pintan su propio `cta-medio`). |
| `EntitySheet` | `src/components/ui/EntitySheet.astro:51`, `:89` | fila "Primer paso" con enlace `SITE.discovery` "Discovery Session" + `DISCOVERY_MICRO` (inicio #faq, nosotros #ficha, guadalajara #ficha). |

### 1.3 Navegación (área nav)

| Pieza | Archivo:línea | Etiqueta → destino hoy |
|---|---|---|
| CTA del encabezado | `src/components/nav/Header.astro:20-21`, `:64-67` | nav completa: ATDS (corto "Agenda tu Discovery") → `SITE.discovery`; reducida: AMDS (corto "Agendar") → `SITE.agenda`. Escrito a mano. |
| WhatsApp del encabezado | `Header.astro:59-62` | ícono → `waHref` (secondaryCta de la página); solo nav completa. |
| Modo de nav | `src/layouts/BaseLayout.astro:67` | `reduced` solo si `page.url === '/discovery/'`. Con `reduced` no hay KainPill, barra móvil, hoja ni ⌘K (`:139-146`). |
| Barra móvil | `src/components/nav/MobileCTABar.astro:14-19` | ATDS → `SITE.discovery` + ícono WA. Escrito a mano. |
| Hoja del menú móvil | `src/components/nav/MobileMenu.astro:115-124` | ATDS → `SITE.discovery` + micro escrita a mano (`:120`) + ghost EaK. |
| ⌘K (acción fija) | `src/components/nav/SearchDialog.astro:35-36` y `src/scripts/nav/search.ts:188-190` | ATDS → `/discovery/` ("30 min · 1:1 · sin costo" / "sin costo"); el script la reconstruye en cada búsqueda. |
| Mega menú "Planes…" | `src/components/nav/MegaMenu.astro:198-200` | `Planes {PRICE_FROM}` → `/discovery/` (de navegacion.json). |
| KainPill | `src/components/nav/KainPill.astro:39-46` | solo WhatsApp: EaK · "responde 24/7". Nunca azul. |
| Footer | `src/components/nav/Footer.astro:22-27` (mapa), `:35` (WA genérico), `:67-68` (correo y WA) | Sin primario; el mapa lista `/discovery/` como "Discovery Session". |
| Índice del buscador | `src/pages/indice.json.ts:35` | indexa toda página construida salvo la 404 (**no filtra noindex**): `/discovery/` aparece en ⌘K. |

### 1.4 Plantillas (área páginas): primarios con etiqueta/destino del copy y respaldo fijo ATDS/`/discovery/`

| Plantilla | Portada (HeroCtas) | Medio | Cierre (Dawn + Btn) |
|---|---|---|---|
| `HomeTemplate.astro` | `:250` (respaldo `primary` = `sitemap.primaryCta`, `:54`) | — | `:539`, `:543` (+ `fin.micro` `:537-540`) |
| `ServiceTemplate.astro` | `:730` | — | `:1259` |
| `PlatformTemplate.astro` (kommo, gohighlevel) | `:393` | — | `:948` |
| `IndustryTemplate.astro` | `:253` | — | `:474`, `:478` |
| `HubTemplate.astro` (servicios, industrias, casos, blog) | `:190` | `:282` (`no-se`) | `:428`, `:433` |
| `CaseTemplate.astro` | `:276` (etiqueta `primaryLabel` `:75`: copy → `_comun.cta.discovery` → ATDS) | — | `:524`, `:528` |
| `ProductTemplate.astro` (kain) | `:211` | — | `:505` |
| `MethodTemplate.astro` | `:163` | — | `:364`, `:368` |
| `StackTemplate.astro` | `:160` | — | `:331`, `:335` |
| `AboutTemplate.astro` | `:163` | — | `:350`, `:354` (+ `cta.micro` `:348-351`) |
| `LocalTemplate.astro` | `:174` | — | `:400`, `:404` |
| `FaqTemplate.astro` | (portada solo WA) | — | `:330` |
| `ArticleTemplate.astro` | (sin portada con primario) | `:502`, `:521` (`cta-medio`) | `:616`, `:620` |
| `ContactTemplate.astro` | `:131` (`linkTarget('/discovery/') ?? SITE.agenda`) | rutas `:89-93` (ruta `discovery`) | `:275` |
| `ConversionTemplate.astro` (`/discovery/`) | `:185` (`external:false`, `data-agenda-section`) | `:352-355` (`despues`, micro fija `:355`) | `:377-379` |
| `src/pages/404.astro` | `:56-59` solo buscar + WA | — | — |

En cada plantilla el par lleva el ghost EaK con `ctaSecondary.waMessage` del copy o `secondaryCta` del sitemap. La microcopia de cierre ("Sin costo · Sin compromiso · 30 minutos por Google Meet") sale de `cta.micro` del copy cuando existe (con `data-allow-number`); si no, `Btn micro` pinta `DISCOVERY_MICRO`.

### 1.5 Lógica, medición y metadatos ligados a la Discovery

| Qué | Archivo:línea |
|---|---|
| Atribución R10: primer clic a `/discovery/` (`a[data-primary],a.btn`) → `sessionStorage['ingeniak-src']` + evento `cta_discovery_click` | `src/scripts/ui.ts:527-551` (registro `:752`) |
| Regla de un azul (F15) sobre `[data-primary]` | `src/scripts/ui.ts:15`, `:516` |
| Atribución hacia la agenda ext. (utm + `src`) + evento `agenda_click` | `ConversionTemplate.astro:389-412` |
| JSON-LD `Service` con `Offer` precio 0 "Discovery Session gratuita de 30 minutos" | `src/components/layout/jsonld.ts:176-196` |
| llms.txt "Primer paso: Discovery Session…" | `src/lib/llms.ts:35`; grupo `Conversión` en `:48` |
| Etiqueta del grupo `Conversión` = "Discovery Session" en "Sigue explorando" | `src/components/templates/heroKit.ts:56`; `ArticleTemplate.astro:244` |
| `builtRelated` rellena con **toda** ruta construida (puede sugerir una landing oculta) | `heroKit.ts:73-85`; `ArticleTemplate.astro:224-225` agrega `/discovery/` a `prefer` |
| Categoría FAQ "Discovery Session" → ancla `empezar` | `src/components/templates/FaqTemplate.astro:70` |
| Páginas de demostración con ATDS a mano (noindex, fuera de rutas) | `src/pages/dev/nav.astro:43,77`, `dev/cine.astro:90,224`, `dev/ui.astro:58,74,402` |
| Estilos con nombre Discovery | `src/styles/tpl/ContactTemplate.css:75-76` (`.ct-route--discovery`); comentarios en `ui.css:41`, `cine.css:484,498`, `pages.css:626` |

---

## 2. Claves de copy con etiqueta de CTA o redacción "Discovery"

### 2.1 `_comun.json`

`cta.discovery` "Agenda tu Discovery Session" · `cta.discoveryCorto` "Agenda tu Discovery" · `cta.agenda` "Agendar mi Discovery Session" · `cta.kain` / `cta.kainAria` / `cta.kainPill` "Escríbele a Kain (por WhatsApp)" · `cta.kainPillEstado` "responde 24/7" · `cta.micro` "30 min · 1:1 · Google Meet · sin costo" · `cta.microCierre` "Sin costo · Sin compromiso · 30 minutos por Google Meet". Hoy no hay claves para "Cotizar proyecto" ni para el formulario.

### 2.2 Por página (sin `pendientes`/`_notas`; los `ctaSecondary` EaK + `waMessage` existen en todas y no se listan)

Columna 2: secciones con `ctaPrimary.label` (todas ATDS salvo `discovery.json` = AMDS); columna 3: su `ctaPrimary.href`.

| copy (src/content/paginas/) | ctaPrimary.label (secciones) | hrefs | micro "30 min" | texto con "Discovery" (claves) | "30 minutos" sin decir Discovery |
|---|---|---|---|---|---|
| _comun.json | — | — | cta | cta.discovery, cta.discoveryCorto, cta.agenda | cta.microCierre |
| agentes-whatsapp.json | hero, cta-final | /discovery/ | — | inversion.remate, cta-final.lede | — |
| art-agente-chatbot.json | cta-medio, cta-final | /discovery/ | cta-final | cuerpo.blocks.40 | — |
| art-costo.json | cta-medio, cta-final | /discovery/ | cta-final | respuesta.text, cuerpo.blocks.45.items.0 | cta-final.h2.soft |
| art-ghl-espanol.json | cta-medio, cta-final | /discovery/ | cta-final | cuerpo.blocks.38 | cta-final.h2.soft |
| art-kommo-ghl.json | cta-medio, cta-final | /discovery/ | cta-final | cuerpo.blocks.35 | cta-final.h2.soft |
| art-n8n.json | cta-medio, cta-final | /discovery/ | cta-final | cuerpo.blocks.40 | cta-final.h2.soft |
| art-partner-kommo.json | cta-medio, cta-final | /discovery/ | cta-final | cuerpo.blocks.31.items.1 | cta-final.h2.soft |
| blog.json | hero, cta-final | /discovery/ | cta-final | — | cta-final.h2.soft |
| branding.json | hero, cta-final | /discovery/ | — | inversion.remate, cta-final.lede | — |
| caso-dental.json | hero, cta-final | /discovery/ | — | cta-final.lede | cta-final.h2.soft |
| caso-ecommerce.json | hero, cta-final | /discovery/ | cta-final | cta-final.lede | cta-final.h2.soft |
| caso-horeca.json | hero, cta-final | /discovery/ | cta-final | cta-final.lede | cta-final.h2.soft |
| caso-logistica.json | hero, cta-final | /discovery/ | cta-final | cta-final.lede | cta-final.h2.soft |
| caso-retail.json | hero, cta-final | /discovery/ | cta-final | cta-final.lede | cta-final.h2.soft |
| casos.json | hero, cta-final | /discovery/ | cta-final | — | — |
| consultoria.json | hero, cta-final | /discovery/ | — | entregables.body.0, como-funciona.lede, inversion.remate, cta-final.lede | — |
| contacto.json | hero, cta-final | /discovery/ | cta-final | hero.lede, hero.chat.lines.3.text, rutas.routes.0.id, rutas.routes.0.name | cta-final.h2.soft |
| crm-ia.json | hero, cta-final | /discovery/ | — | inversion.remate, cta-final.lede | cta-final.h2.soft |
| discovery.json | hero, despues, cta-final | agenda externa | — | que-es.h2.text, despues.remate | hero.eyebrow, hero.h1.text, pasos.items.1.line, que-es.lede, despues.body.0, cta-final.h2.text |
| faq.json | cta-final | /discovery/ | cta-final | crm.lede, precio.lede, empezar.lede, empezar.links.0.label, empezar.links.0.href, cta-final.h2.soft | empezar.h2.soft, empezar.steps.2.line, cta-final.lede |
| gohighlevel.json | hero, cta-final | /discovery/ | — | inversion.remate, cta-final.lede | cta-final.h2.soft |
| guadalajara.json | hero, cta-final | /discovery/ | cta-final | que-es.body.0, ficha.entity.6.value, local-alcance.columns.0.items.2 | cta-final.h2.soft |
| home.json | hero, cta-final | /discovery/ | — | servicios.closing, vktor.lede, industrias.footer, faq.entity.7.value | — |
| ind-belleza.json | hero, cta-final | /discovery/ | — | — | cta-final.h2.soft |
| ind-finanzas.json | hero, cta-final | /discovery/ | — | — | cta-final.h2.soft |
| ind-horeca.json | hero, cta-final | /discovery/ | — | cta-final.lede | cta-final.h2.soft |
| ind-industrial.json | hero, cta-final | /discovery/ | — | cta-final.lede | cta-final.h2.soft |
| ind-inmobiliario.json | hero, cta-final | /discovery/ | — | — | cta-final.h2.soft |
| ind-nutricion.json | hero, cta-final | /discovery/ | — | datos.note | cta-final.h2.soft |
| ind-retail.json | hero, cta-final | /discovery/ | — | cta-final.lede | cta-final.h2.soft |
| ind-salud.json | hero, cta-final | /discovery/ | — | datos.note, cta-final.lede | cta-final.h2.soft |
| industrias.json | hero, cta-final | /discovery/ | cta-final | grid.footer, cta-final.lede | cta-final.h2.soft |
| kain.json | hero, cta-final | /discovery/ | — | que-es.facets.1.line, sectores.footer, plataforma.body.0, cta-final.lede | — |
| kommo.json | hero, cta-final | /discovery/ | — | licencias.credential.2.value, inversion.remate, cta-final.lede | cta-final.h2.soft |
| metodologia.json | hero, cta-final | /discovery/ | — | fases.steps.0.line, tiempos.timeline.0.when, cta-final.lede | cta-final.h2.soft |
| n8n.json | hero, cta-final | /discovery/ | — | inversion.remate, cta-final.lede | — |
| nosotros.json | hero, cta-final | /discovery/ | cta-final | ficha.entity.13.value | cta-final.h2.text |
| paginas-web.json | hero, cta-final | /discovery/ | — | inversion.remate | cta-final.lede |
| paid-media.json | hero, cta-final | /discovery/ | — | inversion.remate, cta-final.lede | cta-final.h2.soft |
| seo.json | hero, cta-final | /discovery/ | — | inversion.remate, cta-final.lede | — |
| servicios.json | hero, no-se, cta-final | /discovery/ | cta-final | mapa.closing, no-se.h2.soft | cta-final.h2.soft |
| software.json | hero, cta-final | /discovery/ | — | inversion.remate, cta-final.lede | — |
| tecnologias.json | hero, cta-final | /discovery/ | — | cta-final.lede | — |

TOTAL ctaPrimary.label=87 · claves con Discovery=77 · micro=19 · 30min=40 · archivos=44

Además, en `contacto.json`: `rutas.routes[0]` (`id: discovery`, `name`, `contact` "30 min · 1:1 · Google Meet", `then` "Llenas un formulario de siete preguntas…", `action` "Agendar") y `hero.chat.lines[3]` (Kain ofrece la Discovery). En `faq.json`: `empezar.links[0]` (`label` "Qué pasa en la Discovery Session", `href` `/discovery/`) y `empezar.steps`. En `home.json`/`nosotros.json`/`guadalajara.json`: `faq.entity[7]` / `ficha.entity[13]` / `ficha.entity[6]` = "Discovery Session: 30 min · 1:1 · Google Meet · sin costo".

### 2.3 Otros datos

| Archivo | Claves |
|---|---|
| `src/data/sitemap.json` | `primaryCta.label/href` (45 páginas) · `internalLinks[]` con `/discovery/` (40 páginas) · `sections[].spec` (96 menciones en 43 páginas; son briefs, no texto publicado) · `faq[].a` (39 menciones en 27 páginas; respaldo del banco FAQ) · entrada `discovery` (id, url, canonical, title "Discovery Session gratuita de 30 minutos", metaDescription, primaryKeyword, breadcrumbs, `indexable: true`, group `Conversión`) · `contacto.metaDescription` empieza con "Agenda tu Discovery Session" · `jsonLd` "price 0" de discovery. |
| `src/data/faq.json` | 27 menciones. Categoría "Discovery Session": G11 "¿Cómo empiezo…?" (pages `/`, `/industrias/`, `/metodologia/`, `/agentes-ia-guadalajara/`, `/preguntas-frecuentes/`), N07 "¿Trabajan con pymes?", D01–D06 (D01, D02, D06 también en `/preguntas-frecuentes/`; D03–D05 solo `/discovery/`). Respuestas que remiten a la Discovery: G07 (precio, 22 páginas), G08, G10, W03, K04, L01, N11, N13; `G07.short`, `G11.short`, `N07.short`. |
| `src/data/navegacion.json` | `actions[0]`, `mobileStickyBar[0]`, `megaMenu[0].footerLinks[3].href`, `footer.columns[4].links[8]`. |
| `src/data/plates.json` | placas `discovery-hero`, `discovery-para-quien`, `discovery-cta-final`, `discovery-vsl-poster` (también usadas fuera: `LocalTemplate.astro:80` respaldo `discovery-hero`; `hubKit.ts:59` `blog-hero` → `discovery-para-quien`). |
| `vercel.json:197-205` y `src/data/redirects.json:195-203` | 301 `/cotiza` y `/cotiza/` → `/discovery/` (la URL de cotización de v1 hoy cae en la Discovery). |
| `public/video/discovery-vsl-720.mp4`, `/img/discovery-vsl-poster.webp` | VSL de la landing (`ConversionTemplate.astro:48`). |

### 2.4 Reglas escritas que fijan el CTA actual (documentación, sin guarda automática)

`CONVENCIONES.md:51` · `ESPEC-v2.md` §0.1-4 (l. 39), §2.1 `--blue` (l. 169), §2.9 (l. 383, 392), §4.1 (l. 847), §4.6 (l. 899), §5.1 (l. 965), §5.11 (l. 1099-1101), §5.12 (formulario `[POR DECIDIR]`), §8 (l. 1419 "cada página enlaza a `/discovery/`", l. 1470), §12.2 R10 (l. 1731-1732) · `src/content/paginas/_ESQUEMA.md:61` (`ctaPrimary` + micro `_comun.cta.micro`).

---

## 3. Guardas que hoy sostienen el CTA (o que chocarán con el cambio)

| Guarda | Archivo:línea | Regla actual | Impacto del cambio |
|---|---|---|---|
| Etiqueta del primario | — | **Ninguna guarda** compara "Agenda tu Discovery Session"; vive en la documentación (§2.4). | Conviene una guarda nueva (ver G8): fuera de las landings todo `[data-primary]` = "Cotizar proyecto" con `data-quote`; dentro, reserva directa. |
| Microcopia fija | `scripts/check-cifras.mjs:15-17` (`MICRO_29`), `:106` | "30 min · 1:1 · Google Meet · sin costo" pasa aunque no tenga `data-allow-number`, solo con esa frase exacta. | Una micro nueva con cifras necesita `data-allow-number` y caber en `ALLOW_ONLY` (`:14`: solo `N min` o `USD N`). Mejor sin cifras. |
| Montos | `check-cifras.mjs:13` (`PRICE_RX`), `:114-118`, `:104-105` (`priceOk`) | Cualquier "$1,000", "MXN", "pesos", "dólares" en texto visible **falla siempre** (el bucle no mira `data-allow-number`); "USD N" debe ser `PRICE_FROM`. Atributos `alt/aria-label/title/placeholder` revisados en `:119-130`. | Las opciones de **presupuesto estimado** del formulario ("Menos de $1,000 USD" … "Más de $50,000 USD") fallan en las 44 páginas. Hace falta una excepción explícita (p. ej. nodos bajo `[data-quote-budget]`) o renderizar las opciones desde `<template>` (`textStream` salta `template`, `:72`). Decidirlo en G8, no esquivarlo. |
| WhatsApp | `scripts/check-seo.mjs:85-93`, `:164-186` | todo `wa.me` lleva texto; cada página indexable usa su `secondaryCta.waMessage`; mensajes propios únicos (los presentes en todas las páginas cuentan como globales). | El enlace de WhatsApp del modal/éxito: o mensaje global idéntico en todas, o generado en JS (fuera del HTML). Las landings con `noindex` quedan fuera de la exigencia de mensaje propio. |
| Enlaces del cuerpo | `check-seo.mjs:135`, `:158` | enlace en `<main>` a página no construida = FAIL. | El disparador sin JS debe apuntar a una ruta construida (p. ej. `/contacto/#cotizar`), no a `/cotizar/` si no existe. |
| Pendientes | `scripts/check-pendientes.mjs:19-27`, `:50`, `:53` | falla `href="#"` y textos `TODO`, `XX`, `[VALIDAR`… también en `placeholder`. | El disparador no puede ser `href="#"`; los placeholders del formulario no deben llevar "XX" (p. ej. máscara de teléfono). |
| Contenido | `scripts/check-contenido.mjs` (`mainText` excluye `dialog`, ~`:30`) | palabras mínimas y similitud Jaccard ≤ 0.35 entre hermanas. | El modal debe vivir en `<dialog>` (o fuera de `<main>`); si cae en `<main>` sube la similitud entre todas las páginas. |
| Indexación | `src/lib/indexacion.mjs` (`isNoindex`), `astro.config.mjs:17,46-47`, `src/lib/llms.ts:55,67,166` | `indexable:false` → `noindex,follow`, fuera de sitemap.xml y llms. | Las landings ocultas deben llevar `indexable:false` en `sitemap.json`. **Pero** `indice.json.ts:35` y `heroKit.builtRelated` no filtran noindex: hay que excluirlas a mano. |
| Escenas/contraste | `scripts/check-escenas.mjs`, `check-contraste.mjs`, `check.mjs` (`--only /,/discovery/` como ejemplo) | se corren por ruta. | Agregar `/power-session/`, `/agendar/confirmado/` y el modal abierto a las corridas de Verificar. |

---

## 4. Lo que debe conservar "Discovery"

1. **La landing `/discovery/`**: `src/pages/discovery/index.astro`, `ConversionTemplate.astro`, `src/content/paginas/discovery.json`, su entrada de `sitemap.json` (pasa a `indexable:false`, sale de nav/footer/⌘K/related), placas `discovery-*`, VSL, FAQ D01–D06 en `faq.json` (`pages: ['/discovery/']`), JSON-LD `Offer` precio 0, encabezado reducido (`BaseLayout.astro:67`, `Header.astro:20-21`). Su CTA deja de ir a `SITE.agenda` y pasa al flujo de reserva portado (ancla en la propia página + `/agendar/confirmado/`).
2. **La nueva `/power-session/`** (hoy no existe; fuente en `materiales/v2/landings/power-session-fuente.md`): misma plantilla de conversión, encabezado reducido, reserva + pago Stripe.
3. **Constantes**: `SITE.discovery` (ruta de la landing) se queda; `SITE.agenda` queda solo como respaldo mientras el flujo portado no esté en producción.
4. **Atribución R10**: `cta_discovery_click` / `agenda_click` siguen valiendo dentro de las landings (tráfico de campañas); se agregan eventos de cotización.
5. **Todo lo demás pierde "Discovery"** como siguiente paso visible: CTA, microcopias, "Primer paso" de `EntitySheet`, ruta de `/contacto/`, FAQ G11/N07 y las respuestas que remiten a la Discovery, `llms.ts:35`, mega menú "Planes…", mapa del footer, ⌘K, `internalLinks`, metaDescription de `/contacto/`. Las líneas "Lo vemos en 30 minutos" de los cierres también, porque prometen la llamada de 30 minutos.

---

## 5. Grupos de cambio seguros por dueño (CONVENCIONES "Dueños de archivos")

**G0 · Decisiones previas (orquestador con el cliente).** (a) Contrato del disparador: `<a class="btn" href="/contacto/#cotizar" data-primary data-quote data-section="…">Cotizar proyecto</a>`, que el JS abre como modal (sin JS lleva al formulario en `/contacto/`). (b) ¿El secundario EaK se queda? El pedido dice "todos los CTA"; el formulario ya cierra por WhatsApp y correo. (c) Microcopia bajo el botón sin promesa de tiempo ni cifras (prohibido "24-48 h" del `/cotiza` de v1). (d) Destino de `/cotiza`: hoy 301 → `/discovery/`; debería ir a la cotización. (e) Mapeo de campos a Kommo (pipeline, etapa, campos personalizados, etiquetas, fuente/UTM) y nombres de variables de entorno (el token solo en Vercel).

**G1 · Orquestador (datos y plataforma).** `src/lib/site.ts` (`SITE.quote` {label "Cotizar proyecto", href fallback}, `SITE.power` `/power-session/`, rutas API); `src/data/sitemap.json` (44 `primaryCta` → cotizar, todas menos `discovery`; `discovery` `indexable:false`; nueva entrada `power-session` `indexable:false`, grupo propio; quitar `/discovery/` de `internalLinks`; metaDescription de `/contacto/`); `src/data/navegacion.json` (`actions[0]`, `mobileStickyBar`, `footerLinks` "Planes…" → cotizar, quitar `/discovery/` del footer); `src/lib/llms.ts:35`; `src/scripts/main.ts` (init del modal/reserva); `vercel.json` + `redirects.json` (`/cotiza`); `astro.config.mjs` / `package.json` solo si las funciones lo exigen; `tokens.css` solo si hace falta un token. Documentación: `CONVENCIONES.md:51` y ESPEC §0.1-4, §2.9, §4.1, §4.6, §5.11, §5.12, §12.2 R10.

**G2 · ui (modal de cotización).** Nuevo `src/components/ui/QuoteDialog.astro` (`<dialog>`, cristal de `tokens.css`, campos del formulario de referencia enriquecidos, éxito con WhatsApp y correo, sin promesa de tiempo), `src/scripts/ui/quote.ts` (apertura desde `[data-quote]`, validación, envío, `utm`/`src`, eventos `quote_open`/`quote_submit`), estilos en `ui.css`; `Btn.astro` (prop `quote` y micro nueva), `ui-data.ts:9` (`QUOTE_MICRO`), `EntitySheet.astro:51,89`, `EditorNote.astro:15`, `ui.ts:527-551` (atribución también para el modal). Página de prueba en `src/pages/dev/ui.astro`.

**G3 · nav.** `Header.astro:20-21,64-67` (cotizar; reducido = ancla de reserva en ambas landings), `BaseLayout.astro:67` (reducido para `/discovery/` y `/power-session/`; montar `QuoteDialog` una vez cuando la nav es completa), `MobileCTABar.astro:14`, `MobileMenu.astro:115-124`, `SearchDialog.astro:35-36` + `scripts/nav/search.ts:188-190`, `MegaMenu.astro:198-200` (lo da navegacion.json), `Footer.astro` (mapa sin landings), `navData.ts:30`, `src/pages/indice.json.ts:35` (excluir noindex/landings). KainPill sin cambio (WA).

**G4 · copy.** `_comun.json` (`cta.cotizar`, `cta.cotizarCorto`, `cta.cotizarMicro`, textos del formulario, errores y éxito); 42 JSON de página (todos salvo `discovery.json`): `ctaPrimary` de `hero`/`cta-final`/`cta-medio`/`no-se` (84 claves; las 3 de `discovery.json` pasan a la reserva), `cta-final.micro` (19), cierres "en 30 minutos" (40) y textos que remiten a la Discovery (77 claves; §2.2); `contacto.json` (rutas: cotizar + WhatsApp + correo; sección `#cotizar`); `src/data/faq.json` (G11, N07 y respuestas que remiten a la Discovery; quitar D01/D02/D06 de `/preguntas-frecuentes/`); `discovery.json` (CTA a la reserva); nuevo `power-session.json`.

**G5 · páginas (plantillas).** Sustituir los respaldos fijos ATDS/`/discovery/` de §1.4 por una sola fuente (`SITE.quote` + `_comun.cta`) y `data-quote` en los primarios: `HeroCtas.astro`, `HomeTemplate`, `ServiceTemplate`, `PlatformTemplate`, `IndustryTemplate`, `HubTemplate`, `CaseTemplate`, `ProductTemplate`, `MethodTemplate`, `StackTemplate`, `AboutTemplate`, `LocalTemplate`, `FaqTemplate`, `ArticleTemplate` (y `:224-225`), `ContactTemplate` (rutas + formulario en línea `#cotizar` como respaldo sin JS), `heroKit.ts:56,73-85` (sin landings en "Sigue explorando"). Landings: `ConversionTemplate.astro` (orden hero → VSL → "Reserva en 3 pasos" → resto; quitar `:389-412` hacia la agenda ext.), `src/pages/power-session/index.astro`, `src/pages/agendar/confirmado/index.astro`, bloques propios en `pages.css`/`tpl/*.css`.

**G6 · Reserva portada (área nueva; la asigna el orquestador).** Funciones de Vercel equivalentes a `riklanderos-web/app/api/agenda/{disponibilidad,reservar,conectar,limpiar}/route.ts` y `app/api/lead/route.ts`, con la lógica de `lib/agenda/{booking,google,stripe,leads,connect,config}.server.ts` y `lib/booking-link.ts`/`lib/sessions.ts`; componente vanilla TS (`src/components/booking/*.astro` + `src/scripts/booking/*.ts`) que replica `components/agenda/BookingFlow.tsx` (3 pasos, disponibilidad de Google Calendar en vivo, Stripe para Power Session) y `/agendar/confirmado`. Reusar nombres de entorno: `DISCOVERY_CALENDAR_ID`, `POWER_CALENDAR_ID`, `STRIPE_SECRET_KEY`, `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (+ credenciales de Google que use `google.server.ts`). Verificar en el deploy que el sitio estático de Astro sirva funciones `api/` sin adaptador.

**G7 · API de cotización (mismo dueño que G6).** Función `api/cotizar` → Kommo (contacto + lead + nota con todos los campos, UTM y `src`), validación y anti-spam (honeypot/tiempo), sin guardar datos en la URL; token y subdominio de Kommo solo como variables de entorno que el cliente configura en Vercel.

**G8 · Guardas y QA (orquestador).** `check-cifras.mjs` (excepción explícita para los rangos de presupuesto del formulario; micro nueva), `check-seo.mjs` (WhatsApp del modal; landings noindex y fuera de sitemap/llms/indice/related), `check-pendientes.mjs` (placeholders), guarda nueva de CTA (etiqueta + `data-quote` fuera de landings; reserva dentro), corridas de `check-escenas`/`check-contraste` con las rutas nuevas y el modal abierto.

**G9 · imágenes.** Placas de `/power-session/` (Kain blanco de cuerpo completo; o reuso de `discovery-*` declarado en `plates.json`/fichas) y captura de móvil/escritorio del modal.

**Orden sugerido:** G0 → G1 → (G2 ∥ G3 ∥ G4) → G5 → (G6 ∥ G7) → G8 → G9 → Verificar (`astro build` solo ahí). G2/G3/G5 dependen del contrato `data-quote` de G0/G1; G5 de landings depende de G6.

---

## Anexo A · Rastreo por página (dev server, 2026-10-20)

Columnas de cromo: Encabezado, Barra móvil, Hoja móvil y ⌘K muestran etiqueta → destino; "Mega Planes" es el enlace de precio del mega menú; "Footer mapa" es el enlace "Discovery Session" del mapa del sitio.

| URL | nav | Primarios en <main> (n · secciones) | etiqueta → destino | WA en <main> | Encabezado | Barra móvil | KainPill | Hoja móvil | ⌘K | Mega "Planes" | Footer mapa | Enlaces de cuerpo a /discovery/ | "Discovery" texto main / body | FAQ visibles con "Discovery" | robots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / | completo | 2 · hero, cta-final | ATDS → /discovery/ | 4 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | #faq (“Discovery Session”) | 9 / 15 | 3 | index,follow |
| /servicios/ | completo | 3 · hero, no-se, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 8 / 14 | 3 | index,follow |
| /servicios/consultoria-ia-empresas/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 8 / 14 | 3 | index,follow |
| /servicios/agentes-ia-whatsapp/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 5 / 11 | 1 | index,follow |
| /servicios/crm-con-ia/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 5 / 11 | 1 | index,follow |
| /kommo/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 6 / 12 | 1 | index,follow |
| /gohighlevel/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 5 / 11 | 1 | index,follow |
| /servicios/automatizacion-n8n/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 6 / 12 | 2 | index,follow |
| /servicios/paid-media/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 6 / 12 | 2 | index,follow |
| /servicios/paginas-web/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 5 / 11 | 2 | index,follow |
| /servicios/desarrollo-software/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 6 / 12 | 2 | index,follow |
| /servicios/seo/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 6 / 12 | 2 | index,follow |
| /servicios/branding/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 5 / 11 | 1 | index,follow |
| /industrias/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 7 / 13 | 3 | index,follow |
| /industrias/salud/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 5 / 11 | 1 | index,follow |
| /industrias/belleza-estetica/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 1 | index,follow |
| /industrias/nutricion/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 4 / 10 | 1 | index,follow |
| /industrias/finanzas/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 1 | index,follow |
| /industrias/inmobiliario/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 1 | index,follow |
| /industrias/industrial-logistica/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 5 / 11 | 2 | index,follow |
| /industrias/retail-ecommerce/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 5 / 11 | 2 | index,follow |
| /industrias/horeca/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 4 / 10 | 1 | index,follow |
| /casos/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 2 / 8 | 0 | index,follow |
| /casos/clinica-dental-monterrey/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | index,follow |
| /casos/retail-multimarca-kommo/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | noindex,follow |
| /casos/ecommerce-cdmx-costo-por-lead/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | noindex,follow |
| /casos/horeca-roas/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | noindex,follow |
| /casos/logistica-n8n/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | noindex,follow |
| /kain/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 7 / 13 | 1 | index,follow |
| /metodologia/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 7 / 13 | 2 | index,follow |
| /tecnologias/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 3 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | index,follow |
| /nosotros/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 4 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | #ficha (“Discovery Session”) | 5 / 11 | 2 | index,follow |
| /agentes-ia-guadalajara/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 5 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | #ficha (“Discovery Session”) | 9 / 15 | 4 | index,follow |
| /preguntas-frecuentes/ | completo | 1 · cta-final | ATDS → /discovery/ | 4 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | #empezar (“Qué pasa en la Discovery Session Qué r”) | 15 / 21 | 9 | index,follow |
| /blog/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 2 / 8 | 0 | index,follow |
| /blog/cuanto-cuesta-agente-ia-whatsapp-mexico/ | completo | 2 · cta-medio, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 7 / 13 | 3 | index,follow |
| /blog/kommo-vs-gohighlevel/ | completo | 2 · cta-medio, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | index,follow |
| /blog/agente-ia-whatsapp-vs-chatbot/ | completo | 2 · cta-medio, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | index,follow |
| /blog/como-verificar-partner-oficial-kommo/ | completo | 2 · cta-medio, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 4 / 10 | 1 | index,follow |
| /blog/gohighlevel-en-espanol/ | completo | 2 · cta-medio, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | index,follow |
| /blog/n8n-vs-zapier-vs-make/ | completo | 2 · cta-medio, cta-final | ATDS → /discovery/ | 2 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 3 / 9 | 0 | index,follow |
| /discovery/ | reducido | 3 · hero, despues, cta-final | AMDS → agenda ext. | 2 | AMDS → agenda ext. | — | — | — | — | — | “Discovery Session” | — | 6 / 8 | 0 | index,follow |
| /contacto/ | completo | 2 · hero, cta-final | ATDS → /discovery/ | 5 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | #rutas (“Agendar: Discovery Session →”) | 6 / 12 | 0 | index,follow |
| /aviso-privacidad/ | completo | 0 | — | 1 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 0 / 6 | 0 | index,follow |
| /404/ | completo | 0 | — | 1 | ATDS → /discovery/ | ATDS → /discovery/ | sí | ATDS → /discovery/ | ATDS → /discovery/ | → /discovery/ | “Discovery Session” | — | 0 / 6 | 0 | noindex,follow |
