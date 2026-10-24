import { describe, expect, it } from 'vitest';

import config from '../manifest.config';
import { LOCALES } from '../src/locales';

// ManifestV3Export はオブジェクト・関数の union。このリポジトリの manifest は常にオブジェクト
const manifest = config as { default_locale?: string; description?: string };

describe('manifest の多言語設定', () => {
  it('default_locale は英語(対応外の言語の利用者には英語を出す)', () => {
    expect(manifest.default_locale).toBe('en');
  });

  it('default_locale は _locales を生成する言語に含まれる(無いと拡張を読み込めない)', () => {
    expect(LOCALES as readonly string[]).toContain(manifest.default_locale);
  });

  it('説明文は _locales のメッセージを参照する', () => {
    expect(manifest.description).toBe('__MSG_appDesc__');
  });
});
