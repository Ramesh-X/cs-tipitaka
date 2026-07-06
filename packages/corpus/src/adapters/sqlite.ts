// Load better-sqlite3 via createRequire so the CJS module's `bindings`
// helper has access to __filename/__dirname when resolving the native .node binary.
import { createRequire } from 'node:module';
import type BetterSqlite3Type from 'better-sqlite3';
import type { Statement } from 'better-sqlite3';

const _require = createRequire(import.meta.url);
const Database = _require('better-sqlite3') as typeof BetterSqlite3Type;

import type { CorpusDB, CorpusDBStatement } from '@cs-tipitaka/shared';

function wrapStmt(stmt: Statement, params: unknown[] = []): CorpusDBStatement {
  return {
    bind(...values: unknown[]) {
      return wrapStmt(stmt, values);
    },
    async run() {
      stmt.run(...params);
      return { success: true };
    },
    async first<T = unknown>() {
      return (stmt.get(...params) as T | undefined) ?? null;
    },
    async all<T = unknown>() {
      return { results: stmt.all(...params) as T[] };
    },
  };
}

/**
 * Creates a CorpusDB backed by a local SQLite file.
 * Used at build time (astro build) where the Cloudflare D1 binding is unavailable.
 */
export function createSqliteDb(path: string): CorpusDB {
  const db = new Database(path, { readonly: true });
  return {
    prepare(query: string) {
      return wrapStmt(db.prepare(query));
    },
  };
}
