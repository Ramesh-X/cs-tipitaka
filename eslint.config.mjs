import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

/** Ignore patterns shared across all apps and packages. */
export const SHARED_IGNORES = [
  '**/node_modules/**',
  '**/.next/**',
  '**/.astro/**',
  '**/dist/**',
  '**/out/**',
  '**/.open-next/**',
  '**/.wrangler/**',
  '**/data/**',
  '**/.claude/**',
  '**/.github/**',
  '**/.kilo/**',
  '**/lib/corpus/generated/**',
];

/** Prettier config object — import this in per-app configs to keep it last. */
export { prettierRecommended as prettierConfig };

/**
 * Base ESLint config used by apps and packages that do not have their own
 * eslint.config.mjs. Apps that need framework-specific rules (Next.js, Astro,
 * etc.) should create a local eslint.config.mjs that imports SHARED_IGNORES
 * and prettierConfig from here and spreads them alongside their own rules.
 */
export default tseslint.config(
  { ignores: SHARED_IGNORES },
  ...tseslint.configs.recommended,
  prettierRecommended,
);
