// src/components/cine/plate.ts — resolución de placas para las escenas del área "cine" (ESPEC §3.4, §3.5, §12.2 R4/R5/R9).
// API pública (otras áreas pueden importarla):
//   resolvePlate(key, { mirror, layout, fallbackPlate, srcsetMax, mobileMax }) → Resolved
//   anchorStyle(name, { side? })  → style="…" para colocar UI propia en un ancla de la placa de su sección
//   AURA_ISOTIPO, AURA_ONDAS      → auras ya desenfocadas (sin filter en vivo)
//   safeEdge(r)                   → borde de la zona segura de texto del lado del texto (también --safe-edge-d en r.vars)
// Reglas: si la placa no está en plates.json o sus archivos aún no se exportan, se usa `fallbackPlate`
// (respaldo de lanzamiento) y, si tampoco existe, un aura del isotipo de cristal con la misma penumbra y retícula.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getPlate } from '../../lib/site';
import auraIso from './assets/aura-isotipo.webp';
import auraOndas from './assets/aura-ondas.webp';

export const AURA_ISOTIPO = auraIso.src;
export const AURA_ONDAS = auraOndas.src;
/** Medidas intrínsecas (check-pesos: toda <img> lleva width/height). Copia desenfocada horneada: 320 × 179 (plates.mjs). */
export const RACK_SIZE = { w: 320, h: 179 } as const;
export const AURA_ISOTIPO_SIZE = { w: auraIso.width, h: auraIso.height } as const;
export const AURA_ONDAS_SIZE = { w: auraOndas.width, h: auraOndas.height } as const;
/** width/height de una copia desenfocada (-rack-320.webp) o del aura del isotipo que la reemplaza. */
export function rackSize(src: string | null | undefined): { w: number; h: number } {
  return src && /-rack-320\.webp$/.test(src) ? RACK_SIZE : src === AURA_ISOTIPO ? AURA_ISOTIPO_SIZE : RACK_SIZE;
}

export type Layout = 'subject-right' | 'subject-left' | 'subject-center';
export type Fallback = string | { plate: string; mirror?: boolean; note?: string } | null | undefined;
type XY = [number, number];
type Box = [number, number, number, number];   // [x0, y0, x1, y1] (subject, safe)
export type Box4 = [number, number, number, number];  // [x, y, w, h] (anclas de caja)

export interface Resolved {
  requested: string;
  id: string | null;          // placa usada (null = aura)
  aura: boolean;
  usedFallback: boolean;
  mirror: boolean;
  layout: Layout;
  alt: string;
  d: { src: string; w: number; h: number; ar: number; fx: number; fy: number; fadeFrom: number };
  m: { src: string; w: number; h: number; ar: number; fx: number; fy: number; subjTop: number };
  /** d/m: punto del ancla (en las de caja, su esquina superior izquierda ya espejada); box: [x, y, w, h] de las anclas
   *  de caja (pantalla, telefono, tableta, superficie…), espejada como 1 − x − w. */
  anchors: Record<string, { d: XY | null; m: XY | null; box?: { d: Box4 | null; m: Box4 | null }; scrW?: number }>;
  subject: { d: Box | null; m: Box | null };
  leak: { d: XY; m: XY };
  grade: number;
  srcset: { avifD: string; webpD: string; avifM: string; webpM: string; imgSrc: string; sizesD: string };
  rack: string | null;        // copia desenfocada horneada (-rack-320.webp)
  still: string | null;       // still 21:9 de 640 px
  cut: string | null;         // recorte con alfa (-cut-1920.webp), mismas dimensiones que la placa
  vars: string;               // variables CSS del escenario registrado
  mnull: string;              // anclas sin coordenadas móviles (data-mnull)
  safeEdge: number | null;    // borde de la zona segura de texto del lado del texto (fracción de la placa; también --safe-edge-d)
}

const PUB = join(process.cwd(), 'public');
const fileExists = (p: string) => { try { return existsSync(join(PUB, p)); } catch { return false; } };
const DESK = [1280, 1920, 2560, 2752];
const MOB = [640, 828, 1080, 1536];
const r4 = (n: number) => Math.round(n * 10000) / 10000;
const fx = (x: number, mir: boolean) => (mir ? r4(1 - x) : x);
const fbox = (b: Box | null | undefined, mir: boolean): Box | null => (b ? (mir ? [r4(1 - b[2]), b[1], r4(1 - b[0]), b[3]] : b) : null);
const swap = (l: Layout): Layout => (l === 'subject-right' ? 'subject-left' : l === 'subject-left' ? 'subject-right' : l);

