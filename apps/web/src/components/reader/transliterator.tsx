import { useEffect } from 'react';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { transliterate } from '@/lib/corpus/transliterate';

export default function Transliterator() {
  const script = useReaderPreferences((s) => s.script);

  useEffect(() => {
    const spans = document.querySelectorAll<HTMLElement>('[data-pali]');
    spans.forEach((span) => {
      if (!span.dataset.latn) {
        span.dataset.latn = span.textContent ?? '';
      }
      span.textContent = transliterate(span.dataset.latn, script);
    });
    // Reveal spans hidden by the inline transliterate-init script.
    // Runs on every script change (including the initial load) so the
    // attribute is always cleared even if the stored script is latn.
    document.documentElement.removeAttribute('data-pending-script');
  }, [script]);

  return null;
}
