import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { secondaryPali } from '@/lib/corpus';
import type { CorpusEntry } from '@/lib/corpus/navigation';

export function DocumentPager({
  previous,
  next,
}: {
  previous?: CorpusEntry;
  next?: CorpusEntry;
}) {
  if (!previous && !next) return null;

  const previousPali = previous
    ? secondaryPali(previous.node.title, previous.node.pali)
    : undefined;
  const nextPali = next
    ? secondaryPali(next.node.title, next.node.pali)
    : undefined;

  return (
    <nav
      aria-label="Adjacent texts"
      className="mt-10 grid gap-3 md:grid-cols-2"
    >
      {previous ? (
        <Link
          href={previous.href}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm transition-colors hover:border-foreground/20 hover:bg-muted/40"
        >
          <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">
              Previous text
            </span>
            <span className="block truncate font-medium">
              {previous.node.title}
            </span>
            {previousPali && (
              <span className="block truncate font-reading text-xs text-muted-foreground">
                {previousPali}
              </span>
            )}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {next && (
        <Link
          href={next.href}
          className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-card p-4 text-right text-sm transition-colors hover:border-foreground/20 hover:bg-muted/40"
        >
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">
              Next text
            </span>
            <span className="block truncate font-medium">
              {next.node.title}
            </span>
            {nextPali && (
              <span className="block truncate font-reading text-xs text-muted-foreground">
                {nextPali}
              </span>
            )}
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </nav>
  );
}
