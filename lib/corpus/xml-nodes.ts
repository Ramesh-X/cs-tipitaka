/**
 * Helpers for fast-xml-parser's `preserveOrder` node shape and paragraph-level
 * text/reference extraction. preserveOrder keeps mixed text/`<hi>` content in
 * document order — the default collapsed model loses it, which is what
 * previously reordered inline-highlighted words to the end of every paragraph.
 *
 * Node shape: `{ tag: [children], ':@': { '@_attr': value } }`; text nodes are
 * `{ '#text': value }`.
 */

export interface ParsedParagraph {
  id: string;
  rend: string;
  pali: string;
  /** Canonical CST paragraph number (from `<hi rend="paranum">`), for citation. */
  num?: string;
  pts?: string;
  cst?: string;
  translations: Record<string, string>;
}

export type ON = Record<string, unknown>;

export function tagOf(node: ON): string {
  for (const key of Object.keys(node)) {
    if (key !== ':@' && key !== '#text') return key;
  }
  return '';
}

export function isText(node: ON): boolean {
  return Object.prototype.hasOwnProperty.call(node, '#text');
}

export function attrOf(node: ON, name: string): string {
  const attrs = node[':@'] as Record<string, unknown> | undefined;
  return attrs ? String(attrs[`@_${name}`] ?? '') : '';
}

export function childrenOf(node: ON): ON[] {
  const tag = tagOf(node);
  const value = node[tag];
  return Array.isArray(value) ? (value as ON[]) : [];
}

/** Direct child elements of `node` with the given tag, in document order. */
export function elemChildren(node: ON, tag: string): ON[] {
  return childrenOf(node).filter((c) => tagOf(c) === tag);
}

export function chapterCount(node: ON, tag: string): number {
  return elemChildren(node, tag).filter((c) => attrOf(c, 'rend') === 'chapter')
    .length;
}

/**
 * Concatenates a paragraph's inline content in document order. `<hi>` runs are
 * emitted in place (not appended), and runs are joined WITHOUT an inserted
 * separator so the source's own whitespace governs spacing — words the source
 * splits across markup (e.g. "pāṇāti") stay joined. paranum/dot markers and
 * non-text elements (pb, note) are dropped.
 */
export function extractText(children: ON[]): string {
  let out = '';
  for (const child of children) {
    if (isText(child)) {
      out += String(child['#text']);
      continue;
    }
    if (tagOf(child) === 'hi') {
      const rend = attrOf(child, 'rend');
      if (rend === 'paranum' || rend === 'dot') continue;
      out += extractText(childrenOf(child));
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Returns the canonical paragraph number from a `<hi rend="paranum">`, if any. */
export function extractParanum(children: ON[]): string | undefined {
  for (const child of children) {
    if (tagOf(child) === 'hi' && attrOf(child, 'rend') === 'paranum') {
      const num = extractText(childrenOf(child));
      if (num) return num;
    }
  }
  return undefined;
}

/**
 * Collects every PTS (`ed="P"`) and CST/Myanmar (`ed="M"`) page reference in a
 * paragraph. Recurses into `<hi>` so page breaks nested inside inline markup are
 * not missed. These are edition PAGE references (volume.page), not paragraph
 * numbers — the paragraph number is captured separately via `extractParanum`.
 */
export function extractRefs(children: ON[]): { pts?: string; cst?: string } {
  const pts: string[] = [];
  const cst: string[] = [];
  const visit = (nodes: ON[]) => {
    for (const child of nodes) {
      const tag = tagOf(child);
      if (tag === 'pb') {
        const n = attrOf(child, 'n');
        if (!n) continue;
        const ed = attrOf(child, 'ed');
        if (ed === 'P') pts.push(n);
        else if (ed === 'M') cst.push(n);
      } else if (tag === 'hi') {
        visit(childrenOf(child));
      }
    }
  };
  visit(children);
  return {
    pts: pts.length ? pts.join(', ') : undefined,
    cst: cst.length ? cst.join(', ') : undefined,
  };
}

/** Builds a ParsedParagraph from a `<p>`/`<head>` node, or null if it has no text. */
export function paragraphFrom(
  node: ON,
  id: number,
  defaultRend: string,
): ParsedParagraph | null {
  const children = childrenOf(node);
  const text = extractText(children);
  if (!text) return null;
  const { pts, cst } = extractRefs(children);
  return {
    id: `para-${id}`,
    rend: attrOf(node, 'rend') || defaultRend,
    pali: text,
    num: extractParanum(children),
    pts,
    cst,
    translations: {},
  };
}
