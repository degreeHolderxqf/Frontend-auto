import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        foreground: "#f8fafc",
        card: "#111827",
        "card-hover": "#172234",
        border: "#1f293d",
        primary: {
          DEFAULT: "#0284c7",
          hover: "#0369a1",
          light: "#38bdf8",
        },
        accent: {
          DEFAULT: "#10b981",
          hover: "#059669",
        },
        muted: "#64748b",
        "muted-dark": "#94a3b8",
      },
    },
  },
  plugins: [],
};
export default config;
