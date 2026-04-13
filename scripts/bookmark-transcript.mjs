#!/usr/bin/env node
/**
 * bookmark-transcript.mjs
 * Captures conversation turns from a Claude session as a transcript draft.
 *
 * Usage:
 *   node scripts/bookmark-transcript.mjs --slug <slug> [options]
 *
 * Options:
 *   --slug <slug>      Required. Kebab-case identifier (e.g. "card-layout-decision")
 *   --note "<note>"    Optional annotation in your voice
 *   --back <N>         Number of turns to capture (default: 6) — IGNORED if --from is set
 *   --extend           Append to existing draft instead of overwriting
 *   --session <path>   Explicit JSONL session file (default: most-recent active session)
 *   --from "<text>"    Start capture at first assistant message containing this text
 *   --until "<text>"   Stop capture before first message containing this text
 *   --full-tools       Capture full tool_use input objects as `toolCalls` array
 *                      (in addition to label-only `collapsedTools`)
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
    slug:        { type: 'string' },
    note:        { type: 'string', default: '' },
    back:        { type: 'string' },
    extend:      { type: 'boolean', default: false },
    session:     { type: 'string' },
    from:        { type: 'string' },
    until:       { type: 'string' },
    'full-tools':{ type: 'boolean', default: false },
  },
  strict: true,
});

if (!args.slug) {
  console.error('Error: --slug is required');
  console.error('Usage: node scripts/bookmark-transcript.mjs --slug <slug> [options]');
  process.exit(1);
}

const slug      = args.slug;
const note      = args.note || '';
const backRaw   = args.back;
const extend    = args.extend;
const sessionArg = args.session;
const fromText  = args.from || null;
const untilText = args.until || null;
const fullTools = args['full-tools'];

// Require an explicit range mode — no silent default. --extend bypasses this
// because it finds new turns by timestamp.
if (!fromText && backRaw === undefined && !extend) {
  console.error('Error: must specify one of --from "<text>" (range mode) or --back <N> (count mode).');
  console.error('Decide the range from the conversation context. See the bookmark SKILL.md.');
  process.exit(1);
}

const back = backRaw !== undefined ? parseInt(backRaw, 10) : 6; // fallback used only by --extend path

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error('Error: slug must be kebab-case (lowercase letters, numbers, hyphens only)');
  process.exit(1);
}

if (backRaw !== undefined && (isNaN(back) || back < 1)) {
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

// ── Locate session + parse ──────────────────────────────────────────────────

let sessionPath;
if (sessionArg) {
  if (!existsSync(sessionArg)) {
    console.error(`Error: --session file not found: ${sessionArg}`);
    process.exit(1);
  }
  sessionPath = sessionArg;
} else {
  try {
    sessionPath = findActiveSession().path;
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

const events = parseSessionEvents(sessionPath);
const toolResultMap = buildToolResultMap(events);

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
  if (!Array.isArray(content)) return { text: '', collapsedTools: [], toolCalls: [] };

  const textParts = [];
  const collapsedTools = [];
  const toolCalls = [];

  for (const block of content) {
    if (block.type === 'text' && block.text?.trim()) {
      textParts.push(block.text.trim());
    } else if (block.type === 'tool_use') {
      collapsedTools.push(labelToolUse(block.name, block.input));
      if (fullTools) toolCalls.push({ name: block.name, input: block.input ?? {} });
    }
  }

  return { text: textParts.join('\n\n'), collapsedTools, toolCalls };
}

function eventContainsText(ev, needle) {
  if (!needle) return false;
  const content = ev.message?.content;
  if (typeof content === 'string') return content.includes(needle);
  if (Array.isArray(content)) {
    return content.some(b => (b.type === 'text' && b.text?.includes(needle)));
  }
  return false;
}

/**
 * Build a map: tool_use_id → result blob.
 * Tool results live in user events with content array containing tool_result blocks.
 */
function buildToolResultMap(allEvents) {
  const map = new Map();
  for (const ev of allEvents) {
    if (ev.type !== 'user') continue;
    const content = ev.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block.type === 'tool_result' && block.tool_use_id) {
        map.set(block.tool_use_id, block.content);
      }
    }
  }
  return map;
}

/**
 * For a Stitch generate_screen_from_text result, extract the bits we care about:
 * Stitch's rewritten prompt + the screen title. Skip the giant design-system markdown.
 */
function summariseStitchResult(rawContent) {
  let parsed;
  if (typeof rawContent === 'string') {
    try { parsed = JSON.parse(rawContent); } catch { return null; }
  } else {
    parsed = rawContent;
  }
  if (!parsed || !parsed.outputComponents) return null;
  const out = { rewrittenPrompts: [], commentary: [] };
  for (const comp of parsed.outputComponents) {
    if (comp.design?.screens) {
      for (const screen of comp.design.screens) {
        if (screen.prompt) out.rewrittenPrompts.push({
          title: screen.title || 'untitled',
          prompt: screen.prompt,
        });
      }
    }
    if (comp.text) out.commentary.push(comp.text);
  }
  if (out.rewrittenPrompts.length === 0 && out.commentary.length === 0) return null;
  return out;
}

// ── Build turn list ──────────────────────────────────────────────────────────

const allRealTurns = events.filter(ev => isRealUserTurn(ev) || isAssistantTurn(ev));

const draftPath = join(projectRoot, 'src', 'content', 'transcripts', 'drafts', `${slug}.json`);

let candidateTurns;

if (fromText) {
  // Range mode: from first turn containing fromText, until first turn after that containing untilText
  const startIdx = allRealTurns.findIndex(ev => eventContainsText(ev, fromText));
  if (startIdx === -1) {
    console.error(`Error: --from text not found in any turn: "${fromText}"`);
    process.exit(1);
  }
  let endIdx = allRealTurns.length;
  if (untilText) {
    const u = allRealTurns.findIndex((ev, i) => i > startIdx && eventContainsText(ev, untilText));
    if (u !== -1) endIdx = u;
  }
  candidateTurns = allRealTurns.slice(startIdx, endIdx);
  console.log(`  Range: turn ${startIdx + 1} to ${endIdx} (${candidateTurns.length} turns) of ${allRealTurns.length}`);
} else if (extend && existsSync(draftPath)) {
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
    const { text, collapsedTools, toolCalls } = extractAssistantContent(ev);
    const redactedText = redact(text);
    if (redactedText || collapsedTools.length > 0) {
      const turn = { role: 'assistant', text: redactedText };
      if (collapsedTools.length > 0) turn.collapsedTools = collapsedTools.map(redact);
      if (toolCalls.length > 0) {
        // Redact strings inside the input objects (deep)
        const deepRedact = (v) => {
          if (typeof v === 'string') return redact(v);
          if (Array.isArray(v)) return v.map(deepRedact);
          if (v && typeof v === 'object') {
            const out = {};
            for (const [k, val] of Object.entries(v)) out[k] = deepRedact(val);
            return out;
          }
          return v;
        };
        // Look up tool_use_id → result for Stitch calls; attach summarised result
        const toolUseBlocks = (ev.message?.content || []).filter(b => b.type === 'tool_use');
        turn.toolCalls = toolCalls.map((tc, i) => {
          const entry = { name: tc.name, input: deepRedact(tc.input) };
          if (tc.name === 'mcp__stitch__generate_screen_from_text') {
            const id = toolUseBlocks[i]?.id;
            const raw = id ? toolResultMap.get(id) : null;
            const summary = raw ? summariseStitchResult(raw) : null;
            if (summary) entry.result = deepRedact(summary);
          }
          return entry;
        });
      }
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
