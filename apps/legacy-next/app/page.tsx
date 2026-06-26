import Link from 'next/link';
import { ArrowRight, BookOpen, Languages, Link2, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/json-ld';
import { DailyReflection } from '@/components/daily-reflection/daily-reflection';
import { StartTextsCarousel } from '@/components/start-texts/start-texts-carousel';
import { Pali } from '@/components/reader/pali';
import { site } from '@/lib/site';
import {
  organizationNode,
  webSiteNode,
  webApplicationNode,
} from '@/lib/corpus/schema';

const PURPOSES = [
  { label: 'Read the suttas', href: '/sutta' },
  { label: 'Search by meaning or topic', href: site.paths.search },
  { label: 'Study Pāli vocabulary', href: site.paths.glossary },
  { label: 'Read the Abhidhamma Piṭaka', href: '/abhidhamma' },
  { label: 'About this edition', href: site.paths.about },
  { label: 'Developers & open data', href: site.paths.developers },
];

const TOOLS = [
  {
    icon: Languages,
    title: 'Read the Pāli clearly',
    body: 'Roman/IAST by default. Switch to Sinhala, Devanagari, Thai, Myanmar, Khmer, Tibetan, and 12 more — all transliterated live in your browser.',
  },
  {
    icon: BookOpen,
    title: 'Study with AI translation',
    body: 'Pāli and AI-generated translation side by side — available in English, Sinhala, Thai, and Burmese, rendered live in your browser.',
  },
  {
    icon: Link2,
    title: 'Follow by reference',
    body: 'Stable paragraph links, breadcrumbs, and CST/PTS citations make each passage easy to return to and cite.',
  },
  {
    icon: Search,
    title: 'Search with meaning',
    body: 'Find teachings by topic, phrase, or idea — not only by exact words in the text.',
  },
];

const ABOUT_FACTS = [
  { label: 'Edition', value: 'Chaṭṭha Saṅgāyana (Sixth Council)' },
  { label: 'Convened', value: '1954–1956, Rangoon, Burma' },
  { label: 'Source', value: 'Vipassana Research Institute (VRI)' },
  { label: 'Script', value: 'Roman / IAST (canonical); 17 others in-browser' },
  { label: 'Offered as', value: 'Dhammadāna — a gift of Dhamma' },
];

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      webSiteNode(),
      webApplicationNode(),
      {
        '@type': 'Dataset',
        '@id': `${site.url}/#dataset`,
        name: 'Chaṭṭha Saṅgāyana Tipiṭaka — Complete Pāli Canon',
        description:
          'The complete Pāli Canon in the Chaṭṭha Saṅgāyana (Sixth Council) edition, digitized by the Vipassana Research Institute.',
        url: site.url,
        inLanguage: 'pi',
        license: site.license,
        isAccessibleForFree: true,
        creator: { '@id': `${site.url}/#organization` },
        keywords: [
          'Pāli Canon',
          'Tipiṭaka',
          'Theravāda Buddhism',
          'Buddhist scriptures',
          'Dhamma',
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero + Today's reflection */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-16">
            <div>
              <p className="font-reading text-sm italic text-muted-foreground">
                <Pali text="Namo tassa bhagavato arahato sammāsambuddhassa" />
              </p>
              <h1 className="mt-4 font-reading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Read the Buddha&apos;s words with clarity and care.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                The Chaṭṭha Saṅgāyana Tipiṭaka — the Sixth Council edition of
                the Pāli Canon — in a quiet, fast, freely-given reader. For
                study, reflection, meditation, and the preservation of the
                Dhamma.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href="/sutta" />}
                  className="gap-2"
                >
                  <BookOpen className="size-4" />
                  Begin reading
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={site.paths.search} />}
                  className="gap-2"
                >
                  <Search className="size-4" />
                  Search the Dhamma
                </Button>
              </div>
            </div>
            <div>
              <DailyReflection />
            </div>
          </div>
        </div>
      </section>

      {/* Begin according to your purpose */}
      <section className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Begin according to your purpose
          </h2>
          <p className="mt-1 text-muted-foreground">I want to…</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PURPOSES.map((p) => (
            <li key={p.label}>
              <Link
                href={p.href}
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
              >
                <span className="font-medium">{p.label}</span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Start with these texts */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">
            Start with these texts
          </h2>
          <StartTextsCarousel />
        </div>
      </section>

      {/* Tools for careful study */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Tools for careful study
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <div key={tool.title}>
                <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <tool.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-medium">{tool.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tool.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Open data, a public API, and{' '}
              <Link
                href={site.paths.llmsTxt}
                className="font-medium text-foreground hover:underline"
              >
                llms.txt
              </Link>{' '}
              for developers and researchers —{' '}
              <Link
                href={site.paths.developers}
                className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
              >
                learn more
                <ArrowRight className="size-3" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* About the edition */}
      <section className="border-t border-border bg-muted/20">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                About this edition
              </h2>
              <p className="mt-4 text-muted-foreground">
                The Chaṭṭha Saṅgāyana (Sixth Council) Tipiṭaka was convened in
                Rangoon, Burma, between 1954 and 1956. Modelled on five earlier
                councils that preserved the Pāli Canon, it brought together
                scholars from eight Theravāda countries to verify, edit, and
                reprint the authoritative Pāli text. The digitized edition was
                produced by the Vipassana Research Institute (VRI).
              </p>
              <p className="mt-4 text-muted-foreground">
                This site presents the CST text in Roman/IAST — the
                international scholarly standard for Pāli — with in-browser
                transliteration to six other scripts. Paragraph-level CST and
                PTS references are stable and citable.
              </p>
              <p className="mt-6 font-reading text-sm italic text-muted-foreground">
                <Pali text="Sabbadānaṃ dhammadānaṃ jināti" /> — the gift of
                Dhamma surpasses all gifts.{' '}
                <Link
                  href="/sutta/kn/dhammapadapali/brahmanavaggo"
                  className="not-italic hover:underline"
                >
                  Dhp 354
                </Link>
              </p>
              <Link
                href={site.paths.about}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                Learn more about the edition
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <dl className="divide-y divide-border">
                {ABOUT_FACTS.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-6"
                  >
                    <dt className="w-28 shrink-0 text-sm font-medium">
                      {f.label}
                    </dt>
                    <dd className="text-sm text-muted-foreground">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
