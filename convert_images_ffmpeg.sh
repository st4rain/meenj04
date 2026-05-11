#!/bin/bash
find public/img -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read -r img; do
    webp_path="${img%.*}.webp"
    if [ ! -f "$webp_path" ]; then
        echo "Converting $img to $webp_path using ffmpeg"
        ffmpeg -i "$img" -q:v 80 "$webp_path" -y -loglevel error
    fi
done
