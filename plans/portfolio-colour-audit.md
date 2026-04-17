# Portfolio — Colour Usage Audit (chunk 4c.0.1)

**Date:** 2026-04-17
**Scope:** every reference to `var(--royal-*)`, `var(--violet-*)`, raw hex, or `rgba()` in `src/**`, excluding `src/styles/globals.css`, `design.tokens.ts`, and content JSON.
**Input to:** 4c.0.2 (variant allowlists) → 4c.0.3 (role tokens) → 4c.0.4 (migration).

---

## 1. Raw-scale usage outside the token layer

| # | File | Line | Value | Role being played | Reuse pattern |
|---|---|---|---|---|---|
| 1 | `src/pages/index.astro` | 162 | `color: var(--royal-11)` | hover on `.about-link` (colour lift on link hover) | **5×** — dominant pattern |
| 2 | `src/layouts/CaseStudyLayout.astro` | 141 | `color: var(--royal-11)` | hover on `.live-link` | reuses pattern 1 |
| 3 | `src/layouts/CaseStudyLayout.astro` | 205 | `color: var(--royal-11)` | hover on prose `:global(a:hover)` | reuses pattern 1 |
| 4 | `src/layouts/CaseStudyLayout.astro` | 147 | `background: var(--royal-3)` | placeholder bg for hero-image slot | **2×** — placeholder pattern |
| 5 | `src/components/astro/PageHeader.astro` | 67 | `color: var(--royal-12)` | text on primary button ("Get in touch") | one-off **AND pre-existing WCAG fail** (design-tokens.md §accessibility — 4.17:1 for body text) |
| 6 | `src/components/astro/BuildLogTicker.astro` | 92 | `color: var(--royal-11)` | hover on `.log-all` | reuses pattern 1 |
| 7 | `src/components/astro/CaseStudyCard.astro` | 56 | `background: linear-gradient(135deg, var(--royal-3) 0%, var(--royal-5) 100%)` | placeholder card-image gradient | extends pattern 4 |
| 8 | `src/components/astro/CaseStudyCard.astro` | 124 | `color: var(--royal-11)` | hover on `.card-link` | reuses pattern 1 |

## 2. Inside `globals.css` base styles (allowed but roleifiable)

| File | Line | Value | Role |
|---|---|---|---|
| `src/styles/globals.css` | 159 | `a:hover { color: var(--royal-11); }` | base link-hover — same pattern 1 |

## 3. Deferred: `ChatTranscript.astro`

Excluded from the 4c.0 migration pass per session scope (2026-04-17). ~35 raw-scale references across lines 254–554. Role-token migration happens as part of the 4c.1 v3 port, not here.

Listed for completeness:
- `--royal-3` / `--royal-4` / `--royal-5` — nested surface fills (tag, badge bg, expander bg, tool-call bg)
- `--royal-6` / `--royal-7` — secondary borders
- `--royal-10` — accent icon (Claude turn icon)
- `--royal-11` — text highlights (tool name, pill fg, summary fg)
- `--royal-12` — strong heading fg on expander

## 4. Raw hex / `rgba()` outside `globals.css`

**None in UI code.** Matches in `src/content/transcripts/planner-stitch-batch-40-renders.json` are verbatim transcript content (Stitch API override-colour strings) — not UI code — and are out of scope.

## 5. Patterns identified (→ role-token candidates)

### Pattern 1 — link hover colour lift (dominant, 6 sites)
Every link in the system uses `--link` (`--royal-10`) for default and `--royal-11` on hover. A single role token fixes this:
- **Proposed:** `--link-hover: var(--royal-11)`.
- **Migration targets:** 6 sites (patterns 1, 2, 3, 6, 8 + the base `a:hover` in globals.css).

### Pattern 4+7 — placeholder image surfaces (2 sites, ephemeral)
Both placeholder patterns will be removed in chunk 5 when real hero screenshots land. But they're live now and need tokens:
- **Proposed:** `--placeholder-bg: var(--royal-3)` and `--placeholder-gradient: linear-gradient(135deg, var(--royal-3) 0%, var(--royal-5) 100%)`.
- **Alternative:** leave as raw-scale with a comment, mark for chunk-5 removal. Rejected — violates the "no raw scale in components" rule.

### Pattern 5 — primary button foreground (WCAG fix required)
`--royal-12` on `--royal-8` = 4.17:1 — fails AA body for the 16px button label. Design-tokens.md already specifies `--button-fg: #FFFFFF` for this, but that token was never added to `globals.css`. This migration is also an accessibility fix.
- **Proposed:** `--button-fg: #FFFFFF` (matches design-tokens.md spec).
- **Migration target:** `PageHeader.astro:67`.

---

## 6. Tag-treatment question flagged for Dylan

The plan's 4c.0.2 starter allowlist defines tag variants as:
- `default` (taxonomy) — **muted**: `--ink-dim` fg, `--royal-4` border, transparent bg
- `active` (selected) — royal-accented: `--royal-11` fg, `--royal-8` border, `rgba(59, 91, 219, 0.08)` bg
- `signal`, `status` — reserved, not used today

But the **current `.tag` class** in `CaseStudyCard.astro` and `CaseStudyLayout.astro` uses the **royal-accented treatment** (`--tag-fg: --royal-11`, `--tag-border: --royal-8`) for **passive taxonomy labels** — matching what the plan calls `active`, not `default`.

**Two interpretations:**
- **A.** Follow the plan literally: migrate existing `.tag` usage to `--tag-default-*` (muted). This is a **visible design change** — cards look less vivid. The current royal-accented treatment becomes `--tag-active-*`, reserved for future selected/filter states.
- **B.** Keep existing treatment: the current `.tag` style is the "default" taxonomy tag for this portfolio. Rename plan's `default` → `muted` and `active` → `default` in the allowlist. Tokens mirror current look.

**Recommendation: A.** The plan was written deliberately to match the v3 ChatTranscript muted-pill treatment — that's where the design trail landed. Cards with muted tags give the title and TL;DR more hierarchy, which is the Cutler "steelman" case. The current tag-on-card pattern gives taxonomy labels the same visual weight as the kicker — it reads as busy.

This is visible, so flagging before the migration.

---

## 7. Other tokens listed in the plan but not yet used

Defined for 4c.1 / 4c.0.5 build-out, not present in current code:
- **Status dots** — `--dot-neutral`, `--dot-active`, `--dot-attention`
- **Borders** — `--border-hairline` (only `--border` and `--border-strong` semantic aliases exist today)
- **Kickers** — `--kicker-signal` (violet variant; only `--kicker` default exists today)
- **Expander pills** — `--expander-pill-high-*`, `--expander-pill-bg-*`
- **ChatTranscript role badges + stripes** — Claude/Dylan bg/fg/border + accent stripes

All of these land in 4c.0.3 so they're available when 4c.1 starts.

---

## 8. Acceptance

- [x] Every raw-scale reference in `src/` outside `globals.css`, `design.tokens.ts`, and `ChatTranscript.astro` is enumerated.
- [x] Each reference has a role label + reuse count.
- [x] Patterns extracted into proposed role tokens.
- [x] Open questions surfaced (tag treatment).
