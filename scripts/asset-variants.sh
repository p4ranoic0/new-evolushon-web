#!/bin/bash
# Genera variantes más chicas de las imágenes de src/assets para srcset y
# escribe src/store/asset-widths.json con el ancho de cada original.
#   foo.jpg.webp -> foo.jpg.w400.webp, foo.jpg.w700.webp, foo.jpg.w1000.webp
# Solo crea las variantes menores que el original. Requiere cwebp y sips (macOS).
# Uso: bash scripts/asset-variants.sh   (idempotente; correr al agregar imágenes)
set -euo pipefail
cd "$(dirname "$0")/../src/assets"
widths_json="../store/asset-widths.json"
entries=()
for f in *.webp; do
  [[ "$f" =~ \.w[0-9]+\.webp$ ]] && continue
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  entries+=("\"$f\":$w")
  case "$f" in
    logo.*) sizes=(120) ;;
    *) sizes=(400 700 1000) ;;
  esac
  for s in "${sizes[@]}"; do
    out="${f%.webp}.w$s.webp"
    [ "$w" -gt $((s + 100)) ] || continue
    [ -f "$out" ] && [ "$out" -nt "$f" ] && continue
    cwebp -quiet -q 74 -m 6 -sharp_yuv -resize "$s" 0 "$f" -o "$out"
  done
done
printf '{%s}\n' "$(IFS=,; echo "${entries[*]}")" > "$widths_json"
echo "variantes listas; anchos en src/store/asset-widths.json (${#entries[@]} imágenes)"
