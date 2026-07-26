import { useEffect } from 'react';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { transliterate } from '@/lib/corpus/reader';
import { CANONICAL_SCRIPT } from '@cs-tipitaka/shared';

// Kept in lockstep with Base.astro's applyPrefs — docs/web/soft-navigation.md.
export default function Transliterator() {
  const script = useReaderPreferences((s) => s.script);

  useEffect(() => {
    const spans = document.querySelectorAll<HTMLElement>('[data-pali]');
    spans.forEach((span) => {
      if (!span.dataset.latn) {
        span.dataset.latn = span.textContent ?? '';
        if (span.children.length > 0) span.dataset.latnHtml = span.innerHTML;
      }
      if (script === CANONICAL_SCRIPT && span.dataset.latnHtml) {
        span.innerHTML = span.dataset.latnHtml;
      } else {
        span.textContent = transliterate(span.dataset.latn, script);
      }
    });
    // Clears transliterate-init.ts's pre-paint stand-in — docs/web/hydration-and-persistence.md.
    document.documentElement.removeAttribute('data-pending-script');
  }, [script]);

  return null;
}
