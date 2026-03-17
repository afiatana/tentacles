/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        void: '#030712',
        glass: {
          DEFAULT: 'rgba(15,17,26,0.85)',
          raised: 'rgba(22,25,38,0.90)',
        },
        indigo: {
          950: '#0f0e2a',
        },
        brand: {
          indigo: '#6366f1',
          teal: '#14b8a6',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 30px rgba(99,102,241,0.35)',
        'glow-teal':   '0 0 30px rgba(20,184,166,0.35)',
        'glow-red':    '0 0 30px rgba(239,68,68,0.40)',
        'glow-amber':  '0 0 30px rgba(245,158,11,0.35)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'float':       '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        'pulse-subtle': 'pulse 3s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
      },
      keyframes: {
        gradientX: {
          '0%,100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      backgroundSize: {
        '200': '200% 200%',
      },
    },
  },
  plugins: [],
};
