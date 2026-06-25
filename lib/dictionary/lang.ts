import { LANG_CODES } from '@/lib/corpus/constants';
import type { LangCode } from '@/lib/corpus/constants';

export { LANG_CODES };
export type { LangCode };
export type Localized = Partial<Record<LangCode, string>>;
export type LocalizedText = { language: LangCode; text: string };
