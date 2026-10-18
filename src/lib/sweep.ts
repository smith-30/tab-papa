export const NO_GROUP = -1;

export type TabInfo = {
  id: number;
  pinned: boolean;
  active: boolean;
  audible: boolean;
  groupId: number;
  lastAccessed: number;
};

export type GroupInfo = {
  id: number;
  collapsed: boolean;
};

export type SweepParams = {
  /** 単一ウィンドウ分のタブ */
  tabs: TabInfo[];
  groups: GroupInfo[];
  /** 掃除後に維持したい使用行数 */
  target: number;
};

/** 縦タブ一覧で使っている行数(グループヘッダー行を含み、折りたたみ中の中身は数えない) */
export function usedRows(tabs: TabInfo[], groups: GroupInfo[]): number {
  const collapsed = new Set(groups.filter((g) => g.collapsed).map((g) => g.id));
  const seenGroups = new Set<number>();
  let rows = 0;
  for (const t of tabs) {
    if (t.groupId === NO_GROUP) {
      rows += 1;
      continue;
    }
    if (!seenGroups.has(t.groupId)) {
      seenGroups.add(t.groupId);
      rows += 1;
    }
    if (!collapsed.has(t.groupId)) rows += 1;
  }
  return rows;
}

/** 使用行数が target を超えている場合、target 以下になるまで古い順に閉じるタブ id を返す */
export function selectSweep({ tabs, groups, target }: SweepParams): number[] {
  const collapsed = new Set(groups.filter((g) => g.collapsed).map((g) => g.id));
  const candidates = tabs
    .filter((t) => !t.pinned && !t.active && !t.audible && !collapsed.has(t.groupId))
    .toSorted((a, b) => a.lastAccessed - b.lastAccessed || a.id - b.id);

  const closed = new Set<number>();
  const remaining = () => tabs.filter((t) => !closed.has(t.id));
  for (const t of candidates) {
    if (usedRows(remaining(), groups) <= target) break;
    closed.add(t.id);
  }
  return [...closed];
}
