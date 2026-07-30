export { isDocument } from '@cs-tipitaka/shared';

export type { Crumb, NodeWithMeta } from './constants.ts';
export { childSummary, nodeTypeLabel } from './presentation.ts';

export { getBreadcrumbs, getAdjacentDocuments } from './navigation.ts';

export {
  findNode,
  getAllPaths,
  getChildren,
  getRootNodes,
  getSiblingsAndSelf,
} from './nodes.ts';

export { deriveReaderSections } from './reader.ts';
export type { ReaderSection } from './reader.ts';
