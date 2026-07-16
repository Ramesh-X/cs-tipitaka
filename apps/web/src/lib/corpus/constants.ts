import { type Node, type NodeMeta } from '@cs-tipitaka/corpus';

export type NodeWithMeta = Node & Partial<Omit<NodeMeta, 'slug'>>;

export interface Crumb {
  pali: string;
  href: string;
}
