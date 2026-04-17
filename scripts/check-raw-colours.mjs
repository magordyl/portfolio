#!/usr/bin/env node
/**
 * check-raw-colours — fail the build if a component references the raw
 * colour scale (--royal-*, --violet-*) directly. Components must reference
 * role tokens instead; see plans/portfolio-design-tokens.md §Component
 * variant allowlists.
 *
 * Allowed locations for raw-scale references:
 *   - src/styles/globals.css         (the token layer itself)
 *   - design.tokens.ts                (mirror for tooling)
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\//, '');
const SCAN_DIRS = ['src/components', 'src/layouts', 'src/pages'];
const ALLOWLIST = new Set();
const PATTERN = /var\(--(royal|violet)-\d+\b/;

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (/\.(astro|tsx?|jsx?|css|mdx?)$/.test(e.name)) out.push(p);
  }
  return out;
}

const violations = [];
for (const dir of SCAN_DIRS) {
  const abs = join(ROOT, dir);
  let files;
  try { files = await walk(abs); } catch { continue; }
  for (const file of files) {
    const rel = relative(ROOT, file).replaceAll(sep, '/');
    if (ALLOWLIST.has(rel)) continue;
    const src = await readFile(file, 'utf8');
    const lines = src.split('\n');
    lines.forEach((line, i) => {
      if (PATTERN.test(line)) {
        violations.push(`${rel}:${i + 1}  ${line.trim()}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error('Raw-scale colour references found. Components must use role tokens:');
  console.error('');
  for (const v of violations) console.error(`  ${v}`);
  console.error('');
  console.error('Role tokens live in src/styles/globals.css (§Role tokens).');
  console.error('Allowlists: plans/portfolio-design-tokens.md §Component variant allowlists.');
  process.exit(1);
}

console.log(`check-raw-colours: no raw-scale references found (${ALLOWLIST.size} file(s) on allowlist).`);
