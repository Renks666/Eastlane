import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-track": {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(-50%, 0, 0)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-track": "marquee-track 30s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
      },
      fontFamily: {
        price: ["var(--font-source-sans-3)", "sans-serif"],
      },
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
