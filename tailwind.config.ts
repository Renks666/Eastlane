import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0E2A21",
          dark: "#070C0A",
          forest: "#16382D",
          gold: {
            300: "#E0C88F",
            400: "#D4B674",
            500: "#C6A15B",
            600: "#A88243",
            700: "#8A6931",
          },
          text: "#E7DCC6",
          muted: "#8FA79A",
        },
      },
    },
  },
}

export default config

// Usage examples:
// background: bg-brand-bg, bg-brand-dark, bg-brand-forest
// text: text-brand-text, text-brand-muted, text-brand-gold-500
// button:
//   primary -> bg-brand-gold-500 text-brand-dark hover:bg-brand-gold-400
//   secondary -> border border-brand-gold-600 text-brand-text hover:bg-brand-forest