/** ¿La placa está registrada y exportada (escritorio y vertical)? */
export function plateReady(id: string | null | undefined): boolean {
  if (!id) return false;
  const p = getPlate(id);
  if (!p?.d?.src || !p?.m?.src) return false;
  return fileExists(`${p.d.src}-1280.webp`) && fileExists(`${p.m.src}-640.webp`);
}

export interface ResolveOpts {
  mirror?: boolean;
  layout?: Layout;
  fallbackPlate?: Fallback;
  srcsetMax?: number;   // R9: 2752 en portadas y push; 1920 en el resto (sin valor: el de plates.json o 2752)
  mobileMax?: number;   // R9: 1080 (1536 en portadas)
  alt?: string;         // R11: "" en placas decorativas o repetidas
  where?: string;       // para el aviso en dev
}

export function resolvePlate(key: string, o: ResolveOpts = {}): Resolved {
  let id: string | null = key;
  let mirror = !!o.mirror;
  let usedFallback = false;
  if (!plateReady(id)) {
    const fb = typeof o.fallbackPlate === 'string' ? { plate: o.fallbackPlate } : o.fallbackPlate || null;
    if (fb && plateReady(fb.plate)) {
      id = fb.plate; usedFallback = true;
      if (fb.mirror !== undefined) mirror = !!fb.mirror;
    } else id = null;
    if (import.meta.env.DEV) {
      console.warn(`[cine] placa "${key}" no disponible${o.where ? ` (${o.where})` : ''} → ${id ? `respaldo "${id}"${mirror ? ' en espejo' : ''}` : 'aura del isotipo'}`);
    }
  }
  const p = id ? getPlate(id) : null;
  const aura = !p;

  // Lado del sujeto: el de la placa (espejado si aplica) salvo que la página lo fije.
  const baseLayout: Layout = (p?.layout as Layout) ?? 'subject-right';
  const layout: Layout = o.layout ?? (mirror ? swap(baseLayout) : baseLayout);

  // Placa virtual del aura (16:9 / 4:5): el aura ocupa el lado del sujeto.
  const auraX = layout === 'subject-left' ? 0.3 : layout === 'subject-center' ? 0.5 : 0.7;
  const d = p
    ? { src: p.d.src, w: p.d.w, h: p.d.h, ar: p.d.ar, fx: fx(p.d.fx ?? 0.5, mirror), fy: p.d.fy ?? 0.5, fadeFrom: p.d.fadeFrom ?? 0.82 }
    : { src: '', w: 1920, h: 1080, ar: 1.7778, fx: 0.5, fy: 0.5, fadeFrom: 0.86 };
  const m = p
    ? { src: p.m.src, w: p.m.w, h: p.m.h, ar: p.m.ar, fx: fx(p.m.fx ?? 0.5, mirror), fy: p.m.fy ?? 1, subjTop: p.m.subjTop ?? 0.45 }
    : { src: '', w: 1080, h: 1350, ar: 0.8, fx: 0.5, fy: 1, subjTop: 0.45 };

  const anchors: Resolved['anchors'] = {};
  if (p?.anchors) {
    const bx = (v: any): Box4 | null => (Array.isArray(v) && v.length >= 4 ? [mirror ? r4(1 - v[0] - v[2]) : v[0], v[1], v[2], v[3]] : null);
    const pt = (v: any): XY | null => (Array.isArray(v) && v.length >= 2 ? (v.length >= 4 ? [bx(v)![0], v[1]] : [fx(v[0], mirror), v[1]]) : null);
    for (const [name, a] of Object.entries<any>(p.anchors)) {
      const isBox = (a?.d?.length ?? 0) >= 4 || (a?.m?.length ?? 0) >= 4;
      anchors[name] = {
        d: pt(a?.d),
        m: pt(a?.m),
        box: isBox ? { d: bx(a?.d), m: bx(a?.m) } : undefined,
        scrW: a?.scrW,
      };
    }
  } else {
    anchors.pecho = { d: [auraX, 0.46], m: [0.5, 0.7] };
    anchors.piso = { d: [0.5, 0.9], m: [0.5, 0.94] };
  }
  const pecho = anchors.pecho ?? anchors.rostro ?? { d: [auraX, 0.46], m: [0.5, 0.7] };
  const cxd = pecho.d ?? [auraX, 0.46];
  const cxm = pecho.m ?? [0.5, 0.7];
  const leakD: XY = p?.leak?.d ? [fx(p.leak.d[0], mirror), p.leak.d[1]] : [cxd[0] + (layout === 'subject-left' ? -0.08 : 0.08), Math.max(0.2, cxd[1] - 0.16)];
  const leakM: XY = p?.leak?.m ? [fx(p.leak.m[0], mirror), p.leak.m[1]] : [cxm[0] + 0.1, Math.max(0.4, cxm[1] - 0.18)];

  const maxD = Math.min(o.srcsetMax ?? p?.srcsetMax ?? 2752, d.w); // = plateSources() de layout/lcp.ts (precarga LCP)
  const maxM = Math.min(o.mobileMax ?? 1080, m.w);
  const wd = DESK.filter((w) => w <= Math.max(maxD, 1280));
  const wm = MOB.filter((w) => w <= Math.max(maxM, 640));
  const set = (base: string, ws: number[], ext: string) => ws.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
  const srcset = p
    ? {
        avifD: set(d.src, wd, 'avif'), webpD: set(d.src, wd, 'webp'),
        avifM: set(m.src, wm, 'avif'), webpM: set(m.src, wm, 'webp'),
        imgSrc: `${d.src}-${wd.includes(1920) ? 1920 : wd[wd.length - 1]}.webp`,
        sizesD: `(max-aspect-ratio: ${d.ar}) ${Math.ceil(d.ar * 100)}svh, 100vw`,
      }
    : { avifD: '', webpD: '', avifM: '', webpM: '', imgSrc: '', sizesD: '' };
  const rack = p && fileExists(`${d.src}-rack-320.webp`) ? `${d.src}-rack-320.webp` : null;
  const still = p && fileExists(`${d.src}-still-640.webp`) ? `${d.src}-still-640.webp` : null;
  const cut = p && fileExists(`${d.src}-cut-1920.webp`) ? `${d.src}-cut-1920.webp` : null;

  const mnull: string[] = [];
  let anchorVars = '';
  for (const [name, a] of Object.entries(anchors)) {
    if (a.d) anchorVars += `--A-${name}-x:${a.d[0]};--A-${name}-y:${a.d[1]};`;
    if (a.m) anchorVars += `--A-${name}-xm:${a.m[0]};--A-${name}-ym:${a.m[1]};`;
    else mnull.push(name);
    if (a.box?.d) anchorVars += `--A-${name}-w:${a.box.d[2]};--A-${name}-h:${a.box.d[3]};`;
    if (a.box?.m) anchorVars += `--A-${name}-wm:${a.box.m[2]};--A-${name}-hm:${a.box.m[3]};`;
  }
  // Caja del sujeto (las máscaras laterales del ultra ancho nunca lo tocan, §3.5) y su franja en la placa vertical.
  const sd = fbox(p?.subject?.d, mirror), sm = fbox(p?.subject?.m, mirror);
  const subjVars = (sd ? `--sx0:${sd[0]};--sx1:${sd[2]};--sy0:${sd[1]};--sy1:${sd[3]};` : '') + (sm ? `--sx0-m:${sm[0]};--sx1-m:${sm[2]};--sy0-m:${sm[1]};--sy1-m:${sm[3]};` : '');
  // Borde de la zona segura de texto (safe.d) del lado del texto, ya espejado: --safe-edge-d (ImageSection safeCol).
  const edge = safeEdgeOf(p?.safe?.d, mirror, layout);
  const vars =
    `--ar-d:${d.ar};--fx-d:${d.fx};--fy-d:${d.fy};--ar-m:${m.ar};--fx-m:${m.fx};--fy-m:${m.fy};` +
    `--fade-from:${d.fadeFrom};--subj-top-m:${m.subjTop};--cx-d:${cxd[0]};--cy-d:${cxd[1]};--cx-m:${cxm[0]};--cy-m:${cxm[1]};` +
    `--lx-d:${r4(leakD[0])};--ly-d:${r4(leakD[1])};--lx-m:${r4(leakM[0])};--ly-m:${r4(leakM[1])};--grade:${p ? (p.grade ?? 0.28) : 0};` +
    `--scr-w:${pecho.scrW ?? 0.03};` + (edge !== null ? `--safe-edge-d:${edge};` : '') + subjVars + anchorVars;

  return {
    requested: key, id, aura, usedFallback, mirror, layout,
    alt: o.alt ?? p?.alt ?? '',
    d, m, anchors,
    subject: { d: fbox(p?.subject?.d, mirror), m: fbox(p?.subject?.m, mirror) },
    leak: { d: leakD, m: leakM }, grade: p?.grade ?? 0.28,
    srcset, rack, still, cut, vars, mnull: mnull.join(' '), safeEdge: edge,
  };
}

