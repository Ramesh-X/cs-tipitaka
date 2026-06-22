import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Fully prerendered (SSG) site with no on-demand revalidation: serve the
// build-time pages straight from Workers Static Assets — no R2/KV, no extra
// cost. `enableCacheInterception` serves them without invoking the full Next.js
// render (also keeps the build-time-only `fs` reads in loadDocument off the
// request path). Must stay `false` only if PPR is ever enabled — it is not here.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
