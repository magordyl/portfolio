#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { renderTranscript, VARIANTS } from './render-transcript.mjs';
import { mergeToolOnlyTurns, classifyAll } from './turn-classifier.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const slug = 'plan-iteration-example';
const jsonPath = join(projectRoot, 'src', 'content', 'transcripts', `${slug}.json`);
const previewDir = join(projectRoot, 'plans', 'portfolio-stitch-assets', 'transcripts');
const publicDir = join(projectRoot, 'public', 'artefacts', 'transcripts');

const draft = JSON.parse(readFileSync(jsonPath, 'utf8'));
draft.turns = classifyAll(mergeToolOnlyTurns(draft.turns || []));
console.log(`Loaded ${draft.turns.length} turns`);

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

mkdirSync(previewDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

for (const v of VARIANTS) {
  const { html, css } = renderTranscript(draft, { variant: v });

  const switcher = VARIANTS.map(sv => {
    const active = sv === v ? ' active' : '';
    return `<a class="variant${active}" href="/artefacts/transcripts/preview-${slug}-${sv}.html">${sv}</a>`;
  }).join('');

  const page = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(draft.title || slug)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500&family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--page-bg:#0A0B16;--page-fg:#E6E2D9;--page-dim:#9C968A;--page-accent:#6C85FF}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:var(--page-bg);color:var(--page-fg);font-family:'Geist',-apple-system,system-ui,sans-serif;font-size:16px}
.page{max-width:760px;margin:0 auto;padding:2rem 1.5rem 4rem}
header.preview-header{margin-bottom:1.5rem;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:1rem}
header.preview-header h1{font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:1.5rem;letter-spacing:-0.01em;margin:0 0 0.25rem}
header.preview-header .meta{font-family:'Geist Mono',monospace;font-size:0.6875rem;color:var(--page-dim);text-transform:uppercase;letter-spacing:0.12em}
.variants{display:flex;gap:0.5rem;margin-top:0.75rem;flex-wrap:wrap}
.variant{font-family:'Geist Mono',monospace;font-size:0.75rem;color:var(--page-dim);text-decoration:none;padding:0.25rem 0.6rem;border:1px solid rgba(255,255,255,0.12);border-radius:4px;transition:border-color 0.15s,color 0.15s}
.variant:hover{color:var(--page-fg);border-color:rgba(255,255,255,0.3)}.variant.active{color:var(--page-accent);border-color:var(--page-accent)}
${css}
</style></head><body><div class="page">
<header class="preview-header"><h1>${escapeHtml(draft.title || slug)}</h1>
<div class="meta">variant: ${v}</div>
<div class="variants">${switcher}</div></header>
${html}
</div></body></html>`;

  const previewPath = join(previewDir, `preview-${slug}-${v}.html`);
  const publicPath = join(publicDir, `preview-${slug}-${v}.html`);
  writeFileSync(previewPath, page);
  writeFileSync(publicPath, page);
  const count = (html.match(/class="turn/g) || []).length;
  console.log(`  ${v}: ${count} turns → ${publicPath}`);
}

console.log('Done.');
