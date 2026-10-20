// scripts/check.mjs — corre todas las guardas del build (ESPEC-v2 §8.6 y §12.2 R2, R8, R9) y falla si alguna falla.
//   npm run check                                   → revisa dist/**/*.html (corre solo después de "astro build": postbuild)
//   npm run check -- --url http://127.0.0.1:4321    → revisa las rutas de sitemap.json que responden 200 en el servidor de desarrollo
//   npm run check:release                           → además, los avisos y las puertas del cliente son fatales (lanzamiento)
//   --only /,/discovery/                            → solo esas rutas
//   --dev                                           → también las páginas de demostración (/dev/*; no salen en producción)
// check-cta (CAMBIO-COTIZAR §6.2): un solo modal #cotizar, primario "Cotizar proyecto" en las públicas, reserva directa en las
// landings ocultas y ningún enlace público hacia ellas.
// Tres niveles: ✗ fallo (rompe el build) · ! aviso (algo nuestro por cerrar antes de lanzar) · ◇ puerta del cliente
// (copy en borrador, caso sin confirmar: no rompe el build; solo --release la vuelve fatal).
// Las guardas de escena (check-escenas.mjs) y de contraste (check-contraste.mjs) usan Chrome y el servidor de desarrollo:
// se corren aparte (npm run check:escenas / check:contraste) porque el build de producción no levanta navegador.
import { parseArgs } from './_html.mjs';
import { run as cifras } from './check-cifras.mjs';
import { run as seo } from './check-seo.mjs';
import { run as pendientes } from './check-pendientes.mjs';
import { run as pesos } from './check-pesos.mjs';
import { run as contenido } from './check-contenido.mjs';
import { run as cta } from './check-cta.mjs';

const opts = parseArgs();
console.log(`[check] ${opts.url ? `servidor ${opts.url} (rutas de sitemap.json con 200)` : `build ${opts.dist}`}${opts.release ? ' · modo --release (avisos y puertas del cliente fatales)' : ''}`);
const results = [];
for (const [name, fn] of [['cifras', cifras], ['seo', seo], ['pendientes', pendientes], ['pesos', pesos], ['contenido', contenido], ['cta', cta]]) {
  try { results.push(await fn(opts)); }
  catch (e) { console.error(`\n[check-${name}] ERROR · ${e.message}`); results.push({ name: `check-${name}`, fails: 1, warns: 0, gates: 0 }); }
}
const fails = results.reduce((a, r) => a + r.fails, 0);
const warns = results.reduce((a, r) => a + r.warns, 0);
const gates = results.reduce((a, r) => a + (r.gates ?? 0), 0);
console.log(`\n[check] ${fails ? 'FALLA' : 'OK'} · ${results.map((r) => `${r.name.replace('check-', '')} ${r.fails ? '✗' + r.fails : '✓'}${r.warns ? ' !' + r.warns : ''}${r.gates ? ' ◇' + r.gates : ''}`).join(' · ')} · total ${fails} fallo(s), ${warns} aviso(s), ${gates} puerta(s) del cliente`);
process.exit(fails ? 1 : 0);
