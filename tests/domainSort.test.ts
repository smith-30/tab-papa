import { describe, expect, it } from 'vitest';

import { type SortTab, hostnameOf, planDomainSort } from '../src/lib/domainSort';

const NO_GROUP = -1;

function tab(id: number, index: number, host: string, overrides: Partial<SortTab> = {}): SortTab {
  return { id, index, hostname: host, pinned: false, groupId: NO_GROUP, ...overrides };
}

/** 計画した move を chrome.tabs.move と同じ意味(絶対 index への移動)で順に適用した結果の id 並び */
function apply(tabs: SortTab[], moves: { tabId: number; index: number }[]): number[] {
  const order = tabs.toSorted((a, b) => a.index - b.index).map((t) => t.id);
  for (const { tabId, index } of moves) {
    order.splice(order.indexOf(tabId), 1);
    order.splice(index, 0, tabId);
  }
  return order;
}

describe('hostnameOf', () => {
  it('URL から hostname を取り出し、先頭の www. は除く', () => {
    expect(hostnameOf('https://www.example.com/a?b=1')).toBe('example.com');
    expect(hostnameOf('https://sub.example.com/')).toBe('sub.example.com');
  });

  it('URL が無い・不正な場合は空文字', () => {
    expect(hostnameOf('')).toBe('');
    expect(hostnameOf('not a url')).toBe('');
  });
});

describe('planDomainSort', () => {
  it('hostname 昇順になる move 計画を返す', () => {
    const tabs = [tab(1, 0, 'z.com'), tab(2, 1, 'a.com'), tab(3, 2, 'm.com')];
    const moves = planDomainSort(tabs);
    expect(apply(tabs, moves)).toEqual([2, 3, 1]);
  });

  it('既に整列済みなら move は空', () => {
    const tabs = [tab(1, 0, 'a.com'), tab(2, 1, 'b.com'), tab(3, 2, 'z.com')];
    expect(planDomainSort(tabs)).toEqual([]);
  });

  it('同じ hostname 内は元の並びを維持する', () => {
    const tabs = [tab(1, 0, 'b.com'), tab(2, 1, 'a.com'), tab(3, 2, 'a.com'), tab(4, 3, 'a.com')];
    expect(apply(tabs, planDomainSort(tabs))).toEqual([2, 3, 4, 1]);
  });

  it('www. の有無は同じドメインとして扱う', () => {
    const tabs = [tab(1, 0, 'b.com'), tab(2, 1, 'a.com'), tab(3, 2, 'c.com')];
    expect(apply(tabs, planDomainSort(tabs))).toEqual([2, 1, 3]);
  });

  it('ピン留めタブは先頭のまま動かさず、index 計算にも含めない', () => {
    const tabs = [tab(1, 0, 'zzz.com', { pinned: true }), tab(2, 1, 'z.com'), tab(3, 2, 'a.com')];
    const moves = planDomainSort(tabs);
    expect(moves.some((m) => m.tabId === 1)).toBe(false);
    expect(apply(tabs, moves)).toEqual([1, 3, 2]);
  });

  it('グループ内のタブは動かさない', () => {
    const tabs = [
      tab(1, 0, 'z.com', { groupId: 10 }),
      tab(2, 1, 'a.com', { groupId: 10 }),
      tab(3, 2, 'b.com', { groupId: 10 }),
    ];
    expect(planDomainSort(tabs)).toEqual([]);
  });

  it('グループをまたいで動かさず、グループ外の連続区間ごとに整列する', () => {
    const tabs = [
      tab(1, 0, 'z.com'),
      tab(2, 1, 'a.com'),
      tab(3, 2, 'q.com', { groupId: 10 }),
      tab(4, 3, 'p.com', { groupId: 10 }),
      tab(5, 4, 'y.com'),
      tab(6, 5, 'b.com'),
    ];
    const moves = planDomainSort(tabs);
    expect(apply(tabs, moves)).toEqual([2, 1, 3, 4, 6, 5]);
    expect(moves.some((m) => m.tabId === 3 || m.tabId === 4)).toBe(false);
  });

  it('1 タブ以下の区間は何もしない', () => {
    expect(planDomainSort([])).toEqual([]);
    expect(planDomainSort([tab(1, 0, 'a.com')])).toEqual([]);
  });

  it('index が飛んでいても(入力順が不定でも) index 昇順で扱う', () => {
    const tabs = [tab(3, 2, 'm.com'), tab(1, 0, 'z.com'), tab(2, 1, 'a.com')];
    expect(apply(tabs, planDomainSort(tabs))).toEqual([2, 3, 1]);
  });
});
