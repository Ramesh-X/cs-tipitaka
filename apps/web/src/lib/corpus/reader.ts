import { convert } from '@pnfo/pali-converter';
import { CANONICAL_SCRIPT, SCRIPTS } from '@cs-tipitaka/shared';
import type { Paragraph } from '@cs-tipitaka/corpus';
import { classifyRend } from '@/components/reader/rend.ts';

const TITLE_HEADING_RENDS = new Set(['chapter', 'title', 'subhead']);
const HEADING_RENDS = new Set(['chapter', 'title', 'subhead']);

const TIMEZONE_TO_SCRIPT: Record<string, string> = {
  'Asia/Colombo': 'sinh',
  'Asia/Bangkok': 'thai',
  'Asia/Yangon': 'mymr',
  'Asia/Rangoon': 'mymr',
  'Asia/Phnom_Penh': 'khmr',
  'Asia/Vientiane': 'laoo',
  'Asia/Kolkata': 'deva',
  'Asia/Calcutta': 'deva',
  'Asia/Kathmandu': 'deva',
  'Asia/Dhaka': 'beng',
  'Asia/Thimphu': 'tibt',
};

const LANG_TO_SCRIPT: Record<string, string> = {
  si: 'sinh',
  th: 'thai',
  my: 'mymr',
  km: 'khmr',
  lo: 'laoo',
  hi: 'deva',
  ne: 'deva',
  mr: 'deva',
  sa: 'deva',
  bn: 'beng',
  as: 'asse',
  bo: 'tibt',
  gu: 'gujr',
  pa: 'guru',
  te: 'telu',
  kn: 'knda',
  ml: 'mlym',
};

const SUPPORTED = new Set(SCRIPTS.map((s) => s.id));
const memo = new Map<string, string>();

export interface ReaderSection {
  id: string;
  label: string;
}

/** Guesses a script from timezone/language; falls back to the canonical script. */
export function detectScript(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_SCRIPT[tz]) return TIMEZONE_TO_SCRIPT[tz];

    const lang =
      typeof navigator !== 'undefined'
        ? (navigator.language ?? '').toLowerCase().split('-')[0]
        : '';
    if (lang && LANG_TO_SCRIPT[lang]) return LANG_TO_SCRIPT[lang];
  } catch {
    /* empty */
  }
  return CANONICAL_SCRIPT;
}

/** No-op if `scriptId` is canonical or unsupported. Memoized. */
export function transliterate(text: string, scriptId: string): string {
  if (!text || scriptId === CANONICAL_SCRIPT || !SUPPORTED.has(scriptId)) {
    return text;
  }
  const key = scriptId + '\0' + text;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;
  let result: string;
  try {
    result = convert(text, scriptId, CANONICAL_SCRIPT);
  } catch {
    result = text;
  }
  memo.set(key, result);
  return result;
}

/** Drops a paragraph that just repeats `title` as a heading; also extracts on-page nav sections. */
export function deriveReaderSections(
  paragraphs: Paragraph[],
  title: string,
): { paragraphs: Paragraph[]; sections: ReaderSection[] } {
  let droppedSelfTitle = false;
  const kept = paragraphs.filter((p) => {
    const isSelfTitle =
      !droppedSelfTitle &&
      TITLE_HEADING_RENDS.has(p.rend ?? '') &&
      p.pali === title;
    if (isSelfTitle) {
      droppedSelfTitle = true;
      return false;
    }
    return true;
  });
  const sections = kept
    .filter((p) => HEADING_RENDS.has(p.rend ?? ''))
    .map((p) => ({ id: `para-${p.position}`, label: p.pali }));
  return { paragraphs: kept, sections };
}

const NATURAL_HEADING_LEVEL: Partial<Record<string, number>> = {
  chapter: 2,
  subhead: 3,
  subsubhead: 4,
};

/**
 * `classifyRend` maps chapter/subhead/subsubhead to a fixed h2/h3/h4 by rend
 * alone, so a document whose first heading is a subsubhead would jump
 * straight from the page's own <h1> to an <h4> — axe's heading-order rule.
 * This walks the document's actual heading sequence and clamps each one to
 * at most one level deeper than the previous heading (never prevents
 * jumping back UP to a shallower level, only skipping DOWN past one level).
 * Call on the same paragraph array that gets rendered (post-
 * deriveReaderSections), keyed by paragraph position.
 */
export function computeHeadingLevels(
  paragraphs: Paragraph[],
): Map<number, number> {
  const levels = new Map<number, number>();
  let previous = 1; // the page's own <h1>, owned by [...slug].astro
  for (const p of paragraphs) {
    const natural = NATURAL_HEADING_LEVEL[classifyRend(p.rend)];
    if (natural === undefined) continue;
    const assigned = Math.min(natural, previous + 1);
    levels.set(p.position, assigned);
    previous = assigned;
  }
  return levels;
}
