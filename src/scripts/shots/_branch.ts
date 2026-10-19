// src/scripts/shots/_branch.ts — LightBranch tramo 2 (§3.8 / F20): pie de foto o UI → botón primario.
// Geometría del isotipo: horizontal · diagonal a 45° · horizontal (o carril sobre la fila de CTAs), nodo cuadrado al llegar.
// Nunca cruza texto: se prueban rutas y se descarta la que toque una caja de texto, botón o microcopia.
// Destino: el primario; si su costado está ocupado (p. ej. "Escríbele a Kain" a su derecha en la misma fila, inicio y
// servicio a ≥ 1440 px), el último botón de esa fila, entrando en horizontal por su costado (la fila de CTAs queda unida
// a la escena igual). Si ninguna ruta sirve, el tramo 2 no se dibuja.
type P = { x: number; y: number };
type R = { l: number; t: number; r: number; b: number };
const NS = 'http://www.w3.org/2000/svg';

function rel(el: Element, o: DOMRect): R {
  const b = el.getBoundingClientRect();
  return { l: b.left - o.left, t: b.top - o.top, r: b.right - o.left, b: b.bottom - o.top };
}
/** Cajas de texto reales (líneas) de un elemento. */
function textRects(el: Element, o: DOMRect): R[] {
  const out: R[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    for (const b of range.getClientRects()) if (b.width > 1 && b.height > 1) out.push({ l: b.left - o.left, t: b.top - o.top, r: b.right - o.left, b: b.bottom - o.top });
  }
  return out.length ? out : [rel(el, o)];
}
function hits(a: P, b: P, rs: R[], pad = 10): boolean {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(2, Math.ceil(len / 4));
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
    for (const r of rs) if (x > r.l - pad && x < r.r + pad && y > r.t - pad && y < r.b + pad) return true;
  }
  return false;
}
const ok = (pts: P[], rs: R[]) => pts.every((p, i) => i === 0 || !hits(pts[i - 1], p, rs, 6));

export interface BranchHandle { svg: SVGSVGElement; path: SVGPathElement; to: HTMLElement; hit: () => HTMLElement; redraw: () => boolean; destroy: () => void }

