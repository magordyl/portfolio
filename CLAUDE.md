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

## Current Status (2026-04-12)

**Last session (2026-04-12) — Chunk 4d: case study structure and interview for the-weekly.**

**What was done this session:**
- In-depth interview with Dylan capturing origin story, learning arc, product philosophy, and hiring-manager signal
- Agreed case study structure: "learning to ship with Claude Code" framing, product as vehicle
- Section structure locked: Problem (2 beats: product insight + why build now), Decisions (3: front-end only, TDD, opinionated UX), Outcome (product-focused, no Claude Code mention), Lessons (2: never touched code, skipped design)
- Middle zone: Decisions only (no Architecture, no Design section). No transcript embeds. Screenshots deferred.
- Structure + full interview context saved to `plans/the-weekly-case-study-draft.md` (commit `3dee29e`)

**Next priorities (session order):**
1. **4d (continued)** — Dylan writes prose for each section against the locked structure in `plans/the-weekly-case-study-draft.md`. Then iterate (2-iteration hard stop), build the MDX, update frontmatter (dates, live URL, tldr rewrite).
2. **4c.2-4c.5** — remaining page layout explorers (/projects index, /writing, /log, /404+/privacy)

**Deployed** — Cloudflare Pages, `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`.

**Chunks remaining:** 4c.2-4c.5, 4d, 5, 5.5, 5.6, 6.

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6). Chunk 7 (design-system retrofit) was pulled forward — `design.tokens.ts` now exists. The remaining chunk 7 work (emitter script, generated globals.css) is optional post-launch.
Current status tracked in `DIARY.md`.
