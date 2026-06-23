import Link from 'next/link';
import { ChevronRight, FileText, FolderTree } from 'lucide-react';

import type { CorpusNode } from '@/lib/corpus';
import {
  isDocument,
  nodeTypeLabel,
  secondaryPali,
  titleIsPali,
} from '@/lib/corpus';
import { childSummary } from '@/lib/corpus/navigation';
import { Badge } from '@/components/ui/badge';
import { Pali } from '@/components/reader/pali';

/** Table-of-contents grid linking to the children of a hierarchy level. */
export function TocList({
  nodes,
  basePath,
}: {
  nodes: CorpusNode[];
  basePath: string;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {nodes.map((child) => {
        const doc = isDocument(child);
        const pali = secondaryPali(child.title, child.pali);
        return (
          <li key={child.slug}>
            <Link
              href={`${basePath}/${child.slug}`}
              className="group flex h-full min-h-36 items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
            >
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                {doc ? (
                  <FileText className="size-4" />
                ) : (
                  <FolderTree className="size-4" />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 font-medium">
                    {titleIsPali(child.title, child.pali) ? (
                      <Pali text={child.title} />
                    ) : (
                      child.title
                    )}
                  </span>
                  <Badge variant="muted">{nodeTypeLabel(child.type)}</Badge>
                </span>
                {pali && (
                  <span className="font-reading text-sm text-muted-foreground">
                    <Pali text={pali} />
                  </span>
                )}
                <span className="mt-2 text-xs font-medium text-muted-foreground">
                  {childSummary(child)}
                </span>
                {child.blurb && (
                  <span className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {child.blurb}
                  </span>
                )}
              </span>
              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
