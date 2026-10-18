#!/usr/bin/env bash
# Re-render "Kain chat demo" with HyperFrames and export site deliverables.
# Usage: bash motion/hyperframes-kain/render.sh   (from anywhere)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SITE="$(cd "$HERE/../.." && pwd)"
PROJ="$HERE/kain-chat"
SHARP="${SHARP:-/private/tmp/claude-501/-Users-riklanderos-Web-Ingeniak-Versel/e64796e3-3852-42c2-8549-9c83b0f55e3b/scratchpad/tools/img/node_modules/sharp}"
export PATH="$HERE/bin:$HERE/node_modules/.bin:$PATH"   # bundled ffmpeg-static / ffprobe-static

cd "$PROJ"
hyperframes check
hyperframes render --quality delivery --fps 30 --output renders/kain-chat-master.mp4

# MP4: H.264 yuv420p, faststart, no audio (stream copy of the master, no generation loss)
ffmpeg -y -v error -i renders/kain-chat-master.mp4 -an -c:v copy -movflags +faststart "$SITE/video/kain-chat.mp4"

# WebM: VP9 constant quality
ffmpeg -y -v error -i renders/kain-chat-master.mp4 -an -c:v libvpx-vp9 -pix_fmt yuv420p \
  -crf 34 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 "$SITE/video/kain-chat.webm"

# Poster: lossless HyperFrames snapshot of the full conversation (t=10.5s) -> WebP
hyperframes snapshot --at 10.5 >/dev/null
PNG="$(ls -t $(find .hyperframes -name 'frame-*at-10.5s.png') | head -1)"
node -e "require('$SHARP')(process.argv[1]).webp({quality:78,effort:6}).toFile(process.argv[2]).then(i=>console.log('poster',i.size))" \
  "$PNG" "$SITE/img/motion-kain-chat-poster.webp"

ls -la "$SITE/video/kain-chat.mp4" "$SITE/video/kain-chat.webm" "$SITE/img/motion-kain-chat-poster.webp"
