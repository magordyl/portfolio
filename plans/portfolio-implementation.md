# Portfolio — Implementation Plan (Phase 7)

**Status:** In progress. Chunk 3 complete (2026-04-11). Chunk 4 restructured into 4a–4d (content-first), plus new chunks 5.5 (writing posts) and 5.6 (/about one-off) — 2026-04-11.

**Tailwind v4 gotcha discovered in chunk 1:** `astro add tailwind` installs `@tailwindcss/vite` (Vite plugin) not `@astrojs/tailwind`. No `tailwind.config.mjs` needed. CSS variables in `globals.css` are the token system. References to `tailwind.config.mjs` in this plan are obsolete — skip those sub-steps.

**Astro 6 content collection gotchas discovered in chunk 2:** (1) Config must be at `src/content.config.ts`, not `src/content/config.ts`. (2) Import `z` from `zod` directly, not from `astro:content` (deprecated). (3) Use `z.url()` not `z.string().url()` (deprecated in Zod v4). (4) Every collection must have a `loader` — `glob()` from `astro/loaders` is the standard choice.

Ten chunks to ship v1 (1–3 complete, then 4a → 4b → 4c → 4d → 5 → 5.5 → 5.6 → 6), plus one post-launch cleanup chunk (7). Each chunk is one commit's worth, independently testable, built on the previous. Chunk 4 is split into four sub-chunks following a **content-first sequence**: foundation (style + imagery + diary audit) → content template → layout mockups → case study workshop. Content structure dictates layout, never the reverse.

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
- `content/projects/planner-app.mdx`, `workspace-audit.mdx`, `portfolio.mdx` — same (placeholder only)
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

**Status (2026-04-12):** 4a.1 complete (`04caaaa`), 4a.2 complete (`04caaaa`), **4a.3 complete** (`plans/portfolio-imagery-standards.md` this session). 4a.4 next — synthesise all three into `.claude/rules/writing-style.md` in the workspace repo.

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

## Chunk 4b — Case study content hierarchy (template scaffold)

**Deliverable:** A locked case study template defined purely as content hierarchy — sections, what each section answers, target word counts, required artefacts (screenshots, pull-quotes, links). No layout, no prose.

This chunk exists specifically to make sure content structure dictates layout, not the reverse. The layout mockups in 4c build against this shape.

### Step 4b.1 — Draft template scaffold

Starting point for discussion:
```
Hero:          title + one-line TL;DR + tags + live link + primary image slot
Problem:       what was broken or missing + why it mattered (~80 words)
Process:       key product decisions + rejected alternatives + why (~200 words)
               [diagram slot: decision tree or architecture sketch]
Outcome:       what shipped + measurable result + screenshots (~80 words)
               [screenshot slot: 2–3 hero shots]
Lessons:       honest reflection, what would be done differently (~80 words)
Next:          related writing post OR next case study
```

### Step 4b.2 — Validate against the style guide

Check that every section has a clear home for the signals from `writing-style.md`:
- Where does **product thinking** live? (Process primarily, Problem secondarily)
- Where do **trade-offs** live? (Process — rejected alternatives)
- Where does **honest reflection** live? (Lessons)
- Where do **imagery slots** live? (Hero, Process, Outcome — each with purpose)

Adjust the scaffold until every signal has a home and every section earns its place.

### Step 4b.3 — Word count targets

- **Full case studies** (the-weekly, planner-app): 400–600 words body
- **Lightweight case studies** (workspace-audit, portfolio itself): 200–350 words body
- Each section gets a target band — writer knows when they're over budget

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

### Step 4c.1 — Case study page layout (primary focus)

This is the most important layout in the portfolio. It needs to:
- Fit the content hierarchy from 4b exactly
- Handle both full (400–600w) and lightweight (200–350w) variants gracefully
- Integrate imagery slots per 4a.3 (hero image, inline screenshots, diagrams)
- Work on mobile without degrading the reading experience
- End with a clear "next" artefact (related writing post or next case study)

Produce 2 layout options, pick one. Save both (`case-study-v1.html`, `case-study-v2.html`) — rejected options are part of the design trail.

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

**Acceptance:**
- the-weekly case study renders on `/projects/the-weekly` and visually matches the 4c.1 mockup
- User reads it and thinks "yes, I'd show this to a hiring manager"
- Template is locked — no more structural changes before chunk 5

**Commit:** `portfolio: the-weekly case study shipped (workshop complete, template locked)`

---

## Chunk 5 — Remaining case studies applied to template

**Deliverable:** planner-app (full), workspace-audit (lightweight), portfolio itself (lightweight) — all using the locked template and layout.

- Write `content/projects/planner-app.mdx` — full case study, 400–600 words
- Write `content/projects/workspace-audit.mdx` — lightweight, 200–350 words, meta-toned
- Write `content/projects/portfolio.mdx` — lightweight, meta, "this site is also a case study"
- Source imagery for each per 4a.3 standards
- `/projects` index page built from the 4c.2 mockup
- Bidirectional cross-links: case studies link to related writing posts; writing posts auto-render ProjectReferenceCard

**Acceptance:** All 4 case studies live at their routes. `/projects` index shows all 4 cards per the 4c.2 mockup. Cross-links work both directions.

**Commit:** `portfolio: remaining case studies and /projects index`

---

## Chunk 5.5 — Writing posts brainstorm + first batch

**Deliverable:** 2–3 writing posts, fully drafted, locked, ready to ship (the /writing routes themselves are built in chunk 6).

### Step 5.5.1 — Brainstorm

Generate a candidate list of 8–12 writing post ideas drawing from:
- Decisions made across workspace projects that have broader lessons
- Patterns noticed across the diary audit
- Commentary on things in the user's field (product thinking, engineering management, AI-assisted building)
- Posts that complement the case studies (not duplicate them — case studies are "what I built", writing is "what I think")

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

## Chunk 7 — Design system retrofit (post-launch, optional)

**Deliverable:** Portfolio's Royal Tonal tokens extracted into a `design.tokens.ts` that conforms to the workspace-wide schema. Zero visual change.

**Gate:** Chunk 6 must be shipped to production first. Do NOT attempt this during v1 build.

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
- **Chunk 7** — design-system retrofit: 0.5 session, opportunistic

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
