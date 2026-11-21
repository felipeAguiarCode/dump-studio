/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          bg: 'rgb(var(--noir-bg-rgb) / <alpha-value>)',
          panel: 'rgb(var(--noir-panel-rgb) / <alpha-value>)',
          elevated: 'rgb(var(--noir-elevated-rgb) / <alpha-value>)',
          border: 'rgb(var(--noir-border-rgb) / <alpha-value>)',
          'border-active': 'rgb(var(--noir-border-active-rgb) / <alpha-value>)',
          text: 'rgb(var(--noir-text-rgb) / <alpha-value>)',
          muted: 'rgb(var(--noir-muted-rgb) / <alpha-value>)',
          disabled: 'rgb(var(--noir-disabled-rgb) / <alpha-value>)',
          canvas: 'rgb(var(--noir-canvas-rgb) / <alpha-value>)',
          white: '#FFFFFF',
          hover: 'rgb(var(--noir-hover-rgb) / <alpha-value>)',
          selection: 'rgb(var(--noir-selection-rgb) / <alpha-value>)',
          danger: 'rgb(var(--noir-danger-rgb) / <alpha-value>)'
        },
        brand: {
          accent: 'rgb(var(--brand-accent-rgb) / <alpha-value>)',
          soft: 'rgb(var(--brand-soft-rgb) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'SF Pro Display', 'Geist', 'system-ui', 'sans-serif']
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }]
      },
      boxShadow: {
        bubble: 'var(--shadow-bubble)',
        panel: 'var(--shadow-panel)',
        dock: 'var(--shadow-dock)'
      }
    }
  },
  plugins: []
}
