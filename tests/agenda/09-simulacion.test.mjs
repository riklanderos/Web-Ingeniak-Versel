// Simulación local (CAMBIO-COTIZAR §5.7): sin VERCEL_ENV y sin POWER_CALENDAR_ID (o AGENDA_MOCK=1) los dos flujos
// corren completos en memoria, sin una sola llamada de red. En Vercel nunca se activa. /api/agenda/estado/ sin IDs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mockActive } from '../../server/agenda/mock.js';
import { SESSION_RULES } from '../../shared/agenda.js';
import disponibilidad from '../../api/agenda/disponibilidad.js';
import reservar from '../../api/agenda/reservar.js';
import confirmar from '../../api/agenda/confirmar.js';
import liberar from '../../api/agenda/liberar.js';
import estado from '../../api/agenda/estado.js';
import { env, REAL, FAKE, mockFetch, form, req, read, captureLogs } from './_util.mjs';

const cdmx = (iso) => new Date(Date.parse(iso) - 6 * 3600_000).toISOString().slice(11, 16);
const days = async (tipo) => (await read(await disponibilidad.fetch(req(`/api/agenda/disponibilidad/?tipo=${tipo}`)))).body;
const reserve = (tipo, start) =>
  reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: { tipo, form: form(tipo), start, origen: 'Sección: dev', atribucion: {}, website_url: '', elapsed_ms: 9000 } }));

test('simulación · solo sin VERCEL_ENV, y con AGENDA_MOCK=1 o sin POWER_CALENDAR_ID', () => {
  assert.equal(mockActive({}), true);
  assert.equal(mockActive({ AGENDA_MOCK: '1', POWER_CALENDAR_ID: 'x' }), true);
  assert.equal(mockActive({ POWER_CALENDAR_ID: 'x' }), false);
  for (const v of ['production', 'preview', 'development']) {
    assert.equal(mockActive({ VERCEL_ENV: v }), false, v);
    assert.equal(mockActive({ VERCEL_ENV: v, AGENDA_MOCK: '1' }), false, v);
  }
});

test('simulación · disponibilidad con el 2.º horario de cada día ocupado y sin red', async (t) => {
  env(t);
  const net = mockFetch(t);
  const d = await days('discovery');
  assert.equal(d.simulacion, true);
  assert.equal(d.days.length, 5);
  for (const day of d.days.slice(1)) assert.ok(!day.slots.map(cdmx).includes(SESSION_RULES.discovery.times[1]), day.date);
  const p = await days('power');
  for (const day of p.days.slice(1)) {
    assert.deepEqual(day.slots.map(cdmx), ['10:00', '13:30', '15:15']);
  }
  process.env.AGENDA_MOCK_LLENO = '1';
  const full = await days('power');
  assert.ok(full.days.every((x) => x.slots.length === 0), 'semana llena');
  assert.equal(net.all.length, 0);
});

test('simulación · Discovery confirma al instante; Power → Checkout simulado → pagar → confirmada', async (t) => {
  env(t);
  const net = mockFetch(t);
  captureLogs(t);
  const d = await days('discovery');
  const startD = d.days[1].slots[0];
  let r = await read(await reserve('discovery', startD));
  assert.equal(r.status, 200);
  assert.equal(r.body.kind, 'confirmed');
  assert.match(r.body.meetLink, /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
  // Ese horario ya no aparece.
  assert.ok(!(await days('discovery')).days[1].slots.includes(startD));

  const p = await days('power');
  const startP = p.days[1].slots[0];
  r = await read(await reserve('power', startP));
  assert.equal(r.body.kind, 'checkout');
  const u = new URL(r.body.url);
  assert.equal(u.origin, 'http://127.0.0.1:4321');
  assert.equal(u.pathname, '/dev/agenda-checkout/');
  const sid = u.searchParams.get('session_id');
  const apartado = u.searchParams.get('apartado');
  assert.equal(sid, `cs_test_MOCK_${apartado}`);

  const conf = (session_id) => confirmar.fetch(req('/api/agenda/confirmar/', { method: 'POST', body: { session_id } }));
  assert.deepEqual((await read(await conf(sid))).body, { ok: true, state: 'pending' });
  const pay = await read(await estado.fetch(req('/api/agenda/estado/', { method: 'POST', body: { simular: 'pago', session_id: sid } })));
  assert.deepEqual(pay.body, { ok: true });
  const ok = (await read(await conf(sid))).body;
  assert.equal(ok.state, 'ok');
  assert.equal(ok.email, 'ana@ejemplo.test');
  assert.equal(ok.brief, null);
  assert.match(ok.meetLink, /^https:\/\/meet\.google\.com\//);

  const st = (await read(await estado.fetch(req('/api/agenda/estado/')))).body;
  assert.equal(st.simulacion, true);
  assert.equal(st.memoria.confirmadas, 2);
  assert.equal(st.memoria.leadsKommo, 2);
  assert.equal(net.all.length, 0, 'nada sale a la red');
});

test('simulación · cancelar el pago libera el horario', async (t) => {
  env(t);
  mockFetch(t);
  captureLogs(t);
  const start = (await days('power')).days[2].slots[0];
  const r = await read(await reserve('power', start));
  const apartado = new URL(r.body.url).searchParams.get('apartado');
  assert.ok(!(await days('power')).days[2].slots.includes(start), 'apartado ocupa el horario');
  const lib = await read(await liberar.fetch(req('/api/agenda/liberar/', { method: 'POST', body: { apartado } })));
  assert.deepEqual(lib.body, { ok: true });
  assert.ok((await days('power')).days[2].slots.includes(start), 'el horario quedó libre');
});

test('estado · nunca en producción', async (t) => {
  env(t, { VERCEL_ENV: 'production', ...REAL });
  mockFetch(t);
  assert.equal((await estado.fetch(req('/api/agenda/estado/'))).status, 404);
});

test('estado · fuera de simulación no expone IDs ni secretos', async (t) => {
  env(t, { VERCEL_ENV: 'preview', ...REAL, CRON_SECRET: FAKE.cron });
  // Google y Stripe responden; Kommo y Supabase sin configurar.
  mockFetch(t, {
    handle: (u) => {
      if (u.hostname === 'oauth2.googleapis.com') return Response.json({ access_token: FAKE.googleToken, expires_in: 3600 });
      if (u.hostname === 'www.googleapis.com') return Response.json({ id: 'x' });
      if (u.hostname === 'api.stripe.com') return Response.json({ data: [] });
      return null;
    },
  });
  const r = await read(await estado.fetch(req('/api/agenda/estado/')));
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, {
    ok: true, entorno: 'preview', simulacion: false, google: 'ok', googleAuth: 'oauth', stripe: 'ok', live: false,
    calendarios: { power: true, discovery: true }, kommo: 'sin-configurar', kommoEstructura: 'sin-configurar', supabase: 'sin-configurar', cron: true,
  });
  const text = JSON.stringify(r.body);
  for (const s of Object.values(FAKE)) assert.ok(!text.includes(s), `sin ${s}`);
  // POST de "simular pago" no existe fuera de la simulación.
  assert.equal((await estado.fetch(req('/api/agenda/estado/', { method: 'POST', body: { simular: 'pago', session_id: 'cs_test_x' } }))).status, 404);
});
