import { vi } from 'vitest';

type MockTab = Partial<chrome.tabs.Tab> & { id: number };

type ChromeMockOptions = {
  /** getLastFocused が返す通常ウィンドウ。省略時はウィンドウ情報なし(プレビュー非表示) */
  window?: { id: number; height: number };
  tabs?: MockTab[];
  groups?: { id: number; collapsed: boolean }[];
};

/** chrome.* を最小限モックする。storage はインメモリ */
export function installChromeMock(
  initial: Record<string, unknown> = {},
  opts: ChromeMockOptions = {},
) {
  const store: Record<string, unknown> = { ...initial };
  const win = opts.window && { type: 'normal' as const, focused: true, ...opts.window };
  const chromeMock = {
    storage: {
      local: {
        get: vi.fn<(key: string) => Promise<Record<string, unknown>>>(async (key) =>
          key in store ? { [key]: store[key] } : {},
        ),
        set: vi.fn<(obj: Record<string, unknown>) => Promise<void>>(async (obj) => {
          Object.assign(store, obj);
        }),
      },
    },
    windows: {
      getLastFocused: vi.fn<() => Promise<typeof win>>(async () => win),
    },
    tabs: {
      query: vi.fn<() => Promise<MockTab[]>>(async () => opts.tabs ?? []),
    },
    tabGroups: {
      query: vi.fn<() => Promise<{ id: number; collapsed: boolean }[]>>(
        async () => opts.groups ?? [],
      ),
    },
  };
  vi.stubGlobal('chrome', chromeMock);
  return { store, chrome: chromeMock };
}

/** プレビューのテスト用タブ。lastAccessed は id が小さいほど古い */
export function mockTab(id: number, overrides: Partial<chrome.tabs.Tab> = {}): MockTab {
  return {
    id,
    title: `タブ${id}`,
    pinned: false,
    active: false,
    audible: false,
    groupId: -1,
    index: id - 1,
    lastAccessed: id * 1000,
    ...overrides,
  };
}
