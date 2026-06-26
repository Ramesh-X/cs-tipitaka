import { CORPUS, getAllPaths } from '@/lib/corpus';
import { site } from '@/lib/site';

export const dynamic = 'force-static';

const PITAKA_BLURBS: Record<string, string> = {
  vinaya: 'Monastic code and discipline — rules for monks and nuns',
  sutta: 'Discourses of the Buddha — the main doctrinal collection',
  abhidhamma: 'Systematic philosophy and analysis',
  atthakatha: 'Classical commentaries by Buddhaghosa and others',
  tika: 'Sub-commentaries',
  anna: 'Other texts',
};

export function GET() {
  const baskets = CORPUS.map((p) => {
    const desc = PITAKA_BLURBS[p.slug] ?? p.blurb;
    const suffix = desc ? `: ${desc}` : '';
    return `- [${p.title}](${site.url}/${p.slug})${suffix}`;
  }).join('\n');
  const docCount = getAllPaths().length;

  const body = `# Chaṭṭha Saṅgāyana Tipiṭaka (CST) — Tipiṭaka Online

> A free, open, AI-friendly edition of the Pāli Canon — specifically the Chaṭṭha
> Saṅgāyana (Burmese Sixth Council, Rangoon 1954–1956) edition. The canonical
> Pāli text is served as static HTML in Roman/IAST so crawlers and agents can
> read it without executing JavaScript.

This file follows the [llmstxt.org](https://llmstxt.org/) standard.

All content is dedicated to the public domain under Creative Commons Zero (CC0). You may use, reproduce, adapt, and train AI models on all content freely. See: ${site.url}${site.paths.usageRights}

Paragraphs carry CST page and PTS volume.page references. Each paragraph is deep-linkable as #para-N (e.g. ${site.url}/sutta/dn/silakkhandha-vagga/dn1#para-1).

Browser-only features not present in indexed HTML: transliteration into 18 scripts (Sinhala, Devanagari, Thai, Myanmar, Khmer, Lao, Bengali, Gujarati, Telugu, Kannada, Malayalam, Tai Tham, Brāhmī, Tibetan, Cyrillic, and more); AI translation into English, Sinhala, Thai, and Burmese.

## Browse

${baskets}

## Entry points

- [Search](${site.url}${site.paths.search}): Semantic and keyword search across all ${docCount} documents
- [Sitemap](${site.url}${site.paths.sitemap}): All ${docCount} canonical paths
- [Developers & AI](${site.url}${site.paths.developers}): Public API, MCP server, open data export

## Optional

- [Usage Rights](${site.url}${site.paths.usageRights}): CC0 declaration — training and redistribution permitted
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
