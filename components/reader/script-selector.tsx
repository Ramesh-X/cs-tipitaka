'use client';

import { Languages } from 'lucide-react';

import { SCRIPTS } from '@/lib/corpus/constants';
import { transliterate } from '@/lib/corpus/transliterate';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ScriptSelector() {
  const script = useReaderPreferences((s) => s.script);
  const setScript = useReaderPreferences((s) => s.setScript);

  return (
    <Select
      value={script}
      onValueChange={(value) => setScript(value as string)}
    >
      <SelectTrigger className="gap-2 w-auto" aria-label="Display script">
        <Languages className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {SCRIPTS.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            <span className="flex items-center gap-2">
              <span className="w-10 shrink-0 font-reading text-sm text-muted-foreground">
                {transliterate('Namo', s.id)}
              </span>
              {s.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
