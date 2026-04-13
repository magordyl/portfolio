# Imagery & Illustration Standards

Research artefact for chunk 4a.3. Feeds into:
- **4a.4** — merged into `.claude/rules/writing-style.md` as the "Imagery & illustration standards" section (workspace repo, auto-loaded for prose work).
- **4c** — layout mockups treat imagery slots per these rules.
- **4d** — the-weekly case study workshop uses this as the imagery spec.

Not a style-guide replacement. The final workspace-wide rules live in `writing-style.md`; this doc is the reasoning and the references behind them.

---

## Aesthetic direction

**One sentence:** Clean vector Royal Tonal for diagrams, Royal Tonal-framed screenshots of real artefacts cropped programmatically, verbatim chat transcripts as a first-class artefact type, no figurative illustration.

The portfolio is a product-thinking portfolio, not an illustrated essay collection. Diagrams earn their place by replacing paragraphs, not by decorating them. Screenshots show real things that actually shipped. Chat transcripts show real decision moments from real sessions, unedited and un-paraphrased, captured in-flow. Everything else is absent on purpose.

**Aesthetic picked:** A2 (clean vector Royal Tonal) from `plans/portfolio-stitch-assets/diagram-aesthetic-explorer-v1.html`. Five aesthetics were previewed (hand-drawn sketch, clean vector, typographic ASCII, Notion-flat, blueprint). A2 was selected because it is the only option that works cleanly across all four archetypes, the editorial voice lives in the prose rather than the drawing, and it removes the tooling dependency on RoughJS and Excalidraw. Trade-off: lower "drew to think" signal than A1, but the prose carries that signal instead.

**Two influences to borrow from, one to ignore:**

