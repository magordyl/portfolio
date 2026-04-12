#!/usr/bin/env node
/**
 * preview-transcript.mjs
 * Wraps renderTranscript in a standalone HTML page for browser review.
 *
 * Usage:
 *   node scripts/preview-transcript.mjs --slug <slug> [--variant a-h1|a-h2|b-h1|b-h2] [--open]
 *   node scripts/preview-transcript.mjs --batch [--open]
 *
 * Every run writes ALL FOUR variants to plans/portfolio-stitch-assets/transcripts/
 * so the variant switcher links always resolve. --variant picks which one --open
 * launches. --batch renders every draft in drafts/ with hairline dividers.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { parseArgs } from 'util';
import { renderTranscript, VARIANTS } from './render-transcript.mjs';
import { mergeToolOnlyTurns, classifyAll } from './turn-classifier.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const draftsDir = join(projectRoot, 'src', 'content', 'transcripts', 'drafts');
const previewDir = join(projectRoot, 'plans', 'portfolio-stitch-assets', 'transcripts');

// ── Parse args ──────────────────────────────────────────────────────────────

const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    slug:    { type: 'string' },
    variant: { type: 'string', default: 'a-h1' },
    open:    { type: 'boolean', default: false },
    batch:   { type: 'boolean', default: false },
  },
  strict: true,
});

if (!args.slug && !args.batch) {
  console.error('Error: pass --slug <draft-slug> or --batch');
  console.error('Usage: node scripts/preview-transcript.mjs --slug <slug> [--variant a-h1|a-h2|b-h1|b-h2] [--open]');
  process.exit(1);
}

if (!VARIANTS.includes(args.variant)) {
  console.error(`Error: --variant must be one of ${VARIANTS.join(', ')}`);
  process.exit(1);
}

mkdirSync(previewDir, { recursive: true });

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadDraft(slug) {
  const path = join(draftsDir, `${slug}.json`);
  if (!existsSync(path)) {
    console.error(`Error: no draft found at ${path}`);
    process.exit(1);
  }
  const draft = JSON.parse(readFileSync(path, 'utf8'));
  // Repair pre-fix drafts on the fly. Bookmarks captured before the classifier
  // landed have tool-only turns and no `kind` fields — normalise so they render.
  draft.turns = classifyAll(mergeToolOnlyTurns(draft.turns || []));
  return draft;
}

function listDrafts() {
  if (!existsSync(draftsDir)) return [];
  return readdirSync(draftsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

function wrapHtml({ title, variant, slug, bodyHtml, css, isBatch }) {
  const switcher = isBatch
    ? ''
    : VARIANTS.map(v => {
        const active = v === variant ? ' active' : '';
        return `<a class="variant${active}" href="preview-${slug}-${v}.html">${v}</a>`;
      }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500&family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --page-bg: #0A0B16;
    --page-fg: #E6E2D9;
    --page-dim: #9C968A;
    --page-accent: #6C85FF;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: var(--page-bg);
    color: var(--page-fg);
    font-family: 'Geist', -apple-system, system-ui, sans-serif;
    font-size: 16px;
  }
  .page {
    max-width: 760px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
  header.preview-header {
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding-bottom: 1rem;
  }
  header.preview-header h1 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 1.5rem;
    letter-spacing: -0.01em;
    margin: 0 0 0.25rem;
  }
  header.preview-header .meta {
    font-family: 'Geist Mono', monospace;
    font-size: 0.6875rem;
    color: var(--page-dim);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .variants {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    flex-wrap: wrap;
  }
  .variant {
    font-family: 'Geist Mono', monospace;
    font-size: 0.75rem;
    color: var(--page-dim);
    text-decoration: none;
    padding: 0.25rem 0.6rem;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px;
    transition: border-color 0.15s, color 0.15s;
  }
  .variant:hover { color: var(--page-fg); border-color: rgba(255,255,255,0.3); }
  .variant.active { color: var(--page-accent); border-color: var(--page-accent); }
  .divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.08);
    margin: 2.5rem 0;
  }
  .batch-label {
    font-family: 'Geist Mono', monospace;
    font-size: 0.6875rem;
    color: var(--page-dim);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 0.5rem;
  }
${css}
</style>
</head>
<body>
<div class="page">
<header class="preview-header">
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">${isBatch ? 'batch preview' : `variant: ${variant}`}</div>
  ${switcher ? `<div class="variants">${switcher}</div>` : ''}
</header>
${bodyHtml}
</div>
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function openInBrowser(filePath) {
  const abs = resolve(filePath);
  const platform = process.platform;
  const [cmd, cmdArgs] =
    platform === 'win32' ? ['cmd', ['/c', 'start', '', abs]] :
    platform === 'darwin' ? ['open', [abs]] :
    ['xdg-open', [abs]];
  try {
    const child = spawn(cmd, cmdArgs, { detached: true, stdio: 'ignore' });
    child.unref();
    return true;
  } catch (err) {
    console.warn(`  Could not auto-open browser (${err.message}).`);
    return false;
  }
}

// ── Single-slug mode: render all 4 variants ────────────────────────────────

function renderSingleSlug(slug) {
  const draft = loadDraft(slug);
  const title = draft.title || slug;
  const css = renderTranscript(draft, { variant: 'a-h1' }).css;

  const outputs = {};
  for (const variant of VARIANTS) {
    const { html } = renderTranscript(draft, { variant });
    const page = wrapHtml({
      title: `${title}`,
      variant,
      slug,
      bodyHtml: html,
      css,
      isBatch: false,
    });
    const outPath = join(previewDir, `preview-${slug}-${variant}.html`);
    writeFileSync(outPath, page);
    outputs[variant] = outPath;
  }
  return outputs;
}

// ── Batch mode: render all drafts in one page per variant ──────────────────

function renderBatch() {
  const slugs = listDrafts();
  if (slugs.length === 0) {
    console.error('No drafts to preview — drafts folder is empty.');
    process.exit(0);
  }
  const outputs = {};
  for (const variant of VARIANTS) {
    const parts = [];
    let css = '';
    for (const slug of slugs) {
      const draft = loadDraft(slug);
      const rendered = renderTranscript(draft, { variant });
      css = rendered.css;
      parts.push(`<div class="batch-label">${escapeHtml(slug)}</div>${rendered.html}`);
    }
    const bodyHtml = parts.join('<hr class="divider">');
    const page = wrapHtml({
      title: `All pending drafts (${slugs.length})`,
      variant,
      slug: '_batch',
      bodyHtml,
      css,
      isBatch: true,
    });
    const outPath = join(previewDir, `preview-_batch-${variant}.html`);
    writeFileSync(outPath, page);
    outputs[variant] = outPath;
  }
  return outputs;
}

// ── Main ────────────────────────────────────────────────────────────────────

const outputs = args.batch ? renderBatch() : renderSingleSlug(args.slug);

const target = outputs[args.variant];
console.log('');
console.log('  Wrote preview variants:');
for (const v of VARIANTS) console.log(`    ${v}: ${outputs[v]}`);
console.log('');
console.log(`  Default (${args.variant}): ${target}`);

if (args.open) {
  console.log('  Opening in browser…');
  const opened = openInBrowser(target);
  if (!opened) {
    console.log(`  Open manually: file:///${target.replace(/\\/g, '/')}`);
  }
}
