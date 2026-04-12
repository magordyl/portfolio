# Design Explorer Skill — Origin Transcript

**Date:** 2026-04-12
**Context:** Workspace-level session. User asked Claude Opus 4.6 to analyse their usage of "design explorers" across projects and decide whether to build a skill for it. Output: approved plan for `/design-explorer` skill.
**Purpose:** Source material for case study on design workflow tooling and skill design. Captures the full framing → first plan → correction → revised plan arc, including the moment the user caught a generalisation error (bundling project-specific UI components into a universal skill).
**Turns:** 5 (user, assistant, user, assistant, user)
**Status:** draft — pending hand-review and redaction pass before promotion to portfolio transcripts collection. Placeholder until chunk 4a.6 ships the `/bookmark` + `scripts/promote-transcript.mjs` workflow. Once that infrastructure exists, this file moves to `src/content/transcripts/`.

---

## Turn 1 — User

> I've now used 'design explorers' many times on several projects. I want you to analyse my usage of these, and determine if we should build a skill for Claude code to do this task in future.
>
> I've found them incredibly helpful, but it does often take opus 5-10 minutes to make them, so the skill if we build it should aim to make the process of building a design explorer more efficient for Claude whilst achieving the same quality of output.

---

## Turn 2 — Assistant (Claude Opus 4.6)

*[Research phase — direct Glob/Grep/Read (remote-control, no sub-agents): found 7 files across 2 projects, read portfolio design-explorer.html lines 1-190, read card-deep-dive-v1.html header, read planner design-explorer-v1.html lines 1-50 and 870-920, grepped DIARY.md for "explorer" context, read new-feature SKILL.md Phase 3 lines 61-180.]*

Text outputs during research:

> I'll research your design explorer usage directly (remote-control mode — no sub-agents). Let me find every instance first.
>
> Let me look at a couple to understand the pattern, starting with file sizes.
>
> Let me check the DIARY entries to find where design explorers were produced — what took so long?
>
> I have enough. Let me write the plan.

**Summary of findings:**

> - **7 design explorers** across 2 projects: `design-explorer.html` (portfolio, 463 lines), `accent-palette-explorer-v1..v5.html` (1,000–1,366 lines each), `card-deep-dive-v1..v4.html` (1,028–1,558 lines each), `design-explorer-v1.html` (planner, 1,412 lines). 7 files ≈ 10,000 hand-written lines.
> - **Common shell** (~200–300 lines per file, fully invariant): Google Fonts preconnect + link, `:root` custom props, body reset, `.wrap`, doc header (kicker/title/lede), uppercase `.section` headers, footer note. Two dialects: dark (`#14130f`, Fraunces × Geist × Geist Mono) and light (`hsl(36 35% 97%)`, Fraunces × Inter × JetBrains Mono).
> - **Recurring content mockups**: case-study card, build-log strip, code block, 12-step tonal scale strip, iOS 390px mobile frame.
> - **Per-variant CSS** is mechanical: e.g. `.pa .scale-step:nth-child(N) { background: <hex>; color: <hex>; }` × 12 steps × 4 palettes = 48 hand-written rules.
> - **Workflow rules already exist** in `.claude/skills/new-feature/SKILL.md` Phase 3 (§88–94): tonal-first, self-contained HTML, commit to `plans/<project>-assets/`, keep iteration trail, portfolio-grade. The *rules* are documented; the *mechanics of building fast* are not.
> - **Friction** is in the 300-line shell being hand-rewritten every time, not in the creative variant work.
>
> Now writing the plan file.

**First plan (v1) written to `C:\Users\User\.claude\plans\refactored-wandering-ullman.md`:**

