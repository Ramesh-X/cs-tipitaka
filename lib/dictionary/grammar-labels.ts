import type {
  Formation,
  Kāla,
  Liṅga,
  Pos,
  Purisa,
  Vacana,
  Vācaka,
  Vibhatti,
} from './grammar';
import type { Localized } from './lang';

export const POS_LABELS: Record<Pos, Localized> = {
  nāma: {
    en: 'Noun / substantive',
    si: 'නාම පදය',
    th: 'คำนาม',
    my: 'နာမ်',
  },
  guṇanāma: {
    en: 'Adjective',
    si: 'විශේෂණ පදය',
    th: 'คำคุณศัพท์',
    my: 'ဝိသေသနပုဒ်',
  },
  sabbanāma: {
    en: 'Pronoun',
    si: 'සර්වනාම පදය',
    th: 'คำสรรพนาม',
    my: 'နာမ်စား',
  },
  saṅkhyā: {
    en: 'Numeral',
    si: 'සංඛ්‍යා පදය',
    th: 'คำบอกจำนวน',
    my: 'ကိန်းဂဏန်းပြ စကားလုံး',
  },
  ākhyāta: {
    en: 'Finite verb',
    si: 'ආඛ්‍යාතය',
    th: 'คำกริยาที่ผันรูป',
    my: 'ကြိယာပုဒ်',
  },
  upasagga: {
    en: 'Prefix / preposition',
    si: 'උපසර්ගය',
    th: 'คำอุปสรรค',
    my: 'ရှေ့ဆက်ပုဒ်',
  },
  nipāta: {
    en: 'Particle',
    si: 'නිපාතය',
    th: 'คำนิบาต',
    my: 'နိပါတ်',
  },
};

export const FORMATION_LABELS: Record<Formation, Localized> = {
  kita: {
    en: 'Primary derivative',
    si: 'කිතක',
    th: 'กิตก์',
    my: 'ကိတ်',
  },
  taddhita: {
    en: 'Secondary derivative',
    si: 'තද්ධිත',
    th: 'ตัทธิต',
    my: 'တဒ္ဓိတ်',
  },
  samāsa: {
    en: 'Compound',
    si: 'සමාස',
    th: 'สมาส',
    my: 'သမာသ်',
  },
};

export const LINGA_LABELS: Record<Liṅga, Localized> = {
  pulliṅga: {
    en: 'Masculine gender',
    si: 'පුරුෂ ලිංගය',
    th: 'เพศชาย',
    my: 'ပုလ္လိင်',
  },
  itthiliṅga: {
    en: 'Feminine gender',
    si: 'ස්ත්‍රී ලිංගය',
    th: 'เพศหญิง',
    my: 'ဣတ္ထိလိင်',
  },
  napuṃsakaliṅga: {
    en: 'Neuter gender',
    si: 'නපුංසක ලිංගය',
    th: 'เพศกลาง',
    my: 'နပုလ္လိင်',
  },
};

// Case (vibhatti) labels use grammatical function names, not ordinal names.
export const VIBHATTI_LABELS: Record<Vibhatti, Localized> = {
  paṭhamā: {
    en: 'Nominative',
    si: 'ප්‍රථමා / කර්තෘ',
    th: 'ปฐมา / ประธาน',
    my: 'ပထမာ / ကတ္တာ',
  },
  dutiyā: {
    en: 'Accusative',
    si: 'කර්ම',
    th: 'ทุติยา / กรรม',
    my: 'ဒုတိယာ / ကမ္မ',
  },
  tatiyā: {
    en: 'Instrumental',
    si: 'කරණ',
    th: 'ตติยา / เครื่องมือ',
    my: 'တတိယာ / ကရဏ',
  },
  catutthī: {
    en: 'Dative',
    si: 'සම්ප්‍රදාන',
    th: 'จตุตถี / ผู้รับ',
    my: 'စတုတ္ထီ / သမ္ပဒါန',
  },
  pañcamī: {
    en: 'Ablative',
    si: 'අපාදාන / අවධි',
    th: 'ปัญจมี / แหล่งที่มา',
    my: 'ပဉ္စမီ / အပါဒါန',
  },
  chaṭṭhī: {
    en: 'Genitive',
    si: 'සම්බන්ධ',
    th: 'ฉัฏฐี / เจ้าของ',
    my: 'ဆဋ္ဌီ / သမ္ဗန္ဓ',
  },
  sattamī: {
    en: 'Locative',
    si: 'ආධාර',
    th: 'สัตตมี / สถานที่',
    my: 'သတ္တမီ / သြကာသ',
  },
  ālapana: {
    en: 'Vocative',
    si: 'ආලපන / සම්බෝධන',
    th: 'อาลปนะ / การเรียก',
    my: 'အာလာပန',
  },
};

