# AGENTS.MD

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Tech Stack

- Read the `package.json` file and understand which packages are being used. Use those packages for implementing features. Read the documentation of those packages for guidance on how to use them. Use latest versions.

## Guidelines

- Always use `npm run fix-all` followed by `npm run build` after editing files.
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
Next.js: https://nextjs.org/llms.txt
Shadcn: https://ui.shadcn.com/llms.txt
