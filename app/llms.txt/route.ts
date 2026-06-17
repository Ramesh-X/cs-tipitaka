import { CORPUS, getAllPaths } from '@/lib/corpus';
import { site } from '@/lib/site';

// Served as a static file at /llms.txt — a machine-readable index pointing AI
// crawlers to the corpus, API, and key entry points.
export const dynamic = 'force-static';

export function GET() {
  const baskets = CORPUS.map(
    (p) => `- [${p.title}](${site.url}/${p.slug}): ${p.blurb ?? ''}`,
  ).join('\n');
  const docCount = getAllPaths().length;

  const body = `# Chaṭṭha Saṅgāyana Tipiṭaka (CST)

> A SEO- and AI-friendly edition of the Pāli Canon — specifically the Chaṭṭha
> Saṅgāyana (Burmese Sixth Council, Rangoon 1954–1956) edition. The canonical
> text is served as static HTML in Roman/IAST so crawlers and agents can read it
> without executing JavaScript.

## Browse

${baskets}

## Entry points

- [Search](${site.url}${site.paths.search}): semantic + diacritic-insensitive keyword search
- [Sitemap](${site.url}${site.paths.sitemap}): every one of the ${docCount} canonical paths
- [Developers & AI](${site.url}${site.paths.developers}): MCP server, public API, open data export

## Notes

- Citations use PTS page and CST paragraph references; paragraphs are deep-linkable as #para-N.
- This is a placeholder index for UI development; the live API is implemented later.
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
