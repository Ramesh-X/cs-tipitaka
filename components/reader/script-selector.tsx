'use client';

import { Languages } from 'lucide-react';

import { SCRIPTS } from '@/lib/corpus/constants';
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
      <SelectTrigger className="gap-2" aria-label="Display script">
        <Languages className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SCRIPTS.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            <span className="flex items-center gap-2">
              <span className="w-12 text-muted-foreground">{s.sample}</span>
              {s.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
