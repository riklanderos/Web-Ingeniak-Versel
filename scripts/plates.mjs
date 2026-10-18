// scripts/plates.mjs — exporta las placas (ESPEC-v2 §8.2) desde los masters de src/assets/cine/
// Masters (no se publican):
//   src/assets/cine/<id>.(jpg|png|webp)      placa de escritorio 16:9 (2752 × 1536 ideal)
//   src/assets/cine/<id>-m.(jpg|png|webp)    placa vertical (4:5; 9:16 solo home-hero)
//   src/assets/cine/<id>-cut.png             recorte con alfa (opcional, mismas dimensiones que la de escritorio)
// Salida en public/img/cine/:
//   <id>-{1280,1920,2560,2752}.{avif,webp}   (hasta srcsetMax de plates.json y sin ampliar)
//   <id>-m-{640,828,1080,1536}.{avif,webp}
//   <id>-cut-{1920,2560}.webp · <id>-still-{360,640}.{avif,webp} (21:9 centrado en el sujeto) · <id>-rack-320.webp (blur 40)
// Uso: node scripts/plates.mjs [id …]   (sin ids exporta todo lo que cambió)
import sharp from 'sharp';
import { readdirSync, existsSync, statSync, mkdirSync, readFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src/assets/cine');
const OUT = join(ROOT, 'public/img/cine');
mkdirSync(OUT, { recursive: true });
const plates = JSON.parse(readFileSync(join(ROOT, 'src/data/plates.json'), 'utf8'));

const DESK = [1280, 1920, 2560, 2752];
const MOB = [640, 828, 1080, 1536];
const AVIF = { quality: 52, effort: 6 };
const WEBP = { quality: 74, effort: 6 };

const files = existsSync(SRC) ? readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)) : [];
const only = process.argv.slice(2);
const masters = {};
for (const f of files) {
  const name = basename(f, extname(f));
  const m = name.match(/^(.*?)(-m|-cut)?$/);
  const id = m[1]; const kind = m[2] === '-m' ? 'm' : m[2] === '-cut' ? 'cut' : 'd';
  (masters[id] ??= {})[kind] = join(SRC, f);
}

const fresh = (src, out) => existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs;
let n = 0;
async function emit(src, out, pipe) {
  if (fresh(src, out)) return;
  await pipe(sharp(src)).toFile(out); n++;
}

for (const [id, m] of Object.entries(masters)) {
  if (only.length && !only.includes(id)) continue;
  const meta = plates[id] || {};
  const max = meta.srcsetMax ?? 2752;
  if (m.d) {
    const { width, height } = await sharp(m.d).metadata();
    for (const w of DESK.filter((w) => w <= Math.max(max, 1280) && w <= Math.max(width, 1280))) {
      await emit(m.d, join(OUT, `${id}-${w}.avif`), (s) => s.resize({ width: w }).avif(AVIF));
      await emit(m.d, join(OUT, `${id}-${w}.webp`), (s) => s.resize({ width: w }).webp(WEBP));
    }
    // still 21:9 centrado en el punto focal
    const fx = meta.d?.fx ?? 0.5;
    const cropH = Math.round(width / (21 / 9));
    const top = Math.max(0, Math.min(height - cropH, Math.round(((meta.d?.fy ?? 0.5)) * (height - cropH))));
    for (const w of [360, 640]) {
      await emit(m.d, join(OUT, `${id}-still-${w}.avif`), (s) => s.extract({ left: 0, top, width, height: cropH }).resize({ width: w }).avif({ quality: 50 }));
      await emit(m.d, join(OUT, `${id}-still-${w}.webp`), (s) => s.extract({ left: 0, top, width, height: cropH }).resize({ width: w }).webp({ quality: 72 }));
    }
    await emit(m.d, join(OUT, `${id}-rack-320.webp`), (s) => s.resize({ width: 320 }).blur(12).webp({ quality: 60 }));
    void fx;
  }
  if (m.m) {
    const { width } = await sharp(m.m).metadata();
    for (const w of MOB.filter((w) => w <= Math.max(width, 640))) {
      await emit(m.m, join(OUT, `${id}-m-${w}.avif`), (s) => s.resize({ width: w }).avif(AVIF));
      await emit(m.m, join(OUT, `${id}-m-${w}.webp`), (s) => s.resize({ width: w }).webp(WEBP));
    }
  }
  if (m.cut) {
    for (const w of [1920, 2560]) await emit(m.cut, join(OUT, `${id}-cut-${w}.webp`), (s) => s.resize({ width: w }).webp({ quality: 78, alphaQuality: 90 }));
  }
}
console.log(`[plates] ${Object.keys(masters).length} placas con master · ${n} archivos nuevos en public/img/cine/`);
