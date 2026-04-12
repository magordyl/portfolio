/**
 * render-transcript.mjs
 * Shared render helper for chat transcripts. Imported by:
 *   - scripts/preview-transcript.mjs (standalone HTML preview harness)
 *   - src/components/ChatTranscript.astro (the production component, built in 4c.1)
 *
 * Both callers feed the same turns through the same function so preview and
 * production render identical markup. A render-parity test gates drift.
 *
 * Exports:
 *   renderTranscript(transcript, { variant }) → { html, css }
 *   VARIANTS — the four supported icon × header combinations
 */

export const VARIANTS = ['a-h1', 'a-h2', 'b-h1', 'b-h2'];

// Lucide icon SVGs (copied from lucide source, 24x24 viewBox).
// Rendered as inline SVG — no React, no runtime dependency.
const ICONS = {
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
  bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`,
};

// ── Escaping ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Minimal markdown → HTML ─────────────────────────────────────────────────
// Supports: paragraphs (blank-line separated), inline `code`, **bold**,
// fenced ```code``` blocks, simple bullet lists (lines starting "- ").
// No links, no images, no tables — transcripts rarely need them and keeping
// the parser small means fewer surprises.

function renderInline(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

function renderMarkdown(text) {
  if (!text || !text.trim()) return '';

  const blocks = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    // Bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push(`<ul>${items.map(it => `<li>${renderInline(it)}</li>`).join('')}</ul>`);
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length + 1, 6);
      blocks.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Numbered list (handles multi-line items with continuation + blank-line gaps)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length) {
        if (/^\s*\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
          i++;
          while (i < lines.length && lines[i].trim() && !/^\s*\d+\.\s+/.test(lines[i]) && !/^#{1,6}\s+/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !/^```/.test(lines[i])) {
            items[items.length - 1] += ' ' + lines[i].trim();
            i++;
          }
        } else if (!lines[i].trim()) {
          if (i + 1 < lines.length && /^\s*\d+\.\s+/.test(lines[i + 1])) {
            i++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      blocks.push(`<ol>${items.map(it => `<li>${renderInline(it)}</li>`).join('')}</ol>`);
      continue;
    }

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph — consume until blank line or block boundary
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^#{1,6}\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(`<p>${renderInline(paraLines.join(' '))}</p>`);
    }
  }

  return blocks.join('\n');
}

// ── Variant helpers ─────────────────────────────────────────────────────────

function claudeIcon(variant) {
  // Pair A: Sparkles. Pair B: Bot.
  return variant.startsWith('a-') ? ICONS.sparkles : ICONS.bot;
}

function headerLayout(variant) {
  // H1: horizontal compact (icon + label in a row above the turn body)
  // H2: vertical stacked (icon + label in a narrow left gutter)
  return variant.endsWith('-h1') ? 'h1' : 'h2';
}

function senderHeader(role, variant) {
  const icon = role === 'user' ? ICONS.user : claudeIcon(variant);
  const label = role === 'user' ? 'Dylan' : 'Claude';
  const badgeClass = role === 'user' ? 'badge badge--dylan' : 'badge badge--claude';
  return `<div class="sender"><span class="${badgeClass}">${icon}</span><span class="sender-label">${label}</span></div>`;
}

// ── Tool-call strip ─────────────────────────────────────────────────────────

function renderTools(tools) {
  if (!tools || tools.length === 0) return '';
  const items = tools
    .map(t => `<span class="tool">${escapeHtml(t)}</span>`)
    .join('');
  return `<div class="tools">${items}</div>`;
}

// ── Turn renderers ──────────────────────────────────────────────────────────

function renderVerbatimTurn(turn, variant) {
  const body = renderMarkdown(turn.text);
  const tools = renderTools(turn.collapsedTools);
  return `<div class="turn turn--verbatim turn--${turn.role}">${senderHeader(turn.role, variant)}<div class="turn-body">${body}${tools}</div></div>`;
}

function renderCollapsedTurn(turn, variant) {
  const body = renderMarkdown(turn.text);
  const tools = renderTools(turn.collapsedTools);
  const summary = turn.summary || defaultSummary(turn);
  return `<details class="turn turn--${turn.kind} turn--${turn.role}"><summary>${senderHeader(turn.role, variant)}<span class="summary-label">${escapeHtml(summary)}</span><span class="chevron">${ICONS.chevronDown}</span></summary><div class="turn-body">${body}${tools}</div></details>`;
}

function renderHeadlineTurn(turn, variant) {
  const tools = renderTools(turn.collapsedTools);
  const sections = splitByHeadings(turn.text);

  const sectionsHtml = sections
    .map(sec => {
      if (!sec.heading) {
        // Pre-heading content (if any) — render as visible prose
        return renderMarkdown(sec.body);
      }
      const headingTag = sec.level === 2 ? 'h3' : 'h4';
      const headingHtml = `<${headingTag} class="headline-heading">${renderInline(sec.heading)}</${headingTag}>`;
      const bodyHtml = renderMarkdown(sec.body);
      if (!bodyHtml) return headingHtml;
      return `${headingHtml}<details class="headline-section"><summary><span class="summary-label">Show detail</span><span class="chevron">${ICONS.chevronDown}</span></summary>${bodyHtml}</details>`;
    })
    .join('\n');

  return `<div class="turn turn--headline turn--${turn.role}">${senderHeader(turn.role, variant)}<div class="turn-body">${sectionsHtml}${tools}</div></div>`;
}

