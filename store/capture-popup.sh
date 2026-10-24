#!/usr/bin/env bash
# 本番ビルドのポップアップを、スタブ(assets/popup-stub.js)付きで headless Chrome に描画し、
# store/assets/popup.<lang>.png(2x)に書き出す。ストア画像(04_settings)の元素材。
# 生成済みの _locales/<lang>/messages.json を chrome.i18n のスタブに読ませるため、実機と同じ文言になる。
#   使い方: store/capture-popup.sh [lang ...]   (既定: ja en)
set -euo pipefail

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$ROOT")"
PORT="${PORT:-8766}"
TMP="$(mktemp -d)"
trap 'kill "${SERVER_PID:-0}" 2>/dev/null || true; rm -rf "$TMP"' EXIT

LANGS=("$@")
[ ${#LANGS[@]} -gt 0 ] || LANGS=(ja en)

# 作業中の dist/ を壊さないよう、別ディレクトリへ本番ビルドする
"$REPO/node_modules/.bin/vite" build "$REPO" --outDir "$TMP/dist" --emptyOutDir >/dev/null

# 言語ごとに、スタブを注入した HTML を作る
python3 - "$TMP/dist" "$ROOT/assets/popup-stub.js" "${LANGS[@]}" <<'PY'
import json, sys
dist, stub_path, *langs = sys.argv[1:]
stub = open(stub_path, encoding='utf-8').read()
html = open(f'{dist}/src/popup/index.html', encoding='utf-8').read()
for lang in langs:
    msgs = json.load(open(f'{dist}/_locales/{lang}/messages.json', encoding='utf-8'))
    head = f'<script>window.__LANG__={json.dumps(lang)};window.__MSGS__={json.dumps(msgs)};</script>'
    out = html.replace('<script type="module"', f'{head}<script>{stub}</script><script type="module"', 1)
    open(f'{dist}/src/popup/index.{lang}.html', 'w', encoding='utf-8').write(out)
PY

python3 -m http.server "$PORT" --directory "$TMP/dist" >/dev/null 2>&1 &
SERVER_PID=$!
sleep 1

# ポップアップの実幅(w-80 = 320px)で描画する。高さは余白を含めて撮り、テンプレート側で切り出す
for lang in "${LANGS[@]}"; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=2 --window-size=320,760 --virtual-time-budget=3000 \
    --screenshot="$ROOT/assets/popup.$lang.png" \
    "http://localhost:$PORT/src/popup/index.$lang.html" >/dev/null 2>&1
  echo "wrote assets/popup.$lang.png"
done
