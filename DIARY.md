# Development Diary

## 2026-04-12 — Card deep-dive v3 + v4: how deep to go on the gradient, and why sizing drift is a system bug

Follow-up to v2 in the same day. The user came back with two pieces of feedback that sent the exploration in directions I hadn't anticipated: *first*, pin layout A (top 160px strip) from the v1 shortlist and actually render all six v2 visual types inside it so we could see whether they hold up at strip scale; *second*, when the imagery is a text mark like a numeral or monogram, stop using the signature gradient and use the card's register colour instead, because "the visual identity weakens when a lot of the cards are using the gradient effect, it becomes confusing and unpleasing on the eye." The second one is the critique I should have caught myself in v2 and didn't.

**The gradient overuse problem is a separation-of-concerns failure, not an aesthetics failure.** v2 used the royal → violet gradient as a fill for every text mark because the gradient was "nice." That collapses the work/writing register split — both numerals render in the same royal-to-violet wash regardless of card type, and the page loses the signal that one card is a case study and the other is an essay. The fix is mechanical: text marks use `royal-8` for work, `violet-8` for writing, nothing in between. The gradient still exists — it lives on the `gradient-mark` visual type and on featured card borders — but it stops leaking into every card that happens to use a number. Three signals now reinforce the register split (kicker colour + tag colour + text mark colour) instead of one gradient obliterating it.

**v3 shipped, the user reviewed, then came back with four more refinements.** The response was "for #1 it looks much better" followed by four targeted critiques: (a) sizing was inconsistent between icon / monogram / numeral; (b) the screenshot auto-tint was still reading as gradient because the opacity (0.55) let source hues bleed through; (c) the Geist Mono monogram clashed with the Fraunces numeral; (d) the new text mark colours felt too light compared to the original gradient shades they replaced. Every critique was correct. v3 was solving the *rule* (card colour, not gradient) but hadn't followed through on the *consequences* (sizing needs to unify now that the treatment does; tints need to bite harder; fonts need to be siblings; shades need to match the original anchor weights). v4 caught all four in a single pass.

**The sizing drift was the most embarrassing.** v3 had numeral at 112px Fraunces, monogram at 44px Geist Mono, icon at 68px SVG — three totally different sizes in the same strip, on the same component, rendered as if they were related. When I centred them each in a separate CSS block with no shared shell, I was writing them as three designs instead of three flavours of one design. The v4 fix introduced a shared `.strip.v-numeral, .strip.v-icon, .strip.v-monogram` rule with common background, padding, ruled texture, and centring — then the content-specific rules only set size and colour. Numerals 120px, monograms 72px, icons 88px. All three render at sibling weights in the same frame. The fact that I had to be told this is a workflow signal: when you're writing three instances of the same pattern, extract the shell first and only fight about the content. I should have spotted this during v3.

**The deep-tint fix is a one-line opacity change with a surprisingly big consequence.** v2/v3's screenshot auto-tint was `mix-blend-mode: color; opacity: 0.55`, which at 55% blend keeps ~45% of the original image's hue visible — enough that a deliberately off-palette source (the magenta → yellow → cyan fake screenshot I used for testing) still reads as a mixed palette, not a locked royal. Bumping opacity to 0.9 locks the colour almost completely. The proof is still in the artefact — the same raw gradient photo renders as flat royal on the work card and flat violet on the writing card. This is the difference between "the tint is applied" and "the tint owns the pixel." For zero extra author effort on any future screenshot the author drops in, that's a better default.

**The Fraunces/Geist Mono mismatch was a "respect the family" problem.** v3 used Fraunces for the numeral (a display serif) and Geist Mono for the monogram (a monospace sans). Both are in the Royal Tonal type system, both are legitimate choices in isolation, and side-by-side on a grid they looked like two different projects pretending to be one. v4 unified on Fraunces for both — monogram sits at 72px with tight letterspacing and reads as a confident display lockup, not a caption. Monograms like `PLN` and `R/W` are short enough that Fraunces handles them without the typesetting constraints that normally push initials into mono. The monospace alignment argument for monogram didn't survive one look at the result.

**The M5 + M6 combined question was the cleanest part of the session.** Mobile screenshots don't fit Layout A's 2.6:1 strip cleanly at any obvious scale (phone screens are ~1:2.16), so v3 mocked six solutions. The user liked M5 (meta split: big numeral + tilted phone) and M6 (UI detail zoom) and asked whether using both on one page creates hierarchy or visual noise. My view: hierarchy. M5 anchors *one* card by number — "this is piece 01, start here" — and M6 supplies the body vocabulary for every other work card. Max one M5 per grid is the rule. The risk isn't busy-ness (both compositions are clean); the risk is that both want to be the standout card if used at equal frequency, which flattens the very hierarchy they're meant to create. v4's §3b shows a four-card 2×2 with one M5 anchor and three M6 bodies, and the ordering signal reads immediately. One caveat flagged in the doc: on `/work` and `/writing` index pages where every card is a flat list, skip M5 entirely — with no obvious "first" card, the big 01 numeral is noise.

**The iteration trail is now four versions deep and the "rejected trail" is the interesting part.** v1 (six layouts), v2 (mandatory imagery + auto-tint + writing differentiation), v3 (layout A pin + gradient rule change + mobile exploration), v4 (sizing + deep palette + combined mobile). All four files live in `plans/portfolio-stitch-assets/` as committed artefacts. A case study about the card component design process — which is almost certainly going to be one of the portfolio's case studies, because this IS the process — can tell a genuinely interesting story by walking through the rejected options and explaining *why* each one was wrong. "We rejected layout D (corner accent) at v1 because corner accents collapse at strip scale" is a better sentence than "we chose layout A." The iteration trail discipline is paying for itself.

**What this session got right.** The user was specific about every piece of feedback — no vague "I don't love it," always "the sizing is inconsistent" or "the font mismatch is jarring" — and v4 was able to catch every item in a single pass because the critiques were all actionable. The shared-shell extraction in the CSS wasn't just an aesthetic fix; it made the v4 refinement pass trivial (change one rule, all three types update). Preserving v3 alongside v4 even though v4 supersedes it kept the rejected-trail story intact.

