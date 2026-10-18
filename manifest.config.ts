import type { ManifestV3Export } from '@crxjs/vite-plugin';

import pkg from './package.json';

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'tab-papa',
  version: pkg.version,
  description: 'Smart tab-count management for Chrome vertical tabs',
  permissions: ['tabs', 'storage', 'alarms'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'tab-papa',
  },
};

export default manifest;
