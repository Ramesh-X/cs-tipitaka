/**
 * Run ONCE, before apps/legacy-next is retired (M8.7) — captures the frozen
 * parity baseline that check.ts compares against forever after. Re-running
 * this is only meaningful while both the production legacy site and
 * apps/legacy-next's generated corpus JSON still exist.
 *
 * Usage: node --experimental-strip-types scripts/parity/capture-baseline.ts
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { WEB_ROOT } from './lib/dist-walk.ts';

const PROD_SITEMAP_URL = 'https://tipitakaonline.org/sitemap.xml';
const LEGACY_DOCS_DIR = join(
  WEB_ROOT,
  '..',
  'legacy-next',
  'lib',
  'corpus',
  'generated',
  'docs',
);
const BASELINE_DIR = join(WEB_ROOT, 'scripts', 'parity', 'baseline');

interface LegacyParagraph {
  pali: string;
}

async function captureLegacyUrls(): Promise<void> {
  const res = await fetch(PROD_SITEMAP_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${PROD_SITEMAP_URL}: ${res.status} ${res.statusText}`,
    );
  }
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, '') || '/')
    .sort((a, b) => a.localeCompare(b));

  if (urls.length === 0) {
    throw new Error('Parsed zero URLs from the production sitemap — aborting');
  }

  writeFileSync(join(BASELINE_DIR, 'legacy-urls.txt'), urls.join('\n') + '\n');
  console.log(`Wrote ${urls.length} URLs to baseline/legacy-urls.txt`);
}

function captureLegacyDocs(): void {
  const files = readdirSync(LEGACY_DOCS_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    throw new Error(
      `No generated docs found in ${LEGACY_DOCS_DIR} — run the legacy-next prebuild first (pnpm --filter @cs-tipitaka/legacy-next run prebuild)`,
    );
  }

  const docs: Record<string, { n: number; sha: string }> = {};
  for (const file of files) {
    const slug = file
      .replace(/\.json$/, '')
      .split('--')
      .join('/');
    const parsed: { paragraphs: LegacyParagraph[] } = JSON.parse(
      readFileSync(join(LEGACY_DOCS_DIR, file), 'utf8'),
    );
    const text = parsed.paragraphs.map((p) => p.pali).join('\n');
    const sha = createHash('sha256').update(text).digest('hex').slice(0, 16);
    docs[slug] = { n: parsed.paragraphs.length, sha };
  }

  const sorted: Record<string, { n: number; sha: string }> = {};
  for (const slug of Object.keys(docs).sort()) sorted[slug] = docs[slug];

  writeFileSync(
    join(BASELINE_DIR, 'legacy-docs.json'),
    JSON.stringify(sorted, null, 2) + '\n',
  );
  console.log(
    `Wrote ${Object.keys(sorted).length} documents to baseline/legacy-docs.json`,
  );
}

mkdirSync(BASELINE_DIR, { recursive: true });
await captureLegacyUrls();
captureLegacyDocs();
