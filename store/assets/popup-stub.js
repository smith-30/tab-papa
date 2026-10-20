// ストア画像用: ポップアップが読む chrome.* を、見栄えのよい架空のデータで置き換える。
// store/capture-popup.sh がビルド済みポップアップへ注入する(拡張の本体コードには含まれない)。
const titles = [
  'プロジェクト設計メモ',
  'API リファレンス',
  '週次ミーティングの議事録',
  '検索結果: 状態管理 比較',
  '技術ブログ: 設計の考え方',
  'レシピ: 三色丼の作り方',
  '旅行計画 — 京都 2 泊 3 日',
  '新幹線の時刻表',
  'ホテル比較まとめ',
  'ドキュメント: 導入ガイド',
  '検索結果: ノートの取り方',
  'ニュース: 今日の天気',
  'レビュー記事: キーボード',
  '開発中のアプリ — プレビュー',
];
const tabs = titles.map((title, i) => ({
  id: i + 1,
  index: i,
  title,
  pinned: false,
  active: i === titles.length - 1,
  audible: false,
  groupId: -1,
  // id が小さいほど古い(= 先に閉じる候補)
  lastAccessed: (i + 1) * 1000,
}));
const store = { settings: { keepPercent: 60, delaySeconds: 60, rowHeight: 32, fixedHeight: 120 } };
window.chrome = {
  storage: {
    local: {
      get: async (k) => (k in store ? { [k]: store[k] } : {}),
      set: async (o) => Object.assign(store, o),
    },
  },
  windows: { getLastFocused: async () => ({ id: 1, type: 'normal', height: 560 }) },
  tabs: { query: async () => tabs },
  tabGroups: { query: async () => [] },
};
