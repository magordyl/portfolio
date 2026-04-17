# Portfolio — Design Tokens (Phase 3)

**Status:** approved 2026-04-10. Feeds Phase 6 (architecture) and Phase 7 (implementation).

Final token spec for the portfolio. To be dropped into `globals.css` after `npx shadcn init` in Phase 7, once the framework (Next.js / Astro / Vite) is decided in Phase 6.

---

## Colours — Royal Tonal + Violet Signal

**Status update (2026-04-12):** Palette extended from pure monochromatic to an analogous family. Royal Tonal (12 steps) handles all page chrome and the "work/craft" content register. Violet Signal (5 steps, 8–12 only) handles the "thinking/writing" content register. A single `--grad-rv` gradient serves as a sparing signature moment. Decisions finalised via `accent-palette-explorer-v1.html` through `v4.html` in this folder.

### Royal Tonal (12 steps, chrome + work register)

Single-hue tonal system in the Radix / Material 3 tradition. Every step has a defined role. Periwinkle `#A5B4FF` (which the user loved) is step 11 of this scale — so "royal + periwinkle" is just two roles of the same colour.

```css
:root {
  /* Royal Tonal — 12 steps */
  --royal-1:  #0E0F1C;  /* app background */
  --royal-2:  #121428;  /* surface (page bg) */
  --royal-3:  #181B36;  /* subtle bg (code blocks, hover wash) */
  --royal-4:  #1E2346;  /* UI element bg (card) */
  --royal-5:  #252C58;  /* element hover */
  --royal-6:  #2D366C;  /* element active */
  --royal-7:  #364280;  /* subtle border */
  --royal-8:  #3B5BDB;  /* solid (brand) — CTAs, primary buttons */
  --royal-9:  #4D6DE8;  /* hovered solid */
  --royal-10: #6C85FF;  /* text link (on dark bg) */
  --royal-11: #A5B4FF;  /* low-contrast text (kickers, metadata highlights) */
  --royal-12: #D5DCFA;  /* high-contrast text on royal-8 (AA large only — see accessibility rules) */

  /* Violet Signal — 5 steps (8-12 only, thinking/writing register) */
  --violet-8:  #8C3BDB;  /* solid brand — writing CTAs, thinking-mode callouts */
  --violet-9:  #9D4DE8;  /* hovered solid */
  --violet-10: #B47CFF;  /* text link (on dark bg) — writing links */
  --violet-11: #C89BFF;  /* low-contrast text (writing kickers, thinking metadata) */
  --violet-12: #E6D4FF;  /* high-contrast text on violet-8 (AA large only — see accessibility rules) */

  /* Signature gradient — Royal → Violet, used sparingly (hero CTA + section divider only) */
  --grad-rv:      linear-gradient(135deg, var(--royal-8) 0%, var(--violet-8) 100%);
  --grad-rv-line: linear-gradient(180deg, var(--royal-8) 0%, var(--violet-8) 100%);
  --grad-rv-soft: linear-gradient(135deg, var(--royal-10) 0%, var(--violet-10) 100%);

  /* Ink — off-white body text */
  --ink:       #E6E2D9;  /* primary body text */
  --ink-dim:   #9C968A;  /* secondary text (tldr, metadata body, code comments) */
  --ink-faint: #5E584F;  /* DECORATIVE ONLY — dividers, non-text icons. NEVER use for text (fails WCAG AA at all sizes). */

  /* Semantic aliases (use these in components, not the royal-N tokens directly) */
  --bg:             var(--royal-2);
  --bg-subtle:      var(--royal-3);
  --card:           var(--royal-4);
  --card-hover:     var(--royal-5);
  --border:         var(--royal-7);
  --border-strong:  var(--royal-8);
  --primary:        var(--royal-8);
  --primary-hover:  var(--royal-9);
  --link:           var(--royal-10);
  --kicker:         var(--royal-11);           /* small caps section labels, build log dates */
  --button-fg:      #FFFFFF;                    /* CTA button label — pure white (not royal-12, see accessibility rules) */
  --tag-border:     var(--royal-8);
  --tag-fg:         var(--royal-11);
  --tag-bg:         rgba(59, 91, 219, 0.08);

  /* Thinking/writing register (violet) */
  --thinking:         var(--violet-8);
  --thinking-hover:   var(--violet-9);
  --thinking-link:    var(--violet-10);
  --thinking-kicker:  var(--violet-11);         /* writing post kickers, essay metadata */
  --thinking-tag-border: var(--violet-8);
  --thinking-tag-fg:     var(--violet-11);
  --thinking-tag-bg:     rgba(140, 59, 219, 0.10);

  /* Code */
  --code-bg:        var(--royal-1);
  --code-keyword:   var(--royal-10);
  --code-string:    var(--royal-11);
  --code-comment:   var(--ink-dim);             /* was ink-faint; ink-faint fails WCAG for text */
}
```

