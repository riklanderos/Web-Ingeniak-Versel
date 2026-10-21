// api/cotizar.js · contrato de §3.2 (casos 1, 7, 9 y 10 de §3.9).
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cargar, cuerpo, entorno, FAKE, ipNueva, KOMMO, kommoVars, logs, peticion, simularFetch, valido } from './_util.mjs';

const { handler, cotizar, kommo, http } = await cargar();
const FALLBACK = { whatsapp: 'https://wa.me/523321017799', email: 'contacto@ingeniak.mx' };
const ID = '6f1c2d3e-4b5a-4c3d-8e2f-1a2b3c4d5e6f';

beforeEach(() => {
  http.__resetHttp();
  cotizar.__resetCotizar();
  kommo.__resetKommo();
});

/** @param {Response} r */
function cabecerasBase(r) {
  assert.equal(r.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('x-robots-tag'), 'noindex');
  assert.equal(r.headers.get('access-control-allow-origin'), null, 'sin CORS');
}

test('§3.9-1 · válido sin variables → 200 dryRun con la instantánea de complex', async (t) => {
  entorno(t, {});
  logs(t);
  const llamadas = simularFetch(t, []);
  const r = await handler.fetch(peticion(valido({ submission_id: ID })));
  cabecerasBase(r);
  assert.equal(r.status, 200);
  const b = await cuerpo(r);
  assert.equal(b.ok, true);
  assert.equal(b.folio, 'IK-6F1C2D');
  assert.equal(b.dryRun, true);
  assert.deepEqual(b.preview.contactSearch, [
    'GET /api/v4/contacts?query=ana%40empresa.mx',
    'GET /api/v4/contacts?query=%2B523312345678',
  ]);
  // Estructura aprobada (2026-10-20): solo web-cotizar + origen + entorno; lo demás va en campos.
  const tags = ['web-cotizar', 'orgánico', 'entorno-preview'];
  assert.deepEqual(b.preview.destino, { embudo: 'Ventas', etapa: 'Nueva cotización' });
  assert.deepEqual(b.preview.campos, {
    'Servicios de interés': ['Agentes de IA para WhatsApp', 'CRM con IA (Kommo o GoHighLevel)'],
    'Objetivo principal': 'Responder rápido a cada cliente',
    'Industria': 'Salud',
    'Tamaño de empresa': '11–50',
    'Presupuesto estimado': 'USD 3,000 a 5,000',
    'Plazo': 'En 1 a 3 meses',
    'CRM actual': 'Ninguno (Excel, libreta o solo WhatsApp)',
    'Canales que usa hoy': ['WhatsApp', 'Instagram'],
    'Contacto preferido': 'WhatsApp',
    'Página de origen': 'https://ingeniak.mx/servicios/agentes-ia-whatsapp/',
  });
  assert.deepEqual(b.preview.complex, [
    {
      name: 'Cotización web · Clínica Ejemplo',
      custom_fields_values: [{ field_code: 'REFERRER', values: [{ value: 'https://www.google.com/' }] }],
      _embedded: {
        tags: tags.map((name) => ({ name })),
        contacts: [
          {
            name: 'Ana Pérez',
            custom_fields_values: [
              { field_code: 'PHONE', values: [{ value: '+523312345678', enum_code: 'MOB' }] },
              { field_code: 'EMAIL', values: [{ value: 'ana@empresa.mx', enum_code: 'WORK' }] },
            ],
          },
        ],
        companies: [{ name: 'Clínica Ejemplo' }],
      },
    },
  ]);
  assert.deepEqual(b.preview.tags, tags);
  assert.equal(b.preview.note.length, 1);
  assert.equal(b.preview.note[0].note_type, 'common');
  assert.match(b.preview.note[0].params.text, /^Solicitud de cotización · sitio web · Folio IK-6F1C2D\n/);
  assert.match(b.preview.note[0].params.text, /\nEntorno: local$/);
  assert.equal(llamadas.length, 0, 'la simulación no llama a nadie');
});

test('simulación en Preview: etiqueta entorno-preview y embudo de las variables', async (t) => {
  entorno(t, { VERCEL_ENV: 'preview', KOMMO_PIPELINE_ID: '1111111', KOMMO_STATUS_ID: '2222222', KOMMO_RESPONSIBLE_USER_ID: '3333333' });
  logs(t);
  simularFetch(t, []);
  const b = await cuerpo(await handler.fetch(peticion(valido())));
  const lead = b.preview.complex[0];
  assert.equal(lead.pipeline_id, 1111111);
  assert.equal(lead.status_id, 2222222);
  assert.equal(lead.responsible_user_id, 3333333);
  assert.equal(lead.price, undefined, 'sin price');
  assert.equal(b.preview.tags.at(-1), 'entorno-preview');
  assert.deepEqual(b.preview.destino, { pipeline_id: 1111111, status_id: 2222222 }, 'las variables mandan sobre los nombres');
});

