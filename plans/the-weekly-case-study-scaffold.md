# The Weekly — Case Study Writing Scaffold

Write your draft in the slots below. Guidance is above each slot. Word budgets are soft.

**Target body total:** 400–600 words across Problem, Decisions, Outcome, Lessons, Next (Hero is metadata only).

---

## Structure locked (from 2026-04-23 interview)

- **Middle zone:** Decisions only (no Design section, no Architecture section).
- **No transcript embeds.** No architecture diagram.
- **Design evolution** lives in Lessons as a `<VersionedEmbed>` placeholder — built in 4d.4, not written here. Write Lesson 2 as the prose that will sit above the embed.
- **Screenshots** deferred to a later pass. Hero image and Outcome shots sourced after prose locks.
- **Thesis:** a PM who can think in systems and synthesise insights into a product direction.
- **Hook:** general meal-kit pain (the value mismatch), not a specific scene.
- **Claude Code framing:** named at the Problem pivot and in Lesson 1. Absent from Outcome. Do not frame the piece as "what Claude Code can do"; frame it as "what I did, and what it says about me."

## Style rules to hit

- **Australian spellings** throughout (favourite, colour, organised, realise, behaviour).
- **No em-dashes / en-dashes as aside connectives.** Use full stops, commas, parentheses, or a new sentence.
- **No "not just X, but Y"** constructions. No balanced oppositions ("it's not about X; it's about Y"). No triads ("clear, concise, and actionable").
- **Declarative claims.** "This works," not "this might work."
- **Stakes and trade-offs inline.** "This buys X but costs Y" is the default shape for any decision.
- **Banned vocabulary:** delve, tapestry, realm, landscape, journey, navigate (as a verb for handling things), robust, seamless, elevate, vibrant, nuanced, essentially, fundamentally, ultimately, "it's worth noting," "in essence," "at its core," "bridging the gap."
- **Admission shape in Lessons:** name the mistake → name the updated belief → name the new rule.

## Pick a name for the recurring tension (before you start writing)

The "PM instinct to add / discipline to subtract" pattern shows up in Decision 1 (picked an idea with pre-solved integration), Decision 3 (cut meal filters, cut ingredient detail, cut branching), and Lesson 2 (skipped design to ship faster). Label it once and reuse it throughout the piece. Candidates:

- **The subtraction discipline** — pairs with "opinionated UX"; emphasises the act of cutting.
- **Feature gravity** — names the pull toward adding; the piece is about resisting it.
- **The cut muscle** — more conversational, blunter.

Pick one (or write your own) and use it in Decisions 1, Decisions 3, and Lesson 2.

**Chosen label:** Feature gravity

---

## Frontmatter

Fill in or confirm before drafting the body.

```yaml
title: "The Weekly"
tldr: First project built with Claude Code — a meal planner inspired by meal kits, with shopping integration. # rewrite to reflect the story, not just the product
       # e.g. "First project built with Claude Code — a meal planner born from real industry experience."
number: 1
date: 2026-04-24 # publication date
started: 2026-04-08
finished: 2026-04-11
tags: ["React", "TypeScript", "Vite", "Tailwind CSS", "Netlify", "Cloudflare"]
live: "https://the-weekly.netlify.app"  # or Stage 3 Workers URL when it replaces canonical
summary: # card blurb, longer than tldr
weight: 10
featured: false
depth: full
```

---

## Problem (60–100 words)

**Purpose:** name the pain and the opening that made this worth building. Reader should finish knowing *why this exists* before they learn *what it does*.

**What to cover, in order:**

1. **The value mismatch.** Pay nearly double for meal kits. The thing you actually valued wasn't pre-portioning — it was the curated quick-pick experience. Ground it briefly: paying double, the 6-day-ahead pick window, getting random meals you didn't want to cook. One or two lines. Don't list all three grievances.
2. **The product insight.** You were PM on the Coles shoppable recipes team. Coles already does grocery ecommerce. The gap isn't fulfilment, it's the guided planning UX. One sentence.
3. **The pivot to "why build it now."** The idea sat for months. You started learning Claude Code, needed a real project to learn against, picked this because it could be POC'd frontend-only. Two sentences.

**Shape cues:**
- Open on the value mismatch, not on Claude Code. Claude Code enters in the third beat.
- Product-frame one sentence: what does a user get here that they didn't have before?
- Keep "double the price" / "6-day window" as supporting detail, not the headline.
- No hedging. "I paid double for something I didn't value" beats "I felt like I was paying too much."

**Banned shapes:** "In this case study, I'll walk through..." "It's not just about meal kits — it's about..." "Three things stood out..."

### Your draft:

<!-- write here -->
I'm a meal kit subscriber. There. I said it. 

