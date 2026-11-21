# English version: making components bilingual (for developers and agents)

Branch `ingk/version-ingles`. English pages live under `/en/`. They reuse the same templates. Their text comes from `src/content/paginas/en-<id>.json` and from the sitemap entries `en-<id>` (lang `"en"`). What is written in code must switch language.

## Helpers (`src/lib/i18n.ts`)

- `currentLang()` returns `'es' | 'en'` for the page currently being generated. The middleware sets it per page, and the build renders pages one at a time.
- `L({ es: '…', en: '…' })` returns the string for the current language.
- `localHref(href, lang)` maps an internal Spanish href to its English twin, keeping the `#hash`. It only maps the 8 translated pages; any other href is returned unchanged. Use it for every internal link that the code writes (not the ones that come from the en-*.json copy, which are already translated).
- `langOfPage(page)` and `langOfPath(url)`.

## Rules

1. **Never freeze text at module load.** A `const X = 'texto'` at the top of a `.ts` file, or in the frontmatter of a component, is fine only if it is computed per render.
   - Component frontmatter runs once per render, so `const label = L({...})` there is OK.
   - In `.ts` modules, turn constants that hold visible text into functions (for example `export const labelOf = () => L({...})`), or use the `byLang(es, en)` Proxy pattern in `src/components/ui/ui-data.ts`.
   - Keep the existing export names and signatures working for the Spanish pages.
2. **Spanish output must stay byte-for-byte identical.** Only add the English branch.
3. **WhatsApp prefilled messages written in code** must say, in English, that the person comes from the English site. Example: `"Hi Kain, I'm coming from the English site and want more information."`
4. **Logic keyed on Spanish strings** (labels, alt text, page ids, group names) must also accept the English case. Page ids of English pages are `en-<id>`: compare with `page.id.replace(/^en-/, '')` where the code branches on the id.
5. **Things that already switch language — do not redo them:**
   - `QUOTE` (`layout/cta.ts`) and `COMUN` / `SIM` (`ui-data.ts`).
   - `VKTOR`, `TEAM` and `COUNTRIES`.
   - Metric values and labels: `metricText` and `priceText` in `src/lib/metrics.ts`. `annotateFigures` and `tokensToText` already use them.
   - The FAQ bank (`src/data/faq-en.json`).
   - `getPlate(id).alt` (reads `src/data/plates-en.json` when present).
6. **Dates.** Use `INTL_LOCALE[currentLang()]` instead of `'es-MX'`.
7. **Verify.** A dev server runs at http://127.0.0.1:4321. Do not start another one and do not run `astro build`.
   - `curl -s http://127.0.0.1:4321/en/` (also `/en/services/`, `/en/discovery/`, `/en/contact/`, `/en/privacy/`, `/en/case-studies/multi-brand-retail-kommo/`, `/en/case-studies/logistics-n8n/`, `/en/book/thank-you/`) must return 200.
   - Grep the HTML for leftover Spanish.
   - The Spanish pages (`/`, `/servicios/`, `/discovery/`, `/contacto/`, `/aviso-privacidad/`, `/casos/retail-multimarca-kommo/`) must still return 200 and look the same.
   - `npx astro check` is NOT required.
