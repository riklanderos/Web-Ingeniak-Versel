// 4 · Confirmar: id inválido → 400; `unpaid` → pending; `paid` → PATCH a la cita real (invitado, Meet, sendUpdates=all,
// "Pago confirmado en Stripe." antes del marcador) + Kommo `pagado`; segunda llamada idempotente.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking } from '../../server/agenda/booking.js';
import { google } from '../../server/agenda/google.js';
import { stripe } from '../../server/agenda/stripe.js';
import { leads, bookingAttribution } from '../../server/agenda/leads.js';
import { MARKER } from '../../shared/agenda.js';
import confirmar from '../../api/agenda/confirmar.js';
import { env, REAL, KOMMO, SUPABASE, FakeGoogle, FakeKommo, FakeStripe, FakeSupabase, mockFetch, NOW, form, ATRIB, req, read, captureLogs, ORIGIN } from './_util.mjs';

const START = '2026-10-21T16:00:00.000Z';

async function apartado(t, extra = {}) {
  env(t, { ...REAL, ...KOMMO, ...extra });
  const g = new FakeGoogle();
  const s = new FakeStripe();
  const k = new FakeKommo();
  const sb = new FakeSupabase();
  mockFetch(t, g, s, k, sb);
  const logs = captureLogs(t);
  await createBooking({ google, stripe, leads, now: () => NOW }).reserve({
    type: 'power', form: form('power'), startIso: START, origin: null, baseUrl: ORIGIN, attribution: bookingAttribution(ATRIB),
  });
  const eventId = [...g.events.keys()][0];
  const sessionId = [...s.sessions.keys()][0];
  return { g, s, k, sb, eventId, sessionId, logs };
}
const post = (body) => confirmar.fetch(req('/api/agenda/confirmar/', { method: 'POST', body }));

test('api · confirmar: id inválido → 400 { state: error } sin llamar a Stripe', async (t) => {
  const { s } = await apartado(t);
  const before = s.calls.length;
  for (const id of ['', 'abc', 'cs_live_<script>', 'pi_123', 'cs_test_' + 'x'.repeat(300)]) {
    const r = await read(await post({ session_id: id }));
    assert.equal(r.status, 400, id);
    assert.deepEqual(r.body, { ok: false, state: 'error' });
  }
  assert.equal(s.calls.length, before);
  const r = await read(await confirmar.fetch(req('/api/agenda/confirmar/', { method: 'POST', body: { session_id: 'cs_test_abc' }, headers: { origin: 'https://otro.test' } })));
  assert.equal(r.status, 403);
});

test('api · confirmar: sin pagar → pending (y el apartado no cambia)', async (t) => {
  const { g, sessionId, eventId } = await apartado(t);
  const r = await read(await post({ session_id: sessionId }));
  assert.deepEqual(r.body, { ok: true, state: 'pending' });
  assert.equal(g.events.get(eventId).extendedProperties.private.rl_estado, 'pendiente');
});

