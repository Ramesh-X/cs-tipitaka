import { site } from '@/lib/site';
import { urlMerge } from '@cs-tipitaka/shared';

export const WIKIDATA_VRI = 'https://www.wikidata.org/wiki/Q136657047';
export const WIKIDATA_BUDDHAVACANA = 'https://www.wikidata.org/wiki/Q13018285';
export const PALI_CANON_WIKIPEDIA = 'https://en.wikipedia.org/wiki/Pali_Canon';

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': urlMerge(site.url, '#organization'),
    name: site.name,
    url: site.url,
    description: site.shortDescription,
    logo: {
      '@type': 'ImageObject',
      url: urlMerge(site.url, 'logo.png'),
      width: 512,
      height: 512,
    },
    areaServed: 'Worldwide',
  };
}

export function developerNode() {
  return {
    '@type': 'Organization',
    '@id': urlMerge(site.url, '#developer'),
    name: site.developer.name,
    url: site.developer.url,
  };
}

export function webSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': urlMerge(site.url, '#website'),
    name: site.name,
    url: site.url,
    description: site.shortDescription,
    inLanguage: ['en', 'pi'],
    license: site.license,
    publisher: { '@id': urlMerge(site.url, '#organization') },
    creator: { '@id': urlMerge(site.url, '#developer') },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${urlMerge(site.url, site.paths.search)}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webApplicationNode() {
  return {
    '@type': 'WebApplication',
    '@id': urlMerge(site.url, '#webapp'),
    name: 'Tipiṭaka Online Reader',
    url: site.url,
    inLanguage: ['en', 'pi'],
    applicationCategory: 'ReferenceApplication',
    applicationSubCategory: 'Digital Library',
    operatingSystem: 'Any',
    browserRequirements:
      'Requires JavaScript; requires HTML5-compatible browser',
    isAccessibleForFree: true,
    license: site.license,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: { '@id': urlMerge(site.url, '#developer') },
    featureList: [
      'Transliteration into 18 scripts (Sinhala, Devanagari, Thai, Myanmar, Khmer, and more) — rendered live in the browser',
      'AI-assisted translation into English, Sinhala, Thai, and Burmese — rendered in the browser',
      'Deep-linkable paragraph anchors with CST and PTS citation references',
      'Semantic and keyword search across the full canon',
      'Dark mode',
      'Adjustable font size, line height, and font family',
    ],
    publisher: { '@id': urlMerge(site.url, '#organization') },
  };
}

// Renders as one <JsonLd> call so the publisher/creator @id references below resolve.
export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      developerNode(),
      webSiteNode(),
      webApplicationNode(),
    ],
  };
}

/** NodeType 'document' → Chapter, always a leaf. See collectionNode() for the isPartOfType rule. */
export function documentNode(opts: {
  name: string;
  description?: string;
  url: string;
  isPartOfUrl?: string;
  isPartOfType?: 'Book' | 'BookSeries';
  wikidata?: string;
  author?: string;
  authorWikidata?: string;
}) {
  const bookUrl = urlMerge(site.url, opts.url);
  const author: Record<string, unknown> = {
    '@type': 'Person',
    name: opts.author ?? 'Unknown',
  };
  if (opts.authorWikidata) author.sameAs = opts.authorWikidata;

  const node: Record<string, unknown> = {
    '@type': 'Chapter',
    '@id': bookUrl,
    name: opts.name,
    inLanguage: 'pi',
    isAccessibleForFree: true,
    license: site.license,
    author,
    isBasedOn: {
      '@type': 'CreativeWork',
      name: 'Buddhavacana',
      alternateName: 'The oral teachings of the Buddha',
      sameAs: WIKIDATA_BUDDHAVACANA,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vipassana Research Institute',
      sameAs: WIKIDATA_VRI,
    },
    url: bookUrl,
  };
  if (opts.description) node.description = opts.description;
  if (opts.isPartOfUrl) {
    node.isPartOf = {
      '@type': opts.isPartOfType ?? 'BookSeries',
      '@id': urlMerge(site.url, opts.isPartOfUrl),
    };
  }
  if (opts.wikidata) {
    node.sameAs = [opts.wikidata, PALI_CANON_WIKIPEDIA];
  }
  return node;
}

/**
 * NodeType → schema.org type:
 *   pitaka, nikaya → always BookSeries (curated groupings, never all-document children)
 *   collection     → Book if every direct child is a document, else BookSeries
 *   document       → Chapter (see documentNode)
 * isBook / isPartOfType are computed by the caller from the corpus tree (see [...slug].astro).
 */
export function collectionNode(opts: {
  name: string;
  pali?: string;
  description?: string;
  url: string;
  isPartOfUrl?: string;
  isPartOfType?: 'Book' | 'BookSeries';
  wikidata?: string;
  childUrls?: string[];
  isBook?: boolean;
}) {
  const collectionUrl = urlMerge(site.url, opts.url);
  const node: Record<string, unknown> = {
    '@type': opts.isBook ? 'Book' : 'BookSeries',
    '@id': collectionUrl,
    name: opts.name,
    inLanguage: 'pi',
    isAccessibleForFree: true,
    license: site.license,
    url: collectionUrl,
  };
  if (opts.pali) node.alternateName = opts.pali;
  if (opts.description) node.description = opts.description;
  if (opts.isPartOfUrl) {
    node.isPartOf = {
      '@type': opts.isPartOfType ?? 'BookSeries',
      '@id': urlMerge(site.url, opts.isPartOfUrl),
    };
  }
  if (opts.wikidata) node.sameAs = opts.wikidata;
  if (opts.childUrls?.length) {
    node.hasPart = opts.childUrls.map((u) => ({
      '@id': urlMerge(site.url, u),
    }));
  }
  return node;
}
