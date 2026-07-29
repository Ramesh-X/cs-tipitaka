# `@cs-tipitaka/web`

Astro 7 static site — the target of the Next.js → Astro migration
(`docs/nextjs-to-astro-migration.md`). Deploys as a Cloudflare Workers Static
Assets site (`wrangler.jsonc`, no `main` entry, no adapter).

## Prerequisites

Run these once, from the **repo root**, before `astro dev` or `astro build`
will produce a working corpus. `getStaticPaths()` and the reader pages read the
corpus through `@cs-tipitaka/corpus` at **build time**, via a local SQLite file
— the `CORPUS_DB` D1 binding is not available in that context.

1. **Checkout the corpus submodule** (if not already present):

   ```sh
   git submodule update --init --recursive
   ```

2. **Install dependencies** (from repo root):

   ```sh
   pnpm install
   ```

3. **Migrate the local D1 database** (creates the `nodes` / `paragraphs` /
   `translations` tables):

   ```sh
   pnpm --filter @cs-tipitaka/pipelines run db:migrate:local
   ```

4. **Seed it** (parses the corpus submodule's TEI XML into rows):

   ```sh
   pnpm --filter @cs-tipitaka/pipelines run corpus:seed:local
   ```

   Re-run steps 3–4 after pulling submodule updates or changing
   `apps/pipelines/migrations/`. This writes a SQLite file under
   `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`; `apps/web` finds it by
   walking up to the monorepo root and picking the newest `*.sqlite` file
   there (see `@cs-tipitaka/corpus/local`'s `getLocalDb()`). If no seeded file
   exists, the build fails with an explicit error naming these two commands.

5. **(Optional) Seed translations** — the `translations` table is empty by
   default; the reader degrades to "translation unavailable" until this is
   populated. See `apps/pipelines/src/translations/seed.ts` and
   `docs/nextjs-to-astro-migration.md` §6.

## Commands

All run from the repo root via the workspace filter, or from `apps/web/`
directly:

| Command                                                  | Action                                                    |
| -------------------------------------------------------- | --------------------------------------------------------- |
| `pnpm --filter @cs-tipitaka/web run dev`                 | Start the dev server at `localhost:4321`                  |
| `pnpm --filter @cs-tipitaka/web run build`               | Build the static site to `./dist/`                        |
| `pnpm --filter @cs-tipitaka/web run preview`             | Preview the build locally (`astro preview`)               |
| `pnpm --filter @cs-tipitaka/web run check` / `typecheck` | Type-check with `astro check`                             |
| `pnpm --filter @cs-tipitaka/web run lint` / `lint:fix`   | ESLint (incl. Astro + jsx-a11y rules)                     |
| `pnpm --filter @cs-tipitaka/web run format`              | Prettier (incl. `.astro` via `prettier-plugin-astro`)     |
| `pnpm --filter @cs-tipitaka/web run fix-all`             | `lint:fix` + `format`                                     |
| `pnpm --filter @cs-tipitaka/web run parity`              | Route/content/a11y parity checks over `dist/` — see below |
| `pnpm --filter @cs-tipitaka/web run deploy`              | `astro build && wrangler deploy`                          |

Or via the root aliases: `pnpm run dev:web`, `pnpm run build:web`.

## Parity & QA harness

`scripts/parity/` audits the **built** `dist/` output — route coverage against
a frozen legacy-site baseline, `<head>`/JSON-LD integrity, deep-link anchors,
the Decision-C "canonical HTML stays translation-free" guarantee, sitemap
correctness, and static accessibility structure. It never reads
`apps/legacy-next` or the network at check time (only `capture-baseline.ts`
does, and that has already been run — see `scripts/parity/baseline/`).

```sh
pnpm --filter @cs-tipitaka/web run build   # produces dist/
pnpm --filter @cs-tipitaka/web run parity  # checks dist/ against the baseline
```

Known, accepted divergences from the legacy site are recorded in
`scripts/parity/expected-exceptions.json` — see `docs/web/content-parity.md`
for the rationale. See `docs/nextjs-to-astro-migration.md` Phase 7 and
`docs/web/README.md` for the full QA picture, including the manual
Lighthouse/axe/keyboard passes that the harness doesn't automate.

## Environment variables

See `.env.example`. New variables must be added there when introduced
(per `AGENTS.md`) — this repo does not read or write `.env` files directly.

## Architecture notes

Non-obvious implementation decisions (hydration/FOUC, soft navigation, the
corpus tree, transliteration, the corpus data layer) live in `docs/web/`, not
in inline comments. Read it before changing related code.
