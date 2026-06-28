/**
 * Zod schemas for the corpus database tables.
 * Each schema must remain a 1:1 match with its corresponding table in migrations/0001_initial.sql —
 * column names, types, and nullability must stay in sync.
 */

import { z } from 'zod';

export const NodeSchema = z.object({
  slug: z
    .string()
    .describe(
      "URL path slug; hierarchy segments joined by '/' (e.g. 'vinaya/parajikapali')",
    ),
  parent_slug: z
    .string()
    .nullable()
    .describe(
      'Parent node slug for the adjacency-list tree; null for root nodes (pitaka level)',
    ),
  position: z
    .number()
    .int()
    .describe('Zero-based sort order among siblings with the same parent'),
  type: z
    .enum(['pitaka', 'nikaya', 'collection', 'document'])
    .describe(
      "Node level in the corpus hierarchy: pitaka → nikaya → collection → document. Only 'document' nodes have paragraphs.",
    ),
  pali: z
    .string()
    .describe(
      'Canonical Pāli name in Roman script with diacritics (e.g. "Dīgha Nikāya")',
    ),
});

export type Node = z.infer<typeof NodeSchema>;

export const ParagraphSchema = z.object({
  document_slug: z
    .string()
    .describe(
      "Slug of the parent document-type node (e.g. 'vinaya/parajikapali')",
    ),
  position: z
    .number()
    .int()
    .describe(
      'One-based paragraph position within the document; used as the join key for translations',
    ),
  rend: z
    .string()
    .nullable()
    .describe(
      "Rendering hint inherited from the source XML (e.g. 'centre', 'bold', 'hangnum'); null when absent",
    ),
  num: z
    .string()
    .nullable()
    .describe(
      'Paragraph number label as printed in physical editions; null when absent',
    ),
  pts: z
    .string()
    .nullable()
    .describe(
      "Pali Text Society edition page/paragraph reference (e.g. 'Vin.i.1'); null when absent",
    ),
  cst: z
    .string()
    .nullable()
    .describe('Chattha Sangayana Tipitaka edition reference; null when absent'),
  pali: z
    .string()
    .describe('Pāli paragraph text in Roman script with diacritics'),
});

export type Paragraph = z.infer<typeof ParagraphSchema>;

export const TranslationSchema = z.object({
  document_slug: z
    .string()
    .describe(
      'Slug of the parent document-type node; matches paragraphs.document_slug',
    ),
  para_position: z
    .number()
    .int()
    .describe(
      'Position of the paragraph this translation corresponds to; matches paragraphs.position',
    ),
  lang: z
    .string()
    .describe(
      "BCP-47 language code (e.g. 'en', 'de', 'si') identifying the translation language",
    ),
  text: z.string().describe('Translated paragraph text in the given language'),
});

export type Translation = z.infer<typeof TranslationSchema>;
