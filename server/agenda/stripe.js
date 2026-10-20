/**
 * Stripe Checkout por REST con `fetch` (sin SDK). Misma versión de API que fija `stripe@19.3.0` en riklanderos.tech
 * (CAMBIO-COTIZAR D10 y §5.2). Llave: STRIPE_SECRET_KEY (la de la cuenta que cobra; opción A: la misma de riklanderos).
 * Ninguna llave ni respuesta completa de Stripe sale en logs: solo código HTTP y tipo de error.
 */
import { AgendaConfigError } from './google-auth.js';

const API = 'https://api.stripe.com/v1';
export const STRIPE_VERSION = '2025-10-29.clover';
const TIMEOUT_MS = 12_000;

/** Error de la API de Stripe (código HTTP y tipo; sin el mensaje, que puede repetir datos de la petición). */
export class StripeError extends Error {
  /** @param {number} status @param {string} type */
  constructor(status, type) {
    super(`Stripe ${status}: ${type}`);
    this.name = 'StripeError';
    this.status = status;
    this.type = type;
  }
}

/**
 * @typedef {{
 *   id: string, url?: string | null, status?: 'open' | 'complete' | 'expired', payment_status?: 'paid' | 'unpaid' | 'no_payment_required',
 *   expires_at?: number, metadata?: Record<string, string>, customer_email?: string | null,
 *   customer_details?: { email?: string | null } | null
 * }} CheckoutSession
 */

/** @param {NodeJS.ProcessEnv} [env] */
export function stripeKey(env = process.env) {
  const key = env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new AgendaConfigError('Falta STRIPE_SECRET_KEY');
  return key;
}

/** ¿La llave cobra de verdad? (sk_live_ / rk_live_) */
export function stripeLive(env = process.env) {
  return /^(sk|rk)_live_/.test(stripeKey(env));
}

/**
 * Objeto anidado → cuerpo `application/x-www-form-urlencoded` con la notación de Stripe
 * (`line_items[0][price_data][currency]=usd`, `metadata[rl_event]=…`).
 * @param {Record<string, unknown>} obj
 */
export function toForm(obj) {
  const out = new URLSearchParams();
  /** @param {unknown} v @param {string} key */
  const add = (v, key) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((x, i) => add(x, `${key}[${i}]`));
    else if (typeof v === 'object') for (const [k, x] of Object.entries(v)) add(x, `${key}[${k}]`);
    else out.append(key, String(v));
  };
  for (const [k, v] of Object.entries(obj)) add(v, k);
  return out;
}

/**
 * @template T
 * @param {string} path
 * @param {{ method?: string, body?: URLSearchParams, idempotencyKey?: string }} [opts]
 * @returns {Promise<T>}
 */
async function sfetch(path, { method = 'GET', body, idempotencyKey } = {}) {
  /** @type {Record<string, string>} */
  const headers = { authorization: `Bearer ${stripeKey()}`, 'stripe-version': STRIPE_VERSION };
  if (body) headers['content-type'] = 'application/x-www-form-urlencoded';
  if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;
  const res = await fetch(`${API}${path}`, { method, headers, body, signal: AbortSignal.timeout(TIMEOUT_MS) });
  /** @type {any} */
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new StripeError(res.status, String(j?.error?.type ?? j?.error?.code ?? 'error').slice(0, 60));
  return j;
}

/**
 * POST /v1/checkout/sessions. `Idempotency-Key: ik-hold-<eventId>` (un apartado = un Checkout, aunque se reintente).
 * @param {Record<string, any>} params parámetros de Stripe (flujo-agenda §1.6 + metadata[rl_sitio])
 * @returns {Promise<CheckoutSession>}
 */
export async function createCheckout(params) {
  const ev = params?.metadata?.rl_event;
  return sfetch('/checkout/sessions', { method: 'POST', body: toForm(params), idempotencyKey: ev ? `ik-hold-${ev}` : undefined });
}

/** @param {string} id @returns {Promise<CheckoutSession>} */
export async function retrieveCheckout(id) {
  return sfetch(`/checkout/sessions/${encodeURIComponent(id)}`);
}

/** @param {string} id @returns {Promise<CheckoutSession>} */
export async function expireCheckout(id) {
  return sfetch(`/checkout/sessions/${encodeURIComponent(id)}/expire`, { method: 'POST' });
}

/** Solo diagnóstico: ¿la llave responde? (lista 1 sesión, sin datos en la respuesta del endpoint). */
export async function pingStripe() {
  await sfetch('/checkout/sessions?limit=1');
  return true;
}

/** Adaptador de producción (misma interfaz que el mock). */
export const stripe = { createCheckout, retrieveCheckout, expireCheckout, stripeLive: () => stripeLive(), ping: pingStripe };
