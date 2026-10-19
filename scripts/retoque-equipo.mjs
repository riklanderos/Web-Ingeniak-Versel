// scripts/retoque-equipo.mjs — retratos provisionales del equipo (R6 sigue como puerta P1: sesión de fotos real).
// Uso: node scripts/retoque-equipo.mjs [carpeta de salida]   (por omisión public/img/equipo/, 600 × 600 WebP)
// Quita la "X" (relleno negro + filo de color) del fondo de los retratos del equipo, sin tocar a las personas.
// Fondo idéntico en las 6 fotos → plantilla de la X = unión de sus partes visibles; filo validado por consenso entre fotos.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'materiales/equipo');
const OUT = process.argv[2] || join(ROOT, 'public/img/equipo');
mkdirSync(OUT, { recursive: true });
const W = 900, N = W * W;
const files = readdirSync(SRC).filter((f) => f.endsWith('.webp'));
const imgs = [];
for (const f of files) imgs.push({ f, name: f.replace(/-[A-Za-z0-9_]+\.webp$/, ''), px: await sharp(join(SRC, f)).resize(W, W).removeAlpha().raw().toBuffer() });

const inZone = (x, y) => x >= 0.07 * W && x <= 0.93 * W && y >= 0.25 * W && y <= 0.63 * W;
const mx = (b, i) => Math.max(b[i * 3], b[i * 3 + 1], b[i * 3 + 2]);
const bgLike = (b, i) => { const r = b[i * 3], g = b[i * 3 + 1], bl = b[i * 3 + 2]; return bl >= 26 && bl >= 1.6 * r && bl >= 1.12 * g; };
function dilate(m, rad) {
  // dilatación separable con cuadrado (rápida)
  const t = new Uint8Array(N), o = new Uint8Array(N);
  for (let y = 0; y < W; y++) { let last = -1e9; for (let x = 0; x < W; x++) { if (m[y * W + x]) last = x; t[y * W + x] = x - last <= rad ? 1 : 0; } last = 1e9; for (let x = W - 1; x >= 0; x--) { if (m[y * W + x]) last = x; if (last - x <= rad) t[y * W + x] = 1; } }
  for (let x = 0; x < W; x++) { let last = -1e9; for (let y = 0; y < W; y++) { if (t[y * W + x]) last = y; o[y * W + x] = y - last <= rad ? 1 : 0; } last = 1e9; for (let y = W - 1; y >= 0; y--) { if (t[y * W + x]) last = y; if (last - y <= rad) o[y * W + x] = 1; } }
  return o;
}
function components(m) {
  const lab = new Int32Array(N).fill(-1); const comps = [];
  for (let s = 0; s < N; s++) {
    if (!m[s] || lab[s] >= 0) continue;
    const id = comps.length, q = [s], list = []; lab[s] = id;
    while (q.length) { const p = q.pop(); list.push(p); const x = p % W, y = (p / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= W) continue; const n = ny * W + nx; if (m[n] && lab[n] < 0) { lab[n] = id; q.push(n); } } }
    comps.push(list);
  }
  return comps;
}
// 1) plantilla geométrica: relleno casi negro en ≥ 2 fotos, solo en los brazos limpios (lejos del centro), por brazo
const cnt = new Uint8Array(N);
for (const im of imgs) for (let i = 0; i < N; i++) { const x = i % W, y = (i / W) | 0; if (inZone(x, y) && mx(im.px, i) <= 12) cnt[i]++; }
const arms = { TL: [], BL: [], TR: [], BR: [] };
for (let i = 0; i < N; i++) { if (cnt[i] < 2) continue; const x = i % W, y = (i / W) | 0; const u = x / W, v = y / W;
  if (u > 0.31 && u < 0.69) continue; const top = v < 0.437; (u < 0.5 ? (top ? arms.TL : arms.BL) : (top ? arms.TR : arms.BR)).push([x, y]); }
