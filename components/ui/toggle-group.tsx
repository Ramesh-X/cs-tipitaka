'use client';

import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';

import { cn } from '@/lib/utils';

function ToggleGroup({
  className,
  multiple = false,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive>) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      multiple={multiple}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border bg-background p-1',
        className,
      )}
      {...props}
    />
  );
}

function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof TogglePrimitive>) {
  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2.5 text-sm font-medium transition-colors outline-none select-none',
        'hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
        'data-[pressed]:bg-primary data-[pressed]:text-primary-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