Why? It's not the pre-portioning. It's not the quality of recipes. It's *definitely* not the subscription or the nearly 2x supermarket prices. I buy meal kits because any time my wife & I sit down and try to pick a week's worth of recipes, there are just too many options and we either give up, or go back to the same boring old regular picks.

About 6 months ago, I had a realisation: Supermarkets can already conveniently deliver your groceries. They already have large recipe libraries, focused on easy dinners. But they just haven't put the two together into a simple meal planning & cooking experience like meal kit companies have.

The idea sat in the back of my mind, destined to be another one of those ideas that sits there for a while and then evaporates, killed by the lack of time to experiment. Then I succumbed to the virality of Claude Code, decided I had to try making a real thing, and realised I knew how this idea could be implemented as a functional POC using purely front-end code.

---

## Decisions (80–150 words)

**Purpose:** show product and operating reasoning. Three decisions, one short paragraph each. Use the named tension at least once.

### Decision 1 — Picking an idea that fit the frontend-only constraint (~30w)

**What to cover:**
- Frame the constraint first: the first project had to be POC-able frontend-only (learning scope).
- The decision wasn't "build frontend-only." The decision was *which idea* fit.
- The insight: Coles already exposes a public trolley URL. The hard integration was pre-solved. The idea had been bubbling; this is why it was the one you picked.

**Shape cues:**
- Lead with the insight: Coles' public trolley URL.
- State the trade-off: picking an idea with a pre-solved integration buys you a real product to ship; costs you the option of picking a more ambitious idea for this round.

### Decision 2 — Automation-first testing (~40w)

**What to cover:**
- Not TDD specifically. **Rigorous plan–build–test loop with automation-first testing.**
- Why: you believe automated testing is key to getting stable AI code outputs.
- Evidence: 160 tests, very few major bugs across the four-day build.
- The assertion (not a hunch): automation-first testing changes what you should expect from AI-assisted code. If the tests exist, the code stays stable.

**Shape cues:**
- State the belief, then the evidence. Order matters — belief first gives the number somewhere to land.
- Don't say "TDD." Say "automation-first testing" or "plan–build–test."
- Assertion template: "Based on X, I think Y. The move was Z."

### Decision 3 — Opinionated UX over feature breadth (~60w)

**What to cover:**
- The product belief: most products aren't opinionated enough, they drop users into an open field.
- Concrete cuts, at least three of these (pick the strongest):
  - Limited meals to 3–6/week, no free choice.
  - Stripped ingredient review to essentials, cut the product information clutter.
  - Limited meal filters to the most commonly desired ones.
  - No branching in the flow — one linear path from start to trolley.
- The principle: reduce options throughout to reduce cognitive load.
- The tension (use your named label here): a PM's instinct is to add; the discipline was in what was cut.

**Shape cues:**
- Lead with the belief, then the cuts, then the principle.
- Name the tension by its chosen label.
- Connect at least one cut to why it matters for the user (rule 8).
- Trade-off inline: "Reducing filters buys a faster, more trusting flow; costs the user who wanted the edge case."

### Your drafts:

#### Decision 1 (~30w) — Coles trolley URL insight + trade-off

<!-- write here -->



#### Decision 2a — belief (~20w): automation-first testing for AI code stability

<!-- write here -->



#### Decision 2b — evidence + assertion (~20w): 160 tests, assertion template

<!-- write here -->



#### Decision 3a — product belief (~20w): opinionated over open field

<!-- write here -->



#### Decision 3b — concrete cuts (~20–25w): pick the strongest from the bullet list above

<!-- write here -->



#### Decision 3c — principle + tension (~20w): reduce options, name "feature gravity"

<!-- write here -->




---

## Outcome (60–100 words)

**Purpose:** what shipped. Concrete, measurable, visual. No Claude Code mentions in this section.

**What to cover:**
- **Four-day build, functional day one.** Remaining sessions were polish.
- **41 recipes, live Coles trolley integration, real product data** scraped from Coles.
- **The concrete user-time claim: 5 meals selected → Coles trolley ready in under 2 minutes.** This is the headline number.
- **User reactions:** wife bought in, colleagues got it.
- **What you're proudest of:** the streamlined flow. The opinionated UX actually works — pick meals, review ingredients, go.

**Shape cues:**
- Lead with the user-time claim (5 meals → trolley in under 2 minutes). That's the line a hiring manager remembers.
- Connect "41 recipes" to why it matters — real data, real trolley, real checkout. Not a mock.
- One sentence on reactions. "Wife was in, colleagues got it" is enough.
- Close on the proudest thing: the flow works because the cuts were the right cuts.

**Banned shapes:** Don't mention Claude Code. Don't hedge ("it mostly works"). Don't triad ("fast, simple, and useful").

### Your drafts:

#### Outcome A — user-time claim + build pace (~25w): lead with "5 meals → trolley in under 2 minutes"

<!-- write here -->



