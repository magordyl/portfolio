# The Weekly — Case Study Draft Structure

Locked in session 2026-04-12. Dylan populates the words; this doc captures the agreed structure, key messages, and interview context.

**Status:** Structure approved. Ready for Dylan to write.

---

## Framing

This is not primarily a product case study. It's a "learning to ship with Claude Code" story, where the product is the vehicle. The hiring manager takeaway: Dylan integrates and synthesises insights from multiple sources into a product direction, using strong product sense.

## Frontmatter updates needed

```yaml
title: "The Weekly"
tldr: # Rewrite — should describe the story, not just the product. e.g. "My first project built entirely with Claude Code. A meal planning tool born from real industry experience."
number: 1
date: # Set when published
started: 2026-04-08
finished: 2026-04-11
tags: ["React", "TypeScript", "Vite", "Tailwind CSS", "Netlify"]
live: "https://the-weekly.netlify.app"
summary: # May also need updating to reflect the learning angle
weight: 10
featured: true
depth: full
```

---

## Section structure

### Problem (60-100 words)

Two beats:

**Beat 1 — The product insight.** Dylan was PM in the Coles shoppable recipes team. Subscribed to meal kits personally. The realisation: what he actually valued wasn't pre-portioned ingredients — it was the curated picking experience. Quick, trusted, done. Coles already does grocery ecommerce. The gap is the guided planning UX integrated with supermarket fulfilment.

Personal detail to ground it: paying nearly double for meal kits, getting burnt by the 6-day-ahead pick window, receiving random meals they didn't like.

**Beat 2 — Why build it now.** The idea sat for months. Started learning Claude Code. Needed a real project to learn against. Cycled through ideas, picked the first one that worked as front-end-only POC. Liked that it was tangentially relevant to his work.

**Hook:** Open on the personal experience (meal kit pain), not the Claude Code angle. Claude Code is the pivot mid-section.

---

### Decisions (80-150 words)

Three decisions, one paragraph-ish each:

**Decision 1 — Front-end only, no backend.** Deliberately scoped to static React + JSON. Not because it was the right architecture for a real product, but because it was the right constraint for a first project. The product still works: curated recipes (not dynamic), Coles trolley URL API handles checkout. Trade-off: no user accounts, no saved plans, hardcoded recipes — but removes an entire class of complexity from the learning exercise.

**Decision 2 — TDD from day one.** Had read about TDD. With Claude Code, the main constraint (time to write tests) disappears. Prompted Claude into test-driven workflow from the start. Result: 160 tests, very few major bugs. Assertion: Claude Code makes TDD practically free, which changes when you should adopt it (always, from the start).

**Decision 3 — Opinionated UX over feature breadth.** Product belief: most products aren't opinionated enough. They drop customers into an open field. Built a linear, guided flow. Pick meals, review ingredients, go. No accounts, no history, no feature creep. Tension: a PM's instinct is to add features; the discipline was in what was cut.

---

### Outcome (60-100 words)

What shipped, concretely. Don't mention Claude Code here — this section is about the product.

- Four-day build, functional on day one
- 41 recipes, live trolley integration with Coles, real product data
- Showed wife (bought in), showed colleagues (got it)
- The proudest thing: the streamlined flow. User picks meals, reviews ingredients, has a Coles trolley ready. The opinionated UX actually works.

---

### Lessons (60-100 words)

Two lessons, admission shape (mistake, updated belief, new rule):

**Lesson 1 — Never touched the code.** Expected to carefully read every line. Expected to dive in and fix bugs. Didn't write a single line. Everything was Claude Code. What that updates in the mental model: what's possible for a PM who can think in systems but hasn't written code in years.

**Lesson 2 — Skipping design was the biggest mistake.** Went concept to technical plan to build, without visualising the UX first. UI felt unpolished. Has since iterated on the design workflow several times and landed somewhere better. The learning: Claude Code can build what you describe, so the quality ceiling is in the description, not the code. Rule added: design before build, every time.

---

### Next (0-20 words)

Link to next project in sequence (Planner POC, #2) or to a writing post about Claude Code workflow evolution if it exists by then.

---

## Key messages map

| Signal | Section |
|--------|---------|
| Product sense from real industry experience | Problem (beat 1) |
| Deliberate learning strategy | Problem (beat 2) |
| Smart scoping under constraints | Decisions (1) |
| Claude Code makes TDD free | Decisions (2) |
| Product philosophy (opinionated UX) | Decisions (3) |
| Shipped something real, fast | Outcome |
| PM who ships without writing code | Lessons (1) |
| Honest about what went wrong | Lessons (2) |

---

## No transcript, no architecture diagram

Decided: no transcript embeds for this case study. No architecture section. Screenshots deferred to a later pass after prose is locked.

---

## Interview context (raw, for reference when writing)

**Background:** PM at Coles, was in the shoppable recipes team. Had 2 years of CS degree many years ago but dropped out. Day job involves working closely with engineers/architects, more technically inclined than most PMs. Can read code and mostly understand it, but can't write functioning code without practice.

**Origin:** Idea came from combination of work experience (Coles recipes) and personal experience (meal kit subscriber). The realisation: what he valued about meal kits wasn't pre-portioning, it was the curated quick-pick experience. Coles already does ecommerce — the gap is the planning UX.

**Why this idea first:** Cycled through ideas, picked the first one that could be front-end only. Liked the tangential relevance to work.

**Claude Code expectations vs reality:** Expected to read all code carefully, expected to do some bug fixes himself. "Completely shocked" that he produced the project without touching a single line of code. Everything was Claude Code.

**Early struggles:** Basically none. "It was so smooth." Had done reading on Claude Code workflows beforehand, took on board advice to focus on detailed planning before build.

**Click moment:** When Claude installed Playwright, wrote a scraper, and turned scraped data into perfectly structured JSON. "That was amazing."

**Biggest mistake:** Skipping design mockups. Has iterated on design workflow several times since. For this first app went concept → technical plan → build without visualising. UI still doesn't feel super cohesive. "But that's OK — that wasn't the point of the first project."

**Timeline:** Four days. Functional day one. Other sessions were polish.

**Collaboration friction:** "Surprisingly, nothing was actually that hard. That's what shocked me."

**Design escalation:** Showed POC to a colleague at work who suggested MOB Kitchen as inspiration. That triggered the audit and redesign.

**Testing:** Asked for tests. Likes TDD concept. With Claude, the time constraint (writing test cases) is gone. Prompted Claude into TDD from the beginning. Suspects this explains the low bug count.

**User reactions:** Wife completely bought in. Work colleagues thought it was cool. "The UI isn't super polished, so it doesn't look immediately impressive — but for people with the same problems as me, they got it."

**Personal experience:** Subscribes to meal kits with wife. Price nearly double supermarket. 6-day-ahead pick window — been burnt multiple times forgetting, getting random meals they don't like.

**Proudest of:** The streamlined UX flow. The simple, opinionated recipe selection experience. Strong belief that many products aren't opinionated enough about UX. Set out to deliver an opinionated flow; happy with how it turned out.

**Hiring manager signal:** "Dylan has a great capability to integrate and synthesise insights from multiple sources into a product direction, using great product sense."

**Writing style notes:** Direct, conversational, no hedging. States what happened and why without dressing it up. Declarative. Australian spelling.
