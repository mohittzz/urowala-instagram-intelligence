import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        urowala: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc0fb",
          400: "#369ef7",
          500: "#0b80ea",
          600: "#0263c7",
          700: "#024ea1",
          800: "#064384",
          900: "#0b396e",
          950: "#072449",
        },
        navy: {
          800: "#0d1b2a",
          900: "#0a1422",
          950: "#050b14",
        },
        clinical: {
          teal: "#0d9488",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          slate: "#334155",
          border: "#e2e8f0",
          card: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
