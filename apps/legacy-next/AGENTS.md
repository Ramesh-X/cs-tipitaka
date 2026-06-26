# Legacy Next App

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Guidelines

- This app is the temporary production app while the Astro migration is in progress.
- Run validation from the repository root with `pnpm run fix-all` followed by `pnpm run build` after editing files.
- Keep app-specific dependencies in `apps/legacy-next/package.json`.
- The local corpus submodule lives at `apps/legacy-next/corpus`, and generated corpus data lives at `apps/legacy-next/lib/corpus/generated`.

## Documentation Helpers

Next.js: https://nextjs.org/llms.txt
