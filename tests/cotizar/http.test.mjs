// server/http.js · API compartida con la agenda (CAMBIO-COTIZAR §3.7).
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cargar, entorno } from './_util.mjs';

const { http } = await cargar();
const { json, readJson, sameOrigin, clientIp, throttle, clean, envName } = http;

beforeEach(() => http.__resetHttp());

test('http · json(): cabeceras no-store, noindex y JSON utf-8', async () => {
  const r = json({ ok: true }, 201, { 'retry-after': '5' });
  assert.equal(r.status, 201);
  assert.equal(r.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('x-robots-tag'), 'noindex');
  assert.equal(r.headers.get('retry-after'), '5');
  assert.deepEqual(await r.json(), { ok: true });
  const vacio = json(null, 405, { allow: 'POST' });
  assert.equal(vacio.headers.get('allow'), 'POST');
  assert.equal(await vacio.text(), '');
});

test('http · readJson(): 415, 413 (declarado y leído), 400 y ok', async () => {
  const mk = (body, headers = {}) =>
    new Request('http://x.test/api/', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body });
  assert.deepEqual(await readJson(mk('{}', { 'content-type': 'text/plain' })), { ok: false, status: 415 });
  assert.deepEqual(await readJson(new Request('http://x.test/', { method: 'POST', body: '{}' })), { ok: false, status: 415 });
  assert.deepEqual(await readJson(mk('{"a":1}', { 'content-length': '99999' }), { limit: 100 }), { ok: false, status: 413 });
  assert.deepEqual(await readJson(mk(`{"a":"${'x'.repeat(200)}"}`), { limit: 100 }), { ok: false, status: 413 });
  assert.deepEqual(await readJson(mk('{roto')), { ok: false, status: 400 });
  assert.deepEqual(await readJson(mk('')), { ok: false, status: 400 });
  assert.deepEqual(await readJson(mk('{"a":1}', { 'content-type': 'application/json; charset=utf-8' })), { ok: true, data: { a: 1 } });
  assert.deepEqual(await readJson(mk('{"ñ":"á"}')), { ok: true, data: { ñ: 'á' } });
});

test('http · sameOrigin(): host de Origin = x-forwarded-host ?? host; sin Origin → false', () => {
  const mk = (headers) => new Request('http://127.0.0.1:4321/api/cotizar/', { method: 'POST', headers });
  assert.equal(sameOrigin(mk({ origin: 'http://127.0.0.1:4321', host: '127.0.0.1:4321' })), true);
  assert.equal(sameOrigin(mk({ host: '127.0.0.1:4321' })), false);
  assert.equal(sameOrigin(mk({ origin: 'null', host: '127.0.0.1:4321' })), false);
  assert.equal(sameOrigin(mk({ origin: 'https://otro.test', host: '127.0.0.1:4321' })), false);
  assert.equal(sameOrigin(mk({ origin: 'http://127.0.0.1:4322', host: '127.0.0.1:4321' })), false);
  assert.equal(
    sameOrigin(mk({ origin: 'https://ingeniak.mx', host: 'interno.vercel.app', 'x-forwarded-host': 'ingeniak.mx' })),
    true,
  );
  assert.equal(
    sameOrigin(mk({ origin: 'https://interno.vercel.app', host: 'interno.vercel.app', 'x-forwarded-host': 'ingeniak.mx' })),
    false,
  );
  assert.equal(sameOrigin(mk({ origin: 'http://127.0.0.1:4321' })), true, 'sin host usa el de la URL');
});

test('http · clientIp(): primer x-forwarded-for, luego x-real-ip', () => {
  const mk = (headers) => new Request('http://x.test/', { headers });
  assert.equal(clientIp(mk({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' })), '1.2.3.4');
  assert.equal(clientIp(mk({ 'x-real-ip': '5.6.7.8' })), '5.6.7.8');
  assert.equal(clientIp(mk({})), 'desconocida');
});

test('http · throttle(): max por ventana, retryAfter en segundos y claves independientes', () => {
  const opts = { max: 3, windowMs: 60_000 };
  for (let i = 0; i < 3; i++) assert.deepEqual(throttle('a', opts), { ok: true, retryAfter: 0 });
  const r = throttle('a', opts);
  assert.equal(r.ok, false);
  assert.ok(r.retryAfter > 0 && r.retryAfter <= 60);
  assert.equal(throttle('b', opts).ok, true);
});

test('http · clean(): sin caracteres de control, trim, recorte y saltos opcionales', () => {
  assert.equal(clean('  hola\u0000 mundo​  '), 'hola mundo');
  assert.equal(clean('a\tb\nc'), 'a b c');
  assert.equal(clean('abcdef', 3), 'abc');
  assert.equal(clean('😀😀😀', 5), '😀😀', 'no parte un carácter');
  assert.equal(clean(42), '');
  assert.equal(clean(null), '');
  assert.equal(clean(' uno\r\n\n\n\ndos ', Infinity, { lines: true }), 'uno\n\ndos');
});

test('http · envName(): production | preview | development | local', (t) => {
  entorno(t, {});
  assert.equal(envName(), 'local');
  process.env.VERCEL_ENV = 'preview';
  assert.equal(envName(), 'preview');
  process.env.VERCEL_ENV = 'production';
  assert.equal(envName(), 'production');
  process.env.VERCEL_ENV = 'otra-cosa';
  assert.equal(envName(), 'local');
});
