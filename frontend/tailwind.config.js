/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        indigo: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-in-out",
        "slide-in":   "slideIn 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "bounce-sm":  "bounceSm 1s infinite",
      },
      keyframes: {
        fadeIn:   { "0%": { opacity: "0" },              "100%": { opacity: "1" } },
        slideIn:  { "0%": { transform: "translateX(-10px)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
        bounceSm: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
      },
      backdropBlur: { xs: "2px" },
      boxShadow: {
        glow:       "0 0 20px rgba(99,102,241,0.3)",
        "glow-sm":  "0 0 10px rgba(99,102,241,0.2)",
        card:       "0 4px 24px rgba(0,0,0,0.08)",
        "card-dark":"0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
