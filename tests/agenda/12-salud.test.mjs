// 12 · Salud de la agenda: el cron diario (8:00 CDMX) revisa la disponibilidad; si Google no deja leer, deja UNA tarea en Kommo con el
// enlace para renovar el permiso (sin repetirla mientras siga abierta); un error suelto de Google no avisa.
import test from 'node:test';
import assert from 'node:assert/strict';
import { revisarAgenda, MARCADOR_CAIDA, enlaceAutorizar } from '../../server/agenda/salud.js';
import { AgendaConfigError } from '../../server/agenda/google-auth.js';
import salud from '../../api/agenda/salud.js';
import { env, REAL, KOMMO, FAKE, FakeGoogle, mockFetch, req, read, captureLogs } from './_util.mjs';

const json = (b, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json' } });

/** Kommo de mentira solo con /tasks. */
class KommoTareas {
  constructor(abiertas = []) {
    this.abiertas = abiertas;
    /** @type {{ method: string, path: string, body?: any }[]} */
    this.calls = [];
  }
  /** @param {URL} u @param {RequestInit} [init] */
  handle(u, init) {
    if (!u.href.startsWith(FAKE.kommoBase)) return null;
    const method = (init?.method ?? 'GET').toUpperCase();
    const path = u.pathname.replace(/^\/api\/v4/, '');
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    this.calls.push({ method, path, query: u.search, body });
    if (path === '/tasks' && method === 'GET') return this.abiertas.length ? json({ _embedded: { tasks: this.abiertas } }) : new Response(null, { status: 204 });
    if (path === '/tasks' && method === 'POST') {
      this.abiertas.push(...body);
      return json({ _embedded: { tasks: body.map((_, i) => ({ id: 900 + i })) } });
    }
    return json({ title: 'Not found' }, 404);
  }
  get creadas() {
    return this.calls.filter((c) => c.method === 'POST').map((c) => c.body[0]);
  }
}

const ok = { availability: async () => [] };
const sinPermiso = { availability: async () => { throw new AgendaConfigError('Conector de Google sin vincular o sin autorizar (UserAuthorizationRequiredError)'); } };
const VERCEL = { VERCEL_URL: 'ingeniak-abc123def-ingeniak.vercel.app', KOMMO_RESPONSIBLE_USER_ID: '4242' };

test('salud · agenda sana → ok, sin llamadas a Kommo', async (t) => {
  env(t, { ...REAL, ...KOMMO });
  const k = new KommoTareas();
  mockFetch(t, k);
  assert.deepEqual(await revisarAgenda(ok), { estado: 'ok' });
  assert.equal(k.calls.length, 0);
});

test('salud · sin permiso de Google → tarea en Kommo con el enlace de autorizar, responsable y sin reintentar', async (t) => {
  env(t, { ...REAL, ...KOMMO, ...VERCEL });
  const k = new KommoTareas();
  mockFetch(t, k);
  const logs = captureLogs(t);
  let esperas = 0;
  const r = await revisarAgenda(sinPermiso, { now: () => new Date('2026-11-11T18:44:00Z'), esperar: async () => { esperas++; } });
  assert.equal(r.estado, 'caida');
  assert.equal(r.aviso, 'tarea-creada');
  assert.equal(esperas, 0, 'falta de permiso: avisa sin reintentar');
  assert.equal(k.creadas.length, 1);
  const tarea = k.creadas[0];
  assert.ok(tarea.text.startsWith(MARCADOR_CAIDA));
  assert.match(tarea.text, /Miércoles 11 de noviembre · 12:44 PM/);
  assert.ok(tarea.text.includes('https://ingeniak-abc123def-ingeniak.vercel.app/api/agenda/autorizar/'));
  assert.match(tarea.text, /UserAuthorizationRequiredError/);
  assert.equal(tarea.task_type_id, 1);
  assert.equal(tarea.responsible_user_id, 4242);
  assert.equal(tarea.entity_id, undefined, 'tarea sin lead');
  assert.ok(logs.some((l) => l.includes('"accion":"salud"') && l.includes('tarea-creada')));
  assert.ok(!logs.some((l) => l.includes(FAKE.kommoToken)), 'sin token en logs');
});

test('salud · con una tarea «[Agenda caída]» abierta no crea otra; al cerrarla, la siguiente falla vuelve a avisar', async (t) => {
  env(t, { ...REAL, ...KOMMO, ...VERCEL });
  const k = new KommoTareas([{ id: 1, text: 'Llamar a cliente' }, { id: 2, text: `${MARCADOR_CAIDA} ya avisada` }]);
  mockFetch(t, k);
  captureLogs(t);
  const r = await revisarAgenda(sinPermiso);
  assert.equal(r.aviso, 'tarea-abierta');
  assert.equal(k.creadas.length, 0);
  k.abiertas = [{ id: 1, text: 'Llamar a cliente' }];
  assert.equal((await revisarAgenda(sinPermiso)).aviso, 'tarea-creada');
});

test('salud · un error suelto de Google se reintenta y no avisa; si se repite, avisa', async (t) => {
  env(t, { ...REAL, ...KOMMO, ...VERCEL });
  const k = new KommoTareas();
  mockFetch(t, k);
  captureLogs(t);
  let n = 0;
  const unaVez = { availability: async () => { if (n++ === 0) throw new Error('Google Calendar 500'); return []; } };
  assert.deepEqual(await revisarAgenda(unaVez, { esperar: async () => {} }), { estado: 'ok' });
  assert.equal(k.calls.length, 0);
  const siempre = { availability: async () => { throw new Error('Google Calendar 500'); } };
  const r = await revisarAgenda(siempre, { esperar: async () => {} });
  assert.equal(r.aviso, 'tarea-creada');
});

test('salud · sin Kommo configurado no truena: queda en el log', async (t) => {
  env(t, { ...REAL, ...VERCEL });
  mockFetch(t);
  const logs = captureLogs(t);
  const r = await revisarAgenda(sinPermiso);
  assert.equal(r.estado, 'caida');
  assert.equal(r.aviso, 'sin-tarea:not-configured');
  assert.ok(logs.some((l) => l.includes('"accion":"salud"')));
});

test('salud · enlace de autorizar: la URL interna del despliegue (VERCEL_URL)', () => {
  assert.equal(enlaceAutorizar({ VERCEL_URL: 'ingeniak-q1ulfrdgl-ingeniak.vercel.app' }), 'https://ingeniak-q1ulfrdgl-ingeniak.vercel.app/api/agenda/autorizar/');
  assert.equal(enlaceAutorizar({}), null);
});

test('api · salud (cron diario): 401 sin el secreto; con Google caído → agenda: caida y la tarea creada', async (t) => {
  env(t, { ...REAL, ...KOMMO, ...VERCEL });
  const k = new KommoTareas();
  mockFetch(t, k, { handle: (u) => (u.hostname.endsWith('googleapis.com') ? json({}, 500) : null) });
  captureLogs(t);
  assert.equal((await salud.fetch(req('/api/agenda/salud/'))).status, 401, 'sin CRON_SECRET');
  process.env.CRON_SECRET = FAKE.cron;
  assert.equal((await salud.fetch(req('/api/agenda/salud/', { headers: { authorization: 'Bearer otro' } }))).status, 401);
  const r = await read(await salud.fetch(req('/api/agenda/salud/', { headers: { authorization: `Bearer ${FAKE.cron}` } })));
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true, agenda: 'caida', aviso: 'tarea-creada' });
  assert.equal(k.creadas.length, 1);
});

test('api · salud (cron diario) con la agenda sana → { ok, agenda: ok }', async (t) => {
  env(t, { ...REAL, CRON_SECRET: FAKE.cron });
  mockFetch(t, new FakeGoogle());
  captureLogs(t);
  const r = await read(await salud.fetch(req('/api/agenda/salud/', { headers: { authorization: `Bearer ${FAKE.cron}` } })));
  assert.deepEqual(r.body, { ok: true, agenda: 'ok' });
});
