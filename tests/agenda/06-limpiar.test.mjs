// 6 · Limpiar (cron): sin el CRON_SECRET correcto → 401; un `retrieve` que falla no detiene el barrido; solo toca
// apartados de ingeniak.mx; sincroniza Kommo de las confirmadas sin ik_kommo_pago.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking } from '../../server/agenda/booking.js';
import { google } from '../../server/agenda/google.js';
import { stripe } from '../../server/agenda/stripe.js';
import { leads } from '../../server/agenda/leads.js';
import limpiar from '../../api/agenda/limpiar.js';
import { env, REAL, KOMMO, FAKE, FakeGoogle, FakeKommo, FakeStripe, mockFetch, NOW, req, read, captureLogs } from './_util.mjs';

const at = (h) => new Date(NOW.getTime() + h * 3600_000).toISOString();
const hold = (props, start = at(26)) => ({
  summary: '[Apartado · pago pendiente] Power Session · Negocio de Prueba',
  description: `Power Session · 90 min\n\nAgendado desde https://ingeniak.mx`,
  start: { dateTime: start }, end: { dateTime: new Date(Date.parse(start) + 90 * 60_000).toISOString() },
  created: new Date(NOW.getTime() - 3600_000).toISOString(),
  extendedProperties: { private: { rl_tipo: 'power', rl_estado: 'pendiente', rl_email: 'cliente@ejemplo.test', rl_nombre: 'Cliente Prueba', ...props } },
});
const session = (s, id, over) => {
  s.sessions.set(id, { id, status: 'open', payment_status: 'unpaid', expires_at: Math.floor(NOW.getTime() / 1000) + 1800, metadata: {}, customer_email: 'cliente@ejemplo.test', ...over });
};

test('api · limpiar: sin CRON_SECRET o con otro → 401', async (t) => {
  env(t, REAL);
  mockFetch(t);
  let r = await limpiar.fetch(req('/api/agenda/limpiar/'));
  assert.equal(r.status, 401, 'sin variable');
  process.env.CRON_SECRET = FAKE.cron;
  r = await limpiar.fetch(req('/api/agenda/limpiar/'));
  assert.equal(r.status, 401, 'sin cabecera');
  r = await limpiar.fetch(req('/api/agenda/limpiar/', { headers: { authorization: 'Bearer otro' } }));
  assert.equal(r.status, 401, 'otro valor');
});

test('api · limpiar: con el secreto correcto → 200 { ok, revisados, confirmados, liberados }', async (t) => {
  env(t, { ...REAL, CRON_SECRET: FAKE.cron });
  mockFetch(t, new FakeGoogle(), new FakeStripe());
  captureLogs(t);
  const r = await read(await limpiar.fetch(req('/api/agenda/limpiar/', { headers: { authorization: `Bearer ${FAKE.cron}` } })));
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true, revisados: 0, confirmados: 0, liberados: 0, errores: 0, kommo: 0 });
});

