import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CANONICAL_SCRIPT } from '@cs-tipitaka/shared';

export type FontFamily = 'serif' | 'sans';
/** 'default' = untouched; 'auto' = set by detection; 'user' = explicit, never auto-overridden. */
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

export const TYPOGRAPHY_DEFAULTS = {
  fontSize: 19,
  lineHeight: 1.5,
  fontFamily: 'serif' as FontFamily,
};

export const DISPLAY_DEFAULTS = {
  ...TYPOGRAPHY_DEFAULTS,
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
      // No-op unless scriptSource is still 'default'.
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
      // Typography only, deliberately — docs/web/ui-behavior-notes.md.
      reset: () => set(TYPOGRAPHY_DEFAULTS),
    }),
    { name: 'tipitaka-reader-preferences' },
  ),
);
