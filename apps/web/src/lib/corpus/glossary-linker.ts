import { normalizeTerm } from '@/lib/text/normalize';
import { GLOSSARY } from './glossary';

const SORTED_TERMS = [...GLOSSARY].sort(
  (a, b) => b.term.length - a.term.length,
);

const PATTERN = new RegExp(
  `(${SORTED_TERMS.map((t) =>
    t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  ).join('|')})`,
  'gi',
);

const TERM_ID_MAP = new Map(
  GLOSSARY.map((t) => [t.term.toLowerCase(), normalizeTerm(t.term)]),
);

const LINK_CLASS =
  'underline decoration-dotted decoration-muted-foreground/50 hover:decoration-foreground';

function isWordChar(ch: string): boolean {
  return /[\p{L}\p{N}]/u.test(ch);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Scan Roman/IAST Pāli text for glossary terms and wrap the first occurrence
 * of each term in a /glossary#id link. Skips terms that appear mid-word.
 * Only intended for body/verse paragraph text when script is 'latn'.
 * Returns escaped HTML for Astro's set:html, or null when nothing matched.
 */
export function linkGlossaryTermsHtml(text: string): string | null {
  const parts: string[] = [];
  let lastIndex = 0;
  const seen = new Set<string>();
  const re = new RegExp(PATTERN.source, 'gi');
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const key = match[0].toLowerCase();
    const id = TERM_ID_MAP.get(key);
    if (!id || seen.has(id)) continue;

    const before = match.index > 0 ? text[match.index - 1] : null;
    const afterIdx = match.index + match[0].length;
    const after = afterIdx < text.length ? text[afterIdx] : null;
    if ((before && isWordChar(before)) || (after && isWordChar(after)))
      continue;

    seen.add(id);
    if (match.index > lastIndex)
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    parts.push(
      `<a href="/glossary#${id}" class="${LINK_CLASS}">${escapeHtml(match[0])}</a>`,
    );
    lastIndex = afterIdx;
  }

  if (parts.length === 0) return null;
  if (lastIndex < text.length) parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join('');
}
