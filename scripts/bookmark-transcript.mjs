#!/usr/bin/env node
/**
 * bookmark-transcript.mjs
 * Captures the last N turns from the active Claude session as a transcript draft.
 *
 * Usage:
 *   node scripts/bookmark-transcript.mjs --slug <slug> [--note "<note>"] [--back <N>] [--extend]
 *
 * Options:
 *   --slug <slug>    Required. Kebab-case identifier (e.g. "card-layout-decision")
 *   --note "<note>"  Optional annotation in your voice
 *   --back <N>       Number of turns to capture (default: 6)
 *   --extend         Append to existing draft instead of overwriting
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// ── Parse args ──────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    slug:   { type: 'string' },
    note:   { type: 'string', default: '' },
    back:   { type: 'string', default: '6' },
    extend: { type: 'boolean', default: false },
  },
  strict: true,
});

if (!args.slug) {
  console.error('Error: --slug is required');
  console.error('Usage: node scripts/bookmark-transcript.mjs --slug <slug> [--note "<note>"] [--back <N>] [--extend]');
  process.exit(1);
}

const slug   = args.slug;
const note   = args.note || '';
const back   = parseInt(args.back, 10);
const extend = args.extend;

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error('Error: slug must be kebab-case (lowercase letters, numbers, hyphens only)');
  process.exit(1);
}

if (isNaN(back) || back < 1) {
  console.error('Error: --back must be a positive integer');
  process.exit(1);
}

// ── Guard: refuse if slug already promoted ───────────────────────────────────

const publishedPath = join(projectRoot, 'src', 'content', 'transcripts', `${slug}.json`);
if (existsSync(publishedPath)) {
  console.error(`Error: a published transcript "${slug}" already exists at:\n  ${publishedPath}`);
  console.error('Pick a different slug or edit the published file directly.');
  process.exit(1);
}

// ── Locate active session JSONL ──────────────────────────────────────────────

const projectsDir = join(homedir(), '.claude', 'projects', 'C--Users-User-Documents-Claude-code');

if (!existsSync(projectsDir)) {
  console.error(`Error: Claude projects directory not found:\n  ${projectsDir}`);
  process.exit(1);
}

const jsonlFiles = readdirSync(projectsDir)
  .filter(f => f.endsWith('.jsonl'))
  .map(f => {
    const fullPath = join(projectsDir, f);
    return { name: f, path: fullPath, mtime: statSync(fullPath).mtimeMs };
  })
  .sort((a, b) => b.mtime - a.mtime);

if (jsonlFiles.length === 0) {
  console.error('Error: no session JSONL files found.');
  process.exit(1);
}

const mostRecent = jsonlFiles[0];
const msSinceModified = Date.now() - mostRecent.mtime;
const FIVE_MINUTES = 5 * 60 * 1000;

if (msSinceModified > FIVE_MINUTES) {
  const mins = Math.round(msSinceModified / 60000);
  console.error(`Error: most recent session file was last modified ${mins} minute(s) ago.`);
  console.error(`  File: ${mostRecent.name}`);
  console.error('Bookmarking a stale session is almost always a mistake. Are you in the right terminal?');
  process.exit(1);
}

// ── Parse JSONL ──────────────────────────────────────────────────────────────

const rawLines = readFileSync(mostRecent.path, 'utf8').split('\n').filter(Boolean);
const events = [];
for (let i = 0; i < rawLines.length; i++) {
  try {
    events.push(JSON.parse(rawLines[i]));
  } catch {
    console.warn(`Warning: skipped malformed JSON on line ${i + 1}`);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isRealUserTurn(ev) {
  if (ev.type !== 'user') return false;
  if (ev.isMeta === true) return false;

  const content = ev.message?.content;
  if (!content) return false;

  if (typeof content === 'string') {
    // Filter out injected system messages
    const trimmed = content.trim();
    if (
      trimmed.startsWith('<command-name>') ||
      trimmed.startsWith('<local-command-stdout>') ||
      trimmed.startsWith('<local-command-caveat>') ||
      trimmed.startsWith('<system-reminder>')
    ) return false;
    return trimmed.length > 0;
  }

  if (Array.isArray(content)) {
    // Must have at least one non-empty text block (not just tool_results)
    return content.some(b => b.type === 'text' && b.text?.trim().length > 0);
  }

  return false;
}

function isAssistantTurn(ev) {
  return ev.type === 'assistant' && Array.isArray(ev.message?.content);
}

function labelToolUse(name, input = {}) {
  switch (name) {
    case 'Read':   return `[Read ${input.file_path || ''}]`;
    case 'Edit':   return `[Edit ${input.file_path || ''}]`;
    case 'Write':  return `[Write ${input.file_path || ''}]`;
    case 'Bash':   return `[Bash: ${String(input.command || '').slice(0, 40)}]`;
    case 'Glob':   return `[Glob: ${input.pattern || ''} in ${input.path || '.'}]`;
    case 'Grep':   return `[Grep: ${input.pattern || ''}]`;
    case 'Agent':  return `[Agent: ${String(input.description || '').slice(0, 60)}]`;
    case 'Skill':  return `[Skill: ${input.skill || ''}]`;
    default:       return `[${name}]`;
  }
}

function extractUserText(ev) {
  const content = ev.message?.content;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim();
  }
  return '';
}

function extractAssistantContent(ev) {
  const content = ev.message?.content;
  if (!Array.isArray(content)) return { text: '', collapsedTools: [] };

  const textParts = [];
  const collapsedTools = [];

  for (const block of content) {
    if (block.type === 'text' && block.text?.trim()) {
      textParts.push(block.text.trim());
    } else if (block.type === 'tool_use') {
      collapsedTools.push(labelToolUse(block.name, block.input));
    }
    // Skip 'thinking' blocks
  }

  return { text: textParts.join('\n\n'), collapsedTools };
}

function redact(text) {
  // Windows absolute paths → ~/...
  text = text.replace(/C:\\Users\\User\\([^\s"'<>]+)/g,   (_, r) => '~/' + r.replace(/\\/g, '/'));
  text = text.replace(/C:\/Users\/User\/([^\s"'<>]+)/g,   '~/$1');
  text = text.replace(/\/c\/Users\/User\/([^\s"'<>]+)/g,  '~/$1');
  // Email addresses
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[redacted-email]');
  // Common token prefixes
  text = text.replace(/sk-[a-zA-Z0-9_-]{20,}/g,              '[REDACTED]');
  text = text.replace(/gh[ps]_[a-zA-Z0-9]{20,}/g,            '[REDACTED]');
  text = text.replace(/Bearer\s+[a-zA-Z0-9._-]{20,}/g,       'Bearer [REDACTED]');
  return text;
}

// ── Build turn list ──────────────────────────────────────────────────────────

const allRealTurns = events.filter(ev => isRealUserTurn(ev) || isAssistantTurn(ev));

// If --extend, use timestamp of existing draft's _capturedAt to find new turns
let candidateTurns = allRealTurns;
const draftPath = join(projectRoot, 'src', 'content', 'transcripts', 'drafts', `${slug}.json`);

if (extend && existsSync(draftPath)) {
  const existing = JSON.parse(readFileSync(draftPath, 'utf8'));
  if (existing._capturedAt) {
    const lastCaptureMs = new Date(existing._capturedAt).getTime();
    const afterCapture = allRealTurns.filter(ev => {
      const ts = ev.timestamp ? new Date(ev.timestamp).getTime() : 0;
      return ts > lastCaptureMs;
    });
    candidateTurns = afterCapture.length > 0 ? afterCapture : allRealTurns.slice(-back);
  } else {
    candidateTurns = allRealTurns.slice(-back);
  }
} else {
  candidateTurns = allRealTurns.slice(-back);
}

if (candidateTurns.length === 0) {
  console.error('Error: no real conversation turns found to capture.');
  process.exit(1);
}

// ── Extract turn data ────────────────────────────────────────────────────────

const newTurns = [];
for (const ev of candidateTurns) {
  if (isRealUserTurn(ev)) {
    const text = redact(extractUserText(ev));
    if (text) newTurns.push({ role: 'user', text });
  } else if (isAssistantTurn(ev)) {
    const { text, collapsedTools } = extractAssistantContent(ev);
    const redactedText = redact(text);
    if (redactedText || collapsedTools.length > 0) {
      const turn = { role: 'assistant', text: redactedText };
      if (collapsedTools.length > 0) turn.collapsedTools = collapsedTools.map(redact);
      newTurns.push(turn);
    }
  }
}

// ── Build / merge draft ──────────────────────────────────────────────────────

const sessionId = events.find(ev => ev.sessionId)?.sessionId || 'unknown';
const now = new Date().toISOString();

let draft;

if (extend && existsSync(draftPath)) {
  const existing = JSON.parse(readFileSync(draftPath, 'utf8'));
  draft = {
    ...existing,
    _capturedAt: now,
    turns: [...(existing.turns || []), ...newTurns],
  };
} else {
  const titleWords = slug.replace(/-/g, ' ');
  const title = titleWords.charAt(0).toUpperCase() + titleWords.slice(1);
  draft = {
    id: slug,
    title,
    date: now.slice(0, 10),
    context: '',
    note,
    sourceSessionId: sessionId,
    _capturedAt: now,
    turns: newTurns,
  };
}

// ── Write draft ──────────────────────────────────────────────────────────────

mkdirSync(join(projectRoot, 'src', 'content', 'transcripts', 'drafts'), { recursive: true });
writeFileSync(draftPath, JSON.stringify(draft, null, 2));

console.log(`✓ bookmarked ${newTurns.length} turns → src/content/transcripts/drafts/${slug}.json`);
console.log('  Remember to hand-review before promoting.');
if (!note) {
  console.log('  Tip: add --note "<what made this moment significant>" next time.');
}
