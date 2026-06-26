import 'server-only';
import { z } from 'zod';

import { LANG_CODES, type LangCode } from './lang';
import {
  FORMATION_VALUES,
  KALA_VALUES,
  LINGA_VALUES,
  POS_VALUES,
  PURISA_VALUES,
  VACAKA_VALUES,
  VACANA_VALUES,
  VIBHATTI_VALUES,
  type Formation,
  type Kāla,
  type Liṅga,
  type Pos,
  type Purisa,
  type Vacana,
  type Vācaka,
  type Vibhatti,
} from './grammar';
import { FORM_ID_RE, LEX_ID_RE, ROOT_ID_RE, toIdSlug } from './ids';

const LocalizedTextSchema = z.object({
  language: z
    .enum([...LANG_CODES] as [LangCode, ...LangCode[]])
    .describe('ISO language code of this meaning entry (en, si, th, my).'),
  text: z.string().min(1).describe('The meaning text in the given language.'),
});

export const RootIdSchema = z
  .string()
  .regex(ROOT_ID_RE)
  .brand<'RootId'>()
  .describe(
    'Stable root ID. Pattern: root:<id-slug> where id-slug = toIdSlug(text). Example: "root:budh".',
  );

export const LexIdSchema = z
  .string()
  .regex(LEX_ID_RE)
  .brand<'LexId'>()
  .describe(
    'Stable lexeme ID. Pattern: lex:<id-slug> where id-slug = toIdSlug(lemma). Example: "lex:buddha".',
  );

export const FormIdSchema = z
  .string()
  .regex(FORM_ID_RE)
  .brand<'FormId'>()
  .describe(
    'Stable form ID. Pattern: form:<lex-slug>:<surface-slug> where surface-slug = toIdSlug(surface). Example: "form:buddha:buddhena".',
  );

const PosSchema = z
  .enum([...POS_VALUES] as [Pos, ...Pos[]])
  .describe(
    'Primary word class / part of speech (Pāli-native IAST): nāma, guṇanāma, ākhyāta, nipāta, etc.',
  );

const FormationSchema = z
  .enum([...FORMATION_VALUES] as [Formation, ...Formation[]])
  .describe(
    'Derivational / structural formation category (Pāli-native IAST): kita (verbal derivative), taddhita (secondary derivative), samāsa (compound). Use alongside pos when the lexeme has a known formation type, e.g. pos: nāma + formation: kita for a kita-derived noun.',
  );

const LingaSchema = z
  .enum([...LINGA_VALUES] as [Liṅga, ...Liṅga[]])
  .describe(
    'Grammatical gender (liṅga): pulliṅga, itthiliṅga, napuṃsakaliṅga.',
  );

const VibhattiSchema = z
  .enum([...VIBHATTI_VALUES] as [Vibhatti, ...Vibhatti[]])
  .describe('Nominal case (vibhatti): paṭhamā (nom) through ālapana (voc).');

const VacanaSchema = z
  .enum([...VACANA_VALUES] as [Vacana, ...Vacana[]])
  .describe('Grammatical number (vacana): ekavacana (sg) or bahuvacana (pl).');

const PurisaSchema = z
  .enum([...PURISA_VALUES] as [Purisa, ...Purisa[]])
  .describe(
    'Verbal person (purisa). Pāli-native inversion: paṭhama = 3rd (Western), majjhima = 2nd, uttama = 1st.',
  );

const KālaSchema = z
  .enum([...KALA_VALUES] as [Kāla, ...Kāla[]])
  .describe(
    'Verbal tense / mood (kāla): vattamānā (present) through kālātipatti (conditional).',
  );

const VacakaSchema = z
  .enum([...VACAKA_VALUES] as [Vācaka, ...Vācaka[]])
  .describe(
    'Verbal voice (vācaka): kattuvācaka (active), kammavācaka (passive), bhāvavācaka (impersonal).',
  );

/**
 * A single morphological analysis. The three core shapes are mutually exclusive:
 *   - nominal:       vibhatti (+ vacana, liṅga) — incl. declining kita/participles
 *   - finite verbal: purisa   (+ vacana, kāla, vācaka)
 *   - indeclinable:  avyaya: true
 * kārita is an orthogonal derivational flag valid with any of the three shapes
 * (causative participle → nominal+kārita; kāretvā absolutive → avyaya+kārita).
 * Fields are partial tags by design — full analyses are encouraged but partial
 * ones (e.g. bare vacana) are accepted for tagging-in-progress use.
 */
