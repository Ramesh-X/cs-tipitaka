'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LayoutPreferences {
  navCollapsed: boolean;
  outlineCollapsed: boolean;
  toggleNav: () => void;
  toggleOutline: () => void;
  setNavCollapsed: (collapsed: boolean) => void;
  setOutlineCollapsed: (collapsed: boolean) => void;
}

export const useLayoutPreferences = create<LayoutPreferences>()(
  persist(
    (set) => ({
      navCollapsed: false,
      outlineCollapsed: false,
      toggleNav: () => set((s) => ({ navCollapsed: !s.navCollapsed })),
      toggleOutline: () =>
        set((s) => ({ outlineCollapsed: !s.outlineCollapsed })),
      setNavCollapsed: (navCollapsed) => set({ navCollapsed }),
      setOutlineCollapsed: (outlineCollapsed) => set({ outlineCollapsed }),
    }),
    { name: 'tipitaka-layout-preferences' },
  ),
);
