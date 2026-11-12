// 13 · API de conversiones de Meta (server/meta-capi.js): apagada sin variables o fuera de producción; en producción
// manda Schedule con el event_id, las cookies del píxel y sin correo ni teléfono (salvo META_CAPI_DATOS=1, con hash);
// un fallo de Meta nunca lanza. En simulación, /api/agenda/reservar/ devuelve metaEventId sin llamar a Meta.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newEventId, sendSchedule } from '../../server/meta-capi.js';
import disponibilidad from '../../api/agenda/disponibilidad.js';
import reservar from '../../api/agenda/reservar.js';
import { env, form, req, read, captureLogs } from './_util.mjs';

const PIXEL = '1234567890123456';
const PROD = { VERCEL_ENV: 'production', META_PIXEL_ID: PIXEL, META_CAPI_TOKEN: 'tok-meta-prueba-no-real' };
const pedido = () => req('/api/agenda/reservar/', {
  method: 'POST', body: {},
  headers: { cookie: '_ga=x; _fbp=fb.1.111.222; _fbc=fb.1.333.abc', 'user-agent': 'UA de prueba', 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
});
const enviar = (over = {}) => sendSchedule({ request: pedido(), eventId: 'ev-1', sourceUrl: 'https://ingeniak.mx/agendar/gracias/', email: ' Ana@Ejemplo.test ', phone: '+52 33 1234 5678', ...over });

/** Simula Meta y guarda lo que recibió. */
function meta(t, status = 200) {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response('{}', { status });
  });
  return calls;
}

test('apagada sin variables, sin token o fuera de producción', async (t) => {
  const calls = meta(t);
  env(t);
  assert.equal(await enviar(), false);
  env(t, { ...PROD, VERCEL_ENV: 'preview' });
  assert.equal(await enviar(), false);
  env(t, { ...PROD, META_CAPI_TOKEN: '' });
  assert.equal(await enviar(), false);
  env(t, { ...PROD, META_PIXEL_ID: 'no-es-numero' });
  assert.equal(await enviar(), false);
  assert.equal(calls.length, 0);
});

test('producción · Schedule con event_id y cookies del píxel, sin correo ni teléfono', async (t) => {
  const calls = meta(t);
  env(t, PROD);
  assert.equal(await enviar(), true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, new RegExp(`^https://graph\\.facebook\\.com/v\\d+\\.\\d/${PIXEL}/events\\?access_token=`));
  const ev = calls[0].body.data[0];
  assert.equal(ev.event_name, 'Schedule');
  assert.equal(ev.event_id, 'ev-1');
  assert.equal(ev.action_source, 'website');
  assert.equal(ev.event_source_url, 'https://ingeniak.mx/agendar/gracias/');
  assert.deepEqual(ev.user_data, { client_ip_address: '203.0.113.9', client_user_agent: 'UA de prueba', fbp: 'fb.1.111.222', fbc: 'fb.1.333.abc' });
  assert.equal(calls[0].body.test_event_code, undefined);
  assert.doesNotMatch(JSON.stringify(calls[0].body), /ejemplo\.test|3312345678/);
});

test('META_CAPI_DATOS=1 manda correo y teléfono solo con hash; META_CAPI_TEST_CODE viaja', async (t) => {
  const calls = meta(t);
  env(t, { ...PROD, META_CAPI_DATOS: '1', META_CAPI_TEST_CODE: 'TEST123' });
  assert.equal(await enviar(), true);
  const { user_data: u } = calls[0].body.data[0];
  assert.match(u.em[0], /^[0-9a-f]{64}$/);
  assert.match(u.ph[0], /^[0-9a-f]{64}$/);
  assert.equal(calls[0].body.test_event_code, 'TEST123');
  assert.doesNotMatch(JSON.stringify(calls[0].body), /ejemplo\.test|3312345678/i);
});

test('un fallo de Meta no lanza y no registra el token', async (t) => {
  const lines = captureLogs(t);
  env(t, PROD);
  meta(t, 400);
  assert.equal(await enviar(), false);
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('red caída'); });
  assert.equal(await enviar(), false);
  assert.equal(lines.length, 2);
  assert.doesNotMatch(lines.join('\n'), /tok-meta/);
});

test('reservar · la Discovery confirmada devuelve metaEventId (simulación: sin llamar a Meta)', async (t) => {
  env(t);
  captureLogs(t);
  const dias = (await read(await disponibilidad.fetch(req('/api/agenda/disponibilidad/?tipo=discovery')))).body;
  const start = dias.days.find((d) => d.slots.length).slots[0];
  const r = await read(await reservar.fetch(req('/api/agenda/reservar/', {
    method: 'POST', body: { tipo: 'discovery', form: form('discovery'), start, origen: 'Sección: dev', atribucion: {}, website_url: '', elapsed_ms: 9000 },
  })));
  assert.equal(r.status, 200);
  assert.equal(r.body.kind, 'confirmed');
  assert.match(r.body.metaEventId, /^[0-9a-f-]{36}$/);
  assert.notEqual(newEventId(), newEventId());
});
