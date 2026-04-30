import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111513",
        evergreen: "#17382f",
        ivory: "#f7f2e8",
        line: "#ded8cd",
        gold: "#b0884f"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(17, 21, 19, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;