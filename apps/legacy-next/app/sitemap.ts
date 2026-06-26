import type { MetadataRoute } from 'next';

import { getAllPaths } from '@/lib/corpus';
import { site } from '@/lib/site';

const HIGH_PRIORITY_SLUGS = new Set([
  'sutta/kn/dhammapadapali',
  'sutta/dn/silakkhandha-vagga/dn1',
  'sutta/mn/mulapariyaya-vagga/mn1',
  'sutta/kn/suttanipata',
  'sutta/kn/udanapali',
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const buildDate = new Date();
  const { search, about, glossary, developers, usageRights } = site.paths;

  const staticPages = [
    { path: '', priority: 1.0 as const },
    { path: search, priority: 0.5 as const },
    { path: about, priority: 0.5 as const },
    { path: glossary, priority: 0.7 as const },
    { path: developers, priority: 0.5 as const },
    { path: usageRights, priority: 0.3 as const },
  ];

  const corpusPages = getAllPaths().map((slug) => {
    const path = `/${slug.join('/')}`;
    const slugStr = slug.join('/');
    const isTopLevel = slug.length === 1;
    const priority = HIGH_PRIORITY_SLUGS.has(slugStr)
      ? 0.9
      : isTopLevel
        ? 0.6
        : 0.8;
    return { path, priority };
  });

  return [...staticPages, ...corpusPages].map(({ path, priority }) => ({
    url: `${site.url}${path}`,
    lastModified: buildDate,
    changeFrequency: 'monthly' as const,
    priority,
  }));
}
