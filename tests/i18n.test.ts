import { afterEach, describe, expect, it, vi } from 'vitest';

import { toChromeMessages } from '../src/lib/localeMessages';
import { LOCALES, MESSAGES, type MessageKey } from '../src/locales';
import { t } from '../src/popup/i18n';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('t()', () => {
  it('chrome.i18n が値を返せばそれを使う(置換引数も渡す)', () => {
    const getMessage = vi.fn<(key: string, subs?: string[]) => string>(() => 'FROM_CHROME');
    vi.stubGlobal('chrome', { i18n: { getMessage } });
    expect(t('delayValue', ['60'])).toBe('FROM_CHROME');
    expect(getMessage).toHaveBeenCalledWith('delayValue', ['60']);
  });

  it('chrome.i18n が空文字なら日本語にフォールバックし、$1 を置換する(dev・テスト相当)', () => {
    vi.stubGlobal('chrome', { i18n: { getMessage: () => '' } });
    expect(t('delayValue', ['60'])).toBe('60 秒');
  });

  it('chrome.i18n 自体が無くても日本語にフォールバックする', () => {
    vi.stubGlobal('chrome', {});
    expect(t('toggleLabel')).toBe('自動整理');
  });
});

const placeholders = (s: string) => s.includes('$1');

describe('MESSAGES', () => {
  it('全ロケールが同じキーを持ち、空文字が無い', () => {
    const keys = Object.keys(MESSAGES.ja).toSorted();
    for (const locale of LOCALES) {
      expect(Object.keys(MESSAGES[locale]).toSorted()).toEqual(keys);
      for (const key of keys) expect(MESSAGES[locale][key as MessageKey]).not.toBe('');
    }
  });

  it('$1 の有無がロケール間で一致する(置換漏れ防止)', () => {
    for (const key of Object.keys(MESSAGES.ja) as MessageKey[]) {
      for (const locale of LOCALES) {
        expect(placeholders(MESSAGES[locale][key])).toBe(placeholders(MESSAGES.ja[key]));
      }
    }
  });
});

describe('toChromeMessages', () => {
  it('$1 を含まない文言はそのまま message にする', () => {
    expect(toChromeMessages({ a: 'こんにちは' })).toEqual({ a: { message: 'こんにちは' } });
  });

  it('$1 を含む文言は placeholders 形式に変換する', () => {
    expect(toChromeMessages({ a: '$1 秒' })).toEqual({
      a: { message: '$N$ 秒', placeholders: { n: { content: '$1' } } },
    });
  });
});
