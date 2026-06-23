import { convert } from '@pnfo/pali-converter';

import { CANONICAL_SCRIPT, SCRIPTS } from '@/lib/corpus/constants';

const SUPPORTED = new Set(SCRIPTS.map((s) => s.id));
const memo = new Map<string, string>();

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
