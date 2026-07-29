import type { Report } from '../lib/report.ts';
import {
  type DistPage,
  listAllDistUrlPaths,
  listDistPages,
  readDistFile,
} from '../lib/dist-walk.ts';
import { site } from '../../../src/lib/site.ts';
import { REFLECTIONS } from '../../../src/components/daily-reflection/reflections.ts';
import { TEXTS as START_TEXTS } from '../../../src/components/start-texts/texts.ts';

const HREF_RE = /href="(\/[^"#]*)"/g;
const CORPUS_SAMPLE_SIZE = 200;
const STATIC_PATHS = new Set(['/', '/404', ...Object.values(site.paths)]);

function strideSample(pages: DistPage[], count: number): DistPage[] {
  if (pages.length <= count) return pages;
  const step = pages.length / count;
  const out: DistPage[] = [];
  for (let i = 0; i < count; i++) out.push(pages[Math.floor(i * step)]);
  return out;
}

/**
 * Every href on a sampled set of pages, plus every curated data-file href
 * (reflections/start-texts render only a fraction of their entries per page
 * load, so scanning rendered HTML alone would miss most of them) must
 * resolve to a real dist file. docs/web/ui-behavior-notes.md: "a
 * misquoted or dead-linked verse is worse than none."
 *
 * Curated content hrefs are checked against page routes specifically (they
 * must be reader pages, not just any asset); the generic href sweep over
 * rendered pages is checked against every built file, since <head> alone
 * legitimately links favicons/manifest/stylesheets that aren't pages.
 */
export function checkInternalLinks(
  report: Report,
  distUrlPaths: Set<string>,
): void {
  const allAssetPaths = listAllDistUrlPaths();
  // Dedup per (resolvable-set, href) — the same href is reported once even
  // if dozens of sampled pages share it (every page's <head> links the same
  // favicon), not once per page.
  const checkedAgainstPages = new Set<string>();
  const checkedAgainstAssets = new Set<string>();
  let failures = 0;

  function check(
    href: string,
    source: string,
    resolvable: Set<string>,
    seen: Set<string>,
  ): void {
    if (seen.has(href)) return;
    seen.add(href);
    if (!resolvable.has(href)) {
      report.fail('links', `dead internal link "${href}" (from ${source})`);
      failures += 1;
    }
  }

  for (const r of REFLECTIONS) {
    check(
      r.href,
      'daily-reflection/reflections',
      distUrlPaths,
      checkedAgainstPages,
    );
  }
  for (const t of START_TEXTS) {
    check(t.href, 'start-texts-carousel', distUrlPaths, checkedAgainstPages);
  }

  const pages = listDistPages();
  const staticPages = pages.filter((p) => STATIC_PATHS.has(p.urlPath));
  const corpusPages = pages.filter((p) => !STATIC_PATHS.has(p.urlPath));
  const sample = [
    ...staticPages,
    ...strideSample(corpusPages, CORPUS_SAMPLE_SIZE),
  ];

  for (const page of sample) {
    const html = readDistFile(page.file);
    for (const m of html.matchAll(HREF_RE)) {
      check(m[1], page.urlPath, allAssetPaths, checkedAgainstAssets);
    }
  }

  const totalChecked = checkedAgainstPages.size + checkedAgainstAssets.size;
  report.log(
    `[links] ${totalChecked} unique internal hrefs checked across ${sample.length} sampled pages, ${failures} dead`,
  );
}
