import { sweepWindow } from '../chrome/tabs';
import { loadSettings } from '../storage/settings';

// MV3 の Service Worker は破棄されるため、待機は setTimeout ではなく chrome.alarms を使う
const SWEEP_ALARM = 'sweep';

async function scheduleSweep(): Promise<void> {
  const settings = await loadSettings();
  if (!settings.enabled) return;
  await chrome.alarms.create(SWEEP_ALARM, { delayInMinutes: settings.delaySeconds / 60 });
}

async function runSweep(): Promise<void> {
  const settings = await loadSettings();
  if (!settings.enabled) return;
  // 予約後に Chrome へフォーカスが戻っていたら、ブラウジング中なので実行しない
  const last = await chrome.windows.getLastFocused().catch(() => null);
  if (last?.focused) return;
  const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
  await Promise.all(windows.map((win) => sweepWindow(win, settings)));
}

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    void scheduleSweep();
  } else {
    void chrome.alarms.clear(SWEEP_ALARM);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SWEEP_ALARM) void runSweep();
});
