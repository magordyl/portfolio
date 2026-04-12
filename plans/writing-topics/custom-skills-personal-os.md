---
slug: custom-skills-personal-os
title: "Build your own operating system with Claude Code skills"
status: seed
captured: 2026-04-12
transcripts: []
source_project: portfolio
context: ""
---

**Working title options:**
- Build your own operating system with Claude Code skills
- The skill is the primitive
- My custom workflows, one skill at a time

**Thesis (user's exact wording):**

> With Claude Code you can build your perfect operating system with no code, and automate everything you want.

## Shape

Walk through the actual skills in the workspace as worked examples. Each skill is a concrete instance of "a friction point that got automated." The post is concrete ("here are mine, here is what each one replaces, here is how they compose"), not abstract.

## Structural elements

1. **Per-skill workflow diagrams.** Each skill example gets its own flowchart. Royal Tonal clean vector per the imagery standards. One diagram per skill, same archetype, same aesthetic. The repetition is the point: the skills feel like a family because they render in the same language.
2. **Hero visual: the skill constellation.** A network diagram of every custom skill in the workspace with edges showing which skills invoke which, which hooks each skill attaches to, and which commit points each skill sits next to. The network is the evidence that this is an operating system, not a loose collection of shortcuts.
3. **Concrete inventory.** Name the real skills: `/new-feature`, `/new-idea`, `/session-end`, `/bookmark`, `/writing-topic`, `/coverage`, `/design-explorer`, `/deploy-preview`, plus whatever lands between now and draft time. For each one: the friction it removed, the shape of the input, the shape of the output, and the hook it attaches to if any.

## Why this is its own post, not a sub-post of #2

Entry #2's series frames the change around "what the workflow looks like now." This post frames the change around **the skill as the primitive unit of automation.** The skill constellation hero is a specifically different visual than the rules-file lens of #2 sub-post 1 or the session-end lens of #2 sub-post 2. The overlap is real and deliberate: readers should be cross-linked.

The decision to keep it separate rests on the hero. If the skill network diagram does the heavy lifting, it deserves the top-level slot. If it does not, fold this into #2 as a fifth sub-post.

## Supporting arguments to develop in the draft

1. **Skills collapse the prompt-engineering tax.** A skill is a prompt plus a convention plus a hook. Once the skill exists, the behaviour fires on trigger without re-prompting.
2. **The skill is the unit of personalisation.** Settings, hooks, CLAUDE.md rules, and memory files are all part of the surface area. The skill is the piece that composes behaviour into named, invocable workflows.
3. **You can build the operating system before you can build the tool.** Writing a skill is cheaper than writing the script it wraps. A skill can be a standing prompt until it earns its way to real code.
4. **Composition is what makes it an OS.** `/new-feature` invokes `/design-explorer`. `/session-end` reads pending `/bookmark` drafts. `/new-idea` writes to `ideas/INDEX.md` which `/new-feature` reads. The graph of skill-to-skill references earns the "operating system" framing.
5. **The meta-loop is the proof.** This post will itself be captured via `/writing-topic`, drafted alongside the other writing posts in chunk 5.5, and promoted through `/session-end`.

## Counterpoints to address

- *"These are just shell scripts in a different jacket."* Partially true for graduated skills. Not true for prompt-only skills.
- *"It only works because you built it for yourself."* Yes. That is the argument.
- *"Configuration drift will eat this."* Real risk. Mitigated by committing skills to the repo and running them through the same pre-commit/check discipline as code.

## Open questions for the draft

- Which skills lead?
- Does the skill constellation need to be live-updated from `.claude/skills/` or is a static SVG enough?
- What is the boundary between skill and hook? The post needs to explain both.
- Does the post include a recipe or stay descriptive? Lean descriptive.

## Draft status

`[seed]`. Captured 2026-04-12. Do not expand into a draft until chunk 5.5 begins. If the skill constellation hero visual does not hold its own weight during layout exploration, fold this into #2 as sub-post 5.
