## nav

All 10 nav tasks are fixed and passed their checks. I took everything below from captures and CDP scripts on the dev server at 1440×900, 1280×720, 390×844, 360×740 and 320×640. Two follow-ups belong to other areas: the case page JSON-LD (CaseTemplate) and possibly the HUD position (cine). I did not run `astro build`.

The earlier attempt had left most fixes half-done. I kept what was correct, then finished the rest.

1. **Mega menu (blocker):** the header state is now `html[data-hdr-state]`, and the menu sheet's flag is `html[data-menu-state]`. Every script selects `header.hdr` directly. Hovering Casos and then clicking at (300,800) closes the menu within 250 ms. After that, PageDown scrolls 678 px. Opening Industrias with Enter and tabbing past its last link closes it and Lenis restarts. Esc only returns focus to the trigger when focus was in the header. The pill lines up with its trigger. No code outside nav reads the old attribute names.
2. **Transparent header:** it now leaves `top` before the first hero text reaches it (on phones as soon as y > 8). It has the 96 px scrim and stays hidden while `data-sala` is set. The #sistema eyebrow is clear at 1280×720. It stays invisible during the cold open and appears at about 3.7 s, when `cine:coldopen-end` fires. No overlaps on home at 200/450/700. On mobile: service at 60/400, industry at 420 and case at 600/1000 are clear.
3. **SceneRail:** the click area is now 32×24 px per tick, starting at x ≥ 1366. The ChatSim pause toggles 

## cine

All 23 tasks are in, but four don't fully meet their verify targets: tramo 2 of the LightBranch, the JS budget, the mobile stage pill, and the industry pin, which waits on the template. Templates now need to delete their workarounds (list posted in `peticiones.md` under "## QA · cine").

Checks run on the dev server: no console errors on the 5 pages plus 404 and `/dev/cine/`, with and without reduced motion. The cine scripts type-check clean.

**Blockers**
1. **Hidden content (task 1):** pre-reveal states now use opacity, never visibility. Focusing anything unrevealed finishes its reveal at once. Two further fixes came out of testing:
   - `ScrollTrigger.refresh()` was dropping focus to `<body>` whenever it rewrapped a pin. Focus is now restored after every refresh.
   - Focusing a #sistema station jumps the pin to that station; snap no longer overshoots (`inertia:false`).
   - Results: 0 hidden focusables on all 5 pages at 1440 and 375. 150 Tabs on home reach #sistema, #kain, Montage and #cta-final in DOM order. The only elements still at 0.96–0.98 after 400 ms belong to ui (ui fade-ins `[data-ui-reveal]`, request #18).
2. **Intro (task 2):** idempotent, with the failsafe and the coldopen guard. `/?replay` passes at 375 touch and in headless 1440. At 5 s it differs from the reduced-motion capture on only 0.22% of pixels. The home sumario fades out on scroll. The industry hero no longer has a HUD.
3. **Mobile cutout (task 3):** one Kain on #vktor, and phones make no `-cut-` r

## ui

Reporte final del área ui (Ingeniak v2):

**Arreglado y verificado**
1. **Entradas y FAQ.**
   - Los estados previos usan solo opacidad y desplazamiento, nunca `visibility`. Lo que anima cine no se pre-oculta y el foco termina la entrada.
   - Nuevo barrido: si un salto de scroll deja un bloque arriba de la pantalla, el bloque se muestra.
   - El FAQ llega plegado bajo `html.js`, sin transición al arrancar (`.is-anim` se pone un cuadro después) y sin respuestas abiertas por defecto.
   - La pausa del chat conserva su alto aunque esté oculta, para que la barra no salte.
   - Con `ResizeObserver` sobre `main` no queda ningún salto causado por ui: los que se ven vienen de la carga de fuentes y del SplitText y los pins de cine.
   - El TwoColumnScript de /discovery/ se ve.