function splitByHeadings(text) {
  const sections = [];
  const lines = text.split('\n');
  let current = { level: 0, heading: null, body: '' };

  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) {
      if (current.heading !== null || current.body.trim()) sections.push(current);
      current = { level: m[1].length, heading: m[2].trim(), body: '' };
    } else {
      current.body += line + '\n';
    }
  }
  if (current.heading !== null || current.body.trim()) sections.push(current);
  return sections;
}

function defaultSummary(turn) {
  switch (turn.kind) {
    case 'plan':     return 'Plan';
    case 'skill':    return 'Skill invocation';
    case 'research': return 'Research findings';
    default:         return '';
  }
}

// ── Main export ─────────────────────────────────────────────────────────────

export function renderTranscript(transcript, options = {}) {
  const variant = VARIANTS.includes(options.variant) ? options.variant : 'a-h1';
  const layout = headerLayout(variant);

  const turnsHtml = (transcript.turns || [])
    .map(turn => {
      if (turn.role === 'user') return renderVerbatimTurn(turn, variant);
      const kind = turn.kind || 'verbatim';
      if (kind === 'verbatim') return renderVerbatimTurn(turn, variant);
      if (kind === 'headline') return renderHeadlineTurn(turn, variant);
      return renderCollapsedTurn(turn, variant);
    })
    .join('\n');

  const metaHtml = transcript.note
    ? `<div class="transcript-note">${escapeHtml(transcript.note)}</div>`
    : '';

  const html = `<article class="chat-transcript chat-transcript--${layout}" data-variant="${variant}">${metaHtml}<div class="turns">${turnsHtml}</div></article>`;

  return { html, css: SHARED_CSS };
}

// ── Shared CSS ──────────────────────────────────────────────────────────────
// These values duplicate the real tokens from src/styles/globals.css. The
// duplication is deliberate: render-transcript.mjs runs outside Astro (in the
// preview harness), so it can't import CSS variables from the Astro build.
// A render-parity test (built in 4c.1) asserts the token values match the
// globals.css source of truth.