**What this session is at risk of getting wrong later.** Two open questions survived into v4 and need to be resolved before the card spec locks: *first*, does the `gradient-mark` visual type stay in the default author's pool or drop to a reserved slot for featured cards + palette-as-subject writing posts only? The consistent answer given the deep-palette rule is to reserve it — if the whole point of v4 is to make the gradient rare and meaningful, then keeping gradient-mark as a default filler option contradicts that. But if the portfolio ships with several palette/colour/system writing posts, they'll need gradient-mark available without special permission. *Second*, do M5 and M6 become explicit `image.kind: "mobile-screenshot-hero" | "mobile-screenshot-detail"` sub-types in the Card props API, or do they live as capture-time decisions handled by the `<Screenshot>` helper? My lean is the helper — keep the Card API surface `kind: "screenshot"` and compose M5/M6 in `<Screenshot>` — but the user hasn't called it yet.

**Next:** User review of v4. If the two open questions land and v4 decisions lock, the card component spec freezes and chunk 4b (case study content hierarchy) can start. Chunk 4a.4 / 4a.5 / 4a.6 (foundation work — writing style guide, ideas diary, transcript capture tooling) still need to finish before 4b opens, so 4b is realistically two to three sessions away.

---

## 2026-04-12 — Card deep-dive v2: mandatory imagery, auto-tint, and a differentiation question that answered itself

The v1 card deep-dive closed last session with a recommendation of layout D (corner accent) and an open question about imagery: should it be optional (risk: cards with and without images read as different species) or mandatory (risk: heterogeneous visual types scattered across the grid with no unifying language). v1 dodged by making imagery optional and letting layout D absorb the mixed state. v2 had to commit either way. The user picked mandatory and asked the right follow-up — *how do you make six different visual types cohere on one page*.

**The answer is three locks, not one lever.** Frame, palette, treatment. The frame is the strongest single lever: every image lives in the same 64×64 rounded rectangle with the same border, the same inset, the same pin position, the same hover behaviour. Whatever content fills the frame, the container never changes. The second lock is palette adherence — every image has to resolve to royal or violet tones, no raw hex allowed. The third lock is shared treatment — same hover, same inner shadow, same corner accent position. Individually each lock is obvious. Collectively they mean six visual languages (screenshot, diagram, numeral, gradient-mark, icon, monogram) can sit next to each other on one grid and still read as one system.

**The tint automation was the session's actual technical breakthrough.** The user asked a question I had not thought through: *can tint be done at the component layer without the author processing screenshots manually?* I had been planning a manual tint pass as part of the screenshot workflow — author exports a screenshot, author applies a Photoshop tint, author saves the tinted version into `/public`. That is exactly the kind of friction that dies the first time the user is tired. The answer turned out to be `mix-blend-mode: color` on a `::after` overlay. The blend mode preserves the image's luminance (shadows, highlights, shape detail) but replaces the hue entirely with the overlay colour. One CSS rule on the component, zero author effort, and crucially it works on *arbitrary* input — I proved it in the v2 artefact by using a deliberately off-palette "photo" (magenta → yellow → cyan gradient) as the test case and rendering it in royal tones. The author drops in a raw screenshot tomorrow, the component pulls it into the palette. This is the right shape of automation: the expensive cognitive step (picking the screenshot) happens once in-flow, everything downstream is mechanical.

**The writing differentiation question resolved itself during drafting.** v1 used a left-edge violet stripe to mark writing cards as a distinct register from case study cards. The user wanted it gone and asked for alternatives. I mocked four: top rule, kicker dot, kicker icon, tinted corner frame. Then I mocked a fifth called "baseline" — nothing structural, only kicker colour and tag colour doing the work. The moment I looked at baseline next to the mandatory-imagery cards from §2, I realised the tinted corner was already happening on every writing card as a consequence of the auto-tint rule (violet overlay instead of royal). That meant "baseline + tinted corner" was the free answer — the tint was already earning its keep, it just needed to be recognised as the differentiation lever instead of treated as an incidental. Three reinforcing signals (violet kicker + violet tag + violet-tinted corner) on a small surface is already enough. The top rule and kicker icon variants survive in the doc as fallbacks if real content doesn't read clearly enough once the `/writing` index is populated, but my prediction is that it will.

**The whole-card click pattern is the boring a11y-correct one.** Visible anchor stays on the heading (keyboard focus ring lands on the title, screen readers announce one link with the title as the accessible name), and a `::after` pseudo-element on the link stretches `inset: 0` over the whole card to extend the hit target. Tags sit on `z-index: 2` so if they become real links later, they stay independently clickable. Text selection still works because the overlay has no background. Nothing surprising — this is Heydon Pickering's canonical "cards" pattern — but worth writing it down once in the v2 doc so it's frozen as the spec before implementation.

**What this session got right.** The user's question about tint automation was the right question to ask, and the answer changed the authoring cost of the whole imagery system. The "baseline + tinted corner" recognition saved a visual element the portfolio didn't need. The iteration trail discipline held — v1 was left intact next to v2 in the plans folder, so the "here's what we rejected and why" story is still readable. The backfill commit cleaned up seven accumulated artefacts from prior sessions that should have been committed earlier, including the full accent-palette-explorer v1→v5 trail and card-deep-dive-v1 itself.

**What pends.** The user has to review v2 and confirm baseline + tinted corner is the right call (or pick one of the structural fallback variants). Then this becomes the locked card component spec and chunk 4b (case study content hierarchy) can start. The six visual types need to map to real content as soon as 4b defines the case study slots — which type belongs on the Planner App card, which belongs on the The Weekly card, which belongs on the writing posts, etc. That mapping is not urgent for 4b itself but will determine the first real test of whether the frame + palette + treatment locks actually hold under mixed content.

**Next:** User review of v2, pick a differentiation variant, lock the card spec, start chunk 4b.

---

## 2026-04-12 — Transcripts as a first-class artefact, and why the bookmark happens in-flow

The portfolio is largely a "learning to ship with Claude Code" narrative, and that narrative lives or dies on whether the reader believes the reasoning in the case studies is real. Claimed reasoning — "I considered X and chose Y because Z" — is worth roughly nothing in 2026; every AI-assisted portfolio says the same sentence. Shown reasoning, as a verbatim exchange between me and Claude where the decision actually happens, is worth a lot more, because it can't be fabricated without it reading fabricated. This session turned that observation into a plan amendment.

**The decision that shaped everything downstream was about when the judgment call happens, not how the capture works.** My first instinct was to build a post-hoc capture tool: run a script at session end, select a range, extract. The user rejected it in one sentence — "I don't want to have to trawl back through later" — and the whole architecture flipped. The expensive cognitive step is "is this moment worth capturing?" and that step is cheapest *in the moment*, when context is fresh and judgment is sharpest, not at session end when the session is a blur. Post-hoc capture forces the user to re-read their own session looking for moments they already half-forgot. In-flow capture lets the user burn one slash command at the exact instant of recognition and move on. Every other design decision falls out of that: the `/bookmark` skill is just the cheapest possible way to mark the moment without breaking flow, and everything afterwards (extraction, storage, formatting, redaction) is mechanical and has to be automated so it never competes for attention.