const SingleMorphologySchema = z
  .object({
    // Nominal dimension.
    vibhatti: VibhattiSchema.optional().describe(
      'Case (vibhatti). Nominal forms only (incl. declining participles/kita).',
    ),
    liṅga: LingaSchema.optional().describe(
      'Gender (liṅga) in the morphological context of this form. Nominal.',
    ),
    // Finite-verbal dimension.
    purisa: PurisaSchema.optional().describe(
      'Person (purisa). Finite verbal forms only.',
    ),
    kāla: KālaSchema.optional().describe(
      'Tense / mood (kāla). Finite verbal forms only.',
    ),
    vācaka: VacakaSchema.optional().describe(
      'Voice (vācaka). Finite verbal forms only.',
    ),
    kārita: z
      .boolean()
      .optional()
      .describe(
        'True for causative (kārita) formation — an orthogonal derivational flag valid with nominal (causative participle), finite-verbal, or indeclinable (e.g. kāretvā absolutive) forms. Combines with vācaka, e.g. kārita + kammavācaka = causative passive. (This is the morphological causative flag, distinct from hetu-kattā / hetu — the causer role in the kāraka system.)',
      ),
    // Shared by nominal and finite-verbal forms.
    vacana: VacanaSchema.optional().describe('Number (vacana).'),
    // Indeclinable.
    avyaya: z
      .boolean()
      .optional()
      .describe(
        'True when the form is indeclinable (avyaya): particles (nipāta), -tvā absolutives, etc. Mutually exclusive with all other fields.',
      ),
  })
  .describe(
    'One grammatical analysis using Pāli-native terms. Nominal (vibhatti…), finite-verbal (purisa…), and indeclinable (avyaya) cores are mutually exclusive. kārita is an orthogonal derivational flag valid with any core. Fields are partial tags by design.',
  )
  .superRefine((m, ctx) => {
    const hasNominal = m.vibhatti !== undefined || m.liṅga !== undefined;
    const hasVerbalCore =
      m.purisa !== undefined || m.kāla !== undefined || m.vācaka !== undefined;
    const isAvyaya = m.avyaya === true;

    // The three core shapes are mutually exclusive (kārita is orthogonal).
    if (hasNominal && hasVerbalCore) {
      ctx.addIssue({
        code: 'custom',
        input: m,
        message:
          'A form cannot carry both nominal fields (vibhatti/liṅga) and finite-verbal fields (purisa/kāla/vācaka). Declining participles (incl. causative) are nominal at the form level.',
      });
    }
    if (isAvyaya && (hasNominal || hasVerbalCore || m.vacana !== undefined)) {
      ctx.addIssue({
        code: 'custom',
        input: m,
        path: ['avyaya'],
        message:
          'An indeclinable (avyaya: true) form cannot also carry case, gender, number, or verbal fields.',
      });
    }
    // avyaya, when present, must be true — false is meaningless noise.
    if (m.avyaya === false) {
      ctx.addIssue({
        code: 'custom',
        input: m,
        path: ['avyaya'],
        message: 'Omit avyaya rather than setting it to false.',
      });
    }
    // No empty analysis (kārita alone is not a core host — caught separately below).
    if (
      !hasNominal &&
      !hasVerbalCore &&
      !isAvyaya &&
      m.kārita !== true &&
      m.vacana === undefined
    ) {
      ctx.addIssue({
        code: 'custom',
        input: m,
        message:
          'Empty morphology. Provide nominal (vibhatti/liṅga), verbal (purisa/kāla/vācaka), number (vacana), or avyaya: true.',
      });
    }
    // kārita is an orthogonal derivational flag but needs at least one core host.
    if (m.kārita === true && !hasNominal && !hasVerbalCore && !isAvyaya) {
      ctx.addIssue({
        code: 'custom',
        input: m,
        path: ['kārita'],
        message:
          'kārita (causative) requires a morphological host: at least one of vibhatti/liṅga (nominal), purisa/kāla/vācaka (verbal), or avyaya: true (indeclinable).',
      });
    }
  });

/**
 * Multiple analyses per surface form. A single Pāli surface form is routinely
 * ambiguous (e.g. nom.pl vs voc.pl, masc vs neut), and Form.id is fixed by
 * lexId + normalized — so two readings of one form cannot become two Form docs
 * (id collision). Hence an array of analyses on the Form.
 */
const MorphologySchema = z
  .array(SingleMorphologySchema)
  .min(1)
  .describe(
    'One or more grammatical analyses of this surface form. Multiple entries capture morphological ambiguity (e.g. nominative vs vocative plural).',
  );

