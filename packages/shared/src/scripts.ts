export interface Script {
  id: string;
  name: string;
}

export interface Language {
  code: string;
  name: string;
  endonym: string;
}

export const SCRIPTS: Script[] = [
  { id: 'latn', name: 'Roman (IAST)' },
  { id: 'sinh', name: 'Sinhala' },
  { id: 'deva', name: 'Devanagari' },
  { id: 'thai', name: 'Thai' },
  { id: 'mymr', name: 'Myanmar' },
  { id: 'khmr', name: 'Khmer' },
  { id: 'laoo', name: 'Lao' },
  { id: 'beng', name: 'Bengali' },
  { id: 'asse', name: 'Assamese' },
  { id: 'guru', name: 'Gurmukhi' },
  { id: 'gujr', name: 'Gujarati' },
  { id: 'telu', name: 'Telugu' },
  { id: 'knda', name: 'Kannada' },
  { id: 'mlym', name: 'Malayalam' },
  { id: 'lana', name: 'Tai Tham' },
  { id: 'brah', name: 'Brāhmī' },
  { id: 'tibt', name: 'Tibetan' },
  { id: 'cyrl', name: 'Cyrillic' },
];

/** Roman/IAST is the single canonical server-rendered script (SEO + AI). */
export const CANONICAL_SCRIPT = 'latn';

export const LANG_CODES = ['en', 'si', 'th', 'my'] as const;
export type LangCode = (typeof LANG_CODES)[number];

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', endonym: 'English' },
  { code: 'si', name: 'Sinhala', endonym: 'සිංහල' },
  { code: 'th', name: 'Thai', endonym: 'ภาษาไทย' },
  { code: 'my', name: 'Burmese', endonym: 'မြန်မာ' },
];
