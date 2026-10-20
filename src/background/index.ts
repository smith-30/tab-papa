import { sortWindowByDomain, sweepWindow } from '../chrome/tabs';
import { loadSettings } from '../storage/settings';

// MV3 の Service Worker は破棄されるため、待機は setTimeout ではなく chrome.alarms を使う
const SWEEP_ALARM = 'sweep';

async function scheduleSweep(): Promise<void> {
  const settings = await loadSettings();
  if (!settings.enabled) return;
  await chrome.alarms.create(SWEEP_ALARM, { delayInMinutes: settings.delaySeconds / 60 });
}

async function isChromeFocused(): Promise<boolean> {
  const last = await chrome.windows.getLastFocused().catch(() => null);
  return last?.focused ?? false;
}

async function runSweep(): Promise<void> {
  const settings = await loadSettings();
  if (!settings.enabled) return;
  // 予約後に Chrome へフォーカスが戻っていたら、ブラウジング中なので実行しない
  if (await isChromeFocused()) {
    console.info('[tab-papa] sweep skipped: Chrome is focused');
    return;
  }
  const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });
  const results = await Promise.all(windows.map((win) => sweepWindow(win, settings)));
  // 動作確認用: Service Worker のコンソールで判定の内訳を見られる
  console.info(
    '[tab-papa] sweep',
    results.filter((r) => r !== undefined),
  );

  if (!settings.sortByDomain) return;
  // スイープ中に Chrome へ戻っていたら、並べ替えで画面を動かさない
  if (await isChromeFocused()) return;
  // 並べ替えはタブを閉じた後の最新の index で行う。ウィンドウごとに独立
  const moved = await Promise.all(windows.map((win) => sortWindowByDomain(win)));
  console.info('[tab-papa] sort moved', moved);
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
