import { SHARED_IGNORES, prettierConfig } from '../../eslint.config.mjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
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
