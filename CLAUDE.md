# tab-papa — Claude 向けガイド

Chrome の縦タブモードで使う前提の、タブ数をスマートに管理する拡張機能。一覧 UI は Chrome 本体の縦タブに任せ、拡張側は整理(放置タブの自動クローズ・重複整理など)とポップアップ設定に徹する。[tab-mama](../tab-mama) の構成を踏襲している。

## コマンド

```bash
pnpm dev           # 開発ビルド(vite + crxjs)
pnpm build         # dist/ へビルド
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

## コード品質ルール

- フォーマット(`.oxfmtrc.json`): `singleQuote`、`trailingComma: "all"`、`printWidth: 100`、`sortImports`
- リント(`.oxlintrc.json`): `correctness: error`、`suspicious/perf: warn`、`typescript/consistent-type-imports: error`
- スタック: Preact + Tailwind v4(ポップアップ、MV3)。shadcn 系(Radix/Base UI)は react 前提のため `preact/compat` alias 経由で使う。
