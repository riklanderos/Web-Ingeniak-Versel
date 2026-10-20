// Kommo con variables (casos 2 a 6 de §3.9) y API de server/kommo.js que consume la agenda (§3.7, §5.4).
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cargar, cuerpo, entorno, FAKE, KOMMO, kommoVars, logs, peticion, simularFetch, valido } from './_util.mjs';

const { handler, cotizar, kommo, http } = await cargar();
const FALLBACK = { whatsapp: 'https://wa.me/523321017799', email: 'contacto@ingeniak.mx' };
const ID = '6f1c2d3e-4b5a-4c3d-8e2f-1a2b3c4d5e6f';
const TAGS = [
  'web-cotizar', 'servicio-agentes-ia', 'servicio-crm-ia', 'presupuesto-3k-5k', 'plazo-1-3m',
  'industria-salud', 'prefiere-whatsapp', 'pagina-agentes-whatsapp',
].map((name) => ({ name }));
const CONTACTO_NUEVO = {
  name: 'Ana Pérez',
  custom_fields_values: [
    { field_code: 'PHONE', values: [{ value: '+523312345678', enum_code: 'MOB' }] },
    { field_code: 'EMAIL', values: [{ value: 'ana@empresa.mx', enum_code: 'WORK' }] },
  ],
};
const ERR_400_TRACKING = {
  title: 'Bad Request',
  status: 400,
  'validation-errors': [
    { request_id: '0', errors: [{ code: 'NotSupportedChoice', path: 'custom_fields_values.0.field_id', detail: 'The value you have provided is not supported' }] },
  ],
};

beforeEach(() => {
  http.__resetHttp();
  cotizar.__resetCotizar();
  kommo.__resetKommo();
});

test('§3.9-2 · contacto nuevo: 204, 204 → custom_fields → complex → notes (orden y cuerpos exactos)', async (t) => {
  entorno(t, kommoVars({ KOMMO_PIPELINE_ID: '1111111', KOMMO_STATUS_ID: '2222222', KOMMO_RESPONSIBLE_USER_ID: '3333333' }));
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 204 },
    { match: 'GET /leads/custom_fields', json: KOMMO.camposTracking },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', json: KOMMO.notaOk },
  ]);
  const r = await handler.fetch(peticion(valido({ submission_id: ID })));
  assert.equal(r.status, 200);
  assert.deepEqual(await cuerpo(r), { ok: true, folio: 'IK-6F1C2D', delivered: 'kommo' });

  assert.deepEqual(
    llamadas.map((c) => `${c.method} ${c.url}`),
    [
      `GET ${FAKE.base}/contacts?query=ana%40empresa.mx`,
      `GET ${FAKE.base}/contacts?query=%2B523312345678`,
      `GET ${FAKE.base}/leads/custom_fields?limit=250`,
      `POST ${FAKE.base}/leads/complex`,
      `POST ${FAKE.base}/leads/notes`,
    ],
  );
  for (const c of llamadas) {
    assert.equal(c.headers.authorization, `Bearer ${FAKE.token}`);
    assert.equal(c.headers.accept, 'application/json');
    if (c.method === 'POST') assert.equal(c.headers['content-type'], 'application/json');
  }
  assert.deepEqual(llamadas[3].body, [
    {
      name: 'Cotización web · Clínica Ejemplo',
      pipeline_id: 1111111,
      status_id: 2222222,
      responsible_user_id: 3333333,
      custom_fields_values: [{ field_id: 508, values: [{ value: 'https://www.google.com/' }] }],
      _embedded: { tags: TAGS, contacts: [CONTACTO_NUEVO], companies: [{ name: 'Clínica Ejemplo' }] },
    },
  ]);
  const nota = llamadas[4].body;
  assert.equal(nota.length, 1);
  assert.equal(nota[0].entity_id, 9774766);
  assert.equal(nota[0].note_type, 'common');
  assert.match(nota[0].params.text, /^Solicitud de cotización · sitio web · Folio IK-6F1C2D\nServicios: /);

  // La caché de campos de rastreo dura toda la instancia: el segundo envío no la vuelve a pedir.
  await handler.fetch(peticion(valido()));
  assert.equal(llamadas.filter((c) => c.path.startsWith('/leads/custom_fields')).length, 1);
});

