'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

import { SPEAKERS } from '@/lib/corpus/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

type Mode = 'semantic' | 'keyword';

const SAMPLE_RESULTS = [
  {
    title: 'Brahmajāla Sutta',
    path: '/sutta/dn/silakkhandha-vagga/dn1#para-3',
    crumb: 'Sutta · Dīgha Nikāya · Sīlakkhandha Vagga',
    pts: 'PTS i.3',
    snippet:
      '…the Tathāgata, having abandoned ill-will and hatred, dwells with a mind free of enmity, full of compassion for the welfare of all living beings…',
  },
  {
    title: 'Dhammapada — verse 1',
    path: '/sutta/kn/dhammapada#para-1',
    crumb: 'Sutta · Khuddaka Nikāya · Dhammapada',
    pts: 'Dhp 1',
    snippet:
      '…if with a corrupted mind one speaks or acts, suffering follows, as the wheel follows the foot of the ox…',
  },
  {
    title: 'Sāmaññaphala Sutta',
    path: '/sutta/dn/silakkhandha-vagga/dn2#para-2',
    crumb: 'Sutta · Dīgha Nikāya · Sīlakkhandha Vagga',
    pts: 'PTS i.47',
    snippet:
      '…overcoming anger by patience, overcoming the miserly by giving, overcoming the liar by truth…',
  },
];

function FacetGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      <ToggleGroup
        multiple
        value={value}
        onValueChange={(v) => onChange(v as string[])}
        className="flex-wrap border-0 bg-transparent p-0"
      >
        {options.map((opt) => (
          <ToggleGroupItem
            key={opt}
            value={opt}
            className="border border-border data-[pressed]:border-transparent"
          >
            {opt}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export function SearchExperience() {
  const [query, setQuery] = React.useState('');
  const [submitted, setSubmitted] = React.useState('');
  const [mode, setMode] = React.useState<Mode>('semantic');

  // One-time read of ?q= from the URL on mount, so the page itself stays a
  // static asset. This intentionally syncs external (URL) state into React.
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') ?? '';
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(q);

      setSubmitted(q);
    }
  }, []);
  const [pitaka, setPitaka] = React.useState<string[]>([]);
  const [nikaya, setNikaya] = React.useState<string[]>([]);
  const [speaker, setSpeaker] = React.useState<string[]>([]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(query);
    const url = query.trim()
      ? `?q=${encodeURIComponent(query.trim())}`
      : window.location.pathname;
    window.history.replaceState(null, '', url);
  }

  const hasQuery = submitted.trim().length > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Facets */}
      <aside className="flex flex-col gap-6 lg:order-last lg:border-l lg:border-border lg:pl-8">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="size-4" />
          Filters
        </div>
        <FacetGroup
          title="Piṭaka"
          options={['Vinaya', 'Sutta', 'Abhidhamma']}
          value={pitaka}
          onChange={setPitaka}
        />
        <FacetGroup
          title="Nikāya"
          options={['Dīgha', 'Majjhima', 'Saṃyutta', 'Aṅguttara', 'Khuddaka']}
          value={nikaya}
          onChange={setNikaya}
        />
        <FacetGroup
          title="Speaker"
          options={SPEAKERS}
          value={speaker}
          onChange={setSpeaker}
        />
      </aside>

      {/* Search + results */}
      <div className="min-w-0">
        <form onSubmit={onSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onValueChange={(v) => setQuery(v)}
              placeholder="Search by meaning, e.g. “overcoming anger”"
              className="h-11 pl-9 text-base"
              aria-label="Search the canon"
            />
          </div>
          <Button type="submit" size="lg" className="h-11">
            Search
          </Button>
        </form>

        <div className="mt-3 flex items-center gap-2">
          <ToggleGroup
            value={[mode]}
            onValueChange={(v) => {
              const next = (v as string[])[0];
              if (next === 'semantic' || next === 'keyword') setMode(next);
            }}
          >
            <ToggleGroupItem value="semantic" className="gap-1.5">
              <Sparkles className="size-3.5" />
              Semantic
            </ToggleGroupItem>
            <ToggleGroupItem value="keyword">Keyword</ToggleGroupItem>
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">
            {mode === 'semantic'
              ? 'Embedding search — finds meaning, not just words.'
              : 'Diacritic-insensitive — matches metta / mettā and spelling variants.'}
          </p>
        </div>

        <Separator className="my-6" />

        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Search is not wired up yet — the results below are placeholders
          illustrating citation-grounded results.
        </div>

        {hasQuery && (
          <p className="mt-6 text-sm text-muted-foreground">
            Showing sample results for{' '}
            <span className="font-medium text-foreground">“{submitted}”</span>
          </p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {SAMPLE_RESULTS.map((r) => (
            <li key={r.path}>
              <Link
                href={r.path}
                className="group block rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium group-hover:underline">
                    {r.title}
                  </span>
                  <Badge variant="muted" className="font-mono">
                    {r.pts}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.crumb}
                </p>
                <p className={cn('mt-2 text-sm text-muted-foreground')}>
                  {r.snippet}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
