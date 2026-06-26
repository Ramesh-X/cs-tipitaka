'use client';

import { BookOpenText } from 'lucide-react';

import { LANGUAGES } from '@/lib/corpus/constants';
import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function TranslationPicker() {
  const { showTranslation, toggleTranslation, language, setLanguage } =
    useReaderPreferences();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={showTranslation ? 'secondary' : 'outline'}
        size="sm"
        className="gap-2"
        aria-pressed={showTranslation}
        onClick={toggleTranslation}
      >
        <BookOpenText className="size-4" />
        <span className="hidden sm:inline">Translation</span>
      </Button>
      <Select
        value={language}
        onValueChange={(value) => setLanguage(value as string)}
        disabled={!showTranslation}
      >
        <SelectTrigger
          className={cn('gap-2', !showTranslation && 'opacity-50')}
          aria-label="Choose translation language"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex flex-col">
                <span>{lang.name}</span>
                <span className="text-xs text-muted-foreground">
                  {lang.endonym}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
