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

**Chunk 4 next** — Case Study Workshop (critical gate). Voice reference research (Wes Kao + John Cutler Substack) → Voice & Craft reference doc → template scaffold → the-weekly first draft → iterate → lock.

**Chunks remaining:** 4 (case study workshop — critical gate), 5 (remaining case studies), 6 (secondary pages + deploy polish)

## Implementation Plan

Full 6-chunk plan: `plans/portfolio-implementation.md` (this repo's `plans/`).
Current status tracked in `DIARY.md`.
