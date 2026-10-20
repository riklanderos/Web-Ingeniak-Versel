// §3.9-12 · los logs no llevan correo, teléfono, nombre, empresa ni token (en ningún camino).
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cargar, entorno, FAKE, KOMMO, kommoVars, logs, peticion, simularFetch, valido } from './_util.mjs';

const { handler, cotizar, kommo, http } = await cargar();

beforeEach(() => {
  http.__resetHttp();
  cotizar.__resetCotizar();
  kommo.__resetKommo();
});

const PROHIBIDO = [
  'ana@empresa.mx',
  '3312345678',
  '33 1234 5678',
  '+523312345678',
  'Ana Pérez',
  'Clínica Ejemplo',
  'clinicaejemplo.mx',
  'Nos escriben muchas personas',
  FAKE.token,
  FAKE.secreto,
  '10.', // ninguna IP
];

/** @param {string[]} salida */
function sinDatosPersonales(salida) {
  assert.ok(salida.length > 0, 'hubo logs que revisar');
  for (const linea of salida) {
    for (const p of PROHIBIDO) assert.ok(!linea.includes(p), `log con dato prohibido «${p}»: ${linea}`);
    const o = JSON.parse(linea);
    for (const k of Object.keys(o)) {
      assert.ok(['evento', 'folio', 'status', 'kommo', 'leadId', 'delivered', 'ms'].includes(k), `clave de log no permitida: ${k}`);
    }
  }
}

test('logs · éxito en Kommo, reintento por rastreo y nota fallida', async (t) => {
  entorno(t, kommoVars({ NOTIFY_WEBHOOK_URL: FAKE.webhook, NOTIFY_WEBHOOK_SECRET: FAKE.secreto }));
  const salida = logs(t);
  simularFetch(t, [
    { match: 'GET /contacts', status: 204 },
    { match: 'GET /leads/custom_fields', json: KOMMO.camposTracking },
    { match: 'POST /leads/complex', status: 400, json: { 'validation-errors': [{ errors: [{ path: 'custom_fields_values.0' }] }] }, once: true },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', status: 500 },
    { match: `POST ${FAKE.webhook}`, json: {} },
  ]);
  const r = await handler.fetch(peticion(valido()));
  assert.equal(r.status, 200);
  sinDatosPersonales(salida);
  assert.ok(salida.some((l) => JSON.parse(l).leadId === 9774766), 'el log final trae leadId');
});

test('logs · 401 con alerta y webhook, 502, 422, 429, bot, simulación y 503', async (t) => {
  entorno(t, kommoVars({ NOTIFY_WEBHOOK_URL: FAKE.webhook }));
  const salida = logs(t);
  simularFetch(t, [
    { match: 'GET /contacts', status: 401, once: true },
    { match: 'GET /contacts', status: 503 },
    { match: `POST ${FAKE.webhook}`, json: {}, once: true },
    { match: `POST ${FAKE.webhook}`, json: {}, once: true },
    { match: `POST ${FAKE.webhook}`, status: 0 },
  ]);
  await handler.fetch(peticion(valido())); // 401 → alerta + webhook → 200
  await handler.fetch(peticion(valido())); // 503 + webhook caído → 502
  await handler.fetch(peticion({ ...valido(), email: 'ana@' })); // 422
  await handler.fetch(peticion(valido({ meta: { hp: 'x' } }))); // bot
  const ip = '192.0.2.10';
  for (let i = 0; i < 7; i++) await handler.fetch(peticion({ ...valido(), email: 'x' }, { ip })); // … 429
  delete process.env.KOMMO_TOKEN;
  delete process.env.NOTIFY_WEBHOOK_URL;
  await handler.fetch(peticion(valido())); // simulación
  process.env.VERCEL_ENV = 'production';
  await handler.fetch(peticion(valido())); // 503
  const estados = salida.map((l) => JSON.parse(l)).filter((o) => o.evento === 'cotizar').map((o) => o.status);
  assert.deepEqual(estados, [200, 502, 422, 200, 422, 422, 422, 422, 422, 422, 429, 200, 503]);
  sinDatosPersonales(salida);
  assert.ok(salida.every((l) => !l.includes(ip)), 'sin IP en los logs');
});
