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

**This session (2026-04-12) — 4a.4 complete + A2 diagram aesthetic locked.**

- **4a.4 complete** — `.claude/rules/writing-style.md` shipped in the **workspace repo**. Three-part synthesis: Part 1 (15 structural rules, locked), Part 2 (style guardrails — prohibitions only, positive voice rules deferred to chunk 4d), Part 3 (imagery and transcript standards compressed from this repo's `portfolio-imagery-standards.md`). Incorporates Wes Kao's assertion framework as rule 5 (insight → suggestion → assertion, template, six banned hedges, citation), "no unnecessary adjectives or qualifiers" as a durable preference, programmatic crop/focus/zoom for screenshots, and transcript budget of up to 2 breakouts + 2 inline.
- **A2 diagram aesthetic locked** — "clean vector Royal Tonal" chosen from a 5-option design explorer (`plans/portfolio-stitch-assets/diagram-aesthetic-explorer-v1.html`, new this session). Rubric: A1 hand-drawn sketch (feTurbulence), A2 clean vector, A3 typographic monospace, A4 Notion-flat, A5 blueprint. Spec: royal-8 stroke on royal-12 background, 1.5px strokes, 8px node corner radius, Geist 13px/500 labels. `portfolio-imagery-standards.md` tooling section rewritten: Mermaid CLI default theme with Royal Tonal `themeVariables` for flowcharts, Mermaid `quadrantChart` for 2×2, hand-authored SVG from `diagrams-src/_template.svg` for causal loops/networks. Open eval: d2 as alternative if >2 non-Mermaid diagrams ship.
- **Transcript promotion blocked** — attempted to promote `plan-iteration-example` draft through `promote-transcript.mjs --yes`; structural validation rejected turns 1, 3, 6 as "empty text". Root cause: `bookmark-transcript.mjs` captures tool-only assistant turns (empty `text`, populated `collapsedTools`) as standalone turns, but the schema rejects them. This is a real bug in the bookmark/promote pipeline, not a one-off. Draft left in place. **Fix path: either (a) merge tool-only turns into the preceding prose turn during classification in 4a amendment 2c, or (b) amend the schema to allow `text === ""` when `collapsedTools.length > 0`.** Lean: (a), because a tool call without surrounding prose is rarely worth rendering as its own turn.
- **Retro rule added to workspace CLAUDE.md** — "Before editing after a decision-invalidates-approach event, grep the whole affected document(s) for the old approach's keywords first. Build the full edit list before touching anything." Triggered by residual Excalidraw/RoughJS references scattered across `portfolio-imagery-standards.md` after A2 was picked — piecemeal editing missed references in 6+ sections.

**Chunk 4a amendments planned (2026-04-12, prior session)** — `plans/portfolio-chunk-4a-amendments.md` details four amendments that all land in chunk 4a before 4b starts:

1. **Transcript sender identity** — lucide icons (Dylan + Claude) alongside text labels in `<ChatTranscript>`. Two candidate icon pairs (User+Sparkles vs User+Bot) and two header layouts (H1 horizontal compact vs H2 vertical stacked) built in 4c.1 design explorer via a `--variant` flag on the preview harness.
2. **Collapsible sections** — new optional `kind` field on each turn (`verbatim|headline|plan|skill|research`) drives native `<details>/<summary>` render (zero JS, no framework). Classifier pass added to `bookmark-transcript.mjs`. Dylan's turns never collapse.
3. **Review renders in the UI component** — new `scripts/render-transcript.mjs` (shared render helper) + `scripts/preview-transcript.mjs` (browser preview harness). `promote-transcript.mjs` amended to open a browser preview instead of printing a text listing. `<ChatTranscript>.astro` imports the same render helper (parity gated by a test). Generalisable principle saved as memory `feedback_review_in_ui_component.md`.
4. **New sub-chunk 4a.7 — Writing topic capture workflow** — `/writing-topic` skill at workspace level, `scripts/writing-topic.mjs` accepts freeform text and auto-derives slug/title/source-project/session-context/transcript-link. `portfolio/plans/writing-topics/` folder with per-topic files + INDEX.md. `/bookmark` relocates to workspace level too (fixes the cross-project gap from 4a.6.4).

**Test fixture captured (this session):** `src/content/transcripts/drafts/plan-iteration-example.json` — 7 turns of this planning conversation, to be used for rendering/preview once the amendments ship. Keep as draft until the classifier + component exist.

**Files the amendments touch:**
- Edit: `src/content.config.ts`, `scripts/bookmark-transcript.mjs`, `scripts/promote-transcript.mjs`, `plans/portfolio-imagery-standards.md`, `plans/portfolio-implementation.md`
- New: `scripts/render-transcript.mjs`, `scripts/preview-transcript.mjs`, `scripts/writing-topic.mjs`, `scripts/session-utils.mjs`, `src/components/ChatTranscript.astro` (in 4c.1), `plans/writing-topics/` folder
- Workspace-level: new `/bookmark` and `/writing-topic` skills under `<workspace>/.claude/skills/`; `/session-end` Step 0.5 extended
- Delete after migration: `portfolio/plans/portfolio-writing-brainstorm.md`, `portfolio/.claude/skills/bookmark/`

**Execution order:** amendments 2b (schema) + 2c (classifier) + 3a (render helper) + 3b (preview harness) + 3c (promote rewrite) should land as one commit — they're coupled. Amendment 4a.7 can follow as a separate commit. Amendment 1 (icon variants) needs no code until 4c.1.

**4a.6 complete (2026-04-12)** — Transcript capture workflow shipped. Commit `f61060f`.
- `scripts/bookmark-transcript.mjs` — reads active session JSONL, filters real turns, collapses tool calls, redacts paths/emails/tokens, writes to `src/content/transcripts/drafts/<slug>.json`
- `scripts/promote-transcript.mjs` — re-runs redaction, structural validation (2–8 turns), prints draft, promotes to `src/content/transcripts/<slug>.json`
- `.claude/skills/bookmark/SKILL.md` — `/bookmark` skill wired in portfolio repo (**will relocate to workspace** per amendment 4a.7.4)
- `src/content.config.ts` — `transcripts` Zod collection added (`*.json` pattern, `drafts/` excluded by non-recursive match) — **will be extended** per amendment 2b
- Workspace `/session-end` skill updated with Step 0.5 (pending draft review)
- **First-use gate (4a.6.6) still open** — can be satisfied by promoting `plan-iteration-example` once the amended promote flow ships

**Backfill commit (2026-04-12)** — `557febc` added `card-deep-dive-v5.html`, `v6.html`, `v7.html` and `plans/portfolio-stitch-assets/transcripts/design-explorer-skill-origin.md` (placeholder transcript draft, pending 4a.6 infrastructure — now shipped).

**Next priorities:**
- **Chunk 4a amendments** — execute `plans/portfolio-chunk-4a-amendments.md`. Most urgent: amendments 2 + 3 (schema extension, classifier, render helper, preview harness, promote rewrite) as one commit; then 4a.7 (writing topics + bookmark relocation) as a second commit. **Amendment 2c classifier must also fix the tool-only-turn schema bug surfaced this session** — merge tool-only turns into the preceding prose turn, or amend schema to accept them.
- **4a.5** (workspace repo) — create `ideas/DIARY.md`, update `docs/diary-format.md`, wire `/new-idea` skill

**After amendments + 4a.5:** run the 4a.6.6 first-use gate by promoting `plan-iteration-example` end-to-end through the amended preview-based review flow. Then start 4b.

**Card deep-dive v3 + v4 shipped (2026-04-12, prior session)** — `plans/portfolio-stitch-assets/card-deep-dive-v3.html` and `v4.html` (commit `54f3aa5`). v3 pins **Layout A (top 160px strip)** as the fixed card spec and renders all six v2 visual types at strip scale, then explores six options for fitting a mobile screenshot (~1:2.16) into a ~2.6:1 strip (M1 top slice, M2 contained, M3 tilted bleed, M4 dual cascade, M5 meta split, M6 UI detail zoom). v3 also changes the numeral colour rule from the signature gradient to card register colour (royal for work, violet for writing) so a 2×2 grid doesn't collapse into visual soup. v4 refines v3 on user feedback: **(1)** unified sizing shell for centred marks (numeral 120px / icon 88px / monogram 72px) so they render at sibling weights; **(2)** deeper text marks — moved from `royal-10`/`violet-10` to `royal-8`/`violet-8`, the exact anchor shades of the original gradient; **(3)** monogram moves from Geist Mono to Fraunces to match numeral family; **(4)** screenshot auto-tint deepened from opacity 0.55 to 0.9 so the blend locks fully to card colour with no gradient bleed-through; **(5)** new §3b combined mobile section — recommends using M5 and M6 together with rule "max one M5 per grid (anchor card), M6 for the rest." v1, v2, v3 preserved as iteration trail. **Pending user review of v4** — if decisions lock, proceed to chunk 4b (case study content hierarchy). Two open questions still in v4: (a) does gradient-mark stay in the type pool or drop to a reserved slot for featured + palette-as-subject posts; (b) do M5/M6 become explicit `image.kind` sub-types in the Card props API or live as capture-time decisions in the `<Screenshot>` helper component (my lean: keep API simple, compose in the helper).

**Backfill commit (2026-04-12, this session)** — commit `05098d9` brought seven accumulated artefacts from prior sessions into version control: `accent-palette-explorer-v1.html` through `v5.html` (iteration trail of gestalt critique and audit fixes), `card-deep-dive-v1.html` (first pass scoping six card layout options, recommending layout D corner accent), and the expanded `portfolio-design-tokens.md` (violet signal 5-step scale, signature gradient tokens, WCAG 2.1 AA audit notes). Prior sessions produced these but never pushed them.

**Chunk 3 complete** — landing page with asymmetric hero split, BuildLogTicker, 2x2 CaseStudyCard grid, About teaser, closing quote. `npm run check` passes clean.

**Deployed** — Cloudflare Pages connected to `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`. Every push to `main` auto-deploys.

**Chunk 4 restructured (2026-04-11)** — split into four sub-chunks following a content-first sequence. Session did not start chunk 4 work; it defined the expanded shape of chunk 4 and added two new chunks (5.5 writing posts, 5.6 /about one-off). See `plans/portfolio-implementation.md` for the full updated plan.

**Chunk 4a in progress** — Foundation: voice + imagery + diary audit (workspace-wide style guide).

- **4a.1 complete** — Voice research committed at `plans/portfolio-voice-research.md`. Covers Wes Kao (7 posts, storytelling focus), John Cutler (6 top posts, illustrations + complex messages + relatability). Dylan's voice deferred to chunk 4d because no user-authored long-form prose is available; 4a will ship with structural guidance locked plus style guard rails only. Final style guide splits into Part 1 (Structural, lockable in 4a) and Part 2 (Style, discovered in 4d). AI tells to avoid list included (em-dashes prohibited as #1 tell).
- **4a.2 complete** — Diary audit committed at `plans/portfolio-diary-audit.md`. Five exemplar entries called out (mostly workspace diary), four weak ones. Biggest gap: **product thinking** — 48 entries, only one centres a product claim. Structural cause identified: `ideas/` folder has no `DIARY.md`, so research/pivot/shelving decisions leave no trace. **This MUST be fixed in 4a.5** (new task #7, audit doc §"Fifth implication", memory file `project_ideas_diary_gap.md`).
- **4a.3 complete** — Imagery & illustration standards committed at `plans/portfolio-imagery-standards.md`. Key decisions: (1) hybrid diagram tooling — Mermaid CLI with `look: handDrawn` for flowcharts, Excalidraw for 2×2/causal loop/network archetypes; (2) Puppeteer capture script + Astro `<Screenshot>` component split for screenshots (frame at render time, never baked in); (3) no figurative illustrations, diagrams + screenshots + embedded real artefacts only; (4) explicit sourcing banlist (no AI-generated imagery, no stock, no Figma-as-real); (5) full frame spec table (gradient, radius, padding, shadow). Ray.so allowed as code-screenshot exception. Capture script and mmdc batch script are **built in chunk 4d**, not now. `<Screenshot>` component is built in 4c.
- **4a.4 complete (this session)** — `.claude/rules/writing-style.md` shipped in workspace repo. Three parts: structural rules (locked), style guardrails (prohibitions only, positive voice rules deferred to 4d), imagery + transcript standards compressed from the standards doc. Kao assertion framework incorporated as rule 5. A2 clean-vector Royal Tonal locked as diagram aesthetic via `plans/portfolio-stitch-assets/diagram-aesthetic-explorer-v1.html` + tooling rewrite in `portfolio-imagery-standards.md`.
- **4a.5** — Create `ideas/DIARY.md` as new workspace artefact. Update `docs/diary-format.md` and `CLAUDE.md` Idea Pipeline section. Wire capture trigger into `/new-idea` skill. Retroactive first entry covers habit-correlation research arc.
- **4a.6 complete** — Transcript capture workflow shipped (commit `f61060f`). `/bookmark` skill, `scripts/bookmark-transcript.mjs`, `scripts/promote-transcript.mjs`, `transcripts` Zod collection, `/session-end` Step 0.5. **First-use gate still open** — bookmark + promote one real transcript before 4b.

**Transcripts are now a first-class artefact type (2026-04-12, this session).** Same tier as diagrams and screenshots. Full frame spec, placement rule (Process/Lessons only — never Hero/Problem/Outcome), verbatim-only rule (no edits, reorders, combinations), 2–8 turn range, 50-word budget cost per embed, automated redaction pass + mandatory hand-review before promotion. Rationale: the portfolio's narrative is largely "learning to ship with Claude Code" and verbatim transcripts are the strongest available product-thinking signal — real reasoning can't be fabricated without reading fabricated. All amendments live in `plans/portfolio-imagery-standards.md` (new "Chat transcripts" section, ~90 lines), `plans/portfolio-implementation.md` (new 4a.6 chunk, amended 4b template with transcript slot + word budget rule, amended 4c.1 with `<ChatTranscript>` requirement + sample-transcript gate in design explorers), and `DIARY.md` entry leading the file.

**Note:** 4a.1, 4a.2, 4a.3, 4a.6 artefacts commit to the **portfolio repo** (they are portfolio plans/tooling). The 4a.4/4a.5 deliverables (writing-style.md, diary capture rule updates, ideas/DIARY.md) commit to the **workspace repo** per original plan.

**Chunks remaining:** 4a (foundation — 4a.5 left + 4a amendments), 4b (case study content hierarchy), 4c (page layout mockups, excludes /about), 4d (the-weekly workshop), 5 (remaining case studies), 5.5 (writing posts brainstorm + 3 drafts), 5.6 (/about one-off), 6 (secondary pages + deploy).

**Key discipline:** content-first. Template scaffold (4b) before layout mockups (4c). Writing (4d) only after both are locked. Resist the temptation to sketch layouts while defining content.

**Revised timeline:** ~3–4 weeks of sessions for v1 (up from 1–2 weeks). Extra scope buys a materially higher quality ceiling — style guide governs all writing going forward, imagery standards prevent inconsistency, diary audit surfaces which signals are missing for hiring-manager audiences.

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6, plus optional chunk 7 design-system retrofit post-launch).
Current status tracked in `DIARY.md`.
