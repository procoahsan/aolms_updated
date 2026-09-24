// AOLMS Design System - CSS Variable Definitions
// These variables are applied to document.documentElement for runtime theme switching

import { tokens } from './tokens';

/**
 * Generates the CSS variable definitions for both light and dark themes.
 * This is used by the theme provider to apply theme variables at runtime.
 */

export function generateCSSVars(theme: 'light' | 'dark'): Record<string, string> {
  const vars: Record<string, string> = {};
  const semantic = theme === 'light' ? tokens.semanticColors.light : tokens.semanticColors.dark;

  // Apply semantic colors
  for (const [key, value] of Object.entries(semantic)) {
    vars[key] = value;
  }

  // Apply neutral scale
  for (const [key, value] of Object.entries(tokens.colors.neutral)) {
    vars[`--color-neutral-${key}`] = value;
  }

  // Apply primary scale
  for (const [key, value] of Object.entries(tokens.colors.primary)) {
    vars[`--color-primary-${key}`] = value;
  }

  // Apply success scale
  for (const [key, value] of Object.entries(tokens.colors.success)) {
    vars[`--color-success-${key}`] = value;
  }

  // Apply warning scale
  for (const [key, value] of Object.entries(tokens.colors.warning)) {
    vars[`--color-warning-${key}`] = value;
  }

  // Apply danger scale
  for (const [key, value] of Object.entries(tokens.colors.danger)) {
    vars[`--color-danger-${key}`] = value;
  }

  // Apply info scale
  for (const [key, value] of Object.entries(tokens.colors.info)) {
    vars[`--color-info-${key}`] = value;
  }

  // Apply spacing
  for (const [key, value] of Object.entries(tokens.spacing)) {
    vars[`--spacing-${key}`] = value;
  }

  // Apply border radius
  for (const [key, value] of Object.entries(tokens.borderRadius)) {
    vars[`--radius-${key}`] = value;
  }

  // Apply shadows
  const shadows = theme === 'light' ? tokens.shadows.light : tokens.shadows.dark;
  for (const [key, value] of Object.entries(shadows)) {
    vars[`--shadow-${key}`] = value;
  }

  // Apply font families
  vars['--font-sans'] = tokens.fontFamilies.sans;
  vars['--font-mono'] = tokens.fontFamilies.mono;

  // Apply z-index
  for (const [key, value] of Object.entries(tokens.zIndex)) {
    vars[`--z-${key}`] = String(value);
  }

  // Apply motion
  vars['--duration-fast'] = tokens.motion.duration.fast;
  vars['--duration-normal'] = tokens.motion.duration.normal;
  vars['--duration-slow'] = tokens.motion.duration.slow;
  vars['--easing-out'] = tokens.motion.easing.easeOut;
  vars['--easing-in-out'] = tokens.motion.easing.easeInOut;

  return vars;
}

/**
 * Helper to apply CSS variables to an element
 */
export function applyThemeVars(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  const vars = generateCSSVars(theme);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

/**
 * Helper to remove all theme variables (for cleanup)
 */
export function clearThemeVars(): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const allVars = [
    ...Object.keys(generateCSSVars('light')),
    ...Object.keys(generateCSSVars('dark')),
  ];
  const uniqueVars = new Set(allVars);
  uniqueVars.forEach((varName) => {
    root.style.removeProperty(varName);
  });
}