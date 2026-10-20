import { estimateCapacity, targetRows } from '../lib/capacity';
import { type SortTab, hostnameOf, planDomainSort } from '../lib/domainSort';
import type { GroupInfo, TabInfo } from '../lib/sweep';
import { selectSweep, usedRows } from '../lib/sweep';
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
  if (win.id === undefined || win.type !== 'normal' || win.height === undefined) return undefined;

  const [tabs, groups] = await Promise.all([
    chrome.tabs.query({ windowId: win.id }),
    chrome.tabGroups.query({ windowId: win.id }),
  ]);
  const tabInfos = tabs.map(toTabInfo).filter((t): t is TabInfo => t !== undefined);
  const groupInfos: GroupInfo[] = groups.map((g) => ({ id: g.id, collapsed: g.collapsed }));

  const capacity = estimateCapacity({
    windowHeight: win.height,
    fixedHeight: settings.fixedHeight,
    rowHeight: settings.rowHeight,
  });
  const target = targetRows(capacity, settings.keepPercent);
  const ids = selectSweep({ tabs: tabInfos, groups: groupInfos, target });
  if (ids.length > 0) await chrome.tabs.remove(ids);
  return {
    windowId: win.id,
    windowHeight: win.height,
    capacity,
    used: usedRows(tabInfos, groupInfos),
    target,
    closed: ids.length,
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
