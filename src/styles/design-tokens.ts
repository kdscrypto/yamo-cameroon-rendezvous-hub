// Design Tokens System for Yamo Platform - Original Style Restored
// This centralizes all design decisions and ensures consistency

export const designTokens = {
  // Color System with semantic naming - Original brown/gold theme
  colors: {
    // Primary Brand Colors - Original gold/yellow palette
    primary: {
      50: '255 250 205',   // Very light gold
      100: '255 248 220',  // Light gold
      200: '255 235 205',  // Lighter gold
      300: '255 215 0',    // Main gold (brand primary)
      400: '255 215 0',    // Main gold
      500: '218 165 32',   // Medium gold
      600: '184 134 11',   // Dark gold
      700: '161 120 10',   // Darker gold
      800: '133 99 8',     // Very dark gold
      900: '113 84 7',     // Darkest gold
    },
    
    // Neutral Colors - Original brown theme
    neutral: {
      0: '255 255 255',    // Pure white
      50: '250 245 235',   // Off white with brown tint
      100: '245 235 215',  // Very light brown
      200: '229 219 199',  // Light brown
      300: '212 192 162',  // Medium light brown
      400: '163 143 113',  // Medium brown
      500: '115 95 75',    // Medium brown
      600: '82 72 52',     // Dark brown
      700: '64 54 34',     // Darker brown
      800: '50 35 18',     // Very dark brown
      850: '40 28 16',     // Card background
      900: '32 20 8',      // Dark background
      950: '24 15 6',      // Darkest background
    },
    
    // Semantic Colors
    semantic: {
      success: '34 197 94',     // Green
      warning: '251 191 36',    // Yellow
      error: '239 68 68',       // Red
      info: '59 130 246',       // Blue
    },
    
    // Surface Colors - Original brown theme
    surface: {
      background: '32 20 8',
      card: '40 28 16',
      elevated: '50 35 18',
      overlay: '0 0 0',
    },
    
    // Border Colors
    border: {
      default: '80 60 30',
      light: '100 80 50',
      focus: '255 215 0',
    }
  },
  
  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    }
  },
  
  // Spacing System (8px base)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  // Shadows - Updated for original theme
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    luxury: '0 12px 48px 0 rgb(255 215 0 / 0.15)',
    glow: '0 0 20px rgb(255 215 0 / 0.3)',
  },
  
  // Animation Durations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easing: {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  },
  
  // Breakpoints
  screens: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
} as const;

// Type definitions for design tokens
export type ColorToken = keyof typeof designTokens.colors;
export type SpacingToken = keyof typeof designTokens.spacing;
export type TypographyToken = keyof typeof designTokens.typography.fontSize;

// Utility functions for accessing tokens
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = designTokens.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) break;
  }
  
  return value;
};

export const getSpacing = (key: SpacingToken) => designTokens.spacing[key];
export const getFontSize = (key: TypographyToken) => designTokens.typography.fontSize[key];
