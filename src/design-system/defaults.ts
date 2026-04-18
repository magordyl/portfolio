import type { DesignTokens } from './types';

export const defaultTokens: DesignTokens = {
  schemaVersion: 1,
  meta: { name: 'default' },
  colors: {
    background: '240 10% 4%',
    foreground: '0 0% 98%',
    primary: '0 0% 98%',
    primaryForeground: '240 6% 10%',
    secondary: '240 4% 16%',
    secondaryForeground: '0 0% 98%',
    muted: '240 4% 16%',
    mutedForeground: '240 5% 65%',
    accent: '240 4% 16%',
    accentForeground: '0 0% 98%',
    destructive: '0 63% 31%',
    destructiveForeground: '0 0% 98%',
    border: '240 4% 16%',
    input: '240 4% 16%',
    ring: '240 5% 84%',
  },
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, system-ui, sans-serif',
      mono: '"JetBrains Mono", "SF Mono", Menlo, monospace',
    },
    baseSize: '16px',
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  },
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.35)',
    lg: '0 12px 40px rgba(0,0,0,0.5)',
  },
  icons: { strokeWidth: 1.5 },
};
