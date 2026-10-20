// src/scripts/landing/pagina.ts — entrada de sitemap.json de las landings ocultas (/discovery/, /power-session/), área landings.
// Se usa en el build (rutas de src/pages), no en el navegador.
//
// sitemap.json (orquestador) es la fuente: secciones y placas (§4.2/§4.3), hidden/indexable, primaryCta '#agenda',
// footerAnchors y folio. Aquí solo se blindan las dos reglas de R17 que, si un dato cambiara por error, romperían la
// landing (check-cta §6.2-3), sin pisar nada que ya venga bien:
//   · hidden !== true → hidden: true, indexable: false (noindex,follow);
//   · primaryCta que no reserva en la página → mismo texto con href '#agenda' (nunca la agenda externa de v1);
//   · secciones del copy con _kind (agenda, quiz, twin, offer, guarantee, host) que el sitemap no liste → se insertan tras
//     su vecina anterior del copy (la reserva nunca desaparece de la página por un dato faltante);
//   · internalLinks sin agenda.ingeniak.tech.
import { pages, getCopy, type Page } from '../../lib/site';

type Url = '/discovery/' | '/power-session/';

export function landingPage(url: Url): Page {
  const base = (pages as any[]).find((p) => p.url === url);
  if (!base) throw new Error(`[landings] ${url} no está en src/data/sitemap.json (CAMBIO-COTIZAR §4.2/§4.3, orquestador)`);
  const p: any = { ...base };
  const S: Record<string, any> = getCopy(p.id)?.sections ?? {};

  if (p.hidden !== true) { p.hidden = true; p.indexable = false; }

  if (!p.primaryCta || typeof p.primaryCta.href !== 'string' || !p.primaryCta.href.startsWith('#agenda')) {
    p.primaryCta = { label: S.hero?.ctaPrimary?.label ?? p.primaryCta?.label, short: p.primaryCta?.short ?? 'Agendar', href: '#agenda' };
  }

  const secs: any[] = [...(p.sections ?? [])];
  const keys = Object.keys(S);
  keys.forEach((id, i) => {
    if (!S[id]?._kind || secs.some((s) => s.id === id)) return;
    let at = 0;
    for (let k = i - 1; k >= 0; k--) {
      const j = secs.findIndex((s) => s.id === keys[k]);
      if (j >= 0) { at = j + 1; break; }
    }
    secs.splice(at, 0, { id, name: S[id].rail ?? id, cinematic: false });
  });
  p.sections = secs;

  p.internalLinks = ((p.internalLinks ?? []) as string[]).filter((h) => !/agenda\.ingeniak\.tech/i.test(h));
  return p as Page;
}
