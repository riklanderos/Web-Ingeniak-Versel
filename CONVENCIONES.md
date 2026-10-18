# Convenciones de construcción · Ingeniak v2

**Fuente única de verdad del diseño:** `materiales/v2/ESPEC-v2.md` (léela completa antes de escribir código; §12 manda sobre el resto).
Datos de páginas: `src/data/sitemap.json` (= `D-sitemap.json` con §0.3 aplicado). Navegación: `src/data/navegacion.json`. Plan de imágenes: `materiales/v2/IMAGENES-v2.json`. Receta Magnific: `materiales/magnific/v2/RECETA.md`.

## Stack (versiones exactas, ya instaladas)
astro 5.18.2 · @astrojs/mdx 4.3.13 · @astrojs/sitemap 3.6.0 · gsap 3.13.0 (ScrollTrigger, SplitText, Flip incluidos) · lenis 1.3.11 · sharp 0.34.4 (dev).
Importa GSAP desde npm: `import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import { SplitText } from 'gsap/SplitText'; import { Flip } from 'gsap/Flip';`. Lenis: `import Lenis from 'lenis'`. **No** uses CDNs ni `vendor/`. **No** ClientRouter de Astro (MPA puro).

## Servidor de desarrollo compartido
Ya corre en `http://127.0.0.1:4321` (lo levantó el orquestador). **No arranques otro servidor ni ejecutes `astro build`** durante la fase de construcción (varios agentes comparten la carpeta y `.astro/`). Para comprobar tu trabajo:
- Abre tu página de demostración en `src/pages/dev/<área>.astro` (`/dev/<área>/`, con `<meta name="robots" content="noindex">`).
- Captura con Chrome sin ventana: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 --virtual-time-budget=5000 --screenshot=<archivo>.png <url>`.
- Para móvil, `--window-size=390,844` NO activa las media queries en esta Mac: abre `http://127.0.0.1:4321/dev-movil.html?u=<ruta>` (un iframe de 390 × 844; `&w=360&h=740` para otros tamaños) con `--window-size=400,860` o usa el script de la skill: `node "/Users/riklanderos/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/c7d688a6-6101-4e0f-9984-451980167276/4e9ab291-8e15-4c8d-88db-e8df3152177e/skills/ruva-web-pro/scripts/revisar-sitio.mjs" <url> <carpeta>` (emula 375 × 812 y 1440 × 900 bien).
- Mira tus capturas (Read) y corrige antes de terminar. Lee también la consola del servidor si algo falla (el dev server muestra errores en la página).

## Dueños de archivos (no edites lo que no es tuyo)
| Área | Archivos |
|---|---|
| **nav** | `src/layouts/BaseLayout.astro`, `src/components/layout/*` (SEOHead, BaseLayout helpers), `src/components/nav/*` (Header, MegaMenu, MobileMenu, SearchDialog, Footer, Breadcrumbs, SceneRail, MobileCTABar, KainPill), `src/styles/nav.css`, `src/scripts/nav.ts`, `src/pages/indice.json.ts`, `src/pages/dev/nav.astro` |
| **cine** | `src/components/cine/*` (ImageSection, ColdOpen, SharedTake, TwinScene, PlateSequence, Dawn, Intertitle, FigCaption, LightBranch, Montage, LocationSwitcher, CaseFigure, DayTimeline, GhostWord), `src/styles/cine.css`, `src/scripts/cine.ts`, `src/scripts/shots/*`, `src/pages/dev/cine.astro` |
| **ui** | `src/components/ui/*` (Btn, Metric, SumarioCover, ScriptList, Still, ResultsLedger, ChatSim, ProductWindow, PainList, TwoColumnScript, VktorRail, SystemFlow, DefinitionBlock, FAQAccordion, EntitySheet, Credits, KommoBadge, EditorNote, Icon), `src/components/content/*` (Prose, AuthorCard, VideoPoster), `src/icons/sprite.svg`, `src/styles/ui.css`, `src/scripts/ui.ts`, `src/pages/dev/ui.astro` |
| **copy** | `src/content/paginas/*.json`, `src/content/paginas/_ESQUEMA.md`, `src/data/faq.json`, `src/data/chats/*.json` |
| **imágenes** | `src/assets/cine/<placa>.jpg` y `<placa>-m.jpg`, `materiales/v2/placas/<placa>.json` (ficha de registro), `materiales/magnific/v2/<placa>/` (candidatas) |
| **páginas** (fase 2) | `src/components/templates/<Plantilla>.astro`, `src/pages/**` de su página, `src/styles/pages.css` solo con un bloque `/* ===== <plantilla> ===== */` propio |
| **orquestador** | `src/styles/tokens.css`, `src/lib/*`, `src/data/sitemap.json`, `src/data/navegacion.json`, `src/data/plates.json`, `src/scripts/main.ts`, `scripts/plates.mjs`, `astro.config.mjs`, `package.json` |

