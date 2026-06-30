import { BookOpenText } from 'lucide-react';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { LANGUAGES } from '@/lib/corpus/constants';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TranslationPicker() {
  const showTranslation = useReaderPreferences((s) => s.showTranslation);
  const language = useReaderPreferences((s) => s.language);
  const toggleTranslation = useReaderPreferences((s) => s.toggleTranslation);
  const setLanguage = useReaderPreferences((s) => s.setLanguage);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={showTranslation ? 'default' : 'ghost'}
        size="sm"
        onClick={toggleTranslation}
        aria-pressed={showTranslation}
        className="gap-1.5"
      >
        <BookOpenText className="size-4" />
        <span className="hidden sm:inline">Translation</span>
      </Button>
      {showTranslation && (
        <Select
          value={language}
          onValueChange={(v: unknown) => setLanguage(v as string)}
        >
          <SelectTrigger
            className="h-8 w-auto min-w-28 text-xs"
            aria-label="Translation language"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.name}
                {l.endonym !== l.name && (
                  <span className="ml-1.5 text-muted-foreground">
                    {l.endonym}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
