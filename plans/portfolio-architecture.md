# Portfolio — Architecture (Phase 6)

**Status:** approved 2026-04-10. Feeds Phase 7 (implementation plan).

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 5** | Content-site native, zero-JS by default, islands architecture |
| React integration | `@astrojs/react` | For shadcn/ui components as islands |
| MDX | `@astrojs/mdx` | First-class Astro MDX support |
| Styling | **Tailwind v4** via `@astrojs/tailwind` | Token system fits cleanly into Tailwind v4 `@theme` |
| Components | **shadcn/ui** (new-york-v4 style) | Installed via shadcn MCP in Phase 7 |
| Icons | `lucide-react` | shadcn default |
| Fonts | `@fontsource/fraunces`, `@fontsource-variable/geist`, `@fontsource/geist-mono` | Self-hosted, no runtime Google Fonts cost |
| Content | **Astro Content Collections** | Native, no Velite needed |
| Analytics | **PostHog** (`posthog-js`) | Cookies on, AU-only audience |
| Hosting | **Cloudflare Pages** | Git integration, monorepo subdirectory build |

---

## Monorepo layout

```
claude-workspace/          (existing git repo)
├─ planner-app/
├─ the-weekly-app/
├─ portfolio/              ← NEW
│   ├─ CLAUDE.md
│   ├─ DIARY.md
│   ├─ package.json
│   ├─ astro.config.mjs
│   ├─ tailwind.config.mjs
│   ├─ tsconfig.json
│   ├─ content/
│   │   ├─ projects/
│   │   │   ├─ the-weekly.mdx
│   │   │   ├─ planner-app.mdx
│   │   │   ├─ workspace-audit.mdx
│   │   │   └─ portfolio.mdx
│   │   ├─ writing/
│   │   │   └─ *.mdx
│   │   └─ log/
│   │       └─ *.mdx
│   ├─ src/
│   │   ├─ content/config.ts         ← Zod schemas
│   │   ├─ components/
│   │   │   ├─ astro/                 ← .astro components
│   │   │   │   ├─ PageHeader.astro
│   │   │   │   ├─ PageFooter.astro
│   │   │   │   ├─ KickerLabel.astro
│   │   │   │   ├─ CaseStudyCard.astro
│   │   │   │   ├─ BuildLogTicker.astro
│   │   │   │   ├─ ProjectReferenceCard.astro
│   │   │   │   └─ CodeBlock.astro
│   │   │   └─ ui/                    ← shadcn React islands
│   │   │       ├─ button.tsx
│   │   │       ├─ badge.tsx
│   │   │       └─ ...
│   │   ├─ layouts/
│   │   │   ├─ BaseLayout.astro
│   │   │   ├─ CaseStudyLayout.astro
│   │   │   └─ WritingLayout.astro
│   │   ├─ pages/
│   │   │   ├─ index.astro                    → /
│   │   │   ├─ projects/
│   │   │   │   ├─ index.astro                → /projects
│   │   │   │   └─ [slug].astro               → /projects/:slug
│   │   │   ├─ writing/
│   │   │   │   ├─ index.astro                → /writing
│   │   │   │   └─ [slug].astro               → /writing/:slug
│   │   │   ├─ log.astro                      → /log
│   │   │   ├─ about.astro                    → /about
│   │   │   ├─ privacy.astro                  → /privacy
│   │   │   └─ 404.astro
│   │   └─ styles/
│   │       └─ globals.css                    ← Royal Tonal tokens
│   └─ public/
│       └─ fonts/ (auto-copied from fontsource)
└─ CLAUDE.md
```

---

## Content Collections schemas

### `src/content/config.ts`

```typescript
import { defineCollection, z, reference } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tldr: z.string().max(120),           // one-line summary for cards
    date: z.coerce.date(),
    tags: z.array(z.string()),
    live: z.string().url().optional(),   // link to live app
    hero: z.string().optional(),         // hero image path, optional
    summary: z.string().max(240),        // card body text
    weight: z.number().default(0),       // sort order on /projects
    featured: z.boolean().default(false), // show on landing?
    depth: z.enum(['full', 'lightweight']).default('full'),
  }),
});

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    summary: z.string().max(240),
    related_projects: z.array(reference('projects')).default([]),
  }),
});

const log = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(80),
    date: z.coerce.date(),
    summary: z.string().max(160),
    related_project: reference('projects').optional(),
    related_writing: reference('writing').optional(),
  }),
});

export const collections = { projects, writing, log };
```

