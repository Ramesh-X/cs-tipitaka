# Scripts, transliteration, and glossary linking

## One canonical script, server-side

The corpus is stored, and the server always renders, in exactly one script: Roman/IAST (`CANONICAL_SCRIPT = 'latn'` in `@cs-tipitaka/shared`). This is deliberate for SEO/AI-crawler purposes — crawlers never execute JS, so they always see one canonical, citable text, never a locale-guessed or client-chosen one. See `docs/SEO.md` and `docs/02-seo-crawlability/`.

## Client-side transliteration

`components/reader/transliterator.tsx` (a React island) walks every `[data-pali]` element and rewrites it into the visitor's chosen script (17 available, converted via `@pnfo/pali-converter`). The first rewrite for a given element stashes the original Roman text — and, if the element has element children (i.e. it contains a glossary link), the original `innerHTML` — on `data-latn`/`data-latn-html`. Every later script switch converts from that pristine original rather than re-converting an already-converted string, so glossary-link markup survives round-tripping through non-Latin scripts, and repeated switching never compounds errors. `layouts/Base.astro`'s `astro:before-swap` handler duplicates this same stash-then-convert logic for the incoming document on soft navigation; the two must stay in lockstep (see [soft-navigation.md](./soft-navigation.md)).

`components/reader/script-auto-detect.tsx` guesses a script from the visitor's timezone/language on first visit, but only while `scriptSource === 'default'` — an explicit user choice (`scriptSource: 'user'`) or a prior auto-detection (`'auto'`) is never overridden by a later auto-detect pass.

## Glossary linking

`lib/corpus/glossary-linker.ts` only runs over Roman body/verse text, and only wraps the *first* occurrence of each term per paragraph. Terms are matched longest-first (so "Paṭiccasamuppāda" wins over any shorter term that might otherwise match part of it before "Sutta" would), and a Unicode-aware boundary check skips mid-word occurrences. It returns pre-escaped HTML for Astro's `set:html` — every dynamic slice of text is escaped before concatenation, so this is safe against markup injection even though the result is injected unescaped.

## `set:html` escaping elsewhere

`components/json-ld.astro` also uses `set:html` to inject `JSON.stringify(data)`, which does not escape `<`. A corpus-derived string containing `</script>` would otherwise prematurely close the tag, so `<` is replaced with its Unicode escape before injecting.
