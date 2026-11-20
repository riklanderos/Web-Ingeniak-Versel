// Entrada de `node --test tests/analytics/` (igual que tests/cotizar/index.js): importa cada `*.test.mjs` de la carpeta.
import { readdirSync } from 'node:fs';
import test from 'node:test';

const dir = new URL('./', import.meta.url);
for (const f of readdirSync(dir).filter((x) => x.endsWith('.test.mjs')).sort()) {
  try {
    await import(new URL(f, dir).href);
  } catch (error) {
    test(`${f} · no se pudo cargar`, () => {
      throw error;
    });
  }
}