test('§3.9-3 · contacto existente por correo → contacts: [{ id }] y sin companies', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [
    {
      match: 'GET /contacts?query=ana%40empresa.mx',
      json: {
        _embedded: {
          contacts: [
            { id: 111, custom_fields_values: [{ field_code: 'EMAIL', values: [{ value: 'ana@empresa.mx.otro' }] }] },
            { id: 555, custom_fields_values: [{ field_code: 'EMAIL', values: [{ value: 'ANA@empresa.mx ', enum_code: 'WORK' }] }] },
          ],
        },
      },
    },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', json: KOMMO.notaOk },
  ]);
  const r = await handler.fetch(peticion(valido({ meta: { referrer: '' } })));
  assert.equal(r.status, 200);
  assert.deepEqual(
    llamadas.map((c) => `${c.method} ${c.path}`),
    ['GET /contacts?query=ana%40empresa.mx', 'POST /leads/complex', 'POST /leads/notes'],
    'sin búsqueda por teléfono ni campos de rastreo (no hay rastreo)',
  );
  const lead = llamadas[1].body[0];
  assert.deepEqual(lead._embedded.contacts, [{ id: 555 }]);
  assert.equal(lead._embedded.companies, undefined);
  assert.equal(lead.custom_fields_values, undefined);
});

test('contacto existente por teléfono (el correo no coincide exacto)', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [
    {
      match: 'GET /contacts?query=ana%40empresa.mx',
      json: { _embedded: { contacts: [{ id: 111, custom_fields_values: [{ field_code: 'EMAIL', values: [{ value: 'otra.ana@empresa.mx' }] }] }] } },
    },
    {
      match: 'GET /contacts?query=%2B523312345678',
      json: { _embedded: { contacts: [{ id: 777, custom_fields_values: [{ field_code: 'PHONE', values: [{ value: '33 1234 5678' }] }] }] } },
    },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', json: KOMMO.notaOk },
  ]);
  const r = await handler.fetch(peticion(valido({ meta: { referrer: '' } })));
  assert.equal(r.status, 200);
  assert.deepEqual(llamadas[2].body[0]._embedded.contacts, [{ id: 777 }]);
});

test('§3.9-4 · complex 400 por rastreo → un reintento sin rastreo → 200', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 204 },
    { match: 'GET /leads/custom_fields', json: KOMMO.camposTracking },
    { match: 'POST /leads/complex', status: 400, json: ERR_400_TRACKING, once: true },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', json: KOMMO.notaOk },
  ]);
  const r = await handler.fetch(peticion(valido({ meta: { utm_source: 'google', utm_medium: 'cpc' } })));
  assert.equal(r.status, 200);
  assert.equal((await cuerpo(r)).delivered, 'kommo');
  const complex = llamadas.filter((c) => c.path === '/leads/complex');
  assert.equal(complex.length, 2);
  assert.deepEqual(complex[0].body[0].custom_fields_values, [
    { field_id: 501, values: [{ value: 'google' }] },
    { field_id: 502, values: [{ value: 'cpc' }] },
    { field_id: 508, values: [{ value: 'https://www.google.com/' }] },
  ]);
  assert.equal(complex[1].body[0].custom_fields_values, undefined);
  assert.deepEqual(complex[1].body[0]._embedded, complex[0].body[0]._embedded);
});

test('complex 400 que no es de rastreo → sin reintento → 502', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 204 },
    { match: 'POST /leads/complex', status: 400, json: { title: 'Bad Request', 'validation-errors': [{ errors: [{ path: 'name' }] }] } },
  ]);
  const r = await handler.fetch(peticion(valido({ meta: { referrer: '' } })));
  assert.equal(r.status, 502);
  assert.equal(llamadas.filter((c) => c.path === '/leads/complex').length, 1);
});

