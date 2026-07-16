import type { CorpusDB } from '@cs-tipitaka/shared';
import type { NodeWithMeta } from './constants.ts';
import { groupAllNodesByParent, loadNodes } from './data.ts';

export async function findNode(
  db: CorpusDB,
  slug: string,
): Promise<NodeWithMeta | null> {
  const nodes = await loadNodes(db);
  const match = nodes.filter((node) => node.slug === slug)[0];
  return match ?? null;
}

export async function getAllPaths(db: CorpusDB): Promise<string[]> {
  const nodes = await loadNodes(db);
  return nodes.map((node) => node.slug);
}

export async function getChildren(
  db: CorpusDB,
  node: NodeWithMeta,
): Promise<NodeWithMeta[]> {
  const nodes = await loadNodes(db);
  return nodes
    .filter((candidate) => candidate.parent_slug === node.slug)
    .sort((a, b) => a.position - b.position);
}

export async function getSiblingsAndSelf(
  db: CorpusDB,
  node: NodeWithMeta,
): Promise<NodeWithMeta[]> {
  const nodes = await loadNodes(db);
  return nodes
    .filter((candidate) => candidate.parent_slug === node.parent_slug)
    .sort((a, b) => a.position - b.position);
}

export async function getRootNodes(db: CorpusDB): Promise<NodeWithMeta[]> {
  const nodes = await loadNodes(db);
  return nodes
    .filter((candidate) => candidate.parent_slug === null)
    .sort((a, b) => a.position - b.position);
}

export async function getDescendants(
  db: CorpusDB,
  node: NodeWithMeta,
): Promise<NodeWithMeta[]> {
  const childrenByParent = await groupAllNodesByParent(db);
  const descendants: NodeWithMeta[] = [];

  function walk(parentSlug: string) {
    const children = childrenByParent.get(parentSlug) ?? [];
    for (const child of children) {
      descendants.push(child);
      walk(child.slug);
    }
  }

  walk(node.slug);
  return descendants;
}
