# Portfolio — Project Context

Personal portfolio site. Stack: Astro 6 + React islands + Tailwind v4 + shadcn (new-york-v4 style). Deployed to Cloudflare Pages from the `main` branch of `magordyl/portfolio`.

## Design System

- **Colours:** Royal Tonal (12-step scale anchored on `#3B5BDB`) — see `src/styles/globals.css`
- **Fonts:** Fraunces (serif display) × Geist (sans body) × Geist Mono (code)
- **Type scale:** 72/32/16 anchor — all sizes in `--text-*` CSS variables
- **Radius:** 8px cards, 2px tags
- **Dark mode only.** No toggle. Single palette.

Full design decisions in `plans/portfolio-design-tokens.md`, `plans/portfolio-visual-direction.md`, `plans/portfolio-architecture.md` (this repo's `plans/`).

## Component Rules

- `.astro` components for all static content — no React unless hydration is genuinely needed
- React islands only for interactive bits (the "Get in touch" button, future nav drawer)
- shadcn/ui components are style references — install via `npx shadcn@latest add <component>`, then wrap in `.astro` if static
- Always use CSS custom properties (`var(--token)`) — never hardcode colour hex values in components

## Content Collections

Three collections: `projects`, `writing`, `log`. Schemas in `src/content.config.ts` (Astro 6 location — NOT `src/content/config.ts`). Build fails on typo'd slug references (Zod `reference()` validates at build time). Import `z` from `zod` directly, not from `astro:content` (deprecated in Astro 6).

- **Case Study Workshop** (chunk 4) must complete before any case study body content is written
- Placeholder frontmatter is fine in chunks 1-3; body content comes in chunk 4-5

## Check Script

```bash
npm run check   # astro check && astro build — must pass before every commit
```

Set up a pre-commit hook at `.git/hooks/pre-commit` that runs `npm run check`.

## Tailwind v4 note

Astro uses `@tailwindcss/vite` (Vite plugin), NOT `@astrojs/tailwind`. The `astro add tailwind` command sets this up automatically. No `tailwind.config.mjs` needed — tokens live as CSS variables in `globals.css`. If you need Tailwind utility classes for token values, add `@theme { --text-hero: 4.5rem; }` blocks inside `globals.css`.

## Current Status (2026-04-11)

**Chunk 3 complete** — landing page with asymmetric hero split, BuildLogTicker, 2x2 CaseStudyCard grid, About teaser, closing quote. `npm run check` passes clean.

**Deployed** — Cloudflare Pages connected to `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`. Every push to `main` auto-deploys.

**Chunk 4 restructured (2026-04-11)** — split into four sub-chunks following a content-first sequence. Session did not start chunk 4 work; it defined the expanded shape of chunk 4 and added two new chunks (5.5 writing posts, 5.6 /about one-off). See `plans/portfolio-implementation.md` for the full updated plan.

**Chunk 4a next** — Foundation: voice + imagery + diary audit (workspace-wide style guide). Produces `.claude/rules/writing-style.md` (workspace repo, not portfolio repo — it governs all Claude-produced writing, not just portfolio), a quick hiring-manager-lens diary audit, imagery & illustration standards, and updated diary capture rules. **Note:** 4a commits go to the workspace repo, not the portfolio repo — first chunk in this plan that does.

**Chunks remaining:** 4a (foundation), 4b (case study content hierarchy), 4c (page layout mockups, excludes /about), 4d (the-weekly workshop), 5 (remaining case studies), 5.5 (writing posts brainstorm + 3 drafts), 5.6 (/about one-off), 6 (secondary pages + deploy).

**Key discipline:** content-first. Template scaffold (4b) before layout mockups (4c). Writing (4d) only after both are locked. Resist the temptation to sketch layouts while defining content.

**Revised timeline:** ~3–4 weeks of sessions for v1 (up from 1–2 weeks). Extra scope buys a materially higher quality ceiling — style guide governs all writing going forward, imagery standards prevent inconsistency, diary audit surfaces which signals are missing for hiring-manager audiences.

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6, plus optional chunk 7 design-system retrofit post-launch).
Current status tracked in `DIARY.md`.
