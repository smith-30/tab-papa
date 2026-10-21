# tab-papa — Claude 向けガイド

Chrome の縦タブモードで使う前提の、タブ数をスマートに管理する拡張機能。一覧 UI は Chrome 本体の縦タブに任せ、拡張側は「縦タブ一覧がスクロールするほど開きすぎたタブ」を、Chrome を触っていない間に自動スイープすることと、ポップアップ設定に徹する。[tab-mama](../tab-mama) の構成を踏襲している。

## ドキュメント

仕様は `docs/spec.md`、構成は `docs/architecture.md` に記載している。
**仕様・構成・設定項目・権限・ディレクトリ構成を変更したら、同じ変更の中で該当する docs も更新する。**

## ストア提出素材

`store/` に Chrome Web Store 用の掲載文(`listing/`)・画像テンプレート・生成画像を置く。機能や権限を変えたら `store/listing/*.md` の説明・権限の理由も更新し、画像は `store/render.sh` で再生成する。詳細は `store/README.md`。

## コマンド

```bash
pnpm dev           # 開発ビルド(vite + crxjs)
pnpm build         # dist/ へビルド
pnpm build:debug   # 動作確認用ビルド(スイープ待ち 10 秒)。配布には使わない
pnpm test          # 単体テスト(vitest)
pnpm test:watch    # ウォッチモード
pnpm typecheck     # tsc --noEmit
pnpm lint          # oxlint でリント
pnpm lint:fix      # oxlint で自動修正
pnpm format        # oxfmt でフォーマット
pnpm format:check  # フォーマット確認のみ
```

## pre-commit フック

prek を使用。コミット時に oxfmt → oxlint → zizmor(workflow 変更時)→ secretlint → vitest の順で実行される。
全フックを手動で試す場合: `prek run --all-files`

## CI(`.github/workflows/ci.yml`)

format:check → lint → typecheck → secretlint → test → build。action は全て commit SHA で固定し、Dependabot で更新する。
Scorecard は `scorecard.yml` で毎週実行。

## リリース

`package.json` の `version` が単一の真実(manifest は参照する)。

```bash
make release-major   # 0.0.0 → 1.0.0(初回)。minor / patch も同様
```

`pnpm version` → `chore: release vX.Y.Z` のコミットとタグ → push までを行い、直前のタグからの変更一覧(ストアのリリースノート用)を表示する。`v*` タグの push で `.github/workflows/release.yml` が本番ビルドの ZIP を作り、GitHub Release に添付する。Chrome Web Store への提出は手動(ZIP をダッシュボードへアップロード)。

## コード品質ルール

- フォーマット(`.oxfmtrc.json`): `singleQuote`、`trailingComma: "all"`、`printWidth: 100`、`sortImports`
- リント(`.oxlintrc.json`): `correctness: error`、`suspicious/perf: warn`、`typescript/consistent-type-imports: error`
- スタック: Preact + Tailwind v4(ポップアップ、MV3)。shadcn 系(Radix/Base UI)は react 前提のため `preact/compat` alias 経由で使う。

## アーキテクチャの原則

`src/lib/` は Chrome API に依存しない純粋関数のみ。テストでは `chrome.*` をモックせず、タブ配列・グループ・ウィンドウ高・閾値をそのまま渡して検証する。

副作用は `src/storage/` と `src/chrome/` に隔離し、`src/background/index.ts` で配線する。

## 多言語

UI 文言は `src/locales.ts`(ja / en)が単一ソース。ポップアップでは `t(key, [値])` を使い、日本語リテラルを直接書かない。文言を足したら `ja` と `en` の両方に足す(キー・`$1` の有無はテストで検証)。`public/_locales/` はビルド時に生成されるので編集しない。

## 閾値・初期値

`src/config.ts` に集約する。ここ以外には書かない。`rowHeight` / `fixedHeight` は実機未確認の暫定値。

## MV3 制約

Service Worker はアイドルで破棄される。`setTimeout` による長時間タイマーは使わない。待機は必ず `chrome.alarms` で代替し(最短 30 秒)、状態は `chrome.storage.local` に永続化する。

## テストの方針

- 新規ロジックはテスト先行(TDD)。`tests/` に vitest で書き、失敗を確認してから実装する。
- `lib/` の純粋関数は境界条件(ちょうど目標、ピン留め・アクティブ・音声再生中・折りたたみ除外、グループが空になるケース、安定ソート)を網羅する。
- `pnpm test` は `tests/**/*.test.{ts,tsx}` を全件実行し、pre-commit と CI の両方から走る。テストを追加するだけで両方に反映され、設定変更は不要。
- コンポーネントテストはファイル先頭に `// @vitest-environment jsdom` を付ける。vitest の API は globals ではなく `vitest` から明示 import する。
- shadcn 系(Radix/Base UI)・lucide・framer-motion など react 前提のライブラリを使うコンポーネントは、vitest では preact の alias が外部依存に届かず react が二重解決されて壊れる場合がある。tab-mama ではこれらを `vi.mock` でスタブ化した(モックの戻り値に Proxy は使わず、使う export を明示列挙する)。

## ビルド

`@crxjs/vite-plugin` が manifest.json の生成・service worker のバンドルを担う。manifest の定義は `manifest.config.ts` に書き、`vite.config.ts` で読み込む。
