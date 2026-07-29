import { useEffect } from 'react';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { site } from '@/lib/site';
import { LANGUAGES } from '@cs-tipitaka/shared';
import type { Translation } from '@cs-tipitaka/corpus';

interface Props {
  slug: string;
}

const CELL_ATTR = 'data-translation-cell';
const ATTRIBUTION_ID = 'reader-translation-attribution';
const ERROR_ID = 'reader-translation-error';
const STATUS_ID = 'reader-translation-status';
const MAX_WIDTH_ATTR = 'data-translation-removed-max-width';
const UNAVAILABLE_TEXT = '[Translation unavailable]';

function languageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

function announce(message: string): void {
  let status = document.getElementById(STATUS_ID);
  if (!status) {
    status = document.createElement('div');
    status.id = STATUS_ID;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.className = 'sr-only';
    document.body.appendChild(status);
  }
  const el = status;
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

function showError(article: HTMLElement, language: string): void {
  let error = article.querySelector<HTMLElement>(`#${ERROR_ID}`);
  if (!error) {
    error = document.createElement('p');
    error.id = ERROR_ID;
    error.setAttribute('data-nosnippet', '');
    error.className =
      'mt-4 rounded-md border border-dashed border-border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground';
    article.appendChild(error);
  }
  error.textContent = `${languageName(language)} translation unavailable right now — showing Pāli only.`;
  announce(error.textContent);
}

type TranslationMap = Map<number, string>;

// Module-scoped cache — survives island remounts; docs/web/soft-navigation.md.
const translationCache = new Map<string, TranslationMap>();

interface TranslationResponse {
  translations?: Translation[];
}

function getArticle(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-reader-article]');
}

function injectTranslations(
  article: HTMLElement,
  posMap: TranslationMap,
  language: string,
): void {
  const bodies = article.querySelectorAll<HTMLElement>('[data-para-body]');
  bodies.forEach((body) => {
    const paraEl = body.closest('[id^="para-"]');
    if (!paraEl) return;
    const position = parseInt(paraEl.id.replace('para-', ''), 10);
    const text = posMap.get(position) ?? UNAVAILABLE_TEXT;

    let cell = body.querySelector<HTMLElement>(`[${CELL_ATTR}]`);
    if (!cell) {
      cell = document.createElement('p');
      cell.setAttribute(CELL_ATTR, '');
      cell.className =
        'font-sans text-[0.9em] leading-relaxed text-muted-foreground';
      body.appendChild(cell);
    }
    cell.setAttribute('lang', language);
    cell.setAttribute('data-nosnippet', '');
    cell.textContent = text;
    body.classList.add('md:grid-cols-2');
  });

  article.setAttribute('data-translation', 'true');
  if (article.classList.contains('max-w-5xl')) {
    article.setAttribute(MAX_WIDTH_ATTR, 'true');
    article.classList.remove('max-w-5xl');
  }

  let attribution = article.querySelector<HTMLElement>(`#${ATTRIBUTION_ID}`);
  if (!attribution) {
    attribution = document.createElement('p');
    attribution.id = ATTRIBUTION_ID;
    attribution.setAttribute('data-nosnippet', '');
    attribution.className =
      'mt-8 text-center text-xs italic text-muted-foreground';
    article.appendChild(attribution);
  }
  if (attribution) {
    attribution.textContent = `AI translation rendered in browser — not part of indexed content.`;
  }

  article.querySelector(`#${ERROR_ID}`)?.remove();
  announce(`${languageName(language)} translation loaded.`);
}

function removeTranslations(article = getArticle()): void {
  if (!article) return;

  article.querySelectorAll<HTMLElement>(`[${CELL_ATTR}]`).forEach((c) => {
    c.remove();
  });

  article.querySelectorAll<HTMLElement>('[data-para-body]').forEach((b) => {
    b.classList.remove('md:grid-cols-2');
  });

  article.removeAttribute('data-translation');
  if (article.getAttribute(MAX_WIDTH_ATTR) === 'true') {
    article.classList.add('max-w-5xl');
  }
  article.removeAttribute(MAX_WIDTH_ATTR);

  article.querySelector(`#${ATTRIBUTION_ID}`)?.remove();
  article.querySelector(`#${ERROR_ID}`)?.remove();
}

function buildPosMap(translations: Translation[]): TranslationMap {
  return new Map(translations.map((t) => [t.para_position, t.text]));
}

async function fetchTranslationMap(
  slug: string,
  language: string,
  signal: AbortSignal,
): Promise<TranslationMap> {
  const response = await fetch(
    `${site.apiUrl}/translations/${slug}?lang=${encodeURIComponent(language)}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Translation request failed with ${response.status}`);
  }

  const data = (await response.json()) as TranslationResponse;
  if (!Array.isArray(data.translations)) {
    throw new Error('Translation response missing translations');
  }

  return buildPosMap(data.translations);
}

export default function ReaderTranslations({ slug }: Props) {
  const showTranslation = useReaderPreferences((s) => s.showTranslation);
  const language = useReaderPreferences((s) => s.language);

  useEffect(() => {
    const article = getArticle();
    if (!article) return;

    if (!showTranslation) {
      removeTranslations(article);
      return;
    }

    const cacheKey = `${slug}:${language}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      injectTranslations(article, cached, language);
      return;
    }

    const controller = new AbortController();
    let ignore = false;
    removeTranslations(article);

    fetchTranslationMap(slug, language, controller.signal)
      .then((posMap) => {
        if (ignore) return;
        translationCache.set(cacheKey, posMap);
        injectTranslations(article, posMap, language);
      })
      .catch((error: unknown) => {
        if (
          ignore ||
          (error instanceof DOMException && error.name === 'AbortError')
        ) {
          return;
        }
        removeTranslations(article);
        showError(article, language);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [showTranslation, language, slug]);

  return null;
}
