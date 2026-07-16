import type { CorpusDB } from '@cs-tipitaka/shared';
import type { Node } from '../schema.ts';

export async function getNodes(db: CorpusDB): Promise<Node[]> {
  const result = await db
    .prepare('SELECT * FROM nodes ORDER BY position ASC')
    .all<Node>();
  return result.results;
}
