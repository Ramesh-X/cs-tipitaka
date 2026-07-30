import type { ParsedParagraph } from './nodes.ts';

export interface SplitDocument {
  title: string;
  paragraphs: ParsedParagraph[];
}

type TitleSubheadSplit =
  | { kind: 'document'; paragraphs: ParsedParagraph[]; reason?: string }
  | { kind: 'documents'; documents: SplitDocument[] };

const ROOT_LABEL_RENDS = new Set(['chapter', 'nikaya', 'book', 'centre']);
const INTRO_HEADING_RENDS = new Set(['subhead', 'title']);

function fail(
  paragraphs: ParsedParagraph[],
  reason: string,
): TitleSubheadSplit {
  return { kind: 'document', paragraphs, reason };
}

function introDocument(
  paragraphs: ParsedParagraph[],
  fallbackTitle: string,
): SplitDocument | null {
  const content = paragraphs.filter((p) => !ROOT_LABEL_RENDS.has(p.rend));
  if (content.length === 0) return null;

  const heading = content.find((p) => INTRO_HEADING_RENDS.has(p.rend));
  return {
    title: heading?.pali ?? fallbackTitle,
    paragraphs: content,
  };
}

export function splitSafeTitleSubhead(
  paragraphs: ParsedParagraph[],
  fallbackTitle = 'Introduction',
): TitleSubheadSplit {
  const titleIndexes = paragraphs
    .map((p, index) => (p.rend === 'title' ? index : -1))
    .filter((index) => index >= 0);
  if (titleIndexes.length === 0) return { kind: 'document', paragraphs };

  const documents: SplitDocument[] = [];
  const intro = introDocument(
    paragraphs.slice(0, titleIndexes[0]),
    fallbackTitle,
  );
  if (intro) documents.push(intro);

  for (let i = 0; i < titleIndexes.length; i++) {
    const start = titleIndexes[i];
    const end = titleIndexes[i + 1] ?? paragraphs.length;
    const section = paragraphs.slice(start, end);
    const title = section[0];
    if (!title) continue;
    if (section.length === 1) {
      return fail(paragraphs, 'title-without-content');
    }
    documents.push({ title: title.pali, paragraphs: section });
  }

  if (documents.length === 0) return { kind: 'document', paragraphs };

  return { kind: 'documents', documents };
}
