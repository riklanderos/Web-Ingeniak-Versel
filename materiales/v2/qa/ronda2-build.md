**Verification round 2: build and check against `dist`. Both pass. Nothing was fixed.**

**1) `npx astro build`** exited 0 in about 4 s. It built 9 routes, plus the sitemap, `llms.txt` and `llms-full.txt`. `/dev` and `/dev-movil.html` were correctly left out of production. The dev server on 127.0.0.1:4321 is still up (200).

`npx astro build` doesn't trigger the `postbuild` hook, so I ran the check separately. The build printed 2 warnings, both owned by the orquestador:
- **Deprecated auto-generated collections.** Astro made the `blog` and `paginas` collections itself because there is no `src/content.config.ts`. That auto-generation is deprecated.
- **Empty glob-loader matches.** `glob-loader` found no `.md`/`.mdx` files in `src/content/blog` or `src/content/paginas`. `paginas` holds `.json` files, so the auto-collection is useless. The site reads those files through `src/lib/site`.

Neither warning is listed in `lanzamiento.md` or `peticiones.md` yet.

**2) `npm run check`** exited 0: **0 failures, 4 warnings, 8 client gates.** It checked 6 pages. Every page has a unique H1, `sitemap.xml` has the expected 4 URLs and `llms.txt` links 4 pages. The cifras, pendientes, pesos and contenido guards had no failures.

**Warnings:**

| # | Guard | Warning | Owner | Status |
|---|---|---|---|---|
| 1 | seo | Header, mega menu, mobile menu and footer link to 39 planned routes that aren't built yet (404 today). | nav / orquestador (`navegacion.json`) | Kept on purpose under decision 3. Clears when the remaining pages are built. |
| 2 | seo | 10 redirect targets in `vercel.json` aren't built yet: `/servicios/consultoria-ia-empresas/`, `/servicios/crm-con-ia/`, `/kommo/`, `/servicios/automatizacion-n8n/`, `/servicios/branding/`, `/casos/`, `/metodologia/` and 3 blog posts. | orquestador | Already in `lanzamiento.md` (orquestador, item 3). Fatal under `--release`. |
| 3 | seo | 35 of 39 indexable pages still aren't built (R12 gate). | pages phase 2 (templates) + copy | Expected (decision 3): built after the client approves this round. |
| 4 | pesos | `/discovery/` VSL `discovery-vsl-720.mp4` is 12.83 MB, over the 12 MB limit (R14). | orquestador | Already in `lanzamiento.md` (orquestador, item 1). There's no `ffmpeg` on this Mac to recompress it. |

**Client gates** (these don't break the build; `--release` makes them fatal):
- **Copy still in "borrador":** `/`, `/servicios/agentes-ia-whatsapp/`, `/industrias/salud/`, `/casos/clinica-dental-monterrey/`, `/discovery/` and `/404`. Under decision 2 only the client can approve these; `estado` and `aprobadoPor` were left alone.
- **Dental case not confirmed:** `/casos/clinica-dental-monterrey/` still needs written confirmation of the case details, starting point and implementation (R2). The client has to confirm.
- **Dental case too short:** `/casos/clinica-dental-monterrey/` has 398 visible words against a 600 minimum. It's a short case marked noindex, and the full text comes back once the client confirms (R2). This is tied to the confirmation gate above.

These are all within budget:
- **Image weight:** largest is `/` at 610 KB desktop out of 3.8 MB.
- **Critical-path JS:** 20–21 KB gzip per page, with 83 KB more loaded later on demand.
- **Word counts:** every page meets its minimum except the dental case.

The Chrome-based guards (`check:escenas`, `check:contraste`) weren't part of this run, as the task asked.

Logs are in `/private/tmp/claude-501/-Users-riklanderos-Web-Ingeniak-Versel/e64796e3-3852-42c2-8549-9c83b0f55e3b/scratchpad/`:
- `build-r2.log`
- `check-r2.log`