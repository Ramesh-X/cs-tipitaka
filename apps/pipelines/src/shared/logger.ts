export function step(msg: string): void {
  console.log(`▶ ${msg}`);
}

export function info(msg: string): void {
  console.log(`  ${msg}`);
}

export function warn(msg: string): void {
  console.warn(`  ⚠ ${msg}`);
}

export function ok(msg: string): void {
  console.log(`  ✓ ${msg}`);
}

export function done(msg: string): void {
  console.log(`✅ ${msg}`);
}

export function fail(msg: string): void {
  console.error(`✗ ${msg}`);
}
