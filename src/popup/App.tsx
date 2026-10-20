import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';

import { type WindowSnapshot, loadWindowSnapshot } from '../chrome/tabs';
import { MIN_ALARM_SECONDS } from '../config';
import { planSweep } from '../lib/plan';
import { buildKeptRows } from '../lib/rows';
import { type Settings, loadSettings, saveSettings } from '../storage/settings';

const MAX_DELAY_SECONDS = 600;
const DELAY_STEP = 10;
const MIN_KEEP_PERCENT = 10;
const KEEP_STEP = 5;
const PREVIEW_LIMIT = 8;

type NumericSetting = 'delaySeconds' | 'keepPercent';

type SliderProps = {
  field: NumericSetting;
  label: string;
  hint: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (field: NumericSetting, value: number) => void;
};

function Slider({ field, label, hint, value, display, min, max, step, onChange }: SliderProps) {
  const id = `slider-${label}`;
  const handleInput = useCallback(
    (e: Event) => onChange(field, Number((e.currentTarget as HTMLInputElement).value)),
    [field, onChange],
  );
  return (
    <div class="rounded-xl bg-zinc-900 p-4">
      <div class="flex items-baseline justify-between">
        <label for={id} class="text-sm font-medium">
          {label}
        </label>
        <span class="text-lg font-bold tabular-nums">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        class="mt-3 w-full accent-indigo-400"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={handleInput}
      />
      <p class="mt-2 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

type PreviewProps = {
  snapshot: WindowSnapshot;
  settings: Settings;
};

/** 今の設定でスイープした場合の縦タブ一覧。罫線より上が残り、下が閉じられる(実際のスイープと同じ計算) */
function Preview({ snapshot, settings }: PreviewProps) {
  const plan = useMemo(() => planSweep({ ...snapshot, ...settings }), [snapshot, settings]);
  const kept = useMemo(
    () => buildKeptRows({ ...snapshot, closeIds: plan.closeIds }),
    [snapshot, plan.closeIds],
  );
  const shown = plan.closeIds.slice(0, PREVIEW_LIMIT);
  const rest = plan.closeIds.length - shown.length;
  return (
    <section class="rounded-xl bg-zinc-900 p-4">
      <p class="text-xs text-zinc-400">
        {`表示できる行数 ${plan.capacity} / 使用 ${plan.used} / 目標 ${plan.target}`}
      </p>
      <ul aria-label="残るタブ" class="mt-3 max-h-56 space-y-1 overflow-y-auto text-sm">
        {kept.map((row) =>
          row.kind === 'group' ? (
            <li key={`g${row.id}`} class="truncate font-medium text-indigo-300">
              {row.title || 'グループ'}
            </li>
          ) : (
            <li key={row.id} class="truncate rounded bg-zinc-800 px-2 py-1 text-zinc-200">
              {row.title}
            </li>
          ),
        )}
      </ul>
      <div
        role="separator"
        class="my-2 flex items-center gap-2 text-xs text-cyan-400 before:h-px before:flex-1 before:border-t before:border-dashed before:border-cyan-400"
      >
        {`目標 ${plan.target} 行`}
      </div>
      {plan.closeIds.length === 0 ? (
        <p class="text-sm">閉じるタブはありません</p>
      ) : (
        <>
          <h2 class="text-sm font-medium">{`閉じる予定 (${plan.closeIds.length})`}</h2>
          <ul aria-label="閉じる予定のタブ" class="mt-2 space-y-1 text-sm text-zinc-500">
            {shown.map((id) => (
              <li key={id} class="truncate line-through">
                {snapshot.titles[id]}
              </li>
            ))}
          </ul>
          {rest > 0 && <p class="mt-1 text-xs text-zinc-400">{`ほか ${rest} 件`}</p>}
        </>
      )}
    </section>
  );
}

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [snapshot, setSnapshot] = useState<WindowSnapshot | null>(null);

  useEffect(() => {
    void loadSettings().then(setSettings);
    // プレビューは補助機能なので、ウィンドウを取れなくても設定画面は使えるようにする
    void chrome.windows
      .getLastFocused({ windowTypes: ['normal'] })
      .then(loadWindowSnapshot)
      .then((snap) => setSnapshot(snap ?? null))
      .catch(() => setSnapshot(null));
  }, []);

  // 変更は即保存する。保存値は他の項目を含む設定全体
  const update = useCallback(
    (field: NumericSetting, value: number) => {
      if (!settings) return;
      const next = { ...settings, [field]: value };
      setSettings(next);
      void saveSettings(next);
    },
    [settings],
  );

  if (!settings) return null;

  return (
    <main class="w-80 space-y-3 p-4">
      <h1 class="text-base font-semibold">tab-papa</h1>
      <Slider
        field="delaySeconds"
        label="整理するまでの待ち時間"
        hint="Chrome から離れて、この時間が経つと整理します。戻ると中断します。"
        value={settings.delaySeconds}
        display={`${settings.delaySeconds} 秒`}
        min={MIN_ALARM_SECONDS}
        max={MAX_DELAY_SECONDS}
        step={DELAY_STEP}
        onChange={update}
      />
      <Slider
        field="keepPercent"
        label="縦タブの使用率"
        hint="縦タブ一覧に表示できる行数のうち、この割合まで減らします。"
        value={settings.keepPercent}
        display={`${settings.keepPercent}%`}
        min={MIN_KEEP_PERCENT}
        max={100}
        step={KEEP_STEP}
        onChange={update}
      />
      {snapshot && <Preview snapshot={snapshot} settings={settings} />}
    </main>
  );
}
