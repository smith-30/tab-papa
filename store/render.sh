#!/usr/bin/env bash
# store/assets/*.html を headless Chrome で PNG に書き出す。
#   使い方: store/render.sh   (リポジトリのどこからでも可)
# 出力: store/screenshots/ (Web Store 用 1280x800)、store/promo/ (プロモタイル)
set -euo pipefail

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$ROOT/screenshots" "$ROOT/promo"

shot() { # <html名> <出力パス> <幅> <高さ>
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size="$3,$4" \
    --screenshot="$2" "file://$ROOT/assets/$1.html" >/dev/null 2>&1
  echo "wrote ${2#"$ROOT"/} (${3}x${4})"
}

# Chrome Web Store スクリーンショット(1280x800)
shot 01_hero    "$ROOT/screenshots/01_hero.png"    1280 800
shot 02_how     "$ROOT/screenshots/02_how.png"     1280 800
shot 03_privacy "$ROOT/screenshots/03_privacy.png" 1280 800

# プロモーション画像
shot promo-small "$ROOT/promo/small-440x280.png"    440  280
shot marquee     "$ROOT/promo/marquee-1400x560.png" 1400 560
shot 01_hero     "$ROOT/promo/social-preview-1280x640.png" 1280 640
