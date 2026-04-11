# Portfolio — Visual Direction (Phase 5)

**Status:** locked 2026-04-10. Layout approved; typography + colour refinement deferred to Phase 3 (Design Tokens).

---

## Winner: V1 (refined) — Asymmetric magazine split with swapped hierarchy

**Design system:** Nocturne Editorial / "The Midnight Essayist"
**Stitch project:** `11854207648209240816`
**Winning screens:**
- Desktop: `2ff50f763d8a4bc0a406f4df1f3cd6b7` → `plans/portfolio-stitch-assets/12-v1-refined-desktop.png`
- Mobile: `a59ff8da618d4b2497e092d9eac83633` → `plans/portfolio-stitch-assets/13-v1-refined-mobile.png`

### Desktop layout
Asymmetric magazine split at the top:
- **Left 2/3** — hero statement in commanding Newsreader serif (the north-star)
- **Right 1/3** — **Build Log / Recent** ticker: 5-6 compact entries (serif date + one-line title + small blue tag), "view full log" link in blue at the bottom

Below the hero row:
- **Case Studies** as a full-width prominent spread — 4 cards in a confident editorial grid (2x2 or staggered), big serif title + one-line TL;DR + tags + blue "read case study" link. **This is the primary emotional beat.**

At the bottom:
- **About teaser**

### Mobile layout
Single column, same hierarchy:
1. Minimal top bar: hamburger left, wordmark center, "Get in touch" blue pill right
2. Full-width hero (serif tightened but commanding)
3. Compact Build Log ticker (4-5 entries) — small, deliberately secondary
4. **Case Studies** as dominant section: 4 stacked full-width cards, subtle alternating horizontal offsets to retain the staggered magazine feel
5. About teaser

### Why this wins the information hierarchy
- Product thinking (case studies) gets full-width real estate — unmistakably primary
- AI velocity (build log) is visible above the fold as a recency/ticker signal but intentionally smaller — secondary context, not the headline
- The asymmetric split reads as editorial and confident without sacrificing scannability
- Mobile preserves the exact same ordering — no information-architecture rework between breakpoints

---

## Design system tokens (captured from Stitch, to be refined in Phase 3)

These came from the Stitch "Nocturne Editorial" design system output. They are a **starting point** — the user explicitly wants to iterate on typography and colours in Phase 3 before locking.

### Colours
| Token | Value | Use |
|---|---|---|
| `surface` | `#14130f` | Warm charcoal background |
| `on_surface` | `#e6e2d9` | Off-white body text |
| `primary` (Stitch default) | `#b4c5ff` | Used in generated mocks |
| `primary` (user target) | `#4F80FF` | User's preferred blue accent — override in Phase 3 |
| `override_neutral` | `#1A1914` | Secondary surface |

Blue accent is used sparingly: only on interactive elements (links, CTAs, "Get in touch" pill) and key numbers/dates.

### Typography
| Role | Family | Notes |
|---|---|---|
| Display/serif | Newsreader | Editorial serif, used for hero + case study titles + big date numerals |
| Body/sans | Public Sans | Used for TL;DRs, tags, metadata, small caps labels |

### Other
- Generous vertical rhythm / whitespace
- Subtle horizontal offsets to retain staggered magazine character (especially on mobile case study stack)
- Small caps for section labels ("Build Log / Recent", "Selected Work")

---

## Rounds explored (for the design workflow retro)

### Round 1 — Bibliotheca / The Modern Essayist (warm off-white, light mode)
- 01 base
- 02 REFINE: type-forward maximalism
- 03 EXPLORE: asymmetric magazine split ← user's favourite from Round 1
- 04 REIMAGINE: Technical Journal split-screen with sticky left index

**Round 1 feedback:** liked #3 best but wanted dark mode, blue accent (favourite colour), Case Studies above Build Log, and couldn't evaluate left-index concept without seeing mobile.

### Round 2 — Nocturne Editorial / The Midnight Essayist (dark mode, blue accent)
New base design system generated for the new constraints.

| # | Variant | Description | Verdict |
|---|---|---|---|
| 05 | Base desktop | New dark-mode anchor | Used as base for variants |
| 06 | Base mobile | Same design system on phone | Used as base for variants |
| 07 | V1 EXPLORE | Asymmetric magazine split | **User's favourite — selected** |
| 08 | V2 EXPLORE | Centered single-column essay + right-rail | Not selected |
| 09 | V3 EXPLORE | Wide grid + horizontal timeline band | Not selected |
| 10 | V4 REIMAGINE | Sticky-left gallery index (01-04) | Close second — "case studies felt a bit hidden" |
| 11 | V5 REIMAGINE | Full-bleed typographic hero | "Completely broken" |

### Refinement — V1 swap
User liked V1 but wanted the hero-row right column to show Build Log (not Case Studies), with Case Studies getting a full-width prominent spread below. Regenerated both desktop (12) and mobile (13) with the swapped hierarchy. **Approved.**

---

## Carried into Phase 3 (Design Tokens)

The user explicitly said: *"I do also want to do more work on the typography and colours after settling on a layout."*

Phase 3 items to dial in:
1. **Blue accent shade** — Stitch generated `#b4c5ff` (light periwinkle); user target is `#4F80FF` (true cobalt). Decide which is the actual brand colour and how it reads against `#14130f` charcoal.
2. **Serif choice** — validate Newsreader vs alternatives (Fraunces, Editorial New, PP Editorial, Söhne Breit). Newsreader is free on Google Fonts which is a point in its favour.
3. **Sans choice** — validate Public Sans vs alternatives (Inter, IBM Plex Sans, Söhne). Public Sans is government-boring; may want something with more character.
4. **Type scale + sizing** — hero size, case study title size, body text size, small caps metadata size.
5. **Border radius + spacing scale** — the Stitch mock uses rounded cards; decide whether to keep that or go sharper/more editorial.
6. **Shadcn scaffold command** — output Phase 3 as a runnable `npx shadcn create` command with all tokens baked in.

---

## Carried into Phase 6 (Architecture)

- Header anatomy: hamburger left, wordmark center, "Get in touch" blue pill right — this pattern is the same on mobile and desktop
- Case study card component: big serif title, TL;DR, tags, blue "read case study" link
- Build log entry component: serif date, one-line title, optional blue tag
- Small caps label component for section headers

## Carried into Phase 7 (Implementation)

- Case Study Workshop chunk (co-write the-weekly case study first, iterate the template, lock it, apply to remaining three) — must come before any case studies are written
