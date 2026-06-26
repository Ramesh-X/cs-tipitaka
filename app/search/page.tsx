import type { Metadata } from 'next';

import { SearchExperience } from '@/components/search/search-experience';

export const metadata: Metadata = {
  title: 'Search',
  description:
    'Search the Chaṭṭha Saṅgāyana Tipiṭaka (CST) by meaning. Semantic vector search with citation-grounded results and faceted filters.',
};

// Static shell — the query is read client-side and the search itself runs
// against a dynamic API endpoint, so this page stays a cached static asset.
export default function SearchPage() {
  return (
    <main className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Search the canon
        </h1>
        <p className="mt-1 text-muted-foreground">
          Find passages by meaning across the whole Tipiṭaka — results link
          straight to the cited text.
        </p>
      </header>
      <SearchExperience />
    </main>
  );
}
