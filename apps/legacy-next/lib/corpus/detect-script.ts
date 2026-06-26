import { CANONICAL_SCRIPT } from '@/lib/corpus/constants';

const TIMEZONE_TO_SCRIPT: Record<string, string> = {
  'Asia/Colombo': 'sinh',
  'Asia/Bangkok': 'thai',
  'Asia/Yangon': 'mymr',
  'Asia/Rangoon': 'mymr',
  'Asia/Phnom_Penh': 'khmr',
  'Asia/Vientiane': 'laoo',
  'Asia/Kolkata': 'deva',
  'Asia/Calcutta': 'deva',
  'Asia/Kathmandu': 'deva',
  'Asia/Dhaka': 'beng',
  'Asia/Thimphu': 'tibt',
};

const LANG_TO_SCRIPT: Record<string, string> = {
  si: 'sinh',
  th: 'thai',
  my: 'mymr',
  km: 'khmr',
  lo: 'laoo',
  hi: 'deva',
  ne: 'deva',
  mr: 'deva',
  sa: 'deva',
  bn: 'beng',
  as: 'asse',
  bo: 'tibt',
  gu: 'gujr',
  pa: 'guru',
  te: 'telu',
  kn: 'knda',
  ml: 'mlym',
};

export function detectScript(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_SCRIPT[tz]) return TIMEZONE_TO_SCRIPT[tz];

    const lang =
      typeof navigator !== 'undefined'
        ? (navigator.language ?? '').toLowerCase().split('-')[0]
        : '';
    if (lang && LANG_TO_SCRIPT[lang]) return LANG_TO_SCRIPT[lang];
  } catch {
    // Fail silently
  }
  return CANONICAL_SCRIPT;
}
