import { execFileSync } from 'child_process';
import { DB_NAME } from '../corpus/constants.ts';

const LOCAL_WRANGLER_STATE = '../../.wrangler/state';
// Shared repo-root config (resolved relative to the package cwd).
const SHARED_CONFIG = '../../wrangler.jsonc';

export function executeSqlFile(sqlPath: string, remote: boolean): void {
  const args = [
    'd1',
    'execute',
    DB_NAME,
    '--file',
    sqlPath,
    '--config',
    SHARED_CONFIG,
    ...(remote
      ? ['--remote']
      : ['--local', '--persist-to', LOCAL_WRANGLER_STATE]),
  ];
  console.log(`▶ wrangler ${args.join(' ')}`);
  execFileSync('wrangler', args, { stdio: 'inherit' });
}
