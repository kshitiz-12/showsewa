/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#ef4444', // match existing red tone
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        }
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.06)',
        elevated: '0 16px 40px rgba(0,0,0,0.10)'
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem'
      },
      backdropBlur: {
        xs: '2px'
      },
      keyframes: {
        'soft-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'soft-zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'soft-fade-up': 'soft-fade-up 400ms ease-out both',
        'soft-zoom-in': 'soft-zoom-in 300ms ease-out both'
      }
    },
  },
  plugins: [],
}