**Benefits of this schema:**
- Build fails on typo'd slug references (Zod `reference()` validates at build time)
- `depth` field lets the landing page differentiate full vs lightweight case studies
- `featured` controls which projects show on landing vs full /projects index
- `tags` enable future filtering without refactoring

---

## Component inventory

### `.astro` components (static, no React)

| Component | Purpose |
|---|---|
| `PageHeader.astro` | Hamburger left, wordmark center, "Get in touch" pill right — same on desktop & mobile |
| `PageFooter.astro` | Minimal footer with LinkedIn + privacy link |
| `KickerLabel.astro` | Small-caps section labels ("Selected work · 01") |
| `CaseStudyCard.astro` | Card for the landing grid + /projects index |
| `BuildLogTicker.astro` | Right-column ticker on landing (5-6 entries) |
| `ProjectReferenceCard.astro` | Auto-rendered on writing posts that reference projects |
| `CodeBlock.astro` | MDX code block wrapper with copy button, uses `--code-*` tokens |

### React islands (shadcn/ui via MCP)

| Component | Use | Client directive |
|---|---|---|
| `Button` | "Get in touch" CTA pill | `client:idle` (for focus/hover) |
| `Badge` | Tags on case study cards | no hydration needed — static in Astro |
| `Card` | Base primitive, customised by `CaseStudyCard.astro` | reference only (copy styles) |

In practice: we install shadcn components as reference/source and use their styles inside `.astro` components. Only the "Get in touch" button actually hydrates as a React island. Everything else is static Astro rendering the shadcn-patterned classes.

**Expected JS budget:**
- Landing page: ~8KB JS gzipped (button island + analytics)
- Case study page: ~6KB JS gzipped (button island + analytics)
- Writing post: ~6KB JS gzipped
- Target: **<40KB** per page, easily met.

---

## PostHog integration

### Env vars
- `PUBLIC_POSTHOG_KEY` — project API key, public (prefixed `PUBLIC_` per Astro convention)
- `PUBLIC_POSTHOG_HOST` — `https://app.posthog.com` (default) or EU instance

### `BaseLayout.astro` snippet

```astro
---
const isProd = import.meta.env.PROD;
const posthogKey = import.meta.env.PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';
---
{isProd && posthogKey && (
  <script is:inline define:vars={{ posthogKey, posthogHost }}>
    !function(t,e){/* posthog snippet */}(document,window);
    posthog.init(posthogKey, { api_host: posthogHost });
  </script>
)}
```

Cookies enabled (default). AU-only audience means APP compliance via privacy policy only — no consent banner needed (decision captured in Phase 1).

### Funnel events to capture
- `page_viewed` — automatic
- `case_study_scrolled_80pct` — custom event via IntersectionObserver
- `get_in_touch_clicked` — header CTA + footer CTA
- `live_demo_clicked` — from case study pages

These wire the `landing → projects → case study (80%) → another case study (80%) → LinkedIn` funnel from the Phase 4 UX flows.

---

## Deploy — Cloudflare Pages

### Git integration config
| Setting | Value |
|---|---|
| Production branch | `master` |
| Build command | `cd portfolio && npm install && npm run build` |
| Build output | `portfolio/dist` |
| Root directory | *(leave blank — build command handles subdirectory)* |
| Environment variables | `PUBLIC_POSTHOG_KEY`, `PUBLIC_POSTHOG_HOST` |
| Node version | 20 |

### Custom domain
- Deferred to post-launch. v1 lives on `portfolio-XXX.pages.dev`.

---

## `check` script (per-project)

`portfolio/package.json`:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check && astro build",
    "test": "vitest run"
  }
}
```

`astro check` runs the TypeScript checker and Content Collection schema validation. `astro build` catches runtime build errors. Pre-commit hook runs `npm run check`.

---

## Decisions captured

- **Velite: rejected** — Astro Content Collections do the same thing natively, no extra dep.
- **Tailwind v4: yes** — latest major, cleaner `@theme` directive for tokens.
- **Self-hosted fonts: yes** — `@fontsource` packages, no runtime Google Fonts fetch.
- **Single JS island strategy** — only interactive bits hydrate; static pages ship ~zero JS.
- **Microsoft Clarity: rejected** — unnecessary bloat alongside PostHog.
- **Cookies on** — AU-only audience, APP compliance via privacy policy.
- **Monorepo** — portfolio lives as subdirectory in the workspace repo.

---

## Open items carried to Phase 7
- Exact Case Study template structure — locked during Case Study Workshop (chunk 5 of Phase 7)
- Writing post frontmatter for the first 2-3 curated dev-log posts
- Privacy policy content (boilerplate from APP guidelines, customised for PostHog)
