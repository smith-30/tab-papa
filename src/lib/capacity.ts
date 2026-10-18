export type CapacityParams = {
  windowHeight: number;
  /** ツールバー等、縦タブ一覧に使えない固定の高さ(px) */
  fixedHeight: number;
  /** 縦タブ 1 行の高さ(px) */
  rowHeight: number;
};

/** 縦タブ一覧にスクロール無しで表示できる行数の推定値 */
export function estimateCapacity({ windowHeight, fixedHeight, rowHeight }: CapacityParams): number {
  if (rowHeight <= 0) return 0;
  const available = windowHeight - fixedHeight;
  if (available <= 0) return 0;
  return Math.floor(available / rowHeight);
}

/** 容量に対する維持率(%)から、維持したい行数を求める */
export function targetRows(capacity: number, keepPercent: number): number {
  const percent = Math.min(100, Math.max(0, keepPercent));
  return Math.floor((capacity * percent) / 100);
}
