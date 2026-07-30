# Corpus data quirks

Non-obvious properties of the corpus data as represented in D1 and rendered
by `apps/web` — the kind of thing that's easy to mistake for a bug.

## 379 nodes render as collections (TOC pages), not documents

379 corpus nodes have their content split across multiple **child** documents
in D1, so instead of a full-text reading page they render a card grid of
child documents (`apps/web/src/pages/[...slug].astro`'s collection branch).

**This is intentional** — finer document boundaries keep reader pages from
growing larger than they already are (see the DOM-diet notes in
[ui-behavior-notes.md](./ui-behavior-notes.md)). No cross-document anchor
forwarding is implemented: the parent→child paragraph-offset mapping is only
approximate, and silently landing a reader on the wrong verse would be worse
than landing them on a TOC page with working links to the actual content.

**Consequence:** any `#para-N` fragment on these 379 URLs no-ops — the page
has no matching id, so the browser just doesn't scroll.

The full list, with each parent's D1 children, is in
`apps/web/scripts/parity/expected-exceptions.json`'s `collectionized` key.

## `deriveReaderSections` can drop the first paragraph

`deriveReaderSections()` (`apps/web/src/lib/corpus/reader.ts`) drops the first
paragraph whose `rend` is `chapter`/`title`/`subhead` _and_ whose text equals
the document's own title — avoiding a redundant heading directly under the
page's `<h1>`. This means the rendered `id="para-N"` set is not always a naive
contiguous `1..N`; the parity harness's anchor-sample check
(`apps/web/scripts/parity/checks/anchors.ts`) runs the real
`deriveReaderSections()` to compute the expected set per document rather than
assuming one, to avoid false-positiving on every document that drops a
self-title heading.

## Stray non-Latin codepoints in 26 documents' source text

`checkDecisionC`'s canonical-script guard (SSR HTML must stay Roman/IAST —
Decision C) flags 26 pages containing isolated Devanagari combining/vowel
characters (`ः` U+0903 VISARGA, `ौ` U+094C VOWEL SIGN AU, `ै` U+0948 VOWEL SIGN
AI) embedded as single stray characters inside otherwise pure-Latin text —
e.g. `abhisambuddhoः lokasmā` where the source clearly intends a plain colon
before "lokasmā" (a defining clause), not a Devanagari visarga. These are
isolated marks, not runs of readable Devanagari text, which rules out a
build-time transliteration leak (that would produce whole words/sentences in
the wrong script, not single stray combining characters).

This is a **pre-existing transcription artifact in the source TEI XML**,
almost certainly from an input-method slip during the original CST
digitization, where a Devanagari IME briefly leaked a combining mark into the
Roman-script edition. It's out of scope for `apps/web` to fix (a
`data/corpus` / `apps/pipelines` concern) and is recorded verbatim as
`nonLatinSourceData` in `apps/web/scripts/parity/expected-exceptions.json` so
the guard still catches a genuine _future_ transliteration leak without
re-flagging these 26 known pages every run.
