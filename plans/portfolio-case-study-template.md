# Project Content Template

Locked content hierarchy for all portfolio projects. Layout (4c) and writing (4d) build against this shape. Content structure dictates layout, not the reverse.

Two variants: **full** (400-600 words body) and **lightweight** (200-350 words body). Fixed bookend sections (Hero, Problem, Outcome, Lessons, Next) are the same for every project. The middle zone is flexible.

**Naming convention:** "Projects" (not "Case Studies") for the collection, URL, nav, and kicker labels. "Writing" for essays/posts. Tags and kickers must use these labels. Tagging structure to be defined before writing volume grows.

---

## Frontmatter (already defined in Zod schema)

```yaml
title: string           # project name
tldr: string (max 120)  # one-sentence pitch, displayed on cards
number: int             # portfolio sequence number (#01, #02, etc.)
date: Date              # publication date
started: Date           # when work began
finished: Date?         # omit if in-progress
tags: string[]          # tech stack tags
live: URL?              # deployed URL if public
hero: string?           # hero image path (sourced in 4d/5)
summary: string (max 240) # card blurb, longer than tldr
weight: int             # grid sort order (higher = more prominent)
featured: boolean       # landing page inclusion
depth: 'full' | 'lightweight'
```

`lastUpdated` is computed from `git log` at build time, not stored in frontmatter.

---

## Fixed Sections

### 1. Hero

**Purpose:** orient the reader in under 5 seconds. Who made this, what is it, is it live.

**Contains:**
- Title (from frontmatter)
- TL;DR (from frontmatter, one sentence)
- Tags (from frontmatter, tech stack)
- Live link button (from frontmatter, if `live` exists)
- Metadata bar: `#03 . Started Mar 2026 . Shipped Apr 2026 . Last updated 12 Apr 2026`
- Primary image slot (hero screenshot of the shipped product)

**Word budget:** 0 (all metadata, no prose)

**Imagery:**
- 1 hero screenshot (required for full, optional for lightweight). Real running app, never a mockup. Captured via Puppeteer, framed by `<Screenshot>` component at render time.

**What does NOT go here:** prose claims, transcripts, diagrams. The hero is orientation, not argument.

---

### 2. Problem

**Purpose:** name the pain or opportunity that made this project worth building. The reader should finish this section understanding *why this exists* before they learn *what it does*.

**Answers:** What was broken, missing, or frustrating? For whom? Why did it matter enough to build something?

**Word budget:** Full 60-100w. Lightweight 40-60w.

