/**
 * Converts a Pāli tree.json node `text` value into a URL-safe slug.
 *
 * Rules applied in order:
 *   1. Strip leading "N. " numbering prefix  (e.g. "1. Brahmajālasuttaṃ")
 *   2. Lowercase (BEFORE folding, so uppercase diacritics like "Ā" survive)
 *   3. Fold Pāli diacritics to ASCII equivalents
 *   4. Replace whitespace runs with a single hyphen
 *   5. Remove any remaining non-alphanumeric characters except hyphens
 *   6. Collapse consecutive hyphens and trim edge hyphens
 */
export function slugify(text: string): string {
  return text
    .replace(/^\d+\.\s*/, '')
    .toLowerCase()
    .replace(/ā/g, 'a')
    .replace(/ī/g, 'i')
    .replace(/ū/g, 'u')
    .replace(/ṭ/g, 't')
    .replace(/ḍ/g, 'd')
    .replace(/ṇ/g, 'n')
    .replace(/ṅ/g, 'ng')
    .replace(/ñ/g, 'n')
    .replace(/ḷ/g, 'l')
    .replace(/ṃ/g, 'm')
    .replace(/ṁ/g, 'm')
    .replace(/ḥ/g, 'h')
    .replace(/ś/g, 's')
    .replace(/ṣ/g, 's')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
