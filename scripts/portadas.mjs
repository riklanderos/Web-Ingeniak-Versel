// scripts/portadas.mjs — portadas con título de los artículos del blog (pedido del cliente, 2026-11-14).
// Una portada con título es una imagen 16:9 diseñada con el título del artículo dentro (Kain juega con las letras). Se usa
// donde el artículo se ve como tarjeta: el índice de /blog/ (HubGuides) y la tarjeta para redes (scripts/og.mjs).
// Dentro del artículo NO se usa: ahí el título es texto real (H1) sobre la placa limpia <id>-hero.
// Masters (no se publican): src/assets/portadas/<page.id>.(jpg|png)   16:9, 2048 px de ancho o más
// Salida: public/img/portadas/<page.id>-{640,1080,1280}.{avif,webp}   (1080 = lo que pide un celular a 3× en la tarjeta del blog)
// Uso: node scripts/portadas.mjs [page.id …]   (sin ids exporta todas)   · después: npm run og -- <page.id>
import sharp from 'sharp';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src/assets/portadas');
const OUT = join(ROOT, 'public/img/portadas');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const files = existsSync(SRC) ? readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f)) : [];
let n = 0;
for (const f of files) {
  const id = basename(f, extname(f));
  if (only.length && !only.includes(id)) continue;
  const meta = await sharp(join(SRC, f)).metadata();
  const ar = meta.width / meta.height;
  if (Math.abs(ar - 16 / 9) > 0.02) console.warn(`[portadas] ${id}: proporción ${ar.toFixed(3)} (se espera 16:9); se recorta al centro`);
  for (const w of [640, 1080, 1280]) {
    const img = sharp(join(SRC, f)).resize(w, Math.round((w * 9) / 16), { fit: 'cover' });
    await img.clone().avif({ quality: 54, effort: 6 }).toFile(join(OUT, `${id}-${w}.avif`));
    await img.clone().webp({ quality: 78, effort: 6 }).toFile(join(OUT, `${id}-${w}.webp`));
  }
  n++;
  console.log(`[portadas] ${id} · ${meta.width}×${meta.height} → 640, 1080 y 1280 (avif, webp)`);
}
console.log(`[portadas] ${n} portada(s) exportada(s)`);
