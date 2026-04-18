# Development Diary

## 2026-04-18 — Chunk 1 of CI/CD improvements: GitHub Actions check workflow

Commit `49d0aad` (workflow), `2d75d68` (fix). Part of the workspace CI/CD improvement plan at `plans/cicd-improvements.md`.

The workflow itself was straightforward — `npm ci` → `npm run check` on every push and PR, Node 22 to match the `engines >= 22.12.0` constraint. The interesting part was the failure it immediately exposed.

First CI run failed with `ts(2307): Cannot find module '../design-system/types'`. The portfolio's `design.tokens.ts` imported types and defaults from the workspace sibling directory (`../design-system/`). That path works locally because both repos live in the same workspace folder on disk. In GitHub Actions, only the portfolio repo is checked out — the sibling doesn't exist.

Fix: copied `design-system/types.ts` and `design-system/defaults.ts` into `src/design-system/` inside the portfolio repo, updated the two import lines. The portfolio overrides almost everything in `defaultTokens` anyway (Royal Tonal palette vs. the dark neutral defaults), so this is a stable copy with no meaningful drift risk.

The alternative was a sparse checkout of the workspace repo inside the CI workflow. That approach would have required either making the workspace repo public or creating a PAT — more moving parts for what is essentially two small stable files.

Second CI run: green.

---

## 2026-04-17 — Chunks 4c.0.5 + 4c.1a shipped: /design-system kit + ChatTranscript v3 port

Three commits: `3e68c07` (kit scaffold), `428f905` (plan restructure), `41fac2c` (ChatTranscript port). The kit is now the dev surface every downstream component renders into first, and the first real component — ChatTranscript — landed there against the locked tokens.

The plan restructure earns its own note. Chunk 4c.1 had grown three components deep (ChatTranscript + ProjectTimeline + layout explorers), which meant the commit boundary sat at "all three done" — a bad shape for a component that's 500 lines on its own. Split into 4c.1a (ChatTranscript only) and 4c.1b (layout explorers). ProjectTimeline came out of 4c.1 entirely and moved to a new chunk 7.5 after launch. A timeline is a case-study enhancement, not a shipping prerequisite — leaving a stub slot in the case study layout is fine, retrofitting once the first case study is live is fine. Removing the blocker unsticks the whole case-study track.

The token decision on ChatTranscript was the judgement call worth remembering. v3.html uses identity-carrying colour pairs for Dylan (violet) and Claude (royal) — badges, labels, accent lines. The aggressive reuse option was to bind everything to existing semantic aliases (`--link` for accent, `--fg-subtle` for label, etc.) and accept the coupling. The conservative option was dedicated `--transcript-*` tokens for every surface the component paints. Went conservative: 16 new tokens, each scoped by name to this component, with the allowlist doc naming the raw-scale pair each role resolves to. Cost is 16 lines of boilerplate in `globals.css`. Benefit is that the next transcript-shaped component (build-log drawer, code-review viewer) can reuse `--transcript-*` without accidentally tugging `--link` colour when someone tweaks link hover next quarter.

The allowlist is now empty. That was the acceptance criterion for 4c.0 being done — all migrations converge on role tokens only. The ChatTranscript port was the last file with raw-scale references, migrated in the same commit as the port itself. `scripts/check-raw-colours.mjs` still runs on every `npm run check` as a speed bump against future ad-hoc additions.

One pattern surfaced that wants a workspace rule. Badge icons at 14px inside a 26px circle read anemic at the workspace default `tokens.icons.strokeWidth: 1.5`. The v3.html explorer used `stroke-2` on those icons. The workspace rule says never hardcode stroke-width, which is correct — but didn't address sub-20px icons where 1.5 genuinely doesn't work. Resolved by adding a component-scoped CSS var (`--badge-stroke: 2` on `.badge`, applied via `stroke-width: var(--badge-stroke)`). Override stays inside the component; workspace default stays at 1.5. Proposed addition to `.claude/rules/design-system.md` pending approval.

Cluster synthesis fired correctly on the 21-turn Stitch batch in the planner-stitch-batch-40-renders transcript — merged into one expander with a synthesised heading, wrap-up pill stayed outside. Native `<details>`, zero client JS, build-time markdown via `marked`. `npm run check` green, Cloudflare auto-deploy kicked.

Remaining: 4c.1b (case study layout explorers), then 4c.2–4c.5, then 4d (the-weekly prose). Chunk 7 slimmed to a post-launch curation pass; 7.5 is ProjectTimeline, post-launch.

---

## 2026-04-17 — Chunk 4c.0 shipped: role tokens, migrations, build-time enforcement

Commit `b19bc72`. The gate the 2026-04-14 entry flagged is now executed. Raw `--royal-*` / `--violet-*` references outside `globals.css`, `design.tokens.ts`, and one allowlisted file now fail `npm run check` via a Node grep script wired before `astro check`. Components reference role tokens only: `--tag-{default,active,signal,status}-{fg,bg,border}`, `--kicker-{default,signal}-fg`, `--dot-{neutral,active,attention}`, `--border-hairline`, `--expander-pill-{high,bg}-{fg,border}`, plus `--link-hover`, `--button-fg`, `--placeholder-bg`, `--placeholder-gradient`.

Three decisions during execution worth the entry. First: `ChatTranscript.astro` already existed with ~35 raw-scale refs from an earlier commit that pre-dates the v3 spec. Migrating it to role tokens now would be rework, because 4c.1 rebuilds the renderer against the v3 HTML explorer anyway. Deferred it by adding a single-file allowlist entry to `check-raw-colours.mjs`, with a comment noting the deletion deadline (when 4c.1 lands the v3 port). The alternative — migrating twice — would have traded real time for the theoretical cleanliness of an empty allowlist.

Second: the audit surfaced that `.tag` on `CaseStudyCard` currently renders in the royal-accented `active` variant — tags are treated as signal. The plan's locked semantics put passive taxonomy labels in the muted `default` variant and reserve `active` for interactive filter state (which hasn't been built yet). Following the plan literally meant a visible change on the live site: cards move from vivid to muted tags. Reverting that by re-scoping `active` to cover passive labels would have been the fast decision; it would also have meant the first component variant change drifted from the spec. Took the plan-literal option and accepted the visible change — the portfolio is dark-mode serene by design, and muted tags are closer to that surface than accented ones.

Third: auditing `PageHeader` exposed a pre-existing WCAG AA body-contrast fail on the "Get in touch" button — `--royal-12` foreground on `--royal-8` background measures 4.17:1, below the 4.5:1 threshold for 16px text. `portfolio-design-tokens.md` had always specified `--button-fg: #FFFFFF`, but `globals.css` never implemented it. The fix was a one-line token addition plus a one-line component change, and it came along for the ride without adding scope. The general shape worth remembering: a colour audit designed for consistency also surfaces accessibility bugs because the same ad-hoc pairings that create inconsistency create contrast failures. One gate, two wins.

One process note. A PowerShell here-string passed through `git commit -m @'...'@` tokenised into separate pathspec arguments — git saw fragmented words as filenames and refused. Fallback that worked: write the message to `.git/COMMIT_EDITMSG_<tag>` with the Write tool, `git commit -F` it, delete the temp file. Added to workspace `CLAUDE.md` under the PowerShell-tool section so the next session doesn't hit the same wall.

Chunk 4c.0 is complete. 4c.0.5 (kit scaffold) and 4c.1 (case study design explorers) can both open now.

---

## 2026-04-17 — Component kit scaffold moved forward to double as dev surface

Short planning session, one decision worth capturing. Dylan asked where a `/design-system` component kit page — swatches, typography, every component rendered live — would sit best in the existing plan. The straightforward read was chunk 7, where a "design system showcase page" already sat as a post-launch deliverable, inventory-style: enumerate everything after chunk 6 shipped, then build.

The better read was: don't wait. Moving the scaffold forward into a new step 4c.0.5 (right after the colour-role rationalisation gate) turns the kit into the dev surface for every downstream component. `<ChatTranscript>`, `<ProjectTimeline>`, `<VersionedEmbed>` land in the kit *first* — rendered live against the locked tokens — then get consumed by case studies. That matches two existing workspace rules: "render before commit" (components need to be seen against real tokens before they're committed to consumer contexts) and "extract shell first" (the kit *is* the shared shell across all subsequent component work).

Tradeoff is honest: every component chunk now carries an "update the kit" acceptance step, so the kit grows with each commit instead of being built once retroactively. The cost is small; the benefit is that the kit is shareable the moment 4c.0.5 ships — which makes the portfolio partially shareable long before the-weekly prose lands in 4d. Chunk 7 slimmed to an optional post-launch curation pass (narrative captions, repo link, final audit).

Edits to `plans/portfolio-implementation.md` and `CLAUDE.md` done during this session, committed at session-end. No code yet; the scaffold itself happens in a future session after 4c.0 completes.

---

## 2026-04-14 — ChatTranscript design locked, tokens wired

The component design is now fixed, captured in `plans/portfolio-stitch-assets/chat-transcript-explorer-v3.html`. The iteration trail survives as v1 → v2 → v3 in the same folder; v3 is canonical. The selected variant is royal-3 hairline + full-block accent line + flat expander.

The Option A vs B question on chunk 4c.1 is closed in favour of B — Dylan wears violet, Claude wears royal. This is the single instance in the whole portfolio where the two-register palette does work: the site frames Dylan as the thinker and Claude as the tool, so the signal colour (violet) belongs with the thinker and the chrome colour (royal) with the tool. Everywhere else the palette remains monochromatic royal. The v2 version (violet on Claude) looked attractive because violet is the prettier colour, but it inverted the portfolio's hierarchy — which is exactly the failure mode flagged when the question was added to the plan.

The interesting work during this session was not picking variants but killing nested complexity. v2 had four pill colours, multi-level expanders with single-child children, mid-word heading truncations, and `<details>` elements that scrolled horizontally for long tool inputs. Each of these needed its own rule, and each rule had to earn the cognitive cost. What shipped: two pill colours (`high` and `bg`), one heading source with word-boundary trim and a CSS 2-line clamp, pre-wrap on all tool-input boxes, and — the one new invention — a cluster expander that merges runs of 3+ consecutive tool-heavy Claude turns into a single collapsed group with a heading that describes what was done, not how. The 40-render batch transcript collapses from 21 turn expanders to a single cluster expander, which is the only way a reader will ever open it.

The violet signal tokens (`--violet-8..12`) and the `--grad-rv` gradient token were planned in `portfolio-design-tokens.md` but never added to `globals.css` or `design.tokens.ts`. Fixed now — both files carry the five violet steps and the gradient. The design.tokens.ts exports them under `palette.violet` and `palette.gradients.royalViolet` with comments pinning the intended use to `<ChatTranscript>` only; any future use needs design review so the palette doesn't drift back toward a generic dual-register system.

The implementation checklist for the Astro component is in `plans/portfolio-implementation.md` chunk 4c.1 alongside the locked spec. Six steps: port the v3 renderer, move marked from CDN to a build-time dep, build in frame / block / turn layers, extend the Zod schema with the optional fields, visual-parity test against the planner-stitch transcript, and add a story to the chunk 7 showcase page. The cluster-heading synthesiser stays a pure function so it can be unit-tested — the synthesis logic is currently hard-coded for Stitch runs and falls back to a generic "N tool calls across M turns" line, which is fine for now but will want a `clusterTitle` override field on transcripts when a real case study needs a sharper heading.

