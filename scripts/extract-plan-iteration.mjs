#!/usr/bin/env node
/**
 * One-shot script: extract 8 turns from the chunk-4a planning session
 * and write them to src/content/transcripts/plan-iteration-example.json.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mergeToolOnlyTurns, classifyAll } from './turn-classifier.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const jsonlPath = join(
  process.env.USERPROFILE || process.env.HOME,
  '.claude', 'projects', 'C--Users-User-Documents-Claude-code',
  'ff0e4a4a-a695-420d-9cb7-00506686e10e.jsonl'
);

// Raw JSONL line indices (not filtered event indices)
const targetIndices = [5, 38, 41, 47, 54, 79, 86, 88];

function redact(text) {
  const windowsPathRe = /C:[\\\/]Users[\\\/]\w+[\\\/]/gi;
  text = text.replace(windowsPathRe, '[HOME]/');
  text = text.replace(/[\w.+-]+@[\w.-]+\.\w{2,}/g, '[email]');
  text = text.replace(/(?:sk-|ghp_|ghu_|github_pat_|xoxb-|xoxp-)\S{10,}/g, '[token]');
  return text;
}

const lines = readFileSync(jsonlPath, 'utf8').trim().split('\n');

const selectedTurns = [];

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
  const line = lines[lineIdx];
  let evt;
  try { evt = JSON.parse(line); } catch { continue; }

  if (!targetIndices.includes(lineIdx)) continue;
  if (evt.type !== 'assistant' && evt.type !== 'user') {
    console.warn(`  [${lineIdx}] skipped — type=${evt.type}`);
    continue;
  }

  {
    const role = evt.type === 'user' ? 'user' : 'assistant';
    let text = '';
    let collapsedTools = [];

    const msg = evt.message;
    if (typeof msg === 'string') {
      text = msg;
    } else if (Array.isArray(msg?.content)) {
      for (const block of msg.content) {
        if (block.type === 'text') text += (text ? '\n' : '') + block.text;
        if (block.type === 'tool_use') {
          const label = `[${block.name} ${(block.input?.file_path || block.input?.pattern || block.input?.command || '').toString().slice(0, 60)}]`;
          collapsedTools.push(label);
        }
      }
    } else if (typeof msg?.content === 'string') {
      text = msg.content;
    }

    text = redact(text.trim());
    const turn = { role, text };
    if (collapsedTools.length > 0) turn.collapsedTools = collapsedTools;
    selectedTurns.push(turn);
    console.log(`  [${lineIdx}] ${role} — ${text.length} chars, ${collapsedTools.length} tools`);
  }
}

console.log(`\nExtracted ${selectedTurns.length} turns from ${lines.length} total lines.`);

const merged = mergeToolOnlyTurns(selectedTurns);
const classified = classifyAll(merged);

console.log(`After merge+classify: ${classified.length} turns`);
for (const t of classified) {
  console.log(`  ${t.role} ${t.kind || 'verbatim'} — ${t.text.slice(0, 80)}...`);
}

const transcript = {
  title: "Plan iteration example",
  context: "Iterating on the chunk 4a amendments plan across two drafts, with a self-correction cycle between them.",
  note: "Shows the full request-to-approval arc: initial brief, Claude proposes with questions, Dylan answers, plan v1 ships, Claude catches its own mistake, plan v2 fixes it.",
  turns: classified,
};

const outPath = join(projectRoot, 'src', 'content', 'transcripts', 'plan-iteration-example.json');
writeFileSync(outPath, JSON.stringify(transcript, null, 2));
console.log(`\nWrote ${outPath}`);
