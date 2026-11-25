#!/bin/zsh
# «El reloj de Kain» (manual comercial): render de masters + exportación web + pósters.
# Ejecutar desde motion/remotion-sistema:  ./scripts/encode-comercial.sh
set -e
V="../../public/video"
I="../../public/img/comercial"
POSTER_FRAME=338
mkdir -p out "$V" "$I"
FF() { npx remotion ffmpeg -hide_banner -loglevel error -y "$@"; }

npx remotion render src/index.ts ComercialReloj out/master-comercial-reloj.mp4 --codec=h264 --crf=12 --jpeg-quality=95 --concurrency=6 --muted
npx remotion render src/index.ts ComercialRelojMovil out/master-comercial-reloj-movil.mp4 --codec=h264 --crf=12 --jpeg-quality=95 --concurrency=6 --muted

# 16:9 · 1920x1080
FF -i out/master-comercial-reloj.mp4 -an -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -movflags +faststart "$V/comercial-reloj.mp4"
FF -i out/master-comercial-reloj.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 30 -pix_fmt yuv420p -row-mt 1 -deadline good -cpu-used 2 -tile-columns 2 "$V/comercial-reloj.webm"
# móvil · 1080x1350 -> 864x1080
FF -i out/master-comercial-reloj-movil.mp4 -an -vf "scale=864:1080:flags=lanczos" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -movflags +faststart "$V/comercial-reloj-movil.mp4"
FF -i out/master-comercial-reloj-movil.mp4 -an -vf "scale=864:1080:flags=lanczos" -c:v libvpx-vp9 -b:v 0 -crf 30 -pix_fmt yuv420p -row-mt 1 -deadline good -cpu-used 2 "$V/comercial-reloj-movil.webm"

# pósters (fotograma con todos los hitos del acto 1 encendidos)
npx remotion still src/index.ts ComercialReloj out/poster-comercial-reloj.png --frame=$POSTER_FRAME
npx remotion still src/index.ts ComercialRelojMovil out/poster-comercial-reloj-movil.png --frame=$POSTER_FRAME
node --input-type=module -e "
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(path.resolve('../../package.json'));
const sharp = require('sharp');
await sharp('out/poster-comercial-reloj.png').resize({ width: 1600 }).webp({ quality: 84 }).toFile('$I/reloj-poster.webp');
await sharp('out/poster-comercial-reloj-movil.png').resize({ width: 864 }).webp({ quality: 84 }).toFile('$I/reloj-movil-poster.webp');
"
ls -la "$V"/comercial-reloj* "$I"/reloj-*
