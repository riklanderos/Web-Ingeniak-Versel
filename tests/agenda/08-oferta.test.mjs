// 8 · El precio de la Power Session que cobra Stripe es el mismo que publica el sitio: OFFERS['power-price'] de
// src/lib/metrics.ts (leído como texto) = `USD ${POWER_PRICE_CENTS / 100}`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { POWER_PRICE_CENTS, POWER_CURRENCY } from '../../shared/agenda.js';

test('oferta · OFFERS["power-price"] = USD POWER_PRICE_CENTS / 100', (t) => {
  assert.equal(POWER_PRICE_CENTS, 29700);
  assert.equal(POWER_CURRENCY, 'usd');
  const src = readFileSync(new URL('../../src/lib/metrics.ts', import.meta.url), 'utf8');
  const block = /export const OFFERS\s*=\s*\{([\s\S]*?)\}\s*as const/.exec(src);
  if (!block) {
    t.skip('OFFERS todavía no existe en src/lib/metrics.ts (lo agrega el orquestador, CAMBIO-COTIZAR §4.4)');
    return;
  }
  const m = /['"]power-price['"]\s*:\s*['"]([^'"]+)['"]/.exec(block[1]);
  assert.ok(m, 'OFFERS trae power-price');
  assert.equal(m[1], `USD ${POWER_PRICE_CENTS / 100}`);
});