**Three things are first-class artefacts now, not two.** The amended 4a.3 imagery standards doc opens with "Cutler-influenced sketch aesthetic for diagrams, Royal Tonal-framed screenshots of real artefacts, verbatim chat transcripts as a first-class artefact type, no figurative illustration." Transcripts get the same treatment as diagrams and screenshots: a frame spec (dark Royal Tonal 950 background, 12px radius, sender labels in Geist Mono, Claude in Royal Tonal 500 and Dylan in 300, quiet hairline separators between turns), a placement rule (Process and Lessons sections only, never Hero/Problem/Outcome), a length rule (2 to 8 turns, tool calls always collapsed to a one-line label), and a non-negotiable verbatim rule. The last one matters most — the credibility of a transcript embed comes entirely from its rawness. The moment a reader suspects a transcript has been tidied up, the signal inverts and it starts reading like marketing. Never edit turn text, never reorder turns, never combine turns from different sessions, never add turns that didn't happen. If the real transcript doesn't make the point, pick a different moment or tell the story in prose.

**The word budget rule was a small but important guardrail.** Transcript embeds count as 50 words against a section's word budget regardless of actual turn length. The math doesn't matter; the discipline does. Without a budget cost, embeds start being used to pad thin sections, and the case study becomes a scrapbook of Claude quotes with connective tissue between them. With a 50-word cost per embed, a Process section (200-word budget) can carry one embed comfortably, a second is painful, and a third is structurally impossible. That's the right shape — transcripts earn their place by being pivotal, not by being plentiful.

**A new chunk 4a.6 absorbed the tooling work so 4b could stay pure.** The original plan sequence was 4a → 4b (template) → 4c (layout) → 4d (workshop). Capture tooling doesn't fit cleanly in any of those; it's foundation work, but it's portfolio-repo code rather than workspace-repo prose. Adding 4a.6 as the last sub-chunk of 4a keeps the foundation phase together while giving the tooling its own commit: define the `transcripts` content collection with Zod schema at `src/content.config.ts`, build `scripts/bookmark-transcript.mjs` (locate the active session JSONL by mtime, extract N turns, collapse tool calls to one-line labels, run a redaction regex pass, write to `src/content/transcripts/drafts/`), build `scripts/promote-transcript.mjs` (validate, re-run redaction, print a hand-review checklist, move from drafts/ to published), create the `/bookmark` skill, wire draft review into `/session-end`. The first-use gate is non-negotiable: bookmark one real moment from the next session and promote it end-to-end before chunk 4b starts. Any friction — wrong default window, regex missing something, session file not locatable — gets fixed before it hits the-weekly workshop.

**The `<ChatTranscript>` component is deliberately deferred to 4c.1, not 4a.6.** Keeping the data pipeline (4a.6) separate from the render layer (4c.1) lets drafts start accumulating immediately — from the very next session — without blocking on a component that would waste time to build before the layout mockups have decided what its frame even looks like. Same split-the-content-from-the-presentation pattern that shaped chunk 4a.3's Puppeteer + `<Screenshot>` split. When the component finally gets built in 4c.1, both `case-study-v1.html` and `case-study-v2.html` have to render at least one inline transcript and one breakout transcript using real bookmarked content, so the layout decision is made against real reading experience, not placeholder Lorem.

**What this session got right.** The user framed the problem, I drafted an initial plan with a capture script, the user pushed back once on timing, I rebuilt the plan around in-flow capture, the user approved, and I amended the four affected files (4a.3 standards doc, 4a.6 new chunk, 4b template, 4c.1 layout requirements) plus the top-of-file plan status line. One session, one decision, four consistent edits. No tangents, no layout speculation, no component code. The plan amendment lands the whole change without writing a single line of production code — every implementation detail is captured in 4a.6's sub-steps so the next session can start executing.

**What this session is at risk of getting wrong later.** The biggest danger is the hand-review step quietly decaying into a rubber-stamp. Published transcripts with unredacted real names or paths the regex missed would be an editorial failure severe enough to shake credibility for the whole portfolio. The `/session-end` listing of pending drafts and the promote script's interactive checklist are both designed to make skipping review uncomfortable, but nothing is forcing it. The right moment to notice whether the discipline is holding is during 4d workshop — if the first real promote pass feels like friction, that friction is doing its job; if it feels frictionless, something is wrong. Noting it now so the 4d self-review catches it.

**Next:** Chunk 4a.4 is still the immediate next step (synthesise writing-style.md in the workspace repo). Chunk 4a.6 slots in after 4a.5, and its first-use gate (one bookmarked transcript, end-to-end) has to clear before 4b begins.

---

## 2026-04-12 — Chunk 4a.3: imagery standards, and why the frame is never baked in

Chunk 4a.3 closed with a 320-line standards doc at `plans/portfolio-imagery-standards.md`. The interesting part is not the standards themselves; it is that two of the five decisions landed on "separate the artefact from its presentation" and I had to be pushed to find one of them.

**The diagram tooling decision was clean.** Mermaid's `look: handDrawn` (powered by RoughJS) lets flowcharts render in a Cutler-style sketch aesthetic directly from a text source, through the `mmdc` CLI with a themeVariables block mapped to Royal Tonal tokens. The limitation is that `handDrawn` currently only supports flowcharts and state diagrams — 2×2 matrices, causal loops, and networks (three of Cutler's four archetypes) render in the default polished look, which breaks aesthetic coherence. The resolution was a hybrid: Mermaid for flowcharts, Excalidraw for the other archetypes, with both source files (`.mmd`, `.excalidraw`) and output SVGs committed to git. Neither tool alone covers the full archetype set without a forced compromise.

**The screenshot decision needed a push.** I drafted a shortlist (Skrin for Windows native, Ray.so for web, drop a tool and do it manually) and recommended Skrin. The user pushed back in one sentence: "look for other options. cant you use puppeteer or playwright to do it?" That was the better answer. Puppeteer is already installed as a design-workflow MCP, so there was zero setup cost I had been ignoring. The resolution: a two-layer system. Layer 1 is a Puppeteer script (`scripts/capture-screenshots.ts`, built in chunk 4d) that captures raw UI at standard viewports and saves as WebP — no frame, no shadow, no gradient. Layer 2 is an Astro `<Screenshot>` component (built in chunk 4c) that applies a single frame definition at render time — Royal Tonal gradient background, 16px outer radius, 32px padding desktop, 8px inner radius, subtle shadow. The framing lives in CSS variables, never in pixels. Change the gradient once, every screenshot updates.

