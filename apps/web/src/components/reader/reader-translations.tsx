import { useEffect } from 'react';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import type { TranslationsByPosition } from '@/lib/corpus/loader';
import type { LangCode } from '@/lib/corpus/constants';

interface Props {
  data: TranslationsByPosition;
}

const CELL_ATTR = 'data-translation-cell';
const ATTRIBUTION_ID = 'reader-translation-attribution';

function injectTranslations(
  data: TranslationsByPosition,
  language: LangCode,
): void {
  const bodies = document.querySelectorAll<HTMLElement>('[data-para-body]');
  bodies.forEach((body) => {
    const paraEl = body.closest('[id^="para-"]');
    if (!paraEl) return;
    const position = parseInt(paraEl.id.replace('para-', ''), 10);
    const text = data[position]?.[language] ?? '[Translation unavailable]';

    let cell = body.querySelector<HTMLElement>(`[${CELL_ATTR}]`);
    if (!cell) {
      cell = document.createElement('p');
      cell.setAttribute(CELL_ATTR, '');
      cell.className =
        'font-sans text-[0.9em] leading-relaxed text-muted-foreground';
      body.appendChild(cell);
    }
    cell.textContent = text;
    body.classList.add('md:grid-cols-2');
  });

  const article = document.querySelector<HTMLElement>('[data-reader-article]');
  if (article) {
    article.setAttribute('data-translation', 'true');
    article.classList.remove('max-w-5xl');
  }

  let attribution = document.getElementById(ATTRIBUTION_ID);
  if (!attribution && article) {
    attribution = document.createElement('p');
    attribution.id = ATTRIBUTION_ID;
    attribution.className =
      'mt-8 text-center text-xs italic text-muted-foreground/70';
    article.appendChild(attribution);
  }
  if (attribution) {
    attribution.textContent = `AI translation: ${language}. Rendered in browser — not part of indexed content.`;
  }
}

function removeTranslations(): void {
  document
    .querySelectorAll<HTMLElement>(`[${CELL_ATTR}]`)
    .forEach((c) => c.remove());

  document
    .querySelectorAll<HTMLElement>('[data-para-body]')
    .forEach((b) => b.classList.remove('md:grid-cols-2'));

  const article = document.querySelector<HTMLElement>('[data-reader-article]');
  if (article) {
    article.removeAttribute('data-translation');
    article.classList.add('max-w-5xl');
  }

  document.getElementById(ATTRIBUTION_ID)?.remove();
}

export default function ReaderTranslations({ data }: Props) {
  const showTranslation = useReaderPreferences((s) => s.showTranslation);
  const language = useReaderPreferences((s) => s.language);

  useEffect(() => {
    if (showTranslation) {
      injectTranslations(data, language as LangCode);
    } else {
      removeTranslations();
    }
  }, [showTranslation, language, data]);

  return null;
}
