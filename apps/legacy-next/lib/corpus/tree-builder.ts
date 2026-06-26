import * as path from 'path';
import type { CorpusNode, NodeType } from './constants.ts';
import {
  CATEGORY_PREFIX,
  CATEGORY_ROOT_IDS,
  NIKAYA_IDS,
  NIKAYA_SLUGS,
  PITAKA_SLUGS,
  SLUG_OVERRIDES,
} from './manifest.ts';
import { slugify } from './slug.ts';
import { readUtf16Json } from './utf16.ts';

export const TREE_JSON_PATH = path.join(
  process.cwd(),
  '../../data/corpus',
  'tipitaka.org',
  'romn',
  'tree.json',
);

interface TreeNode {
  text: string;
  id?: number;
  type?: string;
  children?: TreeNode[];
  a_attr?: { href?: string };
}

/** Resolves the URL slug for a tree node using manifest lookups then auto-slugify. */
function resolveSlug(id: number | undefined, text: string): string {
  if (id !== undefined) {
    if (SLUG_OVERRIDES[id]) return SLUG_OVERRIDES[id];
    if (PITAKA_SLUGS[id]) return PITAKA_SLUGS[id];
    if (NIKAYA_SLUGS[id]) return NIKAYA_SLUGS[id];
  }
  const auto = slugify(text);
  if (auto) return auto;
  // Fallback for a title that slugifies to empty (e.g. all-punctuation):
  // a stable, URL-safe token so the node still gets a usable, non-colliding path.
  const fallback = id !== undefined ? `n${id}` : 'untitled';
  console.warn(
    `[corpus-tree-builder] empty slug for "${text}" (id=${id}) -> "${fallback}"`,
  );
  return fallback;
}

/** Determines NodeType for a non-leaf node. */
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

/** Extracts the leading ordinal from a title (e.g. "4. Devatāvaggo" → "4"). */
function leadingOrdinal(text: string): string | null {
  const m = /^(\d+)\.\s*/.exec(text);
  return m ? m[1] : null;
}

type NodePair = { src: TreeNode; out: CorpusNode };

/**
 * Disambiguates sibling slug collisions in place.
 *
 * Unlike a position-based `-2/-3` scheme (which silently re-points URLs when an
 * earlier sibling is inserted/removed), the suffix is derived from STABLE source
 * data: the title's leading ordinal when every colliding sibling has a unique
 * one (pretty and stable across renumbering), otherwise the source node id
 * (always unique, stable across sibling reordering). Each collision is logged.
 */
function dedupeSiblings(pairs: NodePair[]): void {
  const counts: Record<string, number> = {};
  for (const p of pairs) counts[p.out.slug] = (counts[p.out.slug] ?? 0) + 1;

  // Reserve every already-unique sibling slug so a minted suffix can never
  // collide with a non-colliding sibling (or a previously minted suffix).
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
      console.warn(
        `[corpus-tree-builder] slug collision: "${base}" -> "${m.out.slug}" ` +
          `(id=${m.src.id}, "${m.src.text}")`,
      );
    });
  }
}

/** Recursively converts a tree.json node and its children into a CorpusNode. */
function convertNode(node: TreeNode): CorpusNode {
  const id = node.id;
  const isLeaf = node.type === 'leaf';
  const slug = resolveSlug(id, node.text);

  if (isLeaf) {
    return {
      slug,
      title: node.text,
      pali: node.text,
      type: 'document',
      // Source provenance — used by the prebuild to locate the XML; not shipped to clients.
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
    title: node.text,
    pali: node.text,
    type: resolveNodeType(id, isLeaf),
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * Reads tree.json and builds the full CorpusNode tree for all four categories.
 *
 * Structure produced:
 *   [vinaya, sutta, abhidhamma,   atthakatha, tika, anna]
 *
 * Mūla piṭakas are promoted to the top level (no /mula/ prefix).
 * Other categories are wrapped under their prefix node (atthakatha, tika, anna).
 */
export function buildCorpusTree(): CorpusNode[] {
  const raw = readUtf16Json(TREE_JSON_PATH) as TreeNode[];
  // Root is a single-element array: [{ text: "Tipiṭaka", children: [mula, att, tik, anna] }]
  const tipiRoot = raw[0];
  const categories = tipiRoot.children ?? [];

  const resultPairs: NodePair[] = [];

  for (const cat of categories) {
    const catId = cat.id;
    if (catId === undefined) continue;

    const prefix = CATEGORY_PREFIX[catId];
    if (prefix === undefined) continue; // unknown category — skip

    const pairs: NodePair[] = (cat.children ?? []).map((child) => ({
      src: child,
      out: convertNode(child),
    }));
    dedupeSiblings(pairs);

    if (prefix.length === 0) {
      // Mūla — promote children (pitakas) to top level
      for (const pair of pairs) resultPairs.push(pair);
    } else {
      // Aṭṭhakathā / Ṭīkā / Añña — build category node with children
      const children = pairs.map((p) => p.out);
      resultPairs.push({
        src: cat,
        out: {
          slug: prefix[0],
          title: cat.text,
          pali: cat.text,
          type: 'pitaka',
          children: children.length > 0 ? children : undefined,
        },
      });
    }
  }

  // Dedupe the top-level array too (mūla piṭakas + category nodes).
  dedupeSiblings(resultPairs);
  return resultPairs.map((p) => p.out);
}
