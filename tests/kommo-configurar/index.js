// Entrada de `node --test tests/kommo-configurar/`: en Node 24 una carpeta como argumento se carga como módulo
// (busca index.js), así que este archivo importa cada `*.test.mjs` de la carpeta, en orden. Si uno no carga, se
// registra una prueba fallida con el motivo. `node --test tests/kommo-configurar/*.test.mjs` también funciona.
import { readdirSync } from 'node:fs';
import test from 'node:test';

const dir = new URL('./', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).sort();

for (const f of files) {
  try {
    await import(new URL(f, dir).href);
  } catch (error) {
    test(`${f} · no se pudo cargar`, () => {
      throw error;
    });
  }
}
