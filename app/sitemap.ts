import type { MetadataRoute } from 'next';

import { getAllPaths } from '@/lib/corpus';
import { site } from '@/lib/site';

// Generated directly from the path hierarchy, plus the static landing pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const { search, about, glossary, developers } = site.paths;
  const staticPages = ['', search, about, glossary, developers];

  const corpusPages = getAllPaths().map((slug) => `/${slug.join('/')}`);

  return [...staticPages, ...corpusPages].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