#### Outcome B — real data + integration (~25w): 41 recipes, Coles trolley, real data not a mock

<!-- write here -->



#### Outcome C — reactions + proudest (~25w): wife + colleagues, close on the flow

<!-- write here -->




---

## Lessons (60–100 words)

**Purpose:** honest reflection. Two lessons, admission shape for each: **mistake → updated belief → new rule.**

### Lesson 1 — Never touched the code (~30w)

**What to cover:**
- **Mistake / expectation that was wrong:** expected to read every line, expected to fix bugs. Didn't write a single line.
- **Updated belief:** what this says about what's possible for a PM who can think in systems but hasn't written code in years.
- **New rule (implicit is fine here):** the coding bottleneck isn't the bottleneck you think it is.

**Shape cues:**
- Admission first: "Expected X, the reality was Y."
- Self-deprecation is credibility — admit the naïveté of the expectation before claiming the update.

### Lesson 2 — Skipping design was the biggest mistake (~50w, sits above the embed)

**What to cover:**
- **Mistake:** went concept → technical plan → build without visualising the UX first.
- **The concrete Stage 1 ugliness:** "baby's first UI." Use this phrase or a variant. Honest and specific beats vague ("UI felt unpolished").
- **Updated belief:** Claude Code builds what you describe. The quality ceiling is in the description, not the code.
- **New rule:** design before build, every time.
- **The payoff line:** the embed below shows the arc — POC → design audit → tokenised. The reader is about to see the evidence.

**Shape cues:**
- Admission first. "Baby's first UI" lands hardest early in the paragraph.
- Name the new rule as a rule, not as a hope ("design before build, every time," not "in future I'd try to design first").
- Close with the setup for the embed: one sentence that tells the reader what they're about to see.

**This paragraph sits ABOVE the `<VersionedEmbed>`.** The embed is built in 4d.4 and renders three interactive iframes (POC / design audit / tokenised). Don't describe the stages in detail in the prose — the embed does that.

### Your drafts:

#### Lesson 1 (~30w): expected X, reality was Y, name the updated belief

<!-- write here -->



#### Lesson 2a — mistake + "baby's first UI" (~25w): admission first, concrete ugliness early

<!-- write here -->



#### Lesson 2b — updated belief + new rule + embed setup (~25w): close with what the reader is about to see

<!-- write here -->




---

## Next (0–20 words)

**Purpose:** send the reader to one related artefact. One link, not a list.

**Your exact messaging (from the interview):**

> With a successful frontend-only POC using Claude Code, I next wanted to explore if I could build a working fullstack webapp.

**Link target:** Planner POC (`/projects/planner-poc`) — the #2 project in sequence.

**Shape cue:** close with an imperative or a direct handoff, not a question. No "what do you think?" No "let me know if..."

### Your draft (~15–20w):

<!-- write here -->




---

## Post-draft checklist

Run through these before asking for the edit pass.

### Style tells to grep for

- [ ] No em-dashes (`—`) or en-dashes (`–`). Replace with full stops, commas, parentheses.
- [ ] No "not just X, but Y."
- [ ] No triads with parallel structure.
- [ ] No banned vocab: delve, realm, journey, navigate (v), robust, seamless, elevate, vibrant, essentially, fundamentally, ultimately, "it's worth noting."
- [ ] No "Here's the thing:" or "Let me walk you through."
- [ ] Australian spellings throughout.

### Structure checks

- [ ] Problem opens on value mismatch, not Claude Code.
- [ ] Claude Code mentioned in Problem pivot + Lesson 1 only.
- [ ] Claude Code absent from Outcome.
- [ ] Named tension label used in at least 2 of: Decision 1, Decision 3, Lesson 2.
- [ ] Three decisions each have a trade-off line ("X buys Y but costs Z").
- [ ] Both lessons follow admission shape: mistake → updated belief → new rule.
- [ ] Outcome leads with the user-time claim (5 meals → trolley in under 2 minutes).
- [ ] Thesis is legible: a PM who synthesises insights into product direction.

### Word counts

- [ ] Problem: 60–100w
- [ ] Decisions: 80–150w total
- [ ] Outcome: 60–100w
- [ ] Lessons: 60–100w total
- [ ] Next: 0–20w
- [ ] **Body total: 400–600w**

---

## Reference — key messages map

| Signal | Section |
|--------|---------|
| Product sense from real industry experience | Problem |
| Deliberate learning strategy | Problem |
| Smart scoping via pre-solved integration | Decisions 1 |
| Automation-first testing for AI code stability | Decisions 2 |
| Opinionated UX product philosophy | Decisions 3 |
| Shipped something real, fast, measurable | Outcome |
| PM who ships without writing code | Lessons 1 |
| Design evolution as visible evidence (via embed) | Lessons 2 |
| Next in sequence | Next |