### Token → role quick reference

| Token        | Hex        | Used for                                           |
|--------------|------------|----------------------------------------------------|
| `--royal-1`  | `#0E0F1C`  | Absolute bg, code block bg                         |
| `--royal-2`  | `#121428`  | Page surface (body)                                |
| `--royal-3`  | `#181B36`  | Subtle bg wash, disabled state                     |
| `--royal-4`  | `#1E2346`  | Card surface                                       |
| `--royal-5`  | `#252C58`  | Card hover                                         |
| `--royal-6`  | `#2D366C`  | Active / pressed card                              |
| `--royal-7`  | `#364280`  | Default border                                     |
| `--royal-8`  | `#3B5BDB`  | Brand — CTA backgrounds, "Get in touch" pill       |
| `--royal-9`  | `#4D6DE8`  | Brand hover                                        |
| `--royal-10` | `#6C85FF`  | Body text links, "Read case study →"               |
| `--royal-11` | `#A5B4FF`  | Kickers ("Selected work · 01"), small-caps labels  |
| `--royal-12` | `#D5DCFA`  | Text on royal-8 buttons (large only — not for 16px labels, see rules) |
| `--violet-8` | `#8C3BDB`  | Brand (thinking/writing) — writing CTA, section divider endpoint |
| `--violet-9` | `#9D4DE8`  | Violet brand hover                                 |
| `--violet-10`| `#B47CFF`  | Writing post body text links                       |
| `--violet-11`| `#C89BFF`  | Writing kickers, thinking metadata                 |
| `--violet-12`| `#E6D4FF`  | Text on violet-8 buttons (large only)              |

### Contrast notes (WCAG 2.1 AA audit, 2026-04-12)

All 29 in-system pairings computed with the standard WCAG algorithm. Full results in `accent-palette-explorer-v4.html` and the audit script output.

**Passes AA body or AAA:**
- `--ink` on any bg (royal-2/3/4): **11.74:1 to 14.05:1** — AAA body everywhere
- `--ink-dim` on bg/card: **5.16:1 to 6.18:1** — AA body
- `--royal-10` link on bg/card: **4.65:1 to 5.57:1** — AA body
- `--royal-11` kicker on bg/card: **7.64:1 to 9.14:1** — AAA body (not just large)
- `--violet-10` link on bg/card: **5.25:1 to 6.28:1** — AA body
- `--violet-11` kicker on bg/card: **6.93:1 to 8.29:1** — AAA body

**Passes AA large, fails AA body (fix required):**
- `--royal-12` on `--royal-8`: **4.17:1** — OK for 18px+ regular or 14pt+ bold, fails for 16px button labels
- `--violet-12` on `--violet-8`: **4.05:1** — same issue

**Passes WCAG 1.4.11 non-text (3:1):**
- `--royal-8` on `--bg`: 3.20:1 ✓ (CTA surface identifiable)
- `--violet-8` on `--bg`: 3.25:1 ✓
- `--royal-9` hover: 4.04:1 ✓
- `--violet-9` hover: 4.03:1 ✓

**Below 3:1 but decoratively exempt (WCAG 1.4.11 does not apply to purely decorative fills/borders):**
- `--royal-7` border on bg: 1.94:1
- `--royal-4` card fill vs bg: 1.20:1
- `--royal-3` subtle bg vs bg: 1.08:1

**Fails completely — do not use for text:**
- `--ink-faint` (`#5E584F`) on bg: **2.58:1** — fails AA large and body
- `--ink-faint` on card: **2.16:1** — fails everything

**Critical structural finding:**
- `--royal-8` vs `--violet-8`: **1.02:1** — near-identical luminance. The `--grad-rv` gradient is a hue shift only, not a brightness shift. It is nearly imperceptible to users with low vision or colour-blindness, and disappears entirely in Windows High Contrast Mode. Colour alone cannot be the identity signal anywhere in the system; typography or labels must always reinforce.

