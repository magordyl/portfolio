# Portfolio plan improvements — transcript visual identity, collapse, preview review, writing topics

## Context

Four amendments to the in-progress portfolio plan, agreed during planning on 2026-04-12. **Chunk 4a.6 is already shipped** (commit `f61060f` — scripts, schema, skill, `/session-end` integration), so these are amendments to shipped code and planned-but-unbuilt chunks, not greenfield work.

**What's shipped (4a.6):**
- `portfolio/scripts/bookmark-transcript.mjs` — captures last N turns from active session JSONL, redacts, writes drafts
- `portfolio/scripts/promote-transcript.mjs` — validates, re-redacts, promotes drafts
- `portfolio/.claude/skills/bookmark/SKILL.md` — `/bookmark` skill (portfolio-local)
- `portfolio/src/content.config.ts` — `transcripts` Zod collection, turn shape is `{role, text, collapsedTools?}`
- `portfolio/src/content/transcripts/` and `transcripts/drafts/` folders (both empty; first-use gate 4a.6.6 still open)
- Workspace `/session-end` Step 0.5 — pending draft review

**What's not yet built:**
- `<ChatTranscript>` component — deferred to 4c.1
- Case study layout explorer with embedded sample transcripts — deferred to 4c.1
- Writing topics workflow — not in any existing chunk

**The four amendments:**

1. **Transcript sender identity** — `<ChatTranscript>` should show lucide icons for Dylan + Claude alongside the text labels. Design explorer builds both icon pairs and both header layouts (horizontal compact vs vertical stacked), picks one in 4c.1.
2. **Collapsible sections** — long Claude turns (plans, skill output, research findings) collapse by default. Pure native `<details>/<summary>`, zero JS. Dylan's turns never collapse. Driven by a new optional `kind` field on each turn.
3. **Review step renders in the UI component** — replace the current text-based promote review with a browser preview rendered through the same logic the `<ChatTranscript>` component will use. Reusable `scripts/preview-transcript.mjs` generates a self-contained HTML preview from any draft. The render logic is shared between the preview script and the Astro component.
4. **Writing topic capture workflow** — new `/writing-topic` skill at workspace level, takes freeform text, auto-captures session + project context, writes a per-topic markdown file under `portfolio/plans/writing-topics/`. `/bookmark` relocates to workspace level alongside it.

---

## Amendment 1 — `<ChatTranscript>` sender identity (updates 4a.3 spec + 4c.1 build)

**File to edit:** `portfolio/plans/portfolio-imagery-standards.md`, "Chat transcripts" frame-spec section.

Add a sender-icon row to the frame-spec table and a new sub-section "Header layout decision (4c.1)".

**Exact glyph pair — deferred to 4c.1 design explorer.** Build two candidate pairs:
- **Pair A:** `User` (Dylan) + `Sparkles` (Claude)
- **Pair B:** `User` (Dylan) + `Bot` (Claude)

Icons render as inline SVG (copy lucide source path data at build), no React, no runtime.

**Header layout — also deferred to 4c.1, build both:**
- **H1 horizontal compact:** `[icon] Dylan` on one row (24px icon badge + label), turn text below. Uses more vertical space per turn; easier alignment in `inline` mode.
- **H2 vertical stacked:** icon and label stacked in a narrow left gutter (~40px), turn text fills the remaining prose width. More compact per turn, clearer speaker separation, matches chat-log conventions.

The 4c.1 case study explorers (`case-study-v1.html` and `case-study-v2.html`) must render at least one full sample transcript in each of (Pair A × H1), (Pair A × H2), (Pair B × H1), (Pair B × H2) so the final pick is informed by real context. The `scripts/preview-transcript.mjs` harness (amendment 3 below) accepts a `--variant` flag to switch between these combinations so the variants are cheap to regenerate.

**New frame-spec rows to add:**

| Property | Value |
|---|---|
| Sender icon (Dylan) | lucide `User`, Royal Tonal 300, 20px in 24px Royal Tonal 900 circle |
| Sender icon (Claude) | lucide `Sparkles` or `Bot` (decided in 4c.1), Royal Tonal 500, 20px in 24px Royal Tonal 900 circle |
| Header layout | H1 horizontal or H2 vertical (decided in 4c.1) |

---

