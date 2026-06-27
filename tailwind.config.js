/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          bg: '#151616', // backdrop da aplicação (fora do canvas)
          panel: '#2D2D2D', // chrome: barras laterais, topo e dock (tom Lightroom)
          elevated: '#3A3A3A', // superfícies elevadas sobre o chrome (menus, diálogos)
          border: '#464646',
          'border-active': '#F5F5F5',
          text: '#F2F2F2',
          muted: '#A0A0A0',
          disabled: '#777777',
          canvas: '#151616', // área ao redor do canvas, dentro do editor
          white: '#FFFFFF',
          hover: '#424242',
          selection: '#4F4F4F'
        }
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'SF Pro Display', 'Geist', 'system-ui', 'sans-serif']
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }]
      },
      boxShadow: {
        bubble: '0 8px 30px rgba(0,0,0,0.6)',
        panel: '0 2px 16px rgba(0,0,0,0.5)'
      }
    }
  },
  plugins: []
}