Frame-spec table in `portfolio-imagery-standards.md` was fully rewritten. The old table described an older, simpler design (sans-only typography, no grouping, no expanders, no gradient border). It is now accurate. The WCAG 1.4.1 rule in `portfolio-design-tokens.md` §3 still applies — role labels stay mandatory on every block — but the typography-split-for-accessibility argument is superseded by the icon + label + colour layering, which carries role identity even in greyscale.

Next touch: port the renderer during chunk 4c.1 implementation. No urgency; the design is frozen.

The ChatTranscript pill churn (four colours → two) surfaced a system-level problem: components reach into the raw 17-colour scale ad hoc, and each new component drifts further. Added **chunk 4c.0 — component colour-role rationalisation** as a gate before 4c.1 opens. Deliverable is a role-token layer on top of the raw scale plus per-component variant allowlists (tags ≤ 4, kickers ≤ 2, dots ≤ 3, borders ≤ 3, expander pills ≤ 2), a migration of existing chunk-3 components, and a rule that raw `--royal-*` / `--violet-*` references outside `globals.css` become a build-time failure. The discipline this forces is the same one that made the ChatTranscript design work: decide what the variants mean, and refuse new ones without going through the gate.

---

## 2026-04-13 — Evolution showcase planned for the-weekly case study

The-weekly case study draft (locked 2026-04-12) asserts in Lesson 2 that "skipping design was the biggest mistake" and that the design workflow has been iterated on several times since. That's a claim in prose with no evidence. An evolution showcase — three live, interactive versions of the-weekly at distinct commits, embedded as a tab switcher under Lesson 2 — turns the assertion into visible proof. The reader watches the arc themselves.

The narrative frame had to be chosen carefully. "I got better at visual design" is an insight, not an assertion, and banned by the writing-style rules. The decision-led frame works: Stage 1 → 2 was triggered by a colleague's MOB Kitchen suggestion forcing a design audit; Stage 2 → 3 was triggered by realising visual tokens needed to live outside the project, which became the workspace design system. Each caption names the decision, not the result.

