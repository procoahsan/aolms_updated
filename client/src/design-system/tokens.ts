// AOLMS Design System Tokens
// Centralized design tokens for colors, typography, spacing, radius, shadows, motion

// ============================================================
// COLOR TOKENS
// ============================================================

// Semantic color roles - these map to CSS variables for theme switching
export const colorTokens = {
  // Neutral scale (used for backgrounds, surfaces, text, borders)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Primary brand color
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Success (green)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning (amber)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Danger/Error (red)
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Info (sky)
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
} as const;

// Semantic color mappings for light/dark themes
// These define which neutral/semantic tokens map to which CSS variables
export const semanticColors = {
  light: {
    // Backgrounds
    '--color-bg-primary': 'neutral.50',
    '--color-bg-secondary': 'neutral.100',
    '--color-bg-tertiary': 'neutral.200',
    '--color-bg-elevated': 'white',

    // Surfaces (cards, modals, dropdowns)
    '--color-surface': 'white',
    '--color-surface-secondary': 'neutral.50',
    '--color-surface-elevated': 'white',

    // Text
    '--color-text-primary': 'neutral.900',
    '--color-text-secondary': 'neutral.600',
    '--color-text-muted': 'neutral.400',
    '--color-text-inverse': 'white',
    '--color-text-link': 'primary.600',

    // Borders & Dividers
    '--color-border': 'neutral.200',
    '--color-border-strong': 'neutral.300',
    '--color-divider': 'neutral.200',

    // Primary
    '--color-primary': 'primary.600',
    '--color-primary-hover': 'primary.700',
    '--color-primary-soft': 'primary.50',
    '--color-primary-soft-hover': 'primary.100',
    '--color-primary-text': 'white',

    // Success
    '--color-success': 'success.600',
    '--color-success-hover': 'success.700',
    '--color-success-soft': 'success.50',
    '--color-success-text': 'success.700',

    // Warning
    '--color-warning': 'warning.600',
    '--color-warning-hover': 'warning.700',
    '--color-warning-soft': 'warning.50',
    '--color-warning-text': 'warning.800',

    // Danger
    '--color-danger': 'danger.600',
    '--color-danger-hover': 'danger.700',
    '--color-danger-soft': 'danger.50',
    '--color-danger-text': 'danger.700',

    // Info
    '--color-info': 'info.600',
    '--color-info-hover': 'info.700',
    '--color-info-soft': 'info.50',
    '--color-info-text': 'info.700',

    // Focus
    '--color-focus': 'primary.500',
    '--color-focus-ring': 'primary.200',

    // Overlay
    '--color-overlay': 'neutral.900',
    '--color-overlay-opacity': '0.5',
  },

  dark: {
    // Backgrounds - carefully tuned, not just inverted
    '--color-bg-primary': 'neutral.950',
    '--color-bg-secondary': 'neutral.900',
    '--color-bg-tertiary': 'neutral.800',
    '--color-bg-elevated': 'neutral.800',

    // Surfaces
    '--color-surface': 'neutral.900',
    '--color-surface-secondary': 'neutral.800',
    '--color-surface-elevated': 'neutral.800',

    // Text
    '--color-text-primary': 'neutral.50',
    '--color-text-secondary': 'neutral.300',
    '--color-text-muted': 'neutral.500',
    '--color-text-inverse': 'neutral.950',
    '--color-text-link': 'primary.400',

    // Borders & Dividers
    '--color-border': 'neutral.700',
    '--color-border-strong': 'neutral.600',
    '--color-divider': 'neutral.700',

    // Primary
    '--color-primary': 'primary.500',
    '--color-primary-hover': 'primary.400',
    '--color-primary-soft': 'primary.900',
    '--color-primary-soft-hover': 'primary.800',
    '--color-primary-text': 'white',

    // Success
    '--color-success': 'success.500',
    '--color-success-hover': 'success.400',
    '--color-success-soft': 'success.900',
    '--color-success-text': 'success.400',

    // Warning
    '--color-warning': 'warning.500',
    '--color-warning-hover': 'warning.400',
    '--color-warning-soft': 'warning.900',
    '--color-warning-text': 'warning.300',

    // Danger
    '--color-danger': 'danger.500',
    '--color-danger-hover': 'danger.400',
    '--color-danger-soft': 'danger.900',
    '--color-danger-text': 'danger.400',

    // Info
    '--color-info': 'info.500',
    '--color-info-hover': 'info.400',
    '--color-info-soft': 'info.900',
    '--color-info-text': 'info.400',

    // Focus
    '--color-focus': 'primary.400',
    '--color-focus-ring': 'primary.900',

    // Overlay
    '--color-overlay': 'neutral.950',
    '--color-overlay-opacity': '0.7',
  },
} as const;

