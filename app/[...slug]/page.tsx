import { notFound } from 'next/navigation';

import {
  findNode,
  getAllPaths,
  getBreadcrumbs,
  isDocument,
  nodeTypeLabel,
  secondaryPali,
  titleIsPali,
} from '@/lib/corpus';
import { bookNode, collectionNode } from '@/lib/corpus/schema';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { TocList } from '@/components/toc-list';
import { CorpusToolbar } from '@/components/corpus/corpus-toolbar';
import { CorpusLayout } from '@/components/corpus/corpus-layout';
import { PaliReader } from '@/components/reader/pali-reader';
import { SectionNav } from '@/components/reader/section-nav';
import { JsonLd } from '@/components/json-ld';
import {
  CorpusBrowser,
  CorpusBrowserDisclosure,
} from '@/components/corpus-browser';
import { DocumentPager } from '@/components/document-pager';
import { Pali } from '@/components/reader/pali';
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

    const jsonLd = bookNode({
      name: node.title,
      pali: pali,
      description: node.blurb,
      url: basePath,
      isPartOfUrl: crumbs.length > 1 ? crumbs[crumbs.length - 2].href : '/',
      wikidata: node.wikidata,
    });

    return (
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />
        <CorpusLayout
          variant="document"
          nav={<CorpusBrowser currentSlug={slug} />}
          outline={
            sections.length > 0 ? <SectionNav sections={sections} /> : undefined
          }
        >
          <div className="min-w-0">
            <Breadcrumbs crumbs={crumbs} className="mb-6" />

            <header className="mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="muted">{nodeTypeLabel(node.type)}</Badge>
              </div>
              <h1 className="mt-2 font-reading text-3xl font-semibold tracking-tight lg:text-4xl">
                {titleIsPali(node.title, node.pali) ? (
                  <Pali text={node.title} />
                ) : (
                  node.title
                )}
              </h1>
              {pali && (
                <p className="mt-1 font-reading text-lg text-muted-foreground">
                  <Pali text={pali} />
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
              {sections.length > 0 && (
                <details className="rounded-2xl border border-border bg-card shadow-sm">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:hidden">
                    On this page
                  </summary>
                  <div className="border-t border-border p-4">
                    <SectionNav sections={sections} />
                  </div>
                </details>
              )}
            </div>

            <CorpusToolbar />

            <div className="mt-6">
              {paragraphs.length > 0 ? (
                <PaliReader paragraphs={paragraphs} basePath={basePath} />
              ) : (
                <p className="text-muted-foreground">
                  The text for this section is not yet available.
                </p>
              )}
              <DocumentPager {...adjacentDocuments} />
            </div>
          </div>
        </CorpusLayout>
      </main>
    );
  }

  /* --------------------------- TOC / landing page ------------------------- */
  const childUrls = node.children?.map((c) => `${basePath}/${c.slug}`) ?? [];
  const jsonLd = collectionNode({
    name: node.title,
    pali: pali,
    description: node.blurb,
    url: basePath,
    slug: slug[0],
    childUrls: childUrls.slice(0, 20),
  });

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />
      <CorpusLayout variant="toc" nav={<CorpusBrowser currentSlug={slug} />}>
        <div className="min-w-0">
          <Breadcrumbs crumbs={crumbs} className="mb-6" />

          <header className="mb-4">
            <Badge variant="muted">{nodeTypeLabel(node.type)}</Badge>
            <h1 className="mt-2 font-reading text-3xl font-semibold tracking-tight lg:text-4xl">
              {titleIsPali(node.title, node.pali) ? (
                <Pali text={node.title} />
              ) : (
                node.title
              )}
            </h1>
            {pali && (
              <p className="mt-1 font-reading text-lg text-muted-foreground">
                <Pali text={pali} />
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

          <div className="mt-6">
            {node.children && node.children.length > 0 ? (
              <TocList nodes={node.children} basePath={basePath} />
            ) : (
              <p className="text-muted-foreground">
                No sections available yet.
              </p>
            )}
          </div>
        </div>
      </CorpusLayout>
    </main>
  );
}
