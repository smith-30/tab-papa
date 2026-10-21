# 構成

仕様は [spec.md](./spec.md) を参照。

## スタック

- Preact + Tailwind CSS v4(ポップアップ UI)
- Vite + `@crxjs/vite-plugin`(MV3 拡張のビルド)
- vitest + jsdom + Testing Library(テスト)
- oxlint / oxfmt / secretlint / tsc(静的解析。tab-mama の構成を踏襲)

## ディレクトリ

```
manifest.config.ts   MV3 manifest 定義(package.json の version を参照)
vite.config.ts       Vite + crxjs + Preact + Tailwind
src/
  config.ts          設定の初期値・定数(閾値はここに集約)
  locales.ts         UI 文言の単一ソース(ja / en)。_locales の生成元
  lib/               Chrome API に依存しない純粋関数
    capacity.ts        容量の推定・目標行数
    sweep.ts           使用行数の計算・スイープ対象の選定
    duplicates.ts      重複タブ(同一 URL)の選定
    localeMessages.ts  文言を Chrome の messages.json 形式へ変換
    plan.ts            1 ウィンドウのスイープ計画(容量・使用・目標・対象)。実行とプレビューで共有
    domainSort.ts      ドメイン順の並べ替え計画(move の列)
  storage/
    settings.ts        設定の正規化(純粋)と chrome.storage の読み書き
  chrome/
    tabs.ts            chrome.tabs / tabGroups / windows との変換・スナップショット取得・スイープと並べ替えの実行
  background/
    index.ts           Service Worker。フォーカス検知と alarms の配線
  popup/               ポップアップ UI(自動整理のオン/オフ・待ち時間・使用率)。i18n.ts は t()
tests/                 vitest。lib は node 環境、コンポーネントは jsdom(chrome.storage は tests/helpers/chrome.ts でモック)
docs/                  仕様・構成
store/                 Chrome Web Store 提出素材(掲載文・画像テンプレート・生成画像)。詳細は store/README.md
public/icons/          拡張アイコン(store/icon.svg から生成)
.github/workflows/     ci.yml(format → lint → typecheck → secretlint → test → build)、release.yml(v* タグで ZIP を GitHub Release へ)、scorecard.yml
Makefile               release-patch / minor / major、changelog
```

## 設計の原則

- `src/lib/` は Chrome API に依存しない純粋関数のみ。テストでは `chrome.*` をモックせず、データをそのまま渡して検証する。
- 副作用は `src/storage/` と `src/chrome/` に隔離し、`src/background/index.ts` で配線する。
- MV3 の Service Worker はアイドルで破棄される。`setTimeout` による待機は使わず `chrome.alarms` を使い、状態は `chrome.storage.local` に永続化する。
- 閾値や初期値は `src/config.ts` に集約する。

## データの流れ(スイープ)

```
windows.onFocusChanged(NONE)
  → alarms.create('sweep')            background/index.ts
  → alarms.onAlarm
  → getLastFocused().focused ?        フォーカスが戻っていれば中止
  → 各通常ウィンドウ:
      tabs.query + tabGroups.query    chrome/tabs.ts
      → TabInfo / GroupInfo に変換
      → estimateCapacity → targetRows lib/capacity.ts
      → selectDuplicates(重複を先に)  lib/duplicates.ts
      → selectSweep(残りを使用率で)   lib/sweep.ts
      → tabs.remove(ids)
  → 各通常ウィンドウ(sortByDomain 有効時):
      tabs.query で取り直し → planDomainSort   lib/domainSort.ts
      → tabs.move(順に適用)
```
