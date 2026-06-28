# AGENTS.MD

## Tech Stack

- This is a pnpm monorepo. Read the root `package.json`, `pnpm-workspace.yaml`, and the relevant app or package `package.json` before implementing features.
- Only `apps/web` and `apps/api` are deployed Cloudflare Workers. Everything else (e.g. `apps/pipelines`, `packages/corpus`) is a helper that only uses `wrangler` for D1/CLI operations, not for deploying a Worker.
- The repo-root `wrangler.jsonc` is a shared, non-deployed config for supplementary D1 CLI work only (corpus migrations, pipelines seeds). Helpers reference it with `--config ../../wrangler.jsonc`; don't give them their own wrangler config. Deployed Workers (`apps/web`, `apps/api`) keep their own configs and must hold their own bindings — keep their `database_name`/`database_id` in sync with the root config.
- Current production behavior is still served by `apps/legacy-next` until the Astro migration is complete.
- Use the packages already declared in the relevant workspace package. Read latest package documentation before making framework or dependency changes.

## Guidelines

- All apps and packages must have `lint`, `lint:fix`, `format`, and `fix-all` scripts in their `package.json`. If they don't, add them.
- Always use `pnpm run fix-all` followed by `pnpm run build` after editing files.
- Always use `shadcn` and `tailwindcss` for UI components and styling. Don't use custom CSS or any other UI libraries.
- Always use documentation from latest package versions (use `context7` and `brave-search` tools).
- Use feature-based packaging.
- Do not ignore any kind of deprecation warnings. Always address them to solve them.
- Do not ignore any kind of linting/formatting warnings. Always address them to solve them.
- Always search internet for solutions for any issues encountered (like deprecation warnings, linting/formatting warnings, errors, etc.). Don't rely on your knowledge. If your knowledge was accurate, you wouldn't have encountered the issue in the first place.
- If new environment variables are introduced, add them to the `.env.example` file.
- Don't read/delete/write `.env` files. Those files are out of your scope. Read only example env files.
- Condense your (agent's) context (with `/compact`) when the token usage exceeds 128K tokens.
- Don't create files larger than 400 lines. Run `./file_length.sh` to check files with more than 400 lines. (Use `FileSplitPrompt.md` for guidance on how to split files.)

## Documentations Helpers

Hono: https://hono.dev/llms.txt
Cloudflare: https://developers.cloudflare.com/llms.txt
Shadcn: https://ui.shadcn.com/llms.txt
