'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';

import { site } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Browse', href: '/vinaya' },
  { label: 'Search', href: site.paths.search },
  { label: 'About', href: site.paths.about },
  { label: 'Glossary', href: site.paths.glossary },
  { label: 'Developers', href: site.paths.developers },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1800px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="grid size-7 place-items-center rounded-md bg-primary text-sm text-primary-foreground">
            ☸
          </span>
          <span>Tipiṭaka</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={item.href} />}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 text-muted-foreground sm:inline-flex"
            nativeButton={false}
            render={<Link href="/search" />}
          >
            <Search className="size-4" />
            Search the canon…
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'border-t border-border md:hidden',
          menuOpen ? 'block' : 'hidden',
        )}
      >
        <nav className="mx-auto flex w-full max-w-[1800px] flex-col gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <span className="px-2 pt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Menu
          </span>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
