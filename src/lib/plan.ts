import { selectDuplicates } from './duplicates';
import { type GroupInfo, type TabInfo, selectSweep, usedRows } from './sweep';

export type PlanParams = {
  /** 単一ウィンドウ分のタブ */
  tabs: TabInfo[];
  groups: GroupInfo[];
  /** 維持する行数 */
  maxRows: number;
  closeDuplicates: boolean;
};

export type SweepPlan = {
  /** 使用行数 */
  used: number;
  /** 維持したい行数 */
  target: number;
  /** 重複で閉じる予定のタブ id(closeIds の先頭側) */
  duplicateIds: number[];
  /** 閉じる予定のタブ id。重複 → 超過分のスイープ(古い順)の順 */
  closeIds: number[];
};

/** 1 ウィンドウのスイープ計画。実行とポップアップのプレビューで同じ計算を共有する */
export function planSweep({ tabs, groups, maxRows, closeDuplicates }: PlanParams): SweepPlan {
  const target = Math.max(0, Math.floor(maxRows));
  // 重複は行数に関係なく先に閉じ、その後の行数で超過分のスイープを判定する
  const duplicateIds = closeDuplicates ? selectDuplicates({ tabs, groups }) : [];
  const duplicates = new Set(duplicateIds);
  const remaining = tabs.filter((t) => !duplicates.has(t.id));
  const sweepIds = selectSweep({ tabs: remaining, groups, target });
  return {
    used: usedRows(tabs, groups),
    target,
    duplicateIds,
    closeIds: [...duplicateIds, ...sweepIds],
  };
}
