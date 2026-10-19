// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { isNoindex } from './src/lib/indexacion.mjs';

// sitemap.xml = páginas indexables sin puerta pendiente (ESPEC-v2 §8.6 y §12.2 R2/R8): fuera el 404, /dev/ y toda
// página con noindex (p. ej. un caso breve mientras su copy no marque publishGate.ok). Misma regla que llms.txt y check-seo.
const pages = JSON.parse(readFileSync(new URL('./src/data/sitemap.json', import.meta.url), 'utf8'));
const copyOf = (/** @type {string} */ id) => {
  const u = new URL(`./src/content/paginas/${id}.json`, import.meta.url);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null;
};
const NOINDEX = new Set(pages.filter((/** @type {any} */ p) => isNoindex(p, copyOf(p.id))).map((/** @type {any} */ p) => p.url));

// Páginas de demostración (src/pages/dev/*.astro y public/dev-movil.html): sirven en el servidor de desarrollo y se quitan
// de dist al terminar el build de producción (QA ronda 2). INGENIAK_DEV_PAGES=1 las conserva (p. ej. un preview interno).
const DEMOS = ['dev', 'dev-movil.html'];
/** @returns {import('astro').AstroIntegration} */
function sinDemos() {
  return {
    name: 'ingeniak:sin-demos',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        if (process.env.INGENIAK_DEV_PAGES === '1') return;
        const root = fileURLToPath(dir);
        for (const d of DEMOS) {
          const p = join(root, d);
          if (existsSync(p)) { rmSync(p, { recursive: true, force: true }); logger.info(`fuera del build de producción: /${d}`); }
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://ingeniak.mx',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { defaultStrategy: 'hover' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !path.startsWith('/404') && !path.startsWith('/dev/') && !NOINDEX.has(path);
      },
    }),
    sinDemos(),
  ],
  devToolbar: { enabled: false },
});
