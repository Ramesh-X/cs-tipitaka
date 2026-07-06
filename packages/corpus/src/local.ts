import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { CorpusDB } from '@cs-tipitaka/shared';
import { createSqliteDb } from './adapters/sqlite.ts';

function findRepoRoot(start = process.cwd()): string {
  for (let dir = start; ; ) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir)
      throw new Error('Repo root (pnpm-workspace.yaml) not found');
    dir = parent;
  }
}

function resolveSqlitePath(): string {
  const dir = join(
    findRepoRoot(),
    '.wrangler/state/v3/d1/miniflare-D1DatabaseObject',
  );
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite')
    .map((f) => ({ f, mtime: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length === 0) {
    throw new Error(
      `No D1 SQLite file found in ${dir} — run \`pnpm --filter @cs-tipitaka/pipelines run db:migrate:local\` then \`pnpm --filter @cs-tipitaka/pipelines run corpus:seed:local\` first`,
    );
  }
  return join(dir, files[0].f);
}

let db: CorpusDB | null = null;

export function getLocalDb(): CorpusDB {
  return (db ??= createSqliteDb(resolveSqlitePath()));
}
