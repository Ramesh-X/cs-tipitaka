import type { CorpusDB } from '@cs-tipitaka/shared';
import type { Paragraph } from '../schema.ts';

export async function getParagraphs(
  db: CorpusDB,
  slug: string,
): Promise<Paragraph[]> {
  const result = await db
    .prepare(
      'SELECT * FROM paragraphs WHERE document_slug = ? ORDER BY position ASC',
    )
    .bind(slug)
    .all<Paragraph>();
  return result.results;
}