function hull(pts) { pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = []; for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  const up = []; for (const p of pts.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1)); }
function inPoly(poly, x, y) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; }
const barA = hull(arms.TL.concat(arms.BR)), barB = hull(arms.TR.concat(arms.BL));
const F = new Uint8Array(N);
for (let y = (0.24 * W) | 0; y < 0.64 * W; y++) for (let x = (0.06 * W) | 0; x < 0.94 * W; x++) if (inPoly(barA, x + 0.5, y + 0.5) || inPoly(barB, x + 0.5, y + 0.5)) F[y * W + x] = 1;
const Fd = dilate(F, 11), Fd7 = dilate(F, 7), Fin = dilate(F, 2);
// 2) por foto: relleno de la X = dentro de la plantilla, casi negro y PLANO (el pelo y la ropa tienen textura)
function localStd(px) { const L = new Float32Array(N); for (let i = 0; i < N; i++) L[i] = 0.3 * px[i * 3] + 0.59 * px[i * 3 + 1] + 0.11 * px[i * 3 + 2];
  const out = new Float32Array(N); const R = 2;
  for (let y = R; y < W - R; y++) for (let x = R; x < W - R; x++) { let s = 0, s2 = 0; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const v = L[(y + dy) * W + x + dx]; s += v; s2 += v * v; } const n = (2 * R + 1) ** 2; out[y * W + x] = Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)); }
  return out; }
