import type { Report } from '../lib/report.ts';
import { site } from '../../../src/lib/site.ts';

export interface HeadCheckContext {
  documentPaths: Set<string>;
  collectionPaths: Set<string>;
}

const OG_PROPS = ['og:title', 'og:description', 'og:image', 'og:url'];

/** Runs the <head> structural assertions for one page; returns its <title> text for duplicate tracking. */
export function checkHead(
  report: Report,
  urlPath: string,
  headHtml: string,
): string | undefined {
  const titleMatch = headHtml.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch?.[1]?.trim();
  if (!title) report.fail('head', 'missing or empty <title>', urlPath);

  const descMatch = headHtml.match(
    /<meta name="description" content="([^"]*)"/,
  );
  if (!descMatch?.[1]?.trim()) {
    report.fail('head', 'missing or empty meta description', urlPath);
  }

  checkCanonical(report, urlPath, headHtml);

  for (const prop of OG_PROPS) {
    if (!headHtml.includes(`property="${prop}"`)) {
      report.fail('head', `missing ${prop}`, urlPath);
    }
  }

  if (!/<html[^>]+lang="[^"]+"/.test(headHtml)) {
    report.fail('head', 'missing <html lang>', urlPath);
  }

  return title;
}

function checkCanonical(report: Report, urlPath: string, headHtml: string) {
  const match = headHtml.match(/<link rel="canonical" href="([^"]*)"/);
  if (!match) {
    report.fail('head', 'missing canonical link', urlPath);
    return;
  }
  const href = match[1];
  const expected = new URL(urlPath, site.url).href;
  if (href !== expected) {
    report.fail(
      'head',
      `canonical "${href}" does not match expected "${expected}"`,
      urlPath,
    );
  }
}

const JSON_LD_RE = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

/**
 * JSON-LD (<JsonLd/>) is rendered as page content, not lifted into <head> —
 * so unlike checkHead, this needs the FULL document, not the head slice.
 */
export function checkJsonLd(
  report: Report,
  urlPath: string,
  html: string,
  ctx: HeadCheckContext,
): void {
  const isDocument = ctx.documentPaths.has(urlPath);
  const isCollection = ctx.collectionPaths.has(urlPath);
  const blocks = [...html.matchAll(JSON_LD_RE)];

  if (blocks.length === 0) {
    if (isDocument || isCollection) {
      report.fail('json-ld', 'corpus page has no JSON-LD block', urlPath);
    }
    return;
  }

  let sawExpectedType = false;
  for (const block of blocks) {
    let data: unknown;
    try {
      data = JSON.parse(block[1]);
    } catch (err) {
      report.fail(
        'json-ld',
        `invalid JSON (${(err as Error).message})`,
        urlPath,
      );
      continue;
    }
    const obj = data as Record<string, unknown>;
    if (obj['@context'] !== 'https://schema.org') {
      report.fail(
        'json-ld',
        `unexpected @context "${String(obj['@context'])}"`,
        urlPath,
      );
    }
    if (isDocument && obj['@type'] === 'Chapter') sawExpectedType = true;
    if (
      isCollection &&
      (obj['@type'] === 'Book' || obj['@type'] === 'BookSeries')
    ) {
      sawExpectedType = true;
    }
  }

  if ((isDocument || isCollection) && !sawExpectedType) {
    report.fail(
      'json-ld',
      'missing expected Chapter/Book/BookSeries JSON-LD type',
      urlPath,
    );
  }
}
