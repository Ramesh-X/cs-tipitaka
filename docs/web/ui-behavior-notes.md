# Smaller UI decisions

Self-contained rationale that doesn't need its own page.

**Reader preferences reset** (`lib/stores/reader-preferences.ts`) — the Display popover's "Reset to defaults" calls `reset()`, which restores only `TYPOGRAPHY_DEFAULTS` (`fontSize`/`lineHeight`/`fontFamily`). It never touches `showTranslation`/`language`, which belong to the separate Translation control — a shared `DISPLAY_DEFAULTS` here would silently switch translations off from an unrelated button.

**Copy-paragraph feedback** (`components/reader/paragraph-block.astro`) — the 1.5s check-mark swap guards re-entry with a `data-copied` flag. Without it, a second click inside the feedback window captures the check-mark SVG itself as the "original" to restore to, leaving the icon stuck on the check-mark permanently.

**Start-texts carousel** (`components/start-texts/start-texts-carousel.tsx`) — auto-advances every 7s but pauses on hover/focus and is skipped entirely under `prefers-reduced-motion`. Required by WCAG 2.2.2: moving content that lasts more than 5 seconds must be pausable.

**Unreachable node throw** (`pages/[...slug].astro`) — the `!node` branch can't actually happen (every slug comes from `getAllPaths`, which is also what `getStaticPaths` enumerates from), so it throws instead of redirecting to a fake `/404`. A build-time throw surfaces a corpus/build inconsistency immediately instead of shipping a broken page.

**Daily reflection** (`components/daily-reflection/daily-reflection.tsx`) — the index is derived from the UTC day number (`Date.now() / 86_400_000`), not `Math.random()`, so the passage is stable for the whole calendar day, matching the "Today's reflection" label. Server and first client render always show `REFLECTIONS[0]` (no date math in the committed markup); the real day's entry appears once `useHydrated()` flips (see [hydration-and-persistence.md](./hydration-and-persistence.md)).

**Reflection content is curated, not generated** (`components/daily-reflection/reflections*.ts`) — every Pāli passage and `href` must be copied verbatim from a real built page and verified to resolve. A misquoted or dead-linked verse is worse than none.