## Amendment 2 — Collapsible sections (amend 4a.3 spec + shipped scripts + 4c.1 component)

### 2a. Amend 4a.3 "no interactivity" rule

**File:** `portfolio/plans/portfolio-imagery-standards.md`, Chat transcripts section.

**Replace** *"Zero client-side JS — static render, no interactivity. No expand/collapse on tool calls."* **with:**

> *"Zero client-side JS. Progressive disclosure uses native HTML `<details>/<summary>` only — no React, no framework, no hydration. Tool calls remain always-collapsed. Long Claude turns of kind `plan`, `skill`, or `research` collapse by default; turns of kind `headline` show markdown headings uncollapsed with bodies folded section-by-section; Dylan's turns never collapse. Collapse state is configured per turn at capture time and reviewed in the browser preview before promotion."*

Add a short rationale paragraph: long assistant replies (pages of planning output, skill invocation logs, file-by-file research dumps) turn a transcript embed into a wall of text. Collapsing them keeps signal visible while preserving full detail for readers who want to dig in.

### 2b. Extend the shipped schema

**File to edit:** `portfolio/src/content.config.ts` (already ships with `transcripts` collection — schema extension is additive, existing valid drafts stay valid).

**Add two optional fields to the turn shape:**

```ts
turns: z.array(
  z.object({
    role: z.enum(['user', 'assistant']),
    text: z.string(),
    kind: z.enum(['verbatim', 'headline', 'plan', 'skill', 'research']).optional(),
    summary: z.string().optional(),
    collapsedTools: z.array(z.string()).optional(),
  })
).min(2).max(8),
```

`kind` drives render behaviour:
- **`verbatim`** (default for user turns and short assistant turns) — render full text, no `<details>`
- **`headline`** — assistant turn with markdown headings visible; body text between headings wrapped in per-section `<details>` with "Show detail ↓" affordance
- **`plan`** — entire turn collapsed behind summary `"Plan ({N} steps) ↓"` or author-supplied text
- **`skill`** — entire turn collapsed behind summary `"Skill: {name} — {outcome} ↓"`
- **`research`** — entire turn collapsed behind summary `"Research findings ({N} items) ↓"`

`summary` is the collapsed-state label. When unset, the render layer computes a sensible default from `kind` + content.

Run `npm run check` after the schema edit; empty drafts folder means no migration needed.

### 2c. Amend the shipped `bookmark-transcript.mjs`

**File to edit:** `portfolio/scripts/bookmark-transcript.mjs` (already ships).

**Add a classifier pass** after redaction, before writing the draft. For each turn:

1. User turn → `kind: 'verbatim'`
2. Assistant turn < 400 chars → `kind: 'verbatim'`
3. Assistant turn whose source event contained a `Skill` tool_use block → `kind: 'skill'`, `summary = "Skill: {name} — {first sentence}"`
4. Assistant turn whose source events contained ≥3 `Grep`/`Glob`/`Read`/`WebFetch` tool_use blocks → `kind: 'research'`, `summary = "Research findings ({N} items)"`
5. Assistant turn matching plan heuristics (contains `## Plan`, numbered implementation steps, or `"here's the plan"` / `"implementation plan"`) → `kind: 'plan'`, `summary` = first heading or first sentence
6. Assistant turn over 800 chars with markdown headings (`##`, `###`) → `kind: 'headline'` (render layer extracts headings automatically)
7. Assistant turn over 800 chars without headings → `kind: 'headline'`, `summary` = first sentence

Classification is best-effort; the preview-based review (amendment 3) is the safety net. Heuristics should be factored into a small `classifyTurn(turn, sourceEvents)` helper near the top of the script so promote-time re-classification can reuse it.

### 2d. `<ChatTranscript>` component render logic (built in 4c.1)

**File to create in 4c.1:** `portfolio/src/components/ChatTranscript.astro`.

The component reads a transcript from the collection and delegates rendering to the shared helper `scripts/render-transcript.mjs` (see amendment 3b below) — same function used by the preview harness. This is the mechanism that guarantees preview and production render identical markup.

