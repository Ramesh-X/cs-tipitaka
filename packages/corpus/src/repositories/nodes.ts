import type { CorpusDB } from '@cs-tipitaka/shared';
import type { Node } from '../schema.ts';

export async function getNodes(db: CorpusDB): Promise<Node[]> {
  const result = await db
    .prepare('SELECT * FROM nodes ORDER BY position ASC')
    .all<Node>();
  return result.results;
}

export async function getNodeBySlug(
  db: CorpusDB,
  slug: string,
): Promise<Node | null> {
  return db
    .prepare('SELECT * FROM nodes WHERE slug = ?')
    .bind(slug)
    .first<Node>();
}

export async function getChildNodes(
  db: CorpusDB,
  parentSlug: string,
): Promise<Node[]> {
  const result = await db
    .prepare('SELECT * FROM nodes WHERE parent_slug = ? ORDER BY position ASC')
    .bind(parentSlug)
    .all<Node>();
  return result.results;
}
