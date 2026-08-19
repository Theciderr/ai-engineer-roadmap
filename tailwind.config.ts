import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hull: '#0F1620',      // deep navy-charcoal background
        panel: '#161F2C',     // slightly lighter panel background
        rail: '#1E2A3A',      // rail / divider background
        amber: {
          DEFAULT: '#FFB454', // phosphor amber - primary signal
          dim: '#8A6430',
        },
        cyan: {
          DEFAULT: '#4FD1C5', // secondary data signal
          dim: '#2A6E68',
        },
        coral: '#FF6B6B',      // alerts / overdue
        slate: {
          DEFAULT: '#B8C4D9',  // body text
          dim: '#6B7A8F',      // muted text
          bright: '#E7ECF5',   // headings
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        panel: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
