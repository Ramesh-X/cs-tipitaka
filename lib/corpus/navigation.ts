import 'server-only';

import {
  CORPUS,
  isDocument,
  type CorpusNode,
  type NodeType,
} from '@/lib/corpus';

export interface CorpusEntry {
  node: CorpusNode;
  slug: string[];
  href: string;
}

export function nodeHref(slug: string[]): string {
  return `/${slug.join('/')}`;
}

export function isSamePath(a: string[], b: string[]): boolean {
  return (
    a.length === b.length && a.every((segment, index) => segment === b[index])
  );
}

export function isAncestorPath(ancestor: string[], current: string[]): boolean {
  return (
    ancestor.length < current.length &&
    ancestor.every((segment, index) => segment === current[index])
  );
}

export function isActiveBranch(path: string[], current: string[]): boolean {
  return isSamePath(path, current) || isAncestorPath(path, current);
}

/** Slim sidebar node — only what the tree renders, never the full CorpusNode. */
export interface NavNode {
  slug: string;
  title: string;
  pali: string;
  type: NodeType;
  /** Whether this node has children in CORPUS — drives the disclosure chevron. */
  hasChildren: boolean;
  /** Populated only for nodes on the active path (i.e. rendered expanded). */
  children?: NavNode[];
}

/**
 * Pruned navigation tree for the sidebar. Includes every top-level basket and,
 * along the active path, each level's full sibling set plus the current node's
 * direct children. Off-path branches come back collapsed (no `children`), so the
 * rendered markup is ~100–300 nodes instead of the full ~2,870 — which is what
 * keeps every prerendered page small (and crawlable) rather than ~30 MB.
 */
export function getNavTree(currentSlug: string[]): NavNode[] {
  const prune = (nodes: CorpusNode[], prefix: string[]): NavNode[] =>
    nodes.map((node) => {
      const path = [...prefix, node.slug];
      const onPath = isActiveBranch(path, currentSlug);
      const hasChildren = Boolean(node.children?.length);
      return {
        slug: node.slug,
        title: node.title,
        pali: node.pali,
        type: node.type,
        hasChildren,
        ...(onPath && hasChildren
          ? { children: prune(node.children!, path) }
          : {}),
      };
    });
  return prune(CORPUS, []);
}

export function countDocuments(node: CorpusNode): number {
  if (isDocument(node)) return 1;
  return (
    node.children?.reduce((total, child) => total + countDocuments(child), 0) ??
    0
  );
}

export function childSummary(node: CorpusNode): string {
  if (isDocument(node)) return 'Reading page';

  const directChildren = node.children?.length ?? 0;
  const documentCount = countDocuments(node);
  const sectionLabel = directChildren === 1 ? 'section' : 'sections';
  const textLabel = documentCount === 1 ? 'text' : 'texts';

  return `${directChildren} ${sectionLabel} · ${documentCount} ${textLabel}`;
}

// CORPUS is immutable at build time, so the ordered document list and its
// slug→index map are computed once and reused across all ~2 600 page renders
// (was an O(n) tree walk + linear scan per page → O(n²) overall).
let documentEntries: CorpusEntry[] | null = null;
let documentIndexByPath: Map<string, number> | null = null;

export function getDocumentEntries(): CorpusEntry[] {
  if (documentEntries) return documentEntries;

  const entries: CorpusEntry[] = [];
  function walk(nodes: CorpusNode[], prefix: string[]) {
    for (const node of nodes) {
      const slug = [...prefix, node.slug];
      if (isDocument(node)) {
        entries.push({ node, slug, href: nodeHref(slug) });
      }
      if (node.children) walk(node.children, slug);
    }
  }
  walk(CORPUS, []);

  documentEntries = entries;
  documentIndexByPath = new Map(entries.map((e, i) => [e.slug.join('/'), i]));
  return entries;
}

export function getAdjacentDocuments(slug: string[]): {
  previous?: CorpusEntry;
  next?: CorpusEntry;
} {
  const documents = getDocumentEntries();
  const index = documentIndexByPath!.get(slug.join('/')) ?? -1;

  if (index === -1) return {};

  return {
    previous: documents[index - 1],
    next: documents[index + 1],
  };
}
