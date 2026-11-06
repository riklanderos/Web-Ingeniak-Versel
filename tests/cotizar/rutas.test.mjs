// El mapa ruta → page.id de server/cotizar.js no se desfasa de src/data/sitemap.json (etiqueta pagina-<id>).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cargar } from './_util.mjs';

const { cotizar } = await cargar();

test('rutas · cada página de sitemap.json tiene su page.id en RUTAS', () => {
  const sitemap = JSON.parse(readFileSync(new URL('../../src/data/sitemap.json', import.meta.url), 'utf8'));
  const paginas = Array.isArray(sitemap) ? sitemap : (sitemap.pages ?? Object.values(sitemap));
  const faltan = [];
  for (const p of paginas) {
    if (!p?.url || p.url === '/404' || p.id === '404') continue;
    const id = cotizar.pageIdFrom(p.url);
    const derivado = p.template === 'T-ARTICLE' && id === `art-${p.url.split('/').filter(Boolean).pop()}`;
    if (id !== p.id && !derivado) faltan.push(`${p.url} → ${p.id} (RUTAS da ${id})`);
  }
  assert.deepEqual(faltan, [], 'actualiza RUTAS en server/cotizar.js');
});

test('rutas · las landings ocultas también se reconocen', () => {
  assert.equal(cotizar.pageIdFrom('/discovery/'), 'discovery');
  assert.equal(cotizar.pageIdFrom('/power-session/'), 'power-session');
  assert.equal(cotizar.pageIdFrom('/agendar/confirmado/?session_id=cs_test'), 'agendar-confirmado');
});
