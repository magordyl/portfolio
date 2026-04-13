---
slug: workflow-evolution-series
title: "How my workflow has evolved since I started using Claude Code"
status: seed
captured: 2026-04-12
transcripts:
  - planner-stitch-batch-40-renders
source_project: portfolio
context: ""
---

**Shape:** a series, not a single post. Meta-frame is "what changed in my working patterns once an LLM agent could actually touch the repo." Each sub-post covers one aspect of the workflow. The series itself is the spine; the sub-posts are the ribs.

**Working title options for the series:**
- How my workflow has evolved since I started using Claude Code
- The workflow shift
- What changed once the agent could touch the repo

## Sub-posts

Each is a seed. None has a thesis locked in yet. Expand into individual numbered entries in this doc once one of them graduates from seed to `[researched]`.

1. **Engineering, architecture, technology, source control.** How day-to-day engineering changed: TDD rhythm, pre-commit hooks as the safety net, `npm run check` as the single gate, commit granularity per chunk, architecture principles file as a durable rules layer, raw SQL + typed helpers over ORMs, bundle-size discipline, platform primitives over libraries when the API is small. The working principle: the agent makes the expensive bits (design, test coverage, refactor sweeps) cheap enough that the discipline you always *should* have had becomes the discipline you actually keep. Candidate pivot: "the rules file is the product." The architecture-principles.md and the rules/ directory are the real artefacts.

2. **Portfolio maintenance workflow.** How the portfolio itself is built and maintained. The diary-first discipline (DIARY.md per project, entry on every commit, retro hooks). The plans/ folder as durable context. The `/session-end` skill that ties commit, diary entry, and retro into one step. Content-first sequencing on chunk 4 (template scaffold before layouts before writing). Chat transcripts as a first-class artefact type. The bookmark/promote pipeline. The compounding return: every session leaves the repo in a shape where the next session can start cold and still be productive.

3. **Design.** How design decisions happen when the agent can render options in parallel. Design explorers as a first-class workflow primitive (palette explorers, card deep-dives, diagram aesthetic explorers). Rationale lives inline in the artefact, not in Figma comments. The shift from "pick a direction then execute" to "render 5 directions side-by-side then pick." Feedback on concrete renders is far higher fidelity than feedback on descriptions. Candidate thesis: the design explorer is the process for any decision with more than two axes.

   **Hero example:** `planner-stitch-batch-40-renders` transcript (bookmarked 2026-04-13). Chunk 11b of the planner V1 redesign. 40 mobile mockups (10 directions × 4 screens) generated in ~2 hours via Stitch MCP, against a locked Forest × Spring design system. The full design-direction prompts and generation tool calls are visible in the transcript expanders — readers can see exactly what was sent to the model and what came back. Demonstrates the 4-gate upfront-judgment pattern (lock the design system, lock the directions, lock the prompt templates, then run mechanically). Shows the cost/value tradeoff of "render everything, decide on real artefacts" vs Figma iteration.

   **Process-comparison diagram (must build for this sub-post):** a side-by-side visual showing the design process across the three portfolio projects.
   - **Project 1 — the-weekly:** linear, design-then-build. Picked an aesthetic, executed against it, iterated by hand. POC → design overhaul → current.
   - **Project 2 — portfolio:** explorer-led, parallel. Built design explorers (palette, card deep-dives, diagram aesthetic) before committing to any layout. Decision lived in the artefact, not in a Figma comment thread.
   - **Project 3 — planner:** locked-gate batch. Gate 0–3 lock the design system, the direction count, the prompts. Then 40 renders run mechanically, judgment compresses into review-by-comparison.
   The diagram should make the shape of each process visible — linear vs branching vs gated batch. One of the four diagram archetypes from the imagery standards (likely flowchart or causal loop). Caption describes the shape; meaning lives in the prose.

4. **Idea capture.** How ideas move from "thing I said in a conversation" to "entry in the pipeline with a README and a canonical artefact." The `ideas/` folder, the tag system, `/new-idea` as a low-friction capture step, the canonical-artefact-first rule, `ideas/DIARY.md` as the piece that closes the product-thinking signal gap. The discipline that separates "captured" from "researched" from "ready to build."

## Why this is a series and not one post

Each aspect has its own audience and its own thesis. Collapsing them into one post forces a single frame that dilutes each individual claim. A hiring manager reading the engineering post and one reading the design post are being sold different things.

The series frame also lets the sub-posts link to each other. Cross-links reward the reader who cares about more than one aspect, without forcing the single-post reader to wade through all four.

## Supporting arguments to develop across the series

1. **The rules file is the product.** The durable artefact is the rules/hooks/skills/memory layer that made the agent useful. Ship the rules.
2. **Discipline gets cheap.** Things you always knew you should do (TDD, pre-commit checks, granular commits, diary entries, retro notes) stop costing willpower when the agent handles the mechanical bits.
3. **Parallel rendering changes the decision shape.** For anything with more than two axes, rendering five options is cheaper than describing one and iterating.
4. **Capture-to-ship pipelines beat capture-only tools.** A pipeline with explicit transitions (seed to researched to ready-for-design to shipped) is what makes ideas actually move.
5. **Meta-loop as proof.** The portfolio that documents the workflow was built using the workflow.

## Open questions for the series

- Does the series ship as four posts released together, four posts staggered, or one post plus three "deep dive" companions?
- Which sub-post leads? Engineering is the most universal but the least distinctive. Design is the most visual. Idea capture is the most personal. Portfolio-maintenance is the most meta.
- What's the hook for the series frame?
- Is there a fifth aspect that should be in the series? Candidates: writing, testing/coverage, or debugging. Lean no.

## Draft status

`[seed]`. Captured 2026-04-12. Do not expand into drafts until chunk 5.5 begins. Each sub-post may graduate independently.
