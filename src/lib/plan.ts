import { estimateCapacity, targetRows } from './capacity';
import { selectDuplicates } from './duplicates';
import { type GroupInfo, type TabInfo, selectSweep, usedRows } from './sweep';

export type PlanParams = {
  /** 単一ウィンドウ分のタブ */
  tabs: TabInfo[];
  groups: GroupInfo[];
  windowHeight: number;
  fixedHeight: number;
  rowHeight: number;
  keepPercent: number;
  closeDuplicates: boolean;
};

export type SweepPlan = {
  /** 縦タブ一覧に表示できる行数(推定) */
  capacity: number;
  /** 使用行数 */
  used: number;
  /** 維持したい行数 */
  target: number;
  /** 重複で閉じる予定のタブ id(closeIds の先頭側) */
  duplicateIds: number[];
  /** 閉じる予定のタブ id。重複 → 使用率スイープ(古い順)の順 */
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
  closeDuplicates,
}: PlanParams): SweepPlan {
  const capacity = estimateCapacity({ windowHeight, fixedHeight, rowHeight });
  const target = targetRows(capacity, keepPercent);
  // 重複は使用率に関係なく先に閉じ、その後の行数で使用率スイープを判定する
  const duplicateIds = closeDuplicates ? selectDuplicates({ tabs, groups }) : [];
  const duplicates = new Set(duplicateIds);
  const remaining = tabs.filter((t) => !duplicates.has(t.id));
  const sweepIds = selectSweep({ tabs: remaining, groups, target });
  return {
    capacity,
    used: usedRows(tabs, groups),
    target,
    duplicateIds,
    closeIds: [...duplicateIds, ...sweepIds],
  };
}
