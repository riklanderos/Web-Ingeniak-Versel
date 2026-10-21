// 2 · Reserva de Discovery: validación (paridad con validateForm de riklanderos.tech), 409 si se ocupó, evento con Meet
// y sendUpdates=all, propiedades rl_* + rl_sitio, descripción que termina en el marcador, Kommo con las etiquetas
// exactas y, con Kommo caído, la reserva responde igual.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking, SlotTakenError } from '../../server/agenda/booking.js';
import { google } from '../../server/agenda/google.js';
import { stripe } from '../../server/agenda/stripe.js';
import { leads, bookingAttribution } from '../../server/agenda/leads.js';
import { MARKER, validateForm, EMPTY_FORM, bookableDates, cdmxToIso } from '../../shared/agenda.js';
import reservar from '../../api/agenda/reservar.js';
import { env, REAL, KOMMO, FAKE, IDS, FakeGoogle, FakeKommo, FakeStripe, mockFetch, NOW, form, ATRIB, req, read, captureLogs, ORIGIN } from './_util.mjs';

const START = '2026-10-21T16:00:00.000Z'; // miércoles 21, 10:00 CDMX
const book = () => createBooking({ google, stripe, leads, now: () => NOW });
const reserve = (over = {}) =>
  book().reserve({ type: 'discovery', form: form('discovery'), startIso: START, origin: 'Sección: hero · meta · prueba', baseUrl: ORIGIN, attribution: bookingAttribution(ATRIB), ...over });

test('validateForm · paridad con las reglas originales (tabla de casos)', () => {
  const ok = form('discovery');
  const okP = form('power');
  /** [descripción, tipo, cambios, claves de error esperadas] */
  const casos = [
    ['válido discovery', 'discovery', {}, []],
    ['válido power', 'power', {}, []],
    ['vacío discovery', 'discovery', { ...EMPTY_FORM }, ['fullName', 'email', 'whatsapp', 'businessName', 'industry', 'teamSize', 'revenue', 'goal']],
    ['vacío power', 'power', { ...EMPTY_FORM }, ['fullName', 'email', 'whatsapp', 'businessName', 'industry', 'teamSize', 'revenue', 'timeDrains', 'tools', 'goal']],
    ['nombre de 2 letras', 'discovery', { fullName: ' Al ' }, ['fullName']],
    ['correo sin dominio', 'discovery', { email: 'ana@ejemplo' }, ['email']],
    ['correo > 200', 'discovery', { email: `${'a'.repeat(195)}@ej.test` }, ['email']],
    ['WhatsApp de 9 dígitos', 'discovery', { whatsapp: '+52 3312345' }, ['whatsapp']],
    ['WhatsApp de 10 dígitos con símbolos', 'discovery', { whatsapp: '(33) 1234-5678' }, []],
    ['negocio de 1 letra', 'discovery', { businessName: 'X' }, ['businessName']],
    ['sitio > 200', 'discovery', { website: 'x'.repeat(201) }, ['website']],
    ['giro fuera de lista', 'discovery', { industry: 'Minería' }, ['industry']],
    ['equipo fuera de lista', 'discovery', { teamSize: '2-5' }, ['teamSize']],
    ['facturación fuera de lista', 'discovery', { revenue: '$100K-$300K MXN' }, ['revenue']],
    ['discovery: objetivo de 9', 'discovery', { goal: '123456789' }, ['goal']],
    ['discovery: objetivo de 601', 'discovery', { goal: 'x'.repeat(601) }, ['goal']],
    ['discovery: ignora tiempo y herramientas', 'discovery', { timeDrains: ['nada'], tools: '' }, []],
    ['power: sin tiempo', 'power', { timeDrains: [] }, ['timeDrains']],
    ['power: 4 opciones', 'power', { timeDrains: ['Cotizar', 'Otro', 'Compras y proveedores', 'Marketing y contenido'] }, ['timeDrains']],
    ['power: opción inventada', 'power', { timeDrains: ['Dormir'] }, ['timeDrains']],
    ['power: herramientas de 1', 'power', { tools: 'X' }, ['tools']],
    ['power: herramientas > 300', 'power', { tools: 'x'.repeat(301) }, ['tools']],
    ['power: objetivo de 19', 'power', { goal: 'x'.repeat(19) }, ['goal']],
    ['power: objetivo de 1001', 'power', { goal: 'x'.repeat(1001) }, ['goal']],
  ];
  for (const [desc, tipo, over, keys] of casos) {
    const f = { ...(tipo === 'power' ? okP : ok), ...over };
    assert.deepEqual(Object.keys(validateForm(tipo, f)).sort(), [...keys].sort(), desc);
  }
});

