import * as fs from 'fs';

/**
 * Shared UTF-16LE reader for the CSCD source corpus.
 *
 * The corpus files (tree.json and the TEI.2 XML) are UTF-16LE, usually with a
 * BOM. This single helper replaces the BOM-detect-and-decode block that was
 * previously copied across the tree builder, XML parser, and build script.
 */
export function readUtf16(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  const hasBom = buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe;
  return new TextDecoder('utf-16le').decode(hasBom ? buf.subarray(2) : buf);
}

/** Reads and JSON-parses a UTF-16LE file. */
export function readUtf16Json(filePath: string): unknown {
  return JSON.parse(readUtf16(filePath));
}
