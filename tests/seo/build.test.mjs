// Ejecutar después de npm run build: comprueba los artefactos reales de Astro y @astrojs/sitemap.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML, find, findAll } from '../../scripts/_html.mjs';

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]));
const xml = locations(read('dist/sitemap-index.xml')).flatMap((u) => locations(read(`dist${u.pathname}`)));
const urls = xml.map((u) => u.pathname);
const full = read('dist/llms-full.txt');
const llms = read('dist/llms.txt');
const pages = JSON.parse(read('src/data/sitemap.json'));

for (const slug of ['retail-multimarca-kommo', 'ecommerce-cdmx-costo-por-lead', 'horeca-roas', 'logistica-n8n']) {
  test(`${slug}: sitemap, robots, canonical y exportación breve coherentes`, () => {
    const route = `/casos/${slug}/`;
    const p = pages.find((p) => p.url === route);
    const copy = JSON.parse(read(`src/content/paginas/${p.id}.json`));
    const root = parseHTML(read(`dist${route}index.html`));
    const head = find(root, (n) => n.tag === 'head');
    const meta = (name) => findAll(head, (n) => n.tag === 'meta' && n.attrs.name === name);
    assert.equal(urls.filter((u) => u === route).length, 1);
    assert.equal(meta('robots')[0].attrs.content, 'index,follow,max-image-preview:large');
    assert.equal(find(head, (n) => n.tag === 'link' && n.attrs.rel === 'canonical').attrs.href, `https://ingeniak.mx${route}`);
    assert.equal(meta('google-site-verification').length, 1);
    assert.equal(meta('google-site-verification')[0].attrs.content, 'o2wBitvRnS8xvYel800kz9ZlhQ7gLCexN1MLIFqX_E0');
    assert.ok(llms.includes(`https://ingeniak.mx${route}`));
    const block = full.split('\n---\n').find((b) => b.includes(`URL: https://ingeniak.mx${route}\n`));
    assert.ok(block, 'caso presente en llms-full');
    assert.ok(block.includes(copy.sections.ficha.deckBreve));
    for (const id of ['punto-partida', 'implementacion', 'resultado', 'vktor', 'testimonio']) {
      assert.equal(find(root, (n) => n.attrs.id === id), null, `no publicar sección ${id}`);
    }
    for (const node of copy.sections.implementacion?.nodes ?? []) {
      if (node.confirmed === false && node.line) assert.ok(!block.includes(node.line), 'no exportar implementación sin confirmar');
    }
  });
}

test('sitemap sigue excluyendo 404, demos y landings ocultas', () => {
  for (const route of ['/404/', '/discovery/', '/power-session/', '/agendar/confirmado/']) assert.ok(!urls.includes(route), route);
  assert.ok(urls.every((route) => !route.startsWith('/dev/')));
  assert.equal(urls.length, 44);
});
