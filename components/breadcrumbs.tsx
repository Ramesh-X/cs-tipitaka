import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

import type { Crumb } from '@/lib/corpus';
import { JsonLd } from '@/components/json-ld';
import { cn } from '@/lib/utils';
import { site } from '@/lib/site';

export function Breadcrumbs({
  crumbs,
  className,
}: {
  crumbs: Crumb[];
  className?: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      ...crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: c.title,
        item: `${site.url}${c.href}`,
      })),
    ],
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('overflow-x-auto text-sm', className)}
    >
      <JsonLd data={jsonLd} />
      <ol className="flex min-w-max items-center gap-1.5 text-muted-foreground">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground"
            aria-label="Home"
          >
            <Home className="size-3.5" />
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5 opacity-50" />
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-foreground"
                >
                  {c.title}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-foreground">
                  {c.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
