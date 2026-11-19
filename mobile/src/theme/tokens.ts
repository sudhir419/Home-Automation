// ============================================================
// DESIGN TOKENS — Single source of truth for all visual values
// No hard-coded colors, sizes, or fonts anywhere else.
// ============================================================

export const Colors = {
  // Canvas
  dark: {
    background: '#080A0D',
    surface: 'rgba(22,26,34,0.75)',
    surfaceBorder: 'rgba(255,255,255,0.08)',
    surfaceElevated: 'rgba(28,32,42,0.85)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textTertiary: 'rgba(255,255,255,0.40)',
    textInverse: '#080A0D',
    separator: 'rgba(255,255,255,0.06)',
    overlay: 'rgba(0,0,0,0.6)',
  },
  light: {
    background: '#F8F9FA',
    surface: 'rgba(255,255,255,0.90)',
    surfaceBorder: 'rgba(0,0,0,0.08)',
    surfaceElevated: 'rgba(255,255,255,0.95)',
    text: '#0F1419',
    textSecondary: 'rgba(15,20,25,0.65)',
    textTertiary: 'rgba(15,20,25,0.40)',
    textInverse: '#FFFFFF',
    separator: 'rgba(0,0,0,0.06)',
    overlay: 'rgba(0,0,0,0.3)',
  },

  // Semantic device palette
  brand: '#10B981',       // Emerald primary accent
  brandDim: 'rgba(16,185,129,0.15)',
  brandGlow: 'rgba(16,185,129,0.35)',

  lights: {
    primary: '#F59E0B',
    secondary: '#FEF08A',
    glow: 'rgba(245,158,11,0.30)',
  },
  cooling: {
    primary: '#06B6D4',
    secondary: '#3B82F6',
    glow: 'rgba(6,182,212,0.30)',
  },
  heating: {
    primary: '#F97316',
    glow: 'rgba(249,115,22,0.30)',
  },
  security: {
    primary: '#10B981',
    glow: 'rgba(16,185,129,0.30)',
  },
  alert: {
    primary: '#EF4444',
    glow: 'rgba(239,68,68,0.30)',
  },
  fan: {
    primary: '#8B5CF6',
    glow: 'rgba(139,92,246,0.30)',
  },
  entertainment: {
    primary: '#EC4899',
    glow: 'rgba(236,72,153,0.30)',
  },
  waterHeating: {
    primary: '#F97316',
    glow: 'rgba(249,115,22,0.30)',
  },
  outlet: {
    primary: '#6366F1',
    glow: 'rgba(99,102,241,0.30)',
  },
} as const;

export const Typography = {
  heading: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 15,
    lineHeight: 20,
    fontVariant: ['tabular-nums' as const],
  },
  monoLarge: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 32,
    lineHeight: 40,
    fontVariant: ['tabular-nums' as const],
  },
  monoSmall: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ['tabular-nums' as const],
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  }),
} as const;

export const Animation = {
  spring: {
    press: { mass: 0.7, damping: 14, stiffness: 200 },
    bounce: { mass: 0.8, damping: 12, stiffness: 180 },
    smooth: { mass: 1.0, damping: 20, stiffness: 300 },
    snappy: { mass: 0.6, damping: 16, stiffness: 400 },
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

// Device category to color mapping
export function getDeviceCategoryColor(category: string): { primary: string; glow: string } {
  switch (category) {
    case 'lighting': return Colors.lights;
    case 'fan': return Colors.fan;
    case 'climate': return Colors.cooling;
    case 'entertainment': return Colors.entertainment;
    case 'water-heating': return Colors.waterHeating;
    case 'outlet': return Colors.outlet;
    case 'security': return Colors.security;
    default: return { primary: Colors.brand, glow: Colors.brandGlow };
  }
}
