import type { NodeType } from '@cs-tipitaka/corpus';
import { type CorpusDB, isDocument } from '@cs-tipitaka/shared';
import type { NodeWithMeta } from './constants.ts';
import { getChildren } from './nodes.ts';

export function nodeTypeLabel(type: NodeType): string {
  switch (type) {
    case 'pitaka':
      return 'Piṭaka';
    case 'nikaya':
      return 'Nikāya';
    case 'collection':
      return 'Collection';
    case 'document':
      return 'Text';
  }
}

async function countDocuments(
  db: CorpusDB,
  node: NodeWithMeta,
): Promise<number> {
  if (isDocument(node)) return 1;
  const children = await getChildren(db, node);
  if (children.length === 0) return 0;
  const counts = await Promise.all(
    children.map((child) => countDocuments(db, child)),
  );
  return counts.reduce((total, count) => total + count, 0);
}

/** e.g. "3 sections · 12 texts", or "Reading page" for a document. */
export async function childSummary(
  db: CorpusDB,
  node: NodeWithMeta,
): Promise<string> {
  if (isDocument(node)) return 'Reading page';
  const children = await getChildren(db, node);
  const directChildren = children.length;
  const documentCount = await countDocuments(db, node);
  const sectionLabel = directChildren === 1 ? 'section' : 'sections';
  const textLabel = documentCount === 1 ? 'text' : 'texts';
  return `${directChildren} ${sectionLabel} · ${documentCount} ${textLabel}`;
}
