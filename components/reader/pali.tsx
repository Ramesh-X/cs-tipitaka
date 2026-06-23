'use client';

import { useHydrated } from '@/lib/use-hydrated';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { transliterate } from '@/lib/corpus/transliterate';

export function Pali({ text }: { text: string }) {
  const mounted = useHydrated();
  const script = useReaderPreferences((s) => s.script);
  return <>{mounted ? transliterate(text, script) : text}</>;
}
