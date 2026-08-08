import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#132321",
        mint: "#dff5e6",
        forest: "#185c48",
        lime: "#d5ef5b",
        paper: "#f8f7f1",
      },
      boxShadow: {
        soft: "0 16px 45px rgba(22, 72, 58, 0.10)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
