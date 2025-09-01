
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adorrable brand palette
        brand: {
          primary: "#12B76A", // Adorrable green
          secondary: "#8B5CF6", // accent (violet)
          dark: "#0B1220", // deep navy
          mid: "#101827", // UI surface
          light: "#F9FAFB", // light text/surfaces
        },
        offwhite: "#F9FAFB",
        charcoal: "#111827",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