Si necesitas algo de un archivo que no es tuyo, **no lo edites**: escríbelo en `materiales/v2/build/peticiones.md` (área, archivo, qué y por qué) y sigue con un respaldo local.

## Estilos
- `src/styles/tokens.css` ya trae tokens, base, retícula, escala tipográfica (`.t-*`), cristal (`.glass-chip`, `.glass-panel`, `.solid`), botones (`.btn`, `.btn--ghost`, `.btn--sm`, `.btn-icon`, `.ctas`, `.cta-p`), enlaces (`.lnk`), chips (`.chip-spec`, `.chip-sim`, `.chip-illus`), `.kain-mark`, `.node`, `.dot-live`. **Úsalos; no los redefinas.**
- Cada área escribe sus clases **globales** en su archivo `src/styles/<área>.css` (BaseLayout los importa todos, en este orden: tokens, nav, cine, ui, content, pages). Usa los nombres de clase de la ESPEC (p. ej. `.is`, `.is__layer`, `.stage`, `.anchor`). En los `.astro` evita `<style>` con ámbito salvo casos muy locales (`<style is:global>` prohibido fuera de tu archivo de área).
- Solo `body` pinta fondo. Ninguna sección lleva `background` (regla §3.11).

## JavaScript
- Punto de entrada: `src/scripts/main.ts` (del orquestador) llama a `initNav()`, `initUI()` e `initCine()`. Cada área exporta su `init*()` desde su archivo y puede dividirse en módulos propios (`src/scripts/<área>/*.ts` o `src/scripts/shots/*.ts`) con `import()` dinámico.
- Ganchos por atributos `data-*` en el HTML (`data-shot`, `data-primary`, `data-reveal`, `data-split`, `data-metric`, `data-still`, `data-faq`, `data-chat`…), nunca JS por elemento.
- **Lenis lo crea solo `cine.ts`** y lo expone en `window.__lenis` (para que nav pueda `stop()/start()` con menús). nav escucha/usa `window.__lenis?.stop()`.
- Todo estado oculto para animar se aplica con `gsap.set` o bajo `html.js` (BaseLayout cambia `no-js` → `js` en el `<head>`). Con `prefers-reduced-motion` o `html[data-motion="reduced"]`: todo visible y quieto, mismo contenido.
- Sin GSAP Club extras distintos a los incluidos en 3.13.0 (todos son gratis: SplitText, Flip, ScrollTrigger). Nada de DrawSVG ni MorphSVG.

## Datos y contenido
- `import { getPage, getCopy, getPlate, section, waHref, SITE } from '../lib/site'` y `import { METRICS, SOURCE_NOTE, PRICE_FROM } from '../lib/metrics'`.
- **Cifras:** solo con `<Metric id="…" />` (área ui) → escribe `data-metric`. Nunca escribas a mano 3.2×, −58 %, +340 %, etc.
- **Texto publicable:** `src/content/paginas/<page.id>.json` (lo escribe el área copy; su esquema en `_ESQUEMA.md`). Los componentes de página leen de ahí; los `spec` de `sitemap.json` son briefs, no texto final.
- **Placas:** `getPlate(id)` lee `src/data/plates.json` (el orquestador fusiona las fichas de `materiales/v2/placas/*.json`). Si una placa todavía no existe, `ImageSection` debe renderizar igual (usa `plate.launchFallback` del sitemap o, si no hay, un aura del isotipo con la misma penumbra) y avisar en consola en dev.
- Rutas de imágenes publicadas: `/img/cine/<placa>-<w>.(avif|webp)`, móvil `-m-<w>`, `-still-<w>`, `-rack-320.webp`, `-cut-<w>.webp` (las genera `node scripts/plates.mjs`).
- Logos de herramientas: `public/img/logos/*.svg` (pintar con máscara `currentColor`). Sello Kommo: `public/img/logos/kommo-partner.webp` (y originales en `materiales/logos-software/`). Fotos del equipo: `public/img/equipo/*.webp`. Kain recortes/clips: `public/img/kain/*`, `public/video/kain-*.webm`. Videos de motion: `public/video/sistema-*`, `kain-chat.*`, `discovery-vsl-720.mp4`.

## Reglas de marca (no negociables, ESPEC §0.1)
Kain blanco, cuerpo completo; logotipo **kain** en minúsculas. Un solo CTA primario azul: "Agenda tu Discovery Session" → `/discovery/` (en `/discovery/` va directo a `https://agenda.ingeniak.tech/discovery/agendar`). Secundario: "Escríbele a Kain" (WhatsApp, `.btn--ghost`). Precio solo `PRICE_FROM`. Sin testimonios, clientes, premios ni cifras inventadas. Kommo es el único partner. Ámbar solo para dolor. Sin Victor Ocampo. Español de México, tuteo.
