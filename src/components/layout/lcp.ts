// src/components/layout/lcp.ts — candidatos de srcset de una placa (ESPEC §8.2, §8.3, §12.2 R9).
// BaseLayout lo usa para las dos precargas excluyentes de la placa LCP; ImageSection (cine) debería usar
// exactamente los mismos anchos y `sizes` para que la precarga y el <picture> pidan el mismo archivo.
import { getPlate } from '../../lib/site';

export const DESK_W = [1280, 1920, 2560, 2752];
export const MOB_W = [640, 828, 1080, 1536];
/** Condición de arte dirigido por proporción (la misma del <source media> de ImageSection, §3.6). */
export const MQ_MOBILE = '(max-width: 767px), (max-aspect-ratio: 5/6)';
export const MQ_DESK = '(min-width: 768px) and (min-aspect-ratio: 5/6)';

export type PlateSources = {
  desk: { srcset: string; sizes: string; media: string };
  mob: { srcset: string; sizes: string; media: string } | null;
};

/**
 * @param id        id de la placa (plates.json)
 * @param srcsetMax tope de ancho de escritorio (2752 portadas / 1920 resto). Por defecto, el de la placa o 2752.
 * @param mobMax    tope móvil (1536 portadas, 1080 resto). Por defecto 1536.
 */
export function plateSources(id: string, srcsetMax?: number, mobMax = 1536, fmt: 'avif' | 'webp' = 'avif'): PlateSources | null {
  const p = getPlate(id);
  if (!p?.d?.src) return null;
  const max = srcsetMax ?? p.srcsetMax ?? 2752;
  const dw = DESK_W.filter((w) => w <= Math.min(max, p.d.w ?? 9999));
  const desk = {
    srcset: dw.map((w) => `${p.d.src}-${w}.${fmt} ${w}w`).join(', '),
    sizes: `(max-aspect-ratio: ${p.d.ar}) ${Math.ceil(p.d.ar * 100)}svh, 100vw`,
    media: MQ_DESK,
  };
  const mw = p.m?.src ? MOB_W.filter((w) => w <= Math.min(mobMax, p.m.w ?? 9999)) : [];
  const mob = mw.length ? { srcset: mw.map((w) => `${p.m.src}-${w}.${fmt} ${w}w`).join(', '), sizes: '100vw', media: MQ_MOBILE } : null;
  return { desk, mob };
}
