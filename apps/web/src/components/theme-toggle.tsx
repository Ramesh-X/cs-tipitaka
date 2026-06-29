import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useHydrated } from '@/lib/use-hydrated';

export function ThemeToggle() {
  const hydrated = useHydrated();
  // `null` means "follow whatever the <head> script already set on <html>".
  const [override, setOverride] = React.useState<'light' | 'dark' | null>(null);

  const domDark =
    hydrated && document.documentElement.classList.contains('dark');
  const isDark = override ? override === 'dark' : domDark;

  function toggle() {
    const next = isDark ? 'light' : 'dark';
    setOverride(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore */
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
    >
      {hydrated && isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
