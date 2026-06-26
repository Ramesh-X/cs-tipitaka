/**
 * Corpus Manifest — slug overrides and category configuration for the build pipeline.
 *
 * ## What this file controls
 *
 * The build script (`scripts/build-corpus.ts`) reads `data/corpus/tipitaka.org/romn/tree.json`
 * and auto-generates URL slugs by slugifying every node's `text` field. This file provides:
 *
 *   1. `CATEGORY_ROOT_IDS`  — the four top-level section IDs in tree.json
 *   2. `CATEGORY_PREFIX`    — maps each category root ID to its URL prefix segments
 *   3. `PITAKA_SLUGS`       — hardcoded slugs for piṭaka-level nodes
 *   4. `NIKAYA_SLUGS`       — hardcoded slugs for nikāya-level nodes
 *   5. `SLUG_OVERRIDES`     — per-node ID overrides for any other node that slugifies badly
 *
 * ## How to update when the corpus submodule is updated
 *
 * 1. Pull the latest corpus:
 *      cd data/corpus && git pull && cd ../..
 *
 * 2. Inspect the new tree.json to find changed or new node IDs:
 *      iconv -f UTF-16 -t UTF-8 data/corpus/tipitaka.org/romn/tree.json \
 *        | python3 -c "
 *            import json, sys
 *            data = json.load(sys.stdin)
 *            def walk(n, d=0):
 *                if n.get('type') == 'leaf': return
 *                print('  '*d + f'id={n.get(\"id\",\"\")} text={n[\"text\"]!r}')
 *                for c in n.get('children', []): walk(c, d+1)
 *            walk(data[0])
 *          "
 *
 * 3. Verify that `CATEGORY_ROOT_IDS` values still match the tree.json root IDs for
 *    "Tipiṭaka (Mūla)", "Aṭṭhakathā", "Ṭīkā", and "Añña". Update if they changed.
 *
 * 4. Verify that `PITAKA_SLUGS` and `NIKAYA_SLUGS` IDs still exist and point to the
 *    correct nodes. Add new entries if new piṭaka/nikāya nodes were introduced.
 *
 * 5. Check for slug collisions by running the prebuild and reviewing the output:
 *      pnpm run prebuild 2>&1 | grep -i "collision\|duplicate\|warn"
 *    Add any colliding node IDs to `SLUG_OVERRIDES` with a unique slug.
 *
 * 6. Regenerate and rebuild:
 *      pnpm run prebuild && pnpm run build
 *
 * ## Slug override format
 *
 *   SLUG_OVERRIDES[nodeId] = 'my-custom-slug'
 *
 * The node ID is the numeric `id` field from tree.json. The slug must be URL-safe
 * (lowercase letters, digits, hyphens only). It applies only to that specific node —
 * its children are not affected.
 */

/** IDs of the four top-level category nodes in tree.json. */
export const CATEGORY_ROOT_IDS = {
  mula: 1,
  atthakatha: 825,
  tika: 1549,
  anna: 2305,
} as const;

/**
 * Maps each category root ID to its URL prefix segments.
 * Mūla has no prefix — its piṭaka children are the first URL segments.
 */
export const CATEGORY_PREFIX: Record<number, string[]> = {
  1: [],
  825: ['atthakatha'],
  1549: ['tika'],
  2305: ['anna'],
};

/**
 * Fixed slugs for piṭaka-level nodes across all categories.
 * Key = tree.json node id, value = URL slug.
 */
export const PITAKA_SLUGS: Record<number, string> = {
  // Mūla piṭakas
  2: 'vinaya',
  64: 'sutta',
  654: 'abhidhamma',
  // Aṭṭhakathā piṭaka children
  826: 'vinaya',
  887: 'sutta',
  1455: 'abhidhamma',
  // Ṭīkā piṭaka children
  1550: 'vinaya',
  1834: 'sutta',
  2140: 'abhidhamma',
};

/**
 * Fixed slugs for nikāya-level nodes.
 * Key = tree.json node id, value = URL slug.
 */
export const NIKAYA_SLUGS: Record<number, string> = {
  // Mūla Suttapiṭaka nikāyas
  65: 'dn',
  103: 'mn',
  122: 'sn',
  184: 'an',
  382: 'kn',
  // Aṭṭhakathā Suttapiṭaka nikāyas
  888: 'dn',
  927: 'mn',
  947: 'sn',
  1010: 'an',
  1178: 'kn',
  // Ṭīkā Suttapiṭaka nikāyas
  1835: 'dn',
  1890: 'mn',
  1910: 'sn',
  1973: 'an',
  2124: 'kn',
};

/**
 * Set of node IDs that are nikāyas (determines NodeType = 'nikaya').
 * Derived from NIKAYA_SLUGS keys.
 */
export const NIKAYA_IDS: Set<number> = new Set(
  Object.keys(NIKAYA_SLUGS).map(Number),
);

/**
 * Per-node slug overrides. Add entries here when auto-slugify produces a
 * collision or an undesirable slug for a specific node.
 *
 * Example:
 *   1234: 'my-custom-slug',
 */
export const SLUG_OVERRIDES: Record<number, string> = {};
