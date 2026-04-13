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

## Current Status (2026-04-14)

**Last session (2026-04-14) — ChatTranscript design locked + new colour-rationalisation gate.**

The `<ChatTranscript>` design is frozen. Canonical artefact: `plans/portfolio-stitch-assets/chat-transcript-explorer-v3.html` (iteration trail preserved as v1 → v2 → v3). Selected variant: **royal-3 hairline, full-block accent line, flat expander**. Role swap locked in favour of Option B (Dylan = violet, Claude = royal). Commit `c733595` on `main`.

Features baked into the spec (all documented in `portfolio-implementation.md` chunk 4c.1 + `portfolio-imagery-standards.md` frame-spec table):
- Gradient border (`--grad-rv`) on `--royal-1` inner, 12px radius.
- Grouping: consecutive same-role turns share one badge + continuity line.
- Cluster expander: runs of 3+ consecutive tool-heavy Claude turns merge into one expander with a synthesised heading (e.g. the 40-render Stitch batch = 21 turns → 1 cluster).
- Wrap-up pill: trailing directive sentences ("reply with your answers…") stay visible outside the expander.
- Two pill colours only (`high` / `bg`), word-boundary-trimmed titles with 2-line clamp, native `<details>` (zero framework JS), `pre-wrap` tool input, underlined `--royal-11` "full input" link.
- Content filters in the renderer (not in source JSON): context-compaction turns + slash-command invocations are dropped.

**Design-tokens wiring (done this session):**
- `src/styles/globals.css` — added `--violet-8..12` and `--grad-rv`.
- `design.tokens.ts` — added `palette.violet` and `palette.gradients.royalViolet` with scope-to-ChatTranscript comments (any new usage requires design review).

**New chunk 4c.0 — component colour-role rationalisation (gate before 4c.1 opens).**

The ChatTranscript pill churn (four colours → two) surfaced that components reach into the raw 17-colour scale ad hoc. Added a mandatory gate before 4c.1 builds more components. Six sub-steps:
1. Audit every raw-scale reference (inventory → `plans/portfolio-colour-audit.md`).
2. Define per-component variant allowlists (tags ≤ 4, kickers ≤ 2, dots ≤ 3, borders ≤ 3, expander pills ≤ 2 — locked).
3. Add role tokens to `globals.css` + `design.tokens.ts` (roles reference raw scale; components reference roles only).
4. Migrate existing chunk-3 components (`CaseStudyCard`, `BuildLogTicker`, `KickerLabel`, tag rendering). Acceptance: `git grep 'var(--royal-' src/components` returns empty.
5. Document in `portfolio-design-tokens.md` (new "Component variant allowlists" section) + mirror summary in `.claude/rules/design-system.md`.
6. Gate check: `npm run check` passes on main before 4c.1 starts.

**Prior sessions context still live:**
- `<ProjectTimeline>` component still scoped into 4c.1; will now be built against rationalised tokens.
- `<VersionedEmbed>` + three Workers deploys still in 4d. Plan at `plans/the-weekly-evolution-showcase.md`.
- `src/content/projects/workspace-audit.mdx` placeholder still needs removing next time chunk 2 is touched.

**Next priorities (session order):**
1. **4c.0** — component colour-role rationalisation (new gate). Produces the role-token layer that 4c.1 and 4d components will use.
2. **4d (continued)** — Dylan writes prose for each section against the locked structure in `plans/the-weekly-case-study-draft.md`.
3. **4c.1** — case study design explorers; now building `<ChatTranscript>`, `<ProjectTimeline>`, sample transcripts against the rationalised tokens.
4. **4c.2-4c.5** — remaining page layout explorers (/projects index, /writing, /log, /404+/privacy).

**Deployed** — Cloudflare Pages / Workers, `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`.

**Chunks remaining:** 4c.0 (new gate), 4c.1, 4c.2-4c.5, 4d, 5, 5.5, 5.6, 6, 7 (showcase page), 8 (design-system retrofit, opportunistic).

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6 → 7 → 8). Chunk 7 (design system showcase page) was added this session. Chunk 8 (was chunk 7, design-system retrofit) remains opportunistic post-launch.
Current status tracked in `DIARY.md`.
