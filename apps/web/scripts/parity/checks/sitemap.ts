import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Report } from '../lib/report.ts';
import { DIST_DIR } from '../lib/dist-walk.ts';
import { site } from '../../../src/lib/site.ts';

// Pages that intentionally have no sitemap entry.
const EXCLUDED_FROM_SITEMAP = new Set(['/404']);

/** Locks in M6.1's verified state: bijection with dist, trailing-slash policy, priority tiers, no <lastmod>. */
export function checkSitemap(report: Report, distUrlPaths: Set<string>): void {
  let indexXml: string, sitemapXml: string;
  try {
    indexXml = readFileSync(join(DIST_DIR, 'sitemap-index.xml'), 'utf8');
    sitemapXml = readFileSync(join(DIST_DIR, 'sitemap-0.xml'), 'utf8');
  } catch (err) {
    report.fail(
      'sitemap',
      `sitemap files not found: ${(err as Error).message}`,
    );
    return;
  }

  if (!indexXml.includes('sitemap-0.xml')) {
    report.fail(
      'sitemap',
      'sitemap-index.xml does not reference sitemap-0.xml',
    );
  }
  if (sitemapXml.includes('<lastmod>')) {
    report.fail(
      'sitemap',
      'sitemap-0.xml contains <lastmod> — build time is not real content freshness (docs/SEO.md)',
    );
  }

  const sitemapUrlPaths = new Set<string>();
  for (const block of sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const locMatch = block[1].match(/<loc>([^<]*)<\/loc>/);
    const priorityMatch = block[1].match(/<priority>([^<]*)<\/priority>/);
    if (!locMatch) {
      report.fail('sitemap', 'url block missing <loc>');
      continue;
    }

    const loc = locMatch[1];
    if (!loc.startsWith(site.url)) {
      report.fail(
        'sitemap',
        `loc "${loc}" is not absolute against ${site.url}`,
      );
      continue;
    }

    const urlPath = loc.slice(site.url.length) || '/';
    if (urlPath !== '/' && urlPath.endsWith('/')) {
      report.fail('sitemap', 'trailing slash in sitemap loc', urlPath);
    }
    sitemapUrlPaths.add(urlPath);

    const expectedPriority = urlPath === '/' ? '1.0' : '0.7';
    if (priorityMatch?.[1] !== expectedPriority) {
      report.fail(
        'sitemap',
        `priority "${priorityMatch?.[1]}" expected "${expectedPriority}"`,
        urlPath,
      );
    }
  }

  const expectedDistPaths = new Set(
    [...distUrlPaths].filter((p) => !EXCLUDED_FROM_SITEMAP.has(p)),
  );
  for (const p of expectedDistPaths) {
    if (!sitemapUrlPaths.has(p)) {
      report.fail('sitemap', 'dist page missing from sitemap', p);
    }
  }
  for (const p of sitemapUrlPaths) {
    if (!expectedDistPaths.has(p)) {
      report.fail('sitemap', 'sitemap entry has no matching dist page', p);
    }
  }

  report.log(
    `[sitemap] ${sitemapUrlPaths.size} sitemap entries checked against ${expectedDistPaths.size} dist pages`,
  );
}
