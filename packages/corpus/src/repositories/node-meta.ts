import type { CorpusDB } from '@cs-tipitaka/shared';

export type NodeMeta = {
  slug: string;
  blurb: string | null;
  wikidata: string | null;
};

/**
 * Returns SEO metadata for all corpus nodes.
 * Stubbed to return an empty array — the node_meta table doesn't exist yet.
 * Real implementation, once the table is added:
 *
 * export async function getNodeMetas(db: CorpusDB): Promise<NodeMeta[]> {
 *   const result = await db
 *     .prepare('SELECT * FROM node_meta ORDER BY slug ASC')
 *     .all<NodeMeta>();
 *   return result.results;
 * }
 */
export async function getNodeMetas(db: CorpusDB): Promise<NodeMeta[]> {
  void db;
  return [];
}