test('§3.9-5 · 401 + webhook 200 → 200 delivered: webhook, con alerta «renovar token»', async (t) => {
  entorno(t, kommoVars({ NOTIFY_WEBHOOK_URL: FAKE.webhook, NOTIFY_WEBHOOK_SECRET: FAKE.secreto }));
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 401, json: { title: 'Unauthorized', status: 401 } },
    { match: `POST ${FAKE.webhook}`, json: { ok: true } },
  ]);
  const r = await handler.fetch(peticion(valido({ submission_id: ID })));
  assert.equal(r.status, 200);
  assert.deepEqual(await cuerpo(r), { ok: true, folio: 'IK-6F1C2D', delivered: 'webhook' });

  const hooks = llamadas.filter((c) => c.url === FAKE.webhook);
  assert.deepEqual(hooks.map((h) => h.body.event), ['kommo.alerta', 'lead.created']);
  for (const h of hooks) {
    assert.equal(h.headers['x-webhook-secret'], FAKE.secreto);
    assert.equal(h.headers['content-type'], 'application/json');
    assert.equal(h.body.site, 'ingeniak.mx');
    assert.equal(h.body.source, 'cotizar');
    assert.equal(h.body.env, 'local');
    assert.equal(h.body.folio, 'IK-6F1C2D');
  }
  assert.equal(hooks[0].body.alerta, 'renovar token');
  assert.deepEqual(hooks[0].body.kommo, { ok: false, status: 401, reason: 'auth' });
  assert.deepEqual(hooks[1].body.kommo, { ok: false, status: 401, reason: 'auth' });
  const data = hooks[1].body.data;
  assert.equal(data.email, 'ana@empresa.mx');
  assert.equal(data.telefono, '+523312345678');
  assert.deepEqual(data.servicios, ['agentes-ia', 'crm-ia']);
  assert.equal(data.meta.pagina_id, 'agentes-whatsapp');
  assert.equal(data.meta.hp, undefined, 'la trampa no viaja');
  assert.equal(llamadas.filter((c) => c.url.startsWith(FAKE.base)).length, 1, 'Kommo se deja al primer 401');
});

test('§3.9-5 · 401 sin webhook → 502 con respaldo', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  simularFetch(t, [{ match: 'GET /contacts', status: 401, json: { title: 'Unauthorized' } }]);
  const r = await handler.fetch(peticion(valido()));
  assert.equal(r.status, 502);
  assert.deepEqual(await cuerpo(r), { ok: false, error: 'No pudimos registrar tu solicitud.', fallback: FALLBACK });
});

test('§3.9-6 · 429 de Kommo → 502 sin reintentos', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [{ match: 'GET /contacts', status: 429, json: { title: 'Too Many Requests', retry_after: 300 } }]);
  const r = await handler.fetch(peticion(valido()));
  assert.equal(r.status, 502);
  assert.equal(llamadas.length, 1);
});

test('Kommo 5xx en complex y webhook 500 → 502; Kommo sin red → 502', async (t) => {
  entorno(t, kommoVars({ NOTIFY_WEBHOOK_URL: FAKE.webhook }));
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 204 },
    { match: 'POST /leads/complex', status: 504 },
    { match: `POST ${FAKE.webhook}`, status: 500 },
  ]);
  const r = await handler.fetch(peticion(valido({ meta: { referrer: '' } })));
  assert.equal(r.status, 502);
  assert.deepEqual(
    llamadas.filter((c) => c.url === FAKE.webhook).map((c) => c.body.event),
    ['lead.created'],
    'un 5xx no manda alerta',
  );
});

test('Kommo sin red (fetch lanza) → 502, nunca una excepción', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  simularFetch(t, [{ match: () => true, status: 0 }]);
  const r = await handler.fetch(peticion(valido()));
  assert.equal(r.status, 502);
  const res = await kommo.createLeadWithNote({ name: 'x', contact: { name: 'y', email: 'a@b.co' } });
  assert.deepEqual(res, { ok: false, status: 0, reason: 'network' });
});