// Status colors (for badges, chips, indicators)
export const statusColors = {
  draft: { light: 'neutral', dark: 'neutral' },
  pending: { light: 'warning', dark: 'warning' },
  assigned: { light: 'info', dark: 'info' },
  delivered: { light: 'primary', dark: 'primary' },
  submitted: { light: 'primary', dark: 'primary' },
  completed: { light: 'success', dark: 'success' },
  locked: { light: 'neutral', dark: 'neutral' },
  cancelled: { light: 'danger', dark: 'danger' },
  active: { light: 'success', dark: 'success' },
  inactive: { light: 'neutral', dark: 'neutral' },
  in_progress: { light: 'warning', dark: 'warning' },
  resolved: { light: 'success', dark: 'success' },
  open: { light: 'info', dark: 'info' },
  closed: { light: 'neutral', dark: 'neutral' },
} as const;

// ============================================================
// TYPOGRAPHY TOKENS
// ============================================================

export const fontFamilies = {
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'JetBrains Mono, ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
} as const;

export const fontSizes = {
  // Display / Page titles
  'display-xl': { size: '48px', lineHeight: '1.1', letterSpacing: '-0.02em', weight: '700' },
  'display-lg': { size: '36px', lineHeight: '1.15', letterSpacing: '-0.02em', weight: '700' },
  'display-md': { size: '30px', lineHeight: '1.2', letterSpacing: '-0.01em', weight: '700' },
  'display-sm': { size: '24px', lineHeight: '1.25', letterSpacing: '-0.01em', weight: '600' },

  // Headings
  h1: { size: '30px', lineHeight: '1.25', letterSpacing: '-0.01em', weight: '600' },
  h2: { size: '24px', lineHeight: '1.3', letterSpacing: '-0.01em', weight: '600' },
  h3: { size: '20px', lineHeight: '1.35', letterSpacing: '0', weight: '600' },
  h4: { size: '18px', lineHeight: '1.4', letterSpacing: '0', weight: '600' },
  h5: { size: '16px', lineHeight: '1.45', letterSpacing: '0', weight: '600' },
  h6: { size: '14px', lineHeight: '1.5', letterSpacing: '0', weight: '600' },

  // Body text
  'body-lg': { size: '18px', lineHeight: '1.6', letterSpacing: '0', weight: '400' },
  'body-md': { size: '16px', lineHeight: '1.55', letterSpacing: '0', weight: '400' },
  'body-sm': { size: '14px', lineHeight: '1.5', letterSpacing: '0', weight: '400' },
  'body-xs': { size: '12px', lineHeight: '1.5', letterSpacing: '0', weight: '400' },

  // Labels & UI
  'label-lg': { size: '14px', lineHeight: '1.5', letterSpacing: '0', weight: '500' },
  'label-md': { size: '13px', lineHeight: '1.5', letterSpacing: '0', weight: '500' },
  'label-sm': { size: '12px', lineHeight: '1.5', letterSpacing: '0.01em', weight: '500' },

  // Caption / Helper
  caption: { size: '12px', lineHeight: '1.4', letterSpacing: '0.01em', weight: '400' },
  overline: { size: '11px', lineHeight: '1.5', letterSpacing: '0.05em', weight: '600', textTransform: 'uppercase' },

  // Table
  'table-header': { size: '12px', lineHeight: '1.5', letterSpacing: '0.05em', weight: '600', textTransform: 'uppercase' },
  'table-cell': { size: '13px', lineHeight: '1.5', letterSpacing: '0', weight: '400' },
  'table-cell-sm': { size: '12px', lineHeight: '1.5', letterSpacing: '0', weight: '400' },

  // Button
  'button-sm': { size: '13px', lineHeight: '1.5', letterSpacing: '0', weight: '500' },
  'button-md': { size: '14px', lineHeight: '1.5', letterSpacing: '0', weight: '500' },
  'button-lg': { size: '16px', lineHeight: '1.5', letterSpacing: '0', weight: '500' },

  // Navigation
  'nav-item': { size: '14px', lineHeight: '1.5', letterSpacing: '0', weight: '500' },
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeights = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.6,
} as const;

