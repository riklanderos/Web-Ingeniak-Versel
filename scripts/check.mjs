// scripts/check.mjs — corre todas las guardas del build (ESPEC-v2 §8.6 y §12.2 R2, R8, R9) y falla si alguna falla.
//   npm run check                                   → revisa dist/**/*.html (corre solo después de "astro build": postbuild)
//   npm run check -- --url http://127.0.0.1:4321    → revisa las rutas de sitemap.json que responden 200 en el servidor de desarrollo
//   npm run check:release                           → además, los avisos son fatales (enlaces a páginas sin construir, copy no aprobado…)
//   --only /,/discovery/                            → solo esas rutas
// Pendiente (puerta de QA, ESPEC §8.6): check-escenas.mjs (R3/R4) y check-contraste.mjs.
import { parseArgs } from './_html.mjs';
import { run as cifras } from './check-cifras.mjs';
import { run as seo } from './check-seo.mjs';
import { run as pendientes } from './check-pendientes.mjs';
import { run as pesos } from './check-pesos.mjs';
import { run as contenido } from './check-contenido.mjs';

const opts = parseArgs();
console.log(`[check] ${opts.url ? `servidor ${opts.url} (rutas de sitemap.json con 200)` : `build ${opts.dist}`}${opts.release ? ' · modo --release (avisos fatales)' : ''}`);
const results = [];
for (const [name, fn] of [['cifras', cifras], ['seo', seo], ['pendientes', pendientes], ['pesos', pesos], ['contenido', contenido]]) {
  try { results.push(await fn(opts)); }
  catch (e) { console.error(`\n[check-${name}] ERROR · ${e.message}`); results.push({ name: `check-${name}`, fails: 1, warns: 0 }); }
}
const fails = results.reduce((a, r) => a + r.fails, 0);
const warns = results.reduce((a, r) => a + r.warns, 0);
console.log(`\n[check] ${fails ? 'FALLA' : 'OK'} · ${results.map((r) => `${r.name.replace('check-', '')} ${r.fails ? '✗' + r.fails : '✓'}${r.warns ? ' !' + r.warns : ''}`).join(' · ')} · total ${fails} fallo(s), ${warns} aviso(s)`);
process.exit(fails ? 1 : 0);
