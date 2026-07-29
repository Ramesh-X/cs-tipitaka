import type { Report } from '../lib/report.ts';

const LANDMARK_RE = /<(aside|nav)\b([^>]*)>/g;
const IMG_RE = /<img\b([^>]*)>/g;
const ANCHOR_RE = /<a\b([^>]*)>([\s\S]*?)<\/a>/g;
const HEADING_RE = /<h([1-6])\b/g;
const NAMED_RE = /aria-label="[^"]+"|aria-labelledby="[^"]+"/;

function hasDiscernibleText(inner: string): boolean {
  const text = inner
    .replace(/<[^>]+>/g, ' ')
    .replace(/&\w+;/g, ' ')
    .trim();
  return text.length > 0;
}

/**
 * Structural accessibility assertions a static site can check without a
 * browser — landmarks named, images labelled, links have discernible text,
 * headings never skip a level. Not a substitute for the manual keyboard/
 * screen-reader pass or axe/Lighthouse (see docs/web/qa-baseline.md) — this
 * is the part that's cheap to run on all ~5,000 pages, every time.
 */
export function checkA11yStatic(
  report: Report,
  urlPath: string,
  html: string,
): void {
  if (!html.includes('Skip to content')) {
    report.fail('a11y', 'missing skip-to-content link', urlPath);
  }

  const mainMatches = [...html.matchAll(/<main\b[^>]*>/g)];
  if (mainMatches.length !== 1) {
    report.fail(
      'a11y',
      `expected exactly one <main>, found ${mainMatches.length}`,
      urlPath,
    );
  } else if (!/\bid="main"/.test(mainMatches[0][0])) {
    report.fail('a11y', '<main> missing id="main"', urlPath);
  }

  if (!/<html[^>]+lang="[^"]+"/.test(html)) {
    report.fail('a11y', 'missing <html lang>', urlPath);
  }

  for (const [, tag, attrs] of html.matchAll(LANDMARK_RE)) {
    if (!NAMED_RE.test(attrs)) {
      report.fail(
        'a11y',
        `<${tag}> without aria-label/aria-labelledby`,
        urlPath,
      );
    }
  }

  for (const [, attrs] of html.matchAll(IMG_RE)) {
    if (!/\balt="/.test(attrs)) {
      report.fail('a11y', '<img> missing alt attribute', urlPath);
    }
  }

  for (const [, attrs, inner] of html.matchAll(ANCHOR_RE)) {
    if (NAMED_RE.test(attrs)) continue;
    if (!hasDiscernibleText(inner)) {
      report.fail(
        'a11y',
        '<a> with no discernible text and no aria-label',
        urlPath,
      );
    }
  }

  let previousLevel = 0;
  for (const [, level] of html.matchAll(HEADING_RE)) {
    const n = Number(level);
    if (previousLevel > 0 && n > previousLevel + 1) {
      report.fail(
        'a11y',
        `heading level jumps from h${previousLevel} to h${n}`,
        urlPath,
      );
    }
    previousLevel = n;
  }
}