**Why that split matters beyond tidiness.** If framing is baked into the screenshot file, the file is both the content and its presentation, and every style tweak is a re-shoot. If framing is applied at render time via a component, the screenshot file is just the content, presentation lives in one place, and iteration is free. The same logic shows up in other contexts: diagram sources separated from rendered outputs, content collections separated from layout components, design tokens separated from CSS. This session was the first time I wrote it down as a rule of thumb for imagery specifically. OG / social-share preview images are the exception — those are loaded outside the site so the frame has to be baked in. Solved with a second Puppeteer pass that screenshots the Astro-rendered component at 1200×630, deferred to chunk 6.

**The "no illustrations" decision was harder to write than to make.** Dylan is not an illustrator, commissioning is slow and expensive, AI-generated illustration now reads as an AI tell, and diagrams plus screenshots cover every visual need the case studies actually have. Writing "no figurative illustrations, ever" feels restrictive until you notice that the alternative is decorative imagery that adds nothing and corrodes credibility. The exception is typographic covers for writing posts (Fraunces title on a Royal Tonal gradient, optional geometric accent), generated with the same Puppeteer pipeline by screenshotting an Astro page at 1200×630. Deferred to chunk 5.5.

**The sourcing banlist was the easiest section to write.** Explicit rules are better than vibes: no stock photography, no AI-generated imagery of any kind, no Figma mockups presented as real screenshots, no competitor product screenshots without credit, no real user data in captures. The `handDrawn` RoughJS effect is explicitly allowed because it is deterministic vector output from a text source, not generative imagery. Naming the edge case before someone asks removes a future debate.

**What this session got right.** The research was efficient — Cutler's imagery aesthetic was already covered in `plans/portfolio-voice-research.md` from chunk 4a.1, and I caught it after opening that file rather than re-researching. The five-decision checkpoint before drafting let the user steer the doc without reading a 320-line draft cold. The Puppeteer + Astro component split is the kind of architectural decision that would normally surface during implementation in chunk 4d; catching it at the standards stage means 4d starts with a specific workflow instead of a tooling decision.

**What this session got wrong.** I recommended Skrin without considering Puppeteer, despite Puppeteer being in the workspace CLAUDE.md under "Design Workflow MCPs." The user had to name it. The lesson is narrow — when recommending a tool, scan the installed MCPs first — but worth noting because I had the right answer in my context and did not reach for it. I also guessed a Maggie Appleton URL (`drawing-invisible`) and hit a 404 when the real slug was `drawinginvisibles1`; CLAUDE.md already prohibits URL guessing, so this is a rule I already had and violated, not a new lesson.

**What pends.** Chunk 4a.4 synthesises voice research (4a.1) + diary audit (4a.2) + imagery standards (4a.3) into `.claude/rules/writing-style.md` in the workspace repo. The imagery section of that file is a compressed version of today's standards doc, not a copy. Chunk 4a.5 follows with the `ideas/DIARY.md` creation and `/new-idea` capture hook wiring, closing out the 4a foundation.

**Next:** Chunk 4a.4 — synthesise writing-style.md in the workspace repo.

---

## 2026-04-11 — Planner V1 planning: story map as a live artefact, and a writing post seeded from it

Session pivoted twice and ended up producing a reusable artefact, a deployed portfolio asset, and a seeded writing post. Ostensibly planning; in practice, the planning was the deliverable.

**What actually happened.** The user opened with "planner POC is done, let's plan V1 through `/new-feature`" and I started the Phase 1 interview as an "adding a feature to an existing project" archetype. Round 1 answers reshaped it: full redesign from UX flows down to tokens, Tailwind v4 migration folded into V1 rather than deferred, and a request to story-map all remaining features into iterative release slices based on priority (not bundled by theme). Archetype switched mid-flight to "full redesign + V1 scope expansion," which means Phase 3 (tokens) and Phase 5 (visual direction) come back into play. Session scope was Q8=C: produce the spec and UX flows this session, defer architecture and implementation to a follow-up.

**The format debate was load-bearing.** I offered to draft the story map as markdown tables first and convert to HTML later. The user redirected in one sentence: put it straight into a self-contained HTML visualiser with markdown export so iteration happens in the tool itself. I pivoted and built `planner-app/plans/v1-redesign/story-map.html` as a single file with drag-and-drop card movement, inline rename at every level (release names, skeleton groups, sub-steps, card titles, card descriptions), three spare releases, two spare skeleton groups, spare sub-steps, localStorage persistence, and markdown export. 29 seeded cards across 10 skeleton groups, sourced from the Phase I deferred list in the POC scope doc.

**Cross-device sync without a backend.** The user wanted to edit on the phone during the commute. I added URL-hash state sync: JSON to UTF-8 to base64 to URL-safe base64, copied to clipboard with a Share URL button, decoded on load with `history.replaceState` to clear the hash so refreshes do not re-apply stale state over later edits. To close the loop back to me, I wrote `decode-state.mjs` alongside the working copy so any share URL can be round-tripped into readable JSON without running the tool itself. Decoder supports `--file` input because long URLs blow past shell arg limits.

**The artefact ships with the portfolio.** Since the story map will end up in the portfolio anyway as evidence of process, I copied it to `portfolio/public/artefacts/planner-v1-story-map/index.html`, committed it (`002cc0e`), and pushed. Cloudflare auto-deploy picked it up. Live at `https://dylan-portfolio.magordyl.workers.dev/artefacts/planner-v1-story-map/`. Pre-commit hook ran astro check plus build cleanly. The working copy in `planner-app/plans/v1-redesign/` and the deployed copy in `portfolio/public/` are now two places that can drift; flagged as a watch item with a re-sync on demand.

**The writing post seed was the punchline.** Near the end of the session the user named the thesis out loud: *"Product and design artefacts should be code-first from now. AI enables creation of custom-built bespoke tooling in far less time than populating data in traditional SAAS tools and re-exporting it out to wherever it needs to go next."* The story map itself is the perfect primary example for that post because the reader is looking at the thing the post is arguing for. Captured as the first entry in a new `plans/portfolio-writing-brainstorm.md` doc with working title options, the thesis as a blockquote, the full feature inventory, comparisons against Miro/Figma/Notion/Airtable/Jira/Linear/whiteboard, six supporting arguments, four counterpoints, and three open questions. Status `[seed]`, do not draft until chunk 5.5.

