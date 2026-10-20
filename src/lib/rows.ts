import { type GroupInfo, NO_GROUP, type TabInfo } from './sweep';

export type KeptRow =
  | { kind: 'group'; id: number; title: string; collapsed: boolean }
  | { kind: 'tab'; id: number; title: string };

export type RowsParams = {
  /** タブ id を現在の並び(index 昇順)に並べたもの */
  order: number[];
  tabs: TabInfo[];
  groups: GroupInfo[];
  titles: Record<number, string>;
  groupTitles: Record<number, string>;
  closeIds: number[];
};

/**
 * スイープ後も残る縦タブ一覧の行(上から順)。ポップアップのプレビュー用。
 * グループはヘッダー 1 行、折りたたみ中は中身を出さない(usedRows の数え方と同じ)。
 */
export function buildKeptRows({
  order,
  tabs,
  groups,
  titles,
  groupTitles,
  closeIds,
}: RowsParams): KeptRow[] {
  const byId = new Map(tabs.map((t) => [t.id, t]));
  const collapsed = new Set(groups.filter((g) => g.collapsed).map((g) => g.id));
  const closing = new Set(closeIds);
  const seenGroups = new Set<number>();

  const rows: KeptRow[] = [];
  for (const id of order) {
    const tab = byId.get(id);
    if (!tab || closing.has(id)) continue;
    if (tab.groupId === NO_GROUP) {
      rows.push({ kind: 'tab', id, title: titles[id] ?? '' });
      continue;
    }
    const isCollapsed = collapsed.has(tab.groupId);
    if (!seenGroups.has(tab.groupId)) {
      seenGroups.add(tab.groupId);
      rows.push({
        kind: 'group',
        id: tab.groupId,
        title: groupTitles[tab.groupId] ?? '',
        collapsed: isCollapsed,
      });
    }
    if (!isCollapsed) rows.push({ kind: 'tab', id, title: titles[id] ?? '' });
  }
  return rows;
}
