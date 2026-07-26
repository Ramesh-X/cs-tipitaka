/**
 * Curated reflection passages — editorial, not generated. Before adding or
 * editing entries, see docs/web/ui-behavior-notes.md.
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
