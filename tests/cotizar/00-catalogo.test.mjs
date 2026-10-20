// El catálogo del modal (src/data/cotizar.json, CAMBIO-COTIZAR §2.3) existe y trae lo que usa el servidor.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CATALOGO } from './_util.mjs';

test('catálogo · src/data/cotizar.json existe (lo escribe el área modal)', () => {
  assert.ok(
    existsSync(CATALOGO),
    'Falta src/data/cotizar.json. Lo escribe el área «modal» con el contenido de CAMBIO-COTIZAR §2.3; el área «api» no lo crea.',
  );
});

test('catálogo · listas y mensajes que usa la validación del servidor', { skip: !existsSync(CATALOGO) }, () => {
  const c = JSON.parse(readFileSync(CATALOGO, 'utf8'));
  for (const k of ['servicios', 'objetivos', 'industrias', 'tamanos', 'presupuestos', 'plazos', 'canales', 'crms', 'canalesPreferidos']) {
    assert.ok(Array.isArray(c[k]) && c[k].length > 0, `cotizar.json → ${k} debe ser una lista con elementos`);
    for (const o of c[k]) assert.ok(typeof o.slug === 'string' && typeof o.label === 'string', `cotizar.json → ${k}: cada opción con slug y label`);
  }
  assert.ok(c.servicios.some((s) => s.slug === 'no-seguro'), 'cotizar.json → servicios incluye no-seguro');
  assert.ok(Array.isArray(c.paises) && c.paises.some((p) => p.iso === 'mx' && p.lada === '+52'), 'cotizar.json → paises incluye mx +52');
  assert.ok(c.paises.some((p) => p.iso === 'otro' && p.lada === null), 'cotizar.json → paises incluye "otro" sin lada');
  for (const k of ['servicios', 'objetivo', 'industria', 'tamano', 'presupuesto', 'plazo', 'nombre', 'empresa', 'telefono', 'telefonoLada', 'email', 'canal_preferido', 'sitio', 'vision', 'consentimiento']) {
    assert.equal(typeof c.errores?.[k], 'string', `cotizar.json → errores.${k}`);
  }
  assert.deepEqual(c.limites?.nombre, [3, 120]);
  assert.deepEqual(c.limites?.empresa, [2, 160]);
  assert.equal(c.limites?.vision, 1000);
});
