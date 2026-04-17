# Portfolio — Implementation Plan (Phase 7)

**Status:** In progress. Chunk 3 complete (2026-04-11). Chunk 4 restructured into 4a–4d (content-first), plus new chunks 5.5 (writing posts) and 5.6 (/about one-off) — 2026-04-11. Chunk 4a expanded to include 4a.6 (transcript capture workflow) — 2026-04-12. Chunks 4b and 4c.1 amended to treat verbatim chat transcripts as a first-class artefact type alongside screenshots and diagrams. **2026-04-17:** component kit scaffold moved forward from chunk 7 into new step 4c.0.5 so `/design-system` doubles as the dev surface for every component built from 4c.1 onward; each component chunk now has a standing "update the kit" step. Chunk 7 slimmed to a post-launch polish stub.

**Tailwind v4 gotcha discovered in chunk 1:** `astro add tailwind` installs `@tailwindcss/vite` (Vite plugin) not `@astrojs/tailwind`. No `tailwind.config.mjs` needed. CSS variables in `globals.css` are the token system. References to `tailwind.config.mjs` in this plan are obsolete — skip those sub-steps.

**Astro 6 content collection gotchas discovered in chunk 2:** (1) Config must be at `src/content.config.ts`, not `src/content/config.ts`. (2) Import `z` from `zod` directly, not from `astro:content` (deprecated). (3) Use `z.url()` not `z.string().url()` (deprecated in Zod v4). (4) Every collection must have a `loader` — `glob()` from `astro/loaders` is the standard choice.

Ten chunks to ship v1 (1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6), plus two post-launch chunks (7 showcase polish, 8 design-system retrofit). Each chunk is one commit's worth, independently testable, built on the previous. Chunk 4 is split into four sub-chunks following a **content-first sequence**: foundation (style + imagery + diary audit) → content template → layout mockups → case study workshop. Content structure dictates layout, never the reverse.

---

## ✅ Chunk 1 — Foundation (scaffold + tokens) — COMPLETE (d5c9f0d)

**Deliverable:** `portfolio/` directory with Astro project running locally, tokens applied, base layout visible with placeholder content.

- `npm create astro@latest portfolio` inside workspace root (template: minimal)
- Add integrations: `@astrojs/react`, `@astrojs/mdx`, `@astrojs/tailwind`, `tailwindcss@4`
- Install fonts: `@fontsource/fraunces`, `@fontsource-variable/geist`, `@fontsource/geist-mono`
- Create `src/styles/globals.css` with the Royal Tonal token block + type scale from `plans/portfolio-design-tokens.md`
- Configure `tailwind.config.mjs` to read CSS variables via Tailwind v4 `@theme`
- `src/layouts/BaseLayout.astro` with header/footer slots
- `src/components/astro/PageHeader.astro` — hamburger + wordmark + "Get in touch" pill
- `src/components/astro/PageFooter.astro` — LinkedIn + privacy link
- `src/components/astro/KickerLabel.astro`
- `src/pages/index.astro` — hero with the north-star statement, no content yet
- `package.json` scripts: `dev`, `build`, `check`, `test`
- `.git/hooks/pre-commit` runs `cd portfolio && npm run check`
- `portfolio/CLAUDE.md` with project-specific rules
- `portfolio/DIARY.md` with first entry

**Acceptance:** `npm run dev` serves the landing hero on `localhost:4321` with correct fonts, Royal Tonal colours, header visible.

**Commit:** `portfolio: scaffold Astro project with Royal Tonal tokens and base layout`

---

## ✅ Chunk 2 — Content Collections + placeholder content — COMPLETE (2026-04-11)

**Deliverable:** Zod schemas validating; one MDX file per collection type renders correctly.

