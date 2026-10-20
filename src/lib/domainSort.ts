import { NO_GROUP } from './sweep';

export type SortTab = {
  id: number;
  index: number;
  hostname: string;
  pinned: boolean;
  groupId: number;
};

export type SortMove = {
  tabId: number;
  /** chrome.tabs.move に渡す、ウィンドウ内の絶対 index */
  index: number;
};

/** URL から整列キーの hostname を取り出す(先頭の www. は除く。取れなければ空文字) */
export function hostnameOf(url: string | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * 単一ウィンドウのタブを hostname 昇順に並べ替える move 計画を返す。
 * - ピン留めタブとグループ内のタブは動かさない。
 * - グループ外タブは、グループで区切られた連続区間ごとに整列する(グループをまたがない)。
 * - 同一 hostname 内は元の並びを維持する。
 * move は返した順に chrome.tabs.move へ適用すると、直前の move による index のずれを織り込み済み。
 */
export function planDomainSort(tabs: SortTab[]): SortMove[] {
  const ordered = tabs.toSorted((a, b) => a.index - b.index);
  const order = ordered.map((t) => t.id);

  const moves: SortMove[] = [];
  let i = 0;
  while (i < ordered.length) {
    if (ordered[i].pinned || ordered[i].groupId !== NO_GROUP) {
      i += 1;
      continue;
    }
    let end = i;
    while (end < ordered.length && !ordered[end].pinned && ordered[end].groupId === NO_GROUP) {
      end += 1;
    }
    const sorted = ordered
      .slice(i, end)
      .toSorted((a, b) => a.hostname.localeCompare(b.hostname) || a.index - b.index);
    for (const [offset, t] of sorted.entries()) {
      const target = i + offset;
      const current = order.indexOf(t.id);
      if (current === target) continue;
      order.splice(current, 1);
      order.splice(target, 0, t.id);
      moves.push({ tabId: t.id, index: target });
    }
    i = end;
  }
  return moves;
}
