import { join } from 'node:path';
import type { CorpusDB } from '@cs-tipitaka/shared';
import { getParagraphs } from '@cs-tipitaka/corpus';
import type { Report } from '../lib/report.ts';
import { DIST_DIR, readDistFile } from '../lib/dist-walk.ts';
import { deriveReaderSections } from '../../../src/lib/corpus/reader.ts';
import type { ExpectedExceptions } from '../lib/exceptions.ts';

export interface LegacyDocEntry {
  n: number;
  sha: string;
}

const SAMPLE_EXTREMES = 10;
const SAMPLE_SPREAD = 30;

/**
 * Deep-link (#para-N) parity: queries D1 once for paragraph counts per
 * document (cheaper than scanning the whole dist tree) — the RAW row count,
 * for data parity against legacy — then confirms actual id="para-N"
 * presence on a stratified sample of built pages, run through the same
 * deriveReaderSections() the reader itself uses: it can drop the one
 * paragraph that just repeats the document's own title, so the rendered id
 * set isn't always a naive 1..N (docs/web/content-parity.md).
 */
export async function checkAnchors(
  report: Report,
  db: CorpusDB,
  legacyDocs: Record<string, LegacyDocEntry>,
  exceptions: ExpectedExceptions,
  titleBySlug: Map<string, string>,
): Promise<void> {
  const slugs = Object.keys(legacyDocs).filter(
    (s) => !(s in exceptions.collectionized),
  );
  const results: { slug: string; legacyN: number; webN: number }[] = [];

  for (const slug of slugs) {
    const webN = (await getParagraphs(db, slug)).length;
    const legacyN = legacyDocs[slug].n;
    results.push({ slug, legacyN, webN });

    if (slug in exceptions.countDelta) continue; // already recorded, with its reason
    if (webN !== legacyN) {
      report.fail(
        'anchors',
        `paragraph count mismatch: legacy=${legacyN} web=${webN}`,
        '/' + slug,
      );
    }
  }
  report.log(
    `[anchors] ${results.length} documents checked against D1 paragraph counts`,
  );

  await checkSampleIds(report, db, results, exceptions, titleBySlug);
}

async function checkSampleIds(
  report: Report,
  db: CorpusDB,
  results: { slug: string; legacyN: number; webN: number }[],
  exceptions: ExpectedExceptions,
  titleBySlug: Map<string, string>,
): Promise<void> {
  const bySlug = new Map(results.map((r) => [r.slug, r]));
  const sorted = [...results].sort((a, b) => b.webN - a.webN);

  const sampleSlugs = new Set<string>();
  sorted.slice(0, SAMPLE_EXTREMES).forEach((r) => sampleSlugs.add(r.slug));
  sorted.slice(-SAMPLE_EXTREMES).forEach((r) => sampleSlugs.add(r.slug));
  const step = Math.max(1, Math.floor(sorted.length / SAMPLE_SPREAD));
  for (let i = 0; i < sorted.length; i += step) sampleSlugs.add(sorted[i].slug);
  Object.keys(exceptions.countDelta).forEach((s) => sampleSlugs.add(s));

  let sampleChecked = 0;
  for (const slug of sampleSlugs) {
    const entry = bySlug.get(slug);
    if (!entry) continue;

    let html: string;
    try {
      html = readDistFile(join(DIST_DIR, slug, 'index.html'));
    } catch {
      report.fail('anchors', 'sample file missing from dist', '/' + slug);
      continue;
    }
    sampleChecked += 1;

    const paragraphs = await getParagraphs(db, slug);
    const title = titleBySlug.get(slug) ?? '';
    const { paragraphs: kept } = deriveReaderSections(paragraphs, title);
    const expectedIds = kept.map((p) => p.position);

    const ids = new Set(
      [...html.matchAll(/id="para-(\d+)"/g)].map((m) => Number(m[1])),
    );
    for (const pos of expectedIds) {
      if (!ids.has(pos)) {
        report.fail(
          'anchors',
          `missing id="para-${pos}" (${expectedIds.length} expected, deriveReaderSections-adjusted)`,
          '/' + slug,
        );
        break;
      }
    }
  }
  report.log(
    `[anchors] ${sampleChecked} sample pages scanned for #para-N id coverage`,
  );
}
