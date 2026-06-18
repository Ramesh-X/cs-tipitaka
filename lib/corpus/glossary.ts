export interface GlossaryTerm {
  term: string;
  pali: string;
  definition: string;
}

/* -------------------------------------------------------------------------- */
/*  Glossary (placeholder)                                                    */
/* -------------------------------------------------------------------------- */

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Dhamma',
    pali: 'dhamma',
    definition:
      'The teaching of the Buddha; also: phenomenon, mental object, law.',
  },
  {
    term: 'Sutta',
    pali: 'sutta',
    definition: 'A discourse attributed to the Buddha or his disciples.',
  },
  {
    term: 'Nibbāna',
    pali: 'nibbāna',
    definition:
      'The unconditioned; the cessation of greed, hatred and delusion.',
  },
  {
    term: 'Saṅgha',
    pali: 'saṅgha',
    definition:
      'The community of monastics; the noble community of realized beings.',
  },
  {
    term: 'Mettā',
    pali: 'mettā',
    definition:
      'Loving-kindness; the wish for the welfare and happiness of all beings.',
  },
  {
    term: 'Khandha',
    pali: 'khandha',
    definition:
      'Aggregate; the five groups of clinging that constitute a person.',
  },
  {
    term: 'Paṭicca­samuppāda',
    pali: 'paṭiccasamuppāda',
    definition: 'Dependent origination; the conditioned arising of phenomena.',
  },
  {
    term: 'Vinaya',
    pali: 'vinaya',
    definition: 'The code of monastic discipline.',
  },
];

/** Speakers/filters for faceted search (placeholder). */
export const SPEAKERS = [
  'The Buddha',
  'Sāriputta',
  'Mahā Moggallāna',
  'Ānanda',
  'Mahā Kassapa',
];
