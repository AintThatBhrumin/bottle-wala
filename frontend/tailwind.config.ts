import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#F8FAFC",
        ocean: "#1E3A8A",
        accent: "#06B6D4",
        foam: "#E0F7FF",
        ember: "#0EA5E9",
        ivory: "#fffdf8",
        graphite: "#1e293b",
        brass: "#38BDF8"
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        serif: ["Satoshi", "var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 45px rgba(15, 23, 42, 0.08)",
        luxe: "0 28px 80px rgba(30, 58, 138, 0.16)"
      },
      backgroundImage: {
        "hero-wave":
          "radial-gradient(circle at top left, rgba(30,58,138,0.22), transparent 38%), radial-gradient(circle at 85% 10%, rgba(6,182,212,0.18), transparent 24%), linear-gradient(180deg, rgba(248,250,252,1), rgba(238,245,252,1))",
        "luxe-panel":
          "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(241,247,252,0.88)), radial-gradient(circle at top right, rgba(6,182,212,0.18), transparent 26%)",
        "brand-mesh":
          "radial-gradient(circle at 12% 14%, rgba(30,58,138,0.18), transparent 24%), radial-gradient(circle at 86% 20%, rgba(6,182,212,0.2), transparent 20%), radial-gradient(circle at 50% 100%, rgba(15,23,42,0.08), transparent 28%), linear-gradient(180deg, rgba(248,250,252,1), rgba(238,245,252,1))",
        "brand-gradient": "linear-gradient(135deg, #1E3A8A 0%, #06B6D4 100%)"
      }
    }
  },
  plugins: []
};

export default config;
