import { notFound } from 'next/navigation';

import {
  findNode,
  getAllPaths,
  getBreadcrumbs,
  isDocument,
  nodeTypeLabel,
  secondaryPali,
} from '@/lib/corpus';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { TocList } from '@/components/toc-list';
import { ReadingToolbar } from '@/components/reader/reading-toolbar';
import { PaliReader } from '@/components/reader/pali-reader';
import { SectionNav } from '@/components/reader/section-nav';
import { JsonLd } from '@/components/json-ld';
import {
  CorpusBrowser,
  CorpusBrowserDisclosure,
} from '@/components/corpus-browser';
import { DocumentPager } from '@/components/document-pager';
import { getAdjacentDocuments } from '@/lib/corpus/navigation';
import { loadDocument } from '@/lib/corpus/loader';

// Paragraph rends that act as in-document headings (drive the "On this page" TOC).
const HEADING_RENDS = new Set(['chapter', 'title', 'subhead']);

// Heading rends that carry the document's own title. The page already shows the
// title as the <h1>, so an in-body heading repeating it verbatim is dropped.
const TITLE_HEADING_RENDS = new Set(['chapter', 'title']);

// SSG-only: every valid path is enumerated at build time; unknown paths 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPaths().map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<'/[...slug]'>) {
  const { slug } = await props.params;
  const node = findNode(slug);
  if (!node) return {};
  const path = `/${slug.join('/')}`;
  const pali = secondaryPali(node.title, node.pali);
  return {
    title: pali ? `${node.title} (${pali})` : node.title,
    description:
      node.blurb ??
      `${node.title} — ${nodeTypeLabel(node.type)} in the Chaṭṭha Saṅgāyana Tipiṭaka (CST).`,
    alternates: { canonical: path },
    openGraph: { title: node.title, description: node.blurb, url: path },
  };
}

export default async function CorpusPage(props: PageProps<'/[...slug]'>) {
  const { slug } = await props.params;
  const node = findNode(slug);
  if (!node) notFound();

  const crumbs = getBreadcrumbs(slug);
  const basePath = `/${slug.join('/')}`;
  // Show the Pāli title only when it differs from the display title — most
  // nodes have title === pali, where rendering both just repeats the name.
  const pali = secondaryPali(node.title, node.pali);

  /* ----------------------------- Reading page ---------------------------- */
  if (isDocument(node)) {
    const content = loadDocument(slug);
    // Drop any in-body heading that just repeats the document title (shown as
    // the <h1>); keep every other heading and all body text.
    const paragraphs = (content?.paragraphs ?? []).filter(
      (p) => !(TITLE_HEADING_RENDS.has(p.rend ?? '') && p.pali === node.title),
    );
    const adjacentDocuments = getAdjacentDocuments(slug);
    const sections = paragraphs
      .filter((p) => HEADING_RENDS.has(p.rend ?? ''))
      .map((p) => ({ id: p.id, label: p.pali }));

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: node.title,
      alternateName: pali,
      inLanguage: 'pi',
      isPartOf: crumbs.slice(0, -1).map((c) => c.title),
      description: node.blurb,
    };

    return (
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />
        <div className="mx-auto grid w-full max-w-[1800px] gap-6 xl:grid-cols-[320px_minmax(0,1fr)_260px]">
          <aside className="hidden xl:block">
            <CorpusBrowser
              currentSlug={slug}
              className="sticky top-20 max-h-[calc(100svh_-_6rem)] overflow-y-auto"
            />
          </aside>

          <div className="min-w-0">
            <Breadcrumbs crumbs={crumbs} className="mb-6" />

            <header className="mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="muted">{nodeTypeLabel(node.type)}</Badge>
              </div>
              <h1 className="mt-2 font-reading text-3xl font-semibold tracking-tight lg:text-4xl">
                {node.title}
              </h1>
              {pali && (
                <p className="mt-1 font-reading text-lg text-muted-foreground">
                  {pali}
                </p>
              )}
              {node.blurb && (
                <p className="mt-3 max-w-3xl text-muted-foreground">
                  {node.blurb}
                </p>
              )}
            </header>

            <div className="mb-6 grid gap-3 md:grid-cols-2 xl:hidden">
              <CorpusBrowserDisclosure currentSlug={slug} />
              <details className="rounded-2xl border border-border bg-card shadow-sm">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:hidden">
                  On this page
                </summary>
                <div className="border-t border-border p-4">
                  <SectionNav sections={sections} />
                </div>
              </details>
            </div>

            <ReadingToolbar />

            <div className="mt-6">
              {paragraphs.length > 0 ? (
                <PaliReader paragraphs={paragraphs} />
              ) : (
                <p className="text-muted-foreground">
                  The text for this section is not yet available.
                </p>
              )}
              <DocumentPager {...adjacentDocuments} />
            </div>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-36 max-h-[calc(100svh_-_10rem)] overflow-y-auto">
              <SectionNav sections={sections} />
            </div>
          </aside>
        </div>
      </main>
    );
  }

  /* --------------------------- TOC / landing page ------------------------- */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: node.title,
    alternateName: pali,
    description: node.blurb,
  };

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />
      <div className="mx-auto grid w-full max-w-[1800px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <CorpusBrowser
            currentSlug={slug}
            className="sticky top-20 max-h-[calc(100svh_-_6rem)] overflow-y-auto"
          />
        </aside>

        <div className="min-w-0">
          <Breadcrumbs crumbs={crumbs} className="mb-6" />

          <header className="mb-8">
            <Badge variant="muted">{nodeTypeLabel(node.type)}</Badge>
            <h1 className="mt-2 font-reading text-3xl font-semibold tracking-tight lg:text-4xl">
              {node.title}
            </h1>
            {pali && (
              <p className="mt-1 font-reading text-lg text-muted-foreground">
                {pali}
              </p>
            )}
            {node.blurb && (
              <p className="mt-3 max-w-4xl text-muted-foreground">
                {node.blurb}
              </p>
            )}
          </header>

          <div className="mb-6 lg:hidden">
            <CorpusBrowserDisclosure currentSlug={slug} />
          </div>

          {node.children && node.children.length > 0 ? (
            <TocList nodes={node.children} basePath={basePath} />
          ) : (
            <p className="text-muted-foreground">No sections available yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
