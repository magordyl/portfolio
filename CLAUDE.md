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

## Current Status (2026-04-12)

**Last session (2026-04-12) — Chunk 4c.1 complete: components + layout + ChatTranscript fix.**

**Commits this session:**
- `1f952da` — Diagram, ChatTranscript, CaseStudyLayout, project page routes
- `edc9f20` — diary entry for 4c.1
- `0ce66f6` — untracked scripts + draft transcript committed
- `96e1153` — ChatTranscript fix: nested expanders within turns, bolder chevron

**Chunk 4c.1 complete.** Three components and the page route shipped:
- **`Diagram.astro`** — 490px min-width scroll container, mobile bleed via negative margins, "scroll →" hint on mobile
- **`ChatTranscript.astro`** — inline + breakout modes, vertical stacked Bot/User icons (24px circle gutter), three render modes (verbatim, collapsed plan/skill/research, headline with per-heading collapse), native `<details>` with 16px chevron-down SVG, markdown rendering, zero JS
- **`CaseStudyLayout.astro`** — 680px prose column, hero from frontmatter (number badge, serif title, TL;DR, metadata bar, tags, live link, hero image placeholder), h2 styled as uppercase mono section kickers, breakout margin support, screenshot grid utility
- **`pages/projects/[slug].astro`** — static routes for all 5 projects, MDX rendered with ChatTranscript + Diagram as injected components

**Design decisions locked this session:**
- **Bot** icon for Claude (not Sparkles)
- **Vertical stacked** header layout (icon + label in 40px left gutter)
- **Stitch v1** layout as structural base (spacing tightened to token scale)
- Stitch ideation artefact preserved at `plans/portfolio-assets/stitch-case-study-v1{-screenshot.png,.html}`

**Planned middle zone per project (from template):**

| Project | Depth | Middle sections | Rationale |
|---------|-------|----------------|-----------|
| The Weekly (#1) | Full | Design, Architecture, Decisions | Strong design iteration trail |
| Planner POC (#2) | Full | Architecture, Decisions | Migration + spending guard |
| Workspace Audit (#3) | Lightweight | Decisions | Tooling/process project |
| This Portfolio (#4) | Lightweight | Design | Meta: design system is the story |
| Planner V1 (#5) | Full | Architecture, Design, Decisions | Complex system + new frontend |

**Preview harness** (`scripts/render-transcript.mjs` + `scripts/preview-transcript.mjs`) already existed from prior session. Verified working with `--slug plan-iteration-example --variant b-h2 --open`. All four variants render; `b-h2` is the locked default.

**Next priorities (session order):**
1. **4d** — write the-weekly case study against locked template + layout (Opus recommended)
2. **4c.2-4c.5** — remaining page layout explorers (/projects index, /writing, /log, /404+/privacy)

**Deployed** — Cloudflare Pages, `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`.

**Chunks remaining:** 4c.2-4c.5, 4d, 5, 5.5, 5.6, 6.

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6, plus optional chunk 7 design-system retrofit post-launch).
Current status tracked in `DIARY.md`.
