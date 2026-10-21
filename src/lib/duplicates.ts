import type { GroupInfo, TabInfo } from './sweep';

export type DuplicateParams = {
  /** 単一ウィンドウ分のタブ */
  tabs: TabInfo[];
  groups: GroupInfo[];
};

/**
 * 同じ URL のタブのうち閉じるタブ id を返す(ウィンドウ内で判定)。
 * - 保護対象(ピン留め・アクティブ・音声再生中・折りたたみグループ内)は閉じない。
 * - 重複の中に保護対象があればそれを残し、それ以外を閉じる。無ければ最終アクセスが最も新しい 1 枚を残す。
 * - 最終アクセスが同じなら id が大きいほうを残す。URL が無いタブは対象外。
 */
export function selectDuplicates({ tabs, groups }: DuplicateParams): number[] {
  const collapsed = new Set(groups.filter((g) => g.collapsed).map((g) => g.id));
  const isProtected = (t: TabInfo) => t.pinned || t.active || t.audible || collapsed.has(t.groupId);

  const byUrl = new Map<string, TabInfo[]>();
  for (const t of tabs) {
    if (!t.url) continue;
    byUrl.set(t.url, [...(byUrl.get(t.url) ?? []), t]);
  }

  const closeIds: number[] = [];
  for (const sameUrl of byUrl.values()) {
    if (sameUrl.length < 2) continue;
    const newestFirst = sameUrl.toSorted((a, b) => b.lastAccessed - a.lastAccessed || b.id - a.id);
    const keep = new Set(sameUrl.filter(isProtected).map((t) => t.id));
    if (keep.size === 0) keep.add(newestFirst[0].id);
    for (const t of newestFirst) {
      if (!keep.has(t.id)) closeIds.push(t.id);
    }
  }
  return closeIds;
}
