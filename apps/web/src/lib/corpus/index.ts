export type { Paragraph } from '@cs-tipitaka/corpus';

export type { Crumb, NodeWithMeta } from './constants.ts';
export { childSummary, nodeTypeLabel } from './presentation.ts';

export { getBreadcrumbs, getAdjacentDocuments } from './navigation.ts';

export {
  findNode,
  getAllPaths,
  getChildren,
  getDescendants,
  getRootNodes,
  getSiblingsAndSelf,
} from './nodes.ts';

export { deriveReaderSections, detectScript, transliterate } from './reader.ts';
export type { ReaderSection } from './reader.ts';
