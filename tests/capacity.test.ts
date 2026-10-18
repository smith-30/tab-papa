import { describe, expect, it } from 'vitest';

import { estimateCapacity, targetRows } from '../src/lib/capacity';

describe('estimateCapacity', () => {
  it('(ウィンドウ高 − 固定分) ÷ 行高 の切り捨て', () => {
    expect(estimateCapacity({ windowHeight: 1000, fixedHeight: 100, rowHeight: 30 })).toBe(30);
  });

  it('割り切れない場合は切り捨てる', () => {
    expect(estimateCapacity({ windowHeight: 1000, fixedHeight: 100, rowHeight: 40 })).toBe(22);
  });

  it('固定分がウィンドウ高以上なら 0', () => {
    expect(estimateCapacity({ windowHeight: 100, fixedHeight: 100, rowHeight: 30 })).toBe(0);
    expect(estimateCapacity({ windowHeight: 50, fixedHeight: 100, rowHeight: 30 })).toBe(0);
  });

  it('行高が 0 以下は不正値として 0', () => {
    expect(estimateCapacity({ windowHeight: 1000, fixedHeight: 100, rowHeight: 0 })).toBe(0);
  });
});

describe('targetRows', () => {
  it('容量 × 維持率(%) の切り捨て', () => {
    expect(targetRows(30, 80)).toBe(24);
    expect(targetRows(25, 90)).toBe(22);
  });

  it('維持率は 0〜100 にクランプ', () => {
    expect(targetRows(30, 150)).toBe(30);
    expect(targetRows(30, -10)).toBe(0);
  });
});
