import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useEffect } from 'react';
import { useHydrated } from '@/lib/use-hydrated';
import { useLayoutPreferences } from '@/lib/stores/layout-preferences';
import { Button } from '@/components/ui/button';

interface Props {
  pane: 'nav' | 'outline';
}

export default function PaneCollapseToggle({ pane }: Props) {
  const hydrated = useHydrated();
  const navCollapsed = useLayoutPreferences((s) => s.navCollapsed);
  const outlineCollapsed = useLayoutPreferences((s) => s.outlineCollapsed);
  const toggleNav = useLayoutPreferences((s) => s.toggleNav);
  const toggleOutline = useLayoutPreferences((s) => s.toggleOutline);

  const isCollapsed = pane === 'nav' ? navCollapsed : outlineCollapsed;
  const visibleCollapsed = hydrated ? isCollapsed : false;
  const toggle = pane === 'nav' ? toggleNav : toggleOutline;
  const attr = pane === 'nav' ? 'data-nav-collapsed' : 'data-outline-collapsed';

  useEffect(() => {
    if (!hydrated) return;
    const container = document.querySelector('[data-corpus-layout]');
    if (container) {
      container.setAttribute(attr, String(isCollapsed));
    }
  }, [hydrated, isCollapsed, attr]);

  const CollapseIcon = pane === 'nav' ? PanelLeftClose : PanelRightClose;
  const ExpandIcon = pane === 'nav' ? PanelLeftOpen : PanelRightOpen;
  const label = visibleCollapsed
    ? `Expand ${pane === 'nav' ? 'navigation' : 'outline'} pane`
    : `Collapse ${pane === 'nav' ? 'navigation' : 'outline'} pane`;

  return (
    <div
      className={`mb-2 flex ${pane === 'outline' ? 'justify-end' : 'justify-start'}`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={hydrated ? toggle : undefined}
        aria-label={label}
        title={label}
        className="size-7 text-muted-foreground hover:text-foreground"
      >
        {visibleCollapsed ? (
          <ExpandIcon className="size-4" />
        ) : (
          <CollapseIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}
