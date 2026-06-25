/** Primary word class / part of speech — Pāli-native IAST terms. */
export const POS_VALUES = [
  'nāma', // noun
  'guṇanāma', // quality noun / adjective (Pāli lexical category; sabbanāma/saṅkhyā/guṇanāma are all semantic subtypes of nāma)
  'sabbanāma', // pronoun
  'saṅkhyā', // numeral
  'ākhyāta', // verb (conjugated)
  'upasagga', // prefix
  'nipāta', // particle / indeclinable
] as const;
export type Pos = (typeof POS_VALUES)[number];

/** Derivational / structural formation category — Pāli-native IAST terms. */
export const FORMATION_VALUES = [
  'kita', // verbal derivative (participle, gerund, infinitive)
  'taddhita', // secondary derivative
  'samāsa', // compound
] as const;
export type Formation = (typeof FORMATION_VALUES)[number];

/** Gender (liṅga) — Pāli-native IAST terms. */
export const LINGA_VALUES = [
  'pulliṅga',
  'itthiliṅga',
  'napuṃsakaliṅga',
] as const;
export type Liṅga = (typeof LINGA_VALUES)[number];

/**
 * Case (vibhatti) — the 8 Pāli case endings.
 * ālapana is included as a distinct vibhatti for practical dictionary use:
 * nom/voc have different surface forms (buddho/buddha), so annotators need
 * this distinction even though Kaccāyana treats vocative as a paṭhamā variant.
 */
export const VIBHATTI_VALUES = [
  'paṭhamā', // nominative (1st)
  'dutiyā', // accusative (2nd)
  'tatiyā', // instrumental (3rd)
  'catutthī', // dative (4th)
  'pañcamī', // ablative (5th)
  'chaṭṭhī', // genitive (6th)
  'sattamī', // locative (7th)
  'ālapana', // vocative
] as const;
export type Vibhatti = (typeof VIBHATTI_VALUES)[number];

/** Number (vacana). */
export const VACANA_VALUES = ['ekavacana', 'bahuvacana'] as const;
export type Vacana = (typeof VACANA_VALUES)[number];

/**
 * Person (purisa) — Pāli-native inversion:
 * paṭhama = 3rd person (Western), majjhima = 2nd, uttama = 1st.
 */
export const PURISA_VALUES = ['paṭhama', 'majjhima', 'uttama'] as const;
export type Purisa = (typeof PURISA_VALUES)[number];

/**
 * Tense / mood (kāla) — the 8 Pāli verbal forms.
 * pañcamī (imperative) and sattamī (optative) share names with the ablative
 * and locative cases — authentic Pāli convention; unambiguous because tense
 * and case live in separate morphology fields.
 */
export const KALA_VALUES = [
  'vattamānā', // present indicative
  'pañcamī', // imperative
  'sattamī', // optative / potential
  'parokkhā', // perfect / indirect evidential
  'hiyyattanī', // past imperfect (yesterday's past: hiyyo = yesterday)
  'ajjatanī', // aorist / simple past (today's past: ajja = today)
  'bhavissantī', // future
  'kālātipatti', // conditional
] as const;
export type Kāla = (typeof KALA_VALUES)[number];

/** Voice (vācaka). */
export const VACAKA_VALUES = [
  'kattuvācaka',
  'kammavācaka',
  'bhāvavācaka',
] as const;
export type Vācaka = (typeof VACAKA_VALUES)[number];
