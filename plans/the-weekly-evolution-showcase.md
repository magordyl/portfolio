# The Weekly — Evolution Showcase

**Status:** Planned 2026-04-13. To be executed as part of chunk 4d (case study workshop).

## Context

The locked draft of the-weekly case study (`plans/the-weekly-case-study-draft.md`) has screenshots "deferred to a later pass" and includes a **Lesson 2**: "Skipping design was the biggest mistake. Has since iterated on the design workflow several times and landed somewhere better."

That lesson is currently asserted in prose with no evidence. The evolution showcase turns it into visible proof — three live, interactive snapshots of the-weekly at distinct points in its design evolution, each with a named decision that triggered the jump to the next stage.

Decision-led frame (not "I got better at visual design"):
- **Stage 1 → 2 trigger:** Colleague's MOB Kitchen suggestion after showing the raw POC. Forced an audit and the amber/desktop overhaul.
- **Stage 2 → 3 trigger:** Realisation that visual tokens needed to live outside the project — otherwise every future project re-does this arc from scratch. Led to the workspace design system being scaffolded and the-weekly being wired into it as the first adopter.

Outcome: a case-study reader finishes Lesson 2 already convinced, because they just watched the arc themselves.

---

## The three stages

| Stage | Commit | Date | Why this commit | What's visibly different |
|---|---|---|---|---|
| 1 — POC | `50e79ad` | 2026-04-08 | Initial commit, first functional version | Default styling, no visual identity, no desktop layout, raw shadcn defaults |
| 2 — Design overhaul | `473227c` | ~2026-04-10 | First real visual identity; the "MOB-inspired" jump | Amber accent, component polish, desktop layouts, splash/how-it-was-made panels |
| 3 — Current | `ae5bae7` | 2026-04-11 | Latest — wired into workspace design system, semantic tokens, sentence case | Refined typography, semantic token layer, product copy tuned |

User-facing stage labels (decision-led, not chronological):
- Stage 1 — "POC: functional, not yet designed"
- Stage 2 — "Design audit: amber identity and desktop polish"
- Stage 3 — "Tokenised: wired into the workspace design system"

---

## Changes to `the-weekly-case-study-draft.md`

Update the draft to integrate the evolution showcase rather than leaving it as a separate artefact.

1. **Replace the line** at L104: `"Decided: no transcript embeds for this case study. No architecture section. Screenshots deferred to a later pass after prose is locked."` → update to carve out the evolution embed explicitly ("Screenshots deferred; evolution embed is the one exception, placed in Lessons").
2. **Lessons section (L73–77)** — extend Lesson 2 to sit above the evolution embed. New shape:
   - Paragraph: the admission (skipped design → biggest mistake → rule added).
   - Embed: `<VersionedEmbed>` with three tabs.
   - One-sentence caption below each stage naming the decision that triggered it.
3. **Key messages map (L87–98)** — add row: "Design evolution as evidence for Lesson 2 → Lessons (embed)".
4. **Frontmatter tags** — add `"Cloudflare"`; update `live:` URL to the Stage 3 Workers URL when it replaces the Netlify canonical.

---

## Hosting: Cloudflare Workers Static Assets

Three separate Workers, one per stage. Consistent with the portfolio's hosting pattern (`.claude/rules/deployment.md`: Workers Static Assets, not Pages). No password — zero sensitive content.

**URL scheme:**
- `the-weekly-v1.magordyl.workers.dev` — Stage 1 (POC)
- `the-weekly-v2.magordyl.workers.dev` — Stage 2 (overhaul)
- `the-weekly-v3.magordyl.workers.dev` — Stage 3 (current; also the canonical `the-weekly.magordyl.workers.dev` going forward)

**Per-version build + deploy recipe:**
1. `git worktree add ../the-weekly-v1 50e79ad` (one worktree per stage so nothing mutates `master`)
2. In the worktree: `npm install && npm run build` (fallback: `npx vite build` if the stage predates the `build` script alias)
3. Add a minimal `wrangler.toml` to the worktree with `[assets] directory = "./dist"` and `not_found_handling = "single-page-application"`
4. `npx wrangler deploy` → produces the per-stage `.workers.dev` URL
5. Repeat for `473227c` and `ae5bae7`

**Why worktrees over temp clones:** keeps everything inside the workspace repo, easy to tear down (`git worktree remove ../the-weekly-vN`), and the worktree itself is git-aware so re-deploying after a tweak is one command.

**Pre-deploy risks to verify before committing to the recipe:**
- Stage 1 (`50e79ad`) predates the `npm run check` discipline. It may have TypeScript errors that break `astro build`-style strict builds but still run in dev. Resolution: use plain `vite build` directly; do not gate on the project's current `check` script.
- Stage 1 likely has no Netlify/Cloudflare config. That's fine — `wrangler.toml` lives only in the worktree, not the commit.
- Post-deploy smoke test: Stage 1's Coles trolley URL shape must still generate a valid Coles deep-link. If Coles has changed their URL format since Stage 1 was written, the trolley button will 404 — flag this openly in the caption rather than hiding it.

---

## The `<VersionedEmbed>` component

Location: `src/components/VersionedEmbed.tsx` — React island. Trivial tab state + interactive iframes justify the island; Astro component + small hydration hook would be two files for no gain.

**Props:**
```ts
type Stage = {
  label: string;           // "Stage 1 — POC"
  url: string;             // the-weekly-v1.magordyl.workers.dev
  decisionCaption: string; // "Triggered by a colleague's MOB Kitchen suggestion..."
};
type Props = { stages: Stage[]; aspectRatio?: string /* default 16/10 */; };
```

