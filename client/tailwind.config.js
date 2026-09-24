/** @type {import('tailwindcss').Config} */
import { tokens } from './src/design-system/tokens';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Colors - map semantic CSS variables to Tailwind utilities
      colors: {
        // Neutral
        neutral: {
          50: tokens.colors.neutral[50],
          100: tokens.colors.neutral[100],
          200: tokens.colors.neutral[200],
          300: tokens.colors.neutral[300],
          400: tokens.colors.neutral[400],
          500: tokens.colors.neutral[500],
          600: tokens.colors.neutral[600],
          700: tokens.colors.neutral[700],
          800: tokens.colors.neutral[800],
          900: tokens.colors.neutral[900],
          950: tokens.colors.neutral[950],
        },
        // Primary
        primary: {
          50: tokens.colors.primary[50],
          100: tokens.colors.primary[100],
          200: tokens.colors.primary[200],
          300: tokens.colors.primary[300],
          400: tokens.colors.primary[400],
          500: tokens.colors.primary[500],
          600: tokens.colors.primary[600],
          700: tokens.colors.primary[700],
          800: tokens.colors.primary[800],
          900: tokens.colors.primary[900],
          950: tokens.colors.primary[950],
        },
        // Success
        success: {
          50: tokens.colors.success[50],
          100: tokens.colors.success[100],
          200: tokens.colors.success[200],
          300: tokens.colors.success[300],
          400: tokens.colors.success[400],
          500: tokens.colors.success[500],
          600: tokens.colors.success[600],
          700: tokens.colors.success[700],
          800: tokens.colors.success[800],
          900: tokens.colors.success[900],
          950: tokens.colors.success[950],
        },
        // Warning
        warning: {
          50: tokens.colors.warning[50],
          100: tokens.colors.warning[100],
          200: tokens.colors.warning[200],
          300: tokens.colors.warning[300],
          400: tokens.colors.warning[400],
          500: tokens.colors.warning[500],
          600: tokens.colors.warning[600],
          700: tokens.colors.warning[700],
          800: tokens.colors.warning[800],
          900: tokens.colors.warning[900],
          950: tokens.colors.warning[950],
        },
        // Danger
        danger: {
          50: tokens.colors.danger[50],
          100: tokens.colors.danger[100],
          200: tokens.colors.danger[200],
          300: tokens.colors.danger[300],
          400: tokens.colors.danger[400],
          500: tokens.colors.danger[500],
          600: tokens.colors.danger[600],
          700: tokens.colors.danger[700],
          800: tokens.colors.danger[800],
          900: tokens.colors.danger[900],
          950: tokens.colors.danger[950],
        },
        // Info
        info: {
          50: tokens.colors.info[50],
          100: tokens.colors.info[100],
          200: tokens.colors.info[200],
          300: tokens.colors.info[300],
          400: tokens.colors.info[400],
          500: tokens.colors.info[500],
          600: tokens.colors.info[600],
          700: tokens.colors.info[700],
          800: tokens.colors.info[800],
          900: tokens.colors.info[900],
          950: tokens.colors.info[950],
        },
      },

      // Font families
      fontFamily: {
        sans: [tokens.fontFamilies.sans],
        mono: [tokens.fontFamilies.mono],
      },

      // Font sizes with line heights
      fontSize: {
        'display-xl': [tokens.fontSizes['display-xl'].size, { lineHeight: tokens.fontSizes['display-xl'].lineHeight, letterSpacing: tokens.fontSizes['display-xl'].letterSpacing, fontWeight: tokens.fontSizes['display-xl'].weight }],
        'display-lg': [tokens.fontSizes['display-lg'].size, { lineHeight: tokens.fontSizes['display-lg'].lineHeight, letterSpacing: tokens.fontSizes['display-lg'].letterSpacing, fontWeight: tokens.fontSizes['display-lg'].weight }],
        'display-md': [tokens.fontSizes['display-md'].size, { lineHeight: tokens.fontSizes['display-md'].lineHeight, letterSpacing: tokens.fontSizes['display-md'].letterSpacing, fontWeight: tokens.fontSizes['display-md'].weight }],
        'display-sm': [tokens.fontSizes['display-sm'].size, { lineHeight: tokens.fontSizes['display-sm'].lineHeight, letterSpacing: tokens.fontSizes['display-sm'].letterSpacing, fontWeight: tokens.fontSizes['display-sm'].weight }],
        h1: [tokens.fontSizes.h1.size, { lineHeight: tokens.fontSizes.h1.lineHeight, letterSpacing: tokens.fontSizes.h1.letterSpacing, fontWeight: tokens.fontSizes.h1.weight }],
        h2: [tokens.fontSizes.h2.size, { lineHeight: tokens.fontSizes.h2.lineHeight, letterSpacing: tokens.fontSizes.h2.letterSpacing, fontWeight: tokens.fontSizes.h2.weight }],
        h3: [tokens.fontSizes.h3.size, { lineHeight: tokens.fontSizes.h3.lineHeight, letterSpacing: tokens.fontSizes.h3.letterSpacing, fontWeight: tokens.fontSizes.h3.weight }],
        h4: [tokens.fontSizes.h4.size, { lineHeight: tokens.fontSizes.h4.lineHeight, letterSpacing: tokens.fontSizes.h4.letterSpacing, fontWeight: tokens.fontSizes.h4.weight }],
        h5: [tokens.fontSizes.h5.size, { lineHeight: tokens.fontSizes.h5.lineHeight, letterSpacing: tokens.fontSizes.h5.letterSpacing, fontWeight: tokens.fontSizes.h5.weight }],
        h6: [tokens.fontSizes.h6.size, { lineHeight: tokens.fontSizes.h6.lineHeight, letterSpacing: tokens.fontSizes.h6.letterSpacing, fontWeight: tokens.fontSizes.h6.weight }],
        'body-lg': [tokens.fontSizes['body-lg'].size, { lineHeight: tokens.fontSizes['body-lg'].lineHeight, letterSpacing: tokens.fontSizes['body-lg'].letterSpacing, fontWeight: tokens.fontSizes['body-lg'].weight }],
        'body-md': [tokens.fontSizes['body-md'].size, { lineHeight: tokens.fontSizes['body-md'].lineHeight, letterSpacing: tokens.fontSizes['body-md'].letterSpacing, fontWeight: tokens.fontSizes['body-md'].weight }],
        'body-sm': [tokens.fontSizes['body-sm'].size, { lineHeight: tokens.fontSizes['body-sm'].lineHeight, letterSpacing: tokens.fontSizes['body-sm'].letterSpacing, fontWeight: tokens.fontSizes['body-sm'].weight }],
        'body-xs': [tokens.fontSizes['body-xs'].size, { lineHeight: tokens.fontSizes['body-xs'].lineHeight, letterSpacing: tokens.fontSizes['body-xs'].letterSpacing, fontWeight: tokens.fontSizes['body-xs'].weight }],
        'label-lg': [tokens.fontSizes['label-lg'].size, { lineHeight: tokens.fontSizes['label-lg'].lineHeight, letterSpacing: tokens.fontSizes['label-lg'].letterSpacing, fontWeight: tokens.fontSizes['label-lg'].weight }],
        'label-md': [tokens.fontSizes['label-md'].size, { lineHeight: tokens.fontSizes['label-md'].lineHeight, letterSpacing: tokens.fontSizes['label-md'].letterSpacing, fontWeight: tokens.fontSizes['label-md'].weight }],
        'label-sm': [tokens.fontSizes['label-sm'].size, { lineHeight: tokens.fontSizes['label-sm'].lineHeight, letterSpacing: tokens.fontSizes['label-sm'].letterSpacing, fontWeight: tokens.fontSizes['label-sm'].weight }],
        caption: [tokens.fontSizes.caption.size, { lineHeight: tokens.fontSizes.caption.lineHeight, letterSpacing: tokens.fontSizes.caption.letterSpacing, fontWeight: tokens.fontSizes.caption.weight }],
        overline: [tokens.fontSizes.overline.size, { lineHeight: tokens.fontSizes.overline.lineHeight, letterSpacing: tokens.fontSizes.overline.letterSpacing, fontWeight: tokens.fontSizes.overline.weight, textTransform: tokens.fontSizes.overline.textTransform }],
        'table-header': [tokens.fontSizes['table-header'].size, { lineHeight: tokens.fontSizes['table-header'].lineHeight, letterSpacing: tokens.fontSizes['table-header'].letterSpacing, fontWeight: tokens.fontSizes['table-header'].weight, textTransform: tokens.fontSizes['table-header'].textTransform }],
        'table-cell': [tokens.fontSizes['table-cell'].size, { lineHeight: tokens.fontSizes['table-cell'].lineHeight, letterSpacing: tokens.fontSizes['table-cell'].letterSpacing, fontWeight: tokens.fontSizes['table-cell'].weight }],
        'table-cell-sm': [tokens.fontSizes['table-cell-sm'].size, { lineHeight: tokens.fontSizes['table-cell-sm'].lineHeight, letterSpacing: tokens.fontSizes['table-cell-sm'].letterSpacing, fontWeight: tokens.fontSizes['table-cell-sm'].weight }],
        'button-sm': [tokens.fontSizes['button-sm'].size, { lineHeight: tokens.fontSizes['button-sm'].lineHeight, letterSpacing: tokens.fontSizes['button-sm'].letterSpacing, fontWeight: tokens.fontSizes['button-sm'].weight }],
        'button-md': [tokens.fontSizes['button-md'].size, { lineHeight: tokens.fontSizes['button-md'].lineHeight, letterSpacing: tokens.fontSizes['button-md'].letterSpacing, fontWeight: tokens.fontSizes['button-md'].weight }],
        'button-lg': [tokens.fontSizes['button-lg'].size, { lineHeight: tokens.fontSizes['button-lg'].lineHeight, letterSpacing: tokens.fontSizes['button-lg'].letterSpacing, fontWeight: tokens.fontSizes['button-lg'].weight }],
        'nav-item': [tokens.fontSizes['nav-item'].size, { lineHeight: tokens.fontSizes['nav-item'].lineHeight, letterSpacing: tokens.fontSizes['nav-item'].letterSpacing, fontWeight: tokens.fontSizes['nav-item'].weight }],
      },

      // Spacing
      spacing: tokens.spacing,

      // Border radius
      borderRadius: tokens.borderRadius,

      // Box shadows
      boxShadow: {
        ...tokens.shadows.light,
        // Dark mode shadows will be applied via dark: prefix
      },

      // Transition durations
      transitionDuration: {
        instant: tokens.motion.duration.instant,
        fast: tokens.motion.duration.fast,
        normal: tokens.motion.duration.normal,
        slow: tokens.motion.duration.slow,
        slower: tokens.motion.duration.slower,
      },

      // Transition timing functions
      transitionTimingFunction: {
        linear: tokens.motion.easing.linear,
        'ease-in': tokens.motion.easing.easeIn,
        'ease-out': tokens.motion.easing.easeOut,
        'ease-in-out': tokens.motion.easing.easeInOut,
        spring: tokens.motion.easing.spring,
      },

      // Z-index
      zIndex: tokens.zIndex,

      // Breakpoints
      screens: {
        sm: tokens.breakpoints.sm,
        md: tokens.breakpoints.md,
        lg: tokens.breakpoints.lg,
        xl: tokens.breakpoints.xl,
        '2xl': tokens.breakpoints['2xl'],
      },

      // Animation
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 200ms ease-in',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'slide-left': 'slideLeft 200ms ease-out',
        'slide-right': 'slideRight 200ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
        'scale-out': 'scaleOut 150ms ease-in',
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },

      // Container
      container: {
        center: true,
        padding: {
          DEFAULT: tokens.semanticSpacing['page-padding-md'],
          sm: tokens.semanticSpacing['page-padding-md'],
          lg: tokens.semanticSpacing['page-padding-lg'],
          xl: tokens.semanticSpacing['page-padding-lg'],
          '2xl': tokens.semanticSpacing['page-padding-lg'],
        },
        screens: {
          sm: tokens.semanticSpacing['container-sm'],
          md: tokens.semanticSpacing['container-md'],
          lg: tokens.semanticSpacing['container-lg'],
          xl: tokens.semanticSpacing['container-xl'],
          '2xl': tokens.semanticSpacing['container-2xl'],
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};