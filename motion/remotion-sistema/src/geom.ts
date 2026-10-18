export type P = { x: number; y: number };

const D2R = Math.PI / 180;

/**
 * Ingeniak "branch": straight segment, diagonal bend, straight segment.
 * orient 'h': horizontal segments, diagonal at `deg` from horizontal.
 * orient 'v': vertical segments, diagonal at `deg` from vertical.
 */
export const branch = (s: P, e: P, orient: 'h' | 'v' = 'h', deg = 35): P[] => {
  const dx = e.x - s.x;
  const dy = e.y - s.y;
  const t = Math.tan(deg * D2R);
  if (orient === 'h') {
    const ddx = Math.min(Math.abs(dx), Math.abs(dy) / t) * Math.sign(dx);
    const h = (dx - ddx) / 2;
    return [s, { x: s.x + h, y: s.y }, { x: s.x + h + ddx, y: e.y }, e];
  }
  const ddy = Math.min(Math.abs(dy), Math.abs(dx) / t) * Math.sign(dy);
  const v = (dy - ddy) / 2;
  return [s, { x: s.x, y: s.y + v }, { x: e.x, y: s.y + v + ddy }, e];
};

export const polyLen = (pts: P[]) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return L;
};

export const pointAt = (pts: P[], d: number): P => {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (acc + l >= d) {
      const t = l === 0 ? 0 : (d - acc) / l;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    acc += l;
  }
  return pts[pts.length - 1];
};

/** Sub-polyline between distances d0..d1 */
export const slice = (pts: P[], d0: number, d1: number): P[] => {
  const out: P[] = [pointAt(pts, d0)];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    acc += l;
    if (acc > d0 && acc < d1) out.push(pts[i]);
  }
  out.push(pointAt(pts, d1));
  return out;
};

export const toPath = (pts: P[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

export const reverse = (pts: P[]) => [...pts].reverse();
