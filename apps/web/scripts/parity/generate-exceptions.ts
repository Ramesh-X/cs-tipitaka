/**
 * Run ONCE (or again if the corpus is reseeded) to regenerate
 * expected-exceptions.json from the frozen baseline + current D1 state. Not
 * part of the ongoing `pnpm run parity` check — the output is curated data,
 * reviewed by a human (see docs/web/content-parity.md) before being trusted.
 *
 * Usage: node --experimental-strip-types scripts/parity/generate-exceptions.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getLocalDb } from '@cs-tipitaka/corpus/local';
import { getNodes, getParagraphs, type Node } from '@cs-tipitaka/corpus';
import { WEB_ROOT, listDistPages, readDistFile } from './lib/dist-walk.ts';
import type { LegacyDocEntry } from './checks/anchors.ts';
import { NON_LATIN_RE } from './checks/decision-c.ts';

const BASELINE_DIR = join(WEB_ROOT, 'scripts', 'parity', 'baseline');
const OUT_PATH = join(
  WEB_ROOT,
  'scripts',
  'parity',
  'expected-exceptions.json',
);

// Confirmed during the Phase 7 investigation (docs/web/content-parity.md):
// legacy's slug↔content assignment for this pair is shifted by one document
// (culaniddesapali/parayanavaggo holds the niddesa's content and vice versa).
// D1's assignment matches the source XML — web is correct, legacy is not.
const LEGACY_DEFECT_SLUGS = new Set([
  'sutta/kn/culaniddesapali/parayanavaggo',
  'sutta/kn/culaniddesapali/parayanavagganiddeso',
]);

// Confirmed during the Phase 7 investigation: both are the first document of
// a multi-part volume, and D1 attaches 2 leading paragraphs (rend="book" the
// volume title, rend="subhead" the "(Paṭhamo bhāgo)" part label) that
// legacy's generator did not surface on this document. Content from there on
// is byte-identical, shifted by exactly 2 positions.
const BOOK_PART_HEADING_SLUGS = new Set([
  'atthakatha/sutta/mn/mulapannasa-atthakatha/gantharambhakatha',
  'tika/sutta/mn/mulapannasa-tika/gantharambhakathavannana',
]);

/**
 * Requires `pnpm run build` to have already produced dist/ — scans it for
 * the same stray non-Latin codepoints checkDecisionC guards against, so the
 * exception list reflects reality rather than being hand-maintained.
 */
function findNonLatinSourceData(): string[] {
  const hits: string[] = [];
  for (const page of listDistPages()) {
    if (NON_LATIN_RE.test(readDistFile(page.file))) hits.push(page.urlPath);
  }
  return hits.sort();
}

async function main(): Promise<void> {
  const legacyDocs: Record<string, LegacyDocEntry> = JSON.parse(
    readFileSync(join(BASELINE_DIR, 'legacy-docs.json'), 'utf8'),
  );
  const db = getLocalDb();
  const nodes = await getNodes(db);
  const bySlug = new Map(nodes.map((n) => [n.slug, n]));
  const childrenByParent = new Map<string, Node[]>();
  for (const n of nodes) {
    if (!n.parent_slug) continue;
    const list = childrenByParent.get(n.parent_slug) ?? [];
    list.push(n);
    childrenByParent.set(n.parent_slug, list);
  }

  const collectionized: Record<
    string,
    { children: string[]; legacyParas: number; reason: string }
  > = {};
  const countDelta: Record<
    string,
    { legacy: number; web: number; reason: string }
  > = {};

  for (const [slug, entry] of Object.entries(legacyDocs)) {
    const node = bySlug.get(slug);
    if (!node) {
      console.warn(`WARNING: legacy slug "${slug}" has no D1 node at all`);
      continue;
    }

    if (node.type !== 'document') {
      const children = (childrenByParent.get(slug) ?? [])
        .map((c) => c.slug)
        .sort();
      collectionized[slug] = {
        children,
        legacyParas: entry.n,
        reason: 'split',
      };
      continue;
    }

    const webN = (await getParagraphs(db, slug)).length;
    if (webN !== entry.n) {
      const reason = LEGACY_DEFECT_SLUGS.has(slug)
        ? 'legacy-defect'
        : BOOK_PART_HEADING_SLUGS.has(slug)
          ? 'book-part-heading'
          : 'unexplained';
      countDelta[slug] = { legacy: entry.n, web: webN, reason };
    }
  }

  const sortedCollectionized: typeof collectionized = {};
  for (const slug of Object.keys(collectionized).sort()) {
    sortedCollectionized[slug] = collectionized[slug];
  }
  const sortedCountDelta: typeof countDelta = {};
  for (const slug of Object.keys(countDelta).sort()) {
    sortedCountDelta[slug] = countDelta[slug];
  }

  const nonLatinSourceData = findNonLatinSourceData();

  writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        collectionized: sortedCollectionized,
        countDelta: sortedCountDelta,
        nonLatinSourceData,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `collectionized: ${Object.keys(sortedCollectionized).length}, ` +
      `countDelta: ${Object.keys(sortedCountDelta).length}, ` +
      `nonLatinSourceData: ${nonLatinSourceData.length}`,
  );
}

await main();
