import Link from 'next/link';

import { CORPUS } from '@/lib/corpus';
import { site } from '@/lib/site';

const COLUMNS = [
  {
    title: 'Read',
    links: CORPUS.map((p) => ({ label: p.title, href: `/${p.slug}` })),
  },
  {
    title: 'Discover',
    links: [
      { label: 'Search', href: site.paths.search },
      { label: 'About the Tipiṭaka', href: site.paths.about },
      { label: 'Glossary', href: site.paths.glossary },
    ],
  },
  {
    title: 'For developers & AI',
    links: [
      { label: 'API & MCP', href: site.paths.developers },
      { label: 'llms.txt', href: site.paths.llmsTxt },
      { label: 'Open data export', href: `${site.paths.developers}#data` },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto grid w-full max-w-[1800px] grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-sm text-primary-foreground">
              ☸
            </span>
            Tipiṭaka
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A SEO- and AI-friendly edition of the Pāli Canon — read, switch
            scripts, search by meaning, and cite with confidence.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-medium">{col.title}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            Placeholder edition — texts and features are samples for UI
            development.
          </p>
          <p>
            Canonical text rendered in Roman/IAST · Scripts switch in your
            browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
