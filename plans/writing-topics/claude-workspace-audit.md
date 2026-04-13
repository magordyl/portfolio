---
slug: claude-workspace-audit
title: "What I learned auditing my Claude Code workspace setup"
status: seed
captured: 2026-04-13
transcripts: []
source_project: workspace
context: "Meta-commentary on the Claude Code setup process — rules files, hooks, memory, skill architecture — framed as a writing post rather than a project case study."
---

**Shape:** a single post, not a series. The subject is the workspace *configuration layer* — what's in it, why, and what it's like to design it deliberately.

**Working title options:**
- What I learned auditing my Claude Code workspace setup
- Designing the rules layer: how I configure Claude Code to work the way I want
- The setup that makes everything else possible

## Why a writing post, not a case study

The workspace audit was initially planned as a lightweight case study. Converted to a writing topic because:
- It doesn't have a product artefact at its core — there's no shipped thing a user interacts with
- The interesting signal is *thinking*, not *shipping*: decisions about what goes in CLAUDE.md vs rules files vs memory vs skills
- Writing post framing lets it connect to the `workflow-evolution-series` series as a companion or sub-post

## Candidate thesis

The workspace configuration is product design for an audience of one. The rules file, hooks, memory, and skills form a system — not a collection of settings. Designing it intentionally is what makes the agent useful rather than unpredictable.

## Supporting arguments to develop

1. **The rules file is load-bearing, not decorative.** It carries the decisions that would otherwise have to be re-litigated every session. Architecture principles, testing conventions, deployment platform choices — these aren't preferences, they're commitments. Writing them down as rules is how they stay enforced.

2. **Memory, CLAUDE.md, and rules files solve different problems.** CLAUDE.md is project-scoped and git-tracked — for things the whole team (or future-you) should know. Rules files are for domain-specific guidance that's too long to live in CLAUDE.md. Memory is for things Claude learns about you across sessions. Confusing them produces a setup that duplicates or drops important context.

3. **Skills are the interface.** A skill isn't just a macro; it's a UX decision. `/session-end`, `/bookmark`, `/new-feature` each encode a workflow decision about where judgment should live (the skill) vs where it can be automated (the hook). The test for a well-designed skill: does it feel like a natural part of the workflow, or does it feel like you're filling out a form?

4. **The audit is never finished.** The setup you build on day one is a prototype. The one you have after 10 sessions is a design. The discipline is iterating on it deliberately — not letting it drift by accumulation.

## Possible structure

1. **Hook** — one concrete scene where the setup either saved the session or failed it
2. **The layers** — what each part of the stack does and why it exists (CLAUDE.md / rules / memory / skills / hooks)
3. **Decisions made** — 3–4 specific choices and the trade-off reasoning (e.g. why workspace CLAUDE.md has a "How We Work" section instead of per-project rules for shared conventions)
4. **What I got wrong** — at least one thing that seemed right at design time and proved wrong in practice
5. **Close** — an assertion, not a question

## Open questions

- Does this stand alone or does it become a sub-post in `workflow-evolution-series` (sub-post 1, engineering/architecture)?
- Is there a concrete enough "before and after" to anchor the hook? Check diary entries from early workspace audit sessions.
- What's the single thesis this post is on the hook for? "Designing intentionally" is still too vague.

## Draft status

`[seed]`. Captured 2026-04-13. Do not draft until chunk 5.5 begins.
