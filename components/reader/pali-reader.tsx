'use client';

import type { Paragraph } from '@/lib/corpus/constants';
import { SCRIPTS, TRANSLATIONS } from '@/lib/corpus/constants';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { useHydrated } from '@/lib/use-hydrated';
import { cn } from '@/lib/utils';
import {
  classifyRend,
  ParagraphBlock,
} from '@/components/reader/paragraph-block';

// Server-rendered defaults — kept in sync with the store defaults so the first
// client render matches the SSG HTML (no hydration mismatch). Persisted
// preferences are applied only after mount.
const SSR_DEFAULTS = {
  script: 'roman',
  fontSize: 19,
  lineHeight: 1.5,
  fontFamily: 'serif' as const,
  showTranslation: false,
  translation: 'sujato',
};

export function PaliReader({ paragraphs }: { paragraphs: Paragraph[] }) {
  const mounted = useHydrated();

  const prefs = useReaderPreferences();
  const {
    script,
    fontSize,
    lineHeight,
    fontFamily,
    showTranslation,
    translation,
  } = mounted ? prefs : SSR_DEFAULTS;

  const scriptName =
    SCRIPTS.find((s) => s.id === script)?.name ?? 'Roman (IAST)';
  const translationName =
    TRANSLATIONS.find((t) => t.id === translation)?.title ?? '';

  return (
    <div>
      {mounted && script !== 'roman' && (
        <p className="mb-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium text-foreground">{scriptName}</span>.
          Client-side transliteration is on the way — the canonical Roman/IAST
          text is shown for now.
        </p>
      )}

      <article
        className={cn(
          'mx-auto flex flex-col',
          !showTranslation && 'max-w-5xl',
          fontFamily === 'serif' ? 'font-reading' : 'font-sans',
        )}
        style={{ fontSize: `${fontSize}px`, lineHeight }}
      >
        {paragraphs.map((p, i) => (
          <ParagraphBlock
            key={p.id}
            paragraph={p}
            prevClass={i > 0 ? classifyRend(paragraphs[i - 1].rend) : null}
            showTranslation={showTranslation}
            translation={translation}
            lineHeight={lineHeight}
          />
        ))}
      </article>

      {mounted && showTranslation && translationName && (
        <p className="mt-4 text-xs text-muted-foreground">
          Translation: {translationName}. Pāli aligned segment-by-segment.
        </p>
      )}
    </div>
  );
}
