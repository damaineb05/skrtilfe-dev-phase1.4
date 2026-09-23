/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:       ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        harvest:    ['Harvest', 'sans-serif'],
        harvestital:['HarvestItal', 'sans-serif'],
        mono:       ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'xs':  ['12px', { lineHeight: '1.5' }],
        'sm':  ['13.5px', { lineHeight: '1.55' }],
        'base':['15px',  { lineHeight: '1.65' }],
        'lg':  ['17px',  { lineHeight: '1.55' }],
        'xl':  ['20px',  { lineHeight: '1.4'  }],
        '2xl': ['24px',  { lineHeight: '1.3'  }],
        '3xl': ['30px',  { lineHeight: '1.2'  }],
        '4xl': ['36px',  { lineHeight: '1.1'  }],
        '5xl': ['48px',  { lineHeight: '1.05' }],
        '6xl': ['60px',  { lineHeight: '1.0'  }],
        '7xl': ['72px',  { lineHeight: '0.95' }],
      },
      letterSpacing: {
        tightest: '-0.05em',
        tighter:  '-0.035em',
        tight:    '-0.02em',
        normal:   '-0.01em',
        wide:     '0.05em',
        wider:    '0.1em',
        widest:   '0.2em',
        ultra:    '0.35em',
      },
      colors: {
        /* Brand palette — usable as bg-skrt-cyan, text-skrt-red, etc. */
        skrt: {
          cyan:   '#00D4FF',
          red:    '#FF3366',
          yellow: '#FFD700',
          dark:   '#0A0A0F',
        },
        /* Semantic backgrounds */
        surface: {
          0: '#070709',
          1: '#0A0A0F',
          2: '#0D0D16',
          3: '#12121E',
          4: '#181826',
        },
        /* ShadCN tokens */
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT:             'hsl(var(--sidebar-background))',
          foreground:          'hsl(var(--sidebar-foreground))',
          primary:             'hsl(var(--sidebar-primary))',
          'primary-foreground':'hsl(var(--sidebar-primary-foreground))',
          accent:              'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border:              'hsl(var(--sidebar-border))',
          ring:                'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        none:  '0',
        sm:    '6px',
        md:    '10px',
        DEFAULT:'12px',
        lg:    '16px',
        xl:    '20px',
        '2xl': '24px',
        '3xl': '32px',
        full:  '9999px',
      },
      spacing: {
        '4.5': '18px',
        '5.5': '22px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
        '22':  '88px', /* nav height */
        '88':  '352px',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '36px',
        '2xl': '48px',
      },
      boxShadow: {
        'glow-cyan':   '0 0 24px rgba(0,212,255,0.22), 0 0 60px rgba(0,212,255,0.07)',
        'glow-red':    '0 0 24px rgba(255,51,102,0.22)',
        'glow-yellow': '0 0 24px rgba(255,215,0,0.22)',
        'glass':       '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':        '0 2px 16px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 40px rgba(0,0,0,0.6)',
        'nav':         '0 1px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'accordion-down':  'accordion-down 0.22s ease-out',
        'accordion-up':    'accordion-up 0.22s ease-out',
        'fade-in':         'fadeIn 0.22s ease-out',
        'fade-in-up':      'fadeInUp 0.28s ease-out',
        'shimmer':         'shimmer 1.8s ease-in-out infinite',
        'pulse-slow':      'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':       'spin 8s linear infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out':    'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'io':     'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    // Brand colors used dynamically
    'text-skrt-cyan', 'text-skrt-red', 'text-skrt-yellow',
    'bg-skrt-cyan', 'bg-skrt-red', 'bg-skrt-yellow',
    'border-skrt-cyan', 'border-skrt-red', 'border-skrt-yellow',
    // Glow shadows
    'shadow-glow-cyan', 'shadow-glow-red', 'shadow-glow-yellow',
    // Glass
    'glass', 'glass-mid', 'glass-card', 'glass-panel',
  ],
}