2. **Regla de un azul y atribución R10.** Verificado con rueda en servicio e industria (bajar a 1350 y subir 250): el CTA del encabezado sale azul y nunca hay dos azules. Probé la atribución: se guardan `ingeniak-src` y `ingeniak-utm` y sale el evento `cta_discovery_click`.
3. **ChatSim, diseño.** Conversación completa con movimiento reducido y sin JS (todos los mensajes visibles a 375). Teléfono 9:19 de máximo 320 px. Pestañas desplazables a 320 px. Barra compacta a 1280 y 1440 con la pausa dentro, y la hora con espacio duro.
4. **ChatSim, modos.** `control="external"` (sigue `cine:step` y suelta el control con `controlled:false`), `mini`, `tabsOutside`/`tabsFor` + `ChatTabs.astro`, `note`/`noteClause`, `limit

## copy

All 8 copy tasks are done. One check didn't reach zero: `grep -ri 'sin intervención humana' src` still finds one line, in `src/data/sitemap.json`. That line is the orquestador's brief for the case's implementacion section, not a copy file. I asked for it to be rewritten in `peticiones.md` (QA · copy #1). Every page returns 200. The visible FAQ text and the FAQPage JSON-LD match question for question on `/` and on the service page. No rendered page shows "pasó de", "de 8 min" or leftover `{{`.

The previous run had already done most of the work. This run kept it and fixed what was left:

- **Repairs this run:**
  - Fixed the broken indentation that removing `cta-final.lede` left in `home.json`.
  - Changed the case's implementacion lede to "…que contesta en segundos…". It said "a cualquier hora" right under an H2 that already does, and the 12 s figure backs the new wording.
  - Updated the 404 pendientes: the template now leaves out rescue routes that aren't built yet (/servicios/, /casos/, /blog/) and fills the list with pages that exist.
  - Set `actualizado` to 2026-10-19 on the three files touched.

- **Already in place and confirmed on the dev server:**
  1. All the claim fixes are in: W01, W02, G08, G11, the case implementacion, both `casos.lede`, `metricRow.title` and `industrias.footer`.
  2. Both case CTAs read exactly "Agenda tu Discovery Session".
  3. The service page has the new si-no lists, with "Lo que no hace" in muted grey instead of amber. It also has the two

## templates

I finished tasks 1–10 on all 5 pages and the 404. Two things are still open, and neither can be fixed in my files: 5 of 45 in-body links still return 404, and the closing section plus footer is still a flat dark band on every page. Task 11 is not done. No git, no build, and I only edited my own files.

**Checks run** (headless Chrome at 1440×900, 1280×720, 1920×1080, 2560×1080, 390×844 and 360×740, plus the revisar-sitio run on all 5 pages):
- **Mobile heroes:** the subject's head sits at 0.50–0.71 of the screen height at 390×844 and 0.61–0.80 at 360×740. The primary CTA is above the head on every page, and the pages no longer scroll sideways.
- **Light map:** the only stretch over 40vh left on any page, at either size, is the end of the closing section plus the footer.
- **Señales contrast:** at least 8.6:1 against the brightest background pixel at all four desktop sizes.
- **Microcopy:** no page splits "30 / minutos".

**What changed, by task:**
1. **Mobile heroes:** I kept and finished the earlier partial work. Every hero is one section: the intro, then the image, then the remaining content. I fixed the case page's row of detail chips spilling off the right edge.
2. **Home #sistema:** each station shows ui's StationUI on the part of the glass the robot doesn't cover, and the label ("01 · Atraer") and title are now separate. On mobile, each station has a small demo under its text.
3. **Flat stretches:**
   - **Every page:** a soft ambient glow in all sections without an ima

## orquestador

Ten of the twelve tasks are done. The build guards still report 6 failures, all in files owned by other areas (check-seo, check-cifras, check-pendientes and check-contenido pass). Gates for task 12 are tracked, not closed.

**What I fixed**

1. **Build guards (task 1):** all five checks, the shared HTML walker, the runner and the npm scripts work against the dev server and against `dist/`.
   - A hand-written `3.2×` in a temporary `/dev` page made check-cifras fail; a value marked with `data-metric` passed. The temporary page is deleted.
   - check-cifras now also accepts the exact fixed CTA microcopy (§2.9), so `/dev/cine/` no longer fails.
   - The guards now read the indexing rule from `src/lib/indexacion.mjs`, the same rule the sitemap filter uses.
   - The `href="#"` failure you expected no longer appears; nav has already fixed it.
2. **Broken links helper (task 2):** `isBuilt` is true for `/` and the 5 built routes, false for `/servicios/`, `/kain/` and `/aviso-privacidad/`. Templates and nav still link to 39 unbuilt routes; check-seo reports these as warnings. I asked those areas to switch to `linkTarget`.
3. **robots.txt, llms.txt, llms-full.txt (task 3):** all return 200 text/plain and list only the 4 built, indexable pages. The noindex case page is left out; its result line stays without a link.
4. **vercel.json (task 4):** valid; every redirect destination is a sitemap route and there are no chains.
5. **OG images (task 5):** six 1200×630 JPGs, 45–69 KB each. I ope