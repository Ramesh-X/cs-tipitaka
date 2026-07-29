import { SHARED_IGNORES, prettierConfig } from '../../eslint.config.mjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

const astroJsxA11yConfigs =
  eslintPluginAstro.configs['flat/jsx-a11y-recommended'];
// eslint-plugin-astro registers its a11y rules as `astro/jsx-a11y/*`, which
// only visits Astro's own template AST — it never fires on .tsx. Reuse its
// exact `jsx-a11y` plugin object (not a fresh import) when adding the real
// `jsx-a11y/*` rules for .tsx below: ESLint's flat config rejects two
// different object references registered under the same plugin name
// ("Cannot redefine plugin"), and a separate `import` here resolves to a
// different loaded instance than astro's internal requireUserLocal() load.
const jsxA11yPlugins = astroJsxA11yConfigs.find(
  (c) => c.plugins?.['jsx-a11y'],
)?.plugins;

export default defineConfig([
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  // a11y linting for .astro templates (astro-aware adaptation of jsx-a11y rules)...
  ...astroJsxA11yConfigs,
  // ...and the real jsx-a11y/* rules for .tsx React islands.
  {
    files: ['**/*.tsx'],
    plugins: jsxA11yPlugins,
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  {
    // Disable type-project parsing — recommended rules don't need type info.
    // tsconfigRootDir prevents ambiguity in monorepos with multiple tsconfigs.
    languageOptions: {
      parserOptions: {
        project: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  globalIgnores([...SHARED_IGNORES]),
  prettierConfig,
  {
    // .astro files and their virtual script blocks are formatted by the standalone
    // prettier format step (prettier --write). eslint-plugin-prettier cannot resolve
    // prettier-plugin-astro correctly in its synckit worker context, so we disable
    // the prettier/prettier rule for .astro files here and rely on `pnpm run format`.
    // This must come AFTER prettierConfig so it takes precedence.
    files: ['**/*.astro', '**/*.astro/*.js', '**/*.astro/*.ts'],
    rules: { 'prettier/prettier': 'off' },
  },
]);
