// 3 · Reserva de Power: apartado sin invitados (sendUpdates=none), título exacto, Checkout con 29 700 centavos USD,
// expires_at ≥ ahora + 30 min, metadata y URLs; patchPrivate con rl_stripe; Stripe caído → borra el apartado y 503.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking } from '../../server/agenda/booking.js';
import { google } from '../../server/agenda/google.js';
import { stripe, STRIPE_VERSION } from '../../server/agenda/stripe.js';
import { leads, bookingAttribution } from '../../server/agenda/leads.js';
import { MARKER, bookableDates, cdmxToIso } from '../../shared/agenda.js';
import reservar from '../../api/agenda/reservar.js';
import { env, REAL, KOMMO, FAKE, IDS, FakeGoogle, FakeKommo, FakeStripe, mockFetch, NOW, form, ATRIB, req, read, captureLogs, ORIGIN } from './_util.mjs';

const START = '2026-10-21T16:00:00.000Z';
const book = () => createBooking({ google, stripe, leads, now: () => NOW });

test('reserva power · apartado → Checkout → rl_stripe → Kommo «Power Session por pagar»', async (t) => {
  env(t, { ...REAL, ...KOMMO });
  const g = new FakeGoogle();
  const s = new FakeStripe();
  const k = new FakeKommo();
  mockFetch(t, g, s, k);
  captureLogs(t);
  const r = await book().reserve({
    type: 'power', form: form('power'), startIso: START, origin: 'Sección: oferta', baseUrl: ORIGIN, attribution: bookingAttribution(ATRIB),
  });
  assert.equal(r.kind, 'checkout');

  // Apartado: sin invitados, sin Meet, sin avisar.
  const ins = g.calls.find((c) => c.method === 'POST' && c.path.endsWith('/events'));
  assert.equal(ins.path, `/calendars/${encodeURIComponent(FAKE.power)}/events`);
  assert.equal(ins.query.sendUpdates, 'none');
  assert.equal(ins.body.summary, '[Apartado · pago pendiente] Power Session · Clínica Ejemplo');
  assert.deepEqual(ins.body.attendees, []);
  assert.equal(ins.body.conferenceData, undefined);
  assert.equal(ins.body.end.dateTime, '2026-10-21T17:30:00.000Z');
  assert.deepEqual(ins.body.extendedProperties.private, {
    rl_tipo: 'power', rl_email: 'ana@ejemplo.test', rl_nombre: 'Ana Prueba Ejemplo', rl_sitio: 'ingeniak', rl_estado: 'pendiente',
  });
  assert.ok(ins.body.description.endsWith(MARKER));
  assert.match(ins.body.description, /Dónde se le va el tiempo: Cotizar, Supervisar al equipo\nHerramientas que usan hoy: Excel y WhatsApp Business/);
  const eventId = [...g.events.keys()][0];

  // Checkout de Stripe.
  const cs = s.calls.find((c) => c.method === 'POST' && c.path === '/checkout/sessions');
  const f = cs.form;
  assert.equal(cs.headers.get('stripe-version'), STRIPE_VERSION);
  assert.equal(STRIPE_VERSION, '2025-10-29.clover');
  assert.equal(cs.headers.get('idempotency-key'), `ik-hold-${eventId}`);
  assert.equal(cs.headers.get('content-type'), 'application/x-www-form-urlencoded');
  assert.equal(f.get('mode'), 'payment');
  assert.equal(f.get('customer_email'), 'ana@ejemplo.test');
  assert.equal(f.get('locale'), 'es-419');
  assert.equal(f.get('line_items[0][quantity]'), '1');
  assert.equal(f.get('line_items[0][price_data][currency]'), 'usd');
  assert.equal(f.get('line_items[0][price_data][unit_amount]'), '29700');
  assert.equal(f.get('line_items[0][price_data][product_data][name]'), 'Power Session · 90 min 1:1 con Rik Landeros');
  assert.equal(f.get('line_items[0][price_data][product_data][description]'), 'Miércoles 21 de octubre · 10:00 AM (hora del centro de México)');
  const exp = Number(f.get('expires_at'));
  assert.ok(exp >= NOW.getTime() / 1000 + 30 * 60, 'expires_at ≥ ahora + 30 min (Stripe)');
  assert.equal(exp, NOW.getTime() / 1000 + 31 * 60);
  assert.equal(f.get('metadata[rl_event]'), eventId);
  assert.equal(f.get('metadata[rl_tipo]'), 'power');
  assert.equal(f.get('metadata[rl_inicio]'), START);
  assert.equal(f.get('metadata[rl_sitio]'), 'ingeniak');
  assert.equal(f.get('payment_intent_data[description]'), 'Power Session · Clínica Ejemplo · Miércoles 21 de octubre · 10:00 AM');
  assert.equal(f.get('success_url'), `${ORIGIN}/agendar/confirmado/?session_id={CHECKOUT_SESSION_ID}`);
  assert.equal(f.get('cancel_url'), `${ORIGIN}/power-session/?pago=cancelado&apartado=${eventId}`);
  const sessionId = [...s.sessions.keys()][0];
  assert.equal(r.url, `https://checkout.stripe.test/c/pay/${sessionId}`);

  // patchPrivate con rl_stripe (luego ik_kommo), siempre PATCH mínimo sin avisar.
  const patches = g.calls.filter((c) => c.method === 'PATCH');
  assert.equal(patches.length, 2);
  for (const p of patches) {
    assert.deepEqual(Object.keys(p.body), ['extendedProperties']);
    assert.equal(p.query.sendUpdates, 'none');
  }
  assert.equal(patches[0].body.extendedProperties.private.rl_stripe, sessionId);
  assert.equal(patches[0].body.extendedProperties.private.rl_estado, 'pendiente');
  const props = g.events.get(eventId).extendedProperties.private;
  assert.equal(props.rl_stripe, sessionId);
  assert.equal(props.ik_kommo, '4242');
  assert.equal(props.rl_sitio, 'ingeniak');
  // El título del apartado no cambia (riklanderos obtiene el negocio de él).
  assert.equal(g.events.get(eventId).summary, '[Apartado · pago pendiente] Power Session · Clínica Ejemplo');

  // Kommo: «Agenda · Sesiones / Power Session por pagar», Pago Power Session = Pendiente.
  const lead = k.complex[0].body[0];
  assert.equal(lead.name, 'Power Session · Clínica Ejemplo');
  assert.deepEqual(lead._embedded.tags.map((x) => x.name), ['web-agenda', 'power-session', 'campaña', 'entorno-preview']);
  assert.equal(lead.pipeline_id, IDS.embudo('Agenda · Sesiones'));
  assert.equal(lead.status_id, IDS.etapa('Agenda · Sesiones', 'Power Session por pagar'));
  const sel = (campo, opcion) => ({ field_id: IDS.campo(campo), values: [{ enum_id: IDS.opcion(campo, opcion) }] });
  assert.deepEqual(lead.custom_fields_values.filter((c) => c.field_id >= 7000), [
    sel('Tipo de sesión', 'Power Session'),
    { field_id: IDS.campo('Fecha de la sesión'), values: [{ value: Date.parse(START) / 1000 }] },
    sel('Industria', 'Salud y bienestar'),
    sel('Tamaño de empresa', '6–10'),
    sel('Facturación mensual', '$100K–$300K MXN'),
    { field_id: IDS.campo('Página de origen'), values: [{ value: 'https://ingeniak.mx/discovery/' }] },
    sel('Pago Power Session', 'Pendiente'),
  ], 'sin Meet todavía (llega al pagar)');
  const note = k.calls.find((c) => c.path === '/leads/notes').body[0].params.text;
  assert.match(note, /Pago: pendiente en Stripe Checkout/);
  assert.match(note, /Dónde se le va el tiempo: Cotizar, Supervisar al equipo/);
});

