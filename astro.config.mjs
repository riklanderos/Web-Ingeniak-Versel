// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync, existsSync } from 'node:fs';
import { isNoindex } from './src/lib/indexacion.mjs';

// sitemap.xml = páginas indexables sin puerta pendiente (ESPEC-v2 §8.6 y §12.2 R2/R8): fuera el 404, /dev/ y toda
// página con noindex (p. ej. un caso breve mientras su copy no marque publishGate.ok). Misma regla que llms.txt y check-seo.
const pages = JSON.parse(readFileSync(new URL('./src/data/sitemap.json', import.meta.url), 'utf8'));
const copyOf = (/** @type {string} */ id) => {
  const u = new URL(`./src/content/paginas/${id}.json`, import.meta.url);
  return existsSync(u) ? JSON.parse(readFileSync(u, 'utf8')) : null;
};
const NOINDEX = new Set(pages.filter((/** @type {any} */ p) => isNoindex(p, copyOf(p.id))).map((/** @type {any} */ p) => p.url));

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
  ],
  devToolbar: { enabled: false },
});
