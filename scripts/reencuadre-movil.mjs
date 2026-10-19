// scripts/reencuadre-movil.mjs — reencuadre de una placa vertical generada (QA ronda 2, placas móviles de /discovery/).
// Agrega penumbra arriba/abajo/lados (sintetizada desde los bordes, que ya son oscuros, con el mismo grano), deja la placa en
// 4:5 a 1536 × 1920 y aplica la penumbra limpia superior (ESPEC-v2 §3.6). Sin IA: solo píxeles.
// Uso: node scripts/reencuadre-movil.mjs <entrada> <salida.jpg|.png> <padTop> <padBottom> <padLeft> <padRight> <tClean>
//   pads en fracción del alto original (padBottom < 0 recorta abajo); tClean = alto (0–1) donde termina la penumbra limpia.
// Ejemplos (2026-10-19): discovery-hero 0.04 -0.04 0 0 0.34 · discovery-para-quien 0.063 -0.006 0 0.046 0.35 ·
//   discovery-cta-final 0.287 0.096 0.306 0 0.37 (sobre las generaciones guardadas en materiales/v2/placas/<id>/*-movil-r2-gen.png).
import sharp from 'sharp';
const [inp, out, PT, PB, PL, PR, TC] = process.argv.slice(2);
const { data: px, info } = await sharp(inp).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
let pt = Math.round(+PT * H), pb = Math.round(+PB * H), pl = Math.round(+PL * H), pr = Math.round(+PR * H);
const H2 = H + pt + pb; const W2 = W + pl + pr;
console.log({ W, H, W2, H2, ar: (W2 / H2).toFixed(4) });
const INK = [3, 4, 11];
const at = (x, y) => { x = Math.min(W - 1, Math.max(0, x)); y = Math.min(H - 1, Math.max(0, y)); const i = (y * W + x) * C; return [px[i], px[i + 1], px[i + 2]]; };
// colores de borde suavizados
const N = 40;
const avgRow = (y0, y1) => { const a = new Float32Array(W * 3); for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) { const c = at(x, y); for (let k = 0; k < 3; k++) a[x * 3 + k] += c[k] / (y1 - y0); } return a; };
const avgCol = (x0, x1) => { const a = new Float32Array(H * 3); for (let x = x0; x < x1; x++) for (let y = 0; y < H; y++) { const c = at(x, y); for (let k = 0; k < 3; k++) a[y * 3 + k] += c[k] / (x1 - x0); } return a; };
const smooth1 = (a, n, R) => { const o = new Float32Array(a.length); for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { let s = 0, c = 0; for (let j = -R; j <= R; j++) { const ii = Math.min(n - 1, Math.max(0, i + j)); s += a[ii * 3 + k]; c++; } o[i * 3 + k] = s / c; } return o; };
const top = smooth1(avgRow(0, N), W, 60), bot = smooth1(avgRow(H - N, H), W, 60), left = smooth1(avgCol(0, N), H, 60), right = smooth1(avgCol(W - N, W), H, 60);
const sm = (a) => { a = Math.min(1, Math.max(0, a)); return a * a * (3 - 2 * a); };
const F = 220; // costura difuminada sobre la imagen original en los lados que se extienden
const o = Buffer.alloc(W2 * H2 * 3);
for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
  const ox = x - pl, oy = y - pt;
  let c;
  const inside = ox >= 0 && ox < W && oy >= 0 && oy < H;
  // Campo de borde continuo (corrección 2026-10-19, kommo-hero-m): cada lado extendido aporta su color de borde (que cae a
  // tinta con la distancia fuera de la imagen) con un peso de proximidad p = 1 fuera de la imagen → 0 a F px hacia dentro.
  // El relleno y la costura usan la MISMA mezcla, así que en las esquinas (abajo-izq., abajo-der., arriba) ya no hay escalón
  // entre el relleno lateral (left/right) y la costura inferior (bot). Antes la costura tomaba un solo lado por prioridad.
  const cx = Math.min(W - 1, Math.max(0, ox)), cy = Math.min(H - 1, Math.max(0, oy));
  let acc = [0, 0, 0], wsum = 0, pmax = 0;
  const add = (col, p, d, span) => { if (p <= 0) return; const k = 1 - sm(d / Math.max(1, span)); acc = acc.map((v, i) => v + (INK[i] + (col[i] - INK[i]) * k) * p); wsum += p; pmax = Math.max(pmax, p); };
  if (pt > 0) add([top[cx * 3], top[cx * 3 + 1], top[cx * 3 + 2]], oy < 0 ? 1 : 1 - sm(oy / F), Math.max(0, -oy), pt * 1.1);
  if (pb > 0) add([bot[cx * 3], bot[cx * 3 + 1], bot[cx * 3 + 2]], oy >= H ? 1 : 1 - sm((H - 1 - oy) / F), Math.max(0, oy - H + 1), pb * 1.1);
  if (pl > 0) add([left[cy * 3], left[cy * 3 + 1], left[cy * 3 + 2]], ox < 0 ? 1 : 1 - sm(ox / F), Math.max(0, -ox), pl * 1.1);
  if (pr > 0) add([right[cy * 3], right[cy * 3 + 1], right[cy * 3 + 2]], ox >= W ? 1 : 1 - sm((W - 1 - ox) / F), Math.max(0, ox - W + 1), pr * 1.1);
  const edge = wsum ? acc.map((v) => v / wsum) : INK;
  // dentro: a = 1 - pmax (= mín. de sm(d/F) de los lados extendidos); fuera: a = 0 (solo relleno)
  const a = inside ? 1 - pmax : 0;
  c = inside ? at(ox, oy).map((v, i) => v * a + edge[i] * (1 - a)) : edge;
  // grano como el de la imagen generada en lo sintetizado y en la costura (proporcional a lo sintetizado), para que la textura no cambie
  if (a < 1) { const n = (Math.random() + Math.random() + Math.random() - 1.5) * 2.4 * (1 - a); c = c.map((v) => v + n); }
  // penumbra limpia arriba (tinta .9 en 0 → 0 en tClean) y caída a tinta en el último 4 %
  const v = y / H2, t = +TC;
  const aTop = Math.pow(sm((t - v) / t), 0.8) * 0.9;
  const aBot = sm((v - 0.96) / 0.04) * 0.8;
  const aa = Math.max(aTop, aBot);
  const i = (y * W2 + x) * 3;
  for (let k = 0; k < 3; k++) o[i + k] = Math.max(0, Math.min(255, Math.round(c[k] * (1 - aa) + INK[k] * aa)));
}
const res = sharp(o, { raw: { width: W2, height: H2, channels: 3 } }).resize(1536, 1920, { fit: 'cover', position: 'centre' });
// salida .png = sin pérdida (para codificar el JPEG final una sola vez); cualquier otra extensión = JPEG q93
await (out.toLowerCase().endsWith('.png') ? res.png({ compressionLevel: 9 }) : res.jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })).toFile(out);
console.log('ok', out);