**Style guide alignment:**
- **Product thinking lives here.** One sentence answering "what does the user get from this that they did not have before?" (diary audit gap #1)
- Open with a concrete scene or a problem statement, never a definition (writing-style.md rule 1)
- Stakes stated inline: what happens if this problem stays unsolved (rule 4)

**Imagery:** None. This is a prose-only section. The problem earns its weight through words, not screenshots.

**What does NOT go here:** technical implementation details, transcripts, how-it-works descriptions. Problem is about the *why*, not the *what* or *how*.

---

## Flexible Middle Zone

Each project picks 1-3 sections from this pool, ordered by what is most interesting about that project. Future sections can be added to the pool as needed.

The order is per-project. A project with a strong migration story might lead with Architecture. A project with extensive design exploration might lead with Design. A product-focused project might lead with Decisions alone.

### Option A: Decisions

**Purpose:** product and business reasoning. Why build this, why this scope, what was cut, what was uncertain.

**Answers:** What were the key decisions? What alternatives were considered and rejected? What trade-offs were made and why?

**Word budget:** Full 80-150w. Lightweight 60-100w.

**Style guide alignment:**
- **Decision-making under uncertainty lives here.** Name rejected alternatives explicitly. State what you were uncertain about before the decision, not just the conclusion (diary audit gap #2)
- Trade-offs stated inline: "This buys X but costs Y" (rule 4)
- Steelman before critiquing any rejected approach (rule 2)
- Name recurring tensions if they appear more than once (rule 3)
- Make assertions: "Based on X, I think Y. The move is Z. If it fails, the risk is C." (rule 5)

**Imagery:**
- 1 transcript slot (optional). A decision-moment embed showing real-time reasoning. Inline or breakout mode.

---

### Option B: Architecture

**Purpose:** show technical thinking. The system shape, key technical trade-offs, why this stack, what was rejected.

**Answers:** What does the system look like? What are the major components and how do they connect? What technical choices were non-obvious?

**Word budget:** Full 80-150w. Lightweight 60-100w.

**Visual centrepiece:** Architecture diagram (required when this section is included). Clean vector Royal Tonal, matching the A2 locked aesthetic. Four archetypes apply (typically flowchart or network for architecture). Placed before the paragraph that interprets it (rule 6).

**Style guide alignment:**
- **Technical judgement lives here**, foregrounded rather than buried under a "Challenges" subheading (diary audit gap #3)
- Diagrams placed before the paragraph that interprets them (rule 6)

**Architecture diagram standards:** see "Architecture Diagram Colour Standards" section below.

---

### Option C: Design

**Purpose:** show the design process, not just the result. How many iterations, what changed, why. The iteration trail is the signal.

**Answers:** What was the visual direction? How many rounds of exploration? What was rejected and why? How did user feedback reshape the design?

**Word budget:** Full 80-150w. Lightweight 60-100w.

**Visual centrepiece:** Embedded design artefact (required when this section is included). This is where the HTML design explorers, colour swatch comparisons, card layout iterations, and other design artefacts become portfolio assets. Link out to the full explorer; embed the most interesting comparison inline.

**What counts as a design artefact:**
- Colour palette exploration (accent-palette-explorer-v1 through v5)
- Card layout deep-dive (card-deep-dive-v1 through v7)
- Diagram aesthetic comparison (diagram-aesthetic-explorer-v1)
- Typography pairing tests
- Component variant explorations

**How to present:**
- State the iteration count ("5 rounds of palette exploration")
- Show the most interesting before/after or comparison inline
- Link to the full explorer for readers who want the deep dive
- Name what changed between iterations and why

---

## Fixed Sections (continued)

### 4. Outcome

**Purpose:** what shipped. Concrete, measurable where possible, visual. The reader should see the finished product and understand what changed.

**Answers:** What does the shipped thing look like? What measurable result can you point to? What's the before/after?

**Word budget:** Full 60-100w. Lightweight 40-60w.

**Style guide alignment:**
- Connect details to why they matter (rule 8). "85 tests pass" is a log entry. "85 tests pass, including the race condition that broke staging last week" is a result.
- Declarative claims, no hedging. "This works" not "this seems to work."

**Imagery:**
- 2-3 screenshot slots (full). 1 screenshot slot (lightweight). Real shipped UI, captured via Puppeteer, cropped/zoomed programmatically via `<Screenshot>` component props. Show the product doing the thing the Problem section said was broken.

**What does NOT go here:** transcripts (Outcome is a claim section; transcripts invite auditing rather than trust), process narration, "how it works" explanations.

---

### 5. Lessons

**Purpose:** honest reflection. What would you do differently? What surprised you? What rule did you add because of this project? This is the credibility section.

**Answers:** What didn't work? What took longer than expected? What assumption turned out to be wrong? What would you change if you started over?

**Word budget:** Full 60-100w. Lightweight 40-60w.

**Style guide alignment:**
- **Honest reflection lives here** (diary audit gap #4). The admission-shape: name the mistake, name the updated belief, name the new rule (rule 10)
- Self-deprecation as credibility (Kao): admit what you got wrong before claiming what you learned
- Close with an imperative or a rule, not a question (rule 12)

**Imagery:**
- 1 transcript slot (optional, inline only). A mistake-moment embed showing where reasoning went wrong and how the belief updated. Never breakout mode in Lessons; the section is short and the transcript should feel embedded in the reflection, not showcased.

**Transcript rules (Lessons):**
- Shows a *mistake or pivot*: the reader sees an assumption fail and the belief update
- Must have a note explaining the mistake and what changed
- 2-8 turns, verbatim, hand-reviewed
- Counts as 50 words against section budget

---

### 6. Next

**Purpose:** navigation. Where does the reader go from here? Keep them in the portfolio.

**Contains:** a link to a related writing post (if one explores a lesson from this project) OR a link to the next project in sequence. One link, not a list.

**Word budget:** 0-20w. One sentence framing why the linked artefact is relevant.

**Imagery:** None.

---

## Full vs Lightweight Comparison

| Dimension | Full | Lightweight |
|-----------|------|-------------|
| Total body words | 400-600 | 200-350 |
| Problem | 60-100w | 40-60w |
| Middle zone sections | 1-3 | 1-2 |
| Middle zone per-section | 80-150w | 60-100w |
| Outcome | 60-100w | 40-60w |
| Lessons | 60-100w | 40-60w |
| Next | 0-20w | 0-20w |
| Hero screenshot | Required | Optional |
| Architecture diagram | Required if Architecture section included | Optional |
| Design artefact embed | Required if Design section included | Optional |
| Outcome screenshots | 2-3 | 1 |
| Transcript slots total | Up to 2 | Up to 1 |
| Transcript breakout mode | Max 1 | Not allowed |

---

## Transcript Embed Rules (consolidated)

These rules are locked in `portfolio-imagery-standards.md`. Restated here for template completeness.

1. **Placement:** Decisions section (decision moments) or Lessons (mistake moments) only. Never Hero, Problem, or Outcome. Those are claim sections; a transcript in a claim section invites the reader to audit the dialogue instead of trusting the prose.
2. **Budget cost:** each embed counts as 50 words against the host section's word budget, regardless of actual turn length. This prevents padding and discourages over-embedding.
3. **Turn count:** 2-8 turns per embed. Fewer than 2 is a pull-quote. More than 8 loses the reader.
4. **Verbatim only.** No edits, reorders, combinations, or fabrication. Automated redaction pass + mandatory hand-review before promotion.
5. **Note required.** Every embed must have an editorial note explaining why the moment was marked. "Here's a conversation" is not enough.
6. **Full projects:** up to 2 embeds total, max 1 in breakout mode.
7. **Lightweight projects:** up to 1 embed total, inline only.

---

## Architecture Diagram Colour Standards

Architecture diagrams use Royal Tonal exclusively. Violet Signal does not appear in architecture diagrams. Violet is the "thinking/writing" content register; architecture diagrams are "work/craft" content. Mixing registers in a single diagram undermines the semantic colour system.

**Node treatment by component type:**

| Component type | Fill | Stroke | Shape |
|---------------|------|--------|-------|
| Core system (your code) | royal-4 | royal-8 | Rounded rectangle (8px radius) |
| Key subsystem (e.g. spending guard) | royal-5 | royal-9, heavier (2px) | Rounded rectangle |
| External service (vendor API) | none (transparent) | royal-7, dashed | Rounded rectangle |
| Data store (database) | royal-4 | royal-8 | Cylinder or tabbed rectangle |
| Scheduled trigger (cron) | none | royal-7, dashed | Rounded pill |

**Arrows and connections:**
- Data flow arrows: royal-8 stroke, 1.5px, with arrowhead
- Key/highlighted flow: royal-9 stroke, 2px (use sparingly, max 1-2 per diagram)
- External call arrows: royal-7 stroke, 1.5px, dashed
- Arrow labels: Geist Mono 11px, royal-11

**Labels:**
- Node labels: Geist 12-13px weight 500, --ink colour
- Emphasis sub-labels (key nodes only): Geist Mono 11px, royal-11
- Group labels (containing boxes): Geist 11px uppercase, royal-11, 0.14em letter-spacing
- External node labels: Geist 12px weight 500, --ink (full contrast; the dashed stroke already signals "external")

**Minimum text size (mobile legibility):**
- No SVG text below 11px in viewBox units. This is the hard floor.
- Combined with a 490px minimum rendered width on the scroll container, 11px SVG text renders at 9px CSS on screen (the legibility floor).
- The `<Diagram>` Astro component enforces the 490px min-width; diagram authors enforce the 11px text floor.
- Bump any label that would fall below 11px. If a label can't fit at 11px, shorten the text rather than shrinking the font.

**Mobile presentation:**
- Diagrams bleed to full container width on mobile (negative margins cancel card padding), gaining ~120px of usable width on a 390px screen.
- If the container is still narrower than the diagram's min-width (490px), enable horizontal scroll with a "scroll →" hint (Geist Mono 11px, ink-faint, right-aligned above the diagram).
- On desktop (>640px), neither bleed nor scroll applies.
- One `<Diagram>` Astro component handles both behaviours. No JavaScript needed.

**Grouping:**
- Related components can be grouped in a containing box with royal-2 fill and royal-5 dashed stroke
- Group label sits top-left of the containing box

**What differentiates this from other diagram types:**
- Architecture diagrams allow grouping boxes (other types do not)
- Architecture diagrams use the filled/unfilled distinction to separate owned vs external components
- The key subsystem highlight (royal-9 heavy stroke) draws the eye to the architecturally interesting decision. Use it on the component the prose paragraph will explain.

**Consistency rule:** all diagrams across the portfolio (architecture, decision trees, causal loops) share the same base tokens (stroke weight, radius, font, label size). The only difference is the node treatment table above. This means a reader who sees a flowchart in one project and an architecture diagram in another recognises them as part of the same visual system.

---

## Signal Coverage Map

Every signal from the diary audit and style guide has a designated home. No orphaned signals.

| Signal | Primary section | Secondary |
|--------|----------------|-----------|
| Product thinking (user benefit) | Problem | Decisions |
| Decision-making under uncertainty | Decisions | --- |
| Rejected alternatives | Decisions | --- |
| Technical judgement | Architecture | Outcome |
| Design process / iteration | Design | --- |
| Honest reflection / admission shape | Lessons | --- |
| Trade-offs (X buys Y, costs Z) | Decisions | Problem |
| Architecture diagrams | Architecture | --- |
| Design artefact embeds | Design | --- |
| Screenshots (shipped product) | Outcome | Hero |
| Transcript: decision moment | Decisions | --- |
| Transcript: mistake moment | Lessons | --- |
| Hook / cold open | Problem (first prose section) | --- |
| Imperative close | Lessons | Next |

---

## Planned Middle Zone by Project

| Project | Depth | Middle zone sections (tentative order) | Rationale |
|---------|-------|---------------------------------------|-----------|
| The Weekly (#1) | Full | Design, Architecture, Decisions | Strong design iteration trail; architecture is simple but interesting (no backend); product decisions secondary |
| Planner POC (#2) | Full | Architecture, Decisions | Migration story + spending guard are the headline; no significant design exploration to show |
| Workspace Audit (#3) | Lightweight | Decisions | Tooling/process project; no architecture or design to speak of |
| This Portfolio (#4) | Lightweight | Design | Meta case study; the design system is the interesting part |
| Planner V1 (#5) | Full | Architecture, Design, Decisions | Full GTD system with complex architecture, new frontend design, and product scope decisions |

---

## Word Budget Note

All word budgets are **soft guides**, not hard limits. They will be calibrated after writing the first project (the-weekly, chunk 4d). The template locks after 2 full iterations of the-weekly, even if the budgets need adjusting. Perfect is the enemy of shipped.
