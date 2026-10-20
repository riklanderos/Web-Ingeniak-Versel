// 7 · Antispam: `website_url` lleno o `elapsed_ms < 2500` → 400 sin ninguna llamada (ni Google, ni Stripe, ni Kommo).
import test from 'node:test';
import assert from 'node:assert/strict';
import reservar from '../../api/agenda/reservar.js';
import { env, REAL, KOMMO, mockFetch, form, req, read } from './_util.mjs';

const body = (over) => ({ tipo: 'power', form: form('power'), start: '2026-10-21T16:00:00.000Z', origen: null, atribucion: {}, website_url: '', elapsed_ms: 40000, ...over });

for (const [desc, over] of [
  ['trampa llena', { website_url: 'https://spam.test' }],
  ['envío instantáneo (900 ms)', { elapsed_ms: 900 }],
  ['justo debajo del umbral (2499 ms)', { elapsed_ms: 2499 }],
]) {
  test(`api · reservar antispam: ${desc} → 400 sin llamadas`, async (t) => {
    env(t, { ...REAL, ...KOMMO });
    const calls = mockFetch(t);
    const r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body(over) })));
    assert.equal(r.status, 400);
    assert.deepEqual(r.body, { ok: false, error: 'No pudimos procesar la solicitud.' });
    assert.equal(calls.all.length, 0);
  });
}

test('api · reservar: 2500 ms o más pasa el filtro (llega a validación)', async (t) => {
  env(t, REAL);
  mockFetch(t);
  const r = await read(await reservar.fetch(req('/api/agenda/reservar/', { method: 'POST', body: body({ elapsed_ms: 2500, form: { ...form('power'), tools: '' } }) })));
  assert.equal(r.status, 422);
  assert.deepEqual(Object.keys(r.body.errors), ['tools']);
});
