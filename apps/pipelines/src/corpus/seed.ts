import { parseArgs } from '../shared/args.ts';
import { EMPTY_TOLERANCE } from './constants.ts';
import { done, fail, info, ok, step, warn } from '../shared/logger.ts';
import { SqlWriter, writeNodeRow, writeParagraphRow } from '../shared/sql.ts';
import {
  type DocRef,
  type FlatNode,
  buildCorpusTree,
  flattenForDb,
} from './tree.ts';
import { parseSection, sectionCount } from './xml-parser.ts';
import { executeSqlFile } from '../shared/wrangler.ts';

const args = parseArgs();

function parseHref(
  href: string,
): { filename: string; sectionIdx: number } | null {
  const base = href.replace(/^cscd\//, '');
  const match = base.match(/^(.+?\.(mul|att|tik|nrf))(\d+)\.xml$/);
  if (match) {
    return { filename: `${match[1]}.xml`, sectionIdx: parseInt(match[3], 10) };
  }
  if (/\.(mul|att|tik|nrf)\.xml$/.test(base)) {
    return { filename: base, sectionIdx: 0 };
  }
  return null;
}

function main(): void {
  step('Building corpus node tree…');
  const tree = buildCorpusTree();

  const allNodes: FlatNode[] = [];
  const docRefs: DocRef[] = [];
  flattenForDb(tree, null, [], allNodes, docRefs);

  const typeCounts = { pitaka: 0, nikaya: 0, collection: 0, document: 0 };
  for (const n of allNodes) {
    typeCounts[n.type as keyof typeof typeCounts]++;
  }
  info(
    `tree: ${allNodes.length} nodes ` +
      `(${typeCounts.pitaka} pitaka / ${typeCounts.nikaya} nikaya / ` +
      `${typeCounts.collection} collection / ${typeCounts.document} document)`,
  );

  step('Grouping documents by source file…');
  type Ref = { slug: string; idx: number };
  const byFile = new Map<string, Ref[]>();
  let missingHref = 0;

  for (const { slug, href } of docRefs) {
    const parsed = href ? parseHref(href) : null;
    if (!parsed) {
      missingHref++;
      warn(`unparseable/missing href for "${slug}" (href=${href ?? 'none'})`);
      continue;
    }
    const refs = byFile.get(parsed.filename) ?? [];
    refs.push({ slug, idx: parsed.sectionIdx });
    byFile.set(parsed.filename, refs);
  }
  if (missingHref > 0) info(`${missingHref} document(s) with missing href`);

  step('Parsing XML sections (fold heuristic applied per file)…');
  const paragraphMap = new Map<
    string,
    { rend: string; pali: string; num?: string; pts?: string; cst?: string }[]
  >();

  for (const [filename, refs] of byFile) {
    const refCount = Math.max(...refs.map((r) => r.idx)) + 1;
    const natural = sectionCount(filename);
    const delta = natural - refCount;
    const fold = delta === 1;

    info(
      `parse ${filename}: ${natural} sections, ref ${refCount}, fold=${fold}`,
    );

    if (delta < 0 || delta > 1) {
      warn(
        `${filename}: ${natural} parsed vs ${refCount} referenced (Δ${delta}) — CSCD mismatch`,
      );
    }
    if (new Set(refs.map((r) => r.idx)).size !== refs.length) {
      warn(`${filename}: duplicate section index in tree.json`);
    }

    for (const { slug, idx } of refs) {
      const paragraphs =
        fold && idx === 0
          ? [...parseSection(filename, 0), ...parseSection(filename, 1)]
          : parseSection(filename, fold ? idx + 1 : idx);
      paragraphMap.set(slug, paragraphs);
      info(`    ${slug} → ${paragraphs.length} paragraphs`);
    }
  }

  step('Streaming SQL to temp file…');
  const writer = new SqlWriter();
  let nodeFailures = 0;
  let paraFailures = 0;
  let totalParas = 0;
  const emptyDocs: string[] = [];

  writer.writeLine('BEGIN;');
  writer.writeLine('');

  for (const node of allNodes) {
    if (!writeNodeRow(writer, node, args.conflict)) {
      nodeFailures++;
      warn(`node "${node.slug}" skipped (validation failed)`);
    }
  }

  writer.writeLine('');

  for (const { slug } of docRefs) {
    const paras = paragraphMap.get(slug) ?? [];
    if (paras.length === 0) {
      emptyDocs.push(slug);
      continue;
    }
    for (let pos = 0; pos < paras.length; pos++) {
      const p = paras[pos];
      if (
        !writeParagraphRow(
          writer,
          {
            document_slug: slug,
            position: pos + 1,
            rend: p.rend ?? null,
            num: p.num ?? null,
            pts: p.pts ?? null,
            cst: p.cst ?? null,
            pali: p.pali,
          },
          args.conflict,
        )
      ) {
        paraFailures++;
        warn(`paragraph "${slug}"[${pos + 1}] skipped`);
      } else {
        totalParas++;
      }
    }
  }

  writer.writeLine('');
  writer.writeLine('COMMIT;');
  writer.close();

  const failures = nodeFailures + paraFailures;
  ok(
    `${allNodes.length - nodeFailures} nodes, ${totalParas} paragraphs written`,
  );

  if (emptyDocs.length > 0) {
    warn(`${emptyDocs.length} empty document(s):`);
    for (const d of emptyDocs) warn(`  ${d}`);
  }
  if (failures > 0) {
    warn(
      `${failures} validation failure(s) — ${nodeFailures} nodes, ${paraFailures} paragraphs`,
    );
  }

  ok(`SQL written to ${writer.path} (${writer.lineCount()} lines)`);

  if (emptyDocs.length > EMPTY_TOLERANCE) {
    writer.cleanup();
    fail(
      `Too many empty docs (${emptyDocs.length} > ${EMPTY_TOLERANCE}) — aborting`,
    );
    process.exit(1);
  }

  if (failures > 0) {
    writer.cleanup();
    fail(`Aborting — ${failures} validation failure(s), DB not seeded`);
    process.exit(1);
  }

  try {
    executeSqlFile(writer.path, args.remote);
    done('Corpus seed complete');
  } finally {
    writer.cleanup();
  }
}

main();
