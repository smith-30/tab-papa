import { describe, expect, it } from 'vitest';

import { planSweep } from '../src/lib/plan';
import type { TabInfo } from '../src/lib/sweep';

function tab(id: number, overrides: Partial<TabInfo> = {}): TabInfo {
  return {
    id,
    url: `https://example.com/${id}`,
    pinned: false,
    active: false,
    audible: false,
    groupId: -1,
    lastAccessed: id * 1000,
    ...overrides,
  };
}

const dup = (id: number) => tab(id, { url: 'https://example.com/same' });

// 容量 = (1000 − 100) ÷ 30 = 30 行
const base = {
  windowHeight: 1000,
  fixedHeight: 100,
  rowHeight: 30,
  groups: [],
  closeDuplicates: false,
};

describe('planSweep', () => {
  it('容量・使用行数・目標行数・閉じる対象を返す', () => {
    const tabs = Array.from({ length: 5 }, (_, i) => tab(i + 1));
    // 容量 30 × 10% = 3 行が目標。使用 5 行 → 古い 2 枚(id 1, 2)を閉じる
    expect(planSweep({ ...base, tabs, keepPercent: 10 })).toEqual({
      capacity: 30,
      used: 5,
      target: 3,
      duplicateIds: [],
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

  describe('重複タブ', () => {
    it('使用率が目標以内でも、重複は強制的に閉じる(古いほうを先に)', () => {
      const tabs = [dup(1), dup(2), tab(3)];
      const plan = planSweep({ ...base, tabs, keepPercent: 100, closeDuplicates: true });
      expect(plan.duplicateIds).toEqual([1]);
      expect(plan.closeIds).toEqual([1]);
    });

    it('重複を閉じたあとの行数で使用率スイープを判定する', () => {
      // 5 タブ中 2 つが重複 → 重複 1 枚を閉じて使用 4 行。目標 4 行なので追加のスイープは無い
      const tabs = [dup(1), dup(2), tab(3), tab(4), tab(5)];
      const plan = planSweep({ ...base, tabs, keepPercent: 14, closeDuplicates: true });
      expect(plan.target).toBe(4);
      expect(plan.used).toBe(5);
      expect(plan.closeIds).toEqual([1]);
    });

    it('目標を超えていれば、重複に続けて古い順にスイープする', () => {
      const tabs = [dup(1), dup(2), tab(3), tab(4), tab(5)];
      // 目標 2 行: 重複 1 を閉じたあと 4 行 → さらに古い 2, 3 を閉じる(アクティブなど保護は無し)
      const plan = planSweep({ ...base, tabs, keepPercent: 7, closeDuplicates: true });
      expect(plan.target).toBe(2);
      expect(plan.closeIds).toEqual([1, 2, 3]);
      expect(plan.duplicateIds).toEqual([1]);
    });

    it('closeDuplicates が false なら重複を閉じない', () => {
      const tabs = [dup(1), dup(2)];
      const plan = planSweep({ ...base, tabs, keepPercent: 100, closeDuplicates: false });
      expect(plan.duplicateIds).toEqual([]);
      expect(plan.closeIds).toEqual([]);
    });
  });
});
