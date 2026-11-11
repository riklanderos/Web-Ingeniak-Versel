import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gatePending, isNoindex } from '../../src/lib/indexacion.mjs';

const page = { template: 'T-CASE', indexable: true, publishGate: { required: ['ficha'] } };
const brief = { publishGate: { ok: false, indexBrief: true } };

test('autorizar indexación del caso breve no confirma el contenido completo', () => {
  assert.equal(gatePending(page, brief), true);
  assert.equal(isNoindex(page, brief), false);
});

test('una puerta pendiente sigue en noindex sin autorización explícita', () => {
  for (const copy of [null, { publishGate: { ok: false } }, { publishGate: { ok: false, indexBrief: 'true' } }]) {
    assert.equal(isNoindex(page, copy), true);
  }
  assert.equal(isNoindex(page, { publishGate: { ok: true } }), false);
});

test('la autorización no expone landings ocultas, 404 ni páginas no indexables', () => {
  for (const p of [null, { ...page, hidden: true }, { ...page, indexable: false }, { ...page, template: 'T-404' }]) {
    assert.equal(isNoindex(p, brief), true);
  }
});

test('los cuatro casos solicitados son indexables y conservan la puerta editorial', () => {
  const pages = JSON.parse(readFileSync(new URL('../../src/data/sitemap.json', import.meta.url)));
  for (const slug of ['retail-multimarca-kommo', 'ecommerce-cdmx-costo-por-lead', 'horeca-roas', 'logistica-n8n']) {
    const p = pages.find((p) => p.url === `/casos/${slug}/`);
    assert.ok(p, slug);
    const copy = JSON.parse(readFileSync(new URL(`../../src/content/paginas/${p.id}.json`, import.meta.url)));
    assert.equal(isNoindex(p, copy), false, slug);
    assert.equal(gatePending(p, copy), true, slug);
    assert.equal(copy.publishGate.ok, false, slug);
  }
});