test('api · confirmar: pagado → cita real con invitado, Meet y aviso; Kommo pagado; brief (A1); idempotente', async (t) => {
  const { g, s, k, sb, eventId, sessionId, logs } = await apartado(t, SUPABASE);
  s.pay(sessionId);
  const kBefore = k.calls.length;
  const r = await read(await post({ session_id: sessionId }));
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.equal(r.body.state, 'ok');
  assert.equal(r.body.when, 'Miércoles 21 de octubre · 10:00 AM');
  assert.equal(r.body.email, 'ana@ejemplo.test');
  assert.match(r.body.meetLink, /^https:\/\/meet\.google\.test\//);
  assert.match(r.body.brief, /^https:\/\/www\.riklanderos\.tech\/brief\/[A-Za-z0-9_-]{40,64}$/);

  const full = g.calls.filter((c) => c.method === 'PATCH' && c.body.summary);
  assert.equal(full.length, 1);
  const p = full[0];
  assert.equal(p.query.sendUpdates, 'all');
  assert.equal(p.query.conferenceDataVersion, '1');
  assert.equal(p.body.summary, 'Power Session · Clínica Ejemplo (Ana Prueba Ejemplo)');
  assert.deepEqual(p.body.attendees, [{ email: 'ana@ejemplo.test' }]);
  assert.equal(p.body.conferenceData.createRequest.conferenceSolutionKey.type, 'hangoutsMeet');
  assert.ok(p.body.description.endsWith(`\n\nPago confirmado en Stripe.${MARKER}`));
  assert.ok(p.body.description.startsWith('Antes de la sesión, llena tu brief (8–10 min, puedes contestar con audio):\nhttps://www.riklanderos.tech/brief/'));
  assert.equal(p.body.extendedProperties.private.rl_estado, 'confirmada');
  assert.equal(p.body.extendedProperties.private.rl_sitio, 'ingeniak');
  assert.equal(p.body.extendedProperties.private.ik_kommo, '4242');

  // Kommo: pagado (quita pago-pendiente) + nota, y el evento queda marcado ik_kommo_pago=1.
  const kc = k.calls.slice(kBefore);
  const tags = kc.find((c) => c.method === 'PATCH' && c.path === '/leads/4242');
  assert.deepEqual(tags.body, { tags_to_add: [{ name: 'pagado' }], tags_to_delete: [{ name: 'pago-pendiente' }] });
  const note = kc.find((c) => c.path === '/leads/notes');
  assert.match(note.body[0].params.text, /^Pago confirmado en Stripe · Miércoles 21 de octubre · 10:00 AM \(hora del centro de México\) · Meet: https:\/\/meet\.google\.test\/.+ · Brief: https:\/\/www\.riklanderos\.tech\/brief\//);
  assert.equal(g.events.get(eventId).extendedProperties.private.ik_kommo_pago, '1');

  // Supabase (A1): lead insertado al reservar y pasado a pagado; brief creado una vez.
  assert.ok(sb.calls.some((c) => c.method === 'POST' && c.path === '/leads' && c.body.source === 'power' && c.body.details.site === 'ingeniak' && c.body.payment_status === 'pendiente'));
  const paid = sb.calls.filter((c) => c.method === 'PATCH' && c.path === '/leads');
  assert.ok(paid.length >= 1);
  assert.equal(paid[0].query.get('stripe_session_id'), `eq.${sessionId}`);
  assert.equal(paid[0].query.get('payment_status'), 'in.(pendiente,expirado)');
  assert.deepEqual(paid[0].body, { payment_status: 'pagado' });
  assert.equal(sb.briefs.size, 1);

  // Segunda llamada: misma respuesta, sin otro PATCH completo ni Kommo.
  const gPatches = g.calls.filter((c) => c.method === 'PATCH').length;
  const kCalls = k.calls.length;
  const r2 = await read(await post({ session_id: sessionId }));
  assert.equal(r2.body.state, 'ok');
  assert.equal(r2.body.brief, r.body.brief);
  assert.equal(g.calls.filter((c) => c.method === 'PATCH').length, gPatches, 'idempotente: sin PATCH');
  assert.equal(k.calls.length, kCalls, 'idempotente: Kommo una sola vez');
  assert.equal(sb.briefs.size, 1);

  for (const s2 of ['ana@ejemplo.test', '3312345678', 'Ana Prueba']) assert.ok(!logs.join('\n').includes(s2));
});

test('api · confirmar: sesión sin cita asociada o Stripe caído → 500 { state: error }', async (t) => {
  const { s, sessionId } = await apartado(t);
  s.sessions.get(sessionId).metadata = {};
  let r = await read(await post({ session_id: sessionId }));
  assert.deepEqual([r.status, r.body], [500, { ok: false, state: 'error' }]);
  s.failRetrieve.add(sessionId);
  r = await read(await post({ session_id: sessionId }));
  assert.equal(r.status, 500);
});
