import type { z } from 'zod';
import type {
  FormIdSchema,
  FormSchema,
  LexIdSchema,
  LexSchema,
  RootIdSchema,
  RootSchema,
} from './schema';

export type RootId = z.infer<typeof RootIdSchema>;
export type LexId = z.infer<typeof LexIdSchema>;
export type FormId = z.infer<typeof FormIdSchema>;

export type Root = z.infer<typeof RootSchema>;
export type Lex = z.infer<typeof LexSchema>;
export type Form = z.infer<typeof FormSchema>;
