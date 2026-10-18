/** 設定の初期値。縦タブの寸法は Chrome のバージョンや環境で変わるため暫定値(実機で要調整)。 */
export const DEFAULT_SETTINGS = {
  enabled: true,
  /** 見える行数に対して維持する割合(%) */
  keepPercent: 80,
  /** 縦タブ 1 行の高さ(px) */
  rowHeight: 32,
  /** ツールバー等、縦タブ一覧に使えない高さ(px) */
  fixedHeight: 120,
  /** Chrome のフォーカスが外れてからスイープするまでの待ち時間(秒) */
  delaySeconds: 60,
} as const;

/** chrome.alarms の最短間隔(秒) */
export const MIN_ALARM_SECONDS = 30;