/** Borde de la zona segura de texto de escritorio (safe.d de plates.json) del lado del TEXTO, en fracción del ancho de la
 *  placa y ya espejado: con el sujeto a la derecha (o al centro), el borde derecho de la zona que nace en el margen
 *  izquierdo; con el sujeto a la izquierda, el borde izquierdo de la zona que llega al margen derecho. Sin una zona pegada
 *  a ese margen se usa la primera (mismo criterio que hubKit.safeEdge). null si la placa no trae zonas. */
function safeEdgeOf(zones: any, mirror: boolean, layout: Layout): number | null {
  const list: Box[] = (Array.isArray(zones) ? zones : []).filter((z: any) => Array.isArray(z) && z.length >= 4).map((z: Box) => fbox(z, mirror)!);
  if (!list.length) return null;
  if (layout === 'subject-left') {
    const right = list.filter((z) => z[2] >= 0.88);
    return r4(Math.min(...(right.length ? right : [list[0]]).map((z) => z[0])));
  }
  const left = list.filter((z) => z[0] <= 0.12);
  return r4(Math.max(...(left.length ? left : [list[0]]).map((z) => z[2])));
}

/** Borde de la zona segura de texto de una placa ya resuelta (ver safeEdgeOf); .5 si no hay dato. */
export function safeEdge(r: Pick<Resolved, 'safeEdge'> | null | undefined): number {
  return r?.safeEdge ?? 0.5;
}