- `src/content/config.ts` — projects, writing, log schemas (from `plans/portfolio-architecture.md`)
- `content/projects/the-weekly.mdx` — placeholder frontmatter + TL;DR only (no case study body yet — that's chunk 4)
- `content/projects/planner-app.mdx`, `portfolio.mdx` — same (placeholder only)
- ~~`workspace-audit.mdx`~~ — converted to a writing topic (see `plans/writing-topics/claude-workspace-audit.md`); remove this placeholder if it exists
- `content/writing/welcome.mdx` — single placeholder post
- `content/log/*.mdx` — 5 real log entries from the past week (reconstructed from DIARY.md across projects)
- `astro check` must pass (validates schema references)

**Acceptance:** `npm run check` passes. Content collection queries return all entries.

**Commit:** `portfolio: content collections schemas and placeholder entries`

---

## ✅ Chunk 3 — Landing page (V1 refined layout) — COMPLETE (2026-04-11)

**Deliverable:** Fully wired landing page matching the locked Stitch mock.

- `src/pages/index.astro` — full layout:
  - Asymmetric split top: hero left (2/3), BuildLogTicker right (1/3)
  - Full-width Case Study grid below (4 cards, 2x2)
  - About teaser at bottom
- `src/components/astro/BuildLogTicker.astro` — queries log collection, renders 5 most recent
- `src/components/astro/CaseStudyCard.astro` — big serif title, TL;DR, tags, royal-10 "read case study" link
- Mobile breakpoint: single column, build log ticker compact, case study stack with alternating offsets
- Install shadcn `Button` via MCP — use its styles for the "Get in touch" pill
- First real deploy to Cloudflare Pages (Git integration setup)

**Acceptance:**
- Visual match to `plans/portfolio-stitch-assets/12-v1-refined-desktop.png` on 1440px viewport
- Visual match to `plans/portfolio-stitch-assets/13-v1-refined-mobile.png` on 390px viewport
- Lighthouse ≥95 performance, 100 accessibility
- Real URL viewable on phone

**Commit:** `portfolio: landing page with V1 refined layout`

---

## Chunk 4a — Foundation: voice, style & imagery (workspace-wide)

**Status (2026-04-12):** All sub-chunks complete. 4a.1-4a.4 (voice, audit, imagery, style guide), 4a.5 (`ideas/DIARY.md` + capture rules), 4a.6 (transcript workflow + amendments 2+3), 4a.7 (writing-topic capture + `/bookmark` relocation). Chunk 4a is closed.

**Deliverable:** A workspace-wide writing & imagery style guide that governs ALL Claude-produced writing for the user (portfolio, diary entries, future writing posts, any other prose), plus an updated diary capture process so future entries arrive portfolio-ready.

This chunk is the foundation for everything downstream. Style + imagery + diary audit are twin concerns — all three feed the same style guide.

### Step 4a.1 — Voice research (Kao + Cutler)

Analyse Wes Kao and John Cutler Substack posts for tone, structural moves, and writing advice.

**Scope:**
- **Wes Kao** — 8–12 of her most cited posts on communication, clarity, executive writing, feedback, and "managing up". Focus: sentence-level craft, openings, compression, characteristic structural moves.
- **John Cutler** — 8–12 posts on product decision-making, frames/lenses, ways of working, the honest messiness of PM work. Focus: trade-off framing, analogies, how he resists both cynicism and naïve optimism.

**Method:**
- Use WebFetch to pull each post directly from the main session (sub-agents don't reliably have WebFetch in remote-control)
- For each post extract: opening hook, thesis in one sentence, structural pattern, signature rhetorical moves, what's *absent*
- Batch across 5–10 minute windows if Substack rate-limits

### Step 4a.2 — Diary audit (hiring-manager lens)

Quick pass over existing `DIARY.md` entries across all workspace projects (planner-app, the-weekly-app, portfolio, workspace-level) from the perspective of hiring managers and executives in the user's field.

**Goal:** identify gaps — what's present vs. what's missing — so the style guide and the diary capture rules can push future entries toward the right signals.

**Questions to answer:**
- Do entries showcase **product thinking** (framing, user empathy, opportunity sizing)?
- Do they show **decision-making under uncertainty** (options considered, trade-offs made, why)?
- Do they surface **technical judgement** (why this stack, why this pattern, what was rejected)?
- Do they show **honest reflection** (what didn't work, what would be done differently)?
- Is the **narrative shape** legible to a reader who wasn't in the room?

**Output:** a short `plans/portfolio-diary-audit.md` — patterns found, gaps per signal category, 5–10 specific examples (entries that do it well, entries that don't).

### Step 4a.3 — Imagery & illustration standards

Define the visual language for all portfolio and writing imagery. This governs case study screenshots, diagrams, illustrations in articles, and any other visual asset.

**Cover:**
- **Aesthetic** — raw screenshots vs. framed, shadow treatment, border radius, background treatment, dark-mode consistency
- **Diagram conventions** — tool (Excalidraw / tldraw / Figma), linework weight, typography, palette (must draw from Royal Tonal)
- **Illustration style** — when illustrations are used (articles mostly), treatment rules, sourcing (original > stock)
- **Sourcing rules** — what's allowed (original screenshots, hand-drawn diagrams, licensed assets), what's not (generic stock, AI-generated imagery unless clearly framed)
- **File standards** — format (webp/png), resolution, optimisation, where images live in the repo, naming conventions

### Step 4a.4 — Synthesise into workspace style guide

Combine 4a.1 + 4a.2 + 4a.3 + user standards into a single workspace-level document.

**Output:** `.claude/rules/writing-style.md` (workspace root, auto-loaded when editing prose). Sections:
- **Tone rules** — what to emulate (e.g. "Kao opens with a concrete scene, not a definition")
- **Structural patterns** — 3–4 repeatable shapes to steal
- **Don'ts** — things to avoid
- **Signals to surface** — product thinking, decision-making, honest reflection (from the diary audit)
- **Imagery & illustration standards** — full section from 4a.3
- **Applied to diary entries** — how the rules shape future diary capture
- **Applied to case studies** — how the rules map to Problem / Process / Outcome / Lessons
- **Applied to writing posts** — post openings, structure, length targets

### Step 4a.5 — Update diary capture rules

Retro-apply the style guide to the diary capture process so future entries arrive portfolio-ready.

- Update `docs/diary-format.md` (workspace) with new format/prompts
- Update `CLAUDE.md` "Project Diary" section to reference the new rules
- Update post-commit hook prompt if needed
- No retroactive rewrites of existing diary entries — the audit identifies gaps, the new rules prevent them going forward

**Acceptance:**
- `.claude/rules/writing-style.md` exists and user approves it
- `plans/portfolio-diary-audit.md` exists (short — this is a quick pass, not a deep inventory)
- Diary capture rules updated in `docs/diary-format.md` and `CLAUDE.md`
- Imagery & illustration standards are concrete enough to make real sourcing decisions (not hand-wavey)

**Commit:** `workspace: writing & imagery style guide + diary audit + updated capture rules` (workspace repo, not portfolio repo — this is workspace-level tooling)

---

## Chunk 4a.6 — Transcript capture workflow (portfolio repo)

**Deliverable:** an in-flow `/bookmark` skill, a promote script, and a Zod-validated `transcripts` content collection, so that verbatim chat transcripts can be captured as a first-class portfolio artefact without trawling back through sessions after the fact.

**Why this chunk exists:** the portfolio is largely a "learning to ship with Claude Code" narrative. Verbatim transcripts are the single strongest product-thinking signal available — they show real reasoning, real pivots, real mistakes in the user's own words and Claude's actual replies. The expensive cognitive step is judging "is this moment worth capturing?" — which is cheapest in the moment, with full context, when judgment is sharpest. Everything downstream (extraction, storage, formatting) is mechanical and must be automated so the judgment call is the only effort the user ever spends.

**Placement in 4a:** this is the last sub-chunk of the foundation phase. 4a.1–4a.5 are workspace-wide writing/imagery/diary foundations; 4a.6 is portfolio-repo tooling, but it sits in 4a because the first validating use happens *during* 4b–4d and the capture library starts accumulating from the very next session.

### Step 4a.6.1 — Define the `transcripts` content collection

- Add a `transcripts` entry to `src/content.config.ts` alongside `projects`, `writing`, `log`
- Zod schema fields: `id` (slug), `title`, `date`, `project` (optional reference to a `projects` entry), `context` (one-line description of the moment), `note` (Dylan's inline annotation), `sourceSessionId`, `turns: Array<{ role: 'user' | 'assistant', text: string, collapsedTools?: string[] }>`
- Loader: `glob({ pattern: '**/*.json', base: './src/content/transcripts' })` — excludes the `drafts/` subdirectory via pattern negation so drafts never enter the build
- `astro check` validates the schema at build time; a malformed transcript fails the build, same discipline as the other collections

### Step 4a.6.2 — Build `scripts/bookmark-transcript.mjs`

The backing script for the `/bookmark` skill. Node, no dependencies beyond the standard library.

**Inputs (via CLI args):**
- `--slug <kebab-case-slug>` — required
- `--note "<short string>"` — optional but encouraged
- `--back <N>` — optional, default 6
- `--extend` — optional flag; if a draft with this slug already exists, append the most recent N turns instead of overwriting

**Behaviour:**
1. Locate the active session JSONL: the most-recently-modified file in `~/.claude/projects/C--Users-User-Documents-Claude-code/`. Validate mtime is within the last 5 minutes (otherwise error with a clear message — bookmarking a stale session is almost always a mistake).
2. Parse the JSONL, filter to user + assistant message events, preserve order.
3. Extract the last `N` turns (or the turns since the last bookmark for the same slug if `--extend`).
4. For each turn: extract the text, detect tool_use/tool_result blocks and replace them with a one-line label (`[Read <path>]`, `[Edit <path>]`, `[Bash <first 40 chars of command>]`, etc.). Never store raw tool JSON.
5. Run the automated redaction pass (see 4a.3 "Redaction rules"): secret prefixes → `[REDACTED]`, `C:\Users\User\…` → `~/…`, email addresses → `[redacted-email]`.
6. Write (or merge, with `--extend`) the draft to `src/content/transcripts/drafts/<slug>.json` using the content collection schema shape.
7. Print: `✓ bookmarked <N> turns → drafts/<slug>.json — remember to hand-review before promoting`.

**Error cases to handle:**
- No recent session file → clear error, suggest checking the projects folder
- Slug already exists in published `transcripts/` (not `drafts/`) → refuse, tell user to pick a new slug or edit the published file directly
- `--extend` on a slug that has no existing draft → treat as a fresh bookmark
- Session file parse error → report the bad line but don't crash the whole capture

### Step 4a.6.3 — Build `scripts/promote-transcript.mjs`

The promote script. Runs at the user's discretion after hand-review.

**Inputs:** `--slug <slug>` — required. Optional `--dry-run` to print what would change without moving files.

**Behaviour:**
1. Read the draft at `src/content/transcripts/drafts/<slug>.json`.
2. Re-run the redaction regex pass (defence in depth — catches anything hand-edits re-introduced).
3. Run a structural check: min 2 turns, max 8 turns, every turn has non-empty text, no role other than `user`/`assistant`.
4. Validate against the Zod schema (import from `content.config.ts`).
5. Print a hand-review checklist to stdout: "Have you checked for real names? Absolute paths missed by regex? Private project names? Anything you wouldn't want a hiring manager to see?" — require the user to type `yes` to proceed.
6. Move the file to `src/content/transcripts/<slug>.json`.
7. Print: `✓ promoted <slug>. Commit when ready.`

### Step 4a.6.4 — Wire up the `/bookmark` slash command

Create a skill at `.claude/skills/bookmark/SKILL.md` (portfolio repo) that wraps `scripts/bookmark-transcript.mjs`. The skill takes the slug + optional note as arguments, runs the script via Bash, and reports the result inline. The skill description must make the in-flow use case obvious so Claude suggests it when the user signals a moment is worth capturing ("that was the key decision", "that's when I realised", etc.).

### Step 4a.6.5 — Wire draft review into `/session-end`

Update the `/session-end` skill (workspace) so that at session close it lists any files in `portfolio/src/content/transcripts/drafts/` created this session and prints:
- Slug
- Note
- Turn count
- Path

Prompt the user: "Promote, edit, or delete?" — with one-keystroke options. This is the single guarantee that drafts don't pile up forgotten.

### Step 4a.6.6 — First-use validation gate

Before chunk 4b starts: bookmark one real moment from the next portfolio session using `/bookmark`. Promote it end-to-end. If any friction appears (wrong default window, regex missed something, session file not found, etc.), fix it before 4b rather than learning about it during the-weekly workshop.

### Acceptance

- `transcripts` content collection schema exists and `astro check` passes with an empty `transcripts/` folder
- `scripts/bookmark-transcript.mjs` and `scripts/promote-transcript.mjs` exist and are tested against a real session JSONL
- `/bookmark` skill invokable from within Claude Code, runs the script, returns success
- `/session-end` lists pending drafts
- At least one real transcript has been captured, hand-reviewed, promoted, and committed
- The `<ChatTranscript>` component does **not** exist yet — that's chunk 4c.1

**Commit:** `portfolio: transcript capture workflow (/bookmark skill, promote script, transcripts collection)`

---

## Chunk 4b — Case study content hierarchy (template scaffold)

**Deliverable:** A locked case study template defined purely as content hierarchy — sections, what each section answers, target word counts, required artefacts (screenshots, pull-quotes, links). No layout, no prose.

This chunk exists specifically to make sure content structure dictates layout, not the reverse. The layout mockups in 4c build against this shape.

### Step 4b.1 — Draft template scaffold

Starting point for discussion:
```
Hero:          title + one-line TL;DR + tags + live link + primary image slot
               [metadata bar: #03 · Started Mar 2026 · Shipped Apr 2026 · Last updated 12 Apr 2026]
               number, started, finished from frontmatter; lastUpdated computed from git log at build time
               "Shipped" becomes "In progress" when finished is omitted
Problem:       what was broken or missing + why it mattered (~80 words)
Process:       key product decisions + rejected alternatives + why (~200 words)
               [diagram slot: decision tree or architecture sketch]
               [optional transcript slot: one decision-moment embed, inline or breakout]
Outcome:       what shipped + measurable result + screenshots (~80 words)
               [screenshot slot: 2–3 hero shots]
Lessons:       honest reflection, what would be done differently (~80 words)
               [optional transcript slot: one mistake-moment embed, inline only]
Next:          related writing post OR next case study
```

**Transcript slot rules (per 4a.3 "Chat transcripts"):**
- Transcripts are only allowed in **Process** (showing a decision moment) or **Lessons** (showing the mistake). Never in Hero, Problem, or Outcome — those are claim sections, and a transcript in a claim section invites the reader to audit the dialogue instead of trusting the prose.
- Full case studies can have up to 2 transcript embeds total, max 1 in breakout mode.
- Lightweight case studies can have up to 1 transcript embed, inline only.
- Every transcript embed must have a real note explaining why it was marked — "here's a conversation" is not enough.

### Step 4b.2 — Validate against the style guide

Check that every section has a clear home for the signals from `writing-style.md`:
- Where does **product thinking** live? (Process primarily, Problem secondarily)
- Where do **trade-offs** live? (Process — rejected alternatives)
- Where does **honest reflection** live? (Lessons)
- Where do **imagery slots** live? (Hero, Process, Outcome — each with purpose)
- Where do **transcript slots** live? (Process for decisions, Lessons for mistakes — per 4a.3)

Adjust the scaffold until every signal has a home and every section earns its place.

### Step 4b.3 — Word count targets

- **Full case studies** (the-weekly, planner-poc, planner-v1): 400–600 words body
- **Lightweight case studies** (portfolio itself): 200–350 words body
- ~~workspace-audit~~ — writing topic, not a case study (see `plans/writing-topics/claude-workspace-audit.md`)
- Each section gets a target band — writer knows when they're over budget
- **Transcript embeds count as 50 words against the section budget regardless of actual turn length.** This prevents embeds from being used to pad word counts while still discouraging over-embedding — a section with 3 transcripts loses 150 words of its prose budget, which is usually the whole section.

### Step 4b.4 — Lock

**Output:** `plans/portfolio-case-study-template.md` — the locked content hierarchy. User approves before 4c starts.

**Acceptance:**
- Template covers every signal from the style guide
- Every section has a purpose and a word budget
- Image and diagram slots are specified (not "maybe a picture here")
- User reads it and thinks "yes, this is the shape I want"

**Commit:** `portfolio: case study content hierarchy locked`

---

## Chunk 4c — Page layout mockups (case study + supporting pages)

**Deliverable:** HTML design explorers for every remaining page type EXCEPT /about (which gets its own chunk 5.6). Built against the locked content hierarchy from 4b and the imagery standards from 4a.

Same approach as the homepage design explorer — self-contained HTML files in `plans/portfolio-assets/`, inlined CSS, fonts from Google Fonts CDN, zero build step. Saved to the permanent portfolio plans folder so they survive the session and can be linked from a case study later.

### Step 4c.0 — Component colour-role rationalisation (gate before 4c.1) ✅ COMPLETE (2026-04-17, commit `b19bc72`)

**Context.** The portfolio's palette has ~17 distinct colour tokens (royal-1..12 + violet-8..12), and components have been reaching into that raw scale ad hoc. The ChatTranscript v3 design alone introduced four different pill treatments before collapsing to two, and retroactively highlighted the same inconsistency elsewhere — KickerLabel uses `--royal-11`, tags use a different pairing, BuildLogTicker status dots pick yet another combination. With ~15 colours available and no per-component allowlists, each new component drifts further from the system. This gate fixes that before 4c.1 builds three more components (`<ChatTranscript>`, `<ProjectTimeline>`, `<VersionedEmbed>`) against the uncontrolled palette.

**Deliverable.** A role-based token layer on top of the raw scale + per-component variant allowlists + a migration pass of existing chunk-3 components. The raw `--royal-*` / `--violet-*` scale stays as the implementation substrate; components must reference role tokens, never raw scale directly.

#### Step 4c.0.1 — Audit existing colour usage

Grep every `.astro`, `.tsx`, and CSS file for `var(--royal-*)`, `var(--violet-*)`, raw hex values, and HSL triples. Produce an inventory in `plans/portfolio-colour-audit.md`:
- Each usage site (file:line)
- The role it's playing (border, bg, label, active-state, status, kicker, etc.)
- Whether the pairing is reused anywhere else or is a one-off

Acceptance: the audit identifies every raw-scale reference outside `globals.css` and `design.tokens.ts`. Any usage that can't be named a role is flagged as drift.

#### Step 4c.0.2 — Define per-component variant allowlists

For every component category, define the **allowlist of variants** — no more than 3-4 per category — and the exact token pairing each variant uses. A component asking for a variant outside its allowlist is a design decision, not a token pick, and goes back through the rationalisation gate.

Starter set (refine during the audit; this is the shape, not the final list):

**Tags / pills** (≤ 4 variants):
- `default` — muted bg pill for taxonomy labels (e.g. "case study", "writing post"). `--ink-dim` fg on `--royal-4` border, transparent bg.
- `active` — selected / current state. `--royal-11` fg on `--royal-8` border, `rgba(59, 91, 219, 0.08)` bg.
- `signal` — rare "note this" accent (reserved, used sparingly — e.g. "new" on a writing post). `--violet-11` fg on `--violet-8` border.
- `status` — reserved for the one status slot the portfolio needs (e.g. "shipped" / "draft" / "archived" on case studies). Single colour, muted register. Not a rainbow.

**Kickers** (≤ 2 variants):
- `default` — `--royal-11`, Geist Mono, uppercase, letter-spacing 0.12em. The one true kicker.
- `signal` — `--violet-11` equivalent, for writing / thinking-mode content only. Same typography.

**Status dots / indicators** (≤ 3 variants):
- `neutral` — `--ink-dim`
- `active` — `--royal-10`
- `attention` — `--violet-10` (reserved, used when the item is a pivot / decision moment — see BuildLogTicker.thinking)

**Borders & dividers** (≤ 3 roles):
- `hairline` — `--royal-3` (in-component separators, list rows)
- `border` — `--royal-7` (card edges, input outlines)
- `strong` — `--royal-8` (focused / active outlines)

**Expander pills** (inside `<ChatTranscript>`, ≤ 2 variants — already locked in 4c.1 spec):
- `high` — plan / skill / research / reply / cluster. `--royal-11` on `--royal-8` border.
- `bg` — tool calls. `--ink-dim` on `--royal-4` border.

#### Step 4c.0.3 — Add role tokens to `globals.css`

Introduce a new role-token block in `globals.css` **below** the raw scale and semantic aliases. Naming: `--tag-default-fg`, `--tag-active-fg`, `--kicker-fg`, `--dot-neutral`, `--border-hairline`, etc. Components reference these, never `--royal-*` directly.

Mirror the additions in `design.tokens.ts` under a new `roles` export so tooling / future component library work can introspect them without parsing CSS.

#### Step 4c.0.4 — Migrate existing components

Update every chunk-3 component (`CaseStudyCard`, `BuildLogTicker`, `KickerLabel`, tag rendering, anything else the audit surfaces) to reference role tokens only. A raw-scale reference outside `globals.css` and `design.tokens.ts` is now a build-time failure — add a lint rule if practical, else a grep-based check into `npm run check`.

Acceptance: `git grep 'var(--royal-' src/components` and `git grep 'var(--violet-' src/components` both return empty. Only `src/styles/globals.css` and `design.tokens.ts` touch the raw scale.

#### Step 4c.0.5 — Document the rules

New section in `plans/portfolio-design-tokens.md` titled **Component variant allowlists**. Structure:
- Table per component category (tags, kickers, dots, borders, expander pills)
- For each variant: role name, token pairing, usage examples, "do not use for" counter-examples
- A **hard rule**: introducing a new variant requires updating this doc first. No ad-hoc pairings in components.

Mirror a one-paragraph summary in `.claude/rules/design-system.md` (workspace rule file) so future sessions load it automatically.

#### Step 4c.0.6 — Gate check

Before chunk 4c.1 opens:
- Audit doc exists and is complete
- Role tokens are in `globals.css` and `design.tokens.ts`
- Existing components are migrated
- Allowlists are documented
- `npm run check` passes on main

`<ChatTranscript>` and `<VersionedEmbed>` (4c.1a, 4d) must both be built against the rationalised token layer — the v3 ChatTranscript design maps cleanly onto the proposed variant set, but the implementation step should pick up the role-token names, not the raw scale that v3.html currently uses. (`<ProjectTimeline>` deferred to chunk 7.5 — not required for v1 ship.)

**Commit:** `portfolio: rationalise colour tokens with per-component variant allowlists`

---

### Step 4c.0.5 — Component kit scaffold (`/design-system`)

**Context.** A standing reference page for the portfolio's tokens and components. Moved forward from chunk 7 so it doubles as the dev surface for every component built from 4c.1 onward — components land in the kit first, get visual review in situ, then get consumed by case studies. Aligns with the workspace "render before commit" and "extract shell first" rules.

**Gate.** 4c.0 must be complete. The kit is the first consumer of the role-token layer; raw-scale references inside it are a process failure.

**Scope at 4c.0.5:**
- `src/pages/design-system.astro` — unlisted route (no nav link yet; public URL, discoverable later via a footer link added in chunk 6).
- Sections, in order: **Colour** (raw Royal Tonal scale + violet additions + semantic aliases + role tokens from 4c.0, grouped), **Typography** (every `--text-*` slot rendered at size with slot name, family, weight, use context), **Spacing** (8-value visual strip with px labels), **Radius** (each token rendered as a sample), **Icon stroke** (the project's lucide stroke-width rendered on a sample icon set), **Components** (chunk-3 set migrated against role tokens — `CaseStudyCard`, `BuildLogTicker`, `KickerLabel`, tag variants).
- Each component section: live render imported from `src/components/`, not screenshots. One-line role description. For components with allowlisted variants, render every variant side by side (e.g. tag `default` / `active` / `signal` / `status`).

**Standing rule — "Update the kit":** every chunk that introduces a new component (4c.1a `<ChatTranscript>`; 4d `<VersionedEmbed>`; 7.5 `<ProjectTimeline>` post-launch) must add that component to `design-system.astro` as part of its acceptance. A component shipping to a case study before it ships to the kit is a process failure, not a sequencing nuance. Chunk 7 (post-launch polish) exists only to curate, not to build.

**Acceptance:**
- `/design-system` renders on the production URL with all six sections (colour, typography, spacing, radius, icon stroke, components) present.
- Every chunk-3 component renders live inside the kit — not screenshots, not snippets.
- `git grep 'var(--royal-' src/pages/design-system.astro` and the violet equivalent return empty (the kit obeys its own rules).
- `npm run check` passes.

**Commit:** `portfolio: /design-system kit scaffold (tokens, type, spacing, chunk-3 components)`

---

### Step 4c.1a — `<ChatTranscript>` component (locked port)

**Deliverable:** v3-spec `<ChatTranscript>` ported from `chat-transcript-explorer-v3.html` to `src/components/astro/ChatTranscript.astro`, migrated to role tokens, rendering the planner-stitch transcript at visual parity, with both modes (inline + breakout) landed in the `/design-system` kit. The layout explorers and page-level integration move to 4c.1b.

**Gate:** 4c.0 complete (role tokens exist). 4c.0.5 complete (kit exists as the dev surface). The current `ChatTranscript.astro` is a pre-v3 stub on the `check-raw-colours` allowlist — this chunk replaces it and removes the allowlist entry.

**`<ChatTranscript>` component — locked design, built here in 4c.1a:**

Design locked via `plans/portfolio-stitch-assets/chat-transcript-explorer-v3.html` (2026-04-14). Iteration trail lives at v1 → v2 → v3 in the same folder; v3 is the canonical spec. Selected variant: **royal-3 hairline + full-block accent + flat expander**.

*Frame:*
- Outer container: royal → violet gradient border (`--grad-rv`) on `--royal-1` inner, 12px radius, padding `24px 16px` desktop.
- Role swap from the original 4a.3 spec: **Dylan wears violet, Claude wears royal** (resolves the open Option A/B question below in favour of Option B). Rationale: Dylan is the thinker, Claude the tool — violet gives Dylan the signal-colour register; royal keeps Claude in the chrome palette.
- Full accent line on every block: 2px border-left in violet (Dylan) or royal (Claude), `--royal-10` / `--violet-10`.
- Hairlines between turns and between blocks: 1px in `--royal-3`.

*Grouping:*
- Consecutive same-role turns form a single **block**. One badge + role label at the top of each block, turns stacked under the continuity line. No repeated icon per turn.
- Claude badge: `--royal-4` bg, `--royal-10` icon, `--royal-7` border. Dylan badge: `violet-8` bg at 15% alpha, `--violet-10` icon, `--violet-8` border.
- Icons: lucide `user` (Dylan), lucide robot-glyph (Claude). Role text label mandatory alongside the icon (WCAG 1.4.1 — see `portfolio-design-tokens.md` §3).

*Expanders (progressive disclosure — uses native `<details>/<summary>`, no framework JS):*
- Four input shapes trigger an expander: `kind: 'plan' | 'skill' | 'research'`, a `summary` field, or any turn with `toolCalls` or `collapsedTools`.
- Default chrome is **flat** — no card background, 2px `--royal-4` left stripe, 12px padding-left. Card chrome is an option but not the default.
- Two pill colours only: `high` (`--royal-11` on `--royal-8` border) for plan/skill/research/reply/cluster; `bg` (`--ink-dim` on `--royal-4` border) for tool calls.
- Heading sourcing (in order): `summary` field → first H1–H3 in turn body → first prose line. Word-boundary trimmed at 120 chars, CSS `-webkit-line-clamp: 2` as safety.
- Default-open only for `kind: 'plan'` turns under 1200 chars. Everything else collapsed.
- Wrap-up directives at the end of a Claude turn ("reply with your answers", "ready for your review", etc.) are detected by a trailing-sentence regex and pulled out of the expander into an always-visible pill below it (`--royal-2` bg, `--royal-10` left stripe).

*Cluster expander (tool-call consolidation):*
- Runs of **3 or more** consecutive Claude turns that each have tool calls AND short prose (<600 chars) merge into a single cluster expander.
- Synthesized heading describes what was done (not how): "Claude used Google Stitch MCP and shell tools to generate all 40 renders across 10 design directions and download the comparison assets". The `clusterHeading` function pattern-matches tool names (stitch / shell) and run length to author a purposeful line; manual override via a `clusterTitle` field on the first turn if the heuristic is wrong.
- Cluster body renders each member turn separated by a hairline, with its own prose + tool call list. One click reveals everything in the run.

*Tool call rendering:*
- Each tool call: mono name in `--royal-11`, input preview truncated to 180 chars on `--royal-1` background.
- `full input` affordance styled as an underlined `--royal-11` link (violet-11 on hover / when open), NOT plain text.
- Expanded input uses `white-space: pre-wrap; word-break: break-word;` — no horizontal scrollbar, lines wrap inside the container.

*Content filters (applied by renderer, not by editing the source transcript):*
- Drop user turns that match the context-compaction pattern (`/^This session is being continued/`).
- Drop user turns that match slash-command invocations (`<command-name>/bookmark</command-name>` etc.).
- Filters keep the source JSON verbatim (non-destructive) while hiding the mechanical noise from the rendered artefact.

*Two display modes (mode prop):*
- `inline` — prose-column width, for routine decisions. ≤ 8 turns recommended.
- `breakout` — extends into the right margin on desktop for pivotal moments. Mobile collapses to inline width. ≤ 8 turns, one per case study max.

*File:* `src/components/ChatTranscript.astro`. Sibling to `Screenshot.astro`. Reads from the `transcripts` content collection built in 4a.6.

*Implementation checklist:*
1. Port the v3 renderer JS to an Astro component. The markdown pass (currently via CDN `marked`) moves to a build-time dependency — `npm install marked`, import it at the top of the `.astro` frontmatter.
2. Add violet tokens (done 2026-04-14): `--violet-8..12` and `--grad-rv` in `globals.css`; `violet` and `gradients.royalViolet` in `design.tokens.ts`.
3. Write the component in three layers: frame (gradient border + header), block renderer (grouping + badge + continuity line), turn renderer (plain | expander | cluster). Keep the cluster-heading synthesiser as a pure function so it can be unit-tested.
4. Extend the transcript Zod schema (`src/content.config.ts`) with the optional fields the renderer relies on: `kind?: 'plan' | 'skill' | 'research' | 'headline'`, `summary?: string`, `toolCalls?: ToolCall[]`, `collapsedTools?: string[]`, `clusterTitle?: string`.
5. Test with the `planner-stitch-batch-40-renders` transcript — it exercises every shape (kind variants, tool calls, cluster merging, filtered turns, wrap-up extraction). Visual parity with v3 is the acceptance bar.
6. Add `<ChatTranscript>` to the `/design-system` kit (scaffolded in 4c.0.5) — one inline mode + one breakout mode, using the same planner-stitch transcript. Part of this chunk's acceptance, not deferred.
7. Remove `src/components/astro/ChatTranscript.astro` from the `scripts/check-raw-colours.mjs` allowlist. `npm run check` must pass with the allowlist size reduced to zero.

*Acceptance:*
- Renders the planner-stitch transcript with visual parity to v3.html (winning variant: full-block accent, flat expander, royal-3 hairlines).
- Zero client-side JS emitted — everything is static HTML with `<details>` for progressive disclosure.
- Mobile (<640px) collapses to single column with icon + label on one row, accent line moves to block left edge at `--s2` padding.
- WCAG 1.4.1 compliant: role labels are never hidden, icon + label + colour work together (colour alone is never the differentiator).
- `check-raw-colours` allowlist is empty — no `--royal-*` / `--violet-*` references outside `globals.css` and `design.tokens.ts`.

**Sender colour emphasis — resolved 2026-04-14 (Option B).** Dylan wears violet, Claude wears royal. Rationale: the portfolio frames Dylan as the thinker and Claude as the tool; the signal colour (violet) belongs with the thinker, and royal is the chrome palette. Rejected Option A (Claude prominent) would have inverted the signal. Design trail: `chat-transcript-explorer-v1.html` (initial) → `v2.html` (multi-tier expanders, wrong role colours) → `v3.html` (locked spec, role swap, grouping, clustering).

**Commit:** `portfolio: ChatTranscript v3 port (role tokens, planner-stitch parity, kit entry)`

---

### Step 4c.1b — Case study page layout explorers

This is the most important layout in the portfolio. It needs to:
- Fit the content hierarchy from 4b exactly
- Handle both full (400–600w) and lightweight (200–350w) variants gracefully
- Integrate imagery slots per 4a.3 (hero image, inline screenshots, diagrams)
- Integrate **transcript slots** per 4a.3 ("Chat transcripts" section) — the `<ChatTranscript>` component (now built in 4c.1a) is a required layout element alongside `<Screenshot>`
- Work on mobile without degrading the reading experience
- End with a clear "next" artefact (related writing post or next case study)

**Gate:** 4c.1a complete. The component is now available to drop into the explorer HTMLs.

**Sample transcripts in the design explorers:** both `case-study-v1.html` and `case-study-v2.html` must render at least one `inline` transcript and one `breakout` transcript using placeholder turns (e.g. from an early portfolio session, bookmarked via 4a.6). This is how we pick the layout — on how the transcripts read in context, not in isolation.

Produce 2 layout options, pick one. Save both (`case-study-v1.html`, `case-study-v2.html`) — rejected options are part of the design trail.

**Note on `<ProjectTimeline>`:** originally bundled into 4c.1, now deferred to chunk 7.5 (post-launch). The case study layout explorers should leave a stub/placeholder slot where a timeline might land later, but do not attempt to design it here. Shipping the portfolio without a timeline is acceptable.

### Step 4c.2 — /projects index page layout

Grid of all case studies. Consistent with the landing page case study grid but standalone and richer (longer blurbs, tags prominent, maybe a filter bar).

### Step 4c.3 — /writing index + /writing/[slug] layouts

- **Index:** chronological list, post titles prominent, kicker labels for categories
- **Post:** reading-optimised, prose-first, image/diagram slots per imagery standards, auto-rendered `ProjectReferenceCard` if post references a project

### Step 4c.4 — /log page layout

Full build log, paginated if >20 entries. Denser than the landing-page ticker but same visual language.

### Step 4c.5 — /404 + /privacy layouts

Minimal. /404 on-brand with a link home. /privacy is a legal page but should still match the design language.

**Acceptance:**
- All 5 layouts saved as standalone HTML files in `portfolio/plans/portfolio-assets/`
- Listed in this plan under an "Artefacts" heading with path + one-line purpose
- User approves the case study layout (the critical one) before 4d starts
- Other layouts can be iterated on in their respective chunks but the structure is set

**Commit:** `portfolio: page layout mockups (case study, projects, writing, log, 404, privacy)`

---

## Chunk 4d — Case study workshop (the-weekly)

**Deliverable:** the-weekly case study fully written, the case study layout built in Astro, the-weekly shipping at `/projects/the-weekly`.

All the writing happens here, against the locked template (4b), layout (4c.1), and style guide (4a). The workshop is writing + iteration only — no design decisions.

### Step 4d.1 — First draft

Claude drafts the-weekly against the locked template and style guide. Apply Kao/Cutler structural moves. Use the imagery slots specified in 4b — source real screenshots per 4a.3.

### Step 4d.2 — User rewrite pass

User rewrites in their voice after reviewing the draft against `writing-style.md`. This is the critical stress test — both of the template and of the style guide.

### Step 4d.3 — Iterate

Second draft. Iterate until both template and case study feel right. **Hard stop:** template locks after 2 full iterations of the-weekly, even if it's 80% right. Perfect is the enemy of shipped.

### Step 4d.4 — Build

- `content/projects/the-weekly.mdx` ships with real body content
- `src/layouts/CaseStudyLayout.astro` built against the locked 4c.1 layout
- `src/pages/projects/[slug].astro` dynamic route
- Imagery sourced and optimised per 4a.3 standards
- **Evolution showcase** — `<VersionedEmbed>` component + three Cloudflare Workers deploys (Stages 1/2/3 of the-weekly). Full plan in `plans/the-weekly-evolution-showcase.md`. Renders under Lesson 2 as decision-led visible evidence.
- Add `<VersionedEmbed>` to the `/design-system` kit (4c.0.5) with a sample embed. Part of this chunk's acceptance.

**Acceptance:**
- the-weekly case study renders on `/projects/the-weekly` and visually matches the 4c.1 mockup
- User reads it and thinks "yes, I'd show this to a hiring manager"
- Template is locked — no more structural changes before chunk 5

**Commit:** `portfolio: the-weekly case study shipped (workshop complete, template locked)`

---

## Chunk 5 — Remaining case studies applied to template

**Deliverable:** planner-app (full), portfolio itself (lightweight) — all using the locked template and layout.

- Write `content/projects/planner-app.mdx` — full case study, 400–600 words
- Write `content/projects/portfolio.mdx` — lightweight, meta, "this site is also a case study"
- ~~workspace-audit~~ — converted to a writing topic, not a case study; see `plans/writing-topics/claude-workspace-audit.md`
- Source imagery for each per 4a.3 standards
- `/projects` index page built from the 4c.2 mockup
- Bidirectional cross-links: case studies link to related writing posts; writing posts auto-render ProjectReferenceCard

**Acceptance:** All 4 case studies live at their routes. `/projects` index shows all 4 cards per the 4c.2 mockup. Cross-links work both directions.

**Commit:** `portfolio: remaining case studies and /projects index`

---

## Chunk 5.5 — Writing posts brainstorm + first batch

**Deliverable:** 2–3 writing posts, fully drafted, locked, ready to ship (the /writing routes themselves are built in chunk 6).

### Step 5.5.1 — Review captured topics + brainstorm

Start from existing writing topics in `plans/writing-topics/` (migrated from the old `portfolio-writing-brainstorm.md` in chunk 4a.7). Review each topic's thesis and status, then brainstorm additional candidates drawing from:
- Decisions made across workspace projects that have broader lessons
- Patterns noticed across the diary audit
- Commentary on things in the user's field (product thinking, engineering management, AI-assisted building)
- Posts that complement the case studies (not duplicate them — case studies are "what I built", writing is "what I think")

New topics captured via the `/writing-topic` skill between now and chunk 5.5 will also be in `plans/writing-topics/`.

### Step 5.5.2 — Pick 3

User picks 3 to take forward. Rationale per pick (why this one, who's it for, what signal does it send).

### Step 5.5.3 — Draft

Claude drafts each post against `writing-style.md`. Per the style guide: Kao/Cutler structural moves, imagery standards applied to any diagrams/illustrations.

### Step 5.5.4 — User rewrite + iterate

User rewrites each in their voice. Iterate until each one feels right. Same 2-iteration hard stop as the case study workshop.

### Step 5.5.5 — Lock as MDX

- `content/writing/<slug-1>.mdx`, `<slug-2>.mdx`, `<slug-3>.mdx`
- Frontmatter complete (title, date, kicker, project references if any)
- Imagery sourced and optimised
- `astro check` passes

**Acceptance:**
- 3 writing posts locked as MDX files
- Each has real body content (not placeholders)
- User approves each one before locking
- Ready to ship the moment chunk 6 builds the /writing routes

**Commit:** `portfolio: first writing posts (3 drafted and locked)`

---

## Chunk 5.6 — /about page (one-off writing optimisation)

**Deliverable:** /about page fully written, designed, and shipped. Not templateable — this is a focused, one-off optimisation exercise.

The /about page carries the bio and needs to tell the right story. It gets its own chunk because it doesn't benefit from being templated and does benefit from dedicated attention.

### Step 5.6.1 — Goals analysis

Before writing anything, clarify:
- Who is this page for? (Hiring managers and executives in the user's field — same audience as the case studies)
- What do they need to believe by the time they finish reading?
- What signals must the page send? (Product thinking, technical judgement, honest self-assessment)
- What's the call to action? (LinkedIn? Email? Case studies?)

### Step 5.6.2 — Background research

Interview-style conversation. Claude asks, user answers. Topics:
- Career arc and the decisions that shaped it
- What the user actually does day-to-day vs. what titles suggest
- Values and working style
- Things the user is proud of that don't fit into case studies
- Things the user refuses to do / principled positions

**Output:** internal notes (not shipped) — raw material for the content scaffold.

### Step 5.6.3 — Content scaffold

Define the narrative arc — sections, beats, what each beat does. Apply `writing-style.md` structural moves. Word count target.

**Output:** `plans/portfolio-about-scaffold.md` — the locked content shape for /about.

### Step 5.6.4 — HTML mockup

Design explorer for /about — same self-contained HTML approach as 4c. Focus on typographic hero, bio structure, values section, LinkedIn CTA. Saved to `portfolio/plans/portfolio-assets/about.html`.

### Step 5.6.5 — Draft

Claude drafts against the scaffold, style guide, and mockup.

### Step 5.6.6 — User rewrite + iterate

User rewrites in voice. Iterate. Same 2-iteration hard stop.

### Step 5.6.7 — Ship

- `src/pages/about.astro` built from the mockup
- Content rendered from the locked draft
- Imagery sourced per 4a.3 (headshot treatment, if any)

**Acceptance:**
- `plans/portfolio-about-scaffold.md` exists and user approves
- `portfolio/plans/portfolio-assets/about.html` exists as design reference
- /about page ships at `/about`
- User reads it and thinks "yes, this represents me honestly and well"

**Commit:** `portfolio: /about page shipped`

---

## Chunk 6 — Secondary pages + deploy polish

**Deliverable:** /writing, /log, /privacy, /404 pages — and production-ready deploy. (/about shipped in 5.6.)

- `src/pages/writing/index.astro` — built from 4c.3 mockup, chronological list
- `src/pages/writing/[slug].astro` — built from 4c.3 post mockup, `ProjectReferenceCard` auto-rendered, 3 posts from 5.5 live
- `src/pages/log.astro` — built from 4c.4 mockup, full build log, paginated if >20 entries
- `src/pages/privacy.astro` — APP-compliant (PostHog disclosure, Cloudflare Pages disclosure, contact via LinkedIn)
- `src/pages/404.astro` — built from 4c.5 mockup
- PostHog integration wired in `BaseLayout.astro`, funnel events instrumented
- Environment variables set in Cloudflare Pages dashboard
- Production deploy from `main`
- Test on real device (phone) + hiring-manager-style happy path walkthrough

**Acceptance:**
- All route groups live (including /about from 5.6)
- PostHog dashboard shows events on real traffic
- Happy path funnel captured: landing → projects → case study → LinkedIn click
- Lighthouse ≥95 across performance/accessibility/SEO on all pages
- Production URL ready to add to LinkedIn + CV

**Commit:** `portfolio: secondary pages, analytics, production deploy`

---

## Chunk 7 — Design system showcase polish (post-launch)

**Context.** The `/design-system` page was scaffolded in 4c.0.5 and grew incrementally — every component chunk (4c.1a, 4d) added its component to the kit as part of its acceptance. By the time chunk 6 ships, the kit is already complete and on production. (`<ProjectTimeline>` lands in 7.5 post-launch.)

This chunk is a post-launch curation pass, not a build. Skip entirely if the kit already reads as portfolio-grade.

**Optional deliverables:**
- Short narrative intro at the top of `/design-system` framing it as "built with Claude Code" — one paragraph, honest about the human / AI split.
- Per-component captions noting what was handwritten vs. generated vs. adapted from shadcn.
- Link to the portfolio repo for component source.
- Final audit: every `--text-*` slot, every token in `globals.css`, every component in `src/components/` has a matching kit entry. Fix any gaps from incremental drift.
- Lighthouse pass specific to `/design-system` (it's heavier than other pages).

**Gate:** Chunk 6 shipped. Kit is already live; this is paint, not build.

**Commit (if run):** `portfolio: design system showcase polish`

---

## Chunk 7.5 — `<ProjectTimeline>` component (deferred from 4c.1)

**Deliverable:** horizontal (desktop) / vertical (mobile) timeline component rendering milestones and pivot nodes from project frontmatter, plus a kit entry and retro-application to shipped case studies.

**Gate:** Chunk 6 shipped (portfolio live). This was originally scoped into 4c.1 but deferred in 2026-04-17 planning — a timeline is a case-study enhancement, not a shipping prerequisite. Retrofitting post-launch means the v1 ship is not blocked by a component design pass.

**Spec (carried from 4c.1):**
- A linear horizontal (desktop) / vertical (mobile) timeline showing key milestones and pivot points for a project.
- Each node is a highlighted point: label + short descriptor. Nodes can be marked as milestone (standard) or pivot (visually distinct — e.g. filled vs outlined, or accent colour).
- Reads data from frontmatter (`timeline` array field in the projects schema — `date`, `label`, `type: 'milestone' | 'pivot'`). Static render, no JS.
- Keep it simple. No fancy animation, no branches. The interest is in the data, not the chrome.
- Lives at `src/components/astro/ProjectTimeline.astro`. Add `timeline` as an optional array field to the `projects` Zod schema.
- Add `<ProjectTimeline>` to the `/design-system` kit — one milestone-only variant + one with a pivot node. Part of this chunk's acceptance.

**Integration:** once shipped, retro-apply to each case study (the-weekly, planner-app, portfolio) that has enough timeline data to be worth showing. Not every case study needs one.

**Commit:** `portfolio: ProjectTimeline component (retrofit post-launch)`

---

## Chunk 8 — Design system retrofit (post-launch, optional)

**Deliverable:** Portfolio's Royal Tonal tokens extracted into a `design.tokens.ts` that conforms to the workspace-wide schema. Zero visual change.

**Gate:** Chunk 6 must be shipped to production first. Do NOT attempt this during v1 build. (Chunk 7, the showcase page, can run in parallel — no dependency between them.)

**Prerequisites:**
- Workspace-root `design-system/` scaffold exists (see `plans/design-system-implementation.md` chunk 1).
- `design-system/types.ts` has been stress-tested against portfolio's richer-than-default system. Any missing token categories are added as optional fields there before this chunk begins.

**Steps:**

1. Create `portfolio/design.tokens.ts` at the portfolio project root. Import `defaultTokens` from `../design-system/defaults` and override:
   - `colors` — full Royal Tonal scale (royal-0 through royal-10 → shadcn-ish HSL triplets). Portfolio uses more colour roles than the default shadcn set, so this override is extensive.
   - `typography.fontFamily.display` = Fraunces
   - `typography.fontFamily.sans` = Geist
   - `typography.fontFamily.mono` = Geist Mono
   - `radius`, `shadows` — match current values
   - `icons.strokeWidth` — match current Lucide prop
2. Write a small `portfolio/scripts/emit-tokens.mjs` that reads `design.tokens.ts` and outputs the `@theme` CSS block for `src/styles/globals.css`. Run manually.
3. Run the emitter. Diff the generated `globals.css` against the committed version — any diff is a schema gap. Fix `types.ts`/`defaults.ts`/`emit.ts` upstream, not portfolio.
4. `npm run check` + `npm run build` must pass. Compare a production build against the pre-retrofit one — visual parity is non-negotiable.
5. Update `portfolio/CLAUDE.md` with a `## Design System` section pointing at `../design-system/design.md` and `./design.tokens.ts`.
6. Deploy to Cloudflare Pages. Compare live site against pre-retrofit screenshots on 1440 and 390.

**Why separated from the workspace design-system plan:** Portfolio is the reference implementation that validates the schema. Pulling it forward risks destabilising an actively-shipping project and polluting the shared layer with portfolio-specific escape hatches. Retrofitting *after* the-weekly and planner have wired up means the schema is already proven on simpler palettes first.

**Commit:** `portfolio: design-system retrofit (Royal Tonal via workspace tokens)`

---

## Timeline estimate (revised 2026-04-11)

- Chunks 1–3: complete (2–3 sessions, ~3–5 days wall-clock)
- **Chunk 4a** — foundation: 1–2 sessions (research + audit + imagery standards + synthesis is a lot of thinking)
- **Chunk 4b** — content template: 0.5–1 session (scaffold + validate against style guide + lock)
- **Chunk 4c** — layout mockups: 1–2 sessions (5 page types, case study gets 2 options)
- **Chunk 4d** — case study workshop: 1–2 sessions (writing-heavy, 2-iteration hard stop)
- **Chunk 5** — remaining case studies: 1 session (mostly mechanical once template and layout are locked)
- **Chunk 5.5** — writing posts: 1–2 sessions (brainstorm + 3 drafts + iterate)
- **Chunk 5.6** — /about: 1 session (focused one-off, research + scaffold + mockup + draft + iterate)
- **Chunk 6** — secondary pages + deploy: 1 session (mostly plumbing now that content exists)
- **Chunk 7** — design system showcase: 0.5–1 session (inventory + explorer + Astro page)
- **Chunk 8** — design-system retrofit: 0.5 session, opportunistic

**Total: ~3–4 weeks of sessions** for v1 (chunks 4a–6). Longer than the original 1–2 week estimate — the content-first restructure and the additions (imagery standards, diary audit, writing posts, /about as its own chunk) materially expand scope but also materially raise the quality ceiling.

---

## Risks / gotchas

1. **Shadcn-on-Astro edge cases** — shadcn assumes Next.js/Vite React. Astro + React island wrapping usually works but `Badge` or `Button` may need small tweaks. Budget a few hours for first-integration friction.
2. **Tailwind v4 is new** — if `@theme` directive doesn't play nicely with `@astrojs/tailwind`, fallback is Tailwind v3.4 which is stable but less clean.
3. **Case Study Workshop scope creep** — hard stop: template locks after 2 full iterations of the-weekly, even if it's 80% right. Same rule applies to /about (5.6) and each writing post (5.5).
4. **Cloudflare Pages monorepo build** — Git integration with a subdirectory build can have first-time config friction. Handled in chunk 3 (first deploy).
5. **WebFetch rate limits on Substack** — analysing 16–24 posts for the voice reference may trip rate limits. If it does, batch across a 5–10 minute window or reduce target to 6–8 posts per author.
6. **Style guide scope drift** — the style guide governs ALL Claude-produced writing workspace-wide, so every session going forward reads it. Keep it tight and actionable, not a sprawling essay. If it grows past ~400 lines, split by concern (voice / imagery / diary format).
7. **Diary audit can rabbit-hole** — it's a *quick pass*. 2–3 hours max. The goal is pattern-spotting, not a full inventory. If it's taking longer, narrow the scope.
8. **Content hierarchy before layout is a discipline** — it's tempting to jump ahead and sketch layouts while defining content. Resist. The whole point of 4b-before-4c is that content structure constrains layout, not the reverse.

---

## Links to upstream phase outputs

- Phase 1 (Interview) → this conversation, summarised in memory
- Phase 2 (Spec) → captured inline in phases below
- Phase 4 (UX Flows) → `plans/portfolio-ux-flows.md`
- Phase 5 (Visual Direction) → `plans/portfolio-visual-direction.md` + `plans/portfolio-stitch-assets/12-13*.png`
- Phase 3 (Design Tokens) → `plans/portfolio-design-tokens.md` + `plans/portfolio-stitch-assets/design-explorer.html`
- Phase 6 (Architecture) → `plans/portfolio-architecture.md`
- Phase 7 (this plan) → `plans/portfolio-implementation.md`
