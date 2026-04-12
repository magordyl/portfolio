#!/usr/bin/env node
/**
 * writing-topic.mjs
 * Captures a writing post idea into portfolio/plans/writing-topics/.
 *
 * Primary usage (freeform):
 *   node scripts/writing-topic.mjs "optimising the portfolio curation workflow"
 *
 * Structured flags (override auto-derived fields):
 *   --slug <kebab> --title "..." --thesis "..." --transcript <slug> --context "..."
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import {
  findActiveSession, parseSessionEvents, extractRecentUserContext, redact,
} from './session-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const topicsDir = join(projectRoot, 'plans', 'writing-topics');
const indexPath = join(topicsDir, 'INDEX.md');

// ── Parse args ──────────────────────────────────────────────────────────────

const { values: args, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    slug:       { type: 'string' },
    title:      { type: 'string' },
    thesis:     { type: 'string' },
    transcript: { type: 'string' },
    context:    { type: 'string' },
  },
  allowPositionals: true,
  strict: true,
});

// Freeform text is the positional argument
const freeformText = positionals.join(' ').trim();

if (!freeformText && !args.slug) {
  console.error('Usage: node scripts/writing-topic.mjs "<freeform idea text>"');
  console.error('   or: node scripts/writing-topic.mjs --slug <slug> --title "..." --thesis "..."');
  process.exit(1);
}

// ── Derive fields ───────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .split('-')
    .filter(Boolean)
    .slice(0, 6)
    .join('-');
}

function dedupeSlug(baseSlug) {
  const existing = existsSync(topicsDir)
    ? readdirSync(topicsDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md').map(f => f.replace('.md', ''))
    : [];

  if (!existing.includes(baseSlug)) return baseSlug;

  let i = 2;
  while (existing.includes(`${baseSlug}-${i}`)) i++;
  return `${baseSlug}-${i}`;
}

function detectSourceProject() {
  const cwd = process.cwd();
  const knownProjects = ['planner-app', 'portfolio', 'the-weekly-app', 'design-system'];
  for (const proj of knownProjects) {
    if (cwd.includes(proj)) return proj;
  }
  return basename(cwd);
}

const slug = args.slug || dedupeSlug(slugify(freeformText));
const title = args.title || (freeformText.length <= 60
  ? freeformText.charAt(0).toUpperCase() + freeformText.slice(1)
  : freeformText.slice(0, 57) + '...');
const thesis = args.thesis || freeformText;
const sourceProject = detectSourceProject();

// ── Auto-capture session context ────────────────────────────────────────────

let sessionContext = args.context || '';
if (!sessionContext) {
  try {
    const session = findActiveSession({ maxStaleMs: 10 * 60 * 1000 });
    const events = parseSessionEvents(session.path);
    const recentMessages = extractRecentUserContext(events, 5);
    if (recentMessages.length > 0) {
      sessionContext = recentMessages.map(m => `- ${m}`).join('\n');
    }
  } catch {
    // No active session or stale — context stays empty, which is fine
  }
}

// ── Auto-link transcripts ───────────────────────────────────────────────────

let transcripts = [];
if (args.transcript) {
  transcripts = [args.transcript];
} else {
  const draftsDir = join(projectRoot, 'src', 'content', 'transcripts', 'drafts');
  if (existsSync(draftsDir)) {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const recentDrafts = readdirSync(draftsDir)
      .filter(f => f.endsWith('.json'))
      .filter(f => statSync(join(draftsDir, f)).mtimeMs > tenMinutesAgo)
      .map(f => f.replace('.json', ''));

    if (recentDrafts.length === 1) {
      transcripts = recentDrafts;
    } else if (recentDrafts.length > 1) {
      console.log(`Multiple recent transcript drafts found: ${recentDrafts.join(', ')}`);
      console.log('Add one manually with --transcript <slug> if needed.');
    }
  }
}

// ── Write the topic file ────────────────────────────────────────────────────

mkdirSync(topicsDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const topicPath = join(topicsDir, `${slug}.md`);

if (existsSync(topicPath)) {
  console.error(`Error: topic file already exists at ${topicPath}`);
  console.error('Pick a different slug or edit the existing file directly.');
  process.exit(1);
}

const frontmatter = [
  '---',
  `slug: ${slug}`,
  `title: "${title.replace(/"/g, '\\"')}"`,
  `status: seed`,
  `captured: ${today}`,
  `transcripts: [${transcripts.map(t => `"${t}"`).join(', ')}]`,
  `source_project: ${sourceProject}`,
  `context: ""`,
  '---',
].join('\n');

const contextSection = sessionContext
  ? `\n## Session context (auto-captured)\n\n${sessionContext}\n`
  : '';

const body = `${frontmatter}

## Thesis

${redact(thesis)}
${contextSection}
## Draft status

\`[seed]\`. Captured ${today}. Do not expand into a draft until chunk 5.5 begins.
`;

writeFileSync(topicPath, body);

// ── Append to INDEX.md ──────────────────────────────────────────────────────

if (existsSync(indexPath)) {
  const indexContent = readFileSync(indexPath, 'utf8');
  const newLine = `- [${slug}](${slug}.md) — [seed] ${title} — ${sourceProject}, ${today}`;

  // Insert in alphabetical order among existing entries
  const lines = indexContent.split('\n');
  const entryLines = [];
  let lastEntryIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('- [')) {
      entryLines.push({ idx: i, line: lines[i] });
      lastEntryIdx = i;
    }
  }

  // Find insertion point (alphabetical by slug)
  let insertIdx;
  const insertAfter = entryLines.findIndex(e => {
    const match = e.line.match(/^- \[([^\]]+)\]/);
    return match && match[1].localeCompare(slug) > 0;
  });

  if (insertAfter >= 0) {
    insertIdx = entryLines[insertAfter].idx;
  } else {
    insertIdx = lastEntryIdx >= 0 ? lastEntryIdx + 1 : lines.length;
  }

  lines.splice(insertIdx, 0, newLine);
  writeFileSync(indexPath, lines.join('\n'));
}

// ── Output ──────────────────────────────────────────────────────────────────

const absPath = topicPath.replace(/\\/g, '/');
console.log(`✓ writing topic captured → plans/writing-topics/${slug}.md`);
console.log(`  Source: ${sourceProject}`);
if (transcripts.length > 0) {
  console.log(`  Auto-linked transcript: ${transcripts.join(', ')}`);
}
console.log(`  Full path: ${absPath}`);
