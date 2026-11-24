// «INGK · Línea de apertura» (campo 777638): la frase que usa la plantilla de WhatsApp de apertura.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cargar, entorno, KOMMO, kommoVars, logs, simularFetch } from './_util.mjs';

const { kommo } = await cargar();
beforeEach(() => kommo.__resetKommo());

test('Línea de apertura · se arma con el objetivo y los canales, en una sola línea', () => {
  assert.equal(
    kommo.lineaDeApertura({ objetivo: 'Responder rápido a cada cliente', canales: ['WhatsApp', 'Instagram'] }),
    'Vi que tu prioridad es responder rápido a cada cliente y que hoy atienden por WhatsApp e Instagram.',
  );
  assert.equal(kommo.lineaDeApertura({ objetivo: 'Conseguir más prospectos', canales: ['WhatsApp', 'Facebook', 'Sitio web', 'Correo'] }),
    'Vi que tu prioridad es conseguir más prospectos y que hoy atienden por WhatsApp, Facebook y sitio web.');
  assert.equal(kommo.lineaDeApertura({ objetivo: 'Ordenar ventas y seguimiento' }), 'Vi que tu prioridad es ordenar ventas y seguimiento.');
  assert.equal(kommo.lineaDeApertura({ canales: ['Teléfono'] }), 'Vi que hoy atienden por teléfono.');
});

test('Línea de apertura · sin datos da una frase genérica; nunca vacía, sin saltos y con tope', () => {
  for (const c of [undefined, null, {}, { objetivo: '  ', canales: [] }]) {
    assert.equal(kommo.lineaDeApertura(c), 'Ya revisé lo que nos compartiste sobre tu negocio.');
  }
  const larga = kommo.lineaDeApertura({ objetivo: `Algo\n con   saltos ${'x'.repeat(400)}`, canales: ['WhatsApp'] });
  assert.ok(larga.length <= 240);
  assert.ok(!/[\n\t]| {2,}/.test(larga));
});

const LEAD = { name: 'x', contact: { name: 'Ana', email: 'ana@empresa.mx' }, campos: { objetivo: 'Responder rápido a cada cliente', canales: ['WhatsApp', 'Instagram'] } };
const conCampo = (tipo) => [
  { match: 'GET /contacts', status: 204 },
  { match: 'GET /leads/pipelines', json: KOMMO.pipelines },
  { match: 'GET /leads/custom_fields', json: { _embedded: { custom_fields: [...KOMMO.campos._embedded.custom_fields, ...(tipo ? [{ id: 777638, name: 'INGK · Línea de apertura', type: tipo }] : [])] } } },
  { match: 'POST /leads/complex', json: KOMMO.complexOk },
];
const lineaEnviada = (llamadas) => (llamadas.find((c) => c.path === '/leads/complex').body[0].custom_fields_values ?? []).find((c) => c.field_id === 777638);

test('Línea de apertura · llega al lead cuando el campo existe como texto en la cuenta', async (t) => {
  entorno(t, kommoVars());
  logs(t);
  const llamadas = simularFetch(t, conCampo('text'));
  assert.equal((await kommo.createLeadWithNote(LEAD)).ok, true);
  assert.deepEqual(lineaEnviada(llamadas), { field_id: 777638, values: [{ value: 'Vi que tu prioridad es responder rápido a cada cliente y que hoy atienden por WhatsApp e Instagram.' }] });
});

test('Línea de apertura · no se manda si el campo no existe o no es de texto', async (t) => {
  for (const tipo of [null, 'select']) {
    t.mock.restoreAll();
    kommo.__resetKommo();
    entorno(t, kommoVars());
    logs(t);
    const llamadas = simularFetch(t, conCampo(tipo));
    assert.equal((await kommo.createLeadWithNote(LEAD)).ok, true);
    assert.equal(lineaEnviada(llamadas), undefined);
  }
});
