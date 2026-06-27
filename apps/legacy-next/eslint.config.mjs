import { SHARED_IGNORES, prettierConfig } from '../../eslint.config.mjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ...SHARED_IGNORES,
    // next-specific
    'corpus/**',
    'next-env.d.ts',
  ]),
  // Must be last so eslint-config-prettier disables conflicting rules.
  prettierConfig,
]);
