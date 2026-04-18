export type SchemaVersion = 1;

export interface DesignTokens {
  schemaVersion: SchemaVersion;
  meta: {
    name: string;
    description?: string;
  };
  colors: ColorTokens;
  typography: TypographyTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  icons: IconTokens;
}

/** HSL triplet strings (shadcn convention), e.g. "222 47% 11%" */
export interface ColorTokens {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  highlight?: string;
  highlightForeground?: string;
  highlightSoft?: string;
  borderStrong?: string;
}

export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono?: string;
    display?: string;
  };
  baseSize?: string;
  weights?: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  scale?: Record<string, string>;
  lineHeight?: Record<string, string>;
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
}

export interface IconTokens {
  /** Lucide strokeWidth prop. 1.5 = refined, 2 = bold. */
  strokeWidth: 1 | 1.5 | 2;
}
