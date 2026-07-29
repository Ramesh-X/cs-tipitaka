import * as React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Pali } from '@/components/reader/pali';
import { TEXTS } from './texts';

const PAGE_SIZE = 6;
const TOTAL_PAGES = Math.ceil(TEXTS.length / PAGE_SIZE);

export function StartTextsCarousel() {
  const [page, setPage] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const advance = React.useCallback(
    () => setPage((p) => (p + 1) % TOTAL_PAGES),
    [],
  );

  // Pausable on hover/focus + reduced-motion — docs/web/ui-behavior-notes.md.
  const paused = hovered || focused;
  React.useEffect(() => {
    if (paused) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const id = setInterval(advance, 7000);
    return () => clearInterval(id);
  }, [advance, paused, page]);

  const items = TEXTS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <li key={t.href}>
            <a
              href={t.href}
              className="group flex h-full items-start justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
            >
              <span className="flex flex-col">
                <span className="font-medium">{t.title}</span>
                <span className="font-reading text-sm text-muted-foreground">
                  <Pali text={t.pali} />
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {t.note}
                </span>
              </span>
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setPage((page - 1 + TOTAL_PAGES) % TOTAL_PAGES)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        <div className="flex items-center" aria-label="Page indicator">
          {Array.from({ length: TOTAL_PAGES }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page ? 'true' : undefined}
              className="group flex size-6 items-center justify-center"
            >
              <span
                className={`size-2 rounded-full transition-colors ${
                  i === page
                    ? 'bg-foreground'
                    : 'bg-border group-hover:bg-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setPage((page + 1) % TOTAL_PAGES)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
