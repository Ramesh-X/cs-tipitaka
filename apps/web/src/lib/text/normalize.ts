/** Lowercase, diacritics stripped, non-alphanumeric runs collapsed to "-" — for glossary anchor ids. */
export function normalizeTerm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
