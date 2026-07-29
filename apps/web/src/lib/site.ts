// import.meta.env is undefined outside Vite — e.g. scripts/parity/ imports
// this file via plain `node --experimental-strip-types`, not through Astro's
// build. The extra `?.` on `.env` (not just `.PUBLIC_API_URL`) is load-bearing.
const apiUrl =
  import.meta.env?.PUBLIC_API_URL ?? 'https://api.tipitakaonline.org';

export const site = {
  url: 'https://tipitakaonline.org',
  apiUrl,
  license: 'https://creativecommons.org/publicdomain/zero/1.0/',
  name: 'Tipiṭaka',
  title: 'Tipiṭaka - The Pāli Canon',
  shortTitle: 'Tipiṭaka',
  description:
    'Read the Chaṭṭha Saṅgāyana Tipiṭaka (CST) - the Burmese Sixth Council edition of the Pāli Canon: browse the three baskets, switch scripts, search by meaning, and read translations.',
  shortDescription:
    'The Chaṭṭha Saṅgāyana (CST) edition of the Pāli Canon - read, search, and cite in your preferred script.',
  applicationName: 'Tipiṭaka',
  twitter: {
    card: 'summary_large_image' as const,
  },
  developer: {
    name: 'Fcode Labs',
    url: 'https://www.fcodelabs.com',
  },
  ogImage: '/og-image.png',
  paths: {
    search: '/search',
    about: '/about',
    glossary: '/glossary',
    developers: '/developers',
    usageRights: '/usage-rights',
    llmsTxt: '/llms.txt',
    sitemap: '/sitemap-index.xml',
  },
};
