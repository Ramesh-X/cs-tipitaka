declare module '@pnfo/pali-converter' {
  export function convert(
    text: string,
    fromScript: string,
    toScript: string,
  ): string;
}