export const VACANA_LABELS: Record<Vacana, Localized> = {
  ekavacana: { en: 'Singular', si: 'ඒකවචනය', th: 'เอกพจน์', my: 'အနည်းကိန်း' },
  bahuvacana: { en: 'Plural', si: 'බහුවචනය', th: 'พหูพจน์', my: 'အများကိန်း' },
};

export const PURISA_LABELS: Record<Purisa, Localized> = {
  paṭhama: {
    en: 'Third person',
    si: 'තෙවන පුද්ගලය',
    th: 'บุรุษที่สาม',
    my: 'တတိယပုဂ္ဂိုလ်',
  },
  majjhima: {
    en: 'Second person',
    si: 'දෙවන පුද්ගලය',
    th: 'บุรุษที่สอง',
    my: 'ဒုတိယပုဂ္ဂိုလ်',
  },
  uttama: {
    en: 'First person',
    si: 'පළමු පුද්ගලය',
    th: 'บุรุษที่หนึ่ง',
    my: 'ပထမပုဂ္ဂိုလ်',
  },
};

export const KALA_LABELS: Record<Kāla, Localized> = {
  vattamānā: {
    en: 'Present Indicative',
    si: 'වර්තමාන කාලය / දර්ශක විධිය',
    th: 'ปัจจุบันกาล / บอกเล่า',
    my: 'ပစ္စုပ္ပန်ကာလ / ညွှန်ပြကာလ',
  },
  pañcamī: {
    en: 'Imperative / Command or Wish',
    si: 'ආඥාර්ථ / ආශිර්වාද විධිය',
    th: 'คำสั่ง / ความปรารถนา',
    my: 'အမိန့်ပေး / ဆုတောင်းပုံ',
  },
  sattamī: {
    en: 'Optative / Potential / Permission or Supposition',
    si: 'ශක්‍යාර්ථ / අනුමති / පරිකල්පනා විධිය',
    th: 'ความเป็นไปได้ / การอนุญาต / การสมมุติ',
    my: 'ဖြစ်နိုင်ခြေ / ခွင့်ပြု / စဉ်းစားယူဆပုံ',
  },
  parokkhā: {
    en: 'Perfect / Unwitnessed or Indirect Past',
    si: 'තමා නොදුටු හෝ නොදැන සිටි අතීත කාලය',
    th: 'อดีตกาลที่ไม่ได้เห็นหรือรับรู้เอง',
    my: 'ကိုယ်တိုင်မမြင်ခဲ့ သို့မဟုတ် မသိရှိခဲ့သော အတိတ်ကာလ',
  },
  hiyyattanī: {
    en: 'Imperfect / Past before today',
    si: 'අදට පෙර අතීත කාලය',
    th: 'อดีตกาลที่เกิดก่อนวันนี้',
    my: 'ယနေ့မတိုင်မီ ဖြစ်ခဲ့သော အတိတ်ကာလ',
  },
  ajjatanī: {
    en: 'Aorist / Simple or Recent Past',
    si: 'අතීත කාලය / ආසන්න අතීතය',
    th: 'อดีตกาลแบบ aorist / อดีตใกล้',
    my: 'Aorist / ရိုးရိုးအတိတ်ကာလ / မကြာသေးမီက အတိတ်ကာလ',
  },
  bhavissantī: {
    en: 'Future Indicative',
    si: 'අනාගත කාලය / දර්ශක විධිය',
    th: 'อนาคตกาล / บอกเล่า',
    my: 'အနာဂတ်ကာလ / ညွှန်ပြကာလ',
  },
  kālātipatti: {
    en: 'Conditional / Unfulfilled past condition',
    si: 'අතීතයේ නොසිදු වූ කොන්දේසි කාලය',
    th: 'เงื่อนไขที่ไม่เป็นจริงในอดีต',
    my: 'အတိတ်တွင် မဖြစ်မြောက်ခဲ့သော အခြေအနေပြကာလ',
  },
};

export const VACAKA_LABELS: Record<Vācaka, Localized> = {
  kattuvācaka: {
    en: 'Active voice',
    si: 'කර්තෘ වාචක',
    th: 'กัตตุวาจก',
    my: 'ကတ္တုဝါစက',
  },
  kammavācaka: {
    en: 'Passive voice',
    si: 'කර්ම වාචක',
    th: 'กัมมวาจก',
    my: 'ကမ္မဝါစက',
  },
  bhāvavācaka: {
    en: 'Impersonal voice',
    si: 'භාව වාචක',
    th: 'ภาววาจก',
    my: 'ဘာဝဝါစက',
  },
};
