'use client';

import { useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';

import type { Paragraph } from '@/lib/corpus/constants';
import { linkGlossaryTerms } from '@/lib/corpus/glossary-linker';
import { cn } from '@/lib/utils';

/**
 * Coarse typographic bucket for a paragraph's TEI `rend` attribute. The corpus
 * uses ~15 distinct rends; collapsing them into a handful of display classes
 * keeps the reader styling small while still rendering headings, verse, and
 * prose the way the printed canon does.
 */
export type RendClass =
  | 'banner' // nikaya / book — document-level titles
  | 'chapter' // chapter / title — major in-text heading
  | 'subhead' // subhead — section heading
  | 'subsubhead' // subsubhead — nested heading
  | 'centre' // centred lines (homage, section terminators)
  | 'verse' // gāthā lines (poetry)
  | 'body'; // bodytext / indent / unindented / fallback prose

export function classifyRend(rend?: string): RendClass {
  switch (rend) {
    case 'nikaya':
    case 'book':
      return 'banner';
    case 'chapter':
    case 'title':
      return 'chapter';
    case 'subhead':
      return 'subhead';
    case 'subsubhead':
      return 'subsubhead';
    case 'centre':
      return 'centre';
    case 'gatha1':
    case 'gatha2':
    case 'gatha3':
    case 'gathalast':
      return 'verse';
    default:
      return 'body';
  }
}

/** Leading paragraph number ("1.") — plain text, no navigation. */
function ParaNum({ num }: { num: string }) {
  return (
    <span className="mr-1.5 font-semibold tabular-nums text-primary/80">
      {num}.
    </span>
  );
}

/** Clipboard write with a textarea-execCommand fallback for HTTP contexts. */
function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    if (ok) resolve();
    else reject(new Error('copy failed'));
  });
}

type ParaAction = {
  key: string;
  icon: React.ReactNode;
  /** Icon shown for ~1.5 s after a successful action (e.g. a checkmark). */
  activeIcon?: React.ReactNode;
  label: string;
  onAction: () => Promise<void>;
};

/**
 * Hover-revealed vertical strip of icon buttons on the left of a paragraph.
 * Add new actions by passing them in the `actions` array — the strip grows
 * downward automatically.
 */
function ParaActions({ actions }: { actions: ParaAction[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  function handleClick(action: ParaAction) {
    action
      .onAction()
      .then(() => {
        setActiveKey(action.key);
        setTimeout(() => setActiveKey(null), 1500);
      })
      .catch((err: unknown) => console.error('[ParaActions] copy failed', err));
  }

  return (
    <div className="absolute -left-7 top-0 flex flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={() => handleClick(action)}
          aria-label={action.label}
          title={action.label}
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          {activeKey === action.key && action.activeIcon
            ? action.activeIcon
            : action.icon}
        </button>
      ))}
    </div>
  );
}

/** Hover-revealed citation refs (CST / PTS page) — kept out of the reading flow
 *  so prose isn't broken up, but still available for citation. */
function ParaMeta({ cst, pts }: { cst?: string; pts?: string }) {
  if (!cst && !pts) return null;
  // absolute so it doesn't add height to the paragraph box — keeps inter-paragraph
  // spacing consistent whether or not a citation exists.
  return (
    <div className="absolute top-full left-0 z-10 mt-0.5 flex items-center gap-2 text-[0.7em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
      {cst && <span className="font-mono">CST {cst}</span>}
      {pts && <span className="font-mono">PTS {pts}</span>}
    </div>
  );
}

/**
 * Renders one corpus paragraph with `rend`-appropriate typography. Headings and
 * centred lines stand alone with spacing (the only "breaks"); body and verse
 * lines flow with paragraph rhythm and no dividers. `prevClass` lets a verse
 * line tuck against the previous line of the same stanza.
 */
