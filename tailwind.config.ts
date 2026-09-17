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
        background: "#FFFFFF",
        foreground: "#0F172A",
        cyber: {
          violet: "#8B5CF6",
          rose: "#F43F5E",
          gold: "#F59E0B",
        },
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slight": "bounceSlight 2s ease-in-out infinite",
        "glow-rose": "glowRose 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        bounceSlight: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        glowRose: {
          "0%": { boxShadow: "0 0 5px rgba(244, 63, 94, 0.4)" },
          "100%": { boxShadow: "0 0 20px rgba(244, 63, 94, 0.8), 0 0 30px rgba(139, 92, 246, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
