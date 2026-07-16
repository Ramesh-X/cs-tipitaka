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
    optimizeDeps: {
      // zustand/middleware is only reachable through a workspace-linked
      // module (src/lib/stores/layout-preferences.ts), so Vite's initial
      // dep scan can miss it and discover it mid-session, forcing a
      // re-optimize that strands in-flight requests with 504 Outdated
      // Optimize Dep. Declaring it explicitly avoids that.
      include: ['zustand', 'zustand/middleware'],
    },
  },

  integrations: [react()],
});
