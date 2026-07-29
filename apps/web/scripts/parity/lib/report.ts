export interface Issue {
  check: string;
  message: string;
  urlPath?: string;
}

export class Report {
  private issues: Issue[] = [];
  private info: string[] = [];

  fail(check: string, message: string, urlPath?: string): void {
    this.issues.push({ check, message, urlPath });
  }

  log(message: string): void {
    this.info.push(message);
  }

  get hasFailures(): boolean {
    return this.issues.length > 0;
  }

  print(): void {
    for (const line of this.info) console.log(line);

    if (this.issues.length === 0) {
      console.log('\n✅ All parity checks passed.');
      return;
    }

    console.log(`\n❌ ${this.issues.length} parity issue(s):\n`);
    const byCheck = new Map<string, Issue[]>();
    for (const issue of this.issues) {
      const bucket = byCheck.get(issue.check) ?? [];
      bucket.push(issue);
      byCheck.set(issue.check, bucket);
    }

    for (const [check, issues] of byCheck) {
      console.log(`[${check}] ${issues.length} issue(s)`);
      for (const issue of issues.slice(0, 20)) {
        const where = issue.urlPath ? ` (${issue.urlPath})` : '';
        console.log(`  - ${issue.message}${where}`);
      }
      if (issues.length > 20) {
        console.log(`  ... and ${issues.length - 20} more`);
      }
    }
  }
}