**Render rules per turn:**
- `verbatim` → `<div class="turn">{header}{text}</div>`
- `plan` / `skill` / `research` → `<details class="turn turn--{kind}"><summary>{header}{summary}</summary>{text}</details>`
- `headline` → parse `text` for `##`/`###`; for each section, render heading visible + body wrapped in `<details><summary>Show detail</summary>{body}</details>`. Minimal markdown parser — only `##`/`###` headings, paragraphs, code blocks, inline code, lists. No link/image support.

Chevron (`ChevronDown`/`ChevronRight` from lucide) rotates via CSS `[open]` selector. Summary styling: italic Geist, caption size, Royal Tonal 400 (matches existing "Annotation margin note" row).

---

## Amendment 3 — Review renders in the UI component (new shared render helper + preview harness)

**The key change:** the current promote-step review (`promote-transcript.mjs` prints the full draft to stdout as JSON/text) is replaced with a browser preview rendered using the exact same logic that `<ChatTranscript>` will use in production. The review must show the actual collapse states, icons, headers, and section folding — not a text summary.

### 3a. Extract the shared render helper

**File to create:** `portfolio/scripts/render-transcript.mjs`

Pure ESM module, no dependencies, exports one function:

```js
export function renderTranscript(transcript, options = {}) {
  // options: { variant: 'a-h1' | 'a-h2' | 'b-h1' | 'b-h2' } (icon pair × header layout)
  // returns { html: string, css: string }
}
```

`renderTranscript` walks `transcript.turns`, applies the render rules from amendment 2d, and produces an HTML string + the component's CSS (inlined from a co-located `render-transcript.css` source of truth). No Astro-specific code — runs in any Node context.

**Why this shape:** the Astro component (built in 4c.1) imports `renderTranscript` directly, wraps the returned HTML in an `<article>` shell, and inlines the returned CSS. The preview harness (3b) wraps the same output in a standalone HTML document. Deterministic equivalence is guaranteed because both paths use the same function.

**CSS co-location:** keep the token values inline in a `SHARED_CSS` constant at the top of `render-transcript.mjs` (or a sibling `.css` file read at import time). The tokens mirror the real CSS variables from `src/styles/globals.css` — Royal Tonal shades, Geist/Fraunces font stacks, radius, spacing. This is a deliberate duplication gated by a test (see verification).

### 3b. Build the preview harness

**File to create:** `portfolio/scripts/preview-transcript.mjs`

CLI:

```
node scripts/preview-transcript.mjs --slug <draft-slug> [--variant a-h1|a-h2|b-h1|b-h2] [--open] [--batch]
```

**Behaviour:**
1. Load the draft at `src/content/transcripts/drafts/<slug>.json` (or `--batch` → all drafts).
2. Call `renderTranscript(draft, {variant})` from the shared helper.
3. Wrap the output in a standalone HTML document: `<!DOCTYPE html>` + Google Fonts `<link>` for Geist/Geist Mono/Fraunces + returned CSS + returned HTML + minimal page shell (dark Royal Tonal 950 background, centred max-width 720px column matching `inline` prose width, plus a switcher for `breakout` mode preview).
4. Write to a stable temp path: `portfolio/plans/portfolio-stitch-assets/transcripts/preview-<slug>.html`.
5. If `--open`, launch the default browser via `start` (Windows) / `open` (macOS) / `xdg-open` (Linux).
6. Print the absolute file path so the user can open manually if auto-open fails.
7. `--variant` flag builds the HTML with one of the four icon/layout combinations. Default is `a-h1`.
8. `--batch` renders all drafts in one page with hairline dividers between them — useful for bulk review at session-end.

The preview page must include a small "variant switcher" bar at the top (pure HTML anchors that regenerate the page with a different `--variant` next time — not a live switcher, to keep zero-JS). This makes it cheap to cycle through the four combinations when picking the winning icon/layout pair in 4c.1.

**Why the stable path in `portfolio-stitch-assets/transcripts/`:** previews are design artefacts. Keeping them committable means the iteration trail survives the session (matching the workspace rule on design artefacts). The path is `.gitignore`-eligible if we decide not to commit every preview, but the default should be "committable".

### 3c. Amend the shipped `promote-transcript.mjs`

**File to edit:** `portfolio/scripts/promote-transcript.mjs` (already ships).

**Replace** the current text-listing review step with a preview-then-confirm flow:

