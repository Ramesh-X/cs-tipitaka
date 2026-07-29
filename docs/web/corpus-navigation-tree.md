# Corpus sidebar tree

`components/corpus-tree-node.astro` recurses into a node's children only when that node is on the "active branch" — an ancestor of, or equal to, the current page's own slug. The whole site is prerendered (SSG): there is no client-side fetching for the tree, so for any sibling node _not_ on the active branch, its children were never queried or rendered into this page's HTML. There's no hidden/collapsed DOM to reveal for it — it genuinely isn't there. This is what the icon/label click behavior has to work around.

## Two render states, two click behaviors

**Expanded (on the active branch, children present in the DOM)** — rendered as a native `<details>`/`<summary>`:

- The chevron is a bare `<svg>` with no `href`, nested in `<summary>`. Clicking it only triggers `<summary>`'s built-in open/close toggle — plain browser mechanics, no JS, no navigation.
- The label is a real `<a>`, also nested in `<summary>`. Clicking it navigates. A single click event has one `defaultPrevented` flag; when ClientRouter calls `preventDefault()` to do a soft nav on that click, it also cancels the nested `<summary>`'s native toggle for the same event — so navigating away never leaves stray local toggle state behind (moot regardless, since the destination page renders its own tree from scratch).
- The chevron's rotation is driven by the _live_ `details[open]` attribute via a Tailwind `in-[details[open]>summary]` selector, not by the server-computed "expanded" flag, so it flips back automatically when a user closes a branch locally — no JS state needed.

**Not expanded (children not in the DOM)** — icon and label are one `<a>`: there's nothing to toggle locally, so either click just navigates to the node's page, which renders with that branch expanded (the visited node is now part of the active-branch chain).

## Ancestor matching

`currentSlug.startsWith(node.slug)` alone treats any node whose slug happens to be a raw string prefix of the current slug as an ancestor — e.g. `.../pacittiyakandam` would wrongly match `.../pacittiyakandam-bhikkhunivibhanggo`. The check requires a path-segment boundary: `currentSlug.startsWith(node.slug + '/')`.
