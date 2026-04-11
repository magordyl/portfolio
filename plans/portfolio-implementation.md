# Portfolio — Implementation Plan (Phase 7)

**Status:** In progress. Chunk 3 complete (2026-04-11). Chunk 4 next.

**Tailwind v4 gotcha discovered in chunk 1:** `astro add tailwind` installs `@tailwindcss/vite` (Vite plugin) not `@astrojs/tailwind`. No `tailwind.config.mjs` needed. CSS variables in `globals.css` are the token system. References to `tailwind.config.mjs` in this plan are obsolete — skip those sub-steps.

**Astro 6 content collection gotchas discovered in chunk 2:** (1) Config must be at `src/content.config.ts`, not `src/content/config.ts`. (2) Import `z` from `zod` directly, not from `astro:content` (deprecated). (3) Use `z.url()` not `z.string().url()` (deprecated in Zod v4). (4) Every collection must have a `loader` — `glob()` from `astro/loaders` is the standard choice.

Six chunks to ship v1, plus one post-launch cleanup chunk (7). Each is one commit's worth, independently testable, built on the previous. The Case Study Workshop (chunk 4) is the critical gate — no case studies get written until the template is locked there.

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

## Chunk 4 — Case Study Workshop (THE CRITICAL GATE)

**Deliverable:** Locked case study template + the-weekly case study fully written.

This is a collaborative writing session, not a coding session. Until this is done, no other case studies get written.

### Step 4.1 — Research (NEW, per amendment)

Before drafting anything, analyse Wes Kao and John Cutler Substack posts for tone, content style, and writing advice. Produce a **"Voice & Craft" reference document** that the template will be built against.

**Scope:**
- **Wes Kao posts to analyse** — her most cited pieces on communication, clarity, executive writing, giving feedback, and "managing up". Target: 8-12 posts. Focus: sentence-level craft, how she opens, how she compresses ideas, her characteristic structural moves.
- **John Cutler posts to analyse** — his pieces on product decision-making, frames/lenses, "ways of working", and the honest messiness of PM work. Target: 8-12 posts. Focus: how he frames trade-offs, his use of analogies, how he resists both cynicism and naïve optimism.

