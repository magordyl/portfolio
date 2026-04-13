# Portfolio — Project Context

Personal portfolio site. Stack: Astro 6 + React islands + Tailwind v4. Deployed to Cloudflare Pages from the `main` branch of `magordyl/portfolio`.

## Design System

- **Tokens:** `./design.tokens.ts` — imports defaults from `../design-system/`, overrides with Royal Tonal palette
- **Conventions:** `../design-system/design.md`
- **Colours:** Royal Tonal (12-step scale anchored on `#3B5BDB`) — raw scale + semantic aliases in `src/styles/globals.css`, canonical values in `design.tokens.ts`
- **Fonts:** Fraunces (serif display) × Geist (sans body) × Geist Mono (code)
- **Type scale:** 72/32/16 anchor — all sizes in `--text-*` CSS variables
- **Radius:** 8px cards, 2px tags
- **Dark mode only.** No toggle. Single palette.
- **shadcn exemption:** This project does not use shadcn/ui. Existing components are bespoke Astro components built against design explorers. Future components may use shadcn where applicable and where they work with the token system.

Rule: read `design.md` before generating UI code. Canonical colour values live in `design.tokens.ts`; CSS var names live in `globals.css`. Never hardcode hex in components.

Full design decisions in `plans/portfolio-design-tokens.md`, `plans/portfolio-visual-direction.md`, `plans/portfolio-architecture.md` (this repo's `plans/`).

## Component Rules

- `.astro` components for all static content — no React unless hydration is genuinely needed
- React islands only for interactive bits (the "Get in touch" button, future nav drawer)
- Always use CSS custom properties (`var(--token)`) — never hardcode colour hex values in components
- For new components: check if shadcn has a suitable primitive first; if it works with the token system, use it. Otherwise build bespoke.

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

## Current Status (2026-04-13)

**Last session (2026-04-13) — Plan amendments (no code).**

**What was done this session (portfolio side):**
- Added `<ProjectTimeline>` component to chunk 4c.1 — linear timeline with milestone vs pivot nodes, data from new optional `timeline` frontmatter field on projects schema. To be explored in case-study-v1/v2 design explorers.
- Converted `workspace-audit` from a case-study project to a writing topic. Scrubbed from chunk 2 placeholder list, chunk 4b word-count targets, chunk 5 deliverables. Created `plans/writing-topics/claude-workspace-audit.md` with candidate thesis and four supporting arguments. Added to `plans/writing-topics/INDEX.md`. The `src/content/projects/workspace-audit.mdx` placeholder file still exists and should be removed next time chunk 2 is touched.
- Added new **chunk 7 — Design system showcase page** (renumbered existing retrofit chunk to chunk 8). `/design-system` route rendering actual components (not screenshots), footer-linked not in main nav. Design explorer first (`plans/portfolio-assets/design-system-showcase.html`). Gate: after chunk 6 ships so the component inventory is complete.
- Added an open design question to chunk 4c.1 about `<ChatTranscript>` sender colour emphasis — explore both Claude-prominent (current intent) and Dylan-prominent in the case study design explorers before locking. Rationale: if Claude's turns visually dominate, the portfolio's signal hierarchy inverts.

**Next priorities (session order):**
1. **4d (continued)** — Dylan writes prose for each section against the locked structure in `plans/the-weekly-case-study-draft.md`. Then iterate (2-iteration hard stop), build the MDX, update frontmatter (dates, live URL, tldr rewrite).
2. **4c.1** — case study design explorers; now must also include `<ProjectTimeline>` samples and both sender-colour options for `<ChatTranscript>`.
3. **4c.2-4c.5** — remaining page layout explorers (/projects index, /writing, /log, /404+/privacy)

**Deployed** — Cloudflare Pages, `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`.

**Chunks remaining:** 4c.1 (with new timeline + transcript-colour explorations), 4c.2-4c.5, 4d, 5, 5.5, 5.6, 6, 7 (new showcase page), 8 (was chunk 7 retrofit).

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6 → 7 → 8). Chunk 7 (design system showcase page) was added this session. Chunk 8 (was chunk 7, design-system retrofit) remains opportunistic post-launch.
Current status tracked in `DIARY.md`.
