# Soft navigation (Astro ClientRouter)

Astro's `ClientRouter` intercepts in-app link clicks and does a fetch-and-swap instead of a full page load. Central fact this whole doc follows from: **on swap, ClientRouter replaces `<html>`'s attributes and classes wholesale** from the freshly-fetched document. Anything set directly on `<html>` client-side (dark class, pending-script attributes, etc.) reverts unless it's explicitly reapplied.

## Reapplying preferences across a swap

`layouts/Base.astro` has one inline module `<script>` with two handlers:

- **`astro:before-swap`** — `applyPrefs(event.newDocument)` mutates the _incoming_ document while it's still off-screen: re-transliterates `[data-pali]`, reapplies font-size/line-height/family, reapplies the nav and outline collapsed attributes. Its transliteration branch must stay in lockstep with `components/reader/transliterator.tsx`'s hydrated rewrite — same `data-latn`/`data-latn-html` caching contract (see [scripts-and-transliteration.md](./scripts-and-transliteration.md)).
- **`astro:after-swap`** — reapplies theme (`applyStoredTheme()`, since `lib/theme.ts`'s FOUC script only runs on a hard load) and restores the nav pane's scroll position, which isn't part of the incoming document.

## `astro:page-load` and idempotent init

`astro:page-load` fires on the initial hard load _and_ on every soft navigation. Inline `<script>`s that bind DOM listeners (the mobile menu toggle in `site-header.astro`, the reader's `section-nav.astro` scrollspy, the copy actions in `reader-copy-actions.astro`) call the same `init()` on both the initial module evaluation and this event — and `init()` must be idempotent, since it can run more than once against the same DOM (guarded with a dataset/module flag).

## Listener scope has to match what survives

Bind a listener at the scope of whatever needs to hear it for its whole lifetime — not wherever is convenient:

- The mobile menu's Escape-key handler is bound on `document` once, at module scope, **outside** `init()`. `document` survives a soft nav; the `<header>` (and its `#menu-toggle`) do not — they're swapped like the rest of the page. Binding it inside `init()` would add one more `document`-level listener on every soft navigation, each closing over an already-detached subtree, with no way to remove the earlier ones.
- Anything that owns a resource tied to the _current_ page's DOM (`section-nav.astro`'s `IntersectionObserver`) must tear it down before wiring a new one — unconditionally, before any early return — or leaving a reader page for one with no section nav leaves the observer watching detached heading nodes.
- Module-scoped caches (`reader-translations.tsx`'s `translationCache`) live outside the component on purpose: the island unmounts/remounts on soft nav, the cache doesn't, so a translation already fetched once isn't refetched on every visit to the same document.

## Query-string state

`search-experience.tsx` reads `location.search` once on mount to seed React state — a deliberate one-way sync of external state in, kept minimal because the page itself must stay a static asset (no server-side query handling). When it pushes a new URL, it reuses `history.state` (ClientRouter's own scroll/index bookkeeping) rather than clobbering it with `null`.
