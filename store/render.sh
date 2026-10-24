#!/usr/bin/env bash
# store/assets/*.html を headless Chrome で PNG に書き出す(言語ごと)。
#   使い方: store/render.sh [lang ...]   (既定: ja en。リポジトリのどこからでも可)
# 出力: store/screenshots/<lang>/(Web Store 用 1280x800)、store/promo/<lang>/(プロモタイル)
# 04_settings は実画面を使う。先に store/capture-popup.sh で popup.<lang>.png を作っておく。
set -euo pipefail

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

LANGS=("$@")
[ ${#LANGS[@]} -gt 0 ] || LANGS=(ja en)

shot() { # <lang> <html名> <出力パス> <幅> <高さ>
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size="$4,$5" --virtual-time-budget=3000 \
    --screenshot="$3" "file://$ROOT/assets/$2.html?lang=$1" >/dev/null 2>&1
  echo "wrote ${3#"$ROOT"/} ($4x$5)"
}

for lang in "${LANGS[@]}"; do
  mkdir -p "$ROOT/screenshots/$lang" "$ROOT/promo/$lang"

  # Chrome Web Store スクリーンショット(1280x800)
  shot "$lang" 01_hero    "$ROOT/screenshots/$lang/01_hero.png"    1280 800
  shot "$lang" 02_how     "$ROOT/screenshots/$lang/02_how.png"     1280 800
  shot "$lang" 03_privacy "$ROOT/screenshots/$lang/03_privacy.png" 1280 800
  shot "$lang" 04_settings "$ROOT/screenshots/$lang/04_settings.png" 1280 800

  # プロモーション画像
  shot "$lang" promo-small "$ROOT/promo/$lang/small-440x280.png"    440  280
  shot "$lang" marquee     "$ROOT/promo/$lang/marquee-1400x560.png" 1400 560
  shot "$lang" 01_hero     "$ROOT/promo/$lang/social-preview-1280x640.png" 1280 640
done
