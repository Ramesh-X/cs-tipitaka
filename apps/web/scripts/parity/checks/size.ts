import type { Report } from '../lib/report.ts';

// Cloudflare's hard per-file limit is 25 MiB (Workers Static Assets) — leave headroom.
const HARD_LIMIT_BYTES = 20 * 1024 * 1024;
// Informational only — flags pages worth watching, not a failure.
const WARN_LIMIT_BYTES = 3 * 1024 * 1024;
// Cloudflare's free-tier file-count limit; paid is 100,000. Informational.
const FREE_TIER_FILE_LIMIT = 20000;

export interface SizeStats {
  count: number;
  totalBytes: number;
  maxBytes: number;
  maxUrlPath: string;
  warnCount: number;
}

export function newSizeStats(): SizeStats {
  return { count: 0, totalBytes: 0, maxBytes: 0, maxUrlPath: '', warnCount: 0 };
}

export function checkSize(
  report: Report,
  urlPath: string,
  bytes: number,
  stats: SizeStats,
): void {
  stats.count += 1;
  stats.totalBytes += bytes;
  if (bytes > stats.maxBytes) {
    stats.maxBytes = bytes;
    stats.maxUrlPath = urlPath;
  }

  if (bytes > HARD_LIMIT_BYTES) {
    report.fail(
      'size',
      `${(bytes / 1048576).toFixed(1)} MiB exceeds the ${HARD_LIMIT_BYTES / 1048576} MiB budget`,
      urlPath,
    );
  } else if (bytes > WARN_LIMIT_BYTES) {
    stats.warnCount += 1;
  }
}

export function summarizeSize(report: Report, stats: SizeStats): void {
  const avgKb = stats.totalBytes / stats.count / 1024;
  report.log(
    `[size] ${stats.count} pages, ${(stats.totalBytes / 1073741824).toFixed(2)} GB total, ` +
      `avg ${avgKb.toFixed(0)} KB, max ${(stats.maxBytes / 1048576).toFixed(2)} MB (${stats.maxUrlPath})`,
  );
  if (stats.warnCount > 0) {
    report.log(
      `[size] ${stats.warnCount} page(s) over ${WARN_LIMIT_BYTES / 1048576} MiB — see above for the worst offender`,
    );
  }
  if (stats.count > FREE_TIER_FILE_LIMIT) {
    report.log(
      `[size] ${stats.count} files exceeds the free-tier ${FREE_TIER_FILE_LIMIT}-file limit (paid tier: 100,000) — confirm the Workers plan`,
    );
  }
}
