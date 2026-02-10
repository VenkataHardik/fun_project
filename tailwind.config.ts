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
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      colors: {
        ice: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
        },
        mint: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
        },
        blush: {
          100: "#ffe4e6",
          200: "#fecdd3",
        },
      },
      boxShadow: {
        cute: "0 4px 20px -2px rgba(14, 165, 233, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)",
        "cute-lg": "0 10px 40px -4px rgba(14, 165, 233, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
