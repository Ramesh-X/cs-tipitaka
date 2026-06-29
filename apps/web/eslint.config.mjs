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
  {
    // Virtual .astro script blocks are already formatted as part of the .astro file.
    files: ['**/*.astro/*.js', '**/*.astro/*.ts'],
    rules: { 'prettier/prettier': 'off' },
  },
  globalIgnores([...SHARED_IGNORES]),
  prettierConfig,
]);