**What this session got right.** HTML-first was the right call: the iteration surface and the portfolio artefact are the same file, so every edit the user makes from now on is also a content update for the eventual case study. URL-hash sync plus a decoder script means the "I need this on my phone" problem got solved with zero infrastructure and the data format is durable even if the tool vanishes. Hosting the artefact inside the portfolio repo inherits the deploy path for free. And capturing the writing post seed in the same session as the artefact means the post has its primary example locked in before it starts, not retrofitted.

**What this session got wrong.** First Bash call stuck on an internal error and had to be reissued. Offered markdown tables as the initial format when the right answer was obvious from context (portfolio-grade, iterative, user already flagged "visualisable"). Inconsistency between Q5 and Q10 on multi-user scope (no shared data vs sharing allowed); flagged it and dropped sharing rather than interrupting for a re-answer. Drift between working copy and deployed copy is a real risk that nothing currently guards against.

**What pends.** Phase 4 UX flows are blocked on the user iterating and locking the story map content. The V1 `/new-feature` run is paused between Phase 2 and Phase 4. Chunk 5.5 now has its first concrete writing post scope, but drafting waits for chunks 4a through 4d to finish.

**Next:** User iterates on the story map in the live visualiser. Once content is locked, a follow-up session picks up at Phase 4 (UX flows) of the planner V1 `/new-feature` run. Portfolio chunk 4a.3 (imagery standards) continues independently.

### Chat log: story map origin to Cloudflare deploy

Captured verbatim from the session transcript for eventual reference in the writing post. Runs from the first mention of "story map" through the deployment confirmation.

**User — 06:28**

> I would like to do a full redesign, from UX flows to tokens, for planner as well. Because when I originally started working on this project, I hadn't defined the improved design workflow yet. Other answers: Q1 — I want to story map all the remaining features into an iterative release plan and implement them in that order. Not bundled by theme, instead done based on the priorities I set. 2C 3B 4 skip this; I want to prepare a full story map to define release slices. Help me do that. 5C 6A 7 even though the week isn't up, I want to do the migration as part of implementing the redesign I mentioned. 8C

**Claude — 06:29**

> Got it. This significantly changes the shape of the work. Let me confirm what I think we're now doing, then ask round 2.
>
> **Revised framing:**
> - Archetype shift: not "adding features to existing project". This is a full redesign + V1 scope expansion. Phases 3 (tokens) and 5 (visual direction) come back in, not skipped. The Tailwind v4 migration folds into the redesign implementation rather than being a standalone Phase I.
> - Spec format: traditional spec bullets don't fit what you want. We'll build a Jeff Patton-style story map (horizontal backbone = user activities over time; vertical = stories ranked by priority; cuts across = release slices). The map itself is the spec.
> - This session's deliverables: (i) story map + release slices, (ii) UX flows for the full redesigned experience with slice markers. Architecture, tokens, visual direction, and implementation plan go to a follow-up session (or sessions).
> - Phase 0: timezone fix + JWT refresh as a correctness pass before V1 work starts.
>
> *(followed by Round 2 questions Q1–Q10 covering redesign ambition, aesthetic direction, primary surface, multi-user scope, etc.)*

**User — 06:39**

> 1C and D / 2E / 3 no / 4a / 5a / 6a, C, D, g / 7 wait till I'm free then snooze it. I want to be able to snooze until a specific time later today eg snooze 1PM / 8B / 9A / 10E
>
> make sure the story map is in a format I can easily visualise. I want to be able to amend the release names and move items between releases easily

**Claude — 06:42**

> One quick inconsistency to flag before the draft: Q5=A (fully separate accounts, no shared data) and Q10=E (includes "inviting/sharing with another user") conflict. I'm interpreting this as "other people can sign themselves up, there's no in-app invite or sharing" — dropping the sharing column. Say so if wrong.
>
> **Story map format plan:**
> - Iteration format (this session): vertical markdown — one section per release, stories grouped by backbone column. Easy to rename releases (edit heading), easy to move items (cut/paste bullets), renders fine in VS Code preview.
> - Final artefact (after content approval): self-contained HTML visualiser with drag-drop editing, 2D grid view, export-to-markdown button. Saved to `planner-app/plans/v1-redesign/story-map.html` as a portfolio-grade deliverable per the CLAUDE.md design-artefact rule.
>
> Content first, visual polish after — otherwise we're polishing something we'll throw away.
>
> *(followed by a first-draft markdown story map with R0 correctness pass, R1 redesign rebuild, R2 daily loop wins, R3 depth, R4 rhythm, R5 admin)*

**User — 06:45**

> I want you to put this straight into the self-contained html visualiser with md export it'll be easier for me to amend it that way.
>
> make sure I can rename the release, and add in 3 spare releases in case I want to slice them more finely. also ensure I can rename the workflow steps (both skeleton and next level down), and include a few spare steps there. finally, include some additional context with each of the feature cards beyond just it's name. I need just a bit more to fully remember each feature that was in the plan and what it was for

**Claude — 06:51**

> Building it now. Creating the directory, then writing the self-contained HTML with drag-drop, inline editing, 3 spare releases, 2 spare skeleton groups with spare sub-steps, descriptions on each card, markdown export, and localStorage persistence.

**User — 07:01**

> You got stuck on the bash command, try again

**Claude — 07:01**

> Directory created. Writing the HTML visualiser now.

**Claude — 07:04**

> Done. The story map visualiser is at `planner-app/plans/v1-redesign/story-map.html`.
>
> **What's in it:**
> - Backbone (skeleton row): Onboard · Capture · Organise · Schedule · Remind · Act · Review · Admin · Spare 1 · Spare 2
> - Sub-steps (27 total) — including 4 blank spares under the two Spare skeletons
> - Releases: R0 Correctness pass · R1 The Redesign · R2 Daily Loop Wins · R3 Depth & Control · R4 Rhythm · R5 Polish & Admin · Spare A · Spare B · Spare C
> - 29 seeded cards with title + one-sentence description each
> - R1 has a prominent cross-cutting note on the release label (Tailwind v4 migration, new tokens/fonts/type scale, mobile-first PWA shell)
>
> **What you can do:**
> - Drag any card between cells to move it between releases or workflow steps
> - Click any text (map title, skeleton name, sub-step name, release name, release notes, card title, card description) to edit inline
> - Hover a cell → `+` button to add a new card in that cell
> - Hover a card → `×` button to delete
> - Export Markdown → downloads `planner-v1-story-map.md` as a clean grouped snapshot
> - Reset → restores the seeded content
> - localStorage persists everything automatically — your edits survive reloads
>
> When you're happy with the content, click Export Markdown and share the file back to me — that becomes the canonical spec for Phase 4 (UX flows).

