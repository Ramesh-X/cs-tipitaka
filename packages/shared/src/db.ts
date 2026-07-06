/** Minimal D1-compatible database interface — satisfied by Cloudflare's D1Database. */
export interface CorpusDB {
  prepare(query: string): CorpusDBStatement;
}

export interface CorpusDBStatement {
  bind(...values: unknown[]): CorpusDBStatement;
  run(): Promise<{ success: boolean }>;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}