**Behaviour — keep all iframes mounted, toggle visibility:**

Critical: each stage's iframe preserves its own page state across tab switches. If the reader is on the ingredient-review screen in Stage 1, switches to Stage 2, then returns to Stage 1 — they land back on ingredient review, not the splash page.

Implementation:
- Render **all three iframes simultaneously** inside a single positioned wrapper (all absolute-positioned or stacked via CSS grid).
- Use `hidden` attribute + `aria-hidden="true"` on inactive iframes, not `display: none` (some browsers pause iframe execution on `display: none`; `hidden` is safer for state preservation).
- **Never swap `src`**. Setting `src` mounts a new document and blows away the state we're trying to preserve. Each iframe's `src` is set once at mount and never changed.
- Active iframe is revealed by removing `hidden`. Inactive iframes remain mounted in the DOM.
- No cross-stage state is passed between iframes — the three apps are independent deployments and know nothing about each other. This is only about preserving each iframe's own internal page state across visibility toggles.
- Tab state lives in component state (`useState`), not URL — no need to deep-link into a specific stage.

Performance note: three simultaneous iframes load three separate SPAs on first paint. Use `loading="lazy"` on iframes 2 and 3 so they only load when a reader scrolls the embed into view, but keep iframe 1 eager so the default view is instant. Once loaded, all three stay mounted.

**Visual layer:**
- Tab bar sits above the iframe wrapper. Active tab uses Royal Tonal primary; inactive tabs muted.
- Below the wrapper: the `decisionCaption` for the currently-active tab. Short, one sentence, Geist Mono, muted (matches diagram caption rule in `writing-style.md` Part 3).
- Mobile (<640px): tab bar becomes a horizontal scroller — keeps all three stage labels visible so the reader sees "there are three of these" at a glance.
- Aspect ratio enforced on the iframe wrapper so layout doesn't jump when stages have slightly different content heights.

**Design conformance:**
- Royal Tonal colours via CSS vars (no hardcoded hex — per `.claude/rules/design-system.md`).
- Geist body for tab labels, Geist Mono for caption.
- 8px radius on the iframe wrapper (matches card radius token).
- 1.5px border in Royal Tonal 8 on the frame (matches diagram stroke convention in `writing-style.md` Part 3).
- No emoji, no em-dash-as-connective in captions (per `writing-style.md` Part 2).

**Imagery-standards conformance:** real running UI in an iframe, not a screenshot. Passes the "real UI only" rule without needing the `<Screenshot>` component.

---

## Decision captions (first-draft copy, for Dylan to refine)

One per stage:

- **Stage 1:** "First working version. No visual direction yet — default shadcn styling, no desktop layout."
- **Stage 2:** "After showing the POC to a colleague who pointed me at MOB Kitchen. First real identity: amber accent, desktop layouts, splash page."
- **Stage 3:** "Wired into the workspace design system so the next project doesn't start visual design from zero again."

Voice check pre-publish: declarative, no hedges, no em-dash-as-connective, Australian spelling where applicable. Dylan rewrites in his own voice before publish; these are placeholders that pass the AI-tells banlist.

---

## Critical files

- `plans/the-weekly-case-study-draft.md` — update Lessons section and key-messages map
- `src/components/VersionedEmbed.tsx` — new React island
- `src/content/projects/the-weekly.mdx` — import `<VersionedEmbed>` and render under Lesson 2 when the MDX body is written in chunk 4d
- `plans/portfolio-implementation.md` — chunk 4d now includes this component in scope
- `the-weekly-app/` (workspace sibling) — source of the three commits; no edits, only worktrees
- Three ephemeral worktrees at `../the-weekly-v1`, `../the-weekly-v2`, `../the-weekly-v3` — created during deploy, removed after the three Workers are live

---

## Verification

1. **Per-stage build check:** each worktree runs `vite build` and produces a non-empty `dist/` with at least `index.html`, a CSS bundle, and a JS bundle. For Stage 1 specifically, open the built `dist/index.html` in a browser before deploying — confirm the app boots and the trolley flow works.
2. **Per-stage deploy check:** after `wrangler deploy`, curl the root URL and assert 200 + HTML response. Load in a browser, walk the flow to the trolley step, confirm Coles URL generation still works (Stage 1's data shape matches Stage 3's trolley API).
3. **Component check in portfolio:** render `<VersionedEmbed>` on a scratch Astro page (not the live case study) with all three URLs. Verify:
   - Tab switching toggles visibility without remounting iframes.
   - **State persistence test:** navigate Stage 1 to ingredient review → switch to Stage 2 → switch back to Stage 1 → confirm it is still on ingredient review, not back on splash.
   - No layout shift on tab change.
   - Mobile tab bar scrolls horizontally.
   - Captions render with correct typography tokens.
4. **`npm run check`** in portfolio passes before committing.
5. **Voice pass:** read the three decision captions aloud; rewrite any sentence that fails the AI-tells banlist.

---

## What this plan deliberately does NOT do

- No password protection. Confirmed — nothing sensitive, friction not worth it.
- No scrolly / cross-fade treatment. Chose 1b (tab switcher); lighter to build and matches "boring > clever".
- No narrative reframe beyond Lesson 2. The draft's structure stays intact; the embed is additive evidence, not a new section.
- No screenshot fallback for the iframes. If a Worker is down, the tab shows a broken frame — acceptable given the `.workers.dev` domain's uptime. Revisit only if the stages start getting traffic from contexts where iframes are blocked.
- No commits to the-weekly's master branch. All deploys are from worktrees at historical commits; nothing mutates existing history.
- No shared state between stages. The three apps are independent; only each iframe's own page state is preserved across visibility toggles.
