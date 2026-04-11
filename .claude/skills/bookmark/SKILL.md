---
name: bookmark
description: Capture the most recent conversation turns as a portfolio transcript draft. Invoke proactively when the user signals a moment is worth keeping ("that was the key decision", "that's when I realised", "bookmark this", "let's capture this").
allowed-tools: Bash Read
---

# Bookmark Transcript

Captures the last N conversation turns from the active session as a reviewed draft in `src/content/transcripts/drafts/`.

## When to invoke

Invoke **proactively** when the user says anything like:
- "that was the key decision"
- "that's when I realised"
- "bookmark this" / "capture this"
- "let's save this exchange"
- "this is worth keeping"

Also suggest it at natural decision points — a significant pivot, a constraint discovered, a design choice locked in — even if the user hasn't mentioned bookmarking.

## Arguments (passed after the skill name)

`/bookmark <slug> [note]`

- `<slug>` — required. Kebab-case, descriptive, specific. Examples: `card-strip-layout-locked`, `transcript-schema-decision`, `gradient-mark-dropped`. Bad: `bookmark1`, `decision`.
- `[note]` — optional short phrase in the user's voice. What made this moment significant? Example: `"when we decided to drop gradient marks from the type pool"`.

## Steps

1. **Confirm the slug** from the user's arguments. If none provided, suggest one based on what just happened and ask to confirm.

2. **Run the script** from the portfolio directory:
   ```
   cd "C:\Users\User\Documents\Claude code\portfolio" && node scripts/bookmark-transcript.mjs --slug <slug> --note "<note>" --back 6
   ```
   Adjust `--back` if the significant exchange is longer than 6 turns (up to ~12 is reasonable for a complex decision thread).

3. **Report the result** inline — slug, turn count, path. If the script errors (stale session, slug already published, etc.), explain the error and suggest a fix.

4. **Do not open or display** the draft file — the whole point is that it's fast. The user reviews it later, outside the flow.

## Extend an existing draft

If the user wants to append more turns to a draft they already started:
```
node scripts/bookmark-transcript.mjs --slug <slug> --extend
```

## Promoting later

The user promotes manually when ready:
```
node scripts/promote-transcript.mjs --slug <slug>
```
Or, if reviewing inline in a session, Claude can run it with `--yes` after showing the draft content.

## What the script does

- Reads the most-recently-modified JSONL in `~/.claude/projects/C--Users-User-Documents-Claude-code/`
- Filters to real user + assistant turns (skips isMeta, tool results, system injections)
- Collapses tool_use blocks into one-line labels (`[Read path]`, `[Bash: ...]`, etc.)
- Redacts Windows paths → `~/...`, emails → `[redacted-email]`, tokens → `[REDACTED]`
- Writes to `src/content/transcripts/drafts/<slug>.json`
