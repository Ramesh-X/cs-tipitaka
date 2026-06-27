import * as path from 'path';

const REPO_ROOT = path.resolve(import.meta.dirname, '../../../../');

export const DB_NAME = 'corpus-db';

export const CORPUS_TREE_JSON = path.join(
  REPO_ROOT,
  'data/corpus/tipitaka.org/romn/tree.json',
);

export const CORPUS_ROMN_DIR = path.join(REPO_ROOT, 'data/corpus/romn');

export const EMPTY_TOLERANCE = 5;

export const CATEGORY_ROOT_IDS = {
  mula: 1,
  atthakatha: 825,
  tika: 1549,
  anna: 2305,
} as const;

export const CATEGORY_PREFIX: Record<number, string[]> = {
  1: [],
  825: ['atthakatha'],
  1549: ['tika'],
  2305: ['anna'],
};

export const PITAKA_SLUGS: Record<number, string> = {
  2: 'vinaya',
  64: 'sutta',
  654: 'abhidhamma',
  826: 'vinaya',
  887: 'sutta',
  1455: 'abhidhamma',
  1550: 'vinaya',
  1834: 'sutta',
  2140: 'abhidhamma',
};

export const NIKAYA_SLUGS: Record<number, string> = {
  65: 'dn',
  103: 'mn',
  122: 'sn',
  184: 'an',
  382: 'kn',
  888: 'dn',
  927: 'mn',
  947: 'sn',
  1010: 'an',
  1178: 'kn',
  1835: 'dn',
  1890: 'mn',
  1910: 'sn',
  1973: 'an',
  2124: 'kn',
};

export const NIKAYA_IDS: Set<number> = new Set(
  Object.keys(NIKAYA_SLUGS).map(Number),
);

export const SLUG_OVERRIDES: Record<number, string> = {};

export const LABEL_RENDS = new Set(['nikaya', 'book', 'centre', 'title']);
