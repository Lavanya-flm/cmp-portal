/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ─── CMP Portal brand colors ───────────────────────────────────────
      colors: {
        brand: {
          bg:        '#FFF9F1',   // page background
          surface:   '#FFFFFF',   // card / panel surface
          primary:   '#F59E0B',   // amber-500
          hover:     '#D97706',   // amber-600
          accent:    '#FDBA74',   // amber-300
          text:      '#111827',   // gray-900
          muted:     '#6B7280',   // gray-500
          border:    '#E5E7EB',   // gray-200
          success:   '#22C55E',   // green-500
          danger:    '#EF4444',   // red-500
        },
      },

      // ─── Poppins as the primary font ──────────────────────────────────
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // ─── Toast slide-in animation ─────────────────────────────────────
      keyframes: {
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      animation: {
        'in': 'slide-in-from-bottom 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
