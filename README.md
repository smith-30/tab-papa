# tab-papa

<img src="public/icons/icon-128.png" width="96" alt="tab-papa icon"/>

[![CI](https://github.com/smith-30/tab-papa/actions/workflows/ci.yml/badge.svg)](https://github.com/smith-30/tab-papa/actions/workflows/ci.yml)
[![prek](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/j178/prek/master/docs/assets/badge-v0.json)](https://github.com/j178/prek)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/smith-30/tab-papa/badge)](https://securityscorecards.dev/viewer/?uri=github.com/smith-30/tab-papa)

[日本語](README.ja.md)

A Chrome extension (Manifest V3) that keeps your **vertical tab list from overflowing**. While you are away from Chrome, it quietly closes duplicate and old tabs so the list fits without scrolling.

<img src="store/screenshots/04_settings.png" width="640" alt="tab-papa popup"/>

## How it works

1. You switch to another app, and Chrome loses focus.
2. After a short wait (60 seconds by default), tab-papa estimates how many rows fit in your vertical tab list from the window height.
3. It closes duplicate tabs, then closes the least recently used tabs until the list uses at most N% of those rows (80% by default).
4. It then sorts the remaining tabs by domain.

Coming back to Chrome cancels a pending run, so tabs are never closed while you browse.

## Features

- **Sweep by usage** — keeps the vertical tab list at N% of what fits on screen, closing the least recently used tabs first.
- **Duplicate tabs** — tabs with the same URL in a window are closed, keeping the one you viewed last.
- **Sort by domain** — orders ungrouped tabs by domain after tidying.
- **Preview** — the popup lists exactly which tabs would be closed with your current settings.
- **Local only** — no network access; nothing is collected, stored beyond your settings, or sent anywhere.

Never closed: pinned tabs, the active tab, tabs playing audio, and tabs in collapsed groups. Pinned tabs and tabs inside groups are also never reordered.

## Settings

Open the popup from the toolbar icon. Changes are saved immediately to `chrome.storage.local`.

| Setting | Default | Range |
|---|---|---|
| Auto tidy | on | on / off |
| Wait before tidying | 60 sec | 30–600 sec |
| Vertical tab usage | 80% | 10–100% |

> Extensions cannot read the real size of Chrome's vertical tab strip, so the number of rows that fit is an estimate (window height, an assumed row height of 32 px and 120 px of fixed UI). If it is off for your setup, adjust `rowHeight` / `fixedHeight` in `src/config.ts`.

## Development

Requires Node.js 24+ and pnpm 11+.

```bash
pnpm install
```

| Command | Description |
|---|---|
| `pnpm dev` | Dev build with HMR (wait time is 10 seconds) |
| `pnpm build` | Production build into `dist/` |
| `pnpm build:debug` | Production-style build with a 10-second wait, for manual testing only |
| `pnpm test` | Unit tests (vitest) |
| `pnpm typecheck` | Type check (tsc) |
| `pnpm lint` | Lint (oxlint) |
| `pnpm format` | Format (oxfmt) |

### Load in Chrome

1. Run `pnpm build`.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select `dist/`.

### Architecture

```
src/
├── config.ts        # Default settings and constants
├── locales.ts       # UI strings (ja / en), source of the generated _locales
├── lib/             # Pure logic with no Chrome API dependency (unit-tested)
│   ├── capacity.ts    #   rows that fit, target rows
│   ├── duplicates.ts  #   duplicate tab selection
│   ├── sweep.ts       #   used rows, which tabs to close
│   ├── plan.ts        #   one window's plan (shared by sweep and popup preview)
│   └── domainSort.ts  #   domain sort move plan
├── storage/         # chrome.storage.local wrapper and settings normalization
├── chrome/          # chrome.tabs / tabGroups / windows adapters
├── background/      # Service Worker: focus detection + chrome.alarms
└── popup/           # Preact popup
docs/                # Specification and architecture
store/               # Chrome Web Store listing text and images
```

See [docs/spec.md](docs/spec.md) and [docs/architecture.md](docs/architecture.md) for details.

### Code quality

| Tool | Role |
|---|---|
| **oxlint** | Linting |
| **oxfmt** | Formatting |
| **secretlint** | Secret leak check |
| **tsc** | Type check |
| **prek** | Pre-commit hook runner |

The same checks run in CI, plus tests and a build.

### MV3 notes

Service Workers are terminated when idle, so waiting uses `chrome.alarms` instead of `setTimeout`, and all state lives in `chrome.storage.local`.

## Releasing

`make release-major` / `release-minor` / `release-patch` bumps the version, tags it and pushes. A `v*` tag builds a ZIP and attaches it to a GitHub Release. Submission to the Chrome Web Store is manual.

## License

[MIT](LICENSE)