export function ParagraphBlock({
  paragraph: p,
  prevClass,
  showTranslation,
  language,
  lineHeight,
  script,
  transliterate,
  basePath,
}: {
  paragraph: Paragraph;
  prevClass: RendClass | null;
  showTranslation: boolean;
  language: string;
  lineHeight: number;
  script: string;
  transliterate: (text: string, scriptId: string) => string;
  basePath?: string;
}) {
  const klass = classifyRend(p.rend);
  const pali = transliterate(p.pali, script);

  const paraActions: ParaAction[] = [
    {
      key: 'copy-link',
      icon: <Link2 className="size-3.5" />,
      activeIcon: <Check className="size-3.5" />,
      label: 'Copy link',
      onAction: () =>
        copyToClipboard(
          `${window.location.origin}${basePath ?? window.location.pathname}#${p.id}`,
        ),
    },
    {
      key: 'copy-text',
      icon: <Copy className="size-3.5" />,
      activeIcon: <Check className="size-3.5" />,
      label: 'Copy paragraph',
      onAction: () => copyToClipboard(pali),
    },
  ];

  if (klass === 'banner') {
    return (
      <div id={p.id} className="group relative mt-2 scroll-mt-32 first:mt-0">
        <ParaActions actions={paraActions} />
        <p className="text-center font-reading text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {pali}
        </p>
      </div>
    );
  }

  if (klass === 'chapter') {
    return (
      <div
        id={p.id}
        className="group relative mt-10 mb-2 scroll-mt-32 first:mt-0"
      >
        <ParaActions actions={paraActions} />
        <h2 className="text-center font-reading text-2xl font-semibold tracking-tight">
          {pali}
        </h2>
      </div>
    );
  }

  if (klass === 'subhead') {
    // Centred subtitle flanked by rules (———  Title  ———) for clear separation.
    return (
      <div
        id={p.id}
        className="group relative mt-12 mb-1 scroll-mt-32 first:mt-0"
      >
        <ParaActions actions={paraActions} />
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <h3 className="text-center font-reading text-xl font-semibold tracking-tight">
            {pali}
          </h3>
          <span className="h-px flex-1 bg-border" />
        </div>
      </div>
    );
  }

  if (klass === 'subsubhead') {
    return (
      <div
        id={p.id}
        className="group relative mt-6 mb-1 scroll-mt-32 first:mt-0"
      >
        <ParaActions actions={paraActions} />
        <h4 className="text-center font-reading text-base font-semibold text-foreground/90">
          {pali}
        </h4>
      </div>
    );
  }

  if (klass === 'centre') {
    return (
      <div id={p.id} className="group relative my-5 scroll-mt-32">
        <ParaActions actions={paraActions} />
        <p className="text-center font-reading text-sm font-medium text-muted-foreground">
          {pali}
        </p>
      </div>
    );
  }

  // Body / verse: flowing prose with an optional aligned translation column.
  const isVerse = klass === 'verse';
  const topGap = isVerse
    ? prevClass === 'verse'
      ? 'mt-0'
      : 'mt-5'
    : p.num
      ? 'mt-6' // numbered paragraph — full gap
      : 'mt-2'; // sub-paragraph — tighter gap

  // Link glossary terms when rendering Roman/IAST script
  const paliContent = script === 'latn' ? linkGlossaryTerms(pali) : pali;

  return (
    <div
      id={p.id}
      className={cn(
        'group relative scroll-mt-32 target:rounded-md target:bg-muted/30',
        topGap,
      )}
    >
      <ParaActions actions={paraActions} />
      <div
        className={cn(
          'grid gap-x-10 gap-y-2',
          showTranslation && 'md:grid-cols-2',
        )}
      >
        <p
          className={cn('text-foreground', isVerse && 'pl-6 italic')}
          style={{ lineHeight }}
        >
          {p.num && <ParaNum num={p.num} />}
          {paliContent}
        </p>
        {showTranslation && (
          <p className="font-sans text-[0.9em] leading-relaxed text-muted-foreground">
            {p.translations[language] ?? '[Translation unavailable]'}
          </p>
        )}
      </div>
      <ParaMeta cst={p.cst} pts={p.pts} />
    </div>
  );
}
