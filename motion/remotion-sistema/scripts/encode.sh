#!/bin/zsh
# Re-render masters and encode web deliverables. Run from motion/remotion-sistema.
set -e
V="../../video"
FF() { npx remotion ffmpeg -hide_banner -loglevel error -y "$@"; }
npx remotion render src/index.ts Sistema out/master-sistema.mp4 --codec=h264 --crf=12 --concurrency=6 --muted
npx remotion render src/index.ts SistemaMovil out/master-movil.mp4 --codec=h264 --crf=12 --concurrency=6 --muted
FF -i out/master-sistema.mp4 -an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -movflags +faststart "$V/sistema-1920.mp4"
FF -i out/master-sistema.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 27 -pix_fmt yuv420p -row-mt 1 -deadline good -cpu-used 2 -tile-columns 2 "$V/sistema-1920.webm"
FF -i out/master-movil.mp4 -an -vf "scale=720:900:flags=lanczos" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -movflags +faststart "$V/sistema-movil.mp4"
FF -i out/master-movil.mp4 -an -vf "scale=720:900:flags=lanczos" -c:v libvpx-vp9 -b:v 0 -crf 27 -pix_fmt yuv420p -row-mt 1 -deadline good -cpu-used 2 "$V/sistema-movil.webm"
npx remotion still src/index.ts Sistema out/poster-sistema.png --frame=130
npx remotion still src/index.ts SistemaMovil out/poster-movil.png --frame=130
echo "Convert out/poster-*.png to ../../img/motion-sistema*-poster.webp with sharp (1600w / 720w, q82)."
