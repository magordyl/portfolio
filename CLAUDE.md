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

**Chunk 3 complete** — landing page with asymmetric hero split, BuildLogTicker, 2x2 CaseStudyCard grid, About teaser, closing quote. `npm run check` passes clean.

**Deployed** — Cloudflare Pages connected to `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`. Every push to `main` auto-deploys.

**Chunk 4 restructured (2026-04-11)** — split into four sub-chunks following a content-first sequence. Session did not start chunk 4 work; it defined the expanded shape of chunk 4 and added two new chunks (5.5 writing posts, 5.6 /about one-off). See `plans/portfolio-implementation.md` for the full updated plan.

**Chunk 4a in progress** — Foundation: voice + imagery + diary audit (workspace-wide style guide).

- **4a.1 complete** — Voice research committed at `plans/portfolio-voice-research.md`. Covers Wes Kao (7 posts, storytelling focus), John Cutler (6 top posts, illustrations + complex messages + relatability). Dylan's voice deferred to chunk 4d because no user-authored long-form prose is available; 4a will ship with structural guidance locked plus style guard rails only. Final style guide splits into Part 1 (Structural, lockable in 4a) and Part 2 (Style, discovered in 4d). AI tells to avoid list included (em-dashes prohibited as #1 tell).
- **4a.2 complete** — Diary audit committed at `plans/portfolio-diary-audit.md`. Five exemplar entries called out (mostly workspace diary), four weak ones. Biggest gap: **product thinking** — 48 entries, only one centres a product claim. Structural cause identified: `ideas/` folder has no `DIARY.md`, so research/pivot/shelving decisions leave no trace. **This MUST be fixed in 4a.5** (new task #7, audit doc §"Fifth implication", memory file `project_ideas_diary_gap.md`).
- **4a.3 complete** — Imagery & illustration standards committed at `plans/portfolio-imagery-standards.md`. Key decisions: (1) hybrid diagram tooling — Mermaid CLI with `look: handDrawn` for flowcharts, Excalidraw for 2×2/causal loop/network archetypes; (2) Puppeteer capture script + Astro `<Screenshot>` component split for screenshots (frame at render time, never baked in); (3) no figurative illustrations, diagrams + screenshots + embedded real artefacts only; (4) explicit sourcing banlist (no AI-generated imagery, no stock, no Figma-as-real); (5) full frame spec table (gradient, radius, padding, shadow). Ray.so allowed as code-screenshot exception. Capture script and mmdc batch script are **built in chunk 4d**, not now. `<Screenshot>` component is built in 4c.
- **4a.4 next** — Synthesise voice research + diary audit + imagery standards into `.claude/rules/writing-style.md` (workspace repo). Two-section split: structural + style, plus imagery section compressed from the standards doc.
- **4a.5** — Create `ideas/DIARY.md` as new workspace artefact. Update `docs/diary-format.md` and `CLAUDE.md` Idea Pipeline section. Wire capture trigger into `/new-idea` skill. Retroactive first entry covers habit-correlation research arc.
- **4a.6 added (2026-04-12, this session)** — Transcript capture workflow (portfolio repo). New last sub-chunk of 4a. Builds the `/bookmark` slash command, `scripts/bookmark-transcript.mjs` (in-flow capture from live session JSONL), `scripts/promote-transcript.mjs` (redaction + hand-review gate + draft→published move), the `transcripts` Zod content collection at `src/content.config.ts`, and wires draft review into `/session-end`. First-use gate: bookmark + promote one real moment end-to-end **before chunk 4b starts**. The `<ChatTranscript>` component is deliberately NOT in 4a.6 — deferred to 4c.1 so drafts can start accumulating immediately while the render layer is designed alongside the case study layout.

**Transcripts are now a first-class artefact type (2026-04-12, this session).** Same tier as diagrams and screenshots. Full frame spec, placement rule (Process/Lessons only — never Hero/Problem/Outcome), verbatim-only rule (no edits, reorders, combinations), 2–8 turn range, 50-word budget cost per embed, automated redaction pass + mandatory hand-review before promotion. Rationale: the portfolio's narrative is largely "learning to ship with Claude Code" and verbatim transcripts are the strongest available product-thinking signal — real reasoning can't be fabricated without reading fabricated. All amendments live in `plans/portfolio-imagery-standards.md` (new "Chat transcripts" section, ~90 lines), `plans/portfolio-implementation.md` (new 4a.6 chunk, amended 4b template with transcript slot + word budget rule, amended 4c.1 with `<ChatTranscript>` requirement + sample-transcript gate in design explorers), and `DIARY.md` entry leading the file.

**Note:** 4a.1, 4a.2, 4a.3, 4a.6 artefacts commit to the **portfolio repo** (they are portfolio plans/tooling). The 4a.4/4a.5 deliverables (writing-style.md, diary capture rule updates, ideas/DIARY.md) commit to the **workspace repo** per original plan.

**Chunks remaining:** 4a (foundation — 4a.4/4a.5/4a.6 left), 4b (case study content hierarchy), 4c (page layout mockups, excludes /about), 4d (the-weekly workshop), 5 (remaining case studies), 5.5 (writing posts brainstorm + 3 drafts), 5.6 (/about one-off), 6 (secondary pages + deploy).

**Key discipline:** content-first. Template scaffold (4b) before layout mockups (4c). Writing (4d) only after both are locked. Resist the temptation to sketch layouts while defining content.

**Revised timeline:** ~3–4 weeks of sessions for v1 (up from 1–2 weeks). Extra scope buys a materially higher quality ceiling — style guide governs all writing going forward, imagery standards prevent inconsistency, diary audit surfaces which signals are missing for hiring-manager audiences.

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6, plus optional chunk 7 design-system retrofit post-launch).
Current status tracked in `DIARY.md`.