for (const im of imgs) {
  const bg = new Uint8Array(N); for (let i = 0; i < N; i++) if (bgLike(im.px, i)) bg[i] = 1;
  const sd = localStd(im.px);
  const vis = new Uint8Array(N);
  for (let i = 0; i < N; i++) { const r = im.px[i * 3], b = im.px[i * 3 + 2]; if (Fin[i] && ((mx(im.px, i) <= 14 && sd[i] <= 6 && (b >= r + 1 || mx(im.px, i) <= 6)) || (cnt[i] >= 3 && mx(im.px, i) <= 13 && b >= r + 3))) vis[i] = 1; }
  // solo lo conectado a los brazos limpios (semillas: relleno en ≥ 2 fotos lejos del centro); el pelo o la ropa oscura sueltos no entran
  const keep = new Uint8Array(N);
  for (const c of components(vis)) { let seed = 0; for (const p of c) { const u = (p % W) / W; if (cnt[p] >= 2 && (u < 0.3 || u > 0.7)) { seed++; if (seed > 20) break; } } if (seed > 20) for (const p of c) keep[p] = 1; }
  im.vis = keep; im.bg = bg; im.sd = sd;
}
// 3) referencia del filo por consenso (≥ 3 fotos que coinciden)
const rimRef = new Int16Array(N * 3).fill(-1);
for (let i = 0; i < N; i++) {
  if (!Fd[i]) continue;
  { const u = (i % W) / W; if (F[i] && u > 0.3 && u < 0.7) continue; }
  const vals = imgs.map((im) => [im.px[i * 3], im.px[i * 3 + 1], im.px[i * 3 + 2]]);
  let best = null, bestN = 0;
  for (const v of vals) { const n = vals.filter((w) => Math.max(Math.abs(v[0] - w[0]), Math.abs(v[1] - w[1]), Math.abs(v[2] - w[2])) <= 14).length; if (n > bestN) { bestN = n; best = v; } }
  const uc = (i % W) / W;
  // la referencia tiene que verse como placa fija: azul del fondo, relleno de la X o filo saturado (nunca ropa gris ni piel)
  const [br, bg_, bb] = best; const plateLike = (bb >= 26 && bb >= 1.6 * br && bb >= 1.12 * bg_) || (Math.max(br, bg_, bb) <= 14 && bb >= br) || (Math.max(br, bg_, bb) - Math.min(br, bg_, bb) >= 40 && !(br > bg_ && bg_ > bb && br - bb > 28 && br > 90));
  if (plateLike && bestN >= (uc > 0.3 && uc < 0.7 ? 4 : 3)) { rimRef[i * 3] = best[0]; rimRef[i * 3 + 1] = best[1]; rimRef[i * 3 + 2] = best[2]; }
}
// 4) máscara por foto = relleno visible ∪ filo (igual a la referencia y pegado a relleno visible o a fondo; sin referencia: entre relleno y fondo)
for (const im of imgs) {
  const skin0 = new Uint8Array(N); for (let i = 0; i < N; i++) { const r = im.px[i * 3], g = im.px[i * 3 + 1], b = im.px[i * 3 + 2]; if (r > 90 && r > g && g > b && r - b > 28) skin0[i] = 1; }
  const skinEr0 = dilate(skin0.map((v) => 1 - v), 2).map((v) => 1 - v);
  const faces0 = new Uint8Array(N); for (const c of components(skinEr0)) if (c.length >= 1500) for (const p of c) faces0[p] = 1;
  const protect0 = dilate(faces0, 6);
  const visNear = dilate(im.vis, 4), bgNear = dilate(im.bg, 6);
  const M = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (im.vis[i]) { M[i] = 1; continue; }
    if (!Fd[i]) continue;
    if (rimRef[i * 3] >= 0) {
      const d = Math.max(Math.abs(im.px[i * 3] - rimRef[i * 3]), Math.abs(im.px[i * 3 + 1] - rimRef[i * 3 + 1]), Math.abs(im.px[i * 3 + 2] - rimRef[i * 3 + 2]));
      const dark = Math.max(rimRef[i * 3], rimRef[i * 3 + 1], rimRef[i * 3 + 2]) <= 24;
      if (d <= (dark ? 6 : 22)) M[i] = 1;
    } else if (!F[i] && visNear[i] && bgNear[i]) M[i] = 1;
    else if (F[i] && visNear[i] && bgNear[i]) M[i] = 1;
  }
  // 4b) restos del filo: estructuras delgadas (≤ 4 px) pegadas al relleno quitado, que no son parte de un rostro ni de manos
  const P = new Uint8Array(N); for (let i = 0; i < N; i++) P[i] = !M[i] && !im.bg[i] ? 1 : 0;
  const notP = P.map((v) => 1 - v); const erP = dilate(notP, 2).map((v) => 1 - v); const opP = dilate(erP, 2);
  const skin = new Uint8Array(N); for (let i = 0; i < N; i++) { const r = im.px[i * 3], g = im.px[i * 3 + 1], b = im.px[i * 3 + 2]; if (r > 90 && r > g && g > b && r - b > 28) skin[i] = 1; }
  const skinEr = dilate(skin.map((v) => 1 - v), 2).map((v) => 1 - v);
  const faces = new Uint8Array(N); for (const c of components(skinEr)) if (c.length >= 1500) for (const p of c) faces[p] = 1;
  const protect = dilate(faces, 5);
  const near = dilate(im.vis, 10);
  const R2 = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (P[i] && !opP[i] && near[i] && Fd7[i] && !protect[i]) R2[i] = 1;
  for (let i = 0; i < N; i++) if (R2[i]) M[i] = 1;
  // 4c) restos de relleno pegados a la ropa (bordes dentados) y motas sueltas en el fondo
  const visNear6 = dilate(im.vis, 6);
  for (let i = 0; i < N; i++) { const r = im.px[i * 3], b = im.px[i * 3 + 2]; if (!M[i] && visNear6[i] && Fd[i] && mx(im.px, i) <= 16 && b >= r + 2) M[i] = 1; }
  const P2 = new Uint8Array(N); for (let i = 0; i < N; i++) P2[i] = !M[i] && !im.bg[i] ? 1 : 0;
  for (const c of components(P2)) { if (c.length > 700) continue; let inBand = 0; for (const p of c) if (Fd[p]) inBand++; if (inBand > c.length * 0.6) for (const p of c) M[p] = 1; }
  im.protect = protect;
  im.M = dilate(M, 1);
  for (let i = 0; i < N; i++) if (protect[i] || protect0[i]) im.M[i] = 0; // rostros y manos: nunca
}
// 5) fondo limpio por foto: convolución normalizada del fondo conocido (sin X ni persona) + grano
async function blurF(buf, sigma) { return sharp(Buffer.from(buf.buffer), { raw: { width: W, height: W, channels: 4 } }).blur(sigma).raw().toBuffer(); }
for (const im of imgs) {
  const known = new Uint8Array(N);
  const Md = dilate(im.M, 6);
  for (let i = 0; i < N; i++) known[i] = im.bg[i] && !Md[i] && !Fd[i] ? 1 : 0;
  // RGBA con alfa = peso (premultiplicado a mano en canales de 16 bits no hay: usamos 8 bits y escalas)
  const est = new Float32Array(N * 3), have = new Float32Array(N);
  for (const sigma of [8, 16, 32, 64, 128]) {
    const rgba = new Uint8Array(N * 4);
    for (let i = 0; i < N; i++) { const k = known[i]; rgba[i * 4] = k ? im.px[i * 3] : 0; rgba[i * 4 + 1] = k ? im.px[i * 3 + 1] : 0; rgba[i * 4 + 2] = k ? im.px[i * 3 + 2] : 0; rgba[i * 4 + 3] = k ? 255 : 0; }
    const b = await sharp(Buffer.from(rgba), { raw: { width: W, height: W, channels: 4 } }).blur(sigma).raw().toBuffer();
    for (let i = 0; i < N; i++) {
      if (have[i]) continue; const a = b[i * 4 + 3]; if (a < 40) continue;
      est[i * 3] = b[i * 4]; est[i * 3 + 1] = b[i * 4 + 1]; est[i * 3 + 2] = b[i * 4 + 2]; have[i] = 1; // sharp premultiplica el alfa al desenfocar
    }
  }
  // huecos sin estimación (centro, lejos de fondo visible): interpolación lineal por fila entre los vecinos estimados
  for (let y = 0; y < W; y++) {
    let x = 0;
    while (x < W) {
      if (have[y * W + x]) { x++; continue; }
      let a = x - 1; let b = x; while (b < W && !have[y * W + b]) b++;
      for (let k = x; k < b; k++) { const i = y * W + k; const t = a < 0 ? 1 : b >= W ? 0 : (k - a) / (b - a);
        for (let c = 0; c < 3; c++) { const va = a >= 0 ? est[(y * W + a) * 3 + c] : est[(y * W + b) * 3 + c]; const vb = b < W ? est[(y * W + b) * 3 + c] : va; est[i * 3 + c] = va * (1 - t) + vb * t; } }
      x = b;
    }
  }
  // grano: desviación del fondo conocido respecto de su versión suave
  let s = [0, 0, 0], n = 0;
  for (let i = 0; i < N; i += 7) if (known[i]) { for (let c = 0; c < 3; c++) { const d = im.px[i * 3 + c] - est[i * 3 + c]; s[c] += d * d; } n++; }
  im.grain = s.map((v) => Math.sqrt(v / n));
  im.est = est;
}
// 6) componer a la resolución original y exportar 600 × 600
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
for (const im of imgs) {
  const meta = await sharp(join(SRC, im.f)).metadata(); const Wo = meta.width;
  const orig = await sharp(join(SRC, im.f)).removeAlpha().raw().toBuffer();
  const mUp = await sharp(Buffer.from(im.M.map((v) => v * 255)), { raw: { width: W, height: W, channels: 1 } }).resize(Wo, Wo, { kernel: 'cubic' }).blur(0.8).extractChannel(0).raw().toBuffer();
  const estBuf = Buffer.alloc(N * 3); for (let i = 0; i < N * 3; i++) estBuf[i] = Math.max(0, Math.min(255, Math.round(im.est[i])));
  const eUp = await sharp(estBuf, { raw: { width: W, height: W, channels: 3 } }).resize(Wo, Wo, { kernel: 'cubic' }).raw().toBuffer();
  const out = Buffer.alloc(Wo * Wo * 3);
  const gs = im.grain.map((g) => Math.min(g, 6));
  for (let i = 0; i < Wo * Wo; i++) {
    const a = mUp[i] / 255; const g = gauss();
    for (let c = 0; c < 3; c++) { const bgv = eUp[i * 3 + c] + g * gs[c] * 0.9 + gauss() * gs[c] * 0.45; out[i * 3 + c] = Math.max(0, Math.min(255, Math.round(orig[i * 3 + c] * (1 - a) + bgv * a))); }
  }
  await sharp(out, { raw: { width: Wo, height: Wo, channels: 3 } }).resize(600, 600, { kernel: 'lanczos3' }).webp({ quality: 82, effort: 6 }).toFile(join(OUT, `${im.name}.webp`));
  console.log(im.name, 'máscara', im.M.reduce((a, b) => a + b, 0), 'px · grano', im.grain.map((g) => g.toFixed(1)).join('/'));
}