1. Re-run redaction regex (defence in depth — unchanged).
2. Structural validation (2–8 turns, non-empty text — unchanged).
3. Zod validate against extended schema (unchanged, but now sees `kind`/`summary`).
4. **NEW:** call `preview-transcript.mjs --slug <slug> --open` as a subprocess to render the draft in the browser. Fall back gracefully if `--open` fails — print the file path.
5. **NEW:** prompt `"Review the preview in your browser. Options: [p]romote, [e]dit (opens draft JSON in $EDITOR), [r]e-render, [c]ancel"`.
   - `p` → continue to move step
   - `e` → open `$EDITOR` on the draft; after save, re-run validation + re-render preview
   - `r` → re-run the preview (useful after manual draft edits outside $EDITOR)
   - `c` → abort, leave draft in place
6. Move the file to `src/content/transcripts/<slug>.json` (unchanged).
7. Print promote confirmation.

**Session-end integration:** extend workspace `/session-end` Step 0.5 so pending drafts are listed AND `preview-transcript.mjs --batch` runs (opens one browser tab containing all drafts in a single scannable page).

---

## Amendment 4 — Writing topic capture workflow (new chunk 4a.7)

Add a new sub-chunk **4a.7 — Writing topic capture workflow** to `portfolio/plans/portfolio-implementation.md`, placed after the completed 4a.6.

### 4a.7.1 — Migrate `portfolio-writing-brainstorm.md` to per-topic files

**Create:** `portfolio/plans/writing-topics/`
**Migrate:** existing "Code-first artefacts" entry → `portfolio/plans/writing-topics/code-first-artefacts.md`

Frontmatter shape:

```yaml
---
slug: code-first-artefacts
title: "Build the tool, not the tooling"
status: seed
captured: 2026-04-11
transcripts: []
source_project: planner-app
context: ""
---
```

Body = existing prose from the brainstorm doc.

**Create index:** `portfolio/plans/writing-topics/INDEX.md` — one line per topic:

```
- [code-first-artefacts](code-first-artefacts.md) — [seed] Build the tool, not the tooling — planner-app, 2026-04-11
```

**Delete** `portfolio/plans/portfolio-writing-brainstorm.md` after the migration is verified. Update any references in `portfolio-implementation.md` (chunks 5.5).

### 4a.7.2 — Build `scripts/writing-topic.mjs`

**File to create:** `portfolio/scripts/writing-topic.mjs`

**Primary invocation is freeform text:**

```
node scripts/writing-topic.mjs "optimising the portfolio curation workflow by creating the writing topic skill"
```

**Behaviour (freeform mode):**

1. Treat positional arg as `thesis`/title seed.
2. **Derive slug** — slugify → kebab-case → truncate to 6 words → dedupe against existing `writing-topics/*.md` (append `-2`, `-3` on collision).
3. **Derive title** — first ~60 chars of the thesis, sentence case.
4. **Auto-capture session context** — reuse the session JSONL discovery logic from `bookmark-transcript.mjs` (extract to a shared `scripts/session-utils.mjs` helper). Pull the last 3–5 user messages + their first sentences to form a `context` block. Apply the same redaction pass.
5. **Auto-detect `source_project`** from `process.cwd()` — match against workspace folder names (`planner-app`, `portfolio`, `the-weekly-app`, etc.). Fall back to basename.
6. **Auto-link transcripts** — scan `portfolio/src/content/transcripts/drafts/*.json` for files with `mtime` within the last 10 minutes. Exactly one match → auto-populate `transcripts: [<slug>]`. Multiple → list candidates in stdout and leave empty.
7. **Write the file** to `portfolio/plans/writing-topics/<slug>.md` with populated frontmatter + body (freeform text as thesis, context block below).
8. **Append to `INDEX.md`** — insert a new line in alphabetical order.
9. **Print** the absolute path so the user can edit fields immediately if needed.

**Structured flags (override any auto-derived field):**

```
--slug <kebab> --title "..." --thesis "..." --transcript <slug> --context "..."
```

### 4a.7.3 — Wire up `/writing-topic` skill at workspace level

**File to create:** `<workspace>/.claude/skills/writing-topic/SKILL.md`

**Not** the portfolio repo — the skill must work from any project CWD. Skill wraps the script at absolute path: `node "C:\Users\User\Documents\Claude code\portfolio\scripts\writing-topic.mjs" "$@"`.

