'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';

import { REFLECTIONS } from './reflections';
import { useHydrated } from '@/lib/use-hydrated';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

/** Uniformly random index, skipping `exclude` so "Another" never repeats. */
function pickIndex(exclude?: number): number {
  const n = REFLECTIONS.length;
  if (n <= 1) return 0;
  if (exclude === undefined) return Math.floor(Math.random() * n);
  const i = Math.floor(Math.random() * (n - 1));
  return i < exclude ? i : i + 1;
}

/**
 * A canonical passage to dwell on, drawn at random on each visit.
 *
 * SSG-safe: the server and the first client render show a fixed entry (no
 * `Math.random()` in the committed markup), so hydration matches exactly. Once
 * `useHydrated()` flips true we reveal the randomly chosen passage. With
 * JavaScript disabled the first passage and its "read in context" link remain
 * fully functional.
 */
export function DailyReflection() {
  const hydrated = useHydrated();
  const [index, setIndex] = React.useState(() => pickIndex());

  const reflection = hydrated ? REFLECTIONS[index] : REFLECTIONS[0];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Today’s reflection
        </span>
        <Badge variant="muted">{reflection.theme}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-reading text-xl leading-relaxed whitespace-pre-line text-foreground sm:text-2xl">
          {reflection.pali}
        </p>
        <p className="text-muted-foreground">{reflection.gloss}</p>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <Link
          href={reflection.href}
          className="group inline-flex items-center gap-1.5 text-sm"
        >
          <span className="font-medium text-foreground">{reflection.ref}</span>
          <span className="text-muted-foreground transition-colors group-hover:text-foreground">
            — read in context
          </span>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
        {hydrated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIndex((current) => pickIndex(current))}
            className="gap-1.5 text-muted-foreground"
            aria-label="Show another reflection"
          >
            <RefreshCw className="size-4" />
            Another
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
