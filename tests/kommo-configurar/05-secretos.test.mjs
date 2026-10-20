// El token nunca aparece en pantalla, en errores ni en archivos; la pregunta oculta funciona sin eco.
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { crearMockKommo } from './_mock-kommo.mjs';
import { TOKEN_PRUEBA, archivos, borrar, carpetaTemporal, correr, jwtFalso } from './_util.mjs';

describe('kommo-configurar · el token no sale de la memoria', () => {
  let dir;
  before(() => {
    dir = carpetaTemporal();
  });
  after(() => borrar(dir));

  test('pregunta oculta (stdin sin terminal): subdominio y token por la entrada; el token nunca se muestra', async () => {
    const mock = await crearMockKommo();
    const salida = join(dir, 'oculto', 'kommo-ids.json');
    try {
      const r = await correr(mock, ['--aplicar'], {
        env: { KOMMO_SUBDOMAIN: null, KOMMO_TOKEN: null },
        entrada: `https://Ejemplo.kommo.com/leads/\n  Bearer ${TOKEN_PRUEBA}  \n`,
        salida,
      });
      assert.equal(r.codigo, 0, r.stdout + r.stderr);
      assert.match(r.stdout, /Subdominio de Kommo/);
      assert.match(r.stdout, /Pega tu token de larga duración \(no se verá en pantalla\)/);
      assert.match(r.stdout, /✓ Token recibido\./);
      assert.ok(mock.peticiones.every((p) => p.autorizado), 'el token pegado con «Bearer » y espacios se limpió');
      assert.ok(!r.stdout.includes(TOKEN_PRUEBA));
      assert.ok(!r.stderr.includes(TOKEN_PRUEBA));
    } finally {
      await mock.cerrar();
    }
  });

  test('sin token ni entrada: pide el token y se detiene sin llamar a Kommo', async () => {
    const mock = await crearMockKommo();
    try {
      const r = await correr(mock, ['--prueba'], { env: { KOMMO_TOKEN: null } });
      assert.equal(r.codigo, 2);
      assert.match(r.stderr, /Falta el token/);
      assert.equal(mock.peticiones.length, 0);
    } finally {
      await mock.cerrar();
    }
  });

  test('en ninguna corrida (prueba, aplicar, 401, 500 con eco) sale el token por pantalla o a un archivo', async () => {
    const mock = await crearMockKommo();
    const salidas = [];
    try {
      const corridas = [];
      corridas.push(await correr(mock, ['--prueba'], { salida: join(dir, 'a', 'ids.json') }));
      mock.fallas.push({ metodo: 'POST', ruta: '/leads/tags', veces: 1, status: 500, cuerpo: { detail: `eco ${TOKEN_PRUEBA} y Bearer ${TOKEN_PRUEBA}` } });
      mock.fallas.push({ metodo: 'POST', ruta: '/leads/custom_fields', veces: 1, status: 400, cuerpo: { 'validation-errors': [{ request_id: '0', errors: [{ code: 'X', path: 'name', detail: `token=${TOKEN_PRUEBA}` }] }], status: 400 } });
      salidas.push(join(dir, 'b', 'ids.json'));
      corridas.push(await correr(mock, ['--aplicar'], { salida: salidas[0] }));
      salidas.push(join(dir, 'c', 'ids.json'));
      corridas.push(await correr(mock, ['--aplicar'], { salida: salidas[1] }));
      mock.fallas.push({ ruta: '/account', veces: 1, status: 401, cuerpo: { title: 'Unauthorized', status: 401, detail: `Invalid token ${TOKEN_PRUEBA}` } });
      corridas.push(await correr(mock, ['--aplicar'], { salida: join(dir, 'd', 'ids.json') }));

      for (const r of corridas) {
        assert.ok(!r.stdout.includes(TOKEN_PRUEBA), r.stdout);
        assert.ok(!r.stderr.includes(TOKEN_PRUEBA), r.stderr);
      }
      assert.match(corridas[1].stdout, /\[token oculto\]/, 'el eco del servidor se tapó');
      const todos = archivos(dir);
      assert.ok(todos.length >= 2);
      for (const a of todos) assert.ok(!a.contenido.includes(TOKEN_PRUEBA), `${a.ruta} contiene el token`);
      // El script solo escribe el archivo de IDs que se le pidió; nada más.
      for (const sub of ['b', 'c']) assert.deepEqual(readdirSync(join(dir, sub)), ['ids.json']);
    } finally {
      await mock.cerrar();
    }
  });

  test('token largo (JWT de 650 caracteres) repetido a la mitad de errores largos: no sale ni un pedazo', async () => {
    // Antes se recortaba el error (300 y 200 caracteres) y DESPUÉS se tapaba: el token cortado ya no se reconocía
    // y salían sus primeros caracteres. Ahora se tapa sobre el texto completo y también cualquier pedazo de ≥ 12.
    const jwt = jwtFalso(650);
    assert.equal(jwt.length, 650);
    assert.ok(jwt.startsWith('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.'));
    const mock = await crearMockKommo({ token: jwt });
    const salida = join(dir, 'jwt', 'ids.json');
    try {
      const relleno = 'x'.repeat(150);
      // 500 con JSON cuyo `detail` repite el token a la mitad de un texto largo.
      mock.fallas.push({ metodo: 'POST', ruta: '/leads/tags', veces: 1, status: 500, cuerpo: { title: 'ErrInternalServer', status: 500, detail: `${relleno} Authorization header was: ${jwt} ${relleno}` } });
      // 403 con una página HTML (no JSON) que repite el token.
      mock.fallas.push({ metodo: 'POST', ruta: '/leads/custom_fields', veces: 1, status: 403, cuerpo: `<!doctype html><html><body><h1>403 Forbidden</h1><p>${'y'.repeat(120)} token=${jwt}</p></body></html>` });
      // 400 de validación que repite solo un pedazo (ya recortado por el servidor).
      mock.fallas.push({ metodo: 'POST', ruta: '/chats/templates', veces: 1, status: 400, cuerpo: { 'validation-errors': [{ request_id: '0', errors: [{ code: 'X', path: 'name', detail: `recortado ${jwt.slice(0, 100)}` }] }], status: 400 } });
      const r = await correr(mock, ['--aplicar'], { env: { KOMMO_TOKEN: jwt }, salida });
      const todo = r.stdout + r.stderr;
      assert.equal(r.codigo, 1, todo);
      assert.ok(mock.peticiones.every((p) => p.autorizado));
      assert.match(r.stdout, /❌ Falló · Etiqueta «web-cotizar» — Kommo tuvo un error de su lado \(500\)\. .*\(x+ Authorization header was: \[token oculto\]/);
      assert.match(r.stdout, /❌ Falló · Campo «Servicios de interés» — Kommo negó el permiso \(403\)\. .*token=\[token oculto\]/);
      assert.match(r.stdout, /❌ Falló · Plantilla «Precio de referencia» — Kommo rechazó los datos \(400\)\. \(name: recortado \[token oculto\]\)/);
      assert.ok(!todo.includes('eyJ0eX'), 'no sale el inicio del JWT');
      for (let i = 0; i + 12 <= jwt.length; i++) assert.ok(!todo.includes(jwt.slice(i, i + 12)), `sale el pedazo del token que empieza en ${i}`);
      for (const a of archivos(join(dir, 'jwt'))) for (let i = 0; i + 12 <= jwt.length; i += 6) assert.ok(!a.contenido.includes(jwt.slice(i, i + 12)), a.ruta);
    } finally {
      await mock.cerrar();
    }
  });

  test('cada petición lleva «Authorization: Bearer …» y nunca el token en la URL', async () => {
    const mock = await crearMockKommo();
    try {
      await correr(mock, ['--aplicar'], { salida: join(dir, 'e', 'ids.json') });
      assert.ok(mock.peticiones.length > 30);
      for (const p of mock.peticiones) {
        assert.ok(p.autorizado);
        assert.ok(!JSON.stringify(p.query).includes(TOKEN_PRUEBA));
        assert.ok(!JSON.stringify(p.cuerpo ?? '').includes(TOKEN_PRUEBA));
      }
    } finally {
      await mock.cerrar();
    }
  });
});
