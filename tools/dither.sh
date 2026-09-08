#!/usr/bin/env bash
# dither.sh — process source images into the game's palettes.
#
#   ./tools/dither.sh registry  160 4:5  src/halloran.jpg img/portraits/
#   ./tools/dither.sh newsprint 640 12:5 src/*.jpg        img/events/
#
# args: <palette> <width> <aspect> <input...> <outdir>
#   palette  registry | newsprint | broadcast | deck
#   width    output width in px
#   aspect   W:H to crop to, or "none" to keep the source shape
#
# STANDARD ASPECTS — the CSS enforces these, so match them here or the
# image gets cropped again in the browser and you lose control of the framing:
#   portraits  4:5   at 160px wide
#   plates    12:5   at 640px wide
set -euo pipefail

IM=$(command -v magick || command -v convert)
ID=$(command -v magick >/dev/null && echo "magick identify" || echo identify)
PAL="$1"; W="$2"; ASPECT="$3"; shift 3
OUT="${@: -1}"; INPUTS=("${@:1:$#-1}")
MAP="$(dirname "$0")/palettes/${PAL}.png"

[ -f "$MAP" ] || { echo "no palette: $MAP  (registry|newsprint|broadcast|deck)"; exit 1; }
mkdir -p "$OUT"

if [ "$ASPECT" = "none" ]; then
  CROP=(-resize "${W}x")
else
  AW="${ASPECT%%:*}"; AH="${ASPECT##*:}"
  H=$(( W * AH / AW ))
  # fill the box, then centre-crop to it — never letterbox, never squash
  CROP=(-resize "${W}x${H}^" -gravity center -extent "${W}x${H}")
fi

for f in "${INPUTS[@]}"; do
  base=$(basename "${f%.*}")
  "$IM" "$f" \
    -colorspace RGB \
    "${CROP[@]}" \
    -modulate 100,88,100 \
    -posterize 6 \
    -dither Riemersma \
    -remap "$MAP" \
    -colorspace sRGB \
    -strip \
    "PNG8:${OUT}/${base}.png"
  printf '%-26s -> %s%s.png  %s  (%s)\n' "$(basename "$f")" "$OUT" "$base" \
    "$($ID -format '%wx%h' "${OUT}/${base}.png")" \
    "$(du -h "${OUT}/${base}.png" | cut -f1)"
done
