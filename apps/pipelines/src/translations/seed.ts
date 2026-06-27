import * as fs from 'fs';
import * as path from 'path';
import { parseArgs } from '../shared/args.ts';
import { TRANSLATIONS_DIR } from './constants.ts';
import { done, fail, info, ok, step, warn } from '../shared/logger.ts';
import { SqlWriter, writeTranslationRow } from '../shared/sql.ts';
import { executeSqlFile } from '../shared/wrangler.ts';

/**
 * Expected shape of each per-document translation file:
 *   data/translations/<document-slug-with-dashes>.json
 *   {
 *     "document_slug": "vinaya/parajikapali/veranjakandam",  // optional; derived from filename if absent
 *     "paragraphs": [
 *       { "position": 1, "translations": { "en": "…", "si": "…" } },
 *       { "position": 2, "translations": { "en": "…" } }
 *     ]
 *   }
 */

interface TranslationFile {
  document_slug?: string;
  paragraphs: Array<{
    position: number;
    translations: Record<string, string>;
  }>;
}

const args = parseArgs();

function slugFromFilename(filename: string): string {
  return path.basename(filename, '.json').replaceAll('--', '/');
}

function readTranslationFile(filePath: string): TranslationFile | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as TranslationFile;
  } catch (e) {
    warn(`failed to parse ${filePath}: ${String(e)}`);
    return null;
  }
}

function main(): void {
  if (!fs.existsSync(TRANSLATIONS_DIR)) {
    warn(`translations directory not found: ${TRANSLATIONS_DIR}`);
    warn(
      'Nothing to seed — create the directory and add per-document JSON files.',
    );
    process.exit(0);
  }

  const files = fs
    .readdirSync(TRANSLATIONS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(TRANSLATIONS_DIR, f));

  if (files.length === 0) {
    info('No translation files found — nothing to seed.');
    process.exit(0);
  }

  step(`Found ${files.length} translation file(s) in ${TRANSLATIONS_DIR}`);

  const writer = new SqlWriter();
  let totalRows = 0;
  let failures = 0;
  let fileErrors = 0;

  writer.writeLine('BEGIN;');
  writer.writeLine('');

  for (const filePath of files) {
    const data = readTranslationFile(filePath);
    if (!data) {
      fileErrors++;
      continue;
    }

    const document_slug = data.document_slug ?? slugFromFilename(filePath);

    let fileRows = 0;
    const langs = new Set<string>();

    for (const para of data.paragraphs) {
      for (const [lang, text] of Object.entries(para.translations)) {
        langs.add(lang);
        if (
          writeTranslationRow(
            writer,
            {
              document_slug,
              para_position: para.position,
              lang,
              text,
            },
            args.conflict,
          )
        ) {
          fileRows++;
          totalRows++;
        } else {
          failures++;
          warn(
            `translation "${document_slug}"[${para.position}][${lang}] skipped`,
          );
        }
      }
    }

    info(
      `${document_slug} → ${data.paragraphs.length} paragraphs, ` +
        `${fileRows} rows (langs: ${[...langs].join(', ')})`,
    );
  }

  writer.writeLine('');
  writer.writeLine('COMMIT;');
  writer.close();

  ok(`${totalRows} translation row(s) written to SQL`);

  if (fileErrors > 0) warn(`${fileErrors} file(s) failed to parse`);
  if (failures > 0) warn(`${failures} row(s) skipped (validation failed)`);

  ok(`SQL written to ${writer.path} (${writer.lineCount()} lines)`);

  if (failures > 0 || fileErrors > 0) {
    writer.cleanup();
    fail(`Aborting — ${failures + fileErrors} error(s), DB not seeded`);
    process.exit(1);
  }

  try {
    executeSqlFile(writer.path, args.remote);
    done('Translation seed complete');
  } finally {
    writer.cleanup();
  }
}

main();