Hosting: three Cloudflare Workers (matches the portfolio's own hosting pattern), no password. The-weekly is already on Netlify; new deploys come from git worktrees at the three historical commits so nothing mutates master. One implementation detail mattered more than expected: the three iframes need to keep their own page state across tab switches. If the reader is on ingredient review in Stage 1, switches to Stage 2, then back — they should land on ingredient review, not splash. This rules out swapping `src` on a single iframe (which remounts the document and loses state). Instead: render all three iframes, toggle visibility via the `hidden` attribute, never touch `src` after mount.

Plan saved to `plans/the-weekly-evolution-showcase.md`. Chunk 4d scope updated to include the `<VersionedEmbed>` component and the three Workers deploys. Nothing built yet — the plan executes during 4d alongside the prose rewrite.

---

## 2026-04-13 — Plan amendments: timeline visual, workspace-audit reframe, design-system showcase

Four changes to the implementation plan, no code. The interesting one was the workspace-audit conversion. It was originally scoped as a lightweight case study in chunk 5 — 200–350 words, meta-toned, "this site is also a case study"-adjacent. Thinking about it as a case study never felt right. There's no product artefact at its core; the "thing built" is the rules/hooks/memory/skills configuration, which doesn't photograph. The signal it carries is *thinking* about how to configure Claude Code intentionally, not shipping. That's a writing post, not a case study.

Converting it meant scrubbing it from three places in the plan (chunk 2 placeholder list, chunk 4b word-count targets, chunk 5 deliverables) and spinning up `plans/writing-topics/claude-workspace-audit.md` with a candidate thesis: "the workspace configuration is product design for an audience of one." Four supporting arguments, including "the rules file is load-bearing, not decorative" and "skills are the interface." This also slots cleanly next to the `workflow-evolution-series` — could become its sub-post 1 (engineering/architecture) if the series ships as a bundle.

The `<ProjectTimeline>` addition is straightforward: linear horizontal/vertical timeline with milestone vs pivot nodes, data from a new optional `timeline` frontmatter field. Added to chunk 4c.1 alongside the existing `<ChatTranscript>` so both components get explored in the same round of case-study design explorers. Added a `timeline` field note to chunk 2's Zod schema update list.

The `<ChatTranscript>` colour-emphasis question is the one worth flagging for later. Current intent has Claude's turns visually prominent. If Claude dominates the transcript visually in a portfolio case study, the signal hierarchy inverts — the portfolio is Dylan's thinking, with Claude as the tool; a Claude-dominant transcript reads as "look what Claude did." Added an open-design-question block to chunk 4c.1 requiring both options (Claude-prominent and Dylan-prominent) to be rendered in the case study design explorers before the component is locked. Cheapest fix: explore in-context, not in isolation.

Added a new **chunk 7 — design system showcase page** and renumbered the retrofit chunk to 8. The showcase page renders actual components rather than screenshots, so it stays accurate as components change. Design explorer first, footer-linked not in main nav. Gate: after chunk 6 ships so the inventory is complete.

---

## 2026-04-12 — Chunk 4d: the-weekly case study structure locked

The first real case study structure is locked, and it immediately deviated from the template. The-weekly was planned as a standard product case study (Design + Architecture + Decisions middle zone). The interview surfaced a better story: this is a "learning to ship with Claude Code" piece, where the product is the vehicle.

The reframe changed everything. Problem section does double duty: beat 1 is the product insight (Dylan was PM in the Coles shoppable recipes team, personally subscribed to meal kits, realised the value wasn't pre-portioning but the curated picking experience), beat 2 is why build it now (idea sat for months, started learning Claude Code, needed a real project). Middle zone collapsed to Decisions only: front-end-only scoping as a deliberate learning constraint, TDD from day one because Claude removes the time cost, and opinionated UX as a product philosophy stance. Lessons is where the Claude Code learning story peaks: never touched a line of code (expected to), and skipping design mockups was the biggest mistake.

Architecture and Design sections were dropped. The no-backend architecture is a one-sentence point, not a section. The design iteration trail (MOB audit, 7 polish chunks) is interesting but secondary to the learning arc. No transcript embeds either. The piece earns its credibility through the admission shape in Lessons, not through showing working.

The interview itself was the most valuable part of the session. Dylan's answers gave a clear writing-style baseline: direct, conversational, declarative. States what happened and why without dressing it up. That's the voice the prose needs to land in.

Structure saved to `plans/the-weekly-case-study-draft.md` with full interview context. Dylan writes the prose next session.

---

## 2026-04-12 — Design system scaffold: catching a gap the planning process created

The portfolio had 10+ bespoke Astro components, a 12-step colour scale, a custom type system, and zero connection to the workspace design system. No `design.tokens.ts`, no shadcn. The implementation plan deliberately deferred this to chunk 7 (post-launch) to avoid coupling the portfolio build to an unproven shared layer. Defensible at the time, but three things drifted: the CLAUDE.md claimed shadcn as part of the stack before it was installed, the workspace `design-system.md` pre-flight rule arrived mid-build without auditing in-progress projects, and chunk 7's "post-launch" gate had no trigger to re-evaluate.

The fix was straightforward: create `design.tokens.ts` with a two-export pattern (workspace schema mapping + raw palette), update CLAUDE.md to reflect reality, and add a portfolio exemption to the workspace shadcn rule. About half the colour system maps cleanly to the workspace `ColorTokens` interface; the rest (the full 12-step raw scale, ink-faint, tag tokens, code syntax tokens, kicker) stays in `globals.css` only. Schema extension deferred until a second project needs the same roles.

The process lesson is more interesting than the fix. When a workspace-wide rule is added, it needs an audit pass against active projects in the same session. The design-system pre-flight check ("stop if no `design.tokens.ts`") was written for future projects but applied retroactively to one that was already deep into chunk 4. A 10-second glob would have caught the gap. Added this as rule 10 in workspace CLAUDE.md.

---

## 2026-04-12 — Chunk 4c.1: Diagram, ChatTranscript, CaseStudyLayout

Three components and the project page route shipped in one session. The interesting part was what came before the code: using Stitch to generate a layout mockup first, which gave us a spatial skeleton to build against rather than designing in code.

**Stitch for layout ideation.** The existing Stitch portfolio project had no screens. Rather than updating its design system to match the real Royal Tonal tokens (which would have been slower and more precise than needed), we used the approximate dark-mode "Midnight Essayist" system as a proxy — close enough in tone and geometry to validate spatial decisions without blocking on token fidelity. The output confirmed the structural shape: 680px prose column, section labels as mono kickers, breakout transcript extending into the right margin, diagrams before their interpreting prose. The specific decisions locked before a line of code was written: Bot icon for Claude, vertical stacked icon/label header, v1 layout as the base.

**`<Diagram>` component.** The spec was fully locked from 4b: 490px min-width scroll container, mobile bleed via negative margins, "scroll →" hint on narrow viewports. Straightforward to build. One deliberate choice: the scroll hint is always visible on mobile rather than using a CSS container query — simpler, and correct because the diagram minimum is always wider than a 390px screen.

**`<ChatTranscript>` component.** The vertical stacked layout puts a 24px icon circle + label in a 40px left gutter, with turn text filling the remainder. Bot and User icons are inline SVG (lucide paths), no JS dependency. The collapse logic follows the `kind` field: `plan`, `skill`, and `research` turns collapse behind a native `<details>/<summary>`, user turns and `verbatim`/`headline` turns always show in full. The chevron rotates via CSS `[open]` selector — zero JS, full keyboard a11y. Breakout mode is a `-120px` right margin that collapses to zero below 900px.

**`CaseStudyLayout.astro`.** The layout renders the hero section from frontmatter (number badge, serif title, TL;DR, metadata bar, tags, live link, hero image placeholder). The body is a 680px prose column where h2 elements are styled as mono section kickers — uppercase, letter-spaced, Royal Tonal 11 — matching the Stitch mockup's section label treatment. The layout also injects `.body :global()` rules for prose typography, diagram/transcript spacing, and the screenshot grid utility.

**ChatTranscript fix after review.** The first version had two problems. First, the `<details>` element wrapped entire turns as collapsible blocks — the gutter (icon + label) disappeared when collapsed. The fix was structural: expanders nest *within* a single turn's body, not around the turn. The gutter always stays visible. Three render modes now: verbatim (text renders directly), collapsed (plan/skill/research get a summary bar with body in `<details>`), and headline (each `##`/`###` heading stays visible, section bodies individually collapsible via their own `<details>`). This matches how `render-transcript.mjs` already handles it — the Astro component was lagging behind the render helper. Second, the chevron was a `›` pseudo-element in `--text-sm` at `--royal-11` — too subtle against the royal-3 background. Replaced with a 16px lucide `chevron-down` SVG at `stroke-width: 2.5` in `--royal-10`. The text-to-SVG jump and the bolder stroke make it unmissable.

**What ships next.** 4d: write the-weekly case study against the locked template and layout. Opus recommended for the writing work.

---

## 2026-04-12 — Chunk 4a closed: capture workflows for writing topics and transcript bookmarks

The last two foundation sub-chunks shipped together. The session's real contribution is infrastructure that makes portfolio content accumulate passively from normal work sessions rather than requiring dedicated "content creation" time.

**Writing topic capture (`/writing-topic`)** replaces the monolithic `portfolio-writing-brainstorm.md` with per-topic files in `plans/writing-topics/`. The old file mixed three unrelated post ideas in a single 170-line document, making it hard to add context incrementally without tangling the others. Each topic now has its own file with frontmatter (slug, status, source project, linked transcripts) and the script auto-captures session context and transcript links at creation time. The three existing seeds migrated cleanly.

**Session utils extraction** was the technical prerequisite. The bookmark and writing-topic scripts both need session JSONL discovery, event parsing, and redaction. Duplicating that across scripts means divergence on the first bug fix. Extracted to `scripts/session-utils.mjs` and updated bookmark-transcript to import from it. The extraction was additive (no behaviour change, bookmark still runs identically) but required reading every helper function in the bookmark script to decide what belonged in the shared module vs what was bookmark-specific. The split: session discovery, parsing, redaction, and user-turn filtering are shared; tool-use labelling, assistant content extraction, and the turn-merging pipeline stay in bookmark.

**`/bookmark` relocated to workspace level.** The original placement in `portfolio/.claude/skills/` meant it only fired when CWD was the portfolio directory. Writing topic capture surfaced the same cross-project need. Both skills now live at workspace level, both point at portfolio scripts by absolute path. The latent gap was invisible until the second capture script needed the same cross-project reach.

---

## 2026-04-12 — Mermaid validated for architecture diagrams

Explored whether Mermaid could replace hand-authored SVG for architecture diagrams. The answer is yes. Built two iterations of a sample file (`mermaid-diagram-samples-{v1,v2}.html`) testing all three planned diagram types: architecture (new), flowchart (existing), and quadrant chart (existing).

**`classDef` handles the three-tier node treatment.** Owned nodes (royal-4 fill, royal-8 stroke), highlighted nodes (royal-5, royal-9, 2px), and external nodes (transparent, royal-7 dashed) are all achievable with Mermaid's `classDef` + `class` syntax. The one limitation is sub-labels: the Vendor Gateway's smaller emphasis text renders at the same font size as the main label. Acceptable trade-off for a single toolchain across all diagram types.

**v1 had two problems.** All labels rendered in uppercase (Mermaid's default CSS applies `text-transform: uppercase` to node labels), and diagrams were unreadably small on mobile. v2 fixed both: a CSS override (`text-transform: none !important`) on Mermaid's label classes restored sentence case, and a scroll container (`min-width: 490px` inner, `overflow-x: auto` outer, "scroll →" hint) keeps text at 13px on all screen sizes. The mobile strategy is now unified across all diagram types — the `<Diagram>` component (4c.1) will implement this once.

**Key decision: Mermaid is the production path for architecture diagrams.** Hand-authored SVG explorers preserved for the iteration trail but not the build workflow. This means all four diagram archetypes now use the same toolchain: Mermaid source in `diagrams-src/`, `mmdc` render to SVG, committed output in `src/assets/diagrams/`. One set of `themeVariables`, one render script, one CSS strategy.

---

## 2026-04-12 — Chunk 4b locked: content template + architecture diagram standards

Shipped the project content template (`plans/portfolio-case-study-template.md`) and two architecture diagram explorers (`5f9260c`). This is the content hierarchy that 4c (layout) and 4d (writing) both build against. Content structure dictates layout, not the reverse.

**The flexible middle zone is the structural innovation.** My first draft had a rigid six-section template (Hero, Problem, Process, Outcome, Lessons, Next). The user pushed back: projects have different strengths, and a fixed template would force every case study into the same mould. The fix was splitting "Process" into a pool of three optional sections (Decisions, Architecture, Design) where each project picks 1-3 and orders them by what's most interesting. The bookend sections (Hero, Problem, Outcome, Lessons, Next) stay fixed. This buys flexibility without losing structure. Future sections can be added to the pool without touching existing case studies.

**Naming landed on "Projects" and "Writing".** Evaluated five options each for the project collection and the writing collection. "Case Studies" was the original label but felt overly formal and academic. "Projects" is the simplest, most straightforward label that accurately describes what the collection contains. "Writing" beat "Essays" (too intellectual), "Posts" (too bloggy), "Thinking" (too vague), and "Notes" (too informal). Tags and kickers must use these labels consistently. Tagging structure deferred until writing volume grows.

**Architecture diagram standards shipped with v2 colour contrast improvements.** Built a design explorer showing three variations of the Planner V1 architecture diagram at case-study body width. Variation B (detailed with highlighted Vendor Gateway, 8 nodes) was selected. The v1 colours were too subtle on mobile, so v2 bumped every fill and stroke one step up the Royal Tonal scale. Key rule: architecture diagrams use Royal Tonal exclusively. Violet Signal does not appear in architecture diagrams because Violet is the "thinking/writing" content register, and mixing registers in a single diagram undermines the semantic colour system.

**Mobile diagram legibility was the session's biggest technical problem.** All three v1 variations were unreadable on mobile because card padding ate ~40% of screen width. The solution has two parts. First, a hard floor: no SVG text below 11px in viewBox units, combined with a 490px minimum rendered width on the scroll container, which means 11px SVG text renders at 9px CSS on screen. Second, a dual presentation strategy: diagrams bleed to full container width on mobile (negative margins cancel card padding) and, if the container is still narrower than 490px, enable horizontal scroll with a "scroll →" hint. The `<Diagram>` Astro component will handle both behaviours with no JavaScript.

---

## 2026-04-12 — Writing seeds captured, transcript promoted, 4a.6.6 gate closed

Captured two writing brainstorm entries: a four-post series on how the workflow has evolved since starting Claude Code (engineering, portfolio maintenance, design, idea capture) and a standalone post on custom skills as a personal operating system. Both are seeds in `plans/portfolio-writing-brainstorm.md`, not to be drafted until chunk 5.5.

Promoted `plan-iteration-example` transcript from drafts to published (`a3dd316`). The schema bug that blocked promotion last session (tool-only assistant turns rejected as "empty text") was already fixed by the amendments 2+3 commit (`5086003`). This closes the 4a.6.6 first-use gate.

---

## 2026-04-12 — Chunk 4a.4 complete: writing-style.md shipped, A2 diagram aesthetic locked

The workspace-wide writing style guide (`.claude/rules/writing-style.md`) shipped as a three-part document: structural rules locked, style guardrails as prohibitions only, imagery and transcript standards compressed from the portfolio's `portfolio-imagery-standards.md`. The guide governs all long-form prose in this workspace — case studies, writing posts, diary entries, research docs — and because it lives in `.claude/rules/` it is auto-loaded into every session. Chunk 4a.4 is now complete; 4a.5 (ideas diary) is the last foundation sub-chunk.

**Kao's assertion framework is the load-bearing addition.** Rule 5 is a direct import from a Wes Kao article, found via web search mid-session and folded into the guide: every claim-bearing piece needs an assertion, not an insight or a suggestion. The three levels are differentiated by personal stake. Insight = "here's what I noticed" (reader nods, nothing changes). Suggestion = "here are some options" (decision stays with the audience). Assertion = "here's what I believe, why, and what I would own if it fails." Six hedges are banned by name ("it might be worth considering", "one option would be", "I have a hunch but need more data", "who am I to say", "if I had to guess", "there's an argument that") because each is a suggestion or insight pretending to be an assertion. The template is explicit: *"Based on X, I think Y. Given X and Y, the move is Z. It works because A and B. If it fails, the risk is C, and I would handle it by D."* This is the single most consequential rule in the whole guide — it's the difference between a case study that reads as reporting and one that reads as thinking.

**A2 clean vector Royal Tonal locked as the diagram aesthetic.** Built a five-option design explorer (`plans/portfolio-stitch-assets/diagram-aesthetic-explorer-v1.html`) rendering the same the-weekly consolidation flow five ways: A1 hand-drawn sketch (SVG `feTurbulence` + `feDisplacementMap` for wobble), A2 clean vector (royal-8 on royal-12, 1.5px strokes, 8px node radius, Geist 13px/500 labels), A3 typographic monospace (`┌─┐` box-drawing in Geist Mono), A4 Notion-flat (filled nodes, no outlines), A5 blueprint (grid background, dimension lines, mono all-caps). Rubric: readability at case study body width, brand coherence, production cost, accessibility, robustness at small sizes. User picked A2. Rationale is readability and coherence — the hand-drawn wobble (my v1 recommendation) felt like a tell against the clean Fraunces × Geist type system; the clean vector aesthetic snaps into the same precision register as the type. A3 deliberately kept as a reserved slot for code/build sequences, because the typography already signals "this is a step-by-step system process" without extra decoration.

**The tooling rewrite that followed the A2 pick was the session's process lesson.** Picking A2 invalidated Mermaid's `look: handDrawn` setting and removed Excalidraw as the 2×2/causal-loop tool. My first sweep of `portfolio-imagery-standards.md` updated the main tooling section but missed six other sections that referenced the old approach — the workflow target paragraph, the sourcing banlist, the allowed list, the repo layout, the workflow summary, and the open items. I only found them on a second grep pass. The lesson that came out of the session retro: **when a design decision invalidates a previous approach, grep the whole affected document for the old approach's keywords BEFORE starting edits**. Build the full edit list, then edit once. Piecemeal editing after a reversal produces a doc that contradicts itself in the sections you didn't visit. Captured as a new rule in workspace CLAUDE.md Tool Discipline and a memory entry.

**Screenshot workflow locked as programmatic crop/focus/zoom.** One raw fullsize WebP per UI state is the source of truth; every view (wide hero, cropped detail, offset callout) is produced at render time via `crop`, `focus`, and `zoom` props on the `<Screenshot>` component. Zero manual image editing. The capture script only produces fullsize; the component handles all positioning via CSS transforms around a focal point. This is the same "automate everything downstream of the judgment call" pattern as the bookmark workflow — the judgment is "which UI state matters", and that's all a human does; the mechanical work of framing each view is a render-time transform, not a file in the repo. Added the props table (`src`, `crop: {x,y,width,height}`, `focus: {x,y}`, `zoom: number`, `aspect?: string`) to `portfolio-imagery-standards.md`.

**Transcript promotion is structurally broken for tool-only turns.** Tried to promote `plan-iteration-example` end-to-end (the 4a.6.6 first-use gate). The promote script rejected it: turns 1, 3, 6 failed structural validation with "empty text". The bookmark script correctly captures assistant turns where the only content is a tool call — it sets `text: ""` and populates `collapsedTools: ["[Read path]"]`. The schema validator rejects those turns as empty. The two tools disagree on what counts as a valid turn. Left the draft in place rather than hand-editing. The fix belongs in chunk 4a amendment 2c (the classifier pass): merge tool-only turns into the preceding prose turn during classification, so the rendered output still shows the tool-call breadcrumb but the turn-level schema check passes. The alternative — amending the schema to accept `text === "" && collapsedTools.length > 0` — would work but would make a turn-only-of-tool-calls render ugly in the UI (empty header, no body). Merging is cleaner. Noted in the Current Status section with the fix path called out so next session catches it.

**Budget loosening for transcripts.** Bumped the per-case-study budget from "max 1 breakout + 2 inline" to "up to 2 breakouts + 2 inline". Rationale: the portfolio's narrative is largely "learning to ship with Claude Code" and verbatim transcripts are the strongest product-thinking signal available — real reasoning can't be fabricated without reading fabricated. One breakout is too stingy when a case study might have two genuinely pivotal moments worth preserving. Two is still a ceiling; the word budget per embed keeps them honest.

## 2026-04-12 — Chunk 4a amendments: icons, native details, review-in-UI, and the meta test fixture

Planning-only session. Produced `plans/portfolio-chunk-4a-amendments.md` — four amendments that all land in chunk 4a before 4b starts, built as amendments to the already-shipped 4a.6 infrastructure rather than greenfield work. The first draft of the plan was wrong in one specific way that turned out to be the most important decision of the session, and the fix generalises well beyond transcripts.

**The four amendments.** (1) The `<ChatTranscript>` component gets lucide icon badges for Dylan and Claude alongside the text labels — exact glyphs (User+Sparkles vs User+Bot) and header layout (horizontal compact vs vertical stacked) deferred to the 4c.1 design explorer so the decision is made against real rendered transcripts, not isolated swatches. (2) Long assistant turns collapse by default via a new optional `kind` field (`verbatim|headline|plan|skill|research`), rendered through native `<details>/<summary>` — zero JS, zero framework, full a11y, CSS-only chevron rotation. Dylan's turns never collapse. A classifier pass in `bookmark-transcript.mjs` auto-assigns `kind` at capture time; author review catches misclassifications. (3) The promote-step review stops printing text to the terminal and instead renders the draft in a browser preview that uses the exact same render logic the production component will use. (4) A new sub-chunk 4a.7 adds a workspace-level `/writing-topic` skill for capturing post ideas in-flow from any project, with `/bookmark` relocating alongside it to fix the cross-project gap from 4a.6.4.

**The "render review in the UI component" correction is the session's most important decision, and I missed it on the first pass.** My v1 plan had `promote-transcript.mjs` printing a per-turn summary to stdout — slug, role, char count, detected kind — and asking `yes/no` in the terminal. The user rejected it with *"Design review step should be rendered in the UI component so the user can see what it looks like in place. In the plan, include scripting to do this deterministically and efficiently rather than needing to write code from scratch every time."* Text listings hide visual problems. A 140-char auto-generated summary reads fine as terminal output but looks cramped rendered as italic Geist caption inside a collapsed `<details>` header, with an icon badge crowding the left edge. Header layout alignment, icon sizing, type hierarchy, summary legibility — none of it can be judged without seeing the pixels. The cheapest fix is to review in the same pixels that ship.

**The shared render helper is the mechanism that makes "review in the UI component" cheap rather than duplicative.** The plan extracts `scripts/render-transcript.mjs` as a pure ESM function: `renderTranscript(transcript, {variant}) → {html, css}`. The Astro component imports it directly and wraps the result in an `<article>` shell. The preview harness (`scripts/preview-transcript.mjs`) wraps the same result in a standalone HTML document with inlined Google Fonts and a `--variant` flag that cycles through the four icon-pair × header-layout combinations. A parity test at 4c.1 time asserts the Astro component's rendered output matches the helper's raw output, which means the preview and production render can't drift. The variant flag is how we actually pick the icon/header combination in 4c.1 — cheap to regenerate, easy to eyeball side-by-side, no hand-coded HTML harness each time. The principle is saved as a memory entry (`feedback_review_in_ui_component.md`): when the artefact under review is visual, the review step renders in the final UI through a one-command script, never in a terminal listing.

**The bookmark relocation is a latent gap fix surfaced by the writing-topic workflow.** The 4a.6.4 plan put `/bookmark` inside `portfolio/.claude/skills/bookmark/` — skills at project level only fire when CWD is inside that project. When the writing-topic workflow showed up with the same cross-project requirement ("I want to capture an idea while working in planner-app"), the fix was obvious: both skills belong at workspace level, pointing at scripts that live in `portfolio/scripts/` by absolute path. The original placement wasn't caught during 4a.6 because there was no second skill to triangulate against — the gap became visible only when amendment 4 put pressure on the same seam. Takeaway: the first skill in a category is easy to misplace because its "works from here" boundary looks like the natural boundary; the second one reveals which boundary was actually load-bearing.

**Meta move: bookmarked this planning conversation as the test fixture for the very amendments it produced.** `src/content/transcripts/drafts/plan-iteration-example.json` captures 7 turns — the initial improvement request, my v1 recommendations and questions, the user's answers, the v1 plan rejection with the review-in-UI feedback, the v2 rewrite, the approval, and the bookmark instruction itself. Every `kind` the new classifier is meant to detect (`plan`, `headline`, `verbatim`) is represented naturally because the conversation *produced* those kinds. When the classifier lands, this draft is the first thing it runs against. When the preview harness lands, this draft is the first thing rendered. When the Astro component lands, this draft is the first thing embedded. The fixture and the feature grow together — a stronger validation loop than any synthetic test case could build.

## 2026-04-12 — Chunk 4a.6: transcript capture workflow — automating the expensive step, not the judgment call

Shipped the transcript capture infrastructure in a single session as a standalone chunk (commit `f61060f`): `scripts/bookmark-transcript.mjs`, `scripts/promote-transcript.mjs`, the `/bookmark` skill, the `transcripts` Zod content collection, and the `/session-end` Step 0.5 draft-review prompt. This chunk was explicitly designed to be built independently of the rest of chunk 4 — it touches no Astro pages, no components, no CSS — so it could run in parallel with any other portfolio work.

**The design philosophy here is: automate everything downstream of the judgment call.** The expensive step is deciding "is this moment worth keeping?" That judgment is cheapest in the moment, with full context, when the significance is fresh. Everything downstream — extraction from the JSONL, redaction of paths and emails, structural validation, the draft/promote lifecycle — is mechanical and was automated. The `/bookmark` skill is designed to be invoked in two words: `/bookmark <slug>`. The note is optional. The review is deferred. The skill returns in under a second so the conversation can continue without break. This is the "capture workflow judgment" principle from memory applied at the tooling level.

**The JSONL parsing required some care.** Claude's session files contain more noise than signal: `isMeta: true` injections (system reminders, local command stdout, caveat wrappers), tool result turns (which arrive as user-type messages but are system-generated), and assistant turns where the only content is tool_use blocks with no text. The filter logic in `bookmark-transcript.mjs` handles all three: skip isMeta, skip turns where all content is tool_result, skip string-content turns that start with known system tags. What remains is the actual conversation — the turns that read as a conversation, not as plumbing. The collapsed tool labels (`[Read path]`, `[Bash: ...]`) give readers enough context to understand what Claude was doing between turns without burying them in raw JSON.

**The `_capturedAt` field enables the `--extend` flag to work correctly.** On a first bookmark, the draft stores the current ISO timestamp in `_capturedAt`. If `--extend` is passed later, the script reads that timestamp, filters the JSONL to events after it, and appends only the new turns. This means extended bookmarks don't double-count turns from the first capture — the draft grows linearly with the conversation rather than re-extracting from the start. The `_capturedAt` field is stripped during promotion so it doesn't surface in the published schema.

**First-use gate still open.** The plan requires bookmarking and promoting one real transcript before chunk 4b starts, to validate the pipeline end-to-end under real conditions. That gate runs in the next portfolio session.

## 2026-04-12 — Card deep-dive v3 + v4: how deep to go on the gradient, and why sizing drift is a system bug

Follow-up to v2 in the same day. The user came back with two pieces of feedback that sent the exploration in directions I hadn't anticipated: *first*, pin layout A (top 160px strip) from the v1 shortlist and actually render all six v2 visual types inside it so we could see whether they hold up at strip scale; *second*, when the imagery is a text mark like a numeral or monogram, stop using the signature gradient and use the card's register colour instead, because "the visual identity weakens when a lot of the cards are using the gradient effect, it becomes confusing and unpleasing on the eye." The second one is the critique I should have caught myself in v2 and didn't.

**The gradient overuse problem is a separation-of-concerns failure, not an aesthetics failure.** v2 used the royal → violet gradient as a fill for every text mark because the gradient was "nice." That collapses the work/writing register split — both numerals render in the same royal-to-violet wash regardless of card type, and the page loses the signal that one card is a case study and the other is an essay. The fix is mechanical: text marks use `royal-8` for work, `violet-8` for writing, nothing in between. The gradient still exists — it lives on the `gradient-mark` visual type and on featured card borders — but it stops leaking into every card that happens to use a number. Three signals now reinforce the register split (kicker colour + tag colour + text mark colour) instead of one gradient obliterating it.

**v3 shipped, the user reviewed, then came back with four more refinements.** The response was "for #1 it looks much better" followed by four targeted critiques: (a) sizing was inconsistent between icon / monogram / numeral; (b) the screenshot auto-tint was still reading as gradient because the opacity (0.55) let source hues bleed through; (c) the Geist Mono monogram clashed with the Fraunces numeral; (d) the new text mark colours felt too light compared to the original gradient shades they replaced. Every critique was correct. v3 was solving the *rule* (card colour, not gradient) but hadn't followed through on the *consequences* (sizing needs to unify now that the treatment does; tints need to bite harder; fonts need to be siblings; shades need to match the original anchor weights). v4 caught all four in a single pass.

**The sizing drift was the most embarrassing.** v3 had numeral at 112px Fraunces, monogram at 44px Geist Mono, icon at 68px SVG — three totally different sizes in the same strip, on the same component, rendered as if they were related. When I centred them each in a separate CSS block with no shared shell, I was writing them as three designs instead of three flavours of one design. The v4 fix introduced a shared `.strip.v-numeral, .strip.v-icon, .strip.v-monogram` rule with common background, padding, ruled texture, and centring — then the content-specific rules only set size and colour. Numerals 120px, monograms 72px, icons 88px. All three render at sibling weights in the same frame. The fact that I had to be told this is a workflow signal: when you're writing three instances of the same pattern, extract the shell first and only fight about the content. I should have spotted this during v3.

**The deep-tint fix is a one-line opacity change with a surprisingly big consequence.** v2/v3's screenshot auto-tint was `mix-blend-mode: color; opacity: 0.55`, which at 55% blend keeps ~45% of the original image's hue visible — enough that a deliberately off-palette source (the magenta → yellow → cyan fake screenshot I used for testing) still reads as a mixed palette, not a locked royal. Bumping opacity to 0.9 locks the colour almost completely. The proof is still in the artefact — the same raw gradient photo renders as flat royal on the work card and flat violet on the writing card. This is the difference between "the tint is applied" and "the tint owns the pixel." For zero extra author effort on any future screenshot the author drops in, that's a better default.

**The Fraunces/Geist Mono mismatch was a "respect the family" problem.** v3 used Fraunces for the numeral (a display serif) and Geist Mono for the monogram (a monospace sans). Both are in the Royal Tonal type system, both are legitimate choices in isolation, and side-by-side on a grid they looked like two different projects pretending to be one. v4 unified on Fraunces for both — monogram sits at 72px with tight letterspacing and reads as a confident display lockup, not a caption. Monograms like `PLN` and `R/W` are short enough that Fraunces handles them without the typesetting constraints that normally push initials into mono. The monospace alignment argument for monogram didn't survive one look at the result.

**The M5 + M6 combined question was the cleanest part of the session.** Mobile screenshots don't fit Layout A's 2.6:1 strip cleanly at any obvious scale (phone screens are ~1:2.16), so v3 mocked six solutions. The user liked M5 (meta split: big numeral + tilted phone) and M6 (UI detail zoom) and asked whether using both on one page creates hierarchy or visual noise. My view: hierarchy. M5 anchors *one* card by number — "this is piece 01, start here" — and M6 supplies the body vocabulary for every other work card. Max one M5 per grid is the rule. The risk isn't busy-ness (both compositions are clean); the risk is that both want to be the standout card if used at equal frequency, which flattens the very hierarchy they're meant to create. v4's §3b shows a four-card 2×2 with one M5 anchor and three M6 bodies, and the ordering signal reads immediately. One caveat flagged in the doc: on `/work` and `/writing` index pages where every card is a flat list, skip M5 entirely — with no obvious "first" card, the big 01 numeral is noise.

**The iteration trail is now four versions deep and the "rejected trail" is the interesting part.** v1 (six layouts), v2 (mandatory imagery + auto-tint + writing differentiation), v3 (layout A pin + gradient rule change + mobile exploration), v4 (sizing + deep palette + combined mobile). All four files live in `plans/portfolio-stitch-assets/` as committed artefacts. A case study about the card component design process — which is almost certainly going to be one of the portfolio's case studies, because this IS the process — can tell a genuinely interesting story by walking through the rejected options and explaining *why* each one was wrong. "We rejected layout D (corner accent) at v1 because corner accents collapse at strip scale" is a better sentence than "we chose layout A." The iteration trail discipline is paying for itself.

**What this session got right.** The user was specific about every piece of feedback — no vague "I don't love it," always "the sizing is inconsistent" or "the font mismatch is jarring" — and v4 was able to catch every item in a single pass because the critiques were all actionable. The shared-shell extraction in the CSS wasn't just an aesthetic fix; it made the v4 refinement pass trivial (change one rule, all three types update). Preserving v3 alongside v4 even though v4 supersedes it kept the rejected-trail story intact.

**What this session is at risk of getting wrong later.** Two open questions survived into v4 and need to be resolved before the card spec locks: *first*, does the `gradient-mark` visual type stay in the default author's pool or drop to a reserved slot for featured cards + palette-as-subject writing posts only? The consistent answer given the deep-palette rule is to reserve it — if the whole point of v4 is to make the gradient rare and meaningful, then keeping gradient-mark as a default filler option contradicts that. But if the portfolio ships with several palette/colour/system writing posts, they'll need gradient-mark available without special permission. *Second*, do M5 and M6 become explicit `image.kind: "mobile-screenshot-hero" | "mobile-screenshot-detail"` sub-types in the Card props API, or do they live as capture-time decisions handled by the `<Screenshot>` helper? My lean is the helper — keep the Card API surface `kind: "screenshot"` and compose M5/M6 in `<Screenshot>` — but the user hasn't called it yet.

**Next:** User review of v4. If the two open questions land and v4 decisions lock, the card component spec freezes and chunk 4b (case study content hierarchy) can start. Chunk 4a.4 / 4a.5 / 4a.6 (foundation work — writing style guide, ideas diary, transcript capture tooling) still need to finish before 4b opens, so 4b is realistically two to three sessions away.

---

## 2026-04-12 — Card deep-dive v2: mandatory imagery, auto-tint, and a differentiation question that answered itself

The v1 card deep-dive closed last session with a recommendation of layout D (corner accent) and an open question about imagery: should it be optional (risk: cards with and without images read as different species) or mandatory (risk: heterogeneous visual types scattered across the grid with no unifying language). v1 dodged by making imagery optional and letting layout D absorb the mixed state. v2 had to commit either way. The user picked mandatory and asked the right follow-up — *how do you make six different visual types cohere on one page*.

**The answer is three locks, not one lever.** Frame, palette, treatment. The frame is the strongest single lever: every image lives in the same 64×64 rounded rectangle with the same border, the same inset, the same pin position, the same hover behaviour. Whatever content fills the frame, the container never changes. The second lock is palette adherence — every image has to resolve to royal or violet tones, no raw hex allowed. The third lock is shared treatment — same hover, same inner shadow, same corner accent position. Individually each lock is obvious. Collectively they mean six visual languages (screenshot, diagram, numeral, gradient-mark, icon, monogram) can sit next to each other on one grid and still read as one system.

**The tint automation was the session's actual technical breakthrough.** The user asked a question I had not thought through: *can tint be done at the component layer without the author processing screenshots manually?* I had been planning a manual tint pass as part of the screenshot workflow — author exports a screenshot, author applies a Photoshop tint, author saves the tinted version into `/public`. That is exactly the kind of friction that dies the first time the user is tired. The answer turned out to be `mix-blend-mode: color` on a `::after` overlay. The blend mode preserves the image's luminance (shadows, highlights, shape detail) but replaces the hue entirely with the overlay colour. One CSS rule on the component, zero author effort, and crucially it works on *arbitrary* input — I proved it in the v2 artefact by using a deliberately off-palette "photo" (magenta → yellow → cyan gradient) as the test case and rendering it in royal tones. The author drops in a raw screenshot tomorrow, the component pulls it into the palette. This is the right shape of automation: the expensive cognitive step (picking the screenshot) happens once in-flow, everything downstream is mechanical.

**The writing differentiation question resolved itself during drafting.** v1 used a left-edge violet stripe to mark writing cards as a distinct register from case study cards. The user wanted it gone and asked for alternatives. I mocked four: top rule, kicker dot, kicker icon, tinted corner frame. Then I mocked a fifth called "baseline" — nothing structural, only kicker colour and tag colour doing the work. The moment I looked at baseline next to the mandatory-imagery cards from §2, I realised the tinted corner was already happening on every writing card as a consequence of the auto-tint rule (violet overlay instead of royal). That meant "baseline + tinted corner" was the free answer — the tint was already earning its keep, it just needed to be recognised as the differentiation lever instead of treated as an incidental. Three reinforcing signals (violet kicker + violet tag + violet-tinted corner) on a small surface is already enough. The top rule and kicker icon variants survive in the doc as fallbacks if real content doesn't read clearly enough once the `/writing` index is populated, but my prediction is that it will.

**The whole-card click pattern is the boring a11y-correct one.** Visible anchor stays on the heading (keyboard focus ring lands on the title, screen readers announce one link with the title as the accessible name), and a `::after` pseudo-element on the link stretches `inset: 0` over the whole card to extend the hit target. Tags sit on `z-index: 2` so if they become real links later, they stay independently clickable. Text selection still works because the overlay has no background. Nothing surprising — this is Heydon Pickering's canonical "cards" pattern — but worth writing it down once in the v2 doc so it's frozen as the spec before implementation.

**What this session got right.** The user's question about tint automation was the right question to ask, and the answer changed the authoring cost of the whole imagery system. The "baseline + tinted corner" recognition saved a visual element the portfolio didn't need. The iteration trail discipline held — v1 was left intact next to v2 in the plans folder, so the "here's what we rejected and why" story is still readable. The backfill commit cleaned up seven accumulated artefacts from prior sessions that should have been committed earlier, including the full accent-palette-explorer v1→v5 trail and card-deep-dive-v1 itself.

**What pends.** The user has to review v2 and confirm baseline + tinted corner is the right call (or pick one of the structural fallback variants). Then this becomes the locked card component spec and chunk 4b (case study content hierarchy) can start. The six visual types need to map to real content as soon as 4b defines the case study slots — which type belongs on the Planner App card, which belongs on the The Weekly card, which belongs on the writing posts, etc. That mapping is not urgent for 4b itself but will determine the first real test of whether the frame + palette + treatment locks actually hold under mixed content.

**Next:** User review of v2, pick a differentiation variant, lock the card spec, start chunk 4b.

---

## 2026-04-12 — Transcripts as a first-class artefact, and why the bookmark happens in-flow

The portfolio is largely a "learning to ship with Claude Code" narrative, and that narrative lives or dies on whether the reader believes the reasoning in the case studies is real. Claimed reasoning — "I considered X and chose Y because Z" — is worth roughly nothing in 2026; every AI-assisted portfolio says the same sentence. Shown reasoning, as a verbatim exchange between me and Claude where the decision actually happens, is worth a lot more, because it can't be fabricated without it reading fabricated. This session turned that observation into a plan amendment.

**The decision that shaped everything downstream was about when the judgment call happens, not how the capture works.** My first instinct was to build a post-hoc capture tool: run a script at session end, select a range, extract. The user rejected it in one sentence — "I don't want to have to trawl back through later" — and the whole architecture flipped. The expensive cognitive step is "is this moment worth capturing?" and that step is cheapest *in the moment*, when context is fresh and judgment is sharpest, not at session end when the session is a blur. Post-hoc capture forces the user to re-read their own session looking for moments they already half-forgot. In-flow capture lets the user burn one slash command at the exact instant of recognition and move on. Every other design decision falls out of that: the `/bookmark` skill is just the cheapest possible way to mark the moment without breaking flow, and everything afterwards (extraction, storage, formatting, redaction) is mechanical and has to be automated so it never competes for attention.

**Three things are first-class artefacts now, not two.** The amended 4a.3 imagery standards doc opens with "Cutler-influenced sketch aesthetic for diagrams, Royal Tonal-framed screenshots of real artefacts, verbatim chat transcripts as a first-class artefact type, no figurative illustration." Transcripts get the same treatment as diagrams and screenshots: a frame spec (dark Royal Tonal 950 background, 12px radius, sender labels in Geist Mono, Claude in Royal Tonal 500 and Dylan in 300, quiet hairline separators between turns), a placement rule (Process and Lessons sections only, never Hero/Problem/Outcome), a length rule (2 to 8 turns, tool calls always collapsed to a one-line label), and a non-negotiable verbatim rule. The last one matters most — the credibility of a transcript embed comes entirely from its rawness. The moment a reader suspects a transcript has been tidied up, the signal inverts and it starts reading like marketing. Never edit turn text, never reorder turns, never combine turns from different sessions, never add turns that didn't happen. If the real transcript doesn't make the point, pick a different moment or tell the story in prose.

**The word budget rule was a small but important guardrail.** Transcript embeds count as 50 words against a section's word budget regardless of actual turn length. The math doesn't matter; the discipline does. Without a budget cost, embeds start being used to pad thin sections, and the case study becomes a scrapbook of Claude quotes with connective tissue between them. With a 50-word cost per embed, a Process section (200-word budget) can carry one embed comfortably, a second is painful, and a third is structurally impossible. That's the right shape — transcripts earn their place by being pivotal, not by being plentiful.

**A new chunk 4a.6 absorbed the tooling work so 4b could stay pure.** The original plan sequence was 4a → 4b (template) → 4c (layout) → 4d (workshop). Capture tooling doesn't fit cleanly in any of those; it's foundation work, but it's portfolio-repo code rather than workspace-repo prose. Adding 4a.6 as the last sub-chunk of 4a keeps the foundation phase together while giving the tooling its own commit: define the `transcripts` content collection with Zod schema at `src/content.config.ts`, build `scripts/bookmark-transcript.mjs` (locate the active session JSONL by mtime, extract N turns, collapse tool calls to one-line labels, run a redaction regex pass, write to `src/content/transcripts/drafts/`), build `scripts/promote-transcript.mjs` (validate, re-run redaction, print a hand-review checklist, move from drafts/ to published), create the `/bookmark` skill, wire draft review into `/session-end`. The first-use gate is non-negotiable: bookmark one real moment from the next session and promote it end-to-end before chunk 4b starts. Any friction — wrong default window, regex missing something, session file not locatable — gets fixed before it hits the-weekly workshop.

**The `<ChatTranscript>` component is deliberately deferred to 4c.1, not 4a.6.** Keeping the data pipeline (4a.6) separate from the render layer (4c.1) lets drafts start accumulating immediately — from the very next session — without blocking on a component that would waste time to build before the layout mockups have decided what its frame even looks like. Same split-the-content-from-the-presentation pattern that shaped chunk 4a.3's Puppeteer + `<Screenshot>` split. When the component finally gets built in 4c.1, both `case-study-v1.html` and `case-study-v2.html` have to render at least one inline transcript and one breakout transcript using real bookmarked content, so the layout decision is made against real reading experience, not placeholder Lorem.

**What this session got right.** The user framed the problem, I drafted an initial plan with a capture script, the user pushed back once on timing, I rebuilt the plan around in-flow capture, the user approved, and I amended the four affected files (4a.3 standards doc, 4a.6 new chunk, 4b template, 4c.1 layout requirements) plus the top-of-file plan status line. One session, one decision, four consistent edits. No tangents, no layout speculation, no component code. The plan amendment lands the whole change without writing a single line of production code — every implementation detail is captured in 4a.6's sub-steps so the next session can start executing.

**What this session is at risk of getting wrong later.** The biggest danger is the hand-review step quietly decaying into a rubber-stamp. Published transcripts with unredacted real names or paths the regex missed would be an editorial failure severe enough to shake credibility for the whole portfolio. The `/session-end` listing of pending drafts and the promote script's interactive checklist are both designed to make skipping review uncomfortable, but nothing is forcing it. The right moment to notice whether the discipline is holding is during 4d workshop — if the first real promote pass feels like friction, that friction is doing its job; if it feels frictionless, something is wrong. Noting it now so the 4d self-review catches it.

**Next:** Chunk 4a.4 is still the immediate next step (synthesise writing-style.md in the workspace repo). Chunk 4a.6 slots in after 4a.5, and its first-use gate (one bookmarked transcript, end-to-end) has to clear before 4b begins.

---

## 2026-04-12 — Chunk 4a.3: imagery standards, and why the frame is never baked in

Chunk 4a.3 closed with a 320-line standards doc at `plans/portfolio-imagery-standards.md`. The interesting part is not the standards themselves; it is that two of the five decisions landed on "separate the artefact from its presentation" and I had to be pushed to find one of them.

**The diagram tooling decision was clean.** Mermaid's `look: handDrawn` (powered by RoughJS) lets flowcharts render in a Cutler-style sketch aesthetic directly from a text source, through the `mmdc` CLI with a themeVariables block mapped to Royal Tonal tokens. The limitation is that `handDrawn` currently only supports flowcharts and state diagrams — 2×2 matrices, causal loops, and networks (three of Cutler's four archetypes) render in the default polished look, which breaks aesthetic coherence. The resolution was a hybrid: Mermaid for flowcharts, Excalidraw for the other archetypes, with both source files (`.mmd`, `.excalidraw`) and output SVGs committed to git. Neither tool alone covers the full archetype set without a forced compromise.

**The screenshot decision needed a push.** I drafted a shortlist (Skrin for Windows native, Ray.so for web, drop a tool and do it manually) and recommended Skrin. The user pushed back in one sentence: "look for other options. cant you use puppeteer or playwright to do it?" That was the better answer. Puppeteer is already installed as a design-workflow MCP, so there was zero setup cost I had been ignoring. The resolution: a two-layer system. Layer 1 is a Puppeteer script (`scripts/capture-screenshots.ts`, built in chunk 4d) that captures raw UI at standard viewports and saves as WebP — no frame, no shadow, no gradient. Layer 2 is an Astro `<Screenshot>` component (built in chunk 4c) that applies a single frame definition at render time — Royal Tonal gradient background, 16px outer radius, 32px padding desktop, 8px inner radius, subtle shadow. The framing lives in CSS variables, never in pixels. Change the gradient once, every screenshot updates.

**Why that split matters beyond tidiness.** If framing is baked into the screenshot file, the file is both the content and its presentation, and every style tweak is a re-shoot. If framing is applied at render time via a component, the screenshot file is just the content, presentation lives in one place, and iteration is free. The same logic shows up in other contexts: diagram sources separated from rendered outputs, content collections separated from layout components, design tokens separated from CSS. This session was the first time I wrote it down as a rule of thumb for imagery specifically. OG / social-share preview images are the exception — those are loaded outside the site so the frame has to be baked in. Solved with a second Puppeteer pass that screenshots the Astro-rendered component at 1200×630, deferred to chunk 6.

**The "no illustrations" decision was harder to write than to make.** Dylan is not an illustrator, commissioning is slow and expensive, AI-generated illustration now reads as an AI tell, and diagrams plus screenshots cover every visual need the case studies actually have. Writing "no figurative illustrations, ever" feels restrictive until you notice that the alternative is decorative imagery that adds nothing and corrodes credibility. The exception is typographic covers for writing posts (Fraunces title on a Royal Tonal gradient, optional geometric accent), generated with the same Puppeteer pipeline by screenshotting an Astro page at 1200×630. Deferred to chunk 5.5.

**The sourcing banlist was the easiest section to write.** Explicit rules are better than vibes: no stock photography, no AI-generated imagery of any kind, no Figma mockups presented as real screenshots, no competitor product screenshots without credit, no real user data in captures. The `handDrawn` RoughJS effect is explicitly allowed because it is deterministic vector output from a text source, not generative imagery. Naming the edge case before someone asks removes a future debate.

**What this session got right.** The research was efficient — Cutler's imagery aesthetic was already covered in `plans/portfolio-voice-research.md` from chunk 4a.1, and I caught it after opening that file rather than re-researching. The five-decision checkpoint before drafting let the user steer the doc without reading a 320-line draft cold. The Puppeteer + Astro component split is the kind of architectural decision that would normally surface during implementation in chunk 4d; catching it at the standards stage means 4d starts with a specific workflow instead of a tooling decision.

**What this session got wrong.** I recommended Skrin without considering Puppeteer, despite Puppeteer being in the workspace CLAUDE.md under "Design Workflow MCPs." The user had to name it. The lesson is narrow — when recommending a tool, scan the installed MCPs first — but worth noting because I had the right answer in my context and did not reach for it. I also guessed a Maggie Appleton URL (`drawing-invisible`) and hit a 404 when the real slug was `drawinginvisibles1`; CLAUDE.md already prohibits URL guessing, so this is a rule I already had and violated, not a new lesson.

**What pends.** Chunk 4a.4 synthesises voice research (4a.1) + diary audit (4a.2) + imagery standards (4a.3) into `.claude/rules/writing-style.md` in the workspace repo. The imagery section of that file is a compressed version of today's standards doc, not a copy. Chunk 4a.5 follows with the `ideas/DIARY.md` creation and `/new-idea` capture hook wiring, closing out the 4a foundation.

**Next:** Chunk 4a.4 — synthesise writing-style.md in the workspace repo.

---

## 2026-04-11 — Planner V1 planning: story map as a live artefact, and a writing post seeded from it

Session pivoted twice and ended up producing a reusable artefact, a deployed portfolio asset, and a seeded writing post. Ostensibly planning; in practice, the planning was the deliverable.

**What actually happened.** The user opened with "planner POC is done, let's plan V1 through `/new-feature`" and I started the Phase 1 interview as an "adding a feature to an existing project" archetype. Round 1 answers reshaped it: full redesign from UX flows down to tokens, Tailwind v4 migration folded into V1 rather than deferred, and a request to story-map all remaining features into iterative release slices based on priority (not bundled by theme). Archetype switched mid-flight to "full redesign + V1 scope expansion," which means Phase 3 (tokens) and Phase 5 (visual direction) come back into play. Session scope was Q8=C: produce the spec and UX flows this session, defer architecture and implementation to a follow-up.

**The format debate was load-bearing.** I offered to draft the story map as markdown tables first and convert to HTML later. The user redirected in one sentence: put it straight into a self-contained HTML visualiser with markdown export so iteration happens in the tool itself. I pivoted and built `planner-app/plans/v1-redesign/story-map.html` as a single file with drag-and-drop card movement, inline rename at every level (release names, skeleton groups, sub-steps, card titles, card descriptions), three spare releases, two spare skeleton groups, spare sub-steps, localStorage persistence, and markdown export. 29 seeded cards across 10 skeleton groups, sourced from the Phase I deferred list in the POC scope doc.

**Cross-device sync without a backend.** The user wanted to edit on the phone during the commute. I added URL-hash state sync: JSON to UTF-8 to base64 to URL-safe base64, copied to clipboard with a Share URL button, decoded on load with `history.replaceState` to clear the hash so refreshes do not re-apply stale state over later edits. To close the loop back to me, I wrote `decode-state.mjs` alongside the working copy so any share URL can be round-tripped into readable JSON without running the tool itself. Decoder supports `--file` input because long URLs blow past shell arg limits.

**The artefact ships with the portfolio.** Since the story map will end up in the portfolio anyway as evidence of process, I copied it to `portfolio/public/artefacts/planner-v1-story-map/index.html`, committed it (`002cc0e`), and pushed. Cloudflare auto-deploy picked it up. Live at `https://dylan-portfolio.magordyl.workers.dev/artefacts/planner-v1-story-map/`. Pre-commit hook ran astro check plus build cleanly. The working copy in `planner-app/plans/v1-redesign/` and the deployed copy in `portfolio/public/` are now two places that can drift; flagged as a watch item with a re-sync on demand.

**The writing post seed was the punchline.** Near the end of the session the user named the thesis out loud: *"Product and design artefacts should be code-first from now. AI enables creation of custom-built bespoke tooling in far less time than populating data in traditional SAAS tools and re-exporting it out to wherever it needs to go next."* The story map itself is the perfect primary example for that post because the reader is looking at the thing the post is arguing for. Captured as the first entry in a new `plans/portfolio-writing-brainstorm.md` doc with working title options, the thesis as a blockquote, the full feature inventory, comparisons against Miro/Figma/Notion/Airtable/Jira/Linear/whiteboard, six supporting arguments, four counterpoints, and three open questions. Status `[seed]`, do not draft until chunk 5.5.

**What this session got right.** HTML-first was the right call: the iteration surface and the portfolio artefact are the same file, so every edit the user makes from now on is also a content update for the eventual case study. URL-hash sync plus a decoder script means the "I need this on my phone" problem got solved with zero infrastructure and the data format is durable even if the tool vanishes. Hosting the artefact inside the portfolio repo inherits the deploy path for free. And capturing the writing post seed in the same session as the artefact means the post has its primary example locked in before it starts, not retrofitted.

**What this session got wrong.** First Bash call stuck on an internal error and had to be reissued. Offered markdown tables as the initial format when the right answer was obvious from context (portfolio-grade, iterative, user already flagged "visualisable"). Inconsistency between Q5 and Q10 on multi-user scope (no shared data vs sharing allowed); flagged it and dropped sharing rather than interrupting for a re-answer. Drift between working copy and deployed copy is a real risk that nothing currently guards against.

**What pends.** Phase 4 UX flows are blocked on the user iterating and locking the story map content. The V1 `/new-feature` run is paused between Phase 2 and Phase 4. Chunk 5.5 now has its first concrete writing post scope, but drafting waits for chunks 4a through 4d to finish.

**Next:** User iterates on the story map in the live visualiser. Once content is locked, a follow-up session picks up at Phase 4 (UX flows) of the planner V1 `/new-feature` run. Portfolio chunk 4a.3 (imagery standards) continues independently.

### Chat log: story map origin to Cloudflare deploy

Captured verbatim from the session transcript for eventual reference in the writing post. Runs from the first mention of "story map" through the deployment confirmation.

**User — 06:28**

> I would like to do a full redesign, from UX flows to tokens, for planner as well. Because when I originally started working on this project, I hadn't defined the improved design workflow yet. Other answers: Q1 — I want to story map all the remaining features into an iterative release plan and implement them in that order. Not bundled by theme, instead done based on the priorities I set. 2C 3B 4 skip this; I want to prepare a full story map to define release slices. Help me do that. 5C 6A 7 even though the week isn't up, I want to do the migration as part of implementing the redesign I mentioned. 8C

**Claude — 06:29**

> Got it. This significantly changes the shape of the work. Let me confirm what I think we're now doing, then ask round 2.
>
> **Revised framing:**
> - Archetype shift: not "adding features to existing project". This is a full redesign + V1 scope expansion. Phases 3 (tokens) and 5 (visual direction) come back in, not skipped. The Tailwind v4 migration folds into the redesign implementation rather than being a standalone Phase I.
> - Spec format: traditional spec bullets don't fit what you want. We'll build a Jeff Patton-style story map (horizontal backbone = user activities over time; vertical = stories ranked by priority; cuts across = release slices). The map itself is the spec.
> - This session's deliverables: (i) story map + release slices, (ii) UX flows for the full redesigned experience with slice markers. Architecture, tokens, visual direction, and implementation plan go to a follow-up session (or sessions).
> - Phase 0: timezone fix + JWT refresh as a correctness pass before V1 work starts.
>
> *(followed by Round 2 questions Q1–Q10 covering redesign ambition, aesthetic direction, primary surface, multi-user scope, etc.)*

**User — 06:39**

> 1C and D / 2E / 3 no / 4a / 5a / 6a, C, D, g / 7 wait till I'm free then snooze it. I want to be able to snooze until a specific time later today eg snooze 1PM / 8B / 9A / 10E
>
> make sure the story map is in a format I can easily visualise. I want to be able to amend the release names and move items between releases easily

**Claude — 06:42**

> One quick inconsistency to flag before the draft: Q5=A (fully separate accounts, no shared data) and Q10=E (includes "inviting/sharing with another user") conflict. I'm interpreting this as "other people can sign themselves up, there's no in-app invite or sharing" — dropping the sharing column. Say so if wrong.
>
> **Story map format plan:**
> - Iteration format (this session): vertical markdown — one section per release, stories grouped by backbone column. Easy to rename releases (edit heading), easy to move items (cut/paste bullets), renders fine in VS Code preview.
> - Final artefact (after content approval): self-contained HTML visualiser with drag-drop editing, 2D grid view, export-to-markdown button. Saved to `planner-app/plans/v1-redesign/story-map.html` as a portfolio-grade deliverable per the CLAUDE.md design-artefact rule.
>
> Content first, visual polish after — otherwise we're polishing something we'll throw away.
>
> *(followed by a first-draft markdown story map with R0 correctness pass, R1 redesign rebuild, R2 daily loop wins, R3 depth, R4 rhythm, R5 admin)*

**User — 06:45**

> I want you to put this straight into the self-contained html visualiser with md export it'll be easier for me to amend it that way.
>
> make sure I can rename the release, and add in 3 spare releases in case I want to slice them more finely. also ensure I can rename the workflow steps (both skeleton and next level down), and include a few spare steps there. finally, include some additional context with each of the feature cards beyond just it's name. I need just a bit more to fully remember each feature that was in the plan and what it was for

**Claude — 06:51**

> Building it now. Creating the directory, then writing the self-contained HTML with drag-drop, inline editing, 3 spare releases, 2 spare skeleton groups with spare sub-steps, descriptions on each card, markdown export, and localStorage persistence.

**User — 07:01**

> You got stuck on the bash command, try again

**Claude — 07:01**

> Directory created. Writing the HTML visualiser now.

**Claude — 07:04**

> Done. The story map visualiser is at `planner-app/plans/v1-redesign/story-map.html`.
>
> **What's in it:**
> - Backbone (skeleton row): Onboard · Capture · Organise · Schedule · Remind · Act · Review · Admin · Spare 1 · Spare 2
> - Sub-steps (27 total) — including 4 blank spares under the two Spare skeletons
> - Releases: R0 Correctness pass · R1 The Redesign · R2 Daily Loop Wins · R3 Depth & Control · R4 Rhythm · R5 Polish & Admin · Spare A · Spare B · Spare C
> - 29 seeded cards with title + one-sentence description each
> - R1 has a prominent cross-cutting note on the release label (Tailwind v4 migration, new tokens/fonts/type scale, mobile-first PWA shell)
>
> **What you can do:**
> - Drag any card between cells to move it between releases or workflow steps
> - Click any text (map title, skeleton name, sub-step name, release name, release notes, card title, card description) to edit inline
> - Hover a cell → `+` button to add a new card in that cell
> - Hover a card → `×` button to delete
> - Export Markdown → downloads `planner-v1-story-map.md` as a clean grouped snapshot
> - Reset → restores the seeded content
> - localStorage persists everything automatically — your edits survive reloads
>
> When you're happy with the content, click Export Markdown and share the file back to me — that becomes the canonical spec for Phase 4 (UX flows).

**User — 07:04**

> how can I access it on my phone remotely?

**Claude — 07:05**

> Three options, cheapest to best, plus one caveat.
>
> **Caveat first:** The file uses localStorage to persist edits. That's per-device, per-browser — so edits made on your phone won't appear on desktop (and vice versa). For pure viewing this is fine. For cross-device iteration it's not. I can add cross-device sync if you need it.
>
> **Option 1 — Local network (same WiFi, fastest):** `python -m http.server 8000` from the folder, open `http://<laptop-LAN-IP>:8000/story-map.html` on the phone. Free, instant, private. Only works when both devices are on the same Wi-Fi network.
>
> **Option 2 — Public URL via Netlify:** `netlify deploy --dir=.` — one-off draft URL, ~10 seconds. Public by default.
>
> **Option 3 — Cloudflare Quick Tunnel:** `cloudflared tunnel --url http://localhost:8000` — temporary `trycloudflare.com` URL, dies when you close the terminal.
>
> **If you want real cross-device sync:** I can add a "Copy shareable URL" button that base64-encodes the current state into the URL hash (`#state=...`). Open that URL on any device, state loads. No backend, no accounts, no localStorage collision. Say the word and I'll wire it up — 15-minute change.

**User — 07:07**

> add the cross-device sync url, and make sure you do it in a way that I can give you that url back and you know what the state means.
>
> can you host it ok CloudFlare workers as part of the portfolio project? it'll need to be there eventually anyway as part of the portfolio

**Claude — 07:10**

> I'll do this in phases: (1) update the HTML with URL sync, (2) write a standalone decoder I can rely on, (3) explore the portfolio structure, (4) wire up deployment.
>
> *(Phase 1: added `Copy Share URL` toolbar button, `encodeState` / `decodeState` functions using TextEncoder + btoa + url-safe replacement, updated `loadState` to consume `#state=` on load and `history.replaceState` to clear the hash.)*
>
> *(Phase 2: wrote `decode-state.mjs` — standalone Node ESM script accepting URL, raw b64, or `--file <path>` for long URLs exceeding shell arg limits.)*
>
> *(Phase 3: explored portfolio structure, confirmed `public/` serves as static assets, chose `public/artefacts/planner-v1-story-map/index.html` as the deployed location.)*
>
> *(Phase 4: checked portfolio git state, committed as `002cc0e` with pre-commit hook running `astro check && astro build` — clean pass. Pushed to main. Cloudflare auto-deploy picked it up.)*

**Claude — 07:18**

> Pushed clean to main (`04caaaa..002cc0e`). Cloudflare auto-deploy should complete in ~1–2 minutes.
>
> **Your live URL:** `https://dylan-portfolio.magordyl.workers.dev/artefacts/planner-v1-story-map/`
>
> **What you now have (in the browser at the live URL):**
> - `Copy Share URL` → copies a URL with the full state base64-encoded in the hash. Send it to yourself on another device → opens with identical state.
> - `Export Markdown` → downloads a clean `.md` snapshot
> - `Reset` → restores the seeded content
> - Drag-drop cards, inline-edit everything, auto-save to localStorage
>
> **How the cross-device flow works:** localStorage is per-device, so raw edits don't sync. When you want to move state to another device, click Copy Share URL and open the pasted URL there. On load, the state is consumed from the hash, written to that device's localStorage, and the hash is cleared — so subsequent refreshes don't re-apply stale state. Continue editing; generate a new Share URL when you want to move state back.
>
> **Sharing state back to me:** paste the full `#state=...` URL in a message. I have a standalone decoder at `planner-app/plans/v1-redesign/decode-state.mjs` that accepts the URL directly or reads from a file (for URLs long enough to exceed shell arg limits):
>
> ```bash
> node decode-state.mjs "<url>"
> node decode-state.mjs --file url.txt
> ```
>
> The encoding is documented inline in the HTML and in the decoder so it's deterministic — no guessing.
>
> **Files created/modified:**
>
> | Path | Purpose |
> |---|---|
> | `planner-app/plans/v1-redesign/story-map.html` | Source of truth (working copy) |
> | `planner-app/plans/v1-redesign/decode-state.mjs` | Standalone Node decoder for share URLs |
> | `portfolio/public/artefacts/planner-v1-story-map/index.html` | Deployed copy (committed + pushed as `002cc0e`) |
>
> **Flagged:**
> 1. The deployed copy is public. Anyone with the URL can see the story map content. Fine for this artefact, keep in mind for future ones.
> 2. Two copies now exist. Working copy and deployed copy can drift. Re-sync on request; no auto-build step wired.
> 3. Deploy may take 1–2 min. 404 right after push is normal.
>
> Once you've iterated the content to a place you're happy with, share the Share URL back and we can kick off Phase 4 (UX flows) from the locked story map.

---

## 2026-04-11 — Chunk 4a.1 + 4a.2: voice research, diary audit, and the gap that only showed up at the end

The session that was meant to produce a voice study and a diary audit ended up exposing a structural gap neither artefact was looking for. Captured here because the gap is the most important output.

**What actually happened.** Chunk 4a.1 was voice research on Wes Kao (7 posts, storytelling focus) and John Cutler (6 top posts, illustrations + complex messages + relatability). That part went cleanly. I also tried to extract "Dylan's voice" from existing ideas files, diary entries, and CLAUDE.md prose. The user corrected me in one sentence: all of those artefacts were written by Claude on the user's direction, so I had been analysing Claude's voice, not the user's. The user confirmed no long-form user prose exists anywhere Claude Code can read. This reshaped the whole plan: Dylan's voice gets built deliberately in chunk 4d through real case study writing, not extracted from samples in 4a. The 4a style guide splits into Part 1 (structural guidance, lockable now from Kao and Cutler) and Part 2 (style guidance, guard rails only in 4a, discovered in 4d). The voice research doc got fully rewritten, including scrubbing 39 em-dashes because the user explicitly called em-dashes out as the #1 AI tell to avoid.

**The diary audit was the real discovery.** I read the last ten entries of each of the four project diaries (48 entries total) through a hiring-manager lens across five signal categories: product thinking, decision-making under uncertainty, technical judgement, honest reflection, narrative shape. Technical judgement is near-best-in-class. The other four vary, but product thinking is the biggest gap by a wide margin. Of 48 entries, exactly one (planner-app Phase H, the "task marked done, no SMS sent" end-to-end test) centres a product claim. Everything else is an engineering log. Every entry could answer "what code changed" but almost none answer "what does the user get that they did not have before."

**The gap that the audit did not predict.** Near the end of the audit review, the user asked whether `ideas/` has its own diary. It does not. That absence is the structural cause of the product-thinking gap in every other diary: the four project diaries all start once an idea is already approved and scoped, which means every upstream moment (noticing the pain, weighing alternatives, killing a direction based on research, pivoting on pricing, choosing one idea over five in INDEX) leaves no trace anywhere. A case study can only say "I built this." It cannot say "I decided to build this instead of X, Y, Z because research told me W." That is the most valuable product-thinking signal a portfolio can carry, and it was invisible to the audit until the user named the missing artefact. The fix is chunk 4a.5: create `ideas/DIARY.md`, wire the capture trigger into `/new-idea`, write the first entry retroactively from the habit-correlation research arc. Captured in the audit doc as the fifth implication, in memory as `project_ideas_diary_gap.md`, and as task #7 in the task list — three places because the user flagged it explicitly as must-not-lose.

**What this session got wrong.** I attributed Claude-authored prose to the user as voice data and had to throw that work away. I used em-dashes throughout the first draft of the voice research doc despite the whole point of the doc being a list of AI tells to avoid. And the diary audit missed the `ideas/` gap until the user pointed at it, which is a failure of scope imagination: I audited "existing diaries" rather than asking "where in the workflow does product thinking happen, and is any of it being captured." The right version of the audit would have started there.

**What this session got right.** The voice research synthesis is load-bearing for 4a.4. The audit has concrete exemplars and concrete weak entries, which is the shape the style guide synthesis needs. And the `ideas/DIARY.md` gap, once named, has a clear fix with a retroactive first entry already written (in the habit-correlation folder). Three chunks out of five in the 4a sub-plan are now either done or have a well-specified action list.

**Next:** Chunk 4a.3 (imagery & illustration standards), then 4a.4 (synthesise style guide), then 4a.5 (diary capture rules + create `ideas/DIARY.md`). Commits for 4a.3 land in the portfolio repo; 4a.4 and 4a.5 commit to the workspace repo.

---

## 2026-04-11 — Chunk 1: Astro scaffold, Royal Tonal tokens, base layout

Scaffolded the portfolio project from scratch. Stack confirmed from Phase 6 architecture: Astro 5, React islands, Tailwind v4 via the `@tailwindcss/vite` plugin (not `@astrojs/tailwind`, which is the v3 integration), MDX, self-hosted Fontsource fonts.

Key outputs:
- `src/styles/globals.css` — full Royal Tonal token block (12-step colour scale, ink text scale, semantic aliases, type scale, spacing, radius). All tokens as CSS custom properties; Tailwind v4 reads them via `@theme` if we need utility-class access.
- `src/layouts/BaseLayout.astro` — head, sticky header, main slot, footer
- `src/components/astro/PageHeader.astro` — hamburger (placeholder), wordmark, "Get in touch" pill linked to LinkedIn
- `src/components/astro/PageFooter.astro` — LinkedIn + privacy link
- `src/components/astro/KickerLabel.astro` — 11px small-caps section labels in `--kicker` colour
- `src/pages/index.astro` — hero section with north-star statement

**Design decision:** Tailwind v4 dropped the `@astrojs/tailwind` integration in favour of a Vite plugin (`@tailwindcss/vite`). The `astro add tailwind` command detected this automatically and configured the right thing. CSS variable tokens live in `globals.css` — no `tailwind.config.mjs` needed for v4 (the `@theme` directive replaces it).

**Trade-off:** Hover effects on the "Get in touch" pill use inline `onmouseover`/`onmouseout` rather than a CSS class. This is intentional for a static `.astro` component — no React hydration cost for a visual effect. If we install the shadcn `Button` component in chunk 3, we'll swap to that and get proper focus ring styles too.

**Next:** Chunk 2 — content collection schemas and placeholder MDX entries.

---

## 2026-04-11 — Chunk 2: Content collections schemas + placeholder entries

Created all content collection infrastructure for the portfolio.

**Key discovery — Astro 6 breaking change:** The legacy `src/content/config.ts` location was removed. Astro 6 requires the config at `src/content.config.ts`, and every collection must use a loader (no more `type: 'content'`). The error was clear and the fix was mechanical — move the file and switch to `glob()` loaders.

**Second discovery — `z` from `astro:content` is deprecated in Astro 6:** Astro 6 now expects you to import `z` from `zod` directly rather than using the re-export from `astro:content`. Also `z.string().url()` is deprecated in Zod v4 (installed as transitive dep) — the new API is `z.url()` as a top-level validator.

Outputs:
- `src/content.config.ts` — Zod schemas for `projects`, `writing`, `log` collections; glob loaders; cross-collection `reference()` fields; `z` imported from `zod` directly
- `src/content/projects/` — 4 placeholder MDX files (the-weekly, planner-app, workspace-audit, portfolio)
- `src/content/writing/` — 1 placeholder post (welcome)
- `src/content/log/` — 5 real log entries reconstructed from project diaries (2026-04-07 → 2026-04-11)

**Design decisions:**
- Log entries reference project slugs via `reference('projects')` — optional field, so entries without a project (like the review skill entry) just omit it and pass schema validation
- `depth: 'full' | 'lightweight'` field on projects distinguishes full case studies from lightweight ones — drives rendering decisions in chunks 3-5 without schema migration
- `featured: boolean` controls landing page inclusion separately from `/projects` index — lets us show 2 projects on landing while all 4 appear in the index

**Next:** Chunk 3 — landing page full layout (BuildLogTicker, CaseStudyCard, asymmetric grid).

---

## 2026-04-11 — Chunk 3: Landing page V1 refined layout

Built the full landing page layout matching the Stitch mock (assets 12 and 13).

Outputs:
- `src/components/astro/BuildLogTicker.astro` — self-contained; queries the `log` collection internally, renders 5 most recent entries with date (Geist Mono), title, summary, and "All entries →" link. Bordered card container.
- `src/components/astro/CaseStudyCard.astro` — project card with placeholder gradient image area (real hero images in chunk 5), kicker label (Case Study / Lightweight based on `depth` field), Fraunces serif title, TL;DR, tag pills, "Read case study →" link. Full CSS hover state.
- `src/pages/index.astro` — full layout: 3:2 asymmetric hero grid (hero copy left, BuildLogTicker right), "Selected Work" 2-column project grid sorted by `weight` descending (shows all 4 projects), About teaser with short bio, closing quote in display-size italic serif.

**Design decisions:**
- Responsive grid via Astro scoped `<style>` block rather than inline styles — inline styles can't be overridden by media queries, so all layout-critical rules live in the style block. Token-based values (colours, spacing) stay inline where they were used before.
- Skipped shadcn `Button` install for now — the "Get in touch" pill in PageHeader already has working hover/focus styles and installing shadcn would require `components.json` init. Deferred to a later chunk when we have a real interactive component to justify the setup cost.
- All 4 projects shown in the grid (not just `featured: true`) — the weight ordering (portfolio 40, workspace-audit 30, planner-app 20, the-weekly 10) maps well to the 2x2 grid left-to-right, top-to-bottom.

**Next:** Chunk 4 — Case Study Workshop (critical gate). Voice reference research → template → the-weekly case study.

---

## 2026-04-11 — Repo extraction + Cloudflare Pages deploy

Noticed mid-session that portfolio was living inside the workspace monorepo (`claude-workspace`), while `planner-app` and `the-weekly-app` both had their own repos. Inconsistent structure — every push to the workspace (diary updates, design system work, unrelated plans) would have triggered a Cloudflare rebuild once Pages was connected.

**Migration steps:**
1. Created `magordyl/portfolio` (public) on GitHub
2. Initialized a new `git init` inside `portfolio/`, committed all source + copied portfolio plans from workspace `plans/` into `portfolio/plans/`
3. Pushed to new remote (`main` branch)
4. Removed `portfolio/` from workspace git tracking (`git rm -r --cached`), added to workspace `.gitignore`
5. Deleted the portfolio plan files from workspace `plans/` (now live in portfolio repo)
6. Updated both CLAUDE.md files to reflect new locations
7. Cleared the stale portfolio check from the workspace pre-commit hook (it was guarded by a `grep` so it never would have triggered, but it was dead code)

**Cloudflare Pages:** Connected to `magordyl/portfolio` via dashboard Git integration. The Cloudflare UI has drifted from documented screenshots — no framework preset picker, no explicit build output field. Used defaults + Save and Deploy. Build succeeded. Live URL: `dylan-portfolio.magordyl.workers.dev` (note: `.workers.dev` rather than `.pages.dev` — functionally identical for now; revisit if preview URLs become important).

**Key decision — repo per project:** The workspace should only contain workspace tooling (CLAUDE.md rules, design system, plans, diary). Every project that deploys gets its own repo from the start. This is now the established pattern.

---

## 2026-04-11 — Chunk 4 restructured: content-first, foundation expanded

Planning session, no code. Reshaped chunk 4 from a single "case study workshop" chunk into four sub-chunks and added two new chunks further downstream. Nothing shipped to the site; the deliverable is the updated `plans/portfolio-implementation.md`.

**What changed:**
- **Chunk 4** was previously "research voice → draft template → write the-weekly → lock". Now split into 4a (foundation), 4b (content template), 4c (layout mockups), 4d (writing workshop).
- **Chunk 4a** expands beyond voice research into a workspace-wide writing & imagery style guide. It incorporates (1) Kao + Cutler voice research, (2) a quick hiring-manager-lens audit of existing diary entries across all projects, (3) imagery & illustration standards (aesthetic, diagram conventions, sourcing rules), (4) synthesis into `.claude/rules/writing-style.md`, (5) retro-update of the diary capture rules so future entries arrive portfolio-ready. The style guide lives in the workspace repo, not portfolio — it governs all Claude-produced writing for me going forward.
- **Chunk 4b** is a new chunk: case study content hierarchy (sections, word counts, artefact slots) with no layout and no prose. Locks the template shape before any visual design happens.
- **Chunk 4c** layout mockups get built *against* the content structure from 4b, following the same HTML-explorer approach we used for the landing page. Covers case study, /projects, /writing index + post, /log, /404, /privacy — but NOT /about (moved to its own chunk).
- **Chunk 4d** is the writing workshop as originally conceived, now constrained by the locked template and layout. Writing only, no design decisions.
- **New chunk 5.5** — writing posts. Brainstorm + pick 3 + draft + iterate + lock as MDX. Ready to ship the moment chunk 6 builds the /writing routes.
- **New chunk 5.6** — /about as a one-off, because there's only one /about and it doesn't benefit from templating. Goals analysis → background research interview → content scaffold → HTML mockup → draft → iterate → ship.

**Why content-first:** initial proposal had layout mockups and content hierarchy as a single chunk. User pushed back — "content structure needs to come before layout is selected." Right call. The whole point of separating 4b and 4c is that content constraints dictate layout, not the other way around. It's a discipline thing — left unchecked, it's very tempting to sketch layouts while scoping content. Added this as an explicit risk in the plan.

**Key decision — style guide is workspace-wide, not portfolio-scoped.** When I asked whether the style guide should live in `portfolio/plans/` or `.claude/rules/` at the workspace root, the user picked workspace. Rationale: it governs diary entries, writing posts, case studies, and any other prose Claude produces. Scoping it to portfolio would duplicate concerns later. Consequence: chunk 4a commits to the workspace repo, not the portfolio repo. First chunk in the portfolio plan that does.

**Trade-off acknowledged:** revised v1 timeline is ~3–4 weeks of sessions, up from the original 1–2. Extra scope (imagery standards, diary audit, /about as its own chunk, writing posts as their own chunk) buys a materially higher quality ceiling. The style guide is load-bearing — it governs all future writing, not just the portfolio — so spending 1–2 sessions on it up front is worth the delay to first case study.

**Meta-observation on the planning conversation itself:** this is the second time I've proposed a multi-chunk plan and the user has reshaped it on content-vs-layout grounds. Worth noting as a recurring pattern — when planning creative/content work, default to content-before-design separation rather than interleaving them.

**Next:** Chunk 4a — foundation. Work starts in the workspace repo (writing-style.md + diary rules), finishes with a commit there. Once the style guide is locked, return to the portfolio repo for chunk 4b.
