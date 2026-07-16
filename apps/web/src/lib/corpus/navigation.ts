import { asHref, type CorpusDB } from '@cs-tipitaka/shared';
import { type NodeWithMeta, type Crumb } from './constants.ts';
import { findNode, getDescendants, getRootNodes } from './nodes.ts';
import { isDocument } from './presentation.ts';

export async function getBreadcrumbs(
  db: CorpusDB,
  slug: string,
): Promise<Crumb[]> {
  const crumbs: Crumb[] = [];
  let current = await findNode(db, slug);
  while (current) {
    crumbs.push({
      pali: current.pali,
      href: asHref(current.slug),
    });
    current = current.parent_slug
      ? await findNode(db, current.parent_slug)
      : null;
  }

  return crumbs.reverse();
}

// Memoized once per build: the ordered document list and its slug→index map
let documentEntries: NodeWithMeta[] | null = null;
let documentIndexByPath: Map<string, number> | null = null;

async function getDocumentEntries(db: CorpusDB): Promise<NodeWithMeta[]> {
  if (documentEntries) return documentEntries;

  const roots = await getRootNodes(db);
  const entries: NodeWithMeta[] = [];
  for (const root of roots) {
    if (isDocument(root)) entries.push(root);
    entries.push(...(await getDescendants(db, root)).filter(isDocument));
  }

  documentEntries = entries;
  documentIndexByPath = new Map(entries.map((e, i) => [e.slug, i]));
  return entries;
}

export async function getAdjacentDocuments(
  db: CorpusDB,
  slug: string,
): Promise<{
  previous?: NodeWithMeta;
  next?: NodeWithMeta;
}> {
  const documents = await getDocumentEntries(db);
  const index = documentIndexByPath!.get(slug) ?? -1;
  if (index === -1) return {};
  return {
    previous: documents[index - 1],
    next: documents[index + 1],
  };
}
