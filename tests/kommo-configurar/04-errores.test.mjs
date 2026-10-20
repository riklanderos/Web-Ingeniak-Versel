// Errores de Kommo: 401, 402, 403, 404, 429 y 500; sigue con lo demás cuando falla un elemento.
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { crearMockKommo } from './_mock-kommo.mjs';
import { TOKEN_PRUEBA, borrar, carpetaTemporal, correr, leerJson, lineas } from './_util.mjs';

describe('kommo-configurar · errores', () => {
  let dir;
  before(() => {
    dir = carpetaTemporal();
  });
  after(() => borrar(dir));

  test('401 (token inválido o vencido): se detiene en la cuenta con un mensaje claro', async () => {
    const mock = await crearMockKommo({ token: 'otro-token-distinto-123456' });
    const salida = join(dir, '401.json');
    try {
      const r = await correr(mock, ['--aplicar'], { salida });
      assert.equal(r.codigo, 1);
      assert.match(r.stderr, /El token no es válido o ya venció \(401\)/);
      assert.match(r.stderr, /Generar token de larga duración/);
      assert.match(r.stderr, /No se intentó: Embudos y etapas, Campos del lead, Etiquetas, Plantillas de respuesta, Usuarios/);
      assert.match(r.stderr, /No se cambió nada en Kommo/);
      assert.equal(mock.peticiones.length, 1);
      assert.equal(mock.cambios().length, 0);
      assert.equal(existsSync(salida), false);
      assert.ok(!(r.stdout + r.stderr).includes(TOKEN_PRUEBA));
    } finally {
      await mock.cerrar();
    }
  });

  test('402 (cuenta sin pago) y 404 (subdominio) en la cuenta', async () => {
    const mock = await crearMockKommo();
    try {
      mock.fallas.push({ ruta: '/account', veces: 1, status: 402, cuerpo: { title: 'Payment Required', status: 402, detail: 'Payment required' } });
      let r = await correr(mock, ['--prueba']);
      assert.equal(r.codigo, 1);
      assert.match(r.stderr, /no tiene un plan activo o terminó la prueba \(402\)/);
      mock.fallas.push({ ruta: '/account', veces: 1, status: 404, cuerpo: { title: 'Not Found', status: 404 } });
      r = await correr(mock, ['--prueba']);
      assert.equal(r.codigo, 1);
      assert.match(r.stderr, /no encontró esa cuenta \(404\).*subdominio/);
      assert.equal(mock.cambios().length, 0);
    } finally {
      await mock.cerrar();
    }
  });

  test('una redirección no se sigue (el token no viaja a otro lado) y se explica como subdominio mal escrito', async () => {
    const mock = await crearMockKommo();
    try {
      mock.fallas.push({ ruta: '/account', veces: 1, status: 302, cuerpo: '', cabeceras: { location: 'https://www.kommo.com/' } });
      const r = await correr(mock, ['--prueba']);
      assert.equal(r.codigo, 1);
      assert.match(r.stderr, /redirección \(302\).*subdominio/);
      assert.equal(mock.peticiones.length, 1);
    } finally {
      await mock.cerrar();
    }
  });

  test('403 al crear plantillas: sigue con lo demás e imprime los textos para capturarlas a mano', async () => {
    const mock = await crearMockKommo();
    try {
      mock.fallas.push({ metodo: 'POST', ruta: '/chats/templates', status: 403, cuerpo: '' });
      const r = await correr(mock, ['--aplicar'], { salida: join(dir, '403.json') });
      assert.equal(r.codigo, 1);
      assert.equal(lineas(r.stdout, '❌ Falló · Plantilla'), 6);
      assert.match(r.stdout, /Kommo negó el permiso \(403\)/);
      assert.match(r.stdout, /Plantillas para capturar a mano/);
      assert.match(r.stdout, /Nombre: Qué es Kain/);
      assert.equal(lineas(r.stdout, '✅ Creado · Etiqueta'), 10);
      assert.ok(r.stdout.indexOf('Usuarios de la cuenta') > 0, 'después de las plantillas sigue con usuarios');
      assert.ok(existsSync(join(dir, '403.json')));
    } finally {
      await mock.cerrar();
    }
  });

  test('403 en todo (bloqueo de la conexión): lo detecta y se detiene en vez de insistir', async () => {
    const mock = await crearMockKommo();
    try {
      const cuentas = () => mock.peticiones.filter((p) => p.ruta === '/account').length;
      mock.fallas.push({ ruta: /^\/(leads|chats|users)/, status: 403, cuerpo: '' });
      mock.fallas.push({ ruta: '/account', status: 403, cuerpo: '', si: () => cuentas() > 1 });
      const r = await correr(mock, ['--aplicar'], { salida: join(dir, 'bloqueo.json') });
      assert.equal(r.codigo, 1);
      assert.match(r.stderr, /rechazando todas las peticiones desde tu conexión \(403\)/);
      assert.match(r.stderr, /No se intentó: Plantillas de respuesta, Usuarios/);
      assert.equal(mock.cambios().length, 0);
      assert.ok(mock.peticiones.length <= 6, `hizo ${mock.peticiones.length} peticiones`);
    } finally {
      await mock.cerrar();
    }
  });

  test('si no se puede leer la lista de plantillas, no crea ninguna (para no duplicar)', async () => {
    const mock = await crearMockKommo();
    try {
      mock.fallas.push({ metodo: 'GET', ruta: '/chats/templates', status: 404, cuerpo: '' });
      const r = await correr(mock, ['--aplicar'], { salida: join(dir, '404t.json') });
      assert.equal(r.codigo, 1);
      assert.equal(mock.cambios().filter((p) => p.ruta === '/chats/templates').length, 0);
      assert.match(r.stdout, /No creé ninguna para no duplicar/);
      assert.match(r.stdout, /Nombre: Reagendar sesión/);
    } finally {
      await mock.cerrar();
    }
  });

  test('429 con espera corta: espera, reintenta y termina bien', async () => {
    const mock = await crearMockKommo();
    try {
      mock.fallas.push({ metodo: 'GET', ruta: '/leads/pipelines', veces: 2, status: 429, cuerpo: { title: 'Too Many Requests', status: 429, retry_after: 0 }, cabeceras: { 'retry-after': '0' } });
      mock.fallas.push({ metodo: 'POST', ruta: '/leads/tags', veces: 1, status: 429, cuerpo: { title: 'Too Many Requests', status: 429 } });
      const r = await correr(mock, ['--aplicar'], { salida: join(dir, '429a.json') });
      assert.equal(r.codigo, 0, r.stdout + r.stderr);
      assert.equal(mock.peticiones.filter((p) => p.metodo === 'GET' && p.ruta === '/leads/pipelines').length, 3);
      assert.match(r.stdout, /Kommo pidió bajar el ritmo \(429\)\. Espero \d+ s y reintento/);
      assert.equal(mock.estado.tags.length, 10, 'el POST que recibió 429 se repitió una sola vez');
      assert.equal(mock.peticiones.filter((p) => p.metodo === 'POST' && p.ruta === '/leads/tags').length, 11);
    } finally {
      await mock.cerrar();
    }
  });

  test('429 pidiendo 5 minutos: se detiene sin esperar ni seguir, y la siguiente corrida completa lo que faltó', async () => {
    const mock = await crearMockKommo();
    const salida = join(dir, '429b.json');
    try {
      mock.fallas.push({ metodo: 'POST', ruta: '/leads/custom_fields', veces: 1, status: 429, cuerpo: { title: 'Too Many Requests', status: 429, retry_after: 300 } });
      const r = await correr(mock, ['--aplicar'], { salida });
      assert.equal(r.codigo, 1);
      assert.ok(r.ms < 10_000, `tardó ${r.ms} ms`);
      assert.match(r.stderr, /pidió esperar unos 5 min/);
      assert.match(r.stderr, /No se intentó: Etiquetas, Plantillas de respuesta, Usuarios/);
      assert.equal(mock.estado.tags.length, 0);
      assert.equal(mock.peticiones.filter((p) => p.metodo === 'POST' && p.ruta === '/leads/custom_fields').length, 1);
      // Los embudos ya creados quedan en el archivo de IDs.
      assert.ok(leerJson(salida).embudos.cotizaciones.id);
      const embudosAntes = mock.estado.pipelines.length;

      const r2 = await correr(mock, ['--aplicar'], { salida });
      assert.equal(r2.codigo, 0, r2.stdout + r2.stderr);
      assert.equal(mock.estado.pipelines.length, embudosAntes, 'no duplica embudos');
      assert.equal(mock.estado.campos.filter((c) => c.type !== 'tracking_data').length, 15);
      assert.equal(mock.estado.tags.length, 10);
    } finally {
      await mock.cerrar();
    }
  });

  test('500 al crear un campo: reporta ese, crea los demás, y otra corrida crea solo el que faltó', async () => {
    const mock = await crearMockKommo();
    const salida = join(dir, '500.json');
    try {
      mock.fallas.push({
        metodo: 'POST',
        ruta: '/leads/custom_fields',
        veces: 1,
        si: (c) => c?.[0]?.name === 'Industria',
        status: 500,
        // Un servidor raro que devuelve el encabezado en el error: aun así no debe salir el token.
        cuerpo: { title: 'ErrInternalServer', status: 500, detail: `Fallo con Authorization: Bearer ${TOKEN_PRUEBA}` },
      });
      const r = await correr(mock, ['--aplicar'], { salida });
      assert.equal(r.codigo, 1);
      assert.match(r.stdout, /❌ Falló · Campo «Industria» — Kommo tuvo un error de su lado \(500\)/);
      assert.equal(lineas(r.stdout, '✅ Creado · Campo'), 14);
      assert.equal(lineas(r.stdout, '✅ Creado · Etiqueta'), 10);
      assert.ok(!(r.stdout + r.stderr).includes(TOKEN_PRUEBA));
      assert.equal(leerJson(salida).campos.industria.id, null);
      const postsAntes = mock.cambios().length;

      const r2 = await correr(mock, ['--aplicar'], { salida });
      assert.equal(r2.codigo, 0, r2.stdout + r2.stderr);
      assert.equal(mock.cambios().length - postsAntes, 1, 'solo crea «Industria»');
      assert.match(r2.stdout, /✅ Creado · Campo «Industria»/);
      assert.ok(Number.isInteger(leerJson(salida).campos.industria.id));
    } finally {
      await mock.cerrar();
    }
  });

  test('500 en una consulta: la reintenta (las consultas sí se repiten; los POST no)', async () => {
    const mock = await crearMockKommo();
    try {
      mock.fallas.push({ metodo: 'GET', ruta: '/leads/tags', veces: 2, status: 500, cuerpo: { title: 'ErrInternalServer', status: 500 } });
      const r = await correr(mock, ['--prueba']);
      assert.equal(r.codigo, 0, r.stdout + r.stderr);
      assert.equal(mock.peticiones.filter((p) => p.ruta === '/leads/tags').length, 3);
    } finally {
      await mock.cerrar();
    }
  });

  test('sin conexión: mensaje en español y código 1', async () => {
    const libre = await new Promise((ok) => {
      const s = createServer().listen(0, '127.0.0.1', () => {
        const { port } = s.address();
        s.close(() => ok(port));
      });
    });
    const r = await correr({ url: `http://127.0.0.1:${libre}` }, ['--prueba']);
    assert.equal(r.codigo, 1);
    assert.match(r.stderr, /No pude conectarme con Kommo/);
  });

  test('datos de acceso inválidos: código 2 sin llamar a nadie', async () => {
    const mock = await crearMockKommo();
    try {
      let r = await correr(mock, ['--prueba'], { env: { KOMMO_SUBDOMAIN: 'mi cuenta' } });
      assert.equal(r.codigo, 2);
      assert.match(r.stderr, /subdominio no es válido/);
      r = await correr(mock, ['--prueba'], { env: { KOMMO_TOKEN: 'abc def ghi jkl' } });
      assert.equal(r.codigo, 2);
      assert.match(r.stderr, /espacios o caracteres raros/);
      r = await correr(mock, ['--prueba'], { env: { KOMMO_BASE_URL: 'https://kommo.ejemplo.com' } });
      assert.equal(r.codigo, 2);
      assert.match(r.stderr, /KOMMO_BASE_URL solo se usa para pruebas/);
      r = await correr(mock, ['--prueba', '--aplicar']);
      assert.equal(r.codigo, 2);
      assert.equal(mock.peticiones.length, 0);
    } finally {
      await mock.cerrar();
    }
  });
});
