import { mkdirSync, writeFileSync } from 'node:fs';

import { crx } from '@crxjs/vite-plugin';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { type Plugin, defineConfig } from 'vite';

import manifest from './manifest.config';
import { toChromeMessages } from './src/lib/localeMessages';
import { MESSAGES } from './src/locales';

// src/locales.ts を単一ソースとして Chrome ネイティブ i18n 用の
// public/_locales/<locale>/messages.json を生成する。生成物は gitignore 済み。
function genLocales(): Plugin {
  return {
    name: 'gen-locales',
    buildStart() {
      for (const [locale, messages] of Object.entries(MESSAGES)) {
        const dir = `public/_locales/${locale}`;
        mkdirSync(dir, { recursive: true });
        writeFileSync(
          `${dir}/messages.json`,
          `${JSON.stringify(toChromeMessages(messages), null, 2)}\n`,
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [genLocales(), preact(), tailwindcss(), crx({ manifest })],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
