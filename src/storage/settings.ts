import { DEFAULT_SETTINGS, MIN_ALARM_SECONDS } from '../config';

export type Settings = {
  enabled: boolean;
  sortByDomain: boolean;
  closeDuplicates: boolean;
  maxRows: number;
  delaySeconds: number;
};

const STORAGE_KEY = 'settings';

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** storage から読んだ未検証の値を、範囲内の Settings に整える */
export function normalizeSettings(raw: unknown): Settings {
  const r: Record<string, unknown> =
    typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const d = DEFAULT_SETTINGS;
  return {
    enabled: typeof r.enabled === 'boolean' ? r.enabled : d.enabled,
    sortByDomain: typeof r.sortByDomain === 'boolean' ? r.sortByDomain : d.sortByDomain,
    closeDuplicates: typeof r.closeDuplicates === 'boolean' ? r.closeDuplicates : d.closeDuplicates,
    maxRows: Math.max(1, Math.floor(pickNumber(r.maxRows, d.maxRows))),
    delaySeconds: Math.max(MIN_ALARM_SECONDS, pickNumber(r.delaySeconds, d.delaySeconds)),
  };
}

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return normalizeSettings(stored[STORAGE_KEY]);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}
