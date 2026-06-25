'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CANONICAL_SCRIPT } from '@/lib/corpus/constants';

export type FontFamily = 'serif' | 'sans';
export type ScriptSource = 'default' | 'auto' | 'user';

export interface ReaderPreferences {
  script: string;
  scriptSource: ScriptSource;
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
  showTranslation: boolean;
  language: string;
  setScript: (script: string) => void;
  applyAutoScript: (script: string) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setFontFamily: (family: FontFamily) => void;
  toggleTranslation: () => void;
  setShowTranslation: (show: boolean) => void;
  setLanguage: (id: string) => void;
  reset: () => void;
}

export const DISPLAY_DEFAULTS = {
  fontSize: 19,
  lineHeight: 1.5,
  fontFamily: 'serif' as FontFamily,
  showTranslation: false,
  language: 'en',
};

const DEFAULTS = {
  script: CANONICAL_SCRIPT,
  scriptSource: 'default' as ScriptSource,
  ...DISPLAY_DEFAULTS,
};

export const useReaderPreferences = create<ReaderPreferences>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setScript: (script) => set({ script, scriptSource: 'user' }),
      applyAutoScript: (script) =>
        set((s) =>
          s.scriptSource === 'default' ? { script, scriptSource: 'auto' } : s,
        ),
      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      toggleTranslation: () =>
        set((s) => ({ showTranslation: !s.showTranslation })),
      setShowTranslation: (showTranslation) => set({ showTranslation }),
      setLanguage: (language) => set({ language }),
      reset: () => set(DISPLAY_DEFAULTS),
    }),
    { name: 'tipitaka-reader-preferences' },
  ),
);
