#!/bin/bash
find public/img -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read -r img; do
    webp_path="${img%.*}.webp"
    echo "Converting $img to $webp_path"
    cwebp -q 80 "$img" -o "$webp_path"
done
