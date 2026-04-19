import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        foreground: "rgba(255, 255, 255, 0.9)",
        gold: "#C9A84C",
        rose: "#D4A5A5",
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "serif"],
        playfair: ["var(--font-playfair)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 50%, 100% 50%, 50% 0%" },
          "50%": { backgroundPosition: "100% 50%, 0% 50%, 50% 100%" },
          "100%": { backgroundPosition: "0% 50%, 100% 50%, 50% 0%" },
        },
        bokeh: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1) translate(0, 0)" },
          "33%": { opacity: "0.6", transform: "scale(1.2) translate(10px, -10px)" },
          "66%": { opacity: "0.4", transform: "scale(0.9) translate(-10px, 10px)" },
        },
      },
      animation: {
        shimmer: "shimmer 15s ease-in-out infinite",
        bokeh: "bokeh 20s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
