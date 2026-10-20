import { estimateCapacity, targetRows } from './capacity';
import { type GroupInfo, type TabInfo, selectSweep, usedRows } from './sweep';

export type PlanParams = {
  /** 単一ウィンドウ分のタブ */
  tabs: TabInfo[];
  groups: GroupInfo[];
  windowHeight: number;
  fixedHeight: number;
  rowHeight: number;
  keepPercent: number;
};

export type SweepPlan = {
  /** 縦タブ一覧に表示できる行数(推定) */
  capacity: number;
  /** 使用行数 */
  used: number;
  /** 維持したい行数 */
  target: number;
  /** 閉じる予定のタブ id(古い順) */
  closeIds: number[];
};

/** 1 ウィンドウのスイープ計画。実行とポップアップのプレビューで同じ計算を共有する */
export function planSweep({
  tabs,
  groups,
  windowHeight,
  fixedHeight,
  rowHeight,
  keepPercent,
}: PlanParams): SweepPlan {
  const capacity = estimateCapacity({ windowHeight, fixedHeight, rowHeight });
  const target = targetRows(capacity, keepPercent);
  return {
    capacity,
    used: usedRows(tabs, groups),
    target,
    closeIds: selectSweep({ tabs, groups, target }),
  };
}
