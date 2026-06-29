// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // output: 'static' is the default — deployed via Cloudflare Workers Static Assets
  site: 'https://tipitakaonline.org',
  trailingSlash: 'never',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
