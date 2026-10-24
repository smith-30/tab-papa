# Chrome Web Store 提出素材

| パス | 内容 |
|---|---|
| `icon.svg` | アイコンの元データ(128x128)。`public/icons/icon-{16,32,48,128}.png` はここから生成 |
| `listing/ja.md`, `listing/en.md` | 掲載文(概要・詳細説明・単一の目的・権限の理由・データ使用の申告) |
| `assets/*.html` | 紹介画像のテンプレート。`?lang=ja\|en` で言語を切り替える |
| `assets/strings.js` | 画像内の文言(ja / en)。文言を直すのはここ |
| `assets/popup-stub.js` | ポップアップ撮影用の `chrome.*` スタブ(架空のタブ名。拡張の本体には含まれない) |
| `assets/popup.<lang>.png` | ポップアップの実画面(`capture-popup.sh` が生成)。`04_settings` の素材 |
| `capture-popup.sh` | 本番ビルドのポップアップを、生成済み `_locales` を読ませたスタブ付きで撮影する |
| `render.sh` | テンプレートを headless Chrome で PNG に書き出す(言語ごと) |
| `screenshots/<lang>/` | ストア用スクリーンショット 1280x800(最大 5 枚。現在 各言語 4 枚) |
| `promo/<lang>/` | 小プロモタイル 440x280、マーキー 1400x560、SNS 用 1280x800 |

ストアには言語ごとに画像を登録できる。日本語の掲載には `ja/`、英語の掲載には `en/` を使う。

## 再生成

```bash
store/capture-popup.sh               # ポップアップの実画面を撮り直す(UI・文言を変えたとき。引数で言語を指定可: ja en)
store/render.sh                      # 画像を書き出す(Chrome が必要。別パスは CHROME=... で指定。引数で言語を指定可)
rsvg-convert -w 128 -h 128 store/icon.svg -o public/icons/icon-128.png   # アイコン(16/32/48 も同様)
```

## 提出前チェック

- [ ] `listing/*.md` の機能説明が実装と一致している(設定のポップアップ画面は未実装。実装後に設定の項を確認)
- [x] ポップアップの実画面スクリーンショット(`04_settings`)。`01`〜`03` はイメージ図で、`01` の縦タブ一覧のイラストは Chrome 本体の画面であり拡張の UI ではない
- [ ] 行の高さ・固定分の初期値を実機で確定する
- [x] 英語版の画像(`screenshots/en/`、`promo/en/`)
- [ ] `make release-major` で 1.0.0 を切り、GitHub Release の ZIP をダッシュボードへアップロードする(`pnpm build` 済みの本番ビルドであること。`build:debug` の `dist/` は使わない)
- [ ] リポジトリ公開後、掲載文の「GitHub で公開」にリンクを足す