test('reserva power · Stripe caído → borra el apartado y lanza', async (t) => {
  env(t, REAL);
  const g = new FakeGoogle();
  const s = new FakeStripe();
  s.down = true;
  mockFetch(t, g, s);
  await assert.rejects(book().reserve({ type: 'power', form: form('power'), startIso: START, origin: null, baseUrl: ORIGIN, attribution: bookingAttribution({}) }));
  assert.equal(g.events.size, 0, 'el apartado se borró');
  assert.equal(g.calls.filter((c) => c.method === 'DELETE').length, 1);
});

test('api · reservar power: 200 { kind: checkout, url } y 503 con Stripe caído', async (t) => {
  env(t, REAL);
  const g = new FakeGoogle();
  const s = new FakeStripe();
  mockFetch(t, g, s);
  captureLogs(t);
  const day = bookableDates(new Date())[1];
  const body = (hh) => ({ tipo: 'power', form: form('power'), start: cdmxToIso(day, hh), origen: null, atribucion: {}, website_url: '', elapsed_ms: 30000 });
  let r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body('10:00') })));
  assert.equal(r.status, 200);
  assert.equal(r.body.kind, 'checkout');
  assert.match(r.body.url, /^https:\/\/checkout\.stripe\.test\//);
  // baseUrl local = origen de la petición.
  assert.equal(s.calls[0].form.get('success_url'), `${ORIGIN}/agendar/confirmado/?session_id={CHECKOUT_SESSION_ID}`);

  s.down = true;
  r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body('13:30') })));
  assert.equal(r.status, 503);
  assert.equal(r.body.error, 'No pudimos completar la reserva. Inténtalo de nuevo o escríbenos por WhatsApp y te agendamos nosotros.');
  assert.equal(g.events.size, 1, 'solo queda el apartado del primer intento');
});

test('baseUrl · producción, Preview, forzado y local', async () => {
  const { baseUrl } = await import('../../server/agenda/booking.js');
  const r = new Request('http://127.0.0.1:4321/api/agenda/reservar/');
  assert.equal(baseUrl(r, { VERCEL_ENV: 'production' }), 'https://ingeniak.mx');
  assert.equal(baseUrl(r, { VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'ingeniak-git-rama-equipo.vercel.app', VERCEL_URL: 'x.vercel.app' }), 'https://ingeniak-git-rama-equipo.vercel.app');
  assert.equal(baseUrl(r, { VERCEL_ENV: 'preview', VERCEL_URL: 'ingeniak-abc123.vercel.app' }), 'https://ingeniak-abc123.vercel.app');
  assert.equal(baseUrl(r, { VERCEL_ENV: 'production', AGENDA_BASE_URL: 'https://www.ingeniak.mx/' }), 'https://www.ingeniak.mx');
  assert.equal(baseUrl(r, {}), 'http://127.0.0.1:4321');
});
