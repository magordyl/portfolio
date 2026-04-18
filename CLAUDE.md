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

## Deploy Workflow

Cloudflare Workers project: `dylan-portfolio`. Account ID: `89af4bb31c6edfd9fc2e3c3cc51463c2`.

```bash
# Production (from portfolio/):
npm run deploy:prod          # builds + deploys to dylan-portfolio.magordyl.workers.dev

# Preview (from portfolio/):
npm run deploy:preview       # builds + deploys to dylan-portfolio-preview.magordyl.workers.dev
```

**GHA preview deploy** runs automatically on every push to a non-`main` branch (`.github/workflows/preview-deploy.yml`). Preview URL is always `https://dylan-portfolio-preview.magordyl.workers.dev` (last push wins — single-track for single-user workflow).

**Required GitHub secrets** (add once in repo Settings → Secrets → Actions):
- `CLOUDFLARE_API_TOKEN` — Workers:Edit scope (reuse from planner-app if already created)
- `CLOUDFLARE_ACCOUNT_ID` — `89af4bb31c6edfd9fc2e3c3cc51463c2`

**CI** (`.github/workflows/check.yml`) runs `npm run check` on every push and PR. Both CI and preview deploy must pass before merging to `main`.

## Tailwind v4 note

Astro uses `@tailwindcss/vite` (Vite plugin), NOT `@astrojs/tailwind`. The `astro add tailwind` command sets this up automatically. No `tailwind.config.mjs` needed — tokens live as CSS variables in `globals.css`. If you need Tailwind utility classes for token values, add `@theme { --text-hero: 4.5rem; }` blocks inside `globals.css`.

## Current Status (2026-04-17)

**Last session (2026-04-17 evening) — Chunks 4c.0.5 + 4c.1a shipped: /design-system kit scaffold + ChatTranscript v3 port.**

Three commits on `main` (pushed; Cloudflare auto-deploy kicked):
- `3e68c07` — `/design-system` kit scaffold (tokens, type, spacing, radius, icons, chunk-3 components live-rendered).
- `428f905` — plan restructure (split 4c.1 → 4c.1a ChatTranscript + 4c.1b layouts; `<ProjectTimeline>` deferred to new post-launch chunk 7.5).
- `41fac2c` — ChatTranscript v3 port. 9 files, +657/-466.

**ChatTranscript v3 port specifics:**
- Near-total rewrite of `src/components/astro/ChatTranscript.astro` as an Astro port of `plans/portfolio-stitch-assets/chat-transcript-explorer-v3.html`. Zero client JS (static HTML + native `<details>`). Build-time markdown via `marked` (added as dep).
- Full design parity with v3.html: gradient royal-violet border on royal-1 inner, 12px radius, block grouping (consecutive same-role turns share one badge + full-block left accent), cluster expander (runs of 3+ consecutive tool-heavy Claude turns merge with a synthesised heading), wrap-up pill (trailing directives stay visible), flat expander as locked default, content filters (compaction + slash-command turns dropped at render). WCAG 1.4.1 satisfied — role labels stay visible at all viewports.
- 16 new role tokens added (`--transcript-*` family + `--prose-heading-fg`). All scoped; see `plans/portfolio-design-tokens.md` §ChatTranscript for allowlist entries + reuse rationale. Mirrored in `design.tokens.ts` under `roles.transcript` + `roles.prose`.
- Schema extension: optional `clusterTitle?: string` on transcript turn shape (author override for the synthesised cluster heading; set on the first turn of the run).
- `check-raw-colours` allowlist is now **empty**. Every component in `src/components`, `src/layouts`, `src/pages` references role tokens only. The allowlist file list in `scripts/check-raw-colours.mjs` can stay as-is (empty `Set`) to serve as a speed bump for future ad-hoc additions.
- Kit entry: `/design-system` now renders the planner-stitch-batch-40-renders transcript in both `inline` and `breakout` modes. Breakout is a class hook (`mode-breakout`) with no visual divergence yet — case-study layouts in 4c.1b will wire it to extend past the prose column.
- Build: `npm run check` = 0 errors, 0 warnings, 0 hints. Cluster-heading synthesis verified in built HTML (matched the 21-turn Stitch run).

