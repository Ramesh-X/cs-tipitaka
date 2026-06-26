'use client';

import { RotateCcw, Type } from 'lucide-react';

import { useReaderPreferences } from '@/lib/stores/reader-preferences';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';

function single(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number);
}

export function TypographyControls() {
  const {
    fontSize,
    lineHeight,
    fontFamily,
    setFontSize,
    setLineHeight,
    setFontFamily,
    reset,
  } = useReaderPreferences();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Typography settings"
          >
            <Type className="size-4" />
            <span className="hidden sm:inline">Display</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Reading display</h3>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={reset}
            aria-label="Reset to defaults"
          >
            <RotateCcw />
          </Button>
        </div>
        <Separator className="my-3" />

        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <label>Font size</label>
              <span className="text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={fontSize}
              min={14}
              max={28}
              step={1}
              onValueChange={(v) => setFontSize(single(v))}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <label>Line height</label>
              <span className="text-muted-foreground">
                {lineHeight.toFixed(1)}
              </span>
            </div>
            <Slider
              value={lineHeight}
              min={0.9}
              max={2.4}
              step={0.1}
              onValueChange={(v) => setLineHeight(single(v))}
            />
          </div>

          <div>
            <div className="mb-2 text-sm">Font family</div>
            <ToggleGroup
              value={[fontFamily]}
              onValueChange={(value) => {
                const next = (value as string[])[0];
                if (next === 'serif' || next === 'sans') setFontFamily(next);
              }}
              className="w-full"
            >
              <ToggleGroupItem value="serif" className="flex-1 font-reading">
                Serif
              </ToggleGroupItem>
              <ToggleGroupItem value="sans" className="flex-1 font-sans">
                Sans
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
