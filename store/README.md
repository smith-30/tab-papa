# Chrome Web Store 提出素材

| パス | 内容 |
|---|---|
| `icon.svg` | アイコンの元データ(128x128)。`public/icons/icon-{16,32,48,128}.png` はここから生成 |
| `listing/ja.md`, `listing/en.md` | 掲載文(概要・詳細説明・単一の目的・権限の理由・データ使用の申告) |
| `assets/*.html` | 紹介画像のテンプレート(HTML/CSS) |
| `render.sh` | テンプレートを headless Chrome で PNG に書き出す |
| `screenshots/` | ストア用スクリーンショット 1280x800(最大 5 枚) |
| `promo/` | 小プロモタイル 440x280、マーキー 1400x560、SNS 用 1280x640 |

## 再生成

```bash
store/render.sh                      # 画像(Chrome が必要。別パスは CHROME=... で指定)
rsvg-convert -w 128 -h 128 store/icon.svg -o public/icons/icon-128.png   # アイコン(16/32/48 も同様)
```

## 提出前チェック

- [ ] `listing/*.md` の機能説明が実装と一致している(設定のポップアップ画面は未実装。実装後に設定の項を確認)
- [ ] ポップアップの実画面スクリーンショットを追加する(現状の 3 枚はイメージ図。縦タブ一覧のイラストは Chrome 本体の画面であり拡張の UI ではない)
- [ ] 行の高さ・固定分の初期値を実機で確定する
- [ ] 英語版の画像が必要なら `assets/` を複製して差し替える(現状は日本語のみ)
- [ ] リポジトリ公開後、掲載文の「GitHub で公開」にリンクを足す
