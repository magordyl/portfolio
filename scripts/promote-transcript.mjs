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
import { spawnSync } from 'child_process';
import { parseArgs } from 'util';
import { mergeToolOnlyTurns, classifyAll } from './turn-classifier.mjs';

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
  // Repair pre-fix drafts (tool-only turns, missing kinds) before validation.
  draft.turns = classifyAll(mergeToolOnlyTurns(draft.turns));
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

// Rewrite the repaired draft back to disk so the preview harness picks up the
// same turns we'll promote (otherwise the harness re-reads the unrepaired file).
writeFileSync(draftPath, JSON.stringify(draft, null, 2));

// ── Metadata summary (one-liner) ─────────────────────────────────────────────

console.log('');
console.log(`  Draft:   ${slug}`);
console.log(`  Title:   ${draft.title}`);
console.log(`  Date:    ${draft.date}`);
console.log(`  Turns:   ${draft.turns.length}`);
console.log(`  Context: ${draft.context || '(empty — fill this in before promoting)'}`);
console.log(`  Note:    ${draft.note || '(none)'}`);
console.log('');

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

// ── Preview-then-prompt review loop ──────────────────────────────────────────

const previewScript = join(__dirname, 'preview-transcript.mjs');

function renderPreview() {
  const result = spawnSync(process.execPath, [previewScript, '--slug', slug, '--open'], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    console.warn('  (preview render returned non-zero — continuing anyway)');
  }
}

async function promptAction() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    const msg = '  Review options: [p]romote  [e]dit draft  [r]e-render preview  [c]ancel > ';
    rl.question(msg, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function editDraftInEditor() {
  const editor = process.env.EDITOR || (process.platform === 'win32' ? 'notepad' : 'nano');
  const result = spawnSync(editor, [draftPath], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.warn(`  $EDITOR (${editor}) exited non-zero. Check the draft manually at:\n    ${draftPath}`);
  }
  // Re-load, re-redact, re-validate.
  const reloaded = JSON.parse(readFileSync(draftPath, 'utf8'));
  if (reloaded.turns) {
    reloaded.turns = reloaded.turns.map(t => ({ ...t, text: redact(t.text) }));
    reloaded.turns = classifyAll(mergeToolOnlyTurns(reloaded.turns));
  }
  writeFileSync(draftPath, JSON.stringify(reloaded, null, 2));
  Object.assign(draft, reloaded);
}

async function reviewLoop() {
  if (skip) return true;

  renderPreview();
  console.log('');
  console.log('  Hand-review checklist:');
  console.log('    • No real names that should be anonymised');
  console.log('    • No absolute paths missed by the regex');
  console.log('    • No private project names or internal details');
  console.log('    • Nothing you would not want a hiring manager to see');
  console.log('');

  while (true) {
    const answer = await promptAction();
    if (answer === 'p' || answer === 'promote') return true;
    if (answer === 'c' || answer === 'cancel' || answer === '') {
      console.log('Aborted. Draft left in place.');
      return false;
    }
    if (answer === 'e' || answer === 'edit') {
      await editDraftInEditor();
      renderPreview();
      continue;
    }
    if (answer === 'r' || answer === 'rerender' || answer === 're-render') {
      renderPreview();
      continue;
    }
    console.log(`  Unknown option: "${answer}". Try p/e/r/c.`);
  }
}

const confirmed = await reviewLoop();
if (!confirmed) process.exit(0);

// ── Strip internal fields and promote ────────────────────────────────────────

// Remove private metadata fields before publishing
const { _capturedAt, ...published } = draft;

writeFileSync(publishedPath, JSON.stringify(published, null, 2));
unlinkSync(draftPath);

console.log(`✓ promoted ${slug} → src/content/transcripts/${slug}.json`);
console.log('  Commit when ready: git add src/content/transcripts/ && git commit -m "portfolio: add transcript <slug>"');
