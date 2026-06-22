import Link from 'next/link';
import { BookOpen, ChevronRight, FileText, Search } from 'lucide-react';

import {
  isDocument,
  nodeTypeLabel,
  secondaryPali,
  type CorpusNode,
} from '@/lib/corpus';
import {
  childSummary,
  countDocuments,
  getNavTree,
  isSamePath,
  nodeHref,
  type NavNode,
} from '@/lib/corpus/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * The clickable title for a node. Clicking it navigates to the node's page;
 * inside a <summary> the surrounding chevron handles expand/collapse, so the
 * user can open a branch in place without "going in".
 */
function NodeLabel({
  node,
  path,
  active,
}: {
  node: NavNode;
  path: string[];
  active: boolean;
}) {
  const pali = secondaryPali(node.title, node.pali);
  return (
    <Link
      href={nodeHref(path)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'min-w-0 flex-1 rounded-md px-1.5 py-1 transition-colors',
        active
          ? 'font-semibold text-primary'
          : 'text-foreground/80 hover:text-foreground',
      )}
    >
      <span className="block truncate font-medium leading-tight">
        {node.title}
      </span>
      {pali && (
        <span className="block truncate font-reading text-xs text-muted-foreground">
          {pali}
        </span>
      )}
    </Link>
  );
}

function TreeNode({
  node,
  path,
  currentSlug,
}: {
  node: NavNode;
  path: string[];
  currentSlug: string[];
}) {
  const active = isSamePath(path, currentSlug);

  // Expanded branch (on the active path): a native <details>, open on load and
  // collapsible in place with no JavaScript. Only active-path branches carry
  // `children`, so this is the one place the rendered tree descends — which is
  // what keeps each page small.
  if (node.children?.length) {
    return (
      <li>
        <details open>
          <summary
            className={cn(
              'flex cursor-pointer list-none items-start gap-1 rounded-lg pr-1 text-sm transition-colors marker:hidden hover:bg-muted/60 [&::-webkit-details-marker]:hidden',
              active && 'bg-primary/10',
            )}
          >
            {/* Chevron rotates only when *this* node's <details> is open. */}
            <span className="grid size-7 shrink-0 place-items-center text-muted-foreground">
              <ChevronRight className="size-3.5 transition-transform duration-150 in-[details[open]>summary]:rotate-90" />
            </span>
            <NodeLabel node={node} path={path} active={active} />
          </summary>
          <ul className="ml-3.5 space-y-0.5 border-l border-border pl-1.5">
            {node.children.map((child) => (
              <TreeNode
                key={child.slug}
                node={child}
                path={[...path, child.slug]}
                currentSlug={currentSlug}
              />
            ))}
          </ul>
        </details>
      </li>
    );
  }

  // Off-path branch or leaf document: a single row, no descendants emitted.
  // Collapsed branches get a clickable chevron (same href as the title) so
  // clicking the arrow navigates just like clicking the text.
  return (
    <li>
      <div
        className={cn(
          'flex items-start gap-1 rounded-lg pr-1 text-sm',
          active && 'bg-primary/10',
        )}
      >
        {node.hasChildren ? (
          <Link
            href={nodeHref(path)}
            tabIndex={-1}
            aria-hidden
            className="grid size-7 shrink-0 place-items-center text-muted-foreground"
          >
            <ChevronRight className="size-3.5" />
          </Link>
        ) : (
          <span className="grid size-7 shrink-0 place-items-center text-muted-foreground">
            <FileText className="size-3.5" />
          </span>
        )}
        <NodeLabel node={node} path={path} active={active} />
      </div>
    </li>
  );
}

export function CorpusBrowser({
  currentSlug,
  className,
}: {
  currentSlug: string[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Tipiṭaka hierarchy"
      className={cn(
        'rounded-2xl border border-border bg-card p-3 shadow-sm',
        className,
      )}
    >
      <div className="px-2 pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4" />
          Tipiṭaka Library
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Browse by basket, nikāya, collection, and text.
        </p>
      </div>

      <Link
        href="/search"
        className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Search className="size-4" />
        Search or jump to a passage
      </Link>

      <ul className="space-y-0.5">
        {getNavTree(currentSlug).map((node) => (
          <TreeNode
            key={node.slug}
            node={node}
            path={[node.slug]}
            currentSlug={currentSlug}
          />
        ))}
      </ul>
    </nav>
  );
}

export function CorpusBrowserDisclosure({
  currentSlug,
}: {
  currentSlug: string[];
}) {
  return (
    <details className="rounded-2xl border border-border bg-card shadow-sm">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:hidden">
        Browse Tipiṭaka hierarchy
      </summary>
      <div className="border-t border-border p-3">
        <CorpusBrowser
          currentSlug={currentSlug}
          className="border-0 p-0 shadow-none"
        />
      </div>
    </details>
  );
}

export function NodeStats({ node }: { node: CorpusNode }) {
  if (isDocument(node)) {
    return <Badge variant="muted">Text</Badge>;
  }

  return (
    <Badge variant="muted">
      {nodeTypeLabel(node.type)} · {countDocuments(node)} texts
    </Badge>
  );
}

export function nodeDescription(node: CorpusNode): string {
  return node.blurb ?? childSummary(node);
}
