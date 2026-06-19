'use client';

import { ScriptSelector } from '@/components/reader/script-selector';
import { TypographyControls } from '@/components/reader/typography-controls';
import { TranslationPicker } from '@/components/reader/translation-picker';

export function ReadingToolbar() {
  return (
    <div className="sticky top-14 z-30 rounded-xl border border-border bg-background/80 px-3 py-2 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <ScriptSelector />
        <TranslationPicker />
        <div className="ml-auto">
          <TypographyControls />
        </div>
      </div>
    </div>
  );
}