---

## Component variant allowlists

**Locked 2026-04-17** as part of chunk 4c.0 (colour-role rationalisation gate). Components reference the role tokens listed here; raw `--royal-*` / `--violet-*` scale references outside `src/styles/globals.css` and `design.tokens.ts` are a build-time failure (enforced by `scripts/check-raw-colours.mjs` in `npm run check`).

**Hard rule.** Introducing a new variant requires updating this section first, then mirroring in `globals.css` and `design.tokens.ts`. No ad-hoc pairings in components.

### Tags — ≤ 4 variants

| Variant | fg | bg | border | Use for | Do not use for |
|---|---|---|---|---|---|
| `default` | `--ink-dim` | transparent | `--royal-4` | Passive taxonomy labels on case study cards, project-page tags, writing-post category tags | Selected filter state (use `active`), signalling the current page (use kicker), rare "new" callouts (use `signal`) |
| `active` | `--royal-11` | `rgba(59, 91, 219, 0.08)` | `--royal-8` | Selected filter pill, "currently viewing" tag in a list, active navigation chip | Decorative taxonomy (use `default`) |
| `signal` | `--violet-11` | `rgba(140, 59, 219, 0.10)` | `--violet-8` | Rare "note this" accents — e.g. "new" badge on a recent writing post | Routine thinking/writing tags (those just use default with no colour shift) |
| `status` | `--ink-dim` | transparent | `--royal-7` | Case study status labels (shipped / draft / archived / in-progress) | Adding a second variant per status (it's one muted register, not a rainbow) |

Tokens in `globals.css`: `--tag-default-{fg,bg,border}`, `--tag-active-{fg,bg,border}`, `--tag-signal-{fg,bg,border}`, `--tag-status-{fg,bg,border}`.

### Kickers — ≤ 2 variants

| Variant | fg | Typography | Use for | Do not use for |
|---|---|---|---|---|
| `default` | `--royal-11` | Geist Mono, 11px, 500, uppercase, 0.18em tracking | "Selected work", "Build log", "Case Study" card kickers, h2 section labels inside case study body | Writing-post / thinking-mode kickers (use `signal`) |
| `signal` | `--violet-11` | same | Writing index kickers, essay metadata, thinking-mode callouts | Case study or chrome kickers (use `default`) |

Tokens: `--kicker-default-fg`, `--kicker-signal-fg`.

### Status dots — ≤ 3 variants

| Variant | Colour | Use for |
|---|---|---|
| `neutral` | `--ink-dim` | Inert / pending state (e.g. "draft" dot in a build log row) |
| `active` | `--royal-10` | Normal "currently active" state — live session, running task, shipped project |
| `attention` | `--violet-10` | Pivot / decision moment — reserved. Used sparingly in the BuildLogTicker for "thinking" entries, and anywhere that wants to mark a reader-should-notice moment |

Tokens: `--dot-neutral`, `--dot-active`, `--dot-attention`.

### Borders — 3 roles

| Role | Colour | Use for |
|---|---|---|
| `hairline` | `--royal-3` | In-component separators (list rows, between turns in a transcript, between log entries). Not a container edge. |
| `border` (semantic alias) | `--royal-7` | Card edges, input outlines, container divisions |
| `strong` (semantic alias) | `--royal-8` | Focused / active outlines, primary button borders, "this is emphasised" container |

Tokens: `--border-hairline`, plus the existing `--border` / `--border-strong` semantic aliases.

### Expander pills — ≤ 2 variants

Used inside `<ChatTranscript>` expanders to label what's inside (plan / tool calls / skill invocation / cluster). Any component needing a similar label-on-progressive-disclosure pattern uses these too.

| Variant | fg | border | Use for |
|---|---|---|---|
| `high` | `--royal-11` | `--royal-8` | High-signal expanders — plan, skill, research, reply, cluster |
| `bg` | `--ink-dim` | `--royal-4` | Background / chrome expanders — tool-call runs |

Tokens: `--expander-pill-high-{fg,border}`, `--expander-pill-bg-{fg,border}`.

### Other role tokens (not variant families, one value each)

| Token | Value | Use |
|---|---|---|
| `--link-hover` | `--royal-11` | Hover colour for any link that uses `--link` as default. One rule, everywhere. |
| `--button-fg` | `#FFFFFF` | Text colour on `--primary` buttons. Pure white because `--royal-12` fails WCAG AA body (4.17:1) at 16px label sizes. |
| `--placeholder-bg` | `--royal-3` | Solid fill for placeholder image slots. Removed in chunk 5 when real hero screenshots land. |
| `--placeholder-gradient` | `linear-gradient(135deg, --royal-3, --royal-5)` | Gradient placeholder fill for card image slots. Removed in chunk 5. |

---

## Accessibility rules (non-negotiable)

These flow from the audit above. They are project-level rules, not component-level suggestions.

### 1. `--ink-faint` is decorative only

`--ink-faint` (`#5E584F`) fails every WCAG threshold for text. It may be used for:
- Dividers and horizontal rules
- Icon fills where the icon is paired with a text label
- Decorative borders

It must **never** be used for readable text. `--ink-dim` is the lowest text tier. Footer metadata, "reading time", least-important captions all use `--ink-dim`.

### 2. Button labels use `#FFFFFF`, never `--royal-12` / `--violet-12`

A 16px/600-weight button label on `--royal-8` or `--violet-8` using the `*-12` token is below AA body (4.17:1 and 4.05:1, respectively). Three fix options, pick one per component:

1. **Use `--button-fg` (`#FFFFFF`)** for all CTA labels. Raises both buttons above 4.5:1. Default choice.
2. **Bump font-size to 18px+** and keep `--royal-12` / `--violet-12`. Qualifies as "large text" at 3:1. Use only when the button text genuinely wants to be 18px for hierarchy reasons.
3. Never use `--royal-12` / `--violet-12` on `--royal-8` / `--violet-8` for labels smaller than 18px regular or 14pt bold.

The default portfolio CTA uses option 1.

### 3. Transcript role labels are mandatory

Because `--royal-8` and `--violet-8` are at 1.02:1 luminance (imperceptible to a meaningful fraction of users), the `<ChatTranscript>` component cannot rely on colour alone to distinguish Dylan from Claude. This is a WCAG 1.4.1 requirement ("use of colour"): information must not be conveyed by colour alone.

Therefore:
- The role label ("Dylan" / "Claude") is **required** on every turn. It cannot be hidden by responsive rules or design variants.
- The typography split (Dylan = Geist sans, Claude = Geist Mono) is a compliance feature, not just an aesthetic one. It carries identity in greyscale, high-contrast mode, and for colour-blind users.
- Colour on the role label and container border is reinforcement only.

### 4. Any status colour outside this system must be added explicitly

Royal and violet carry content register meaning (work vs thinking), not semantic status. A future success/error/warning colour is an open slot that will need its own WCAG audit when added. Do not overload royal or violet with status meaning.

---

## Typography

### Fonts
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Role | Family | Weights used |
|---|---|---|
| Display / serif | **Fraunces** | 400 (hero, case titles), 500 (card titles) |
| Body / UI sans | **Geist** | 400 (body), 500 (kickers, links), 600 (CTAs) |
| Code / monospace | **Geist Mono** | 400 (code blocks), 500 (inline code) |

All three are free via Google Fonts. Fraunces' variable `opsz` axis lets us use different optical sizes at hero (96) vs card title (32) — we'll let the browser pick automatically via `font-optical-sizing: auto`.

### Type scale

```css
:root {
  --font-serif: 'Fraunces', Georgia, serif;
  --font-sans:  'Geist', -apple-system, system-ui, sans-serif;
  --font-mono:  'Geist Mono', 'SF Mono', Menlo, monospace;

  /* Sizes — 72/32/16 anchor from round 1 */
  --text-hero:     4.5rem;     /* 72px — hero statement */
  --text-display:  3rem;       /* 48px — section headers, reserved */
  --text-case:     2rem;       /* 32px — case study card titles */
  --text-h3:       1.5rem;     /* 24px — writing post subheads */
  --text-h4:       1.25rem;    /* 20px — case study section titles */
  --text-body:     1rem;       /* 16px — body, default */
  --text-sm:       0.875rem;   /* 14px — metadata, captions */
  --text-xs:       0.75rem;    /* 12px — build log entries, tags */
  --text-kicker:   0.6875rem;  /* 11px — small-caps kickers */

  /* Line heights */
  --lh-hero: 0.98;
  --lh-tight: 1.1;
  --lh-snug: 1.25;
  --lh-normal: 1.55;
  --lh-loose: 1.65;

  /* Letter spacing */
  --ls-hero: -0.025em;
  --ls-title: -0.01em;
  --ls-body: 0;
  --ls-caps: 0.18em;
}
```

### Mobile scale overrides

Hero 72px is too large for a 390px viewport. Reduce proportionally:

```css
@media (max-width: 640px) {
  :root {
    --text-hero:    2.75rem;   /* 44px */
    --text-display: 2rem;      /* 32px */
    --text-case:    1.5rem;    /* 24px */
  }
}
```

---

## Spacing, radius, borders

```css
:root {
  /* 4px base scale — standard */
  --space-1:  0.25rem;  /* 4px */
  --space-2:  0.5rem;   /* 8px */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.5rem;   /* 24px */
  --space-6:  2rem;     /* 32px */
  --space-7:  3rem;     /* 48px */
  --space-8:  4.5rem;   /* 72px — section spacing */
  --space-9:  6rem;     /* 96px — large section spacing */
  --space-10: 9rem;     /* 144px — hero-to-content spacing */

  /* Radius — soft rounded cards (Option A, locked) */
  --radius-sm: 2px;   /* tags, small pills */
  --radius:    8px;   /* cards, buttons */
  --radius-lg: 12px;  /* hero containers, modals (future) */

  /* Border widths */
  --border-1: 1px;
  --border-2: 2px;

  /* Shadows — subtle lift on card hover */
  --shadow-card-hover: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

---

## Shadcn init — recommended command

Exact scaffold command to be run in Phase 7 **after** framework is chosen in Phase 6. Placeholder for Next.js App Router + Tailwind v4:

```bash
npx shadcn@latest init -d
# -d = defaults: base-color slate, css-variables yes, react-server-components yes
```

Then overwrite `app/globals.css` (or equivalent) with the token block above. The `slate` base colour is the closest shadcn default to royal — we override it entirely anyway, so the init choice is cosmetic.

### components.json registry URL gotcha (from prior session)

```json
"registries": {
  "@shadcn": "https://ui.shadcn.com/r/styles/new-york-v4/{name}.json"
}
```

Use the full path including `styles/new-york-v4`, not the shorthand — otherwise the shadcn MCP returns NOT_FOUND in Phase 6/7.

---

## What's locked vs open

### Locked
- Colour palette: Royal Tonal (12-step)
- Fonts: Fraunces × Geist × Geist Mono
- Type scale: 72 / 32 / 16 anchor with full rem scale
- Radius: 8px cards, 2px tags
- Card treatment: soft rounded + hover lift

### Open (decide in Phase 6 or 7)
- Framework (Next.js vs Astro vs Vite) — Phase 6
- Exact shadcn component set to install — Phase 6/7
- Interaction micro-details (hover timing, easing, focus rings) — Phase 7 polish
- Dark mode toggle: **no** (one mode only, per Phase 1 decision)

---

## Artefacts

Standalone design artefacts from this phase. All self-contained and portfolio-link-ready.

| Path | Purpose |
|---|---|
| `plans/portfolio-stitch-assets/design-explorer.html` | Interactive comparison of 4 tonal palettes (Royal Tonal approved) rendered on locked dark background with real content — case study card, build log strip, code block, button. Loads Fraunces/Geist/Geist Mono live from Google Fonts. The palette decision was made from this document, not from static Stitch screenshots. **Portfolio candidate**: link from the portfolio case study as "here's how I chose the colour system." |
| `plans/portfolio-stitch-assets/12-v1-refined-desktop.png` | Final approved layout direction (desktop 1440px) from Phase 5 visual exploration. |
| `plans/portfolio-stitch-assets/13-v1-refined-mobile.png` | Final approved layout direction (mobile 390px) from Phase 5 visual exploration. |
| `plans/portfolio-stitch-assets/01-06, other numbered PNGs` | Rejected rounds from Phase 5 — kept for the "rounds explored" trail in `plans/portfolio-visual-direction.md`. Also portfolio-candidates as "here's what I rejected and why." |

Directory is named `portfolio-stitch-assets/` for historical reasons; new projects should use `plans/<project>-assets/` per workspace CLAUDE.md "Design artefacts" rule.
