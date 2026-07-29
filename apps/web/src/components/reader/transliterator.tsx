import { useEffect } from 'react';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { transliterate } from '@/lib/corpus/reader';
import { CANONICAL_SCRIPT, SCRIPT_TO_BCP47 } from '@cs-tipitaka/shared';

const CHUNK_SIZE = 40;

// Falls back through the Prioritized Task Scheduling API, then rIC, then a
// macrotask — whichever the browser actually supports at runtime. Cast
// through a local shape rather than the ambient `navigator` type: this repo's
// hoisted @types/node ships a conditional Navigator shim that, merged with
// lib.dom's, resolves `navigator.scheduler` to `unknown` — and the real API
// isn't universally supported at runtime either way, so this checks for real.
function yieldToMain(): Promise<void> {
  const scheduler = (
    navigator as unknown as { scheduler?: { yield?: () => Promise<void> } }
  ).scheduler;
  if (typeof scheduler?.yield === 'function') {
    return scheduler.yield();
  }
  if (typeof requestIdleCallback === 'function') {
    return new Promise((resolve) => {
      requestIdleCallback(() => resolve(), { timeout: 50 });
    });
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function processInChunks(
  spans: HTMLElement[],
  rewrite: (span: HTMLElement) => void,
  isCancelled: () => boolean,
): Promise<void> {
  for (let i = 0; i < spans.length; i += CHUNK_SIZE) {
    if (isCancelled()) return;
    const end = Math.min(i + CHUNK_SIZE, spans.length);
    for (let j = i; j < end; j++) rewrite(spans[j]);
    if (end < spans.length) await yieldToMain();
  }
}

// Kept in lockstep with Base.astro's applyPrefs — docs/web/soft-navigation.md.
// applyPrefs stays a single synchronous pass (it runs on an off-screen
// document during astro:before-swap, so there's nothing to yield to); this
// one chunks and viewport-prioritizes because it can run against a page the
// user is already looking at — see docs/web/scripts-and-transliteration.md.
export default function Transliterator() {
  const script = useReaderPreferences((s) => s.script);

  useEffect(() => {
    let cancelled = false;

    function rewrite(span: HTMLElement): void {
      if (!span.dataset.latn) {
        span.dataset.latn = span.textContent ?? '';
        if (span.children.length > 0) span.dataset.latnHtml = span.innerHTML;
      }
      if (script === CANONICAL_SCRIPT && span.dataset.latnHtml) {
        span.innerHTML = span.dataset.latnHtml;
      } else {
        span.textContent = transliterate(span.dataset.latn, script);
      }
    }

    const article = document.querySelector<HTMLElement>(
      '[data-reader-article]',
    );
    if (article) article.lang = SCRIPT_TO_BCP47[script] ?? 'pi-Latn';

    const spans = Array.from(
      document.querySelectorAll<HTMLElement>('[data-pali]'),
    );

    // One layout read per element, all before any writes below, so this is a
    // single forced layout rather than read/write thrashing across 1000s of
    // nodes — cheap even on the largest pages.
    const viewportMargin = window.innerHeight;
    const priority: HTMLElement[] = [];
    const rest: HTMLElement[] = [];
    for (const span of spans) {
      const rect = span.getBoundingClientRect();
      const inView =
        rect.bottom >= -viewportMargin && rect.top <= viewportMargin * 2;
      (inView ? priority : rest).push(span);
    }

    priority.forEach(rewrite);
    // Only the priority (near-viewport) batch needs to finish before we stop
    // hiding [data-pali] — the rest trickles in below without blocking LCP.
    document.documentElement.removeAttribute('data-pending-script');

    void processInChunks(rest, rewrite, () => cancelled);

    return () => {
      cancelled = true;
    };
  }, [script]);

  return null;
}
