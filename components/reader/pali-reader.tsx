'use client';

import type { Paragraph } from '@/lib/corpus/constants';
import { CANONICAL_SCRIPT, LANGUAGES } from '@/lib/corpus/constants';
import { transliterate } from '@/lib/corpus/transliterate';
import { useLayoutPreferences } from '@/lib/stores/layout-preferences';
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
  script: CANONICAL_SCRIPT,
  fontSize: 19,
  lineHeight: 1.5,
  fontFamily: 'serif' as const,
  showTranslation: false,
  language: 'en',
};

export function PaliReader({
  paragraphs,
  basePath,
}: {
  paragraphs: Paragraph[];
  basePath?: string;
}) {
  const mounted = useHydrated();

  const { navCollapsed, outlineCollapsed } = useLayoutPreferences();
  const panesCollapsed = mounted && (navCollapsed || outlineCollapsed);

  const prefs = useReaderPreferences();
  const {
    script,
    fontSize,
    lineHeight,
    fontFamily,
    showTranslation,
    language,
  } = mounted ? prefs : SSR_DEFAULTS;

  const effectiveScript = mounted ? script : CANONICAL_SCRIPT;

  const languageName = LANGUAGES.find((l) => l.code === language)?.name ?? '';

  return (
    <div>
      <article
        className={cn(
          'mx-auto flex flex-col',
          !showTranslation && !panesCollapsed && 'max-w-5xl',
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
            language={language}
            lineHeight={lineHeight}
            script={effectiveScript}
            transliterate={transliterate}
            basePath={basePath}
          />
        ))}
      </article>

      {mounted && showTranslation && languageName && (
        <p className="mt-4 text-xs text-muted-foreground">
          AI translation: {languageName}. Rendered in browser — not part of
          indexed content.
        </p>
      )}
    </div>
  );
}
