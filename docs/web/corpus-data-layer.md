# Corpus data layer (`apps/web/src/lib/corpus`)

`packages/corpus` owns the DB-backed repositories; this layer is a thin, async, build-time-only presentation layer over it. Every function takes an explicit `CorpusDB` (from `getLocalDb()`, memoized) — there's no ambient/global DB handle, per `AGENTS.md`'s package boundaries.

## Node shape

`NodeWithMeta`'s display-name field is `pali`. Code that branches on their presence (JSON-LD descriptions, page `<meta name="description">`) has a plain fallback if `blurb` is missing; today, that fallback branch is the only one that ever runs.

## Build-time memoization

`navigation.ts` and `data.ts` memoize the document list/tree into module-level singletons on first call (`documentEntries`, `documentIndexByPath`, `nodesCache`, etc.), keyed by nothing — correct because this is a single static build calling `getLocalDb()`'s one memoized DB instance. If this layer were ever reused across more than one `CorpusDB` in the same process (e.g. a future test suite), these caches would need re-keying by DB identity.

## Page titles collide on raw `pali`

Plenty of nodes across the tree share a generic `pali` name (dozens of "2. Dutiyavaggo", etc.), so `pages/[...slug].astro` disambiguates the `<title>` with the immediate parent crumb rather than using `node.pali` alone.
