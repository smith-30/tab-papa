import { describe, expect, it } from 'vitest';

import { selectDuplicates } from '../src/lib/duplicates';
import type { GroupInfo, TabInfo } from '../src/lib/sweep';

function tab(id: number, url: string | null, overrides: Partial<TabInfo> = {}): TabInfo {
  return {
    id,
    url: url ?? undefined,
    pinned: false,
    active: false,
    audible: false,
    groupId: -1,
    lastAccessed: id * 1000,
    ...overrides,
  };
}

const A = 'https://example.com/a';
const B = 'https://example.com/b';

describe('selectDuplicates', () => {
  it('重複が無ければ空', () => {
    expect(selectDuplicates({ tabs: [tab(1, A), tab(2, B)], groups: [] })).toEqual([]);
  });

  it('同じ URL は最終アクセスが新しい 1 枚を残し、古いほうを閉じる', () => {
    const tabs = [tab(1, A, { lastAccessed: 5000 }), tab(2, A, { lastAccessed: 1000 })];
    expect(selectDuplicates({ tabs, groups: [] })).toEqual([2]);
  });

  it('3 枚以上でも最新 1 枚だけ残す', () => {
    const tabs = [tab(1, A), tab(2, A), tab(3, A)];
    expect(selectDuplicates({ tabs, groups: [] }).toSorted()).toEqual([1, 2]);
  });

  it('URL ごとに独立して判定する', () => {
    const tabs = [tab(1, A), tab(2, B), tab(3, A), tab(4, B)];
    expect(selectDuplicates({ tabs, groups: [] }).toSorted()).toEqual([1, 2]);
  });

  it('最終アクセスが同じなら id が大きいほうを残す', () => {
    const tabs = [tab(1, A, { lastAccessed: 0 }), tab(2, A, { lastAccessed: 0 })];
    expect(selectDuplicates({ tabs, groups: [] })).toEqual([1]);
  });

  it('URL が無いタブは重複とみなさない', () => {
    const tabs = [tab(1, null), tab(2, null), tab(3, '')];
    expect(selectDuplicates({ tabs, groups: [] })).toEqual([]);
  });

  it('保護対象(ピン留め・アクティブ・音声再生中)は閉じず、残りの重複を閉じる', () => {
    // 保護されたタブが古くても残し、保護されていない側を閉じる
    for (const protectedProps of [{ pinned: true }, { active: true }, { audible: true }]) {
      const tabs = [tab(1, A, { ...protectedProps, lastAccessed: 100 }), tab(2, A)];
      expect(selectDuplicates({ tabs, groups: [] })).toEqual([2]);
    }
  });

  it('保護対象どうしが重複していても、どちらも閉じない', () => {
    const tabs = [tab(1, A, { pinned: true }), tab(2, A, { active: true })];
    expect(selectDuplicates({ tabs, groups: [] })).toEqual([]);
  });

  it('折りたたみグループ内のタブは閉じない(保護扱い)', () => {
    const groups: GroupInfo[] = [{ id: 10, collapsed: true }];
    const tabs = [tab(1, A, { groupId: 10, lastAccessed: 100 }), tab(2, A)];
    expect(selectDuplicates({ tabs, groups })).toEqual([2]);
  });

  it('展開中のグループ内の重複は閉じられる', () => {
    const groups: GroupInfo[] = [{ id: 10, collapsed: false }];
    const tabs = [tab(1, A, { groupId: 10, lastAccessed: 100 }), tab(2, A)];
    expect(selectDuplicates({ tabs, groups })).toEqual([1]);
  });
});
