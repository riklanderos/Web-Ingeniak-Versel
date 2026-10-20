// 5 · Liberar: inválido → 400; pendiente + `open` → expira y borra; pagado → confirma; confirmada → no la toca;
// siempre 200 con un id válido.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking } from '../../server/agenda/booking.js';
import { google } from '../../server/agenda/google.js';
import { stripe } from '../../server/agenda/stripe.js';
import { leads, bookingAttribution } from '../../server/agenda/leads.js';
import liberar from '../../api/agenda/liberar.js';
import { env, REAL, KOMMO, FAKE, FakeGoogle, FakeKommo, FakeStripe, mockFetch, NOW, form, req, read, captureLogs, ORIGIN } from './_util.mjs';

const START = '2026-10-21T16:00:00.000Z';
async function apartado(t) {
  env(t, { ...REAL, ...KOMMO });
  const g = new FakeGoogle();
  const s = new FakeStripe();
  const k = new FakeKommo();
  mockFetch(t, g, s, k);
  captureLogs(t);
  await createBooking({ google, stripe, leads, now: () => NOW }).reserve({
    type: 'power', form: form('power'), startIso: START, origin: null, baseUrl: ORIGIN, attribution: bookingAttribution({}),
  });
  return { g, s, k, eventId: [...g.events.keys()][0], sessionId: [...s.sessions.keys()][0] };
}
const post = (apartado, headers) => liberar.fetch(req('/api/agenda/liberar/', { method: 'POST', body: { apartado }, headers }));

test('api · liberar: id inválido → 400; otro origen → 403', async (t) => {
  const { g } = await apartado(t);
  for (const id of ['', 'abc', '../x', 'a b c d e', 'x'.repeat(1025)]) {
    assert.equal((await post(id)).status, 400, JSON.stringify(id));
  }
  assert.equal((await post('evokvalido', { origin: 'https://otro.test' })).status, 403);
  assert.equal(g.events.size, 1);
});

test('api · liberar: pendiente con Checkout abierto → expira la sesión, borra el apartado y nota «No completó el pago» en Kommo', async (t) => {
  const { g, s, k, eventId, sessionId } = await apartado(t);
  const r = await read(await post(eventId));
  assert.deepEqual([r.status, r.body], [200, { ok: true }]);
  assert.equal(s.sessions.get(sessionId).status, 'expired');
  assert.ok(s.calls.some((c) => c.method === 'POST' && c.path === `/checkout/sessions/${sessionId}/expire`));
  assert.equal(g.events.has(eventId), false);
  const del = g.calls.find((c) => c.method === 'DELETE');
  assert.equal(del.query.sendUpdates, 'none');
  // Kommo: el lead se queda donde está (sin PATCH) y recibe la nota «No completó el pago…».
  assert.equal(k.calls.filter((c) => c.method === 'PATCH').length, 0);
  const nota = k.notes.at(-1);
  assert.equal(nota.entity_id, 4242);
  assert.equal(nota.params.text, 'No completó el pago de la Power Session: el horario apartado (Miércoles 21 de octubre · 10:00 AM, hora del centro de México) se liberó.');
  // Segunda vez: el evento ya no existe → 200 igual.
  assert.equal((await post(eventId)).status, 200);
});

test('api · liberar: si ya se pagó, confirma en lugar de liberar', async (t) => {
  const { g, s, eventId, sessionId } = await apartado(t);
  s.pay(sessionId);
  assert.equal((await post(eventId)).status, 200);
  const ev = g.events.get(eventId);
  assert.ok(ev, 'el evento sigue');
  assert.equal(ev.extendedProperties.private.rl_estado, 'confirmada');
  assert.deepEqual(ev.attendees, [{ email: 'ana@ejemplo.test' }]);
});

test('api · liberar: una cita confirmada no se toca', async (t) => {
  const { g, s, eventId } = await apartado(t);
  g.events.get(eventId).extendedProperties.private.rl_estado = 'confirmada';
  const sCalls = s.calls.length;
  assert.equal((await post(eventId)).status, 200);
  assert.ok(g.events.has(eventId));
  assert.equal(s.calls.length, sCalls, 'sin llamar a Stripe');
  assert.equal(g.calls.filter((c) => c.method === 'DELETE').length, 0);
});

test('api · liberar: Google falla (500) → 200 y el apartado queda para el cron', async (t) => {
  const { g, eventId } = await apartado(t);
  g.failGet.add(eventId);
  const r = await read(await post(eventId));
  assert.deepEqual([r.status, r.body], [200, { ok: true }]);
  assert.ok(g.events.has(eventId));
});

test('api · liberar: un evento que no es Power (p. ej. de otro calendario) no se toca', async (t) => {
  const { g } = await apartado(t);
  const id = g.seed(FAKE.power, { start: { dateTime: START }, end: { dateTime: START }, extendedProperties: { private: { rl_estado: 'pendiente' } } });
  assert.equal((await post(id)).status, 200);
  assert.ok(g.events.has(id));
});
