import type { DesignTokens } from '../design-system/types';
import { defaultTokens } from '../design-system/defaults';

/**
 * Portfolio design tokens — Royal Tonal palette, dark-mode only.
 *
 * The workspace DesignTokens schema maps to shadcn-style semantic roles.
 * The portfolio's actual CSS vars use a project-specific naming convention
 * (--royal-*, --ink-*, --bg, --card, etc.) defined in globals.css. The
 * `palette` export below is the canonical source for the raw scale; the
 * `tokens` export maps those values into the workspace schema for tooling
 * compatibility.
 *
 * Note: shadcn is explicitly exempted for this project. Existing components
 * are bespoke Astro components built against the design explorers. Future
 * components may use shadcn where applicable.
 */
export const tokens: DesignTokens = {
  ...defaultTokens,
  meta: {
    name: 'portfolio',
    description: 'Personal portfolio — Royal Tonal dark-mode, Fraunces × Geist',
  },
  colors: {
    // Mapped from Royal Tonal scale + ink scale to workspace semantic roles
    background: '235 38% 11%',           // royal-2  (#121428)
    foreground: '42 21% 88%',            // ink      (#E6E2D9)
    primary: '228 69% 55%',              // royal-8  (#3B5BDB)
    primaryForeground: '0 0% 100%',
    secondary: '234 38% 15%',            // royal-3  (#181B36)
    secondaryForeground: '42 21% 88%',   // ink
    muted: '233 40% 20%',               // royal-4  (#1E2346)
    mutedForeground: '40 8% 58%',        // ink-dim  (#9C968A)
    accent: '228 77% 61%',              // royal-9  (#4D6DE8)
    accentForeground: '0 0% 100%',
    destructive: defaultTokens.colors.destructive,
    destructiveForeground: defaultTokens.colors.destructiveForeground,
    border: '230 41% 36%',              // royal-7  (#364280)
    input: '232 41% 25%',               // royal-5  (#252C58)
    ring: '230 100% 71%',               // royal-10 (#6C85FF)
    card: '233 40% 20%',                // royal-4  (#1E2346)
    cardForeground: '42 21% 88%',        // ink
  },
  typography: {
    ...defaultTokens.typography,
    fontFamily: {
      sans: "'Geist Variable', -apple-system, system-ui, sans-serif",
      mono: "'Geist Mono', 'SF Mono', Menlo, monospace",
      display: "'Fraunces', Georgia, serif",
    },
    baseSize: '16px',
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  radius: {
    sm: '2px',     // tags
    md: '8px',     // cards, general
    lg: '12px',    // large containers
    full: '9999px',
  },
  shadows: {
    sm: defaultTokens.shadows.sm,
    md: defaultTokens.shadows.md,
    lg: '0 8px 32px rgba(0, 0, 0, 0.5)', // card hover
  },
  icons: { strokeWidth: 1.5 },
};

/**
 * Full Royal Tonal raw scale + ink scale. These are the hex values that
 * globals.css defines as --royal-* and --ink-* CSS vars. Components
 * reference these vars directly.
 */
export const palette = {
  royal: {
    1: '#0E0F1C',
    2: '#121428',
    3: '#181B36',
    4: '#1E2346',
    5: '#252C58',
    6: '#2D366C',
    7: '#364280',
    8: '#3B5BDB',
    9: '#4D6DE8',
    10: '#6C85FF',
    11: '#A5B4FF',
    12: '#D5DCFA',
  },
  ink: {
    DEFAULT: '#E6E2D9',
    dim: '#9C968A',
    faint: '#5E584F',
  },
  /**
   * Violet signal — 5-step secondary accent. Used only by <ChatTranscript>
   * to give Dylan's turns a distinct register from Claude's royal turns.
   * Do NOT introduce new usages without design review — the whole palette
   * is otherwise royal-monochrome by design.
   */
  violet: {
    8:  '#8C3BDB',
    9:  '#9D4DE8',
    10: '#B47CFF',
    11: '#C89BFF',
    12: '#E6D4FF',
  },
  /**
   * Signature gradient — royal → violet diagonal. Used on <ChatTranscript>'s
   * outer border (via the --grad-rv CSS var in globals.css) and reserved
   * for any future "this is the showcase" container treatment.
   */
  gradients: {
    royalViolet: 'linear-gradient(135deg, #3B5BDB 0%, #8C3BDB 100%)',
  },
} as const;

/**
 * Role tokens — per-component variants. Components reference these, never
 * the raw scale. Each role is allowlisted in
 * plans/portfolio-design-tokens.md §Component variant allowlists. Adding a
 * new role requires updating that doc first, then mirroring here and in
 * globals.css.
 *
 * Values are resolved hex/rgba strings so tooling can consume them without
 * CSS resolution; the semantic relationship (role → raw scale slot) lives in
 * the accompanying comment.
 */
export const roles = {
  link: {
    hover: palette.royal[11],                           // --link-hover
  },
  button: {
    fg: '#FFFFFF',                                      // --button-fg (NOT royal-12 — WCAG AA body fails)
  },
  placeholder: {
    bg: palette.royal[3],                               // --placeholder-bg
    gradient: `linear-gradient(135deg, ${palette.royal[3]} 0%, ${palette.royal[5]} 100%)`,
  },
  tag: {
    default: { fg: palette.ink.dim,    bg: 'transparent',              border: palette.royal[4] },
    active:  { fg: palette.royal[11],  bg: 'rgba(59, 91, 219, 0.08)',  border: palette.royal[8] },
    signal:  { fg: palette.violet[11], bg: 'rgba(140, 59, 219, 0.10)', border: palette.violet[8] },
    status:  { fg: palette.ink.dim,    bg: 'transparent',              border: palette.royal[7] },
  },
  kicker: {
    default: palette.royal[11],
    signal:  palette.violet[11],
  },
  dot: {
    neutral:   palette.ink.dim,
    active:    palette.royal[10],
    attention: palette.violet[10],
  },
  border: {
    hairline: palette.royal[3],
    // default + strong live as semantic aliases (--border, --border-strong) in globals.css
  },
  expanderPill: {
    high: { fg: palette.royal[11], border: palette.royal[8] },
    bg:   { fg: palette.ink.dim,   border: palette.royal[4] },
  },
} as const;

/**
 * Project-specific type scale. Complements the global scale with
 * portfolio-specific named slots (hero, display, case, kicker).
 * These map to --text-* vars in globals.css.
 */
export const typeScale = {
  hero: '4.5rem',      // 72px
  display: '3rem',     // 48px
  case: '2rem',        // 32px
  h3: '1.5rem',        // 24px
  h4: '1.25rem',       // 20px
  body: '1rem',        // 16px
  sm: '0.875rem',      // 14px
  xs: '0.75rem',       // 12px
  kicker: '0.6875rem', // 11px
} as const;
