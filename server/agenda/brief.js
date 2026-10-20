/**
 * Brief previo a la Power Session (opción A1): solo el alta, portada de `lib/brief/server.ts` de riklanderos.tech.
 * Tabla `public.power_briefs` del mismo Supabase (PostgREST). La página del brief vive en riklanderos.tech.
 * Sin Supabase configurado no hace nada (devuelve null): opción A2.
 */
import { randomBytes } from 'node:crypto';

export const BRIEFS_TABLE = 'power_briefs';
export const BRIEF_BASE = 'https://www.riklanderos.tech/brief/';

/** @param {string} token */
export function briefUrl(token) {
  return `${BRIEF_BASE}${token}`;
}

/**
 * @typedef {(path: string, o?: { method?: string, body?: unknown, prefer?: string }) => Promise<{ ok: boolean, status: number, data: any }>} Sb
 */

/**
 * @param {{ sb: Sb, supabaseOn: () => boolean }} db cliente PostgREST de leads.js
 */
export function createBrief(db) {
  /** @param {string} eventId */
  async function find(eventId) {
    const r = await db.sb(`/${BRIEFS_TABLE}?select=token&event_id=eq.${encodeURIComponent(eventId)}&limit=1`);
    return r.ok && Array.isArray(r.data) && r.data[0]?.token ? String(r.data[0].token) : null;
  }

  return {
    briefUrl,
    /**
     * Crea el brief de una Power Session o devuelve el existente. Idempotente por event_id. No lanza.
     * @param {{ eventId: string, stripeSessionId?: string | null, name?: string | null, email?: string | null,
     *           business?: string | null, sessionStart?: string | null }} input
     * @returns {Promise<string | null>}
     */
    async ensureBrief(input) {
      if (!db.supabaseOn()) return null;
      try {
        const found = await find(input.eventId);
        if (found) return found;
        const token = randomBytes(32).toString('base64url');
        const r = await db.sb(`/${BRIEFS_TABLE}?on_conflict=event_id`, {
          method: 'POST',
          prefer: 'resolution=ignore-duplicates,return=representation',
          body: {
            token,
            event_id: input.eventId,
            stripe_session_id: input.stripeSessionId ?? null,
            name: input.name?.slice(0, 120) ?? null,
            email: input.email?.slice(0, 254) ?? null,
            business: input.business?.slice(0, 160) ?? null,
            session_start: input.sessionStart ?? null,
          },
        });
        if (r.ok && Array.isArray(r.data) && r.data[0]?.token) return String(r.data[0].token);
        // Otra solicitud lo creó al mismo tiempo (o el upsert ignoró el duplicado).
        return await find(input.eventId);
      } catch (e) {
        console.error('[agenda] No se creó el brief:', e instanceof Error ? e.name : 'error');
        return null;
      }
    },
  };
}
