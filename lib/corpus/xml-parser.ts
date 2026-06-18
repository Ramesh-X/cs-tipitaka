import * as path from 'path';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { readUtf16 } from './utf16.ts';
import {
  type ON,
  type ParsedParagraph,
  attrOf,
  chapterCount,
  childrenOf,
  elemChildren,
  paragraphFrom,
  tagOf,
} from './xml-nodes.ts';

export type { ParsedParagraph } from './xml-nodes.ts';

const CORPUS_ROMN_DIR = path.join(process.cwd(), 'corpus', 'romn');

/** preserveOrder keeps mixed text/`<hi>` content in document order. */
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,
  parseTagValue: false, // keep text verbatim — never coerce "108." to a number
  trimValues: false,
  preserveOrder: true,
});

const LABEL_RENDS = new Set(['nikaya', 'book', 'centre', 'title']);

/* -------------------------------------------------------------------------- */
/*  Section extraction                                                        */
/* -------------------------------------------------------------------------- */

/** Converts a leaf div's `<head>`s then `<p>`s into ParsedParagraph[]. */
function extractParagraphsFromDiv(
  div: ON,
  startIdx: number,
): ParsedParagraph[] {
  const results: ParsedParagraph[] = [];
  let idx = startIdx;
  for (const head of elemChildren(div, 'head')) {
    const para = paragraphFrom(head, idx, 'chapter');
    if (para) {
      results.push(para);
      idx++;
    }
  }
  for (const p of elemChildren(div, 'p')) {
    const para = paragraphFrom(p, idx, 'bodytext');
    if (para) {
      results.push(para);
      idx++;
    }
  }
  return results;
}

/** Indices of `<p>` children that are chapter boundaries. */
function chapterPositions(ps: ON[]): number[] {
  return ps
    .map((p, i) => (attrOf(p, 'rend') === 'chapter' ? i : -1))
    .filter((i) => i >= 0);
}

/** Whether non-label content precedes the first chapter heading (→ an intro section). */
function hasIntroBefore(ps: ON[], firstChapter: number): boolean {
  return ps
    .slice(0, firstChapter)
    .some((p) => !LABEL_RENDS.has(attrOf(p, 'rend')));
}

/**
 * Counts chapter-delimited sections in a `<p rend="chapter">`-bounded leaf, with
 * pre-first-chapter content as a separate intro (section 0). Returns 0 when no
 * flat splitting is needed. The build reconciles this against CSCD's reference
 * count and folds the intro into the first chapter when CSCD did not number it.
 */
function countLeafFlatSections(node: ON): number {
  const ps = elemChildren(node, 'p');
  const chapters = chapterPositions(ps);
  if (chapters.length === 0) return 0;
  const total = chapters.length + (hasIntroBefore(ps, chapters[0]) ? 1 : 0);
  return total >= 2 ? total : 0;
}

/** Maps a run of `<p>` nodes to ParsedParagraph[], skipping empties. */
function buildFlatParagraphs(ps: ON[]): ParsedParagraph[] {
  const results: ParsedParagraph[] = [];
  let idx = 1;
  for (const p of ps) {
    const para = paragraphFrom(p, idx, 'bodytext');
    if (para) {
      results.push(para);
      idx++;
    }
  }
  return results;
}

/**
 * Extracts the Nth `<p rend="chapter">`-delimited section from a flat body or a
 * pseudo-flat leaf div; pre-first-chapter content is the intro (section 0).
 */
function extractFlatSection(
  node: ON,
  sectionIdx: number,
  filename: string,
): ParsedParagraph[] {
  const ps = elemChildren(node, 'p');
  const chapters = chapterPositions(ps);
  const firstChapter = chapters[0] ?? ps.length;
  const hasIntro = hasIntroBefore(ps, firstChapter);

  let start: number;
  let end: number;
  if (hasIntro) {
    if (sectionIdx === 0) {
      start = 0;
      end = firstChapter;
    } else {
      const ci = sectionIdx - 1;
      if (ci >= chapters.length) {
        console.warn(
          `[corpus-xml-parser] flat sectionIdx ${sectionIdx} out of range ` +
            `(${chapters.length + 1} sections) in ${filename}`,
        );
        return [];
      }
      start = chapters[ci];
      end = chapters[ci + 1] ?? ps.length;
    }
  } else {
    if (sectionIdx >= chapters.length) {
      console.warn(
        `[corpus-xml-parser] flat sectionIdx ${sectionIdx} out of range ` +
          `(${chapters.length} sections) in ${filename}`,
      );
      return [];
    }
    start = chapters[sectionIdx];
    end = chapters[sectionIdx + 1] ?? ps.length;
  }
  return buildFlatParagraphs(ps.slice(start, end));
}

/**
 * Extracts the Nth section from a hybrid leaf div with mixed `<p>`/`<head>`
 * chapter markers. preserveOrder keeps them interleaved, so the slice is taken
 * in true document order — no raw-XML scanning needed.
 */
