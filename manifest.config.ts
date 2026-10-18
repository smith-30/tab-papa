import type { ManifestV3Export } from '@crxjs/vite-plugin';

import pkg from './package.json';

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'tab-papa',
  version: pkg.version,
  description: 'Vertical-tab-optimized tab manager',
  permissions: ['tabs', 'storage', 'sidePanel'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  action: {
    default_title: 'tab-papa',
  },
};

export default manifest;
