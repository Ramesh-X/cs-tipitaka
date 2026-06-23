'use client';

import type * as React from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLayoutPreferences } from '@/lib/stores/layout-preferences';
import { useHydrated } from '@/lib/use-hydrated';

interface CorpusLayoutProps {
  variant: 'document' | 'toc';
  nav: React.ReactNode;
  /** Only pass for article pages that have ≥1 heading section. */
  outline?: React.ReactNode;
  children: React.ReactNode;
}

function getDocumentGridCols(
  navCollapsed: boolean,
  outlineCollapsed: boolean,
  hasOutline: boolean,
): string {
  if (!hasOutline) {
    return navCollapsed
      ? 'xl:grid-cols-[3rem_minmax(0,1fr)]'
      : 'xl:grid-cols-[320px_minmax(0,1fr)]';
  }
  if (!navCollapsed && !outlineCollapsed)
    return 'xl:grid-cols-[320px_minmax(0,1fr)_260px]';
  if (navCollapsed && !outlineCollapsed)
    return 'xl:grid-cols-[3rem_minmax(0,1fr)_260px]';
  if (!navCollapsed && outlineCollapsed)
    return 'xl:grid-cols-[320px_minmax(0,1fr)_3rem]';
  return 'xl:grid-cols-[3rem_minmax(0,1fr)_3rem]';
}

function getTocGridCols(navCollapsed: boolean): string {
  return navCollapsed
    ? 'lg:grid-cols-[3rem_minmax(0,1fr)]'
    : 'lg:grid-cols-[320px_minmax(0,1fr)]';
}

export function CorpusLayout({
  variant,
  nav,
  outline,
  children,
}: CorpusLayoutProps) {
  const mounted = useHydrated();
  const { navCollapsed, outlineCollapsed, toggleNav, toggleOutline } =
    useLayoutPreferences();

  // SSR: always expanded so first paint matches SSG HTML (no hydration mismatch).
  const navIsCollapsed = mounted && navCollapsed;
  const outlineIsCollapsed = mounted && outlineCollapsed;
  const hasOutline = outline !== undefined;

  const gridCols =
    variant === 'document'
      ? getDocumentGridCols(navIsCollapsed, outlineIsCollapsed, hasOutline)
      : getTocGridCols(navIsCollapsed);

  const leftBreakpoint =
    variant === 'document' ? 'hidden xl:block' : 'hidden lg:block';

  return (
    <div className={`mx-auto grid w-full max-w-[1800px] gap-6 ${gridCols}`}>
      {/* Left nav pane */}
      <aside className={`${leftBreakpoint} print:hidden`}>
        {navIsCollapsed ? (
          <div className="sticky top-20 flex justify-center pt-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleNav}
              aria-label="Expand navigation"
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="sticky top-20 max-h-[calc(100svh_-_6rem)] overflow-y-auto relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 z-10 opacity-40 hover:opacity-100"
              onClick={toggleNav}
              aria-label="Collapse navigation"
            >
              <PanelLeftClose className="size-4" />
            </Button>
            {nav}
          </div>
        )}
      </aside>

      {/* Center content */}
      {children}

      {/* Right outline pane — document variant only, when sections exist */}
      {variant === 'document' && hasOutline && (
        <aside className="hidden xl:block print:hidden">
          {outlineIsCollapsed ? (
            <div className="sticky top-36 flex justify-center pt-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleOutline}
                aria-label="Expand outline"
              >
                <PanelRightOpen className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="sticky top-36 max-h-[calc(100svh_-_10rem)] overflow-y-auto relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 z-10 opacity-40 hover:opacity-100"
                onClick={toggleOutline}
                aria-label="Collapse outline"
              >
                <PanelRightClose className="size-4" />
              </Button>
              <div className="pt-7">{outline}</div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