**User — 07:04**

> how can I access it on my phone remotely?

**Claude — 07:05**

> Three options, cheapest to best, plus one caveat.
>
> **Caveat first:** The file uses localStorage to persist edits. That's per-device, per-browser — so edits made on your phone won't appear on desktop (and vice versa). For pure viewing this is fine. For cross-device iteration it's not. I can add cross-device sync if you need it.
>
> **Option 1 — Local network (same WiFi, fastest):** `python -m http.server 8000` from the folder, open `http://<laptop-LAN-IP>:8000/story-map.html` on the phone. Free, instant, private. Only works when both devices are on the same Wi-Fi network.
>
> **Option 2 — Public URL via Netlify:** `netlify deploy --dir=.` — one-off draft URL, ~10 seconds. Public by default.
>
> **Option 3 — Cloudflare Quick Tunnel:** `cloudflared tunnel --url http://localhost:8000` — temporary `trycloudflare.com` URL, dies when you close the terminal.
>
> **If you want real cross-device sync:** I can add a "Copy shareable URL" button that base64-encodes the current state into the URL hash (`#state=...`). Open that URL on any device, state loads. No backend, no accounts, no localStorage collision. Say the word and I'll wire it up — 15-minute change.

**User — 07:07**

> add the cross-device sync url, and make sure you do it in a way that I can give you that url back and you know what the state means.
>
> can you host it ok CloudFlare workers as part of the portfolio project? it'll need to be there eventually anyway as part of the portfolio

**Claude — 07:10**

> I'll do this in phases: (1) update the HTML with URL sync, (2) write a standalone decoder I can rely on, (3) explore the portfolio structure, (4) wire up deployment.
>
> *(Phase 1: added `Copy Share URL` toolbar button, `encodeState` / `decodeState` functions using TextEncoder + btoa + url-safe replacement, updated `loadState` to consume `#state=` on load and `history.replaceState` to clear the hash.)*
>
> *(Phase 2: wrote `decode-state.mjs` — standalone Node ESM script accepting URL, raw b64, or `--file <path>` for long URLs exceeding shell arg limits.)*
>
> *(Phase 3: explored portfolio structure, confirmed `public/` serves as static assets, chose `public/artefacts/planner-v1-story-map/index.html` as the deployed location.)*
>
> *(Phase 4: checked portfolio git state, committed as `002cc0e` with pre-commit hook running `astro check && astro build` — clean pass. Pushed to main. Cloudflare auto-deploy picked it up.)*

**Claude — 07:18**

> Pushed clean to main (`04caaaa..002cc0e`). Cloudflare auto-deploy should complete in ~1–2 minutes.
>
> **Your live URL:** `https://dylan-portfolio.magordyl.workers.dev/artefacts/planner-v1-story-map/`
>
> **What you now have (in the browser at the live URL):**
> - `Copy Share URL` → copies a URL with the full state base64-encoded in the hash. Send it to yourself on another device → opens with identical state.
> - `Export Markdown` → downloads a clean `.md` snapshot
> - `Reset` → restores the seeded content
> - Drag-drop cards, inline-edit everything, auto-save to localStorage
>
> **How the cross-device flow works:** localStorage is per-device, so raw edits don't sync. When you want to move state to another device, click Copy Share URL and open the pasted URL there. On load, the state is consumed from the hash, written to that device's localStorage, and the hash is cleared — so subsequent refreshes don't re-apply stale state. Continue editing; generate a new Share URL when you want to move state back.
>
> **Sharing state back to me:** paste the full `#state=...` URL in a message. I have a standalone decoder at `planner-app/plans/v1-redesign/decode-state.mjs` that accepts the URL directly or reads from a file (for URLs long enough to exceed shell arg limits):
>
> ```bash
> node decode-state.mjs "<url>"
> node decode-state.mjs --file url.txt
> ```
>
> The encoding is documented inline in the HTML and in the decoder so it's deterministic — no guessing.
>
> **Files created/modified:**
>
> | Path | Purpose |
> |---|---|
> | `planner-app/plans/v1-redesign/story-map.html` | Source of truth (working copy) |
> | `planner-app/plans/v1-redesign/decode-state.mjs` | Standalone Node decoder for share URLs |
> | `portfolio/public/artefacts/planner-v1-story-map/index.html` | Deployed copy (committed + pushed as `002cc0e`) |
>
> **Flagged:**
> 1. The deployed copy is public. Anyone with the URL can see the story map content. Fine for this artefact, keep in mind for future ones.
> 2. Two copies now exist. Working copy and deployed copy can drift. Re-sync on request; no auto-build step wired.
> 3. Deploy may take 1–2 min. 404 right after push is normal.
>
> Once you've iterated the content to a place you're happy with, share the Share URL back and we can kick off Phase 4 (UX flows) from the locked story map.

---

## 2026-04-11 — Chunk 4a.1 + 4a.2: voice research, diary audit, and the gap that only showed up at the end

The session that was meant to produce a voice study and a diary audit ended up exposing a structural gap neither artefact was looking for. Captured here because the gap is the most important output.

**What actually happened.** Chunk 4a.1 was voice research on Wes Kao (7 posts, storytelling focus) and John Cutler (6 top posts, illustrations + complex messages + relatability). That part went cleanly. I also tried to extract "Dylan's voice" from existing ideas files, diary entries, and CLAUDE.md prose. The user corrected me in one sentence: all of those artefacts were written by Claude on the user's direction, so I had been analysing Claude's voice, not the user's. The user confirmed no long-form user prose exists anywhere Claude Code can read. This reshaped the whole plan: Dylan's voice gets built deliberately in chunk 4d through real case study writing, not extracted from samples in 4a. The 4a style guide splits into Part 1 (structural guidance, lockable now from Kao and Cutler) and Part 2 (style guidance, guard rails only in 4a, discovered in 4d). The voice research doc got fully rewritten, including scrubbing 39 em-dashes because the user explicitly called em-dashes out as the #1 AI tell to avoid.

