# AGENTS.MD

## Tech Stack

- This is a pnpm monorepo. Read the root `package.json`, `pnpm-workspace.yaml`, and the relevant app or package `package.json` before implementing features.
- Only `apps/web` and `apps/api` are deployed Cloudflare Workers. Everything else must not add its own Wrangler config.
- The repo-root `wrangler.jsonc` is a shared, non-deployed config for supplementary D1 CLI work only. Helpers reference it with `--config ../../wrangler.jsonc`; don't give them their own Wrangler config. Deployed Workers (`apps/web`, `apps/api`) keep their own configs and must hold their own bindings — keep their `database_name`/`database_id` in sync with the root config.
- `apps/pipelines` owns corpus source-file processing, XML parsing, D1 migrations, and seeding. It uses the shared root Wrangler config for D1 CLI work.
- `packages/corpus` owns schemas, types, repositories, DB adapters, and DB-backed transformations for web/API consumers. It must not process source files or own Wrangler D1 CLI scripts.
- `apps/legacy-next` is the legacy app. Do not add a Wrangler config there.
- Use the packages already declared in the relevant workspace package. Read latest package documentation before making framework or dependency changes.
- `docs/web/` documents non-obvious `apps/web` implementation decisions (hydration/FOUC, soft navigation, the corpus tree, transliteration, the corpus data layer). Read it before changing related code, and add to it — not to inline comments — when you make a similarly non-obvious choice.

## Guidelines

- All apps and packages must have `lint`, `lint:fix`, `format`, and `fix-all` scripts in their `package.json`. If they don't, add them.
- Always use `pnpm run fix-all` followed by `pnpm run build` after editing files.
- Always use `shadcn` and `tailwindcss` for UI components and styling. Don't use custom CSS or any other UI libraries.
- When changing files under `apps/web/src`, import other `src/` modules via the `@/` alias (defined in `apps/web/components.json` and mapped in `apps/web/tsconfig.json`), never with parent-crossing relative paths (`../`). Same-directory/child relative imports (`./foo.ts`) are fine. This doesn't apply to `apps/web/scripts/`: those run under plain Node (`node --experimental-strip-types`), not Astro/Vite, so `@/` doesn't resolve there — they must use real package imports or relative paths.
- Always use documentation from latest package versions (use `context7` and `brave-search` tools).
- Use feature-based packaging.
- No duplicate functions, classes, or files anywhere in the project. Before writing new logic, search the codebase for an existing implementation and reuse or extend it. When similar-looking code already exists in more than one place, abstract the common part into its own file instead of adding another copy — cross-app logic (used by more than one of `apps/web`/`apps/api`) goes in `packages/shared`; corpus schemas, types, and DB-backed logic go in `packages/corpus` per the ownership rule above.
- Do not ignore any kind of deprecation warnings. Always address them to solve them.
- Do not ignore any kind of linting/formatting warnings. Always address them to solve them.
- Always search internet for solutions for any issues encountered (like deprecation warnings, linting/formatting warnings, errors, etc.). Don't rely on your knowledge. If your knowledge was accurate, you wouldn't have encountered the issue in the first place.
- If new environment variables are introduced, add them to the `.env.example` file.
- Don't read/delete/write `.env` files. Those files are out of your scope. Read only example env files.
- Condense your (agent's) context (with `/compact`) when the token usage exceeds 128K tokens.
- Don't create files larger than 400 lines. Run `./file_length.sh` to check files with more than 400 lines. (Use `FileSplitPrompt.md` for guidance on how to split files.)
- Keep code comments minimal to none. A comment should explain "why", never "what" or "how" — code and naming should already make those clear. Keep the "why" brief and, if it needs more than a line, put the explanation in that app's docs (e.g. `docs/web/`) and leave only a short pointer comment.

## Documentations Helpers

Hono: https://hono.dev/llms.txt
Cloudflare: https://developers.cloudflare.com/llms.txt
Shadcn: https://ui.shadcn.com/llms.txt