Skill description must surface the in-flow use case so Claude suggests it when the user says things like "that's a good post idea", "I should write about this", or "remember this for the portfolio".

### 4a.7.4 — Relocate `/bookmark` skill to workspace level

**Supersedes the shipped 4a.6.4 placement.** The `/bookmark` skill currently lives at `portfolio/.claude/skills/bookmark/SKILL.md`, meaning it only fires when CWD is portfolio. Relocate to `<workspace>/.claude/skills/bookmark/SKILL.md`, pointing at the same `portfolio/scripts/bookmark-transcript.mjs` by absolute path.

Steps: copy the SKILL.md file to the workspace skill folder, update the `node` call to use the portfolio absolute path, delete the portfolio-local copy, verify `/bookmark` still works from a non-portfolio CWD.

### 4a.7.5 — Wire into `/session-end`

**File to edit:** workspace `/session-end` skill (already has Step 0.5 for transcript drafts).

Extend so Step 0.5 lists BOTH pending transcript drafts AND new `writing-topics/*.md` files created this session (detected via git status — any untracked file in `portfolio/plans/writing-topics/`). Apply the same "promote / edit / delete / keep" prompt to each group.

For transcript drafts, also invoke `preview-transcript.mjs --batch` to render all pending drafts in one browser page (amendment 3c).

### 4a.7.6 — First-use validation gate

Before 4b starts:
- Capture one real writing topic via `/writing-topic "<freeform text>"` — the test case can be this skill itself (meta-loop).
- Verify slug generation, source project detection, session context auto-capture, and transcript auto-linking (if one was bookmarked in the same session).
- Fix any friction before 4b begins.

### Acceptance (4a.7)

- `portfolio/plans/writing-topics/` exists with migrated `code-first-artefacts.md` + `INDEX.md`
- `portfolio-writing-brainstorm.md` deleted; references in chunks 5.5 updated
- `portfolio/scripts/writing-topic.mjs` works in both freeform and structured mode
- `<workspace>/.claude/skills/writing-topic/SKILL.md` invokable from any CWD
- `<workspace>/.claude/skills/bookmark/SKILL.md` relocated; portfolio-local copy deleted
- `/session-end` lists writing topic drafts alongside transcript drafts
- At least one writing topic captured in-flow and reviewed

**Commit:** `portfolio: writing topic capture workflow + relocate /bookmark to workspace`

---

## Files to create / modify (summary)

**Portfolio repo:**
- `plans/portfolio-imagery-standards.md` — amend Chat transcripts section (icons, native details, kind field, collapse rules, header layout decision)
- `plans/portfolio-implementation.md` — note 4a.6 amendments, insert new 4a.7 sub-chunk, update 4c.1 to reference `render-transcript.mjs`
- `src/content.config.ts` — extend turn schema with optional `kind` + `summary` [EDIT]
- `scripts/bookmark-transcript.mjs` — add classifier pass (`classifyTurn` helper) [EDIT]
- `scripts/promote-transcript.mjs` — replace text review with preview-harness subprocess call [EDIT]
- `scripts/render-transcript.mjs` — NEW, shared render function for preview + Astro component
- `scripts/preview-transcript.mjs` — NEW, CLI harness wrapping renderTranscript in a standalone HTML page
- `scripts/writing-topic.mjs` — NEW
- `scripts/session-utils.mjs` — NEW, extracted session JSONL discovery + redaction helpers (reused by bookmark, writing-topic, and preview)
- `plans/writing-topics/` — NEW folder with migrated `code-first-artefacts.md` and `INDEX.md`
- `plans/portfolio-writing-brainstorm.md` — DELETE after migration
- `src/components/ChatTranscript.astro` — NEW (built in 4c.1; imports `render-transcript.mjs`)
- `plans/portfolio-stitch-assets/transcripts/preview-*.html` — NEW (generated output of the preview harness, committable)

**Workspace repo:**
- `.claude/skills/bookmark/SKILL.md` — NEW (relocated from portfolio)
- `.claude/skills/writing-topic/SKILL.md` — NEW
- `.claude/skills/session-end/SKILL.md` — amend Step 0.5 to cover writing-topics AND call `preview-transcript.mjs --batch`
- Delete `portfolio/.claude/skills/bookmark/SKILL.md` after relocation