/** Estilo para colocar UI propia en un ancla con nombre de la placa de su sección (desktop y vertical).
 *  Úsalo dentro del slot "anchors" de ImageSection: <div class="anchor" data-anchor="telefono" style={anchorStyle('telefono')}>
 *  Si el ancla es null en la placa vertical, la sección la oculta en móvil (R4) y su versión en línea va en el texto. */
export function anchorStyle(name: string, extra = ''): string {
  return `--ax:var(--A-${name}-x);--ay:var(--A-${name}-y);--ax-m:var(--A-${name}-xm,var(--A-${name}-x));--ay-m:var(--A-${name}-ym,var(--A-${name}-y));` +
    `--aw:var(--A-${name}-w);--ah:var(--A-${name}-h);--aw-m:var(--A-${name}-wm,var(--A-${name}-w));--ah-m:var(--A-${name}-hm,var(--A-${name}-h));${extra}`;
}

/** Punto interior de un ancla de caja (fracciones de la caja; por defecto el centro). Para anclas de punto, el punto. */
export function boxPoint(a: Resolved['anchors'][string] | undefined, u = 0.5, v = 0.5): { d: XY | null; m: XY | null } {
  if (!a) return { d: null, m: null };
  const at = (b: Box4 | null | undefined, p: XY | null): XY | null => (b ? [r4(b[0] + b[2] * u), r4(b[1] + b[3] * v)] : p);
  return { d: at(a.box?.d, a.d), m: at(a.box?.m, a.m) };
}

/** Tope de --cam (§0.1-5: Kain y las personas nunca se cortan; manda sobre el 1.6 de §5.3 y R5) estimado en el servidor
 *  para el primer cuadro y sin JS: la caja del sujeto escalada desde el origen `o` (fracciones de la placa) no pasa del
 *  4 % superior ni del borde inferior, y deja 1.5 % a los lados. scene.ts lo recalcula con las medidas reales. */
export function camCap(subject: Box | null, o: XY | null, ceiling = 1.6): number {
  if (!subject || !o) return ceiling;
  const [x0, y0, x1, y1] = subject;
  const [ox, oy] = o;
  let c = ceiling;
  if (y0 < oy) c = Math.min(c, (oy - 0.04) / (oy - y0));
  if (y1 > oy) c = Math.min(c, (Math.max(1, y1) - oy) / (y1 - oy));
  if (x0 < ox) c = Math.min(c, (ox - 0.015) / (ox - x0));
  if (x1 > ox) c = Math.min(c, (0.985 - ox) / (x1 - ox));
  return Math.max(1, r4(c));
}

/** Valores de cifras para escenas que derivan una visual del número confirmado (CaseFigure). */
export function parseNumber(v: string): number {
  const m = v.replace(/,/g, '').match(/[−-]?\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0].replace('−', '-')) : NaN;
}
