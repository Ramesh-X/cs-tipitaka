import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  NodeSchema,
  ParagraphSchema,
  TranslationSchema,
} from '@cs-tipitaka/corpus';
import type { Node, Paragraph, Translation } from '@cs-tipitaka/corpus';
import type { SeedArgs } from './args.ts';
import { warn } from './logger.ts';

export function esc(s: string | null | undefined): string {
  if (s == null) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

export class SqlWriter {
  private fd: number;
  readonly path: string;
  private lines = 0;

  constructor() {
    this.path = path.join(os.tmpdir(), `corpus-seed-${Date.now()}.sql`);
    this.fd = fs.openSync(this.path, 'w');
  }

  writeLine(line: string): void {
    fs.writeSync(this.fd, line + '\n');
    this.lines++;
  }

  lineCount(): number {
    return this.lines;
  }

  close(): void {
    fs.closeSync(this.fd);
  }

  cleanup(): void {
    try {
      fs.unlinkSync(this.path);
    } catch {
      // best-effort
    }
  }
}

export function buildNodeInsert(
  data: unknown,
  conflict: SeedArgs['conflict'],
): { sql: string | null; error: string | null } {
  const result = NodeSchema.safeParse(data);
  if (!result.success) {
    return { sql: null, error: result.error.message };
  }
  const n: Node = result.data;
  const cols = '(slug, parent_slug, position, type, pali)';
  const vals = `(${esc(n.slug)}, ${esc(n.parent_slug)}, ${n.position}, ${esc(n.type)}, ${esc(n.pali)})`;
  const sql =
    conflict === 'ignore'
      ? `INSERT OR IGNORE INTO nodes ${cols} VALUES ${vals};`
      : `INSERT INTO nodes ${cols} VALUES ${vals} ON CONFLICT(slug) DO UPDATE SET parent_slug=excluded.parent_slug, position=excluded.position, type=excluded.type, pali=excluded.pali;`;
  return { sql, error: null };
}

export function buildParagraphInsert(
  data: unknown,
  conflict: SeedArgs['conflict'],
): { sql: string | null; error: string | null } {
  const result = ParagraphSchema.safeParse(data);
  if (!result.success) {
    return { sql: null, error: result.error.message };
  }
  const p: Paragraph = result.data;
  const cols = '(document_slug, position, rend, num, pts, cst, pali)';
  const vals = `(${esc(p.document_slug)}, ${p.position}, ${esc(p.rend)}, ${esc(p.num)}, ${esc(p.pts)}, ${esc(p.cst)}, ${esc(p.pali)})`;
  const sql =
    conflict === 'ignore'
      ? `INSERT OR IGNORE INTO paragraphs ${cols} VALUES ${vals};`
      : `INSERT INTO paragraphs ${cols} VALUES ${vals} ON CONFLICT(document_slug, position) DO UPDATE SET rend=excluded.rend, num=excluded.num, pts=excluded.pts, cst=excluded.cst, pali=excluded.pali;`;
  return { sql, error: null };
}

export function buildTranslationInsert(
  data: unknown,
  conflict: SeedArgs['conflict'],
): { sql: string | null; error: string | null } {
  const result = TranslationSchema.safeParse(data);
  if (!result.success) {
    return { sql: null, error: result.error.message };
  }
  const t: Translation = result.data;
  const cols = '(document_slug, para_position, lang, text)';
  const vals = `(${esc(t.document_slug)}, ${t.para_position}, ${esc(t.lang)}, ${esc(t.text)})`;
  const sql =
    conflict === 'ignore'
      ? `INSERT OR IGNORE INTO translations ${cols} VALUES ${vals};`
      : `INSERT INTO translations ${cols} VALUES ${vals} ON CONFLICT(document_slug, para_position, lang) DO UPDATE SET text=excluded.text;`;
  return { sql, error: null };
}

export function writeNodeRow(
  writer: SqlWriter,
  data: unknown,
  conflict: SeedArgs['conflict'],
): boolean {
  const { sql, error } = buildNodeInsert(data, conflict);
  if (!sql) {
    warn(`node validation failed: ${error}`);
    return false;
  }
  writer.writeLine(sql);
  return true;
}

export function writeParagraphRow(
  writer: SqlWriter,
  data: unknown,
  conflict: SeedArgs['conflict'],
): boolean {
  const { sql, error } = buildParagraphInsert(data, conflict);
  if (!sql) {
    warn(`paragraph validation failed: ${error}`);
    return false;
  }
  writer.writeLine(sql);
  return true;
}

export function writeTranslationRow(
  writer: SqlWriter,
  data: unknown,
  conflict: SeedArgs['conflict'],
): boolean {
  const { sql, error } = buildTranslationInsert(data, conflict);
  if (!sql) {
    warn(`translation validation failed: ${error}`);
    return false;
  }
  writer.writeLine(sql);
  return true;
}
