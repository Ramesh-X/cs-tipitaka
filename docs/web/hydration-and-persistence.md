# Hydration and persisted preferences

`apps/web` is fully static (Astro SSG); interactivity comes from React islands hydrated independently on top of server-rendered HTML. Several preferences (theme, script, layout, typography) persist in `localStorage` via Zustand's `persist` middleware. Two related problems fall out of that combination, and the same two fixes recur across the codebase.

## Problem 1 — hydration mismatch

Zustand's `persist` middleware reads `localStorage` synchronously when the store module is created, not inside an effect. So by an island's first client render, the store already holds the persisted value — while the SSR HTML was built with defaults. Rendering the persisted value directly produces a server/client mismatch.

Fix: `lib/use-hydrated.ts`'s `useHydrated()` (via `useSyncExternalStore`) returns `false` on the server and on the first client render, `true` after. Every island that displays persisted state gates the *displayed* value on it:

```ts
const value = hydrated ? storeValue : DEFAULT;
```

Used in `ScriptSelector`, `TranslationPicker`, `TypographyControls`, `ThemeToggle`, `PaneCollapseToggle`, `DailyReflection`, and the `Pali` React component. `ThemeToggle` additionally keeps a local `override: 'light' | 'dark' | null` — `null` means "defer to whatever class the head script already put on `<html>`", so its first render matches the head script's state without re-reading `localStorage` itself.

## Problem 2 — flash of default content

Even once hydrated, an island only takes effect after its JS runs. Between first paint and hydration, a returning visitor would otherwise see the *default* state (Roman script, expanded panes, 19px serif) flash before snapping to their saved preference.

Fix: a family of inline `<script is:inline>` snippets in `Base.astro`'s `<head>`, one per preference, each reading its own `localStorage` key synchronously (before first paint) and setting an attribute/CSS variable directly on `<html>`. A paired CSS rule renders the final state immediately. The owning island clears the stand-in once it hydrates and takes over.

| Preference | Script | localStorage key | `<html>` stand-in | Owning island |
|---|---|---|---|---|
| Theme | `lib/theme.ts` | `theme` | `.dark` class | `ThemeToggle` |
| Script | `lib/transliterate-init.ts` | `tipitaka-reader-preferences` | `data-pending-script` | `Transliterator` |
| Layout | `lib/layout-init.ts` | `tipitaka-layout-preferences` | `data-nav-pending` / `data-outline-pending` | `PaneCollapseToggle` |
| Typography | `lib/typography-init.ts` | `tipitaka-reader-preferences` | `--reader-font-size` / `--reader-line-height` / `data-reader-font` | `TypographyControls` |

The paired CSS lives in `styles/global.css` (script, typography) and `components/corpus/corpus-layout.astro` (layout). Adding a new persisted, visible preference means adding a fifth row here, not inventing a new mechanism.

## `transition:persist`

Astro's ClientRouter can keep one DOM node and its mounted island alive across a soft navigation (`transition:persist`) instead of remounting it.

- `ThemeToggle` uses it — safe, no portal, everything is local DOM.
- `ScriptSelector`, `TranslationPicker`, `TypographyControls` deliberately do **not**. They use Base UI's `Select`/`Popover`, which render their open content through a React portal, and that portal content does not survive Astro's DOM swap correctly (observed: the popup reopens empty after a soft nav). Portal-based islands should remount fresh on every navigation.