```
# Plan — /design-explorer skill

## Context

Design explorers are self-contained HTML artefacts that compare design options
(palettes, type, card treatments, layout variants) with live Google Fonts and
real-content mockups. Across 2 projects, 7 of them now exist (~10,000 lines of
hand-written HTML/CSS): portfolio's design-explorer.html,
accent-palette-explorer-v1..v5.html, card-deep-dive-v1..v4.html, and planner's
design-explorer-v1.html.

They work. The 2026-04-10 diary entry ("Tonal systems beat accent pairs, and
HTML explorers beat Stitch mocks") says they're the right tool for Phase 3
token exploration — more useful than Stitch for "which hue, which font, which
radius" decisions. The rules for *when* and *how* (tonal-first, self-contained,
portfolio-grade, versioned iteration trail) are already codified in
.claude/skills/new-feature/SKILL.md §Phase 3 lines 88–94.

The problem is speed. Each explorer takes Opus 5–10 minutes to produce, and
the bulk of that time is rebuilding a shell that is genuinely invariant across
every instance: <head> + fonts preconnect + Google Fonts link, CSS reset, body
font stack, :root token block, .wrap, doc-header (kicker/title/lede),
uppercase section headers, footer note. ~200–300 lines per file of pure
boilerplate. The creative work — deciding *what* to compare and writing the
variant CSS — is the small fraction the user is actually paying Opus to do.

Goal of the skill: cut the shell-rebuild tax so Claude can spend its minutes
on the creative variant work, not the <head> block. Preserve the exact output
quality — explorers still render as self-contained HTML at portfolio-grade.
No new build tooling, no JS config language, no abstraction layer the user
has to learn.

## Recommended approach

A **template-and-snippets skill**, not a build script. Claude copies a
pre-built shell template, replaces the tokens and variant sections with the
creative work, and saves to the project's permanent plans/<project>-assets/
directory. No Node, no compile step, the output is the same hand-built HTML
it is today — it just starts from a shell that already has the fonts loaded
and the doc-header styled.

### Skill location and structure

.claude/skills/design-explorer/
├── SKILL.md
├── templates/
│   ├── shell-dark.html        # Fraunces × Geist × Geist Mono, dark (#14130f) — portfolio dialect
│   └── shell-light.html       # Fraunces × Inter × JetBrains Mono, light (hsl 36 35% 97%) — planner dialect
└── snippets/
    ├── tonal-scale.html       # 12-step scale strip + role labels
    ├── case-study-card.html   # preview card (Fraunces title + kicker + tldr + meta)
    ├── build-log.html         # dated strip (ticker style)
    ├── code-block.html        # syntax-coloured pre block using CSS vars
    ├── mobile-frame.html      # iOS 390px frame with status bar + notch
    └── candidate-column.html  # 3-column layout wrapper for A/B/C comparisons

[... rest of v1 plan ...]
```

*[v1 plan included `case-study-card.html`, `build-log.html`, `code-block.html`, and `mobile-frame.html` as skill-owned snippets — which turned out to be the bug the user caught in Turn 3. Only the universal primitives (tonal-scale, candidate-column, section-header, design-notes-callout, specimen-swatches) were correctly scoped.]*

Then: `ExitPlanMode` call to request approval.

---

## Turn 3 — User (rejects plan with feedback)

> Good plan, but some amendments to make. Some of the proposed files in the skills directory are specific to a single project - e.g. case study, card, code block. These are UI components specific to a single project and should not be a constraint for every design explorer. You may need to generalise the instruction set to accommodate each project and each design explorer focusing on a different set of components. Note that some of the examples you looked at have multiple verions (v1... v4 etc), skewing your comparison of what is most used. Also make sure that as part of implementing this skill, you add appropriate references into /new-feature skill, and ensure that /new-feature can automatically invoke the design explorer when necessary, but that the design explorer skill can also be used in other workflows in future in a self-contained way. Revise the plan according to this feedback.

---

## Turn 4 — Assistant (acknowledgement + revised plan)

> Understood. The case-study card, build-log strip, and code-block aren't universal primitives — they're portfolio components. And `accent-palette-explorer-v1..v5` is one explorer iterated, not five distinct uses. Let me save the feedback and rewrite.

