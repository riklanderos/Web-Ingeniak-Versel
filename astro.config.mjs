// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { isNoindex } from './src/lib/indexacion.mjs';

// sitemap.xml = páginas indexables: fuera el 404, /dev/ y toda página con noindex. Los casos breves pueden
// indexarse con publishGate.indexBrief sin confirmar el reportaje completo. Misma regla que llms.txt y check-seo.
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

// Funciones de Vercel en desarrollo (CAMBIO-COTIZAR §3.8): solo en "astro dev" (apply: 'serve'; el build no cambia).
// Sirve api/**/*.js (handler web { fetch(request) }) en 127.0.0.1:4321 para que el modal de cotización y la reserva corran
// de punta a punta en local: sin VERCEL_ENV la cotización responde en simulación (dryRun) y la agenda usa sus adaptadores
// simulados (server/agenda/mock.js). Los archivos o carpetas con "_" inicial no se publican como función ni se sirven aquí.
function apiLocal() {
  return {
    name: 'ingeniak:api-local',
    apply: /** @type {const} */ ('serve'),
    configureServer(/** @type {any} */ server) {
      server.middlewares.use(async (/** @type {any} */ req, /** @type {any} */ res, /** @type {any} */ next) => {
        const { pathname } = new URL(req.url ?? '/', 'http://x');
        if (!pathname.startsWith('/api/')) return next();
        const rel = pathname.replace(/\/+$/, ''); // /api/agenda/reservar
        if (rel.split('/').some((s) => s.startsWith('_') || s === '..')) return next();
        const file = fileURLToPath(new URL(`.${rel}.js`, import.meta.url)); // ./api/agenda/reservar.js
        if (!existsSync(file)) return next();
        try {
          const mod = await server.ssrLoadModule(file);
          const h = mod.default?.fetch ? mod.default : null;
          if (!h) return next();
          /** @type {Buffer[]} */
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const method = req.method ?? 'GET';
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method,
            headers: req.headers,
            body: ['GET', 'HEAD'].includes(method) ? undefined : Buffer.concat(chunks),
          });
          const r = await h.fetch(request);
          res.statusCode = r.status;
          r.headers.forEach((/** @type {string} */ v, /** @type {string} */ k) => res.setHeader(k, v));
          res.end(Buffer.from(await r.arrayBuffer()));
        } catch (e) {
          server.config.logger.error(`[api-local] ${rel}: ${/** @type {any} */ (e)?.message}`);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end('{"ok":false}');
        }
      });
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
  vite: { plugins: [apiLocal()] },
});