export const SHARED_CSS = `
/* ── Token layer ─────────────────────────────────────── */
.chat-transcript {
  --royal-1:  #0E0F1C;
  --royal-2:  #121428;
  --royal-3:  #181B36;
  --royal-4:  #1E2346;
  --royal-5:  #252C58;
  --royal-6:  #2D366C;
  --royal-7:  #364280;
  --royal-8:  #3B5BDB;
  --royal-9:  #4D6DE8;
  --royal-10: #6C85FF;
  --royal-11: #A5B4FF;
  --royal-12: #D5DCFA;
  --violet-8:  #8C3BDB;
  --violet-9:  #9D4DE8;
  --violet-10: #B47CFF;
  --violet-11: #C89BFF;
  --violet-12: #E6D4FF;
  --ink:       #E6E2D9;
  --ink-dim:   #9C968A;
  --ink-faint: #5E584F;

  /* Spec: royal-950 background, 12px radius, 24px padding */
  background: var(--royal-1);
  border: 1px solid var(--royal-4);
  border-radius: 12px;
  padding: 1.5rem;
  font-family: 'Geist Variable', 'Geist', -apple-system, system-ui, sans-serif;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--ink);
}

/* ── Annotation note ─────────────────────────────────── */
.chat-transcript .transcript-note {
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  color: var(--ink-dim);
  border-left: 2px solid var(--royal-6);
  padding: 0.25rem 0 0.25rem 0.75rem;
  margin-bottom: 1.25rem;
  font-style: italic;
}

/* ── Turn container ──────────────────────────────────── */
.chat-transcript .turns {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Hairline separator between turns (spec: 1px royal-900) */
.chat-transcript .turn + .turn,
.chat-transcript .turn + details.turn,
.chat-transcript details.turn + .turn,
.chat-transcript details.turn + details.turn {
  border-top: 1px solid var(--royal-3);
  padding-top: 1.25rem;
  margin-top: 1.25rem;
}

/* ── Sender header ───────────────────────────────────── */
.chat-transcript .sender {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.chat-transcript .badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  flex-shrink: 0;
}

.chat-transcript .badge svg {
  width: 14px;
  height: 14px;
}

/* Dylan: royal register */
.chat-transcript .badge--dylan {
  background: var(--royal-4);
  color: var(--royal-10);
  border: 1px solid var(--royal-7);
}

/* Claude: violet register */
.chat-transcript .badge--claude {
  background: rgba(140, 59, 219, 0.15);
  color: var(--violet-10);
  border: 1px solid var(--violet-8);
}

/* Distinct sender label colours per spec */
.chat-transcript .sender-label {
  font-family: 'Geist Mono', monospace;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 500;
}

/* Dylan: royal register label */
.chat-transcript .turn--user .sender-label {
  color: var(--royal-11);
}

/* Claude: violet register label */
.chat-transcript .turn--assistant .sender-label {
  color: var(--violet-11);
}

/* ── Turn body ───────────────────────────────────────── */
.chat-transcript .turn {
  border: none;
  margin: 0;
}

.chat-transcript .turn-body {
  color: var(--ink);
}

.chat-transcript .turn-body p {
  margin: 0 0 0.75rem;
}

.chat-transcript .turn-body p:last-child {
  margin-bottom: 0;
}

.chat-transcript .turn-body ul {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
}

.chat-transcript .turn-body li {
  margin-bottom: 0.25rem;
}

.chat-transcript .turn-body strong {
  color: var(--ink);
  font-weight: 600;
}

.chat-transcript .turn-body code {
  font-family: 'Geist Mono', monospace;
  font-size: 0.85em;
  background: var(--royal-3);
  color: var(--royal-11);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}

.chat-transcript .turn-body pre {
  background: var(--royal-2);
  border: 1px solid var(--royal-4);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  overflow-x: auto;
  margin: 0 0 0.75rem;
}

.chat-transcript .turn-body pre code {
  background: none;
  padding: 0;
  color: var(--ink);
}

/* ── H1 horizontal layout: sender on row above body ──── */
.chat-transcript--h1 .turn {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── H2 vertical layout: sender in narrow left gutter ── */
.chat-transcript--h2 .turn {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 0.75rem;
  align-items: start;
}

.chat-transcript--h2 .sender {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding-top: 0.125rem;
}

.chat-transcript--h2 details.turn {
  display: block;
}
.chat-transcript--h2 details.turn > summary {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 0.75rem;
  align-items: start;
}
.chat-transcript--h2 details.turn > .turn-body {
  padding-left: calc(80px + 0.75rem);
  margin-top: 0.75rem;
}

@media (max-width: 640px) {
  .chat-transcript--h2 .turn,
  .chat-transcript--h2 details.turn > summary {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .chat-transcript--h2 details.turn > .turn-body {
    padding-left: 0;
  }
  .chat-transcript--h2 .sender {
    flex-direction: row;
    align-items: center;
  }
}

/* ── Collapsible turns (plan / skill / research) ─────── */
.chat-transcript details.turn {
  background: var(--royal-2);
  border: 1px solid rgba(140, 59, 219, 0.2);
  border-radius: 8px;
  padding: 0.875rem 1rem;
}

.chat-transcript details > summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-transcript details > summary::-webkit-details-marker {
  display: none;
}

.chat-transcript .summary-label {
  font-family: 'Geist Mono', monospace;
  font-style: italic;
  color: var(--violet-11);
  flex: 1;
  font-size: 0.8125rem;
}

.chat-transcript .chevron {
  display: inline-flex;
  color: var(--ink-faint);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chat-transcript .chevron svg {
  width: 14px;
  height: 14px;
}

.chat-transcript details[open] > summary .chevron {
  transform: rotate(180deg);
}

.chat-transcript details[open] > summary {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(140, 59, 219, 0.2);
}

/* Kind-specific left accent — violet register for Claude's collapsed content */
.chat-transcript .turn--plan > summary     { border-left: 2px solid var(--violet-10); padding-left: 0.75rem; }
.chat-transcript .turn--skill > summary    { border-left: 2px solid var(--violet-8);  padding-left: 0.75rem; }
.chat-transcript .turn--research > summary { border-left: 2px solid var(--violet-9);  padding-left: 0.75rem; }

/* ── Headline turn sections ──────────────────────────── */
.chat-transcript .headline-heading {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--royal-12);
  margin: 1rem 0 0.375rem;
  letter-spacing: -0.01em;
}

.chat-transcript .headline-heading:first-child {
  margin-top: 0;
}

.chat-transcript details.headline-section {
  background: transparent;
  border: none;
  border-left: 1px solid var(--royal-4);
  border-radius: 0;
  padding: 0 0 0 0.875rem;
  margin: 0 0 0.75rem;
}

.chat-transcript details.headline-section > summary {
  font-size: 0.8125rem;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.chat-transcript details.headline-section[open] > summary {
  border-bottom: none;
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
}

.chat-transcript details.headline-section .summary-label {
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  color: var(--ink-faint);
}

/* ── Tool-call strip ─────────────────────────────────── */
/* Spec: Geist Mono caption size, royal-700 */
.chat-transcript .tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.75rem;
}

.chat-transcript .tool {
  font-family: 'Geist Mono', monospace;
  font-size: 0.6875rem;
  color: var(--royal-7);
  background: transparent;
  border: 1px solid var(--royal-4);
  border-radius: 3px;
  padding: 0.125rem 0.4rem;
}
`;
