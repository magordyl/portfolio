---
slug: code-first-artefacts
title: "Build the tool, not the tooling"
status: seed
captured: 2026-04-11
transcripts: []
source_project: planner-app
context: ""
---

**Working title options:**
- Build the tool, not the tooling
- Code-first artefacts
- Miro is a tax
- The crossover point is sooner than you think

**Thesis (user's exact wording):**

> Product and design artefacts should be code-first from now. AI enables creation of custom-built bespoke tooling in far less time than populating data in traditional SAAS tools and re-exporting it out to wherever it needs to go next.

## Primary example: the planner V1 story map

Built in a single planning session as a self-contained HTML file with drag-and-drop card movement, inline editing at every level of the map (title, skeleton activities, sub-steps, release names, release notes, card titles, card descriptions), three spare releases, two spare skeleton groups for finer slicing, localStorage persistence, markdown export, and URL-hash cross-device state sync. Deployed as a static asset inside the portfolio repo at `public/artefacts/planner-v1-story-map/`. A standalone decoder script (`decode-state.mjs`) lives alongside the working copy in the planner-app plans folder so share URLs can be round-tripped back into readable JSON without running the tool itself.

The relevant features were discovered iteratively as the author described what they actually needed. None of them required adopting a new tool. None of them required a backend. The artefact ships with the portfolio repo and inherits the portfolio's deploy path for free. Editing on a phone, editing on a laptop, and sharing state back into a Claude conversation all work through the same URL-hash mechanism with zero infrastructure.

**Links:**
- Live: `https://dylan-portfolio.magordyl.workers.dev/artefacts/planner-v1-story-map/`
- Source (working copy): `planner-app/plans/v1-redesign/story-map.html`
- Source (deployed copy): `portfolio/public/artefacts/planner-v1-story-map/index.html`
- Decoder: `planner-app/plans/v1-redesign/decode-state.mjs`

## Why the bespoke tool beat the alternatives

- **Miro / Figma story map templates.** Schema-constrained: the grid shape is fixed, release notes live somewhere awkward, sub-step headings are cosmetic rather than structural. Sharing requires an account on both sides. Export is lossy. State is hostage to the vendor.
- **Notion / Airtable.** Editable cells, but recreating a Patton-style 2D grid with release notes, skeleton groupings, and per-card descriptions takes longer than building bespoke. The data model you end up with inside those tools is a second-class approximation of what you actually meant.
- **Jira / Linear.** Hardcoded to ticket shapes. Story maps are not in the shape the tool thinks in.
- **A physical whiteboard.** Works until you want to edit it on your phone during the commute.

The bespoke tool modelled exactly the author's story map thinking with no adaptation tax, no vendor dependency, and no schema wrangling.

## Supporting arguments to develop in the draft

1. **The cost curve has moved.** Before LLM-assisted coding, SAAS tooling made sense because building bespoke was slower than fighting the tool's data model. That tradeoff has inverted for "artefact-shaped" use cases where one person needs one specific tool for one specific job.
2. **Every SAAS tool imposes a schema on you.** A bespoke tool models the domain. The difference shows up exactly at the moment you realise the field you need is one the vendor chose not to support.
3. **The artefact ships with the repo.** Bespoke tools are versioned, committable, diff-able, grep-able, linkable. They live alongside case studies, diary entries, and source files. SAAS data lives in the vendor's database until the subscription ends.
4. **URL-hash state is the cross-device unlock.** Most "I need this on my phone" asks can be solved with base64-encoded JSON in the URL. No backend, no accounts, no subscription. The decoder script is the insurance policy.
5. **Decoder scripts make the data format durable.** If the tool itself vanishes tomorrow, the data survives because the encoding is documented alongside a reader that will run on any Node install.
6. **The meta-loop is the punchline.** The reader of the post is looking at the thing the post is arguing for. The story map is both the illustration and the proof.

## Counterpoints to address

- *"SAAS tools have integrations, exports, and collaboration I won't replicate."* True in the abstract. Audit the features you actually use on the specific artefact in front of you. Usually almost none of them are load-bearing for this one artefact.
- *"Collaboration needs server-backed sync."* True for large teams editing concurrently. This argument is about solo and small-team artefacts where a shared URL is enough of a handoff.
- *"It is not faster for trivial things."* True for the simplest cases. The crossover point where bespoke beats SAAS is closer than most people think once "SAAS" includes sign-up, schema wrangling, onboarding collaborators, and export friction.
- *"The bespoke tool is throwaway code."* The features are throwaway by design. They fit exactly one artefact and that is the point. The artefact itself is not throwaway: it ships with the repo and can outlive any SAAS subscription.

## Open questions for the draft

- Is there a class of artefact where SAAS still wins? Probably: anything that requires real-time multiplayer, rich media editing, or very large data. Worth naming the boundary.
- What is the actual crossover point in time-to-first-useful-version? The planner story map took ~1 session. A traditional Miro story map would take ~15 minutes of clicking plus ongoing export friction. Is one session really a win? The argument is that iteration and deployment are also cheaper, not just first-build.
- How much of this thesis depends on being able to host at zero marginal cost (portfolio already deploys)? If the reader has to stand up new infra for each artefact, the calculus is different.

## Draft status

`[seed]`. Captured 2026-04-11 during the planner V1 planning session. Do not expand into a draft until chunk 5.5 begins.
