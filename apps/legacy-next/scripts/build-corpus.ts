/**
 * Prebuild script — generates the static corpus data consumed by Next.js at build time.
 *
 * Run via:  node --experimental-strip-types scripts/build-corpus.ts
 * Or:       pnpm run prebuild  (runs automatically before `pnpm run build`)
 *
 * Outputs:
 *   lib/corpus/generated/corpus-tree.json  — full CorpusNode hierarchy (no document content)
 *   lib/corpus/generated/docs/<slug>.json  — DocumentContent for each leaf node
 *
 * Each document node carries its source `href` from the tree, so the slug→source
 * mapping is taken straight from the built tree — no positional index matching.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CorpusNode } from '../lib/corpus/constants.ts';
import { buildCorpusTree } from '../lib/corpus/tree-builder.ts';
import {
  parseSection,
  sectionCount,
  type ParsedParagraph,
} from '../lib/corpus/xml-parser.ts';

const GENERATED_DIR = path.join(process.cwd(), 'lib', 'corpus', 'generated');
const DOCS_DIR = path.join(GENERATED_DIR, 'docs');

/** Any empty-document count above this fails the build (catches mass parse regressions). */
const EMPTY_TOLERANCE = 5;

/** Parses "cscd/s0101m.mul0.xml" → { filename: "s0101m.mul.xml", sectionIdx: 0 } */
function parseHref(
  href: string,
): { filename: string; sectionIdx: number } | null {
  const base = href.replace(/^cscd\//, '');
  // Sectioned reference: e.g. s0101m.mul0.xml or vin02m1.tik3.xml
  const match = base.match(/^(.+?\.(mul|att|tik|nrf))(\d+)\.xml$/);
  if (match) {
    return { filename: `${match[1]}.xml`, sectionIdx: parseInt(match[3], 10) };
  }
  // Whole-file reference (no digit suffix): e.g. e0904n.nrf.xml
  if (/\.(mul|att|tik|nrf)\.xml$/.test(base)) {
    return { filename: base, sectionIdx: 0 };
  }
  return null;
}

/** Walks the corpus tree and calls `cb` for every leaf node with its full slug path. */
function walkLeaves(
  nodes: CorpusNode[],
  prefix: string[],
  cb: (node: CorpusNode, slugPath: string[]) => void,
) {
  for (const node of nodes) {
    const here = [...prefix, node.slug];
    if (node.type === 'document') {
      cb(node, here);
    } else if (node.children) {
      walkLeaves(node.children, here, cb);
    }
  }
}

/** Renumbers paragraph ids sequentially (used when folding two sections into one). */
function renumber(paragraphs: ParsedParagraph[]): ParsedParagraph[] {
  return paragraphs.map((p, i) => ({ ...p, id: `para-${i + 1}` }));
}

async function main() {
  const startMs = Date.now();
  console.log('▶ Building corpus data…');

  // 1. Build CorpusNode hierarchy (slugs deduped, source href carried on leaves).
  const tree = buildCorpusTree();

  // 2. Reset the docs dir so stale orphans from previous runs never accumulate.
  fs.rmSync(DOCS_DIR, { recursive: true, force: true });
  fs.mkdirSync(DOCS_DIR, { recursive: true });

  // `href` is build-only provenance (used below to locate source XML); strip it
  // from the committed tree so it is not shipped in the server bundle.
  fs.writeFileSync(
    path.join(GENERATED_DIR, 'corpus-tree.json'),
    JSON.stringify(tree, (key, value) => (key === 'href' ? undefined : value)),
  );
  console.log('  ✓ corpus-tree.json written');

  // 3. Collect every document leaf and group by source file.
  const leaves: { key: string; href?: string }[] = [];
  walkLeaves(tree, [], (node, slugPath) =>
    leaves.push({ key: slugPath.join('--'), href: node.href }),
  );

  type Ref = { key: string; idx: number };
  const byFile = new Map<string, Ref[]>();
  let missingHref = 0;
  for (const { key, href } of leaves) {
    const parsed = href ? parseHref(href) : null;
    if (!parsed) {
      missingHref++;
      continue;
    }
    const refs = byFile.get(parsed.filename) ?? [];
    refs.push({ key, idx: parsed.sectionIdx });
    byFile.set(parsed.filename, refs);
  }

  // 4. Resolve paragraphs per leaf, reconciling the intro against CSCD numbering.
  //
  // CSCD sometimes numbers a flat file's intro as its own virtual file and
  // sometimes folds it into the first chapter. We detect which by comparing the
  // parser's natural section count to CSCD's reference count: exactly one extra
  // leading section means CSCD folded the intro, so we merge sections 0+1 into
  // reference 0 and shift the rest down by one. Without this, every chapter in
  // those files shifts back by one and the last chapter is silently orphaned.
  const content = new Map<string, ParsedParagraph[]>();
  for (const [filename, refs] of byFile) {
    const refCount = Math.max(...refs.map((r) => r.idx)) + 1;
    const natural = sectionCount(filename);
    const delta = natural - refCount;
    const fold = delta === 1;

    if (delta < 0 || delta > 1) {
      console.warn(
        `[build-corpus] ${filename}: ${natural} parsed sections vs ` +
          `${refCount} referenced (Δ${delta}) — possible CSCD numbering mismatch`,
      );
    }
    if (new Set(refs.map((r) => r.idx)).size !== refs.length) {
      console.warn(
        `[build-corpus] ${filename}: duplicate section index in tree.json`,
      );
    }

    for (const { key, idx } of refs) {
      let paragraphs: ParsedParagraph[];
      if (fold && idx === 0) {
        paragraphs = renumber([
          ...parseSection(filename, 0),
          ...parseSection(filename, 1),
        ]);
      } else {
        paragraphs = parseSection(filename, fold ? idx + 1 : idx);
      }
      content.set(key, paragraphs);
    }
  }

  // 5. Write a file for EVERY document leaf (empty → explicit notice on the page).
  let written = 0;
  const emptyDocs: string[] = [];
  for (const { key, href } of leaves) {
    const paragraphs = content.get(key) ?? [];
    if (paragraphs.length === 0) {
      emptyDocs.push(`${key} (${href ?? 'no href'})`);
    } else {
      written++;
    }
    fs.writeFileSync(
      path.join(DOCS_DIR, `${key}.json`),
      JSON.stringify({ paragraphs }),
    );
  }

  console.log(
    `  ✓ ${written} documents written, ${emptyDocs.length} empty ` +
      `(${missingHref} missing/unparseable href) of ${leaves.length} leaves`,
  );
  if (emptyDocs.length > 0) {
    console.warn(`  ⚠ empty documents:\n    ${emptyDocs.join('\n    ')}`);
  }

  // 6. Guard: a parser/layout regression that empties many sections must fail
  //    the build rather than pass as a benign "skipped" count.
  if (emptyDocs.length > EMPTY_TOLERANCE) {
    throw new Error(
      `Too many empty documents (${emptyDocs.length} > ${EMPTY_TOLERANCE}) — ` +
        `aborting: the corpus parse likely regressed.`,
    );
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log(`✅ Corpus build complete in ${elapsed}s`);
}

main().catch((err) => {
  console.error('✗ Corpus build failed:', err);
  process.exit(1);
});
