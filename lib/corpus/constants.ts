/**
 * Corpus constants & types — the client-safe surface of the corpus module.
 *
 * This module MUST NOT import any Node built-ins (`fs`, `path`) or the generated
 * corpus tree. It is safe to import from both server and `'use client'` components.
 * Server-only data access (CORPUS, tree walks) lives in `@/lib/corpus`, and
 * document loading lives in `@/lib/corpus/loader`.
 */

export type NodeType = 'pitaka' | 'nikaya' | 'collection' | 'document';

export interface Paragraph {
  /** Stable fragment id — deep-linkable as `#para-N`. */
  id: string;
  /** TEI rend attribute — used for display styling (bodytext, subhead, chapter, …). */
  rend?: string;
  /** Canonical CST paragraph number (from `<hi rend="paranum">`) — for citation. */
  num?: string;
  /** PTS edition page reference(s) (volume.page), shown inline. */
  pts?: string;
  /** CST/Myanmar edition page reference(s) (volume.page), shown inline. */
  cst?: string;
  /** Canonical Pāli text (Roman/IAST). */
  pali: string;
  /** Translation text keyed by translation id. */
  translations: Record<string, string>;
}

export interface DocumentContent {
  paragraphs: Paragraph[];
}

export interface CorpusNode {
  /** URL segment for this level. */
  slug: string;
  /** English/descriptive title. */
  title: string;
  /** Pāli title (Roman/IAST). */
  pali: string;
  type: NodeType;
  /** Short description for landing pages and metadata. */
  blurb?: string;
  children?: CorpusNode[];
  /**
   * Source XML reference for `document` nodes (e.g. `cscd/s0101m.mul0.xml`).
   * Build-time provenance used by the prebuild to locate the source file;
   * consumed only server-side.
   */
  href?: string;
}

export interface Script {
  id: string;
  name: string;
}

export interface Translation {
  id: string;
  title: string;
  translator: string;
  license: string;
}

export interface Crumb {
  title: string;
  pali: string;
  href: string;
}

export { GLOSSARY, SPEAKERS } from '@/lib/corpus/glossary';
export type { GlossaryTerm } from '@/lib/corpus/glossary';

/* -------------------------------------------------------------------------- */
/*  Display scripts (transliteration is client-side)                          */
/* -------------------------------------------------------------------------- */

export const SCRIPTS: Script[] = [
  { id: 'latn', name: 'Roman (IAST)' },
  { id: 'sinh', name: 'Sinhala' },
  { id: 'deva', name: 'Devanagari' },
  { id: 'thai', name: 'Thai' },
  { id: 'mymr', name: 'Myanmar' },
  { id: 'khmr', name: 'Khmer' },
  { id: 'laoo', name: 'Lao' },
  { id: 'beng', name: 'Bengali' },
  { id: 'asse', name: 'Assamese' },
  { id: 'guru', name: 'Gurmukhi' },
  { id: 'gujr', name: 'Gujarati' },
  { id: 'telu', name: 'Telugu' },
  { id: 'knda', name: 'Kannada' },
  { id: 'mlym', name: 'Malayalam' },
  { id: 'lana', name: 'Tai Tham' },
  { id: 'brah', name: 'Brāhmī' },
  { id: 'tibt', name: 'Tibetan' },
  { id: 'cyrl', name: 'Cyrillic' },
];

/** Roman/IAST is the single canonical server-rendered script (SEO + AI). */
export const CANONICAL_SCRIPT = 'latn';

/* -------------------------------------------------------------------------- */
/*  Available translations                                                     */
/* -------------------------------------------------------------------------- */

export const TRANSLATIONS: Translation[] = [
  {
    id: 'bodhi',
    title: 'Bhikkhu Bodhi',
    translator: 'Bhikkhu Bodhi',
    license: 'Licensed',
  },
  {
    id: 'sujato',
    title: 'Bhikkhu Sujato',
    translator: 'Bhikkhu Sujato',
    license: 'CC0 (public domain)',
  },
  {
    id: 'thanissaro',
    title: 'Ṭhānissaro Bhikkhu',
    translator: 'Ṭhānissaro Bhikkhu',
    license: 'Public domain',
  },
];

/* -------------------------------------------------------------------------- */
/*  Pure helpers (no data access)                                             */
/* -------------------------------------------------------------------------- */

export function isDocument(node: CorpusNode): boolean {
  return node.type === 'document';
}

export function nodeTypeLabel(type: NodeType): string {
  switch (type) {
    case 'pitaka':
      return 'Piṭaka';
    case 'nikaya':
      return 'Nikāya';
    case 'collection':
      return 'Collection';
    case 'document':
      return 'Text';
  }
}

/**
 * Secondary Pāli line to show beneath a title, or `undefined` when it would
 * merely duplicate the title. Most corpus nodes have `title === pali`, so
 * rendering both produced the same text twice (large + small) — pure noise.
 * Callers should skip the secondary line entirely when this returns `undefined`.
 */
export function secondaryPali(
  title: string,
  pali: string | undefined,
): string | undefined {
  const trimmed = pali?.trim();
  return trimmed && trimmed !== title.trim() ? trimmed : undefined;
}

/** Returns true when the title IS the Pāli text (should be transliterated). */
export function titleIsPali(title: string, pali: string | undefined): boolean {
  return pali?.trim() === title.trim();
}
