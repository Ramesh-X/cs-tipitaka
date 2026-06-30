import TranslationPicker from '@/components/reader/translation-picker';
import TypographyControls from '@/components/reader/typography-controls';
import { Separator } from '@/components/ui/separator';

export default function CorpusToolbar() {
  return (
    <div className="sticky top-14 z-30 mx-2 mb-4 flex items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-1.5 backdrop-blur print:hidden">
      <TranslationPicker />
      <Separator orientation="vertical" className="h-5" />
      <div className="ml-auto">
        <TypographyControls />
      </div>
    </div>
  );
}
