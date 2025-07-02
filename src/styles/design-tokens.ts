
// Design Tokens System for Yamo Platform
// This centralizes all design decisions and ensures consistency

export const designTokens = {
  // Color System with semantic naming
  colors: {
    // Primary Brand Colors
    primary: {
      50: '255 248 235',   // Very light orange
      100: '255 237 213',  // Light orange
      200: '255 214 165',  // Lighter orange
      300: '255 179 102',  // Light-medium orange
      400: '255 144 0',    // Main orange (brand primary)
      500: '230 130 0',    // Medium orange
      600: '204 115 0',    // Dark orange
      700: '179 101 0',    // Darker orange
      800: '153 86 0',     // Very dark orange
      900: '128 72 0',     // Darkest orange
    },
    
    // Neutral Colors (Dark Theme Base)
    neutral: {
      0: '255 255 255',    // Pure white
      50: '250 250 250',   // Off white
      100: '245 245 245',  // Very light gray
      200: '229 229 229',  // Light gray
      300: '212 212 212',  // Medium light gray
      400: '163 163 163',  // Medium gray
      500: '115 115 115',  // Medium gray
      600: '82 82 82',     // Dark gray
      700: '64 64 64',     // Darker gray
      800: '38 38 38',     // Very dark gray
      850: '32 32 32',     // Card background
      900: '25 25 25',     // Dark background
      950: '15 15 15',     // Darkest background
    },
    
    // Semantic Colors
    semantic: {
      success: '34 197 94',     // Green
      warning: '251 191 36',    // Yellow
      error: '239 68 68',       // Red
      info: '59 130 246',       // Blue
    },
    
    // Surface Colors
    surface: {
      background: '15 15 15',
      card: '25 25 25',
      elevated: '32 32 32',
      overlay: '0 0 0',
    },
    
    // Border Colors
    border: {
      default: '45 45 45',
      light: '64 64 64',
      focus: '255 144 0',
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
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    luxury: '0 12px 48px 0 rgb(255 144 0 / 0.15)',
    glow: '0 0 20px rgb(255 144 0 / 0.3)',
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
