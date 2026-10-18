// @vitest-environment jsdom
import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';

import { App } from '../src/popup/App';

describe('App', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText('tab-papa')).toBeTruthy();
  });
});
