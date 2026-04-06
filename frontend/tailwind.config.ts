import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#07111d',
        panel: '#0d1b2a',
        panelSoft: '#122536',
        line: '#1b3347',
        accent: '#0fe0b4',
        accentSoft: '#093f3a',
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
        text: '#e6f1ff',
        muted: '#8aa3ba',
      },
      boxShadow: {
        panel: '0 20px 60px rgba(0, 0, 0, 0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        glow: 'radial-gradient(circle at top, rgba(15,224,180,0.14), transparent 40%)',
      },
    },
  },
  plugins: [],
};

export default config;
