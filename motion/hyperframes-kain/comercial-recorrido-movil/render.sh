#!/usr/bin/env bash
# Re-renderiza «El recorrido de un lead» (móvil, 1080×1350) y exporta los entregables del sitio a 864×1080.
# Uso: bash motion/hyperframes-kain/comercial-recorrido-movil/render.sh   (desde cualquier carpeta)
set -euo pipefail
PROJ="$(cd "$(dirname "$0")" && pwd)"
HERE="$(cd "$PROJ/.." && pwd)"            # motion/hyperframes-kain (CLI, ffmpeg y ffprobe)
SITE="$(cd "$HERE/../.." && pwd)"         # raíz del repositorio
SHARP="${SHARP:-$SITE/node_modules/sharp}"
NAME="comercial-recorrido-movil"
POSTER_AT="27"                            # fotograma con el mapa completo
export PATH="$HERE/bin:$HERE/node_modules/.bin:$PATH"

cd "$PROJ"
mkdir -p renders "$SITE/public/video" "$SITE/public/img/comercial"
hyperframes check
hyperframes render --quality delivery --fps 30 --output "renders/$NAME-master.mp4"

# MP4: H.264 yuv420p, faststart, sin audio, escalado a 864×1080
ffmpeg -y -v error -i "renders/$NAME-master.mp4" -an -vf "scale=864:1080:flags=lanczos" -c:v libx264 -preset slow -crf 20 \
  -pix_fmt yuv420p -r 30 -movflags +faststart "$SITE/public/video/$NAME.mp4"

# WebM: VP9 a calidad constante, 864×1080
ffmpeg -y -v error -i "renders/$NAME-master.mp4" -an -vf "scale=864:1080:flags=lanczos" -c:v libvpx-vp9 -pix_fmt yuv420p \
  -crf 32 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$SITE/public/video/$NAME.webm"

# Póster: captura sin pérdida del mapa completo -> WebP de 864 px de ancho
SNAP="$PROJ/renders/poster"
hyperframes snapshot --at "$POSTER_AT" --no-end --describe false -o "$SNAP" >/dev/null
PNG="$(ls "$SNAP"/frame-*.png | head -1)"
node -e "require('$SHARP')(process.argv[1]).resize({width:864}).webp({quality:82,effort:6}).toFile(process.argv[2]).then(i=>console.log('poster',i.width+'x'+i.height,i.size))" \
  "$PNG" "$SITE/public/img/comercial/recorrido-movil-poster.webp"

ls -la "$SITE/public/video/$NAME.mp4" "$SITE/public/video/$NAME.webm" "$SITE/public/img/comercial/recorrido-movil-poster.webp"
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt:format=duration \
  -of default=nw=1 "$SITE/public/video/$NAME.mp4"
