// @ts-check

import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://kugie-web-ui.pages.dev',
  output: 'server',
  adapter: cloudflare(),
  session: {
    driver: 'unstorage/drivers/null',
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
});