export function setupBranch(section: HTMLElement, spec: HTMLElement): BranchHandle | null {
  const via = section.querySelector<HTMLElement>(spec.dataset.via || '[data-caption]');
  const to = section.querySelector<HTMLElement>(spec.dataset.to || '[data-primary]');
  if (!via || !to) return null;
  const svg = document.createElementNS(NS, 'svg') as SVGSVGElement;
  svg.classList.add('branch');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path') as SVGPathElement;
  path.setAttribute('pathLength', '1');
  const node = document.createElementNS(NS, 'rect') as SVGRectElement;
  node.setAttribute('width', '6'); node.setAttribute('height', '6');
  svg.append(path, node);
  section.append(svg);

  let target: HTMLElement = to;
  /** Rutas hacia un destino (el primario o, si su costado está ocupado, el último botón de su fila). */
  const route = (dest: HTMLElement, o: DOMRect, c: R): P[] | null => {
    const bt = rel(dest, o);
    // Obstáculos: todo el texto y los controles de la columna (menos el botón destino y sus contenedores).
    const obs: R[] = [];
    for (const el of section.querySelectorAll<HTMLElement>('.is__text h1, .is__text h2, .is__text h3, .is__text p, .is__text li, .is__text a, .is__text button, .is__aside *, .sumario')) {
      if (el === dest || el.contains(dest) || dest.contains(el) || !el.offsetParent) continue;
      if (/^(A|BUTTON)$/.test(el.tagName) || el.classList.contains('btn')) obs.push(rel(el, o));
      else obs.push(...textRects(el, o));
    }
    // Sentido: el pie está a la derecha del botón (sujeto a la derecha) o a la izquierda (espejo).
    const s = c.l >= bt.r ? 1 : -1;
    const X = (x: number) => (s === 1 ? x : o.width - x); // espacio normalizado: el pie siempre a la derecha
    const nr = (r: R): R => (s === 1 ? r : { l: o.width - r.r, r: o.width - r.l, t: r.t, b: r.b });
    const C = nr(c), B = nr(bt), OB = obs.map(nr);
    const lead = 40;
    const cands: P[][] = [];
    // R0 · horizontal directa: la UI baja hasta la altura del botón (teléfono de la portada de servicio)
    {
      const y = (B.t + B.b) / 2;
      if (y > C.t + 12 && y < C.b - 12) cands.push([{ x: C.l, y }, { x: B.r, y }]);
    }
    // R1 · por el costado del botón (la ruta de la espec)
    {
      const a = { x: C.l, y: (C.t + C.b) / 2 }, b = { x: B.r, y: (B.t + B.b) / 2 };
      const dy = Math.abs(b.y - a.y);
      const x1 = Math.min(a.x, b.x + lead + dy);
      cands.push([a, { x: x1, y: a.y }, { x: b.x + lead, y: b.y }, b]);
    }
    // R2 · por el carril que queda sobre la fila de CTAs, bajando a 45° y entrando EN HORIZONTAL por el costado del botón
    // (§3.8: horizontal → 45° → horizontal; nunca por su borde superior). Si otro botón ocupa ese costado, se descarta.
    {
      const row = (dest.closest('.ctas') ?? dest).getBoundingClientRect();
      const rowTop = row.top - o.top;
      // carril a media altura entre el último texto de arriba y la fila de CTAs
      const above = OB.filter((r) => r.b <= rowTop + 1 && r.r > B.l).reduce((m, r) => Math.max(m, r.b), rowTop - 48);
      const lane = Math.round((above + rowTop) / 2);
      const b = { x: B.r, y: (B.t + B.b) / 2 };
      const e1 = { x: b.x + lead, y: b.y };
      const p2 = { x: e1.x + (e1.y - lane), y: lane };
      const a = { x: C.l, y: Math.max(lane, C.t + 12) };
      const p1 = { x: a.x - Math.max(0, a.y - lane), y: lane };
      if (lane < b.y - 4 && p1.x > p2.x + 8) cands.push(a.y > lane ? [a, p1, p2, e1, b] : [{ x: a.x, y: lane }, p2, e1, b]);
    }
    const pick = cands.find((pts) => ok(pts, OB));
    return pick ? pick.map((p) => ({ x: X(p.x), y: p.y })) : null;
  };

  const redraw = () => {
    const o = section.getBoundingClientRect();
    const vb = via.getBoundingClientRect();
    if (!vb.width || getComputedStyle(via).display === 'none' || !to.offsetParent) { svg.style.display = 'none'; return false; }
    svg.setAttribute('viewBox', `0 0 ${o.width} ${o.height}`);
    const c = rel(via, o);
    // Destinos en orden: el primario; después el último botón de su fila (del lado de la UI), si lo hay.
    const row = to.closest('.ctas');
    const pr = to.getBoundingClientRect();
    const mates = row ? [...row.querySelectorAll<HTMLElement>('.btn')].filter((b) => b !== to && b.offsetParent && Math.abs(b.getBoundingClientRect().top - pr.top) < 8) : [];
    const towardVia = mates.sort((a, b) => (c.l >= pr.right - o.left ? b.getBoundingClientRect().right - a.getBoundingClientRect().right : a.getBoundingClientRect().left - b.getBoundingClientRect().left));
    let pts: P[] | null = null;
    for (const dest of [to, ...towardVia.slice(0, 1)]) {
      pts = route(dest, o, c);
      if (pts) { target = dest; break; }
    }
    if (!pts) { svg.style.display = 'none'; return false; }
    svg.style.display = '';
    path.setAttribute('d', 'M' + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L'));
    const end = pts[pts.length - 1];
    node.setAttribute('x', String(end.x - 3)); node.setAttribute('y', String(end.y - 3));
    return true;
  };
  return { svg, path, to, hit: () => target, redraw, destroy: () => svg.remove() };
}