test('barrido · confirma pagados, libera vencidos y sin rl_stripe; un retrieve que falla no detiene el resto', async (t) => {
  env(t, { ...REAL, ...KOMMO });
  const g = new FakeGoogle();
  const s = new FakeStripe();
  const k = new FakeKommo();
  mockFetch(t, g, s, k);
  captureLogs(t);
  // El que falla va primero.
  const falla = g.seed(FAKE.power, hold({ rl_sitio: 'ingeniak', rl_stripe: 'cs_test_falla' }));
  session(s, 'cs_test_falla');
  s.failRetrieve.add('cs_test_falla');
  const pagado = g.seed(FAKE.power, hold({ rl_sitio: 'ingeniak', rl_stripe: 'cs_test_pagado', ik_kommo: '5001' }));
  session(s, 'cs_test_pagado', { payment_status: 'paid', status: 'complete', metadata: { rl_event: 'x' } });
  const vencido = g.seed(FAKE.power, hold({ rl_sitio: 'ingeniak', rl_stripe: 'cs_test_vencido', ik_kommo: '5002' }));
  session(s, 'cs_test_vencido', { expires_at: Math.floor(NOW.getTime() / 1000) - 60 });
  const abierto = g.seed(FAKE.power, hold({ rl_sitio: 'ingeniak', rl_stripe: 'cs_test_abierto' }));
  session(s, 'cs_test_abierto');
  const sinStripe = g.seed(FAKE.power, hold({ rl_sitio: 'ingeniak' }));
  const reciente = g.seed(FAKE.power, { ...hold({ rl_sitio: 'ingeniak' }), created: NOW.toISOString() });
  // Apartado de riklanderos.tech (sin rl_sitio): lo barre su propio cron, aquí no se toca.
  const rik = g.seed(FAKE.power, hold({ rl_stripe: 'cs_test_rik' }));
  session(s, 'cs_test_rik', { expires_at: 1 });

  const r = await createBooking({ google, stripe, leads, now: () => NOW }).sweepHolds();
  assert.equal(r.revisados, 6);
  assert.equal(r.errores, 1);
  assert.equal(r.confirmados, 1);
  assert.equal(r.liberados, 2);

  assert.ok(g.events.has(falla), 'el que falló sigue para el siguiente barrido');
  assert.equal(g.events.get(pagado).extendedProperties.private.rl_estado, 'confirmada');
  assert.equal(g.events.get(pagado).summary, 'Power Session · Negocio de Prueba (Cliente Prueba)');
  assert.equal(g.events.has(vencido), false);
  assert.equal(s.sessions.get('cs_test_vencido').status, 'expired');
  assert.ok(g.events.has(abierto), 'Checkout abierto y vigente: se respeta');
  assert.equal(g.events.has(sinStripe), false);
  assert.ok(g.events.has(reciente), 'un apartado recién creado espera su rl_stripe');
  assert.ok(g.events.has(rik));
  assert.equal(s.sessions.get('cs_test_rik').status, 'open');

  // Kommo: pagado del confirmado y expirado del vencido.
  const tagCalls = k.calls.filter((c) => c.method === 'PATCH');
  assert.deepEqual(tagCalls.map((c) => [c.path, c.body.tags_to_add[0].name]).sort(), [['/leads/5001', 'pagado'], ['/leads/5002', 'expirado']]);
  assert.equal(g.events.get(pagado).extendedProperties.private.ik_kommo_pago, '1');
  // Filtro del listado: rl_estado=pendiente y rl_sitio=ingeniak.
  const list = g.calls.find((c) => c.method === 'GET' && c.path.endsWith('/events'));
  assert.deepEqual(list.queryAll.getAll('privateExtendedProperty').sort(), ['rl_estado=pendiente', 'rl_sitio=ingeniak']);
});

test('barrido · sincroniza Kommo de confirmadas por el cron de riklanderos (sin ik_kommo_pago)', async (t) => {
  env(t, { ...REAL, ...KOMMO });
  const g = new FakeGoogle();
  const k = new FakeKommo();
  mockFetch(t, g, new FakeStripe(), k);
  captureLogs(t);
  const conf = (props, start = at(30)) => ({
    ...hold({}, start), summary: 'Power Session · Negocio de Prueba (Cliente Prueba)', hangoutLink: 'https://meet.google.test/abc',
    extendedProperties: { private: { rl_tipo: 'power', rl_estado: 'confirmada', ...props } },
  });
  const a = g.seed(FAKE.power, conf({ rl_sitio: 'ingeniak', ik_kommo: '6001' }));
  const b = g.seed(FAKE.power, conf({ rl_sitio: 'ingeniak', ik_kommo: '6002', ik_kommo_pago: '1' }));
  const c = g.seed(FAKE.power, conf({ rl_sitio: 'ingeniak' }));
  const d = g.seed(FAKE.power, conf({ ik_kommo: '6004' }));
  const viejo = g.seed(FAKE.power, conf({ rl_sitio: 'ingeniak', ik_kommo: '6005' }, at(-72)));
  const r = await createBooking({ google, stripe, leads, now: () => NOW }).sweepHolds();
  assert.equal(r.kommo, 1);
  assert.deepEqual(k.calls.filter((x) => x.method === 'PATCH').map((x) => x.path), ['/leads/6001']);
  assert.match(k.calls.find((x) => x.path === '/leads/notes').body[0].params.text, /Meet: https:\/\/meet\.google\.test\/abc/);
  assert.equal(g.events.get(a).extendedProperties.private.ik_kommo_pago, '1');
  assert.equal(g.events.get(c).extendedProperties.private.ik_kommo_pago, undefined);
  assert.equal(g.events.get(d).extendedProperties.private.ik_kommo_pago, undefined);
  assert.equal(g.events.get(viejo).extendedProperties.private.ik_kommo_pago, undefined);
  assert.ok(g.events.has(b));
});