**Per-component icon stroke pattern (new):** ChatTranscript introduces a component-scoped `--badge-stroke: 2` CSS var for its 14px badge/chevron icons, applied via `stroke-width: var(--badge-stroke)`. The workspace default (1.5) reads anemic at sub-20px sizes. Use this pattern for any future component with icons below 20px; don't raise the workspace default.

**Prior session (2026-04-17 PM) — Chunk 4c.0 shipped: role-token layer + migration + check script.**

Commit `b19bc72` on `main`. 12 files, +349/-23. The colour-role rationalisation gate is executed — 4c.1a has now consumed it (empty allowlist).

What landed:
- **Audit** at `plans/portfolio-colour-audit.md` enumerates every raw-scale reference outside `globals.css`. Dominant pattern was `--royal-11` as link-hover (6 sites). Other patterns: two placeholder image fills, one WCAG-failing button fg (`--royal-12` on `--royal-8` = 4.17:1, fails AA body at 16px).
- **Role tokens** in `src/styles/globals.css` + `design.tokens.ts` (new `roles` export) covering all locked allowlists: `--tag-{default,active,signal,status}-{fg,bg,border}`, `--kicker-{default,signal}-fg`, `--dot-{neutral,active,attention}`, `--border-hairline`, `--expander-pill-{high,bg}-{fg,border}`, plus `--link-hover`, `--button-fg`, `--placeholder-bg`, `--placeholder-gradient`.
- **Migration** of `CaseStudyCard`, `BuildLogTicker`, `PageHeader`, `CaseStudyLayout`, `KickerLabel`, `index.astro`. `ChatTranscript.astro` was deferred and migrated in 4c.1a (2026-04-17 evening).
- **Enforcement** via `scripts/check-raw-colours.mjs`, wired into `npm run check` as the first step.
- **Allowlist docs** in `plans/portfolio-design-tokens.md` (§Component variant allowlists) with a hard "update-doc-first" rule. Workspace rule mirrored in `.claude/rules/design-system.md`.

**Prior session (2026-04-14) — ChatTranscript design locked + colour-rationalisation gate.**

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
1. **4c.1b** — case study page layout explorers (`case-study-v1.html`, `case-study-v2.html`). Uses `<ChatTranscript>` from 4c.1a (now shipped). Leaves a stub slot where `<ProjectTimeline>` would sit. This is the next session's work.
2. **4c.2-4c.5** — remaining page layout explorers (/projects index, /writing, /log, /404+/privacy).
3. **4d** — the-weekly case study workshop (prose + case study layout build).

**`<ProjectTimeline>` deferred to post-launch (chunk 7.5).** Originally bundled into 4c.1 but removed on 2026-04-17 — a timeline is a case-study enhancement, not a shipping prerequisite. Case study layout explorers leave a stub slot; retrofitting post-launch is acceptable.

**Deployed** — Cloudflare Pages / Workers, `magordyl/portfolio` (`main` branch). Live at `dylan-portfolio.magordyl.workers.dev`. Verify 4c.1a visually on `/design-system` after the auto-deploy (expect: two ChatTranscript demos at the bottom of the Components section, both rendering the 64-turn planner-stitch transcript with the 21-turn cluster expander collapsed by default).

**Chunks remaining:** 4c.1b (layout explorers), 4c.2-4c.5, 4d, 5, 5.5, 5.6, 6, 7 (showcase polish — slimmed stub), 7.5 (ProjectTimeline — post-launch), 8 (design-system retrofit, opportunistic).

## Implementation Plan

Full plan: `plans/portfolio-implementation.md` (chunks 1–3 complete, 4c.0 / 4c.0.5 / 4c.1a complete, then 4c.1b → 4c.2-4c.5 → 4d → 5 → 5.5 → 5.6 → 6 → 7 → 7.5 → 8). Component kit scaffold moved forward to 4c.0.5 on 2026-04-17; chunk 7 slimmed to a post-launch polish stub; `<ProjectTimeline>` split out to new chunk 7.5 (post-launch) on 2026-04-17. Chunk 8 (design-system retrofit) remains opportunistic post-launch.
Current status tracked in `DIARY.md`.
