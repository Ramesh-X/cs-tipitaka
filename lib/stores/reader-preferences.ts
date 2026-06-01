'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CANONICAL_SCRIPT } from '@/lib/corpus';

export type FontFamily = 'serif' | 'sans';

export interface ReaderPreferences {
  /** Display script id (see SCRIPTS). Transliteration itself is placeholder. */
  script: string;
  /** Reading font size in px. */
  fontSize: number;
  /** Reading line height (unitless multiplier). */
  lineHeight: number;
  fontFamily: FontFamily;
  /** Whether the parallel translation column is shown. */
  showTranslation: boolean;
  /** Selected translation id. */
  translation: string;
  setScript: (script: string) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setFontFamily: (family: FontFamily) => void;
  toggleTranslation: () => void;
  setShowTranslation: (show: boolean) => void;
  setTranslation: (id: string) => void;
  reset: () => void;
}

const DEFAULTS = {
  script: CANONICAL_SCRIPT,
  fontSize: 19,
  lineHeight: 1.9,
  fontFamily: 'serif' as FontFamily,
  showTranslation: false,
  translation: 'sujato',
};

export const useReaderPreferences = create<ReaderPreferences>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setScript: (script) => set({ script }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      toggleTranslation: () =>
        set((s) => ({ showTranslation: !s.showTranslation })),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setTranslation: (translation) => set({ translation }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'tipitaka-reader-preferences' },
  ),
);
