# Imagery and Transcript Standards

Applies to case studies and writing posts in the portfolio repo. Loads only when CWD is inside this repo. Compressed from `plans/portfolio-imagery-standards.md` — read that for reasoning, tooling specs, and file-layout details.

---

## Aesthetic direction

Clean vector Royal Tonal for diagrams (A2 in `plans/portfolio-stitch-assets/diagram-aesthetic-explorer-v1.html`). Royal Tonal-framed screenshots of real artefacts, cropped and zoomed programmatically. Verbatim chat transcripts as a first-class artefact. No figurative illustration.

## Diagrams

- **Four archetypes only** (flowchart, 2×2, causal loop, network). See writing-style-long-form rule 7.
- **Placement:** before the paragraph that interprets. See writing-style-long-form rule 6.
- **Caption** describes what the diagram *shows*, never what it *means*. Meaning lives in the prose below. One short sentence, mono, muted colour.
- **Line style:** clean vector, precise strokes, rounded corners. Royal Tonal 8 stroke on Royal Tonal 12 background. No sketch wobble. No hand-drawn fonts. Same aesthetic across all four archetypes.
- **Stroke weight:** 1.5px for node outlines, 1.5px for arrows. Node corner radius 8px.
- **Colour:** monochrome Royal Tonal. No rainbow taxonomies. Differentiate by shape or position, not hue.
- **Typography:** Geist (body sans) at 13px, weight 500, for all labels. No handwriting fonts.

## Screenshots

- **Real UI only.** Running apps, terminal output, code editors with real code, data artefacts in real viewers, deployed sites. Never Figma mockups, never marketing renders, never design-tool assemblies pretending to be real UI.
- **Frame applied at render time**, never baked in. A single `<Screenshot>` Astro component provides consistent framing across the site. Raw captures stay raw in the repo.
- **Crop, focus, and zoom are programmatic.** One raw fullsize screenshot is the source of truth per UI state. Every view of that screenshot (wide, cropped hero, zoomed detail, offset callout) is produced at render time via `crop`, `focus`, and `zoom` props on the `<Screenshot>` component. Never manually crop or edit the source. Never commit a derivative. One artefact, many views.
- **Code-specific screenshots:** Ray.so with Vercel dark theme is the allowed exception for code (not UI). Export wraps in the same `<Screenshot>` frame.

## Chat transcripts

First-class artefact. The portfolio is largely about learning to ship with Claude Code, so verbatim session snippets are the strongest product-thinking signal available. A paraphrased or fabricated exchange is worse than none at all.

- **Verbatim only.** Never edit turn text beyond the redaction pass. Never reorder turns. Never combine turns from different sessions. Never add turns that didn't happen.
- **Tool calls collapsed** to a one-line label (`[Read package.json]`, `[Edit src/foo.ts]`). Never expanded JSON.
- **Length:** 2 turns minimum. Case study embeds aim for 2-8 turns (reader attention inside claim-bearing prose). Writing posts and standalone transcripts have no hard cap: editorial judgment applies when the transcript is the artefact, not evidence for an adjacent claim. ChatTranscript cluster collapsing compresses tool-heavy runs, so a 14-turn session may render as visually short as an 8-turn verbatim embed.
- **Placement:** Process or Lessons sections only. Never Hero, Problem, or Outcome. Those are claim sections, and a transcript in a claim section invites the reader to scan the dialogue for validation instead of trusting the prose.
- **Redaction:** automated regex pass (secrets, absolute paths, emails) followed by mandatory hand-review before promotion from draft to published. No exceptions. A transcript that has not been hand-reviewed does not appear in a published page.
- **Budget per case study or essay:** up to two breakout transcripts (the pivotal moments) and up to two inline transcripts (routine dialogue).

## Sourcing banlist

- No generic stock photography (Unsplash, Pexels, Getty).
- No AI-generated imagery of any kind. The Mermaid `handDrawn` RoughJS effect is allowed because it is deterministic vector output, not generative imagery.
- No Figma or Sketch mockups presented as real screenshots.
- No competitor product screenshots without credit or legal clearance.
- No screenshots with real user PII. Fake or test data only.

## Illustrations, deliberately absent

No figurative illustration. No characters, no scenes, no hand-drawn metaphors. Dylan is not an illustrator, AI-generated illustration carries its own AI tell, and diagrams plus screenshots cover every visual need the case studies have.

The single exception is typographic covers for writing posts: large Fraunces title on a Royal Tonal gradient block, no figurative element. Deferred to chunk 5.5.
