import type { Metadata } from 'next';
import { Boxes, Database, FileJson, Plug, Sparkles } from 'lucide-react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JsonLd } from '@/components/json-ld';
import { site } from '@/lib/site';
import { WIKIDATA_VRI } from '@/lib/corpus/schema';

export const metadata: Metadata = {
  title: 'Developers & AI',
  description:
    'The AI and LLM foundation: MCP server, Claude Skill, public read API, llms.txt, and open data export for the Chaṭṭha Saṅgāyana Tipiṭaka (CST).',
};

const ITEMS = [
  {
    icon: Plug,
    title: 'MCP server',
    body: 'Model Context Protocol tools and resources — lookup by reference, semantic search, fetch passage, and list structure — so any MCP-capable agent can use the canon.',
  },
  {
    icon: Sparkles,
    title: 'Claude Skill',
    body: 'A packaged skill that teaches an agent how to navigate, cite, and quote the Tipiṭaka correctly.',
  },
  {
    icon: FileJson,
    title: 'Public read API',
    body: 'A documented REST/JSON endpoint for fetching texts, translations, and search results.',
  },
  {
    icon: Database,
    title: 'Open data export',
    body: 'Bulk download of the texts (with licensing) so researchers and models can ingest the full canon.',
    id: 'data',
  },
];

const datasetJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Chaṭṭha Saṅgāyana Tipiṭaka — Open Data',
  description:
    'Complete Pāli Canon text corpus with AI-generated translations, available via API and bulk download.',
  url: `${site.url}/developers`,
  license: site.license,
  isAccessibleForFree: true,
  creator: {
    '@type': 'Organization',
    name: 'Vipassana Research Institute',
    sameAs: WIKIDATA_VRI,
  },
  distribution: [
    {
      '@type': 'DataDownload',
      name: 'REST JSON API',
      encodingFormat: 'application/json',
      contentUrl: `${site.url}/api/v1/text/`,
    },
  ],
  keywords: [
    'Pāli Canon',
    'Tipiṭaka',
    'Buddhist scriptures',
    'Theravāda',
    'open data',
  ],
};

export default function DevelopersPage() {
  return (
    <main className="mx-auto w-full max-w-[1800px] px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={datasetJsonLd} />
      <header className="max-w-4xl">
        <Badge variant="outline" className="mb-3">
          AI & LLM foundation
        </Badge>
        <h1 className="font-reading text-4xl font-semibold tracking-tight">
          Developers & AI
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          The same structured, server-rendered pages that humans read are
          designed to be legible to machines. Here is how to access the corpus
          programmatically.
        </p>
      </header>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ITEMS.map((item) => (
          <Card key={item.title} id={item.id} className="scroll-mt-24">
            <CardHeader>
              <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
                <item.icon className="size-4" />
              </span>
              <CardTitle className="mt-2">{item.title}</CardTitle>
              <CardDescription>{item.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Boxes className="size-5" />
          Quick reference
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Placeholder endpoints — the API is implemented later.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <pre className="overflow-x-auto bg-muted/40 p-4 font-mono text-sm leading-relaxed">
            <code>{`# Fetch a passage as JSON
GET /api/v1/text/sutta/dn/silakkhandha-vagga/dn1

# Semantic search
GET /api/v1/search?q=overcoming+anger&mode=semantic

# Machine-readable index for AI crawlers
GET /llms.txt`}</code>
          </pre>
        </div>
      </section>
    </main>
  );
}
