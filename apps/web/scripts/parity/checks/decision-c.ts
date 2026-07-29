import type { Report } from '../lib/report.ts';

// Markers that would only appear if translation content leaked into SSR HTML — Decision F.
const TRANSLATION_MARKERS = [
  'data-nosnippet',
  'data-translation-cell',
  'reader-translation-attribution',
];

// Fast combined test first (single native regex pass); only on a hit do we run the
// per-script regexes below to name the culprit — avoids paying that cost on every page.
// Exported so generate-exceptions.ts can detect the same thing it's excusing.
export const NON_LATIN_RE = /[ऀ-ॿ඀-෿က-႟฀-๿]/;
const NON_LATIN_SCRIPTS: [RegExp, string][] = [
  [/[ऀ-ॿ]/, 'Devanagari'],
  [/[඀-෿]/, 'Sinhala'],
  [/[က-႟]/, 'Myanmar'],
  [/[฀-๿]/, 'Thai'],
];

/**
 * Decision C/F: the prerendered page must stay canonical Roman/IAST and
 * translation-free — both are runtime, in-browser enhancements, never SSR'd.
 *
 * `knownSourceDataAnomalies` is the recorded, bounded set of pages whose
 * *source* text carries a handful of stray non-Latin combining/vowel-sign
 * codepoints (a pre-existing transcription artifact, not a build-time
 * transliteration leak) — see docs/web/content-parity.md. Anything outside
 * that set still fails: this guard exists to catch a *future* leak.
 */
export function checkDecisionC(
  report: Report,
  urlPath: string,
  html: string,
  knownSourceDataAnomalies: Set<string>,
): void {
  for (const marker of TRANSLATION_MARKERS) {
    if (html.includes(marker)) {
      report.fail(
        'decision-c',
        `translation artifact "${marker}" present in SSR HTML`,
        urlPath,
      );
    }
  }

  if (NON_LATIN_RE.test(html) && !knownSourceDataAnomalies.has(urlPath)) {
    const hit = NON_LATIN_SCRIPTS.find(([re]) => re.test(html));
    report.fail(
      'decision-c',
      `non-Latin (${hit?.[1] ?? 'unknown'}) codepoint in SSR HTML — canonical-script leak`,
      urlPath,
    );
  }
}