---

## Existing utilities to reuse

- Session JSONL discovery + filtering logic already in `bookmark-transcript.mjs` → extract to `scripts/session-utils.mjs` so `writing-topic.mjs` and any future capture scripts share one source of truth
- Redaction regex pass already in `bookmark-transcript.mjs` → move to `session-utils.mjs`
- `reference('projects')` pattern from existing Zod collections (`log`, `writing`) — already used for `transcripts.project`, no change needed
- Frontmatter shape from `ideas/<slug>.md` — the writing-topics frontmatter mirrors this pattern
- INDEX.md scan-list shape from `ideas/INDEX.md` — same format reused for `writing-topics/INDEX.md`

---

## Verification

**Schema extension (2b):**
- `npm run check` (astro check + build) passes with the extended schema and the empty `transcripts/` folder.
- Write a throwaway draft JSON with a turn containing `kind: 'plan'`, `summary: 'test'` — assert Zod accepts it. Delete after.

**Shared render helper + preview harness (3a, 3b):**
- Unit test: `renderTranscript(sampleTranscript, {variant: 'a-h1'})` returns HTML that contains `<details>` elements for every non-verbatim turn, plain `<div>` for verbatim turns, and the expected icon SVG for the variant. Fixture sample transcript lives at `portfolio/scripts/__fixtures__/sample-transcript.json` with all five turn kinds represented.
- Integration test: `node scripts/preview-transcript.mjs --slug <fixture-slug>` generates `plans/portfolio-stitch-assets/transcripts/preview-<slug>.html` whose HTML passes `tidy` validation (or equivalent structural check).
- Manual: open the generated preview in a browser. Click a collapsed `plan` turn → expands, chevron rotates via CSS only, zero JS errors in console. Tab to a `<summary>` and press `Enter` → toggles (native a11y).
- Variant switcher: run `--variant a-h1`, `a-h2`, `b-h1`, `b-h2` in turn, assert each preview renders without error and the icon/header differences are visible side-by-side.
- Render-parity gate (4c.1): when `<ChatTranscript>.astro` is built, run a test that imports `renderTranscript`, calls it with a fixture, and asserts the Astro component's rendered output matches. This guarantees preview and production never drift.

**Amended capture script (2c):**
- Feed a real session containing a Skill invocation and a long plan turn to `bookmark-transcript.mjs` → inspect the draft JSON, assert classifier correctly labelled the skill turn as `kind: 'skill'` and the plan turn as `kind: 'plan'` with non-empty `summary`.

**Amended promote script (3c):**
- Run `promote-transcript.mjs --slug <draft>` → assert the browser opens to the preview page, prompt appears in terminal, `e`/`r`/`p` all behave correctly.

**Writing topic workflow (4a.7):**
- From `cd planner-app`, run `/writing-topic "testing cross-project capture from planner-app"` → assert a file appears at `portfolio/plans/writing-topics/testing-cross-project-capture-from.md` with `source_project: planner-app` and auto-captured context.
- In a session where `/bookmark` ran 30 seconds earlier, run `/writing-topic "meta note about the bookmark"` → assert the new topic file's `transcripts:` array contains the recent bookmark's slug.
- Close the session via `/session-end` → assert both the transcript draft preview (in browser) and the writing topic draft (in terminal) appear in Step 0.5.

**Relocated `/bookmark` (4a.7.4):**
- From a non-portfolio CWD, invoke `/bookmark --slug test-relocate --back 4` → assert the script runs, the draft lands in `portfolio/src/content/transcripts/drafts/test-relocate.json`.

---

## Diary entry (at end of work)

Points to mention explicitly:
- The 4a.3 "no interactivity" rule was deliberately amended for progressive disclosure via native `<details>`. Framework JS still banned; HTML semantics are not framework JS.
- The review-step redesign (terminal listing → browser preview) is a generalisable principle, not a one-off change. The shared `renderTranscript` helper means "review in the actual UI" costs nothing to apply to future content types.
- `/bookmark` relocation is a latent gap fix. The original 4a.6.4 placement was wrong — confirmed once the writing-topic workflow surfaced the same cross-project need.
- `writing-topics/` supersedes `portfolio-writing-brainstorm.md`. Chunks 5.5 references need updating at the same time or in the next session.
