import { readUtf16Json } from '../shared/utf16.ts';
import { slugify } from './slug.ts';
import { warn } from '../shared/logger.ts';
import {
  CATEGORY_PREFIX,
  CATEGORY_ROOT_IDS,
  CORPUS_TREE_JSON,
  NIKAYA_IDS,
  NIKAYA_SLUGS,
  PITAKA_SLUGS,
  SLUG_OVERRIDES,
} from './constants.ts';

type NodeType = 'pitaka' | 'nikaya' | 'collection' | 'document';

interface TreeNode {
  text: string;
  id?: number;
  type?: string;
  children?: TreeNode[];
  a_attr?: { href?: string };
}

export interface CorpusNode {
  slug: string;
  pali: string;
  type: NodeType;
  href?: string;
  children?: CorpusNode[];
}

export interface DocRef {
  slug: string;
  href: string | undefined;
}

export interface FlatNode {
  slug: string;
  parent_slug: string | null;
  position: number;
  type: NodeType;
  pali: string;
}

function resolveSlug(id: number | undefined, text: string): string {
  if (id !== undefined) {
    if (SLUG_OVERRIDES[id]) return SLUG_OVERRIDES[id];
    if (PITAKA_SLUGS[id]) return PITAKA_SLUGS[id];
    if (NIKAYA_SLUGS[id]) return NIKAYA_SLUGS[id];
  }
  const auto = slugify(text);
  if (auto) return auto;
  const fallback = id !== undefined ? `n${id}` : 'untitled';
  warn(`empty slug for "${text}" (id=${id}) → "${fallback}"`);
  return fallback;
}

function resolveNodeType(id: number | undefined, isLeaf: boolean): NodeType {
  if (isLeaf) return 'document';
  if (id !== undefined && NIKAYA_IDS.has(id)) return 'nikaya';
  const allPitakaIds = new Set([
    ...Object.keys(PITAKA_SLUGS).map(Number),
    CATEGORY_ROOT_IDS.mula,
    CATEGORY_ROOT_IDS.atthakatha,
    CATEGORY_ROOT_IDS.tika,
    CATEGORY_ROOT_IDS.anna,
  ]);
  if (id !== undefined && allPitakaIds.has(id)) return 'pitaka';
  return 'collection';
}

function leadingOrdinal(text: string): string | null {
  const m = /^(\d+)\.\s*/.exec(text);
  return m ? m[1] : null;
}

type NodePair = { src: TreeNode; out: CorpusNode };

function dedupeSiblings(pairs: NodePair[]): void {
  const counts: Record<string, number> = {};
  for (const p of pairs) counts[p.out.slug] = (counts[p.out.slug] ?? 0) + 1;

  const taken = new Set<string>();
  for (const p of pairs) {
    if (counts[p.out.slug] === 1) taken.add(p.out.slug);
  }

  const groups = new Map<string, NodePair[]>();
  for (const p of pairs) {
    if (counts[p.out.slug] > 1) {
      const group = groups.get(p.out.slug) ?? [];
      group.push(p);
      groups.set(p.out.slug, group);
    }
  }

  for (const [base, members] of groups) {
    const ordinals = members.map((m) => leadingOrdinal(m.src.text));
    const ordinalsUsable =
      ordinals.every((o) => o !== null) &&
      new Set(ordinals).size === ordinals.length;

    members.forEach((m, i) => {
      const suffix = ordinalsUsable
        ? (ordinals[i] as string)
        : m.src.id !== undefined
          ? String(m.src.id)
          : String(i + 1);
      let candidate = `${base}-${suffix}`;
      while (taken.has(candidate)) candidate = `${candidate}x`;
      taken.add(candidate);
      m.out.slug = candidate;
      warn(
        `slug collision: "${base}" → "${m.out.slug}" (id=${m.src.id}, "${m.src.text}")`,
      );
    });
  }
}

function convertNode(node: TreeNode): CorpusNode {
  const id = node.id;
  const isLeaf = node.type === 'leaf';
  const slug = resolveSlug(id, node.text);

  if (isLeaf) {
    return {
      slug,
      pali: node.text,
      type: 'document',
      href: node.a_attr?.href,
    };
  }

  const pairs: NodePair[] = (node.children ?? []).map((child) => ({
    src: child,
    out: convertNode(child),
  }));
  dedupeSiblings(pairs);
  const children = pairs.map((p) => p.out);

  return {
    slug,
    pali: node.text,
    type: resolveNodeType(id, isLeaf),
    children: children.length > 0 ? children : undefined,
  };
}

export function buildCorpusTree(): CorpusNode[] {
  const raw = readUtf16Json(CORPUS_TREE_JSON) as TreeNode[];
  const tipiRoot = raw[0];
  const categories = tipiRoot.children ?? [];

  const resultPairs: NodePair[] = [];

  for (const cat of categories) {
    const catId = cat.id;
    if (catId === undefined) continue;
    const prefix = CATEGORY_PREFIX[catId];
    if (prefix === undefined) continue;

    const pairs: NodePair[] = (cat.children ?? []).map((child) => ({
      src: child,
      out: convertNode(child),
    }));
    dedupeSiblings(pairs);

    if (prefix.length === 0) {
      for (const pair of pairs) resultPairs.push(pair);
    } else {
      const children = pairs.map((p) => p.out);
      resultPairs.push({
        src: cat,
        out: {
          slug: prefix[0],
          pali: cat.text,
          type: 'pitaka',
          children: children.length > 0 ? children : undefined,
        },
      });
    }
  }

  dedupeSiblings(resultPairs);
  return resultPairs.map((p) => p.out);
}

export function flattenForDb(
  nodes: CorpusNode[],
  parentSlug: string | null,
  parentPath: string[],
  outNodes: FlatNode[],
  outDocs: DocRef[],
): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const pathParts = [...parentPath, node.slug];
    const fullSlug = pathParts.join('/');

    outNodes.push({
      slug: fullSlug,
      parent_slug: parentSlug,
      position: i,
      type: node.type,
      pali: node.pali,
    });

    if (node.type === 'document') {
      outDocs.push({ slug: fullSlug, href: node.href });
    } else if (node.children?.length) {
      flattenForDb(node.children, fullSlug, pathParts, outNodes, outDocs);
    }
  }
}
