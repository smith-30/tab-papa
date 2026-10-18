import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS } from '../src/config';
import { normalizeSettings } from '../src/storage/settings';

describe('normalizeSettings', () => {
  it('未設定・不正な入力は初期値になる', () => {
    expect(normalizeSettings({})).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings('x')).toEqual(DEFAULT_SETTINGS);
  });

  it('指定された項目だけ上書きされる', () => {
    expect(normalizeSettings({ keepPercent: 70 })).toEqual({
      ...DEFAULT_SETTINGS,
      keepPercent: 70,
    });
  });

  it('型が違う項目は初期値に戻る', () => {
    const s = normalizeSettings({ keepPercent: '70', enabled: 'yes', rowHeight: Number.NaN });
    expect(s).toEqual(DEFAULT_SETTINGS);
  });

  it('keepPercent は 0〜100 にクランプ', () => {
    expect(normalizeSettings({ keepPercent: 150 }).keepPercent).toBe(100);
    expect(normalizeSettings({ keepPercent: -5 }).keepPercent).toBe(0);
  });

  it('rowHeight は 1px 以上', () => {
    expect(normalizeSettings({ rowHeight: 0 }).rowHeight).toBe(1);
  });

  it('delaySeconds は alarms の最短(30 秒)以上', () => {
    expect(normalizeSettings({ delaySeconds: 5 }).delaySeconds).toBe(30);
    expect(normalizeSettings({ delaySeconds: 120 }).delaySeconds).toBe(120);
  });
});
