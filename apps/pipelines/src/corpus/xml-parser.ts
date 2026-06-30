import * as fs from 'fs';
import * as path from 'path';
import { parseXmlSections } from './xml/index.ts';
import type { ParsedParagraph } from './xml/index.ts';
import { CORPUS_ROMN_DIR } from './constants.ts';
import { readUtf16 } from '../shared/utf16.ts';
import { warn } from '../shared/logger.ts';

let cacheKey = '';
let cacheValue: ParsedParagraph[][] | null = null;

function getFileSections(filename: string): ParsedParagraph[][] | null {
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

  const sections = parseXmlSections(xmlText);
  cacheKey = filename;
  cacheValue = sections;
  return sections;
}

export function sectionCount(filename: string): number {
  return getFileSections(filename)?.length ?? 0;
}

export function parseSection(
  filename: string,
  sectionIdx: number,
): ParsedParagraph[] {
  const sections = getFileSections(filename);
  if (!sections) return [];
  if (sectionIdx >= sections.length) {
    warn(
      `sectionIdx ${sectionIdx} out of range (${sections.length} sections) in ${filename}`,
    );
    return [];
  }
  return sections[sectionIdx] ?? [];
}
