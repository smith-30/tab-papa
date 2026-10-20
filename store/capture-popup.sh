#!/usr/bin/env bash
# 本番ビルドのポップアップを、スタブ(assets/popup-stub.js)付きで headless Chrome に描画し、
# store/assets/popup.png(2x)に書き出す。ストア画像(04_settings)の元素材。
#   使い方: store/capture-popup.sh
set -euo pipefail

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$ROOT")"
PORT="${PORT:-8766}"
TMP="$(mktemp -d)"
trap 'kill "${SERVER_PID:-0}" 2>/dev/null || true; rm -rf "$TMP"' EXIT

# 作業中の dist/ を壊さないよう、別ディレクトリへ本番ビルドする
"$REPO/node_modules/.bin/vite" build "$REPO" --outDir "$TMP/dist" --emptyOutDir >/dev/null

HTML="$TMP/dist/src/popup/index.html"
python3 - "$HTML" "$ROOT/assets/popup-stub.js" <<'PY'
import sys
html_path, stub_path = sys.argv[1], sys.argv[2]
html = open(html_path, encoding='utf-8').read()
stub = open(stub_path, encoding='utf-8').read()
html = html.replace('<script type="module"', f'<script>{stub}</script><script type="module"', 1)
open(html_path, 'w', encoding='utf-8').write(html)
PY

python3 -m http.server "$PORT" --directory "$TMP/dist" >/dev/null 2>&1 &
SERVER_PID=$!
sleep 1

# ポップアップの実幅(w-80 = 320px)で描画する。高さは余白を含めて撮り、テンプレート側で切り出す
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=320,640 --virtual-time-budget=3000 \
  --screenshot="$ROOT/assets/popup.png" "http://localhost:$PORT/src/popup/index.html" >/dev/null 2>&1
echo "wrote assets/popup.png"
