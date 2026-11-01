// UI 文言の単一ソース。
// - ポップアップはここから直接バンドルして使う(dev・テストでは ja にフォールバック)。
// - Chrome ネイティブ i18n 用の public/_locales/*/messages.json は、
//   vite.config.ts の gen-locales プラグインがここから生成する(生成物は gitignore 済み)。
// $1 は数値を注入する置換トークン(chrome.i18n の substitution と対応)。

export const LOCALES = ['ja', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const ja = {
  appDesc: 'Chrome の縦タブがあふれる前に、使っていない間に古いタブを自動で整理します',
  toggleLabel: '自動整理',
  tidyOff: '自動整理はオフです',
  delayLabel: '整理するまでの待ち時間',
  delayHint: 'Chrome から離れて、この時間が経つと整理します。戻ると中断します。',
  delayValue: '$1 秒',
  maxLabel: '維持するタブ数',
  maxHint:
    'ウィンドウごとに、この数を超えた分を古いタブから閉じます。グループの見出しも 1 つと数えます。',
  maxValue: '$1',
  previewTitle: '閉じる予定 ($1)',
  previewNone: '閉じるタブはありません',
  previewMore: 'ほか $1 件',
} as const;

export type MessageKey = keyof typeof ja;

const en: Record<MessageKey, string> = {
  appDesc:
    "Keeps Chrome's vertical tab list short by tidying old and duplicate tabs while you're away",
  toggleLabel: 'Auto tidy',
  tidyOff: 'Auto tidy is off',
  delayLabel: 'Wait before tidying',
  delayHint: 'Tidies up once you have been away from Chrome this long. Cancelled if you come back.',
  delayValue: '$1 sec',
  maxLabel: 'Tabs to keep',
  maxHint:
    'Per window, the oldest tabs beyond this number are closed. Each group header counts as one.',
  maxValue: '$1',
  previewTitle: 'Will close ($1)',
  previewNone: 'No tabs to close',
  previewMore: '$1 more',
};

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = { ja, en };