test('simulación en Preview con campaña: web-cotizar · campaña · entorno-preview', async (t) => {
  entorno(t, { VERCEL_ENV: 'preview' });
  logs(t);
  simularFetch(t, []);
  const b = await cuerpo(await handler.fetch(peticion(valido({ meta: { utm_medium: 'cpc', utm_source: 'google' } }))));
  assert.deepEqual(b.preview.tags, ['web-cotizar', 'campaña', 'entorno-preview']);
});

test('§3.9-7 · producción sin variables → 503 con respaldo (sin llamadas)', async (t) => {
  entorno(t, { VERCEL_ENV: 'production' });
  logs(t);
  const llamadas = simularFetch(t, []);
  const r = await handler.fetch(peticion(valido()));
  cabecerasBase(r);
  assert.equal(r.status, 503);
  assert.deepEqual(await cuerpo(r), { ok: false, error: 'El formulario no está disponible en este momento.', fallback: FALLBACK });
  assert.equal(llamadas.length, 0);

  // Solo subdominio (sin token) sigue siendo "sin variables".
  process.env.KOMMO_SUBDOMAIN = FAKE.subdominio;
  const r2 = await handler.fetch(peticion(valido()));
  assert.equal(r2.status, 503);
});

test('§3.9-9 · trampa llena o llenado en 900 ms → 200 silencioso sin ninguna llamada', async (t) => {
  entorno(t, kommoVars({ NOTIFY_WEBHOOK_URL: FAKE.webhook }));
  logs(t);
  const llamadas = simularFetch(t, []);
  const r1 = await handler.fetch(peticion(valido({ submission_id: ID, meta: { hp: 'https://spam.test' } })));
  assert.equal(r1.status, 200);
  assert.deepEqual(await cuerpo(r1), { ok: true, folio: 'IK-6F1C2D' });
  const r2 = await handler.fetch(peticion(valido({ submission_id: ID, meta: { t_llenado_ms: 900 } })));
  assert.equal(r2.status, 200);
  assert.deepEqual(await cuerpo(r2), { ok: true, folio: 'IK-6F1C2D' });
  const r3 = await handler.fetch(peticion({ ...valido({ meta: { t_llenado_ms: 900 } }), email: 'no-es-correo' }));
  assert.equal(r3.status, 200, 'el bot no recibe errores de validación');
  assert.equal(llamadas.length, 0, 'ni Kommo ni webhook');
});

test('§3.9-10 · origen, método, tamaño, tipo y JSON', async (t) => {
  entorno(t, {});
  logs(t);
  const llamadas = simularFetch(t, []);

  const otro = await handler.fetch(peticion(valido(), { headers: { origin: 'https://otro-sitio.test' } }));
  cabecerasBase(otro);
  assert.equal(otro.status, 403);
  assert.deepEqual(await cuerpo(otro), { ok: false, error: 'Origen no permitido.' });
  assert.equal((await handler.fetch(peticion(valido(), { headers: { origin: null } }))).status, 403, 'sin Origin → 403');

  const get = await handler.fetch(peticion(undefined, { method: 'GET' }));
  cabecerasBase(get);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('allow'), 'POST');
  assert.equal((await handler.fetch(peticion(undefined, { method: 'OPTIONS' }))).status, 405);

  const grande = await handler.fetch(peticion({ ...valido(), vision: 'x'.repeat(20 * 1024) }));
  cabecerasBase(grande);
  assert.equal(grande.status, 413);
  assert.deepEqual(await cuerpo(grande), { ok: false, error: 'La solicitud es demasiado grande.' });

  const texto = await handler.fetch(peticion(JSON.stringify(valido()), { headers: { 'content-type': 'text/plain' } }));
  cabecerasBase(texto);
  assert.equal(texto.status, 415);

  const roto = await handler.fetch(peticion('{"servicios": [', {}));
  assert.equal(roto.status, 400);
  assert.deepEqual(await cuerpo(roto), { ok: false, error: 'No pudimos leer la solicitud.' });
  assert.equal((await handler.fetch(peticion('[1,2]'))).status, 400, 'un arreglo no es una solicitud');
  assert.equal(llamadas.length, 0);
});

