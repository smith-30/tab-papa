import { type SortTab, hostnameOf, planDomainSort } from '../lib/domainSort';
import { planSweep } from '../lib/plan';
import type { GroupInfo, TabInfo } from '../lib/sweep';
import type { Settings } from '../storage/settings';

function toTabInfo(tab: chrome.tabs.Tab): TabInfo | undefined {
  if (tab.id === undefined) return undefined;
  return {
    id: tab.id,
    pinned: tab.pinned,
    active: tab.active,
    audible: tab.audible ?? false,
    groupId: tab.groupId,
    lastAccessed: tab.lastAccessed ?? 0,
  };
}

export type WindowSnapshot = {
  windowId: number;
  windowHeight: number;
  tabs: TabInfo[];
  /** タブ id を現在の並び(index 昇順)にしたもの */
  order: number[];
  groups: GroupInfo[];
  /** グループ id → グループ名 */
  groupTitles: Record<number, string>;
  /** タブ id → タイトル(ポップアップのプレビュー表示用。保存・送信はしない) */
  titles: Record<number, string>;
};

/** 1 ウィンドウ分のタブ・グループの現在の状態(対象外のウィンドウは undefined) */
export async function loadWindowSnapshot(
  win: chrome.windows.Window,
): Promise<WindowSnapshot | undefined> {
  if (win.id === undefined || win.type !== 'normal' || win.height === undefined) return undefined;

  const [tabs, groups] = await Promise.all([
    chrome.tabs.query({ windowId: win.id }),
    chrome.tabGroups.query({ windowId: win.id }),
  ]);
  const titles: Record<number, string> = {};
  for (const t of tabs) {
    if (t.id !== undefined) titles[t.id] = t.title ?? t.url ?? '';
  }
  return {
    windowId: win.id,
    windowHeight: win.height,
    tabs: tabs.map(toTabInfo).filter((t): t is TabInfo => t !== undefined),
    order: tabs
      .toSorted((a, b) => a.index - b.index)
      .flatMap((t) => (t.id === undefined ? [] : [t.id])),
    groups: groups.map((g) => ({ id: g.id, collapsed: g.collapsed })),
    groupTitles: Object.fromEntries(groups.map((g) => [g.id, g.title ?? ''])),
    titles,
  };
}

export type SweepResult = {
  windowId: number;
  windowHeight: number;
  capacity: number;
  used: number;
  target: number;
  closed: number;
};

/** 1 ウィンドウ分をスイープし、判定の内訳を返す(対象外のウィンドウは undefined) */
export async function sweepWindow(
  win: chrome.windows.Window,
  settings: Settings,
): Promise<SweepResult | undefined> {
  const snapshot = await loadWindowSnapshot(win);
  if (!snapshot) return undefined;

  const plan = planSweep({ ...snapshot, ...settings });
  if (plan.closeIds.length > 0) await chrome.tabs.remove(plan.closeIds);
  return {
    windowId: snapshot.windowId,
    windowHeight: snapshot.windowHeight,
    capacity: plan.capacity,
    used: plan.used,
    target: plan.target,
    closed: plan.closeIds.length,
  };
}

/** 1 ウィンドウ分をドメイン順に並べ替え、動かしたタブ数を返す */
export async function sortWindowByDomain(win: chrome.windows.Window): Promise<number> {
  if (win.id === undefined || win.type !== 'normal') return 0;

  // スイープで閉じた直後は index がずれているため、必ず取り直す
  const tabs = await chrome.tabs.query({ windowId: win.id });
  const sortTabs = tabs.flatMap((t): SortTab[] =>
    t.id === undefined
      ? []
      : [
          {
            id: t.id,
            index: t.index,
            hostname: hostnameOf(t.url),
            pinned: t.pinned,
            groupId: t.groupId,
          },
        ],
  );
  const moves = planDomainSort(sortTabs);
  // 前の move による index のずれを織り込んだ計画なので、順番に適用する
  for (const { tabId, index } of moves) {
    // oxlint-disable-next-line eslint/no-await-in-loop
    await chrome.tabs.move(tabId, { index });
  }
  return moves.length;
}
