/**
 * Helpers for fast-xml-parser's `preserveOrder` node shape.
 * Node shape: `{ tag: [children], ':@': { '@_attr': value } }`
 * Text nodes: `{ '#text': value }`
 */

export interface ParsedParagraph {
  rend: string;
  pali: string;
  num?: string;
  pts?: string;
  cst?: string;
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

export function elemChildren(node: ON, tag: string): ON[] {
  return childrenOf(node).filter((c) => tagOf(c) === tag);
}

export function chapterCount(node: ON, tag: string): number {
  return elemChildren(node, tag).filter((c) => attrOf(c, 'rend') === 'chapter')
    .length;
}

/**
 * Concatenates a paragraph's inline content in document order.
 * Drops `<hi rend="paranum">`, `<hi rend="dot">`, `<pb>`, and `<note>`.
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
 * Collects PTS (`ed="P"`) and CST/Myanmar (`ed="M"`) page references.
 * Recurses into `<hi>` so refs nested inside inline markup are not missed.
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

export function paragraphFrom(
  node: ON,
  defaultRend: string,
): ParsedParagraph | null {
  const children = childrenOf(node);
  const text = extractText(children);
  if (!text) return null;
  const { pts, cst } = extractRefs(children);
  return {
    rend: attrOf(node, 'rend') || defaultRend,
    pali: text,
    num: extractParanum(children),
    pts,
    cst,
  };
}
