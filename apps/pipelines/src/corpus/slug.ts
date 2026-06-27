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
