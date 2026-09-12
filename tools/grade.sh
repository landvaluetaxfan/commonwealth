#!/usr/bin/env bash
# grade.sh — film grading for the photographic plates.
#
#   ./tools/grade.sh img/menu/tether.jpg img/menu/tether.jpg
#   ./tools/grade.sh src/shot.jpg img/menu/tether.jpg 2560x1205
#   HALO=0.8 SAT=88 GRAIN=0 ./tools/grade.sh src/shot.jpg out.jpg
#
# args: <source> <output.jpg> [WxH]
#   WxH   crop and resize to this box. Omit to keep the source shape.
#
# THIS IS NOT dither.sh AND MUST NOT BECOME IT.
#
#   dither.sh makes machine output: palette-indexed, ordered or diffused,
#   a picture the government terminal produced. Bible 12.11. A menu plate
#   is the opposite claim — it is a PHOTOGRAPH, the one continuous-tone
#   thing on the screen, so it keeps its tone and gets film treatment
#   instead of a palette.
#
# WHAT IT DOES, and why each step is where it is:
#
#   1. CROP, only if a box is given. Whatever displays the plate crops it
#      again to fit; crop here, once, deliberately, or lose the framing.
#   2. DESATURATE. Bible 12.3: if it reads as cool, it is wrong. A
#      saturated photograph next to this interface looks like a wallpaper
#      someone set. Faded stock, not a poster.
#   3. SPLIT TONE. Blue into the shadows, blue out of the highlights, by
#      moving the blue channel's black and white points in opposite
#      directions. This is the whole sunset look and it is two numbers.
#
#      MEASURED at the defaults on a test plate — but measured with a
#      reimplementation of these same operations, because the container
#      this was written in had no ImageMagick. The numbers describe the
#      GRADE, not this script's execution of it. Run it once on a real
#      plate and check the two figures before trusting them.
#
#      Shadow blue-minus-red
#      goes +13 to +19, highlight red-minus-blue holds at +92. Note the
#      second number FALLS from the source's +105 — step 2 desaturates
#      the warmth too, and the split tone recovers most of it but not
#      all. Highlights stay warm; they do not get warmer than the
#      photograph. Raising WARM past the default makes the sky warmer AND
#      the picture louder, which is the trade 12.3 refuses.
#
#   4. HALATION. The highlight bleed film gets and a sensor does not:
#      mask the bright parts, blur the mask wide, tint the masked copy
#      red-orange, screen it back on. A lit tether against a dark sky is
#      exactly the subject that shows it.
#   5. GRAIN. A 50% grey plate of gaussian noise, overlaid. Last, so it
#      sits on top of the grade rather than being graded itself. It also
#      COSTS FILE SIZE — noise is what JPEG cannot compress. Measure the
#      output; GRAIN=0 if the plate is being inlined into the one-file
#      build, where every kilobyte is base64'd and carried in the page.
#
# NO VIGNETTE. A plate is displayed with background-size:cover, so the
# viewport crops it differently at every window width and a baked corner
# falloff drifts off the corners. A vignette belongs in the CSS, where it
# always meets the actual corners.
#
# TWO PRESETS, both measured on img/menu/tether.jpg:
#
#   the defaults          for an ungraded warm source — a sunset, a
#                         sodium-lit yard, anything already orange.
#
#   SAT=92 COOL=5% WARM=97% HTHRESH=80 HRAD=18 HSTR=0.4 GRAIN=0.35
#                         for a source that is ALREADY graded, or cool.
#                         The menu plate is a blue-green dawn cloud-sea:
#                         the defaults warm it into a different picture
#                         and cost 320 KB -> 958 KB. This preset leaves
#                         the colour alone, blooms the tether lights, and
#                         costs 320 KB -> 505 KB. GRAIN=0 with it comes
#                         out at 287 KB, SMALLER than the source, because
#                         the halation blur removes more high-frequency
#                         detail than the grain adds.
#
#   The honest reading of those numbers: the current menu plate does not
#   need this. Grade a plate that arrives ungraded; do not regrade one
#   that is already right, and never for the sake of having run the tool.
#
# NOTHING HERE IS DESTRUCTIVE BY ACCIDENT, but source and output may be
# the same path and then it is: grade twice and you have graded twice.
# Keep the ungraded original outside img/.
set -euo pipefail

IM=$(command -v magick || command -v convert) || {
  echo "grade.sh needs ImageMagick (magick or convert) on PATH"; exit 1; }
ID=$(command -v magick >/dev/null 2>&1 && echo "magick identify" || echo identify)

SRC="${1:?usage: grade.sh <source> <output.jpg> [WxH]}"
OUT="${2:?usage: grade.sh <source> <output.jpg> [WxH]}"
BOX="${3:-}"

# Every knob, overridable from the environment so a regrade is one re-run.
SAT="${SAT:-80}"          # 100 keeps the source saturation
LIFT="${LIFT:-4%}"        # black point raised: faded stock, never crushed
ROLL="${ROLL:-96%}"       # white point pulled in: no clipped highlights
COOL="${COOL:-10%}"       # blue lifted in the shadows
WARM="${WARM:-82%}"       # blue pulled out of the highlights
HALO="${HALO:-#ff5c1c}"   # halation tint
HTHRESH="${HTHRESH:-66}"  # what counts as a highlight, in percent
HRAD="${HRAD:-26}"        # how far it bleeds, in px at about 1920 wide
HSTR="${HSTR:-0.55}"      # how much of it survives
GRAIN="${GRAIN:-0.9}"     # noise attenuation; 0 for none
QUAL="${QUAL:-86}"        # JPEG quality

CROP=()
if [ -n "$BOX" ]; then
  # fill the box, then centre-crop to it — never letterbox, never squash
  CROP=(-resize "${BOX}^" -gravity center -extent "$BOX")
fi

mkdir -p "$(dirname "$OUT")"
TMP="$(mktemp -t grade.XXXXXX).jpg"
trap 'rm -f "$TMP"' EXIT

"$IM" "$SRC" \
  -auto-orient \
  "${CROP[@]+"${CROP[@]}"}" \
  -colorspace sRGB \
  -modulate 100,${SAT},100 \
  -level "${LIFT},${ROLL}" \
  -channel B -level "${COOL},${WARM}" +channel \
  \( -clone 0 -fill "$HALO" -colorize 70% \) \
  \( -clone 0 -colorspace Gray -level "${HTHRESH}%,100%" \
     -blur "0x${HRAD}" -evaluate multiply "$HSTR" \) \
  \( -clone 1 -clone 2 -alpha off -compose CopyOpacity -composite \) \
  -delete 1,2 \
  -compose Screen -composite \
  -strip -quality "$QUAL" \
  "$TMP"

if [ "$GRAIN" != "0" ]; then
  "$IM" "$TMP" \
    \( -clone 0 -fill gray50 -colorize 100% \
       -attenuate "$GRAIN" +noise Gaussian -colorspace Gray \) \
    -compose Overlay -composite \
    -strip -quality "$QUAL" "$TMP"
fi

cp "$TMP" "$OUT"
printf '%-26s -> %s  %s  (%s)\n' "$(basename "$SRC")" "$OUT" \
  "$($ID -format '%wx%h' "$OUT")" "$(du -h "$OUT" | cut -f1)"
