import type { Report } from '../lib/report.ts';

/** Every legacy production URL must still resolve on the new site — no redirect map needed if this holds. */
export function checkUrlCoverage(
  report: Report,
  legacyUrls: string[],
  distUrlPaths: Set<string>,
): void {
  let missing = 0;
  for (const url of legacyUrls) {
    if (!distUrlPaths.has(url)) {
      report.fail('urls', 'legacy URL missing from dist', url);
      missing += 1;
    }
  }

  const covered = legacyUrls.length - missing;
  const newUrls = distUrlPaths.size - covered;
  report.log(
    `[urls] ${legacyUrls.length} legacy URLs checked, ${missing} missing, ` +
      `${distUrlPaths.size} total dist pages (${newUrls} new since legacy)`,
  );
}
