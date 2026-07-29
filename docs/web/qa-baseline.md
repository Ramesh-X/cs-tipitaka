# QA baseline — Phase 7

Measurements taken against `apps/web`'s production build (`pnpm run build` →
`astro preview`) after the M7.1–M7.6 work landed. Static checks (`pnpm run
parity`, see [content-parity.md](./content-parity.md)) run over all ~5,000
pages on every invocation; the numbers below are from tools that need a real
browser and were run against a representative sample.

## Lighthouse (desktop preset, `pnpm dlx lighthouse`)

| Page                                                                                                | Perf | A11y | LCP  | CLS   | TBT  | Failed a11y audits |
| --------------------------------------------------------------------------------------------------- | ---- | ---- | ---- | ----- | ---- | ------------------ |
| Home (`/`)                                                                                          | 100  | 100  | 0.6s | 0.031 | 0ms  | none               |
| Search (`/search`)                                                                                  | 100  | 100  | 0.6s | 0     | 0ms  | none               |
| Glossary (`/glossary`)                                                                              | 100  | 100  | 0.6s | 0.001 | 0ms  | none               |
| Median doc (`sutta/kn/dhammapadapali/yamakavaggo`, 46 paragraphs)                                   | 100  | 96   | 0.6s | 0     | 0ms  | `target-size`      |
| Large doc (`abhidhamma/yamakapali-3/indriyayamakam`, 4,465 paragraphs, 20,019 DOM elements, 1.75MB) | 100  | 96   | 0.5s | 0.003 | 30ms | `target-size`      |
| Large TOC (`/sutta`)                                                                                | 100  | 96   | 0.6s | 0     | 0ms  | `target-size`      |
| Reshaped collection (`abhidhamma/dhammasangganipali/atthakathakandam`, one of the 379 from M7.1)    | 100  | 96   | 0.6s | 0     | 0ms  | `target-size`      |

**Perf is 100 everywhere, including the largest document in the corpus** —
the M7.3a DOM-diet (removing the per-paragraph copy-toolbar duplication) and
the M7.3b chunked/viewport-prioritized transliterator are the reasons. Before
M7.3a, `dist/` was 1.08GB with an 11.25MB worst-case page; after, 722MB with a
2.09MB worst case (measured directly from build output, not Lighthouse — see
`docs/web/ui-behavior-notes.md`'s "Single shared copy-actions toolbar" entry).
TBT stays at 0ms on every page except the single largest document (30ms) —
nowhere near a perceptible-jank threshold.

**`target-size` is WCAG 2.2's SC 2.5.8, not WCAG 2.1 AA** (this project's
stated target per `docs/10-delivery-accessibility-community/full-accessibility.md`)
— SC 2.5.8 doesn't exist in 2.1. It flags the corpus-tree sidebar's ~19px-tall
navigation links (want 24px). Documented, not fixed — see
`docs/web/ui-behavior-notes.md`'s "Lighthouse `target-size` on the sidebar
tree" entry for why inflating a deep recursive tree's row height is a real
density tradeoff not taken lightly. A **different**, unambiguous `target-size`
finding (the home page's carousel pagination dots, 8px with 8px gaps) _was_
fixed — real WCAG 2.5.8 violation, zero-cost fix (24px tap target, same 8px
visual dot via an inner `<span>`).

Two genuine WCAG 2.1 AA `color-contrast` and one `target-size` finding were
caught and fixed during this pass — see "Alpha-modified text colors and
contrast" in `docs/web/ui-behavior-notes.md`.

## axe-core (`pnpm dlx @axe-core/cli`, tags `wcag2a,wcag2aa,wcag21aa`)

Home page: **0 violations.** Could not get a second reading — `@axe-core/cli`'s
bundled `chromedriver@151.0.1` ships its binary at `bin/chromedriver`, but the
`selenium-webdriver@4.44.0` version it pulls in still looks for
`lib/chromedriver/chromedriver` (a real upstream path mismatch between those
two package versions, worked around locally for the one successful run via a
symlink in the pnpm store — not a project change). The second issue
(chromedriver launching without `--no-sandbox` and exiting immediately) has no
clean pass-through flag in `@axe-core/cli`. Not pursued further — Lighthouse's
accessibility category runs the same axe-core rule engine via a different
harness (Puppeteer/CDP instead of Selenium) and covered all seven pages
without this issue, and `scripts/parity/checks/a11y-static.ts` covers
structural checks (landmarks, headings, skip link, link text, image alt) on
**all** ~5,000 pages on every `pnpm run parity` run — narrower rule coverage
than axe, but total page coverage.

## Manual keyboard / soft-nav walkthrough — not performed live

The plan called for a Chrome-automation-driven keyboard walkthrough of a
reader page (Tab order, focus rings, mobile menu / typography popover / pane
collapse operated by keyboard only, soft-nav focus restore). **Blocked in this
environment**: the sandboxed Chrome instance the browser-automation tools
drive cannot reach `localhost` (confirmed — it reaches `https://example.com`
fine but every `http://localhost:4321/...` navigation fails with "Frame with
ID 0 is showing error page", while `curl` from the same shell that runs
`astro preview` gets a clean 200 for the identical URL — the two run in
different network namespaces). CLI tools (Lighthouse, axe-core) run
server-side in this shell and aren't affected, which is why they worked.

What this leaves unverified: the actual keyboard focus order and visible
focus-ring rendering, and the `astro:after-swap` focus-restore-to-`#main`
behavior added in M7.2, in a real browser. The code implementing both was
reviewed carefully and typechecks/lints clean; Lighthouse's accessibility
audits (`focusable-controls`, `focus-traps`, `interactive-element-affordance`,
`logical-tab-order`, `managed-focus`, `visual-order-follows-dom`) all passed
on every page tested, which exercises much of the same ground via axe's
static analysis, but is not a substitute for actually pressing Tab. Whoever
runs M8.1's staging deploy should do this walkthrough for real before
sign-off — see `docs/nextjs-to-astro-migration.md`.

## Edge configuration — verified via build output, not `wrangler dev`

`wrangler dev` was not run in this environment (no attempt — `apps/api`'s
local dev server independently failed to start over an unrelated
`.wrangler/state` Miniflare version-compatibility error, see M7.5 in the
migration doc; the shared state directory holds the seeded corpus D1 data
this whole QA pass depends on, so it was left alone rather than risked).
Verified instead by inspecting `apps/web/wrangler.jsonc` and the built
`dist/_headers`/`dist/404.html` directly:

- `assets.html_handling: "drop-trailing-slash"` and
  `not_found_handling: "404-page"` are present in the config.
- `dist/404.html` exists and renders the piṭaka-links fallback page.
- `dist/_headers` has the immutable long-cache rule for `/_astro/*` and the
  `max-age=0, must-revalidate` rule for everything else.

The actual edge behavior (a request to `/sutta/` really 301s; `_headers` is
really honored) needs a real `wrangler dev` or staging deploy pass — tracked
under M8.1 in the migration doc, not claimed as done here.
