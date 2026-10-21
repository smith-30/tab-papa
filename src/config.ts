/** `pnpm build:debug` のビルドでは待ち時間を短くして動作確認しやすくする */
const DEBUG_BUILD = import.meta.env.MODE === 'development';

/** 設定の初期値。縦タブの寸法は Chrome のバージョンや環境で変わるため暫定値(実機で要調整)。 */
export const DEFAULT_SETTINGS = {
  enabled: true,
  /** スイープ後にグループ外のタブをドメイン順に並べ替える */
  sortByDomain: true,
  /** 同じ URL のタブを、使用率に関係なく閉じる(最終アクセスが新しい 1 枚を残す) */
  closeDuplicates: true,
  /** 見える行数に対して維持する割合(%) */
  keepPercent: 80,
  /** 縦タブ 1 行の高さ(px) */
  rowHeight: 32,
  /** ツールバー等、縦タブ一覧に使えない高さ(px) */
  fixedHeight: 120,
  /** Chrome のフォーカスが外れてからスイープするまでの待ち時間(秒) */
  delaySeconds: DEBUG_BUILD ? 10 : 60,
} as const;

/**
 * chrome.alarms の最短間隔(秒)。配布版では 30 秒未満は Chrome に切り上げられる。
 * パッケージ化していない拡張には下限が無いため、デバッグビルドでのみ 10 秒を許す。
 */
export const MIN_ALARM_SECONDS = DEBUG_BUILD ? 10 : 30;