| Influence | What we take | What we don't |
|---|---|---|
| Cutler (TBM) | Diagram archetypes (4), placement rule (diagram before interpretation), monochrome palette | Sketch linework, TBM numbering, framework-heavy default shape |
| Maggie Appleton | "Image before interpretive text" rule | Saturated palette, figurative illustration (Dylan isn't an illustrator) |
| Stripe / Linear marketing | Clean vector discipline | Gradient-heavy hero imagery, marketing-site glossiness |

Original framing was Cutler "drew to think" over Maggie "drew to teach," resolved in favour of sketch. The design explorer reopened that decision and pushed back in the other direction: precise strokes carry the four archetypes more reliably, and the "drew to think" signal travels better through voice (Kao assertions, admission shape, lived-in prose) than through wobbly lines. The aesthetic no longer carries the editorial work; the writing does.

---

## Diagrams

### Four archetypes (from voice research, Cutler-derived)

These are the only four shapes used in the portfolio. New archetypes require explicit justification — the cost of inventing new ones is that readers lose the ability to pattern-match.

1. **Flowchart / process diagram** — for sequences and decision paths. The default choice when in doubt. Covers most Process section needs in case studies.
2. **2×2 matrix** — for separating concerns along two independent axes. Use when an idea has exactly two dimensions and both matter.
3. **Causal loop / system-dynamics** — for self-reinforcing cycles. Use sparingly; the shape is dense and needs a prepared reader.
4. **Network / constellation** — for "here's the messy reality" moments. The 24-goal network in Cutler's goal-cascades post is the reference.

No bar charts, no line charts, no pie charts, no radar charts. If a number needs to land, state it inline in prose, not as a chart. Charts are for data analysis pieces, which the portfolio does not ship.

### Placement rule (non-negotiable)

**Diagrams appear before the paragraph that interprets them, never after.** This is the single most distinctive Cutler move and it's lockable as a rule because the reason is transferable: visual pattern recognition primes comprehension. Readers see the thing, feel the tension, then get language to describe what they already sensed.

Violations: a diagram that supports a claim made above it is a decoration, not a diagram. Move it up or cut it.

### Caption rule

Captions describe what the diagram **shows**, never what it **means**. Meaning lives in the prose immediately below. Captions are one short sentence, in mono (Geist Mono) at caption size, muted colour. Examples:

- ✓ "Prioritisation flow after consolidating the ingredient list."
- ✗ "Consolidating ingredients reduced decision friction by 40%." (This is interpretation — belongs in body prose.)

### Linework and palette

- **Line style:** clean vector, precise strokes, never sketchy or hand-drawn. Same aesthetic across all four archetypes. No wobble, no RoughJS, no Excalidraw hand-drawn mode.
- **Stroke weight:** 1.5px for node outlines, 1.5px for arrows. Consistent across archetypes so the eye calibrates once.
- **Node corner radius:** 8px for rectangular nodes. Matches shadcn new-york-v4 default and the portfolio card radius.
- **Colour:** monochrome or single primary only. The default is Royal Tonal 8 (anchor `#3B5BDB`) stroke on Royal Tonal 12 background. Never a rainbow taxonomy. Nodes differentiate by shape or position, not hue. If a second colour is genuinely needed for contrast, use Royal Tonal 4 (lighter) or Royal Tonal 10 (deeper), never a new hue.
- **Typography:** Geist (sans body) at 13px, weight 500, for all labels. No handwriting fonts. Label size tracks body text.
- **Fill:** Royal Tonal 11 (one step above background) for node fills. Arrows and strokes use Royal Tonal 8.

### Diagram tooling — Mermaid default theme + hand-authored SVG

Tooling was rewritten when A2 was locked. The prior plan (Mermaid `handDrawn` + Excalidraw) does not apply: RoughJS adds the wobble we just removed, and Excalidraw is inherently hand-drawn with no clean-vector mode.

**Flowcharts → Mermaid CLI, default theme.** Text-sourced, reproducible, diffable in git. No `look: handDrawn`. Custom `themeVariables` map Mermaid's internal variables onto Royal Tonal tokens.

```mermaid
---
config:
  theme: base
  themeVariables:
    primaryColor: "#16214F"        # royal-11 — node fill
    primaryBorderColor: "#3B5BDB"   # royal-8 — stroke
    primaryTextColor: "#E5E8F2"     # royal-2 — label
    lineColor: "#3B5BDB"            # royal-8 — edges
    secondaryColor: "#0F1530"       # royal-12 — background
    fontFamily: "Geist, sans-serif"
    fontSize: "13px"
---
flowchart LR
  A[Browse recipes] --> B[Pick 3 meals]
  B --> C[Consolidate]
  C --> D{Optional garnishes?}
  D -->|yes| E[Include]
  D -->|no| F[Skip]
  E --> G[Review trolley]
  F --> G
  G --> H[Checkout]
```

Render:
```bash
mmdc -i diagrams-src/the-weekly-consolidation.mmd \
     -o src/assets/diagrams/the-weekly-consolidation.svg \
     --backgroundColor transparent
```

Source (`.mmd`) lives in `diagrams-src/`, output SVG lives in `src/assets/diagrams/`, both committed.

**2×2 matrices → Mermaid `quadrantChart`** when the 2×2 is simple data. When the 2×2 needs custom annotations or non-standard axis labels, fall back to hand-authored SVG (below).

**Causal loops and networks → hand-authored SVG.** No good text-sourced tool exists for causal loops with a clean vector aesthetic, and avoiding Excalidraw keeps the workflow code-driven. Author these as plain SVG inside an `.svg` file in `diagrams-src/`, sized to fit the prose column, using the same stroke weights, corner radii, and colour tokens as the Mermaid output. Copy the file into `src/assets/diagrams/` or reference it directly.

Canonical template for hand-authored diagrams lives at `diagrams-src/_template.svg` (built in chunk 4d with the first real case study). New diagrams start by copying the template so the aesthetic stays locked across all archetypes.

**Why this shape:** Mermaid covers the common case (flowcharts, simple 2×2) with a text source and a one-line render command. Hand-authored SVG covers the exotic cases (causal loops, networks) without forcing a GUI tool into the workflow. Both outputs share one set of tokens, so diagrams render consistently regardless of which path produced them.

**Open item:** evaluate [d2](https://d2lang.com/) as a replacement for hand-authored SVG in chunk 4d if causal loops or networks turn out to need more than two instances. d2 is text-sourced, outputs clean vector, and has native support for all four archetypes. Deferred because the extra tool is not worth it for a handful of diagrams.

### Workflow target

From "I need a diagram" to "polished SVG committed" in under 10 minutes:

1. Decide the archetype (30 seconds).
2. For flowcharts and simple 2×2: write the Mermaid source (3-5 minutes). Run `mmdc` (5 seconds). Review SVG in browser (30 seconds). Iterate or commit.
3. For causal loops and networks: copy `diagrams-src/_template.svg`, edit shapes and labels in code (5-8 minutes), save to `src/assets/diagrams/`, commit.

If a diagram is taking longer than 10 minutes, the archetype is probably wrong. Try forcing it into a flowchart shape and see if it resolves.

---

## Screenshots

### What counts as a screenshot

Real UI of real things that shipped or exist. Specifically:

- Running apps (case study subject projects)
- Terminal output from real commands
- Code editors with real code
- Data artefacts (CSV previews, JSON, Mermaid source) displayed in a real viewer
- Deployed sites (own or third-party when legally clear and credited)

Not screenshots:
- Figma / Sketch mockups of features that don't exist yet
- Marketing-site style hero renders
- Anything assembled in a design tool pretending to be real UI

### Capture layer — Puppeteer script (deferred to 4d)

When case study imagery is actually needed in chunk 4d, a Puppeteer script captures raw screenshots of live or locally-served apps. Raw means: just the pixels, no frame, no shadow, no gradient background.

Script location: `scripts/capture-screenshots.ts` in the portfolio repo. Config is an inline array of `{ url, out, viewport }` tuples. Viewport variants:
- Desktop: 1440×900
- Mobile: 390×844
- Retina: `deviceScaleFactor: 2` always

Output: WebP at quality 90. WebP is 30-50% smaller than PNG for UI screenshots and has universal 2026 support.

The script is **not** built in chunk 4a. It gets built once in chunk 4d against the first real case study (the-weekly), then becomes the template for the rest.

### Framing layer — Astro `<Screenshot>` component

Framing is never baked into the screenshot file. It's applied at render time by a single Astro component. This keeps raw captures small, makes frame iteration free, and guarantees consistency.

Component lives at `src/components/Screenshot.astro`. Built in chunk 4c alongside the layout mockups, so every layout can use it.

**Frame specification** (the values the component uses):

| Property | Value | Reason |
|---|---|---|
| Background | `linear-gradient(135deg, var(--color-royal-950), var(--color-royal-900))` | Tonal-shift not hue-shift, stays on-brand |
| Outer radius | 16px | Matches portfolio card radius scale |
| Desktop padding | 32px on all sides | Enough gradient visible without drowning the content |
| Mobile padding | 20px on all sides | Proportional to smaller viewport |
| Inner radius (image edge) | 8px | Matches shadcn new-york-v4 default |
| Border (image edge) | 1px solid `var(--color-royal-800)` | Prevents the screenshot bleeding into dark backgrounds |
| Shadow | `0 20px 60px -20px rgba(0, 0, 0, 0.6)` | Soft, long shadow — "floating panel" not "sticker" |
| Caption font | Geist Mono at `--text-caption` | Consistent with Cutler diagram caption rule |
| Caption colour | `var(--color-text-muted)` | Secondary importance |
| Caption position | Below frame, centred | Standard figure pattern |

**Size variants:** `full` (100% of content column) and `half` (two side-by-side). The component accepts a `size` prop; CSS handles the rest.

**Programmatic crop, focus, and zoom.** One raw fullsize screenshot is the source of truth per UI state. Every view of that screenshot (wide shot, cropped hero, zoomed detail, offset callout) is generated at render time from props on the `<Screenshot>` component. Never crop or edit the source file in an image editor. Never commit a cropped or resized derivative alongside the source. One artefact, many views.

Props the component accepts:

| Prop | Type | Purpose |
|---|---|---|
| `src` | string | Path to the raw fullsize screenshot (the only source of truth) |
| `alt` | string | Accessibility text |
| `caption` | string | Figure caption (Geist Mono, muted) |
| `size` | `"full"` \| `"half"` | Column width |
| `crop` | `{ x, y, width, height }` | Visible rectangle, percentages (0–100) of the source dimensions. Defaults to the full image |
| `focus` | `{ x, y }` | Focal point of a zoom, percentages (0–100). Defaults to the centre of `crop` |
| `zoom` | number | Scale factor applied around `focus`. `1` = natural size, `2` = 2× zoom, etc. |
| `aspect` | string | Optional aspect ratio override (`"16/9"`, `"1/1"`, `"4/3"`). Frame clips to this shape; content is scaled per `crop`/`zoom` |

Implementation shape: the component wraps the raw `<img>` in a fixed-aspect frame `div`, applies `object-fit: cover` with `object-position` computed from `focus`, and scales via CSS `transform: scale(zoom)` around the focal point. No pixel manipulation, no canvas, no server-side cropping. The browser does the work deterministically.

**Why programmatic:** manual cropping silently produces derivatives that drift from the source. If the UI changes, every manual crop has to be re-cut and re-committed. With code-driven cropping, the capture script writes one WebP per UI state; every case study decides at render time what part of it to show. Updating a UI means re-running the capture script; the MDX doesn't change.

**Capture-script contract:** the Puppeteer script captures each `{ url, out, viewport }` tuple as a single fullsize WebP. It does not generate multiple crops. Crops are always the renderer's job.

**Edge case — OG / social-share images.** These are loaded outside the site, so they need the frame baked in. Solved by a second Puppeteer pass that screenshots the rendered Astro page's `<Screenshot>` component at 1200×630. Generates pre-framed WebPs into `src/assets/og/`. Deferred to chunk 6 when OG cards are in scope.

### Code-specific screenshots — Ray.so exception

For screenshots of code specifically (not UI), Ray.so is explicitly allowed as an alternative to Puppeteer + VS Code capture. Reason: Ray.so is genuinely the best tool for code screenshots — syntax highlighting, window chrome, padding, and dark-mode presets are all first-class. Puppeteer-capturing VS Code would reproduce 80% of this badly.

**Rules for Ray.so code screenshots:**
- Theme: "Vercel" dark (closest tonal match to Royal Tonal).
- Background: transparent or plain Royal Tonal 950 — no Ray.so gradients. The Astro `<Screenshot>` component provides the gradient consistently.
- Title bar: hidden unless the code genuinely needs a filename label.
- Padding: 32 (matches the Astro frame inner padding so visual rhythm stays consistent).

Exported PNGs get wrapped in the same `<Screenshot>` component as Puppeteer captures. No separate code-frame component — one frame rules them all.

**Carbon** is an acceptable substitute for Ray.so if Ray.so is down or missing a language. Same rules.

---

## Chat transcripts

Verbatim snippets from Claude Code sessions are a **first-class artefact type**, not a novelty. The portfolio is largely about the journey of learning to ship with Claude Code, so showing real dialogue — real decision moments, real pivots, real mistakes — is the strongest available product-thinking signal. A paraphrased or fabricated exchange is worse than none at all.

### What counts as a transcript

Real Claude Code session turns captured via the bookmark workflow (chunk 4a.6). Specifically:

- User prompts and assistant replies from a real session, unedited text
- Tool calls **collapsed** to a one-line label (`[Read package.json]`, `[Edit src/foo.ts]`) — never expanded JSON
- Optional inline note/annotation from Dylan explaining *why* this moment was marked

Not transcripts:
- Paraphrased or tidied-up versions of conversations
- Fabricated dialogue for illustrative purposes
- Transcripts from other AI tools (ChatGPT, Cursor) — this portfolio is about Claude Code specifically
- Terminal-only shell session captures (those are screenshots, use Ray.so)

### Why verbatim and nothing else

The credibility of a transcript embed comes entirely from its rawness. The moment a reader suspects it's been polished, the signal inverts — it starts reading like a marketing asset. Rules:

- **Never edit turn text** beyond the redaction pass below
- **Never reorder turns**
- **Never combine turns from different sessions** into one embed
- **Never add turns that didn't happen**

If the real transcript doesn't make the point, don't fabricate — either pick a different moment or tell the story in prose without the embed.

### Redaction rules (automated pass, then hand-review)

The capture workflow runs an automated regex pass before writing the draft:

- **Secrets:** `sk-…`, `ghp_…`, `AKIA…`, anything matching obvious token prefixes → replaced with `[REDACTED]`
- **Absolute Windows paths:** `C:\Users\User\…` → `~/…` (keeps the relative shape, hides the home dir)
- **Email addresses:** replaced with `[redacted-email]`
- **Real names** other than Dylan's: caught on hand-review, not automated

Hand-review is mandatory after the automated pass. The draft lives in `src/content/transcripts/drafts/` until it's been reviewed; only then does it move to `src/content/transcripts/`. No exceptions — a transcript that hasn't been hand-reviewed must not appear in a published page.

### Embed length — min 2, max ~8 turns

- **Fewer than 2 turns** is a quote, not a transcript. Use a pull-quote styled block instead.
- **More than 8 turns** loses the reader. Pick the pivotal sub-range, or split into two separate embeds with prose between them.
- Tool calls count as zero turns for this budget — only user/assistant prose counts.

The `/bookmark` skill defaults to capturing the last 6 turns, which hits this range comfortably.

### Frame specification — `<ChatTranscript>` component

Built in chunk 4c.1 alongside the layout mockups. Two display modes, selected via a `mode` prop:

| Property | `inline` | `breakout` |
|---|---|---|
| Width | Prose column (matches body text) | Wider than prose (extends into the right margin on desktop) |
| Use when | Showing a routine decision or small exchange | Showing the pivotal moment of the case study |
| Per case study or essay | Up to 2 | Up to 2 |
| Mobile behaviour | Unchanged | Collapses to prose-column width, same as inline |

Shared frame values (locked 2026-04-14 via `plans/portfolio-stitch-assets/chat-transcript-explorer-v3.html`):

| Property | Value | Reason |
|---|---|---|
| Outer frame | Royal → violet gradient border (`--grad-rv`) on `--royal-1` inner, 1px transparent border with `padding-box` / `border-box` layering | Signature "this is the showcase" register; gradient distinguishes the component from plain cards |
| Outer radius | 12px | Reads as "dialogue box" not "photo frame" |
| Padding | 24px top/bottom, 16px sides | Tight enough for mobile, loose enough for the sender gutter |
| Block gutter | 64px | Houses the sender badge + role label; collapses on mobile |
| Block gap | 8px | Design system spacing scale (4/8/12/16/24/32/48/64) |
| Turn / block hairline | 1px `--royal-3` | Quiet separator; darker than original spec — lighter `--royal-7` tested and rejected as too loud |
| Sender badge | 26px circle; Dylan = violet-tinted bg + `--violet-10` icon + `--violet-8` border; Claude = `--royal-4` bg + `--royal-10` icon + `--royal-7` border | Colour-swap from original intent — Dylan in signal register, Claude in chrome |
| Role label | Geist Mono 11px, uppercase, letter-spacing 0.14em; Dylan = `--violet-11`, Claude = `--royal-11` | Mandatory on every block (WCAG 1.4.1, see `portfolio-design-tokens.md` §3) |
| Continuity line | 2px `border-left` on the whole block (full-block variant); violet for Dylan, royal for Claude | Single visual marker per block rather than per turn — lets consecutive turns read as one beat |
| Turn text font | Geist sans at 0.9375rem body size | Same family for both roles; identity is carried by icon + label + colour, not font split |
| Expander chrome | Flat (no card): 2px `--royal-4` left stripe, 12px padding-left | Card variant available as an override; the default is flat to keep Claude's content from visually dominating Dylan's |
| Expander pill colours | Two only: `high` (`--royal-11` fg on `--royal-8` border) for plan / skill / research / reply / cluster; `bg` (`--ink-dim` fg on `--royal-4` border) for tool calls | Earlier four-colour scheme (v2) was inconsistent and noisy |
| Cluster expander | Triggers when 3+ consecutive Claude turns each have tool calls + short prose (<600 chars); one expander, authored heading describing what was done | Avoids a wall of per-turn expanders in tool-heavy runs (e.g. the 40-render batch = 21 turns → 1 cluster) |
| Wrap-up pill | Always-visible strip below a Claude expander when the turn ends with a directive sentence ("reply with your answers...") — `--royal-2` bg, `--royal-10` left stripe | Keeps the closing ask visible without forcing an expander click |
| Annotation note | Geist Mono caption, italic, `--ink-dim` on a `--royal-6` left stripe | Hand-written feel, appears once at the top of the transcript |
| Max height | None | Scroll-within-scroll is a UX failure |
| Client-side JS | Zero — native `<details>/<summary>` only | Progressive disclosure works without framework JS and is fully keyboard-accessible |

### MDX usage pattern

```mdx
<ChatTranscript id="the-weekly-pivot" mode="breakout" />
```

Astro resolves the `id` against the `transcripts` content collection (Zod schema, validated at build). `mode` defaults to `inline`. Any additional prop validation is the component's responsibility.

### Banlist additions (extends the Sourcing rules below)

**Banned for transcripts specifically:**
- Any non-verbatim content (edited, paraphrased, reconstructed from memory)
- Transcripts from other tools presented as Claude Code
- Transcripts with unredacted secrets, paths, or PII
- Transcripts with fewer than 2 turns of real dialogue

### Where transcripts live in case studies

Per chunk 4b rules, transcripts are only allowed in **Process** (showing a decision moment) or **Lessons** (showing the mistake). Never in Hero, Problem, or Outcome sections — those are claim sections, and a transcript embed in a claim section invites the reader to scan the dialogue for validation instead of trusting the prose.

---

## Illustrations — deliberately absent

No figurative illustrations. No characters, no scenes, no hand-drawn metaphors. Reasoning:

1. Dylan is not an illustrator. Attempting figurative illustration without the skill tells the reader "this person cares about aesthetics but can't deliver them" — a strictly worse signal than having no illustration at all.
2. Commissioning is expensive and slow. Not a reasonable default for a content-first portfolio.
3. AI-generated illustration has an AI tell now (the gloss, the too-even composition, the extra fingers). Even when it's good, the reader has learned to mistrust it. Not worth the risk.
4. Diagrams + screenshots cover every visual need the case studies have. Adding illustrations would be decoration, not communication.

### The exception — typographic essay covers (if needed)

If writing posts (chunk 5.5) need a visual cover for social sharing, use a **typographic cover**: large Fraunces title on a Royal Tonal gradient block, no figurative element. Optional: a single geometric shape (circle, hexagon, grid line) as accent.

Covers are generated with the same Puppeteer screenshot approach — screenshot a rendered Astro page at 1200×630. No separate illustration pipeline.

Deferred to chunk 5.5.

---

## Sourcing rules (the banlist)

Explicit rules for what is and isn't allowed. Violations are editorial failures that erode credibility.

**Banned:**
- Generic stock photography (Unsplash, Pexels, Getty, anything that isn't of a real thing).
- AI-generated imagery of any kind: diagrams, illustrations, photographs, code screenshots. No exceptions.
- Figma/Sketch mockups presented as real screenshots.
- Competitor product screenshots used without credit or legal clearance.
- Screenshots with real user data (email addresses, names, PII). Always use fake/test data or blur.

**Allowed:**
- Raw screenshots of apps Dylan built or is narrating.
- Raw screenshots of third-party tools when they're the subject of the piece (credit in caption).
- Photographs Dylan took, only if the photograph is of a real thing (whiteboard sketch, physical artefact, workshop setup).
- Mermaid-sourced or hand-authored SVG diagrams per the rules above.
- Typographic covers for writing posts.

**Credit format when third-party imagery is used:**
Caption: `Source: <site name>, <date>.` One line, mono, same style as diagram captions.

---

## File standards

### Formats
- **Diagrams:** SVG (scalable, small, text-searchable for accessibility).
- **Screenshots:** WebP at quality 90 (30-50% smaller than PNG, universal 2026 support).
- **Code screenshots:** PNG exported from Ray.so / Carbon, converted to WebP via `cwebp` for repo storage.
- **Photographs (if ever used):** WebP at quality 85.
- **Chat transcripts:** JSON, one file per transcript, stored in the `transcripts` content collection (Zod-validated at build).

### Repo layout (portfolio repo)

```
src/
  assets/
    diagrams/              # committed SVG outputs (the things shown in pages)
    screenshots/           # committed WebP screenshots
    og/                    # committed OG/social WebPs (chunk 6+)
  components/
    Screenshot.astro       # framing component (chunk 4c)
    ChatTranscript.astro   # transcript framing component (chunk 4c.1)
  content/
    transcripts/           # published transcripts (JSON, Zod-validated)
      drafts/              # pending hand-review — not rendered on the site
diagrams-src/              # source files, committed, NOT referenced at runtime
  _template.svg            # canonical hand-authored SVG template (tokens locked)
  *.mmd                    # Mermaid source for flowcharts and simple 2×2
  *.svg                    # hand-authored source for causal loops, networks
scripts/
  capture-screenshots.ts   # Puppeteer capture script (chunk 4d)
  render-diagrams.sh       # mmdc batch script (chunk 4d)
  bookmark-transcript.mjs  # /bookmark backing script — captures a draft (chunk 4a.6)
  promote-transcript.mjs   # draft → published, runs redaction regex (chunk 4a.6)
```

### Naming convention

`<case-study-slug>-<short-descriptor>.<ext>`

Examples:
- `the-weekly-consolidation-flow.svg`
- `the-weekly-browse-mobile.webp`
- `planner-app-sms-architecture.svg`
- `portfolio-royal-tonal-scale.svg`

Short descriptor uses kebab-case, 2-4 words, describes what's in the image not what section it lives in. "hero" is banned as a descriptor because it ties the file to a layout position instead of its content.

### Dark-mode only

The portfolio is dark-mode only, so every imagery asset is produced dark-mode only. No light-mode variants. No `@media (prefers-color-scheme: light)` overrides on the `<Screenshot>` component. One source of truth, no drift.

---

## Workflow summary

End-to-end, from "I need an image" to "committed in the portfolio":

**Diagram (flowchart):**
1. Decide archetype (30s).
2. Write `.mmd` source in `diagrams-src/` (3-5 min).
3. Run `mmdc -i <src> -o src/assets/diagrams/<name>.svg --backgroundColor transparent` (5s).
4. Check render in browser (30s).
5. Commit both `.mmd` and `.svg`.
Total: ~10 minutes.

**Diagram (simple 2×2):**
1. Decide archetype (30s).
2. Write Mermaid `quadrantChart` source in `diagrams-src/` (3-5 min).
3. Run `mmdc` (5s).
4. Review SVG in browser (30s).
5. Commit both `.mmd` and `.svg`.
Total: ~10 minutes.

**Diagram (causal loop, network, custom 2×2):**
1. Decide archetype (30s).
2. Copy `diagrams-src/_template.svg` to `diagrams-src/<name>.svg` (5s).
3. Edit shapes, positions, labels directly in the SVG file (5-8 min).
4. Copy to `src/assets/diagrams/<name>.svg`.
5. Commit the source SVG under `diagrams-src/` and the referenced copy under `src/assets/diagrams/`.
Total: ~10 minutes.

**Screenshot (UI):**
1. Add entry to `scripts/capture-screenshots.ts` config (1 min).
2. Run `npx tsx scripts/capture-screenshots.ts` (30s).
3. Reference from MDX via `<Screenshot src="..." alt="..." caption="..." />`.
4. Commit the WebP.
Total: ~3 minutes per new screenshot after initial script setup.

**Screenshot (code):**
1. Paste code into Ray.so with Vercel dark theme (1 min).
2. Export PNG, convert to WebP with `cwebp` (30s).
3. Reference from MDX via `<Screenshot>`.
4. Commit the WebP.
Total: ~3 minutes.

**Chat transcript:**
1. Notice a moment worth capturing during a live session (0s — just pay attention).
2. Fire `/bookmark <slug> "short note"` inline (5s).
3. Skill writes a draft JSON to `src/content/transcripts/drafts/<slug>.json` with the last 6 turns (default) and runs the automated redaction pass (5s, invisible to user).
4. At session-end, review the draft (hand-check for PII/paths the regex missed, tighten the note if useful, delete if on reflection it's not worth shipping) — 1–3 min per draft.
5. Run `npm run promote-transcript <slug>` to move draft → published and commit.
Total: ~5 seconds in-session, ~3 minutes at session-end.

---

## What this feeds into

- **Chunk 4a.4** — this doc is the input for the "Imagery & illustration standards" section of `.claude/rules/writing-style.md` (workspace repo). That section is a compressed version of this research, not a copy.
- **Chunk 4a.6** — the bookmark/capture/promote workflow and the `transcripts` content collection schema are built here. First-use gate: bookmark one real moment from the next portfolio session before chunk 4b starts, to validate the flow end-to-end.
- **Chunk 4c** — layout mockups include real imagery slots per these rules. The `<Screenshot>` and `<ChatTranscript>` components are built here so the layouts can demo both.
- **Chunk 4d** — the-weekly case study workshop produces the first real diagrams, screenshots, and transcript embeds using this workflow, and validates it end-to-end. The Puppeteer capture script and mmdc batch script are built here.

## Open items deferred

These are real but not blocking:

- **Mermaid `themeVariables` file.** The exact mapping of Royal Tonal tokens to Mermaid internal variables. Sketched above but not tested. Built when the first flowchart renders in 4d.
- **`_template.svg` canonical template.** The starting point for hand-authored causal loops and networks. Locked tokens: stroke weight, corner radius, colours, font. Authored in 4d with the first real non-flowchart diagram.
- **d2 evaluation.** If causal loops or networks turn out to need more than two instances, evaluate [d2](https://d2lang.com/) as a replacement for hand-authored SVG. Text-sourced, clean vector output, all four archetypes supported. Deferred because one extra tool is not worth it for a handful of diagrams.
- **OG image generation.** The second Puppeteer pass for social-share preview WebPs. Deferred to chunk 6.
