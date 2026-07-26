import { type Node, type NodeMeta } from '@cs-tipitaka/corpus';

/** Display name is `pali`, not `title`; `blurb`/`wikidata` may be absent — docs/web/corpus-data-layer.md. */
export type NodeWithMeta = Node & Partial<Omit<NodeMeta, 'slug'>>;

export interface Crumb {
  pali: string;
  href: string;
}
