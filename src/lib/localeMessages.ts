export type ChromeMessage = {
  message: string;
  placeholders?: Record<string, { content: string }>;
};

/**
 * 文言(`$1` が置換トークン)を Chrome ネイティブ i18n の messages.json 形式に変換する。
 * `$1` を含む文言は `$N$` プレースホルダーに置き換え、content に `$1` を割り当てる。
 */
export function toChromeMessages(messages: Record<string, string>): Record<string, ChromeMessage> {
  const out: Record<string, ChromeMessage> = {};
  for (const [key, template] of Object.entries(messages)) {
    out[key] = template.includes('$1')
      ? { message: template.replaceAll('$1', '$N$'), placeholders: { n: { content: '$1' } } }
      : { message: template };
  }
  return out;
}
