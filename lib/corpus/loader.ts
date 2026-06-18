import 'server-only';

import * as fs from 'fs';
import * as path from 'path';
import type { DocumentContent } from '@/lib/corpus/constants';

const DOCS_DIR = path.join(process.cwd(), 'lib', 'corpus', 'generated', 'docs');

/**
 * Loads the DocumentContent for a leaf node identified by its slug path.
 *
 * The slug path is joined with `--` to form the generated filename, matching
 * the key written by `scripts/build-corpus.ts`. Returns null only when the file
 * is genuinely absent (which, for a node typed `document`, indicates a build
 * problem — the prebuild writes a file for every document node).
 *
 * Server-only — uses fs.readFileSync; must not be imported by client components.
 */
export function loadDocument(slugPath: string[]): DocumentContent | null {
  const filePath = path.join(DOCS_DIR, `${slugPath.join('--')}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DocumentContent;
  } catch {
    return null;
  }
}
