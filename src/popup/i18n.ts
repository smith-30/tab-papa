import { MESSAGES, type MessageKey } from '../locales';

function substitute(template: string, subs?: string[]): string {
  if (!subs || subs.length === 0) return template;
  return template.replaceAll('$1', subs[0]);
}

/**
 * 表示文言を返す。配布ビルドでは chrome.i18n がブラウザの言語で解決する。
 * dev(vite)とテストは _locales がディスク上に無く空を返すため、日本語にフォールバックする。
 */
export function t(key: MessageKey, subs?: string[]): string {
  const message = chrome.i18n?.getMessage?.(key, subs);
  if (message) return message;
  return substitute(MESSAGES.ja[key], subs);
}