// ============================================================
// SPACING TOKENS
// ============================================================

// Base unit: 4px
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
} as const;

// Semantic spacing aliases
export const semanticSpacing = {
  // Component internal spacing
  'space-xs': spacing[1],    // 4px
  'space-sm': spacing[2],    // 8px
  'space-md': spacing[3],    // 12px
  'space-lg': spacing[4],    // 16px
  'space-xl': spacing[6],    // 24px
  'space-2xl': spacing[8],   // 32px

  // Layout spacing
  'layout-gap-sm': spacing[2],    // 8px
  'layout-gap-md': spacing[4],    // 16px
  'layout-gap-lg': spacing[6],    // 24px
  'layout-gap-xl': spacing[8],    // 32px

  // Page spacing
  'page-padding-sm': spacing[4],   // 16px
  'page-padding-md': spacing[6],   // 24px
  'page-padding-lg': spacing[8],   // 32px

  // Container max widths
  'container-sm': '640px',
  'container-md': '768px',
  'container-lg': '1024px',
  'container-xl': '1280px',
  'container-2xl': '1536px',
} as const;

// ============================================================
// BORDER RADIUS TOKENS
// ============================================================

export const borderRadius = {
  none: '0',
  sm: '4px',    // 4px - small elements (badges, chips)
  md: '6px',    // 6px - default for inputs, buttons
  lg: '8px',    // 8px - cards, modals, dropdowns
  xl: '12px',   // 12px - larger cards, sheets
  '2xl': '16px', // 16px - drawers, large modals
  full: '9999px', // Pills, avatars
} as const;

// ============================================================
// SHADOW TOKENS
// ============================================================

export const shadows = {
  // Light theme shadows
  light: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    focus: '0 0 0 3px rgb(59 130 246 / 0.4)',
  },

  // Dark theme shadows - subtle, not heavy
  dark: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.2)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.2)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.2)',
    focus: '0 0 0 3px rgb(59 130 246 / 0.3)',
  },
} as const;

// ============================================================
// MOTION TOKENS
// ============================================================

export const motion = {
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Common transition presets
  transitions: {
    fast: '100ms easeOut',
    normal: '200ms easeOut',
    slow: '300ms easeOut',
    colors: '100ms easeOut',
    transform: '150ms easeOut',
    opacity: '100ms easeOut',
    shadow: '200ms easeOut',
    all: '200ms easeOut',
  },
} as const;

// ============================================================
// Z-INDEX TOKENS
// ============================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
} as const;

// ============================================================
// BREAKPOINT TOKENS
// ============================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================
// ICON SIZE TOKENS
// ============================================================

export const iconSizes = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

// ============================================================
// COMPONENT SIZE TOKENS
// ============================================================

export const componentSizes = {
  // Input heights
  input: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },

  // Button heights
  button: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },

  // Avatar sizes
  avatar: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
  },

  // Modal/Drawer widths
  modal: {
    sm: '384px',   // max-w-sm
    md: '512px',   // max-w-md
    lg: '768px',   // max-w-lg
    xl: '896px',   // max-w-xl
    '2xl': '1024px', // max-w-2xl
    full: '95vw',
  },

  drawer: {
    sm: '320px',
    md: '384px',
    lg: '512px',
    full: '100vw',
  },
} as const;

// ============================================================
// EXPORT ALL TOKENS
// ============================================================

export const tokens = {
  colors: colorTokens,
  semanticColors,
  statusColors,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  semanticSpacing,
  borderRadius,
  shadows,
  motion,
  zIndex,
  breakpoints,
  iconSizes,
  componentSizes,
} as const;

export type Tokens = typeof tokens;
export type ColorTokens = typeof colorTokens;
export type SemanticColors = typeof semanticColors.light;
export type FontSizes = typeof fontSizes;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows.light;
export type Motion = typeof motion;
export type ZIndex = typeof zIndex;
export type Breakpoints = typeof breakpoints;
export type IconSizes = typeof iconSizes;
export type ComponentSizes = typeof componentSizes;