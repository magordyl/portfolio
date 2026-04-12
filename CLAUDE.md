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

**Last session (2026-04-12) — Chunk 4a closed: writing-topic workflow, session-utils extraction, /bookmark relocation.**

- **Chunk 4b complete** (commit `5f9260c`). Project content template locked at `plans/portfolio-case-study-template.md`. Key decisions: "Projects"/"Writing" naming, flexible middle zone (1-3 sections from Decisions/Architecture/Design pool), word budgets as soft guides.
- **Architecture diagrams use Mermaid**, not hand-authored SVG. Tested in `plans/portfolio-stitch-assets/mermaid-diagram-samples-{v1,v2}.html`. `classDef` handles three-tier node treatment (owned/highlighted/external). Sentence-case labels (CSS override on Mermaid's default uppercase). Subgraph labels stay uppercase by convention.
- **All diagram types share one mobile strategy:** `.diagram-inner` with `min-width: 490px`, `.diagram-card` with `overflow-x: auto`, "scroll →" hint when overflowing. Font size stays at 13px — never shrinks on mobile. The `<Diagram>` Astro component (built in 4c.1) enforces this for all diagram types.
- **Architecture diagram colour standards** (from template): owned = royal-4/royal-8, highlighted = royal-5/royal-9 (2px), external = transparent/royal-7 dashed. Royal Tonal only (no Violet Signal in architecture diagrams).
- **Hand-authored SVG explorers** (`architecture-diagram-explorer-{v1,v2}.html`) preserved for the iteration trail but Mermaid is the production path.

**Planned middle zone per project (from template):**

| Project | Depth | Middle sections | Rationale |
|---------|-------|----------------|-----------|
| The Weekly (#1) | Full | Design, Architecture, Decisions | Strong design iteration trail |
| Planner POC (#2) | Full | Architecture, Decisions | Migration + spending guard |
| Workspace Audit (#3) | Lightweight | Decisions | Tooling/process project |
| This Portfolio (#4) | Lightweight | Design | Meta: design system is the story |
| Planner V1 (#5) | Full | Architecture, Design, Decisions | Complex system + new frontend |

**Chunk 4a complete** — all sub-chunks shipped (4a.1-4a.7). Amendment 1 (icon variants) deferred to 4c.1 design explorer. Writing topics migrated from `portfolio-writing-brainstorm.md` to `plans/writing-topics/` (per-topic files + INDEX). `/bookmark` relocated to workspace level. Session utils extracted to `scripts/session-utils.mjs`.

**Next priorities (session order):**
1. **4c.1** — case study page layout explorer + `<ChatTranscript>` + `<Diagram>` components
2. **4d** — write the-weekly case study against locked template + layout

**Deployed** — Cloudflare Pages, `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`.

**Chunks remaining:** 4c, 4d, 5, 5.5, 5.6, 6.

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6, plus optional chunk 7 design-system retrofit post-launch).
Current status tracked in `DIARY.md`.
