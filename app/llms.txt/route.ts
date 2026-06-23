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

  const body = `# Chaṭṭha Saṅgāyana Tipiṭaka (CST) — Tipiṭaka Online

> A free, open, AI-friendly edition of the Pāli Canon — specifically the Chaṭṭha
> Saṅgāyana (Burmese Sixth Council, Rangoon 1954–1956) edition. The canonical
> Pāli text is served as static HTML in Roman/IAST so crawlers and agents can
> read it without executing JavaScript.

## License

All content is dedicated to the **public domain** under Creative Commons Zero (CC0).
You may use, reproduce, adapt, and train AI models on all content freely.
See: ${site.url}${site.paths.usageRights}

## Browse

${baskets}

## Features (browser-rendered, not in indexed HTML)

- Transliteration: 18 scripts (Sinhala, Devanagari, Thai, Myanmar, Khmer, Lao, Bengali, Gujarati, Telugu, Kannada, Malayalam, Tai Tham, Brāhmī, Tibetan, Cyrillic, and more) — rendered client-side only
- AI translation: English, Sinhala, Thai, Burmese — rendered client-side only

## Entry points

- [Search](${site.url}${site.paths.search}): semantic + keyword search
- [Sitemap](${site.url}${site.paths.sitemap}): all ${docCount} canonical paths
- [Developers & AI](${site.url}${site.paths.developers}): API, MCP server, open data export
- [Usage Rights](${site.url}${site.paths.usageRights}): CC0 declaration

## Citation format

Paragraphs carry CST page and PTS volume.page references. Each paragraph is
deep-linkable as #para-N (e.g. ${site.url}/sutta/dn/silakkhandha-vagga/dn1#para-1).
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