test('§3.9-10 · 7.º envío de la misma IP en 10 min → 429 con Retry-After', async (t) => {
  entorno(t, {});
  logs(t);
  simularFetch(t, []);
  const ip = ipNueva();
  for (let i = 1; i <= 6; i++) {
    const r = await handler.fetch(peticion(valido(), { ip }));
    assert.equal(r.status, 200, `envío ${i}`);
  }
  const r7 = await handler.fetch(peticion(valido(), { ip }));
  cabecerasBase(r7);
  assert.equal(r7.status, 429);
  const b = await cuerpo(r7);
  assert.equal(b.ok, false);
  assert.ok(b.retryAfter > 590 && b.retryAfter <= 600, `retryAfter ${b.retryAfter}`);
  assert.equal(r7.headers.get('retry-after'), String(b.retryAfter));
  assert.equal((await handler.fetch(peticion(valido(), { ip: ipNueva() }))).status, 200, 'otra IP sigue pasando');
});

test('astro dev sin IP (navegador local) no se limita; en Vercel sí', async (t) => {
  entorno(t, {});
  logs(t);
  simularFetch(t, []);
  for (let i = 1; i <= 8; i++) {
    const r = await handler.fetch(peticion(valido(), { headers: { 'x-forwarded-for': null } }));
    assert.equal(r.status, 200, `local, envío ${i}`);
  }
  process.env.VERCEL_ENV = 'preview';
  const estados = [];
  for (let i = 1; i <= 7; i++) estados.push((await handler.fetch(peticion(valido(), { headers: { 'x-forwarded-for': null } }))).status);
  assert.deepEqual(estados, [200, 200, 200, 200, 200, 200, 429]);
});

test('§3.9-10 · mismo submission_id dos veces → una sola llamada a Kommo y la misma respuesta', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 204 },
    { match: 'GET /leads/custom_fields', json: KOMMO.camposTracking },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', json: KOMMO.notaOk },
  ]);
  const envio = valido({ submission_id: ID });
  const r1 = await handler.fetch(peticion(envio));
  const r2 = await handler.fetch(peticion(envio));
  assert.equal(r1.status, 200);
  assert.equal(r2.status, 200);
  const b1 = await cuerpo(r1);
  assert.deepEqual(b1, { ok: true, folio: 'IK-6F1C2D', delivered: 'kommo' });
  assert.deepEqual(await cuerpo(r2), b1);
  assert.equal(llamadas.filter((c) => c.path === '/leads/complex').length, 1);

  // Doble clic simultáneo con otro id: también una sola llamada.
  const otro = valido();
  const [a, b] = await Promise.all([handler.fetch(peticion(otro)), handler.fetch(peticion(otro))]);
  assert.equal(a.status, 200);
  assert.deepEqual(await cuerpo(a), await cuerpo(b));
  assert.equal(llamadas.filter((c) => c.path === '/leads/complex').length, 2);
});

test('reintento tras 502 con el mismo submission_id → vuelve a intentar Kommo', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, [
    { match: 'GET /contacts', status: 503, json: { title: 'Service Unavailable' }, once: true },
    { match: 'GET /contacts', status: 204 },
    { match: 'GET /leads/custom_fields', json: KOMMO.camposTracking },
    { match: 'POST /leads/complex', json: KOMMO.complexOk },
    { match: 'POST /leads/notes', json: KOMMO.notaOk },
  ]);
  const envio = valido();
  const r1 = await handler.fetch(peticion(envio));
  assert.equal(r1.status, 502);
  assert.deepEqual(await cuerpo(r1), { ok: false, error: 'No pudimos registrar tu solicitud.', fallback: FALLBACK });
  const r2 = await handler.fetch(peticion(envio));
  assert.equal(r2.status, 200);
  assert.equal((await cuerpo(r2)).delivered, 'kommo');
  assert.equal(llamadas.filter((c) => c.path === '/leads/complex').length, 1);
});

test('sin submission_id válido el servidor crea uno (folio IK- + 6 hex)', async (t) => {
  entorno(t, {});
  logs(t);
  simularFetch(t, []);
  const b = await cuerpo(await handler.fetch(peticion({ ...valido(), submission_id: '<script>' })));
  assert.match(b.folio, /^IK-[0-9A-F]{6}$/);
});
