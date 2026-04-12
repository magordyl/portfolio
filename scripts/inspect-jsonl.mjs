import { readFileSync } from 'fs';
import { join } from 'path';

const jsonlPath = join(
  process.env.USERPROFILE || process.env.HOME,
  '.claude', 'projects', 'C--Users-User-Documents-Claude-code',
  'ff0e4a4a-a695-420d-9cb7-00506686e10e.jsonl'
);

const lines = readFileSync(jsonlPath, 'utf8').trim().split('\n');

// Show ALL events (including tool-only) between 41 and 88 with role info
for (let i = 41; i <= 88 && i < lines.length; i++) {
  const evt = JSON.parse(lines[i]);
  if (evt.type !== 'assistant' && evt.type !== 'user') {
    console.log(`[${i}] ${evt.type}`);
    continue;
  }

  let text = '';
  let tools = 0;
  if (typeof evt.message === 'string') text = evt.message;
  else if (Array.isArray(evt.message?.content)) {
    text = evt.message.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    tools = evt.message.content.filter(b => b.type === 'tool_use' || b.type === 'tool_result').length;
  } else if (typeof evt.message?.content === 'string') {
    text = evt.message.content;
  }

  const role = evt.message?.role || evt.type;
  if (text.length > 0) {
    console.log(`[${i}] ${role} — ${text.length} chars, ${tools} tools: ${text.slice(0, 80)}`);
  } else {
    console.log(`[${i}] ${role} — tools only (${tools})`);
  }
}
