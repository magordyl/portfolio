# Development Diary

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
