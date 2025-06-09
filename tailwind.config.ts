import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Eco Green Theme
        primary: {
          50: '#f0fdf4',   // Lightest green
          100: '#dcfce7',  // Very light green
          200: '#bbf7d0',  // Light green
          300: '#86efac',  // Medium light green
          400: '#4ade80',  // Medium green
          500: '#22c55e',  // Main green
          600: '#16a34a',  // Dark green
          700: '#15803d',  // Darker green
          800: '#166534',  // Very dark green
          900: '#14532d',  // Darkest green
        },
        secondary: {
          50: '#fefce8',   // Cream
          100: '#fef9c3',  // Light cream
          200: '#fef08a',  // Yellowish
          300: '#fde047',  // Light yellow
          400: '#facc15',  // Yellow
          500: '#eab308',  // Amber
          600: '#ca8a04',  // Dark amber
          700: '#a16207',  // Darker amber
          800: '#854d0e',  // Very dark amber
          900: '#713f12',  // Darkest amber
        },
        accent: {
          forest: '#2d5016',    // Deep forest green
          sage: '#87a96b',      // Sage green  
          moss: '#606c38',      // Moss green
          earth: '#8b5a3c',     // Earth brown
          cream: '#fefcf8',     // Paper cream
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'eco': '0 4px 6px -1px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)',
        'eco-lg': '0 10px 15px -3px rgba(34, 197, 94, 0.1), 0 4px 6px -2px rgba(34, 197, 94, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
    screens: {
      'xs': '375px',   // Small phones
      'sm': '640px',   // Large phones
      'md': '768px',   // Tablets
      'lg': '1024px',  // Small laptops
      'xl': '1280px',  // Large laptops
      '2xl': '1536px', // Desktops
    },
  },
  plugins: [],
}

export default config 