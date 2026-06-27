import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { CORPUS_ROMN_DIR, LABEL_RENDS } from './constants.ts';
import { readUtf16 } from '../shared/utf16.ts';
import { warn } from '../shared/logger.ts';
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

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: false,
  preserveOrder: true,
});

function chapterPositions(ps: ON[]): number[] {
  return ps
    .map((p, i) => (attrOf(p, 'rend') === 'chapter' ? i : -1))
    .filter((i) => i >= 0);
}

function hasIntroBefore(ps: ON[], firstChapter: number): boolean {
  return ps
    .slice(0, firstChapter)
    .some((p) => !LABEL_RENDS.has(attrOf(p, 'rend')));
}

function countLeafFlatSections(node: ON): number {
  const ps = elemChildren(node, 'p');
  const chapters = chapterPositions(ps);
  if (chapters.length === 0) return 0;
  const total = chapters.length + (hasIntroBefore(ps, chapters[0]) ? 1 : 0);
  return total >= 2 ? total : 0;
}

function buildFlatParagraphs(ps: ON[]): ParsedParagraph[] {
  const results: ParsedParagraph[] = [];
  for (const p of ps) {
    const para = paragraphFrom(p, 'bodytext');
    if (para) results.push(para);
  }
  return results;
}

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
        warn(`flat sectionIdx ${sectionIdx} out of range in ${filename}`);
        return [];
      }
      start = chapters[ci];
      end = chapters[ci + 1] ?? ps.length;
    }
  } else {
    if (sectionIdx >= chapters.length) {
      warn(`flat sectionIdx ${sectionIdx} out of range in ${filename}`);
      return [];
    }
    start = chapters[sectionIdx];
    end = chapters[sectionIdx + 1] ?? ps.length;
  }
  return buildFlatParagraphs(ps.slice(start, end));
}

function extractParagraphsFromDiv(div: ON): ParsedParagraph[] {
  const results: ParsedParagraph[] = [];
  for (const head of elemChildren(div, 'head')) {
    const para = paragraphFrom(head, 'chapter');
    if (para) results.push(para);
  }
  for (const p of elemChildren(div, 'p')) {
    const para = paragraphFrom(p, 'bodytext');
    if (para) results.push(para);
  }
  return results;
}

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
  for (const node of kids.slice(start, end)) {
    const tag = tagOf(node);
    if (tag !== 'p' && tag !== 'head') continue;
    const para = paragraphFrom(node, tag === 'head' ? 'chapter' : 'bodytext');
    if (para) results.push(para);
  }
  return results;
}

function collectLeafSections(div: ON): ON[] {
  const children = elemChildren(div, 'div');
  if (children.length === 0) return [div];
  return children.flatMap(collectLeafSections);
}

type LeafEntry = {
  node: ON;
  hybridSub?: number;
  flatSub?: number;
};

type FileSections =
  | { kind: 'flat'; body: ON }
  | { kind: 'div'; leaves: LeafEntry[] };

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

let cacheKey = '';
let cacheValue: FileSections | null = null;

function getFileSections(filename: string): FileSections | null {
  if (cacheKey === filename && cacheValue) return cacheValue;

  const filePath = path.join(CORPUS_ROMN_DIR, filename);
  if (!fs.existsSync(filePath)) {
    warn(`file not found: ${filePath}`);
    return null;
  }

  let xmlText: string;
  try {
    xmlText = readUtf16(filePath);
  } catch {
    warn(`failed to read: ${filePath}`);
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

export function sectionCount(filename: string): number {
  const plan = getFileSections(filename);
  if (!plan) return 0;
  if (plan.kind === 'div') return plan.leaves.length;
  const ps = elemChildren(plan.body, 'p');
  const chapters = chapterPositions(ps);
  if (chapters.length === 0) return 1;
  return chapters.length + (hasIntroBefore(ps, chapters[0]) ? 1 : 0);
}

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
    warn(
      `sectionIdx ${sectionIdx} out of range (${plan.leaves.length} sections) in ${filename}`,
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
  return extractParagraphsFromDiv(node);
}
