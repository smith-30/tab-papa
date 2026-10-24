import type { ManifestV3Export } from '@crxjs/vite-plugin';

import pkg from './package.json';

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'tab-papa',
  version: pkg.version,
  description: '__MSG_appDesc__',
  default_locale: 'en',
  icons: {
    '16': 'icons/icon-16.png',
    '32': 'icons/icon-32.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
  permissions: ['tabs', 'tabGroups', 'storage', 'alarms'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'tab-papa',
    default_icon: {
      '16': 'icons/icon-16.png',
      '32': 'icons/icon-32.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png',
    },
  },
};

export default manifest;
