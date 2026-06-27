export interface SeedArgs {
  remote: boolean;
  conflict: 'ignore' | 'update';
}

export function parseArgs(): SeedArgs {
  const argv = process.argv.slice(2);
  return {
    remote: argv.includes('--remote'),
    conflict: argv.includes('--upsert') ? 'update' : 'ignore',
  };
}
