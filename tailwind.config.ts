import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2B2330",
        mist: "#FFF7FA",
        line: "#F0D9E3",
        pine: "#E85D8E",
        "pine-dark": "#C94775",
        amber: "#E6A23C",
        rose: "#D94F70",
        blush: "#FCE7F0",
      },
      boxShadow: {
        soft: "0 12px 28px rgba(102, 45, 69, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;