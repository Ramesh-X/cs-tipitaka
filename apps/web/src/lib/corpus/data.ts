import { getNodes, getNodeMetas, getParagraphs } from '@cs-tipitaka/corpus';
import type { CorpusDB } from '@cs-tipitaka/shared';
import type { Paragraph } from '@cs-tipitaka/corpus';
import type { NodeWithMeta } from './constants.ts';

let nodesCache: NodeWithMeta[] | null = null;
export async function loadNodes(db: CorpusDB): Promise<NodeWithMeta[]> {
  if (nodesCache) return nodesCache;

  const [nodes, metas] = await Promise.all([getNodes(db), getNodeMetas(db)]);
  const metaBySlug = new Map(metas.map((meta) => [meta.slug, meta]));

  nodesCache = nodes.map((node): NodeWithMeta => {
    const meta = metaBySlug.get(node.slug);
    return {
      ...node,
      ...(meta ?? {}),
    };
  });
  return nodesCache;
}

let allNodesByParent: Map<string | null, NodeWithMeta[]> | null = null;
export async function groupAllNodesByParent(
  db: CorpusDB,
): Promise<Map<string | null, NodeWithMeta[]>> {
  if (allNodesByParent) return allNodesByParent;

  const nodes = await loadNodes(db);
  const childrenByParent = new Map<string | null, NodeWithMeta[]>();
  for (const node of nodes) {
    const siblings = childrenByParent.get(node.parent_slug);
    if (siblings) siblings.push(node);
    else childrenByParent.set(node.parent_slug, [node]);
  }
  for (const siblings of childrenByParent.values()) {
    siblings.sort((a, b) => a.position - b.position);
  }

  allNodesByParent = childrenByParent;
  return allNodesByParent;
}

const documentCache = new Map<string, Paragraph[]>();
export async function loadDocument(
  db: CorpusDB,
  slug: string,
): Promise<Paragraph[]> {
  const hit = documentCache.get(slug);
  if (hit) return hit;
  const rows = await getParagraphs(db, slug);
  documentCache.set(slug, rows);
  return rows;
}
