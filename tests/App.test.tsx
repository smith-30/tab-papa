// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_SETTINGS } from '../src/config';
import { App } from '../src/popup/App';
import { installChromeMock, mockTab } from './helpers/chrome';

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

  describe('閉じる予定のプレビュー', () => {
    // 容量 = (1000 − 100) ÷ 30 = 30 行
    const settings = { fixedHeight: 100, rowHeight: 30 };
    const window = { id: 1, height: 1000 };
    const tabs = [1, 2, 3, 4, 5].map((id) => mockTab(id, id === 5 ? { active: true } : {}));

    it('閉じる予定のタブをタイトルで古い順に表示する(アクティブは対象外)', async () => {
      installChromeMock({ settings: { ...settings, keepPercent: 10 } }, { window, tabs });
      render(<App />);
      expect(await screen.findByText('閉じる予定 (2)')).toBeInTheDocument();
      const items = screen.getAllByRole('listitem').map((li) => li.textContent);
      expect(items).toEqual(['タブ1', 'タブ2']);
    });

    it('目標以内なら「閉じるタブはありません」と表示する', async () => {
      installChromeMock({ settings: { ...settings, keepPercent: 100 } }, { window, tabs });
      render(<App />);
      expect(await screen.findByText('閉じるタブはありません')).toBeInTheDocument();
    });

    it('スライダーを動かすと一覧が即座に更新される', async () => {
      installChromeMock({ settings: { ...settings, keepPercent: 100 } }, { window, tabs });
      render(<App />);
      await screen.findByText('閉じるタブはありません');
      fireEvent.input(screen.getByLabelText('縦タブの使用率'), { target: { value: '10' } });
      expect(await screen.findByText('閉じる予定 (2)')).toBeInTheDocument();
    });

    it('多い場合は先頭の 8 件だけ表示し、残りは件数で示す', async () => {
      const many = Array.from({ length: 20 }, (_, i) => mockTab(i + 1));
      installChromeMock({ settings: { ...settings, keepPercent: 10 } }, { window, tabs: many });
      render(<App />);
      // 目標 3 行 → 17 件が対象
      expect(await screen.findByText('閉じる予定 (17)')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(8);
      expect(screen.getByText('ほか 9 件')).toBeInTheDocument();
    });

    it('ウィンドウ情報が取れなくても設定は操作できる', async () => {
      installChromeMock();
      render(<App />);
      expect(await screen.findByLabelText('縦タブの使用率')).toBeInTheDocument();
      expect(screen.queryByText(/閉じる予定/)).not.toBeInTheDocument();
    });
  });
});
