
import type { Config } from "tailwindcss";
import { designTokens } from "./src/styles/design-tokens";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: designTokens.spacing[4],
				sm: designTokens.spacing[6],
				lg: designTokens.spacing[8],
			},
			screens: designTokens.screens,
		},
		
		screens: designTokens.screens,
		
		extend: {
			colors: {
				// CSS variable based colors for dynamic theming
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					50: `hsl(${designTokens.colors.primary[50]})`,
					100: `hsl(${designTokens.colors.primary[100]})`,
					200: `hsl(${designTokens.colors.primary[200]})`,
					300: `hsl(${designTokens.colors.primary[300]})`,
					400: `hsl(${designTokens.colors.primary[400]})`,
					500: `hsl(${designTokens.colors.primary[500]})`,
					600: `hsl(${designTokens.colors.primary[600]})`,
					700: `hsl(${designTokens.colors.primary[700]})`,
					800: `hsl(${designTokens.colors.primary[800]})`,
					900: `hsl(${designTokens.colors.primary[900]})`,
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				
				// Semantic colors using design tokens
				success: `hsl(${designTokens.colors.semantic.success})`,
				warning: `hsl(${designTokens.colors.semantic.warning})`,
				error: `hsl(${designTokens.colors.semantic.error})`,
				info: `hsl(${designTokens.colors.semantic.info})`,
				
				// Neutral scale
				neutral: {
					0: `hsl(${designTokens.colors.neutral[0]})`,
					50: `hsl(${designTokens.colors.neutral[50]})`,
					100: `hsl(${designTokens.colors.neutral[100]})`,
					200: `hsl(${designTokens.colors.neutral[200]})`,
					300: `hsl(${designTokens.colors.neutral[300]})`,
					400: `hsl(${designTokens.colors.neutral[400]})`,
					500: `hsl(${designTokens.colors.neutral[500]})`,
					600: `hsl(${designTokens.colors.neutral[600]})`,
					700: `hsl(${designTokens.colors.neutral[700]})`,
					800: `hsl(${designTokens.colors.neutral[800]})`,
					850: `hsl(${designTokens.colors.neutral[850]})`,
					900: `hsl(${designTokens.colors.neutral[900]})`,
					950: `hsl(${designTokens.colors.neutral[950]})`,
				},
				
				// Legacy orange colors (for backwards compatibility)
				orange: {
					DEFAULT: `hsl(${designTokens.colors.primary[400]})`,
					light: `hsl(${designTokens.colors.primary[300]})`,
					dark: `hsl(${designTokens.colors.primary[600]})`,
				},
			},
			
			borderRadius: designTokens.borderRadius,
			
			fontFamily: designTokens.typography.fontFamily,
			
			fontSize: designTokens.typography.fontSize,
			
			fontWeight: designTokens.typography.fontWeight,
			
			spacing: {
				...designTokens.spacing,
				'18': '4.5rem',
				'88': '22rem',
			},
			
			backdropBlur: {
				xs: '2px',
			},
			
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-down': {
					from: { opacity: '0', transform: 'translateY(-20px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-left': {
					from: { opacity: '0', transform: 'translateX(20px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'slide-right': {
					from: { opacity: '0', transform: 'translateX(-20px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'modern-shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-2px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgb(255 144 0 / 0.1)' },
					'50%': { boxShadow: '0 0 30px rgb(255 144 0 / 0.3)' }
				}
			},
			
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-down': 'slide-down 0.4s ease-out',
				'slide-left': 'slide-left 0.4s ease-out',
				'slide-right': 'slide-right 0.4s ease-out',
				'modern-shimmer': 'modern-shimmer 2s ease-in-out infinite',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite'
			},
			
			boxShadow: {
				...designTokens.boxShadow,
				'soft': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
				'medium': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
				'strong': '0 8px 32px 0 rgb(0 0 0 / 0.16)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
