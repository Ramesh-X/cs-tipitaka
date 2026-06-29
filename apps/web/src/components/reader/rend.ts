export type RendClass =
  | 'banner'
  | 'chapter'
  | 'subhead'
  | 'subsubhead'
  | 'centre'
  | 'verse'
  | 'body';

export function classifyRend(rend: string | undefined): RendClass {
  switch (rend) {
    case 'nikaya':
    case 'book':
      return 'banner';
    case 'chapter':
    case 'title':
      return 'chapter';
    case 'subhead':
      return 'subhead';
    case 'subsubhead':
      return 'subsubhead';
    case 'centre':
      return 'centre';
    case 'gatha1':
    case 'gatha2':
    case 'gatha3':
    case 'gathalast':
      return 'verse';
    default:
      return 'body';
  }
}
