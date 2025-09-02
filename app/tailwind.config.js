
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0B1020",
          surface: "#0E1526",
          border: "rgba(148,163,184,0.12)",
          text: "#E5E7EB",
          text2: "#94A3B8",
        },
        brand: {
          cyan: "#22D3EE",
          green: "#22C55E",
          greenHover: "#16A34A",
          orange: "#F59E0B",
          popular: "#10B981",
        },
        grad: {
          start: "#4FC3F7",
          end: "#7C4DFF",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
        "hero-radial":
          "radial-gradient(600px 300px at 50% 0%, rgba(79,195,247,0.12), transparent 60%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      fontFamily: {
        inter: ["Inter", "ui-sans-serif", "system-ui"],
        urbanist: ["Urbanist", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
