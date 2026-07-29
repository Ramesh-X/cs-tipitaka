# apps/web architecture notes

Implementation-level rationale for non-obvious decisions in `apps/web` — the kind of thing that used to live as inline comments. The code is kept close to comment-free; when something looks removable, redundant, or wrong, check here before "cleaning it up."

This folder explains _how the current implementation works and why_, for whoever is reading the code next.

## Index

- [hydration-and-persistence.md](./hydration-and-persistence.md) — islands, `useHydrated()`, and the pre-paint `<head>` script family that prevents a flash of default state for returning visitors.
- [soft-navigation.md](./soft-navigation.md) — Astro ClientRouter: what survives a soft nav, what doesn't, and the listener/observer lifecycle rules that follow from it.
- [corpus-navigation-tree.md](./corpus-navigation-tree.md) — why the sidebar tree is only ever partially rendered, and how its icon/label click behavior works without client-side routing logic.
- [scripts-and-transliteration.md](./scripts-and-transliteration.md) — canonical Roman/IAST + client-side transliteration into 17 scripts, glossary linking, and the escaping rules around both.
- [corpus-data-layer.md](./corpus-data-layer.md) — the `apps/web/src/lib/corpus` presentation layer over `packages/corpus`: shape, caching assumptions.
- [ui-behavior-notes.md](./ui-behavior-notes.md) — smaller, self-contained decisions (reset semantics, copy-button feedback, carousel a11y, daily reflection, editorial content rules) that don't need their own page.
- [content-parity.md](./content-parity.md) — measured divergences between `apps/legacy-next` and `apps/web`'s corpus output (the 379 reshaped URLs, 4 paragraph-count deltas, 26 source-data anomalies) and the `scripts/parity/` harness that guards them.
- [qa-baseline.md](./qa-baseline.md) — Lighthouse/axe numbers, what they found (and what got fixed), and what this environment couldn't verify live (keyboard walkthrough, `wrangler dev`).
