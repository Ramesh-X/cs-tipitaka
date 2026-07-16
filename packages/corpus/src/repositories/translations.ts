import type { CorpusDB } from '@cs-tipitaka/shared';
import type { Translation } from '../schema.ts';

export async function getTranslations(
  db: CorpusDB,
  slug: string,
  lang: string,
): Promise<Translation[]> {
  const result = await db
    .prepare(
      'SELECT * FROM translations WHERE document_slug = ? AND lang = ? ORDER BY para_position ASC',
    )
    .bind(slug, lang)
    .all<Translation>();
  return result.results;
}
