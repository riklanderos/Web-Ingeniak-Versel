// /llms-full.txt (ESPEC-v2 §8.7): texto visible de las páginas indexables (copy aprobado + banco de FAQ),
// con los tokens de cifras y precio resueltos (tokensToText de ui-data). Fuera: casos breves en noindex (R2/R8).
import type { APIRoute } from 'astro';
import { buildLlmsFull, TEXT_HEADERS } from '../lib/llms';

export const prerender = true;
export const GET: APIRoute = () => new Response(buildLlmsFull(), { headers: TEXT_HEADERS });
