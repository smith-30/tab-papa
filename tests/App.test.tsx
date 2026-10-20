// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_SETTINGS } from '../src/config';
import { App } from '../src/popup/App';
import { installChromeMock } from './helpers/chrome';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('<App />', () => {
  it('未保存なら既定値で表示する', async () => {
    installChromeMock();
    render(<App />);
    const delay = await screen.findByLabelText('整理するまでの待ち時間');
    expect(delay).toHaveValue(String(DEFAULT_SETTINGS.delaySeconds));
    expect(screen.getByLabelText('縦タブの使用率')).toHaveValue(
      String(DEFAULT_SETTINGS.keepPercent),
    );
  });

  it('保存済みの設定を表示する', async () => {
    installChromeMock({ settings: { delaySeconds: 120, keepPercent: 70 } });
    render(<App />);
    expect(await screen.findByLabelText('整理するまでの待ち時間')).toHaveValue('120');
    expect(screen.getByLabelText('縦タブの使用率')).toHaveValue('70');
    expect(screen.getByText('120 秒')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('待ち時間を変えると storage に保存され、他の設定は保たれる', async () => {
    const { store } = installChromeMock({ settings: { keepPercent: 60, sortByDomain: false } });
    render(<App />);
    const delay = await screen.findByLabelText('整理するまでの待ち時間');
    fireEvent.input(delay, { target: { value: '180' } });
    await waitFor(() =>
      expect(store.settings).toMatchObject({
        delaySeconds: 180,
        keepPercent: 60,
        sortByDomain: false,
      }),
    );
    expect(screen.getByText('180 秒')).toBeInTheDocument();
  });

  it('使用率を変えると storage に保存される', async () => {
    const { store } = installChromeMock();
    render(<App />);
    const keep = await screen.findByLabelText('縦タブの使用率');
    fireEvent.input(keep, { target: { value: '55' } });
    await waitFor(() =>
      expect(store.settings).toMatchObject({
        keepPercent: 55,
        delaySeconds: DEFAULT_SETTINGS.delaySeconds,
      }),
    );
    expect(screen.getByText('55%')).toBeInTheDocument();
  });
});
