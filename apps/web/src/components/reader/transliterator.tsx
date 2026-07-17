import { useEffect } from 'react';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { transliterate } from '@/lib/corpus/reader';
import { CANONICAL_SCRIPT } from '@cs-tipitaka/shared';

// Keep in lockstep with the applyPrefs script in src/layouts/Base.astro.
export default function Transliterator() {
  const script = useReaderPreferences((s) => s.script);

  useEffect(() => {
    const spans = document.querySelectorAll<HTMLElement>('[data-pali]');
    spans.forEach((span) => {
      if (!span.dataset.latn) {
        // First pass: stash the canonical text, and — for spans with
        // element children (glossary links) — the canonical HTML, before
        // any rewrite destroys it.
        span.dataset.latn = span.textContent ?? '';
        if (span.children.length > 0) span.dataset.latnHtml = span.innerHTML;
      }
      if (script === CANONICAL_SCRIPT && span.dataset.latnHtml) {
        span.innerHTML = span.dataset.latnHtml;
      } else {
        span.textContent = transliterate(span.dataset.latn, script);
      }
    });
    // Reveal spans hidden by the inline transliterate-init script.
    // Runs on every script change (including the initial load) so the
    // attribute is always cleared even if the stored script is latn.
    document.documentElement.removeAttribute('data-pending-script');
  }, [script]);

  return null;
}
