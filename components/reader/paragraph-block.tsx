import { Link2 } from 'lucide-react';

import type { Paragraph } from '@/lib/corpus/constants';
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

/** Leading paragraph number ("1.") that doubles as the deep-link anchor. */
function ParaNum({ id, num }: { id: string; num: string }) {
  return (
    <a
      href={`#${id}`}
      className="mr-1.5 font-semibold tabular-nums text-primary/80 no-underline hover:text-primary"
      aria-label={`Paragraph ${num}`}
    >
      {num}.
    </a>
  );
}

/** Hover-revealed citation refs (CST / PTS page) + copy-link — kept out of the
 *  reading flow so prose isn't broken up, but still available for citation. */
function ParaMeta({
  id,
  cst,
  pts,
}: {
  id: string;
  cst?: string;
  pts?: string;
}) {
  if (!cst && !pts) return null;
  // absolute so it doesn't add height to the paragraph box — keeps inter-paragraph
  // spacing consistent whether or not a citation exists.
  return (
    <div className="absolute top-full left-0 z-10 mt-0.5 flex items-center gap-2 text-[0.7em] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
      <a
        href={`#${id}`}
        aria-label={`Link to paragraph ${cst ?? pts ?? id}`}
        className="hover:text-foreground"
      >
        <Link2 className="size-3" />
      </a>
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
  translation,
  lineHeight,
  script,
  transliterate,
}: {
  paragraph: Paragraph;
  prevClass: RendClass | null;
  showTranslation: boolean;
  translation: string;
  lineHeight: number;
  script: string;
  transliterate: (text: string, scriptId: string) => string;
}) {
  const klass = classifyRend(p.rend);
  const pali = transliterate(p.pali, script);

  if (klass === 'banner') {
    return (
      <p
        id={p.id}
        className="mt-2 scroll-mt-32 text-center font-reading text-sm font-medium tracking-wide text-muted-foreground uppercase first:mt-0"
      >
        {pali}
      </p>
    );
  }

  if (klass === 'chapter') {
    return (
      <h2
        id={p.id}
        className="mt-10 mb-2 scroll-mt-32 text-center font-reading text-2xl font-semibold tracking-tight first:mt-0"
      >
        {pali}
      </h2>
    );
  }

  if (klass === 'subhead') {
    // Centred subtitle flanked by rules (———  Title  ———) for clear separation.
    return (
      <div className="mt-12 mb-1 flex items-center gap-4 first:mt-0">
        <span className="h-px flex-1 bg-border" />
        <h3
          id={p.id}
          className="scroll-mt-32 text-center font-reading text-xl font-semibold tracking-tight"
        >
          {pali}
        </h3>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  if (klass === 'subsubhead') {
    return (
      <h4
        id={p.id}
        className="mt-6 mb-1 scroll-mt-32 text-center font-reading text-base font-semibold text-foreground/90 first:mt-0"
      >
        {pali}
      </h4>
    );
  }

  if (klass === 'centre') {
    return (
      <p
        id={p.id}
        className="my-5 scroll-mt-32 text-center font-reading text-sm font-medium text-muted-foreground"
      >
        {pali}
      </p>
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

  return (
    <div
      id={p.id}
      className={cn(
        'group relative scroll-mt-32 target:rounded-md target:bg-muted/30',
        topGap,
      )}
    >
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
          {p.num && <ParaNum id={p.id} num={p.num} />}
          {pali}
        </p>
        {showTranslation && (
          <p className="font-sans text-[0.9em] leading-relaxed text-muted-foreground">
            {p.translations[translation] ?? '[Translation unavailable]'}
          </p>
        )}
      </div>
      <ParaMeta id={p.id} cst={p.cst} pts={p.pts} />
    </div>
  );
}
