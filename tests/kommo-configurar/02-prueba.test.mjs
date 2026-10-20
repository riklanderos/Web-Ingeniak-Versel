// Modo prueba (por defecto): solo lee. Cero POST/PATCH y ningún archivo escrito.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { crearMockKommo } from './_mock-kommo.mjs';
import { RAIZ, TOKEN_PRUEBA, borrar, carpetaTemporal, correr, lineas } from './_util.mjs';

describe('kommo-configurar · --prueba', () => {
  let dir;
  before(() => {
    dir = carpetaTemporal();
  });
  after(() => borrar(dir));

  test('--ayuda explica el uso y no llama a Kommo', async () => {
    const mock = await crearMockKommo();
    try {
      const r = await correr(mock, ['--ayuda']);
      assert.equal(r.codigo, 0);
      assert.match(r.stdout, /--prueba/);
      assert.match(r.stdout, /--aplicar/);
      assert.match(r.stdout, /--sin-clientes/);
      assert.match(r.stdout, /--sin-plantillas/);
      assert.equal(mock.peticiones.length, 0);
    } finally {
      await mock.cerrar();
    }
  });

  test('cuenta vacía: muestra el plan completo y no manda ningún cambio', async () => {
    const mock = await crearMockKommo();
    const salida = join(dir, 'prueba-ids.json');
    try {
      const r = await correr(mock, ['--prueba'], { salida });
      assert.equal(r.codigo, 0, r.stderr);
      assert.equal(mock.cambios().length, 0, 'en modo prueba no debe haber POST/PATCH');
      assert.ok(mock.peticiones.every((p) => p.metodo === 'GET'));
      assert.equal(lineas(r.stdout, 'Se crearía · Embudo'), 3);
      assert.equal(lineas(r.stdout, 'Se crearía · Campo'), 15);
      assert.equal(lineas(r.stdout, 'Se crearía · Etiqueta'), 10);
      assert.equal(lineas(r.stdout, 'Se crearía · Plantilla'), 6);
      assert.match(r.stdout, /Resumen: se crearían 34 · ya existen 0/);
      assert.match(r.stdout, /No se cambió nada en Kommo/);
      // Vercel: solo subdominio y token; nunca IDs de embudo o etapa (mandarían sobre los nombres).
      assert.match(r.stdout, /KOMMO_SUBDOMAIN\s+= ejemplo\n/);
      assert.doesNotMatch(r.stdout, /KOMMO_(AGENDA_)?(PIPELINE|STATUS)_ID\s+=/);
      assert.match(r.stdout, /✓ Zona horaria de la cuenta: America\/Mexico_City/);
      assert.ok(mock.peticiones.find((p) => p.ruta === '/account').query.with.split(',').includes('datetime_settings'));
      assert.match(r.stdout, /9001\s+Rik Landeros \(administrador\)/);
      assert.equal(existsSync(salida), false, 'el modo prueba no escribe el archivo de IDs');
      // Orden pedido: cuenta → embudos → campos → etiquetas → plantillas → usuarios.
      const orden = [...new Set(mock.peticiones.map((p) => p.ruta))];
      assert.deepEqual(orden, ['/account', '/leads/pipelines', '/leads/custom_fields', '/leads/tags', '/chats/templates', '/users']);
      assert.ok(mock.peticiones.every((p) => p.autorizado));
      assert.ok(!r.stdout.includes(TOKEN_PRUEBA) && !r.stderr.includes(TOKEN_PRUEBA));
    } finally {
      await mock.cerrar();
    }
  });

  test('sin opciones = modo prueba', async () => {
    const mock = await crearMockKommo();
    try {
      const r = await correr(mock, [], { salida: join(dir, 'x.json') });
      assert.equal(r.codigo, 0, r.stderr);
      assert.match(r.stdout, /Modo PRUEBA/);
      assert.equal(mock.cambios().length, 0);
      assert.equal(existsSync(join(dir, 'x.json')), false);
    } finally {
      await mock.cerrar();
    }
  });

  test('--sin-clientes y --sin-plantillas: no los planea ni consulta plantillas', async () => {
    const mock = await crearMockKommo();
    try {
      const r = await correr(mock, ['--prueba', '--sin-clientes', '--sin-plantillas']);
      assert.equal(r.codigo, 0, r.stderr);
      assert.equal(lineas(r.stdout, 'Se crearía · Embudo'), 2);
      assert.ok(!r.stdout.includes('Se crearía · Embudo «Clientes · Implementación»'));
      assert.match(r.stdout, /Omitido · Embudo «Clientes · Implementación»/);
      assert.equal(lineas(r.stdout, 'Se crearía · Plantilla'), 0);
      assert.ok(!mock.peticiones.some((p) => p.ruta === '/chats/templates'));
    } finally {
      await mock.cerrar();
    }
  });

  test('el archivo de IDs va por defecto a materiales/v2/landings/kommo-ids.json', async () => {
    // Las pruebas que aplican siempre pasan --salida a una carpeta temporal; el archivo real solo lo genera el cliente.
    const { leerOpciones } = await import('../../scripts/kommo-configurar.mjs');
    assert.equal(leerOpciones(['--aplicar']).salida, join(RAIZ, 'materiales/v2/landings/kommo-ids.json'));
  });
});