export const RootSchema = z
  .object({
    id: RootIdSchema,
    text: z
      .string()
      .min(1)
      .describe(
        'Displayed root form, conventionally prefixed with √. Example: "√budh".',
      ),
    normalized: z
      .string()
      .min(1)
      .regex(
        /^[a-z0-9-]+$/,
        'normalized must be lowercase ASCII letters, digits, and hyphens only (no diacritics or other symbols).',
      )
      .describe(
        'Search-normalized root: lowercase, no diacritics, no symbols. Lossy search key only — the stable id is derived from the text field via toIdSlug. Example: "budh".',
      ),
    meanings: z
      .array(LocalizedTextSchema)
      .min(1)
      .describe(
        'Root-level meanings. Usually broad verbal senses. Multiple entries per language allowed for distinct senses.',
      ),
    sanskrit: z
      .string()
      .optional()
      .describe('Sanskrit cognate root, if applicable. Example: "√budh".'),
    notes: z
      .string()
      .optional()
      .describe('Optional editorial or etymological notes.'),
  })
  .refine((r) => r.id === `root:${toIdSlug(r.text)}`, {
    message: 'id must equal `root:<id-slug>` where id-slug = toIdSlug(text).',
    path: ['id'],
  });

export const LexSchema = z
  .object({
    id: LexIdSchema,
    lemma: z
      .string()
      .min(1)
      .describe(
        'Dictionary headword in canonical Roman/IAST form. Example: "buddha".',
      ),
    normalized: z
      .string()
      .min(1)
      .regex(
        /^[a-z0-9-]+$/,
        'normalized must be lowercase ASCII letters, digits, and hyphens only (no diacritics or other symbols).',
      )
      .describe(
        'Search-normalized lemma; also the URL slug. Lossy search key only — the stable id is derived from the lemma field via toIdSlug. Example: "buddha".',
      ),
    rootIds: z
      .array(RootIdSchema)
      .optional()
      .describe(
        'Related root IDs. Usually one entry; compounds or uncertain derivations may list more.',
      ),
    pos: PosSchema,
    formation: FormationSchema.optional(),
    genders: z
      .array(LingaSchema)
      .optional()
      .describe(
        'Lexical gender(s) (liṅga). For nominal words; usually one, occasionally more. Adjectives, pronouns and numerals (saṅkhyā) omit it — their gender is contextual (agreement-based) rather than a fixed lexical property.',
      ),
    meanings: z
      .array(LocalizedTextSchema)
      .min(1)
      .describe(
        'Lexical meanings — the required baseline gloss set. Use this for the core translation(s); reach for `senses` only when a word needs finer-grained, separately-glossed senses. Multiple entries per language allowed.',
      ),
    displayMeaning: z
      .string()
      .optional()
      .describe(
        'Short reader-friendly gloss for the click-pane and glossary card. Example: "the Buddha".',
      ),
    senses: z
      .array(
        z.object({
          gloss: z
            .array(LocalizedTextSchema)
            .min(1)
            .describe('Localized gloss for this specific sense.'),
          example: z
            .string()
            .optional()
            .describe('Optional Pāli example phrase.'),
        }),
      )
      .optional()
      .describe(
        'Optional refinement of `meanings`: finer-grained senses when a word has multiple distinct meanings, each with its own localized gloss (and optional example). Omit when the baseline `meanings` already suffice.',
      ),
    wikidata: z
      .string()
      .regex(
        /^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/,
        'wikidata must be a https://www.wikidata.org/wiki/Q… entity URL.',
      )
      .optional()
      .describe(
        'Wikidata entity URL. Example: "https://www.wikidata.org/wiki/Q9441".',
      ),
    notes: z.string().optional().describe('Optional editorial notes.'),
  })
  .refine((l) => l.id === `lex:${toIdSlug(l.lemma)}`, {
    message: 'id must equal `lex:<id-slug>` where id-slug = toIdSlug(lemma).',
    path: ['id'],
  });

export const FormSchema = z
  .object({
    id: FormIdSchema,
    lexId: LexIdSchema.describe('The lexeme this form belongs to.'),
    surface: z
      .string()
      .min(1)
      .describe(
        'Actual surface form as it appears in the canonical text. Example: "buddhena".',
      ),
    normalized: z
      .string()
      .min(1)
      .regex(
        /^[a-z0-9-]+$/,
        'normalized must be lowercase ASCII letters, digits, and hyphens only (no diacritics or other symbols).',
      )
      .describe(
        'Search-normalized surface form. Lossy search key only — the stable id is derived from the surface field via toIdSlug. Example: "buddhena".',
      ),
    morphology: MorphologySchema.optional(),
    notes: z.string().optional().describe('Optional editorial notes.'),
  })
  .refine((f) => f.id === `form:${f.lexId.slice(4)}:${toIdSlug(f.surface)}`, {
    message:
      'id must equal `form:<lex-slug>:<surface-slug>` where lex-slug is lexId without the "lex:" prefix and surface-slug = toIdSlug(surface).',
    path: ['id'],
  });
