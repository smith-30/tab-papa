import { describe, expect, it } from 'vitest';

import { type GroupInfo, type TabInfo, selectSweep, usedRows } from '../src/lib/sweep';

const NO_GROUP = -1;

function tab(id: number, overrides: Partial<TabInfo> = {}): TabInfo {
  return {
    id,
    pinned: false,
    active: false,
    audible: false,
    groupId: NO_GROUP,
    lastAccessed: id * 1000,
    ...overrides,
  };
}

describe('usedRows', () => {
  it('グループ無しのタブは 1 タブ 1 行', () => {
    expect(usedRows([tab(1), tab(2), tab(3)], [])).toBe(3);
  });

  it('グループはヘッダー 1 行 + 展開中ならタブ数', () => {
    const tabs = [tab(1, { groupId: 10 }), tab(2, { groupId: 10 }), tab(3)];
    expect(usedRows(tabs, [{ id: 10, collapsed: false }])).toBe(1 + 2 + 1);
  });

  it('折りたたまれたグループはヘッダー 1 行のみ', () => {
    const tabs = [tab(1, { groupId: 10 }), tab(2, { groupId: 10 }), tab(3)];
    expect(usedRows(tabs, [{ id: 10, collapsed: true }])).toBe(1 + 1);
  });

  it('タブが無いグループはヘッダーも数えない', () => {
    expect(usedRows([tab(1)], [{ id: 10, collapsed: false }])).toBe(1);
  });
});

describe('selectSweep', () => {
  it('使用行数が目標以下なら何も閉じない', () => {
    expect(selectSweep({ tabs: [tab(1), tab(2), tab(3)], groups: [], target: 3 })).toEqual([]);
  });

  it('目標に達するまで lastAccessed が古い順に閉じる', () => {
    const tabs = [tab(3), tab(1), tab(2), tab(4)];
    expect(selectSweep({ tabs, groups: [], target: 2 })).toEqual([1, 2]);
  });

  it('ピン留め・アクティブ・音声再生中は閉じない', () => {
    const tabs = [
      tab(1, { pinned: true }),
      tab(2, { active: true }),
      tab(3, { audible: true }),
      tab(4),
      tab(5),
    ];
    expect(selectSweep({ tabs, groups: [], target: 0 })).toEqual([4, 5]);
  });

  it('折りたたまれたグループ内のタブは閉じない', () => {
    const tabs = [tab(1, { groupId: 10 }), tab(2), tab(3)];
    const groups: GroupInfo[] = [{ id: 10, collapsed: true }];
    expect(selectSweep({ tabs, groups, target: 0 })).toEqual([2, 3]);
  });

  it('グループが空になるとヘッダー行も解放される', () => {
    // 使用: ヘッダー1 + タブ(1,2) + タブ3 = 4。target 2 → グループを空にして 1 になれば十分
    const tabs = [tab(1, { groupId: 10 }), tab(2, { groupId: 10 }), tab(3, { lastAccessed: 9999 })];
    const groups: GroupInfo[] = [{ id: 10, collapsed: false }];
    expect(selectSweep({ tabs, groups, target: 2 })).toEqual([1, 2]);
  });

  it('lastAccessed が同じなら id 昇順で安定', () => {
    const tabs = [
      tab(5, { lastAccessed: 0 }),
      tab(2, { lastAccessed: 0 }),
      tab(9, { lastAccessed: 0 }),
    ];
    expect(selectSweep({ tabs, groups: [], target: 1 })).toEqual([2, 5]);
  });

  it('閉じられる候補が尽きたらそこで止める', () => {
    const tabs = [tab(1, { pinned: true }), tab(2, { pinned: true }), tab(3)];
    expect(selectSweep({ tabs, groups: [], target: 0 })).toEqual([3]);
  });
});