test('la nota falla pero el lead ya existe → 200 delivered: kommo', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  simularFetch(t, [
    { match: 'GET /contacts', status: 204 },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', status: 500 },
  ]);
  const r = await handler.fetch(peticion(valido({ meta: { referrer: '' } })));
  assert.equal(r.status, 200);
  assert.equal((await cuerpo(r)).delivered, 'kommo');
});

test('URL base: KOMMO_BASE_URL (pruebas) y subdominio capturado con https://', async (t) => {
  entorno(t, { KOMMO_BASE_URL: 'http://127.0.0.1:9/simulador/', KOMMO_TOKEN: FAKE.token });
  assert.equal(kommo.kommoBase(), 'http://127.0.0.1:9/simulador/api/v4');
  assert.equal(kommo.kommoConfigured(), true);
  process.env.KOMMO_BASE_URL = 'http://127.0.0.1:9/api/v4';
  assert.equal(kommo.kommoBase(), 'http://127.0.0.1:9/api/v4');
  delete process.env.KOMMO_BASE_URL;
  process.env.KOMMO_SUBDOMAIN = 'https://Ejemplo.kommo.com/leads/';
  assert.equal(kommo.kommoBase(), 'https://ejemplo.kommo.com/api/v4');
  process.env.KOMMO_SUBDOMAIN = 'no válido';
  assert.equal(kommo.kommoBase(), null);
  assert.equal(kommo.kommoConfigured(), false);
});

test('mapa de errores de Kommo', () => {
  const m = kommo.reasonFor;
  assert.deepEqual(
    [401, 402, 403, 429, 400, 422, 500, 502, 504, 0, 404].map(m),
    ['auth', 'payment', 'forbidden', 'rate', 'validation', 'validation', 'server', 'server', 'server', 'network', 'server'],
  );
});

test('alertas 402/403/429 al webhook (una por tipo cada 5 min)', async (t) => {
  entorno(t, kommoVars({ NOTIFY_WEBHOOK_URL: FAKE.webhook }));
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 402, once: true },
    { match: 'GET /contacts', status: 403, once: true },
    { match: 'GET /contacts', status: 429, once: true },
    { match: 'GET /contacts', status: 429, once: true },
    { match: `POST ${FAKE.webhook}`, json: {} },
  ]);
  const input = { name: 'Lead', contact: { name: 'N', email: 'n@e.co' }, source: 'agenda-discovery' };
  for (let i = 0; i < 4; i++) await kommo.createLeadWithNote(input);
  const alertas = llamadas.filter((c) => c.url === FAKE.webhook).map((c) => [c.body.alerta, c.body.source]);
  assert.deepEqual(alertas, [
    ['cuenta sin pago', 'agenda-discovery'],
    ['permisos o IP bloqueada', 'agenda-discovery'],
    ['límite de peticiones', 'agenda-discovery'],
  ]);
});

/* ── API que usa la agenda (§3.7, §5.4) ─────────────────────────────────────────────────── */

test('agenda · createLeadWithNote sin rastreo no pide custom_fields; devuelve ids', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 204 },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', json: KOMMO.notaOk },
  ]);
  const r = await kommo.createLeadWithNote({
    name: 'Discovery Session · Negocio Ejemplo',
    contact: { name: 'Ana Pérez', phoneE164: '+523312345678', email: 'ana@empresa.mx' },
    company: 'Negocio Ejemplo',
    tags: ['web-agenda', 'agenda-discovery', 'web-agenda'],
    note: 'Reserva Discovery Session',
    pipelineId: 7,
    statusId: 8,
  });
  assert.equal(r.ok, true);
  assert.equal(r.leadId, 9774766);
  assert.equal(r.contactId, 12117258);
  assert.deepEqual(llamadas.map((c) => `${c.method} ${c.path.split('?')[0]}`), [
    'GET /contacts', 'GET /contacts', 'POST /leads/complex', 'POST /leads/notes',
  ]);
  const lead = llamadas[2].body[0];
  assert.equal(lead.pipeline_id, 7);
  assert.equal(lead.status_id, 8);
  assert.deepEqual(lead._embedded.tags, [{ name: 'web-agenda' }, { name: 'agenda-discovery' }]);
});

