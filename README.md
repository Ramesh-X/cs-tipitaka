# cs-tipitaka

Pāli Canon (Tipiṭaka) web application — a pnpm monorepo of Cloudflare apps and
shared packages backed by a Cloudflare D1 database (`corpus-db`).

> Production is currently served by `apps/legacy-next` until the Astro migration
> (`apps/web`) is complete.

## Prerequisites

```bash
pnpm install
```

Remote (`--remote`) commands require an authenticated Cloudflare account:

```bash
pnpm exec wrangler login
```

## Wrangler configs

There are three `wrangler.jsonc` files. Keep their `database_name` /
`database_id` in sync — a deployed Worker must carry its own bindings and cannot
reference the shared root config.

| File                              | Purpose                                                                                                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `wrangler.jsonc` (repo root)      | **Shared, non-deployed** config used only by supplementary D1 CLI work (migrations, seeds). Defines the `corpus-db` database and `migrations_dir`. Helpers reference it via `--config ../../wrangler.jsonc`. |
| `apps/api/wrangler.jsonc`         | The **API Worker**. Binds `corpus-db` as `CORPUS_DB`. Deployed.                                                                                                                                              |
| `apps/legacy-next/wrangler.jsonc` | The **current production Worker** (Next.js via OpenNext) serving `tipitakaonline.org` until the Astro migration completes.                                                                                   |

## Database migrations

Apply the schema in `packages/corpus/migrations` to the D1 database.

```bash
# Local D1 (state under .wrangler/state)
pnpm --filter @cs-tipitaka/corpus run db:migrate:local

# Remote D1
pnpm --filter @cs-tipitaka/corpus run db:migrate:remote
```

## Corpus syncing

Run migrations first, then seed. Seeding is handled by `apps/pipelines`.

### Seed the corpus

```bash
# Local
pnpm --filter @cs-tipitaka/pipelines run corpus:seed:local

# Remote
pnpm --filter @cs-tipitaka/pipelines run corpus:seed:remote
```

### Seed corpus translations

```bash
# Local
pnpm --filter @cs-tipitaka/pipelines run translations:seed:local

# Remote
pnpm --filter @cs-tipitaka/pipelines run translations:seed:remote
```

### Monitoring a local seed

A local seed loads the whole dataset in a single transaction, so committed rows
aren't visible until it finishes. Use this proxy (run from the repo root) to
confirm it's progressing — the `-wal` file grows and the process `TIME` advances
while it works:

```bash
watch -n 5 'ls -lh .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite-wal 2>/dev/null; ps -o etime,time,rss -p $(pgrep -f "d1 execute") 2>/dev/null'
```

After it completes, verify the committed row counts:

```bash
pnpm exec wrangler d1 execute corpus-db --local \
  --persist-to .wrangler/state --config wrangler.jsonc \
  --command "SELECT (SELECT count(*) FROM nodes) AS nodes, (SELECT count(*) FROM paragraphs) AS paragraphs"
```

> Don't run another `wrangler d1 execute --local` against `.wrangler/state` while
> a seed is running — it contends with the writer and can stall or error.

> More execution steps (dev servers, builds, deploys) will be added as
> development progresses.
