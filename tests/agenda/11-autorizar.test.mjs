// 11 · /api/agenda/autorizar/ · la autorización única del conector solo responde en URLs internas
// (Vercel las protege con inicio de sesión) y nunca inicia nada cuando el despliegue usa el plan B.
// El viaje completo a Google no se prueba aquí: depende de Vercel Connect en vivo.
import test from 'node:test';
import assert from 'node:assert/strict';
import autorizar, { hostInterno } from '../../api/agenda/autorizar.js';
import { env, read, captureLogs } from './_util.mjs';

const req = (host, { method = 'GET', path = '/api/agenda/autorizar/' } = {}) =>
  new Request(`https://${host}${path}`, { method, headers: { 'x-forwarded-host': host } });

test('hostInterno · acepta solo las URLs internas del despliegue, nunca los dominios públicos', () => {
  assert.equal(hostInterno('ingeniak-p2bdcu54q-ingeniak.vercel.app'), true);
  assert.equal(hostInterno('ingeniak-git-main-ingeniak.vercel.app'), true);
  assert.equal(hostInterno('INGENIAK-P2BDCU54Q-INGENIAK.VERCEL.APP'), true);
  for (const publico of ['ingeniak.mx', 'www.ingeniak.mx', 'ingeniak.vercel.app', 'evil-ingeniak-p2bdcu54q-ingeniak.vercel.app.evil.com', 'ingeniak-p2bdcu54q-ingeniak.vercel.app.evil.com', '', null]) {
    assert.equal(hostInterno(publico), false, String(publico));
  }
});

test('producción · en el dominio público responde 404; otros métodos 405', async (t) => {
  captureLogs(t);
  env(t, { VERCEL_ENV: 'production' });
  const r = await read(await autorizar.fetch(req('ingeniak.mx')));
  assert.equal(r.status, 404);
  const r2 = await read(await autorizar.fetch(req('ingeniak-p2bdcu54q-ingeniak.vercel.app', { method: 'POST' })));
  assert.equal(r2.status, 405);
});

test('plan B activo (GOOGLE_*) · responde 409 sin llamar a nadie', async (t) => {
  captureLogs(t);
  env(t, { VERCEL_ENV: 'preview', GOOGLE_CLIENT_ID: 'id-prueba', GOOGLE_CLIENT_SECRET: 'secreto-prueba', GOOGLE_REFRESH_TOKEN: 'refresh-prueba' });
  const r = await read(await autorizar.fetch(req('ingeniak-git-rama-ingeniak.vercel.app')));
  assert.equal(r.status, 409);
  assert.match(r.body.error, /plan B/);
});
