import { describe, expect, it } from 'vitest';

import { planSweep } from '../src/lib/plan';
import type { TabInfo } from '../src/lib/sweep';

function tab(id: number, overrides: Partial<TabInfo> = {}): TabInfo {
  return {
    id,
    pinned: false,
    active: false,
    audible: false,
    groupId: -1,
    lastAccessed: id * 1000,
    ...overrides,
  };
}

// 容量 = (1000 − 100) ÷ 30 = 30 行
const base = { windowHeight: 1000, fixedHeight: 100, rowHeight: 30, groups: [] };

describe('planSweep', () => {
  it('容量・使用行数・目標行数・閉じる対象を返す', () => {
    const tabs = Array.from({ length: 5 }, (_, i) => tab(i + 1));
    // 容量 30 × 10% = 3 行が目標。使用 5 行 → 古い 2 枚(id 1, 2)を閉じる
    expect(planSweep({ ...base, tabs, keepPercent: 10 })).toEqual({
      capacity: 30,
      used: 5,
      target: 3,
      closeIds: [1, 2],
    });
  });

  it('目標以内なら閉じる対象は空', () => {
    const tabs = [tab(1), tab(2)];
    expect(planSweep({ ...base, tabs, keepPercent: 80 }).closeIds).toEqual([]);
  });

  it('維持率を下げるほど閉じる対象が増える', () => {
    const tabs = Array.from({ length: 10 }, (_, i) => tab(i + 1));
    const at = (keepPercent: number) => planSweep({ ...base, tabs, keepPercent }).closeIds.length;
    expect(at(100)).toBe(0);
    expect(at(20)).toBe(4); // 目標 6 行
    expect(at(10)).toBe(7); // 目標 3 行
  });

  it('容量が 0(ウィンドウが小さすぎる)でも保護対象は閉じない', () => {
    const tabs = [tab(1, { active: true }), tab(2, { pinned: true }), tab(3)];
    const plan = planSweep({ ...base, windowHeight: 50, tabs, keepPercent: 80 });
    expect(plan.capacity).toBe(0);
    expect(plan.closeIds).toEqual([3]);
  });
});
