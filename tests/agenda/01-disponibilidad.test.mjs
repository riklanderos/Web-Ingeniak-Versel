// 1 · Disponibilidad: Power 5 días hábiles desde mañana con 12 h de anticipación; Discovery hoy + 10 días hábiles con 3 h; colchón de 15 min, horarios exactos de cada
// tipo, ocupación cruzada de 3 calendarios (Power, Discovery, primary) y cupo de 4 Power por semana.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createBooking } from '../../server/agenda/booking.js';
import { google } from '../../server/agenda/google.js';
import { stripe } from '../../server/agenda/stripe.js';
import { leads } from '../../server/agenda/leads.js';
import { bookableDates } from '../../shared/agenda.js';
import { env, REAL, FAKE, FakeGoogle, mockFetch, NOW, req, read } from './_util.mjs';
import disponibilidad from '../../api/agenda/disponibilidad.js';

const z = (date, hhmm) => new Date(`${date}T${hhmm}:00-06:00`).toISOString();
const cdmx = (iso) => new Date(Date.parse(iso) - 6 * 3600_000).toISOString().slice(11, 16);
const book = (now = NOW) => createBooking({ google, stripe, leads, now: () => now });

test('agenda · los próximos 5 días hábiles empiezan mañana y saltan el fin de semana', () => {
  assert.deepEqual(bookableDates(NOW), ['2026-10-21', '2026-10-22', '2026-10-23', '2026-10-26', '2026-10-27']);
  // Viernes en la noche (CDMX): empieza el lunes.
  assert.deepEqual(bookableDates(new Date('2026-10-24T03:00:00Z')), ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']);
  // Discovery: hoy (si es hábil) y los 10 días hábiles siguientes.
  assert.deepEqual(bookableDates(NOW, { days: 10, sameDay: true }), [
    '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-11-02', '2026-11-03',
  ]);
  // Sábado: hoy no cuenta.
  assert.deepEqual(bookableDates(new Date('2026-10-24T18:00:00Z'), { days: 2, sameDay: true }), ['2026-10-26', '2026-10-27']);
});

test('agenda · horarios exactos de cada tipo sin nada ocupado', async (t) => {
  env(t, REAL);
  const g = new FakeGoogle();
  mockFetch(t, g);
  const d = await book().availability('discovery');
  // Martes 20 a las 10:00 CDMX: hoy quedan los horarios desde las 13:00 (3 h) y siguen 10 días hábiles completos.
  assert.equal(d.length, 11);
  assert.equal(d[0].date, '2026-10-20');
  assert.deepEqual(d[0].slots.map(cdmx), ['13:30', '15:00', '15:45', '16:30', '17:15']);
  assert.deepEqual(d[1].slots.map(cdmx), ['09:00', '09:45', '10:30', '11:15', '12:00', '12:45', '13:30', '15:00', '15:45', '16:30', '17:15']);
  assert.equal(d[10].date, '2026-11-03');
  const p = await book().availability('power');
  assert.deepEqual(p[0].slots.map(cdmx), ['10:00', '11:45', '13:30', '15:15']);
  // freeBusy cruza los dos calendarios y el principal, en hora de CDMX.
  const fb = g.calls.find((c) => c.path === '/freeBusy');
  assert.deepEqual(fb.body.items, [{ id: FAKE.power }, { id: FAKE.discovery }, { id: 'primary' }]);
  assert.equal(fb.body.timeZone, 'America/Mexico_City');
  assert.equal(fb.body.timeMin, z('2026-10-20', '00:00'));
  assert.equal(fb.body.timeMax, z('2026-11-03', '23:59'));
});

test('agenda · ocupación cruzada de 3 calendarios con colchón de 15 min', async (t) => {
  env(t, REAL);
  const g = new FakeGoogle();
  g.busy[FAKE.power] = [{ start: z('2026-10-21', '10:00'), end: z('2026-10-21', '11:30') }];
  g.busy[FAKE.discovery] = [{ start: z('2026-10-22', '15:00'), end: z('2026-10-22', '15:30') }];
  g.busy.primary = [{ start: z('2026-10-23', '12:00'), end: z('2026-10-23', '12:20') }];
  mockFetch(t, g);

  const d = await book().availability('discovery');
  // d[0] es hoy (martes 20); los días ocupados son d[1] (21), d[2] (22) y d[3] (23).
  assert.deepEqual(d[1].slots.map(cdmx), ['09:00', '12:00', '12:45', '13:30', '15:00', '15:45', '16:30', '17:15']);
  assert.deepEqual(d[2].slots.map(cdmx), ['09:00', '09:45', '10:30', '11:15', '12:00', '12:45', '13:30', '15:45', '16:30', '17:15']);
  assert.deepEqual(d[3].slots.map(cdmx), ['09:00', '09:45', '10:30', '11:15', '12:45', '13:30', '15:00', '15:45', '16:30', '17:15']);

  const p = await book().availability('power');
  assert.deepEqual(p[0].slots.map(cdmx), ['11:45', '13:30', '15:15']);
  assert.deepEqual(p[1].slots.map(cdmx), ['10:00', '11:45']);
  assert.deepEqual(p[2].slots.map(cdmx), ['10:00', '13:30', '15:15']);
});

test('agenda · anticipación mínima: 12 h en la Power, 3 h en la Discovery (el mismo día si quedan horarios)', async (t) => {
  env(t, REAL);
  mockFetch(t, new FakeGoogle());
  // Martes 20, 23:00 en CDMX → la Power más pronto es el miércoles a las 11:00.
  const p = await book(new Date('2026-10-21T05:00:00Z')).availability('power');
  assert.equal(p[0].date, '2026-10-21');
  assert.deepEqual(p[0].slots.map(cdmx), ['11:45', '13:30', '15:15']);
  // Miércoles 21, 10:00 en CDMX → la Discovery ofrece hoy desde las 13:00.
  const d = await book(new Date('2026-10-21T16:00:00Z')).availability('discovery');
  assert.equal(d[0].date, '2026-10-21');
  assert.deepEqual(d[0].slots.map(cdmx), ['13:30', '15:00', '15:45', '16:30', '17:15']);
  // Miércoles 21, 15:00 en CDMX → hoy ya no queda ninguno: el día no aparece y empieza el jueves completo.
  const tarde = await book(new Date('2026-10-21T21:00:00Z')).availability('discovery');
  assert.equal(tarde[0].date, '2026-10-22');
  assert.equal(tarde[0].slots.length, 11);
  assert.equal(tarde.length, 10);
});

test('agenda · cupo de 4 Power por semana (apartadas + confirmadas, de los dos sitios) → slots vacíos', async (t) => {
  env(t, REAL);
  const g = new FakeGoogle();
  const ev = (date, hh, estado, sitio) => ({
    start: { dateTime: z(date, hh) }, end: { dateTime: z(date, `${String(Number(hh.slice(0, 2)) + 1).padStart(2, '0')}:30`) },
    extendedProperties: { private: { rl_tipo: 'power', rl_estado: estado, ...(sitio ? { rl_sitio: sitio } : {}) } },
  });
  // Semana del 26: 3 confirmadas (una de riklanderos.tech, sin rl_sitio) + 1 apartada = 4 → llena.
  g.seed(FAKE.power, ev('2026-10-28', '10:00', 'confirmada', 'ingeniak'));
  g.seed(FAKE.power, ev('2026-10-29', '10:00', 'confirmada'));
  g.seed(FAKE.power, ev('2026-10-30', '10:00', 'confirmada', 'ingeniak'));
  g.seed(FAKE.power, ev('2026-10-30', '13:30', 'pendiente', 'ingeniak'));
  // Semana del 19: 3 → todavía hay lugar.
  g.seed(FAKE.power, ev('2026-10-19', '10:00', 'confirmada'));
  g.seed(FAKE.power, ev('2026-10-19', '13:30', 'confirmada'));
  g.seed(FAKE.power, ev('2026-10-20', '10:00', 'confirmada'));
  // Un evento sin rl_tipo=power no cuenta.
  g.seed(FAKE.power, { start: { dateTime: z('2026-10-28', '16:00') }, end: { dateTime: z('2026-10-28', '17:00') } });
  mockFetch(t, g);
  const p = await book().availability('power');
  assert.deepEqual(p.map((x) => [x.date, x.slots.length]), [
    ['2026-10-21', 4], ['2026-10-22', 4], ['2026-10-23', 4], ['2026-10-26', 0], ['2026-10-27', 0],
  ]);
  const lists = g.calls.filter((c) => c.method === 'GET' && c.path.endsWith('/events'));
  assert.equal(lists.length, 2, 'una consulta por semana');
  assert.ok(lists.every((c) => c.queryAll.getAll('privateExtendedProperty').includes('rl_tipo=power')));
});

test('api · GET /api/agenda/disponibilidad/: 400 con tipo inválido, 503 con Google caído, 405 con POST', async (t) => {
  env(t, REAL);
  mockFetch(t, { handle: (u) => (u.hostname.endsWith('googleapis.com') ? new Response('{}', { status: 500 }) : null) });
  t.mock.method(console, 'error', () => {});
  let r = await read(await disponibilidad.fetch(req('/api/agenda/disponibilidad/?tipo=otro')));
  assert.equal(r.status, 400);
  r = await read(await disponibilidad.fetch(req('/api/agenda/disponibilidad/?tipo=discovery')));
  assert.equal(r.status, 503);
  assert.equal(r.body.error, 'No pudimos leer la agenda en este momento. Inténtalo en unos minutos o escríbenos por WhatsApp.');
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('x-robots-tag'), 'noindex');
  r = await read(await disponibilidad.fetch(req('/api/agenda/disponibilidad/?tipo=discovery', { method: 'POST', body: {} })));
  assert.equal(r.status, 405);
});

test('api · disponibilidad 200 con el contrato { ok, days[{date, slots}] }', async (t) => {
  env(t, REAL);
  mockFetch(t, new FakeGoogle());
  const r = await read(await disponibilidad.fetch(req('/api/agenda/disponibilidad/?tipo=power')));
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, true);
  assert.equal(r.body.days.length, 5);
  assert.ok(r.body.days.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Array.isArray(d.slots)));
  assert.equal(r.body.simulacion, undefined);
});
