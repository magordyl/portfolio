# Development Diary

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
