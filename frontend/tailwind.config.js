/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sophisticated monochromatic palette with accent
        ink: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Refined accent - deep amber/gold for luxury
        gold: {
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
        },
        // Subtle emerald for success states
        sage: {
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
        },
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Consolas',
          'monospace'
        ],
      },
      fontSize: {
        // Precise typographic scale based on golden ratio (1.618)
        'xs': ['0.694rem', { lineHeight: '1.125rem', letterSpacing: '0.02em', fontWeight: '500' }],
        'sm': ['0.833rem', { lineHeight: '1.25rem', letterSpacing: '0.01em', fontWeight: '500' }],
        'base': ['1rem', { lineHeight: '1.618rem', letterSpacing: '0', fontWeight: '400' }],
        'lg': ['1.2rem', { lineHeight: '1.944rem', letterSpacing: '-0.01em', fontWeight: '400' }],
        'xl': ['1.44rem', { lineHeight: '2.333rem', letterSpacing: '-0.015em', fontWeight: '500' }],
        '2xl': ['1.728rem', { lineHeight: '2.8rem', letterSpacing: '-0.02em', fontWeight: '600' }],
        '3xl': ['2.074rem', { lineHeight: '3.356rem', letterSpacing: '-0.025em', fontWeight: '600' }],
        '4xl': ['2.488rem', { lineHeight: '4.027rem', letterSpacing: '-0.03em', fontWeight: '700' }],
        '5xl': ['2.986rem', { lineHeight: '4.832rem', letterSpacing: '-0.035em', fontWeight: '700' }],
        '6xl': ['3.583rem', { lineHeight: '5.798rem', letterSpacing: '-0.04em', fontWeight: '800' }],
        '7xl': ['4.3rem', { lineHeight: '6.957rem', letterSpacing: '-0.045em', fontWeight: '800' }],
      },
      spacing: {
        // Modular scale based on 4px base unit
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '9': '2.25rem',     // 36px
        '10': '2.5rem',     // 40px
        '11': '2.75rem',    // 44px
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '28': '7rem',       // 112px
        '32': '8rem',       // 128px
        '36': '9rem',       // 144px
        '40': '10rem',      // 160px
        '44': '11rem',      // 176px
        '48': '12rem',      // 192px
        '52': '13rem',      // 208px
        '56': '14rem',      // 224px
        '60': '15rem',      // 240px
        '64': '16rem',      // 256px
        '72': '18rem',      // 288px
        '80': '20rem',      // 320px
        '96': '24rem',      // 384px
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',    // 4px
        'DEFAULT': '0.5rem', // 8px
        'md': '0.625rem',   // 10px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.25rem',   // 20px
        '3xl': '1.5rem',    // 24px
        '4xl': '2rem',      // 32px
        'full': '9999px',
      },
      boxShadow: {
        // Physics-based shadow system
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'md': '0 6px 12px -2px rgba(0, 0, 0, 0.10), 0 3px 6px -3px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 20px -3px rgba(0, 0, 0, 0.12), 0 4px 8px -4px rgba(0, 0, 0, 0.08)',
        'xl': '0 20px 40px -4px rgba(0, 0, 0, 0.14), 0 8px 16px -6px rgba(0, 0, 0, 0.10)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.20)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        'glow-gold': '0 0 32px -4px rgba(245, 158, 11, 0.25), 0 0 16px -4px rgba(245, 158, 11, 0.15)',
        'glow-sage': '0 0 32px -4px rgba(34, 197, 94, 0.20), 0 0 16px -4px rgba(34, 197, 94, 0.12)',
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 1px rgba(0, 0, 0, 0.02)',
        'elevation-2': '0 2px 4px 0 rgba(0, 0, 0, 0.04), 0 3px 6px 2px rgba(0, 0, 0, 0.03)',
        'elevation-3': '0 4px 8px 0 rgba(0, 0, 0, 0.06), 0 6px 12px 4px rgba(0, 0, 0, 0.04)',
        'elevation-4': '0 8px 16px 0 rgba(0, 0, 0, 0.08), 0 12px 24px 8px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(245, 158, 11, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(34, 197, 94, 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(245, 158, 11, 0.04) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
