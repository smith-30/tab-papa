import { vi } from 'vitest';

/** chrome.storage.local だけをインメモリでモックする */
export function installChromeMock(initial: Record<string, unknown> = {}) {
  const store: Record<string, unknown> = { ...initial };
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
  };
  vi.stubGlobal('chrome', chromeMock);
  return { store, chrome: chromeMock };
}
