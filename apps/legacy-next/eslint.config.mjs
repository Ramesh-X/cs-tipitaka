import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Project-specific ignores:
    '.claude/**',
    '.github/**',
    '.kilo/**',
    '.open-next/**',
    '.wrangler/**',
    'corpus/**',
    'lib/corpus/generated/**',
    'node_modules/**',
  ]),
  // Must be last so eslint-config-prettier can disable conflicting rules.
  prettierRecommended,
]);

export default eslintConfig;
