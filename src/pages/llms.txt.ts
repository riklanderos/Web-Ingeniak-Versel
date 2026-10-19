// /llms.txt (ESPEC-v2 §8.7): resumen para modelos de lenguaje, generado en el build desde sitemap.json, metrics.ts y la ficha.
// Solo páginas construidas, indexables y sin puerta pendiente (R8). Implementación: src/lib/llms.ts.
import type { APIRoute } from 'astro';
import { buildLlms, TEXT_HEADERS } from '../lib/llms';

export const prerender = true;
export const GET: APIRoute = () => new Response(buildLlms(), { headers: TEXT_HEADERS });
