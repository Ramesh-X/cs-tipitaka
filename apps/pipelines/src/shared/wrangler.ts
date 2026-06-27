import { execFileSync } from 'child_process';
import { DB_NAME } from '../corpus/constants.ts';

export function executeSqlFile(sqlPath: string, remote: boolean): void {
  const args = [
    'd1',
    'execute',
    DB_NAME,
    '--file',
    sqlPath,
    remote ? '--remote' : '--local',
  ];
  console.log(`▶ wrangler ${args.join(' ')}`);
  execFileSync('wrangler', args, { stdio: 'inherit' });
}
