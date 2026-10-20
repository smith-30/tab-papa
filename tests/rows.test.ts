import { describe, expect, it } from 'vitest';

import { type KeptRow, buildKeptRows } from '../src/lib/rows';
import type { GroupInfo, TabInfo } from '../src/lib/sweep';

function tab(id: number, groupId = -1): TabInfo {
  return { id, pinned: false, active: false, audible: false, groupId, lastAccessed: id };
}

const titles = (ids: number[]) => Object.fromEntries(ids.map((id) => [id, `タブ${id}`]));

function build(
  tabs: TabInfo[],
  groups: (GroupInfo & { title?: string })[],
  closeIds: number[],
  order = tabs.map((t) => t.id),
): KeptRow[] {
  return buildKeptRows({
    order,
    tabs,
    groups: groups.map(({ id, collapsed }) => ({ id, collapsed })),
    titles: titles(order),
    groupTitles: Object.fromEntries(groups.map((g) => [g.id, g.title ?? ''])),
    closeIds,
  });
}

describe('buildKeptRows', () => {
  it('閉じるタブを除き、現在の並び(order)のまま返す', () => {
    const rows = build([tab(1), tab(2), tab(3)], [], [2]);
    expect(rows).toEqual([
      { kind: 'tab', id: 1, title: 'タブ1' },
      { kind: 'tab', id: 3, title: 'タブ3' },
    ]);
  });

  it('order の順に並べる(tabs の配列順ではなく)', () => {
    const rows = build([tab(1), tab(2), tab(3)], [], [], [3, 1, 2]);
    expect(rows.map((r) => r.kind === 'tab' && r.id)).toEqual([3, 1, 2]);
  });

  it('グループは最初の残りタブの前にヘッダー行を 1 つ出す', () => {
    const tabs = [tab(1, 10), tab(2, 10), tab(3)];
    const rows = build(tabs, [{ id: 10, collapsed: false, title: '調査' }], []);
    expect(rows).toEqual([
      { kind: 'group', id: 10, title: '調査', collapsed: false },
      { kind: 'tab', id: 1, title: 'タブ1' },
      { kind: 'tab', id: 2, title: 'タブ2' },
      { kind: 'tab', id: 3, title: 'タブ3' },
    ]);
  });

  it('折りたたみ中のグループはヘッダー行のみ(中身は出さない)', () => {
    const tabs = [tab(1, 10), tab(2, 10), tab(3)];
    const rows = build(tabs, [{ id: 10, collapsed: true, title: '調査' }], []);
    expect(rows).toEqual([
      { kind: 'group', id: 10, title: '調査', collapsed: true },
      { kind: 'tab', id: 3, title: 'タブ3' },
    ]);
  });

  it('グループのタブを全部閉じるとヘッダー行も出さない', () => {
    const tabs = [tab(1, 10), tab(2, 10), tab(3)];
    const rows = build(tabs, [{ id: 10, collapsed: false }], [1, 2]);
    expect(rows).toEqual([{ kind: 'tab', id: 3, title: 'タブ3' }]);
  });

  it('グループの一部だけ閉じるなら、ヘッダーと残りのタブを出す', () => {
    const tabs = [tab(1, 10), tab(2, 10)];
    const rows = build(tabs, [{ id: 10, collapsed: false, title: 'g' }], [1]);
    expect(rows).toEqual([
      { kind: 'group', id: 10, title: 'g', collapsed: false },
      { kind: 'tab', id: 2, title: 'タブ2' },
    ]);
  });

  it('行数は使用行数の計算(usedRows)と一致する', () => {
    const tabs = [tab(1, 10), tab(2, 10), tab(3, 11), tab(4)];
    const groups = [
      { id: 10, collapsed: false },
      { id: 11, collapsed: true },
    ];
    // 10: ヘッダー+2、11: ヘッダーのみ、4: 1 → 5 行
    expect(build(tabs, groups, [])).toHaveLength(5);
  });
});
