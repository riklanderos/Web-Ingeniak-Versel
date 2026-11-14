// scripts/extender-placa.mjs — agrega penumbra a una placa generada para despejar la columna del texto (portadas del blog, 2026-11-13).
// Izquierda: espejo del borde (ya oscuro). Arriba: penumbra sintetizada desde la franja superior, con costura difuminada.
// Sale en 2752 × 1536, anclada abajo a la derecha. Sin IA: solo píxeles. Si la imagen ya deja libre el 41 % izquierdo, no hace falta.
// Uso: node scripts/extender-placa.mjs <generada 3840x2160.png> src/assets/cine/<id>.jpg <padLeft px> <padTop px>
//   Para conservar 16:9: padLeft = padTop × 16/9 (p. ej. 346 y 194). No usar si algo toca el borde superior (un cordón, una antena).
import sharp from 'sharp';
const [inp, out, PL, PT] = process.argv.slice(2);
const pl = +PL, pt = +PT;
const { data: px, info } = await sharp(inp).removeAlpha().extend({ left: pl, top: 0, right: 0, bottom: 0, extendWith: 'mirror' }).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const N = 36, R = 90, F = 140; // franja de muestra, suavizado horizontal, costura difuminada
const band = new Float32Array(W * 3);
for (let y = 0; y < N; y++) for (let x = 0; x < W; x++) for (let k = 0; k < 3; k++) band[x * 3 + k] += px[(y * W + x) * 3 + k] / N;
const sm = new Float32Array(W * 3);
for (let x = 0; x < W; x++) for (let k = 0; k < 3; k++) { let s = 0, c = 0; for (let j = -R; j <= R; j += 3) { const xx = Math.min(W - 1, Math.max(0, x + j)); s += band[xx * 3 + k]; c++; } sm[x * 3 + k] = s / c; }
const INK = [3, 4, 11];
const ss = (a) => { a = Math.min(1, Math.max(0, a)); return a * a * (3 - 2 * a); };
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 - 0.5);
const H2 = H + pt, o = Buffer.alloc(W * H2 * 3);
for (let y = 0; y < H2; y++) for (let x = 0; x < W; x++) {
  const oy = y - pt, i = (y * W + x) * 3, g = rnd() * 3;
  for (let k = 0; k < 3; k++) {
    let v;
    if (oy < 0) { const t = ss(-oy / pt); v = sm[x * 3 + k] * (1 - 0.75 * t) + INK[k] * 0.75 * t + g; }
    else if (oy < F) { const a = 1 - ss(oy / F); v = px[(oy * W + x) * 3 + k] * (1 - a) + sm[x * 3 + k] * a + g * a; }
    else v = px[(oy * W + x) * 3 + k];
    o[i + k] = Math.max(0, Math.min(255, Math.round(v)));
  }
}
await sharp(o, { raw: { width: W, height: H2, channels: 3 } }).resize(2752, 1536, { fit: 'cover', position: 'right bottom' }).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toFile(out);
console.log({ W, H2, ar: (W / H2).toFixed(4) });
