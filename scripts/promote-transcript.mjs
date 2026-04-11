#!/usr/bin/env node
/**
 * promote-transcript.mjs
 * Promotes a reviewed draft to the published transcripts collection.
 *
 * Usage:
 *   node scripts/promote-transcript.mjs --slug <slug> [--dry-run] [--yes]
 *
 * Options:
 *   --slug <slug>  Required. Slug of the draft to promote
 *   --dry-run      Print what would change without moving files
 *   --yes          Skip the interactive hand-review prompt (use after reviewing)
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { parseArgs } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// ── Parse args ───────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    slug:    { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    yes:     { type: 'boolean', default: false },
  },
  strict: true,
});

if (!args.slug) {
  console.error('Error: --slug is required');
  console.error('Usage: node scripts/promote-transcript.mjs --slug <slug> [--dry-run] [--yes]');
  process.exit(1);
}

const slug   = args.slug;
const dryRun = args['dry-run'];
const skip   = args.yes;

// ── Read draft ───────────────────────────────────────────────────────────────

const draftPath     = join(projectRoot, 'src', 'content', 'transcripts', 'drafts', `${slug}.json`);
const publishedPath = join(projectRoot, 'src', 'content', 'transcripts', `${slug}.json`);

if (!existsSync(draftPath)) {
  console.error(`Error: no draft found at:\n  ${draftPath}`);
  process.exit(1);
}

let draft;
try {
  draft = JSON.parse(readFileSync(draftPath, 'utf8'));
} catch (err) {
  console.error(`Error: could not parse draft JSON — ${err.message}`);
  process.exit(1);
}

// ── Re-run redaction pass (defence in depth) ─────────────────────────────────

function redact(text) {
  if (typeof text !== 'string') return text;
  text = text.replace(/C:\\Users\\User\\([^\s"'<>]+)/g,   (_, r) => '~/' + r.replace(/\\/g, '/'));
  text = text.replace(/C:\/Users\/User\/([^\s"'<>]+)/g,   '~/$1');
  text = text.replace(/\/c\/Users\/User\/([^\s"'<>]+)/g,  '~/$1');
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[redacted-email]');
  text = text.replace(/sk-[a-zA-Z0-9_-]{20,}/g,              '[REDACTED]');
  text = text.replace(/gh[ps]_[a-zA-Z0-9]{20,}/g,            '[REDACTED]');
  text = text.replace(/Bearer\s+[a-zA-Z0-9._-]{20,}/g,       'Bearer [REDACTED]');
  return text;
}

if (draft.turns) {
  draft.turns = draft.turns.map(t => ({ ...t, text: redact(t.text) }));
}

// ── Structural validation ────────────────────────────────────────────────────

const errors = [];

if (!draft.id || typeof draft.id !== 'string') errors.push('missing or invalid "id" field');
if (!draft.title || typeof draft.title !== 'string') errors.push('missing or invalid "title" field');
if (!draft.date) errors.push('missing "date" field');
if (typeof draft.context !== 'string') errors.push('"context" must be a string');
if (!draft.sourceSessionId) errors.push('missing "sourceSessionId" field');

if (!Array.isArray(draft.turns)) {
  errors.push('"turns" must be an array');
} else {
  if (draft.turns.length < 2)  errors.push(`too few turns: ${draft.turns.length} (minimum 2)`);
  if (draft.turns.length > 8)  errors.push(`too many turns: ${draft.turns.length} (maximum 8)`);

  draft.turns.forEach((t, i) => {
    if (!['user', 'assistant'].includes(t.role)) errors.push(`turn ${i}: invalid role "${t.role}"`);
    if (!t.text || !t.text.trim()) errors.push(`turn ${i}: empty text`);
  });
}

if (errors.length > 0) {
  console.error('Structural validation failed:');
  errors.forEach(e => console.error(`  • ${e}`));
  process.exit(1);
}

// ── Print draft for review ───────────────────────────────────────────────────

console.log('\n──────────────────────────────────────────');
console.log(`  Draft: ${slug}`);
console.log(`  Title: ${draft.title}`);
console.log(`  Date:  ${draft.date}`);
console.log(`  Context: ${draft.context || '(empty — fill this in)'}`);
console.log(`  Note:  ${draft.note || '(none)'}`);
console.log(`  Turns: ${draft.turns.length}`);
console.log('──────────────────────────────────────────');
draft.turns.forEach((t, i) => {
  const preview = t.text.slice(0, 120).replace(/\n/g, ' ');
  const tools   = t.collapsedTools?.length ? ` [+ ${t.collapsedTools.length} tool(s)]` : '';
  console.log(`  [${i + 1}] ${t.role.padEnd(9)} ${preview}${preview.length >= 120 ? '…' : ''}${tools}`);
});
console.log('──────────────────────────────────────────\n');

if (dryRun) {
  console.log(`Dry run: would promote draft → src/content/transcripts/${slug}.json`);
  console.log('No files were changed.');
  process.exit(0);
}

if (existsSync(publishedPath)) {
  console.error(`Error: a published file already exists at:\n  ${publishedPath}`);
  console.error('Remove or rename it before promoting this draft.');
  process.exit(1);
}

// ── Hand-review prompt ───────────────────────────────────────────────────────

async function confirm() {
  if (skip) return true;

  console.log('Before promoting, confirm:');
  console.log('  • No real names that should be anonymised?');
  console.log('  • No absolute paths missed by the regex?');
  console.log('  • No private project names or internal details?');
  console.log('  • Nothing you would not want a hiring manager to see?');
  console.log('');
  console.log('Type "yes" to proceed, anything else to abort:');

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('> ', answer => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

const confirmed = await confirm();
if (!confirmed) {
  console.log('Aborted. Draft unchanged.');
  process.exit(0);
}

// ── Strip internal fields and promote ────────────────────────────────────────

// Remove private metadata fields before publishing
const { _capturedAt, ...published } = draft;

writeFileSync(publishedPath, JSON.stringify(published, null, 2));
unlinkSync(draftPath);

console.log(`✓ promoted ${slug} → src/content/transcripts/${slug}.json`);
console.log('  Commit when ready: git add src/content/transcripts/ && git commit -m "portfolio: add transcript <slug>"');