test('reserva discovery · evento con Meet, invitación, propiedades rl_* + rl_sitio, marcador y Kommo', async (t) => {
  env(t, { ...REAL, ...KOMMO });
  const g = new FakeGoogle();
  const k = new FakeKommo();
  mockFetch(t, g, k);
  const logs = captureLogs(t);
  const r = await reserve();
  assert.equal(r.kind, 'confirmed');
  assert.equal(r.when, 'Miércoles 21 de octubre · 10:00 AM');
  assert.match(r.meetLink, /^https:\/\/meet\.google\.test\//);

  const ins = g.calls.find((c) => c.method === 'POST' && c.path.endsWith('/events'));
  assert.equal(ins.path, `/calendars/${encodeURIComponent(FAKE.discovery)}/events`);
  assert.equal(ins.query.sendUpdates, 'all');
  assert.equal(ins.query.conferenceDataVersion, '1');
  assert.equal(ins.body.summary, 'Discovery Session · Clínica Ejemplo (Ana Prueba Ejemplo)');
  assert.deepEqual(ins.body.attendees, [{ email: 'ana@ejemplo.test' }]);
  assert.equal(ins.body.conferenceData.createRequest.conferenceSolutionKey.type, 'hangoutsMeet');
  assert.deepEqual(ins.body.start, { dateTime: START, timeZone: 'America/Mexico_City' });
  assert.equal(ins.body.end.dateTime, '2026-10-21T16:30:00.000Z');
  assert.deepEqual(ins.body.extendedProperties.private, {
    rl_tipo: 'discovery', rl_email: 'ana@ejemplo.test', rl_nombre: 'Ana Prueba Ejemplo', rl_sitio: 'ingeniak', rl_estado: 'confirmada',
  });
  assert.ok(ins.body.description.endsWith(MARKER), 'la descripción termina en el marcador');
  assert.equal(MARKER, '\n\nAgendado desde https://ingeniak.mx');
  assert.match(ins.body.description, /^Discovery Session · 30 min\n\nNombre: Ana Prueba Ejemplo\n/);
  assert.match(ins.body.description, /\n\nOrigen: Sección: hero · meta · prueba\n\nAgendado desde/);

  // Kommo: lead en «Ventas / Discovery agendada», etiquetas exactas, campos de la sesión, contacto E.164 y nota.
  assert.equal(k.complex.length, 1);
  const lead = k.complex[0].body[0];
  assert.equal(lead.name, 'Discovery Session · Clínica Ejemplo');
  // ATRIB trae utm_medium=paid → campaña; fuera de producción → entorno-preview.
  assert.deepEqual(lead._embedded.tags.map((x) => x.name), ['web-agenda', 'discovery', 'campaña', 'entorno-preview']);
  assert.equal(lead.pipeline_id, IDS.embudo('Ventas'));
  assert.equal(lead.status_id, IDS.etapa('Ventas', 'Discovery agendada'));
  const sel = (campo, opcion) => ({ field_id: IDS.campo(campo), values: [{ enum_id: IDS.opcion(campo, opcion) }] });
  assert.deepEqual(lead.custom_fields_values.filter((c) => c.field_id >= 7000), [
    sel('Tipo de sesión', 'Discovery Session'),
    { field_id: IDS.campo('Fecha de la sesión'), values: [{ value: Date.parse(START) / 1000 }] },
    { field_id: IDS.campo('Enlace de Meet'), values: [{ value: r.meetLink }] },
    sel('Industria', 'Salud y bienestar'),
    sel('Tamaño de empresa', '6–10'),
    sel('Facturación mensual', '$100K–$300K MXN'),
    { field_id: IDS.campo('Página de origen'), values: [{ value: 'https://ingeniak.mx/discovery/' }] },
  ]);
  assert.deepEqual(lead._embedded.contacts[0].custom_fields_values, [
    { field_code: 'PHONE', values: [{ value: '+523312345678', enum_code: 'MOB' }] },
    { field_code: 'EMAIL', values: [{ value: 'ana@ejemplo.test', enum_code: 'WORK' }] },
  ]);
  assert.deepEqual(lead._embedded.companies, [{ name: 'Clínica Ejemplo' }]);
  const note = k.calls.find((c) => c.path === '/leads/notes').body[0].params.text;
  assert.match(note, /^Reserva de Discovery Session · sitio web · Folio IK-AG-/);
  assert.match(note, /Horario: Miércoles 21 de octubre · 10:00 AM \(hora del centro de México\) · 30 min · 2026-10-21T16:00:00.000Z/);
  assert.match(note, /Google Meet: https:\/\/meet\.google\.test\//);
  assert.match(note, /UTM: source=meta · medium=paid · campaign=prueba/);
  assert.doesNotMatch(note, /undefined|null|\n\n/);

  // ik_kommo en el evento con un PATCH mínimo (solo propiedades privadas, sin avisar a nadie).
  const pp = g.calls.filter((c) => c.method === 'PATCH');
  assert.equal(pp.length, 1);
  assert.deepEqual(Object.keys(pp[0].body), ['extendedProperties']);
  assert.equal(pp[0].query.sendUpdates, 'none');
  const stored = [...g.events.values()][0];
  assert.equal(stored.extendedProperties.private.ik_kommo, '4242');
  assert.equal(stored.extendedProperties.private.rl_estado, 'confirmada');

  // Logs sin datos personales ni llaves.
  const all = logs.join('\n');
  for (const s of ['ana@ejemplo.test', '3312345678', 'Ana Prueba', 'Clínica Ejemplo', FAKE.kommoToken, FAKE.googleToken]) {
    assert.ok(!all.includes(s), `el log no debe incluir ${s}`);
  }
});

test('reserva discovery · Kommo caído → la cita queda igual (Calendar manda)', async (t) => {
  env(t, { ...REAL, ...KOMMO });
  const g = new FakeGoogle();
  const k = new FakeKommo();
  k.down = true;
  mockFetch(t, g, k);
  captureLogs(t);
  const r = await reserve();
  assert.equal(r.kind, 'confirmed');
  assert.equal(g.events.size, 1);
  assert.equal(g.calls.filter((c) => c.method === 'PATCH').length, 0, 'sin ik_kommo');
});

test('reserva discovery · Preview etiqueta entorno-preview', async (t) => {
  env(t, { ...REAL, ...KOMMO, VERCEL_ENV: 'preview' });
  const g = new FakeGoogle();
  const k = new FakeKommo();
  mockFetch(t, g, k);
  captureLogs(t);
  await reserve({ attribution: bookingAttribution({ ...ATRIB, utm_medium: 'email' }) });
  assert.deepEqual(k.complex[0].body[0]._embedded.tags.map((x) => x.name), ['web-agenda', 'discovery', 'orgánico', 'entorno-preview']);
});

test('reserva discovery · producción: sin entorno-preview; gclid cuenta como campaña', async (t) => {
  env(t, { ...REAL, ...KOMMO, VERCEL_ENV: 'production' });
  const g = new FakeGoogle();
  const k = new FakeKommo();
  mockFetch(t, g, k);
  captureLogs(t);
  await reserve({ attribution: bookingAttribution({ page_path: '/discovery/', clid: { gclid: 'Cj0-prueba' } }) });
  assert.deepEqual(k.complex[0].body[0]._embedded.tags.map((x) => x.name), ['web-agenda', 'discovery', 'campaña']);
});

test('reserva discovery · horario ocupado → SlotTakenError (y nada se inserta)', async (t) => {
  env(t, REAL);
  const g = new FakeGoogle();
  g.busy.primary = [{ start: START, end: '2026-10-21T16:30:00.000Z' }];
  mockFetch(t, g);
  await assert.rejects(reserve(), SlotTakenError);
  assert.equal(g.events.size, 0);
});

test('api · POST /api/agenda/reservar/: 200 confirmada, 409 slotTaken, 422 con errores, 403 otro origen, 405 GET', async (t) => {
  env(t, REAL);
  const g = new FakeGoogle();
  mockFetch(t, g, new FakeStripe());
  captureLogs(t);
  const day = bookableDates(new Date())[1];
  const start = cdmxToIso(day, '12:15');
  const body = (over = {}) => ({
    tipo: 'discovery', form: form('discovery'), start, origen: 'Sección: hero', atribucion: ATRIB, website_url: '', elapsed_ms: 48231, ...over,
  });

  let r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body() })));
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.equal(r.body.kind, 'confirmed');
  assert.ok(r.body.when.endsWith('12:15 PM'));

  // El mismo horario ya está tomado por la cita anterior.
  r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body() })));
  assert.equal(r.status, 409);
  assert.deepEqual(r.body, { ok: false, error: 'Ese horario se acaba de ocupar. Elige otro, por favor.', slotTaken: true });

  r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body({ form: { ...form('discovery'), email: 'x', industry: 'Nada' } }) })));
  assert.equal(r.status, 422);
  assert.equal(r.body.error, 'Revisa los campos marcados.');
  assert.deepEqual(Object.keys(r.body.errors).sort(), ['email', 'industry']);

  r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body({ start: 'mañana' }) })));
  assert.equal(r.status, 422);
  assert.equal(r.body.error, 'Elige un horario.');

  r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body(), headers: { origin: 'https://otro.test' } })));
  assert.equal(r.status, 403);
  r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body({ tipo: 'vip' }) })));
  assert.equal(r.status, 400);
  r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: '{roto' })));
  assert.equal(r.status, 400);
  r = await read(await reservar.fetch(req('/api/agenda/reservar/')));
  assert.equal(r.status, 405);
});

test('api · reservar limita a 10 por IP cada 10 minutos (429)', async (t) => {
  env(t, REAL);
  mockFetch(t, new FakeGoogle());
  captureLogs(t);
  const ip = { 'x-forwarded-for': '203.0.113.7' };
  const b = { tipo: 'discovery', form: { ...form('discovery'), email: 'x' }, start: START, elapsed_ms: 9000 };
  for (let i = 0; i < 10; i++) {
    const r = await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: b, headers: ip }));
    assert.equal(r.status, 422);
  }
  const r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: b, headers: ip })));
  assert.equal(r.status, 429);
  assert.ok(Number(r.headers.get('retry-after')) > 0);
  // Otra IP no se ve afectada.
  const o = await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: b, headers: { 'x-forwarded-for': '198.51.100.2' } }));
  assert.equal(o.status, 422);
});
