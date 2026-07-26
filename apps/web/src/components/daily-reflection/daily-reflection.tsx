import * as React from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';

import { REFLECTIONS } from './reflections';
import { useHydrated } from '@/lib/use-hydrated';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pali } from '@/components/reader/pali';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000) % REFLECTIONS.length;
}

/** Uniformly random index for "Another", skipping `exclude` so it never repeats. */
function pickIndex(exclude?: number): number {
  const n = REFLECTIONS.length;
  if (n <= 1) return 0;
  if (exclude === undefined) return Math.floor(Math.random() * n);
  const i = Math.floor(Math.random() * (n - 1));
  return i < exclude ? i : i + 1;
}

/** "Today's reflection" — see docs/web/ui-behavior-notes.md. */
export function DailyReflection() {
  const hydrated = useHydrated();
  const [index, setIndex] = React.useState(dayIndex);

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
          <Pali text={reflection.pali} />
        </p>
        <p className="text-muted-foreground">{reflection.gloss}</p>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <a
          href={reflection.href}
          className="group inline-flex items-center gap-1.5 text-sm"
        >
          <span className="font-medium text-foreground">{reflection.ref}</span>
          <span className="text-muted-foreground transition-colors group-hover:text-foreground">
            — read in context
          </span>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </a>
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
