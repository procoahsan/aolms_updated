// AOLMS Design System - CSS Variables
// These CSS variables are applied to :root and used by Tailwind

export const cssVariables = {
  light: {
    // Backgrounds
    '--color-bg-primary': '#f9fafb',
    '--color-bg-secondary': '#f3f4f6',
    '--color-bg-tertiary': '#e5e7eb',

    // Surfaces
    '--color-surface': '#ffffff',
    '--color-surface-secondary': '#f9fafb',
    '--color-surface-elevated': '#ffffff',

    // Text
    '--color-text-primary': '#111827',
    '--color-text-secondary': '#4b5563',
    '--color-text-muted': '#9ca3af',
    '--color-text-inverse': '#ffffff',
    '--color-text-link': '#2563eb',

    // Borders
    '--color-border': '#e5e7eb',
    '--color-border-strong': '#d1d5db',
    '--color-divider': '#e5e7eb',

    // Primary
    '--color-primary': '#2563eb',
    '--color-primary-hover': '#1d4ed8',
    '--color-primary-soft': '#eff6ff',
    '--color-primary-soft-hover': '#dbeafe',
    '--color-primary-text': '#ffffff',

    // Success
    '--color-success': '#16a34a',
    '--color-success-hover': '#15803d',
    '--color-success-soft': '#f0fdf4',
    '--color-success-text': '#15803d',

    // Warning
    '--color-warning': '#d97706',
    '--color-warning-hover': '#b45309',
    '--color-warning-soft': '#fffbeb',
    '--color-warning-text': '#b45309',

    // Danger
    '--color-danger': '#dc2626',
    '--color-danger-hover': '#b91c1c',
    '--color-danger-soft': '#fef2f2',
    '--color-danger-text': '#b91c1c',

    // Info
    '--color-info': '#0284c7',
    '--color-info-hover': '#0369a1',
    '--color-info-soft': '#f0f9ff',
    '--color-info-text': '#0369a1',

    // Focus
    '--color-focus': '#2563eb',
    '--color-focus-ring': '#bfdbfe',

    // Overlay
    '--color-overlay': '#111827',
    '--color-overlay-opacity': '0.5',

    // Shadows
    '--shadow-xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '--shadow-sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '--shadow-focus': '0 0 0 3px rgb(59 130 246 / 0.4)',
  },

  dark: {
    // Backgrounds - carefully tuned
    '--color-bg-primary': '#030712',
    '--color-bg-secondary': '#111827',
    '--color-bg-tertiary': '#1f2937',

    // Surfaces
    '--color-surface': '#111827',
    '--color-surface-secondary': '#1f2937',
    '--color-surface-elevated': '#1f2937',

    // Text
    '--color-text-primary': '#f9fafb',
    '--color-text-secondary': '#d1d5db',
    '--color-text-muted': '#6b7280',
    '--color-text-inverse': '#030712',
    '--color-text-link': '#60a5fa',

    // Borders
    '--color-border': '#374151',
    '--color-border-strong': '#4b5563',
    '--color-divider': '#374151',

    // Primary
    '--color-primary': '#3b82f6',
    '--color-primary-hover': '#60a5fa',
    '--color-primary-soft': '#1e3a8a',
    '--color-primary-soft-hover': '#1e40af',
    '--color-primary-text': '#ffffff',

    // Success
    '--color-success': '#22c55e',
    '--color-success-hover': '#4ade80',
    '--color-success-soft': '#052e16',
    '--color-success-text': '#4ade80',

    // Warning
    '--color-warning': '#f59e0b',
    '--color-warning-hover': '#fbbf24',
    '--color-warning-soft': '#451a03',
    '--color-warning-text': '#fbbf24',

    // Danger
    '--color-danger': '#ef4444',
    '--color-danger-hover': '#f87171',
    '--color-danger-soft': '#450a0a',
    '--color-danger-text': '#f87171',

    // Info
    '--color-info': '#38bdf8',
    '--color-info-hover': '#7dd3fc',
    '--color-info-soft': '#082f49',
    '--color-info-text': '#7dd3fc',

    // Focus
    '--color-focus': '#3b82f6',
    '--color-focus-ring': '#1e3a8a',

    // Overlay
    '--color-overlay': '#030712',
    '--color-overlay-opacity': '0.7',

    // Shadows - more visible on dark
    '--shadow-xs': '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    '--shadow-sm': '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
    '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    '--shadow-focus': '0 0 0 3px rgb(59 130 246 / 0.3)',
  },
} as const;

// Helper to get all CSS variables as a flat object
export function getThemeVariables(theme: 'light' | 'dark') {
  return cssVariables[theme];
}