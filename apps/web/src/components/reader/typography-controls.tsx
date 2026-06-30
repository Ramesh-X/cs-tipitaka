import { RotateCcw, Type } from 'lucide-react';
import { useEffect } from 'react';
import { useHydrated } from '@/lib/use-hydrated';
import {
  useReaderPreferences,
  type FontFamily,
} from '@/lib/stores/reader-preferences';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

function toNum(v: number | readonly number[]): number {
  return Array.isArray(v) ? ((v as number[])[0] ?? 0) : (v as number);
}

export default function TypographyControls() {
  const hydrated = useHydrated();
  const fontSize = useReaderPreferences((s) => s.fontSize);
  const lineHeight = useReaderPreferences((s) => s.lineHeight);
  const fontFamily = useReaderPreferences((s) => s.fontFamily);
  const setFontSize = useReaderPreferences((s) => s.setFontSize);
  const setLineHeight = useReaderPreferences((s) => s.setLineHeight);
  const setFontFamily = useReaderPreferences((s) => s.setFontFamily);
  const reset = useReaderPreferences((s) => s.reset);

  useEffect(() => {
    if (!hydrated) return;
    const article = document.querySelector(
      '[data-reader-article]',
    ) as HTMLElement | null;
    if (!article) return;
    article.style.setProperty('--reader-font-size', `${fontSize}px`);
    article.style.setProperty('--reader-line-height', String(lineHeight));
    if (fontFamily === 'serif') {
      article.classList.add('font-reading');
      article.classList.remove('font-sans');
    } else {
      article.classList.add('font-sans');
      article.classList.remove('font-reading');
    }
  }, [hydrated, fontSize, lineHeight, fontFamily]);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'gap-1.5 text-muted-foreground hover:text-foreground',
        )}
      >
        <Type className="size-4" />
        <span className="hidden sm:inline">Display</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Font size
              </span>
              <span className="text-xs tabular-nums">{fontSize}px</span>
            </div>
            <Slider
              min={14}
              max={28}
              step={1}
              value={fontSize}
              onValueChange={(v) => setFontSize(toNum(v))}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Line height
              </span>
              <span className="text-xs tabular-nums">
                {lineHeight.toFixed(1)}
              </span>
            </div>
            <Slider
              min={0.9}
              max={2.4}
              step={0.1}
              value={lineHeight}
              onValueChange={(v) => setLineHeight(toNum(v))}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Font
            </span>
            <ToggleGroup
              value={[fontFamily]}
              onValueChange={(vals: string[]) => {
                const next = vals[vals.length - 1] as FontFamily | undefined;
                if (next) setFontFamily(next);
              }}
            >
              <ToggleGroupItem
                value="serif"
                aria-label="Serif font"
                className="h-7 px-2 text-xs"
              >
                Serif
              </ToggleGroupItem>
              <ToggleGroupItem
                value="sans"
                aria-label="Sans-serif font"
                className="h-7 px-2 text-xs"
              >
                Sans
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <button
            type="button"
            onClick={reset}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'w-full gap-1.5 text-muted-foreground',
            )}
          >
            <RotateCcw className="size-3.5" />
            Reset to defaults
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
