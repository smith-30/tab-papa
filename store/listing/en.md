# Chrome Web Store listing (English)

Text to paste into the dashboard. Keep it consistent with `docs/spec.md`.

## Basics

- **Name** (≤ 75 chars): tab-papa
- **Category**: Productivity
- **Language**: English

## Summary (≤ 132 chars)

Keep your vertical tab list from overflowing. Quietly closes your oldest tabs while you're away from Chrome.

## Description

tab-papa quietly tidies up while you are away, before your Chrome vertical tab list overflows.
Install it and forget about it.

When your vertical tab list has grown long enough to scroll, tab-papa closes duplicate and old tabs while you are away from Chrome.

■ FEATURES

・Usage sweep
  Estimates how many rows fit in your vertical tab list from the window height. Anything beyond a set share of it (80% by default) is closed, least recently viewed first.

・Duplicate close
  If a window has several tabs with the same URL, only the one you viewed last is kept. This happens regardless of the usage setting.

・Domain sort
  After tidying, tabs are sorted by domain. Pinned tabs and tabs inside groups are left where they are.

・Preview before closing
  The popup shows, by title, which tabs would be closed with your current settings.

■ NEVER WHILE YOU BROWSE

It runs only after you switch to another app, Chrome loses focus, and the wait you set (60 seconds by default) has passed. Coming back to Chrome cancels it.

Pinned tabs, the active tab, tabs playing audio and tabs in collapsed groups are always left alone, so your important tabs will not disappear.

■ PRIVACY — NOTHING LEAVES YOUR BROWSER

Zero communication with external servers. To detect duplicates and sort by domain, tab URLs are read on the spot, and titles are read to show the preview. Neither is ever stored or sent.
Only your settings are saved, inside the browser (chrome.storage.local).

■ LIGHTWEIGHT

A few tens of KB in size. It only watches for Chrome losing focus, and does nothing else except when it tidies up.

■ OPEN SOURCE (MIT LICENSE)

The full source code is on GitHub.
https://github.com/smith-30/tab-papa

■ SETTINGS

Customize from the popup:

・Auto tidy on/off
・Wait before tidying (default 60 sec, 30–600 sec)
・Vertical tab usage (default 80%, 10–100%)

Note: extensions cannot read the real size of the vertical tab list, so the number of rows that fit is an estimate based on the window height.

## Single purpose

Automatically close tabs that overflow Chrome's vertical tab list while the browser is not in use, keeping the number of open tabs manageable.

## Permission justification

| Permission | Reason |
|---|---|
| `tabs` | Reads each tab's URL, last-accessed time and pinned / active / audible state to choose which tabs to close (duplicates and stale tabs), closes them, moves tabs to sort them by domain, and reads titles to show which tabs would be closed in the popup (never stored or sent). |
| `tabGroups` | Reads whether groups are collapsed so rows (including group header rows) are counted correctly. |
| `storage` | Saves settings (keep ratio, row height, etc.) on the device. |
| `alarms` | Waits a set time after Chrome loses focus before sweeping (service workers are terminated, so timers cannot be used). |

- **Remote code**: not used
- **Host permissions**: none

## Privacy practices

- User data collected: **none**
- Agree to the Limited Use certifications: no sale/transfer outside approved uses, no unrelated use, no use for creditworthiness.