test('agenda · updateLeadTags → PATCH /leads/{id} con tags_to_add / tags_to_delete', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [{ match: 'PATCH /leads/9774766', json: { id: 9774766 } }]);
  const r = await kommo.updateLeadTags(9774766, { add: ['pagado'], remove: ['pago-pendiente'] });
  assert.equal(r.ok, true);
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, `${FAKE.base}/leads/9774766`);
  assert.deepEqual(llamadas[0].body, { tags_to_add: [{ name: 'pagado' }], tags_to_delete: [{ name: 'pago-pendiente' }] });
  assert.deepEqual(await kommo.updateLeadTags('abc', { add: ['x'] }), { ok: false, status: 0, reason: 'validation' });
});

test('agenda · addLeadNote → POST /leads/notes', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [{ match: 'POST /leads/notes', json: KOMMO.notaOk }]);
  const r = await kommo.addLeadNote('9774766', 'Pago confirmado en Stripe');
  assert.equal(r.ok, true);
  assert.deepEqual(llamadas[0].body, [{ entity_id: 9774766, note_type: 'common', params: { text: 'Pago confirmado en Stripe' } }]);
});

test('agenda · simulación y producción sin variables (sin llamadas)', async (t) => {
  entorno(t, {});
  logs(t);
  const llamadas = simularFetch(t, []);
  assert.equal(kommo.kommoConfigured(), false);
  const tags = await kommo.updateLeadTags(5, { add: ['expirado'], remove: ['pago-pendiente'] });
  assert.equal(tags.ok, true);
  assert.equal(tags.dryRun, true);
  assert.equal((await kommo.addLeadNote(5, 'x')).dryRun, true);
  const lead = await kommo.createLeadWithNote({ name: 'Power Session · N', contact: { name: 'N', email: 'n@e.co' }, tags: ['agenda-power'] });
  assert.equal(lead.ok, true);
  assert.equal(lead.dryRun, true);
  assert.deepEqual(lead.preview.tags, ['agenda-power']);
  process.env.VERCEL_ENV = 'production';
  assert.deepEqual(await kommo.updateLeadTags(5, { add: ['x'] }), { ok: false, status: 0, reason: 'not-configured' });
  assert.deepEqual(await kommo.addLeadNote(5, 'x'), { ok: false, status: 0, reason: 'not-configured' });
  const l2 = await kommo.createLeadWithNote({ name: 'x', contact: { name: 'y' } });
  assert.deepEqual(l2, { ok: false, status: 0, reason: 'not-configured' });
  assert.equal(llamadas.length, 0);
});

test('notify · sin URL no llama; con URL manda el sobre de §3.5; 5xx o red → false', async (t) => {
  entorno(t, {});
  logs(t);
  const llamadas = simularFetch(t, [
    { match: `POST ${FAKE.webhook}`, json: {}, once: true },
    { match: `POST ${FAKE.webhook}`, status: 500, once: true },
    { match: `POST ${FAKE.webhook}`, status: 0 },
  ]);
  assert.equal(await kommo.notify('lead.created', { source: 'agenda-power', folio: 'IK-ABC123' }), false);
  assert.equal(llamadas.length, 0);
  process.env.NOTIFY_WEBHOOK_URL = FAKE.webhook;
  process.env.VERCEL_ENV = 'preview';
  assert.equal(await kommo.notify('lead.created', { source: 'agenda-power', folio: 'IK-ABC123', kommo: { ok: true }, data: { a: 1 } }), true);
  assert.deepEqual(llamadas[0].body, {
    event: 'lead.created', site: 'ingeniak.mx', source: 'agenda-power', env: 'preview', folio: 'IK-ABC123', kommo: { ok: true }, data: { a: 1 },
  });
  assert.equal(llamadas[0].headers['x-webhook-secret'], undefined, 'sin secreto no hay cabecera');
  assert.equal(await kommo.notify('lead.created', {}), false);
  assert.equal(await kommo.notify('lead.created', {}), false);
  process.env.NOTIFY_WEBHOOK_URL = 'ftp://no-sirve';
  assert.equal(await kommo.notify('lead.created', {}), false);
});