**The diary audit was the real discovery.** I read the last ten entries of each of the four project diaries (48 entries total) through a hiring-manager lens across five signal categories: product thinking, decision-making under uncertainty, technical judgement, honest reflection, narrative shape. Technical judgement is near-best-in-class. The other four vary, but product thinking is the biggest gap by a wide margin. Of 48 entries, exactly one (planner-app Phase H, the "task marked done, no SMS sent" end-to-end test) centres a product claim. Everything else is an engineering log. Every entry could answer "what code changed" but almost none answer "what does the user get that they did not have before."

**The gap that the audit did not predict.** Near the end of the audit review, the user asked whether `ideas/` has its own diary. It does not. That absence is the structural cause of the product-thinking gap in every other diary: the four project diaries all start once an idea is already approved and scoped, which means every upstream moment (noticing the pain, weighing alternatives, killing a direction based on research, pivoting on pricing, choosing one idea over five in INDEX) leaves no trace anywhere. A case study can only say "I built this." It cannot say "I decided to build this instead of X, Y, Z because research told me W." That is the most valuable product-thinking signal a portfolio can carry, and it was invisible to the audit until the user named the missing artefact. The fix is chunk 4a.5: create `ideas/DIARY.md`, wire the capture trigger into `/new-idea`, write the first entry retroactively from the habit-correlation research arc. Captured in the audit doc as the fifth implication, in memory as `project_ideas_diary_gap.md`, and as task #7 in the task list — three places because the user flagged it explicitly as must-not-lose.

**What this session got wrong.** I attributed Claude-authored prose to the user as voice data and had to throw that work away. I used em-dashes throughout the first draft of the voice research doc despite the whole point of the doc being a list of AI tells to avoid. And the diary audit missed the `ideas/` gap until the user pointed at it, which is a failure of scope imagination: I audited "existing diaries" rather than asking "where in the workflow does product thinking happen, and is any of it being captured." The right version of the audit would have started there.

**What this session got right.** The voice research synthesis is load-bearing for 4a.4. The audit has concrete exemplars and concrete weak entries, which is the shape the style guide synthesis needs. And the `ideas/DIARY.md` gap, once named, has a clear fix with a retroactive first entry already written (in the habit-correlation folder). Three chunks out of five in the 4a sub-plan are now either done or have a well-specified action list.

**Next:** Chunk 4a.3 (imagery & illustration standards), then 4a.4 (synthesise style guide), then 4a.5 (diary capture rules + create `ideas/DIARY.md`). Commits for 4a.3 land in the portfolio repo; 4a.4 and 4a.5 commit to the workspace repo.

---

## 2026-04-11 — Chunk 1: Astro scaffold, Royal Tonal tokens, base layout

Scaffolded the portfolio project from scratch. Stack confirmed from Phase 6 architecture: Astro 5, React islands, Tailwind v4 via the `@tailwindcss/vite` plugin (not `@astrojs/tailwind`, which is the v3 integration), MDX, self-hosted Fontsource fonts.

Key outputs:
- `src/styles/globals.css` — full Royal Tonal token block (12-step colour scale, ink text scale, semantic aliases, type scale, spacing, radius). All tokens as CSS custom properties; Tailwind v4 reads them via `@theme` if we need utility-class access.
- `src/layouts/BaseLayout.astro` — head, sticky header, main slot, footer
- `src/components/astro/PageHeader.astro` — hamburger (placeholder), wordmark, "Get in touch" pill linked to LinkedIn
- `src/components/astro/PageFooter.astro` — LinkedIn + privacy link
- `src/components/astro/KickerLabel.astro` — 11px small-caps section labels in `--kicker` colour
- `src/pages/index.astro` — hero section with north-star statement

**Design decision:** Tailwind v4 dropped the `@astrojs/tailwind` integration in favour of a Vite plugin (`@tailwindcss/vite`). The `astro add tailwind` command detected this automatically and configured the right thing. CSS variable tokens live in `globals.css` — no `tailwind.config.mjs` needed for v4 (the `@theme` directive replaces it).

**Trade-off:** Hover effects on the "Get in touch" pill use inline `onmouseover`/`onmouseout` rather than a CSS class. This is intentional for a static `.astro` component — no React hydration cost for a visual effect. If we install the shadcn `Button` component in chunk 3, we'll swap to that and get proper focus ring styles too.

**Next:** Chunk 2 — content collection schemas and placeholder MDX entries.

---

## 2026-04-11 — Chunk 2: Content collections schemas + placeholder entries

Created all content collection infrastructure for the portfolio.

**Key discovery — Astro 6 breaking change:** The legacy `src/content/config.ts` location was removed. Astro 6 requires the config at `src/content.config.ts`, and every collection must use a loader (no more `type: 'content'`). The error was clear and the fix was mechanical — move the file and switch to `glob()` loaders.

**Second discovery — `z` from `astro:content` is deprecated in Astro 6:** Astro 6 now expects you to import `z` from `zod` directly rather than using the re-export from `astro:content`. Also `z.string().url()` is deprecated in Zod v4 (installed as transitive dep) — the new API is `z.url()` as a top-level validator.

Outputs:
- `src/content.config.ts` — Zod schemas for `projects`, `writing`, `log` collections; glob loaders; cross-collection `reference()` fields; `z` imported from `zod` directly
- `src/content/projects/` — 4 placeholder MDX files (the-weekly, planner-app, workspace-audit, portfolio)
- `src/content/writing/` — 1 placeholder post (welcome)
- `src/content/log/` — 5 real log entries reconstructed from project diaries (2026-04-07 → 2026-04-11)

**Design decisions:**
- Log entries reference project slugs via `reference('projects')` — optional field, so entries without a project (like the review skill entry) just omit it and pass schema validation
- `depth: 'full' | 'lightweight'` field on projects distinguishes full case studies from lightweight ones — drives rendering decisions in chunks 3-5 without schema migration
- `featured: boolean` controls landing page inclusion separately from `/projects` index — lets us show 2 projects on landing while all 4 appear in the index

**Next:** Chunk 3 — landing page full layout (BuildLogTicker, CaseStudyCard, asymmetric grid).

---

## 2026-04-11 — Chunk 3: Landing page V1 refined layout

Built the full landing page layout matching the Stitch mock (assets 12 and 13).

