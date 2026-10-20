import { useCallback, useEffect, useState } from 'preact/hooks';

import { MIN_ALARM_SECONDS } from '../config';
import { type Settings, loadSettings, saveSettings } from '../storage/settings';

const MAX_DELAY_SECONDS = 600;
const DELAY_STEP = 10;
const MIN_KEEP_PERCENT = 10;
const KEEP_STEP = 5;

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

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    void loadSettings().then(setSettings);
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
    </main>
  );
}
