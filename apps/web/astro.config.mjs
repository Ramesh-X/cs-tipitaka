// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

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

  integrations: [
    react(),
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      // Home gets 1.0; every other URL keeps the default 0.7. No lastmod is
      // set anywhere — build-time dates are not real content freshness (see
      // docs/SEO.md).
      serialize(item) {
        if (new URL(item.url).pathname === '/') item.priority = 1.0;
        return item;
      },
      // llms.txt is a crawler manifest, not a page — keep it out of the sitemap.
      filter: (page) => !page.endsWith('/llms.txt'),
    }),
  ],
});
