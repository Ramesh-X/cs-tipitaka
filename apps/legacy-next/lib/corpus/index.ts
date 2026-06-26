import 'server-only';

import corpusTreeJson from './generated/corpus-tree.json';
import type { CorpusNode, Crumb } from './constants';

/**
 * Server-only corpus access.
 *
 * Re-exports the client-safe surface (types, constants, pure helpers) from
 * `./constants` so existing server imports keep working, and adds the
 * data-backed APIs that need the generated tree. Importing this module from a
 * `'use client'` component is a build error (the `server-only` guard), which is
 * intentional: it keeps the full corpus tree out of client bundles.
 *
 * Document content is loaded separately by `loadDocument` in `./loader`.
 */

export * from './constants';

/* -------------------------------------------------------------------------- */
/*  Corpus hierarchy — loaded from prebuild-generated JSON                    */
/* -------------------------------------------------------------------------- */

export const CORPUS: CorpusNode[] = corpusTreeJson as CorpusNode[];

/* -------------------------------------------------------------------------- */
/*  Lookups & helpers                                                          */
/* -------------------------------------------------------------------------- */

/** Walk the tree following the slug path; returns the matched node or null. */
export function findNode(slug: string[]): CorpusNode | null {
  let level: CorpusNode[] | undefined = CORPUS;
  let node: CorpusNode | null = null;
  for (const segment of slug) {
    node = level?.find((n) => n.slug === segment) ?? null;
    if (!node) return null;
    level = node.children;
  }
  return node;
}

/** Breadcrumb trail for a slug path, root → current. */
export function getBreadcrumbs(slug: string[]): Crumb[] {
  const crumbs: Crumb[] = [];
  let level: CorpusNode[] | undefined = CORPUS;
  const acc: string[] = [];
  for (const segment of slug) {
    const node: CorpusNode | undefined = level?.find((n) => n.slug === segment);
    if (!node) break;
    acc.push(segment);
    crumbs.push({
      title: node.title,
      pali: node.pali,
      href: `/${acc.join('/')}`,
    });
    level = node.children;
  }
  return crumbs;
}

/** Every valid path through the tree, as slug arrays — for generateStaticParams. */
export function getAllPaths(): string[][] {
  const paths: string[][] = [];
  const walk = (nodes: CorpusNode[], prefix: string[]) => {
    for (const node of nodes) {
      const here = [...prefix, node.slug];
      paths.push(here);
      if (node.children) walk(node.children, here);
    }
  };
  walk(CORPUS, []);
  return paths;
}