Outputs:
- `src/components/astro/BuildLogTicker.astro` — self-contained; queries the `log` collection internally, renders 5 most recent entries with date (Geist Mono), title, summary, and "All entries →" link. Bordered card container.
- `src/components/astro/CaseStudyCard.astro` — project card with placeholder gradient image area (real hero images in chunk 5), kicker label (Case Study / Lightweight based on `depth` field), Fraunces serif title, TL;DR, tag pills, "Read case study →" link. Full CSS hover state.
- `src/pages/index.astro` — full layout: 3:2 asymmetric hero grid (hero copy left, BuildLogTicker right), "Selected Work" 2-column project grid sorted by `weight` descending (shows all 4 projects), About teaser with short bio, closing quote in display-size italic serif.

**Design decisions:**
- Responsive grid via Astro scoped `<style>` block rather than inline styles — inline styles can't be overridden by media queries, so all layout-critical rules live in the style block. Token-based values (colours, spacing) stay inline where they were used before.
- Skipped shadcn `Button` install for now — the "Get in touch" pill in PageHeader already has working hover/focus styles and installing shadcn would require `components.json` init. Deferred to a later chunk when we have a real interactive component to justify the setup cost.
- All 4 projects shown in the grid (not just `featured: true`) — the weight ordering (portfolio 40, workspace-audit 30, planner-app 20, the-weekly 10) maps well to the 2x2 grid left-to-right, top-to-bottom.

**Next:** Chunk 4 — Case Study Workshop (critical gate). Voice reference research → template → the-weekly case study.

---

## 2026-04-11 — Repo extraction + Cloudflare Pages deploy

Noticed mid-session that portfolio was living inside the workspace monorepo (`claude-workspace`), while `planner-app` and `the-weekly-app` both had their own repos. Inconsistent structure — every push to the workspace (diary updates, design system work, unrelated plans) would have triggered a Cloudflare rebuild once Pages was connected.

**Migration steps:**
1. Created `magordyl/portfolio` (public) on GitHub
2. Initialized a new `git init` inside `portfolio/`, committed all source + copied portfolio plans from workspace `plans/` into `portfolio/plans/`
3. Pushed to new remote (`main` branch)
4. Removed `portfolio/` from workspace git tracking (`git rm -r --cached`), added to workspace `.gitignore`
5. Deleted the portfolio plan files from workspace `plans/` (now live in portfolio repo)
6. Updated both CLAUDE.md files to reflect new locations
7. Cleared the stale portfolio check from the workspace pre-commit hook (it was guarded by a `grep` so it never would have triggered, but it was dead code)

**Cloudflare Pages:** Connected to `magordyl/portfolio` via dashboard Git integration. The Cloudflare UI has drifted from documented screenshots — no framework preset picker, no explicit build output field. Used defaults + Save and Deploy. Build succeeded. Live URL: `dylan-portfolio.magordyl.workers.dev` (note: `.workers.dev` rather than `.pages.dev` — functionally identical for now; revisit if preview URLs become important).

**Key decision — repo per project:** The workspace should only contain workspace tooling (CLAUDE.md rules, design system, plans, diary). Every project that deploys gets its own repo from the start. This is now the established pattern.

---

## 2026-04-11 — Chunk 4 restructured: content-first, foundation expanded

Planning session, no code. Reshaped chunk 4 from a single "case study workshop" chunk into four sub-chunks and added two new chunks further downstream. Nothing shipped to the site; the deliverable is the updated `plans/portfolio-implementation.md`.

**What changed:**
- **Chunk 4** was previously "research voice → draft template → write the-weekly → lock". Now split into 4a (foundation), 4b (content template), 4c (layout mockups), 4d (writing workshop).
- **Chunk 4a** expands beyond voice research into a workspace-wide writing & imagery style guide. It incorporates (1) Kao + Cutler voice research, (2) a quick hiring-manager-lens audit of existing diary entries across all projects, (3) imagery & illustration standards (aesthetic, diagram conventions, sourcing rules), (4) synthesis into `.claude/rules/writing-style.md`, (5) retro-update of the diary capture rules so future entries arrive portfolio-ready. The style guide lives in the workspace repo, not portfolio — it governs all Claude-produced writing for me going forward.
- **Chunk 4b** is a new chunk: case study content hierarchy (sections, word counts, artefact slots) with no layout and no prose. Locks the template shape before any visual design happens.
- **Chunk 4c** layout mockups get built *against* the content structure from 4b, following the same HTML-explorer approach we used for the landing page. Covers case study, /projects, /writing index + post, /log, /404, /privacy — but NOT /about (moved to its own chunk).
- **Chunk 4d** is the writing workshop as originally conceived, now constrained by the locked template and layout. Writing only, no design decisions.
- **New chunk 5.5** — writing posts. Brainstorm + pick 3 + draft + iterate + lock as MDX. Ready to ship the moment chunk 6 builds the /writing routes.
- **New chunk 5.6** — /about as a one-off, because there's only one /about and it doesn't benefit from templating. Goals analysis → background research interview → content scaffold → HTML mockup → draft → iterate → ship.

**Why content-first:** initial proposal had layout mockups and content hierarchy as a single chunk. User pushed back — "content structure needs to come before layout is selected." Right call. The whole point of separating 4b and 4c is that content constraints dictate layout, not the other way around. It's a discipline thing — left unchecked, it's very tempting to sketch layouts while scoping content. Added this as an explicit risk in the plan.

**Key decision — style guide is workspace-wide, not portfolio-scoped.** When I asked whether the style guide should live in `portfolio/plans/` or `.claude/rules/` at the workspace root, the user picked workspace. Rationale: it governs diary entries, writing posts, case studies, and any other prose Claude produces. Scoping it to portfolio would duplicate concerns later. Consequence: chunk 4a commits to the workspace repo, not the portfolio repo. First chunk in the portfolio plan that does.

**Trade-off acknowledged:** revised v1 timeline is ~3–4 weeks of sessions, up from the original 1–2. Extra scope (imagery standards, diary audit, /about as its own chunk, writing posts as their own chunk) buys a materially higher quality ceiling. The style guide is load-bearing — it governs all future writing, not just the portfolio — so spending 1–2 sessions on it up front is worth the delay to first case study.

**Meta-observation on the planning conversation itself:** this is the second time I've proposed a multi-chunk plan and the user has reshaped it on content-vs-layout grounds. Worth noting as a recurring pattern — when planning creative/content work, default to content-before-design separation rather than interleaving them.

**Next:** Chunk 4a — foundation. Work starts in the workspace repo (writing-style.md + diary rules), finishes with a commit there. Once the style guide is locked, return to the portfolio repo for chunk 4b.
