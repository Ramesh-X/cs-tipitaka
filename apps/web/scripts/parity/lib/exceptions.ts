export interface ExpectedExceptions {
  /** Legacy document slug -> D1 collection details. See docs/web/content-parity.md. */
  collectionized: Record<
    string,
    { children: string[]; legacyParas: number; reason: string }
  >;
  /** Legacy document slug -> paragraph-count divergence. See docs/web/content-parity.md. */
  countDelta: Record<string, { legacy: number; web: number; reason: string }>;
  /**
   * URL paths whose canonical Roman/IAST source text contains a handful of
   * stray non-Latin combining/vowel-sign codepoints (visarga used in place
   * of a colon, misplaced vowel signs) — a pre-existing transcription
   * artifact in the source TEI XML, not a build-time transliteration leak.
   * See docs/web/content-parity.md.
   */
  nonLatinSourceData: string[];
}
