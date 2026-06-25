import { site } from '@/lib/site';
import { WIKIDATA_MAP } from './wikidata-map';

export const WIKIDATA_TIPITAKA = 'https://www.wikidata.org/wiki/Q1373225';
export const WIKIDATA_BUDDHA = 'https://www.wikidata.org/wiki/Q9441';
export const WIKIDATA_VRI = 'https://www.wikidata.org/wiki/Q4994680';

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: 'Tipiṭaka Online',
    url: site.url,
    logo: { '@type': 'ImageObject', url: `${site.url}/icon.svg` },
    sameAs: ['https://en.wikipedia.org/wiki/Pali_Canon', WIKIDATA_TIPITAKA],
    license: site.license,
  };
}

export function webSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.title,
    url: site.url,
    publisher: { '@id': `${site.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webApplicationNode() {
  return {
    '@type': 'WebApplication',
    '@id': `${site.url}/#webapp`,
    name: 'Tipiṭaka Online Reader',
    url: site.url,
    applicationCategory: 'ReferenceApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    featureList: [
      'Transliteration into 18 scripts (Sinhala, Devanagari, Thai, Myanmar, Khmer, and more) — rendered live in the browser',
      'AI-assisted translation into English, Sinhala, Thai, and Burmese — rendered in the browser',
      'Deep-linkable paragraph anchors with CST and PTS citation references',
      'Semantic and keyword search across the full canon',
      'Dark mode',
      'Adjustable font size, line height, and font family',
    ],
    publisher: { '@id': `${site.url}/#organization` },
  };
}

export function bookNode(opts: {
  name: string;
  pali?: string;
  description?: string;
  url: string;
  isPartOfUrl?: string;
  wikidata?: string;
}) {
  const node: Record<string, unknown> = {
    '@type': 'Book',
    '@id': `${site.url}${opts.url}`,
    name: opts.name,
    inLanguage: 'pi',
    bookFormat: 'EBook',
    isAccessibleForFree: true,
    license: site.license,
    author: {
      '@type': 'Person',
      name: 'The Buddha (Siddhattha Gotama)',
      sameAs: WIKIDATA_BUDDHA,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vipassana Research Institute',
      sameAs: WIKIDATA_VRI,
    },
    url: `${site.url}${opts.url}`,
  };
  if (opts.pali) node.alternateName = opts.pali;
  if (opts.description) node.description = opts.description;
  if (opts.isPartOfUrl) {
    node.isPartOf = {
      '@type': 'BookSeries',
      '@id': `${site.url}${opts.isPartOfUrl}`,
    };
  }
  if (opts.wikidata) {
    node.sameAs = [opts.wikidata, 'https://en.wikipedia.org/wiki/Pali_Canon'];
  }
  return node;
}

export function collectionNode(opts: {
  name: string;
  pali?: string;
  description?: string;
  url: string;
  slug: string;
  childUrls?: string[];
}) {
  const wikidataId = WIKIDATA_MAP[opts.slug];
  const node: Record<string, unknown> = {
    '@type': 'CollectionPage',
    '@id': `${site.url}${opts.url}`,
    name: opts.name,
    inLanguage: 'pi',
    isAccessibleForFree: true,
    license: site.license,
    url: `${site.url}${opts.url}`,
  };
  if (opts.pali) node.alternateName = opts.pali;
  if (opts.description) node.description = opts.description;
  if (wikidataId) node.sameAs = wikidataId;
  if (opts.childUrls?.length) {
    node.hasPart = opts.childUrls.map((u) => ({ '@id': `${site.url}${u}` }));
  }
  return node;
}
