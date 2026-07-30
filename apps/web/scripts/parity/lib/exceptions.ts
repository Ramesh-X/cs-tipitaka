export interface ExpectedExceptions {
  /** Document slug -> D1 collection details. See docs/web/corpus-data-quirks.md. */
  collectionized: Record<
    string,
    { children: string[]; baselineParas: number; reason: string }
  >;
  /** Document slug -> paragraph-count divergence from the frozen baseline. See docs/web/corpus-data-quirks.md. */
  countDelta: Record<string, { baseline: number; web: number; reason: string }>;
  /**
   * URL paths whose canonical Roman/IAST source text contains a handful of
   * stray non-Latin combining/vowel-sign codepoints (visarga used in place
   * of a colon, misplaced vowel signs) — a pre-existing transcription
   * artifact in the source TEI XML, not a build-time transliteration leak.
   * See docs/web/corpus-data-quirks.md.
   */
  nonLatinSourceData: string[];
}
