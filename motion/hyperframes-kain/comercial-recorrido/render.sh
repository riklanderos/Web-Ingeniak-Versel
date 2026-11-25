#!/usr/bin/env bash
# Re-renderiza «El recorrido de un lead» (16:9, 1920×1080) y exporta los entregables del sitio.
# Uso: bash motion/hyperframes-kain/comercial-recorrido/render.sh   (desde cualquier carpeta)
set -euo pipefail
PROJ="$(cd "$(dirname "$0")" && pwd)"
HERE="$(cd "$PROJ/.." && pwd)"            # motion/hyperframes-kain (CLI, ffmpeg y ffprobe)
SITE="$(cd "$HERE/../.." && pwd)"         # raíz del repositorio
SHARP="${SHARP:-$SITE/node_modules/sharp}"
NAME="comercial-recorrido"
POSTER_AT="27"                            # fotograma con el mapa completo
export PATH="$HERE/bin:$HERE/node_modules/.bin:$PATH"

cd "$PROJ"
mkdir -p renders "$SITE/public/video" "$SITE/public/img/comercial"
hyperframes check
hyperframes render --quality delivery --fps 30 --output "renders/$NAME-master.mp4"

# MP4: H.264 yuv420p, faststart, sin audio
ffmpeg -y -v error -i "renders/$NAME-master.mp4" -an -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -r 30 -movflags +faststart "$SITE/public/video/$NAME.mp4"

# WebM: VP9 a calidad constante
ffmpeg -y -v error -i "renders/$NAME-master.mp4" -an -c:v libvpx-vp9 -pix_fmt yuv420p \
  -crf 32 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$SITE/public/video/$NAME.webm"

# Póster: captura sin pérdida del mapa completo -> WebP de 1600 px de ancho
SNAP="$PROJ/renders/poster"
hyperframes snapshot --at "$POSTER_AT" --no-end --describe false -o "$SNAP" >/dev/null
PNG="$(ls "$SNAP"/frame-*.png | head -1)"
node -e "require('$SHARP')(process.argv[1]).resize({width:1600}).webp({quality:82,effort:6}).toFile(process.argv[2]).then(i=>console.log('poster',i.width+'x'+i.height,i.size))" \
  "$PNG" "$SITE/public/img/comercial/recorrido-poster.webp"

ls -la "$SITE/public/video/$NAME.mp4" "$SITE/public/video/$NAME.webm" "$SITE/public/img/comercial/recorrido-poster.webp"
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt:format=duration \
  -of default=nw=1 "$SITE/public/video/$NAME.mp4"
