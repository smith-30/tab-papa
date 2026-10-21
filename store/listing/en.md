# Chrome Web Store listing (English)

Text to paste into the dashboard. Keep it consistent with `docs/spec.md`.

## Basics

- **Name** (≤ 75 chars): tab-papa
- **Category**: Productivity
- **Language**: English

## Summary (≤ 132 chars)

Keep your vertical tab list from overflowing. Quietly closes your oldest tabs while you're away from Chrome.

## Description

Does your vertical tab list keep growing until it needs scrolling?
tab-papa tidies up old tabs while you are not using Chrome, so the list stays short enough to fit without scrolling.

WHEN IT HELPS
- You use Chrome's vertical tabs and the list gets longer than you notice
- Closing tabs is a chore, so they pile up
- You don't want tabs closed behind your back while you work

FEATURES
- Automatic sweep: estimates how many rows fit in your vertical tab list from the window height, and when you exceed a set share of it (80% by default), closes the least recently used tabs.
- Never while you browse: runs only after you have been away from Chrome for a while (60 seconds by default). Switching back to Chrome cancels it.
- Protected tabs: pinned tabs, the active tab, tabs playing audio and tabs in collapsed groups are never closed.
- Tab-group aware: group header rows are counted too.
- Preview before closing: the popup lists, by title, the tabs that would be closed with your current settings.
- Closes duplicate tabs: for tabs with the same URL, keeps only the one you viewed last (pinned, active and similar tabs are never closed).
- Sorts by domain: after tidying, tabs are ordered by domain (pinned tabs and tabs inside groups are left alone). Can be turned off in settings.

SETTINGS
- Keep ratio (%)
- Domain sorting on/off
- Row height (px) and other values, to fit your setup

PRIVACY
- No communication with any external server.
- To detect duplicates and sort by domain, each tab's URL is read transiently; Titles are read only to show the preview in the popup. Neither is ever stored or sent.
- Only your settings are saved, on your device (chrome.storage).

OPEN SOURCE
Released under the MIT license on GitHub.

Note: extensions cannot read the real size of the vertical tab list, so the row count is an estimate based on the window height. Adjust it in the settings if it is off.

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