**Method:**
- Use WebFetch to pull each post (no sub-agents — sub-agents don't reliably have WebFetch in remote-control sessions)
- For each post, extract: opening hook, thesis in one sentence, structural pattern (problem→frame→example→takeaway?), signature rhetorical moves, what's *absent* (e.g. no jargon? no self-promotion? no hedging?)
- Synthesise into `plans/portfolio-voice-reference.md` with:
  - **Tone rules** — what to emulate (e.g. "Kao opens with a concrete scene, not a definition")
  - **Structural patterns** — 3-4 repeatable shapes to steal
  - **Don'ts** — things to avoid (e.g. "Cutler never starts with 'In today's fast-paced...'")
  - **Applied to case studies** — how each rule maps to the Problem / Process / Outcome / Lessons sections

**Output:** `plans/portfolio-voice-reference.md` — feeds directly into step 4.2.

### Step 4.2 — Draft template scaffold

Propose a case study template structure:
```
Hero:     title + one-line TL;DR + tags + live link
Problem:  what was broken / missing (~80 words)
Process:  key product decisions + why (~200 words)
Outcome:  what shipped + screenshots + live demo (~80 words)
Lessons:  honest reflection, what I'd do differently (~80 words)
Next:     related writing post OR next case study
```

Target: 400-600 words total for full case studies, 200-350 for lightweight.

### Step 4.3 — First draft of the-weekly

Apply the voice reference and template to write the-weekly case study end-to-end.

### Step 4.4 — User rewrite pass

You rewrite in your voice (after reviewing the draft against the voice reference). This is where the template gets stress-tested.

### Step 4.5 — Iterate

Second draft. We iterate until both the template and the case study feel right. **Hard stop:** template locks after 2 full iterations of the-weekly, even if it's 80% right. Perfect is the enemy of shipped.

### Step 4.6 — Lock & build

- Save locked template to `plans/portfolio-case-study-template.md`
- `content/projects/the-weekly.mdx` ships with real body content
- `src/layouts/CaseStudyLayout.astro` built to render the template (hero, sections, related writing card at end)
- `src/pages/projects/[slug].astro` dynamic route

**Acceptance:**
- `plans/portfolio-voice-reference.md` exists and you approve it
- `plans/portfolio-case-study-template.md` exists and you approve it
- the-weekly case study renders on `/projects/the-weekly`
- You read it and think "yes, I'd show this to a hiring manager"

**Commit:** `portfolio: case study template workshop + the-weekly case study`

---

## Chunk 5 — Remaining case studies applied to template

**Deliverable:** planner-app (full), workspace-audit (lightweight), portfolio itself (lightweight) — all using the locked template.

- Write `content/projects/planner-app.mdx` — full case study, 400-600 words
- Write `content/projects/workspace-audit.mdx` — lightweight, 200-350 words, meta-toned
- Write `content/projects/portfolio.mdx` — lightweight, meta, "this site is also a case study"
- `/projects` index page — grid of all 4, newest first
- Bidirectional cross-links: case studies link to related writing posts; writing posts auto-render ProjectReferenceCard

**Acceptance:** All 4 case studies live at their routes. `/projects` index shows all 4 cards. Cross-links work both directions.

**Commit:** `portfolio: remaining case studies and /projects index`

---

## Chunk 6 — Secondary pages + deploy polish

**Deliverable:** Writing, log, about, privacy, 404 pages — and production-ready deploy.

- `src/pages/writing/index.astro` — chronological list
- `src/pages/writing/[slug].astro` — post with `ProjectReferenceCard` auto-rendered
- `src/pages/log.astro` — full build log, paginated if >20 entries
- `src/pages/about.astro` — typographic hero + bio + values + LinkedIn CTA
- `src/pages/privacy.astro` — APP-compliant privacy policy (PostHog disclosure, Cloudflare Pages disclosure, contact via LinkedIn)
- `src/pages/404.astro` — minimal, on-brand
- PostHog integration wired in `BaseLayout.astro`, funnel events instrumented
- Environment variables set in Cloudflare Pages dashboard
- Production deploy from `master`
- Test on real device (phone) + hiring-manager-style happy path walkthrough

**Acceptance:**
- All 8 route groups live
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

## Timeline estimate

- Chunks 1-3: 2-3 sessions (scaffold → content → landing). ~3-5 days wall-clock time.
- Chunk 4: 1-2 sessions. Writing-heavy; quality here determines quality downstream.
- Chunks 5-6: 2-3 sessions. Mostly mechanical once the template is locked.
- Chunk 7: half a session, whenever the workspace design-system has room.

**Total: ~1-2 weeks** for v1 (chunks 1-6). Chunk 7 is opportunistic cleanup.

---

## Risks / gotchas

1. **Shadcn-on-Astro edge cases** — shadcn assumes Next.js/Vite React. Astro + React island wrapping usually works but `Badge` or `Button` may need small tweaks. Budget a few hours for first-integration friction.
2. **Tailwind v4 is new** — if `@theme` directive doesn't play nicely with `@astrojs/tailwind`, fallback is Tailwind v3.4 which is stable but less clean.
3. **Case Study Workshop scope creep** — set a hard stop: template locks after 2 full iterations of the-weekly, even if it's 80% right.
4. **Cloudflare Pages monorepo build** — Git integration with a subdirectory build can have first-time config friction. Plan to test this in chunk 3 (first deploy), not at the end.
5. **WebFetch rate limits on Substack** — analysing 16-24 posts for the voice reference may trip rate limits. If it does, batch across a 5-10 minute window or reduce target to 6-8 posts per author.

---

## Links to upstream phase outputs

- Phase 1 (Interview) → this conversation, summarised in memory
- Phase 2 (Spec) → captured inline in phases below
- Phase 4 (UX Flows) → `plans/portfolio-ux-flows.md`
- Phase 5 (Visual Direction) → `plans/portfolio-visual-direction.md` + `plans/portfolio-stitch-assets/12-13*.png`
- Phase 3 (Design Tokens) → `plans/portfolio-design-tokens.md` + `plans/portfolio-stitch-assets/design-explorer.html`
- Phase 6 (Architecture) → `plans/portfolio-architecture.md`
- Phase 7 (this plan) → `plans/portfolio-implementation.md`
