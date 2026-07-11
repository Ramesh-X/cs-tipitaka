import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { SCRIPTS } from '@cs-tipitaka/shared';
import { transliterate } from '@/lib/corpus/reader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ScriptSelector() {
  const script = useReaderPreferences((s) => s.script);
  const setScript = useReaderPreferences((s) => s.setScript);

  return (
    <Select
      value={script}
      onValueChange={(v: unknown) => setScript(v as string)}
    >
      <SelectTrigger
        className="h-7 w-auto min-w-28 text-xs"
        aria-label="Select Pāli script"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SCRIPTS.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            <span className="mr-1.5 font-mono text-[0.7em] text-muted-foreground">
              {transliterate('Namo', s.id)}
            </span>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
