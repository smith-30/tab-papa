# tab-papa

<img src="public/icons/icon-128.png" width="96" alt="tab-papa icon"/>

[![CI](https://github.com/smith-30/tab-papa/actions/workflows/ci.yml/badge.svg)](https://github.com/smith-30/tab-papa/actions/workflows/ci.yml)
[![prek](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/j178/prek/master/docs/assets/badge-v0.json)](https://github.com/j178/prek)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/smith-30/tab-papa/badge)](https://securityscorecards.dev/viewer/?uri=github.com/smith-30/tab-papa)

[English](README.md)

Chrome の**縦タブ一覧があふれないように保つ**拡張機能(Manifest V3)。Chrome を離れている間に、重複タブや古いタブをそっと閉じて、一覧をスクロール不要に保ちます。

<img src="store/screenshots/ja/04_settings.png" width="640" alt="tab-papa のポップアップ"/>

## 仕組み

1. 別のアプリに切り替えて、Chrome のフォーカスが外れる。
2. 少し待つ(既定 60 秒)。そのあと、ウィンドウの高さから、縦タブ一覧に収まる行数を推定する。
3. 重複タブを閉じ、続けて、最後に見た時刻が古いタブから閉じる。使用行数がその N%(既定 80%)以下になるまで続ける。
4. 残ったタブをドメイン順に並べ替える。

待機中に Chrome へ戻ると中断するので、ブラウジング中にタブが閉じられることはありません。

## 機能

- **使用率でスイープ** — 縦タブ一覧を、画面に収まる行数の N% に保ちます。古いタブから閉じます。
- **重複タブ** — 同じウィンドウ内で URL が同じタブは、最後に見た 1 枚を残して閉じます。
- **ドメイン順に整列** — 整理のあと、グループに入っていないタブをドメイン順に並べます。
- **プレビュー** — 今の設定で閉じられるタブを、ポップアップで事前に確認できます。
- **完全ローカル** — 通信は一切なし。設定以外は保存せず、送信もしません。

閉じないタブ: ピン留め、アクティブ、音声再生中、折りたたみグループ内のタブ。ピン留めタブとグループ内のタブは並べ替えもしません。

## 設定

ツールバーのアイコンからポップアップを開きます。変更は即座に `chrome.storage.local` へ保存されます。

| 設定 | 初期値 | 範囲 |
|---|---|---|
| 自動整理 | オン | オン / オフ |
| 整理するまでの待ち時間 | 60 秒 | 30〜600 秒 |
| 縦タブの使用率 | 80% | 10〜100% |

> 拡張機能からは、Chrome の縦タブ一覧の実寸を取得できません。収まる行数は、ウィンドウの高さと、想定の行の高さ(32px)・固定部分(120px)から求めた推定値です。環境に合わない場合は、`src/config.ts` の `rowHeight` / `fixedHeight` を調整してください。

## 開発

Node.js 24 以上、pnpm 11 以上が必要です。

```bash
pnpm install
```

| コマンド | 説明 |
|---|---|
| `pnpm dev` | 開発ビルド(HMR。待ち時間は 10 秒) |
| `pnpm build` | `dist/` へ本番ビルド |
| `pnpm build:debug` | 待ち時間 10 秒の本番相当ビルド(動作確認専用) |
| `pnpm test` | 単体テスト(vitest) |
| `pnpm typecheck` | 型チェック(tsc) |
| `pnpm lint` | リント(oxlint) |
| `pnpm format` | フォーマット(oxfmt) |

### Chrome への読み込み

1. `pnpm build` を実行
2. `chrome://extensions` を開き、「デベロッパーモード」を ON
3. 「パッケージ化されていない拡張機能を読み込む」→ `dist/` を選択

### アーキテクチャ

```
src/
├── config.ts        # 設定の初期値・定数
├── locales.ts       # UI 文言(ja / en)。_locales の生成元
├── lib/             # Chrome API に依存しない純粋ロジック(単体テスト対象)
│   ├── capacity.ts    #   収まる行数・目標行数
│   ├── duplicates.ts  #   重複タブの選定
│   ├── sweep.ts       #   使用行数・閉じるタブの選定
│   ├── plan.ts        #   1 ウィンドウの計画(スイープとプレビューで共有)
│   └── domainSort.ts  #   ドメイン順の並べ替え計画
├── storage/         # chrome.storage.local ラッパと設定の正規化
├── chrome/          # chrome.tabs / tabGroups / windows のアダプタ
├── background/      # Service Worker: フォーカス検知 + chrome.alarms
└── popup/           # Preact のポップアップ
docs/                # 仕様・構成
store/               # Chrome Web Store の掲載文・画像
```

詳細は [docs/spec.md](docs/spec.md) と [docs/architecture.md](docs/architecture.md) を参照してください。

### コード品質

| ツール | 役割 |
|---|---|
| **oxlint** | リント |
| **oxfmt** | フォーマット |
| **secretlint** | シークレット漏洩チェック |
| **tsc** | 型チェック |
| **prek** | pre-commit フックランナー |

CI でも同じチェックに加えて、テストとビルドを実行します。

### MV3 の制約への対応

Service Worker はアイドル時に破棄されるため、待機は `setTimeout` ではなく `chrome.alarms` を使い、状態はすべて `chrome.storage.local` に保存します。

## リリース

`make release-major` / `release-minor` / `release-patch` で、バージョン更新・タグ付け・push を行います。`v*` タグで ZIP を作り、GitHub Release に添付します。Chrome Web Store への提出は手動です。

## ライセンス

[MIT](LICENSE)
