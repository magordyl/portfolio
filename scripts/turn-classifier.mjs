/**
 * turn-classifier.mjs
 * Shared turn classification + tool-only-turn merge.
 * Imported by bookmark-transcript.mjs (at capture time) and
 * promote-transcript.mjs (to repair drafts captured before the fix).
 */

export function classifyTurn(turn) {
  if (turn.role === 'user') return { kind: 'verbatim' };

  const text  = turn.text || '';
  const tools = turn.collapsedTools || [];

  const skillLabel = tools.find(t => t.startsWith('[Skill:'));
  if (skillLabel) {
    const name = skillLabel.match(/\[Skill:\s*([^\]]*)\]/)?.[1]?.trim() || 'unknown';
    const firstSent = text.split(/[.!?\n]/)[0]?.trim().slice(0, 80) || 'invoked';
    return { kind: 'skill', summary: `Skill: ${name} — ${firstSent}` };
  }

  const researchTools = tools.filter(t => /^\[(Grep|Glob|Read|WebFetch)/.test(t));
  if (researchTools.length >= 3) {
    return { kind: 'research', summary: `Research findings (${researchTools.length} items)` };
  }

  if (text.length < 400) return { kind: 'verbatim' };

  const planMarkers = /(^##\s+plan\b)|(\bimplementation plan\b)|(here'?s the plan)|(^\s*\d+\.\s+.+\n\s*\d+\.\s+)/im;
  if (planMarkers.test(text)) {
    const heading   = text.match(/^##\s+(.+)$/m)?.[1]?.trim();
    const stepCount = (text.match(/^\s*\d+\.\s+/gm) || []).length;
    const firstSent = text.split(/[.!?\n]/)[0]?.trim().slice(0, 80);
    const summary = heading
      ? `Plan: ${heading}`
      : stepCount >= 3
        ? `Plan (${stepCount} steps)`
        : firstSent || 'Plan';
    return { kind: 'plan', summary };
  }

  if (text.length >= 800) {
    const hasHeadings = /^#{2,3}\s+/m.test(text);
    if (hasHeadings) return { kind: 'headline' };
    const firstSent = text.split(/[.!?\n]/)[0]?.trim().slice(0, 80);
    return { kind: 'plan', summary: firstSent || 'Long reply' };
  }

  return { kind: 'verbatim' };
}

export function mergeToolOnlyTurns(turns) {
  const out = [];
  let pending = null;

  for (const turn of turns) {
    const isToolOnly =
      turn.role === 'assistant' &&
      (!turn.text || !turn.text.trim()) &&
      Array.isArray(turn.collapsedTools) &&
      turn.collapsedTools.length > 0;

    if (isToolOnly) {
      const prev = out[out.length - 1];
      if (prev && prev.role === 'assistant') {
        prev.collapsedTools = [...(prev.collapsedTools || []), ...turn.collapsedTools];
      } else {
        pending = [...(pending || []), ...turn.collapsedTools];
      }
      continue;
    }

    if (pending && turn.role === 'assistant') {
      turn.collapsedTools = [...pending, ...(turn.collapsedTools || [])];
      pending = null;
    }
    out.push(turn);
  }
  return out;
}

export function classifyAll(turns) {
  return turns.map(turn => {
    const { kind, summary } = classifyTurn(turn);
    const out = { ...turn };
    if (kind && kind !== 'verbatim') {
      out.kind = kind;
      if (summary) out.summary = summary;
    } else {
      delete out.kind;
      delete out.summary;
    }
    return out;
  });
}
