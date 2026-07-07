import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        brand: {
          yellow: "#FFD93D",
          coral:  "#FF6B6B",
          purple: "#A855F7",
          mint:   "#4ADE80",
          blue:   "#38BDF8",
        },
        dark: {
          bg:      "#0D0D0D",
          surface: "#161616",
          card:    "#1E1E1E",
          border:  "#2A2A2A",
        },
      },
    },
  },
  plugins: [],
};

export default config;