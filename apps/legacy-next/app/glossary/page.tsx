import type { Metadata } from 'next';

import { GLOSSARY } from '@/lib/corpus';
import { normalizeTerm } from '@/lib/text/normalize';
import { Pali } from '@/components/reader/pali';
import { JsonLd } from '@/components/json-ld';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Glossary',
  description:
    'Short definitions of recurring Pāli and Buddhist terms, deep-linkable from anywhere in the text.',
};

export default function GlossaryPage() {
  const terms = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

  const glossaryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${site.url}/glossary`,
    name: 'Pāli Buddhist Glossary',
    description:
      'Key Pāli and Buddhist terms used in the Tipiṭaka, with stable deep-linkable anchors.',
    url: `${site.url}/glossary`,
    inLanguage: 'pi',
    license: site.license,
    hasDefinedTerm: terms.map((t) => {
      const id = normalizeTerm(t.term);
      const node: Record<string, unknown> = {
        '@type': 'DefinedTerm',
        '@id': `${site.url}/glossary#${id}`,
        name: t.term,
        termCode: id,
        description: t.definition,
        inDefinedTermSet: `${site.url}/glossary`,
        inLanguage: 'pi',
      };
      if (t.wikidata) node.sameAs = t.wikidata;
      return node;
    }),
  };

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={glossaryJsonLd} />
      <header className="max-w-4xl">
        <h1 className="font-reading text-4xl font-semibold tracking-tight">
          Glossary
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Key Pāli and Buddhist terms. Each entry has a stable anchor, so it can
          be linked from anywhere in the texts — e.g.{' '}
          <code className="font-mono text-sm">/glossary#dhamma</code>.
        </p>
      </header>

      <dl className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {terms.map((t) => {
          const id = normalizeTerm(t.term);
          return (
            <div
              key={id}
              id={id}
              className="scroll-mt-24 rounded-xl border border-border bg-card p-5 target:bg-muted/40"
            >
              <dt className="flex items-baseline gap-2">
                <a
                  href={`#${id}`}
                  className="font-reading text-xl font-medium hover:underline"
                >
                  {t.term}
                </a>
                <span className="font-reading text-sm text-muted-foreground">
                  (<Pali text={t.pali} />)
                </span>
              </dt>
              <dd className="mt-1 text-muted-foreground">{t.definition}</dd>
            </div>
          );
        })}
      </dl>
    </main>
  );
}
