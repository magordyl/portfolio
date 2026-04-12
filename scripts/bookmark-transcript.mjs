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

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';
import { mergeToolOnlyTurns, classifyAll } from './turn-classifier.mjs';
import {
  findActiveSession, parseSessionEvents, isRealUserTurn,
  extractUserText, redact, getSessionId,
} from './session-utils.mjs';

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

// ── Locate active session + parse ───────────────────────────────────────────

let mostRecent;
try {
  mostRecent = findActiveSession();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

const events = parseSessionEvents(mostRecent.path);

// ── Helpers (bookmark-specific) ─────────────────────────────────────────────

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
  }

  return { text: textParts.join('\n\n'), collapsedTools };
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

const rawTurns = [];
for (const ev of candidateTurns) {
  if (isRealUserTurn(ev)) {
    const text = redact(extractUserText(ev));
    if (text) rawTurns.push({ role: 'user', text });
  } else if (isAssistantTurn(ev)) {
    const { text, collapsedTools } = extractAssistantContent(ev);
    const redactedText = redact(text);
    if (redactedText || collapsedTools.length > 0) {
      const turn = { role: 'assistant', text: redactedText };
      if (collapsedTools.length > 0) turn.collapsedTools = collapsedTools.map(redact);
      rawTurns.push(turn);
    }
  }
}

// Merge tool-only assistant turns into their surrounding prose turns, then
// classify each surviving turn so the render layer knows whether to collapse.
const newTurns = classifyAll(mergeToolOnlyTurns(rawTurns));

// ── Build / merge draft ──────────────────────────────────────────────────────

const sessionId = getSessionId(events);
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
