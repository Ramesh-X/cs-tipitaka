export const ROOT_ID_RE = /^root:[a-z0-9-]+$/;
export const LEX_ID_RE = /^lex:[a-z0-9-]+$/;
export const FORM_ID_RE = /^form:[a-z0-9-]+:[a-z0-9-]+$/;

// Bijective IAST → q-escaped ASCII codec. 'q' never occurs in Pāli, making it
// safe as the sole escape character. Each mapping is unambiguous on decode.
const ENCODE_MAP: [string, string][] = [
  ['ā', 'qa'],
  ['ī', 'qi'],
  ['ū', 'qu'],
  ['ṃ', 'qm'],
  ['ṅ', 'qg'],
  ['ñ', 'qf'],
  ['ṇ', 'qn'],
  ['ṭ', 'qt'],
  ['ḍ', 'qd'],
  ['ḷ', 'ql'],
];

const DECODE_MAP = new Map(ENCODE_MAP.map(([orig, enc]) => [enc, orig]));

/**
 * Convert an IAST Pāli string to a collision-free ASCII slug for stable IDs.
 * Diacritics are q-escaped (fully reversible); spaces become hyphens; the √
 * root prefix and any remaining non-ASCII characters are stripped.
 * Examples: "nāga" → "nqaga", "ñāṇa" → "qfqaqna", "√budh" → "budh".
 */
export function toIdSlug(iast: string): string {
  let s = iast.toLowerCase().trim();
  for (const [orig, enc] of ENCODE_MAP) {
    s = s.split(orig).join(enc);
  }
  return s.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Reverse of toIdSlug. Decodes a q-escaped slug back to IAST.
 * Examples: "nqaga" → "nāga", "budh" → "budh".
 */
export function fromIdSlug(slug: string): string {
  return slug.replace(/q[a-z]/g, (m) => DECODE_MAP.get(m) ?? m);
}