*[Saved two feedback memory files: `feedback_skill_primitives_vs_project_content.md` and `feedback_collapse_iteration_versions.md`. Updated MEMORY.md index.]*

> Now rewriting the plan with the revised scoping.

**Revised plan (v2) — key differences from v1:**

1. **Usage count revised** — "7 explorers" → "4 distinct explorers across 11 files." Frequency and per-instance cost reported as separate signals.
2. **Snippets list restricted to genuinely universal primitives**:
   - `tonal-scale.html` ✓
   - `specimen-swatches.html` ✓ (replaced build-log / code-block)
   - `candidate-column.html` ✓
   - `section-header.html` ✓
   - `design-notes-callout.html` ✓
   - **Removed**: `case-study-card.html`, `build-log.html`, `code-block.html`, `mobile-frame.html`
3. **New design principle section** — "The skill ships only universal primitives" — stated explicitly, with the "read the target project's real components and design tokens at invocation time" rule as the replacement for bundled components.
4. **New integration section** — two-line amendments to `new-feature` SKILL.md at lines 88 and 175 so it auto-invokes `/design-explorer`, plus explicit "no dependency edge from `/design-explorer` back to `/new-feature`" so the skill is callable standalone.
5. **New "Out of scope"** section enumerating what the skill does NOT do (no portfolio components, no planner components, no auto-commit, no Stitch).
6. **Verification step 2 added**: universality audit — grep `snippets/` for any project name or domain, expect zero matches.

Full revised plan file: `C:\Users\User\.claude\plans\refactored-wandering-ullman.md` (committed in workspace).

Then: `ExitPlanMode` call to request approval.

---

## Turn 5 — User (approves)

> User has approved your plan. You can now start coding.

---

## Lessons captured to memory during this session

1. **`feedback_skill_primitives_vs_project_content.md`** — Workspace-level skills must ship only universal primitives. Project-specific UI components (case-study cards, build logs, code blocks, mobile frames) do not belong in a skill's snippet library. For project-specific content, the skill's workflow tells Claude to read the target project's real components at invocation time. Gut check: "Would this make sense in a project I haven't started yet?"

2. **`feedback_collapse_iteration_versions.md`** — When measuring usage frequency to decide on tooling, count distinct artefacts not files. `card-deep-dive-v1..v4` is one exploration iterated four times, not four explorations. Report frequency and per-instance cost as separate signals. Raw file counts inflate apparent usage and skew the extract-vs-inline decision.

Both entries now live in MEMORY.md and will apply to future skill-design sessions across the workspace.

---

## Why this transcript matters for the portfolio

This exchange is a compact example of:

1. **The research-before-design discipline** — Claude didn't jump to "build a skill" on the opening ask. It enumerated the existing instances, read the source, read the DIARY context, found the existing rules in `/new-feature` Phase 3, and only then sized the problem.
2. **A generalisation error caught by review** — the first plan bundled portfolio-specific components as universal primitives. The user saw it immediately. The correction is specific ("case study, card, code block are project-specific") and principled ("skills should not constrain future projects to render the same mockup types"). A good example of human review catching exactly the kind of error Opus is prone to: pattern-matching the surface shape of "things that appeared in multiple files" without checking the semantic shape of "things that belong in every project."
3. **Separation of frequency and cost** — the user's note about iteration versions surfaced that the tooling-justification argument isn't "how often has this happened" but "how expensive is each build and how many more are coming." Two different signals that v1 conflated.
4. **Skill boundaries matter** — v2 explicitly makes `/design-explorer` callable standalone and forbids any dependency edge from itself back to `/new-feature`. A skill that only works inside one parent workflow is a coupling bug.

The whole arc — from opening question to approved plan — took about ten minutes of turn time. The correction round added maybe three of those ten. Catching the generalisation error in code review would have cost more.
