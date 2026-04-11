# Portfolio — Design Tokens (Phase 3)

**Status:** approved 2026-04-10. Feeds Phase 6 (architecture) and Phase 7 (implementation).

Final token spec for the portfolio. To be dropped into `globals.css` after `npx shadcn init` in Phase 7, once the framework (Next.js / Astro / Vite) is decided in Phase 6.

---

## Colours — Royal Tonal (12-step scale anchored on `#3B5BDB`)

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
  --royal-12: #D5DCFA;  /* high-contrast text on royal-8 */

  /* Ink — off-white body text */
  --ink:       #E6E2D9;  /* primary body text */
  --ink-dim:   #9C968A;  /* secondary text (tldr, metadata body) */
  --ink-faint: #5E584F;  /* tertiary text (footers, least-important) */

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
  --kicker:         var(--royal-11);  /* small caps section labels, build log dates */
  --tag-border:     var(--royal-8);
  --tag-fg:         var(--royal-11);
  --tag-bg:         rgba(59, 91, 219, 0.08);
  --code-bg:        var(--royal-1);
  --code-keyword:   var(--royal-10);
  --code-string:    var(--royal-11);
  --code-comment:   var(--ink-faint);
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
| `--royal-12` | `#D5DCFA`  | White-ish text on royal-8 buttons                  |

### Contrast notes
- Text `--ink` (`#E6E2D9`) on `--bg` (`#121428`): AAA large, AA body
- `--link` (`#6C85FF`) on `--bg`: AA body (4.5:1+)
- `--kicker` (`#A5B4FF`) on `--bg`: AAA large, AA small — only use for 11px+ small caps or larger
- `--royal-12` (`#D5DCFA`) on `--royal-8` (`#3B5BDB`): AAA button label

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
