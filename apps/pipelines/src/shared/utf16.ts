import * as fs from 'fs';

export function readUtf16(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  const hasBom = buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe;
  return new TextDecoder('utf-16le').decode(hasBom ? buf.subarray(2) : buf);
}

export function readUtf16Json(filePath: string): unknown {
  return JSON.parse(readUtf16(filePath));
}
