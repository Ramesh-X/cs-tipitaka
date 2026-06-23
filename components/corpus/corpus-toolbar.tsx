'use client';

import { TypographyControls } from '@/components/reader/typography-controls';
import { TranslationPicker } from '@/components/reader/translation-picker';

export function CorpusToolbar() {
  return (
    <div className="sticky top-14 z-30 rounded-xl border border-border bg-background/80 px-3 py-2 backdrop-blur print:hidden">
      <div className="flex flex-wrap items-center gap-2">
        <TranslationPicker />
        <div className="ml-auto">
          <TypographyControls />
        </div>
      </div>
    </div>
  );
}
