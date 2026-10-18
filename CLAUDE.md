# tab-papa — Claude 向けガイド

Chrome の縦タブモードに最適化したタブマネージャ。[tab-mama](../tab-mama) の構成を踏襲している。

## コマンド

```bash
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

format:check → lint → typecheck → secretlint → test。action は全て commit SHA で固定し、Dependabot で更新する。
Scorecard は `scorecard.yml` で毎週実行。

## コード品質ルール

- フォーマット(`.oxfmtrc.json`): `singleQuote`、`trailingComma: "all"`、`printWidth: 100`、`sortImports`
- リント(`.oxlintrc.json`): `correctness: error`、`suspicious/perf: warn`、`typescript/consistent-type-imports: error`
- UI フレームワーク導入時は oxlint の `plugins` に `react` / `react-perf` を追加する。
