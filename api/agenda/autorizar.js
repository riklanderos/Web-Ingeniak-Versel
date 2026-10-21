/**
 * GET /api/agenda/autorizar/ · autorización ÚNICA del conector de Google (Vercel Connect), igual que el
 * /admin/agenda de riklanderos.tech: la aplicación llama startAuthorization con EL MISMO subject y los MISMOS
 * permisos que después usa googleToken() (server/agenda/google-auth.js). Así el permiso queda guardado bajo la
 * combinación exacta conector + subject + scope, que es lo único que getToken acepta
 * (developers: vercel.com/docs/connect/concepts/tokens, consultada el 2026-10-21).
 *
 * Dónde responde (nunca en una URL pública):
 *   - Preview y Development: siempre.
 *   - Producción: SOLO en las URLs internas del despliegue (ingeniak-<hash>-<equipo>.vercel.app y los alias
 *     ingeniak-git-<rama>-…), que Vercel protege con inicio de sesión del equipo (Deployment Protection).
 *     En ingeniak.mx e ingeniak.vercel.app responde 404, como /api/agenda/estado/.
 *
 * Flujo: GET → redirige a Google (prompt=consent) → Vercel completa el intercambio → regresa aquí con
 * ?verificar=1 → se pide un token de verdad con googleToken() y se responde el estado. Sin tokens ni datos
 * personales en logs ni respuestas.
 */
import { envName, json } from '../../server/http.js';
import { DEFAULT_CONNECTOR, DEFAULT_SUBJECT, GOOGLE_SCOPES, googleToken, hasOwnOAuth } from '../../server/agenda/google-auth.js';

/** URL interna del despliegue (protegida por Vercel) o alias de rama; el dominio público no pasa. */
export function hostInterno(host) {
  const h = String(host ?? '').toLowerCase();
  return /^ingeniak-[a-z0-9]{6,12}-[a-z0-9-]+\.vercel\.app$/.test(h) || /^ingeniak-git-[a-z0-9-]+\.vercel\.app$/.test(h);
}

export default {
  /** @param {Request} request */
  async fetch(request) {
    const url = new URL(request.url);
    const host = request.headers.get('x-forwarded-host') ?? url.host;
    if (envName() === 'production' && !hostInterno(host)) return json({ ok: false }, 404);
    if (request.method !== 'GET') return json({ ok: false }, 405, { allow: 'GET' });

    const env = process.env;
    const connector = (env.AGENDA_GOOGLE_CONNECTOR || DEFAULT_CONNECTOR).trim();
    const subject = (env.AGENDA_GOOGLE_SUBJECT || DEFAULT_SUBJECT).trim();

    if (hasOwnOAuth(env)) {
      return json({ ok: false, error: 'Este despliegue usa el plan B (GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN): no hay nada que autorizar en Vercel Connect.' }, 409);
    }

    // 2.º paso: ya volvimos de Google → comprobar que getToken funciona con la combinación exacta del sitio.
    if (url.searchParams.get('verificar') === '1') {
      try {
        await googleToken(env);
        return json({ ok: true, google: 'ok', conector: connector, subject, mensaje: 'Autorización guardada: la agenda ya puede leer y crear citas. Puedes cerrar esta pestaña.' });
      } catch (e) {
        return json({ ok: false, google: 'error', conector: connector, subject, error: e instanceof Error ? e.message : 'error' }, 503);
      }
    }

    // 1.er paso: iniciar la autorización con el subject y el scope EXACTOS que usa googleToken().
    try {
      const mod = await import('@vercel/connect');
      const volver = `https://${host}${url.pathname}${url.pathname.endsWith('/') ? '' : '/'}?verificar=1`;
      const res = await mod.startAuthorization(
        connector,
        { subject: { type: 'user', id: subject }, scopes: GOOGLE_SCOPES },
        { callbackUrl: volver, prompt: 'consent' },
      );
      return new Response(null, { status: 302, headers: { location: res.url, 'cache-control': 'no-store' } });
    } catch (e) {
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : 'error';
      console.error(JSON.stringify({ evento: 'agenda', accion: 'autorizar', ok: false, error: msg.slice(0, 160) }));
      return json({ ok: false, error: 'No se pudo iniciar la autorización. Revisa que el conector esté vinculado al proyecto y vuelve a intentar.', detalle: msg.slice(0, 160) }, 503);
    }
  },
};
