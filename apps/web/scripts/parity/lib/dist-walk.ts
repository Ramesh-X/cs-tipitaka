import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
export const WEB_ROOT = join(SCRIPT_DIR, '..', '..', '..');
export const DIST_DIR = join(WEB_ROOT, 'dist');

export interface DistPage {
  /** Absolute filesystem path to the built HTML file. */
  file: string;
  /** URL path this file is served at, e.g. "/", "/sutta", "/404". */
  urlPath: string;
}

function walk(
  dir: string,
  out: string[],
  filter?: (name: string) => boolean,
): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out, filter);
    else if (entry.isFile() && (!filter || filter(entry.name))) out.push(full);
  }
}

/** Astro's routing shape: `index.html` per route, `<name>.html` for the odd bare route (404). */
export function urlPathForDistFile(file: string): string {
  const rel = relative(DIST_DIR, file);
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) {
    return '/' + rel.slice(0, -'/index.html'.length);
  }
  if (rel.endsWith('.html')) return '/' + rel.slice(0, -'.html'.length);
  throw new Error(`Unexpected dist file shape: ${rel}`);
}

export function listDistPages(): DistPage[] {
  const files: string[] = [];
  walk(DIST_DIR, files, (name) => name.endsWith('.html'));
  return files
    .map((file) => ({ file, urlPath: urlPathForDistFile(file) }))
    .sort((a, b) => a.urlPath.localeCompare(b.urlPath));
}

/** Every built file's URL path, HTML pages and static assets alike — for resolving <link>/<img>/asset hrefs, not just page routes. */
export function listAllDistUrlPaths(): Set<string> {
  const files: string[] = [];
  walk(DIST_DIR, files);
  return new Set(
    files.map((file) =>
      file.endsWith('.html')
        ? urlPathForDistFile(file)
        : '/' + relative(DIST_DIR, file),
    ),
  );
}

export function readDistFile(file: string): string {
  return readFileSync(file, 'utf8');
}

/** The `<head>…</head>` slice of a page — cheap enough to read the whole file since the M7.3a DOM diet (dist averages ~140KB/page). */
export function readHead(html: string): string {
  const idx = html.indexOf('</head>');
  return idx === -1 ? html : html.slice(0, idx + '</head>'.length);
}

export function fileSizeBytes(file: string): number {
  return statSync(file).size;
}
