/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 — scan all JS/TS/TSX files for class names
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Must match lib/theme.ts ACCENT
        accent: '#00d4ff',
      },
    },
  },
  plugins: [],
}