function extractHybridSection(div: ON, subIdx: number): ParsedParagraph[] {
  const kids = childrenOf(div);
  const markers = kids
    .map((c, i) =>
      (tagOf(c) === 'p' || tagOf(c) === 'head') &&
      attrOf(c, 'rend') === 'chapter'
        ? i
        : -1,
    )
    .filter((i) => i >= 0);
  if (subIdx >= markers.length) return [];

  const start = markers[subIdx];
  const end = markers[subIdx + 1] ?? kids.length;

  const results: ParsedParagraph[] = [];
  let idx = 1;
  for (const node of kids.slice(start, end)) {
    const tag = tagOf(node);
    if (tag !== 'p' && tag !== 'head') continue;
    const para = paragraphFrom(
      node,
      idx,
      tag === 'head' ? 'chapter' : 'bodytext',
    );
    if (para) {
      results.push(para);
      idx++;
    }
  }
  return results;
}

/* ----------- File parsing + section enumeration (memoized per file) -------- */

type LeafEntry = {
  node: ON;
  hybridSub?: number; // mixed <p>/<head> chapter markers
  flatSub?: number; // pure <p rend="chapter"> markers
};

type FileSections =
  | { kind: 'flat'; body: ON }
  | { kind: 'div'; leaves: LeafEntry[] };

/** Recursively collects leaf divs (no child `<div>`), unwrapping containers. */
function collectLeafSections(div: ON): ON[] {
  const children = elemChildren(div, 'div');
  if (children.length === 0) return [div];
  return children.flatMap(collectLeafSections);
}

/** Builds the flat-vs-div section plan for a parsed body. */
function planSections(body: ON): FileSections {
  const bodyDivs = elemChildren(body, 'div');
  if (bodyDivs.length === 0) return { kind: 'flat', body };

  const leaves: LeafEntry[] = [];
  for (const bookDiv of bodyDivs) {
    const bookChildren = elemChildren(bookDiv, 'div');
    const leafDivs =
      bookChildren.length === 0
        ? [bookDiv]
        : bookChildren.flatMap(collectLeafSections);

    for (const leaf of leafDivs) {
      const headChapters = chapterCount(leaf, 'head');
      const pChapters = chapterCount(leaf, 'p');

      if (headChapters >= 1 && pChapters >= 1) {
        const total = headChapters + pChapters;
        for (let i = 0; i < total; i++) {
          leaves.push({ node: leaf, hybridSub: i });
        }
      } else {
        const flatCount = countLeafFlatSections(leaf);
        if (flatCount > 0) {
          for (let i = 0; i < flatCount; i++) {
            leaves.push({ node: leaf, flatSub: i });
          }
        } else {
          leaves.push({ node: leaf });
        }
      }
    }
  }
  return { kind: 'div', leaves };
}

// Size-1 cache: the build processes a source file's sections consecutively, so
// caching the most recent file's parse collapses N re-parses into one.
let cacheKey = '';
let cacheValue: FileSections | null = null;

function getFileSections(filename: string): FileSections | null {
  if (cacheKey === filename && cacheValue) return cacheValue;

  const filePath = path.join(CORPUS_ROMN_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[corpus-xml-parser] File not found: ${filePath}`);
    return null;
  }

  let xmlText: string;
  try {
    xmlText = readUtf16(filePath);
  } catch {
    console.warn(`[corpus-xml-parser] Failed to read: ${filePath}`);
    return null;
  }

  const root = xmlParser.parse(xmlText) as ON[];
  const tei = root.find((n) => tagOf(n) === 'TEI.2');
  const textNode = tei && childrenOf(tei).find((n) => tagOf(n) === 'text');
  const body =
    textNode && childrenOf(textNode).find((n) => tagOf(n) === 'body');
  if (!body) return null;

  const plan = planSections(body);
  cacheKey = filename;
  cacheValue = plan;
  return plan;
}

/**
 * Number of sections the parser naturally enumerates for a file: chapters plus a
 * leading intro when present (flat files), or the leaf-section count (div-based).
 * The build compares this to CSCD's reference count to decide whether CSCD
 * numbered the intro separately or folded it into the first chapter.
 */
export function sectionCount(filename: string): number {
  const plan = getFileSections(filename);
  if (!plan) return 0;
  if (plan.kind === 'div') return plan.leaves.length;
  const ps = elemChildren(plan.body, 'p');
  const chapters = chapterPositions(ps);
  if (chapters.length === 0) return 1;
  return chapters.length + (hasIntroBefore(ps, chapters[0]) ? 1 : 0);
}

/**
 * Parses a section from a corpus XML source file.
 *
 * `sectionIdx` is a depth-first flat index into the file's leaf sections
 * (div-based files) or a 0-based index into `<p rend="chapter">` heading
 * positions (flat files).
 */
export function parseSection(
  filename: string,
  sectionIdx: number,
): ParsedParagraph[] {
  const plan = getFileSections(filename);
  if (!plan) return [];

  if (plan.kind === 'flat') {
    return extractFlatSection(plan.body, sectionIdx, filename);
  }

  if (sectionIdx >= plan.leaves.length) {
    console.warn(
      `[corpus-xml-parser] sectionIdx ${sectionIdx} out of range ` +
        `(${plan.leaves.length} leaf sections) in ${filename}`,
    );
    return [];
  }

  const { node, hybridSub, flatSub } = plan.leaves[sectionIdx];
  if (hybridSub !== undefined) return extractHybridSection(node, hybridSub);
  if (flatSub !== undefined) {
    return extractFlatSection(
      node,
      flatSub,
      `${filename}:${attrOf(node, 'n')}`,
    );
  }
  return extractParagraphsFromDiv(node, 1);
}
