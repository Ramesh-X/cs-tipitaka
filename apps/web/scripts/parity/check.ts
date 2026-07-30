/**
 * Route/content/SEO/a11y parity checks over the BUILT apps/web/dist output,
 * against a frozen pre-cutover baseline (scripts/parity/baseline/) captured
 * during the Next.js → Astro migration. Never reads the network. See
 * apps/web/README.md.
 *
 * Usage: pnpm --filter @cs-tipitaka/web run parity  (after `pnpm run build`)
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getLocalDb } from '@cs-tipitaka/corpus/local';
import { getNodes } from '@cs-tipitaka/corpus';
import { asHref, isDocument } from '@cs-tipitaka/shared';
import { Report } from './lib/report.ts';
import {
  WEB_ROOT,
  listDistPages,
  readDistFile,
  readHead,
  fileSizeBytes,
} from './lib/dist-walk.ts';
import { checkHead, checkJsonLd } from './checks/head.ts';
import { checkDecisionC } from './checks/decision-c.ts';
import { checkSize, newSizeStats, summarizeSize } from './checks/size.ts';
import { checkSitemap } from './checks/sitemap.ts';
import { checkAnchors, type BaselineDocEntry } from './checks/anchors.ts';
import { checkInternalLinks } from './checks/links.ts';
import { checkA11yStatic } from './checks/a11y-static.ts';
import type { ExpectedExceptions } from './lib/exceptions.ts';

// [...slug].astro titles collide when the same Pāli name appears in
// different collections (M6.4). The real fix needs Decision B's node_meta
// table, not a Phase 7 QA task — this only guards against the count growing.
// Measured precisely during the Phase 7 parity-harness build (M6.4's own
// write-up cites an earlier, less precise ad-hoc scan of ~957).
const KNOWN_DUPLICATE_TITLE_GROUPS = 305;

const BASELINE_DIR = join(WEB_ROOT, 'scripts', 'parity', 'baseline');

function loadBaseline() {
  const baselineDocs: Record<string, BaselineDocEntry> = JSON.parse(
    readFileSync(join(BASELINE_DIR, 'paragraph-counts.json'), 'utf8'),
  );
  const exceptions: ExpectedExceptions = JSON.parse(
    readFileSync(
      join(WEB_ROOT, 'scripts', 'parity', 'expected-exceptions.json'),
      'utf8',
    ),
  );
  return { baselineDocs, exceptions };
}

async function classifyCorpusPaths(): Promise<{
  documentPaths: Set<string>;
  collectionPaths: Set<string>;
  titleBySlug: Map<string, string>;
}> {
  const db = getLocalDb();
  const nodes = await getNodes(db);
  const documentPaths = new Set<string>();
  const collectionPaths = new Set<string>();
  const titleBySlug = new Map<string, string>();
  for (const node of nodes) {
    const href = asHref(node.slug);
    (isDocument(node) ? documentPaths : collectionPaths).add(href);
    titleBySlug.set(node.slug, node.pali);
  }
  return { documentPaths, collectionPaths, titleBySlug };
}

function checkDuplicateTitles(
  report: Report,
  titlesByPage: Map<string, string>,
): void {
  const pagesByTitle = new Map<string, string[]>();
  for (const [urlPath, title] of titlesByPage) {
    const bucket = pagesByTitle.get(title) ?? [];
    bucket.push(urlPath);
    pagesByTitle.set(title, bucket);
  }
  const duplicateGroups = [...pagesByTitle.values()].filter(
    (v) => v.length > 1,
  ).length;

  report.log(
    `[head] ${duplicateGroups} duplicate <title> groups (known baseline: ${KNOWN_DUPLICATE_TITLE_GROUPS})`,
  );
  if (duplicateGroups > KNOWN_DUPLICATE_TITLE_GROUPS) {
    report.fail(
      'head',
      `duplicate-title groups grew to ${duplicateGroups} (was ${KNOWN_DUPLICATE_TITLE_GROUPS}) — see M6.4`,
    );
  }
}

async function main(): Promise<void> {
  const report = new Report();
  const { baselineDocs, exceptions } = loadBaseline();
  const { documentPaths, collectionPaths, titleBySlug } =
    await classifyCorpusPaths();
  const nonLatinSourceData = new Set(exceptions.nonLatinSourceData);

  const pages = listDistPages();
  const distUrlPaths = new Set(pages.map((p) => p.urlPath));

  const titlesByPage = new Map<string, string>();
  const sizeStats = newSizeStats();
  for (const page of pages) {
    if (page.urlPath === '/404') continue; // not a real route; excluded from head/SEO/size expectations below

    const html = readDistFile(page.file);
    const title = checkHead(report, page.urlPath, readHead(html));
    if (title) titlesByPage.set(page.urlPath, title);

    checkJsonLd(report, page.urlPath, html, { documentPaths, collectionPaths });
    checkDecisionC(report, page.urlPath, html, nonLatinSourceData);
    checkSize(report, page.urlPath, fileSizeBytes(page.file), sizeStats);
    checkA11yStatic(report, page.urlPath, html);
  }
  summarizeSize(report, sizeStats);
  checkDuplicateTitles(report, titlesByPage);

  checkSitemap(report, distUrlPaths);
  await checkAnchors(
    report,
    getLocalDb(),
    baselineDocs,
    exceptions,
    titleBySlug,
  );
  checkInternalLinks(report, distUrlPaths);

  report.print();
  if (report.hasFailures) process.exit(1);
}

await main();
