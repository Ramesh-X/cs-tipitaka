/**
 * Curated reflection passages for the home page "Today's reflection" block.
 *
 * EDITORIAL, NOT GENERATED. Each entry is a canonical Pāli passage with a
 * faithful short rendering, a citation label, and a verified link into the
 * reader. Keep the Pāli exact (Roman/IAST, CST orthography) and link only to
 * routes that resolve — a misquoted or dead-linked verse is worse than none.
 * Every passage here is lifted verbatim from the built corpus and its `href`
 * checked against a generated document, so each one renders the same text the
 * card quotes.
 *
 * `href` deliberately points at the containing text/vagga page rather than a
 * `#para-N` anchor: paragraph ids are per-document and not knowable here, so we
 * link to the most specific page that is guaranteed to exist. Extend freely.
 *
 * The entries live in two source files to stay well within the file-length
 * budget — Dhammapada verses in `./reflections-dhammapada`, everything else in
 * `./reflections-suttas`. Dhammapada comes first so `REFLECTIONS[0]` (the
 * SSG/pre-hydration default) is the opening verse of the canon.
 */

import { DHAMMAPADA_REFLECTIONS } from './reflections-dhammapada';
import { SUTTA_REFLECTIONS } from './reflections-suttas';

export interface Reflection {
  /** Canonical Pāli (Roman/IAST); gāthā line breaks preserved with `\n`. */
  pali: string;
  /** Citation label, e.g. "Dhammapada 183". */
  ref: string;
  /** Short topic tag for the card, e.g. "Mettā". */
  theme: string;
  /** Faithful, plain English rendering — a pointer to the meaning, not a substitute. */
  gloss: string;
  /** Verified route into the reader, to read the passage in context. */
  href: string;
}

export const REFLECTIONS: Reflection[] = [
  ...DHAMMAPADA_REFLECTIONS,
  ...SUTTA_REFLECTIONS,
];
