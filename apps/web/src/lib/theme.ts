/** Inline this in <head> to apply the stored theme before paint (no flash). */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

// Re-applied on astro:after-swap — docs/web/soft-navigation.md.
export function applyStoredTheme(): void {
  try {
    const t = localStorage.getItem('theme');
    const dark = t
      ? t === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch {}
}
