import Link from 'next/link';

import { CORPUS } from '@/lib/corpus';
import { site } from '@/lib/site';

const COLUMNS = [
  {
    title: 'Read',
    links: CORPUS.map((p) => ({ label: p.title, href: `/${p.slug}` })),
  },
  {
    title: 'Study',
    links: [
      { label: 'Search the Dhamma', href: site.paths.search },
      { label: 'Glossary', href: site.paths.glossary },
      { label: 'About the Tipiṭaka', href: site.paths.about },
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
    <footer className="mt-16 border-t border-border bg-muted/30 print:hidden">
      <div className="mx-auto grid w-full max-w-[1800px] grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-sm text-primary-foreground">
              ☸
            </span>
            Tipiṭaka
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            The Chaṭṭha Saṅgāyana (Sixth Council) edition of the Pāli Canon —
            offered freely for reading, study, reflection, and practice.
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
            Chaṭṭha Saṅgāyana Tipiṭaka · digitized by the Vipassana Research
            Institute (VRI)
          </p>
          <p>
            <a
              href={site.license}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              title="Content is dedicated to the public domain under CC0"
            >
              CC0 Public Domain
            </a>
            {' · '}
            <Link href={site.paths.usageRights} className="hover:underline">
              Usage Rights
            </Link>
          </p>
          <p>
            Developed by{' '}
            <a
              href="https://www.fcodelabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              Fcode Labs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
