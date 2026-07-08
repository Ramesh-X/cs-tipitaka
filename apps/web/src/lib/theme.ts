/** Inline this in <head> to apply the stored theme before paint (no flash). */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

// ClientRouter replaces <html> attributes wholesale on swap, so dark mode
// must be re-applied on astro:after-swap or it resets on every soft nav.
export function applyStoredTheme(): void {
  try {
    const t = localStorage.getItem('theme');
    const dark = t
      ? t === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch {}
}
