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
    expect(normalizeSettings({ maxRows: 70 })).toEqual({
      ...DEFAULT_SETTINGS,
      maxRows: 70,
    });
  });

  it('型が違う項目は初期値に戻る', () => {
    const s = normalizeSettings({ maxRows: '70', enabled: 'yes', delaySeconds: Number.NaN });
    expect(s).toEqual(DEFAULT_SETTINGS);
  });

  it('sortByDomain は boolean のみ受け付け、既定は true', () => {
    expect(DEFAULT_SETTINGS.sortByDomain).toBe(true);
    expect(normalizeSettings({ sortByDomain: false }).sortByDomain).toBe(false);
    expect(normalizeSettings({ sortByDomain: 'no' }).sortByDomain).toBe(true);
  });

  it('closeDuplicates は boolean のみ受け付け、既定は true', () => {
    expect(DEFAULT_SETTINGS.closeDuplicates).toBe(true);
    expect(normalizeSettings({ closeDuplicates: false }).closeDuplicates).toBe(false);
    expect(normalizeSettings({ closeDuplicates: 1 }).closeDuplicates).toBe(true);
  });

  it('maxRows は 1 以上の整数', () => {
    expect(normalizeSettings({ maxRows: 0 }).maxRows).toBe(1);
    expect(normalizeSettings({ maxRows: -5 }).maxRows).toBe(1);
    expect(normalizeSettings({ maxRows: 12.7 }).maxRows).toBe(12);
  });

  it('v1.0 の使用率・行高の設定は無視して初期値になる', () => {
    const old = { keepPercent: 60, rowHeight: 20, fixedHeight: 90 };
    expect(normalizeSettings(old)).toEqual(DEFAULT_SETTINGS);
  });

  it('delaySeconds は alarms の最短(30 秒)以上', () => {
    expect(normalizeSettings({ delaySeconds: 5 }).delaySeconds).toBe(30);
    expect(normalizeSettings({ delaySeconds: 120 }).delaySeconds).toBe(120);
  });
});
