// El ID de Analytics del visitante viaja con la cotización y con la cita hasta el campo de rastreo GCLIENTID de Kommo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanMeta, trackingFor, buildKommo, validate } from '../../server/cotizar.js';
import { valido } from '../cotizar/_util.mjs';
import { bookingAttribution, kommoNote } from '../../server/agenda/leads.js';

test('cotización · solo pasa un ID de Analytics con forma válida', () => {
  assert.equal(cleanMeta({ ga_client_id: '123456789.1700000000' }).ga_client_id, '123456789.1700000000');
  for (const malo of ['GA1.1.123.456', 'abc.def', '123', '1.2.3', '<script>', 42]) {
    assert.equal(cleanMeta({ ga_client_id: malo }).ga_client_id, '', String(malo));
  }
  assert.deepEqual(trackingFor(cleanMeta({ utm_source: 'chatgpt.com', ga_client_id: '1.2' })), { UTM_SOURCE: 'chatgpt.com', GCLIENTID: '1.2' });
  assert.deepEqual(trackingFor(cleanMeta({ utm_source: 'chatgpt.com' })), { UTM_SOURCE: 'chatgpt.com' });
});

test('cita · el ID de Analytics entra a la atribución y a la nota; uno inválido se descarta', () => {
  assert.equal(bookingAttribution({ ga_client_id: '987.654' }).gaClientId, '987.654');
  assert.equal(bookingAttribution({ ga_client_id: 'GA1.1.987.654' }).gaClientId, null);
  assert.equal(bookingAttribution({}).gaClientId, null);
  const nota = kommoNote({
    type: 'discovery',
    form: { fullName: 'Ana', businessName: 'Empresa', whatsapp: '+523312345678', email: 'a@b.mx', industry: 'Salud', teamSize: '1–10', revenue: 'x', timeDrains: [], tools: '', goal: '', website: '' },
    startIso: '2026-11-20T17:00:00.000Z',
    origin: null,
    eventId: 'abcdef123',
    attribution: bookingAttribution({ ga_client_id: '987.654' }),
  });
  assert.match(nota, /^ID de Analytics: 987\.654$/m);
});

test('cotización · buildKommo manda GCLIENTID y lo anota', () => {
  const v = validate(valido());
  assert.equal(v.ok, true);
  const data = { ...v.data, submission_id: '6f1c2d3e-4b5a-4c3d-8e2f-1a2b3c4d5e6f', folio: 'IK-6F1C2D' };
  const k = buildKommo(data, cleanMeta({ utm_source: 'chatgpt.com', ga_client_id: '555.666' }), {}, new Date('2026-11-19T18:00:00Z'));
  assert.equal(k.tracking.GCLIENTID, '555.666');
  assert.match(k.note, /^ID de Analytics: 555\.666$/m);
  const sin = buildKommo(data, cleanMeta({}), {}, new Date('2026-11-19T18:00:00Z'));
  assert.equal(sin.tracking.GCLIENTID, undefined);
  assert.doesNotMatch(sin.note, /ID de Analytics/);
});
