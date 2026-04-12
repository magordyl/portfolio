# Portfolio Writing Brainstorm

Capture doc for writing post ideas that will ultimately land in `src/content/writing/`. Entries start as seeds and graduate to drafts during chunk 5.5.

**Status tags:** `[seed]` freshly captured · `[researched]` has supporting material · `[drafting]` under active write-up · `[shipped]` published as a content entry.

**Discipline:** do not start drafting any entry until chunk 5.5 begins. Content-first sequence from chunk 4a applies: template scaffold (4b) and layout mockups (4c) must lock before any writing work starts.

---

## 1. Code-first artefacts `[seed]`

**Working title options:**
- Build the tool, not the tooling
- Code-first artefacts
- Miro is a tax
- The crossover point is sooner than you think

**Thesis (user's exact wording):**

> Product and design artefacts should be code-first from now. AI enables creation of custom-built bespoke tooling in far less time than populating data in traditional SAAS tools and re-exporting it out to wherever it needs to go next.

### Primary example: the planner V1 story map

Built in a single planning session as a self-contained HTML file with drag-and-drop card movement, inline editing at every level of the map (title, skeleton activities, sub-steps, release names, release notes, card titles, card descriptions), three spare releases, two spare skeleton groups for finer slicing, localStorage persistence, markdown export, and URL-hash cross-device state sync. Deployed as a static asset inside the portfolio repo at `public/artefacts/planner-v1-story-map/`. A standalone decoder script (`decode-state.mjs`) lives alongside the working copy in the planner-app plans folder so share URLs can be round-tripped back into readable JSON without running the tool itself.

The relevant features were discovered iteratively as the author described what they actually needed. None of them required adopting a new tool. None of them required a backend. The artefact ships with the portfolio repo and inherits the portfolio's deploy path for free. Editing on a phone, editing on a laptop, and sharing state back into a Claude conversation all work through the same URL-hash mechanism with zero infrastructure.

**Links:**
- Live: `https://dylan-portfolio.magordyl.workers.dev/artefacts/planner-v1-story-map/`
- Source (working copy): `planner-app/plans/v1-redesign/story-map.html`
- Source (deployed copy): `portfolio/public/artefacts/planner-v1-story-map/index.html`
- Decoder: `planner-app/plans/v1-redesign/decode-state.mjs`

### Why the bespoke tool beat the alternatives

- **Miro / Figma story map templates.** Schema-constrained: the grid shape is fixed, release notes live somewhere awkward, sub-step headings are cosmetic rather than structural. Sharing requires an account on both sides. Export is lossy. State is hostage to the vendor.
- **Notion / Airtable.** Editable cells, but recreating a Patton-style 2D grid with release notes, skeleton groupings, and per-card descriptions takes longer than building bespoke. The data model you end up with inside those tools is a second-class approximation of what you actually meant.
- **Jira / Linear.** Hardcoded to ticket shapes. Story maps are not in the shape the tool thinks in.
- **A physical whiteboard.** Works until you want to edit it on your phone during the commute.

The bespoke tool modelled exactly the author's story map thinking with no adaptation tax, no vendor dependency, and no schema wrangling.

### Supporting arguments to develop in the draft

1. **The cost curve has moved.** Before LLM-assisted coding, SAAS tooling made sense because building bespoke was slower than fighting the tool's data model. That tradeoff has inverted for "artefact-shaped" use cases where one person needs one specific tool for one specific job.
2. **Every SAAS tool imposes a schema on you.** A bespoke tool models the domain. The difference shows up exactly at the moment you realise the field you need is one the vendor chose not to support.
3. **The artefact ships with the repo.** Bespoke tools are versioned, committable, diff-able, grep-able, linkable. They live alongside case studies, diary entries, and source files. SAAS data lives in the vendor's database until the subscription ends.
4. **URL-hash state is the cross-device unlock.** Most "I need this on my phone" asks can be solved with base64-encoded JSON in the URL. No backend, no accounts, no subscription. The decoder script is the insurance policy.
5. **Decoder scripts make the data format durable.** If the tool itself vanishes tomorrow, the data survives because the encoding is documented alongside a reader that will run on any Node install.
6. **The meta-loop is the punchline.** The reader of the post is looking at the thing the post is arguing for. The story map is both the illustration and the proof.

### Counterpoints to address

- *"SAAS tools have integrations, exports, and collaboration I won't replicate."* True in the abstract. Audit the features you actually use on the specific artefact in front of you. Usually almost none of them are load-bearing for this one artefact.
- *"Collaboration needs server-backed sync."* True for large teams editing concurrently. This argument is about solo and small-team artefacts where a shared URL is enough of a handoff.
- *"It is not faster for trivial things."* True for the simplest cases. The crossover point where bespoke beats SAAS is closer than most people think once "SAAS" includes sign-up, schema wrangling, onboarding collaborators, and export friction.
- *"The bespoke tool is throwaway code."* The features are throwaway by design. They fit exactly one artefact and that is the point. The artefact itself is not throwaway: it ships with the repo and can outlive any SAAS subscription.

### Open questions for the draft

- Is there a class of artefact where SAAS still wins? Probably: anything that requires real-time multiplayer, rich media editing, or very large data. Worth naming the boundary.
- What is the actual crossover point in time-to-first-useful-version? The planner story map took ~1 session. A traditional Miro story map would take ~15 minutes of clicking plus ongoing export friction. Is one session really a win? The argument is that iteration and deployment are also cheaper, not just first-build.
- How much of this thesis depends on being able to host at zero marginal cost (portfolio already deploys)? If the reader has to stand up new infra for each artefact, the calculus is different.

### Draft status

`[seed]`. Captured 2026-04-11 during the planner V1 planning session. Do not expand into a draft until chunk 5.5 begins.

---

## 2. How my workflow has evolved since I started using Claude Code `[seed]`

**Shape:** a series, not a single post. Meta-frame is "what changed in my working patterns once an LLM agent could actually touch the repo." Each sub-post covers one aspect of the workflow. The series itself is the spine; the sub-posts are the ribs.

**Working title options for the series:**
- How my workflow has evolved since I started using Claude Code
- The workflow shift
- What changed once the agent could touch the repo

### Sub-posts

Each is a seed. None has a thesis locked in yet. Expand into individual numbered entries in this doc once one of them graduates from seed to `[researched]`.

1. **Engineering, architecture, technology, source control.** How day-to-day engineering changed: TDD rhythm, pre-commit hooks as the safety net, `npm run check` as the single gate, commit granularity per chunk, architecture principles file as a durable rules layer, raw SQL + typed helpers over ORMs, bundle-size discipline, platform primitives over libraries when the API is small. The working principle: the agent makes the expensive bits (design, test coverage, refactor sweeps) cheap enough that the discipline you always *should* have had becomes the discipline you actually keep. Candidate pivot: "the rules file is the product." The architecture-principles.md and the rules/ directory are the real artefacts — they're the memory that makes the agent useful on turn 50 of a session.

2. **Portfolio maintenance workflow.** How the portfolio itself is built and maintained. The diary-first discipline (DIARY.md per project, entry on every commit, retro hooks). The plans/ folder as durable context. The `/session-end` skill that ties commit, diary entry, and retro into one step. Content-first sequencing on chunk 4 (template scaffold before layouts before writing). Chat transcripts as a first-class artefact type. The bookmark/promote pipeline. The compounding return: every session leaves the repo in a shape where the next session can start cold and still be productive.

3. **Design.** How design decisions happen when the agent can render options in parallel. Design explorers as a first-class workflow primitive (palette explorers, card deep-dives, diagram aesthetic explorers — all captured as HTML artefacts, all committed, all preserved as iteration trails). Rationale lives inline in the artefact, not in Figma comments. The shift from "pick a direction then execute" to "render 5 directions side-by-side then pick." Feedback on concrete renders is far higher fidelity than feedback on descriptions. Candidate thesis: the design explorer isn't a step in the process, it *is* the process for any decision with more than two axes.

4. **Idea capture.** How ideas move from "thing I said in a conversation" to "entry in the pipeline with a README and a canonical artefact." The `ideas/` folder, the tag system (seed / researched / ready-for-design / shelved), `/new-idea` as a low-friction capture step, the canonical-artefact-first rule for summarisation, `ideas/DIARY.md` as the missing piece that closes the product-thinking signal gap. The discipline that separates "captured" from "researched" from "ready to build" — and how the agent makes each of those transitions cheap enough that ideas actually move through the pipeline instead of rotting in a notes file.

### Why this is a series and not one post

Each aspect has its own audience and its own thesis. Collapsing them into one post forces a single frame ("here's how Claude Code changed my work") that dilutes each individual claim. A hiring manager reading the engineering post and a hiring manager reading the design post are being sold different things — one is buying discipline, the other is buying fidelity and iteration speed.

The series frame also lets the sub-posts link to each other. The engineering post can reference the portfolio-maintenance post's `/session-end` skill; the idea-capture post can reference the design post's explorer pattern. Cross-links reward the reader who cares about more than one aspect, without forcing the single-post reader to wade through all four.

### Supporting arguments to develop across the series

1. **The rules file is the product.** The durable artefact isn't the code the agent wrote in any given session. It's the rules/hooks/skills/memory layer that made the agent useful. Ship the rules.
2. **Discipline gets cheap.** Things you always knew you should do (TDD, pre-commit checks, granular commits, diary entries, retro notes) stop costing willpower when the agent handles the mechanical bits. The win isn't speed, it's actually doing the things.
3. **Parallel rendering changes the decision shape.** For anything with more than two axes, rendering five options is cheaper than describing one and iterating. The design explorer pattern is the concrete instance, but the principle generalises.
4. **Capture-to-ship pipelines beat capture-only tools.** Most "second brain" tools stop at capture. A pipeline with explicit transitions (seed → researched → ready-for-design → shipped) is what makes ideas actually move. The agent makes each transition cheap.
5. **Meta-loop as proof.** The portfolio that documents the workflow was built using the workflow. The reader of each post can inspect the repo that produced the post.

### Open questions for the series

- Does the series ship as four posts released together, four posts staggered, or one post plus three "deep dive" companions? First instinct: four seeds, drafted in parallel during chunk 5.5, released in whichever order lands first. Staggering buys attention, but only if there's a reason the order matters.
- Which sub-post leads? Engineering is the most universal but the least distinctive. Design is the most visual and the most portfolio-shaped. Idea capture is the most personal. Portfolio-maintenance is the most meta. No clear winner yet.
- What's the hook for the series frame? Candidate: the specific before/after moment when the workflow tipped. The planner V1 story map session is one candidate (a single planning session produced a bespoke tool that replaced four SAAS alternatives). The `/session-end` skill landing is another. The first design explorer is a third.
- Is there a fifth aspect that should be in the series? Candidates: writing (how the voice research and `writing-style.md` came together), testing/coverage, or debugging. Lean no — four is already a lot, and writing is arguably covered by the portfolio-maintenance post.

### Draft status

`[seed]`. Captured 2026-04-12. Do not expand into drafts until chunk 5.5 begins. Each sub-post may graduate independently.
